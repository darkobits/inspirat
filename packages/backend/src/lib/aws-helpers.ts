import {Callback, Context, Handler} from 'aws-lambda';
import * as R from 'ramda';


/**
 * Provided a value, wraps the value in an array. If the value is already an
 * array, it is returned. If the value is undefined, an empty array is returned.
 *
 * This ensures that the value returned from this function is iterable.
 */
function ensureIsArray(valueOrArr: any): Array<any> {
  if (valueOrArr === undefined) {
    return [];
  }

  if (Array.isArray(valueOrArr)) {
    return valueOrArr;
  }

  return [valueOrArr];
}


/**
 * Provided a response object, ensure's that its 'body' is a string. This is an
 * AWS requirement. Additionally sets appropriate Content-Type and
 * Content-Length headers.
 */
function serializeBody(res: AWSLambdaFunctionResponse) {
  if (typeof res.body === 'string') {
    res.headers['Content-Type'] = 'text/plain';
    res.headers['Content-Length'] = String(res.body.length);
    return;
  }

  if (typeof res.body !== 'string') {
    res.body = JSON.stringify(res.body);
    res.headers['Content-Type'] = 'application/json';
    res.headers['Content-Length'] = String(res.body.length);
  }
}


// ----- Middleware ------------------------------------------------------------

/**
 * Middleware that sets CORS headers on the provided response. Note that the
 * 'cors' setting must also be set in serverless.yml.
 *
 * See: https://serverless.com/blog/cors-api-gateway-survival-guide/
 */
export function setCorsHeaders(res: AWSLambdaFunctionResponse) {
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Credentials'] = 'true';
}


/**
 * Sets a custom header in the response indicating the package.json version at
 * the time the function was compiled.
 */
export function setVersionHeader(res: AWSLambdaFunctionResponse) {
  if (process.env.PACKAGE_VERSION) {
    res.headers['X-Function-Version'] = process.env.PACKAGE_VERSION;
  }
}


/**
 * Default error-handling middleware that formats the provided response
 * according to the shape of the error. Parses errors thrown by axios.
 */
function handleError(error: any, res: AWSLambdaFunctionResponse) {
  if (!error) {
    return;
  }

  res.statusCode = R.pathOr(500, ['response', 'status'], error);

  res.body = {
    statusText: R.pathOr('Internal Server Error', ['response', 'statusText'], error),
    message: R.pathOr('An unknown error occurred.', ['message'], error)
  };
}


// ----- Types -----------------------------------------------------------------

/**
 * Shape of the response object returned to AWS.
 */
export interface AWSLambdaFunctionResponse {
  /**
   * HTTP status to send with the response.
   */
  statusCode: number;

  /**
   * Headers may be any string -> string key/value pair.
   */
  headers: {
    [index: string]: string;
  };

  /**
   * Technically a response's body must be a string, but we allow consumers to
   * set it to anything and serialize it for them before dispatching it.
   */
  body: any;
}


/**
 * Describes the signature of the function that should be provided to
 * AWSLambdaFunction; an async function that accepts an event object and a
 * context object.
 */
export type AsyncHandler<TEvent> = (response: AWSLambdaFunctionResponse, event: TEvent, context: Context) => void | Promise<void>;


/**
 * Configuration object provided to AWSLambdaFunction.
 */
export interface AWSLambdaFunctionConfig<TEvent = any> {
  pre?: Function | Array<Function>;
  handler: AsyncHandler<TEvent>;
  err?: Function | Array<Function>;
}


// ----- Factory ---------------------------------------------------------------

/**
 * Provided a configuration object with at least a 'handler' function, returns
 * a function conforming to the AWS Lambda signature.
 *
 * The configuration object may optionally contain 'pre' and 'err' keys, which
 * should be arrays of functions that will run prior to the handler and in the
 * event of an error, respectively. A default error handler is always included.
 */
export function AWSLambdaFunction<TEvent = any>({pre, handler, err}: AWSLambdaFunctionConfig<TEvent>): Handler<TEvent> {
  return async (event: TEvent, context: Context, cb: Callback) => {
    const response: AWSLambdaFunctionResponse = {statusCode: 200, headers: {}, body: 'OK'};

    try {
      // Run pre-handler middleware, then handler.
      await [...ensureIsArray(pre), handler].reduce(async (lastFn, curFn) => {
        await lastFn;
        await curFn(response, event, context);
      }, Promise.resolve());

      serializeBody(response);

      cb(null, response);
      return;
    } catch (error) {
      // Pre-middleware or handler threw, skip to error middleware.
      await [handleError, ...ensureIsArray(err)].reduce(async (lastFn, curFn) => {
        await lastFn;
        await curFn(error, response, context, event);
      }, Promise.resolve());

      serializeBody(response);

      console.log(`[AWSLambdaFunction] Error [${response.statusCode}]: ${error.stack}`);

      cb(null, response);
      return;
    }
  };
}

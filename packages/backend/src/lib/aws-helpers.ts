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
 * Provided a response object, ensure's that its 'body' is a string.
 */
function serializeBody(response: AWSLambdaFunctionResponse) {
  if (typeof response !== 'object') {
    return;
  }

  if (typeof response.body !== 'string') {
    response.body = JSON.stringify(response.body);
  }
}


/**
 * Error-handling middleware that formats the provided response according to the
 * shape of the error. Parses errors thrown by axios.
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


/**
 * Provided a configuration object with at least a 'handler' function, returns
 * a function conforming to the AWS Lambda signature.
 */
export function AWSLambdaFunction<TEvent = any>({pre, handler, err}: AWSLambdaFunctionConfig<TEvent>): Handler<TEvent> {
  return async (event: TEvent, context: Context, cb: Callback) => {
    const response: AWSLambdaFunctionResponse = {statusCode: 200, headers: {}, body: 'OK'};

    try {
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

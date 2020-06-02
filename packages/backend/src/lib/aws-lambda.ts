import type {Callback, Context, Handler} from 'aws-lambda';
import pSeries from 'p-series';
import * as R from 'ramda';


// ----- Types -----------------------------------------------------------------

/**
 * Shape of the response object that we are required to return to AWS.
 */
export interface AWSLambdaResponse {
  /**
   * HTTP status to send with the response.
   */
  statusCode: number;

  /**
   * Headers may be any string -> string key/value pair.
   */
  headers: Record<string, string>;

  /**
   * Technically a response's body must be a string, but we allow consumers to
   * set it to anything and serialize it for them with middleware before
   * dispatching it.
   */
  body: any;
}


/**
 * Describes the signature of the function that should be provided to
 * AWSLambdaHandlerFactory; an optionally async function that accepts a
 * response, a context, and an event object.
 *
 * Function that will be called
 */
export type AWSHandler<TEvent> = (
  response: AWSLambdaResponse,
  event: TEvent,
  context: Context
) => void | Promise<void>;


/**
 * Function that will be called if an error is thrown during the execution of
 * middleware.
 */
export type AWSErrorHandler<TEvent = any> = (
  err: Error,
  response: AWSLambdaResponse,
  event: TEvent,
  context: Context
) => void | Promise<void>;


/**
 * Configuration object provided to AWSLambdaHandlerFactory.
 */
export interface AWSLambdaHandlerFactoryConfig<TEvent = any> {
  /**
   * (Optional) Middleware function or array of middleware functions to call
   * prior to calling the lambda's handler.
   */
  pre?: AWSHandler<TEvent> | Array<AWSHandler<TEvent>>;

  /**
   * The lambda's handler.
   */
  handler: AWSHandler<TEvent>;

  /**
   * (Optional) Function or array of functions to call if an error is thrown by
   * the lambda's handler.
   */
  err?: AWSErrorHandler<TEvent> | Array<AWSErrorHandler<TEvent>>;
}


// ----- Utilities -------------------------------------------------------------

/**
 * Provided a response object, ensures that its 'body' is a string. This is an
 * AWS requirement. If the response's body is not already a string, it is
 * serialized using JSON.stringify. Appropriate Content-Type and Content-Length
 * headers will be applied if they have not already been set.
 */
function serializeBody(res: AWSLambdaResponse) {
  if (typeof res.body === 'string') {
    // If the response's body is already a string _and_ the user has not already
    // set a Content-Type header, use "text/plain".
    if (res.headers['Content-Type'] === undefined) {
      res.headers['Content-Type'] = 'text/plain';
    }
  } else {
    res.body = JSON.stringify(res.body);

    // If we serialized the response's body for the user _and_ they have not
    // already set a Content-Type header, use "application/json."
    if (res.headers['Content-Type'] === undefined) {
      res.headers['Content-Type'] = 'application/json';
    }
  }

  // Finally, set the Content-Length header if it has not already been set.
  if (res.headers['Content-Length'] === undefined) {
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
export function setCorsHeaders(res: AWSLambdaResponse) {
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Credentials'] = 'true';
}


/**
 * Sets custom headers in the response indicating the package.json version and
 * timestamp at the time the function was compiled. This assumes there are
 * "PACKAGE_VERSION" and "PACKAGE_BUILD_TIMESTAMP" compile-time constants that
 * were declared project's bundler configuration.
 */
export function setVersionHeader(res: AWSLambdaResponse) {
  if (process.env.PACKAGE_VERSION) {
    res.headers['X-Function-Version'] = process.env.PACKAGE_VERSION;
  }

  if (process.env.PACKAGE_BUILD_TIMESTAMP) {
    res.headers['X-Function-Build-Time'] = process.env.PACKAGE_BUILD_TIMESTAMP;
  }
}


/**
 * Default error-handling middleware that formats the provided response
 * according to the shape of the error. Parses errors thrown by axios.
 */
function defaultErrorHandler(error: any, res: AWSLambdaResponse) {
  if (!error) {
    return;
  }

  res.statusCode = R.pathOr(500, ['response', 'status'], error);

  res.body = {
    statusText: R.pathOr('Internal Server Error', ['response', 'statusText'], error),
    message: R.pathOr('An unknown error occurred.', ['message'], error)
  };
}


// ----- Factory ---------------------------------------------------------------

/**
 * Provided a configuration object, returns am AWS Lambda handler.
 *
 * The configuration object may optionally contain 'pre' and 'err' properties,
 * which may be functions or arrays of functions that will run prior to the
 * handler and in the event of an error, respectively. A default error handler
 * is always included.
 */
export function AWSLambdaHandlerFactory<TEvent = any>(config: AWSLambdaHandlerFactoryConfig<TEvent>): Handler<TEvent> {
  return async (event: TEvent, context: Context, cb: Callback) => {
    const response: AWSLambdaResponse = {statusCode: 200, headers: {}, body: 'OK'};

    try {
      let handlers: Array<AWSHandler<TEvent>> = [];

      if (Array.isArray(config.pre)) {
        handlers = config.pre;
      } else if (typeof config.pre === 'function') {
        handlers.push(config.pre);
      }

      handlers.push(config.handler);

      await pSeries(handlers.map(handler => {
        return async () => {
          await handler(response, event, context);
        };
      }));

      serializeBody(response);
      cb(undefined, response);

      return;
    } catch (err) {
      let errorHandlers: Array<AWSErrorHandler<TEvent>> = [];

      if (Array.isArray(config.err)) {
        errorHandlers = config.err;
      } else if (typeof config.err === 'function') {
        errorHandlers.push(config.err);
      }

      errorHandlers.unshift(defaultErrorHandler);

      // Middleware or handler threw, run error handlers.
      await pSeries(errorHandlers.map(errorHandler => {
        return async () => {
          await errorHandler(err, response, event, context);
        };
      }));

      serializeBody(response);

      console.log(`[AWSLambdaHandler] Error [${response.statusCode}]: ${err.stack}`);

      cb(err, response);

      return;
    }
  };
}

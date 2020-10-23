import type { Callback, Context, Handler } from 'aws-lambda';


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
 */
export type AWSHandler<TEvent = any> = (params: {
  response: AWSLambdaResponse;
  event: TEvent;
  context: Context;
}) => void | Promise<void>;


/**
 * Function that will be called if an error is thrown during the execution of
 * middleware.
 */
export type AWSErrorHandler<TEvent = any> = (params: {
  err: Error;
  response: AWSLambdaResponse;
  event: TEvent;
  context: Context;
}) => void | Promise<void>;


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
const serializeBody: AWSHandler = ({ response }) => {
  if (typeof response.body === 'string') {
    // If the response's body is already a string _and_ the user has not already
    // set a Content-Type header, use "text/plain".
    if (response.headers['Content-Type'] === undefined) {
      response.headers['Content-Type'] = 'text/plain';
    }
  } else {
    response.body = JSON.stringify(response.body);

    // If we serialized the response's body for the user _and_ they have not
    // already set a Content-Type header, use "application/json."
    if (response.headers['Content-Type'] === undefined) {
      response.headers['Content-Type'] = 'application/json';
    }
  }

  // Finally, set the Content-Length header if it has not already been set.
  if (response.headers['Content-Length'] === undefined) {
    response.headers['Content-Length'] = String(response.body.length);
  }
};


// ----- Middleware ------------------------------------------------------------

/**
 * Middleware that sets CORS headers on the provided response. Note that the
 * 'cors' setting must also be set in serverless.yml.
 *
 * See: https://serverless.com/blog/cors-api-gateway-survival-guide/
 */
export const setCorsHeaders: AWSHandler = ({ response }) => {
  response.headers['Access-Control-Allow-Origin'] = '*';
  response.headers['Access-Control-Allow-Credentials'] = 'true';
};


/**
 * Sets custom headers in the response indicating the package.json version and
 * timestamp at the time the function was compiled. This assumes there are
 * "PACKAGE_VERSION" and "PACKAGE_BUILD_TIMESTAMP" compile-time constants that
 * were declared project's bundler configuration.
 */
export const setVersionHeader: AWSHandler = ({ response }) => {
  if (process.env.PACKAGE_VERSION) {
    response.headers['X-Function-Version'] = process.env.PACKAGE_VERSION;
  }

  if (process.env.PACKAGE_BUILD_TIMESTAMP) {
    response.headers['X-Function-Build-Time'] = process.env.PACKAGE_BUILD_TIMESTAMP;
  }
};


/**
 * Default error-handling middleware that formats the provided response
 * according to the shape of the error. Parses errors thrown by axios.
 */
const defaultErrorHandler: AWSErrorHandler = ({ err, response }) => {
  if (!err) {
    return;
  }

  // If the error was thrown by Axios, use the status from its 'response'.
  // @ts-expect-error
  response.statusCode = err.response?.status ?? 500;

  // If the error was thrown by Axios, get the status text from its 'response'.
  // @ts-expect-error
  const statusText = err.response?.statusText ?? 'Internal Server Error';

  const message = err.message ?? 'Internal Server Error';

  response.body = {
    statusText,
    message
  };
};


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
    try {
      const response: AWSLambdaResponse = {statusCode: 200, headers: {}, body: 'OK'};
      const handlers: Array<AWSHandler<TEvent>> = typeof config.pre === 'function'
        ? [config.pre]
        : config.pre ?? [];

      handlers.push(config.handler);

      for (const handler of handlers) {
        await handler({ response, event, context });
      }

      await serializeBody({ response, event, context });

      cb(undefined, response);
    } catch (err) {
      const errorResponse: AWSLambdaResponse = {statusCode: 500, headers: {}, body: ''};
      const errorHandlers: Array<AWSErrorHandler<TEvent>> = typeof config.err === 'function'
        ? [config.err]
        : config.err ?? [];

      errorHandlers.unshift(defaultErrorHandler);

      // Middleware or handler threw, run error handlers.
      for (const errorHandler of errorHandlers) {
        await errorHandler({ err, response: errorResponse, event, context });
      }

      await serializeBody({ response: errorResponse, event, context });

      console.log(`[AWSLambdaHandler] Error [${errorResponse.statusCode}]: ${err.stack}`);

      cb(err, errorResponse);
    }
  };
}

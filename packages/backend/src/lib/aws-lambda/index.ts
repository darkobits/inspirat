import {
  defaultErrorHandler,
  serializeBody
} from './middleware';
import {
  AWSLambdaErrorHandler,
  AWSLambdaHandlerFactoryConfig,
  AWSLambdaMiddleware,
  AWSLambdaMiddlewareResponse
} from './types';

// eslint-disable-next-line import/no-unresolved, import/first
import type { Context, Handler } from 'aws-lambda';


function ensureIsArray<T = any, R = T extends Array<any> ? T : Array<T>>(value: T): R {
  if (!value) {
    // @ts-ignore
    return [];
  }

  // @ts-ignore
  return Array.isArray(value) ? value : [value];
}


/**
 * Provided a configuration object, returns am AWS Lambda handler.
 *
 * The configuration object may optionally contain 'pre' and 'err' properties,
 * which may be functions or arrays of functions that will run prior to the
 * handler and in the event of an error, respectively. A default error handler
 * is always included.
 */
export function AWSLambdaHandlerFactory<TEvent = any>(config: AWSLambdaHandlerFactoryConfig<TEvent>): Handler<TEvent> {
  return async (event: TEvent, context: Context) => {
    try {
      const response: AWSLambdaMiddlewareResponse = {
        statusCode: 200,
        headers: {},
        body: 'OK'
      };

      const handlers: Array<AWSLambdaMiddleware<TEvent>> = ensureIsArray(config.pre);

      handlers.push(config.handler);
      handlers.push(serializeBody);

      for (const handler of handlers) {
        await handler({ response, event, context });
      }

      return response;
    } catch (err: any) {
      const errorResponse: AWSLambdaMiddlewareResponse = {
        statusCode: 500,
        headers: {},
        body: ''
      };

      const errorHandlers: Array<AWSLambdaErrorHandler<TEvent>> = ensureIsArray(config.err);

      errorHandlers.unshift(defaultErrorHandler);
      errorHandlers.push(serializeBody);

      for (const errorHandler of errorHandlers) {
        await errorHandler({ err, response: errorResponse, event, context });
      }

      console.log(`[AWSLambdaMiddleware] Error [${errorResponse.statusCode}]: ${err.stack}`);

      return errorResponse;
    }
  };
}


export {AWSLambdaMiddleware} from './types';

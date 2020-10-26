import type { Context, APIGatewayProxyResult } from 'aws-lambda';


/**
 * Shape of the response object that we are required to return to AWS.
 */
export interface AWSLambdaMiddlewareResponse extends APIGatewayProxyResult {
  /**
   * Technically a response's body must be a string, but we allow consumers to
   * set it to anything and serialize it for them with middleware before
   * dispatching it.
   */
  body: any;
}


/**
 * Signature of the function that should be provided to AWSLambdaHandlerFactory.
 */
export type AWSLambdaMiddleware<TEvent = any> = (params: {
  response: AWSLambdaMiddlewareResponse;
  event: TEvent;
  context: Context;
}) => void | Promise<void>;


/**
 * Function that will be called if an error is thrown during the execution of
 * middleware.
 */
export type AWSLambdaErrorHandler<TEvent = any> = (params: {
  response: AWSLambdaMiddlewareResponse;
  event: TEvent;
  context: Context;
  err: Error;
}) => void | Promise<void>;


/**
 * Configuration object provided to AWSLambdaHandlerFactory.
 */
export interface AWSLambdaHandlerFactoryConfig<TEvent = any> {
  /**
   * (Optional) Middleware function or array of middleware functions to call
   * prior to calling the lambda's handler.
   */
  pre?: AWSLambdaMiddleware<TEvent> | Array<AWSLambdaMiddleware<TEvent>>;

  /**
   * The lambda's handler.
   */
  handler: AWSLambdaMiddleware<TEvent>;

  /**
   * (Optional) Function or array of functions to call if an error is thrown by
   * the lambda's handler.
   */
  err?: AWSLambdaErrorHandler<TEvent> | Array<AWSLambdaErrorHandler<TEvent>>;
}

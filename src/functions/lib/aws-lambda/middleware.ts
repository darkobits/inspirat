import { AxiosError } from 'axios';

import {
  AWSLambdaMiddleware,
  AWSLambdaErrorHandler
} from './types';


/**
 * Middleware that sets CORS headers on the provided response. Note that the
 * 'cors' setting must also be set in serverless.yml.
 *
 * See: https://serverless.com/blog/cors-api-gateway-survival-guide/
 */
export const setCorsHeaders: AWSLambdaMiddleware = ({ response }) => {
  if (!response.headers) {
    response.headers = {};
  }

  response.headers['Access-Control-Allow-Origin'] = '*';
  response.headers['Access-Control-Allow-Credentials'] = 'true';
};


/**
 * Sets custom headers in the response indicating the package.json version and
 * timestamp at the time the function was compiled. This assumes there are
 * "GIT_VERSION" and "BUILD_TIMESTAMP" compile-time constants that
 * were declared project's bundler configuration.
 */
export const setVersionHeader: AWSLambdaMiddleware = ({ response }) => {
  if (!response.headers) {
    response.headers = {};
  }

  if (process.env.GIT_VERSION) {
    response.headers['X-Function-Version'] = process.env.GIT_VERSION;
  }

  if (process.env.BUILD_TIMESTAMP) {
    response.headers['X-Function-Build-Time'] = process.env.BUILD_TIMESTAMP;
  }
};


/**
 * Middleware that serializes a responses body using JSON.stringify. Appropriate
 * Content-Type and Content-Length headers will be applied if they have not
 * already been set.
 */
export const serializeBody: AWSLambdaMiddleware = ({ response }) => {
  if (!response.headers) {
    response.headers = {};
  }

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


const isAxiosError = (err: any): err is AxiosError => err && (err.response || err.request);


/**
 * Default error-handling middleware that formats the provided response
 * according to the shape of the error. Parses errors thrown by axios.
 */
export const defaultErrorHandler: AWSLambdaErrorHandler = ({ err, response }) => {
  if (!err) return;

  response.statusCode = 500;
  let statusText = 'Internal Server Error';

  if (isAxiosError(err)) {
    if (err.response?.status) {
      response.statusCode = err.response.status;
    }

    if (err.response?.statusText) {
      statusText = err.response.statusText;
    }
  }

  const message = err.message ?? statusText;

  response.body = {
    statusText,
    message
  };
};

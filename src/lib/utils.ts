import {AxiosError} from 'axios';
import {LooseObject} from 'etc/types';


/**
 * Manages boilerplate for lambda function responses.
 */
export function buildResponse(userResponse: LooseObject | AxiosError): LooseObject {
  // If we were passed an error, build an appropriate response.
  if (userResponse instanceof Error) {
    const errResponse = userResponse.response || ({} as any);
    const statusCode = errResponse.status || 500;

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        statusCode,
        statusText: errResponse.statusText,
        message: userResponse.message
      })
    };
  }

  const response: any = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    ...userResponse
  };

  if (userResponse.body) {
    response.body = JSON.stringify(userResponse.body);
  } else {
    response.body = response.statusCode >= 400 ? 'ERROR' : 'OK';
  }

  return response;
}


/**
 * Returns the greater of the two values provided.
 */
export function greaterOf(a: number, b: number): number {
  return a >= b ? a : b;
}


/**
 * Provided a any integer and an array, returns the index in that array computed
 * by diving the number by the length of the array.
 */
export function modIndex(num: number, arr: Array<any>): number {
  const index = num % arr.length;
  return index < 0 ? index + arr.length : index;
}


/**
 * Provided a string, returns a new string with each word capitalized.
 */
export function capitalizeWords(input: string): string {
  return input.split(' ').map(word => `${word.substr(0, 1).toUpperCase()}${word.substr(1).toLowerCase()}`).join(' ');
}


/**
 * Returns a promise that resolves after the provided delay.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

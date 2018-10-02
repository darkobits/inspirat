import {AxiosError} from 'axios';
import {DateTime} from 'luxon';
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
 * Provided a number and an array, returns the element at that position. If the
 * position is out of bounds, modulo will be used to calculate the position,
 * enabling "circular" arrays.
 */
export function modIndex<T>(num: number, arr: Array<T>): T {
  const index = num % arr.length;
  return arr[index < 0 ? index + arr.length : index];
}


/**
 * Returns an index in the provided array. The index will increment by 1 each
 * calendar day.
 */
export function getIndexForDayOfYear(arr: Array<any>): number {
  const dayOfYear = DateTime.local().ordinal;
  return dayOfYear % arr.length;
}

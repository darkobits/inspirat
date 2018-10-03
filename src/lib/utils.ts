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
 * Provided a any integer and an array, returns the index in that array computed
 * by diving the number by the length of the array.
 */
export function modIndex(num: number, arr: Array<any>): number {
  const index = num % arr.length;
  return index < 0 ? index + arr.length : index;
}


/**
 * Returns an index in the provided array. The index will increment by 1 each
 * calendar day.
 */
export function getIndexForDayOfYear(arr: Array<any>): number {
  const dayOfYear = DateTime.local().ordinal;
  return dayOfYear % arr.length;
}

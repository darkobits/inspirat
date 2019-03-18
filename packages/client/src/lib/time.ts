import {differenceInDays, endOfDay, getHours} from 'date-fns';


/**
 * Returns the number of days since the Unix epoch.
 */
export function daysSinceEpoch(): number {
  return differenceInDays(new Date(), new Date(0));
}


/**
 * Returns the current Unix timestamp with millisecond precision.
 */
export function now() {
  return new Date().valueOf();
}

/**
 * Returns the Unix timestamp with millisecond precision for the last
 * millisecond of the current day, in the machine's local time zone.
 */
export function midnight() {
  return endOfDay(new Date()).valueOf();
}


/**
 * Returns 'morning', 'afternoon', or 'evening', based on the current time of
 * day.
 */
export function getPeriodDescriptor() {
  const hour = getHours(new Date());

  switch (hour) {
    // 12:00AM - 2:59AM
    case 0:
    case 1:
    case 2:
     return 'evening';

     // 3:00AM - 11:59AM
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
      return 'morning';

    // 12:00PM - 5:59PM
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
      return 'afternoon';

    // 6:00PM - 11:59PM
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
      return 'evening';
    default:
      return 'day';
  }
}

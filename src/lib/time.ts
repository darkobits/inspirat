import {DateTime} from 'luxon';


/**
 * Returns 'morning', 'afternoon', or 'evening', based on the current time of
 * day.
 */
export function getPeriodDescriptor() {
  const now = DateTime.local();

  switch (now.hour) {
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
      return 'morning';

    // 12:00PM - 5:59PM
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
      return 'afternoon';

    // 6:00PM - 11:59PM
    case 17:
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

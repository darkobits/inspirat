import { format, parse } from 'date-fns';
import { atomWithStorage } from 'jotai/utils';

import { atomWithQueryParam } from 'web/atoms/lib';

export const atoms = {
  /**
   * [URL] Whether to enable DevTools.
   */
  showDevTools: atomWithQueryParam('devtools', false),

  /**
   * [URL] Custom offset to use when browsing photo collections using DevTools.
   */
  currentDate: atomWithQueryParam('date', new Date(), {
    deserialize: value => {
      if (typeof value !== 'string') return new Date();

      try {
        return parse(value, 'yyyy-MM-dd', new Date());
      } catch {
        return new Date();
      }
    },
    serialize: date => format(date, 'yyyy-MM-dd')
  }),

  /**
   * [LocalStorage] Name of the current user to display in the greeting.
   */
  name: atomWithStorage('inspirat/name', ''),


  /**
   * [LocalStorage] Whether the user has seen and dismissed the introduction
   * modal.
   */
  hasSeenIntroduction: atomWithStorage('inspirat/hasSeenIntroduction', false),

  /**
   * [LocalStorage] Key/value mapping of dates in the format 'yyyy-MM-DD' to
   * photo IDs.
   */
  photoTimeline: atomWithStorage<Record<string, string> | null>(
    'inspirat/timeline',
    null,
    undefined,
    { getOnInit: true }
  )
};

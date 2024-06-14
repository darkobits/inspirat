import { atomWithStorage } from 'jotai/utils';

import { atomFromQueryParam } from 'web/atoms/lib';

export const atoms = {
  /**
   * [URL] Whether to enable DevTools.
   */
  showDevTools: atomFromQueryParam<boolean>('devtools', {
    initialValue: false,
    parseValue: value => (value === 'false' ? false : Boolean(value))
  }),

  /**
   * [URL] Custom offset to use when browsing photo collections using DevTools.
   */
  dayOffset: atomFromQueryParam<number>('offset', {
    initialValue: 0,
    parseValue: Number
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
   * [LocalStorage] Key/value mapping of dates in the format 'YYYY-MM-DD' to
   * photo IDs.
   */
  photoTimeline: atomWithStorage<Record<string, string> | null>(
    'inspirat/timeline',
    null,
    undefined,
    { getOnInit: true }
  )
};

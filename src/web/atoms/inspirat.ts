import { atomWithStorage } from 'jotai/utils';

import { atomFromQueryParam } from 'web/atoms/lib';

import type { CurrentPhotoStorageItem } from 'web/etc/types';

export const atoms = {
  showDevTools: atomFromQueryParam('devtools', false),
  dayOffset: atomFromQueryParam<number>('offset', 0),
  name: atomWithStorage('jotai:name', ''),
  hasSeenIntroduction: atomWithStorage('jotai:hasSeenIntroduction', false),
  // eslint-disable-next-line unicorn/no-useless-undefined
  currentPhoto: atomWithStorage<CurrentPhotoStorageItem | undefined>('jotai:currentPhoto', undefined)
};

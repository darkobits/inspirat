import React from 'react';

import type { GenericFunction } from 'web/etc/types';

export interface DelayedCallbackOptions {
  time: number;
  onBegin?: GenericFunction<any>;
  onEnd?: GenericFunction<any>;
}


export type UseDelayedCallbackValue = [
  boolean,
  GenericFunction
];


/**
 * Used to create asynchronous callbacks for orchestrating animations.
 */
export default function useDelayedCallback(opts: DelayedCallbackOptions, dependencies: Array<any> = []): UseDelayedCallbackValue {
  const [isDelaying, setIsDelaying] = React.useState(false);

  const handler = React.useCallback<GenericFunction>((...args) => {
    const doHide = async () => {
      setIsDelaying(true);

      if (opts.onBegin) {
        await opts.onBegin(...args);
      }

      await new Promise(resolve => {
        setTimeout(resolve, opts.time);
      });

      if (opts.onEnd) {
        await opts.onEnd(...args);
      }

      setIsDelaying(false);
    };

    void doHide();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return [isDelaying, handler];
}

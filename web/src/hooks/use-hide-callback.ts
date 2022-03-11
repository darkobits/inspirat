import React from 'react';


export interface HideCallbackOptions {
  hideTime: number;
  onBeginHide?: (...args: Array<any>) => any;
  onEndHide?: (...args: Array<any>) => any;
}


export type HideCallbackReturnType = [
  boolean,
  (...args: Array<any>) => Promise<void>
];


/**
 * Used to create asynchronous callbacks for hiding modals that allows callbacks
 * to be invoked before and/or after an animation runs.
 */
export default function useHideCallback(opts: HideCallbackOptions, dependencies: Array<any> = []): HideCallbackReturnType {
  const [isHiding, setIsHiding] = React.useState(false);

  const handleHide = React.useCallback(async (...args: Array<any>) => {
    setIsHiding(true);

    if (opts.onBeginHide) {
      await opts.onBeginHide(...args);
    }

    await new Promise(resolve => {
      setTimeout(resolve, opts.hideTime);
    });

    if (opts.onEndHide) {
      await opts.onEndHide(...args);
    }

    setIsHiding(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return [isHiding, handleHide];
}

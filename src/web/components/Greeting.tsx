import { desaturate, lighten } from 'polished';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import InspiratContext from 'web/contexts/Inspirat';
import { BACKGROUND_TRANSITION_DURATION, BACKGROUND_TRANSITION_FUNCTION } from 'web/etc/constants';
import { keyframes } from 'web/etc/global-styles.css';
import { rgba } from 'web/lib/utils';

import classes from './Greeting.css';

import type { ElementProps } from 'web/etc/types';

/**
 * Renders the greeting.
 */
export default function Greeting(props: ElementProps<HTMLDivElement>) {
  const { currentPhoto, name, period } = React.useContext(InspiratContext);
  const { style } = props;
  const transitionDuration = style?.transitionDuration ?? BACKGROUND_TRANSITION_DURATION;
  const transitionTimingFunction = style?.transitionTimingFunction ?? BACKGROUND_TRANSITION_FUNCTION;
  const [ready, setReady] = React.useState(false);

  /**
   * [Memo] Computes the greeting copy.
   */
  const greeting = React.useMemo(() => {
    if (!name) return <span>Good {period}.</span>;

    return (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Good {period},&nbsp;</span>
        <span>{name}.</span>
      </>
    );
  }, [name, period]);

  /**
   * [Effect] Flips our `ready` state to `true` once, when the first photo is
   * ready.
   */
  React.useEffect(() => {
    if (!currentPhoto?.id) return;
    const timeout = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timeout);
  }, [currentPhoto?.id]);

  return (
    <div
      data-testid="Greeting"
      className={twMerge(
        classes.greeting,
        'flex flex-wrap shrink items-center content-center',
        'font-light font-fancy',
        'min-w-min h-min',
        'px-12 pt-10 pb-7',
        'rounded-3xl'

      )}
      style={{
        color: lighten(0.2, desaturate(0.24, rgba(currentPhoto?.palette?.lightVibrant ?? 'white', 1))),
        borderColor: rgba(currentPhoto?.palette?.vibrant ?? 'white', 0.02),
        textShadow: `0px 0px 4px ${rgba(currentPhoto?.palette?.darkMuted ?? 'black', 0.42)}`,
        opacity: ready ? 1 : 0,
        fontSize: 'clamp(2rem, 1rem + 4vw, 4rem)',

        // Animations.
        animationName: ready ? keyframes.blurIn : 'none',
        animationDuration: '720ms',
        animationTimingFunction: 'cubic-bezier(0, 0.75, 0.25, 1)',

        // Transitions.
        transitionProperty: 'color, background-color, border-color, opacity',
        transitionTimingFunction,
        transitionDuration,

        ...style
      }}
    >
      {greeting}
    </div>
  );
}

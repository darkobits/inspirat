import { desaturate, lighten } from 'polished';
import React from 'react';

import InspiratContext from 'web/contexts/Inspirat';
import { BACKGROUND_TRANSITION_FUNCTION } from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes from './Greeting.css';

import type { ElementProps } from 'web/etc/types';

/**
 * Renders the greeting.
 */
export default function Greeting(props: ElementProps<HTMLDivElement>) {
  const { currentPhoto, name, period } = React.useContext(InspiratContext);
  const { style } = props;
  // const transitionDuration = style?.transitionDuration ?? BACKGROUND_TRANSITION_DURATION;
  const transitionTimingFunction = style?.transitionTimingFunction ?? BACKGROUND_TRANSITION_FUNCTION;

  const greeting = React.useMemo(() => {
    if (!name) return <span>Good {period}.</span>;

    return (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Good {period},&nbsp;</span>
        <span>{name}.</span>
      </>
    );
  }, [name, period]);

  return (
    <div
      data-testid="Greeting"
      className={classes.greeting}
      style={{
        color: lighten(0.12, desaturate(0.32, rgba(currentPhoto?.palette?.lightVibrant ?? 'white', 1))),
        borderColor: rgba(currentPhoto?.palette?.vibrant ?? 'white', 0.12),
        textShadow: `0px 0px 4px ${rgba(currentPhoto?.palette?.darkMuted ?? 'black', 0.72)}`,
        opacity: currentPhoto ? 1 : 0,
        transitionProperty: 'color, background-color, border-color, opacity',
        transitionTimingFunction,
        transitionDuration: '1.2s',
        ...style
      }}
    >
      {greeting}
    </div>
  );
}

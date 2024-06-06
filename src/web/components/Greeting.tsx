import { desaturate, lighten } from 'polished';
import React from 'react';

import InspiratContext from 'web/contexts/Inspirat';
import {
  BACKGROUND_TRANSITION_DURATION,
  BACKGROUND_TRANSITION_FUNCTION
} from 'web/etc/constants';
import { rgba } from 'web/lib/utils';

import classes from './Greeting.css';

// interface GreetingBackgroundProps extends ElementProps<HTMLDivElement> {
//   palette: InspiratPhotoResource['palette'] | undefined;
// }

// const GreetingBackground = (props: GreetingBackgroundProps) => {
//   const { children, className, style, ...restProps } = props;
//   return (
//     <div
//       className={cx(classes.greetingBackground, className)}
//       style={{
//         color: 'white',
//         backgroundColor: desaturate(0.5, rgba(props.palette?.darkMuted ?? 'black', 0.24)),
//         textShadow: `0px 0px 4px ${rgba(props.palette?.darkMuted ?? 'black', 0.72)}`,
//         transition: [
//           `background-color ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`,
//           `text-shadow ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`,
//           `opacity ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`
//         ].join(', '),
//         ...style
//       }}
//       {...restProps}
//     >
//       {children}
//     </div>
//   );
// };

// ----- Greeting --------------------------------------------------------------

/**
 * Renders the greeting.
 */
export default function Greeting() {
  const { currentPhoto, name, period } = React.useContext(InspiratContext);

  // const greeting = name
  //   ? `Good ${period}, ${name}.`
  //   : `Good ${period}.`;

  // const greeting = name ? `Good ${period}, ` : `Good ${period}.`;

  const greeting =
    name ? (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Good {period},&nbsp;</span>
        <span>{name}.</span>
      </>
    ) : (
      <span>Good {period}.</span>
    )
  ;


  return (
    <div className={classes.greetingWrapper}>
      <div
        className={classes.greeting}
        style={{
          color: lighten(0.2, desaturate(0.32, rgba(currentPhoto?.palette?.lightVibrant ?? 'white', 1))),
          borderColor: rgba(currentPhoto?.palette?.vibrant ?? 'white', 0.12),
          textShadow: `0px 0px 4px ${rgba(currentPhoto?.palette?.darkMuted ?? 'black', 0.72)}`,
          transition: [
            `color ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`,
            `background-color ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`,
            `border-color ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`,
            `opacity ${BACKGROUND_TRANSITION_DURATION} ${BACKGROUND_TRANSITION_FUNCTION}`
          ].join(', ')

        }}

      >
        {greeting}
      </div>
    </div>
  );
}

// import { rgba as polishedRgba } from 'polished';
import React from 'react';

import { InspiratPhotoResource } from 'etc/types';
import { useInspirat } from 'web/hooks/use-inspirat';
// import { compositeTextShadow } from 'web/lib/typography';
import { rgba } from 'web/lib/utils';


import classes from './Greeting.css';


/**
 * Returns a compound text-shadow string based on the swatch color for the
 * current photo.
 */
// const textShadow = (color: string) => compositeTextShadow([
//   [0, 0, 6, polishedRgba(0, 0, 0, 0.24)],
//   [0, 0, 16, polishedRgba(color, 0.18)]
// ]);


// ----- Greeting Wrapper ------------------------------------------------------

interface GreetingWrapperProps extends React.PropsWithChildren {
  // color: string;
  opacity: number;
}

const GreetingWrapper = (props: GreetingWrapperProps) => {
  return (
    <div
      className={classes.greetingWrapper}
      style={{
        opacity: props.opacity
      }}
    >
      {props.children}
    </div>
  );
};


// ----- Greeting Background ---------------------------------------------------

interface GreetingBackgroundProps extends React.PropsWithChildren {
  palette: InspiratPhotoResource['palette'] | undefined;
}

const GreetingBackground = (props: GreetingBackgroundProps) => {
  return (
    <div
      className={classes.greetingBackground}
      style={{
        color: rgba(props.palette?.darkMuted ?? 'black')
      }}
    >
      {props.children}
    </div>
  );
};


// ----- Greeting Foreground ---------------------------------------------------

interface GreetingForegroundProps extends React.PropsWithChildren {
  palette: InspiratPhotoResource['palette'] | undefined;
}

const GreetingForeground = (props: GreetingForegroundProps) => {
  return (
    <div
      className={classes.greetingForeground}
      style={{
        color: rgba(props.palette?.lightVibrant ?? 'white', 1),
        backgroundColor: rgba(props.palette?.darkMuted ?? 'black', 0.12),
        borderColor: rgba(props.palette?.lightVibrant ?? 'white', 0.24),
        textShadow: `0px 0px 4px ${rgba(props.palette?.darkMuted ?? 'black', 0.72)}`,
        opacity: 1
      }}
    >
      {props.children}
    </div>
  );
};


// ----- Greeting --------------------------------------------------------------

/**
 * Renders the greeting copy.
 */
const Greeting = () => {
  const { currentPhoto, name, period } = useInspirat();

  const greeting = name
    ? `Good ${period}, ${name}.`
    : `Good ${period}.`;

  // const color = rgba(currentPhoto?.palette?.vibrant ?? {r: 0, g: 0, b: 0});

  return (
    <GreetingWrapper opacity={currentPhoto ? 1 : 0}>
      <GreetingBackground palette={currentPhoto?.palette}>
        {greeting}
      </GreetingBackground>
      <GreetingForeground palette={currentPhoto?.palette}>
        {greeting}
      </GreetingForeground>
    </GreetingWrapper>
  );
};


export default Greeting;

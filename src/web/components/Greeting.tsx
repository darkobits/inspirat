import { assignInlineVars } from '@vanilla-extract/dynamic';
import { InspiratPhotoResource } from 'etc/types';
import { rgba as polishedRgba } from 'polished';
import React from 'react';

import { useInspirat } from 'web/hooks/use-inspirat';
import { compositeTextShadow } from 'web/lib/typography';
import { rgba } from 'web/lib/utils';


import classes, { vars } from './Greeting.css';


/**
 * Returns a compound text-shadow string based on the swatch color for the
 * current photo.
 */
const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 8, polishedRgba(0, 0, 0, 1)],
  [0, 0, 32, polishedRgba(color, 0.3)],
  [0, 0, 96, polishedRgba(color, 0.6)]
]);


// ----- Greeting Wrapper ------------------------------------------------------

interface GreetingWrapperProps extends React.PropsWithChildren {
  // color: string;
  opacity: number;
}

const GreetingWrapper = (props: GreetingWrapperProps) => {
  return (
    <div
      className={classes.greetingWrapper}
      style={assignInlineVars({
        [vars.greetingWrapper.opacity]: String(props.opacity)
      })}
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
      style={assignInlineVars({
        [vars.greetingBackground.color]: rgba(props.palette?.darkVibrant ?? 'black'),
        [vars.greetingBackground.filter]: `drop-shadow(0px 0px 10px ${rgba(props.palette?.darkVibrant ?? 'black', 0.5)})`,
        [vars.greetingBackground.textShadow]: textShadow(rgba(props.palette?.darkMuted ?? 'black'))
      })}
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
    <div className={classes.greetingForeground}>
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
    <GreetingWrapper
      opacity={currentPhoto ? 1 : 0}
    >
      <GreetingBackground
        palette={currentPhoto?.palette}
      >
        {greeting}
      </GreetingBackground>
      <GreetingForeground
        palette={currentPhoto?.palette}
      >
        {greeting}
      </GreetingForeground>
    </GreetingWrapper>
  );
};


export default Greeting;

import { styled } from '@linaria/react';
import { InspiratPhotoResource } from 'inspirat-types';
import { rgba as polishedRgba } from 'polished';
import * as R from 'ramda';
import React from 'react';

import { useInspirat } from 'hooks/use-inspirat';
import { compositeTextShadow } from 'lib/typography';
import { rgba } from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

export interface StyledGreetingProps {
  color: string;
  opacity: number;
}

/**
 * Returns a compound text-shadow string based on the swatch color for the
 * current photo.
 */
const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 8, polishedRgba(0, 0, 0, 1)],
  [0, 0, 32, polishedRgba(color, 0.3)],
  [0, 0, 96, polishedRgba(color, 0.6)]
]);


const GreetingWrapper = styled.div<StyledGreetingProps>`
  color: white;
  font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  font-size: 28px;
  font-weight: 200;
  height: 100%;
  margin-bottom: 128px;
  pointer-events: none;
  position: relative;
  user-select: none;
  width: 100%;

  opacity: ${R.prop('opacity')};

  transition-property: all;
  transition-duration: 1.2s;
  transition-timing-function: ease-in-out;
  transition-delay: 0s;

  * {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    pointer-events: inherit;
  }

  @media(min-width: 520px) {
    font-size: 38px;
  }

  @media(min-width: 640px) {
    font-size: 52px;
  }

  @media(min-width: 760px) {
    font-size: 64px;
  }

  @media(min-width: 860px) {
    font-size: 72px;
  }

  @media(min-width: 940px) {
    font-size: 80px;
  }

  @media(min-width: 1120px) {
    font-size: 96px;
  }
`;


interface GreetingProps {
  palette: InspiratPhotoResource['palette'] | undefined;
}


const GreetingForeground = styled.div<GreetingProps>`
  align-items: center;
  color: inherit;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
  z-index: 1;

  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);
`;


const GreetingBackground = styled.div<GreetingProps>`
  align-items: center;
  color: ${props => {
    return rgba(props.palette?.darkVibrant ?? 'black');
  }};
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
  z-index: 0;

  filter: drop-shadow(0px 0px 10px ${props => rgba(props.palette?.darkVibrant ?? 'black', 0.5)});

  /* text-shadow: ${props => textShadow(rgba(props.palette?.darkMuted ?? 'black'))}; */
  /* mix-blend-mode: color-burn; */
`;


/**
 * Renders the greeting copy.
 */
const Greeting: React.FunctionComponent = () => {
  const { currentPhoto, name, period } = useInspirat();

  const greeting = name
    ? `Good ${period}, ${name}.`
    : `Good ${period}.`;

  const color = rgba(currentPhoto?.palette?.vibrant ?? {r: 0, g: 0, b: 0});

  return (
    <GreetingWrapper
      color={color}
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

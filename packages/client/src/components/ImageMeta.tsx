import { styled } from '@linaria/react';
import { rgba } from 'polished';
import * as R from 'ramda';
import React from 'react';

import { useInspirat } from 'hooks/use-inspirat';
import { compositeTextShadow } from 'lib/typography';


/**
 * Provided a color, returns a composite text-shadow property descriptor that
 * renders a black shadow followed by a larger shadow in the provided color.
 */
const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 8, rgba(color, 0.3)]
]);


interface ImageMetaElProps {
  shadowColor: string | undefined;
}


const ImageMetaEl = styled.div<ImageMetaElProps>`
  color: rgba(255, 255, 255, 0.96);
  display: flex;
  font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 0em;
  min-height: 1em;
  text-shadow: ${R.pipe(R.propOr('black', 'shadowColor'), textShadow)};
  user-select: none;

  & a {
    color: inherit;
    transition: all 0.25s ease-in-out;

    &:hover {
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.32);
    }
  }
`;


export const ImageMeta: React.FunctionComponent = ({ children }) => {
  const { currentPhoto } = useInspirat();

  return (
    <ImageMetaEl shadowColor={R.propOr(undefined, 'color', currentPhoto)}>
      {children}
    </ImageMetaEl>
  );
};

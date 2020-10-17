import { styled } from 'linaria/react';
import { rgba } from 'polished';
import * as R from 'ramda';
import React from 'react';

import InspiratContext from 'contexts/Inspirat';
import { compositeTextShadow } from 'lib/typography';


// ----- Types -----------------------------------------------------------------

export interface ImageMetaElProps {
  shadowColor?: string;
}


// ----- Styles ----------------------------------------------------------------

const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 8, rgba(color, 0.3)]
]);

const ImageMetaEl = styled.div<ImageMetaElProps>`
  color: rgb(255, 255, 255, 0.96);
  display: flex;
  font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.35px;
  text-shadow: ${R.pipe(R.propOr('black', 'shadowColor'), textShadow)};
  user-select: none;

  & a {
    color: rgb(255, 255, 255, 0.96);
    transition: all 0.15s ease-in-out;

    &:hover {
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 1);
    }
  }
`;


// ----- Component -------------------------------------------------------------

const ImageMeta: React.FunctionComponent = props => {
  const { currentPhoto } = React.useContext(InspiratContext);

  return (
    <ImageMetaEl shadowColor={R.propOr(undefined, 'color', currentPhoto)}>
      {props.children}
    </ImageMetaEl>
  );
};


export default ImageMeta;

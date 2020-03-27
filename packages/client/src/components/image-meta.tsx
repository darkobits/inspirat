import {styled} from 'linaria/react';
import {rgba} from 'polished';
import * as R from 'ramda';
import React, {FunctionComponent, useContext} from 'react';

import PhotoContext from 'contexts/photo';
import {compositeTextShadow} from 'lib/typography';


// ----- Types -----------------------------------------------------------------

export interface ImageMetaProps {
  className?: string;
}

export interface ImageMetaElProps {
  // TODO: This shouldn't have to be defined here.
  className?: string;
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

const ImageMeta: FunctionComponent<ImageMetaProps> = props => {
  const {currentPhoto} = useContext(PhotoContext);

  return (
    <ImageMetaEl className={props.className} shadowColor={R.propOr(undefined, 'color', currentPhoto)}>
      {props.children}
    </ImageMetaEl>
  );
};


export default ImageMeta;

import {rgba} from 'polished';
import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'components/photo-context';
import R from 'lib/ramda';


// ----- Props -----------------------------------------------------------------

export interface ImageLocationProps {
  className?: string;
}


// ----- Styled Elements -------------------------------------------------------

const textShadow = (color: string) => [
  `0px 0px 2px  ${rgba(0, 0, 0, 1)}`,
  `0px 0px 8px ${rgba(color, 0.3)}`
].join(', ');

const ImageInfo = styled.div<{shadowColor: string}>`
  color: rgb(255, 255, 255, 0.96);
  display: flex;
  text-shadow: ${R.pipe(R.prop('shadowColor'), textShadow)};
  user-select: none;
`;


// ----- Component -------------------------------------------------------------

const ImageLocation: React.SFC<ImageLocationProps> = ({className}) => (
  <PhotoContext.Consumer>{photo => {
    if (!photo || !photo.location) {
      return <div></div>;
    }

    return (
      <ImageInfo shadowColor={photo.color} className={className}>
        {photo.location.title}
      </ImageInfo>
    );
  }}</PhotoContext.Consumer>
);


export default ImageLocation;

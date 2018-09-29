import React from 'react';
import styled, {css} from 'react-emotion';

import {shadow} from 'etc/constants';
import LocationMarker from 'components/location-marker';


// ----- Props -----------------------------------------------------------------

export interface ImageLocationProps {
  className?: string;
  location?: string;
}


// ----- Styled Elements -------------------------------------------------------

const ImageInfo = styled.div`
  display: flex;
  text-shadow: ${shadow};
`;


const markerClass = css`
  align-self: center;
  margin-right: 0.2em;
  width: 0.8em;
  height: 0.8em;
`;


// ----- Component -------------------------------------------------------------

const ImageLocation: React.SFC<ImageLocationProps> = ({className, location}) => {
  if (!location) {
    return <div></div>;
  }

  return (
    <ImageInfo className={className || ''}>
      <LocationMarker className={markerClass} fill="#BABABA" shadow={shadow} />
      {location}
    </ImageInfo>
  );
};


export default ImageLocation;

import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'components/photo-context';


// ----- Props -----------------------------------------------------------------

export interface ImageLocationProps {
  className?: string;
}


// ----- Styled Elements -------------------------------------------------------

const ImageInfo = styled.div`
  color: rgb(255, 255, 255, 0.96);
  display: flex;
  text-shadow: 0px 0px 3px rgba(255, 255, 255, 0.48);
  user-select: none;
`;


// ----- Component -------------------------------------------------------------

const ImageLocation: React.SFC<ImageLocationProps> = ({className}) => (
  <PhotoContext.Consumer>{photo => {
    if (!photo || !photo.location) {
      return <div></div>;
    }

    return (<ImageInfo className={className}>{photo.location.title}</ImageInfo>);
  }}</PhotoContext.Consumer>
);


export default ImageLocation;

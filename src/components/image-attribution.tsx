import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'components/photo-context';
import {shadow} from 'etc/constants';


// ----- Props -----------------------------------------------------------------

export interface ImageAttributionProps {
  className?: string;
}


// ----- Styled Elements -------------------------------------------------------

const ImageAttributionInner = styled.div`
  color: rgb(255, 255, 255, 0.64);
  display: flex;
  text-shadow: ${shadow};
  user-select: none;

  & a {
    color: white;
    opacity: 0.8;
    transition: all 0.15s ease-in-out;

    &:hover {
      opacity: 1;
      text-shadow: 0px 0px 3px rgba(255, 255, 255, 0.48);
    }
  }
`;


// ----- Component -------------------------------------------------------------

const ImageAttribution: React.SFC<ImageAttributionProps> = ({className}) => (
  <PhotoContext.Consumer>{photo => {
    if (!photo) {
      return <div></div>;
    }

    return (
      <ImageAttributionInner className={className}>
        Photo by&nbsp;<a href={photo.user.links.html}>{photo.user.name}</a>&nbsp;on&nbsp;<a href="https://unsplash.com">Unsplash</a>
      </ImageAttributionInner>
    );
  }}</PhotoContext.Consumer>
);


export default ImageAttribution;

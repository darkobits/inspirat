import {rgba} from 'polished';
import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'components/photo-context';


// ----- Props -----------------------------------------------------------------

export interface ImageAttributionProps {
  className?: string;
}


// ----- Styled Elements -------------------------------------------------------

const textShadow = (color: string) => [
  `0px 0px 2px  ${rgba(0, 0, 0, 1)}`,
  `0px 0px 8px ${rgba(color, 0.3)}`
].join(', ');

const ImageAttributionInner = styled.div<{shadowColor: string}>`
  display: flex;
  text-shadow: ${props => textShadow(props.shadowColor)};
  user-select: none;

  & a {
    color: white;
    transition: all 0.15s ease-in-out;

    &:hover {
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.48);
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
      <ImageAttributionInner shadowColor={photo.color} className={className}>
        Photo by&nbsp;<a href={photo.user.links.html}>{photo.user.name}</a>&nbsp;on&nbsp;<a href="https://unsplash.com">Unsplash</a>
      </ImageAttributionInner>
    );
  }}</PhotoContext.Consumer>
);


export default ImageAttribution;

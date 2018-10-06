import {rgba} from 'polished';
import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'components/photo-context';
import R from 'lib/ramda';
import {capitalizeWords} from 'lib/utils';


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
  text-shadow: ${R.pipe(R.prop('shadowColor'), textShadow)};
  user-select: none;

  & a {
    color: white;
    transition: all 0.15s ease-in-out;

    &:hover {
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 1);
    }
  }
`;


// ----- Component -------------------------------------------------------------

const ImageAttribution: React.SFC<ImageAttributionProps> = ({className}) => (
  <PhotoContext.Consumer>{photo => {
    if (!photo || !photo.user) {
      return <div></div>;
    }

    // Format name we get from Unsplash, because some users think its 'cute' to
    // stylize their names in all caps. :|
    const formattedName = capitalizeWords(photo.user.name);

    return (
      <ImageAttributionInner shadowColor={photo.color} className={className}>
        Photo by&nbsp;<a href={photo.user.links.html}>{formattedName}</a>&nbsp;on&nbsp;<a href={photo.links.html}>Unsplash</a>
      </ImageAttributionInner>
    );
  }}</PhotoContext.Consumer>
);


export default ImageAttribution;

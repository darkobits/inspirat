import React from 'react';
import styled from 'react-emotion';
import {shadow} from 'etc/constants';


// ----- Props -----------------------------------------------------------------

export interface ImageAttributionProps {
  author: string;
  className?: string;
  href?: string;
}


// ----- Styled Elements -------------------------------------------------------

const ImageAttributionInner = styled.div`
  text-shadow: ${shadow};
`;


// ----- Component -------------------------------------------------------------

const ImageAttribution: React.SFC<ImageAttributionProps> = ({className, author, href}) => {
  return (
    <ImageAttributionInner className={className || ''}>
      <a href={href || '#'}>{author}</a>
    </ImageAttributionInner>
  );
};


export default ImageAttribution;

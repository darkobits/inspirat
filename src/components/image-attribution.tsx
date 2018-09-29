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
  display: flex;
  text-shadow: ${shadow};
`;


const AvatarIcon = styled.img`
  border-radius: 50%;
  display: block;
  filter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.33));
  float: left;
  height: 0.8em;
  margin-right: 0.4em;
  margin-top: 0.23em;
  width: 0.8em;
`;


// ----- Component -------------------------------------------------------------

const ImageAttribution: React.SFC<ImageAttributionProps> = ({className, author, href}) => {
  return (
    <ImageAttributionInner className={className || ''}>
      <a href={href || '#'}>
        <AvatarIcon src="https://images.unsplash.com/placeholder-avatars/extra-large.jpg"></AvatarIcon>
        {author}
      </a>
    </ImageAttributionInner>
  );
};


export default ImageAttribution;

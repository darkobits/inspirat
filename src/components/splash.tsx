import styled from 'react-emotion';
import React from 'react';
import ImageLocation from 'components/image-location';
import ImageAttribution from 'components/image-attribution';


// ----- Props -----------------------------------------------------------------

interface SplashProps {
  /**
   * URL of the image to display.
   */
  href: string;

  /**
   * Geographical location where the image was taken. Shown in the lower left
   * corner.
   */
  location: string;

  /**
   * Attribution for the image. Shown in the lower right corner.
   */
  author: string;

  /**
   * (Optional) Link for the attribution text.
   */
  authorHref?: string;
}


// ----- Styled Elements -------------------------------------------------------

const SplashInner = styled.div<{href: string}>`
  align-items: flex-end;
  background-image: url(${props => props.href});
  background-position: center center;
  background-size: fill;
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0px 4px 4px 4px;
  width: 100%;
`;


// ----- Component -------------------------------------------------------------

const Splash: React.SFC<SplashProps> = ({href, location, author, authorHref}) => {
  return (
    <SplashInner href={href}>
      <ImageLocation location={location} />
      <ImageAttribution author={author} href={authorHref} />
    </SplashInner>
  );
};


export default Splash;

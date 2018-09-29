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
   * Attribution for the image. Shown in the lower right corner.
   */
  author: string;

  /**
   * (Optional) Geographical location where the image was taken. Shown in the
   * lower left corner.
   */
  location?: string;

  /**
   * (Optional) Link for the attribution text.
   */
  authorHref?: string;
}


// ----- Styled Elements -------------------------------------------------------

const SplashInner = styled.div<{href: string}>`
  align-items: flex-end;
  background-attachment: fixed;
  background-image: url(${props => props.href});
  background-position: center center;
  background-size: cover;
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0px 4px 4px 4px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
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

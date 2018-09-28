import React from 'react';
import styled from 'react-emotion';


export interface LocationMarkerProps {
  className?: string;
  fill?: string;
  shadow?: string;
  size?: string;
}

const LocationMarker: React.SFC<LocationMarkerProps> = ({className, fill, shadow, size}) => {
  const defaultFill = '#BABABA';
  const defaultShadow = '5px 5px 5px rgba(0, 0, 0, 0.5)';
  const defaultSize = '0.72em';

  const LocationSvg = styled.svg`
    fill: ${fill || defaultFill};
    filter: drop-shadow(${shadow || defaultShadow});
    width: ${size || defaultSize};
    height: ${size || defaultSize};
  `;

  return (
    <LocationSvg className={className || ''} version="1.1" viewBox="0 0 32 32" width="32" height="32" aria-hidden="false">
      <path d="M16 0c-6.7 0-12 5.3-12 12 0 8.6 8.6 17.3 11.2 19.7.4.4 1.1.4 1.5 0 2.7-2.4 11.3-11.1 11.3-19.7 0-6.7-5.3-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path>
    </LocationSvg>
  );
};


export default LocationMarker;

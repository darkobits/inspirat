import { styled } from '@linaria/react';
import { darken, readableColor } from 'polished';
import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { Color } from 'common/types';
import { v4 as uuid } from 'uuid';

import { BASIS, WHITE, BLACK } from 'etc/constants';
import { rgba } from 'lib/utils';


const StyledSwatch = styled.div<{ notHtmlColor: Color | undefined }>`
  align-items: center;
  background-color: ${({ notHtmlColor }) => rgba(notHtmlColor ?? WHITE)};
  border-radius: 4px;
  border: 1px solid ${({ notHtmlColor }) => darken(0.2, rgba(notHtmlColor ?? BLACK, 0.42))};
  color: ${({ notHtmlColor }) => readableColor(rgba(notHtmlColor ?? WHITE))};
  display: flex;
  font-size: 12px;
  height: ${BASIS};
  justify-content: center;
  text-transform: capitalize;
  width: 32px;
`;


interface SwatchProps extends React.PropsWithChildren<any> {
  color?: Color;
}


/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
export const Swatch = ({ color, children, ...props }: SwatchProps) => {
  const [tooltipId] = React.useState(uuid());
  const tooltipTarget = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <StyledSwatch
      ref={tooltipTarget}
      notHtmlColor={color}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      <Overlay
        target={tooltipTarget.current}
        show={showTooltip}
        placement="auto"
        flip
      >
        {overlayProps => (
          <Tooltip id={tooltipId} {...overlayProps as any}>
            {children}
          </Tooltip>
        )}
      </Overlay>
    </StyledSwatch>
  );
};

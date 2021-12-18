import { styled } from '@linaria/react';
import { Color, InspiratPhotoResource } from 'inspirat-types';
import { darken, desaturate, lighten } from 'polished';
import React from 'react';

import { BASIS, WHITE, BLACK } from 'etc/constants';
import { rgba } from 'lib/utils';


// ----- Image Source ----------------------------------------------------------

interface SourceProps extends React.PropsWithChildren<any> {
  photo: InspiratPhotoResource | undefined;
}

/**
 * Image override component.
 */
const StyledSource = styled.div<{ fgColor: Color; bgColor: Color }>`
  height: ${BASIS};
  width: 100%;
  margin-right: 12px;
  backdrop-filter: blur(20px);

  input {
    background-color: ${({ bgColor }) => darken(0.2, rgba(bgColor, 0.7))};
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    border-color: ${({ fgColor }) => desaturate(0.6, rgba(fgColor, 0.4))};
    box-shadow: 0px 0px 2px 1px ${({ bgColor }) => rgba(bgColor, 0.16)};
    color: ${({ fgColor }) => desaturate(0, lighten(0.16, rgba(fgColor)))};
    /* font-family: sans-serif; */
    font-size: 14px;
    font-size: inherit;
    font-weight: 400;
    height: ${BASIS};
    line-height: ${BASIS};
    padding: 0px 10px;
    width: 100%;
    transition: all 0.15s ease-in-out;

    &:focus {
      outline: none;
      box-shadow: 0px 0px 1px 1px ${({ bgColor }) => rgba(bgColor, 0.32)};
      background-color: ${({ bgColor }) => darken(0.2, rgba(bgColor, 0.8))};
      border-color: ${({ fgColor }) => desaturate(0.6, rgba(fgColor, 0.6))};
    }

    &::placeholder {
      color: ${({ fgColor }) => rgba(fgColor, 0.64)};
    }

    &::selection {
      background-color: ${({ bgColor }) => darken(0.05, rgba(bgColor, 0.5))};
    }
  }
`;


export const Source = ({ photo, children }: SourceProps) => {
  const fgColor = photo?.palette?.lightMuted ?? WHITE;
  const bgColor = photo?.palette?.darkVibrant ?? BLACK;

  return (
    <StyledSource fgColor={fgColor} bgColor={bgColor}>
      {children}
    </StyledSource>
  );
};

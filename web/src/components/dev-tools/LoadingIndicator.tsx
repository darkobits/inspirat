import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React from 'react';
import { BsArrowRepeat, BsCheck } from 'react-icons/bs';
import { Color, InspiratPhotoResource } from 'common/types';

import { BASIS, WHITE, BLACK } from 'etc/constants';
import { rgba } from 'lib/utils';


const Styled = {
  LoadingIndicator: styled.div<{ fgColor?: Color; bgColor?: Color }>`
    align-items: center;
    background-color: ${({ bgColor }) => rgba(bgColor ?? BLACK)};
    border-radius: 4px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
    display: flex;
    height: ${BASIS};
    justify-content: center;
    transition: background-color 1s ease;
    width: ${BASIS};

    & svg {
      color: ${({ fgColor }) => rgba(fgColor ?? WHITE)};
      filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16));
      transition: color 1s ease;
    }
  `
};

const spinClassName = css`
  @keyframes spin {
    from {
      transform:rotate(0deg);
    }
    to {
      transform:rotate(360deg);
    }
  }

  animation: spin 2s infinite linear;
`;


interface Props {
  photo: InspiratPhotoResource | undefined;
  isLoading: boolean;
}


export const LoadingIndicator = ({ photo, isLoading }: Props) => {
  const fgColor = photo?.palette?.lightVibrant ?? WHITE;
  const bgColor = photo?.palette?.darkMuted ?? BLACK;

  return (
    <Styled.LoadingIndicator fgColor={fgColor} bgColor={bgColor}>
      {isLoading ? <BsArrowRepeat className={spinClassName} /> : <BsCheck />}
    </Styled.LoadingIndicator>
  );
};

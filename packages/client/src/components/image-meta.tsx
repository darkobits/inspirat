import styled from '@emotion/styled';
import {rgba} from 'polished';
import * as R from 'ramda';
import React from 'react';

import PhotoContext from 'contexts/photo';
import events from 'lib/events';
import {compositeTextShadow} from 'lib/typography';
import {sleep} from 'lib/utils';


// ----- Types -----------------------------------------------------------------

export interface ImageMetaProps {
  className?: string;
}

export interface ImageMetaElProps {
  shadowColor: string;
  opacity: string | number;
}


// ----- Styles ----------------------------------------------------------------

const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 8, rgba(color, 0.3)]
]);

const ImageMetaEl = styled.div<ImageMetaElProps>`
  color: rgb(255, 255, 255, 0.96);
  display: flex;
  text-shadow: ${props => textShadow(props.shadowColor || 'black')};
  user-select: none;
  opacity: ${R.prop('opacity')};
  transition: opacity 1.2s ease-in;

  & a {
    color: rgb(255, 255, 255, 0.96);
    transition: all 0.15s ease-in-out;

    &:hover {
      text-shadow: 0px 0px 4px rgba(255, 255, 255, 1);
    }
  }
`;


// ----- Component -------------------------------------------------------------

export default class ImageMeta extends React.Component<ImageMetaProps> {
  state = {
    ready: false
  };

  componentWillMount() {
    events.on('photoReady', async () => {
      await sleep(800);
      this.setState(prevState => ({...prevState, ready: true}));
    });
  }

  render() {
    return (
      <PhotoContext.Consumer>{photo => {
        const opacity = this.state.ready ? 1 : 0;
        const shadowColor = photo ? photo.color : '';

        return (
          <ImageMetaEl className={this.props.className} shadowColor={shadowColor} opacity={opacity}>
            {this.props.children}
          </ImageMetaEl>
        );
      }}</PhotoContext.Consumer>
    );
  }
}

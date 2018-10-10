import {rgba} from 'polished';
import React from 'react';
import styled from 'react-emotion';

import PhotoContext from 'contexts/photo';
import events from 'lib/events';
import R from 'lib/ramda';
import {compositeTextShadow} from 'lib/typography';
import {sleep} from 'lib/utils';


export interface ImageMetaProps {
  className?: string;
}


// ----- Styled Elements -------------------------------------------------------

const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 8, rgba(color, 0.3)]
]);

export interface ImageMetaElProps {
  shadowColor: string;
  opacity: number;
}

const ImageMetaEl = styled.div<ImageMetaElProps>`
  color: rgb(255, 255, 255, 0.96);
  display: flex;
  text-shadow: ${R.pipe(R.prop('shadowColor'), textShadow)};
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

  componentDidMount() {
    events.on('photoReady', async () => {
      await sleep(1200);
      this.setState(prevState => ({...prevState, ready: true}));
    });
  }

  render() {
    return (
      <PhotoContext.Consumer>{photo => {
        // If the current photo doesn't have location information, render an empty
        // div. This ensures we maintain correct flexbox layout for other elements.
        if (!photo) {
          return <div></div>;
        }

        return (
          <ImageMetaEl className={this.props.className} shadowColor={R.prop('color', photo)} opacity={this.state.ready ? 1 : 0}>
            {this.props.children}
          </ImageMetaEl>
        );
      }}</PhotoContext.Consumer>
    );
  }
}

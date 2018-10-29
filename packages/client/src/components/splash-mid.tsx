import {rgba} from 'polished';
import * as R from 'ramda';
import styled from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import events from 'lib/events';
import {getPeriodDescriptor} from 'lib/time';
import storage from 'lib/storage';
import {compositeTextShadow} from 'lib/typography';
import {sleep} from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

const textShadow = (color: string) => compositeTextShadow([
  [0, 0, 2, rgba(0, 0, 0, 1)],
  [0, 0, 32, rgba(color, 0.3)],
  [0, 0, 96, rgba(color, 0.6)]
]);

export interface StyledSplashMidProps {
  color: string;
  opacity: number;
}

const StyledSplashMid = styled.div<StyledSplashMidProps>`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 28px;
  font-weight: 300;
  justify-content: center;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  opacity: ${R.propOr(1, 'opacity')};
  padding-bottom: 1.2em;
  text-shadow: ${R.pipe(R.prop('color'), textShadow)};
  transition: opacity 1.2s ease-in;
  user-select: none;
  z-index: 1;

  * {
    font-size: inherit;
    font-weight: inherit;
  }

  @media(min-width: 520px) {
    font-size: 38px;
  }

  @media(min-width: 640px) {
    font-size: 52px;
  }

  @media(min-width: 760px) {
    font-size: 64px;
  }

  @media(min-width: 860px) {
    font-size: 72px;
  }

  @media(min-width: 940px) {
    font-size: 80px;
  }

  @media(min-width: 1120px) {
    font-size: 96px;
  }
`;


// ----- Component -------------------------------------------------------------

export interface SplashMidState {
  /**
   * Optional name to use in the greeting.
   */
  name: string;

  /**
   * Ensures we extract the 'name' from storage before rendering the greeting to
   * avoid a flash of un... named... content.
   */
  ready: boolean;
}


export default class SplashMid extends React.Component<{}, SplashMidState> {
  state = {
    name: '',
    ready: false
  };


  /**
   * Adds a 'setName' method on the global object.
   */
  private installSetName() {
    if (!Reflect.has(window, 'setName')) {
      Object.defineProperty(window, 'setName', {
        value: (name: string) => {
          storage.setItem('name', name); // tslint:disable-line no-floating-promises
          this.setState({name});
        }
      });
    }
  }


  /**
   * Returns a standard greeting or a personalized greeting based on whether a
   * name has been set.
   */
  private get greeting() {
    const {name} = this.state;
    const period = getPeriodDescriptor();
    return name ? `Good ${period}, ${name}.` : `Good ${period}.`;
  }


  /**
   * - Installs 'setName' on window.
   * - Gets 'name' for greeting from local storage.
   * - Listens for the 'photoReady' event to render the greeting.
   */
  componentWillMount() {
    this.installSetName();

    storage.getItem<string>('name').then(name => { // tslint:disable-line no-floating-promises
      if (name) {
        this.setState({name});
      }
    });

    // Listen for the photoReady event and set our state to ready. This ensures
    // that the greeting renders after the photo has loaded.
    events.on('photoReady', async () => {
      await sleep(200);
      this.setState(prevState => ({...prevState, ready: true}));
    });
  }


  /**
   * Renders the component.
   */
  render() {
    return (
      <PhotoContext.Consumer>{photo => (
        <StyledSplashMid color={R.pathOr('black', ['color'], photo)} opacity={this.state.ready ? 1 : 0}>
          {this.greeting}
        </StyledSplashMid>
      )}</PhotoContext.Consumer>
    );
  }
}

import {rgba} from 'polished';
import styled from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import events from 'lib/events';
import {getPeriodDescriptor} from 'lib/time';
import R from 'lib/ramda';
import storage from 'lib/storage';
import {compositeTextShadow} from 'lib/typography';


// ----- Styled Elements -------------------------------------------------------

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
  font-size: 96px;
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
   * - Installs 'setName' on window.
   * - Listens for the 'photoReady' event to render the greeting.
   */
  componentWillMount() {
    this.installSetName();

    // Listen for the photoReady event and set our state to ready. This ensures
    // that the greeting renders after the photo has loaded.
    events.on('photoReady', () => {
      this.setState(prevState => ({...prevState, ready: true}));
    });
  }


  /**
   * - Fetches 'name' from storage and sets it in the component's state.
   */
  async componentDidMount() {
    const name = (await storage.getItem<string>('name')) || '';
    this.setState({name});
  }


  /**
   * Returns a standard greeting or a personalized greeting based on whether a
   * name has been set.
   */
  getGreeting() {
    if (this.state.name) {
      return `Good ${getPeriodDescriptor()}, ${this.state.name}.`;
    }

    return `Good ${getPeriodDescriptor()}.`;
  }


  /**
   * Renders the component.
   */
  render() {
    return (
      <PhotoContext.Consumer>{photo => (
        <StyledSplashMid color={R.pathOr('black', ['color'], photo)} opacity={this.state.ready ? 1 : 0}>
          {this.getGreeting()}
        </StyledSplashMid>
      )}</PhotoContext.Consumer>
    );
  }
}

import {rgba} from 'polished';
import {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'components/photo-context';
import {LooseObject} from 'etc/types';
import storage from 'lib/storage';
import {getPeriodDescriptor} from 'lib/time';


// ----- Styles ----------------------------------------------------------------

const textShadow = (color: string) => [
  `0px 0px 2px  ${rgba(0, 0, 0, 1)}`,
  `0px 0px 32px ${rgba(color, 0.3)}`,
  `0px 0px 96px ${rgba(color, 0.6)}`,
].join(', ');

const className = ({color, opacity}: LooseObject) => css`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 96px;
  font-weight: 300;
  justify-content: center;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  opacity: ${opacity || 1};
  padding-bottom: 1.2em;
  text-shadow: ${textShadow(color)};
  transition: opacity 1s ease-in-out;
  user-select: none;

  * {
    font-size: inherit;
    font-weight: inherit;
  }
`;


// ----- Component -------------------------------------------------------------

export interface SplashMidState {
  name: string;
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
  componentWillMount() {
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
   * Fetches any persisted 'name' from storage and sets it in the component's
   * state.
   */
  async componentDidMount() {
    const name = (await storage.getItem<string>('name')) || '';
    this.setState({name, ready: true});
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
      <PhotoContext.Consumer>{photo => {
        const color = photo ? photo.color : 'black';

        return (
          <div className={className({color, opacity: this.state.ready ? '1' : '0'})}>
            {this.getGreeting()}
          </div>
        );
      }}</PhotoContext.Consumer>
    );
  }
}

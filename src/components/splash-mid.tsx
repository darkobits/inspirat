import {css} from 'react-emotion';
import React from 'react';

import {LooseObject} from 'etc/types';
import storage from 'lib/storage';
import {getPeriodDescriptor} from 'lib/time';


// ----- Styles ----------------------------------------------------------------

const className = ({opacity}: LooseObject) => css`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 64px;
  font-weight: 300;
  justify-content: center;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  opacity: ${opacity || 1};
  text-shadow: 0px 0px 12px rgba(0, 0, 0, 0.72);
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
      <div className={className({opacity: this.state.ready ? '1' : '0'})}>
        {this.getGreeting()}
      </div>
    );
  }
}

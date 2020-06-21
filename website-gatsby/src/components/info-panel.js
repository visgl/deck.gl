/* eslint import/namespace: ['error', { allowComputed: true }] */
/* global window */
import React, {Component} from 'react';

import GenericInput from './input';
import Spinner from './spinner';

export default class InfoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {hasFocus: false};
    this._blurTimer = null;
  }

  _onFocus() {
    window.clearTimeout(this._blurTimer);
    this.setState({hasFocus: true});
  }

  _onBlur() {
    // New focus is not yet available when blur event fires.
    // Wait a bit and if no onfocus event is fired, remove focus
    this._blurTimer = window.setTimeout(() => {
      this.setState({hasFocus: false});
    }, 1);
  }

  render() {
    const {sourceLink, params, meta} = this.props;
    const {hasFocus} = this.state;

    return (
      <div
        className={`options-panel top-right ${hasFocus ? 'focus' : ''}`}
        tabIndex="0"
        onFocus={this._onFocus.bind(this)}
        onBlur={this._onBlur.bind(this)}
      >
        {this.props.children}

        {Object.keys(params).length > 0 && <hr />}

        {Object.keys(params)
          .sort()
          .map((name, i) => (
            <GenericInput
              key={`${i}-${name}`}
              name={name}
              {...params[name]}
              onChange={this.props.updateParam}
            />
          ))}

        {sourceLink && (<div className="source-link">
            <a href={sourceLink} target="_new">View Code ↗</a>
          </div>)}

        <Spinner meta={meta} />
      </div>
    );
  }
}

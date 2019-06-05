/* eslint import/namespace: ['error', { allowComputed: true }] */
/* global window */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';

import GenericInput from './input';
import Spinner from './spinner';
import * as Demos from './demos';
import {updateParam} from '../actions/app-actions';

class InfoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {hasFocus: false};
    this._blurTimer = null;
  }

  @autobind
  _onFocus() {
    window.clearTimeout(this._blurTimer);
    this.setState({hasFocus: true});
  }

  @autobind
  _onBlur() {
    // New focus is not yet available when blur event fires.
    // Wait a bit and if no onfocus event is fired, remove focus
    this._blurTimer = window.setTimeout(() => {
      this.setState({hasFocus: false});
    }, 1);
  }

  render() {
    const {demo, params, owner, meta} = this.props;
    const {hasFocus} = this.state;
    const DemoComponent = Demos[demo];
    const metaLoaded = owner === demo ? meta : {};

    return (
      <div
        className={`options-panel top-right ${hasFocus ? 'focus' : ''}`}
        tabIndex="0"
        onFocus={this._onFocus}
        onBlur={this._onBlur}
      >
        {DemoComponent.renderInfo(metaLoaded)}

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

        {this.props.children}

        <Spinner meta={metaLoaded} />
      </div>
    );
  }
}

export default connect(
  state => state.vis,
  {updateParam}
)(InfoPanel);

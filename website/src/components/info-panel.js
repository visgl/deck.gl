/* eslint import/namespace: ['error', { allowComputed: true }] */
/* global setTimeout, clearTimeout */
import React, {Component} from 'react';
import styled from 'styled-components';
import {InfoPanel} from 'gatsby-theme-ocular/components';

import GenericInput from './input';
import Spinner from './spinner';

const InfoPanelContent = styled.div`
hr {
  margin: 12px -24px;
}
a {
  text-decoration: none;
  display: inline;
  color: ${props => props.theme.colors.primary};
}
p {
  margin-bottom: 16px;
}
.legend {
  display: inline-block;
  width: 12px;
  height: 12px;
}
.stat {
  text-transform: uppercase;
  font-size: 0.833em;

  b {
    display: block;
    font-size: 3em;
    font-weight: bold;
    line-height: 1.833;
  }
}
hr {
  border: none;
  background: ${props => props.theme.colors.mono400};
  height: 1px;
}
.layout {
  display: table;
  width: 100%;

  >* {
    display: table-cell !important;
  }
  .col-1-3 {
    width: 33.33%;
  }
  .col-1-2 {
    width: 50%;
  }
  .text-right {
    text-align: right;
  }
}
`;

export default class ExampleInfoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {hasFocus: false};
    this._blurTimer = null;
  }

  _onFocus() {
    clearTimeout(this._blurTimer);
    this.setState({hasFocus: true});
  }

  _onBlur() {
    // New focus is not yet available when blur event fires.
    // Wait a bit and if no onfocus event is fired, remove focus
    this._blurTimer = setTimeout(() => {
      this.setState({hasFocus: false});
    }, 1);
  }

  render() {
    const {title, sourceLink, params, meta} = this.props;
    const {hasFocus} = this.state;

    return (
      <InfoPanel title={title} sourceLink={sourceLink}>
        <InfoPanelContent>
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
        </InfoPanelContent>

        <Spinner meta={meta} />
      </InfoPanel>
    );
  }
}

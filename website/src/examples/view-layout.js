// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component, createRef} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'website-examples/view-layout/app';

import {makeExample} from '../components';

class ViewLayoutDemo extends Component {
  constructor(props) {
    super(props);
    this._containerRef = createRef();
  }

  componentDidMount() {
    this._view = renderToDOM(this._containerRef.current);
  }

  componentWillUnmount() {
    if (this._view) {
      this._view.remove();
    }
  }

  render() {
    return <div ref={this._containerRef} style={{width: '100%', height: '100%'}} />;
  }
}

ViewLayoutDemo.title = 'Declarative View Layout';

ViewLayoutDemo.code = `${GITHUB_TREE}/examples/website/view-layout`;

ViewLayoutDemo.renderInfo = function renderInfo() {
  return (
    <div>
      <p>
        A multi-view deck.gl scene built from a declarative row, column, and overlay layout tree.
      </p>
    </div>
  );
};

export default makeExample(ViewLayoutDemo);

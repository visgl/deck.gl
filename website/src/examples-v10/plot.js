// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {Parser} from 'expr-eval';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/plot/app';
import {_memoize as memoize} from '@deck.gl/core';

import {makeExample} from '../components';

/** Provides evaluate equation for the example. */
const evaluateEquation = memoize(({value}) => {
  try {
    /** Provides p for the example. */
    const p = Parser.parse(value);
    return {
      valid: true,
      func: (x, y) => p.evaluate({x, y}),
      text: p.toString()
    };
  } catch (err) {
    return {valid: false};
  }
});

/** Connects the Arrow plot example to the website controls. */
class PlotDemo extends Component {
  /** Title shown above the example controls. */
  static title = '3D Surface Explorer';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/plot`;

  /** Interactive controls and their initial values. */
  static parameters = {
    equation: {displayName: 'Z = f(x, y)', type: 'text', value: 'sin(x ^ 2 + y ^ 2) * x / 3.14'},
    resolution: {
      displayName: 'Resolution',
      type: 'range',
      value: 200,
      step: 10,
      min: 10,
      max: 1000
    },
    showAxis: {displayName: 'Grid', type: 'checkbox', value: true}
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Surface plot from a mathematical equation</p>
        <p>Hover on the plot to see the values</p>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      equation: {}
    };
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params: resolution, show axis, equation for the example. */
    const {
      params: {resolution, showAxis, equation}
    } = this.props;

    /** Provides evaluated equation for the example. */
    const evaluatedEquation = evaluateEquation(equation);

    return (
      <App
        equation={evaluatedEquation.valid ? evaluatedEquation.func : null}
        resolution={resolution.value}
        showAxis={showAxis.value}
      />
    );
  }
}

export default makeExample(PlotDemo);

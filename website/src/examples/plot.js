import React, {Component} from 'react';
import {Parser} from 'expr-eval';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/plot/app';
import {_memoize as memoize} from '@deck.gl/core';

import {makeExample} from '../components';

const evaluateEquation = memoize(({value}) => {
  try {
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

class PlotDemo extends Component {
  static title = '3D Surface Explorer';

  static code = `${GITHUB_TREE}/examples/website/plot`;

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

  render() {
    const {
      params: {resolution, showAxis, equation}
    } = this.props;

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

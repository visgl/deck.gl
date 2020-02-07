import React, {Component} from 'react';
import {Parser} from 'expr-eval';
import App from 'website-examples/plot/app';

export default class PlotDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {
      equation: {displayName: 'Z = f(x, y)', type: 'text', value: 'sin(x ^ 2 + y ^ 2) * x / 3.14'},
      resolution: {displayName: 'Resolution', type: 'range',
        value: 200, step: 10, min: 10, max: 1000},
      showAxis: {displayName: 'Grid', type: 'checkbox', value: true}
    };
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>3D Surface Explorer</h3>
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

  componentWillReceiveProps(nextProps) {
    const {equation} = nextProps.params;
    if (equation && equation !== this.props.params.equation) {
      const expression = equation.value;
      try {
        const p = Parser.parse(expression);
        this.setState({
          equation: {
            valid: true,
            func: (x, y) => p.evaluate({x, y}),
            text: p.toString()
          }
        });
      } catch (err) {
        this.setState({
          equation: {valid: false}
        });
      }
    }
  }

  render() {
    const {
      params: {resolution, showAxis}
    } = this.props;
    const {equation, hoverInfo} = this.state;

    return (
      <App
        equation={equation.valid ? equation.func : null}
        resolution={resolution.value}
        showAxis={showAxis.value} />
    );
  }
}

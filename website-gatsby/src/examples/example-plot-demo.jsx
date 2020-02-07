import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {GITHUB_TREE} from '../constants/defaults';
import App from '../../../examples/website/plot/app';
import {Parser} from 'expr-eval';

export default class PlotDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expression: 'sin(x ^ 2 + y ^ 2) * x / 3.14',
      equation: {valid: false},
      resolution: 200,
      showAxis: true
    };

    this._evalEquation = this._evalEquation.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    this._evalEquation(this.state.expression);
  }

  _evalEquation(expression) {
    try {
      const p = Parser.parse(expression);
      this.setState({
        equation: {
          valid: true,
          func: (x, y) => p.evaluate({x, y})
        }
      });
    } catch (err) {
      this.setState({
        equation: {valid: false}
      });
    }
  }

  _handleChange(event) {
    switch (event.target.name) {
      case 'expression':
        this.setState({expression: event.target.value});
        this._evalEquation(event.target.value);
        break;
      case 'resolution':
        this.setState({resolution: parseInt(event.target.value)});
        break;
      case 'show-axis':
        this.setState({showAxis: event.target.checked});
        break;
    }
  }

  render() {
    const {expression, equation, resolution, showAxis} = this.state;

    return (
      <div>
        <App
          equation={equation.valid ? equation.func : null}
          resolution={resolution}
          showAxis={showAxis}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>3D Surface Explorer</h3>
          <p>Surface plot from a mathematical equation</p>
          <p>Hover on the plot to see the values</p>

          <hr />

          <div className="input">
            <label>Z = f(x, y)</label>
            <input name="expression" type="text" value={expression} onChange={this._handleChange} />
          </div>
          <div className="input">
            <label>Resolution</label>
            <input
              name="resolution"
              type="range"
              step="10"
              min="10"
              max="1000"
              value={resolution}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Grid</label>
            <input
              name="show-axis"
              type="checkbox"
              checked={showAxis}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

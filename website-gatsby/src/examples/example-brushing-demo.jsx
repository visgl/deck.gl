import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App, {inFlowColors, outFlowColors} from '../../../examples/website/brushing/app';

const colorRamp = inFlowColors
  .slice()
  .reverse()
  .concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class BrushingDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      enableBrushing: true,
      strokeWidth: 1,
      opacity: 0.4,
      brushRadius: 200000,
      count: 0,
      flowCount: 0
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(`${DATA_URI}/arc-data.txt`, '/workers/arc-data-decoder.js', (response, meta) => {
      this.setState({
        data: response,
        count: meta.count,
        flowCount: meta.flowCount
      });
    });
  }

  _handleChange(event) {
    switch (event.target.name) {
      case 'enable-brushing':
        this.setState({enableBrushing: event.target.checked});
        break;
      case 'stroke-width':
        this.setState({strokeWidth: parseInt(event.target.value)});
        break;
      case 'opacity':
        this.setState({opacity: parseFloat(event.target.value)});
        break;
      case 'brush-radius':
        this.setState({brushRadius: parseInt(event.target.value)});
        break;
    }
  }

  render() {
    const {data, enableBrushing, strokeWidth, opacity, brushRadius, count, flowCount} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.LIGHT}
          data={data}
          enableBrushing={enableBrushing}
          strokeWidth={strokeWidth}
          brushRadius={brushRadius}
          opacity={opacity}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>United States County-to-county Migration</h3>
          <p>People moving in and out of counties between 2009-2013</p>

          <div className="layout">
            {colorRamp.map((c, i) => (
              <div
                key={i}
                className="legend"
                style={{background: c, width: `${100 / colorRamp.length}%`}}
              />
            ))}
          </div>
          <p className="layout">
            <span className="col-1-2">Net gain</span>
            <span className="col-1-2 text-right">Net loss</span>
          </p>

          <p>
            Data source: <a href="http://www.census.gov">US Census Bureau</a>
          </p>

          <div className="layout">
            <div className="stat col-1-2">
              No. of Counties<b>{count}</b>
            </div>
            <div className="stat col-1-2">
              No. of Arcs<b>{readableInteger(flowCount)}</b>
            </div>
          </div>
          <hr />
          <div className="input">
            <label>Brush Radius</label>
            <input
              name="brush-radius"
              type="range"
              value={brushRadius}
              step="1000"
              min="50000"
              max="1000000"
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Enable Brushing</label>
            <input
              name="enable-brushing"
              type="checkbox"
              checked={enableBrushing}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Width</label>
            <input
              name="stroke-width"
              type="range"
              step="1"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>Arc Opacity</label>
            <input
              name="opacity"
              type="range"
              step="0.01"
              min="0"
              max="1"
              value={opacity}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/screen-grid/app';

export default class ScreengridDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataCount: 0,
      dataSample: [],
      cellSize: 5,
      gpuAggregation: true
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/screen-grid-data-uber-pickups-nyc.txt`,
      '/workers/screen-grid-data-decoder.js',
      (response, meta) => {
        this.setState({
          data: response,
          dataCount: meta.count
        });
      }
    );
  }

  _handleChange(event) {
    switch (event.target.name) {
      case 'cell-size':
        this.setState({cellSize: parseInt(event.target.value)});
        break;
      case 'gpu-aggregation':
        this.setState({gpuAggregation: event.target.checked});
        break;
    }
  }

  render() {
    const {data, dataCount, cellSize, gpuAggregation} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          data={data}
          cellSize={cellSize}
          gpuAggregation={gpuAggregation}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Uber Pickup Locations In NewYork City</h3>
          <p>Pickup locations form April to September 2014.</p>
          <p>
            The layer aggregates data within the boundary of screen grid cells and maps the
            aggregated values to a dynamic color scale
          </p>
          <p>
            Data source:{' '}
            <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">
              Uber TLC FOIL Response
            </a>
          </p>
          <div className="stat">
            No. of Samples<b>{readableInteger(dataCount)}</b>
          </div>
          <hr />
          <div className="input">
            <label>Cell Size</label>
            <input
              name="cell-size"
              type="range"
              step="1"
              min="1"
              max="20"
              value={cellSize}
              onChange={this._handleChange}
            />
          </div>
          <div className="input">
            <label>GPU Acceleration</label>
            <input
              name="gpu-aggregation"
              type="checkbox"
              checked={gpuAggregation}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

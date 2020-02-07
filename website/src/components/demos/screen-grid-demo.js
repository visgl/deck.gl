import React, {Component} from 'react';
import autobind from 'autobind-decorator';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import App from 'website-examples/screen-grid/app';

export default class ScreenGridDemo extends Component {

  static get data() {
    return {
      url: `${DATA_URI}/screen-grid-data-uber-pickups-nyc.txt`,
      worker: 'workers/screen-grid-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      gpuAggregation: {displayName: 'GPU Acceleration', type: 'checkbox', value: true},
      cellSize: {displayName: 'Cell Size', type: 'range', value: 5, step: 1, min: 1, max: 20}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Uber Pickup Locations In NewYork City</h3>
        <p>Pickup locations form April to September 2014.</p>
        <p>The layer aggregates data within the boundary of screen grid cells
           and maps the aggregated values to a dynamic color scale</p>
        <p>Data source: <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">Uber TLC FOIL Response</a></p>
        <div className="stat">No. of Samples<b>{ readableInteger(meta.count || 0) }</b></div>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      disableGPUAggregation: false,
      dataSample: this._sampleData(props.data)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && this.state.disableGPUAggregation) {
      this.setState({
        dataSample: this._sampleData(nextProps.data)
      });
    }
  }

  // get a subset of the data if GPU aggregation is not supported
  _sampleData(data) {
    if (!data) {
      return null;
    }
    const DATA_SAMPLE_SIZE = 1e5;
    const result = new Array(DATA_SAMPLE_SIZE);
    const stride = Math.floor(data.length / DATA_SAMPLE_SIZE);
    for (let i = 0; i < DATA_SAMPLE_SIZE; i++) {
      result[i] = data[i * stride];
    }
    this.props.onStateChange({count: DATA_SAMPLE_SIZE});
    return result;
  }

  @autobind
  _disableGPUAggregation() {
    this.props.useParams({
      gpuAggregation: {displayName: 'GPU Acceleration (not supported)', type: 'checkbox', value: false, disabled: true},
      cellSize: {displayName: 'Cell Size', type: 'range', value: 5, step: 1, min: 1, max: 20}
    });
    this.setState({
      disableGPUAggregation: true,
      dataSample: this._sampleData(this.props.data)
    });
  }

  render() {
    const {params, data} = this.props;
    const cellSize = params.cellSize.value;
    const gpuAggregation = params.gpuAggregation.value;

    return (
      <App
        {...this.props}
        data={this.state.dataSample || data}
        cellSize={cellSize}
        gpuAggregation={gpuAggregation}
        disableGPUAggregation={this._disableGPUAggregation} />
    );
  }
}

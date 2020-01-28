import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/heatmap/app';

export default class HeatmapDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataCount: 0,
      radiusPixels: 5,
      intensity: 1,
      threshold: 0.03
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
      case 'radius':
        this.setState({radiusPixels: parseInt(event.target.value)});
        break;
      case 'intensity':
        this.setState({intensity: parseFloat(event.target.value)});
        break;
      case 'threshold':
        this.setState({threshold: parseFloat(event.target.value)});
        break;
    }
  }

  render() {
    const {data, dataCount, radiusPixels, intensity, threshold} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          data={data}
          intensity={intensity}
          threshold={threshold}
          radiusPixels={radiusPixels}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Uber Pickup Locations In NewYork City</h3>
          <p>Pickup locations form April to September 2014.</p>
          <div>
            <img src="/images/colorbrewer_YlOrRd_6.png" style={{height: 8, width: '100%'}} />
          </div>
          <p className="layout">
            <span className="col-1-2">Fewer</span>
            <span className="col-1-2 text-right">More</span>
          </p>
          <p>
            Data source:{' '}
            <a href="https://github.com/fivethirtyeight/uber-tlc-foil-response">
              Uber TLC FOIL Response
            </a>
          </p>
          <div className="stat">
            No. of Samples
            <b>{readableInteger(dataCount)}</b>
          </div>

          <hr />

          <div className="input">
            <label>Radius</label>
            <input
              name="radius"
              type="range"
              step="1"
              min="1"
              max="50"
              value={radiusPixels}
              onChange={this._handleChange}
            />
          </div>

          <div className="input">
            <label>Intensity</label>
            <input
              name="intensity"
              type="range"
              step="0.1"
              min="0"
              max="5"
              value={intensity}
              onChange={this._handleChange}
            />
          </div>

          <div className="input">
            <label>Threshold</label>
            <input
              name="threshold"
              type="range"
              step="0.03"
              min="0"
              max="1"
              value={threshold}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

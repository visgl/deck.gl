import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/3d-heatmap/app';

export default class HexagonDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataCount: 0,
      radius: 2000,
      coverage: 0.7,
      upperPercentile: 100,
      hoveredObject: null
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/heatmap-data.txt`,
      '/workers/heatmap-data-decoder.js',
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
        this.setState({radius: parseFloat(event.target.value)});
        break;
      case 'coverage':
        this.setState({coverage: parseFloat(event.target.value)});
        break;
      case 'upper-percentile':
        this.setState({upperPercentile: parseFloat(event.target.value)});
        break;
    }
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }

    const lat = hoveredObject.position[1];
    const lng = hoveredObject.position[0];
    const count = hoveredObject.points.length;

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        <div>{`latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}`}</div>
        <div>{`longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}`}</div>
        <div>{`${count} Accidents`}</div>
      </div>
    );
  }

  render() {
    const {data, dataCount, radius, coverage, upperPercentile} = this.state;
    const colorRamp = App.defaultColorRange.slice().map(color => `rgb(${color.join(',')})`);

    return (
      <div>
        {this._renderTooltip()}
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          data={data}
          radius={radius}
          upperPercentile={upperPercentile}
          coverage={coverage}
          onHover={this._onHover.bind(this)}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>United Kingdom Road Safety</h3>
          <p>Personal injury road accidents in GB from 1979</p>
          <p>The layer aggregates data within the boundary of each hexagon cell</p>

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
            <span className="col-1-2">Fewer Accidents</span>
            <span className="col-1-2 text-right">More Accidents</span>
          </p>

          <p>
            Data source: <a href="https://data.gov.uk">DATA.GOV.UK</a>
          </p>

          <div className="layout">
            <div className="stat col-1-2">
              Accidents
              <b>{readableInteger(dataCount)}</b>
            </div>
          </div>

          <hr />

          <div className="input">
            <label>Coverage</label>
            <input
              name="coverage"
              type="range"
              step="0.1"
              min="0"
              max="1"
              value={coverage}
              onChange={this._handleChange}
            />
          </div>

          <div className="input">
            <label>Radius</label>
            <input
              name="radius"
              type="range"
              step="100"
              min="500"
              max="20000"
              value={radius}
              onChange={this._handleChange}
            />
          </div>

          <div className="input">
            <label>Upper Percentile</label>
            <input
              name="upper-percentile"
              type="range"
              step="0.1"
              min="80"
              max="100"
              value={upperPercentile}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

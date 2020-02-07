import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/trips/app';

export default class TripLayerDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tripsData: [],
      tripCount: 0,
      buildingData: [],
      buildingCount: 0,
      vertCount: 0,
      triangleCount: 0,
      trailLength: 180
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/trips-data.txt`,
      '/workers/trips-data-decoder.js?loop=1800&trail=180',
      (response, meta) => {
        this.setState({
          tripsData: response,
          tripCount: meta.trips,
          vertCount: meta.vertices
        });
      }
    );
    loadData(
      `${DATA_URI}/building-data.txt`,
      '/workers/building-data-decoder.js',
      (response, meta) => {
        this.setState({
          buildingData: response,
          buildingCount: meta.buildings,
          triangleCount: meta.triangles
        });
      }
    );
  }

  _handleChange(event) {
    this.setState({trailLength: parseInt(event.target.value)});
  }

  render() {
    const {
      tripsData,
      tripCount,
      buildingData,
      buildingCount,
      vertCount,
      triangleCount,
      trailLength
    } = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          trips={tripsData}
          buildings={buildingData}
          trailLength={trailLength}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Yellow Cab Vs. Green Cab Trips in Manhattan</h3>
          <p>Trips are taken from June 16, 2016 21:00 to 21:30</p>
          <p>
            Trip data source:&nbsp;
            <a href="http://www.nyc.gov/html/tlc/html/about/trip_record_data.shtml">
              NYC Taxi & Limousine Commission Trip Records
            </a>
          </p>
          <p>
            Building data source:&nbsp;
            <a href="http://openstreetmap.org">OpenStreetMap</a> via&nbsp;
            <a href="https://mapzen.com/">Mapzen Vector Tiles API</a>
          </p>
          <div className="layout">
            <div className="stat col-1-2">
              No. of Trips
              <b>{readableInteger(tripCount)}</b>
            </div>
            <div className="stat col-1-2">
              No. of Buildings
              <b>{readableInteger(buildingCount)}</b>
            </div>
          </div>
          <div className="layout">
            <div className="stat col-1-2">
              Vertices
              <b>{readableInteger(vertCount + triangleCount * 3)}</b>
            </div>
          </div>
          <hr />
          <div className="input">
            <label>Trail</label>
            <input
              name="trail"
              type="range"
              step="1"
              min="10"
              max="200"
              value={trailLength}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

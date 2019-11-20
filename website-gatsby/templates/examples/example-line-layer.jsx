import React, {Component} from 'react';
import InfoPanel from '../../src/components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../../src/constants/defaults';
import {loadData} from '../../src/utils/data-utils';
import {readableInteger} from '../../src/utils/format-utils';
import App from '../../../examples/website/line/app';

export default class LineDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 3,
      airportsData: [],
      flightData: [],
      flightDataCount: 0
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    loadData(`${DATA_URI}/airports.json`, null, (response, meta) => {
      this.setState({
        airportsData: response
      });
    });
    loadData(
      `${DATA_URI}/flight-path-data.txt`,
      '/workers/flight-path-data-decoder.js',
      (response, meta) => {
        this.setState({
          flightData: response,
          flightDataCount: meta.count
        });
      }
    );
  }

  handleChange(event) {
    this.setState({width: parseFloat(event.target.value)});
  }

  render() {
    const {width, flightData, flightDataCount, airportsData} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          getWidth={width}
          flightPaths={flightData}
          airports={airportsData}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Flights To And From London Heathrow Airport</h3>
          <p>Flight paths in a 6-hour window</p>
          <p>From 08:32:43 GMT to 14:32:43 GMT on March 28th, 2017</p>
          <p>
            Flight path data source:
            <a href="https://opensky-network.org/"> The OpenSky Network</a>
            <br />
            Airport location data source:
            <a href="http://www.naturalearthdata.com/"> Natural Earth</a>
          </p>
          <div className="stat">
            No. of Line Segments<b>{readableInteger(flightDataCount)}</b>
          </div>
          <hr />
          <div className="input">
            <label>Width</label>
            <input
              name="width"
              type="range"
              step="0.1"
              min="0"
              max="10"
              value={width}
              onChange={this.handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

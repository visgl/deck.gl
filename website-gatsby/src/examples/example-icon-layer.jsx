import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/icon/app';

export default class IconDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataCount: 0,
      cluster: true
    };

    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    loadData(`${DATA_URI}/meteorites.txt`, '/workers/meteorites-decoder.js', (response, meta) => {
      this.setState({
        data: response,
        dataCount: meta.count
      });
    });
  }

  _handleChange(event) {
    this.setState({cluster: event.target.checked});
  }

  render() {
    const {data, dataCount, cluster} = this.state;

    return (
      <div>
        <App
          mapStyle={MAPBOX_STYLES.DARK}
          data={data}
          iconAtlas={`${DATA_URI}/../examples/icon/location-icon-atlas.png`}
          iconMapping={`${DATA_URI}/../examples/icon/location-icon-mapping.json`}
          showCluster={cluster}
        />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Meteorites Landings</h3>
          <p>
            Data set from The Meteoritical Society showing information on all of the known meteorite
            landings.
          </p>
          <p>Hover on a pin to see the list of names</p>
          <p>Click on a pin to see the details</p>
          <p>
            Data source:
            <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh"> NASA</a>
          </p>
          <div className="layout">
            <div className="stat col-1-2">
              No. of Meteorites
              <b>{readableInteger(dataCount || 0)}</b>
            </div>
          </div>

          <hr />

          <div className="input">
            <label>Cluster</label>
            <input
              name="coverage"
              type="checkbox"
              checked={cluster}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

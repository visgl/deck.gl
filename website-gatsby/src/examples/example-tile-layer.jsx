import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from '../../../examples/website/map-tile/app';

export default class TextLayerDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoHighlight: true
    };

    this._handleChange = this._handleChange.bind(this);
  }

  _handleChange(event) {
    this.setState({autoHighlight: event.target.checked});
  }

  render() {
    const {autoHighlight} = this.state;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.BLANK} autoHighlight={autoHighlight} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Raster Map Tiles</h3>
          <p>
            OpenStreetMap data source:
            <a href="https://en.wikipedia.org/wiki/OpenStreetMap"> Wiki </a> and
            <a href="https://wiki.openstreetmap.org/wiki/Tile_servers"> Tile Servers </a>
          </p>
          <hr />
          <div className="input">
            <label>Highlight on hover</label>
            <input
              name="autoHighlight"
              type="checkbox"
              checked={autoHighlight}
              onChange={this._handleChange}
            />
          </div>
        </InfoPanel>
      </div>
    );
  }
}

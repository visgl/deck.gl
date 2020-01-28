import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from '../../../examples/website/3d-tiles/app';

export default class Tile3DDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attributions: []
    };

    this._updateAttributions = this._updateAttributions.bind(this);
  }

  _updateAttributions(attributions) {
    this.setState({attributions: attributions});
  }

  render() {
    const {attributions} = this.state;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.DARK} updateAttributions={this._updateAttributions} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <div style={{textAlign: 'center', borderStyle: 'groove', marginTop: '0.5cm'}}>
            {Boolean(attributions.length) && <b>Tileset Credentials</b>}
            {attributions.map(attribution => (
              <div key={attribution.html} dangerouslySetInnerHTML={{__html: attribution.html}} />
            ))}
          </div>
        </InfoPanel>
      </div>
    );
  }
}

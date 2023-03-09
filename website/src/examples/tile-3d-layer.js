import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/3d-tiles/app';

import {makeExample} from '../components';

class Tiles3DDemo extends Component {
  static title = 'City of Melbourne 3D Point Cloud';

  static code = `${GITHUB_TREE}/examples/website/3d-tiles`;

  static parameters = {};

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    if (!meta.attributions) {
      return null;
    }
    const {attributions} = meta;
    return (
      <div style={{marginTop: '0.5cm'}}>
        <div style={{textAlign: 'center', borderStyle: 'groove'}}>
          {Boolean(attributions.length) && <b>Tileset Credentials</b>}
          {attributions.map(attribution => (
            // eslint-disable-next-line react/no-danger
            <div key={attribution.html} dangerouslySetInnerHTML={{__html: attribution.html}} />
          ))}
        </div>
      </div>
    );
  }

  _updateAttributions = attributions => {
    this.props.onStateChange({attributions});
  };

  render() {
    return <App {...this.props} updateAttributions={this._updateAttributions} />;
  }
}

export default makeExample(Tiles3DDemo);

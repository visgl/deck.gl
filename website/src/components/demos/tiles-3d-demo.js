import React, {Component} from 'react';
import autobind from 'autobind-decorator';
import {MAPBOX_STYLES} from '../../constants/defaults';
import App from 'website-examples/3d-tiles/app';

export default class GeoJsonDemo extends Component {
  static get data() {
    return [];
  }

  static get parameters() {
    return {};
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

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
            <div key={attribution.html} dangerouslySetInnerHTML={{__html: attribution.html}} />
          ))}
        </div>
      </div>
    );
  }

  @autobind
  _updateAttributions(attributions) {
    this.props.onStateChange({attributions});
  }

  render() {
    return <App {...this.props} updateAttributions={this._updateAttributions} />;
  }
}

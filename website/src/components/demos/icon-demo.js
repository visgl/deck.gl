import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import App from 'website-examples/icon/app';

export default class IconDemo extends Component {

  static get data() {
    return {
      url: `${DATA_URI}/meteorites.txt`,
      worker: 'workers/meteorites-decoder.js'
    };
  }

  static get parameters() {
    return {
      cluster: {displayName: 'Cluster', type: 'checkbox', value: true}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.DARK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Meteorites Landings</h3>
        <p>Data set from The Meteoritical Society showing information on all of
          the known meteorite landings.</p>
        <p>Hover on a pin to see the list of names</p>
        <p>Click on a pin to see the details</p>
        <p>Data source:
          <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh"> NASA</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">No. of Meteorites
            <b>{ readableInteger(meta.count || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;

    return (
      <div className= "icon-demo">
        <App
          {...otherProps}
          data={data}
          iconAtlas={`${DATA_URI}/../examples/icon/location-icon-atlas.png`}
          iconMapping={`${DATA_URI}/../examples/icon/location-icon-mapping.json`}
          showCluster={params.cluster.value} />
      </div>
    );
  }
}

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import TagmapOverlay from '../../../../examples/tagmap/deckgl-overlay';

function stopPropagation(evt) {
  evt.stopPropagation();
}

export default class TextDemo extends Component {

  static get data() {
    return {
      url: 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json'
      // url: `${DATA_URI}/meteorites.txt`,
      // worker: 'workers/meteorites-decoder.js'
    };
  }

  static get parameters() {
    return {
      weightThreshold: {displayName: 'Weight Threshold',
        type: 'range', value: 1, step: 0.1, min: 0.1, max: 10}
    };
  }

  static get viewport() {
    return {
      ...TagmapOverlay.defaultViewport,
      dragToRotate: false,
      mapStyle: MAPBOX_STYLES.DARK
    };
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
          <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh">NASA</a>
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
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    return (
      <div className="text-demo">
        <TagmapOverlay viewport={viewport}
          data={data}
          weightThreshold={params.weightThreshold.value} />
      </div>
    );
  }
}

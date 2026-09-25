// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App, {OLD_MAPS} from 'website-examples/old-maps/app';

import {makeExample} from '../components';

const getLabel = map => `${map.place}, ${map.date}`;
const MAPS_BY_LABEL = Object.fromEntries(OLD_MAPS.map(map => [getLabel(map), map]));

class BitmapLayerDemo extends Component {
  static title = 'A Tour of Old Maps';

  static hasDeviceTabs = true;

  static code = `${GITHUB_TREE}/examples/website/old-maps`;

  static parameters = {
    map: {
      displayName: 'Map',
      type: 'select',
      options: Object.keys(MAPS_BY_LABEL),
      value: getLabel(OLD_MAPS[0])
    },
    autoplay: {displayName: 'Autoplay', type: 'checkbox', value: true},
    opacity: {displayName: 'Opacity', type: 'range', value: 1, step: 0.05, min: 0, max: 1}
  };

  static renderInfo(meta) {
    const {map} = meta;
    return (
      <div>
        <p>
          Scanned historical maps, each drawn as a single image stretched over its geographic bounds
          with a BitmapLayer. Fade the opacity to compare the old city with the new.
        </p>
        {map && (
          <p>
            <i>{map.title}</i>
            <br />
            {map.author}, {map.date}
          </p>
        )}
        <p>
          Georeferenced on{' '}
          <a href={map ? `https://mapwarper.net/maps/${map.id}` : 'https://mapwarper.net'}>
            Map Warper
          </a>
          <br />
          Original source: Unknown
        </p>
      </div>
    );
  }

  componentDidMount() {
    this._updateInfo();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.map.value !== this.props.params.map.value) {
      this._updateInfo();
    }
  }

  _updateInfo() {
    this.props.onStateChange({map: MAPS_BY_LABEL[this.props.params.map.value]});
  }

  _onMapChange = map => {
    this.props.useParam({map: {...this.props.params.map, value: getLabel(map)}});
  };

  render() {
    const {params, device} = this.props;

    return (
      <App
        key={device?.type}
        device={device}
        mapId={MAPS_BY_LABEL[params.map.value].id}
        autoplay={params.autoplay.value}
        opacity={params.opacity.value}
        onMapChange={this._onMapChange}
      />
    );
  }
}

export default makeExample(BitmapLayerDemo);

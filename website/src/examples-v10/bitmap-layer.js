// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App, {OLD_MAPS} from 'v10-website-examples/old-maps/app';

import {makeExample} from '../components';

/** Provides get label for the example. */
const getLabel = map => `${map.place}, ${map.date}`;
/** Provides maps by label for the example. */
const MAPS_BY_LABEL = Object.fromEntries(OLD_MAPS.map(map => [getLabel(map), map]));

/** Connects the Arrow bitmap layer example to the website controls. */
class BitmapLayerDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'A Tour of Old Maps';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/old-maps`;

  /** Interactive controls and their initial values. */
  static parameters = {
    map: {
      displayName: 'Map',
      type: 'select',
      options: Object.keys(MAPS_BY_LABEL),
      value: getLabel(OLD_MAPS[0])
    },
    projection: {
      displayName: 'Projection',
      type: 'select',
      options: ['Mercator', 'Globe'],
      value: 'Mercator'
    },
    opacity: {displayName: 'Opacity', type: 'range', value: 1, step: 0.05, min: 0, max: 1}
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    /** Provides map for the example. */
    const {map} = meta;
    return (
      <div>
        <p>
          Scanned historical maps, each drawn as a single image stretched over its geographic bounds
          with a BitmapLayer. Fade the opacity to compare the old city with the new.
        </p>
        <p>
          Zoom out to find other maps and select a pin to fly there. Moving the map pauses the tour.
          Use the buttons at the bottom to resume it or skip ahead.
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

  /** Initializes the demo after its container mounts. */
  componentDidMount() {
    this._updateInfo();
  }

  /** Updates the demo when its inputs change. */
  componentDidUpdate(prevProps) {
    if (prevProps.params.map.value !== this.props.params.map.value) {
      this._updateInfo();
    }
  }

  /** Manages update info for the example. */
  _updateInfo() {
    this.props.onStateChange({map: MAPS_BY_LABEL[this.props.params.map.value]});
  }

  /** Manages on map change for the example. */
  _onMapChange = map => {
    this.props.useParam({map: {...this.props.params.map, value: getLabel(map)}});
  };

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, device for the example. */
    const {params, device} = this.props;

    return (
      <App
        key={device?.type}
        device={device}
        mapId={MAPS_BY_LABEL[params.map.value].id}
        opacity={params.opacity.value}
        projection={params.projection.value === 'Globe' ? 'globe' : 'mercator'}
        onMapChange={this._onMapChange}
      />
    );
  }
}

export default makeExample(BitmapLayerDemo);

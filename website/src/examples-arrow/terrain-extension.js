// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {FlyToInterpolator} from '@deck.gl/core';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'arrow-website-examples/terrain-extension/app';

import {makeExample} from '../components';

/** Provides locations for the example. */
const LOCATIONS = {
  'Day 5. Pau to Laruns': {
    latitude: 43.09822,
    longitude: -0.6194,
    zoom: 10
  },
  'Day 6. Tarbes to Cauterets': {
    latitude: 43.02905,
    longitude: 0.11472,
    zoom: 10
  },
  'Day 9. Saint-Leonard-de-Noblat to Puy de Dôme': {
    latitude: 45.82382,
    longitude: 2.2899,
    zoom: 8
  },
  'Day 13. Châtillon-sur to ChalaronneGrand Colombier': {
    latitude: 46.07586,
    longitude: 5.38004,
    zoom: 9
  },
  'Day 14. Annemasse to Morzine': {
    latitude: 46.14632,
    longitude: 6.45157,
    zoom: 9
  },
  'Day 15. Les Gets to Saint-Gervais Mont Blanc': {
    latitude: 45.90044,
    longitude: 6.49025,
    zoom: 9
  },
  'Day 17. Saint-Gervais Mont Blanc to Courchevel': {
    latitude: 45.89081,
    longitude: 6.66961,
    zoom: 9
  },
  'Day 20. Belfort to Le Markstein': {
    latitude: 47.8761,
    longitude: 6.9999,
    zoom: 10
  }
};

/** Connects the Arrow terrain extension example to the website controls. */
class TerrainExtensionDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Tour de France routes';

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/terrain-extension`;

  /** Interactive controls and their initial values. */
  static parameters = {
    location: {
      displayName: 'Route',
      type: 'select',
      options: Object.keys(LOCATIONS),
      value: 'Day 5. Pau to Laruns'
    },
    view: {
      displayName: 'View',
      type: 'select',
      options: ['MapView', 'GlobeView'],
      value: 'MapView'
    }
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.BLANK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>Reconstructed 3D terrain with official routes from Tour de France 2023.</p>
        <div>
          Data sources:
          <div>
            Cycling Stage{' '}
            <a href="https://www.cyclingstage.com/tour-de-france-2023-gpx/">Tour de France 2023</a>
          </div>
          <div>
            <a href="https://mapterhorn.com/attribution">Mapterhorn terrain</a>
          </div>
          <div>
            <a href="https://versatiles.org/sources/">VersaTiles satellite imagery</a>
          </div>
        </div>
      </div>
    );
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides location, view for the example. */
    const {location, view} = this.props.params;

    /** Provides initial view state for the example. */
    const initialViewState = {
      ...LOCATIONS[location.value],
      pitch: 45,
      maxPitch: 89,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator()
    };

    return (
      <div style={{background: '#111', width: '100%', height: '100%', position: 'absolute'}}>
        <App key={location.value} initialViewState={initialViewState} view={view.value} />
      </div>
    );
  }
}

export default makeExample(TerrainExtensionDemo);

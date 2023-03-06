import React, {Component} from 'react';
import {FlyToInterpolator} from '@deck.gl/core';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/terrain-extension/app';

import {makeExample} from '../components';

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

class TerrainExtensionDemo extends Component {
  static title = 'Tour de France routes';

  static code = `${GITHUB_TREE}/examples/website/terrain-extension`;

  static parameters = {
    location: {
      displayName: 'Route',
      type: 'select',
      options: Object.keys(LOCATIONS),
      value: 'Day 5. Pau to Laruns'
    }
  };

  static mapStyle = MAPBOX_STYLES.BLANK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Reconstructed 3D terrain with official routes from Tour de France 2023.</p>
        <p>
          Data sources:
          <div>
            Cycling Stage{' '}
            <a href="https://www.cyclingstage.com/tour-de-france-2023-gpx/">Tour de France 2023</a>
          </div>
        </p>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;
    const {location} = params;

    const initialViewState = LOCATIONS[location.value];
    initialViewState.pitch = 45;
    initialViewState.bearing = 10 * initialViewState.longitude;
    initialViewState.transitionDuration = 3000;
    initialViewState.transitionInterpolator = new FlyToInterpolator();

    return (
      <div style={{background: '#111', width: '100%', height: '100%', position: 'absolute'}}>
        <App {...otherProps} data={data} initialViewState={initialViewState} />
      </div>
    );
  }
}

export default makeExample(TerrainExtensionDemo);

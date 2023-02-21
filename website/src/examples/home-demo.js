import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../constants/defaults';
import App from 'website-examples/trips/app'; // eslint-disable-line

import {AmbientLight, DirectionalLight, LightingEffect} from '@deck.gl/core';

import {makeExample} from '../components';

class HomeDemo extends Component {
  static data = [
    {
      url: `${DATA_URI}/trips-data-s.txt`,
      worker: '/workers/trips-data-decoder.js?loop=1800&trail=180'
    },
    {
      url: `${DATA_URI}/building-data-s.txt`,
      worker: '/workers/building-data-decoder.js'
    }
  ];

  static mapStyle = MAPBOX_STYLES.LIGHT;

  constructor(props) {
    super(props);

    const material = {
      ambient: 0.2,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [232, 232, 247]
    };

    const lightingEffect = new LightingEffect({
      light1: new AmbientLight({
        color: [255, 255, 255],
        intensity: 1.0
      }),
      light2: new DirectionalLight({
        color: [255, 255, 255],
        intensity: 2.0,
        direction: [-1, -2, -3],
        _shadow: true
      })
    });

    lightingEffect.shadowColor = [0, 0, 0, 0.3];

    this.theme = {
      buildingColor: [232, 232, 247],
      trailColor0: [91, 145, 244],
      trailColor1: [115, 196, 150],
      material,
      effects: [lightingEffect]
    };

    this.initialViewState = {
      longitude: -74.012,
      latitude: 40.705,
      zoom: 14.5,
      pitch: 40,
      bearing: 0
    };
  }

  render() {
    const {data, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        trips={(data && data[0]) || null}
        buildings={(data && data[1]) || null}
        trailLength={180}
        animationSpeed={0.5}
        theme={this.theme}
        initialViewState={this.initialViewState}
      />
    );
  }
}

export default makeExample(HomeDemo, {isInteractive: false, style: {pointerEvents: 'none'}});

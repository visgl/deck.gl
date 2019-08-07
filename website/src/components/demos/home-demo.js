import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {App} from 'website-examples/trips/app';

import {AmbientLight, DirectionalLight, LightingEffect} from '@deck.gl/core';
import {PhongMaterial} from '@luma.gl/core';

const EMPTY_ARRAY = [];

export default class HomeDemo extends Component {
  static get data() {
    return [
      {
        url: `${DATA_URI}/trips-data-s.txt`,
        worker: 'workers/trips-data-decoder.js?loop=1800&trail=180'
      },
      {
        url: `${DATA_URI}/building-data-s.txt`,
        worker: 'workers/building-data-decoder.js'
      }
    ];
  }

  static get parameters() {
    return {};
  }

  static get mapStyle() {
    return MAPBOX_STYLES.LIGHT;
  }

  static get viewport() {
    return {
      longitude: -74.012,
      latitude: 40.705,
      zoom: 14.5,
      pitch: 40,
      bearing: 0
    };
  }

  static renderInfo(meta) {
    return null;
  }

  constructor(props) {
    super(props);

    const material = new PhongMaterial({
      ambient: 0.2,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [232, 232, 247]
    });

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
  }

  render() {
    const {data, params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        trips={(data && data[0]) || EMPTY_ARRAY}
        buildings={(data && data[1]) || EMPTY_ARRAY}
        trailLength={180}
        theme={this.theme}
      />
    );
  }
}

/* global, window */
import React, {Component, PropTypes} from 'react';
import DeckGL, {ScatterplotLayer} from 'deck.gl';

import WindLayer from './layers/wind-layer/wind-layer';
import ElevationLayer from './layers/elevation-layer/elevation-layer';
import ParticleLayer from './layers/particle-layer/particle-layer';

import {loadData} from './utils/load-data';
import {MARGIN, SAMPLE} from './defaults';

import TWEEN from 'tween.js';

const propTypes = {
  viewport: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

export default class WindDemo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: null
    };

    const particleState = {particleTime: 0};
    this._particleAnimation = new TWEEN.Tween(particleState)
      .to({particleTime: 60}, 1000)
      .onUpdate(() => this.setState(particleState))
      .repeat(Infinity);
  }

  componentDidMount() {
    loadData().then(data => {
      this.setState({data});
    });

    if (this.props.settings.showParticles) {
      this._particleAnimation.start();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {settings: {showParticles}} = nextProps;
    if (this.props.settings.showParticles !== showParticles) {
      if (showParticles) {
        this._particleAnimation.start();
      } else {
        this._particleAnimation.stop();
      }
    }
  }

  componentWillUnmount() {
    this._particleAnimation.stop();
  }

  render() {
    const {viewport, settings} = this.props;
    const {data} = this.state;

    if (!data) {
      return null;
    }

    const {stations, triangulation, texData, boundingBox} = data;

    // FIXME - calculate slice and bounding box when loaded, not in render
    const newStations = stations.slice(0, -SAMPLE);
    const originalBoundingBox = {
      minLng: boundingBox.minLng + MARGIN,
      maxLng: boundingBox.maxLng - MARGIN,
      minLat: boundingBox.minLat + MARGIN,
      maxLat: boundingBox.maxLat - MARGIN
    };

    const layers = [
      new ScatterplotLayer({
        id: 'stations',
        data: newStations,
        getPosition: d => [-d.long, d.lat, d.elv],
        getColor: d => [200, 200, 100],
        getRadius: d => 150,
        opacity: 0.2
      }),
      settings.showParticles && new ParticleLayer({
        id: 'particles',
        boundingBox,
        originalBoundingBox,
        texData,
        time: settings.time,
        zScale: 100
      }),
      settings.showWind && new WindLayer({
        id: 'wind',
        boundingBox,
        originalBoundingBox,
        dataBounds: texData.dataBounds,
        dataTextureArray: texData.textureArray,
        dataTextureSize: texData.textureSize,
        time: settings.time
      }),
      settings.showElevation && new ElevationLayer({
        id: 'elevation',
        boundingBox,
        triangulation,
        lngResolution: 200,
        latResolution: 100,
        zScale: 100
      })
      // FIXME - deck.gl should automatically cull null/false layers
    ].filter(Boolean);

    return (
      <DeckGL
        glOptions={{webgl2: true}}
        debug
        {...viewport}
        layers={layers} />
    );
  }
}

WindDemo.propTypes = propTypes;

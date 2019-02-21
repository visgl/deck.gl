/* global, window */
import React, {Component} from 'react';
import DeckGL, {ScatterplotLayer} from 'deck.gl';
import PropTypes from 'prop-types';
import {isWebGL2, registerShaderModules} from 'luma.gl';

import WindLayer from './layers/wind-layer/wind-layer';
import DelaunayCoverLayer from './layers/delaunay-cover-layer/delaunay-cover-layer';
import ParticleLayer from './layers/particle-layer/particle-layer';

import {loadData} from './utils/load-data';

import TWEEN from 'tween.js';

import fsfp32 from './shaderlib/fs-fp32/fs-fp32';
import fsproject from './shaderlib/fs-project/fs-project';
import fslighting from './shaderlib/fs-lighting/fs-lighting';

registerShaderModules([fsfp32, fsproject, fslighting]);

const propTypes = {
  viewport: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

const windLightSettings = {
  lightsPosition: [-60, 25, 15000, -140, 0, 400000],
  ambientRatio: 0.8,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

const elevationLightSettings = {
  lightsPosition: [-100, 25, 15000],
  ambientRatio: 0.2,
  diffuseRatio: 0.9,
  specularRatio: 0.2,
  lightsStrength: [1.0, 0.0],
  numberOfLights: 1
};

export default class WindDemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      webGL2Supported: true
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
    const {
      settings: {showParticles}
    } = nextProps;
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

  _onWebGLInitialized(gl) {
    const webGL2Supported = isWebGL2(gl);
    this.setState({webGL2Supported});
  }

  render() {
    const {data, webGL2Supported} = this.state;
    if (!webGL2Supported) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <h2> {"THIS DEMO REQUIRES WEBLG2, BUT YOUR BRWOSER DOESN'T SUPPORT IT"} </h2>
        </div>
      );
    }
    const {viewport, settings} = this.props;

    if (!data) {
      return null;
    }

    const {stations, triangulation, texData, bbox} = data;

    const layers = [
      new ScatterplotLayer({
        id: 'stations',
        data: stations,
        getPosition: d => [-d.long, d.lat, d.elv],
        getFillColor: d => [200, 200, 100],
        getRadius: d => 150,
        opacity: 0.2,
        radiusScale: 30
      }),
      settings.showParticles &&
        new ParticleLayer({
          id: 'particles',
          bbox,
          texData,
          time: settings.time,
          zScale: 100
        }),
      settings.showWind &&
        new WindLayer({
          id: 'wind',
          bbox,
          dataBounds: texData.dataBounds,
          dataTextureArray: texData.textureArray,
          dataTextureSize: texData.textureSize,
          time: settings.time,
          lightSettings: windLightSettings
        }),
      // settings.showElevation && new ElevationLayer({
      //   id: 'elevation',
      //   boundingBox,
      //   triangulation,
      //   lngResolution: 200,
      //   latResolution: 100,
      //   zScale: 100
      // })
      settings.showElevation &&
        new DelaunayCoverLayer({
          id: 'delaunay-cover',
          triangulation,
          lightSettings: elevationLightSettings
        })
      // FIXME - deck.gl should automatically cull null/false layers
    ].filter(Boolean);

    return (
      <DeckGL
        glOptions={{webgl2: true}}
        {...viewport}
        layers={layers}
        useDevicePixels={settings.useDevicePixels}
        onWebGLInitialized={this._onWebGLInitialized.bind(this)}
      />
    );
  }
}

WindDemo.propTypes = propTypes;

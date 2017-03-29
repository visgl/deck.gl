/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {PointCloudLayer, COORDINATE_SYSTEM} from 'deck.gl';

import {OrbitController, loadBinary, parsePLY} from './utils';

class Example extends PureComponent {

  constructor(props) {
    super(props);

    this._onResize = this._onResize.bind(this);
    this._onInitialized = this._onInitialized.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      viewport: {
        lookAt: [0, 0, 0],
        distance: 10,
        rotationX: 0,
        rotationY: 0,
        fov: 30,
        minDistance: 0.1,
        maxDistance: 10
      }
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentDidMount() {
    this._canvas.fitBounds([-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]);

    loadBinary('data/lucy100k.ply').then(rawData => {
      const {vertex} = parsePLY(rawData);

      const points = [];
      vertex.x.forEach((_, i) => {
        points.push({
          color: [(0.5 - vertex.x[i]) * 255, (vertex.y[i] + 0.5) * 255, 255, 255],
          normal: [vertex.nx[i], vertex.ny[i], vertex.nz[i]],
          position: [vertex.x[i], vertex.y[i], vertex.z[i]]
        });
      });
      this.setState({points});
    });

    window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    const {innerWidth: width, innerHeight: height} = window;
    this.setState({width, height});
  }

  _onInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onUpdate() {
    const {viewport} = this.state;
    this.setState({
      viewport: {
        ...viewport,
        rotationY: viewport.rotationY + 1
      }
    });
    window.requestAnimationFrame(this._onUpdate);
  }

  _renderPlyPointCloudLayer() {
    return this.state.points.length && new PointCloudLayer({
      id: 'ply-point-cloud-layer',
      data: this.state.points,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => d.normal,
      opacity: 0.9,
      radiusPixels: 2,
      lightSettings: {
        lightsPosition: [0, 0, 100, -100, 100, 0, 100, -100, 100],
        ambientRatio: 0.2,
        diffuseRatio: 0.6,
        specularRatio: 0.8,
        lightsStrength: [1.0, 0.0, 0.8, 0.0, 0.8, 0.0],
        numberOfLights: 3
      }
    });
  }

  render() {
    const {width, height, viewport} = this.state;
    const canvasProps = {width, height, ...viewport};
    const glViewport = OrbitController.getViewport(canvasProps);

    return width && height &&
      <OrbitController {...canvasProps} ref={canvas => {
        this._canvas = canvas;
      }} onViewportChange={this._onViewportChange}>
        <DeckGL width={width} height={height} viewport={glViewport}
          layers={[
            this._renderPlyPointCloudLayer()
          ].filter(Boolean)}
          onWebGLInitialized={this._onInitialized}/>
      </OrbitController>;
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);

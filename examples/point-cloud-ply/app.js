/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {PointCloudLayer, COORDINATE_SYSTEM} from 'deck.gl';

import {loadBinary, parsePLY, OrbitController} from './utils';

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this._onResize = this._onResize.bind(this);
    this._onInitialized = this._onInitialized.bind(this);
    this._onChangeViewport = this._onChangeViewport.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      viewport: {
        lookAt: [0, 0, 0],
        distance: 100,
        rotationX: 0,
        rotationY: 0,
        fov: 30,
        minDistance: 1.5,
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

  _onChangeViewport(viewport) {
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

  _renderPointCloudLayer() {
    return this.state.points.length && new PointCloudLayer({
      id: 'point-cloud-layer',
      data: this.state.points,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => d.normal,
      radiusPixels: 2
    });
  }

  render() {
    const {width, height, viewport} = this.state;
    const canvasProps = {width, height, ...viewport};
    const glViewport = OrbitController.getViewport(canvasProps);

    return width && height && (
      <OrbitController {...canvasProps} ref={canvas => {
        this._canvas = canvas;
      }} onChangeViewport={this._onChangeViewport}>
        <DeckGL
          width={width}
          height={height}
          viewport={glViewport}
          layers={[
            this._renderPointCloudLayer()
          ].filter(Boolean)}
          onWebGLInitialized={this._onInitialized}/>
        </OrbitController>
      );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);

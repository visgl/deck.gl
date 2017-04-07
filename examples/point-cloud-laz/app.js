/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {PointCloudLayer, COORDINATE_SYSTEM} from 'deck.gl';

import {
  OrbitController,
  loadLazFile, parseLazData
} from './utils';

function normalize(points) {
  let xMin = Infinity;
  let yMin = Infinity;
  let zMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < points.length; i++) {
    xMin = Math.min(xMin, points[i].position[0]);
    yMin = Math.min(yMin, points[i].position[1]);
    zMin = Math.min(zMin, points[i].position[2]);
    xMax = Math.max(xMax, points[i].position[0]);
    yMax = Math.max(yMax, points[i].position[1]);
    zMax = Math.max(zMax, points[i].position[2]);
  }

  const scale = Math.max(...[xMax - xMin, yMax - yMin, zMax - zMin]);
  const xMid = (xMin + xMax) / 2;
  const yMid = (yMin + yMax) / 2;
  const zMid = (zMin + zMax) / 2;

  for (let i = 0; i < points.length; i++) {
    points[i].position[0] = (points[i].position[0] - xMid) / scale;
    points[i].position[1] = (points[i].position[1] - yMid) / scale;
    points[i].position[2] = (points[i].position[2] - zMid) / scale;
  }
}

class Example extends PureComponent {

  constructor(props) {
    super(props);

    this._onChangeViewport = this._onChangeViewport.bind(this);
    this._onInitialized = this._onInitialized.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      progress: 0,
      rotating: true,
      viewport: {
        lookAt: [0, 0, 0],
        distance: 1,
        rotationX: 0,
        rotationY: 0,
        fov: 30,
        minDistance: 0.5,
        maxDistance: 3
      }
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentDidMount() {
    this._canvas.fitBounds([-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]);

    const {points} = this.state;

    const skip = 10;
    loadLazFile('data/indoor.laz').then(rawData => {
      parseLazData(rawData, skip, (decoder, progress) => {
        for (let i = 0; i < decoder.pointsCount; i++) {
          const {color, position} = decoder.getPoint(i);
          points.push({color, position});
        }

        if (progress >= 1) {
          normalize(points);
        }

        this.setState({points, progress});
      });
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
    gl.clearColor(0.07, 0.14, 0.19, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onChangeViewport(viewport) {
    this.setState({
      rotating: !viewport.isDragging,
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onUpdate() {
    const {rotating, viewport} = this.state;

    // note: when finished dragging, _onUpdate will not resume by default
    // to resume rotating, explicitly call _onUpdate or requestAnimationFrame
    if (!rotating) {
      return;
    }

    this.setState({
      viewport: {
        ...viewport,
        rotationY: viewport.rotationY + 1
      }
    });

    window.requestAnimationFrame(this._onUpdate);
  }

  _renderLazPointCloudLayer() {
    return this.state.points.length && new PointCloudLayer({
      id: 'laz-point-cloud-layer',
      data: this.state.points,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => [0, 0.5, 0.2],
      getColor: d => [255, 255, 255, 128],
      radiusPixels: 1
    });
  }

  _renderDeckGLCanvas() {
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
            this._renderLazPointCloudLayer()
          ].filter(Boolean)}
          onWebGLInitialized={this._onInitialized}/>
      </OrbitController>
    );
  }

  _renderProgressInfo() {
    const progress = (this.state.progress * 100).toFixed(2);
    return (
      <div>
        <div style={{
          position: 'absolute', left: '8px', bottom: '8px',
          color: '#FFF', fontSize: '15px'
        }}>
          {
            this.state.progress < 1 ?
              <div>
                <div>
                  This example might not work on mobile deivces due to browser limitations.
                </div>
                <div>
                  Please try checking it with a desktop machine instead.
                </div>
                <div>{`Loading ${progress}% (laslaz loader by plas.io)`}</div>
              </div> :
              <div>Data source: kaarta.com</div>
          }
        </div>
      </div>
    );
  }

  render() {
    const {width, height} = this.state;
    return width && height && <div>
      {this._renderDeckGLCanvas()}
      {this._renderProgressInfo()}
    </div>;
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);

/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, experimental} from 'deck.gl';
const {OrbitController} = experimental;
import {loadBinary, parsePLY} from './utils/ply-loader';

const DATA_REPO = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master';
const FILE_PATH = 'examples/point-cloud-ply/lucy100k.ply';

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this._onResize = this._onResize.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      viewport: {
        lookAt: [0, 0, 0],
        distance: 100,
        rotationX: 0,
        rotationOrbit: 0,
        orbitAxis: 'Y',
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
    loadBinary(`${DATA_REPO}/${FILE_PATH}`).then(rawData => {
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
    const size = {width: window.innerWidth, height: window.innerHeight};
    this.setState(size);
    const newViewport = OrbitController.getViewport(
      Object.assign(this.state.viewport, size)
    ).fitBounds([1, 1, 1]);
    this._onViewportChange(newViewport);
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
        rotationOrbit: viewport.rotationOrbit + 1
      }
    });
    window.requestAnimationFrame(this._onUpdate);
  }

  _renderPointCloudLayer() {
    const {points} = this.state;
    if (!points || points.length === 0) {
      return null;
    }

    return new PointCloudLayer({
      id: 'point-cloud-layer',
      data: points,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => d.normal,
      radiusPixels: 2
    });
  }

  render() {
    const {width, height, viewport} = this.state;
    if (width <= 0 || height <= 0) {
      return null;
    }

    const canvasProps = {width, height, ...viewport};
    const glViewport = OrbitController.getViewport(canvasProps);

    return (
      <OrbitController {...canvasProps} onViewportChange={this._onViewportChange}>
        <DeckGL
          width={width}
          height={height}
          viewport={glViewport}
          layers={[this._renderPointCloudLayer()]}
        />
      </OrbitController>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);

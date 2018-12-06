/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, ScatterplotLayer, OrthographicView} from 'deck.gl';
import ContourLayer from '@deck.gl/layers/contour-layer/contour-layer';

const DEGREE_TO_RADIAN = Math.PI / 180;
const NUM_POINTS = 20000;
const VIEW_MODE = {
  WEBGL: 0,
  SVG: 1,
  HYBRID: 2
};

class Root extends PureComponent {
  constructor(props) {
    super(props);

    this._onResize = this._onResize.bind(this);
    this._onClick = this._onClick.bind(this);
    this._update = this._update.bind(this);
    this._onContourToggle = this._onContourToggle.bind(this);
    this._onBandsToggle = this._onBandsToggle.bind(this);
    this._onRotationToggle = this._onRotationToggle.bind(this);

    const points = Array.from(Array(NUM_POINTS)).map((_, i) => {
      return {
        radius: Math.random(),
        theta: Math.random() * 360
      };
    });

    this.state = {
      width: 0,
      height: 0,
      viewMode: VIEW_MODE.WEBGL,
      points
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    window.requestAnimationFrame(this._update);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    const {innerWidth: width, innerHeight: height} = window;
    this.setState({width, height});
  }

  _onClick() {
    let nextViewMode;

    switch (this.state.viewMode) {
      case VIEW_MODE.WEBGL:
        nextViewMode = VIEW_MODE.SVG;
        break;
      case VIEW_MODE.SVG:
        nextViewMode = VIEW_MODE.HYBRID;
        break;
      case VIEW_MODE.HYBRID:
        nextViewMode = VIEW_MODE.WEBGL;
        break;
      default:
        nextViewMode = VIEW_MODE.WEBGL;
    }

    this.setState({viewMode: nextViewMode});
  }

  _onContourToggle() {
    const renderContours = !this.state.renderContours;
    this.setState({renderContours});
  }

  _onBandsToggle() {
    const bandsOn = !this.state.bandsOn;
    this.setState({bandsOn});
  }

  _onRotationToggle() {
    const rotationOn = !this.state.rotationOn;
    this.setState({rotationOn});
  }

  _update() {
    const {points, rotationOn} = this.state;
    if (rotationOn) {
      const newPoints = points.map(point => {
        point.theta += Math.sqrt(point.radius);
        return point;
      });
      this.setState({points: newPoints});
    }

    this.forceUpdate();
    window.requestAnimationFrame(this._update);
  }

  _renderSVGPoints() {
    const {width, height, points} = this.state;
    const size = Math.min(width, height) / 2;

    return (
      <g transform={`translate(${size}, ${size})`}>
        {points &&
          points.length &&
          points.map((p, i) => (
            <circle
              key={i}
              r={2}
              fill="#08F"
              cx={p.radius * Math.cos(p.theta * DEGREE_TO_RADIAN) * size}
              cy={p.radius * Math.sin(p.theta * DEGREE_TO_RADIAN) * size}
            />
          ))}
      </g>
    );
  }

  _renderScatterplotLayer() {
    const {width, height, points} = this.state;
    const size = Math.min(width, height) / 2;

    return new ScatterplotLayer({
      id: 'scatterplot-layer',
      data: points,
      getPosition: p => [
        p.radius * Math.cos(p.theta * DEGREE_TO_RADIAN) * size,
        p.radius * Math.sin(p.theta * DEGREE_TO_RADIAN) * size
      ],
      getRadius: p => 2,
      getColor: p => [255, 0, 128, 196],
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      // there's a bug that the radius calculated with project_scale
      radiusMinPixels: 2
    });
  }

  _getContours(bandsOn) {
    if (bandsOn) {
      return [
        {threshold: [1, 25], color: [250, 0, 0, 128], strokeWidth: 6},
        {threshold: [25, 50], color: [0, 250, 0, 200], strokeWidth: 5},
        {threshold: [50, 1000], color: [0, 0, 250], strokeWidth: 4}
      ];
    }
    return [
      {threshold: 1, color: [250, 0, 0], strokeWidth: 6},
      {threshold: 25, color: [0, 250, 0], strokeWidth: 5},
      {threshold: 50, color: [0, 0, 250], strokeWidth: 4}
    ];
  }
  _renderContourLayer(bandsOn) {
    const {width, height, points} = this.state;
    const size = Math.min(width, height) / 2;

    return new ContourLayer({
      id: 'contour-layer',
      data: points,
      getPosition: p => [
        p.radius * Math.cos(p.theta * DEGREE_TO_RADIAN) * size,
        p.radius * Math.sin(p.theta * DEGREE_TO_RADIAN) * size
      ],
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      cellSize: 20,
      contours: this._getContours(bandsOn),
      gpuAggregation: true
    });
  }

  render() {
    const {width, height, viewMode, renderContours, bandsOn} = this.state;
    const left = -Math.min(width, height) / 2;
    const top = -Math.min(width, height) / 2;
    const view = new OrthographicView({width, height, left, top});

    return (
      width &&
      height && (
        <div>
          {(viewMode === VIEW_MODE.SVG || viewMode === VIEW_MODE.HYBRID) && (
            <svg viewBox={`0 0 ${width} ${height}`}>{this._renderSVGPoints()}</svg>
          )}
          {(viewMode === VIEW_MODE.WEBGL || viewMode === VIEW_MODE.HYBRID) && (
            <DeckGL
              width={width}
              height={height}
              views={view}
              style={{position: 'absolute', top: '0px', left: '0px'}}
              layers={[
                this._renderScatterplotLayer(),
                bandsOn && this._renderContourLayer(true),
                renderContours && this._renderContourLayer(false)
              ]}
            />
          )}
          <button style={{position: 'absolute', top: '8px', left: '8px'}} onClick={this._onClick}>
            switch
          </button>
          <button
            style={{position: 'absolute', top: '8px', left: '80px'}}
            onClick={this._onContourToggle}
          >
            Toggle Contours
          </button>
          <button
            style={{position: 'absolute', top: '8px', left: '220px'}}
            onClick={this._onBandsToggle}
          >
            Toggle ISO-BANDS
          </button>
          <button
            style={{position: 'absolute', top: '8px', left: '360px'}}
            onClick={this._onRotationToggle}
          >
            Toggle Rotation
          </button>
        </div>
      )
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Root />, root);

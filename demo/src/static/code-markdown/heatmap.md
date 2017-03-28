```
/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';
import autobind from 'autobind-decorator';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.6,
  diffuseRatio: 0.6,
  specularRatio: 0.3,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 50};

export default class DeckGLOverlay extends Component {

  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      longitude: -1.4855092665310963,
      latitude: 52.38821282001933,
      zoom: 6.6,
      maxZoom: 15,
      pitch: 60,
      bearing: -14
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      elevationScale: elevationScale.min,
      hoveredObject: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data.length !== nextProps.data.length) {
      this._animate();
    }
  }

  @autobind
  _animate() {
    window.clearTimeout(this.startAnimationTimer);
    window.clearTimeout(this.intervalTimer);

    // wait 1.5 secs to start animation so that all data are loaded
    this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  @autobind
  _startAnimate() {
    window.setInterval(this._animateHeight, 20);
  }

  @autobind
  _animateHeight() {
    if (this.state.elevationScale === elevationScale.max) {
      window.clearTimeout(this.startAnimationTimer);
      window.clearTimeout(this.intervalTimer);
    } else {
      this.setState({elevationScale: this.state.elevationScale + 1});
    }
  }

  @autobind
  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, radius, upperPercentile} = this.props;
    const {x, y, hoveredObject} = this.state;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        data,
        opacity: 1,
        colorRange,
        extruded: true,
        pickable: true,
        radius,
        upperPercentile,
        elevationScale: this.state.elevationScale,
        elevationRange: [0, 3000],
        coverage: 1,
        getPosition: d => d,
        onHover: this._onHover,
        lightSettings: LIGHT_SETTINGS
      })
    ];

    return (
      <div>
        {this.state.hoveredObject ? <Tooltip
          x={x}
          y={y}
          count={hoveredObject.points.length}
          lat={hoveredObject.centroid[1]}
          lng={hoveredObject.centroid[0]}/> : null}
        <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />
      </div>
    );
  }
}

function Tooltip({x, y, lat, lng, count}) {
  return (
    <div className="tooltip"
         style={{left: x, top: y}}>
      <div>{`latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}`}</div>
      <div>{`longitude: ${Number.isFinite(lng) ? lat.toFixed(6) : ''}`}</div>
      <div>{`${count} Accidents`}</div>
    </div>
  );
}
```

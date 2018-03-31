/* global window, document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, LineLayer, ScatterplotLayer, OrthographicView} from 'deck.gl';

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      scale: 1,
      // 100 points with random position in [-1, 1]
      data: Array.from(Array(100)).map(_ => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
      }))
    };

    this._resize = this._resize.bind(this);
    this._update = this._update.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    window.requestAnimationFrame(this._update);
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _update() {
    const newScale = this.state.scale * 0.995;
    this.setState({
      scale: newScale < 0.25 ? 0.75 : newScale
    });
    window.requestAnimationFrame(this._update);
  }

  _renderPoints() {
    const {width, height, data, scale} = this.state;
    if (!data || data.length === 0) {
      return null;
    }

    return new ScatterplotLayer({
      id: 'points',
      data,
      radiusScale: 10,
      getPosition: ({x, y}) => [x * width / 2 * scale, y * height / 2 * scale],
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      updateTriggers: {
        getSourcePosition: {scale},
        getTargetPosition: {scale}
      }
    });
  }

  _renderBBox() {
    const {width, height, scale} = this.state;

    // add padding to reveal the bbox, it should stay still relative to the canvas bbox
    const PADDING = 10;
    const left = (-width / 2 + PADDING) * scale;
    const right = (width / 2 - PADDING) * scale;
    const top = (-height / 2 + PADDING) * scale;
    const bottom = (height / 2 - PADDING) * scale;

    return new LineLayer({
      id: 'bbox',
      data: [
        // bbox
        {source: [left, top], target: [right, top]},
        {source: [left, top], target: [left, bottom]},
        {source: [right, top], target: [right, bottom]},
        {source: [left, bottom], target: [right, bottom]},
        // origin
        {source: [-25 * scale, 0], target: [25 * scale, 0]},
        {source: [0, -25 * scale], target: [0, 25 * scale]}
      ],
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      updateTriggers: {
        getSourcePosition: {scale},
        getTargetPosition: {scale}
      }
    });
  }

  render() {
    const {width, height, scale} = this.state;
    if (width <= 0 || height <= 0) {
      return null;
    }

    const view = new OrthographicView({
      width,
      height,
      // the size of canvas and viewport are no longer the same as we scale w/ an ortho-viewport
      // all four are needed - left top right bottom - to decide the viewport size
      left: -width / 2 * scale,
      top: -height / 2 * scale,
      right: width / 2 * scale,
      bottom: height / 2 * scale
    });

    return (
      <div>
        <DeckGL
          width={width}
          height={height}
          views={view}
          layers={[this._renderBBox(), this._renderPoints()]}
        />
      </div>
    );
  }
}

render(<Root />, document.getElementById('root'));

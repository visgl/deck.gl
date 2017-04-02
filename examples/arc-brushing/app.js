/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,
      mousePosition: [0, 0]
    };

    requestJson('./data/counties.json', (error, response) => {
      if (!error) {
        this.setState({
          data: response.features
        });
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onMouseMove(evt) {
    if (evt.nativeEvent) {
      this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
    }
  }

  _onMouseEnter() {
    this.setState({mouseEntered: true});
  }

  _onMouseLeave() {
    this.setState({mouseEntered: false});
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }

    return (
      <div className="tooltip"
           style={{left: x, top: y}}>
        <div>{hoveredObject.name}</div>
        <div>{`Net gain: ${hoveredObject.net}`}</div>
        <div>{`i: ${hoveredObject.i}`}</div>
      </div>
    );
  }
  render() {
    const {viewport, data, mousePosition, mouseEntered} = this.state;

    if (!data) {
      return null;
    }

    return (
      <div onMouseMove={this._onMouseMove.bind(this)}
           onMouseEnter={this._onMouseEnter.bind(this)}
           onMouseLeave={this._onMouseLeave.bind(this)}>
        {this._renderTooltip()}
        <MapGL
          {...viewport}
          perspectiveEnabled={true}
          onChangeViewport={this._onChangeViewport.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay viewport={viewport}
            data={data}
            brushRadius={100000}
            opacity={0.7}
            strokeWidth={2}
            mousePosition={mousePosition}
            mouseEntered={mouseEntered}
            onHover={this._onHover.bind(this)}
          />
        </MapGL>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));

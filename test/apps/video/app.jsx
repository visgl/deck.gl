import React, {createRef, Component} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {OrthographicView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/ascii/Felix_BoldKingCole.mp4';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 0
};

export class App extends Component {
  constructor(props) {
    super(props);
    this._videoRef = createRef();
  }

  componentDidMount() {
    this.forceUpdate();
  }

  _togglePlay() {
    const video = this._videoRef.current;
    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
  }

  _renderLayers() {
    return new BitmapLayer({
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      image: this._videoRef.current,
      bounds: [-300, -400, 400, 300]
    });
  }

  _renderVideo() {
    return (
      <video
        ref={this._videoRef}
        style={{
          visibility: 'hidden',
          width: '400px',
          height: '300px'
        }}
        id="video"
        loop={true}
        controls
        crossOrigin="anonymouse"
      >
        <source src={DATA_URL} />
      </video>
    );
  }

  render() {
    return (
      <div>
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          views={new OrthographicView({})}
          controller={true}
          onClick={this._togglePlay.bind(this)}
          _animate={true}
        />
        {this._renderVideo()}
      </div>
    );
  }
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));

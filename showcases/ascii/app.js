/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';

import DeckGL, {OrthographicView} from 'deck.gl';
import {isWebGL2} from '@luma.gl/core';
import ControlPanel from './components/control-panel';
import AsciiLayer from './ascii-layer/ascii-layer';

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 500,
      height: 500,
      settings: {
        fontFamily: 'Monaco',
        isPlaying: true,
        sizeScale: 1,
        videoSource: 0
      },
      timestamp: Date.now(),

      webgl2Supported: true,
      videoLoading: true
    };

    this._onResize = this._onResize.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
    this._onLoad = this._onLoad.bind(this);
    this._onInitialize = this._onInitialize.bind(this);
    this._updateSettings = this._updateSettings.bind(this);
  }

  componentDidMount() {
    this._onResize();

    window.addEventListener('resize', this._onResize);
    this._timer = window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    window.cancelAnimationFrame(this._timer);
  }

  _onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onUpdate() {
    if (this.state.settings.isPlaying) {
      this.setState({
        timestamp: Date.now()
      });
    }

    this._timer = window.requestAnimationFrame(this._onUpdate);
  }

  _onLoad(video) {
    if (video) {
      video.crossOrigin = 'anonymouse';
    }
    this._video = video;
  }

  _onInitialize(gl) {
    this.setState({
      webgl2Supported: isWebGL2(gl)
    });
  }

  _updateSettings(settings) {
    this.setState({
      settings: {...this.state.settings, ...settings}
    });
  }

  _renderDeckGLOverlay({width, height, video}) {
    const {timestamp, settings} = this.state;

    return (
      <DeckGL
        width={width || 1}
        height={height || 1}
        views={new OrthographicView()}
        onWebGLInitialized={this._onInitialize}
      >
        <AsciiLayer
          id="video"
          video={video}
          timestamp={timestamp}
          fontFamily={settings.fontFamily}
          sizeScale={settings.sizeScale}
        />
      </DeckGL>
    );
  }

  render() {
    const {width, height, settings, webgl2Supported} = this.state;

    if (!webgl2Supported) {
      return <div className="warning">WebGL2 is not supported in your browser.</div>;
    }

    let canvasWidth = 0;
    let canvasHeight = 0;
    let canvasStyle = null;

    if (this._video && this._video.videoWidth) {
      const {videoWidth, videoHeight} = this._video;
      const scale = Math.min(width / videoWidth, height / videoHeight);

      canvasWidth = videoWidth * scale;
      canvasHeight = videoHeight * scale;

      canvasStyle = {
        width: canvasWidth,
        height: canvasHeight,
        top: (height - canvasHeight) / 2,
        left: (width - canvasWidth) / 2
      };
    }

    return (
      <div id="app-container">
        <video autoPlay loop id="source-video" ref={this._onLoad} />

        <div id="canvas-wrapper" style={canvasStyle}>
          {this._renderDeckGLOverlay({
            width: canvasWidth,
            height: canvasHeight,
            video: this._video
          })}
        </div>

        <ControlPanel {...settings} video={this._video} updateSettings={this._updateSettings} />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));

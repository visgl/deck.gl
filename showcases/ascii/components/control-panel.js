/* global document */
import React, {PureComponent} from 'react';
import {MIN_SIZE_SCALE, MAX_SIZE_SCALE, FONTS, VIDEOS} from './constants';

export default class ControlPanel extends PureComponent {
  constructor(props) {
    super(props);

    this._onKeydown = this._onKeydown.bind(this);
    this._setVideoSource = this._setVideoSource.bind(this);
    this._togglePlay = this._togglePlay.bind(this);
    this._onVideoSourceChange = this._onVideoSourceChange.bind(this);
    this._onSizeScaleChange = this._onSizeScaleChange.bind(this);
    this._onFontFamilyChange = this._onFontFamilyChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onKeydown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.video && !this.props.video) {
      // video element is just loaded
      this._setVideoSource(nextProps.video, nextProps.videoSource);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeydown);
  }

  _onKeydown(event) {
    switch (event.keyCode) {
      case 38:
        // up: increase font size
        this._nextSizeScale(1);
        break;

      case 40:
        // down: reduce font size
        this._nextSizeScale(-1);
        break;

      case 32:
        // spacebar: toggle playback
        this._togglePlay();
        break;

      case 39:
        // right: use next video
        this._nextVieoSource(1);
        break;

      case 37:
        // left: use prev video
        this._nextVieoSource(-1);
        break;

      default:
    }
  }

  _togglePlay() {
    const isPlaying = !this.props.isPlaying;
    this.props.video[isPlaying ? 'play' : 'pause']();

    this.props.updateSettings({isPlaying});
  }

  _nextSizeScale(delta) {
    let {sizeScale} = this.props;

    sizeScale *= Math.pow(2, delta / 2);
    if (sizeScale < MIN_SIZE_SCALE) {
      sizeScale = MIN_SIZE_SCALE;
    }
    if (sizeScale > MAX_SIZE_SCALE) {
      sizeScale = MAX_SIZE_SCALE;
    }

    this.props.updateSettings({sizeScale});
  }

  _nextVieoSource(delta) {
    let {videoSource} = this.props;

    videoSource = (videoSource + delta + VIDEOS.length) % VIDEOS.length;

    this._setVideoSource(this.props.video, videoSource);

    this.props.updateSettings({isPlaying: true, videoSource});
  }

  _setVideoSource(video, sourceIndex) {
    const videoSourceInfo = VIDEOS[sourceIndex];

    switch (typeof videoSourceInfo.source) {
      case 'function':
        videoSourceInfo.source(obj => {
          video.srcObject = obj;
        });
        break;

      case 'string':
        video.srcObject = null;
        video.src = videoSourceInfo.source;
        break;

      default:
        video.srcObject = videoSourceInfo.source;
    }

    video.play();
  }

  _onVideoSourceChange(event) {
    const videoSource = event.target.value;
    this._setVideoSource(this.props.video, videoSource);
    this.props.updateSettings({isPlaying: true, videoSource});
  }

  _onSizeScaleChange(event) {
    this.props.updateSettings({
      sizeScale: Math.pow(2, event.target.value)
    });
  }

  _onFontFamilyChange(event) {
    this.props.updateSettings({
      fontFamily: event.target.value
    });
  }

  render() {
    const {fontFamily, isPlaying, videoSource, sizeScale} = this.props;
    const videoSourceInfo = VIDEOS[videoSource];

    return (
      <div className="control-panel">
        <div onClick={this._togglePlay} className={`button ${isPlaying ? 'pause' : 'play'}`} />

        <div>
          {videoSourceInfo.name}
          <i>{videoSourceInfo.description}</i>
        </div>
        <div>
          <label>Video Source</label>
          <select value={videoSource} onChange={this._onVideoSourceChange}>
            {VIDEOS.map((v, i) => (
              <option key={i} value={i}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Font Family</label>
          <select value={fontFamily} onChange={this._onFontFamilyChange}>
            {FONTS.map(f => (
              <option key={f} value={f}>
                {f.replace(/"/g, '')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Font Size</label>
          <input
            type="range"
            value={Math.log2(sizeScale)}
            min={-3}
            max={2}
            step={0.5}
            onInput={this._onSizeScaleChange}
          />
        </div>
      </div>
    );
  }
}

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import PropTypes from 'prop-types';
// import isBrowser from '../utils/is-browser';
const isBrowser = true;
const mapboxgl = isBrowser ? require('mapbox-gl') : null;
/* global window, document */

function noop() {}

/* eslint-disable max-len */
const propTypes = {
  // Creation parameters
  // container:
  mapboxApiAccessToken:
    PropTypes.string /** Mapbox API access token for mapbox-gl-js. Required when using Mapbox vector tiles/styles. */,
  attributionControl: PropTypes.bool /** Show attribution control or not. */,
  preserveDrawingBuffer:
    PropTypes.bool /** Mapbox WebGL context creation option. Useful when you want to export the canvas as a PNG. */,
  onLoad: PropTypes.func /** The onLoad callback for the map */,

  mapStyle: PropTypes.string /** The Mapbox style. A string url to a MapboxGL style */,
  visible: PropTypes.bool /** Whether the map is visible */,

  // Map view state
  width: PropTypes.number.isRequired /** The width of the map. */,
  height: PropTypes.number.isRequired /** The height of the map. */,
  longitude: PropTypes.number.isRequired /** The longitude of the center of the map. */,
  latitude: PropTypes.number.isRequired /** The latitude of the center of the map. */,
  zoom: PropTypes.number.isRequired /** The tile zoom level of the map. */,
  bearing: PropTypes.number /** Specify the bearing of the viewport */,
  pitch: PropTypes.number /** Specify the pitch of the viewport */,
  altitude:
    PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights"  Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137 */
};

const defaultProps = {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  visible: true,
  bearing: 0,
  pitch: 0,
  altitude: 1.5,
  onLoad: noop
};
/* eslint-enable max-len */

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  let accessToken = null;

  if (window.location) {
    const match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken) {
    // Note: This depends on the bundler (e.g. webpack) inmporting environment correctly
    accessToken = process.env.MapboxAccessToken || process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props, component = 'component') {
  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}

export default class ReusableMapboxMap {
  static supported() {
    return mapboxgl && mapboxgl.supported();
  }

  constructor(props) {
    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    // autobind(this);
    this._queryParams = {};
    this.props = {};

    this._initialize(props);
  }

  finalize() {
    if (!mapboxgl || !this._map) {
      return this;
    }

    this._destroy();
    return this;
  }

  setProps(props) {
    if (!mapboxgl) {
      return this;
    }

    this._update(this.props, props);
    return this;
  }

  // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
  // In a system like React we must wait to read size until after render
  // (e.g. until "componentDidUpdate")
  resize() {
    if (!mapboxgl) {
      return this;
    }

    this._map.resize();
    return this;
  }

  // External apps can access map this way
  getMap() {
    return this._map;
  }

  // PRIVATE API

  _create(props) {
    // Reuse a saved map, if available
    if (props.reuseMaps && ReusableMapboxMap.savedMap) {
      this._map = this.map = ReusableMapboxMap.savedMap;
      ReusableMapboxMap.savedMap = null;
      // TODO - need to call onload again, need to track with Promise?
      props.onLoad();
    } else {
      this._map = this.map = new mapboxgl.Map({
        container: props.container || document.body,
        center: [props.longitude, props.latitude],
        zoom: props.zoom,
        pitch: props.pitch,
        bearing: props.bearing,
        style: props.mapStyle,
        interactive: false,
        attributionControl: props.attributionControl,
        preserveDrawingBuffer: props.preserveDrawingBuffer
      });
      // Attach optional onLoad function
      this.map.once('load', props.onLoad);
    }

    return this;
  }

  _destroy() {
    if (!ReusableMapboxMap.savedMap) {
      ReusableMapboxMap.savedMap = this._map;
    } else {
      this._map.remove();
    }
  }

  _initialize(props) {
    props = Object.assign({}, defaultProps, props);
    checkPropTypes(props, 'Mapbox');

    // Creation only props
    if (mapboxgl) {
      mapboxgl.accessToken = props.mapboxApiAccessToken;
    }

    this._create(props);

    // Disable outline style
    const canvas = this.map.getCanvas();
    if (canvas) {
      canvas.style.outline = 'none';
    }

    this._updateMapViewport({}, props);
    this._updateMapSize({}, props);

    this.props = props;
  }

  _update(oldProps, newProps) {
    newProps = Object.assign({}, this.props, newProps);
    checkPropTypes(newProps, 'Mapbox');

    this._updateMapViewport(oldProps, newProps);
    this._updateMapSize(oldProps, newProps);

    this.props = newProps;
  }

  _updateMapViewport(oldProps, newProps) {
    const viewportChanged =
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom ||
      newProps.pitch !== oldProps.pitch ||
      newProps.bearing !== oldProps.bearing ||
      newProps.altitude !== oldProps.altitude;

    if (viewportChanged) {
      this._map.jumpTo({
        center: [newProps.longitude, newProps.latitude],
        zoom: newProps.zoom,
        bearing: newProps.bearing,
        pitch: newProps.pitch
      });

      // TODO - jumpTo doesn't handle altitude
      if (newProps.altitude !== oldProps.altitude) {
        this._map.transform.altitude = newProps.altitude;
      }
    }
  }

  // Note: needs to be called after render (e.g. in componentDidUpdate)
  _updateMapSize(oldProps, newProps) {
    const sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
    if (sizeChanged) {
      this._map.resize();
    }
  }

  // Hover and click only query layers whose interactive property is true
  // _updateQueryParams(mapStyle) {
  //   const interactiveLayerIds = getInteractiveLayerIds(mapStyle);
  //   this._queryParams = {layers: interactiveLayerIds};
  // }
}

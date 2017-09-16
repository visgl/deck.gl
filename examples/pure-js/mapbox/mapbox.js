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

/* eslint-disable */
import PropTypes from 'prop-types';
import isBrowser from '../utils/is-browser';
import {window} from './globals';

let mapboxgl = null;
if (isBrowser) {
  mapboxgl = require('mapbox-gl');
}

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  let accessToken = null;

  if (window.location) {
    const match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken) {
    // Note: This depends on the bundler (e.g. webpack) inmporting environment correctly
    accessToken =
      process.env.MapboxAccessToken || process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line
  }

  return accessToken || null;
}

import {PerspectiveMercatorViewport} from 'viewport-mercator-project';

function noop() {}

const propTypes = {
  /** Mapbox API access token for mapbox-gl-js. Required when using Mapbox vector tiles/styles. */
  mapboxApiAccessToken: PropTypes.string,
  /** Mapbox WebGL context creation option. Useful when you want to export the canvas as a PNG. */
  preserveDrawingBuffer: PropTypes.bool,
  /** Show attribution control or not. */
  attributionControl: PropTypes.bool,

  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.string,
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,
  /** Whether the map is visible */
  visible: PropTypes.bool,

  /** The width of the map. */
  width: PropTypes.number.isRequired,
  /** The height of the map. */
  height: PropTypes.number.isRequired,
  /** The longitude of the center of the map. */
  longitude: PropTypes.number.isRequired,
  /** The latitude of the center of the map. */
  latitude: PropTypes.number.isRequired,
  /** The tile zoom level of the map. */
  zoom: PropTypes.number.isRequired,
  /** Specify the bearing of the viewport */
  bearing: PropTypes.number,
  /** Specify the pitch of the viewport */
  pitch: PropTypes.number,
  /** Altitude of the viewport camera. Default 1.5 "screen heights" */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number,
  /** The onLoad callback for the map */
  onLoad: PropTypes.func
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

const childContextTypes = {
  viewport: PropTypes.instanceOf(PerspectiveMercatorViewport)
};

export default class StaticMap {
  static supported() {
    return mapboxgl && mapboxgl.supported();
  }

  constructor(props) {
    if (!mapboxgl) {
      throw new Error('Mapbox not available under Node.js');
    }

    mapboxgl.accessToken = props.mapboxApiAccessToken;

    this._map = new mapboxgl.Map({
      container: this.refs.mapboxMap,
      center: [props.longitude, this.props.latitude],
      zoom: this.props.zoom,
      pitch: this.props.pitch,
      bearing: this.props.bearing,
      style: this.props.mapStyle,
      interactive: false,
      attributionControl: this.props.attributionControl,
      preserveDrawingBuffer: this.props.preserveDrawingBuffer
    });

    this._queryParams = {};

    if (!StaticMap.supported()) {
      this.componentDidMount = noop;
      this.componentWillReceiveProps = noop;
      this.componentDidUpdate = noop;
    }
    autobind(this);
  }

  finalize() {
    if (!mapboxgl) {
      return;
    }

    if (this._map) {
      this._map.remove();
    }
  }

  // External apps can access map this way
  getMap() {
    return this._map;
  }

  setProps(props) {
    if (!mapboxgl) {
      return;
    }

    this._updateStateFromProps(this.props, -rops);
    this._updateMapViewport(this.props, -rops);
    this._updateMapStyle(this.props, -rops);
    // Save width/height so that we can check them in componentDidUpdate
    this.setState({
      width: this.props.width,
      height: this.props.height
    });
  }

  componentDidMount() {
    if (!mapboxgl) {
      return;
    }

    const mapStyle = Immutable.Map.isMap(this.props.mapStyle) ?
      this.props.mapStyle.toJS() :
      this.props.mapStyle;

    // Disable outline style
    const canvas = map.getCanvas();
    if (canvas) {
      canvas.style.outline = 'none';
    }

    // Attach optional onLoad function
    map.once('load', this.props.onLoad);

    this._map = map;
    this._updateMapViewport({}, this.props);
    // this._callOnChangeViewport(map.transform);
    this._updateQueryParams(mapStyle);
  }

  componentDidUpdate() {
    if (!mapboxgl) {
      return;
    }

    // Since Mapbox's map.resize() reads size from DOM
    // we must wait to read size until after render (i.e. here in "didUpdate")
    this._updateMapSize(this.state, this.props);
  }

  /**
    * Uses Mapbox's
    * queryRenderedFeatures API to find features at point or in a bounding box.
    * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
    * To query only some of the layers, set the `interactive` property in the
    * layer style to `true`.
    * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
    *   Point or an array of two points defining the bounding box
    * @param {Object} parameters - query options
    */
  queryRenderedFeatures(geometry, parameters) {
    const queryParams = parameters || this._queryParams;
    if (queryParams.layers && queryParams.layers.length === 0) {
      return [];
    }
    return this._map.queryRenderedFeatures(geometry, queryParams);
  }

  _updateStateFromProps(oldProps, newProps) {
  }

  // Hover and click only query layers whose interactive property is true
  _updateQueryParams(mapStyle) {
    const interactiveLayerIds = getInteractiveLayerIds(mapStyle);
    this._queryParams = {layers: interactiveLayerIds};
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
  resize() {
    if (sizeChanged) {
      this._map.resize();
      // this._callOnChangeViewport(this._map.transform);
    }
  }

  render() {
    const {className, width, height, style, visible} = this.props;
    const mapContainerStyle = Object.assign({}, style, {width, height, position: 'relative'});
    const mapStyle = Object.assign({}, style, {
      width,
      height,
      visibility: visible ? 'visible' : 'hidden'
    });
    const overlayContainerStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      width,
      height,
      overflow: 'hidden'
    };

    // Note: a static map still handles clicks and hover events
    return (
      createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [
          createElement('div', {
            key: 'map-mapbox',
            ref: 'mapboxMap',
            style: mapStyle,
            className
          }),
          createElement('div', {
            key: 'map-overlays',
            // Same as interactive map's overlay container
            className: 'overlays',
            style: overlayContainerStyle,
            children: this.props.children
          })
        ]
      })
    );
  }
}

StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;

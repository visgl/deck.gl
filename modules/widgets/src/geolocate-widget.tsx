// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, WidgetProps} from '@deck.gl/core';
import type {WidgetPlacement, Viewport} from '@deck.gl/core';
import {FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import {render} from 'preact';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

const GOOGLE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

/** Properties for the GeolocateWidget */
export type GeolocateWidgetProps = WidgetProps & {
  viewId?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  transitionDuration?: number;
  /** Geocoding service */
  geocoder?: 'google' | 'mapbox' | 'opencage' | 'custom' | 'coordinates';
  /** API key used for geocoding services */
  apiKey?: string;
  /** Callback when using a custom geocoder */
  onGeocode?: (
    address: string,
    apiKey: string
  ) => Promise<{longitude: number; latitude: number} | null>;
};

/**
 * A widget that display a text box that lets user type in a location
 * and a button that moves the view to that location.
 * @todo For now only supports coordinates, Could be extended with location service integrations.
 */
export class GeolocateWidget extends Widget<GeolocateWidgetProps> {
  static defaultProps: Required<GeolocateWidgetProps> = {
    ...Widget.defaultProps,
    id: 'geolocate',
    viewId: undefined!,
    placement: 'top-left',
    label: 'Geolocate',
    transitionDuration: 200,
    geocoder: 'coordinates',
    apiKey: '',
    onGeocode: undefined!
  };

  className = 'deck-widget-geolocate';
  placement: WidgetPlacement = 'top-left';

  geolocateText = '';
  geolocateWidth = 10;
  errorText = '';

  constructor(props: GeolocateWidgetProps = {}) {
    super(props, GeolocateWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<GeolocateWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
    if (!this.props.apiKey && ['google', 'mapbox', 'opencage'].includes(this.props.geocoder)) {
      throw new Error('API key is required');
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <div className="deck-widget-geolocate">
        <input
          type="text"
          placeholder="-122.45, 37.8 or 37°48'N, 122°27'W"
          value={this.geolocateText}
          // @ts-expect-error event type
          onInput={e => this.setInput(e.target?.value || '')}
          onKeyPress={this.handleKeyPress}
        />
        <button onClick={this.handleSubmit}>Go</button>
        {this.errorText && <div className="error">{this.errorText}</div>}
      </div>,
      rootElement
    );
  }

  setInput = (text: string) => {
    this.geolocateText = text;
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  };

  /** Sync wrapper for async geocode() */
  handleSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.geocode();
  };

  geocode: () => Promise<void> = async () => {
    this.errorText = '';
    try {
      const coordinates = await this.callGeocoderService(this.geolocateText);
      if (coordinates) {
        this.setViewState(coordinates);
      } else {
        this.errorText = 'Invalid address';
      }
    } catch (error) {
      this.errorText = `Error: ${(error as Error).message}`;
    }
  };

  callGeocoderService = async (
    address: string
  ): Promise<{longitude: number; latitude: number} | null> => {
    const {geocoder, apiKey, onGeocode} = this.props;

    switch (geocoder) {
      case 'google':
        return this.geocodeGoogle(address, apiKey);
      case 'mapbox':
        return this.geocodeMapbox(address, apiKey);
      case 'opencage':
        return this.geocodeOpenCage(address, apiKey);
      case 'custom':
        return await onGeocode(address, apiKey);
      case 'coordinates':
        return await this.geocodeCoordinates(address);
      default:
        throw new Error(`Unsupported geocoder: ${geocoder}`);
    }
  };

  async geocodeGoogle(
    address: string,
    apiKey: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const json = await this._fetchJson(`${GOOGLE_URL}?address=${encodedAddress}&key=${apiKey}`);

    switch (json.status) {
      case 'OK':
        const loc = json.results.length > 0 && json.results[0].geometry.location;
        return loc ? {longitude: loc.lng, latitude: loc.lat} : null;
      default:
        throw new Error(`Google Geocoder failed: ${json.status}`);
    }
  }

  async geocodeMapbox(
    address: string,
    apiKey: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const json = await this._fetchJson(
      `${MAPBOX_URL}/${encodedAddress}.json?access_token=${apiKey}`
    );

    if (Array.isArray(json.features) && json.features.length > 0) {
      const center = json.features[0].center;
      if (Array.isArray(center) && center.length >= 2) {
        return {longitude: center[0], latitude: center[1]};
      }
    }
    return null;
  }

  async geocodeOpenCage(
    address: string,
    key: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const data = await this._fetchJson(`${OPENCAGE_API_URL}?q=${encodedAddress}&key=${key}`);
    if (Array.isArray(data.results) && data.results.length > 0) {
      const geometry = data.results[0].geometry;
      return {longitude: geometry.lng, latitude: geometry.lat};
    }
    return null;
  }

  async geocodeCoordinates(address: string): Promise<{longitude: number; latitude: number} | null> {
    return parseCoordinates(address) || null;
  }

  /** Fetch JSON, catching HTTP errors */
  async _fetchJson(url: string): Promise<any> {
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      // Annoyingly, fetch reports some errors (e.g. CORS) using excpetions, not response.ok
      throw new Error(`Failed to fetch ${url}: ${error}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data) {
      throw new Error(`No data returned from ${url}`);
    }
    return data;
  }

  // TODO - MOVE TO WIDGETIMPL?

  setViewState(viewState: ViewState) {
    const viewId = this.props.viewId || (viewState?.id as string) || 'default-view';
    const viewport = this.viewports[viewId] || {};
    const nextViewState: ViewState = {
      ...viewport,
      ...viewState
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator =
        'latitude' in nextViewState ? new FlyToInterpolator() : new LinearInterpolator();
    }

    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }

  onViewportChange(viewport: Viewport) {
    this.viewports[viewport.id] = viewport;
  }

  viewports: Record<string, Viewport> = {};
}

/**
 * Parse an input string for coordinates.
 * Supports comma- or semicolon-separated values.
 * Heuristically determines which value is longitude and which is latitude.
 */
function parseCoordinates(input) {
  input = input.trim();
  const parts = input.split(/[,;]/).map(p => p.trim());
  if (parts.length < 2) return null;
  const first = parseCoordinatePart(parts[0]);
  const second = parseCoordinatePart(parts[1]);
  if (first === null || second === null) return null;
  // Use a heuristic:
  // If one number exceeds 90 in absolute value, it's likely a longitude.
  if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
    return {longitude: first, latitude: second};
  } else if (Math.abs(second) > 90 && Math.abs(first) <= 90) {
    return {longitude: second, latitude: first};
  }
  // If both are <= 90, assume order: latitude, longitude.
  return {latitude: first, longitude: second};
}

/**
 * Parse a single coordinate part (which may be in decimal or DMS format).
 */
function parseCoordinatePart(s: string): number | null {
  s = s.trim();
  // If the string contains a degree symbol or similar markers, use DMS parsing.
  if (s.includes('°') || s.includes("'") || s.includes('"')) {
    const value = dmsToDecimal(s);
    return isNaN(value) ? null : value;
  }
  // Otherwise, check for a cardinal letter and remove it.
  let sign = 1;
  if (/[SW]/i.test(s)) sign = -1;
  s = s.replace(/[NSEW]/gi, '');
  const value = parseFloat(s);
  return isNaN(value) ? null : sign * value;
}

/** Convert a DMS string (e.g. "37°48'00\"N") to decimal degrees. */
function dmsToDecimal(s: string): number {
  // A simple regex to extract degrees, minutes, seconds and direction.
  const regex = /(\d+)[°d]\s*(\d+)?['′m]?\s*(\d+(?:\.\d+)?)?[\"″s]?\s*([NSEW])?/i;
  const match = s.match(regex);
  if (!match) return NaN;
  const degrees = parseFloat(match[1]) || 0;
  const minutes = parseFloat(match[2]) || 0;
  const seconds = parseFloat(match[3]) || 0;
  const direction = match[4] || '';
  let dec = degrees + minutes / 60 + seconds / 3600;
  if (/[SW]/i.test(direction)) {
    dec = -dec;
  }
  return dec;
}

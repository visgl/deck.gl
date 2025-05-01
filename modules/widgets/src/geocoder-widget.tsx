// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, WidgetProps} from '@deck.gl/core';
import type {WidgetPlacement, Viewport} from '@deck.gl/core';
import {FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import {render} from 'preact';
import {DropdownMenu} from './lib/dropdown-menu';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

const GOOGLE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

const CURRENT_LOCATION = 'current';

/** Properties for the GeocoderWidget */
export type GeocoderWidgetProps = WidgetProps & {
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
export class GeocoderWidget extends Widget<GeocoderWidgetProps> {
  static defaultProps: Required<GeocoderWidgetProps> = {
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

  className = 'deck-widget-geocoder';
  placement: WidgetPlacement = 'top-left';

  addressText = '';
  errorText = '';
  addressHistory: string[] = [];

  constructor(props: GeocoderWidgetProps = {}) {
    super(props, GeocoderWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
    this.addressHistory = this.loadPreviousAddresses();
  }

  setProps(props: Partial<GeocoderWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
    if (!this.props.apiKey && ['google', 'mapbox', 'opencage'].includes(this.props.geocoder)) {
      throw new Error('API key is required');
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const menuItems = [CURRENT_LOCATION, ...this.addressHistory];
    render(
      <div
        className="deck-widget-geocoder"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap' // Allows wrapping on smaller screens
        }}
      >
        <input
          type="text"
          placeholder="-122.45, 37.8 or 37°48'N, 122°27'W"
          value={this.addressText}
          // @ts-expect-error event type
          onInput={e => this.setInput(e.target?.value || '')}
          onKeyPress={this.handleKeyPress}
          style={{
            flex: '1 1 auto',
            minWidth: '200px',
            margin: 0,
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />
        <DropdownMenu
          menuItems={menuItems}
          onSelect={this.handleSelect}
          style={{
            margin: 2,
            padding: '4px 2px',
            boxSizing: 'border-box'
          }}
        />
        {this.errorText && <div className="error">{this.errorText}</div>}
      </div>,
      rootElement
    );
  }

  setInput = (text: string) => {
    this.addressText = text;
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  };

  handleSelect = (address: string) => {
    this.setInput(address);
    this.handleSubmit();
  };

  /** Sync wrapper for async geocode() */
  handleSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.geocode();
  };

  /** PErform geocoding */
  geocode: () => Promise<void> = async () => {
    this.errorText = '';
    try {
      const coordinates = await this.callGeocoderService(this.addressText);
      if (coordinates) {
        this.setViewState(coordinates);
        this.storeAddress(this.addressText);
      } else {
        this.errorText = 'Invalid address';
      }
    } catch (error) {
      this.errorText = `Error: ${(error as Error).message}`;
    }
  };

  loadPreviousAddresses(): string[] {
    try {
      const stored = window.localStorage.getItem('deck-geocoder-widget-history');
      const list = stored && JSON.parse(stored);
      const addresses = Array.isArray(list)
        ? list.filter((v): v is string => typeof v === 'string')
        : [];
      return addresses;
    } catch {
      // ignore
    }
    return [];
  }

  storeAddress(address: string) {
    const cleaned = address.trim();
    if (!cleaned || cleaned === CURRENT_LOCATION) {
      return;
    }
    const deduped = [cleaned, ...this.addressHistory.filter(a => a !== cleaned)];
    this.addressHistory = deduped.slice(0, 5);
    this.updateHTML();
    try {
      window.localStorage.setItem(
        'deck-geocoder-widget-history',
        JSON.stringify(this.addressHistory)
      );
    } catch {
      // ignore
    }
  }

  callGeocoderService = async (
    address: string
  ): Promise<{longitude: number; latitude: number} | null> => {
    const {geocoder, apiKey, onGeocode} = this.props;

    if (address === CURRENT_LOCATION) {
      return this.getCurrentLocation();
    }

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

  /** Parse a coordinate string */
  async geocodeCoordinates(address: string): Promise<{longitude: number; latitude: number} | null> {
    return parseCoordinates(address) || null;
  }

  /** Attempt to call browsers geolocation API */
  async getCurrentLocation(): Promise<{longitude: number; latitude: number} | null> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPosition */
        (position: GeolocationPosition) => {
          const {longitude, latitude} = position.coords;
          resolve({longitude, latitude});
        },
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPositionError */
        (error: GeolocationPositionError) => reject(new Error(error.message))
      );
    });
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

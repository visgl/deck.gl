// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget} from '@deck.gl/core';
import type {WidgetPlacement, Viewport, WidgetProps} from '@deck.gl/core';
import {FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import {render} from 'preact';
import {DropdownMenu} from './lib/components/dropdown-menu';
import {type Geocoder} from './lib/geocode/geocoder';
import {GeocoderHistory} from './lib/geocode/geocoder-history';
import {
  GoogleGeocoder,
  MapboxGeocoder,
  OpenCageGeocoder,
  CoordinatesGeocoder,
  CurrentLocationGeocoder
} from './lib/geocode/geocoders';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

const CURRENT_LOCATION = 'current';

/** Properties for the GeocoderWidget */
export type GeocoderWidgetProps = WidgetProps & {
  viewId?: string | null;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** View state reset transition duration in ms. 0 disables the transition */
  transitionDuration?: number;
  /** Geocoding service selector, for declarative usage */
  geocoder?: 'google' | 'mapbox' | 'opencage' | 'coordinates' | 'custom';
  /** Custom geocoding service (Used when geocoder = 'custom') */
  customGeocoder?: Geocoder;
  /** API key used for geocoding services */
  apiKey?: string;
  /** Whether to use geolocation @note Experimental*/
  _geolocation?: boolean;
};

/**
 * A widget that display a text box that lets user type in a location
 * and a button that moves the view to that location.
 * @todo For now only supports coordinates, Could be extended with location service integrations.
 */
export class GeocoderWidget extends Widget<GeocoderWidgetProps> {
  static defaultProps: Required<GeocoderWidgetProps> = {
    ...Widget.defaultProps,
    id: 'geocoder',
    viewId: null,
    placement: 'top-left',
    label: 'Geocoder',
    transitionDuration: 200,
    geocoder: 'coordinates',
    customGeocoder: CoordinatesGeocoder,
    apiKey: '',
    _geolocation: false
  };

  className = 'deck-widget-geocoder';
  placement: WidgetPlacement = 'top-left';

  geocodeHistory = new GeocoderHistory({});
  addressText: string = '';
  geocoder: Geocoder = CoordinatesGeocoder;

  constructor(props: GeocoderWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<GeocoderWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    this.geocoder = getGeocoder(this.props);
    if (this.geocoder.requiresApiKey && !this.props.apiKey) {
      throw new Error(`API key is required for the ${this.geocoder.name} geocoder`);
    }
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const menuItems = this.props._geolocation
      ? [CURRENT_LOCATION, ...this.geocodeHistory.addressHistory]
      : [...this.geocodeHistory.addressHistory];
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
          placeholder={this.geocoder.placeholderLocation ?? 'Enter address or location'}
          value={this.geocodeHistory.addressText}
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
        {this.geocodeHistory.errorText && (
          <div className="error">{this.geocodeHistory.errorText}</div>
        )}
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
    this.geocode(this.addressText);
  };

  /** Perform geocoding */
  geocode: (address: string) => Promise<void> = async address => {
    const useGeolocation = this.props._geolocation && address === CURRENT_LOCATION;
    const geocoder = useGeolocation ? CurrentLocationGeocoder : this.geocoder;
    const coordinates = await this.geocodeHistory.geocode(
      geocoder,
      this.addressText,
      this.props.apiKey
    );
    if (coordinates) {
      this.setViewState(coordinates);
    }
  };

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

function getGeocoder(props: {geocoder?: string; customGeocoder?: Geocoder}): Geocoder {
  switch (props.geocoder) {
    case 'google':
      return GoogleGeocoder;
    case 'mapbox':
      return MapboxGeocoder;
    case 'opencage':
      return OpenCageGeocoder;
    case 'coordinates':
      return CoordinatesGeocoder;
    case 'custom':
      if (!props.customGeocoder) {
        throw new Error('Custom geocoder is not defined');
      }
      return props.customGeocoder;
    default:
      throw new Error(`Unknown geocoder: ${props.geocoder}`);
  }
}

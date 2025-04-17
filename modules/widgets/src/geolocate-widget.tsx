// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {WidgetPlacement, Viewport} from '@deck.gl/core';
import {FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import {render} from 'preact';
import {WidgetImpl, WidgetImplProps} from './widget-impl';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

/** Properties for the GeolocateWidget */
export type GeolocateWidgetProps = WidgetImplProps & {
  viewId?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  transitionDuration?: number;
};

/**
 * A widget that display a text box that lets user type in a location
 * and a button that moves the view to that location.
 * @todo For now only supports coordinates, Could be extended with location service integrations.
 */
export class GeolocateWidget extends WidgetImpl<GeolocateWidgetProps> {
  static defaultProps: Required<GeolocateWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'geolocate',
    viewId: undefined!,
    placement: 'top-left',
    label: 'Geolocate',
    transitionDuration: 200
  };

  className = 'deck-widget-geolocate';
  placement: WidgetPlacement = 'top-left';

  geolocateText = '';
  geolocateWidth = 10;
  errorText = '';

  constructor(props: GeolocateWidgetProps = {}) {
    super({...GeolocateWidget.defaultProps, ...props});
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<GeolocateWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    render(
      <div className="deck-widget-geolocate">
        <input
          type="text"
          placeholder="-122.45, 37.8 or 37°48'N, 122°27'W"
          value={this.geolocateText}
          onInput={
            // @ts-expect-error event type
            e => this.setInput(e.target?.value || '')
          }
          onKeyPress={this.handleKeyPress}
        />
        <button onClick={this.handleSubmit}>Go</button>
        {this.errorText && <div className="error">{this.errorText}</div>}
      </div>,
      element
    );
  }

  setInput = (text: string) => {
    this.geolocateText = text;
  };

  handleSubmit = () => {
    const coords = parseCoordinates(this.geolocateText);
    if (coords) {
      this.errorText = '';
      this.handleCoordinates(coords);
    } else {
      this.errorText = 'Invalid coordinate format.';
    }
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  };

  handleCoordinates = coordinates => {
    this.setViewState(coordinates);
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

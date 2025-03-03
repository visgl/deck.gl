// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {WidgetPlacement, Viewport} from '@deck.gl/core';
import {render} from 'preact';
import {WidgetImpl, WidgetImplProps} from './widget-impl';
import {IconButton} from './components';

/** Properties for the ScaleWidget */
export type ScaleWidgetProps = WidgetImplProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** Callback, if defined user overrides the capture logic */
  onCapture?: (widget: ScaleWidget) => void;
};

/**
 * A button widget that display a scale
 */
export class ScaleWidget extends WidgetImpl<ScaleWidgetProps> {
  static defaultProps: Required<ScaleWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'scale',
    placement: 'top-left',
    label: 'Scale',
    onCapture: undefined!
  };

  className = 'deck-widget-scale';
  placement: WidgetPlacement = 'top-left';

  scaleText = '';
  scaleWidth = 10;

  constructor(props: ScaleWidgetProps = {}) {
    super({...ScaleWidget.defaultProps, ...props});
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<ScaleWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    render(
      <div
        className="deck-widget-scale"
        style={{width: this.scaleWidth}}
        onClick={this.handleClick.bind(this)}
      >
        {this.scaleText}
      </div>,
      element
    );
  }

  onViewportChange?(viewport: Viewport): void {
    // TODO - handle non-geospatial viewports
    if (!('latitude' in viewport)) {
      return;
    }
    const {latitude, zoom} = viewport as any;
    const metersPerPixel = getMetersPerPixel(latitude, zoom);

    // Define a fixed pixel width for the scale bar (for example, 100px)
    const scaleBarPixelWidth = 100;
    const distanceMeters = metersPerPixel * scaleBarPixelWidth;

    // Format the distance for display (switching to kilometers if large)
    let distanceText;
    if (distanceMeters >= 1000) {
      distanceText = `${(distanceMeters / 1000).toFixed(2)} km`;
    } else {
      distanceText = `${Math.round(distanceMeters)} m`;
    }

    this.scaleText = distanceText;
    this.scaleWidth = scaleBarPixelWidth;

    this.onRenderHTML();
  }

  handleClick() {}
}

// Function to compute meters per pixel at a given latitude and zoom
// For Web Mercator: resolution (m/px) = (Earth Circumference * cos(latitude)) / (2^(zoom+8))
function getMetersPerPixel(latitude, zoom) {
  const earthCircumference = 40075016.686; // in meters
  return (earthCircumference * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom + 8);
}

// Update the scale indicator widget based on the current viewState
function updateScaleIndicator(viewState) {}

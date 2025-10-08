// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, Viewport, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';

export type ScaleWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-left'. */
  placement?: WidgetPlacement;
  /** Label for the scale widget */
  label?: string;
  /** View to attach to and interact with. Required when using multiple views */
  viewId?: string | null;
};

/**
 * A scale widget that displays a Google Maps–like scale indicator.
 * Instead of text inside a div, this widget renders an SVG that contains a horizontal line
 * with two vertical tick marks (extending upward from the line only) and a pretty distance label
 * positioned to the left of the line. The horizontal line’s length is computed from a “nice”
 * candidate distance (e.g. 200, 500, 1000 m, etc.) so that its pixel width is between 100 and 200.
 */
export class ScaleWidget extends Widget<ScaleWidgetProps> {
  static defaultProps: Required<ScaleWidgetProps> = {
    ...Widget.defaultProps,
    id: 'scale',
    placement: 'bottom-left',
    label: 'Scale',
    viewId: null
  };

  className = 'deck-widget-scale';
  placement: WidgetPlacement = 'bottom-left';

  // The pixel width of the scale line (computed from a candidate distance)
  scaleWidth: number = 10;
  // The candidate distance (in meters) corresponding to the scale line length.
  scaleValue: number = 0;
  // The formatted distance label (e.g. "200 m" or "1.0 km")
  scaleText: string = '';

  constructor(props: ScaleWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<ScaleWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    // Reserve space for the text label (to the left of the horizontal line)
    const lineOffsetX = 50;
    // Overall SVG width includes the left offset plus the computed scale line width.
    const svgWidth = lineOffsetX + this.scaleWidth;
    const tickHeight = 10; // vertical tick extends upward by 10 pixels from the horizontal line
    render(
      <svg
        className="deck-widget-scale"
        width={svgWidth}
        height={30}
        style={{overflow: 'visible', background: 'transparent'}}
        onClick={this.handleClick.bind(this)}
      >
        {/* Pretty distance label positioned to the left of the horizontal line */}
        <text
          x={lineOffsetX + 5}
          y="10"
          textAnchor="end"
          alignmentBaseline="middle"
          style={{fontSize: '16px', fill: 'black', fontWeight: 'bold', fontFamily: 'sans-serif'}}
        >
          {this.scaleText}
        </text>
        {/* Horizontal line */}
        <line
          x1={lineOffsetX}
          y1="15"
          x2={lineOffsetX + this.scaleWidth}
          y2="15"
          stroke="black"
          strokeWidth="6"
        />
        {/* Left vertical tick (extending upward from the horizontal line) */}
        <line
          x1={lineOffsetX}
          y1="15"
          x2={lineOffsetX}
          y2={15 - tickHeight}
          stroke="black"
          strokeWidth="6"
        />
        {/* Right vertical tick (extending upward from the horizontal line) */}
        <line
          x1={lineOffsetX + this.scaleWidth}
          y1="15"
          x2={lineOffsetX + this.scaleWidth}
          y2={15 - tickHeight}
          stroke="black"
          strokeWidth="6"
        />
      </svg>,
      rootElement
    );
  }

  onViewportChange(viewport: Viewport): void {
    // Only handle geospatial viewports (which contain latitude)
    if (!('latitude' in viewport)) return;

    const {latitude, zoom} = viewport as {latitude: number; zoom: number};
    const metersPerPixel = getMetersPerPixel(latitude, zoom);
    const {candidate, candidatePixels} = computeScaleCandidate(metersPerPixel);

    this.scaleValue = candidate;
    this.scaleWidth = candidatePixels;
    // Format the candidate distance for display (using km if >= 1000 m)
    if (candidate >= 1000) {
      this.scaleText = `${(candidate / 1000).toFixed(1)} km`;
    } else {
      this.scaleText = `${candidate} m`;
    }
    this.updateHTML();
  }

  handleClick(): void {}
}

/**
 * Compute the meters per pixel at a given latitude and zoom level.
 *
 * @param latitude - The current latitude.
 * @param zoom - The current zoom level.
 * @returns The number of meters per pixel.
 */
function getMetersPerPixel(latitude: number, zoom: number): number {
  const earthCircumference = 40075016.686;
  return (earthCircumference * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom + 8);
}

/**
 * Compute a "nice" scale candidate such that the scale bar width in pixels is between 100 and 200.
 * The candidate distance (in meters) will be one of a set of round numbers (100, 200, 500, 1000, 2000, 5000, etc.).
 *
 * @param metersPerPixel - The number of meters per pixel at the current zoom/latitude.
 * @returns An object containing the candidate distance and its width in pixels.
 */
function computeScaleCandidate(metersPerPixel: number): {
  candidate: number;
  candidatePixels: number;
} {
  const minPixels = 100;
  const maxPixels = 200;
  const targetPixels = (minPixels + maxPixels) / 2;
  const targetDistance = targetPixels * metersPerPixel;

  const exponent = Math.floor(Math.log10(targetDistance));
  const base = Math.pow(10, exponent);
  const multipliers = [1, 2, 5];

  let candidate = multipliers[0] * base;
  let candidatePixels = candidate / metersPerPixel;

  for (let i = 0; i < multipliers.length; i++) {
    const currentCandidate = multipliers[i] * base;
    const currentPixels = currentCandidate / metersPerPixel;
    if (currentPixels >= minPixels && currentPixels <= maxPixels) {
      candidate = currentCandidate;
      candidatePixels = currentPixels;
      break;
    }
    if (currentPixels > maxPixels) {
      candidate = i > 0 ? multipliers[i - 1] * base : currentCandidate;
      candidatePixels = candidate / metersPerPixel;
      break;
    }
    if (i === multipliers.length - 1 && currentPixels < minPixels) {
      candidate = multipliers[0] * base * 10;
      candidatePixels = candidate / metersPerPixel;
    }
  }
  return {candidate, candidatePixels};
}

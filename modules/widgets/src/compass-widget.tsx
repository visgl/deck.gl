// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, FlyToInterpolator, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import type {Viewport, WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';

export type CompassWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message. */
  label?: string;
  /** Bearing and pitch reset transition duration in ms. */
  transitionDuration?: number;
};

export class CompassWidget extends Widget<CompassWidgetProps> {
  static defaultProps: Required<CompassWidgetProps> = {
    ...Widget.defaultProps,
    id: 'compass',
    placement: 'top-left',
    viewId: null,
    label: 'Reset Compass',
    transitionDuration: 200
  };

  className = 'deck-widget-compass';
  placement: WidgetPlacement = 'top-left';
  viewports: {[id: string]: Viewport} = {};

  constructor(props: CompassWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<CompassWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const viewId = this.viewId || Object.values(this.viewports)[0]?.id || 'default-view';
    const widgetViewport = this.viewports[viewId];
    const [rz, rx] = this.getRotation(widgetViewport);

    const ui = (
      <div className="deck-widget-button" style={{perspective: 100}}>
        <button
          type="button"
          onClick={() => {
            for (const viewport of Object.values(this.viewports)) {
              this.handleCompassReset(viewport);
            }
          }}
          title={this.props.label}
          style={{transform: `rotateX(${rx}deg)`}}
        >
          <svg fill="none" width="100%" height="100%" viewBox="0 0 26 26">
            <g transform={`rotate(${rz},13,13)`}>
              <path
                d="M10 13.0001L12.9999 5L15.9997 13.0001H10Z"
                fill="var(--icon-compass-north-color, rgb(240, 92, 68))"
              />
              <path
                d="M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z"
                fill="var(--icon-compass-south-color, rgb(204, 204, 204))"
              />
            </g>
          </svg>
        </button>
      </div>
    );

    render(ui, rootElement);
  }

  onViewportChange(viewport: Viewport) {
    // no need to update if viewport is the same
    if (!viewport.equals(this.viewports[viewport.id])) {
      this.viewports[viewport.id] = viewport;
      this.updateHTML();
    }
  }

  getRotation(viewport?: Viewport) {
    if (viewport instanceof WebMercatorViewport) {
      return [-viewport.bearing, viewport.pitch];
    } else if (viewport instanceof _GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, viewport.latitude))];
    }
    return [0, 0];
  }

  handleCompassReset(viewport: Viewport) {
    const viewId = this.viewId || viewport.id || 'default-view';
    if (viewport instanceof WebMercatorViewport) {
      const nextViewState = {
        ...viewport,
        bearing: 0,
        ...(this.getRotation(viewport)[0] === 0 ? {pitch: 0} : {}),
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new FlyToInterpolator()
      };
      // @ts-ignore Using private method temporary until there's a public one
      this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
    }
  }
}

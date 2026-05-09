// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, FlyToInterpolator, LinearInterpolator, OrthographicView} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement, OrthographicViewState} from '@deck.gl/core';
import {render} from 'preact';
import {ButtonGroup} from './lib/components/button-group';
import {IconButton} from './lib/components/icon-button';

export type ZoomWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Button orientation. */
  orientation?: 'vertical' | 'horizontal';
  /** Tooltip message on zoom in button. */
  zoomInLabel?: string;
  /** Tooltip message on zoom out button. */
  zoomOutLabel?: string;
  /** Zoom transition duration in ms. 0 disables the transition */
  transitionDuration?: number;
  /**  Which axes to apply zoom to. One of 'X', 'Y' or 'all'.
   * Only effective if the current view is OrthographicView.
   */
  zoomAxis?: 'X' | 'Y' | 'all';
  /**
   * Callback when zoom buttons are clicked.
   * Called for each viewport that will be zoomed.
   */
  onZoom?: (params: {
    /** The view being zoomed */
    viewId: string;
    /** Zoom direction: +1 for zoom in, -1 for zoom out */
    delta: number;
    /** The new zoom level */
    zoom: number;
    /** The new zoom level of the X axis, if using OrthographicView */
    zoomX?: number;
    /** The new zoom level of the Y axis, if using OrthographicView */
    zoomY?: number;
  }) => void;
};

export class ZoomWidget extends Widget<ZoomWidgetProps> {
  static defaultProps: Required<ZoomWidgetProps> = {
    ...Widget.defaultProps,
    id: 'zoom',
    placement: 'top-left',
    orientation: 'vertical',
    transitionDuration: 200,
    zoomInLabel: 'Zoom In',
    zoomOutLabel: 'Zoom Out',
    zoomAxis: 'all',
    viewId: null,
    onZoom: () => {}
  };

  className = 'deck-widget-zoom';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ZoomWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<ZoomWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const ui = (
      <ButtonGroup orientation={this.props.orientation}>
        <IconButton
          onClick={() => this.handleZoomIn()}
          label={this.props.zoomInLabel}
          className="deck-widget-zoom-in"
        />
        <IconButton
          onClick={() => this.handleZoomOut()}
          label={this.props.zoomOutLabel}
          className="deck-widget-zoom-out"
        />
      </ButtonGroup>
    );
    render(ui, rootElement);
  }

  isOrthographicView(viewId: string): boolean {
    const deck = this.deck;
    const view = deck?.isInitialized && deck.getView(viewId);
    return view instanceof OrthographicView;
  }

  handleZoom(viewId: string, delta: number) {
    // Respect minZoom/maxZoom constraints from the view state
    const viewState = this.getViewState(viewId);
    const newViewState: Record<string, unknown> = {};

    if (this.isOrthographicView(viewId)) {
      const {zoomAxis} = this.props;
      const {zoomX, minZoomX, maxZoomX, zoomY, minZoomY, maxZoomY} = normalizeOrthographicViewState(
        viewState as any
      );
      let nextZoom: number;
      let nextZoomY: number;
      if (zoomAxis === 'X') {
        nextZoom = clamp(zoomX + delta, minZoomX, maxZoomX);
        nextZoomY = zoomY;
      } else if (zoomAxis === 'Y') {
        nextZoom = zoomX;
        nextZoomY = clamp(zoomY + delta, minZoomY, maxZoomY);
      } else {
        const clampedDelta = clamp(
          delta,
          Math.max(minZoomX - zoomX, minZoomY - zoomY),
          Math.min(maxZoomX - zoomX, maxZoomY - zoomY)
        );
        nextZoom = zoomX + clampedDelta;
        nextZoomY = zoomY + clampedDelta;
      }
      newViewState.zoom = [nextZoom, nextZoomY];
      newViewState.zoomX = nextZoom;
      newViewState.zoomY = nextZoomY;
      // Call callback
      this.props.onZoom?.({
        viewId,
        delta,
        // `zoom` will not match the new state if using 2D zoom. Deprecated behavior for backward compatibility.
        zoom: zoomAxis === 'Y' ? nextZoomY : nextZoom,
        zoomX: nextZoom,
        zoomY: nextZoomY
      });
    } else {
      const {zoom = 0, minZoom, maxZoom} = viewState as any;
      const nextZoom = clamp(zoom + delta, minZoom, maxZoom);
      newViewState.zoom = nextZoom;
      // Call callback
      this.props.onZoom?.({
        viewId,
        delta,
        zoom: nextZoom
      });
    }

    const nextViewState: Record<string, unknown> = {
      ...viewState,
      ...newViewState
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator =
        'latitude' in nextViewState
          ? new FlyToInterpolator()
          : new LinearInterpolator({
              transitionProps: 'zoomX' in newViewState ? ['zoomX', 'zoomY'] : ['zoom']
            });
    }
    this.setViewState(viewId, nextViewState);
  }

  handleZoomIn() {
    for (const viewId of this.viewIds) {
      this.handleZoom(viewId, 1);
    }
  }

  handleZoomOut() {
    for (const viewId of this.viewIds) {
      this.handleZoom(viewId, -1);
    }
  }
}

function clamp(zoom: number, minZoom: number, maxZoom: number): number {
  return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}

function normalizeOrthographicViewState({
  zoom = 0,
  zoomX,
  zoomY,
  minZoom = -Infinity,
  maxZoom = Infinity,
  minZoomX = minZoom,
  maxZoomX = maxZoom,
  minZoomY = minZoom,
  maxZoomY = maxZoom
}: OrthographicViewState): {
  zoomX: number;
  zoomY: number;
  minZoomX: number;
  maxZoomX: number;
  minZoomY: number;
  maxZoomY: number;
} {
  zoomX = zoomX ?? (Array.isArray(zoom) ? zoom[0] : zoom);
  zoomY = zoomY ?? (Array.isArray(zoom) ? zoom[1] : zoom);
  return {zoomX, zoomY, minZoomX, minZoomY, maxZoomX, maxZoomY};
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';
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

  handleZoom(viewId: string, nextZoom: number, delta: number) {
    // Respect minZoom/maxZoom constraints from the view state
    const viewState = this.getViewState(viewId);
    if (viewState) {
      const {minZoom, maxZoom} = viewState as any;
      if (Number.isFinite(minZoom)) {
        nextZoom = Math.max(minZoom, nextZoom);
      }
      if (Number.isFinite(maxZoom)) {
        nextZoom = Math.min(maxZoom, nextZoom);
      }
    }

    // Call callback
    this.props.onZoom?.({viewId, delta, zoom: nextZoom});

    const nextViewState: Record<string, unknown> = {
      ...viewState,
      zoom: nextZoom
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator =
        'latitude' in nextViewState
          ? new FlyToInterpolator()
          : new LinearInterpolator({
              transitionProps: ['zoom']
            });
    }
    this.setViewState(viewId, nextViewState);
  }

  handleZoomIn() {
    const viewIds = this.viewId ? [this.viewId] : (this.deck?.getViews().map(v => v.id) ?? []);
    for (const viewId of viewIds) {
      const viewState = this.getViewState(viewId);
      this.handleZoom(viewId, (viewState.zoom as number) + 1, 1);
    }
  }

  handleZoomOut() {
    const viewIds = this.viewId ? [this.viewId] : (this.deck?.getViews().map(v => v.id) ?? []);
    for (const viewId of viewIds) {
      const viewState = this.getViewState(viewId);
      this.handleZoom(viewId, (viewState.zoom as number) - 1, -1);
    }
  }
}

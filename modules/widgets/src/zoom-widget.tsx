// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, FlyToInterpolator, LinearInterpolator} from '@deck.gl/core';
import {Viewport, WidgetProps, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {ButtonGroup, GroupedIconButton} from './lib/components';

export type ZoomWidgetProps = WidgetProps & {
  /**
   * Widget positioning within the view. Default 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * View to attach to and interact with. Required when using multiple views.
   */
  viewId?: string | null;
  /**
   * Button orientation.
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Tooltip message on zoom in button.
   */
  zoomInLabel?: string;
  /**
   * Tooltip message on zoom out button.
   */
  zoomOutLabel?: string;
  /**
   * Zoom transition duration in ms. 0 disables the transition
   */
  transitionDuration?: number;
};

export class ZoomWidget extends Widget<ZoomWidgetProps> {
  className = 'deck-widget-zoom';
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewports: {[id: string]: Viewport} = {};

  static defaultProps: Required<ZoomWidgetProps> = {
    id: 'zoom',
    style: {},
    placement: 'top-left',
    className: undefined!,
    orientation: 'vertical',
    transitionDuration: 200,
    zoomInLabel: 'Zoom In',
    zoomOutLabel: 'Zoom Out',
    viewId: undefined!
  };

  constructor(props: ZoomWidgetProps = {}) {
    super(props, ZoomWidget.defaultProps);

    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<ZoomWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onViewportChange(viewport: Viewport) {
    this.viewports[viewport.id] = viewport;
  }

  handleZoom(viewport: Viewport, nextZoom: number) {
    const viewId = this.viewId || viewport?.id || 'default-view';
    const nextViewState: Record<string, unknown> = {
      ...viewport,
      zoom: nextZoom
    };
    if (this.props.transitionDuration > 0) {
      nextViewState.transitionDuration = this.props.transitionDuration;
      nextViewState.transitionInterpolator =
        'latitude' in nextViewState ? new FlyToInterpolator() : new LinearInterpolator();
    }
    this.setViewState(viewId, nextViewState);
  }

  handleZoomIn() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom + 1);
    }
  }

  handleZoomOut() {
    for (const viewport of Object.values(this.viewports)) {
      this.handleZoom(viewport, viewport.zoom - 1);
    }
  }

  /**
   * @todo - move to deck or widget manager
   */
  private setViewState(viewId: string, viewState: Record<string, unknown>): void {
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState, interactionState: {}});
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const ui = (
      <ButtonGroup orientation={this.props.orientation}>
        <GroupedIconButton
          onClick={() => this.handleZoomIn()}
          label={this.props.zoomInLabel}
          className="deck-widget-zoom-in"
        />
        <GroupedIconButton
          onClick={() => this.handleZoomOut()}
          label={this.props.zoomOutLabel}
          className="deck-widget-zoom-out"
        />
      </ButtonGroup>
    );
    render(ui, rootElement);
  }
}

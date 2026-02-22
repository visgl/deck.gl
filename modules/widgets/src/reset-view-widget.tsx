// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, WidgetProps} from '@deck.gl/core';
import type {ViewStateMap, View} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

/** @note Mirrors an internal calss in deck.gl/core. We can easily redefine it here */
type ViewOrViews = View | View[] | null;

/** Properties for the ResetViewWidget */
export type ResetViewWidgetProps<ViewsT extends ViewOrViews = null> = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** View to interact with. Required when using multiple views. */
  viewId?: string | null;
  /** The initial view state to reset the view to. Defaults to deck.props.initialViewState */
  initialViewState?: ViewStateMap<ViewsT>;
  /** Callback to manually reset the view state */
  onResetView?: () => void;
};

/**
 * A button widget that resets the view state of deck to an initial state.
 */
export class ResetViewWidget<ViewsT extends ViewOrViews = null> extends Widget<
  ResetViewWidgetProps<ViewsT>,
  ViewsT
> {
  static defaultProps: Required<ResetViewWidgetProps> = {
    ...Widget.defaultProps,
    id: 'reset-view',
    placement: 'top-left',
    label: 'Reset View',
    initialViewState: undefined!,
    viewId: null,
    onResetView: undefined!
  };

  className = 'deck-widget-reset-view';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ResetViewWidgetProps<ViewsT> = {}) {
    super(props);
    this.setProps(this.props);
  }

  // Operations

  resetView() {
    if (this.props.onResetView) {
      this.props.onResetView();
      return;
    }
    const initialViewState = this.props.initialViewState || this.deck?.props.initialViewState;
    this.setViewState(initialViewState);
  }

  // Lifecycle

  setProps(props: Partial<ResetViewWidgetProps<ViewsT>>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <IconButton
        className="deck-widget-reset-focus"
        label={this.props.label}
        onClick={this.resetView.bind(this)}
      />,
      rootElement
    );
  }

  setViewState(viewState?: ViewStateMap<ViewsT>) {
    const viewId = (this.props.viewId || 'default-view') as unknown as string;
    const nextViewState = {
      ...(viewId !== 'default-view' ? viewState?.[viewId] : viewState)
      // only works for geospatial?
      // transitionDuration: this.props.transitionDuration,
      // transitionInterpolator: new FlyToInterpolator()
    };
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }
}

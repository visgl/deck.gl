// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

/** Properties for the ResetViewWidget */
export type ResetViewWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** The initial view state to reset the view to. Defaults to deck.props.initialViewState */
  initialViewState?: ViewState;
  /** View to interact with. Required when using multiple views. */
  viewId?: string | null;
};

/**
 * A button widget that resets the view state of deck to an initial state.
 */
export class ResetViewWidget extends Widget<ResetViewWidgetProps> {
  static defaultProps: Required<ResetViewWidgetProps> = {
    ...Widget.defaultProps,
    id: 'reset-view',
    placement: 'top-left',
    label: 'Reset View',
    initialViewState: undefined!,
    viewId: null
  };

  className = 'deck-widget-reset-view';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ResetViewWidgetProps = {}) {
    super(props, ResetViewWidget.defaultProps);
    this.setProps(this.props);
  }

  setProps(props: Partial<ResetViewWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <IconButton
        className="deck-widget-reset-focus"
        label={this.props.label}
        onClick={this.handleClick.bind(this)}
      />,
      rootElement
    );
  }

  handleClick() {
    const initialViewState = this.props.initialViewState || this.deck?.props.initialViewState;
    this.setViewState(initialViewState);
  }

  setViewState(viewState: ViewState) {
    const viewId = (this.props.viewId || viewState?.id || 'default-view') as unknown as string;
    const nextViewState = {
      ...(viewId !== 'default-view' ? viewState[viewId] : viewState)
      // only works for geospatial?
      // transitionDuration: this.props.transitionDuration,
      // transitionInterpolator: new FlyToInterpolator()
    };
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {WidgetImpl, WidgetImplProps} from './widget-impl';
import {IconButton} from './components';

/** @todo - is the the best we can do? */
type ViewState = Record<string, unknown>;

/** Properties for the ResetViewWidget */
export type ResetViewWidgetProps = WidgetImplProps & {
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
export class ResetViewWidget extends WidgetImpl<ResetViewWidgetProps> {
  static defaultProps: Required<ResetViewWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'reset-view',
    placement: 'top-left',
    label: 'Reset View',
    initialViewState: undefined!,
    viewId: undefined!
  };

  className = 'deck-widget-reset-view';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ResetViewWidgetProps = {}) {
    super({...ResetViewWidget.defaultProps, ...props});
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<ResetViewWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    render(
      <IconButton
        className="deck-widget-reset-focus"
        label={this.props.label}
        onClick={this.handleClick.bind(this)}
      />,
      element
    );
  }

  handleClick() {
    const initialViewState = this.props.initialViewState || this.deck?.props.initialViewState;
    this.setViewState(initialViewState);
  }

  setViewState(viewState: ViewState) {
    const viewId = this.props.viewId || viewState?.id || 'default-view';
    const nextViewState = {
      ...viewState
      // only works for geospatial?
      // transitionDuration: this.props.transitionDuration,
      // transitionInterpolator: new FlyToInterpolator()
    };
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }
}

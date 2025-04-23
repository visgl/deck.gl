// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {Widget, WidgetProps} from '@deck.gl/core';
import {IconButton} from './lib/components';

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
  viewId?: string;
  /** Set to 0 to disable transitions */
  transitionDurationMs?: number;
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
    viewId: undefined!,
    transitionDurationMs: 200,
  };

  className = 'deck-widget-reset-view';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ResetViewWidgetProps = {}) {
    super(props, ResetViewWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<ResetViewWidgetProps>) {
    this.placement = props.placement ?? this.placement;
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
    this.setViewState({
      viewState: initialViewState, 
      viewId: this.props.viewId, 
      transitionDurationMs: this.props.transitionDurationMs
    });
  }
}

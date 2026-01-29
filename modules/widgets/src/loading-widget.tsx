// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, Layer, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

/** Properties for the LoadingWidget */
export type LoadingWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views */
  viewId?: string | null;
  /** Tooltip message when loading */
  label?: string;
};

/**
 * A non-interactive widget that shows a loading spinner if any layers are loading data
 */
export class LoadingWidget extends Widget<LoadingWidgetProps> {
  static defaultProps: Required<LoadingWidgetProps> = {
    ...Widget.defaultProps,
    id: 'loading',
    placement: 'top-left',
    viewId: null,
    label: 'Loading layer data'
  };

  className = 'deck-widget-loading';
  placement: WidgetPlacement = 'top-left';
  loading = true;

  constructor(props: LoadingWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<LoadingWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      // TODO(ibgreen) - this should not be a button, but styling is so nested that it is easier to reuse this component.
      this.loading && (
        <IconButton
          className="deck-widget-spinner"
          label={this.props.label}
          onClick={this.handleClick.bind(this)}
        />
      ),
      rootElement
    );
  }

  onRedraw({layers}: {layers: Layer[]}): void {
    const loading = layers.some(layer => !layer.isLoaded);
    if (loading !== this.loading) {
      this.loading = loading;
      this.updateHTML();
    }
  }

  // TODO(ibgreen) - this should not be a button, see above.
  handleClick() {}
}

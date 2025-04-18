// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, Layer} from '@deck.gl/core';
import {render} from 'preact';
import {Widget, WidgetProps} from '@deck.gl/core';
import {IconButton} from './lib/components';

/** Properties for the LoadingWidget */
export type LoadingWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
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
    label: 'Loading layer data'
  };

  className = 'deck-widget-loading';
  placement: WidgetPlacement = 'top-left';
  loading = true;

  constructor(props: LoadingWidgetProps = {}) {
    super(props, LoadingWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<LoadingWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      // TODO(ibgreen) - this should not be a button, but styling is so nested that it is easier to reuse this component.
      this.loading && (
        <IconButton
          className="deck-widget-spinner-icon"
          label={this.props.label}
          onClick={this.handleClick.bind(this)}
        />
      ),
      rootElement
    );
  }

  onRedraw({layers}: {layers: Layer[]}): void {
    const loading = !layers.some(layer => !layer.isLoaded);
    if (loading !== this.loading) {
      this.loading = loading;
      this.updateHTML();
    }
  }

  // TODO(ibgreen) - this should not be a button, see above.
  handleClick() {}
}

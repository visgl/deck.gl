// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, Layer, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';
import {Tooltip} from './lib/components/tooltip';

/** Properties for the LoadingWidget */
export type LoadingWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views */
  viewId?: string | null;
  /** Status label shown when loading */
  label?: string;
  /** Optional tooltip content. */
  tooltip?: string | HTMLElement | false;
  /**
   * Callback when the loading state changes.
   * Called when layers transition between loading and loaded states.
   */
  onLoadingChange?: (loading: boolean) => void;
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
    label: 'Loading layer data',
    tooltip: undefined!,
    onLoadingChange: () => {}
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
    if (!this.loading) {
      render(null, rootElement);
      return;
    }

    const {label, tooltip} = this.props;
    const status = (
      <div
        className="deck-widget-loading-status"
        role="status"
        style={tooltip ? {pointerEvents: 'auto'} : undefined}
      >
        <span className="deck-widget-spinner" aria-hidden="true" />
        {label}
      </div>
    );
    render(tooltip ? <Tooltip content={tooltip}>{status}</Tooltip> : status, rootElement);
  }

  onRedraw({layers}: {layers: Layer[]}): void {
    const loading = layers.some(layer => !layer.isLoaded);
    if (loading !== this.loading) {
      this.loading = loading;

      // Call callback when loading state changes
      this.props.onLoadingChange?.(loading);

      this.updateHTML();
    }
  }
}

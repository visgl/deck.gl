// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, WidgetProps} from '@deck.gl/core';
import type {WidgetPlacement, Deck} from '@deck.gl/core';

/** Properties for the FpsWidget. */
export type FpsWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
};

/**
 * Displays the average frames per second reported by the Deck instance.
 */
export class FpsWidget extends Widget<FpsWidgetProps> {
  static defaultProps: Required<FpsWidgetProps> = {
    ...Widget.defaultProps,
    id: 'fps',
    placement: 'top-left'
  };

  className = 'deck-widget-fps';
  placement: WidgetPlacement = 'top-left';

  private _lastFps: number = -1;

  constructor(props: FpsWidgetProps = {}) {
    super(props, FpsWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<FpsWidgetProps>): void {
    if (props.placement) {
      this.placement = props.placement;
    }
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const fps = this._getFps();
    rootElement.innerText = `FPS:\n${fps}`;
    rootElement.style.backgroundColor = 'white';
    rootElement.style.fontFamily = 'sans-serif';
    rootElement.style.fontSize = '8px';
    rootElement.style.fontWeight = '700'; // Make font bolder on click
  }

  onRedraw({}: {viewports: any[]; layers: any[]}): void {
    const fps = this._getFps();
    if (fps !== this._lastFps) {
      this._lastFps = fps;
      this.updateHTML();
    }
  }

  onAdd({}: {deck: Deck<any>; viewId: string | null}): void {
    this._lastFps = this._getFps();
    this.updateHTML();
  }

  _getFps(): number {
    // @ts-expect-error protected
    return Math.round(this.deck.metrics.fps ?? 0);
  }
}

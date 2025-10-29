// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget} from '@deck.gl/core';
import {render} from 'preact';
import type {WidgetPlacement, Deck, WidgetProps} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

/** Properties for the FpsWidget. */
export type FpsWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
};

/**
 * Displays the average frames per second reported by the Deck instance.
 */
export class FpsWidget extends Widget<FpsWidgetProps> {
  static defaultProps: Required<FpsWidgetProps> = {
    ...Widget.defaultProps,
    id: 'fps',
    placement: 'top-left',
    viewId: null
  };

  className = 'deck-widget-fps';
  placement: WidgetPlacement = 'top-left';

  private _lastFps: number = -1;

  constructor(props: FpsWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<FpsWidgetProps>): void {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd({}: {deck: Deck<any>; viewId: string | null}): void {
    this._lastFps = this._getFps();
    requestAnimationFrame(() => this._animate());
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const fps = this._getFps();
    render(
      <IconButton>
        <div className="text">
          FPS
          <br />
          {fps}
        </div>
      </IconButton>,
      rootElement
    );
  }

  _animate(): void {
    const fps = this._getFps();
    if (this._lastFps !== fps) {
      this._lastFps = fps;
      this.updateHTML();
    }
    requestAnimationFrame(() => this._animate());
  }

  _getFps(): number {
    // @ts-expect-error protected
    return Math.round(this.deck?.metrics.fps ?? 0);
  }
}

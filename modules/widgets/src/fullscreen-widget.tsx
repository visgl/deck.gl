// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {log, Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

/* eslint-enable max-len */

export type FullscreenWidgetProps = WidgetProps & {
  id?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message when out of fullscreen. */
  enterLabel?: string;
  /** Tooltip message when fullscreen. */
  exitLabel?: string;
  /**
   * A compatible DOM element which should be made full screen. By default, the map container element will be made full screen.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements
   */
  container?: HTMLElement;
};

export class FullscreenWidget extends Widget<FullscreenWidgetProps> {
  static defaultProps: Required<FullscreenWidgetProps> = {
    ...Widget.defaultProps,
    id: 'fullscreen',
    placement: 'top-left',
    viewId: null,
    enterLabel: 'Enter Fullscreen',
    exitLabel: 'Exit Fullscreen',
    container: undefined!
  };

  className = 'deck-widget-fullscreen';
  placement: WidgetPlacement = 'top-left';
  fullscreen: boolean = false;

  constructor(props: FullscreenWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  onAdd(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  onRemove() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <IconButton
        onClick={() => {
          this.handleClick().catch(err => log.error(err)());
        }}
        label={this.fullscreen ? this.props.exitLabel : this.props.enterLabel}
        className={this.fullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />,
      rootElement
    );
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  getContainer() {
    return this.props.container || this.deck?.getCanvas()?.parentElement;
  }

  onFullscreenChange() {
    const prevFullscreen = this.fullscreen;
    const fullscreen = document.fullscreenElement === this.getContainer();
    if (prevFullscreen !== fullscreen) {
      this.fullscreen = !this.fullscreen;
    }
    this.updateHTML();
  }

  async handleClick() {
    if (this.fullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    this.updateHTML();
  }

  async requestFullscreen() {
    const container = this.getContainer();
    if (container?.requestFullscreen) {
      await container.requestFullscreen({navigationUI: 'hide'});
    } else {
      this.togglePseudoFullscreen();
    }
  }

  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      this.togglePseudoFullscreen();
    }
  }

  togglePseudoFullscreen() {
    this.getContainer()?.classList.toggle('deck-pseudo-fullscreen');
  }
}

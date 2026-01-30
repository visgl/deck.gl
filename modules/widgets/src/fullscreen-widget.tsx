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
  /**
   * Controlled fullscreen state. When provided, the widget is in controlled mode.
   * Note: The actual fullscreen state is managed by the browser. This prop controls
   * the widget's visual state and determines whether clicking triggers enter or exit.
   */
  fullscreen?: boolean;
  /**
   * Callback when fullscreen state changes (via user click or browser fullscreen events).
   * In controlled mode, use this to update the fullscreen prop.
   */
  onFullscreenChange?: (fullscreen: boolean) => void;
};

export class FullscreenWidget extends Widget<FullscreenWidgetProps> {
  static defaultProps: Required<FullscreenWidgetProps> = {
    ...Widget.defaultProps,
    id: 'fullscreen',
    placement: 'top-left',
    viewId: null,
    enterLabel: 'Enter Fullscreen',
    exitLabel: 'Exit Fullscreen',
    container: undefined!,
    fullscreen: undefined!,
    onFullscreenChange: () => {}
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
    const isFullscreen = this.getFullscreen();
    render(
      <IconButton
        onClick={() => {
          this.handleClick().catch(err => log.error(err)());
        }}
        label={isFullscreen ? this.props.exitLabel : this.props.enterLabel}
        className={isFullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />,
      rootElement
    );
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);

    // Handle controlled mode - update HTML when controlled prop changes
    if (props.fullscreen !== undefined) {
      this.updateHTML();
    }
  }

  getContainer() {
    return this.props.container || this.deck?.getCanvas()?.parentElement;
  }

  /**
   * Returns the current fullscreen state.
   * In controlled mode, returns the fullscreen prop.
   * In uncontrolled mode, returns the internal state.
   */
  getFullscreen(): boolean {
    return this.props.fullscreen ?? this.fullscreen;
  }

  onFullscreenChange() {
    const fullscreen = document.fullscreenElement === this.getContainer();

    // Always call callback if provided
    this.props.onFullscreenChange?.(fullscreen);

    // Only update internal state if uncontrolled
    if (this.props.fullscreen === undefined) {
      this.fullscreen = fullscreen;
    }

    this.updateHTML();
  }

  async handleClick() {
    const isFullscreen = this.getFullscreen();
    if (isFullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    // Note: updateHTML is called by onFullscreenChange event handler
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

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

/** Class that expands a container to the viewport. */
const FALLBACK_CLASS = 'deck-pseudo-fullscreen';
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
  /** Custom tooltip content when out of fullscreen. Overrides enterLabel for tooltip display. */
  enterTooltip?: string | HTMLElement | false;
  /** Custom tooltip content when fullscreen. Overrides exitLabel for tooltip display. */
  exitTooltip?: string | HTMLElement | false;
  /**
   * A compatible DOM element which should be made full screen. By default, the map container element will be made full screen.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements
   */
  container?: HTMLElement;
  /**
   * Callback when fullscreen state changes (via user click or browser fullscreen events).
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
    enterTooltip: undefined!,
    exitTooltip: undefined!,
    container: undefined!,
    onFullscreenChange: () => {}
  };

  className = 'deck-widget-fullscreen';
  placement: WidgetPlacement = 'top-left';
  fullscreen: boolean = false;
  /** Mounted widget root used to render the fullscreen button. */
  private root: HTMLElement | null = null;
  /** Document on which the widget listens for native fullscreen changes. */
  private ownerDocument: Document | null = null;
  /** Cancelled on exit or removal so a native request that settles later cannot enter fullscreen. */
  private pending: {cancelled: boolean} | null = null;
  /** Container this widget successfully put into native fullscreen. */
  private nativeTarget: HTMLElement | null = null;
  /** Cleanup for the active fallback, or null outside fallback. */
  private restoreFallback: (() => void) | null = null;

  constructor(props: FullscreenWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  /** Release fullscreen and detach listeners when the widget is removed. */
  async onRemove() {
    if (this.pending) this.pending.cancelled = true;
    this.ownerDocument?.removeEventListener('fullscreenchange', this.handleNativeChange);
    this.ownerDocument = null;
    const native = this.nativeTarget;
    this.nativeTarget = null;
    this.restoreFallback?.();
    this.restoreFallback = null;
    this.fullscreen = false;
    if (this.root) render(null, this.root);
    this.root = null;
    if (native && native.ownerDocument.fullscreenElement === native) {
      try {
        await native.ownerDocument.exitFullscreen();
      } catch {
        // Removing the container can exit fullscreen before this request completes.
      }
    }
  }

  /** Render the toggle button and listen for native fullscreen changes. */
  onRenderHTML(rootElement: HTMLElement): void {
    this.root = rootElement;
    if (this.ownerDocument !== rootElement.ownerDocument) {
      this.ownerDocument?.removeEventListener('fullscreenchange', this.handleNativeChange);
      this.ownerDocument = rootElement.ownerDocument;
      this.ownerDocument.addEventListener('fullscreenchange', this.handleNativeChange);
    }
    const isFullscreen = this.getFullscreen();
    render(
      <IconButton
        onClick={async () => {
          try {
            await this.handleClick();
          } catch (error) {
            log.error(String(error))();
          }
        }}
        label={isFullscreen ? this.props.exitLabel : this.props.enterLabel}
        tooltip={isFullscreen ? this.props.exitTooltip : this.props.enterTooltip}
        className={isFullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />,
      rootElement
    );
  }

  /** Apply new widget props and exit fullscreen if the target changes. */
  setProps(props: Partial<FullscreenWidgetProps>) {
    if ('container' in props && props.container !== this.props.container) {
      void this.exitForContainerChange();
    }
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  private async exitForContainerChange() {
    try {
      await this.exitFullscreen();
    } catch (error) {
      log.error(String(error))();
    }
  }

  getContainer() {
    return this.props.container || this.deck?.props.parent || this.deck?.getCanvas()?.parentElement;
  }

  getFullscreen(): boolean {
    return this.fullscreen;
  }

  /** Keep a stable listener reference for cleanup. */
  private handleNativeChange = () => this.onFullscreenChange();

  /** Synchronize the widget with browser fullscreen changes. */
  onFullscreenChange() {
    const container = this.getContainer();
    const native = Boolean(container && container.ownerDocument.fullscreenElement === container);
    if (this.restoreFallback) {
      if (!container?.ownerDocument.fullscreenElement) return;
      this.closeFallback();
    }
    if (!native) this.nativeTarget = null;
    if (native && this.pending?.cancelled) return;
    this.setFullscreen(native);
  }

  /** Notify subscribers and update the button after a state transition. */
  private setFullscreen(fullscreen: boolean) {
    if (fullscreen !== this.fullscreen) {
      this.fullscreen = fullscreen;
      this.props.onFullscreenChange?.(fullscreen);
      this.updateHTML();
    }
  }

  /** Toggle fullscreen once the previous entry request has settled. */
  async handleClick() {
    if (this.pending) return;
    if (this.fullscreen) await this.exitFullscreen();
    else await this.requestFullscreen();
  }

  /** Request native fullscreen and use the viewport fallback if unavailable. */
  async requestFullscreen() {
    const container = this.getContainer();
    if (!container?.isConnected || this.fullscreen || this.pending) return;

    const doc = container.ownerDocument;
    const request = {cancelled: false};
    this.pending = request;
    try {
      try {
        if (container.requestFullscreen) await container.requestFullscreen({navigationUI: 'hide'});
      } catch {
        // A browser can expose the API but deny fullscreen for this element.
      }
      if (request.cancelled) {
        if (doc.fullscreenElement === container) await doc.exitFullscreen();
        return;
      }
      if (doc.fullscreenElement === container) {
        this.nativeTarget = container;
        this.setFullscreen(true);
        return;
      }
      if (container.isConnected && !doc.fullscreenElement) this.openFallback(container);
    } finally {
      this.pending = null;
    }
  }

  /** Exit the active fullscreen mode and cancel pending entry. */
  async exitFullscreen() {
    if (this.pending) this.pending.cancelled = true;
    if (this.restoreFallback) {
      this.closeFallback();
      return;
    }

    const target = this.nativeTarget || this.getContainer();
    if (target && target.ownerDocument.fullscreenElement === target) {
      await target.ownerDocument.exitFullscreen();
    }
    this.nativeTarget = null;
    this.setFullscreen(false);
  }

  /** Toggle the viewport fallback directly. */
  togglePseudoFullscreen() {
    if (this.restoreFallback) {
      this.closeFallback();
    } else {
      const container = this.getContainer();
      if (container && !container.ownerDocument.fullscreenElement) this.openFallback(container);
    }
  }

  /** Restore the page and notify subscribers that fallback has ended. */
  private closeFallback() {
    const restore = this.restoreFallback;
    this.restoreFallback = null;
    restore?.();
    this.setFullscreen(false);
  }

  /** Expand the existing container, using the top layer to escape clipping ancestors. */
  private openFallback(container: HTMLElement) {
    container.classList.add(FALLBACK_CLASS);
    let popover = false;
    if (typeof container.showPopover === 'function' && !container.hasAttribute('popover')) {
      container.setAttribute('popover', 'manual');
      try {
        container.showPopover();
        popover = true;
      } catch {
        container.removeAttribute('popover');
      }
    }

    this.restoreFallback = () => {
      if (popover) {
        container.hidePopover();
        container.removeAttribute('popover');
      }
      container.classList.remove(FALLBACK_CLASS);
    };
    this.setFullscreen(true);
  }
}

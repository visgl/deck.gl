// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget} from '@deck.gl/core';
import type {Deck, Viewport, WidgetProps} from '@deck.gl/core';
import {render, JSX} from 'preact';
import {Popover, type PopoverProps} from './lib/components/popover';
import {UserContent} from './lib/components/user-content';
import {IconButton} from './lib/components/icon-button';

export type PopupContent = {
  text?: string;
  html?: string;
  element?: HTMLElement | null;
};

export type PopupWidgetProps = WidgetProps & {
  /** View to attach to and interact with. Required when using multiple views */
  viewId?: string | null;
  /** Content to display at the anchor. Opens the popup if clicked. */
  marker?: PopupContent | null;
  /** Content to display in the popup */
  content: string | PopupContent;
  /** Whether the pop up is open by default
   * @default true
   */
  defaultIsOpen?: boolean;
  /** Anchor of the popup in world coordinates, e.g. [longitude, latitude]. */
  position: number[];
  /** Position popup relative to the anchor.
   * @default 'right'
   */
  placement?: PopoverProps['placement'];
  /** Pixel offset
   * @default 10
   */
  offset?: PopoverProps['offset'];
  /**
   * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
   * @default 10
   */
  arrow?: PopoverProps['arrow'];
  /** Whether to show a close button in the popup
   * @default true
   */
  closeButton?: boolean;
  /** Close the popup if clicked outside
   * @default false
   */
  closeOnClickOutside?: boolean;
  /** Callback when popup is opened/closed */
  onOpenChange?: (isOpen: boolean) => void;
};

export class PopupWidget extends Widget<PopupWidgetProps> {
  static defaultProps: Required<PopupWidgetProps> = {
    ...Widget.defaultProps,
    id: 'info',
    viewId: null,
    position: [0, 0],
    marker: null,
    defaultIsOpen: true,
    content: '',
    placement: 'right',
    offset: 10,
    arrow: 10,
    closeButton: true,
    closeOnClickOutside: false,
    onOpenChange: () => {}
  };

  className = 'deck-widget-popup';
  placement = 'fill' as const;
  viewport?: Viewport;
  isOpen: boolean;

  constructor(props: PopupWidgetProps) {
    super(props);
    this.setProps(this.props);
    this.isOpen = this.props.defaultIsOpen;
  }

  setProps(props: Partial<PopupWidgetProps>) {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd({deck}: {deck: Deck<any>; viewId: string | null}) {
    this.deck = deck;
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.updateHTML();
  }

  onClick() {
    if (this.props.closeOnClickOutside) {
      this._setIsOpen(false);
    }
  }

  protected _setIsOpen(isOpen: boolean) {
    if (this.isOpen === isOpen) return;
    this.isOpen = isOpen;
    this.props.onOpenChange?.(isOpen);
    this.updateHTML();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    if (!this.viewport) {
      render(null, rootElement);
      return;
    }
    const {marker, content, style} = this.props;
    // Project the clicked geographic coordinate to canvas (x, y)
    const [x, y] = this.viewport.project(this.props.position);
    const background = style.backgroundColor || style.background || 'white';

    // Render the popup container with a content box and a placeholder for the arrow.
    // The container is positioned absolutely (initially at 0,0) and will be repositioned after measuring.
    const ui = (
      <div>
        {marker && (
          <div
            style={{position: 'absolute', left: x, top: y, pointerEvents: 'all', cursor: 'pointer'}}
          >
            <UserContent {...marker} onClick={() => this._setIsOpen(true)} />
          </div>
        )}
        {this.isOpen && (
          <Popover
            x={x}
            y={y}
            placement={this.props.placement}
            arrow={this.props.arrow}
            arrowColor={background}
            offset={this.props.offset}
          >
            <div
              className={`deck-widget-popup-content ${this.props.className}`}
              style={{
                background,
                padding: '10px',
                boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.15)',
                ...(style as JSX.CSSProperties)
              }}
            >
              <IconButton
                className="deck-widget-popup-close-button"
                onClick={() => this._setIsOpen(false)}
              />
              <UserContent {...(typeof content === 'string' ? {text: content} : content)} />
            </div>
          </Popover>
        )}
      </div>
    );
    render(ui, rootElement);
  }
}

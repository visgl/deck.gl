// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {Widget} from '@deck.gl/core';
import type {Deck, PickingInfo, WidgetProps} from '@deck.gl/core';
import {render, type JSX} from 'preact';
import {SimpleMenu, SimpleMenuProps} from './lib/components/dropdown-menu';
import {Popover, type PopoverProps} from './lib/components/popover';

export type ContextMenuWidgetProps = WidgetProps & {
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Provide menu items for the menu given the picked object */
  getMenuItems: (
    info: PickingInfo,
    widget: ContextMenuWidget
  ) => SimpleMenuProps['menuItems'] | null;
  /** Callback with the selected item */
  onMenuItemSelected?: (value: string, pickInfo: PickingInfo | null) => void;
  /** Position menu relative to the anchor.
   * @default 'bottom-start'
   */
  placement?: PopoverProps['placement'];
  /** Pixel offset
   * @default 10
   */
  offset?: PopoverProps['offset'];
  /**
   * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
   * @default false
   */
  arrow?: PopoverProps['arrow'];
};

export class ContextMenuWidget extends Widget<ContextMenuWidgetProps> {
  static defaultProps: Required<ContextMenuWidgetProps> = {
    ...Widget.defaultProps,
    id: 'context',
    viewId: null,
    getMenuItems: undefined!,
    onMenuItemSelected: () => {},
    placement: 'bottom-start',
    offset: 10,
    arrow: false
  };

  className = 'deck-widget-context-menu';
  placement = 'fill' as const;

  menu: {
    items: SimpleMenuProps['menuItems'];
    pickInfo: PickingInfo;
  } | null = null;

  constructor(props: ContextMenuWidgetProps) {
    super(props);
    this.setProps(this.props);
  }

  onAdd({deck}: {deck: Deck<any>}) {
    deck.getCanvas()?.addEventListener('contextmenu', event => this.handleContextMenu(event));
  }

  handleContextMenu(srcEvent: MouseEvent) {
    const targetRect = (srcEvent.target as HTMLElement).getBoundingClientRect();
    const x = srcEvent.clientX - targetRect.x;
    const y = srcEvent.clientY - targetRect.y;

    const pickInfo = this.deck?.pickObject({x, y}) || {
      x,
      y,
      picked: false,
      layer: null,
      color: null,
      index: -1,
      pixelRatio: 1
    };
    const menuItems = this.props.getMenuItems(pickInfo, this) || [];
    this.menu =
      menuItems.length > 0
        ? {
            items: menuItems,
            pickInfo
          }
        : null;
    srcEvent.preventDefault();
    this.updateHTML();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    if (!this.menu) {
      render(null, rootElement);
      return;
    }
    const {items, pickInfo} = this.menu;

    const style = {
      pointerEvents: 'auto',
      position: 'static',
      ...this.props.style
    };

    const ui = (
      <Popover
        x={pickInfo.x}
        y={pickInfo.y}
        placement={this.props.placement}
        arrow={this.props.arrow}
        arrowColor="var(--menu-background, #fff)"
        offset={this.props.offset}
      >
        <SimpleMenu
          menuItems={items}
          onSelect={value => this.props.onMenuItemSelected(value, pickInfo)}
          style={style}
          isOpen
          onClose={() => this.hide()}
        />
      </Popover>
    );
    render(ui, rootElement);
  }

  hide() {
    this.menu = null;
    this.updateHTML();
  }
}

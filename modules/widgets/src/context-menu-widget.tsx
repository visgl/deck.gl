/* global document */
import {picking, Widget, WidgetProps} from '@deck.gl/core';
import type {Deck, PickingInfo} from '@deck.gl/core';
import {render, JSX} from 'preact';
import {SimpleMenu} from './lib/simple-menu';

export type ContextWidgetMenuItem = {
  label: string;
  key: string;
};

export type ContextMenuWidgetProps = WidgetProps & {
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Controls visibility of the context menu */
  visible?: boolean;
  /** Screen position at which to place the menu */
  position: {x: number; y: number};
  /** Optional styling applied to the dropdown menu */
  style?: JSX.CSSProperties;
  /** Items to render */
  menuItems: ContextWidgetMenuItem[];
  /** Provide menu items for the menu given the picked object */
  getMenuItems: (info: PickingInfo, widget: ContextMenuWidget) => ContextWidgetMenuItem[] | null;
  /** Callback with the selected item */
  onMenuItemSelected?: (key: string, pickInfo: PickingInfo | null) => void;
};

export class ContextMenuWidget extends Widget<ContextMenuWidgetProps> {
  static defaultProps: Required<ContextMenuWidgetProps> = {
    ...Widget.defaultProps,
    viewId: null,
    visible: false,
    position: {x: 0, y: 0},
    style: undefined!,
    getMenuItems: undefined!,
    menuItems: [],
    onMenuItemSelected: (key, pickInfo) => console.log('Context menu item selected:', key, pickInfo)
  };

  className = 'deck-widget-context-menu';
  placement = 'fill' as const;

  pickInfo: PickingInfo | null = null;

  constructor(props: ContextMenuWidgetProps) {
    super(props, ContextMenuWidget.defaultProps);
    this.pickInfo = null;
    this.setProps(props);
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-context-menu');
    const style = {
      margin: '0px',
      top: '0px',
      left: '0px',
      position: 'absolute',
      pointerEvents: 'auto'
    };
    Object.entries(style).forEach(([key, value]) => element.style.setProperty(key, value));

    deck.getCanvas()?.addEventListener('click', () => this.hide());
    deck.getCanvas()?.addEventListener('contextmenu', event => this.handleContextMenu(event));
    return element;
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {visible, position, menuItems, style} = this.props;

    const ui =
      visible && menuItems.length ? (
        <SimpleMenu
          menuItems={menuItems}
          onItemSelected={key => this.props.onMenuItemSelected(key, this.pickInfo)}
          position={position}
          style={{pointerEvents: 'auto'}}
        />
      ) : null;
    render(ui, rootElement);
  }

  handleContextMenu(srcEvent: MouseEvent): boolean {
    if (srcEvent && (srcEvent.button === 2 || srcEvent.which === 3)) {
      this.pickInfo =
        this.deck?.pickObject({
          x: srcEvent.clientX,
          y: srcEvent.clientY
        }) || null;
      const menuItems = (this.pickInfo && this.props.getMenuItems?.(this.pickInfo, this)) || [];
      const visible = menuItems.length > 0;
      this.setProps({
        visible,
        position: {x: srcEvent.clientX, y: srcEvent.clientY},
        menuItems
      });
      this.updateHTML();
      srcEvent.preventDefault();
      return visible;
    }

    return false;
  }

  hide(): void {
    this.setProps({visible: false});
  }
}

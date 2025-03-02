/* global document */
import type {Deck, PickingInfo, Viewport, Widget} from '@deck.gl/core';
import {render} from 'preact';

export type PopupWidgetProps = {
  id: string;
  /**
   * View to attach to and interact with. Required when using multiple views.
   */
  viewId?: string | null;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;
  /**
   * Position at which to place popup
   */
  position: [number, number];
  /**
   * Text of popup
   */
  text?: string;

  visible?: boolean;

  onClick?: (widget: PopupWidget, info: PickingInfo) => boolean;
};

export class PopupWidget implements Widget<PopupWidgetProps> {
  id = 'popup';
  props: PopupWidgetProps;
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: PopupWidgetProps) {
    this.id = props.id || 'popup';
    this.viewId = props.viewId || null;
    props.style = props.style || {};
    props.position = props.position || [0, 0];
    props.text = props.text || '';
    props.visible = props.visible || false;
    this.props = props;
  }

  setProps(props: Partial<PopupWidgetProps>) {
    Object.assign(this.props, props);
    this.update();
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.update();
  }

  onClick(info: PickingInfo): boolean {
    return this.props.onClick?.(this, info) || false;
  }

  onAdd({deck, viewId}: {deck: Deck<any>; viewId: string | null}): HTMLDivElement {
    const {className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-popup');
    if (className) element.classList.add(className);
    const style = {margin: '0px', top: '0px', left: '0px', position: 'absolute'};
    Object.entries(style).map(([key, value]) => element.style.setProperty(key, value));
    this.deck = deck;
    if (!viewId) {
      this.viewport = deck.getViewports()[0];
    } else {
      this.viewport = deck.getViewports().find(viewport => viewport.id === viewId);
    }
    this.element = element;
    this.update();
    return element;
  }

  update() {
    const element = this.element;
    if (!element) {
      return;
    }
    if (!this.viewport) {
      return;
    }
    const [longitude, latitude] = this.props.position;
    const [x, y] = this.viewport.project([longitude, latitude]);
    const style = {
      background: 'rgba(255, 255, 255, 0.9)',
      padding: 10,
      ...(this.props.style as any),
      perspective: 100,
      transform: `translate(${x}px, ${y}px)`
    };
    const ui = this.props.visible ? <div style={style}>{this.props.text}</div> : null;
    render(ui, element);
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}

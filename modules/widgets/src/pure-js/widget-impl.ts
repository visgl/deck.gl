// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {_deepEqual, _applyStyles, _removeStyles} from '@deck.gl/core';
import type {Deck, Widget, WidgetPlacement} from '@deck.gl/core';

export type WidgetImplProps = {
  id?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** CSS inline style overrides. */
  style?: Partial<CSSStyleDeclaration>;
  /** Additional CSS class. */
  className?: string;
};
export abstract class WidgetImpl<PropsT extends WidgetImplProps> implements Widget<PropsT> {
  id: string;
  props: Required<PropsT>;

  deck?: Deck<any>;
  element?: HTMLDivElement;

  static defaultProps: Required<WidgetImplProps> = {
    id: 'screenshot',
    placement: 'top-left',
    style: {},
    className: ''
  };

  constructor(props: Required<PropsT>) {
    this.id = props.id || 'widget';
    this.props = props;
  }

  abstract onCreateHTMLElement(): HTMLElement;

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    this.deck = deck;
    const el = this.onCreateHTMLElement();
    this.element = el as HTMLDivElement;
    return this.element;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: Partial<PropsT>) {
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }

      if (!_deepEqual(oldProps.style, props.style, 1)) {
        _removeStyles(el, oldProps.style);
        _applyStyles(el, props.style);
      }
    }

    Object.assign(this.props, props);
  }

  _createElement(
    props: {
      type?: string;
      style?: Partial<CSSStyleDeclaration>;
      classNames?: string[];
      events?: {[key: string]: EventListenerOrEventListenerObject};
      children?: (HTMLElement | SVGSVGElement | undefined)[];
    }
  ): HTMLElement {
    const {type = 'div', style = {}, classNames = [], events = {}} = props;
    const children = props.children || props.children || [];
    const el = document.createElement(type);
    classNames.filter(Boolean).forEach(className => el.classList.add(className));
    this._applyStyles(el, style);
    children.filter(child => child !== undefined).forEach(child => el.appendChild(child));
    Object.entries(events).forEach(([event, handler]) => el.addEventListener(event, handler));
    return el;
  }

  _createIconButton(props: {
    widgetClassName: string;
    classNames?: string[];
    style: Partial<CSSStyleDeclaration>;
    onClick: EventListenerOrEventListenerObject;
    icon?: SVGSVGElement;
  }): HTMLElement {
    const {widgetClassName = '', style = {}, classNames = []} = props;

    const el = this._createElement({
      style,
      classNames: ['deck-widget', widgetClassName, ...classNames],
      children: [
        this._createElement({
          type: 'div',
          classNames: ['deck-widget-button'],
          children: [
            this._createElement({
              type: 'button',
              classNames: [widgetClassName, 'deck-widget-icon-button'],
              events: {click: props.onClick},
              children: [props.icon]
            })
          ]
        })
      ]
    });

    this.element = el as HTMLDivElement;
    return this.element;
  }

  _applyStyles(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
    _applyStyles(el, style);
  }
}

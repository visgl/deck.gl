// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {_deepEqual, _applyStyles, _removeStyles} from '@deck.gl/core';
import type {Deck, Widget} from '@deck.gl/core';

export type WidgetImplProps = {
  id?: string;
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
    id: 'widget',
    style: {},
    className: ''
  };

  abstract className: Required<string>;

  constructor(props: Required<PropsT>) {
    this.id = props.id || 'widget';
    this.props = props;
  }

  abstract onRenderHTML(): void;

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    this.deck = deck;
    const {style, className} = this.props;
    const el = this._createRootElement({
      widgetClassName: this.className,
      className,
      style
    });
    this.element = el;
    this.onRenderHTML();
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
    this.onRenderHTML();
  }

  _createRootElement(props: {
    widgetClassName: string;
    className?: string;
    style?: Partial<CSSStyleDeclaration>;
  }) {
    const {widgetClassName, className, style} = props;
    const element = document.createElement('div');
    ['deck-widget', widgetClassName, className]
      .filter((cls): cls is string => typeof cls === 'string' && cls.length > 0)
      .forEach(className => element.classList.add(className));
    _applyStyles(element, style);
    return element;
  }
}

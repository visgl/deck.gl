// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {Deck} from '@deck.gl/core';
import {WidgetImpl, WidgetImplProps} from './widget-impl';
import {h, render} from 'preact';
import {IconButton} from '../components';

export type ScreenshotWidgetProps = WidgetImplProps & {
  /** Tooltip message */
  label?: string;
};

export class ScreenshotWidget extends WidgetImpl<ScreenshotWidgetProps> {
  static defaultProps: Required<ScreenshotWidgetProps> = {
    id: 'screenshot',
    placement: 'top-left',
    label: 'Screenshot',
    style: {},
    className: ''
  };

  constructor(props: ScreenshotWidgetProps) {
    super({...ScreenshotWidget.defaultProps, ...props});
  }

  setProps(props: Partial<ScreenshotWidgetProps>) {
    super.setProps(props);
    this.update();
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = this._createRootElement({
      widgetClassName: 'deck-widget-screenshot',
      className,
      style
    });
    this.element = element;
    this.update();
    this.deck = deck;
    return element;
  }

  private update() {
    const element = this.element;
    if (!element) return;
    render(
      h(IconButton, {
        className: 'deck-widget-camera',
        label: this.props.label,
        onClick: this.handleClick.bind(this)
      }),
      element
    );
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  handleClick() {
    const canvas = this.deck?.getCanvas();
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'screenshot.png';
      link.click();
    }
  }
}

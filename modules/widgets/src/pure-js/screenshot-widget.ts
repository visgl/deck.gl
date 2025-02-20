// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {Deck} from '@deck.gl/core';
import {WidgetImpl, WidgetImplProps} from './widget-impl';

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
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;

    const el = this._createIconButton({
      widgetClassName: 'deck-widget-screenshot',
      classNames: [className],
      style,
      icon: createCameraIcon(),
      onClick: this.handleClick.bind(this)
    });

    this.deck = deck;
    this.element = el as HTMLDivElement;
    return this.element;
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

function createCameraIcon({size = 24, color = 'black'} = {}) {
  const xmlns = 'http://www.w3.org/2000/svg';

  // Create the main SVG element.
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  // Create the path element for the camera body.
  const path = document.createElementNS(xmlns, 'path');
  path.setAttribute(
    'd',
    'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'
  );
  svg.appendChild(path);

  // Create the circle element for the camera lens.
  const circle = document.createElementNS(xmlns, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '13');
  circle.setAttribute('r', '4');
  svg.appendChild(circle);

  return svg;
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {WidgetImpl, WidgetImplProps} from './widget-impl';
import {h, render} from 'preact';
import {IconButton} from '../components';

/** Properties for the ScreenshotWidget */
export type ScreenshotWidgetProps = WidgetImplProps & {
  /** Tooltip message */
  label?: string;
  /** Filename to save to */
  filename?: string;
  /** Image format */
  imageFormat?: 'image/png' | 'image/jpeg';
  /** Callback, if defined user overrides the capture logic */
  onCapture?: (widget: ScreenshotWidget) => void;
};

/**
 * A button widget that captures a screenshot of the current canvas and downloads it as a (png) file.
 * @note only captures canvas contents, not HTML DOM or CSS styles
 */
export class ScreenshotWidget extends WidgetImpl<ScreenshotWidgetProps> {
  static defaultProps: Required<ScreenshotWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'screenshot',
    label: 'Screenshot',
    filename: 'screenshot.png',
    imageFormat: 'image/png',
    onCapture: undefined!
  };

  className = 'deck-widget-screenshot';

  constructor(props: ScreenshotWidgetProps = {}) {
    super({...ScreenshotWidget.defaultProps, ...props});
  }

  setProps(props: Partial<ScreenshotWidgetProps>) {
    super.setProps(props);
  }

  onRenderHTML() {
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

  handleClick() {
    // Allow user to override the capture logic
    if (this.props.onCapture) {
      this.props.onCapture(this);
      return;
    }
    const dataURL = this.captureScreenToDataURL(this.props.imageFormat);
    if (dataURL) {
      this.downloadDataURL(dataURL, this.props.filename);
    }
  }

  /** @note only captures canvas contents, not HTML DOM or CSS styles */
  captureScreenToDataURL(imageFormat: string): string | undefined {
    const canvas = this.deck?.getCanvas();
    return canvas?.toDataURL(imageFormat);
  }

  /** Download a data URL */
  downloadDataURL(dataURL: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.click();
  }
}

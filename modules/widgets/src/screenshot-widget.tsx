// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import type {WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

/** Properties for the ScreenshotWidget */
export type ScreenshotWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
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
export class ScreenshotWidget extends Widget<ScreenshotWidgetProps> {
  static defaultProps: Required<ScreenshotWidgetProps> = {
    ...Widget.defaultProps,
    id: 'screenshot',
    placement: 'top-left',
    viewId: null,
    label: 'Screenshot',
    filename: 'screenshot.png',
    imageFormat: 'image/png',
    onCapture: undefined!
  };

  className = 'deck-widget-screenshot';
  placement: WidgetPlacement = 'top-left';

  constructor(props: ScreenshotWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<ScreenshotWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <IconButton
        className="deck-widget-camera"
        label={this.props.label}
        onClick={this.handleClick.bind(this)}
      />,
      rootElement
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

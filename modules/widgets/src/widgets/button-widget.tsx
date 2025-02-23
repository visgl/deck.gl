// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {h, render} from 'preact';
import type {WidgetPlacement} from '@deck.gl/core';
import {WidgetImpl, WidgetImplProps} from '../widget-impl';
import {IconButton} from '../components';

/** Properties for the ButtonWidget */
export type ButtonWidgetProps = WidgetImplProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** Tooltip message */
  label?: string;
  /** Icon classname */
  iconClassName: string;
  /** Callback, if defined user overrides the capture logic */
  onClick: (widget: ButtonWidget) => void;
};

/**
 * A button widget that captures a screenshot of the current canvas and downloads it as a (png) file.
 * @note only captures canvas contents, not HTML DOM or CSS styles
 */
export class ButtonWidget extends WidgetImpl<ButtonWidgetProps> {
  static defaultProps: Required<ButtonWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'button',
    placement: 'top-left',
    label: 'Button',
    iconClassName: undefined!,
    onClick: undefined!,
  };

  className = 'deck-widget-screenshot';
  placement: WidgetPlacement;

  constructor(props: ButtonWidgetProps) {
    super({...ButtonWidget.defaultProps, ...props});
    this.placement = this.props.placement;
  }

  setProps(props: Partial<ButtonWidgetProps>) {
    super.setProps(props);
    this.placement = this.props.placement;
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    render(
      <IconButton
        className={this.props.className}
        label={this.props.label}
        onClick={this.handleClick.bind(this)}
      />,
      element
    );
  }

  handleClick() {
    // Allow user to override the capture logic
    this.props.onClick(this);
  }
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render, type JSX} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

export type IconWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Data url to display as icon */
  icon: string;
  /** Tooltip label */
  label?: string;
  /** Icon color, a CSS Color string */
  color?: string;
  /** Callback when the widget is clicked */
  onClick?: () => void;
};

/**
 * A generic widget that displays a button with icon or text content.
 */
export class IconWidget extends Widget<IconWidgetProps> {
  static defaultProps: Required<IconWidgetProps> = {
    ...Widget.defaultProps,
    id: 'icon',
    placement: 'top-left',
    viewId: null,
    icon: '',
    label: '',
    color: '',
    onClick: undefined!
  };

  className = '';
  placement: WidgetPlacement = 'top-left';

  constructor(props: IconWidgetProps) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<IconWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {className, style, icon, color, label, onClick} = this.props;

    render(
      <IconButton
        className={className}
        style={style as JSX.CSSProperties}
        color={color}
        icon={icon}
        label={label}
        onClick={onClick}
      />,
      rootElement
    );
  }
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render, type JSX} from 'preact';
import {Widget} from '@deck.gl/core';
import {IconButton} from './lib/components/icon-button';

export type ToggleWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** If the toggle is checked when first added */
  initialChecked?: boolean;
  /** Data url to display as icon */
  icon: string;
  /** Data url to display as icon when it is checked */
  onIcon?: string;
  /** Tooltip label */
  label?: string;
  /** Tooltip label when it is checked */
  onLabel?: string;
  /** Icon color, a CSS Color string */
  color?: string;
  /** Icon color when it is checked, a CSS Color string */
  onColor?: string;
  /** Callback when the widget is clicked */
  onChange?: (checked: boolean) => void;
};

/**
 * A generic widget that displays a button with icon or text content.
 */
export class ToggleWidget extends Widget<ToggleWidgetProps> {
  static defaultProps: Required<ToggleWidgetProps> = {
    ...Widget.defaultProps,
    id: 'icon',
    placement: 'top-left',
    viewId: null,
    initialChecked: false,
    icon: '',
    onIcon: undefined!,
    label: '',
    onLabel: undefined!,
    color: '',
    onColor: undefined!,
    onChange: undefined!
  };

  className = 'deck-widget-toggle';
  placement: WidgetPlacement = 'top-left';
  checked: boolean;

  constructor(props: ToggleWidgetProps) {
    super(props);
    this.checked = this.props.initialChecked;
    this.setProps(this.props);
  }

  setProps(props: Partial<ToggleWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {
      className,
      style,
      icon,
      label,
      color,
      onIcon = icon,
      onLabel = label,
      onColor = color
    } = this.props;
    const on = this.checked;

    rootElement.dataset.checked = String(on);

    render(
      <IconButton
        className={className}
        style={style as JSX.CSSProperties}
        icon={on ? onIcon : icon}
        label={on ? onLabel : label}
        color={on ? onColor : color}
        onClick={this._toggle}
      />,
      rootElement
    );
  }

  private _toggle = () => {
    this.checked = !this.checked;
    this.props.onChange?.(this.checked);
    this.updateHTML();
  };
}

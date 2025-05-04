// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget} from '@deck.gl/core';
import {Viewport, WidgetProps, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {ButtonGroup} from './lib/components/button-group';
import {GroupedIconButton} from './lib/components/grouped-icon-button';

/** Defined one button in the menu */
export type Button = {
  id: string;
  label: string;
  icon?: () => JSX.Element;
} | {
  id: string;
  label: string;
  className: string;
}

export type ButtonGroupWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Button orientation. */
  orientation?: 'vertical' | 'horizontal';
  /** List of buttons to show */
  buttons: Button[];
  /** Tooltip message on zoom out button. */
  onButtonClick?: (id: string, widget: ButtonGroupWidget) => void;
};

/** 
 * A widget that lets the user add custom icon buttons to deck 
 * The buttons participate in widget positioning and theming,
 * however the functionality is defined by the props.onButtonClick callback
 */
export class ButtonGroupWidget extends Widget<ButtonGroupWidgetProps> {
  static defaultProps: Required<ButtonGroupWidgetProps> = {
    ...Widget.defaultProps,
    id: 'button-group',
    placement: 'top-left',
    orientation: 'vertical',
    viewId: undefined!,
    buttons: [],
    // eslint-disable-next-line no-console
    onButtonClick: (id, widget) => console.log(`Button ${id} clicked`, widget)
  };

  className = 'deck-widget-zoom';
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewports: {[id: string]: Viewport} = {};

  constructor(props: ButtonGroupWidgetProps) {
    super(props, ButtonGroupWidget.defaultProps);
    this.setProps(props);
  }

  setProps(props: Partial<ButtonGroupWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const ui = (
      <ButtonGroup orientation={this.props.orientation}>
        {this.props.buttons.map(button => (
          <GroupedIconButton
            key={button.id}
            label={button.label}
            className="deck-widget-button"
            icon={'icon' in button && button.icon}
            onClick={() => this.props.onButtonClick(button.id, this)}
          />
        ))}
      </ButtonGroup>
    );
    render(ui, rootElement);
  }
}

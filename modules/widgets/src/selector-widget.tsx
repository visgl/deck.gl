// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {render} from 'preact';
import {Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {SimpleMenu, type MenuItem} from './lib/components/dropdown-menu';
import {Popover, type PopoverProps} from './lib/components/popover';
import {IconButton} from './lib/components/icon-button';

export type SelectorWidgetOption<ValueT = string> = {
  value: ValueT;
  icon: string;
  label?: string;
};

/** Properties for the ViewSelectorWidget */
export type SelectorWidgetProps<ValueT = string> = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  options: SelectorWidgetOption<ValueT>[];
  /** The initial value. Default to the first option. */
  initialValue?: ValueT;
  /** Callback invoked when the value changes */
  onChange?: (value: ValueT) => void;
};

/**
 * A widget that renders a popup menu for selecting a view mode.
 * It displays a button with the current view mode icon. Clicking the button
 * toggles a popup that shows three icons for:
 * - Single view
 * - Two views, split horizontally
 * - Two views, split vertically
 */
export class SelectorWidget<ValueT = string> extends Widget<SelectorWidgetProps<ValueT>> {
  static defaultProps: Required<SelectorWidgetProps> = {
    ...Widget.defaultProps,
    id: 'view-selector',
    placement: 'top-left',
    viewId: null,
    initialValue: '',
    options: [],
    onChange: () => {}
  };

  className = 'deck-widget-selector';
  placement: WidgetPlacement = 'top-left';
  value: ValueT;
  isOpen: {x: number; y: number; placement: PopoverProps['placement']} | false = false;

  constructor(props: SelectorWidgetProps<ValueT>) {
    super(props);
    this.value = this.props.initialValue;
    this.setProps(this.props);
  }

  setProps(props: Partial<SelectorWidgetProps<ValueT>>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement) {
    const selectedOption =
      this.props.options.find(opt => opt.value === this.value) ?? this.props.options[0];

    render(
      <div>
        <IconButton
          icon={selectedOption.icon}
          label={selectedOption.label}
          onClick={this._toggleMenu}
        />
        {this.isOpen && (
          <Popover {...this.isOpen}>
            <SimpleMenu
              isOpen
              style={{pointerEvents: 'auto', position: 'static'}}
              menuItems={this.props.options as MenuItem[]}
              onSelect={this._handleSelectMode}
              onClose={this._toggleMenu}
            />
          </Popover>
        )}
      </div>,
      rootElement
    );
  }

  private _toggleMenu = () => {
    if (this.isOpen) {
      this.isOpen = false;
    } else if (this.rootElement) {
      this.isOpen = {
        x: this.rootElement.offsetLeft,
        y: this.rootElement.offsetTop,
        placement: this.props.placement.includes('right') ? 'left-start' : 'right-start'
      };
    }
    this.updateHTML();
  };

  private _handleSelectMode = (value: string) => {
    this.value = value as ValueT;
    this.props.onChange(value as ValueT);
    this.updateHTML();
  };
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {render, JSX} from 'preact';
import {Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {IconMenu} from './lib/components/icon-menu';

/** The available view modes */
export type ViewMode = 'single' | 'split-horizontal' | 'split-vertical';

/** Properties for the ViewSelectorWidget */
export type ViewSelectorWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip label */
  label?: string;
  /** The initial view mode. Defaults to 'single'. */
  initialViewMode?: ViewMode;
  /** Callback invoked when the view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
};

/**
 * A widget that renders a popup menu for selecting a view mode.
 * It displays a button with the current view mode icon. Clicking the button
 * toggles a popup that shows three icons for:
 * - Single view
 * - Two views, split horizontally
 * - Two views, split vertically
 */
export class ViewSelectorWidget extends Widget<ViewSelectorWidgetProps> {
  static defaultProps: Required<ViewSelectorWidgetProps> = {
    ...Widget.defaultProps,
    id: 'view-selector',
    placement: 'top-left',
    viewId: null,
    label: 'Split View',
    initialViewMode: 'single',
    onViewModeChange: () => {}
  };

  className = 'deck-widget-view-selector';
  placement: WidgetPlacement = 'top-left';
  viewMode: ViewMode;

  constructor(props: ViewSelectorWidgetProps = {}) {
    super(props);
    this.viewMode = this.props.initialViewMode;
    this.setProps(this.props);
  }

  setProps(props: Partial<ViewSelectorWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement) {
    render(
      <IconMenu<ViewMode>
        className="deck-widget-view-selector"
        menuItems={MENU_ITEMS.map(item => ({
          ...item,
          icon: item.icon()
        }))}
        initialItem={this.props.initialViewMode}
        onItemSelected={this.handleSelectMode}
      />,
      rootElement
    );
  }

  handleSelectMode = (viewMode: ViewMode) => {
    this.viewMode = viewMode;
    this.updateHTML();
    this.props.onViewModeChange(viewMode);
  };
}

const ICON_STYLE = {width: '24px', height: '24px'};

// JSX wrapped in a function to fix deck's Node tests
const ICONS: Record<ViewMode, () => JSX.Element> = {
  single: () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        stroke="var(--button-icon-hover, rgb(24, 24, 26))"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  ),
  'split-horizontal': () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect
        x="4"
        y="4"
        width="16"
        height="7"
        stroke="var(--button-icon-hover, rgb(24, 24, 26))"
        fill="none"
        strokeWidth="2"
      />
      <rect
        x="4"
        y="13"
        width="16"
        height="7"
        stroke="var(--button-icon-hover, rgb(24, 24, 26))"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  ),
  'split-vertical': () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect
        x="4"
        y="4"
        width="7"
        height="16"
        stroke="var(--button-icon-hover, rgb(24, 24, 26))"
        fill="none"
        strokeWidth="2"
      />
      <rect
        x="13"
        y="4"
        width="7"
        height="16"
        stroke="var(--button-icon-hover, rgb(24, 24, 26))"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  )
};

// Define menu items for the popup menu.
const MENU_ITEMS: Array<{value: ViewMode; icon: () => JSX.Element; label: string}> = [
  {value: 'single', icon: ICONS.single, label: 'Single View'},
  {value: 'split-horizontal', icon: ICONS['split-horizontal'], label: 'Split Horizontal'},
  {value: 'split-vertical', icon: ICONS['split-vertical'], label: 'Split Vertical'}
];

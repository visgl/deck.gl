// ViewSelectorWidget.tsx
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {render, JSX} from 'preact';
import {Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {Menu} from './lib/components';
import {h} from 'preact';

/** The available view modes */
export type ViewMode = 'single' | 'split-horizontal' | 'split-vertical';

/** Properties for the ViewSelectorWidget */
export type ViewSelectorWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
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
    id: 'view-selector-widget',
    placement: 'top-left',
    label: 'Split View',
    initialViewMode: 'single',
    // eslint-disable-next-line no-console
    onViewModeChange: (viewMode: string) => {
      console.log(viewMode);
    }
  };

  className = 'deck-widget-view-selector';
  placement: WidgetPlacement = 'top-left';
  viewMode: ViewMode;

  constructor(props: ViewSelectorWidgetProps = {}) {
    super(props, ViewSelectorWidget.defaultProps);
    this.placement = this.props.placement;
    this.viewMode = this.props.initialViewMode;
  }

  setProps(props: Partial<ViewSelectorWidgetProps>) {
    super.setProps(props);
    this.placement = props.placement ?? this.placement;
  }

  onRenderHTML(rootElement: HTMLElement) {
    render(
      <Menu<ViewMode>
        className="deck-widget-view-selector"
        menuItems={MENU_ITEMS}
        initialItem={this.props.initialViewMode}
        onSelect={this.handleSelectMode}
      />,
      rootElement
    );
  }

  handleSelectMode = (viewMode: ViewMode) => {
    this.viewMode = viewMode;
    this.updateHTML();
  };
}

// Define common icon style.
const ICON_STYLE = {width: '24px', height: '24px'};

// Define inline SVG icons for each view mode.
const ICONS: Record<ViewMode, () => JSX.Element> = {
  single: () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect x="4" y="4" width="16" height="16" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  ),
  'split-horizontal': () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect x="4" y="4" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
      <rect x="4" y="13" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  ),
  'split-vertical': () => (
    <svg width="24" height="24" style={ICON_STYLE}>
      <rect x="4" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  )
};

// Define menu items for the popup menu.
const MENU_ITEMS: Array<{value: ViewMode; icon: () => JSX.Element; label: string}> = [
  {value: 'single', icon: ICONS.single, label: 'Single View'},
  {value: 'split-horizontal', icon: ICONS['split-horizontal'], label: 'Split Horizontal'},
  {value: 'split-vertical', icon: ICONS['split-vertical'], label: 'Split Vertical'}
];

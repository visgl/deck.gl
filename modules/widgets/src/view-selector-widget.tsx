// ViewSelectorWidget.tsx
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {h, render} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import type {WidgetPlacement} from '@deck.gl/core';
import type {WidgetImplProps} from './widget-impl';
import {WidgetImpl} from './widget-impl';
import {IconButton} from './lib/components';

/** The available view modes */
export type ViewMode = 'single' | 'split-horizontal' | 'split-vertical';

/** Properties for the ViewSelectorWidget */
export type ViewSelectorWidgetProps = WidgetImplProps & {
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
export class ViewSelectorWidget extends WidgetImpl<ViewSelectorWidgetProps> {
  static defaultProps: Required<ViewSelectorWidgetProps> = {
    ...WidgetImpl.defaultProps,
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

  constructor(props: ViewSelectorWidgetProps = {}) {
    super({...ViewSelectorWidget.defaultProps, ...props});
    this.placement = props.placement ?? this.placement;
  }

  setProps(props: Partial<ViewSelectorWidgetProps>) {
    super.setProps(props);
    this.placement = props.placement ?? this.placement;
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    // Position the widget (customize as needed)
    render(
      <ViewSelector
        initialViewMode={this.props.initialViewMode}
        label={this.props.label}
        onViewModeChange={this.props.onViewModeChange}
      />,
      element
    );
  }
}

/** A component that renders the popup menu for view mode selection. */
function Menu({
  triggerIcon,
  triggerLabel,
  menuItems,
  onSelect
}: {
  triggerIcon: h.JSX.Element;
  triggerLabel: string;
  menuItems: Array<{value: ViewMode; icon: h.JSX.Element; label: string}>;
  onSelect: (value: ViewMode) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleButtonClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleItemSelect = (value: ViewMode) => {
    onSelect(value);
    setMenuOpen(false);
  };

  const menuStyle: h.JSX.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '4px',
    zIndex: 100
  };

  const menuItemStyle: h.JSX.CSSProperties = {
    background: 'white',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    pointerEvents: 'auto'
  };

  return (
    <div style={{position: 'relative', display: 'inline-block'}} ref={containerRef}>
      <IconButton
        className="deck-widget-view-selector"
        label={triggerLabel}
        onClick={handleButtonClick}
      >
        {triggerIcon}
      </IconButton>
      {menuOpen && (
        <div style={menuStyle}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {menuItems.map(item => (
              <button
                key={item.value}
                style={menuItemStyle}
                title={item.label}
                onClick={() => handleItemSelect(item.value)}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A Preact functional component that renders a button with a popup menu.
 * The popup menu contains three icons representing the different view modes.
 */
function ViewSelector({
  initialViewMode,
  label,
  onViewModeChange
}: {
  initialViewMode: ViewMode;
  label: string;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  const [selectedMode, setSelectedMode] = useState<ViewMode>(initialViewMode);

  const handleModeSelect = (mode: ViewMode) => {
    setSelectedMode(mode);
    onViewModeChange(mode);
  };

  // Define common icon style.
  const iconStyle = {
    width: '24px',
    height: '24px'
  };

  // Define inline SVG icons for each view mode.
  const singleViewIcon = (
    <svg width="24" height="24" style={iconStyle}>
      <rect x="4" y="4" width="16" height="16" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  );
  const splitHorizontalIcon = (
    <svg width="24" height="24" style={iconStyle}>
      <rect x="4" y="4" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
      <rect x="4" y="13" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  );
  const splitVerticalIcon = (
    <svg width="24" height="24" style={iconStyle}>
      <rect x="4" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
    </svg>
  );

  // Define menu items for the popup menu.
  const menuItems: Array<{value: ViewMode; icon: h.JSX.Element; label: string}> = [
    {value: 'single', icon: singleViewIcon, label: 'Single View'},
    {value: 'split-horizontal', icon: splitHorizontalIcon, label: 'Split Horizontal'},
    {value: 'split-vertical', icon: splitVerticalIcon, label: 'Split Vertical'}
  ];

  return (
    <Menu
      triggerIcon={icons[selectedMode]}
      triggerLabel={label}
      menuItems={menuItems}
      onSelect={handleModeSelect}
    />
  );
}

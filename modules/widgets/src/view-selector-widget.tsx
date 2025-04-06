// ViewSelectorWidget.tsx
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {h, render} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import type {WidgetPlacement} from '@deck.gl/core';
import type {WidgetImplProps} from './widget-impl';
import {WidgetImpl} from './widget-impl';
import {IconButton} from './components';

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
    onViewModeChange: () => { },
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
    element.style.position = 'absolute';
    element.style.bottom = '10px';
    element.style.right = '10px';
    render(
      <ViewSelector
        initialViewMode={this.props.initialViewMode}
        onViewModeChange={this.props.onViewModeChange}
      />,
      element
    );
  }
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
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  const [selectedMode, setSelectedMode] = useState<ViewMode>(initialViewMode);
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

  const handleModeSelect = (mode: ViewMode) => {
    setSelectedMode(mode);
    onViewModeChange && onViewModeChange(mode);
    setMenuOpen(false);
  };

  // Define common icon style.
  const iconStyle = {
    width: '24px',
    height: '24px'
  };

  // Define inline SVG icons for each view mode.
  const icons: Record<ViewMode, h.JSX.Element> = {
    single: (
      <svg width="24" height="24" style={iconStyle}>
        <rect x="4" y="4" width="16" height="16" stroke="black" fill="none" strokeWidth="2" />
      </svg>
    ),
    'split-horizontal': (
      <svg width="24" height="24" style={iconStyle}>
        <rect x="4" y="4" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
        <rect x="4" y="13" width="16" height="7" stroke="black" fill="none" strokeWidth="2" />
      </svg>
    ),
    'split-vertical': (
      <svg width="24" height="24" style={iconStyle}>
        <rect x="4" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
        <rect x="13" y="4" width="7" height="16" stroke="black" fill="none" strokeWidth="2" />
      </svg>
    )
  };

  // Styles for the popup menu.
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

  // Styles for individual menu items.
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
        className='deck-widget-view-selector'
        label={label}
        onClick={handleButtonClick}
      >
        {icons[selectedMode]}
      </IconButton>
      {menuOpen && (
        <div style={menuStyle}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <button
              style={menuItemStyle}
              onClick={() => handleModeSelect('single')}
            >
              {icons.single}
            </button>
            <button
              style={menuItemStyle}
              onClick={() => handleModeSelect('split-horizontal')}
            >
              {icons['split-horizontal']}
            </button>
            <button
              style={menuItemStyle}
              onClick={() => handleModeSelect('split-vertical')}
            >
              {icons['split-vertical']}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

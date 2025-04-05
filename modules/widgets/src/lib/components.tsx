// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren, JSX} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';

export type IconButtonProps = {
  className: string;
  label: string;
  onClick: (event?) => unknown;
  /** Optional icon or element to render inside the button */
  children?: ComponentChildren;
};

/** Renders a button component with widget CSS */
export const IconButton = (props: IconButtonProps) => {
  const {className, label, onClick, children} = props;
  return (
    <div className="deck-widget-button">
      <button
        className={`deck-widget-icon-button ${className}`}
        type="button"
        onClick={onClick}
        title={label}
      >
        {children ? children : <div className="deck-widget-icon" />}
      </button>
    </div>
  );
};

export type ButtonGroupProps = {
  children;
  orientation;
};

/** Renders a group of buttons with Widget CSS */
export const ButtonGroup = (props: ButtonGroupProps) => {
  const {children, orientation} = props;
  return <div className={`deck-widget-button-group ${orientation}`}>{children}</div>;
};

export type GroupedIconButtonProps = {
  className;
  label;
  onClick;
};

/** Renders an icon button as part of a ButtonGroup */
export const GroupedIconButton = props => {
  const {className, label, onClick} = props;
  return (
    <button
      className={`deck-widget-icon-button ${className}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      <div className="deck-widget-icon" />
    </button>
  );
};

const MENU_STYLE: JSX.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginTop: '4px',
  zIndex: 100
};

const MENU_ITEM_STYLE: JSX.CSSProperties = {
  background: 'white',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  pointerEvents: 'auto'
};

export type MenuProps<KeyType = string> = {
  className: string;
  icon?: JSX.Element;
  label?: string;
  menuItems: {value: KeyType; icon: JSX.Element; label: string}[];
  initialItem: KeyType;
  onSelect: (item: KeyType) => void;
};

/** A component that renders the popup menu for view mode selection. */
export function Menu<KeyType extends string>(props: MenuProps<KeyType>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside.
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const [selectedItem, setSelectedItem] = useState<KeyType>(props.initialItem);

  const handleSelectItem = (item: KeyType) => {
    setSelectedItem(item);
    setMenuOpen(false);
    props.onSelect(item);
  };

  const handleButtonClick = () => setMenuOpen(!menuOpen);

  const selectedMenuItem = props.menuItems.find(item => item.value === selectedItem);
  const label = props.label || selectedMenuItem?.label || '';
  const icon = props.icon || selectedMenuItem?.icon || '';

  return (
    <div style={{position: 'relative', display: 'inline-block'}} ref={containerRef}>
      <IconButton className={props.className} label={label} onClick={handleButtonClick}>
        {icon}
      </IconButton>
      {menuOpen && (
        <div style={MENU_STYLE}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {props.menuItems.map(item => (
              <button
                key={item.value}
                style={MENU_ITEM_STYLE}
                title={item.label}
                onClick={() => handleSelectItem(item.value)}
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

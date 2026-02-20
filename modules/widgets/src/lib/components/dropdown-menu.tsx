// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSX} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';

export type MenuItem = string | {label: string; value: string; icon?: string};

export type DropdownMenuProps = {
  menuItems: MenuItem[];
  onSelect: (value: string) => void;
  style?: JSX.CSSProperties;
};

function getMenuItemValue(item: MenuItem): string {
  return typeof item === 'string' ? item : item.value;
}

function getMenuItemLabel(item: MenuItem): string {
  return typeof item === 'string' ? item : item.label;
}

function getMenuItemIcon(item: MenuItem): string | undefined {
  return typeof item === 'string' ? undefined : item.icon;
}

export const DropdownMenu = (props: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: MenuItem) => {
    props.onSelect(getMenuItemValue(item));
    setIsOpen(false);
  };

  // Don't render anything if there are no menu items
  if (props.menuItems.length === 0) {
    return null;
  }

  return (
    <div className="deck-widget-dropdown-container" ref={dropdownRef} style={props.style}>
      <button className="deck-widget-dropdown-button" onClick={toggleDropdown}>
        <span className={`deck-widget-dropdown-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <ul className="deck-widget-dropdown-menu">
          {props.menuItems.map(item => {
            const icon = getMenuItemIcon(item);
            return (
              <li
                className="deck-widget-dropdown-item"
                key={getMenuItemValue(item)}
                onClick={() => handleSelect(item)}
              >
                {icon && (
                  <span
                    className="deck-widget-dropdown-item-icon"
                    style={{maskImage: `url("${icon}")`, WebkitMaskImage: `url("${icon}")`}}
                  />
                )}
                {getMenuItemLabel(item)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

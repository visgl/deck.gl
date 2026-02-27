// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSX, type ComponentChild} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';

export type MenuItem = string | {label: string; value?: string; icon?: string};

export type DropdownMenuProps = {
  menuItems: MenuItem[];
  onSelect: (value: string) => void;
  style?: Partial<CSSStyleDeclaration>;
};

function getMenuItemValue(item: MenuItem): string | undefined {
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

  return (
    <SimpleMenu
      {...props}
      style={{...props.style, position: 'absolute'}}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={
        <button className="deck-widget-dropdown-button" onClick={() => setIsOpen(!isOpen)}>
          <span className={`deck-widget-dropdown-icon ${isOpen ? 'open' : ''}`} />
        </button>
      }
    />
  );
};

export type SimpleMenuProps = DropdownMenuProps & {
  trigger?: ComponentChild;
  isOpen: boolean;
  onClose: () => void;
};

export const SimpleMenu = (props: SimpleMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      props.onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value?: string) => {
    if (value) {
      props.onSelect(value);
      props.onClose();
    }
  };

  // Don't render anything if there are no menu items
  if (props.menuItems.length === 0) {
    return null;
  }

  return (
    <div className="deck-widget-dropdown-container" ref={dropdownRef}>
      {props.trigger}
      {props.isOpen && (
        <ul className="deck-widget-dropdown-menu" style={props.style as JSX.CSSProperties}>
          {props.menuItems.map((item, i) => {
            const value = getMenuItemValue(item);
            const icon = getMenuItemIcon(item);
            return (
              <li
                className={`deck-widget-dropdown-item ${value ? '' : 'disabled'}`}
                key={i}
                onClick={() => handleSelect(value)}
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

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSX, type ComponentChild} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';

export type MenuItem =
  | string
  | {
      value?: string;
      label: string;
      icon?: string;
      disabled?: boolean;
      onSelect?: () => void;
    };

export type DropdownMenuProps = {
  menuItems: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  style?: Partial<CSSStyleDeclaration>;
};

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        props.onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (item: MenuItem) => {
    if (typeof item === 'object') {
      item.onSelect?.();
    }
    props.onSelect?.(item);
    props.onClose();
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
            const {disabled, label, icon} = typeof item === 'string' ? {label: item} : item;
            return (
              <li
                className={`deck-widget-dropdown-item ${disabled ? 'disabled' : ''}`}
                key={i}
                onClick={disabled ? undefined : () => handleSelect(item)}
              >
                {icon && (
                  <span
                    className="deck-widget-dropdown-item-icon"
                    style={{maskImage: `url("${icon}")`, WebkitMaskImage: `url("${icon}")`}}
                  />
                )}
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

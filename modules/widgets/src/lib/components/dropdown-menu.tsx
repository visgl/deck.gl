// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type JSX} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';

export type DropdownMenuProps = {
  menuItems: string[];
  onSelect: (value: string) => void;
  style?: JSX.CSSProperties;
};

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

  const handleSelect = (value: string) => {
    props.onSelect(value);
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
          {props.menuItems.map(item => (
            <li className="deck-widget-dropdown-item" key={item} onClick={() => handleSelect(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

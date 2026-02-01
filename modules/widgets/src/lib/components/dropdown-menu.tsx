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

  return (
    <div
      className="dropdown-container"
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...props.style
      }}
    >
      <button
        className="deck-widget-dropdown-button"
        onClick={toggleDropdown}
        style={{
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          cursor: 'pointer',
          padding: 0
        }}
      >
        ▼
      </button>
      {isOpen && (
        <ul
          className="deck-widget-dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: '100%',
            borderRadius: '4px',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          {props.menuItems.map(item => (
            <li
              className="deck-widget-dropdown-item"
              key={item}
              onClick={() => handleSelect(item)}
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

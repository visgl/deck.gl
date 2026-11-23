// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useEffect, useRef} from 'react';
import {useAirports} from '../../hooks/use-airports';
import {useAppStore} from '../../stores/app';

/**
 * Scrollable airports list with hover and click interactions
 */
export function AirportsList() {
  const search = useAppStore(state => state.search);
  const selected = useAppStore(state => state.selected);
  const hovered = useAppStore(state => state.hovered);
  const setSelected = useAppStore(state => state.setSelected);
  const setHovered = useAppStore(state => state.setHovered);

  const data = useAirports(search);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll selected item into view
  useEffect(() => {
    if (selected !== null && itemRefs.current.has(selected)) {
      const element = itemRefs.current.get(selected);
      element?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  }, [selected]);

  return (
    <div
      ref={listRef}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        left: 20,
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'auto',
        position: 'absolute',
        top: 20,
        width: 300,
        zIndex: 1
      }}
    >
      <div style={{borderBottom: '1px solid #e0e0e0', padding: '12px 16px'}}>
        <strong>{data.length} airports</strong>
      </div>
      <div>
        {data.map(airport => {
          const isSelected = selected === airport.id;
          const isHovered = hovered === airport.id;

          return (
            <div
              key={airport.id}
              ref={el => {
                if (el) {
                  itemRefs.current.set(airport.id, el);
                } else {
                  itemRefs.current.delete(airport.id);
                }
              }}
              onClick={() => setSelected(airport.id)}
              onMouseEnter={() => setHovered(airport.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                backgroundColor: isSelected
                  ? 'rgba(255, 0, 0, 0.1)'
                  : isHovered
                    ? 'rgba(0, 128, 255, 0.05)'
                    : 'transparent',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                padding: '12px 16px',
                transition: 'background-color 0.15s'
              }}
            >
              <div style={{fontWeight: isSelected ? 'bold' : 'normal'}}>{airport.name}</div>
              <div
                style={{
                  color: '#666',
                  fontSize: '0.85em',
                  marginTop: 4
                }}
              >
                {airport.city}, {airport.state}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

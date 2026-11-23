// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import 'client-only';
import {useEffect, useRef} from 'react';
import {useSelected} from '@/hooks/use-selected';
import {useHover} from '@/hooks/use-hover';
import type {AirportFeature} from '@/data-access/airports/types';

interface AirportsListClientProps {
  data: AirportFeature[];
}

/**
 * Client component that renders scrollable list with interactions
 */
export function AirportsListClient({data}: AirportsListClientProps) {
  const [selected, setSelected] = useSelected();
  const [hovered, setHovered] = useHover();

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
          const ident = airport.properties.IDENT;
          const isSelected = selected === ident;
          const isHovered = hovered === ident;

          return (
            <div
              key={ident}
              ref={el => {
                if (el) {
                  itemRefs.current.set(ident, el);
                } else {
                  itemRefs.current.delete(ident);
                }
              }}
              onClick={() => setSelected(ident)}
              onMouseEnter={() => setHovered(ident)}
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
              <div style={{fontWeight: isSelected ? 'bold' : 'normal'}}>
                {airport.properties.NAME}
              </div>
              <div
                style={{
                  color: '#666',
                  fontSize: '0.85em',
                  marginTop: 4
                }}
              >
                {ident} • Elevation: {airport.properties.ELEVATION}ft
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

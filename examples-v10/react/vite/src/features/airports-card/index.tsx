// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useSuspenseQuery} from '@tanstack/react-query';
import {fetchAirportById} from '../../data-access/airports/client';
import {useAppStore} from '../../stores/app';

/**
 * Airport detail card with close button
 */
export function AirportsCard() {
  const selected = useAppStore(state => state.selected);
  const setSelected = useAppStore(state => state.setSelected);

  const {data: airport} = useSuspenseQuery({
    queryFn: () => {
      if (selected === null) {
        throw new Error('No airport selected');
      }
      return fetchAirportById(selected);
    },
    queryKey: ['airport', selected]
  });

  if (!airport) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'absolute',
        right: 20,
        top: 20,
        width: 320,
        zIndex: 1
      }}
    >
      <div
        style={{
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '16px'
        }}
      >
        <strong>Airport Details</strong>
        <button
          onClick={() => setSelected(null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2em',
            lineHeight: 1,
            padding: 4
          }}
          title="Close"
        >
          ×
        </button>
      </div>
      <div style={{padding: '16px'}}>
        <div style={{marginBottom: 12}}>
          <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{airport.name}</div>
        </div>
        <div style={{display: 'grid', fontSize: '0.9em', gap: 8}}>
          <div>
            <strong>Location:</strong>
            <div style={{color: '#666'}}>
              {airport.city}, {airport.state}
            </div>
          </div>
          <div>
            <strong>Coordinates:</strong>
            <div style={{color: '#666', fontFamily: 'monospace'}}>
              {airport.latitude.toFixed(4)}, {airport.longitude.toFixed(4)}
            </div>
          </div>
          <div>
            <strong>Airport ID:</strong>
            <div style={{color: '#666'}}>{airport.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

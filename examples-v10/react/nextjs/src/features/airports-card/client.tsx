// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import 'client-only';
import {useSelected} from '@/hooks/use-selected';
import type {AirportFeature} from '@/data-access/airports/types';

interface AirportsCardClientProps {
  airport: AirportFeature;
}

/**
 * Client component that renders airport detail card with close button
 */
export function AirportsCardClient({airport}: AirportsCardClientProps) {
  const [_, setSelected] = useSelected();

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
          <div style={{fontSize: '1.1em', fontWeight: 'bold'}}>{airport.properties.NAME}</div>
        </div>
        <div style={{display: 'grid', fontSize: '0.9em', gap: 8}}>
          <div>
            <strong>Airport ID:</strong>
            <div style={{color: '#666'}}>{airport.properties.IDENT}</div>
          </div>
          <div>
            <strong>Type:</strong>
            <div style={{color: '#666'}}>{airport.properties.TYPE_CODE}</div>
          </div>
          <div>
            <strong>Elevation:</strong>
            <div style={{color: '#666'}}>{airport.properties.ELEVATION} ft</div>
          </div>
          <div>
            <strong>Coordinates:</strong>
            <div style={{color: '#666', fontFamily: 'monospace'}}>
              {airport.properties.LATITUDE}, {airport.properties.LONGITUDE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import type {FallbackProps} from 'react-error-boundary';

/**
 * Error boundary for airport card
 */
export function AirportsCardError({error}: FallbackProps) {
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
          color: '#d32f2f',
          padding: 16
        }}
      >
        <strong>Error loading airport</strong>
        <div style={{fontSize: '0.85em', marginTop: 8}}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    </div>
  );
}

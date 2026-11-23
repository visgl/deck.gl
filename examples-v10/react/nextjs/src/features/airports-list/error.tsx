// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import type {FallbackProps} from 'react-error-boundary';

/**
 * Error boundary for airports list
 */
export function AirportsListError({error}: FallbackProps) {
  return (
    <div
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
      <div
        style={{
          color: '#d32f2f',
          padding: 16
        }}
      >
        <strong>Error loading airports</strong>
        <div style={{fontSize: '0.85em', marginTop: 8}}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    </div>
  );
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Loading fallback for airport card (Suspense boundary)
 */
export function AirportsCardLoading() {
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
          display: 'flex',
          justifyContent: 'center',
          padding: 40
        }}
      >
        <div>Loading airport details...</div>
      </div>
    </div>
  );
}

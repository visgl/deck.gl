// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Loading fallback for airports list (Suspense boundary)
 */
export function AirportsListLoading() {
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
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          padding: 40
        }}
      >
        <div>Loading airports...</div>
      </div>
    </div>
  );
}

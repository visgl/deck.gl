// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';

// Material icons (Apache 2.0)
const ICONS = {
  previous: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  next: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
  display: 'flex',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
  overflow: 'hidden'
};

const buttonStyle: React.CSSProperties = {
  width: 40,
  height: 36,
  padding: 0,
  border: 'none',
  background: 'none',
  color: '#333',
  cursor: 'pointer'
};

function Button({icon, label, onClick}: {icon: string; label: string; onClick: () => void}) {
  return (
    <button type="button" style={buttonStyle} title={label} aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
        <path d={icon} />
      </svg>
    </button>
  );
}

export default function TourControls({
  playing,
  onPlayingChange,
  onPrevious,
  onNext
}: {
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div style={containerStyle}>
      <Button icon={ICONS.previous} label="Previous map" onClick={onPrevious} />
      <Button
        icon={playing ? ICONS.pause : ICONS.play}
        label={playing ? 'Pause tour' : 'Play tour'}
        onClick={() => onPlayingChange(!playing)}
      />
      <Button icon={ICONS.next} label="Next map" onClick={onNext} />
    </div>
  );
}

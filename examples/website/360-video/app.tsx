// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {FirstPersonView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {SphereGeometry} from '@luma.gl/engine';

import type {FirstPersonViewState} from '@deck.gl/core';

// Video created by the NASA Jet Propulsion Laboratory, Public domain, via Wikimedia Commons
// Source: https://commons.wikimedia.org/wiki/File:NASA_VR-360_Astronaut_Training-_Space_Walk.webm
const VIDEO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/0/0a/NASA_VR-360_Astronaut_Training-_Space_Walk.webm';

const sphere = new SphereGeometry({
  nlat: 50,
  nlong: 50,
  radius: 150
});

const PLAY_BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.5
};

const INITIAL_VIEW_STATE: FirstPersonViewState = {
  latitude: 0,
  longitude: 0,
  position: [0, 0, 0],
  pitch: 0,
  bearing: 90
};

export default function App() {
  const [isPlaying, setPlaying] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement>();

  useEffect(() => {
    let videoEl;
    /* global document */
    if (typeof document !== 'undefined') {
      videoEl = document.createElement('video');
      videoEl.crossOrigin = 'anonymous';
      videoEl.preload = 'auto';
      videoEl.loop = true;

      const source = document.createElement('source');
      source.src = VIDEO_URL;
      videoEl.append(source);

      setVideo(videoEl);
    }
    return () => videoEl && videoEl.pause();
  }, []);

  const layer = new SimpleMeshLayer({
    id: 'video-sphere',
    data: [0],
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    texture: video,
    mesh: sphere,
    getPosition: _ => [0, 0, 0],
    getOrientation: [0, 0, -90],
    getScale: [1, 1, -1],
    material: false
  });

  const togglePlay = () => {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!isPlaying);
  };

  return (
    <DeckGL
      views={new FirstPersonView()}
      initialViewState={INITIAL_VIEW_STATE}
      controller={{scrollZoom: false, doubleClickZoom: false}}
      layers={[layer]}
      onClick={togglePlay}
      _animate={true}
    >
      {!isPlaying && (
        <div style={PLAY_BUTTON_STYLE}>
          <img src="https://deck.gl/images/play.png" width={150} />
        </div>
      )}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {DeckGL} from '@deck.gl/react/maplibre';
import type {Map as MaplibreMap} from 'maplibre-gl';
import {PARAMETERS} from './constants';
import {createMap} from './maplibre';
import {useAppStore} from '../../stores/app';

interface MapClientProps {
  children?: ReactNode;
}

/**
 * Map component with deck.gl + Maplibre integration
 */
export function MapClient({children}: MapClientProps) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MaplibreMap | null>(null);
  const setSelected = useAppStore(state => state.setSelected);

  const handleClick = (pickInfo: {picked?: boolean}) => {
    if (!pickInfo.picked) {
      setSelected(null);
    }
  };

  // Create the map once. `DeckGL` attaches its overlay to it, and re-attaches a recreated one.
  useEffect(() => {
    if (!container.current) {
      return;
    }
    const instance = createMap(container.current);
    setMap(instance);
    return () => {
      setMap(null);
      instance.remove();
    };
  }, []);

  return (
    <div id="maplibre" ref={container} style={{inset: 0, position: 'absolute'}}>
      <DeckGL interleaved parameters={PARAMETERS} onClick={handleClick} map={map}>
        {children}
      </DeckGL>
    </div>
  );
}

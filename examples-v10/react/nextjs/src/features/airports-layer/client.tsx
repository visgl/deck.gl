// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use client';

import 'client-only';
import {ScatterplotLayer} from '@deck.gl/react/layers';
import {useSelected} from '@/hooks/use-selected';
import {useHover} from '@/hooks/use-hover';
import type {AirportFeature} from '@/data-access/airports/types';

interface AirportsLayerClientProps {
  data: AirportFeature[];
}

/**
 * Client component that renders the scatterplot layer with interactions
 */
export function AirportsLayerClient({data}: AirportsLayerClientProps) {
  const [selected, setSelected] = useSelected();
  const [hovered, setHovered] = useHover();

  return (
    <ScatterplotLayer<AirportFeature>
      data={data}
      getFillColor={d => {
        if (selected === d.properties.IDENT) {
          return [255, 0, 0, 200]; // Red for selected
        }
        if (hovered === d.properties.IDENT) {
          return [255, 165, 0, 200]; // Orange for hovered
        }
        return [0, 128, 255, 160]; // Blue default
      }}
      getPosition={d => d.geometry.coordinates}
      getRadius={d => {
        if (selected === d.properties.IDENT) {
          return 8000; // Larger for selected
        }
        if (hovered === d.properties.IDENT) {
          return 6000; // Medium for hovered
        }
        return 4000; // Default size
      }}
      id="airports-layer"
      onClick={info => {
        if (info.object) {
          setSelected(info.object.properties.IDENT);
        }
      }}
      onHover={info => {
        setHovered(info.object?.properties.IDENT ?? null);
      }}
      pickable
      updateTriggers={{
        getFillColor: [selected, hovered],
        getRadius: [selected, hovered]
      }}
    />
  );
}

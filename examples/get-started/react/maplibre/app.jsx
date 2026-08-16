// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, NavigationControl, Popup, setWorkerUrl} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {MapLibreOverlay as DeckOverlay} from '@deck.gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function Root() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const layers = useMemo(
    () => [
      new GeoJsonLayer({
        id: 'airports',
        data: AIR_PORTS,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: info => setSelected(info.object)
        // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
      }),
      new ArcLayer({
        id: 'arcs',
        data: AIR_PORTS,
        dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
        // Styles
        getSourcePosition: f => [-0.4531566, 51.4709959], // London
        getTargetPosition: f => f.geometry.coordinates,
        getSourceColor: [0, 128, 200],
        getTargetColor: [200, 0, 80],
        getWidth: 1
      })
    ],
    []
  );

  useEffect(() => {
    const map = new Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [0.45, 51.47],
      zoom: 4,
      bearing: 0,
      pitch: 30
    });
    mapRef.current = map;
    map.addControl(new DeckOverlay({layers, interleaved: true}));
    map.addControl(new NavigationControl(), 'top-left');

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [layers]);

  useEffect(() => {
    if (!selected || !mapRef.current) {
      return undefined;
    }
    const popup = new Popup({anchor: 'bottom'})
      .setLngLat(selected.geometry.coordinates)
      .setText(`${selected.properties.name} (${selected.properties.abbrev})`)
      .addTo(mapRef.current);
    return () => popup.remove();
  }, [selected]);

  return <div ref={containerRef} style={{width: '100%', height: '100%'}} />;
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);

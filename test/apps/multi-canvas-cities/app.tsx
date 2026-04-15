import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {MapView, View} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {Map} from 'react-map-gl/maplibre';

type Landmark = {
  id: string;
  cityId: string;
  name: string;
  position: [number, number];
};

type LandmarkLayerProps = {
  viewportId?: string;
};

const CITY_PANELS = [
  {
    id: 'new-york',
    title: 'New York',
    subtitle: 'Midtown lights and waterfront routes',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    viewState: {longitude: -73.9857, latitude: 40.7484, zoom: 10.8, pitch: 35, bearing: -12},
    landmarks: [
      {id: 'times-square', cityId: 'new-york', name: 'Times Square', position: [-73.9851, 40.758]},
      {id: 'central-park', cityId: 'new-york', name: 'Central Park', position: [-73.9712, 40.7831]},
      {id: 'brooklyn-bridge', cityId: 'new-york', name: 'Brooklyn Bridge', position: [-73.9969, 40.7061]}
    ]
  },
  {
    id: 'london',
    title: 'London',
    subtitle: 'River crossings and west end clusters',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    viewState: {longitude: -0.1276, latitude: 51.5072, zoom: 10.8, pitch: 40, bearing: 18},
    landmarks: [
      {id: 'soho', cityId: 'london', name: 'Soho', position: [-0.1337, 51.5138]},
      {id: 'tower-bridge', cityId: 'london', name: 'Tower Bridge', position: [-0.0754, 51.5055]},
      {id: 'greenwich', cityId: 'london', name: 'Greenwich', position: [0.0005, 51.4826]}
    ]
  },
  {
    id: 'tokyo',
    title: 'Tokyo',
    subtitle: 'Station density across the eastern core',
    mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    viewState: {longitude: 139.7588, latitude: 35.6762, zoom: 10.7, pitch: 45, bearing: -22},
    landmarks: [
      {id: 'shibuya', cityId: 'tokyo', name: 'Shibuya', position: [139.7016, 35.6595]},
      {id: 'tokyo-station', cityId: 'tokyo', name: 'Tokyo Station', position: [139.7671, 35.6812]},
      {id: 'asakusa', cityId: 'tokyo', name: 'Asakusa', position: [139.7967, 35.7148]}
    ]
  },
  {
    id: 'sydney',
    title: 'Sydney',
    subtitle: 'Harbor landmarks with coastal spillover',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    viewState: {longitude: 151.2093, latitude: -33.8688, zoom: 10.9, pitch: 42, bearing: 24},
    landmarks: [
      {id: 'opera-house', cityId: 'sydney', name: 'Opera House', position: [151.2153, -33.8568]},
      {id: 'bondi', cityId: 'sydney', name: 'Bondi Beach', position: [151.2743, -33.8915]},
      {id: 'newtown', cityId: 'sydney', name: 'Newtown', position: [151.179, -33.8981]}
    ]
  }
] as const;

const VIEWS = CITY_PANELS.map(
  city =>
    new MapView({
      id: city.id,
      canvasId: city.id,
      controller: true
    })
);

const CITY_TITLES = Object.fromEntries(CITY_PANELS.map(city => [city.id, city.title])) as Record<
  string,
  string
>;

function App() {
  const [hoveredLandmark, setHoveredLandmark] = useState<Landmark | null>(null);

  const layers = useMemo(
    () =>
      CITY_PANELS.map(
        city =>
          new ScatterplotLayer<Landmark>({
            id: `${city.id}-landmarks`,
            data: city.landmarks,
            viewportId: city.id,
            pickable: true,
            parameters: {depthTest: false},
            radiusUnits: 'pixels',
            radiusMinPixels: 18,
            radiusMaxPixels: 36,
            stroked: true,
            lineWidthMinPixels: 3,
            getPosition: d => d.position,
            getRadius: d => (hoveredLandmark?.id === d.id ? 28 : 20),
            getFillColor: d =>
              hoveredLandmark?.id === d.id
                ? [255, 215, 110]
                : hoveredLandmark?.cityId === d.cityId
                  ? [255, 122, 89]
                  : [84, 196, 255],
            getLineColor: [255, 255, 255],
            onHover: info => setHoveredLandmark((info.object as Landmark) || null)
          })
      ),
    [hoveredLandmark]
  );

  return (
    <div
      style={{
        boxSizing: 'border-box',
        height: '100%',
        maxWidth: 1240,
        margin: '0 auto',
        padding: 24,
        display: 'grid',
        gridTemplateRows: 'auto auto minmax(0, 1fr)',
        gap: 16
      }}
    >
      <div style={{marginBottom: 20}}>
        <div style={{fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.7}}>
          deck.gl multi-canvas
        </div>
        <h1 style={{margin: '10px 0 8px', fontSize: 36, lineHeight: 1.05}}>
          Four live city views, one Deck instance
        </h1>
        <p style={{margin: 0, maxWidth: 760, fontSize: 16, lineHeight: 1.5, opacity: 0.86}}>
          Each panel has its own basemap, its own controller, and its own presentation canvas. Hover a landmark in
          any city and the signal carries through the rest of the page.
        </p>
      </div>

      <div
        style={{
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8
        }}
      >
        {hoveredLandmark ? (
          <strong>
            {hoveredLandmark.name} in {CITY_PANELS.find(city => city.id === hoveredLandmark.cityId)?.title}
          </strong>
        ) : (
          <strong>Hover any highlighted landmark</strong>
        )}
      </div>

      <DeckGL
        canvases={CITY_PANELS.map(city => city.id)}
        views={VIEWS}
        initialViewState={Object.fromEntries(CITY_PANELS.map(city => [city.id, city.viewState]))}
        layers={layers}
        getTooltip={({object}) => {
          const landmark = object as Landmark | null;
          return landmark
            ? {
                text: `${landmark.name}\n${CITY_TITLES[landmark.cityId]}`
              }
            : null;
        }}
        layerFilter={({layer, viewport}) =>
          Boolean(viewport && (layer.props as LandmarkLayerProps).viewportId === viewport.id)
        }
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          gap: '16px',
          width: '100%',
          height: '100%',
          minHeight: 0
        }}
      >
        {CITY_PANELS.map(city => (
          <View key={city.id} id={city.id}>
            <Map reuseMaps interactive={false} mapStyle={city.mapStyle} />
            <div
              style={{
                position: 'absolute',
                left: 12,
                top: 12,
                zIndex: 2,
                padding: '10px 12px',
                background: 'rgba(8,16,24,0.72)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                maxWidth: 220,
                pointerEvents: 'none'
              }}
            >
              <div style={{fontSize: 18, fontWeight: 700}}>{city.title}</div>
              <div style={{fontSize: 13, lineHeight: 1.35, opacity: 0.82}}>{city.subtitle}</div>
            </div>
          </View>
        ))}
      </DeckGL>
    </div>
  );
}

const root = document.getElementById('app');
if (!root) {
  throw new Error('App root not found');
}

createRoot(root).render(<App />);

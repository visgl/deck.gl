import * as React from 'react';
import {createRoot} from 'react-dom/client';

import {DeckGL} from '@deck.gl/react';
import {
  View,
  PickingInfo,
  MapView,
  MapViewState,
  _GlobeView as GlobeView,
  GlobeViewState,
  OrthographicView,
  OrthographicViewState
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {makePointGrid, makeLineGrid, Point} from './data';
import {Map, Source, Layer} from '@vis.gl/react-maplibre';
// Use dev build for source map and debugging
import maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import {CPULineLayer} from './cpu-line-layer';

const VIEWS: Record<
  string,
  {
    view: View;
    viewState: any;
    xRange: [number, number];
    yRange: [number, number];
    step: number;
    baseMap: 'mercator' | 'globe' | false;
  }
> = {
  map: {
    view: new MapView(),
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    } satisfies MapViewState,
    baseMap: 'mercator',
    xRange: [-180, 180],
    yRange: [-85, 85],
    step: 5
  },
  'map-high-zoom': {
    view: new MapView(),
    viewState: {
      longitude: 24.87,
      latitude: 60.175,
      zoom: 16
    } satisfies MapViewState,
    baseMap: 'mercator',
    xRange: [24.86, 24.88],
    yRange: [60.17, 60.18],
    step: 1 / 3000
  },
  globe: {
    view: new GlobeView(),
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 2
    } satisfies GlobeViewState,
    baseMap: 'globe',
    xRange: [-180, 180],
    yRange: [-85, 85],
    step: 5
  },
  orthographic: {
    view: new OrthographicView({flipY: false}),
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    } satisfies OrthographicViewState,
    baseMap: false,
    xRange: [-500, 500],
    yRange: [-400, 400],
    step: 40
  },
  'orthographic-high-zoom': {
    view: new OrthographicView({flipY: false}),
    viewState: {
      target: [20001, 10001, 0],
      zoom: 16
    } satisfies OrthographicViewState,
    baseMap: false,
    xRange: [20000.99, 20001.01],
    yRange: [10000.99, 10001.01],
    step: 1 / 3000
  }
} as const;

function getTooltip({object}: PickingInfo): string | null {
  return object ? JSON.stringify(object) : null;
}

function App() {
  const [viewMode, setViewMode] = React.useState<keyof typeof VIEWS>('map');

  const opts = VIEWS[viewMode];

  const pointData = React.useMemo(() => makePointGrid(opts), [viewMode]);
  const lineData = React.useMemo(() => makeLineGrid(opts), [viewMode]);
  const lineDataGeoJson = React.useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: lineData.map(line => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: line
        }
      }))
    };
  }, [lineData]);

  const layers = [
    // Reference grid when base map is not available (non-geo)
    !opts.baseMap &&
      new CPULineLayer<Point[]>({
        id: 'lines',
        data: lineData,
        getStartPosition: d => d[0],
        getEndPosition: d => d[1]
      }),
    new ScatterplotLayer<Point>({
      id: 'points',
      data: pointData,
      getPosition: d => d,
      getRadius: 5,
      getFillColor: d => [
        ((d[0] - opts.xRange[0]) / (opts.xRange[1] - opts.xRange[0])) * 255,
        ((d[1] - opts.yRange[0]) / (opts.yRange[1] - opts.yRange[0])) * 255,
        0
      ],
      opacity: 0.8,
      radiusUnits: 'pixels',
      radiusMaxPixels: 5,
      pickable: true
    })
  ];

  return (
    <>
      <DeckGL
        controller
        parameters={{cullMode: 'back'}}
        views={opts.view}
        initialViewState={opts.viewState}
        layers={layers}
        getTooltip={getTooltip}
      >
        {opts.baseMap && (
          <Map
            reuseMaps
            mapLib={maplibregl}
            projection={opts.baseMap}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          >
            <Source type="geojson" data={lineDataGeoJson}>
              <Layer
                type="line"
                paint={{
                  'line-color': 'black',
                  'line-width': 1
                }}
              />
            </Source>
          </Map>
        )}
      </DeckGL>
      <select
        value={viewMode}
        onChange={evt => setViewMode(evt.target.value as keyof typeof VIEWS)}
      >
        {Object.keys(VIEWS).map(mode => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
    </>
  );
}

createRoot(document.getElementById('app')!).render(<App />);

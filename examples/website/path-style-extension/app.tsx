// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL, PopupWidget} from '@deck.gl/react';
import {PathLayer, PolygonLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import '@deck.gl/widgets/stylesheet.css';

import type {Color, MapViewState, PickingInfo} from '@deck.gl/core';
import type {PathStyleExtensionProps} from '@deck.gl/extensions';
import type {Device} from '@luma.gl/core';

import ROAD_DIAGRAM_DATA from './data/seattle-road-diagram.json';

type Position = [longitude: number, latitude: number];
type DashPattern = [dash: number, gap: number];
export type MeasurementMode = 'physical' | 'screen';

export const ROAD_STYLE = {
  asphalt: [34, 38, 42, 255] as Color,
  vehicleLane: [90, 103, 111, 42] as Color,
  sidewalk: [183, 178, 165, 255] as Color,
  curb: [229, 222, 205, 220] as Color,
  pavementSymbol: [232, 232, 218, 220] as Color,
  whiteMarking: [247, 244, 226, 245] as Color,
  yellowMarking: [244, 195, 73, 250] as Color,
  bikePanel: [42, 146, 99, 175] as Color
};

type Asset = {
  id: string;
  label: string;
  details: {label: string; value: string | number}[];
  source: {layerName: string; objectId: string | number; url: string}[];
  style?: {
    widthMeters: number;
    colorRole?: keyof typeof ROAD_STYLE;
    dashMeters?: DashPattern;
    dashPixels?: DashPattern;
    offset?: number;
  };
};
type PathAsset = Asset & {path: Position[]};
type StyledPathAsset = PathAsset & {style: NonNullable<Asset['style']>};
type PolygonAsset = Asset & {polygon: Position[]};

const {assets} = ROAD_DIAGRAM_DATA as unknown as {
  assets: {
    surfacePaths: StyledPathAsset[];
    backgroundPaths: PathAsset[];
    laneBands: StyledPathAsset[];
    bikePanels: PolygonAsset[];
    crosswalks: StyledPathAsset[];
    transversePolygons: PolygonAsset[];
    transversePaths: StyledPathAsset[];
    longitudinalMarkings: StyledPathAsset[];
    detailPaths: StyledPathAsset[];
  };
};

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.34237,
  latitude: 47.62089,
  zoom: 19.2,
  pitch: 24,
  bearing: -12,
  minZoom: 17.5,
  maxZoom: 22,
  maxPitch: 45
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const DASH_EXTENSION = new PathStyleExtension({dashMode: 'path'});
const OFFSET_EXTENSION = new PathStyleExtension({offset: true});

function getDashArray(asset: Asset, measurementMode: MeasurementMode, dashScale: number) {
  const pattern =
    measurementMode === 'physical' ? asset.style?.dashMeters : asset.style?.dashPixels;
  const [dash, gap] = pattern || [0, 0];
  return [dash * dashScale, gap * dashScale] as DashPattern;
}

function getPopupHtml(asset: Asset, measurementMode: MeasurementMode, dashScale: number) {
  const lines = asset.details.map(detail => `${detail.label}: ${detail.value}`);
  const [dash, gap] = getDashArray(asset, measurementMode, dashScale);
  if (dash > 0) {
    const unit = measurementMode === 'physical' ? 'm' : 'px';
    lines.push(`Dash: ${+dash.toFixed(2)} ${unit}, gap: ${+gap.toFixed(2)} ${unit}`);
  }
  if (asset.style?.offset) {
    lines.push(`Offset: ${asset.style.offset} × width`);
  }
  for (const {url, layerName, objectId} of asset.source) {
    lines.push(
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${layerName} ${objectId}</a>`
    );
  }
  return `<strong>${asset.label}</strong><br>${lines.join('<br>')}`;
}

export default function App({
  device,
  measurementMode = 'physical',
  dashScale = 1,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  measurementMode?: MeasurementMode;
  dashScale?: number;
  mapStyle?: string;
}) {
  const [selected, setSelected] = useState<{asset: Asset; position: number[]} | null>(null);
  const isPhysical = measurementMode === 'physical';
  const markingUnits = isPhysical ? 'meters' : 'pixels';

  const layers = [
    new PathLayer<StyledPathAsset>({
      id: 'surfaces',
      data: assets.surfacePaths,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters,
      getColor: asset => ROAD_STYLE[asset.style.colorRole!],
      jointRounded: true,
      pickable: true
    }),
    new PathLayer<PathAsset>({
      id: 'drafting-lines',
      data: assets.backgroundPaths,
      getPath: asset => asset.path,
      getWidth: 1,
      widthUnits: 'pixels',
      getColor: [138, 146, 144, 100]
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: 'lane-bands',
      data: assets.laneBands,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters,
      getColor: ROAD_STYLE.vehicleLane,
      jointRounded: true,
      pickable: true,

      // Shift each lane sideways from the street centerline, in multiples of its width
      getOffset: asset => asset.style.offset!,
      extensions: [OFFSET_EXTENSION]
    }),
    new PolygonLayer<PolygonAsset>({
      id: 'bike-panels',
      data: assets.bikePanels,
      getPolygon: asset => asset.polygon,
      getFillColor: ROAD_STYLE.bikePanel,
      stroked: false,
      pickable: true
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: 'crosswalks',
      data: assets.crosswalks,
      getPath: asset => asset.path,
      getWidth: asset => (isPhysical ? asset.style.widthMeters : 18),
      widthUnits: markingUnits,
      getColor: ROAD_STYLE.whiteMarking,
      pickable: true,

      // Draw the crosswalk bars as one dashed path, stretched to start and end on a bar
      getDashArray: asset => getDashArray(asset, measurementMode, dashScale),
      dashUnits: markingUnits,
      dashJustified: true,
      dashGapPickable: true,
      extensions: [DASH_EXTENSION],
      updateTriggers: {
        getWidth: measurementMode,
        getDashArray: [measurementMode, dashScale]
      }
    }),
    new PolygonLayer<PolygonAsset>({
      id: 'transverse-polygons',
      data: assets.transversePolygons,
      getPolygon: asset => asset.polygon,
      getFillColor: ROAD_STYLE.whiteMarking,
      stroked: false,
      pickable: true
    }),
    new PathLayer<StyledPathAsset>({
      id: 'transverse-paths',
      data: assets.transversePaths,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters,
      widthMinPixels: 1,
      getColor: ROAD_STYLE.whiteMarking,
      pickable: true
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: 'longitudinal-markings',
      data: assets.longitudinalMarkings,
      getPath: asset => asset.path,
      getWidth: asset => (isPhysical ? asset.style.widthMeters : 2),
      widthUnits: markingUnits,
      widthMinPixels: 1,
      getColor: asset => ROAD_STYLE[asset.style.colorRole!],
      pickable: true,
      autoHighlight: true,
      highlightColor: [64, 211, 225, 110],

      // Lane lines dash continuously along each path; [0, 0] draws a solid line
      getDashArray: asset => getDashArray(asset, measurementMode, dashScale),
      dashUnits: markingUnits,
      dashGapPickable: true,
      extensions: [DASH_EXTENSION],
      updateTriggers: {
        getWidth: measurementMode,
        getDashArray: [measurementMode, dashScale]
      }
    }),
    new PathLayer<StyledPathAsset>({
      id: 'details',
      data: assets.detailPaths,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters,
      widthMinPixels: 0.75,
      widthMaxPixels: 3,
      getColor: asset => ROAD_STYLE[asset.style.colorRole!],
      capRounded: true,
      jointRounded: true,
      pickable: true
    })
  ];

  return (
    <DeckGL
      device={device}
      layers={layers}
      parameters={{depthCompare: 'always'}}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      pickingRadius={5}
      onClick={({object, coordinate}: PickingInfo<Asset>) =>
        setSelected(object && coordinate ? {asset: object, position: coordinate} : null)
      }
    >
      <Map reuseMaps mapStyle={mapStyle} />
      {selected && (
        <PopupWidget
          id="road-asset-details"
          position={selected.position}
          content={{html: getPopupHtml(selected.asset, measurementMode, dashScale)}}
          placement="top"
          offset={14}
          closeButton
          onOpenChange={isOpen => !isOpen && setSelected(null)}
          // Let the source links in the popup receive clicks
          style={{pointerEvents: 'auto'}}
        />
      )}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}

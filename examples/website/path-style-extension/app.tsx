// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL, PopupWidget} from '@deck.gl/react';
import {PathLayer, PolygonLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import 'deck.gl/stylesheet.css';

import type {Color, MapViewState, PickingInfo} from '@deck.gl/core';
import type {DashUnits, PathStyleExtensionProps} from '@deck.gl/extensions';
import type {Device} from '@luma.gl/core';

import ROAD_DIAGRAM_DATA from './data/seattle-road-diagram.json';

type Position = [longitude: number, latitude: number];
type DashPattern = [dash: number, gap: number];
export type MeasurementMode = 'physical' | 'screen';

type SourceRef = {
  provider: string;
  layerName: string;
  objectId: string | number;
  url: string;
};

type AssetDetail = {
  label: string;
  value: string | number;
};

type AssetStyle = {
  widthMeters?: number;
  widthPixels?: number;
  colorRole?: 'whiteMarking' | 'yellowMarking';
  dashMeters?: DashPattern;
  dashPixels?: DashPattern;
  dashMode?: 'path';
  dashJustified?: boolean;
  dashGapPickable?: boolean;
  offset?: number;
};

type InspectableAsset = {
  id: string;
  label: string;
  source: SourceRef[];
  details: AssetDetail[];
  style?: AssetStyle;
};

type PathAsset = InspectableAsset & {
  path: Position[];
};

type StyledPathAsset = PathAsset & {
  style: AssetStyle;
};

type PolygonAsset = InspectableAsset & {
  polygon: Position[];
};

type SelectedAsset = {
  asset: InspectableAsset;
  position: Position;
};

type Snapshot = {
  assets: {
    roadSurfaces: StyledPathAsset[];
    sidewalks: StyledPathAsset[];
    backgroundPaths: PathAsset[];
    laneBands: StyledPathAsset[];
    bikePanels: PolygonAsset[];
    crosswalks: StyledPathAsset[];
    transversePolygons: PolygonAsset[];
    transversePaths: StyledPathAsset[];
    longitudinalMarkings: StyledPathAsset[];
    curbs: PathAsset[];
    symbols: PathAsset[];
  };
};

export const ROAD_STYLE = {
  asphalt: [34, 38, 42, 255] as Color,
  vehicleLane: [90, 103, 111, 42] as Color,
  sidewalk: [183, 178, 165, 255] as Color,
  curb: [229, 222, 205, 220] as Color,
  whiteMarking: [247, 244, 226, 245] as Color,
  yellowMarking: [244, 195, 73, 250] as Color,
  bikePanel: [42, 146, 99, 175] as Color
};

export const DASH_STYLE = {
  physical: 'Source dimensions in meters',
  screen: 'Cartographic dimensions in pixels'
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
const SNAPSHOT = ROAD_DIAGRAM_DATA as unknown as Snapshot;
const CROSSWALK_STYLE = SNAPSHOT.assets.crosswalks[0].style;
const LONGITUDINAL_STYLE = SNAPSHOT.assets.longitudinalMarkings[0].style;

const DASH_EXTENSION = new PathStyleExtension({dashMode: LONGITUDINAL_STYLE.dashMode});
const OFFSET_EXTENSION = new PathStyleExtension({offset: true});
const CROSSWALK_EXTENSION = new PathStyleExtension({
  dash: true,
  dashMode: CROSSWALK_STYLE.dashMode
});

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function scaleDashPattern(pattern: DashPattern, dashScale: number): DashPattern {
  return pattern.map(value => value * dashScale) as DashPattern;
}

function getDashPattern(
  asset: InspectableAsset,
  measurementMode: MeasurementMode,
  dashScale: number
): DashPattern {
  const pattern =
    measurementMode === 'physical' ? asset.style?.dashMeters : asset.style?.dashPixels;
  return scaleDashPattern(pattern || [0, 0], dashScale);
}

function hasDashPattern(pattern: DashPattern): boolean {
  return pattern.some(value => value > 0);
}

function formatDashPattern(pattern: DashPattern, measurementMode: MeasurementMode): string {
  const unit = measurementMode === 'physical' ? 'm' : 'px';
  const [dash, gap] = pattern.map(value => Number(value.toFixed(2)));
  return `${dash} ${unit} dash · ${gap} ${unit} gap`;
}

function createPopupHtml(
  asset: InspectableAsset,
  measurementMode: MeasurementMode,
  dashScale: number
): string {
  const pattern = getDashPattern(asset, measurementMode, dashScale);
  const extensionDetails: string[] = [];
  if (hasDashPattern(pattern)) {
    extensionDetails.push(formatDashPattern(pattern, measurementMode));
    if (asset.style?.dashJustified) {
      extensionDetails.push('justified');
    } else if (asset.style?.dashMode === 'path') {
      extensionDetails.push('continuous');
    }
    if (asset.style?.dashGapPickable) {
      extensionDetails.push('gaps pickable');
    }
  } else if (asset.style?.offset !== undefined) {
    const offset = asset.style.offset;
    extensionDetails.push(`Offset ${offset > 0 ? '+' : ''}${offset}× path width`);
  }

  const details = asset.details
    .map(
      detail =>
        `<div><span style="color:#63757d">${escapeHtml(detail.label)}:</span> ${escapeHtml(detail.value)}</div>`
    )
    .join('');
  const sources = asset.source
    .map(
      reference =>
        `<a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer" ` +
        `style="color:#006dc7;text-decoration:underline">${escapeHtml(reference.layerName)} / ${escapeHtml(
          reference.objectId
        )}</a>`
    )
    .join('<br>');
  const extension = extensionDetails.length
    ? `<div style="margin-top:8px"><div style="color:#63757d">PathStyleExtension</div>` +
      `<div>${escapeHtml(extensionDetails.join(' · '))}</div></div>`
    : '';

  return (
    `<div style="min-width:220px;max-width:300px;font:13px/1.45 system-ui,sans-serif;color:#172126">` +
    `<strong style="display:block;margin-bottom:4px;font-size:14px">${escapeHtml(asset.label)}</strong>` +
    details +
    extension +
    `<div style="margin-top:8px"><span style="color:#63757d">Source:</span><br>${sources}</div>` +
    '</div>'
  );
}

function getAssetPosition(asset: InspectableAsset): Position {
  const positionedAsset = asset as InspectableAsset & {
    path?: Position[];
    polygon?: Position[];
  };
  const positions = positionedAsset.path || positionedAsset.polygon;
  return (
    positions?.[Math.floor(positions.length / 2)] || [
      INITIAL_VIEW_STATE.longitude,
      INITIAL_VIEW_STATE.latitude
    ]
  );
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
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const dashUnits: DashUnits = measurementMode === 'physical' ? 'meters' : 'pixels';
  const interactiveProps = {pickable: true};

  const layers = [
    new PathLayer<StyledPathAsset>({
      id: 'road-surfaces',
      data: SNAPSHOT.assets.roadSurfaces,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters || 0,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.asphalt,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps
    }),
    new PathLayer<StyledPathAsset>({
      id: 'sidewalks',
      data: SNAPSHOT.assets.sidewalks,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters || 0,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.sidewalk,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps
    }),
    new PathLayer<PathAsset>({
      id: 'source-background',
      data: SNAPSHOT.assets.backgroundPaths,
      getPath: asset => asset.path,
      getWidth: 1,
      widthUnits: 'pixels',
      getColor: [138, 146, 144, 100],
      pickable: false
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: 'derived-lane-bands',
      data: SNAPSHOT.assets.laneBands,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters || 0,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.vehicleLane,
      getOffset: asset => asset.style.offset || 0,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps,
      extensions: [OFFSET_EXTENSION]
    }),
    new PolygonLayer<PolygonAsset>({
      id: 'bike-panels',
      data: SNAPSHOT.assets.bikePanels,
      getPolygon: asset => asset.polygon,
      filled: true,
      stroked: false,
      getFillColor: ROAD_STYLE.bikePanel,
      ...interactiveProps
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: `justified-crosswalk-guides-${measurementMode}`,
      data: SNAPSHOT.assets.crosswalks,
      getPath: asset => asset.path,
      getWidth: asset =>
        (measurementMode === 'physical' ? asset.style.widthMeters : asset.style.widthPixels) || 0,
      widthUnits: measurementMode === 'physical' ? 'meters' : 'pixels',
      getColor: ROAD_STYLE.whiteMarking,
      getDashArray: asset => getDashPattern(asset, measurementMode, dashScale),
      updateTriggers: {getDashArray: [measurementMode, dashScale]},
      dashUnits,
      dashJustified: CROSSWALK_STYLE.dashJustified,
      dashGapPickable: CROSSWALK_STYLE.dashGapPickable,
      capRounded: false,
      jointRounded: false,
      ...interactiveProps,
      extensions: [CROSSWALK_EXTENSION]
    }),
    new PolygonLayer<PolygonAsset>({
      id: 'explicit-transverse-markings',
      data: SNAPSHOT.assets.transversePolygons,
      getPolygon: asset => asset.polygon,
      filled: true,
      stroked: false,
      getFillColor: ROAD_STYLE.whiteMarking,
      ...interactiveProps
    }),
    new PathLayer<StyledPathAsset>({
      id: 'open-transverse-markings',
      data: SNAPSHOT.assets.transversePaths,
      getPath: asset => asset.path,
      getWidth: asset => asset.style.widthMeters || 0,
      widthUnits: 'meters',
      widthMinPixels: 1,
      getColor: ROAD_STYLE.whiteMarking,
      ...interactiveProps
    }),
    new PathLayer<StyledPathAsset, PathStyleExtensionProps<StyledPathAsset>>({
      id: `longitudinal-markings-${measurementMode}`,
      data: SNAPSHOT.assets.longitudinalMarkings,
      getPath: asset => asset.path,
      getWidth: asset =>
        (measurementMode === 'physical' ? asset.style.widthMeters : asset.style.widthPixels) || 0,
      widthUnits: measurementMode === 'physical' ? 'meters' : 'pixels',
      widthMinPixels: 1,
      getColor: asset => ROAD_STYLE[asset.style.colorRole || 'whiteMarking'],
      getDashArray: asset => getDashPattern(asset, measurementMode, dashScale),
      updateTriggers: {getDashArray: [measurementMode, dashScale]},
      dashUnits,
      dashJustified: LONGITUDINAL_STYLE.dashJustified,
      dashGapPickable: LONGITUDINAL_STYLE.dashGapPickable,
      capRounded: false,
      jointRounded: false,
      autoHighlight: true,
      highlightColor: [64, 211, 225, 110],
      ...interactiveProps,
      extensions: [DASH_EXTENSION]
    }),
    new PathLayer<PathAsset>({
      id: 'curbs-and-separators',
      data: SNAPSHOT.assets.curbs,
      getPath: asset => asset.path,
      getWidth: 0.12,
      widthUnits: 'meters',
      widthMinPixels: 0.8,
      widthMaxPixels: 3,
      capRounded: true,
      jointRounded: true,
      getColor: ROAD_STYLE.curb,
      ...interactiveProps
    }),
    new PathLayer<PathAsset>({
      id: 'pavement-symbols',
      data: SNAPSHOT.assets.symbols,
      getPath: asset => asset.path,
      getWidth: 0.1,
      widthUnits: 'meters',
      widthMinPixels: 0.7,
      widthMaxPixels: 3,
      capRounded: true,
      jointRounded: true,
      getColor: [232, 232, 218, 220],
      ...interactiveProps
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
      onClick={(info: PickingInfo<InspectableAsset>) => {
        if (!info.object) {
          setSelectedAsset(null);
          return;
        }
        setSelectedAsset({
          asset: info.object,
          position: info.coordinate
            ? [info.coordinate[0], info.coordinate[1]]
            : getAssetPosition(info.object)
        });
      }}
      aria-label={`Street Design Anatomy. ${DASH_STYLE[measurementMode]}. Dash patterns are scaled by ${dashScale}.`}
    >
      <Map reuseMaps mapStyle={mapStyle} />
      {selectedAsset && (
        <PopupWidget
          id="road-asset-details"
          position={selectedAsset.position}
          content={{
            html: createPopupHtml(selectedAsset.asset, measurementMode, dashScale)
          }}
          placement="top"
          offset={14}
          closeButton
          closeOnClickOutside
          onOpenChange={isOpen => !isOpen && setSelectedAsset(null)}
          style={{pointerEvents: 'auto', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)'}}
        />
      )}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}

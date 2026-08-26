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

type GeoJsonGeometry = {
  type: 'Point' | 'LineString' | 'MultiLineString';
  coordinates: Position | Position[] | Position[][];
};

type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: Record<string, string | number | null>;
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

type SourceRef = {
  provider: string;
  itemId: string;
  layerId: number;
  layerName: string;
  objectId: string | number;
};

type InspectableAsset = {
  id: string;
  label: string;
  source: SourceRef[];
  properties: Record<string, string | number | null>;
  derived: boolean;
  derivation?: {
    operation: string;
    parameters: Record<string, string | number | boolean | null>;
    representation: string;
  };
  renderDetails?: Record<string, string | number | boolean>;
};

type SourcePath = InspectableAsset & {
  path: Position[];
};

type SourcePolygon = InspectableAsset & {
  polygon: Position[];
};

type LaneBand = InspectableAsset & {
  path: Position[];
  widthMeters: number;
  offsetWidths: number;
  kind: 'vehicle';
};

type CrosswalkGuide = InspectableAsset & {
  path: Position[];
  widthMeters: number;
  dashMeters: DashPattern;
  dashPixels: DashPattern;
  justified: boolean;
  transverseMarkingObjectIds: Array<string | number>;
};

type SelectedAsset = {
  asset: InspectableAsset;
  position: Position;
};

type Snapshot = {
  generatedAt: string;
  layers: Record<string, FeatureCollection>;
  derived: {
    laneBands: LaneBand[];
    crosswalkGuides: CrosswalkGuide[];
    symbolPaths: SourcePath[];
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
const FEET_TO_METERS = 0.3048;
const INCHES_TO_METERS = 0.0254;
const DEFAULT_MARKING_WIDTH_METERS = 0.15;
const DEFAULT_MARKING_WIDTH_PIXELS = 2;
const SEATTLE_SERVICE_ROOT = 'https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services';

const SOURCE_SERVICE_URLS: Record<string, string> = {
  e7c54ba0f1b24128a9cb2a95912a5194: `${SEATTLE_SERVICE_ROOT}/SDOT_Channelization_view/FeatureServer`,
  f91318f1cc43489fb0e7aca2fde22899: `${SEATTLE_SERVICE_ROOT}/Seattle_Streets_1/FeatureServer`,
  '20abc2269f6f4283a53cf31b93de718f': `${SEATTLE_SERVICE_ROOT}/Sidewalks_CDL/FeatureServer`,
  '53635945962e42b9a1f4473557176861': `${SEATTLE_SERVICE_ROOT}/Marked_Crosswalks_CDL/FeatureServer`,
  bf36bd11b499489d8cc1d491b72eb712: `${SEATTLE_SERVICE_ROOT}/SDOT_Bike_Facilities/FeatureServer`
};

const DASH_EXTENSION = new PathStyleExtension({dashMode: 'path'});
const OFFSET_EXTENSION = new PathStyleExtension({offset: true});
const CROSSWALK_EXTENSION = new PathStyleExtension({dash: true, dashMode: 'path'});

const SOURCE_METADATA: Record<string, {layerName: string; itemId: string; layerId: number}> = {
  verticalElements: {
    layerName: 'VerticalElements',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 0
  },
  background: {
    layerName: 'GENBKGRND',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 2
  },
  panelMarkings: {
    layerName: 'PanelMarkings',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 3
  },
  longitudinalMarkings: {
    layerName: 'Longitudinal_Markings',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 4
  },
  transverseMarkings: {
    layerName: 'TransverseMarkings',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 5
  },
  symbols: {
    layerName: 'Legend_and_Symbols',
    itemId: 'e7c54ba0f1b24128a9cb2a95912a5194',
    layerId: 6
  },
  streets: {
    layerName: 'Seattle Streets',
    itemId: 'f91318f1cc43489fb0e7aca2fde22899',
    layerId: 0
  },
  sidewalks: {
    layerName: 'Sidewalks',
    itemId: '20abc2269f6f4283a53cf31b93de718f',
    layerId: 0
  }
};

function getSourceReference(layerKey: string, feature: GeoJsonFeature): SourceRef {
  const metadata = SOURCE_METADATA[layerKey];
  return {
    provider: 'City of Seattle Department of Transportation',
    itemId: metadata.itemId,
    layerId: metadata.layerId,
    layerName: metadata.layerName,
    objectId: feature.properties.OBJECTID as string | number
  };
}

function getLinePaths(geometry: GeoJsonGeometry): Position[][] {
  if (geometry.type === 'LineString') {
    return [geometry.coordinates as Position[]];
  }
  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates as Position[][];
  }
  return [];
}

function createSourcePaths(layerKey: string, label: string): SourcePath[] {
  return SNAPSHOT.layers[layerKey].features.flatMap(feature =>
    getLinePaths(feature.geometry).map((path, pathIndex) => ({
      id: `${layerKey}-${feature.properties.OBJECTID}-${pathIndex}`,
      label,
      path,
      source: [getSourceReference(layerKey, feature)],
      properties: feature.properties,
      derived: false
    }))
  );
}

function isClosedPath(path: Position[]): boolean {
  const first = path[0];
  const last = path.at(-1);
  return Boolean(path.length >= 4 && last && first[0] === last[0] && first[1] === last[1]);
}

function getPathLengthMeters(path: Position[]): number {
  let lengthMeters = 0;
  for (let index = 1; index < path.length; index++) {
    const start = path[index - 1];
    const end = path[index];
    const latitudeRadians = (((start[1] + end[1]) / 2) * Math.PI) / 180;
    const x = (end[0] - start[0]) * 111320 * Math.cos(latitudeRadians);
    const y = (end[1] - start[1]) * 110540;
    lengthMeters += Math.hypot(x, y);
  }
  return lengthMeters;
}

function getSidewalkWidthMeters(asset: SourcePath): number {
  return Math.max(1.5, Number(asset.properties.SW_WIDTH || 72) * INCHES_TO_METERS);
}

function createSourcePolygons(layerKey: string, label: string): SourcePolygon[] {
  return createSourcePaths(layerKey, label)
    .filter(asset => isClosedPath(asset.path))
    .map(asset => ({...asset, polygon: asset.path}));
}

export function parseDashPattern(value: string | number | null): DashPattern {
  if (!value || /^solid$/i.test(String(value).trim())) {
    return [0, 0];
  }
  const match = String(value)
    .trim()
    .match(/^(\d+(?:\.\d+)?)'\s*(?:dash)?\s*[,/]?\s*(\d+(?:\.\d+)?)'\s*(?:skip|pattern)$/i);
  if (!match) {
    return [0, 0];
  }
  return [Number(match[1]) * FEET_TO_METERS, Number(match[2]) * FEET_TO_METERS];
}

function getScreenDashPattern(pattern: DashPattern): DashPattern {
  if (!pattern[0] || !pattern[1]) {
    return [0, 0];
  }
  const dashPixels = pattern[0] <= 0.7 ? 4 : 6;
  return [dashPixels, dashPixels * (pattern[1] / pattern[0])];
}

function parseMarkingWidth(value: string | number | null): number | null {
  if (typeof value === 'number' && value > 0) {
    return value * INCHES_TO_METERS;
  }
  const match = String(value || '').match(/^(\d+(?:\.\d+)?)\s*(?:"|in)$/i);
  return match ? Number(match[1]) * INCHES_TO_METERS : null;
}

function getMarkingColor(asset: SourcePath): Color {
  return asset.properties.Color === 'Yellow' ? ROAD_STYLE.yellowMarking : ROAD_STYLE.whiteMarking;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSourceUrl(reference: SourceRef): string {
  const serviceUrl = SOURCE_SERVICE_URLS[reference.itemId];
  if (serviceUrl) {
    return `${serviceUrl}/${reference.layerId}/${encodeURIComponent(reference.objectId)}`;
  }
  return `https://www.arcgis.com/home/item.html?id=${encodeURIComponent(reference.itemId)}`;
}

function isCrosswalkGuide(asset: InspectableAsset): asset is CrosswalkGuide {
  return 'dashMeters' in asset;
}

function scaleDashPattern(pattern: DashPattern, dashScale: number): DashPattern {
  return pattern.map(value => value * dashScale) as DashPattern;
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
  const detailRows: Array<[string, string | number | null | undefined]> = [
    ['Type', asset.properties.Type || asset.properties.MARKING_TYPE],
    ['Color', asset.properties.Color],
    ['Width', asset.properties.Width],
    ['Material', asset.properties.Material]
  ];

  let extensionUsage = '';
  if (isCrosswalkGuide(asset)) {
    const sourcePattern = measurementMode === 'physical' ? asset.dashMeters : asset.dashPixels;
    extensionUsage = `${formatDashPattern(
      scaleDashPattern(sourcePattern, dashScale),
      measurementMode
    )} · justified`;
  } else {
    const sourcePattern = parseDashPattern(asset.properties.Type);
    const pattern =
      measurementMode === 'physical' ? sourcePattern : getScreenDashPattern(sourcePattern);
    if (hasDashPattern(pattern)) {
      extensionUsage = `${formatDashPattern(
        scaleDashPattern(pattern, dashScale),
        measurementMode
      )} · continuous · gaps pickable`;
    }
  }

  if (!extensionUsage && asset.renderDetails?.offset !== undefined) {
    const offset = Number(asset.renderDetails.offset);
    extensionUsage = `Offset ${offset > 0 ? '+' : ''}${offset}× path width`;
  }

  const details = detailRows
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) =>
        `<div><span style="color:#63757d">${escapeHtml(label)}:</span> ${escapeHtml(value)}</div>`
    )
    .join('');
  const sources = asset.source
    .map(
      reference =>
        `<a href="${escapeHtml(getSourceUrl(reference))}" target="_blank" rel="noopener noreferrer" ` +
        `style="color:#006dc7;text-decoration:underline">${escapeHtml(reference.layerName)} / ${escapeHtml(
          reference.objectId
        )}</a>`
    )
    .join('<br>');
  const extension = extensionUsage
    ? `<div style="margin-top:8px"><div style="color:#63757d">PathStyleExtension</div>` +
      `<div>${escapeHtml(extensionUsage)}</div></div>`
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

const ROAD_APPROACHES = createSourcePaths('streets', 'Street surface');
const SIDEWALKS = createSourcePaths('sidewalks', 'Sidewalk');
const SIDEWALK_CORRIDORS = SIDEWALKS.filter(
  sidewalk => getPathLengthMeters(sidewalk.path) >= getSidewalkWidthMeters(sidewalk) * 2
);
const BACKGROUND_PATHS = createSourcePaths('background', 'Source drafting line');
const VERTICAL_ELEMENTS = createSourcePaths('verticalElements', 'Curb or separator');
const PANEL_POLYGONS = createSourcePolygons('panelMarkings', 'Bicycle panel');
const LONGITUDINAL_MARKINGS = createSourcePaths('longitudinalMarkings', 'Longitudinal marking');
const CROSSWALK_GUIDES = SNAPSHOT.derived.crosswalkGuides.map(crosswalk => ({
  ...crosswalk,
  label: 'Crosswalk',
  renderDetails: {dashArray: crosswalk.dashMeters.join(', '), justified: true}
}));
const REPLACED_TRANSVERSE_MARKING_OBJECT_IDS = new Set(
  CROSSWALK_GUIDES.flatMap(crosswalk => crosswalk.transverseMarkingObjectIds)
);
const TRANSVERSE_POLYGONS = createSourcePolygons('transverseMarkings', 'Transverse marking').filter(
  asset => !REPLACED_TRANSVERSE_MARKING_OBJECT_IDS.has(asset.source[0].objectId)
);
const TRANSVERSE_PATHS = createSourcePaths('transverseMarkings', 'Transverse marking').filter(
  asset => !isClosedPath(asset.path)
);
const SYMBOL_PATHS = SNAPSHOT.derived.symbolPaths;
const LANE_BANDS = SNAPSHOT.derived.laneBands.map(lane => ({
  ...lane,
  label: 'Vehicle lane',
  properties: {},
  renderDetails: {offset: lane.offsetWidths}
}));

function getAssetPosition(asset: InspectableAsset): Position {
  const positionedAsset = asset as Partial<SourcePath & SourcePolygon>;
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
  const interactiveProps = {
    pickable: true
  };

  const longitudinalAssets = LONGITUDINAL_MARKINGS.map(asset => {
    const dashMeters = parseDashPattern(asset.properties.Type);
    const sourcePattern =
      measurementMode === 'physical' ? dashMeters : getScreenDashPattern(dashMeters);
    return {
      ...asset,
      renderDetails: {
        dashArray: scaleDashPattern(sourcePattern, dashScale).join(', '),
        dashUnits,
        justified: false,
        gapPickable: true
      }
    };
  });

  const layers = [
    new PathLayer<SourcePath>({
      id: 'road-surfaces',
      data: ROAD_APPROACHES,
      getPath: asset => asset.path,
      getWidth: asset => Number(asset.properties.SURFACEWIDTH || 0) * FEET_TO_METERS,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.asphalt,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps
    }),
    new PathLayer<SourcePath>({
      id: 'sidewalks',
      data: SIDEWALK_CORRIDORS,
      getPath: asset => asset.path,
      getWidth: getSidewalkWidthMeters,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.sidewalk,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps
    }),
    new PathLayer<SourcePath>({
      id: 'source-background',
      data: BACKGROUND_PATHS,
      getPath: asset => asset.path,
      getWidth: 1,
      widthUnits: 'pixels',
      getColor: [138, 146, 144, 100],
      pickable: false
    }),
    new PathLayer<LaneBand, PathStyleExtensionProps<LaneBand>>({
      id: 'derived-lane-bands',
      data: LANE_BANDS,
      getPath: lane => lane.path,
      getWidth: lane => lane.widthMeters,
      widthUnits: 'meters',
      getColor: ROAD_STYLE.vehicleLane,
      getOffset: lane => lane.offsetWidths,
      capRounded: false,
      jointRounded: true,
      ...interactiveProps,
      extensions: [OFFSET_EXTENSION]
    }),
    new PolygonLayer<SourcePolygon>({
      id: 'bike-panels',
      data: PANEL_POLYGONS,
      getPolygon: asset => asset.polygon,
      filled: true,
      stroked: false,
      getFillColor: ROAD_STYLE.bikePanel,
      ...interactiveProps
    }),
    new PathLayer<CrosswalkGuide, PathStyleExtensionProps<CrosswalkGuide>>({
      id: `justified-crosswalk-guides-${measurementMode}`,
      data: CROSSWALK_GUIDES,
      getPath: asset => asset.path,
      getWidth: asset => (measurementMode === 'physical' ? asset.widthMeters : 18),
      widthUnits: measurementMode === 'physical' ? 'meters' : 'pixels',
      getColor: ROAD_STYLE.whiteMarking,
      getDashArray: asset =>
        scaleDashPattern(
          measurementMode === 'physical' ? asset.dashMeters : asset.dashPixels,
          dashScale
        ),
      updateTriggers: {getDashArray: [dashScale]},
      dashUnits,
      dashJustified: true,
      dashGapPickable: true,
      capRounded: false,
      jointRounded: false,
      ...interactiveProps,
      extensions: [CROSSWALK_EXTENSION]
    }),
    new PolygonLayer<SourcePolygon>({
      id: 'explicit-transverse-markings',
      data: TRANSVERSE_POLYGONS,
      getPolygon: asset => asset.polygon,
      filled: true,
      stroked: false,
      getFillColor: ROAD_STYLE.whiteMarking,
      ...interactiveProps
    }),
    new PathLayer<SourcePath, PathStyleExtensionProps<SourcePath>>({
      id: 'open-transverse-markings',
      data: TRANSVERSE_PATHS,
      getPath: asset => asset.path,
      getWidth: DEFAULT_MARKING_WIDTH_METERS,
      widthUnits: 'meters',
      widthMinPixels: 1,
      getColor: ROAD_STYLE.whiteMarking,
      ...interactiveProps
    }),
    new PathLayer<SourcePath, PathStyleExtensionProps<SourcePath>>({
      id: `longitudinal-markings-${measurementMode}`,
      data: longitudinalAssets,
      getPath: asset => asset.path,
      getWidth: asset =>
        measurementMode === 'physical'
          ? parseMarkingWidth(asset.properties.Width) || DEFAULT_MARKING_WIDTH_METERS
          : DEFAULT_MARKING_WIDTH_PIXELS,
      widthUnits: measurementMode === 'physical' ? 'meters' : 'pixels',
      widthMinPixels: 1,
      getColor: getMarkingColor,
      getDashArray: asset => {
        const pattern = parseDashPattern(asset.properties.Type);
        return scaleDashPattern(
          measurementMode === 'physical' ? pattern : getScreenDashPattern(pattern),
          dashScale
        );
      },
      updateTriggers: {getDashArray: [dashScale]},
      dashUnits,
      dashJustified: false,
      dashGapPickable: true,
      capRounded: false,
      jointRounded: false,
      autoHighlight: true,
      highlightColor: [64, 211, 225, 110],
      ...interactiveProps,
      extensions: [DASH_EXTENSION]
    }),
    new PathLayer<SourcePath>({
      id: 'curbs-and-separators',
      data: VERTICAL_ELEMENTS,
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
    new PathLayer<SourcePath>({
      id: 'pavement-symbols',
      data: SYMBOL_PATHS,
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

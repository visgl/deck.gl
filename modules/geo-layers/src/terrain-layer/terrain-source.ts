// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TextureSource} from '@deck.gl/core';
import {load} from '@loaders.gl/core';
import type {Loader, TileSource, TileSourceMetadata} from '@loaders.gl/loader-utils';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import {TerrainWorkerLoader} from '@loaders.gl/terrain';

import {
  getURLFromTemplate,
  type Bounds,
  type TileLoadProps,
  type URLTemplate
} from '../tileset-2d/index';

const MIN_TERRAIN_MESH_MAX_ERROR = 1;
const DEFAULT_TERRAIN_MESH_MAX_ERROR = 4;
const NORMALIZED_TERRAIN_BOUNDS: Bounds = [0, 0, 1, 1];

/** Object used to decode color channels into elevation meters. */
export type ElevationDecoder = {
  rScaler: number;
  gScaler: number;
  bScaler: number;
  offset: number;
};

/** Bounding box stored on loaders.gl terrain meshes. */
export type TerrainMeshBoundingBox = [min: number[], max: number[]];

/** Terrain mesh shape returned by loaders.gl terrain loaders. */
export type TerrainMesh = {
  attributes: MeshAttributes;
  indices?: MeshAttribute;
  header?: {
    vertexCount?: number;
    boundingBox?: TerrainMeshBoundingBox;
  };
  [key: string]: unknown;
};

/** Projection-independent terrain tile payload retained by a shared tileset. */
export type TerrainTileData = {
  /** Terrain mesh positioned in normalized tile-local x/y coordinates. */
  mesh: TerrainMesh | null;
  /** Optional surface texture for the tile. */
  texture: TextureSource | null;
  /** Derived render meshes keyed by projection family. */
  renderMeshes: Map<string, TerrainMesh | null>;
  /** Estimated bytes retained by the base payload and derived render meshes. */
  readonly byteLength: number;
};

/** Fetch hook used by {@link TerrainSource}. */
export type TerrainSourceFetch = (
  url: string,
  context: {
    propName: 'elevationData' | 'texture';
    loaders?: Loader[];
    loadOptions?: any;
    signal?: AbortSignal;
  }
) => Promise<unknown> | unknown;

/** Props for the experimental terrain tile source. */
export type TerrainSourceProps = {
  /** Image URL template that encodes height data. */
  elevationData: URLTemplate;
  /** Optional image URL template to use as the surface texture. */
  texture?: URLTemplate;
  /** Martini error tolerance in meters. */
  meshMaxError?: number;
  /** Object used to decode color channels into elevation meters. */
  elevationDecoder?: ElevationDecoder;
  /** Loaders used for elevation requests. Defaults to `TerrainWorkerLoader`. */
  loaders?: Loader[];
  /** loaders.gl options used by elevation and texture requests. */
  loadOptions?: any;
  /** Optional fetch hook for applications that need custom request handling. */
  fetch?: TerrainSourceFetch;
  /** Minimum source zoom reported through TileSource metadata. */
  minZoom?: number;
  /** Maximum source zoom reported through TileSource metadata. */
  maxZoom?: number;
  /** Source bounds reported through TileSource metadata. */
  extent?: Bounds | null;
};

/** Result of retrieving or materializing one derived terrain render mesh. */
export type TerrainRenderMeshResult = {
  mesh: TerrainMesh | null;
  isNew: boolean;
};

const DEFAULT_ELEVATION_DECODER: ElevationDecoder = {
  rScaler: 1,
  gScaler: 0,
  bScaler: 0,
  offset: 0
};

/** Experimental loaders.gl-compatible tile source for shared TerrainLayer payloads. */
export class TerrainSource implements TileSource {
  readonly props: TerrainSourceProps;

  constructor(props: TerrainSourceProps) {
    this.props = props;
  }

  /** Returns source zoom and extent metadata understood by `_SharedTileset2D`. */
  getMetadata(): Promise<TileSourceMetadata> {
    const {minZoom, maxZoom, extent} = this.props;
    const metadata: TileSourceMetadata = {};

    if (Number.isFinite(minZoom)) {
      metadata.minZoom = minZoom;
    }
    if (Number.isFinite(maxZoom)) {
      metadata.maxZoom = maxZoom;
    }
    if (extent) {
      metadata.boundingBox = [
        [extent[0], extent[1]],
        [extent[2], extent[3]]
      ];
    }

    return Promise.resolve(metadata);
  }

  /** Loads one terrain tile by x/y/z coordinates. */
  getTile({x, y, z}: {x: number; y: number; z: number}): Promise<TerrainTileData | null> {
    return this.getTileData({
      index: {x, y, z},
      id: `${x}-${y}-${z}`,
      bbox: {left: 0, top: 0, right: 0, bottom: 0},
      zoom: z
    });
  }

  /** Loads one projection-independent terrain tile payload for deck.gl tile layers. */
  async getTileData(tile: TileLoadProps): Promise<TerrainTileData | null> {
    const {elevationData, texture} = this.props;
    const dataUrl = getURLFromTemplate(elevationData, tile);
    const textureUrl = texture && getURLFromTemplate(texture, tile);

    const terrain = dataUrl ? this._loadTerrain(dataUrl, tile.signal) : Promise.resolve(null);
    const surface = textureUrl
      ? this._load(textureUrl, {
          propName: 'texture',
          loaders: [],
          loadOptions: withAbortSignal(this.props.loadOptions, tile.signal),
          signal: tile.signal
        }).catch(() => null)
      : Promise.resolve(null);

    const [mesh, surfaceTexture] = await Promise.all([terrain, surface]);
    return createTerrainTileData(mesh, surfaceTexture as TextureSource | null);
  }

  private _loadTerrain(url: string, signal?: AbortSignal): Promise<TerrainMesh | null> {
    const {
      elevationDecoder = DEFAULT_ELEVATION_DECODER,
      loaders,
      loadOptions,
      meshMaxError
    } = this.props;
    const effectiveMeshMaxError = getEffectiveMeshMaxError(
      meshMaxError ?? DEFAULT_TERRAIN_MESH_MAX_ERROR
    );
    const terrainLoadOptions = withAbortSignal(
      {
        ...loadOptions,
        terrain: {
          skirtHeight: effectiveMeshMaxError * 2,
          ...loadOptions?.terrain,
          bounds: NORMALIZED_TERRAIN_BOUNDS,
          meshMaxError: effectiveMeshMaxError,
          elevationDecoder
        }
      },
      signal
    );

    return this._load(url, {
      propName: 'elevationData',
      loaders: loaders || [TerrainWorkerLoader],
      loadOptions: terrainLoadOptions,
      signal
    }) as Promise<TerrainMesh | null>;
  }

  private _load(url: string, context: Parameters<TerrainSourceFetch>[1]): Promise<unknown> {
    const {fetch} = this.props;
    if (fetch) {
      return Promise.resolve(fetch(url, context));
    }
    return context.loaders
      ? load(url, context.loaders, context.loadOptions)
      : load(url, context.loadOptions);
  }
}

/** Creates mutable shared tile data with a live byte length getter. */
export function createTerrainTileData(
  mesh: TerrainMesh | null,
  texture: TextureSource | null
): TerrainTileData {
  const tileData = {
    mesh,
    texture,
    renderMeshes: new Map<string, TerrainMesh | null>(),
    get byteLength() {
      return getTerrainTileByteLength(tileData);
    }
  } satisfies TerrainTileData;

  return tileData;
}

/** Returns whether a tile payload uses the shared terrain payload shape. */
export function isTerrainTileData(data: unknown): data is TerrainTileData {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'mesh' in data &&
      'texture' in data &&
      'renderMeshes' in data &&
      (data as TerrainTileData).renderMeshes instanceof Map
  );
}

/** Returns a cached render mesh or materializes one for the requested bounds. */
export function getTerrainRenderMesh(
  tileData: TerrainTileData,
  projectionKey: string,
  bounds: Bounds
): TerrainRenderMeshResult {
  if (tileData.renderMeshes.has(projectionKey)) {
    return {mesh: tileData.renderMeshes.get(projectionKey) || null, isNew: false};
  }

  const mesh = materializeTerrainMesh(tileData.mesh, bounds);
  tileData.renderMeshes.set(projectionKey, mesh);
  return {mesh, isNew: true};
}

/** Clamps invalid terrain mesh tolerances to the loaders.gl supported range. */
export function getEffectiveMeshMaxError(meshMaxError: number): number {
  if (!Number.isFinite(meshMaxError) || meshMaxError <= 0) {
    return MIN_TERRAIN_MESH_MAX_ERROR;
  }
  return Math.max(meshMaxError, MIN_TERRAIN_MESH_MAX_ERROR);
}

function materializeTerrainMesh(mesh: TerrainMesh | null, bounds: Bounds): TerrainMesh | null {
  if (!mesh) {
    return null;
  }

  const positionAttributeName = mesh.attributes.POSITION ? 'POSITION' : 'positions';
  const positionAttribute = mesh.attributes[positionAttributeName];
  if (!positionAttribute) {
    return mesh;
  }

  const sourcePositions = positionAttribute.value as Float32Array;
  const positions = new Float32Array(sourcePositions.length);
  const [minX, minY, maxX, maxY] = bounds;
  const xScale = maxX - minX;
  const yScale = maxY - minY;

  for (let index = 0; index < sourcePositions.length; index += 3) {
    positions[index] = sourcePositions[index] * xScale + minX;
    positions[index + 1] = sourcePositions[index + 1] * yScale + minY;
    positions[index + 2] = sourcePositions[index + 2];
  }

  const attributes = {
    ...mesh.attributes,
    [positionAttributeName]: {...positionAttribute, value: positions}
  };

  return {
    ...mesh,
    attributes,
    header: {
      ...mesh.header,
      boundingBox: getTerrainMeshBoundingBox(attributes)
    }
  };
}

function getTerrainMeshBoundingBox(attributes: MeshAttributes): TerrainMeshBoundingBox {
  const positions = (attributes.POSITION || attributes.positions)?.value as Float32Array;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  return [
    [minX, minY, minZ],
    [maxX, maxY, maxZ]
  ];
}

function getTerrainTileByteLength(tileData: TerrainTileData): number {
  const seenBuffers = new Set<ArrayBufferLike>();
  let byteLength = getTerrainMeshByteLength(tileData.mesh, seenBuffers);
  for (const mesh of tileData.renderMeshes.values()) {
    byteLength += getTerrainMeshByteLength(mesh, seenBuffers);
  }
  byteLength += getTextureByteLength(tileData.texture, seenBuffers);
  return byteLength;
}

function getTerrainMeshByteLength(
  mesh: TerrainMesh | null,
  seenBuffers: Set<ArrayBufferLike>
): number {
  if (!mesh) {
    return 0;
  }

  let byteLength = 0;
  for (const attribute of Object.values(mesh.attributes)) {
    byteLength += getBufferViewByteLength(attribute?.value, seenBuffers);
  }
  byteLength += getBufferViewByteLength(mesh.indices?.value, seenBuffers);
  return byteLength;
}

function getTextureByteLength(
  texture: TextureSource | null,
  seenBuffers: Set<ArrayBufferLike>
): number {
  if (!texture || typeof texture !== 'object') {
    return 0;
  }
  if ('data' in texture) {
    return getBufferViewByteLength((texture as ImageData).data, seenBuffers);
  }
  if ('width' in texture && 'height' in texture) {
    const {width, height} = texture;
    return Number.isFinite(width) && Number.isFinite(height) ? width * height * 4 : 0;
  }
  return 0;
}

function getBufferViewByteLength(
  value: ArrayBufferView | undefined,
  seenBuffers: Set<ArrayBufferLike>
): number {
  if (!value || seenBuffers.has(value.buffer)) {
    return 0;
  }
  seenBuffers.add(value.buffer);
  return value.byteLength;
}

function withAbortSignal(loadOptions: any, signal?: AbortSignal): any {
  if (!signal) {
    return loadOptions;
  }
  return {
    ...loadOptions,
    core: {
      ...loadOptions?.core,
      fetch: {
        ...loadOptions?.core?.fetch,
        signal
      }
    }
  };
}

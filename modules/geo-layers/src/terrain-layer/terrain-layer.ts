// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  _CustomProjectionViewport as CustomProjectionViewport,
  GlobeViewport,
  Layer,
  LayersList,
  log,
  Material,
  TextureSource,
  UpdateParameters
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {lngLatToWorld, worldToLngLat} from '@math.gl/geospatial/web-mercator';
import type {MeshAttributes} from '@loaders.gl/core/schema';
import {TerrainWorkerLoader} from '@loaders.gl/raster/terrain';
import TileLayer, {TileLayerProps} from '../tile-layer/tile-layer';
import type {
  Bounds,
  GeoBoundingBox,
  TileBoundingBox,
  TileLoadProps,
  ZRange
} from '../tileset-2d/index';
import {getURLFromTemplate, Tile2DHeader, URLTemplate, urlType} from '../tileset-2d/index';

import {toByteColor} from '../utils/normalized-color';

const DUMMY_DATA = [1];
const TILE_OVERLAP_PIXELS = 1;
const MIN_TERRAIN_MESH_MAX_ERROR = 1;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

/** Byte RGB used for terrain with no texture or application color. */
const DEFAULT_TERRAIN_COLOR: Color = [255, 255, 255];

const defaultProps: DefaultProps<TerrainLayerProps> = {
  ...TileLayer.defaultProps,
  // Image url that encodes height data
  elevationData: urlType,
  // Image url to use as texture
  texture: {...urlType, optional: true},
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: {type: 'number', value: 4.0},
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: {type: 'array', value: null, optional: true, compare: true},
  // Color to use if texture is unavailable
  color: {type: 'color', value: DEFAULT_TERRAIN_COLOR},
  // Object to decode height data, from (r, g, b) to height in meters
  elevationDecoder: {
    type: 'object',
    value: {
      rScaler: 1,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    }
  },
  // Supply url to local terrain worker bundle. Only required if running offline and cannot access CDN.
  workerUrl: '',
  // Same as SimpleMeshLayer wireframe
  wireframe: false,
  material: true,

  loaders: [TerrainWorkerLoader]
};

// Turns array of templates into a single string to work around shallow change
function urlTemplateToUpdateTrigger(template: URLTemplate): string {
  if (Array.isArray(template)) {
    return template.join(';');
  }
  return template || '';
}

function getOverlappedBounds(bounds: Bounds, tileSize: number, clampLngLat: boolean): Bounds {
  const xPad = ((bounds[2] - bounds[0]) / tileSize) * TILE_OVERLAP_PIXELS;
  const yPad = ((bounds[3] - bounds[1]) / tileSize) * TILE_OVERLAP_PIXELS;
  const overlappedBounds: Bounds = [
    bounds[0] - xPad,
    bounds[1] - yPad,
    bounds[2] + xPad,
    bounds[3] + yPad
  ];

  if (!clampLngLat) {
    return overlappedBounds;
  }

  return [
    Math.max(overlappedBounds[0], -MAX_LONGITUDE),
    Math.max(overlappedBounds[1], -MAX_LATITUDE),
    Math.min(overlappedBounds[2], MAX_LONGITUDE),
    Math.min(overlappedBounds[3], MAX_LATITUDE)
  ];
}

/**
 * Returns the origin of a mesh in the CRS of a custom projection: the center of its WGS84 bounds,
 * in whole CRS units. The mesh positions are offsets from this origin. Its height is 0, so the
 * heights of the mesh stay absolute.
 */
function getMeshOrigin(
  viewport: CustomProjectionViewport,
  bounds: Bounds | null
): [number, number, number] {
  if (!bounds) {
    return [0, 0, 0];
  }
  const converter = viewport.crs.converter.WGS84;
  const [west, south, east, north] = bounds;
  const [x, y] = converter.from(converter.normalize([(west + east) / 2, (south + north) / 2, 0]));
  return [Math.round(x), Math.round(y), 0];
}

/**
 * Converts the positions of a mesh to the CRS of a custom projection. `toLngLat` converts the
 * horizontal mesh coordinates to WGS84. The sublayer draws the result with
 * `coordinateSystem: 'cartesian'`, because the view does not convert the vertices of a mesh.
 * The positions are offsets from `origin`: the GPU receives positions in float32, which cannot
 * keep the precision of large CRS coordinates.
 */
function convertMeshToCRS(
  mesh: MeshAttributes,
  viewport: CustomProjectionViewport,
  toLngLat: (xy: number[]) => number[],
  origin: number[]
): MeshAttributes {
  // The loader returns a mesh with a header and attributes, not the attributes alone
  const {header, attributes} = mesh as unknown as TerrainMesh;
  const converter = viewport.crs.converter.WGS84;
  const name = attributes.POSITION ? 'POSITION' : 'positions';
  const source = attributes[name].value;
  const positions = new Float32Array(source.length);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < source.length; i += 3) {
    const [lng, lat] = toLngLat([source[i], source[i + 1]]);
    const position = converter.from(converter.normalize([lng, lat, source[i + 2]]));
    for (let axis = 0; axis < 3; axis++) {
      const value = (position[axis] ?? 0) - origin[axis];
      positions[i + axis] = value;
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    }
  }
  const result: TerrainMesh = {
    ...mesh,
    header: {...header, boundingBox: [min, max]},
    attributes: {...attributes, [name]: {...attributes[name], value: positions}}
  };
  return result as unknown as MeshAttributes;
}

/** Returns the WGS84 bounds of a tile of a geospatial view */
function getTileBounds({bbox}: {bbox: TileBoundingBox}): Bounds {
  const {west, south, east, north} = bbox as GeoBoundingBox;
  return [west, south, east, north];
}

function getEffectiveMeshMaxError(meshMaxError: number): number {
  if (!Number.isFinite(meshMaxError) || meshMaxError <= 0) {
    return MIN_TERRAIN_MESH_MAX_ERROR;
  }
  return Math.max(meshMaxError, MIN_TERRAIN_MESH_MAX_ERROR);
}

type ElevationDecoder = {rScaler: number; gScaler: number; bScaler: number; offset: number};
type TerrainLoadProps = {
  bounds: Bounds;
  elevationData: string | null;
  elevationDecoder: ElevationDecoder;
  meshMaxError: number;
  signal?: AbortSignal;
};

type MeshAndTexture = [MeshAttributes | null, TextureSource | null];
type MeshBoundingBox = [min: number[], max: number[]];
type MeshWithBoundingBox = MeshAttributes & {
  header?: {
    boundingBox?: MeshBoundingBox;
  };
};
type TerrainMesh = {
  header?: {
    boundingBox?: MeshBoundingBox;
  };
  attributes: MeshAttributes;
};

/** All properties supported by TerrainLayer */
export type TerrainLayerProps = _TerrainLayerProps &
  TileLayerProps<MeshAndTexture> &
  CompositeLayerProps;

/** Props added by the TerrainLayer */
type _TerrainLayerProps = {
  /** Image url that encodes height data. **/
  elevationData: URLTemplate;

  /** Image url to use as texture. **/
  texture?: URLTemplate;

  /** Martini error tolerance in meters, smaller number -> more detailed mesh. **/
  meshMaxError?: number;

  /** Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates. **/
  bounds?: Bounds | null;

  /** Color to use if texture is unavailable. Plain arrays use 0–1 with Deck normalizedColors. */
  color?: Color;

  /** Object to decode height data, from (r, g, b) to height in meters. **/
  elevationDecoder?: ElevationDecoder;

  /** Whether to render the mesh in wireframe mode. **/
  wireframe?: boolean;

  /** Material props for lighting effect. **/
  material?: Material;

  /**
   * @deprecated Use `loadOptions.terrain.workerUrl` instead
   */
  workerUrl?: string;
};

/** Render mesh surfaces from height map images. */
export default class TerrainLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TerrainLayerProps & Required<TileLayerProps<MeshAndTexture>>>
> {
  static defaultProps = defaultProps;
  static layerName = 'TerrainLayer';

  state!: {
    isTiled?: boolean;
    terrain?: MeshAttributes;
    /** The CRS of the custom projection that the mesh is in */
    crs?: string | null;
    zRange?: ZRange | null;
  };

  updateState({props, oldProps}: UpdateParameters<this>): void {
    const elevationDataChanged = props.elevationData !== oldProps.elevationData;
    if (elevationDataChanged) {
      const {elevationData} = props;
      const isTiled =
        elevationData && (Array.isArray(elevationData) || isTileSetURL(elevationData));
      this.setState({isTiled});
    }

    // Reloading for single terrain mesh
    const shouldReload =
      elevationDataChanged ||
      props.meshMaxError !== oldProps.meshMaxError ||
      props.elevationDecoder !== oldProps.elevationDecoder ||
      props.bounds !== oldProps.bounds;

    // In a custom projection, the mesh is in the CRS of the view: see convertMeshToCRS
    const {viewport} = this.context;
    const crs = viewport instanceof CustomProjectionViewport ? viewport.projectionSignature : null;
    if (!this.state.isTiled && (shouldReload || crs !== (this.state.crs ?? null))) {
      // When state.isTiled, elevationData cannot be an array
      let terrain = this.loadTerrain(props as TerrainLoadProps);
      if (viewport instanceof CustomProjectionViewport && terrain) {
        // The mesh positions are WGS84 longitudes and latitudes
        const origin = getMeshOrigin(viewport, props.bounds);
        terrain = terrain.then(
          mesh => mesh && convertMeshToCRS(mesh, viewport, lngLat => lngLat, origin)
        );
      }
      this.setState({terrain, crs});
    }

    // TODO - remove in v9
    // @ts-ignore
    if (props.workerUrl) {
      log.removed('workerUrl', 'loadOptions.terrain.workerUrl')();
    }
  }

  loadTerrain({
    elevationData,
    bounds,
    elevationDecoder,
    meshMaxError,
    signal
  }: TerrainLoadProps): Promise<MeshAttributes> | null {
    if (!elevationData) {
      return null;
    }
    const effectiveMeshMaxError = getEffectiveMeshMaxError(meshMaxError);
    let loadOptions = this.getLoadOptions();
    loadOptions = {
      ...loadOptions,
      terrain: {
        skirtHeight: this.state.isTiled ? effectiveMeshMaxError * 2 : 0,
        ...loadOptions?.terrain,
        shape: 'mesh',
        bounds,
        meshMaxError: effectiveMeshMaxError,
        elevationDecoder
      }
    };
    const {fetch} = this.props;
    return fetch(elevationData, {propName: 'elevationData', layer: this, loadOptions, signal});
  }

  getTiledTerrainData(tile: TileLoadProps): Promise<MeshAndTexture> {
    const {elevationData, fetch, texture, elevationDecoder, meshMaxError} = this.props;
    const {viewport} = this.context;
    const dataUrl = getURLFromTemplate(elevationData, tile);
    const textureUrl = texture && getURLFromTemplate(texture, tile);

    const {signal} = tile;
    let bottomLeft = [0, 0] as [number, number];
    let topRight = [0, 0] as [number, number];
    const isCustomProjection = viewport instanceof CustomProjectionViewport;
    if (isCustomProjection) {
      // Build the mesh on the Web Mercator grid of the tile images, then convert its vertices
      const bbox = tile.bbox as GeoBoundingBox;
      bottomLeft = lngLatToWorld([bbox.west, bbox.south]) as [number, number];
      topRight = lngLatToWorld([bbox.east, bbox.north]) as [number, number];
    } else if (viewport.isGeospatial) {
      const bbox = tile.bbox as GeoBoundingBox;
      bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
      topRight = viewport.projectFlat([bbox.east, bbox.north]);
    } else {
      const bbox = tile.bbox as Exclude<TileBoundingBox, GeoBoundingBox>;
      bottomLeft = [bbox.left, bbox.bottom];
      topRight = [bbox.right, bbox.top];
    }
    const bounds: Bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
    const overlappedBounds = getOverlappedBounds(
      bounds,
      this.props.tileSize,
      viewport instanceof GlobeViewport
    );

    let terrain = this.loadTerrain({
      elevationData: dataUrl,
      bounds: overlappedBounds,
      elevationDecoder,
      meshMaxError,
      signal
    });
    if (isCustomProjection && terrain) {
      const origin = getMeshOrigin(viewport, getTileBounds(tile));
      terrain = terrain.then(
        mesh => mesh && convertMeshToCRS(mesh, viewport, worldToLngLat, origin)
      );
    }
    const surface = textureUrl
      ? // If surface image fails to load, the tile should still be displayed
        fetch(textureUrl, {propName: 'texture', layer: this, loaders: [], signal}).catch(_ => null)
      : Promise.resolve(null);

    return Promise.all([terrain, surface]);
  }

  renderSubLayers(
    props: TileLayerProps<MeshAndTexture> & {
      id: string;
      data: MeshAndTexture;
      tile: Tile2DHeader<MeshAndTexture>;
    }
  ) {
    const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);

    const {wireframe, material} = this.props;
    const {data} = props;

    if (!data) {
      return null;
    }

    const [mesh, texture] = data;

    const {viewport} = this.context;
    // Bounds are baked with projectFlat. In GlobeView projectFlat is identity,
    // so tiled terrain meshes are in lng/lat degrees instead of common-space
    // web-mercator units.
    // In a custom projection, the meshes are in the CRS of the view: see convertMeshToCRS
    const isGlobe = viewport instanceof GlobeViewport;
    const boundingBox = (mesh as MeshWithBoundingBox | null)?.header?.boundingBox;
    const hasLngLatBounds =
      boundingBox &&
      boundingBox.every(
        ([x, y]) =>
          x >= -MAX_LONGITUDE && x <= MAX_LONGITUDE && y >= -MAX_LATITUDE && y <= MAX_LATITUDE
      );
    const coordinateSystem = isGlobe && hasLngLatBounds ? 'lnglat' : 'cartesian';

    return new SubLayerClass(props, {
      data: DUMMY_DATA,
      mesh,
      texture,
      _instanced: false,
      coordinateSystem,
      ...(viewport instanceof CustomProjectionViewport && {
        coordinateOrigin: getMeshOrigin(viewport, getTileBounds(props.tile))
      }),
      getPosition: d => [0, 0, 0],
      getColor: this.getTerrainColor(),
      wireframe,
      material
    });
  }

  // Update zRange of viewport
  onViewportLoad(tiles?: Tile2DHeader<MeshAndTexture>[]): void {
    if (!tiles) {
      return;
    }

    const {zRange} = this.state;
    // TileLayer takes zRange in meters. The meshes of a custom projection are in its CRS, whose
    // height unit can differ: see convertMeshToCRS
    const {viewport} = this.context;
    const metersPerUnit =
      viewport instanceof CustomProjectionViewport ? (viewport.crs.zUnit.metersPerUnit ?? 1) : 1;
    const ranges = tiles
      .map(tile => tile.content)
      .filter(Boolean)
      .map(arr => {
        // @ts-ignore
        const bounds = arr[0].header.boundingBox;
        return bounds.map(bound => bound[2] * metersPerUnit);
      });
    if (ranges.length === 0) {
      return;
    }
    const minZ = Math.min(...ranges.map(x => x[0]));
    const maxZ = Math.max(...ranges.map(x => x[1]));

    if (!zRange || minZ < zRange[0] || maxZ > zRange[1]) {
      this.setState({zRange: [minZ, maxZ]});
    }
  }

  /** Prepare the fallback terrain color for the byte-encoded mesh accessor. */
  private getTerrainColor(): Color {
    const {color} = this.props;
    return this.usesNormalizedColors() && color !== DEFAULT_TERRAIN_COLOR
      ? toByteColor(color)
      : color;
  }

  renderLayers(): Layer | null | LayersList {
    const {
      material,
      elevationData,
      texture,
      wireframe,
      meshMaxError,
      elevationDecoder,
      tileSize,
      maxZoom,
      minZoom,
      extent,
      maxRequests,
      onTileLoad,
      onTileUnload,
      onTileError,
      maxCacheSize,
      maxCacheByteSize,
      refinementStrategy,
      zoomOffset
    } = this.props;

    if (this.state.isTiled) {
      return new TileLayer<MeshAndTexture>(
        this.getSubLayerProps({
          id: 'tiles'
        }),
        {
          getTileData: this.getTiledTerrainData.bind(this),
          renderSubLayers: this.renderSubLayers.bind(this),
          updateTriggers: {
            renderSubLayers: [this.props.color, this.usesNormalizedColors()],
            getTileData: {
              elevationData: urlTemplateToUpdateTrigger(elevationData),
              texture: urlTemplateToUpdateTrigger(texture),
              meshMaxError,
              elevationDecoder,
              projectionMode: this.context.viewport.projectionMode,
              // The meshes of a custom projection are in its CRS
              crs: this.context.viewport.crs
                ? this.context.viewport.projectionSignature
                : undefined,
              zoomOffset
            }
          },
          onViewportLoad: this.onViewportLoad.bind(this),
          zRange: this.state.zRange || null,
          tileSize,
          maxZoom,
          minZoom,
          extent,
          maxRequests,
          onTileLoad,
          onTileUnload,
          onTileError,
          maxCacheSize,
          maxCacheByteSize,
          refinementStrategy,
          zoomOffset
        }
      );
    }

    if (!elevationData) {
      return null;
    }

    const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);
    const {viewport} = this.context;
    return new SubLayerClass(
      this.getSubLayerProps({
        id: 'mesh'
      }),
      {
        data: DUMMY_DATA,
        mesh: this.state.terrain,
        texture,
        _instanced: false,
        // The mesh of a custom projection is in its CRS
        ...(viewport instanceof CustomProjectionViewport &&
          this.state.crs && {
            coordinateSystem: 'cartesian',
            coordinateOrigin: getMeshOrigin(viewport, this.props.bounds)
          }),
        getPosition: d => [0, 0, 0],
        getColor: this.getTerrainColor(),
        material,
        wireframe
      }
    );
  }
}

const isTileSetURL = (url: string): boolean =>
  url.includes('{x}') && (url.includes('{y}') || url.includes('{-y}'));

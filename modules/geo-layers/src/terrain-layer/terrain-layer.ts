// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  COORDINATE_SYSTEM,
  DefaultProps,
  _GlobeViewport as GlobeViewport,
  Layer,
  LayersList,
  log,
  Material,
  TextureSource,
  UpdateParameters
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import type {MeshAttributes} from '@loaders.gl/schema';
import {TerrainWorkerLoader} from '@loaders.gl/terrain';
import {
  MAX_LATITUDE as MAX_WEB_MERCATOR_LATITUDE,
  lngLatToWorld,
  worldToLngLat
} from '@math.gl/web-mercator';
import TileLayer, {TileLayerProps} from '../tile-layer/tile-layer';
import type {
  Bounds,
  GeoBoundingBox,
  TileBoundingBox,
  TileLoadProps,
  ZRange
} from '../tileset-2d/index';
import {getURLFromTemplate, Tile2DHeader, URLTemplate, urlType} from '../tileset-2d/index';

const DUMMY_DATA = [1];
const TILE_OVERLAP_PIXELS = 1;
const MIN_TERRAIN_MESH_MAX_ERROR = 1;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

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
  color: {type: 'color', value: [255, 255, 255]},
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
  shouldRemapTerrainMeshToWebMercatorTile?: boolean;
  signal?: AbortSignal;
};

type MeshAndTexture = [MeshAttributes | null, TextureSource | null];
type MeshBoundingBox = [min: number[], max: number[]];
type MeshWithBoundingBox = MeshAttributes & {
  header?: {
    boundingBox?: MeshBoundingBox;
  };
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

  /** Color to use if texture is unavailable. **/
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

    if (!this.state.isTiled && shouldReload) {
      // When state.isTiled, elevationData cannot be an array
      const terrain = this.loadTerrain(props as TerrainLoadProps);
      this.setState({terrain});
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
    shouldRemapTerrainMeshToWebMercatorTile,
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
        bounds,
        meshMaxError: effectiveMeshMaxError,
        elevationDecoder
      }
    };
    const {fetch} = this.props;
    const terrain = fetch(elevationData, {
      propName: 'elevationData',
      layer: this,
      loadOptions,
      signal
    });

    return shouldRemapTerrainMeshToWebMercatorTile
      ? terrain.then(mesh => (mesh ? remapTerrainMeshToWebMercatorTile(mesh, bounds) : mesh))
      : terrain;
  }

  getTiledTerrainData(tile: TileLoadProps): Promise<MeshAndTexture> {
    const {elevationData, fetch, texture, elevationDecoder, meshMaxError} = this.props;
    const {viewport} = this.context;
    const dataUrl = getURLFromTemplate(elevationData, tile);
    const textureUrl = texture && getURLFromTemplate(texture, tile);

    const {signal} = tile;
    let bottomLeft = [0, 0] as [number, number];
    let topRight = [0, 0] as [number, number];
    if (viewport.isGeospatial) {
      const bbox = tile.bbox as GeoBoundingBox;
      bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
      topRight = viewport.projectFlat([bbox.east, bbox.north]);
    } else {
      const bbox = tile.bbox as Exclude<TileBoundingBox, GeoBoundingBox>;
      bottomLeft = [bbox.left, bbox.bottom];
      topRight = [bbox.right, bbox.top];
    }
    const bounds: Bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
    const isGlobe = viewport instanceof GlobeViewport;
    const overlappedBounds = getOverlappedBounds(bounds, this.props.tileSize, isGlobe);

    const terrain =
      this.loadTerrain({
        elevationData: dataUrl,
        bounds: overlappedBounds,
        elevationDecoder,
        meshMaxError,
        // The terrain surface keeps its original texture and UVs; only mesh row positions are
        // remapped from WebMercator tile spacing to lng/lat for GlobeView.
        shouldRemapTerrainMeshToWebMercatorTile: isGlobe,
        signal
      }) ?? Promise.resolve(null);
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

    const {color, wireframe, material} = this.props;
    const {data} = props;

    if (!data) {
      return null;
    }

    const [mesh, texture] = data;

    const {viewport} = this.context;
    // Bounds are baked with projectFlat. In GlobeView projectFlat is identity,
    // so tiled terrain meshes are in lng/lat degrees instead of common-space
    // web-mercator units.
    const isGlobe = viewport instanceof GlobeViewport;
    const boundingBox = (mesh as MeshWithBoundingBox | null)?.header?.boundingBox;
    const hasLngLatBounds =
      boundingBox &&
      boundingBox.every(
        ([x, y]) =>
          x >= -MAX_LONGITUDE && x <= MAX_LONGITUDE && y >= -MAX_LATITUDE && y <= MAX_LATITUDE
      );
    const coordinateSystem =
      isGlobe && hasLngLatBounds ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;

    return new SubLayerClass(props, {
      data: DUMMY_DATA,
      mesh,
      texture,
      _instanced: false,
      coordinateSystem,
      getPosition: d => [0, 0, 0],
      getColor: color,
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
    const ranges = tiles
      .map(tile => tile.content)
      .filter(Boolean)
      .flatMap(arr => {
        // @ts-ignore - terrain loader returns {attributes, header} shape; header is not in MeshAttributes type
        const bounds = (arr[0] as MeshWithBoundingBox | null)?.header?.boundingBox;
        return bounds ? [bounds.map(bound => bound[2])] : [];
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

  renderLayers(): Layer | null | LayersList {
    const {
      color,
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
            getTileData: {
              elevationData: urlTemplateToUpdateTrigger(elevationData),
              texture: urlTemplateToUpdateTrigger(texture),
              meshMaxError,
              elevationDecoder,
              projectionMode: this.context.viewport.projectionMode,
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
    return new SubLayerClass(
      this.getSubLayerProps({
        id: 'mesh'
      }),
      {
        data: DUMMY_DATA,
        mesh: this.state.terrain,
        texture,
        _instanced: false,
        getPosition: d => [0, 0, 0],
        getColor: color,
        material,
        wireframe
      }
    );
  }
}

const isTileSetURL = (url: string): boolean =>
  url.includes('{x}') && (url.includes('{y}') || url.includes('{-y}'));

function remapTerrainMeshToWebMercatorTile(mesh: MeshAttributes, bounds: Bounds): MeshAttributes {
  // The terrain loader returns {attributes: MeshAttributes, header?: ...} at runtime.
  // MeshAttributes is typed as an index type so we use a cast to access the nested fields.
  const attrs = (mesh as any).attributes as MeshAttributes | undefined;
  const positionAttribute = attrs?.POSITION;
  const texCoordAttribute = attrs?.TEXCOORD_0;
  const positions = positionAttribute?.value;
  const texCoords = texCoordAttribute?.value;
  if (!positions || !texCoords) {
    return mesh;
  }

  const [, south, , north] = bounds;
  const northY = lngLatToMercatorWorldY(north);
  const southY = lngLatToMercatorWorldY(south);
  const remappedPositions = new Float32Array(positions);

  for (let i = 0; i < texCoords.length / 2; i++) {
    const v = texCoords[i * 2 + 1];
    const mercatorY = northY + (southY - northY) * v;
    remappedPositions[i * 3 + 1] = worldToLngLat([0, mercatorY])[1];
  }

  return {
    ...(mesh as any),
    attributes: {
      ...attrs,
      POSITION: {
        ...positionAttribute,
        value: remappedPositions
      }
    }
  } as MeshAttributes;
}

function lngLatToMercatorWorldY(latitude: number): number {
  const clampedLatitude = Math.max(
    -MAX_WEB_MERCATOR_LATITUDE,
    Math.min(MAX_WEB_MERCATOR_LATITUDE, latitude)
  );
  return lngLatToWorld([0, clampedLatitude])[1];
}

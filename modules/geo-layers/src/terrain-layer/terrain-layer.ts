// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  Layer,
  LayerProps,
  LayersList,
  log,
  Material,
  TextureSource,
  UpdateParameters,
  type Viewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import type {MeshAttributes} from '@loaders.gl/schema';
import {TerrainWorkerLoader} from '@loaders.gl/terrain';
import TileLayer, {TileLayerProps} from '../tile-layer/tile-layer';
import type {
  Bounds,
  GeoBoundingBox,
  TileBoundingBox,
  TileLoadProps,
  ZRange
} from '../tileset-2d/index';
import {Tile2DHeader, urlType, getURLFromTemplate, URLTemplate} from '../tileset-2d/index';
import SharedTile2DLayer from '../shared-tile-2d-layer/shared-tile-2d-layer';
import {SharedTile2DHeader, type SharedTileset2D} from '../shared-tileset-2d/index';
import {
  getEffectiveMeshMaxError,
  getTerrainRenderMesh,
  isTerrainTileData,
  type ElevationDecoder,
  type TerrainMesh,
  type TerrainTileData
} from './terrain-source';

const DUMMY_DATA = [1];
const TILE_OVERLAP_PIXELS = 1;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

const defaultProps: DefaultProps<TerrainLayerProps> = {
  ...TileLayer.defaultProps,
  // Image url that encodes height data
  elevationData: {...urlType, optional: true},
  // Caller-owned shared terrain payload cache for tiled mode.
  _terrainTileset: {type: 'object', value: null, optional: true},
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

type TerrainLoadProps = {
  bounds: Bounds;
  elevationData: string | null;
  elevationDecoder: ElevationDecoder;
  meshMaxError: number;
  signal?: AbortSignal;
};

type TerrainMeshData = TerrainMesh | MeshAttributes;
type MeshAndTexture = [TerrainMeshData | null, TextureSource | null];
type TerrainTileHeader = Tile2DHeader<MeshAndTexture> | SharedTile2DHeader<TerrainTileData>;
type TerrainSubLayerProps = LayerProps & {
  id: string;
  data: MeshAndTexture | TerrainTileData;
  tile: TerrainTileHeader;
};
type MeshBoundingBox = [min: number[], max: number[]];
type MeshWithBoundingBox = TerrainMeshData & {
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
  elevationData?: URLTemplate;

  /** Experimental caller-owned shared terrain tileset used by tiled mode. */
  _terrainTileset?: SharedTileset2D<TerrainTileData, Viewport> | null;

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
    const terrainTilesetChanged = props._terrainTileset !== oldProps._terrainTileset;
    if (elevationDataChanged || terrainTilesetChanged) {
      const {elevationData} = props;
      const isTiled = isTiledTerrainData(elevationData, props._terrainTileset);
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
    signal
  }: TerrainLoadProps): Promise<TerrainMeshData> | null {
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
    return fetch(elevationData, {propName: 'elevationData', layer: this, loadOptions, signal});
  }

  getTiledTerrainData(tile: TileLoadProps): Promise<MeshAndTexture> {
    const {elevationData, fetch, texture, elevationDecoder, meshMaxError} = this.props;
    const dataUrl = getURLFromTemplate(elevationData, tile);
    const textureUrl = texture && getURLFromTemplate(texture, tile);

    const {signal} = tile;
    const overlappedBounds = this.getTiledTerrainBounds(tile, this.props.tileSize);

    const terrain = this.loadTerrain({
      elevationData: dataUrl,
      bounds: overlappedBounds,
      elevationDecoder,
      meshMaxError,
      signal
    });
    const surface = textureUrl
      ? // If surface image fails to load, the tile should still be displayed
        fetch(textureUrl, {propName: 'texture', layer: this, loaders: [], signal}).catch(_ => null)
      : Promise.resolve(null);

    return Promise.all([terrain, surface]);
  }

  renderSubLayers(props: TerrainSubLayerProps) {
    const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);

    const {color, wireframe, material} = this.props;
    const {data} = props;

    if (!data) {
      return null;
    }

    const [mesh, texture] = isTerrainTileData(data)
      ? this.getSharedTerrainTileData(data, props.tile)
      : data;

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
  onViewportLoad(tiles?: TerrainTileHeader[]): void {
    if (!tiles) {
      return;
    }

    const {zRange} = this.state;
    const ranges = tiles
      .map(tile => getTerrainContentMesh(tile.content))
      .filter(Boolean)
      .map(mesh => {
        const bounds = (mesh as MeshWithBoundingBox).header?.boundingBox;
        if (!bounds) {
          return null;
        }
        return bounds.map(bound => bound[2]);
      })
      .filter(Boolean) as number[][];
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
      _terrainTileset
    } = this.props;

    if (this.state.isTiled) {
      if (_terrainTileset) {
        return new SharedTile2DLayer<TerrainTileData>(
          this.getSubLayerProps({
            id: 'tiles'
          }),
          {
            data: _terrainTileset,
            renderSubLayers: this.renderSubLayers.bind(this) as any,
            updateTriggers: {
              renderSubLayers: {
                color,
                wireframe,
                material,
                projectionMode: this.context.viewport.projectionMode
              }
            },
            onViewportLoad: this.onViewportLoad.bind(this) as any,
            zRange: this.state.zRange || null,
            onTileLoad: onTileLoad as any,
            onTileUnload: onTileUnload as any,
            onTileError: onTileError as any
          }
        );
      }

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
              projectionMode: this.context.viewport.projectionMode
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
          refinementStrategy
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

  private getSharedTerrainTileData(data: TerrainTileData, tile: TerrainTileHeader): MeshAndTexture {
    const {mesh, isNew} = getTerrainRenderMesh(
      data,
      getTerrainProjectionKey(this.context.viewport),
      this.getTiledTerrainBounds(tile, this.props._terrainTileset?.tileSize ?? this.props.tileSize)
    );

    if (isNew && this.props._terrainTileset && tile instanceof SharedTile2DHeader) {
      this.props._terrainTileset.notifyTileContentChanged(tile);
    }

    return [mesh, data.texture];
  }

  private getTiledTerrainBounds(tile: TileLoadProps | TerrainTileHeader, tileSize: number): Bounds {
    const {viewport} = this.context;
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
    return getOverlappedBounds(bounds, tileSize, viewport instanceof GlobeViewport);
  }
}

const isTileSetURL = (url: string): boolean =>
  url.includes('{x}') && (url.includes('{y}') || url.includes('{-y}'));

function isTiledTerrainData(
  elevationData: URLTemplate,
  terrainTileset: SharedTileset2D<TerrainTileData, Viewport> | null
): boolean {
  return Boolean(
    terrainTileset ||
      (elevationData && (Array.isArray(elevationData) || isTileSetURL(elevationData)))
  );
}

function getTerrainContentMesh(
  content: MeshAndTexture | TerrainTileData | null
): TerrainMeshData | null {
  if (!content) {
    return null;
  }
  return isTerrainTileData(content) ? content.mesh : content[0];
}

function getTerrainProjectionKey(viewport: Viewport): string {
  if (viewport instanceof GlobeViewport) {
    return 'globe';
  }
  return viewport.isGeospatial ? 'web-mercator' : 'cartesian';
}

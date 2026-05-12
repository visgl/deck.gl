// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  Layer,
  LayersList,
  log,
  Material,
  TextureSource,
  UpdateParameters
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import type {Mesh} from '@loaders.gl/schema';
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

const DUMMY_DATA = [1];
const TILE_OVERLAP_PIXELS = 1;
const MIN_TERRAIN_MESH_MAX_ERROR = 1;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const MAX_STITCHED_TEXTURE_TILE_SCALE = 4;

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
  meshMaxZoom: null,
  textureMaxZoom: null,

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
  signal?: AbortSignal;
};

type MeshAndTexture = [Mesh | null, TextureSource | null];
type DrawableTextureSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
type MeshBoundingBox = [min: number[], max: number[]];
type MeshWithBoundingBox = Mesh & {
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

  /**
   * Maximum zoom level of the elevation data used to create the terrain mesh.
   * If unset, `maxZoom` is used.
   */
  meshMaxZoom?: number | null;

  /**
   * Maximum zoom level of the imagery used as the terrain texture.
   * If unset, `maxZoom` is used.
   */
  textureMaxZoom?: number | null;

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
    terrain?: Mesh;
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
    signal
  }: TerrainLoadProps): Promise<Mesh> | null {
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
    const {elevationData, texture, elevationDecoder, meshMaxError} = this.props;
    const {viewport} = this.context;
    const dataUrl = getURLFromTemplate(elevationData, tile);

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
    const overlappedBounds = getOverlappedBounds(
      bounds,
      this.props.tileSize,
      Boolean(viewport.resolution && viewport.resolution > 0)
    );

    const terrain =
      this.loadTerrain({
        elevationData: dataUrl,
        bounds: overlappedBounds,
        elevationDecoder,
        meshMaxError,
        signal
      })?.then(mesh =>
        viewport.resolution && mesh ? remapMeshToWebMercatorTile(mesh, overlappedBounds) : mesh
      ) ?? Promise.resolve(null);
    const surface = this.loadTexture({tile, texture, signal});

    return Promise.all([terrain, surface]);
  }

  async loadTexture({
    tile,
    texture,
    signal
  }: {
    tile: TileLoadProps;
    texture?: URLTemplate;
    signal?: AbortSignal;
  }): Promise<TextureSource | null> {
    if (!texture) {
      return null;
    }

    const textureZoom = this.getTextureZoom(tile.index.z);
    if (textureZoom <= tile.index.z) {
      return this.fetchTextureTile(texture, tile, signal);
    }

    const childZoomLevels = textureZoom - tile.index.z;
    const scale = 2 ** childZoomLevels;
    const textureTiles: Promise<TextureSource | null>[] = [];

    for (let y = 0; y < scale; y++) {
      for (let x = 0; x < scale; x++) {
        const textureTile = {
          ...tile,
          index: {
            x: tile.index.x * scale + x,
            y: tile.index.y * scale + y,
            z: textureZoom
          },
          id: `${tile.index.x * scale + x}-${tile.index.y * scale + y}-${textureZoom}`,
          zoom: textureZoom
        };
        textureTiles.push(this.fetchTextureTile(texture, textureTile, signal));
      }
    }

    const textures = await Promise.all(textureTiles);
    return stitchTextureTiles(textures, scale);
  }

  private getTextureZoom(meshZoom: number): number {
    const {textureMaxZoom, maxZoom} = this.props;
    const textureZoom = textureMaxZoom ?? maxZoom;
    if (!Number.isFinite(textureZoom)) {
      return meshZoom;
    }

    const viewportZoom = Math.floor(this.context.viewport.zoom);
    const highestStitchableZoom = meshZoom + Math.log2(MAX_STITCHED_TEXTURE_TILE_SCALE);
    return Math.max(meshZoom, Math.min(textureZoom as number, viewportZoom, highestStitchableZoom));
  }

  private fetchTextureTile(
    texture: URLTemplate,
    tile: TileLoadProps,
    signal?: AbortSignal
  ): Promise<TextureSource | null> {
    const textureUrl = getURLFromTemplate(texture, tile);
    if (!textureUrl) {
      return Promise.resolve(null);
    }
    // If surface image fails to load, the terrain tile should still be displayed.
    return this.props
      .fetch(textureUrl, {propName: 'texture', layer: this, loaders: [], signal})
      .catch(_ => null);
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
    const isGlobe = Boolean(viewport.resolution && viewport.resolution > 0);
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
      .flatMap(arr => {
        const bounds = arr?.[0]?.header?.boundingBox;
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
      meshMaxZoom,
      extent,
      maxRequests,
      onTileLoad,
      onTileUnload,
      onTileError,
      maxCacheSize,
      maxCacheByteSize,
      refinementStrategy
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
              textureMaxZoom: this.props.textureMaxZoom,
              maxZoom: this.props.maxZoom,
              meshMaxError,
              elevationDecoder,
              projectionMode: this.context.viewport.projectionMode
            }
          },
          onViewportLoad: this.onViewportLoad.bind(this),
          zRange: this.state.zRange || null,
          tileSize,
          maxZoom: meshMaxZoom ?? maxZoom,
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
}

const isTileSetURL = (url: string): boolean =>
  url.includes('{x}') && (url.includes('{y}') || url.includes('{-y}'));

function stitchTextureTiles(
  textures: (TextureSource | null)[],
  scale: number
): TextureSource | null {
  const firstTexture = textures.find(isDrawableTextureSource);
  if (!firstTexture || typeof document === 'undefined') {
    return firstTexture || null;
  }

  const width = getTextureWidth(firstTexture);
  const height = getTextureHeight(firstTexture);
  if (!width || !height) {
    return firstTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) {
    return firstTexture;
  }

  for (let i = 0; i < textures.length; i++) {
    const texture = textures[i];
    if (isDrawableTextureSource(texture)) {
      const x = i % scale;
      const y = Math.floor(i / scale);
      context.drawImage(texture, x * width, y * height, width, height);
    }
  }
  return canvas;
}

function isDrawableTextureSource(texture: TextureSource | null): texture is DrawableTextureSource {
  if (!texture || typeof texture !== 'object') {
    return false;
  }
  if (typeof HTMLImageElement !== 'undefined' && texture instanceof HTMLImageElement) {
    return true;
  }
  if (typeof HTMLCanvasElement !== 'undefined' && texture instanceof HTMLCanvasElement) {
    return true;
  }
  if (typeof HTMLVideoElement !== 'undefined' && texture instanceof HTMLVideoElement) {
    return true;
  }
  if (typeof ImageBitmap !== 'undefined' && texture instanceof ImageBitmap) {
    return true;
  }
  return false;
}

function getTextureWidth(texture: DrawableTextureSource): number {
  return (texture as HTMLImageElement).naturalWidth || texture.width || 0;
}

function getTextureHeight(texture: DrawableTextureSource): number {
  return (texture as HTMLImageElement).naturalHeight || texture.height || 0;
}

function remapMeshToWebMercatorTile(mesh: Mesh, bounds: Bounds): Mesh {
  const positionAttribute = mesh.attributes.POSITION;
  const texCoordAttribute = mesh.attributes.TEXCOORD_0;
  const positions = positionAttribute?.value;
  const texCoords = texCoordAttribute?.value;
  if (!positions || !texCoords) {
    return mesh;
  }

  const [, south, , north] = bounds;
  const northY = lngLatToMercatorY(north);
  const southY = lngLatToMercatorY(south);
  const remappedPositions = new Float32Array(positions);

  for (let i = 0; i < texCoords.length / 2; i++) {
    const v = texCoords[i * 2 + 1];
    const mercatorY = northY + (southY - northY) * v;
    remappedPositions[i * 3 + 1] = mercatorYToLat(mercatorY);
  }

  return {
    ...mesh,
    attributes: {
      ...mesh.attributes,
      POSITION: {
        ...positionAttribute,
        value: remappedPositions
      }
    }
  };
}

function lngLatToMercatorY(latitude: number): number {
  const clampedLatitude = Math.max(-85.051129, Math.min(85.051129, latitude));
  const sin = Math.sin(clampedLatitude * DEGREES_TO_RADIANS);
  return 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
}

function mercatorYToLat(y: number): number {
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * RADIANS_TO_DEGREES;
}

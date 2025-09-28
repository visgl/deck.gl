// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Geometry} from '@luma.gl/engine';

import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  COORDINATE_SYSTEM,
  FilterContext,
  GetPickingInfoParams,
  Layer,
  LayersList,
  log,
  PickingInfo,
  UpdateParameters,
  Viewport,
  DefaultProps
} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {default as MeshLayer} from '../mesh-layer/mesh-layer';

import {load} from '@loaders.gl/core';
import {MeshAttributes} from '@loaders.gl/schema';
import {Tileset3D, Tile3D, TILE_TYPE} from '@loaders.gl/tiles';
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';

const SINGLE_DATA = [0];

const defaultProps: DefaultProps<Tile3DLayerProps> = {
  getPointColor: {type: 'accessor', value: [0, 0, 0, 255]},
  pointSize: 1.0,

  // Disable async data loading (handling it in _loadTileSet)
  data: '',
  loader: Tiles3DLoader,

  onTilesetLoad: {type: 'function', value: tileset3d => {}},
  onTileLoad: {type: 'function', value: tileHeader => {}},
  onTileUnload: {type: 'function', value: tileHeader => {}},
  onTileError: {type: 'function', value: (tile, message, url) => {}},
  _getMeshColor: {type: 'function', value: tileHeader => [255, 255, 255]}
};

/** All properties supported by Tile3DLayer */
export type Tile3DLayerProps<DataT = unknown> = _Tile3DLayerProps<DataT> & CompositeLayerProps;

/** Props added by the Tile3DLayer */
type _Tile3DLayerProps<DataT> = {
  data: string;
  /** Color Accessor for point clouds. **/
  getPointColor?: Accessor<DataT, Color>;

  /** Global radius of all points in pixels. **/
  pointSize?: number;

  /** A loader which is used to decode the fetched tiles.
   * @deprecated Use `loaders` instead
   */
  loader?: typeof Tiles3DLoader;

  /** Called when Tileset JSON file is loaded. **/
  onTilesetLoad?: (tile: Tileset3D) => void;

  /** Called when a tile in the tileset hierarchy is loaded. **/
  onTileLoad?: (tile: Tile3D) => void;

  /** Called when a tile is unloaded. **/
  onTileUnload?: (tile: Tile3D) => void;

  /** Called when a tile fails to load. **/
  onTileError?: (tile: Tile3D, url: string, message: string) => void;

  /** (Experimental) Accessor to change color of mesh based on properties. **/
  _getMeshColor?: (tile: Tile3D) => Color;
};

/** Render 3d tiles data formatted according to the [3D Tiles Specification](https://www.opengeospatial.org/standards/3DTiles) and [`ESRI I3S`](https://github.com/Esri/i3s-spec) */
export default class Tile3DLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_Tile3DLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'Tile3DLayer';

  state!: {
    activeViewports: {};
    frameNumber?: number;
    lastUpdatedViewports: {[viewportId: string]: Viewport} | null;
    layerMap: {[layerId: string]: any};
    tileset3d: Tileset3D | null;
  };

  initializeState() {
    if ('onTileLoadFail' in this.props) {
      log.removed('onTileLoadFail', 'onTileError')();
    }
    // prop verification
    this.state = {
      layerMap: {},
      tileset3d: null,
      activeViewports: {},
      lastUpdatedViewports: null
    };
  }

  get isLoaded(): boolean {
    return Boolean(this.state?.tileset3d?.isLoaded() && super.isLoaded);
  }

  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (props.data && props.data !== oldProps.data) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._loadTileset(props.data);
    }

    if (changeFlags.viewportChanged) {
      const {activeViewports} = this.state;
      const viewportsNumber = Object.keys(activeViewports).length;
      if (viewportsNumber) {
        this._updateTileset(activeViewports);
        this.state.lastUpdatedViewports = activeViewports;
        this.state.activeViewports = {};
      }
    }
    if (changeFlags.propsChanged) {
      const {layerMap} = this.state;
      for (const key in layerMap) {
        layerMap[key].needsUpdate = true;
      }
    }
  }

  activateViewport(viewport: Viewport): void {
    const {activeViewports, lastUpdatedViewports} = this.state;
    this.internalState!.viewport = viewport;

    activeViewports[viewport.id] = viewport;
    const lastViewport = lastUpdatedViewports?.[viewport.id];
    if (!lastViewport || !viewport.equals(lastViewport)) {
      this.setChangeFlags({viewportChanged: true});
      this.setNeedsUpdate();
    }
  }

  getPickingInfo({info, sourceLayer}: GetPickingInfoParams) {
    const sourceTile = sourceLayer && (sourceLayer.props as any).tile;
    if (info.picked) {
      info.object = sourceTile;
    }
    (info as any).sourceTile = sourceTile;

    return info;
  }

  filterSubLayer({layer, viewport}: FilterContext): boolean {
    // All sublayers will have a tile prop
    const {tile} = layer.props as unknown as {tile: Tile3D};
    const {id: viewportId} = viewport;
    return tile.selected && tile.viewportIds.includes(viewportId);
  }

  protected _updateAutoHighlight(info: PickingInfo): void {
    const sourceTile = (info as any).sourceTile;
    const layerCache = this.state.layerMap[sourceTile?.id];
    if (layerCache && layerCache.layer) {
      layerCache.layer.updateAutoHighlight(info);
    }
  }

  private async _loadTileset(tilesetUrl) {
    const {loadOptions = {}} = this.props;

    // TODO: deprecate `loader` in v9.0
    // @ts-ignore
    const loaders = this.props.loader || this.props.loaders;
    const loader = Array.isArray(loaders) ? loaders[0] : loaders;

    const options = {loadOptions: {...loadOptions}};
    let actualTilesetUrl = tilesetUrl;
    if (loader.preload) {
      const preloadOptions = await loader.preload(tilesetUrl, loadOptions);
      if (preloadOptions.url) {
        actualTilesetUrl = preloadOptions.url;
      }

      if (preloadOptions.headers) {
        options.loadOptions.fetch = {
          ...options.loadOptions.fetch,
          headers: preloadOptions.headers
        };
      }
      Object.assign(options, preloadOptions);
    }
    const tilesetJson = await load(actualTilesetUrl, loader, options.loadOptions);

    const tileset3d = new Tileset3D(tilesetJson, {
      onTileLoad: this._onTileLoad.bind(this),
      onTileUnload: this._onTileUnload.bind(this),
      onTileError: this.props.onTileError,
      ...options
    });

    this.setState({
      tileset3d,
      layerMap: {}
    });

    this._updateTileset(this.state.activeViewports);
    this.props.onTilesetLoad(tileset3d);
  }

  private _onTileLoad(tileHeader: Tile3D): void {
    const {lastUpdatedViewports} = this.state;
    this.props.onTileLoad(tileHeader);
    this._updateTileset(lastUpdatedViewports);
    this.setNeedsUpdate();
  }

  private _onTileUnload(tileHeader: Tile3D): void {
    // Was cleaned up from tileset cache. We no longer need to track it.
    delete this.state.layerMap[tileHeader.id];
    this.props.onTileUnload(tileHeader);
  }

  private _updateTileset(viewports: {[viewportId: string]: Viewport} | null): void {
    if (!viewports) {
      return;
    }
    const {tileset3d} = this.state;
    const {timeline} = this.context;
    const viewportsNumber = Object.keys(viewports).length;
    if (!timeline || !viewportsNumber || !tileset3d) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tileset3d.selectTiles(Object.values(viewports)).then(frameNumber => {
      const tilesetChanged = this.state.frameNumber !== frameNumber;
      if (tilesetChanged) {
        this.setState({frameNumber});
      }
    });
  }

  private _getSubLayer(
    tileHeader: Tile3D,
    oldLayer?: Layer
  ): MeshLayer<DataT> | PointCloudLayer<DataT> | ScenegraphLayer<DataT> | null {
    if (!tileHeader.content) {
      return null;
    }

    switch (tileHeader.type as TILE_TYPE) {
      case TILE_TYPE.POINTCLOUD:
        return this._makePointCloudLayer(tileHeader, oldLayer as PointCloudLayer<DataT>);
      case TILE_TYPE.SCENEGRAPH:
        return this._make3DModelLayer(tileHeader);
      case TILE_TYPE.MESH:
        return this._makeSimpleMeshLayer(tileHeader, oldLayer as MeshLayer<DataT>);
      default:
        throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
    }
  }

  private _makePointCloudLayer(
    tileHeader: Tile3D,
    oldLayer?: PointCloudLayer<DataT>
  ): PointCloudLayer<DataT> | null {
    const {attributes, pointCount, constantRGBA, cartographicOrigin, modelMatrix} =
      tileHeader.content;
    const {positions, normals, colors} = attributes;

    if (!positions) {
      return null;
    }
    const data = (oldLayer && oldLayer.props.data) || {
      header: {
        vertexCount: pointCount
      },
      attributes: {
        POSITION: positions,
        NORMAL: normals,
        COLOR_0: colors
      }
    };

    const {pointSize, getPointColor} = this.props;
    const SubLayerClass = this.getSubLayerClass('pointcloud', PointCloudLayer);
    return new SubLayerClass(
      {
        pointSize
      },
      this.getSubLayerProps({
        id: 'pointcloud'
      }),
      {
        id: `${this.id}-pointcloud-${tileHeader.id}`,
        tile: tileHeader,
        data,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: cartographicOrigin,
        modelMatrix,
        getColor: constantRGBA || getPointColor,
        _offset: 0
      }
    );
  }

  private _make3DModelLayer(tileHeader: Tile3D): ScenegraphLayer<DataT> {
    const {gltf, instances, cartographicOrigin, modelMatrix} = tileHeader.content;

    const SubLayerClass = this.getSubLayerClass('scenegraph', ScenegraphLayer);

    return new SubLayerClass(
      {
        _lighting: 'pbr'
      },
      this.getSubLayerProps({
        id: 'scenegraph'
      }),
      {
        id: `${this.id}-scenegraph-${tileHeader.id}`,
        tile: tileHeader,
        data: instances || SINGLE_DATA,
        scenegraph: gltf,

        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: cartographicOrigin,
        modelMatrix,
        getTransformMatrix: instance => instance.modelMatrix,
        getPosition: [0, 0, 0],
        _offset: 0
      }
    );
  }

  private _makeSimpleMeshLayer(tileHeader: Tile3D, oldLayer?: MeshLayer<DataT>): MeshLayer<DataT> {
    const content = tileHeader.content;
    const {
      attributes,
      indices,
      modelMatrix,
      cartographicOrigin,
      coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS,
      material,
      featureIds
    } = content;
    const {_getMeshColor} = this.props;

    const geometry =
      (oldLayer && oldLayer.props.mesh) ||
      new Geometry({
        topology: 'triangle-list',
        attributes: getMeshGeometry(attributes),
        indices
      });

    const SubLayerClass = this.getSubLayerClass('mesh', MeshLayer);

    return new SubLayerClass(
      this.getSubLayerProps({
        id: 'mesh'
      }),
      {
        id: `${this.id}-mesh-${tileHeader.id}`,
        tile: tileHeader,
        mesh: geometry,
        data: SINGLE_DATA,
        getColor: _getMeshColor(tileHeader),
        pbrMaterial: material,
        modelMatrix,
        coordinateOrigin: cartographicOrigin,
        coordinateSystem,
        featureIds,
        _offset: 0
      }
    );
  }

  renderLayers(): Layer | null | LayersList {
    const {tileset3d, layerMap} = this.state;
    if (!tileset3d) {
      return null;
    }

    // loaders.gl doesn't provide a type for tileset3d.tiles
    return (tileset3d.tiles as Tile3D[])
      .map(tile => {
        const layerCache = (layerMap[tile.id] = layerMap[tile.id] || {tile});
        let {layer} = layerCache;
        if (tile.selected) {
          // render selected tiles
          if (!layer) {
            // create layer
            layer = this._getSubLayer(tile);
          } else if (layerCache.needsUpdate) {
            // props have changed, rerender layer
            layer = this._getSubLayer(tile, layer);
            layerCache.needsUpdate = false;
          }
        }
        layerCache.layer = layer;
        return layer;
      })
      .filter(Boolean);
  }
}

function getMeshGeometry(contentAttributes: MeshAttributes): MeshAttributes {
  const attributes: MeshAttributes = {};
  attributes.positions = {
    ...contentAttributes.positions,
    value: new Float32Array(contentAttributes.positions.value)
  };
  if (contentAttributes.normals) {
    attributes.normals = contentAttributes.normals;
  }
  if (contentAttributes.texCoords) {
    attributes.texCoords = contentAttributes.texCoords;
  }
  if (contentAttributes.colors) {
    attributes.colors = contentAttributes.colors;
  }
  if (contentAttributes.uvRegions) {
    attributes.uvRegions = contentAttributes.uvRegions;
  }
  return attributes;
}

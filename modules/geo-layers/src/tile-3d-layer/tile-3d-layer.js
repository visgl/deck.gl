import GL from '@luma.gl/constants';
import {Geometry} from '@luma.gl/core';
import {COORDINATE_SYSTEM, CompositeLayer} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {default as _MeshLayer} from '../mesh-layer/mesh-layer';
import {log} from '@deck.gl/core';

import {load} from '@loaders.gl/core';
import {Tileset3D, TILE_TYPE} from '@loaders.gl/tiles';
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';

const SINGLE_DATA = [0];

const defaultProps = {
  getPointColor: {type: 'accessor', value: [0, 0, 0, 255]},
  pointSize: 1.0,

  data: null,
  loader: Tiles3DLoader,

  onTilesetLoad: {type: 'function', value: tileset3d => {}, compare: false},
  onTileLoad: {type: 'function', value: tileHeader => {}, compare: false},
  onTileUnload: {type: 'function', value: tileHeader => {}, compare: false},
  onTileError: {type: 'function', value: (tile, message, url) => {}, compare: false},
  _getMeshColor: {type: 'function', value: tileHeader => [255, 255, 255], compare: false}
};

export default class Tile3DLayer extends CompositeLayer {
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

  get isLoaded() {
    const {tileset3d} = this.state;
    return tileset3d && tileset3d.isLoaded();
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    if (props.data && props.data !== oldProps.data) {
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

  activateViewport(viewport) {
    const {activeViewports, lastUpdatedViewports} = this.state;
    this.internalState.viewport = viewport;

    activeViewports[viewport.id] = viewport;
    const lastViewport = lastUpdatedViewports?.[viewport.id];
    if (!lastViewport || !viewport.equals(lastViewport)) {
      this.setChangeFlags({viewportChanged: true});
      this.setNeedsUpdate();
    }
  }

  getPickingInfo({info, sourceLayer}) {
    const {layerMap} = this.state;
    const layerId = sourceLayer && sourceLayer.id;
    if (layerId) {
      // layerId: this.id-[scenegraph|pointcloud]-tileId
      const substr = layerId.substring(this.id.length + 1);
      const tileId = substr.substring(substr.indexOf('-') + 1);
      info.object = layerMap[tileId] && layerMap[tileId].tile;
    }

    return info;
  }

  filterSubLayer({layer, viewport}) {
    const {tile} = layer.props;
    const {id: viewportId} = viewport;
    return tile.viewportIds.includes(viewportId);
  }

  _updateAutoHighlight(info) {
    if (info.sourceLayer) {
      info.sourceLayer.updateAutoHighlight(info);
    }
  }

  async _loadTileset(tilesetUrl) {
    const {loadOptions = {}} = this.props;

    // TODO: deprecate `loader` in v9.0
    let loader = this.props.loader || this.props.loaders;
    if (Array.isArray(loader)) {
      loader = loader[0];
    }

    const options = {loadOptions: {...loadOptions}};
    if (loader.preload) {
      const preloadOptions = await loader.preload(tilesetUrl, loadOptions);

      if (preloadOptions.headers) {
        options.loadOptions.fetch = {
          ...options.loadOptions.fetch,
          headers: preloadOptions.headers
        };
      }
      Object.assign(options, preloadOptions);
    }
    const tilesetJson = await load(tilesetUrl, loader, options.loadOptions);

    const tileset3d = new Tileset3D(tilesetJson, {
      onTileLoad: this._onTileLoad.bind(this),
      onTileUnload: this._onTileUnload.bind(this),
      onTileLoadFail: this.props.onTileError,
      ...options
    });

    this.setState({
      tileset3d,
      layerMap: {}
    });

    this._updateTileset(this.state.activeViewports);
    this.props.onTilesetLoad(tileset3d);
  }

  _onTileLoad(tileHeader) {
    const {lastUpdatedViewports} = this.state;
    this.props.onTileLoad(tileHeader);
    this._updateTileset(lastUpdatedViewports);
    this.setNeedsUpdate();
  }

  _onTileUnload(tileHeader) {
    // Was cleaned up from tileset cache. We no longer need to track it.
    delete this.state.layerMap[tileHeader.id];
    this.props.onTileUnload(tileHeader);
  }

  _updateTileset(viewports) {
    const {tileset3d} = this.state;
    const {timeline} = this.context;
    const viewportsNumber = Object.keys(viewports).length;
    if (!timeline || !viewportsNumber || !tileset3d) {
      return;
    }
    const frameNumber = tileset3d.update(Object.values(viewports));
    const tilesetChanged = this.state.frameNumber !== frameNumber;
    if (tilesetChanged) {
      this.setState({frameNumber});
    }
  }

  _getSubLayer(tileHeader, oldLayer) {
    if (!tileHeader.content) {
      return null;
    }

    switch (tileHeader.type) {
      case TILE_TYPE.POINTCLOUD:
        return this._makePointCloudLayer(tileHeader, oldLayer);
      case TILE_TYPE.SCENEGRAPH:
        return this._make3DModelLayer(tileHeader, oldLayer);
      case TILE_TYPE.MESH:
        return this._makeSimpleMeshLayer(tileHeader, oldLayer);
      default:
        throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
    }
  }

  _makePointCloudLayer(tileHeader, oldLayer) {
    const {
      attributes,
      pointCount,
      constantRGBA,
      cartographicOrigin,
      modelMatrix
    } = tileHeader.content;
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

        getColor: constantRGBA || getPointColor
      }
    );
  }

  _make3DModelLayer(tileHeader) {
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
        getPosition: [0, 0, 0]
      }
    );
  }

  _makeSimpleMeshLayer(tileHeader, oldLayer) {
    const content = tileHeader.content;
    const {attributes, indices, modelMatrix, cartographicOrigin, material, featureIds} = content;
    const {_getMeshColor} = this.props;

    const geometry =
      (oldLayer && oldLayer.props.mesh) ||
      new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: getMeshGeometry(attributes),
        indices
      });

    const SubLayerClass = this.getSubLayerClass('mesh', _MeshLayer);

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
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        featureIds
      }
    );
  }

  renderLayers() {
    const {tileset3d, layerMap} = this.state;
    if (!tileset3d) {
      return null;
    }

    return tileset3d.tiles
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
          } else if (!layer.props.visible) {
            // update layer visibility
            // Still has GPU resource but visibility is turned off so turn it back on so we can render it.
            layer = layer.clone({visible: true});
          }
        } else if (layer && layer.props.visible) {
          // hide non-selected tiles
          // Still in tileset cache but doesn't need to render this frame. Keep the GPU resource bound but don't render it.
          layer = layer.clone({visible: false});
        }
        layerCache.layer = layer;
        return layer;
      })
      .filter(Boolean);
  }
}

function getMeshGeometry(contentAttributes) {
  const attributes = {};
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

Tile3DLayer.layerName = 'Tile3DLayer';
Tile3DLayer.defaultProps = defaultProps;

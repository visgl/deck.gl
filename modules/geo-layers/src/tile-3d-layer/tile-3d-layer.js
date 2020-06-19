import {Vector3} from 'math.gl';
import GL from '@luma.gl/constants';
import {Geometry} from '@luma.gl/core';
import {COORDINATE_SYSTEM, CompositeLayer} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {log} from '@deck.gl/core';

import {load} from '@loaders.gl/core';
import {Tileset3D, TILE_TYPE} from '@loaders.gl/tiles';
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';

const scratchOffset = new Vector3();

const defaultProps = {
  getPointColor: [0, 0, 0],
  pointSize: 1.0,

  data: null,
  loadOptions: {},
  loader: Tiles3DLoader,

  onTilesetLoad: tileset3d => {},
  onTileLoad: tileHeader => {},
  onTileUnload: tileHeader => {},
  onTileError: (tile, message, url) => {}
};

export default class Tile3DLayer extends CompositeLayer {
  initializeState() {
    if ('onTileLoadFail' in this.props) {
      log.removed('onTileLoadFail', 'onTileError')();
    }
    // prop verification
    this.state = {
      layerMap: {},
      tileset3d: null
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    if (props.data && props.data !== oldProps.data) {
      this._loadTileset(props.data);
    }

    if (changeFlags.viewportChanged) {
      const {tileset3d} = this.state;
      this._updateTileset(tileset3d);
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

  async _loadTileset(tilesetUrl) {
    const {loader, loadOptions} = this.props;
    const options = {...loadOptions};
    if (loader.preload) {
      const preloadOptions = await loader.preload(tilesetUrl, loadOptions);
      Object.assign(options, preloadOptions);
    }
    const tilesetJson = await load(tilesetUrl, loader, options);

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

    this._updateTileset(tileset3d);
    this.props.onTilesetLoad(tileset3d);
  }

  _onTileLoad(tileHeader) {
    this.props.onTileLoad(tileHeader);
    this._updateTileset(this.state.tileset3d);
    this.setNeedsUpdate();
  }

  _onTileUnload(tileHeader) {
    // Was cleaned up from tileset cache. We no longer need to track it.
    delete this.state.layerMap[tileHeader.id];
    this.props.onTileUnload(tileHeader);
  }

  _updateTileset(tileset3d) {
    const {timeline, viewport} = this.context;
    if (!timeline || !viewport || !tileset3d) {
      return;
    }
    const frameNumber = tileset3d.update(viewport);
    const tilesetChanged = this.state.frameNumber !== frameNumber;
    if (tilesetChanged) {
      this.setState({frameNumber});
    }
  }

  _create3DTileLayer(tileHeader) {
    if (!tileHeader.content) {
      return null;
    }

    switch (tileHeader.type) {
      case TILE_TYPE.POINTCLOUD:
        return this._createPointCloudTileLayer(tileHeader);
      case TILE_TYPE.SCENEGRAPH:
        return this._create3DModelTileLayer(tileHeader);
      case TILE_TYPE.MESH:
        return this._createSimpleMeshLayer(tileHeader);
      default:
        throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
    }
  }

  _createPointCloudTileLayer(tileHeader) {
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
        data: {
          header: {
            vertexCount: pointCount
          },
          attributes: {
            POSITION: positions,
            NORMAL: normals,
            COLOR_0: colors
          }
        },
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: cartographicOrigin,
        modelMatrix,

        getColor: constantRGBA || getPointColor
      }
    );
  }

  _create3DModelTileLayer(tileHeader) {
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
        data: instances || [{}],
        scenegraph: gltf,

        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: cartographicOrigin,
        modelMatrix,
        getTransformMatrix: instance => instance.modelMatrix,
        getPosition: instance => [0, 0, 0]
      }
    );
  }

  _createSimpleMeshLayer(tileHeader) {
    const content = tileHeader.content;
    const {attributes, modelMatrix, cartographicOrigin, texture} = content;
    const {normals, texCoords} = attributes;
    const positions = new Float32Array(attributes.positions.value.length);
    for (let i = 0; i < positions.length; i += 3) {
      scratchOffset.copy(attributes.positions.value.subarray(i, i + 3));
      positions.set(scratchOffset, i);
    }

    const geometry = new Geometry({
      drawMode: GL.TRIANGLES,
      attributes: {
        positions,
        normals,
        texCoords
      }
    });

    const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);

    return new SubLayerClass(
      this.getSubLayerProps({
        id: 'mesh'
      }),
      {
        id: `${this.id}-mesh-${tileHeader.id}`,
        mesh: geometry,
        data: [{}],
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255],
        texture,
        modelMatrix,
        coordinateOrigin: cartographicOrigin,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
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
        let layer = layerMap[tile.id] && layerMap[tile.id].layer;
        // render selected tiles
        if (tile.selected) {
          // create layer
          if (!layer) {
            layer = this._create3DTileLayer(tile);
            layerMap[tile.id] = {layer, tile};
          }
          // update layer visibility
          if (layer && layer.props && !layer.props.visible) {
            // Still has GPU resource but visibility is turned off so turn it back on so we can render it.
            layer = layer.clone({visible: true});
            layerMap[tile.id].layer = layer;
          }
          return layer;
        }

        // hide non-selected tiles
        if (layer && layer.props && layer.props.visible) {
          // Still in tileset cache but doesn't need to render this frame. Keep the GPU resource bound but don't render it.
          layer = layer.clone({visible: false});
          layerMap[tile.id].layer = layer;
        }
        return layer;
      })
      .filter(Boolean);
  }
}

Tile3DLayer.layerName = 'Tile3DLayer';
Tile3DLayer.defaultProps = defaultProps;

/* global fetch */

import {COORDINATE_SYSTEM, CompositeLayer} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {log} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Geometry} from '@luma.gl/core';
import {Matrix4, Vector3} from '@math.gl/core';

import {Tileset3D, _getIonTilesetMetadata} from '@loaders.gl/3d-tiles';

const scratchOffset = new Vector3(0, 0, 0);
const defaultProps = {
  getPointColor: [0, 0, 0],
  pointSize: 1.0,

  data: null,
  _ionAssetId: null,
  _ionAccessToken: null,
  loadOptions: {throttleRequests: true},

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
    } else if (
      (props._ionAccessToken || props._ionAssetId) &&
      (props._ionAccessToken !== oldProps._ionAccessToken ||
        props._ionAssetId !== oldProps._ionAssetId)
    ) {
      this._loadTilesetFromIon(props._ionAccessToken, props._ionAssetId);
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

  async _loadTileset(tilesetUrl, fetchOptions, ionMetadata) {
    const response = await fetch(tilesetUrl, fetchOptions);
    const tilesetJson = await response.json();

    const loadOptions = this.getLoadOptions();

    const tileset3d = new Tileset3D(tilesetJson, tilesetUrl, {
      onTileLoad: tileHeader => {
        this.props.onTileLoad(tileHeader);
        this._updateTileset(tileset3d);
      },
      onTileUnload: this.props.onTileUnload,
      onTileLoadFail: this.props.onTileError,
      // TODO: explicit passing should not be needed, registerLoaders should suffice
      fetchOptions,
      ...ionMetadata,
      ...loadOptions
    });

    this.setState({
      tileset3d,
      layerMap: {}
    });

    if (tileset3d) {
      this._updateTileset(tileset3d);
      this.props.onTilesetLoad(tileset3d);
    }
  }

  async _loadTilesetFromIon(ionAccessToken, ionAssetId) {
    const ionMetadata = await _getIonTilesetMetadata(ionAccessToken, ionAssetId);
    const {url, headers} = ionMetadata;
    await this._loadTileset(url, {headers}, ionMetadata);
  }

  _updateTileset(tileset3d) {
    const {timeline, viewport} = this.context;
    if (!timeline || !viewport || !tileset3d) {
      return;
    }

    const frameNumber = tileset3d.update(viewport);
    this._updateLayerMap(frameNumber);
  }

  // `Layer` instances is created and added to the map if it doesn't exist yet.
  _updateLayerMap(frameNumber) {
    const {tileset3d, layerMap} = this.state;

    // create layers for new tiles
    const {selectedTiles} = tileset3d;
    const tilesWithoutLayer = selectedTiles.filter(tile => !layerMap[tile.id]);

    for (const tile of tilesWithoutLayer) {
      // TODO - why do we call this here? Being "selected" should automatically add it to cache?
      tileset3d.addTileToCache(tile);

      const layers = this._create3DTileLayer(tile);
      layerMap[tile.id] = {
        layers: Array.isArray(layers) ? layers : [layers],
        tile
      };
    }

    // update layer visibility
    this._selectLayers(frameNumber);
  }

  // Grab only those layers who were selected this frame.
  _selectLayers(frameNumber) {
    const {layerMap} = this.state;
    const layerMapValues = Object.values(layerMap);

    for (const value of layerMapValues) {
      const {tile} = value;
      let {layers} = value;

      if (tile.selectedFrame === frameNumber) {
        for (let i = 0; i < layers.length; i++) {
          let layer = layers[i];
          if (layer && layer.props && !layer.props.visible) {
            // Still has GPU resource but visibility is turned off so turn it back on so we can render it.
            layerMap[tile.id].layers[i] = layer.clone({visible: true});
          }
        }
      } else if (tile.contentUnloaded) {
        // Was cleaned up from tileset cache. We no longer need to track it.
        delete layerMap[tile.id];
      } else {
        for (let i = 0; i < layers.length; i++) {
          let layer = layers[i];
          if (layer && layer.props && layer.props.visible) {
            // Still in tileset cache but doesn't need to render this frame. Keep the GPU resource bound but don't render it.
            layer = layer.clone({visible: false});
            layerMap[tile.id].layers[i] = layer.clone({visible: false});
          }
        }
      }
    }

    let layers = [];
    Object.values(layerMap).forEach(value => layers = layers.concat(value.layers));

    this.setState({layers});
  }

  _create3DTileLayer(tileHeader) {
    if (!tileHeader.content) {
      return null;
    }

    switch (tileHeader.content.type) {
    case 'pnts':
      return this._createPointCloudTileLayer(tileHeader);
    case 'i3dm':
    case 'b3dm':
      return this._createMeshLayer(tileHeader);
    default:
      throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
    }
  }

  _createMeshLayer(tileHeader) {
    const {viewport} = this.context;
    if (!viewport) {
      return null;
    }
    const {gltf, cartographicOrigin, modelMatrix} = tileHeader.content;
    if (!cartographicOrigin) {
      console.log('no origin', tileHeader);
      return null;
    }

    const primitives = gltf.scene.nodes[0].children[0].mesh.primitives;
    const {matrix} = gltf.scene.nodes[0];

    let composedMatrix = new Matrix4();
    if (modelMatrix) {
      composedMatrix = composedMatrix.multiplyRight(modelMatrix);
    }
    if (matrix) {
      composedMatrix = composedMatrix.multiplyRight(matrix);
    }

    const layers = [];
    for (const primitive of primitives) {
      const {attributes, indices} = primitive;
      const positions = new Float32Array(attributes.POSITION.value.length);
      for (let i = 0; i < positions.length; i += 3) {
        scratchOffset.copy(composedMatrix.transform(attributes.POSITION.value.subarray(i, i + 3)));
        positions.set(viewport.addMetersToLngLat(cartographicOrigin, scratchOffset), i);
      }
      const texCoords = attributes.TEXCOORD_0.value;

      const geometry = new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: {
          positions,
          texCoords,
          indices
        }
      });

      layers.push(new SimpleMeshLayer({
          id: `mesh-layer-${tileHeader.id}-${layers.length}`,
          mesh: geometry,
          data: [{}],
          getPosition: d => [0, 0, 0],
          getColor: [255, 255, 255],
          composeModelMatrix: true,
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT
        })
      );
    }
    return layers;
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
        // Fix for ScenegraphLayer.modelMatrix, under flag in deck 7.3 to avoid breaking existing code
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

  renderLayers() {
    return this.state.layers;
  }
}

Tile3DLayer.layerName = 'Tile3DLayer';
Tile3DLayer.defaultProps = defaultProps;

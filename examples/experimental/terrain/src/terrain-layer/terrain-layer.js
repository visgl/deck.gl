import {CompositeLayer} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {WebMercatorViewport, COORDINATE_SYSTEM} from '@deck.gl/core';
import {load} from '@loaders.gl/core';
import {TerrainLoader} from '@loaders.gl/terrain';
import {TileLayer} from '@deck.gl/geo-layers';

const defaultProps = {
  ...TileLayer.defaultProps,
  // Image url that encodes height data
  terrainImage: {type: 'string', value: null},
  // Image url to use as texture
  surfaceImage: {type: 'string', value: null},
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: {type: 'number', value: 4.0},
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: {type: 'array', value: [0, 0, 1, 1], compare: true},
  // Color to use if surfaceImage is unavailable
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
  // Same as SimpleMeshLayer wireframe
  wireframe: false
};

/**
 * state: {
 *   isTiled: True renders TileLayer of many SimpleMeshLayers, false renders one SimpleMeshLayer
 *   terrain: Mesh object. Only defined when isTiled is false.
 * }
 */
export default class TerrainLayer extends CompositeLayer {
  updateState({props, oldProps}) {
    if (props.terrainImage !== oldProps.terrainImage) {
      const isTiled = props.terrainImage.includes('{x}') && props.terrainImage.includes('{y}');
      this.setState({isTiled});
    }

    // Reloading for single terrain mesh
    const shouldReload =
      props.meshMaxError !== oldProps.meshMaxError ||
      props.elevationDecoder !== oldProps.elevationDecoder ||
      props.bounds !== oldProps.bounds;

    if (!this.state.isTiled && shouldReload) {
      const options = {
        terrain: {
          meshMaxError: props.meshMaxError,
          elevationDecoder: props.elevationDecoder,
          bounds: props.bounds
        }
      };
      this.setState({terrain: load(props.terrainImage, TerrainLoader, options)});
    }
  }

  getTerrainData({bbox, x, y, z}) {
    const {terrainImage, elevationDecoder, meshMaxError} = this.props;
    const url = terrainImage
      .replace('{x}', x)
      .replace('{y}', y)
      .replace('{z}', z);

    const viewport = new WebMercatorViewport({
      longitude: (bbox.west + bbox.east) / 2,
      latitude: (bbox.north + bbox.south) / 2,
      zoom: z
    });
    const bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
    const topRight = viewport.projectFlat([bbox.east, bbox.north]);
    const bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];

    const options = {
      terrain: {
        bounds,
        meshMaxError,
        elevationDecoder
      }
    };
    if (this.props.workerUrl) {
      options.terrain.workerUrl = this.props.workerUrl;
    }
    return load(url, TerrainLoader, options);
  }

  renderSubLayers(props) {
    const {x, y, z} = props.tile;
    const surfaceUrl = props.surfaceImage
      ? props.surfaceImage
          .replace('{x}', x)
          .replace('{y}', y)
          .replace('{z}', z)
      : null;

    return new SimpleMeshLayer({
      id: props.id,
      wireframe: props.wireframe,
      mesh: props.data,
      data: [1],
      texture: surfaceUrl,
      getPolygonOffset: null,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: d => [0, 0, 0],
      getColor: d => props.color
    });
  }

  renderLayers() {
    const {
      color,
      terrainImage,
      surfaceImage,
      wireframe,
      meshMaxError,
      elevationDecoder
    } = this.props;

    if (this.state.isTiled) {
      return new TileLayer(this.props, {
        id: `${this.props.id}-terrain`,
        getTileData: this.getTerrainData.bind(this),
        renderSubLayers: this.renderSubLayers,
        updateTriggers: {
          getTileData: {terrainImage, meshMaxError, elevationDecoder}
        }
      });
    }
    return new SimpleMeshLayer(
      this.getSubLayerProps({
        id: 'terrain'
      }),
      {
        data: [1],
        mesh: this.state.terrain,
        texture: surfaceImage,
        getPosition: d => [0, 0, 0],
        getColor: d => color,
        wireframe
      }
    );
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;

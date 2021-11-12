
import { GeoJsonLayer } from '@deck.gl/layers/';
import TileLayer from '../tile-layer/tile-layer'
import {getURLFromTemplate} from '../tile-layer/utils';
import {TemporalGridLoader} from './temporalgrid-loader';


const defaultProps = {
  loaders: [TemporalGridLoader],
  // binary: true
};

const DUMMY = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              1.0986328125,
              47.264320080254805
            ],
            [
              1.69189453125,
              47.264320080254805
            ],
            [
              1.69189453125,
              47.754097979680026
            ],
            [
              1.0986328125,
              47.754097979680026
            ],
            [
              1.0986328125,
              47.264320080254805
            ]
          ]
        ]
      }
    }
  ]
}

export default class TemporalGridLayer extends TileLayer {

  getTileData(tile) {
    const {data, getTileData, fetch} = this.props;
    const {signal} = tile;

    tile.url = getURLFromTemplate(data, tile);

    if (tile.url) {
      return fetch(tile.url, {propName: 'data', layer: this, signal});
    }
    return null;
  }

  renderSubLayers(props) {
    const {
      bbox: {west, south, east, north}
    } = props.tile;
    console.log(props)
    return new GeoJsonLayer(
      props,
      this.getSubLayerProps({
        id: `temporalgrid-geojson`,
        data: DUMMY,
        // getLineColor: [255, 0, 0],
        getFillColor: [0, 0, 255],
        // upd4ateTriggers
      })
    );

    // return new BitmapLayer(props, {
    //   data: null,
    //   image: props.data,
    //   bounds: [west, south, east, north]
    // });
  }
}

TemporalGridLayer.layerName = 'TemporalGridLayer';
TemporalGridLayer.defaultProps = defaultProps;
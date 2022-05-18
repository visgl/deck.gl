import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';
import {getGeohashPolygon} from './geohash-utils';

const defaultProps = {
  getGeohash: {type: 'accessor', value: d => d.geohash}
};

export default class GeohashLayer extends GeoCellLayer {
  indexToBounds() {
    const {data, getGeohash} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',
      getPolygon: (x, objectInfo) => getGeohashPolygon(getGeohash(x, objectInfo))
    };
  }
}

GeohashLayer.layerName = 'GeohashLayer';
GeohashLayer.defaultProps = defaultProps;

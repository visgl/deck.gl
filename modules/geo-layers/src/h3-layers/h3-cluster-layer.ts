import {h3SetToMultiPolygon} from 'h3-js';

import {createIterable} from '@deck.gl/core';
import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';

const defaultProps = {
  getHexagons: {type: 'accessor', value: d => d.hexagons}
};

export default class H3ClusterLayer extends GeoCellLayer {
  updateState({props, oldProps, changeFlags}) {
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggers && changeFlags.updateTriggers.getHexagons)
    ) {
      const {data, getHexagons} = props;
      const polygons = [];

      const {iterable, objectInfo} = createIterable(data);
      for (const object of iterable) {
        objectInfo.index++;
        const hexagons = getHexagons(object, objectInfo);
        const multiPolygon = h3SetToMultiPolygon(hexagons, true);

        for (const polygon of multiPolygon) {
          polygons.push(this.getSubLayerRow({polygon}, object, objectInfo.index));
        }
      }

      this.setState({polygons});
    }
  }

  indexToBounds() {
    return {
      data: this.state.polygons,
      getPolygon: d => d.polygon
    };
  }
}

H3ClusterLayer.defaultProps = defaultProps;
H3ClusterLayer.layerName = 'H3ClusterLayer';

import {h3SetToMultiPolygon} from 'h3-js';

import {CompositeLayer, createIterable} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

// Given a nested GeoJSON-style polygon, returns {positions, holeIndices}
// This function does not validate or normalize
function flattenPolygon(polygon) {
  let vertices = 0;
  for (const ring of polygon) {
    vertices += ring.length;
  }

  const positions = new Float64Array(vertices * 2);
  const numRings = polygon.length;
  const holeIndices = numRings > 1 && new Array(numRings - 1);

  let i = 0;
  for (let ringIndex = 0; ringIndex < numRings; ringIndex++) {
    if (ringIndex > 1) {
      holeIndices[ringIndex - 1] = i;
    }
    for (const point of polygon[ringIndex]) {
      positions[i++] = point[0];
      positions[i++] = point[1];
    }
  }

  return holeIndices ? {positions, holeIndices} : positions;
}

const defaultProps = Object.assign(
  {
    getHexagons: {type: 'accessor', value: d => d.hexagons}
  },
  PolygonLayer.defaultProps
);

export default class H3ClusterLayer extends CompositeLayer {
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
          polygons.push(
            this.getSubLayerRow({polygon: flattenPolygon(polygon)}, object, objectInfo.index)
          );
        }
      }

      this.setState({polygons});
    }
  }

  renderLayers() {
    const {
      elevationScale,
      extruded,
      wireframe,
      filled,
      stroked,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified,
      material,

      getFillColor,
      getLineColor,
      getLineWidth,
      getLineDashArray,
      getElevation,
      updateTriggers
    } = this.props;

    const SubLayerClass = this.getSubLayerClass('cluster-region', PolygonLayer);

    return new SubLayerClass(
      {
        filled,
        wireframe,

        extruded,
        elevationScale,

        stroked,
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels,
        lineJointRounded,
        lineMiterLimit,
        lineDashJustified,

        material,

        getFillColor: this.getSubLayerAccessor(getFillColor),
        getLineColor: this.getSubLayerAccessor(getLineColor),
        getLineWidth: this.getSubLayerAccessor(getLineWidth),
        getLineDashArray: this.getSubLayerAccessor(getLineDashArray),
        getElevation: this.getSubLayerAccessor(getElevation)
      },
      this.getSubLayerProps({
        id: 'cluster-region',
        updateTriggers
      }),
      {
        data: this.state.polygons,
        _normalize: false,
        positionFormat: 'XY',
        getPolygon: d => d.polygon
      }
    );
  }
}

H3ClusterLayer.defaultProps = defaultProps;
H3ClusterLayer.layerName = 'H3ClusterLayer';

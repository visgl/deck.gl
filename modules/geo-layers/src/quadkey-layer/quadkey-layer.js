import {CompositeLayer} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps = {
  ...PolygonLayer.defaultProps,
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

export default class QuadkeyLayer extends CompositeLayer {
  renderLayers() {
    // Layer prop
    const {data, getQuadkey} = this.props;

    // Rendering props underlying layer
    const {
      elevationScale,
      extruded,
      wireframe,
      filled,
      stroked,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified,
      getElevation,
      getFillColor,
      getLineColor,
      getLineWidth,
      getLineDashArray
    } = this.props;

    // Accessor props for underlying layers
    const {updateTriggers, material} = this.props;

    // Filled Polygon Layer
    const CellLayer = this.getSubLayerClass('cell', PolygonLayer);
    return new CellLayer(
      {
        filled,
        wireframe,

        extruded,
        elevationScale,

        stroked,
        lineWidthUnits,
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels,
        lineJointRounded,
        lineMiterLimit,
        lineDashJustified,

        material,

        getElevation,
        getFillColor,
        getLineColor,
        getLineWidth,
        getLineDashArray
      },
      this.getSubLayerProps({
        id: 'cell',
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getLineWidth: updateTriggers.getLineWidth,
          getLineDashArray: updateTriggers.getLineDashArray
        }
      }),
      {
        data,
        _normalize: false,
        positionFormat: 'XY',
        getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo))
      }
    );
  }
}

QuadkeyLayer.layerName = 'QuadkeyLayer';
QuadkeyLayer.defaultProps = defaultProps;

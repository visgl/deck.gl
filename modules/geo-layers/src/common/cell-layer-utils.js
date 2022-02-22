import {PolygonLayer} from '@deck.gl/layers';

export function createCellLayer(layer, props) {
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
  } = layer.props;

  // Accessor props for underlying layers
  const {updateTriggers, material} = layer.props;

  // Filled Polygon Layer
  const CellLayer = layer.getSubLayerClass('cell', PolygonLayer);
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
    layer.getSubLayerProps({
      id: 'cell',
      updateTriggers: {
        getElevation: updateTriggers.getElevation,
        getFillColor: updateTriggers.getFillColor,
        getLineColor: updateTriggers.getLineColor,
        getLineWidth: updateTriggers.getLineWidth,
        getLineDashArray: updateTriggers.getLineDashArray
      }
    }),
    props
  );
}

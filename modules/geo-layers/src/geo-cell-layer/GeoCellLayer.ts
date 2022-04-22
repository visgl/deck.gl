import {CompositeLayer, Layer, LayersList} from '@deck.gl/core';
import {PolygonLayer, PolygonLayerProps} from '@deck.gl/layers';

const defaultProps = {
  ...PolygonLayer.defaultProps
};

export type GeoCellLayerProps<DataT = any> = PolygonLayerProps<DataT>;

export default class GeoCellLayer<
  DataT = any,
  PropsT extends GeoCellLayerProps<DataT> = GeoCellLayerProps<DataT>
> extends CompositeLayer<PropsT> {
  static layerName = 'GeoCellLayer';
  static defaultProps = defaultProps;

  /** Implement to generate props to create geometry. */
  indexToBounds(): Partial<GeoCellLayerProps> | null {
    return null;
  }

  renderLayers(): Layer | null | LayersList {
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
      getLineWidth
    } = this.props;

    // Accessor props for underlying layers
    const {updateTriggers, material, transitions} = this.props;

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
        transitions,

        getElevation,
        getFillColor,
        getLineColor,
        getLineWidth
      },
      this.getSubLayerProps({
        id: 'cell',
        updateTriggers: updateTriggers && {
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getLineWidth: updateTriggers.getLineWidth
        }
      }),
      this.indexToBounds()
    );
  }
}

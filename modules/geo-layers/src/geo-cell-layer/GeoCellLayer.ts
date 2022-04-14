import {
  CompositeLayer,
  Layer,
  Accessor,
  AccessorFunction,
  CompositeLayerProps,
  Unit,
  Color,
  assert
} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

const defaultProps = {
  ...PolygonLayer.defaultProps
};

// TODO: these should go probably to polygon-layer.ts, not yet migrated

export type MaterialProps = {
  ambient: number;
  diffuse: number;
  shininess: number;
  specularColor: [r: number, g: number, b: number];
};

/**
 * Properties for `PolygonLayer`.
 */
export type PolygonLayerProps<DataT = any> = CompositeLayerProps<DataT> & {
  /**
   * Whether to draw an outline around the polygon (solid fill).
   *
   * Note that both the outer polygon as well the outlines of any holes will be drawn.
   */
  stroked: boolean;

  /**
   * Whether to draw a filled polygon (solid fill).
   *
   * Note that only the area between the outer polygon and any holes will be filled.
   */
  filled: boolean;

  /**
   * Whether to extrude the polygons
   *
   * Based on the elevations provided by the `getElevation` accessor.
   *
   * If set to `false`, all polygons will be flat, this generates less geometry and is faster
   * than simply returning 0 from getElevation.
   */
  extruded: boolean;

  /**
   * Elevation multiplier.
   *
   * The final elevation is calculated by `elevationScale * getElevation(d)`.
   * `elevationScale` is a handy property to scale all elevation without updating the data.
   */
  elevationScale: boolean;

  /**
   * Whether to generate a line wireframe of the hexagon.
   *
   * The outline will have "horizontal" lines closing the top and bottom polygons and a vertical
   * line (a "strut") for each vertex on the polygon
   */
  wireframe: boolean;

  /**
   * The units of the line width, one of `meters`, `common`, and `pixels`.
   *
   * @see Unit.
   */
  lineWidthUnits: Unit;

  /**
   * The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
   * features if the stroked attribute is true.
   */
  lineWidthScale: number;

  /**
   * The minimum line width in pixels.
   *
   * @default 0
   */
  lineWidthMinPixels: number;

  /**
   * The maximum line width in pixels
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels: number;

  /**
   * Type of joint. If `true`, draw round joints. Otherwise draw miter joints.
   *
   * @default false
   */
  lineJointRounded: boolean;

  /**
   * The maximum extent of a joint in ratio to the stroke width.
   *
   * Only works if `lineJointRounded` is false.
   *
   * @default 4
   */
  lineMiterLimit: number;

  lineDashJustified: boolean;

  /** Called on each object in the data stream to retrieve its corresponding polygon. */
  getPolygon: AccessorFunction<DataT, any>;

  /**
   * Fill collor value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;

  /**
   * Line color value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;

  /**
   * Line width value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineWidth?: Accessor<DataT, number>;

  /**
   * Elevation valur or accessor.
   *
   * Only used if `extruded: true`.
   *
   * @default 1000
   */
  getElevation: Accessor<DataT, number>;

  /**
   * If `false`, will skip normalizing the coordinates returned by `getPolygon`.
   *
   * >**Note**: This prop is experimental
   *
   * @default true
   */
  _normalize: boolean;

  /**
   * Specifies the winding order of rings in the polygon data.
   *
   * >**Note**: This prop is experimental
   *
   * @default 'CW'
   */
  _windingOrder: 'CW' | 'CCW';

  /**
   * Material props for lighting effect.
   *
   * @see https://deck.gl/docs/developer-guide/using-lighting#constructing-a-material-instance
   */
  material?: true | MaterialProps;
};

export type GeoCellLayerProps<DataT = any> = PolygonLayerProps<DataT>;

export default class GeoCellLayer<
  DataT = any,
  PropsT extends GeoCellLayerProps<DataT> = GeoCellLayerProps<DataT>
> extends CompositeLayer<PropsT> {
  static layerName = 'GeoCellLayer';
  static defaultProps = defaultProps as any; // TODO: why defaultProps is broken

  /** Implement to generate props to create geometry. */
  indexToBounds(): Partial<GeoCellLayerProps> | null {
    return null;
  }

  renderLayers(): Layer {
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
    assert(updateTriggers);

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
        updateTriggers: {
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

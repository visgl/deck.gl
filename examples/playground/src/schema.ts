/**
 * FOR AGENT USE

This file is used by generate-schema.cjs to generate JSON schema for the editor.
This file is hand-curated. Use the following guidance when updating this file.

## AnyView

This union should include all registered @deck.gl/core View types in configuration.ts.
Each view type:

- Specifies `@@type` constant as the registered view name
- Merges all `*ViewProps` that can be expressed as plain json types.

## AnyLayer

This union should include all registered Layer types in configuration.ts.
Each layer type:

- Specifies `@@type` constant as the registered layer name
- Inherits `BaseLayerProps`
- Cherry picks all props that are NOT from `LayerProps`/`CompositeLayerProps` and CAN be expressed as plain json types.
- Explicitly lists accessors as `<OutputType> | AccessorFunction`

## AnyWidget

This union should include all registered Widget types in configuration.ts.
Each widget type:

- Specifies `@@type` constant as the registered widget name
- Inherits `BaseWidgetProps`
- Cherry picks all props that are NOT from `WidgetProps` and CAN be expressed as plain json types

 */

import type {
  DeckProps,
  MapViewState,
  MapViewProps,
  FirstPersonViewState,
  FirstPersonViewProps,
  OrbitViewState,
  OrbitViewProps,
  OrthographicViewState,
  OrthographicViewProps,
  LayerProps
} from '@deck.gl/core';
import type {
  ScatterplotLayerProps,
  LineLayerProps,
  ArcLayerProps,
  TextLayerProps,
  BitmapLayerProps,
  IconLayerProps,
  PointCloudLayerProps,
  ColumnLayerProps,
  GridCellLayerProps,
  PathLayerProps,
  PolygonLayerProps,
  GeoJsonLayerProps,
  SolidPolygonLayerProps
} from '@deck.gl/layers';
import type {
  ScreenGridLayerProps,
  HexagonLayerProps,
  ContourLayerProps,
  GridLayerProps,
  HeatmapLayerProps
} from '@deck.gl/aggregation-layers';
import type {
  A5LayerProps,
  WMSLayerProps,
  GreatCircleLayerProps,
  S2LayerProps,
  QuadkeyLayerProps,
  TileLayerProps,
  TripsLayerProps,
  H3ClusterLayerProps,
  H3HexagonLayerProps,
  Tile3DLayerProps,
  TerrainLayerProps,
  MVTLayerProps,
  GeohashLayerProps,
  _GeoCellLayerProps
} from '@deck.gl/geo-layers';
import type {SimpleMeshLayerProps, ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import type {
  ZoomWidgetProps,
  ResetViewWidgetProps,
  GimbalWidgetProps,
  CompassWidgetProps,
  ScaleWidgetProps,
  GeocoderWidgetProps,
  FullscreenWidgetProps,
  SplitterWidgetProps,
  InfoWidgetProps,
  PopupWidgetProps,
  ContextMenuWidgetProps,
  ScrollbarWidgetProps,
  IconWidgetProps,
  ToggleWidgetProps,
  SelectorWidgetProps,
  TimelineWidgetProps,
  ScreenshotWidgetProps,
  ThemeWidgetProps,
  LoadingWidgetProps,
  StatsWidgetProps
} from '@deck.gl/widgets';

type MapView = MapViewProps & {'@@type': 'MapView'};
type FirstPersonView = FirstPersonViewProps & {'@@type': 'FirstPersonView'};
type OrbitView = OrbitViewProps & {'@@type': 'OrbitView'};
type OrthographicView = OrthographicViewProps & {'@@type': 'OrthographicView'};

type AnyView = MapView | FirstPersonView | OrbitView | OrthographicView;
type AnyViewState = MapViewState | OrthographicViewState | OrbitViewState | FirstPersonViewState;

type CSSStyleSheet = Record<string, string | number>;
type AccessorFunction = `@@=${string}`;
type PositionValue = number[];
type ColorValue = number[];
type ContentBoundsValue = [PositionValue, PositionValue];
type PopupContentValue = {
  text?: string;
  html?: string;
};
type MenuItemValue = {
  label: string;
  value: string;
  icon?: string;
};
type SelectorOptionValue = {
  value: string;
  icon: string;
  label?: string;
};
type ScrollbarDecorationValue = {
  contentBounds: ContentBoundsValue;
  color: string;
  title?: string;
};
type SplitterViewLayoutValue = {
  orientation: 'vertical' | 'horizontal';
  views: [AnyView | SplitterViewLayoutValue, AnyView | SplitterViewLayoutValue];
  initialSplit?: number;
  editable?: boolean;
  minSplit?: number;
  maxSplit?: number;
};

type BaseLayerProps = Pick<
  LayerProps,
  | 'id'
  | 'updateTriggers'
  | 'operation'
  | 'visible'
  | 'pickable'
  | 'opacity'
  | 'coordinateOrigin'
  | 'coordinateSystem'
  | 'wrapLongitude'
  | 'positionFormat'
  | 'colorFormat'
  | 'parameters'
  | 'transitions'
  | 'loadOptions'
  | 'autoHighlight'
> & {
  data: any;
  modelMatrix?: number[];
  highlightColor?: number[];
};

type ScatterplotLayer = BaseLayerProps &
  Pick<
    ScatterplotLayerProps,
    | 'radiusUnits'
    | 'radiusScale'
    | 'radiusMinPixels'
    | 'radiusMaxPixels'
    | 'lineWidthUnits'
    | 'lineWidthScale'
    | 'lineWidthMinPixels'
    | 'lineWidthMaxPixels'
    | 'stroked'
    | 'filled'
    | 'billboard'
    | 'antialiasing'
  > & {
    '@@type': 'ScatterplotLayer';
    getPosition?: PositionValue | AccessorFunction;
    getRadius?: number | AccessorFunction;
    getFillColor?: ColorValue | AccessorFunction;
    getLineColor?: ColorValue | AccessorFunction;
    getLineWidth?: number | AccessorFunction;
    getPixelOffset?: number[] | AccessorFunction;
  };

type LineLayer = BaseLayerProps &
  Pick<LineLayerProps, 'widthUnits' | 'widthScale' | 'widthMinPixels' | 'widthMaxPixels'> & {
    '@@type': 'LineLayer';
    getSourcePosition?: PositionValue | AccessorFunction;
    getTargetPosition?: PositionValue | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getWidth?: number | AccessorFunction;
  };

type ArcLayer = BaseLayerProps &
  Pick<
    ArcLayerProps,
    | 'greatCircle'
    | 'numSegments'
    | 'widthUnits'
    | 'widthScale'
    | 'widthMinPixels'
    | 'widthMaxPixels'
  > & {
    '@@type': 'ArcLayer';
    getSourcePosition?: PositionValue | AccessorFunction;
    getTargetPosition?: PositionValue | AccessorFunction;
    getSourceColor?: ColorValue | AccessorFunction;
    getTargetColor?: ColorValue | AccessorFunction;
    getWidth?: number | AccessorFunction;
    getHeight?: number | AccessorFunction;
    getTilt?: number | AccessorFunction;
  };

type GreatCircleLayer = Omit<ArcLayer, '@@type'> & {
  '@@type': 'GreatCircleLayer';
};

type TextLayer = BaseLayerProps &
  Pick<
    TextLayerProps,
    | 'billboard'
    | 'sizeScale'
    | 'sizeUnits'
    | 'sizeMinPixels'
    | 'sizeMaxPixels'
    | 'background'
    | 'backgroundBorderRadius'
    | 'backgroundPadding'
    | 'characterSet'
    | 'fontFamily'
    | 'fontWeight'
    | 'fontSettings'
    | 'lineHeight'
    | 'outlineWidth'
    | 'outlineColor'
    | 'wordBreak'
    | 'maxWidth'
    | 'contentCutoffPixels'
    | 'contentAlignHorizontal'
    | 'contentAlignVertical'
  > & {
    '@@type': 'TextLayer';
    getText?: string | AccessorFunction;
    getPosition?: PositionValue | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getSize?: number | AccessorFunction;
    getAngle?: number | AccessorFunction;
    getTextAnchor?: 'start' | 'middle' | 'end' | AccessorFunction;
    getAlignmentBaseline?: 'top' | 'center' | 'bottom' | AccessorFunction;
    getPixelOffset?: number[] | AccessorFunction;
    getBackgroundColor?: ColorValue | AccessorFunction;
    getBorderColor?: ColorValue | AccessorFunction;
    getBorderWidth?: number | AccessorFunction;
    getContentBox?: number[] | AccessorFunction;
  };

type BitmapLayer = Omit<BaseLayerProps, 'data'> &
  Pick<BitmapLayerProps, 'desaturate' | '_imageCoordinateSystem'> & {
    '@@type': 'BitmapLayer';
    image?: string | null;
    bounds?: number[] | number[][];
    transparentColor?: ColorValue;
    tintColor?: ColorValue;
  };

type IconLayer = BaseLayerProps &
  Pick<
    IconLayerProps,
    | 'sizeScale'
    | 'sizeUnits'
    | 'sizeBasis'
    | 'sizeMinPixels'
    | 'sizeMaxPixels'
    | 'billboard'
    | 'alphaCutoff'
  > & {
    '@@type': 'IconLayer';
    iconAtlas?: string;
    iconMapping?: string | Record<string, any>;
    getPosition?: PositionValue | AccessorFunction;
    getIcon?: string | Record<string, any> | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getSize?: number | AccessorFunction;
    getAngle?: number | AccessorFunction;
    getPixelOffset?: number[] | AccessorFunction;
  };

type PointCloudLayer = BaseLayerProps &
  Pick<PointCloudLayerProps, 'sizeUnits' | 'pointSize' | 'radiusPixels'> & {
    '@@type': 'PointCloudLayer';
    getPosition?: PositionValue | AccessorFunction;
    getNormal?: number[] | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
  };

type ColumnLayer = BaseLayerProps &
  Pick<
    ColumnLayerProps,
    | 'diskResolution'
    | 'radius'
    | 'angle'
    | 'vertices'
    | 'offset'
    | 'coverage'
    | 'elevationScale'
    | 'filled'
    | 'stroked'
    | 'extruded'
    | 'wireframe'
    | 'flatShading'
    | 'radiusUnits'
    | 'lineWidthUnits'
    | 'lineWidthScale'
    | 'lineWidthMinPixels'
    | 'lineWidthMaxPixels'
  > & {
    '@@type': 'ColumnLayer';
    getPosition?: PositionValue | AccessorFunction;
    getFillColor?: ColorValue | AccessorFunction;
    getLineColor?: ColorValue | AccessorFunction;
    getElevation?: number | AccessorFunction;
    getLineWidth?: number | AccessorFunction;
  };

type GridCellLayer = Omit<ColumnLayer, '@@type'> &
  Pick<GridCellLayerProps, 'cellSize'> & {
    '@@type': 'GridCellLayer';
  };

type PathLayer = BaseLayerProps &
  Pick<
    PathLayerProps,
    | 'widthUnits'
    | 'widthScale'
    | 'widthMinPixels'
    | 'widthMaxPixels'
    | 'jointRounded'
    | 'capRounded'
    | 'miterLimit'
    | 'billboard'
    | '_pathType'
    | 'rounded'
  > & {
    '@@type': 'PathLayer';
    getPath?: number[][] | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getWidth?: number | number[] | AccessorFunction;
  };

type PolygonLayer = BaseLayerProps &
  Pick<
    PolygonLayerProps,
    | 'stroked'
    | 'filled'
    | 'extruded'
    | 'elevationScale'
    | 'wireframe'
    | 'lineWidthUnits'
    | 'lineWidthScale'
    | 'lineWidthMinPixels'
    | 'lineWidthMaxPixels'
    | 'lineJointRounded'
    | 'lineMiterLimit'
    | 'lineDashJustified'
    | '_normalize'
    | '_windingOrder'
  > & {
    '@@type': 'PolygonLayer';
    getPolygon?: number[][] | AccessorFunction;
    getFillColor?: ColorValue | AccessorFunction;
    getLineColor?: ColorValue | AccessorFunction;
    getLineWidth?: number | AccessorFunction;
    getElevation?: number | AccessorFunction;
    getLineDashArray?: number[] | AccessorFunction;
  };

type SolidPolygonLayer = BaseLayerProps &
  Pick<
    SolidPolygonLayerProps,
    | 'filled'
    | 'extruded'
    | 'wireframe'
    | '_normalize'
    | '_windingOrder'
    | '_full3d'
    | 'elevationScale'
  > & {
    '@@type': 'SolidPolygonLayer';
    getPolygon?: number[][] | AccessorFunction;
    getElevation?: number | AccessorFunction;
    getFillColor?: ColorValue | AccessorFunction;
    getLineColor?: ColorValue | AccessorFunction;
  };

type GeoCellLayer = Omit<PolygonLayer, '@@type'> & {
  '@@type': '_GeoCellLayer';
};

type S2Layer = Omit<GeoCellLayer, '@@type'> & {
  '@@type': 'S2Layer';
  getS2Token?: string | AccessorFunction;
};

type QuadkeyLayer = Omit<GeoCellLayer, '@@type'> & {
  '@@type': 'QuadkeyLayer';
  getQuadkey?: string | AccessorFunction;
};

type GeohashLayer = Omit<GeoCellLayer, '@@type'> & {
  '@@type': 'GeohashLayer';
  getGeohash?: string | AccessorFunction;
};

type A5Layer = Omit<GeoCellLayer, '@@type'> & {
  '@@type': 'A5Layer';
  getPentagon?: string | AccessorFunction;
};

type GeoJsonLayer = BaseLayerProps &
  Pick<
    GeoJsonLayerProps,
    | 'pointType'
    | 'filled'
    | 'stroked'
    | 'lineWidthUnits'
    | 'lineWidthScale'
    | 'lineWidthMinPixels'
    | 'lineWidthMaxPixels'
    | 'lineJointRounded'
    | 'lineMiterLimit'
    | 'lineCapRounded'
    | 'lineBillboard'
    | 'extruded'
    | 'wireframe'
    | '_full3d'
    | 'elevationScale'
    | 'pointRadiusUnits'
    | 'pointRadiusScale'
    | 'pointRadiusMinPixels'
    | 'pointRadiusMaxPixels'
    | 'pointAntialiasing'
    | 'pointBillboard'
    | 'iconSizeUnits'
    | 'iconSizeScale'
    | 'iconSizeMinPixels'
    | 'iconSizeMaxPixels'
    | 'iconBillboard'
    | 'iconAlphaCutoff'
    | 'textSizeUnits'
    | 'textSizeScale'
    | 'textSizeMinPixels'
    | 'textSizeMaxPixels'
    | 'textFontFamily'
    | 'textFontWeight'
    | 'textLineHeight'
    | 'textMaxWidth'
    | 'textWordBreak'
    | 'textBackground'
    | 'textBackgroundPadding'
    | 'textOutlineColor'
    | 'textOutlineWidth'
    | 'textBillboard'
  > & {
    '@@type': 'GeoJsonLayer';
    iconAtlas?: string;
    iconMapping?: Record<string, any>;
    getFillColor?: ColorValue | AccessorFunction;
    getLineColor?: ColorValue | AccessorFunction;
    getLineWidth?: number | AccessorFunction;
    getElevation?: number | AccessorFunction;
    getPointRadius?: number | AccessorFunction;
    getIcon?: string | Record<string, any> | AccessorFunction;
    getIconSize?: number | AccessorFunction;
    getIconColor?: ColorValue | AccessorFunction;
    getIconAngle?: number | AccessorFunction;
    getIconPixelOffset?: number[] | AccessorFunction;
    getText?: string | AccessorFunction;
    getTextColor?: ColorValue | AccessorFunction;
    getTextAngle?: number | AccessorFunction;
    getTextSize?: number | AccessorFunction;
    getTextAnchor?: string | AccessorFunction;
    getTextAlignmentBaseline?: string | AccessorFunction;
    getTextPixelOffset?: number[] | AccessorFunction;
    getTextBackgroundColor?: ColorValue | AccessorFunction;
    getTextBorderColor?: ColorValue | AccessorFunction;
    getTextBorderWidth?: number | AccessorFunction;
  };

type ScreenGridLayer = BaseLayerProps &
  Pick<
    ScreenGridLayerProps,
    | 'cellSizePixels'
    | 'cellMarginPixels'
    | 'colorDomain'
    | 'colorRange'
    | 'colorScaleType'
    | 'gpuAggregation'
    | 'aggregation'
  > & {
    '@@type': 'ScreenGridLayer';
    getPosition?: PositionValue | AccessorFunction;
    getWeight?: number | AccessorFunction;
  };

type HexagonLayer = BaseLayerProps &
  Pick<
    HexagonLayerProps,
    | 'radius'
    | 'colorDomain'
    | 'colorRange'
    | 'coverage'
    | 'elevationDomain'
    | 'elevationRange'
    | 'elevationScale'
    | 'extruded'
    | 'upperPercentile'
    | 'lowerPercentile'
    | 'elevationUpperPercentile'
    | 'elevationLowerPercentile'
    | 'colorScaleType'
    | 'elevationScaleType'
    | 'colorAggregation'
    | 'elevationAggregation'
    | 'gpuAggregation'
  > & {
    '@@type': 'HexagonLayer';
    getPosition?: PositionValue | AccessorFunction;
    getColorWeight?: number | AccessorFunction;
    getElevationWeight?: number | AccessorFunction;
  };

type ContourLayer = BaseLayerProps &
  Pick<
    ContourLayerProps,
    'cellSize' | 'gridOrigin' | 'gpuAggregation' | 'aggregation' | 'contours' | 'zOffset'
  > & {
    '@@type': 'ContourLayer';
    getPosition?: PositionValue | AccessorFunction;
    getWeight?: number | AccessorFunction;
  };

type GridLayer = BaseLayerProps &
  Pick<
    GridLayerProps,
    | 'cellSize'
    | 'colorDomain'
    | 'colorRange'
    | 'coverage'
    | 'elevationDomain'
    | 'elevationRange'
    | 'elevationScale'
    | 'extruded'
    | 'upperPercentile'
    | 'lowerPercentile'
    | 'elevationUpperPercentile'
    | 'elevationLowerPercentile'
    | 'colorScaleType'
    | 'elevationScaleType'
    | 'colorAggregation'
    | 'elevationAggregation'
    | 'gpuAggregation'
  > & {
    '@@type': 'GridLayer';
    getPosition?: PositionValue | AccessorFunction;
    getColorWeight?: number | AccessorFunction;
    getElevationWeight?: number | AccessorFunction;
  };

type HeatmapLayer = BaseLayerProps &
  Pick<
    HeatmapLayerProps,
    | 'radiusPixels'
    | 'colorRange'
    | 'intensity'
    | 'threshold'
    | 'colorDomain'
    | 'aggregation'
    | 'weightsTextureSize'
    | 'debounceTimeout'
  > & {
    '@@type': 'HeatmapLayer';
    getPosition?: PositionValue | AccessorFunction;
    getWeight?: number | AccessorFunction;
  };

type WMSLayer = Omit<BaseLayerProps, 'data'> &
  Pick<WMSLayerProps, 'serviceType' | 'layers' | 'srs'> & {
    '@@type': '_WMSLayer';
  };

type TileLayer = Omit<BaseLayerProps, 'data'> &
  Pick<
    TileLayerProps,
    | 'extent'
    | 'tileSize'
    | 'maxZoom'
    | 'minZoom'
    | 'maxCacheSize'
    | 'maxCacheByteSize'
    | 'refinementStrategy'
    | 'zRange'
    | 'maxRequests'
    | 'debounceTime'
    | 'zoomOffset'
    | 'visibleMinZoom'
    | 'visibleMaxZoom'
  > & {
    '@@type': 'TileLayer';
    data?: any;
  };

type TripsLayer = Omit<PathLayer, '@@type'> &
  Pick<TripsLayerProps, 'fadeTrail' | 'trailLength' | 'currentTime'> & {
    '@@type': 'TripsLayer';
    getTimestamps?: number[] | AccessorFunction;
  };

type H3ClusterLayer = Omit<ColumnLayer, '@@type'> & {
  '@@type': 'H3ClusterLayer';
  getHexagons?: string[] | AccessorFunction;
};

type H3HexagonLayer = Omit<ColumnLayer, '@@type'> &
  Pick<H3HexagonLayerProps, 'highPrecision' | 'coverage' | 'centerHexagon' | 'extruded'> & {
    '@@type': 'H3HexagonLayer';
    getHexagon?: string | AccessorFunction;
  };

type Tile3DLayer = Omit<BaseLayerProps, 'data'> &
  Pick<Tile3DLayerProps, 'pointSize'> & {
    '@@type': 'Tile3DLayer';
    data?: any;
    getPointColor?: ColorValue | AccessorFunction;
  };

type TerrainLayer = Omit<BaseLayerProps, 'data'> &
  Pick<TerrainLayerProps, 'meshMaxError' | 'bounds' | 'color' | 'wireframe' | 'workerUrl'> & {
    '@@type': 'TerrainLayer';
    texture?: string;
  };

type MVTLayer = Omit<TileLayer, '@@type'> &
  Pick<MVTLayerProps, 'uniqueIdProperty' | 'highlightedFeatureId' | 'binary'> & {
    '@@type': 'MVTLayer';
  };

type SimpleMeshLayer = BaseLayerProps &
  Pick<SimpleMeshLayerProps, 'sizeScale' | '_instanced' | 'wireframe'> & {
    '@@type': 'SimpleMeshLayer';
    texture?: string;
    getPosition?: PositionValue | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getOrientation?: number[] | AccessorFunction;
    getScale?: number[] | AccessorFunction;
    getTranslation?: number[] | AccessorFunction;
    getTransformMatrix?: number[] | AccessorFunction;
  };

type ScenegraphLayer = BaseLayerProps &
  Pick<ScenegraphLayerProps, '_lighting' | 'sizeScale' | 'sizeMinPixels' | 'sizeMaxPixels'> & {
    '@@type': 'ScenegraphLayer';
    getPosition?: PositionValue | AccessorFunction;
    getColor?: ColorValue | AccessorFunction;
    getOrientation?: number[] | AccessorFunction;
    getScale?: number[] | AccessorFunction;
    getTranslation?: number[] | AccessorFunction;
    getTransformMatrix?: number[] | AccessorFunction;
  };

type AnyLayer =
  | ScatterplotLayer
  | LineLayer
  | ArcLayer
  | GreatCircleLayer
  | TextLayer
  | BitmapLayer
  | IconLayer
  | PointCloudLayer
  | ColumnLayer
  | GridCellLayer
  | PathLayer
  | PolygonLayer
  | GeoJsonLayer
  | SolidPolygonLayer
  | ScreenGridLayer
  | HexagonLayer
  | ContourLayer
  | GridLayer
  | HeatmapLayer
  | A5Layer
  | WMSLayer
  | S2Layer
  | QuadkeyLayer
  | TileLayer
  | TripsLayer
  | H3ClusterLayer
  | H3HexagonLayer
  | Tile3DLayer
  | TerrainLayer
  | MVTLayer
  | GeohashLayer
  | GeoCellLayer
  | SimpleMeshLayer
  | ScenegraphLayer;

type BaseWidgetProps = Pick<ZoomWidgetProps, 'id' | 'className' | 'viewId' | 'placement'> & {
  style?: CSSStyleSheet;
};

type ZoomWidget = BaseWidgetProps &
  Pick<
    ZoomWidgetProps,
    'orientation' | 'transitionDuration' | 'zoomAxis' | 'zoomInLabel' | 'zoomOutLabel'
  > & {
    '@@type': 'ZoomWidget';
  };

type ResetViewWidget = BaseWidgetProps &
  Pick<ResetViewWidgetProps, 'label'> & {
    '@@type': 'ResetViewWidget';
    initialViewState?: AnyViewState | Record<string, AnyViewState>;
  };

type GimbalWidget = BaseWidgetProps &
  Pick<GimbalWidgetProps, 'label' | 'strokeWidth' | 'transitionDuration'> & {
    '@@type': 'GimbalWidget';
  };

type CompassWidget = BaseWidgetProps &
  Pick<CompassWidgetProps, 'label' | 'transitionDuration'> & {
    '@@type': 'CompassWidget';
  };

type ScaleWidget = BaseWidgetProps &
  Pick<ScaleWidgetProps, 'label'> & {
    '@@type': '_ScaleWidget';
  };

type GeocoderWidget = BaseWidgetProps &
  Pick<
    GeocoderWidgetProps,
    'label' | 'transitionDuration' | 'geocoder' | 'apiKey' | '_geolocation'
  > & {
    '@@type': '_GeocoderWidget';
  };

type FullscreenWidget = BaseWidgetProps &
  Pick<FullscreenWidgetProps, 'enterLabel' | 'exitLabel'> & {
    '@@type': 'FullscreenWidget';
  };

type SplitterWidget = Omit<BaseWidgetProps, 'viewId' | 'placement'> &
  Pick<SplitterWidgetProps, 'viewLayout'> & {
    '@@type': '_SplitterWidget';
    viewLayout: SplitterViewLayoutValue;
  };

type InfoWidget = Omit<BaseWidgetProps, 'placement'> &
  Pick<InfoWidgetProps, 'mode' | 'placement' | 'offset' | 'arrow'> & {
    '@@type': 'InfoWidget';
  };

type PopupWidget = Omit<BaseWidgetProps, 'placement'> &
  Pick<
    PopupWidgetProps,
    | 'defaultIsOpen'
    | 'position'
    | 'placement'
    | 'offset'
    | 'arrow'
    | 'closeButton'
    | 'closeOnClickOutside'
  > & {
    '@@type': 'PopupWidget';
    marker?: PopupContentValue | null;
    content: string | PopupContentValue;
  };

type ContextMenuWidget = Omit<BaseWidgetProps, 'placement'> &
  Pick<ContextMenuWidgetProps, 'placement' | 'offset' | 'arrow'> & {
    '@@type': 'ContextMenuWidget';
    menuItems?: MenuItemValue[];
  };

type ScrollbarWidget = BaseWidgetProps &
  Pick<
    ScrollbarWidgetProps,
    | 'orientation'
    | 'stepSize'
    | 'pageSize'
    | 'startButtonAriaLabel'
    | 'endButtonAriaLabel'
    | 'captureWheel'
  > & {
    '@@type': 'ScrollbarWidget';
    contentBounds?: ContentBoundsValue | null;
    decorations?: ScrollbarDecorationValue[];
  };

type IconWidget = BaseWidgetProps &
  Pick<IconWidgetProps, 'icon' | 'label' | 'color'> & {
    '@@type': 'IconWidget';
  };

type ToggleWidget = BaseWidgetProps &
  Pick<
    ToggleWidgetProps,
    'initialChecked' | 'icon' | 'onIcon' | 'label' | 'onLabel' | 'color' | 'onColor'
  > & {
    '@@type': 'ToggleWidget';
  };

type SelectorWidget = BaseWidgetProps &
  Pick<SelectorWidgetProps, 'initialValue'> & {
    '@@type': 'SelectorWidget';
    options: SelectorOptionValue[];
  };

type TimelineWidget = BaseWidgetProps &
  Pick<
    TimelineWidgetProps,
    'timeRange' | 'step' | 'initialTime' | 'time' | 'autoPlay' | 'loop' | 'playInterval' | 'playing'
  > & {
    '@@type': '_TimelineWidget';
  };

type ScreenshotWidget = BaseWidgetProps &
  Pick<ScreenshotWidgetProps, 'label' | 'filename' | 'imageFormat'> & {
    '@@type': 'ScreenshotWidget';
  };

type ThemeWidget = BaseWidgetProps &
  Pick<ThemeWidgetProps, 'lightModeLabel' | 'darkModeLabel' | 'initialThemeMode' | 'themeMode'> & {
    '@@type': 'ThemeWidget';
  };

type LoadingWidget = BaseWidgetProps &
  Pick<LoadingWidgetProps, 'label'> & {
    '@@type': 'LoadingWidget';
  };

type StatsWidget = BaseWidgetProps &
  Pick<
    StatsWidgetProps,
    'type' | 'initialExpanded' | 'title' | 'framesPerUpdate' | 'resetOnUpdate' | 'expanded'
  > & {
    '@@type': '_StatsWidget';
  };

type AnyWidget =
  | ZoomWidget
  | ResetViewWidget
  | GimbalWidget
  | CompassWidget
  | ScaleWidget
  | GeocoderWidget
  | FullscreenWidget
  | SplitterWidget
  | InfoWidget
  | PopupWidget
  | ContextMenuWidget
  | ScrollbarWidget
  | IconWidget
  | ToggleWidget
  | SelectorWidget
  | TimelineWidget
  | ScreenshotWidget
  | ThemeWidget
  | LoadingWidget
  | StatsWidget;

export type DeckJson = Pick<
  DeckProps,
  | 'id'
  | 'width'
  | 'height'
  | 'useDevicePixels'
  | 'pickingRadius'
  | 'parameters'
  | 'touchAction'
  | 'controller'
  | 'eventRecognizerOptions'
> & {
  style?: CSSStyleSheet;
  viewState?: AnyViewState | Record<string, AnyViewState>;
  initialViewState?: AnyViewState | Record<string, AnyViewState>;
  views?: AnyView[];
  layers?: AnyLayer[];
  widgets?: AnyWidget[];
};

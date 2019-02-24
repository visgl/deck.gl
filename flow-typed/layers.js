declare const LayerPropTypes = {
  fp64: boolean,
  getPosition: accessor,
  getColor: accessor,
  elevationScale: number,
  extruded: boolean
}

declare type accessor = function | number | object | string | any

//arc-layer
declare const ArcLayerPropTypes extends LayerPropTypes = {
  fp64: false,

  getSourcePosition: accessor,
  getTargetPosition: accessor,
  getSourceColor: accessor,
  getTargetColor: accessor,
  getWidth: accessor,
  widthScale: number,
  widthMinPixels: number,
  widthMaxPixels: number,

  // deprecated
  strokeWidth: {deprecatedFor: 'getStrokeWidth'},
  getStrokeWidth: {deprecatedFor: 'getWidth'}
};

declare const instanceSourceColors: GL.UNSIGNED_BYTE
declare const instanceTargetColors: GL.UNSIGNED_BYTE


//contour-layer
declare const ContourLayerPropTypes extends LayerPropTypes = {
  // grid aggregation
  cellSize: number,
  getPosition: accessor,
  getWeight: accessor,

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],

  fp64: false,
  zOffset: 0.005
};


//geo-json layer
declare const GeoJsonLeyerPropTypes extends LayerPropTypes = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,

  elevationScale: 1,

  pointRadiusScale: 1,
  pointRadiusMinPixels: 0, //  min point radius in pixels
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels

  lineDashJustified: false,
  fp64: false,

  // Line and polygon outline color
  getLineColor: accessor,
  // Point and polygon fill color
  getFillColor: accessor,
  // Point radius
  getRadius: accessor,
  // Line and polygon outline accessors
  getLineWidth: accessor,
  // Line dash array accessor
  getLineDashArray: accessor,
  // Polygon extrusion accessor
  getElevation: accessor,
  // Optional settings for 'lighting' shader module
  lightSettings: {}
};


//grid-cell-layer
declare const GridCellLayerPropTypes extends LayerPropTypes = {
  cellSize: number,
  coverage: number,
  elevationScale: number,
  extruded: true,
  fp64: false,

  getPosition: accessor,
  getElevation: accessor,
  getColor: accessor,

  lightSettings: {}
};


declare const instanceColors: GL.UNSIGNED_BYTE


//grid-layer
declare const GridLayerPropTypes extends LayerPropTypes = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: accessor,
  lowerPercentile: number,
  upperPercentile: number,
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: accessor,
  elevationLowerPercentile: number,
  elevationUpperPercentile: number,
  elevationScale: 1,
  onSetElevationDomain: nop,

  // grid
  cellSize: number,
  coverage: number,
  getPosition: accessor,
  extruded: false,
  fp64: false,

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};


//hexagon-cell-layer
declare const HexagonLayerCellPropTypes extends LayerPropTypes = {
  hexagonVertices: null,
  radius: number,
  angle: number,
  coverage: number,
  elevationScale: number,
  extruded: true,
  fp64: false,

  getCentroid: accessor,
  getColor: accessor,
  getElevation: accessor,

  lightSettings: {}
};

declare const instanceColors: GL.UNSIGNED_BYTE


//hexagon-layer
declare const HexagonLayerPropTypes extends LayerPropTypes = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: accessor,
  lowerPercentile: number,
  upperPercentile: number,
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: accessor,
  elevationLowerPercentile: number,
  elevationUpperPercentile: number,
  elevationScale: number,
  onSetElevationDomain: nop,

  radius: number,
  coverage: number,
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: accessor,
  fp64: false,
  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

//icon-layer
declare const IconLayerPropTypes extends LayerPropTypes = {
  iconAtlas: null | string,
  iconMapping: {type: 'object', value: {}, async: true},
  sizeScale: number,
  fp64: false,

  getPosition: accessor,
  getIcon: accessor,
  getColor: accessor,
  getSize: accessor,
  getAngle: accessor,
};

declare const instanceColorModes: GL.UNSIGNED_BYTE
declare const instanceColors: GL.UNSIGNED_BYTE


//line-layer
declare const LineLayerPropTypes extends LayerPropTypes = {
  fp64: false,

  getSourcePosition: accessor,
  getTargetPosition: accessor,
  getColor: accessor,
  getStrokeWidth: accessor,

  // deprecated
  strokeWidth: {deprecatedFor: 'getStrokeWidth'}
};

declare const instanceColors: GL.UNSIGNED_BYTE


//path-layer
declare const PathLayerPropTypes extends LayerPropTypes = {
  widthScale: number,
  widthMinPixels: number,
  widthMaxPixels: number,
  rounded: false,
  miterLimit: number,
  fp64: false,
  dashJustified: false,

  getPath: accessor,
  getColor: accessor,
  getWidth: accessor,
  getDashArray: accessor,
};

declare const instanceColors: GL.UNSIGNED_BYTE,
declare const instancePickingColors: GL.UNSIGNED_BYTE


//point-cloud-layer
declare const PointCloudLayerPropTypes extends LayerPropTypes = {
  radiusPixels: number,
  fp64: false,

  getPosition: accessor,
  getNormal: accessor,
  getColor: accessor,

  lightSettings: {}
};

declare const instanceColors: GL.UNSIGNED_BYTE


//polygon-layer
declare const PolygonLayerPropTypes extends LayerPropTypes = {
  stroked: true,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  lineDashJustified: false,
  fp64: false,

  getPolygon: accessor,
  // Polygon fill color
  getFillColor: accessor,
  // Point, line and polygon outline color
  getLineColor: accessor,
  // Line and polygon outline accessors
  getLineWidth: accessor,
  // Line dash array accessor
  getLineDashArray: accessor,
  // Polygon extrusion accessor
  getElevation: accessor,

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

//scatterplot-layer
declare const ScatterplotLayerPropTypes extends LayerPropTypes = {
  radiusScale: number,
  radiusMinPixels: number,
  radiusMaxPixels: number,
  lineWidthScale: number,
  lineWidthMinPixels: number,
  lineWidthMaxPixels: number,
  stroked: false,
  fp64: false,
  filled: true,

  getPosition: accessor,
  getRadius: accessor,
  getFillColor: accessor,
  getLineColor: accessor,
  getLineWidth: accessor,

  // deprecated
  strokeWidth: {deprecatedFor: 'getLineWidth'},
  outline: {deprecatedFor: 'stroked'},
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

instanceFillColors: GL.UNSIGNED_BYTE
instanceLineColors: GL.UNSIGNED_BYTE

//screen-grid-layer
declare const ScreenGridLayerPropTypes extends LayerPropTypes = {
  cellSizePixels: {value: 100, min: 1},
  cellMarginPixels: {value: 2, min: 0, max: 5},

  colorDomain: null,
  colorRange: defaultColorRange,

  getPosition: accessor,
  getWeight: accessor,

  gpuAggregation: true,
  aggregation: 'SUM'
};



//solid-polygon-layer
declare const SolidPolygonLayerPropTypes extends LayerPropTypes = {
  filled: true,
  // Whether to extrude
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,
  fp64: false,

  // elevation multiplier
  elevationScale: number,

  // Accessor for polygon geometry
  getPolygon: accessor,
  // Accessor for extrusion height
  getElevation: accessor,
  // Accessor for colors
  getFillColor: accessor,
  getLineColor: accessor,

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

vertexValid: GL.UNSIGNED_BYTE

fillColors: GL.UNSIGNED_BYTE

lineColors: GL.UNSIGNED_BYTE

pickingColors: GL.UNSIGNED_BYTE

//text-layer/multi-icon-layer
declare const MultiIconLayerPropTypes extends LayerPropTypes = {
  getShiftInQueue: accessor,
  getLengthOfQueue: accessor,
  // 1: left, 0: middle, -1: right
  getAnchorX: accessor,
  // 1: top, 0: center, -1: bottom
  getAnchorY: accessor,
  getPixelOffset: accessor,

  // object with the same pickingIndex will be picked when any one of them is being picked
  getPickingIndex: accessor,
};

//text-layer
declare const TextLayerPropTypes extends LayerPropTypes = {
  fp64: false,
  sizeScale: 1,

  characterSet: DEFAULT_CHAR_SET,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  fontSettings: {},

  getText: accessor,
  getPosition: accessor,
  getColor: accessor,
  getSize: accessor,
  getAngle: accessor,
  getTextAnchor: accessor,
  getAlignmentBaseline: accessor,
  getPixelOffset: accessor,
};

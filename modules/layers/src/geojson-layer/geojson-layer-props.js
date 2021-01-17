function createEmptyLayerProps() {
  return {
    points: {},
    lines: {},
    polygons: {},
    polygonsOutline: {}
  };
}

function getCoordinates(f) {
  return f.geometry.coordinates;
}

export function createLayerPropsFromFeatures(features, featuresDiff) {
  const layerProps = createEmptyLayerProps();
  const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = features;

  layerProps.points.data = pointFeatures;
  layerProps.points._dataDiff = featuresDiff.pointFeatures && (() => featuresDiff.pointFeatures);
  layerProps.points.getPosition = getCoordinates;

  layerProps.lines.data = lineFeatures;
  layerProps.lines._dataDiff = featuresDiff.lineFeatures && (() => featuresDiff.lineFeatures);
  layerProps.lines.getPath = getCoordinates;

  layerProps.polygons.data = polygonFeatures;
  layerProps.polygons._dataDiff =
    featuresDiff.polygonFeatures && (() => featuresDiff.polygonFeatures);
  layerProps.polygons.getPolygon = getCoordinates;

  layerProps.polygonsOutline.data = polygonOutlineFeatures;
  layerProps.polygonsOutline._dataDiff =
    featuresDiff.polygonOutlineFeatures && (() => featuresDiff.polygonOutlineFeatures);
  layerProps.polygonsOutline.getPath = getCoordinates;

  return layerProps;
}

export function createLayerPropsFromBinary(geojsonBinary) {
  const layerProps = createEmptyLayerProps();
  const {points, lines, polygons} = geojsonBinary;

  layerProps.points.data = {
    length: points.positions.value.length / points.positions.size,
    attributes: {
      getPosition: points.positions
    },
    properties: points.properties,
    numericProps: points.numericProps
  };

  layerProps.lines.data = {
    length: lines.pathIndices.value.length - 1,
    startIndices: lines.pathIndices.value,
    attributes: {
      getPath: lines.positions
    },
    properties: lines.properties,
    numericProps: lines.numericProps
  };
  layerProps.lines._pathType = 'open';

  layerProps.polygons.data = {
    length: polygons.polygonIndices.value.length - 1,
    startIndices: polygons.polygonIndices.value,
    attributes: {
      getPolygon: polygons.positions
    },
    properties: lines.properties,
    numericProps: lines.numericProps
  };
  layerProps.polygons._normalize = false;

  layerProps.polygonsOutline.data = {
    length: polygons.primitivePolygonIndices.value.length - 1,
    startIndices: polygons.primitivePolygonIndices.value,
    attributes: {
      getPath: polygons.positions
    },
    properties: lines.properties,
    numericProps: lines.numericProps
  };
  layerProps.polygonsOutline._pathType = 'open';

  return layerProps;
}

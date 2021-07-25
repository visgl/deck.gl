import {calculatePickingColors} from './geojson-binary';

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

export function createLayerPropsFromBinary(geojsonBinary, encodePickingColor) {
  const layerProps = createEmptyLayerProps();
  const {points, lines, polygons} = geojsonBinary;

  const customPickingColors = calculatePickingColors(geojsonBinary, encodePickingColor);

  layerProps.points.data = {
    length: points.positions.value.length / points.positions.size,
    attributes: {
      getPosition: points.positions,
      instancePickingColors: {
        size: 3,
        value: customPickingColors.points
      }
    },
    properties: points.properties,
    numericProps: points.numericProps,
    featureIds: points.featureIds
  };

  layerProps.lines.data = {
    length: lines.pathIndices.value.length - 1,
    startIndices: lines.pathIndices.value,
    attributes: {
      getPath: lines.positions,
      instancePickingColors: {
        size: 3,
        value: customPickingColors.lines
      }
    },
    properties: lines.properties,
    numericProps: lines.numericProps,
    featureIds: lines.featureIds
  };
  layerProps.lines._pathType = 'open';

  layerProps.polygons.data = {
    length: polygons.polygonIndices.value.length - 1,
    startIndices: polygons.polygonIndices.value,
    attributes: {
      getPolygon: polygons.positions,
      pickingColors: {
        size: 3,
        value: customPickingColors.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygons._normalize = false;
  if (polygons.triangles) {
    layerProps.polygons.data.attributes.indices = polygons.triangles.value;
  }

  layerProps.polygonsOutline.data = {
    length: polygons.primitivePolygonIndices.value.length - 1,
    startIndices: polygons.primitivePolygonIndices.value,
    attributes: {
      getPath: polygons.positions,
      instancePickingColors: {
        size: 3,
        value: customPickingColors.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygonsOutline._pathType = 'open';

  return layerProps;
}

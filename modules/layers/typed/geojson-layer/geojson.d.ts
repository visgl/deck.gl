import type {Feature, GeoJSON, GeoJsonGeometryTypes, LineString, Point, Polygon} from 'geojson';
export declare type SeparatedGeometries = {
  pointFeatures: {
    geometry: Point;
  }[];
  lineFeatures: {
    geometry: LineString;
  }[];
  polygonFeatures: {
    geometry: Polygon;
  }[];
  polygonOutlineFeatures: {
    geometry: LineString;
  }[];
};
/**
 * "Normalizes" complete or partial GeoJSON data into iterable list of features
 * Can accept GeoJSON geometry or "Feature", "FeatureCollection" in addition
 * to plain arrays and iterables.
 * Works by extracting the feature array or wrapping single objects in an array,
 * so that subsequent code can simply iterate over features.
 *
 * @param {object} geojson - geojson data
 * @param {Object|Array} data - geojson object (FeatureCollection, Feature or
 *  Geometry) or array of features
 * @return {Array|"iteratable"} - iterable list of features
 */
export declare function getGeojsonFeatures(geojson: GeoJSON): Feature[];
export declare function separateGeojsonFeatures(
  features: Feature[],
  wrapFeature: <T>(row: T, sourceObject: any, sourceObjectIndex: number) => T,
  dataRange?: {
    startRow?: number;
    endRow?: number;
  }
): SeparatedGeometries;
export declare function validateGeometry(type: GeoJsonGeometryTypes, coordinates: any): boolean;
// # sourceMappingURL=geojson.d.ts.map

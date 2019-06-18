// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { experimental } from '../../core';
var get = experimental.get;

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

export function getGeojsonFeatures(geojson) {
  // If array, assume this is a list of features
  if (Array.isArray(geojson)) {
    return geojson;
  }

  var type = get(geojson, 'type');
  switch (type) {
    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
    case 'GeometryCollection':
      // Wrap the geometry object in a 'Feature' object and wrap in an array
      return [{ type: 'Feature', properties: {}, geometry: geojson }];
    case 'Feature':
      // Wrap the feature in a 'Features' array
      return [geojson];
    case 'FeatureCollection':
      // Just return the 'Features' array from the collection
      return get(geojson, 'features');
    default:
      throw new Error('Unknown geojson type');
  }
}

// Linearize
export function separateGeojsonFeatures(features) {
  var pointFeatures = [];
  var lineFeatures = [];
  var polygonFeatures = [];
  var polygonOutlineFeatures = [];

  features.forEach(function (feature) {
    var type = get(feature, 'geometry.type');
    var coordinates = get(feature, 'geometry.coordinates');
    var properties = get(feature, 'properties');
    switch (type) {
      case 'Point':
        pointFeatures.push(feature);
        break;
      case 'MultiPoint':
        // TODO - split multipoints
        coordinates.forEach(function (point) {
          pointFeatures.push({ geometry: { coordinates: point }, properties: properties, feature: feature });
        });
        break;
      case 'LineString':
        lineFeatures.push(feature);
        break;
      case 'MultiLineString':
        // Break multilinestrings into multiple lines with same properties
        coordinates.forEach(function (path) {
          lineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
        });
        break;
      case 'Polygon':
        polygonFeatures.push(feature);
        // Break polygon into multiple lines with same properties
        coordinates.forEach(function (path) {
          polygonOutlineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
        });
        break;
      case 'MultiPolygon':
        // Break multipolygons into multiple polygons with same properties
        coordinates.forEach(function (polygon) {
          polygonFeatures.push({ geometry: { coordinates: polygon }, properties: properties, feature: feature });
          // Break polygon into multiple lines with same properties
          polygon.forEach(function (path) {
            polygonOutlineFeatures.push({ geometry: { coordinates: path }, properties: properties, feature: feature });
          });
        });
        break;
      // Not yet supported
      case 'GeometryCollection':
      default:
        throw new Error('GeoJsonLayer: ' + type + ' not supported.');
    }
  });

  return {
    pointFeatures: pointFeatures,
    lineFeatures: lineFeatures,
    polygonFeatures: polygonFeatures,
    polygonOutlineFeatures: polygonOutlineFeatures
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9nZW9qc29uLWxheWVyL2dlb2pzb24uanMiXSwibmFtZXMiOlsiZXhwZXJpbWVudGFsIiwiZ2V0IiwiZ2V0R2VvanNvbkZlYXR1cmVzIiwiZ2VvanNvbiIsIkFycmF5IiwiaXNBcnJheSIsInR5cGUiLCJwcm9wZXJ0aWVzIiwiZ2VvbWV0cnkiLCJFcnJvciIsInNlcGFyYXRlR2VvanNvbkZlYXR1cmVzIiwiZmVhdHVyZXMiLCJwb2ludEZlYXR1cmVzIiwibGluZUZlYXR1cmVzIiwicG9seWdvbkZlYXR1cmVzIiwicG9seWdvbk91dGxpbmVGZWF0dXJlcyIsImZvckVhY2giLCJmZWF0dXJlIiwiY29vcmRpbmF0ZXMiLCJwdXNoIiwicG9pbnQiLCJwYXRoIiwicG9seWdvbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsWUFBUixRQUEyQixZQUEzQjtJQUNPQyxHLEdBQU9ELFksQ0FBUEMsRzs7QUFFUDs7Ozs7Ozs7Ozs7OztBQVlBLE9BQU8sU0FBU0Msa0JBQVQsQ0FBNEJDLE9BQTVCLEVBQXFDO0FBQzFDO0FBQ0EsTUFBSUMsTUFBTUMsT0FBTixDQUFjRixPQUFkLENBQUosRUFBNEI7QUFDMUIsV0FBT0EsT0FBUDtBQUNEOztBQUVELE1BQU1HLE9BQU9MLElBQUlFLE9BQUosRUFBYSxNQUFiLENBQWI7QUFDQSxVQUFRRyxJQUFSO0FBQ0EsU0FBSyxPQUFMO0FBQ0EsU0FBSyxZQUFMO0FBQ0EsU0FBSyxZQUFMO0FBQ0EsU0FBSyxpQkFBTDtBQUNBLFNBQUssU0FBTDtBQUNBLFNBQUssY0FBTDtBQUNBLFNBQUssb0JBQUw7QUFDRTtBQUNBLGFBQU8sQ0FDTCxFQUFDQSxNQUFNLFNBQVAsRUFBa0JDLFlBQVksRUFBOUIsRUFBa0NDLFVBQVVMLE9BQTVDLEVBREssQ0FBUDtBQUdGLFNBQUssU0FBTDtBQUNFO0FBQ0EsYUFBTyxDQUFDQSxPQUFELENBQVA7QUFDRixTQUFLLG1CQUFMO0FBQ0U7QUFDQSxhQUFPRixJQUFJRSxPQUFKLEVBQWEsVUFBYixDQUFQO0FBQ0Y7QUFDRSxZQUFNLElBQUlNLEtBQUosQ0FBVSxzQkFBVixDQUFOO0FBbkJGO0FBcUJEOztBQUVEO0FBQ0EsT0FBTyxTQUFTQyx1QkFBVCxDQUFpQ0MsUUFBakMsRUFBMkM7QUFDaEQsTUFBTUMsZ0JBQWdCLEVBQXRCO0FBQ0EsTUFBTUMsZUFBZSxFQUFyQjtBQUNBLE1BQU1DLGtCQUFrQixFQUF4QjtBQUNBLE1BQU1DLHlCQUF5QixFQUEvQjs7QUFFQUosV0FBU0ssT0FBVCxDQUFpQixtQkFBVztBQUMxQixRQUFNVixPQUFPTCxJQUFJZ0IsT0FBSixFQUFhLGVBQWIsQ0FBYjtBQUNBLFFBQU1DLGNBQWNqQixJQUFJZ0IsT0FBSixFQUFhLHNCQUFiLENBQXBCO0FBQ0EsUUFBTVYsYUFBYU4sSUFBSWdCLE9BQUosRUFBYSxZQUFiLENBQW5CO0FBQ0EsWUFBUVgsSUFBUjtBQUNBLFdBQUssT0FBTDtBQUNFTSxzQkFBY08sSUFBZCxDQUFtQkYsT0FBbkI7QUFDQTtBQUNGLFdBQUssWUFBTDtBQUNFO0FBQ0FDLG9CQUFZRixPQUFaLENBQW9CLGlCQUFTO0FBQzNCSix3QkFBY08sSUFBZCxDQUFtQixFQUFDWCxVQUFVLEVBQUNVLGFBQWFFLEtBQWQsRUFBWCxFQUFpQ2Isc0JBQWpDLEVBQTZDVSxnQkFBN0MsRUFBbkI7QUFDRCxTQUZEO0FBR0E7QUFDRixXQUFLLFlBQUw7QUFDRUoscUJBQWFNLElBQWIsQ0FBa0JGLE9BQWxCO0FBQ0E7QUFDRixXQUFLLGlCQUFMO0FBQ0U7QUFDQUMsb0JBQVlGLE9BQVosQ0FBb0IsZ0JBQVE7QUFDMUJILHVCQUFhTSxJQUFiLENBQWtCLEVBQUNYLFVBQVUsRUFBQ1UsYUFBYUcsSUFBZCxFQUFYLEVBQWdDZCxzQkFBaEMsRUFBNENVLGdCQUE1QyxFQUFsQjtBQUNELFNBRkQ7QUFHQTtBQUNGLFdBQUssU0FBTDtBQUNFSCx3QkFBZ0JLLElBQWhCLENBQXFCRixPQUFyQjtBQUNBO0FBQ0FDLG9CQUFZRixPQUFaLENBQW9CLGdCQUFRO0FBQzFCRCxpQ0FBdUJJLElBQXZCLENBQTRCLEVBQUNYLFVBQVUsRUFBQ1UsYUFBYUcsSUFBZCxFQUFYLEVBQWdDZCxzQkFBaEMsRUFBNENVLGdCQUE1QyxFQUE1QjtBQUNELFNBRkQ7QUFHQTtBQUNGLFdBQUssY0FBTDtBQUNFO0FBQ0FDLG9CQUFZRixPQUFaLENBQW9CLG1CQUFXO0FBQzdCRiwwQkFBZ0JLLElBQWhCLENBQXFCLEVBQUNYLFVBQVUsRUFBQ1UsYUFBYUksT0FBZCxFQUFYLEVBQW1DZixzQkFBbkMsRUFBK0NVLGdCQUEvQyxFQUFyQjtBQUNBO0FBQ0FLLGtCQUFRTixPQUFSLENBQWdCLGdCQUFRO0FBQ3RCRCxtQ0FBdUJJLElBQXZCLENBQTRCLEVBQUNYLFVBQVUsRUFBQ1UsYUFBYUcsSUFBZCxFQUFYLEVBQWdDZCxzQkFBaEMsRUFBNENVLGdCQUE1QyxFQUE1QjtBQUNELFdBRkQ7QUFHRCxTQU5EO0FBT0E7QUFDQTtBQUNGLFdBQUssb0JBQUw7QUFDQTtBQUNFLGNBQU0sSUFBSVIsS0FBSixvQkFBMkJILElBQTNCLHFCQUFOO0FBdkNGO0FBeUNELEdBN0NEOztBQStDQSxTQUFPO0FBQ0xNLGdDQURLO0FBRUxDLDhCQUZLO0FBR0xDLG9DQUhLO0FBSUxDO0FBSkssR0FBUDtBQU1EIiwiZmlsZSI6Imdlb2pzb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2dldH0gPSBleHBlcmltZW50YWw7XG5cbi8qKlxuICogXCJOb3JtYWxpemVzXCIgY29tcGxldGUgb3IgcGFydGlhbCBHZW9KU09OIGRhdGEgaW50byBpdGVyYWJsZSBsaXN0IG9mIGZlYXR1cmVzXG4gKiBDYW4gYWNjZXB0IEdlb0pTT04gZ2VvbWV0cnkgb3IgXCJGZWF0dXJlXCIsIFwiRmVhdHVyZUNvbGxlY3Rpb25cIiBpbiBhZGRpdGlvblxuICogdG8gcGxhaW4gYXJyYXlzIGFuZCBpdGVyYWJsZXMuXG4gKiBXb3JrcyBieSBleHRyYWN0aW5nIHRoZSBmZWF0dXJlIGFycmF5IG9yIHdyYXBwaW5nIHNpbmdsZSBvYmplY3RzIGluIGFuIGFycmF5LFxuICogc28gdGhhdCBzdWJzZXF1ZW50IGNvZGUgY2FuIHNpbXBseSBpdGVyYXRlIG92ZXIgZmVhdHVyZXMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGdlb2pzb24gLSBnZW9qc29uIGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBkYXRhIC0gZ2VvanNvbiBvYmplY3QgKEZlYXR1cmVDb2xsZWN0aW9uLCBGZWF0dXJlIG9yXG4gKiAgR2VvbWV0cnkpIG9yIGFycmF5IG9mIGZlYXR1cmVzXG4gKiBAcmV0dXJuIHtBcnJheXxcIml0ZXJhdGFibGVcIn0gLSBpdGVyYWJsZSBsaXN0IG9mIGZlYXR1cmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHZW9qc29uRmVhdHVyZXMoZ2VvanNvbikge1xuICAvLyBJZiBhcnJheSwgYXNzdW1lIHRoaXMgaXMgYSBsaXN0IG9mIGZlYXR1cmVzXG4gIGlmIChBcnJheS5pc0FycmF5KGdlb2pzb24pKSB7XG4gICAgcmV0dXJuIGdlb2pzb247XG4gIH1cblxuICBjb25zdCB0eXBlID0gZ2V0KGdlb2pzb24sICd0eXBlJyk7XG4gIHN3aXRjaCAodHlwZSkge1xuICBjYXNlICdQb2ludCc6XG4gIGNhc2UgJ011bHRpUG9pbnQnOlxuICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgY2FzZSAnUG9seWdvbic6XG4gIGNhc2UgJ011bHRpUG9seWdvbic6XG4gIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgLy8gV3JhcCB0aGUgZ2VvbWV0cnkgb2JqZWN0IGluIGEgJ0ZlYXR1cmUnIG9iamVjdCBhbmQgd3JhcCBpbiBhbiBhcnJheVxuICAgIHJldHVybiBbXG4gICAgICB7dHlwZTogJ0ZlYXR1cmUnLCBwcm9wZXJ0aWVzOiB7fSwgZ2VvbWV0cnk6IGdlb2pzb259XG4gICAgXTtcbiAgY2FzZSAnRmVhdHVyZSc6XG4gICAgLy8gV3JhcCB0aGUgZmVhdHVyZSBpbiBhICdGZWF0dXJlcycgYXJyYXlcbiAgICByZXR1cm4gW2dlb2pzb25dO1xuICBjYXNlICdGZWF0dXJlQ29sbGVjdGlvbic6XG4gICAgLy8gSnVzdCByZXR1cm4gdGhlICdGZWF0dXJlcycgYXJyYXkgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgIHJldHVybiBnZXQoZ2VvanNvbiwgJ2ZlYXR1cmVzJyk7XG4gIGRlZmF1bHQ6XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGdlb2pzb24gdHlwZScpO1xuICB9XG59XG5cbi8vIExpbmVhcml6ZVxuZXhwb3J0IGZ1bmN0aW9uIHNlcGFyYXRlR2VvanNvbkZlYXR1cmVzKGZlYXR1cmVzKSB7XG4gIGNvbnN0IHBvaW50RmVhdHVyZXMgPSBbXTtcbiAgY29uc3QgbGluZUZlYXR1cmVzID0gW107XG4gIGNvbnN0IHBvbHlnb25GZWF0dXJlcyA9IFtdO1xuICBjb25zdCBwb2x5Z29uT3V0bGluZUZlYXR1cmVzID0gW107XG5cbiAgZmVhdHVyZXMuZm9yRWFjaChmZWF0dXJlID0+IHtcbiAgICBjb25zdCB0eXBlID0gZ2V0KGZlYXR1cmUsICdnZW9tZXRyeS50eXBlJyk7XG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBnZXQoZmVhdHVyZSwgJ2dlb21ldHJ5LmNvb3JkaW5hdGVzJyk7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IGdldChmZWF0dXJlLCAncHJvcGVydGllcycpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgIHBvaW50RmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9pbnQnOlxuICAgICAgLy8gVE9ETyAtIHNwbGl0IG11bHRpcG9pbnRzXG4gICAgICBjb29yZGluYXRlcy5mb3JFYWNoKHBvaW50ID0+IHtcbiAgICAgICAgcG9pbnRGZWF0dXJlcy5wdXNoKHtnZW9tZXRyeToge2Nvb3JkaW5hdGVzOiBwb2ludH0sIHByb3BlcnRpZXMsIGZlYXR1cmV9KTtcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICBsaW5lRmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6XG4gICAgICAvLyBCcmVhayBtdWx0aWxpbmVzdHJpbmdzIGludG8gbXVsdGlwbGUgbGluZXMgd2l0aCBzYW1lIHByb3BlcnRpZXNcbiAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICAgIGxpbmVGZWF0dXJlcy5wdXNoKHtnZW9tZXRyeToge2Nvb3JkaW5hdGVzOiBwYXRofSwgcHJvcGVydGllcywgZmVhdHVyZX0pO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQb2x5Z29uJzpcbiAgICAgIHBvbHlnb25GZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgICAgLy8gQnJlYWsgcG9seWdvbiBpbnRvIG11bHRpcGxlIGxpbmVzIHdpdGggc2FtZSBwcm9wZXJ0aWVzXG4gICAgICBjb29yZGluYXRlcy5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgICBwb2x5Z29uT3V0bGluZUZlYXR1cmVzLnB1c2goe2dlb21ldHJ5OiB7Y29vcmRpbmF0ZXM6IHBhdGh9LCBwcm9wZXJ0aWVzLCBmZWF0dXJlfSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9seWdvbic6XG4gICAgICAvLyBCcmVhayBtdWx0aXBvbHlnb25zIGludG8gbXVsdGlwbGUgcG9seWdvbnMgd2l0aCBzYW1lIHByb3BlcnRpZXNcbiAgICAgIGNvb3JkaW5hdGVzLmZvckVhY2gocG9seWdvbiA9PiB7XG4gICAgICAgIHBvbHlnb25GZWF0dXJlcy5wdXNoKHtnZW9tZXRyeToge2Nvb3JkaW5hdGVzOiBwb2x5Z29ufSwgcHJvcGVydGllcywgZmVhdHVyZX0pO1xuICAgICAgICAvLyBCcmVhayBwb2x5Z29uIGludG8gbXVsdGlwbGUgbGluZXMgd2l0aCBzYW1lIHByb3BlcnRpZXNcbiAgICAgICAgcG9seWdvbi5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgICAgIHBvbHlnb25PdXRsaW5lRmVhdHVyZXMucHVzaCh7Z2VvbWV0cnk6IHtjb29yZGluYXRlczogcGF0aH0sIHByb3BlcnRpZXMsIGZlYXR1cmV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgICAgLy8gTm90IHlldCBzdXBwb3J0ZWRcbiAgICBjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEdlb0pzb25MYXllcjogJHt0eXBlfSBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwb2ludEZlYXR1cmVzLFxuICAgIGxpbmVGZWF0dXJlcyxcbiAgICBwb2x5Z29uRmVhdHVyZXMsXG4gICAgcG9seWdvbk91dGxpbmVGZWF0dXJlc1xuICB9O1xufVxuIl19
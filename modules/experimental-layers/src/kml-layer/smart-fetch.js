import path from 'path';

import {csvParseRows} from 'd3-request';
import {KMLLoader} from 'loaders.gl';

export default function smartFetch(url) {
  /* global fetch */
  return fetch(url)
    .then(response => response.text())
    .then(text => smartParse(text, url));
}

function smartParse(text, url) {
  const extension = path.extname(url) || url;
  switch (extension) {
    case '.csv':
      return csvParseRows(text);

    case '.kml':
      const kml = KMLLoader.parseText(text);
      // TODO - confusing to modify KML?
      return postProcessKML(kml);

    case '.json':
    default:
      return JSON.parse(text);
  }
}

function postProcessKML(kml) {
  // Convert coordinates to [lng, lat, z] format
  for (const key in kml) {
    for (const item of kml[key]) {
      postProcessItem(item, key);
    }
  }
  return kml;
}

function postProcessItem(item) {
  if (item.coordinates && item.coordinates.length) {
    if (Array.isArray(item.coordinates[0])) {
      item.coordinates = item.coordinates.map(([lat, lng, z = 0]) => [lng, lat, z]);
    } else {
      // Marker coordinates are just a single coord (not an array of coords)
      const [lat, lng, z = 0] = item.coordinates;
      item.coordinates = [lng, lat, z];
    }
  }
}

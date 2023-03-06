importScripts('./util.js');
let result = [];
let count = 0;
let vertexCount = 0;

const ID_PATTERN = /(\w\w)(I|US|SR)(.*)/;

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    const parts = line.split('\x01');

    const match = parts[0].match(ID_PATTERN);
    const state = match[1];
    const type = match[2];
    const id = match[3];
    const name = parts[1];
    const length = decodeNumber(parts[2], 90, 32) / 1000;

    const coordinates = [];

    parts.slice(3).forEach(function (str) {
      const lineString = decodePolyline(str, 5);
      coordinates.push(lineString);
      count++;
      vertexCount += lineString.length;
    });

    result.push({
      type: 'Feature',
      geometry: {
        type: coordinates.length === 1 ? 'LineString' : 'MultiLineString',
        coordinates: coordinates.length === 1 ? coordinates[0] : coordinates
      },
      properties: {state, type, id, name, length}
    });
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({action: 'end'});
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: {count: count, vertexCount: vertexCount}
  });
  result = [];
}

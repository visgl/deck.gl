importScripts('./util.js');
const FLUSH_LIMIT = 20000;
let result = [];
let count = 0;
let triangleCount = 0;

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const parts = line.split('\x01');

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: parts.slice(1).map(function(str) {
          const coords = decodePolyline(str);
          triangleCount += coords.length * 3 - 2;
          coords.push(coords[0]);
          return [coords];
        })
      },
      properties: {
        height: decodeNumber(parts[0], 90, 32)
      }
    };

    result.push(feature);
    count++;

    if (result.length >= FLUSH_LIMIT) {
      flush();
    }
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({action: 'end'});
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: [{
      type: 'FeatureCollection',
      features: result
    }],
    meta: {buildings: count, triangles: triangleCount}
  });
  result = [];
}

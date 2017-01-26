importScripts('./util.js');
const FLUSH_LIMIT = 10000;
let result = [];
let index = 0;
let count = 0;
let vertexCount = 0;

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {

    line.split('\x01').forEach(function(str) {
      if (!str) {
        return;
      }

      const coords = decodePolyline(str);
      vertexCount += coords.length;
      coords.push(coords[0]);

      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: {
          value: index
        }
      };
      result.push(feature);
      count++;
    });

    index++;

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
    meta: {count, vertexCount}
  });
  result = [];
}

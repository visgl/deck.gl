importScripts('./util.js');
var FLUSH_LIMIT = 6000;
var result = [];
var count = 0;
var vertexCount = 0;

onmessage = function(e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) return;
    var parts = line.split('\x01');

    var feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: parts.slice(1).map(function(str) {
          var coords = decodePolyline(str);
          vertexCount += coords.length;
          return [coords];
        })
      },
      properties: {
        value: parts[0] * 1
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
    meta: {count: count, vertexCount: vertexCount}
  });
  result = [];
}

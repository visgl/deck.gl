importScripts('./util.js');
var FLUSH_LIMIT = 10000;
var result = [];
var index = 0;
var count = 0;
var vertexCount = 0;

onmessage = function(e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function(line) {

    line.split('\x01').forEach(function(str) {
      if (!str) return;

      var coords = decodePolyline(str);
      vertexCount += coords.length;
      coords.push(coords[0]);

      var feature = {
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
    meta: {count: count, vertexCount: vertexCount}
  });
  result = [];
}

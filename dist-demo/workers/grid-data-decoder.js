importScripts('./util.js');
var COORDINATE_PRECISION = 5;
var total = 0;

onmessage = function(e) {
  var lines = e.data.text.split('\n');
  var result = [];

  lines.forEach(function(line) {
    if (!line) return;
    var count = decodeNumber(line.slice(0, 2), 90, 32);
    var coords = decodePolyline(line.slice(2));
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      var p = { position: c };
      for (var j = 0; j < count; j++) {
        result.push(p);
        total++;
      }
    }
  });
  postMessage({
    action: 'add',
    data: result,
    meta: {count: total}
  });
};

importScripts('./util.js');
var result = [];
var flowCount = 0;

onmessage = function(e) {

  var lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) return;
    var parts = line.split('\x01');
    var f = {
      type: 'Feature',
      properties: {
        name: parts[0].slice(0, -2) + ', ' + parts[0].slice(-2),
        flows: decodeLinks(parts[1])
      },
      geometry: {
        type: 'MultiPolygon'
      }
    };

    result.push(f);

    var sumX = 0, sumY = 0, len = 0;
    f.geometry.coordinates = parts.slice(2).map(function(str) {
      var coords = decodePolyline(str);
      coords.forEach(function(c) {
        sumX += c[0];
        sumY += c[1];
        len++;
      });
      return [coords];
    });

    f.properties.centroid = [sumX / len, sumY / len, 0];
  });

  if (e.data.event === 'load') {
    result.forEach(function(f, i) {
      var flows = f.properties.flows;
      for (var toId in flows) {
        result[toId].properties.flows[i] = -flows[toId];
        flowCount++;
      }
    });

    postMessage({
      action: 'add',
      data: [{
        type: 'FeatureCollection',
        features: result
      }],
      meta: {
        count: result.length,
        flowCount: flowCount
      }
    });
    postMessage({action: 'end'});
  }
};

function decodeLinks(str) {
  var links = {};
  var tokens = str.split(/([\x28-\x5b]+)/);
  for (var i = 0; i < tokens.length - 1; i += 2) {
    var index = decodeNumber(tokens[i], 32, 93);
    var flow = decodeNumber(tokens[i + 1], 52, 40);
    links[index] = flow;
  }
  return links;
}

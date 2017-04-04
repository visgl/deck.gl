importScripts('./util.js');

const result = [];
let flowCount = 0;

onmessage = function(e) {

  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const parts = line.split('\x01');
    const f = {
      type: 'Feature',
      properties: {
        name: `${parts[0].slice(0, -2) }, ${ parts[0].slice(-2)}`,
        flows: decodeLinks(parts[1])
      },
      geometry: {
        type: 'MultiPolygon'
      }
    };

    result.push(f);

    let sumX = 0;
    let sumY = 0;
    let len = 0;

    f.geometry.coordinates = parts.slice(2).map(function(str) {
      const coords = decodePolyline(str);
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
      const flows = f.properties.flows;
      for (const toId in flows) {
        result[toId].properties.flows[i] = -flows[toId];
        flowCount++;
      }
    });

    postMessage({
      action: 'add',
      data: result,
      meta: {
        count: result.length,
        flowCount
      }
    });
    postMessage({action: 'end'});
  }
};

function decodeLinks(str) {
  const links = {};
  const tokens = str.split(/([\x28-\x5b]+)/);
  for (let i = 0; i < tokens.length - 1; i += 2) {
    const index = decodeNumber(tokens[i], 32, 93);
    const flow = decodeNumber(tokens[i + 1], 52, 40);
    links[index] = flow;
  }
  return links;
}

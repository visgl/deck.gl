importScripts('./util.js');
const FLUSH_LIMIT = 20000;
let result = [];
let count = 0;
let triangleCount = 0;

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    const parts = line.split('\x01');
    const height = decodeNumber(parts[0], 90, 32);

    // footprints
    parts.slice(1).forEach(function (str) {
      const coords = decodePolyline(str);
      triangleCount += coords.length * 3 - 2;
      coords.push(coords[0]);
      result.push({
        height: height,
        polygon: coords
      });
    });

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
    data: result,
    meta: {buildings: count, triangles: triangleCount, progressAlt: (count / 3895) * 0.2}
  });
  result = [];
}

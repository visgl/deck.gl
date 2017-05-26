importScripts('./util.js');
const FLUSH_LIMIT = 200000;
let coordinates;
let result = [];
let count = 0;

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    if(!coordinates) {
      coordinates = decodePolyline(line, 5);
      return;
    }

    const parts = line.split('\t');
    if (parts.length < 5) {
      return;
    }

    result.push({
      name: parts[0],
      class: parts[1],
      coordinates: coordinates[decodeNumber(parts[2], 90, 32)],
      mass: decodeNumber(parts[3], 90, 32),
      year: decodeNumber(parts[4], 90, 32)
    })
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
    meta: {count: count}
  });
  result = [];
}

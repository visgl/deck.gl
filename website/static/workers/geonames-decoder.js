importScripts('./util.js');
let result = [];

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }

    const parts = line.split('\x01');
    if (parts.length < 4) {
      return;
    }

    const name = parts[0];
    const longitude = decodeNumber(parts[1], 90, 32) / 1e4 - 180;
    const latitude = decodeNumber(parts[2], 90, 32) / 1e4;
    const population = decodeNumber(parts[3], 90, 32);

    result.push({name, longitude, latitude, population});
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
    meta: {count: result.length}
  });
  result = [];
}

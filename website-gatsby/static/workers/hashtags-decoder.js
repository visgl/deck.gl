importScripts('./util.js');
let result = [];

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }

    const parts = line.split('\x01');
    if (parts.length < 2) {
      return;
    }

    const label = parts[0];
    const coordinates = decodePolyline(parts[1]);

    coordinates.forEach(p => {
      result.push({label, coordinates: p});
    });
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

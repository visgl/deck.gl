importScripts('./util.js');
let total = 0;
const result = [];

onmessage = function(e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const count = decodeNumber(line.slice(0, 2), 90, 32);
    const coords = decodePolyline(line.slice(2));
    for (let i = 0; i < coords.length; i++) {
      const c = coords[i];
      c[2] = count;
      result.push(c);
      total++;
    }
  });

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: result,
      meta: {count: total, progress: 1}
    });
    postMessage({action: 'end'});
  }
};

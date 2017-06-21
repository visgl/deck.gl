importScripts('./util.js');
let total = 0;

onmessage = function(e) {
  const lines = e.data.text.split('\n');
  const result = [];

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const count = decodeNumber(line.slice(0, 2), 90, 32);
    const coords = decodePolyline(line.slice(2));
    for (let i = 0; i < coords.length; i++) {
      const c = coords[i];
      for (let j = 0; j < count; j++) {
        result.push(c);
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

importScripts('./util.js');
let total = 0;

onmessage = function(e) {

  const lines = e.data.text.split('\n');
  const result = [];

  lines.forEach(function(line) {
    if (!line) {
      return;
    }
    const pts = line.split(',');
    result.push(pts.map(function(d) {
      return Number(d)
    }));
    total++;
  });

  postMessage({
    action: 'add',
    data: result,
    meta: {count: total}
  });
};

importScripts('./util.js');
let total = 0;

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  const result = lines.reduce(function (acc, line) {
    if (line) {
      const pts = decodePolyline(line);
      return acc.concat(pts);
    }
    return acc;
  }, []);

  total += result.length;

  postMessage({
    action: 'add',
    data: result,
    meta: {count: total}
  });
};

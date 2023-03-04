importScripts('./util.js');

const result = [];

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    const parts = line.split('\x01');
    const d = {
      name: parts[0],
      longitude: decodeNumber(parts[1], 90, 32) / 1e5 - 180,
      latitude: decodeNumber(parts[2], 90, 32) / 1e5
    };
    for (let i = parts.length - 1, year = 2016; i >= 3; i -= 3, year -= 4) {
      const dem = decodeNumber(parts[i - 2], 90, 32);
      const rep = decodeNumber(parts[i - 1], 90, 32);
      const others = decodeNumber(parts[i], 90, 32);
      d[year] = {dem, rep, total: dem + rep + others};
    }

    result.push(d);
  });

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: result,
      meta: {
        count: result.length
      }
    });
    postMessage({action: 'end'});
  }
};

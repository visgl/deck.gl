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
      longitude: decodeNumber(parts[0], 90, 32) / 1e5 - 180,
      latitude: decodeNumber(parts[1], 90, 32) / 1e5,
      population: decodeNumber(parts[2], 90, 32),
      casesByWeek: {}
    };
    const firstWeek = decodeNumber(parts[3], 90, 32);
    for (let i = 4, week = firstWeek; i < parts.length; i++, week++) {
      d.casesByWeek[week] = decodeNumber(parts[i], 90, 32);
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

importScripts('./util.js');
let result = [];
const countries = {};
let vertices = 0;

onmessage = function (e) {
  const lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    if (line[2] === ' ') {
      countries[line.slice(0, 2)] = line.slice(3);
      return;
    }

    const parts = line.split('\t');
    const startYear = decodeNumber(parts[3], 90, 32);
    const meanTemp = [];
    for (let i = 4; i < parts.length; i++) {
      if (parts[i]) {
        const year = startYear + i - 4;
        const value = usePrecision(40 - decodeNumber(parts[i], 90, 32) / 100, 2);
        meanTemp.push([year, value]);
        vertices++;
      }
    }

    result.push({
      id: parts[0].slice(0, 11),
      country: countries[parts[0].slice(0, 2)],
      name: parts[0].slice(11),
      latitude: usePrecision(decodeNumber(parts[1], 90, 32) / 1e4 - 90, 4),
      altitude: usePrecision(decodeNumber(parts[2], 90, 32) / 10 - 500, 1),
      meanTemp
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
    meta: {stations: result.length, vertices}
  });
  result = [];
}

function usePrecision(x, precision) {
  const m = Math.pow(10, precision);
  return Math.round(x * m) / m;
}

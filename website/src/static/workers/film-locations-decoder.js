importScripts('./util.js');
const FLUSH_LIMIT = 200000;
let coordinates;
let result = [];
let locCount = 0;
let movieCount = 0;

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
    if (parts.length < 3) {
      return;
    }

    const name = parts[0] + ' (' + parts[1] + ')';
    movieCount++;

    parts.slice(2).forEach(function(str) {
      const tokens = str.split('\x01');
      const coordIndex = decodeNumber(tokens[1], 90, 32);
      const coord = coordinates[coordIndex];

      result.push({
        name: name,
        scene: tokens[0],
        coordinates: coord
      });
      locCount++;
    });

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
    meta: {movies: movieCount, locations: locCount}
  });
  result = [];
}

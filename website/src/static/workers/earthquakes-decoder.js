let result = [];
let count = 0;
let blob = '';
let timestamp = 0;

onmessage = function(e) {
  const lines = (blob + e.data.text).split('\n');
  blob = lines.pop();

  // time,latitude,longitude,depth,mag
  lines.forEach(function(line) {
    if (!line) {
      return;
    }

    const columns = line.split(',');
    timestamp += parseInt(columns[0], 16);
    result.push({
      timestamp,
      latitude: Number(columns[1]),
      longitude: Number(columns[2]),
      depth: Number(columns[3]),
      magnitude: Number(columns[4])
    });
    count++;
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
    meta: {count: count}
  });
  result = [];
}

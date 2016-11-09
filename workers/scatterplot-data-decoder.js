importScripts('./util.js');
var FLUSH_LIMIT = 100000;
var COORDINATE_PRECISION = 7;
var sequence;
var result = [];
var count = 0;

onmessage = function(e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function(l, i) {
    if (!l.length) {
      return;
    }

    if (!sequence) {
      sequence = decodeSequence(l);
      return;
    }

    var bbox = decodeBbox(l.slice(0, 20));
    var bitmap = decodeBitmap(l.slice(20));

    for (var i = 0; i < bitmap.length; i++) {
      if (bitmap[i] > 0) {
        var point = [
          bbox[0] + (bbox[2] - bbox[0]) * sequence[i * 2],
          bbox[1] + (bbox[3] - bbox[1]) * sequence[i * 2 + 1],
          bitmap[i] * 1
        ];
        result.push(point);
        count++;
      }
    }

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
    meta: {points: count}
  });
  result = [];
}

function decodeSequence(str) {
  var seq = [];
  var tokens = str.split(/([A-Z])/).map(function(v) { return parseInt(v, 36) });
  for (var i = 0; i < tokens.length - 1; i += 2) {
    seq.push(tokens[i] / Math.pow(2, tokens[i + 1] - 10));
  }
  return seq;
}

function decodeBbox(str) {
  var multiplyer = Math.pow(10, COORDINATE_PRECISION);
  return decodeNumberArr(str, 90, 32, 5).map(function(x) {
    return x / multiplyer - 180;
  });
}

function decodeBitmap(str) {
  var chunkSize = 4;
  var match = '';
  for (var i = 0; i < str.length; i++) {
    var seg = (str.charCodeAt(i) - 32).toString(3);
    while (seg.length < chunkSize) {
      seg = '0' + seg;
    }
    match += seg;
  }
  return match;
}

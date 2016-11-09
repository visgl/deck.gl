importScripts('./util.js');

var FLUSH_LIMIT = 5000;
var LOOP_LENGTH = 3600;
var TRAIL_LENGTH = 180;

var args = location.search.match((/[^&?]+/g)) || [];
args.forEach(function(arg) {
  var tokens = arg.split('=');
  if (tokens[0] === 'loop') LOOP_LENGTH = tokens[1] * 1;
  if (tokens[0] === 'trail') TRAIL_LENGTH = tokens[1] * 1;
});

var segments;
var result = [];
var vertexCount = 0;
var tripsCount = 0;

onmessage = function(e) {

  var lines = e.data.text.split('\n');

  lines.forEach(function(l, i) {
    if (!l) {
      return;
    }
    if (!segments) {
      segments = decodeSegments(l);
    } else {
      var trip = decodeTrip(l, segments);
      var trip_offset = 0;
      addTrip(sliceTrip(trip, -TRAIL_LENGTH, LOOP_LENGTH));

      while (trip.endTime > LOOP_LENGTH - TRAIL_LENGTH) {
        trip = shiftTrip(trip, -LOOP_LENGTH);
        addTrip(sliceTrip(trip, -TRAIL_LENGTH, LOOP_LENGTH));
      }
      tripsCount++;
    }
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({action: 'end'});
  }
};

function addTrip(trip) {
  result.push(trip);
  vertexCount += trip.segments.length;

  if (result.length >= FLUSH_LIMIT) {
    flush();
  }
}

function flush() {
  postMessage({
    action: 'add',
    data: [result],
    meta: {trips: tripsCount, vertices: vertexCount}
  });
  result = [];
}

function sliceTrip(trip, start, end) {
  var i, startIndex = -1, endIndex = -1;
  for(i = 0; i < trip.segments.length; i++) {
    var t = trip.segments[i][2];
    if (t > start && startIndex === -1) {
      startIndex = Math.max(0, i - 1);
    }
    if (t > end && endIndex === -1) {
      i++;
      break;
    }
  }
  endIndex = i;

  return {
    vendor: trip.vendor,
    startTime: trip.startTime,
    endTime: trip.endTime,
    segments: trip.segments.slice(startIndex, endIndex)
  };
}

function shiftTrip(trip, offset) {
  var cutoffIndex = 0;
  var segments = trip.segments.map(function(p, i) {
    return [p[0], p[1], p[2] + offset];
  });

  return {
    vendor: trip.vendor,
    startTime: trip.startTime + offset,
    endTime: trip.endTime + offset,
    segments: segments
  };
}

function decodeTrip(str, segments) {
  var vendor = decodeNumber(str.slice(0, 1), 90, 32)
  var startTime = decodeNumber(str.slice(1, 3), 90, 32);
  var endTime = decodeNumber(str.slice(3, 5), 90, 32);
  var segs = decodeSegmentsArray(str.slice(5), segments);

  var projectedTimes = segs.reduce(function(acc, seg, i) {
    var t = acc[i] + seg[seg.length - 1][2];
    return acc.concat(t);
  }, [0]);
  var rT = (endTime - startTime) / projectedTimes[projectedTimes.length - 1];

  return {
    vendor: vendor,
    startTime: startTime,
    endTime: endTime,
    segments: segs.reduce(function(acc, seg, i) {
      var t0 = projectedTimes[i];
      return acc.concat(seg.map(function(s) {
        return [s[0], s[1], (s[2] + t0) * rT + startTime];
      }));
    }, [])
  };
}

function decodeSegmentsArray(str, segments) {
  var tokens = str.split(/([\x20-\x4c])/);
  var segs = [];

  for(var i = 1; i < tokens.length - 1; i += 2) {
    var segIndexStr = String.fromCharCode(tokens[i].charCodeAt(0) + 45) + tokens[i + 1];
    var segIndex = decodeNumber(segIndexStr, 45, 77);
    segs.push(segments[segIndex]);
  }
  return segs;
}

function decodeSegments(str) {
  var tokens = str.split(/([\x3e-\xff]+)/);
  var result = [];
  for (var i = 0; i < tokens.length - 1; i += 2) {
    var T = decodeNumber(tokens[i], 30, 32);
    var coords = decodePolyline(tokens[i + 1]);

    var distances = coords.reduce(function(acc, c, j) {
      var d = 0;
      if (j > 0) {
        d = acc[j - 1] + distance(coords[j], coords[j - 1]);
      }
      return acc.concat(d);
    }, []);
    var D = distances[distances.length - 1];

    result[i / 2] = coords.map(function(c, j) {
      return [c[0], c[1], distances[j] / D * T];
    });
  }

  return result;
}

/*
* adapted from turf-distance http://turfjs.org
*/
function distance(from, to) {
  var degrees2radians = Math.PI / 180;
  var dLat = degrees2radians * (to[1] - from[1]);
  var dLon = degrees2radians * (to[0] - from[0]);
  var lat1 = degrees2radians * from[1];
  var lat2 = degrees2radians * to[1];

  var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

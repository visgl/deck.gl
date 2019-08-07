importScripts('./util.js');

const FLUSH_LIMIT = 5000;
let LOOP_LENGTH = 3600;
let TRAIL_LENGTH = 180;

const args = location.search.match((/[^&?]+/g)) || [];
args.forEach(function(arg) {
  const tokens = arg.split('=');
  if (tokens[0] === 'loop') {
    LOOP_LENGTH = Number(tokens[1]);
  }
  if (tokens[0] === 'trail') {
    TRAIL_LENGTH = Number(tokens[1]);
  }
});

let segments;
let result = [];
let vertexCount = 0;
let tripsCount = 0;

onmessage = function(e) {

  const lines = e.data.text.split('\n');

  lines.forEach(function(l, i) {
    if (!l) {
      return;
    }
    if (!segments) {
      segments = decodeSegments(l);
    } else {
      let trip = decodeTrip(l, segments);
      const trip_offset = 0;
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
  vertexCount += trip.path.length;

  if (result.length >= FLUSH_LIMIT) {
    flush();
  }
}

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: {trips: tripsCount, vertices: vertexCount, progress: tripsCount / 9970 * 0.8}
  });
  result = [];
}

function sliceTrip(trip, start, end) {
  let i, startIndex = -1, endIndex = -1;
  for (i = 0; i < trip.timestamps.length; i++) {
    const t = trip.timestamps[i];
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
    path: trip.path.slice(startIndex, endIndex),
    timestamps: trip.timestamps.slice(startIndex, endIndex)
  };
}

function shiftTrip(trip, offset) {
  return {
    vendor: trip.vendor,
    startTime: trip.startTime + offset,
    endTime: trip.endTime + offset,
    path: trip.path,
    timestamps: trip.timestamps.map(function(t) {
      return t + offset;
    })
  };
}

function decodeTrip(str, segments) {
  const vendor = decodeNumber(str.slice(0, 1), 90, 32);
  const startTime = decodeNumber(str.slice(1, 3), 90, 32);
  const endTime = decodeNumber(str.slice(3, 5), 90, 32);
  const segs = decodeSegmentsArray(str.slice(5), segments);

  const projectedTimes = segs.reduce(function(acc, seg, i) {
    const t = acc[i] + seg[seg.length - 1][2];
    return acc.concat(t);
  }, [0]);
  const rT = (endTime - startTime) / projectedTimes[projectedTimes.length - 1];
  const z = Math.random() * 20;
  const path = [];
  const timestamps = [];
  segs.forEach(function(seg, i) {
    const t0 = projectedTimes[i];
    seg.forEach(function (s, j) {
      if (i === 0 || j > 0) {
        path.push([s[0], s[1], z]);
        timestamps.push((s[2] + t0) * rT + startTime);
      }
    });
  });

  return {
    vendor,
    startTime,
    endTime,
    path,
    timestamps,
  };
}

function decodeSegmentsArray(str, segments) {
  const tokens = str.split(/([\x20-\x4c])/);
  const segs = [];

  for (let i = 1; i < tokens.length - 1; i += 2) {
    const segIndexStr = String.fromCharCode(tokens[i].charCodeAt(0) + 45) + tokens[i + 1];
    const segIndex = decodeNumber(segIndexStr, 45, 77);
    segs.push(segments[segIndex]);
  }
  return segs;
}

function decodeSegments(str) {
  const tokens = str.split(/([\x3e-\xff]+)/);
  const result = [];
  for (let i = 0; i < tokens.length - 1; i += 2) {
    var T = decodeNumber(tokens[i], 30, 32);
    var coords = decodePolyline(tokens[i + 1]);

    var distances = coords.reduce(function(acc, c, j) {
      let d = 0;
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
  const degrees2radians = Math.PI / 180;
  const dLat = degrees2radians * (to[1] - from[1]);
  const dLon = degrees2radians * (to[0] - from[0]);
  const lat1 = degrees2radians * from[1];
  const lat2 = degrees2radians * to[1];

  const a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* eslint-disable */
(function() {
  const EARTH_RADIUS = 6378000;
  const SF_MIN = [-122.511289, 37.709481];
  const SF_MAX = [-122.37646761, 37.806013];

  const NUM_TIMING_SAMPLES = 60;

  let cpuTimeSum = 0;
  let gpuTimeSum = 0;
  let timeSampleCount = NUM_TIMING_SAMPLES - 1;

  window.utils = {
    addTimerElement() {
      this.timerDiv = document.createElement('div');
      this.timerDiv.id = 'timer';
      this.timerDiv.style.zIndex = 9999;
      this.timerDiv.style.position = 'absolute';
      this.timerDiv.style.top = '10px';
      this.timerDiv.style.left = '10px';
      this.timerDiv.style.color = 'white';
      this.cpuTimeElement = document.createElement('div');
      this.gpuTimeElement = document.createElement('div');
      this.timerDiv.appendChild(this.cpuTimeElement);
      this.timerDiv.appendChild(this.gpuTimeElement);
      document.body.appendChild(this.timerDiv);
    },

    updateTimerElement(cpuTime, gpuTime) {
      cpuTimeSum += cpuTime;
      gpuTimeSum += gpuTime;
      ++timeSampleCount;

      if (timeSampleCount === NUM_TIMING_SAMPLES) {
        let cpuTimeAve = cpuTimeSum / NUM_TIMING_SAMPLES;
        let gpuTimeAve = gpuTimeSum / NUM_TIMING_SAMPLES;
        this.cpuTimeElement.innerText = 'CPU time: ' + cpuTimeAve.toFixed(3) + 'ms';
        if (gpuTimeAve > 0) {
          this.gpuTimeElement.innerText = 'GPU time: ' + gpuTimeAve.toFixed(3) + 'ms';
        } else {
          this.gpuTimeElement.innerText = 'GPU time: (Unavailable)';
        }

        cpuTimeSum = 0;
        gpuTimeSum = 0;
        timeSampleCount = 0;
      }
    },

    // From deck.gl: https://github.com/uber/deck.gl/blob/master/examples/layer-browser/src/utils/grid-aggregator.js
    // Used under MIT license
    pointsToWorldGrid(points, cellSize) {
      let numPoints = points.length;
      let latMin = Number.POSITIVE_INFINITY;
      let latMax = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < numPoints; ++i) {
        let lat = points[i].COORDINATES[1];
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
      }

      let centerLat = (latMin + latMax) / 2;

      let latOffset = (cellSize / EARTH_RADIUS) * (180 / Math.PI);
      let lonOffset =
        ((cellSize / EARTH_RADIUS) * (180 / Math.PI)) / Math.cos((centerLat * Math.PI) / 180);

      let grid = {};
      let maxHeight = Number.NEGATIVE_INFINITY;

      let numCells = 0;
      for (let i = 0; i < numPoints; ++i) {
        let coords = points[i].COORDINATES;
        let latIdx = Math.floor((coords[1] + 90) / latOffset);
        let lonIdx = Math.floor((coords[0] + 180) / lonOffset);

        if (!grid[latIdx]) {
          grid[latIdx] = {};
        }
        if (!grid[latIdx][lonIdx]) {
          grid[latIdx][lonIdx] = 0;
          numCells++;
        }
        ++grid[latIdx][lonIdx];

        maxHeight = Math.max(maxHeight, grid[latIdx][lonIdx]);
      }

      let data = new Array(numCells);
      let i = 0;

      for (let latKey in grid) {
        const latIdx = parseInt(latKey, 10);
        let lonData = grid[latKey];

        for (let lonKey in lonData) {
          let lonIdx = parseInt(lonKey, 10);
          let value = grid[latKey][lonKey];

          data[i++] = {
            position: [-180 + lonOffset * lonIdx, -90 + latOffset * latIdx],
            value: value / maxHeight
          };
        }
      }

      return data;
    },

    sfRandomPoints(numPoints, maxVal) {
      let points = new Array(numPoints);

      let lngMin = SF_MIN[0];
      let latMin = SF_MIN[1];
      let lngRange = SF_MAX[0] - SF_MIN[0];
      let latRange = SF_MAX[1] - SF_MIN[1];

      for (let i = 0; i < numPoints; ++i) {
        points[i] = {
          position: [lngMin + Math.random() * lngRange, latMin + Math.random() * latRange],
          value: Math.random() * maxVal
        };
      }

      return points;
    },

    // From deck.gl: https://github.com/uber/deck.gl/blob/master/modules/layers/src/column-layer/column-geometry.js
    // Used under MIT license
    createColumn(radius = 1, height = 1, nradial = 10) {
      const vertsAroundEdge = nradial + 1; // loop
      const numVertices = vertsAroundEdge * 3; // top, side top edge, side bottom edge

      const stepAngle = (Math.PI * 2) / nradial;

      const positions = new Float32Array(numVertices * 3);
      const normals = new Float32Array(numVertices * 3);

      let i = 0;

      // side tesselation: 0, 1, 2, 3, 4, 5, ...
      //
      // 0 - 2 - 4  ... top
      // | / | / |
      // 1 - 3 - 5  ... bottom
      //
      for (let j = 0; j < vertsAroundEdge; j++) {
        const a = j * stepAngle;
        const sin = Math.sin(a);
        const cos = Math.cos(a);

        for (let k = 0; k < 2; k++) {
          positions[i + 0] = cos * radius;
          positions[i + 1] = sin * radius;
          positions[i + 2] = (1 / 2 - k) * height;

          normals[i] = cos;
          normals[i + 1] = sin;

          i += 3;
        }
      }

      // top tesselation: 0, -1, 1, -2, 2, -3, 3, ...
      //
      //    0 -- 1
      //   /      \
      // -1        2
      //  |        |
      // -2        3
      //   \      /
      //   -3 -- 4
      //
      for (let j = 0; j < vertsAroundEdge; j++) {
        const v = Math.floor(j / 2) * Math.sign((j % 2) - 0.5);
        const a = v * stepAngle;
        const sin = Math.sin(a);
        const cos = Math.cos(a);

        positions[i] = cos * radius;
        positions[i + 1] = sin * radius;
        positions[i + 2] = height / 2;

        normals[i + 2] = 1;

        i += 3;
      }

      return {
        positions,
        normals
      };
    }
  };
})();

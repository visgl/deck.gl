// import {Buffer, Model, GL, Framebuffer, Texture2D, FEATURES, hasFeatures} from 'luma.gl';
// import log from '../../utils/log';
import assert from 'assert';

export default class GPUGridAggregator {
  constructor(gl, opts = {}) {
    this.id = opts.id || 'gpu-grid-aggregator';
    this.shaderCache = opts.shaderCache || null;
    this.gl = gl;
  }

  // Perform aggregation and retun the results
  run(opts) {
    return this._runAggregationOnCPU(opts);
  }

  // PRIVATE
  /* eslint-disable max-statements */
  _runAggregationOnCPU(opts) {
    const ELEMENTCOUNT = 4;
    const {positions, weights, viewport, cellSize, countsBuffer, maxCountBuffer} = opts;
    const width = opts.width || viewport.width;
    const height = opts.height || viewport.height;
    const numCol = Math.ceil(width / cellSize[0]);
    const numRow = Math.ceil(height / cellSize[1]);
    // Each element contains 4 floats to match with GPU ouput
    const counts = new Float32Array(numCol * numRow * ELEMENTCOUNT);
    counts.fill(0);
    let maxCount = 0;
    let totalCount = 0;
    for (let index = 0; index < weights.length; index++) {
      const [x, y] = viewport.project([positions[index * 2], positions[index * 2 + 1]]);
      const weight = weights ? weights[index] : 1;
      assert(Number.isFinite(weight));
      const colId = Math.floor(x / cellSize[0]);
      const rowId = Math.floor(y / cellSize[1]);
      if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
        const i = (colId + rowId * numCol) * ELEMENTCOUNT;
        counts[i]++;
        counts[i + 1] += weight;
        totalCount += 1;
        if (counts[i] > maxCount) {
          maxCount = counts[i];
        }
      }
    }
    const maxCountBufferData = new Float32Array(ELEMENTCOUNT);
    // Store totalCount valuein Red/X channel
    maxCountBufferData[0] = totalCount;
    // Store maxCount value in alpha/W channel.
    maxCountBufferData[3] = maxCount;

    // Load data to WebGL buffer.
    countsBuffer.subData({data: counts});
    maxCountBuffer.subData({data: maxCountBufferData});
    return {countsBuffer, maxCountBuffer};
  }
  /* eslint-enable max-statements */
}

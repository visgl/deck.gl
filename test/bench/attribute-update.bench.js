// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this, no-unused-vars, no-empty */

export default function attributeUpdateBench(suite) {
  const SAMPLE_DATA_1M = new Array(1e6).fill({position: [1, 1, 1], value: 10});
  const SAMPLE_DATA_100K = SAMPLE_DATA_1M.slice(0, 1e5);
  const placeholderArray = [];

  suite
    .group('ITERATION (1M)')
    .add('Baseline#iterate plain array', () => {
      for (const object of SAMPLE_DATA_1M) {
      }
    })
    .add('Context#Plain array#Iterator', () => {
      const wrappedData = {
        data: SAMPLE_DATA_1M,
        [Symbol.iterator]: wrapIterator
      };
      for (const object of wrappedData) {
      }
    })
    .add('Context#Plain array#Inline', () => {
      const context = createIterableContext(SAMPLE_DATA_1M);
      for (const element of SAMPLE_DATA_1M) {
        context.index++;
      }
    })
    .add('Context#Plain array#forEach', () => {
      forEach(SAMPLE_DATA_1M, () => {});
    })
    .add('Context#Non-iterable#Iterator', () => {
      const wrappedData = {
        data: {length: SAMPLE_DATA_1M.length},
        [Symbol.iterator]: getIterator
      };
      for (const object of wrappedData) {
      }
    })
    .add('Context#Non-iterable#Inline', () => {
      const context = createIterableContext(SAMPLE_DATA_1M);
      placeholderArray.length = SAMPLE_DATA_1M.length;
      for (const object of placeholderArray) {
        context.index++;
      }
    })
    .add('Context#Non-iterable#forEach', () => {
      forEach({length: SAMPLE_DATA_1M.length}, () => {});
    });

  suite
    .group('ATTRIBUTE UPDATE (100K)')
    .add('Baseline#plain accessor', () => {
      const instancePositions = new Float32Array(3e5);
      const getPosition = d => d.position;
      let i;
      for (const object of SAMPLE_DATA_100K) {
        const p = getPosition(object);
        instancePositions[i++] = p[0];
        instancePositions[i++] = p[1];
        instancePositions[i++] = p[2] || 0;
      }
    })
    .add('Baseline#create small objects', () => {
      const instancePositions = new Float32Array(3e5);
      const getPosition = d => [1, 1, 1];
      let i;
      for (const object of SAMPLE_DATA_100K) {
        const p = getPosition(object);
        instancePositions[i++] = p[0];
        instancePositions[i++] = p[1];
        instancePositions[i++] = p[2] || 0;
      }
    })
    .add('Context#user target array', () => {
      const instancePositions = new Float32Array(3e5);
      const target = [];
      const getPosition = d => {
        target[0] = 1;
        target[1] = 1;
        target[2] = 1;
        return target;
      };
      let i;
      for (const object of SAMPLE_DATA_100K) {
        const p = getPosition(object);
        instancePositions[i++] = p[0];
        instancePositions[i++] = p[1];
        instancePositions[i++] = p[2] || 0;
      }
    });
}

function createIterableContext(data) {
  return {
    element: null,
    index: -1,
    data,
    target: []
  };
}

// Create an iterator for `for...of` loops
// Implements JavaScript Iterator interface:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
function getIterator() {
  const data = this.data;
  const length = data.length;

  const value = createIterableContext(data);
  const result = {
    value,
    done: false
  };
  const next = () => {
    if (++value.index >= length) {
      result.done = true;
    }
    return result;
  };

  return {next};
}

// Wraps an iterator with our own format for `for...of` loops
// Implements JavaScript Iterator interface:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
function wrapIterator() {
  const data = this.data;
  const iterator = data[Symbol.iterator]();

  const value = createIterableContext(data);
  const result = {
    value,
    done: false
  };
  const next = () => {
    const originalResult = iterator.next();
    value.index++;
    value.element = originalResult.value;
    result.done = originalResult.done;
    return result;
  };

  return {next};
}

// Iterates through an iterable and call visitor
function forEach(data, visitor) {
  const context = createIterableContext(data);

  if (data[Symbol.iterator]) {
    for (const element of data) {
      context.index++;
      visitor(element, context);
    }
  } else {
    const count = data.length;
    for (let i = 0; i < count; i++) {
      context.index = i;
      visitor(null, context);
    }
  }
}

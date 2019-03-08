// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*
 * Make sure that `data` is an iterable.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */
export function createIterable(data) {
  if (!data) {
    return null;
  }

  if (typeof data[Symbol.iterator] === 'function') {
    // data is already an iterable
    return {
      [Symbol.iterator]: () => wrapIterator(data)
    };
  }

  return {
    [Symbol.iterator]: () => getIterator(data)
  };
}

// Create an iterator for `for...of` loops
function getIterator(data) {
  const length = data.length || 0;

  const value = {
    element: null,
    index: -1,
    data,
    // visitor can optionally utilize this to avoid constructing a new array for every object
    target: []
  };

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
function wrapIterator(data) {
  const iterator = data[Symbol.iterator]();

  const value = {
    element: null,
    index: -1,
    data,
    // visitor can optionally utilize this to avoid constructing a new array for every object
    target: []
  };

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

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

// Merge two luma.gl shader descriptors
export function mergeShaders(target, source) {
  if (!source) {
    return target;
  }
  const result = Object.assign({}, target, source);

  if ('defines' in source) {
    result.defines = Object.assign({}, target.defines, source.defines);
  }
  if ('modules' in source) {
    result.modules = (target.modules || []).concat(source.modules);

    // Hack: prject32 and project64 cannot co-exist
    if (source.modules.some(module => module.name === 'project64')) {
      const index = result.modules.findIndex(module => module.name === 'project32');
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ('inject' in source) {
    if (!target.inject) {
      result.inject = source.inject;
    } else {
      const mergedInjection = {...target.inject};
      for (const key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || '') + source.inject[key];
      }
      result.inject = mergedInjection;
    }
  }
  return result;
}

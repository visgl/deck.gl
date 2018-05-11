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

import test from 'tape-catch';
import EffectManager from '@deck.gl/core/experimental/lib/effect-manager';
import Effect from '@deck.gl/core/experimental/lib/effect';
import LayerManager from '@deck.gl/core/lib/layer-manager';
import global from 'global';

const gl = global.glContext;
const layerManager = new LayerManager(gl);

test('EffectManager#constructor', t => {
  const effectManager = new EffectManager({gl, layerManager});
  t.ok(effectManager, 'Effect Manager created');
  t.end();
});

test('EffectManager#add and remove effects', t => {
  const effectManager = new EffectManager({gl, layerManager});
  const effect = new Effect();
  effectManager.addEffect(effect);
  t.ok(effectManager.removeEffect(effect), 'Effect added and removed successfully');
  t.end();
});

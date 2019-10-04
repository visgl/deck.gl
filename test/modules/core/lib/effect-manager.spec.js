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
import EffectManager from '@deck.gl/core/lib/effect-manager';
import Effect from '@deck.gl/core/lib/effect';
import LayerManager from '@deck.gl/core/lib/layer-manager';

import {gl} from '@deck.gl/test-utils';
import PostProcessEffect from '@deck.gl/core/effects/post-process-effect';
import LightingEffect from '@deck.gl/core/effects/lighting/lighting-effect';

const layerManager = new LayerManager(gl);

function getResourceCounts() {
  /* global luma */
  const resourceStats = luma.stats.get('Resource Counts');
  return {
    Texture2D: resourceStats.get('Texture2Ds Active').count,
    Buffer: resourceStats.get('Buffers Active').count
  };
}

const fs = `\
  vec4 testEffect_sampleColor(sampler2D texture, vec2 texSize, vec2 texCoord) {
    return vec4(1.0, 0.0, 0.0, 0.0);
  }
  `;

const uniforms = {};

const testModule = {
  name: 'testEffect',
  uniforms,
  fs,
  passes: [{sampler: true}]
};

test('EffectManager#constructor', t => {
  const effectManager = new EffectManager({gl, layerManager});
  t.ok(effectManager, 'Effect Manager created');
  t.end();
});

test('EffectManager#set and get Effects', t => {
  const effectManager = new EffectManager({gl, layerManager});
  const effect1 = new Effect();
  const effect2 = new Effect();
  effectManager.setEffects([effect1, effect2]);
  let effects = effectManager.getEffects();
  t.equal(effects.length, 3, 'Effect set and get successfully');

  effectManager.setProps({effects: [effect1]});
  effects = effectManager.getEffects();
  t.equal(effects.length, 2, 'Effect set and get successfully');
  t.end();
});

test('EffectManager#cleanup resource', t => {
  const effect = new PostProcessEffect(testModule);
  const effectManager = new EffectManager({gl, layerManager});
  effectManager.setEffects([effect]);
  const resBegin = getResourceCounts();
  effect.preRender(gl);
  effectManager.setEffects([]);
  const resEnd = getResourceCounts();

  t.deepEqual(resBegin, resEnd, 'All resources are cleaned up');
  t.end();
});

test('EffectManager#finalize', t => {
  const effect = new PostProcessEffect(testModule);
  const effectManager = new EffectManager({gl, layerManager});
  effectManager.setEffects([effect]);
  const resBegin = getResourceCounts();
  effect.preRender(gl);
  effectManager.finalize();
  const resEnd = getResourceCounts();

  t.deepEqual(resBegin, resEnd, 'Effect manager is finalized');
  t.end();
});

test('EffectManager#setProps', t => {
  const effect = new LightingEffect();
  const effectManager = new EffectManager({gl, layerManager});
  effectManager.setProps({effects: [effect]});

  t.deepEqual(effectManager.effects, [effect], 'Effect manager set props correctly');
  t.equal(
    effectManager._internalEffects.length,
    1,
    'Effect Manager should not need to apply default lighting'
  );
  t.equal(effectManager.needsRedraw(), 'effects changed', 'Effect Manager should need redraw');

  effectManager.setProps({effects: [effect]});
  t.equal(
    effectManager.needsRedraw({clearRedrawFlags: true}),
    'effects changed',
    'Effect Manager should need redraw'
  );
  t.equal(
    effectManager.needsRedraw({clearRedrawFlags: true}),
    false,
    'Effect Manager should not need redraw'
  );

  effectManager.setProps({effects: []});
  t.equal(
    effectManager._internalEffects.length,
    1,
    'Effect Manager should need to apply default lighting'
  );

  t.end();
});

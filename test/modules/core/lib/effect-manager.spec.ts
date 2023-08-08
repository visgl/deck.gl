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

import test from 'tape-promise/tape';
import EffectManager from '@deck.gl/core/lib/effect-manager';

class TestEffect {
  constructor(props = {}) {
    this.id = props.id || 'effect';
    this.props = props;
    this.resources = null;
  }

  setProps(props) {
    this.props = props;
  }

  preRender() {
    this.resources = this.resources || {
      name: 'Some WebGL resource expensive to create'
    };
  }

  cleanup() {
    this.resources = null;
  }
}

class TestEffect2 {
  constructor(props = {}) {
    this.id = props.id || 'effect';
    this.props = props;
    this.resources = null;
  }

  preRender() {
    this.resources = this.resources || {
      name: 'Some WebGL resource expensive to create'
    };
  }

  cleanup() {
    this.resources = null;
  }
}

test('EffectManager#constructor', t => {
  const effectManager = new EffectManager();
  t.ok(effectManager, 'Effect Manager created');
  t.end();
});

test('EffectManager#set and get effects', t => {
  const effectManager = new EffectManager();
  const effect1 = new TestEffect({id: 'effect1'});
  const effect2 = new TestEffect({id: 'effect2'});
  effectManager.setProps({effects: [effect1, effect2]});
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  let effects = effectManager.getEffects();
  // 2 user effects + default lighting
  t.equal(effects.length, 3, 'Effect set and get successfully');

  effectManager.setProps({effects: [effect1]});
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting
  t.equal(effects.length, 2, 'Effect set and get successfully');

  effectManager.setProps({effects: [effect1]});
  t.notOk(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects not changed');

  effectManager.addDefaultEffect(new TestEffect2());
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting + testEffect2
  t.is(effects.length, 3, 'Added new default effect');

  t.end();
});

test('EffectManager#update effects', t => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffect({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0.5, 'Effect prop as expected');
  effect.preRender();
  const resources = effect.resources;

  effectManager.setProps({effects: [new TestEffect({gain: 1})]});
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 1, 'Effect prop as expected');
  effect.preRender();
  t.is(effect.resources, resources, 'Resources did not get regenerated (props update)');

  effectManager.setProps({effects: [new TestEffect({id: 'alt-effect', gain: 0})]});
  t.notOk(effect.resources, 'Old effect is cleaned up');
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0, 'Effect prop as expected');
  effect.preRender();
  t.not(effect.resources, resources, 'Resources are regenerated (new effect)');

  t.end();
});

test('EffectManager#update effects', t => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffect2({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0.5, 'Effect prop as expected');
  effect.preRender();
  const resources = effect.resources;

  effectManager.setProps({effects: [new TestEffect2({gain: 1})]});
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 1, 'Effect prop as expected');
  effect.preRender();
  t.not(effect.resources, resources, 'Resources are regenerated (props update not implemented)');

  t.end();
});

test('EffectManager#finalize', t => {
  const effect = new TestEffect();
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [effect]});
  effect.preRender();
  effectManager.finalize();

  t.notOk(effect.resources, 'Effect manager is finalized');
  t.end();
});

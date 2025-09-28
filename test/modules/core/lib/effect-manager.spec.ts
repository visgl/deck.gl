// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import EffectManager from '@deck.gl/core/lib/effect-manager';
import type {Effect, EffectContext} from '@deck.gl/core';

class TestEffect implements Effect {
  id: string;
  props: any;
  resources: any;

  constructor(props: {id?: string} = {}) {
    this.id = props.id || 'effect';
    this.props = props;
    this.resources = null;
  }

  setup() {
    this.resources = {
      name: 'Some WebGL resource expensive to create'
    };
  }

  cleanup() {
    this.resources = null;
  }
}

class TestEffectWithUpdate extends TestEffect {
  setProps(props) {
    this.props = props;
  }
}

test('EffectManager#constructor', t => {
  const effectManager = new EffectManager();
  t.ok(effectManager, 'Effect Manager created');
  t.end();
});

test('EffectManager#set and get effects', t => {
  const effectManager = new EffectManager();
  const effect1 = new TestEffectWithUpdate({id: 'effect1'});
  const effect2 = new TestEffectWithUpdate({id: 'effect2'});
  effectManager.setProps({effects: [effect1, effect2]});
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  let effects = effectManager.getEffects();
  // 2 user effects + default lighting
  t.equal(effects.length, 3, 'Effect set and get successfully');
  t.ok(effect1.resources, 'Effect.setup() is called');
  t.ok(effect2.resources, 'Effect.setup() is called');

  effectManager.setProps({effects: [effect1]});
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting
  t.equal(effects.length, 2, 'Effect set and get successfully');
  t.notOk(effect2.resources, 'Effect.cleanup() is called');

  effectManager.setProps({effects: [effect1]});
  t.notOk(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects not changed');

  const defaultTestEffect = new TestEffect();
  effectManager.addDefaultEffect(defaultTestEffect);
  t.ok(defaultTestEffect.resources, 'Effect.setup() is called');
  t.equal(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting + testEffect1
  t.is(effects.length, 3, 'Added new default effect');

  t.end();
});

test('EffectManager#update effects', t => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffectWithUpdate({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0.5, 'Effect prop as expected');
  const resources = (effect as TestEffectWithUpdate).resources;
  t.ok(resources, 'Effect resources are created');

  effectManager.setProps({effects: [new TestEffectWithUpdate({gain: 1})]});
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 1, 'Effect prop as expected');
  t.is(effect.resources, resources, 'Resources did not get regenerated (props update)');

  effectManager.setProps({effects: [new TestEffectWithUpdate({id: 'alt-effect', gain: 0})]});
  t.notOk(effect.resources, 'Old effect is cleaned up');
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0, 'Effect prop as expected');
  t.not(effect.resources, resources, 'Resources are regenerated (new effect)');

  t.end();
});

test('EffectManager#update effects', t => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffect({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 0.5, 'Effect prop as expected');
  const resources = (effect as TestEffect).resources;
  t.ok(resources, 'Effect resources are created');

  effectManager.setProps({effects: [new TestEffect({gain: 1})]});
  effect = effectManager.getEffects()[0];
  t.equal(effect.props.gain, 1, 'Effect prop as expected');
  t.not(effect.resources, resources, 'Resources are regenerated (props update not implemented)');

  t.end();
});

test('EffectManager#finalize', t => {
  const effect = new TestEffectWithUpdate();
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [effect]});
  effectManager.finalize();

  t.notOk(effect.resources, 'Effect manager is finalized');
  t.end();
});

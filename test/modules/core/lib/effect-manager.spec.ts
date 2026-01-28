// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
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

test('EffectManager#constructor', () => {
  const effectManager = new EffectManager();
  expect(effectManager, 'Effect Manager created').toBeTruthy();
});

test('EffectManager#set and get effects', () => {
  const effectManager = new EffectManager();
  const effect1 = new TestEffectWithUpdate({id: 'effect1'});
  const effect2 = new TestEffectWithUpdate({id: 'effect2'});
  effectManager.setProps({effects: [effect1, effect2]});
  expect(effectManager.needsRedraw({clearRedrawFlags: true})).toBe('effects changed');
  let effects = effectManager.getEffects();
  // 2 user effects + default lighting
  expect(effects.length, 'Effect set and get successfully').toBe(3);
  expect(effect1.resources, 'Effect.setup() is called').toBeTruthy();
  expect(effect2.resources, 'Effect.setup() is called').toBeTruthy();

  effectManager.setProps({effects: [effect1]});
  expect(effectManager.needsRedraw({clearRedrawFlags: true})).toBe('effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting
  expect(effects.length, 'Effect set and get successfully').toBe(2);
  expect(effect2.resources, 'Effect.cleanup() is called').toBeFalsy();

  effectManager.setProps({effects: [effect1]});
  expect(effectManager.needsRedraw({clearRedrawFlags: true}), 'effects not changed').toBeFalsy();

  const defaultTestEffect = new TestEffect();
  effectManager.addDefaultEffect(defaultTestEffect);
  expect(defaultTestEffect.resources, 'Effect.setup() is called').toBeTruthy();
  expect(effectManager.needsRedraw({clearRedrawFlags: true})).toBe('effects changed');
  effects = effectManager.getEffects();
  // 1 user effect + default lighting + testEffect1
  expect(effects.length, 'Added new default effect').toBe(3);
});

test('EffectManager#update effects', () => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffectWithUpdate({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  expect(effect.props.gain, 'Effect prop as expected').toBe(0.5);
  const resources = (effect as TestEffectWithUpdate).resources;
  expect(resources, 'Effect resources are created').toBeTruthy();

  effectManager.setProps({effects: [new TestEffectWithUpdate({gain: 1})]});
  effect = effectManager.getEffects()[0];
  expect(effect.props.gain, 'Effect prop as expected').toBe(1);
  expect(effect.resources, 'Resources did not get regenerated (props update)').toBe(resources);

  effectManager.setProps({effects: [new TestEffectWithUpdate({id: 'alt-effect', gain: 0})]});
  expect(effect.resources, 'Old effect is cleaned up').toBeFalsy();
  effect = effectManager.getEffects()[0];
  expect(effect.props.gain, 'Effect prop as expected').toBe(0);
  expect(effect.resources, 'Resources are regenerated (new effect)').not.toBe(resources);
});

test('EffectManager#update effects', () => {
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [new TestEffect({gain: 0.5})]});
  let effect = effectManager.getEffects()[0];
  expect(effect.props.gain, 'Effect prop as expected').toBe(0.5);
  const resources = (effect as TestEffect).resources;
  expect(resources, 'Effect resources are created').toBeTruthy();

  effectManager.setProps({effects: [new TestEffect({gain: 1})]});
  effect = effectManager.getEffects()[0];
  expect(effect.props.gain, 'Effect prop as expected').toBe(1);
  expect(effect.resources, 'Resources are regenerated (props update not implemented)').not.toBe(
    resources
  );
});

test('EffectManager#finalize', () => {
  const effect = new TestEffectWithUpdate();
  const effectManager = new EffectManager();
  effectManager.setProps({effects: [effect]});
  effectManager.finalize();

  expect(effect.resources, 'Effect manager is finalized').toBeFalsy();
});

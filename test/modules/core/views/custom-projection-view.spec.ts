// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {test, expect, vi} from 'vitest';
import ViewManager from '@deck.gl/core/lib/view-manager';
import * as core from '@deck.gl/core';
import * as deck from 'deck.gl';
import {
  _CustomProjectionView as CustomProjectionView,
  _CustomProjectionViewport as CustomProjectionViewport,
  _CustomProjectionController as CustomProjectionController
} from '@deck.gl/core';

const options = {crs: 'EPSG:3857'};
const viewState = {center: [0, 0, 0] as [number, number, number], zoom: 2};

test('CustomProjectionView uses the fixed Earth-circumference scale', async () => {
  const view = new CustomProjectionView(options);
  await view.initialize();
  const viewport = view.makeViewport({width: 800, height: 600, viewState})!;
  expect(viewport.projectPosition([0, 0])).toEqual([0, 0, 0]);
  expect(viewport.projectPosition([180, 0])[0]).toBeCloseTo(256, 8);
});

test('Custom projection classes are exported only under experimental names', () => {
  for (const name of [
    'CustomProjectionView',
    'CustomProjectionViewport',
    'CustomProjectionController'
  ]) {
    expect(core[`_${name}`]).toBeTypeOf('function');
    expect(deck[`_${name}`]).toBe(core[`_${name}`]);
    expect(core).not.toHaveProperty(name);
    expect(deck).not.toHaveProperty(name);
  }
});

test('CustomProjectionView constructs its viewport with layout, state and projection options', async () => {
  const view = new CustomProjectionView({
    ...options,
    id: 'custom',
    x: '25%',
    y: 10,
    width: '50%',
    height: '75%',
    padding: {left: '10%', bottom: 20},
    resolution: 2,
    crs: options.crs
  });
  await view.initialize();
  const viewport = view.makeViewport({
    width: 800,
    height: 600,
    viewState: {...viewState, pitch: 40, bearing: -30}
  })!;
  expect(view.getViewportType()).toBe(CustomProjectionViewport);
  expect(viewport).toBeInstanceOf(CustomProjectionViewport);
  expect(viewport).toMatchObject({
    id: 'custom',
    x: 200,
    y: 10,
    width: 400,
    height: 450,
    pitch: 40,
    bearing: -30,
    zoom: 2,
    resolution: 2
  });
  expect(viewport.padding).toMatchObject({left: 80, bottom: 20});
  expect(viewport.getPreprojection(WGS84_CRS).preproject!([450, 100, 2])[2]).toBe(2);
  expect(viewport.projectPosition([450, 100, 2])[2]).toBe(2 * (512 / 40075016.6855));
});

test('CustomProjectionView clone, equality, state overrides and zero dimensions', async () => {
  const view = new CustomProjectionView({...options, viewState: {zoom: 4}});
  await view.initialize();
  expect(view.clone({}).equals(view)).toBe(true);
  expect(view.clone({crs: 'changed'}).equals(view)).toBe(false);
  expect(view.makeViewport({width: 800, height: 600, viewState})!.zoom).toBe(4);
  expect(view.makeViewport({width: 800, height: 600, viewState})!.pitch).toBe(0);
  expect(view.makeViewport({width: 0, height: 600, viewState})).toBeNull();
  expect(view.makeViewport({width: 800, height: 0, viewState})).toBeNull();
});

test('CustomProjectionView configures its default and custom controllers', () => {
  expect(new CustomProjectionView(options).controller).toBeNull();
  expect(new CustomProjectionView({...options, controller: false}).controller).toBeNull();
  expect(new CustomProjectionView({...options, controller: true}).controller!.type).toBe(
    CustomProjectionController
  );
  expect(
    new CustomProjectionView({...options, controller: {keyboard: false}}).controller
  ).toMatchObject({type: CustomProjectionController, keyboard: false});
  class CustomController extends CustomProjectionController {}
  expect(
    new CustomProjectionView({...options, controller: {type: CustomController}}).controller!.type
  ).toBe(CustomController);
});

test('ViewManager immediately uses a loaded CRS and retains it across equal descriptors', async () => {
  const view = new CustomProjectionView({...options, id: 'custom'});
  const manager = new ViewManager({views: [view], viewState, width: 800, height: 600});
  try {
    expect(manager.getViewports()).toHaveLength(1);
    manager.setProps({views: [new CustomProjectionView({...options, id: 'custom'})]});
    await view.initialize();
    expect(manager.updateViewports()).toBe(false);
    expect(manager.getViewports()).toHaveLength(1);
    expect(manager.getViewports()[0]).toBeInstanceOf(CustomProjectionViewport);
  } finally {
    manager.finalize();
  }
});

test('removed custom views cannot rebuild the manager after CRS loading completes', async () => {
  const view = new CustomProjectionView(options);
  const manager = new ViewManager({views: [view], viewState, width: 800, height: 600});
  manager.setProps({views: []});
  manager.needsRedraw({clearRedrawFlags: true});
  await view.initialize();
  expect(manager.needsRedraw()).toBe(false);
  expect(manager.getViewports()).toHaveLength(0);
  manager.finalize();
});

test('invalid target CRS errors reach ViewManager onError', async () => {
  const view = new CustomProjectionView({crs: '+proj=not-a-projection'});
  const onError = vi.fn();
  const manager = new ViewManager({views: [view], viewState, onError});
  try {
    await expect(view.initialize()).rejects.toThrow();
    await Promise.resolve();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(manager.getViewports()).toHaveLength(0);
  } finally {
    manager.finalize();
  }
});

test('CustomProjectionView shares pending CRS resolution and initializes loaded CRS synchronously', async () => {
  const crs = '+proj=eqearth +lon_0=17 +datum=WGS84 +units=m';
  const first = new CustomProjectionView({crs});
  const pending = first.initialize();
  expect(pending).toBeInstanceOf(Promise);
  expect(first.initialize()).toBe(pending);
  expect(first.makeViewport({width: 800, height: 600, viewState})).toBeNull();
  const second = new CustomProjectionView({crs});
  await Promise.all([pending, second.initialize()]);
  expect(first.makeViewport({width: 800, height: 600, viewState})).toBeInstanceOf(
    CustomProjectionViewport
  );
  expect(second.makeViewport({width: 800, height: 600, viewState})).toBeInstanceOf(
    CustomProjectionViewport
  );
  const loaded = new CustomProjectionView({crs});
  expect(loaded.initialize()).toBeUndefined();
  expect(loaded.makeViewport({width: 800, height: 600, viewState})).toBeInstanceOf(
    CustomProjectionViewport
  );
});

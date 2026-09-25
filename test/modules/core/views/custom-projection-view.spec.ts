// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import * as core from '@deck.gl/core';
import * as deck from 'deck.gl';
import {
  _CustomProjectionView as CustomProjectionView,
  _CustomProjectionViewport as CustomProjectionViewport,
  _CustomProjectionController as CustomProjectionController
} from '@deck.gl/core';

const options = {
  projection: {forward: position => position.slice(), inverse: position => position.slice()}
};
const viewState = {center: [0, 0, 0] as [number, number, number], zoom: 2};

test('CustomProjectionView does not require toBounds', () => {
  const view = new CustomProjectionView({projection: options.projection});
  const viewport = view.makeViewport({width: 800, height: 600, viewState})!;
  expect(viewport.preproject!([0, 0])).toEqual([256, 256, 0]);
  expect(viewport.preproject!([40075016.6855 / 2, 0])).toEqual([512, 256, 0]);
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

test('CustomProjectionView constructs its viewport with layout, state and projection options', () => {
  const view = new CustomProjectionView({
    ...options,
    id: 'custom',
    x: '25%',
    y: 10,
    width: '50%',
    height: '75%',
    padding: {left: '10%', bottom: 20},
    resolution: 2,
    fromCrs: 'local',
    toCrs: 'local-output',
    getDistanceScale: () => [1 / 3, 1 / 3],
    fromBounds: [0, 0, 400, 400]
  });
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
  const position = viewport.preproject!([450, -5, 2]);
  const normalizationScale = 512 / 40075016.6855;
  expect(position).toEqual([256 + 400 * normalizationScale, 256, 2]);
  expect(viewport.projectPosition([450, -5, 2])).toEqual([
    position[0],
    position[1],
    6 * normalizationScale
  ]);
});

test('CustomProjectionView clone, equality, state overrides and zero dimensions', () => {
  const view = new CustomProjectionView({...options, viewState: {zoom: 4}});
  expect(view.clone({}).equals(view)).toBe(true);
  expect(view.clone({toCrs: 'changed'}).equals(view)).toBe(false);
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

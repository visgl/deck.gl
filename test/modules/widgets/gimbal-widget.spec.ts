// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {OrbitView, type OrbitViewState} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('GimbalWidget', async () => {
  let viewState: OrbitViewState = {
    target: [0, 0, 0],
    zoom: 0,
    rotationOrbit: 30,
    rotationX: 45
  };
  const onReset = vi.fn();
  testInstance = new WidgetTester({
    views: new OrbitView({id: 'orbit'}),
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new GimbalWidget({id: 'gimbal', onReset})]
  });

  await testInstance.idle();

  const outerRing = testInstance.findElements('.gimbal-outer-ring')[0] as SVGElement;
  const innerRing = testInstance.findElements('.gimbal-inner-ring')[0] as SVGElement;
  expect(outerRing.style.transform).toBe('rotateY(-30deg)');
  expect(innerRing.style.transform).toBe('rotateX(45deg)');

  testInstance.click('.deck-widget-button > button');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'orbit',
    rotationOrbit: 0,
    rotationX: 0
  });
  expect(viewState.rotationOrbit).toBe(0);
  expect(viewState.rotationX).toBe(0);
});

test('GimbalWidget#resetOrbitView calls onReset and sets view state', async () => {
  const onReset = vi.fn();
  const widget = new GimbalWidget({onReset});
  testInstance = new WidgetTester({
    views: new OrbitView({id: 'orbit'}),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0,
      rotationOrbit: 30,
      rotationX: 45
    },
    widgets: [widget]
  });

  await testInstance.idle();

  widget.resetOrbitView();
  expect(onReset).toHaveBeenCalledWith({viewId: 'OrbitView', rotationOrbit: 0, rotationX: 0});
});

test('GimbalWidget#normalizeRotation', () => {
  const widget = new GimbalWidget();
  const spy = vi.spyOn(widget, 'getViewState');

  const cases: {viewState: Partial<OrbitViewState>; expected: any}[] = [
    {
      viewState: {},
      expected: {rotationOrbit: 0, rotationX: 0}
    },
    {
      viewState: {
        rotationOrbit: 30,
        rotationX: 45
      },
      expected: {rotationOrbit: -30, rotationX: 45}
    },
    {
      viewState: {
        rotationOrbit: -270,
        rotationX: 270
      },
      expected: {rotationOrbit: -90, rotationX: -90}
    },
    {
      viewState: {
        rotationOrbit: -80,
        rotationX: 80
      },
      expected: {rotationOrbit: 80, rotationX: 80}
    },
    {
      viewState: {
        rotationOrbit: -85,
        rotationX: 85
      },
      expected: {rotationOrbit: 100, rotationX: 100}
    },
    {
      viewState: {
        rotationOrbit: -95,
        rotationX: 95
      },
      expected: {rotationOrbit: 100, rotationX: 100}
    }
  ];

  for (const {viewState, expected} of cases) {
    spy.mockReturnValueOnce(viewState);
    expect(widget.getNormalizedRotation()).toEqual(expected);
  }
});

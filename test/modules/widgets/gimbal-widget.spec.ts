// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {OrbitView, type OrbitViewState} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('GimbalWidget', async () => {
  let viewState: OrbitViewState = {
    target: [0, 0, 0],
    zoom: 0,
    rotationOrbit: 30,
    rotationX: 45
  };
  const onReset = vi.fn();
  const testInstance = new WidgetTester({
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

  testInstance.destroy();
});

test('GimbalWidget#resetOrbitView calls onReset and sets view state', async () => {
  const onReset = vi.fn();
  const widget = new GimbalWidget({onReset});
  const testInstance = new WidgetTester({
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

  testInstance.destroy();
});

import test from 'tape-promise/tape';
import {FirstPersonView} from '@deck.gl/core';

test('FirstPersonView#makeViewport', t => {
  const view = new FirstPersonView();
  const testCases = [
    {
      title: 'default view state',
      viewState: {longitude: 0, latitude: 0, position: [0, 0, 0]}
    },
    {
      title: 'pitch=90',
      viewState: {longitude: 0, latitude: 0, position: [0, 0, 1], pitch: 90, bearing: 0}
    },
    {
      title: 'pitch=-90',
      viewState: {longitude: 0, latitude: 0, position: [0, 0, 1], pitch: -90, bearing: 0}
    }
  ];

  for (const testCase of testCases) {
    const viewport = view.makeViewport({
      width: 100,
      height: 100,
      viewState: testCase.viewState
    });
    t.ok(viewport.pixelUnprojectionMatrix, testCase.title);
  }

  t.end();
});

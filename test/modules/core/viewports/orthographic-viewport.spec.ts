// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {OrthographicViewport} from '@deck.gl/core';

test('OrthographicViewport#imports', t => {
  t.ok(OrthographicViewport, 'OrthographicViewport import ok');
  t.end();
});

test('OrthographicViewport#constructor - default props', t => {
  const viewport = new OrthographicViewport({
    width: 800,
    height: 600
  });

  t.ok(viewport instanceof OrthographicViewport, 'Created OrthographicViewport');
  t.deepEqual(viewport.target, [0, 0, 0], 'default target');
  t.is(viewport.zoomX, 0, 'default zoomX');
  t.is(viewport.zoomY, 0, 'default zoomY');
  t.is(viewport.flipY, true, 'default flipY');
  t.is(viewport.rotationOrbit, 0, 'default rotationOrbit');
  t.end();
});

test('OrthographicViewport#constructor - custom props', t => {
  const viewport = new OrthographicViewport({
    width: 800,
    height: 600,
    target: [100, 200, 0],
    zoom: 2,
    flipY: false,
    rotationOrbit: 45
  });

  t.ok(viewport instanceof OrthographicViewport, 'Created OrthographicViewport');
  t.deepEqual(viewport.target, [100, 200, 0], 'custom target');
  t.is(viewport.zoomX, 2, 'custom zoomX');
  t.is(viewport.zoomY, 2, 'custom zoomY');
  t.is(viewport.flipY, false, 'custom flipY');
  t.is(viewport.rotationOrbit, 45, 'custom rotationOrbit');
  t.end();
});

test('OrthographicViewport#rotationOrbit - viewMatrix changes with rotation', t => {
  const viewport0 = new OrthographicViewport({
    width: 800,
    height: 600,
    rotationOrbit: 0
  });

  const viewport90 = new OrthographicViewport({
    width: 800,
    height: 600,
    rotationOrbit: 90
  });

  const viewport180 = new OrthographicViewport({
    width: 800,
    height: 600,
    rotationOrbit: 180
  });

  t.notDeepEqual(
    viewport0.viewMatrix,
    viewport90.viewMatrix,
    'viewMatrix differs with 90 degree rotation'
  );
  t.notDeepEqual(
    viewport0.viewMatrix,
    viewport180.viewMatrix,
    'viewMatrix differs with 180 degree rotation'
  );
  t.notDeepEqual(
    viewport90.viewMatrix,
    viewport180.viewMatrix,
    'viewMatrix differs between 90 and 180 degree rotation'
  );
  t.end();
});

test('OrthographicViewport#rotationOrbit - project/unproject consistency', t => {
  const viewport = new OrthographicViewport({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: 0,
    rotationOrbit: 45
  });

  const worldPos = [100, 100, 0];
  const screenPos = viewport.project(worldPos);
  const unprojected = viewport.unproject(screenPos);

  t.ok(
    Math.abs(unprojected[0] - worldPos[0]) < 0.001 &&
      Math.abs(unprojected[1] - worldPos[1]) < 0.001,
    'project/unproject roundtrip consistent with rotation'
  );
  t.end();
});

test('OrthographicViewport#rotationOrbit - independent zoom axes', t => {
  const viewport = new OrthographicViewport({
    width: 800,
    height: 600,
    zoom: [1, 2],
    rotationOrbit: 30
  });

  t.is(viewport.zoomX, 1, 'independent zoomX');
  t.is(viewport.zoomY, 2, 'independent zoomY');
  t.is(viewport.rotationOrbit, 30, 'rotationOrbit with independent zoom');
  t.end();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it} from 'vitest';
import {OrbitViewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import SplatLayer, {getSplatHierarchyView} from '../splat-layer/splat-layer';

describe('SplatLayer camera math', () => {
  it.each([0, 45, 135])(
    'keeps the camera and projection in the same source space at %s degrees',
    rotationOrbit => {
      const modelMatrix = new Matrix4()
        .translate([2, -3, 1])
        .rotateX(-Math.PI / 2)
        .scale(0.5);
      const viewport = new OrbitViewport({
        width: 1200,
        height: 800,
        orbitAxis: 'Z',
        target: [2, -3, 1],
        rotationOrbit,
        rotationX: 30,
        zoom: 9,
        fovy: 75
      });
      const view = getSplatHierarchyView(viewport, modelMatrix, 2);
      const worldCamera = modelMatrix.transformAsPoint(view.cameraPosition);
      worldCamera.forEach((value, axis) =>
        expect(value).toBeCloseTo(viewport.cameraPosition[axis], 10)
      );
      expect(view.verticalFieldOfView).toBeCloseTo((75 * Math.PI) / 180, 10);
      expect(view.viewportSize).toEqual([2400, 1600]);
      for (const point of [
        [0, 0, 0],
        [0.1, -0.1, 0.1],
        [-0.2, 0.3, 0.05]
      ]) {
        const expected = viewport.project(modelMatrix.transformAsPoint(point));
        const clip = new Matrix4(view.modelViewProjectionMatrix).transformAsPoint(point);
        expect((clip[0] * 0.5 + 0.5) * view.viewportSize[0]).toBeCloseTo(expected[0] * 2, 8);
        expect((0.5 - clip[1] * 0.5) * view.viewportSize[1]).toBeCloseTo(expected[1] * 2, 8);
      }
    }
  );

  it('moves the camera closer by two for one orbit zoom level', () => {
    const modelMatrix = new Matrix4().rotateX(-Math.PI / 2);
    const distance = (zoom: number) =>
      Math.hypot(
        ...getSplatHierarchyView(
          new OrbitViewport({width: 1000, height: 1000, zoom, target: [0, 0, 0]}),
          modelMatrix,
          1
        ).cameraPosition
      );
    expect(distance(10) / distance(11)).toBeCloseTo(2, 10);
  });
});

describe('SplatLayer source contract', () => {
  it('does not count a RAD URL as a deck attribute table', () => {
    const layer = new SplatLayer({id: 'url', data: 'https://example.com/scene.rad'});
    expect(layer.props.data).toBe('https://example.com/scene.rad');
    expect(layer.getNumInstances()).toBe(0);
  });

  it('does not infer instances from a RAD Blob', () => {
    const source = new Blob(['RAD']);
    const layer = new SplatLayer({id: 'blob', data: source});
    expect(layer.props.data).toBe(source);
    expect(layer.getNumInstances()).toBe(0);
  });
});

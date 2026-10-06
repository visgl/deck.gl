// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it} from 'vitest';
import {FirstPersonViewport, OrbitViewport} from '@deck.gl/core';
import {Timeline} from '@luma.gl/engine';
import {Matrix4} from '@math.gl/core';
import SplatLayer, {getSplatHierarchyView} from '../splat-layer/splat-layer';
import {SplatCameraController, CAMERA_PROPS, MODEL_MATRIX, getInitialViewState} from '../camera';

describe('Coit world-space camera', () => {
  it('preserves the authored projection when switching from orbit to physical camera units', () => {
    const height = 720;
    const target: [number, number, number] = [0.0226670563, 0.0141479052, 0.1886351632];
    const offset = [-0.0858 - target[0], 0.1128 - target[1], 0.2203 - target[2]];
    const distance = Math.hypot(...offset);
    const oldViewport = new OrbitViewport({
      width: 1200,
      height,
      target,
      orbitAxis: 'Z',
      fovy: 75,
      rotationOrbit: (Math.atan2(-offset[0], -offset[1]) * 180) / Math.PI,
      rotationX: (Math.asin(offset[2] / distance) * 180) / Math.PI,
      zoom: Math.log2(height / (2 * Math.tan((75 * Math.PI) / 360)) / distance)
    });
    const viewport = new FirstPersonViewport({
      width: 1200,
      height,
      ...CAMERA_PROPS,
      ...getInitialViewState()
    });
    for (const point of [
      [0, 0, 0],
      [0.05, -0.1, 0.2]
    ]) {
      const oldPixel = oldViewport.project(
        new Matrix4().rotateX(-Math.PI / 2).transformAsPoint(point)
      );
      const pixel = viewport.project(MODEL_MATRIX.transformAsPoint(point));
      expect(pixel[0]).toBeCloseTo(oldPixel[0], 6);
      expect(pixel[1]).toBeCloseTo(oldPixel[1], 6);
    }
    const view = getSplatHierarchyView(viewport, MODEL_MATRIX, 1);
    const sourceEye = new Matrix4()
      .rotateX(Math.PI / 2)
      .transformAsPoint([-0.0858, 0.1128, 0.2203]);
    view.cameraPosition.forEach((value, index) => expect(value).toBeCloseTo(sourceEye[index], 10));
  });

  it('moves through the old orbit pivot without shrinking the clip range', () => {
    const controller = new SplatCameraController({
      timeline: new Timeline(),
      eventManager: {on() {}, off() {}} as never,
      makeViewport: props => new FirstPersonViewport({...CAMERA_PROPS, ...props}),
      onViewStateChange() {},
      onStateChange() {}
    });
    const initial = {...getInitialViewState(), width: 1200, height: 720};
    let state = new controller.ControllerState({
      ...initial,
      makeViewport: props => new FirstPersonViewport({...CAMERA_PROPS, ...props})
    });
    const projections: number[][] = [];
    const eyes: number[][] = [Array.from(state.getViewportProps().position!)];
    const chained = state
      .zoomStart()
      .zoom({pos: [600, 360], scale: 2})
      .zoomEnd()
      .zoomIn();
    expect(
      Math.hypot(...chained.getViewportProps().position.map((value, axis) => value - eyes[0][axis]))
    ).toBeCloseTo(40, 8);
    expect(chained.getViewportProps().position[2]).toBeLessThan(eyes[0][2]);
    for (let step = 0; step < 12; step++) {
      const moved = state.zoom({pos: [600, 360], scale: 2});
      state = new controller.ControllerState({
        ...moved.getViewportProps(),
        makeViewport: props => new FirstPersonViewport({...CAMERA_PROPS, ...props})
      });
      const viewport = new FirstPersonViewport({...CAMERA_PROPS, ...state.getViewportProps()});
      eyes.push(Array.from(viewport.cameraPosition));
      projections.push(Array.from(viewport.projectionMatrix));
    }
    for (let index = 1; index < eyes.length; index++) {
      expect(
        Math.hypot(...eyes[index].map((value, axis) => value - eyes[index - 1][axis]))
      ).toBeCloseTo(20, 8);
      expect(eyes[index][2]).toBeLessThan(eyes[index - 1][2]);
    }
    expect(
      projections.every(matrix => matrix.every((value, axis) => value === projections[0][axis]))
    ).toBe(true);
    expect(eyes.at(-1)![0]).toBeGreaterThan(22.6670563);
    // The old orbit camera clipped a centered point one source unit beyond its pivot at zoom 20.
    const oldDeep = new OrbitViewport({
      width: 1200,
      height: 720,
      target: [0, 0, 0],
      orbitAxis: 'Z',
      zoom: 20,
      near: 0.01,
      far: 1000
    });
    expect(oldDeep.project([0, 1, 0])[2]).toBeGreaterThan(1);
    const physical = new FirstPersonViewport({
      width: 1200,
      height: 720,
      position: [0, 0, 0],
      bearing: 0,
      pitch: 0,
      ...CAMERA_PROPS
    });
    expect(physical.project([0, 1000, 0])[2]).toBeLessThan(1);
    controller.finalize();
  });
});

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

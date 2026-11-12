// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {OrthographicView} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';
import {WebGPUAggregator} from '../../../../modules/aggregation-layers/src/common/aggregator/webgpu-aggregator/webgpu-aggregator';

for (const filtering of [false, true]) {
  test(`Hexagon compute domains, picking, and scales (filtering=${filtering})`, async ({skip}) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const callback = vi.fn();
    const errors: Error[] = [];
    device.handle.pushErrorScope('validation');
    try {
      await testLayerAsync({
        Layer: HexagonLayer,
        device,
        viewport: new OrthographicView().makeViewport({
          width: 200,
          height: 200,
          viewState: {target: [0, 0, 0], zoom: 0}
        }),
        onError: error => {
          errors.push(error);
        },
        testCases: [
          {
            props: {
              data: [
                {position: [2, 2], value: 2, filter: 0},
                {position: [3, 3], value: 3, filter: 2},
                {position: [22, 22], value: 4, filter: 0}
              ],
              getPosition: d => d.position,
              getColorWeight: d => d.value,
              getElevationWeight: d => d.value,
              radius: 10,
              pickable: true,
              onSetColorDomain: callback,
              extensions: filtering ? [new DataFilterExtension({filterSize: 1})] : [],
              getFilterValue: d => d.filter,
              filterRange: [0, 1]
            },
            async onAfterUpdate({layer}) {
              const aggregator = layer.state.aggregator;
              expect(aggregator).toBeInstanceOf(WebGPUAggregator);
              await vi.waitFor(() => expect(aggregator.getResultValues(0)).not.toBeNull(), {
                timeout: 10000
              });
              expect(aggregator.getResultDomain(0)).toEqual(filtering ? [2, 4] : [4, 5]);
              const pickedIndex = Array.from({length: aggregator.binCount}, (_, i) => i).find(i =>
                aggregator.getBin(i)
              )!;
              expect(
                layer.getPickingInfo({info: {index: pickedIndex}} as any).object.count
              ).toBeGreaterThan(0);
              expect(callback).toHaveBeenCalledWith(filtering ? [2, 4] : [4, 5]);
              const bins = Array.from({length: aggregator.binCount}, (_, i) =>
                aggregator.getBin(i)
              ).filter(Boolean);
              expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(filtering ? 2 : 3);
              for (const scaleType of ['quantile', 'ordinal']) {
                const scaled = layer.state.colors.update({
                  scaleType,
                  lowerPercentile: 0,
                  upperPercentile: 100
                });
                expect(scaled.domain).toEqual(scaleType === 'quantile' ? [0, 99] : [0, 1]);
              }
              layer.state.colors.update({
                scaleType: 'linear',
                lowerPercentile: 25,
                upperPercentile: 75
              });
              expect(layer.state.colors.cutoff).not.toBeNull();
            }
          }
        ]
      });
      expect(errors).toEqual([]);
    } finally {
      expect(await device.handle.popErrorScope()).toBeNull();
    }
  });
}

for (const explicitDomains of [false, true]) {
  test(`Hexagon keeps cells during readback (explicit domains=${explicitDomains})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const {LayerManager} = await import('@deck.gl/core');
    const viewport = new OrthographicView().makeViewport({
      width: 200,
      height: 200,
      viewState: {target: [0, 0, 0], zoom: 0}
    });
    const manager = new LayerManager(device, {viewport});
    let layer = new HexagonLayer({
      id: 'retained-hexagons',
      data: [
        {position: [2, 2], value: 2},
        {position: [22, 22], value: 4}
      ],
      getPosition: d => d.position,
      getColorWeight: d => d.value,
      getElevationWeight: d => d.value,
      radius: 10,
      pickable: true,
      ...(explicitDomains ? {colorDomain: [0, 10], elevationDomain: [0, 10]} : {})
    });
    const draw = () =>
      layer.draw({
        shaderModuleProps: {
          project: {
            viewport,
            coordinateSystem: 'cartesian',
            coordinateOrigin: [0, 0, 0],
            devicePixelRatio: 1
          }
        }
      } as any);
    try {
      manager.setLayers([layer]);
      if (explicitDomains) expect(layer.renderLayers()).not.toBeNull();
      draw();
      await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {timeout: 10000});
      let previous = layer.renderLayers() as any;
      expect(previous).not.toBeNull();
      for (const radius of [20, 5]) {
        const oldRadius = previous.props.radius;
        layer = layer.clone({radius});
        manager.setLayers([layer]);
        expect(layer.state.aggregator.isLoaded).toBe(false);
        const pending = layer.renderLayers() as any;
        expect(pending).not.toBeNull();
        expect(pending.props.pickable).toBe(false);
        if (explicitDomains) expect(pending.props.radius).toBe(layer.state.radiusCommon);
        else {
          expect(pending.props.radius).toBe(oldRadius);
          expect(pending.props.numInstances).toBe(previous.props.numInstances);
          expect(pending.props.data.attributes.getBin.value).toBeInstanceOf(Float32Array);
          expect(pending.props.data.attributes.getColorValue.value).toBeInstanceOf(Float32Array);
        }
        draw();
        // Still visible while the async snapshot is unavailable.
        expect(layer.renderLayers()).not.toBeNull();
        await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {
          timeout: 10000
        });
        const completed = layer.renderLayers() as any;
        expect(completed.props.radius).toBe(layer.state.radiusCommon);
        expect(completed.props.pickable).toBe(true);
        previous = completed;
      }
      layer = layer.clone({_subLayerProps: {cells: {pickable: false}}});
      manager.setLayers([layer]);
      expect((layer.renderLayers() as any).props.pickable).toBe(false);
      layer = layer.clone({pickable: false, _subLayerProps: {cells: {pickable: true}}});
      manager.setLayers([layer]);
      draw();
      await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {timeout: 10000});
      expect((layer.renderLayers() as any).props.pickable).toBe(true);
    } finally {
      manager.finalize();
    }
  });
}

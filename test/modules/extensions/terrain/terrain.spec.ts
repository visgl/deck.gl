// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

import {geojson} from 'deck.gl-test/data';

test('TerrainExtension', () => {
  const extractSubLayers = subLayers => {
    return {
      scatterplotLayer: subLayers.find(l => l.id.endsWith('points-circle')),
      pathLayer: subLayers.find(l => l.id.endsWith('linestrings')),
      solidPolygonLayer: subLayers.find(l => l.id.endsWith('polygons-fill'))
    };
  };

  const testCases = [
    {
      props: {
        id: 'terrain-extension-test',
        data: geojson,
        extensions: [new TerrainExtension()]
      },
      onAfterUpdate: ({layer, subLayers}) => {
        const {scatterplotLayer, pathLayer, solidPolygonLayer} = extractSubLayers(subLayers);
        expect(
          scatterplotLayer.state.terrainDrawMode,
          'ScatterplotLayer has correct fitting mode'
        ).toBe('offset');
        expect(pathLayer.state.terrainDrawMode, 'PathLayer has correct fitting mode').toBe('drape');
        expect(
          solidPolygonLayer.state.terrainDrawMode,
          'SolidPolygonLayer has correct fitting mode'
        ).toBe('drape');

        const {layerManager} = layer.context;
        expect(layerManager.needsRedraw({clearRedrawFlags: true})).toBeTruthy();

        expect(
          scatterplotLayer.state.terrainCoverNeedsRedraw,
          'ScatterplotLayer does not draw to terrain cover'
        ).toBeFalsy();
        expect(
          pathLayer.state.terrainCoverNeedsRedraw,
          'PathLayer marked as needs redraw'
        ).toBeTruthy();
        expect(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer marked as needs redraw'
        ).toBeTruthy();

        pathLayer.state.terrainCoverNeedsRedraw = false;
        solidPolygonLayer.state.terrainCoverNeedsRedraw = false;
      }
    },
    {
      updateProps: {
        extruded: true
      },
      onAfterUpdate: ({layer, subLayers}) => {
        const {scatterplotLayer, pathLayer, solidPolygonLayer} = extractSubLayers(subLayers);
        expect(
          scatterplotLayer.state.terrainDrawMode,
          'ScatterplotLayer has correct fitting mode'
        ).toBe('offset');
        expect(pathLayer.state.terrainDrawMode, 'PathLayer has correct fitting mode').toBe('drape');
        expect(
          solidPolygonLayer.state.terrainDrawMode,
          'SolidPolygonLayer has correct fitting mode'
        ).toBe('offset');

        const {layerManager} = layer.context;
        expect(layerManager.needsRedraw({clearRedrawFlags: true})).toBeTruthy();

        expect(
          pathLayer.state.terrainCoverNeedsRedraw,
          'PathLayer does not need redraw'
        ).toBeFalsy();
        expect(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer does not draw to terrain cover'
        ).toBeFalsy();
      }
    },
    {
      updateProps: {
        terrainDrawMode: 'drape'
      },
      onAfterUpdate: ({layer, subLayers}) => {
        const {scatterplotLayer, pathLayer, solidPolygonLayer} = extractSubLayers(subLayers);
        expect(
          scatterplotLayer.state.terrainDrawMode,
          'ScatterplotLayer has correct fitting mode'
        ).toBe('drape');
        expect(pathLayer.state.terrainDrawMode, 'PathLayer has correct fitting mode').toBe('drape');
        expect(
          solidPolygonLayer.state.terrainDrawMode,
          'SolidPolygonLayer has correct fitting mode'
        ).toBe('drape');

        const {layerManager} = layer.context;
        expect(layerManager.needsRedraw({clearRedrawFlags: true})).toBeTruthy();

        expect(
          scatterplotLayer.state.terrainCoverNeedsRedraw,
          'ScatterplotLayer marked as needs redraw'
        ).toBeTruthy();
        expect(
          pathLayer.state.terrainCoverNeedsRedraw,
          'PathLayer marked as needs redraw'
        ).toBeTruthy();
        expect(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer marked as needs redraw'
        ).toBeTruthy();

        scatterplotLayer.state.terrainCoverNeedsRedraw = false;
        pathLayer.state.terrainCoverNeedsRedraw = false;
        solidPolygonLayer.state.terrainCoverNeedsRedraw = false;
      }
    }
  ];

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: GeoJsonLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

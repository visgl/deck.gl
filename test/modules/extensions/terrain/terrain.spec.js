import test from 'tape-promise/tape';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

import {geojson} from 'deck.gl-test/data';

test('TerrainExtension', t => {
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
        t.is(
          scatterplotLayer.state.terrainDrawMode,
          'offset',
          'ScatterplotLayer has correct fitting mode'
        );
        t.is(pathLayer.state.terrainDrawMode, 'drape', 'PathLayer has correct fitting mode');
        t.is(
          solidPolygonLayer.state.terrainDrawMode,
          'drape',
          'SolidPolygonLayer has correct fitting mode'
        );

        const {layerManager} = layer.context;
        t.ok(layerManager.needsRedraw({clearRedrawFlags: true}));

        t.notOk(
          scatterplotLayer.state.terrainCoverNeedsRedraw,
          'ScatterplotLayer does not draw to terrain cover'
        );
        t.ok(pathLayer.state.terrainCoverNeedsRedraw, 'PathLayer marked as needs redraw');
        t.ok(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer marked as needs redraw'
        );

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
        t.is(
          scatterplotLayer.state.terrainDrawMode,
          'offset',
          'ScatterplotLayer has correct fitting mode'
        );
        t.is(pathLayer.state.terrainDrawMode, 'drape', 'PathLayer has correct fitting mode');
        t.is(
          solidPolygonLayer.state.terrainDrawMode,
          'offset',
          'SolidPolygonLayer has correct fitting mode'
        );

        const {layerManager} = layer.context;
        t.ok(layerManager.needsRedraw({clearRedrawFlags: true}));

        t.notOk(pathLayer.state.terrainCoverNeedsRedraw, 'PathLayer does not need redraw');
        t.notOk(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer does not draw to terrain cover'
        );
      }
    },
    {
      updateProps: {
        terrainDrawMode: 'drape'
      },
      onAfterUpdate: ({layer, subLayers}) => {
        const {scatterplotLayer, pathLayer, solidPolygonLayer} = extractSubLayers(subLayers);
        t.is(
          scatterplotLayer.state.terrainDrawMode,
          'drape',
          'ScatterplotLayer has correct fitting mode'
        );
        t.is(pathLayer.state.terrainDrawMode, 'drape', 'PathLayer has correct fitting mode');
        t.is(
          solidPolygonLayer.state.terrainDrawMode,
          'drape',
          'SolidPolygonLayer has correct fitting mode'
        );

        const {layerManager} = layer.context;
        t.ok(layerManager.needsRedraw({clearRedrawFlags: true}));

        t.ok(
          scatterplotLayer.state.terrainCoverNeedsRedraw,
          'ScatterplotLayer marked as needs redraw'
        );
        t.ok(pathLayer.state.terrainCoverNeedsRedraw, 'PathLayer marked as needs redraw');
        t.ok(
          solidPolygonLayer.state.terrainCoverNeedsRedraw,
          'SolidPolygonLayer marked as needs redraw'
        );

        scatterplotLayer.state.terrainCoverNeedsRedraw = false;
        pathLayer.state.terrainCoverNeedsRedraw = false;
        solidPolygonLayer.state.terrainCoverNeedsRedraw = false;
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

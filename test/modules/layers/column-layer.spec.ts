// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {Deck, GlobeView, MapView} from '@deck.gl/core';
import {ColumnLayer, GridCellLayer} from '@deck.gl/layers';
import {device, testLayer} from '@deck.gl/test-utils/vitest';

function expectUniqueGeometryLayout(layer: ColumnLayer): void {
  const model = layer.state.fillModel!;
  const bufferNames = model.bufferLayout.map(layout => layout.name);
  expect(new Set(bufferNames).size, `${model.id} has unique buffer layouts`).toBe(
    bufferNames.length
  );
  expect(
    bufferNames.filter(name => name === 'geometry'),
    `${model.id} has one geometry buffer layout`
  ).toHaveLength(1);

  const geometryLayout = model.bufferLayout.find(layout => layout.name === 'geometry');
  const attachedGeometryLayout = model._gpuGeometry?.bufferLayout.find(
    layout => layout.name === 'geometry'
  );
  expect(
    geometryLayout?.attributes?.map(attribute => attribute.attribute),
    `${model.id} geometry attributes`
  ).toEqual(['positions', 'normals']);
  expect(attachedGeometryLayout, `${model.id} has an attached geometry buffer layout`).toBeTruthy();
  expect(geometryLayout, `${model.id} layout matches its attached geometry`).toEqual(
    attachedGeometryLayout
  );

  const pipelineBufferNames = model.pipeline.bufferLayout.map(layout => layout.name);
  expect(new Set(pipelineBufferNames).size, `${model.id} pipeline has unique buffer layouts`).toBe(
    pipelineBufferNames.length
  );
  expect(
    pipelineBufferNames.filter(name => name === 'geometry'),
    `${model.id} pipeline has one geometry buffer layout`
  ).toHaveLength(1);
}

// Regression test for #9463 / #10021: with binary data the fill model must
// never acquire the wireframe index buffer, even after a buffer-layout rebuild
// (which happens on binary-data transitions and HMR).
test('ColumnLayer - fill model never acquires wireframe indices', () => {
  testLayer({
    Layer: ColumnLayer,
    testCases: [
      {
        title: 'binary data',
        props: {
          data: {
            length: 3,
            attributes: {
              getPosition: {value: new Float64Array([37, 122, 37.1, 122, 37, 122.8]), size: 2},
              getFillColor: {
                value: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
                size: 4
              },
              getElevation: {value: new Float32Array([100, 200, 300]), size: 1}
            }
          },
          radius: 10,
          extruded: true
        },
        onAfterUpdate: ({layer}) => {
          const fillModel = layer.state.fillModel!;
          const wireframeModel = layer.state.wireframeModel!;

          expect(
            wireframeModel.vertexArray.indexBuffer,
            'wireframe model keeps geometry indices'
          ).toBeTruthy();
          expect(
            fillModel.vertexArray.indexBuffer,
            'fill model has no wireframe indices after initial update'
          ).toBeFalsy();

          // Simulate the vertex-array rebuild that caused the original leak
          // (Layer._setModelAttributes -> Model.setBufferLayout when attribute
          // buffer layouts change, e.g. binary-data transitions / HMR).
          fillModel.setBufferLayout(fillModel.bufferLayout);

          expect(
            fillModel.vertexArray.indexBuffer,
            'fill model still has no wireframe indices after buffer-layout rebuild'
          ).toBeFalsy();
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('ColumnLayer - geometry updates preserve a unique buffer layout', () => {
  testLayer({
    Layer: ColumnLayer,
    testCases: [
      {
        title: 'initial geometry',
        props: {
          data: [{position: [0, 0]}],
          diskResolution: 6,
          extruded: true
        },
        onAfterUpdate: ({layer}) => expectUniqueGeometryLayout(layer)
      },
      {
        title: 'update disk resolution',
        updateProps: {diskResolution: 8},
        onAfterUpdate: ({layer}) => expectUniqueGeometryLayout(layer)
      },
      {
        title: 'update extrusion',
        updateProps: {extruded: false},
        onAfterUpdate: ({layer}) => expectUniqueGeometryLayout(layer)
      },
      {
        title: 'update vertices',
        updateProps: {
          diskResolution: 4,
          vertices: [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1]
          ]
        },
        onAfterUpdate: ({layer}) => expectUniqueGeometryLayout(layer)
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('GridCellLayer - packed geometry matches the model buffer layout', () => {
  testLayer({
    Layer: GridCellLayer,
    testCases: [
      {
        title: 'cube geometry',
        props: {
          data: [{position: [0, 0]}],
          extruded: true
        },
        onAfterUpdate: ({layer}) => expectUniqueGeometryLayout(layer)
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('ColumnLayer - cap regenerates extruded geometry and is ignored for flat columns', () => {
  // diskResolution 8 => 9 vertices around the edge
  const FLAT_VERTEX_COUNT = 9 * 3 + 1;
  // capSegs: dome = max(2, round(8 / 4)) = 2, cone = 1
  const DOME_VERTEX_COUNT = 9 * 2 * (1 + 2) + 2 * 2;
  const CONE_VERTEX_COUNT = 9 * 2 * (1 + 1) + 1 * 2;

  testLayer({
    Layer: ColumnLayer,
    testCases: [
      {
        title: 'extruded dome',
        props: {
          data: [{position: [0, 0]}],
          diskResolution: 8,
          extruded: true,
          cap: 'dome'
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.fillModel!.vertexCount, 'dome fill vertex count').toBe(
            DOME_VERTEX_COUNT
          );
          expectUniqueGeometryLayout(layer);
        }
      },
      {
        title: 'update cap',
        updateProps: {cap: 'cone'},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.fillModel!.vertexCount, 'cone fill vertex count').toBe(
            CONE_VERTEX_COUNT
          );
        }
      },
      {
        title: 'flat stroked column ignores cap',
        updateProps: {extruded: false, stroked: true},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.fillModel!.vertexCount, 'flat fill vertex count').toBe(
            FLAT_VERTEX_COUNT
          );
          // The stroke drops the flat top: diskResolution + 1 vertices
          expect(layer.state.strokeModel!.vertexCount, 'stroke vertex count').toBe(
            FLAT_VERTEX_COUNT - 9
          );
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('ColumnLayer - caps face outward under back-face culling', async () => {
  const anchor = [-122, 38];
  const radius = 50000;
  // Look straight down at a point inside the apex band of the dome and on the cone, away from
  // the apex vertex. At zoom 3 the camera is ~1.5 viewport heights (over 10 km) above the
  // ground, so it stays above the 7.5 km apex.
  const longitude =
    anchor[0] +
    ((0.3 * radius) / (6370972 * Math.cos((anchor[1] * Math.PI) / 180)) / Math.PI) * 180;
  const datum = {position: anchor};
  // Draw on the shared test device; its canvas is 1x1 unless an earlier test resized it.
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    useDevicePixels: false,
    viewState: {longitude, latitude: anchor[1], zoom: 3}
  });
  const picked: Record<string, boolean> = {};
  try {
    for (const [name, view] of [
      ['GlobeView', new GlobeView()],
      ['MapView', new MapView({parameters: {cullMode: 'back'}})]
    ] as const) {
      for (const cap of ['flat', 'dome', 'cone'] as const) {
        const layer = new ColumnLayer({
          id: `column-${cap}`,
          data: [datum],
          getPosition: d => d.position,
          getElevation: 5000,
          radius,
          // Three dome bands, so the apex band is the third strip
          diskResolution: 12,
          extruded: true,
          cap,
          pickable: true
        });
        await new Promise<void>(resolve => {
          deck.setProps({
            views: view,
            layers: [layer],
            onAfterRender: () => {
              // @ts-expect-error private member
              if (!deck.layerManager.needsUpdate()) resolve();
            }
          });
        });
        const [x, y] = deck.getViewports()[0].project([longitude, anchor[1]]);
        picked[`${name} ${cap}`] = deck.pickObject({x, y})?.object === datum;
      }
    }
  } finally {
    deck.finalize();
  }
  expect(picked, 'each cap is picked from above').toEqual({
    'GlobeView flat': true,
    'GlobeView dome': true,
    'GlobeView cone': true,
    'MapView flat': true,
    'MapView dome': true,
    'MapView cone': true
  });
});

test('ColumnLayer updates normalized fill and line colors through Deck context', () => {
  const getLineColor = () => [1, 0.5, 0, 0] as const;
  testLayer({
    Layer: ColumnLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {props: {data: [{position: [0, 0]}], getLineColor}},
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({layer}) => {
          const attributes = layer.getAttributeManager()!.attributes;
          expect(Array.from(attributes.instanceFillColors.value!)).toEqual([0, 0, 0, 1]);
          expect(Array.from(attributes.instanceLineColors.value!.slice(0, 4))).toEqual([
            255, 128, 0, 0
          ]);
        }
      }
    ]
  });
});

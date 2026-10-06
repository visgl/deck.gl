// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {DeckRenderer, LayerManager, WebMercatorViewport, picking} from '@deck.gl/core';
import {device, testLayer} from '@deck.gl/test-utils/vitest';
import {GroupNode, Model, ModelNode, CubeGeometry, Geometry} from '@luma.gl/engine';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {Tile3D, Tileset3D, TILE_REFINEMENT} from '@loaders.gl/tiles';
import Tile3DScenegraphLayer from '../../../../modules/geo-layers/src/tile-3d-layer/tile-3d-scenegraph-layer';
import DeckPicker from '../../../../modules/core/src/lib/deck-picker';
import PickLayersPass from '../../../../modules/core/src/passes/pick-layers-pass';
import type {CanvasContext} from '@luma.gl/core';
import TileProcessingScheduler from '../../../../modules/geo-layers/src/tile-3d-layer/tile-processing-scheduler';

// The red parent is deliberately closer than its green replacement. Ordinary
// depth testing hides the child; coverage must reveal it without losing fallback.
test.each([
  {name: 'replacement children cover a raised parent', stencil: 255, expected: [0, 255, 0, 255]},
  {
    name: 'disabled coverage retains ordinary depth testing',
    stencil: 0,
    expected: [255, 0, 0, 255]
  },
  {
    name: 'additive children retain ordinary depth testing',
    additive: true,
    expected: [255, 0, 0, 255]
  },
  {
    name: 'targets without stencil retain ordinary depth testing',
    noStencil: true,
    expected: [255, 0, 0, 255]
  },
  {
    name: 'filtered children leave parent coverage intact',
    filterChild: true,
    expected: [255, 0, 0, 255]
  },
  {
    name: 'skipped ancestors still mask their selected parent',
    skipped: true,
    expected: [0, 255, 0, 255]
  },
  {
    name: 'blended content retains ordinary depth testing',
    blended: true,
    expected: [255, 0, 0, 255]
  },
  {
    name: 'unrelated sibling branches can reuse reserved bits',
    siblings: true,
    stencil: 48,
    expected: [0, 0, 255, 255]
  },
  {
    name: 'long replacement chains share a bit without losing ancestry coverage',
    chainLength: 12,
    stencil: 16,
    expected: [0, 255, 0, 255]
  },
  {
    name: 'long sibling chains remain isolated with two reserved bits',
    chainLength: 12,
    siblings: true,
    stencil: 48,
    expected: [0, 0, 255, 255]
  },
  {
    name: 'insufficient bits retain ordinary depth testing',
    siblings: true,
    stencil: 16,
    expected: [255, 0, 0, 255]
  }
])(
  '$name',
  async ({
    stencil = 255,
    additive,
    noStencil,
    filterChild,
    skipped,
    blended,
    siblings,
    chainLength = 0,
    expected
  }) => {
    const viewport = new WebMercatorViewport({id: 'coverage', width: 32, height: 16});
    const layerManager = new LayerManager(device, {viewport});
    const renderer = new DeckRenderer(device);
    const picker = new DeckPicker(device);
    const pickPass = new PickLayersPass(device);
    const framebuffer = device.createFramebuffer({
      width: 32,
      height: 16,
      colorAttachments: ['rgba8unorm'],
      depthStencilAttachment: noStencil ? 'depth16unorm' : 'depth24plus-stencil8'
    });
    type TileFixture = {tile: Tile3D; left: number; right: number; depth: number; color: string};
    const fixtures: TileFixture[] = [];
    const addTile = (
      id: string,
      parent: Tile3D | null,
      left: number,
      right: number,
      depth: number,
      color: string
    ): Tile3D => {
      const tile = {
        id,
        parent,
        selected: true,
        type: 'scenegraph',
        refine: additive ? TILE_REFINEMENT.ADD : TILE_REFINEMENT.REPLACE,
        viewportIds: ['coverage'],
        content: {gltf: new GroupNode([]), cartographicOrigin: [0, 0, 0]},
        tileDrawn: true
      } as unknown as Tile3D;
      fixtures.push({tile, left, right, depth, color});
      return tile;
    };
    const parent = addTile('parent', null, -1, 1, -0.75, '1, 0, 0, 1');
    const intermediate = {...parent, id: 'skipped', parent, selected: false} as Tile3D;
    const child = addTile('child', skipped ? intermediate : parent, -1, 0, 0.5, '0, 1, 0, 1');
    if (filterChild) child.viewportIds = ['other-viewport'];
    if (blended) Object.assign(child.content.gltf, {materials: [{alphaMode: 'BLEND'}]});
    if (siblings) {
      const firstBranch = addTile('first-branch', parent, -1, 0, 0, '1, 1, 0, 1');
      child.parent = firstBranch;
      const secondBranch = addTile('second-branch', parent, -1, 1, -0.25, '0, 0, 1, 1');
      addTile('second-child', secondBranch, 0, 1, 0.25, '0, 1, 1, 1');
    }
    if (chainLength) {
      let ancestor = child.parent!;
      for (let index = 0; index < chainLength; index++) {
        ancestor = addTile(`chain-${index}`, ancestor, -1, 0, 0.1, '1, 1, 0, 1');
      }
      child.parent = ancestor;
      fixtures.find(fixture => fixture.tile === child)!.right = -0.5;
    }
    const tileset = {
      tiles: fixtures.map(fixture => fixture.tile),
      selectTiles: vi.fn().mockResolvedValue(0),
      destroy: vi.fn()
    } as unknown as Tileset3D;
    const layer = new Tile3DLayer({
      id: 'coverage',
      data: '',
      _refinementStencil: stencil,
      pickable: true,
      parameters: {depthCompare: 'less-equal', depthWriteEnabled: true},
      _subLayerProps: {
        scenegraph: {
          getScene: (_scenegraph, {layer: sceneLayer}) => {
            const {left, right, depth, color} = fixtures.find(
              fixture => fixture.tile === sceneLayer.props.tile
            )!;
            return new GroupNode([
              new ModelNode({
                model: new Model(device, {
                  modules: [picking],
                  geometry: new Geometry({
                    topology: 'triangle-list',
                    attributes: {
                      positions: {
                        size: 3,
                        value: new Float32Array([
                          left,
                          -1,
                          depth,
                          right,
                          -1,
                          depth,
                          right,
                          1,
                          depth,
                          left,
                          -1,
                          depth,
                          right,
                          1,
                          depth,
                          left,
                          1,
                          depth
                        ])
                      }
                    }
                  }),
                  vs: '#version 300 es\nin vec3 positions; void main() { gl_Position = vec4(positions, 1.0); picking_setPickingColor(vec3(1, 0, 0)); }',
                  fs: `#version 300 es\nprecision highp float; out vec4 color; void main() { color = picking_filterColor(vec4(${color})); }`
                })
              })
            ]);
          }
        }
      }
    });
    const renderOptions = {
      pass: 'test',
      views: {},
      effects: [],
      viewports: [viewport],
      layers: [] as ReturnType<LayerManager['getLayers']>,
      onViewportActive: layerManager.activateViewport,
      shaderModuleProps: {project: {devicePixelRatio: 1}}
    };
    const leftOffset = (8 * 32 + (chainLength ? 4 : 8)) * 4;
    const rightOffset = (8 * 32 + 24) * 4;
    try {
      layerManager.setProps({
        onError: error => {
          throw error;
        }
      });
      layerManager.setLayers([layer]);
      layer.setState({tileset3d: tileset});
      layerManager.updateLayers();
      expect(layer.getSubLayers()).toHaveLength(fixtures.length);
      renderOptions.layers = layerManager.getLayers();
      for (let attempt = 0; attempt < 4; attempt++) {
        renderer.renderLayers({...renderOptions, target: framebuffer});
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      const pixels = device.readPixelsToArrayWebGL(framebuffer, {
        sourceWidth: 32,
        sourceHeight: 16
      });
      expect(
        Array.from(pixels.slice(leftOffset, leftOffset + 4)),
        'finished coverage respects ancestry'
      ).toEqual(expected);
      expect(
        Array.from(pixels.slice(rightOffset, rightOffset + 4)),
        'unfinished coverage is preserved'
      ).toEqual(siblings && stencil === 48 ? [0, 255, 255, 255] : [255, 0, 0, 255]);

      if (chainLength && !siblings) {
        const middleOffset = (8 * 32 + 12) * 4;
        expect(
          Array.from(pixels.slice(middleOffset, middleOffset + 4)),
          'the shared bit preserves intermediate coverage outside the finest child'
        ).toEqual([255, 255, 0, 255]);
      }

      // Exercise the actual picking pass and its standard framebuffer allocation.
      if (!noStencil) {
        picker._resizeBuffer({getDrawingBufferSize: () => [32, 16]} as CanvasContext);
        const {decodePickingColor} = pickPass.render({
          ...renderOptions,
          pickingFBO: picker.pickingFBO!,
          deviceRect: {x: 0, y: 0, width: 32, height: 16},
          pickZ: false
        });
        const picked = device.readPixelsToArrayWebGL(picker.pickingFBO!, {
          sourceWidth: 32,
          sourceHeight: 16
        });
        const expectedTile = expected[0] === 255 ? parent : siblings ? fixtures[3].tile : child;
        expect(
          decodePickingColor!(picked.slice(leftOffset, leftOffset + 4))?.pickedLayer.props.tile,
          'picking matches visible coverage'
        ).toBe(expectedTile);
        expect(picker.depthFBO!.depthStencilAttachment!.texture.format).toBe(
          'depth24plus-stencil8'
        );
      }
    } finally {
      layerManager.finalize();
      renderer.finalize();
      picker.finalize();
      pickPass.cleanup();
      framebuffer.destroy();
    }
  }
);

test('over-budget tiles become drawable through the next scheduled layer update', async () => {
  let time = 0;
  const scheduler = new TileProcessingScheduler(4);
  const viewport = new WebMercatorViewport({width: 100, height: 100});
  const layerManager = new LayerManager(device, {viewport});
  const renderer = new DeckRenderer(device);
  const onFirstDraw = vi.fn();
  const getScene = vi.fn((_scenegraph, {layer}) => {
    const scenegraph = new GroupNode([
      new ModelNode({
        model: new Model(device, {
          geometry: new CubeGeometry(),
          isInstanced: true,
          bufferLayout: layer.getAttributeManager().getBufferLayouts(),
          ...layer.getShaders()
        })
      })
    ]);
    // Make one real creation exhaust the budget without relying on machine speed.
    time += 5;
    return scenegraph;
  });
  const firstTile = new Tile3DScenegraphLayer({
    id: 'first-tile',
    data: [{position: [0, 0, 0]}],
    scenegraph: new GroupNode([]),
    tileProcessingScheduler: scheduler,
    getScene
  });
  const deferredTile = firstTile.clone({id: 'deferred-tile', onFirstDraw});
  const drawLayers = () =>
    renderer.renderLayers({
      pass: 'test',
      views: {},
      effects: [],
      viewports: [viewport],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport
    });

  const clock = vi.spyOn(performance, 'now').mockImplementation(() => time);
  try {
    layerManager.setProps({
      onError: error => {
        throw error;
      }
    });
    layerManager.setLayers([firstTile, deferredTile]);
    drawLayers();
    expect(firstTile.isLoaded).toBe(true);
    expect(deferredTile.state.scenegraphPending).toBe(true);
    expect(deferredTile.isLoaded).toBe(false);
    expect(deferredTile.getModels()).toHaveLength(0);
    expect(onFirstDraw).not.toHaveBeenCalled();
    expect(getScene).toHaveBeenCalledOnce();

    // Replace the queued layer, preserving its pending state and changing its attributes.
    const currentTile = deferredTile.clone({
      data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}]
    });
    layerManager.setLayers([firstTile, currentTile]);
    expect(currentTile.state.scenegraphPending).toBe(true);
    if (layerManager.needsUpdate()) layerManager.updateLayers();
    expect(layerManager.needsUpdate()).toBe(false);

    // The real scheduler's animation-frame callback must request the retry itself.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(layerManager.needsUpdate()).toBeTruthy();
    layerManager.updateLayers();
    drawLayers();

    expect(currentTile.state.scenegraphPending).toBe(false);
    expect(currentTile.isLoaded).toBe(true);
    expect(currentTile.getModels()).toHaveLength(1);
    expect(getScene).toHaveBeenCalledTimes(2);
    const model = currentTile.getModels()[0];
    expect(model.instanceCount).toBe(2);
    const positionLayout = model.pipeline.shaderLayout.attributes.find(
      attribute => attribute.name === 'instancePositions'
    )!;
    expect(model.vertexArray.attributes[positionLayout.location]).toBeTruthy();
    expect(onFirstDraw).toHaveBeenCalledOnce();
    drawLayers();
    expect(onFirstDraw).toHaveBeenCalledOnce();
  } finally {
    clock.mockRestore();
    scheduler.destroy();
    layerManager.finalize();
    renderer.finalize();
  }
});

test('deferred tile creation updates attributes and uses the latest scenegraph', () => {
  const scheduler = new TileProcessingScheduler(0);
  let allowCreation = false;
  vi.spyOn(scheduler, 'run').mockImplementation((_layer, task) => {
    if (!allowCreation) return false;
    task();
    return true;
  });
  const firstScenegraph = new GroupNode([]);
  const replacementScenegraph = new GroupNode([]);
  const getScene = vi.fn(
    (_scenegraph, {device, layer}) =>
      new GroupNode([
        new ModelNode({
          model: new Model(device, {
            geometry: new CubeGeometry(),
            isInstanced: true,
            bufferLayout: layer.getAttributeManager().getBufferLayouts(),
            vs: '#version 300 es\nin vec3 positions; in vec3 instancePositions; void main() { gl_Position = vec4(positions + instancePositions, 1.0); }',
            fs: '#version 300 es\nprecision highp float; out vec4 color; void main() { color = vec4(1.0); }'
          })
        })
      ])
  );

  testLayer({
    Layer: Tile3DScenegraphLayer,
    testCases: [
      {
        props: {
          data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
          scenegraph: firstScenegraph,
          tileProcessingScheduler: scheduler,
          getScene
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(true);
          expect(layer.isLoaded).toBe(false);
          expect(layer.getModels()).toHaveLength(0);
          expect(getScene).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {scenegraph: replacementScenegraph},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(true);
          expect(getScene).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {opacity: 0.5},
        onBeforeUpdate: () => {
          allowCreation = true;
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.scenegraphPending).toBe(false);
          expect(layer.getModels()).toHaveLength(1);
          expect(getScene).toHaveBeenCalledOnce();
          expect(getScene.mock.calls[0][0].scenes[0]).toBe(replacementScenegraph);
          expect(layer.getAttributeManager()!.getAttributes().instancePositions.value).toBeTruthy();
          const model = layer.getModels()[0];
          expect(model.instanceCount).toBe(2);
          const positionLayout = model.pipeline.shaderLayout.attributes.find(
            attribute => attribute.name === 'instancePositions'
          )!;
          expect(model.vertexArray.attributes[positionLayout.location]).toBeTruthy();
        }
      }
    ],
    onError: error => expect(error).toBeFalsy()
  });
  scheduler.destroy();
});

test('superseded pending tiles release GPU work and recreate when selected again', async () => {
  let time = 0;
  const viewport = new WebMercatorViewport({id: 'map', width: 100, height: 100});
  const layerManager = new LayerManager(device, {viewport});
  const tiles = ['first', 'pending'].map(id => ({
    id,
    selected: true,
    tileDrawn: false,
    type: 'scenegraph',
    viewportIds: ['map'],
    content: {gltf: new GroupNode([]), cartographicOrigin: [0, 0, 0]}
  })) as unknown as Tile3D[];
  const tileset = {
    tiles,
    selectTiles: vi.fn().mockResolvedValue(0),
    destroy: vi.fn()
  } as unknown as Tileset3D;
  const getScene = vi.fn(() => {
    time += 5;
    return new GroupNode([]);
  });
  const layer = new Tile3DLayer({
    id: 'pending-work',
    data: '',
    _maxTileProcessingTime: 4,
    _subLayerProps: {scenegraph: {getScene}}
  });
  const clock = vi.spyOn(performance, 'now').mockImplementation(() => time);
  try {
    layerManager.setProps({
      onError: error => {
        throw error;
      }
    });
    layerManager.setLayers([layer]);
    layer.setState({tileset3d: tileset});
    layerManager.updateLayers();
    const pending = layer.getSubLayers().find(sublayer => sublayer.props.tile === tiles[1])!;
    expect(pending.state.scenegraphPending).toBe(true);
    expect(getScene).toHaveBeenCalledOnce();
    tiles[1]._selectedFrame = 0;
    Object.assign(tiles[1], {selected: false});
    layer.setNeedsUpdate();
    layerManager.updateLayers();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    layerManager.updateLayers();
    expect(layer.getSubLayers().some(sublayer => sublayer.props.tile === tiles[1])).toBe(false);
    expect(getScene).toHaveBeenCalledOnce();
    Object.assign(tiles[1], {selected: true});
    layer.setNeedsUpdate();
    layerManager.updateLayers();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    layerManager.updateLayers();
    const replacement = layer.getSubLayers().find(sublayer => sublayer.props.tile === tiles[1])!;
    expect(replacement).not.toBe(pending);
    expect(replacement.state.scenegraphPending).toBe(false);
    expect(getScene).toHaveBeenCalledTimes(2);
  } finally {
    clock.mockRestore();
    layerManager.finalize();
  }
});

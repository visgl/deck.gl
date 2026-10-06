// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import {getSplatHierarchyView} from '../splat-layer/splat-layer';
import {RADSelectionEngine} from '../splat-layer/rad-selection';
import type {RADSplats} from '../splat-layer/rad-source-client';

const view = {
  cameraPosition: [0, 0, 2] as [number, number, number],
  viewportSize: [1000, 1000] as [number, number],
  modelViewProjectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
};

function page(base: number, children = 0): RADSplats {
  return {
    format: 'rad',
    splatCount: 1,
    positions: new Float32Array([0, 0, 0]),
    scales: new Float32Array([0.1, 0.1, 0.1]),
    rotations: new Float32Array([1, 0, 0, 0]),
    colors: new Uint8Array([255, 255, 255]),
    opacities: new Float32Array([1]),
    loaderData: {base, childCounts: new Uint16Array([children]), childStarts: new Uint32Array([1])}
  };
}

describe('RAD worker selection', () => {
  it('rejects decoded pages that omit hierarchy traversal columns', () => {
    const engine = new RADSelectionEngine({pageSize: 1, maxActiveSplats: 16});
    const invalid = page(0);
    invalid.loaderData = {base: 0} as never;
    expect(() => engine.stage(1, 0, invalid)).toThrow('RAD page 0 is missing hierarchy metadata.');
    expect(engine.hierarchy.stats.pageCount).toBe(0);
    engine.destroy();
  });

  it.each([
    [1000, 1000],
    [700, 1400],
    [1400, 700]
  ])(
    'refines near foreground before the farther center at %s x %s under the same budget',
    (width, height) => {
      const tree = page(0);
      tree.splatCount = 7;
      tree.positions = new Float32Array([
        0, 0, -2, 0, -0.6, -1, 0, 0, -4, -0.01, -0.6, -1, 0.01, -0.6, -1, -0.01, 0, -4, 0.01, 0, -4
      ]);
      tree.scales = new Float32Array(21).fill(0.01);
      tree.opacities = new Float32Array(7).fill(1);
      tree.loaderData = {
        base: 0,
        childCounts: new Uint16Array([2, 2, 2, 0, 0, 0, 0]),
        childStarts: new Uint32Array([1, 3, 5, 0, 0, 0, 0])
      };
      const engine = new RADSelectionEngine({pageSize: 8, maxActiveSplats: 3});
      const viewport = new Viewport({
        width,
        height,
        viewMatrix: new Matrix4(),
        projectionMatrix: new Matrix4().perspective({
          fovy: (75 * Math.PI) / 180,
          aspect: width / height,
          near: 0.01,
          far: 100
        })
      });
      try {
        engine.stage(1, 0, tree);
        engine.admit(1);
        engine.select(getSplatHierarchyView(viewport, new Matrix4(), 1), 1);
        expect(Array.from(engine.hierarchy.frontier[0].activeRows)).toEqual([2, 3, 4]);
        expect(engine.hierarchy.stats.activeRowCount).toBe(3);
      } finally {
        engine.destroy();
      }
    }
  );

  it.runIf(process.env.COIT_LIVE_SELECTION === '1')(
    'streams the real Coit cut progressively across a camera change',
    async () => {
      const {createRequire} = await import('node:module');
      const exampleRequire = createRequire(new URL('../package.json', import.meta.url));
      const {RADSource} = await import(exampleRequire.resolve('@loaders.gl/splats'));
      const {OrbitViewport} = await import('@deck.gl/core');
      const {Matrix4} = await import('@math.gl/core');
      const source = new RADSource(
        'https://storage.googleapis.com/download/storage/v1/b/forge-dev-public/o/asundqui%2Frad%2F260217%2Fcoit-40m-sh1-lod.rad?alt=media',
        {}
      );
      const metadata = await source.getMetadata();
      const engine = new RADSelectionEngine({
        pageSize: metadata.chunkSize!,
        maxActiveSplats: 1_000_000,
        maxResidentSplats: 4_000_000
      });
      const modelMatrix = new Matrix4().rotateX(-Math.PI / 2);
      const target: [number, number, number] = [0.0226670563, 0.0141479052, 0.1886351632];
      const offset = [-0.0858 - target[0], 0.1128 - target[1], 0.2203 - target[2]];
      const distance = Math.hypot(...offset);
      let requestId = 0;
      const receipts: object[] = [];
      async function admit(pageIndex: number) {
        const data = await source.getChunkSplats(pageIndex, {radChunk: {includeLoDTree: true}});
        const id = ++requestId;
        engine.stage(id, pageIndex, data);
        engine.admit(id);
      }
      try {
        await admit(0);
        for (const camera of [0, 1]) {
          const viewport = new OrbitViewport({
            width: 1280,
            height: 720,
            orbitAxis: 'Z',
            fovy: 75,
            near: 0.01,
            far: 1000,
            target: [target[0] + camera * 0.025, target[1], target[2]],
            rotationOrbit: (Math.atan2(-offset[0], -offset[1]) * 180) / Math.PI + camera * 110,
            rotationX: (Math.asin(offset[2] / distance) * 180) / Math.PI,
            zoom: Math.log2(720 / (2 * Math.tan((75 * Math.PI) / 360)) / distance) + camera * 0.8
          });
          const currentView = getSplatHierarchyView(viewport, modelMatrix, 1);
          let publications = 0;
          for (let slice = 0; slice < 200; slice++) {
            const result = engine.select(currentView, camera + 1);
            publications += Number(Boolean(result.frontier));
            receipts.push({
              camera,
              slice,
              milliseconds: result.duration,
              active: engine.hierarchy.stats.activeRowCount,
              pending: result.hasPendingTraversal,
              published: Boolean(result.frontier),
              requests: result.requests.length,
              protected: result.protectedPageIds.length
            });
            expect(engine.hierarchy.stats.activeRowCount).toBeLessThanOrEqual(1_000_000);
            const removable = engine.hierarchy.residencyManager.residentChunks.filter(
              chunk => !chunk.pinned
            );
            while (
              engine.hierarchy.residencyManager.stats.residentChunkCount > 68 &&
              removable.length
            )
              engine.remove(removable.shift()!.id);
            if (!result.hasPendingTraversal && result.requests.length === 0) break;
            await Promise.all(result.requests.map(request => admit(request.pageIndex)));
            expect(slice).toBeLessThan(199);
          }
          expect(publications).toBeGreaterThan(1);
        }
      } finally {
        engine.destroy();
        if (process.env.COIT_SELECTION_REPORT) {
          const {writeFile} = await import('node:fs/promises');
          await writeFile(process.env.COIT_SELECTION_REPORT, JSON.stringify(receipts, null, 2));
        }
      }
    },
    120_000
  );

  it('retargets immediately and posts intermediate detail without a camera-settlement gate', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const rowCount = 262_143;
    const engine = new RADSelectionEngine({pageSize: 262_144, maxActiveSplats: 131_072});
    const tree = page(0);
    tree.splatCount = rowCount;
    tree.positions = new Float32Array(rowCount * 3);
    tree.scales = new Float32Array(rowCount * 3).fill(0.1);
    tree.opacities = new Float32Array(rowCount).fill(1);
    tree.loaderData = {
      base: 0,
      childCounts: Uint16Array.from({length: rowCount}, (_, row) => (row < 131_071 ? 2 : 0)),
      childStarts: Uint32Array.from({length: rowCount}, (_, row) => row * 2 + 1)
    };
    try {
      engine.stage(1, 0, tree);
      engine.admit(1);
      const initial = engine.select(view, 1);
      expect(initial.hasPendingTraversal).toBe(true);
      const displayedCount = engine.hierarchy.stats.activeRowCount;
      const nextView = {...view, cameraPosition: [0.1, 0, 2] as [number, number, number]};
      now.mockReturnValue(20);
      const moving = engine.select(nextView, 2);
      expect(moving.viewVersion).toBe(2);
      expect(moving.frontier).toBeDefined();
      expect(engine.hierarchy.stats.activeRowCount).toBeGreaterThan(displayedCount);
      now.mockReturnValue(121);
      const retargeted = engine.select(nextView, 2);
      expect(retargeted.viewVersion).toBe(2);
      expect(retargeted.frontier).toBeDefined();
      expect(engine.hierarchy.stats.activeRowCount).toBeGreaterThan(displayedCount);
    } finally {
      engine.destroy();
      now.mockRestore();
    }
  });

  it('publishes streamed refinement slices and lets a new camera interrupt ongoing refinement', () => {
    const rowCount = 131_071;
    const leafCount = 65_536;
    const engine = new RADSelectionEngine({pageSize: 262_144, maxActiveSplats: leafCount});
    engine.stage(0, 0, page(0, 1));
    engine.admit(0);
    expect(engine.select(view, 1).hasPendingTraversal).toBe(false);
    const tree = page(1);
    tree.splatCount = rowCount;
    tree.positions = new Float32Array(rowCount * 3);
    tree.scales = new Float32Array(rowCount * 3).fill(0.1);
    tree.opacities = new Float32Array(rowCount).fill(1);
    tree.loaderData = {
      base: 1,
      childCounts: Uint16Array.from({length: rowCount}, (_, row) => (row < leafCount - 1 ? 2 : 0)),
      childStarts: Uint32Array.from({length: rowCount}, (_, row) => row * 2 + 2)
    };
    engine.stage(1, 1, tree);
    engine.admit(1);
    const partial = engine.select(view, 1);
    expect(partial.hasPendingTraversal).toBe(true);
    expect(partial.frontier?.map(entry => entry.id)).toEqual(['rad:1']);
    const retargeted = engine.select({...view, cameraPosition: [0.1, 0, 2]}, 2);
    expect(retargeted.viewVersion).toBe(2);
    expect(retargeted.hasPendingTraversal).toBe(false);
    expect(retargeted.frontier?.[0].activeRows.length).toBe(leafCount);
    engine.destroy();
  });

  it('limits outstanding replacements and wakes deferred demand as near pages arrive', () => {
    const engine = new RADSelectionEngine({
      pageSize: 1,
      maxActiveSplats: 16,
      maxResidentSplats: 20,
      maxConcurrentLoads: 2
    });
    const root = page(0, 2);
    const near = page(1, 2);
    near.positions[0] = -0.5;
    near.loaderData!.childStarts = new Uint32Array([3]);
    const far = page(2, 2);
    far.positions[0] = 0.5;
    far.loaderData!.childStarts = new Uint32Array([5]);
    for (const [index, source] of [root, near, far].entries()) {
      engine.stage(index, index, source);
      engine.admit(index);
    }
    const left = {...view, cameraPosition: [-1, 0, 0] as [number, number, number]};
    expect(
      engine
        .select(left, 1)
        .requests.map(request => request.pageIndex)
        .sort()
    ).toEqual([3, 4]);
    for (const index of [3, 4]) {
      engine.stage(index, index, page(index));
      engine.admit(index);
    }
    const next = engine.select(left, 1);
    expect(next.requests.map(request => request.pageIndex).sort()).toEqual([5, 6]);
    expect(next.frontier?.map(entry => entry.id).sort()).toEqual(['rad:2', 'rad:3', 'rad:4']);
    engine.destroy();
  });

  it('reserves complete replacements within the page budget and releases old-view detail', () => {
    const engine = new RADSelectionEngine({pageSize: 1, maxActiveSplats: 16, maxResidentSplats: 5});
    const root = page(0, 2);
    const near = page(1, 2);
    near.positions[0] = -0.5;
    near.loaderData!.childStarts = new Uint32Array([3]);
    const far = page(2, 2);
    far.positions[0] = 0.5;
    far.loaderData!.childStarts = new Uint32Array([5]);
    for (const [index, source] of [root, near, far].entries()) {
      engine.stage(index, index, source);
      engine.admit(index);
    }
    const left = {...view, cameraPosition: [-1, 0, 0] as [number, number, number]};
    const first = engine.select(left, 1);
    expect(first.requests.map(request => request.pageIndex).sort()).toEqual([3, 4]);
    for (const index of [3, 4]) {
      const child = page(index);
      child.positions[0] = -0.5;
      engine.stage(index, index, child);
      engine.admit(index);
    }
    const refined = engine.select(left, 1);
    expect(refined.frontier?.map(entry => entry.id).sort()).toEqual(['rad:2', 'rad:3', 'rad:4']);
    // Moving the camera is not enough to evict still-visible left-hand detail. Its selected
    // descendants must actually leave the frustum before their page leases are released.
    const stillVisible = engine.select({...view, cameraPosition: [1, 0, 0]}, 2);
    expect(stillVisible.protectedPageIds).toContain('rad:3');
    expect(stillVisible.protectedPageIds).toContain('rad:4');
    const right = engine.select(
      {
        ...view,
        cameraPosition: [1, 0, 0],
        modelViewProjectionMatrix: [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 1]
      },
      3
    );
    expect(right.requests.map(request => request.pageIndex).sort()).toEqual([5, 6]);
    expect(right.protectedPageIds).not.toContain('rad:3');
    expect(right.protectedPageIds).not.toContain('rad:4');
    expect(right.frontier?.map(entry => entry.id).sort()).toEqual(['rad:1', 'rad:2']);
    engine.destroy();
  });

  it('returns demand between bounded camera slices and finishes during continuing motion', () => {
    const rowCount = 131_071;
    const leafCount = 65_536;
    const engine = new RADSelectionEngine({pageSize: 262_144, maxActiveSplats: leafCount});
    const tree = page(0);
    tree.splatCount = rowCount;
    tree.positions = new Float32Array(rowCount * 3);
    tree.scales = new Float32Array(rowCount * 3).fill(0.1);
    tree.opacities = new Float32Array(rowCount).fill(1);
    tree.loaderData = {
      base: 0,
      childCounts: Uint16Array.from({length: rowCount}, (_, row) => (row < leafCount - 1 ? 2 : 0)),
      childStarts: Uint32Array.from({length: rowCount}, (_, row) => row * 2 + 1)
    };
    engine.stage(1, 0, tree);
    engine.admit(1);
    let selected = engine.select(view, 1);
    expect(selected.hasPendingTraversal).toBe(true);
    expect(engine.hierarchy.stats.visibleRowCount).toBeLessThanOrEqual(65_536);
    let requestedVersion = 1;
    while (selected.hasPendingTraversal && requestedVersion < 10) {
      selected = engine.select(
        {...view, cameraPosition: [0.01 * requestedVersion, 0, 2]},
        ++requestedVersion
      );
      expect(selected.viewVersion).toBe(requestedVersion);
    }
    expect(selected.hasPendingTraversal).toBe(false);
    expect(selected.frontier?.[0].activeRows.length).toBe(leafCount);
    const retargeted = engine.select(view, requestedVersion);
    expect(retargeted.viewVersion).toBe(requestedVersion);
    expect(retargeted.hasPendingTraversal).toBe(false);
    expect(retargeted.frontier).toBeUndefined();
    engine.destroy();
  }, 15_000);

  it('publishes one complete changed-camera cut instead of a small gesture slice', () => {
    const rowCount = 32_767;
    const leafCount = 16_384;
    const engine = new RADSelectionEngine({pageSize: 65_536, maxActiveSplats: leafCount});
    const tree = page(0);
    tree.splatCount = rowCount;
    tree.positions = new Float32Array(rowCount * 3);
    tree.scales = new Float32Array(rowCount * 3).fill(0.1);
    tree.opacities = new Float32Array(rowCount).fill(1);
    tree.loaderData = {
      base: 0,
      childCounts: Uint16Array.from({length: rowCount}, (_, row) => (row < leafCount - 1 ? 2 : 0)),
      childStarts: Uint32Array.from({length: rowCount}, (_, row) =>
        row < leafCount - 1 ? row * 2 + 1 : 0
      )
    };
    engine.stage(1, 0, tree);
    engine.admit(1);
    const selected = engine.select(view, 1);
    expect(selected.hasPendingTraversal).toBe(false);
    expect(selected.frontier?.[0].activeRows.length).toBe(leafCount);
    engine.destroy();
  });

  it('waits for GPU admission and all children before replacing their visible parent', () => {
    const engine = new RADSelectionEngine({pageSize: 1, maxActiveSplats: 16});
    const root = page(0, 2);
    engine.stage(10, 0, root);
    expect(engine.hierarchy.stats.pageCount).toBe(0);
    // Main-thread transfer cannot detach the worker's minimal traversal columns.
    structuredClone(root, {
      transfer: [root.positions.buffer, root.scales.buffer, root.opacities.buffer]
    });
    engine.admit(10);
    const fallback = engine.select(view, 1);
    expect(fallback.frontier?.map(entry => entry.id)).toEqual(['rad:0']);
    expect(fallback.requests.map(request => request.pageIndex)).toEqual([1, 2]);
    engine.stage(11, 1, page(1));
    expect(engine.select(view, 1).frontier).toBeUndefined();
    engine.admit(11);
    engine.select(view, 1);
    expect(engine.hierarchy.frontier.map(entry => entry.id)).toEqual(['rad:0']);
    engine.stage(12, 2, page(2));
    engine.admit(12);
    const refined = engine.select(view, 1);
    expect(refined.frontier?.map(entry => entry.id)).toEqual(['rad:1', 'rad:2']);
    expect(refined.protectedPageIds).toEqual(expect.arrayContaining(['rad:1', 'rad:2']));
    expect(engine.select(view, 1).frontier).toBeUndefined();
    engine.destroy();
  });

  it('increments selection versions even when an unchanged frontier is not republished', () => {
    const engine = new RADSelectionEngine({pageSize: 1, maxActiveSplats: 16});
    engine.stage(1, 0, page(0));
    engine.admit(1);
    const first = engine.select(view, 1);
    const unchanged = engine.select(view, 1);
    expect(first.frontier).toBeDefined();
    expect(unchanged.frontier).toBeUndefined();
    expect(unchanged.version).toBe(first.version + 1);
    expect(unchanged.viewVersion).toBe(first.viewVersion);
    engine.destroy();
  });

  it('discards cancelled geometry and removes evicted metadata before the next publication', () => {
    const engine = new RADSelectionEngine({pageSize: 1, maxActiveSplats: 16});
    engine.stage(10, 0, page(0));
    engine.discard(10);
    expect(() => engine.admit(10)).toThrow('no staged geometry');
    engine.stage(11, 0, page(0));
    engine.admit(11);
    engine.select(view, 1);
    const data = engine.hierarchy.getPage('rad:0')!.data;
    expect('device' in data).toBe(false);
    expect('colors' in data.source).toBe(false);
    engine.remove('rad:0');
    expect(data.destroyed).toBe(true);
    const missing = engine.select(view, 2);
    expect(missing.frontier).toEqual([]);
    expect(missing.requests.map(request => request.pageIndex)).toEqual([0]);
    engine.destroy();
  });
});

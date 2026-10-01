// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {luma} from '@luma.gl/core';
import {
  GPUPagedSplatRenderer,
  makeGPUSplatData,
  SplatRADHierarchyManager,
  type SplatHierarchyView,
  type SplatRADHierarchyFrontierEntry
} from '@luma.gl/splats';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {Matrix4} from '@math.gl/core';
import {RADSource} from '@loaders.gl/splats';
import {
  getConcurrentPageLoadLimit,
  getRefinementFoveation,
  getResidencySplatCapacity,
  getTraversalRowBudget,
  isContinuityViewSettled,
  shouldAdvanceRefinementTraversal,
  shouldRetargetHierarchyForCameraUpdate
} from './coit-frontier-retention';

const COIT_RAD_URL =
  'https://storage.googleapis.com/download/storage/v1/b/forge-dev-public/o/asundqui%2Frad%2F260217%2Fcoit-40m-sh1-lod.rad?alt=media';
const COIT_SOURCE_SPLAT_COUNT = 50_937_127;
const COIT_PAGE_SPLAT_COUNT = 65_536;
const MAXIMUM_RESIDENT_SPLATS = 15_000_000;
const MAXIMUM_ACTIVE_SPLATS = 5_000_000;
const MAXIMUM_CONCURRENT_PAGE_LOADS = getConcurrentPageLoadLimit();
const CAMERA_UPDATE_TRAVERSAL_ROWS = getTraversalRowBudget('camera-update');
const SETTLED_REFINEMENT_TRAVERSAL_ROWS = getTraversalRowBudget('settled-refinement');
const CAMERA_SETTLE_DELAY_MILLISECONDS = 160;
const FIELD_OF_VIEW_RADIANS = (75 * Math.PI) / 180;
const SH_C0 = 0.28209479177387814;
const CLEAR_COLOR: [number, number, number, number] = [202 / 255, 254 / 255, 254 / 255, 1];
const CAMERA_UP: [number, number, number] = [0, -1, 0];
const CAMERA_FORWARD: [number, number, number] = [0, 0, 1];
const CAMERA_RIGHT: [number, number, number] = [-1, 0, 0];
const AUTHORED_CAMERA_POSITION: [number, number, number] = [-0.0858, -0.2203, 0.1128];
const AUTHORED_CAMERA_TARGET: [number, number, number] = [
  0.0226670563, -0.1886351632, 0.0141479052
];

type GaussianSplats = {
  splatCount: number;
  positions: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
  colors: Uint8Array;
  sphericalHarmonicDcs?: Float32Array;
  sphericalHarmonics?: Float32Array;
  sphericalHarmonicsComponentCount?: number;
  opacities: Float32Array;
  loaderData?: Record<string, unknown>;
};

export type CoitNativeRenderStatus = {
  phase:
    | 'initializing'
    | 'streaming'
    | 'interactive'
    | 'refining'
    | 'ready'
    | 'unsupported'
    | 'error';
  backend: string;
  message: string;
  residentPageCount: number;
  activePageCount: number;
  activeRowCount: number;
  requestedPageCount: number;
  sourceSplatCount: number;
  activeSplatCapacity: number;
  residentSplatCapacity: number;
  sortMode: string;
};

export type CoitNativeRendererHandle = {
  destroy: () => void;
  resetCamera: () => void;
};

type CameraState = {
  target: [number, number, number];
  yaw: number;
  pitch: number;
  distance: number;
};

/** Runs the same intact-page, global-GPU-order path used by luma.gl's Coit showcase. */
export async function createCoitNativeRenderer(
  container: HTMLDivElement,
  onStatus: (status: CoitNativeRenderStatus) => void,
  signal?: AbortSignal
): Promise<CoitNativeRendererHandle> {
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {
      container,
      width: Math.max(container.clientWidth, 1),
      height: Math.max(container.clientHeight, 1),
      useDevicePixels: true,
      autoResize: true
    }
  });
  if (signal?.aborted) {
    device.destroy();
    signal.throwIfAborted();
  }
  if (device.type !== 'webgpu') {
    device.destroy();
    throw new Error('The Coit reference renderer requires WebGPU.');
  }

  const canvasElement = container.querySelector<HTMLCanvasElement>('canvas');
  if (!canvasElement) {
    device.destroy();
    throw new Error('Unable to create the Coit rendering canvas.');
  }
  const canvas: HTMLCanvasElement = canvasElement;

  const source = new RADSource(COIT_RAD_URL, {});
  const renderer = new GPUPagedSplatRenderer(device, {
    clearColor: CLEAR_COLOR,
    sortMode: 'global',
    radiusScale: 1,
    alphaScale: 1,
    alphaCutoff: 0.5 / 255,
    gaussianSupportRadius: Math.sqrt(8),
    kernel2DSize: Math.sqrt(0.3),
    maxScreenSpaceSplatSize: 512,
    toneMapping: 'none',
    lodOpacity: true
  });
  const authoredOffset = subtractVectors(AUTHORED_CAMERA_POSITION, AUTHORED_CAMERA_TARGET);
  const camera: CameraState = {
    target: [...AUTHORED_CAMERA_TARGET],
    yaw: Math.atan2(
      dotVectors(authoredOffset, CAMERA_RIGHT),
      dotVectors(authoredOffset, CAMERA_FORWARD)
    ),
    pitch: Math.asin(dotVectors(authoredOffset, CAMERA_UP) / Math.hypot(...authoredOffset)),
    distance: Math.hypot(...authoredOffset)
  };
  const initialCamera = {...camera, target: [...camera.target] as [number, number, number]};
  let sceneRadius = 0.5;
  let currentView: SplatHierarchyView | undefined;
  let animationFrame = 0;
  let needsRender = true;
  let destroyed = false;
  let pointerId: number | undefined;
  let pointerX = 0;
  let pointerY = 0;
  let lastStatusKey = '';
  let isCameraInteracting = false;
  let isTransitionResidencyActive = false;
  let steadyResidencySplatCapacity = MAXIMUM_RESIDENT_SPLATS;
  const refinementFoveation = getRefinementFoveation();
  let cameraSettleTimeout: ReturnType<typeof setTimeout> | undefined;
  let presentedFrontier: readonly SplatRADHierarchyFrontierEntry[] = [];
  let presentedRowCount = 0;
  const pageLoads = new Map<number, AbortController>();
  const rejectedPageIndices = new Set<number>();

  const hierarchy = new SplatRADHierarchyManager({
    pageSize: COIT_PAGE_SPLAT_COUNT,
    residencyBudget: {maxResidentSplats: MAXIMUM_RESIDENT_SPLATS},
    maximumActiveRows: MAXIMUM_ACTIVE_SPLATS,
    lodOpacity: true,
    lodSplatScale: 1.5,
    lodRenderScale: 1.5,
    coneFov0: 70,
    coneFov: 120,
    coneFoveate: 0.4,
    behindFoveate: 0.2,
    refinementHysteresis: 0.15,
    maxTraversalRows: CAMERA_UPDATE_TRAVERSAL_ROWS,
    onFrontierChange: frontier => {
      publishFrontier(frontier);
      reportStatus(
        isCameraInteracting ? 'interactive' : 'refining',
        isCameraInteracting
          ? 'Retargeting the coherent hierarchy frontier around the moving camera…'
          : 'Refining the retargeted current-view frontier…'
      );
    },
    onPageRequest: () => queueMicrotask(pumpPageLoads),
    onPageCancel: request => pageLoads.get(request.pageIndex)?.abort()
  });

  function reportStatus(phase: CoitNativeRenderStatus['phase'], message: string): void {
    const stats = hierarchy.stats;
    const status: CoitNativeRenderStatus = {
      phase,
      backend: device.type,
      message,
      residentPageCount: stats.pageCount,
      activePageCount: presentedFrontier.length,
      activeRowCount: presentedRowCount,
      requestedPageCount: getPendingPageCount(),
      sourceSplatCount: COIT_SOURCE_SPLAT_COUNT,
      activeSplatCapacity: MAXIMUM_ACTIVE_SPLATS,
      residentSplatCapacity: hierarchy.residencyManager.stats.maxResidentSplats,
      sortMode: renderer.stats.sortMode
    };
    const statusKey = JSON.stringify(status);
    if (statusKey !== lastStatusKey) {
      lastStatusKey = statusKey;
      onStatus(status);
    }
  }

  function publishFrontier(nextFrontier: readonly SplatRADHierarchyFrontierEntry[]): void {
    if (nextFrontier === presentedFrontier) {
      return;
    }
    renderer.setFrontier(nextFrontier);
    presentedFrontier = nextFrontier;
    presentedRowCount = getFrontierRowCount(nextFrontier);
    steadyResidencySplatCapacity = Math.max(
      MAXIMUM_RESIDENT_SPLATS,
      nextFrontier.reduce((splatCount, entry) => splatCount + entry.data.length, 0)
    );
    needsRender = true;
    const targetResidencySplatCapacity = getResidencySplatCapacity(
      steadyResidencySplatCapacity,
      MAXIMUM_ACTIVE_SPLATS,
      isTransitionResidencyActive
    );
    if (hierarchy.residencyManager.stats.maxResidentSplats < targetResidencySplatCapacity) {
      hierarchy.residencyManager.setBudget({
        maxResidentSplats: targetResidencySplatCapacity
      });
    }
    rejectedPageIndices.clear();
  }

  function updateCamera(): void {
    const viewportSize = getViewportSize(canvas);
    const cosinePitch = Math.cos(camera.pitch);
    const horizontalDistance = cosinePitch * camera.distance;
    const forwardDistance = Math.cos(camera.yaw) * horizontalDistance;
    const rightDistance = Math.sin(camera.yaw) * horizontalDistance;
    const upwardDistance = Math.sin(camera.pitch) * camera.distance;
    const cameraPosition: [number, number, number] = [
      camera.target[0] +
        CAMERA_FORWARD[0] * forwardDistance +
        CAMERA_RIGHT[0] * rightDistance +
        CAMERA_UP[0] * upwardDistance,
      camera.target[1] +
        CAMERA_FORWARD[1] * forwardDistance +
        CAMERA_RIGHT[1] * rightDistance +
        CAMERA_UP[1] * upwardDistance,
      camera.target[2] +
        CAMERA_FORWARD[2] * forwardDistance +
        CAMERA_RIGHT[2] * rightDistance +
        CAMERA_UP[2] * upwardDistance
    ];
    const near = Math.max(Math.min(camera.distance * 0.02, sceneRadius * 0.05), 0.001);
    const far = Math.max(camera.distance + sceneRadius * 12, near * 100);
    const projectionMatrix = new Matrix4().perspective({
      fovy: FIELD_OF_VIEW_RADIANS,
      aspect: viewportSize[0] / viewportSize[1],
      near,
      far
    });
    const viewMatrix = new Matrix4().lookAt({
      eye: cameraPosition,
      center: camera.target,
      up: CAMERA_UP
    });
    const modelViewProjectionMatrix = new Matrix4(projectionMatrix).multiplyRight(viewMatrix);
    renderer.setProps({modelViewProjectionMatrix, viewportSize, cameraPosition});
    currentView = {
      cameraPosition,
      foveation: refinementFoveation,
      modelViewProjectionMatrix,
      viewportSize,
      verticalFieldOfView: FIELD_OF_VIEW_RADIANS
    };
    if (shouldRetargetHierarchyForCameraUpdate(isCameraInteracting)) {
      hierarchy.update(currentView);
    }
    needsRender = true;
  }

  async function loadPage(
    pageIndex: number,
    priority: number,
    signal?: AbortSignal
  ): Promise<boolean> {
    const pageId = `rad:${pageIndex}`;
    let splats: GaussianSplats | undefined;
    const residentChunk = await hierarchy.residencyManager.load(
      pageId,
      async () => {
        splats = (await source.getChunkSplats(pageIndex, {
          signal,
          radChunk: {includeLoDTree: true, includeSphericalHarmonics: true}
        })) as GaussianSplats;
        signal?.throwIfAborted();
        return makeGPUSplatData(device, {
          positions: splats.positions,
          scales: splats.scales,
          rotations: splats.rotations,
          colors: makeFloatingPointColors(splats),
          opacities: splats.opacities,
          ...(splats.sphericalHarmonics ? {sphericalHarmonics: splats.sphericalHarmonics} : {}),
          sourceBatchIndex: pageIndex,
          rowIndexBase: Number(splats.loaderData?.base)
        });
      },
      {
        priority,
        estimatedSplatCount: Math.min(
          COIT_PAGE_SPLAT_COUNT,
          COIT_SOURCE_SPLAT_COUNT - pageIndex * COIT_PAGE_SPLAT_COUNT
        ),
        ownsData: true
      }
    );
    if (!residentChunk || !splats || destroyed || signal?.aborted) {
      return false;
    }
    const rowIndexBase = Number(splats.loaderData?.base);
    const childCounts = splats.loaderData?.childCounts;
    const childStarts = splats.loaderData?.childStarts;
    if (
      !Number.isSafeInteger(rowIndexBase) ||
      !(childCounts instanceof Uint16Array) ||
      !(childStarts instanceof Uint32Array)
    ) {
      throw new Error(`Coit RAD page ${pageIndex} is missing hierarchy metadata.`);
    }
    if (pageIndex === 0) {
      sceneRadius = estimateSceneRadius(splats.positions);
    }
    const accepted = hierarchy.registerPage({
      id: pageId,
      data: residentChunk.data,
      childCounts,
      childStarts,
      ownsData: true
    });
    if (!accepted) {
      hierarchy.residencyManager.remove(pageId);
      return false;
    }
    return true;
  }

  function pumpPageLoads(): void {
    const demandedPageIndices = new Set(hierarchy.requests.map(request => request.pageIndex));
    for (const [pageIndex, controller] of pageLoads) {
      if (!demandedPageIndices.has(pageIndex)) {
        controller.abort();
      }
    }
    const availableSlots = MAXIMUM_CONCURRENT_PAGE_LOADS - pageLoads.size;
    if (availableSlots <= 0) {
      return;
    }
    const requests = hierarchy.requests
      .sort((left, right) => right.priority - left.priority)
      .filter(
        request =>
          !hierarchy.getPage(`rad:${request.pageIndex}`) &&
          !pageLoads.has(request.pageIndex) &&
          !rejectedPageIndices.has(request.pageIndex)
      )
      .slice(0, availableSlots);
    for (const request of requests) {
      const controller = new AbortController();
      pageLoads.set(request.pageIndex, controller);
      void loadPage(request.pageIndex, request.priority, controller.signal)
        .then(accepted => {
          if (!accepted && !controller.signal.aborted) {
            rejectedPageIndices.add(request.pageIndex);
          }
        })
        .catch(error => {
          if (!destroyed && !controller.signal.aborted) {
            rejectedPageIndices.add(request.pageIndex);
            onStatus({
              phase: 'error',
              backend: device.type,
              message: error instanceof Error ? error.message : 'RAD page loading failed.',
              residentPageCount: hierarchy.stats.pageCount,
              activePageCount: presentedFrontier.length,
              activeRowCount: presentedRowCount,
              requestedPageCount: getPendingPageCount(),
              sourceSplatCount: COIT_SOURCE_SPLAT_COUNT,
              activeSplatCapacity: MAXIMUM_ACTIVE_SPLATS,
              residentSplatCapacity: hierarchy.residencyManager.stats.maxResidentSplats,
              sortMode: renderer.stats.sortMode
            });
          }
        })
        .finally(() => {
          pageLoads.delete(request.pageIndex);
          if (!destroyed) {
            if (currentView && pageLoads.size === 0 && !isCameraInteracting) {
              hierarchy.update(currentView);
            }
            pumpPageLoads();
          }
        });
    }
  }

  function getPendingPageCount(): number {
    const pendingPageIndices = new Set(hierarchy.requests.map(request => request.pageIndex));
    for (const pageIndex of pageLoads.keys()) {
      pendingPageIndices.add(pageIndex);
    }
    return pendingPageIndices.size;
  }

  function renderFrame(): void {
    if (destroyed) {
      return;
    }
    const viewportSize = getViewportSize(canvas);
    if (
      currentView &&
      (viewportSize[0] !== currentView.viewportSize[0] ||
        viewportSize[1] !== currentView.viewportSize[1])
    ) {
      updateCamera();
    }
    if (
      shouldAdvanceRefinementTraversal({
        activePageLoadCount: pageLoads.size,
        isCameraInteracting,
        traversalPending: hierarchy.hasPendingTraversal
      })
    ) {
      hierarchy.continueTraversal(SETTLED_REFINEMENT_TRAVERSAL_ROWS);
      pumpPageLoads();
    }
    if (needsRender) {
      renderer.encode(device.commandEncoder);
      device.submit();
      needsRender = false;
    }
    const isSettled = isContinuityViewSettled({
      activePageLoadCount: pageLoads.size,
      isCameraInteracting,
      pageRequestCount: hierarchy.requests.length,
      traversalPending: hierarchy.hasPendingTraversal
    });
    if (isSettled) {
      restoreSteadyResidencyBudget();
      reportStatus('ready', 'Settled luma.gl frontier with exact global GPU depth ordering.');
    }
    animationFrame = requestAnimationFrame(renderFrame);
  }

  function handlePointerDown(event: PointerEvent): void {
    beginCameraInteraction();
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (event.pointerId !== pointerId) {
      return;
    }
    const deltaX = event.clientX - pointerX;
    const deltaY = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    camera.yaw -= deltaX * 0.006;
    camera.pitch = Math.max(-1.32, Math.min(1.32, camera.pitch - deltaY * 0.005));
    updateCamera();
  }

  function handlePointerUp(event: PointerEvent): void {
    if (event.pointerId === pointerId) {
      pointerId = undefined;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      finishCameraInteraction();
    }
  }

  function handleWheel(event: WheelEvent): void {
    event.preventDefault();
    beginCameraInteraction();
    camera.distance = Math.max(
      0.025,
      Math.min(15, camera.distance * Math.exp(event.deltaY * 0.001))
    );
    updateCamera();
    cameraSettleTimeout = setTimeout(finishCameraInteraction, CAMERA_SETTLE_DELAY_MILLISECONDS);
  }

  function beginCameraInteraction(): void {
    isCameraInteracting = true;
    if (!isTransitionResidencyActive) {
      hierarchy.residencyManager.setBudget({
        maxResidentSplats: steadyResidencySplatCapacity + MAXIMUM_ACTIVE_SPLATS
      });
      isTransitionResidencyActive = true;
    }
    if (cameraSettleTimeout !== undefined) {
      clearTimeout(cameraSettleTimeout);
      cameraSettleTimeout = undefined;
    }
  }

  function finishCameraInteraction(): void {
    if (!isCameraInteracting) {
      return;
    }
    isCameraInteracting = false;
    cameraSettleTimeout = undefined;
    rejectedPageIndices.clear();
    if (currentView) {
      hierarchy.update(currentView);
      pumpPageLoads();
    }
    if (!hierarchy.hasPendingTraversal && getPendingPageCount() === 0) {
      restoreSteadyResidencyBudget();
    }
  }

  function restoreSteadyResidencyBudget(): void {
    if (!isTransitionResidencyActive) {
      return;
    }
    hierarchy.residencyManager.setBudget({
      maxResidentSplats: steadyResidencySplatCapacity
    });
    isTransitionResidencyActive = false;
  }

  function resetCamera(): void {
    beginCameraInteraction();
    camera.target = [...initialCamera.target];
    camera.yaw = initialCamera.yaw;
    camera.pitch = initialCamera.pitch;
    camera.distance = initialCamera.distance;
    updateCamera();
    finishCameraInteraction();
  }

  function destroyRenderer(): void {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cancelAnimationFrame(animationFrame);
    if (cameraSettleTimeout !== undefined) {
      clearTimeout(cameraSettleTimeout);
    }
    for (const controller of pageLoads.values()) {
      controller.abort();
    }
    pageLoads.clear();
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerUp);
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('dblclick', resetCamera);
    renderer.destroy();
    hierarchy.destroy();
    device.destroy();
  }

  onStatus({
    phase: 'streaming',
    backend: device.type,
    message: 'Loading the root RAD page without flattening its source buffers…',
    residentPageCount: 0,
    activePageCount: 0,
    activeRowCount: 0,
    requestedPageCount: 1,
    sourceSplatCount: COIT_SOURCE_SPLAT_COUNT,
    activeSplatCapacity: MAXIMUM_ACTIVE_SPLATS,
    residentSplatCapacity: MAXIMUM_RESIDENT_SPLATS,
    sortMode: 'global'
  });
  try {
    await source.getMetadata();
    signal?.throwIfAborted();
    const rootPageLoaded = await loadPage(0, Number.MAX_SAFE_INTEGER, signal);
    signal?.throwIfAborted();
    if (!rootPageLoaded) {
      throw new RangeError('The Coit RAD root page exceeds the resident source budget.');
    }
  } catch (error) {
    destroyRenderer();
    throw error;
  }
  updateCamera();
  pumpPageLoads();
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
  canvas.addEventListener('wheel', handleWheel, {passive: false});
  canvas.addEventListener('dblclick', resetCamera);
  animationFrame = requestAnimationFrame(renderFrame);

  return {
    resetCamera,
    destroy: destroyRenderer
  };
}

function makeFloatingPointColors(splats: GaussianSplats): Float32Array {
  const colors = new Float32Array(splats.splatCount * 4);
  for (let rowIndex = 0; rowIndex < splats.splatCount; rowIndex++) {
    const sourceOffset = rowIndex * 3;
    const targetOffset = rowIndex * 4;
    if (splats.sphericalHarmonicDcs) {
      colors[targetOffset + 0] = 0.5 + SH_C0 * splats.sphericalHarmonicDcs[sourceOffset + 0];
      colors[targetOffset + 1] = 0.5 + SH_C0 * splats.sphericalHarmonicDcs[sourceOffset + 1];
      colors[targetOffset + 2] = 0.5 + SH_C0 * splats.sphericalHarmonicDcs[sourceOffset + 2];
    } else {
      colors[targetOffset + 0] = splats.colors[sourceOffset + 0] / 255;
      colors[targetOffset + 1] = splats.colors[sourceOffset + 1] / 255;
      colors[targetOffset + 2] = splats.colors[sourceOffset + 2] / 255;
    }
    colors[targetOffset + 3] = 1;
  }
  return colors;
}

function getFrontierRowCount(frontier: readonly SplatRADHierarchyFrontierEntry[]): number {
  return frontier.reduce((rowCount, entry) => rowCount + entry.activeRows.length, 0);
}

function estimateSceneRadius(positions: Float32Array): number {
  const rowCount = positions.length / 3;
  const sampleStride = Math.max(1, Math.ceil(rowCount / 8192));
  const coordinates: [number[], number[], number[]] = [[], [], []];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += sampleStride) {
    for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
      const coordinate = positions[rowIndex * 3 + axisIndex];
      if (Number.isFinite(coordinate)) {
        coordinates[axisIndex].push(coordinate);
      }
    }
  }
  const extents = coordinates.map(axisCoordinates => {
    axisCoordinates.sort((left, right) => left - right);
    const lowerIndex = Math.floor((axisCoordinates.length - 1) * 0.02);
    const upperIndex = Math.ceil((axisCoordinates.length - 1) * 0.98);
    return Math.max(axisCoordinates[upperIndex] - axisCoordinates[lowerIndex], 0);
  });
  return Math.max(Math.hypot(...extents) / 2, 0.05);
}

function getViewportSize(canvas: HTMLCanvasElement): [number, number] {
  return [Math.max(canvas.width, 1), Math.max(canvas.height, 1)];
}

function subtractVectors(
  left: readonly [number, number, number],
  right: readonly [number, number, number]
): [number, number, number] {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function dotVectors(
  left: readonly [number, number, number],
  right: readonly [number, number, number]
): number {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

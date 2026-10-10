// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  MapView,
  type MapViewState,
  type PickingInfo,
  type Viewport,
  type ViewStateChangeParameters
} from '@deck.gl/core';
import {LuSpatialPointLayer} from '@deck.gl-community/gpu-layers';
import {LuSpatialGeographicPointQueryEffect} from '@deck.gl-community/gpu-layers/query';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {loadTaxiPointResidentWindow} from '../../showcase/billion-point-spatial-atlas/taxi-resident-window';
import {
  PackedTaxiShardSource,
  type TaxiPointSource
} from '../../showcase/billion-point-spatial-atlas/taxi-source';
import {ArrowDeck} from '../arrow-deck';
import {type DeckExampleDeviceOptions, getDeckExampleProps} from '../deck-example-device';
import {
  assertLongitudeLatitudeTaxiMetadata,
  type LuSpatialTaxiData,
  makeLuSpatialTaxiDataAsync,
  makeLuSpatialTaxiDataFromResidentWindow,
  makeTaxiZonePresets,
  TAXI_GRID_SIZE,
  TAXI_POINT_COUNT,
  TAXI_PROJECTION_ORIGIN
} from './taxi-data';
import {
  createBasemapContainer,
  createControlPanel,
  createLoadingIndicator,
  createStandaloneContainer,
  formatByteCount,
  formatCount,
  getTooltip
} from './app-ui';

const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';
const INITIAL_ZONE_ID = 161;
const MAX_RESIDENT_POINT_CAPACITY = 10_000_000;

type TaxiViewState = MapViewState & {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

export type LuSpatialTaxiDeckOptions = DeckExampleDeviceOptions & {
  /** Caller-supplied source whose ownership transfers to the returned Deck instance. */
  taxiPointSource?: TaxiPointSource;
  /** Packed manifest URL used when `taxiPointSource` is not supplied. */
  taxiManifestUrl?: string | URL;
  /** Maximum source rows retained for one GPU-resident window. */
  residentPointCapacity?: number;
};

/** Creates the WebGPU-only luSpatial taxi explorer with a synchronized MapLibre basemap. */
export function createGPUSpatialTaxiDeck(
  parent?: HTMLDivElement,
  options: LuSpatialTaxiDeckOptions = {}
) {
  const {
    taxiPointSource: suppliedTaxiPointSource,
    taxiManifestUrl: suppliedTaxiManifestUrl,
    residentPointCapacity = TAXI_POINT_COUNT,
    ...deviceOptions
  } = options;
  if (
    !Number.isSafeInteger(residentPointCapacity) ||
    residentPointCapacity <= 0 ||
    residentPointCapacity > MAX_RESIDENT_POINT_CAPACITY
  ) {
    throw new Error(
      `luSpatial taxi residentPointCapacity must be between 1 and ${MAX_RESIDENT_POINT_CAPACITY}`
    );
  }
  const ownsContainer = !parent;
  const container = parent ?? createStandaloneContainer();
  const generationController = new AbortController();
  let taxiData: LuSpatialTaxiData | null = null;
  const configuredManifestUrl = suppliedTaxiManifestUrl ?? getConfiguredTaxiManifestUrl();
  const taxiPointSource =
    suppliedTaxiPointSource ??
    (configuredManifestUrl ? new PackedTaxiShardSource(configuredManifestUrl) : null);
  const sourceLoadController = taxiPointSource ? new AbortController() : null;
  let finalized = false;
  const zonePresets = makeTaxiZonePresets();
  const initialZone = zonePresets.find(zone => zone.id === INITIAL_ZONE_ID) ?? zonePresets[0];
  let viewState: TaxiViewState = {
    longitude: initialZone.center[0],
    latitude: initialZone.center[1],
    zoom: 12.2,
    pitch: 0,
    bearing: 0,
    minZoom: 9,
    maxZoom: 20
  };
  let queryEffect: LuSpatialGeographicPointQueryEffect | null = null;
  let latestSelectionCenter: readonly [number, number] = initialZone.center;
  let stagingQueryEffect: LuSpatialGeographicPointQueryEffect | null = null;
  let activeLayers: LuSpatialPointLayer[] = [];
  let queryRadiusKilometres = 0.35;
  let taxiDataRevision = 0;

  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  const loadingIndicator = createLoadingIndicator(container);
  const basemapContainer = createBasemapContainer(container);
  const map = new maplibregl.Map({
    container: basemapContainer,
    style: BASEMAP_STYLE,
    center: [viewState.longitude, viewState.latitude],
    zoom: viewState.zoom,
    pitch: viewState.pitch,
    bearing: viewState.bearing,
    interactive: false,
    attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({compact: true}), 'bottom-right');
  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(container);

  let deck: ArrowDeck<MapView>;
  const controls = createControlPanel(container, zonePresets, INITIAL_ZONE_ID, {
    onRadiusChange: radiusKilometres => {
      queryRadiusKilometres = radiusKilometres;
      queryEffect?.setSelectionRadius(radiusKilometres);
      stagingQueryEffect?.setSelectionRadius(radiusKilometres);
    },
    onZoneChange: zone => {
      latestSelectionCenter = zone.center;
      viewState = {
        ...viewState,
        longitude: zone.center[0],
        latitude: zone.center[1],
        zoom: zone.zoom
      };
      deck?.setProps({viewState});
      queryEffect?.setSelection(zone.center, queryRadiusKilometres);
      stagingQueryEffect?.setSelection(zone.center, queryRadiusKilometres);
      controls.setCoordinate(zone.center, zone.name);
      synchronizeBasemap(map, viewState);
    }
  });
  controls.setCoordinate(initialZone.center, initialZone.name);
  const handleBasemapError = () => {
    controls.setBasemapStatus('Basemap tiles unavailable · GPU queries remain interactive');
    loadingIndicator.setBasemapStatus('Basemap unavailable. GPU data continues loading.');
  };
  const handleBasemapLoad = () => {
    controls.setBasemapStatus('');
    loadingIndicator.setBasemapStatus('Basemap ready.');
  };
  map.on('error', handleBasemapError);
  map.on('load', handleBasemapLoad);

  deck = new ArrowDeck({
    parent: container,
    ...getDeckExampleProps({...deviceOptions, deviceType: 'webgpu'}),
    views: new MapView({id: 'map', repeat: false}),
    viewState,
    controller: {
      dragPan: true,
      scrollZoom: {smooth: true, speed: 0.02},
      doubleClickZoom: true,
      touchZoom: true,
      dragRotate: false
    },
    style: {background: 'transparent'},
    layers: [],
    effects: [],
    getTooltip: info => (taxiData ? getTooltip(taxiData, info) : null),
    onClick: (info: PickingInfo) => {
      const coordinate = info.coordinate;
      if (!coordinate || coordinate.length < 2) return;
      const center = [coordinate[0], coordinate[1]] as const;
      latestSelectionCenter = center;
      queryEffect?.setSelection(center, queryRadiusKilometres);
      stagingQueryEffect?.setSelection(center, queryRadiusKilometres);
      controls.setCoordinate(center, 'Custom map query');
      controls.setCustomZone();
    },
    onViewStateChange: ({viewState: nextViewState}: ViewStateChangeParameters) => {
      viewState = nextViewState as TaxiViewState;
      deck.setProps({viewState});
      synchronizeBasemap(map, viewState);
    },
    onLoad: ({deck: loadedDeck, device}) => {
      if (device.type !== 'webgpu') throw new Error('luSpatial taxi explorer requires WebGPU');
      const canvas = device.getDefaultCanvasContext().canvas;
      if (canvas instanceof HTMLCanvasElement) {
        Object.assign(canvas.style, {
          position: 'absolute',
          inset: '0',
          zIndex: '1',
          background: 'transparent'
        });
      }
      const activateTaxiData = (
        nextTaxiData: LuSpatialTaxiData,
        redrawReason: string
      ): Promise<void> => {
        const previousQueryEffect = queryEffect;
        const previousLayers = activeLayers;
        const nextTaxiDataRevision = taxiDataRevision + 1;
        let nextQueryEffect: LuSpatialGeographicPointQueryEffect;
        try {
          nextQueryEffect = new LuSpatialGeographicPointQueryEffect(device, {
            id: `luspatial-taxi-query-effect-${nextTaxiDataRevision}`,
            longitudeLatitudes: nextTaxiData.longitudeLatitudes,
            sourceBounds: nextTaxiData.sourceBounds,
            projectedBounds: nextTaxiData.projectedBounds,
            projectionOrigin: TAXI_PROJECTION_ORIGIN,
            gridSize: TAXI_GRID_SIZE,
            initialSelection: {
              center: latestSelectionCenter,
              radiusKilometres: queryRadiusKilometres
            },
            selectionRadiusRangeKilometres: [0.05, 5],
            onStats: stats => controls.updateStats(stats)
          });
        } catch (error) {
          return Promise.reject(error);
        }
        nextQueryEffect.setSelection(latestSelectionCenter, queryRadiusKilometres);
        stagingQueryEffect = nextQueryEffect;

        return new Promise<void>((resolve, reject) => {
          let settled = false;
          const readyLayerIndexes = new Set<number>();
          let stagedLayers: LuSpatialPointLayer[] = [];

          const rejectActivation = (error: Error): void => {
            if (settled) return;
            settled = true;
            queueMicrotask(() => {
              if (stagingQueryEffect === nextQueryEffect) stagingQueryEffect = null;
              if (!finalized) {
                try {
                  loadedDeck.setProps({
                    effects: previousQueryEffect ? [previousQueryEffect] : [],
                    layers: previousLayers
                  });
                  loadedDeck.redraw('luSpatial taxi source activation rolled back');
                } catch {
                  // Deck is already tearing down; the effect cleanup below remains idempotent.
                }
              }
              nextQueryEffect.destroy();
              reject(error);
            });
          };

          const commitActivation = (): void => {
            if (settled) return;
            if (finalized) {
              rejectActivation(new Error('luSpatial taxi explorer finalized during activation'));
              return;
            }
            try {
              loadedDeck.setProps({
                effects: previousQueryEffect
                  ? [previousQueryEffect, nextQueryEffect]
                  : [nextQueryEffect],
                layers: stagedLayers
              });
            } catch (error) {
              rejectActivation(error instanceof Error ? error : new Error(String(error)));
              return;
            }
            settled = true;
            for (const layer of stagedLayers) layer.reveal();
            taxiData = nextTaxiData;
            taxiDataRevision = nextTaxiDataRevision;
            queryEffect = nextQueryEffect;
            stagingQueryEffect = null;
            activeLayers = stagedLayers;
            controls.updateSourceStatus({
              corpusPointCount: nextTaxiData.corpusPointCount,
              message:
                nextTaxiData.sourceKind === 'packed'
                  ? `${nextTaxiData.sourceLabel} · ${formatByteCount(nextTaxiData.sourceTelemetry?.downloadedByteCount ?? 0)} downloaded`
                  : 'Deterministic generated fixture · no network request'
            });
            loadedDeck.redraw(redrawReason);
            retirePreviousQueryEffect(
              loadedDeck,
              previousQueryEffect,
              nextQueryEffect,
              () => finalized || queryEffect !== nextQueryEffect
            );
            resolve();
          };

          stagedLayers = makeTaxiLayers(nextQueryEffect, nextTaxiDataRevision, {
            staged: true,
            onLayerReady: layerIndex => {
              readyLayerIndexes.add(layerIndex);
              if (readyLayerIndexes.size === stagedLayers.length) {
                queueMicrotask(commitActivation);
              }
            },
            onLayerError: rejectActivation
          });

          try {
            loadedDeck.setProps({
              effects: previousQueryEffect
                ? [previousQueryEffect, nextQueryEffect]
                : [nextQueryEffect],
              layers: [...previousLayers, ...stagedLayers]
            });
            loadedDeck.redraw('luSpatial taxi source activation staged');
          } catch (error) {
            rejectActivation(error instanceof Error ? error : new Error(String(error)));
          }
        });
      };

      void (async () => {
        let generatedTaxiData: LuSpatialTaxiData;
        try {
          generatedTaxiData = await makeLuSpatialTaxiDataAsync(
            Math.min(residentPointCapacity, TAXI_POINT_COUNT),
            {
              signal: generationController.signal,
              onProgress: (processedPointCount, totalPointCount) => {
                controls.setLoadingProgress(processedPointCount, totalPointCount);
                loadingIndicator.setProgress(processedPointCount, totalPointCount);
              }
            }
          );
          generationController.signal.throwIfAborted();
          loadingIndicator.setStatus('Compiling luProj projection and GPU spatial index…');
          await activateTaxiData(generatedTaxiData, 'luProj and luSpatial initialized');
          loadingIndicator.destroy();
        } catch (error) {
          if (!generationController.signal.aborted && !finalized) {
            loadingIndicator.setStatus(
              `GPU initialization failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
          return;
        }
        if (taxiPointSource && sourceLoadController) {
          controls.updateSourceStatus({message: 'Reading packed taxi manifest…'});
          try {
            const metadata = await taxiPointSource.getMetadata(sourceLoadController.signal);
            assertLongitudeLatitudeTaxiMetadata(metadata);
            controls.updateSourceStatus({
              corpusPointCount: metadata.rowCount,
              message: `Streaming ${formatCount(Math.min(residentPointCapacity, metadata.rowCount))} source rows…`
            });
            const residentWindow = await loadTaxiPointResidentWindow(taxiPointSource, {
              capacity: residentPointCapacity,
              signal: sourceLoadController.signal,
              onProgress: progress => {
                if (finalized) return;
                controls.updateSourceStatus({
                  corpusPointCount: progress.sourceRowCount,
                  message: `Streaming ${formatCount(progress.residentRowCount)} / ${formatCount(progress.targetRowCount)} · ${formatByteCount(progress.telemetry.downloadedByteCount)}`
                });
              }
            });
            const packedTaxiData = makeLuSpatialTaxiDataFromResidentWindow(residentWindow);
            sourceLoadController.signal.throwIfAborted();
            if (finalized) return;
            await activateTaxiData(packedTaxiData, 'luSpatial packed taxi source activated');
          } catch (error) {
            if (sourceLoadController.signal.aborted || finalized) return;
            controls.updateSourceStatus({
              corpusPointCount: taxiData?.corpusPointCount ?? generatedTaxiData.corpusPointCount,
              message: `Packed source unavailable; using synthetic fixture · ${error instanceof Error ? error.message : String(error)}`
            });
          }
        }
      })();
    },
    onFinalize: () => {
      finalized = true;
      generationController.abort();
      sourceLoadController?.abort(new Error('luSpatial taxi explorer finalized'));
      void closeTaxiPointSource(taxiPointSource);
      resizeObserver.disconnect();
      loadingIndicator.destroy();
      controls.destroy();
      map.off('error', handleBasemapError);
      map.off('load', handleBasemapLoad);
      map.remove();
      if (ownsContainer) container.remove();
    }
  });

  return deck;
}

function synchronizeBasemap(map: maplibregl.Map, viewState: TaxiViewState): void {
  map.jumpTo({
    center: [viewState.longitude, viewState.latitude],
    zoom: viewState.zoom,
    pitch: viewState.pitch,
    bearing: viewState.bearing
  });
}

function getConfiguredTaxiManifestUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return new URLSearchParams(window.location.search).get('taxi-manifest')?.trim() || undefined;
}

async function closeTaxiPointSource(source: TaxiPointSource | null): Promise<void> {
  try {
    await source?.close();
  } catch {
    // Finalization is best effort; an asynchronous source cleanup failure must not be unhandled.
  }
}

function retirePreviousQueryEffect(
  deck: ArrowDeck<MapView>,
  previousQueryEffect: LuSpatialGeographicPointQueryEffect | null,
  nextQueryEffect: LuSpatialGeographicPointQueryEffect,
  shouldSkip: () => boolean
): void {
  if (!previousQueryEffect) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (shouldSkip()) return;
      deck.setProps({effects: [nextQueryEffect]});
      deck.redraw('luSpatial previous taxi source retired');
    });
  });
}

type TaxiLayerStagingOptions = {
  staged?: boolean;
  onLayerReady?: (layerIndex: number) => void;
  onLayerError?: (error: Error) => void;
};

function makeTaxiLayers(
  queryEffect: LuSpatialGeographicPointQueryEffect,
  taxiDataRevision: number,
  options: TaxiLayerStagingOptions = {}
): LuSpatialPointLayer[] {
  return [
    new LuSpatialPointLayer({
      id: `luspatial-taxi-context-${taxiDataRevision}`,
      data: [],
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 140, 32, 230],
      ...queryEffect.outputs.viewport,
      color: [94, 172, 198, 105],
      radiusPixels: 0.9,
      radiusScale: getTaxiPointRadiusScale,
      highlightRadiusScale: 1.65,
      opacity: 0.46,
      staged: options.staged,
      onResourcesReady: () => options.onLayerReady?.(0),
      onError: error => {
        options.onLayerError?.(error);
        return Boolean(options.onLayerError);
      }
    }),
    new LuSpatialPointLayer({
      id: `luspatial-taxi-selection-${taxiDataRevision}`,
      data: [],
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 140, 32, 245],
      ...queryEffect.outputs.selection,
      color: [52, 220, 244, 205],
      radiusPixels: 1.25,
      radiusScale: getTaxiPointRadiusScale,
      highlightRadiusScale: 1.65,
      opacity: 0.72,
      staged: options.staged,
      onResourcesReady: () => options.onLayerReady?.(1),
      onError: error => {
        options.onLayerError?.(error);
        return Boolean(options.onLayerError);
      }
    })
  ];
}

function getTaxiPointRadiusScale(viewport: Viewport): number {
  const zoom = viewport.zoom ?? 12;
  return Math.max(0.8, Math.min(2.2, 2 ** ((zoom - 12) * 0.2)));
}

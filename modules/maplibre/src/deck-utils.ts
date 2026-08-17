// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, _GlobeView as GlobeView, _flatten as flatten} from '@deck.gl/core';

import {
  getMapLibreElevation,
  getMapLibreProjection,
  type MapLibreRenderParameters
} from './compatibility';
import {getMapLibreLayerGroupId} from './layer-utils';

import type {DeckProps, Layer, MapViewState, Viewport} from '@deck.gl/core';
import type {Parameters} from '@luma.gl/core';
import type {Map as MapLibreMap} from 'maplibre-gl';
import type MapLibreLayerGroup from './layer-group';
import type {MapLibreLayerProps} from './layer-utils';

export const MAPLIBRE_VIEW_ID = 'maplibre';

type UserData = {
  currentViewport?: Viewport | null;
};

type MapLibreDeckState = {
  deck: Deck;
  moveListener: () => void;
  renderListener: () => void;
  watchingMove: boolean;
};

const MAPLIBRE_DECK_STATES = new WeakMap<MapLibreMap, MapLibreDeckState>();

export function createMapLibreInterleavedDeck(map: MapLibreMap, props: DeckProps): Deck {
  if (MAPLIBRE_DECK_STATES.has(map)) {
    throw new Error('MapLibreOverlay supports one interleaved overlay per map');
  }

  const gl = map.getCanvas().getContext('webgl2');
  if (!gl) {
    throw new Error(
      'MapLibreOverlay cannot interleave with the active MapLibre renderer. This release supports WebGL2.'
    );
  }

  const {device: _, ...deckProps} = props;
  const deck = new Deck({...deckProps, gl});
  try {
    return createMapLibreDeckInstance(map, deck);
  } catch (error) {
    if (getMapLibreDeckInstance(map) === deck) {
      removeMapLibreDeckInstance(map);
    } else {
      deck.finalize();
    }
    throw error;
  }
}

export function getMapLibreDefaultParameters(_map: MapLibreMap, interleaved: boolean): Parameters {
  return interleaved
    ? {
        depthWriteEnabled: true,
        depthCompare: 'less-equal',
        depthBias: 0,
        blend: true,
        blendColorSrcFactor: 'src-alpha',
        blendColorDstFactor: 'one-minus-src-alpha',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one-minus-src-alpha',
        blendColorOperation: 'add',
        blendAlphaOperation: 'add'
      }
    : {};
}

export function getMapLibreDefaultView(map: MapLibreMap): GlobeView | MapView {
  return getMapLibreProjection(map) === 'globe'
    ? new GlobeView({id: MAPLIBRE_VIEW_ID})
    : new MapView({id: MAPLIBRE_VIEW_ID});
}

export function getMapLibreViewState(map: MapLibreMap): MapViewState & {
  repeat: boolean;
  padding: {top: number; bottom: number; left: number; right: number};
} {
  const {lng, lat} = map.getCenter();
  const padding = map.getPadding();
  const viewState: MapViewState & {
    repeat: boolean;
    padding: {top: number; bottom: number; left: number; right: number};
  } = {
    longitude: ((lng + 540) % 360) - 180,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding: {
      top: padding.top ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0,
      right: padding.right ?? 0
    },
    repeat: map.getRenderWorldCopies()
  };

  const elevation = getMapLibreElevation(map);
  if (typeof elevation === 'number' && Number.isFinite(elevation)) {
    viewState.position = [0, 0, elevation];
  }

  return viewState;
}

export function createMapLibreDeckInstance(map: MapLibreMap, deck: Deck): Deck {
  const existingState = MAPLIBRE_DECK_STATES.get(map);
  if (existingState) {
    throw new Error('MapLibreOverlay supports one interleaved overlay per map');
  }

  const customRender = deck.props._customRender;
  const onLoad = deck.props.onLoad;
  const state: MapLibreDeckState = {
    deck,
    watchingMove: false,
    moveListener: () => {
      if (deck.isInitialized) {
        onMapLibreMove(deck, map);
      } else {
        stopWatchingMove(map, state);
      }
    },
    renderListener: () => {
      if (deck.isInitialized) {
        afterMapLibreRender(deck, map);
      }
    }
  };
  MAPLIBRE_DECK_STATES.set(map, state);

  const deckProps: any = {
    ...deck.props,
    _customRender: () => {
      map.triggerRepaint();
      customRender?.('');
    }
  };
  deckProps.views ||= getMapLibreDefaultView(map);
  Object.assign(deckProps, {
    width: null,
    height: null,
    touchAction: 'unset',
    viewState: getMapLibreViewState(map)
  });

  if (deck.isInitialized) {
    startWatchingMove(map, state);
  } else {
    deckProps.onLoad = () => {
      onLoad?.();
      if (MAPLIBRE_DECK_STATES.get(map) === state) {
        startWatchingMove(map, state);
      }
    };
  }

  deck.setProps(deckProps);
  map.on('render', state.renderListener);
  return deck;
}

export function getMapLibreDeckInstance(map: MapLibreMap): Deck | undefined {
  return MAPLIBRE_DECK_STATES.get(map)?.deck;
}

export function removeMapLibreDeckInstance(map: MapLibreMap): void {
  const state = MAPLIBRE_DECK_STATES.get(map);
  if (!state) {
    return;
  }

  stopWatchingMove(map, state);
  map.off('render', state.renderListener);
  state.deck.finalize();
  MAPLIBRE_DECK_STATES.delete(map);
}

export function drawMapLibreLayerGroup(
  deck: Deck,
  map: MapLibreMap,
  group: MapLibreLayerGroup,
  renderParameters: MapLibreRenderParameters
): void {
  if (!deck.isInitialized) {
    return;
  }

  let {currentViewport} = deck.userData as UserData;
  let clearStack = false;
  if (!currentViewport) {
    currentViewport = getMapLibreViewport(deck, map, renderParameters);
    (deck.userData as UserData).currentViewport = currentViewport;
    clearStack = true;
  }

  if (!currentViewport) {
    return;
  }

  deck._drawLayers('maplibre-repaint', {
    viewports: [currentViewport],
    layerFilter: params => {
      if (deck.props.layerFilter && !deck.props.layerFilter(params)) {
        return false;
      }

      const layer = params.layer as Layer<MapLibreLayerProps>;
      return layer.props.beforeId === group.beforeId;
    },
    clearStack,
    clearCanvas: false
  });
}

function startWatchingMove(map: MapLibreMap, state: MapLibreDeckState): void {
  if (!state.watchingMove) {
    state.watchingMove = true;
    map.on('move', state.moveListener);
  }
}

function stopWatchingMove(map: MapLibreMap, state: MapLibreDeckState): void {
  if (state.watchingMove) {
    state.watchingMove = false;
    map.off('move', state.moveListener);
  }
}

function getMapLibreViewport(
  deck: Deck,
  map: MapLibreMap,
  renderParameters?: MapLibreRenderParameters
): Viewport | null {
  const viewState = getMapLibreViewState(map);
  const view = (deck.getView(MAPLIBRE_VIEW_ID) || getMapLibreDefaultView(map)) as
    | MapView
    | GlobeView;

  if (renderParameters) {
    view.props.nearZMultiplier = 0.2;
    const height = map.getCanvas().clientHeight;
    if (
      height > 0 &&
      Number.isFinite(renderParameters.nearZ) &&
      Number.isFinite(renderParameters.farZ)
    ) {
      viewState.nearZ = renderParameters.nearZ / height;
      viewState.farZ = renderParameters.farZ / height;
    }
  }

  return view.makeViewport({
    width: deck.width,
    height: deck.height,
    viewState
  });
}

function afterMapLibreRender(deck: Deck, map: MapLibreMap): void {
  const deckLayers = flatten(deck.props.layers, Boolean) as Layer<MapLibreLayerProps>[];
  const hasNonMapLibreLayers = deckLayers.some(
    layer => layer && !map.getLayer(getMapLibreLayerGroupId(layer))
  );
  let viewports = deck.getViewports();
  const mapLibreViewportIndex = viewports.findIndex(viewport => viewport.id === MAPLIBRE_VIEW_ID);
  const hasNonMapLibreViews = viewports.length > 1 || mapLibreViewportIndex < 0;

  if (hasNonMapLibreLayers || hasNonMapLibreViews) {
    if (mapLibreViewportIndex >= 0) {
      viewports = viewports.slice();
      const mapLibreViewport = getMapLibreViewport(deck, map);
      if (mapLibreViewport) {
        viewports[mapLibreViewportIndex] = mapLibreViewport;
      } else {
        viewports.splice(mapLibreViewportIndex, 1);
      }
    }

    deck._drawLayers('maplibre-repaint', {
      viewports,
      layerFilter: params =>
        (!deck.props.layerFilter || deck.props.layerFilter(params)) &&
        (params.viewport.id !== MAPLIBRE_VIEW_ID ||
          !map.getLayer(getMapLibreLayerGroupId(params.layer as Layer<MapLibreLayerProps>))),
      clearCanvas: false
    });
  } else {
    const device = (deck as any).device;
    const gl = device?.gl;
    deck.props.onBeforeRender?.({device, gl});
    deck.props.onAfterRender?.({device, gl});
  }

  (deck.userData as UserData).currentViewport = null;
}

function onMapLibreMove(deck: Deck, map: MapLibreMap): void {
  deck.setProps({viewState: getMapLibreViewState(map)});
  deck.needsRedraw({clearRedrawFlags: true});
}

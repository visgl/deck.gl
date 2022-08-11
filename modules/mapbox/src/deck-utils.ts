import {Deck, WebMercatorViewport, MapView, _flatten as flatten} from '@deck.gl/core';
import type {DeckProps, MapViewState, Layer} from '@deck.gl/core';
import type MapboxLayer from './mapbox-layer';
import type {Map} from 'mapbox-gl';

type UserData = {
  isExternal: boolean;
  currentViewport?: WebMercatorViewport | null;
  mapboxLayers: Set<MapboxLayer<any>>;
  mapboxVersion: {minor: number; major: number};
};

export function getDeckInstance({
  map,
  gl,
  deck
}: {
  map: Map & {__deck?: Deck | null};
  gl: WebGLRenderingContext;
  deck?: Deck;
}): Deck {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const customRender = deck?.props._customRender;

  const deckProps: DeckProps = {
    useDevicePixels: true,
    _customRender: () => {
      map.triggerRepaint();
      // customRender may be subscribed by DeckGL React component to update child props
      // make sure it is still called
      // Hack - do not pass a redraw reason here to prevent the React component from clearing the context
      // Rerender will be triggered by MapboxLayer's render()
      customRender?.('');
    },
    // TODO: import these defaults from a single source of truth
    parameters: {
      depthMask: true,
      depthTest: true,
      blend: true,
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthFunc: gl.LEQUAL,
      blendEquation: gl.FUNC_ADD
    },
    views: (deck && deck.props.views) || [new MapView({id: 'mapbox'})]
  };

  let deckInstance: Deck;

  if (!deck || deck.props.gl === gl) {
    // deck is using the WebGLContext created by mapbox
    // block deck from setting the canvas size
    Object.assign(deckProps, {
      gl,
      width: null,
      height: null,
      touchAction: 'unset',
      viewState: getViewState(map)
    });
    // If using the WebGLContext created by deck (React use case), we use deck's viewState to drive the map.
    // Otherwise (pure JS use case), we use the map's viewState to drive deck.
    map.on('move', () => onMapMove(deckInstance, map));
  }

  if (deck) {
    deckInstance = deck;
    deck.setProps(deckProps);
    (deck.userData as UserData).isExternal = true;
  } else {
    deckInstance = new Deck(deckProps);
    map.on('remove', () => {
      deckInstance.finalize();
      map.__deck = null;
    });
  }

  (deckInstance.userData as UserData).mapboxLayers = new Set();
  (deckInstance.userData as UserData).mapboxVersion = getMapboxVersion(map);
  map.__deck = deckInstance;
  map.on('render', () => {
    if (deckInstance.isInitialized) afterRender(deckInstance, map);
  });

  return deckInstance;
}

export function addLayer(deck: Deck, layer: MapboxLayer<any>): void {
  (deck.userData as UserData).mapboxLayers.add(layer);
  updateLayers(deck);
}

export function removeLayer(deck: Deck, layer: MapboxLayer<any>): void {
  (deck.userData as UserData).mapboxLayers.delete(layer);
  updateLayers(deck);
}

export function updateLayer(deck: Deck, layer: MapboxLayer<any>): void {
  updateLayers(deck);
}

export function drawLayer(deck: Deck, map: Map, layer: MapboxLayer<any>): void {
  let {currentViewport} = deck.userData as UserData;
  let clearStack: boolean = false;
  if (!currentViewport) {
    // This is the first layer drawn in this render cycle.
    // Generate viewport from the current map state.
    currentViewport = getViewport(deck, map, true);
    (deck.userData as UserData).currentViewport = currentViewport;
    clearStack = true;
  }

  if (!deck.isInitialized) {
    return;
  }

  deck._drawLayers('mapbox-repaint', {
    viewports: [currentViewport],
    layerFilter: ({layer: deckLayer}) => layer.id === deckLayer.id,
    clearStack,
    clearCanvas: false
  });
}

export function getViewState(map: Map): MapViewState & {
  repeat: boolean;
  padding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
} {
  const {lng, lat} = map.getCenter();
  return {
    // Longitude returned by getCenter can be outside of [-180, 180] when zooming near the anti meridian
    // https://github.com/visgl/deck.gl/issues/6894
    longitude: ((lng + 540) % 360) - 180,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding: map.getPadding(),
    repeat: map.getRenderWorldCopies()
  };
}

function getMapboxVersion(map: Map): {minor: number; major: number} {
  // parse mapbox version string
  let major = 0;
  let minor = 0;
  // @ts-ignore (2339) undefined property
  const version: string = map.version;
  if (version) {
    [major, minor] = version.split('.').slice(0, 2).map(Number);
  }
  return {major, minor};
}

function getViewport(deck: Deck, map: Map, useMapboxProjection = true): WebMercatorViewport {
  const {mapboxVersion} = deck.userData as UserData;

  return new WebMercatorViewport(
    Object.assign(
      {
        id: 'mapbox',
        x: 0,
        y: 0,
        width: deck.width,
        height: deck.height
      },
      getViewState(map),
      useMapboxProjection
        ? {
            // match mapbox's projection matrix
            // A change of near plane was made in 1.3.0
            // https://github.com/mapbox/mapbox-gl-js/pull/8502
            nearZMultiplier:
              (mapboxVersion.major === 1 && mapboxVersion.minor >= 3) || mapboxVersion.major >= 2
                ? 0.02
                : 1 / (deck.height || 1)
          }
        : {
            // use deck.gl's own default
            nearZMultiplier: 0.1
          }
    )
  );
}

function afterRender(deck: Deck, map: Map): void {
  const {mapboxLayers, isExternal} = deck.userData as UserData;

  if (isExternal) {
    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(mapboxLayers, layer => layer.id);
    const deckLayers = flatten(deck.props.layers, Boolean) as Layer[];
    const hasNonMapboxLayers = deckLayers.some(
      layer => layer && !mapboxLayerIds.includes(layer.id)
    );
    let viewports = deck.getViewports();
    const mapboxViewportIdx = viewports.findIndex(vp => vp.id === 'mapbox');
    const hasNonMapboxViews = viewports.length > 1 || mapboxViewportIdx < 0;

    if (hasNonMapboxLayers || hasNonMapboxViews) {
      if (mapboxViewportIdx >= 0) {
        viewports = viewports.slice();
        viewports[mapboxViewportIdx] = getViewport(deck, map, false);
      }

      deck._drawLayers('mapbox-repaint', {
        viewports,
        layerFilter: params =>
          (!deck.props.layerFilter || deck.props.layerFilter(params)) &&
          (params.viewport.id !== 'mapbox' || !mapboxLayerIds.includes(params.layer.id)),
        clearCanvas: false
      });
    }
  }

  // End of render cycle, clear generated viewport
  (deck.userData as UserData).currentViewport = null;
}

function onMapMove(deck: Deck, map: Map): void {
  deck.setProps({
    viewState: getViewState(map)
  });
  // Camera changed, will trigger a map repaint right after this
  // Clear any change flag triggered by setting viewState so that deck does not request
  // a second repaint
  deck.needsRedraw({clearRedrawFlags: true});
}

function updateLayers(deck: Deck): void {
  if ((deck.userData as UserData).isExternal) {
    return;
  }

  const layers: Layer[] = [];
  (deck.userData as UserData).mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({layers});
}

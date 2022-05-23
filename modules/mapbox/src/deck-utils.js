import {Deck, WebMercatorViewport, MapView} from '@deck.gl/core';

export function getDeckInstance({map, gl, deck}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  const customRender = deck && deck.props._customRender;

  const deckProps = {
    useDevicePixels: true,
    _customRender: () => {
      map.triggerRepaint();
      if (customRender) {
        // customRender may be subscribed by DeckGL React component to update child props
        // make sure it is still called
        customRender();
      }
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
    userData: {
      isExternal: false,
      mapboxLayers: new Set()
    },
    views: (deck && deck.props.views) || [new MapView({id: 'mapbox'})]
  };

  if (!deck || deck.props.gl === gl) {
    // deck is using the WebGLContext created by mapbox
    // block deck from setting the canvas size
    Object.assign(deckProps, {
      gl,
      width: false,
      height: false,
      touchAction: 'unset',
      viewState: getViewState(map)
    });
    // If using the WebGLContext created by deck (React use case), we use deck's viewState to drive the map.
    // Otherwise (pure JS use case), we use the map's viewState to drive deck.
    map.on('move', () => onMapMove(deck, map));
  }

  if (deck) {
    deck.setProps(deckProps);
    deck.props.userData.isExternal = true;
  } else {
    deck = new Deck(deckProps);
    map.on('remove', () => {
      deck.finalize();
      map.__deck = null;
    });
  }

  deck.props.userData.mapboxVersion = getMapboxVersion(map);
  map.__deck = deck;
  map.on('render', () => {
    if (deck.layerManager) afterRender(deck, map);
  });

  return deck;
}

export function addLayer(deck, layer) {
  deck.props.userData.mapboxLayers.add(layer);
  updateLayers(deck);
}

export function removeLayer(deck, layer) {
  deck.props.userData.mapboxLayers.delete(layer);
  updateLayers(deck);
}

export function updateLayer(deck, layer) {
  updateLayers(deck);
}

export function drawLayer(deck, map, layer) {
  let {currentViewport} = deck.props.userData;
  if (!currentViewport) {
    // This is the first layer drawn in this render cycle.
    // Generate viewport from the current map state.
    currentViewport = getViewport(deck, map, true);
    deck.props.userData.currentViewport = currentViewport;
  }
  if (!deck.layerManager) {
    return;
  }

  deck._drawLayers('mapbox-repaint', {
    viewports: [currentViewport],
    layerFilter: ({layer: deckLayer}) => layer.id === deckLayer.id,
    clearCanvas: false
  });
}

export function getViewState(map) {
  const {lng, lat} = map.getCenter();
  return {
    // Longitude returned by getCenter can be outside of [-180, 180] when zooming near the anti meridian
    // https://github.com/visgl/deck.gl/issues/6894
    longitude: ((lng + 540) % 360) - 180,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    repeat: map.getRenderWorldCopies()
  };
}

function getMapboxVersion(map) {
  // parse mapbox version string
  let major = 0;
  let minor = 0;
  if (map.version) {
    [major, minor] = map.version.split('.').slice(0, 2).map(Number);
  }
  return {major, minor};
}

function getViewport(deck, map, useMapboxProjection = true) {
  const {mapboxVersion} = deck.props.userData;

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

function afterRender(deck, map) {
  const {mapboxLayers, isExternal} = deck.props.userData;

  if (isExternal) {
    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(mapboxLayers, layer => layer.id);
    const hasNonMapboxLayers = deck.props.layers.some(layer => !mapboxLayerIds.includes(layer.id));
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
  deck.props.userData.currentViewport = null;
}

function onMapMove(deck, map) {
  deck.setProps({
    viewState: getViewState(map)
  });
  // Camera changed, will trigger a map repaint right after this
  // Clear any change flag triggered by setting viewState so that deck does not request
  // a second repaint
  deck.needsRedraw({clearRedrawFlags: true});
}

function updateLayers(deck) {
  if (deck.props.userData.isExternal) {
    return;
  }

  const layers = [];
  let layerIndex = 0;
  deck.props.userData.mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props, {_offset: layerIndex++});
    layers.push(layer);
  });
  deck.setProps({layers});
}

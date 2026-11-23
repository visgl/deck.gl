// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// @vitest-environment node
// Invariant: DeckGL roots never touch `document` or `window` during render. All DOM
// resolution happens in effects, so every root entry point must server-render in plain Node.
import {createElement} from 'react';
import type {ComponentType} from 'react';
import {renderToString} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {ScatterplotLayer as DeckScatterplotLayer} from '@deck.gl/layers';
import {MapView} from '@deck.gl/react/wrappers/core';
import {createLayerComponent} from '@deck.gl/react/wrappers/factories';
import {ScatterplotLayer} from '@deck.gl/react/wrappers/layers';
import {ZoomWidget} from '@deck.gl/react/wrappers/widgets';
import {createDeckGL, DeckGL} from '@deck.gl/react/dom/index';
import {DeckGL as GoogleMapsDeckGL} from '@deck.gl/react/dom/google-maps';
import {DeckGL as MapboxDeckGL} from '@deck.gl/react/dom/mapbox';
import {DeckGL as MapLibreDeckGL} from '@deck.gl/react/dom/maplibre';

function renderOnServer(Component: ComponentType<any>, props: object = {}): string {
  return renderToString(createElement(Component, props, null));
}

describe('server rendering without a DOM', () => {
  it('runs without document or window', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
  });

  it('renders the standalone root markup with @deck.gl/react ids and wrapper styles', () => {
    expect(renderOnServer(DeckGL)).toBe(
      '<div id="deckgl-wrapper" style="position:absolute;z-index:0;left:0;top:0;width:100%;height:100%">' +
        '<canvas id="deckgl-overlay" style="left:0;top:0"></canvas></div>'
    );
  });

  it('derives the standalone root ids from id and sizes the wrapper', () => {
    expect(renderOnServer(DeckGL, {height: 300, id: 'map', width: '50%'})).toBe(
      '<div id="map-wrapper" style="position:absolute;z-index:0;left:0;top:0;width:50%;height:300px">' +
        '<canvas id="map" style="left:0;top:0"></canvas></div>'
    );
  });

  it.each([
    ['/mapbox', MapboxDeckGL],
    ['/maplibre', MapLibreDeckGL],
    ['/google-maps', GoogleMapsDeckGL]
  ])('renders the %s provider root as empty markup', (_name, Component) => {
    expect(renderOnServer(Component, {interleaved: true})).toBe('');
    expect(renderOnServer(Component)).toBe('');
  });

  it('does not create an external overlay during server rendering', () => {
    const createExternalOverlay = vi.fn(() => ({finalize: vi.fn(), setProps: vi.fn()}));
    const CustomDeckGL = createDeckGL({createExternalOverlay});
    expect(renderOnServer(CustomDeckGL, {interleaved: true})).toBe('');
    expect(createExternalOverlay).not.toHaveBeenCalled();
  });

  // `'use client'` modules render on the server too, so anything an element generates there
  // could differ from the client. DeckGL hands its children to the renderer in a layout effect,
  // which never runs on the server, so no layer, view, widget or generated id is made there.
  describe('with deck.gl children', () => {
    function renderWithChildren(Component: ComponentType<any>, props: object = {}) {
      const constructed = vi.fn();
      const rendered = vi.fn();
      class SpyLayer extends DeckScatterplotLayer {
        constructor(layerProps: object) {
          constructed();
          super(layerProps);
        }
      }
      const SpyLayerComponent = createLayerComponent(SpyLayer as never);
      function SpyChild() {
        rendered();
        return null;
      }
      const html = renderToString(
        createElement(
          Component,
          props,
          createElement(ScatterplotLayer, {key: 'points', data: []}),
          createElement('deckLayer', {key: 'raw', layer: {} as never}),
          createElement(MapView, {key: 'main'}),
          createElement(ZoomWidget, {key: 'zoom'}),
          createElement(SpyLayerComponent, {key: 'spy', data: []}),
          createElement(SpyChild, {key: 'child'})
        )
      );
      return {html, constructed, rendered};
    }

    it('renders the standalone root markup without rendering its children', () => {
      const {html, constructed, rendered} = renderWithChildren(DeckGL);
      expect(html).toBe(renderOnServer(DeckGL));
      expect(constructed).not.toHaveBeenCalled();
      expect(rendered).not.toHaveBeenCalled();
    });

    it.each([
      ['/mapbox', MapboxDeckGL],
      ['/maplibre', MapLibreDeckGL],
      ['/google-maps', GoogleMapsDeckGL]
    ])('renders the %s provider root without rendering its children', (_name, Component) => {
      const {html, constructed, rendered} = renderWithChildren(Component, {interleaved: true});
      expect(html).toBe('');
      expect(constructed).not.toHaveBeenCalled();
      expect(rendered).not.toHaveBeenCalled();
    });
  });
});

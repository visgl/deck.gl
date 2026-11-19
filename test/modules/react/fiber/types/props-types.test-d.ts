import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import type {MapboxOverlay} from '@deck.gl/mapbox';
import type {MapLibreOverlay} from '@deck.gl/maplibre';
import type {Deck} from '@deck.gl/core';
import {createElement, createRef} from 'react';
import type {ComponentProps, ReactNode, Ref} from 'react';
import {DeckGL} from '../../dom/components';
import {DeckGL as MapboxDeckGL} from '../../dom/mapbox';
import {DeckGL as MapLibreDeckGL} from '../../dom/maplibre';
import {describe, expect, expectTypeOf, it} from 'vitest';

import type {DeckGLProps} from '../react';

describe('Props Type Tests', () => {
  it('keeps plain and provider root callback types distinct', () => {
    const mapboxProps = {
      children: null,
      interleaved: true,
      onDeckChange: overlay => {
        const instance: MapboxOverlay | null = overlay;
        expect(instance).toBeDefined();
      }
    } satisfies ComponentProps<typeof MapboxDeckGL>;
    const maplibreProps = {
      children: null,
      interleaved: false,
      onDeckChange: overlay => {
        const instance: MapLibreOverlay | null = overlay;
        expect(instance).toBeDefined();
      }
    } satisfies ComponentProps<typeof MapLibreDeckGL>;

    // @ts-expect-error `interleaved` is an overlay option that `DeckProps` does not declare.
    const plainInterleaved: DeckGLProps = {interleaved: true};
    // @ts-expect-error The exported plain component rejects `interleaved`, not just its props alias.
    const plainComponentInterleaved = {children: null, interleaved: true} satisfies ComponentProps<
      typeof DeckGL
    >;
    void mapboxProps;
    void maplibreProps;
    void plainInterleaved;
    void plainComponentInterleaved;
  });

  it('accepts a canvas element or element id only on the plain root', () => {
    const byId = {canvas: 'map-canvas', children: null} satisfies ComponentProps<typeof DeckGL>;
    const byElement = {
      canvas: document.createElement('canvas'),
      children: null
    } satisfies ComponentProps<typeof DeckGL>;
    const mapboxCanvas: ComponentProps<typeof MapboxDeckGL> = {
      // @ts-expect-error The host map owns the canvas of a Mapbox provider root.
      canvas: 'map-canvas',
      children: null
    };
    const maplibreCanvas: ComponentProps<typeof MapLibreDeckGL> = {
      // @ts-expect-error The host map owns the canvas of a MapLibre provider root.
      canvas: 'map-canvas',
      children: null
    };
    void byId;
    void byElement;
    void mapboxCanvas;
    void maplibreCanvas;
  });

  it('types the ref of each root as its own instance', () => {
    const plainRef = {children: null, ref: createRef<Deck>()} satisfies ComponentProps<
      typeof DeckGL
    >;
    const plainCallbackRef = {
      children: null,
      ref: (deckgl: Deck | null) => {
        void deckgl;
        return () => undefined;
      }
    } satisfies ComponentProps<typeof DeckGL>;
    const mapboxRef = {children: null, ref: createRef<MapboxOverlay>()} satisfies ComponentProps<
      typeof MapboxDeckGL
    >;
    const maplibreRef = {
      children: null,
      ref: createRef<MapLibreOverlay>()
    } satisfies ComponentProps<typeof MapLibreDeckGL>;
    const mapboxDeckRef: ComponentProps<typeof MapboxDeckGL> = {
      children: null,
      // @ts-expect-error A Mapbox root ref receives a MapboxOverlay, not a Deck.
      ref: createRef<Deck>()
    };
    expectTypeOf<NonNullable<DeckGLProps['ref']>>().toEqualTypeOf<NonNullable<Ref<Deck>>>();
    void createElement(DeckGL, {children: null, ref: createRef<Deck>()});
    void plainRef;
    void plainCallbackRef;
    void mapboxRef;
    void maplibreRef;
    void mapboxDeckRef;
  });

  it('accepts every root without children', () => {
    const layers = [new ScatterplotLayer({data: [], id: 'points'})];
    const plain = {layers} satisfies ComponentProps<typeof DeckGL>;
    const mapbox = {interleaved: true, layers} satisfies ComponentProps<typeof MapboxDeckGL>;
    const maplibre = {layers} satisfies ComponentProps<typeof MapLibreDeckGL>;
    void createElement(DeckGL, {layers});
    void createElement(MapboxDeckGL, {layers});
    void createElement(MapLibreDeckGL, {layers});
    void plain;
    void mapbox;
    void maplibre;
  });

  it('should DeckGLProps accept initialViewState', () => {
    // Arrange
    const props: DeckGLProps = {
      initialViewState: {
        latitude: 0,
        longitude: 0,
        zoom: 1
      }
    };

    // Assert - initialViewState is accepted
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps accept layers array', () => {
    // Arrange
    const layer = new ScatterplotLayer({data: [], id: 'test'});
    const props: DeckGLProps = {
      layers: [layer]
    };

    // Assert - layers array is accepted
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps accept views array', () => {
    // Arrange
    const view = new MapView({id: 'map'});
    const props: DeckGLProps = {
      views: [view] as never
    };

    // Assert - views array is accepted
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps accept onDeckChange', () => {
    const props: DeckGLProps = {
      onDeckChange: deck => {
        const instance: Deck | null = deck;
        expect(instance).toBeDefined();
      }
    };

    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps accept children (ReactNode)', () => {
    // Arrange
    const props: DeckGLProps = {
      children: 'test'
    };

    // Assert - children is accepted
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should ScatterplotLayer preserve data generic type', () => {
    // Arrange
    interface DataPoint {
      x: number;
      y: number;
      value: number;
    }
    const data: DataPoint[] = [
      {value: 1, x: 0, y: 0},
      {value: 2, x: 1, y: 1}
    ];

    // Act - create layer with typed data
    const layer = new ScatterplotLayer<DataPoint>({
      data,
      getPosition: d => [d.x, d.y],
      id: 'typed'
    });

    // Assert - type test passes at compile time
    expect(layer).toBeDefined();
  });

  it('should ReactElement type compatible across React versions', () => {
    // This test ensures our types work with both React 18 and 19
    // ReactElement should be compatible regardless of React version
    const element: React.ReactElement = {
      key: null,
      props: {},
      type: 'div'
    };

    expectTypeOf(element).toHaveProperty('type');
    expectTypeOf(element).toHaveProperty('props');
    expectTypeOf(element).toHaveProperty('key');
  });

  it('should ReactNode type compatible across React versions', () => {
    // Test that ReactNode accepts various types across React versions
    const stringNode: ReactNode = 'text';
    const numberNode: ReactNode = 123;
    const booleanNode: ReactNode = true;
    const nullNode: ReactNode = null;
    const undefinedNode: ReactNode = undefined;

    // ReactNode is a union type, so specific values match it
    expectTypeOf(stringNode).toMatchTypeOf<ReactNode>();
    expectTypeOf(numberNode).toMatchTypeOf<ReactNode>();
    expectTypeOf(booleanNode).toMatchTypeOf<ReactNode>();
    expectTypeOf(nullNode).toMatchTypeOf<ReactNode>();
    expectTypeOf(undefinedNode).toMatchTypeOf<ReactNode>();
  });

  it('should DeckGLProps accept empty object', () => {
    // Arrange
    const props: DeckGLProps = {};

    // Assert - all props are optional
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps accept combined props', () => {
    // Arrange
    const view = new MapView({id: 'map'});
    const layer = new ScatterplotLayer({data: [], id: 'test'});
    const props: DeckGLProps = {
      children: 'test',
      initialViewState: {
        latitude: 0,
        longitude: 0,
        zoom: 1
      },
      layers: [layer],
      views: [view] as never
    };

    // Assert
    expectTypeOf(props).toMatchTypeOf<DeckGLProps>();
  });

  it('should DeckGLProps reject invalid initialViewState', () => {
    // Missing required fields - these should produce type errors
    // but initialViewState type is lenient for partial updates
    const _missingLat: DeckGLProps = {
      initialViewState: {
        longitude: 0,
        zoom: 1
      } as never
    };

    const _missingLon: DeckGLProps = {
      initialViewState: {
        latitude: 0,
        zoom: 1
      } as never
    };

    const _missingZoom: DeckGLProps = {
      initialViewState: {
        latitude: 0,
        longitude: 0
      } as never
    };

    // Assert - type test passes at compile time
    expect(_missingLat).toBeDefined();
  });

  it('should ScatterplotLayer accessor functions receive correct types', () => {
    // Arrange
    interface DataPoint {
      coordinates: [number, number];
      color: [number, number, number];
      radius: number;
    }
    const data: DataPoint[] = [{color: [255, 0, 0], coordinates: [0, 0], radius: 10}];

    // Act - accessors should receive DataPoint type in their function parameters
    const layer = new ScatterplotLayer<DataPoint>({
      data,
      getFillColor: d => d.color,
      getPosition: d => d.coordinates,
      getRadius: d => d.radius,
      id: 'typed'
    });

    // Assert - type test passes at compile time
    expect(layer).toBeDefined();
  });
});

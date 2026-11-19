import mapboxgl from 'mapbox-gl';
import {Map as MapLibreMap} from 'maplibre-gl';
import type {ComponentProps} from 'react';
import {describe, expectTypeOf, it} from 'vitest';
import {createDeckGL, DeckGL} from '../../dom/components';
import type {DeckGLRenderer} from '../../shared/store';
import {DeckGL as MapboxDeckGL} from '../../dom/mapbox';
import {DeckGL as MapLibreDeckGL} from '../../dom/maplibre';

declare const maplibreMap: MapLibreMap;
declare const mapboxMap: mapboxgl.Map;
/** The shape of a React Map GL `MapRef`: a wrapper whose `getMap()` returns the map. */
declare const mapRef: {getMap(): MapLibreMap};

/** A custom overlay that takes its host map as a prop of its own. */
type OwnMapProps = {map?: string; pickingRadius?: number};
declare const createOwnMapOverlay: (props: OwnMapProps) => DeckGLRenderer;
const OwnMapDeckGL = createDeckGL({createExternalOverlay: createOwnMapOverlay});

describe('map prop types', () => {
  it('accepts a map, a getMap() wrapper, or null on the provider roots', () => {
    <MapLibreDeckGL map={maplibreMap} interleaved />;
    <MapLibreDeckGL map={mapRef} />;
    <MapLibreDeckGL map={null} />;
    <MapboxDeckGL map={mapboxMap} interleaved />;
    <MapboxDeckGL map={null} />;
    expectTypeOf<ComponentProps<typeof MapLibreDeckGL>['map']>().not.toBeAny();
  });

  it('rejects values that cannot host a control', () => {
    // @ts-expect-error a number is not a map
    <MapLibreDeckGL map={1} />;
    // @ts-expect-error a plain object is not a map
    <MapboxDeckGL map={{}} />;
  });

  it('has no map prop on the standalone root', () => {
    // @ts-expect-error the standalone root owns its canvas and has no host map
    <DeckGL map={maplibreMap} />;
  });

  it("types a custom root's own map prop when it has no attach", () => {
    <OwnMapDeckGL map="a" pickingRadius={1} />;
    expectTypeOf<ComponentProps<typeof OwnMapDeckGL>['map']>().toEqualTypeOf<string | undefined>();
    // @ts-expect-error the overlay declares map as a string
    <OwnMapDeckGL map={maplibreMap} />;
  });
});

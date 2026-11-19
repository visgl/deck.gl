// Uses the real reconciler and the real GoogleMapsOverlay against a fake `google.maps.Map`, so no
// Google Maps API key or script is needed. The fake map never reports a rendering type, so the
// overlay attaches and detaches without creating its deck.gl instance.
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {act, render} from '@testing-library/react';
import {StrictMode} from 'react';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {attachGoogleMap, type GoogleMap} from '../attach-google-map';
import {DeckGL} from '../google-maps';

/** A `google.maps.Map` with only what `GoogleMapsOverlay.setMap` calls. */
class FakeGoogleMap {
  /** The overlays' `renderingtype_changed` listeners that are still registered. */
  readonly listeners = new Set<object>();
  constructor(readonly name: string) {}
  getRenderingType() {
    return 'UNINITIALIZED';
  }
  addListener(_event: string, _handler: () => void) {
    const listener = {remove: () => this.listeners.delete(listener)};
    this.listeners.add(listener);
    return listener;
  }
}

function asGoogleMap(map: FakeGoogleMap): GoogleMap {
  return map as unknown as GoogleMap;
}

/** The overlay's private props and map, which these tests read to check what it received. */
type OverlayInternals = {props: Record<string, unknown>; _map: FakeGoogleMap | null};
function internals(overlay: GoogleMapsOverlay): OverlayInternals {
  return overlay as unknown as OverlayInternals;
}

let events: string[];
let overlays: GoogleMapsOverlay[];

function indexOf(overlay: GoogleMapsOverlay): number {
  if (!overlays.includes(overlay)) {
    overlays.push(overlay);
  }
  return overlays.indexOf(overlay);
}

/** The `google` global that `GoogleMapsOverlay.setMap` reads. */
const globalScope = globalThis as {google?: unknown};

beforeAll(() => {
  globalScope.google = {
    maps: {RenderingType: {RASTER: 'RASTER', UNINITIALIZED: 'UNINITIALIZED', VECTOR: 'VECTOR'}}
  };
});

afterAll(() => {
  delete globalScope.google;
});

beforeEach(() => {
  events = [];
  overlays = [];
  const {setMap, finalize} = GoogleMapsOverlay.prototype;
  // Records `attach:<map>:<overlay>` and `detach:<map>:<overlay>` only when the map changes.
  vi.spyOn(GoogleMapsOverlay.prototype, 'setMap').mockImplementation(function (
    this: GoogleMapsOverlay,
    map
  ) {
    const current = internals(this)._map;
    if (map) {
      events.push(`attach:${(map as unknown as FakeGoogleMap).name}:${indexOf(this)}`);
    } else if (current) {
      events.push(`detach:${current.name}:${indexOf(this)}`);
    }
    setMap.call(this, map);
  });
  vi.spyOn(GoogleMapsOverlay.prototype, 'finalize').mockImplementation(function (
    this: GoogleMapsOverlay
  ) {
    events.push(`finalize:${indexOf(this)}`);
    finalize.call(this);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// A real layer: `<deckLayer>` rejects anything that is not a deck.gl Layer.
const LAYER = new ScatterplotLayer({id: 'points', data: []});

async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

describe('the /google-maps root', () => {
  it('attaches the overlay with setMap, and detaches it before finalizing on unmount', async () => {
    const map = new FakeGoogleMap('a');
    const onDeckChange = vi.fn();
    const {unmount} = render(
      <DeckGL map={asGoogleMap(map)} onDeckChange={onDeckChange}>
        <deckLayer layer={LAYER} />
      </DeckGL>
    );
    await flush();

    expect(onDeckChange).toHaveBeenLastCalledWith(expect.any(GoogleMapsOverlay));
    const overlay = onDeckChange.mock.lastCall?.[0] as GoogleMapsOverlay;
    expect(internals(overlay)._map).toBe(map);
    expect(map.listeners.size).toBe(1);
    expect(internals(overlay).props.layers).toEqual([LAYER]);

    unmount();
    expect(internals(overlay)._map).toBeNull();
    expect(map.listeners.size).toBe(0);
    expect(events).toEqual(['attach:a:0', 'detach:a:0', 'finalize:0']);
  });

  it('never passes map to the overlay', async () => {
    const map = asGoogleMap(new FakeGoogleMap('a'));
    const {rerender, unmount} = render(<DeckGL map={map} pickingRadius={1} />);
    await flush();
    rerender(<DeckGL map={map} pickingRadius={2} />);
    await flush();

    expect(internals(overlays[0]).props).not.toHaveProperty('map');
    expect(internals(overlays[0]).props.pickingRadius).toBe(2);
    unmount();
  });

  it('attaches when map is set later, moves to a new map, and detaches when it becomes null', async () => {
    const a = new FakeGoogleMap('a');
    const b = new FakeGoogleMap('b');
    const {rerender, unmount} = render(<DeckGL map={null} />);
    await flush();
    expect(events).toEqual([]);

    rerender(<DeckGL map={asGoogleMap(a)} />);
    await flush();
    rerender(<DeckGL map={asGoogleMap(b)} />);
    await flush();
    rerender(<DeckGL map={null} />);
    await flush();

    expect(a.listeners.size + b.listeners.size).toBe(0);
    expect(events).toEqual(['attach:a:0', 'detach:a:0', 'attach:b:0', 'detach:b:0']);
    // The same overlay moved between maps; changing map never recreates it.
    expect(overlays).toHaveLength(1);
    unmount();
  });

  it('attaches the new overlay to the same map when interleaved recreates it', async () => {
    const map = new FakeGoogleMap('a');
    const {rerender, unmount} = render(<DeckGL map={asGoogleMap(map)} interleaved={false} />);
    await flush();
    rerender(<DeckGL map={asGoogleMap(map)} interleaved />);
    await flush();

    expect(overlays).toHaveLength(2);
    expect(internals(overlays[0])._map).toBeNull();
    expect(internals(overlays[1])._map).toBe(map);
    expect(internals(overlays[1]).props.interleaved).toBe(true);
    expect(map.listeners.size).toBe(1);
    expect(events).toEqual(['attach:a:0', 'detach:a:0', 'finalize:0', 'attach:a:1']);

    unmount();
    expect(map.listeners.size).toBe(0);
  });

  it('leaves exactly one attached overlay after a Strict Mode replay', async () => {
    const map = new FakeGoogleMap('a');
    const {unmount} = render(
      <StrictMode>
        <DeckGL map={asGoogleMap(map)} />
      </StrictMode>
    );
    await flush();

    const attachedOverlays = overlays.filter(overlay => internals(overlay)._map === map);
    expect(attachedOverlays).toHaveLength(1);
    expect(map.listeners.size).toBe(1);

    unmount();
    expect(map.listeners.size).toBe(0);
    expect(overlays.every(overlay => internals(overlay)._map === null)).toBe(true);
  });

  it('sends only the views prop to the overlay, not JSX views', async () => {
    const view = new MapView({id: 'jsx'});
    const {unmount} = render(
      <DeckGL map={asGoogleMap(new FakeGoogleMap('a'))}>
        <deckView view={view} />
      </DeckGL>
    );
    await flush();

    expect(internals(overlays[0]).props.views).toBeUndefined();
    unmount();
  });
});

describe('attachGoogleMap', () => {
  it('sets the map, and clears it in the returned function', () => {
    const overlay = {setMap: vi.fn()};
    const map = asGoogleMap(new FakeGoogleMap('a'));

    const detach = attachGoogleMap(map, overlay);
    expect(overlay.setMap).toHaveBeenLastCalledWith(map);

    detach();
    expect(overlay.setMap).toHaveBeenLastCalledWith(null);
    expect(overlay.setMap).toHaveBeenCalledTimes(2);
  });
});

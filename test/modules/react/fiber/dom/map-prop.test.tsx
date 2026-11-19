// Uses the real reconciler, so each overlay is created and finalized as it is in an app.
import {ScatterplotLayer} from '@deck.gl/layers';
import {act, render} from '@testing-library/react';
import {StrictMode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {attachControl, type ControlHost} from '../attach-control';
import {createDeckGL} from '../components';

type FakeOverlayProps = {interleaved?: boolean; pickingRadius?: number};
type FakeOverlay = {
  index: number;
  props: FakeOverlayProps;
  map: FakeMap | null;
  finalize: () => void;
  setProps: (props: FakeOverlayProps) => void;
};

/** A map that records control changes as `add:<map>:<overlay>` and `remove:<map>:<overlay>`. */
class FakeMap implements ControlHost {
  readonly controls = new Set<unknown>();
  constructor(
    readonly name: string,
    readonly events: string[]
  ) {}
  addControl(control: unknown) {
    this.events.push(`add:${this.name}:${(control as FakeOverlay).index}`);
    this.controls.add(control);
    (control as FakeOverlay).map = this;
  }
  removeControl(control: unknown) {
    this.events.push(`remove:${this.name}:${(control as FakeOverlay).index}`);
    this.controls.delete(control);
    (control as FakeOverlay).map = null;
  }
  hasControl(control: unknown) {
    return this.controls.has(control);
  }
}

function createFakeRoot() {
  const events: string[] = [];
  const overlays: FakeOverlay[] = [];
  const createExternalOverlay = vi.fn((props: FakeOverlayProps) => {
    const overlay: FakeOverlay = {
      index: overlays.length,
      props,
      map: null,
      // Like MapboxOverlay and MapLibreOverlay, finalizing removes the overlay from its map.
      finalize: vi.fn(() => {
        events.push(`finalize:${overlay.index}`);
        overlay.map?.removeControl(overlay);
      }),
      setProps: vi.fn()
    };
    overlays.push(overlay);
    events.push(`create:${overlay.index}`);
    return overlay;
  });
  const CustomDeckGL = createDeckGL<FakeOverlayProps, FakeOverlay, FakeMap>({
    attach: attachControl,
    createExternalOverlay,
    recreateOverlayOnChange: ['interleaved']
  });
  return {CustomDeckGL, events, overlays};
}

// A real layer: `<deckLayer>` rejects anything that is not a deck.gl Layer.
const LAYER = new ScatterplotLayer({id: 'points', data: []});

async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

describe('the map prop', () => {
  it('attaches the overlay to the map, and detaches it on unmount', async () => {
    const {CustomDeckGL, events, overlays} = createFakeRoot();
    const map = new FakeMap('a', events);
    const {unmount} = render(
      <CustomDeckGL map={map}>
        <deckLayer layer={LAYER} />
      </CustomDeckGL>
    );
    await flush();

    expect(map.hasControl(overlays[0])).toBe(true);
    expect(overlays[0].setProps).toHaveBeenCalledWith(expect.objectContaining({layers: [LAYER]}));

    unmount();
    expect(map.controls.size).toBe(0);
    // The root detaches the overlay before finalizing it.
    expect(events).toEqual(['create:0', 'add:a:0', 'remove:a:0', 'finalize:0']);
  });

  it('never passes map to the overlay', async () => {
    const {CustomDeckGL, overlays} = createFakeRoot();
    const map = new FakeMap('a', []);
    const {rerender, unmount} = render(<CustomDeckGL map={map} pickingRadius={1} />);
    await flush();
    rerender(<CustomDeckGL map={map} pickingRadius={2} />);
    await flush();

    expect(overlays[0].props).not.toHaveProperty('map');
    for (const [props] of vi.mocked(overlays[0].setProps).mock.calls) {
      expect(props).not.toHaveProperty('map');
    }
    unmount();
  });

  it('attaches when map is set later, moves to a new map, and detaches when it becomes null', async () => {
    const {CustomDeckGL, events, overlays} = createFakeRoot();
    const a = new FakeMap('a', events);
    const b = new FakeMap('b', events);
    const {rerender, unmount} = render(<CustomDeckGL map={null} />);
    await flush();
    expect(events).toEqual(['create:0']);

    rerender(<CustomDeckGL map={a} />);
    await flush();
    rerender(<CustomDeckGL map={b} />);
    await flush();
    rerender(<CustomDeckGL map={null} />);
    await flush();

    expect(a.controls.size + b.controls.size).toBe(0);
    expect(events).toEqual(['create:0', 'add:a:0', 'remove:a:0', 'add:b:0', 'remove:b:0']);
    // The same overlay moved between maps; changing map never recreates it.
    expect(overlays).toHaveLength(1);
    unmount();
  });

  it('attaches the new overlay when interleaved recreates it', async () => {
    const {CustomDeckGL, events, overlays} = createFakeRoot();
    const map = new FakeMap('a', events);
    const {rerender, unmount} = render(<CustomDeckGL map={map} interleaved={false} />);
    await flush();
    rerender(<CustomDeckGL map={map} interleaved />);
    await flush();

    expect(overlays).toHaveLength(2);
    expect([...map.controls]).toEqual([overlays[1]]);
    expect(events).toEqual([
      'create:0',
      'add:a:0',
      'remove:a:0',
      'finalize:0',
      'create:1',
      'add:a:1'
    ]);
    unmount();
    expect(map.controls.size).toBe(0);
  });

  it('leaves exactly one attached overlay after a Strict Mode replay', async () => {
    const {CustomDeckGL, events, overlays} = createFakeRoot();
    const map = new FakeMap('a', events);
    const {unmount} = render(
      <StrictMode>
        <CustomDeckGL map={map} />
      </StrictMode>
    );
    await flush();

    const live = overlays.at(-1);
    expect([...map.controls]).toEqual([live]);
    // Every overlay that was added and later finalized was removed again.
    const added = events.filter(event => event.startsWith('add:')).length;
    const removed = events.filter(event => event.startsWith('remove:')).length;
    expect(added - removed).toBe(1);
    unmount();
    expect(map.controls.size).toBe(0);
  });

  it('keeps working without map, as before', async () => {
    const {CustomDeckGL, overlays} = createFakeRoot();
    const onDeckChange = vi.fn();
    const {unmount} = render(<CustomDeckGL onDeckChange={onDeckChange} />);
    await flush();
    expect(onDeckChange).toHaveBeenCalledWith(overlays[0]);
    expect(overlays[0].map).toBeNull();
    unmount();
  });
});

describe('a custom root without attach', () => {
  // An overlay that takes its host map as a prop of its own, as some community overlays do.
  type OwnMapProps = {map?: string | null; pickingRadius?: number};
  type OwnMapOverlay = {
    props: OwnMapProps;
    finalize: () => void;
    setProps: (props: OwnMapProps) => void;
  };

  it('passes its own map prop to the overlay', async () => {
    const overlays: OwnMapOverlay[] = [];
    const CustomDeckGL = createDeckGL<OwnMapProps, OwnMapOverlay>({
      createExternalOverlay: props => {
        const overlay = {props, finalize: vi.fn(), setProps: vi.fn()};
        overlays.push(overlay);
        return overlay;
      }
    });
    const {rerender, unmount} = render(<CustomDeckGL map="a" pickingRadius={1} />);
    await flush();
    expect(overlays).toHaveLength(1);
    expect(overlays[0].props).toEqual(expect.objectContaining({map: 'a'}));

    rerender(<CustomDeckGL map="b" pickingRadius={1} />);
    await flush();
    expect(overlays[0].setProps).toHaveBeenLastCalledWith(expect.objectContaining({map: 'b'}));
    unmount();
  });
});

describe('a recreated overlay', () => {
  it('is attached to the same map when a new canvas recreates the root', async () => {
    const events: string[] = [];
    let count = 0;
    const CustomDeckGL = createDeckGL<
      {canvas?: string},
      {index: number; finalize: () => void; setProps: () => void},
      string
    >({
      attach: (map, overlay) => {
        events.push(`attach:${map}:${overlay.index}`);
        return () => events.push(`detach:${map}:${overlay.index}`);
      },
      createExternalOverlay: () => {
        const overlay = {
          index: count++,
          finalize: () => events.push(`finalize:${overlay.index}`),
          setProps: () => undefined
        };
        return overlay;
      }
    });
    const {rerender, unmount} = render(<CustomDeckGL map="a" canvas="first" />);
    await flush();
    rerender(<CustomDeckGL map="a" canvas="second" />);
    await flush();
    unmount();

    expect(events).toEqual([
      'attach:a:0',
      'detach:a:0',
      'finalize:0',
      'attach:a:1',
      'detach:a:1',
      'finalize:1'
    ]);
  });
});

describe('a custom attach', () => {
  // An overlay whose detach needs it alive, as Google Maps' `setMap(null)` or Leaflet's `remove()`
  // do. It does not remove itself in `finalize`, so the order of the two calls is visible.
  function createRecordingRoot() {
    const events: string[] = [];
    let count = 0;
    const CustomDeckGL = createDeckGL<
      FakeOverlayProps,
      {index: number; finalized: boolean; finalize: () => void; setProps: () => void},
      string
    >({
      attach: (map, overlay) => {
        events.push(`attach:${map}:${overlay.index}`);
        return () => {
          events.push(`detach:${map}:${overlay.index}${overlay.finalized ? ':finalized' : ''}`);
        };
      },
      createExternalOverlay: () => {
        const overlay = {
          index: count++,
          finalized: false,
          finalize: () => {
            overlay.finalized = true;
            events.push(`finalize:${overlay.index}`);
          },
          setProps: () => undefined
        };
        return overlay;
      },
      recreateOverlayOnChange: ['interleaved']
    });
    return {CustomDeckGL, events};
  }

  it('detaches before finalizing, on unmount and when interleaved recreates the overlay', async () => {
    const {CustomDeckGL, events} = createRecordingRoot();
    const {rerender, unmount} = render(<CustomDeckGL map="a" interleaved={false} />);
    await flush();
    rerender(<CustomDeckGL map="a" interleaved />);
    await flush();
    unmount();

    expect(events).toEqual([
      'attach:a:0',
      'detach:a:0',
      'finalize:0',
      'attach:a:1',
      'detach:a:1',
      'finalize:1'
    ]);
  });

  it('detaches from the old map, without finalizing, when map changes', async () => {
    const {CustomDeckGL, events} = createRecordingRoot();
    const {rerender, unmount} = render(<CustomDeckGL map="a" />);
    await flush();
    rerender(<CustomDeckGL map="b" />);
    await flush();
    rerender(<CustomDeckGL map={null} />);
    await flush();
    unmount();

    expect(events).toEqual(['attach:a:0', 'detach:a:0', 'attach:b:0', 'detach:b:0', 'finalize:0']);
  });

  it('never detaches a finalized overlay in a Strict Mode replay', async () => {
    const {CustomDeckGL, events} = createRecordingRoot();
    const {unmount} = render(
      <StrictMode>
        <CustomDeckGL map="a" />
      </StrictMode>
    );
    await flush();
    unmount();

    expect(events.some(event => event.endsWith(':finalized'))).toBe(false);
    const attaches = events.filter(event => event.startsWith('attach:')).length;
    const detaches = events.filter(event => event.startsWith('detach:')).length;
    expect(attaches).toBe(detaches);
  });
});

describe('attachControl', () => {
  it('adds once, removes only what is attached, and unwraps getMap()', () => {
    const events: string[] = [];
    const map = new FakeMap('a', events);
    const overlay = {index: 0} as FakeOverlay;

    const detach = attachControl({getMap: () => map}, overlay);
    attachControl(map, overlay);
    expect(events).toEqual(['add:a:0']);

    map.removeControl(overlay);
    detach();
    expect(events).toEqual(['add:a:0', 'remove:a:0']);
  });
});

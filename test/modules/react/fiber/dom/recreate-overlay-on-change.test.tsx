// Uses the real reconciler: a recreated overlay must receive the JSX layers through a
// full commit into its new root, not only the `layers` prop.
import {ScatterplotLayer} from '@deck.gl/layers';
import {act, render} from '@testing-library/react';
import {StrictMode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {createDeckGL} from '../components';

type FakeOverlayProps = {enabled?: boolean; pickingRadius?: number};

function createFakeOverlayRoot() {
  const events: string[] = [];
  const overlays: {props: FakeOverlayProps; finalize: () => void; setProps: unknown}[] = [];
  const createExternalOverlay = vi.fn((props: FakeOverlayProps) => {
    const index = overlays.length;
    events.push(`create:${index}`);
    const overlay = {
      props,
      finalize: vi.fn(() => events.push(`finalize:${index}`)),
      setProps: vi.fn()
    };
    overlays.push(overlay);
    return overlay;
  });
  const onDeckChange = vi.fn((deckgl: unknown) => {
    events.push(deckgl ? `change:${overlays.indexOf(deckgl as never)}` : 'change:null');
  });
  const CustomDeckGL = createDeckGL({createExternalOverlay, recreateOverlayOnChange: ['enabled']});

  return {CustomDeckGL, createExternalOverlay, events, onDeckChange, overlays};
}

// A real layer: `<deckLayer>` rejects anything that is not a deck.gl Layer.
const LAYER = new ScatterplotLayer({id: 'points', data: []});

async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

describe('createDeckGL recreateOverlayOnChange', () => {
  it('replaces the overlay and commits the JSX layers to the new instance', async () => {
    const {CustomDeckGL, createExternalOverlay, events, onDeckChange, overlays} =
      createFakeOverlayRoot();
    const {rerender, unmount} = render(
      <CustomDeckGL enabled={false} onDeckChange={onDeckChange}>
        <deckLayer layer={LAYER} />
      </CustomDeckGL>
    );
    await flush();

    rerender(
      <CustomDeckGL enabled onDeckChange={onDeckChange}>
        <deckLayer layer={LAYER} />
      </CustomDeckGL>
    );
    await flush();

    expect(createExternalOverlay).toHaveBeenCalledTimes(2);
    expect(createExternalOverlay).toHaveBeenLastCalledWith({enabled: true});
    expect(events).toEqual([
      'create:0',
      'change:0',
      'change:null',
      'finalize:0',
      'create:1',
      'change:1'
    ]);
    expect(overlays[1].setProps).toHaveBeenCalledWith(expect.objectContaining({layers: [LAYER]}));

    unmount();
  });

  it('updates the existing overlay when an unlisted prop changes', async () => {
    const {CustomDeckGL, createExternalOverlay, overlays} = createFakeOverlayRoot();
    const {rerender, unmount} = render(
      <CustomDeckGL enabled pickingRadius={1}>
        <deckLayer layer={LAYER} />
      </CustomDeckGL>
    );
    await flush();

    rerender(
      <CustomDeckGL enabled pickingRadius={5}>
        <deckLayer layer={LAYER} />
      </CustomDeckGL>
    );
    await flush();

    expect(createExternalOverlay).toHaveBeenCalledOnce();
    expect(overlays[0].finalize).not.toHaveBeenCalled();
    expect(overlays[0].setProps).toHaveBeenCalledWith({
      enabled: true,
      layers: [LAYER],
      pickingRadius: 5,
      widgets: [],
      effects: []
    });

    unmount();
  });

  it('recreates once per change under StrictMode', async () => {
    const {CustomDeckGL, onDeckChange, overlays} = createFakeOverlayRoot();
    const {rerender, unmount} = render(
      <StrictMode>
        <CustomDeckGL enabled={false} onDeckChange={onDeckChange}>
          <deckLayer layer={LAYER} />
        </CustomDeckGL>
      </StrictMode>
    );
    await flush();
    const createdOnMount = overlays.length;

    rerender(
      <StrictMode>
        <CustomDeckGL enabled onDeckChange={onDeckChange}>
          <deckLayer layer={LAYER} />
        </CustomDeckGL>
      </StrictMode>
    );
    await flush();

    // StrictMode replays the new root's mount effects exactly as it did on first mount.
    expect(overlays).toHaveLength(createdOnMount * 2);
    expect(overlays.slice(createdOnMount).every(overlay => overlay.props.enabled)).toBe(true);
    expect(overlays.at(-1)?.props).toEqual({enabled: true});
    expect(onDeckChange).toHaveBeenLastCalledWith(overlays.at(-1));

    unmount();
  });
});

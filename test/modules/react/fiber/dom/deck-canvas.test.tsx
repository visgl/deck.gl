import {Component, StrictMode, type ReactNode} from 'react';
import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {MapView} from '@deck.gl/core';
import type {Deck, DeckProps, Widget} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DeckCanvas} from '../deck-canvas';

vi.mock('client-only', () => ({}));
afterEach(cleanup);

function createDeck() {
  const deck = {
    props: {
      parent: document.createElement('div'),
      _canvases: [],
      views: [],
      layers: [],
      widgets: [],
      layerFilter: null
    } as DeckProps,
    setProps: vi.fn(function (this: {props: DeckProps}, props: DeckProps) {
      Object.assign(this.props, props);
    }),
    finalize: vi.fn()
  };
  return deck as unknown as Deck;
}
const createLayer = (id: string) => new ScatterplotLayer({id, data: []});
const createView = (id: string) => new MapView({id});
function createCanvas(id: string) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  return canvas;
}

describe('DeckCanvas', () => {
  it('preserves a valid sibling update when a separate error boundary removes a failed panel', () => {
    class Boundary extends Component<{children: ReactNode}, {failed: boolean}> {
      state = {failed: false};
      static getDerivedStateFromError() {
        return {failed: true};
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    }
    const deck = createDeck();
    const original = createLayer('old');
    const updated = createLayer('updated');
    const a = createView('a');
    const b = createView('b');
    function Panels({fail}: {fail: boolean}) {
      return (
        <>
          <DeckCanvas deck={deck} id="a" views={a} layers={[fail ? updated : original]} />
          <Boundary>
            <DeckCanvas deck={deck} id="b" views={fail ? [] : b} />
          </Boundary>
        </>
      );
    }
    const panels = render(<Panels fail={false} />);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      panels.rerender(<Panels fail />);
      expect(deck.props.layers).toEqual([updated]);
      expect((deck.props._canvases as HTMLCanvasElement[]).map(canvas => canvas.id)).toEqual(['a']);
    } finally {
      errors.mockRestore();
    }
  });

  it('moves a layer from a later sibling to an earlier sibling in one commit', () => {
    const deck = createDeck();
    const firstView = createView('first-view');
    const secondView = createView('second-view');
    const layer = createLayer('moving');
    const original = deck.setProps;
    function Panels({moved}: {moved: boolean}) {
      return (
        <>
          <DeckCanvas deck={deck} id="first" views={firstView} layers={moved ? [layer] : []} />
          <DeckCanvas deck={deck} id="second" views={secondView} layers={moved ? [] : [layer]} />
        </>
      );
    }
    const panels = render(<Panels moved={false} />);
    vi.mocked(original).mockClear();
    panels.rerender(<Panels moved />);
    // No intermediate empty props reach Deck: retained layers and canvas/widget
    // resources must survive updates without teardown and reattachment.
    expect(original).toHaveBeenCalledTimes(1);
    expect(vi.mocked(original).mock.calls[0][0].layers).toEqual([layer]);
    expect(vi.mocked(original).mock.calls[0][0]._canvases).toHaveLength(2);
    expect(deck.props.layers).toEqual([layer]);
    const filter = deck.props.layerFilter!;
    expect(filter({layer, viewport: {id: 'first-view'}} as any)).toBe(true);
    expect(filter({layer, viewport: {id: 'second-view'}} as any)).toBe(false);
    panels.rerender(<Panels moved={false} />);
    expect(deck.props.layers).toEqual([layer]);
    expect(deck.props.layerFilter!({layer, viewport: {id: 'second-view'}} as any)).toBe(true);
    panels.unmount();
    expect(deck.props.layers).toEqual([]);
    expect(deck.setProps).toBe(original);
  });

  it('mounts two panels, updates local props and restores the latest baseline on unmount', () => {
    const deck = createDeck();
    const original = deck.setProps;
    const global = createLayer('global');
    deck.setProps({layers: [global]});
    const a = createView('a');
    const b = createView('b');
    const first = createLayer('first');
    const second = createLayer('second');
    const panelA = render(<DeckCanvas deck={deck} views={a} layers={[first]} id="canvas-a" />);
    const panelB = render(<DeckCanvas deck={deck} views={b} layers={[second]} id="canvas-b" />);
    expect(deck.props._canvases).toHaveLength(2);
    expect(a.props.canvasId).toBeUndefined();
    expect((deck.props.views as MapView[]).map(view => view.props.canvasId)).toEqual([
      'canvas-a',
      'canvas-b'
    ]);
    const replacement = createLayer('replacement');
    panelA.rerender(<DeckCanvas deck={deck} views={a} layers={[replacement]} id="canvas-a" />);
    expect(deck.props.layers).toEqual([global, replacement, second]);
    const updatedGlobal = createLayer('updated-global');
    deck.setProps({layers: [updatedGlobal]});
    expect(deck.props.layers).toEqual([updatedGlobal, replacement, second]);
    panelA.unmount();
    expect(deck.props.layers).toEqual([updatedGlobal, second]);
    panelB.unmount();
    expect(deck.props.layers).toEqual([updatedGlobal]);
    expect(deck.props._canvases).toEqual([]);
    expect(deck.setProps).toBe(original);
    expect(deck.finalize).not.toHaveBeenCalled();
  });

  it('attaches external canvases, survives StrictMode and never finalizes the Deck', () => {
    const deck = createDeck();
    const canvas = createCanvas('external');
    document.body.append(canvas);
    const panel = render(
      <StrictMode>
        <DeckCanvas deck={deck} canvas="external" views={createView('external-view')} />
      </StrictMode>
    );
    expect(panel.container.children).toHaveLength(0);
    expect(deck.props._canvases).toEqual([canvas]);
    panel.unmount();
    expect(deck.props._canvases).toEqual([]);
    expect(deck.finalize).not.toHaveBeenCalled();
    canvas.remove();
  });

  it('preserves baseline canvases, views and widgets while panels move between decks', () => {
    const first = createDeck();
    const second = createDeck();
    const baselineCanvas = createCanvas('baseline');
    const baselineView = createView('baseline-view');
    const baselineWidget = {id: 'baseline-widget', viewId: 'baseline-view'} as Widget;
    first.setProps({_canvases: [baselineCanvas], views: [baselineView], widgets: [baselineWidget]});
    const external = createCanvas('panel');
    const view = createView('panel-view');
    const widget = {id: 'panel-widget', viewId: 'panel-view'} as Widget;
    const panel = render(
      <DeckCanvas deck={first} canvas={external} views={view} widgets={[widget]} />
    );
    expect(first.props.widgets).toEqual([baselineWidget, widget]);
    expect(first.props._canvases).toEqual([baselineCanvas, external]);
    panel.rerender(<DeckCanvas deck={second} canvas={external} views={view} widgets={[widget]} />);
    expect(first.props._canvases).toEqual([baselineCanvas]);
    expect(first.props.views).toEqual([baselineView]);
    expect(first.props.widgets).toEqual([baselineWidget]);
    expect(second.props._canvases).toEqual([external]);
    panel.unmount();
    expect(second.props.widgets).toEqual([]);
  });

  it('allows React to rename an owned canvas without restoring the old DOM id', () => {
    const deck = createDeck();
    const view = createView('view');
    const panel = render(<DeckCanvas deck={deck} id="before" views={view} />);
    panel.rerender(<DeckCanvas deck={deck} id="after" views={view} />);
    expect(panel.container.querySelector('canvas')?.id).toBe('after');
    expect((deck.props.views as MapView[])[0].props.canvasId).toBe('after');
    expect(deck.props._canvases).toHaveLength(1);
  });
});

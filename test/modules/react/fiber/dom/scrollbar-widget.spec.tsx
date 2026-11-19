import {type Deck, OrthographicView, type OrthographicViewState} from '@deck.gl/core';
import {ScrollbarWidget} from '@deck.gl/widgets';
import {act, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';

import {DeckGL} from '../index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

const VIEW = new OrthographicView({id: 'ortho', controller: true});
const START: OrthographicViewState = {target: [0, 0, 0], zoom: 0};
// Taller than the 200px viewport at zoom 0, so the vertical scrollbar can move.
const CONTENT_BOUNDS: [[number, number], [number, number]] = [
  [-100, -500],
  [100, 500]
];

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '200px', position: 'relative', width: '300px'});
  document.body.append(container);
  return container;
}

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

function getTargetY(deck: Deck | null): number | null {
  const viewport = deck?.isInitialized ? deck.getViewports()[0] : undefined;
  return viewport ? (viewport as unknown as {target: number[]}).target[1]! : null;
}

/** Waits until deck.gl has told the widget about its viewport, which it needs to scroll. */
async function waitForViewport(widget: ScrollbarWidget): Promise<void> {
  await waitFor(() => Boolean((widget as unknown as {viewport?: unknown}).viewport));
}

/**
 * Scrolls the way the widget's track does, to `offset` pixels from the top of the content. The
 * start view, at target 0, shows the middle of the content.
 */
function scrollTo(widget: ScrollbarWidget, offset: number): void {
  (widget as unknown as {handleRangeChange: (value: [number, number]) => void}).handleRangeChange([
    offset,
    offset + 200
  ]);
}

webglTest(
  'a ScrollbarWidget scrolls an uncontrolled view, and re-renders keep the position',
  async () => {
    const container = createContainer();
    const reactRoot = createRoot(container);
    let deck: Deck | null = null;
    const scrollbar = new ScrollbarWidget({contentBounds: CONTENT_BOUNDS, id: 'scrollbar'});

    const render = (pickingRadius: number) =>
      act(async () =>
        reactRoot.render(
          <DeckGL
            views={VIEW}
            initialViewState={{...START}}
            pickingRadius={pickingRadius}
            onDeckChange={instance => {
              deck = instance as Deck | null;
            }}
          >
            <deckWidget widget={scrollbar} />
          </DeckGL>
        )
      );

    try {
      await render(0);
      await waitFor(() => getTargetY(deck) === 0);
      await waitFor(() =>
        Boolean(container.querySelector('.deck-widget-scrollbar, [role="scrollbar"]'))
      );

      await waitForViewport(scrollbar);
      await act(async () => scrollTo(scrollbar, 300));
      await waitFor(() => (getTargetY(deck) ?? 0) !== 0);
      const scrolled = getTargetY(deck);

      // A new render with an equal initialViewState object must not reset the camera.
      await render(1);
      await waitFor(() => deck?.props.pickingRadius === 1);
      expect(getTargetY(deck)).toBe(scrolled);
    } finally {
      act(() => reactRoot.unmount());
      container.remove();
    }
  }
);

webglTest('a ScrollbarWidget drives a controlled viewState through onViewStateChange', async () => {
  const container = createContainer();
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;
  const scrollbar = new ScrollbarWidget({contentBounds: CONTENT_BOUNDS, id: 'scrollbar'});
  const seen: number[] = [];

  function App() {
    const [viewState, setViewState] = useState<OrthographicViewState>(START);
    seen.push((viewState.target as number[])[1]!);
    return (
      <DeckGL
        views={VIEW}
        viewState={viewState}
        onViewStateChange={({viewState: next}) => setViewState(next as OrthographicViewState)}
        onDeckChange={instance => {
          deck = instance as Deck | null;
        }}
      >
        <deckWidget widget={scrollbar} />
      </DeckGL>
    );
  }

  try {
    await act(async () => reactRoot.render(<App />));
    await waitFor(() => getTargetY(deck) === 0);

    await waitForViewport(scrollbar);
    await act(async () => scrollTo(scrollbar, 300));
    await waitFor(() => (getTargetY(deck) ?? 0) !== 0);

    // The scroll reached React state, and deck.gl shows the state React holds.
    const rendered = seen[seen.length - 1]!;
    expect(rendered).not.toBe(0);
    expect(getTargetY(deck)).toBe(rendered);

    // Scrolling to the top of the content moves the view again, through React state.
    await act(async () => scrollTo(scrollbar, 0));
    await waitFor(() => getTargetY(deck) !== rendered);
    expect(getTargetY(deck)).toBe(seen[seen.length - 1]);
    // The widget hears about the new viewport on deck.gl's next redraw.
    await waitFor(() => (scrollbar as unknown as {scrollOffset: number}).scrollOffset === 0);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

webglTest(
  'a controlled viewState that ignores the scroll keeps the view where React put it',
  async () => {
    const container = createContainer();
    const reactRoot = createRoot(container);
    let deck: Deck | null = null;
    const scrollbar = new ScrollbarWidget({contentBounds: CONTENT_BOUNDS, id: 'scrollbar'});

    try {
      await act(async () =>
        reactRoot.render(
          <DeckGL
            views={VIEW}
            viewState={START}
            onDeckChange={instance => {
              deck = instance as Deck | null;
            }}
          >
            <deckWidget widget={scrollbar} />
          </DeckGL>
        )
      );
      await waitFor(() => getTargetY(deck) === 0);

      await waitForViewport(scrollbar);
      await act(async () => scrollTo(scrollbar, 300));
      for (let frame = 0; frame < 5; frame++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      expect(getTargetY(deck)).toBe(0);
    } finally {
      act(() => reactRoot.unmount());
      container.remove();
    }
  }
);

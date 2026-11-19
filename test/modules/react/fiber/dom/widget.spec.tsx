import {Widget, type WidgetPlacement, type WidgetProps} from '@deck.gl/core';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';

import {DeckGL} from '../index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

class LabelWidget extends Widget<WidgetProps & {label?: string}> {
  static defaultProps = {...Widget.defaultProps, id: 'label', label: ''};

  className = 'label-widget';
  placement: WidgetPlacement = 'top-left';

  onRenderHTML(rootElement: HTMLElement): void {
    rootElement.textContent = this.props.label ?? '';
  }
}

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 60 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

webglTest('<deckWidget> adds, updates and removes a widget on a real Deck', async () => {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  const reactRoot = createRoot(container);
  const getLabels = () => [...container.querySelectorAll('.label-widget')];

  function App({label, show}: {label: string; show: boolean}) {
    return (
      <DeckGL initialViewState={{latitude: 0, longitude: 0, zoom: 1}}>
        {show ? <deckWidget widget={new LabelWidget({id: 'label', label})} /> : null}
      </DeckGL>
    );
  }

  try {
    await act(async () => reactRoot.render(<App label="first" show />));
    await waitFor(() => getLabels().length === 1);
    expect(getLabels()[0]?.textContent).toBe('first');

    // A new instance with the same id updates the mounted widget instead of adding one.
    await act(async () => reactRoot.render(<App label="second" show />));
    await waitFor(() => getLabels()[0]?.textContent === 'second');
    expect(getLabels()).toHaveLength(1);

    await act(async () => reactRoot.render(<App label="second" show={false} />));
    await waitFor(() => getLabels().length === 0);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

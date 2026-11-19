import {
  AmbientLight,
  type Deck,
  type Effect,
  LightingEffect,
  PostProcessEffect
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import type {ShaderPass} from '@luma.gl/shaders';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';

import {DeckGL} from '../index';

const webglTest = navigator.userAgent.includes('jsdom') ? test.skip : test;

/** A post-processing pass that inverts colors, so its effect is easy to read back. */
const invert = {
  name: 'invert',
  fs: /* glsl */ `\
vec4 invert_filterColor_ext(vec4 color, vec2 texSize, vec2 texCoord) {
  return vec4(1.0 - color.rgb, color.a);
}
`,
  passes: [{filter: true}]
} as unknown as ShaderPass;

function createLayer(radius = 2e6) {
  return new ScatterplotLayer<[number, number]>({
    data: [[0, 0]],
    getFillColor: [255, 0, 0],
    getPosition: d => d,
    getRadius: radius,
    id: 'dot'
  });
}

async function waitFor(condition: () => boolean): Promise<void> {
  for (let frame = 0; frame < 120 && !condition(); frame++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(condition()).toBe(true);
}

function getEffects(deck: Deck | null): Effect[] {
  return (
    (deck as unknown as {effectManager?: {effects: Effect[]}} | null)?.effectManager?.effects ?? []
  );
}

webglTest('the effects prop applies, keeps and removes deck.gl effects', async () => {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;
  let center: number[] = [];
  let renders = 0;

  const render = (effects: Effect[], radius = 2e6) =>
    reactRoot.render(
      <DeckGL
        effects={effects}
        initialViewState={{latitude: 0, longitude: 0, zoom: 0}}
        onAfterRender={({gl}) => {
          // Read the center pixel before the frame is presented.
          const pixel = new Uint8Array(4);
          gl.readPixels(
            gl.drawingBufferWidth / 2,
            gl.drawingBufferHeight / 2,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixel
          );
          center = [...pixel];
          renders++;
        }}
        onDeckChange={instance => {
          deck = instance as Deck | null;
        }}
      >
        <deckLayer layer={createLayer(radius)} />
      </DeckGL>
    );

  // Checks identity: each mounted effect must be the original instance.
  const expectMounted = (expected: Effect[]) => {
    for (const effect of expected) {
      expect(getEffects(deck)).toContain(effect);
    }
  };

  const renderAndWait = async (effects: Effect[], radius?: number) => {
    const before = renders;
    await act(async () => render(effects, radius));
    await waitFor(() => renders > before);
  };

  try {
    await renderAndWait([]);
    await waitFor(() => center.join() === '255,0,0,255');

    const invertEffect = new PostProcessEffect(invert, {});
    const lighting = new LightingEffect({ambient: new AmbientLight({intensity: 1})});
    const effects = [invertEffect, lighting];
    await renderAndWait(effects);
    await waitFor(() => center.join() === '0,255,255,255');
    expectMounted(effects);

    // A commit that changes only layers leaves the effects in place.
    await renderAndWait(effects, 3e6);
    await waitFor(
      () => (deck?.props.layers as ScatterplotLayer[] | undefined)?.[0]?.props.getRadius === 3e6
    );
    expect(center.join()).toBe('0,255,255,255');
    expectMounted(effects);

    // deck.gl matches effects by id, so new instances update the mounted ones.
    const dimAmbient = new AmbientLight({intensity: 0.5});
    await renderAndWait([
      new PostProcessEffect(invert, {}),
      new LightingEffect({ambient: dimAmbient})
    ]);
    expect(center.join()).toBe('0,255,255,255');
    expectMounted(effects);
    // `ambientLight` is private; read it to check that the update reached the mounted effect.
    expect((lighting as unknown as {ambientLight?: AmbientLight}).ambientLight).toBe(dimAmbient);

    await renderAndWait([]);
    await waitFor(() => center.join() === '255,0,0,255');
    expect(getEffects(deck)).not.toContain(invertEffect);
    expect(getEffects(deck)).not.toContain(lighting);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

webglTest('<deckEffect> elements apply and remove effects alongside the effects prop', async () => {
  const container = document.createElement('div');
  Object.assign(container.style, {height: '300px', position: 'relative', width: '400px'});
  document.body.append(container);
  const reactRoot = createRoot(container);
  let deck: Deck | null = null;
  let center: number[] = [];
  let renders = 0;
  const lighting = new LightingEffect({ambient: new AmbientLight({intensity: 1})});

  const render = (invertInJsx: boolean) =>
    reactRoot.render(
      <DeckGL
        effects={[lighting]}
        initialViewState={{latitude: 0, longitude: 0, zoom: 0}}
        onAfterRender={({gl}) => {
          const pixel = new Uint8Array(4);
          gl.readPixels(
            gl.drawingBufferWidth / 2,
            gl.drawingBufferHeight / 2,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixel
          );
          center = [...pixel];
          renders++;
        }}
        onDeckChange={instance => {
          deck = instance as Deck | null;
        }}
      >
        <deckLayer layer={createLayer()} />
        {invertInJsx ? <deckEffect effect={new PostProcessEffect(invert, {})} /> : null}
      </DeckGL>
    );

  const renderAndWait = async (invertInJsx: boolean) => {
    const before = renders;
    await act(async () => render(invertInJsx));
    await waitFor(() => renders > before);
  };

  try {
    await renderAndWait(true);
    await waitFor(() => center.join() === '0,255,255,255');
    const [mounted] = getEffects(deck).filter(effect => effect.id === 'invert-pass');
    expect(mounted).toBeDefined();
    expect(getEffects(deck)).toContain(lighting);

    // A new <deckEffect> instance with the same id keeps the mounted effect.
    await renderAndWait(true);
    expect(center.join()).toBe('0,255,255,255');
    expect(getEffects(deck)).toContain(mounted);

    await renderAndWait(false);
    await waitFor(() => center.join() === '255,0,0,255');
    expect(getEffects(deck)).not.toContain(mounted);
    expect(getEffects(deck)).toContain(lighting);
  } finally {
    act(() => reactRoot.unmount());
    container.remove();
  }
});

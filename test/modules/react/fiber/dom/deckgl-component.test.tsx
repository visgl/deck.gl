import type {Deck} from '@deck.gl/core';
import {render, waitFor} from '@testing-library/react';
import {createRef, StrictMode} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const providerMocks = vi.hoisted(() => {
  const mapboxOverlay = vi.fn(function MapboxOverlay(props: unknown) {
    return {finalize: vi.fn(), props, setProps: vi.fn()};
  });
  const maplibreOverlay = vi.fn(function MapLibreOverlay(props: unknown) {
    return {finalize: vi.fn(), props, setProps: vi.fn()};
  });

  return {mapboxOverlay, maplibreOverlay};
});

vi.mock('@deck.gl/mapbox', () => ({MapboxOverlay: providerMocks.mapboxOverlay}));
vi.mock('@deck.gl/maplibre', () => ({MapLibreOverlay: providerMocks.maplibreOverlay}));

import {createDeckGL, DeckGL} from '../components';
import {DeckGL as MapboxDeckGL} from '../mapbox';
import {DeckGL as MapLibreDeckGL} from '../maplibre';

// Mock the reconciler module
vi.mock(import('../../reconciler'), () => {
  const mockRender = vi.fn<() => void>();
  const mockConfigure = vi.fn<() => void>();
  const mockDeckGL = {};
  const mockRoots = new Map();
  const mockCreateRoot = vi.fn(
    (node: unknown, options?: {createExternalOverlay?: (props: unknown) => unknown}) => {
      const existingRoot = mockRoots.get(node);
      if (existingRoot) {
        return existingRoot;
      }
      let deckgl = mockRoots.size === 0 ? mockDeckGL : {};
      let configured = false;
      const root = {
        configure: (props: unknown) => {
          mockConfigure(props);
          if (!configured && options?.createExternalOverlay) {
            deckgl = options.createExternalOverlay(props);
            configured = true;
          }
        },
        render: mockRender,
        store: {
          getState: vi.fn(() => ({deckgl})),

          setState: vi.fn<() => void>(),
          subscribe: vi.fn<() => void>()
        }
      };
      mockRoots.set(node, root);
      return root;
    }
  );
  const mockUnmountAtNode = vi.fn((node: unknown) => {
    mockRoots.delete(node);
  });

  return {
    createRoot: mockCreateRoot,
    mockConfigure,
    mockCreateRoot,
    mockDeckGL,
    mockRender,
    mockRoots,
    mockUnmountAtNode,
    roots: mockRoots,
    unmountAtNode: mockUnmountAtNode
  };
});

// Get the mocks after they've been set up
const {mockRender, mockConfigure, mockCreateRoot, mockDeckGL, mockUnmountAtNode, mockRoots} =
  (await import('../../reconciler')) as unknown as {
    mockRender: ReturnType<typeof vi.fn>;
    mockConfigure: ReturnType<typeof vi.fn>;
    mockCreateRoot: ReturnType<typeof vi.fn>;
    mockDeckGL: object;
    mockUnmountAtNode: ReturnType<typeof vi.fn>;
    mockRoots: Map<unknown, unknown>;
  };

describe('DeckGL Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoots.clear();
  });

  describe('Basic rendering', () => {
    it('should create reconciler root on mount', () => {
      render(
        <DeckGL>
          <div>Test content</div>
        </DeckGL>
      );

      expect(mockCreateRoot).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
    });

    it('should render canvas in standalone mode', () => {
      render(
        <DeckGL>
          <div>Content</div>
        </DeckGL>
      );

      const canvas = document.querySelector('#deckgl-overlay');
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas?.tagName).toBe('CANVAS');
    });

    it('forwards an interleaved prop on the plain root unchanged', () => {
      render(
        <DeckGL {...({interleaved: true} as never)}>
          <div>Content</div>
        </DeckGL>
      );

      expect(mockCreateRoot).toHaveBeenCalledExactlyOnceWith(expect.any(HTMLCanvasElement));
      expect(mockConfigure).toHaveBeenCalledWith(expect.objectContaining({interleaved: true}));
    });

    it.each([
      {DeckGL: MapboxDeckGL, createOverlay: providerMocks.mapboxOverlay, name: 'Mapbox'},
      {DeckGL: MapLibreDeckGL, createOverlay: providerMocks.maplibreOverlay, name: 'MapLibre'}
    ])('recreates the $name overlay when interleaved changes', ({
      DeckGL: ProviderDeckGL,
      createOverlay
    }) => {
      const onDeckChange = vi.fn();
      const child = <div>Content</div>;
      const {rerender} = render(
        <ProviderDeckGL interleaved={false} onDeckChange={onDeckChange}>
          {child}
        </ProviderDeckGL>
      );
      const firstRoot = mockCreateRoot.mock.calls[0][0] as HTMLDivElement;
      const firstOverlay = createOverlay.mock.results[0]?.value;

      rerender(
        <ProviderDeckGL interleaved onDeckChange={onDeckChange}>
          {child}
        </ProviderDeckGL>
      );
      const secondOverlay = createOverlay.mock.results[1]?.value;

      expect(createOverlay).toHaveBeenCalledTimes(2);
      expect(createOverlay).toHaveBeenLastCalledWith({interleaved: true});
      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(firstRoot);
      expect(onDeckChange.mock.calls).toEqual([[firstOverlay], [null], [secondOverlay]]);
    });

    it.each([
      {DeckGL: MapboxDeckGL, createOverlay: providerMocks.mapboxOverlay, name: 'Mapbox'},
      {DeckGL: MapLibreDeckGL, createOverlay: providerMocks.maplibreOverlay, name: 'MapLibre'}
    ])('creates one detached $name overlay root', ({DeckGL: ProviderDeckGL, createOverlay}) => {
      const onDeckChange = vi.fn();
      const {container, unmount} = render(
        <ProviderDeckGL interleaved onDeckChange={onDeckChange}>
          <div>Content</div>
        </ProviderDeckGL>
      );

      const rootElement = mockCreateRoot.mock.calls[0][0] as HTMLDivElement;
      const overlay = createOverlay.mock.results[0]?.value;

      expect(createOverlay).toHaveBeenCalledExactlyOnceWith({interleaved: true});
      expect(container.childElementCount).toBe(0);
      expect(rootElement).toBeInstanceOf(HTMLDivElement);
      expect(rootElement.isConnected).toBe(false);
      expect(onDeckChange).toHaveBeenCalledExactlyOnceWith(overlay);
      expect(mockConfigure).toHaveBeenCalledWith(
        expect.not.objectContaining({canvas: expect.anything(), parent: expect.anything()})
      );

      unmount();

      expect(mockUnmountAtNode).toHaveBeenCalledWith(rootElement);
      expect(onDeckChange).toHaveBeenLastCalledWith(null);
    });

    it('uses a detached registry key for a bound external overlay', () => {
      const overlay = {finalize: () => undefined, setProps: (_props: never) => undefined};
      const createExternalOverlay = vi.fn(() => overlay);
      const CustomDeckGL = createDeckGL({createExternalOverlay});
      const {container} = render(
        <CustomDeckGL interleaved>
          <div>Content</div>
        </CustomDeckGL>
      );

      expect(container.childElementCount).toBe(0);
      expect(mockCreateRoot).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({createExternalOverlay: expect.any(Function)})
      );
      expect(mockConfigure).toHaveBeenCalledWith(expect.objectContaining({interleaved: true}));
      expect(mockConfigure).toHaveBeenCalledWith(
        expect.not.objectContaining({canvas: expect.anything(), parent: expect.anything()})
      );
    });

    it.each([
      {name: 'Mapbox', Root: MapboxDeckGL, forwardViews: true},
      {name: 'MapLibre', Root: MapLibreDeckGL, forwardViews: true},
      {
        name: 'custom',
        Root: createDeckGL({createExternalOverlay: () => ({finalize() {}, setProps() {}})}),
        forwardViews: false
      }
    ])('$name overlay roots set forwardViews to $forwardViews', ({Root, forwardViews}) => {
      render(<Root />);

      expect(mockCreateRoot).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({forwardViews})
      );
    });

    it('recreates the overlay in a new detached root when a recreateOverlayOnChange prop changes', () => {
      const createExternalOverlay = vi.fn(
        (_props: {enabled?: boolean; pickingRadius?: number}) => ({
          finalize: vi.fn(),
          setProps: vi.fn()
        })
      );
      const CustomDeckGL = createDeckGL({
        createExternalOverlay,
        recreateOverlayOnChange: ['enabled']
      });
      const onDeckChange = vi.fn();
      const child = <div>Content</div>;
      const {rerender} = render(
        <CustomDeckGL enabled={false} onDeckChange={onDeckChange}>
          {child}
        </CustomDeckGL>
      );
      const firstRoot = mockCreateRoot.mock.calls[0][0] as HTMLDivElement;
      const firstOverlay = createExternalOverlay.mock.results[0].value;

      rerender(
        <CustomDeckGL enabled={false} pickingRadius={5} onDeckChange={onDeckChange}>
          {child}
        </CustomDeckGL>
      );
      expect(createExternalOverlay).toHaveBeenCalledOnce();
      expect(mockUnmountAtNode).not.toHaveBeenCalled();

      rerender(
        <CustomDeckGL enabled pickingRadius={5} onDeckChange={onDeckChange}>
          {child}
        </CustomDeckGL>
      );
      const secondRoot = mockCreateRoot.mock.calls.at(-1)?.[0] as HTMLDivElement;
      const secondOverlay = createExternalOverlay.mock.results[1].value;

      expect(secondRoot).toBeInstanceOf(HTMLDivElement);
      expect(secondRoot).not.toBe(firstRoot);
      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(firstRoot);
      expect(createExternalOverlay).toHaveBeenLastCalledWith({enabled: true, pickingRadius: 5});
      expect(onDeckChange.mock.calls).toEqual([
        [firstOverlay],
        [firstOverlay],
        [null],
        [secondOverlay]
      ]);
      expect(onDeckChange.mock.invocationCallOrder[2]).toBeLessThan(
        mockUnmountAtNode.mock.invocationCallOrder[0]
      );
      expect(mockUnmountAtNode.mock.invocationCallOrder[0]).toBeLessThan(
        createExternalOverlay.mock.invocationCallOrder[1]
      );
      expect(mockRender).toHaveBeenCalledTimes(3);
    });

    it('keeps the overlay when no recreateOverlayOnChange props are declared', () => {
      const createExternalOverlay = vi.fn((_props: {enabled?: boolean}) => ({
        finalize: vi.fn(),
        setProps: vi.fn()
      }));
      const CustomDeckGL = createDeckGL({createExternalOverlay});
      const child = <div>Content</div>;
      const {rerender} = render(<CustomDeckGL enabled={false}>{child}</CustomDeckGL>);

      rerender(<CustomDeckGL enabled>{child}</CustomDeckGL>);

      expect(createExternalOverlay).toHaveBeenCalledOnce();
      expect(mockUnmountAtNode).not.toHaveBeenCalled();
      expect(mockConfigure).toHaveBeenLastCalledWith({enabled: true});
    });

    it('keeps one detached registry key across StrictMode effect replay', () => {
      render(
        <StrictMode>
          <MapLibreDeckGL interleaved>
            <div>Content</div>
          </MapLibreDeckGL>
        </StrictMode>
      );

      // StrictMode replays effects, so the root is created more than once.
      expect(mockCreateRoot.mock.calls.length).toBeGreaterThan(1);
      expect(mockUnmountAtNode).toHaveBeenCalled();

      const [rootElement, rootOptions] = mockCreateRoot.mock.calls[0] as [
        HTMLDivElement,
        {createExternalOverlay: unknown}
      ];
      expect(rootElement).toBeInstanceOf(HTMLDivElement);
      expect(rootElement.isConnected).toBe(false);
      for (const [node, options] of mockCreateRoot.mock.calls) {
        expect(node).toBe(rootElement);
        expect(options.createExternalOverlay).toBe(rootOptions.createExternalOverlay);
      }
      for (const [node] of mockUnmountAtNode.mock.calls) {
        expect(node).toBe(rootElement);
      }
    });
  });

  describe('Root DOM', () => {
    it('positions and sizes the wrapper like @deck.gl/react by default', () => {
      const {container} = render(<DeckGL />);
      const wrapper = container.querySelector<HTMLDivElement>('#deckgl-wrapper');

      expect(wrapper?.style).toMatchObject({
        height: '100%',
        left: '0px',
        position: 'absolute',
        top: '0px',
        width: '100%',
        zIndex: '0'
      });
      expect(wrapper?.firstElementChild?.id).toBe('deckgl-overlay');
    });

    it('derives distinct element ids from each root id', () => {
      const {container} = render(
        <>
          <DeckGL id="first" />
          <DeckGL id="second" />
        </>
      );

      expect(container.querySelector('#first-wrapper > canvas#first')).not.toBeNull();
      expect(container.querySelector('#second-wrapper > canvas#second')).not.toBeNull();
    });

    it('applies size and style to the wrapper and lets the owned canvas fill it', () => {
      const style = {mixBlendMode: 'multiply', opacity: '0.5'} as Partial<CSSStyleDeclaration>;
      const {container} = render(<DeckGL height={300} style={style} width="50%" />);
      const wrapper = container.querySelector<HTMLDivElement>('#deckgl-wrapper');
      const canvas = container.querySelector<HTMLCanvasElement>('#deckgl-overlay');

      expect(wrapper?.style).toMatchObject({height: '300px', opacity: '0.5', width: '50%'});
      expect(wrapper?.style.mixBlendMode).toBe('');
      expect(canvas?.style.mixBlendMode).toBe('multiply');
      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({height: '100%', style: null, width: '100%'})
      );
    });

    it('forwards size and style unchanged for a caller-supplied canvas', () => {
      const canvas = document.createElement('canvas');
      document.body.append(canvas);
      const style = {opacity: '0.5'} as Partial<CSSStyleDeclaration>;

      render(<DeckGL canvas={canvas} height={300} style={style} width="50%" />);

      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({canvas, height: 300, style, width: '50%'})
      );
      canvas.remove();
    });
  });

  describe('Props handling', () => {
    it('should pass props to root.configure', () => {
      const props = {
        initialViewState: {
          latitude: 0,
          longitude: 0,
          zoom: 1
        }
      };

      render(
        <DeckGL {...props}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledWith(
        expect.objectContaining({
          initialViewState: props.initialViewState
        })
      );
    });

    it('should handle prop updates without debug', () => {
      const {rerender} = render(
        <DeckGL initialViewState={{latitude: 0, longitude: 0, zoom: 1}}>
          <div>Test</div>
        </DeckGL>
      );

      rerender(
        <DeckGL initialViewState={{latitude: 10, longitude: 10, zoom: 2}}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledWith(
        expect.objectContaining({
          initialViewState: {latitude: 10, longitude: 10, zoom: 2}
        })
      );
    });
  });

  describe('onDeckChange', () => {
    it('should receive the configured root instance without forwarding the callback to deck.gl', () => {
      const onDeckChange = vi.fn();

      render(
        <DeckGL onDeckChange={onDeckChange}>
          <div>Test</div>
        </DeckGL>
      );

      expect(onDeckChange).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(mockConfigure).toHaveBeenCalledWith(
        expect.not.objectContaining({onDeckChange: expect.anything()})
      );
    });

    it('should notify config updates with the root-specific instance', () => {
      const onDeckChange = vi.fn();
      const {rerender} = render(
        <DeckGL onDeckChange={onDeckChange} pickingRadius={5}>
          <div>Initial</div>
        </DeckGL>
      );

      rerender(
        <DeckGL onDeckChange={onDeckChange} pickingRadius={5}>
          <div>Updated</div>
        </DeckGL>
      );
      expect(onDeckChange).toHaveBeenCalledOnce();

      rerender(
        <DeckGL onDeckChange={onDeckChange} pickingRadius={10}>
          <div>Updated</div>
        </DeckGL>
      );
      expect(onDeckChange).toHaveBeenCalledTimes(2);
      expect(onDeckChange).toHaveBeenLastCalledWith(mockDeckGL);
    });

    it('keeps lifecycle notifications and cleanup scoped to each sibling root', () => {
      const firstOnDeckChange = vi.fn();
      const secondOnDeckChange = vi.fn();
      const {rerender} = render(
        <>
          <DeckGL key="first" onDeckChange={firstOnDeckChange}>
            <div>First</div>
          </DeckGL>
          <DeckGL key="second" onDeckChange={secondOnDeckChange}>
            <div>Second</div>
          </DeckGL>
        </>
      );

      const firstDeckGL = firstOnDeckChange.mock.calls[0][0];
      const secondDeckGL = secondOnDeckChange.mock.calls[0][0];
      const firstCanvas = mockCreateRoot.mock.calls[0][0];
      const secondCanvas = mockCreateRoot.mock.calls[1][0];

      expect(mockCreateRoot).toHaveBeenCalledTimes(2);
      expect(firstDeckGL).not.toBe(secondDeckGL);
      expect(mockRoots.get(firstCanvas)?.store.getState().deckgl).toBe(firstDeckGL);
      expect(mockRoots.get(secondCanvas)?.store.getState().deckgl).toBe(secondDeckGL);

      rerender(
        <DeckGL key="second" onDeckChange={secondOnDeckChange}>
          <div>Second</div>
        </DeckGL>
      );

      expect(firstOnDeckChange).toHaveBeenLastCalledWith(null);
      expect(secondOnDeckChange).not.toHaveBeenCalledWith(null);
      expect(mockUnmountAtNode).toHaveBeenCalledTimes(1);
      expect(mockUnmountAtNode.mock.calls[0][0]).toBe(firstCanvas);
      expect(mockUnmountAtNode.mock.calls[0][0]).not.toBe(secondCanvas);
    });

    it('does not reconfigure, rerender, or unmount when only the callback changes', () => {
      const child = <div>Test</div>;
      const firstCallback = vi.fn();
      const replacementCallback = vi.fn();
      const {rerender} = render(<DeckGL onDeckChange={firstCallback}>{child}</DeckGL>);

      rerender(<DeckGL onDeckChange={replacementCallback}>{child}</DeckGL>);

      expect(mockConfigure).toHaveBeenCalledOnce();
      expect(mockRender).toHaveBeenCalledOnce();
      expect(mockUnmountAtNode).not.toHaveBeenCalled();
      expect(firstCallback).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(replacementCallback).not.toHaveBeenCalled();
    });

    it('uses the replacement callback for cleanup before unmounting', () => {
      const child = <div>Test</div>;
      const firstCallback = vi.fn();
      const replacementCallback = vi.fn();
      const {rerender, unmount} = render(<DeckGL onDeckChange={firstCallback}>{child}</DeckGL>);

      rerender(<DeckGL onDeckChange={replacementCallback}>{child}</DeckGL>);
      unmount();

      expect(firstCallback).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(replacementCallback).toHaveBeenCalledExactlyOnceWith(null);
      expect(replacementCallback.mock.invocationCallOrder[0]).toBeLessThan(
        mockUnmountAtNode.mock.invocationCallOrder[0]
      );
    });
  });

  describe('ref', () => {
    it('sets an object ref to the instance without forwarding it to deck.gl', () => {
      const ref = createRef<Deck>();
      const {unmount} = render(<DeckGL ref={ref} />);

      expect(ref.current).toBe(mockDeckGL);
      expect(mockConfigure).toHaveBeenCalledWith(
        expect.not.objectContaining({ref: expect.anything()})
      );

      unmount();

      expect(ref.current).toBeNull();
    });

    it('calls a callback ref once per instance, before onDeckChange, and with null on teardown', () => {
      const ref = vi.fn();
      const onDeckChange = vi.fn();
      const {rerender, unmount} = render(
        <DeckGL onDeckChange={onDeckChange} ref={ref} pickingRadius={1} />
      );

      rerender(<DeckGL onDeckChange={onDeckChange} ref={ref} pickingRadius={5} />);

      expect(mockConfigure).toHaveBeenCalledTimes(2);
      expect(ref).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(ref.mock.invocationCallOrder[0]).toBeLessThan(
        onDeckChange.mock.invocationCallOrder[0]
      );

      unmount();

      expect(ref).toHaveBeenLastCalledWith(null);
      expect(ref).toHaveBeenCalledTimes(2);
    });

    it('runs a callback ref cleanup instead of calling it with null', () => {
      const cleanup = vi.fn();
      const ref = vi.fn(() => cleanup);
      const {unmount} = render(<DeckGL ref={ref} />);

      unmount();

      expect(ref).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(cleanup).toHaveBeenCalledOnce();
    });

    it('moves the instance to a replacement ref without reconfiguring the root', () => {
      const child = <div>Test</div>;
      const firstRef = vi.fn();
      const secondRef = createRef<Deck>();
      const {rerender} = render(<DeckGL ref={firstRef}>{child}</DeckGL>);

      rerender(<DeckGL ref={secondRef}>{child}</DeckGL>);

      expect(firstRef.mock.calls).toEqual([[mockDeckGL], [null]]);
      expect(secondRef.current).toBe(mockDeckGL);
      expect(mockConfigure).toHaveBeenCalledOnce();
      expect(mockUnmountAtNode).not.toHaveBeenCalled();
    });

    it.each([
      {DeckGL: MapboxDeckGL, createOverlay: providerMocks.mapboxOverlay, name: 'Mapbox'},
      {DeckGL: MapLibreDeckGL, createOverlay: providerMocks.maplibreOverlay, name: 'MapLibre'}
    ])('follows the $name overlay when it is recreated', ({
      DeckGL: ProviderDeckGL,
      createOverlay
    }) => {
      const ref = vi.fn();
      const {rerender, unmount} = render(<ProviderDeckGL interleaved={false} ref={ref} />);
      const firstOverlay = createOverlay.mock.results[0]?.value;

      rerender(<ProviderDeckGL interleaved ref={ref} />);
      const secondOverlay = createOverlay.mock.results[1]?.value;
      unmount();

      expect(ref.mock.calls).toEqual([[firstOverlay], [null], [secondOverlay], [null]]);
    });
  });

  describe('Canvas ref timing', () => {
    it('should pass canvas ref to root.configure after ref is set', async () => {
      render(
        <DeckGL>
          <div>Test</div>
        </DeckGL>
      );

      await waitFor(() => {
        expect(mockConfigure).toHaveBeenCalledWith(
          expect.objectContaining({
            canvas: expect.any(HTMLCanvasElement)
          })
        );
      });

      const configCall = mockConfigure.mock.calls[0][0] as {canvas: HTMLCanvasElement};
      expect(configCall.canvas.id).toBe('deckgl-overlay');
    });

    it('should pass parent ref to root.configure after ref is set', async () => {
      render(
        <DeckGL>
          <div>Test</div>
        </DeckGL>
      );

      await waitFor(() => {
        expect(mockConfigure).toHaveBeenCalledWith(
          expect.objectContaining({
            parent: expect.any(HTMLDivElement)
          })
        );
      });

      const configCall = mockConfigure.mock.calls[0][0] as {parent: HTMLDivElement};
      expect(configCall.parent.id).toBe('deckgl-wrapper');
    });

    it('should not override explicit canvas prop with ref canvas', () => {
      const explicitCanvas = document.createElement('canvas');
      explicitCanvas.id = 'custom-canvas';
      document.body.append(explicitCanvas);

      render(
        <DeckGL canvas={explicitCanvas}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledWith(
        expect.objectContaining({
          canvas: explicitCanvas
        })
      );

      const configCall = mockConfigure.mock.calls[0][0] as {canvas: HTMLCanvasElement};
      expect(configCall.canvas).toBe(explicitCanvas);
      expect(configCall.canvas.id).toBe('custom-canvas');

      explicitCanvas.remove();
    });

    it('should not override explicit parent prop with ref parent', () => {
      const explicitParent = document.createElement('div');
      explicitParent.id = 'custom-parent';
      document.body.append(explicitParent);

      render(
        <DeckGL parent={explicitParent}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: explicitParent
        })
      );

      const configCall = mockConfigure.mock.calls[0][0] as {parent: HTMLDivElement};
      expect(configCall.parent).toBe(explicitParent);
      expect(configCall.parent.id).toBe('custom-parent');

      explicitParent.remove();
    });
  });

  describe('Root element handling', () => {
    it('should use canvas ref for root creation in standalone mode', () => {
      render(
        <DeckGL>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockCreateRoot).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
      const rootCall = mockCreateRoot.mock.calls[0][0] as HTMLCanvasElement;
      expect(rootCall.id).toBe('deckgl-overlay');
    });
  });

  describe('Deck debug prop', () => {
    it('passes debug through to the deck.gl configuration', () => {
      const {rerender} = render(
        <DeckGL debug>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenLastCalledWith(expect.objectContaining({debug: true}));

      rerender(
        <DeckGL debug={false}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenLastCalledWith(expect.objectContaining({debug: false}));
    });
  });

  describe('Children updates', () => {
    it('should handle children updates', () => {
      const {rerender} = render(
        <DeckGL>
          <div>Initial</div>
        </DeckGL>
      );

      rerender(
        <DeckGL>
          <div>Updated</div>
        </DeckGL>
      );

      expect(mockRender).toHaveBeenCalledTimes(2);
    });

    it('renders new children without configuring deck.gl again', () => {
      const {rerender} = render(
        <DeckGL pickingRadius={5}>
          <div>Initial</div>
        </DeckGL>
      );

      rerender(
        <DeckGL pickingRadius={5}>
          <div>Updated</div>
        </DeckGL>
      );
      rerender(
        <DeckGL pickingRadius={5}>
          <div>Updated again</div>
        </DeckGL>
      );

      expect(mockRender).toHaveBeenCalledTimes(3);
      expect(mockConfigure).toHaveBeenCalledOnce();
    });

    it('configures deck.gl again when a prop changes with the children', () => {
      const {rerender} = render(
        <DeckGL pickingRadius={5}>
          <div>Initial</div>
        </DeckGL>
      );

      rerender(
        <DeckGL pickingRadius={10}>
          <div>Updated</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledTimes(2);
      expect(mockConfigure).toHaveBeenLastCalledWith(expect.objectContaining({pickingRadius: 10}));
      expect(mockRender).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cleanup behavior', () => {
    it('should call unmountAtNode with correct node in standalone mode', () => {
      const {unmount} = render(
        <DeckGL>
          <div>Test</div>
        </DeckGL>
      );

      unmount();

      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(expect.any(HTMLCanvasElement));
      const unmountCall = mockUnmountAtNode.mock.calls[0][0] as HTMLCanvasElement;
      expect(unmountCall.id).toBe('deckgl-overlay');
    });

    it('should notify cleanup before unmounting the root', () => {
      const onDeckChange = vi.fn();
      const {unmount} = render(
        <DeckGL onDeckChange={onDeckChange}>
          <div>Test</div>
        </DeckGL>
      );

      unmount();

      expect(onDeckChange).toHaveBeenLastCalledWith(null);
      expect(onDeckChange.mock.invocationCallOrder[1]).toBeLessThan(
        mockUnmountAtNode.mock.invocationCallOrder[0]
      );
    });

    it('reports null for the old canvas root before the replacement instance', () => {
      const firstCanvas = document.createElement('canvas');
      const secondCanvas = document.createElement('canvas');
      const onDeckChange = vi.fn();
      const child = <div>Test</div>;
      const {rerender} = render(
        <DeckGL canvas={firstCanvas} onDeckChange={onDeckChange}>
          {child}
        </DeckGL>
      );

      rerender(
        <DeckGL canvas={secondCanvas} onDeckChange={onDeckChange}>
          {child}
        </DeckGL>
      );

      expect(onDeckChange.mock.calls.map(([deckgl]) => deckgl === null)).toEqual([
        false,
        true,
        false
      ]);
    });

    it('unmounts the old root once and configures the replacement canvas', () => {
      const firstCanvas = document.createElement('canvas');
      const secondCanvas = document.createElement('canvas');
      const child = <div>Test</div>;
      const {rerender} = render(<DeckGL canvas={firstCanvas}>{child}</DeckGL>);

      rerender(<DeckGL canvas={secondCanvas}>{child}</DeckGL>);

      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(firstCanvas);
      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({canvas: secondCanvas})
      );
    });
  });

  describe('String canvas', () => {
    function mountCanvasHost(canvasId: string): {host: HTMLDivElement; element: HTMLCanvasElement} {
      const host = document.createElement('div');
      host.id = 'host';
      const element = document.createElement('canvas');
      element.id = canvasId;
      host.append(element);
      document.body.append(host);
      return {host, element};
    }

    beforeEach(() => {
      document.body.replaceChildren();
    });

    it('resolves the id to its canvas element for the root, canvas, and parent', () => {
      const {host, element} = mountCanvasHost('test-canvas');
      const onDeckChange = vi.fn();

      render(
        <DeckGL canvas="test-canvas" onDeckChange={onDeckChange}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockCreateRoot).toHaveBeenCalledExactlyOnceWith(element);
      expect(mockConfigure).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({canvas: element, parent: host})
      );
      expect(onDeckChange).toHaveBeenCalledExactlyOnceWith(mockDeckGL);
      expect(mockRender).toHaveBeenCalledOnce();
    });

    it('keeps an explicit parent prop', () => {
      mountCanvasHost('test-canvas');
      const explicitParent = document.createElement('div');

      render(
        <DeckGL canvas="test-canvas" parent={explicitParent}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledWith(expect.objectContaining({parent: explicitParent}));
    });

    it('resolves ids that are not valid CSS selectors', () => {
      const {element} = mountCanvasHost('1map');

      render(
        <DeckGL canvas="1map">
          <div>Test</div>
        </DeckGL>
      );

      expect(mockCreateRoot).toHaveBeenCalledExactlyOnceWith(element);
      expect(mockConfigure).toHaveBeenCalledWith(expect.objectContaining({canvas: element}));
    });

    it('unmounts the resolved element once', () => {
      const {element} = mountCanvasHost('test-canvas');
      const {unmount} = render(
        <DeckGL canvas="test-canvas">
          <div>Test</div>
        </DeckGL>
      );

      unmount();

      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(element);
    });

    it('unmounts the resolved element once when switching to another canvas', () => {
      const {element} = mountCanvasHost('test-canvas');
      const secondCanvas = document.createElement('canvas');
      const child = <div>Test</div>;
      const {rerender} = render(<DeckGL canvas="test-canvas">{child}</DeckGL>);

      rerender(<DeckGL canvas={secondCanvas}>{child}</DeckGL>);

      expect(mockUnmountAtNode).toHaveBeenCalledExactlyOnceWith(element);
      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({canvas: secondCanvas})
      );
    });

    it.each([
      ['a missing id', () => {}],
      [
        'a non-canvas element',
        () => {
          const div = document.createElement('div');
          div.id = 'test-canvas';
          document.body.append(div);
        }
      ]
    ])('throws for %s without creating a root', (_label, setup) => {
      setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() =>
        render(
          <DeckGL canvas="test-canvas">
            <div>Test</div>
          </DeckGL>
        )
      ).toThrow();
      consoleError.mockRestore();

      expect(mockCreateRoot).not.toHaveBeenCalled();
      expect(mockConfigure).not.toHaveBeenCalled();
    });
  });

  describe('Config memoization', () => {
    it('should not call configure when only children change', () => {
      const props = {initialViewState: {latitude: 0, longitude: 0, zoom: 1}};
      const {rerender} = render(
        <DeckGL {...props}>
          <div>Initial</div>
        </DeckGL>
      );

      rerender(
        <DeckGL {...props}>
          <div>Updated</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledOnce();
      expect(mockRender).toHaveBeenCalledTimes(2);
    });

    it('should call configure with updated props', () => {
      const {rerender} = render(
        <DeckGL initialViewState={{latitude: 0, longitude: 0, zoom: 1}}>
          <div>Test</div>
        </DeckGL>
      );

      rerender(
        <DeckGL initialViewState={{latitude: 10, longitude: 10, zoom: 2}}>
          <div>Test</div>
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenCalledTimes(2);
      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({
          initialViewState: {latitude: 10, longitude: 10, zoom: 2}
        })
      );
    });

    it('should forward replacement controlled view state and callback', () => {
      const child = <div>Test</div>;
      const firstViewState = {latitude: 0, longitude: 0, zoom: 1};
      const secondViewState = {latitude: 10, longitude: 10, zoom: 2};
      const firstHandler = vi.fn();
      const secondHandler = vi.fn();
      const {rerender} = render(
        <DeckGL viewState={firstViewState} onViewStateChange={firstHandler}>
          {child}
        </DeckGL>
      );

      rerender(
        <DeckGL viewState={secondViewState} onViewStateChange={firstHandler}>
          {child}
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({
          viewState: secondViewState,
          onViewStateChange: firstHandler
        })
      );

      rerender(
        <DeckGL viewState={secondViewState} onViewStateChange={secondHandler}>
          {child}
        </DeckGL>
      );

      expect(mockConfigure).toHaveBeenLastCalledWith(
        expect.objectContaining({
          viewState: secondViewState,
          onViewStateChange: secondHandler
        })
      );
    });
  });
});

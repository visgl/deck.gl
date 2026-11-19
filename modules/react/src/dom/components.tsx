import 'client-only';
import {assert, type Deck, type View} from '@deck.gl/core';
import {createRoot, unmountAtNode} from '../reconciler/index';
import {RootErrorBoundary} from '../reconciler/error-boundary';
import type {
  DeckGLConfiguration,
  ReconcilerRoot,
  RootElement,
  RootOptions
} from '../reconciler/types';
import type {DeckGLRenderer} from '../shared/store';
import {hasSameConfigProperties} from '../shared/has-same-config-properties';
import {useEffectEvent} from '../shared/use-effect-event';
import {useInstanceRef} from './use-instance-ref';
import type {DeckGLRootProps, DeckGLProps, OnDeckChange} from '../types/index';
import {FiberProvider, useContextBridge} from 'its-fine';
import type {ContextBridge} from 'its-fine';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../shared/use-isomorphic-layout-effect';

type CanvasSource = string | HTMLCanvasElement;

interface ResolvedCanvas {
  source: CanvasSource;
  element: HTMLCanvasElement;
}

function findCanvasById(id: string): HTMLCanvasElement {
  const element = document.getElementById(id);
  // Like Deck, a string `canvas` is an element id that must name a mounted <canvas>.
  assert(element instanceof HTMLCanvasElement);
  return element;
}

// Call only from effects. The resolved element is cached per source so the root
// is configured and unmounted with the same registry key.
function getCanvasRoot(
  source: CanvasSource | null | undefined,
  ownCanvas: RefObject<HTMLCanvasElement | null>,
  resolvedCanvas: RefObject<ResolvedCanvas | null>
): HTMLCanvasElement | null {
  if (!source) {
    return ownCanvas.current;
  }
  if (resolvedCanvas.current?.source === source) {
    return resolvedCanvas.current.element;
  }

  const element = typeof source === 'string' ? findCanvasById(source) : source;
  resolvedCanvas.current = {source, element};
  return element;
}

/** Deck props for a canvas that the root renders; the wrapper owns its size and style. */
const OWNED_CANVAS_PROPS = {height: '100%', style: null, width: '100%'} as const;

/** Styles that apply to the canvas rather than to the wrapper, as in `@deck.gl/react`. */
const CANVAS_ONLY_STYLES = new Set(['mixBlendMode']);

/**
 * Splits the root's `width`, `height`, and `style` between its wrapper and its canvas the
 * way `@deck.gl/react` does: the wrapper is absolutely positioned at the top left of its
 * containing block and has the root's size, and the canvas fills the wrapper.
 */
function getRootStyles(
  width: string | number | null,
  height: string | number | null,
  style: Partial<CSSStyleDeclaration> | null | undefined
): {containerStyle: CSSProperties; canvasStyle: CSSProperties} {
  const containerStyle: Record<string, unknown> = {
    position: 'absolute',
    zIndex: 0,
    left: 0,
    top: 0,
    width,
    height
  };
  const canvasStyle: Record<string, unknown> = {left: 0, top: 0};

  if (style) {
    for (const [key, value] of Object.entries(style)) {
      (CANVAS_ONLY_STYLES.has(key) ? canvasStyle : containerStyle)[key] = value;
    }
  }

  return {containerStyle, canvasStyle};
}

/** Configuration for an externally owned deck.gl overlay root. */
export interface CreateDeckGLOptions<Props, Instance extends DeckGLRenderer, MapT = never> {
  /** Creates the one external-overlay instance bound to the returned component. */
  createExternalOverlay: (props: Props) => Instance;
  /**
   * Props that the overlay reads only when it is constructed or attached, so a later
   * `setProps` cannot apply them. List a prop here when the upstream overlay ignores or
   * mishandles changes to it after construction, such as a rendering mode that is
   * wired up when the overlay attaches to its map.
   *
   * When any listed prop changes (compared with `Object.is`), the component finalizes the
   * current overlay and creates a new one with the full props. `onDeckChange` receives
   * `null` for the old instance and then the new instance. With `attach`, the component attaches
   * the new instance itself; without it, the app attaches it.
   */
  recreateOverlayOnChange?: readonly (keyof Props & string)[];
  /**
   * Sends `<deckView>` children, merged with the `views` prop, to the overlay. Set it for an
   * overlay that supports deck.gl views alongside its host map, such as `MapboxOverlay`
   * and `MapLibreOverlay`. Without it the overlay receives only its `views` prop.
   */
  forwardViews?: boolean;
  /**
   * Attaches the overlay to the host map given in the root's `map` prop, and returns a function
   * that detaches it. With this option the returned component accepts `map`; without it, the
   * application attaches the instance it receives through `onDeckChange`.
   *
   * The component calls it after each overlay is created, while `map` is set, and calls the
   * returned function before the overlay is replaced or finalized, when `map` changes or becomes
   * `null`, and on unmount. A Strict Mode effect replay can call the pair twice for one overlay,
   * so both steps must be safe to repeat. `map` itself is never passed to the overlay; without
   * `attach`, a `map` prop is an ordinary prop that reaches the overlay like any other.
   */
  attach?: (map: MapT, overlay: Instance) => () => void;
}

type ComponentProps<Props, Instance extends DeckGLRenderer, MapT = never> = DeckGLRootProps<
  Instance,
  Props,
  MapT
>;

function createDeckGLComponent<Props, Instance extends DeckGLRenderer, MapT = never>(
  options?: CreateDeckGLOptions<Props, Instance, MapT>
) {
  const attach = options?.attach;
  const overlayFactory = options?.createExternalOverlay;
  const isExternalOverlay = Boolean(overlayFactory);

  // Call only from effects: roots must server-render without touching `document`.
  // Factory scope keeps this non-reactive; the element is a stable registry key held in a ref.
  function getDetachedRoot(
    detachedRoot: RefObject<HTMLDivElement | null>,
    rootOptions: RefObject<RootOptions | undefined>
  ): HTMLDivElement {
    if (!detachedRoot.current) {
      detachedRoot.current = document.createElement('div');
      rootOptions.current = {
        createExternalOverlay: config => overlayFactory?.(config as Props) as DeckGLRenderer,
        forwardViews: Boolean(options?.forwardViews)
      };
    }
    return detachedRoot.current;
  }

  function DeckGLComponent(props: ComponentProps<Props, Instance, MapT>) {
    const {children, onDeckChange, ref, ...rootProps} = props as ComponentProps<
      Props,
      Instance,
      MapT
    > & {map?: MapT | null};
    // With `attach`, `map` is the host map and never reaches deck.gl. Without it, `map` is an
    // ordinary prop that the overlay may declare and read itself.
    let map: MapT | null | undefined;
    let deckglProps: object = rootProps;
    if (attach) {
      const {map: hostMap, ...overlayProps} = rootProps;
      map = hostMap;
      deckglProps = overlayProps;
    }
    const setInstanceRef = useInstanceRef(ref);
    const notifyDeckChange = useEffectEvent<Parameters<OnDeckChange<Instance>>, void>(deckgl => {
      setInstanceRef(deckgl);
      onDeckChange?.(deckgl);
    });

    const Bridge: ContextBridge = useContextBridge();
    // An error caught inside the reconciler root, rethrown below so the application's
    // error boundaries handle it.
    const [rootError, setRootError] = useState<{error: unknown} | null>(null);
    const handleRootError = useCallback((error: unknown) => setRootError({error}), []);
    const wrapper = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const detachedRoot = useRef<HTMLDivElement | null>(null);
    const rootOptions = useRef<RootOptions | undefined>(undefined);
    const resolvedCanvas = useRef<ResolvedCanvas | null>(null);
    // The root and config last sent to `configure`, so a children-only commit skips it.
    const configured = useRef<{root: ReconcilerRoot; config: DeckGLConfiguration} | null>(null);
    // The overlay the root created, for `attach`. A replay or a recreate gives a new one.
    const overlay = useRef<Instance | null>(null);
    // The map and overlay that `attach` last joined, and the function it returned. Cleared once
    // the overlay is detached, so it is detached exactly once, and always before it is finalized.
    const attached = useRef<{map: MapT; overlay: Instance; detach: () => void} | null>(null);
    function detachOverlay() {
      const current = attached.current;
      attached.current = null;
      current?.detach();
    }

    // Object-rest creates a new config object each render. Preserve the committed
    // config while its values are unchanged so a lifecycle callback replacement is non-reactive.
    const configCache = useRef(deckglProps as DeckGLConfiguration);
    const configCandidate = deckglProps as DeckGLConfiguration;
    const config = hasSameConfigProperties(configCache.current, configCandidate)
      ? configCache.current
      : configCandidate;

    useIsomorphicLayoutEffect(() => {
      configCache.current = config;
    });

    useIsomorphicLayoutEffect(() => {
      let rootElement: RootElement;
      let rootConfig: DeckGLConfiguration = config;
      if (isExternalOverlay) {
        rootElement = getDetachedRoot(detachedRoot, rootOptions);
      } else {
        const canvasElement = getCanvasRoot(config.canvas, canvas, resolvedCanvas);
        if (!canvasElement) {
          return;
        }
        rootElement = canvasElement;
        rootConfig = {
          ...config,
          canvas: canvasElement,
          parent:
            config.parent ||
            (config.canvas ? (canvasElement.parentElement as HTMLDivElement) : wrapper.current),
          // The wrapper takes the size and style of an owned canvas, which fills it.
          ...(config.canvas ? null : OWNED_CANVAS_PROPS)
        };
      }

      const root: ReconcilerRoot = rootOptions.current
        ? createRoot(rootElement, rootOptions.current)
        : createRoot(rootElement);

      // Each `configure` calls deck.gl `setProps`. Only call it for a new root or a changed
      // config; new children reach deck.gl through the render commit alone.
      if (configured.current?.root !== root || configured.current.config !== config) {
        configured.current = {config, root};
        root.configure(rootConfig);
        overlay.current = root.store.getState().deckgl as Instance | null;
        notifyDeckChange(overlay.current);
      }
      root.render(
        <Bridge>
          <RootErrorBoundary onError={handleRootError}>{children}</RootErrorBoundary>
        </Bridge>
      );
    }, [children, config, Bridge, handleRootError]);

    // A layout cleanup releases the old root before a replacement root's layout effect
    // configures it, so `onDeckChange` reports `null` before the new instance.
    useIsomorphicLayoutEffect(() => {
      const rootElement = isExternalOverlay
        ? getDetachedRoot(detachedRoot, rootOptions)
        : getCanvasRoot(config.canvas, canvas, resolvedCanvas);

      if (rootElement) {
        return () => {
          // Detach first: unmounting the root finalizes the overlay, and an overlay may need its
          // resources to leave its host map.
          detachOverlay();
          notifyDeckChange(null);
          overlay.current = null;
          unmountAtNode(rootElement);
        };
      }
    }, [config.canvas]);

    // Runs after every commit's layout effects, so it follows the overlay's lifetime as well as
    // `map`: any new overlay, whether from a new root, a replay or a recreate, is attached, and
    // an overlay is moved when `map` changes. The layout cleanup above detaches an overlay
    // before it is finalized, so here only a `map` change or a `null` map detaches.
    useEffect(() => {
      const instance = overlay.current;
      const current = attached.current;
      if (current && current.map === map && current.overlay === instance) {
        return;
      }
      detachOverlay();
      if (attach && map && instance) {
        attached.current = {map, overlay: instance, detach: attach(map, instance)};
      }
    });
    // Detaches on unmount, and on a Strict Mode replay, before the effect above runs again.
    useEffect(() => detachOverlay, []);

    if (rootError) {
      throw rootError.error;
    }

    if (isExternalOverlay || config.canvas) {
      return null;
    }

    const {id, width = '100%', height = '100%', style} = config;
    const {containerStyle, canvasStyle} = getRootStyles(width, height, style);

    return (
      <div ref={wrapper} id={`${id || 'deckgl'}-wrapper`} style={containerStyle}>
        <canvas ref={canvas} id={id || 'deckgl-overlay'} style={canvasStyle} />
      </div>
    );
  }

  const recreateOverlayOnChange: readonly PropertyKey[] = options?.recreateOverlayOnChange ?? [];

  return function DeckGL(props: ComponentProps<Props, Instance, MapT>) {
    const generation = useRecreateGeneration(props, recreateOverlayOnChange);
    return (
      <FiberProvider>
        <DeckGLComponent key={generation} {...props} />
      </FiberProvider>
    );
  };
}

// Counts changes to the listed props. Uses the store-previous-render-state pattern
// so StrictMode's repeated renders compute the same generation.
function useRecreateGeneration(props: object, keys: readonly PropertyKey[]): number {
  const values = keys.map(key => (props as Record<PropertyKey, unknown>)[key]);
  const [committed, setCommitted] = useState({generation: 0, values});
  if (values.some((value, index) => !Object.is(value, committed.values[index]))) {
    const next = {generation: committed.generation + 1, values};
    setCommitted(next);
    return next.generation;
  }
  return committed.generation;
}

const PlainDeckGLComponent = createDeckGLComponent<DeckGLProps, Deck>();

/** Creates a native React Fiber component bound to a compatible external overlay factory. */
export function createDeckGL<Props, Instance extends DeckGLRenderer, MapT = never>(
  options: CreateDeckGLOptions<Props, Instance, MapT>
) {
  return createDeckGLComponent(options);
}

/**
 * The standalone Deck root exported from the package root and `/dom`.
 *
 * As in `@deck.gl/react`, the view state props are typed from the `views` prop. Without it,
 * they take one map view state. For views from `<deckView>` children or a widget, name their
 * type: `<DeckGL<MapView[]> initialViewState={{left: ..., right: ...}}>`.
 */
export function DeckGL<ViewsT extends View | View[] | null = null>(props: DeckGLProps<ViewsT>) {
  return <PlainDeckGLComponent {...(props as DeckGLProps)} />;
}

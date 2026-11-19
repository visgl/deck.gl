import type {Deck, DeckProps, LayersList, View} from '@deck.gl/core';

/**
 * Global state shape for deckgl-fiber internal state management
 *
 * Manages the deck.gl instance reference and layers passed via props.
 * Used internally by the reconciler to coordinate between React and deck.gl.
 */
export type DeckGLRenderer = Pick<Deck<View | View[] | null>, 'finalize' | 'setProps'>;

export interface State {
  /**
   * Current deck.gl renderer instance.
   *
   * Null until the DeckGL component mounts and creates the instance. External
   * overlays are intentionally represented structurally so the generic
   * reconciler does not import provider packages.
   */
  deckgl: DeckGLRenderer | null;

  /** Whether this root is backed by an externally owned overlay control. */
  isExternalOverlay: boolean;

  /** Whether an external overlay root sends JSX views to its overlay. */
  forwardViews: boolean;

  /**
   * Updates the deck.gl instance reference.
   *
   * Called during DeckGL component mount/update lifecycle.
   */
  setDeckGL: (instance: DeckGLRenderer | null) => void;

  /**
   * Layers passed directly via the `layers` prop (internal use)
   *
   * Supports "mix-mode" where users can pass explicit `layers` prop
   * alongside JSX children. Private API - do not use directly.
   *
   * @internal
   */
  _passedLayers: LayersList;

  /**
   * Views passed directly via the `views` prop (internal use)
   *
   * Merged with JSX `<deckView>` children; `undefined` when the prop is absent.
   *
   * @internal
   */
  _passedViews?: View | View[] | null;

  /**
   * Widgets passed directly via the `widgets` prop (internal use)
   *
   * Merged with JSX `<deckWidget>` children; `undefined` when the prop is absent.
   *
   * @internal
   */
  _passedWidgets?: DeckProps<View | View[] | null>['widgets'];

  /**
   * Effects passed directly via the `effects` prop (internal use)
   *
   * Merged with JSX `<deckEffect>` children; `undefined` when the prop is absent.
   *
   * @internal
   */
  _passedEffects?: DeckProps<View | View[] | null>['effects'];
}

/**
 * Store API for deckgl-fiber root state.
 *
 * `setState` shallow-merges a partial state into a new state object.
 */
export interface Store {
  /** Returns the current state. */
  getState: () => State;
  /** Shallow-merges `partial` into the current state. */
  setState: (partial: Partial<State>) => void;
}

/**
 * Creates an isolated store for a reconciler root.
 *
 * Each root owns its deck.gl instance and the layers supplied through its
 * component props.
 */
export function createStore(isExternalOverlay = false, forwardViews = false): Store {
  let state: State = {
    // NOTE: we want to support a "mix-mode" of sorts where a user can pass an explicit `layers` prop alongside
    // traditional usage of creating layers as JSX children.
    _passedLayers: [],

    deckgl: null,

    isExternalOverlay,

    forwardViews,

    setDeckGL: instance => {
      setState({deckgl: instance});
    }
  };

  function setState(partial: Partial<State>): void {
    state = {...state, ...partial};
  }

  return {getState: () => state, setState};
}

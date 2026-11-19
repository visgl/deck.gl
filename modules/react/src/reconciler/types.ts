import type {DeckProps, Effect, Layer, View, Widget} from '@deck.gl/core';
import type {DeckGLRenderer, Store} from '../shared/index';
import type {ReactNode} from 'react';
import type {Fiber} from 'react-reconciler';

/**
 * Element type identifier used by the reconciler.
 *
 * Represents the string key used to identify element types (e.g., 'deckLayer', 'deckView')
 * during the reconciliation process.
 */
export type Type = string;

/**
 * Reconciler container holding shared state.
 *
 * Passed to React reconciler as the root container, providing access to the
 * global store for all reconciler operations.
 */
export interface Container {
  /** Root store managing deck.gl state */
  store: Store;

  /**
   * Layers, views and widgets from the most recently committed JSX tree. A prop-only update can
   * reconfigure the root without a new commit, so configuration reapplies these.
   *
   * @internal
   */
  jsxDescriptors?: JsxDescriptors;

  /**
   * Whether the last update sent `views`. The root sends `null` once after its last view is
   * removed, then leaves deck.gl's views alone.
   *
   * @internal
   */
  sentViews?: boolean;
}

/**
 * Layers, views and widgets collected from one committed JSX tree, in depth-first order.
 *
 * @internal
 */
export interface JsxDescriptors {
  effects: Effect[];
  layers: Layer[];
  views: View[];
  widgets: Widget[];
}

/**
 * Element properties passed to reconciler instances.
 *
 * Generic property bag containing all props passed to layer/view elements.
 * Actual prop types are determined by the specific deck.gl Layer or View.
 */
export type Props = Record<string, unknown>;

/**
 * Context passed through the reconciler tree during rendering.
 *
 * Provides shared state and tracks whether elements are being rendered
 * inside a View element (affects rendering behavior).
 */
export interface HostContext {
  /** Root store for accessing deck.gl state */
  store: Store;

  /** Whether the current element is nested inside a View element */
  insideView?: boolean;
}

/**
 * Reconciler instance representing a rendered element.
 *
 * Each Instance wraps a deck.gl Layer or View and maintains references to
 * its children, forming the reconciler's internal tree structure.
 */
export interface Instance {
  /** The underlying deck.gl Layer, View, Widget or effect object */
  node: Layer | View | Widget | Effect;

  /** Child instances in the reconciler tree */
  children: Instance[];
}

/**
 * Text instance type (not supported).
 *
 * React reconciler requires this type, but deck.gl doesn't support text nodes.
 * Text rendering is handled through layer data and text properties instead.
 */
export type TextInstance = void | never;

/**
 * Collection of child instances in persistence mode.
 *
 * Used by React reconciler to manage children when using persistence mode
 * (where the tree is rebuilt rather than mutated in place).
 */
export type ChildSet = Instance[];

/**
 * Handle for scheduled timeouts.
 *
 * Return value from setTimeout, used by React reconciler for scheduling
 * deferred work (e.g., Suspense timeouts, transitions).
 */
export type TimeoutHandle = number;

/**
 * Update payload computed during diffing (always null).
 *
 * React reconciler uses this to pass data from prepareUpdate to commitUpdate.
 * This reconciler uses persistence mode and always creates new instances,
 * so no payload is needed.
 */
export type UpdatePayload = null;

/**
 * State object tracking pending suspensions during commit phase.
 *
 * React reconciler passes this state through Suspense lifecycle functions
 * (startSuspendingCommit, suspendInstance, waitForCommitToBeReady). For
 * deck.gl renderer, pendingCount is always 0 since layers never suspend.
 */
export interface SuspendedState {
  /** Number of pending suspended instances (always 0 for deck.gl layers) */
  pendingCount: number;
}

/**
 * Form instance type (not supported).
 *
 * React reconciler requires this type for React 19 form actions support.
 * Deck.gl doesn't support forms, so this is stubbed as never.
 */
export type FormInstance = never;

/**
 * Transition status type (not supported).
 *
 * React reconciler requires this type for transition tracking.
 * Deck.gl doesn't use transitions, so this is stubbed as null.
 */
export type TransitionStatus = null;

/**
 * Valid DOM elements for mounting the reconciler root.
 *
 * The reconciler can mount to either a canvas (for standalone deck.gl)
 * or a div (for MapboxOverlay integration with external renderers).
 */
export type RootElement = HTMLCanvasElement | HTMLDivElement;

/**
 * Internal configuration accepted by the reconciler.
 *
 * Public entry points specialize this broad shape before it reaches the
 * renderer. The renderer forwards it unchanged to the Deck or external-overlay
 * constructor and to later `setProps` calls.
 *
 * @internal
 */
export type DeckGLConfiguration = DeckProps<View | View[] | null>;

/** @internal Factory bound to an external-overlay root at creation time. */
export type CreateExternalOverlay = (props: DeckGLConfiguration) => DeckGLRenderer;

/** @internal Immutable reconciler-root capability configuration. */
export interface RootOptions {
  createExternalOverlay?: CreateExternalOverlay;
  /** Sends JSX views to the external overlay. See `CreateDeckGLOptions.forwardViews`. */
  forwardViews?: boolean;
}

/**
 * Deck.gl View configuration.
 *
 * Accepts a single View, multiple Views, or null for default MapView.
 * Views control camera positioning and viewport configuration.
 */
export type ViewOrViews = View | View[] | null;

/**
 * Reconciler root instance with rendering methods.
 *
 * Created by createRoot, provides methods to configure deck.gl and render
 * React elements into the deck.gl scene. Follows React 18 createRoot API.
 */
export interface ReconcilerRoot {
  /** Root store managing deck.gl state */
  store: Store;

  /** React Fiber root container (internal reconciler state) */
  container: Fiber;

  /** Renders React elements into the deck.gl scene */
  render: (element: ReactNode) => void;

  /** Configures the underlying Deck or externally owned overlay instance. */
  configure: (props: DeckGLConfiguration) => void;

  /** @internal Whether this root was created for an external overlay control. */
  isExternalOverlay: boolean;

  /** @internal Factory permanently bound to this root, if any. */
  createExternalOverlay?: CreateExternalOverlay;
}

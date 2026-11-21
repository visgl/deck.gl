// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Component} from 'react';
import type {ReactNode} from 'react';

/** Props for {@link RootErrorBoundary}. */
interface RootErrorBoundaryProps {
  /** Receives each error caught inside the root, so the host component can rethrow it. */
  onError: (error: unknown) => void;
  /** The root's rendered tree. */
  children?: ReactNode;
}

/** State for {@link RootErrorBoundary}. */
interface RootErrorBoundaryState {
  /** True after an error was caught, so the boundary renders nothing. */
  failed: boolean;
}

/**
 * Catches errors thrown inside a reconciler root.
 *
 * A reconciler root is separate from the host React tree, so an error thrown inside it never
 * reaches the application's error boundaries on its own. The `DeckGL` component renders its
 * children inside this boundary and rethrows what it catches, as react-three-fiber's `Canvas`
 * does, so the error surfaces from `DeckGL` like an error from any other component.
 */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  /** Starts without a caught error. */
  state: RootErrorBoundaryState = {failed: false};

  /** Records that a descendant threw, so the next render shows nothing. */
  static getDerivedStateFromError(): RootErrorBoundaryState {
    return {failed: true};
  }

  /** Hands the caught error to `onError`. */
  componentDidCatch(error: unknown): void {
    this.props.onError(error);
  }

  /** Renders the children until an error is caught, then nothing. */
  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Component} from 'react';
import type {ReactNode} from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Renders in place of the children after one of them throws. */
  fallback: (error: Error) => ReactNode;
  /**
   * Clears a caught error when it changes, so a new search tries again. Unlike a React `key`, it
   * doesn't remount the children while nothing has failed, which would discard the previous
   * results that `useDeferredValue` keeps on screen.
   */
  resetKey: unknown;
}

/**
 * Catches an error thrown while rendering its children, such as a failed airports query, so the
 * rest of the page keeps rendering. Inside `DeckGL`, the fallback may only render deck.gl
 * elements or `null`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, {error: Error | null}> {
  state: {error: Error | null} = {error: null};

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({error: null});
    }
  }

  render() {
    const {error} = this.state;
    return error ? this.props.fallback(error) : this.props.children;
  }
}

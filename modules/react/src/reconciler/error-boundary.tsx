import {Component} from 'react';
import type {ReactNode} from 'react';

interface RootErrorBoundaryProps {
  /** Receives each error caught inside the root, so the host component can rethrow it. */
  onError: (error: unknown) => void;
  children?: ReactNode;
}

interface RootErrorBoundaryState {
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
  state: RootErrorBoundaryState = {failed: false};

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return {failed: true};
  }

  componentDidCatch(error: unknown): void {
    this.props.onError(error);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

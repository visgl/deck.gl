// Uses the real reconciler with a fake overlay, so errors travel the same path as in an app.
import {log} from '@deck.gl/core';
import {act, render} from '@testing-library/react';
import {Component} from 'react';
import type {ReactNode} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createDeckGL} from '../components';

const CustomDeckGL = createDeckGL({
  createExternalOverlay: () => ({finalize: vi.fn(), setProps: vi.fn()})
});

class AppBoundary extends Component<
  {children: ReactNode; onError?: (error: unknown) => void},
  {error: unknown}
> {
  state = {error: null as unknown};

  static getDerivedStateFromError(error: unknown) {
    return {error};
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.error ? (
      <p>fallback: {String((this.state.error as Error).message)}</p>
    ) : (
      this.props.children
    );
  }
}

// A boundary for use inside DeckGL, where only deck.gl elements can render, so its fallback is null.
class InnerBoundary extends Component<
  {children: ReactNode; onError: (error: unknown) => void},
  {failed: boolean}
> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Thrower(): ReactNode {
  throw new Error('render failed');
}

async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

describe('errors inside DeckGL', () => {
  beforeEach(() => {
    // React reports caught errors to the console; keep test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reach an error boundary around DeckGL', async () => {
    const onError = vi.fn();
    const {findByText, unmount} = render(
      <AppBoundary onError={onError}>
        <CustomDeckGL>
          <Thrower />
        </CustomDeckGL>
      </AppBoundary>
    );
    await flush();

    expect(await findByText('fallback: render failed')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({message: 'render failed'}));
    unmount();
  });

  it('include errors from the renderer itself, such as a missing descriptor', async () => {
    const onError = vi.fn();
    const {unmount} = render(
      <AppBoundary onError={onError}>
        <CustomDeckGL>
          <deckLayer layer={undefined as never} />
        </CustomDeckGL>
      </AppBoundary>
    );
    await flush();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(String((onError.mock.calls[0][0] as Error).message)).toMatch(/<deckLayer>/);
    unmount();
  });

  it('are not logged a second time by the renderer when DeckGL rethrows them', async () => {
    const logError = vi.spyOn(log, 'error').mockReturnValue(() => {});
    const {unmount} = render(
      <AppBoundary>
        <CustomDeckGL>
          <Thrower />
        </CustomDeckGL>
      </AppBoundary>
    );
    await flush();

    expect(logError).not.toHaveBeenCalled();
    unmount();
  });

  it('stay inside DeckGL when an error boundary inside it catches them', async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const logError = vi.spyOn(log, 'error').mockReturnValue(() => {});
    const {unmount} = render(
      <AppBoundary onError={outer}>
        <CustomDeckGL>
          <InnerBoundary onError={inner}>
            <Thrower />
          </InnerBoundary>
        </CustomDeckGL>
      </AppBoundary>
    );
    await flush();

    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      'DeckGL error',
      expect.objectContaining({message: 'render failed'})
    );
    unmount();
  });
});

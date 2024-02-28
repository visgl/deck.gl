import {Deck, type DeckProps} from '@deck.gl/core';
import {FiberProvider, useContextBridge} from 'its-fine';
import React, {forwardRef, memo, useImperativeHandle, useRef, type ReactNode} from 'react';
import {ConcurrentRoot} from 'react-reconciler/constants';
import {Provider} from './context';
import {useIsomorphicLayoutEffect} from './react-utils';
import {reconciler} from './reconciler';
import {useStore as storeInstance, type Store} from './store';

// NOTE: side effect to build out initial catalogue
import './extend';

type CanvasElement = HTMLCanvasElement;

const roots = new Map();

type DeckGLProps = DeckProps & {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
};

export type ReconcilerRoot<TCanvas extends CanvasElement> = {
  render: (element: ReactNode) => Store;
  configure: (props: DeckGLProps) => ReconcilerRoot<TCanvas>;
  unmount: () => void;
};

function unmountComponentAtNode(canvas: CanvasElement) {
  const root = roots.get(canvas);
  const fiber = root?.fiber;

  if (fiber) {
    const state = root?.store.getState();

    reconciler.updateContainer(null, fiber, null, () => {
      state.deckgl.finalize();
      roots.delete(canvas);
    });
  }
}

function createRoot<TCanvas extends CanvasElement>(canvas: TCanvas): ReconcilerRoot<TCanvas> {
  const prevRoot = roots.get(canvas);
  const store = prevRoot?.store ?? storeInstance;

  const fiber =
    prevRoot?.fiber ??
    reconciler.createContainer(store, ConcurrentRoot, null, false, null, '', reportError, null);

  if (!prevRoot) {
    roots.set(canvas, {fiber, store});
  }

  return {
    configure(props) {
      const state = store.getState();

      if (!state.deckgl) {
        const deckgl = new Deck({
          ...props,
          canvas,
          layers: [],
          onWebGLInitialized: state.setWebgl
          // TODO: investigate if we need
          // _customRender: reason => {
          //   console.log('reason', reason);
          //   if (reason) {
          //     deckgl._drawLayers(reason);
          //   }
          // },
        });

        state.setDeckgl(deckgl);
      }

      // TODO: try and find another way to do this, only required for controlled viewState
      if (state.deckgl && props.viewState && props.onViewStateChange) {
        state.deckgl.setProps({viewState: props.viewState});
      }

      return this;
    },
    render(children) {
      reconciler.updateContainer(<Provider store={store}>{children}</Provider>, fiber, null);

      return store;
    },
    unmount() {
      unmountComponentAtNode(canvas);
    }
  };
}

function CanvasImplementation({children, ...rest}: DeckGLProps, forwardedRef: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const outerRef = useRef<HTMLDivElement>(null!);
  const root = useRef<ReconcilerRoot<HTMLCanvasElement>>(null!);
  const Bridge = useContextBridge();

  useImperativeHandle(forwardedRef, () => canvasRef.current);

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      if (!root.current) {
        root.current = createRoot<HTMLCanvasElement>(canvas);
      }

      // @ts-expect-error FIXME
      root.current.configure({
        ...rest
      });

      root.current.render(<Bridge>{children}</Bridge>);
    }
  });

  useIsomorphicLayoutEffect(
    () => () => {
      const canvas = canvasRef.current;

      if (canvas) {
        unmountComponentAtNode(canvas);
      }
    },
    []
  );

  return (
    <div id="deck-wrapper" ref={outerRef}>
      <div id="deck-container" ref={containerRef}>
        <canvas id="deck-canvas" ref={canvasRef} />
      </div>
    </div>
  );
}

const Canvas = memo(forwardRef(CanvasImplementation));

function DeckGLImplementation(props: DeckGLProps, forwardedRef: any) {
  return (
    <FiberProvider>
      <Canvas {...props} ref={forwardedRef} />
    </FiberProvider>
  );
}

export const DeckGL = memo(forwardRef(DeckGLImplementation));

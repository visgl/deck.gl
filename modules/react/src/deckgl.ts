// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {createElement, useRef, useState, useMemo, useEffect, useImperativeHandle} from 'react';
import {Deck} from '@deck.gl/core';
import useIsomorphicLayoutEffect from './utils/use-isomorphic-layout-effect';

import extractJSXLayers, {DeckGLRenderCallback} from './utils/extract-jsx-layers';
import positionChildrenUnderViews from './utils/position-children-under-views';
import extractStyles from './utils/extract-styles';

import type {DeckGLContextValue} from './utils/deckgl-context';
import type {DeckProps, View, Viewport} from '@deck.gl/core';

export type ViewOrViews = View | View[] | null;

/* eslint-disable max-statements, accessor-pairs */
type DeckInstanceRef<ViewsT extends ViewOrViews> = {
  deck?: Deck<ViewsT>;
  redrawReason?: string | null;
  lastRenderedViewports?: Viewport[];
  viewStateUpdateRequested?: any;
  interactionStateUpdateRequested?: any;
  // An externally supplied device owns its canvas across DeckGL mounts. Preserve its original
  // visibility so an interrupted backend switch cannot leave the shared canvas permanently hidden.
  externalCanvasStyle?: CSSStyleDeclaration;
  originalCanvasVisibility?: string;
  forceUpdate: () => void;
  version: number;
  control: React.ReactHTMLElement<HTMLElement> | null;
};

// Remove prop types in the base Deck class that support externally supplied canvas/WebGLContext
/** DeckGL React component props */
export type DeckGLProps<ViewsT extends ViewOrViews = null> = Omit<
  DeckProps<ViewsT>,
  'width' | 'height' | 'gl' | 'parent' | 'canvas' | '_customRender'
> & {
  Deck?: typeof Deck;
  width?: string | number;
  height?: string | number;
  children?: React.ReactNode | DeckGLRenderCallback;
  ref?: React.Ref<DeckGLRef<ViewsT>>;
  ContextProvider?: React.Context<DeckGLContextValue>['Provider'];
};

export type DeckGLRef<ViewsT extends ViewOrViews = null> = {
  deck?: Deck<ViewsT>;
  pickObjectAsync: Deck['pickObjectAsync'];
  pickObjectsAsync: Deck['pickObjectsAsync'];
  pickObject: Deck['pickObject'];
  pickObjects: Deck['pickObjects'];
  pickMultipleObjects: Deck['pickMultipleObjects'];
};

function getRefHandles<ViewsT extends ViewOrViews>(
  thisRef: DeckInstanceRef<ViewsT>
): DeckGLRef<ViewsT> {
  return {
    get deck() {
      return thisRef.deck;
    },
    // The following method can only be called after ref is available, by which point deck is defined in useEffect
    pickObjectAsync: opts => thisRef.deck!.pickObjectAsync(opts),
    pickObjectsAsync: opts => thisRef.deck!.pickObjectsAsync(opts),
    pickObject: opts => thisRef.deck!.pickObject(opts),
    pickMultipleObjects: opts => thisRef.deck!.pickMultipleObjects(opts),
    pickObjects: opts => thisRef.deck!.pickObjects(opts)
  };
}

function redrawDeck(thisRef: DeckInstanceRef<any>) {
  if (thisRef.redrawReason) {
    // Only redraw if we have received a dirty flag
    // @ts-expect-error accessing protected method
    thisRef.deck._drawLayers(thisRef.redrawReason);
    thisRef.redrawReason = null;
  }
}

// A device can be cached and mounted again when the website switches WebGPU -> WebGL -> WebGPU.
// Reveal its canvas only after the new Deck has drawn, or when the mount is cancelled. Otherwise
// the old WebGPU frame can flash in the new React container.
function showExternalCanvas(thisRef: DeckInstanceRef<any>) {
  if (thisRef.externalCanvasStyle) {
    thisRef.externalCanvasStyle.visibility = thisRef.originalCanvasVisibility || '';
    thisRef.externalCanvasStyle = undefined;
    thisRef.originalCanvasVisibility = undefined;
  }
}

// DeckGL accepts both an already-created device and instructions for creating one. Account for
// both forms so the render policy does not change depending on who initialized the WebGPU device.
function isWebGPUDevice(props: DeckProps<any>): boolean {
  return (
    props.device?.type === 'webgpu' ||
    props.deviceProps?.type === 'webgpu' ||
    props.deviceProps?.adapters?.[0]?.type === 'webgpu'
  );
}

// luma.gl initially gives a detached canvas a small placeholder size. Do not mount a basemap
// against that temporary viewport: MapLibre would initialize its own canvas at 1 x 1 pixels.
function deckSizeMatchesContainer(
  thisRef: DeckInstanceRef<any>,
  container: HTMLElement | null
): boolean {
  const deck = thisRef.deck;
  return Boolean(
    deck &&
      container &&
      deck.width === container.clientWidth &&
      deck.height === container.clientHeight
  );
}

function createDeckInstance<ViewsT extends ViewOrViews>(
  thisRef: DeckInstanceRef<ViewsT>,
  DeckClass: typeof Deck,
  props: DeckProps<ViewsT>
): Deck<ViewsT> {
  const isWebGPU = isWebGPUDevice(props);
  const externalCanvas = props.device?.getDefaultCanvasContext().canvas;
  const externalCanvasStyle =
    externalCanvas instanceof HTMLCanvasElement && !externalCanvas.isConnected
      ? externalCanvas.style
      : null;

  // The website reuses one device per backend. Its canvas can therefore still contain the previous
  // example's frame when Deck moves it from a detached container into this React wrapper.
  if (externalCanvasStyle) {
    thisRef.externalCanvasStyle = externalCanvasStyle;
    thisRef.originalCanvasVisibility = externalCanvasStyle.visibility;
    externalCanvasStyle.visibility = 'hidden';
  }

  const deck = new DeckClass({
    ...props,
    // Keep one authoritative render callback for both backends. Deck calls `_customRender` from
    // its animation loop whenever its viewport or layers become dirty; this is also the point
    // where React children must be synchronized with the viewport used to draw those layers.
    _customRender: redrawReason => {
      thisRef.redrawReason = redrawReason;

      const viewports = deck.getViewports();
      if (thisRef.lastRenderedViewports !== viewports) {
        // Do not initialize a map against the detached WebGPU canvas's temporary 1 x 1 viewport.
        // The next resize invalidates Deck again and repeats this callback with the final size.
        if (!isWebGPU || deckSizeMatchesContainer(thisRef, props.parent || null)) {
          thisRef.forceUpdate();
        }

        if (!isWebGPU) {
          // WebGL may defer drawing until React's layout effect so its DOM children and canvas
          // appear in the same frame. Keep master behavior unchanged for the existing backend.
          return;
        }
      }

      // WebGPU's current canvas texture is valid only for this animation frame. Draw now, even
      // when React still has a pending viewport update; waiting for a layout effect would reuse
      // an expired texture. React children catch up through the forceUpdate scheduled above.
      redrawDeck(thisRef);
    }
  });
  return deck;
}

function DeckGLWithRef<ViewsT extends ViewOrViews = null>(
  props: DeckGLProps<ViewsT>,
  ref: React.Ref<DeckGLRef<ViewsT>>
) {
  // A mechanism to force redraw
  const [version, setVersion] = useState(0);
  // A reference to persistent states
  const _thisRef = useRef<DeckInstanceRef<ViewsT>>({
    control: null,
    version,
    forceUpdate: () => setVersion(v => v + 1)
  });
  const thisRef = _thisRef.current;
  // DOM refs
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // extract any deck.gl layers masquerading as react elements from props.children
  const jsxProps = useMemo(
    () => extractJSXLayers(props),
    [props.layers, props.views, props.children]
  );

  // Callbacks
  let inRender = true;

  const handleViewStateChange: DeckProps<ViewsT>['onViewStateChange'] = params => {
    if (inRender && props.viewState) {
      // Callback may invoke a state update. Defer callback to after render() to avoid React error
      // In React StrictMode, render is executed twice and useEffect/useLayoutEffect is executed once
      // Store deferred parameters in ref so that we can access it in another render
      thisRef.viewStateUpdateRequested = params;
      return null;
    }
    thisRef.viewStateUpdateRequested = null;
    // Deck marks the new viewport dirty and schedules `_customRender`; do not start a competing
    // React update here. Keeping redraw ownership in one callback handles both controlled and
    // uncontrolled view state without making WebGPU a separate synchronization path.
    return props.onViewStateChange?.(params);
  };

  const handleInteractionStateChange: DeckProps<ViewsT>['onInteractionStateChange'] = params => {
    if (inRender) {
      // Callback may invoke a state update. Defer callback to after render() to avoid React error
      // In React StrictMode, render is executed twice and useEffect/useLayoutEffect is executed once
      // Store deferred parameters in ref so that we can access it in another render
      thisRef.interactionStateUpdateRequested = params;
    } else {
      thisRef.interactionStateUpdateRequested = null;
      props.onInteractionStateChange?.(params);
    }
  };

  const handleAfterRender: DeckProps<ViewsT>['onAfterRender'] = context => {
    // `_customRender` has already submitted the first frame. It is now safe to reveal a reused
    // external canvas without displaying the previous DeckGL instance's contents.
    showExternalCanvas(thisRef);
    // Preserve the public callback: canvas ownership is internal to the React wrapper.
    props.onAfterRender?.(context);
  };

  // Update Deck's props. If Deck needs redraw, this will trigger a call to `_customRender` in
  // the next animation frame.
  // Needs to be called both from initial mount, and when new props are received
  const deckProps = useMemo(() => {
    const forwardProps: DeckProps<ViewsT> = {
      widgets: [],
      ...props,
      // Override user styling props. We will set the canvas style in render()
      style: null,
      width: '100%',
      height: '100%',
      parent: containerRef.current,
      canvas: canvasRef.current,
      layers: jsxProps.layers,
      onViewStateChange: handleViewStateChange,
      onInteractionStateChange: handleInteractionStateChange,
      onAfterRender: handleAfterRender
    };

    if (jsxProps.views) {
      forwardProps.views = jsxProps.views;
    }

    // The defaultValue for _customRender is null, which would overwrite the definition
    // of _customRender. Remove to avoid frequently redeclaring the method here.
    delete forwardProps._customRender;

    if (thisRef.deck) {
      thisRef.deck.setProps(forwardProps);
      // Sync viewport tracking after the update. Without this, _customRender would see
      // stale lastRenderedViewports and trigger a redundant forceUpdate, causing
      // double renders on every viewport change when using externally managed view state.
      if (thisRef.deck.isInitialized) {
        thisRef.lastRenderedViewports = thisRef.deck.getViewports();
      }
    }

    return forwardProps;
  }, [props]);

  useEffect(() => {
    const DeckClass = props.Deck || Deck;

    thisRef.deck = createDeckInstance(thisRef, DeckClass, {
      ...deckProps,
      parent: containerRef.current,
      canvas: canvasRef.current
    });

    return () => {
      // Device switching can unmount an example before its first frame. Restore the canvas even
      // when `onAfterRender` never ran so the cached device remains usable on its next mount.
      showExternalCanvas(thisRef);
      thisRef.deck?.finalize();
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    // render has just been called. The children are positioned based on the current view state.
    // Redraw Deck canvas immediately, if necessary, using the current view state, so that it
    // matches the child components.
    redrawDeck(thisRef);

    // Execute deferred callbacks
    const {viewStateUpdateRequested, interactionStateUpdateRequested} = thisRef;
    if (viewStateUpdateRequested) {
      handleViewStateChange(viewStateUpdateRequested);
    }
    if (interactionStateUpdateRequested) {
      handleInteractionStateChange(interactionStateUpdateRequested);
    }
  });

  useImperativeHandle(ref, () => getRefHandles(thisRef), []);

  const currentViewports =
    thisRef.deck && thisRef.deck.isInitialized ? thisRef.deck.getViewports() : undefined;

  const {ContextProvider, width = '100%', height = '100%', id, style} = props;

  const {containerStyle, canvasStyle} = useMemo(
    () => extractStyles({width, height, style}),
    [width, height, style]
  );

  // Props changes may lead to 3 types of updates:
  // 1. Only the WebGL canvas - updated in Deck's render cycle (next animation frame)
  // 2. Only the DOM - updated in React's lifecycle (now)
  // 3. Both the WebGL canvas and the DOM - defer React rerender to next animation frame just
  //    before Deck redraw to ensure perfect synchronization & avoid excessive redraw
  //    This is because multiple changes may happen to Deck between two frames e.g. transition
  if (
    (!thisRef.viewStateUpdateRequested && thisRef.lastRenderedViewports === currentViewports) || // case 2
    thisRef.version !== version // case 3 just before deck redraws
  ) {
    thisRef.lastRenderedViewports = currentViewports;
    thisRef.version = version;

    // Render the background elements (typically react-map-gl instances)
    // using the view descriptors
    const childrenUnderViews = positionChildrenUnderViews({
      children: jsxProps.children,
      deck: thisRef.deck,
      ContextProvider
    });

    const canvas = createElement('canvas', {
      key: 'canvas',
      id: id || 'deckgl-overlay',
      ref: canvasRef,
      style: canvasStyle
    });

    const eventRoot = createElement(
      'div',
      {
        key: 'deck-events-root',
        className: 'deck-events-root',
        style: {width, height}
      },
      [canvas, childrenUnderViews]
    );

    const widgetRoot = createElement('div', {
      key: 'deck-widgets-root',
      className: 'deck-widgets-root'
    });

    // Render deck.gl as the last child
    thisRef.control = createElement(
      'div',
      {id: `${id || 'deckgl'}-wrapper`, ref: containerRef, style: containerStyle},
      [eventRoot, widgetRoot]
    );
  }

  inRender = false;
  return thisRef.control;
}

const DeckGL = React.forwardRef(DeckGLWithRef) as <ViewsT extends ViewOrViews>(
  props: DeckGLProps<ViewsT>
) => React.ReactElement;

export default DeckGL;

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

function createDeckInstance<ViewsT extends ViewOrViews>(
  thisRef: DeckInstanceRef<ViewsT>,
  DeckClass: typeof Deck,
  props: DeckProps<ViewsT>
): Deck<ViewsT> {
  const deck = new DeckClass({
    ...props,
    // The Deck's animation loop is independent from React's render cycle, causing potential
    // synchronization issues. We provide this custom render function to make sure that React
    // and Deck update on the same schedule.
    _customRender: redrawReason => {
      // Save the dirty flag for later
      thisRef.redrawReason = redrawReason;

      // Viewport/view state is passed to child components as props.
      // If they have changed, we need to trigger a React rerender to update children props.
      const viewports = deck.getViewports();
      if (thisRef.lastRenderedViewports !== viewports) {
        // Viewports have changed, update children props first.
        // This will delay the Deck canvas redraw till after React update (in useLayoutEffect)
        // so that the canvas does not get rendered before the child components update.
        thisRef.forceUpdate();
      } else {
        redrawDeck(thisRef);
      }
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
      views: jsxProps.views as ViewsT,
      onViewStateChange: handleViewStateChange,
      onInteractionStateChange: handleInteractionStateChange
    };

    // The defaultValue for _customRender is null, which would overwrite the definition
    // of _customRender. Remove to avoid frequently redeclaring the method here.
    delete forwardProps._customRender;

    if (thisRef.deck) {
      thisRef.deck.setProps(forwardProps);
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

    return () => thisRef.deck?.finalize();
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

    // Render deck.gl as the last child
    thisRef.control = createElement(
      'div',
      {id: `${id || 'deckgl'}-wrapper`, ref: containerRef, style: containerStyle},
      [canvas, childrenUnderViews]
    );
  }

  inRender = false;
  return thisRef.control;
}

const DeckGL = React.forwardRef(DeckGLWithRef) as <ViewsT extends ViewOrViews>(
  props: DeckGLProps<ViewsT>
) => React.ReactElement;

export default DeckGL;

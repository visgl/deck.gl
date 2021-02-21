// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {
  createElement,
  useRef,
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import PropTypes from 'prop-types';
import {Deck} from '@deck.gl/core';
import useIsomorphicLayoutEffect from './utils/use-isomorphic-layout-effect';

import extractJSXLayers from './utils/extract-jsx-layers';
import positionChildrenUnderViews from './utils/position-children-under-views';
import extractStyles from './utils/extract-styles';

/* eslint-disable max-statements, accessor-pairs */

function getRefHandles(thisRef) {
  const handles = {
    pickObject: opts => thisRef.deck.pickObject(opts),
    pickMultipleObjects: opts => thisRef.deck.pickMultipleObjects(opts),
    pickObjects: opts => thisRef.deck.pickObjects(opts)
  };
  Object.defineProperty(handles, 'deck', {
    get: () => thisRef.deck
  });
  return handles;
}

function redrawDeck(thisRef) {
  if (thisRef.redrawReason) {
    // Only redraw if we have received a dirty flag
    thisRef.deck._drawLayers(thisRef.redrawReason);
    thisRef.redrawReason = null;
  }
}

function createDeckInstance(thisRef, props) {
  // Allows a subclass of Deck to be used
  // TODO - update propTypes / defaultProps?
  const DeckClass = props.Deck || Deck;
  const deck = new DeckClass({
    ...props,
    style: null,
    width: '100%',
    height: '100%',
    // The Deck's animation loop is independent from React's render cycle, causing potential
    // synchronization issues. We provide this custom render function to make sure that React
    // and Deck update on the same schedule.
    _customRender: redrawReason => {
      // Save the dirty flag for later
      thisRef.redrawReason = redrawReason;

      // Viewport/view state is passed to child components as props.
      // If they have changed, we need to trigger a React rerender to update children props.
      const viewports = deck.viewManager.getViewports();
      if (thisRef.lastRenderedViewports !== viewports) {
        // Viewports have changed, update children props first.
        // This will delay the Deck canvas redraw till after React update (in useLayoutEffect)
        // so that the canvas does not get rendered before the child components update.
        thisRef.forceUpdate(v => v + 1);
      } else {
        redrawDeck(thisRef);
      }
    }
  });
  return deck;
}

const DeckGL = forwardRef((props, ref) => {
  // A reference to persistent states
  const _thisRef = useRef({});
  const thisRef = _thisRef.current;
  // A mechanism to force redraw
  const [, setVersion] = useState(0);
  thisRef.forceUpdate = setVersion;
  // DOM refs
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // extract any deck.gl layers masquerading as react elements from props.children
  const jsxProps = useMemo(() => extractJSXLayers(props), [
    props.layers,
    props.views,
    props.children
  ]);

  // Callbacks
  let inRender = true;

  const handleViewStateChange = params => {
    if (inRender && props.viewState) {
      // Callback may invoke a state update. Defer callback to after render() to avoid React error
      // In React StrictMode, render is executed twice and useEffect/useLayoutEffect is executed once
      // Store deferred parameters in ref so that we can access it in another render
      thisRef.viewStateUpdateRequested = params;
      return null;
    }
    thisRef.viewStateUpdateRequested = null;
    return props.onViewStateChange(params);
  };

  const handleInteractionStateChange = params => {
    if (inRender) {
      // Callback may invoke a state update. Defer callback to after render() to avoid React error
      // In React StrictMode, render is executed twice and useEffect/useLayoutEffect is executed once
      // Store deferred parameters in ref so that we can access it in another render
      thisRef.interactionStateUpdateRequested = params;
    } else {
      thisRef.interactionStateUpdateRequested = null;
      props.onInteractionStateChange(params);
    }
  };

  // Update Deck's props. If Deck needs redraw, this will trigger a call to `_customRender` in
  // the next animation frame.
  // Needs to be called both from initial mount, and when new props are received
  const updateFromProps = () => {
    if (!thisRef.deck) {
      return;
    }
    const deckProps = {
      ...props,
      // Override user styling props. We will set the canvas style in render()
      style: null,
      width: '100%',
      height: '100%',
      layers: jsxProps.layers,
      views: jsxProps.views,
      onViewStateChange: handleViewStateChange,
      onInteractionStateChange: handleInteractionStateChange
    };

    thisRef.deck.setProps(deckProps);
  };

  useEffect(() => {
    thisRef.deck = createDeckInstance(thisRef, {
      ...props,
      parent: containerRef.current,
      canvas: canvasRef.current
    });
    updateFromProps();

    return () => thisRef.deck.finalize();
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

  updateFromProps();

  const {viewManager} = thisRef.deck || {};
  const currentViewports = viewManager && viewManager.getViewports();

  const {ContextProvider, width, height, style} = props;

  const {containerStyle, canvasStyle} = useMemo(() => extractStyles({width, height, style}), [
    width,
    height,
    style
  ]);

  // Props changes may lead to 3 types of updates:
  // 1. Only the WebGL canvas - updated in Deck's render cycle (next animation frame)
  // 2. Only the DOM - updated in React's lifecycle (now)
  // 3. Both the WebGL canvas and the DOM - defer React rerender to next animation frame just
  //    before Deck redraw to ensure perfect synchronization & avoid excessive redraw
  //    This is because multiple changes may happen to Deck between two frames e.g. transition
  if (
    !thisRef.control || // initial mount
    (!thisRef.viewStateUpdateRequested && thisRef.lastRenderedViewports === currentViewports) || // case 2
    thisRef.redrawReason // case 3 just before deck redraws
  ) {
    thisRef.lastRenderedViewports = currentViewports;

    // Render the background elements (typically react-map-gl instances)
    // using the view descriptors
    const childrenUnderViews = positionChildrenUnderViews({
      children: jsxProps.children,
      deck: thisRef.deck,
      ContextProvider
    });

    const canvas = createElement('canvas', {
      key: 'canvas',
      ref: canvasRef,
      style: canvasStyle
    });

    // Render deck.gl as the last child
    thisRef.control = createElement(
      'div',
      {id: 'deckgl-wrapper', ref: containerRef, style: containerStyle},
      [canvas, childrenUnderViews]
    );
  }

  inRender = false;
  return thisRef.control;
});

DeckGL.propTypes = Deck.getPropTypes(PropTypes);
DeckGL.defaultProps = Deck.defaultProps;

export default DeckGL;

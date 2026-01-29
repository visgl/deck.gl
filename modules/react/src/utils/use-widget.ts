// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useContext, useRef, useEffect} from 'react';
import {DeckGlContext} from './deckgl-context';
import {log, Widget, type WidgetProps, _deepEqual as deepEqual} from '@deck.gl/core';

export function useWidget<WidgetT extends Widget, WidgetPropsT extends WidgetProps>(
  WidgetClass: {new (props_: WidgetPropsT): WidgetT},
  props: WidgetPropsT
): WidgetT {
  const context = useContext(DeckGlContext);
  const {widgets, deck} = context;

  // Use ref for stable widget instance across StrictMode double-renders
  const widgetRef = useRef<WidgetT | null>(null);
  if (!widgetRef.current) {
    widgetRef.current = new WidgetClass(props);
  }
  const widget = widgetRef.current;

  // Update props on every render
  widget.setProps(props);

  useEffect(() => {
    // Register widget in effect (not during render) for proper StrictMode support
    // Check if widget is already in array (handles StrictMode remount after cleanup)
    if (widgets && !widgets.includes(widget)) {
      widgets.push(widget);
    }

    // Sync widgets to deck
    deck?.setProps({widgets: widgets ? [...widgets] : []});

    // Warn if the user supplied a pure-js widget, since it will be ignored
    const internalWidgets = deck?.props.widgets;
    if (widgets?.length && internalWidgets?.length && !deepEqual(internalWidgets, widgets, 1)) {
      log.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }

    return () => {
      // Remove widget from context when it is unmounted
      const index = widgets?.indexOf(widget);
      if (typeof index === 'number' && index !== -1) {
        widgets?.splice(index, 1);
        deck?.setProps({widgets: widgets ? [...widgets] : []});
      }
    };
  }, [widgets, deck, widget]);

  return widget;
}

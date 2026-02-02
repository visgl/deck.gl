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

  // In StrictMode, React unmounts and remounts components to detect side effects.
  // This destroys refs between mount cycles, so we can't rely on widgetRef persisting.
  // Instead, find existing widgets by ID to handle StrictMode's double-mount.
  const widgetRef = useRef<WidgetT | null>(null);

  if (!widgetRef.current) {
    // Check if a widget with this ID already exists (from StrictMode's first mount)
    const existingWidget = widgets?.find(w => w.id === props.id) as WidgetT | undefined;
    if (existingWidget) {
      // Reuse the existing widget instance
      widgetRef.current = existingWidget;
    } else {
      // Create a new widget
      widgetRef.current = new WidgetClass(props);
    }
  }
  const widget = widgetRef.current;

  // Register widget during render for immediate availability (needed for onLoad callbacks)
  // Check by ID to prevent duplicates in StrictMode where refs are recreated
  const existingInArray = widgets?.find(w => w.id === widget.id);
  if (widgets && !existingInArray) {
    widgets.push(widget);
  }

  // Update props on every render
  widget.setProps(props);

  useEffect(() => {
    // Re-register widget if cleanup removed it (handles StrictMode remount after cleanup)
    if (widgets && !widgets.includes(widget)) {
      widgets.push(widget);
    }

    // Warn if the user supplied a pure-js widget, since it will be ignored
    // Check BEFORE setProps so we can compare the user's widgets with our React widgets
    const internalWidgets = deck?.props.widgets;
    if (widgets?.length && internalWidgets?.length && !deepEqual(internalWidgets, widgets, 1)) {
      log.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }

    // Sync widgets to deck
    deck?.setProps({widgets: widgets ? [...widgets] : []});

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

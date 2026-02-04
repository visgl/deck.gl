// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useContext, useRef, useEffect} from 'react';
import {DeckGlContext} from './deckgl-context';
import {log, Widget, type WidgetProps} from '@deck.gl/core';

// Track pending removals by widget ID so they can be cancelled on remount
const pendingRemovals = new Map<string, ReturnType<typeof setTimeout>>();

export function useWidget<WidgetT extends Widget, WidgetPropsT extends WidgetProps>(
  WidgetClass: {new (props_: WidgetPropsT): WidgetT} & {defaultProps?: {id?: string}},
  props: WidgetPropsT
): WidgetT {
  const context = useContext(DeckGlContext);
  const {widgets, deck} = context;

  // In StrictMode, React unmounts and remounts components to detect side effects.
  // This destroys refs between mount cycles, so we can't rely on widgetRef persisting.
  // Instead, find existing widgets by ID to handle StrictMode's double-mount.
  const widgetRef = useRef<WidgetT | null>(null);

  // Determine the widget ID: use props.id if provided, otherwise fall back to the class default
  const widgetId = props.id ?? WidgetClass.defaultProps?.id;

  if (!widgetRef.current) {
    // Check if a widget with this ID already exists (from StrictMode's first mount)
    const existingWidget = widgetId
      ? (widgets?.find(w => w.id === widgetId) as WidgetT | undefined)
      : undefined;
    if (existingWidget) {
      // Reuse the existing widget instance
      widgetRef.current = existingWidget;
    } else {
      // Create a new widget
      widgetRef.current = new WidgetClass(props);
    }
  }
  const widget = widgetRef.current;

  // Cancel any pending removal for this widget (handles StrictMode remount)
  const pendingRemoval = pendingRemovals.get(widget.id);
  if (pendingRemoval) {
    clearTimeout(pendingRemoval);
    pendingRemovals.delete(widget.id);
  }

  // Register widget during render for immediate availability (needed for onLoad callbacks)
  // Check by ID to prevent duplicates in StrictMode where refs are recreated
  const existingInArray = widgets?.find(w => w.id === widget.id);
  if (widgets && !existingInArray) {
    widgets.push(widget);
  }

  // Update props on every render
  widget.setProps(props);

  useEffect(() => {
    // Cancel any pending removal for this widget (handles StrictMode effect remount).
    // This must be in useEffect because StrictMode re-runs effects without re-rendering,
    // so the render-phase cancellation won't run between cleanup and effect re-run.
    const pendingRemovalInEffect = pendingRemovals.get(widget.id);
    if (pendingRemovalInEffect) {
      clearTimeout(pendingRemovalInEffect);
      pendingRemovals.delete(widget.id);
    }

    // Re-register widget if cleanup removed it (handles StrictMode remount after cleanup)
    if (widgets && !widgets.includes(widget)) {
      widgets.push(widget);
    }

    // Warn if the user supplied a pure-js widget via the widgets prop, since it will be ignored.
    // Only warn if there are widgets in deck.props.widgets that aren't in our managed array.
    // This avoids false positives from normal React sync timing differences.
    const internalWidgets = deck?.props.widgets;
    const hasUserSuppliedWidgets = internalWidgets?.some(w => !widgets?.includes(w));
    if (widgets?.length && hasUserSuppliedWidgets) {
      log.warn('"widgets" prop will be ignored because React widgets are in use.')();
    }

    // Sync widgets to deck
    deck?.setProps({widgets: widgets ? [...widgets] : []});

    return () => {
      // Defer widget removal to allow StrictMode remount to cancel it.
      // In StrictMode, React unmounts and remounts effects to detect side effects.
      // If we remove immediately, the remounted component can't find the widget.
      // By deferring, we give the remount a chance to cancel the removal.
      const id = widget.id;
      const timeoutId = setTimeout(() => {
        pendingRemovals.delete(id);
        const index = widgets?.findIndex(w => w.id === id);
        if (typeof index === 'number' && index !== -1) {
          widgets?.splice(index, 1);
          deck?.setProps({widgets: widgets ? [...widgets] : []});
        }
      }, 0);
      pendingRemovals.set(id, timeoutId);
    };
  }, [widgets, deck, widget]);

  return widget;
}

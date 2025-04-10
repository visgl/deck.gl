
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';
import type {WidgetManager, WidgetPlacement} from './widget-manager';

export interface Widget<PropsT = any> {
  /** Unique identifier of the widget. */
  id: string;
  /** Widget prop types. */
  props: PropsT;
  /**
   * The view id that this widget is being attached to. Default `null`.
   * If assigned, this widget will only respond to events occurred inside the specific view that matches this id.
   */
  viewId?: string | null;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;

  // Populated by core when mounted
  _element?: HTMLDivElement | null;

  // Lifecycle hooks
  /** Called when the widget is added to a Deck instance.
   * @returns an optional UI element that should be appended to the Deck container */
  onAdd: (params: {
    /** The Deck instance that the widget is attached to */
    deck: Deck<any>;
    /** The id of the view that the widget is attached to */
    viewId: string | null;
  }) => HTMLDivElement | null;
  /** Called when the widget is removed */
  onRemove?: () => void;
  /** Called to update widget options */
  setProps: (props: Partial<PropsT>) => void;

  // Optional event hooks
  /** Called when the containing view is changed */
  onViewportChange?: (viewport: Viewport) => void;
  /** Called when the containing view is redrawn */
  onRedraw?: (params: {viewports: Viewport[]; layers: Layer[]}) => void;
  /** Called when a hover event occurs */
  onHover?: (info: PickingInfo, event: MjolnirPointerEvent) => void;
  /** Called when a click event occurs */
  onClick?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a drag event occurs */
  onDrag?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a dragstart event occurs */
  onDragStart?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a dragend event occurs */
  onDragEnd?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
}

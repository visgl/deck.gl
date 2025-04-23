// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';
import type {WidgetManager, WidgetPlacement} from './widget-manager';
import {deepEqual} from '../utils/deep-equal';
import {applyStyles, removeStyles} from '../utils/apply-styles';
import {default as LinearInterpolator} from '../transitions/linear-interpolator';
import {default as FlyToInterpolator} from '../transitions/fly-to-interpolator';

/** @todo - is the the best we can do? deck.gl does not seem to export a union type */
type ViewState = Record<string, unknown>;


export type WidgetProps = {
  id?: string;
  /** CSS inline style overrides. */
  style?: Partial<CSSStyleDeclaration>;
  /** Additional CSS class. */
  className?: string;
};

export abstract class Widget<PropsT extends WidgetProps = WidgetProps> {
  static defaultProps: Required<WidgetProps> = {
    id: 'widget',
    style: {},
    className: ''
  };

  /** Unique identifier of the widget. */
  id: string;
  /** Widget props, with defaults applied */
  props: Required<PropsT>;
  /**
   * The view id that this widget is being attached to. Default `null`.
   * If assigned, this widget will only respond to events occurred inside the specific view that matches this id.
   */
  viewId?: string | null = null;

  /** Widget positioning within the view. Default 'top-left'. */
  abstract placement: WidgetPlacement;
  /** Class name for this widget */
  abstract className: string;

  // Populated by core when mounted
  widgetManager?: WidgetManager;
  deck?: Deck<any>;
  rootElement?: HTMLDivElement | null;

  constructor(props: PropsT, defaultProps: Required<PropsT>) {
    this.props = {...defaultProps, ...props};
    // @ts-expect-error TODO(ib) - why is id considered optional even though we use Required<>
    this.id = this.props.id;
  }

  /** Called to update widget options */
  setProps(props: Partial<PropsT>): void {
    const oldProps = this.props;
    const el = this.rootElement;

    // Update className and style
    if (el && oldProps.className !== props.className) {
      if (oldProps.className) el.classList.remove(oldProps.className);
      if (props.className) el.classList.add(props.className);
    }

    // Update style
    if (el && !deepEqual(oldProps.style, props.style, 1)) {
      removeStyles(el, oldProps.style);
      applyStyles(el, props.style);
    }

    Object.assign(this.props, props);

    // Update the HTML to match the new props
    this.updateHTML();
  }

  /** Update the HTML to reflect latest props and state */
  updateHTML(): void {
    if (this.rootElement) {
      this.onRenderHTML(this.rootElement);
    }
  }

  // WIDGET LIFECYCLE

  /**
   * Called to create the root DOM element for this widget
   * Configures the top-level styles and adds basic class names for theming
   * @returns an optional UI element that should be appended to the Deck container
   */
  onCreateRootElement(): HTMLDivElement {
    const CLASS_NAMES = [
      // Add class names for theming
      'deck-widget',
      this.className,
      // plus any app-supplied class name
      this.props.className
    ];

    const element = document.createElement('div');
    CLASS_NAMES.filter((cls): cls is string => typeof cls === 'string' && cls.length > 0).forEach(
      className => element.classList.add(className)
    );
    applyStyles(element, this.props.style);
    return element;
  }

  /** Called to render HTML into the root element */
  abstract onRenderHTML(rootElement: HTMLElement): void;

  /** Called after the widget is added to a Deck instance and the DOM rootElement has been created */
  onAdd(params: {
    /** The Deck instance that the widget is attached to */
    deck: Deck<any>;
    /** The id of the view that the widget is attached to */
    viewId: string | null;
  }) {}

  /** Called when the widget is removed */
  onRemove(): void {}

  // DECK INTEGRATION - EVENT HOOKS

  /** Called when the containing view is changed */
  onViewportChange(viewport: Viewport): void {}
  /** Called when the containing view is redrawn */
  onRedraw(params: {viewports: Viewport[]; layers: Layer[]}): void {}
  /** Called when a hover event occurs */
  onHover(info: PickingInfo, event: MjolnirPointerEvent): void {}
  /** Called when a click event occurs */
  onClick(info: PickingInfo, event: MjolnirGestureEvent): void {}
  /** Called when a drag event occurs */
  onDrag(info: PickingInfo, event: MjolnirGestureEvent): void {}
  /** Called when a dragstart event occurs */
  onDragStart(info: PickingInfo, event: MjolnirGestureEvent): void {}
  /** Called when a dragend event occurs */
  onDragEnd(info: PickingInfo, event: MjolnirGestureEvent): void {}

  // DECK INTEGRATION - OPERATIONS

  /** 
   * Lets the widget update viewState for a view, optionally with transitions
   * @note this code abuses protected methods and should be refactored, 
   * but does work for now until we have a cleaner solutions.
   */
  setViewState({
    viewState,
    viewId = (viewState?.id as string) || 'default-view',
    transitionDuration = 0,
  }: {
    viewState: ViewState,
    viewId?: string, 
    transitionDuration?: number
  }) {
    // @ts-expect-error viewManager is protected
    const viewport = this.deck?.viewManager?.getViewport(viewId) || {};
    
    // HACK - mising viewport and view state
    const nextViewState: ViewState = {
      ...viewport,
      ...viewState
    };
    if (transitionDuration > 0) {
      nextViewState.transitionDuration = transitionDuration;
      nextViewState.transitionInterpolator =
        'latitude' in nextViewState ? new FlyToInterpolator() : new LinearInterpolator();
    }

    // @ts-expect-error Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }
}

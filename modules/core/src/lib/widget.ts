// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';
import type {WidgetManager, WidgetPlacement} from './widget-manager';
import type {ViewOrViews} from './view-manager';
import {deepEqual} from '../utils/deep-equal';
import {applyStyles, removeStyles} from '../utils/apply-styles';

export type WidgetProps = {
  id?: string;
  /** CSS inline style overrides. */
  style?: Partial<CSSStyleDeclaration>;
  /** Additional CSS class. */
  className?: string;
  /**
   * The container that this widget is being attached to. Default to `viewId`.
   * If set to `'root'`, the widget is placed relative to the whole deck.gl canvas.
   * If set to a valid view id, the widget is placed relative to that view.
   * If set to a HTMLElement, `placement` is ignored and the widget is appended into the given element.
   */
  _container?: string | HTMLDivElement | null;
};

export abstract class Widget<
  PropsT extends WidgetProps = WidgetProps,
  ViewsT extends ViewOrViews = null
> {
  static defaultProps: Required<WidgetProps> = {
    id: 'widget',
    style: {},
    _container: null,
    className: ''
  };

  /** Unique identifier of the widget. */
  id: string;
  /** Widget props, with defaults applied */
  props: Required<PropsT>;
  /**
   * The view id that this widget controls. Default `null`.
   * If assigned, this widget will only respond to events occurred inside the specific view that matches this id.
   */
  viewId?: string | null = null;

  /** Widget positioning within the view. Default 'top-left'. */
  abstract placement: WidgetPlacement;
  /** Class name for this widget */
  abstract className: string;

  // Populated by core when mounted
  widgetManager?: WidgetManager;
  deck?: Deck<ViewsT>;
  rootElement?: HTMLDivElement | null;

  constructor(props: PropsT) {
    this.props = {
      // @ts-expect-error `defaultProps` may not exist on constructor
      ...(this.constructor.defaultProps as Required<PropsT>),
      ...props
    };
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

  // @note empty method calls have an overhead in V8 but it is very low, ~1ns

  /**
   * Common utility to create the root DOM element for this widget
   * Configures the top-level styles and adds basic class names for theming
   * @returns an UI element that should be appended to the Deck container
   */
  protected onCreateRootElement(): HTMLDivElement {
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

  // WIDGET LIFECYCLE

  /** Called to render HTML into the root element */
  abstract onRenderHTML(rootElement: HTMLElement): void;

  /** Internal API called by Deck when the widget is first added to a Deck instance */
  _onAdd(params: {deck: Deck<any>; viewId: string | null}): HTMLDivElement {
    return this.onAdd(params) ?? this.onCreateRootElement();
  }

  /** Overridable by subclass - called when the widget is first added to a Deck instance
   * @returns an optional UI element that should be appended to the Deck container
   */
  onAdd(params: {
    /** The Deck instance that the widget is attached to */
    deck: Deck<any>;
    /** The id of the view that the widget is attached to */
    viewId: string | null;
  }): HTMLDivElement | void {}

  /** Called when the widget is removed */
  onRemove(): void {}

  // deck integration - Event hooks

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
}

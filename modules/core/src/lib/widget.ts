// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Component from '../lifecycle/component';
import type {StatefulComponentProps} from '../lifecycle/component';
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
   * Selects the DOM container used for this widget. Defaults to `viewId`.
   * Deck-managed containers stay under one shared widget root. If set to `'root'`, the
   * widget is placed relative to that root. If set to a valid view id, the widget is placed
   * relative to that view, including its presentation-canvas offset in multi-canvas mode.
   * If set to an HTMLElement, `placement` is ignored and the widget is appended into the
   * given element.
   */
  _container?: string | HTMLDivElement | null;
};

export abstract class Widget<
  PropsT extends WidgetProps = WidgetProps,
  ViewsT extends ViewOrViews = null
> extends Component<Required<PropsT>> {
  static componentName = 'Widget';

  static defaultProps: Required<WidgetProps> = {
    id: 'widget',
    style: {},
    _container: null,
    className: ''
  };

  /** Persistent application state transferred to the next widget with the same id. */
  state: Record<string, any> = {};

  private internalState: {
    component: Widget<PropsT, ViewsT> | null;
    widgetManager?: WidgetManager;
    deck?: Deck<ViewsT>;
    rootElement?: HTMLDivElement | null;
  } = {component: this};

  private replacingProps = false;
  /**
   * The view id that this widget controls and is positioned relative to. Default `null`.
   * If assigned, this widget only responds to events inside the matching view. In multi-canvas
   * mode, the view's `canvasId` determines the positioning offset, but the widget DOM remains
   * under the shared widget root.
   */
  viewId?: string | null = null;

  /** Widget positioning within the view. Default 'top-left'. */
  abstract placement: WidgetPlacement;
  /** Class name for this widget */
  abstract className: string;

  /** Manager that owns this widget's mounted lifecycle. */
  get widgetManager(): WidgetManager | undefined {
    return this.internalState.widgetManager;
  }
  set widgetManager(value: WidgetManager | undefined) {
    this.internalState.widgetManager = value;
  }

  /** Deck instance associated with the mounted widget. */
  get deck(): Deck<ViewsT> | undefined {
    return this.internalState.deck;
  }
  set deck(value: Deck<ViewsT> | undefined) {
    this.internalState.deck = value;
  }

  /** DOM root retained when a matching widget replaces this instance. */
  get rootElement(): HTMLDivElement | null | undefined {
    return this.internalState.rootElement;
  }
  set rootElement(value: HTMLDivElement | null | undefined) {
    this.internalState.rootElement = value;
  }

  constructor(props: PropsT) {
    super(props as Required<PropsT>);
  }

  /** Resolve the active instance from a long-lived callback; null after removal. */
  getCurrentWidget(): this | null {
    return this.internalState.component as this | null;
  }

  /** Merge persistent state and render the active widget. */
  setState(state: Partial<this['state']>): void {
    Object.assign(this.state, state);
    this.getCurrentWidget()?.updateHTML();
  }

  /** Apply a partial options update, replacing rather than mutating the props snapshot. */
  setProps(props: Partial<PropsT>): void {
    const current = this.getCurrentWidget();
    if (current && current !== this) {
      current.setProps(props);
      return;
    }
    if (props.id !== undefined && props.id !== this.id) {
      throw new Error('Widget id cannot be changed with setProps; create a new widget instead');
    }
    const oldProps = this.props;
    const changed = this.replacingProps
      ? this._setProps(props as Required<PropsT>)
      : this._setProps(oldProps, props as Partial<Required<PropsT>>);
    const el = this.rootElement;
    if (el && oldProps.className !== this.props.className) {
      if (oldProps.className) el.classList.remove(oldProps.className);
      if (this.props.className) el.classList.add(this.props.className);
    }
    if (el && !deepEqual(oldProps.style, this.props.style, 1)) {
      removeStyles(el, oldProps.style);
      applyStyles(el, this.props.style);
    }
    if (changed || this.replacingProps) this.updateHTML();
  }

  /** @internal Transfer lifecycle ownership without mounting or removing the DOM. */
  _transferState(oldWidget: Widget): void {
    if (oldWidget === this) return;
    const nextProps = this.props;
    this.state = oldWidget.state;
    this.internalState = oldWidget.internalState as typeof this.internalState;
    this.internalState.component = this;
    this.props = oldWidget.props as StatefulComponentProps<Required<PropsT>>;
    this.replacingProps = true;
    try {
      this.setProps(nextProps);
    } finally {
      this.replacingProps = false;
    }
  }

  /** @internal Release resources once, including for superseded references. */
  _finalize(): void {
    const current = this.getCurrentWidget();
    if (!current) return;
    try {
      current.onRemove();
    } finally {
      this.rootElement?.remove();
      this.rootElement = undefined;
      this.deck = undefined;
      this.widgetManager = undefined;
      this.internalState.component = null;
    }
  }

  /** Update the HTML to reflect latest props and state */
  updateHTML(): void {
    const current = this.getCurrentWidget();
    if (current?.rootElement) {
      current.onRenderHTML(current.rootElement);
    }
  }

  // VIEW STATE HELPERS
  protected get viewIds(): string[] {
    return this.viewId ? [this.viewId] : (this.deck?.getViews().map(v => v.id) ?? []);
  }

  /** Returns the current view state for the given view */
  protected getViewState(viewId: string): Record<string, unknown> {
    // @ts-ignore viewManager is private
    return this.deck?.viewManager?.getViewState(viewId) || {};
  }

  /** Updates the view state for the given view */
  protected setViewState(viewId: string, viewState: Record<string, unknown>): void {
    // @ts-ignore Using private method temporary until there's a public one
    this.deck?._onViewStateChange({viewId, viewState, interactionState: {}});
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
    this.internalState.component = this;
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

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Viewport from '../viewports/viewport';
import {parsePosition, getPosition, Position} from '../utils/positions';
import {deepEqual} from '../utils/deep-equal';
import type Controller from '../controllers/controller';
import type {ControllerOptions} from '../controllers/controller';
import type {TransitionProps} from '../controllers/transition-manager';
import type {Padding} from '../viewports/viewport';
import type {ConstructorOf} from '../types/types';

export type CommonViewState = TransitionProps;

export type CommonViewProps<ViewState> = {
  /** A unique id of the view. In a multi-view use case, this is important for matching view states and place contents into this view. */
  id?: string;
  /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
  x?: number | string;
  /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
  y?: number | string;
  /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
  width?: number | string;
  /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
  height?: number | string;
  /** Padding around the view, expressed in either relative (e.g. `'50%'`) or absolute pixels. Default `null`. */
  padding?: {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
  } | null;
  /** When using multiple views, set this flag to wipe the pixels drawn by other overlaping views */
  clear?: boolean;
  /** State of the view */
  viewState?:
    | string
    | ({
        id?: string;
      } & Partial<ViewState>);
  /** Options for viewport interactivity. */
  controller?:
    | null
    | boolean
    | ConstructorOf<Controller<any>>
    | (ControllerOptions & {
        type?: ConstructorOf<Controller<any>>;
      });
};

export default abstract class View<
  ViewState extends CommonViewState = CommonViewState,
  ViewProps extends CommonViewProps<ViewState> = CommonViewProps<ViewState>
> {
  id: string;
  abstract getViewportType(viewState: ViewState): ConstructorOf<Viewport>;
  protected abstract get ControllerType(): ConstructorOf<Controller<any>>;

  private _x: Position;
  private _y: Position;
  private _width: Position;
  private _height: Position;
  private _padding: {
    left: Position;
    right: Position;
    top: Position;
    bottom: Position;
  } | null;

  readonly props: ViewProps;

  constructor(props: ViewProps) {
    const {id, x = 0, y = 0, width = '100%', height = '100%', padding = null} = props;

    // @ts-ignore
    this.id = id || this.constructor.displayName || 'view';

    this.props = {...props, id: this.id};

    // Extents
    this._x = parsePosition(x);
    this._y = parsePosition(y);
    this._width = parsePosition(width);
    this._height = parsePosition(height);
    this._padding = padding && {
      left: parsePosition(padding.left || 0),
      right: parsePosition(padding.right || 0),
      top: parsePosition(padding.top || 0),
      bottom: parsePosition(padding.bottom || 0)
    };

    // Bind methods for easy access
    this.equals = this.equals.bind(this);

    Object.seal(this);
  }

  equals(view: this): boolean {
    if (this === view) {
      return true;
    }

    // To correctly compare padding use depth=2
    return this.constructor === view.constructor && deepEqual(this.props, view.props, 2);
  }

  /** Make viewport from canvas dimensions and view state */
  makeViewport({width, height, viewState}: {width: number; height: number; viewState: ViewState}) {
    viewState = this.filterViewState(viewState);

    // Resolve relative viewport dimensions
    const viewportDimensions = this.getDimensions({width, height});
    if (!viewportDimensions.height || !viewportDimensions.width) {
      return null;
    }
    const ViewportType = this.getViewportType(viewState);
    return new ViewportType({...viewState, ...this.props, ...viewportDimensions});
  }

  getViewStateId(): string {
    const {viewState} = this.props;
    if (typeof viewState === 'string') {
      // if View.viewState is a string, return it
      return viewState;
    }
    return viewState?.id || this.id;
  }

  // Allows view to override (or completely define) viewState
  filterViewState(viewState: ViewState): ViewState {
    if (this.props.viewState && typeof this.props.viewState === 'object') {
      // If we have specified an id, then intent is to override,
      // If not, completely specify the view state
      if (!this.props.viewState.id) {
        return this.props.viewState as ViewState;
      }

      // Merge in all props from View's viewState, except id
      const newViewState = {...viewState};
      for (const key in this.props.viewState) {
        if (key !== 'id') {
          newViewState[key] = this.props.viewState[key];
        }
      }
      return newViewState;
    }

    return viewState;
  }

  /** Resolve the dimensions of the view from overall canvas dimensions */
  getDimensions({width, height}: {width: number; height: number}): {
    x: number;
    y: number;
    width: number;
    height: number;
    padding?: Padding;
  } {
    const dimensions: {
      x: number;
      y: number;
      width: number;
      height: number;
      padding?: Padding;
    } = {
      x: getPosition(this._x, width),
      y: getPosition(this._y, height),
      width: getPosition(this._width, width),
      height: getPosition(this._height, height)
    };

    if (this._padding) {
      dimensions.padding = {
        left: getPosition(this._padding.left, width),
        top: getPosition(this._padding.top, height),
        right: getPosition(this._padding.right, width),
        bottom: getPosition(this._padding.bottom, height)
      };
    }
    return dimensions;
  }

  // Used by sub classes to resolve controller props
  get controller(): (ControllerOptions & {type: ConstructorOf<Controller<any>>}) | null {
    const opts = this.props.controller;

    if (!opts) {
      return null;
    }
    if (opts === true) {
      return {type: this.ControllerType};
    }
    if (typeof opts === 'function') {
      return {type: opts};
    }
    return {type: this.ControllerType, ...opts};
  }
}

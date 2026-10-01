// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Viewport from '../viewports/viewport';

/** Determines how a controller state resolves constraint violations. */
export type ConstraintMode = 'hard' | 'elastic' | 'rebound' | 'preserve';

/** Supplies constraint policy without identifying the action or input source. */
export type ConstraintContext = {
  mode: ConstraintMode;
};

/** Carries a zoom anchor until constraints have selected the displayed scale. */
export const CONSTRAINT_AROUND = Symbol('constraintAround');

export type ConstraintAround = {
  [CONSTRAINT_AROUND]?: {
    position: [number, number] | [number, number, number];
    screenPosition: [number, number];
  };
};

export default abstract class ViewState<
  T,
  Props extends Record<string, any>,
  State extends Record<string, any>
> implements IViewState<T>
{
  private _viewportProps: Required<Props>;
  private _state: State;

  makeViewport: (props: Record<string, any>) => Viewport;

  constructor(
    props: Required<Props>,
    state: State,
    makeViewport: (props: Record<string, any>) => Viewport,
    constraintContext?: ConstraintContext
  ) {
    this.makeViewport = makeViewport;
    this._viewportProps = this.applyConstraints(props, constraintContext);
    this._state = state;
  }

  getViewportProps(): Required<Props> {
    return this._viewportProps;
  }

  getState(): State {
    return this._state;
  }

  abstract applyConstraints(
    props: Required<Props>,
    constraintContext?: ConstraintContext
  ): Required<Props>;

  abstract shortestPathFrom(viewState: T): Props;

  abstract panStart(params: {pos: [number, number]}, constraintContext?: ConstraintContext): T;
  abstract pan(
    {pos, startPos}: {pos: [number, number]; startPos?: [number, number]},
    constraintContext?: ConstraintContext
  ): T;
  abstract panEnd(constraintContext?: ConstraintContext): T;

  abstract rotateStart(
    params: {pos: [number, number]; altitude?: number},
    constraintContext?: ConstraintContext
  ): T;
  abstract rotate(
    params: {pos?: [number, number]; deltaAngleX?: number; deltaAngleY: number},
    constraintContext?: ConstraintContext
  ): T;
  abstract rotateEnd(constraintContext?: ConstraintContext): T;

  abstract zoomStart({pos}: {pos: [number, number]}, constraintContext?: ConstraintContext): T;
  abstract zoom(
    {
      pos,
      startPos,
      scale
    }: {
      pos: [number, number];
      startPos?: [number, number];
      scale: number;
    },
    constraintContext?: ConstraintContext
  ): T;
  abstract zoomEnd(constraintContext?: ConstraintContext): T;

  abstract zoomIn(speed?: number, constraintContext?: ConstraintContext): T;
  abstract zoomOut(speed?: number, constraintContext?: ConstraintContext): T;

  abstract moveLeft(speed?: number, constraintContext?: ConstraintContext): T;
  abstract moveRight(speed?: number, constraintContext?: ConstraintContext): T;
  abstract moveUp(speed?: number, constraintContext?: ConstraintContext): T;
  abstract moveDown(speed?: number, constraintContext?: ConstraintContext): T;

  abstract rotateLeft(speed?: number, constraintContext?: ConstraintContext): T;
  abstract rotateRight(speed?: number, constraintContext?: ConstraintContext): T;
  abstract rotateUp(speed?: number, constraintContext?: ConstraintContext): T;
  abstract rotateDown(speed?: number, constraintContext?: ConstraintContext): T;
}

export interface IViewState<T> {
  makeViewport?: (props: Record<string, any>) => Viewport;

  getViewportProps(): Record<string, any>;

  getState(): Record<string, any>;

  shortestPathFrom(viewState: T): Record<string, any>;

  panStart(params: {pos: [number, number]}, constraintContext?: ConstraintContext): T;
  pan(
    {pos, startPos}: {pos: [number, number]; startPos?: [number, number]},
    constraintContext?: ConstraintContext
  ): T;
  panEnd(constraintContext?: ConstraintContext): T;

  rotateStart(
    params: {pos: [number, number]; altitude?: number},
    constraintContext?: ConstraintContext
  ): T;
  rotate(
    params: {pos?: [number, number]; deltaAngleX?: number; deltaAngleY?: number},
    constraintContext?: ConstraintContext
  ): T;
  rotateEnd(constraintContext?: ConstraintContext): T;

  zoomStart({pos}: {pos: [number, number]}, constraintContext?: ConstraintContext): T;
  zoom(
    {
      pos,
      startPos,
      scale
    }: {
      pos: [number, number];
      startPos?: [number, number];
      scale: number;
    },
    constraintContext?: ConstraintContext
  ): T;
  zoomEnd(constraintContext?: ConstraintContext): T;

  zoomIn(speed?: number, constraintContext?: ConstraintContext): T;
  zoomOut(speed?: number, constraintContext?: ConstraintContext): T;

  moveLeft(speed?: number, constraintContext?: ConstraintContext): T;
  moveRight(speed?: number, constraintContext?: ConstraintContext): T;
  moveUp(speed?: number, constraintContext?: ConstraintContext): T;
  moveDown(speed?: number, constraintContext?: ConstraintContext): T;

  rotateLeft(speed?: number, constraintContext?: ConstraintContext): T;
  rotateRight(speed?: number, constraintContext?: ConstraintContext): T;
  rotateUp(speed?: number, constraintContext?: ConstraintContext): T;
  rotateDown(speed?: number, constraintContext?: ConstraintContext): T;
}

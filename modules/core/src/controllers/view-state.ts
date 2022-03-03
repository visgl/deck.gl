import type Viewport from '../viewports/viewport';

export default abstract class ViewState<T, Props, State> implements IViewState<T> {
  private _viewportProps: Required<Props>;
  private _state: State;

  constructor(props: Required<Props>, state: State) {
    this._viewportProps = this.applyConstraints(props);
    this._state = state;
  }

  getViewportProps(): Required<Props> {
    return this._viewportProps;
  }

  getState(): State {
    return this._state;
  }

  abstract applyConstraints(props: Required<Props>): Required<Props>;

  abstract shortestPathFrom(viewState: T): Props;

  abstract panStart(params: {pos: [number, number]}): T;
  abstract pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): T;
  abstract panEnd(): T;

  abstract rotateStart(params: {pos: [number, number]}): T;
  abstract rotate(params: {pos?: [number, number]; deltaAngleX?: number; deltaAngleY: number}): T;
  abstract rotateEnd(): T;

  abstract zoomStart({pos}: {pos: [number, number]}): T;
  abstract zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): T;
  abstract zoomEnd(): T;

  abstract zoomIn(speed?: number): T;
  abstract zoomOut(speed?: number): T;

  abstract moveLeft(speed?: number): T;
  abstract moveRight(speed?: number): T;
  abstract moveUp(speed?: number): T;
  abstract moveDown(speed?: number): T;

  abstract rotateLeft(speed?: number): T;
  abstract rotateRight(speed?: number): T;
  abstract rotateUp(speed?: number): T;
  abstract rotateDown(speed?: number): T;
}

export interface IViewState<T> {
  makeViewport?: (props: Record<string, any>) => Viewport;

  getViewportProps(): Record<string, any>;

  getState(): Record<string, any>;

  shortestPathFrom(viewState: T): Record<string, any>;

  panStart(params: {pos: [number, number]}): T;
  pan({pos, startPos}: {pos: [number, number]; startPos?: [number, number]}): T;
  panEnd(): T;

  rotateStart(params: {pos: [number, number]}): T;
  rotate(params: {pos?: [number, number]; deltaAngleX?: number; deltaAngleY?: number}): T;
  rotateEnd(): T;

  zoomStart({pos}: {pos: [number, number]}): T;
  zoom({
    pos,
    startPos,
    scale
  }: {
    pos: [number, number];
    startPos?: [number, number];
    scale: number;
  }): T;
  zoomEnd(): T;

  zoomIn(speed?: number): T;
  zoomOut(speed?: number): T;

  moveLeft(speed?: number): T;
  moveRight(speed?: number): T;
  moveUp(speed?: number): T;
  moveDown(speed?: number): T;

  rotateLeft(speed?: number): T;
  rotateRight(speed?: number): T;
  rotateUp(speed?: number): T;
  rotateDown(speed?: number): T;
}

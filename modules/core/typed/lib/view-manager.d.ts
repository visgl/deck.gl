import type Controller from '../controllers/controller';
import type {ViewStateChangeParameters, InteractionState} from '../controllers/controller';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type {Timeline} from '@luma.gl/engine';
import type {EventManager} from 'mjolnir.js';
export default class ViewManager {
  width: number;
  height: number;
  views: View[];
  viewState: any;
  controllers: {
    [viewId: string]: Controller<any> | null;
  };
  timeline: Timeline;
  private _viewports;
  private _viewportMap;
  private _isUpdating;
  private _needsRedraw;
  private _needsUpdate;
  private _eventManager;
  private _eventCallbacks;
  constructor(props: {
    timeline: Timeline;
    eventManager: EventManager;
    onViewStateChange?: (
      params: ViewStateChangeParameters & {
        viewId: string;
      }
    ) => void;
    onInteractionStateChange?: (state: InteractionState) => void;
    views?: View[];
    viewState?: any;
    width?: number;
    height?: number;
  });
  /** Remove all resources and event listeners */
  finalize(): void;
  /** Check if a redraw is needed */
  needsRedraw(opts?: {
    /** Reset redraw flags to false */
    clearRedrawFlags?: boolean;
  }): string | false;
  /** Mark the manager as dirty. Will rebuild all viewports and update controllers. */
  setNeedsUpdate(reason: string): void;
  /** Checks each viewport for transition updates */
  updateViewStates(): void;
  /** Get a set of viewports for a given width and height
   * TODO - Intention is for deck.gl to autodeduce width and height and drop the need for props
   * @param rect (object, optional) - filter the viewports
   *   + not provided - return all viewports
   *   + {x, y} - only return viewports that contain this pixel
   *   + {x, y, width, height} - only return viewports that overlap with this rectangle
   */
  getViewports(rect?: {x: number; y: number; width?: number; height?: number}): Viewport[];
  /** Get a map of all views */
  getViews(): {
    [viewId: string]: View;
  };
  /** Resolves a viewId string to a View */
  getView(viewId: string): View | undefined;
  /** Returns the viewState for a specific viewId. Matches the viewState by
      1. view.viewStateId
      2. view.id
      3. root viewState
      then applies the view's filter if any */
  getViewState(viewOrViewId: string | View): any;
  getViewport(viewId: string): Viewport | undefined;
  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(
    xyz: number[],
    opts?: {
      topLeft?: boolean;
    }
  ): number[] | null;
  /** Update the manager with new Deck props */
  setProps(props: {views?: View[]; viewState?: any; width?: number; height?: number}): void;
  private _update;
  private _setSize;
  private _setViews;
  private _setViewState;
  private _onViewStateChange;
  private _createController;
  private _updateController;
  private _rebuildViewports;
  _buildViewportMap(): void;
  _diffViews(newViews: View[], oldViews: View[]): boolean;
}
// # sourceMappingURL=view-manager.d.ts.map

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, LinearInterpolator} from '@deck.gl/core';
import type {Viewport, WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';

export type OverviewMapWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'bottom-right'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message. */
  label?: string;
  /** Maximum size of the overview map in pixels. Default 150. */
  maxSize?: number;
  /** Transition duration in ms when navigating. Default 200. */
  transitionDuration?: number;
  /** Interval in ms to refresh the thumbnail. Default 1000. Set to 0 to disable auto-refresh. */
  refreshInterval?: number;
  /** User-provided thumbnail URL. If not provided, auto-captures from canvas. */
  thumbnailUrl?: string;
  /** Source content width for coordinate calculation. Auto-detected if not provided. */
  sourceWidth?: number;
  /** Source content height for coordinate calculation. Auto-detected if not provided. */
  sourceHeight?: number;
  /** Initial collapsed state. Default false. */
  collapsed?: boolean;
};

type ViewportBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type OrthographicViewportLike = Viewport & {
  target?: [number, number, number];
  zoom?: number;
};

type WebMercatorViewportLike = Viewport & {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  getBounds?: () => [number, number, number, number];
};

export class OverviewMapWidget extends Widget<OverviewMapWidgetProps> {
  static defaultProps: Required<OverviewMapWidgetProps> = {
    ...Widget.defaultProps,
    id: 'overview-map',
    placement: 'bottom-right',
    viewId: null,
    label: 'Overview Map',
    maxSize: 150,
    transitionDuration: 200,
    refreshInterval: 1000,
    thumbnailUrl: '',
    sourceWidth: 0,
    sourceHeight: 0,
    collapsed: false
  };

  className = 'deck-widget-overview-map';
  placement: WidgetPlacement = 'bottom-right';

  private viewports: {[id: string]: Viewport} = {};
  private thumbnailDataUrl: string = '';
  private isCollapsed: boolean = false;
  private containerSize = {width: 150, height: 150};
  private viewportBox: ViewportBox | null = null;
  private refreshTimer: number | null = null;
  private lastCaptureTime: number = 0;

  constructor(props: OverviewMapWidgetProps = {}) {
    super(props);
    this.isCollapsed = props.collapsed ?? false;
    this.setProps(this.props);
  }

  setProps(props: Partial<OverviewMapWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    if (props.collapsed !== undefined) {
      this.isCollapsed = props.collapsed;
    }
    super.setProps(props);
  }

  onAdd(): void {
    if (this.props.refreshInterval > 0) {
      this.startRefreshTimer();
    }
  }

  onRemove(): void {
    this.stopRefreshTimer();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {label, thumbnailUrl} = this.props;
    const displayUrl = thumbnailUrl || this.thumbnailDataUrl;

    const ui = this.isCollapsed ? (
      <button
        type="button"
        className="deck-widget-overview-map-toggle"
        onClick={() => this.handleToggle()}
        title={label}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <title>{label}</title>
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </button>
    ) : (
      <div
        className="deck-widget-overview-map-container"
        style={{width: this.containerSize.width, height: this.containerSize.height}}
        onClick={e => this.handleClick(e)}
      >
        <button
          type="button"
          className="deck-widget-overview-map-close"
          onClick={e => {
            e.stopPropagation();
            this.handleToggle();
          }}
          title="Close"
        >
          ✕
        </button>
        {displayUrl && (
          <img
            src={displayUrl}
            alt={label || 'Overview Map'}
            className="deck-widget-overview-map-image"
            draggable={false}
          />
        )}
        {this.viewportBox && (
          <div
            className="deck-widget-overview-map-viewport-box"
            style={{
              left: this.viewportBox.left,
              top: this.viewportBox.top,
              width: this.viewportBox.width,
              height: this.viewportBox.height
            }}
          />
        )}
      </div>
    );

    render(ui, rootElement);
  }

  onViewportChange(viewport: Viewport): void {
    const prevViewport = this.viewports[viewport.id];
    this.viewports[viewport.id] = viewport;

    if (!prevViewport || !viewport.equals(prevViewport)) {
      this.updateContainerSize();
      this.updateViewportBox(viewport);
      this.updateHTML();
    }
  }

  onRedraw(): void {
    if (!this.props.thumbnailUrl && this.props.refreshInterval === 0) {
      this.captureOverview();
    }
  }

  private startRefreshTimer(): void {
    this.stopRefreshTimer();
    this.refreshTimer = window.setInterval(() => {
      this.captureOverview();
    }, this.props.refreshInterval);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private captureOverview(): void {
    if (this.props.thumbnailUrl) return;

    const now = Date.now();
    if (now - this.lastCaptureTime < 100) return;

    const canvas = this.deck?.getCanvas?.();
    if (canvas) {
      this.thumbnailDataUrl = canvas.toDataURL('image/png');
      this.lastCaptureTime = now;
      this.updateHTML();
    }
  }

  private updateContainerSize(): void {
    const {maxSize, sourceWidth, sourceHeight} = this.props;
    const viewport = this.getCurrentViewport();

    const width = sourceWidth || viewport?.width || maxSize;
    const height = sourceHeight || viewport?.height || maxSize;

    const aspectRatio = width / height;

    if (aspectRatio > 1) {
      this.containerSize = {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio)
      };
    } else {
      this.containerSize = {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize
      };
    }
  }

  private updateViewportBox(viewport: Viewport): void {
    const {sourceWidth, sourceHeight} = this.props;
    const contentWidth = sourceWidth || this.deck?.width || 0;
    const contentHeight = sourceHeight || this.deck?.height || 0;

    if (!contentWidth || !contentHeight) {
      this.viewportBox = null;
      return;
    }

    const scaleX = this.containerSize.width / contentWidth;
    const scaleY = this.containerSize.height / contentHeight;

    if ('target' in viewport) {
      this.viewportBox = this.calculateOrthographicBox(viewport, scaleX, scaleY);
    } else if ('latitude' in viewport && 'longitude' in viewport) {
      this.viewportBox = this.calculateMercatorBox(viewport);
    } else {
      this.viewportBox = this.calculateFallbackBox();
    }
  }

  private calculateOrthographicBox(
    viewport: Viewport,
    scaleX: number,
    scaleY: number
  ): ViewportBox {
    const orthoViewport = viewport as OrthographicViewportLike;
    const target = orthoViewport.target || [0, 0, 0];
    const zoom = orthoViewport.zoom || 0;
    const scale = Math.pow(2, zoom);
    const viewportWidth = viewport.width / scale;
    const viewportHeight = viewport.height / scale;
    const left = target[0] - viewportWidth / 2;
    const top = target[1] - viewportHeight / 2;

    return {
      left: Math.max(0, left * scaleX),
      top: Math.max(0, top * scaleY),
      width: Math.min(this.containerSize.width, viewportWidth * scaleX),
      height: Math.min(this.containerSize.height, viewportHeight * scaleY)
    };
  }

  private calculateMercatorBox(viewport: Viewport): ViewportBox | null {
    const mercatorViewport = viewport as WebMercatorViewportLike;
    const bounds = mercatorViewport.getBounds?.();
    if (!bounds) return null;

    const [west, south, east, north] = bounds;
    const normalizedWest = (west + 180) / 360;
    const normalizedEast = (east + 180) / 360;
    const normalizedNorth = (90 - north) / 180;
    const normalizedSouth = (90 - south) / 180;

    return {
      left: normalizedWest * this.containerSize.width,
      top: normalizedNorth * this.containerSize.height,
      width: (normalizedEast - normalizedWest) * this.containerSize.width,
      height: (normalizedSouth - normalizedNorth) * this.containerSize.height
    };
  }

  private calculateFallbackBox(): ViewportBox {
    return {
      left: this.containerSize.width * 0.25,
      top: this.containerSize.height * 0.25,
      width: this.containerSize.width * 0.5,
      height: this.containerSize.height * 0.5
    };
  }

  private getCurrentViewport(): Viewport | undefined {
    const viewId = this.viewId || Object.keys(this.viewports)[0];
    return viewId ? this.viewports[viewId] : undefined;
  }

  private handleClick(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const {sourceWidth, sourceHeight} = this.props;
    const viewport = this.getCurrentViewport();

    const contentWidth = sourceWidth || this.deck?.width || 0;
    const contentHeight = sourceHeight || this.deck?.height || 0;

    if (!contentWidth || !contentHeight || !viewport) return;

    const targetX = (clickX / this.containerSize.width) * contentWidth;
    const targetY = (clickY / this.containerSize.height) * contentHeight;

    this.navigateTo(viewport, targetX, targetY);
  }

  private navigateTo(viewport: Viewport, x: number, y: number): void {
    const viewId = this.viewId || viewport.id || 'default-view';

    if ('target' in viewport) {
      // OrthographicView
      const nextViewState: Record<string, unknown> = {
        ...viewport,
        target: [x, y, 0]
      };
      if (this.props.transitionDuration > 0) {
        nextViewState.transitionDuration = this.props.transitionDuration;
        nextViewState.transitionInterpolator = new LinearInterpolator({
          transitionProps: ['target']
        });
      }
      this.setViewState(viewId, nextViewState);
    } else if ('latitude' in viewport && 'longitude' in viewport) {
      // WebMercatorViewport
      const longitude = (x / this.containerSize.width) * 360 - 180;
      const latitude = 90 - (y / this.containerSize.height) * 180;

      const nextViewState: Record<string, unknown> = {
        ...viewport,
        longitude,
        latitude
      };
      if (this.props.transitionDuration > 0) {
        nextViewState.transitionDuration = this.props.transitionDuration;
        nextViewState.transitionInterpolator = new LinearInterpolator({
          transitionProps: ['longitude', 'latitude']
        });
      }
      this.setViewState(viewId, nextViewState);
    }
  }

  private setViewState(viewId: string, viewState: Record<string, unknown>): void {
    // @ts-ignore Using private method temporary until there's a public one
    this.deck?._onViewStateChange({viewId, viewState, interactionState: {}});
  }

  private handleToggle(): void {
    this.isCollapsed = !this.isCollapsed;
    if (!this.isCollapsed && !this.props.thumbnailUrl) {
      this.captureOverview();
    }
    this.updateHTML();
  }
}

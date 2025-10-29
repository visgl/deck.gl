// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, LinearInterpolator} from '@deck.gl/core';
import type {Viewport, WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';

export type GimbalWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message. */
  label?: string;
  /** Width of gimbal lines. */
  strokeWidth?: number;
  /** Transition duration in ms when resetting rotation. */
  transitionDuration?: number;
};

export class GimbalWidget extends Widget<GimbalWidgetProps> {
  static defaultProps: Required<GimbalWidgetProps> = {
    ...Widget.defaultProps,
    id: 'gimbal',
    placement: 'top-left',
    viewId: null,
    label: 'Gimbal',
    strokeWidth: 1.5,
    transitionDuration: 200
  };

  className = 'deck-widget-gimbal';
  placement: WidgetPlacement = 'top-left';
  viewports: {[id: string]: Viewport} = {};

  constructor(props: GimbalWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<GimbalWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const viewId = this.viewId || Object.values(this.viewports)[0]?.id || 'default-view';
    const widgetViewport = this.viewports[viewId];
    const {rotationOrbit, rotationX} = this.getNormalizedRotation(widgetViewport);
    // Note - we use CSS 3D transforms instead of SVG 2D transforms
    const ui = (
      <div className="deck-widget-button" style={{perspective: 100, pointerEvents: 'auto'}}>
        <button
          type="button"
          onClick={() => {
            for (const viewport of Object.values(this.viewports)) {
              this.resetOrbitView(viewport);
            }
          }}
          title={this.props.label}
          style={{position: 'relative', width: 26, height: 26}}
        >
          {/* Outer ring */}
          <svg
            className="gimbal-outer-ring"
            width="100%"
            height="100%"
            viewBox="0 0 26 26"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `rotateY(${rotationOrbit}deg)`
            }}
          >
            <circle
              cx="13"
              cy="13"
              r="10"
              stroke="var(--icon-gimbal-outer-color, rgb(68, 92, 204))"
              strokeWidth={this.props.strokeWidth}
              fill="none"
            />
          </svg>

          {/* Inner ring */}
          <svg
            className="gimbal-inner-ring"
            width="100%"
            height="100%"
            viewBox="0 0 26 26"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `rotateX(${rotationX}deg)`
            }}
          >
            <circle
              cx="13"
              cy="13"
              r="7"
              stroke="var(--icon-gimbal-inner-color, rgb(240, 92, 68))"
              strokeWidth={this.props.strokeWidth}
              fill="none"
            />
          </svg>
        </button>
      </div>
    );

    render(ui, rootElement);
  }

  onViewportChange(viewport: Viewport) {
    this.viewports[viewport.id] = viewport;
    this.updateHTML();
  }

  resetOrbitView(viewport?: Viewport) {
    const viewId = this.getViewId(viewport);
    const viewState = this.getViewState(viewId);
    if ('rotationOrbit' in viewState || 'rotationX' in viewState) {
      const nextViewState = {
        ...viewState,
        rotationOrbit: 0,
        rotationX: 0,
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new LinearInterpolator({
          transitionProps: ['rotationOrbit', 'rotationX']
        })
      };
      // @ts-ignore Using private method temporary until there's a public one
      this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
    }
  }

  getNormalizedRotation(viewport?: Viewport): {rotationOrbit: number; rotationX: number} {
    const viewState = this.getViewState(this.getViewId(viewport));
    const [rz, rx] = this.getRotation(viewState);
    const rotationOrbit = normalizeAndClampAngle(rz);
    const rotationX = normalizeAndClampAngle(rx);
    return {rotationOrbit, rotationX};
  }

  getRotation(viewState?: any): [number, number] {
    if (viewState && ('rotationOrbit' in viewState || 'rotationX' in viewState)) {
      return [-(viewState.rotationOrbit || 0), viewState.rotationX || 0];
    }
    return [0, 0];
  }

  // Move to Widget/WidgetManager?

  getViewId(viewport?: Viewport) {
    const viewId = this.viewId || viewport?.id || 'OrbitView';
    return viewId;
  }

  getViewState(viewId: string) {
    const viewManager = this.getViewManager();
    const viewState = (viewId && viewManager.getViewState(viewId)) || viewManager.viewState;
    return viewState;
  }

  getViewManager() {
    // @ts-expect-error protected
    const viewManager = this.deck?.viewManager;
    if (!viewManager) {
      throw new Error('wigdet must be added to a deck instance');
    }
    return viewManager;
  }
}

function normalizeAndClampAngle(angle: number): number {
  // Bring angle into [-180, 180]
  let normalized = ((((angle + 180) % 360) + 360) % 360) - 180;

  // Avoid rotating the gimbal rings to close to 90 degrees as they will visually disappear
  const AVOID_ANGLE_DELTA = 10;
  const distanceFrom90 = normalized - 90;
  if (Math.abs(distanceFrom90) < AVOID_ANGLE_DELTA) {
    if (distanceFrom90 < AVOID_ANGLE_DELTA) {
      normalized = 90 + AVOID_ANGLE_DELTA;
    } else if (distanceFrom90 > -AVOID_ANGLE_DELTA) {
      normalized = 90 - AVOID_ANGLE_DELTA;
    }
  }
  // Clamp to [-80, 80]
  return normalized; // Math.max(-80, Math.min(80, normalized));
}

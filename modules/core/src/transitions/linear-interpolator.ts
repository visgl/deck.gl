// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import TransitionInterpolator from './transition-interpolator';
import {lerp} from '@math.gl/core';

import type Viewport from '../viewports/viewport';
import GlobeViewport from '../viewports/globe-viewport';

const DEFAULT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
const DEFAULT_REQUIRED_PROPS = ['longitude', 'latitude', 'zoom'];

type PropsWithAnchor = {
  around?: number[];
  aroundPosition?: number[];
  aroundLngLat?: number[];
  [key: string]: any;
};

/**
 * Performs linear interpolation of two view states.
 */
export default class LinearInterpolator extends TransitionInterpolator {
  opts: {
    around?: number[];
    makeViewport?: (props: Record<string, any>) => Viewport;
  };

  /**
   * @param {Object} opts
   * @param {Array} opts.transitionProps - list of props to apply linear transition to.
   * @param {Array} opts.around - a screen point to zoom/rotate around.
   * @param {Function} opts.makeViewport - construct a viewport instance with given props.
   */
  constructor(
    opts:
      | string[]
      | {
          transitionProps?:
            | string[]
            | {
                compare: string[];
                extract?: string[];
                required?: string[];
              };
          around?: number[];
          makeViewport?: (props: Record<string, any>) => Viewport;
        } = {}
  ) {
    // Backward compatibility
    const transitionProps = Array.isArray(opts) ? opts : opts.transitionProps;

    const normalizedOpts = Array.isArray(opts) ? {} : opts;
    normalizedOpts.transitionProps = Array.isArray(transitionProps)
      ? {
          compare: transitionProps,
          required: transitionProps
        }
      : transitionProps || {
          compare: DEFAULT_PROPS,
          required: DEFAULT_REQUIRED_PROPS
        };

    super(normalizedOpts.transitionProps);
    this.opts = normalizedOpts;
  }

  initializeProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>
  ): {
    start: PropsWithAnchor;
    end: PropsWithAnchor;
  } {
    const result = super.initializeProps(startProps, endProps);

    const {makeViewport, around} = this.opts;

    if (makeViewport && around) {
      const startViewport = makeViewport(startProps);
      if (startViewport instanceof GlobeViewport) {
        // GlobeViewport uses spherical anchoring: unproject the screen point
        // to a lng/lat on the globe and feed that to panByGlobeAnchor each
        // frame. If the click is off-globe, fall through to a plain LERP.
        if (startViewport.isPointOnGlobe(around)) {
          const aroundLngLat = startViewport.unproject(around);
          result.start.around = around;
          Object.assign(result.end, {
            around,
            aroundLngLat,
            width: endProps.width,
            height: endProps.height
          });
        }
      } else {
        const endViewport = makeViewport(endProps);
        const aroundPosition = startViewport.unproject(around);
        result.start.around = around;
        Object.assign(result.end, {
          around: endViewport.project(aroundPosition),
          aroundPosition,
          width: endProps.width,
          height: endProps.height
        });
      }
    }

    return result;
  }

  interpolateProps(
    startProps: PropsWithAnchor,
    endProps: PropsWithAnchor,
    t: number
  ): Record<string, any> {
    const propsInTransition = {};
    for (const key of this._propsToExtract) {
      propsInTransition[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
    }

    if (this.opts.makeViewport && (endProps.aroundPosition || endProps.aroundLngLat)) {
      // Linear transition should be performed in common space
      const viewport = this.opts.makeViewport({...endProps, ...propsInTransition});
      const anchorScreen = lerp(
        startProps.around as number[],
        endProps.around as number[],
        t
      ) as number[];

      if (viewport instanceof GlobeViewport && endProps.aroundLngLat) {
        Object.assign(
          propsInTransition,
          viewport.panByGlobeAnchor(endProps.aroundLngLat, anchorScreen)
        );
      } else if (endProps.aroundPosition) {
        Object.assign(
          propsInTransition,
          viewport.panByPosition(endProps.aroundPosition, anchorScreen)
        );
      }
    }
    return propsInTransition;
  }
}

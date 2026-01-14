// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import MapView from './map-view';
import _Map3DController from '../controllers/map-3d-controller';

/**
 * Map3DView extends MapView with 3D picking and rotation pivot features
 *
 * Features:
 * - Uses Map3DController by default for 3D rotation pivots
 * - Performs 3D picking at rotation start to determine pivot altitude
 * - Maintains rotation pivot at picked 3D point instead of viewport center
 *
 * Usage:
 * ```js
 * import {_Map3DView} from '@deck.gl/core';
 *
 * const deck = new Deck({
 *   views: new _Map3DView({controller: true})
 * });
 * ```
 */
export default class Map3DView extends MapView {
  static displayName = 'Map3DView';

  get ControllerType() {
    return _Map3DController;
  }
}

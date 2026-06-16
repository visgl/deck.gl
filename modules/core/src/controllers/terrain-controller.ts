// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import MapController from './map-controller';
import {withTerrain} from './terrain';

/**
 * MapController with terrain-aware behavior. The camera smoothly follows terrain
 * elevation during pan/zoom, and rotation pivots around the 3D point under the
 * pointer (`rotationPivot: '3d'`) by default. Requires a layer with
 * `pickable: '3d'`; without one it behaves like a standard MapController.
 */
export default class TerrainController extends withTerrain(MapController) {}

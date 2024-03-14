import type {MapViewState} from './map-view';
import type {FirstPersonViewState} from './first-person-view';
import type {OrbitViewState} from './orbit-view';
import type {OrthographicViewState} from './orthographic-view';
import type {GlobeViewState} from './globe-view';

export type AnyViewState =
  | MapViewState
  | FirstPersonViewState
  | GlobeViewState
  | OrbitViewState
  | OrthographicViewState;
export type {
  MapViewState,
  FirstPersonViewState,
  GlobeViewState,
  OrbitViewState,
  OrthographicViewState
};

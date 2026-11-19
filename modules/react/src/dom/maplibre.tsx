import 'client-only';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import type {MapLibreOverlayProps} from '@deck.gl/maplibre';
import {attachControl, type ControlHostLike} from './attach-control';
import {createDeckGL} from './components';
import type {DeckGLRootProps} from '../types/index';

/** Props accepted by the MapLibre-overlay React Fiber root. */
export type MapLibreDeckGLProps = DeckGLRootProps<
  MapLibreOverlay,
  MapLibreOverlayProps,
  ControlHostLike
>;

/** A React Fiber root backed by one MapLibreOverlay control. */
export const DeckGL = createDeckGL<MapLibreOverlayProps, MapLibreOverlay, ControlHostLike>({
  createExternalOverlay: props => new MapLibreOverlay(props),
  /** `MapLibreOverlay` reads `interleaved` only in its constructor. */
  recreateOverlayOnChange: ['interleaved'],
  /** `MapLibreOverlay` renders deck.gl views beside the map's own view, which has the id 'maplibre'. */
  forwardViews: true,
  /** Adds the overlay to the `map` prop's map as a control. */
  attach: attachControl
});

export type {MapLibreOverlay, MapLibreOverlayProps};

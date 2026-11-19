import 'client-only';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';
import {attachControl, type ControlHostLike} from './attach-control';
import {createDeckGL} from './components';
import type {DeckGLRootProps} from '../types/index';

/** Props accepted by the Mapbox-overlay React Fiber root. */
export type MapboxDeckGLProps = DeckGLRootProps<MapboxOverlay, MapboxOverlayProps, ControlHostLike>;

/** A React Fiber root backed by one MapboxOverlay control. */
export const DeckGL = createDeckGL<MapboxOverlayProps, MapboxOverlay, ControlHostLike>({
  createExternalOverlay: props => new MapboxOverlay(props),
  /** `MapboxOverlay` reads `interleaved` only in its constructor. */
  recreateOverlayOnChange: ['interleaved'],
  /** `MapboxOverlay` renders deck.gl views beside the map's own view, which has the id 'mapbox'. */
  forwardViews: true,
  /** Adds the overlay to the `map` prop's map as a control. */
  attach: attachControl
});

export type {MapboxOverlay, MapboxOverlayProps};

/** A map that hosts deck.gl as a control, such as a Mapbox or MapLibre `Map`. */
export interface ControlHost {
  addControl(control: unknown): unknown;
  removeControl(control: unknown): unknown;
  hasControl(control: unknown): boolean;
}

/**
 * A value for the `map` prop of the Mapbox and MapLibre roots: the map itself, or a wrapper
 * with `getMap()`, such as a React Map GL `MapRef`.
 */
export type ControlHostLike = ControlHost | {getMap(): ControlHost};

/**
 * Adds the overlay to the map as a control and returns a function that removes it.
 *
 * Both calls are guarded with `hasControl`, as in React Map GL's `useControl`. Adding is
 * idempotent, so a Strict Mode effect replay cannot add the overlay twice. Removing skips an
 * overlay that is already gone, for example one that removed itself when it was finalized.
 * The overlay is added immediately: Mapbox and MapLibre accept controls before the style loads,
 * and both overlays wait for the style before they insert layers.
 */
export function attachControl(map: ControlHostLike, overlay: unknown): () => void {
  const host = 'getMap' in map ? map.getMap() : map;
  if (!host.hasControl(overlay)) {
    host.addControl(overlay);
  }
  return () => {
    if (host.hasControl(overlay)) {
      host.removeControl(overlay);
    }
  };
}

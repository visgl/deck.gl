/**
 * The coordinate system that positions/dimensions are defined in.
 */
export declare const COORDINATE_SYSTEM: {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  readonly DEFAULT: -1;
  /**
   * Positions are interpreted as [longitude, latitude, elevation]
   * longitude/latitude are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  readonly LNGLAT: 1;
  /**
   * Positions are interpreted as [x, y, z] in meter offsets from the coordinate origin.
   * Dimensions are in meters.
   */
  readonly METER_OFFSETS: 2;
  /**
   * Positions are interpreted as [deltaLng, deltaLat, elevation] from the coordinate origin.
   * deltaLng/deltaLat are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  readonly LNGLAT_OFFSETS: 3;
  /**
   * Positions and dimensions are in the common units of the viewport.
   */
  readonly CARTESIAN: 0;
};
export declare type CoordinateSystem = -1 | 0 | 1 | 2 | 3;
/**
 * How coordinates are transformed from the world space into the common space.
 */
export declare const PROJECTION_MODE: {
  /**
   * Render geospatial data in Web Mercator projection
   */
  readonly WEB_MERCATOR: 1;
  /**
   * Render geospatial data as a 3D globe
   */
  readonly GLOBE: 2;
  /**
   * (Internal use only) Web Mercator projection at high zoom
   */
  readonly WEB_MERCATOR_AUTO_OFFSET: 4;
  /**
   * No transformation
   */
  readonly IDENTITY: 0;
};
export declare const UNIT: {
  readonly common: 0;
  readonly meters: 1;
  readonly pixels: 2;
};
export declare const EVENTS: {
  readonly click: {
    readonly handler: 'onClick';
  };
  readonly panstart: {
    readonly handler: 'onDragStart';
  };
  readonly panmove: {
    readonly handler: 'onDrag';
  };
  readonly panend: {
    readonly handler: 'onDragEnd';
  };
};
/**
 * The rendering operation to perform with a layer, used in the `operation` prop
 */
export declare const OPERATION: {
  readonly DRAW: 'draw';
  readonly MASK: 'mask';
};
// # sourceMappingURL=constants.d.ts.map

// Note: The numeric values here are matched by shader code in the
// "project" and "project64" shader modules. Both places need to be
// updated.

// TODO: Maybe "POSITIONS" would be a better name?
export const COORDINATE_SYSTEM = {
  // Positions are interpreted as [lng, lat, elevation]
  // lng lat are degrees, elevation is meters. distances as meters.
  LNGLAT: 1.0,

  // Positions are interpreted as lng lat offsets: [deltaLng, deltaLat, elevation]
  // deltaLng, deltaLat are delta degrees, elevation is meters.
  // distances as meters.
  LNGLAT_OFFSETS: 3.0,

  // Positions are interpreted as meter offsets, distances as meters
  METER_OFFSETS: 2.0,
  METERS: 2.0,

  // Positions and distances are not transformed: [x, y, z] in unit coordinates
  IDENTITY: 0.0
};

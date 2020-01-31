// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
export function tile2lngLat(x, y, z) {
  const lng = (x / Math.pow(2, z)) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

export function tileToBoundingBox(x, y, z) {
  const [west, north] = tile2lngLat(x, y, z);
  const [east, south] = tile2lngLat(x + 1, y + 1, z);
  return {west, north, east, south};
}

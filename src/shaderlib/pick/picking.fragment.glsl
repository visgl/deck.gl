uniform bool pickingEnabled;

varying vec4 vPickingColor;

vec4 picking_get_color() {
  return vPickingColor;
}
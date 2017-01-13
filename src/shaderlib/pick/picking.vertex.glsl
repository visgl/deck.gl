uniform bool pickingEnabled;
varying vec4 vPickingColor;

void picking_set_color(vec4 normalColor, vec3 pickingColor) {
  vPickingColor = mix(normalColor, vec4(pickingColor.rgb, 1.), pickingEnabled);
}

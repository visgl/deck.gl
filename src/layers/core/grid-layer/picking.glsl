// whether is point picked
float isPicked(vec3 pickingColors, vec3 selectedColor) {
 return float(pickingColors.x == selectedColor.x
 && pickingColors.y == selectedColor.y
 && pickingColors.z == selectedColor.z);
}

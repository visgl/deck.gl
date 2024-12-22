declare const _default: '#version 300 es\n\n#define SHADER_NAME column-layer-vertex-shader\n\nin vec3 positions;\nin vec3 normals;\n\nin vec3 instancePositions;\nin float instanceElevations;\nin vec3 instancePositions64Low;\nin vec4 instanceFillColors;\nin vec4 instanceLineColors;\nin float instanceStrokeWidths;\n\nin vec3 instancePickingColors;\n\n// Custom uniforms\nuniform float opacity;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\nuniform bool extruded;\nuniform bool stroked;\nuniform bool isStroke;\nuniform float coverage;\nuniform float elevationScale;\nuniform float edgeDistance;\nuniform float widthScale;\nuniform float widthMinPixels;\nuniform float widthMaxPixels;\nuniform int radiusUnits;\nuniform int widthUnits;\n\n// Result\nout vec4 vColor;\n#ifdef FLAT_SHADING\nout vec4 position_commonspace;\n#endif\n\nvoid main(void) {\n  geometry.worldPosition = instancePositions;\n\n  vec4 color = isStroke ? instanceLineColors : instanceFillColors;\n  // rotate primitive position and normal\n  mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));\n\n  // calculate elevation, if 3d not enabled set to 0\n  // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1\n  float elevation = 0.0;\n  // calculate stroke offset\n  float strokeOffsetRatio = 1.0;\n\n  if (extruded) {\n    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * elevationScale;\n  } else if (stroked) {\n    float widthPixels = clamp(\n      project_size_to_pixel(instanceStrokeWidths * widthScale, widthUnits),\n      widthMinPixels, widthMaxPixels) / 2.0;\n    float halfOffset = project_pixel_size(widthPixels) / project_size(edgeDistance * coverage * radius);\n    if (isStroke) {\n      strokeOffsetRatio -= sign(positions.z) * halfOffset;\n    } else {\n      strokeOffsetRatio -= halfOffset;\n    }\n  }\n\n  // if alpha == 0.0 or z < 0.0, do not render element\n  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);\n  float dotRadius = radius * coverage * shouldRender;\n\n  geometry.pickingColor = instancePickingColors;\n\n  // project center of column\n  vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);\n  vec3 centroidPosition64Low = instancePositions64Low;\n  vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + offset) * dotRadius;\n  if (radiusUnits == UNIT_METERS) {\n    offset = project_size(offset);\n  }\n  vec3 pos = vec3(offset, 0.);\n  DECKGL_FILTER_SIZE(pos, geometry);\n\n  gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);\n  geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  // Light calculations\n  if (extruded && !isStroke) {\n#ifdef FLAT_SHADING\n    position_commonspace = geometry.position;\n    vColor = vec4(color.rgb, color.a * opacity);\n#else\n    vec3 lightColor = lighting_getLightColor(color.rgb, project_uCameraPosition, geometry.position.xyz, geometry.normal);\n    vColor = vec4(lightColor, color.a * opacity);\n#endif\n  } else {\n    vColor = vec4(color.rgb, color.a * opacity);\n  }\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=column-layer-vertex.glsl.d.ts.map
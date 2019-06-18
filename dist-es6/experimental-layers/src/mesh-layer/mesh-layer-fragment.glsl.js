export default "\n#define SHADER_NAME mesh-layer-fs\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform bool hasTexture;\nuniform sampler2D sampler;\nuniform vec4 color;\n\nvarying vec2 vTexCoord;\nvarying vec4 vColor;\nvarying float vLightWeight;\n\nvoid main(void) {\n  // TODO - restore color rendering\n\n  gl_FragColor = vColor / 255.;\n\n  // hasTexture ? texture2D(sampler, vTexCoord) : color / 255.;\n  // color = vec4(color_transform(color.rgb), color.a * opacity);\n\n  // gl_FragColor = gl_FragColor * vLightWeight;\n\n  // use highlight color if this fragment belongs to the selected object.\n  // gl_FragColor = picking_filterHighlightColor(gl_FragColor);\n\n  // use picking color if rendering to picking FBO.\n  // gl_FragColor = picking_filterPickingColor(gl_FragColor);\n}\n";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwtbGF5ZXJzL3NyYy9tZXNoLWxheWVyL21lc2gtbGF5ZXItZnJhZ21lbnQuZ2xzbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsImZpbGUiOiJtZXNoLWxheWVyLWZyYWdtZW50Lmdsc2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBgXG4jZGVmaW5lIFNIQURFUl9OQU1FIG1lc2gtbGF5ZXItZnNcblxuI2lmZGVmIEdMX0VTXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4jZW5kaWZcblxudW5pZm9ybSBib29sIGhhc1RleHR1cmU7XG51bmlmb3JtIHNhbXBsZXIyRCBzYW1wbGVyO1xudW5pZm9ybSB2ZWM0IGNvbG9yO1xuXG52YXJ5aW5nIHZlYzIgdlRleENvb3JkO1xudmFyeWluZyB2ZWM0IHZDb2xvcjtcbnZhcnlpbmcgZmxvYXQgdkxpZ2h0V2VpZ2h0O1xuXG52b2lkIG1haW4odm9pZCkge1xuICAvLyBUT0RPIC0gcmVzdG9yZSBjb2xvciByZW5kZXJpbmdcblxuICBnbF9GcmFnQ29sb3IgPSB2Q29sb3IgLyAyNTUuO1xuXG4gIC8vIGhhc1RleHR1cmUgPyB0ZXh0dXJlMkQoc2FtcGxlciwgdlRleENvb3JkKSA6IGNvbG9yIC8gMjU1LjtcbiAgLy8gY29sb3IgPSB2ZWM0KGNvbG9yX3RyYW5zZm9ybShjb2xvci5yZ2IpLCBjb2xvci5hICogb3BhY2l0eSk7XG5cbiAgLy8gZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdkxpZ2h0V2VpZ2h0O1xuXG4gIC8vIHVzZSBoaWdobGlnaHQgY29sb3IgaWYgdGhpcyBmcmFnbWVudCBiZWxvbmdzIHRvIHRoZSBzZWxlY3RlZCBvYmplY3QuXG4gIC8vIGdsX0ZyYWdDb2xvciA9IHBpY2tpbmdfZmlsdGVySGlnaGxpZ2h0Q29sb3IoZ2xfRnJhZ0NvbG9yKTtcblxuICAvLyB1c2UgcGlja2luZyBjb2xvciBpZiByZW5kZXJpbmcgdG8gcGlja2luZyBGQk8uXG4gIC8vIGdsX0ZyYWdDb2xvciA9IHBpY2tpbmdfZmlsdGVyUGlja2luZ0NvbG9yKGdsX0ZyYWdDb2xvcik7XG59XG5gO1xuIl19
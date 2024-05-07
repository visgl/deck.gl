export default `\
uniform scatterplotUniforms {
  uniform float radiusScale;
  uniform float radiusMinPixels;
  uniform float radiusMaxPixels;
  uniform float lineWidthScale;
  uniform float lineWidthMinPixels;
  uniform float lineWidthMaxPixels;
  uniform float stroked;
  uniform bool filled;
  uniform bool antialiasing;
  uniform bool billboard;
  uniform highp int radiusUnits;
  uniform highp int lineWidthUnits;
} scatterplot;
`;

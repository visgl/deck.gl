// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Builds only the opt-in source. The original shader string remains byte-identical. */
export function withMotionVectors(source: string, scenegraph: boolean): string {
  const input = scenegraph ? 'inputs' : 'attributes';
  const output = scenegraph ? 'outputs' : 'varyings';
  const fragment = scenegraph ? 'inputs' : 'varyings';
  const position = scenegraph ? 'pos' : 'meshPosition';
  const module = scenegraph ? 'scenegraph' : 'simpleMesh';
  const attributeLocation = scenegraph ? 14 : 11;
  const varyingLocation = scenegraph ? 6 : 5;
  const replace = (target: string, replacement: string): string => {
    if (source.split(target).length !== 2) {
      throw new Error(`Motion vector shader target must occur exactly once: ${target}`);
    }
    source = source.replace(target, replacement);
    return source;
  };
  replace(
    '  @location(0) positions:',
    `  @location(${attributeLocation}) instancePreviousPositions: vec3<f32>,
  @location(${attributeLocation + 1}) instancePreviousPositions64Low: vec3<f32>,
  @location(0) positions:`
  );
  replace(
    '  @builtin(position) position:',
    `  @location(${varyingLocation}) previousClip: vec4<f32>,
  @location(${varyingLocation + 1}) currentClip: vec4<f32>,
  @invariant @builtin(position) position:`
  );
  // Reuse the current mesh offset. Instance rotation, scale and scenegraph animation are not tracked.
  const previous = `
  var previousCommon: vec4<f32>;
  if (${module}.composeModelMatrix > 0.5) {
    previousCommon = project_position_to_clipspace_and_commonspace(
      ${input}.instancePreviousPositions + ${position},
      ${input}.instancePreviousPositions64Low, vec3<f32>(0.0)).commonPosition;
  } else {
    previousCommon = project_position_to_clipspace_and_commonspace(
      ${input}.instancePreviousPositions,
      ${input}.instancePreviousPositions64Low,
      ${scenegraph ? 'sizeAdjustedPos' : position}).commonPosition;
  }
  ${output}.previousClip = velocity.previousClipFromCommon * previousCommon;
  ${output}.currentClip = velocity.currentClipFromCommon * geometry.position;
`;
  if (scenegraph) {
    // Preserve the existing size computation, but make its result available after the branch.
    replace(
      '  if (scenegraph.composeModelMatrix',
      '  var sizeAdjustedPos: vec3<f32>;\n  if (scenegraph.composeModelMatrix'
    );
    replace('    var sizeAdjustedPos =', '    sizeAdjustedPos =');
  }
  replace(`  return ${output};`, previous + `  return ${output};`);
  return replace(
    '  if (picking.isActive > 0.5)',
    `  if (velocity.isActive > 0.5) {
    var motionColor = velocity_color(${fragment}.previousClip, ${fragment}.currentClip);
    DECKGL_FILTER_COLOR(&motionColor, fragmentGeometry);
    return velocity_color(${fragment}.previousClip, ${fragment}.currentClip);
  }

  if (picking.isActive > 0.5)`
  );
}

/** Includes the previous position's fp64 low mapping before model shader validation. */
export function withMotionVectorLayout(
  layouts: import('@luma.gl/core').BufferLayout[]
): import('@luma.gl/core').BufferLayout[] {
  const position = layouts.find(layout => layout.name === 'instancePositions')!;
  return [
    ...layouts,
    {
      ...position,
      name: 'instancePreviousPositions',
      attributes: position.attributes?.map(attribute => ({
        ...attribute,
        attribute: attribute.attribute.replace('instancePositions', 'instancePreviousPositions')
      }))
    }
  ];
}

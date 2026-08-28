// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { ShaderAssembler, gouraudMaterial, phongMaterial } from '@luma.gl/shadertools';
import { layerUniforms } from "./misc/layer-uniforms.js";
import color from "./color/color.js";
import geometry from "./misc/geometry.js";
import project from "./project/project.js";
import project32 from "./project32/project32.js";
import shadow from "./shadow/shadow.js";
import picking from "./picking/picking.js";
const DEFAULT_MODULES = [geometry];
const SHADER_HOOKS_GLSL = [
    'vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)',
    'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)',
    'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)',
    'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'
];
const SHADER_HOOKS_WGSL = [
// Not yet supported
];
export function getShaderAssembler(language) {
    const shaderAssembler = ShaderAssembler.getDefaultShaderAssembler();
    for (const shaderModule of DEFAULT_MODULES) {
        shaderAssembler.addDefaultModule(shaderModule);
    }
    // if we're recreating the device we may have changed language
    // and must not inject hooks for the wrong language
    // shaderAssembler.resetShaderHooks();
    shaderAssembler._hookFunctions.length = 0;
    // Add shader hooks based on language
    // TODO(ibgreen) - should the luma shader assembler support both sets of hooks?
    const shaderHooks = language === 'glsl' ? SHADER_HOOKS_GLSL : SHADER_HOOKS_WGSL;
    for (const shaderHook of shaderHooks) {
        shaderAssembler.addShaderHook(shaderHook);
    }
    return shaderAssembler;
}
export { layerUniforms, color, picking, project, project32, gouraudMaterial, phongMaterial, shadow };
//# sourceMappingURL=index.js.map
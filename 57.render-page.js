exports.ids = [57];
exports.modules = {

/***/ "../node_modules/@arcgis/core/chunks/DefaultMaterial.glsl.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/DefaultMaterial.glsl.js ***!
  \*******************************************************************/
/*! exports provided: D, b */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "D", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return P; });
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_ForwardLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Offset_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_SymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_VertexColor_glsl_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_VertexNormal_glsl_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/VertexNormal.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexNormal.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_default_DefaultMaterialAuxiliaryPasses_glsl_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_ComputeNormalTexture_glsl_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/ComputeNormalTexture.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ComputeNormalTexture.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateSceneLighting_glsl_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_Normals_glsl_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/Normals.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/Normals.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_util_HeaderComment_glsl_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/util/HeaderComment.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/HeaderComment.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderModules_ShaderBuilder_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function P(P){const _=new _views_3d_webgl_engine_core_shaderModules_ShaderBuilder_js__WEBPACK_IMPORTED_MODULE_27__["ShaderBuilder"],S=_.vertex.code,$=_.fragment.code;return _.include(_views_3d_webgl_engine_core_shaderLibrary_util_HeaderComment_glsl_js__WEBPACK_IMPORTED_MODULE_24__["HeaderComment"],{name:"Default Material Shader",output:P.output}),_.vertex.uniforms.add("proj","mat4").add("view","mat4").add("camPos","vec3").add("localOrigin","vec3"),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_6__["PositionAttribute"]),_.varyings.add("vpos","vec3"),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_22__["VisualVariables"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__["InstancedDoublePrecision"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_11__["VerticalOffset"],P),0!==P.output&&7!==P.output||(_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_5__["NormalAttribute"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_3__["Transform"],{linearDepth:!1}),0===P.normalType&&P.offsetBackfaces&&_.include(_views_3d_webgl_engine_core_shaderLibrary_Offset_glsl_js__WEBPACK_IMPORTED_MODULE_1__["Offset"]),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_ComputeNormalTexture_glsl_js__WEBPACK_IMPORTED_MODULE_14__["ComputeNormalTexture"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_VertexNormal_glsl_js__WEBPACK_IMPORTED_MODULE_10__["VertexNormal"],P),P.instancedColor&&_.attributes.add("instanceColor","vec4"),_.varyings.add("localvpos","vec3"),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_8__["TextureCoordinateAttribute"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_ForwardLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_0__["ForwardLinearDepth"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_SymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_7__["SymbolColor"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_VertexColor_glsl_js__WEBPACK_IMPORTED_MODULE_9__["VertexColor"],P),_.vertex.uniforms.add("externalColor","vec4"),_.varyings.add("vcolorExt","vec4"),P.multipassTerrainEnabled&&_.varyings.add("depth","float"),S.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
      void main(void) {
        forwardNormalizedVertexColor();
        vcolorExt = externalColor;
        ${P.instancedColor?"vcolorExt *= instanceColor;":""}
        vcolorExt *= vvColor();
        vcolorExt *= getSymbolColor();
        forwardColorMixMode();

        if (vcolorExt.a < ${_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"].float(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_23__["symbolAlphaCutoff"])}) {
          gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
        }
        else {
          vpos = calculateVPos();
          localvpos = vpos - view[3].xyz;
          vpos = subtractOrigin(vpos);
          ${0===P.normalType?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
          vNormalWorld = dpNormal(vvLocalNormal(normalModel()));`:""}
          vpos = addVerticalOffset(vpos, localOrigin);
          ${P.vertexTangents?"vTangent = dpTransformVertexTangent(tangent);":""}
          gl_Position = transformPosition(proj, view, vpos);
          ${0===P.normalType&&P.offsetBackfaces?"gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, camPos);":""}
        }

        ${P.multipassTerrainEnabled?"depth = (view * vec4(vpos, 1.0)).z;":""}
        forwardLinearDepth();
        forwardTextureCoordinates();
      }
    `)),7===P.output&&(_.include(_views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__["Slice"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_23__["DiscardOrAdjustAlpha"],P),P.multipassTerrainEnabled&&(_.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_13__["ReadLinearDepth"]),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_17__["multipassTerrainTest"],P)),_.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("opacity","float").add("layerOpacity","float"),P.hasColorTexture&&_.fragment.uniforms.add("tex","sampler2D"),_.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_25__["MixExternalColor"]),$.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${P.multipassTerrainEnabled?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${P.hasColorTexture?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        ${P.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`vec4 texColor = vec4(1.0);`}
        ${P.attributeColor?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        gl_FragColor = vec4(opacity_);
      }
    `)),0===P.output&&(_.include(_views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__["Slice"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateSceneLighting_glsl_js__WEBPACK_IMPORTED_MODULE_16__["EvaluateSceneLighting"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_15__["EvaluateAmbientOcclusion"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_23__["DiscardOrAdjustAlpha"],P),P.receiveShadows&&_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_21__["ReadShadowMap"],P),P.multipassTerrainEnabled&&(_.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_13__["ReadLinearDepth"]),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_17__["multipassTerrainTest"],P)),_.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("ambient","vec3").add("diffuse","vec3").add("opacity","float").add("layerOpacity","float"),P.hasColorTexture&&_.fragment.uniforms.add("tex","sampler2D"),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_20__["PhysicallyBasedRenderingParameters"],P),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_19__["PhysicallyBasedRendering"],P),_.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_25__["MixExternalColor"]),_.include(_views_3d_webgl_engine_core_shaderLibrary_shading_Normals_glsl_js__WEBPACK_IMPORTED_MODULE_18__["Normals"],P),$.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${P.multipassTerrainEnabled?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${P.hasColorTexture?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        ${P.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`vec4 texColor = vec4(1.0);`}
        shadingParams.viewDirection = normalize(vpos - camPos);
        ${3===P.normalType?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        vec3 normal = screenDerivativeNormal(localvpos);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        shadingParams.normalView = vNormalWorld;
        vec3 normal = shadingNormal(shadingParams);`}
        ${1===P.pbrMode?"applyPBRFactors();":""}
        float ssao = evaluateAmbientOcclusionInverse();
        ssao *= getBakedOcclusion();

        float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
        vec3 additionalLight = ssao * lightingMainIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
        ${P.receiveShadows?"float shadow = readShadowMap(vpos, linearDepth);":1===P.viewingMode?"float shadow = lightingGlobalFactor * (1.0 - additionalAmbientScale);":"float shadow = 0.0;"}
        vec3 matColor = max(ambient, diffuse);
        ${P.attributeColor?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        vec3 albedo_ = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
        vec3 albedo_ = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        ${P.hasNormalTexture?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
              mat3 tangentSpace = ${P.vertexTangents?"computeTangentSpace(normal);":"computeTangentSpace(normal, vpos, vuv0);"}
              vec3 shadedNormal = computeTextureNormal(tangentSpace, vuv0);`:"vec3 shadedNormal = normal;"}
        ${1===P.pbrMode||2===P.pbrMode?1===P.viewingMode?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`vec3 normalGround = normalize(vpos + localOrigin);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`vec3 normalGround = vec3(0.0, 0.0, 1.0);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]``}
        ${1===P.pbrMode||2===P.pbrMode?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_26__["glsl"]`
            float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * lightingMainIntensity[2];
            vec3 shadedColor = evaluateSceneLightingPBR(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight, shadingParams.viewDirection, normalGround, mrr, emission, additionalAmbientIrradiance);`:"vec3 shadedColor = evaluateSceneLighting(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight);"}
        gl_FragColor = highlightSlice(vec4(shadedColor, opacity_), vpos);
        ${P.OITEnabled?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
      }
    `)),_.include(_views_3d_webgl_engine_core_shaderLibrary_default_DefaultMaterialAuxiliaryPasses_glsl_js__WEBPACK_IMPORTED_MODULE_12__["DefaultMaterialAuxiliaryPasses"],P),_}var _=Object.freeze({__proto__:null,build:P});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/RealisticTree.glsl.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/RealisticTree.glsl.js ***!
  \*****************************************************************/
/*! exports provided: R, b */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "R", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return j; });
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_ForwardLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Offset_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_SymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_VertexColor_glsl_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_default_DefaultMaterialAuxiliaryPasses_glsl_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateSceneLighting_glsl_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _views_3d_webgl_engine_core_shaderModules_ShaderBuilder_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function j(j){const E=new _views_3d_webgl_engine_core_shaderModules_ShaderBuilder_js__WEBPACK_IMPORTED_MODULE_23__["ShaderBuilder"],O=E.vertex.code,_=E.fragment.code;return E.vertex.uniforms.add("proj","mat4").add("view","mat4").add("camPos","vec3").add("localOrigin","vec3"),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_6__["PositionAttribute"]),E.varyings.add("vpos","vec3"),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_19__["VisualVariables"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__["InstancedDoublePrecision"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_10__["VerticalOffset"],j),0!==j.output&&7!==j.output||(E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_5__["NormalAttribute"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_3__["Transform"],{linearDepth:!1}),j.offsetBackfaces&&E.include(_views_3d_webgl_engine_core_shaderLibrary_Offset_glsl_js__WEBPACK_IMPORTED_MODULE_1__["Offset"]),j.instancedColor&&E.attributes.add("instanceColor","vec4"),E.varyings.add("vNormalWorld","vec3"),E.varyings.add("localvpos","vec3"),j.multipassTerrainEnabled&&E.varyings.add("depth","float"),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_8__["TextureCoordinateAttribute"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_ForwardLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_0__["ForwardLinearDepth"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_SymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_7__["SymbolColor"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_attributes_VertexColor_glsl_js__WEBPACK_IMPORTED_MODULE_9__["VertexColor"],j),E.vertex.uniforms.add("externalColor","vec4"),E.varyings.add("vcolorExt","vec4"),O.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        void main(void) {
          forwardNormalizedVertexColor();
          vcolorExt = externalColor;
          ${j.instancedColor?"vcolorExt *= instanceColor;":""}
          vcolorExt *= vvColor();
          vcolorExt *= getSymbolColor();
          forwardColorMixMode();

          if (vcolorExt.a < ${_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"].float(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_20__["symbolAlphaCutoff"])}) {
            gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
          }
          else {
            vpos = calculateVPos();
            localvpos = vpos - view[3].xyz;
            vpos = subtractOrigin(vpos);
            vNormalWorld = dpNormal(vvLocalNormal(normalModel()));
            vpos = addVerticalOffset(vpos, localOrigin);
            gl_Position = transformPosition(proj, view, vpos);
            ${j.offsetBackfaces?"gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, camPos);":""}
          }
          ${j.multipassTerrainEnabled?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`depth = (view * vec4(vpos, 1.0)).z;`:""}
          forwardLinearDepth();
          forwardTextureCoordinates();
        }
      `)),7===j.output&&(E.include(_views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__["Slice"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_20__["DiscardOrAdjustAlpha"],j),j.multipassTerrainEnabled&&(E.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_12__["ReadLinearDepth"]),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_15__["multipassTerrainTest"],j)),E.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("opacity","float").add("layerOpacity","float"),E.fragment.uniforms.add("view","mat4"),j.hasColorTexture&&E.fragment.uniforms.add("tex","sampler2D"),E.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_21__["MixExternalColor"]),_.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${j.multipassTerrainEnabled?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`terrainDepthTest(gl_FragCoord, depth);`:""}
        ${j.hasColorTexture?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        ${j.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`vec4 texColor = vec4(1.0);`}
        ${j.attributeColor?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}

        gl_FragColor = vec4(opacity_);
      }
    `)),0===j.output&&(E.include(_views_3d_webgl_engine_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__["Slice"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateSceneLighting_glsl_js__WEBPACK_IMPORTED_MODULE_14__["EvaluateSceneLighting"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_13__["EvaluateAmbientOcclusion"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_20__["DiscardOrAdjustAlpha"],j),j.receiveShadows&&E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_18__["ReadShadowMap"],j),j.multipassTerrainEnabled&&(E.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_output_ReadLinearDepth_glsl_js__WEBPACK_IMPORTED_MODULE_12__["ReadLinearDepth"]),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_15__["multipassTerrainTest"],j)),E.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("ambient","vec3").add("diffuse","vec3").add("opacity","float").add("layerOpacity","float"),E.fragment.uniforms.add("view","mat4"),j.hasColorTexture&&E.fragment.uniforms.add("tex","sampler2D"),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_17__["PhysicallyBasedRenderingParameters"],j),E.include(_views_3d_webgl_engine_core_shaderLibrary_shading_PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_16__["PhysicallyBasedRendering"],j),E.fragment.include(_views_3d_webgl_engine_core_shaderLibrary_util_MixExternalColor_glsl_js__WEBPACK_IMPORTED_MODULE_21__["MixExternalColor"]),_.add(_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${j.multipassTerrainEnabled?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`terrainDepthTest(gl_FragCoord, depth);`:""}
        ${j.hasColorTexture?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        ${j.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`vec4 texColor = vec4(1.0);`}
        vec3 viewDirection = normalize(vpos - camPos);
        ${1===j.pbrMode?"applyPBRFactors();":""}
        float ssao = evaluateAmbientOcclusionInverse();
        ssao *= getBakedOcclusion();

        float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
        vec3 additionalLight = ssao * lightingMainIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
        ${j.receiveShadows?"float shadow = readShadowMap(vpos, linearDepth);":1===j.viewingMode?"float shadow = lightingGlobalFactor * (1.0 - additionalAmbientScale);":"float shadow = 0.0;"}
        vec3 matColor = max(ambient, diffuse);
        ${j.attributeColor?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        vec3 albedo_ = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        vec3 albedo_ = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        ${_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
        vec3 shadedNormal = normalize(vNormalWorld);
        albedo_ *= 1.2;
        vec3 viewForward = vec3(view[0][2], view[1][2], view[2][2]);
        float alignmentLightView = clamp(dot(viewForward, -lightingMainDirection), 0.0, 1.0);
        float transmittance = 1.0 - clamp(dot(viewForward, shadedNormal), 0.0, 1.0);
        float treeRadialFalloff = vColor.r;
        float backLightFactor = 0.5 * treeRadialFalloff * alignmentLightView * transmittance * (1.0 - shadow);
        additionalLight += backLightFactor * lightingMainIntensity;`}
        ${1===j.pbrMode||2===j.pbrMode?1===j.viewingMode?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`vec3 normalGround = normalize(vpos + localOrigin);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`vec3 normalGround = vec3(0.0, 0.0, 1.0);`:_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]``}
        ${1===j.pbrMode||2===j.pbrMode?_views_3d_webgl_engine_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_22__["glsl"]`
            float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * lightingMainIntensity[2];
            vec3 shadedColor = evaluateSceneLightingPBR(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight, viewDirection, normalGround, mrr, emission, additionalAmbientIrradiance);`:"vec3 shadedColor = evaluateSceneLighting(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight);"}
        gl_FragColor = highlightSlice(vec4(shadedColor, opacity_), vpos);
        ${j.OITEnabled?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
      }
    `)),E.include(_views_3d_webgl_engine_core_shaderLibrary_default_DefaultMaterialAuxiliaryPasses_glsl_js__WEBPACK_IMPORTED_MODULE_11__["DefaultMaterialAuxiliaryPasses"],j),E}var E=Object.freeze({__proto__:null,build:j});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/builtins.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/builtins.js ***!
  \*******************************************************/
/*! exports provided: b, l, o */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return a; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e,r={exports:{}};void 0!==(e=["precision","highp","mediump","lowp","attribute","const","uniform","varying","break","continue","do","for","while","if","else","in","out","inout","float","int","void","bool","true","false","discard","return","mat2","mat3","mat4","vec2","vec3","vec4","ivec2","ivec3","ivec4","bvec2","bvec3","bvec4","sampler1D","sampler2D","sampler3D","samplerCube","sampler1DShadow","sampler2DShadow","struct","asm","class","union","enum","typedef","template","this","packed","goto","switch","default","inline","noinline","volatile","public","static","extern","external","interface","long","short","double","half","fixed","unsigned","input","output","hvec2","hvec3","hvec4","dvec2","dvec3","dvec4","fvec2","fvec3","fvec4","sampler2DRect","sampler3DRect","sampler2DRectShadow","sizeof","cast","namespace","using"])&&(r.exports=e);var t,o=r.exports,l={exports:{}};t=l,function(e){var r=["<<=",">>=","++","--","<<",">>","<=",">=","==","!=","&&","||","+=","-=","*=","/=","%=","&=","^^","^=","|=","(",")","[","]",".","!","~","*","/","%","+","-","<",">","&","^","|","?",":","=",",",";","{","}"];void 0!==r&&(t.exports=r)}();var a=l.exports,g={exports:{}};!function(e){!function(r){var t=function(){return["abs","acos","all","any","asin","atan","ceil","clamp","cos","cross","dFdx","dFdy","degrees","distance","dot","equal","exp","exp2","faceforward","floor","fract","gl_BackColor","gl_BackLightModelProduct","gl_BackLightProduct","gl_BackMaterial","gl_BackSecondaryColor","gl_ClipPlane","gl_ClipVertex","gl_Color","gl_DepthRange","gl_DepthRangeParameters","gl_EyePlaneQ","gl_EyePlaneR","gl_EyePlaneS","gl_EyePlaneT","gl_Fog","gl_FogCoord","gl_FogFragCoord","gl_FogParameters","gl_FragColor","gl_FragCoord","gl_FragData","gl_FragDepth","gl_FragDepthEXT","gl_FrontColor","gl_FrontFacing","gl_FrontLightModelProduct","gl_FrontLightProduct","gl_FrontMaterial","gl_FrontSecondaryColor","gl_LightModel","gl_LightModelParameters","gl_LightModelProducts","gl_LightProducts","gl_LightSource","gl_LightSourceParameters","gl_MaterialParameters","gl_MaxClipPlanes","gl_MaxCombinedTextureImageUnits","gl_MaxDrawBuffers","gl_MaxFragmentUniformComponents","gl_MaxLights","gl_MaxTextureCoords","gl_MaxTextureImageUnits","gl_MaxTextureUnits","gl_MaxVaryingFloats","gl_MaxVertexAttribs","gl_MaxVertexTextureImageUnits","gl_MaxVertexUniformComponents","gl_ModelViewMatrix","gl_ModelViewMatrixInverse","gl_ModelViewMatrixInverseTranspose","gl_ModelViewMatrixTranspose","gl_ModelViewProjectionMatrix","gl_ModelViewProjectionMatrixInverse","gl_ModelViewProjectionMatrixInverseTranspose","gl_ModelViewProjectionMatrixTranspose","gl_MultiTexCoord0","gl_MultiTexCoord1","gl_MultiTexCoord2","gl_MultiTexCoord3","gl_MultiTexCoord4","gl_MultiTexCoord5","gl_MultiTexCoord6","gl_MultiTexCoord7","gl_Normal","gl_NormalMatrix","gl_NormalScale","gl_ObjectPlaneQ","gl_ObjectPlaneR","gl_ObjectPlaneS","gl_ObjectPlaneT","gl_Point","gl_PointCoord","gl_PointParameters","gl_PointSize","gl_Position","gl_ProjectionMatrix","gl_ProjectionMatrixInverse","gl_ProjectionMatrixInverseTranspose","gl_ProjectionMatrixTranspose","gl_SecondaryColor","gl_TexCoord","gl_TextureEnvColor","gl_TextureMatrix","gl_TextureMatrixInverse","gl_TextureMatrixInverseTranspose","gl_TextureMatrixTranspose","gl_Vertex","greaterThan","greaterThanEqual","inversesqrt","length","lessThan","lessThanEqual","log","log2","matrixCompMult","max","min","mix","mod","normalize","not","notEqual","pow","radians","reflect","refract","sign","sin","smoothstep","sqrt","step","tan","texture2D","texture2DLod","texture2DProj","texture2DProjLod","textureCube","textureCubeLod","texture2DLodEXT","texture2DProjLodEXT","textureCubeLodEXT","texture2DGradEXT","texture2DProjGradEXT","textureCubeGradEXT"]}();void 0!==t&&(e.exports=t)}()}(g);var i=g.exports;


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/quat.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/quat.js ***!
  \***************************************************/
/*! exports provided: A, B, C, D, E, F, G, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return X; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "B", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "C", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "D", function() { return K; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "E", function() { return Q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "F", function() { return tt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "G", function() { return nt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return W; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return Y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return rt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return T; });
/* harmony import */ var _mat3f64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mat3f64.js */ "../node_modules/@arcgis/core/chunks/mat3f64.js");
/* harmony import */ var _quatf64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./quatf64.js */ "../node_modules/@arcgis/core/chunks/quatf64.js");
/* harmony import */ var _vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common.js */ "../node_modules/@arcgis/core/chunks/common.js");
/* harmony import */ var _vec3_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _vec4_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vec4.js */ "../node_modules/@arcgis/core/chunks/vec4.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function x(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t}function A(t,s,a){a*=.5;const n=Math.sin(a);return t[0]=n*s[0],t[1]=n*s[1],t[2]=n*s[2],t[3]=Math.cos(a),t}function I(t,s){const a=2*Math.acos(s[3]),n=Math.sin(a/2);return n>_common_js__WEBPACK_IMPORTED_MODULE_3__["E"]?(t[0]=s[0]/n,t[1]=s[1]/n,t[2]=s[2]/n):(t[0]=1,t[1]=0,t[2]=0),a}function P(t,s,a){const n=s[0],o=s[1],r=s[2],c=s[3],e=a[0],u=a[1],i=a[2],h=a[3];return t[0]=n*h+c*e+o*i-r*u,t[1]=o*h+c*u+r*e-n*i,t[2]=r*h+c*i+n*u-o*e,t[3]=c*h-n*e-o*u-r*i,t}function b(t,s,a){a*=.5;const n=s[0],o=s[1],r=s[2],c=s[3],e=Math.sin(a),u=Math.cos(a);return t[0]=n*u+c*e,t[1]=o*u+r*e,t[2]=r*u-o*e,t[3]=c*u-n*e,t}function y(t,s,a){a*=.5;const n=s[0],o=s[1],r=s[2],c=s[3],e=Math.sin(a),u=Math.cos(a);return t[0]=n*u-r*e,t[1]=o*u+c*e,t[2]=r*u+n*e,t[3]=c*u-o*e,t}function E(t,s,a){a*=.5;const n=s[0],o=s[1],r=s[2],c=s[3],e=Math.sin(a),u=Math.cos(a);return t[0]=n*u+o*e,t[1]=o*u-n*e,t[2]=r*u+c*e,t[3]=c*u-r*e,t}function _(t,s){const a=s[0],n=s[1],o=s[2];return t[0]=a,t[1]=n,t[2]=o,t[3]=Math.sqrt(Math.abs(1-a*a-n*n-o*o)),t}function z(t,s,a,n){const r=s[0],c=s[1],e=s[2],u=s[3];let i,h,M,f,l,m=a[0],p=a[1],q=a[2],d=a[3];return h=r*m+c*p+e*q+u*d,h<0&&(h=-h,m=-m,p=-p,q=-q,d=-d),1-h>_common_js__WEBPACK_IMPORTED_MODULE_3__["E"]?(i=Math.acos(h),M=Math.sin(i),f=Math.sin((1-n)*i)/M,l=Math.sin(n*i)/M):(f=1-n,l=n),t[0]=f*r+l*m,t[1]=f*c+l*p,t[2]=f*e+l*q,t[3]=f*u+l*d,t}function L(t){const s=Object(_common_js__WEBPACK_IMPORTED_MODULE_3__["R"])(),a=Object(_common_js__WEBPACK_IMPORTED_MODULE_3__["R"])(),n=Object(_common_js__WEBPACK_IMPORTED_MODULE_3__["R"])(),o=Math.sqrt(1-s),c=Math.sqrt(s);return t[0]=o*Math.sin(2*Math.PI*a),t[1]=o*Math.cos(2*Math.PI*a),t[2]=c*Math.sin(2*Math.PI*n),t[3]=c*Math.cos(2*Math.PI*n),t}function k(t,s){const a=s[0],n=s[1],o=s[2],r=s[3],c=a*a+n*n+o*o+r*r,e=c?1/c:0;return t[0]=-a*e,t[1]=-n*e,t[2]=-o*e,t[3]=r*e,t}function w(t,s){return t[0]=-s[0],t[1]=-s[1],t[2]=-s[2],t[3]=s[3],t}function B(t,s){const a=s[0]+s[4]+s[8];let n;if(a>0)n=Math.sqrt(a+1),t[3]=.5*n,n=.5/n,t[0]=(s[5]-s[7])*n,t[1]=(s[6]-s[2])*n,t[2]=(s[1]-s[3])*n;else{let a=0;s[4]>s[0]&&(a=1),s[8]>s[3*a+a]&&(a=2);const o=(a+1)%3,r=(a+2)%3;n=Math.sqrt(s[3*a+a]-s[3*o+o]-s[3*r+r]+1),t[a]=.5*n,n=.5/n,t[3]=(s[3*o+r]-s[3*r+o])*n,t[o]=(s[3*o+a]+s[3*a+o])*n,t[r]=(s[3*r+a]+s[3*a+r])*n}return t}function C(t,s,a,n){const o=.5*Math.PI/180;s*=o,a*=o,n*=o;const r=Math.sin(s),c=Math.cos(s),e=Math.sin(a),u=Math.cos(a),i=Math.sin(n),h=Math.cos(n);return t[0]=r*u*h-c*e*i,t[1]=c*e*h+r*u*i,t[2]=c*u*i-r*e*h,t[3]=c*u*h+r*e*i,t}function D(t){return"quat("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"}const F=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["c"],G=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["s"],O=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["a"],R=P,T=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["b"],W=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["d"],X=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["l"],Y=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["e"],Z=Y,H=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["f"],J=H,K=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["n"],N=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["g"],Q=_vec4_js__WEBPACK_IMPORTED_MODULE_5__["h"];function S(t,s,a){const n=Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["d"])(s,a);return n<-.999999?(Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["c"])(U,V,s),Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["u"])(U)<1e-6&&Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["c"])(U,$,s),Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["n"])(U,U),A(t,U,Math.PI),t):n>.999999?(t[0]=0,t[1]=0,t[2]=0,t[3]=1,t):(Object(_vec3_js__WEBPACK_IMPORTED_MODULE_4__["c"])(U,s,a),t[0]=U[0],t[1]=U[1],t[2]=U[2],t[3]=1+n,K(t,t))}const U=Object(_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),V=Object(_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["f"])(1,0,0),$=Object(_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["f"])(0,1,0);function tt(t,s,a,n,o,r){return z(st,s,o,r),z(at,a,n,r),z(t,st,at,2*r*(1-r)),t}const st=Object(_quatf64_js__WEBPACK_IMPORTED_MODULE_1__["a"])(),at=Object(_quatf64_js__WEBPACK_IMPORTED_MODULE_1__["a"])();function nt(t,s,a,n){const o=ot;return o[0]=a[0],o[3]=a[1],o[6]=a[2],o[1]=n[0],o[4]=n[1],o[7]=n[2],o[2]=-s[0],o[5]=-s[1],o[8]=-s[2],K(t,B(t,o))}const ot=Object(_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])();var rt=Object.freeze({__proto__:null,identity:x,setAxisAngle:A,getAxisAngle:I,multiply:P,rotateX:b,rotateY:y,rotateZ:E,calculateW:_,slerp:z,random:L,invert:k,conjugate:w,fromMat3:B,fromEuler:C,str:D,copy:F,set:G,add:O,mul:R,scale:T,dot:W,lerp:X,length:Y,len:Z,squaredLength:H,sqrLen:J,normalize:K,exactEquals:N,equals:Q,rotationTo:S,sqlerp:tt,setAxes:nt});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec32.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec32.js ***!
  \****************************************************/
/*! exports provided: a, b, n, s, t, v */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return u; });
/* harmony import */ var _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry/support/buffer/math/common.js */ "../node_modules/@arcgis/core/geometry/support/buffer/math/common.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,f,r){if(e.count!==f.count)return void _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__["logger"].error("source and destination buffers need to have the same number of elements");const o=e.count,n=r[0],u=r[1],d=r[2],s=r[4],c=r[5],i=r[6],a=r[8],p=r[9],y=r[10],B=r[12],m=r[13],h=r[14],l=e.typedBuffer,S=e.typedBufferStride,b=f.typedBuffer,v=f.typedBufferStride;for(let t=0;t<o;t++){const e=t*S,f=t*v,r=b[f],o=b[f+1],M=b[f+2];l[e]=n*r+s*o+a*M+B,l[e+1]=u*r+c*o+p*M+m,l[e+2]=d*r+i*o+y*M+h}}function f(e,f,r){if(e.count!==f.count)return void _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__["logger"].error("source and destination buffers need to have the same number of elements");const o=e.count,n=r[0],u=r[1],d=r[2],s=r[3],c=r[4],i=r[5],a=r[6],p=r[7],y=r[8],B=e.typedBuffer,m=e.typedBufferStride,h=f.typedBuffer,l=f.typedBufferStride;for(let t=0;t<o;t++){const e=t*m,f=t*l,r=h[f],o=h[f+1],S=h[f+2];B[e]=n*r+s*o+a*S,B[e+1]=u*r+c*o+p*S,B[e+2]=d*r+i*o+y*S}}function r(t,e,f){const r=Math.min(t.count,e.count),o=t.typedBuffer,n=t.typedBufferStride,u=e.typedBuffer,d=e.typedBufferStride;for(let s=0;s<r;s++){const t=s*n,e=s*d;o[t]=f*u[e],o[t+1]=f*u[e+1],o[t+2]=f*u[e+2]}}function o(t,e){const f=Math.min(t.count,e.count),r=t.typedBuffer,o=t.typedBufferStride,n=e.typedBuffer,u=e.typedBufferStride;for(let d=0;d<f;d++){const t=d*o,e=d*u,f=n[e],s=n[e+1],c=n[e+2],i=Math.sqrt(f*f+s*s+c*c);if(i>0){const e=1/i;r[t]=e*f,r[t+1]=e*s,r[t+2]=e*c}}}function n(t,e,f){const r=Math.min(t.count,e.count),o=t.typedBuffer,n=t.typedBufferStride,u=e.typedBuffer,d=e.typedBufferStride;for(let s=0;s<r;s++){const t=s*n,e=s*d;o[t]=u[e]>>f,o[t+1]=u[e+1]>>f,o[t+2]=u[e+2]>>f}}var u=Object.freeze({__proto__:null,transformMat4:e,transformMat3:f,scale:r,normalize:o,shiftRight:n});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec33.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec33.js ***!
  \****************************************************/
/*! exports provided: c, f, v */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,t,n){const d=e.typedBuffer,f=e.typedBufferStride,r=t.typedBuffer,u=t.typedBufferStride,l=n?n.count:t.count;let o=(n&&n.dstIndex?n.dstIndex:0)*f,c=(n&&n.srcIndex?n.srcIndex:0)*u;for(let s=0;s<l;++s)d[o]=r[c],d[o+1]=r[c+1],d[o+2]=r[c+2],o+=f,c+=u}function t(e,t,n,d,f){var r,u;const l=e.typedBuffer,o=e.typedBufferStride,c=null!=(r=null==f?void 0:f.count)?r:e.count;let s=(null!=(u=null==f?void 0:f.dstIndex)?u:0)*o;for(let p=0;p<c;++p)l[s]=t,l[s+1]=n,l[s+2]=d,s+=o}var n=Object.freeze({__proto__:null,copy:e,fill:t});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec3f32.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec3f32.js ***!
  \******************************************************/
/*! exports provided: O, U, Z, a, b, c, d, e, f, g, h, o, u, v, z */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "O", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "U", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Z", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(){return new Float32Array(3)}function r(n){const r=new Float32Array(3);return r[0]=n[0],r[1]=n[1],r[2]=n[2],r}function t(n,r,t){const a=new Float32Array(3);return a[0]=n,a[1]=r,a[2]=t,a}function a(n,r){return new Float32Array(n,r,3)}function e(){return n()}function o(){return t(1,1,1)}function u(){return t(1,0,0)}function s(){return t(0,1,0)}function c(){return t(0,0,1)}const i=e(),f=o(),l=u(),_=s(),w=c();var y=Object.freeze({__proto__:null,create:n,clone:r,fromValues:t,createView:a,zeros:e,ones:o,unitX:u,unitY:s,unitZ:c,ZEROS:i,ONES:f,UNIT_X:l,UNIT_Y:_,UNIT_Z:w});


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/buffer/math/common.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/buffer/math/common.js ***!
  \***************************************************************************/
/*! exports provided: logger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logger", function() { return e; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.3d.support.buffer.math");


/***/ }),

/***/ "../node_modules/@arcgis/core/libs/basisu/BasisU.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/libs/basisu/BasisU.js ***!
  \**********************************************************/
/*! exports provided: getBasisTranscoder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBasisTranscoder", function() { return s; });
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../assets.js */ "../node_modules/@arcgis/core/assets.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(i)){const t=t=>Object(_assets_js__WEBPACK_IMPORTED_MODULE_0__["getAssetUrl"])(`esri/libs/basisu/${t}`);i=__webpack_require__.e(/*! import() */ 129).then(__webpack_require__.bind(null, /*! ../../chunks/basis_transcoder.js */ "../node_modules/@arcgis/core/chunks/basis_transcoder.js")).then((function(e){return e.b})).then((({default:e})=>e({locateFile:t}).then((e=>(e.initializeBasis(),delete e.then,e)))))}return i}let i;


/***/ }),

/***/ "../node_modules/@arcgis/core/support/requestImageUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/requestImageUtils.js ***!
  \*****************************************************************/
/*! exports provided: requestImage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "requestImage", function() { return t; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function t(t,r){const{data:a}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t,{responseType:"image",...r});return a}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/graphics/objectResourceUtils.js":
/*!************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/graphics/objectResourceUtils.js ***!
  \************************************************************************************/
/*! exports provided: fetch, gltfToEngineResources, parseUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetch", function() { return $; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gltfToEngineResources", function() { return K; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseUrl", function() { return q; });
/* harmony import */ var _core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/devEnvironmentUtils.js */ "../node_modules/@arcgis/core/core/devEnvironmentUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_mat3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../chunks/mat3.js */ "../node_modules/@arcgis/core/chunks/mat3.js");
/* harmony import */ var _chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../chunks/mat3f64.js */ "../node_modules/@arcgis/core/chunks/mat3f64.js");
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../geometry/support/aaBoundingBox.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js");
/* harmony import */ var _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../geometry/support/buffer/BufferView.js */ "../node_modules/@arcgis/core/geometry/support/buffer/BufferView.js");
/* harmony import */ var _chunks_vec32_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../chunks/vec32.js */ "../node_modules/@arcgis/core/chunks/vec32.js");
/* harmony import */ var _chunks_vec42_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../chunks/vec42.js */ "../node_modules/@arcgis/core/chunks/vec42.js");
/* harmony import */ var _geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../geometry/support/buffer/utils.js */ "../node_modules/@arcgis/core/geometry/support/buffer/utils.js");
/* harmony import */ var _glTF_DefaultLoadingContext_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../glTF/DefaultLoadingContext.js */ "../node_modules/@arcgis/core/views/3d/glTF/DefaultLoadingContext.js");
/* harmony import */ var _glTF_loader_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../glTF/loader.js */ "../node_modules/@arcgis/core/views/3d/glTF/loader.js");
/* harmony import */ var _glTF_internal_indexUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../glTF/internal/indexUtils.js */ "../node_modules/@arcgis/core/views/3d/glTF/internal/indexUtils.js");
/* harmony import */ var _wosrLoader_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./wosrLoader.js */ "../node_modules/@arcgis/core/views/3d/layers/graphics/wosrLoader.js");
/* harmony import */ var _webgl_engine_lib_Geometry_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../webgl-engine/lib/Geometry.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Geometry.js");
/* harmony import */ var _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../webgl-engine/lib/Texture.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Texture.js");
/* harmony import */ var _webgl_engine_materials_DefaultMaterial_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../webgl-engine/materials/DefaultMaterial.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial.js");
/* harmony import */ var _webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../webgl-engine/materials/DefaultMaterial_COLOR_GAMMA.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial_COLOR_GAMMA.js");
/* harmony import */ var _chunks_vec22_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../../chunks/vec22.js */ "../node_modules/@arcgis/core/chunks/vec22.js");
/* harmony import */ var _chunks_vec43_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../../chunks/vec43.js */ "../node_modules/@arcgis/core/chunks/vec43.js");
/* harmony import */ var _chunks_vec33_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../../chunks/vec33.js */ "../node_modules/@arcgis/core/chunks/vec33.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function $(s,o){const i=q(Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_0__["adjustStaticAGOUrl"])(s));if("wosr"===i.fileType){const e=await(o.cache?o.cache.loadWOSR(i.url,o):Object(_wosrLoader_js__WEBPACK_IMPORTED_MODULE_16__["load"])(i.url,o)),t=Object(_wosrLoader_js__WEBPACK_IMPORTED_MODULE_16__["processLoadResult"])(e,o);return{lods:[t],referenceBoundingBox:t.boundingBox,isEsriSymbolResource:!1,isWosr:!0,remove:e.remove}}const a=await(o.cache?o.cache.loadGLTF(i.url,o,o.usePBR):Object(_glTF_loader_js__WEBPACK_IMPORTED_MODULE_14__["load"])(new _glTF_DefaultLoadingContext_js__WEBPACK_IMPORTED_MODULE_13__["DefaultLoadingContext"](o.streamDataRequester),i.url,o,o.usePBR)),u=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["get"])(a.model.meta,"ESRI_proxyEllipsoid");a.meta.isEsriSymbolResource&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(u)&&-1!==a.meta.uri.indexOf("/RealisticTrees/")&&J(a,u);const n=a.meta.isEsriSymbolResource?{usePBR:o.usePBR,isSchematic:!1,treeRendering:a.customMeta.esriTreeRendering,mrrFactors:[0,1,.2]}:{usePBR:o.usePBR,isSchematic:!1,mrrFactors:[0,1,.5]},l={...o.materialParamsMixin,treeRendering:a.customMeta.esriTreeRendering};if(null!=i.specifiedLodIndex){const e=K(a,n,l,i.specifiedLodIndex);let t=e[0].boundingBox;if(0!==i.specifiedLodIndex){t=K(a,n,l,0)[0].boundingBox}return{lods:e,referenceBoundingBox:t,isEsriSymbolResource:a.meta.isEsriSymbolResource,isWosr:!1,remove:a.remove}}const c=K(a,n,l);return{lods:c,referenceBoundingBox:c[0].boundingBox,isEsriSymbolResource:a.meta.isEsriSymbolResource,isWosr:!1,remove:a.remove}}function q(e){const t=e.match(/(.*\.(gltf|glb))(\?lod=([0-9]+))?$/);if(t)return{fileType:"gltf",url:t[1],specifiedLodIndex:null!=t[4]?Number(t[4]):null};return e.match(/(.*\.(json|json\.gz))$/)?{fileType:"wosr",url:e,specifiedLodIndex:null}:{fileType:"unknown",url:e,specifiedLodIndex:null}}function K(e,t,s,a){const u=e.model,n=Object(_chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),l=new Array,c=new Map,m=new Map;return u.lods.forEach(((e,i)=>{if(void 0!==a&&i!==a)return;const d={name:e.name,stageResources:{textures:new Array,materials:new Array,geometries:new Array},lodThreshold:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.lodThreshold)?e.lodThreshold:null,pivotOffset:[0,0,0],numberOfVertices:0,boundingBox:Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["empty"])()};l.push(d),e.parts.forEach((e=>{const i=e.material+(e.attributes.normal?"_normal":"")+(e.attributes.color?"_color":"")+(e.attributes.texCoord0?"_texCoord0":"")+(e.attributes.tangent?"_tangent":""),a=u.materials.get(e.material),l=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.texCoord0),f=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.normal),p=Q(a.alphaMode);if(!c.has(i)){if(l){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureColor)&&!m.has(a.textureColor)){const e=u.textures.get(a.textureColor),t={...e.parameters,preMultiplyAlpha:1!==p};m.set(a.textureColor,new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__["Texture"](e.data,t))}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureNormal)&&!m.has(a.textureNormal)){const e=u.textures.get(a.textureNormal);m.set(a.textureNormal,new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__["Texture"](e.data,e.parameters))}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureOcclusion)&&!m.has(a.textureOcclusion)){const e=u.textures.get(a.textureOcclusion);m.set(a.textureOcclusion,new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__["Texture"](e.data,e.parameters))}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureEmissive)&&!m.has(a.textureEmissive)){const e=u.textures.get(a.textureEmissive);m.set(a.textureEmissive,new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__["Texture"](e.data,e.parameters))}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureMetallicRoughness)&&!m.has(a.textureMetallicRoughness)){const e=u.textures.get(a.textureMetallicRoughness);m.set(a.textureMetallicRoughness,new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_18__["Texture"](e.data,e.parameters))}}const o=a.color[0]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),n=a.color[1]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),d=a.color[2]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),x=a.emissiveFactor[0]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),g=a.emissiveFactor[1]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),h=a.emissiveFactor[2]**(1/_webgl_engine_materials_DefaultMaterial_COLOR_GAMMA_js__WEBPACK_IMPORTED_MODULE_20__["COLOR_GAMMA"]),b=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureColor)&&l?m.get(a.textureColor):null;c.set(i,new _webgl_engine_materials_DefaultMaterial_js__WEBPACK_IMPORTED_MODULE_19__["DefaultMaterial"]({...t,transparent:0===p,textureAlphaMode:p,textureAlphaCutoff:a.alphaCutoff,diffuse:[o,n,d],ambient:[o,n,d],opacity:a.opacity,doubleSided:a.doubleSided,doubleSidedType:"winding-order",cullFace:a.doubleSided?0:2,vertexColors:!!e.attributes.color,vertexTangents:!!e.attributes.tangent,normals:f?"default":"screenDerivative",castShadows:!0,receiveSSAO:!0,textureId:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(b)?b.id:void 0,colorMixMode:a.colorMixMode,normalTextureId:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureNormal)&&l?m.get(a.textureNormal).id:void 0,textureAlphaPremultiplied:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(b)&&!!b.params.preMultiplyAlpha,occlusionTextureId:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureOcclusion)&&l?m.get(a.textureOcclusion).id:void 0,emissiveTextureId:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureEmissive)&&l?m.get(a.textureEmissive).id:void 0,metallicRoughnessTextureId:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureMetallicRoughness)&&l?m.get(a.textureMetallicRoughness).id:void 0,emissiveFactor:[x,g,h],mrrFactors:[a.metallicFactor,a.roughnessFactor,t.mrrFactors[2]],isSchematic:!1,...s}))}const x=H(e.indices||e.attributes.position.count,e.primitiveType),O=e.attributes.position.count,F=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3f"],O);Object(_chunks_vec32_js__WEBPACK_IMPORTED_MODULE_10__["t"])(F,e.attributes.position,e.transform);const A=[["position",{data:F.typedBuffer,size:F.elementCount,exclusive:!0}]],I=[["position",x]];if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.normal)){const t=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3f"],O);Object(_chunks_mat3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(n,e.transform),Object(_chunks_vec32_js__WEBPACK_IMPORTED_MODULE_10__["a"])(t,e.attributes.normal,n),A.push(["normal",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),I.push(["normal",x])}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.tangent)){const t=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4f"],O);Object(_chunks_mat3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(n,e.transform),Object(_chunks_vec42_js__WEBPACK_IMPORTED_MODULE_11__["t"])(t,e.attributes.tangent,n),A.push(["tangent",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),I.push(["tangent",x])}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.texCoord0)){const t=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec2f"],O);Object(_chunks_vec22_js__WEBPACK_IMPORTED_MODULE_21__["n"])(t,e.attributes.texCoord0),A.push(["uv0",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),I.push(["uv0",x])}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e.attributes.color)){const t=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4u8"],O);if(4===e.attributes.color.elementCount)e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4f"]?Object(_chunks_vec42_js__WEBPACK_IMPORTED_MODULE_11__["s"])(t,e.attributes.color,255):e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4u8"]?Object(_chunks_vec43_js__WEBPACK_IMPORTED_MODULE_22__["c"])(t,e.attributes.color):e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4u16"]&&Object(_chunks_vec42_js__WEBPACK_IMPORTED_MODULE_11__["s"])(t,e.attributes.color,1/256);else{Object(_chunks_vec43_js__WEBPACK_IMPORTED_MODULE_22__["f"])(t,255,255,255,255);const r=new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3u8"](t.buffer,0,4);e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3f"]?Object(_chunks_vec32_js__WEBPACK_IMPORTED_MODULE_10__["s"])(r,e.attributes.color,255):e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3u8"]?Object(_chunks_vec33_js__WEBPACK_IMPORTED_MODULE_23__["c"])(r,e.attributes.color):e.attributes.color instanceof _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3u16"]&&Object(_chunks_vec32_js__WEBPACK_IMPORTED_MODULE_10__["s"])(r,e.attributes.color,1/256)}A.push(["color",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),I.push(["color",x])}const k=new _webgl_engine_lib_Geometry_js__WEBPACK_IMPORTED_MODULE_17__["Geometry"](A,I);d.stageResources.geometries.push(k),d.stageResources.materials.push(c.get(i)),l&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureColor)&&d.stageResources.textures.push(m.get(a.textureColor)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureNormal)&&d.stageResources.textures.push(m.get(a.textureNormal)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureOcclusion)&&d.stageResources.textures.push(m.get(a.textureOcclusion)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureEmissive)&&d.stageResources.textures.push(m.get(a.textureEmissive)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.textureMetallicRoughness)&&d.stageResources.textures.push(m.get(a.textureMetallicRoughness))),d.numberOfVertices+=O;const L=k.boundingInfo;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(L)&&(Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["expandWithVec3"])(d.boundingBox,L.getBBMin()),Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["expandWithVec3"])(d.boundingBox,L.getBBMax()))}))})),l}function Q(e){switch(e){case"BLEND":return 0;case"MASK":return 2;case"OPAQUE":case null:case void 0:return 1}}function H(e,t){switch(t){case 4:return Object(_glTF_internal_indexUtils_js__WEBPACK_IMPORTED_MODULE_15__["trianglesToTriangles"])(e);case 5:return Object(_glTF_internal_indexUtils_js__WEBPACK_IMPORTED_MODULE_15__["triangleStripToTriangles"])(e);case 6:return Object(_glTF_internal_indexUtils_js__WEBPACK_IMPORTED_MODULE_15__["triangleFanToTriangles"])(e)}}function J(e,t){for(let r=0;r<e.model.lods.length;++r){const o=e.model.lods[r];e.customMeta.esriTreeRendering=!0;for(const i of o.parts){const o=i.attributes.normal;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(o))return;const x=i.attributes.position,g=x.count,b=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__["c"])(),v=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__["c"])(),y=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__["c"])(),B=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec4u8"],g),M=Object(_geometry_support_buffer_utils_js__WEBPACK_IMPORTED_MODULE_12__["createBuffer"])(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_9__["BufferViewVec3f"],g),w=Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["b"])(Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__["c"])(),i.transform);for(let s=0;s<g;s++){x.getVec(s,v),o.getVec(s,b),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["m"])(v,v,i.transform),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["f"])(y,v,t.center),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["E"])(y,y,t.radius);const a=y[2],u=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["l"])(y),p=Math.min(.45+.55*u*u,1);Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["E"])(y,y,t.radius),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["m"])(y,y,w),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["n"])(y,y),r+1!==e.model.lods.length&&e.model.lods.length>1&&Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_6__["e"])(y,y,b,a>-1?.2:Math.min(-4*a-3.8,1)),M.setVec(s,y),B.set(s,0,255*p),B.set(s,1,255*p),B.set(s,2,255*p),B.set(s,3,255)}i.attributes.normal=M,i.attributes.color=B}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/graphics/wosrLoader.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/graphics/wosrLoader.js ***!
  \***************************************************************************/
/*! exports provided: createTextureResources, load, processLoadResult */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTextureResources", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processLoadResult", function() { return b; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_Version_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../core/Version.js */ "../node_modules/@arcgis/core/core/Version.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../geometry/support/aaBoundingBox.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js");
/* harmony import */ var _support_requestImageUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../support/requestImageUtils.js */ "../node_modules/@arcgis/core/support/requestImageUtils.js");
/* harmony import */ var _webgl_engine_lib_Geometry_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../webgl-engine/lib/Geometry.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Geometry.js");
/* harmony import */ var _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../webgl-engine/lib/Texture.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Texture.js");
/* harmony import */ var _webgl_engine_materials_DefaultMaterial_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../webgl-engine/materials/DefaultMaterial.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const y=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.views.3d.layers.graphics.objectResourceUtils");async function x(e,t){const r=await g(e,t);return{resource:r,textures:await A(r.textureDefinitions,t)}}async function g(r,n){const i=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(n)&&n.streamDataRequester;if(i)return h(r,i,n);const u=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_1__["result"])(Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["unwrap"])(n)));if(!0===u.ok)return u.value.data;Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["throwIfAbortError"])(u.error),w(u.error)}async function h(e,r,n){const a=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_1__["result"])(r.request(e,"json",n));if(!0===a.ok)return a.value;Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["throwIfAbortError"])(a.error),w(a.error.details.url)}function w(e){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("",`Request for object resource failed: ${e}`)}function v(e){const t=e.params,r=t.topology;let n=!0;switch(t.vertexAttributes||(y.warn("Geometry must specify vertex attributes"),n=!1),t.topology){case"PerAttributeArray":break;case"Indexed":case null:case void 0:{const e=t.faces;if(e){if(t.vertexAttributes)for(const r in t.vertexAttributes){const t=e[r];t&&t.values?(null!=t.valueType&&"UInt32"!==t.valueType&&(y.warn(`Unsupported indexed geometry indices type '${t.valueType}', only UInt32 is currently supported`),n=!1),null!=t.valuesPerElement&&1!==t.valuesPerElement&&(y.warn(`Unsupported indexed geometry values per element '${t.valuesPerElement}', only 1 is currently supported`),n=!1)):(y.warn(`Indexed geometry does not specify face indices for '${r}' attribute`),n=!1)}}else y.warn("Indexed geometries must specify faces"),n=!1;break}default:y.warn(`Unsupported topology '${r}'`),n=!1}e.params.material||(y.warn("Geometry requires material"),n=!1);const a=e.params.vertexAttributes;for(const s in a){a[s].values||(y.warn("Geometries with externally defined attributes are not yet supported"),n=!1)}return n}function b(e,t){const r=[],n=[],s=[],o=[],l=e.resource,c=_core_Version_js__WEBPACK_IMPORTED_MODULE_6__["Version"].parse(l.version||"1.0","wosr");I.validate(c);const p=l.model.name,y=l.model.geometries,x=l.materialDefinitions,g=e.textures;let h=0;const w=new Map;for(let i=0;i<y.length;i++){const e=y[i];if(!v(e))continue;const l=M(e),c=e.params.vertexAttributes,p=[];for(const t in c){const e=c[t],r=e.values;p.push([t,{data:r,size:e.valuesPerElement,exclusive:!0}])}const b=[];if("PerAttributeArray"!==e.params.topology){const t=e.params.faces;for(const e in t)b.push([e,new Uint32Array(t[e].values)])}const j=g&&g[l.texture];if(j&&!w.has(l.texture)){const{image:e,params:t}=j,r=new _webgl_engine_lib_Texture_js__WEBPACK_IMPORTED_MODULE_11__["Texture"](e,t);o.push(r),w.set(l.texture,r)}const A=w.get(l.texture),I=A?A.id:void 0;let P=s[l.material]?s[l.material][l.texture]:null;if(!P){const e=x[l.material.substring(l.material.lastIndexOf("/")+1)].params;1===e.transparency&&(e.transparency=0);const r=j&&j.alphaChannelUsage,n=e.transparency>0||"transparency"===r||"maskAndTransparency"===r,o=j?U(j.alphaChannelUsage):void 0,i={ambient:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__["d"])(e.diffuse),diffuse:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_7__["d"])(e.diffuse),opacity:1-(e.transparency||0),transparent:n,textureAlphaMode:o,textureAlphaCutoff:.33,textureId:I,initTextureTransparent:!0,doubleSided:!0,cullFace:0,colorMixMode:e.externalColorMixMode||"tint",textureAlphaPremultiplied:!!j&&!!j.params.preMultiplyAlpha};Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(t)&&t.materialParamsMixin&&Object.assign(i,t.materialParamsMixin),P=new _webgl_engine_materials_DefaultMaterial_js__WEBPACK_IMPORTED_MODULE_12__["DefaultMaterial"](i),s[l.material]||(s[l.material]={}),s[l.material][l.texture]=P}n.push(P);const T=new _webgl_engine_lib_Geometry_js__WEBPACK_IMPORTED_MODULE_10__["Geometry"](p,b);h+=b.position?b.position.length:0,r.push(T)}return{name:p,stageResources:{textures:o,materials:n,geometries:r},pivotOffset:l.model.pivotOffset,boundingBox:j(r),numberOfVertices:h,lodThreshold:null}}function j(e){const t=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["empty"])();return e.forEach((e=>{const r=e.boundingInfo;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(r)&&(Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["expandWithVec3"])(t,r.getBBMin()),Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_8__["expandWithVec3"])(t,r.getBBMax()))})),t}async function A(e,t){const r=[];for(const o in e){const n=e[o],s=n.images[0].data;if(!s){y.warn("Externally referenced texture data is not yet supported");continue}const i=n.encoding+";base64,"+s,u="/textureDefinitions/"+o,l="rgba"===n.channels?n.alphaChannelUsage||"transparency":"none",c={noUnpackFlip:!0,wrap:{s:10497,t:10497},preMultiplyAlpha:1!==U(l)},m=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(t)&&t.disableTextures?Promise.resolve(null):Object(_support_requestImageUtils_js__WEBPACK_IMPORTED_MODULE_9__["requestImage"])(i,t);r.push(m.then((e=>({refId:u,image:e,params:c,alphaChannelUsage:l}))))}const n=await Promise.all(r),s={};for(const a of n)s[a.refId]=a;return s}function U(e){switch(e){case"mask":return 2;case"maskAndTransparency":return 3;case"none":return 1;default:return 0}}function M(e){const t=e.params;return{id:1,material:t.material,texture:t.texture,region:t.texture}}const I=new _core_Version_js__WEBPACK_IMPORTED_MODULE_6__["Version"](1,2,"wosr");


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/support/buffer/InterleavedLayout.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/support/buffer/InterleavedLayout.js ***!
  \*********************************************************************************/
/*! exports provided: InterleavedBuffer, InterleavedLayout, newLayout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InterleavedBuffer", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InterleavedLayout", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "newLayout", function() { return A; });
/* harmony import */ var _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../geometry/support/buffer/BufferView.js */ "../node_modules/@arcgis/core/geometry/support/buffer/BufferView.js");
/* harmony import */ var _geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../geometry/support/buffer/types.js */ "../node_modules/@arcgis/core/geometry/support/buffer/types.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class N{constructor(e,t){this.layout=e,this.buffer="number"==typeof t?new ArrayBuffer(t*e.stride):t;for(const i of e.fieldNames){const t=e.fields.get(i);this[i]=new t.constructor(this.buffer,t.offset,this.stride)}}get stride(){return this.layout.stride}get count(){return this.buffer.byteLength/this.stride}get byteLength(){return this.buffer.byteLength}getField(e,t){const i=this[e];return i&&i.elementCount===t.ElementCount&&i.elementType===t.ElementType?i:null}slice(e,t){return new N(this.layout,this.buffer.slice(e*this.stride,t*this.stride))}copyFrom(e,t,i,s){const r=this.stride;if(r%4==0){const n=new Uint32Array(e.buffer,t*r,s*r/4);new Uint32Array(this.buffer,i*r,s*r/4).set(n)}else{const n=new Uint8Array(e.buffer,t*r,s*r);new Uint8Array(this.buffer,i*r,s*r).set(n)}}}class T{constructor(){this.stride=0,this.fields=new Map,this.fieldNames=[]}vec2f(t,i){return this.appendField(t,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2f"],i),this}vec2f64(e,i){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2f64"],i),this}vec3f(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3f"],t),this}vec3f64(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3f64"],t),this}vec4f(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4f"],t),this}vec4f64(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4f64"],t),this}mat3f(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat3f"],t),this}mat3f64(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat3f64"],t),this}mat4f(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat4f"],t),this}mat4f64(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat4f64"],t),this}vec4u8(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4u8"],t),this}f32(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewFloat"],t),this}f64(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewFloat64"],t),this}u8(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint8"],t),this}u16(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint16"],t),this}i8(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewInt8"],t),this}vec2i8(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2i8"],t),this}vec2i16(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2i16"],t),this}vec2u8(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2u8"],t),this}vec4u16(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4u16"],t),this}u32(e,t){return this.appendField(e,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint32"],t),this}appendField(e,t,i){const s=t.ElementCount*Object(_geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_1__["elementTypeSize"])(t.ElementType),r=this.stride;this.fields.set(e,{size:s,constructor:t,offset:r,optional:i}),this.stride+=s,this.fieldNames.push(e)}alignTo(e){return this.stride=Math.floor((this.stride+e-1)/e)*e,this}hasField(e){return this.fieldNames.indexOf(e)>=0}createBuffer(e){return new N(this,e)}createView(e){return new N(this,e)}clone(){const e=new T;return e.stride=this.stride,e.fields=new Map,this.fields.forEach(((t,i)=>e.fields.set(i,t))),e.fieldNames=this.fieldNames.slice(),e.BufferType=this.BufferType,e}}function A(){return new T}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/collections/Component/Material/shader/DecodeSymbolColor.glsl.js":
/*!**************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/collections/Component/Material/shader/DecodeSymbolColor.glsl.js ***!
  \**************************************************************************************************************************/
/*! exports provided: DecodeSymbolColor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DecodeSymbolColor", function() { return l; });
/* harmony import */ var _core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function l(l){l.vertex.code.add(_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
    vec4 decodeSymbolColor(vec4 symbolColor, out int colorMixMode) {
      float symbolAlpha = 0.0;

      const float maxTint = 85.0;
      const float maxReplace = 170.0;
      const float scaleAlpha = 3.0;

      if (symbolColor.a > maxReplace) {
        colorMixMode = ${_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"].int(1)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxReplace);
      } else if (symbolColor.a > maxTint) {
        colorMixMode = ${_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"].int(3)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxTint);
      } else if (symbolColor.a > 0.0) {
        colorMixMode = ${_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"].int(4)};
        symbolAlpha = scaleAlpha * symbolColor.a;
      } else {
        colorMixMode = ${_core_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"].int(1)};
        symbolAlpha = 0.0;
      }

      return vec4(symbolColor.r, symbolColor.g, symbolColor.b, symbolAlpha);
    }
  `)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js":
/*!********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/ForwardLinearDepth.glsl.js ***!
  \********************************************************************************************************/
/*! exports provided: ForwardLinearDepth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ForwardLinearDepth", function() { return a; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a,r){0===r.output&&r.receiveShadows?(a.varyings.add("linearDepth","float"),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardLinearDepth() { linearDepth = gl_Position.w; }`)):1===r.output||3===r.output?(a.varyings.add("linearDepth","float"),a.vertex.uniforms.add("cameraNearFar","vec2"),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardLinearDepth() {
linearDepth = (-position_view().z - cameraNearFar[0]) / (cameraNearFar[1] - cameraNearFar[0]);
}`)):a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardLinearDepth() {}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Offset.glsl.js ***!
  \********************************************************************************************/
/*! exports provided: Offset */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Offset", function() { return e; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e){e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 offsetBackfacingClipPosition(vec4 posClip, vec3 posWorld, vec3 normalWorld, vec3 camPosWorld) {
vec3 camToVert = posWorld - camPosWorld;
bool isBackface = dot(camToVert, normalWorld) > 0.0;
if (isBackface) {
posClip.z += 0.0000003 * posClip.w;
}
return posClip;
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js":
/*!*******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js ***!
  \*******************************************************************************************/
/*! exports provided: Slice, bindSliceUniforms, bindSliceUniformsWithOrigin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Slice", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindSliceUniforms", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindSliceUniformsWithOrigin", function() { return l; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function c(e,s){if(s.slicePlaneEnabled){e.extensions.add("GL_OES_standard_derivatives"),s.sliceEnabledForVertexPrograms&&(e.vertex.uniforms.add("slicePlaneOrigin","vec3"),e.vertex.uniforms.add("slicePlaneBasis1","vec3"),e.vertex.uniforms.add("slicePlaneBasis2","vec3")),e.fragment.uniforms.add("slicePlaneOrigin","vec3"),e.fragment.uniforms.add("slicePlaneBasis1","vec3"),e.fragment.uniforms.add("slicePlaneBasis2","vec3");const i=_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__["glsl"]`struct SliceFactors {
float front;
float side0;
float side1;
float side2;
float side3;
};
SliceFactors calculateSliceFactors(vec3 pos) {
vec3 rel = pos - slicePlaneOrigin;
vec3 slicePlaneNormal = -cross(slicePlaneBasis1, slicePlaneBasis2);
float slicePlaneW = -dot(slicePlaneNormal, slicePlaneOrigin);
float basis1Len2 = dot(slicePlaneBasis1, slicePlaneBasis1);
float basis2Len2 = dot(slicePlaneBasis2, slicePlaneBasis2);
float basis1Dot = dot(slicePlaneBasis1, rel);
float basis2Dot = dot(slicePlaneBasis2, rel);
return SliceFactors(
dot(slicePlaneNormal, pos) + slicePlaneW,
-basis1Dot - basis1Len2,
basis1Dot - basis1Len2,
-basis2Dot - basis2Len2,
basis2Dot - basis2Len2
);
}
bool sliceByFactors(SliceFactors factors) {
return factors.front < 0.0
&& factors.side0 < 0.0
&& factors.side1 < 0.0
&& factors.side2 < 0.0
&& factors.side3 < 0.0;
}
bool sliceEnabled() {
return dot(slicePlaneBasis1, slicePlaneBasis1) != 0.0;
}
bool sliceByPlane(vec3 pos) {
return sliceEnabled() && sliceByFactors(calculateSliceFactors(pos));
}
#define rejectBySlice(_pos_) sliceByPlane(_pos_)
#define discardBySlice(_pos_) { if (sliceByPlane(_pos_)) discard; }`,a=_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__["glsl"]`vec4 applySliceHighlight(vec4 color, vec3 pos) {
SliceFactors factors = calculateSliceFactors(pos);
if (sliceByFactors(factors)) {
return color;
}
const float HIGHLIGHT_WIDTH = 1.0;
const vec4 HIGHLIGHT_COLOR = vec4(0.0, 0.0, 0.0, 0.3);
factors.front /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.front);
factors.side0 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side0);
factors.side1 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side1);
factors.side2 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side2);
factors.side3 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side3);
float highlightFactor = (1.0 - step(0.5, factors.front))
* (1.0 - step(0.5, factors.side0))
* (1.0 - step(0.5, factors.side1))
* (1.0 - step(0.5, factors.side2))
* (1.0 - step(0.5, factors.side3));
return mix(color, vec4(HIGHLIGHT_COLOR.rgb, color.a), highlightFactor * HIGHLIGHT_COLOR.a);
}`,c=s.sliceHighlightDisabled?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__["glsl"]`#define highlightSlice(_color_, _pos_) (_color_)`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__["glsl"]`
        ${a}
        #define highlightSlice(_color_, _pos_) (sliceEnabled() ? applySliceHighlight(_color_, _pos_) : (_color_))
      `;s.sliceEnabledForVertexPrograms&&e.vertex.code.add(i),e.fragment.code.add(i),e.fragment.code.add(c)}else{const i=_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_3__["glsl"]`#define rejectBySlice(_pos_) false
#define discardBySlice(_pos_) {}
#define highlightSlice(_color_, _pos_) (_color_)`;s.sliceEnabledForVertexPrograms&&e.vertex.code.add(i),e.fragment.code.add(i)}}function l(e,s,i){r(e,s,i.slicePlane,i.origin)}function r(a,o,c,l){o.slicePlaneEnabled&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(c)?(l?(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["f"])(t,c.origin,l),a.setUniform3fv("slicePlaneOrigin",t)):a.setUniform3fv("slicePlaneOrigin",c.origin),a.setUniform3fv("slicePlaneBasis1",c.basis1),a.setUniform3fv("slicePlaneBasis2",c.basis2)):(a.setUniform3fv("slicePlaneBasis1",_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["Z"]),a.setUniform3fv("slicePlaneBasis2",_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["Z"]),a.setUniform3fv("slicePlaneOrigin",_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["Z"])))}const t=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js":
/*!***********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js ***!
  \***********************************************************************************************/
/*! exports provided: Transform */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Transform", function() { return r; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,o){o.linearDepth?r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 transformPositionWithDepth(mat4 proj, mat4 view, vec3 pos, vec2 nearFar, out float depth) {
vec4 eye = view * vec4(pos, 1.0);
depth = (-eye.z - nearFar[0]) / (nearFar[1] - nearFar[0]) ;
return proj * eye;
}`):r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 transformPosition(mat4 proj, mat4 view, vec3 pos) {
return proj * (view * vec4(pos, 1.0));
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js":
/*!*************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js ***!
  \*************************************************************************************************************************/
/*! exports provided: InstancedDoublePrecision */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InstancedDoublePrecision", function() { return o; });
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/DoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _lib_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../lib/doublePrecisionUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/doublePrecisionUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(e,n){n.instanced&&n.instancedDoublePrecision&&(e.attributes.add("modelOriginHi","vec3"),e.attributes.add("modelOriginLo","vec3"),e.attributes.add("model","mat3"),e.attributes.add("modelNormal","mat3")),n.instancedDoublePrecision&&(e.vertex.include(_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_1__["DoublePrecision"],n),e.vertex.uniforms.add("viewOriginHi","vec3"),e.vertex.uniforms.add("viewOriginLo","vec3"));const o=[_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    vec3 calculateVPos() {
      ${n.instancedDoublePrecision?"return model * localPosition().xyz;":"return localPosition().xyz;"}
    }
    `,_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    vec3 subtractOrigin(vec3 _pos) {
      ${n.instancedDoublePrecision?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
          vec3 originDelta = dpAdd(viewOriginHi, viewOriginLo, -modelOriginHi, -modelOriginLo);
          return _pos - originDelta;`:"return vpos;"}
    }
    `,_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    vec3 dpNormal(vec4 _normal) {
      ${n.instancedDoublePrecision?"return normalize(modelNormal * _normal.xyz);":"return normalize(_normal.xyz);"}
    }
    `,_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    vec3 dpNormalView(vec4 _normal) {
      ${n.instancedDoublePrecision?"return normalize((viewNormal * vec4(modelNormal * _normal.xyz, 1.0)).xyz);":"return normalize((viewNormal * _normal).xyz);"}
    }
    `,n.vertexTangents?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    vec4 dpTransformVertexTangent(vec4 _tangent) {
      ${n.instancedDoublePrecision?"return vec4(modelNormal * _tangent.xyz, _tangent.w);":"return _tangent;"}

    }
    `:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]``];e.vertex.code.add(o[0]),e.vertex.code.add(o[1]),e.vertex.code.add(o[2]),2===n.output&&e.vertex.code.add(o[3]),e.vertex.code.add(o[4])}!function(e){class i{}function r(e,i){Object(_lib_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_3__["encodeDoubleArraySplit"])(i,t,a,3),e.setUniform3fv("viewOriginHi",t),e.setUniform3fv("viewOriginLo",a)}e.Uniforms=i,e.bindCustomOrigin=r}(o||(o={}));const t=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])(),a=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js":
/*!****************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js ***!
  \****************************************************************************************************************/
/*! exports provided: NormalAttribute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NormalAttribute", function() { return o; });
/* harmony import */ var _util_DecodeNormal_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/DecodeNormal.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DecodeNormal.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o,d){0===d.normalType&&(o.attributes.add("normal","vec3"),o.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 normalModel() {
return normal;
}`)),1===d.normalType&&(o.include(_util_DecodeNormal_glsl_js__WEBPACK_IMPORTED_MODULE_0__["DecodeNormal"]),o.attributes.add("normalCompressed","vec2"),o.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 normalModel() {
return decodeNormal(normalCompressed);
}`)),3===d.normalType&&(o.extensions.add("GL_OES_standard_derivatives"),o.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 screenDerivativeNormal(vec3 positionView) {
return normalize(cross(dFdx(positionView), dFdy(positionView)));
}`))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js":
/*!******************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js ***!
  \******************************************************************************************************************/
/*! exports provided: PositionAttribute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PositionAttribute", function() { return o; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o){o.attributes.add("position","vec3"),o.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 positionModel() { return position; }`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js":
/*!************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/SymbolColor.glsl.js ***!
  \************************************************************************************************************/
/*! exports provided: SymbolColor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SymbolColor", function() { return r; });
/* harmony import */ var _collections_Component_Material_shader_DecodeSymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../collections/Component/Material/shader/DecodeSymbolColor.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/collections/Component/Material/shader/DecodeSymbolColor.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,l){l.symbolColor?(r.include(_collections_Component_Material_shader_DecodeSymbolColor_glsl_js__WEBPACK_IMPORTED_MODULE_0__["DecodeSymbolColor"]),r.attributes.add("symbolColor","vec4"),r.varyings.add("colorMixMode","mediump float")):r.fragment.uniforms.add("colorMixMode","int"),l.symbolColor?r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`int symbolColorMixMode;
vec4 getSymbolColor() {
return decodeSymbolColor(symbolColor, symbolColorMixMode) * 0.003921568627451;
}
void forwardColorMixMode() {
colorMixMode = float(symbolColorMixMode) + 0.5;
}`):r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec4 getSymbolColor() { return vec4(1.0); }
void forwardColorMixMode() {}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js":
/*!***************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js ***!
  \***************************************************************************************************************************/
/*! exports provided: TextureCoordinateAttribute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextureCoordinateAttribute", function() { return t; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,d){1===d.attributeTextureCoordinates&&(t.attributes.add("uv0","vec2"),t.varyings.add("vuv0","vec2"),t.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardTextureCoordinates() {
vuv0 = uv0;
}`)),2===d.attributeTextureCoordinates&&(t.attributes.add("uv0","vec2"),t.varyings.add("vuv0","vec2"),t.attributes.add("uvRegion","vec4"),t.varyings.add("vuvRegion","vec4"),t.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`)),0===d.attributeTextureCoordinates&&t.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardTextureCoordinates() {}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js":
/*!************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexColor.glsl.js ***!
  \************************************************************************************************************/
/*! exports provided: VertexColor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertexColor", function() { return r; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,e){e.attributeColor?(r.attributes.add("color","vec4"),r.varyings.add("vColor","vec4"),r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardVertexColor() { vColor = color; }`),r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardNormalizedVertexColor() { vColor = color * 0.003921568627451; }`)):r.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void forwardVertexColor() {}
void forwardNormalizedVertexColor() {}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexNormal.glsl.js":
/*!*************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexNormal.glsl.js ***!
  \*************************************************************************************************************/
/*! exports provided: VertexNormal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertexNormal", function() { return l; });
/* harmony import */ var _NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NormalAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js");
/* harmony import */ var _VertexPosition_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VertexPosition.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexPosition.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function l(l,e){0===e.normalType||1===e.normalType?(l.include(_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_0__["NormalAttribute"],e),l.varyings.add("vNormalWorld","vec3"),l.varyings.add("vNormalView","vec3"),l.vertex.uniforms.add("uTransformNormal_GlobalFromModel","mat3"),l.vertex.uniforms.add("uTransformNormal_ViewFromGlobal","mat3"),l.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`void forwardNormal() {
vNormalWorld = uTransformNormal_GlobalFromModel * normalModel();
vNormalView = uTransformNormal_ViewFromGlobal * vNormalWorld;
}`)):2===e.normalType?(l.include(_VertexPosition_glsl_js__WEBPACK_IMPORTED_MODULE_1__["VertexPosition"],e),l.varyings.add("vNormalWorld","vec3"),l.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    void forwardNormal() {
      vNormalWorld = ${1===e.viewingMode?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`normalize(vPositionWorldCameraRelative);`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3(0.0, 0.0, 1.0);`}
    }
    `)):l.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`void forwardNormal() {}`)}!function(o){function r(o,r){o.setUniformMatrix4fv("viewNormal",r)}o.bindUniforms=r}(l||(l={}));


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexPosition.glsl.js":
/*!***************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexPosition.glsl.js ***!
  \***************************************************************************************************************/
/*! exports provided: VertexPosition */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertexPosition", function() { return d; });
/* harmony import */ var _chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../chunks/mat3f64.js */ "../node_modules/@arcgis/core/chunks/mat3f64.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PositionAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/PositionAttribute.glsl.js");
/* harmony import */ var _util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/DoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function d(o,r){o.include(_PositionAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__["PositionAttribute"]),o.vertex.include(_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_4__["DoublePrecision"],r),o.varyings.add("vPositionWorldCameraRelative","vec3"),o.varyings.add("vPosition_view","vec3"),o.vertex.uniforms.add("uTransform_WorldFromModel_RS","mat3"),o.vertex.uniforms.add("uTransform_WorldFromModel_TH","vec3"),o.vertex.uniforms.add("uTransform_WorldFromModel_TL","vec3"),o.vertex.uniforms.add("uTransform_WorldFromView_TH","vec3"),o.vertex.uniforms.add("uTransform_WorldFromView_TL","vec3"),o.vertex.uniforms.add("uTransform_ViewFromCameraRelative_RS","mat3"),o.vertex.uniforms.add("uTransform_ProjFromView","mat4"),o.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_5__["glsl"]`vec3 positionWorldCameraRelative() {
vec3 rotatedModelPosition = uTransform_WorldFromModel_RS * positionModel();
vec3 transform_CameraRelativeFromModel = dpAdd(
uTransform_WorldFromModel_TL,
uTransform_WorldFromModel_TH,
-uTransform_WorldFromView_TL,
-uTransform_WorldFromView_TH
);
return transform_CameraRelativeFromModel + rotatedModelPosition;
}
vec3 position_view() {
return uTransform_ViewFromCameraRelative_RS * positionWorldCameraRelative();
}
void forwardPosition() {
vPositionWorldCameraRelative = positionWorldCameraRelative();
vPosition_view = position_view();
gl_Position = uTransform_ProjFromView * vec4(vPosition_view, 1.0);
}
vec3 positionWorld() {
return uTransform_WorldFromView_TL + vPositionWorldCameraRelative;
}`),o.fragment.uniforms.add("uTransform_WorldFromView_TL","vec3"),o.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_5__["glsl"]`vec3 positionWorld() {
return uTransform_WorldFromView_TL + vPositionWorldCameraRelative;
}`)}!function(i){class m{constructor(){this.worldFromModel_RS=Object(_chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])(),this.worldFromModel_TH=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),this.worldFromModel_TL=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])()}}i.ModelTransform=m;class a{constructor(){this.worldFromView_TH=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),this.worldFromView_TL=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),this.viewFromCameraRelative_RS=Object(_chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])(),this.projFromView=Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_1__["c"])()}}function d(o,r){o.setUniformMatrix3fv("uTransform_WorldFromModel_RS",r.worldFromModel_RS),o.setUniform3fv("uTransform_WorldFromModel_TH",r.worldFromModel_TH),o.setUniform3fv("uTransform_WorldFromModel_TL",r.worldFromModel_TL)}function s(o,r){o.setUniform3fv("uTransform_WorldFromView_TH",r.worldFromView_TH),o.setUniform3fv("uTransform_WorldFromView_TL",r.worldFromView_TL),o.setUniformMatrix4fv("uTransform_ProjFromView",r.projFromView),o.setUniformMatrix3fv("uTransform_ViewFromCameraRelative_RS",r.viewFromCameraRelative_RS)}i.ViewProjectionTransform=a,i.bindModelTransform=d,i.bindViewProjTransform=s}(d||(d={}));


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexTextureCoordinates.glsl.js":
/*!*************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexTextureCoordinates.glsl.js ***!
  \*************************************************************************************************************************/
/*! exports provided: VertexTextureCoordinates */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertexTextureCoordinates", function() { return u; });
/* harmony import */ var _TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TextureCoordinateAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js");
/* harmony import */ var _util_TextureAtlasLookup_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/TextureAtlasLookup.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/TextureAtlasLookup.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(u,a){u.include(_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_0__["TextureCoordinateAttribute"],a),u.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
  struct TextureLookupParameter {
    vec2 uv;
    ${a.supportsTextureAtlas?"vec2 size;":""}
  } vtc;
  `),1===a.attributeTextureCoordinates&&u.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec4 textureLookup(sampler2D tex, TextureLookupParameter params) {
return texture2D(tex, params.uv);
}`),2===a.attributeTextureCoordinates&&(u.include(_util_TextureAtlasLookup_glsl_js__WEBPACK_IMPORTED_MODULE_1__["TextureAtlasLookup"]),u.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec4 textureLookup(sampler2D tex, TextureLookupParameter params) {
return textureAtlasLookup(tex, params.size, params.uv, vuvRegion);
}`))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js":
/*!***************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js ***!
  \***************************************************************************************************************/
/*! exports provided: VerticalOffset, bindVerticalOffsetUniforms, calculateVerticalOffsetFactors */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VerticalOffset", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindVerticalOffsetUniforms", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateVerticalOffsetFactors", function() { return c; });
/* harmony import */ var _util_ScreenSizePerspective_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/ScreenSizePerspective.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ScreenSizePerspective.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,l){const c=t.vertex.code;l.verticalOffsetEnabled?(t.vertex.uniforms.add("verticalOffset","vec4"),l.screenSizePerspectiveEnabled&&(t.include(_util_ScreenSizePerspective_glsl_js__WEBPACK_IMPORTED_MODULE_0__["ScreenSizePerspective"]),t.vertex.uniforms.add("screenSizePerspectiveAlignment","vec4")),c.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`
    vec3 calculateVerticalOffset(vec3 worldPos, vec3 localOrigin) {
      float viewDistance = length((view * vec4(worldPos, 1.0)).xyz);
      ${1===l.viewingMode?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 worldNormal = normalize(worldPos + localOrigin);`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 worldNormal = vec3(0.0, 0.0, 1.0);`}
      ${l.screenSizePerspectiveEnabled?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`
          float cosAngle = dot(worldNormal, normalize(worldPos - camPos));
          float verticalOffsetScreenHeight = screenSizePerspectiveScaleFloat(verticalOffset.x, abs(cosAngle), viewDistance, screenSizePerspectiveAlignment);`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`
          float verticalOffsetScreenHeight = verticalOffset.x;`}
      // Screen sized offset in world space, used for example for line callouts
      float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * viewDistance, verticalOffset.z, verticalOffset.w);
      return worldNormal * worldOffset;
    }

    vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) {
      return worldPos + calculateVerticalOffset(worldPos, localOrigin);
    }
    `)):c.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) { return worldPos; }`)}function l(e,r,t){if(!r.verticalOffset)return;const l=c(r.verticalOffset,t.camera.fovY,t.camera.fullViewport[3]),i=t.camera.pixelRatio||1;e.setUniform4f("verticalOffset",l.screenLength*i,l.perDistance,l.minWorldLength,l.maxWorldLength)}function c(e,r,t,l=i){return l.screenLength=e.screenLength,l.perDistance=Math.tan(.5*r)/(.5*t),l.minWorldLength=e.minWorldLength,l.maxWorldLength=e.maxWorldLength,l}const i={screenLength:0,perDistance:0,minWorldLength:0,maxWorldLength:0};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js":
/*!****************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/default/DefaultMaterialAuxiliaryPasses.glsl.js ***!
  \****************************************************************************************************************************/
/*! exports provided: DefaultMaterialAuxiliaryPasses */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultMaterialAuxiliaryPasses", function() { return u; });
/* harmony import */ var _Slice_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Slice.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js");
/* harmony import */ var _Transform_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Transform.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Transform.glsl.js");
/* harmony import */ var _attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../attributes/NormalAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/NormalAttribute.glsl.js");
/* harmony import */ var _attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../attributes/TextureCoordinateAttribute.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/TextureCoordinateAttribute.glsl.js");
/* harmony import */ var _attributes_VertexNormal_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../attributes/VertexNormal.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexNormal.glsl.js");
/* harmony import */ var _output_OutputDepth_glsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../output/OutputDepth.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputDepth.glsl.js");
/* harmony import */ var _output_OutputHighlight_glsl_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../output/OutputHighlight.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputHighlight.glsl.js");
/* harmony import */ var _shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../shading/VisualVariables.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js");
/* harmony import */ var _util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../util/AlphaDiscard.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(u,c){const p=u.vertex.code,v=u.fragment.code;1!==c.output&&3!==c.output||(u.include(_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_1__["Transform"],{linearDepth:!0}),u.include(_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__["TextureCoordinateAttribute"],c),u.include(_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_7__["VisualVariables"],c),u.include(_output_OutputDepth_glsl_js__WEBPACK_IMPORTED_MODULE_5__["OutputDepth"],c),u.include(_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_0__["Slice"],c),u.vertex.uniforms.add("cameraNearFar","vec2"),u.varyings.add("depth","float"),c.hasColorTexture&&u.fragment.uniforms.add("tex","sampler2D"),p.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`void main(void) {
vpos = calculateVPos();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPositionWithDepth(proj, view, vpos, cameraNearFar, depth);
forwardTextureCoordinates();
}`),u.include(_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_8__["DiscardOrAdjustAlpha"],c),v.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
      void main(void) {
        discardBySlice(vpos);
        ${c.hasColorTexture?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}
        outputDepth(depth);
      }
    `)),2===c.output&&(u.include(_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_1__["Transform"],{linearDepth:!1}),u.include(_attributes_NormalAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_2__["NormalAttribute"],c),u.include(_attributes_VertexNormal_glsl_js__WEBPACK_IMPORTED_MODULE_4__["VertexNormal"],c),u.include(_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__["TextureCoordinateAttribute"],c),u.include(_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_7__["VisualVariables"],c),c.hasColorTexture&&u.fragment.uniforms.add("tex","sampler2D"),u.vertex.uniforms.add("viewNormal","mat4"),u.varyings.add("vPositionView","vec3"),p.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
      void main(void) {
        vpos = calculateVPos();
        vpos = subtractOrigin(vpos);
        ${0===c.normalType?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
        vNormalWorld = dpNormalView(vvLocalNormal(normalModel()));`:""}
        vpos = addVerticalOffset(vpos, localOrigin);
        gl_Position = transformPosition(proj, view, vpos);
        forwardTextureCoordinates();
      }
    `),u.include(_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_0__["Slice"],c),u.include(_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_8__["DiscardOrAdjustAlpha"],c),v.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${c.hasColorTexture?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}

        ${3===c.normalType?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
            vec3 normal = screenDerivativeNormal(vPositionView);`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
            vec3 normal = normalize(vNormalWorld);
            if (gl_FrontFacing == false) normal = -normal;`}
        gl_FragColor = vec4(vec3(0.5) + 0.5 * normal, 1.0);
      }
    `)),4===c.output&&(u.include(_Transform_glsl_js__WEBPACK_IMPORTED_MODULE_1__["Transform"],{linearDepth:!1}),u.include(_attributes_TextureCoordinateAttribute_glsl_js__WEBPACK_IMPORTED_MODULE_3__["TextureCoordinateAttribute"],c),u.include(_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_7__["VisualVariables"],c),c.hasColorTexture&&u.fragment.uniforms.add("tex","sampler2D"),p.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`void main(void) {
vpos = calculateVPos();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPosition(proj, view, vpos);
forwardTextureCoordinates();
}`),u.include(_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_0__["Slice"],c),u.include(_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_8__["DiscardOrAdjustAlpha"],c),u.include(_output_OutputHighlight_glsl_js__WEBPACK_IMPORTED_MODULE_6__["OutputHighlight"]),v.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
      void main() {
        discardBySlice(vpos);
        ${c.hasColorTexture?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_9__["glsl"]`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}
        outputHighlight();
      }
    `))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputDepth.glsl.js":
/*!********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputDepth.glsl.js ***!
  \********************************************************************************************************/
/*! exports provided: OutputDepth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OutputDepth", function() { return e; });
/* harmony import */ var _util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/RgbaFloatEncoding.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/RgbaFloatEncoding.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,o){e.fragment.include(_util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__["RgbaFloatEncoding"]),3===o.output?(e.extensions.add("GL_OES_standard_derivatives"),e.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`float _calculateFragDepth(const in float depth) {
const float SLOPE_SCALE = 2.0;
const float BIAS = 2.0 * .000015259;
float m = max(abs(dFdx(depth)), abs(dFdy(depth)));
float result = depth + SLOPE_SCALE * m + BIAS;
return clamp(result, .0, .999999);
}
void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_calculateFragDepth(_linearDepth));
}`)):1===o.output&&e.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_linearDepth);
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputHighlight.glsl.js":
/*!************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputHighlight.glsl.js ***!
  \************************************************************************************************************/
/*! exports provided: OutputHighlight, bindOutputHighlight, occludedHighlightFlag, unoccludedHighlightFlag */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OutputHighlight", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindOutputHighlight", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "occludedHighlightFlag", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unoccludedHighlightFlag", function() { return o; });
/* harmony import */ var _chunks_vec4f64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../chunks/vec4f64.js */ "../node_modules/@arcgis/core/chunks/vec4f64.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=Object(_chunks_vec4f64_js__WEBPACK_IMPORTED_MODULE_0__["f"])(1,1,0,1),o=Object(_chunks_vec4f64_js__WEBPACK_IMPORTED_MODULE_0__["f"])(1,0,1,1);function r(e){e.fragment.uniforms.add("depthTex","sampler2D"),e.fragment.uniforms.add("highlightViewportPixelSz","vec4"),e.fragment.constants.add("occludedHighlightFlag","vec4",t).add("unoccludedHighlightFlag","vec4",o),e.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`void outputHighlight() {
vec4 fragCoord = gl_FragCoord;
float sceneDepth = texture2D(depthTex, (fragCoord.xy - highlightViewportPixelSz.xy) * highlightViewportPixelSz.zw).r;
if (fragCoord.z > sceneDepth + 5e-7) {
gl_FragColor = occludedHighlightFlag;
}
else {
gl_FragColor = unoccludedHighlightFlag;
}
}`)}function g(e,i){e.bindTexture(i.highlightDepthTexture,"depthTex"),e.setUniform4f("highlightViewportPixelSz",0,0,i.inverseViewport[0],i.inverseViewport[1])}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js":
/*!************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/ReadLinearDepth.glsl.js ***!
  \************************************************************************************************************/
/*! exports provided: ReadLinearDepth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReadLinearDepth", function() { return a; });
/* harmony import */ var _util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/RgbaFloatEncoding.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/RgbaFloatEncoding.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a){a.include(_util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__["RgbaFloatEncoding"]),a.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`float linearDepthFromFloat(float depth, vec2 nearFar) {
return -(depth * (nearFar[1] - nearFar[0]) + nearFar[0]);
}
float linearDepthFromTexture(sampler2D depthTex, vec2 uv, vec2 nearFar) {
return linearDepthFromFloat(rgba2float(texture2D(depthTex, uv)), nearFar);
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/AnalyticalSkyModel.glsl.js":
/*!****************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/AnalyticalSkyModel.glsl.js ***!
  \****************************************************************************************************************/
/*! exports provided: AnalyticalSkyModel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnalyticalSkyModel", function() { return t; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){const a=t.fragment.code;a.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 evaluateDiffuseIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float NdotNG)
{
return ((1.0 - NdotNG) * ambientGround + (1.0 + NdotNG) * ambientSky) * 0.5;
}`),a.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float integratedRadiance(float cosTheta2, float roughness)
{
return (cosTheta2 - 1.0) / (cosTheta2 * (1.0 - roughness * roughness) - 1.0);
}`),a.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 evaluateSpecularIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float RdotNG, float roughness)
{
float cosTheta2 = 1.0 - RdotNG * RdotNG;
float intRadTheta = integratedRadiance(cosTheta2, roughness);
float ground = RdotNG < 0.0 ? 1.0 - intRadTheta : 1.0 + intRadTheta;
float sky = 2.0 - ground;
return (ground * ambientGround + sky * ambientSky) * 0.5;
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ComputeNormalTexture.glsl.js":
/*!******************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ComputeNormalTexture.glsl.js ***!
  \******************************************************************************************************************/
/*! exports provided: ComputeNormalTexture */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComputeNormalTexture", function() { return n; });
/* harmony import */ var _attributes_VertexTextureCoordinates_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../attributes/VertexTextureCoordinates.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexTextureCoordinates.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,a){const r=n.fragment;a.vertexTangents?(n.attributes.add("tangent","vec4"),n.varyings.add("vTangent","vec4"),2===a.doubleSidedMode?r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = gl_FrontFacing ? vTangent.w : -vTangent.w;
vec3 tangent = normalize(gl_FrontFacing ? vTangent.xyz : -vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`):r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = vTangent.w;
vec3 tangent = normalize(vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`)):(n.extensions.add("GL_OES_standard_derivatives"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`mat3 computeTangentSpace(vec3 normal, vec3 pos, vec2 st) {
vec3 Q1 = dFdx(pos);
vec3 Q2 = dFdy(pos);
vec2 stx = dFdx(st);
vec2 sty = dFdy(st);
float det = stx.t * sty.s - sty.t * stx.s;
vec3 T = stx.t * Q2 - sty.t * Q1;
T = T - normal * dot(normal, T);
T *= inversesqrt(max(dot(T,T), 1.e-10));
vec3 B = sign(det) * cross(normal, T);
return mat3(T, B, normal);
}`)),0!==a.attributeTextureCoordinates&&(n.include(_attributes_VertexTextureCoordinates_glsl_js__WEBPACK_IMPORTED_MODULE_0__["VertexTextureCoordinates"],a),r.uniforms.add("normalTexture","sampler2D"),r.uniforms.add("normalTextureSize","vec2"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`
    vec3 computeTextureNormal(mat3 tangentSpace, vec2 uv) {
      vtc.uv = uv;
      ${a.supportsTextureAtlas?"vtc.size = normalTextureSize;":""}
      vec3 rawNormal = textureLookup(normalTexture, vtc).rgb * 2.0 - 1.0;
      return tangentSpace * rawNormal;
    }
  `))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientLighting.glsl.js":
/*!*********************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientLighting.glsl.js ***!
  \*********************************************************************************************************************/
/*! exports provided: EvaluateAmbientLighting */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EvaluateAmbientLighting", function() { return n; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,t){const e=n.fragment,a=void 0!==t.lightingSphericalHarmonicsOrder?t.lightingSphericalHarmonicsOrder:2;0===a?(e.uniforms.add("lightingAmbientSH0","vec3"),e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
return ambientLight * (1.0 - ambientOcclusion);
}`)):1===a?(e.uniforms.add("lightingAmbientSH_R","vec4"),e.uniforms.add("lightingAmbientSH_G","vec4"),e.uniforms.add("lightingAmbientSH_B","vec4"),e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec4 sh0 = vec4(
0.282095,
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y
);
vec3 ambientLight = vec3(
dot(lightingAmbientSH_R, sh0),
dot(lightingAmbientSH_G, sh0),
dot(lightingAmbientSH_B, sh0)
);
return ambientLight * (1.0 - ambientOcclusion);
}`)):2===a&&(e.uniforms.add("lightingAmbientSH0","vec3"),e.uniforms.add("lightingAmbientSH_R1","vec4"),e.uniforms.add("lightingAmbientSH_G1","vec4"),e.uniforms.add("lightingAmbientSH_B1","vec4"),e.uniforms.add("lightingAmbientSH_R2","vec4"),e.uniforms.add("lightingAmbientSH_G2","vec4"),e.uniforms.add("lightingAmbientSH_B2","vec4"),e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
vec4 sh1 = vec4(
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y,
1.092548 * normal.x * normal.y
);
vec4 sh2 = vec4(
1.092548 * normal.y * normal.z,
0.315392 * (3.0 * normal.z * normal.z - 1.0),
1.092548 * normal.x * normal.z,
0.546274 * (normal.x * normal.x - normal.y * normal.y)
);
ambientLight += vec3(
dot(lightingAmbientSH_R1, sh1),
dot(lightingAmbientSH_G1, sh1),
dot(lightingAmbientSH_B1, sh1)
);
ambientLight += vec3(
dot(lightingAmbientSH_R2, sh2),
dot(lightingAmbientSH_G2, sh2),
dot(lightingAmbientSH_B2, sh2)
);
return ambientLight * (1.0 - ambientOcclusion);
}`),1!==t.pbrMode&&2!==t.pbrMode||e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`const vec3 skyTransmittance = vec3(0.9, 0.9, 1.0);
vec3 calculateAmbientRadiance(float ambientOcclusion)
{
vec3 ambientLight = 1.2 * (0.282095 * lightingAmbientSH0) - 0.2;
return ambientLight *= (1.0 - ambientOcclusion) * skyTransmittance;
}`))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js":
/*!**********************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js ***!
  \**********************************************************************************************************************/
/*! exports provided: EvaluateAmbientOcclusion */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EvaluateAmbientOcclusion", function() { return o; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o,t){const r=o.fragment;t.receiveAmbientOcclusion?(r.uniforms.add("ssaoTex","sampler2D"),r.uniforms.add("viewportPixelSz","vec4"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float evaluateAmbientOcclusion() {
return 1.0 - texture2D(ssaoTex, (gl_FragCoord.xy - viewportPixelSz.xy) * viewportPixelSz.zw).a;
}
float evaluateAmbientOcclusionInverse() {
float ssao = texture2D(ssaoTex, (gl_FragCoord.xy - viewportPixelSz.xy) * viewportPixelSz.zw).a;
return viewportPixelSz.z < 0.0 ? 1.0 : ssao;
}`)):r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float evaluateAmbientOcclusion() { return 0.0; }
float evaluateAmbientOcclusionInverse() { return 1.0; }`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateMainLighting.glsl.js":
/*!******************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateMainLighting.glsl.js ***!
  \******************************************************************************************************************/
/*! exports provided: EvaluateMainLighting */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EvaluateMainLighting", function() { return n; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){const t=n.fragment;t.uniforms.add("lightingMainDirection","vec3"),t.uniforms.add("lightingMainIntensity","vec3"),t.uniforms.add("lightingFixedFactor","float"),t.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 evaluateMainLighting(vec3 normal_global, float shadowing) {
float dotVal = clamp(dot(normal_global, lightingMainDirection), 0.0, 1.0);
dotVal = mix(dotVal, 1.0, lightingFixedFactor);
return lightingMainIntensity * ((1.0 - shadowing) * dotVal);
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js":
/*!*******************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateSceneLighting.glsl.js ***!
  \*******************************************************************************************************************/
/*! exports provided: EvaluateSceneLighting */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EvaluateSceneLighting", function() { return l; });
/* harmony import */ var _EvaluateAmbientLighting_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EvaluateAmbientLighting.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientLighting.glsl.js");
/* harmony import */ var _EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EvaluateAmbientOcclusion.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateAmbientOcclusion.glsl.js");
/* harmony import */ var _EvaluateMainLighting_glsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EvaluateMainLighting.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/EvaluateMainLighting.glsl.js");
/* harmony import */ var _PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PhysicallyBasedRendering.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js");
/* harmony import */ var _PiUtils_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PiUtils.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PiUtils.glsl.js");
/* harmony import */ var _ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ReadShadowMap.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function l(l,d){const c=l.fragment;l.include(_EvaluateMainLighting_glsl_js__WEBPACK_IMPORTED_MODULE_2__["EvaluateMainLighting"]),l.include(_EvaluateAmbientOcclusion_glsl_js__WEBPACK_IMPORTED_MODULE_1__["EvaluateAmbientOcclusion"],d),0!==d.pbrMode&&l.include(_PhysicallyBasedRendering_glsl_js__WEBPACK_IMPORTED_MODULE_3__["PhysicallyBasedRendering"],d),l.include(_EvaluateAmbientLighting_glsl_js__WEBPACK_IMPORTED_MODULE_0__["EvaluateAmbientLighting"],d),d.receiveShadows&&l.include(_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_5__["ReadShadowMap"],d),c.uniforms.add("lightingGlobalFactor","float"),c.uniforms.add("ambientBoostFactor","float"),l.include(_PiUtils_glsl_js__WEBPACK_IMPORTED_MODULE_4__["PiUtils"]),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`
    const float GAMMA_SRGB = 2.1;
    const float INV_GAMMA_SRGB = 0.4761904;
    ${0===d.pbrMode?"":"const vec3 GROUND_REFLECTANCE = vec3(0.2);"}
  `),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`
    float additionalDirectedAmbientLight(vec3 vPosWorld) {
      float vndl = dot(${1===d.viewingMode?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`normalize(vPosWorld)`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3(0.0, 0.0, 1.0)`}, lightingMainDirection);
      return smoothstep(0.0, 1.0, clamp(vndl * 2.5, 0.0, 1.0));
    }
  `),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 evaluateAdditionalLighting(float ambientOcclusion, vec3 vPosWorld) {
float additionalAmbientScale = additionalDirectedAmbientLight(vPosWorld);
return (1.0 - ambientOcclusion) * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor * lightingMainIntensity;
}`),0===d.pbrMode||4===d.pbrMode?c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 evaluateSceneLighting(vec3 normalWorld, vec3 albedo, float shadow, float ssao, vec3 additionalLight)
{
vec3 mainLighting = evaluateMainLighting(normalWorld, shadow);
vec3 ambientLighting = calculateAmbientIrradiance(normalWorld, ssao);
vec3 albedoLinear = pow(albedo, vec3(GAMMA_SRGB));
vec3 totalLight = mainLighting + ambientLighting + additionalLight;
totalLight = min(totalLight, vec3(PI));
vec3 outColor = vec3((albedoLinear / PI) * totalLight);
return pow(outColor, vec3(INV_GAMMA_SRGB));
}`):1!==d.pbrMode&&2!==d.pbrMode||(c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`const float fillLightIntensity = 0.25;
const float horizonLightDiffusion = 0.4;
const float additionalAmbientIrradianceFactor = 0.02;
vec3 evaluateSceneLightingPBR(vec3 normal, vec3 albedo, float shadow, float ssao, vec3 additionalLight, vec3 viewDir, vec3 normalGround, vec3 mrr, vec3 _emission, float additionalAmbientIrradiance)
{
vec3 viewDirection = -viewDir;
vec3 mainLightDirection = lightingMainDirection;
vec3 h = normalize(viewDirection + mainLightDirection);
PBRShadingInfo inputs;
inputs.NdotL = clamp(dot(normal, mainLightDirection), 0.001, 1.0);
inputs.NdotV = clamp(abs(dot(normal, viewDirection)), 0.001, 1.0);
inputs.NdotH = clamp(dot(normal, h), 0.0, 1.0);
inputs.VdotH = clamp(dot(viewDirection, h), 0.0, 1.0);
inputs.NdotNG = clamp(dot(normal, normalGround), -1.0, 1.0);
vec3 reflectedView = normalize(reflect(viewDirection, normal));
inputs.RdotNG = clamp(dot(reflectedView, normalGround), -1.0, 1.0);
inputs.albedoLinear = pow(albedo, vec3(GAMMA_SRGB));
inputs.ssao = ssao;
inputs.metalness = mrr[0];
inputs.roughness = clamp(mrr[1] * mrr[1], 0.001, 0.99);`),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`inputs.f0 = (0.16 * mrr[2] * mrr[2]) * (1.0 - inputs.metalness) + inputs.albedoLinear * inputs.metalness;
inputs.f90 = vec3(clamp(dot(inputs.f0, vec3(50.0 * 0.33)), 0.0, 1.0));
inputs.diffuseColor = inputs.albedoLinear * (vec3(1.0) - inputs.f0) * (1.0 - inputs.metalness);`),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 ambientDir = vec3(5.0 * normalGround[1] - normalGround[0] * normalGround[2], - 5.0 * normalGround[0] - normalGround[2] * normalGround[1], normalGround[1] * normalGround[1] + normalGround[0] * normalGround[0]);
ambientDir = ambientDir != vec3(0.0)? normalize(ambientDir) : normalize(vec3(5.0, -1.0, 0.0));
inputs.NdotAmbDir = abs(dot(normal, ambientDir));
vec3 mainLightIrradianceComponent = inputs.NdotL * (1.0 - shadow) * lightingMainIntensity;
vec3 fillLightsIrradianceComponent = inputs.NdotAmbDir * lightingMainIntensity * fillLightIntensity;
vec3 ambientLightIrradianceComponent = calculateAmbientIrradiance(normal, ssao) + additionalLight;
inputs.skyIrradianceToSurface = ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;
inputs.groundIrradianceToSurface = GROUND_REFLECTANCE * ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;`),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 horizonRingDir = inputs.RdotNG * normalGround - reflectedView;
vec3 horizonRingH = normalize(viewDirection + horizonRingDir);
inputs.NdotH_Horizon = dot(normal, horizonRingH);
vec3 mainLightRadianceComponent = normalDistribution(inputs.NdotH, inputs.roughness) * lightingMainIntensity * (1.0 - shadow);
vec3 horizonLightRadianceComponent = normalDistribution(inputs.NdotH_Horizon, min(inputs.roughness + horizonLightDiffusion, 1.0)) * lightingMainIntensity * fillLightIntensity;
vec3 ambientLightRadianceComponent = calculateAmbientRadiance(ssao) + additionalLight;
inputs.skyRadianceToSurface = ambientLightRadianceComponent + mainLightRadianceComponent + horizonLightRadianceComponent;
inputs.groundRadianceToSurface = GROUND_REFLECTANCE * (ambientLightRadianceComponent + horizonLightRadianceComponent) + mainLightRadianceComponent;
inputs.averageAmbientRadiance = ambientLightIrradianceComponent[1] * (1.0 + GROUND_REFLECTANCE[1]);`),c.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`
        vec3 reflectedColorComponent = evaluateEnvironmentIllumination(inputs);
        vec3 additionalMaterialReflectanceComponent = inputs.albedoLinear * additionalAmbientIrradiance;
        vec3 emissionComponent = pow(_emission, vec3(GAMMA_SRGB));
        vec3 outColorLinear = reflectedColorComponent + additionalMaterialReflectanceComponent + emissionComponent;
        ${2===d.pbrMode?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 outColor = pow(max(vec3(0.0), outColorLinear - 0.005 * inputs.averageAmbientRadiance), vec3(INV_GAMMA_SRGB));`:_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_6__["glsl"]`vec3 outColor = pow(blackLevelSoftCompression(outColorLinear, inputs), vec3(INV_GAMMA_SRGB));`}
        return outColor;
      }
    `))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js":
/*!******************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js ***!
  \******************************************************************************************************************/
/*! exports provided: bindMultipassTerrainTexture, multipassTerrainTest */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindMultipassTerrainTexture", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "multipassTerrainTest", function() { return r; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,t){r.fragment.uniforms.add("terrainDepthTexture","sampler2D"),r.fragment.uniforms.add("cameraNearFar","vec2"),r.fragment.uniforms.add("inverseViewport","vec2"),r.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
    // Compare the linearized depths of fragment and terrain. Discard fragments on the wrong side of the terrain.
    void terrainDepthTest(vec4 fragCoord, float fragmentDepth){

      float terrainDepth = linearDepthFromTexture(terrainDepthTexture, fragCoord.xy * inverseViewport, cameraNearFar);
      if(fragmentDepth ${t.cullAboveGround?">":"<="} terrainDepth){
        discard;
      }
    }
  `)}function t(e,r){r.multipassTerrainEnabled&&r.terrainLinearDepthTexture&&e.bindTexture(r.terrainLinearDepthTexture,"terrainDepthTexture")}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/Normals.glsl.js":
/*!*****************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/Normals.glsl.js ***!
  \*****************************************************************************************************/
/*! exports provided: Normals */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Normals", function() { return r; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,e){const m=r.fragment;m.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`struct ShadingNormalParameters {
vec3 normalView;
vec3 viewDirection;
} shadingParams;`),1===e.doubleSidedMode?m.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 shadingNormal(ShadingNormalParameters params) {
return dot(params.normalView, params.viewDirection) > 0.0 ? normalize(-params.normalView) : normalize(params.normalView);
}`):2===e.doubleSidedMode?m.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 shadingNormal(ShadingNormalParameters params) {
return gl_FrontFacing ? normalize(params.normalView) : normalize(-params.normalView);
}`):m.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 shadingNormal(ShadingNormalParameters params) {
return normalize(params.normalView);
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js":
/*!**********************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRendering.glsl.js ***!
  \**********************************************************************************************************************/
/*! exports provided: PhysicallyBasedRendering */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PhysicallyBasedRendering", function() { return a; });
/* harmony import */ var _AnalyticalSkyModel_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnalyticalSkyModel.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/AnalyticalSkyModel.glsl.js");
/* harmony import */ var _PiUtils_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PiUtils.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PiUtils.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a,n){const r=a.fragment.code;a.include(_PiUtils_glsl_js__WEBPACK_IMPORTED_MODULE_1__["PiUtils"]),3===n.pbrMode||4===n.pbrMode?(r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    struct PBRShadingWater
    {
        float NdotL;   // cos angle between normal and light direction
        float NdotV;   // cos angle between normal and view direction
        float NdotH;   // cos angle between normal and half vector
        float VdotH;   // cos angle between view direction and half vector
        float LdotH;   // cos angle between light direction and half vector
        float VdotN;   // cos angle between view direction and normal vector
    };

    float dtrExponent = ${n.useCustomDTRExponentForWater?"2.2":"2.0"};
    `),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3 fresnelReflection(float angle, vec3 f0, float f90) {
return f0 + (f90 - f0) * pow(1.0 - angle, 5.0);
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float normalDistributionWater(float NdotH, float roughness)
{
float r2 = roughness * roughness;
float NdotH2 = NdotH * NdotH;
float denom = pow((NdotH2 * (r2 - 1.0) + 1.0), dtrExponent) * PI;
return r2 / denom;
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float geometricOcclusionKelemen(float LoH)
{
return 0.25 / (LoH * LoH);
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3 brdfSpecularWater(in PBRShadingWater props, float roughness, vec3 F0, float F0Max)
{
vec3  F = fresnelReflection(props.VdotH, F0, F0Max);
float dSun = normalDistributionWater(props.NdotH, roughness);
float V = geometricOcclusionKelemen(props.LdotH);
float diffusionSunHaze = mix(roughness + 0.045, roughness + 0.385, 1.0 - props.VdotH);
float strengthSunHaze  = 1.2;
float dSunHaze = normalDistributionWater(props.NdotH, diffusionSunHaze)*strengthSunHaze;
return ((dSun + dSunHaze) * V) * F;
}
vec3 tonemapACES(const vec3 x) {
return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}`)):1!==n.pbrMode&&2!==n.pbrMode||(a.include(_AnalyticalSkyModel_glsl_js__WEBPACK_IMPORTED_MODULE_0__["AnalyticalSkyModel"]),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`struct PBRShadingInfo
{
float NdotL;
float NdotV;
float NdotH;
float VdotH;
float LdotH;
float NdotNG;
float RdotNG;
float NdotAmbDir;
float NdotH_Horizon;
vec3 skyRadianceToSurface;
vec3 groundRadianceToSurface;
vec3 skyIrradianceToSurface;
vec3 groundIrradianceToSurface;
float averageAmbientRadiance;
float ssao;
vec3 albedoLinear;
vec3 f0;
vec3 f90;
vec3 diffuseColor;
float metalness;
float roughness;
};`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float normalDistribution(float NdotH, float roughness)
{
float a = NdotH * roughness;
float b = roughness / (1.0 - NdotH * NdotH + a * a);
return b * b * INV_PI;
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`const vec4 c0 = vec4(-1.0, -0.0275, -0.572,  0.022);
const vec4 c1 = vec4( 1.0,  0.0425,  1.040, -0.040);
const vec2 c2 = vec2(-1.04, 1.04);
vec2 prefilteredDFGAnalytical(float roughness, float NdotV) {
vec4 r = roughness * c0 + c1;
float a004 = min(r.x * r.x, exp2(-9.28 * NdotV)) * r.x + r.y;
return c2 * a004 + r.zw;
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3 evaluateEnvironmentIllumination(PBRShadingInfo inputs) {
vec3 indirectDiffuse = evaluateDiffuseIlluminationHemisphere(inputs.groundIrradianceToSurface, inputs.skyIrradianceToSurface, inputs.NdotNG);
vec3 indirectSpecular = evaluateSpecularIlluminationHemisphere(inputs.groundRadianceToSurface, inputs.skyRadianceToSurface, inputs.RdotNG, inputs.roughness);
vec3 diffuseComponent = inputs.diffuseColor * indirectDiffuse * INV_PI;
vec2 dfg = prefilteredDFGAnalytical(inputs.roughness, inputs.NdotV);
vec3 specularColor = inputs.f0 * dfg.x + inputs.f90 * dfg.y;
vec3 specularComponent = specularColor * indirectSpecular;
return (diffuseComponent + specularComponent);
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float gamutMapChanel(float x, vec2 p){
return (x < p.x) ? mix(0.0, p.y, x/p.x) : mix(p.y, 1.0, (x - p.x) / (1.0 - p.x) );
}`),r.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3 blackLevelSoftCompression(vec3 inColor, PBRShadingInfo inputs){
vec3 outColor;
vec2 p = vec2(0.02 * (inputs.averageAmbientRadiance), 0.0075 * (inputs.averageAmbientRadiance));
outColor.x = gamutMapChanel(inColor.x, p) ;
outColor.y = gamutMapChanel(inColor.y, p) ;
outColor.z = gamutMapChanel(inColor.z, p) ;
return outColor;
}`))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js":
/*!********************************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js ***!
  \********************************************************************************************************************************/
/*! exports provided: PBRSchematicMRRValues, PhysicallyBasedRenderingParameters, bindPBRUniforms */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PBRSchematicMRRValues", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PhysicallyBasedRenderingParameters", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindPBRUniforms", function() { return a; });
/* harmony import */ var _chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../chunks/vec3f32.js */ "../node_modules/@arcgis/core/chunks/vec3f32.js");
/* harmony import */ var _attributes_VertexTextureCoordinates_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../attributes/VertexTextureCoordinates.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VertexTextureCoordinates.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=Object(_chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_0__["f"])(0,.6,.2);function r(e,t){const r=e.fragment,a=t.hasMetalnessAndRoughnessTexture||t.hasEmissionTexture||t.hasOcclusionTexture;1===t.pbrMode&&a&&e.include(_attributes_VertexTextureCoordinates_glsl_js__WEBPACK_IMPORTED_MODULE_1__["VertexTextureCoordinates"],t),2!==t.pbrMode?(0===t.pbrMode&&r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float getBakedOcclusion() { return 1.0; }`),1===t.pbrMode&&(r.uniforms.add("emissionFactor","vec3"),r.uniforms.add("mrrFactors","vec3"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`vec3 mrr;
vec3 emission;
float occlusion;`),t.hasMetalnessAndRoughnessTexture&&(r.uniforms.add("texMetallicRoughness","sampler2D"),t.supportsTextureAtlas&&r.uniforms.add("texMetallicRoughnessSize","vec2"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`void applyMetallnessAndRoughness(TextureLookupParameter params) {
vec3 metallicRoughness = textureLookup(texMetallicRoughness, params).rgb;
mrr[0] *= metallicRoughness.b;
mrr[1] *= metallicRoughness.g;
}`)),t.hasEmissionTexture&&(r.uniforms.add("texEmission","sampler2D"),t.supportsTextureAtlas&&r.uniforms.add("texEmissionSize","vec2"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`void applyEmission(TextureLookupParameter params) {
emission *= textureLookup(texEmission, params).rgb;
}`)),t.hasOcclusionTexture?(r.uniforms.add("texOcclusion","sampler2D"),t.supportsTextureAtlas&&r.uniforms.add("texOcclusionSize","vec2"),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`void applyOcclusion(TextureLookupParameter params) {
occlusion *= textureLookup(texOcclusion, params).r;
}
float getBakedOcclusion() {
return occlusion;
}`)):r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`float getBakedOcclusion() { return 1.0; }`),r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`
    void applyPBRFactors() {
      mrr = mrrFactors;
      emission = emissionFactor;
      occlusion = 1.0;
      ${a?"vtc.uv = vuv0;":""}
      ${t.hasMetalnessAndRoughnessTexture?t.supportsTextureAtlas?"vtc.size = texMetallicRoughnessSize; applyMetallnessAndRoughness(vtc);":"applyMetallnessAndRoughness(vtc);":""}
      ${t.hasEmissionTexture?t.supportsTextureAtlas?"vtc.size = texEmissionSize; applyEmission(vtc);":"applyEmission(vtc);":""}
      ${t.hasOcclusionTexture?t.supportsTextureAtlas?"vtc.size = texOcclusionSize; applyOcclusion(vtc);":"applyOcclusion(vtc);":""}
    }
  `))):r.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_2__["glsl"]`const vec3 mrr = vec3(0.0, 0.6, 0.2);
const vec3 emission = vec3(0.0);
float occlusion = 1.0;
void applyPBRFactors() {}
float getBakedOcclusion() { return 1.0; }`)}function a(e,s,o=!1){o||(e.setUniform3fv("mrrFactors",s.mrrFactors),e.setUniform3fv("emissionFactor",s.emissiveFactor))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PiUtils.glsl.js":
/*!*****************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PiUtils.glsl.js ***!
  \*****************************************************************************************************/
/*! exports provided: PiUtils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PiUtils", function() { return t; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){t.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`const float PI = 3.141592653589793;`),t.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`const float PI = 3.141592653589793;
const float LIGHT_NORMALIZATION = 1.0 / PI;
const float INV_PI = 0.3183098861837907;
const float HALF_PI = 1.570796326794897;`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js":
/*!***********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js ***!
  \***********************************************************************************************************/
/*! exports provided: ReadShadowMap, bindReadShadowMapUniforms, bindReadShadowMapView, bindReadShadowMapViewCustomOrigin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReadShadowMap", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindReadShadowMapUniforms", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindReadShadowMapView", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindReadShadowMapViewCustomOrigin", function() { return i; });
/* harmony import */ var _util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/RgbaFloatEncoding.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/RgbaFloatEncoding.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){t.fragment.include(_util_RgbaFloatEncoding_glsl_js__WEBPACK_IMPORTED_MODULE_0__["RgbaFloatEncoding"]),t.fragment.uniforms.add("uShadowMapTex","sampler2D"),t.fragment.uniforms.add("uShadowMapNum","int"),t.fragment.uniforms.add("uShadowMapDistance","vec4"),t.fragment.uniforms.add("uShadowMapMatrix","mat4",4),t.fragment.uniforms.add("uDepthHalfPixelSz","float"),t.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`int chooseCascade(float _linearDepth, out mat4 mat) {
vec4 distance = uShadowMapDistance;
float depth = _linearDepth;
int i = depth < distance[1] ? 0 : depth < distance[2] ? 1 : depth < distance[3] ? 2 : 3;
mat = i == 0 ? uShadowMapMatrix[0] : i == 1 ? uShadowMapMatrix[1] : i == 2 ? uShadowMapMatrix[2] : uShadowMapMatrix[3];
return i;
}
vec3 lightSpacePosition(vec3 _vpos, mat4 mat) {
vec4 lv = mat * vec4(_vpos, 1.0);
lv.xy /= lv.w;
return 0.5 * lv.xyz + vec3(0.5);
}
vec2 cascadeCoordinates(int i, vec3 lvpos) {
return vec2(float(i - 2 * (i / 2)) * 0.5, float(i / 2) * 0.5) + 0.5 * lvpos.xy;
}
float readShadowMapDepth(vec2 uv, sampler2D _depthTex) {
return rgba2float(texture2D(_depthTex, uv));
}
float posIsInShadow(vec2 uv, vec3 lvpos, sampler2D _depthTex) {
return readShadowMapDepth(uv, _depthTex) < lvpos.z ? 1.0 : 0.0;
}
float filterShadow(vec2 uv, vec3 lvpos, float halfPixelSize, sampler2D _depthTex) {
float texSize = 0.5 / halfPixelSize;
vec2 st = fract((vec2(halfPixelSize) + uv) * texSize);
float s00 = posIsInShadow(uv + vec2(-halfPixelSize, -halfPixelSize), lvpos, _depthTex);
float s10 = posIsInShadow(uv + vec2(halfPixelSize, -halfPixelSize), lvpos, _depthTex);
float s11 = posIsInShadow(uv + vec2(halfPixelSize, halfPixelSize), lvpos, _depthTex);
float s01 = posIsInShadow(uv + vec2(-halfPixelSize, halfPixelSize), lvpos, _depthTex);
return mix(mix(s00, s10, st.x), mix(s01, s11, st.x), st.y);
}
float readShadowMap(const in vec3 _vpos, float _linearDepth) {
mat4 mat;
int i = chooseCascade(_linearDepth, mat);
if (i >= uShadowMapNum) { return 0.0; }
vec3 lvpos = lightSpacePosition(_vpos, mat);
if (lvpos.z >= 1.0) { return 0.0; }
if (lvpos.x < 0.0 || lvpos.x > 1.0 || lvpos.y < 0.0 || lvpos.y > 1.0) { return 0.0; }
vec2 uv = cascadeCoordinates(i, lvpos);
return filterShadow(uv, lvpos, uDepthHalfPixelSz, uShadowMapTex);
}`)}function o(a,e){e.shadowMappingEnabled&&(e.shadowMap.bind(a),e.shadowMap.bindView(a,e.origin))}function i(a,e,t){e.shadowMappingEnabled&&e.shadowMap.bindView(a,t)}function l(a,e){e.shadowMappingEnabled&&e.shadowMap.bindView(a,e.origin)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js":
/*!*************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js ***!
  \*************************************************************************************************************/
/*! exports provided: VisualVariables, bindVisualVariablesUniforms, bindVisualVariablesUniformsForSymbols, bindVisualVariablesUniformsWithOpacity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VisualVariables", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindVisualVariablesUniforms", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindVisualVariablesUniformsForSymbols", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindVisualVariablesUniformsWithOpacity", function() { return r; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,o){o.vvInstancingEnabled&&(o.vvSize||o.vvColor)&&e.attributes.add("instanceFeatureAttribute","vec4"),o.vvSize?(e.vertex.uniforms.add("vvSizeMinSize","vec3"),e.vertex.uniforms.add("vvSizeMaxSize","vec3"),e.vertex.uniforms.add("vvSizeOffset","vec3"),e.vertex.uniforms.add("vvSizeFactor","vec3"),e.vertex.uniforms.add("vvSymbolRotationMatrix","mat3"),e.vertex.uniforms.add("vvSymbolAnchor","vec3"),e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 vvScale(vec4 _featureAttribute) {
return clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize);
}
vec4 vvTransformPosition(vec3 position, vec4 _featureAttribute) {
return vec4(vvSymbolRotationMatrix * ( vvScale(_featureAttribute) * (position + vvSymbolAnchor)), 1.0);
}`),e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
      const float eps = 1.192092896e-07;
      vec4 vvTransformNormal(vec3 _normal, vec4 _featureAttribute) {
        vec3 vvScale = clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize + eps, vvSizeMaxSize);
        return vec4(vvSymbolRotationMatrix * _normal / vvScale, 1.0);
      }

      ${o.vvInstancingEnabled?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
      vec4 vvLocalNormal(vec3 _normal) {
        return vvTransformNormal(_normal, instanceFeatureAttribute);
      }

      vec4 localPosition() {
        return vvTransformPosition(position, instanceFeatureAttribute);
      }`:""}
    `)):e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 localPosition() { return vec4(position, 1.0); }
vec4 vvLocalNormal(vec3 _normal) { return vec4(_normal, 1.0); }`),o.vvColor?(e.vertex.constants.add("vvColorNumber","int",8),e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
      uniform float vvColorValues[vvColorNumber];
      uniform vec4 vvColorColors[vvColorNumber];

      vec4 vvGetColor(vec4 featureAttribute, float values[vvColorNumber], vec4 colors[vvColorNumber]) {
        float value = featureAttribute.y;
        if (value <= values[0]) {
          return colors[0];
        }

        for (int i = 1; i < vvColorNumber; ++i) {
          if (values[i] >= value) {
            float f = (value - values[i-1]) / (values[i] - values[i-1]);
            return mix(colors[i-1], colors[i], f);
          }
        }
        return colors[vvColorNumber - 1];
      }

      ${o.vvInstancingEnabled?_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
      vec4 vvColor() {
        return vvGetColor(instanceFeatureAttribute, vvColorValues, vvColorColors);
      }`:""}
    `)):e.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 vvColor() { return vec4(1.0); }`)}function o(v,e){e.vvSizeEnabled&&(v.setUniform3fv("vvSizeMinSize",e.vvSizeMinSize),v.setUniform3fv("vvSizeMaxSize",e.vvSizeMaxSize),v.setUniform3fv("vvSizeOffset",e.vvSizeOffset),v.setUniform3fv("vvSizeFactor",e.vvSizeFactor)),e.vvColorEnabled&&(v.setUniform1fv("vvColorValues",e.vvColorValues),v.setUniform4fv("vvColorColors",e.vvColorColors))}function r(v,e){o(v,e),e.vvOpacityEnabled&&(v.setUniform1fv("vvOpacityValues",e.vvOpacityValues),v.setUniform1fv("vvOpacityOpacities",e.vvOpacityOpacities))}function t(v,e){o(v,e),e.vvSizeEnabled&&(v.setUniform3fv("vvSymbolAnchor",e.vvSymbolAnchor),v.setUniformMatrix3fv("vvSymbolRotationMatrix",e.vvSymbolRotationMatrix))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js":
/*!*******************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js ***!
  \*******************************************************************************************************/
/*! exports provided: DiscardOrAdjustAlpha, defaultMaskAlphaCutoff, symbolAlphaCutoff */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiscardOrAdjustAlpha", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultMaskAlphaCutoff", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolAlphaCutoff", function() { return o; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const d=.1,o=.001;function r(d,r){const e=d.fragment;switch(r.alphaDiscardMode){case 0:e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
        #define discardOrAdjustAlpha(color) { if (color.a < ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"].float(o)}) { discard; } }
      `);break;case 1:e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`void discardOrAdjustAlpha(inout vec4 color) {
color.a = 1.0;
}`);break;case 2:e.uniforms.add("textureAlphaCutoff","float"),e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } else { color.a = 1.0; } }`);break;case 3:d.fragment.uniforms.add("textureAlphaCutoff","float"),d.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } }`)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ColorConversion.glsl.js":
/*!**********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ColorConversion.glsl.js ***!
  \**********************************************************************************************************/
/*! exports provided: ColorConversion */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorConversion", function() { return e; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e){e.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 premultiplyAlpha(vec4 v) {
return vec4(v.rgb * v.a, v.a);
}
vec3 rgb2hsv(vec3 c) {
vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
float d = q.x - min(q.w, q.y);
float e = 1.0e-10;
return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), min(d / (q.x + e), 1.0), q.x);
}
vec3 hsv2rgb(vec3 c) {
vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float rgb2v(vec3 c) {
return max(c.x, max(c.y, c.z));
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DecodeNormal.glsl.js":
/*!*******************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DecodeNormal.glsl.js ***!
  \*******************************************************************************************************/
/*! exports provided: DecodeNormal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DecodeNormal", function() { return o; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o){const d=_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec3 decodeNormal(vec2 f) {
float z = 1.0 - abs(f.x) - abs(f.y);
return vec3(f + sign(f) * min(z, 0.0), z);
}`;o.fragment.code.add(d),o.vertex.code.add(d)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js":
/*!**********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js ***!
  \**********************************************************************************************************/
/*! exports provided: DoublePrecision, doublePrecisionRequiresObfuscation */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DoublePrecision", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "doublePrecisionRequiresObfuscation", function() { return o; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _lib_WebGLDriverTest_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../lib/WebGLDriverTest.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/WebGLDriverTest.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r({code:e},i){i.doublePrecisionRequiresObfuscation?e.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 dpPlusFrc(vec3 a, vec3 b) {
return mix(a, a + b, vec3(notEqual(b, vec3(0))));
}
vec3 dpMinusFrc(vec3 a, vec3 b) {
return mix(vec3(0), a - b, vec3(notEqual(a, b)));
}
vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = dpPlusFrc(hiA, hiB);
vec3 e = dpMinusFrc(t1, hiA);
vec3 t2 = dpMinusFrc(hiB, e) + dpMinusFrc(hiA, dpMinusFrc(t1, e)) + loA + loB;
return t1 + t2;
}`):e.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = hiA + hiB;
vec3 e = t1 - hiA;
vec3 t2 = ((hiB - e) + (hiA - (t1 - e))) + loA + loB;
return t1 + t2;
}`)}function o(c){return!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("force-double-precision-obfuscation")||Object(_lib_WebGLDriverTest_js__WEBPACK_IMPORTED_MODULE_2__["testWebGLDriver"])(c).doublePrecisionRequiresObfuscation}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/HeaderComment.glsl.js":
/*!********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/HeaderComment.glsl.js ***!
  \********************************************************************************************************/
/*! exports provided: HeaderComment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderComment", function() { return u; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _webgl_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../webgl/checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(u,o){const r=_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`
  /*
  *  ${o.name}
  *  ${0===o.output?"RenderOutput: Color":1===o.output?"RenderOutput: Depth":3===o.output?"RenderOutput: Shadow":2===o.output?"RenderOutput: Normal":4===o.output?"RenderOutput: Highlight":""}
  */
  `;Object(_webgl_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_1__["webglValidateShadersEnabled"])()&&(u.fragment.code.add(r),u.vertex.code.add(r))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js":
/*!***********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/MixExternalColor.glsl.js ***!
  \***********************************************************************************************************/
/*! exports provided: MixExternalColor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MixExternalColor", function() { return i; });
/* harmony import */ var _ColorConversion_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ColorConversion.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ColorConversion.glsl.js");
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(i){i.include(_ColorConversion_glsl_js__WEBPACK_IMPORTED_MODULE_0__["ColorConversion"]),i.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"]`
    vec3 mixExternalColor(vec3 internalColor, vec3 textureColor, vec3 externalColor, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/10475
      vec3 internalMixed = internalColor * textureColor;
      vec3 allMixed = internalMixed * externalColor;

      if (mode == ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"].int(1)}) {
        return allMixed;
      }
      else if (mode == ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"].int(2)}) {
        return internalMixed;
      }
      else if (mode == ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"].int(3)}) {
        return externalColor;
      }
      else {
        // tint (or something invalid)
        float vIn = rgb2v(internalMixed);
        vec3 hsvTint = rgb2hsv(externalColor);
        vec3 hsvOut = vec3(hsvTint.x, hsvTint.y, vIn * hsvTint.z);
        return hsv2rgb(hsvOut);
      }
    }

    float mixExternalOpacity(float internalOpacity, float textureOpacity, float externalOpacity, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/10475
      float internalMixed = internalOpacity * textureOpacity;
      float allMixed = internalMixed * externalOpacity;

      if (mode == ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"].int(2)}) {
        return internalMixed;
      }
      else if (mode == ${_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_1__["glsl"].int(3)}) {
        return externalOpacity;
      }
      else {
        // multiply or tint (or something invalid)
        return allMixed;
      }
    }
  `)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/RgbaFloatEncoding.glsl.js":
/*!************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/RgbaFloatEncoding.glsl.js ***!
  \************************************************************************************************************/
/*! exports provided: RgbaFloatEncoding */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RgbaFloatEncoding", function() { return a; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a){a.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 float2rgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}
const vec4 RGBA_2_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgba2float(vec4 rgba) {
return dot(rgba, RGBA_2_FLOAT_FACTORS);
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ScreenSizePerspective.glsl.js":
/*!****************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/ScreenSizePerspective.glsl.js ***!
  \****************************************************************************************************************/
/*! exports provided: ScreenSizePerspective, bindScreenSizePerspectiveUniforms */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScreenSizePerspective", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindScreenSizePerspectiveUniforms", function() { return c; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/* harmony import */ var _materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../materials/internal/MaterialUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(a){a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float screenSizePerspectiveMinSize(float size, vec4 factor) {
float nonZeroSize = 1.0 - step(size, 0.0);
return (
factor.z * (
1.0 +
nonZeroSize *
2.0 * factor.w / (
size + (1.0 - nonZeroSize)
)
)
);
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float screenSizePerspectiveViewAngleDependentFactor(float absCosAngle) {
return absCosAngle * absCosAngle * absCosAngle;
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec4 screenSizePerspectiveScaleFactor(float absCosAngle, float distanceToCamera, vec4 params) {
return vec4(
min(params.x / (distanceToCamera - params.y), 1.0),
screenSizePerspectiveViewAngleDependentFactor(absCosAngle),
params.z,
params.w
);
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float applyScreenSizePerspectiveScaleFactorFloat(float size, vec4 factor) {
return max(mix(size * factor.x, size, factor.y), screenSizePerspectiveMinSize(size, factor));
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`float screenSizePerspectiveScaleFloat(float size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorFloat(
size,
screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params)
);
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec2 applyScreenSizePerspectiveScaleFactorVec2(vec2 size, vec4 factor) {
return mix(size * clamp(factor.x, screenSizePerspectiveMinSize(size.y, factor) / size.y, 1.0), size, factor.y);
}`),a.vertex.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`vec2 screenSizePerspectiveScaleVec2(vec2 size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorVec2(size, screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params));
}`)}function c(e,r){if(r.screenSizePerspective){Object(_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_1__["bindScreenSizePerspective"])(r.screenSizePerspective,e,"screenSizePerspective");const c=r.screenSizePerspectiveAlignment||r.screenSizePerspective;Object(_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_1__["bindScreenSizePerspective"])(c,e,"screenSizePerspectiveAlignment")}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/TextureAtlasLookup.glsl.js":
/*!*************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/TextureAtlasLookup.glsl.js ***!
  \*************************************************************************************************************/
/*! exports provided: TextureAtlasLookup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextureAtlasLookup", function() { return t; });
/* harmony import */ var _shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../shaderModules/interfaces.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){t.extensions.add("GL_EXT_shader_texture_lod"),t.extensions.add("GL_OES_standard_derivatives"),t.fragment.code.add(_shaderModules_interfaces_js__WEBPACK_IMPORTED_MODULE_0__["glsl"]`#ifndef GL_EXT_shader_texture_lod
float calcMipMapLevel(const vec2 ddx, const vec2 ddy) {
float deltaMaxSqr = max(dot(ddx, ddx), dot(ddy, ddy));
return max(0.0, 0.5 * log2(deltaMaxSqr));
}
#endif
vec4 textureAtlasLookup(sampler2D texture, vec2 textureSize, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
#ifdef GL_EXT_shader_texture_lod
return texture2DGradEXT(texture, uvAtlas, dUVdx, dUVdy);
#else
vec2 dUVdxAuto = dFdx(uvAtlas);
vec2 dUVdyAuto = dFdy(uvAtlas);
float mipMapLevel = calcMipMapLevel(dUVdx * textureSize, dUVdy * textureSize);
float autoMipMapLevel = calcMipMapLevel(dUVdxAuto * textureSize, dUVdyAuto * textureSize);
return texture2D(texture, uvAtlas, mipMapLevel - autoMipMapLevel);
#endif
}`)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/View.glsl.js":
/*!***********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/View.glsl.js ***!
  \***********************************************************************************************/
/*! exports provided: bindCameraPosition, bindNearFar, bindProjectionMatrix, bindView, bindViewCustomOrigin, bindViewport */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindCameraPosition", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindNearFar", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindProjectionMatrix", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindView", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindViewCustomOrigin", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindViewport", function() { return m; });
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _chunks_mat4f32_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../../chunks/mat4f32.js */ "../node_modules/@arcgis/core/chunks/mat4f32.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(i,n,o){i.setUniform3f("camPos",o[3]-n[0],o[7]-n[1],o[11]-n[2])}function t(i,n){i.setUniformMatrix4fv("proj",n)}function r(i,n){i.setUniform2fv("nearFar",n)}function f(n,o,t){Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c,t,o),n.setUniform3fv("localOrigin",o),n.setUniformMatrix4fv("view",c)}function a(i,n){f(i,n.origin,n.camera.viewMatrix)}function m(i,n){i.setUniform4fv("viewport",n.camera.fullViewport)}const c=Object(_chunks_mat4f32_js__WEBPACK_IMPORTED_MODULE_1__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js":
/*!**********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/ShaderBuilder.js ***!
  \**********************************************************************************************/
/*! exports provided: Code, Includes, ShaderBuilder, Stage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Code", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Includes", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShaderBuilder", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Stage", function() { return o; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.3d.webgl-engine.core.shaderModules.shaderBuilder");class r{constructor(){this.includedModules=new Map}include(e,r){this.includedModules.has(e)?this.includedModules.get(e)!==r&&t.error("Trying to include shader module multiple times with different sets of options."):(this.includedModules.set(e,r),e(this.builder,r))}}class n extends r{constructor(){super(...arguments),this.vertex=new o,this.fragment=new o,this.attributes=new a,this.varyings=new c,this.extensions=new u,this.constants=new h}get fragmentUniforms(){return this.fragment.uniforms}get builder(){return this}generateSource(e){const t=this.extensions.generateSource(e),r=this.attributes.generateSource(e),n=this.varyings.generateSource(),s="vertex"===e?this.vertex:this.fragment,i=s.uniforms.generateSource(),o=s.code.generateSource(),a="vertex"===e?l:m,c=this.constants.generateSource().concat(s.constants.generateSource());return`\n${t.join("\n")}\n\n${a}\n\n${c.join("\n")}\n\n${i.join("\n")}\n\n${r.join("\n")}\n\n${n.join("\n")}\n\n${o.join("\n")}`}}class s{constructor(){this._entries=new Map}add(e,t,r){const n=`${e}_${t}_${r}`;return this._entries.set(n,{name:e,type:t,arraySize:r}),this}generateSource(){const e=e=>e?`[${e}]`:"";return Array.from(this._entries.values()).map((t=>`uniform ${t.type} ${t.name}${e(t.arraySize)};`))}get entries(){return Array.from(this._entries.values())}}class i{constructor(){this._entries=new Array}add(e){this._entries.push(e)}generateSource(){return this._entries}}class o extends r{constructor(){super(...arguments),this.uniforms=new s,this.code=new i,this.constants=new h}get builder(){return this}}class a{constructor(){this._entries=new Array}add(e,t){this._entries.push([e,t])}generateSource(e){return"fragment"===e?[]:this._entries.map((e=>`attribute ${e[1]} ${e[0]};`))}}class c{constructor(){this._entries=new Array}add(e,t){this._entries.push([e,t])}generateSource(){return this._entries.map((e=>`varying ${e[1]} ${e[0]};`))}}class u{constructor(){this._entries=new Set}add(e){this._entries.add(e)}generateSource(e){const t="vertex"===e?u.ALLOWLIST_VERTEX:u.ALLOWLIST_FRAGMENT;return Array.from(this._entries).filter((e=>t.includes(e))).map((e=>`#extension ${e} : enable`))}}u.ALLOWLIST_FRAGMENT=["GL_EXT_shader_texture_lod","GL_OES_standard_derivatives"],u.ALLOWLIST_VERTEX=[];class h{constructor(){this._entries=[]}add(e,t,r){let n="ERROR_CONSTRUCTOR_STRING";switch(t){case"float":n=h.numberToFloatStr(r);break;case"int":n=h.numberToIntStr(r);break;case"bool":n=r.toString();break;case"vec2":n=`vec2(${h.numberToFloatStr(r[0])},                            ${h.numberToFloatStr(r[1])})`;break;case"vec3":n=`vec3(${h.numberToFloatStr(r[0])},                            ${h.numberToFloatStr(r[1])},                            ${h.numberToFloatStr(r[2])})`;break;case"vec4":n=`vec4(${h.numberToFloatStr(r[0])},                            ${h.numberToFloatStr(r[1])},                            ${h.numberToFloatStr(r[2])},                            ${h.numberToFloatStr(r[3])})`;break;case"ivec2":n=`ivec2(${h.numberToIntStr(r[0])},                             ${h.numberToIntStr(r[1])})`;break;case"ivec3":n=`ivec3(${h.numberToIntStr(r[0])},                             ${h.numberToIntStr(r[1])},                             ${h.numberToIntStr(r[2])})`;break;case"ivec4":n=`ivec4(${h.numberToIntStr(r[0])},                             ${h.numberToIntStr(r[1])},                             ${h.numberToIntStr(r[2])},                             ${h.numberToIntStr(r[3])})`;break;case"mat2":case"mat3":case"mat4":n=`${t}(${Array.prototype.map.call(r,(e=>h.numberToFloatStr(e))).join(", ")})`}return this._entries.push(`const ${t} ${e} = ${n};`),this}static numberToIntStr(e){return e.toFixed(0)}static numberToFloatStr(e){return Number.isInteger(e)?e.toFixed(1):e.toString()}generateSource(){return Array.from(this._entries)}}const m="#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n  precision highp sampler2D;\n#else\n  precision mediump float;\n  precision mediump sampler2D;\n#endif",l="precision highp float;\nprecision highp sampler2D;";


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js":
/*!*******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderModules/interfaces.js ***!
  \*******************************************************************************************/
/*! exports provided: glsl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "glsl", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,...n){let o="";for(let r=0;r<n.length;r++)o+=t[r]+n[r];return o+=t[t.length-1],o}!function(t){function n(t){return Math.round(t).toString()}function o(t){return t.toPrecision(8)}t.int=n,t.float=o}(t||(t={}));


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ReloadableShaderModule.js":
/*!*********************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ReloadableShaderModule.js ***!
  \*********************************************************************************************************/
/*! exports provided: ReloadableShaderModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReloadableShaderModule", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t,o){this._module=t,this._loadModule=o}get(){return this._module}async reload(){return this._module=await this._loadModule(),this._module}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechnique.js":
/*!**************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechnique.js ***!
  \**************************************************************************************************/
/*! exports provided: ShaderTechnique */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShaderTechnique", function() { return t; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(i,t,e=(()=>this.dispose())){this.release=e,t&&(this._config=t.snapshot()),this._program=this.initializeProgram(i),this._pipeline=this.initializePipeline(i)}dispose(){this._program=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["disposeMaybe"])(this._program),this._pipeline=this._config=null}reload(t){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["disposeMaybe"])(this._program),this._program=this.initializeProgram(t)}get program(){return this._program}get pipeline(){return this._pipeline}get key(){return this._config.key}get configuration(){return this._config}bindPass(i,t){}bindMaterial(i,t){}bindDraw(i,t,e){}bindPipelineState(i){i.setPipelineState(this.pipeline)}ensureAttributeLocations(i){this.program.assertCompatibleVertexAttributeLocations(i)}get primitiveType(){return 4}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechniqueConfiguration.js":
/*!***************************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechniqueConfiguration.js ***!
  \***************************************************************************************************************/
/*! exports provided: ShaderTechniqueConfiguration, parameter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShaderTechniqueConfiguration", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parameter", function() { return r; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(){this._key="",this._keyDirty=!1,this._parameterBits=this._parameterBits.map((()=>0))}get key(){return this._keyDirty&&(this._keyDirty=!1,this._key=String.fromCharCode.apply(String,this._parameterBits)),this._key}snapshot(){const t=this._parameterNames,e={key:this.key};for(const r of t)e[r]=this[r];return e}}function r(e={}){return(r,s)=>{var a,i;r._parameterNames=null!=(a=r._parameterNames)?a:[],r._parameterNames.push(s);const o=r._parameterNames.length-1,h=e.count||2,n=Math.ceil(Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["log2"])(h)),m=null!=(i=r._parameterBits)?i:[0];let p=0;for(;m[p]+n>16;)p++,p>=m.length&&m.push(0);r._parameterBits=m;const y=m[p],_=(1<<n)-1<<y;m[p]+=n,Object.defineProperty(r,s,{get(){return this[o]},set(t){if(this[o]!==t&&(this[o]=t,this._keyDirty=!0,this._parameterBits[p]=this._parameterBits[p]&~_|+t<<y&_,"number"!=typeof t&&"boolean"!=typeof t))throw"Configuration value for "+s+" must be boolean or number, got "+typeof t}})}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/AutoDisposable.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/AutoDisposable.js ***!
  \********************************************************************************/
/*! exports provided: AutoDisposable, AutoDisposableMixin, autoDispose */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AutoDisposable", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AutoDisposableMixin", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "autoDispose", function() { return i; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=s=>{class e extends s{constructor(){super(...arguments),this._isDisposed=!1}dispose(){for(const e of null!=(s=this._managedDisposables)?s:[]){var s;const i=this[e];this[e]=null,i&&"function"==typeof i.dispose&&i.dispose()}this._isDisposed=!0}get isDisposed(){return this._isDisposed}}return e};class e extends(s(class{})){}function i(){return(s,e)=>{var i,o;s.hasOwnProperty("_managedDisposables")||(s._managedDisposables=null!=(i=null==(o=s._managedDisposables)?void 0:o.slice())?i:[]);s._managedDisposables.unshift(e)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BasisUtil.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BasisUtil.js ***!
  \***************************************************************************/
/*! exports provided: createTextureBasis, createTextureKTX2, estimateMemoryBasis, estimateMemoryKTX2, loadBasis */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTextureBasis", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTextureKTX2", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "estimateMemoryBasis", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "estimateMemoryKTX2", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadBasis", function() { return a; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _libs_basisu_BasisU_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../libs/basisu/BasisU.js */ "../node_modules/@arcgis/core/libs/basisu/BasisU.js");
/* harmony import */ var _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../webgl/Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _webgl_Util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../webgl/Util.js */ "../node_modules/@arcgis/core/views/webgl/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s=null,i=null;async function a(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(i)&&(i=Object(_libs_basisu_BasisU_js__WEBPACK_IMPORTED_MODULE_1__["getBasisTranscoder"])(),s=await i),i}function o(t,n){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(s))return t.byteLength;const r=new s.BasisFile(new Uint8Array(t)),i=c(r)?l(r.getNumLevels(0),r.getHasAlpha(),r.getImageWidth(0,0),r.getImageHeight(0,0),n):0;return r.close(),r.delete(),i}function g(t,n){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(s))return t.byteLength;const r=new s.KTX2File(new Uint8Array(t)),i=u(r)?l(r.getLevels(),r.getHasAlpha(),r.getWidth(),r.getHeight(),n):0;return r.close(),r.delete(),i}function l(e,t,n,s,i){const a=Object(_webgl_Util_js__WEBPACK_IMPORTED_MODULE_3__["getBytesPerElementFormat"])(t?37496:37492),o=i&&e>1?(4**e-1)/(3*4**(e-1)):1;return Math.ceil(n*s*a*o)}function c(e){return e.getNumImages()>=1&&!e.isUASTC()}function u(e){return e.getFaces()>=1&&e.isETC1S()}async function m(t,n,r){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(s)&&(s=await a());const i=new s.BasisFile(new Uint8Array(r));if(!c(i))return null;i.startTranscoding();const o=d(t,n,i.getNumLevels(0),i.getHasAlpha(),i.getImageWidth(0,0),i.getImageHeight(0,0),((e,t)=>i.getImageTranscodedSizeInBytes(0,e,t)),((e,t,n)=>i.transcodeImage(n,0,e,t,0,0)));return i.close(),i.delete(),o}async function h(t,n,r){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(s)&&(s=await a());const i=new s.KTX2File(new Uint8Array(r));if(!u(i))return null;i.startTranscoding();const o=d(t,n,i.getLevels(),i.getHasAlpha(),i.getWidth(),i.getHeight(),((e,t)=>i.getImageTranscodedSizeInBytes(e,0,0,t)),((e,t,n)=>i.transcodeImage(n,e,0,0,t,0,-1,-1)));return i.close(),i.delete(),o}function d(e,t,r,s,i,a,o,g){const{compressedTextureETC:l,compressedTextureS3TC:c}=e.capabilities,[u,m]=l?s?[1,37496]:[0,37492]:c?s?[3,33779]:[2,33776]:[13,6408],h=t.hasMipmap?r:Math.min(1,r),d=[];for(let n=0;n<h;n++)d.push(new Uint8Array(o(n,u))),g(n,u,d[n]);const p=d.length>1,f=p?9987:9729,w={...t,samplingMode:f,hasMipmap:p,internalFormat:m,width:i,height:a};return new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_2__["default"](e,w,{type:"compressed",levels:d})}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BoundingInfo.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BoundingInfo.js ***!
  \******************************************************************************/
/*! exports provided: BoundingInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BoundingInfo", function() { return a; });
/* harmony import */ var _core_PooledArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/PooledArray.js */ "../node_modules/@arcgis/core/core/PooledArray.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class a{constructor(i,s,a,c){this.primitiveIndices=i,this._numIndexPerPrimitive=s,this.indices=a,this.position=c,this.center=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["assert"])(i.length>=1),Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["assert"])(a.length%this._numIndexPerPrimitive==0),Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["assert"])(a.length>=i.length*this._numIndexPerPrimitive),Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["assert"])(3===c.size||4===c.size);const{data:o,size:M}=c,d=i.length;let l=M*a[this._numIndexPerPrimitive*i[0]];b.clear(),b.push(l),this.bbMin=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["f"])(o[l],o[l+1],o[l+2]),this.bbMax=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["a"])(this.bbMin);for(let t=0;t<d;++t){const s=this._numIndexPerPrimitive*i[t];for(let i=0;i<this._numIndexPerPrimitive;++i){l=M*a[s+i],b.push(l);let t=o[l];this.bbMin[0]=Math.min(t,this.bbMin[0]),this.bbMax[0]=Math.max(t,this.bbMax[0]),t=o[l+1],this.bbMin[1]=Math.min(t,this.bbMin[1]),this.bbMax[1]=Math.max(t,this.bbMax[1]),t=o[l+2],this.bbMin[2]=Math.min(t,this.bbMin[2]),this.bbMax[2]=Math.max(t,this.bbMax[2])}}Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["e"])(this.center,this.bbMin,this.bbMax,.5),this.radius=.5*Math.max(Math.max(this.bbMax[0]-this.bbMin[0],this.bbMax[1]-this.bbMin[1]),this.bbMax[2]-this.bbMin[2]);let m=this.radius*this.radius;for(let t=0;t<b.length;++t){l=b.getItemAt(t);const i=o[l]-this.center[0],s=o[l+1]-this.center[1],e=o[l+2]-this.center[2],n=i*i+s*s+e*e;if(n<=m)continue;const r=Math.sqrt(n),h=.5*(r-this.radius);this.radius=this.radius+h,m=this.radius*this.radius;const a=h/r;this.center[0]+=i*a,this.center[1]+=s*a,this.center[2]+=e*a}b.clear()}getCenter(){return this.center}getBSRadius(){return this.radius}getBBMin(){return this.bbMin}getBBMax(){return this.bbMax}getChildren(){if(this._children)return this._children;if(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["h"])(this.bbMin,this.bbMax)>1){const i=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["e"])(Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),this.bbMin,this.bbMax,.5),s=this.primitiveIndices.length,n=new Uint8Array(s),r=new Array(8);for(let t=0;t<8;++t)r[t]=0;const{data:h,size:b}=this.position;for(let t=0;t<s;++t){let s=0;const e=this._numIndexPerPrimitive*this.primitiveIndices[t];let a=b*this.indices[e],c=h[a],o=h[a+1],M=h[a+2];for(let i=1;i<this._numIndexPerPrimitive;++i){a=b*this.indices[e+i];const t=h[a],s=h[a+1],n=h[a+2];t<c&&(c=t),s<o&&(o=s),n<M&&(M=n)}c<i[0]&&(s|=1),o<i[1]&&(s|=2),M<i[2]&&(s|=4),n[t]=s,++r[s]}let c=0;for(let t=0;t<8;++t)r[t]>0&&++c;if(c<2)return;const o=new Array(8);for(let t=0;t<8;++t)o[t]=r[t]>0?new Uint32Array(r[t]):void 0;for(let t=0;t<8;++t)r[t]=0;for(let t=0;t<s;++t){const i=n[t];o[i][r[i]++]=this.primitiveIndices[t]}this._children=new Array(8);for(let t=0;t<8;++t)void 0!==o[t]&&(this._children[t]=new a(o[t],this._numIndexPerPrimitive,this.indices,this.position))}return this._children}static prune(){b.prune()}}const b=new _core_PooledArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]({deallocator:null});


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/ContentObject.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/ContentObject.js ***!
  \*******************************************************************************/
/*! exports provided: ContentObject */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ContentObject", function() { return r; });
/* harmony import */ var _core_uid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/uid.js */ "../node_modules/@arcgis/core/core/uid.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class r{constructor(){this.id=Object(_core_uid_js__WEBPACK_IMPORTED_MODULE_0__["generateUID"])()}unload(){}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DDSUtil.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DDSUtil.js ***!
  \*************************************************************************/
/*! exports provided: createDDSTexture, createDDSTextureData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDDSTexture", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDDSTextureData", function() { return A; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../webgl/Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.3d.webgl-engine.lib.DDSUtil"),o=542327876,a=131072,i=4;function s(e){return e.charCodeAt(0)+(e.charCodeAt(1)<<8)+(e.charCodeAt(2)<<16)+(e.charCodeAt(3)<<24)}function l(e){return String.fromCharCode(255&e,e>>8&255,e>>16&255,e>>24&255)}const u=s("DXT1"),c=s("DXT3"),m=s("DXT5"),h=31,p=0,d=1,g=2,f=3,w=4,C=7,x=20,D=21;function b(e,t,n){const{textureData:o,internalFormat:a,width:i,height:s}=A(n,t.hasMipmap);return t.samplingMode=o.levels.length>1?9987:9729,t.hasMipmap=o.levels.length>1,t.internalFormat=a,t.width=i,t.height=s,new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_2__["default"](e,t,o)}function A(e,r){const s=new Int32Array(e,0,h);if(s[p]!==o)return n.error("Invalid magic number in DDS header"),null;if(!(s[x]&i))return n.error("Unsupported format, must contain a FourCC code"),null;const b=s[D];let A,M;switch(b){case u:A=8,M=33776;break;case c:A=16,M=33778;break;case m:A=16,M=33779;break;default:return n.error("Unsupported FourCC code:",l(b)),null}let v=1,F=s[w],U=s[f];0==(3&F)&&0==(3&U)||(n.warn("Rounding up compressed texture size to nearest multiple of 4."),F=F+3&-4,U=U+3&-4);const T=F,j=U;let k,y;s[g]&a&&!1!==r&&(v=Math.max(1,s[C])),1===v||Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["isPowerOfTwo"])(F)&&Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["isPowerOfTwo"])(U)||(n.warn("Ignoring mipmaps of non power of two sized compressed texture."),v=1);let I=s[d]+4;const S=[];for(let t=0;t<v;++t)y=(F+3>>2)*(U+3>>2)*A,k=new Uint8Array(e,I,y),S.push(k),I+=y,F=Math.max(1,F>>1),U=Math.max(1,U>>1);return{textureData:{type:"compressed",levels:S},internalFormat:M,width:T,height:j}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js":
/*!*************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js ***!
  \*************************************************************************************************/
/*! exports provided: Default3D */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Default3D", function() { return o; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=new Map([["position",0],["normal",1],["uv0",2],["color",3],["size",4],["tangent",4],["auxpos1",5],["symbolColor",5],["auxpos2",6],["featureAttribute",6],["instanceFeatureAttribute",6],["instanceColor",7],["model",8],["modelNormal",12],["modelOriginHi",11],["modelOriginLo",15]]);


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexBufferLayouts.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexBufferLayouts.js ***!
  \********************************************************************************************/
/*! exports provided: Pos2, Pos2Tex, Pos3, Pos3Col, Pos3NormalTex, Pos3Tex */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos2", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos2Tex", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos3", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos3Col", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos3NormalTex", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pos3Tex", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=[{name:"position",count:3,type:5126,offset:0,stride:12,normalized:!1}],t=[{name:"position",count:3,type:5126,offset:0,stride:20,normalized:!1},{name:"uv0",count:2,type:5126,offset:12,stride:20,normalized:!1}],o=[{name:"position",count:3,type:5126,offset:0,stride:32,normalized:!1},{name:"normal",count:3,type:5126,offset:12,stride:32,normalized:!1},{name:"uv0",count:2,type:5126,offset:24,stride:32,normalized:!1}],n=[{name:"position",count:3,type:5126,offset:0,stride:16,normalized:!1},{name:"color",count:4,type:5121,offset:12,stride:16,normalized:!1}],i=[{name:"position",count:2,type:5126,offset:0,stride:8,normalized:!1}],s=[{name:"position",count:2,type:5126,offset:0,stride:16,normalized:!1},{name:"uv0",count:2,type:5126,offset:8,stride:16,normalized:!1}];


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterial.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterial.js ***!
  \****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
/* harmony import */ var _AutoDisposable_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AutoDisposable.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/AutoDisposable.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t extends _AutoDisposable_js__WEBPACK_IMPORTED_MODULE_0__["AutoDisposable"]{constructor(e){super(),this._material=e.material,this._techniqueRep=e.techniqueRep,this._output=e.output}get technique(){return this._technique}getPipelineState(e,t){return this.technique.pipeline}ensureResources(e){return 2}ensureParameters(e){}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterialTexture.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterialTexture.js ***!
  \***********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _GLMaterial_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GLMaterial.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class i extends _GLMaterial_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(e){super(e),this._textureIDs=new Set,this._textureRepository=e.textureRep,this._textureId=e.textureId,this._initTransparent=!!e.initTextureTransparent,this._texture=this._acquire(this._textureId),this._textureNormal=this._acquire(e.normalTextureId),this._textureEmissive=this._acquire(e.emissiveTextureId),this._textureOcclusion=this._acquire(e.occlusionTextureId),this._textureMetallicRoughness=this._acquire(e.metallicRoughnessTextureId)}dispose(){this._textureIDs.forEach((e=>this._textureRepository.release(e))),this._textureIDs.clear()}updateTexture(e){e!==this._textureId&&(this._release(this._textureId),this._textureId=e,this._texture=this._acquire(this._textureId))}bindTextures(t){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._texture)&&t.bindTexture(this._texture.glTexture,"tex"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._textureNormal)&&t.bindTexture(this._textureNormal.glTexture,"normalTexture"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._textureEmissive)&&t.bindTexture(this._textureEmissive.glTexture,"texEmission"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._textureOcclusion)&&t.bindTexture(this._textureOcclusion.glTexture,"texOcclusion"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._textureMetallicRoughness)&&t.bindTexture(this._textureMetallicRoughness.glTexture,"texMetallicRoughness")}bindTextureScale(t){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._texture)&&this._texture.glTexture;r&&r.descriptor.textureCoordinateScaleFactor?t.setUniform2fv("textureCoordinateScaleFactor",r.descriptor.textureCoordinateScaleFactor):t.setUniform2f("textureCoordinateScaleFactor",1,1)}_acquire(e){if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(e))return this._textureIDs.add(e),this._textureRepository.acquire(e,this._initTransparent)}_release(e){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(e)||(this._textureIDs.delete(e),this._textureRepository.release(e))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Geometry.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Geometry.js ***!
  \**************************************************************************/
/*! exports provided: Geometry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Geometry", function() { return u; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _BoundingInfo_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BoundingInfo.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BoundingInfo.js");
/* harmony import */ var _ContentObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ContentObject.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/ContentObject.js");
/* harmony import */ var _geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./geometryDataUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/geometryDataUtils.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class u extends _ContentObject_js__WEBPACK_IMPORTED_MODULE_2__["ContentObject"]{constructor(t,e=[],i=0,s=-1){super(),this._primitiveType=i,this.edgeIndicesLength=s,this.type=2,this._vertexAttributes=new Map,this._indices=new Map,this._boundingInfo=null;for(const[n,r]of t)r&&this._vertexAttributes.set(n,{...r});if(null==e||0===e.length){const t=h(this._vertexAttributes),e=Object(_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_3__["generateDefaultIndexArray"])(t);this.edgeIndicesLength=this.edgeIndicesLength<0?t:this.edgeIndicesLength;for(const i of this._vertexAttributes.keys())this._indices.set(i,e)}else for(const[n,r]of e)r&&(this._indices.set(n,g(r)),"position"===n&&(this.edgeIndicesLength=this.edgeIndicesLength<0?this._indices.get(n).length:this.edgeIndicesLength))}get vertexAttributes(){return this._vertexAttributes}getMutableAttribute(t){const e=this._vertexAttributes.get(t);return e&&!e.exclusive&&(e.data=Array.from(e.data),e.exclusive=!0),e}get indices(){return this._indices}get indexCount(){const t=this._indices.values().next().value;return t?t.length:0}get primitiveType(){return this._primitiveType}get faceCount(){return this.indexCount/3}get boundingInfo(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(this._boundingInfo)&&(this._boundingInfo=this._calculateBoundingInfo()),this._boundingInfo}computeAttachmentOrigin(t){return 0===this.primitiveType?this.computeAttachmentOriginTriangles(t):this.computeAttachmentOriginPoints(t)}computeAttachmentOriginTriangles(t){const e=this.indices.get("position"),i=this.vertexAttributes.get("position");return Object(_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_3__["computeAttachmentOriginTriangles"])(i,e,t)}computeAttachmentOriginPoints(t){const e=this.indices.get("position"),i=this.vertexAttributes.get("position");return Object(_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_3__["computeAttachmentOriginPoints"])(i,e,t)}invalidateBoundingInfo(){this._boundingInfo=null}_calculateBoundingInfo(){const t=this.indices.get("position");if(0===t.length)return null;const i=0===this.primitiveType?3:1;Object(_Util_js__WEBPACK_IMPORTED_MODULE_4__["assert"])(t.length%i==0,"Indexing error: "+t.length+" not divisible by "+i);const s=Object(_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_3__["generateDefaultIndexArray"])(t.length/i),r=this.vertexAttributes.get("position");return new _BoundingInfo_js__WEBPACK_IMPORTED_MODULE_1__["BoundingInfo"](s,i,t,r)}}function h(t){const e=t.values().next().value;return null==e?0:e.data.length/e.size}function g(t){if(t.BYTES_PER_ELEMENT===Uint16Array.BYTES_PER_ELEMENT)return t;for(const e of t)if(e>=65536)return t;return new Uint16Array(t)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Material.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Material.js ***!
  \**************************************************************************/
/*! exports provided: Material, materialParametersDefaults, materialPredicate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Material", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "materialParametersDefaults", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "materialPredicate", function() { return n; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _ContentObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ContentObject.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/ContentObject.js");
/* harmony import */ var _DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DefaultVertexAttributeLocations.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js");
/* harmony import */ var _materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../materials/internal/MaterialUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class a extends _ContentObject_js__WEBPACK_IMPORTED_MODULE_1__["ContentObject"]{constructor(e,r){super(),this.type=3,this.supportsEdges=!1,this._visible=!0,this._renderPriority=0,this._insertOrder=0,this._vertexAttributeLocations=_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_2__["Default3D"],this._params=Object(_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_3__["copyParameters"])(e,r),this.validateParameterValues(this._params)}dispose(){}get params(){return this._params}update(e){return!1}setParameterValues(e){Object(_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_3__["updateParameters"])(this._params,e)&&(this.validateParameterValues(this._params),this.parametersChanged())}validateParameterValues(e){}get visible(){return this._visible}set visible(e){e!==this._visible&&(this._visible=e,this.parametersChanged())}isVisibleInPass(e){return!0}get renderOccluded(){return this.params.renderOccluded}get renderPriority(){return this._renderPriority}set renderPriority(e){e!==this._renderPriority&&(this._renderPriority=e,this.parametersChanged())}get insertOrder(){return this._insertOrder}set insertOrder(e){e!==this._insertOrder&&(this._insertOrder=e,this.parametersChanged())}get vertexAttributeLocations(){return this._vertexAttributeLocations}isVisible(){return this._visible}parametersChanged(){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this.materialRepository)&&this.materialRepository.materialChanged(this)}}function n(e,r){return e.isVisible()&&e.isVisibleInPass(r.pass)&&0!=(e.renderOccluded&r.renderOccludedMask)}const d={renderOccluded:1};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/OrderIndependentTransparency.js":
/*!**********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/OrderIndependentTransparency.js ***!
  \**********************************************************************************************/
/*! exports provided: OITBlending, OITDepthTest, OITDepthWrite, OITPolygonOffset, OITPolygonOffsetLimit, blendingAlpha, blendingColor, blendingDefault, getOITPolygonOffset */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OITBlending", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OITDepthTest", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OITDepthWrite", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OITPolygonOffset", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OITPolygonOffsetLimit", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blendingAlpha", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blendingColor", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blendingDefault", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOITPolygonOffset", function() { return s; });
/* harmony import */ var _webgl_renderState_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../webgl/renderState.js */ "../node_modules/@arcgis/core/views/webgl/renderState.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=Object(_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_0__["separateBlendingParams"])(770,1,771,771),e=Object(_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_0__["simpleBlendingParams"])(1,1),o=Object(_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_0__["simpleBlendingParams"])(0,771);function c(n){return 2===n?null:1===n?o:e}function l(n){return 2===n?_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_0__["defaultDepthWriteParams"]:null}const f=5e5,i={factor:-1,units:-2};function s(n){return n?i:null}function a(n){return 3===n||2===n?513:515}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Program.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Program.js ***!
  \*************************************************************************/
/*! exports provided: Program */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Program", function() { return n; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_PooledArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/PooledArray.js */ "../node_modules/@arcgis/core/core/PooledArray.js");
/* harmony import */ var _webgl_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../webgl/checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _webgl_Program_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../webgl/Program.js */ "../node_modules/@arcgis/core/views/webgl/Program.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class n extends _webgl_Program_js__WEBPACK_IMPORTED_MODULE_3__["Program"]{constructor(e,t,i){super(e,t.generateSource("vertex"),t.generateSource("fragment"),i),this._textures=new Map,this._freeTextureUnits=new _core_PooledArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]({deallocator:null}),this._fragmentUniforms=Object(_webgl_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["webglDebugEnabled"])()?t.fragmentUniforms.entries:null}stop(){this._textures.clear(),this._freeTextureUnits.clear()}bindTexture(t,r){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t)||null==t.glName){const e=this._textures.get(r);return e&&(this._context.bindTexture(null,e.unit),this._freeTextureUnit(e),this._textures.delete(r)),null}let s=this._textures.get(r);return null==s?(s=this._allocTextureUnit(t),this._textures.set(r,s)):s.texture=t,this._context.useProgram(this),this.setUniform1i(r,s.unit),this._context.bindTexture(t,s.unit),s.unit}rebindTextures(){this._context.useProgram(this),this._textures.forEach(((e,t)=>{this._context.bindTexture(e.texture,e.unit),this.setUniform1i(t,e.unit)})),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(this._fragmentUniforms)&&this._fragmentUniforms.forEach((e=>{if(("sampler2D"===e.type||"samplerCube"===e.type)&&!this._textures.has(e.name))throw new Error(`Texture sampler ${e.name} has no bound texture`)}))}_allocTextureUnit(e){return{texture:e,unit:0===this._freeTextureUnits.length?this._textures.size:this._freeTextureUnits.pop()}}_freeTextureUnit(e){this._freeTextureUnits.push(e.unit)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/StencilUtils.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/StencilUtils.js ***!
  \******************************************************************************/
/*! exports provided: depthCompareAlways, depthCompareLess, renderWhenBitIsNotSet, replaceBitWhenDepthTestPasses, stencilBaseAllZerosParams, stencilToolMaskBaseParams, stencilToolMaskOccluderParams, stencilToolTransparentOccluderParams, stencilWriteMaskOff, stencilWriteMaskOn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "depthCompareAlways", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "depthCompareLess", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renderWhenBitIsNotSet", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "replaceBitWhenDepthTestPasses", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilBaseAllZerosParams", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilToolMaskBaseParams", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilToolMaskOccluderParams", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilToolTransparentOccluderParams", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilWriteMaskOff", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stencilWriteMaskOn", function() { return f; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a={func:513},n={func:519},f={mask:255},i={mask:0},s=a=>({function:{func:517,ref:a,mask:a},operation:{fail:7680,zFail:7680,zPass:7680}}),o=a=>({function:{func:519,ref:a,mask:a},operation:{fail:7680,zFail:7680,zPass:7681}}),c={function:{func:519,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:0}},t={function:{func:519,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:7681}},u={function:{func:514,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:7680}},e={function:{func:517,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:7680}};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Texture.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Texture.js ***!
  \*************************************************************************/
/*! exports provided: Texture */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Texture", function() { return S; });
/* harmony import */ var _core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/compilerUtils.js */ "../node_modules/@arcgis/core/core/compilerUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Evented_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/Evented.js */ "../node_modules/@arcgis/core/core/Evented.js");
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _support_requestImageUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../support/requestImageUtils.js */ "../node_modules/@arcgis/core/support/requestImageUtils.js");
/* harmony import */ var _support_requestUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../support/requestUtils.js */ "../node_modules/@arcgis/core/support/requestUtils.js");
/* harmony import */ var _BasisUtil_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BasisUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/BasisUtil.js");
/* harmony import */ var _ContentObject_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ContentObject.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/ContentObject.js");
/* harmony import */ var _DDSUtil_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DDSUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DDSUtil.js");
/* harmony import */ var _glUtil3D_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./glUtil3D.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/glUtil3D.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/* harmony import */ var _webgl_FramebufferObject_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../webgl/FramebufferObject.js */ "../node_modules/@arcgis/core/views/webgl/FramebufferObject.js");
/* harmony import */ var _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../webgl/Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _webgl_Util_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../webgl/Util.js */ "../node_modules/@arcgis/core/views/webgl/Util.js");
/* harmony import */ var _webgl_capabilities_isWebGL2Context_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../webgl/capabilities/isWebGL2Context.js */ "../node_modules/@arcgis/core/views/webgl/capabilities/isWebGL2Context.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class S extends _ContentObject_js__WEBPACK_IMPORTED_MODULE_11__["ContentObject"]{constructor(t,e){super(),this.data=t,this.type=4,this.glTexture=null,this.powerOfTwoStretchInfo=null,this.loadingPromise=null,this.loadingController=null,this.events=new _core_Evented_js__WEBPACK_IMPORTED_MODULE_2__["default"],this.params=e||{},this.params.mipmap=!1!==this.params.mipmap,this.params.noUnpackFlip=this.params.noUnpackFlip||!1,this.params.preMultiplyAlpha=this.params.preMultiplyAlpha||!1,this.params.wrap=this.params.wrap||{s:10497,t:10497},this.params.powerOfTwoResizeMode=this.params.powerOfTwoResizeMode||1,this.estimatedTexMemRequired=S.estimateTexMemRequired(this.data,this.params),this.startPreload()}startPreload(){const t=this.data;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(t)||(t instanceof HTMLVideoElement?this.startPreloadVideoElement(t):t instanceof HTMLImageElement&&this.startPreloadImageElement(t))}startPreloadVideoElement(t){Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["isBlobProtocol"])(t.src)||"auto"===t.preload&&t.crossOrigin||(t.preload="auto",t.crossOrigin="anonymous",t.src=t.src)}startPreloadImageElement(t){Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["isDataProtocol"])(t.src)||Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["isBlobProtocol"])(t.src)||t.crossOrigin||(t.crossOrigin="anonymous",t.src=t.src)}static getDataDimensions(t){return t instanceof HTMLVideoElement?{width:t.videoWidth,height:t.videoHeight}:t}static estimateTexMemRequired(t,e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(t))return 0;if(Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isArrayBuffer"])(t)||Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isUint8Array"])(t))return e.encoding===S.KTX2_ENCODING?Object(_BasisUtil_js__WEBPACK_IMPORTED_MODULE_10__["estimateMemoryKTX2"])(t,e.mipmap):e.encoding===S.BASIS_ENCODING?Object(_BasisUtil_js__WEBPACK_IMPORTED_MODULE_10__["estimateMemoryBasis"])(t,e.mipmap):t.byteLength;const{width:r,height:i}=t instanceof Image||t instanceof ImageData||t instanceof HTMLCanvasElement||t instanceof HTMLVideoElement?S.getDataDimensions(t):e;return(e.mipmap?4/3:1)*r*i*(e.components||4)||0}dispose(){this.data=void 0}get width(){return this.params.width}get height(){return this.params.height}createDescriptor(t){var e;return{target:3553,pixelFormat:6408,dataType:5121,wrapMode:this.params.wrap,flipped:!this.params.noUnpackFlip,samplingMode:this.params.mipmap?9987:9729,hasMipmap:this.params.mipmap,preMultiplyAlpha:this.params.preMultiplyAlpha,maxAnisotropy:null!=(e=this.params.maxAnisotropy)?e:this.params.mipmap?t.parameters.maxMaxAnisotropy:1}}load(t,e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.glTexture))return this.glTexture;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.loadingPromise))return this.loadingPromise;const r=this.data;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(r)?(this.glTexture=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](t,this.createDescriptor(t),null),this.glTexture):"string"==typeof r?this.loadFromURL(t,e,r):r instanceof Image?this.loadFromImageElement(t,e,r):r instanceof HTMLVideoElement?this.loadFromVideoElement(t,e,r):r instanceof ImageData||r instanceof HTMLCanvasElement?this.loadFromImage(t,r,e):(Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isArrayBuffer"])(r)||Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isUint8Array"])(r))&&this.params.encoding===S.DDS_ENCODING?this.loadFromDDSData(t,r):(Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isArrayBuffer"])(r)||Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isUint8Array"])(r))&&this.params.encoding===S.KTX2_ENCODING?this.loadFromKTX2(t,r):(Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isArrayBuffer"])(r)||Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isUint8Array"])(r))&&this.params.encoding===S.BASIS_ENCODING?this.loadFromBasis(t,r):Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isUint8Array"])(r)?this.loadFromPixelData(t,r):Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_6__["isArrayBuffer"])(r)?this.loadFromPixelData(t,new Uint8Array(r)):null}get requiresFrameUpdates(){return this.data instanceof HTMLVideoElement}frameUpdate(t,e,r){if(!(this.data instanceof HTMLVideoElement)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(this.glTexture))return r;if(this.data.readyState<2||r===this.data.currentTime)return r;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.powerOfTwoStretchInfo)){const{framebuffer:r,vao:i,sourceTexture:s}=this.powerOfTwoStretchInfo;s.setData(this.data),this.drawStretchedTexture(t,e,r,i,s,this.glTexture)}else{const{width:t,height:e}=this.data,{width:r,height:i}=this.glTexture.descriptor;t!==r||e!==i?this.glTexture.updateData(0,0,0,Math.min(t,r),Math.min(e,i),this.data):this.glTexture.setData(this.data)}return this.glTexture.descriptor.hasMipmap&&this.glTexture.generateMipmap(),this.data.currentTime}loadFromDDSData(t,e){return this.glTexture=Object(_DDSUtil_js__WEBPACK_IMPORTED_MODULE_12__["createDDSTexture"])(t,this.createDescriptor(t),e),this.glTexture}loadFromKTX2(t,e){return this.loadAsync((()=>Object(_BasisUtil_js__WEBPACK_IMPORTED_MODULE_10__["createTextureKTX2"])(t,this.createDescriptor(t),e).then((t=>(this.glTexture=t,t)))))}loadFromBasis(t,e){return this.loadAsync((()=>Object(_BasisUtil_js__WEBPACK_IMPORTED_MODULE_10__["createTextureBasis"])(t,this.createDescriptor(t),e).then((t=>(this.glTexture=t,t)))))}loadFromPixelData(t,e){Object(_Util_js__WEBPACK_IMPORTED_MODULE_14__["assert"])(this.params.width>0&&this.params.height>0);const r=this.createDescriptor(t);return r.pixelFormat=1===this.params.components?6409:3===this.params.components?6407:6408,r.width=this.params.width,r.height=this.params.height,this.glTexture=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](t,r,e),this.glTexture}loadAsync(t){const e=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["createAbortController"])();this.loadingController=e;const r=t(e.signal);this.loadingPromise=r;const i=()=>{this.loadingController===e&&(this.loadingController=null),this.loadingPromise===r&&(this.loadingPromise=null)};return r.then(i,i),r}loadFromURL(t,e,r){return this.loadAsync((async i=>{const s=await Object(_support_requestImageUtils_js__WEBPACK_IMPORTED_MODULE_8__["requestImage"])(r,{signal:i});return this.loadFromImage(t,s,e)}))}loadFromImageElement(t,e,r){return r.complete?this.loadFromImage(t,r,e):this.loadAsync((async i=>{const s=await Object(_support_requestUtils_js__WEBPACK_IMPORTED_MODULE_9__["loadImageAsync"])(r,r.src,!1,i);return this.loadFromImage(t,s,e)}))}loadFromVideoElement(t,e,r){return r.readyState>=2?this.loadFromImage(t,r,e):this.loadFromVideoElementAsync(t,e,r)}loadFromVideoElementAsync(t,r,i){return this.loadAsync((s=>new Promise(((a,n)=>{const l=()=>{i.removeEventListener("loadeddata",p),i.removeEventListener("error",d),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(c)&&c.remove()},p=()=>{i.readyState>=2&&(l(),a(this.loadFromImage(t,i,r)))},d=t=>{l(),n(t||new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("Failed to load video"))};i.addEventListener("loadeddata",p),i.addEventListener("error",d);const c=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["onAbort"])(s,(()=>d(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["createAbortError"])())))}))))}loadFromImage(t,e,r){const s=S.getDataDimensions(e);this.params.width=s.width,this.params.height=s.height;const a=this.createDescriptor(t);return a.pixelFormat=3===this.params.components?6407:6408,!this.requiresPowerOfTwo(t,a)||Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_3__["isPowerOfTwo"])(s.width)&&Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_3__["isPowerOfTwo"])(s.height)?(a.width=s.width,a.height=s.height,this.glTexture=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](t,a,e),this.glTexture):(this.glTexture=this.makePowerOfTwoTexture(t,e,s,a,r),this.glTexture)}requiresPowerOfTwo(t,e){const r=33071,i="number"==typeof e.wrapMode?e.wrapMode===r:e.wrapMode.s===r&&e.wrapMode.t===r;return!Object(_webgl_capabilities_isWebGL2Context_js__WEBPACK_IMPORTED_MODULE_18__["default"])(t.gl)&&(e.hasMipmap||!i)}makePowerOfTwoTexture(e,r,i,a,o){const{width:n,height:m}=i,h=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_3__["nextHighestPowerOfTwo"])(n),l=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_3__["nextHighestPowerOfTwo"])(m);let p;switch(a.width=h,a.height=l,this.params.powerOfTwoResizeMode){case 2:a.textureCoordinateScaleFactor=[n/h,m/l],p=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](e,a),p.updateData(0,0,0,n,m,r);break;case 1:case null:case void 0:p=this.stretchToPowerOfTwo(e,r,a,o);break;default:Object(_core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__["neverReached"])(this.params.powerOfTwoResizeMode)}return a.hasMipmap&&p.generateMipmap(),p}stretchToPowerOfTwo(t,e,r,i){const s=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](t,r),a=new _webgl_FramebufferObject_js__WEBPACK_IMPORTED_MODULE_15__["default"](t,{colorTarget:0,depthStencilTarget:0},s),o=new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_16__["default"](t,{target:3553,pixelFormat:r.pixelFormat,dataType:5121,wrapMode:33071,samplingMode:9729,flipped:!!r.flipped,maxAnisotropy:8,preMultiplyAlpha:r.preMultiplyAlpha},e),n=Object(_glUtil3D_js__WEBPACK_IMPORTED_MODULE_13__["createQuadVAO"])(t);return this.drawStretchedTexture(t,i,a,n,o,s),this.requiresFrameUpdates?this.powerOfTwoStretchInfo={vao:n,sourceTexture:o,framebuffer:a}:(n.dispose(!0),o.dispose(),a.detachColorTexture(),t.bindFramebuffer(null),a.dispose()),s}drawStretchedTexture(t,e,r,i,s,a){t.bindFramebuffer(r);const o=t.getViewport();t.setViewport(0,0,a.descriptor.width,a.descriptor.height);const n=e.program;t.useProgram(n),n.setUniform4f("color",1,1,1,1),n.bindTexture(s,"tex"),t.bindVAO(i),t.setPipelineState(e.pipeline),t.drawArrays(5,0,Object(_webgl_Util_js__WEBPACK_IMPORTED_MODULE_17__["vertexCount"])(i,"geometry")),t.bindFramebuffer(null),t.setViewport(o.x,o.y,o.width,o.height)}unload(){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.powerOfTwoStretchInfo)){const{framebuffer:t,vao:e,sourceTexture:r}=this.powerOfTwoStretchInfo;e.dispose(!0),r.dispose(),t.dispose(),this.glTexture=null,this.powerOfTwoStretchInfo=null}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.glTexture)&&(this.glTexture.dispose(),this.glTexture=null),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(this.loadingController)){const t=this.loadingController;this.loadingController=null,this.loadingPromise=null,t.abort()}this.events.emit("unloaded")}}S.DDS_ENCODING="image/vnd-ms.dds",S.KTX2_ENCODING="image/ktx2",S.BASIS_ENCODING="image/x.basis";


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/WebGLDriverTest.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/WebGLDriverTest.js ***!
  \*********************************************************************************/
/*! exports provided: clearTestWebGLDriver, testWebGLDriver */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearTestWebGLDriver", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testWebGLDriver", function() { return h; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _webgl_BufferObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../webgl/BufferObject.js */ "../node_modules/@arcgis/core/views/webgl/BufferObject.js");
/* harmony import */ var _webgl_FramebufferObject_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../webgl/FramebufferObject.js */ "../node_modules/@arcgis/core/views/webgl/FramebufferObject.js");
/* harmony import */ var _webgl_Program_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../webgl/Program.js */ "../node_modules/@arcgis/core/views/webgl/Program.js");
/* harmony import */ var _webgl_enums_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../webgl/enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/* harmony import */ var _webgl_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../webgl/checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _webgl_renderState_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../webgl/renderState.js */ "../node_modules/@arcgis/core/views/webgl/renderState.js");
/* harmony import */ var _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../webgl/Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _webgl_VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../webgl/VertexArrayObject.js */ "../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js");
/* harmony import */ var _doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./doublePrecisionUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/doublePrecisionUtils.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/* harmony import */ var _webgl_testFloatBufferBlend_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../webgl/testFloatBufferBlend.js */ "../node_modules/@arcgis/core/views/webgl/testFloatBufferBlend.js");
/* harmony import */ var _webgl_testSVGPremultipliedAlpha_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../webgl/testSVGPremultipliedAlpha.js */ "../node_modules/@arcgis/core/views/webgl/testSVGPremultipliedAlpha.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class f{constructor(e){this.context=e,this.svgAlwaysPremultipliesAlpha=!1,this.floatBufferBlendWorking=!1,this._doublePrecisionRequiresObfuscation=null,this.floatBufferBlendWorking=Object(_webgl_testFloatBufferBlend_js__WEBPACK_IMPORTED_MODULE_12__["testFloatBufferBlend"])(e),Object(_webgl_testSVGPremultipliedAlpha_js__WEBPACK_IMPORTED_MODULE_13__["testSVGPremultipliedAlpha"])(e).then((e=>this.svgAlwaysPremultipliesAlpha=!e))}get doublePrecisionRequiresObfuscation(){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(this._doublePrecisionRequiresObfuscation)){const e=v(this.context,!1),n=v(this.context,!0);this._doublePrecisionRequiresObfuscation=0!==e&&(0===n||e/n>5)}return this._doublePrecisionRequiresObfuscation}}let p=null;function h(n){return(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(p)||p.context!==n)&&(p=new f(n)),p}function m(e){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(p)&&p.context===e&&(p=null)}function v(e,n){const l=new _webgl_FramebufferObject_js__WEBPACK_IMPORTED_MODULE_3__["default"](e,{colorTarget:0,depthStencilTarget:0},{target:3553,wrapMode:33071,pixelFormat:6408,dataType:5121,samplingMode:9728,width:1,height:1});function u(t,o){const i=new _webgl_Program_js__WEBPACK_IMPORTED_MODULE_4__["Program"](e,`\n\n  precision highp float;\n\n  attribute vec2 position;\n\n  uniform vec3 u_highA;\n  uniform vec3 u_lowA;\n  uniform vec3 u_highB;\n  uniform vec3 u_lowB;\n\n  varying vec4 v_color;\n\n  ${n?"#define DOUBLE_PRECISION_REQUIRES_OBFUSCATION":""}\n\n  #ifdef DOUBLE_PRECISION_REQUIRES_OBFUSCATION\n\n  vec3 dpPlusFrc(vec3 a, vec3 b) {\n    return mix(a, a + b, vec3(notEqual(b, vec3(0))));\n  }\n\n  vec3 dpMinusFrc(vec3 a, vec3 b) {\n    return mix(vec3(0), a - b, vec3(notEqual(a, b)));\n  }\n\n  vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {\n    vec3 t1 = dpPlusFrc(hiA, hiB);\n    vec3 e = dpMinusFrc(t1, hiA);\n    vec3 t2 = dpMinusFrc(hiB, e) + dpMinusFrc(hiA, dpMinusFrc(t1, e)) + loA + loB;\n    return t1 + t2;\n  }\n\n  #else\n\n  vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {\n    vec3 t1 = hiA + hiB;\n    vec3 e = t1 - hiA;\n    vec3 t2 = ((hiB - e) + (hiA - (t1 - e))) + loA + loB;\n    return t1 + t2;\n  }\n\n  #endif\n\n  const float MAX_RGBA_FLOAT =\n    255.0 / 256.0 +\n    255.0 / 256.0 / 256.0 +\n    255.0 / 256.0 / 256.0 / 256.0 +\n    255.0 / 256.0 / 256.0 / 256.0 / 256.0;\n\n  const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n\n  vec4 float2rgba(const float value) {\n    // Make sure value is in the domain we can represent\n    float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);\n\n    // Decompose value in 32bit fixed point parts represented as\n    // uint8 rgba components. Decomposition uses the fractional part after multiplying\n    // by a power of 256 (this removes the bits that are represented in the previous\n    // component) and then converts the fractional part to 8bits.\n    vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);\n\n    // Convert uint8 values (from 0 to 255) to floating point representation for\n    // the shader\n    const float toU8AsFloat = 1.0 / 255.0;\n\n    return fixedPointU8 * toU8AsFloat;\n  }\n\n  void main() {\n    vec3 val = dpAdd(u_highA, u_lowA, -u_highB, -u_lowB);\n\n    v_color = float2rgba(val.z / 25.0);\n\n    gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);\n  }\n  `,"\n  precision highp float;\n\n  varying vec4 v_color;\n\n  void main() {\n    gl_FragColor = v_color;\n  }\n  ",new Map([["position",0]])),s=new Float32Array(6);Object(_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_10__["encodeDoubleArray"])(t,s,3);const c=new Float32Array(6);return Object(_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_10__["encodeDoubleArray"])(o,c,3),e.useProgram(i),i.setUniform3f("u_highA",s[0],s[2],s[4]),i.setUniform3f("u_lowA",s[1],s[3],s[5]),i.setUniform3f("u_highB",c[0],c[2],c[4]),i.setUniform3f("u_lowB",c[1],c[3],c[5]),i}const f=_webgl_BufferObject_js__WEBPACK_IMPORTED_MODULE_2__["default"].createVertex(e,35044,new Uint16Array([0,0,1,0,0,1,1,1])),p=new _webgl_VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_9__["default"](e,new Map([["position",0]]),{geometry:[{name:"position",count:2,type:5123,offset:0,stride:4,normalized:!1}]},{geometry:f}),h=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["f"])(5633261.287538229,2626832.878767164,1434988.0495278358),m=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["f"])(5633271.46742708,2626873.6381334523,1434963.231608387),v=u(h,m),d=e.getBoundFramebufferObject(),{x:b,y:g,width:A,height:w}=e.getViewport();e.bindFramebuffer(l),e.setViewport(0,0,1,1),e.bindVAO(p),e.drawArrays(5,0,4);const _=new Uint8Array(4);l.readPixels(0,0,1,1,6408,5121,_),v.dispose(),p.dispose(!1),f.dispose(),l.dispose(),e.setViewport(b,g,A,w),e.bindFramebuffer(d);const B=(h[2]-m[2])/25,F=Object(_Util_js__WEBPACK_IMPORTED_MODULE_11__["unpackFloatRGBA"])(_);return Math.abs(B-F)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/doublePrecisionUtils.js":
/*!**************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/doublePrecisionUtils.js ***!
  \**************************************************************************************/
/*! exports provided: decodeDoubleArray, encodeDouble, encodeDoubleArray, encodeDoubleArraySplit */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeDoubleArray", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeDouble", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeDoubleArray", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeDoubleArraySplit", function() { return r; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,o){e[0]=n,e[1]=n-e[0],o[0]=e[0],o[1]=e[1]}function o(n,o,t){for(let r=0;r<t;++r)o[2*r]=n[r],o[2*r+1]=n[r]-o[2*r]}function t(n,o,t){for(let r=0;r<t;++r)o[r]=n[2*r]+n[2*r+1]}function r(n,t,r,c){for(let l=0;l<c;++l)f[0]=n[l],o(f,e,1),t[l]=e[0],r[l]=e[1]}const f=new Float64Array(1),e=new Float32Array(2);


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/glUtil3D.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/glUtil3D.js ***!
  \**************************************************************************/
/*! exports provided: createColorTexture, createEmptyDepthTexture, createEmptyTexture, createQuadVAO, createScreenSizeTriangleVAO */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createColorTexture", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEmptyDepthTexture", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEmptyTexture", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createQuadVAO", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createScreenSizeTriangleVAO", function() { return l; });
/* harmony import */ var _DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DefaultVertexAttributeLocations.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js");
/* harmony import */ var _DefaultVertexBufferLayouts_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DefaultVertexBufferLayouts.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexBufferLayouts.js");
/* harmony import */ var _webgl_BufferObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../webgl/BufferObject.js */ "../node_modules/@arcgis/core/views/webgl/BufferObject.js");
/* harmony import */ var _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../webgl/Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _webgl_VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../webgl/VertexArrayObject.js */ "../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(o,i=_DefaultVertexBufferLayouts_js__WEBPACK_IMPORTED_MODULE_1__["Pos2"],l=_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_0__["Default3D"],m=-1,f=1){let u=null;if(i===_DefaultVertexBufferLayouts_js__WEBPACK_IMPORTED_MODULE_1__["Pos2Tex"])u=new Float32Array([m,m,0,0,f,m,1,0,m,f,0,1,f,f,1,1]);else u=new Float32Array([m,m,f,m,m,f,f,f]);return new _webgl_VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_4__["default"](o,l,{geometry:i},{geometry:_webgl_BufferObject_js__WEBPACK_IMPORTED_MODULE_2__["default"].createVertex(o,35044,u)})}function l(r,o=_DefaultVertexBufferLayouts_js__WEBPACK_IMPORTED_MODULE_1__["Pos2"],i=_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_0__["Default3D"]){const l=new Float32Array([-1,-1,3,-1,-1,3]);return new _webgl_VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_4__["default"](r,i,{geometry:o},{geometry:_webgl_BufferObject_js__WEBPACK_IMPORTED_MODULE_2__["default"].createVertex(r,35044,l)})}const m=4;function f(e,t=m){return new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_3__["default"](e,{target:3553,pixelFormat:6408,dataType:5121,samplingMode:9728,width:t,height:t})}function u(e,t,r=m){const n=new Uint8Array(r*r*4);for(let o=0;o<n.length;o+=4)n[o+0]=255*t[0],n[o+1]=255*t[1],n[o+2]=255*t[2],n[o+3]=255*t[3];return new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_3__["default"](e,{target:3553,pixelFormat:6408,dataType:5121,samplingMode:9728,width:r,height:r},n)}function g(e){return new _webgl_Texture_js__WEBPACK_IMPORTED_MODULE_3__["default"](e,{target:3553,pixelFormat:6408,dataType:5121,samplingMode:9728,width:1,height:1},new Uint8Array([255,255,255,255]))}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/screenSizePerspectiveUtils.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/screenSizePerspectiveUtils.js ***!
  \********************************************************************************************/
/*! exports provided: applyPrecomputedScaleFactor, applyScaleFactor, applyScaleFactorVec2, getLabelSettings, getSettings, precomputeScaleFactor, scale */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyPrecomputedScaleFactor", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyScaleFactor", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyScaleFactorVec2", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLabelSettings", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSettings", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "precomputeScaleFactor", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return m; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(e,t){return new p(e,h,t)}function r(e,t){const{curvatureDependent:a,scaleStart:i,scaleFallOffRange:r}=h;return new p(e,{curvatureDependent:{min:{curvature:a.min.curvature,tiltAngle:a.min.tiltAngle,scaleFallOffFactor:v.curvatureDependent.min.scaleFallOffFactor},max:{curvature:a.max.curvature,tiltAngle:a.max.tiltAngle,scaleFallOffFactor:v.curvatureDependent.max.scaleFallOffFactor}},scaleStart:i,scaleFallOffRange:r,minPixelSize:v.minPixelSize},t)}function n(e){return Math.abs(e*e*e)}function l(e,t,a){const i=a.parameters,r=a.paddingPixelsOverride;return x.scale=Math.min(i.divisor/(t-i.offset),1),x.factor=n(e),x.minPixelSize=i.minPixelSize,x.paddingPixels=r,x}function s(e,t){return 0===e?t.minPixelSize:t.minPixelSize*(1+2*t.paddingPixels/e)}function c(t,a){return Math.max(Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["lerp"])(t*a.scale,t,a.factor),s(t,a))}function o(t,a,i=[0,0]){const r=Math.min(Math.max(a.scale,s(t[1],a)/t[1]),1);return i[0]=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["lerp"])(t[0]*r,t[0],a.factor),i[1]=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["lerp"])(t[1]*r,t[1],a.factor),i}function u(e,t,a){const i=l(e,t,a);return i.minPixelSize=0,i.paddingPixels=0,c(1,i)}function d(e,t,a,i){i.scale=u(e,t,a),i.factor=0,i.minPixelSize=a.parameters.minPixelSize,i.paddingPixels=a.paddingPixelsOverride}function f(e,t,a=[0,0]){const i=Math.min(Math.max(t.scale,s(e[1],t)/e[1]),1);return a[0]=e[0]*i,a[1]=e[1]*i,a}function m(e,t,a,i){return c(e,l(t,a,i))}class p{constructor(e,t,a,i=g(),r){this.viewingMode=e,this.description=t,this.ellipsoidRadius=a,this.parameters=i,this._paddingPixelsOverride=r,2===this.viewingMode?(this.coverageCompensation=this.surfaceCoverageCompensationLocal,this.calculateCurvatureDependentParameters=this.calculateCurvatureDependentParametersLocal):(this.coverageCompensation=this.surfaceCoverageCompensationGlobal,this.calculateCurvatureDependentParameters=this.calculateCurvatureDependentParametersGlobal)}get paddingPixelsOverride(){return this._paddingPixelsOverride||this.parameters.paddingPixels}update(e){return(!this.parameters||this.parameters.camera.fovY!==e.fovY||this.parameters.camera.distance!==e.distance)&&(this.calculateParameters(e,this.ellipsoidRadius,this.parameters),!0)}overridePadding(e){return e!==this.paddingPixelsOverride?new p(this.viewingMode,this.description,this.ellipsoidRadius,this.parameters,e):this}calculateParameters(e,t,a){const{scaleStart:i,scaleFallOffRange:r,minPixelSize:n}=this.description,{fovY:l,distance:s}=e,c=this.calculateCurvatureDependentParameters(e,t),o=this.coverageCompensation(e,t,c),{tiltAngle:u,scaleFallOffFactor:d}=c,f=Math.sin(u)*s,m=.5*Math.PI-u-l*(.5-i*o),p=f/Math.cos(m),h=m+l*r*o,v=(p-d*(f/Math.cos(h)))/(1-d);return a.camera.fovY=e.fovY,a.camera.distance=e.distance,a.offset=v,a.divisor=p-v,a.minPixelSize=n,a}calculateCurvatureDependentParametersLocal(e,t,a=P){return a.tiltAngle=this.description.curvatureDependent.min.tiltAngle,a.scaleFallOffFactor=this.description.curvatureDependent.min.scaleFallOffFactor,a}calculateCurvatureDependentParametersGlobal(t,i,r=P){const n=this.description.curvatureDependent,l=1+t.distance/i,s=Math.sqrt(l*l-1),[c,o]=[n.min.curvature,n.max.curvature],u=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])((s-c)/(o-c),0,1),[d,f]=[n.min,n.max];return r.tiltAngle=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["lerp"])(d.tiltAngle,f.tiltAngle,u),r.scaleFallOffFactor=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["lerp"])(d.scaleFallOffFactor,f.scaleFallOffFactor,u),r}surfaceCoverageCompensationLocal(e,t,a){return(e.fovY-a.tiltAngle)/e.fovY}surfaceCoverageCompensationGlobal(e,t,a){const i=t*t,r=a.tiltAngle+.5*Math.PI,{fovY:n,distance:l}=e,s=l*l+i-2*Math.cos(r)*l*t,c=Math.sqrt(s),o=Math.sqrt(s-i);return(Math.acos(o/c)-Math.asin(t/(c/Math.sin(r)))+.5*n)/n}}const h={curvatureDependent:{min:{curvature:Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["deg2rad"])(10),tiltAngle:Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["deg2rad"])(12),scaleFallOffFactor:.5},max:{curvature:Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["deg2rad"])(70),tiltAngle:Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["deg2rad"])(40),scaleFallOffFactor:.8}},scaleStart:.3,scaleFallOffRange:.65,minPixelSize:0},v={curvatureDependent:{min:{scaleFallOffFactor:.7},max:{scaleFallOffFactor:.95}},minPixelSize:14};function g(){return{camera:{distance:0,fovY:0},divisor:0,offset:0,minPixelSize:0,paddingPixels:0}}const x={scale:0,factor:0,minPixelSize:0,paddingPixels:0},P={tiltAngle:0,scaleFallOffFactor:0};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/verticalOffsetUtils.js":
/*!*************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/verticalOffsetUtils.js ***!
  \*************************************************************************************/
/*! exports provided: I3SVerticalOffsetGlobalViewingMode, IntersectorTransform, Object3DVerticalOffsetGlobalViewingMode, TERRAIN_ID, TerrainVerticalOffsetGlobalViewingMode, getVerticalOffsetI3S, getVerticalOffsetObject3D, getVerticalOffsetTerrain */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SVerticalOffsetGlobalViewingMode", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IntersectorTransform", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Object3DVerticalOffsetGlobalViewingMode", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TERRAIN_ID", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TerrainVerticalOffsetGlobalViewingMode", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getVerticalOffsetI3S", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getVerticalOffsetObject3D", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getVerticalOffsetTerrain", function() { return d; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_mat3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/mat3.js */ "../node_modules/@arcgis/core/chunks/mat3.js");
/* harmony import */ var _chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../chunks/mat3f64.js */ "../node_modules/@arcgis/core/chunks/mat3f64.js");
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _chunks_quat_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../chunks/quat.js */ "../node_modules/@arcgis/core/chunks/quat.js");
/* harmony import */ var _chunks_quatf64_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../chunks/quatf64.js */ "../node_modules/@arcgis/core/chunks/quatf64.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../chunks/vec3f32.js */ "../node_modules/@arcgis/core/chunks/vec3f32.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _chunks_vec4f64_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../chunks/vec4f64.js */ "../node_modules/@arcgis/core/chunks/vec4f64.js");
/* harmony import */ var _chunks_sphere_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../chunks/sphere.js */ "../node_modules/@arcgis/core/chunks/sphere.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class z{constructor(){this._transform=Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),this._transformInverse=new g({value:this._transform},_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["b"],_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_4__["c"]),this._transformInverseTranspose=new g(this._transformInverse,_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["a"],_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_4__["c"]),this._transformTranspose=new g({value:this._transform},_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["a"],_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_4__["c"]),this._transformInverseRotation=new g({value:this._transform},_chunks_mat3_js__WEBPACK_IMPORTED_MODULE_1__["n"],_chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])}invalidateLazyTransforms(){this._transformInverse.invalidate(),this._transformInverseTranspose.invalidate(),this._transformTranspose.invalidate(),this._transformInverseRotation.invalidate()}get transform(){return this._transform}get inverse(){return this._transformInverse.value}get inverseTranspose(){return this._transformInverseTranspose.value}get inverseRotation(){return this._transformInverseRotation.value}get transpose(){return this._transformTranspose.value}setTransformMatrix(t){Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["e"])(this._transform,t)}multiplyTransform(t){Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["m"])(this._transform,this._transform,t)}set(t){Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_3__["e"])(this._transform,t),this.invalidateLazyTransforms()}setAndInvalidateLazyTransforms(t,s){this.setTransformMatrix(t),this.multiplyTransform(s),this.invalidateLazyTransforms()}}class g{constructor(t,s,i){this.original=t,this.update=s,this.dirty=!0,this.transform=i()}invalidate(){this.dirty=!0}get value(){return this.dirty&&(this.update(this.transform,this.original.value),this.dirty=!1),this.transform}}class S{constructor(t=0){this.offset=t,this.tmpVertex=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_9__["c"])()}applyToVertex(t,s,i){const r=t+this.localOrigin[0],e=s+this.localOrigin[1],o=i+this.localOrigin[2],n=this.offset/Math.sqrt(r*r+e*e+o*o);return this.tmpVertex[0]=t+r*n,this.tmpVertex[1]=s+e*n,this.tmpVertex[2]=i+o*n,this.tmpVertex}applyToAabb(t){const s=t[0]+this.localOrigin[0],i=t[1]+this.localOrigin[1],r=t[2]+this.localOrigin[2],e=t[3]+this.localOrigin[0],o=t[4]+this.localOrigin[1],n=t[5]+this.localOrigin[2],h=this.offset/Math.sqrt(s*s+i*i+r*r);t[0]+=s*h,t[1]+=i*h,t[2]+=r*h;const a=this.offset/Math.sqrt(e*e+o*o+n*n);return t[3]+=e*a,t[4]+=o*a,t[5]+=n*a,t}}class T{constructor(t=0){this.offset=t,this.componentLocalOriginLength=0,this.tmpVertex=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_9__["c"])(),this.mbs=Object(_chunks_vec4f64_js__WEBPACK_IMPORTED_MODULE_10__["c"])(),this.obb={center:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_9__["c"])(),halfSize:Object(_chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_8__["c"])(),quaternion:null}}set localOrigin(t){this.componentLocalOriginLength=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2])}applyToVertex(t,s,i){const r=t,e=s,o=i+this.componentLocalOriginLength,n=this.offset/Math.sqrt(r*r+e*e+o*o);return this.tmpVertex[0]=t+r*n,this.tmpVertex[1]=s+e*n,this.tmpVertex[2]=i+o*n,this.tmpVertex}applyToAabb(t){const s=t[0],i=t[1],r=t[2]+this.componentLocalOriginLength,e=t[3],o=t[4],n=t[5]+this.componentLocalOriginLength,h=this.offset/Math.sqrt(s*s+i*i+r*r);t[0]+=s*h,t[1]+=i*h,t[2]+=r*h;const a=this.offset/Math.sqrt(e*e+o*o+n*n);return t[3]+=e*a,t[4]+=o*a,t[5]+=n*a,t}applyToMbs(t){const s=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]),i=this.offset/s;return this.mbs[0]=t[0]+t[0]*i,this.mbs[1]=t[1]+t[1]*i,this.mbs[2]=t[2]+t[2]*i,this.mbs[3]=t[3]+t[3]*this.offset/s,this.mbs}applyToObb(t){const s=t.center,i=this.offset/Math.sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2]);this.obb.center[0]=s[0]+s[0]*i,this.obb.center[1]=s[1]+s[1]*i,this.obb.center[2]=s[2]+s[2]*i,Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_7__["q"])(this.obb.halfSize,t.halfSize,t.quaternion),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_7__["b"])(this.obb.halfSize,this.obb.halfSize,t.center);const r=this.offset/Math.sqrt(this.obb.halfSize[0]*this.obb.halfSize[0]+this.obb.halfSize[1]*this.obb.halfSize[1]+this.obb.halfSize[2]*this.obb.halfSize[2]);return this.obb.halfSize[0]+=this.obb.halfSize[0]*r,this.obb.halfSize[1]+=this.obb.halfSize[1]*r,this.obb.halfSize[2]+=this.obb.halfSize[2]*r,Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_7__["f"])(this.obb.halfSize,this.obb.halfSize,t.center),Object(_chunks_quat_js__WEBPACK_IMPORTED_MODULE_5__["c"])(j,t.quaternion),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_7__["q"])(this.obb.halfSize,this.obb.halfSize,j),this.obb.halfSize[0]*=this.obb.halfSize[0]<0?-1:1,this.obb.halfSize[1]*=this.obb.halfSize[1]<0?-1:1,this.obb.halfSize[2]*=this.obb.halfSize[2]<0?-1:1,this.obb.quaternion=t.quaternion,this.obb}}class q{constructor(t=0){this.offset=t,this.sphere=Object(_chunks_sphere_js__WEBPACK_IMPORTED_MODULE_11__["c"])(),this.tmpVertex=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_9__["c"])()}applyToVertex(t,s,i){const r=this.objectTransform.transform;let e=r[0]*t+r[4]*s+r[8]*i+r[12],o=r[1]*t+r[5]*s+r[9]*i+r[13],n=r[2]*t+r[6]*s+r[10]*i+r[14];const h=this.offset/Math.sqrt(e*e+o*o+n*n);e+=e*h,o+=o*h,n+=n*h;const a=this.objectTransform.inverse;return this.tmpVertex[0]=a[0]*e+a[4]*o+a[8]*n+a[12],this.tmpVertex[1]=a[1]*e+a[5]*o+a[9]*n+a[13],this.tmpVertex[2]=a[2]*e+a[6]*o+a[10]*n+a[14],this.tmpVertex}applyToMinMax(t,s){const i=this.offset/Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]+=t[0]*i,t[1]+=t[1]*i,t[2]+=t[2]*i;const r=this.offset/Math.sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2]);s[0]+=s[0]*r,s[1]+=s[1]*r,s[2]+=s[2]*r}applyToAabb(t){const s=this.offset/Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]+=t[0]*s,t[1]+=t[1]*s,t[2]+=t[2]*s;const i=this.offset/Math.sqrt(t[3]*t[3]+t[4]*t[4]+t[5]*t[5]);return t[3]+=t[3]*i,t[4]+=t[4]*i,t[5]+=t[5]*i,t}applyToBoundingSphere(t){const s=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]),i=this.offset/s;return this.sphere[0]=t[0]+t[0]*i,this.sphere[1]=t[1]+t[1]*i,this.sphere[2]=t[2]+t[2]*i,this.sphere[3]=t[3]+t[3]*this.offset/s,this.sphere}}const x=new q;function _(s){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(s)?(x.offset=s,x):null}const y=new T;function M(s){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(s)?(y.offset=s,y):null}const V=new S;function d(s){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(s)?(V.offset=s,V):null}const O="terrain",j=Object(_chunks_quatf64_js__WEBPACK_IMPORTED_MODULE_6__["a"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial.js ***!
  \***************************************************************************************/
/*! exports provided: DefaultMaterial */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultMaterial", function() { return y; });
/* harmony import */ var _chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../chunks/mat3f64.js */ "../node_modules/@arcgis/core/chunks/mat3f64.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../support/buffer/InterleavedLayout.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/InterleavedLayout.js");
/* harmony import */ var _core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/shaderLibrary/util/AlphaDiscard.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/AlphaDiscard.glsl.js");
/* harmony import */ var _lib_GLMaterialTexture_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/GLMaterialTexture.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/GLMaterialTexture.js");
/* harmony import */ var _lib_Material_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/Material.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Material.js");
/* harmony import */ var _lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/OrderIndependentTransparency.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/OrderIndependentTransparency.js");
/* harmony import */ var _lib_verticalOffsetUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../lib/verticalOffsetUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/verticalOffsetUtils.js");
/* harmony import */ var _internal_bufferWriterUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./internal/bufferWriterUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/bufferWriterUtils.js");
/* harmony import */ var _internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./internal/MaterialUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js");
/* harmony import */ var _shaders_DefaultMaterialTechnique_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../shaders/DefaultMaterialTechnique.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/DefaultMaterialTechnique.js");
/* harmony import */ var _shaders_RealisticTreeTechnique_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../shaders/RealisticTreeTechnique.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/RealisticTreeTechnique.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class y extends _lib_Material_js__WEBPACK_IMPORTED_MODULE_6__["Material"]{constructor(e){super(e,O),this.supportsEdges=!0,this.techniqueConfig=new _shaders_DefaultMaterialTechnique_js__WEBPACK_IMPORTED_MODULE_11__["DefaultMaterialTechniqueConfiguration"],this.vertexBufferLayout=y.getVertexBufferLayout(this.params),this.instanceBufferLayout=e.instanced?y.getInstanceBufferLayout(this.params):null}isVisibleInPass(e){return 4!==e&&6!==e&&7!==e||this.params.castShadows}isVisible(){const e=this.params;if(!super.isVisible()||0===e.layerOpacity)return!1;const t=e.instanced,i=e.vertexColors,s=e.symbolColors,a=!!t&&t.indexOf("color")>-1,r=e.vvColorEnabled,n="replace"===e.colorMixMode,o=e.opacity>0,l=e.externalColor&&e.externalColor[3]>0;return i&&(a||r||s)?!!n||o:i?n?l:o:a||r||s?!!n||o:n?l:o}getTechniqueConfig(e,t){return this.techniqueConfig.output=e,this.techniqueConfig.hasNormalTexture=!!this.params.normalTextureId,this.techniqueConfig.hasColorTexture=!!this.params.textureId,this.techniqueConfig.vertexTangents=this.params.vertexTangents,this.techniqueConfig.instanced=!!this.params.instanced,this.techniqueConfig.instancedDoublePrecision=this.params.instancedDoublePrecision,this.techniqueConfig.vvSize=this.params.vvSizeEnabled,this.techniqueConfig.verticalOffset=null!==this.params.verticalOffset,this.techniqueConfig.screenSizePerspective=null!==this.params.screenSizePerspective,this.techniqueConfig.slicePlaneEnabled=this.params.slicePlaneEnabled,this.techniqueConfig.sliceHighlightDisabled=this.params.sliceHighlightDisabled,this.techniqueConfig.alphaDiscardMode=this.params.textureAlphaMode,this.techniqueConfig.normalsTypeDerivate="screenDerivative"===this.params.normals,this.techniqueConfig.transparent=this.params.transparent,this.techniqueConfig.writeDepth=this.params.writeDepth,this.techniqueConfig.sceneHasOcludees=this.params.sceneHasOcludees,this.techniqueConfig.cullFace=this.params.slicePlaneEnabled?0:this.params.cullFace,this.techniqueConfig.multipassTerrainEnabled=!!t&&t.multipassTerrainEnabled,this.techniqueConfig.cullAboveGround=!!t&&t.cullAboveGround,0!==e&&7!==e||(this.techniqueConfig.vertexColors=this.params.vertexColors,this.techniqueConfig.symbolColors=this.params.symbolColors,this.params.treeRendering?this.techniqueConfig.doubleSidedMode=2:this.techniqueConfig.doubleSidedMode=this.params.doubleSided&&"normal"===this.params.doubleSidedType?1:this.params.doubleSided&&"winding-order"===this.params.doubleSidedType?2:0,this.techniqueConfig.instancedColor=!!this.params.instanced&&this.params.instanced.indexOf("color")>-1,this.techniqueConfig.receiveShadows=this.params.receiveShadows&&this.params.shadowMappingEnabled,this.techniqueConfig.receiveAmbientOcclusion=!(!t||!t.ssaoEnabled)&&this.params.receiveSSAO,this.techniqueConfig.vvColor=this.params.vvColorEnabled,this.techniqueConfig.textureAlphaPremultiplied=!!this.params.textureAlphaPremultiplied,this.techniqueConfig.usePBR=this.params.usePBR,this.techniqueConfig.hasMetalnessAndRoughnessTexture=!!this.params.metallicRoughnessTextureId,this.techniqueConfig.hasEmissionTexture=!!this.params.emissiveTextureId,this.techniqueConfig.hasOcclusionTexture=!!this.params.occlusionTextureId,this.techniqueConfig.offsetBackfaces=!(!this.params.transparent||!this.params.offsetTransparentBackfaces),this.techniqueConfig.isSchematic=this.params.usePBR&&this.params.isSchematic,this.techniqueConfig.transparencyPassType=t?t.transparencyPassType:3,this.techniqueConfig.enableOffset=!t||t.camera.relativeElevation<_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_7__["OITPolygonOffsetLimit"]),this.techniqueConfig}intersect(e,u,c,h,d,p,m){if(null!==this.params.verticalOffset){const e=h.camera;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["s"])(A,c[12],c[13],c[14]);let u=null;switch(h.viewingMode){case 1:u=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["n"])(E,A);break;case 2:u=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["g"])(E,B)}let m=0;if(null!==this.params.verticalOffset){const t=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["f"])(L,A,e.eye),i=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["l"])(t),s=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["a"])(t,t,1/i);let l=null;this.params.screenSizePerspective&&(l=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["d"])(u,s)),m+=Object(_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_10__["verticalOffsetAtDistance"])(e,i,this.params.verticalOffset,l,this.params.screenSizePerspective)}Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["a"])(u,u,m),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["t"])(I,u,h.transform.inverseRotation),d=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["f"])(w,d,I),p=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["f"])(_,p,I)}Object(_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_10__["intersectTriangleGeometry"])(e,u,h,d,p,Object(_lib_verticalOffsetUtils_js__WEBPACK_IMPORTED_MODULE_8__["getVerticalOffsetObject3D"])(h.verticalOffset),m)}getGLMaterial(e){if(0===e.output||7===e.output||1===e.output||2===e.output||3===e.output||4===e.output)return new P(e)}createBufferWriter(){return new M(this.vertexBufferLayout,this.instanceBufferLayout)}static getVertexBufferLayout(e){const t=e.textureId||e.normalTextureId||e.metallicRoughnessTextureId||e.emissiveTextureId||e.occlusionTextureId,i=Object(_support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_3__["newLayout"])().vec3f("position").vec3f("normal");return e.vertexTangents&&i.vec4f("tangent"),t&&i.vec2f("uv0"),e.vertexColors&&i.vec4u8("color"),e.symbolColors&&i.vec4u8("symbolColor"),i}static getInstanceBufferLayout(e){let t=Object(_support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_3__["newLayout"])();return t=e.instancedDoublePrecision?t.vec3f("modelOriginHi").vec3f("modelOriginLo").mat3f("model").mat3f("modelNormal"):t.mat4f("model").mat4f("modelNormal"),e.instanced&&e.instanced.indexOf("color")>-1&&(t=t.vec4f("instanceColor")),e.instanced&&e.instanced.indexOf("featureAttribute")>-1&&(t=t.vec4f("instanceFeatureAttribute")),t}}class P extends _lib_GLMaterialTexture_js__WEBPACK_IMPORTED_MODULE_5__["default"]{constructor(e){const t=e.material;super({...e,...t.params}),this.updateParameters()}updateParameters(e){const t=this._material.params;this.updateTexture(t.textureId),this._technique=this._techniqueRep.releaseAndAcquire(t.treeRendering?_shaders_RealisticTreeTechnique_js__WEBPACK_IMPORTED_MODULE_12__["RealisticTreeTechnique"]:_shaders_DefaultMaterialTechnique_js__WEBPACK_IMPORTED_MODULE_11__["DefaultMaterialTechnique"],this._material.getTechniqueConfig(this._output,e),this._technique)}selectPipelines(){}_updateShadowState(e){e.shadowMappingEnabled!==this._material.params.shadowMappingEnabled&&this._material.setParameterValues({shadowMappingEnabled:e.shadowMappingEnabled})}_updateOccludeeState(e){e.hasOccludees!==this._material.params.sceneHasOcludees&&this._material.setParameterValues({sceneHasOcludees:e.hasOccludees})}ensureParameters(e){0!==this._output&&7!==this._output||(this._updateShadowState(e),this._updateOccludeeState(e)),this.updateParameters(e)}bind(e){this._technique.bindPass(this._material.params,e),this.bindTextures(this._technique.program)}beginSlot(e){return e===(this._material.params.transparent?this._material.params.writeDepth?5:8:3)||23===e}getPipelineState(e,t){return this._technique.getPipelineState(t)}}const O={textureId:void 0,initTextureTransparent:!1,isSchematic:!1,usePBR:!1,normalTextureId:void 0,vertexTangents:!1,occlusionTextureId:void 0,emissiveTextureId:void 0,metallicRoughnessTextureId:void 0,emissiveFactor:[0,0,0],mrrFactors:[0,1,.5],ambient:[.2,.2,.2],diffuse:[.8,.8,.8],externalColor:[1,1,1,1],colorMixMode:"multiply",opacity:1,layerOpacity:1,vertexColors:!1,symbolColors:!1,doubleSided:!1,doubleSidedType:"normal",cullFace:2,instanced:void 0,instancedDoublePrecision:!1,normals:"default",receiveSSAO:!0,receiveShadows:!0,castShadows:!0,shadowMappingEnabled:!1,verticalOffset:null,screenSizePerspective:null,slicePlaneEnabled:!1,sliceHighlightDisabled:!1,offsetTransparentBackfaces:!1,vvSizeEnabled:!1,vvSizeMinSize:[1,1,1],vvSizeMaxSize:[100,100,100],vvSizeOffset:[0,0,0],vvSizeFactor:[1,1,1],vvSizeValue:[1,1,1],vvColorEnabled:!1,vvColorValues:[0,0,0,0,0,0,0,0],vvColorColors:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],vvSymbolAnchor:[0,0,0],vvSymbolRotationMatrix:Object(_chunks_mat3f64_js__WEBPACK_IMPORTED_MODULE_0__["c"])(),transparent:!1,writeDepth:!0,textureAlphaMode:0,textureAlphaCutoff:_core_shaderLibrary_util_AlphaDiscard_glsl_js__WEBPACK_IMPORTED_MODULE_4__["defaultMaskAlphaCutoff"],textureAlphaPremultiplied:!1,sceneHasOcludees:!1,..._lib_Material_js__WEBPACK_IMPORTED_MODULE_6__["materialParametersDefaults"]};class M{constructor(e,t){this.vertexBufferLayout=e,this.instanceBufferLayout=t}allocate(e){return this.vertexBufferLayout.createBuffer(e)}elementCount(e){return e.indices.get("position").length}write(e,t,i,s){Object(_internal_bufferWriterUtils_js__WEBPACK_IMPORTED_MODULE_9__["writeDefaultAttributes"])(t,this.vertexBufferLayout,e.transformation,e.invTranspTransformation,i,s)}}const w=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),_=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),B=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["f"])(0,0,1),E=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),I=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),A=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),L=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js":
/*!*********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js ***!
  \*********************************************************************************************/
/*! exports provided: bindScreenSizePerspective, colorMixModes, computeInvDir, computeNormal, copyParameters, intersectAabbInvDir, intersectAabbInvDirBefore, intersectDrapedRenderLineGeometry, intersectTriangleGeometry, intersectTriangles, updateParameters, verticalOffsetAtDistance */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindScreenSizePerspective", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "colorMixModes", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeInvDir", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeNormal", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyParameters", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectAabbInvDir", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectAabbInvDirBefore", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectDrapedRenderLineGeometry", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectTriangleGeometry", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectTriangles", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateParameters", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verticalOffsetAtDistance", function() { return V; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../geometry/support/aaBoundingBox.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js");
/* harmony import */ var _lib_screenSizePerspectiveUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../lib/screenSizePerspectiveUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/screenSizePerspectiveUtils.js");
/* harmony import */ var _lib_Util_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../lib/Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/* harmony import */ var _renderers_utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../renderers/utils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/renderers/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__["create"])();function h(t,n,e,i,o,r,s){if(!Object(_renderers_utils_js__WEBPACK_IMPORTED_MODULE_7__["isInstanceHidden"])(n))if(t.boundingInfo){Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_6__["assert"])(0===t.primitiveType);const n=e.tolerance;g(t.boundingInfo,i,o,n,r,s)}else{const n=t.indices.get("position"),e=t.vertexAttributes.get("position");M(i,o,0,n.length/3,n,e,void 0,r,s)}}const d=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])();function g(t,i,o,r,s,c){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(t))return;const l=j(i,o,d);if(Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__["setMin"])(p,t.getBBMin()),Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__["setMax"])(p,t.getBBMax()),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(s)&&s.applyToAabb(p),A(p,i,l,r)){const{primitiveIndices:n,indices:e,position:f}=t,a=n?n.length:e.length/3;if(a>U){const n=t.getChildren();if(void 0!==n){for(let t=0;t<8;++t)void 0!==n[t]&&g(n[t],i,o,r,s,c);return}}M(i,o,0,a,e,f,n,s,c)}}const x=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])();function M(t,n,i,o,r,s,c,f,a){if(c)return b(t,n,i,o,r,s,c,f,a);const l=s.data,u=s.stride||s.size,m=t[0],p=t[1],h=t[2],d=n[0]-m,g=n[1]-p,M=n[2]-h;for(let b=i,v=3*i;b<o;++b){let t=u*r[v++],n=l[t++],i=l[t++],o=l[t];t=u*r[v++];let s=l[t++],c=l[t++],y=l[t];t=u*r[v++];let j=l[t++],A=l[t++],L=l[t];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(f)&&([n,i,o]=f.applyToVertex(n,i,o,b),[s,c,y]=f.applyToVertex(s,c,y,b),[j,A,L]=f.applyToVertex(j,A,L,b));const V=s-n,B=c-i,z=y-o,E=j-n,I=A-i,N=L-o,P=g*N-I*M,U=M*E-N*d,S=d*I-E*g,W=V*P+B*U+z*S;if(Math.abs(W)<=Number.EPSILON)continue;const O=m-n,k=p-i,R=h-o,C=O*P+k*U+R*S;if(W>0){if(C<0||C>W)continue}else if(C>0||C<W)continue;const H=k*z-B*R,X=R*V-z*O,Y=O*B-V*k,_=d*H+g*X+M*Y;if(W>0){if(_<0||C+_>W)continue}else if(_>0||C+_<W)continue;const q=(E*H+I*X+N*Y)/W;if(q>=0){a(q,T(V,B,z,E,I,N,x),b)}}}function b(t,n,i,o,r,s,c,f,a){const l=s.data,u=s.stride||s.size,m=t[0],p=t[1],h=t[2],d=n[0]-m,g=n[1]-p,M=n[2]-h;for(let b=i;b<o;++b){const t=c[b];let n=3*t,i=u*r[n++],o=l[i++],s=l[i++],v=l[i];i=u*r[n++];let y=l[i++],j=l[i++],A=l[i];i=u*r[n];let L=l[i++],V=l[i++],B=l[i];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(f)&&([o,s,v]=f.applyToVertex(o,s,v,b),[y,j,A]=f.applyToVertex(y,j,A,b),[L,V,B]=f.applyToVertex(L,V,B,b));const z=y-o,E=j-s,I=A-v,N=L-o,P=V-s,U=B-v,S=g*U-P*M,W=M*N-U*d,O=d*P-N*g,k=z*S+E*W+I*O;if(Math.abs(k)<=Number.EPSILON)continue;const R=m-o,C=p-s,H=h-v,X=R*S+C*W+H*O;if(k>0){if(X<0||X>k)continue}else if(X>0||X<k)continue;const Y=C*I-E*H,_=H*z-I*R,q=R*E-z*C,w=d*Y+g*_+M*q;if(k>0){if(w<0||X+w>k)continue}else if(w>0||X+w<k)continue;const D=(N*Y+P*_+U*q)/k;if(D>=0){a(D,T(z,E,I,N,P,U,x),t)}}}const v=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),y=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])();function T(t,n,e,s,c,f,a){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["s"])(v,t,n,e),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["s"])(y,s,c,f),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(a,v,y),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["n"])(a,a),a}function j(t,n,e){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["s"])(e,1/(n[0]-t[0]),1/(n[1]-t[1]),1/(n[2]-t[2]))}function A(t,n,e,i){return L(t,n,e,i,1/0)}function L(t,n,e,i,o){const r=(t[0]-i-n[0])*e[0],s=(t[3]+i-n[0])*e[0];let c=Math.min(r,s),f=Math.max(r,s);const a=(t[1]-i-n[1])*e[1],l=(t[4]+i-n[1])*e[1];if(f=Math.min(f,Math.max(a,l)),f<0)return!1;if(c=Math.max(c,Math.min(a,l)),c>f)return!1;const u=(t[2]-i-n[2])*e[2],m=(t[5]+i-n[2])*e[2];return f=Math.min(f,Math.max(u,m)),!(f<0)&&(c=Math.max(c,Math.min(u,m)),!(c>f)&&c<o)}function V(n,e,i,o,r){let s=(i.screenLength||0)*n.pixelRatio;r&&(s=Object(_lib_screenSizePerspectiveUtils_js__WEBPACK_IMPORTED_MODULE_5__["scale"])(s,o,e,r));const c=s*Math.tan(.5*n.fovY)/(.5*n.fullHeight);return Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])(c*e,i.minWorldLength||0,null!=i.maxWorldLength?i.maxWorldLength:1/0)}function B(t,n,e){if(!t)return;const i=t.parameters,o=t.paddingPixelsOverride;n.setUniform4f(e,i.divisor,i.offset,i.minPixelSize,o)}function z(t,n){const e=n?z(n):{};for(const i in t){let n=t[i];n&&n.forEach&&(n=N(n)),null==n&&i in e||(e[i]=n)}return e}function E(t,n){let e=!1;for(const i in n){const o=n[i];void 0!==o&&(e=!0,Array.isArray(o)?t[i]=o.slice():t[i]=o)}return e}function I(n,e,i,o,r){if(!e.options.selectionMode)return;const s=n.vertexAttributes.get("position").data,c=n.vertexAttributes.get("size"),f=c&&c.data[0],a=i[0],l=i[1],u=((f+o)/2+4)*n.screenToWorldRatio;let m=Number.MAX_VALUE;for(let p=0;p<s.length-5;p+=3){const n=s[p],e=s[p+1],i=a-n,o=l-e,r=s[p+3]-n,c=s[p+4]-e,f=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])((r*i+c*o)/(r*r+c*c),0,1),u=r*f-i,h=c*f-o,d=u*u+h*h;d<m&&(m=d)}m<u*u&&r()}function N(t){const n=[];return t.forEach((t=>n.push(t))),n}const P={multiply:1,ignore:2,replace:3,tint:4},U=1e3;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/bufferWriterUtils.js":
/*!**************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/bufferWriterUtils.js ***!
  \**************************************************************************************************/
/*! exports provided: writeBufferMat3f, writeBufferMat4f, writeBufferVec2, writeBufferVec3, writeBufferVec4, writeColor, writeDefaultAttributes, writeNormal, writePosition, writeTangent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeBufferMat3f", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeBufferMat4f", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeBufferVec2", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeBufferVec3", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeBufferVec4", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeColor", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeDefaultAttributes", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeNormal", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writePosition", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeTangent", function() { return p; });
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../geometry/support/buffer/BufferView.js */ "../node_modules/@arcgis/core/geometry/support/buffer/BufferView.js");
/* harmony import */ var _lib_Util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lib/Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(t,e,f,o){const r=f.typedBuffer,s=f.typedBufferStride,n=t.length;o*=s;for(let i=0;i<n;++i){const f=2*t[i];r[o]=e[f],r[o+1]=e[f+1],o+=s}}function i(t,e,f,o,r){const s=f.typedBuffer,n=f.typedBufferStride,i=t.length;if(o*=n,null==r||1===r)for(let c=0;c<i;++c){const f=3*t[c];s[o]=e[f],s[o+1]=e[f+1],s[o+2]=e[f+2],o+=n}else for(let c=0;c<i;++c){const f=3*t[c];for(let t=0;t<r;++t)s[o]=e[f],s[o+1]=e[f+1],s[o+2]=e[f+2],o+=n}}function c(t,e,f,o,r=1){const s=f.typedBuffer,n=f.typedBufferStride,i=t.length;if(o*=n,1===r)for(let c=0;c<i;++c){const f=4*t[c];s[o]=e[f],s[o+1]=e[f+1],s[o+2]=e[f+2],s[o+3]=e[f+3],o+=n}else for(let c=0;c<i;++c){const f=4*t[c];for(let t=0;t<r;++t)s[o]=e[f],s[o+1]=e[f+1],s[o+2]=e[f+2],s[o+3]=e[f+3],o+=n}}function l(t,e,f,o){const r=f.typedBuffer,s=f.typedBufferStride,n=t.length;o*=s;for(let i=0;i<n;++i){const f=9*t[i];for(let t=0;t<9;++t)r[o+t]=e[f+t];o+=s}}function d(t,e,f,o){const r=f.typedBuffer,s=f.typedBufferStride,n=t.length;o*=s;for(let i=0;i<n;++i){const f=16*t[i];for(let t=0;t<16;++t)r[o+t]=e[f+t];o+=s}}function u(t,e,f,o,r,s=1){if(!f)return void i(t,e,o,r,s);const n=o.typedBuffer,c=o.typedBufferStride,l=t.length,d=f[0],u=f[1],a=f[2],p=f[4],y=f[5],g=f[6],B=f[8],h=f[9],m=f[10],b=f[12],z=f[13],S=f[14];if(r*=c,1===s)for(let i=0;i<l;++i){const f=3*t[i],o=e[f],s=e[f+1],l=e[f+2];n[r]=d*o+p*s+B*l+b,n[r+1]=u*o+y*s+h*l+z,n[r+2]=a*o+g*s+m*l+S,r+=c}else for(let i=0;i<l;++i){const f=3*t[i],o=e[f],l=e[f+1],k=e[f+2],F=d*o+p*l+B*k+b,q=u*o+y*l+h*k+z,v=a*o+g*l+m*k+S;for(let t=0;t<s;++t)n[r]=F,n[r+1]=q,n[r+2]=v,r+=c}}function a(e,f,o,r,s,n=1){if(!o)return void i(e,f,r,s,n);const c=o,l=r.typedBuffer,d=r.typedBufferStride,u=e.length,a=c[0],p=c[1],y=c[2],g=c[4],B=c[5],h=c[6],m=c[8],b=c[9],z=c[10],S=!Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_0__["q"])(c),k=1e-6,F=1-k;if(s*=d,1===n)for(let t=0;t<u;++t){const o=3*e[t],r=f[o],n=f[o+1],i=f[o+2];let c=a*r+g*n+m*i,u=p*r+B*n+b*i,q=y*r+h*n+z*i;if(S){const t=c*c+u*u+q*q;if(t<F&&t>k){const e=1/Math.sqrt(t);c*=e,u*=e,q*=e}}l[s+0]=c,l[s+1]=u,l[s+2]=q,s+=d}else for(let t=0;t<u;++t){const o=3*e[t],r=f[o],i=f[o+1],c=f[o+2];let u=a*r+g*i+m*c,q=p*r+B*i+b*c,v=y*r+h*i+z*c;if(S){const t=u*u+q*q+v*v;if(t<F&&t>k){const e=1/Math.sqrt(t);u*=e,q*=e,v*=e}}for(let t=0;t<n;++t)l[s+0]=u,l[s+1]=q,l[s+2]=v,s+=d}}function p(e,f,o,r,s,n=1){if(!o)return void c(e,f,r,s,n);const i=o,l=r.typedBuffer,d=r.typedBufferStride,u=e.length,a=i[0],p=i[1],y=i[2],g=i[4],B=i[5],h=i[6],m=i[8],b=i[9],z=i[10],S=!Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_0__["q"])(i),k=1e-6,F=1-k;if(s*=d,1===n)for(let t=0;t<u;++t){const o=4*e[t],r=f[o],n=f[o+1],i=f[o+2],c=f[o+3];let u=a*r+g*n+m*i,q=p*r+B*n+b*i,v=y*r+h*n+z*i;if(S){const t=u*u+q*q+v*v;if(t<F&&t>k){const e=1/Math.sqrt(t);u*=e,q*=e,v*=e}}l[s+0]=u,l[s+1]=q,l[s+2]=v,l[s+3]=c,s+=d}else for(let t=0;t<u;++t){const o=4*e[t],r=f[o],i=f[o+1],c=f[o+2],u=f[o+3];let q=a*r+g*i+m*c,v=p*r+B*i+b*c,M=y*r+h*i+z*c;if(S){const t=q*q+v*v+M*M;if(t<F&&t>k){const e=1/Math.sqrt(t);q*=e,v*=e,M*=e}}for(let t=0;t<n;++t)l[s+0]=q,l[s+1]=v,l[s+2]=M,l[s+3]=u,s+=d}}function y(t,e,f,o,r,s=1){const n=o.typedBuffer,i=o.typedBufferStride,c=t.length;if(r*=i,1===s){if(4===f)for(let l=0;l<c;++l){const f=4*t[l];n[r]=e[f],n[r+1]=e[f+1],n[r+2]=e[f+2],n[r+3]=e[f+3],r+=i}else if(3===f)for(let l=0;l<c;++l){const f=3*t[l];n[r]=e[f],n[r+1]=e[f+1],n[r+2]=e[f+2],n[r+3]=255,r+=i}}else if(4===f)for(let l=0;l<c;++l){const f=4*t[l];for(let t=0;t<s;++t)n[r]=e[f],n[r+1]=e[f+1],n[r+2]=e[f+2],n[r+3]=e[f+3],r+=i}else if(3===f)for(let l=0;l<c;++l){const f=3*t[l];for(let t=0;t<s;++t)n[r]=e[f],n[r+1]=e[f+1],n[r+2]=e[f+2],n[r+3]=255,r+=i}}function g(t,i,c,l,d,g){for(const B of i.fieldNames){const i=t.vertexAttributes.get(B),h=t.indices.get(B);if(i&&h)switch(B){case"position":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(3===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec3f"]);t&&u(h,i.data,c,t,g);break}case"normal":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(3===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec3f"]);t&&a(h,i.data,l,t,g);break}case"uv0":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(2===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec2f"]);t&&n(h,i.data,t,g);break}case"color":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(3===i.size||4===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec4u8"]);t&&y(h,i.data,i.size,t,g);break}case"symbolColor":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(3===i.size||4===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec4u8"]);t&&y(h,i.data,i.size,t,g);break}case"tangent":{Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_2__["assert"])(4===i.size);const t=d.getField(B,_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_1__["BufferViewVec4f"]);t&&p(h,i.data,l,t,g);break}}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/renderers/utils.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/materials/renderers/utils.js ***!
  \***************************************************************************************/
/*! exports provided: acquireMaterials, addObject3DStateID, calculateTransformRelativeToOrigin, encodeDoubleVec3, isInstanceHidden, releaseMaterials, removeObject3DStateID */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "acquireMaterials", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addObject3DStateID", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateTransformRelativeToOrigin", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeDoubleVec3", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInstanceHidden", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "releaseMaterials", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeObject3DStateID", function() { return l; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _lib_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/doublePrecisionUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/doublePrecisionUtils.js");
/* harmony import */ var _lib_Util_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/Util.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(t,r){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t)&&(t=[]),t.push(r),t}function l(t,r){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t))return t;const s=t.filter((e=>e!==r));return 0===s.length?null:s}function f(e){return!!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e)&&!e.visible}function m(e,t){const r=new Map;return r.set(0,t.acquire(e,0)),r.set(1,t.acquire(e,7)),r.set(4,t.acquire(e,3)),r.set(3,t.acquire(e,2)),r.set(2,t.acquire(e,1)),r.set(5,t.acquire(e,4)),r.set(7,t.acquire(e,3)),r.set(6,t.acquire(e,3)),r}function p(e,t){t.release(e,0),t.release(e,7),t.release(e,3),t.release(e,2),t.release(e,1),t.release(e,4)}function q(e,a,o){const u=e.origin.vec3;Object(_lib_Util_js__WEBPACK_IMPORTED_MODULE_4__["setMatrixTranslation3"])(h,-u[0],-u[1],-u[2]),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e.transformation)?Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_1__["m"])(a,h,e.transformation):Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_1__["e"])(a,h),o&&(Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_1__["b"])(o,a),Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_1__["a"])(o,o))}function b(e,t,r,s,n){g[0]=e.get(t,0),g[1]=e.get(t,1),g[2]=e.get(t,2),Object(_lib_doublePrecisionUtils_js__WEBPACK_IMPORTED_MODULE_3__["encodeDoubleArray"])(g,j,3),r.set(n,0,j[0]),s.set(n,0,j[1]),r.set(n,1,j[2]),s.set(n,1,j[3]),r.set(n,2,j[4]),s.set(n,2,j[5])}const g=new Float64Array(3),j=new Float32Array(6),h=Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/DefaultMaterialTechnique.js":
/*!**********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/DefaultMaterialTechnique.js ***!
  \**********************************************************************************************/
/*! exports provided: DefaultMaterialTechnique, DefaultMaterialTechniqueConfiguration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultMaterialTechnique", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultMaterialTechniqueConfiguration", function() { return H; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/shaderLibrary/Slice.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/Slice.glsl.js");
/* harmony import */ var _core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/InstancedDoublePrecision.glsl.js");
/* harmony import */ var _core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/shaderLibrary/attributes/VerticalOffset.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/attributes/VerticalOffset.glsl.js");
/* harmony import */ var _core_shaderLibrary_output_OutputHighlight_glsl_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/shaderLibrary/output/OutputHighlight.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/output/OutputHighlight.glsl.js");
/* harmony import */ var _core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/shaderLibrary/shading/MultipassTerrainTest.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/MultipassTerrainTest.glsl.js");
/* harmony import */ var _core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/PhysicallyBasedRenderingParameters.glsl.js");
/* harmony import */ var _core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/shaderLibrary/shading/ReadShadowMap.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/ReadShadowMap.glsl.js");
/* harmony import */ var _core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/shaderLibrary/shading/VisualVariables.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/shading/VisualVariables.glsl.js");
/* harmony import */ var _core_shaderLibrary_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/shaderLibrary/util/DoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js");
/* harmony import */ var _core_shaderLibrary_util_View_glsl_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/shaderLibrary/util/View.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/View.glsl.js");
/* harmony import */ var _core_shaderTechnique_ReloadableShaderModule_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/shaderTechnique/ReloadableShaderModule.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ReloadableShaderModule.js");
/* harmony import */ var _core_shaderTechnique_ShaderTechnique_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/shaderTechnique/ShaderTechnique.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechnique.js");
/* harmony import */ var _core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/shaderTechnique/ShaderTechniqueConfiguration.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ShaderTechniqueConfiguration.js");
/* harmony import */ var _lib_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../lib/DefaultVertexAttributeLocations.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js");
/* harmony import */ var _lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../lib/OrderIndependentTransparency.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/OrderIndependentTransparency.js");
/* harmony import */ var _lib_Program_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../lib/Program.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Program.js");
/* harmony import */ var _lib_StencilUtils_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../lib/StencilUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/StencilUtils.js");
/* harmony import */ var _materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../materials/internal/MaterialUtil.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/internal/MaterialUtil.js");
/* harmony import */ var _chunks_DefaultMaterial_glsl_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../../chunks/DefaultMaterial.glsl.js */ "../node_modules/@arcgis/core/chunks/DefaultMaterial.glsl.js");
/* harmony import */ var _webgl_renderState_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../webgl/renderState.js */ "../node_modules/@arcgis/core/views/webgl/renderState.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class R extends _core_shaderTechnique_ShaderTechnique_js__WEBPACK_IMPORTED_MODULE_13__["ShaderTechnique"]{initializeProgram(e){const t=R.shader.get(),i=this.configuration,r=t.build({OITEnabled:0===i.transparencyPassType,output:i.output,viewingMode:e.viewingMode,receiveShadows:i.receiveShadows,slicePlaneEnabled:i.slicePlaneEnabled,sliceHighlightDisabled:i.sliceHighlightDisabled,sliceEnabledForVertexPrograms:!1,symbolColor:i.symbolColors,vvSize:i.vvSize,vvColor:i.vvColor,vvInstancingEnabled:!0,instanced:i.instanced,instancedColor:i.instancedColor,instancedDoublePrecision:i.instancedDoublePrecision,pbrMode:i.usePBR?i.isSchematic?2:1:0,hasMetalnessAndRoughnessTexture:i.hasMetalnessAndRoughnessTexture,hasEmissionTexture:i.hasEmissionTexture,hasOcclusionTexture:i.hasOcclusionTexture,hasNormalTexture:i.hasNormalTexture,hasColorTexture:i.hasColorTexture,receiveAmbientOcclusion:i.receiveAmbientOcclusion,useCustomDTRExponentForWater:!1,normalType:i.normalsTypeDerivate?3:0,doubleSidedMode:i.doubleSidedMode,vertexTangents:i.vertexTangents,attributeTextureCoordinates:i.hasMetalnessAndRoughnessTexture||i.hasEmissionTexture||i.hasOcclusionTexture||i.hasNormalTexture||i.hasColorTexture?1:0,textureAlphaPremultiplied:i.textureAlphaPremultiplied,attributeColor:i.vertexColors,screenSizePerspectiveEnabled:i.screenSizePerspective,verticalOffsetEnabled:i.verticalOffset,offsetBackfaces:i.offsetBackfaces,doublePrecisionRequiresObfuscation:Object(_core_shaderLibrary_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_10__["doublePrecisionRequiresObfuscation"])(e.rctx),alphaDiscardMode:i.alphaDiscardMode,supportsTextureAtlas:!1,multipassTerrainEnabled:i.multipassTerrainEnabled,cullAboveGround:i.cullAboveGround});return new _lib_Program_js__WEBPACK_IMPORTED_MODULE_17__["Program"](e.rctx,r,_lib_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_15__["Default3D"])}bindPass(e,t){var i,r;Object(_core_shaderLibrary_util_View_glsl_js__WEBPACK_IMPORTED_MODULE_11__["bindProjectionMatrix"])(this.program,t.camera.projectionMatrix);const l=this.configuration.output;(1===this.configuration.output||t.multipassTerrainEnabled||3===l)&&this.program.setUniform2fv("cameraNearFar",t.camera.nearFar),t.multipassTerrainEnabled&&(this.program.setUniform2fv("inverseViewport",t.inverseViewport),Object(_core_shaderLibrary_shading_MultipassTerrainTest_glsl_js__WEBPACK_IMPORTED_MODULE_6__["bindMultipassTerrainTexture"])(this.program,t)),7===l&&(this.program.setUniform1f("opacity",e.opacity),this.program.setUniform1f("layerOpacity",e.layerOpacity),this.program.setUniform4fv("externalColor",e.externalColor),this.program.setUniform1i("colorMixMode",_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_19__["colorMixModes"][e.colorMixMode])),0===l?(t.lighting.setUniforms(this.program,!1),this.program.setUniform3fv("ambient",e.ambient),this.program.setUniform3fv("diffuse",e.diffuse),this.program.setUniform4fv("externalColor",e.externalColor),this.program.setUniform1i("colorMixMode",_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_19__["colorMixModes"][e.colorMixMode]),this.program.setUniform1f("opacity",e.opacity),this.program.setUniform1f("layerOpacity",e.layerOpacity),this.configuration.usePBR&&Object(_core_shaderLibrary_shading_PhysicallyBasedRenderingParameters_glsl_js__WEBPACK_IMPORTED_MODULE_7__["bindPBRUniforms"])(this.program,e,this.configuration.isSchematic)):4===l&&Object(_core_shaderLibrary_output_OutputHighlight_glsl_js__WEBPACK_IMPORTED_MODULE_5__["bindOutputHighlight"])(this.program,t),Object(_core_shaderLibrary_shading_VisualVariables_glsl_js__WEBPACK_IMPORTED_MODULE_9__["bindVisualVariablesUniformsForSymbols"])(this.program,e),Object(_core_shaderLibrary_attributes_VerticalOffset_glsl_js__WEBPACK_IMPORTED_MODULE_4__["bindVerticalOffsetUniforms"])(this.program,e,t),Object(_materials_internal_MaterialUtil_js__WEBPACK_IMPORTED_MODULE_19__["bindScreenSizePerspective"])(e.screenSizePerspective,this.program,"screenSizePerspectiveAlignment"),2!==e.textureAlphaMode&&3!==e.textureAlphaMode||this.program.setUniform1f("textureAlphaCutoff",e.textureAlphaCutoff),null==(i=t.shadowMap)||i.bind(this.program),null==(r=t.ssaoHelper)||r.bind(this.program,t.camera)}bindDraw(e){const o=this.configuration.instancedDoublePrecision?Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["f"])(e.camera.viewInverseTransposeMatrix[3],e.camera.viewInverseTransposeMatrix[7],e.camera.viewInverseTransposeMatrix[11]):e.origin;Object(_core_shaderLibrary_util_View_glsl_js__WEBPACK_IMPORTED_MODULE_11__["bindViewCustomOrigin"])(this.program,o,e.camera.viewMatrix),this.program.rebindTextures(),(0===this.configuration.output||7===this.configuration.output||1===this.configuration.output&&this.configuration.screenSizePerspective||2===this.configuration.output&&this.configuration.screenSizePerspective||4===this.configuration.output&&this.configuration.screenSizePerspective)&&Object(_core_shaderLibrary_util_View_glsl_js__WEBPACK_IMPORTED_MODULE_11__["bindCameraPosition"])(this.program,o,e.camera.viewInverseTransposeMatrix),2===this.configuration.output&&this.program.setUniformMatrix4fv("viewNormal",e.camera.viewInverseTransposeMatrix),this.configuration.instancedDoublePrecision&&_core_shaderLibrary_attributes_InstancedDoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_3__["InstancedDoublePrecision"].bindCustomOrigin(this.program,o),Object(_core_shaderLibrary_Slice_glsl_js__WEBPACK_IMPORTED_MODULE_2__["bindSliceUniforms"])(this.program,this.configuration,e.slicePlane,o),0===this.configuration.output&&Object(_core_shaderLibrary_shading_ReadShadowMap_glsl_js__WEBPACK_IMPORTED_MODULE_8__["bindReadShadowMapViewCustomOrigin"])(this.program,e,o)}setPipeline(e,t){const i=this.configuration,r=3===e,o=2===e;return Object(_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_21__["makePipelineState"])({blending:0!==i.output&&7!==i.output||!i.transparent?null:r?_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_16__["blendingDefault"]:Object(_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_16__["OITBlending"])(e),culling:L(i)&&Object(_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_21__["cullingParams"])(i.cullFace),depthTest:{func:Object(_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_16__["OITDepthTest"])(e)},depthWrite:r||o?i.writeDepth&&_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_21__["defaultDepthWriteParams"]:null,colorWrite:_webgl_renderState_js__WEBPACK_IMPORTED_MODULE_21__["defaultColorWriteParams"],stencilWrite:i.sceneHasOcludees?_lib_StencilUtils_js__WEBPACK_IMPORTED_MODULE_18__["stencilWriteMaskOn"]:null,stencilTest:i.sceneHasOcludees?t?_lib_StencilUtils_js__WEBPACK_IMPORTED_MODULE_18__["stencilToolMaskBaseParams"]:_lib_StencilUtils_js__WEBPACK_IMPORTED_MODULE_18__["stencilBaseAllZerosParams"]:null,polygonOffset:r||o?null:Object(_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_16__["getOITPolygonOffset"])(i.enableOffset)})}initializePipeline(){return this._occludeePipelineState=this.setPipeline(this.configuration.transparencyPassType,!0),this.setPipeline(this.configuration.transparencyPassType,!1)}getPipelineState(e){return e?this._occludeePipelineState:this.pipeline}}function L(e){return e.cullFace?0!==e.cullFace:!e.slicePlaneEnabled&&(!e.transparent&&!e.doubleSidedMode)}R.shader=new _core_shaderTechnique_ReloadableShaderModule_js__WEBPACK_IMPORTED_MODULE_12__["ReloadableShaderModule"](_chunks_DefaultMaterial_glsl_js__WEBPACK_IMPORTED_MODULE_20__["D"],(()=>__webpack_require__.e(/*! import() */ 141).then(__webpack_require__.bind(null, /*! ./DefaultMaterial.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/DefaultMaterial.glsl.js"))));class H extends _core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["ShaderTechniqueConfiguration"]{constructor(){super(...arguments),this.output=0,this.alphaDiscardMode=1,this.doubleSidedMode=0,this.isSchematic=!1,this.vertexColors=!1,this.offsetBackfaces=!1,this.symbolColors=!1,this.vvSize=!1,this.vvColor=!1,this.verticalOffset=!1,this.receiveShadows=!1,this.slicePlaneEnabled=!1,this.sliceHighlightDisabled=!1,this.receiveAmbientOcclusion=!1,this.screenSizePerspective=!1,this.textureAlphaPremultiplied=!1,this.hasColorTexture=!1,this.usePBR=!1,this.hasMetalnessAndRoughnessTexture=!1,this.hasEmissionTexture=!1,this.hasOcclusionTexture=!1,this.hasNormalTexture=!1,this.instanced=!1,this.instancedColor=!1,this.instancedDoublePrecision=!1,this.vertexTangents=!1,this.normalsTypeDerivate=!1,this.writeDepth=!0,this.sceneHasOcludees=!1,this.transparent=!1,this.enableOffset=!0,this.cullFace=0,this.transparencyPassType=3,this.multipassTerrainEnabled=!1,this.cullAboveGround=!1}}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])({count:8})],H.prototype,"output",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])({count:4})],H.prototype,"alphaDiscardMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])({count:3})],H.prototype,"doubleSidedMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"isSchematic",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"vertexColors",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"offsetBackfaces",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"symbolColors",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"vvSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"vvColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"verticalOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"receiveShadows",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"slicePlaneEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"sliceHighlightDisabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"receiveAmbientOcclusion",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"screenSizePerspective",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"textureAlphaPremultiplied",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"hasColorTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"usePBR",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"hasMetalnessAndRoughnessTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"hasEmissionTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"hasOcclusionTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"hasNormalTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"instanced",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"instancedColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"instancedDoublePrecision",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"vertexTangents",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"normalsTypeDerivate",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"writeDepth",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"sceneHasOcludees",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"transparent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"enableOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])({count:3})],H.prototype,"cullFace",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])({count:4})],H.prototype,"transparencyPassType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"multipassTerrainEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_shaderTechnique_ShaderTechniqueConfiguration_js__WEBPACK_IMPORTED_MODULE_14__["parameter"])()],H.prototype,"cullAboveGround",void 0);


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/RealisticTreeTechnique.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/RealisticTreeTechnique.js ***!
  \********************************************************************************************/
/*! exports provided: RealisticTreeTechnique */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RealisticTreeTechnique", function() { return a; });
/* harmony import */ var _chunks_RealisticTree_glsl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../chunks/RealisticTree.glsl.js */ "../node_modules/@arcgis/core/chunks/RealisticTree.glsl.js");
/* harmony import */ var _core_shaderLibrary_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/shaderLibrary/util/DoublePrecision.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/util/DoublePrecision.glsl.js");
/* harmony import */ var _core_shaderTechnique_ReloadableShaderModule_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/shaderTechnique/ReloadableShaderModule.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderTechnique/ReloadableShaderModule.js");
/* harmony import */ var _lib_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/DefaultVertexAttributeLocations.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/DefaultVertexAttributeLocations.js");
/* harmony import */ var _lib_Program_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/Program.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/Program.js");
/* harmony import */ var _DefaultMaterialTechnique_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./DefaultMaterialTechnique.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/shaders/DefaultMaterialTechnique.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class a extends _DefaultMaterialTechnique_js__WEBPACK_IMPORTED_MODULE_5__["DefaultMaterialTechnique"]{initializeProgram(e){const s=a.shader.get(),t=this.configuration,l=s.build({OITEnabled:0===t.transparencyPassType,output:t.output,viewingMode:e.viewingMode,receiveShadows:t.receiveShadows,slicePlaneEnabled:t.slicePlaneEnabled,sliceHighlightDisabled:t.sliceHighlightDisabled,sliceEnabledForVertexPrograms:!1,symbolColor:t.symbolColors,vvSize:t.vvSize,vvColor:t.vvColor,vvInstancingEnabled:!0,instanced:t.instanced,instancedColor:t.instancedColor,instancedDoublePrecision:t.instancedDoublePrecision,pbrMode:t.usePBR?1:0,hasMetalnessAndRoughnessTexture:!1,hasEmissionTexture:!1,hasOcclusionTexture:!1,hasNormalTexture:!1,hasColorTexture:t.hasColorTexture,receiveAmbientOcclusion:t.receiveAmbientOcclusion,useCustomDTRExponentForWater:!1,normalType:0,doubleSidedMode:2,vertexTangents:!1,attributeTextureCoordinates:t.hasColorTexture?1:0,textureAlphaPremultiplied:t.textureAlphaPremultiplied,attributeColor:t.vertexColors,screenSizePerspectiveEnabled:t.screenSizePerspective,verticalOffsetEnabled:t.verticalOffset,offsetBackfaces:t.offsetBackfaces,doublePrecisionRequiresObfuscation:Object(_core_shaderLibrary_util_DoublePrecision_glsl_js__WEBPACK_IMPORTED_MODULE_1__["doublePrecisionRequiresObfuscation"])(e.rctx),alphaDiscardMode:t.alphaDiscardMode,supportsTextureAtlas:!1,multipassTerrainEnabled:t.multipassTerrainEnabled,cullAboveGround:t.cullAboveGround});return new _lib_Program_js__WEBPACK_IMPORTED_MODULE_4__["Program"](e.rctx,l,_lib_DefaultVertexAttributeLocations_js__WEBPACK_IMPORTED_MODULE_3__["Default3D"])}}a.shader=new _core_shaderTechnique_ReloadableShaderModule_js__WEBPACK_IMPORTED_MODULE_2__["ReloadableShaderModule"](_chunks_RealisticTree_glsl_js__WEBPACK_IMPORTED_MODULE_0__["R"],(()=>__webpack_require__.e(/*! import() */ 140).then(__webpack_require__.bind(null, /*! ../core/shaderLibrary/default/RealisticTree.glsl.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/core/shaderLibrary/default/RealisticTree.glsl.js"))));


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/BufferObject.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/BufferObject.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.webgl.BufferObject");class h{constructor(e,t,i,n,h){this._context=e,this.bufferType=t,this.usage=i,this._glName=null,this._size=-1,this._indexType=void 0,e.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Buffer,this),this._glName=this._context.gl.createBuffer(),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(this._context.gl),n&&this.setData(n,h)}static createIndex(e,t,i,s){return new h(e,34963,t,i,s)}static createVertex(e,t,i){return new h(e,34962,t,i)}get glName(){return this._glName}get size(){return this._size}get indexType(){return this._indexType}get byteSize(){return 34962===this.bufferType?this._size:5125===this._indexType?4*this._size:2*this._size}dispose(){var e;if(null!=(e=this._context)&&e.gl){if(this._glName){this._context.gl.deleteBuffer(this._glName),this._glName=null}this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Buffer,this),this._context=null}else this._glName&&n.warn("Leaked WebGL buffer object")}setData(e,r){if(!e)return;if("number"==typeof e){if(e<0&&n.error("Buffer size cannot be negative!"),34963===this.bufferType&&r)switch(this._indexType=r,this._size=e,r){case 5123:e*=2;break;case 5125:e*=4}}else{let s=e.byteLength;Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["isUint16Array"])(e)&&(s/=2,this._indexType=5123),Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["isUint32Array"])(e)&&(s/=4,this._indexType=5125),this._size=s}const h=this._context.getBoundVAO();this._context.bindVAO(null),this._context.bindBuffer(this);const o=this._context.gl;o.bufferData(this.bufferType,e,this.usage),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(o),this._context.bindVAO(h)}setSubData(e,r=0,h=0,o=e.byteLength){if(!e)return;(r<0||r>=this._size)&&n.error("offset is out of range!");let f=r,u=h,c=o,a=e.byteLength;Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["isUint16Array"])(e)&&(a/=2,f*=2,u*=2,c*=2),Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["isUint32Array"])(e)&&(a/=4,f*=4,u*=4,c*=4),void 0===o&&(o=a-1),h>=o&&n.error("end must be bigger than start!"),r+h-o>this._size&&n.error("An attempt to write beyond the end of the buffer!");const _=this._context.getBoundVAO();this._context.bindVAO(null),this._context.bindBuffer(this);const g=this._context.gl,l=ArrayBuffer.isView(e)?e.buffer:e,b=0===u&&c===e.byteLength?l:l.slice(u,c);g.bufferSubData(this.bufferType,f,b),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(g),this._context.bindVAO(_)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/FramebufferObject.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/FramebufferObject.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _checkWebGLError_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/* harmony import */ var _Renderbuffer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Renderbuffer.js */ "../node_modules/@arcgis/core/views/webgl/Renderbuffer.js");
/* harmony import */ var _Texture_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/webgl/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.webgl.FrameBufferObject");class c{constructor(t,e,r,n){if(this._context=t,this._glName=null,this._depthAttachment=null,this._stencilAttachment=null,this._colorAttachments=new Map,this._initialized=!1,this._desc={...e},t.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_2__["ResourceType"].Framebuffer,this),r){Array.isArray(r)||(r=[r]);for(let e=0;e<r.length;++e){var o,c;const i=r[e];let s;a(i)?(s=i.descriptor,this._colorAttachments.set(36064+e,i)):(s=i,this._colorAttachments.set(36064+e,new _Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"](t,i))),0!==(null==(o=this._desc)?void 0:o.colorTarget)&&2!==(null==(c=this._desc)?void 0:c.colorTarget)&&console.error("Framebuffer is initialized with a texture however the descriptor indicates using a renderbuffer color attachment!"),this._validateColorAttachmentPoint(36064+e),this._validateTextureDimensions(s,this._desc)}}if(n instanceof _Renderbuffer_js__WEBPACK_IMPORTED_MODULE_3__["default"]){var l;const t=null!=(l=this._desc.depthStencilTarget)?l:3;2===t?this._stencilAttachment=n:1===t||3===t?this._depthAttachment=n:console.error('If a Renderbuffer is provided, "depthStencilTarget" must be one of STENCIL_RENDER_BUFFER, DEPTH_RENDER_BUFFER or DEPTH_STENCIL_RENDER_BUFFER'),d(n.descriptor,this._desc)}else if(n){let t;this._context.capabilities.depthTexture||console.error("Extension WEBGL_depth_texture isn't supported therefore it is no possible to set the depth/stencil texture as an attachment!"),a(n)?(this._depthStencilTexture=n,t=n.descriptor):this._depthStencilTexture=new _Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"](this._context,n),this._validateTextureDimensions(t,this._desc)}}dispose(){if(!this._desc)return;const t=this._context.getBoundFramebufferObject();if(this._disposeColorAttachments(),this._disposeDepthStencilAttachments(),this._glName){this._context.gl.deleteFramebuffer(this._glName),this._glName=null}this._context.bindFramebuffer(t),this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_2__["ResourceType"].Framebuffer,this),this._desc=null}get glName(){return this._glName}get descriptor(){return this._desc}get colorTexture(){const t=this._colorAttachments.get(36064);return t&&a(t)?t:null}get colorAttachment(){return this._colorAttachments.get(36064)}get depthStencilAttachment(){return this._depthStencilTexture||this._depthAttachment||this._stencilAttachment}get depthStencilTexture(){return this._depthStencilTexture}get width(){return this._desc.width}get height(){return this._desc.height}get gpuMemoryUsage(){return Object(_Util_js__WEBPACK_IMPORTED_MODULE_5__["getGpuMemoryUsage"])(this.colorAttachment)+Object(_Util_js__WEBPACK_IMPORTED_MODULE_5__["getGpuMemoryUsage"])(this.depthStencilAttachment)}getColorTexture(t){const e=this._colorAttachments.get(t);return e&&a(e)?e:null}framebufferTexture2D(t,e,i=36064,r=3553,s=0){e.framebufferTexture2D(e.FRAMEBUFFER,i,r,t,s)}attachColorTexture(t,e=36064){if(!t)return;this._validateColorAttachmentPoint(e);const i=t.descriptor;this._validateTextureDimensions(i,this._desc),this._disposeColorAttachments(),this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(t.glName,this._context.gl,e)),this._colorAttachments.set(e,t)}detachColorTexture(t=36064){const e=this._colorAttachments.get(t);if(a(e)){const i=e;return this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(null,this._context.gl,t)),this._colorAttachments.delete(t),i}}attachDepthStencilTexture(t){if(!t)return;const e=t.descriptor;34041!==e.pixelFormat&&console.error("Depth/Stencil texture must have a pixel type of DEPTH_STENCIL!"),34042!==e.dataType&&console.error("Depth/Stencil texture must have data type of UNSIGNED_INT_24_8!"),this._context.capabilities.depthTexture||console.error("Extension WEBGL_depth_texture isn't supported therefore it is no possible to set the depth/stencil texture!"),this._validateTextureDimensions(e,this._desc),this._desc.depthStencilTarget&&4!==this._desc.depthStencilTarget&&(this._desc.depthStencilTarget=4),this._disposeDepthStencilAttachments(),this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(t.glName,this._context.gl,_enums_js__WEBPACK_IMPORTED_MODULE_2__["DepthStencilAttachment"])),this._depthStencilTexture=t}detachDepthStencilTexture(){const t=this._depthStencilTexture;return t&&this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(null,this._context.gl,_enums_js__WEBPACK_IMPORTED_MODULE_2__["DepthStencilAttachment"])),this._depthStencilTexture=null,t}attachDepthStencilBuffer(t){if(!t)return;const e=t.descriptor;if(34041!==e.internalFormat&&33189!==e.internalFormat&&console.error("Depth/Stencil buffer must have correct internalFormat"),d(e,this._desc),this._disposeDepthStencilAttachments(),this._desc.depthStencilTarget=34041===e.internalFormat?3:1,this._initialized){this._context.bindFramebuffer(this);const e=this._context.gl,i=1===this._desc.depthStencilTarget?e.DEPTH_ATTACHMENT:e.DEPTH_STENCIL_ATTACHMENT;e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,t.glName)}this._depthAttachment=t}detachDepthStencilBuffer(){const t=this._context.gl,e=this._depthAttachment;if(e&&this._initialized){this._context.bindFramebuffer(this);const e=1===this._desc.depthStencilTarget?t.DEPTH_ATTACHMENT:t.DEPTH_STENCIL_ATTACHMENT;t.framebufferRenderbuffer(t.FRAMEBUFFER,e,t.RENDERBUFFER,null)}return this._depthAttachment=null,e}detachAll(){this.detachColorTexture(),this.detachDepthStencilBuffer(),this.detachDepthStencilTexture()}copyToTexture(t,e,i,r,s,n,o){(t<0||e<0||s<0||n<0)&&console.error("Offsets cannot be negative!"),(i<=0||r<=0)&&console.error("Copy width and height must be greater than zero!");const c=this._desc,a=o.descriptor;3553!==o.descriptor.target&&console.error("Texture target must be TEXTURE_2D!"),(t+i>c.width||e+r>c.height||s+i>a.width||n+r>a.height)&&console.error("Bad dimensions, the current input values will attempt to read or copy out of bounds!");const l=this._context,d=l.bindTexture(o,_Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"].TEXTURE_UNIT_FOR_UPDATES);l.bindFramebuffer(this),l.gl.copyTexSubImage2D(3553,0,s,n,t,e,i,r),l.bindTexture(d,_Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"].TEXTURE_UNIT_FOR_UPDATES)}readPixels(t,e,i,r,s,h,n){(i<=0||r<=0)&&console.error("Copy width and height must be greater than zero!"),n||console.error("Target memory is not initialized!"),this._context.bindFramebuffer(this);this._context.gl.readPixels(t,e,i,r,s,h,n)}resize(t,e){const i=this._desc;if(i.width!==t||i.height!==e){if(!this._initialized)return i.width=t,i.height=e,this._colorAttachments.forEach((i=>{i&&i.resize(t,e)})),void(this._depthStencilTexture&&this._depthStencilTexture.resize(t,e));i.width=t,i.height=e,this._colorAttachments.forEach((i=>{i&&i.resize(t,e)})),null!=this._depthStencilTexture?this._depthStencilTexture.resize(t,e):(this._depthAttachment||this._stencilAttachment)&&(this._depthAttachment&&this._depthAttachment.resize(t,e),this._stencilAttachment&&this._stencilAttachment.resize(t,e)),this._context.getBoundFramebufferObject()===this&&this._context.bindFramebuffer(null),this._initialized=!1}}initializeAndBind(t=3553){var i,r,n,o;const c=this._context.gl;if(this._initialized)return void c.bindFramebuffer(c.FRAMEBUFFER,this.glName);this._glName&&c.deleteFramebuffer(this._glName);const d=this._context,_=c.createFramebuffer(),u=this._desc,f=null!=(i=u.colorTarget)?i:1,m=null!=(r=u.width)?r:1,T=null!=(n=u.height)?n:1;if(c.bindFramebuffer(c.FRAMEBUFFER,_),0===this._colorAttachments.size)if(0===f)this._colorAttachments.set(36064,l(d,u,2===this.descriptor.colorTarget?34067:3553));else{const t=new _Renderbuffer_js__WEBPACK_IMPORTED_MODULE_3__["default"](d,{internalFormat:32854,width:m,height:T});this._colorAttachments.set(36064,t)}this._colorAttachments.forEach(((e,i)=>{e&&(a(e)?this.framebufferTexture2D(e.glName,c,i,t):c.framebufferRenderbuffer(c.FRAMEBUFFER,c.COLOR_ATTACHMENT0,c.RENDERBUFFER,e.glName))}));const p=null!=(o=u.depthStencilTarget)?o:0;switch(p){case 1:case 3:{this._depthAttachment||(this._depthAttachment=new _Renderbuffer_js__WEBPACK_IMPORTED_MODULE_3__["default"](d,{internalFormat:1===u.depthStencilTarget?33189:34041,width:m,height:T}));const t=1===p?c.DEPTH_ATTACHMENT:c.DEPTH_STENCIL_ATTACHMENT;c.framebufferRenderbuffer(c.FRAMEBUFFER,t,c.RENDERBUFFER,this._depthAttachment.glName);break}case 2:this._stencilAttachment||(this._stencilAttachment=new _Renderbuffer_js__WEBPACK_IMPORTED_MODULE_3__["default"](d,{internalFormat:36168,width:m,height:T})),c.framebufferRenderbuffer(c.FRAMEBUFFER,c.STENCIL_ATTACHMENT,c.RENDERBUFFER,this._stencilAttachment.glName);break;case 4:if(!this._depthStencilTexture){d.capabilities.depthTexture||console.error("Extension WEBGL_depth_texture isn't supported therefore it is no possible to set the depth/stencil texture as an attachment!");const t={target:3553,pixelFormat:34041,dataType:34042,samplingMode:9728,wrapMode:33071,width:m,height:T};this._depthStencilTexture=new _Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"](d,t)}this.framebufferTexture2D(this._depthStencilTexture.glName,c,c.DEPTH_STENCIL_ATTACHMENT,t)}if(Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_1__["webglValidateShadersEnabled"])()){c.checkFramebufferStatus(c.FRAMEBUFFER)!==c.FRAMEBUFFER_COMPLETE&&console.error("Framebuffer is incomplete!")}this._glName=_,this._initialized=!0}_disposeColorAttachments(){this._colorAttachments.forEach(((t,e)=>{if(a(t))this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(null,this._context.gl,e)),t.dispose();else if(t instanceof WebGLRenderbuffer){const i=this._context.gl;this._initialized&&(this._context.bindFramebuffer(this),i.framebufferRenderbuffer(i.FRAMEBUFFER,e,i.RENDERBUFFER,null)),this._context.gl.deleteRenderbuffer(t)}})),this._colorAttachments.clear()}_disposeDepthStencilAttachments(){const t=this._context.gl;if(this._depthAttachment){if(this._initialized){this._context.bindFramebuffer(this);const e=1===this._desc.depthStencilTarget?t.DEPTH_ATTACHMENT:t.DEPTH_STENCIL_ATTACHMENT;t.framebufferRenderbuffer(t.FRAMEBUFFER,e,t.RENDERBUFFER,null)}this._depthAttachment.dispose(),this._depthAttachment=null}this._stencilAttachment&&(this._initialized&&(this._context.bindFramebuffer(this),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.STENCIL_ATTACHMENT,t.RENDERBUFFER,null)),this._stencilAttachment.dispose(),this._stencilAttachment=null),this._depthStencilTexture&&(this._initialized&&(this._context.bindFramebuffer(this),this.framebufferTexture2D(null,t,t.DEPTH_STENCIL_ATTACHMENT)),this._depthStencilTexture.dispose(),this._depthStencilTexture=null)}_validateTextureDimensions(t,e){3553!==t.target&&34067!==t.target&&console.error("Texture type must be TEXTURE_2D or TEXTURE_CUBE_MAP!"),void 0!==e.width&&e.width>=0&&void 0!==e.height&&e.height>=0?e.width===t.width&&e.height===t.height||console.error("Color attachment texture must match the framebuffer's!"):(e.width=t.width,e.height=t.height)}_validateColorAttachmentPoint(t){if(-1===c._MAX_COLOR_ATTACHMENTS){const t=this._context.capabilities.drawBuffers;if(t){const e=this._context.gl;c._MAX_COLOR_ATTACHMENTS=e.getParameter(t.MAX_COLOR_ATTACHMENTS)}else c._MAX_COLOR_ATTACHMENTS=1}const e=t-36064;e+1>c._MAX_COLOR_ATTACHMENTS&&o.error("esri.FrameBufferObject",`illegal attachment point for color attachment: ${e+1}. Implementation supports up to ${c._MAX_COLOR_ATTACHMENTS} color attachments`)}}function a(t){return"type"in t&&"texture"===t.type}function l(t,e,i){return new _Texture_js__WEBPACK_IMPORTED_MODULE_4__["default"](t,{target:i,pixelFormat:6408,dataType:5121,samplingMode:9728,wrapMode:33071,width:e.width,height:e.height})}function d(t,e){void 0!==e.width&&e.width>=0&&void 0!==e.height&&e.height>=0?e.width===t.width&&e.height===t.height||console.error("Renderbuffer dimensions must match the framebuffer's!"):(e.width=t.width,e.height=t.height)}c._MAX_COLOR_ATTACHMENTS=-1;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/Program.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/Program.js ***!
  \***********************************************************/
/*! exports provided: Program */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Program", function() { return n; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/* harmony import */ var _ShaderTranspiler_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ShaderTranspiler.js */ "../node_modules/@arcgis/core/views/webgl/ShaderTranspiler.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class n{constructor(t,r,n,e){this._context=t,this._locations=e,this._vShader=null,this._fShader=null,this._nameToUniformLocation={},this._nameToUniform1={},this._nameToUniform1v={},this._nameToUniform2={},this._nameToUniform3={},this._nameToUniform4={},this._nameToUniformMatrix3={},this._nameToUniformMatrix4={},t||console.error("RenderingContext isn't initialized!"),0===r.length&&console.error("Shaders source should not be empty!"),this._vShader=s(this._context,35633,r),this._fShader=s(this._context,35632,n),this._vShader&&this._fShader||console.error("Error loading shaders!");const m=this._context.gl,a=m.createProgram();m.attachShader(a,this._vShader),m.attachShader(a,this._fShader),e.forEach(((t,o)=>m.bindAttribLocation(a,t,o))),m.linkProgram(a),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["webglValidateShadersEnabled"])()&&!m.getProgramParameter(a,m.LINK_STATUS)&&console.error("Could not initialize shader\nVALIDATE_STATUS: "+m.getProgramParameter(a,m.VALIDATE_STATUS)+", gl error ["+m.getError()+"]infoLog: "+m.getProgramInfoLog(a)),this._glName=a,this._context.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Program,this)}get glName(){return this._glName}dispose(){const t=this._context.gl;if(this._vShader){const o=this._vShader;t.deleteShader(o),this._vShader=null}if(this._fShader){const o=this._fShader;t.deleteShader(o),this._fShader=null}this._glName&&(t.deleteProgram(this._glName),this._glName=null,this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Program,this))}_getUniformLocation(t){return void 0===this._nameToUniformLocation[t]&&(this._nameToUniformLocation[t]=this._context.gl.getUniformLocation(this._glName,t)),this._nameToUniformLocation[t]}hasUniform(t){return null!==this._getUniformLocation(t)}setUniform1i(t,o){const i=this._nameToUniform1[t];if(void 0===i||o!==i){this._context.useProgram(this);this._context.gl.uniform1i(this._getUniformLocation(t),o),this._nameToUniform1[t]=o}}setUniform1iv(t,o){const i=this._nameToUniform1v[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform1iv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform1v[t]=Array.from(o):h(o,i)}}setUniform2iv(t,o){const i=this._nameToUniform2[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform2iv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform2[t]=Array.from(o):h(o,i)}}setUniform3iv(t,o){const i=this._nameToUniform3[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform3iv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform3[t]=Array.from(o):h(o,i)}}setUniform4iv(t,o){const i=this._nameToUniform4[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform4iv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform4[t]=Array.from(o):h(o,i)}}setUniform1f(t,o){const i=this._nameToUniform1[t];if(void 0===i||o!==i){this._context.useProgram(this);this._context.gl.uniform1f(this._getUniformLocation(t),o),this._nameToUniform1[t]=o}}setUniform1fv(t,o){const i=this._nameToUniform1v[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform1fv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform1v[t]=Array.from(o):h(o,i)}}setUniform2f(t,o,i){const r=this._nameToUniform2[t];if(void 0===r||o!==r[0]||i!==r[1]){this._context.useProgram(this);this._context.gl.uniform2f(this._getUniformLocation(t),o,i),void 0===r?this._nameToUniform2[t]=[o,i]:(r[0]=o,r[1]=i)}}setUniform2fv(t,o){const i=this._nameToUniform2[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform2fv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform2[t]=Array.from(o):h(o,i)}}setUniform3f(t,o,i,r){const n=this._nameToUniform3[t];if(void 0===n||o!==n[0]||i!==n[1]||r!==n[2]){this._context.useProgram(this);this._context.gl.uniform3f(this._getUniformLocation(t),o,i,r),void 0===n?this._nameToUniform3[t]=[o,i,r]:(n[0]=o,n[1]=i,n[2]=r)}}setUniform3fv(t,o){const i=this._nameToUniform3[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform3fv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform3[t]=Array.from(o):h(o,i)}}setUniform4f(t,o,i,r,n){const e=this._nameToUniform4[t];if(void 0===e||o!==e[0]||i!==e[1]||r!==e[2]||n!==e[3]){this._context.useProgram(this);this._context.gl.uniform4f(this._getUniformLocation(t),o,i,r,n),void 0===e?this._nameToUniform4[t]=[o,i,r,n]:(e[0]=o,e[1]=i,e[2]=r,e[3]=n)}}setUniform4fv(t,o){const i=this._nameToUniform4[t];if(e(i,o)){this._context.useProgram(this);this._context.gl.uniform4fv(this._getUniformLocation(t),o),void 0===i?this._nameToUniform4[t]=Array.from(o):h(o,i)}}setUniformMatrix3fv(t,o,i=!1,r=!1){const n=this._nameToUniformMatrix3[t];if(r?n!==o:f(n,o)){this._context.useProgram(this);this._context.gl.uniformMatrix3fv(this._getUniformLocation(t),i,o),void 0===n?this._nameToUniformMatrix3[t]=Array.from(o):h(o,n)}}setUniformMatrix4fv(t,o,i=!1){const r=this._nameToUniformMatrix4[t];if(c(r,o)){this._context.useProgram(this);this._context.gl.uniformMatrix4fv(this._getUniformLocation(t),i,o),void 0===r?this._nameToUniformMatrix4[t]=Array.from(o):h(o,r)}}assertCompatibleVertexAttributeLocations(t){t.locations!==this._locations&&console.error("VertexAttributeLocations are incompatible")}stop(){}}function e(o,i){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(o)||o.length!==i.length)return!0;for(let t=0;t<o.length;++t)if(o[t]!==i[t])return!0;return!1}function s(t,i,n){const e="webgl2"===t.webglVersion?Object(_ShaderTranspiler_js__WEBPACK_IMPORTED_MODULE_4__["transpileShader"])(n,i):n,s=t.gl,a=s.createShader(i);return s.shaderSource(a,e),s.compileShader(a),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["webglValidateShadersEnabled"])()&&!s.getShaderParameter(a,s.COMPILE_STATUS)&&(console.error("Compile error in ".concat(35633===i?"vertex":"fragment"," shader")),console.error(s.getShaderInfoLog(a)),console.error(m(e)),"webgl2"===t.webglVersion&&(console.log("Shader source before transpilation:"),console.log(n))),a}function m(t){let o=2;return t.replace(/\n/g,(()=>"\n"+a(o++)+":"))}function a(t){return t>=1e3?t.toString():("  "+t).slice(-3)}function h(t,o){for(let i=0;i<t.length;++i)o[i]=t[i]}function f(o,i){return!!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(o)||(9!==o.length?e(o,i):9!==o.length||o[0]!==i[0]||o[1]!==i[1]||o[2]!==i[2]||o[3]!==i[3]||o[4]!==i[4]||o[5]!==i[5]||o[6]!==i[6]||o[7]!==i[7]||o[8]!==i[8])}function c(o,i){return!!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(o)||(16!==o.length?e(o,i):16!==o.length||o[0]!==i[0]||o[1]!==i[1]||o[2]!==i[2]||o[3]!==i[3]||o[4]!==i[4]||o[5]!==i[5]||o[6]!==i[6]||o[7]!==i[7]||o[8]!==i[8]||o[9]!==i[9]||o[10]!==i[10]||o[11]!==i[11]||o[12]!==i[12]||o[13]!==i[13]||o[14]!==i[14]||o[15]!==i[15])}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/Renderbuffer.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/Renderbuffer.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(e,n){this._context=e,this._desc=n,this._context.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_0__["ResourceType"].Renderbuffer,this);const r=this._context.gl;this.glName=r.createRenderbuffer(),this._context.bindRenderbuffer(this),r.renderbufferStorage(r.RENDERBUFFER,n.internalFormat,n.width,n.height)}get descriptor(){return this._desc}resize(t,e){const n=this._desc;if(n.width===t&&n.height===e)return;n.width=t,n.height=e;const r=this._context.gl;this._context.bindRenderbuffer(this),r.renderbufferStorage(r.RENDERBUFFER,n.internalFormat,n.width,n.height)}dispose(){this._context&&(this._context.gl.deleteRenderbuffer(this.glName),this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_0__["ResourceType"].Renderbuffer,this),this._context=null)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/ShaderTranspiler.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/ShaderTranspiler.js ***!
  \********************************************************************/
/*! exports provided: transpileShader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transpileShader", function() { return X; });
/* harmony import */ var _reservedWordsGLSL3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reservedWordsGLSL3.js */ "../node_modules/@arcgis/core/views/webgl/reservedWordsGLSL3.js");
/* harmony import */ var _chunks_builtins_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/builtins.js */ "../node_modules/@arcgis/core/chunks/builtins.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n=999,o=9999,i=0,s=1,c=2,d=3,p=4,f=5,u=6,l=7,h=8,y=9,w=10,g=11,k=["block-comment","line-comment","preprocessor","operator","integer","float","ident","builtin","keyword","whitespace","eof","integer"];function m(){var t,m,b,_=0,v=0,x=n,j=[],E=[],O=1,L=0,D=0,G=!1,T=!1,X="";return function(t){return E=[],null!==t?P(t.replace?t.replace(/\r\n/g,"\n"):t):C()};function F(t){t.length&&E.push({type:k[x],data:t,position:D,line:O,column:L})}function P(e){var a;for(_=0,b=(X+=e).length;t=X[_],_<b;){switch(a=_,x){case i:_=$();break;case s:_=V();break;case c:_=M();break;case d:_=z();break;case p:_=Z();break;case g:_=W();break;case f:_=q();break;case o:_=B();break;case y:_=A();break;case n:_=S()}if(a!==_)if("\n"===X[a])L=0,++O;else++L}return v+=_,X=X.slice(_),E}function C(t){return j.length&&F(j.join("")),x=w,F("(eof)"),E}function S(){return j=j.length?[]:j,"/"===m&&"*"===t?(D=v+_-1,x=i,m=t,_+1):"/"===m&&"/"===t?(D=v+_-1,x=s,m=t,_+1):"#"===t?(x=c,D=v+_,_):/\s/.test(t)?(x=y,D=v+_,_):(G=/\d/.test(t),T=/[^\w_]/.test(t),D=v+_,x=G?p:T?d:o,_)}function A(){return/[^\s]/g.test(t)?(F(j.join("")),x=n,_):(j.push(t),m=t,_+1)}function M(){return"\r"!==t&&"\n"!==t||"\\"===m?(j.push(t),m=t,_+1):(F(j.join("")),x=n,_)}function V(){return M()}function $(){return"/"===t&&"*"===m?(j.push(t),F(j.join("")),x=n,_+1):(j.push(t),m=t,_+1)}function z(){if("."===m&&/\d/.test(t))return x=f,_;if("/"===m&&"*"===t)return x=i,_;if("/"===m&&"/"===t)return x=s,_;if("."===t&&j.length){for(;I(j););return x=f,_}if(";"===t||")"===t||"("===t){if(j.length)for(;I(j););return F(t),x=n,_+1}var e=2===j.length&&"="!==t;if(/[\w_\d\s]/.test(t)||e){for(;I(j););return x=n,_}return j.push(t),m=t,_+1}function I(t){for(var a,r,n=0;;){if(a=_chunks_builtins_js__WEBPACK_IMPORTED_MODULE_1__["o"].indexOf(t.slice(0,t.length+n).join("")),r=_chunks_builtins_js__WEBPACK_IMPORTED_MODULE_1__["o"][a],-1===a){if(n--+t.length>0)continue;r=t.slice(0,1).join("")}return F(r),D+=r.length,(j=j.slice(r.length)).length}}function W(){return/[^a-fA-F0-9]/.test(t)?(F(j.join("")),x=n,_):(j.push(t),m=t,_+1)}function Z(){return"."===t||/[eE]/.test(t)?(j.push(t),x=f,m=t,_+1):"x"===t&&1===j.length&&"0"===j[0]?(x=g,j.push(t),m=t,_+1):/[^\d]/.test(t)?(F(j.join("")),x=n,_):(j.push(t),m=t,_+1)}function q(){return"f"===t&&(j.push(t),m=t,_+=1),/[eE]/.test(t)||"-"===t&&/[eE]/.test(m)?(j.push(t),m=t,_+1):/[^\d]/.test(t)?(F(j.join("")),x=n,_):(j.push(t),m=t,_+1)}function B(){if(/[^\d\w_]/.test(t)){var e=j.join("");return x=_chunks_builtins_js__WEBPACK_IMPORTED_MODULE_1__["l"].indexOf(e)>-1?h:_chunks_builtins_js__WEBPACK_IMPORTED_MODULE_1__["b"].indexOf(e)>-1?l:u,F(j.join("")),x=n,_}return j.push(t),m=t,_+1}}function b(t){var e=m(),a=[];return a=(a=a.concat(e(t))).concat(e(null))}function _(t){return b(t)}function v(t){return t.map((t=>"eof"!==t.type?t.data:"")).join("")}const x=["GL_OES_standard_derivatives","GL_EXT_frag_depth","GL_EXT_draw_buffers","GL_EXT_shader_texture_lod"];function j(t,e="100",a="300 es"){const r=/^\s*\#version\s+([0-9]+(\s+[a-zA-Z]+)?)\s*/;for(const n of t)if("preprocessor"===n.type){const t=r.exec(n.data);if(t){const r=t[1].replace(/\s\s+/g," ");if(r===a)return r;if(r===e)return n.data="#version "+a,e;throw new Error("unknown glsl version: "+r)}}return t.splice(0,0,{type:"preprocessor",data:"#version "+a},{type:"whitespace",data:"\n"}),null}function E(t,e){for(let a=e-1;a>=0;a--){const e=t[a];if("whitespace"!==e.type&&"block-comment"!==e.type){if("keyword"!==e.type)break;if("attribute"===e.data||"in"===e.data)return!0}}return!1}function O(t,e,a,r){r=r||a;for(const n of t)if("ident"===n.type&&n.data===a){r in e?e[r]++:e[r]=0;return O(t,e,r+"_"+e[r],r)}return a}function L(t,e,a="afterVersion"){function r(t,e){for(let a=e;a<t.length;a++){const e=t[a];if("operator"===e.type&&";"===e.data)return a}return null}function n(t){let e=-1,n=0,o=-1;for(let i=0;i<t.length;i++){const s=t[i];if("preprocessor"===s.type&&(s.data.match(/\#(if|ifdef|ifndef)\s+.+/)?++n:s.data.match(/\#endif\s*.*/)&&--n),"afterVersion"!==a&&"afterPrecision"!==a||"preprocessor"===s.type&&/^#version/.test(s.data)&&(o=Math.max(o,i)),"afterPrecision"===a&&"keyword"===s.type&&"precision"===s.data){const e=r(t,i);if(null===e)throw new Error("precision statement not followed by any semicolons!");o=Math.max(o,e)}e<o&&0===n&&(e=i)}return e+1}const o={data:"\n",type:"whitespace"},i=e=>e<t.length&&/[^\r\n]$/.test(t[e].data);let s=n(t);i(s-1)&&t.splice(s++,0,o);for(const c of e)t.splice(s++,0,c);i(s-1)&&i(s)&&t.splice(s,0,o)}function D(t,e,a,r="lowp"){L(t,[{type:"keyword",data:"out"},{type:"whitespace",data:" "},{type:"keyword",data:r},{type:"whitespace",data:" "},{type:"keyword",data:a},{type:"whitespace",data:" "},{type:"ident",data:e},{type:"operator",data:";"}],"afterPrecision")}function G(t,e,a,r,n="lowp"){L(t,[{type:"keyword",data:"layout"},{type:"operator",data:"("},{type:"keyword",data:"location"},{type:"whitespace",data:" "},{type:"operator",data:"="},{type:"whitespace",data:" "},{type:"integer",data:r.toString()},{type:"operator",data:")"},{type:"whitespace",data:" "},{type:"keyword",data:"out"},{type:"whitespace",data:" "},{type:"keyword",data:n},{type:"whitespace",data:" "},{type:"keyword",data:a},{type:"whitespace",data:" "},{type:"ident",data:e},{type:"operator",data:";"}],"afterPrecision")}function T(t,e){let a,r,n=-1;for(let o=e;o<t.length;o++){const e=t[o];if("operator"===e.type&&("["===e.data&&(a=o),"]"===e.data)){r=o;break}"integer"===e.type&&(n=parseInt(e.data,10))}return a&&r&&t.splice(a,r-a+1),n}function X(e,a){const r=_(e);if("300 es"===j(r,"100","300 es"))throw new Error("shader is already glsl 300 es");let n=null,o=null;const i={},s={};for(let c=0;c<r.length;++c){const e=r[c];switch(e.type){case"keyword":35633===a&&"attribute"===e.data?e.data="in":"varying"===e.data&&(e.data=35633===a?"out":"in");break;case"builtin":if(/^texture(2D|Cube)(Proj)?(Lod|Grad)?(EXT)?$/.test(e.data.trim())&&(e.data=e.data.replace(/(2D|Cube|EXT)/g,"")),35632===a&&"gl_FragColor"===e.data&&(n||(n=O(r,i,"fragColor"),D(r,n,"vec4")),e.data=n),35632===a&&"gl_FragData"===e.data){const t=T(r,c+1),a=O(r,i,"fragData");G(r,a,"vec4",t,"mediump"),e.data=a}else 35632===a&&"gl_FragDepthEXT"===e.data&&(o||(o=O(r,i,"gl_FragDepth")),e.data=o);break;case"ident":if(_reservedWordsGLSL3_js__WEBPACK_IMPORTED_MODULE_0__["default"].indexOf(e.data)>=0){if(35633===a&&E(r,c))throw new Error("attribute in vertex shader uses a name that is a reserved word in glsl 300 es");e.data in s||(s[e.data]=O(r,i,e.data)),e.data=s[e.data]}}}for(let t=r.length-1;t>=0;--t){const e=r[t];if("preprocessor"===e.type){const a=e.data.match(/\#extension\s+(.*)\:/);if(a&&a[1]&&x.indexOf(a[1].trim())>=0){const e=r[t+1];r.splice(t,e&&"whitespace"===e.type?2:1)}const n=e.data.match(/\#ifdef\s+(.*)/);n&&n[1]&&x.indexOf(n[1].trim())>=0&&(e.data="#if 1");const o=e.data.match(/\#ifndef\s+(.*)/);o&&o[1]&&x.indexOf(o[1].trim())>=0&&(e.data="#if 0")}}return v(r)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/Texture.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/Texture.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return o; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./checkWebGLError.js */ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js");
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/* harmony import */ var _capabilities_isWebGL2Context_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./capabilities/isWebGL2Context.js */ "../node_modules/@arcgis/core/views/webgl/capabilities/isWebGL2Context.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=4;class o{constructor(t,e,i=null){this._context=t,this.type="texture",this._glName=null,this._descriptor=void 0,this._samplingModeDirty=!1,this._wrapModeDirty=!1,t.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Texture,this),this._descriptor={target:3553,samplingMode:9729,wrapMode:10497,flipped:!1,hasMipmap:!1,isOpaque:!1,unpackAlignment:4,preMultiplyAlpha:!1,...e},34067===this._descriptor.target?this.setDataCubeMap(i):this.setData(i)}get glName(){return this._glName}get descriptor(){return this._descriptor}dispose(){this._context.gl&&this._glName&&(this._context.unbindTextureAllUnits(this),this._context.gl.deleteTexture(this._glName),this._glName=null,this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_3__["ResourceType"].Texture,this))}release(){this.dispose()}resize(t,e){const i=this._descriptor;i.width===t&&i.height===e||(i.width=t,i.height=e,34067===this._descriptor.target?this.setDataCubeMap(null):this.setData(null))}setDataCubeMap(t=null){for(let e=34069;e<=34074;e++)this.setData(t,e)}setData(t,a=3553){if(!this._context||!this._context.gl)return;const r=this._context.gl;this._glName||(this._glName=r.createTexture()),void 0===t&&(t=null),null===t&&(this._descriptor.width=this._descriptor.width||s,this._descriptor.height=this._descriptor.height||s);const p=this._context.bindTexture(this,o.TEXTURE_UNIT_FOR_UPDATES),h=this._descriptor;o._validateTexture(this._context,h),r.pixelStorei(r.UNPACK_ALIGNMENT,h.unpackAlignment),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,h.flipped?1:0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,h.preMultiplyAlpha?1:0);const l=h.pixelFormat;let d=h.internalFormat?h.internalFormat:this._deriveInternalFormat(l,h.dataType);if(t instanceof ImageData||t instanceof HTMLImageElement||t instanceof HTMLCanvasElement||t instanceof HTMLVideoElement){let e=t.width,s=t.height;t instanceof HTMLVideoElement&&(e=t.videoWidth,s=t.videoHeight),h.width&&h.height,r.texImage2D(a,0,d,l,h.dataType,t),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(r),h.hasMipmap&&this.generateMipmap(),void 0===h.width&&(h.width=e),void 0===h.height&&(h.height=s)}else{null!=h.width&&null!=h.height||console.error("Width and height must be specified!"),r.DEPTH24_STENCIL8&&d===r.DEPTH_STENCIL&&(d=r.DEPTH24_STENCIL8);let s=h.width,o=h.height;if(n(t)){const e=Math.round(Math.log(Math.max(s,o))/Math.LN2)+1;h.hasMipmap=h.hasMipmap&&e===t.levels.length;for(let i=0;;++i){const e=t.levels[Math.min(i,t.levels.length-1)];if(r.compressedTexImage2D(a,i,d,s,o,0,e),1===s&&1===o||!h.hasMipmap)break;s=Math.max(1,s>>1),o=Math.max(1,o>>1)}}else if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t))r.texImage2D(a,0,d,s,o,0,l,h.dataType,t),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(r),h.hasMipmap&&this.generateMipmap();else for(let t=0;r.texImage2D(a,t,d,s,o,0,l,h.dataType,null),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(r),(1!==s||1!==o)&&h.hasMipmap;++t)s=Math.max(1,s>>1),o=Math.max(1,o>>1)}o._applySamplingMode(r,this._descriptor),o._applyWrapMode(r,this._descriptor),o._applyAnisotropicFilteringParameters(this._context,this._descriptor),Object(_checkWebGLError_js__WEBPACK_IMPORTED_MODULE_2__["checkWebGLError"])(r),this._context.bindTexture(p,o.TEXTURE_UNIT_FOR_UPDATES)}updateData(t,e,i,a,r,s,n=3553){s||console.error("An attempt to use uninitialized data!"),this._glName||console.error("An attempt to update uninitialized texture!");const p=this._context.gl,h=this._descriptor,l=this._context.bindTexture(this,o.TEXTURE_UNIT_FOR_UPDATES);(e<0||i<0||a>h.width||r>h.height||e+a>h.width||i+r>h.height)&&console.error("An attempt to update out of bounds of the texture!"),p.pixelStorei(p.UNPACK_ALIGNMENT,h.unpackAlignment),p.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,h.flipped?1:0),p.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,h.preMultiplyAlpha?1:0),s instanceof ImageData||s instanceof HTMLImageElement||s instanceof HTMLCanvasElement||s instanceof HTMLVideoElement?p.texSubImage2D(n,t,e,i,h.pixelFormat,h.dataType,s):p.texSubImage2D(n,t,e,i,a,r,h.pixelFormat,h.dataType,s),this._context.bindTexture(l,o.TEXTURE_UNIT_FOR_UPDATES)}generateMipmap(){const t=this._descriptor;t.hasMipmap||(t.hasMipmap=!0,this._samplingModeDirty=!0,o._validateTexture(this._context,t)),9729===t.samplingMode?(this._samplingModeDirty=!0,t.samplingMode=9985):9728===t.samplingMode&&(this._samplingModeDirty=!0,t.samplingMode=9984);const e=this._context.bindTexture(this,o.TEXTURE_UNIT_FOR_UPDATES);this._context.gl.generateMipmap(t.target),this._context.bindTexture(e,o.TEXTURE_UNIT_FOR_UPDATES)}setSamplingMode(t){t!==this._descriptor.samplingMode&&(this._descriptor.samplingMode=t,this._samplingModeDirty=!0)}setWrapMode(t){t!==this._descriptor.wrapMode&&(this._descriptor.wrapMode=t,o._validateTexture(this._context,this._descriptor),this._wrapModeDirty=!0)}applyChanges(){const t=this._context.gl,e=this._descriptor;this._samplingModeDirty&&(o._applySamplingMode(t,e),this._samplingModeDirty=!1),this._wrapModeDirty&&(o._applyWrapMode(t,e),this._wrapModeDirty=!1)}_deriveInternalFormat(t,e){if("webgl"===this._context.webglVersion)return t;if(5126===e)switch(t){case 6408:return 34836;case 6407:return 34837;default:throw new Error("Unable to derive format")}return t}static _validateTexture(e,i){(i.width<0||i.height<0)&&console.error("Negative dimension parameters are not allowed!");const a=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["isPowerOfTwo"])(i.width)&&Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["isPowerOfTwo"])(i.height);Object(_capabilities_isWebGL2Context_js__WEBPACK_IMPORTED_MODULE_4__["default"])(e.gl)||a||("number"==typeof i.wrapMode?33071!==i.wrapMode&&console.error("Non-power-of-two textures must have a wrap mode of CLAMP_TO_EDGE!"):33071===i.wrapMode.s&&33071===i.wrapMode.t||console.error("Non-power-of-two textures must have a wrap mode of CLAMP_TO_EDGE!"),i.hasMipmap&&console.error("Mipmapping requires power-of-two textures!"))}static _applySamplingMode(t,e){let i=e.samplingMode,a=e.samplingMode;9985===i||9987===i?(i=9729,e.hasMipmap||(a=9729)):9984!==i&&9986!==i||(i=9728,e.hasMipmap||(a=9728)),t.texParameteri(e.target,t.TEXTURE_MAG_FILTER,i),t.texParameteri(e.target,t.TEXTURE_MIN_FILTER,a)}static _applyWrapMode(t,e){"number"==typeof e.wrapMode?(t.texParameteri(e.target,t.TEXTURE_WRAP_S,e.wrapMode),t.texParameteri(e.target,t.TEXTURE_WRAP_T,e.wrapMode)):(t.texParameteri(e.target,t.TEXTURE_WRAP_S,e.wrapMode.s),t.texParameteri(e.target,t.TEXTURE_WRAP_T,e.wrapMode.t))}static _applyAnisotropicFilteringParameters(t,e){var i;const a=t.capabilities.textureFilterAnisotropic;if(!a)return;t.gl.texParameterf(e.target,a.TEXTURE_MAX_ANISOTROPY,null!=(i=e.maxAnisotropy)?i:1)}}function n(t){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&"type"in t&&"compressed"===t.type}o.TEXTURE_UNIT_FOR_UPDATES=0;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/Util.js":
/*!********************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/Util.js ***!
  \********************************************************/
/*! exports provided: bindVertexBufferLayout, getBytesPerElementFormat, getGpuMemoryUsage, getStride, unbindVertexBufferLayout, vertexCount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindVertexBufferLayout", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBytesPerElementFormat", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getGpuMemoryUsage", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStride", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unbindVertexBufferLayout", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "vertexCount", function() { return r; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(e,r){return e.vertexBuffers[r].size/t(e.layout[r])}function t(e){return e[0].stride}function i(e,r,t,i,s){const n=e.gl,o=e.capabilities.instancing;e.bindBuffer(t);for(const a of i){const e=r.get(a.name);void 0===e&&console.error(`There is no location for vertex attribute '${a.name}' defined.`),a.baseInstance&&!a.divisor&&console.error(`Vertex attribute '${a.name}' uses baseInstanceOffset without divisor.`);const t=(s||(0+a.baseInstance?a.baseInstance:0))*a.stride;if(a.count<=4)n.vertexAttribPointer(e,a.count,a.type,a.normalized,a.stride,a.offset+t),n.enableVertexAttribArray(e),a.divisor>0&&o&&o.vertexAttribDivisor(e,a.divisor);else if(9===a.count)for(let r=0;r<3;r++)n.vertexAttribPointer(e+r,3,a.type,a.normalized,a.stride,a.offset+12*r+t),n.enableVertexAttribArray(e+r),a.divisor>0&&o&&o.vertexAttribDivisor(e+r,a.divisor);else if(16===a.count)for(let r=0;r<4;r++)n.vertexAttribPointer(e+r,4,a.type,a.normalized,a.stride,a.offset+16*r+t),n.enableVertexAttribArray(e+r),a.divisor>0&&o&&o.vertexAttribDivisor(e+r,a.divisor);else console.error("Unsupported vertex attribute element count: "+a.count)}}function s(e,r,t,i){const s=e.gl,n=e.capabilities.instancing;e.bindBuffer(t);for(const o of i){const e=r.get(o.name);if(o.count<=4)s.disableVertexAttribArray(e),o.divisor&&o.divisor>0&&n&&n.vertexAttribDivisor(e,0);else if(9===o.count)for(let r=0;r<3;r++)s.disableVertexAttribArray(e+r),o.divisor&&o.divisor>0&&n&&n.vertexAttribDivisor(e+r,0);else if(16===o.count)for(let r=0;r<4;r++)s.disableVertexAttribArray(e+r),o.divisor&&o.divisor>0&&n&&n.vertexAttribDivisor(e+r,0);else console.error("Unsupported vertex attribute element count: "+o.count)}e.unbindBuffer(34962)}function n(e){switch(e){case 6406:case 6409:case 36168:return 1;case 6410:case 32854:case 33325:case 32854:case 33189:return 2;case 6407:case 6402:return 3;case 6408:case 34041:case 33326:case 35898:case 33327:case 34041:return 4;case 33328:case 34842:return 8;case 34837:return 12;case 34836:return 16;case 33776:case 33777:return.5;case 33778:case 33779:return 1;case 37488:case 37489:case 37492:case 37493:case 37494:case 37495:return.5;case 37490:case 37491:case 37496:case 37497:return 1}return 0}function o(r){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(r))return 0;if("descriptor"in r)return r.glName?o(r.descriptor):0;const t=r.internalFormat||"pixelFormat"in r&&r.pixelFormat;if(!t)return 0;const i="hasMipmap"in r&&r.hasMipmap?1.3:1,s=r.width*r.height;return n(t)*s*i}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return f; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _enums_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./enums.js */ "../node_modules/@arcgis/core/views/webgl/enums.js");
/* harmony import */ var _Util_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Util.js */ "../node_modules/@arcgis/core/views/webgl/Util.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.views.webgl.VertexArrayObject");class f{constructor(t,e,i,r,n=null){this._context=t,this._locations=e,this._layout=i,this._buffers=r,this._indexBuffer=n,this._glName=null,this._initialized=!1,t.instanceCounter.increment(_enums_js__WEBPACK_IMPORTED_MODULE_2__["ResourceType"].VAO,this)}get glName(){return this._glName}get vertexBuffers(){return this._buffers}get indexBuffer(){return this._indexBuffer}get size(){return Object.keys(this._buffers).reduce(((t,e)=>t+this._buffers[e].size),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this._indexBuffer)?this._indexBuffer.size:0)}get layout(){return this._layout}get locations(){return this._locations}dispose(t=!0){if(!this._context)return void((this._glName||t&&Object.getOwnPropertyNames(this._buffers).length>0)&&o.warn("Leaked WebGL VAO"));if(this._glName){var e,r;const t=null==(e=this._context)||null==(r=e.capabilities)?void 0:r.vao;t?(t.deleteVertexArray(this._glName),this._glName=null):o.warn("Leaked WebGL VAO")}if(this._context.getBoundVAO()===this&&this._context.bindVAO(null),t){for(const t in this._buffers)this._buffers[t].dispose(),delete this._buffers[t];this._indexBuffer=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["disposeMaybe"])(this._indexBuffer)}this._context.instanceCounter.decrement(_enums_js__WEBPACK_IMPORTED_MODULE_2__["ResourceType"].VAO,this),this._context=null}initialize(){if(this._initialized)return;const t=this._context.capabilities.vao;if(t){const e=t.createVertexArray();t.bindVertexArray(e),this._bindLayout(),t.bindVertexArray(null),this._glName=e}this._initialized=!0}bind(){this.initialize();const t=this._context.capabilities.vao;t?t.bindVertexArray(this.glName):(this._context.bindVAO(null),this._bindLayout())}_bindLayout(){const{_buffers:t,_layout:i,_indexBuffer:s}=this;t||o.error("Vertex buffer dictionary is empty!");const n=this._context.gl;for(const e in t){const s=t[e];s||o.error("Vertex buffer is uninitialized!");const n=i[e];n||o.error("Vertex element descriptor is empty!"),Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["bindVertexBufferLayout"])(this._context,this._locations,s,n)}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(s)){!!this._context.capabilities.vao?n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,s.glName):this._context.bindBuffer(s)}}unbind(){this.initialize();const t=this._context.capabilities.vao;t?t.bindVertexArray(null):this._unbindLayout()}_unbindLayout(){const{_buffers:t,_layout:i}=this;t||o.error("Vertex buffer dictionary is empty!");for(const e in t){const s=t[e];s||o.error("Vertex buffer is uninitialized!");const r=i[e];Object(_Util_js__WEBPACK_IMPORTED_MODULE_3__["unbindVertexBufferLayout"])(this._context,this._locations,s,r)}Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this._indexBuffer)&&this._context.unbindBuffer(this._indexBuffer.bufferType)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/capabilities/isWebGL2Context.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/capabilities/isWebGL2Context.js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){return window.WebGL2RenderingContext&&n instanceof window.WebGL2RenderingContext}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/checkWebGLError.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/checkWebGLError.js ***!
  \*******************************************************************/
/*! exports provided: checkWebGLError, hasFeatureFlagWebGLDebug, webglDebugEnabled, webglValidateShadersEnabled */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkWebGLError", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasFeatureFlagWebGLDebug", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webglDebugEnabled", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webglValidateShadersEnabled", function() { return c; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=_core_Logger_js__WEBPACK_IMPORTED_MODULE_2__["default"].getLogger("esri/views/webgl");function o(e,r){switch(r){case e.INVALID_ENUM:return"Invalid Enum. An unacceptable value has been specified for an enumerated argument.";case e.INVALID_VALUE:return"Invalid Value. A numeric argument is out of range.";case e.INVALID_OPERATION:return"Invalid Operation. The specified command is not allowed for the current state.";case e.INVALID_FRAMEBUFFER_OPERATION:return"Invalid Framebuffer operation. The currently bound framebuffer is not framebuffer complete when trying to render to or to read from it.";case e.OUT_OF_MEMORY:return"Out of memory. Not enough memory is left to execute the command.";case e.CONTEXT_LOST_WEBGL:return"WebGL context has been lost";default:return"Unknown error"}}const a=!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])("enable-feature:webgl-debug");function u(){return a}function c(){return a}function s(r){if(u()){const t=r.getError();if(t){const a=o(r,t),u=(new Error).stack;n.error(new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("webgl-error","WebGL error occured",{message:a,stack:u}))}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/enums.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/enums.js ***!
  \*********************************************************/
/*! exports provided: BASE_TEXTURE_UNIT, DepthStencilAttachment, ResourceType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BASE_TEXTURE_UNIT", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DepthStencilAttachment", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ResourceType", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const r=33984;var e;!function(r){r[r.Texture=0]="Texture",r[r.Buffer=1]="Buffer",r[r.VAO=2]="VAO",r[r.Program=3]="Program",r[r.Framebuffer=4]="Framebuffer",r[r.Renderbuffer=5]="Renderbuffer",r[r.COUNT=6]="COUNT"}(e||(e={}));const f=33306;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/renderState.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/renderState.js ***!
  \***************************************************************/
/*! exports provided: StateTracker, backFaceCullingParams, cullingParams, defaultColorWriteParams, defaultDepthWriteParams, frontFaceCullingParams, makeBlending, makeColorWrite, makeCulling, makeDepthTest, makeDepthWrite, makePipelineState, makePolygonOffset, makeStencilTest, makeStencilWrite, separateBlendingParams, simpleBlendingParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StateTracker", function() { return K; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "backFaceCullingParams", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cullingParams", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultColorWriteParams", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultDepthWriteParams", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "frontFaceCullingParams", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeBlending", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeColorWrite", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeCulling", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeDepthTest", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeDepthWrite", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makePipelineState", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makePolygonOffset", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeStencilTest", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeStencilWrite", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "separateBlendingParams", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "simpleBlendingParams", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,e,i=32774,n=[0,0,0,0]){return{srcRgb:t,srcAlpha:t,dstRgb:e,dstAlpha:e,opRgb:i,opAlpha:i,color:{r:n[0],g:n[1],b:n[2],a:n[3]}}}function e(t,e,i,n,s=32774,l=32774,r=[0,0,0,0]){return{srcRgb:t,srcAlpha:e,dstRgb:i,dstAlpha:n,opRgb:s,opAlpha:l,color:{r:r[0],g:r[1],b:r[2],a:r[3]}}}const i={face:1029,mode:2305},n={face:1028,mode:2305},s=t=>2===t?i:1===t?n:null,l={zNear:0,zFar:1},r={r:!0,g:!0,b:!0,a:!0};function h(t){return I.intern(t)}function o(t){return S.intern(t)}function a(t){return T.intern(t)}function c(t){return O.intern(t)}function d(t){return w.intern(t)}function p(t){return D.intern(t)}function u(t){return A.intern(t)}function _(t){return k.intern(t)}function g(t){return B.intern(t)}class f{constructor(t,e){this.makeKey=t,this.makeRef=e,this.interns=new Map}intern(t){if(!t)return null;const e=this.makeKey(t),i=this.interns;return i.has(e)||i.set(e,this.makeRef(t)),i.get(e)}}function v(t){return"["+t.join(",")+"]"}const I=new f(W,(t=>({__tag:"Blending",...t})));function W(t){return t?v([t.srcRgb,t.srcAlpha,t.dstRgb,t.dstAlpha,t.opRgb,t.opAlpha,t.color.r,t.color.g,t.color.b,t.color.a]):null}const S=new f(b,(t=>({__tag:"Culling",...t})));function b(t){return t?v([t.face,t.mode]):null}const T=new f(y,(t=>({__tag:"PolygonOffset",...t})));function y(t){return t?v([t.factor,t.units]):null}const O=new f(R,(t=>({__tag:"DepthTest",...t})));function R(t){return t?v([t.func]):null}const w=new f(C,(t=>({__tag:"StencilTest",...t})));function C(t){return t?v([t.function.func,t.function.ref,t.function.mask,t.operation.fail,t.operation.zFail,t.operation.zPass]):null}const D=new f(m,(t=>({__tag:"DepthWrite",...t})));function m(t){return t?v([t.zNear,t.zFar]):null}const A=new f(P,(t=>({__tag:"ColorWrite",...t})));function P(t){return t?v([t.r,t.g,t.b,t.a]):null}const k=new f(z,(t=>({__tag:"StencilWrite",...t})));function z(t){return t?v([t.mask]):null}const B=new f(F,(t=>({blending:h(t.blending),culling:o(t.culling),polygonOffset:a(t.polygonOffset),depthTest:c(t.depthTest),stencilTest:d(t.stencilTest),depthWrite:p(t.depthWrite),colorWrite:u(t.colorWrite),stencilWrite:_(t.stencilWrite)})));function F(t){return t?v([W(t.blending),b(t.culling),y(t.polygonOffset),R(t.depthTest),C(t.stencilTest),m(t.depthWrite),P(t.colorWrite),z(t.stencilWrite)]):null}class K{constructor(t){this._pipelineInvalid=!0,this._blendingInvalid=!0,this._cullingInvalid=!0,this._polygonOffsetInvalid=!0,this._depthTestInvalid=!0,this._stencilTestInvalid=!0,this._depthWriteInvalid=!0,this._colorWriteInvalid=!0,this._stencilWriteInvalid=!0,this._stateSetters=t}setPipeline(t){(this._pipelineInvalid||t!==this._pipeline)&&(this.setBlending(t.blending),this.setCulling(t.culling),this.setPolygonOffset(t.polygonOffset),this.setDepthTest(t.depthTest),this.setStencilTest(t.stencilTest),this.setDepthWrite(t.depthWrite),this.setColorWrite(t.colorWrite),this.setStencilWrite(t.stencilWrite),this._pipeline=t),this._pipelineInvalid=!1}invalidateBlending(){this._blendingInvalid=!0,this._pipelineInvalid=!0}invalidateCulling(){this._cullingInvalid=!0,this._pipelineInvalid=!0}invalidatePolygonOffset(){this._polygonOffsetInvalid=!0,this._pipelineInvalid=!0}invalidateDepthTest(){this._depthTestInvalid=!0,this._pipelineInvalid=!0}invalidateStencilTest(){this._stencilTestInvalid=!0,this._pipelineInvalid=!0}invalidateDepthWrite(){this._depthWriteInvalid=!0,this._pipelineInvalid=!0}invalidateColorWrite(){this._colorWriteInvalid=!0,this._pipelineInvalid=!0}invalidateStencilWrite(){this._stencilTestInvalid=!0,this._pipelineInvalid=!0}setBlending(t){this._blending=this.setSubState(t,this._blending,this._blendingInvalid,this._stateSetters.setBlending),this._blendingInvalid=!1}setCulling(t){this._culling=this.setSubState(t,this._culling,this._cullingInvalid,this._stateSetters.setCulling),this._cullingInvalid=!1}setPolygonOffset(t){this._polygonOffset=this.setSubState(t,this._polygonOffset,this._polygonOffsetInvalid,this._stateSetters.setPolygonOffset),this._polygonOffsetInvalid=!1}setDepthTest(t){this._depthTest=this.setSubState(t,this._depthTest,this._depthTestInvalid,this._stateSetters.setDepthTest),this._depthTestInvalid=!1}setStencilTest(t){this._stencilTest=this.setSubState(t,this._stencilTest,this._stencilTestInvalid,this._stateSetters.setStencilTest),this._stencilTestInvalid=!1}setDepthWrite(t){this._depthWrite=this.setSubState(t,this._depthWrite,this._depthWriteInvalid,this._stateSetters.setDepthWrite),this._depthWriteInvalid=!1}setColorWrite(t){this._colorWrite=this.setSubState(t,this._colorWrite,this._colorWriteInvalid,this._stateSetters.setColorWrite),this._colorWriteInvalid=!1}setStencilWrite(t){this._stencilWrite=this.setSubState(t,this._stencilWrite,this._stencilWriteInvalid,this._stateSetters.setStencilWrite),this._stencilTestInvalid=!1}setSubState(t,e,i,n){return(i||t!==e)&&(n(t),this._pipelineInvalid=!0),t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/reservedWordsGLSL3.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/reservedWordsGLSL3.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e=["layout","centroid","smooth","case","mat2x2","mat2x3","mat2x4","mat3x2","mat3x3","mat3x4","mat4x2","mat4x3","mat4x4","uint","uvec2","uvec3","uvec4","samplerCubeShadow","sampler2DArray","sampler2DArrayShadow","isampler2D","isampler3D","isamplerCube","isampler2DArray","usampler2D","usampler3D","usamplerCube","usampler2DArray","coherent","restrict","readonly","writeonly","resource","atomic_uint","noperspective","patch","sample","subroutine","common","partition","active","filter","image1D","image2D","image3D","imageCube","iimage1D","iimage2D","iimage3D","iimageCube","uimage1D","uimage2D","uimage3D","uimageCube","image1DArray","image2DArray","iimage1DArray","iimage2DArray","uimage1DArray","uimage2DArray","image1DShadow","image2DShadow","image1DArrayShadow","image2DArrayShadow","imageBuffer","iimageBuffer","uimageBuffer","sampler1DArray","sampler1DArrayShadow","isampler1D","isampler1DArray","usampler1D","usampler1DArray","isampler2DRect","usampler2DRect","samplerBuffer","isamplerBuffer","usamplerBuffer","sampler2DMS","isampler2DMS","usampler2DMS","sampler2DMSArray","isampler2DMSArray","usampler2DMSArray","trunc","round","roundEven","isnan","isinf","floatBitsToInt","floatBitsToUint","intBitsToFloat","uintBitsToFloat","packSnorm2x16","unpackSnorm2x16","packUnorm2x16","unpackUnorm2x16","packHalf2x16","unpackHalf2x16","outerProduct","transpose","determinant","inverse","texture","textureSize","textureProj","textureLod","textureOffset","texelFetch","texelFetchOffset","textureProjOffset","textureLodOffset","textureProjLod","textureProjLodOffset","textureGrad","textureGradOffset","textureProjGrad","textureProjGradOffset"];


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/testFloatBufferBlend.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/testFloatBufferBlend.js ***!
  \************************************************************************/
/*! exports provided: testFloatBufferBlend */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testFloatBufferBlend", function() { return c; });
/* harmony import */ var _3d_webgl_engine_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../3d/webgl-engine/lib/OrderIndependentTransparency.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/OrderIndependentTransparency.js");
/* harmony import */ var _BufferObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BufferObject.js */ "../node_modules/@arcgis/core/views/webgl/BufferObject.js");
/* harmony import */ var _FramebufferObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FramebufferObject.js */ "../node_modules/@arcgis/core/views/webgl/FramebufferObject.js");
/* harmony import */ var _Program_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Program.js */ "../node_modules/@arcgis/core/views/webgl/Program.js");
/* harmony import */ var _renderState_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./renderState.js */ "../node_modules/@arcgis/core/views/webgl/renderState.js");
/* harmony import */ var _VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VertexArrayObject.js */ "../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a,u,f,l={exports:{}};function c(a){var u,f,c,s,d;if(!a.gl)return!1;if("webgl"===a.webglVersion)return(null==(s=a.capabilities.textureFloat)?void 0:s.textureFloat)&&(null==(d=a.capabilities.colorBufferFloat)?void 0:d.textureFloat);if(!((null==(u=a.capabilities.textureFloat)?void 0:u.textureFloat)&&(null==(f=a.capabilities.colorBufferFloat)?void 0:f.textureFloat)&&(null==(c=a.capabilities.colorBufferFloat)?void 0:c.floatBlend)))return!1;const g=new _FramebufferObject_js__WEBPACK_IMPORTED_MODULE_2__["default"](a,{colorTarget:0,depthStencilTarget:0},{target:3553,wrapMode:33071,pixelFormat:6408,dataType:5126,internalFormat:34836,samplingMode:9728,width:1,height:1}),b=_BufferObject_js__WEBPACK_IMPORTED_MODULE_1__["default"].createVertex(a,35044,new Uint16Array([0,0,1,0,0,1,1,1])),p=new _VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_5__["default"](a,new Map([["a_pos",0]]),{geometry:[{name:"a_pos",count:2,type:5123,offset:0,stride:4,normalized:!1}]},{geometry:b}),m=new _Program_js__WEBPACK_IMPORTED_MODULE_3__["Program"](a,"\n  precision highp float;\n  attribute vec2 a_pos;\n\n  void main() {\n    gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);\n  }\n  ","\n   precision highp float;\n\n   void main() {\n    gl_FragColor = vec4(0.5, 0.5, 0.5, 0.5);\n   }\n  ",new Map([["a_pos",0]]));a.useProgram(m);const E=a.getBoundFramebufferObject(),{x:v,y:T,width:F,height:_}=a.getViewport();a.bindFramebuffer(g),a.setViewport(0,0,1,1),a.bindVAO(p),a.drawArrays(5,0,4);const x=Object(_renderState_js__WEBPACK_IMPORTED_MODULE_4__["makePipelineState"])({blending:_3d_webgl_engine_lib_OrderIndependentTransparency_js__WEBPACK_IMPORTED_MODULE_0__["blendingAlpha"]});a.setPipelineState(x),a.drawArrays(5,0,4),l.exports.init(a);const h=a.gl.getError();return a.setViewport(v,T,F,_),a.bindFramebuffer(E),m.dispose(),p.dispose(!1),b.dispose(),g.dispose(),1282!==h||(console.warn("Device claims support for WebGL extension EXT_float_blend but does not support it. Using fall back."),!1)}a=l,u=function(){var e=function(e){window.console&&window.console.log&&window.console.log(e)},t=function(t){window.console&&window.console.error?window.console.error(t):e(t)},r={enable:{1:{0:!0}},disable:{1:{0:!0}},getParameter:{1:{0:!0}},drawArrays:{3:{0:!0}},drawElements:{4:{0:!0,2:!0}},createShader:{1:{0:!0}},getShaderParameter:{2:{1:!0}},getProgramParameter:{2:{1:!0}},getShaderPrecisionFormat:{2:{0:!0,1:!0}},getVertexAttrib:{2:{1:!0}},vertexAttribPointer:{6:{2:!0}},bindTexture:{2:{0:!0}},activeTexture:{1:{0:!0}},getTexParameter:{2:{0:!0,1:!0}},texParameterf:{3:{0:!0,1:!0}},texParameteri:{3:{0:!0,1:!0,2:!0}},texImage2D:{9:{0:!0,2:!0,6:!0,7:!0},6:{0:!0,2:!0,3:!0,4:!0}},texSubImage2D:{9:{0:!0,6:!0,7:!0},7:{0:!0,4:!0,5:!0}},copyTexImage2D:{8:{0:!0,2:!0}},copyTexSubImage2D:{8:{0:!0}},generateMipmap:{1:{0:!0}},compressedTexImage2D:{7:{0:!0,2:!0}},compressedTexSubImage2D:{8:{0:!0,6:!0}},bindBuffer:{2:{0:!0}},bufferData:{3:{0:!0,2:!0}},bufferSubData:{3:{0:!0}},getBufferParameter:{2:{0:!0,1:!0}},pixelStorei:{2:{0:!0,1:!0}},readPixels:{7:{4:!0,5:!0}},bindRenderbuffer:{2:{0:!0}},bindFramebuffer:{2:{0:!0}},checkFramebufferStatus:{1:{0:!0}},framebufferRenderbuffer:{4:{0:!0,1:!0,2:!0}},framebufferTexture2D:{5:{0:!0,1:!0,2:!0}},getFramebufferAttachmentParameter:{3:{0:!0,1:!0,2:!0}},getRenderbufferParameter:{2:{0:!0,1:!0}},renderbufferStorage:{4:{0:!0,1:!0}},clear:{1:{0:{enumBitwiseOr:["COLOR_BUFFER_BIT","DEPTH_BUFFER_BIT","STENCIL_BUFFER_BIT"]}}},depthFunc:{1:{0:!0}},blendFunc:{2:{0:!0,1:!0}},blendFuncSeparate:{4:{0:!0,1:!0,2:!0,3:!0}},blendEquation:{1:{0:!0}},blendEquationSeparate:{2:{0:!0,1:!0}},stencilFunc:{3:{0:!0}},stencilFuncSeparate:{4:{0:!0,1:!0}},stencilMaskSeparate:{2:{0:!0}},stencilOp:{3:{0:!0,1:!0,2:!0}},stencilOpSeparate:{4:{0:!0,1:!0,2:!0,3:!0}},cullFace:{1:{0:!0}},frontFace:{1:{0:!0}},drawArraysInstancedANGLE:{4:{0:!0}},drawElementsInstancedANGLE:{5:{0:!0,2:!0}},blendEquationEXT:{1:{0:!0}}},n=null,o=null;function i(e){if(null==n)for(var t in n={},o={},e)"number"==typeof e[t]&&(n[e[t]]=t,o[t]=e[t])}function a(){if(null==n)throw"WebGLDebugUtils.init(ctx) not called"}function u(e){return a(),void 0!==n[e]}function f(e){a();var t=n[e];return void 0!==t?"gl."+t:"/*UNKNOWN WebGL ENUM*/ 0x"+e.toString(16)}function l(e,t,n,i){var a;if(void 0!==(a=r[e])&&void 0!==(a=a[t])&&a[n]){if("object"==typeof a[n]&&void 0!==a[n].enumBitwiseOr){for(var u=a[n].enumBitwiseOr,l=0,c=[],s=0;s<u.length;++s){var d=o[u[s]];0!=(i&d)&&(l|=d,c.push(f(d)))}return l===i?c.join(" | "):f(i)}return f(i)}return null===i?"null":void 0===i?"undefined":i.toString()}function c(e,t){for(var r="",n=t.length,o=0;o<n;++o)r+=(0==o?"":", ")+l(e,n,o,t[o]);return r}function s(e,t,r){e.__defineGetter__(r,(function(){return t[r]})),e.__defineSetter__(r,(function(e){t[r]=e}))}function d(e,r,n,o){o=o||e,i(e),r=r||function(e,r,n){for(var o="",i=n.length,a=0;a<i;++a)o+=(0==a?"":", ")+l(r,i,a,n[a]);t("WebGL error "+f(e)+" in "+r+"("+o+")")};var a={};function u(e,t){return function(){n&&n(t,arguments);var i=e[t].apply(e,arguments),u=o.getError();return 0!=u&&(a[u]=!0,r(u,t,arguments)),i}}var c={};for(var g in e)if("function"==typeof e[g])if("getExtension"!=g)c[g]=u(e,g);else{var b=u(e,g);c[g]=function(){return d(b.apply(e,arguments),r,n,o)}}else s(c,e,g);return c.getError=function(){for(var t in a)if(a.hasOwnProperty(t)&&a[t])return a[t]=!1,t;return e.NO_ERROR},c}function g(e){var t=e.getParameter(e.MAX_VERTEX_ATTRIBS),r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r);for(var n=0;n<t;++n)e.disableVertexAttribArray(n),e.vertexAttribPointer(n,4,e.FLOAT,!1,0,0),e.vertexAttrib1f(n,0);e.deleteBuffer(r);var o=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS);for(n=0;n<o;++n)e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_CUBE_MAP,null),e.bindTexture(e.TEXTURE_2D,null);for(e.activeTexture(e.TEXTURE0),e.useProgram(null),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindRenderbuffer(e.RENDERBUFFER,null),e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.DITHER),e.disable(e.SCISSOR_TEST),e.blendColor(0,0,0,0),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.clearColor(0,0,0,0),e.clearDepth(1),e.clearStencil(-1),e.colorMask(!0,!0,!0,!0),e.cullFace(e.BACK),e.depthFunc(e.LESS),e.depthMask(!0),e.depthRange(0,1),e.frontFace(e.CCW),e.hint(e.GENERATE_MIPMAP_HINT,e.DONT_CARE),e.lineWidth(1),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.UNPACK_COLORSPACE_CONVERSION_WEBGL&&e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.polygonOffset(0,0),e.sampleCoverage(1,!1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilMask(4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT|e.STENCIL_BUFFER_BIT);e.getError(););}function b(e){var t,r,n=[],o=[],i={},a=1,u=!1,f=[],l=0,c=0,d=!1,b=0,p={};function m(e){return"function"==typeof e?e:function(t){e.handleEvent(t)}}e.getContext=(r=e.getContext,function(){var n=r.apply(e,arguments);if(n instanceof WebGLRenderingContext){if(n!=t){if(t)throw"got different context";i=R(t=n)}return i}return n});var E=function(e){n.push(m(e))},v=function(e){o.push(m(e))};function T(e){var t=e.addEventListener;e.addEventListener=function(r,n,o){switch(r){case"webglcontextlost":E(n);break;case"webglcontextrestored":v(n);break;default:t.apply(e,arguments)}}}function F(){for(var e=Object.keys(p),t=0;t<e.length;++t)delete p[e]}function _(){++c,u||l==c&&e.loseContext()}function x(e,t){var r=e[t];return function(){if(_(),!u)return r.apply(e,arguments)}}function h(){for(var e=0;e<f.length;++e){var r=f[e];r instanceof WebGLBuffer?t.deleteBuffer(r):r instanceof WebGLFramebuffer?t.deleteFramebuffer(r):r instanceof WebGLProgram?t.deleteProgram(r):r instanceof WebGLRenderbuffer?t.deleteRenderbuffer(r):r instanceof WebGLShader?t.deleteShader(r):r instanceof WebGLTexture&&t.deleteTexture(r)}}function A(e){return{statusMessage:e,preventDefault:function(){d=!0}}}return T(e),e.loseContext=function(){if(!u){for(u=!0,l=0,++a;t.getError(););F(),p[t.CONTEXT_LOST_WEBGL]=!0;var r=A("context lost"),o=n.slice();setTimeout((function(){for(var t=0;t<o.length;++t)o[t](r);b>=0&&setTimeout((function(){e.restoreContext()}),b)}),0)}},e.restoreContext=function(){u&&o.length&&setTimeout((function(){if(!d)throw"can not restore. webglcontestlost listener did not call event.preventDefault";h(),g(t),u=!1,c=0,d=!1;for(var e=o.slice(),r=A("context restored"),n=0;n<e.length;++n)e[n](r)}),0)},e.loseContextInNCalls=function(e){if(u)throw"You can not ask a lost contet to be lost";l=c+e},e.getNumCalls=function(){return c},e.setRestoreTimeout=function(e){b=e},e;function R(e){for(var r in e)"function"==typeof e[r]?i[r]=x(e,r):s(i,e,r);i.getError=function(){if(_(),!u)for(;e=t.getError();)p[e]=!0;for(var e in p)if(p[e])return delete p[e],e;return i.NO_ERROR};for(var n=["createBuffer","createFramebuffer","createProgram","createRenderbuffer","createShader","createTexture"],o=0;o<n.length;++o){var l=n[o];i[l]=function(t){return function(){if(_(),u)return null;var r=t.apply(e,arguments);return r.__webglDebugContextLostId__=a,f.push(r),r}}(e[l])}var c=["getActiveAttrib","getActiveUniform","getBufferParameter","getContextAttributes","getAttachedShaders","getFramebufferAttachmentParameter","getParameter","getProgramParameter","getProgramInfoLog","getRenderbufferParameter","getShaderParameter","getShaderInfoLog","getShaderSource","getTexParameter","getUniform","getUniformLocation","getVertexAttrib"];for(o=0;o<c.length;++o)l=c[o],i[l]=function(t){return function(){return _(),u?null:t.apply(e,arguments)}}(i[l]);var d=["isBuffer","isEnabled","isFramebuffer","isProgram","isRenderbuffer","isShader","isTexture"];for(o=0;o<d.length;++o)l=d[o],i[l]=function(t){return function(){return _(),!u&&t.apply(e,arguments)}}(i[l]);return i.checkFramebufferStatus=function(t){return function(){return _(),u?i.FRAMEBUFFER_UNSUPPORTED:t.apply(e,arguments)}}(i.checkFramebufferStatus),i.getAttribLocation=function(t){return function(){return _(),u?-1:t.apply(e,arguments)}}(i.getAttribLocation),i.getVertexAttribOffset=function(t){return function(){return _(),u?0:t.apply(e,arguments)}}(i.getVertexAttribOffset),i.isContextLost=function(){return u},i}}return{init:i,mightBeEnum:u,glEnumToString:f,glFunctionArgToString:l,glFunctionArgsToString:c,makeDebugContext:d,makeLostContextSimulatingCanvas:b,resetToInitialState:g}},void 0!==(f=u())&&(a.exports=f);


/***/ }),

/***/ "../node_modules/@arcgis/core/views/webgl/testSVGPremultipliedAlpha.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/webgl/testSVGPremultipliedAlpha.js ***!
  \*****************************************************************************/
/*! exports provided: testSVGPremultipliedAlpha */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testSVGPremultipliedAlpha", function() { return n; });
/* harmony import */ var _BufferObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BufferObject.js */ "../node_modules/@arcgis/core/views/webgl/BufferObject.js");
/* harmony import */ var _FramebufferObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FramebufferObject.js */ "../node_modules/@arcgis/core/views/webgl/FramebufferObject.js");
/* harmony import */ var _Program_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Program.js */ "../node_modules/@arcgis/core/views/webgl/Program.js");
/* harmony import */ var _Texture_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Texture.js */ "../node_modules/@arcgis/core/views/webgl/Texture.js");
/* harmony import */ var _VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./VertexArrayObject.js */ "../node_modules/@arcgis/core/views/webgl/VertexArrayObject.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(n){const a=new Image;if(a.src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='5' height='5' version='1.1' viewBox='0 0 5 5' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='5' height='5' fill='%23f00' fill-opacity='.5'/%3E%3C/svg%3E%0A",a.width=5,a.height=5,await a.decode(),!n.gl)return!0;const s=new _FramebufferObject_js__WEBPACK_IMPORTED_MODULE_1__["default"](n,{colorTarget:0,depthStencilTarget:0},{target:3553,wrapMode:33071,pixelFormat:6408,dataType:5121,samplingMode:9728,width:1,height:1}),p=_BufferObject_js__WEBPACK_IMPORTED_MODULE_0__["default"].createVertex(n,35044,new Uint16Array([0,0,1,0,0,1,1,1])),m=new _VertexArrayObject_js__WEBPACK_IMPORTED_MODULE_4__["default"](n,new Map([["a_pos",0]]),{geometry:[{name:"a_pos",count:2,type:5123,offset:0,stride:4,normalized:!1}]},{geometry:p}),d=new _Program_js__WEBPACK_IMPORTED_MODULE_2__["Program"](n,"\n  precision highp float;\n\n  attribute vec2 a_pos;\n  varying vec2 v_uv;\n\n  void main() {\n    v_uv = a_pos;\n    gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);\n  }\n  ","\n  precision highp float;\n\n  varying vec2 v_uv;\n  uniform sampler2D u_texture;\n\n  void main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n  }\n  ",new Map([["a_pos",0]]));n.useProgram(d);const g=new _Texture_js__WEBPACK_IMPORTED_MODULE_3__["default"](n,{dataType:5121,pixelFormat:6408,preMultiplyAlpha:!1,wrapMode:33071,samplingMode:9729},a);n.bindTexture(g,0),d.setUniform1i("u_texture",0);const c=n.getBoundFramebufferObject(),{x:u,y:f,width:w,height:l}=n.getViewport();n.bindFramebuffer(s),n.setViewport(0,0,1,1),n.bindVAO(m),n.drawArrays(5,0,4);const v=new Uint8Array(4);return s.readPixels(0,0,1,1,6408,5121,v),d.dispose(),m.dispose(!1),p.dispose(),s.dispose(),g.dispose(),n.setViewport(u,f,w,l),n.bindFramebuffer(c),a.src="",255===v[0]}


/***/ })

};;
//# sourceMappingURL=57.render-page.js.map
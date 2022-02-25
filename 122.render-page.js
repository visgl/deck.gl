exports.ids = [122];
exports.modules = {

/***/ "../node_modules/@arcgis/core/libs/i3s/I3SModule.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/libs/i3s/I3SModule.js ***!
  \**********************************************************/
/*! exports provided: get */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return t; });
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../assets.js */ "../node_modules/@arcgis/core/assets.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(){return i||(i=new Promise((e=>__webpack_require__.e(/*! import() */ 130).then(__webpack_require__.bind(null, /*! ../../chunks/i3s.js */ "../node_modules/@arcgis/core/chunks/i3s.js")).then((function(e){return e.i})).then((({default:t})=>{const i=t({locateFile:n,onRuntimeInitialized:()=>e(i)});delete i.then})))).catch((e=>Promise.reject(e)))),i}function n(t){return Object(_assets_js__WEBPACK_IMPORTED_MODULE_0__["getAssetUrl"])(`esri/libs/i3s/${t}`)}let i;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/SceneLayerWorker.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/SceneLayerWorker.js ***!
  \************************************************************************/
/*! exports provided: destroyContext, dracoDecompressPointCloudData, filterObbsForModifications, filterObbsForModificationsSync, initialize, interpretObbModificationResults, process, setLegacySchema, setModifications, setModificationsSync, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destroyContext", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dracoDecompressPointCloudData", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterObbsForModifications", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterObbsForModificationsSync", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initialize", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "interpretObbModificationResults", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "process", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLegacySchema", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setModifications", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setModificationsSync", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return p; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _libs_i3s_I3SModule_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../libs/i3s/I3SModule.js */ "../node_modules/@arcgis/core/libs/i3s/I3SModule.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(e){await h();const t=[e.geometryBuffer];return{result:y(e,t),transferList:t}}async function o(e){var r;await h();const n=[e.geometryBuffer],{geometryBuffer:o}=e,s=o.byteLength,f=c._malloc(s),i=new Uint8Array(c.HEAPU8.buffer,f,s);i.set(new Uint8Array(o));const a=c.dracoDecompressPointCloudData(f,i.byteLength);if(c._free(f),a.error.length>0)throw`i3s.wasm: ${a.error}`;const u=(null==(r=a.featureIds)?void 0:r.length)>0?Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(a.featureIds):null,l=Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(a.positions);u&&n.push(u.buffer),n.push(l.buffer);return{result:{positions:l,featureIds:u},transferList:n}}async function s(e){await h(),m(e);const t={buffer:e.buffer};return{result:t,transferList:[t.buffer]}}async function f(e){await h(),l(e)}async function i(e){await h(),c.setLegacySchema(e.context,e.jsonSchema)}function a(e){d(e)}let u,c;function l(e){const t=e.modifications,r=c._malloc(8*t.length),n=new Float64Array(c.HEAPU8.buffer,r,t.length);for(let o=0;o<t.length;++o)n[o]=t[o];c.setModifications(e.context,r,t.length,e.isGeodetic),c._free(r)}function y(r,n){if(!c)return null;const{context:o,localOrigin:s,globalTrafo:f,mbs:i,obb:a,elevationOffset:u,geometryBuffer:l,geometryDescriptor:y,indexToVertexProjector:b,vertexToRenderProjector:m}=r,d=c._malloc(l.byteLength),h=33,p=c._malloc(h*Float64Array.BYTES_PER_ELEMENT),g=new Uint8Array(c.HEAPU8.buffer,d,l.byteLength);g.set(new Uint8Array(l));const w=new Float64Array(c.HEAPU8.buffer,p,h);E(w,s);let A=w.byteOffset+3*w.BYTES_PER_ELEMENT,_=new Float64Array(w.buffer,A);E(_,f),A+=16*w.BYTES_PER_ELEMENT,_=new Float64Array(w.buffer,A),E(_,i),A+=4*w.BYTES_PER_ELEMENT,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(a)&&(_=new Float64Array(w.buffer,A),E(_,a.center),A+=3*w.BYTES_PER_ELEMENT,_=new Float64Array(w.buffer,A),E(_,a.halfSize),A+=3*w.BYTES_PER_ELEMENT,_=new Float64Array(w.buffer,A),E(_,a.quaternion));const L=y,T={isDraco:!1,isLegacy:!1,color:r.layouts.some((e=>e.some((e=>"color"===e.name)))),normal:r.needNormals&&r.layouts.some((e=>e.some((e=>"normalCompressed"===e.name)))),uv0:r.layouts.some((e=>e.some((e=>"uv0"===e.name)))),uvRegion:r.layouts.some((e=>e.some((e=>"uvRegion"===e.name)))),featureIndex:L.featureIndex},I=c.process(o,!!r.obb,d,g.byteLength,L,T,p,u,b,m,r.normalReferenceFrame);if(c._free(p),c._free(d),I.error.length>0)throw`i3s.wasm: ${I.error}`;if(I.discarded)return null;const P=I.componentOffsets.length>0?Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(I.componentOffsets):null,U=I.featureIds.length>0?Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(I.featureIds):null,B=Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(I.interleavedVertedData).buffer,F=1===I.indicesType?Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(new Uint16Array(I.indices.buffer,I.indices.byteOffset,I.indices.byteLength/2)):Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(new Uint32Array(I.indices.buffer,I.indices.byteOffset,I.indices.byteLength/4)),v=Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(I.positions),x=1===I.positionIndicesType?Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(new Uint16Array(I.positionIndices.buffer,I.positionIndices.byteOffset,I.positionIndices.byteLength/2)):Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["slice"])(new Uint32Array(I.positionIndices.buffer,I.positionIndices.byteOffset,I.positionIndices.byteLength/4)),M={layout:r.layouts[0],interleavedVertexData:B,indices:F,hasColors:I.hasColors,hasModifications:I.hasModifications,positionData:{data:v,indices:x}};return U&&n.push(U.buffer),P&&n.push(P.buffer),n.push(B),n.push(F.buffer),n.push(v.buffer),n.push(x.buffer),{componentOffsets:P,featureIds:U,transformedGeometry:M,obb:I.obb}}function b(e){return 0===e?0:1===e?1:2===e?2:3}function m(e){const{context:t,buffer:r}=e,n=c._malloc(r.byteLength),o=r.byteLength/Float64Array.BYTES_PER_ELEMENT,s=new Float64Array(c.HEAPU8.buffer,n,o),f=new Float64Array(r);s.set(f),c.filterOBBs(t,n,o),f.set(s),c._free(n)}function d(e){c&&c.destroy(e)}function E(e,t){for(let r=0;r<t.length;++r)e[r]=t[r]}function h(){return c?Promise.resolve():(u||(u=Object(_libs_i3s_I3SModule_js__WEBPACK_IMPORTED_MODULE_2__["get"])().then((e=>{c=e,u=null}))),u)}const p={transform:y,destroy:d};


/***/ })

};;
//# sourceMappingURL=122.render-page.js.map
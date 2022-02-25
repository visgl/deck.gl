exports.ids = [90];
exports.modules = {

/***/ "../node_modules/@arcgis/core/geometry/support/buffer/types.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/buffer/types.js ***!
  \*********************************************************************/
/*! exports provided: elementTypeSize, isInteger, isSigned, maximumValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "elementTypeSize", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInteger", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSigned", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "maximumValue", function() { return c; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e){switch(e){case"u8":return 1;case"u16":return 2;case"u32":return 4;case"i8":return 1;case"i16":return 2;case"i32":case"f32":return 4;case"f64":return 8;default:return}}function r(e){switch(e){case"u8":case"u16":case"u32":return!1;case"i8":case"i16":case"i32":case"f32":case"f64":return!0;default:return}}function u(e){switch(e){case"u8":case"u16":case"u32":case"i8":case"i16":case"i32":return!0;case"f32":case"f64":return!1;default:return}}function c(e){switch(e){case"u8":return 255;case"u16":return 65535;case"u32":return 4294967295;case"i8":return 127;case"i16":return 32767;case"i32":return 2147483647;case"f32":return 3402823e32;case"f64":return 179769e303;default:return}}


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/meshUtils/deduplicate.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/meshUtils/deduplicate.js ***!
  \******************************************************************************/
/*! exports provided: deduplicate, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deduplicate", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,f,i){var u;const c=n.byteLength/(4*f),s=new Uint32Array(n,0,c*f);let a=new Uint32Array(c);const h=null!=(u=null==i?void 0:i.minReduction)?u:0,d=(null==i?void 0:i.originalIndices)||null,g=d?d.length:0,y=(null==i?void 0:i.componentOffsets)||null;let U=0;if(y)for(let t=0;t<y.length-1;t++){const n=y[t+1]-y[t];n>U&&(U=n)}else U=c;const w=Math.floor(1.1*U)+1;(null==o||o.length<2*w)&&(o=new Uint32Array(Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["nextHighestPowerOfTwo"])(2*w)));for(let t=0;t<2*w;t++)o[t]=0;let A=0;const m=!!y&&!!d,b=m?g:c,v=m?new Uint32Array(g):null,p=1.96;let M=0!==h?Math.ceil(4*p*p/(h*h)*h*(1-h)):b,q=1,j=y?y[1]:b;for(let t=0;t<b;t++){if(t===M){const n=1-A/t;if(n+p*Math.sqrt(n*(1-n)/t)<h)return null;M*=2}if(t===j){for(let t=0;t<2*w;t++)o[t]=0;if(d)for(let t=y[q-1];t<y[q];t++)v[t]=a[d[t]];j=y[++q]}const n=m?d[t]:t,l=n*f,i=r(s,l,f);let u=i%w,c=A;for(;0!==o[2*u+1];){if(o[2*u]===i){const t=o[2*u+1]-1;if(e(s,l,t*f,f)){c=a[t];break}}u++,u>=w&&(u-=w)}c===A&&(o[2*u]=i,o[2*u+1]=n+1,A++),a[n]=c}if(0!==h&&1-A/c<h)return null;if(m){for(let t=y[q-1];t<v.length;t++)v[t]=a[d[t]];a=v}const k=new Uint32Array(f*A);A=0;for(let t=0;t<b;t++)if(a[t]===A){l(s,(m?d[t]:t)*f,k,A*f,f),A++}if(d&&!m){const t=new Uint32Array(g);for(let n=0;n<t.length;n++)t[n]=a[d[n]];a=t}return{buffer:k.buffer,indices:a,uniqueCount:A}}function e(t,n,e,l){for(let r=0;r<l;r++)if(t[n+r]!==t[e+r])return!1;return!0}function l(t,n,e,l,r){for(let o=0;o<r;o++)e[l+o]=t[n+o]}function r(t,n,e){let l=0;for(let r=0;r<e;r++)l=t[n+r]+l|0,l=l+(l<<11)+(l>>>2)|0;return l>>>0}let o=null;


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

/***/ "../node_modules/@arcgis/core/views/3d/support/buffer/glUtil.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/support/buffer/glUtil.js ***!
  \**********************************************************************/
/*! exports provided: glLayout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "glLayout", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,o=0){const n=t.stride;return t.fieldNames.filter((e=>{const o=t.fields.get(e).optional;return!(o&&o.glPadding)})).map((r=>{const i=t.fields.get(r),s=i.constructor.ElementCount,u=e(i.constructor.ElementType),f=i.offset,l=!(!i.optional||!i.optional.glNormalized);return{name:r,stride:n,count:s,type:u,offset:f,normalized:l,divisor:o}}))}function e(t){const e=o[t];if(e)return e;throw new Error("BufferType not supported in WebGL")}const o={u8:5121,u16:5123,u32:5125,i8:5120,i16:5122,i32:5124,f32:5126};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/support/buffer/workerHelper.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/support/buffer/workerHelper.js ***!
  \****************************************************************************/
/*! exports provided: packInterleavedBuffer, packLayout, unpackInterleavedBuffer, unpackLayout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "packInterleavedBuffer", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "packLayout", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unpackInterleavedBuffer", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unpackLayout", function() { return G; });
/* harmony import */ var _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../geometry/support/buffer/BufferView.js */ "../node_modules/@arcgis/core/geometry/support/buffer/BufferView.js");
/* harmony import */ var _InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InterleavedLayout.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/InterleavedLayout.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function z(e,t){return t.push(e.buffer),{buffer:e.buffer,layout:F(e.layout)}}function D(e){return G(e.layout).createView(e.buffer)}function F(e){const t=new Array;return e.fields.forEach(((e,r)=>{const o={...e,constructor:J(e.constructor)};t.push([r,o])})),{stride:e.stride,fields:t,fieldNames:e.fieldNames}}function G(e){const t=Object(_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__["newLayout"])();return t.stride=e.stride,t.fieldNames=e.fieldNames,e.fields.forEach((e=>t.fields.set(e[0],{...e[1],constructor:K(e[1].constructor)}))),t}const H=[_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewFloat"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2f"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3f"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4f"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat3f"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat4f"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewFloat64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2f64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3f64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4f64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat3f64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewMat4f64"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2u8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3u8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4u8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2u16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3u16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4u16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewUint32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2u32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3u32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4u32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewInt8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2i8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3i8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4i8"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewInt16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2i16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3i16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4i16"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewInt32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec2i32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec3i32"],_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_0__["BufferViewVec4i32"]];function J(e){return`${e.ElementType}_${e.ElementCount}`}function K(e){return O.get(e)}const O=new Map;H.forEach((e=>O.set(J(e),e)));


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/support/meshProcessing.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/support/meshProcessing.js ***!
  \***********************************************************************/
/*! exports provided: computeNeighbors */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeNeighbors", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,o,n){const r=o/3,c=new Uint32Array(n+1),e=new Uint32Array(n+1),s=(t,o)=>{t<o?c[t+1]++:e[o+1]++};for(let x=0;x<r;x++){const o=t[3*x],n=t[3*x+1],r=t[3*x+2];s(o,n),s(n,r),s(r,o)}let f=0,l=0;for(let x=0;x<n;x++){const t=c[x+1],o=e[x+1];c[x+1]=f,e[x+1]=l,f+=t,l+=o}const i=new Uint32Array(6*r),a=c[n],w=(t,o,n)=>{if(t<o){const r=c[t+1]++;i[2*r]=o,i[2*r+1]=n}else{const r=e[o+1]++;i[2*a+2*r]=t,i[2*a+2*r+1]=n}};for(let x=0;x<r;x++){const o=t[3*x],n=t[3*x+1],r=t[3*x+2];w(o,n,x),w(n,r,x),w(r,o,x)}const y=(t,o)=>{const n=2*t,r=o-t;for(let c=1;c<r;c++){const t=i[n+2*c],o=i[n+2*c+1];let r=c-1;for(;r>=0&&i[n+2*r]>t;r--)i[n+2*r+2]=i[n+2*r],i[n+2*r+3]=i[n+2*r+1];i[n+2*r+2]=t,i[n+2*r+3]=o}};for(let x=0;x<n;x++)y(c[x],c[x+1]),y(a+e[x],a+e[x+1]);const A=new Int32Array(3*r),U=(o,n)=>o===t[3*n]?0:o===t[3*n+1]?1:o===t[3*n+2]?2:-1,u=(t,o)=>{const n=U(t,o);A[3*o+n]=-1},p=(t,o,n,r)=>{const c=U(t,o);A[3*o+c]=r;const e=U(n,r);A[3*r+e]=o};for(let x=0;x<n;x++){let t=c[x];const o=c[x+1];let n=e[x];const r=e[x+1];for(;t<o&&n<r;){const o=i[2*t],r=i[2*a+2*n];o===r?(p(x,i[2*t+1],r,i[2*a+2*n+1]),t++,n++):o<r?(u(x,i[2*t+1]),t++):(u(r,i[2*a+2*n+1]),n++)}for(;t<o;)u(x,i[2*t+1]),t++;for(;n<r;){u(i[2*a+2*n],i[2*a+2*n+1]),n++}}return A}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/EdgeProcessingWorker.js":
/*!****************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/EdgeProcessingWorker.js ***!
  \****************************************************************************************************/
/*! exports provided: work, wrappedWork */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "work", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrappedWork", function() { return a; });
/* harmony import */ var _geometry_support_meshUtils_deduplicate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../geometry/support/meshUtils/deduplicate.js */ "../node_modules/@arcgis/core/geometry/support/meshUtils/deduplicate.js");
/* harmony import */ var _support_meshProcessing_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../support/meshProcessing.js */ "../node_modules/@arcgis/core/views/3d/support/meshProcessing.js");
/* harmony import */ var _support_buffer_workerHelper_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../support/buffer/workerHelper.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/workerHelper.js");
/* harmony import */ var _bufferLayouts_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./bufferLayouts.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/bufferLayouts.js");
/* harmony import */ var _edgeBufferWriters_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./edgeBufferWriters.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgeBufferWriters.js");
/* harmony import */ var _edgePreprocessing_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./edgePreprocessing.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgePreprocessing.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function a(e){const t=u(e),n=f(t),r=[t.data.buffer];return{result:c(n,r),transferList:r}}function f(e){const t=g(e.data,e.skipDeduplicate,e.indices,e.indicesLength);return d.updateSettings(e.writerSettings),l.updateSettings(e.writerSettings),Object(_edgePreprocessing_js__WEBPACK_IMPORTED_MODULE_5__["extractEdges"])(t,d,l)}function u(e){return{data:_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_3__["EdgeInputBufferLayout"].createView(e.dataBuffer),indices:"Uint32Array"===e.indicesType?new Uint32Array(e.indicesBuffer):"Uint16Array"===e.indicesType?new Uint16Array(e.indicesBuffer):void 0,indicesLength:e.indicesLength,writerSettings:e.writerSettings,skipDeduplicate:e.skipDeduplicate}}function c(e,t){t.push(e.regular.lodInfo.lengths.buffer),t.push(e.silhouette.lodInfo.lengths.buffer);return{regular:{instancesData:Object(_support_buffer_workerHelper_js__WEBPACK_IMPORTED_MODULE_2__["packInterleavedBuffer"])(e.regular.instancesData,t),lodInfo:{lengths:e.regular.lodInfo.lengths.buffer}},silhouette:{instancesData:Object(_support_buffer_workerHelper_js__WEBPACK_IMPORTED_MODULE_2__["packInterleavedBuffer"])(e.silhouette.instancesData,t),lodInfo:{lengths:e.silhouette.lodInfo.lengths.buffer}},averageEdgeLength:e.averageEdgeLength}}function g(n,i,s,o){if(i){return{faces:s,facesLength:o,neighbors:Object(_support_meshProcessing_js__WEBPACK_IMPORTED_MODULE_1__["computeNeighbors"])(s,o,n.count),vertices:n}}const a=Object(_geometry_support_meshUtils_deduplicate_js__WEBPACK_IMPORTED_MODULE_0__["deduplicate"])(n.buffer,n.stride/4,{originalIndices:s,originalIndicesLength:o}),f=Object(_support_meshProcessing_js__WEBPACK_IMPORTED_MODULE_1__["computeNeighbors"])(a.indices,o,a.uniqueCount);return{faces:a.indices,facesLength:a.indices.length,neighbors:f,vertices:_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_3__["EdgeInputBufferLayout"].createView(a.buffer)}}const d=new _edgeBufferWriters_js__WEBPACK_IMPORTED_MODULE_4__["RegularEdgeBufferWriter"],l=new _edgeBufferWriters_js__WEBPACK_IMPORTED_MODULE_4__["SilhouetteEdgeBufferWriter"];


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/bufferLayouts.js":
/*!*********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/bufferLayouts.js ***!
  \*********************************************************************************************/
/*! exports provided: CommonInstancesLayout, EdgeInputBufferLayout, EdgeShaderAttributeLocations, RegularEdgeInstancesLayout, SilhouetteEdgeInstancesLayout, VertexLayout, glVertexLayout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommonInstancesLayout", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EdgeInputBufferLayout", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EdgeShaderAttributeLocations", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegularEdgeInstancesLayout", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SilhouetteEdgeInstancesLayout", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VertexLayout", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "glVertexLayout", function() { return t; });
/* harmony import */ var _support_buffer_glUtil_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../support/buffer/glUtil.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/glUtil.js");
/* harmony import */ var _support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../support/buffer/InterleavedLayout.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/InterleavedLayout.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=Object(_support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__["newLayout"])().vec3f("position").u16("componentIndex").u16("u16padding"),i=Object(_support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__["newLayout"])().vec2u8("sideness"),t=Object(_support_buffer_glUtil_js__WEBPACK_IMPORTED_MODULE_0__["glLayout"])(i),a=Object(_support_buffer_InterleavedLayout_js__WEBPACK_IMPORTED_MODULE_1__["newLayout"])().vec3f("position0").vec3f("position1").u16("componentIndex").u8("variantOffset",{glNormalized:!0}).u8("variantStroke").u8("variantExtension",{glNormalized:!0}).u8("u8padding",{glPadding:!0}).u16("u16padding",{glPadding:!0}),r=a.clone().vec3f("normal"),s=a.clone().vec3f("normalA").vec3f("normalB"),p=new Map([["position0",0],["position1",1],["componentIndex",2],["variantOffset",3],["variantStroke",4],["variantExtension",5],["normal",6],["normalA",6],["normalB",7],["sideness",8]]);


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgeBufferWriters.js":
/*!*************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgeBufferWriters.js ***!
  \*************************************************************************************************/
/*! exports provided: CommonBufferWriter, RegularEdgeBufferWriter, SilhouetteEdgeBufferWriter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommonBufferWriter", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RegularEdgeBufferWriter", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SilhouetteEdgeBufferWriter", function() { return w; });
/* harmony import */ var _core_RandomLCG_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/RandomLCG.js */ "../node_modules/@arcgis/core/core/RandomLCG.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _support_buffer_glUtil_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../support/buffer/glUtil.js */ "../node_modules/@arcgis/core/views/3d/support/buffer/glUtil.js");
/* harmony import */ var _bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./bufferLayouts.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/bufferLayouts.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class a{updateSettings(t){this.settings=t,this.edgeHashFunction=t.reducedPrecision?f:p}write(t,o,e){const n=this.edgeHashFunction(e);W.seed=n;const i=W.getIntRange(0,255),r=W.getIntRange(0,this.settings.variants-1),s=.7,a=W.getFloat(),c=255*(.5*g(-(1-Math.min(a/s,1))+Math.max(0,a-s)/(1-s),1.2)+.5);t.position0.setVec(o,e.position0),t.position1.setVec(o,e.position1),t.componentIndex.set(o,e.componentIndex),t.variantOffset.set(o,i),t.variantStroke.set(o,r),t.variantExtension.set(o,c)}trim(t,o){return t.slice(0,o)}}const c=new Float32Array(6),m=new Uint32Array(c.buffer),u=new Uint32Array(1);function p(t){const o=c;o[0]=t.position0[0],o[1]=t.position0[1],o[2]=t.position0[2],o[3]=t.position1[0],o[4]=t.position1[1],o[5]=t.position1[2],u[0]=5381;for(let e=0;e<m.length;e++)u[0]=31*u[0]+m[e];return u[0]}function f(t){const o=c;o[0]=h(t.position0[0]),o[1]=h(t.position0[1]),o[2]=h(t.position0[2]),o[3]=h(t.position1[0]),o[4]=h(t.position1[1]),o[5]=h(t.position1[2]),u[0]=5381;for(let e=0;e<m.length;e++)u[0]=31*u[0]+m[e];return u[0]}const l=1e4;function h(t){return Math.round(t*l)/l}function g(t,o){const e=t<0?-1:1;return Math.abs(t)**o*e}class d{constructor(){this.commonWriter=new a}updateSettings(t){this.commonWriter.updateSettings(t)}allocate(t){return _bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["RegularEdgeInstancesLayout"].createBuffer(t)}write(t,n,i){this.commonWriter.write(t,n,i),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["b"])(y,i.faceNormal0,i.faceNormal1),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_1__["n"])(y,y),t.normal.setVec(n,y)}trim(t,o){return this.commonWriter.trim(t,o)}}d.Layout=_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["RegularEdgeInstancesLayout"],d.glLayout=Object(_support_buffer_glUtil_js__WEBPACK_IMPORTED_MODULE_3__["glLayout"])(_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["RegularEdgeInstancesLayout"],1);class w{constructor(){this.commonWriter=new a}updateSettings(t){this.commonWriter.updateSettings(t)}allocate(t){return _bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["SilhouetteEdgeInstancesLayout"].createBuffer(t)}write(t,o,e){this.commonWriter.write(t,o,e),t.normalA.setVec(o,e.faceNormal0),t.normalB.setVec(o,e.faceNormal1)}trim(t,o){return this.commonWriter.trim(t,o)}}w.Layout=_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["SilhouetteEdgeInstancesLayout"],w.glLayout=Object(_support_buffer_glUtil_js__WEBPACK_IMPORTED_MODULE_3__["glLayout"])(_bufferLayouts_js__WEBPACK_IMPORTED_MODULE_4__["SilhouetteEdgeInstancesLayout"],1);const y=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_2__["c"])(),W=new _core_RandomLCG_js__WEBPACK_IMPORTED_MODULE_0__["default"];


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgePreprocessing.js":
/*!*************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/edgeRendering/edgePreprocessing.js ***!
  \*************************************************************************************************/
/*! exports provided: extractEdges */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractEdges", function() { return u; });
/* harmony import */ var _core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/arrayUtils.js */ "../node_modules/@arcgis/core/core/arrayUtils.js");
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=-1;function u(n,i,l,g=V){const f=n.vertices.position,m=n.vertices.componentIndex,u=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["deg2rad"])(g.anglePlanar),I=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["deg2rad"])(g.angleSignificantEdge),N=Math.cos(I),j=Math.cos(u),x=y.edge,F=x.position0,E=x.position1,U=x.faceNormal0,k=x.faceNormal1,D=w(n),M=v(n),P=M.length/4,S=i.allocate(P);let b=0;const L=P,q=l.allocate(L);let z=0,B=0,C=0;const G=Object(_core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_0__["range"])(0,P),H=new Float32Array(P);Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_2__["forEach"])(H,((e,t,n)=>{f.getVec(M[4*t+0],F),f.getVec(M[4*t+1],E),n[t]=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["i"])(F,E)})),G.sort(((e,t)=>H[t]-H[e]));const J=new Array,K=new Array;for(let e=0;e<P;e++){const t=G[e],n=H[t],o=M[4*t+0],r=M[4*t+1],g=M[4*t+2],v=M[4*t+3],w=v===p;if(f.getVec(o,F),f.getVec(r,E),w)Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["s"])(U,D[3*g+0],D[3*g+1],D[3*g+2]),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["g"])(k,U),x.componentIndex=m.get(o),x.cosAngle=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["d"])(U,k);else{if(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["s"])(U,D[3*g+0],D[3*g+1],D[3*g+2]),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["s"])(k,D[3*v+0],D[3*v+1],D[3*v+2]),x.componentIndex=m.get(o),x.cosAngle=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["d"])(U,k),d(x,j))continue;x.cosAngle<-.9999&&Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["g"])(k,U)}B+=n,C++,w||h(x,N)?(i.write(S,b++,x),J.push(n)):A(x,u)&&(l.write(q,z++,x),K.push(n))}const O=new Float32Array(J.reverse()),Q=new Float32Array(K.reverse());return{regular:{instancesData:i.trim(S,b),lodInfo:{lengths:O}},silhouette:{instancesData:l.trim(q,z),lodInfo:{lengths:Q}},averageEdgeLength:B/C}}function h(e,t){return e.cosAngle<t}function d(e,t){return e.cosAngle>t}function A(e,t){const o=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["acosClamped"])(e.cosAngle),r=y.fwd,s=y.ortho;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["r"])(r,e.position1,e.position0);return o*(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["d"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["c"])(s,e.faceNormal0,e.faceNormal1),r)>0?-1:1)>t}function v(e){const t=e.faces.length/3,n=e.faces,o=e.neighbors;let r=0;for(let a=0;a<t;a++){const e=o[3*a+0],t=o[3*a+1],s=o[3*a+2],c=n[3*a+0],i=n[3*a+1],l=n[3*a+2];r+=e===p||c<i?1:0,r+=t===p||i<l?1:0,r+=s===p||l<c?1:0}const s=new Int32Array(4*r);let c=0;for(let a=0;a<t;a++){const e=o[3*a+0],t=o[3*a+1],r=o[3*a+2],i=n[3*a+0],l=n[3*a+1],g=n[3*a+2];(e===p||i<l)&&(s[c++]=i,s[c++]=l,s[c++]=a,s[c++]=e),(t===p||l<g)&&(s[c++]=l,s[c++]=g,s[c++]=a,s[c++]=t),(r===p||g<i)&&(s[c++]=g,s[c++]=i,s[c++]=a,s[c++]=r)}return s}function w(e){const t=e.faces.length/3,n=e.vertices.position,o=e.faces,r=I.v0,s=I.v1,c=I.v2,a=new Float32Array(3*t);for(let i=0;i<t;i++){const e=o[3*i+0],t=o[3*i+1],m=o[3*i+2];n.getVec(e,r),n.getVec(t,s),n.getVec(m,c),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["f"])(s,s,r),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["f"])(c,c,r),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["c"])(r,s,c),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_3__["n"])(r,r),a[3*i+0]=r[0],a[3*i+1]=r[1],a[3*i+2]=r[2]}return a}const y={edge:{position0:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),position1:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),faceNormal0:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),faceNormal1:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),componentIndex:0,cosAngle:0},ortho:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),fwd:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])()},I={v0:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),v1:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])(),v2:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_4__["c"])()},V={anglePlanar:4,angleSignificantEdge:35};


/***/ })

};;
//# sourceMappingURL=90.render-page.js.map
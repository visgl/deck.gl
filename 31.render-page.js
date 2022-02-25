exports.ids = [31];
exports.modules = {

/***/ "../node_modules/@arcgis/core/chunks/mat32.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/mat32.js ***!
  \****************************************************/
/*! exports provided: c, m */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,t,r){const d=e.typedBuffer,f=e.typedBufferStride,n=t.typedBuffer,o=t.typedBufferStride,c=r?r.count:t.count;let u=(r&&r.dstIndex?r.dstIndex:0)*f,p=(r&&r.srcIndex?r.srcIndex:0)*o;for(let s=0;s<c;++s){for(let e=0;e<9;++e)d[u+e]=n[p+e];u+=f,p+=o}}var t=Object.freeze({__proto__:null,copy:e});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/mat42.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/mat42.js ***!
  \****************************************************/
/*! exports provided: c, m */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,t,r){const d=e.typedBuffer,f=e.typedBufferStride,n=t.typedBuffer,o=t.typedBufferStride,c=r?r.count:t.count;let u=(r&&r.dstIndex?r.dstIndex:0)*f,p=(r&&r.srcIndex?r.srcIndex:0)*o;for(let s=0;s<c;++s){for(let e=0;e<16;++e)d[u+e]=n[p+e];u+=f,p+=o}}var t=Object.freeze({__proto__:null,copy:e});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/scalar.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/scalar.js ***!
  \*****************************************************/
/*! exports provided: c, m, s */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return r; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,t,r){const n=e.typedBuffer,o=e.typedBufferStride,c=t.typedBuffer,d=t.typedBufferStride,f=r?r.count:t.count;let s=(r&&r.dstIndex?r.dstIndex:0)*o,u=(r&&r.srcIndex?r.srcIndex:0)*d;for(let p=0;p<f;++p)n[s]=c[u],s+=o,u+=d}function t(e,t){const r=e.count;t||(t=new e.TypedArrayConstructor(r));for(let n=0;n<r;n++)t[n]=e.get(n);return t}var r=Object.freeze({__proto__:null,copy:e,makeDense:t});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec22.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec22.js ***!
  \****************************************************/
/*! exports provided: c, f, n, v */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return o; });
/* harmony import */ var _geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry/support/buffer/types.js */ "../node_modules/@arcgis/core/geometry/support/buffer/types.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function f(e,t,r){const f=e.typedBuffer,n=e.typedBufferStride,d=t.typedBuffer,o=t.typedBufferStride,u=r?r.count:t.count;let l=(r&&r.dstIndex?r.dstIndex:0)*n,s=(r&&r.srcIndex?r.srcIndex:0)*o;for(let c=0;c<u;++c)f[l]=d[s],f[l+1]=d[s+1],l+=n,s+=o}function n(n,d,o){const u=n.typedBuffer,l=n.typedBufferStride,s=d.typedBuffer,c=d.typedBufferStride,p=o?o.count:d.count;let y=(o&&o.dstIndex?o.dstIndex:0)*l,i=(o&&o.srcIndex?o.srcIndex:0)*c;if(Object(_geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_0__["isInteger"])(d.elementType)){const e=Object(_geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_0__["maximumValue"])(d.elementType);if(Object(_geometry_support_buffer_types_js__WEBPACK_IMPORTED_MODULE_0__["isSigned"])(d.elementType))for(let t=0;t<p;++t)u[y]=Math.max(s[i]/e,-1),u[y+1]=Math.max(s[i+1]/e,-1),y+=l,i+=c;else for(let t=0;t<p;++t)u[y]=s[i]/e,u[y+1]=s[i+1]/e,y+=l,i+=c}else f(n,d,o);return n}function d(e,t,r,f){var n,d;const o=e.typedBuffer,u=e.typedBufferStride,l=null!=(n=null==f?void 0:f.count)?n:e.count;let s=(null!=(d=null==f?void 0:f.dstIndex)?d:0)*u;for(let c=0;c<l;++c)o[s]=t,o[s+1]=r,s+=u}var o=Object.freeze({__proto__:null,copy:f,normalizeIntegerBuffer:n,fill:d});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec42.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec42.js ***!
  \****************************************************/
/*! exports provided: a, b, s, t, v */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return n; });
/* harmony import */ var _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry/support/buffer/math/common.js */ "../node_modules/@arcgis/core/geometry/support/buffer/math/common.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,r,f){if(t.count!==r.count)return void _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__["logger"].error("source and destination buffers need to have the same number of elements");const o=t.count,n=f[0],u=f[1],d=f[2],s=f[3],c=f[4],i=f[5],a=f[6],p=f[7],y=f[8],m=f[9],B=f[10],h=f[11],l=f[12],S=f[13],b=f[14],v=f[15],M=t.typedBuffer,_=t.typedBufferStride,g=r.typedBuffer,j=r.typedBufferStride;for(let e=0;e<o;e++){const t=e*_,r=e*j,f=g[r],o=g[r+1],x=g[r+2],z=g[r+3];M[t]=n*f+c*o+y*x+l*z,M[t+1]=u*f+i*o+m*x+S*z,M[t+2]=d*f+a*o+B*x+b*z,M[t+3]=s*f+p*o+h*x+v*z}}function r(t,r,f){if(t.count!==r.count)return void _geometry_support_buffer_math_common_js__WEBPACK_IMPORTED_MODULE_0__["logger"].error("source and destination buffers need to have the same number of elements");const o=t.count,n=f[0],u=f[1],d=f[2],s=f[3],c=f[4],i=f[5],a=f[6],p=f[7],y=f[8],m=t.typedBuffer,B=t.typedBufferStride,h=r.typedBuffer,l=r.typedBufferStride;for(let e=0;e<o;e++){const t=e*B,r=e*l,f=h[r],o=h[r+1],S=h[r+2],b=h[r+3];m[t]=n*f+s*o+a*S,m[t+1]=u*f+c*o+p*S,m[t+2]=d*f+i*o+y*S,m[t+3]=b}}function f(e,t,r){const f=Math.min(e.count,t.count),o=e.typedBuffer,n=e.typedBufferStride,u=t.typedBuffer,d=t.typedBufferStride;for(let s=0;s<f;s++){const e=s*n,t=s*d;o[e]=r*u[t],o[e+1]=r*u[t+1],o[e+2]=r*u[t+2],o[e+3]=r*u[t+3]}}function o(e,t,r){const f=Math.min(e.count,t.count),o=e.typedBuffer,n=e.typedBufferStride,u=t.typedBuffer,d=t.typedBufferStride;for(let s=0;s<f;s++){const e=s*n,t=s*d;o[e]=u[t]>>r,o[e+1]=u[t+1]>>r,o[e+2]=u[t+2]>>r,o[e+3]=u[t+3]>>r}}var n=Object.freeze({__proto__:null,transformMat4:t,transformMat3:r,scale:f,shiftRight:o});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/vec43.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/vec43.js ***!
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
function e(e,t,n){const d=e.typedBuffer,f=e.typedBufferStride,r=t.typedBuffer,u=t.typedBufferStride,l=n?n.count:t.count;let o=(n&&n.dstIndex?n.dstIndex:0)*f,c=(n&&n.srcIndex?n.srcIndex:0)*u;for(let s=0;s<l;++s)d[o]=r[c],d[o+1]=r[c+1],d[o+2]=r[c+2],d[o+3]=r[c+3],o+=f,c+=u}function t(e,t,n,d,f,r){var u,l;const o=e.typedBuffer,c=e.typedBufferStride,s=null!=(u=null==r?void 0:r.count)?u:e.count;let p=(null!=(l=null==r?void 0:r.dstIndex)?l:0)*c;for(let i=0;i<s;++i)o[p]=t,o[p+1]=n,o[p+2]=d,o[p+3]=f,p+=c}var n=Object.freeze({__proto__:null,copy:e,fill:t});


/***/ }),

/***/ "../node_modules/@arcgis/core/core/MapUtils.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/core/MapUtils.js ***!
  \*****************************************************/
/*! exports provided: findInMap, getOrCreateMapValue, someMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findInMap", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOrCreateMapValue", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "someMap", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,t){for(const[r,o]of n)if(t(o,r))return!0;return!1}function t(n,t){for(const[r,o]of n)if(t(o,r))return o;return null}function r(n,t,r){const o=n.get(t);if(void 0!==o)return o;const f=r();return n.set(t,f),f}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/Version.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/core/Version.js ***!
  \****************************************************/
/*! exports provided: Version */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Version", function() { return r; });
/* harmony import */ var _Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class r{constructor(t,r,o=""){this.major=t,this.minor=r,this._context=o}lessThan(t,r){return this.major<t||t===this.major&&this.minor<r}since(t,r){return!this.lessThan(t,r)}validate(r){if(this.major!==r.major){const o=this._context&&this._context+":",s=this._context&&this._context+" ";throw new _Error_js__WEBPACK_IMPORTED_MODULE_0__["default"](o+"unsupported-version",`Required major ${s}version is '${this.major}', but got '\${version.major}.\${version.minor}'`,{version:r})}}clone(){return new r(this.major,this.minor,this._context)}static parse(o,s=""){const[e,i]=o.split("."),n=/^\s*\d+\s*$/;if(!e||!e.match||!e.match(n)){throw new _Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]((s&&s+":")+"invalid-version","Expected major version to be a number, but got '${version}'",{version:o})}if(!i||!i.match||!i.match(n)){throw new _Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]((s&&s+":")+"invalid-version","Expected minor version to be a number, but got '${version}'",{version:o})}const a=parseInt(e,10),h=parseInt(i,10);return new r(a,h,s)}}


/***/ }),

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

/***/ "../node_modules/@arcgis/core/geometry/support/buffer/utils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/buffer/utils.js ***!
  \*********************************************************************/
/*! exports provided: mat3, mat4, scalar, vec2, vec3, vec4, createBuffer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBuffer", function() { return r; });
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types.js */ "../node_modules/@arcgis/core/geometry/support/buffer/types.js");
/* harmony import */ var _chunks_mat32_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../chunks/mat32.js */ "../node_modules/@arcgis/core/chunks/mat32.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mat3", function() { return _chunks_mat32_js__WEBPACK_IMPORTED_MODULE_1__["m"]; });

/* harmony import */ var _chunks_mat42_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../chunks/mat42.js */ "../node_modules/@arcgis/core/chunks/mat42.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mat4", function() { return _chunks_mat42_js__WEBPACK_IMPORTED_MODULE_2__["m"]; });

/* harmony import */ var _chunks_scalar_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../chunks/scalar.js */ "../node_modules/@arcgis/core/chunks/scalar.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "scalar", function() { return _chunks_scalar_js__WEBPACK_IMPORTED_MODULE_3__["s"]; });

/* harmony import */ var _chunks_vec22_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../chunks/vec22.js */ "../node_modules/@arcgis/core/chunks/vec22.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "vec2", function() { return _chunks_vec22_js__WEBPACK_IMPORTED_MODULE_4__["v"]; });

/* harmony import */ var _chunks_vec33_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../chunks/vec33.js */ "../node_modules/@arcgis/core/chunks/vec33.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "vec3", function() { return _chunks_vec33_js__WEBPACK_IMPORTED_MODULE_5__["v"]; });

/* harmony import */ var _chunks_vec43_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../chunks/vec43.js */ "../node_modules/@arcgis/core/chunks/vec43.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "vec4", function() { return _chunks_vec43_js__WEBPACK_IMPORTED_MODULE_6__["v"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(s,r){return new s(new ArrayBuffer(r*s.ElementCount*Object(_types_js__WEBPACK_IMPORTED_MODULE_0__["elementTypeSize"])(s.ElementType)))}


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/lineSegment.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/lineSegment.js ***!
  \********************************************************************/
/*! exports provided: closestLineSegmentDistance2, closestLineSegmentPoint, closestRayDistance2, copy, create, distance, distance2, fromPoints, fromValues, pointAt, projectPoint, projectPointClamp, wrap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closestLineSegmentDistance2", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closestLineSegmentPoint", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "closestRayDistance2", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance2", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromPoints", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pointAt", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "projectPoint", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "projectPointClamp", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return p; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_ObjectStack_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/ObjectStack.js */ "../node_modules/@arcgis/core/core/ObjectStack.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vectorStacks.js */ "../node_modules/@arcgis/core/geometry/support/vectorStacks.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function v(t){return t?{origin:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["a"])(t.origin),vector:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["a"])(t.vector)}:{origin:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),vector:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])()}}function p(t,r){const n=x.get();return n.origin=t,n.vector=r,n}function h(t,r=v()){return m(t.origin,t.vector,r)}function m(t,r,o=v()){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(o.origin,t),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(o.vector,r),o}function l(t,r,i=v()){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(i.origin,t),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(i.vector,r,t),i}function b(r,n){const c=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),n,r.origin),u=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(r.vector,c),s=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(r.vector,r.vector),a=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])(u/s,0,1),g=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),r.vector,a),c);return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(g,g)}function M(t,r){return Math.sqrt(b(t,r))}function d(t,r,n){return A(t,r,0,1,n)}function j(t,r,n){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(n,t.origin,Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(n,t.vector,r))}function A(r,n,s,a,g){const{vector:v,origin:p}=r,h=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),n,p),m=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(v,h)/Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["p"])(v);return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(g,v,Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])(m,s,a)),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(g,g,r.origin)}function B(t,r){if(q(t,p(r.origin,r.direction),!1,w)){const{tA:r,pB:n,distance2:o}=w;if(r>=0&&r<=1)return o;if(r<0)return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["h"])(t.origin,n);if(r>1)return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["h"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),t.origin,t.vector),n)}return null}function k(t,r,o){return!!q(t,r,!0,w)&&(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(o,w.pA),!0)}function S(t,r){return q(t,r,!0,w)?w.distance2:null}function q(r,n,o,i){const e=1e-6,u=r.origin,a=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),u,r.vector),g=n.origin,v=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),g,n.vector),p=_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),h=_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get();if(p[0]=u[0]-g[0],p[1]=u[1]-g[1],p[2]=u[2]-g[2],h[0]=v[0]-g[0],h[1]=v[1]-g[1],h[2]=v[2]-g[2],Math.abs(h[0])<e&&Math.abs(h[1])<e&&Math.abs(h[2])<e)return!1;const m=_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get();if(m[0]=a[0]-u[0],m[1]=a[1]-u[1],m[2]=a[2]-u[2],Math.abs(m[0])<e&&Math.abs(m[1])<e&&Math.abs(m[2])<e)return!1;const l=p[0]*h[0]+p[1]*h[1]+p[2]*h[2],b=h[0]*m[0]+h[1]*m[1]+h[2]*m[2],M=p[0]*m[0]+p[1]*m[1]+p[2]*m[2],d=h[0]*h[0]+h[1]*h[1]+h[2]*h[2],j=(m[0]*m[0]+m[1]*m[1]+m[2]*m[2])*d-b*b;if(Math.abs(j)<e)return!1;let A=(l*b-M*d)/j,B=(l+b*A)/d;o&&(A=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])(A,0,1),B=Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["clamp"])(B,0,1));const k=_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get(),S=_vectorStacks_js__WEBPACK_IMPORTED_MODULE_4__["sv3d"].get();return k[0]=u[0]+A*m[0],k[1]=u[1]+A*m[1],k[2]=u[2]+A*m[2],S[0]=g[0]+B*h[0],S[1]=g[1]+B*h[1],S[2]=g[2]+B*h[2],i.tA=A,i.tB=B,i.pA=k,i.pB=S,i.distance2=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["h"])(k,S),!0}const w={tA:0,tB:0,pA:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),pB:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),distance2:0},x=new _core_ObjectStack_js__WEBPACK_IMPORTED_MODULE_1__["ObjectStack"]((()=>({origin:null,vector:null})));


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/triangle.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/triangle.js ***!
  \*****************************************************************/
/*! exports provided: area2d, areaPoints2d, areaPoints3d, copy, create, distance2, fromValues, intersectRay, wrap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "area2d", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "areaPoints2d", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "areaPoints3d", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copy", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "distance2", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectRay", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return h; });
/* harmony import */ var _core_ObjectStack_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/ObjectStack.js */ "../node_modules/@arcgis/core/core/ObjectStack.js");
/* harmony import */ var _chunks_vec2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/vec2.js */ "../node_modules/@arcgis/core/chunks/vec2.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _lineSegment_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lineSegment.js */ "../node_modules/@arcgis/core/geometry/support/lineSegment.js");
/* harmony import */ var _vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vectorStacks.js */ "../node_modules/@arcgis/core/geometry/support/vectorStacks.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function j(t){return t?{p0:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["a"])(t.p0),p1:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["a"])(t.p1),p2:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["a"])(t.p2)}:{p0:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),p1:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),p2:Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])()}}function h(t,n,r){const e=x.get();return e.p0=t,e.p1=n,e.p2=r,e}function k(t,n=j()){return d(t.p0,t.p1,t.p2,n)}function d(t,n,e,p=j()){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(p.p0,t),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(p.p1,n),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["g"])(p.p2,e),p}function v(t,n){const r=t.p0,s=t.p1,c=t.p2,u=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),s,r),i=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),c,s),f=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),r,c),a=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),n,r),j=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),n,s),h=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),n,c),k=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(u,u,f),d=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),u,k),a),v=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),i,k),j),S=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(_vectorStacks_js__WEBPACK_IMPORTED_MODULE_5__["sv3d"].get(),f,k),h);if(d>0&&v>0&&S>0){const t=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(k,a);return t*t/Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["d"])(k,k)}const b=Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["distance2"])(Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["fromValues"])(r,u,q.get()),n),w=Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["distance2"])(Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["fromValues"])(s,i,q.get()),n),M=Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["distance2"])(Object(_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["fromValues"])(c,f,q.get()),n);return Math.min(b,w,M)}function S(t,n,r){const e=1e-5,{direction:p,origin:o}=n,{p0:u,p1:i,p2:f}=t,a=i[0]-u[0],g=i[1]-u[1],m=i[2]-u[2],l=f[0]-u[0],j=f[1]-u[1],h=f[2]-u[2],k=p[1]*h-j*p[2],d=p[2]*l-h*p[0],v=p[0]*j-l*p[1],S=a*k+g*d+m*v;if(S>-e&&S<e)return!1;const b=1/S,w=o[0]-u[0],M=o[1]-u[1],q=o[2]-u[2],x=b*(w*k+M*d+q*v);if(x<0||x>1)return!1;const O=M*m-g*q,V=q*a-m*w,y=w*g-a*M,z=b*(p[0]*O+p[1]*V+p[2]*y);if(z<0||x+z>1)return!1;if(r){Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["a"])(r,p,b*(l*O+j*V+h*y)),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["b"])(r,o,r)}return!0}function b(t,r,e){const p=Object(_chunks_vec2_js__WEBPACK_IMPORTED_MODULE_1__["d"])(t,r),o=Object(_chunks_vec2_js__WEBPACK_IMPORTED_MODULE_1__["d"])(r,e),s=Object(_chunks_vec2_js__WEBPACK_IMPORTED_MODULE_1__["d"])(e,t),c=(p+o+s)/2,u=c*(c-p)*(c-o)*(c-s);return u<=0?0:Math.sqrt(u)}function w(t){return b(t.p0,t.p1,t.p2)}function M(t,n,r){return Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(O,n,t),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["f"])(V,r,t),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["l"])(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_2__["c"])(O,O,V))/2}const q=new _core_ObjectStack_js__WEBPACK_IMPORTED_MODULE_0__["ObjectStack"](_lineSegment_js__WEBPACK_IMPORTED_MODULE_4__["create"]),x=new _core_ObjectStack_js__WEBPACK_IMPORTED_MODULE_0__["ObjectStack"]((()=>({p0:null,p1:null,p2:null}))),O=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])(),V=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_3__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/DefaultErrorContext.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/DefaultErrorContext.js ***!
  \*************************************************************************/
/*! exports provided: DefaultErrorContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultErrorContext", function() { return t; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.views.3d.glTF");class t{error(e){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("gltf-loader-error",e)}errorUnsupported(e){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("gltf-loader-unsupported-feature",e)}errorUnsupportedIf(r,e){r&&this.errorUnsupported(e)}assert(r,e){r||this.error(e)}warn(r){o.warn(r)}warnUnsupported(r){this.warn("[Unsupported Feature] "+r)}warnUnsupportedIf(r,e){r&&this.warnUnsupported(e)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/DefaultLoadingContext.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/DefaultLoadingContext.js ***!
  \***************************************************************************/
/*! exports provided: DefaultLoadingContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultLoadingContext", function() { return n; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class n{constructor(r){this.streamDataRequester=r}async loadJSON(r,e){return this.load("json",r,e)}async loadBinary(r,e){return Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__["isDataProtocol"])(r)?(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["throwIfAborted"])(e),Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__["dataToArrayBuffer"])(r)):this.load("binary",r,e)}async loadImage(r,e){return this.load("image",r,e)}async load(t,i,m){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(this.streamDataRequester))return(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(i,{responseType:c[t]})).data;const n=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_1__["result"])(this.streamDataRequester.request(i,t,m));if(!0===n.ok)return n.value;throw Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["throwIfAbortError"])(n.error),new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("",`Request for resource failed: ${n.error}`)}}const c={image:"image",binary:"array-buffer",json:"json"};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/LoaderResult.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/LoaderResult.js ***!
  \******************************************************************/
/*! exports provided: makeMaterialParameters, makeTextureSource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeMaterialParameters", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeTextureSource", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e={}){return{color:[1,1,1],opacity:1,alphaMode:"OPAQUE",alphaCutoff:.5,doubleSided:!1,castShadows:!0,receiveShadows:!0,receiveAmbientOcclustion:!0,textureColor:null,textureNormal:null,textureOcclusion:null,textureEmissive:null,textureMetallicRoughness:null,emissiveFactor:[0,0,0],metallicFactor:1,roughnessFactor:1,colorMixMode:"multiply",...e}}function t(e,t={}){return{data:e,parameters:{wrap:{s:10497,t:10497,...t.wrap},noUnpackFlip:!0,mipmap:!1,...t}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/internal/BinaryStreamReader.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/internal/BinaryStreamReader.js ***!
  \*********************************************************************************/
/*! exports provided: BinaryStreamReader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BinaryStreamReader", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t){this.data=t,this.offset4=0,this.dataUint32=new Uint32Array(this.data,0,Math.floor(this.data.byteLength/4))}readUint32(){const t=this.offset4;return this.offset4+=1,this.dataUint32[t]}readUint8Array(t){const s=4*this.offset4;return this.offset4+=t/4,new Uint8Array(this.data,s,t)}remainingBytes(){return this.data.byteLength-4*this.offset4}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/internal/Resource.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/internal/Resource.js ***!
  \***********************************************************************/
/*! exports provided: Resource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Resource", function() { return G; });
/* harmony import */ var _core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/compilerUtils.js */ "../node_modules/@arcgis/core/core/compilerUtils.js");
/* harmony import */ var _core_MapUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/MapUtils.js */ "../node_modules/@arcgis/core/core/MapUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_Version_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../core/Version.js */ "../node_modules/@arcgis/core/core/Version.js");
/* harmony import */ var _chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../chunks/mat4.js */ "../node_modules/@arcgis/core/chunks/mat4.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _chunks_quat_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../chunks/quat.js */ "../node_modules/@arcgis/core/chunks/quat.js");
/* harmony import */ var _chunks_quatf64_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../chunks/quatf64.js */ "../node_modules/@arcgis/core/chunks/quatf64.js");
/* harmony import */ var _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../geometry/support/buffer/BufferView.js */ "../node_modules/@arcgis/core/geometry/support/buffer/BufferView.js");
/* harmony import */ var _chunks_scalar_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../chunks/scalar.js */ "../node_modules/@arcgis/core/chunks/scalar.js");
/* harmony import */ var _BinaryStreamReader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BinaryStreamReader.js */ "../node_modules/@arcgis/core/views/3d/glTF/internal/BinaryStreamReader.js");
/* harmony import */ var _fillDefaults_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./fillDefaults.js */ "../node_modules/@arcgis/core/views/3d/glTF/internal/fillDefaults.js");
/* harmony import */ var _pathUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./pathUtils.js */ "../node_modules/@arcgis/core/views/3d/glTF/internal/pathUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const D={MAGIC:1179937895,CHUNK_TYPE_JSON:1313821514,CHUNK_TYPE_BIN:5130562,MIN_HEADER_LENGTH:20};class G{constructor(e,t,r,n,s){this.context=e,this.errorContext=t,this.uri=r,this.json=n,this.glbBuffer=s,this.bufferLoaders=new Map,this.textureLoaders=new Map,this.textureCache=new Map,this.materialCache=new Map,this.nodeParentMap=new Map,this.nodeTransformCache=new Map,this.baseUri=Object(_pathUtils_js__WEBPACK_IMPORTED_MODULE_12__["splitURI"])(this.uri).dirPart,this.checkVersionSupported(),this.checkRequiredExtensionsSupported(),t.errorUnsupportedIf(null==n.scenes,"Scenes must be defined."),t.errorUnsupportedIf(null==n.meshes,"Meshes must be defined"),t.errorUnsupportedIf(null==n.nodes,"Nodes must be defined."),this.computeNodeParents()}static async load(e,t,o,a){if(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["isDataProtocol"])(o)){const r=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["dataComponents"])(o);if("model/gltf-binary"!==r.mediaType)try{const n=JSON.parse(r.isBase64?atob(r.data):r.data);return new G(e,t,o,n)}catch{}const a=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["dataToArrayBuffer"])(o);if(G.isGLBData(a))return this.fromGLBData(e,t,o,a)}if(o.endsWith(".gltf")){const r=await e.loadJSON(o,a);return new G(e,t,o,r)}const i=await e.loadBinary(o,a);if(G.isGLBData(i))return this.fromGLBData(e,t,o,i);const u=await e.loadJSON(o,a);return new G(e,t,o,u)}static isGLBData(e){const t=new _BinaryStreamReader_js__WEBPACK_IMPORTED_MODULE_10__["BinaryStreamReader"](e);return t.remainingBytes()>=4&&t.readUint32()===D.MAGIC}static async fromGLBData(e,t,r,n){const s=await G.parseGLBData(t,n);return new G(e,t,r,s.json,s.binaryData)}static async parseGLBData(e,t){const r=new _BinaryStreamReader_js__WEBPACK_IMPORTED_MODULE_10__["BinaryStreamReader"](t);e.assert(r.remainingBytes()>=12,"GLB binary data is insufficiently large.");const n=r.readUint32(),s=r.readUint32(),o=r.readUint32();e.assert(n===D.MAGIC,"Magic first 4 bytes do not fit to expected GLB value."),e.assert(t.byteLength>=o,"GLB binary data is smaller than header specifies."),e.errorUnsupportedIf(2!==s,"An unsupported GLB container version was detected. Only version 2 is supported.");let a,i,u=0;for(;r.remainingBytes()>=8;){const t=r.readUint32(),n=r.readUint32();0===u?(e.assert(n===D.CHUNK_TYPE_JSON,"First GLB chunk must be JSON."),e.assert(t>=0,"No JSON data found."),a=await q(r.readUint8Array(t))):1===u?(e.errorUnsupportedIf(n!==D.CHUNK_TYPE_BIN,"Second GLB chunk expected to be BIN."),i=r.readUint8Array(t)):e.warnUnsupported("More than 2 GLB chunks detected. Skipping."),u+=1}return a||e.error("No GLB JSON chunk detected."),{json:a,binaryData:i}}async getBuffer(e,t){const r=this.json.buffers[e],n=this.errorContext;if(null==r.uri)return n.assert(null!=this.glbBuffer,"GLB buffer not present"),this.glbBuffer;const s=await this.getBufferLoader(e,t);return n.assert(s.byteLength===r.byteLength,"Buffer byte lengths should match."),s}async getBufferLoader(e,t){const r=this.bufferLoaders.get(e);if(r)return r;const n=this.json.buffers[e],s=this.context.loadBinary(this.resolveUri(n.uri),t).then((e=>new Uint8Array(e)));return this.bufferLoaders.set(e,s),s}async getAccessor(e,t){const r=this.errorContext;r.errorUnsupportedIf(!this.json.accessors,"Accessors missing.");const n=this.json.accessors[e];r.errorUnsupportedIf(null==(null==n?void 0:n.bufferView),"Some accessor does not specify a bufferView."),r.errorUnsupportedIf(n.type in["MAT2","MAT3","MAT4"],`AttributeType ${n.type} is not supported`);const s=this.json.bufferViews[n.bufferView],o=await this.getBuffer(s.buffer,t),a=k[n.type],i=V[n.componentType],u=a*i,c=s.byteStride||u;return{raw:o.buffer,byteStride:c,byteOffset:o.byteOffset+(s.byteOffset||0)+(n.byteOffset||0),entryCount:n.count,isDenselyPacked:c===u,componentCount:a,componentByteSize:i,componentType:n.componentType,min:n.min,max:n.max,normalized:!!n.normalized}}async getIndexData(e,t){if(null==e.indices)return null;const r=await this.getAccessor(e.indices,t);if(r.isDenselyPacked)switch(r.componentType){case 5121:return new Uint8Array(r.raw,r.byteOffset,r.entryCount);case 5123:return new Uint16Array(r.raw,r.byteOffset,r.entryCount);case 5125:return new Uint32Array(r.raw,r.byteOffset,r.entryCount)}else switch(r.componentType){case 5121:return Object(_chunks_scalar_js__WEBPACK_IMPORTED_MODULE_9__["m"])(this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewUint8"],r));case 5123:return Object(_chunks_scalar_js__WEBPACK_IMPORTED_MODULE_9__["m"])(this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewUint16"],r));case 5125:return Object(_chunks_scalar_js__WEBPACK_IMPORTED_MODULE_9__["m"])(this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewUint32"],r))}}async getPositionData(e,t){const r=this.errorContext;r.errorUnsupportedIf(null==e.attributes.POSITION,"No POSITION vertex data found.");const n=await this.getAccessor(e.attributes.POSITION,t);return r.errorUnsupportedIf(5126!==n.componentType,"Expected type FLOAT for POSITION vertex attribute, but found "+X[n.componentType]),r.errorUnsupportedIf(3!==n.componentCount,"POSITION vertex attribute must have 3 components, but found "+n.componentCount.toFixed()),this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec3f"],n)}async getNormalData(e,t){const r=this.errorContext;r.assert(null!=e.attributes.NORMAL,"No NORMAL vertex data found.");const n=await this.getAccessor(e.attributes.NORMAL,t);return r.errorUnsupportedIf(5126!==n.componentType,"Expected type FLOAT for NORMAL vertex attribute, but found "+X[n.componentType]),r.errorUnsupportedIf(3!==n.componentCount,"NORMAL vertex attribute must have 3 components, but found "+n.componentCount.toFixed()),this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec3f"],n)}async getTangentData(e,t){const r=this.errorContext;r.assert(null!=e.attributes.TANGENT,"No TANGENT vertex data found.");const n=await this.getAccessor(e.attributes.TANGENT,t);return r.errorUnsupportedIf(5126!==n.componentType,"Expected type FLOAT for TANGENT vertex attribute, but found "+X[n.componentType]),r.errorUnsupportedIf(4!==n.componentCount,"TANGENT vertex attribute must have 4 components, but found "+n.componentCount.toFixed()),new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec4f"](n.raw,n.byteOffset,n.byteStride,n.byteOffset+n.byteStride*n.entryCount)}async getTextureCoordinates(e,t){const r=this.errorContext;r.assert(null!=e.attributes.TEXCOORD_0,"No TEXCOORD_0 vertex data found.");const n=await this.getAccessor(e.attributes.TEXCOORD_0,t);return r.errorUnsupportedIf(2!==n.componentCount,"TEXCOORD_0 vertex attribute must have 2 components, but found "+n.componentCount.toFixed()),5126===n.componentType?this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2f"],n):(r.errorUnsupportedIf(!n.normalized,"Integer component types are only supported for a normalized accessor for TEXCOORD_0."),J(n))}async getVertexColors(e,t){const r=this.errorContext;r.assert(null!=e.attributes.COLOR_0,"No COLOR_0 vertex data found.");const n=await this.getAccessor(e.attributes.COLOR_0,t);if(r.errorUnsupportedIf(4!==n.componentCount&&3!==n.componentCount,"COLOR_0 attribute must have 3 or 4 components, but found "+n.componentCount.toFixed()),4===n.componentCount){if(5126===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec4f"],n);if(5121===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec4u8"],n);if(5123===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec4u16"],n)}else if(3===n.componentCount){if(5126===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec3f"],n);if(5121===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec3u8"],n);if(5123===n.componentType)return this.wrapAccessor(_geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec3u16"],n)}r.errorUnsupported("Unsupported component type for COLOR_0 attribute: "+X[n.componentType])}hasPositions(e){return void 0!==e.attributes.POSITION}hasNormals(e){return void 0!==e.attributes.NORMAL}hasVertexColors(e){return void 0!==e.attributes.COLOR_0}hasTextureCoordinates(e){return void 0!==e.attributes.TEXCOORD_0}hasTangents(e){return void 0!==e.attributes.TANGENT}async getMaterial(e,t,r){let n=this.materialCache.get(e.material);if(!n){const s=null!=e.material?Object(_fillDefaults_js__WEBPACK_IMPORTED_MODULE_11__["material"])(this.json.materials[e.material]):Object(_fillDefaults_js__WEBPACK_IMPORTED_MODULE_11__["material"])(),o=s.pbrMetallicRoughness,a=this.hasVertexColors(e),i=this.getTexture(o.baseColorTexture,t),u=this.getTexture(s.normalTexture,t),c=r?this.getTexture(s.occlusionTexture,t):null,p=r?this.getTexture(s.emissiveTexture,t):null,f=r?this.getTexture(o.metallicRoughnessTexture,t):null,d=null!=e.material?e.material:-1;n={alphaMode:s.alphaMode,alphaCutoff:s.alphaCutoff,color:o.baseColorFactor,doubleSided:!!s.doubleSided,colorTexture:await i,normalTexture:await u,name:s.name,id:d,occlusionTexture:await c,emissiveTexture:await p,emissiveFactor:s.emissiveFactor,metallicFactor:o.metallicFactor,roughnessFactor:o.roughnessFactor,metallicRoughnessTexture:await f,vertexColors:a,ESRI_externalColorMixMode:s.extras.ESRI_externalColorMixMode}}return n}async getTexture(e,r){if(!e)return null;this.errorContext.errorUnsupportedIf(0!==(e.texCoord||0),"Only TEXCOORD with index 0 is supported.");const n=e.index,s=this.errorContext,o=this.json.textures[n],a=Object(_fillDefaults_js__WEBPACK_IMPORTED_MODULE_11__["textureSampler"])(null!=o.sampler?this.json.samplers[o.sampler]:{});s.errorUnsupportedIf(null==o.source,"Source is expected to be defined for a texture.");const i=this.json.images[o.source],u=await this.loadTextureImageData(n,o,r);return Object(_core_MapUtils_js__WEBPACK_IMPORTED_MODULE_1__["getOrCreateMapValue"])(this.textureCache,n,(()=>{const e=e=>33071===e||33648===e||10497===e,t=e=>(s.error(`Unexpected TextureSampler WrapMode: ${e}. Using default REPEAT(10497).`),10497);return{data:u,wrapS:e(a.wrapS)?a.wrapS:t(a.wrapS),wrapT:e(a.wrapT)?a.wrapT:t(a.wrapT),minFilter:a.minFilter,name:i.name,id:n}}))}getNodeTransform(e){if(void 0===e)return P;let t=this.nodeTransformCache.get(e);if(!t){const r=this.getNodeTransform(this.getNodeParent(e)),n=this.json.nodes[e];n.matrix?t=Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["m"])(Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__["c"])(),r,n.matrix):n.translation||n.rotation||n.scale?(t=Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__["b"])(r),n.translation&&Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["t"])(t,t,n.translation),n.rotation&&(F[3]=Object(_chunks_quat_js__WEBPACK_IMPORTED_MODULE_6__["g"])(F,n.rotation),Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["d"])(t,t,F[3],F)),n.scale&&Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["f"])(t,t,n.scale)):t=r,this.nodeTransformCache.set(e,t)}return t}wrapAccessor(e,t){return new e(t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*(t.entryCount-1)+t.componentByteSize*t.componentCount)}resolveUri(e){return Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["makeAbsolute"])(e,this.baseUri)}getNodeParent(e){return this.nodeParentMap.get(e)}checkVersionSupported(){const e=_core_Version_js__WEBPACK_IMPORTED_MODULE_3__["Version"].parse(this.json.asset.version,"glTF");_.validate(e)}checkRequiredExtensionsSupported(){const e=this.json,t=this.errorContext;e.extensionsRequired&&0!==e.extensionsRequired.length&&t.errorUnsupported("gltf loader was not able to load unsupported feature. Required extensions: "+e.extensionsRequired.join(", "))}computeNodeParents(){this.json.nodes.forEach(((e,t)=>{e.children&&e.children.forEach((e=>{this.nodeParentMap.set(e,t)}))}))}async loadTextureImageData(e,t,r){const n=this.textureLoaders.get(e);if(n)return n;const s=this.createTextureLoader(t,r);return this.textureLoaders.set(e,s),s}async createTextureLoader(e,t){const r=this.json.images[e.source];if(r.uri)return this.context.loadImage(this.resolveUri(r.uri),t);const n=this.errorContext;n.errorUnsupportedIf(null==r.bufferView,"Image bufferView must be defined."),n.errorUnsupportedIf(null==r.mimeType,"Image mimeType must be defined.");const s=this.json.bufferViews[r.bufferView],o=await this.getBuffer(s.buffer,t);return n.errorUnsupportedIf(null!=s.byteStride,"byteStride not supported for image buffer"),H(new Uint8Array(o.buffer,o.byteOffset+(s.byteOffset||0),s.byteLength),r.mimeType)}}const _=new _core_Version_js__WEBPACK_IMPORTED_MODULE_3__["Version"](2,0,"glTF"),P=Object(_chunks_mat4_js__WEBPACK_IMPORTED_MODULE_4__["o"])(Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_5__["c"])(),Math.PI/2),F=Object(_chunks_quatf64_js__WEBPACK_IMPORTED_MODULE_7__["a"])(),k={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},V={5120:1,5121:1,5122:2,5123:2,5126:4,5125:4};function J(t){switch(t.componentType){case 5120:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2i8"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);case 5121:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2u8"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);case 5122:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2i16"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);case 5123:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2u16"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);case 5125:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2u32"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);case 5126:return new _geometry_support_buffer_BufferView_js__WEBPACK_IMPORTED_MODULE_8__["BufferViewVec2f"](t.raw,t.byteOffset,t.byteStride,t.byteOffset+t.byteStride*t.entryCount);default:return void Object(_core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__["neverReached"])(t.componentType)}}async function q(e){return new Promise(((t,r)=>{const n=new Blob([e]),s=new FileReader;s.onload=()=>{const e=s.result;t(JSON.parse(e))},s.onerror=e=>{r(e)},s.readAsText(n)}))}async function H(e,t){return new Promise(((r,n)=>{const s=new Blob([e],{type:t}),o=URL.createObjectURL(s),a=new Image;a.addEventListener("load",(()=>{URL.revokeObjectURL(o),"decode"in a?a.decode().then((()=>r(a)),(()=>r(a))):r(a)})),a.addEventListener("error",(e=>{URL.revokeObjectURL(o),n(e)})),a.src=o}))}const X={5120:"BYTE",5121:"UNSIGNED_BYTE",5122:"SHORT",5123:"UNSIGNED_SHORT",5125:"UNSIGNED_INT",5126:"FLOAT"};


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/internal/fillDefaults.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/internal/fillDefaults.js ***!
  \***************************************************************************/
/*! exports provided: material, textureSampler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "material", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "textureSampler", function() { return s; });
/* harmony import */ var _core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/compilerUtils.js */ "../node_modules/@arcgis/core/core/compilerUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o={baseColorFactor:[1,1,1,1],metallicFactor:1,roughnessFactor:1},r={pbrMetallicRoughness:o,emissiveFactor:[0,0,0],alphaMode:"OPAQUE",alphaCutoff:.5,doubleSided:!1},t={ESRI_externalColorMixMode:"tint"},a=(e={})=>{const a={...o,...e.pbrMetallicRoughness},i=l({...t,...e.extras});return{...r,...e,pbrMetallicRoughness:a,extras:i}};function l(o){switch(o.ESRI_externalColorMixMode){case"multiply":case"tint":case"ignore":case"replace":break;default:Object(_core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__["neverReached"])(o.ESRI_externalColorMixMode),o.ESRI_externalColorMixMode="tint"}return o}const i={magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497},s=e=>({...i,...e});


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/internal/indexUtils.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/internal/indexUtils.js ***!
  \*************************************************************************/
/*! exports provided: triangleFanToTriangles, triangleStripToTriangles, trianglesToTriangles */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "triangleFanToTriangles", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "triangleStripToTriangles", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "trianglesToTriangles", function() { return n; });
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _webgl_engine_lib_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../webgl-engine/lib/geometryDataUtils.js */ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/geometryDataUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,o=_webgl_engine_lib_geometryDataUtils_js__WEBPACK_IMPORTED_MODULE_1__["generateDefaultIndexArray"]){return"number"==typeof n?o(n):Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_0__["isUint16Array"])(n)||Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_0__["isUint8Array"])(n)?new Uint32Array(n):n}function o(t){const e="number"==typeof t?t:t.length;if(e<3)return new Uint16Array(0);const r=e-2,n=r<=65536?new Uint16Array(3*r):new Uint32Array(3*r);if("number"==typeof t){let t=0;for(let e=0;e<r;e+=1)e%2==0?(n[t++]=e,n[t++]=e+1,n[t++]=e+2):(n[t++]=e+1,n[t++]=e,n[t++]=e+2)}else{let e=0;for(let o=0;o<r;o+=1)if(o%2==0){const r=t[o],i=t[o+1],f=t[o+2];n[e++]=r,n[e++]=i,n[e++]=f}else{const r=t[o+1],i=t[o],f=t[o+2];n[e++]=r,n[e++]=i,n[e++]=f}}return n}function i(t){const e="number"==typeof t?t:t.length;if(e<3)return new Uint16Array(0);const r=e-2,n=r<=65536?new Uint16Array(3*r):new Uint32Array(3*r);if("number"==typeof t){let t=0;for(let e=0;e<r;++e)n[t++]=0,n[t++]=e+1,n[t++]=e+2;return n}{const e=t[0];let o=t[1],i=0;for(let f=0;f<r;++f){const r=t[f+2];n[i++]=e,n[i++]=o,n[i++]=r,o=r}return n}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/internal/pathUtils.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/internal/pathUtils.js ***!
  \************************************************************************/
/*! exports provided: splitURI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "splitURI", function() { return r; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r){let e,t;return r.replace(/^(.*\/)?([^/]*)$/,((r,a,i)=>(e=a||"",t=i||"",""))),{dirPart:e,filePart:t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/glTF/loader.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/glTF/loader.js ***!
  \************************************************************/
/*! exports provided: load */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return l; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../chunks/mat4f64.js */ "../node_modules/@arcgis/core/chunks/mat4f64.js");
/* harmony import */ var _DefaultErrorContext_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DefaultErrorContext.js */ "../node_modules/@arcgis/core/views/3d/glTF/DefaultErrorContext.js");
/* harmony import */ var _LoaderResult_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LoaderResult.js */ "../node_modules/@arcgis/core/views/3d/glTF/LoaderResult.js");
/* harmony import */ var _internal_Resource_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./internal/Resource.js */ "../node_modules/@arcgis/core/views/3d/glTF/internal/Resource.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let i=0;async function l(s,r,a={},l=!0){const m=await _internal_Resource_js__WEBPACK_IMPORTED_MODULE_4__["Resource"].load(s,p,r,a),x="gltf_"+i++,h={lods:[],materials:new Map,textures:new Map,meta:u(m)},T=!(!m.json.asset.extras||"symbolResource"!==m.json.asset.extras.ESRI_type),g=new Map;await c(m,(async(s,r,n,i)=>{var u;const c=null!=(u=g.get(n))?u:0;g.set(n,c+1);const T=void 0!==s.mode?s.mode:4,S=4===T||5===T||6===T?T:null;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(S))return void p.warnUnsupported("Unsupported primitive mode ("+f[T]+"). Skipping primitive.");if(!m.hasPositions(s))return void p.warn("Skipping primitive without POSITION vertex attribute.");const v=m.getPositionData(s,a),w=m.getMaterial(s,a,l),_=m.hasNormals(s)?m.getNormalData(s,a):null,I=m.hasTangents(s)?m.getTangentData(s,a):null,R=m.hasTextureCoordinates(s)?m.getTextureCoordinates(s,a):null,E=m.hasVertexColors(s)?m.getVertexColors(s,a):null,M=m.getIndexData(s,a),F={transform:Object(_chunks_mat4f64_js__WEBPACK_IMPORTED_MODULE_1__["b"])(r),attributes:{position:await v,normal:_?await _:null,texCoord0:R?await R:null,color:E?await E:null,tangent:I?await I:null},indices:await M,primitiveType:S,material:d(h,await w,x)};let y=null;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(h.meta)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(h.meta.ESRI_lod)&&"screenSpaceRadius"===h.meta.ESRI_lod.metric&&(y=h.meta.ESRI_lod.thresholds[n]),h.lods[n]=h.lods[n]||{parts:[],name:i,lodThreshold:y},h.lods[n].parts[c]=F}));for(const e of h.lods)e.parts=e.parts.filter((e=>!!e));return{model:h,meta:{isEsriSymbolResource:T,uri:m.uri},customMeta:{}}}function u(t){const o=t.json;let s=null;return o.nodes.forEach((t=>{const o=t.extras;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(o)&&(o.ESRI_proxyEllipsoid||o.ESRI_lod)&&(s=o)})),s}async function c(e,t){const o=e.json,s=o.scenes[o.scene||0].nodes,r=s.length>1,a=[];for(const i of s){const e=o.nodes[i];if(a.push(n(i,0)),m(e)&&!r){e.extensions.MSFT_lod.ids.forEach(((e,t)=>n(e,t+1)))}}async function n(s,r){const i=o.nodes[s],l=e.getNodeTransform(s);if(p.warnUnsupportedIf(null!=i.weights,"Morph targets are not supported."),null!=i.mesh){const e=o.meshes[i.mesh];for(const o of e.primitives)a.push(t(o,l,r,e.name))}for(const e of i.children||[])a.push(n(e,r))}await Promise.all(a)}function m(e){return e.extensions&&e.extensions.MSFT_lod&&Array.isArray(e.extensions.MSFT_lod.ids)}function d(e,t,o){const s=t=>{const s=`${o}_tex_${t&&t.id}${t&&t.name?"_"+t.name:""}`;if(t&&!e.textures.has(s)){const o=Object(_LoaderResult_js__WEBPACK_IMPORTED_MODULE_3__["makeTextureSource"])(t.data,{wrap:{s:t.wrapS,t:t.wrapT},mipmap:x.some((e=>e===t.minFilter)),noUnpackFlip:!0});e.textures.set(s,o)}return s},n=`${o}_mat_${t.id}_${t.name}`;if(!e.materials.has(n)){const o=Object(_LoaderResult_js__WEBPACK_IMPORTED_MODULE_3__["makeMaterialParameters"])({color:[t.color[0],t.color[1],t.color[2]],opacity:t.color[3],alphaMode:t.alphaMode,alphaCutoff:t.alphaCutoff,doubleSided:t.doubleSided,colorMixMode:t.ESRI_externalColorMixMode,textureColor:t.colorTexture?s(t.colorTexture):void 0,textureNormal:t.normalTexture?s(t.normalTexture):void 0,textureOcclusion:t.occlusionTexture?s(t.occlusionTexture):void 0,textureEmissive:t.emissiveTexture?s(t.emissiveTexture):void 0,textureMetallicRoughness:t.metallicRoughnessTexture?s(t.metallicRoughnessTexture):void 0,emissiveFactor:[t.emissiveFactor[0],t.emissiveFactor[1],t.emissiveFactor[2]],metallicFactor:t.metallicFactor,roughnessFactor:t.roughnessFactor});e.materials.set(n,o)}return n}const p=new _DefaultErrorContext_js__WEBPACK_IMPORTED_MODULE_2__["DefaultErrorContext"],x=[9987,9985],f=["POINTS","LINES","LINE_LOOP","LINE_STRIP","TRIANGLES","TRIANGLE_STRIP","TRIANGLE_FAN"];


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/lib/geometryDataUtils.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/lib/geometryDataUtils.js ***!
  \***********************************************************************************/
/*! exports provided: computeAttachmentOriginLines, computeAttachmentOriginPoints, computeAttachmentOriginTriangles, generateDefaultIndexArray, generateIndexArray */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeAttachmentOriginLines", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeAttachmentOriginPoints", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeAttachmentOriginTriangles", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateDefaultIndexArray", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateIndexArray", function() { return a; });
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _geometry_support_triangle_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../geometry/support/triangle.js */ "../node_modules/@arcgis/core/geometry/support/triangle.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s=(()=>{const t=new Uint32Array(131072);for(let n=0;n<t.length;++n)t[n]=n;return t})();const f=new Uint16Array([0]),c=(()=>{const t=new Uint16Array(65536);for(let n=0;n<t.length;++n)t[n]=n;return t})();function l(t){if(1===t)return f;if(t<c.length)return new Uint16Array(c.buffer,0,t);if(t>s.length){const n=Math.max(2*s.length,t);s=new Uint32Array(n);for(let t=0;t<s.length;t++)s[t]=t}return new Uint32Array(s.buffer,0,t)}function a(t){if(1===t)return new Uint16Array(f);if(t<c.length)return new Uint16Array(c.slice(0,t));if(t>s.length){const n=new Uint32Array(t);for(let t=0;t<n.length;t++)n[t]=t;return n}return new Uint32Array(s.slice(0,t))}function u(e,o,s){if(!e)return!1;const{size:f,data:c}=e;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(s,0,0,0),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(U,0,0,0);let l=0,a=0;for(let u=0;u<o.length-2;u+=3){const e=o[u+0]*f,h=o[u+1]*f,g=o[u+2]*f;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(y,c[e+0],c[e+1],c[e+2]),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(w,c[h+0],c[h+1],c[h+2]),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(A,c[g+0],c[g+1],c[g+2]);const m=Object(_geometry_support_triangle_js__WEBPACK_IMPORTED_MODULE_2__["areaPoints3d"])(y,w,A);m?(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(y,y,w),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(y,y,A),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(y,y,1/3*m),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(s,s,y),l+=m):(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(U,U,y),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(U,U,w),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(U,U,A),a+=3)}return(0!==a||0!==l)&&(0!==l?(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(s,s,1/l),!0):0!==a&&(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(s,U,1/a),!0))}function h(n,e,o){if(!n||!e)return!1;const{size:i,data:s}=n;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(o,0,0,0);let f=-1,c=0;for(let t=0;t<e.length;t++){const n=e[t]*i;f!==n&&(o[0]+=s[n+0],o[1]+=s[n+1],o[2]+=s[n+2],c++),f=n}return c>1&&Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(o,o,1/c),c>0}function g(o,i,s,f){if(!o)return!1;const{size:c,data:l}=o;Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(f,0,0,0),Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["s"])(U,0,0,0);let a=0,u=0;const h=i?i.length-1:l.length/c-1,g=h+(s?2:0);for(let t=0;t<g;t+=2){const o=t<h?t:h,s=t<h?t+1:0,g=(i?i[o]:o)*c,A=(i?i[s]:s)*c;y[0]=l[g+0],y[1]=l[g+1],y[2]=l[g+2],w[0]=l[A+0],w[1]=l[A+1],w[2]=l[A+2],Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(y,Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(y,y,w),.5);const m=Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["j"])(y,w);m>0?(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(f,f,Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(y,y,m)),a+=m):(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["b"])(U,U,y),u++)}return 0!==a?(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(f,f,1/a),!0):0!==u&&(Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_0__["a"])(f,U,1/u),!0)}const y=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["c"])(),w=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["c"])(),A=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["c"])(),U=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["c"])();


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial_COLOR_GAMMA.js":
/*!***************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/webgl-engine/materials/DefaultMaterial_COLOR_GAMMA.js ***!
  \***************************************************************************************************/
/*! exports provided: COLOR_GAMMA */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "COLOR_GAMMA", function() { return o; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=2.1;


/***/ })

};;
//# sourceMappingURL=31.render-page.js.map
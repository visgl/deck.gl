exports.ids = [93];
exports.modules = {

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

/***/ "../node_modules/@arcgis/core/chunks/quatf32.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/quatf32.js ***!
  \******************************************************/
/*! exports provided: a, b, c, f, q */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return a; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(){const r=new Float32Array(4);return r[3]=1,r}function n(r){const n=new Float32Array(4);return n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=r[3],n}function e(r,n,e,t){const a=new Float32Array(4);return a[0]=r,a[1]=n,a[2]=e,a[3]=t,a}function t(r,n){return new Float32Array(r,n,4)}var a=Object.freeze({__proto__:null,create:r,clone:n,fromValues:e,createView:t});


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

/***/ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js ***!
  \***********************************************************************************/
/*! exports provided: enumeration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enumeration", function() { return r; });
/* harmony import */ var _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,o={}){var l;const a=r instanceof _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"]?r:new _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"](r,o),t={type:null==(l=null==o?void 0:o.ignoreUnknown)||l?a.apiValues:String,readOnly:null==o?void 0:o.readOnly,json:{type:a.jsonValues,read:(null==o||!o.readOnly)&&{reader:a.read},write:{writer:a.write}}};return void 0!==(null==o?void 0:o.default)&&(t.json.default=o.default),void 0!==(null==o?void 0:o.name)&&(t.json.name=o.name),Object(_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])(t)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/PointCloudWorker.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/PointCloudWorker.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/typedArrayUtil.js */ "../node_modules/@arcgis/core/core/typedArrayUtil.js");
/* harmony import */ var _chunks_quat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../chunks/quat.js */ "../node_modules/@arcgis/core/chunks/quat.js");
/* harmony import */ var _chunks_quatf32_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../chunks/quatf32.js */ "../node_modules/@arcgis/core/chunks/quatf32.js");
/* harmony import */ var _chunks_vec3_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../chunks/vec3.js */ "../node_modules/@arcgis/core/chunks/vec3.js");
/* harmony import */ var _chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../chunks/vec3f32.js */ "../node_modules/@arcgis/core/chunks/vec3f32.js");
/* harmony import */ var _geometry_projection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../geometry/projection.js */ "../node_modules/@arcgis/core/geometry/projection.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./i3s/PointCloudWorkerUtil.js */ "../node_modules/@arcgis/core/views/3d/layers/i3s/PointCloudWorkerUtil.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class p{transform(e){const a=this._transform(e),o=[a.points.buffer,a.rgb.buffer];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(a.pointIdFilterMap)&&o.push(a.pointIdFilterMap.buffer);for(const t of a.attributes)"buffer"in t.values&&Object(_core_typedArrayUtil_js__WEBPACK_IMPORTED_MODULE_1__["isArrayBuffer"])(t.values.buffer)&&t.values.buffer!==a.rgb.buffer&&o.push(t.values.buffer);return Promise.resolve({result:a,transferList:o})}_transform(r){const e=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["readGeometry"])(r.schema,r.geometryBuffer);let a=e.length/3,o=null;const f=[],s=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["getAttributeValues"])(r.primaryAttributeData,e,a);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(r.primaryAttributeData)&&s&&f.push({attributeInfo:r.primaryAttributeData.attributeInfo,values:s});const i=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["getAttributeValues"])(r.modulationAttributeData,e,a);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(r.modulationAttributeData)&&i&&f.push({attributeInfo:r.modulationAttributeData.attributeInfo,values:i});let p=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["evaluateRenderer"])(r.rendererInfo,s,i,a);if(r.filterInfo&&r.filterInfo.length>0&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(r.filterAttributesData)){const t=r.filterAttributesData.map((t=>{const r=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["getAttributeValues"])(t,e,a),o={attributeInfo:t.attributeInfo,values:r};return f.push(o),o}));o=new Uint32Array(a),a=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["filterInPlace"])(e,p,o,r.filterInfo,t)}for(const t of r.userAttributesData){const r=Object(_i3s_PointCloudWorkerUtil_js__WEBPACK_IMPORTED_MODULE_8__["getAttributeValues"])(t,e,a);f.push({attributeInfo:t.attributeInfo,values:r})}3*a<p.length&&(p=new Uint8Array(p.buffer.slice(0,3*a))),this._applyElevationOffsetInPlace(e,a,r.elevationOffset);const c=this._transformCoordinates(e,a,r.obb,_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_7__["default"].fromJSON(r.inSR),_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_7__["default"].fromJSON(r.outSR));return{obb:r.obb,points:c,rgb:p,attributes:f,pointIdFilterMap:o}}_transformCoordinates(t,r,a,n,u){if(!Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_6__["projectBuffer"])(t,n,0,t,u,0,r))throw Error("Can't reproject");const l=Object(_chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_5__["f"])(a.center[0],a.center[1],a.center[2]),b=Object(_chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_5__["c"])(),m=Object(_chunks_vec3f32_js__WEBPACK_IMPORTED_MODULE_5__["c"])();Object(_chunks_quat_js__WEBPACK_IMPORTED_MODULE_2__["c"])(c,a.quaternion);const p=new Float32Array(3*r);for(let e=0;e<r;e++)b[0]=t[3*e]-l[0],b[1]=t[3*e+1]-l[1],b[2]=t[3*e+2]-l[2],Object(_chunks_vec3_js__WEBPACK_IMPORTED_MODULE_4__["q"])(m,b,c),a.halfSize[0]=Math.max(a.halfSize[0],Math.abs(m[0])),a.halfSize[1]=Math.max(a.halfSize[1],Math.abs(m[1])),a.halfSize[2]=Math.max(a.halfSize[2],Math.abs(m[2])),p[3*e]=b[0],p[3*e+1]=b[1],p[3*e+2]=b[2];return p}_applyElevationOffsetInPlace(t,r,e){if(0!==e)for(let a=0;a<r;a++)t[3*a+2]+=e}}const c=Object(_chunks_quatf32_js__WEBPACK_IMPORTED_MODULE_3__["b"])();function h(){return new p}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/i3s/I3SBinaryReader.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/i3s/I3SBinaryReader.js ***!
  \***************************************************************************/
/*! exports provided: createAttributeDataIndex, createGeometryDescriptor, createGeometryDescriptorForDraco, createGeometryDescriptorFromDefinition, createGeometryDescriptorFromSchema, createGeometryIndexFromSchema, createRawView, createTypedView, getBytesPerValue, isValueType, readBinaryAttribute, readHeader, readStringArray, valueType2ArrayBufferReader, valueType2TypedArrayClassMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createAttributeDataIndex", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeometryDescriptor", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeometryDescriptorForDraco", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeometryDescriptorFromDefinition", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeometryDescriptorFromSchema", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeometryIndexFromSchema", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createRawView", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTypedView", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBytesPerValue", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValueType", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readBinaryAttribute", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readHeader", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readStringArray", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "valueType2ArrayBufferReader", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "valueType2TypedArrayClassMap", function() { return m; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _LEPCC_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LEPCC.js */ "../node_modules/@arcgis/core/views/3d/layers/i3s/LEPCC.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=_core_Logger_js__WEBPACK_IMPORTED_MODULE_2__["default"].getLogger("esri.views.3d.layers.i3s.I3SBinaryReader");function u(t,n,r){let o="",i=0;for(;i<r;){const u=t[n+i];if(u<128)o+=String.fromCharCode(u),i++;else if(u>=192&&u<224){if(i+1>=r)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("utf8-decode-error","UTF-8 Decode failed. Two byte character was truncated.");const a=(31&u)<<6|63&t[n+i+1];o+=String.fromCharCode(a),i+=2}else if(u>=224&&u<240){if(i+2>=r)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("utf8-decode-error","UTF-8 Decode failed. Multi byte character was truncated.");const a=(15&u)<<12|(63&t[n+i+1])<<6|63&t[n+i+2];o+=String.fromCharCode(a),i+=3}else{if(!(u>=240&&u<248))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("utf8-decode-error","UTF-8 Decode failed. Invalid multi byte sequence.");{if(i+3>=r)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("utf8-decode-error","UTF-8 Decode failed. Multi byte character was truncated.");const a=(7&u)<<18|(63&t[n+i+1])<<12|(63&t[n+i+2])<<6|63&t[n+i+3];if(a>=65536){const e=55296+(a-65536>>10),t=56320+(1023&a);o+=String.fromCharCode(e,t)}else o+=String.fromCharCode(a);i+=4}}}return o}function a(e,t){const n={byteOffset:0,byteCount:0,fields:Object.create(null)};let r=0;for(let o=0;o<t.length;o++){const i=t[o],u=i.valueType||i.type,a=I[u];n.fields[i.property]=a(e,r),r+=m[u].BYTES_PER_ELEMENT}return n.byteCount=r,n}function s(t,n,r){const o=[];let i,a,s=0;for(a=0;a<t;a+=1){if(i=n[a],i>0){if(o.push(u(r,s,i-1)),0!==r[s+i-1])throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("string-array-error","Invalid string array: missing null termination.")}else o.push(null);s+=i}return o}function c(e,t){return new(0,m[t.valueType])(e,t.byteOffset,t.count*t.valuesPerElement)}function f(e,t){return new Uint8Array(e,t.byteOffset,t.byteCount)}function l(n,r,o){const i=null!=r.header?a(n,r.header):{byteOffset:0,byteCount:0,fields:{count:o}},u={header:i,byteOffset:i.byteCount,byteCount:0,entries:Object.create(null)};let s=i.byteCount;for(let a=0;a<r.ordering.length;a++){const n=r.ordering[a],o=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(r[n]);if(o.count=i.fields.count,"String"===o.valueType){if(o.byteOffset=s,o.byteCount=i.fields[n+"ByteCount"],"UTF-8"!==o.encoding)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("unsupported-encoding","Unsupported String encoding.",{encoding:o.encoding})}else{if(!h(o.valueType))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("unsupported-value-type","Unsupported binary valueType",{valueType:o.valueType});{const e=A(o.valueType);s+=s%e!=0?e-s%e:0,o.byteOffset=s,o.byteCount=e*o.valuesPerElement*o.count}}s+=o.byteCount,u.entries[n]=o}return u.byteCount=s-u.byteOffset,u}function b(t,n,r){if(n!==t&&i.error(`Invalid ${r} buffer size\n expected: ${t}, actual: ${n})`),n<t)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("buffer-too-small","Binary buffer is too small",{expectedSize:t,actualSize:n})}function d(e){return{isDraco:!1,isLegacy:!1,color:null!=e.color,normal:null!=e.normal,uv0:null!=e.uv0,uvRegion:null!=e.uvRegion,featureIndex:null!=e.faceRange&&null!=e.featureId}}function y(e,t){const n=a(e,t&&t.header);let r=n.byteCount;const o={isDraco:!1,header:n,byteOffset:n.byteCount,byteCount:0,vertexAttributes:{}},i=n.fields,u=null!=i.vertexCount?i.vertexCount:i.count;for(const a of t.ordering){if(!t.vertexAttributes[a])continue;const e={...t.vertexAttributes[a],byteOffset:r,count:u},n=p[a]?p[a]:"_"+a;o.vertexAttributes[n]=e,r+=A(e.valueType)*e.valuesPerElement*u}const s=i.faceCount;if(t.faces&&s){o.faces={};for(const e of t.ordering){if(!t.faces[e])continue;const n={...t.faces[e],byteOffset:r,count:s};o.faces[e]=n,r+=A(n.valueType)*n.valuesPerElement*s}}const c=i.featureCount;if(t.featureAttributes&&t.featureAttributeOrder&&c){o.featureAttributes={};for(const e of t.featureAttributeOrder){if(!t.featureAttributes[e])continue;const n={...t.featureAttributes[e],byteOffset:r,count:c};o.featureAttributes[e]=n;r+=("UInt64"===n.valueType?8:A(n.valueType))*n.valuesPerElement*c}}return b(r,e.byteLength,"geometry"),o.byteCount=r-o.byteOffset,o}function g(e,t){return!(!e||!e.compressedAttributes||"draco"!==e.compressedAttributes.encoding)?v(e.compressedAttributes.attributes):e?d(e):w(t)}function w(e){const t={isDraco:!1,isLegacy:!0,color:!1,normal:!1,uv0:!1,uvRegion:!1,featureIndex:!1};for(const n of e.ordering)if(e.vertexAttributes[n])switch(n){case"position":break;case"normal":t.normal=!0;break;case"color":t.color=!0;break;case"uv0":t.uv0=!0;break;case"region":t.uvRegion=!0}return e.featureAttributes&&e.featureAttributeOrder&&(t.featureIndex=!0),t}function v(e){const t={isDraco:!0,isLegacy:!1,color:!1,normal:!1,uv0:!1,uvRegion:!1,featureIndex:!1};for(const n of e)switch(n){case"position":break;case"normal":t.normal=!0;break;case"uv0":t.uv0=!0;break;case"color":t.color=!0;break;case"uv-region":t.uvRegion=!0;break;case"feature-index":t.featureIndex=!0}return t}const p={position:"position",normal:"normal",color:"color",uv0:"uv0",region:"uvRegion"};function C(t,n,u){if("lepcc-rgb"===t.encoding)return Object(_LEPCC_js__WEBPACK_IMPORTED_MODULE_3__["decodeRGB"])(n);if("lepcc-intensity"===t.encoding)return Object(_LEPCC_js__WEBPACK_IMPORTED_MODULE_3__["decodeIntensity"])(n);if(null!=t.encoding&&""!==t.encoding)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("unknown-attribute-storage-info-encoding","Unknown Attribute Storage Info Encoding");t["attributeByteCounts "]&&!t.attributeByteCounts&&(i.warn("Warning: Trailing space in 'attributeByteCounts '."),t.attributeByteCounts=t["attributeByteCounts "]),"ObjectIds"===t.ordering[0]&&t.hasOwnProperty("objectIds")&&(i.warn("Warning: Case error in objectIds"),t.ordering[0]="objectIds");const a=l(n,t,u);b(a.byteOffset+a.byteCount,n.byteLength,"attribute");const d=a.entries.attributeValues||a.entries.objectIds;if(d){if("String"===d.valueType){const e=a.entries.attributeByteCounts,t=c(n,e),r=f(n,d);return s(e.count,t,r)}return c(n,d)}throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("bad-attribute-storage-info","Bad attributeStorageInfo specification.")}const m={Float32:Float32Array,Float64:Float64Array,UInt8:Uint8Array,Int8:Int8Array,UInt16:Uint16Array,Int16:Int16Array,UInt32:Uint32Array,Int32:Int32Array},I={Float32:(e,t)=>new DataView(e,0).getFloat32(t,!0),Float64:(e,t)=>new DataView(e,0).getFloat64(t,!0),UInt8:(e,t)=>new DataView(e,0).getUint8(t),Int8:(e,t)=>new DataView(e,0).getInt8(t),UInt16:(e,t)=>new DataView(e,0).getUint16(t,!0),Int16:(e,t)=>new DataView(e,0).getInt16(t,!0),UInt32:(e,t)=>new DataView(e,0).getUint32(t,!0),Int32:(e,t)=>new DataView(e,0).getInt32(t,!0)};function h(e){return m.hasOwnProperty(e)}function A(e){return h(e)?m[e].BYTES_PER_ELEMENT:0}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/i3s/LEPCC.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/i3s/LEPCC.js ***!
  \*****************************************************************/
/*! exports provided: decodeIntensity, decodeRGB, decodeXYZ */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeIntensity", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeRGB", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeXYZ", function() { return c; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=!0,o={identifierOffset:0,identifierLength:10,versionOffset:10,checksumOffset:12,byteCount:16};function r(e,r,n){return{identifier:String.fromCharCode.apply(null,new Uint8Array(e,n+o.identifierOffset,o.identifierLength)),version:r.getUint16(n+o.versionOffset,t),checksum:r.getUint32(n+o.checksumOffset,t)}}const n={sizeLo:0,sizeHi:4,minX:8,minY:16,minZ:24,maxX:32,maxY:40,maxZ:48,errorX:56,errorY:64,errorZ:72,count:80,reserved:84,byteCount:88};function i(e,o){return{sizeLo:e.getUint32(o+n.sizeLo,t),sizeHi:e.getUint32(o+n.sizeHi,t),minX:e.getFloat64(o+n.minX,t),minY:e.getFloat64(o+n.minY,t),minZ:e.getFloat64(o+n.minZ,t),maxX:e.getFloat64(o+n.maxX,t),maxY:e.getFloat64(o+n.maxY,t),maxZ:e.getFloat64(o+n.maxZ,t),errorX:e.getFloat64(o+n.errorX,t),errorY:e.getFloat64(o+n.errorY,t),errorZ:e.getFloat64(o+n.errorZ,t),count:e.getUint32(o+n.count,t),reserved:e.getUint32(o+n.reserved,t)}}function c(t){const c=new DataView(t,0);let d=0;const{identifier:l,version:a}=r(t,c,d);if(d+=o.byteCount,"LEPCC     "!==l)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad identifier");if(a>1)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Unknown version");const u=i(c,d);d+=n.byteCount;if(u.sizeHi*2**32+u.sizeLo!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");const f=new Float64Array(3*u.count),h=[],w=[],g=[],p=[];if(d=s(t,d,h),d=s(t,d,w),d=s(t,d,g),d=s(t,d,p),d!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad length");let m=0,U=0;for(let e=0;e<h.length;e++){U+=h[e];let t=0;for(let o=0;o<w[e];o++){t+=g[m];const e=p[m];f[3*m]=Math.min(u.maxX,u.minX+2*u.errorX*t),f[3*m+1]=Math.min(u.maxY,u.minY+2*u.errorY*U),f[3*m+2]=Math.min(u.maxZ,u.minZ+2*u.errorZ*e),m++}}return{errorX:u.errorX,errorY:u.errorY,errorZ:u.errorZ,result:f}}function s(e,t,o){const r=[];t=d(e,t,r);const n=[];for(let i=0;i<r.length;i++){n.length=0,t=d(e,t,n);for(let e=0;e<n.length;e++)o.push(n[e]+r[i])}return t}function d(o,r,n){const i=new DataView(o,r),c=i.getUint8(0),s=31&c,d=!!(32&c),l=(192&c)>>6;let a=0;if(0===l)a=i.getUint32(1,t),r+=5;else if(1===l)a=i.getUint16(1,t),r+=3;else{if(2!==l)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad count type");a=i.getUint8(1),r+=2}if(d)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","LUT not implemented");const u=Math.ceil(a*s/8),f=new Uint8Array(o,r,u);let h=0,w=0,g=0;const p=-1>>>32-s;for(let e=0;e<a;e++){for(;w<s;)h|=f[g]<<w,w+=8,g+=1;n[e]=h&p,h>>>=s,w-=s,w+s>32&&(h|=f[g-1]>>8-w)}return r+g}const l={sizeLo:0,sizeHi:4,count:8,colorMapCount:12,lookupMethod:14,compressionMethod:15,byteCount:16};function a(e,o){return{sizeLo:e.getUint32(o+l.sizeLo,t),sizeHi:e.getUint32(o+l.sizeHi,t),count:e.getUint32(o+l.count,t),colorMapCount:e.getUint16(o+l.colorMapCount,t),lookupMethod:e.getUint8(o+l.lookupMethod),compressionMethod:e.getUint8(o+l.compressionMethod)}}function u(t){const n=new DataView(t,0);let i=0;const{identifier:c,version:s}=r(t,n,i);if(i+=o.byteCount,"ClusterRGB"!==c)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad identifier");if(s>1)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Unknown version");const d=a(n,i);i+=l.byteCount;if(d.sizeHi*2**32+d.sizeLo!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");if((2===d.lookupMethod||1===d.lookupMethod)&&0===d.compressionMethod){if(3*d.colorMapCount+d.count+i!==t.byteLength||d.colorMapCount>256)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad count");const o=new Uint8Array(t,i,3*d.colorMapCount),r=new Uint8Array(t,i+3*d.colorMapCount,d.count),n=new Uint8Array(3*d.count);for(let e=0;e<d.count;e++){const t=r[e];n[3*e]=o[3*t],n[3*e+1]=o[3*t+1],n[3*e+2]=o[3*t+2]}return n}if(0===d.lookupMethod&&0===d.compressionMethod){if(3*d.count+i!==t.byteLength||0!==d.colorMapCount)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad count");return new Uint8Array(t,i).slice()}if(d.lookupMethod<=2&&1===d.compressionMethod){if(i+3!==t.byteLength||1!==d.colorMapCount)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad count");const o=n.getUint8(i),r=n.getUint8(i+1),c=n.getUint8(i+2),s=new Uint8Array(3*d.count);for(let e=0;e<d.count;e++)s[3*e]=o,s[3*e+1]=r,s[3*e+2]=c;return s}throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad method "+d.lookupMethod+","+d.compressionMethod)}const f={sizeLo:0,sizeHi:4,count:8,scaleFactor:12,bitsPerPoint:14,reserved:15,byteCount:16};function h(e,o){return{sizeLo:e.getUint32(o+f.sizeLo,t),sizeHi:e.getUint32(o+f.sizeHi,t),count:e.getUint32(o+f.count,t),scaleFactor:e.getUint16(o+f.scaleFactor,t),bitsPerPoint:e.getUint8(o+f.bitsPerPoint),reserved:e.getUint8(o+f.reserved)}}function w(t){const n=new DataView(t,0);let i=0;const{identifier:c,version:s}=r(t,n,i);if(i+=o.byteCount,"Intensity "!==c)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad identifier");if(s>1)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Unknown version");const l=h(n,i);i+=f.byteCount;if(l.sizeHi*2**32+l.sizeLo!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");const a=new Uint16Array(l.count);if(8===l.bitsPerPoint){if(l.count+i!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");const o=new Uint8Array(t,i,l.count);for(let e=0;e<l.count;e++)a[e]=o[e]*l.scaleFactor}else if(16===l.bitsPerPoint){if(2*l.count+i!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");const o=new Uint16Array(t,i,l.count);for(let e=0;e<l.count;e++)a[e]=o[e]*l.scaleFactor}else{const o=[];if(d(t,i,o)!==t.byteLength)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("lepcc-decode-error","Bad size");for(let e=0;e<l.count;e++)a[e]=o[e]*l.scaleFactor}return a}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/3d/layers/i3s/PointCloudWorkerUtil.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/3d/layers/i3s/PointCloudWorkerUtil.js ***!
  \********************************************************************************/
/*! exports provided: elevationFromPositions, evaluateRenderer, filterInPlace, getAttributeValues, readGeometry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "elevationFromPositions", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evaluateRenderer", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterInPlace", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAttributeValues", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readGeometry", function() { return c; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _renderers_PointCloudClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../renderers/PointCloudClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudClassBreaksRenderer.js");
/* harmony import */ var _renderers_PointCloudStretchRenderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../renderers/PointCloudStretchRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudStretchRenderer.js");
/* harmony import */ var _renderers_PointCloudUniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../renderers/PointCloudUniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudUniqueValueRenderer.js");
/* harmony import */ var _I3SBinaryReader_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./I3SBinaryReader.js */ "../node_modules/@arcgis/core/views/3d/layers/i3s/I3SBinaryReader.js");
/* harmony import */ var _LEPCC_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./LEPCC.js */ "../node_modules/@arcgis/core/views/3d/layers/i3s/LEPCC.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(e,o,l,i){const{rendererJSON:s,isRGBRenderer:f}=e;let u=null,c=null;if(o&&f)u=o;else if(o&&"pointCloudUniqueValueRenderer"===s.type){c=_renderers_PointCloudUniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(s);const e=c.colorUniqueValueInfos;u=new Uint8Array(3*i);const r=p(c.fieldTransformType);for(let t=0;t<i;t++){const n=(r?r(o[t]):o[t])+"";for(let o=0;o<e.length;o++)if(e[o].values.indexOf(n)>=0){u[3*t]=e[o].color.r,u[3*t+1]=e[o].color.g,u[3*t+2]=e[o].color.b;break}}}else if(o&&"pointCloudStretchRenderer"===s.type){c=_renderers_PointCloudStretchRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(s);const e=c.stops;u=new Uint8Array(3*i);const r=p(c.fieldTransformType);for(let t=0;t<i;t++){const n=r?r(o[t]):o[t],l=e.length-1;if(n<e[0].value)u[3*t]=e[0].color.r,u[3*t+1]=e[0].color.g,u[3*t+2]=e[0].color.b;else if(n>=e[l].value)u[3*t]=e[l].color.r,u[3*t+1]=e[l].color.g,u[3*t+2]=e[l].color.b;else for(let o=1;o<e.length;o++)if(n<e[o].value){const r=(n-e[o-1].value)/(e[o].value-e[o-1].value);u[3*t]=e[o].color.r*r+e[o-1].color.r*(1-r),u[3*t+1]=e[o].color.g*r+e[o-1].color.g*(1-r),u[3*t+2]=e[o].color.b*r+e[o-1].color.b*(1-r);break}}}else if(o&&"pointCloudClassBreaksRenderer"===s.type){c=_renderers_PointCloudClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromJSON(s);const e=c.colorClassBreakInfos;u=new Uint8Array(3*i);const t=p(c.fieldTransformType);for(let r=0;r<i;r++){const n=t?t(o[r]):o[r];for(let o=0;o<e.length;o++)if(n>=e[o].minValue&&n<=e[o].maxValue){u[3*r]=e[o].color.r,u[3*r+1]=e[o].color.g,u[3*r+2]=e[o].color.b;break}}}else{u=new Uint8Array(3*i);for(let e=0;e<u.length;e++)u[e]=255}if(l&&c&&c.colorModulation){const e=c.colorModulation.minValue,o=c.colorModulation.maxValue,r=.3;for(let t=0;t<i;t++){const n=l[t],i=n>=o?1:n<=e?r:r+(1-r)*(n-e)/(o-e);u[3*t]=i*u[3*t],u[3*t+1]=i*u[3*t+1],u[3*t+2]=i*u[3*t+2]}}return u}function c(o,r){if(null==o.encoding||""===o.encoding){const t=Object(_I3SBinaryReader_js__WEBPACK_IMPORTED_MODULE_4__["createGeometryIndexFromSchema"])(r,o);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t.vertexAttributes.position))return;const n=Object(_I3SBinaryReader_js__WEBPACK_IMPORTED_MODULE_4__["createTypedView"])(r,t.vertexAttributes.position),s=t.header.fields,f=[s.offsetX,s.offsetY,s.offsetZ],u=[s.scaleX,s.scaleY,s.scaleZ],c=n.length/3,a=new Float64Array(3*c);for(let e=0;e<c;e++)a[3*e]=n[3*e]*u[0]+f[0],a[3*e+1]=n[3*e+1]*u[1]+f[1],a[3*e+2]=n[3*e+2]*u[2]+f[2];return a}if("lepcc-xyz"===o.encoding)return Object(_LEPCC_js__WEBPACK_IMPORTED_MODULE_5__["decodeXYZ"])(r).result}function a(e,r,t){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e)&&e.attributeInfo.useElevation?d(r,t):Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e)?Object(_I3SBinaryReader_js__WEBPACK_IMPORTED_MODULE_4__["readBinaryAttribute"])(e.attributeInfo.storageInfo,e.buffer,t):null}function d(e,o){const r=new Float64Array(o);for(let t=0;t<o;t++)r[t]=e[3*t+2];return r}function m(e,o,r,t,n){const l=e.length/3;let i=0;for(let s=0;s<l;s++){let l=!0;for(let e=0;e<t.length&&l;e++){const{filterJSON:o}=t[e],r=n[e].values[s];switch(o.type){case"pointCloudValueFilter":{const e="exclude"===o.mode;-1!==o.values.indexOf(r)===e&&(l=!1);break}case"pointCloudBitfieldFilter":{const e=b(o.requiredSetBits),t=b(o.requiredClearBits);(r&e)===e&&0==(r&t)||(l=!1);break}case"pointCloudReturnFilter":{const e=15&r,t=r>>>4&15,n=t>1,i=1===e,s=e===t;let f=!1;for(const r of o.includedReturns)if("last"===r&&s||"firstOfMany"===r&&i&&n||"lastOfMany"===r&&s&&n||"single"===r&&!n){f=!0;break}f||(l=!1);break}}}l&&(r[i]=s,e[3*i]=e[3*s],e[3*i+1]=e[3*s+1],e[3*i+2]=e[3*s+2],o[3*i]=o[3*s],o[3*i+1]=o[3*s+1],o[3*i+2]=o[3*s+2],i++)}return i}function p(e){return null==e||"none"===e?null:"low-four-bit"===e?e=>15&e:"high-four-bit"===e?e=>(240&e)>>4:"absolute-value"===e?e=>Math.abs(e):"modulo-ten"===e?e=>e%10:null}function b(e){let o=0;for(const r of e||[])o|=1<<r;return o}


/***/ })

};;
//# sourceMappingURL=93.render-page.js.map
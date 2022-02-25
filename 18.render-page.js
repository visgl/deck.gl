exports.ids = [18];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/ItemCache.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/core/ItemCache.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/* harmony import */ var _MemCache_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MemCache.js */ "../node_modules/@arcgis/core/core/MemCache.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(e,s){this._storage=new _MemCache_js__WEBPACK_IMPORTED_MODULE_0__["MemCacheStorage"],this._storage.maxSize=e,s&&this._storage.registerRemoveFunc("",s)}put(t,e){this._storage.put(t,e,1,1)}pop(t){return this._storage.pop(t)}get(t){return this._storage.get(t)}clear(){this._storage.clearAll()}destroy(){this._storage.destroy()}}


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js ***!
  \**********************************************************************/
/*! exports provided: NEGATIVE_INFINITY, POSITIVE_INFINITY, ZERO, allFinite, center, contains, containsPoint, containsPointWithMargin, create, depth, diameter, empty, equals, expandWithAABB, expandWithBuffer, expandWithNestedArray, expandWithOffset, expandWithRect, expandWithVec3, fromExtent, fromMinMax, fromRect, fromValues, getMax, getMin, height, intersects, intersectsClippingArea, is, isPoint, maximumDimension, offset, scale, set, setMax, setMin, size, toExtent, toRect, width, wrap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NEGATIVE_INFINITY", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "POSITIVE_INFINITY", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ZERO", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "allFinite", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "center", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "contains", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "containsPoint", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "containsPointWithMargin", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "depth", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diameter", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "empty", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithAABB", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithBuffer", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithNestedArray", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithOffset", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithRect", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandWithVec3", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromExtent", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromMinMax", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromRect", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromValues", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMax", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMin", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "height", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersects", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersectsClippingArea", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "is", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isPoint", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "maximumDimension", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "offset", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scale", function() { return Y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMax", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMin", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "size", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toExtent", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toRect", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "width", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return v; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _Extent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _aaBoundingRect_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./aaBoundingRect.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingRect.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(n){return n}function a(n=H){return i([n[0],n[1],n[2],n[3],n[4],n[5]])}function u(n,t,r,i,u,e,m=a()){return m[0]=n,m[1]=t,m[2]=r,m[3]=i,m[4]=u,m[5]=e,m}function e(n,t=a()){return t[0]=n.xmin,t[1]=n.ymin,t[2]=n.zmin,t[3]=n.xmax,t[4]=n.ymax,t[5]=n.zmax,t}function m(n,r){const i=isFinite(n[2])||isFinite(n[5]);return new _Extent_js__WEBPACK_IMPORTED_MODULE_1__["default"](i?{xmin:n[0],xmax:n[3],ymin:n[1],ymax:n[4],zmin:n[2],zmax:n[5],spatialReference:r}:{xmin:n[0],xmax:n[3],ymin:n[1],ymax:n[4],spatialReference:r})}function o(n,t,r=a()){return r[0]=n[0],r[1]=n[1],r[2]=n[2],r[3]=t[0],r[4]=t[1],r[5]=t[2],r}function f(n,t){n[0]=Math.min(n[0],t[0]),n[1]=Math.min(n[1],t[1]),n[2]=Math.min(n[2],t[2]),n[3]=Math.max(n[3],t[3]),n[4]=Math.max(n[4],t[4]),n[5]=Math.max(n[5],t[5])}function c(n,t){n[0]=Math.min(n[0],t[0]),n[1]=Math.min(n[1],t[1]),n[3]=Math.max(n[3],t[2]),n[4]=Math.max(n[4],t[3])}function h(n,t){n[0]=Math.min(n[0],t[0]),n[1]=Math.min(n[1],t[1]),n[2]=Math.min(n[2],t[2]),n[3]=Math.max(n[3],t[0]),n[4]=Math.max(n[4],t[1]),n[5]=Math.max(n[5],t[2])}function M(n,t,r=0,i=t.length/3){let a=n[0],u=n[1],e=n[2],m=n[3],o=n[4],f=n[5];for(let c=0;c<i;c++)a=Math.min(a,t[r+3*c]),u=Math.min(u,t[r+3*c+1]),e=Math.min(e,t[r+3*c+2]),m=Math.max(m,t[r+3*c]),o=Math.max(o,t[r+3*c+1]),f=Math.max(f,t[r+3*c+2]);n[0]=a,n[1]=u,n[2]=e,n[3]=m,n[4]=o,n[5]=f}function x(n,t,r,i){n[0]=Math.min(n[0],n[0]+t),n[3]=Math.max(n[3],n[3]+t),n[1]=Math.min(n[1],n[1]+r),n[4]=Math.max(n[4],n[4]+r),n[2]=Math.min(n[2],n[2]+i),n[5]=Math.max(n[5],n[5]+i)}function s(n,t,r){const i=t.length;let a=n[0],u=n[1],e=n[2],m=n[3],o=n[4],f=n[5];if(r)for(let c=0;c<i;c++){const n=t[c];a=Math.min(a,n[0]),u=Math.min(u,n[1]),e=Math.min(e,n[2]),m=Math.max(m,n[0]),o=Math.max(o,n[1]),f=Math.max(f,n[2])}else for(let c=0;c<i;c++){const n=t[c];a=Math.min(a,n[0]),u=Math.min(u,n[1]),m=Math.max(m,n[0]),o=Math.max(o,n[1])}n[0]=a,n[1]=u,n[2]=e,n[3]=m,n[4]=o,n[5]=f}function l(n){for(let t=0;t<6;t++)if(!isFinite(n[t]))return!1;return!0}function I(n){return n[0]>=n[3]?0:n[3]-n[0]}function y(n){return n[1]>=n[4]?0:n[4]-n[1]}function N(n){return n[2]>=n[5]?0:n[5]-n[2]}function g(n){const t=I(n),r=N(n),i=y(n);return Math.sqrt(t*t+r*r+i*i)}function p(n,t=[0,0,0]){return t[0]=n[0]+I(n)/2,t[1]=n[1]+y(n)/2,t[2]=n[2]+N(n)/2,t}function F(n,t=[0,0,0]){return t[0]=I(n),t[1]=y(n),t[2]=N(n),t}function z(n){return Math.max(I(n),N(n),y(n))}function E(n,t){return t[0]>=n[0]&&t[1]>=n[1]&&t[2]>=n[2]&&t[0]<=n[3]&&t[1]<=n[4]&&t[2]<=n[5]}function T(n,t,r){return t[0]>=n[0]-r&&t[1]>=n[1]-r&&t[2]>=n[2]-r&&t[0]<=n[3]+r&&t[1]<=n[4]+r&&t[2]<=n[5]+r}function b(n,t){return t[0]>=n[0]&&t[1]>=n[1]&&t[2]>=n[2]&&t[3]<=n[3]&&t[4]<=n[4]&&t[5]<=n[5]}function j(n,t){return Math.max(t[0],n[0])<=Math.min(t[3],n[3])&&Math.max(t[1],n[1])<=Math.min(t[4],n[4])&&Math.max(t[2],n[2])<=Math.min(t[5],n[5])}function R(t,r){return!!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(r)||j(t,r)}function V(n,t,r,i,a=n){return a[0]=n[0]+t,a[1]=n[1]+r,a[2]=n[2]+i,a[3]=n[3]+t,a[4]=n[4]+r,a[5]=n[5]+i,a}function Y(n,t,r=n){const i=n[0]+I(n)/2,a=n[1]+y(n)/2,u=n[2]+N(n)/2;return r[0]=i+(n[0]-i)*t,r[1]=a+(n[1]-a)*t,r[2]=u+(n[2]-u)*t,r[3]=i+(n[3]-i)*t,r[4]=a+(n[4]-a)*t,r[5]=u+(n[5]-u)*t,r}function _(n,t){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t}function d(n,t){return t[0]=n[3],t[1]=n[4],t[2]=n[5],t}function q(n,t,r=n){return r[0]=t[0],r[1]=t[1],r[2]=t[2],r!==n&&(r[3]=n[3],r[4]=n[4],r[5]=n[5]),r}function w(n,t,r=n){return r[3]=t[0],r[4]=t[1],r[5]=t[2],r!==n&&(r[0]=n[0],r[1]=n[1],r[2]=n[2]),n}function A(n,t){return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n}function B(n){return n?A(n,D):a(D)}function G(n,t){return t||(t=Object(_aaBoundingRect_js__WEBPACK_IMPORTED_MODULE_2__["create"])()),t[0]=n[0],t[1]=n[1],t[2]=n[3],t[3]=n[4],t}function O(n,t){return n[0]=t[0],n[1]=t[1],n[2]=Number.NEGATIVE_INFINITY,n[3]=t[2],n[4]=t[3],n[5]=Number.POSITIVE_INFINITY,n}function P(n){return 6===n.length}function S(n){return 0===I(n)&&0===y(n)&&0===N(n)}function k(t,r,i){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(r))return t===r;if(!P(t)||!P(r))return!1;if(i){for(let n=0;n<t.length;n++)if(!i(t[n],r[n]))return!1}else for(let n=0;n<t.length;n++)if(t[n]!==r[n])return!1;return!0}function v(n,t,r,i,a,e){return u(n,t,r,i,a,e,J)}const C=i([-1/0,-1/0,-1/0,1/0,1/0,1/0]),D=i([1/0,1/0,1/0,-1/0,-1/0,-1/0]),H=i([0,0,0,0,0,0]),J=a();


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/normalizeUtils.js ***!
  \***********************************************************************/
/*! exports provided: getDenormalizedExtent, normalizeCentralMeridian, normalizeMapX, straightLineDensify */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDenormalizedExtent", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeCentralMeridian", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeMapX", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "straightLineDensify", function() { return R; });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../config.js */ "../node_modules/@arcgis/core/config.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _Polygon_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _Polyline_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./normalizeUtilsCommon.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtilsCommon.js");
/* harmony import */ var _spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./webMercatorUtils.js */ "../node_modules/@arcgis/core/geometry/support/webMercatorUtils.js");
/* harmony import */ var _tasks_geometry_cut_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../tasks/geometry/cut.js */ "../node_modules/@arcgis/core/tasks/geometry/cut.js");
/* harmony import */ var _tasks_geometry_simplify_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../tasks/geometry/simplify.js */ "../node_modules/@arcgis/core/tasks/geometry/simplify.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const y=_core_Logger_js__WEBPACK_IMPORTED_MODULE_2__["default"].getLogger("esri.geometry.support.normalizeUtils");function x(t){return"polygon"===t.type}function d(t){return"polygon"===t[0].type}function w(t){return"polyline"===t[0].type}function j(t){const e=[];let n=0,o=0;for(let s=0;s<t.length;s++){const r=t[s];let i=null;for(let t=0;t<r.length;t++)i=r[t],e.push(i),0===t?(n=i[0],o=n):(n=Math.min(n,i[0]),o=Math.max(o,i[0]));i&&e.push([(n+o)/2,0])}return e}function R(t,n){if(!(t instanceof _Polyline_js__WEBPACK_IMPORTED_MODULE_5__["default"]||t instanceof _Polygon_js__WEBPACK_IMPORTED_MODULE_4__["default"])){const t="straightLineDensify: the input geometry is neither polyline nor polygon";throw y.error(t),new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"](t)}const o=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["getGeometryParts"])(t),s=[];for(const e of o){const t=[];s.push(t),t.push([e[0][0],e[0][1]]);for(let o=0;o<e.length-1;o++){const s=e[o][0],r=e[o][1],i=e[o+1][0],l=e[o+1][1],f=Math.sqrt((i-s)*(i-s)+(l-r)*(l-r)),c=(l-r)/f,p=(i-s)/f,u=f/n;if(u>1){for(let l=1;l<=u-1;l++){const e=l*n,o=p*e+s,i=c*e+r;t.push([o,i])}const e=(f+Math.floor(u-1)*n)/2,o=p*e+s,i=c*e+r;t.push([o,i])}t.push([i,l])}}return x(t)?new _Polygon_js__WEBPACK_IMPORTED_MODULE_4__["default"]({rings:s,spatialReference:t.spatialReference}):new _Polyline_js__WEBPACK_IMPORTED_MODULE_5__["default"]({paths:s,spatialReference:t.spatialReference})}function M(t,e,n){if(e){const e=R(t,1e6);t=Object(_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_8__["webMercatorToGeographic"])(e,!0)}return n&&(t=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["updatePolyGeometry"])(t,n)),t}function P(t,e,n){if(Array.isArray(t)){const o=t[0];if(o>e){const n=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(o,e);t[0]=o+n*(-2*e)}else if(o<n){const e=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(o,n);t[0]=o+e*(-2*n)}}else{const o=t.x;if(o>e){const n=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(o,e);t=t.clone().offset(n*(-2*e),0)}else if(o<n){const e=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(o,n);t=t.clone().offset(e*(-2*n),0)}}return t}function b(t,e){let n=-1;for(let o=0;o<e.cutIndexes.length;o++){const s=e.cutIndexes[o],r=e.geometries[o],i=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["getGeometryParts"])(r);for(let t=0;t<i.length;t++){const e=i[t];e.some((n=>{if(n[0]<180)return!0;{let n=0;for(let t=0;t<e.length;t++){const o=e[t][0];n=o>n?o:n}n=Number(n.toFixed(9));const o=-360*Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(n,180);for(let s=0;s<e.length;s++){const e=r.getPoint(t,s);r.setPoint(t,s,e.clone().offset(o,0))}return!0}}))}if(s===n){if(d(t))for(const e of Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["getGeometryParts"])(r))t[s]=t[s].addRing(e);else if(w(t))for(const e of Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["getGeometryParts"])(r))t[s]=t[s].addPath(e)}else n=s,t[s]=r}return t}async function L(e,n,l){if(!Array.isArray(e))return L([e],n);const h=n?n.url:_config_js__WEBPACK_IMPORTED_MODULE_0__["default"].geometryServiceUrl;let y,x,d,w,j,R,U,k,v=0;const A=[],z=[];for(const t of e)if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(t))z.push(t);else if(y||(y=t.spatialReference,x=Object(_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_7__["getInfo"])(y),d=y.isWebMercator,R=d?102100:4326,w=_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["cutParams"][R].maxX,j=_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["cutParams"][R].minX,U=_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["cutParams"][R].plus180Line,k=_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["cutParams"][R].minus180Line),x)if("mesh"===t.type)z.push(t);else if("point"===t.type)z.push(P(t.clone(),w,j));else if("multipoint"===t.type){const e=t.clone();e.points=e.points.map((t=>P(t,w,j))),z.push(e)}else if("extent"===t.type){const e=t.clone()._normalize(!1,!1,x);z.push(e.rings?new _Polygon_js__WEBPACK_IMPORTED_MODULE_4__["default"](e):e)}else if(t.extent){const e=t.extent,n=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(e.xmin,j)*(2*w);let o=0===n?t.clone():Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["updatePolyGeometry"])(t.clone(),n);e.offset(n,0),e.intersects(U)&&e.xmax!==w?(v=e.xmax>v?e.xmax:v,o=M(o,d),A.push(o),z.push("cut")):e.intersects(k)&&e.xmin!==j?(v=e.xmax*(2*w)>v?e.xmax*(2*w):v,o=M(o,d,360),A.push(o),z.push("cut")):z.push(o)}else z.push(t.clone());else z.push(t);let I=Object(_normalizeUtilsCommon_js__WEBPACK_IMPORTED_MODULE_6__["offsetMagnitude"])(v,w),X=-90;const q=I,C=new _Polyline_js__WEBPACK_IMPORTED_MODULE_5__["default"];for(;I>0;){const t=360*I-180;C.addPath([[t,X],[t,-1*X]]),X*=-1,I--}if(A.length>0&&q>0){const t=b(A,await Object(_tasks_geometry_cut_js__WEBPACK_IMPORTED_MODULE_9__["cut"])(h,A,C,l)),n=[],o=[];for(let l=0;l<z.length;l++){const r=z[l];if("cut"!==r)o.push(r);else{const r=t.shift(),i=e[l];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(i)&&"polygon"===i.type&&i.rings&&i.rings.length>1&&r.rings.length>=i.rings.length?(n.push(r),o.push("simplify")):o.push(d?Object(_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_8__["geographicToWebMercator"])(r):r)}}if(!n.length)return o;const r=await Object(_tasks_geometry_simplify_js__WEBPACK_IMPORTED_MODULE_10__["simplify"])(h,n,l),i=[];for(let e=0;e<o.length;e++){const t=o[e];"simplify"!==t?i.push(t):i.push(d?Object(_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_8__["geographicToWebMercator"])(r.shift()):r.shift())}return i}const D=[];for(let t=0;t<z.length;t++){const e=z[t];if("cut"!==e)D.push(e);else{const t=A.shift();D.push(!0===d?Object(_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_8__["geographicToWebMercator"])(t):t)}}return Promise.resolve(D)}function U(t){if(!t)return null;const e=t.extent;if(!e)return null;const n=t.spatialReference&&Object(_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_7__["getInfo"])(t.spatialReference);if(!n)return e;const[o,s]=n.valid,r=2*s,{width:i}=e;let l,{xmin:f,xmax:c}=e;if([f,c]=[c,f],"extent"===t.type||0===i||i<=s||i>r||f<o||c>s)return e;switch(t.type){case"polygon":if(!(t.rings.length>1))return e;l=j(t.rings);break;case"polyline":if(!(t.paths.length>1))return e;l=j(t.paths);break;case"multipoint":l=t.points}const p=e.clone();for(let u=0;u<l.length;u++){let t=l[u][0];t<0?(t+=s,c=Math.max(t,c)):(t-=s,f=Math.min(t,f))}return p.xmin=f,p.xmax=c,p.width<i?(p.xmin-=s,p.xmax-=s,p):e}function k(t,e){const n=Object(_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_7__["getInfo"])(e);if(n){const[e,o]=n.valid,s=o-e;if(t<e)for(;t<e;)t+=s;if(t>o)for(;t>o;)t-=s}return t}


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/geometry/cut.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/geometry/cut.js ***!
  \**********************************************************/
/*! exports provided: cut */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cut", function() { return o; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function o(o,i,n,m){const p="string"==typeof o?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["urlToObject"])(o):o,a=i[0].spatialReference,u={...m,query:{...p.query,f:"json",sr:JSON.stringify(a),target:JSON.stringify({geometryType:Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["getJsonType"])(i[0]),geometries:i}),cutter:JSON.stringify(n)}},c=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(p.path+"/cut",u),{cutIndexes:f,geometries:g=[]}=c.data;return{cutIndexes:f,geometries:g.map((e=>{const t=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["fromJSON"])(e);return t.spatialReference=a,t}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/geometry/simplify.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/geometry/simplify.js ***!
  \***************************************************************/
/*! exports provided: simplify */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "simplify", function() { return i; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function i(o,i,f){const m="string"==typeof o?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(o):o,p=i[0].spatialReference,a=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(i[0]),u={...f,query:{...m.query,f:"json",sr:p.wkid?p.wkid:JSON.stringify(p),geometries:JSON.stringify(s(i))}};return n((await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(m.path+"/simplify",u)).data,a,p)}function s(r){return{geometryType:Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(r[0]),geometries:r.map((r=>r.toJSON()))}}function n(r,t,e){const i=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getGeometryType"])(t);return r.map((r=>{const t=i.fromJSON(r);return t.spatialReference=e,t}))}


/***/ })

};;
//# sourceMappingURL=18.render-page.js.map
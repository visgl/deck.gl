exports.ids = [41];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js ***!
  \**********************************************************************/
/*! exports provided: diff, hasDiff, hasDiffAny, isEmpty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diff", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasDiff", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasDiffAny", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isEmpty", function() { return d; });
/* harmony import */ var _Accessor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/core/accessorSupport/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const f=["esri.Color","esri.portal.Portal","esri.symbols.support.Symbol3DAnchorPosition2D","esri.symbols.support.Symbol3DAnchorPosition3D"];function i(e){return e instanceof _Accessor_js__WEBPACK_IMPORTED_MODULE_0__["default"]}function c(t){return t instanceof _Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"]?Object.keys(t.items):i(t)?Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["getProperties"])(t).keys():t?Object.keys(t):[]}function u(t,n){return t instanceof _Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"]?t.items[n]:t[n]}function l(t,e){return!(!Array.isArray(t)||!Array.isArray(e))&&t.length!==e.length}function s(t){return t?t.declaredClass:null}function p(t,e){const n=t.diff;if(n&&"function"==typeof n)return n(t,e);const r=c(t),a=c(e);if(0===r.length&&0===a.length)return;if(!r.length||!a.length||l(t,e))return{type:"complete",oldValue:t,newValue:e};const y=a.filter((t=>-1===r.indexOf(t))),m=r.filter((t=>-1===a.indexOf(t))),d=r.filter((n=>a.indexOf(n)>-1&&u(t,n)!==u(e,n))).concat(y,m).sort(),b=s(t);if(b&&f.indexOf(b)>-1&&d.length)return{type:"complete",oldValue:t,newValue:e};let h;const j=i(t)&&i(e);for(const f of d){const r=u(t,f),i=u(e,f);let c;(j||"function"!=typeof r&&"function"!=typeof i)&&(r!==i&&(null==r&&null==i||(c=n&&n[f]&&"function"==typeof n[f]?n[f](r,i):"object"==typeof r&&"object"==typeof i&&s(r)===s(i)?p(r,i):{type:"complete",oldValue:r,newValue:i},Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(c)&&(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(h)?h.diff[f]=c:h={type:"partial",diff:{[f]:c}}))))}return h}function a(t,e){if(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t))return!1;const o=e.split(".");let r=t;for(const n of o){if("complete"===r.type)return!0;if("partial"!==r.type)return!1;{const t=r.diff[n];if(!t)return!1;r=t}}return!0}function y(t,e){for(const n of e)if(a(t,n))return!0;return!1}function m(t,e){if("function"!=typeof t&&"function"!=typeof e&&(t||e))return!t||!e||"object"==typeof t&&"object"==typeof e&&s(t)!==s(e)?{type:"complete",oldValue:t,newValue:e}:p(t,e)}function d(t){if(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t))return!0;switch(t.type){case"complete":return!1;case"collection":{const e=t;for(const t of e.added)if(!d(t))return!1;for(const t of e.removed)if(!d(t))return!1;for(const t of e.changed)if(!d(t))return!1;return!0}case"partial":for(const e in t.diff){if(!d(t.diff[e]))return!1}return!0}}


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

/***/ "../node_modules/@arcgis/core/layers/support/CodedValue.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/CodedValue.js ***!
  \*****************************************************************/
/*! exports provided: CodedValue, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CodedValue", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.name=null,this.code=null}clone(){return new t({name:this.name,code:this.code})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[String,Number],json:{write:!0}})],p.prototype,"code",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.CodedValue")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/CodedValueDomain.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/CodedValueDomain.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _CodedValue_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./CodedValue.js */ "../node_modules/@arcgis/core/layers/support/CodedValue.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let d=p=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(e){super(e),this.codedValues=null,this.type="coded-value"}getName(e){let o=null;if(this.codedValues){const r=String(e);this.codedValues.some((e=>(String(e.code)===r&&(o=e.name),!!o)))}return o}clone(){return new p({codedValues:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.codedValues),name:this.name})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_CodedValue_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{write:!0}})],d.prototype,"codedValues",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({codedValue:"coded-value"})],d.prototype,"type",void 0),d=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.CodedValueDomain")],d);var i=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/Domain.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/Domain.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const c=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({inherited:"inherited",codedValue:"coded-value",range:"range"});let a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r),this.name=null,this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],a.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(c)],a.prototype,"type",void 0),a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.support.Domain")],a);var i=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FeatureTemplate.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FeatureTemplate.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({esriFeatureEditToolAutoCompletePolygon:"auto-complete-polygon",esriFeatureEditToolCircle:"circle",esriFeatureEditToolEllipse:"ellipse",esriFeatureEditToolFreehand:"freehand",esriFeatureEditToolLine:"line",esriFeatureEditToolNone:"none",esriFeatureEditToolPoint:"point",esriFeatureEditToolPolygon:"polygon",esriFeatureEditToolRectangle:"rectangle",esriFeatureEditToolArrow:"arrow",esriFeatureEditToolTriangle:"triangle",esriFeatureEditToolLeftArrow:"left-arrow",esriFeatureEditToolRightArrow:"right-arrow",esriFeatureEditToolUpArrow:"up-arrow",esriFeatureEditToolDownArrow:"down-arrow"});let n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.name=null,this.description=null,this.drawingTool=null,this.prototype=null,this.thumbnail=null}writeDrawingTool(o,r){r.drawingTool=a.toJSON(o)}writePrototype(o,r){r.prototype=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["fixJson"])(Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(o),!0)}writeThumbnail(o,r){r.thumbnail=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["fixJson"])(Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(o))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{write:!0}})],n.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{write:!0}})],n.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{read:a.read,write:a.write}})],n.prototype,"drawingTool",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("drawingTool")],n.prototype,"writeDrawingTool",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{write:!0}})],n.prototype,"prototype",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("prototype")],n.prototype,"writePrototype",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{write:!0}})],n.prototype,"thumbnail",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("thumbnail")],n.prototype,"writeThumbnail",null),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.support.FeatureTemplate")],n);var u=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FeatureType.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FeatureType.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./CodedValueDomain.js */ "../node_modules/@arcgis/core/layers/support/CodedValueDomain.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/* harmony import */ var _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./InheritedDomain.js */ "../node_modules/@arcgis/core/layers/support/InheritedDomain.js");
/* harmony import */ var _RangeDomain_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./RangeDomain.js */ "../node_modules/@arcgis/core/layers/support/RangeDomain.js");
/* harmony import */ var _FeatureTemplate_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./FeatureTemplate.js */ "../node_modules/@arcgis/core/layers/support/FeatureTemplate.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.id=null,this.name=null,this.domains=null,this.templates=null}readDomains(o){const r={};for(const e in o)if(o.hasOwnProperty(e)){const t=o[e];switch(t.type){case"range":r[e]=_RangeDomain_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON(t);break;case"codedValue":r[e]=_CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_10__["default"].fromJSON(t);break;case"inherited":r[e]=_InheritedDomain_js__WEBPACK_IMPORTED_MODULE_12__["default"].fromJSON(t)}}return r}writeDomains(o,r){const t={};for(const e in o)o.hasOwnProperty(e)&&(t[e]=o[e]&&o[e].toJSON());Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["fixJson"])(t),r.domains=t}readTemplates(o){return o&&o.map((o=>new _FeatureTemplate_js__WEBPACK_IMPORTED_MODULE_14__["default"](o)))}writeTemplates(o,r){r.templates=o&&o.map((o=>o.toJSON()))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!0}})],l.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!0}})],l.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!0}})],l.prototype,"domains",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("domains")],l.prototype,"readDomains",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("domains")],l.prototype,"writeDomains",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!0}})],l.prototype,"templates",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("templates")],l.prototype,"readTemplates",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("templates")],l.prototype,"writeTemplates",null),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.support.FeatureType")],l);var d=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FetchAssociatedFeatureLayer.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FetchAssociatedFeatureLayer.js ***!
  \**********************************************************************************/
/*! exports provided: FetchAssociatedFeatureLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FetchAssociatedFeatureLayer", function() { return l; });
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../kernel.js */ "../node_modules/@arcgis/core/kernel.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../FeatureLayer.js */ "../node_modules/@arcgis/core/layers/FeatureLayer.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../portal/PortalItem.js */ "../node_modules/@arcgis/core/portal/PortalItem.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class l{constructor(t,r,e,a){this.parsedUrl=t,this.portalItem=r,this.apiKey=e,this.signal=a,this.rootDocument=null;const i=this.parsedUrl.path.match(/^(.*)\/SceneServer\/layers\/([\d]*)\/?$/i);i&&(this.urlParts={root:i[1],layerId:parseInt(i[2],10)})}async fetch(){var t;if(!this.urlParts)return null;const r=null!=(t=this.portalItem)?t:await this.portalItemFromServiceItemId();if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(r))return this.loadFromUrl();const a=await this.findAndLoadRelatedPortalItem(r);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(a)?null:this.loadFeatureLayerFromPortalItem(a)}async fetchPortalItem(){var t;if(!this.urlParts)return null;const r=null!=(t=this.portalItem)?t:await this.portalItemFromServiceItemId();return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(r)?null:this.findAndLoadRelatedPortalItem(r)}async fetchRootDocument(){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.rootDocument))return this.rootDocument;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(this.urlParts))return this.rootDocument={},{};const t={query:{f:"json",token:this.apiKey},responseType:"json",signal:this.signal},i=`${this.urlParts.root}/SceneServer`;try{const e=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(i,t);this.rootDocument=e.data}catch{this.rootDocument={}}return this.rootDocument}async fetchServiceOwningPortalUrl(){var e;const a=null==(e=_kernel_js__WEBPACK_IMPORTED_MODULE_0__["id"])?void 0:e.findServerInfo(this.parsedUrl.path);if(null!=a&&a.owningSystemUrl)return a.owningSystemUrl;const s=this.parsedUrl.path.replace(/(.*\/rest)\/.*/i,"$1")+"/info";try{const t=(await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(s,{query:{f:"json"},responseType:"json",signal:this.signal})).data.owningSystemUrl;if(t)return t}catch(n){Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["throwIfAbortError"])(n)}return null}async findAndLoadRelatedPortalItem(t){try{return(await t.fetchRelatedItems({relationshipType:"Service2Service",direction:"reverse"},{signal:this.signal})).find((t=>"Feature Service"===t.type))||null}catch(r){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["throwIfAbortError"])(r),null}}async loadFeatureLayerFromPortalItem(t){await t.load({signal:this.signal});const r=await this.findMatchingAssociatedSublayerUrl(t.url);return new _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_4__["default"]({url:r,portalItem:t}).load({signal:this.signal})}async loadFromUrl(){const t=await this.findMatchingAssociatedSublayerUrl(`${this.urlParts.root}/FeatureServer`);return new _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_4__["default"]({url:t}).load({signal:this.signal})}async findMatchingAssociatedSublayerUrl(t){const e=t.replace(/^(.*FeatureServer)(\/[\d]*\/?)?$/i,"$1"),a={query:{f:"json"},responseType:"json",authMode:"no-prompt",signal:this.signal},i=this.urlParts.layerId,s=this.fetchRootDocument(),n=Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(e,a),[o,l]=await Promise.all([n,s]),c=l&&l.layers,h=o.data&&o.data.layers;if(!Array.isArray(h))throw new Error("expected layers array");if(Array.isArray(c))for(let r=0;r<Math.min(c.length,h.length);r++){if(c[r].id===i)return`${e}/${h[r].id}`}else if(i<h.length)return`${e}/${h[i].id}`;throw new Error("could not find matching associated sublayer")}async portalItemFromServiceItemId(){const t=(await this.fetchRootDocument()).serviceItemId;if(!t)return null;const r=new _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_6__["default"]({id:t,apiKey:this.apiKey}),e=await this.fetchServiceOwningPortalUrl();Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e)&&(r.portal=new _portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__["default"]({url:e}));try{return r.load({signal:this.signal})}catch(s){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["throwIfAbortError"])(s),null}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/Field.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/Field.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _domains_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./domains.js */ "../node_modules/@arcgis/core/layers/support/domains.js");
/* harmony import */ var _fieldType_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./fieldType.js */ "../node_modules/@arcgis/core/layers/support/fieldType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;const c=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({binary:"binary",coordinate:"coordinate",countOrAmount:"count-or-amount",dateAndTime:"date-and-time",description:"description",locationOrPlaceName:"location-or-place-name",measurement:"measurement",nameOrTitle:"name-or-title",none:"none",orderedOrRanked:"ordered-or-ranked",percentageOrRatio:"percentage-or-ratio",typeOrCategory:"type-or-category",uniqueIdentifier:"unique-identifier"});let m=u=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(e){super(e),this.alias=null,this.defaultValue=void 0,this.description=null,this.domain=null,this.editable=!0,this.length=-1,this.name=null,this.nullable=!0,this.type=null,this.valueType=null}readDescription(e,{description:t}){let o;try{o=JSON.parse(t)}catch(r){}return o?o.value:null}readValueType(e,{description:t}){let o;try{o=JSON.parse(t)}catch(r){}return o?c.fromJSON(o.fieldValueType):null}clone(){return new u({alias:this.alias,defaultValue:this.defaultValue,description:this.description,domain:this.domain&&this.domain.clone()||null,editable:this.editable,length:this.length,name:this.name,nullable:this.nullable,type:this.type,valueType:this.valueType})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],m.prototype,"alias",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[String,Number],json:{write:{allowNull:!0}}})],m.prototype,"defaultValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],m.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("description")],m.prototype,"readDescription",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_domains_js__WEBPACK_IMPORTED_MODULE_10__["types"],json:{read:{reader:_domains_js__WEBPACK_IMPORTED_MODULE_10__["fromJSON"]},write:!0}})],m.prototype,"domain",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],m.prototype,"editable",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"],json:{write:!0}})],m.prototype,"length",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],m.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],m.prototype,"nullable",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(_fieldType_js__WEBPACK_IMPORTED_MODULE_11__["kebabDict"])],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],m.prototype,"valueType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("valueType",["description"])],m.prototype,"readValueType",null),m=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.layers.support.Field")],m);var y=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/I3SLayerDefinitions.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/I3SLayerDefinitions.js ***!
  \**************************************************************************/
/*! exports provided: I3SGeometryAttribute, I3SGeometryBuffer, I3SGeometryCompressedAttributes, I3SGeometryDefinition, I3SMaterialDefinition, I3SMaterialPBRMetallicRoughness, I3SMaterialTexture, I3SNodePageDefinition, I3STextureFormat, I3STextureSetDefinition */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SGeometryAttribute", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SGeometryBuffer", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SGeometryCompressedAttributes", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SGeometryDefinition", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SMaterialDefinition", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SMaterialPBRMetallicRoughness", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SMaterialTexture", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3SNodePageDefinition", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3STextureFormat", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I3STextureSetDefinition", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.nodesPerPage=null,this.rootIndex=0,this.lodSelectionMetricType=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],s.prototype,"nodesPerPage",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],s.prototype,"rootIndex",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],s.prototype,"lodSelectionMetricType",void 0),s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SNodePageDefinition")],s);let i=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.factor=1}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{read:{source:"textureSetDefinitionId"}}})],i.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],i.prototype,"factor",void 0),i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SMaterialTexture")],i);let a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.baseColorFactor=[1,1,1,1],this.baseColorTexture=null,this.metallicRoughnessTexture=null,this.metallicFactor=1,this.roughnessFactor=1}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[Number]})],a.prototype,"baseColorFactor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:i})],a.prototype,"baseColorTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:i})],a.prototype,"metallicRoughnessTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],a.prototype,"metallicFactor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],a.prototype,"roughnessFactor",void 0),a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SMaterialPBRMetallicRoughness")],a);let l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.alphaMode="opaque",this.alphaCutoff=.25,this.doubleSided=!1,this.cullFace="none",this.normalTexture=null,this.occlusionTexture=null,this.emissiveTexture=null,this.emissiveFactor=null,this.pbrMetallicRoughness=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({opaque:"opaque",mask:"mask",blend:"blend"})],l.prototype,"alphaMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],l.prototype,"alphaCutoff",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean})],l.prototype,"doubleSided",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({none:"none",back:"back",front:"front"})],l.prototype,"cullFace",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:i})],l.prototype,"normalTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:i})],l.prototype,"occlusionTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:i})],l.prototype,"emissiveTexture",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[Number]})],l.prototype,"emissiveFactor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:a})],l.prototype,"pbrMetallicRoughness",void 0),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SMaterialDefinition")],l);let n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{read:{source:["name","index"],reader:(e,t)=>null!=e?e:`${t.index}`}}})],n.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({jpg:"jpg",png:"png",dds:"dds","ktx-etc2":"ktx-etc2",ktx2:"ktx2",basis:"basis"})],n.prototype,"format",void 0),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3STextureFormat")],n);let u=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.atlas=!1}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[n]})],u.prototype,"formats",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean})],u.prototype,"atlas",void 0),u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3STextureSetDefinition")],u);let y=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({Float32:"Float32",UInt64:"UInt64",UInt32:"UInt32",UInt16:"UInt16",UInt8:"UInt8"})],y.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],y.prototype,"component",void 0),y=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SGeometryAttribute")],y);let d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({draco:"draco"})],d.prototype,"encoding",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[String]})],d.prototype,"attributes",void 0),d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SGeometryCompressedAttributes")],d);let c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.offset=0}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],c.prototype,"offset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"position",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"normal",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"uv0",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"uvRegion",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"featureId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:y})],c.prototype,"faceRange",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:d})],c.prototype,"compressedAttributes",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SGeometryBuffer")],c);let m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({triangle:"triangle"})],m.prototype,"topology",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],m.prototype,"geometryBuffers",void 0),m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layer.support.I3SGeometryDefinition")],m);


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/InheritedDomain.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/InheritedDomain.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.type="inherited"}clone(){return new t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({inherited:"inherited"})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.InheritedDomain")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/LayerFloorInfo.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/LayerFloorInfo.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let i=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.floorField=null,this.viewAllMode=!1,this.viewAllLevelIds=new _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"]}clone(){return new l({floorField:this.floorField,viewAllMode:this.viewAllMode,viewAllLevelIds:this.viewAllLevelIds})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],i.prototype,"floorField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{read:!1,write:!1}})],i.prototype,"viewAllMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{read:!1,write:!1}})],i.prototype,"viewAllLevelIds",void 0),i=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.LayerFloorInfo")],i);var p=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/RangeDomain.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/RangeDomain.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let n=s=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(e){super(e),this.maxValue=null,this.minValue=null,this.type="range"}clone(){return new s({maxValue:this.maxValue,minValue:this.minValue,name:this.name})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,json:{type:[Number],read:{source:"range",reader:(e,r)=>r.range&&r.range[1]},write:{enabled:!1,overridePolicy(){return{enabled:null!=this.maxValue&&null==this.minValue}},target:"range",writer(e,r,a){r[a]=[this.minValue||0,e]}}}})],n.prototype,"maxValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,json:{type:[Number],read:{source:"range",reader:(e,r)=>r.range&&r.range[0]},write:{target:"range",writer(e,r,a){r[a]=[e,this.maxValue||0]}}}})],n.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({range:"range"})],n.prototype,"type",void 0),n=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.RangeDomain")],n);var i=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/capabilities.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/capabilities.js ***!
  \*******************************************************************/
/*! exports provided: zeroCapabilities */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "zeroCapabilities", function() { return s; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s={attachment:{supportsContentType:!1,supportsExifInfo:!1,supportsKeywords:!1,supportsName:!1,supportsSize:!1},data:{isVersioned:!1,supportsAttachment:!1,supportsM:!1,supportsZ:!1},editing:{supportsDeleteByAnonymous:!1,supportsDeleteByOthers:!1,supportsGeometryUpdate:!1,supportsGlobalId:!1,supportsReturnServiceEditsInSourceSpatialReference:!1,supportsRollbackOnFailure:!1,supportsUpdateByAnonymous:!1,supportsUpdateByOthers:!1,supportsUpdateWithoutM:!1,supportsUploadWithItemId:!1},metadata:{supportsAdvancedFieldProperties:!1},operations:{supportsCalculate:!1,supportsTruncate:!1,supportsValidateSql:!1,supportsAdd:!1,supportsDelete:!1,supportsEditing:!1,supportsChangeTracking:!1,supportsQuery:!1,supportsQueryAttachments:!1,supportsResizeAttachments:!1,supportsSync:!1,supportsUpdate:!1,supportsExceedsLimitStatistics:!1},queryRelated:{supportsCount:!1,supportsOrderBy:!1,supportsPagination:!1},query:{maxRecordCount:0,maxRecordCountFactor:0,standardMaxRecordCount:0,supportsCacheHint:!1,supportsCentroid:!1,supportsDisjointSpatialRelationship:!1,supportsDistance:!1,supportsDistinct:!1,supportsExtent:!1,supportsFormatPBF:!1,supportsGeometryProperties:!1,supportsHavingClause:!1,supportsHistoricMoment:!1,supportsMaxRecordCountFactor:!1,supportsOrderBy:!1,supportsPagination:!1,supportsPercentileStatistics:!1,supportsQuantization:!1,supportsQuantizationEditMode:!1,supportsQueryByOthers:!1,supportsQueryGeometry:!1,supportsResultType:!1,supportsSqlExpression:!1,supportsStandardizedQueriesOnly:!1,supportsTopFeaturesQuery:!1,supportsStatistics:!1,tileMaxRecordCount:0}};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/domains.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/domains.js ***!
  \**************************************************************/
/*! exports provided: CodedValueDomain, DomainBase, InheritedDomain, RangeDomain, fromJSON, types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return n; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CodedValueDomain.js */ "../node_modules/@arcgis/core/layers/support/CodedValueDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CodedValueDomain", function() { return _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomainBase", function() { return _Domain_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./InheritedDomain.js */ "../node_modules/@arcgis/core/layers/support/InheritedDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InheritedDomain", function() { return _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./RangeDomain.js */ "../node_modules/@arcgis/core/layers/support/RangeDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RangeDomain", function() { return _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n={key:"type",base:_Domain_js__WEBPACK_IMPORTED_MODULE_2__["default"],typeMap:{range:_RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"],"coded-value":_CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"],inherited:_InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"]}};function t(o){if(!o||!o.type)return null;switch(o.type){case"range":return _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromJSON(o);case"codedValue":return _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromJSON(o);case"inherited":return _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(o)}return null}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/fieldType.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/fieldType.js ***!
  \****************************************************************/
/*! exports provided: kebabDict */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "kebabDict", function() { return i; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"]({esriFieldTypeSmallInteger:"small-integer",esriFieldTypeInteger:"integer",esriFieldTypeSingle:"single",esriFieldTypeDouble:"double",esriFieldTypeLong:"long",esriFieldTypeString:"string",esriFieldTypeDate:"date",esriFieldTypeOID:"oid",esriFieldTypeGeometry:"geometry",esriFieldTypeBlob:"blob",esriFieldTypeRaster:"raster",esriFieldTypeGUID:"guid",esriFieldTypeGlobalID:"global-id",esriFieldTypeXML:"xml"});


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js":
/*!*******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js ***!
  \*******************************************************************************************/
/*! exports provided: getInputValueType, getTransformationType, isSizeVariable, isValidNumber */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInputValueType", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTransformationType", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSizeVariable", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidNumber", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){return n&&"esri.renderers.visualVariables.SizeVariable"===n.declaredClass}function e(n){return null!=n&&!isNaN(n)&&isFinite(n)}function i(n){return n.valueExpression?"expression":n.field&&"string"==typeof n.field?"field":"unknown"}function l(n,e){const l=e||i(n),a=n.valueUnit||"unknown";return"unknown"===l?"constant":n.stops?"stops":null!=n.minSize&&null!=n.maxSize&&null!=n.minDataValue&&null!=n.maxDataValue?"clamped-linear":"unknown"===a?null!=n.minSize&&null!=n.minDataValue?n.minSize&&n.minDataValue?"proportional":"additive":"identity":"real-world-size"}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/queryZScale.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/queryZScale.js ***!
  \*************************************************************************/
/*! exports provided: applyFeatureSetZUnitScaling */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyFeatureSetZUnitScaling", function() { return t; });
/* harmony import */ var _zscale_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./zscale.js */ "../node_modules/@arcgis/core/rest/query/operations/zscale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,o,r){if(!r||!r.features||!r.hasZ)return;const f=Object(_zscale_js__WEBPACK_IMPORTED_MODULE_0__["getGeometryZScaler"])(r.geometryType,o,t.outSpatialReference);if(f)for(const e of r.features)f(e.geometry)}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/zscale.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/zscale.js ***!
  \********************************************************************/
/*! exports provided: getGeometryZScaler, unapplyEditsZUnitScaling */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getGeometryZScaler", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unapplyEditsZUnitScaling", function() { return l; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t,c,l){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(c)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(l)||l.vcsWkid||Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_2__["equals"])(c,l))return null;const u=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_1__["getMetersPerVerticalUnitForSR"])(c)/Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_1__["getMetersPerVerticalUnitForSR"])(l);if(1===u)return null;switch(t){case"point":case"esriGeometryPoint":return n=>i(n,u);case"polyline":case"esriGeometryPolyline":return n=>s(n,u);case"polygon":case"esriGeometryPolygon":return n=>r(n,u);case"multipoint":case"esriGeometryMultipoint":return n=>f(n,u);default:return null}}function i(n,o){n&&null!=n.z&&(n.z*=o)}function r(n,o){if(n)for(const e of n.rings)for(const n of e)n.length>2&&(n[2]*=o)}function s(n,o){if(n)for(const e of n.paths)for(const n of e)n.length>2&&(n[2]*=o)}function f(n,o){if(n)for(const e of n.points)e.length>2&&(e[2]*=o)}function c(n,o,e){if(null==n.hasM||n.hasZ)for(const t of o)for(const n of t)n.length>2&&(n[2]*=e)}function l(n,e,t){if(!n&&!e||!t)return;const i=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_1__["getMetersPerVerticalUnitForSR"])(t);u(n,t,i),u(e,t,i)}function u(n,o,e){if(n)for(const t of n)a(t.geometry,o,e)}function a(t,i,r){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(t)||!t.spatialReference||Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_2__["equals"])(t.spatialReference,i))return;const s=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_1__["getMetersPerVerticalUnitForSR"])(t.spatialReference)/r;if(1!==s)if("x"in t)null!=t.z&&(t.z*=s);else if("rings"in t)c(t,t.rings,s);else if("paths"in t)c(t,t.paths,s);else if("points"in t&&(null==t.hasM||t.hasZ))for(const n of t.points)n.length>2&&(n[2]*=s)}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/defaultsJSON.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/defaultsJSON.js ***!
  \********************************************************************/
/*! exports provided: defaultColor, defaultOutlineColor, defaultPointSymbolJSON, defaultPolygonSymbolJSON, defaultPolylineSymbolJSON, defaultTextSymbolJSON, errorPointSymbolJSON, errorPolygonSymbolJSON, errorPolylineSymbolJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultColor", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultOutlineColor", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPointSymbolJSON", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolygonSymbolJSON", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolylineSymbolJSON", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTextSymbolJSON", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPointSymbolJSON", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolygonSymbolJSON", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolylineSymbolJSON", function() { return s; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=[252,146,31,255],i=[153,153,153,255],l={type:"esriSMS",style:"esriSMSCircle",size:6,color:e,outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[153,153,153,255]}},o={type:"esriSLS",style:"esriSLSSolid",width:.75,color:e},S={type:"esriSFS",style:"esriSFSSolid",color:[252,146,31,196],outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[255,255,255,191]}},t={type:"esriTS",color:[255,255,255,255],font:{family:"arial-unicode-ms",size:10,weight:"bold"},horizontalAlignment:"center",kerning:!0,haloColor:[0,0,0,255],haloSize:1,rotated:!1,text:"",xoffset:0,yoffset:0,angle:0},r={type:"esriSMS",style:"esriSMSCircle",color:[0,0,0,255],outline:null,size:10.5},s={type:"esriSLS",style:"esriSLSSolid",color:[0,0,0,255],width:1.5},y={type:"esriSFS",style:"esriSFSSolid",color:[0,0,0,255],outline:null};


/***/ })

};;
//# sourceMappingURL=41.render-page.js.map
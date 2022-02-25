exports.ids = [62];
exports.modules = {

/***/ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/persistableUrlUtils.js ***!
  \******************************************************************/
/*! exports provided: f, i, p, r, t, w */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return p; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function c(r,o){const s=o&&o.url&&o.url.path;if(r&&s&&(r=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(r,s,{preserveProtocolRelative:!0}),o.portalItem&&o.readResourcePaths)){const e=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeRelative"])(r,o.portalItem.itemUrl);h.test(e)&&o.readResourcePaths.push(o.portalItem.resourceFromPath(e).path)}return I(r,o&&o.portal)}function i(r,a,u=0){if(!r)return r;!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(r)&&a&&a.blockedRelativeUrls&&a.blockedRelativeUrls.push(r);let n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(r);if(a){const e=a.verifyItemRelativeUrls&&a.verifyItemRelativeUrls.rootPath||a.url&&a.url.path;if(e){const o=I(e,a.portal);n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeRelative"])(I(n,a.portal),o,o),n!==r&&a.verifyItemRelativeUrls&&a.verifyItemRelativeUrls.writtenUrls.push(n)}}return n=U(n,a&&a.portal),Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(n)&&(n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["normalize"])(n)),null!=a&&a.resources&&null!=a&&a.portalItem&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(n)&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isDataProtocol"])(n)&&0===u&&a.resources.toKeep.push({resource:a.portalItem.resourceFromPath(n)}),n}function m(r,e,t){return c(r,t)}function p(r,e,t,o){const s=i(r,o);void 0!==s&&(e[t]=s)}const f=/\/items\/([^\/]+)\/resources\//,h=/^\.\/resources\//;function v(e){const t=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e)?e.match(f):null;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(t)?t[1]:null}function U(r,e){return e&&!e.isPortal&&e.urlKey&&e.customBaseUrl?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,`${e.urlKey}.${e.customBaseUrl}`,e.portalHostname):r}function I(r,e){if(!e||e.isPortal||!e.urlKey||!e.customBaseUrl)return r;const t=`${e.urlKey}.${e.customBaseUrl}`;return Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["hasSameOrigin"])(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["appUrl"],`${_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["appUrl"].scheme}://${t}`)?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,e.portalHostname,t):Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,t,e.portalHostname)}var R=Object.freeze({__proto__:null,fromJSON:c,toJSON:i,read:m,write:p,itemIdFromResourceUrl:v});


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

/***/ "../node_modules/@arcgis/core/intl.js":
/*!********************************************!*\
  !*** ../node_modules/@arcgis/core/intl.js ***!
  \********************************************/
/*! exports provided: convertDateFormatToIntlOptions, formatDate, convertNumberFormatToIntlOptions, formatNumber, substitute, getLocale, onLocaleChange, prefersRTL, setLocale, fetchMessageBundle, normalizeMessageBundleLocale, registerMessageBundleLoader, createJSONLoader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _intl_date_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./intl/date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "convertDateFormatToIntlOptions", function() { return _intl_date_js__WEBPACK_IMPORTED_MODULE_0__["convertDateFormatToIntlOptions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "formatDate", function() { return _intl_date_js__WEBPACK_IMPORTED_MODULE_0__["formatDate"]; });

/* harmony import */ var _intl_number_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./intl/number.js */ "../node_modules/@arcgis/core/intl/number.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "convertNumberFormatToIntlOptions", function() { return _intl_number_js__WEBPACK_IMPORTED_MODULE_1__["convertNumberFormatToIntlOptions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "formatNumber", function() { return _intl_number_js__WEBPACK_IMPORTED_MODULE_1__["formatNumber"]; });

/* harmony import */ var _intl_substitute_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./intl/substitute.js */ "../node_modules/@arcgis/core/intl/substitute.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "substitute", function() { return _intl_substitute_js__WEBPACK_IMPORTED_MODULE_2__["substitute"]; });

/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getLocale", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["getLocale"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "onLocaleChange", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["onLocaleChange"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "prefersRTL", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["prefersRTL"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setLocale", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["setLocale"]; });

/* harmony import */ var _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./intl/messages.js */ "../node_modules/@arcgis/core/intl/messages.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "fetchMessageBundle", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["fetchMessageBundle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "normalizeMessageBundleLocale", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["normalizeMessageBundleLocale"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "registerMessageBundleLoader", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["registerMessageBundleLoader"]; });

/* harmony import */ var _intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./intl/t9n.js */ "../node_modules/@arcgis/core/intl/t9n.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createJSONLoader", function() { return _intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__["createJSONLoader"]; });

/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./assets.js */ "../node_modules/@arcgis/core/assets.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
Object(_intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["registerMessageBundleLoader"])(Object(_intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__["createJSONLoader"])({pattern:"esri/",location:_assets_js__WEBPACK_IMPORTED_MODULE_6__["getAssetUrl"]}));


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/date.js":
/*!*************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/date.js ***!
  \*************************************************/
/*! exports provided: convertDateFormatToIntlOptions, dateFormats, dictionary, formatDate, fromJSON, getDateTimeFormatter, toJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertDateFormatToIntlOptions", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dateFormats", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dictionary", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatDate", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDateTimeFormatter", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toJSON", function() { return y; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const r={year:"numeric",month:"numeric",day:"numeric"},n={year:"numeric",month:"long",day:"numeric"},a={year:"numeric",month:"short",day:"numeric"},h={year:"numeric",month:"long",weekday:"long",day:"numeric"},m={hour:"numeric",minute:"numeric"},i={...m,second:"numeric"},s={"short-date":r,"short-date-short-time":{...r,...m},"short-date-short-time-24":{...r,...m,hour12:!1},"short-date-long-time":{...r,...i},"short-date-long-time-24":{...r,...i,hour12:!1},"short-date-le":r,"short-date-le-short-time":{...r,...m},"short-date-le-short-time-24":{...r,...m,hour12:!1},"short-date-le-long-time":{...r,...i},"short-date-le-long-time-24":{...r,...i,hour12:!1},"long-month-day-year":n,"long-month-day-year-short-time":{...n,...m},"long-month-day-year-short-time-24":{...n,...m,hour12:!1},"long-month-day-year-long-time":{...n,...i},"long-month-day-year-long-time-24":{...n,...i,hour12:!1},"day-short-month-year":a,"day-short-month-year-short-time":{...a,...m},"day-short-month-year-short-time-24":{...a,...m,hour12:!1},"day-short-month-year-long-time":{...a,...i},"day-short-month-year-long-time-24":{...a,...i,hour12:!1},"long-date":h,"long-date-short-time":{...h,...m},"long-date-short-time-24":{...h,...m,hour12:!1},"long-date-long-time":{...h,...i},"long-date-long-time-24":{...h,...i,hour12:!1},"long-month-year":{month:"long",year:"numeric"},"short-month-year":{month:"short",year:"numeric"},year:{year:"numeric"},"short-time":m,"long-time":i},l=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({shortDate:"short-date",shortDateShortTime:"short-date-short-time",shortDateShortTime24:"short-date-short-time-24",shortDateLongTime:"short-date-long-time",shortDateLongTime24:"short-date-long-time-24",shortDateLE:"short-date-le",shortDateLEShortTime:"short-date-le-short-time",shortDateLEShortTime24:"short-date-le-short-time-24",shortDateLELongTime:"short-date-le-long-time",shortDateLELongTime24:"short-date-le-long-time-24",longMonthDayYear:"long-month-day-year",longMonthDayYearShortTime:"long-month-day-year-short-time",longMonthDayYearShortTime24:"long-month-day-year-short-time-24",longMonthDayYearLongTime:"long-month-day-year-long-time",longMonthDayYearLongTime24:"long-month-day-year-long-time-24",dayShortMonthYear:"day-short-month-year",dayShortMonthYearShortTime:"day-short-month-year-short-time",dayShortMonthYearShortTime24:"day-short-month-year-short-time-24",dayShortMonthYearLongTime:"day-short-month-year-long-time",dayShortMonthYearLongTime24:"day-short-month-year-long-time-24",longDate:"long-date",longDateShortTime:"long-date-short-time",longDateShortTime24:"long-date-short-time-24",longDateLongTime:"long-date-long-time",longDateLongTime24:"long-date-long-time-24",longMonthYear:"long-month-year",shortMonthYear:"short-month-year",year:"year"}),g=l.apiValues,y=l.toJSON.bind(l),d=l.fromJSON.bind(l),u={ar:"ar-u-nu-latn-ca-gregory"};let c=new WeakMap,D=s["short-date-short-time"];function T(t){const o=t||D;if(!c.has(o)){const t=Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])(),r=u[Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])()]||t;c.set(o,new Intl.DateTimeFormat(r,o))}return c.get(o)}function S(t){return s[t]||null}function L(t,o){return T(o).format(t)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["beforeLocaleChange"])((()=>{c=new WeakMap,D=s["short-date-short-time"]}));


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/locale.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/locale.js ***!
  \***************************************************/
/*! exports provided: beforeLocaleChange, getDefaultLocale, getLanguage, getLocale, onLocaleChange, prefersRTL, setLocale */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "beforeLocaleChange", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultLocale", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLanguage", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLocale", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onLocaleChange", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefersRTL", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLocale", function() { return a; });
/* harmony import */ var _core_global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/global.js */ "../node_modules/@arcgis/core/core/global.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var o,l,e;let t,r;const u=null!=(o=null==(l=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].esriConfig)?void 0:l.locale)?o:null==(e=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].dojoConfig)?void 0:e.locale;function c(){var o,l;return null!=(o=null!=u?u:null==(l=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].navigator)?void 0:l.language)?o:"en"}function i(){return void 0===r&&(r=c()),r}function a(n){t=n||void 0,m()}function s(n=i()){const o=/^([a-zA-Z]{2,3})(?:[_\-]\w+)*$/.exec(n);return null==o?void 0:o[1].toLowerCase()}const f={he:!0,ar:!0};function v(n=i()){const o=s(n);return void 0!==o&&(f[o]||!1)}const d=[];function g(n){return d.push(n),{remove(){d.splice(d.indexOf(n),1)}}}const h=[];function p(n){return h.push(n),{remove(){d.splice(h.indexOf(n),1)}}}function m(){var n;const o=null!=(n=t)?n:c();r!==o&&(r=o,[...h].forEach((n=>{n.call(null,o)})),[...d].forEach((n=>{n.call(null,o)})))}null==_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].addEventListener||_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].addEventListener("languagechange",m);


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/messages.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/messages.js ***!
  \*****************************************************/
/*! exports provided: fetchMessageBundle, normalizeMessageBundleLocale, registerMessageBundleLoader, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchMessageBundle", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeMessageBundleLocale", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerMessageBundleLoader", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return p; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=/^([a-z]{2})(?:[-_]([A-Za-z]{2}))?$/,o={ar:!0,bs:!0,ca:!0,cs:!0,da:!0,de:!0,el:!0,en:!0,es:!0,et:!0,fi:!0,fr:!0,he:!0,hr:!0,hu:!0,id:!0,it:!0,ja:!0,ko:!0,lt:!0,lv:!0,nb:!0,nl:!0,pl:!0,"pt-BR":!0,"pt-PT":!0,ro:!0,ru:!0,sk:!0,sl:!0,sr:!0,sv:!0,th:!0,tr:!0,uk:!0,vi:!0,"zh-CN":!0,"zh-HK":!0,"zh-TW":!0};function i(t){var e;return null!=(e=o[t])&&e}const a=[],c=new Map;function d(t){for(const e of c.keys())m(t.pattern,e)&&c.delete(e)}function l(t){return a.includes(t)||(d(t),a.unshift(t)),{remove(){const e=a.indexOf(t);e>-1&&(a.splice(e,1),d(t))}}}async function u(t){const e=Object(_locale_js__WEBPACK_IMPORTED_MODULE_2__["getLocale"])();c.has(t)||c.set(t,f(t,e));const n=c.get(t);return await _.add(n),n}function h(t){if(!s.test(t))return null;const[,e,n]=s.exec(t),r=e+(n?"-"+n.toUpperCase():"");return i(r)?r:i(e)?e:null}async function f(e,n){const r=[];for(const t of a)if(m(t.pattern,e))try{return await t.fetchMessageBundle(e,n)}catch(s){r.push(s)}if(r.length)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("intl:message-bundle-error",`Errors occurred while loading "${e}"`,{errors:r});throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("intl:no-message-bundle-loader",`No loader found for message bundle "${e}"`)}function m(t,e){return"string"==typeof t?e.startsWith(t):t.test(e)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_2__["beforeLocaleChange"])((()=>{c.clear()}));const _=new class{constructor(){this._numLoading=0}async waitForAll(){this._dfd&&await this._dfd.promise}add(t){return this._increase(),t.then((()=>this._decrease()),(()=>this._decrease())),this.waitForAll()}_increase(){this._numLoading++,this._dfd||(this._dfd=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["createDeferred"])())}_decrease(){this._numLoading=Math.max(this._numLoading-1,0),this._dfd&&0===this._numLoading&&(this._dfd.resolve(),this._dfd=null)}},p={cache:c,loaders:a};


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/number.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/number.js ***!
  \***************************************************/
/*! exports provided: convertNumberFormatToIntlOptions, formatNumber, getFormatter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertNumberFormatToIntlOptions", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatNumber", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFormatter", function() { return i; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a={ar:"ar-u-nu-latn"};let e=new WeakMap,o={};function i(n){const i=n||o;if(!e.has(i)){const t=Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])(),o=a[Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])()]||t;e.set(i,new Intl.NumberFormat(o,n))}return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["assumeNonNull"])(e.get(i))}function u(t={}){const n={};return null!=t.digitSeparator&&(n.useGrouping=t.digitSeparator),null!=t.places&&(n.minimumFractionDigits=n.maximumFractionDigits=t.places),n}function m(t,n){return i(n).format(t)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["beforeLocaleChange"])((()=>{e=new WeakMap,o={}}));


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/substitute.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/substitute.js ***!
  \*******************************************************/
/*! exports provided: substitute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "substitute", function() { return s; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _date_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony import */ var _number_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./number.js */ "../node_modules/@arcgis/core/intl/number.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.intl");function s(t,r,n={}){const{format:o={}}=n;return Object(_core_string_js__WEBPACK_IMPORTED_MODULE_2__["replace"])(t,(t=>u(t,r,o)))}function u(t,e,n){let o,i;const s=t.indexOf(":");if(-1===s?o=t.trim():(o=t.slice(0,s).trim(),i=t.slice(s+1).trim()),!o)return"";const u=Object(_core_object_js__WEBPACK_IMPORTED_MODULE_1__["getDeepValue"])(o,e);if(null==u)return"";const m=n[i]||n[o];return m?c(u,m):i?a(u,i):f(u)}function c(t,r){switch(r.type){case"date":return Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t,r.intlOptions);case"number":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t,r.intlOptions);default:return i.warn("missing format descriptor for key {key}"),f(t)}}function a(t,r){switch(r.toLowerCase()){case"dateformat":return Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t);case"numberformat":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t);default:return i.warn(`inline format is unsupported since 4.12: ${r}`),/^(dateformat|datestring)/i.test(r)?Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t):/^numberformat/i.test(r)?Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t):f(t)}}function f(t){switch(typeof t){case"string":return t;case"number":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t);case"boolean":return""+t;default:return t instanceof Date?Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t):""}}


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/t9n.js":
/*!************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/t9n.js ***!
  \************************************************/
/*! exports provided: JSONLoader, createJSONLoader, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JSONLoader", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createJSONLoader", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return l; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_global_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/global.js */ "../node_modules/@arcgis/core/core/global.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./messages.js */ "../node_modules/@arcgis/core/intl/messages.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(e,n,r,s){const a=n.exec(r);if(!a)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("esri-intl:invalid-bundle",`Bundle id "${r}" is not compatible with the pattern "${n}"`);const c=a[1]?`${a[1]}/`:"",l=a[2],h=Object(_messages_js__WEBPACK_IMPORTED_MODULE_4__["normalizeMessageBundleLocale"])(s),u=`${c}${l}.json`,w=h?`${c}${l}_${h}.json`:u;let f;try{f=await i(e(w))}catch(d){if(w===u)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("intl:unknown-bundle",`Bundle "${r}" cannot be loaded`,{error:d});try{f=await i(e(u))}catch(d){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("intl:unknown-bundle",`Bundle "${r}" cannot be loaded`,{error:d})}}return f}async function i(t){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(l.fetchBundleAsset))return l.fetchBundleAsset(t);const n=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t,{responseType:"text"});return JSON.parse(n.data)}class a{constructor({base:e="",pattern:t,location:r=new URL(window.location.href)}){let o;o="string"==typeof r?e=>new URL(e,new URL(r,_core_global_js__WEBPACK_IMPORTED_MODULE_2__["default"].location)).href:r instanceof URL?e=>new URL(e,r).href:r,this.pattern="string"==typeof t?new RegExp(`^${t}`):t,this.getAssetUrl=o,e=e?e.endsWith("/")?e:e+"/":"",this.matcher=new RegExp(`^${e}(?:(.*)/)?(.*)$`)}fetchMessageBundle(e,t){return s(this.getAssetUrl,this.matcher,e,t)}}function c(e){return new a(e)}const l={};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/GraphicsLayer.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/GraphicsLayer.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Layer.js */ "../node_modules/@arcgis/core/layers/Layer.js");
/* harmony import */ var _mixins_BlendLayer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./mixins/BlendLayer.js */ "../node_modules/@arcgis/core/layers/mixins/BlendLayer.js");
/* harmony import */ var _mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./mixins/ScaleRangeLayer.js */ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js");
/* harmony import */ var _support_GraphicsCollection_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../support/GraphicsCollection.js */ "../node_modules/@arcgis/core/support/GraphicsCollection.js");
/* harmony import */ var _symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../symbols/support/ElevationInfo.js */ "../node_modules/@arcgis/core/symbols/support/ElevationInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let n=class extends(Object(_mixins_BlendLayer_js__WEBPACK_IMPORTED_MODULE_7__["BlendLayer"])(Object(_mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_8__["ScaleRangeLayer"])(_Layer_js__WEBPACK_IMPORTED_MODULE_6__["default"]))){constructor(r){super(r),this.elevationInfo=null,this.graphics=new _support_GraphicsCollection_js__WEBPACK_IMPORTED_MODULE_9__["default"],this.screenSizePerspectiveEnabled=!0,this.type="graphics",this.internal=!1}destroy(){this.removeAll(),this.graphics.destroy()}add(r){return this.graphics.add(r),this}addMany(r){return this.graphics.addMany(r),this}removeAll(){return this.graphics.removeAll(),this}remove(r){this.graphics.remove(r)}removeMany(r){this.graphics.removeMany(r)}on(r,e){return super.on(r,e)}graphicChanged(r){this.emit("graphic-update",r)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:_symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"]})],n.prototype,"elevationInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])(Object(_support_GraphicsCollection_js__WEBPACK_IMPORTED_MODULE_9__["graphicsCollectionProperty"])())],n.prototype,"graphics",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["show","hide"]})],n.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],n.prototype,"screenSizePerspectiveEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({readOnly:!0})],n.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({constructOnly:!0})],n.prototype,"internal",void 0),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.GraphicsLayer")],n);var h=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/MapNotesLayer.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/MapNotesLayer.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return B; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _Graphic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Graphic.js */ "../node_modules/@arcgis/core/Graphic.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/MultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _geometry_projection_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../geometry/projection.js */ "../node_modules/@arcgis/core/geometry/projection.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./FeatureLayer.js */ "../node_modules/@arcgis/core/layers/FeatureLayer.js");
/* harmony import */ var _GraphicsLayer_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./GraphicsLayer.js */ "../node_modules/@arcgis/core/layers/GraphicsLayer.js");
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./Layer.js */ "../node_modules/@arcgis/core/layers/Layer.js");
/* harmony import */ var _graphics_objectIdUtils_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./graphics/objectIdUtils.js */ "../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js");
/* harmony import */ var _mixins_BlendLayer_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./mixins/BlendLayer.js */ "../node_modules/@arcgis/core/layers/mixins/BlendLayer.js");
/* harmony import */ var _mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./mixins/OperationalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js");
/* harmony import */ var _mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./mixins/PortalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js");
/* harmony import */ var _mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./mixins/ScaleRangeLayer.js */ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js");
/* harmony import */ var _support_Field_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./support/Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/* harmony import */ var _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../symbols/SimpleFillSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js");
/* harmony import */ var _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../symbols/SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony import */ var _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ../symbols/SimpleMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js");
/* harmony import */ var _symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ../symbols/TextSymbol.js */ "../node_modules/@arcgis/core/symbols/TextSymbol.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function F(e){return e.layers.some((e=>null!=e.layerDefinition.visibilityField))}const G=new _support_Field_js__WEBPACK_IMPORTED_MODULE_29__["default"]({name:"OBJECTID",alias:"OBJECTID",type:"oid",nullable:!1,editable:!1}),_=new _support_Field_js__WEBPACK_IMPORTED_MODULE_29__["default"]({name:"title",alias:"Title",type:"string",nullable:!0,editable:!0});let P=class extends _GraphicsLayer_js__WEBPACK_IMPORTED_MODULE_22__["default"]{constructor(){super(...arguments),this.visibilityMode="inherited"}initialize(){for(const e of this.graphics)e.sourceLayer=this.layer;this.graphics.on("after-add",(e=>{e.item.sourceLayer=this.layer})),this.graphics.on("after-remove",(e=>{e.item.sourceLayer=null}))}get sublayers(){return this.graphics}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],P.prototype,"sublayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])()],P.prototype,"layer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],P.prototype,"visibilityMode",void 0),P=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_16__["subclass"])("esri.layers.MapNotesLayer.MapNotesSublayer")],P);const k=[{geometryType:"polygon",geometryTypeJSON:"esriGeometryPolygon",layerId:"polygonLayer",title:"Polygons",identifyingSymbol:(new _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_30__["default"]).toJSON()},{geometryType:"polyline",geometryTypeJSON:"esriGeometryPolyline",layerId:"polylineLayer",title:"Polylines",identifyingSymbol:(new _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_31__["default"]).toJSON()},{geometryType:"multipoint",geometryTypeJSON:"esriGeometryMultipoint",layerId:"multipointLayer",title:"Multipoints",identifyingSymbol:(new _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_32__["default"]).toJSON()},{geometryType:"point",geometryTypeJSON:"esriGeometryPoint",layerId:"pointLayer",title:"Points",identifyingSymbol:(new _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_32__["default"]).toJSON()},{geometryType:"point",geometryTypeJSON:"esriGeometryPoint",layerId:"textLayer",title:"Text",identifyingSymbol:(new _symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_33__["default"]).toJSON()}];let z=class extends(Object(_mixins_BlendLayer_js__WEBPACK_IMPORTED_MODULE_25__["BlendLayer"])(Object(_mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_28__["ScaleRangeLayer"])(Object(_mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_26__["OperationalLayer"])(Object(_mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_27__["PortalLayer"])(Object(_core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_8__["MultiOriginJSONMixin"])(_Layer_js__WEBPACK_IMPORTED_MODULE_23__["default"])))))){constructor(e){super(e),this.capabilities={operations:{supportsMapNotesEditing:!0}},this.featureCollections=null,this.featureCollectionJSON=null,this.featureCollectionType="notes",this.legendEnabled=!1,this.minScale=0,this.maxScale=0,this.spatialReference=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"].WGS84,this.sublayers=new _core_Collection_js__WEBPACK_IMPORTED_MODULE_4__["default"](k.map((e=>new P({id:e.layerId,title:e.title,layer:this})))),this.title="Map Notes",this.type="map-notes",this.visibilityMode="inherited"}readCapabilities(e,t,r){return{operations:{supportsMapNotesEditing:!F(t)&&"portal-item"!==(null==r?void 0:r.origin)}}}readFeatureCollections(e,t,o){if(!F(t))return null;const i=t.layers.map((e=>{const t=new _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_21__["default"];return t.read(e,o),t}));return new _core_Collection_js__WEBPACK_IMPORTED_MODULE_4__["default"]({items:i})}readLegacyfeatureCollectionJSON(e,t){return F(t)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_6__["clone"])(t.featureCollection):null}readFullExtent(e,t){if(!t.layers.length)return new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_35__["default"]({xmin:-180,ymin:-90,xmax:180,ymax:90,spatialReference:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"].WGS84});const r=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"].fromJSON(t.layers[0].layerDefinition.spatialReference);return t.layers.reduce(((e,t)=>{const r=t.layerDefinition.extent;return r?_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_35__["default"].fromJSON(r).union(e):e}),new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_35__["default"]({spatialReference:r}))}readMinScale(e,t){for(const r of t.layers)if(null!=r.layerDefinition.minScale)return r.layerDefinition.minScale;return 0}readMaxScale(e,t){for(const r of t.layers)if(null!=r.layerDefinition.maxScale)return r.layerDefinition.maxScale;return 0}get multipointLayer(){return this._findSublayer("multipointLayer")}get pointLayer(){return this._findSublayer("pointLayer")}get polygonLayer(){return this._findSublayer("polygonLayer")}get polylineLayer(){return this._findSublayer("polylineLayer")}readSpatialReference(e,t){return t.layers.length?_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"].fromJSON(t.layers[0].layerDefinition.spatialReference):_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"].WGS84}readSublayers(e,o,i){if(F(o))return null;const l=[];for(let r=0;r<o.layers.length;r++){var a;const{layerDefinition:e,featureSet:i}=o.layers[r],n=null!=(a=e.geometryType)?a:i.geometryType,s=k.find((t=>{var r,o,i;return n===t.geometryTypeJSON&&(null==(r=e.drawingInfo)||null==(o=r.renderer)||null==(i=o.symbol)?void 0:i.type)===t.identifyingSymbol.type}));if(s){const r=new P({id:s.layerId,title:e.name,layer:this,graphics:i.features.map((({geometry:e,symbol:r,attributes:o,popupInfo:i})=>_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON({attributes:o,geometry:e,symbol:r,popupTemplate:i})))});l.push(r)}}return new _core_Collection_js__WEBPACK_IMPORTED_MODULE_4__["default"](l)}writeSublayers(e,t,r,i){const{minScale:n,maxScale:p}=this;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(e))return;const y=e.some((e=>e.graphics.length>0));if(!this.capabilities.operations.supportsMapNotesEditing){var m;if(y)null==i||null==(m=i.messages)||m.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_5__["default"]("map-notes-layer:editing-not-supported","New map notes cannot be added to this layer"));return}const u=[];let c=this.spatialReference.toJSON();e:for(const o of e)for(const e of o.graphics)if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e.geometry)){c=e.geometry.spatialReference.toJSON();break e}for(const o of k){const t=e.find((e=>o.layerId===e.id));this._writeMapNoteSublayer(u,t,o,n,p,c,i)}Object(_core_object_js__WEBPACK_IMPORTED_MODULE_9__["setDeepValue"])("featureCollection.layers",u,t)}get textLayer(){return this._findSublayer("textLayer")}load(e){return this.addResolvingPromise(this.loadFromPortal({supportedTypes:["Feature Collection"]},e)),Promise.resolve(this)}read(e,t){"featureCollection"in e&&(e=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_6__["clone"])(e),Object.assign(e,e.featureCollection)),super.read(e,t)}async beforeSave(){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(this.sublayers))return;let e=null;const t=[];for(const o of this.sublayers)for(const r of o.graphics)if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(r.geometry)){const o=r.geometry;e?Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_20__["equals"])(o.spatialReference,e)||(Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_18__["canProjectWithoutEngine"])(o.spatialReference,e)||Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_18__["isLoaded"])()||await Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_18__["load"])(),r.geometry=Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_18__["project"])(o,e)):e=o.spatialReference,t.push(r)}const r=await Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_19__["normalizeCentralMeridian"])(t.map((e=>e.geometry)));t.forEach(((e,t)=>e.geometry=r[t]))}_findSublayer(e){var t,r;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(this.sublayers)?null:null!=(t=null==(r=this.sublayers)?void 0:r.find((t=>t.id===e)))?t:null}_writeMapNoteSublayer(e,t,r,o,a,n,s){const p=[];if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(t)){for(const e of t.graphics)this._writeMapNote(p,e,r.geometryType,s);this._normalizeObjectIds(p,G),e.push({layerDefinition:{name:t.title,drawingInfo:{renderer:{type:"simple",symbol:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_6__["clone"])(r.identifyingSymbol)}},geometryType:r.geometryTypeJSON,minScale:o,maxScale:a,objectIdField:"OBJECTID",fields:[G.toJSON(),_.toJSON()],spatialReference:n},featureSet:{features:p,geometryType:r.geometryTypeJSON}})}}_writeMapNote(e,t,r,o){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(t))return;const{geometry:i,symbol:n,popupTemplate:s}=t;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(i))return;var y,m;if(i.type!==r)return void(null==o||null==(y=o.messages)||y.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_10__["default"]("map-notes-layer:invalid-geometry-type",`Geometry "${i.type}" cannot be saved in "${r}" layer`,{graphic:t})));if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isNone"])(n))return void(null==o||null==(m=o.messages)||m.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_10__["default"]("map-notes-layer:no-symbol","Skipping map notes with no symbol",{graphic:t})));const u={attributes:{...t.attributes},geometry:i.toJSON(),symbol:n.toJSON()};Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(s)&&(u.popupInfo=s.toJSON()),e.push(u)}_normalizeObjectIds(e,t){const r=t.name;let o=Object(_graphics_objectIdUtils_js__WEBPACK_IMPORTED_MODULE_24__["findLastObjectIdFromFeatures"])(r,e)+1;const i=new Set;for(const l of e){l.attributes||(l.attributes={});const{attributes:e}=l;(null==e[r]||i.has(e[r]))&&(e[r]=o++),i.add(e[r])}}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"capabilities",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["portal-item","web-map"],"capabilities",["layers"])],z.prototype,"readCapabilities",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"featureCollections",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"featureCollections",["layers"])],z.prototype,"readFeatureCollections",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{origins:{"web-map":{write:{enabled:!0,target:"featureCollection"}}}}})],z.prototype,"featureCollectionJSON",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"featureCollectionJSON",["featureCollection"])],z.prototype,"readLegacyfeatureCollectionJSON",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{read:!1,write:{enabled:!0,ignoreOrigin:!0}}})],z.prototype,"featureCollectionType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({json:{write:!1}})],z.prototype,"fullExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"fullExtent",["layers"])],z.prototype,"readFullExtent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{origins:{"web-map":{write:{target:"featureCollection.showLegend",overridePolicy(){return{enabled:null!=this.featureCollectionJSON}}}}}}})],z.prototype,"legendEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:["show","hide"]})],z.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:Number,nonNullable:!0,json:{write:!1}})],z.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"minScale",["layers"])],z.prototype,"readMinScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:Number,nonNullable:!0,json:{write:!1}})],z.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"maxScale",["layers"])],z.prototype,"readMaxScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"multipointLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({value:"ArcGISFeatureLayer",type:["ArcGISFeatureLayer"]})],z.prototype,"operationalLayerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"pointLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"polygonLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"polylineLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_34__["default"]})],z.prototype,"spatialReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])(["web-map","portal-item"],"spatialReference",["layers"])],z.prototype,"readSpatialReference",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{origins:{"web-map":{write:{ignoreOrigin:!0}}}}})],z.prototype,"sublayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_15__["reader"])("web-map","sublayers",["layers"])],z.prototype,"readSublayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_17__["writer"])("web-map","sublayers")],z.prototype,"writeSublayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],z.prototype,"textLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])()],z.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{read:!1}})],z.prototype,"type",void 0),z=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_16__["subclass"])("esri.layers.MapNotesLayer")],z);var B=z;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js ***!
  \*********************************************************************/
/*! exports provided: findLastObjectIdFromFeatures, initialObjectId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLastObjectIdFromFeatures", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initialObjectId", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=1;function n(t,n){let o=0;for(const r of n){var e;const n=null==(e=r.attributes)?void 0:e[t];"number"==typeof n&&isFinite(n)&&(o=Math.max(o,n))}return o}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js ***!
  \*****************************************************************/
/*! exports provided: APIKeyMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "APIKeyMixin", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(e){return"portalItem"in e}const i=i=>{let o=class extends i{get apiKey(){var e;return this._isOverridden("apiKey")?this._get("apiKey"):t(this)?null==(e=this.portalItem)?void 0:e.apiKey:null}set apiKey(e){null!=e?this._override("apiKey",e):(this._clearOverride("apiKey"),this.clear("apiKey","user"))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:String})],o.prototype,"apiKey",null),o=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.APIKeyMixin")],o),o};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ArcGISService.js ***!
  \*******************************************************************/
/*! exports provided: ArcGISService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArcGISService", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../support/arcgisLayerUrl.js */ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=p=>{let c=class extends p{get title(){if(this._get("title")&&"defaults"!==this.originOf("title"))return this._get("title");if(this.url){const t=Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["parse"])(this.url);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t)&&t.title)return t.title}return this._get("title")||""}set title(t){this._set("title",t)}set url(t){this._set("url",Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeUrl"])(t,_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger(this.declaredClass)))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],c.prototype,"title",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String})],c.prototype,"url",null),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.mixins.ArcGISService")],c),c};


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

/***/ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js ***!
  \*********************************************************************/
/*! exports provided: cleanTitle, isAGOLUrl, isArcGISUrl, isHostedAgolService, isHostedSecuredProxyService, isServerOrServicesAGOLUrl, isWmsServer, parse, parseNonStandardSublayerUrl, sanitizeUrl, sanitizeUrlWithLayerId, serverTypes, titleFromUrlAndName, writeUrlWithLayerId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanTitle", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAGOLUrl", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArcGISUrl", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHostedAgolService", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHostedSecuredProxyService", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isServerOrServicesAGOLUrl", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWmsServer", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseNonStandardSublayerUrl", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeUrl", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeUrlWithLayerId", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "serverTypes", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "titleFromUrlAndName", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeUrlWithLayerId", function() { return C; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l={mapserver:"MapServer",imageserver:"ImageServer",featureserver:"FeatureServer",sceneserver:"SceneServer",streamserver:"StreamServer",vectortileserver:"VectorTileServer"},a=Object.values(l),c=new RegExp(`^((?:https?:)?\\/\\/\\S+?\\/rest\\/services\\/(.+?)\\/(${a.join("|")}))(?:\\/(?:layers\\/)?(\\d+))?`,"i"),f=new RegExp(`^((?:https?:)?\\/\\/\\S+?\\/([^\\/\\n]+)\\/(${a.join("|")}))(?:\\/(?:layers\\/)?(\\d+))?`,"i"),v=/(.*?)\/(?:layers\/)?(\d+)\/?$/i;function p(e){return!!c.test(e)}function d(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(e),n=t.path.match(c)||t.path.match(f);if(!n)return null;const[,s,i,o,u]=n,a=i.indexOf("/");return{title:w(-1!==a?i.slice(a+1):i),serverType:l[o.toLowerCase()],sublayer:null!=u&&""!==u?parseInt(u,10):null,url:{path:s}}}function m(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(e).path.match(v);return t?{serviceUrl:t[1],sublayerId:Number(t[2])}:null}function w(e){return(e=e.replace(/\s*[/_]+\s*/g," "))[0].toUpperCase()+e.slice(1)}function h(r,t){const n=[];if(r){const t=d(r);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(t)&&t.title&&n.push(t.title)}if(t){const e=w(t);n.push(e)}if(2===n.length){if(-1!==n[0].toLowerCase().indexOf(n[1].toLowerCase()))return n[0];if(-1!==n[1].toLowerCase().indexOf(n[0].toLowerCase()))return n[1]}return n.join(" - ")}function y(e){if(!e)return!1;const r=".arcgis.com/",t="//services",n="//tiles",s="//features",i=-1!==(e=e.toLowerCase()).indexOf(r),o=-1!==e.indexOf(t)||-1!==e.indexOf(n)||-1!==e.indexOf(s);return i&&o}function x(e,r){return r&&e&&-1!==e.toLowerCase().indexOf(r.toLowerCase())}function g(e,r){return e?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeTrailingSlash"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeQueryParameters"])(e,r)):e}function O(s){let{url:i}=s;if(!i)return{url:i};i=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeQueryParameters"])(i,s.logger);const o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(i),u=d(o.path);let l;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(u))null!=u.sublayer&&null==s.layer.layerId&&(l=u.sublayer),i=u.url.path;else if(s.nonStandardUrlAllowed){const r=m(o.path);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(r)&&(i=r.serviceUrl,l=r.sublayerId)}return{url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeTrailingSlash"])(i),layerId:l}}function C(e,r,t,n,i){Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_2__["w"])(r,n,"url",i),n.url&&null!=e.layerId&&(n.url=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["join"])(n.url,t,e.layerId.toString()))}function S(e){if(!e)return!1;const r=e.toLowerCase(),t=-1!==r.indexOf("/services/"),n=-1!==r.indexOf("/mapserver/wmsserver"),s=-1!==r.indexOf("/imageserver/wmsserver"),i=-1!==r.indexOf("/wmsserver");return t&&(n||s||i)}function L(e){if(!e)return!1;const r=new _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["Url"](Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(e)).authority.toLowerCase();return"server.arcgisonline.com"===r||"services.arcgisonline.com"===r}function b(e){if(!e)return!1;return new _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["Url"](Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(e)).authority.toLowerCase().includes("arcgis.com")}


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

/***/ "../node_modules/@arcgis/core/support/GraphicsCollection.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/GraphicsCollection.js ***!
  \******************************************************************/
/*! exports provided: GraphicsCollection, castGraphicsCollection, default, graphicsCollectionProperty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphicsCollection", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "castGraphicsCollection", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphicsCollectionProperty", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Graphic_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Graphic.js */ "../node_modules/@arcgis/core/Graphic.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/collectionUtils.js */ "../node_modules/@arcgis/core/core/collectionUtils.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=_core_Collection_js__WEBPACK_IMPORTED_MODULE_2__["default"].ofType(_Graphic_js__WEBPACK_IMPORTED_MODULE_1__["default"]);_core_Logger_js__WEBPACK_IMPORTED_MODULE_5__["default"].getLogger("esri.support.GraphicsCollection");let p=class extends a{constructor(e){super(e),this.on("before-add",(e=>{e.item||e.preventDefault()})),this.on("after-add",(e=>this._own(e.item))),this.on("after-remove",(({item:e})=>{e.layer=null}))}destroy(){this._unownAll()}get owner(){return this._get("owner")}set owner(e){e!==this._get("owner")&&(this._unownAll(),this._set("owner",e),this._ownAll())}_createNewInstance(e){return new a(e)}_ownAll(){this.items.forEach((e=>this._own(e)))}_own(e){e.layer&&"remove"in e.layer&&e.layer!==this.owner&&e.layer.remove(e),e.layer=this.owner}_unownAll(){this.items.forEach((e=>this._unown(e)))}_unown(e){e.layer===this.owner&&(e.layer=null)}};function h(e){const o=Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__["ensureType"])(p,e);return o&&(o.owner=this),o}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],p.prototype,"owner",null),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.support.GraphicsCollection")],p);const m=(e="graphics")=>({type:p,cast:_core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_3__["castForReferenceSetter"],set(o){const r=Object(_core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_3__["referenceSetter"])(o,this._get(e),p);r.owner=this,this._set(e,r)}});var u=p;


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
//# sourceMappingURL=62.render-page.js.map
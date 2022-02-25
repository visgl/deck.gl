exports.ids = [109];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/asyncUtils.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/core/asyncUtils.js ***!
  \*******************************************************/
/*! exports provided: assertResult, forEach, map, result, resultOrAbort */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assertResult", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "result", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resultOrAbort", function() { return p; });
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(r,t,e){return Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["eachAlways"])(r.map(((r,o)=>t.apply(e,[r,o]))))}function u(r,t,e){return Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["eachAlways"])(r.map(((r,o)=>t.apply(e,[r,o])))).then((r=>r.map((r=>r.value))))}function a(o){return Object(_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(o)?Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["resolve"])():o.then((r=>({ok:!0,value:r}))).catch((r=>({ok:!1,error:r})))}function p(r){return r.then((r=>({ok:!0,value:r}))).catch((r=>(Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["throwIfAbortError"])(r),{ok:!1,error:r})))}function i(r){if(!0===r.ok)return r.value;throw r.error}


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


/***/ })

};;
//# sourceMappingURL=109.render-page.js.map
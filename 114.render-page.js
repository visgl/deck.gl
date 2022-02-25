exports.ids = [114];
exports.modules = {

/***/ "../node_modules/@arcgis/core/arcade/functions/featuresetgeom.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/featuresetgeom.js ***!
  \***********************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return g; });
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../kernel.js */ "../node_modules/@arcgis/core/arcade/kernel.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _featureset_actions_SpatialFilter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../featureset/actions/SpatialFilter.js */ "../node_modules/@arcgis/core/arcade/featureset/actions/SpatialFilter.js");
/* harmony import */ var _featureset_sources_Empty_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../featureset/sources/Empty.js */ "../node_modules/@arcgis/core/arcade/featureset/sources/Empty.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/geometryEngineAsync.js */ "../node_modules/@arcgis/core/geometry/geometryEngineAsync.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function S(e){return e instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]}function h(r,a,R,h,g){return g(r,a,(function(r,a,g){if(g.length<2)return h(new Error("Missing Parameters"));if(null===(g=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["H"])(g))[0]&&null===g[1])return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(!1);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(g[0]))return g[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(new _featureset_actions_SpatialFilter_js__WEBPACK_IMPORTED_MODULE_2__["default"]({parentfeatureset:g[0],relation:R,relationGeom:g[1]})):null===g[1]?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(new _featureset_sources_Empty_js__WEBPACK_IMPORTED_MODULE_3__["default"]({parentfeatureset:g[0]})):h("Spatial Relation cannot accept this parameter type");if(S(g[0])){if(S(g[1])){let n=null;switch(R){case"esriSpatialRelEnvelopeIntersects":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["intersects"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_0__["shapeExtent"])(g[0]),Object(_kernel_js__WEBPACK_IMPORTED_MODULE_0__["shapeExtent"])(g[1]));break;case"esriSpatialRelIntersects":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["intersects"])(g[0],g[1]);break;case"esriSpatialRelContains":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["contains"])(g[0],g[1]);break;case"esriSpatialRelOverlaps":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["overlaps"])(g[0],g[1]);break;case"esriSpatialRelWithin":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["within"])(g[0],g[1]);break;case"esriSpatialRelTouches":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["touches"])(g[0],g[1]);break;case"esriSpatialRelCrosses":n=Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["crosses"])(g[0],g[1])}return null!==n?n:Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["reject"])(new Error("Unrecognised Relationship"))}return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(g[1])?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(new _featureset_actions_SpatialFilter_js__WEBPACK_IMPORTED_MODULE_2__["default"]({parentfeatureset:g[1],relation:R,relationGeom:g[0]})):null===g[1]?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(!1):h("Spatial Relation cannot accept this parameter type")}return null!==g[0]?h("Spatial Relation cannot accept this parameter type"):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(g[1])?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(new _featureset_sources_Empty_js__WEBPACK_IMPORTED_MODULE_3__["default"]({parentfeatureset:g[1]})):g[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]||null===g[1]?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["resolve"])(!1):void 0}))}function g(e){"async"===e.mode&&(e.functions.intersects=function(n,t){return h(n,t,"esriSpatialRelIntersects",e.failDefferred,e.standardFunctionAsync)},e.functions.envelopeintersects=function(n,t){return h(n,t,"esriSpatialRelEnvelopeIntersects",e.failDefferred,e.standardFunctionAsync)},e.signatures.push({name:"envelopeintersects",min:"2",max:"2"}),e.functions.contains=function(n,t){return h(n,t,"esriSpatialRelContains",e.failDefferred,e.standardFunctionAsync)},e.functions.overlaps=function(n,t){return h(n,t,"esriSpatialRelOverlaps",e.failDefferred,e.standardFunctionAsync)},e.functions.within=function(n,t){return h(n,t,"esriSpatialRelWithin",e.failDefferred,e.standardFunctionAsync)},e.functions.touches=function(n,t){return h(n,t,"esriSpatialRelTouches",e.failDefferred,e.standardFunctionAsync)},e.functions.crosses=function(n,t){return h(n,t,"esriSpatialRelCrosses",e.failDefferred,e.standardFunctionAsync)},e.functions.relate=function(i,l){return e.standardFunctionAsync(i,l,(function(e,i,l){if(l=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["H"])(l),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["p"])(l,3,3),S(l[0])&&S(l[1]))return Object(_geometry_geometryEngineAsync_js__WEBPACK_IMPORTED_MODULE_6__["relate"])(l[0],l[1],Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(l[2]));if(l[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===l[1])return!1;if(l[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===l[0])return!1;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(l[0])&&null===l[1])return new _featureset_sources_Empty_js__WEBPACK_IMPORTED_MODULE_3__["default"]({parentfeatureset:l[0]});if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(l[1])&&null===l[0])return new _featureset_sources_Empty_js__WEBPACK_IMPORTED_MODULE_3__["default"]({parentfeatureset:l[1]});if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(l[0])&&l[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])return l[0].relate(l[1],Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(l[2]));if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["o"])(l[1])&&l[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])return l[1].relate(l[0],Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(l[2]));if(null===l[0]&&null===l[1])return!1;throw new Error("Illegal Argument")}))})}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FieldsIndex.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){return"date"===t.type||"esriFieldTypeDate"===t.type}class e{constructor(e){if(this.fields=e,this._fieldsMap=new Map,this._dateFieldsSet=new Set,this.dateFields=[],!e)return;const i=[];for(const a of e){const e=a&&a.name;if(e){const d=s(e);this._fieldsMap.set(e,a),this._fieldsMap.set(d,a),i.push(d),t(a)&&(this.dateFields.push(a),this._dateFieldsSet.add(a))}}i.sort(),this.uid=i.join(",")}destroy(){this._fieldsMap.clear()}has(t){return null!=this.get(t)}get(t){return null!=t?this._fieldsMap.get(t)||this._fieldsMap.get(s(t)):void 0}isDateField(t){return this._dateFieldsSet.has(this.get(t))}normalizeFieldName(t){const e=this.get(t);if(e)return e.name}}function s(t){return t.toLowerCase().trim()}


/***/ })

};;
//# sourceMappingURL=114.render-page.js.map
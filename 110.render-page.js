exports.ids = [110];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/WFSSourceWorker.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/WFSSourceWorker.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return E; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../data/FeatureStore.js */ "../node_modules/@arcgis/core/layers/graphics/data/FeatureStore.js");
/* harmony import */ var _data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../data/projectionSupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/projectionSupport.js");
/* harmony import */ var _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../data/QueryEngine.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngine.js");
/* harmony import */ var _geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./geojson/geojson.js */ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js");
/* harmony import */ var _support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/sourceUtils.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js");
/* harmony import */ var _ogc_wfsUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../ogc/wfsUtils.js */ "../node_modules/@arcgis/core/layers/ogc/wfsUtils.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class E{constructor(){this._queryEngine=null,this._customParameters=null,this._snapshotFeatures=async e=>{const{objectIdField:t}=this._queryEngine,s=await Object(_ogc_wfsUtils_js__WEBPACK_IMPORTED_MODULE_11__["getFeature"])(this._getFeatureUrl,this._featureType.typeName,this._getFeatureOutputFormat,{customParameters:this._customParameters,dateFields:this._queryEngine.fieldsIndex.dateFields.map((e=>e.name)),signal:e});await Object(_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__["validateGeoJSON"])(s),Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["throwIfAborted"])(e);const i=Object(_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__["createOptimizedFeatures"])(s,{geometryType:this._queryEngine.geometryType,hasZ:!1,objectIdField:t});if(!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["equals"])(this._queryEngine.spatialReference,_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"]))for(const a of i)Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(a.geometry)&&(a.geometry=Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertFromGeometry"])(Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertToGeometry"])(a.geometry,this._queryEngine.geometryType,!1,!1),_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"],this._queryEngine.spatialReference)));let n=1;for(const r of i){const e={};Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["mixAttributes"])(this._fieldsIndex,e,r.attributes,null,!0),r.attributes=e,null==r.attributes[t]&&(r.objectId=r.attributes[t]=n++)}return i}}destroy(){var e;null==(e=this._queryEngine)||e.destroy(),this._queryEngine=null}async load(e,t){const{getFeatureUrl:r,getFeatureOutputFormat:i,spatialReference:n,fields:o,geometryType:u,featureType:p,objectIdField:h,customParameters:l}=e;this._featureType=p,this._customParameters=l,this._getFeatureUrl=r,this._getFeatureOutputFormat=i,this._fieldsIndex=new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_12__["default"](o),await this._checkProjection(n),Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["throwIfAborted"])(t),this._queryEngine=new _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__["default"]({fields:o,geometryType:u,hasM:!1,hasZ:!1,objectIdField:h,spatialReference:n,timeInfo:null,featureStore:new _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__["default"]({geometryType:u,hasM:!1,hasZ:!1})});const m=await this._snapshotFeatures(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(t.signal));return this._queryEngine.featureStore.addMany(m),{extent:this._queryEngine.fullExtent}}async applyEdits(){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("wfs-source:editing-not-supported","applyEdits() is not supported on WFSLayer")}async queryFeatures(e={},t={}){return await this._waitSnapshotComplete(),this._queryEngine.executeQuery(e,t.signal)}async queryFeatureCount(e={},t={}){return await this._waitSnapshotComplete(),this._queryEngine.executeQueryForCount(e,t.signal)}async queryObjectIds(e={},t={}){return await this._waitSnapshotComplete(),this._queryEngine.executeQueryForIds(e,t.signal)}async queryExtent(e={},t={}){return await this._waitSnapshotComplete(),this._queryEngine.executeQueryForExtent(e,t.signal)}async querySnapping(e,t={}){return await this._waitSnapshotComplete(),this._queryEngine.executeQueryForSnapping(e,t.signal)}setCustomParameters(e){this._customParameters=e}async refresh(){var r;return null==(r=this._snapshotTask)||r.abort(),this._snapshotTask=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["createTask"])(this._snapshotFeatures),this._snapshotTask.promise.then((e=>{this._queryEngine.featureStore.clear(),e&&this._queryEngine.featureStore.addMany(e)}),(r=>{this._queryEngine.featureStore.clear(),Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_3__["isAbortError"])(r)||_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.layers.WFSLayer").error(new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("wfs-layer:getfeature-error","An error occurred during the GetFeature request",{error:r}))})),await this._waitSnapshotComplete(),{extent:this._queryEngine.fullExtent}}async _waitSnapshotComplete(){if(this._snapshotTask&&!this._snapshotTask.finished){try{await this._snapshotTask.promise}catch{}return this._waitSnapshotComplete()}}async _checkProjection(t){try{await Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"],t)}catch{throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("unsupported-projection","Projection not supported",{spatialReference:t})}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js ***!
  \***********************************************************************************/
/*! exports provided: createFeatureEditErrorResult, createFeatureEditSuccessResult, loadGeometryEngine, loadGeometryEngineForSimplify, mixAttributes, simplify */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFeatureEditErrorResult", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFeatureEditSuccessResult", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadGeometryEngine", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadGeometryEngineForSimplify", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mixAttributes", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "simplify", function() { return h; });
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class o{constructor(){this.code=null,this.description=null}}class l{constructor(t){this.error=new o,this.globalId=null,this.objectId=null,this.success=!1,this.uniqueId=null,this.error.description=t}}function u(t){return new l(t)}class a{constructor(t){this.globalId=null,this.success=!0,this.objectId=this.uniqueId=t}}function c(t){return new a(t)}const f=new Set;function d(t,e,r,s,o=!1,l){f.clear();for(const a in r){const s=t.get(a);if(!s)continue;const c=r[a],d=m(s,c);if(d!==c&&l&&l.push({name:"invalid-value-type",message:"attribute value was converted to match the field type",details:{field:s,originalValue:c,sanitizedValue:d}}),f.add(s.name),s&&(o||s.editable)){const t=Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["validateFieldValue"])(s,d);if(t)return u(Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["validationErrorToString"])(t,s,d));e[s.name]=d}}if(s)for(const n of s)if(!f.has(n.name))return u(`missing required field "${n.name}"`);return null}function m(t,n){let i=n;return"string"==typeof n&&Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["isNumericField"])(t)?i=parseFloat(n):null!=n&&Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["isStringField"])(t)&&"string"!=typeof n&&(i=String(n)),Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["sanitizeNullFieldValue"])(i)}let p;function h(e,n){if(!e||!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__["isValid"])(n))return e;if("rings"in e||"paths"in e){if(!p)throw new TypeError("geometry engine not loaded");return p.simplify(n,e)}return e}async function g(){return p||(p=await Promise.all(/*! import() */[__webpack_require__.e(21), __webpack_require__.e(38)]).then(__webpack_require__.bind(null, /*! ../../../../geometry/geometryEngineJSON.js */ "../node_modules/@arcgis/core/geometry/geometryEngineJSON.js")),p)}async function y(e,n){!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__["isValid"])(e)||"esriGeometryPolygon"!==n&&"esriGeometryPolyline"!==n||await g()}


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
//# sourceMappingURL=110.render-page.js.map
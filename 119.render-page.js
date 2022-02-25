exports.ids = [119];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/graphics/data/FeatureFilter.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/data/FeatureFilter.js ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_support_aaBoundingRect_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../geometry/support/aaBoundingRect.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingRect.js");
/* harmony import */ var _geometry_support_boundsUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../geometry/support/boundsUtils.js */ "../node_modules/@arcgis/core/geometry/support/boundsUtils.js");
/* harmony import */ var _spatialQuerySupport_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./spatialQuerySupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/spatialQuerySupport.js");
/* harmony import */ var _timeSupport_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./timeSupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/timeSupport.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/layers/graphics/data/utils.js");
/* harmony import */ var _rest_support_Query_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../rest/support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/* harmony import */ var _views_2d_layers_features_FeatureStore2D_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../views/2d/layers/features/FeatureStore2D.js */ "../node_modules/@arcgis/core/views/2d/layers/features/FeatureStore2D.js");
/* harmony import */ var _views_2d_layers_features_support_whereUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../views/2d/layers/features/support/whereUtils.js */ "../node_modules/@arcgis/core/views/2d/layers/features/support/whereUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.views.2d.layers.features.controllers.FeatureFilter"),_=1,u=2;class p{constructor(t){this._geometryBounds=Object(_geometry_support_aaBoundingRect_js__WEBPACK_IMPORTED_MODULE_3__["create"])(),this._idToVisibility=new Map,this._serviceInfo=t}get hash(){return this._hash}check(t){return this._applyFilter(t)}clear(){const t=this._resetAllHiddenIds();return this.update(),{show:t,hide:[]}}invalidate(){this._idToVisibility.forEach(((t,e)=>{this._idToVisibility.set(e,0)}))}setKnownIds(t){for(const e of t)this._idToVisibility.set(e,_)}setTrue(t){const e=[],i=[],s=new Set(t);return this._idToVisibility.forEach(((t,r)=>{const o=!!(this._idToVisibility.get(r)&_),h=s.has(r);!o&&h?e.push(r):o&&!h&&i.push(r),this._idToVisibility.set(r,h?_|u:0)})),{show:e,hide:i}}createQuery(){const{geometry:t,spatialRel:e,where:i,timeExtent:s,objectIds:r}=this;return _rest_support_Query_js__WEBPACK_IMPORTED_MODULE_8__["default"].fromJSON({geometry:t,spatialRel:e,where:i,timeExtent:s,objectIds:r})}async update(t,e){this._hash=JSON.stringify(t);const i=await Object(_utils_js__WEBPACK_IMPORTED_MODULE_7__["normalizeQueryLike"])(t,null,e);await Promise.all([this._setGeometryFilter(i),this._setIdFilter(i),this._setAttributeFilter(i),this._setTimeFilter(i)])}async _setAttributeFilter(t){if(!t||!t.where)return this._clause=null,void(this.where=null);this._clause=await Object(_views_2d_layers_features_support_whereUtils_js__WEBPACK_IMPORTED_MODULE_10__["createWhereClause"])(t.where,this._serviceInfo.fieldsIndex),this.where=t.where}_setIdFilter(t){this._idsToShow=t&&t.objectIds&&new Set(t.objectIds),this._idsToHide=t&&t.hiddenIds&&new Set(t.hiddenIds),this.objectIds=t&&t.objectIds}async _setGeometryFilter(t){if(!t||!t.geometry)return this._spatialQueryOperator=null,this.geometry=null,void(this.spatialRel=null);const e=t.geometry,i=t.spatialRel||"esriSpatialRelIntersects",s=await Object(_spatialQuerySupport_js__WEBPACK_IMPORTED_MODULE_5__["getSpatialQueryOperator"])(i,e,this._serviceInfo.geometryType,this._serviceInfo.hasZ,this._serviceInfo.hasM);Object(_geometry_support_boundsUtils_js__WEBPACK_IMPORTED_MODULE_4__["getBoundsXY"])(this._geometryBounds,e),this._spatialQueryOperator=s,this.geometry=e,this.spatialRel=i}_setTimeFilter(e){if(this.timeExtent=this._timeOperator=null,e&&e.timeExtent)if(this._serviceInfo.timeInfo)this.timeExtent=e.timeExtent,this._timeOperator=Object(_timeSupport_js__WEBPACK_IMPORTED_MODULE_6__["getTimeOperator"])(this._serviceInfo.timeInfo,e.timeExtent,_views_2d_layers_features_FeatureStore2D_js__WEBPACK_IMPORTED_MODULE_9__["featureAdapter"]);else{const i=new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("feature-layer-view:time-filter-not-available","Unable to apply time filter, as layer doesn't have time metadata.",e.timeExtent);m.error(i)}}_applyFilter(t){return this._filterByGeometry(t)&&this._filterById(t)&&this._filterByTime(t)&&this._filterByExpression(t)}_filterByExpression(t){return!this.where||this._clause(t)}_filterById(t){return(!this._idsToHide||!this._idsToHide.size||!this._idsToHide.has(t.getObjectId()))&&(!this._idsToShow||!this._idsToShow.size||this._idsToShow.has(t.getObjectId()))}_filterByGeometry(t){if(!this.geometry)return!0;const e=t.readHydratedGeometry();return!!e&&this._spatialQueryOperator(e)}_filterByTime(t){return!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this._timeOperator)||this._timeOperator(t)}_resetAllHiddenIds(){const t=[];return this._idToVisibility.forEach(((e,i)=>{e&_||(this._idToVisibility.set(i,_),t.push(i))})),t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/support/whereUtils.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/support/whereUtils.js ***!
  \***********************************************************************************/
/*! exports provided: createWhereClause */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createWhereClause", function() { return s; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.views.2d.layers.features.support.whereUtils"),a={getAttribute:(e,r)=>e.field(r)};async function s(r,s){const n=await Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ../../../../../core/sql/WhereClause.js */ "../node_modules/@arcgis/core/core/sql/WhereClause.js"));try{const o=n.WhereClause.create(r,s);if(!o.isStandardized){const r=new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("mapview - bad input","Unable to apply filter's definition expression, as expression is not standardized.",o);t.error(r)}return e=>{const r=e.readArcadeFeature();return o.testFeature(r,a)}}catch(o){return t.warn("mapview-bad-where-clause","Encountered an error when evaluating where clause",r),e=>!0}}


/***/ })

};;
//# sourceMappingURL=119.render-page.js.map
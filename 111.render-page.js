exports.ids = [111];
exports.modules = {

/***/ "../node_modules/@arcgis/core/rest/closestFacility.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/closestFacility.js ***!
  \************************************************************/
/*! exports provided: solve */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "solve", function() { return c; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/queryUtils.js */ "../node_modules/@arcgis/core/core/queryUtils.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _networkService_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./networkService.js */ "../node_modules/@arcgis/core/rest/networkService.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _support_ClosestFacilitySolveResult_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./support/ClosestFacilitySolveResult.js */ "../node_modules/@arcgis/core/rest/support/ClosestFacilitySolveResult.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l=Object(_core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__["createQueryParamsHelper"])({accumulateAttributes:{name:"accumulateAttributeNames"},attributeParameterValues:!0,directionsTimeAttribute:{name:"directionsTimeAttributeName"},impedanceAttribute:{name:"impedanceAttributeName"},facilities:!0,incidents:!0,outSpatialReference:{name:"outSR",getter:e=>e.outSpatialReference.wkid},pointBarriers:{name:"barriers"},polylineBarriers:!0,polygonBarriers:!0,restrictionAttributes:{name:"restrictionAttributeNames"},returnPointBarriers:{name:"returnBarriers"},returnRoutes:{name:"returnCFRoutes"},travelMode:!0});async function c(r,c,m){const f=[],p=[],y={},B={},d=Object(_utils_js__WEBPACK_IMPORTED_MODULE_4__["parseUrl"])(r),{path:b}=d;c.incidents&&c.incidents.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(c.incidents.features,p,"incidents.features",y),c.facilities&&c.facilities.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(c.facilities.features,p,"facilities.features",y),c.pointBarriers&&c.pointBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(c.pointBarriers.features,p,"pointBarriers.features",y),c.polylineBarriers&&c.polylineBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(c.polylineBarriers.features,p,"polylineBarriers.features",y),c.polygonBarriers&&c.polygonBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(c.polygonBarriers.features,p,"polygonBarriers.features",y);const g=await Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__["normalizeCentralMeridian"])(p);for(const e in y){const r=y[e];f.push(e),B[e]=g.slice(r[0],r[1])}if(Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["isInputGeometryZAware"])(B,f)){let e=null;try{e=await Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["fetchServiceDescription"])(b,c.apiKey,m)}catch{}e&&!e.hasZ&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["dropZValuesOffInputGeometry"])(B,f)}for(const e in B)B[e].forEach(((r,t)=>{c.get(e)[t].geometry=r}));const A={...m,query:{...d.query,...l.toQueryParams(c),f:"json"}},{data:j}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(`${b}/solveClosestFacility`,A);return _support_ClosestFacilitySolveResult_js__WEBPACK_IMPORTED_MODULE_5__["default"].fromJSON(j)}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/ClosestFacilitySolveResult.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/ClosestFacilitySolveResult.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return j; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _Graphic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Graphic.js */ "../node_modules/@arcgis/core/Graphic.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _DirectionsFeatureSet_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./DirectionsFeatureSet.js */ "../node_modules/@arcgis/core/rest/support/DirectionsFeatureSet.js");
/* harmony import */ var _FeatureSet_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _NAMessage_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./NAMessage.js */ "../node_modules/@arcgis/core/rest/support/NAMessage.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function d(r){return r.features.map((o=>{const s=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromJSON(r.spatialReference),i=_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(i.geometry)&&(i.geometry.spatialReference=s),i}))}function f(r){return _FeatureSet_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON(r).features.map((r=>r.geometry))}let g=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(r){super(r),this.directions=null,this.facilities=null,this.incidents=null,this.messages=null,this.pointBarriers=null,this.polylineBarriers=null,this.polygonBarriers=null,this.routes=null}readFacilities(r){return f(r)}readIncidents(r){return f(r)}readPointBarriers(r,e){return f(e.barriers)}readPolylineBarriers(r){return f(r)}readPolygonBarriers(r){return f(r)}readRoutes(r){return d(r)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_DirectionsFeatureSet_js__WEBPACK_IMPORTED_MODULE_12__["default"]]})],g.prototype,"directions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Point_js__WEBPACK_IMPORTED_MODULE_15__["default"]]})],g.prototype,"facilities",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("facilities")],g.prototype,"readFacilities",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Point_js__WEBPACK_IMPORTED_MODULE_15__["default"]]})],g.prototype,"incidents",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("incidents")],g.prototype,"readIncidents",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_NAMessage_js__WEBPACK_IMPORTED_MODULE_14__["default"]]})],g.prototype,"messages",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Point_js__WEBPACK_IMPORTED_MODULE_15__["default"]]})],g.prototype,"pointBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("pointBarriers",["barriers"])],g.prototype,"readPointBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_16__["default"]]})],g.prototype,"polylineBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("polylineBarriers")],g.prototype,"readPolylineBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_17__["default"]]})],g.prototype,"polygonBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("polygonBarriers")],g.prototype,"readPolygonBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"]]})],g.prototype,"routes",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("routes")],g.prototype,"readRoutes",null),g=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.rest.support.ClosestFacilitySolveResult")],g);var j=g;


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/ClosestFacilityTask.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/ClosestFacilityTask.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _rest_closestFacility_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../rest/closestFacility.js */ "../node_modules/@arcgis/core/rest/closestFacility.js");
/* harmony import */ var _Task_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Task.js */ "../node_modules/@arcgis/core/tasks/Task.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let c=class extends _Task_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.url=null}solve(r,s){return Object(_rest_closestFacility_js__WEBPACK_IMPORTED_MODULE_6__["solve"])(this.url,r,s)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],c.prototype,"url",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.tasks.ClosestFacilityTask")],c);var p=c;


/***/ })

};;
//# sourceMappingURL=111.render-page.js.map
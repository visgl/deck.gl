exports.ids = [112];
exports.modules = {

/***/ "../node_modules/@arcgis/core/rest/serviceArea.js":
/*!********************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/serviceArea.js ***!
  \********************************************************/
/*! exports provided: solve */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "solve", function() { return f; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/queryUtils.js */ "../node_modules/@arcgis/core/core/queryUtils.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _networkService_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./networkService.js */ "../node_modules/@arcgis/core/rest/networkService.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _support_ServiceAreaSolveResult_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./support/ServiceAreaSolveResult.js */ "../node_modules/@arcgis/core/rest/support/ServiceAreaSolveResult.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l=Object(_core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__["createQueryParamsHelper"])({accumulateAttributes:{name:"accumulateAttributeNames"},attributeParameterValues:!0,defaultBreaks:!0,facilities:!0,outSpatialReference:{name:"outSR",getter:r=>r.outSpatialReference.wkid},pointBarriers:{name:"barriers"},polylineBarriers:!0,polygonBarriers:!0,restrictionAttributes:{name:"restrictionAttributeNames"},returnPointBarriers:{name:"returnBarriers"},travelMode:!0});async function f(e,f,p){const c=[],m=[],y={},B={},g=Object(_utils_js__WEBPACK_IMPORTED_MODULE_4__["parseUrl"])(e),{path:S}=g;f.facilities&&f.facilities.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(f.facilities.features,m,"facilities.features",y),f.pointBarriers&&f.pointBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(f.pointBarriers.features,m,"pointBarriers.features",y),f.polylineBarriers&&f.polylineBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(f.polylineBarriers.features,m,"polylineBarriers.features",y),f.polygonBarriers&&f.polygonBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(f.polygonBarriers.features,m,"polygonBarriers.features",y);const j=await Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__["normalizeCentralMeridian"])(m);for(const r in y){const e=y[r];c.push(r),B[r]=j.slice(e[0],e[1])}if(Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["isInputGeometryZAware"])(B,c)){let r=null;try{r=await Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["fetchServiceDescription"])(S,f.apiKey,p)}catch{}r&&!r.hasZ&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["dropZValuesOffInputGeometry"])(B,c)}for(const r in B)B[r].forEach(((e,t)=>{f.get(r)[t].geometry=e}));const b={...p,query:{...g.query,...l.toQueryParams(f),f:"json"}},{data:v}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(`${S}/solveServiceArea`,b);return _support_ServiceAreaSolveResult_js__WEBPACK_IMPORTED_MODULE_5__["default"].fromJSON(v)}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/ServiceAreaSolveResult.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/ServiceAreaSolveResult.js ***!
  \***************************************************************************/
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
/* harmony import */ var _NAMessage_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./NAMessage.js */ "../node_modules/@arcgis/core/rest/support/NAMessage.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function g(r){return r.features.map((o=>{const t=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromJSON(r.spatialReference),s=_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["unwrap"])(s.geometry).spatialReference=t,s}))}function d(r){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["filterNones"])(r.features.map((e=>(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.geometry)&&(e.geometry.spatialReference=r.spatialReference),Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_16__["fromJSON"])(e.geometry)))))}let P=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(r){super(r),this.facilities=null,this.messages=null,this.pointBarriers=null,this.polylineBarriers=null,this.polygonBarriers=null,this.serviceAreaPolylines=null,this.serviceAreaPolygons=null}readFacilities(r){return d(r)}readPointBarriers(r,e){return d(e.barriers)}readPolylineBarriers(r){return d(r)}readPolygonBarriers(r){return d(r)}readIncidents(r,e){return g(e.saPolylines)}readServiceAreaPolygons(r,e){return g(e.saPolygons)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Point_js__WEBPACK_IMPORTED_MODULE_13__["default"]]})],P.prototype,"facilities",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("facilities")],P.prototype,"readFacilities",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_NAMessage_js__WEBPACK_IMPORTED_MODULE_12__["default"]]})],P.prototype,"messages",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Point_js__WEBPACK_IMPORTED_MODULE_13__["default"]]})],P.prototype,"pointBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("pointBarriers",["barriers"])],P.prototype,"readPointBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_14__["default"]]})],P.prototype,"polylineBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("polylineBarriers")],P.prototype,"readPolylineBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_15__["default"]]})],P.prototype,"polygonBarriers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("polygonBarriers")],P.prototype,"readPolygonBarriers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"]]})],P.prototype,"serviceAreaPolylines",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("serviceAreaPolylines",["saPolylines"])],P.prototype,"readIncidents",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_Graphic_js__WEBPACK_IMPORTED_MODULE_2__["default"]]})],P.prototype,"serviceAreaPolygons",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("serviceAreaPolygons",["saPolygons"])],P.prototype,"readServiceAreaPolygons",null),P=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.rest.support.ServiceAreaSolveResult")],P);var j=P;


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/ServiceAreaTask.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/ServiceAreaTask.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _rest_serviceArea_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../rest/serviceArea.js */ "../node_modules/@arcgis/core/rest/serviceArea.js");
/* harmony import */ var _Task_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Task.js */ "../node_modules/@arcgis/core/tasks/Task.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let p=class extends _Task_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.url=null}solve(r,s){return Object(_rest_serviceArea_js__WEBPACK_IMPORTED_MODULE_6__["solve"])(this.url,r,s)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],p.prototype,"url",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.tasks.ServiceAreaTask")],p);var c=p;


/***/ })

};;
//# sourceMappingURL=112.render-page.js.map
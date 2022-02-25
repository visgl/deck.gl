exports.ids = [123];
exports.modules = {

/***/ "../node_modules/@arcgis/core/rest/route.js":
/*!**************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/route.js ***!
  \**************************************************/
/*! exports provided: solve */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "solve", function() { return l; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/queryUtils.js */ "../node_modules/@arcgis/core/core/queryUtils.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _networkService_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./networkService.js */ "../node_modules/@arcgis/core/rest/networkService.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=Object(_core_queryUtils_js__WEBPACK_IMPORTED_MODULE_1__["createQueryParamsHelper"])({accumulateAttributes:{name:"accumulateAttributeNames"},attributeParameterValues:!0,directionsTimeAttribute:{name:"directionsTimeAttributeName"},impedanceAttribute:{name:"impedanceAttributeName"},outSpatialReference:{name:"outSR",getter:e=>e.outSpatialReference.wkid},pointBarriers:{name:"barriers"},polylineBarriers:!0,polygonBarriers:!0,restrictionAttributes:{name:"restrictionAttributeNames"},stops:!0,travelMode:!0});async function l(r,l,m){const c=[],f=[],y={},B={},b=Object(_utils_js__WEBPACK_IMPORTED_MODULE_4__["parseUrl"])(r),{path:g}=b;l.stops&&l.stops.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(l.stops.features,f,"stops.features",y),l.pointBarriers&&l.pointBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(l.pointBarriers.features,f,"pointBarriers.features",y),l.polylineBarriers&&l.polylineBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(l.polylineBarriers.features,f,"polylineBarriers.features",y),l.polygonBarriers&&l.polygonBarriers.features&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["collectGeometries"])(l.polygonBarriers.features,f,"polygonBarriers.features",y);const A=await Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_2__["normalizeCentralMeridian"])(f);for(const e in y){const r=y[e];c.push(e),B[e]=A.slice(r[0],r[1])}if(Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["isInputGeometryZAware"])(B,c)){let e=null;try{e=await Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["fetchServiceDescription"])(g,l.apiKey,m)}catch{}e&&!e.hasZ&&Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["dropZValuesOffInputGeometry"])(B,c)}for(const e in B)B[e].forEach(((r,t)=>{l.get(e)[t].geometry=r}));const d={...m,query:{...b.query,...p.toQueryParams(l),f:"json"}},h=g.endsWith("/solve")?g:`${g}/solve`,j=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(h,d);return Object(_networkService_js__WEBPACK_IMPORTED_MODULE_3__["handleSolveResponse"])(j)}


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/RouteTask.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/RouteTask.js ***!
  \*******************************************************/
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
/* harmony import */ var _rest_route_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../rest/route.js */ "../node_modules/@arcgis/core/rest/route.js");
/* harmony import */ var _Task_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Task.js */ "../node_modules/@arcgis/core/tasks/Task.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let t=class extends _Task_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r)}solve(r,s){return Object(_rest_route_js__WEBPACK_IMPORTED_MODULE_6__["solve"])(this.url,r,s)}};t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.tasks.RouteTask")],t);var p=t;


/***/ })

};;
//# sourceMappingURL=123.render-page.js.map
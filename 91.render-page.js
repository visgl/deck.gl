exports.ids = [91];
exports.modules = {

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

/***/ "../node_modules/@arcgis/core/layers/graphics/OptimizedFeature.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/OptimizedFeature.js ***!
  \************************************************************************/
/*! exports provided: OptimizedFeatureWithGeometry, default, hasGeometry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OptimizedFeatureWithGeometry", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasGeometry", function() { return e; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class s{constructor(t=null,s={},e,o){this.geometry=t,this.attributes=s,this.centroid=e,this.objectId=o,this.displayId=0,this.geohashX=0,this.geohashY=0}weakClone(){const t=new s(this.geometry,this.attributes,this.centroid,this.objectId);return t.displayId=this.displayId,t.geohashX=this.geohashX,t.geohashY=this.geohashY,t}}function e(s){return!(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(s.geometry)||!s.geometry.coords||!s.geometry.coords.length)}class o extends s{}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/OptimizedFeatureSet.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/OptimizedFeatureSet.js ***!
  \***************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(){this.objectIdFieldName=null,this.globalIdFieldName=null,this.geohashFieldName=null,this.geometryProperties=null,this.geometryType=null,this.spatialReference=null,this.hasZ=!1,this.hasM=!1,this.features=[],this.fields=[],this.transform=null,this.exceededTransferLimit=!1,this.uniqueIdField=null,this.queryGeometryType=null,this.queryGeometry=null}weakClone(){const t=new e;return t.objectIdFieldName=this.objectIdFieldName,t.globalIdFieldName=this.globalIdFieldName,t.geohashFieldName=this.geohashFieldName,t.geometryProperties=this.geometryProperties,t.geometryType=this.geometryType,t.spatialReference=this.spatialReference,t.hasZ=this.hasZ,t.hasM=this.hasM,t.features=this.features,t.fields=this.fields,t.transform=this.transform,t.exceededTransferLimit=this.exceededTransferLimit,t.uniqueIdField=this.uniqueIdField,t.queryGeometry=this.queryGeometry,t.queryGeometryType=this.queryGeometryType,t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/OptimizedGeometry.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/OptimizedGeometry.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t=[],e=[],s=!1){this.lengths=null!=t?t:[],this.coords=null!=e?e:[],this.hasIndeterminateRingOrder=s}get isPoint(){return 0===this.lengths.length}get maxLength(){return Math.max(...this.lengths)}get size(){return this.lengths.reduce(((t,e)=>t+e))}forEachVertex(t){let e=0;this.lengths.length||t(this.coords[0],this.coords[1]);for(let s=0;s<this.lengths.length;s++){const h=this.lengths[s];for(let s=0;s<h;s++){t(this.coords[2*(s+e)],this.coords[2*(s+e)+1])}e+=h}}clone(e){return e?(e.set(this.coords),new t(this.lengths.slice(),e,this.hasIndeterminateRingOrder)):new t(this.lengths.slice(),this.coords.slice(),this.hasIndeterminateRingOrder)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/query.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/query.js ***!
  \*******************************************************************/
/*! exports provided: executeQuery, executeQueryForCount, executeQueryForExtent, executeQueryForIds, executeQueryPBF, executeQueryPBFBuffer, queryToQueryStringParameters, runQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQuery", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForCount", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForExtent", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForIds", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryPBF", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryPBFBuffer", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryToQueryStringParameters", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "runQuery", function() { return g; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _pbfQueryUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./pbfQueryUtils.js */ "../node_modules/@arcgis/core/rest/query/operations/pbfQueryUtils.js");
/* harmony import */ var _queryZScale_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./queryZScale.js */ "../node_modules/@arcgis/core/rest/query/operations/queryZScale.js");
/* harmony import */ var _tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../tasks/operations/urlUtils.js */ "../node_modules/@arcgis/core/tasks/operations/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l="Layer does not support extent calculation.";function m(t,r){const n=t.geometry,o=t.toJSON(),s=o;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(n)&&(s.geometry=JSON.stringify(n),s.geometryType=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["getJsonType"])(n),s.inSR=n.spatialReference.wkid||JSON.stringify(n.spatialReference)),o.groupByFieldsForStatistics&&(s.groupByFieldsForStatistics=o.groupByFieldsForStatistics.join(",")),o.objectIds&&(s.objectIds=o.objectIds.join(",")),o.orderByFields&&(s.orderByFields=o.orderByFields.join(",")),!o.outFields||!o.returnDistinctValues&&(null!=r&&r.returnCountOnly||null!=r&&r.returnExtentOnly||null!=r&&r.returnIdsOnly)?delete s.outFields:-1!==o.outFields.indexOf("*")?s.outFields="*":s.outFields=o.outFields.join(","),o.outSR?s.outSR=o.outSR.wkid||JSON.stringify(o.outSR):n&&(o.returnGeometry||o.returnCentroid)&&(s.outSR=s.inSR),o.returnGeometry&&delete o.returnGeometry,o.outStatistics&&(s.outStatistics=JSON.stringify(o.outStatistics)),o.pixelSize&&(s.pixelSize=JSON.stringify(o.pixelSize)),o.quantizationParameters&&(s.quantizationParameters=JSON.stringify(o.quantizationParameters)),o.parameterValues&&(s.parameterValues=JSON.stringify(o.parameterValues)),o.rangeValues&&(s.rangeValues=JSON.stringify(o.rangeValues)),o.dynamicDataSource&&(s.layer=JSON.stringify({source:o.dynamicDataSource}),delete o.dynamicDataSource),o.timeExtent){const t=o.timeExtent,{start:e,end:r}=t;null==e&&null==r||(s.time=e===r?e:`${null==e?"null":e},${null==r?"null":r}`),delete o.timeExtent}return s}async function y(t,r,n,i){const o=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?{data:{features:[]}}:await g(t,r,"json",i);return Object(_queryZScale_js__WEBPACK_IMPORTED_MODULE_6__["applyFeatureSetZUnitScaling"])(r,n,o.data),o}async function c(t,r,n,i){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty)return Promise.resolve({data:n.createFeatureResult()});const o=await d(t,r,i),u=o;return u.data=Object(_pbfQueryUtils_js__WEBPACK_IMPORTED_MODULE_5__["parsePBFFeatureQuery"])(o.data,n),u}function d(t,e,r){return g(t,e,"pbf",r)}function f(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{objectIds:[]}}):g(t,r,"json",n,{returnIdsOnly:!0})}function p(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{count:0}}):g(t,r,"json",n,{returnIdsOnly:!0,returnCountOnly:!0})}function S(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{count:0,extent:null}}):g(t,r,"json",n,{returnExtentOnly:!0,returnCountOnly:!0}).then((t=>{const e=t.data;if(e.hasOwnProperty("extent"))return t;if(e.features)throw new Error(l);if(e.hasOwnProperty("count"))throw new Error(l);return t}))}function g(i,s,u,l={},y={}){const c="string"==typeof i?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["urlToObject"])(i):i,d=s.geometry?[s.geometry]:[];return l.responseType="pbf"===u?"array-buffer":"json",Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_4__["normalizeCentralMeridian"])(d,null,l).then((n=>{const i=n&&n[0];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(i)&&((s=s.clone()).geometry=i);const o=Object(_tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["mapParameters"])({...c.query,f:u,...y,...m(s,y)});return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["join"])(c.path,"query"),{...l,query:{...o,...l.query}})}))}


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


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/operations/urlUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/operations/urlUtils.js ***!
  \*****************************************************************/
/*! exports provided: mapParameters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapParameters", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(n){const o={};for(const e in n){if("declaredClass"===e)continue;const r=n[e];if(null!=r&&"function"!=typeof r)if(Array.isArray(r)){o[e]=[];for(let n=0;n<r.length;n++)o[e][n]=t(r[n])}else"object"==typeof r?r.toJSON&&(o[e]=JSON.stringify(r)):o[e]=r}return o}


/***/ })

};;
//# sourceMappingURL=91.render-page.js.map
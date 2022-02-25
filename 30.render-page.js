exports.ids = [30];
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

/***/ "../node_modules/@arcgis/core/layers/support/exifUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/exifUtils.js ***!
  \****************************************************************/
/*! exports provided: getExifValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getExifValue", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){const{exifInfo:e,exifName:a,tagName:u}=n;if(!e||!a||!u)return null;const f=e.find((n=>n.name===a));return f?t({tagName:u,tags:f.tags}):null}function t(n){const{tagName:t,tags:e}=n;if(!e||!t)return null;const a=e.find((n=>n.name===t));return a&&a.value||null}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeAttachmentQuery.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeAttachmentQuery.js ***!
  \*************************************************************************/
/*! exports provided: executeAttachmentQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeAttachmentQuery", function() { return a; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryAttachments_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/queryAttachments.js */ "../node_modules/@arcgis/core/rest/query/operations/queryAttachments.js");
/* harmony import */ var _support_AttachmentQuery_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/AttachmentQuery.js */ "../node_modules/@arcgis/core/rest/support/AttachmentQuery.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function a(a,m,n){const s=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(a);return Object(_operations_queryAttachments_js__WEBPACK_IMPORTED_MODULE_1__["executeAttachmentQuery"])(s,_support_AttachmentQuery_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(m),{...n}).then((t=>Object(_operations_queryAttachments_js__WEBPACK_IMPORTED_MODULE_1__["processAttachmentQueryResult"])(t.data.attachmentGroups,s.path)))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForCount.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForCount.js ***!
  \******************************************************************/
/*! exports provided: executeForCount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForCount", function() { return n; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_query_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/query.js */ "../node_modules/@arcgis/core/rest/query/operations/query.js");
/* harmony import */ var _support_Query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(n,s,m){const p=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(n);return Object(_operations_query_js__WEBPACK_IMPORTED_MODULE_1__["executeQueryForCount"])(p,_support_Query_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(s),{...m}).then((o=>o.data.count))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForExtent.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForExtent.js ***!
  \*******************************************************************/
/*! exports provided: executeForExtent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForExtent", function() { return m; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./operations/query.js */ "../node_modules/@arcgis/core/rest/query/operations/query.js");
/* harmony import */ var _support_Query_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function m(m,n,s){const p=Object(_utils_js__WEBPACK_IMPORTED_MODULE_1__["parseUrl"])(m);return Object(_operations_query_js__WEBPACK_IMPORTED_MODULE_2__["executeQueryForExtent"])(p,_support_Query_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(n),{...s}).then((t=>({count:t.data.count,extent:_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromJSON(t.data.extent)})))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForIds.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForIds.js ***!
  \****************************************************************/
/*! exports provided: executeForIds */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForIds", function() { return s; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_query_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/query.js */ "../node_modules/@arcgis/core/rest/query/operations/query.js");
/* harmony import */ var _support_Query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(s,e,m){const n=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(s);return Object(_operations_query_js__WEBPACK_IMPORTED_MODULE_1__["executeQueryForIds"])(n,_support_Query_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(e),{...m}).then((o=>o.data.objectIds))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForTopCount.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForTopCount.js ***!
  \*********************************************************************/
/*! exports provided: executeForTopCount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForTopCount", function() { return s; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/queryTopFeatures.js */ "../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js");
/* harmony import */ var _support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/TopFeaturesQuery.js */ "../node_modules/@arcgis/core/rest/support/TopFeaturesQuery.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(s,e,p){const u=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(s);return(await Object(_operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__["executeQueryForTopCount"])(u,_support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(e),{...p})).data.count}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForTopExtents.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForTopExtents.js ***!
  \***********************************************************************/
/*! exports provided: executeForTopExtents */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForTopExtents", function() { return m; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./operations/queryTopFeatures.js */ "../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js");
/* harmony import */ var _support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/TopFeaturesQuery.js */ "../node_modules/@arcgis/core/rest/support/TopFeaturesQuery.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function m(m,s,n){const p=Object(_utils_js__WEBPACK_IMPORTED_MODULE_1__["parseUrl"])(m),a=await Object(_operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_2__["executeQueryForTopExtents"])(p,_support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(s),{...n});return{count:a.data.count,extent:_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromJSON(a.data.extent)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeForTopIds.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeForTopIds.js ***!
  \*******************************************************************/
/*! exports provided: executeForTopIds */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeForTopIds", function() { return s; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/queryTopFeatures.js */ "../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js");
/* harmony import */ var _support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/TopFeaturesQuery.js */ "../node_modules/@arcgis/core/rest/support/TopFeaturesQuery.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(s,e,p){const a=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(s);return(await Object(_operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__["executeQueryForTopIds"])(a,_support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_2__["default"].from(e),{...p})).data.objectIds}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeQueryJSON.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeQueryJSON.js ***!
  \*******************************************************************/
/*! exports provided: executeQueryJSON, executeRawQueryJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryJSON", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRawQueryJSON", function() { return a; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_query_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/query.js */ "../node_modules/@arcgis/core/rest/query/operations/query.js");
/* harmony import */ var _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _support_Query_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(r,t,e){const s=await a(r,t,e);return _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(s)}async function a(o,s,a){const n=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(o),i={...a},p=_support_Query_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(s),{data:u}=await Object(_operations_query_js__WEBPACK_IMPORTED_MODULE_1__["executeQuery"])(n,p,p.sourceSpatialReference,i);return u}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeQueryPBF.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeQueryPBF.js ***!
  \******************************************************************/
/*! exports provided: executeQueryPBF, executeRawQueryPBF */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryPBF", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRawQueryPBF", function() { return n; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_pbfJSONFeatureSet_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/pbfJSONFeatureSet.js */ "../node_modules/@arcgis/core/rest/query/operations/pbfJSONFeatureSet.js");
/* harmony import */ var _operations_query_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./operations/query.js */ "../node_modules/@arcgis/core/rest/query/operations/query.js");
/* harmony import */ var _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _support_Query_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(r,e,t){const a=await n(r,e,t);return _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(a)}async function n(o,s,n){const p=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(o),i={...n},u=_support_Query_js__WEBPACK_IMPORTED_MODULE_4__["default"].from(s),m=!u.quantizationParameters,{data:f}=await Object(_operations_query_js__WEBPACK_IMPORTED_MODULE_2__["executeQueryPBF"])(p,u,new _operations_pbfJSONFeatureSet_js__WEBPACK_IMPORTED_MODULE_1__["JSONFeatureSetParserContext"]({sourceSpatialReference:u.sourceSpatialReference,applyTransform:m}),i);return f}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeRelationshipQuery.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeRelationshipQuery.js ***!
  \***************************************************************************/
/*! exports provided: executeRelationshipQuery, executeRelationshipQueryForCount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRelationshipQuery", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRelationshipQueryForCount", function() { return u; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryRelatedRecords_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/queryRelatedRecords.js */ "../node_modules/@arcgis/core/rest/query/operations/queryRelatedRecords.js");
/* harmony import */ var _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/RelationshipQuery.js */ "../node_modules/@arcgis/core/rest/support/RelationshipQuery.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(e,n,u){n=_support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(n);const a=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(e);return Object(_operations_queryRelatedRecords_js__WEBPACK_IMPORTED_MODULE_1__["executeRelationshipQuery"])(a,n,u).then((t=>{const r=t.data,e={};return Object.keys(r).forEach((t=>e[t]=_support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(r[t]))),e}))}async function u(r,o,n){o=_support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(o);const u=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(r);return Object(_operations_queryRelatedRecords_js__WEBPACK_IMPORTED_MODULE_1__["executeRelationshipQueryForCount"])(u,o,{...n}).then((t=>t.data))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/executeTopFeaturesQuery.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/executeTopFeaturesQuery.js ***!
  \**************************************************************************/
/*! exports provided: executeTopFeaturesQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeTopFeaturesQuery", function() { return s; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils.js */ "../node_modules/@arcgis/core/rest/utils.js");
/* harmony import */ var _operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./operations/queryTopFeatures.js */ "../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js");
/* harmony import */ var _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../support/FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/TopFeaturesQuery.js */ "../node_modules/@arcgis/core/rest/support/TopFeaturesQuery.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(s,p,u,a){const m=Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["parseUrl"])(s),i={...a},{data:f}=await Object(_operations_queryTopFeatures_js__WEBPACK_IMPORTED_MODULE_1__["executeTopFeaturesQuery"])(m,_support_TopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_3__["default"].from(p),u,i);return _support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(f)}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/pbfJSONFeatureSet.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/pbfJSONFeatureSet.js ***!
  \*******************************************************************************/
/*! exports provided: JSONFeatureSetParserContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JSONFeatureSetParserContext", function() { return l; });
/* harmony import */ var _core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/compilerUtils.js */ "../node_modules/@arcgis/core/core/compilerUtils.js");
/* harmony import */ var _layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../layers/graphics/featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _zscale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./zscale.js */ "../node_modules/@arcgis/core/rest/query/operations/zscale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(e,t){return t}function i(e,t,r,s){switch(r){case 0:return u(e,t+s,0);case 1:return"lowerLeft"===e.originPosition?u(e,t+s,1):d(e,t+s,1)}}function n(e,t,r,s){return 2===r?u(e,t,2):i(e,t,r,s)}function a(e,t,r,s){return 2===r?u(e,t,3):i(e,t,r,s)}function h(e,t,r,s){return 3===r?u(e,t,3):n(e,t,r,s)}function u({translate:e,scale:t},r,s){return e[s]+r*t[s]}function d({translate:e,scale:t},r,s){return e[s]-r*t[s]}class l{constructor(e){this.options=e,this.geometryTypes=["esriGeometryPoint","esriGeometryMultipoint","esriGeometryPolyline","esriGeometryPolygon"],this.previousCoordinate=[0,0],this.transform=null,this.applyTransform=o,this.lengths=[],this.currentLengthIndex=0,this.toAddInCurrentPath=0,this.vertexDimension=0,this.coordinateBuffer=null,this.coordinateBufferPtr=0,this.AttributesConstructor=function(){}}createFeatureResult(){return{fields:[],features:[]}}finishFeatureResult(e){if(this.options.applyTransform&&(e.transform=null),this.AttributesConstructor=function(){},this.coordinateBuffer=null,this.lengths.length=0,!e.hasZ)return;const t=Object(_zscale_js__WEBPACK_IMPORTED_MODULE_2__["getGeometryZScaler"])(e.geometryType,this.options.sourceSpatialReference,e.spatialReference);if(t)for(const r of e.features)t(r.geometry)}createSpatialReference(){return{}}addField(e,t){e.fields.push(t);const r=e.fields.map((e=>e.name));this.AttributesConstructor=function(){for(const e of r)this[e]=null}}addFeature(e,t){e.features.push(t)}prepareFeatures(t){switch(this.transform=t.transform,this.options.applyTransform&&t.transform&&(this.applyTransform=this.deriveApplyTransform(t)),this.vertexDimension=2,t.hasZ&&this.vertexDimension++,t.hasM&&this.vertexDimension++,t.geometryType){case"esriGeometryPoint":this.addCoordinate=(e,t,r)=>this.addCoordinatePoint(e,t,r),this.createGeometry=e=>this.createPointGeometry(e);break;case"esriGeometryPolygon":this.addCoordinate=(e,t,r)=>this.addCoordinatePolygon(e,t,r),this.createGeometry=e=>this.createPolygonGeometry(e);break;case"esriGeometryPolyline":this.addCoordinate=(e,t,r)=>this.addCoordinatePolyline(e,t,r),this.createGeometry=e=>this.createPolylineGeometry(e);break;case"esriGeometryMultipoint":this.addCoordinate=(e,t,r)=>this.addCoordinateMultipoint(e,t,r),this.createGeometry=e=>this.createMultipointGeometry(e);break;default:Object(_core_compilerUtils_js__WEBPACK_IMPORTED_MODULE_0__["neverReached"])(t.geometryType)}}createFeature(){return this.lengths.length=0,this.currentLengthIndex=0,this.previousCoordinate[0]=0,this.previousCoordinate[1]=0,this.coordinateBuffer=null,this.coordinateBufferPtr=0,{attributes:new this.AttributesConstructor}}allocateCoordinates(){}addLength(e,t,r){0===this.lengths.length&&(this.toAddInCurrentPath=t),this.lengths.push(t)}addQueryGeometry(e,s){const{queryGeometry:o,queryGeometryType:i}=s,n=Object(_layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_1__["unquantizeOptimizedGeometry"])(o.clone(),o,!1,!1,this.transform),a=Object(_layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_1__["convertToGeometry"])(n,i,!1,!1);e.queryGeometryType=i,e.queryGeometry={...a}}createPointGeometry(e){const t={x:0,y:0,spatialReference:e.spatialReference};return e.hasZ&&(t.z=0),e.hasM&&(t.m=0),t}addCoordinatePoint(e,t,r){switch(t=this.applyTransform(this.transform,t,r,0),r){case 0:e.x=t;break;case 1:e.y=t;break;case 2:"z"in e?e.z=t:e.m=t;break;case 3:e.m=t}}transformPathLikeValue(e,t){let r=0;return t<=1&&(r=this.previousCoordinate[t],this.previousCoordinate[t]+=e),this.applyTransform(this.transform,e,t,r)}addCoordinatePolyline(e,t,r){this.dehydratedAddPointsCoordinate(e.paths,t,r)}addCoordinatePolygon(e,t,r){this.dehydratedAddPointsCoordinate(e.rings,t,r)}addCoordinateMultipoint(e,t,r){0===r&&e.points.push([]);const s=this.transformPathLikeValue(t,r);e.points[e.points.length-1].push(s)}createPolygonGeometry(e){return{rings:[[]],spatialReference:e.spatialReference,hasZ:!!e.hasZ,hasM:!!e.hasM}}createPolylineGeometry(e){return{paths:[[]],spatialReference:e.spatialReference,hasZ:!!e.hasZ,hasM:!!e.hasM}}createMultipointGeometry(e){return{points:[],spatialReference:e.spatialReference,hasZ:!!e.hasZ,hasM:!!e.hasM}}dehydratedAddPointsCoordinate(e,t,r){0===r&&0==this.toAddInCurrentPath--&&(e.push([]),this.toAddInCurrentPath=this.lengths[++this.currentLengthIndex]-1,this.previousCoordinate[0]=0,this.previousCoordinate[1]=0);const s=this.transformPathLikeValue(t,r),o=e[e.length-1];0===r&&(this.coordinateBufferPtr=0,this.coordinateBuffer=new Array(this.vertexDimension),o.push(this.coordinateBuffer)),this.coordinateBuffer[this.coordinateBufferPtr++]=s}deriveApplyTransform(e){const{hasZ:t,hasM:r}=e;return t&&r?h:t?n:r?a:i}}


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

/***/ "../node_modules/@arcgis/core/rest/query/operations/queryAttachments.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/queryAttachments.js ***!
  \******************************************************************************/
/*! exports provided: executeAttachmentQuery, processAttachmentQueryResult */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeAttachmentQuery", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processAttachmentQueryResult", function() { return a; });
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../kernel.js */ "../node_modules/@arcgis/core/kernel.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _support_AttachmentInfo_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../support/AttachmentInfo.js */ "../node_modules/@arcgis/core/rest/query/support/AttachmentInfo.js");
/* harmony import */ var _tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../tasks/operations/urlUtils.js */ "../node_modules/@arcgis/core/tasks/operations/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(t){const o=t.toJSON();return o.attachmentTypes&&(o.attachmentTypes=o.attachmentTypes.join(",")),o.keywords&&(o.keywords=o.keywords.join(",")),o.globalIds&&(o.globalIds=o.globalIds.join(",")),o.objectIds&&(o.objectIds=o.objectIds.join(",")),o.size&&(o.size=o.size.join(",")),o}function a(o,s){const n={};for(const a of o){const{parentObjectId:o,parentGlobalId:c,attachmentInfos:i}=a;for(const a of i){const{id:i}=a,m=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["addProxy"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_0__["addTokenParameter"])(`${s}/${o}/attachments/${i}`)),p=_support_AttachmentInfo_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(a);p.set({url:m,parentObjectId:o,parentGlobalId:c}),n[o]?n[o].push(p):n[o]=[p]}}return n}function c(t,e,r){let a={query:Object(_tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["mapParameters"])({...t.query,f:"json",...n(e)})};return r&&(a={...r,...a,query:{...r.query,...a.query}}),Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t.path+"/queryAttachments",a)}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/queryRelatedRecords.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/queryRelatedRecords.js ***!
  \*********************************************************************************/
/*! exports provided: executeRelationshipQuery, executeRelationshipQueryForCount, toQueryStringParameters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRelationshipQuery", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeRelationshipQueryForCount", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toQueryStringParameters", function() { return o; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../tasks/operations/urlUtils.js */ "../node_modules/@arcgis/core/tasks/operations/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(e,t){const o=e.toJSON();return o.objectIds&&(o.objectIds=o.objectIds.join(",")),o.orderByFields&&(o.orderByFields=o.orderByFields.join(",")),!o.outFields||null!=t&&t.returnCountOnly?delete o.outFields:-1!==o.outFields.indexOf("*")?o.outFields="*":o.outFields=o.outFields.join(","),o.outSpatialReference&&(o.outSR=o.outSR.wkid||JSON.stringify(o.outSR.toJSON()),delete o.outSpatialReference),o.dynamicDataSource&&(o.layer=JSON.stringify({source:o.dynamicDataSource}),delete o.dynamicDataSource),o}async function r(e,t,o){const r=await s(e,t,o),n=r.data,a=n.geometryType,d=n.spatialReference,i={};for(const s of n.relatedRecordGroups){const e={fields:void 0,objectIdFieldName:void 0,geometryType:a,spatialReference:d,hasZ:!!n.hasZ,hasM:!!n.hasM,features:s.relatedRecords};if(null!=s.objectId)i[s.objectId]=e;else for(const t in s)s.hasOwnProperty(t)&&"relatedRecords"!==t&&(i[s[t]]=e)}return{...r,data:i}}async function n(e,t,o){const r=await s(e,t,o,{returnCountOnly:!0}),n=r.data,a={};for(const s of n.relatedRecordGroups)null!=s.objectId&&(a[s.objectId]=s.count);return{...r,data:a}}async function s(r,n,s={},a){const d=Object(_tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["mapParameters"])({...r.query,f:"json",...a,...o(n,a)});return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r.path+"/queryRelatedRecords",{...s,query:{...s.query,...d}})}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/operations/queryTopFeatures.js ***!
  \******************************************************************************/
/*! exports provided: executeQueryForTopCount, executeQueryForTopExtents, executeQueryForTopIds, executeTopFeaturesQuery, queryToQueryStringParameters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForTopCount", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForTopExtents", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeQueryForTopIds", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeTopFeaturesQuery", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryToQueryStringParameters", function() { return y; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _queryZScale_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./queryZScale.js */ "../node_modules/@arcgis/core/rest/query/operations/queryZScale.js");
/* harmony import */ var _tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../tasks/operations/urlUtils.js */ "../node_modules/@arcgis/core/tasks/operations/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u="Layer does not support extent calculation.";function y(t,r){var n,i;const s=t.geometry,l=t.toJSON(),u=l;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(s)&&(u.geometry=JSON.stringify(s),u.geometryType=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["getJsonType"])(s),u.inSR=s.spatialReference.wkid||JSON.stringify(s.spatialReference)),null!=(n=l.topFilter)&&n.groupByFields&&(u.topFilter.groupByFields=l.topFilter.groupByFields.join(",")),null!=(i=l.topFilter)&&i.orderByFields&&(u.topFilter.orderByFields=l.topFilter.orderByFields.join(",")),l.topFilter&&(u.topFilter=JSON.stringify(u.topFilter)),l.objectIds&&(u.objectIds=l.objectIds.join(",")),l.orderByFields&&(u.orderByFields=l.orderByFields.join(",")),l.outFields&&!(null!=r&&r.returnCountOnly||null!=r&&r.returnExtentOnly||null!=r&&r.returnIdsOnly)?-1!==l.outFields.indexOf("*")?u.outFields="*":u.outFields=l.outFields.join(","):delete u.outFields,l.outSR?u.outSR=l.outSR.wkid||JSON.stringify(l.outSR):s&&l.returnGeometry&&(u.outSR=u.inSR),l.returnGeometry&&delete l.returnGeometry,l.timeExtent){const t=l.timeExtent,{start:e,end:r}=t;null==e&&null==r||(u.time=e===r?e:`${null==e?"null":e},${null==r?"null":r}`),delete l.timeExtent}return u}async function m(t,e,r,n){const o=await c(t,e,"json",n);return Object(_queryZScale_js__WEBPACK_IMPORTED_MODULE_5__["applyFeatureSetZUnitScaling"])(e,r,o.data),o}async function d(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{objectIds:[]}}):c(t,r,"json",n,{returnIdsOnly:!0})}async function p(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{count:0,extent:null}}):c(t,r,"json",n,{returnExtentOnly:!0,returnCountOnly:!0}).then((t=>{const e=t.data;if(e.hasOwnProperty("extent"))return t;if(e.features)throw new Error(u);if(e.hasOwnProperty("count"))throw new Error(u);return t}))}function a(t,r,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(r.timeExtent)&&r.timeExtent.isEmpty?Promise.resolve({data:{count:0}}):c(t,r,"json",n,{returnIdsOnly:!0,returnCountOnly:!0})}function c(o,s,u,m={},d={}){const p="string"==typeof o?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["urlToObject"])(o):o,a=s.geometry?[s.geometry]:[];return m.responseType="pbf"===u?"array-buffer":"json",Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_4__["normalizeCentralMeridian"])(a,null,m).then((n=>{const o=n&&n[0];Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(o)&&((s=s.clone()).geometry=o);const i=Object(_tasks_operations_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["mapParameters"])({...p.query,f:u,...d,...y(s,d)});return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["join"])(p.path,"queryTopFeatures"),{...m,query:{...i,...m.query}})}))}


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/query/support/AttachmentInfo.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/query/support/AttachmentInfo.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _layers_support_exifUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../layers/support/exifUtils.js */ "../node_modules/@arcgis/core/layers/support/exifUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;const p={1:{id:1,rotation:0,mirrored:!1},2:{id:2,rotation:0,mirrored:!0},3:{id:3,rotation:180,mirrored:!1},4:{id:4,rotation:180,mirrored:!0},5:{id:5,rotation:-90,mirrored:!0},6:{id:6,rotation:90,mirrored:!1},7:{id:7,rotation:90,mirrored:!0},8:{id:8,rotation:-90,mirrored:!1}};let a=s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.contentType=null,this.exifInfo=null,this.id=null,this.globalId=null,this.keywords=null,this.name=null,this.parentGlobalId=null,this.parentObjectId=null,this.size=null,this.url=null}get orientationInfo(){const{exifInfo:o}=this,t=Object(_layers_support_exifUtils_js__WEBPACK_IMPORTED_MODULE_7__["getExifValue"])({exifName:"Exif IFD0",tagName:"Orientation",exifInfo:o});return p[t]||null}clone(){return new s({contentType:this.contentType,exifInfo:this.exifInfo,id:this.id,globalId:this.globalId,keywords:this.keywords,name:this.name,parentGlobalId:this.parentGlobalId,parentObjectId:this.parentObjectId,size:this.size,url:this.url})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"contentType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],a.prototype,"exifInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],a.prototype,"orientationInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"]})],a.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"globalId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"keywords",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{read:!1}})],a.prototype,"parentGlobalId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{read:!1}})],a.prototype,"parentObjectId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"]})],a.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{read:!1}})],a.prototype,"url",void 0),a=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.AttachmentInfo")],a);var d=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/utils.js":
/*!**************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/utils.js ***!
  \**************************************************/
/*! exports provided: asValidOptions, encode, parseUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asValidOptions", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encode", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseUrl", function() { return e; });
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(t,r){return r?{...r,query:{...t,...r.query}}:{query:t}}function e(r){return"string"==typeof r?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["urlToObject"])(r):r}function n(t,r,e){const o={};for(const i in t){if("declaredClass"===i)continue;const f=t[i];if(null!=f&&"function"!=typeof f)if(Array.isArray(f)){o[i]=[];for(let t=0;t<f.length;t++)o[i][t]=n(f[t])}else if("object"==typeof f)if(f.toJSON){const t=f.toJSON(e&&e[i]);o[i]=r?t:JSON.stringify(t)}else o[i]=r?f:JSON.stringify(f);else o[i]=f}return o}


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/QueryTask.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/QueryTask.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Q; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _layers_support_source_DataLayerSource_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../layers/support/source/DataLayerSource.js */ "../node_modules/@arcgis/core/layers/support/source/DataLayerSource.js");
/* harmony import */ var _rest_query_executeAttachmentQuery_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../rest/query/executeAttachmentQuery.js */ "../node_modules/@arcgis/core/rest/query/executeAttachmentQuery.js");
/* harmony import */ var _rest_query_executeForCount_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../rest/query/executeForCount.js */ "../node_modules/@arcgis/core/rest/query/executeForCount.js");
/* harmony import */ var _rest_query_executeForExtent_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../rest/query/executeForExtent.js */ "../node_modules/@arcgis/core/rest/query/executeForExtent.js");
/* harmony import */ var _rest_query_executeForIds_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../rest/query/executeForIds.js */ "../node_modules/@arcgis/core/rest/query/executeForIds.js");
/* harmony import */ var _rest_query_executeQueryJSON_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../rest/query/executeQueryJSON.js */ "../node_modules/@arcgis/core/rest/query/executeQueryJSON.js");
/* harmony import */ var _rest_query_executeQueryPBF_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../rest/query/executeQueryPBF.js */ "../node_modules/@arcgis/core/rest/query/executeQueryPBF.js");
/* harmony import */ var _rest_query_executeRelationshipQuery_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../rest/query/executeRelationshipQuery.js */ "../node_modules/@arcgis/core/rest/query/executeRelationshipQuery.js");
/* harmony import */ var _rest_query_executeTopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../rest/query/executeTopFeaturesQuery.js */ "../node_modules/@arcgis/core/rest/query/executeTopFeaturesQuery.js");
/* harmony import */ var _rest_query_executeForTopIds_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../rest/query/executeForTopIds.js */ "../node_modules/@arcgis/core/rest/query/executeForTopIds.js");
/* harmony import */ var _rest_query_executeForTopExtents_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../rest/query/executeForTopExtents.js */ "../node_modules/@arcgis/core/rest/query/executeForTopExtents.js");
/* harmony import */ var _rest_query_executeForTopCount_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../rest/query/executeForTopCount.js */ "../node_modules/@arcgis/core/rest/query/executeForTopCount.js");
/* harmony import */ var _rest_support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../rest/support/FeatureSet.js */ "../node_modules/@arcgis/core/rest/support/FeatureSet.js");
/* harmony import */ var _rest_support_Query_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../rest/support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/* harmony import */ var _rest_support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../rest/support/RelationshipQuery.js */ "../node_modules/@arcgis/core/rest/support/RelationshipQuery.js");
/* harmony import */ var _Task_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./Task.js */ "../node_modules/@arcgis/core/tasks/Task.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let g=class extends _Task_js__WEBPACK_IMPORTED_MODULE_24__["default"]{constructor(e){super(e),this.dynamicDataSource=null,this.fieldsIndex=null,this.format="json",this.gdbVersion=null,this.infoFor3D=null,this.sourceSpatialReference=null}execute(e,t){return this.executeJSON(e,t).then((r=>this.featureSetFromJSON(e,r,t)))}async executeJSON(e,t){var o;const s={...this.requestOptions,...t},i=this._normalizeQuery(e),u=null!=(null==(o=e.outStatistics)?void 0:o[0]),n=Object(_core_has_js__WEBPACK_IMPORTED_MODULE_2__["default"])("featurelayer-pbf-statistics"),a=!u||n;let c;if("pbf"===this.format&&a)try{c=await Object(_rest_query_executeQueryPBF_js__WEBPACK_IMPORTED_MODULE_15__["executeRawQueryPBF"])(this.url,i,s)}catch(p){if("query:parsing-pbf"!==p.name)throw p;this.format="json"}return"json"!==this.format&&a||(c=await Object(_rest_query_executeQueryJSON_js__WEBPACK_IMPORTED_MODULE_14__["executeRawQueryJSON"])(this.url,i,s)),this._normalizeFields(c.fields),c}async featureSetFromJSON(e,t,r){if(!(this._queryIs3DObjectFormat(e)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.infoFor3D)&&t.features&&t.features.length))return _rest_support_FeatureSet_js__WEBPACK_IMPORTED_MODULE_21__["default"].fromJSON(t);const{meshFeatureSetFromJSON:s}=await Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["whenOrAbort"])(Promise.all(/*! import() */[__webpack_require__.e(29), __webpack_require__.e(49), __webpack_require__.e(84)]).then(__webpack_require__.bind(null, /*! ../rest/support/meshFeatureSet.js */ "../node_modules/@arcgis/core/rest/support/meshFeatureSet.js")),r);return s(e,this.infoFor3D,t)}executeForCount(e,t){const r={...this.requestOptions,...t},o=this._normalizeQuery(e);return Object(_rest_query_executeForCount_js__WEBPACK_IMPORTED_MODULE_11__["executeForCount"])(this.url,o,r)}executeForExtent(e,t){const r={...this.requestOptions,...t},o=this._normalizeQuery(e);return Object(_rest_query_executeForExtent_js__WEBPACK_IMPORTED_MODULE_12__["executeForExtent"])(this.url,o,r)}executeForIds(e,t){const r={...this.requestOptions,...t},o=this._normalizeQuery(e);return Object(_rest_query_executeForIds_js__WEBPACK_IMPORTED_MODULE_13__["executeForIds"])(this.url,o,r)}executeRelationshipQuery(e,t){e=_rest_support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_23__["default"].from(e);const r={...this.requestOptions,...t};return(this.gdbVersion||this.dynamicDataSource)&&((e=e.clone()).gdbVersion=e.gdbVersion||this.gdbVersion,e.dynamicDataSource=e.dynamicDataSource||this.dynamicDataSource),Object(_rest_query_executeRelationshipQuery_js__WEBPACK_IMPORTED_MODULE_16__["executeRelationshipQuery"])(this.url,e,r)}executeRelationshipQueryForCount(e,t){e=_rest_support_RelationshipQuery_js__WEBPACK_IMPORTED_MODULE_23__["default"].from(e);const r={...this.requestOptions,...t};return(this.gdbVersion||this.dynamicDataSource)&&((e=e.clone()).gdbVersion=e.gdbVersion||this.gdbVersion,e.dynamicDataSource=e.dynamicDataSource||this.dynamicDataSource),Object(_rest_query_executeRelationshipQuery_js__WEBPACK_IMPORTED_MODULE_16__["executeRelationshipQueryForCount"])(this.url,e,r)}executeAttachmentQuery(e,t){const r={...this.requestOptions,...t};return Object(_rest_query_executeAttachmentQuery_js__WEBPACK_IMPORTED_MODULE_10__["executeAttachmentQuery"])(this.url,e,r)}executeTopFeaturesQuery(e,t){const r={...this.requestOptions,...t};return Object(_rest_query_executeTopFeaturesQuery_js__WEBPACK_IMPORTED_MODULE_17__["executeTopFeaturesQuery"])(this.parsedUrl,e,this.sourceSpatialReference,r)}executeForTopIds(e,t){const r={...this.requestOptions,...t};return Object(_rest_query_executeForTopIds_js__WEBPACK_IMPORTED_MODULE_18__["executeForTopIds"])(this.parsedUrl,e,r)}executeForTopExtents(e,t){const r={...this.requestOptions,...t};return Object(_rest_query_executeForTopExtents_js__WEBPACK_IMPORTED_MODULE_19__["executeForTopExtents"])(this.parsedUrl,e,r)}executeForTopCount(e,t){const r={...this.requestOptions,...t};return Object(_rest_query_executeForTopCount_js__WEBPACK_IMPORTED_MODULE_20__["executeForTopCount"])(this.parsedUrl,e,r)}_normalizeQuery(e){let r=_rest_support_Query_js__WEBPACK_IMPORTED_MODULE_22__["default"].from(e);if(r.sourceSpatialReference=r.sourceSpatialReference||this.sourceSpatialReference,(this.gdbVersion||this.dynamicDataSource)&&(r=r===e?r.clone():r,r.gdbVersion=e.gdbVersion||this.gdbVersion,r.dynamicDataSource=e.dynamicDataSource?_layers_support_source_DataLayerSource_js__WEBPACK_IMPORTED_MODULE_9__["DataLayerSource"].from(e.dynamicDataSource):this.dynamicDataSource),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.infoFor3D)&&this._queryIs3DObjectFormat(e)){r=r===e?r.clone():r,r.formatOf3DObjects=null;for(const e of this.infoFor3D.queryFormats){if("3D_glb"===e.id){r.formatOf3DObjects=e.id;break}"3D_gltf"!==e.id||r.formatOf3DObjects||(r.formatOf3DObjects=e.id)}if(!r.formatOf3DObjects)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("query:unsupported-3d-query-formats","Could not find any supported 3D object query format. Only supported formats are 3D_glb and 3D_gltf");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(r.outFields)||!r.outFields.includes("*")){r=r===e?r.clone():r,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(r.outFields)&&(r.outFields=[]);const{originX:t,originY:o,originZ:i,translationX:u,translationY:n,translationZ:a,scaleX:c,scaleY:p,scaleZ:m,rotationX:f,rotationY:l,rotationZ:h,rotationDeg:d}=this.infoFor3D.transformFieldRoles;r.outFields.push(t,o,i,u,n,a,c,p,m,f,l,h,d)}}return r}_normalizeFields(e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.fieldsIndex)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(e))for(const t of e){const e=this.fieldsIndex.get(t.name);e&&Object.assign(t,e.toJSON())}}_queryIs3DObjectFormat(e){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.infoFor3D)&&e.returnGeometry&&"xyFootprint"!==e.multipatchOption&&!e.outStatistics}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:_layers_support_source_DataLayerSource_js__WEBPACK_IMPORTED_MODULE_9__["DataLayerSource"]})],g.prototype,"dynamicDataSource",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"fieldsIndex",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"format",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"gdbVersion",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"infoFor3D",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"sourceSpatialReference",void 0),g=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.tasks.QueryTask")],g);var Q=g;


/***/ }),

/***/ "../node_modules/@arcgis/core/tasks/Task.js":
/*!**************************************************!*\
  !*** ../node_modules/@arcgis/core/tasks/Task.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let i=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(...r){super(...r),this.requestOptions=null,this.url=null}normalizeCtorArgs(r,s){return"string"!=typeof r?r:{url:r,...s}}get parsedUrl(){return this._parseUrl(this.url)}_parseUrl(r){return r?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_2__["urlToObject"])(r):null}_encode(r,s,e){const o={};for(const t in r){if("declaredClass"===t)continue;const i=r[t];if(null!=i&&"function"!=typeof i)if(Array.isArray(i)){o[t]=[];for(let r=0;r<i.length;r++)o[t][r]=this._encode(i[r])}else if("object"==typeof i)if(i.toJSON){const r=i.toJSON(e&&e[t]);o[t]=s?r:JSON.stringify(r)}else o[t]=s?i:JSON.stringify(i);else o[t]=i}return o}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({readOnly:!0})],i.prototype,"parsedUrl",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],i.prototype,"requestOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String})],i.prototype,"url",void 0),i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.tasks.Task")],i);var p=i;


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
//# sourceMappingURL=30.render-page.js.map
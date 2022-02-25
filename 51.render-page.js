exports.ids = [51];
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

/***/ "../node_modules/@arcgis/core/portal/support/jsonContext.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/jsonContext.js ***!
  \******************************************************************/
/*! exports provided: createForItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createForItem", function() { return o; });
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _Portal_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o){return{origin:"portal-item",url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["urlToObject"])(o.itemUrl),portal:o.portal||_Portal_js__WEBPACK_IMPORTED_MODULE_1__["default"].getDefault(),portalItem:o,readResourcePaths:[]}}


/***/ }),

/***/ "../node_modules/@arcgis/core/portal/support/layersLoader.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/layersLoader.js ***!
  \*******************************************************************/
/*! exports provided: getFirstLayerOrTableId, getNumLayersAndTables, load, preprocessFSItemData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFirstLayerOrTableId", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNumLayersAndTables", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "preprocessFSItemData", function() { return m; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../layers/support/lazyLayerLoader.js */ "../node_modules/@arcgis/core/layers/support/lazyLayerLoader.js");
/* harmony import */ var _Portal_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _jsonContext_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./jsonContext.js */ "../node_modules/@arcgis/core/portal/support/jsonContext.js");
/* harmony import */ var _renderers_support_styleUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../renderers/support/styleUtils.js */ "../node_modules/@arcgis/core/renderers/support/styleUtils.js");
/* harmony import */ var _support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../support/requestPresets.js */ "../node_modules/@arcgis/core/support/requestPresets.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function o(e,t){const r=e.instance.portalItem;return r&&r.id?(await r.load(t),s(e),i(e,t)):Promise.resolve()}function s(t){const r=t.instance.portalItem;if(-1===t.supportedTypes.indexOf(r.type))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("portal:invalid-layer-item-type","Invalid layer item type '${type}', expected '${expectedType}'",{type:r.type,expectedType:t.supportedTypes.join(", ")})}async function i(e,t){const r=e.instance,a=r.portalItem,{url:o,title:s}=a,i=Object(_jsonContext_js__WEBPACK_IMPORTED_MODULE_3__["createForItem"])(a);if("group"===r.type)return r.read({title:s},i),u(r,e);o&&r.read({url:o},i);const c=await y(e,t);return c&&r.read(c,i),r.resourceReferences={portalItem:a,paths:i.readResourcePaths},r.read({title:s},i),Object(_renderers_support_styleUtils_js__WEBPACK_IMPORTED_MODULE_4__["loadStyleRenderer"])(r,i)}function u(r,n){let l;const a=r.portalItem.type;switch(a){case"Feature Service":l=_layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__["layerLookupMap"].FeatureLayer;break;case"Stream Service":l=_layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__["layerLookupMap"].StreamLayer;break;case"Scene Service":l=_layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__["layerLookupMap"].SceneLayer;break;case"Feature Collection":l=_layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__["layerLookupMap"].FeatureLayer;break;default:throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("portal:unsupported-item-type-as-group",`The item type '${a}' is not supported as a 'IGroupLayer'`)}let o;return l().then((e=>(o=e,y(n)))).then((async e=>"Feature Service"===a?(e=await m(e,r.portalItem.url),p(r,o,e)):h(e)>0?p(r,o,e):c(r,o)))}function c(e,t){return e.portalItem.url?Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(e.portalItem.url).then((r=>{var n,l;function a(e){return{id:e.id,name:e.name}}r&&p(e,t,{layers:null==(n=r.layers)?void 0:n.map(a),tables:null==(l=r.tables)?void 0:l.map(a)})})):Promise.resolve()}function p(e,t,r){let n=r.layers||[];const l=r.tables||[];"Feature Collection"===e.portalItem.type&&(n.forEach((e=>{var t;"Table"===(null==e||null==(t=e.layerDefinition)?void 0:t.type)&&l.push(e)})),n=n.filter((e=>{var t;return"Table"!==(null==e||null==(t=e.layerDefinition)?void 0:t.type)}))),n.reverse().forEach((n=>{const l=d(e,t,r,n);e.add(l)})),l.reverse().forEach((n=>{const l=d(e,t,r,n);e.tables.add(l)}))}function d(e,t,n,l){const a=new t({portalItem:e.portalItem.clone(),layerId:l.id,sublayerTitleMode:"service-name"});if("Feature Collection"===e.portalItem.type){const t={origin:"portal-item",portal:e.portalItem.portal||_Portal_js__WEBPACK_IMPORTED_MODULE_2__["default"].getDefault()};a.read(l,t);const o=n.showLegend;null!=o&&a.read({showLegend:o},t)}return a}function y(e,t){if(!1===e.supportsData)return Promise.resolve(void 0);const r=e.instance;return r.portalItem.fetchData("json",t).catch((()=>null)).then((async e=>{if(I(r)){let t,n=!0;return e&&h(e)>0&&(null==r.layerId&&(r.layerId=f(e)),t=v(e,r.layerId),t&&(1===h(e)&&(n=!1),null!=e.showLegend&&(t.showLegend=e.showLegend))),n&&"service-name"!==r.sublayerTitleMode&&(r.sublayerTitleMode="item-title-and-service-name"),t}return e}))}async function m(e,t){var r,n;if(null==(null==(r=e)?void 0:r.layers)||null==(null==(n=e)?void 0:n.tables)){const r=await Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(t);(e=e||{}).layers=e.layers||(null==r?void 0:r.layers),e.tables=e.tables||(null==r?void 0:r.tables)}return e}function f(e){const t=e.layers;if(t&&t.length)return t[0].id;const r=e.tables;return r&&r.length?r[0].id:null}function v(e,t){const r=e.layers;if(r)for(let l=0;l<r.length;l++)if(r[l].id===t)return r[l];const n=e.tables;if(n)for(let l=0;l<n.length;l++)if(n[l].id===t)return n[l];return null}function h(e){var t,r,n,l;return(null!=(t=null==e||null==(r=e.layers)?void 0:r.length)?t:0)+(null!=(n=null==e||null==(l=e.tables)?void 0:l.length)?n:0)}function I(e){return"stream"!==e.type&&"layerId"in e}


/***/ }),

/***/ "../node_modules/@arcgis/core/portal/support/portalItemUtils.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/portalItemUtils.js ***!
  \**********************************************************************/
/*! exports provided: addTypeKeyword, hasTypeKeyword, removeTypeKeyword */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addTypeKeyword", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasTypeKeyword", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeTypeKeyword", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,n){if(!t(e,n)){const t=e.typeKeywords;t?t.push(n):e.typeKeywords=[n]}}function t(e,t){return!!e.typeKeywords&&e.typeKeywords.indexOf(t)>-1}function n(e,t){const n=e.typeKeywords;if(n){const e=n.indexOf(t);e>-1&&n.splice(e,1)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/portal/support/portalLayers.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/portalLayers.js ***!
  \*******************************************************************/
/*! exports provided: fromItem, selectLayerClassPath */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromItem", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectLayerClassPath", function() { return l; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../layers/support/lazyLayerLoader.js */ "../node_modules/@arcgis/core/layers/support/lazyLayerLoader.js");
/* harmony import */ var _PortalItem_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../PortalItem.js */ "../node_modules/@arcgis/core/portal/PortalItem.js");
/* harmony import */ var _layersLoader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./layersLoader.js */ "../node_modules/@arcgis/core/portal/support/layersLoader.js");
/* harmony import */ var _portalItemUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./portalItemUtils.js */ "../node_modules/@arcgis/core/portal/support/portalItemUtils.js");
/* harmony import */ var _support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../support/requestPresets.js */ "../node_modules/@arcgis/core/support/requestPresets.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(e){return!e.portalItem||e.portalItem instanceof _PortalItem_js__WEBPACK_IMPORTED_MODULE_2__["default"]||(e={...e,portalItem:new _PortalItem_js__WEBPACK_IMPORTED_MODULE_2__["default"](e.portalItem)}),u(e.portalItem).then((r=>{const t={portalItem:e.portalItem,...r.properties},a=r.constructor;return Promise.resolve(new a(t))}))}function u(e){return e.load().then(l).then(y)}function l(r){switch(r.type){case"Map Service":return m(r);case"Feature Service":return p(r);case"Feature Collection":return L(r);case"Scene Service":return f(r);case"Image Service":return d(r);case"Stream Service":return S();case"Vector Tile Service":return I();case"KML":return N();case"WFS":return h();case"WMTS":return w();case"WMS":return g();case"Feed":return v();default:return Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("portal:unknown-item-type","Unknown item type '${type}'",{type:r.type}))}}function y(e){return(0,_layers_support_lazyLayerLoader_js__WEBPACK_IMPORTED_MODULE_1__["layerLookupMap"][e.className])().then((r=>({constructor:r,properties:e.properties})))}function m(e){return M(e).then((e=>e?{className:"TileLayer"}:{className:"MapImageLayer"}))}function p(e){return T(e).then((e=>{if("object"==typeof e){const r={};return null!=e.id&&(r.layerId=e.id),{className:"FeatureLayer",properties:r}}return{className:"GroupLayer"}}))}function f(e){return T(e).then((r=>{if("object"==typeof r){const t={};let a;if(null!=r.id?(t.layerId=r.id,a=`${e.url}/layers/${r.id}`):a=e.url,Array.isArray(e.typeKeywords)&&e.typeKeywords.length>0){const r={IntegratedMesh:"IntegratedMeshLayer","3DObject":"SceneLayer",Point:"SceneLayer",PointCloud:"PointCloudLayer",Building:"BuildingSceneLayer"};for(const t of Object.keys(r))if(-1!==e.typeKeywords.indexOf(t))return{className:r[t]}}return Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(a).then((e=>{let r="SceneLayer";const a={Point:"SceneLayer","3DObject":"SceneLayer",IntegratedMesh:"IntegratedMeshLayer",PointCloud:"PointCloudLayer",Building:"BuildingSceneLayer"};return e&&e.layerType&&a[e.layerType]&&(r=a[e.layerType]),{className:r,properties:t}}))}return{className:"GroupLayer"}}))}async function L(e){await e.load();if(Object(_portalItemUtils_js__WEBPACK_IMPORTED_MODULE_4__["hasTypeKeyword"])(e,"Map Notes"))return{className:"MapNotesLayer"};if(Object(_portalItemUtils_js__WEBPACK_IMPORTED_MODULE_4__["hasTypeKeyword"])(e,"Route Layer"))return{className:"RouteLayer"};const r=await e.fetchData();return 1===Object(_layersLoader_js__WEBPACK_IMPORTED_MODULE_3__["getNumLayersAndTables"])(r)?{className:"FeatureLayer"}:{className:"GroupLayer"}}async function d(e){var r,t,a;await e.load();const n=null!=(r=null==(t=e.typeKeywords)?void 0:t.map((e=>e.toLowerCase())))?r:[];if(n.indexOf("elevation 3d layer")>-1)return{className:"ElevationLayer"};if(n.indexOf("tiled imagery")>-1)return{className:"ImageryTileLayer"};const o=await e.fetchData(),s=null==o?void 0:o.layerType;if("ArcGISTiledImageServiceLayer"===s)return{className:"ImageryTileLayer"};if("ArcGISImageServiceLayer"===s)return{className:"ImageryLayer"};return"map"===(null==(a=(await Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(e.url)).cacheType)?void 0:a.toLowerCase())?{className:"ImageryTileLayer"}:{className:"ImageryLayer"}}function S(){return{className:"StreamLayer"}}function I(){return{className:"VectorTileLayer"}}function N(){return{className:"KMLLayer"}}function h(){return{className:"WFSLayer"}}function g(){return{className:"WMSLayer"}}function w(){return{className:"WMTSLayer"}}function v(){return{className:"StreamLayer"}}function M(e){return Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(e.url).then((e=>e.tileInfo))}function T(e){return!e.url||e.url.match(/\/\d+$/)?Promise.resolve({}):e.load().then((()=>e.fetchData())).then((async r=>{if("Feature Service"===e.type)return j(r=await Object(_layersLoader_js__WEBPACK_IMPORTED_MODULE_3__["preprocessFSItemData"])(r,e.url));return Object(_layersLoader_js__WEBPACK_IMPORTED_MODULE_3__["getNumLayersAndTables"])(r)>0?j(r):Object(_support_requestPresets_js__WEBPACK_IMPORTED_MODULE_5__["requestArcGISServiceJSON"])(e.url).then(j)}))}function j(e){return 1===Object(_layersLoader_js__WEBPACK_IMPORTED_MODULE_3__["getNumLayersAndTables"])(e)&&{id:Object(_layersLoader_js__WEBPACK_IMPORTED_MODULE_3__["getFirstLayerOrTableId"])(e)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/styleUtils.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/styleUtils.js ***!
  \********************************************************************/
/*! exports provided: loadStyleRenderer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadStyleRenderer", function() { return t; });
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function t(t,i,n){const s=t&&t.getAtOrigin&&t.getAtOrigin("renderer",i.origin);if(s&&"unique-value"===s.type&&s.styleOrigin){const a=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__["result"])(s.populateFromStyle());if(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["throwIfAborted"])(n),!1===a.ok){const e=a.error;i&&i.messages&&i.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_2__["default"]("renderer:style-reference",`Failed to create unique value renderer from style reference: ${e.message}`,{error:e,context:i})),t.clear("renderer",i.origin)}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/support/requestPresets.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/requestPresets.js ***!
  \**************************************************************/
/*! exports provided: requestArcGISServiceJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "requestArcGISServiceJSON", function() { return n; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(n){const{data:o}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(n,{responseType:"json",query:{f:"json"}});return o}


/***/ })

};;
//# sourceMappingURL=51.render-page.js.map
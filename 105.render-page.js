exports.ids = [105];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/devEnvironmentUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/devEnvironmentUtils.js ***!
  \****************************************************************/
/*! exports provided: adjustStaticAGOUrl, isDevEnvironment, isTelemetryDevEnvironment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjustStaticAGOUrl", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDevEnvironment", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTelemetryDevEnvironment", function() { return o; });
/* harmony import */ var _global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global.js */ "../node_modules/@arcgis/core/core/global.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a){return a=a||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname,e.some((c=>{var t;return null!=(null==(t=a)?void 0:t.match(c))}))}function t(a,t){return a&&(t=t||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname)?null!=t.match(r)||null!=t.match(m)?a.replace("static.arcgis.com","staticdev.arcgis.com"):null!=t.match(n)||null!=t.match(s)?a.replace("static.arcgis.com","staticqa.arcgis.com"):a:a}function o(a){a=a||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname;return[/^zrh-.+?\.esri\.com$/].concat(e).some((c=>{var t;return null!=(null==(t=a)?void 0:t.match(c))}))}const r=/^devext.arcgis.com$/,n=/^qaext.arcgis.com$/,m=/^[\w-]*\.mapsdevext.arcgis.com$/,s=/^[\w-]*\.mapsqa.arcgis.com$/,e=[/^([\w-]*\.)?[\w-]*\.zrh-dev-local.esri.com$/,r,n,/^jsapps.esri.com$/,m,s];


/***/ }),

/***/ "../node_modules/@arcgis/core/support/featureFlags.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/featureFlags.js ***!
  \************************************************************/
/*! exports provided: disableContextNavigation, enableClouds, enableDirect3DObjectFeatureLayerDisplay, enableNewAtmosphere, enableWebStyleForceWOSR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disableContextNavigation", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableClouds", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableDirect3DObjectFeatureLayerDisplay", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableNewAtmosphere", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableWebStyleForceWOSR", function() { return a; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:force-wosr"),r=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:disable-context-navigation"),t=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:direct-3d-object-feature-layer-display"),o=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:enable-clouds"),n=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:new-atmosphere");


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/jsonUtils.js ***!
  \*****************************************************************/
/*! exports provided: fromJSON, write */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "write", function() { return t; });
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony import */ var _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/* harmony import */ var _symbolConversion_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./symbolConversion.js */ "../node_modules/@arcgis/core/symbols/support/symbolConversion.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(e,s,o,n){const r=m(e,{},n);r&&(s[o]=r)}function m(e,t,m){if(!e)return null;if(m&&"web-scene"===m.origin&&!(e instanceof _Symbol3D_js__WEBPACK_IMPORTED_MODULE_2__["default"])&&!(e instanceof _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_3__["default"])){const o="cim"!==e.type?Object(_symbolConversion_js__WEBPACK_IMPORTED_MODULE_4__["to3D"])(e):{symbol:null,error:new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol-conversion:unsupported-cim-symbol","CIM symbol is unsupported in web scenes",{symbol:e})};return o.symbol?o.symbol.write(t,m):(m.messages&&m.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol:unsupported",`Symbols of type '${e.declaredClass}' are not supported in scenes. Use 3D symbology instead when working with WebScene and SceneView`,{symbol:e,context:m,error:o.error})),null)}return m&&"web-map"===m.origin&&"web-style"===e.type?(m.messages&&m.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol:unsupported",`Symbols of type '${e.declaredClass}' are not supported in webmaps. Use CIMSymbol instead when working with WebMap in MapView.`,{symbol:e,context:m})),null):e.write(t,m)}function i(s,o){return Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["readSymbol"])(s,null,o)}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/styleUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/styleUtils.js ***!
  \******************************************************************/
/*! exports provided: fetchStyle, fetchSymbolFromStyle, resolveWebStyleSymbol, styleNameFromItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchStyle", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchSymbolFromStyle", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolveWebStyleSymbol", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleNameFromItem", function() { return $; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/devEnvironmentUtils.js */ "../node_modules/@arcgis/core/core/devEnvironmentUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalQueryParams_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../portal/PortalQueryParams.js */ "../node_modules/@arcgis/core/portal/PortalQueryParams.js");
/* harmony import */ var _support_featureFlags_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../support/featureFlags.js */ "../node_modules/@arcgis/core/support/featureFlags.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./jsonUtils.js */ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js");
/* harmony import */ var _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./StyleOrigin.js */ "../node_modules/@arcgis/core/symbols/support/StyleOrigin.js");
/* harmony import */ var _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Thumbnail.js */ "../node_modules/@arcgis/core/symbols/support/Thumbnail.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const b={};function d(e,t){return P(e,t).then((t=>({data:t.data,baseUrl:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(e),styleUrl:e})))}function h(e,t,r){const o=t.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__["default"].getDefault();let s;const n=`${o.url} - ${o.user&&o.user.username} - ${e}`;return b[n]||(b[n]=j(e,o,r).then((e=>(s=e,e.fetchData()))).then((t=>({data:t,baseUrl:s.itemUrl,styleName:e})))),b[n]}function j(e,t,r){return t.load(r).then((()=>{const o=new _portal_PortalQueryParams_js__WEBPACK_IMPORTED_MODULE_6__["default"]({disableExtraQuery:!0,query:`owner:${D} AND type:${R} AND typekeywords:"${e}"`});return t.queryItems(o,r)})).then((({results:t})=>{let o=null;const n=e.toLowerCase();if(t&&Array.isArray(t))for(const e of t){if(e.typeKeywords.some((e=>e.toLowerCase()===n))&&e.type===R&&e.owner===D){o=e;break}}if(!o)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-not-found",`The style '${e}' could not be found`,{styleName:e});return o.load(r)}))}function g(e,t,r){return e.styleUrl?d(e.styleUrl,r):e.styleName?h(e.styleName,t,r):Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-url-and-name-missing","Either styleUrl or styleName is required to resolve a style"))}function w(e,t,r,o){return e.name?e.styleName&&"Esri2DPointSymbolsStyle"===e.styleName?E(e,t,o):g(e,t,o).then((s=>U(s,e.name,t,r,o))):Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-symbol-reference-name-missing","Missing name in style symbol reference"))}function U(e,n,i,m,u){const b=e.data,d={portal:i.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(e.baseUrl),origin:"portal-item"},h=b.items.find((e=>e.name===n));if(!h){const e=`The symbol name '${n}' could not be found`;return Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:symbol-name-not-found",e,{symbolName:n}))}let j=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__["f"])(S(h,m),d),g=h.thumbnail&&h.thumbnail.href;const w=h.thumbnail&&h.thumbnail.imageData;Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["isDevEnvironment"])()&&(j=Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["adjustStaticAGOUrl"])(j),g=Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["adjustStaticAGOUrl"])(g));const U={portal:i.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(j)),origin:"portal-item"};return P(j,u).then((r=>{const o="cimRef"===m?N(r.data):r.data,s=Object(_jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__["fromJSON"])(o,U);if(s&&Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(s)){if(g){const e=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__["f"])(g,d);s.thumbnail=new _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__["default"]({url:e})}else w&&(s.thumbnail=new _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__["default"]({url:`data:image/png;base64,${w}`}));e.styleUrl?s.styleOrigin=new _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__["default"]({portal:i.portal,styleUrl:e.styleUrl,name:n}):e.styleName&&(s.styleOrigin=new _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__["default"]({portal:i.portal,styleName:e.styleName,name:n}))}return s}))}function N(e){return null===e||"CIMSymbolReference"===e.type?e:{type:"CIMSymbolReference",symbol:e}}function S(e,t){if("cimRef"===t)return e.cimRef;if(e.formatInfos&&!Object(_support_featureFlags_js__WEBPACK_IMPORTED_MODULE_7__["enableWebStyleForceWOSR"])())for(const r of e.formatInfos)if("gltf"===r.type)return r.href;return e.webRef}function $(e){for(const t of e.typeKeywords)if(/^Esri.*Style$/.test(t)&&"Esri Style"!==t)return t}function E(e,t,r){const o=q.replace(/\{SymbolName\}/gi,e.name);return P(o,r).then((e=>{const r=N(e.data);return Object(_jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__["fromJSON"])(r,{portal:t.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(o)),origin:"portal-item"})}))}function P(t,r){const o={responseType:"json",query:{f:"json"},...r};return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["normalize"])(t),o)}const D="esri_en",R="Style",q="https://cdn.arcgis.com/sharing/rest/content/items/220936cc6ed342c9937abd8f180e7d1e/resources/styles/cim/{SymbolName}.json?f=json";


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/symbolConversion.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/symbolConversion.js ***!
  \************************************************************************/
/*! exports provided: to3D */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "to3D", function() { return p; });
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/* harmony import */ var _PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../PointSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PointSymbol3D.js");
/* harmony import */ var _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony import */ var _LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../LineSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3D.js");
/* harmony import */ var _SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../SimpleMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js");
/* harmony import */ var _PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../PictureMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js");
/* harmony import */ var _SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../SimpleFillSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js");
/* harmony import */ var _PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../PolygonSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js");
/* harmony import */ var _TextSymbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../TextSymbol.js */ "../node_modules/@arcgis/core/symbols/TextSymbol.js");
/* harmony import */ var _LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../LabelSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LabelSymbol3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function p(p,S=!1,a=!1,c=!0){if(!p)return{symbol:null};let j;if(Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["isSymbol3D"])(p)||p instanceof _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"])j=p.clone();else if("cim"===p.type)j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromCIMSymbol(p);else if(p instanceof _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_4__["default"])j=_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_5__["default"].fromSimpleLineSymbol(p);else if(p instanceof _SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_6__["default"])j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromSimpleMarkerSymbol(p);else if(p instanceof _PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_7__["default"])j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromPictureMarkerSymbol(p);else if(p instanceof _SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_8__["default"])j=_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"].fromSimpleFillSymbol(p);else{if(!(p instanceof _TextSymbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]))return{error:new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol-conversion:unsupported-2d-symbol",`2D symbol of type '${p.type||p.declaredClass}' is unsupported in 3D`,{symbol:p})};j=c?_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromTextSymbol(p):_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromTextSymbol(p)}if(S&&(j.id=p.id),a&&Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["isSymbol3D"])(j))for(let o=0;o<j.symbolLayers.length;++o)j.symbolLayers.getItemAt(o)._ignoreDrivers=!0;return{symbol:j}}


/***/ })

};;
//# sourceMappingURL=105.render-page.js.map
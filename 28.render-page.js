exports.ids = [28];
exports.modules = {

/***/ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/persistableUrlUtils.js ***!
  \******************************************************************/
/*! exports provided: f, i, p, r, t, w */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return p; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function c(r,o){const s=o&&o.url&&o.url.path;if(r&&s&&(r=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(r,s,{preserveProtocolRelative:!0}),o.portalItem&&o.readResourcePaths)){const e=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeRelative"])(r,o.portalItem.itemUrl);h.test(e)&&o.readResourcePaths.push(o.portalItem.resourceFromPath(e).path)}return I(r,o&&o.portal)}function i(r,a,u=0){if(!r)return r;!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(r)&&a&&a.blockedRelativeUrls&&a.blockedRelativeUrls.push(r);let n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(r);if(a){const e=a.verifyItemRelativeUrls&&a.verifyItemRelativeUrls.rootPath||a.url&&a.url.path;if(e){const o=I(e,a.portal);n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeRelative"])(I(n,a.portal),o,o),n!==r&&a.verifyItemRelativeUrls&&a.verifyItemRelativeUrls.writtenUrls.push(n)}}return n=U(n,a&&a.portal),Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(n)&&(n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["normalize"])(n)),null!=a&&a.resources&&null!=a&&a.portalItem&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isAbsolute"])(n)&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["isDataProtocol"])(n)&&0===u&&a.resources.toKeep.push({resource:a.portalItem.resourceFromPath(n)}),n}function m(r,e,t){return c(r,t)}function p(r,e,t,o){const s=i(r,o);void 0!==s&&(e[t]=s)}const f=/\/items\/([^\/]+)\/resources\//,h=/^\.\/resources\//;function v(e){const t=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(e)?e.match(f):null;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(t)?t[1]:null}function U(r,e){return e&&!e.isPortal&&e.urlKey&&e.customBaseUrl?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,`${e.urlKey}.${e.customBaseUrl}`,e.portalHostname):r}function I(r,e){if(!e||e.isPortal||!e.urlKey||!e.customBaseUrl)return r;const t=`${e.urlKey}.${e.customBaseUrl}`;return Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["hasSameOrigin"])(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["appUrl"],`${_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["appUrl"].scheme}://${t}`)?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,e.portalHostname,t):Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["changeDomain"])(r,t,e.portalHostname)}var R=Object.freeze({__proto__:null,fromJSON:c,toJSON:i,read:m,write:p,itemIdFromResourceUrl:v});


/***/ }),

/***/ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js ***!
  \***********************************************************************************/
/*! exports provided: enumeration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enumeration", function() { return r; });
/* harmony import */ var _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,o={}){var l;const a=r instanceof _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"]?r:new _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"](r,o),t={type:null==(l=null==o?void 0:o.ignoreUnknown)||l?a.apiValues:String,readOnly:null==o?void 0:o.readOnly,json:{type:a.jsonValues,read:(null==o||!o.readOnly)&&{reader:a.read},write:{writer:a.write}}};return void 0!==(null==o?void 0:o.default)&&(t.json.default=o.default),void 0!==(null==o?void 0:o.name)&&(t.json.name=o.name),Object(_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])(t)}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/accessorSupport/originUtils.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/originUtils.js ***!
  \************************************************************************/
/*! exports provided: updateOrigins */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateOrigins", function() { return r; });
/* harmony import */ var _multiOriginJSONSupportUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../multiOriginJSONSupportUtils.js */ "../node_modules/@arcgis/core/core/multiOriginJSONSupportUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r){r&&r.writtenProperties&&r.writtenProperties.forEach((r=>{const t=r.target;r.newOrigin&&r.oldOrigin!==r.newOrigin&&Object(_multiOriginJSONSupportUtils_js__WEBPACK_IMPORTED_MODULE_0__["isMultiOriginJSONMixin"])(t)&&t.updateOrigin(r.propName,r.newOrigin)}))}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/multiOriginJSONSupportUtils.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/multiOriginJSONSupportUtils.js ***!
  \************************************************************************/
/*! exports provided: isMultiOriginJSONMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMultiOriginJSONMixin", function() { return i; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(i){return i&&"getAtOrigin"in i&&"originOf"in i}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js ***!
  \*****************************************************************/
/*! exports provided: APIKeyMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "APIKeyMixin", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(e){return"portalItem"in e}const i=i=>{let o=class extends i{get apiKey(){var e;return this._isOverridden("apiKey")?this._get("apiKey"):t(this)?null==(e=this.portalItem)?void 0:e.apiKey:null}set apiKey(e){null!=e?this._override("apiKey",e):(this._clearOverride("apiKey"),this.clear("apiKey","user"))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:String})],o.prototype,"apiKey",null),o=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.APIKeyMixin")],o),o};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ArcGISService.js ***!
  \*******************************************************************/
/*! exports provided: ArcGISService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArcGISService", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../support/arcgisLayerUrl.js */ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=p=>{let c=class extends p{get title(){if(this._get("title")&&"defaults"!==this.originOf("title"))return this._get("title");if(this.url){const t=Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["parse"])(this.url);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t)&&t.title)return t.title}return this._get("title")||""}set title(t){this._set("title",t)}set url(t){this._set("url",Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeUrl"])(t,_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger(this.declaredClass)))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],c.prototype,"title",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String})],c.prototype,"url",null),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.mixins.ArcGISService")],c),c};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/SceneService.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/SceneService.js ***!
  \******************************************************************/
/*! exports provided: SCENE_SERVICE_ITEM_TYPE, SceneService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SCENE_SERVICE_ITEM_TYPE", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SceneService", function() { return N; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _core_accessorSupport_originUtils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../core/accessorSupport/originUtils.js */ "../node_modules/@arcgis/core/core/accessorSupport/originUtils.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_HeightModelInfo_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../geometry/HeightModelInfo.js */ "../node_modules/@arcgis/core/geometry/HeightModelInfo.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../support/arcgisLayerUrl.js */ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _support_I3SIndexInfo_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../support/I3SIndexInfo.js */ "../node_modules/@arcgis/core/layers/support/I3SIndexInfo.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../portal/PortalItem.js */ "../node_modules/@arcgis/core/portal/PortalItem.js");
/* harmony import */ var _webdoc_support_saveUtils_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../webdoc/support/saveUtils.js */ "../node_modules/@arcgis/core/webdoc/support/saveUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const R=_core_Logger_js__WEBPACK_IMPORTED_MODULE_4__["default"].getLogger("esri.layers.mixins.SceneService"),N=o=>{let N=class extends o{constructor(){super(...arguments),this.spatialReference=null,this.fullExtent=null,this.heightModelInfo=null,this.minScale=0,this.maxScale=0,this.version={major:Number.NaN,minor:Number.NaN,versionString:""},this.copyright=null,this.sublayerTitleMode="item-title",this.title=null,this.layerId=null,this.indexInfo=null,this._debouncedSaveOperations=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__["debounce"])((async(e,t,r)=>{switch(e){case 0:return this._save(t);case 1:return this._saveAs(r,t)}}))}readSpatialReference(e,t){return this._readSpatialReference(t)}_readSpatialReference(e){if(null!=e.spatialReference)return _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__["default"].fromJSON(e.spatialReference);{const t=e.store,r=t.indexCRS||t.geographicCRS,o=r&&parseInt(r.substring(r.lastIndexOf("/")+1,r.length),10);return null!=o?new _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__["default"](o):null}}readFullExtent(e,t,r){if(null!=e&&"object"==typeof e){const o=null==e.spatialReference?{...e,spatialReference:this._readSpatialReference(t)}:e;return _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_14__["default"].fromJSON(o,r)}const o=t.store,i=this._readSpatialReference(t);return null==i||null==o||null==o.extent||!Array.isArray(o.extent)||o.extent.some((e=>e<O))?null:new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_14__["default"]({xmin:o.extent[0],ymin:o.extent[1],xmax:o.extent[2],ymax:o.extent[3],spatialReference:i})}readVersion(e,t){const r=t.store,o=null!=r.version?r.version.toString():"",i={major:Number.NaN,minor:Number.NaN,versionString:o},s=o.split(".");return s.length>=2&&(i.major=parseInt(s[0],10),i.minor=parseInt(s[1],10)),i}readTitlePortalItem(e){return"item-title"!==this.sublayerTitleMode?void 0:e}readTitleService(e,t){const r=this.portalItem&&this.portalItem.title;if("item-title"===this.sublayerTitleMode)return Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__["titleFromUrlAndName"])(this.url,t.name);let o=t.name;if(!o&&this.url){const e=Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__["parse"])(this.url);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isSome"])(e)&&(o=e.title)}return"item-title-and-service-name"===this.sublayerTitleMode&&r&&(o=r+" - "+o),Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__["cleanTitle"])(o)}set url(e){const t=Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__["sanitizeUrlWithLayerId"])({layer:this,url:e,nonStandardUrlAllowed:!1,logger:R});this._set("url",t.url),null!=t.layerId&&this._set("layerId",t.layerId)}writeUrl(e,t,r,o){Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_17__["writeUrlWithLayerId"])(this,e,"layers",t,o)}get parsedUrl(){const e=this._get("url");if(!e)return null;const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["urlToObject"])(e);return null!=this.layerId&&(t.path=`${t.path}/layers/${this.layerId}`),t}async _fetchIndexAndUpdateExtent(e,t){this.indexInfo=Object(_support_I3SIndexInfo_js__WEBPACK_IMPORTED_MODULE_19__["fetchIndexInfo"])(this.parsedUrl.path,this.rootNode,e,this.apiKey,R,t),null==this.fullExtent||this.fullExtent.hasZ||this._updateExtent(await this.indexInfo)}_updateExtent(e){if("page"===(null==e?void 0:e.type)){var t,o;const i=e.rootIndex%e.pageSize,s=null==(t=e.rootPage)||null==(o=t.nodes)?void 0:o[i];if(null==s||null==s.obb||null==s.obb.center||null==s.obb.halfSize)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:invalid-node-page","Invalid node page.");if(s.obb.center[0]<O||null==this.fullExtent||this.fullExtent.hasZ)return;const a=s.obb.halfSize,n=s.obb.center[2],l=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);this.fullExtent.zmin=n-l,this.fullExtent.zmax=n+l}else if("node"===(null==e?void 0:e.type)){var i;const t=null==(i=e.rootNode)?void 0:i.mbs;if(!Array.isArray(t)||4!==t.length||t[0]<O)return;const r=t[2],o=t[3];this.fullExtent.zmin=r-o,this.fullExtent.zmax=r+o}}async _fetchService(e){if(null==this.url)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:url-not-set","Scene service can not be loaded without valid portal item or url");if(null==this.layerId&&/SceneServer\/*$/i.test(this.url)){const t=await this._fetchFirstLayerId(e);null!=t&&(this.layerId=t)}return this._fetchServiceLayer(e)}async _fetchFirstLayerId(e){const r=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this.url,{query:{f:"json",token:this.apiKey},responseType:"json",signal:e});if(r.data&&Array.isArray(r.data.layers)&&r.data.layers.length>0)return r.data.layers[0].id}async _fetchServiceLayer(e){const r=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this.parsedUrl.path,{query:{f:"json",token:this.apiKey},responseType:"json",signal:e});r.ssl&&(this.url=this.url.replace(/^http:/i,"https:"));const o=r.data;this.read(o,{origin:"service",url:this.parsedUrl}),this.validateLayer(o)}async _ensureLoadBeforeSave(){await this.load(),"beforeSave"in this&&"function"==typeof this.beforeSave&&await this.beforeSave()}validateLayer(e){}_updateTypeKeywords(e,t,r){e.typeKeywords||(e.typeKeywords=[]);const o=t.getTypeKeywords();for(const i of o)e.typeKeywords.push(i);e.typeKeywords&&(e.typeKeywords=e.typeKeywords.filter(((e,t,r)=>r.indexOf(e)===t)),1===r&&(e.typeKeywords=e.typeKeywords.filter((e=>"Hosted Service"!==e))))}async _saveAs(e,t){const o={...E,...t};let i=_portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_21__["default"].from(e);i||(R.error("_saveAs(): requires a portal item parameter"),await Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:portal-item-required","_saveAs() requires a portal item to save to"))),i.id&&(i=i.clone(),i.id=null);const s=i.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_20__["default"].getDefault();await this._ensureLoadBeforeSave(),i.type=T,i.portal=s;const a={origin:"portal-item",url:null,messages:[],portal:s,portalItem:i,writtenProperties:[],blockedRelativeUrls:[],resources:{toAdd:[],toUpdate:[],toKeep:[],pendingOperations:[]}},n={layers:[this.write(null,a)]};return await Promise.all(a.resources.pendingOperations),await this._validateAgainstJSONSchema(n,a,o),i.url=this.url,i.title||(i.title=this.title),this._updateTypeKeywords(i,o,1),await s._signIn(),await s.user.addItem({item:i,folder:o&&o.folder,data:n}),await Object(_webdoc_support_saveUtils_js__WEBPACK_IMPORTED_MODULE_22__["saveResources"])(this.resourceReferences,a,null),this.portalItem=i,Object(_core_accessorSupport_originUtils_js__WEBPACK_IMPORTED_MODULE_13__["updateOrigins"])(a),a.portalItem=i,i}async _save(e){const t={...E,...e};this.portalItem||(R.error("_save(): requires the .portalItem property to be set"),await Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:portal-item-not-set","Portal item to save to has not been set on this SceneService"))),this.portalItem.type!==T&&(R.error("_save(): Non-matching portal item type. Got "+this.portalItem.type+", expected "+T),await Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:portal-item-wrong-type",`Portal item needs to have type "${T}"`))),await this._ensureLoadBeforeSave();const o={origin:"portal-item",url:this.portalItem.itemUrl&&Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["urlToObject"])(this.portalItem.itemUrl),messages:[],portal:this.portalItem.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_20__["default"].getDefault(),portalItem:this.portalItem,writtenProperties:[],blockedRelativeUrls:[],resources:{toAdd:[],toUpdate:[],toKeep:[],pendingOperations:[]}},i={layers:[this.write(null,o)]};return await Promise.all(o.resources.pendingOperations),await this._validateAgainstJSONSchema(i,o,t),this.portalItem.url=this.url,this.portalItem.title||(this.portalItem.title=this.title),this._updateTypeKeywords(this.portalItem,t,0),await this.portalItem.update({data:i}),await Object(_webdoc_support_saveUtils_js__WEBPACK_IMPORTED_MODULE_22__["saveResources"])(this.resourceReferences,o,null),Object(_core_accessorSupport_originUtils_js__WEBPACK_IMPORTED_MODULE_13__["updateOrigins"])(o),this.portalItem}async _validateAgainstJSONSchema(e,t,o){let i=t.messages.filter((e=>"error"===e.type)).map((e=>new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](e.name,e.message,e.details)));if(o&&o.validationOptions.ignoreUnsupported&&(i=i.filter((e=>"layer:unsupported"!==e.name&&"symbol:unsupported"!==e.name&&"symbol-layer:unsupported"!==e.name&&"property:unsupported"!==e.name&&"url:unsupported"!==e.name&&"scenemodification:unsupported"!==e.name))),o.validationOptions.enabled||U){const t=(await __webpack_require__.e(/*! import() */ 92).then(__webpack_require__.bind(null, /*! ../support/schemaValidator.js */ "../node_modules/@arcgis/core/layers/support/schemaValidator.js"))).validate(e,o.portalItemLayerType);if(t.length>0){const e=`Layer item did not validate:\n${t.join("\n")}`;if(R.error(`_validateAgainstJSONSchema(): ${e}`),"throw"===o.validationOptions.failPolicy){const e=t.map((e=>new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:schema-validation",e))).concat(i);throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice-validate:error","Failed to save layer item due to schema validation, see `details.errors`.",{combined:e})}}}if(i.length>0)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("sceneservice:save","Failed to save SceneService due to unsupported or invalid content. See 'details.errors' for more detailed information",{errors:i})}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__["id"])],N.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__["default"]})],N.prototype,"spatialReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("spatialReference",["spatialReference","store.indexCRS","store.geographicCRS"])],N.prototype,"readSpatialReference",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_14__["default"]})],N.prototype,"fullExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("fullExtent",["fullExtent","store.extent","spatialReference","store.indexCRS","store.geographicCRS"])],N.prototype,"readFullExtent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({readOnly:!0,type:_geometry_HeightModelInfo_js__WEBPACK_IMPORTED_MODULE_15__["default"]})],N.prototype,"heightModelInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{name:"layerDefinition.minScale",write:!0,origins:{service:{read:{source:"minScale"},write:!1}}}})],N.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{name:"layerDefinition.maxScale",write:!0,origins:{service:{read:{source:"maxScale"},write:!1}}}})],N.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({readOnly:!0})],N.prototype,"version",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("version",["store.version"])],N.prototype,"readVersion",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String,json:{read:{source:"copyrightText"}}})],N.prototype,"copyright",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String,json:{read:!1}})],N.prototype,"sublayerTitleMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String})],N.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("portal-item","title")],N.prototype,"readTitlePortalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("service","title",["name"])],N.prototype,"readTitleService",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{origins:{service:{read:{source:"id"}},"portal-item":{write:{target:"id",isRequired:!0,ignoreOrigin:!0},read:!1}}}})],N.prototype,"layerId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__["url"])],N.prototype,"url",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("url")],N.prototype,"writeUrl",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])()],N.prototype,"parsedUrl",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({readOnly:!0})],N.prototype,"store",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String,readOnly:!0,json:{read:{source:"store.rootNode"}}})],N.prototype,"rootNode",void 0),N=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__["subclass"])("esri.layers.mixins.SceneService")],N),N},O=-1e38,U=!1,T="Scene Service",E={getTypeKeywords:()=>[],portalItemLayerType:"unknown",validationOptions:{enabled:!0,ignoreUnsupported:!1,failPolicy:"throw"}};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/I3SIndexInfo.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/I3SIndexInfo.js ***!
  \*******************************************************************/
/*! exports provided: fetchIndexInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchIndexInfo", function() { return n; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(n,t,s,a,i,d){let l=null;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(s)){const o=`${n}/nodepages/`,t=o+Math.floor(s.rootIndex/s.nodesPerPage);try{return{type:"page",rootPage:(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t,{query:{f:"json",token:a},responseType:"json",signal:d})).data,rootIndex:s.rootIndex,pageSize:s.nodesPerPage,lodMetric:s.lodSelectionMetricType,urlPrefix:o}}catch(f){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(i)&&i.warn("#fetchIndexInfo()","Failed to load root node page. Falling back to node documents.",t,f),l=f}}if(!t)return null;const p=`${n}/nodes/`,c=p+(t&&t.split("/").pop());try{return{type:"node",rootNode:(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(c,{query:{f:"json",token:a},responseType:"json",signal:d})).data,urlPrefix:p}}catch(f){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("sceneservice:root-node-missing","Root node missing.",{pageError:l,nodeError:f,url:c})}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js ***!
  \*********************************************************************/
/*! exports provided: cleanTitle, isAGOLUrl, isArcGISUrl, isHostedAgolService, isHostedSecuredProxyService, isServerOrServicesAGOLUrl, isWmsServer, parse, parseNonStandardSublayerUrl, sanitizeUrl, sanitizeUrlWithLayerId, serverTypes, titleFromUrlAndName, writeUrlWithLayerId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanTitle", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAGOLUrl", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArcGISUrl", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHostedAgolService", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHostedSecuredProxyService", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isServerOrServicesAGOLUrl", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWmsServer", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseNonStandardSublayerUrl", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeUrl", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeUrlWithLayerId", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "serverTypes", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "titleFromUrlAndName", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeUrlWithLayerId", function() { return C; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l={mapserver:"MapServer",imageserver:"ImageServer",featureserver:"FeatureServer",sceneserver:"SceneServer",streamserver:"StreamServer",vectortileserver:"VectorTileServer"},a=Object.values(l),c=new RegExp(`^((?:https?:)?\\/\\/\\S+?\\/rest\\/services\\/(.+?)\\/(${a.join("|")}))(?:\\/(?:layers\\/)?(\\d+))?`,"i"),f=new RegExp(`^((?:https?:)?\\/\\/\\S+?\\/([^\\/\\n]+)\\/(${a.join("|")}))(?:\\/(?:layers\\/)?(\\d+))?`,"i"),v=/(.*?)\/(?:layers\/)?(\d+)\/?$/i;function p(e){return!!c.test(e)}function d(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(e),n=t.path.match(c)||t.path.match(f);if(!n)return null;const[,s,i,o,u]=n,a=i.indexOf("/");return{title:w(-1!==a?i.slice(a+1):i),serverType:l[o.toLowerCase()],sublayer:null!=u&&""!==u?parseInt(u,10):null,url:{path:s}}}function m(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(e).path.match(v);return t?{serviceUrl:t[1],sublayerId:Number(t[2])}:null}function w(e){return(e=e.replace(/\s*[/_]+\s*/g," "))[0].toUpperCase()+e.slice(1)}function h(r,t){const n=[];if(r){const t=d(r);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(t)&&t.title&&n.push(t.title)}if(t){const e=w(t);n.push(e)}if(2===n.length){if(-1!==n[0].toLowerCase().indexOf(n[1].toLowerCase()))return n[0];if(-1!==n[1].toLowerCase().indexOf(n[0].toLowerCase()))return n[1]}return n.join(" - ")}function y(e){if(!e)return!1;const r=".arcgis.com/",t="//services",n="//tiles",s="//features",i=-1!==(e=e.toLowerCase()).indexOf(r),o=-1!==e.indexOf(t)||-1!==e.indexOf(n)||-1!==e.indexOf(s);return i&&o}function x(e,r){return r&&e&&-1!==e.toLowerCase().indexOf(r.toLowerCase())}function g(e,r){return e?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeTrailingSlash"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeQueryParameters"])(e,r)):e}function O(s){let{url:i}=s;if(!i)return{url:i};i=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeQueryParameters"])(i,s.logger);const o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["urlToObject"])(i),u=d(o.path);let l;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(u))null!=u.sublayer&&null==s.layer.layerId&&(l=u.sublayer),i=u.url.path;else if(s.nonStandardUrlAllowed){const r=m(o.path);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(r)&&(i=r.serviceUrl,l=r.sublayerId)}return{url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeTrailingSlash"])(i),layerId:l}}function C(e,r,t,n,i){Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_2__["w"])(r,n,"url",i),n.url&&null!=e.layerId&&(n.url=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["join"])(n.url,t,e.layerId.toString()))}function S(e){if(!e)return!1;const r=e.toLowerCase(),t=-1!==r.indexOf("/services/"),n=-1!==r.indexOf("/mapserver/wmsserver"),s=-1!==r.indexOf("/imageserver/wmsserver"),i=-1!==r.indexOf("/wmsserver");return t&&(n||s||i)}function L(e){if(!e)return!1;const r=new _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["Url"](Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(e)).authority.toLowerCase();return"server.arcgisonline.com"===r||"services.arcgisonline.com"===r}function b(e){if(!e)return!1;return new _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["Url"](Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeAbsolute"])(e)).authority.toLowerCase().includes("arcgis.com")}


/***/ }),

/***/ "../node_modules/@arcgis/core/portal/support/resourceUtils.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/resourceUtils.js ***!
  \********************************************************************/
/*! exports provided: addOrUpdateResource, contentToBlob, fetchResources, getSiblingOfSameType, getSiblingOfSameTypeI, removeAllResources, removeResource, splitPrefixFileNameAndExtension */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addOrUpdateResource", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "contentToBlob", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchResources", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSiblingOfSameType", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSiblingOfSameTypeI", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeAllResources", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeResource", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "splitPrefixFileNameAndExtension", function() { return d; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function c(e,t={},a){await e.load(a);const o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.itemUrl,"resources"),{start:n=1,num:c=10,sortOrder:u="asc",sortField:i="created"}=t,l={query:{start:n,num:c,sortOrder:u,sortField:i,token:e.apiKey},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(a,"signal")},p=await e.portal._request(o,l);return{total:p.total,nextStart:p.nextStart,resources:p.resources.map((({created:t,size:r,resource:a})=>({created:new Date(t),size:r,resource:e.resourceFromPath(a)})))}}async function u(e,o,n,c){if(!e.hasPath())throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"](`portal-item-resource-${o}:invalid-path`,"Resource does not have a valid path");const u=e.portalItem;await u.load(c);const i=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(u.userItemUrl,"add"===o?"addResources":"updateResources"),[l,d]=p(e.path),m=await h(n),f=new FormData;return l&&"."!==l&&f.append("resourcesPrefix",l),f.append("fileName",d),f.append("file",m,d),f.append("f","json"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(c)&&c.access&&f.append("access",c.access),await u.portal._request(i,{method:"post",body:f,signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(c,"signal")}),e}async function i(e,a,o){if(!a.hasPath())throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("portal-item-resources-remove:invalid-path","Resource does not have a valid path");await e.load(o);const n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.userItemUrl,"removeResources");await e.portal._request(n,{method:"post",query:{resource:a.path},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(o,"signal")}),a.portalItem=null}async function l(e,t){await e.load(t);const a=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.userItemUrl,"removeResources");return e.portal._request(a,{method:"post",query:{deleteAll:!0},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(t,"signal")})}function p(e){const t=e.lastIndexOf("/");return-1===t?[".",e]:[e.slice(0,t),e.slice(t+1)]}function d(e){const[t,r]=m(e),[a,o]=p(t);return[a,o,r]}function m(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["getPathExtension"])(e);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t)?[e,""]:[e.slice(0,e.length-t.length-1),`.${t}`]}async function h(t){if(t instanceof Blob)return t;return(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t.url,{responseType:"blob"})).data}function f(e,t){if(!e.hasPath())return null;const[r,,a]=d(e.path);return e.portalItem.resourceFromPath(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(r,t+a))}function w(e,t){if(!e.hasPath())return null;const[r,,a]=d(e.path);return e.portalItem.resourceFromPath(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(r,t+a))}


/***/ }),

/***/ "../node_modules/@arcgis/core/webdoc/support/saveUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/webdoc/support/saveUtils.js ***!
  \****************************************************************/
/*! exports provided: saveResources */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveResources", function() { return a; });
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_uuid_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/uuid.js */ "../node_modules/@arcgis/core/core/uuid.js");
/* harmony import */ var _portal_support_resourceUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../portal/support/resourceUtils.js */ "../node_modules/@arcgis/core/portal/support/resourceUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function a(r,a,u){if(!a||!a.resources)return;const h=a.portalItem===r.portalItem?new Set(r.paths):new Set;r.paths.length=0,r.portalItem=a.portalItem;const i=new Set(a.resources.toKeep.map((r=>r.resource.path))),f=new Set,m=[];i.forEach((e=>{h.delete(e),r.paths.push(e)}));for(const e of a.resources.toUpdate)if(h.delete(e.resource.path),i.has(e.resource.path)||f.has(e.resource.path)){const{resource:o,content:t,finish:a,error:p}=e,h=Object(_portal_support_resourceUtils_js__WEBPACK_IMPORTED_MODULE_4__["getSiblingOfSameTypeI"])(o,Object(_core_uuid_js__WEBPACK_IMPORTED_MODULE_3__["generateUUID"])());r.paths.push(h.path),m.push(n({resource:h,content:t,finish:a,error:p},u))}else r.paths.push(e.resource.path),m.push(p(e,u)),f.add(e.resource.path);for(const e of a.resources.toAdd)m.push(n(e,u)),r.paths.push(e.resource.path);if(h.forEach((r=>{const e=a.portalItem.resourceFromPath(r);m.push(e.portalItem.removeResource(e).catch((()=>{})))})),0===m.length)return;const l=await Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["eachAlways"])(m);Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["throwIfAborted"])(u);const d=l.filter((r=>"error"in r)).map((r=>r.error));if(d.length>0)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("save:resources","Failed to save one or more resources",{errors:d})}async function n(e,o){const t=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__["result"])(e.resource.portalItem.addResource(e.resource,e.content,o));if(!0!==t.ok)throw e.error&&e.error(t.error),t.error;e.finish&&e.finish(e.resource)}async function p(e,o){const t=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__["result"])(e.resource.update(e.content,o));if(!0!==t.ok)throw e.error(t.error),t.error;e.finish(e.resource)}


/***/ })

};;
//# sourceMappingURL=28.render-page.js.map
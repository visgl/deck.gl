exports.ids = [45];
exports.modules = {

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

/***/ "../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js ***!
  \**********************************************************************/
/*! exports provided: diff, hasDiff, hasDiffAny, isEmpty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "diff", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasDiff", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasDiffAny", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isEmpty", function() { return d; });
/* harmony import */ var _Accessor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/core/accessorSupport/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const f=["esri.Color","esri.portal.Portal","esri.symbols.support.Symbol3DAnchorPosition2D","esri.symbols.support.Symbol3DAnchorPosition3D"];function i(e){return e instanceof _Accessor_js__WEBPACK_IMPORTED_MODULE_0__["default"]}function c(t){return t instanceof _Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"]?Object.keys(t.items):i(t)?Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["getProperties"])(t).keys():t?Object.keys(t):[]}function u(t,n){return t instanceof _Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"]?t.items[n]:t[n]}function l(t,e){return!(!Array.isArray(t)||!Array.isArray(e))&&t.length!==e.length}function s(t){return t?t.declaredClass:null}function p(t,e){const n=t.diff;if(n&&"function"==typeof n)return n(t,e);const r=c(t),a=c(e);if(0===r.length&&0===a.length)return;if(!r.length||!a.length||l(t,e))return{type:"complete",oldValue:t,newValue:e};const y=a.filter((t=>-1===r.indexOf(t))),m=r.filter((t=>-1===a.indexOf(t))),d=r.filter((n=>a.indexOf(n)>-1&&u(t,n)!==u(e,n))).concat(y,m).sort(),b=s(t);if(b&&f.indexOf(b)>-1&&d.length)return{type:"complete",oldValue:t,newValue:e};let h;const j=i(t)&&i(e);for(const f of d){const r=u(t,f),i=u(e,f);let c;(j||"function"!=typeof r&&"function"!=typeof i)&&(r!==i&&(null==r&&null==i||(c=n&&n[f]&&"function"==typeof n[f]?n[f](r,i):"object"==typeof r&&"object"==typeof i&&s(r)===s(i)?p(r,i):{type:"complete",oldValue:r,newValue:i},Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(c)&&(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(h)?h.diff[f]=c:h={type:"partial",diff:{[f]:c}}))))}return h}function a(t,e){if(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t))return!1;const o=e.split(".");let r=t;for(const n of o){if("complete"===r.type)return!0;if("partial"!==r.type)return!1;{const t=r.diff[n];if(!t)return!1;r=t}}return!0}function y(t,e){for(const n of e)if(a(t,n))return!0;return!1}function m(t,e){if("function"!=typeof t&&"function"!=typeof e&&(t||e))return!t||!e||"object"==typeof t&&"object"==typeof e&&s(t)!==s(e)?{type:"complete",oldValue:t,newValue:e}:p(t,e)}function d(t){if(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t))return!0;switch(t.type){case"complete":return!1;case"collection":{const e=t;for(const t of e.added)if(!d(t))return!1;for(const t of e.removed)if(!d(t))return!1;for(const t of e.changed)if(!d(t))return!1;return!0}case"partial":for(const e in t.diff){if(!d(t.diff[e]))return!1}return!0}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js ***!
  \*******************************************************************************/
/*! exports provided: createOptimizedFeatures, getGeometryType, inferLayerProperties, validateGeoJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createOptimizedFeatures", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getGeometryType", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inferLayerProperties", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateGeoJSON", function() { return I; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _OptimizedFeature_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../OptimizedFeature.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedFeature.js");
/* harmony import */ var _OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../OptimizedGeometry.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedGeometry.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o={LineString:"esriGeometryPolyline",MultiLineString:"esriGeometryPolyline",MultiPoint:"esriGeometryMultipoint",Point:"esriGeometryPoint",Polygon:"esriGeometryPolygon",MultiPolygon:"esriGeometryPolygon"};function r(e){return o[e]}function*i(e){switch(e.type){case"Feature":yield e;break;case"FeatureCollection":for(const t of e.features)t&&(yield t)}}function*s(e){if(!e)return null;switch(e.type){case"Point":yield e.coordinates;break;case"LineString":case"MultiPoint":yield*e.coordinates;break;case"MultiLineString":case"Polygon":for(const t of e.coordinates)yield*t;break;case"MultiPolygon":for(const t of e.coordinates)for(const e of t)yield*e}}function*c(e,o={}){const{geometryType:i,objectIdField:s}=o;for(const u of e){var c;const{geometry:e,properties:l,id:f}=u;if(e&&r(e.type)!==i)continue;const a=l||{};let y=null!=(c=a[s])?c:null;s&&null!=f&&!a[s]&&(a[s]=y=f);const d=new _OptimizedFeature_js__WEBPACK_IMPORTED_MODULE_1__["default"](e?p(new _OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_2__["default"],e,o):null,a,null,y);yield d}}function u(e){for(const t of e)if(t.length>2)return!0;return!1}function l(e){return!a(e)}function f(e){return a(e)}function a(e){let t=0;for(let n=0;n<e.length;n++){const o=e[n],r=e[(n+1)%e.length];t+=o[0]*r[1]-r[0]*o[1]}return t<=0}function y(e){const t=e[0],n=e[e.length-1];return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]||e.push(t),e}function p(e,t,n){switch(t.type){case"LineString":return d(e,t,n);case"MultiLineString":return g(e,t,n);case"MultiPoint":return m(e,t,n);case"MultiPolygon":return h(e,t,n);case"Point":return w(e,t,n);case"Polygon":return P(e,t,n)}}function d(e,t,n){return S(e,t.coordinates,n),e}function g(e,t,n){for(const o of t.coordinates)S(e,o,n);return e}function m(e,t,n){return S(e,t.coordinates,n),e}function h(e,t,n){for(const o of t.coordinates){b(e,o[0],n);for(let t=1;t<o.length;t++)j(e,o[t],n)}return e}function w(e,t,n){return G(e,t.coordinates,n),e}function P(e,t,n){const o=t.coordinates;b(e,o[0],n);for(let r=1;r<o.length;r++)j(e,o[r],n);return e}function b(e,t,n){const o=y(t);l(o)?F(e,o,n):S(e,o,n)}function j(e,t,n){const o=y(t);f(o)?F(e,o,n):S(e,o,n)}function S(e,t,n){for(const o of t)G(e,o,n);e.lengths.push(t.length)}function F(e,t,n){for(let o=t.length-1;o>=0;o--)G(e,t[o],n);e.lengths.push(t.length)}function G(e,t,n){const[o,r,i]=t;e.coords.push(o,r),n.hasZ&&e.coords.push(i||0)}function M(e){switch(typeof e){case"string":return"esriFieldTypeString";case"number":return"esriFieldTypeDouble";default:return"unknown"}}function I(t){if(!t)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("geojson-layer:empty","GeoJSON data is empty");if("Feature"!==t.type&&"FeatureCollection"!==t.type)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("geojson-layer:unsupported-geojson-object","missing or not supported GeoJSON object type",{data:t});const{crs:n}=t;if(!n)return;const o="string"==typeof n?n:"name"===n.type?n.properties.name:"EPSG"===n.type?n.properties.code:null,r=new RegExp(".*(CRS84H?|4326)$","i");if(!o||!r.test(o))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("geojson-layer:unsupported-crs","unsupported GeoJSON 'crs' member",{crs:n})}function T(e,t={}){const n=[],o=new Set,c=new Set;let l,f=!1,a=Number.NEGATIVE_INFINITY,y=null,p=!1,{geometryType:d=null}=t,g=!1;for(const h of i(e)){const{geometry:e,properties:t,id:i}=h;if(!e||(d||(d=r(e.type)),r(e.type)===d)){if(!f){f=u(s(e))}if(p||(p=null!=i,p&&(l=typeof i,"number"===l&&(y=Object.keys(t).filter((e=>t[e]===i))))),p&&"number"===l&&null!=i&&(a=Math.max(a,i),y.length>1?y=y.filter((e=>t[e]===i)):1===y.length&&(y=t[y[0]]===i?y:[])),!g&&t){let e=!0;for(const r in t){if(o.has(r))continue;const i=t[r];if(null==i){e=!1,c.add(r);continue}const s=M(i);"unknown"!==s?(c.delete(r),o.add(r),n.push({name:r,alias:r,type:s})):c.add(r)}g=e}}}const m=y&&1===y.length&&y[0]||null;if(m)for(const r of n)r.name===m&&(r.type="esriFieldTypeOID");return{fields:n,geometryType:d,hasZ:f,maxObjectId:Math.max(0,a),objectIdFieldName:m,objectIdFieldType:l,unknownFields:Array.from(c)}}function k(e,t){return Array.from(c(i(e),t))}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js ***!
  \******************************************************************************************/
/*! exports provided: createCapabilities, createDefaultAttributesFunction, createDefaultTemplate, createDrawingInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createCapabilities", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDefaultAttributesFunction", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDefaultTemplate", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDrawingInfo", function() { return u; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _data_QueryEngineCapabilities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../data/QueryEngineCapabilities.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngineCapabilities.js");
/* harmony import */ var _symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../symbols/support/defaultsJSON.js */ "../node_modules/@arcgis/core/symbols/support/defaultsJSON.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(t){return{renderer:{type:"simple",symbol:"esriGeometryPoint"===t||"esriGeometryMultipoint"===t?_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPointSymbolJSON"]:"esriGeometryPolyline"===t?_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPolylineSymbolJSON"]:_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPolygonSymbolJSON"]}}}function n(s,e){if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("csp-restrictions"))return()=>({[e]:null,...s});try{let t=`this.${e} = null;`;for(const e in s){t+=`this${e.indexOf(".")?`["${e}"]`:`.${e}`} = ${JSON.stringify(s[e])};`}const r=new Function(t);return()=>new r}catch(r){return()=>({[e]:null,...s})}}function i(t={}){return[{name:"New Feature",description:"",prototype:{attributes:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(t)}}]}function a(t,s){return{attachment:null,data:{isVersioned:!1,supportsAttachment:!1,supportsM:!1,supportsZ:t},metadata:{supportsAdvancedFieldProperties:!1},operations:{supportsCalculate:!1,supportsTruncate:!1,supportsValidateSql:!1,supportsAdd:s,supportsDelete:s,supportsEditing:s,supportsChangeTracking:!1,supportsQuery:!0,supportsQueryAttachments:!1,supportsResizeAttachments:!1,supportsSync:!1,supportsUpdate:s,supportsExceedsLimitStatistics:!0},query:_data_QueryEngineCapabilities_js__WEBPACK_IMPORTED_MODULE_2__["queryCapabilities"],queryRelated:{supportsCount:!0,supportsOrderBy:!0,supportsPagination:!0},editing:{supportsGeometryUpdate:s,supportsGlobalId:!1,supportsReturnServiceEditsInSourceSpatialReference:!1,supportsRollbackOnFailure:!1,supportsUpdateWithoutM:!1,supportsUploadWithItemId:!1,supportsDeleteByAnonymous:!1,supportsDeleteByOthers:!1,supportsUpdateByAnonymous:!1,supportsUpdateByOthers:!1}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/ogc/ogcFeatureUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/ogc/ogcFeatureUtils.js ***!
  \******************************************************************/
/*! exports provided: getCollectionDefinition, getServerCollections, getServerConformance, getServerLandingPage, getServerOpenApi, getSpatialReferenceWkid, queryFeatureSetJSON, queryOptimizedFeatureSet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCollectionDefinition", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getServerCollections", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getServerConformance", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getServerLandingPage", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getServerOpenApi", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSpatialReferenceWkid", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryFeatureSetJSON", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryOptimizedFeatureSet", function() { return v; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _geometry_support_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/support/webMercatorUtils.js */ "../node_modules/@arcgis/core/geometry/support/webMercatorUtils.js");
/* harmony import */ var _graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../graphics/featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _graphics_OptimizedFeatureSet_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../graphics/OptimizedFeatureSet.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedFeatureSet.js");
/* harmony import */ var _graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../graphics/sources/geojson/geojson.js */ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js");
/* harmony import */ var _graphics_sources_support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../graphics/sources/support/clientSideDefaults.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _support_fieldType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../support/fieldType.js */ "../node_modules/@arcgis/core/layers/support/fieldType.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const h=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.layers.graphics.sources.ogcfeature");async function j(i,r,a={},s=5){const{links:o}=i,l=C(o,"items","application/geo+json")||C(o,"http://www.opengis.net/def/rel/ogc/1.0/items","application/geo+json");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(l))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:missing-items-page","Missing items url");const{data:c}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(l.href,{signal:a.signal,query:{limit:s,...a.customParameters,token:a.apiKey},headers:{accept:"application/geo+json"}});await Object(_graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__["validateGeoJSON"])(c);const u=Object(_graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__["inferLayerProperties"])(c,{geometryType:r.geometryType}),d=r.fields||u.fields||[],f=null!=r.hasZ?r.hasZ:u.hasZ,b=u.geometryType,j=r.objectIdField||u.objectIdFieldName||"OBJECTID";let F=r.timeInfo;const I=d.find((e=>e.name===j));if(!I){if(!u.objectIdFieldType)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:missing-feature-id","Collection geojson require a feature id as a unique identifier");d.unshift({name:j,alias:j,type:"esriFieldTypeOID",editable:!1,nullable:!1})}else I.type="esriFieldTypeOID",I.editable=!1,I.nullable=!1;if(j!==u.objectIdFieldName){const e=d.find((e=>e.name===u.objectIdFieldName));e&&(e.type="esriFieldTypeInteger")}d===u.fields&&u.unknownFields.length>0&&h.warn({name:"ogc-feature-layer:unknown-field-types",message:"Some fields types couldn't be inferred from the features and were dropped",details:{unknownFields:u.unknownFields}});for(const e of d){if(null==e.name&&(e.name=e.alias),null==e.alias&&(e.alias=e.name),"esriFieldTypeOID"!==e.type&&"esriFieldTypeGlobalID"!==e.type&&(e.editable=null==e.editable||!!e.editable,e.nullable=null==e.nullable||!!e.nullable),!e.name)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:invalid-field-name","field name is missing",{field:e});if(-1===_support_fieldType_js__WEBPACK_IMPORTED_MODULE_12__["kebabDict"].jsonValues.indexOf(e.type))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:invalid-field-type",`invalid type for field "${e.name}"`,{field:e})}if(F){const e=new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_11__["default"](d);if(F.startTimeField){const t=e.get(F.startTimeField);t?(F.startTimeField=t.name,t.type="esriFieldTypeDate"):F.startTimeField=null}if(F.endTimeField){const t=e.get(F.endTimeField);t?(F.endTimeField=t.name,t.type="esriFieldTypeDate"):F.endTimeField=null}if(F.trackIdField){const t=e.get(F.trackIdField);t?F.trackIdField=t.name:(F.trackIdField=null,h.warn({name:"ogc-feature-layer:invalid-timeInfo-trackIdField",message:"trackIdField is missing",details:{timeInfo:F}}))}F.startTimeField||F.endTimeField||(h.warn({name:"ogc-feature-layer:invalid-timeInfo",message:"startTimeField and endTimeField are missing",details:{timeInfo:F}}),F=null)}return{drawingInfo:b?Object(_graphics_sources_support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__["createDrawingInfo"])(b):null,geometryType:b,fields:d,hasZ:!!f,objectIdField:j,timeInfo:F}}async function F(i,r={}){const{links:a}=i,s=C(a,"data","application/json")||C(a,"http://www.opengis.net/def/rel/ogc/1.0/data","application/json");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(s))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:missing-collections-page","Missing collections url");const{apiKey:o,customParameters:l,signal:c}=r,{data:u}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(s.href,{signal:c,headers:{accept:"application/json"},query:{...l,token:o}});return u}async function I(i,r={}){const{links:a}=i,s=C(a,"conformance","application/json")||C(a,"http://www.opengis.net/def/rel/ogc/1.0/conformance","application/json");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(s))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:missing-conformance-page","Missing conformance url");const{apiKey:o,customParameters:l,signal:c}=r,{data:u}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(s.href,{signal:c,headers:{accept:"application/json"},query:{...l,token:o}});return u}async function T(t,i={}){const{apiKey:n,customParameters:r,signal:a}=i,{data:s}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t,{signal:a,headers:{accept:"application/json"},query:{...r,token:n}});return s}async function k(t,i={}){const r="application/vnd.oai.openapi+json;version=3.0",a=C(t.links,"service-desc",r);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(a))return h.warn("ogc-feature-layer:missing-openapi-page","The OGC API-Features server does not have an OpenAPI page."),null;const{apiKey:s,customParameters:o,signal:l}=i,{data:c}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(a.href,{signal:l,headers:{accept:r},query:{...o,token:s}});return c}function x(e){const t=/^http:\/\/www\.opengis.net\/def\/crs\/(?<authority>.*)\/(?<version>.*)\/(?<code>.*)$/i.exec(e),i=null==t?void 0:t.groups;if(!i)return null;const{authority:n,code:r}=i;switch(n.toLowerCase()){case"ogc":switch(r.toLowerCase()){case"crs27":return _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"].GCS_NAD_1927.wkid;case"crs83":return 4269;case"crs84":case"crs84h":return _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"].WGS84.wkid;default:return null}case"esri":case"epsg":{const e=Number.parseInt(r,10);return Number.isNaN(e)?null:e}default:return null}}async function S(e,t,i){const n=await v(e,t,i);return Object(_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__["convertToFeatureSet"])(n)}async function v(i,l,m){const{capabilities:{query:{maxRecordCount:p}},collection:g,layerDefinition:y,queryParameters:{apiKey:w,customParameters:h},spatialReference:j,supportedCrs:F}=i,{links:I}=g,T=C(I,"items","application/geo+json")||C(I,"http://www.opengis.net/def/rel/ogc/1.0/items","application/geo+json");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(T))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:missing-items-page","Missing items url");const{geometry:k,num:x,start:S,timeExtent:v,where:N}=l;if(l.objectIds)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("ogc-feature-layer:query-by-objectids-not-supported","Queries with objectids are not supported");const M=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON(j),P=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["unwrapOr"])(l.outSpatialReference,M),W=P.isWGS84?null:q(P,F),G=R(k,F),$=O(v),Z=D(N),K=null!=x?x:null!=S&&void 0!==S?10:p,{data:L}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(T.href,{...m,query:{...h,...G,crs:W,datetime:$,query:Z,limit:K,startindex:S,token:w},headers:{accept:"application/geo+json"}});let A=!1;if(L.links){const e=L.links.find((e=>"next"===e.rel));A=!!e}!A&&Number.isInteger(L.numberMatched)&&Number.isInteger(L.numberReturned)&&(A=L.numberReturned<L.numberMatched);const{fields:E,globalIdField:J,hasM:U,hasZ:_,objectIdField:z}=y,B=y.geometryType,Q=Object(_graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_9__["createOptimizedFeatures"])(L,{geometryType:B,hasZ:_,objectIdField:z});if(!W&&P.isWebMercator)for(const e of Q)if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.geometry)){const t=Object(_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__["convertToGeometry"])(e.geometry,B,_,!1);t.spatialReference=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"].WGS84,e.geometry=Object(_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__["convertFromGeometry"])(Object(_geometry_support_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_6__["project"])(t,P))}for(const e of Q)e.objectId=e.attributes[z];const V=W||!W&&P.isWebMercator?P.toJSON():_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_5__["WGS84"],H=new _graphics_OptimizedFeatureSet_js__WEBPACK_IMPORTED_MODULE_8__["default"];return H.exceededTransferLimit=A,H.features=Q,H.fields=E,H.geometryType=B,H.globalIdFieldName=J,H.hasM=U,H.hasZ=_,H.objectIdFieldName=z,H.spatialReference=V,H}function N(e){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e)&&"extent"===e.type}function q(e,t){var i;const{isWebMercator:n,wkid:r}=e;return r?n?null!=(a=null!=(s=null!=(o=null!=(l=t[3857])?l:t[102100])?o:t[102113])?s:t[900913])?a:null:null!=(i=t[e.wkid])?i:null:null;var a,s,o,l}function M(e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e))return"";const{xmin:t,ymin:i,xmax:r,ymax:a}=e;return`${t},${i},${r},${a}`}function O(e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e))return null;const{start:t,end:i}=e;return`${Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(t)?t.toISOString():".."}/${Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(i)?i.toISOString():".."}`}function D(e){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e)||!e||"1=1"===e?null:e}function R(e,t){if(!N(e))return null;const{spatialReference:i}=e;if(!i||i.isWGS84)return{bbox:M(e)};const n=q(i,t);return n?{bbox:M(e),"bbox-crs":n}:i.isWebMercator?{bbox:M(Object(_geometry_support_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_6__["project"])(e,_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"].WGS84))}:null}function C(e,t,i){return e.find((e=>e.rel===t&&e.type===i))||e.find((e=>e.rel===t&&!e.type))}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/CodedValue.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/CodedValue.js ***!
  \*****************************************************************/
/*! exports provided: CodedValue, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CodedValue", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.name=null,this.code=null}clone(){return new t({name:this.name,code:this.code})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[String,Number],json:{write:!0}})],p.prototype,"code",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.CodedValue")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/CodedValueDomain.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/CodedValueDomain.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _CodedValue_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./CodedValue.js */ "../node_modules/@arcgis/core/layers/support/CodedValue.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let d=p=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(e){super(e),this.codedValues=null,this.type="coded-value"}getName(e){let o=null;if(this.codedValues){const r=String(e);this.codedValues.some((e=>(String(e.code)===r&&(o=e.name),!!o)))}return o}clone(){return new p({codedValues:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.codedValues),name:this.name})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_CodedValue_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{write:!0}})],d.prototype,"codedValues",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({codedValue:"coded-value"})],d.prototype,"type",void 0),d=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.CodedValueDomain")],d);var i=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/Domain.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/Domain.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const c=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({inherited:"inherited",codedValue:"coded-value",range:"range"});let a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r),this.name=null,this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],a.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(c)],a.prototype,"type",void 0),a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.support.Domain")],a);var i=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/Field.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/Field.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _domains_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./domains.js */ "../node_modules/@arcgis/core/layers/support/domains.js");
/* harmony import */ var _fieldType_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./fieldType.js */ "../node_modules/@arcgis/core/layers/support/fieldType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;const c=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({binary:"binary",coordinate:"coordinate",countOrAmount:"count-or-amount",dateAndTime:"date-and-time",description:"description",locationOrPlaceName:"location-or-place-name",measurement:"measurement",nameOrTitle:"name-or-title",none:"none",orderedOrRanked:"ordered-or-ranked",percentageOrRatio:"percentage-or-ratio",typeOrCategory:"type-or-category",uniqueIdentifier:"unique-identifier"});let m=u=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(e){super(e),this.alias=null,this.defaultValue=void 0,this.description=null,this.domain=null,this.editable=!0,this.length=-1,this.name=null,this.nullable=!0,this.type=null,this.valueType=null}readDescription(e,{description:t}){let o;try{o=JSON.parse(t)}catch(r){}return o?o.value:null}readValueType(e,{description:t}){let o;try{o=JSON.parse(t)}catch(r){}return o?c.fromJSON(o.fieldValueType):null}clone(){return new u({alias:this.alias,defaultValue:this.defaultValue,description:this.description,domain:this.domain&&this.domain.clone()||null,editable:this.editable,length:this.length,name:this.name,nullable:this.nullable,type:this.type,valueType:this.valueType})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],m.prototype,"alias",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[String,Number],json:{write:{allowNull:!0}}})],m.prototype,"defaultValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],m.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("description")],m.prototype,"readDescription",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_domains_js__WEBPACK_IMPORTED_MODULE_10__["types"],json:{read:{reader:_domains_js__WEBPACK_IMPORTED_MODULE_10__["fromJSON"]},write:!0}})],m.prototype,"domain",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],m.prototype,"editable",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"],json:{write:!0}})],m.prototype,"length",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],m.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],m.prototype,"nullable",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(_fieldType_js__WEBPACK_IMPORTED_MODULE_11__["kebabDict"])],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],m.prototype,"valueType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("valueType",["description"])],m.prototype,"readValueType",null),m=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.layers.support.Field")],m);var y=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/InheritedDomain.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/InheritedDomain.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.type="inherited"}clone(){return new t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({inherited:"inherited"})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.InheritedDomain")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/RangeDomain.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/RangeDomain.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let n=s=class extends _Domain_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(e){super(e),this.maxValue=null,this.minValue=null,this.type="range"}clone(){return new s({maxValue:this.maxValue,minValue:this.minValue,name:this.name})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,json:{type:[Number],read:{source:"range",reader:(e,r)=>r.range&&r.range[1]},write:{enabled:!1,overridePolicy(){return{enabled:null!=this.maxValue&&null==this.minValue}},target:"range",writer(e,r,a){r[a]=[this.minValue||0,e]}}}})],n.prototype,"maxValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,json:{type:[Number],read:{source:"range",reader:(e,r)=>r.range&&r.range[0]},write:{target:"range",writer(e,r,a){r[a]=[e,this.maxValue||0]}}}})],n.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({range:"range"})],n.prototype,"type",void 0),n=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.RangeDomain")],n);var i=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/domains.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/domains.js ***!
  \**************************************************************/
/*! exports provided: CodedValueDomain, DomainBase, InheritedDomain, RangeDomain, fromJSON, types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return n; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CodedValueDomain.js */ "../node_modules/@arcgis/core/layers/support/CodedValueDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CodedValueDomain", function() { return _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _Domain_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Domain.js */ "../node_modules/@arcgis/core/layers/support/Domain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomainBase", function() { return _Domain_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./InheritedDomain.js */ "../node_modules/@arcgis/core/layers/support/InheritedDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InheritedDomain", function() { return _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./RangeDomain.js */ "../node_modules/@arcgis/core/layers/support/RangeDomain.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RangeDomain", function() { return _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n={key:"type",base:_Domain_js__WEBPACK_IMPORTED_MODULE_2__["default"],typeMap:{range:_RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"],"coded-value":_CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"],inherited:_InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"]}};function t(o){if(!o||!o.type)return null;switch(o.type){case"range":return _RangeDomain_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromJSON(o);case"codedValue":return _CodedValueDomain_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromJSON(o);case"inherited":return _InheritedDomain_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(o)}return null}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/fieldType.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/fieldType.js ***!
  \****************************************************************/
/*! exports provided: kebabDict */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "kebabDict", function() { return i; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"]({esriFieldTypeSmallInteger:"small-integer",esriFieldTypeInteger:"integer",esriFieldTypeSingle:"single",esriFieldTypeDouble:"double",esriFieldTypeLong:"long",esriFieldTypeString:"string",esriFieldTypeDate:"date",esriFieldTypeOID:"oid",esriFieldTypeGeometry:"geometry",esriFieldTypeBlob:"blob",esriFieldTypeRaster:"raster",esriFieldTypeGUID:"guid",esriFieldTypeGlobalID:"global-id",esriFieldTypeXML:"xml"});


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/defaultsJSON.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/defaultsJSON.js ***!
  \********************************************************************/
/*! exports provided: defaultColor, defaultOutlineColor, defaultPointSymbolJSON, defaultPolygonSymbolJSON, defaultPolylineSymbolJSON, defaultTextSymbolJSON, errorPointSymbolJSON, errorPolygonSymbolJSON, errorPolylineSymbolJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultColor", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultOutlineColor", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPointSymbolJSON", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolygonSymbolJSON", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolylineSymbolJSON", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTextSymbolJSON", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPointSymbolJSON", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolygonSymbolJSON", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolylineSymbolJSON", function() { return s; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=[252,146,31,255],i=[153,153,153,255],l={type:"esriSMS",style:"esriSMSCircle",size:6,color:e,outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[153,153,153,255]}},o={type:"esriSLS",style:"esriSLSSolid",width:.75,color:e},S={type:"esriSFS",style:"esriSFSSolid",color:[252,146,31,196],outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[255,255,255,191]}},t={type:"esriTS",color:[255,255,255,255],font:{family:"arial-unicode-ms",size:10,weight:"bold"},horizontalAlignment:"center",kerning:!0,haloColor:[0,0,0,255],haloSize:1,rotated:!1,text:"",xoffset:0,yoffset:0,angle:0},r={type:"esriSMS",style:"esriSMSCircle",color:[0,0,0,255],outline:null,size:10.5},s={type:"esriSLS",style:"esriSLSSolid",color:[0,0,0,255],width:1.5},y={type:"esriSFS",style:"esriSFSSolid",color:[0,0,0,255],outline:null};


/***/ })

};;
//# sourceMappingURL=45.render-page.js.map
exports.ids = [46];
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

/***/ "../node_modules/@arcgis/core/core/interatorUtils.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/core/interatorUtils.js ***!
  \***********************************************************/
/*! exports provided: find */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "find", function() { return n; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n,o){for(const f of n)if(null!=f&&o(f))return f}


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

/***/ "../node_modules/@arcgis/core/layers/ogc/dateUtils.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/ogc/dateUtils.js ***!
  \************************************************************/
/*! exports provided: parseDate, parseJSDate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseDate", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseJSDate", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){var s;return null!=(s=t(n))?s:e(n)}function e(n){const e=new Date(n).getTime();return Number.isNaN(e)?null:e}function t(n){var e,t,u,r;const o=s.exec(n);if(!o)return null;const l=o.groups,f=+l.year,i=+l.month-1,d=+l.day,a=+(null!=(e=l.hours)?e:"0"),c=+(null!=(t=l.minutes)?t:"0"),m=+(null!=(u=l.seconds)?u:"0");if(a>23)return null;if(c>59)return null;if(m>59)return null;const g=null!=(r=l.ms)?r:"0",T=g?+g.padEnd(3,"0").substring(0,3):0;let N;if(l.isUTC)N=Date.UTC(f,i,d,a,c,m,T);else if(l.offsetSign){const n=+l.offsetHours,e=+l.offsetMinutes;N=6e4*("+"===l.offsetSign?-1:1)*(60*n+e)+Date.UTC(f,i,d,a,c,m,T)}else N=new Date(f,i,d,a,c,m,T).getTime();return Number.isNaN(N)?null:N}const s=/^(?:(?<year>-?\d{4,})-(?<month>\d{2})-(?<day>\d{2}))(?:T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})(?:\.(?<ms>\d+))?)?(?:(?<isUTC>Z)|(?:(?<offsetSign>\+|-)(?<offsetHours>\d{2}):(?<offsetMinutes>\d{2})))?$/;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/ogc/wfsUtils.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/ogc/wfsUtils.js ***!
  \***********************************************************/
/*! exports provided: WFS_OID_FIELD_NAME, describeFeatureType, findFeatureType, getCapabilities, getFeature, getFeatureCount, getFeatureTypeInfo, getWFSLayerInfo, parseDescribeFeatureTypeResponse, parseGetCapabilitiesResponse, prepareWFSLayerFields */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WFS_OID_FIELD_NAME", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "describeFeatureType", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findFeatureType", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCapabilities", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFeature", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFeatureCount", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFeatureTypeInfo", function() { return X; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWFSLayerInfo", function() { return W; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseDescribeFeatureTypeResponse", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseGetCapabilitiesResponse", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prepareWFSLayerFields", function() { return q; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_interatorUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/interatorUtils.js */ "../node_modules/@arcgis/core/core/interatorUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_projection_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../geometry/projection.js */ "../node_modules/@arcgis/core/geometry/projection.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _geometry_support_typeUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../geometry/support/typeUtils.js */ "../node_modules/@arcgis/core/geometry/support/typeUtils.js");
/* harmony import */ var _graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../graphics/sources/geojson/geojson.js */ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js");
/* harmony import */ var _dateUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./dateUtils.js */ "../node_modules/@arcgis/core/layers/ogc/dateUtils.js");
/* harmony import */ var _xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./xmlUtils.js */ "../node_modules/@arcgis/core/layers/ogc/xmlUtils.js");
/* harmony import */ var _support_Field_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../support/Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const F="xlink:href",S="2.0.0",x="__esri_wfs_id__",v="wfs-layer:getWFSLayerTypeInfo-error",C="wfs-layer:empty-service",E="wfs-layer:feature-type-not-found",N="wfs-layer:geojson-not-supported",P="wfs-layer:kvp-encoding-not-supported",R="wfs-layer:malformed-json",j="wfs-layer:unknown-geometry-type",A="wfs-layer:unknown-field-type",G="wfs-layer:unsupported-spatial-reference",k="wfs-layer:unsupported-wfs-version";async function U(t,r){const n=D((await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t,{responseType:"text",query:{SERVICE:"WFS",REQUEST:"GetCapabilities",VERSION:S,...null==r?void 0:r.customParameters},signal:null==r?void 0:r.signal})).data);return L(t,n),n}function D(e){const t=ee(e);re(t),ne(t);const r=t.firstElementChild,n=new Map;return{operations:O(r),get featureTypes(){return Array.from(M(r,n))},readFeatureTypes:()=>M(r,n)}}const I=new Set(["json","application/json","geojson","application/json; subtype=geojson"]);function O(e){let r=!1;const a={GetCapabilities:{url:""},DescribeFeatureType:{url:""},GetFeature:{url:"",outputFormat:null,supportsPagination:!1}};if(Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["visitXML"])(e,{OperationsMetadata:{Operation:e=>{switch(e.getAttribute("name")){case"GetCapabilities":return{DCP:{HTTP:{Get:e=>{a.GetCapabilities.url=e.getAttribute(F)}}}};case"DescribeFeatureType":return{DCP:{HTTP:{Get:e=>{a.DescribeFeatureType.url=e.getAttribute(F)}}}};case"GetFeature":return{DCP:{HTTP:{Get:e=>{a.GetFeature.url=e.getAttribute(F)}}},Parameter:e=>{if("outputFormat"===e.getAttribute("name"))return{AllowedValues:{Value:e=>{const t=e.textContent;I.has(t.toLowerCase())&&(a.GetFeature.outputFormat=t)}}}}}}},Constraint:e=>{switch(e.getAttribute("name")){case"KVPEncoding":return{DefaultValue:e=>{r="true"===e.textContent.toLowerCase()}};case"ImplementsResultPaging":return{DefaultValue:e=>{a.GetFeature.supportsPagination="true"===e.textContent.toLowerCase()}}}}}}),!r)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](P,"WFS service doesn't support key/value pair (KVP) encoding");if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(a.GetFeature.outputFormat))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](N,"WFS service doesn't support GeoJSON output format");return a}function L(e,t){Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["isHTTPSProtocol"])(e)&&(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["hasSameOrigin"])(e,t.operations.DescribeFeatureType.url,!0)&&(t.operations.DescribeFeatureType.url=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["toHTTPS"])(t.operations.DescribeFeatureType.url)),Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["hasSameOrigin"])(e,t.operations.GetFeature.url,!0)&&(t.operations.GetFeature.url=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_6__["toHTTPS"])(t.operations.GetFeature.url)))}function M(e,t){return Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["iterateXML"])(e,{FeatureTypeList:{FeatureType:e=>{if(t.has(e))return t.get(e);const r={typeName:"undefined:undefined",name:"",title:"",description:"",extent:null,namespacePrefix:"",namespaceUri:"",supportedSpatialReferences:[]},n=new Set([4326]),a=e=>{var t,r;const a=parseInt(null==(t=e.textContent.match(/(?<wkid>\d+$)/i))||null==(r=t.groups)?void 0:r.wkid,10);Number.isNaN(a)||n.add(a)};return Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["visitXML"])(e,{Name:e=>{const{name:t,prefix:n}=te(e.textContent);r.typeName=`${n}:${t}`,r.name=t,r.namespacePrefix=n,r.namespaceUri=e.lookupNamespaceURI(n)},Abstract:e=>{r.description=e.textContent},Title:e=>{r.title=e.textContent},WGS84BoundingBox:e=>{r.extent=$(e)},DefaultSRS:a,DefaultCRS:a,OtherSRS:a,OtherCRS:a}),r.title||(r.title=r.name),r.supportedSpatialReferences.push(...n),t.set(e,r),r}}})}function $(e){let t,r,n,a;for(const o of e.children)switch(o.localName){case"LowerCorner":[t,r]=o.textContent.split(" ").map((e=>Number.parseFloat(e)));break;case"UpperCorner":[n,a]=o.textContent.split(" ").map((e=>Number.parseFloat(e)))}return{xmin:t,ymin:r,xmax:n,ymax:a,spatialReference:_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["WGS84"]}}function V(e,t,n){return Object(_core_interatorUtils_js__WEBPACK_IMPORTED_MODULE_3__["find"])(e,(e=>n?e.name===t&&e.namespaceUri===n:e.typeName===t||e.name===t))}async function W(e,t,r,n={}){var a;const{featureType:o,extent:s}=await X(e,t,r,n),{fields:i,geometryType:u,swapXY:l,objectIdField:p,geometryField:c}=await Y(e,o.typeName,n);return{url:e.operations.GetCapabilities.url,name:o.name,namespaceUri:o.namespaceUri,fields:i,geometryField:c,geometryType:u,objectIdField:p,spatialReference:null!=(a=n.spatialReference)?a:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_14__["default"].WGS84,extent:s,swapXY:l,wfsCapabilities:e,customParameters:n.customParameters}}async function X(e,r,a,o={}){const{spatialReference:s=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_14__["default"].WGS84}=o,i=e.readFeatureTypes(),u=r?V(i,r,a):i.next().value;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(u))throw r?new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](E,`The type '${r}' could not be found in the service`):new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](C,"The service is empty");let y=new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_15__["default"]({...u.extent,spatialReference:s});if(!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["equals"])(s,_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["WGS84"]))try{await Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_7__["initializeProjection"])(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["WGS84"],s,void 0,o),y=Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_7__["project"])(y,_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["WGS84"])}catch{throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](G,"Projection not supported")}return{extent:y,spatialReference:s,featureType:u}}async function Y(e,r,a={}){const[s,i]=await Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["eachAlways"])([_(e.operations.DescribeFeatureType.url,r,a),z(e,r,a)]);if(s.error||i.error)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](v,`An error occurred while getting info about the feature type '${r}'`,{error:s.error||i.error});const{fields:u,errors:l}=s.value,p=s.value.geometryType||i.value.geometryType,c=i.value.swapXY;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(p))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](j,`The geometry type could not be determined for type '${r}`,{typeName:r,geometryType:p,fields:u,errors:l});return{...q(u),geometryType:p,swapXY:c}}function q(e){var t;const r=e.find((e=>"geometry"===e.type));let n=e.find((e=>"oid"===e.type));return e=e.filter((e=>"geometry"!==e.type)),n||(n=new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:x,type:"oid",alias:x}),e.unshift(n)),{geometryField:null!=(t=null==r?void 0:r.name)?t:null,objectIdField:n.name,fields:e}}async function z(t,r,n={}){var a;let o,s=!1;const[i,u]=await Promise.all([B(t.operations.GetFeature.url,r,t.operations.GetFeature.outputFormat,{...n,count:1}),Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t.operations.GetFeature.url,{responseType:"text",query:K(r,void 0,{...n,count:1}),signal:null==n?void 0:n.signal})]),l="FeatureCollection"===i.type&&(null==(a=i.features[0])?void 0:a.geometry);if(l){let e;switch(o=_geometry_support_typeUtils_js__WEBPACK_IMPORTED_MODULE_9__["featureGeometryTypeKebabDictionary"].fromJSON(Object(_graphics_sources_geojson_geojson_js__WEBPACK_IMPORTED_MODULE_10__["getGeometryType"])(l.type)),l.type){case"Point":e=l.coordinates;break;case"LineString":case"MultiPoint":e=l.coordinates[0];break;case"MultiLineString":case"Polygon":e=l.coordinates[0][0];break;case"MultiPolygon":e=l.coordinates[0][0][0]}const t=/<[^>]*pos[^>]*> *(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/.exec(u.data);if(t){const r=e[0].toFixed(3),n=e[1].toFixed(3),a=parseFloat(t[1]).toFixed(3);r===parseFloat(t[2]).toFixed(3)&&n===a&&(s=!0)}}return{geometryType:o,swapXY:s}}async function _(t,r,n){return J(r,(await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t,{responseType:"text",query:{SERVICE:"WFS",REQUEST:"DescribeFeatureType",VERSION:S,TYPENAME:r,...null==n?void 0:n.customParameters},signal:null==n?void 0:n.signal})).data)}function J(e,n){const{name:o}=te(e),s=ee(n);ne(s);const i=Object(_core_interatorUtils_js__WEBPACK_IMPORTED_MODULE_3__["find"])(Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["iterateXML"])(s.firstElementChild,{element:e=>({name:e.getAttribute("name"),typeName:te(e.getAttribute("type")).name})}),(({name:e})=>e===o));if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(i)){const e=Object(_core_interatorUtils_js__WEBPACK_IMPORTED_MODULE_3__["find"])(Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["iterateXML"])(s.firstElementChild,{complexType:e=>e}),(e=>e.getAttribute("name")===i.typeName));if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e))return H(e)}throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](E,`Type '${e}' not found in document`,{document:(new XMLSerializer).serializeToString(s)})}const Q=new Set(["objectid","fid"]);function H(e){var r,n;const a=[],o=[];let s;const i=Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["iterateXML"])(e,{complexContent:{extension:{sequence:{element:e=>e}}}});for(const u of i){const i=u.getAttribute("name");if(!i)continue;let l,p;if(u.hasAttribute("type")?l=te(u.getAttribute("type")).name:Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["visitXML"])(u,{simpleType:{restriction:e=>(l=te(e.getAttribute("base")).name,{maxLength:e=>{p=+e.getAttribute("value")}})}}),!l)continue;const c="true"===u.getAttribute("nillable");let m=!1;switch(l.toLowerCase()){case"integer":case"nonpositiveinteger":case"negativeinteger":case"long":case"int":case"short":case"byte":case"nonnegativeinteger":case"unsignedlong":case"unsignedint":case"unsignedshort":case"unsignedbyte":case"positiveinteger":o.push(new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:i,alias:i,type:"integer",nullable:c}));break;case"float":case"double":case"decimal":o.push(new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:i,alias:i,type:"double",nullable:c}));break;case"boolean":case"string":case"gyearmonth":case"gyear":case"gmonthday":case"gday":case"gmonth":case"anyuri":case"qname":case"notation":case"normalizedstring":case"token":case"language":case"idrefs":case"entities":case"nmtoken":case"nmtokens":case"name":case"ncname":case"id":case"idref":case"entity":case"duration":case"time":o.push(new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:i,alias:i,type:"string",nullable:c,length:null!=(r=p)?r:255}));break;case"datetime":case"date":o.push(new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:i,alias:i,type:"date",nullable:c,length:null!=(n=p)?n:36}));break;case"pointpropertytype":s="point",m=!0;break;case"multipointpropertytype":s="multipoint",m=!0;break;case"curvepropertytype":case"multicurvepropertytype":case"multilinestringpropertytype":s="polyline",m=!0;break;case"surfacepropertytype":case"multisurfacepropertytype":case"multipolygonpropertytype":s="polygon",m=!0;break;case"geometrypropertytype":case"multigeometrypropertytype":m=!0,a.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](j,`geometry type '${l}' is not supported`,{type:(new XMLSerializer).serializeToString(e)}));break;default:a.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](A,`Unknown field type '${l}'`,{type:(new XMLSerializer).serializeToString(e)}))}m&&o.push(new _support_Field_js__WEBPACK_IMPORTED_MODULE_13__["default"]({name:i,alias:i,type:"geometry",nullable:c}))}for(const t of o)if("integer"===t.type&&!t.nullable&&Q.has(t.name.toLowerCase())){t.type="oid";break}return{geometryType:s,fields:o,errors:a}}async function B(r,n,a,o){let{data:s}=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r,{responseType:"text",query:K(n,a,o),signal:null==o?void 0:o.signal});s=s.replace(/": +(-?\d+),(\d+)(,)?/g,'": $1.$2$3');try{var i;if(null!=o&&null!=(i=o.dateFields)&&i.length){const e=new Set(o.dateFields);return JSON.parse(s,((t,r)=>e.has(t)?Object(_dateUtils_js__WEBPACK_IMPORTED_MODULE_11__["parseDate"])(r):r))}return JSON.parse(s)}catch(u){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](R,"Error while parsing the response",{response:s,error:u})}}function K(e,t,r){return{SERVICE:"WFS",REQUEST:"GetFeature",VERSION:S,TYPENAMES:e,OUTPUTFORMAT:t,SRSNAME:"EPSG:4326",STARTINDEX:null==r?void 0:r.startIndex,COUNT:null==r?void 0:r.count,...null==r?void 0:r.customParameters}}async function Z(t,r,n){const a=ee((await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t,{responseType:"text",query:{SERVICE:"WFS",REQUEST:"GetFeature",VERSION:S,TYPENAMES:r,RESULTTYPE:"hits",...null==n?void 0:n.customParameters},signal:null==n?void 0:n.signal})).data);ne(a);const o=Number.parseFloat(a.firstElementChild.getAttribute("numberMatched"));return Number.isNaN(o)?0:o}function ee(e){return(new DOMParser).parseFromString(e.trim(),"text/xml")}function te(e){const[t,r]=e.split(":");return{prefix:r?t:"",name:null!=r?r:t}}function re(e){const r=e.firstElementChild.getAttribute("version");if(r&&r!==S)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](k,`Unsupported WFS version ${r}. Supported version: ${S}`)}function ne(e){let r,n;if(Object(_xmlUtils_js__WEBPACK_IMPORTED_MODULE_12__["visitXML"])(e.firstElementChild,{Exception:e=>(r=e.getAttribute("exceptionCode"),{ExceptionText:e=>{n=e.textContent}})}),r)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"](`wfs-layer:${r}`,n)}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/ogc/xmlUtils.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/ogc/xmlUtils.js ***!
  \***********************************************************/
/*! exports provided: iterateXML, visitXML */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iterateXML", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "visitXML", function() { return o; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(n,c){for(const e of n.children)if(e.localName in c){const n=c[e.localName];if("function"==typeof n){const c=n(e);c&&o(e,c)}else o(e,n)}}function*n(o,c){for(const e of o.children)if(e.localName in c){const o=c[e.localName];"function"==typeof o?yield o(e):yield*n(e,o)}}


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


/***/ })

};;
//# sourceMappingURL=46.render-page.js.map
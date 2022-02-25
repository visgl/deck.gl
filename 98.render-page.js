exports.ids = [98];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/GeoJSONSourceWorker.js":
/*!*******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/geojson/GeoJSONSourceWorker.js ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return O; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../data/FeatureStore.js */ "../node_modules/@arcgis/core/layers/graphics/data/FeatureStore.js");
/* harmony import */ var _data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../data/projectionSupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/projectionSupport.js");
/* harmony import */ var _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../data/QueryEngine.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngine.js");
/* harmony import */ var _geojson_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./geojson.js */ "../node_modules/@arcgis/core/layers/graphics/sources/geojson/geojson.js");
/* harmony import */ var _support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../support/clientSideDefaults.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js");
/* harmony import */ var _support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../support/sourceUtils.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _support_fieldType_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../support/fieldType.js */ "../node_modules/@arcgis/core/layers/support/fieldType.js");
/* harmony import */ var _support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const D={hasAttachments:!1,capabilities:"query, editing, create, delete, update",useStandardizedQueries:!0,supportsCoordinatesQuantization:!0,supportsReturningQueryGeometry:!0,advancedQueryCapabilities:{supportsQueryAttachments:!1,supportsStatistics:!0,supportsPercentileStatistics:!0,supportsReturningGeometryCentroid:!0,supportsQueryWithDistance:!0,supportsDistinct:!0,supportsReturningQueryExtent:!0,supportsReturningGeometryProperties:!1,supportsHavingClause:!0,supportsOrderBy:!0,supportsPagination:!0,supportsQueryWithResultType:!1,supportsSqlExpression:!0,supportsDisjointSpatialRel:!0}};class O{constructor(){this._queryEngine=null}destroy(){this._queryEngine&&this._queryEngine&&this._queryEngine.destroy(),this._queryEngine=this._requiredFields=this._fieldsIndex=this._createDefaultAttributes=null}async load(s){const l=[];await this._checkProjection(s.spatialReference);let u=null;if(s.url){u=(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(s.url,{responseType:"json"})).data,await Object(_geojson_js__WEBPACK_IMPORTED_MODULE_9__["validateGeoJSON"])(u)}const d=Object(_geojson_js__WEBPACK_IMPORTED_MODULE_9__["inferLayerProperties"])(u,{geometryType:s.geometryType}),f=s.fields||d.fields||[],j=null!=s.hasZ?s.hasZ:d.hasZ,_=d.geometryType,E=s.objectIdField||("number"===d.objectIdFieldType?d.objectIdFieldName:"OBJECTID")||"OBJECTID",T=s.spatialReference||_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"];let q=s.timeInfo;if("string"===d.objectIdFieldType&&l.push({name:"geojson-layer:unsupported-id-type",message:"Feature ids are of type string and can't be honored."}),f===d.fields&&d.unknownFields.length>0&&l.push({name:"geojson-layer:unknown-field-types",message:"Some fields types couldn't be inferred from the features and were dropped",details:{unknownFields:d.unknownFields}}),E){let e=null;f.some((t=>t.name===E&&(e=t,!0)))?(e.type="esriFieldTypeOID",e.editable=!1,e.nullable=!1):f.unshift({alias:E,name:E,type:"esriFieldTypeOID",editable:!1,nullable:!1})}for(const e of f){if(null==e.name&&(e.name=e.alias),null==e.alias&&(e.alias=e.name),!e.name)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("geojson-layer:invalid-field-name","field name is missing",{field:e});if(e.name===E&&(e.type="esriFieldTypeOID"),-1===_support_fieldType_js__WEBPACK_IMPORTED_MODULE_13__["kebabDict"].jsonValues.indexOf(e.type))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("geojson-layer:invalid-field-type",`invalid type for field "${e.name}"`,{field:e})}const O={};this._requiredFields=[];for(const e of f)if("esriFieldTypeOID"!==e.type&&"esriFieldTypeGlobalID"!==e.type){e.editable=null==e.editable||!!e.editable,e.nullable=null==e.nullable||!!e.nullable;const t=Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__["getFieldDefaultValue"])(e);e.nullable||void 0!==t?O[e.name]=t:this._requiredFields.push(e)}if(this._fieldsIndex=new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_12__["default"](f),q){if(q.startTimeField){const e=this._fieldsIndex.get(q.startTimeField);e?(q.startTimeField=e.name,e.type="esriFieldTypeDate"):q.startTimeField=null}if(q.endTimeField){const e=this._fieldsIndex.get(q.endTimeField);e?(q.endTimeField=e.name,e.type="esriFieldTypeDate"):q.endTimeField=null}if(q.trackIdField){const e=this._fieldsIndex.get(q.trackIdField);e?q.trackIdField=e.name:(q.trackIdField=null,l.push({name:"geojson-layer:invalid-timeInfo-trackIdField",message:"trackIdField is missing",details:{timeInfo:q}}))}q.startTimeField||q.endTimeField||(l.push({name:"geojson-layer:invalid-timeInfo",message:"startTimeField and endTimeField are missing",details:{timeInfo:q}}),q=null)}const S=_?Object(_support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__["createDrawingInfo"])(_):null,Q={warnings:l,featureErrors:[],layerDefinition:{...D,drawingInfo:S,templates:Object(_support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__["createDefaultTemplate"])(O),extent:null,geometryType:_,objectIdField:E,fields:f,hasZ:!!j,timeInfo:q}};this._queryEngine=new _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__["default"]({fields:f,geometryType:_,hasM:!1,hasZ:j,objectIdField:E,spatialReference:T,timeInfo:q,featureStore:new _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__["default"]({geometryType:_,hasM:!1,hasZ:j}),cacheSpatialQueries:!0}),this._createDefaultAttributes=Object(_support_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_10__["createDefaultAttributesFunction"])(O,E),this._nextObjectId=d.maxObjectId+1;const k=Object(_geojson_js__WEBPACK_IMPORTED_MODULE_9__["createOptimizedFeatures"])(u,{geometryType:_,hasZ:j,objectIdField:"number"===d.objectIdFieldType?E:null});if(!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["equals"])(T,_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"]))for(const e of k)Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.geometry)&&(e.geometry=Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertFromGeometry"])(Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertToGeometry"])(e.geometry,_,j,!1),_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"],T)));return this._loadInitialFeatures(Q,k),Q}async applyEdits(e){const{spatialReference:t,geometryType:i}=this._queryEngine;return await Promise.all([Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["loadGeometryEngineForSimplify"])(t,i),Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(e.adds,t),Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(e.updates,t)]),this._applyEdits(e)}queryFeatures(e={},t={}){return this._queryEngine.executeQuery(e,t.signal)}queryFeatureCount(e={},t={}){return this._queryEngine.executeQueryForCount(e,t.signal)}queryObjectIds(e={},t={}){return this._queryEngine.executeQueryForIds(e,t.signal)}queryExtent(e={},t={}){return this._queryEngine.executeQueryForExtent(e,t.signal)}querySnapping(e,t={}){return this._queryEngine.executeQueryForSnapping(e,t.signal)}_loadInitialFeatures(e,t){const{featureStore:i,objectIdField:s}=this._queryEngine,n=[];for(const r of t){const t=this._createDefaultAttributes(),i=Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["mixAttributes"])(this._fieldsIndex,t,r.attributes,this._requiredFields,!0,e.warnings);i?e.featureErrors.push(i):(this._assignObjectId(t,r.attributes,!0),r.attributes=t,r.objectId=t[s],n.push(r))}if(i.addMany(n),e.layerDefinition.extent=this._queryEngine.fullExtent,e.layerDefinition.timeInfo){const{start:t,end:i}=this._queryEngine.timeExtent;e.layerDefinition.timeInfo.timeExtent=[t,i]}return e}_applyEdits(e){const{adds:t,updates:i,deletes:s}=e,n={addResults:[],deleteResults:[],updateResults:[],uidToObjectId:{}};if(t&&t.length&&this._applyAddEdits(n,t),i&&i.length&&this._applyUpdateEdits(n,i),s&&s.length){for(const e of s)n.deleteResults.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditSuccessResult"])(e));this._queryEngine.featureStore.removeManyById(s)}return{fullExtent:this._queryEngine.fullExtent,timeExtent:this._queryEngine.timeExtent,featureEditResults:n}}_applyAddEdits(e,t){const{addResults:n}=e,{geometryType:r,hasM:a,hasZ:o,objectIdField:u,spatialReference:d,featureStore:p}=this._queryEngine,f=[];for(const l of t){if(l.geometry&&r!==Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["getJsonType"])(l.geometry)){n.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditErrorResult"])("Incorrect geometry type."));continue}const t=this._createDefaultAttributes(),a=Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["mixAttributes"])(this._fieldsIndex,t,l.attributes,this._requiredFields);if(a)n.push(a);else{if(this._assignObjectId(t,l.attributes),l.attributes=t,null!=l.uid){const t=l.attributes[u];e.uidToObjectId[l.uid]=t}Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(l.geometry)&&(l.geometry=Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["simplify"])(l.geometry,d),l.geometry.spatialReference,d)),f.push(l),n.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditSuccessResult"])(l.attributes[u]))}}p.addMany(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertFromFeatures"])([],f,r,o,a,u))}_applyUpdateEdits({updateResults:e},t){const{geometryType:n,hasM:r,hasZ:a,objectIdField:o,spatialReference:l,featureStore:p}=this._queryEngine;for(const f of t){const{attributes:t,geometry:m}=f,c=t&&t[o];if(null==c){e.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditErrorResult"])(`Identifier field ${o} missing`));continue}if(!p.has(c)){e.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditErrorResult"])(`Feature with object id ${c} missing`));continue}const h=Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertToFeature"])(p.getFeature(c),n,a,r);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(m)){if(n!==Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_3__["getJsonType"])(m)){e.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditErrorResult"])("Incorrect geometry type."));continue}h.geometry=Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["simplify"])(m,l),m.spatialReference,l)}if(t){const i=Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["mixAttributes"])(this._fieldsIndex,h.attributes,t,this._requiredFields);if(i){e.push(i);continue}}p.add(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertFromFeature"])(h,n,a,r,o)),e.push(Object(_support_sourceUtils_js__WEBPACK_IMPORTED_MODULE_11__["createFeatureEditSuccessResult"])(c))}}_assignObjectId(e,t,i=!1){const s=this._queryEngine.objectIdField;i&&isFinite(t[s])?e[s]=t[s]:e[s]=this._nextObjectId++}async _checkProjection(e){try{await Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_4__["WGS84"],e)}catch{throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("geojson-layer","Projection not supported")}}}


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

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js ***!
  \***********************************************************************************/
/*! exports provided: createFeatureEditErrorResult, createFeatureEditSuccessResult, loadGeometryEngine, loadGeometryEngineForSimplify, mixAttributes, simplify */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFeatureEditErrorResult", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFeatureEditSuccessResult", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadGeometryEngine", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadGeometryEngineForSimplify", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mixAttributes", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "simplify", function() { return h; });
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class o{constructor(){this.code=null,this.description=null}}class l{constructor(t){this.error=new o,this.globalId=null,this.objectId=null,this.success=!1,this.uniqueId=null,this.error.description=t}}function u(t){return new l(t)}class a{constructor(t){this.globalId=null,this.success=!0,this.objectId=this.uniqueId=t}}function c(t){return new a(t)}const f=new Set;function d(t,e,r,s,o=!1,l){f.clear();for(const a in r){const s=t.get(a);if(!s)continue;const c=r[a],d=m(s,c);if(d!==c&&l&&l.push({name:"invalid-value-type",message:"attribute value was converted to match the field type",details:{field:s,originalValue:c,sanitizedValue:d}}),f.add(s.name),s&&(o||s.editable)){const t=Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["validateFieldValue"])(s,d);if(t)return u(Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["validationErrorToString"])(t,s,d));e[s.name]=d}}if(s)for(const n of s)if(!f.has(n.name))return u(`missing required field "${n.name}"`);return null}function m(t,n){let i=n;return"string"==typeof n&&Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["isNumericField"])(t)?i=parseFloat(n):null!=n&&Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["isStringField"])(t)&&"string"!=typeof n&&(i=String(n)),Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["sanitizeNullFieldValue"])(i)}let p;function h(e,n){if(!e||!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__["isValid"])(n))return e;if("rings"in e||"paths"in e){if(!p)throw new TypeError("geometry engine not loaded");return p.simplify(n,e)}return e}async function g(){return p||(p=await Promise.all(/*! import() */[__webpack_require__.e(21), __webpack_require__.e(38)]).then(__webpack_require__.bind(null, /*! ../../../../geometry/geometryEngineJSON.js */ "../node_modules/@arcgis/core/geometry/geometryEngineJSON.js")),p)}async function y(e,n){!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_0__["isValid"])(e)||"esriGeometryPolygon"!==n&&"esriGeometryPolyline"!==n||await g()}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FieldsIndex.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){return"date"===t.type||"esriFieldTypeDate"===t.type}class e{constructor(e){if(this.fields=e,this._fieldsMap=new Map,this._dateFieldsSet=new Set,this.dateFields=[],!e)return;const i=[];for(const a of e){const e=a&&a.name;if(e){const d=s(e);this._fieldsMap.set(e,a),this._fieldsMap.set(d,a),i.push(d),t(a)&&(this.dateFields.push(a),this._dateFieldsSet.add(a))}}i.sort(),this.uid=i.join(",")}destroy(){this._fieldsMap.clear()}has(t){return null!=this.get(t)}get(t){return null!=t?this._fieldsMap.get(t)||this._fieldsMap.get(s(t)):void 0}isDateField(t){return this._dateFieldsSet.has(this.get(t))}normalizeFieldName(t){const e=this.get(t);if(e)return e.name}}function s(t){return t.toLowerCase().trim()}


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
//# sourceMappingURL=98.render-page.js.map
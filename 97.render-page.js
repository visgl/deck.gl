exports.ids = [97];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js ***!
  \*********************************************************************/
/*! exports provided: findLastObjectIdFromFeatures, initialObjectId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findLastObjectIdFromFeatures", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initialObjectId", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=1;function n(t,n){let o=0;for(const r of n){var e;const n=null==(e=r.attributes)?void 0:e[t];"number"==typeof n&&isFinite(n)&&(o=Math.max(o,n))}return o}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/MemorySourceWorker.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/MemorySourceWorker.js ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return S; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _objectIdUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../objectIdUtils.js */ "../node_modules/@arcgis/core/layers/graphics/objectIdUtils.js");
/* harmony import */ var _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../data/FeatureStore.js */ "../node_modules/@arcgis/core/layers/graphics/data/FeatureStore.js");
/* harmony import */ var _data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../data/projectionSupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/projectionSupport.js");
/* harmony import */ var _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../data/QueryEngine.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngine.js");
/* harmony import */ var _clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./clientSideDefaults.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js");
/* harmony import */ var _sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./sourceUtils.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/sourceUtils.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _support_fieldType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../support/fieldType.js */ "../node_modules/@arcgis/core/layers/support/fieldType.js");
/* harmony import */ var _support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const q=_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_3__["WGS84"],R={xmin:-180,ymin:-90,xmax:180,ymax:90,spatialReference:_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_3__["WGS84"]},D={hasAttachments:!1,capabilities:"query, editing, create, delete, update",useStandardizedQueries:!0,supportsCoordinatesQuantization:!0,supportsReturningQueryGeometry:!0,advancedQueryCapabilities:{supportsQueryAttachments:!1,supportsStatistics:!0,supportsPercentileStatistics:!0,supportsReturningGeometryCentroid:!0,supportsQueryWithDistance:!0,supportsDistinct:!0,supportsReturningQueryExtent:!0,supportsReturningGeometryProperties:!1,supportsHavingClause:!0,supportsOrderBy:!0,supportsPagination:!0,supportsQueryWithResultType:!1,supportsSqlExpression:!0,supportsDisjointSpatialRel:!0}};function O(e){return Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["isPoint"])(e)?null!=e.z:!!e.hasZ}function w(e){return Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["isPoint"])(e)?null!=e.m:!!e.hasM}class S{constructor(){this._queryEngine=null,this._nextObjectId=null}destroy(){this._queryEngine&&this._queryEngine&&this._queryEngine.destroy(),this._queryEngine=this._requiredFields=this._fieldsIndex=this._createDefaultAttributes=null}async load(t){const i=[],{features:s}=t,r=this._inferLayerProperties(s,t.fields),n=t.fields||[],a=null!=t.hasM?t.hasM:r.hasM,l=null!=t.hasZ?t.hasZ:r.hasZ,o=!t.spatialReference&&!r.spatialReference,y=o?q:t.spatialReference||r.spatialReference,I=o?R:null,b=t.geometryType||r.geometryType,F=!b;let _=t.objectIdField||r.objectIdField,j=t.timeInfo;if(!F&&(o&&i.push({name:"feature-layer:spatial-reference-not-found",message:"Spatial reference not provided or found in features. Defaults to WGS84"}),!b))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("feature-layer:missing-property","geometryType not set and couldn't be inferred from the provided features");if(!_)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("feature-layer:missing-property","objectIdField not set and couldn't be found in the provided fields");if(r.objectIdField&&_!==r.objectIdField&&(i.push({name:"feature-layer:duplicated-oid-field",message:`Provided objectIdField "${_}" doesn't match the field name "${r.objectIdField}", found in the provided fields`}),_=r.objectIdField),_&&!r.objectIdField){let e=null;n.some((t=>t.name===_&&(e=t,!0)))?(e.type="esriFieldTypeOID",e.editable=!1,e.nullable=!1):n.unshift({alias:_,name:_,type:"esriFieldTypeOID",editable:!1,nullable:!1})}for(const d of n){if(null==d.name&&(d.name=d.alias),null==d.alias&&(d.alias=d.name),!d.name)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("feature-layer:invalid-field-name","field name is missing",{field:d});if(d.name===_&&(d.type="esriFieldTypeOID"),-1===_support_fieldType_js__WEBPACK_IMPORTED_MODULE_12__["kebabDict"].jsonValues.indexOf(d.type))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("feature-layer:invalid-field-type",`invalid type for field "${d.name}"`,{field:d})}const O={};this._requiredFields=[];for(const e of n)if("esriFieldTypeOID"!==e.type&&"esriFieldTypeGlobalID"!==e.type){e.editable=null==e.editable||!!e.editable,e.nullable=null==e.nullable||!!e.nullable;const t=Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_13__["getFieldDefaultValue"])(e);e.nullable||void 0!==t?O[e.name]=t:this._requiredFields.push(e)}if(this._fieldsIndex=new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_11__["default"](n),this._createDefaultAttributes=Object(_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_9__["createDefaultAttributesFunction"])(O,_),j){if(j.startTimeField){const e=this._fieldsIndex.get(j.startTimeField);e?(j.startTimeField=e.name,e.type="esriFieldTypeDate"):j.startTimeField=null}if(j.endTimeField){const e=this._fieldsIndex.get(j.endTimeField);e?(j.endTimeField=e.name,e.type="esriFieldTypeDate"):j.endTimeField=null}if(j.trackIdField){const e=this._fieldsIndex.get(j.trackIdField);e?j.trackIdField=e.name:(j.trackIdField=null,i.push({name:"feature-layer:invalid-timeInfo-trackIdField",message:"trackIdField is missing",details:{timeInfo:j}}))}j.startTimeField||j.endTimeField||(i.push({name:"feature-layer:invalid-timeInfo",message:"startTimeField and endTimeField are missing or invalid",details:{timeInfo:j}}),j=null)}const w={warnings:i,featureErrors:[],layerDefinition:{...D,drawingInfo:Object(_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_9__["createDrawingInfo"])(b),templates:Object(_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_9__["createDefaultTemplate"])(O),extent:I,geometryType:b,objectIdField:_,fields:n,hasZ:!!l,hasM:!!a,timeInfo:j},assignedObjectIds:{}};if(this._queryEngine=new _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_8__["default"]({fields:n,geometryType:b,hasM:a,hasZ:l,objectIdField:_,spatialReference:y,featureStore:new _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_6__["default"]({geometryType:b,hasM:a,hasZ:l}),timeInfo:j,cacheSpatialQueries:!0}),!s||!s.length)return this._nextObjectId=_objectIdUtils_js__WEBPACK_IMPORTED_MODULE_5__["initialObjectId"],w;const S=Object(_objectIdUtils_js__WEBPACK_IMPORTED_MODULE_5__["findLastObjectIdFromFeatures"])(_,s);return this._nextObjectId=S+1,await Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(s,y),this._loadInitialFeatures(w,s)}async applyEdits(e){const{spatialReference:t,geometryType:i}=this._queryEngine;return await Promise.all([Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["loadGeometryEngineForSimplify"])(t,i),Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(e.adds,t),Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["checkProjectionSupport"])(e.updates,t)]),this._applyEdits(e)}queryFeatures(e,t={}){return this._queryEngine.executeQuery(e,t.signal)}queryFeatureCount(e,t={}){return this._queryEngine.executeQueryForCount(e,t.signal)}queryObjectIds(e,t={}){return this._queryEngine.executeQueryForIds(e,t.signal)}queryExtent(e,t={}){return this._queryEngine.executeQueryForExtent(e,t.signal)}querySnapping(e,t={}){return this._queryEngine.executeQueryForSnapping(e,t.signal)}_inferLayerProperties(e,i){let r,n,a=null,l=null,o=null;for(const d of e){const e=d.geometry;if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(e)&&(a||(a=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(e)),l||(l=e.spatialReference),null==r&&(r=O(e)),null==n&&(n=w(e)),a&&l&&null!=r&&null!=n))break}if(i&&i.length){let e=null;i.some((t=>{const i="esriFieldTypeOID"===t.type,s=!t.type&&t.name&&"objectid"===t.name.toLowerCase();return e=t,i||s}))&&(o=e.name)}return{geometryType:a,spatialReference:l,objectIdField:o,hasM:n,hasZ:r}}_loadInitialFeatures(e,t){const{geometryType:r,hasM:n,hasZ:l,objectIdField:o,spatialReference:d,featureStore:u}=this._queryEngine,p=[];for(const a of t){if(null!=a.uid&&(e.assignedObjectIds[a.uid]=-1),a.geometry&&r!==Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(a.geometry)){e.featureErrors.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditErrorResult"])("Incorrect geometry type."));continue}const t=this._createDefaultAttributes(),n=Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["mixAttributes"])(this._fieldsIndex,t,a.attributes,this._requiredFields,!0,e.warnings);n?e.featureErrors.push(n):(this._assignObjectId(t,a.attributes,!0),a.attributes=t,null!=a.uid&&(e.assignedObjectIds[a.uid]=a.attributes[o]),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.geometry)&&(a.geometry=Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(a.geometry,a.geometry.spatialReference,d)),p.push(a))}if(u.addMany(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__["convertFromFeatures"])([],p,r,l,n,o)),e.layerDefinition.extent=this._queryEngine.fullExtent,e.layerDefinition.timeInfo){const{start:t,end:i}=this._queryEngine.timeExtent;e.layerDefinition.timeInfo.timeExtent=[t,i]}return e}_applyEdits(e){const{adds:t,updates:i,deletes:s}=e,r={addResults:[],deleteResults:[],updateResults:[],uidToObjectId:{}};if(t&&t.length&&this._applyAddEdits(r,t),i&&i.length&&this._applyUpdateEdits(r,i),s&&s.length){for(const e of s)r.deleteResults.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditSuccessResult"])(e));this._queryEngine.featureStore.removeManyById(s)}return{fullExtent:this._queryEngine.fullExtent,featureEditResults:r}}_applyAddEdits(e,t){const{addResults:r}=e,{geometryType:n,hasM:l,hasZ:o,objectIdField:d,spatialReference:u,featureStore:p}=this._queryEngine,f=[];for(const a of t){if(a.geometry&&n!==Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(a.geometry)){r.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditErrorResult"])("Incorrect geometry type."));continue}const t=this._createDefaultAttributes(),l=Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["mixAttributes"])(this._fieldsIndex,t,a.attributes,this._requiredFields);if(l)r.push(l);else{if(this._assignObjectId(t,a.attributes),a.attributes=t,null!=a.uid){const t=a.attributes[d];e.uidToObjectId[a.uid]=t}Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(a.geometry)&&(a.geometry=Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["simplify"])(a.geometry,u),a.geometry.spatialReference,u)),f.push(a),r.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditSuccessResult"])(a.attributes[d]))}}p.addMany(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__["convertFromFeatures"])([],f,n,o,l,d))}_applyUpdateEdits({updateResults:e},t){const{geometryType:r,hasM:n,hasZ:a,objectIdField:d,spatialReference:u,featureStore:p}=this._queryEngine;for(const f of t){const{attributes:t,geometry:c}=f,m=t&&t[d];if(null==m){e.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditErrorResult"])(`Identifier field ${d} missing`));continue}if(!p.has(m)){e.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditErrorResult"])(`Feature with object id ${m} missing`));continue}const h=Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__["convertToFeature"])(p.getFeature(m),r,a,n);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(c)){if(r!==Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_2__["getJsonType"])(c)){e.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditErrorResult"])("Incorrect geometry type."));continue}h.geometry=Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_7__["project"])(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["simplify"])(c,u),c.spatialReference,u)}if(t){const i=Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["mixAttributes"])(this._fieldsIndex,h.attributes,t,this._requiredFields);if(i){e.push(i);continue}}p.add(Object(_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__["convertFromFeature"])(h,r,a,n,d)),e.push(Object(_sourceUtils_js__WEBPACK_IMPORTED_MODULE_10__["createFeatureEditSuccessResult"])(m))}}_assignObjectId(e,t,i=!1){const s=this._queryEngine.objectIdField;i&&t&&isFinite(t[s])?e[s]=t[s]:e[s]=this._nextObjectId++}}


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
//# sourceMappingURL=97.render-page.js.map
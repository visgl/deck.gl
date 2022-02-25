exports.ids = [59];
exports.modules = {

/***/ "../node_modules/@arcgis/core/arcade/ArcadePortal.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/ArcadePortal.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return s; });
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class s extends _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]{constructor(t){super(),this.immutable=!1,this.setField("url",t),this.immutable=!0}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/Attachment.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/Attachment.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e extends _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]{constructor(t,e,i,s,l,a){super(),this.attachmentUrl=l,this.immutable=!1,this.setField("id",t),this.setField("name",e),this.setField("contenttype",i),this.setField("size",s),this.setField("exifinfo",a),this.immutable=!0}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/Dictionary.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/Dictionary.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ImmutableArray.js */ "../node_modules/@arcgis/core/arcade/ImmutableArray.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function b(t,e=!1){if(null==t)return null;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["j"])(t))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["t"])(t);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["i"])(t))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["u"])(t);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["f"])(t))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(t);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["n"])(t))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["w"])(t);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["a"])(t)){const i=[];for(const s of t)i.push(b(s,e));return i}const l=new h;l.immutable=!1;for(const i of Object.keys(t)){const s=t[i];void 0!==s&&l.setField(i,b(s,e))}return l.immutable=e,l}class h{constructor(t){this.declaredClass="esri.arcade.Dictionary",this.attributes=null,this.plain=!1,this.immutable=!0,this.attributes=t instanceof h?t.attributes:null==t?{}:t}field(t){const i=t.toLowerCase(),s=this.attributes[t];if(void 0!==s)return s;for(const r in this.attributes)if(r.toLowerCase()===i)return this.attributes[r];throw new Error("Field not Found : "+t)}setField(t,i){if(this.immutable)throw new Error("Dictionary is Immutable");const s=t.toLowerCase();if(void 0===this.attributes[t]){for(const t in this.attributes)if(t.toLowerCase()===s)return void(this.attributes[t]=i);this.attributes[t]=i}else this.attributes[t]=i}hasField(t){const i=t.toLowerCase();if(void 0!==this.attributes[t])return!0;for(const s in this.attributes)if(s.toLowerCase()===i)return!0;return!1}keys(){let t=[];for(const i in this.attributes)t.push(i);return t=t.sort(),t}castToText(){let n="";for(const o in this.attributes){""!==n&&(n+=",");const a=this.attributes[o];null==a?n+=JSON.stringify(o)+":null":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["i"])(a)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["j"])(a)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["f"])(a)?n+=JSON.stringify(o)+":"+JSON.stringify(a):a instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_2__["default"]||a instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]||a instanceof Array?n+=JSON.stringify(o)+":"+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["s"])(a):a instanceof Date?n+=JSON.stringify(o)+":"+JSON.stringify(a):null!==a&&"object"==typeof a&&void 0!==a.castToText&&(n+=JSON.stringify(o)+":"+a.castToText())}return"{"+n+"}"}static convertObjectToArcadeDictionary(t,i=!0){const s=new h;s.immutable=!1;for(const r in t){const i=t[r];void 0!==i&&s.setField(r.toString(),b(i))}return s.immutable=i,s}static convertJsonToArcade(t,i=!1){return b(t,i)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/Feature.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/Feature.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ImmutableArray.js */ "../node_modules/@arcgis/core/arcade/ImmutableArray.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./featureset/support/shared.js */ "../node_modules/@arcgis/core/arcade/featureset/support/shared.js");
/* harmony import */ var _layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../layers/graphics/featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class b{constructor(){this.declaredClass="esri.arcade.Feature",this._optimizedGeomDefinition=null,this._geometry=null,this.attributes=null,this._layer=null,this._datesfixed=!0,this.immutable=!0,this._datefields=null,this.immutable=!0}static createFromGraphic(t){const e=new b;return e._geometry=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_8__["isSome"])(t.geometry)?t.geometry:null,void 0===t.attributes||null===t.attributes?e.attributes={}:e.attributes=t.attributes,t._sourceLayer?(e._layer=t._sourceLayer,e._datesfixed=!1):t._layer?(e._layer=t._layer,e._datesfixed=!1):t.layer&&"fields"in t.layer?(e._layer=t.layer,e._datesfixed=!1):t.sourceLayer&&"fields"in t.sourceLayer&&(e._layer=t.sourceLayer,e._datesfixed=!1),e}static createFromArcadeFeature(t){const e=new b;return e._datesfixed=t._datesfixed,e.attributes=t.attributes,e._geometry=t._geometry,e._optimizedGeomDefinition=t._optimizedGeomDefinition,t._layer&&(e._layer=t._layer),e}static createFromOptimisedFeature(t,e,i){const r=new b;return r._geometry=t.geometry?{geometry:t.geometry}:null,r._optimizedGeomDefinition=i,r.attributes=t.attributes||{},r._layer=e,r._datesfixed=!1,r}static createFromArcadeDictionary(e){const i=new b;return i.attributes=e.field("attributes"),null!==i.attributes&&i.attributes instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]?(i.attributes=i.attributes.attributes,null===i.attributes&&(i.attributes={})):i.attributes={},i._geometry=e.field("geometry"),null!==i._geometry&&(i._geometry instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]?i._geometry=b.parseGeometryFromDictionary(i._geometry):i._geometry instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_3__["default"]||(i._geometry=null)),i}static createFromGraphicLikeObject(t,e,i=null){const r=new b;return null===e&&(e={}),r.attributes=e,r._geometry=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_8__["isSome"])(t)?t:null,r._layer=i,r._layer&&(r._datesfixed=!1),r._adapter=null,r}repurposeFromGraphicLikeObject(t,e,i=null){null===e&&(e={}),this.attributes=e,this._geometry=t||null,this._layer=i,this._layer?this._datesfixed=!1:this._datesfixed=!0}repurposeFromAdapter(t,e=null){this._adapter=t,this._layer=e}castToText(){if(this._adapter)return this._adapter.castToText();let t="";!1===this._datesfixed&&this._fixDates();for(const o in this.attributes){""!==t&&(t+=",");const n=this.attributes[o];null==n?t+=JSON.stringify(o)+":null":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["i"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["j"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["f"])(n)?t+=JSON.stringify(o)+":"+JSON.stringify(n):n instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_3__["default"]||n instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]||n instanceof Array?t+=JSON.stringify(o)+":"+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["s"])(n):n instanceof Date?t+=JSON.stringify(o)+":"+JSON.stringify(n):null!==n&&"object"==typeof n&&void 0!==n.castToText&&(t+=JSON.stringify(o)+":"+n.castToText())}return'{"geometry":'+(null===this.geometry()?"null":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["s"])(this.geometry()))+',"attributes":{'+t+"}}"}_fixDates(){if(null!==this._datefields)return this._datefields.length>0&&this._fixDateFields(this._datefields),void(this._datesfixed=!0);const t=[];for(let e=0;e<this._layer.fields.length;e++){const i=this._layer.fields[e];"date"!==i.type&&"esriFieldTypeDate"!==i.type||t.push(i.name)}this._datefields=t,t.length>0&&this._fixDateFields(t),this._datesfixed=!0}_fixDateFields(t){this.attributes={...this.attributes};for(let e=0;e<t.length;e++){let i=this.attributes[t[e]];if(null===i);else if(void 0===i){for(const r in this.attributes)if(r.toLowerCase()===t[e].toLowerCase()){i=this.attributes[r],null!==i&&(i instanceof Date||(this.attributes[r]=new Date(i)));break}}else i instanceof Date||(this.attributes[t[e]]=new Date(i))}}geometry(){return this._adapter?this._adapter.geometry():(null===this._geometry||this._geometry instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_3__["default"]||(this._optimizedGeomDefinition?(this._geometry=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_8__["unwrap"])(Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_5__["fromJSON"])(Object(_layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_7__["convertToGeometry"])(this._geometry,this._optimizedGeomDefinition.geometryType,this._optimizedGeomDefinition.hasZ,this._optimizedGeomDefinition.hasM))),this._geometry.spatialReference=this._optimizedGeomDefinition.spatialReference):this._geometry=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_8__["unwrap"])(Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_5__["fromJSON"])(this._geometry))),this._geometry)}field(t){if(this._adapter)return this._adapter.field(t);!1===this._datesfixed&&this._fixDates();const e=this.attributes[t];if(void 0!==e)return e;const i=t.toLowerCase();for(const r in this.attributes)if(r.toLowerCase()===i)return this.attributes[r];if(this._hasFieldDefinition(i))return null;throw new Error("Field not Found : "+t)}_hasFieldDefinition(t){if(null===this._layer)return!1;for(let e=0;e<this._layer.fields.length;e++){if(this._layer.fields[e].name.toLowerCase()===t)return!0}return!1}_field(t){var e;if(this._adapter)return null!=(e=this._adapter.field(t))?e:null;!1===this._datesfixed&&this._fixDates();const i=t.toLowerCase(),r=this.attributes[t];if(void 0!==r)return r;for(const s in this.attributes)if(s.toLowerCase()===i)return this.attributes[s];return null}setField(t,e){if(this.immutable)throw new Error("Feature is Immutable");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["x"])(e))throw new Error("Illegal Value Assignment to Feature");if(this._adapter)return void this._adapter.setField(t,e);const i=t.toLowerCase();if(void 0===this.attributes[t]){for(const t in this.attributes)if(t.toLowerCase()===i)return void(this.attributes[t]=e);this.attributes[t]=e}else this.attributes[t]=e}hasField(t){if(this._adapter)return this._adapter.hasField(t);const e=t.toLowerCase();if(void 0!==this.attributes[t])return!0;for(const i in this.attributes)if(i.toLowerCase()===e)return!0;return!!this._hasFieldDefinition(e)}keys(){if(this._adapter)return this._adapter.keys();let t=[];const e={};for(const i in this.attributes)t.push(i),e[i.toLowerCase()]=1;if(null!==this._layer)for(let i=0;i<this._layer.fields.length;i++){const r=this._layer.fields[i];1!==e[r.name.toLowerCase()]&&t.push(r.name)}return t=t.sort(),t}static parseGeometryFromDictionary(t){const e=b.convertDictionaryToJson(t,!0);return void 0!==e.hasm&&(e.hasM=e.hasm,delete e.hasm),void 0!==e.hasz&&(e.hasZ=e.hasz,delete e.hasz),void 0!==e.spatialreference&&(e.spatialReference=e.spatialreference,delete e.spatialreference),void 0!==e.rings&&(e.rings=this.fixPathArrays(e.rings,!0===e.hasZ,!0===e.hasZ)),void 0!==e.paths&&(e.paths=this.fixPathArrays(e.paths,!0===e.hasZ,!0===e.hasM)),void 0!==e.points&&(e.points=this.fixPointArrays(e.points,!0===e.hasZ,!0===e.hasM)),Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_5__["fromJSON"])(e)}static fixPathArrays(t,i,r){const s=[];if(t instanceof Array)for(let e=0;e<t.length;e++)s.push(this.fixPointArrays(t[e],i,r));else if(t instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])for(let e=0;e<t.length();e++)s.push(this.fixPointArrays(t.get(e),i,r));return s}static fixPointArrays(t,i,r){const s=[];if(t instanceof Array)for(let a=0;a<t.length;a++){const o=t[a];o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_4__["default"]?i&&r?s.push([o.x,o.y,o.z,o.m]):i?s.push([o.x,o.y,o.z]):r?s.push([o.x,o.y,o.m]):s.push([o.x,o.y]):o instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]?s.push(o.toArray()):s.push(o)}else if(t instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])for(let a=0;a<t.length();a++){const o=t.get(a);o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_4__["default"]?i&&r?s.push([o.x,o.y,o.z,o.m]):i?s.push([o.x,o.y,o.z]):r?s.push([o.x,o.y,o.m]):s.push([o.x,o.y]):o instanceof _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]?s.push(o.toArray()):s.push(o)}return s}static convertDictionaryToJson(e,i=!1){const r={};for(const s in e.attributes){let a=e.attributes[s];a instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]&&(a=b.convertDictionaryToJson(a)),i?r[s.toLowerCase()]=a:r[s]=a}return r}static parseAttributesFromDictionary(t){const e={};for(const i in t.attributes){const r=t.attributes[i];if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["x"])(r))throw new Error("Illegal Argument");e[i]=r}return e}static fromJson(t){let e=null;null!==t.geometry&&void 0!==t.geometry&&(e=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_5__["fromJSON"])(t.geometry));const a={};if(null!==t.attributes&&void 0!==t.attributes)for(const o in t.attributes){const e=t.attributes[o];if(null===e)a[o]=e;else{if(!(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["f"])(e)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["j"])(e)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["i"])(e)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["n"])(e)))throw new Error("Illegal Argument");a[o]=e}}return b.createFromGraphicLikeObject(e,a,null)}fullDomain(t,e){if(null===this._layer)return null;if(!this._layer.fields)return null;return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["y"])(t,this._layer,this,e)}subtypes(){return null===this._layer?null:this._layer.fields&&this._layer.typeIdField?{subtypeField:this._layer.typeIdField,subtypes:this._layer.types?this._layer.types.map((t=>({name:t.name,code:t.id}))):[]}:null}domainValueLookup(t,e,i){if(null===this._layer)return null;if(!this._layer.fields)return null;const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["y"])(t,this._layer,this,i);if(void 0===e)try{e=this.field(t)}catch(s){return null}return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["z"])(r,e)}gdbVersion(){if(null===this._layer)return"";const t=this._layer.gdbVersion;return void 0===t?"":""===t&&this._layer.capabilities&&this._layer.capabilities.isVersioned?"SDE.DEFAULT":t}domainCodeLookup(t,e,i){if(null===this._layer)return null;if(!this._layer.fields)return null;if(void 0===e){try{e=this.field(t)}catch(s){return null}return e}const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["y"])(t,this._layer,this,i);return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["A"])(r,e)}schema(){if(null===this._layer)return null;if(!this._layer.fields)return null;const t=[];for(const e of this._layer.fields)t.push(Object(_featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_6__["esriFieldToJson"])(e));return{objectIdField:this._layer.objectIdField,globalIdField:this._layer.globalIdField,geometryType:void 0===_featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_6__["layerGeometryEsriRestConstants"][this._layer.geometryType]?"":_featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_6__["layerGeometryEsriRestConstants"][this._layer.geometryType],fields:t}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/FunctionWrapper.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/FunctionWrapper.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t,i){this.definition=null,this.context=null,this.definition=t,this.context=i}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/ImmutableArray.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/ImmutableArray.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t=[]){this._elements=t}length(){return this._elements.length}get(t){return this._elements[t]}toArray(){const t=[];for(let e=0;e<this.length();e++)t.push(this.get(e));return t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/ImmutablePathArray.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/ImmutablePathArray.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ImmutableArray.js */ "../node_modules/@arcgis/core/arcade/ImmutableArray.js");
/* harmony import */ var _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ImmutablePointArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class h extends _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]{constructor(t,s,h,i,e){super(t),this._lazyPath=[],this._hasZ=!1,this._hasM=!1,this._hasZ=h,this._hasM=i,this._spRef=s,this._cacheId=e}get(t){if(void 0===this._lazyPath[t]){const h=this._elements[t];if(void 0===h)return;this._lazyPath[t]=new _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_1__["default"](h,this._spRef,this._hasZ,this._hasM,this._cacheId,t)}return this._lazyPath[t]}equalityTest(t){return t===this||null!==t&&(t instanceof h!=!1&&t.getUniqueHash()===this.getUniqueHash())}getUniqueHash(){return this._cacheId.toString()}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/ImmutablePointArray.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ImmutableArray.js */ "../node_modules/@arcgis/core/arcade/ImmutableArray.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class i extends _ImmutableArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]{constructor(t,s,i,e,h,a){super(t),this._lazyPt=[],this._hasZ=!1,this._hasM=!1,this._spRef=s,this._hasZ=i,this._hasM=e,this._cacheId=h,this._partId=a}get(t){if(void 0===this._lazyPt[t]){const i=this._elements[t];if(void 0===i)return;const e=this._hasZ,h=this._hasM;let a=null;a=e&&!h?new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](i[0],i[1],i[2],void 0,this._spRef):h&&!e?new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](i[0],i[1],void 0,i[2],this._spRef):e&&h?new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](i[0],i[1],i[2],i[3],this._spRef):new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_1__["default"](i[0],i[1],this._spRef),a.cache._arcadeCacheId=this._cacheId.toString()+"-"+this._partId.toString()+"-"+t.toString(),this._lazyPt[t]=a}return this._lazyPt[t]}equalityTest(t){return t===this||null!==t&&(t instanceof i!=!1&&t.getUniqueHash()===this.getUniqueHash())}getUniqueHash(){return this._cacheId.toString()+"-"+this._partId.toString()}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/arcadeCompiler.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/arcadeCompiler.js ***!
  \*************************************************************/
/*! exports provided: compileScript, enableAsyncSupport, executeScript, extend, extractExpectedFieldLiterals, extractFieldLiterals, functionHelper, referencesFunction, referencesMember, validateScript */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compileScript", function() { return ot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableAsyncSupport", function() { return at; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeScript", function() { return He; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return Ze; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractExpectedFieldLiterals", function() { return Ke; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractFieldLiterals", function() { return We; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "functionHelper", function() { return Je; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesFunction", function() { return $e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesMember", function() { return Qe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateScript", function() { return Xe; });
/* harmony import */ var _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ArcadePortal.js */ "../node_modules/@arcgis/core/arcade/ArcadePortal.js");
/* harmony import */ var _Attachment_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Attachment.js */ "../node_modules/@arcgis/core/arcade/Attachment.js");
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _Feature_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Feature.js */ "../node_modules/@arcgis/core/arcade/Feature.js");
/* harmony import */ var _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ImmutablePathArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePathArray.js");
/* harmony import */ var _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ImmutablePointArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./treeAnalysis.js */ "../node_modules/@arcgis/core/arcade/treeAnalysis.js");
/* harmony import */ var _functions_array_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./functions/array.js */ "../node_modules/@arcgis/core/arcade/functions/array.js");
/* harmony import */ var _functions_date_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./functions/date.js */ "../node_modules/@arcgis/core/arcade/functions/date.js");
/* harmony import */ var _functions_geometry_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./functions/geometry.js */ "../node_modules/@arcgis/core/arcade/functions/geometry.js");
/* harmony import */ var _functions_geomsync_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./functions/geomsync.js */ "../node_modules/@arcgis/core/arcade/functions/geomsync.js");
/* harmony import */ var _functions_maths_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./functions/maths.js */ "../node_modules/@arcgis/core/arcade/functions/maths.js");
/* harmony import */ var _functions_stats_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./functions/stats.js */ "../node_modules/@arcgis/core/arcade/functions/stats.js");
/* harmony import */ var _functions_string_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./functions/string.js */ "../node_modules/@arcgis/core/arcade/functions/string.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _views_2d_layers_features_support_FeatureSetReader_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../views/2d/layers/features/support/FeatureSetReader.js */ "../node_modules/@arcgis/core/views/2d/layers/features/support/FeatureSetReader.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function re(e,t){const n=[];for(let r=0;r<t.arguments.length;r++)n.push(le(e,t.arguments[r]));return n}function oe(e,t,n){try{return n(e,null,t)}catch(r){throw r}}function ae(e){return e instanceof Error?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["reject"])(e):Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["reject"])(new Error(e))}function le(e,t){try{switch(t.type){case"EmptyStatement":return"lc.voidOperation";case"VariableDeclarator":return Ee(e,t);case"VariableDeclaration":return we(e,t);case"BlockStatement":return ye(e,t);case"FunctionDeclaration":return Se(e,t);case"ReturnStatement":return de(e,t);case"IfStatement":return ge(e,t);case"ExpressionStatement":return me(e,t);case"AssignmentExpression":return fe(e,t);case"UpdateExpression":return pe(e,t);case"BreakStatement":return"break";case"ContinueStatement":return"continue";case"TemplateLiteral":return Oe(e,t);case"TemplateElement":return JSON.stringify(t.value?t.value.cooked:"");case"ForStatement":return ue(e,t);case"ForInStatement":return ce(e,t);case"Identifier":return Re(e,t);case"MemberExpression":return ve(e,t);case"Literal":return null===t.value||void 0===t.value?"null":JSON.stringify(t.value);case"ThisExpression":throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","NOTSUPPORTED"));case"CallExpression":return _e(e,t);case"UnaryExpression":return Me(e,t);case"BinaryExpression":return xe(e,t);case"LogicalExpression":return Te(e,t);case"ConditionalExpression":throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","NOTSUPPORTED"));case"ArrayExpression":return Ie(e,t);case"ObjectExpression":return se(e,t);case"Property":return ie(e,t);case"Array":throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","NOTSUPPORTED"));default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","UNREOGNISED"))}}catch(n){throw n}}function se(e,t){let n="lang.dictionary([";for(let r=0;r<t.properties.length;r++){const o=t.properties[r];r>0&&(n+=","),n+="lang.strCheck("+("Identifier"===o.key.type?"'"+o.key.name+"'":le(e,o.key))+",'ObjectExpression'),lang.aCheck("+le(e,o.value)+", 'ObjectExpression')"}return n+="])",n}function ie(e,t){throw new Error("Should not get here")}function ce(e,t){const n=Be(e),r=Be(e),o=Be(e);let a="var "+n+" = "+le(e,t.right)+";\n";"VariableDeclaration"===t.left.type&&(a+=le(e,t.left));let l="VariableDeclaration"===t.left.type?t.left.declarations[0].id.name:t.left.name;l=l.toLowerCase();let s="";return null!==e.localScope&&(void 0!==e.localScope[l]?s="lscope['"+l+"']":void 0!==e.localScope._SymbolsMap[l]&&(s="lscope['"+e.localScope._SymbolsMap[l]+"']")),""===s&&(void 0!==e.globalScope[l]?s="gscope['"+l+"']":void 0!==e.globalScope._SymbolsMap[l]&&(s="gscope['"+e.globalScope._SymbolsMap[l]+"']")),a+="if ("+n+"===null) {  lastStatement = lc.voidOperation; }\n ",a+="else if (lc.isArray("+n+") || lc.isString("+n+")) {",a+="var "+r+"="+n+".length; \n",a+="for(var "+o+"=0; "+o+"<"+r+"; "+o+"++) {\n",a+=s+"="+o+";\n",a+=le(e,t.body),a+="\n}\n",a+=" lastStatement = lc.voidOperation; \n",a+=" \n}\n",a+="else if (lc.isImmutableArray("+n+")) {",a+="var "+r+"="+n+".length(); \n",a+="for(var "+o+"=0; "+o+"<"+r+"; "+o+"++) {\n",a+=s+"="+o+";\n",a+=le(e,t.body),a+="\n}\n",a+=" lastStatement = lc.voidOperation; \n",a+=" \n}\n",a+="else if (( "+n+" instanceof lang.Dictionary) || ( "+n+" instanceof lang.Feature)) {",a+="var "+r+"="+n+".keys(); \n",a+="for(var "+o+"=0; "+o+"<"+r+".length; "+o+"++) {\n",a+=s+"="+r+"["+o+"];\n",a+=le(e,t.body),a+="\n}\n",a+=" lastStatement = lc.voidOperation; \n",a+=" \n}\n",e.isAsync&&(a+="else if (lc.isFeatureSet("+n+")) {",a+="var "+r+"="+n+".iterator(runtimeCtx.abortSignal); \n",a+="for(var "+o+"=lang. graphicToFeature( yield "+r+".next(),"+n+"); "+o+"!=null; "+o+"=lang. graphicToFeature( yield "+r+".next(),"+n+")) {\n",a+=s+"="+o+";\n",a+=le(e,t.body),a+="\n}\n",a+=" lastStatement = lc.voidOperation; \n",a+=" \n}\n"),a+="else { lastStatement = lc.voidOperation; } \n",a}function ue(e,t){let n="lastStatement = lc.voidOperation; \n";null!==t.init&&(n+=le(e,t.init)+"; ");const r=Be(e),o=Be(e);return n+="var "+r+" = true; ",n+="\n do { ",null!==t.update&&(n+=" if ("+r+"===false) {\n "+le(e,t.update)+"  \n}\n "+r+"=false; \n"),null!==t.test&&(n+="var "+o+" = "+le(e,t.test)+"; ",n+="if ("+o+"===false) { break; } else if ("+o+"!==true) { lang.error({type: '"+t.type+"'},'RUNTIME','CANNOT_USE_NONBOOLEAN_IN_CONDITION');   }\n"),n+=le(e,t.body),null!==t.update&&(n+="\n "+le(e,t.update)),n+="\n"+r+" = true; \n} while(true);  lastStatement = lc.voidOperation; ",n}function pe(e,t){let n=null,r="";if("MemberExpression"===t.argument.type)return n=le(e,t.argument.object),r=!0===t.argument.computed?le(e,t.argument.property):"'"+t.argument.property.name+"'","lang.memberupdate("+n+","+r+",'"+t.operator+"',"+t.prefix+")";if(n=t.argument.name.toLowerCase(),null!==e.localScope){if(void 0!==e.localScope[n])return"lang.update(lscope, '"+n+"','"+t.operator+"',"+t.prefix+")";if(void 0!==e.localScope._SymbolsMap[n])return"lang.update(lscope, '"+e.localScope._SymbolsMap[n]+"','"+t.operator+"',"+t.prefix+")"}if(void 0!==e.globalScope[n])return"lang.update(gscope, '"+n+"','"+t.operator+"',"+t.prefix+")";if(void 0!==e.globalScope._SymbolsMap[n])return"lang.update(gscope, '"+e.globalScope._SymbolsMap[n]+"','"+t.operator+"',"+t.prefix+")";throw new Error("Variable not recognised")}function fe(e,t){const n=le(e,t.right);let r=null,o="";if("MemberExpression"===t.left.type)return r=le(e,t.left.object),o=!0===t.left.computed?le(e,t.left.property):"'"+t.left.property.name+"'","lang.assignmember("+r+","+o+",'"+t.operator+"',"+n+")";if(r=t.left.name.toLowerCase(),null!==e.localScope){if(void 0!==e.localScope[r])return"lscope['"+r+"']=lang.assign("+n+",'"+t.operator+"', lscope['"+r+"'])";if(void 0!==e.localScope._SymbolsMap[r])return"lscope['"+e.localScope._SymbolsMap[r]+"']=lang.assign("+n+",'"+t.operator+"', lscope['"+e.localScope._SymbolsMap[r]+"'])"}if(void 0!==e.globalScope[r])return"gscope['"+r+"']=lang.assign("+n+",'"+t.operator+"', gscope['"+r+"'])";if(void 0!==e.globalScope._SymbolsMap[r])return"gscope['"+e.globalScope._SymbolsMap[r]+"']=lang.assign("+n+",'"+t.operator+"', gscope['"+e.globalScope._SymbolsMap[r]+"'])";throw new Error("Variable not recognised")}function me(e,t){return"AssignmentExpression"===t.expression.type?"lastStatement = lc.voidOperation; "+le(e,t.expression)+"; \n ":(t.expression.type,"lastStatement = "+le(e,t.expression)+"; ")}function he(e,t){return"BlockStatement"===t.type?le(e,t):"ReturnStatement"===t.type||"BreakStatement"===t.type||"ContinueStatement"===t.type?le(e,t)+"; ":"UpdateExpression"===t.type?"lastStatement = "+le(e,t)+"; ":"ExpressionStatement"===t.type?le(e,t):"ObjectExpression"===t.type?"lastStatement = "+le(e,t)+"; ":le(e,t)+"; "}function ge(e,t){if("AssignmentExpression"===t.test.type||"UpdateExpression"===t.test.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t.test,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));const n=le(e,t.test),r=Be(e);let o="var "+r+" = "+n+";\n if ("+r+" === true) {\n"+he(e,t.consequent)+"\n }\n";return null!==t.alternate?o+="else if ("+r+"===false)   { \n"+he(e,t.alternate)+"}\n":o+="else if ("+r+"===false) { \n lastStatement = lc.voidOperation;\n }\n",o+="else { lang.error({type: '"+t.type+"'},'RUNTIME','CANNOT_USE_NONBOOLEAN_IN_CONDITION'); \n}\n",o}function ye(e,t){let n="";for(let r=0;r<t.body.length;r++)"ReturnStatement"===t.body[r].type||"BreakStatement"===t.body[r].type||"ContinueStatement"===t.body[r].type?n+=le(e,t.body[r])+"; \n":"UpdateExpression"===t.body[r].type||"ObjectExpression"===t.body[r].type?n+="lastStatement = "+le(e,t.body[r])+"; \n":n+=le(e,t.body[r])+" \n";return n}function de(e,t){if(null===t.argument)return"return lc.voidOperation";return"return "+le(e,t.argument)}function Se(e,t){const n=t.id.name.toLowerCase(),r={isAsync:e.isAsync,spatialReference:e.spatialReference,console:e.console,lrucache:e.lrucache,interceptor:e.interceptor,services:e.services,symbols:e.symbols,mangleMap:e.mangleMap,localScope:{_SymbolsMap:{}},depthCounter:e.depthCounter+1,globalScope:e.globalScope};if(r.depthCounter>64)throw new Error("Exceeded maximum function depth");let o="new lc.SizzleFunction( lang.functionDepthchecker(function() { var lastStatement = lc.voidOperation; \n   var lscope = runtimeCtx.localStack[runtimeCtx.localStack.length-1];\n";for(let a=0;a<t.params.length;a++){const n=t.params[a].name.toLowerCase(),l=Le(e);r.localScope._SymbolsMap[n]=l,r.mangleMap[n]=l,o+="lscope['"+l+"']=arguments["+a.toString()+"];\n"}if(!0===e.isAsync?(o+="return lang.__awaiter(this, void 0, void 0, function* () {\n",o+=ye(r,t.body)+"\n return lastStatement; ",o+="});  }",o+=", runtimeCtx))",o+="\n lastStatement = lc.voidOperation; \n"):(o+=ye(r,t.body)+"\n return lastStatement; }, runtimeCtx))",o+="\n lastStatement = lc.voidOperation; \n"),void 0!==e.globalScope[n])return"gscope['"+n+"']="+o;if(void 0!==e.globalScope._SymbolsMap[n])return"gscope['"+e.globalScope._SymbolsMap[n]+"']="+o;{const t=Le(e);return e.globalScope._SymbolsMap[n]=t,e.mangleMap[n]=t,"gscope['"+t+"']="+o}}function we(e,t){const n=[];for(let r=0;r<t.declarations.length;r++)n.push(le(e,t.declarations[r]));return n.join("\n")+" \n lastStatement=  lc.voidOperation; \n"}function Ee(e,t){let n=null===t.init?null:le(e,t.init);n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]&&(n=null);const r=t.id.name.toLowerCase();if(null!==e.localScope){if(void 0!==e.localScope[r])return"lscope['"+r+"']="+n+"; ";if(void 0!==e.localScope._SymbolsMap[r])return"lscope['"+e.localScope._SymbolsMap[r]+"']="+n+"; ";{const t=Le(e);return e.localScope._SymbolsMap[r]=t,e.mangleMap[r]=t,"lscope['"+t+"']="+n+"; "}}if(void 0!==e.globalScope[r])return"gscope['"+r+"']="+n+"; ";if(void 0!==e.globalScope._SymbolsMap[r])return"gscope['"+e.globalScope._SymbolsMap[r]+"']="+n+"; ";{const t=Le(e);return e.globalScope._SymbolsMap[r]=t,e.mangleMap[r]=t,"gscope['"+t+"']="+n+"; "}}let be=0;function Ne(e,t,r){let l;switch(t=t.toLowerCase()){case"hasz":{const t=e.hasZ;return void 0!==t&&t}case"hasm":{const t=e.hasM;return void 0!==t&&t}case"spatialreference":{let t=e.spatialReference._arcadeCacheId;if(void 0===t){let n=!0;Object.freeze&&Object.isFrozen(e.spatialReference)&&(n=!1),n&&(be++,e.spatialReference._arcadeCacheId=be,t=be)}const r=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]({wkt:e.spatialReference.wkt,wkid:e.spatialReference.wkid});return void 0!==t&&(r._arcadeCacheId="SPREF"+t.toString()),r}}switch(e.type){case"extent":switch(t){case"xmin":case"xmax":case"ymin":case"ymax":case"zmin":case"zmax":case"mmin":case"mmax":{const n=e[t];return void 0!==n?n:null}case"type":return"Extent"}break;case"polygon":switch(t){case"rings":l=e.cache._arcadeCacheId,void 0===l&&(be++,l=be,e.cache._arcadeCacheId=l);return new _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_4__["default"](e.rings,e.spatialReference,!0===e.hasZ,!0===e.hasM,l);case"type":return"Polygon"}break;case"point":switch(t){case"x":case"y":case"z":case"m":return void 0!==e[t]?e[t]:null;case"type":return"Point"}break;case"polyline":switch(t){case"paths":l=e.cache._arcadeCacheId,void 0===l&&(be++,l=be,e.cache._arcadeCacheId=l);return new _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_4__["default"](e.paths,e.spatialReference,!0===e.hasZ,!0===e.hasM,l);case"type":return"Polyline"}break;case"multipoint":switch(t){case"points":l=e.cache._arcadeCacheId,void 0===l&&(be++,l=be,e.cache._arcadeCacheId=l);return new _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_5__["default"](e.points,e.spatialReference,!0===e.hasZ,!0===e.hasM,l,1);case"type":return"Multipoint"}}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(r,"RUNTIME","PROPERTYNOTFOUND"))}function ve(e,t){try{let n;return n=!0===t.computed?le(e,t.property):"'"+t.property.name+"'","lang.member("+le(e,t.object)+","+n+")"}catch(n){throw n}}function Me(e,t){try{return"lang.unary("+le(e,t.argument)+",'"+t.operator+"')"}catch(n){throw n}}function Ie(e,t){try{const n=[];for(let r=0;r<t.elements.length;r++)"Literal"===t.elements[r].type?n.push(le(e,t.elements[r])):n.push("lang.aCheck("+le(e,t.elements[r])+",'ArrayExpression')");return"["+n.join(",")+"]"}catch(n){throw n}}function Oe(e,t){try{const n=[];let r=0;for(const o of t.quasis)n.push(o.value?JSON.stringify(o.value.cooked):JSON.stringify("")),!1===o.tail&&(n.push(t.expressions[r]?"lang.castString(lang.aCheck("+le(e,t.expressions[r])+", 'TemplateLiteral'))":""),r++);return"(["+n.join(",")+"]).join('')"}catch(n){throw n}}function xe(e,t){try{return"lang.binary("+le(e,t.left)+","+le(e,t.right)+",'"+t.operator+"')"}catch(n){throw n}}function Te(e,t){try{if("AssignmentExpression"===t.left.type||"UpdateExpression"===t.left.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t.left,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));if("AssignmentExpression"===t.right.type||"UpdateExpression"===t.right.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t.right,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));if("&&"===t.operator||"||"===t.operator)return"(lang.logicalCheck("+le(e,t.left)+") "+t.operator+" lang.logicalCheck("+le(e,t.right)+"))";throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","ONLYORORAND"))}catch(n){throw n}}function Re(e,t){try{const n=t.name.toLowerCase();if(null!==e.localScope){if(void 0!==e.localScope[n])return"lscope['"+n+"']";if(void 0!==e.localScope._SymbolsMap[n])return"lscope['"+e.localScope._SymbolsMap[n]+"']"}if(void 0!==e.globalScope[n])return"gscope['"+n+"']";if(void 0!==e.globalScope._SymbolsMap[n])return"gscope['"+e.globalScope._SymbolsMap[n]+"']";throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","VARIABLENOTFOUND"))}catch(n){throw n}}function _e(e,t){try{if("Identifier"!==t.callee.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","ONLYNODESSUPPORTED"));const n=t.callee.name.toLowerCase();let r="";if(null!==e.localScope&&(void 0!==e.localScope[n]?r="lscope['"+n+"']":void 0!==e.localScope._SymbolsMap[n]&&(r="lscope['"+e.localScope._SymbolsMap[n]+"']")),""===r&&(void 0!==e.globalScope[n]?r="gscope['"+n+"']":void 0!==e.globalScope._SymbolsMap[n]&&(r="gscope['"+e.globalScope._SymbolsMap[n]+"']")),""!==r){let n="[";for(let r=0;r<t.arguments.length;r++)r>0&&(n+=", "),n+=le(e,t.arguments[r]);return n+="]",e.isAsync?"(yield lang.callfunc("+r+","+n+",runtimeCtx) )":"lang.callfunc("+r+","+n+",runtimeCtx)"}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(t,"RUNTIME","NOTFOUND"))}catch(n){throw n}}const Ce={};function Ue(o){return null===o?"":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(o)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(o)?"Array":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["n"])(o)?"Date":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(o)?"String":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(o)?"Boolean":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(o)?"Number":o instanceof _Attachment_js__WEBPACK_IMPORTED_MODULE_1__["default"]?"Attachment":o instanceof _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__["default"]?"Portal":o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]?"Dictionary":o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]?"Feature":o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_19__["default"]?"Point":o instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_20__["default"]?"Polygon":o instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_21__["default"]?"Polyline":o instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_18__["default"]?"Multipoint":o instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_16__["default"]?"Extent":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["c"])(o)?"Function":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["o"])(o)?"FeatureSet":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["q"])(o)?"FeatureSetCollection":o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]?"":"number"==typeof o&&isNaN(o)?"Number":"Unrecognised Type"}function Ae(e,t,n,r){try{const o=t[n];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["e"])(o,r))return t[n+1];{const o=t.length-n;return 1===o?t[n]:2===o?null:3===o?t[n+2]:Ae(e,t,n+2,r)}}catch(o){throw o}}function Fe(e,t,n,r){try{if(!0===r)return t[n+1];if(3===t.length-n)return t[n+2];{const r=t[n+2];if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(r))throw new Error("WHEN needs boolean test conditions");return Fe(e,t,n+2,r)}}catch(o){throw o}}function Pe(e,t){const n=e.length,r=Math.floor(n/2);return 0===n?[]:1===n?[e[0]]:ke(Pe(e.slice(0,r),t),Pe(e.slice(r,n),t),t)}function ke(e,t,n){const r=[];for(;e.length>0||t.length>0;)if(e.length>0&&t.length>0){let o=n(e[0],t[0]);isNaN(o)&&(o=0),o<=0?(r.push(e[0]),e=e.slice(1)):(r.push(t[0]),t=t.slice(1))}else e.length>0?(r.push(e[0]),e=e.slice(1)):t.length>0&&(r.push(t[0]),t=t.slice(1));return r}function je(e,t){try{const n=e.length,r=Math.floor(n/2);if(0===n)return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["resolve"])([]);if(1===n)return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["resolve"])([e[0]]);const o=[je(e.slice(0,r),t),je(e.slice(r,n),t)];return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["all"])(o).then((e=>De(e[0],e[1],t,[])))}catch(n){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["reject"])(n)}}function De(e,t,n,r){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["create"])(((o,a)=>{const l=r;e.length>0||t.length>0?e.length>0&&t.length>0?n(e[0],t[0]).then((s=>{try{isNaN(s)&&(s=1),s<=0?(l.push(e[0]),e=e.slice(1)):(l.push(t[0]),t=t.slice(1)),De(e,t,n,r).then((e=>{o(e)}),a)}catch(i){a(i)}}),a):e.length>0?(l.push(e[0]),De(e=e.slice(1),t,n,r).then((e=>{o(e)}),a)):t.length>0&&(l.push(t[0]),t=t.slice(1),De(e,t,n,r).then((e=>{o(e)}),a)):o(r)}))}function Le(e){return e.symbols.symbolCounter++,"_T"+e.symbols.symbolCounter.toString()}function Be(e){return e.symbols.symbolCounter++,"_Tvar"+e.symbols.symbolCounter.toString()}Object(_functions_array_js__WEBPACK_IMPORTED_MODULE_8__["registerFunctions"])(Ce,oe),Object(_functions_date_js__WEBPACK_IMPORTED_MODULE_9__["registerFunctions"])(Ce,oe),Object(_functions_string_js__WEBPACK_IMPORTED_MODULE_14__["registerFunctions"])(Ce,oe),Object(_functions_maths_js__WEBPACK_IMPORTED_MODULE_12__["registerFunctions"])(Ce,oe),Object(_functions_geometry_js__WEBPACK_IMPORTED_MODULE_10__["registerFunctions"])(Ce,oe),Object(_functions_stats_js__WEBPACK_IMPORTED_MODULE_13__["registerFunctions"])(Ce,oe),Ce.typeof=function(e,t){return oe(e,t,(function(e,t,n){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["p"])(n,1,1);const r=Ue(n[0]);if("Unrecognised Type"===r)throw new Error("Unrecognised Type");return r}))},Ce.iif=function(e,t){try{return oe(e,t,(function(e,t,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["p"])(n,3,3),!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(n[0]))throw new Error("IF Function must have a boolean test condition");return n[0]?n[1]:n[2]}))}catch(n){throw n}},Ce.decode=function(e,t){try{return oe(e,t,(function(t,n,r){if(r.length<2)throw new Error("Missing Parameters");if(2===r.length)return r[1];{if((r.length-1)%2==0)throw new Error("Must have a default value result.");const t=r[0];return Ae(e,r,1,t)}}))}catch(n){throw n}},Ce.when=function(e,t){try{return oe(e,t,(function(t,n,r){if(r.length<3)throw new Error("Missing Parameters");if(r.length%2==0)throw new Error("Must have a default value result.");const o=r[0];if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(o))throw new Error("WHEN needs boolean test conditions");return Fe(e,r,0,o)}))}catch(n){throw n}},Ce.top=function(e,t){return oe(e,t,(function(e,t,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["p"])(n,2,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(n[0]))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n[1])>=n[0].length?n[0].slice(0):n[0].slice(0,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n[1]));if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(n[0]))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n[1])>=n[0].length()?n[0].slice(0):n[0].slice(0,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n[1]));throw new Error("Top cannot accept this parameter type")}))},Ce.first=function(e,t){return oe(e,t,(function(e,t,n){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["p"])(n,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(n[0])?0===n[0].length?null:n[0][0]:Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(n[0])?0===n[0].length()?null:n[0].get(0):null}))},Ce.sort=function(e,t){return oe(e,t,(function(t,n,r){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["p"])(r,1,2);let o=r[0];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(o)&&(o=o.toArray()),!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(o))throw new Error("Illegal Argument");if(r.length>1){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["c"])(r[1]))throw new Error("Illegal Argument");let n=o;const a=function(e,n){return nt.callfunc(r[1],[e,n],t)};return e.isAsync?je(n,a):(n=Pe(n,(function(e,t){return a(e,t)})),n)}{let e=o;if(0===e.length)return[];const t={};for(let o=0;o<e.length;o++){const n=Ue(e[o]);""!==n&&(t[n]=!0)}if(!0===t.Array||!0===t.Dictionary||!0===t.Feature||!0===t.Point||!0===t.Polygon||!0===t.Polyline||!0===t.Multipoint||!0===t.Extent||!0===t.Function)return e.slice(0);let n=0,r="";for(const o in t)n++,r=o;return e=n>1||"String"===r?Pe(e,(function(e,t){if(null==e||e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"])return null==t||t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]?0:1;if(null==t||t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"])return-1;const n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(e),r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(t);return n<r?-1:n===r?0:1})):"Number"===r?Pe(e,(function(e,t){return e-t})):"Boolean"===r?Pe(e,(function(e,t){return e===t?0:t?-1:1})):"Date"===r?Pe(e,(function(e,t){return t-e})):e.slice(0),e}}))};const Ye={};for(const lt in Ce)Ye[lt]=new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["N"](Ce[lt]);Object(_functions_geomsync_js__WEBPACK_IMPORTED_MODULE_11__["registerFunctions"])(Ce,oe);for(const lt in Ce)Ce[lt]=new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["N"](Ce[lt]);const Ve=function(){};Ve.prototype=Ce;const Ge=function(){};function ze(e,t,n){const r={};e||(e={}),n||(n={}),r._SymbolsMap={},r.textformatting=1,r.infinity=1,r.pi=1;for(const o in t)r[o]=1;for(const o in n)r[o]=1;for(const o in e)r[o]=1;return r}function qe(e,t,o){const a=o?new Ge:new Ve;e||(e={}),t||(t={});const l=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]({newline:"\n",tab:"\t",singlequote:"'",doublequote:'"',forwardslash:"/",backwardslash:"\\"});l.immutable=!1,a._SymbolsMap={textformatting:1,infinity:1,pi:1},a.textformatting=l,a.infinity=Number.POSITIVE_INFINITY,a.pi=Math.PI;for(const n in t)a[n]=t[n],a._SymbolsMap[n]=1;for(const n in e)a._SymbolsMap[n]=1,e[n]&&"esri.Graphic"===e[n].declaredClass?a[n]=_Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"].createFromGraphic(e[n]):a[n]=e[n];return a}Ge.prototype=Ye;const Je={fixSpatialReference:_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["r"],parseArguments:re,standardFunction:oe};function Ze(e,t){const n={mode:t,compiled:!0,functions:{},signatures:[],failDefferred:ae,standardFunction:oe,standardFunctionAsync:oe,evaluateIdentifier:et};for(let r=0;r<e.length;r++)e[r].registerFunctions(n);if("sync"===t){for(const e in n.functions)Ce[e]=new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["N"](n.functions[e]),Ve.prototype[e]=Ce[e];for(let e=0;e<n.signatures.length;e++)Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["addFunctionDeclaration"])(n.signatures[e],"sync")}else{for(const e in n.functions)Ye[e]=new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["N"](n.functions[e]),Ge.prototype[e]=Ye[e];for(let e=0;e<n.signatures.length;e++)Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["addFunctionDeclaration"])(n.signatures[e],"async")}}function He(e,t){return e(t)}function We(e,t){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["findFieldLiterals"])(e)}function Ke(e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["findExpectedFieldLiterals"])(e)}function Xe(e,t){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["validateScript"])(e,t,"sync")}function Qe(e,t){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["referencesMember"])(e,t)}function $e(e,t){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["referencesFunction"])(e,t)}function et(e,t){const n=t.name;if("_SymbolsMap"===n)throw"Illegal";if(e.localStack.length>0){if("_t"!==n.substr(0,2).toLowerCase()&&void 0!==e.localStack[e.localStack.length-1][n])return e.localStack[e.localStack.length-1][n];const t=e.mangleMap[n];if(void 0!==t&&void 0!==e.localStack[e.localStack.length-1][t])return e.localStack[e.localStack.length-1][t]}if("_t"!==n.substr(0,2).toLowerCase()&&void 0!==e.globalScope[n])return e.globalScope[n];if(1===e.globalScope._SymbolsMap[n])return e.globalScope[n];const r=e.mangleMap[n];return void 0!==r?e.globalScope[r]:void 0}let tt=0;const nt={error(e,t,n){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])(e,t,n))},__awaiter:(e,t,n,r)=>Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["create"])(((n,o)=>{function a(e){try{s(r.next(e))}catch(t){o(t)}}function l(e){try{s(r.throw(e))}catch(t){o(t)}}function s(e){e.done?n(e.value):e.value&&e.value.then?e.value.then(a,l):(tt++,tt%100==0?setTimeout((()=>{tt=0,a(e.value)}),0):a(e.value))}s((r=r.apply(e,t||[])).next())})),functionDepthchecker:(e,t)=>function(){if(t.depthCounter++,t.localStack.push([]),t.depthCounter>64)throw new Error("Exceeded maximum function depth");const n=e.apply(this,arguments);return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_15__["isPromiseLike"])(n)?n.then((e=>(t.depthCounter--,t.localStack.length=t.localStack.length-1,e))):(t.depthCounter--,t.localStack.length=t.localStack.length-1,n)},castString:e=>Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(e),aCheck(e,t){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["c"])(e))throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:t},"RUNTIME","FUNCTIONCONTEXTILLEGAL"));return e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]?null:e},Dictionary:_Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"],Feature:_Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"],dictionary(e){const t={};for(let n=0;n<e.length;n+=2){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["c"])(e[n+1]))throw new Error("Illegal Argument");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(e[n]))throw new Error("Illegal Argument");e[n+1]===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]?t[e[n].toString()]=null:t[e[n].toString()]=e[n+1]}const r=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"](t);return r.immutable=!1,r},strCheck(e){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(e))throw new Error("Illegal Argument");return e},unary(e,t){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(e)){if("!"===t)return!e;if("-"===t)return-1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);if("+"===t)return 1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);if("~"===t)return~Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"UnaryExpression",operator:t,prefix:null,argument:null},"RUNTIME","NOTSUPPORTEDUNARYOPERATOR"))}if("-"===t)return-1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);if("+"===t)return 1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);if("~"===t)return~Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"UnaryExpression",operator:t,prefix:null,argument:null},"RUNTIME","NOTSUPPORTEDUNARYOPERATOR"))},logicalCheck(e){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(e)){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"LogicalExpression",operator:null,left:null,right:null},"RUNTIME","ONLYORORAND"))}return e},logical(e,t,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(e)&&Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["i"])(t))switch(n){case"||":return e||t;case"&&":return e&&t;default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"LogicalExpression",operator:null,left:null,right:null},"RUNTIME","ONLYORORAND"))}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"LogicalExpression",operator:null,left:null,right:null},"RUNTIME","ONLYORORAND"))},binary(e,t,n){switch(n){case"|":case"<<":case">>":case">>>":case"^":case"&":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["h"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t),n);case"==":case"=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["e"])(e,t);case"!=":return!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["e"])(e,t);case"<":case">":case"<=":case">=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["g"])(e,t,n);case"+":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(e)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t)?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(e)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(t):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t);case"-":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e)-Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t);case"*":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e)*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t);case"/":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e)/Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t);case"%":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e)%Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(t);default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"BinaryExpression",operator:n,left:e,right:t},"RUNTIME","OPERATORNOTRECOGNISED"))}},assign(e,t,n){switch(t){case"=":return e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]?null:e;case"/=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n)/Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);case"*=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n)*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);case"-=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n)-Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);case"+=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(e)?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(n)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["d"])(e):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);case"%=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(n)%Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e);default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"AssignmentExpression",operator:t,left:null,right:null},"RUNTIME","OPERATORNOTRECOGNISED"))}},update(e,t,n,r){const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e[t]);return e[t]="++"===n?o+1:o-1,!1===r?o:"++"===n?o+1:o-1},graphicToFeature:(e,t)=>null===e?null:_Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"].createFromGraphicLikeObject(e.geometry,e.attributes,t),memberupdate(e,t,o,a){let l;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(e)){if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(t))throw new Error("Invalid Parameter");if(t<0&&(t=e.length+t),t<0||t>=e.length)throw new Error("Assignment outside of array bounds");l=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e[t]),e[t]="++"===o?l+1:l-1}else if(e instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))throw new Error("Dictionary accessor must be a string");if(!0!==e.hasField(t))throw new Error("Invalid Parameter");l=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e.field(t)),e.setField(t,"++"===o?l+1:l-1)}else{if(!(e instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]))throw Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(e)?new Error("Array is Immutable"):new Error("Invalid Parameter");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))throw new Error("Feature accessor must be a string");if(!0!==e.hasField(t))throw new Error("Invalid Parameter");l=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["t"])(e.field(t)),e.setField(t,"++"===o?l+1:l-1)}return!1===a?l:"++"===o?l+1:l-1},assignmember(e,t,o,a){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(e)){if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(t))throw new Error("Invalid Parameter");if(t<0&&(t=e.length+t),t<0||t>e.length)throw new Error("Assignment outside of array bounds");if(t===e.length){if("="!==o)throw new Error("Invalid Parameter");e[t]=this.assign(a,o,e[t])}else e[t]=this.assign(a,o,e[t])}else if(e instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))throw new Error("Dictionary accessor must be a string");if(!0===e.hasField(t))e.setField(t,this.assign(a,o,e.field(t)));else{if("="!==o)throw new Error("Invalid Parameter");e.setField(t,this.assign(a,o,null))}}else{if(!(e instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]))throw Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(e)?new Error("Array is Immutable"):new Error("Invalid Parameter");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))throw new Error("Feature accessor must be a string");if(!0===e.hasField(t))e.setField(t,this.assign(a,o,e.field(t)));else{if("="!==o)throw new Error("Invalid Parameter");e.setField(t,this.assign(a,o,null))}}},member(e,t){if(null===e){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","NOTFOUND"))}if(e instanceof _views_2d_layers_features_support_FeatureSetReader_js__WEBPACK_IMPORTED_MODULE_23__["FeatureSetReader"]){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))return e.field(t);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}if(e instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]||e instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))return e.field(t);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}if(e instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_17__["default"]){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(t))return Ne(e,t,"MemberExpression");throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["a"])(e)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(t)&&isFinite(t)&&Math.floor(t)===t){if(t<0&&(t=e.length+t),t>=e.length||t<0){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","OUTOFBOUNDS"))}return e[t]}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["f"])(e)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(t)&&isFinite(t)&&Math.floor(t)===t){if(t<0&&(t=e.length+t),t>=e.length||t<0){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","OUTOFBOUNDS"))}return e[t]}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["b"])(e)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["j"])(t)&&isFinite(t)&&Math.floor(t)===t){if(t<0&&(t=e.length()+t),t>=e.length()||t<0){throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","OUTOFBOUNDS"))}return e.get(t)}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_7__["nodeErrorMessage"])({type:"MemberExpression",object:null,property:null,computed:null},"RUNTIME","INVALIDTYPE"))},callfunc(e,t,n){return e instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["N"]?e.fn(n,t):e instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["S"]?e.fn.apply(this,t):e.apply(this,t)}};function rt(e){console.log(e)}function ot(e,t=null,n=!1){null===t&&(t={vars:{},customfunctions:{}});const r={isAsync:n,globalScope:ze(t.vars,n?Ye:Ce,t.customfunctions),localScope:null,mangleMap:{},console:rt,lrucache:t.lrucache,interceptor:t.interceptor,services:t.services,symbols:{symbolCounter:0}};let o=le(r,e.body[0].body);""===o&&(o="lc.voidOperation; ");let a="";a=n?"var runtimeCtx=this.prepare(context, true);\n var lc = this.lc;  var lang = this.lang; var gscope=runtimeCtx.globalScope; \nreturn lang.__awaiter(this, void 0, void 0, function* () {\n\n function mainBody() {\n var lastStatement=lc.voidOperation;\n return lang.__awaiter(this, void 0, void 0, function* () {\n"+o+"\n return lastStatement; }); } \n return this.postProcess(yield mainBody()); }); ":"var runtimeCtx=this.prepare(context, false);\n var lc = this.lc;  var lang = this.lang; var gscope=runtimeCtx.globalScope; \n function mainBody() {\n var lastStatement=lc.voidOperation;\n "+o+"\n return lastStatement; } \n return this.postProcess(mainBody()); ";const l={lc:_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["l"],lang:nt,mangles:r.mangleMap,postProcess(e){if(e instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["R"]&&(e=e.value),e instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["I"]&&(e=e.value),e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["v"]&&(e=null),e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["k"])throw new Error("Cannot return BREAK");if(e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["m"])throw new Error("Cannot return CONTINUE");if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_6__["c"])(e))throw new Error("Cannot return FUNCTION");return e},prepare(e,t){let n=e.spatialReference;null==n&&(n=new _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_22__["default"]({wkid:102100}));const r=qe(e.vars,e.customfunctions,t);return{localStack:[],isAsync:t,mangleMap:this.mangles,spatialReference:n,globalScope:r,abortSignal:void 0===e.abortSignal||null===e.abortSignal?{aborted:!1}:e.abortSignal,localScope:null,services:e.services,console:e.console?e.console:rt,lrucache:e.lrucache,interceptor:e.interceptor,symbols:{symbolCounter:0},depthCounter:1}}};return new Function("context","spatialReference",a).bind(l)}function at(){return Promise.all(/*! import() */[__webpack_require__.e(10), __webpack_require__.e(24), __webpack_require__.e(56)]).then(__webpack_require__.bind(null, /*! ./functions/geomasync.js */ "../node_modules/@arcgis/core/arcade/functions/geomasync.js")).then((e=>(Ze([e],"async"),!0)))}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/arcadeRuntime.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/arcadeRuntime.js ***!
  \************************************************************/
/*! exports provided: executeScript, extend, extractExpectedFieldLiterals, extractFieldLiterals, findFunctionCalls, functionHelper, referencesFunction, referencesMember, validateScript */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeScript", function() { return Ve; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return ke; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractExpectedFieldLiterals", function() { return Ye; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractFieldLiterals", function() { return Be; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findFunctionCalls", function() { return Ze; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "functionHelper", function() { return je; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesFunction", function() { return qe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesMember", function() { return ze; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateScript", function() { return Ge; });
/* harmony import */ var _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ArcadePortal.js */ "../node_modules/@arcgis/core/arcade/ArcadePortal.js");
/* harmony import */ var _Attachment_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Attachment.js */ "../node_modules/@arcgis/core/arcade/Attachment.js");
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _Feature_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Feature.js */ "../node_modules/@arcgis/core/arcade/Feature.js");
/* harmony import */ var _FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./FunctionWrapper.js */ "../node_modules/@arcgis/core/arcade/FunctionWrapper.js");
/* harmony import */ var _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ImmutablePathArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePathArray.js");
/* harmony import */ var _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ImmutablePointArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./treeAnalysis.js */ "../node_modules/@arcgis/core/arcade/treeAnalysis.js");
/* harmony import */ var _functions_array_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./functions/array.js */ "../node_modules/@arcgis/core/arcade/functions/array.js");
/* harmony import */ var _functions_date_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./functions/date.js */ "../node_modules/@arcgis/core/arcade/functions/date.js");
/* harmony import */ var _functions_geometry_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./functions/geometry.js */ "../node_modules/@arcgis/core/arcade/functions/geometry.js");
/* harmony import */ var _functions_geomsync_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./functions/geomsync.js */ "../node_modules/@arcgis/core/arcade/functions/geomsync.js");
/* harmony import */ var _functions_maths_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./functions/maths.js */ "../node_modules/@arcgis/core/arcade/functions/maths.js");
/* harmony import */ var _functions_stats_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./functions/stats.js */ "../node_modules/@arcgis/core/arcade/functions/stats.js");
/* harmony import */ var _functions_string_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./functions/string.js */ "../node_modules/@arcgis/core/arcade/functions/string.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function J(e,r){const t=[];for(let n=0;n<r.arguments.length;n++)t.push($(e,r.arguments[n]));return t}function Q(e,r,t){try{return t(e,r,J(e,r))}catch(n){throw n}}function $(e,r){try{switch(r.type){case"EmptyStatement":return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];case"VariableDeclarator":return we(e,r);case"VariableDeclaration":return he(e,r);case"BlockStatement":return ue(e,r);case"FunctionDeclaration":return pe(e,r);case"ReturnStatement":return fe(e,r);case"IfStatement":return ce(e,r);case"ExpressionStatement":return le(e,r);case"AssignmentExpression":return se(e,r);case"UpdateExpression":return ae(e,r);case"BreakStatement":return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"];case"ContinueStatement":return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["m"];case"TemplateElement":return ve(e,r);case"TemplateLiteral":return Te(e,r);case"ForStatement":return ne(e,r);case"ForInStatement":return te(e,r);case"Identifier":return Re(e,r);case"MemberExpression":return de(e,r);case"Literal":return r.value;case"CallExpression":return Oe(e,r);case"UnaryExpression":return ge(e,r);case"BinaryExpression":return Ie(e,r);case"LogicalExpression":return ye(e,r);case"ArrayExpression":return Ne(e,r);case"ObjectExpression":return ee(e,r);case"Property":return re(e,r);default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","UNREOGNISED"))}}catch(t){throw t}}function ee(e,r){const n={};for(let t=0;t<r.properties.length;t++){const o=$(e,r.properties[t]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["c"])(o.value))throw new Error("Illegal Argument");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(o.key))throw new Error("Illegal Argument");o.value===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?n[o.key.toString()]=null:n[o.key.toString()]=o.value}const o=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"](n);return o.immutable=!1,o}function re(e,r){return{key:"Identifier"===r.key.type?r.key.name:$(e,r.key),value:$(e,r.value)}}function te(e,r){const o=$(e,r.right);"VariableDeclaration"===r.left.type&&$(e,r.left);let a=null,i="";if("VariableDeclaration"===r.left.type){const e=r.left.declarations[0].id;"Identifier"===e.type&&(i=e.name)}else"Identifier"===r.left.type&&(i=r.left.name);if(!i)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDVARIABLE"));if(i=i.toLowerCase(),null!==e.localScope&&void 0!==e.localScope[i]&&(a=e.localScope[i]),null===a&&void 0!==e.globalScope[i]&&(a=e.globalScope[i]),null===a)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","VARIABLENOTDECLARED"));if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(o)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(o)){const t=o.length;for(let n=0;n<t;n++){a.value=n;const t=$(e,r.body);if(t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"])break;if(t instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"])return t}return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(o)){for(let t=0;t<o.length();t++){a.value=t;const n=$(e,r.body);if(n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"])break;if(n instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"])return n}return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}if(!(o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]||o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]))return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];{const t=o.keys();for(let n=0;n<t.length;n++){a.value=t[n];const o=$(e,r.body);if(o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"])break;if(o instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"])return o}}}function ne(e,r){null!==r.init&&$(e,r.init);const t={testResult:!0,lastAction:_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]};do{oe(e,r,t)}while(!0===t.testResult);return t.lastAction instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"]?t.lastAction:_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}function oe(e,r,t){if(null!==r.test){if(t.testResult=$(e,r.test),!1===t.testResult)return;if(!0!==t.testResult)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","CANNOT_USE_NONBOOLEAN_IN_CONDITION"))}t.lastAction=$(e,r.body),t.lastAction!==_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"]?t.lastAction instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"]?t.testResult=!1:null!==r.update&&$(e,r.update):t.testResult=!1}function ae(e,r){let o,a=null,i="";if("MemberExpression"===r.argument.type){if(a=$(e,r.argument.object),!0===r.argument.computed?i=$(e,r.argument.property):"Identifier"===r.argument.property.type&&(i=r.argument.property.name),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(a)){if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(i))throw new Error("Invalid Parameter");if(i<0&&(i=a.length+i),i<0||i>=a.length)throw new Error("Assignment outside of array bounds");o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(a[i]),a[i]="++"===r.operator?o+1:o-1}else if(a instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(i))throw new Error("Dictionary accessor must be a string");if(!0!==a.hasField(i))throw new Error("Invalid Parameter");o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(a.field(i)),a.setField(i,"++"===r.operator?o+1:o-1)}else{if(!(a instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]))throw Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(a)?new Error("Array is Immutable"):new Error("Invalid Parameter");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(i))throw new Error("Feature accessor must be a string");if(!0!==a.hasField(i))throw new Error("Invalid Parameter");o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(a.field(i)),a.setField(i,"++"===r.operator?o+1:o-1)}return!1===r.prefix?o:"++"===r.operator?o+1:o-1}if(a="Identifier"===r.argument.type?r.argument.name.toLowerCase():"",!a)throw new Error("Invalid identifier");if(null!==e.localScope&&void 0!==e.localScope[a])return o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e.localScope[a].value),e.localScope[a]={value:"++"===r.operator?o+1:o-1,valueset:!0,node:r},!1===r.prefix?o:"++"===r.operator?o+1:o-1;if(void 0!==e.globalScope[a])return o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e.globalScope[a].value),e.globalScope[a]={value:"++"===r.operator?o+1:o-1,valueset:!0,node:r},!1===r.prefix?o:"++"===r.operator?o+1:o-1;throw new Error("Variable not recognised")}function ie(e,r,t,n){switch(r){case"=":return e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?null:e;case"/=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t)/Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e);case"*=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t)*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e);case"-=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t)-Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e);case"+=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(t)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(e)?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(t)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(e):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e);case"%=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t)%Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(e);default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(n,"RUNTIME","OPERATORNOTRECOGNISED"))}}function se(e,r){const o=$(e,r.right);let a=null,i="";if("MemberExpression"===r.left.type){if(a=$(e,r.left.object),!0===r.left.computed?i=$(e,r.left.property):"Identifier"===r.left.property.type&&(i=r.left.property.name),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(a)){if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(i))throw new Error("Invalid Parameter");if(i<0&&(i=a.length+i),i<0||i>a.length)throw new Error("Assignment outside of array bounds");if(i===a.length){if("="!==r.operator)throw new Error("Invalid Parameter");a[i]=ie(o,r.operator,a[i],r)}else a[i]=ie(o,r.operator,a[i],r)}else if(a instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(i))throw new Error("Dictionary accessor must be a string");if(!0===a.hasField(i))a.setField(i,ie(o,r.operator,a.field(i),r));else{if("="!==r.operator)throw new Error("Invalid Parameter");a.setField(i,ie(o,r.operator,null,r))}}else{if(!(a instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]))throw Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(a)?new Error("Array is Immutable"):new Error("Invalid Parameter");if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(i))throw new Error("Feature accessor must be a string");if(!0===a.hasField(i))a.setField(i,ie(o,r.operator,a.field(i),r));else{if("="!==r.operator)throw new Error("Invalid Parameter");a.setField(i,ie(o,r.operator,null,r))}}return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}if(a=r.left.name.toLowerCase(),null!==e.localScope&&void 0!==e.localScope[a])return e.localScope[a]={value:ie(o,r.operator,e.localScope[a].value,r),valueset:!0,node:r.right},_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];if(void 0!==e.globalScope[a])return e.globalScope[a]={value:ie(o,r.operator,e.globalScope[a].value,r),valueset:!0,node:r.right},_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];throw new Error("Variable not recognised")}function le(e,r){if("AssignmentExpression"===r.expression.type||"UpdateExpression"===r.expression.type)return $(e,r.expression);if("CallExpression"===r.expression.type){const t=$(e,r.expression);return t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]:new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["I"](t)}{const t=$(e,r.expression);return t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]:new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["I"](t)}}function ce(e,r){if("AssignmentExpression"===r.test.type||"UpdateExpression"===r.test.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r.test,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));const t=$(e,r.test);if(!0===t)return $(e,r.consequent);if(!1===t)return null!==r.alternate?$(e,r.alternate):_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","CANNOT_USE_NONBOOLEAN_IN_CONDITION"))}function ue(e,r){let t=_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"];for(let n=0;n<r.body.length;n++)if(t=$(e,r.body[n]),t instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"]||t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"]||t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["m"])return t;return t}function fe(e,r){if(null===r.argument)return new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"](_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]);const t=$(e,r.argument);return new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"](t)}function pe(e,r){const t=r.id.name.toLowerCase();return e.globalScope[t]={valueset:!0,node:null,value:new _FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_4__["default"](r,e)},_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}function he(e,r){for(let t=0;t<r.declarations.length;t++)$(e,r.declarations[t]);return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}function we(e,r){let t=null===r.init?null:$(e,r.init);if(t===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]&&(t=null),"Identifier"!==r.id.type)throw new Error("Can only assign a regular variable");const n=r.id.name.toLowerCase();return null!==e.localScope?e.localScope[n]={value:t,valueset:!0,node:r.init}:e.globalScope[n]={value:t,valueset:!0,node:r.init},_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]}let me=0;function Ee(e,r,n){let o;switch(r=r.toLowerCase()){case"hasz":{const r=e.hasZ;return void 0!==r&&r}case"hasm":{const r=e.hasM;return void 0!==r&&r}case"spatialreference":{let r=e.spatialReference._arcadeCacheId;if(void 0===r){let t=!0;Object.freeze&&Object.isFrozen(e.spatialReference)&&(t=!1),t&&(me++,e.spatialReference._arcadeCacheId=me,r=me)}const n=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]({wkt:e.spatialReference.wkt,wkid:e.spatialReference.wkid});return void 0!==r&&(n._arcadeCacheId="SPREF"+r.toString()),n}}switch(e.type){case"extent":switch(r){case"xmin":case"xmax":case"ymin":case"ymax":case"zmin":case"zmax":case"mmin":case"mmax":{const t=e[r];return void 0!==t?t:null}case"type":return"Extent"}break;case"polygon":switch(r){case"rings":o=e.cache._arcadeCacheId,void 0===o&&(me++,o=me,e.cache._arcadeCacheId=o);return new _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_5__["default"](e.rings,e.spatialReference,!0===e.hasZ,!0===e.hasM,o);case"type":return"Polygon"}break;case"point":switch(r){case"x":case"y":case"z":case"m":return void 0!==e[r]?e[r]:null;case"type":return"Point"}break;case"polyline":switch(r){case"paths":o=e.cache._arcadeCacheId,void 0===o&&(me++,o=me,e.cache._arcadeCacheId=o);return new _ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_5__["default"](e.paths,e.spatialReference,!0===e.hasZ,!0===e.hasM,o);case"type":return"Polyline"}break;case"multipoint":switch(r){case"points":o=e.cache._arcadeCacheId,void 0===o&&(me++,o=me,e.cache._arcadeCacheId=o);return new _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_6__["default"](e.points,e.spatialReference,!0===e.hasZ,!0===e.hasM,o,1);case"type":return"Multipoint"}}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(n,"RUNTIME","PROPERTYNOTFOUND"))}function de(e,r){try{const o=$(e,r.object);if(null===o)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTFOUND"));if(!1===r.computed){if("Identifier"===r.property.type){if(o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]||o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"])return o.field(r.property.name);if(o instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_17__["default"])return Ee(o,r.property.name,r)}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}{let a=$(e,r.property);if(o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]||o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(a))return o.field(a);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}if(o instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_17__["default"]){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(a))return Ee(o,a,r);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(o)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(a)&&isFinite(a)&&Math.floor(a)===a){if(a<0&&(a=o.length+a),a>=o.length||a<0)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","OUTOFBOUNDS"));return o[a]}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(o)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(a)&&isFinite(a)&&Math.floor(a)===a){if(a<0&&(a=o.length+a),a>=o.length||a<0)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","OUTOFBOUNDS"));return o[a]}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(o)){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(a)&&isFinite(a)&&Math.floor(a)===a){if(a<0&&(a=o.length()+a),a>=o.length()||a<0)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","OUTOFBOUNDS"));return o.get(a)}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","INVALIDTYPE"))}}catch(o){throw o}}function ge(e,r){try{const t=$(e,r.argument);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t)){if("!"===r.operator)return!t;if("-"===r.operator)return-1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);if("+"===r.operator)return 1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);if("~"===r.operator)return~Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTSUPPORTEDUNARYOPERATOR"))}if("~"===r.operator)return~Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);if("-"===r.operator)return-1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);if("+"===r.operator)return 1*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTSUPPORTEDUNARYOPERATOR"))}catch(t){throw t}}function Ne(e,r){try{const t=[];for(let n=0;n<r.elements.length;n++){const o=$(e,r.elements[n]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["c"])(o))throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","FUNCTIONCONTEXTILLEGAL"));o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?t.push(null):t.push(o)}return t}catch(t){throw t}}function Ie(e,r){try{const t=[$(e,r.left),$(e,r.right)],n=t[0],o=t[1];switch(r.operator){case"|":case"<<":case">>":case">>>":case"^":case"&":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["h"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o),r.operator);case"==":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["e"])(n,o);case"!=":return!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["e"])(n,o);case"<":case">":case"<=":case">=":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["g"])(n,o,r.operator);case"+":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(o)?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(n)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(o):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n)+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o);case"-":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n)-Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o);case"*":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n)*Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o);case"/":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n)/Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o);case"%":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(n)%Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(o);default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","OPERATORNOTRECOGNISED"))}}catch(t){throw t}}function ye(e,r){try{if("AssignmentExpression"===r.left.type||"UpdateExpression"===r.left.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r.left,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));if("AssignmentExpression"===r.right.type||"UpdateExpression"===r.right.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r.right,"RUNTIME","CANNOT_USE_ASSIGNMENT_IN_CONDITION"));const t=$(e,r.left);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t))switch(r.operator){case"||":if(!0===t)return t;{const t=$(e,r.right);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t))return t;throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","ONLYORORAND"))}case"&&":if(!1===t)return t;{const t=$(e,r.right);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t))return t;throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","ONLYORORAND"))}default:throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","ONLYORORAND"))}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","ONLYBOOLEAN"))}catch(t){throw t}}function ve(e,r){return r.value?r.value.cooked:""}function Te(e,r){let t="",n=0;for(const o of r.quasis)if(t+=o.value?o.value.cooked:"",!1===o.tail){t+=r.expressions[n]?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])($(e,r.expressions[n])):"",n++}return t}function Re(e,r){let t;try{const n=r.name.toLowerCase();if(null!==e.localScope&&void 0!==e.localScope[n])return t=e.localScope[n],!0===t.valueset||(t.value=$(e,t.node),t.valueset=!0),t.value;if(void 0!==e.globalScope[n])return t=e.globalScope[n],!0===t.valueset||(t.value=$(e,t.node),t.valueset=!0),t.value;throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","VARIABLENOTFOUND"))}catch(n){throw n}}function Oe(e,r){try{if("Identifier"!==r.callee.type)throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","ONLYNODESSUPPORTED"));if(null!==e.localScope&&void 0!==e.localScope[r.callee.name.toLowerCase()]){const t=e.localScope[r.callee.name.toLowerCase()];if(t.value instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"])return t.value.fn(e,r);if(t.value instanceof _FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_4__["default"])return xe(e,r,t.value.definition);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTAFUNCTION"))}if(void 0!==e.globalScope[r.callee.name.toLowerCase()]){const t=e.globalScope[r.callee.name.toLowerCase()];if(t.value instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"])return t.value.fn(e,r);if(t.value instanceof _FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_4__["default"])return xe(e,r,t.value.definition);throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTAFUNCTION"))}throw new Error(Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["nodeErrorMessage"])(r,"RUNTIME","NOTFOUND"))}catch(t){throw t}}const Se={};function be(o){return null==o?"":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(o)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(o)?"Array":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["n"])(o)?"Date":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["f"])(o)?"String":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(o)?"Boolean":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["j"])(o)?"Number":o instanceof _Attachment_js__WEBPACK_IMPORTED_MODULE_1__["default"]?"Attachment":o instanceof _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__["default"]?"Portal":o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]?"Dictionary":o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]?"Feature":o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_19__["default"]?"Point":o instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_20__["default"]?"Polygon":o instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_21__["default"]?"Polyline":o instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_18__["default"]?"Multipoint":o instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_16__["default"]?"Extent":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["c"])(o)?"Function":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["o"])(o)?"FeatureSet":Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["q"])(o)?"FeatureSetCollection":o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?"":"number"==typeof o&&isNaN(o)?"Number":"Unrecognised Type"}function Ue(e,r,t,n){try{const o=$(e,r.arguments[t]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["e"])(o,n))return $(e,r.arguments[t+1]);{const o=r.arguments.length-t;return 1===o?$(e,r.arguments[t]):2===o?null:3===o?$(e,r.arguments[t+2]):Ue(e,r,t+2,n)}}catch(o){throw o}}function Ae(e,r,t,n){try{if(!0===n)return $(e,r.arguments[t+1]);if(3===r.arguments.length-t)return $(e,r.arguments[t+2]);{const n=$(e,r.arguments[t+2]);if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(n))throw new Error("WHEN needs boolean test conditions");return Ae(e,r,t+2,n)}}catch(o){throw o}}function Ce(e,r){const t=e.length,n=Math.floor(t/2);return 0===t?[]:1===t?[e[0]]:Fe(Ce(e.slice(0,n),r),Ce(e.slice(n,t),r),r)}function Fe(e,r,t){const n=[];for(;e.length>0||r.length>0;)if(e.length>0&&r.length>0){let o=t(e[0],r[0]);isNaN(o)&&(o=0),o<=0?(n.push(e[0]),e=e.slice(1)):(n.push(r[0]),r=r.slice(1))}else e.length>0?(n.push(e[0]),e=e.slice(1)):r.length>0&&(n.push(r[0]),r=r.slice(1));return n}function Me(e,r,t){try{const n=e.body;if(t.length!==e.params.length)throw new Error("Invalid Parameter calls to function.");for(let a=0;a<t.length;a++)r.localScope[e.params[a].name.toLowerCase()]={value:t[a],valueset:!0,node:null};const o=$(r,n);if(o instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"])return o.value;if(o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"])throw new Error("Cannot Break from a Function");if(o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["m"])throw new Error("Cannot Continue from a Function");return o instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["I"]?o.value:o}catch(n){throw n}}function xe(e,r,t){return Q(e,r,(function(r,n,o){const a={spatialReference:e.spatialReference,globalScope:e.globalScope,depthCounter:e.depthCounter+1,console:e.console,lrucache:e.lrucache,interceptor:e.interceptor,localScope:{}};if(a.depthCounter>64)throw new Error("Exceeded maximum function depth");return Me(t,a,o)}))}function Pe(e){const r=function(){const r={spatialReference:e.context.spatialReference,console:e.context.console,lrucache:e.context.lrucache,interceptor:e.context.interceptor,localScope:{},depthCounter:e.context.depthCounter+1,globalScope:e.context.globalScope};if(r.depthCounter>64)throw new Error("Exceeded maximum function depth");return Me(e.definition,r,arguments)};return r}Object(_functions_array_js__WEBPACK_IMPORTED_MODULE_9__["registerFunctions"])(Se,Q),Object(_functions_date_js__WEBPACK_IMPORTED_MODULE_10__["registerFunctions"])(Se,Q),Object(_functions_string_js__WEBPACK_IMPORTED_MODULE_15__["registerFunctions"])(Se,Q),Object(_functions_maths_js__WEBPACK_IMPORTED_MODULE_13__["registerFunctions"])(Se,Q),Object(_functions_geometry_js__WEBPACK_IMPORTED_MODULE_11__["registerFunctions"])(Se,Q),Object(_functions_stats_js__WEBPACK_IMPORTED_MODULE_14__["registerFunctions"])(Se,Q),Object(_functions_geomsync_js__WEBPACK_IMPORTED_MODULE_12__["registerFunctions"])(Se,Q),Se.typeof=function(e,r){return Q(e,r,(function(e,r,t){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["p"])(t,1,1);const n=be(t[0]);if("Unrecognised Type"===n)throw new Error("Unrecognised Type");return n}))},Se.iif=function(e,r){try{Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["p"])(null===r.arguments?[]:r.arguments,3,3);const t=$(e,r.arguments[0]);if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t))throw new Error("IF Function must have a boolean test condition");const n=$(e,r.arguments[1]),o=$(e,r.arguments[2]);return!0===t?n:o}catch(t){throw t}},Se.decode=function(e,r){try{if(r.arguments.length<2)throw new Error("Missing Parameters");if(2===r.arguments.length)return $(e,r.arguments[1]);{if((r.arguments.length-1)%2==0)throw new Error("Must have a default value result.");const t=$(e,r.arguments[0]);return Ue(e,r,1,t)}}catch(t){throw t}},Se.when=function(e,r){try{if(r.arguments.length<3)throw new Error("Missing Parameters");if(r.arguments.length%2==0)throw new Error("Must have a default value result.");const t=$(e,r.arguments[0]);if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["i"])(t))throw new Error("WHEN needs boolean test conditions");return Ae(e,r,0,t)}catch(t){throw t}},Se.top=function(e,r){return Q(e,r,(function(e,r,t){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["p"])(t,2,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(t[0]))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t[1])>=t[0].length?t[0].slice(0):t[0].slice(0,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t[1]));if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(t[0]))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t[1])>=t[0].length()?t[0].slice(0):t[0].slice(0,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["t"])(t[1]));throw new Error("Top cannot accept this parameter type")}))},Se.first=function(e,r){return Q(e,r,(function(e,r,t){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["p"])(t,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(t[0])?0===t[0].length?null:t[0][0]:Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(t[0])?0===t[0].length()?null:t[0].get(0):null}))},Se.sort=function(e,r){return Q(e,r,(function(e,r,t){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["p"])(t,1,2);let n=t[0];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["b"])(n)&&(n=n.toArray()),!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["a"])(n))throw new Error("Illegal Argument");if(t.length>1){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["c"])(t[1]))throw new Error("Illegal Argument");let e=n;const r=Pe(t[1]);return e=Ce(e,(function(e,t){return r(e,t)})),e}{let e=n;if(0===e.length)return[];const r={};for(let n=0;n<e.length;n++){const t=be(e[n]);""!==t&&(r[t]=!0)}if(!0===r.Array||!0===r.Dictionary||!0===r.Feature||!0===r.Point||!0===r.Polygon||!0===r.Polyline||!0===r.Multipoint||!0===r.Extent||!0===r.Function)return e.slice(0);let t=0,o="";for(const n in r)t++,o=n;return e=t>1||"String"===o?Ce(e,(function(e,r){if(null==e||e===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"])return null==r||r===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]?0:1;if(null==r||r===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"])return-1;const t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(e),n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["d"])(r);return t<n?-1:t===n?0:1})):"Number"===o?Ce(e,(function(e,r){return e-r})):"Boolean"===o?Ce(e,(function(e,r){return e===r?0:r?-1:1})):"Date"===o?Ce(e,(function(e,r){return r-e})):e.slice(0),e}}))};for(const He in Se)Se[He]={value:new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"](Se[He]),valueset:!0,node:null};const De=function(){};function Le(e,r){const o=new De;e||(e={}),r||(r={});const a=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]({newline:"\n",tab:"\t",singlequote:"'",doublequote:'"',forwardslash:"/",backwardslash:"\\"});a.immutable=!1,o.textformatting={value:a,valueset:!0,node:null};for(const t in r)o[t]={value:new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"](r[t]),native:!0,valueset:!0,node:null};for(const t in e)e[t]&&"esri.Graphic"===e[t].declaredClass?o[t]={value:_Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"].createFromGraphic(e[t]),valueset:!0,node:null}:o[t]={value:e[t],valueset:!0,node:null};return o}De.prototype=Se,De.prototype.infinity={value:Number.POSITIVE_INFINITY,valueset:!0,node:null},De.prototype.pi={value:Math.PI,valueset:!0,node:null};const je={fixSpatialReference:_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["r"],parseArguments:J,standardFunction:Q};function _e(e){console.log(e)}function ke(e){const r={mode:"sync",compiled:!1,functions:{},signatures:[],standardFunction:Q,evaluateIdentifier:Re,arcadeCustomFunctionHandler:Pe};for(let t=0;t<e.length;t++)e[t].registerFunctions(r);for(const t in r.functions)Se[t]={value:new _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"](r.functions[t]),valueset:!0,node:null},De.prototype[t]=Se[t];for(let t=0;t<r.signatures.length;t++)Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["addFunctionDeclaration"])(r.signatures[t],"async")}function Ve(e,r){let t=r.spatialReference;null==t&&(t=new _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_22__["default"]({wkid:102100}));let n=$({spatialReference:t,globalScope:Le(r.vars,r.customfunctions),localScope:null,console:r.console?r.console:_e,lrucache:r.lrucache,interceptor:r.interceptor,depthCounter:1},e.body[0].body);if(n instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["R"]&&(n=n.value),n instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["I"]&&(n=n.value),n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["v"]&&(n=null),n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["k"])throw new Error("Cannot return BREAK");if(n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["m"])throw new Error("Cannot return CONTINUE");if(n instanceof _FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_4__["default"])throw new Error("Cannot return FUNCTION");if(n instanceof _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_7__["N"])throw new Error("Cannot return FUNCTION");return n}function Be(e,r){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["findFieldLiterals"])(e)}function Ye(e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["findExpectedFieldLiterals"])(e)}function Ge(e,r){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["validateScript"])(e,r,"simple")}function ze(e,r){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["referencesMember"])(e,r)}function qe(e,r){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["referencesFunction"])(e,r)}function Ze(e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_8__["findFunctionCalls"])(e)}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/featureset/support/shared.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/featureset/support/shared.js ***!
  \************************************************************************/
/*! exports provided: FeatureServiceDatabaseType, IdState, callback, cloneAttributes, cloneField, convertLinearUnitsToCode, convertSquareUnitsToCode, defaultMaxRecords, equalityTest, errback, esriFieldToJson, extractServiceUrl, isArray, isBoolean, isDate, isNumber, isString, layerFieldEsriConstants, layerGeometryEsriConstants, layerGeometryEsriRestConstants, reduceArrayWithPromises, sameGeomType, shapeExtent, stableStringify, toEsriGeometryType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FeatureServiceDatabaseType", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IdState", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "callback", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneAttributes", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneField", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertLinearUnitsToCode", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertSquareUnitsToCode", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultMaxRecords", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equalityTest", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errback", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "esriFieldToJson", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractServiceUrl", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDate", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layerFieldEsriConstants", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layerGeometryEsriConstants", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layerGeometryEsriRestConstants", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reduceArrayWithPromises", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sameGeomType", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shapeExtent", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stableStringify", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toEsriGeometryType", function() { return x; });
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _layers_support_Field_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../layers/support/Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var o,l;function s(e){return _layers_support_Field_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(e.toJSON())}function y(e){return e.toJSON()}function u(e){return"string"==typeof e||e instanceof String}function p(e){return"boolean"==typeof e}function c(e){return"number"==typeof e}function a(e){return e instanceof Array}function m(e){return e instanceof Date}function f(e,r){return e===r||!(!m(e)||!m(r))&&e.getTime()===r.getTime()}function d(e){const r={};for(const t in e)r[t]=e[t];return r}function g(e){if(void 0===e)return null;if("number"==typeof e)return e;switch(e.toLowerCase()){case"meters":case"meter":return 109404;case"miles":case"mile":return 109413;case"kilometers":case"kilometer":case"km":return 109414}return null}function F(e){if(null===e)return null;switch(e.type){case"polygon":case"multipoint":case"polyline":return e.extent;case"point":return new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_1__["default"]({xmin:e.x,ymin:e.y,xmax:e.x,ymax:e.y,spatialReference:e.spatialReference});case"extent":return e}return null}function G(e){if(void 0===e)return null;if("number"==typeof e)return e;if("number"==typeof e)return e;switch(e.toLowerCase()){case"meters":case"meter":return 9001;case"miles":case"mile":return 9035;case"kilometers":case"kilometer":case"km":return 9036}return null}function T(e,r){return e===r||("point"===e&&"esriGeometryPoint"===r||("polyline"===e&&"esriGeometryPolyline"===r||("polygon"===e&&"esriGeometryPolygon"===r||("extent"===e&&"esriGeometryEnvelope"===r||("multipoint"===e&&"esriGeometryMultipoint"===r||("point"===r&&"esriGeometryPoint"===e||("polyline"===r&&"esriGeometryPolyline"===e||("polygon"===r&&"esriGeometryPolygon"===e||("extent"===r&&"esriGeometryEnvelope"===e||"multipoint"===r&&"esriGeometryMultipoint"===e)))))))))}!function(e){e[e.Standardised=0]="Standardised",e[e.StandardisedNoInterval=1]="StandardisedNoInterval",e[e.SqlServer=2]="SqlServer",e[e.Oracle=3]="Oracle",e[e.Postgres=4]="Postgres",e[e.PGDB=5]="PGDB",e[e.FILEGDB=6]="FILEGDB",e[e.NotEvaluated=7]="NotEvaluated"}(o||(o={})),function(e){e[e.InFeatureSet=0]="InFeatureSet",e[e.NotInFeatureSet=1]="NotInFeatureSet",e[e.Unknown=2]="Unknown"}(l||(l={}));const S=1e3;function v(e){return function(r){e.reject(r)}}function P(e,r){return function(){try{e.apply(null,arguments)}catch(t){r.reject(t)}}}const I={point:"point",polygon:"polygon",polyline:"polyline",multipoint:"multipoint",extent:"extent",esriGeometryPoint:"point",esriGeometryPolygon:"polygon",esriGeometryPolyline:"polyline",esriGeometryMultipoint:"multipoint",esriGeometryEnvelope:"extent",envelope:"extent"},b={point:"esriGeometryPoint",polygon:"esriGeometryPolygon",polyline:"esriGeometryPolyline",multipoint:"esriGeometryMultipoint",extent:"esriGeometryEnvelope",esriGeometryPoint:"esriGeometryPoint",esriGeometryPolygon:"esriGeometryPolygon",esriGeometryPolyline:"esriGeometryPolyline",esriGeometryMultipoint:"esriGeometryMultipoint",esriGeometryEnvelope:"esriGeometryEnvelope",envelope:"esriGeometryEnvelope"},D={"small-integer":"esriFieldTypeSmallInteger",integer:"esriFieldTypeInteger",long:"esriFieldTypeLong",single:"esriFieldTypeSingle",double:"esriFieldTypeDouble",string:"esriFieldTypeString",date:"esriFieldTypeDate",oid:"esriFieldTypeOID",geometry:"esriFieldTypeGeometry",blob:"esriFieldTypeBlob",raster:"esriFieldTypeRaster",guid:"esriFieldTypeGUID","global-id":"esriFieldTypeGlobalID",xml:"eesriFieldTypeXML",esriFieldTypeSmallInteger:"esriFieldTypeSmallInteger",esriFieldTypeInteger:"esriFieldTypeInteger",esriFieldTypeLong:"esriFieldTypeLong",esriFieldTypeSingle:"esriFieldTypeSingle",esriFieldTypeDouble:"esriFieldTypeDouble",esriFieldTypeString:"esriFieldTypeString",esriFieldTypeDate:"esriFieldTypeDate",esriFieldTypeOID:"esriFieldTypeOID",esriFieldTypeGeometry:"esriFieldTypeGeometry",esriFieldTypeBlob:"esriFieldTypeBlob",esriFieldTypeRaster:"esriFieldTypeRaster",esriFieldTypeGUID:"esriFieldTypeGUID",esriFieldTypeGlobalID:"esriFieldTypeGlobalID",esriFieldTypeXML:"eesriFieldTypeXML"};function x(e){switch(e){case"point":return"esriGeometryPoint";case"polygon":return"esriGeometryPolygon";case"multipoint":return"esriGeometryMultipoint";case"polyline":return"esriGeometryPolyline";default:return"esriGeometryPoint"}}function O(i,n){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_0__["create"])(((e,o)=>{const l=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_0__["resolve"])(!0);i.reduce(((e,r,i,o)=>e.then((e=>{try{return n(e,r,i,o)}catch(l){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_0__["reject"])(l)}}),(e=>Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_0__["reject"])(e)))),l).then(e,o)}))}function N(e){return void 0===e?"":e=(e=(e=e.replace(/\/featureserver\/[0-9]*/i,"/FeatureServer")).replace(/\/mapserver\/[0-9]*/i,"/MapServer")).split("?")[0]}function E(e,r){r||(r={}),"function"==typeof r&&(r={cmp:r});const t="boolean"==typeof r.cycles&&r.cycles,i=r.cmp&&(n=r.cmp,function(e){return function(r,t){const i={key:r,value:e[r]},o={key:t,value:e[t]};return n(i,o)}});var n;const o=[];return function e(r){if(r&&r.toJSON&&"function"==typeof r.toJSON&&(r=r.toJSON()),void 0===r)return;if("number"==typeof r)return isFinite(r)?""+r:"null";if("object"!=typeof r)return JSON.stringify(r);let n,l;if(Array.isArray(r)){for(l="[",n=0;n<r.length;n++)n&&(l+=","),l+=e(r[n])||"null";return l+"]"}if(null===r)return"null";if(-1!==o.indexOf(r)){if(t)return JSON.stringify("__cycle__");throw new TypeError("Converting circular structure to JSON")}const s=o.push(r)-1,y=Object.keys(r).sort(i&&i(r));for(l="",n=0;n<y.length;n++){const t=y[n],i=e(r[t]);i&&(l&&(l+=","),l+=JSON.stringify(t)+":"+i)}return o.splice(s,1),"{"+l+"}"}(e)}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/array.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/array.js ***!
  \**************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return h; });
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function h(h,l){h.array=function(i,o){return l(i,o,(function(i,o,a){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(a,1,2);const f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(a[0]);if(isNaN(f)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(f))throw new Error("Invalid Parameter");const h=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(a[1],null),l=new Array(f);return l.fill(h),l}))},h.front=function(n,t){return l(n,t,(function(n,t,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(e[0])){if(e[0].length()<=0)throw new Error("Array is empty");return e[0].get(0)}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(e[0])){if(e[0].length<=0)throw new Error("Array is empty");return e[0][0]}throw new Error("Invalid Parameter")}))},h.back=function(n,t){return l(n,t,(function(n,t,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(e[0])){if(e[0].length()<=0)throw new Error("Array is empty");return e[0].get(e[0].length()-1)}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(e[0])){if(e[0].length<=0)throw new Error("Array is empty");return e[0][e[0].length-1]}throw new Error("Invalid Parameter")}))},h.push=function(n,t){return l(n,t,(function(n,t,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(e,1,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(e[0]))return e[0][e[0].length]=e[1],e[0].length;throw new Error("Invalid Parameter")}))},h.pop=function(n,t){return l(n,t,(function(n,t,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(e[0])){if(e[0].length<=0)throw new Error("Array is empty");const r=e[0][e[0].length-1];return e[0].length=e[0].length-1,r}throw new Error("Invalid Parameter")}))},h.erase=function(e,i){return l(e,i,(function(e,i,f){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(f,2,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(f[0])){let r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(f[1]);if(isNaN(r)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(r))throw new Error("Invalid Parameter");const e=f[0];if(e.length<=0)throw new Error("Array is empty");if(r<0&&(r=e.length+r),r<0)throw new Error("Element not found");if(r>=e.length)throw new Error("Index is greater than array");return e.splice(r,1),_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"]}throw new Error("Invalid Parameter")}))},h.insert=function(e,i){return l(e,i,(function(e,i,f){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(f,3,3),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(f[0])){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(f[1]);if(isNaN(r)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(r))throw new Error("Invalid Parameter");const e=f[2],i=f[0];if(r>i.length)throw new Error("Index is greater than array");if(r<0&&r<-1*i.length)throw new Error("Index is greater than array");return r===i.length?(i[r]=e,_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"]):(i.splice(r,0,e),_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"])}throw new Error("Invalid Parameter")}))},h.resize=function(i,f){return l(i,f,(function(i,f,h){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(h,2,3),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(h[0])){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(h[1]);if(isNaN(r)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(r))throw new Error("Invalid Parameter");if(r<0)throw new Error("Size cannot be negative");const i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(h[2],null),o=h[0];if(o.length>=r)return o.length=r,_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"];const f=o.length;o.length=r;for(let n=f;n<o.length;n++)o[n]=i;return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"]}throw new Error("Invalid Parameter")}))},h.includes=function(n,t){return l(n,t,(function(n,t,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(e,2,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(e[0])){const r=e[1];return e[0].findIndex((n=>Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["e"])(n,r)))>-1}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(e[0])){const r=e[1];return e[0].toArray().findIndex((n=>Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["e"])(n,r)))>-1}throw new Error("Invalid Parameter")}))},h.slice=function(a,f){return l(a,f,(function(a,f,h){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(h,1,3),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(h[0])){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(h[1],0)),i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(h[2],h[0].length));if(isNaN(r)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(r))throw new Error("Invalid Parameter");if(isNaN(i)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(i))throw new Error("Invalid Parameter");return h[0].slice(r,i)}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(h[0])){const r=h[0],i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(h[1],0)),o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(h[2],r.length()));if(isNaN(i)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(i))throw new Error("Invalid Parameter");if(isNaN(o)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["B"])(o))throw new Error("Invalid Parameter");return r.toArray().slice(i,o)}throw new Error("Invalid Parameter")}))},h.splice=function(r,n){return l(r,n,(function(r,n,t){const e=[];for(let a=0;a<t.length;a++)Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(t[a])?e.push(...t[a]):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(t[a])?e.push(...t[a].toArray()):e.push(t[a]);return e}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/centroid.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/centroid.js ***!
  \*****************************************************************/
/*! exports provided: angle2D, angleBetween2D, angleBetweenRad, angleRad, bearing2D, bearingBetween2D, centroidMultiPoint, centroidPolyline, getMetersPerVerticalUnitForSR, pathsSelfIntersecting, segmentLength3d */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angle2D", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angleBetween2D", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angleBetweenRad", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "angleRad", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bearing2D", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bearingBetween2D", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "centroidMultiPoint", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "centroidPolyline", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMetersPerVerticalUnitForSR", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pathsSelfIntersecting", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "segmentLength3d", function() { return e; });
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_support_intersectsBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/support/intersectsBase.js */ "../node_modules/@arcgis/core/geometry/support/intersectsBase.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(t,n,e){return Math.sqrt((t[0]-n[0])**2+(t[1]-n[1])**2+(void 0!==t[2]&&void 0!==n[2]?(t[2]*e-n[2]*e)**2:0))}const r=[];for(const v of[[9002,56146130,6131,6132,8050,8051,8228],[9003,5702,6358,6359,6360,8052,8053],[9095,5754]]){const t=v[0];for(let n=1;n<v.length;n++)r[v[n]]=t}const o=[];function s(t){return t.vcsWkid&&void 0!==r[t.vcsWkid]?o[r[t.vcsWkid]]:t.latestVcsWkid&&void 0!==r[t.latestVcsWkid]?o[r[t.latestVcsWkid]]:1}function c(t,n,e){const r={x:0,y:0};n&&(r.z=0),e&&(r.m=0);let o=0,s=t[0];for(let c=0;c<t.length;c++){const a=t[c];if(!1===f(a,s)){const t=h(s,a,n),c=i(s,a,n,e);c.x*=t,c.y*=t,r.x+=c.x,r.y+=c.y,n&&(c.z*=t,r.z+=c.z),e&&(c.m*=t,r.m+=c.m),o+=t,s=a}}return o>0?(r.x/=o,r.y/=o,n&&(r.z/=o),e&&(r.m/=o)):(r.x=t[0][0],r.y=t[0][1],n&&(r.z=t[0][2]),e&&n?r.m=t[0][3]:e&&(r.m=t[0][2])),r}function i(t,n,e,r){const o={x:(t[0]+n[0])/2,y:(t[1]+n[1])/2};return e&&(o.z=(t[2]+n[2])/2),e&&r?o.m=(t[3]+n[3])/2:r&&(o.m=(t[2]+n[2])/2),o}function a(t,n){if(t.length<=1)return 0;let e=0;for(let r=1;r<t.length;r++)e+=h(t[r-1],t[r],n);return e}function h(t,n,e){const r=n[0]-t[0],o=n[1]-t[1];if(e){const t=n[2]-n[2];return Math.sqrt(r*r+o*o+t*t)}return Math.sqrt(r*r+o*o)}function f(t,n){if(t.length!==n.length)return!1;for(let e=0;e<t.length;e++)if(t[e]!==n[e])return!1;return!0}function l(n){const e={x:0,y:0,spatialReference:n.spatialReference.toJSON()},r={x:0,y:0,spatialReference:n.spatialReference.toJSON()};let o=0,s=0;for(let t=0;t<n.paths.length;t++){if(0===n.paths[t].length)continue;const i=a(n.paths[t],!0===n.hasZ);if(0===i){const r=c(n.paths[t],!0===n.hasZ,!0===n.hasM);e.x+=r.x,e.y+=r.y,!0===n.hasZ&&(e.z+=r.z),!0===n.hasM&&(e.m+=r.m),++o}else{const e=c(n.paths[t],!0===n.hasZ,!0===n.hasM);r.x+=e.x*i,r.y+=e.y*i,!0===n.hasZ&&(r.z+=e.z*i),!0===n.hasM&&(r.m+=e.m*i),s+=i}}return s>0?(r.x/=s,r.y/=s,!0===n.hasZ&&(r.z/=s),!0===n.hasM&&(r.m/=s),new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_0__["default"](r)):o>0?(e.x/=o,e.y/=o,!0===n.hasZ&&(r.z/=o),!0===n.hasM&&(e.m/=o),new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_0__["default"](e)):null}function u(n){if(0===n.points.length)return null;let e=0,r=0,o=0,s=0;for(let t=0;t<n.points.length;t++){const c=n.getPoint(t);!0===c.hasZ&&(o+=c.z),!0===c.hasM&&(s+=c.m),e+=c.x,r+=c.y,s+=c.m}const c={x:e/n.points.length,y:r/n.points.length,spatialReference:null};return c.spatialReference=n.spatialReference.toJSON(),!0===n.hasZ&&(c.z=o/n.points.length),!0===n.hasM&&(c.m=s/n.points.length),new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_0__["default"](c)}function y(t,n){return t.x*n.x+t.y*n.y}function x(t,n){return t.x*n.y-n.x*t.y}function m(t,n,e=0){for(;t<e;)t+=n;const r=e+n;for(;t>=r;)t-=n;return t}function g(t,n){return Math.atan2(n.y-t.y,n.x-t.x)}function p(t,n){return m(g(t,n),2*Math.PI)*(180/Math.PI)}function M(t,n){return m(Math.PI/2-g(t,n),2*Math.PI)*(180/Math.PI)}function z(t,n,e){const r={x:t.x-n.x,y:t.y-n.y},o={x:e.x-n.x,y:e.y-n.y};return Math.atan2(x(r,o),y(r,o))}function P(t,n,e){return m(z(t,n,e),2*Math.PI)*(180/Math.PI)}function d(t,n,e){return m(-1*z(t,n,e),2*Math.PI)*(180/Math.PI)}o[9002]=.3048,o[9003]=.3048006096012192,o[9095]=.3048007491;const I=[0,0];function Z(t){for(let e=0;e<t.length;e++){const r=t[e];for(let s=0;s<r.length-1;s++){const o=r[s],c=r[s+1];for(let r=e+1;r<t.length;r++)for(let e=0;e<t[r].length-1;e++){const s=t[r][e],i=t[r][e+1];if(Object(_geometry_support_intersectsBase_js__WEBPACK_IMPORTED_MODULE_1__["segmentIntersects"])(o,c,s,i,I)&&!(I[0]===o[0]&&I[1]===o[1]||I[0]===s[0]&&I[1]===s[1]||I[0]===c[0]&&I[1]===c[1]||I[0]===i[0]&&I[1]===i[1]))return!0}}const o=r.length;if(!(o<3))for(let t=0;t<=o-2;t++){const e=r[t],s=r[t+1];for(let c=t+2;c<=o-2;c++){const t=r[c],o=r[c+1];if(Object(_geometry_support_intersectsBase_js__WEBPACK_IMPORTED_MODULE_1__["segmentIntersects"])(e,s,t,o,I)&&!(I[0]===e[0]&&I[1]===e[1]||I[0]===t[0]&&I[1]===t[1]||I[0]===s[0]&&I[1]===s[1]||I[0]===o[0]&&I[1]===o[1]))return!0}}}return!1}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/convertdirection.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/convertdirection.js ***!
  \*************************************************************************/
/*! exports provided: convertDirection, preciseAdd, preciseDivide, preciseMinus, preciseMultiply */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertDirection", function() { return ce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "preciseAdd", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "preciseDivide", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "preciseMinus", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "preciseMultiply", function() { return _; });
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const c=e=>(t,r,n)=>(n=n||14,+e(t,r).toFixed(n)),o=(e,t)=>e+t,u=(e,t)=>e-t,d=(e,t)=>e*t,l=(e,t)=>e/t,h=(e,t,r)=>c(o)(e,t,r),m=(e,t,r)=>c(u)(e,t,r),_=(e,t,r)=>c(d)(e,t,r),f=(e,t,r)=>c(l)(e,t,r),g=360,w=400,E=2*Math.PI,D=3600,A=3240,p=60,S=60,R=180*D/Math.PI,T=g*p*S,M=90*D,v=180*D,F=270*D,I=String.fromCharCode(7501),U="°";function x(e){if(!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["f"])(e))throw new Error("Invalid Parameter");return e}function O(e,t){const r=10**t;return Math.round(e*r)/r}function G(e,t){return e%t}function N(e){const t=parseFloat(e.toString().replace(Math.trunc(e).toString(),"0"))*Math.sign(e);if(e<0){return{fraction:t,integer:Math.ceil(e)}}return{fraction:t,integer:Math.floor(e)}}function b(e,t){switch(e){case 0:return"SHORT"===t?"N":"North";case 1:return"SHORT"===t?"E":"East";case 2:return"SHORT"===t?"S":"South";case 3:return"SHORT"===t?"W":"West"}}function H(e,t,r){for(;e.length<r;)e=t+e;return e}function C(e,t){return e-Math.floor(e/t)*t}function y(e){switch(e){case 6:case 1:return g;case 4:return E;case 5:return w;case 2:return T;case 7:return p;case 8:return S;default:throw new Error("Unnexpected evaluations")}}function P(e){switch(e.toUpperCase().trim()){case"NORTH":case"NORTHAZIMUTH":case"NORTH AZIMUTH":return 1;case"POLAR":return 2;case"QUADRANT":return 3;case"SOUTH":case"SOUTHAZIMUTH":case"SOUTH AZIMUTH":return 4}throw new Error("Unsupported direction type")}function k(e){switch(e.toUpperCase().trim()){case"D":case"DD":case"DECIMALDEGREE":case"DECIMAL DEGREE":case"DEGREE":case"DECIMALDEGREES":case"DECIMAL DEGREES":case"DEGREES":return 1;case"DMS":case"DEGREESMINUTESSECONDS":case"DEGREES MINUTES SECONDS":return 3;case"R":case"RAD":case"RADS":case"RADIAN":case"RADIANS":return 4;case"G":case"GON":case"GONS":case"GRAD":case"GRADS":case"GRADIAN":case"GRADIANS":return 5}throw new Error("Unsupported units")}class L{constructor(e,t,r){this.m_degrees=e,this.m_minutes=t,this.m_seconds=r}get_field(e){switch(e){case 1:case 6:return this.m_degrees;case 7:return this.m_minutes;case 2:case 8:return this.m_seconds;default:throw new Error("Unnexpected evaluation")}}static seconds_to_DMS(e){const t=N(e).fraction;let r=N(e).integer;const n=Math.floor(r/D);r-=n*D;const s=Math.floor(r/S);return r-=s*S,new L(n,s,r+t)}static number_to_dms(e){const t=N(e).fraction,r=N(e).integer,n=_(N(100*t).fraction,100),s=N(100*t).integer;return new L(r,s,n)}format(e,t){let r=O(this.m_seconds,t),n=this.m_minutes,s=this.m_degrees;if(2===e||8===e)S<=r&&(r-=S,++n),p<=n&&(n=0,++s),g<=s&&(s=0);else if(7===e)r=0,n=30<=this.m_seconds?this.m_minutes+1:this.m_minutes,s=this.m_degrees,p<=n&&(n=0,++s),g<=s&&(s=0);else if(1===e||6===e){const e=f(this.m_seconds,D),t=f(this.m_minutes,p);s=Math.round(this.m_degrees+t+e),n=0,r=0}return new L(s,n,r)}static DMS_to_seconds(e,t,r){return e*D+t*S+r}}class z{constructor(e,t,r){this.meridian=e,this.angle=t,this.direction=r}fetch_azimuth(e){return 0===e?this.meridian:this.direction}}class q{constructor(e){this.m_angle=e}static createFromAngleAndDirection(e,t){return new q(new Z(q.convertDirectionFormat(e.extract_angular_units(2),t,1)))}getAngle(e){const t=this.m_angle.extract_angular_units(2);switch(e){case 1:case 4:case 2:return new Z(q.convertDirectionFormat(t,1,e));case 3:{const e=q.seconds_north_azimuth_to_quadrant(t);return new Z(e.angle)}}}getMeridian(e){const t=this.m_angle.extract_angular_units(2);switch(e){case 1:return 0;case 4:return 2;case 2:return 1;case 3:return q.seconds_north_azimuth_to_quadrant(t).meridian}}getDirection(e){const t=this.m_angle.extract_angular_units(2);switch(e){case 1:return 1;case 4:return 3;case 2:return 0;case 3:return q.seconds_north_azimuth_to_quadrant(t).direction}}static seconds_north_azimuth_to_quadrant(e){const t=e<=M||e>=F?0:2,r=0===t?Math.min(T-e,e):Math.abs(e-v);return new z(t,r,e>v?3:1)}static createFromAngleMeridianAndDirection(e,t,r){return new q(new Z(q.secondsQuadrantToNorthAzimuth(e.extract_angular_units(2),t,r)))}static secondsQuadrantToNorthAzimuth(e,t,r){return 0===t?1===r?e:T-e:1===r?v-e:v+e}static convertDirectionFormat(e,t,r){let n=0;switch(t){case 1:n=e;break;case 2:n=M-e;break;case 3:throw new Error("Unnexpected evaluation");case 4:n=e+v}let s=0;switch(r){case 1:s=n;break;case 2:s=M-n;break;case 3:throw new Error("Unnexpected evaluation");case 4:s=n-v}return s=G(s,T),s<0?T+s:s}}function W(e,t,r){let n=null;switch(t){case 1:n=_(e,D);break;case 2:n=e;break;case 5:n=_(e,A);break;case 4:n=_(e,R);break;default:throw new Error("Unnexpected evaluation")}switch(r){case 1:return f(n,D);case 2:return n;case 5:return f(n,A);case 4:return n/R;default:throw new Error("Unnexpected evaluation")}}class Z{constructor(e){this.m_seconds=e}static createFromAngleAndUnits(e,t){return new Z(W(e,t,2))}extract_angular_units(e){return W(this.m_seconds,2,j(e))}static createFromDegreesMinutesSeconds(e,t,r){return new Z(h(h(_(e,D),_(t,S)),r))}}function j(e){switch(e){case 1:case 6:case 3:return 1;case 5:return 5;case 7:return 7;case 4:return 4;case 2:case 8:return 2}}class B{constructor(e,t,r,n){this.m_view=e,this.m_angle=t,this.m_merdian=r,this.m_direction=n,this.m_dms=null,this.m_formatted_dms=null}static createFromStringAndBearing(e,t,r){return new B(e,t.getAngle(r),t.getMeridian(r),t.getDirection(r))}fetch_angle(){return this.m_angle}fetch_meridian(){return this.m_merdian}fetch_direction(){return this.m_direction}fetch_m_view(){return this.m_view}fetch_dms(){return null===this.m_dms&&this.calculate_dms(),this.m_dms}fetch_formatted_dms(){return null===this.m_formatted_dms&&this.calculate_dms(),this.m_formatted_dms}calculate_dms(){let e=null,t=6,r=0;for(let n=0;n<this.m_view.length;n++){const s=this.m_view[n];switch(s){case"m":e=se(this.m_view,n,s),t=6===t?7:t,n=e.newpos;continue;case"s":e=se(this.m_view,n,s),t=8,r=r<e.rounding?e.rounding:r,n=e.newpos;continue;default:continue}}this.m_dms=L.seconds_to_DMS(this.m_angle.extract_angular_units(2)),this.m_formatted_dms=L.seconds_to_DMS(this.m_angle.extract_angular_units(2)).format(t,r)}}function Q(e,t,r,n,s){let i=null;switch(t){case 1:case 4:case 5:return i=C(O(e.extract_angular_units(t),n),y(t)),H(i.toFixed(n),"0",r+n+(n>0?1:0));case 6:case 7:return i=C(s.fetch_formatted_dms().get_field(t),y(t)),H(i.toFixed(n),"0",r+n+(n>0?1:0));case 8:return i=C(O(s.fetch_dms().get_field(t),n),y(t)),H(i.toFixed(n),"0",r+n+(n>0?1:0));default:throw new Error("Unnexepected evaluation")}}function X(e,t,r){if(3===r)throw new Error("Conversion error");if(3===t){const t=L.number_to_dms(e);return q.createFromAngleAndDirection(Z.createFromDegreesMinutesSeconds(t.m_degrees,t.m_minutes,t.m_seconds),r)}return q.createFromAngleAndDirection(Z.createFromAngleAndUnits(e,j(t)),r)}function V(e){switch(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["t"])(e)){case 1:return{first:0,second:1};case 2:return{first:2,second:1};case 3:return{first:2,second:3};case 4:return{first:0,second:3}}return null}function J(e){switch(e.toUpperCase().trim()){case"N":case"NORTH":return 0;case"E":case"EAST":return 1;case"S":case"SOUTH":return 2;case"W":case"WEST":return 3}return null}function K(e){const t=parseFloat(e);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["j"])(t)){if(isNaN(t))throw new Error("Invalid conversion");return t}throw new Error("Invalid conversion")}function Y(e,r,n){const s=3===n;let i=null,a=null,c=0,o=0,u=0;if(s){if(e.length<2)throw new Error("Conversion Error");u=1;const r=V(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(e[e.length-1]));if(r?(i=r.first,a=r.second):(c=1,i=J(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(e[0])),a=J(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(e[e.length-1]))),null===i||null===a)throw new Error("Invalid Conversion")}switch(r){case 1:case 4:case 5:if(0===e.length)throw new Error("Invalid Conversion");return s?q.createFromAngleMeridianAndDirection(Z.createFromAngleAndUnits(K(e[c]),j(r)),i,a):q.createFromAngleAndDirection(Z.createFromAngleAndUnits(K(e[c]),j(r)),n);case 3:if(o=e.length-u-c,3===o){const t=Z.createFromDegreesMinutesSeconds(K(e[c]),K(e[c+1]),K(e[c+2]));return s?q.createFromAngleMeridianAndDirection(t,i,a):q.createFromAngleAndDirection(t,n)}if(1===o){const t=K(e[c]),r=L.number_to_dms(t),o=Z.createFromDegreesMinutesSeconds(r.m_degrees,r.m_minutes,r.m_seconds);return s?q.createFromAngleMeridianAndDirection(o,i,a):q.createFromAngleAndDirection(o,n)}}throw new Error("Conversion Error")}function $(e){const t=[" ","-","/","'",'"',"\\","^",U,I,"\t","\r","\n","*"];let r="";for(let n=0;n<e.length;n++){const s=e.charAt(n);-1!==t.indexOf(s)?r+="RRSPLITRRSPLITRR":r+=s}return r.split("RRSPLITRRSPLITRR").filter((e=>""!==e))}function ee(e,t,c){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["j"])(e))return X(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["t"])(e),t,c);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["f"])(e))return Y($(e),t,c);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["a"])(e))return Y(e,t,c);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["b"])(e))return Y(e.toArray(),t,c);throw new Error("Conversion Error")}function te(e,t,r){const n=j(r);if(n&&3!==r){return e.getAngle(t).extract_angular_units(n)}throw new Error("Conversion Error")}function re(e,t,r){const n=e.getAngle(t);if(3===t&&3===r){const r=L.seconds_to_DMS(n.extract_angular_units(2));return[b(e.getMeridian(t),"SHORT"),r.m_degrees,r.m_minutes,r.m_seconds,b(e.getDirection(t),"SHORT")]}if(3===r){const e=L.seconds_to_DMS(n.extract_angular_units(2));return[e.m_degrees,e.m_minutes,e.m_seconds]}return 3===t?[b(e.getMeridian(t),"SHORT"),n.extract_angular_units(r),b(e.getDirection(t),"SHORT")]:[n.extract_angular_units(r)]}function ne(e,t){let r="";switch(e){case 1:r=3===t?"DD.DD"+U:"DDD.DD"+U;break;case 3:r=3===t?"dd"+U+" mm' ss\"":"ddd"+U+" mm' ss.ss\"";break;case 4:r="R.RR";break;case 5:r="GGG.GG"+I;break;default:throw new Error("Conversion error")}return 3===t&&(r="p "+r+" b"),r}function se(e,t,r){const n={padding:0,rounding:0,newpos:t};let s=!1;for(;t<e.length;){const i=e[t];if(i===r)s?n.rounding++:n.padding++,t++;else{if("."!==i)break;s=!0,t++}}return n.newpos=t-1,n}function ie(e,t,r){const n={escaped:"",newpos:t};for(t++;t<e.length;){const r=e[t];if(t++,"]"===r)break;n.escaped+=r}return n.newpos=t-1,n}function ae(e,t,r){let n="",s=null,i=null;const a=B.createFromStringAndBearing(t,e,r),c={D:1,d:6,m:7,s:8,R:4,G:5};for(let o=0;o<t.length;o++){const u=t[o];switch(u){case"[":s=ie(t,o),n+=s.escaped,o=s.newpos;continue;case"D":case"d":case"m":case"s":case"R":case"G":s=se(t,o,u),i=e.getAngle(r),n+=Q(i,c[u],s.padding,s.rounding,a),o=s.newpos;continue;case"P":case"p":n+=b(a.fetch_meridian(),"p"===u?"SHORT":"LONG");continue;case"B":case"b":n+=b(a.fetch_direction(),"b"===u?"SHORT":"LONG");continue;default:n+=u}}return n}function ce(r,n,s){if(!(n instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Invalid Parameter");if(!1===n.hasField("directionType"))throw new Error("Invalid Parameter - Missing directionType");if(!1===n.hasField("angleType"))throw new Error("Invalid Parameter - Missing directionType");const i=P(x(n.field("directiontype"))),a=ee(r,k(x(n.field("angletype"))),i);if(!(s instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Invalid Parameter");if(!1===s.hasField("directionType"))throw new Error("Invalid Parameter - Missing directionType");if(!1===s.hasField("outputType"))throw new Error("Invalid Parameter - Missing directionType");const c=P(x(s.field("directiontype"))),o=s.hasField("angleType")?k(x(s.field("angletype"))):null,u=x(s.field("outputType")).toUpperCase().trim();if(!c||!u)throw new Error("Conversion error");if(!(o||"TEXT"===u&&s.hasField("format")))throw new Error("Invalid unit");switch(u){case"VALUE":return 3===c||3===o?re(a,c,o):te(a,c,o);case"TEXT":{let e="";return s.hasField("format")&&(e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_1__["d"])(s.field("format"))),null!==e&&""!==e||(e=ne(o,c)),ae(a,e,c)}default:throw new Error("Invalid Parameter")}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/date.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/date.js ***!
  \*************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return y; });
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/* harmony import */ var luxon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! luxon */ "../node_modules/luxon/src/luxon.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function f(e){const n=new Date(e.getTime()),t=n.getFullYear(),r=new Date(0);r.setFullYear(t+1,0,4),r.setHours(0,0,0,0);const s=d(r),u=new Date(0);u.setFullYear(t,0,4),u.setHours(0,0,0,0);const o=d(u);return n.getTime()>=s.getTime()?t+1:n.getTime()>=o.getTime()?t:t-1}function d(e){const n=1,t=new Date(e.getTime()),r=t.getDay(),s=(r<n?7:0)+r-n;return t.setDate(t.getDate()-s),t.setHours(0,0,0,0),t}function g(e){const n=f(e),t=new Date(0);t.setFullYear(n,0,4),t.setHours(0,0,0,0);return d(t)}function m(e,n,t){return e+(h(t)?D:N)[n]}function h(e){return e%4==0&&(e%100!=0||e%400==0)}const N=[0,31,59,90,120,151,181,212,243,273,304,334],D=[0,31,60,91,121,152,182,213,244,274,305,335];function w(e){return null===e?e:isNaN(e.getTime())?null:e}function y(h,N){h.today=function(n,t){return N(n,t,(function(n,t,r){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(r,0,0);const s=new Date;return s.setHours(0,0,0,0),s}))},h.now=function(n,t){return N(n,t,(function(n,t,r){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(r,0,0);return new Date}))},h.timestamp=function(n,t){return N(n,t,(function(n,t,r){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(r,0,0);let s=new Date;return s=new Date(s.getUTCFullYear(),s.getUTCMonth(),s.getUTCDate(),s.getUTCHours(),s.getUTCMinutes(),s.getUTCSeconds(),s.getUTCMilliseconds()),s}))},h.toutc=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?null:new Date(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate(),u.getUTCHours(),u.getUTCMinutes(),u.getUTCSeconds(),u.getUTCMilliseconds())}))},h.tolocal=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?null:luxon__WEBPACK_IMPORTED_MODULE_2__["DateTime"].utc(u.getFullYear(),u.getMonth()+1,u.getDate(),u.getHours(),u.getMinutes(),u.getSeconds(),u.getMilliseconds()).toJSDate()}))},h.day=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getDate()}))},h.month=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getMonth()}))},h.year=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getFullYear()}))},h.hour=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getHours()}))},h.second=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getSeconds()}))},h.millisecond=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getMilliseconds()}))},h.minute=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getMinutes()}))},h.week=function(s,u){return N(s,u,(function(s,u,o){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(o,1,2);const a=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(o[0]);if(null===a)return NaN;const c=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["C"])(o[1],0));if(c<0||c>6)throw new Error("Invalid Parameter");const i=a.getDate(),l=a.getMonth(),f=a.getFullYear(),d=a.getDay(),g=m(i,l,f)-1,h=Math.floor(g/7);return d-c+(d-c<0?7:0)<g-7*h?h+1:h}))},h.weekday=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getDay()}))},h.isoweekday=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);if(null===u)return NaN;let o=u.getDay();return 0===o&&(o=7),o}))},h.isomonth=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:u.getMonth()+1}))},h.isoweek=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);if(null===u)return NaN;const o=d(u).getTime()-g(u).getTime();return Math.round(o/6048e5)+1}))},h.isoyear=function(t,r){return N(t,r,(function(t,r,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(s,1,1);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(s[0]);return null===u?NaN:f(u)}))},h.date=function(r,a){return N(r,a,(function(r,a,c){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(c,0,7),3===c.length)return w(new Date(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[1]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[2]),0,0,0,0));if(4===c.length)return w(new Date(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[1]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[2]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[3]),0,0,0));if(5===c.length)return w(new Date(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[1]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[2]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[3]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[4]),0,0));if(6===c.length)return w(new Date(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[1]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[2]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[3]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[4]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[5]),0));if(7===c.length)return w(new Date(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[1]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[2]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[3]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[4]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[5]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[6])));if(2===c.length){let e,n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["d"])(c[1]);return""===n?null:(n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["D"])(n),e="X"===n?luxon__WEBPACK_IMPORTED_MODULE_2__["DateTime"].fromSeconds(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0])):"x"===n?luxon__WEBPACK_IMPORTED_MODULE_2__["DateTime"].fromMillis(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0])):luxon__WEBPACK_IMPORTED_MODULE_2__["DateTime"].fromFormat(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["d"])(c[0]),n,{locale:Object(_intl_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])(),numberingSystem:"latn"}),e.isValid?e.toJSDate():null)}if(1===c.length){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["f"])(c[0])){if(""===c[0].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,""))return null;if(!0===/^[0-9][0-9][0-9][0-9]$/.test(c[0]))return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(c[0]+"-01-01")}const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(c[0]);if(!1===isNaN(e))return w(new Date(e));return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["w"])(c[0])}return 0===c.length?new Date:void 0}))},h.datediff=function(n,t){return N(n,t,(function(n,t,r){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(r,2,3);const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["E"])(r[0]),o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["E"])(r[1]);if(null===u||null===o)return NaN;switch(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["d"])(r[2]).toLowerCase()){case"days":case"day":case"d":return u.diff(o,"days").days;case"months":case"month":return u.diff(o,"months").months;case"minutes":case"minute":case"m":return"M"===r[2]?u.diff(o,"months").months:u.diff(o,"minutes").minutes;case"seconds":case"second":case"s":return u.diff(o,"seconds").seconds;case"milliseconds":case"millisecond":case"ms":return u.diff(o).milliseconds;case"hours":case"hour":case"h":return u.diff(o,"hours").hours;case"years":case"year":case"y":return u.diff(o,"years").years;default:return u.diff(o).milliseconds}}))},h.dateadd=function(n,r){return N(n,r,(function(n,r,u){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,2,3);const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["E"])(u[0]);if(null===o)return null;let i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]);if(isNaN(i))return o.toJSDate();let l="milliseconds";switch(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["d"])(u[2]).toLowerCase()){case"days":case"day":case"d":l="days",i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["F"])(i);break;case"months":case"month":l="months",i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["F"])(i);break;case"minutes":case"minute":case"m":l="M"===u[2]?"months":"minutes";break;case"seconds":case"second":case"s":l="seconds";break;case"milliseconds":case"millisecond":case"ms":l="milliseconds";break;case"hours":case"hour":case"h":l="hours";break;case"years":case"year":case"y":l="years"}return o.plus({[l]:i}).toJSDate()}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/fieldStats.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/fieldStats.js ***!
  \*******************************************************************/
/*! exports provided: calculateStat, decodeStatType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateStat", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeStatType", function() { return o; });
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t/e.length}function c(e){const t=s(e);let n=0;for(let r=0;r<e.length;r++)n+=(t-e[r])**2;return n/e.length}function u(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n];return t}function i(e,s){const c=[],u={},i=[];for(let o=0;o<e.length;o++){if(void 0!==e[o]&&null!==e[o]&&e[o]!==_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["v"]){const t=e[o];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["j"])(t)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["f"])(t))void 0===u[t]&&(c.push(t),u[t]=1);else{let e=!1;for(let n=0;n<i.length;n++)!0===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["e"])(i[n],t)&&(e=!0);!1===e&&(i.push(t),c.push(t))}}if(c.length>=s&&-1!==s)return c}return c}function o(e){switch(e.toLowerCase()){case"distinct":return"distinct";case"avg":case"mean":return"avg";case"min":return"min";case"sum":return"sum";case"max":return"max";case"stdev":case"stddev":return"stddev";case"var":case"variance":return"var";case"count":return"count"}return""}function l(t,n,r=1e3){switch(t.toLowerCase()){case"distinct":return i(n,r);case"avg":case"mean":return s(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n));case"min":return Math.min.apply(Math,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n));case"sum":return u(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n));case"max":return Math.max.apply(Math,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n));case"stdev":case"stddev":return Math.sqrt(c(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n)));case"var":case"variance":return c(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["P"])(n));case"count":return n.length}return 0}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/geometry.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/geometry.js ***!
  \*****************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return P; });
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _Feature_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Feature.js */ "../node_modules/@arcgis/core/arcade/Feature.js");
/* harmony import */ var _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ImmutablePointArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _centroid_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./centroid.js */ "../node_modules/@arcgis/core/arcade/functions/centroid.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _geometry_support_coordsUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../geometry/support/coordsUtils.js */ "../node_modules/@arcgis/core/geometry/support/coordsUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function D(e){return e instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"]||"object"==typeof e&&"FeatureSetReader"===e.type}function P(P,M){P.ringisclockwise=function(e,r){return M(e,r,(function(e,r,a){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(a,1,1);let l=[],s=!1,f=!1;if(null===a[0])return!1;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["a"])(a[0])){for(const e of a[0]){if(!(e instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Invalid Argument");l.push(e.hasZ?e.hasM?[e.x,e.y,e.z,e.m]:[e.x,e.y,e.z]:[e.x,e.y])}l.length>0&&(s=a[0][0].hasZ,f=a[0][0].hasM)}else if(a[0]instanceof _ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])l=a[0]._elements,l.length>0&&(s=a[0]._hasZ,f=a[0]._hasM);else{if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["b"])(a[0]))throw new Error("Invalid Argument");for(const e of a[0].toArray()){if(!(e instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Invalid Argument");l.push(e.hasZ?e.hasM?[e.x,e.y,e.z,e.m]:[e.x,e.y,e.z]:[e.x,e.y])}l.length>0&&(s=a[0].get(0).hasZ,f=a[0].get(0).hasM)}return!(l.length<3)&&Object(_geometry_support_coordsUtils_js__WEBPACK_IMPORTED_MODULE_12__["isClockwise"])(l,f,s)}))},P.polygon=function(n,i){return M(n,i,(function(i,o,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(s,1,1);let f=null;if(s[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]){if(f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(s[0]),n.spatialReference),f instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]==!1)throw new Error("Illegal Parameter")}else f=s[0]instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(s[0].toJSON()):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(new _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"](JSON.parse(s[0])),n.spatialReference);if(null!==f&&!1===f.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(f)}))},P.polyline=function(n,i){return M(n,i,(function(i,o,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(s,1,1);let f=null;if(s[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]){if(f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(s[0]),n.spatialReference),f instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]==!1)throw new Error("Illegal Parameter")}else f=s[0]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(s[0].toJSON()):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(new _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"](JSON.parse(s[0])),n.spatialReference);if(null!==f&&!1===f.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(f)}))},P.point=function(n,i){return M(n,i,(function(i,o,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(s,1,1);let f=null;if(s[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]){if(f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(s[0]),n.spatialReference),f instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]==!1)throw new Error("Illegal Parameter")}else f=s[0]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(s[0].toJSON()):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"](JSON.parse(s[0])),n.spatialReference);if(null!==f&&!1===f.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(f)}))},P.multipoint=function(n,i){return M(n,i,(function(i,o,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(s,1,1);let f=null;if(s[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]){if(f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(s[0]),n.spatialReference),f instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]==!1)throw new Error("Illegal Parameter")}else f=s[0]instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(s[0].toJSON()):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(new _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"](JSON.parse(s[0])),n.spatialReference);if(null!==f&&!1===f.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(f)}))},P.extent=function(n,i){return M(n,i,(function(i,o,f){f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["H"])(f),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(f,1,1);let c=null;if(f[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"])c=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(f[0]),n.spatialReference);else if(f[0]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]){const e={xmin:f[0].x,ymin:f[0].y,xmax:f[0].x,ymax:f[0].y,spatialReference:f[0].spatialReference.toJSON()},r=f[0];r.hasZ?(e.zmin=r.z,e.zmax=r.z):r.hasM&&(e.mmin=r.m,e.mmax=r.m),c=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(e)}else c=f[0]instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]||f[0]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]||f[0]instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(f[0].extent.toJSON()):f[0]instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"]?Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(f[0].toJSON()):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"](JSON.parse(f[0])),n.spatialReference);if(null!==c&&!1===c.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(c)}))},P.geometry=function(n,i){return M(n,i,(function(i,o,s){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(s,1,1);let f=null;if(f=D(s[0])?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(s[0].geometry(),n.spatialReference):s[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(s[0]),n.spatialReference):Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_11__["fromJSON"])(JSON.parse(s[0])),n.spatialReference),null!==f&&!1===f.spatialReference.equals(n.spatialReference))throw new Error("Cannot create Geometry in this SpatialReference. Engine is using a different spatial reference.");return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["G"])(f)}))},P.setgeometry=function(e,r){return M(e,r,(function(e,r,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(n,2,2),!D(n[0]))throw new Error("Illegal Argument");if(!0===n[0].immutable)throw new Error("Feature is Immutable");if(!(n[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]||null===n[1]))throw new Error("Illegal Argument");return n[0]._geometry=n[1],_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["v"]}))},P.feature=function(n,t){return M(n,t,(function(t,i,o){if(0===o.length)throw new Error("Missing Parameters");let l=null;if(1===o.length)if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["f"])(o[0]))l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromJson(JSON.parse(o[0]));else if(D(o[0]))l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].createFromArcadeFeature(o[0]);else if(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].createFromGraphicLikeObject(o[0],null,null);else{if(!(o[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Illegal Argument");{let n=o[0].hasField("geometry")?o[0].field("geometry"):null,t=o[0].hasField("attributes")?o[0].field("attributes"):null;null!==n&&n instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]&&(n=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(n)),null!==t&&(t=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseAttributesFromDictionary(t)),l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].createFromGraphicLikeObject(n,t,null)}}else if(2===o.length){let n=null,t=null;if(null!==o[0])if(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])n=o[0];else{if(!(n instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Illegal Argument");n=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(o[0])}if(null!==o[1]){if(!(o[1]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Illegal Argument");t=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseAttributesFromDictionary(o[1])}l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].createFromGraphicLikeObject(n,t,null)}else{let n=null;const t={};if(null!==o[0])if(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])n=o[0];else{if(!(n instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"]))throw new Error("Illegal Argument");n=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGeometryFromDictionary(o[0])}for(let e=1;e<o.length;e+=2){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["d"])(o[e]),n=o[e+1];if(!(null==n||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["f"])(n)||isNaN(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["n"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["j"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["i"])(n)))throw new Error("Illegal Argument");if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["c"])(n)||!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["x"])(n))throw new Error("Illegal Argument");t[r]=n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["v"]?null:n}l=_Feature_js__WEBPACK_IMPORTED_MODULE_1__["default"].createFromGraphicLikeObject(n,t,null)}return l._geometry=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["r"])(l.geometry(),n.spatialReference),l.immutable=!1,l}))},P.dictionary=function(r,n){return M(r,n,(function(r,n,t){if(0===t.length){const r=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"];return r.immutable=!1,r}if(1===t.length&&Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["f"])(t[0]))try{const r=JSON.parse(t[0]),n=_Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"].convertObjectToArcadeDictionary(r,!1);return n.immutable=!1,n}catch(s){throw new Error("Missing Parameters or Illegal Json")}if(t.length%2!=0)throw new Error("Missing Parameters");const a={};for(let e=0;e<t.length;e+=2){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["d"])(t[e]),n=t[e+1];if(!(null==n||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["f"])(n)||isNaN(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["n"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["j"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["i"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["a"])(n)||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["b"])(n)))throw new Error("Illegal Argument");if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["c"])(n))throw new Error("Illegal Argument");a[r]=n===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["v"]?null:n}const l=new _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"](a);return l.immutable=!1,l}))},P.haskey=function(r,n){return M(r,n,(function(r,n,i){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(i,2,2);const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["d"])(i[1]);if(D(i[0]))return i[0].hasField(o);if(i[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_0__["default"])return i[0].hasField(o);throw new Error("Illegal Argument")}))},P.indexof=function(e,r){return M(e,r,(function(e,r,n){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(n,2,2);const a=n[1];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["a"])(n[0])){for(let e=0;e<n[0].length;e++)if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["e"])(a,n[0][e]))return e;return-1}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["b"])(n[0])){const e=n[0].length();for(let r=0;r<e;r++)if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["e"])(a,n[0].get(r)))return r;return-1}throw new Error("Illegal Argument")}))},P.angle=function(e,r){return M(e,r,(function(e,r,n){if(n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["H"])(n),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(n,2,3),!(n[0]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");if(!(n[1]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");if(n.length>2&&!(n[2]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");return 2===n.length?Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["angle2D"])(n[0],n[1]):Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["angleBetween2D"])(n[0],n[1],n[2])}))},P.bearing=function(e,r){return M(e,r,(function(e,r,n){if(n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["H"])(n),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(n,2,3),!(n[0]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");if(!(n[1]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");if(n.length>2&&!(n[2]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");return 2===n.length?Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["bearing2D"])(n[0],n[1]):Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["bearingBetween2D"])(n[0],n[1],n[2])}))},P.isselfintersecting=function(e,r){return M(e,r,(function(r,n,a){a=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["H"])(a),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["p"])(a,1,1);let l=a[0];if(l instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"])return l.isSelfIntersecting;if(l instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"])return l=l.paths,Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["pathsSelfIntersecting"])(l);if(l instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]){const e=l.points;for(let r=0;r<e.length;r++)for(let n=0;n<e.length;n++)if(n!==r){let t=!0;for(let i=0;i<e[r].length;i++)if(e[r][i]!==e[n][i]){t=!1;break}if(!0===t)return!0}}return!(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["a"])(l)&&!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["b"])(l))&&(l=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_3__["J"])(l,e.spatialReference),null!==l&&(l=l.paths),Object(_centroid_js__WEBPACK_IMPORTED_MODULE_10__["pathsSelfIntersecting"])(l))}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/geomsync.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/geomsync.js ***!
  \*****************************************************************/
/*! exports provided: registerFunctions, setGeometryEngine */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setGeometryEngine", function() { return Z; });
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../kernel.js */ "../node_modules/@arcgis/core/kernel.js");
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../kernel.js */ "../node_modules/@arcgis/core/arcade/kernel.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _centroid_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./centroid.js */ "../node_modules/@arcgis/core/arcade/functions/centroid.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let M=null;function P(e){return 0===_kernel_js__WEBPACK_IMPORTED_MODULE_0__["version"].indexOf("4.")?_geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"].fromExtent(e):new _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]({spatialReference:e.spatialReference,rings:[[[e.xmin,e.ymin],[e.xmin,e.ymax],[e.xmax,e.ymax],[e.xmax,e.ymin],[e.xmin,e.ymin]]]})}function Z(n){M=n}function v(n,e){if("polygon"!==n.type&&"polyline"!==n.type&&"extent"!==n.type)return 0;let r=1;if(n.spatialReference.vcsWkid||n.spatialReference.latestVcsWkid){r=Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["getMetersPerVerticalUnitForSR"])(n.spatialReference)/Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_11__["getMetersPerUnitForSR"])(n.spatialReference)}let t=0;if("polyline"===n.type)for(const i of n.paths)for(let n=1;n<i.length;n++)t+=Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["segmentLength3d"])(i[n],i[n-1],r);else if("polygon"===n.type)for(const i of n.rings){for(let n=1;n<i.length;n++)t+=Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["segmentLength3d"])(i[n],i[n-1],r);(i[0][0]!==i[i.length-1][0]||i[0][1]!==i[i.length-1][1]||void 0!==i[0][2]&&i[0][2]!==i[i.length-1][2])&&(t+=Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["segmentLength3d"])(i[0],i[i.length-1],r))}else"extent"===n.type&&(t+=2*Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["segmentLength3d"])([n.xmin,n.ymin,0],[n.xmax,n.ymin,0],r),t+=2*Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["segmentLength3d"])([n.xmin,n.ymin,0],[n.xmin,n.ymax,0],r),t*=2,t+=4*Math.abs(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(n.zmax,0)*r-Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(n.zmin,0)*r));const l=new _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]({hasZ:!1,hasM:!1,spatialReference:n.spatialReference,paths:[[0,0],[0,t]]});return M.planarLength(l,e)}function z(n,I){function y(n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(n,2,2),n[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&n[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]);else if(n[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===n[1]);else if(n[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===n[0]);else if(null!==n[0]||null!==n[1])throw new Error("Illegal Argument")}n.disjoint=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null===r[0]||null===r[1]||M.disjoint(r[0],r[1])}))},n.intersects=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.intersects(r[0],r[1])}))},n.touches=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.touches(r[0],r[1])}))},n.crosses=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.crosses(r[0],r[1])}))},n.within=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.within(r[0],r[1])}))},n.contains=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.contains(r[0],r[1])}))},n.overlaps=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null!==r[0]&&null!==r[1]&&M.overlaps(r[0],r[1])}))},n.equals=function(n,e){return I(n,e,(function(n,e,r){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,2),r[0]===r[1]||(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&r[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]?M.equals(r[0],r[1]):!(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["n"])(r[0])||!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["n"])(r[1]))&&r[0].getTime()===r[1].getTime())}))},n.relate=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,3,3),r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&r[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])return M.relate(r[0],r[1],Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["d"])(r[2]));if(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===r[1])return!1;if(r[1]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]&&null===r[0])return!1;if(null===r[0]&&null===r[1])return!1;throw new Error("Illegal Argument")}))},n.intersection=function(n,e){return I(n,e,(function(n,e,r){return y(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r)),null===r[0]||null===r[1]?null:M.intersect(r[0],r[1])}))},n.union=function(n,r){return I(n,r,(function(r,t,i){const o=[];if(0===(i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(i)).length)throw new Error("Function called with wrong number of Parameters");if(1===i.length)if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(i[0])){const n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(i[0]);for(let e=0;e<n.length;e++)if(null!==n[e]){if(!(n[e]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");o.push(n[e])}}else{if(!Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(i[0])){if(i[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"])return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["r"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(i[0]),n.spatialReference);if(null===i[0])return null;throw new Error("Illegal Argument")}{const n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(i[0].toArray());for(let e=0;e<n.length;e++)if(null!==n[e]){if(!(n[e]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");o.push(n[e])}}}else for(let n=0;n<i.length;n++)if(null!==i[n]){if(!(i[n]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");o.push(i[n])}return 0===o.length?null:M.union(o)}))},n.difference=function(n,r){return I(n,r,(function(n,r,t){return y(t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(t)),null!==t[0]&&null===t[1]?Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(t[0]):null===t[0]?null:M.difference(t[0],t[1])}))},n.symmetricdifference=function(n,r){return I(n,r,(function(n,r,t){return y(t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(t)),null===t[0]&&null===t[1]?null:null===t[0]?Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(t[1]):null===t[1]?Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(t[0]):M.symmetricDifference(t[0],t[1])}))},n.clip=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,2),!(r[1]instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"])&&null!==r[1])throw new Error("Illegal Argument");if(null===r[0])return null;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return null===r[1]?null:M.clip(r[0],r[1])}))},n.cut=function(n,r){return I(n,r,(function(n,r,t){if(t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(t),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(t,2,2),!(t[1]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"])&&null!==t[1])throw new Error("Illegal Argument");if(null===t[0])return[];if(!(t[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return null===t[1]?[Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(t[0])]:M.cut(t[0],t[1])}))},n.area=function(n,e){return I(n,e,(function(e,t,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,2),null===(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o))[0])return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0])){const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["K"])(o[0],n.spatialReference);return null===e?0:M.planarArea(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertSquareUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.planarArea(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertSquareUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}))},n.areageodetic=function(n,e){return I(n,e,(function(e,t,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,2),null===(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o))[0])return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0])){const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["K"])(o[0],n.spatialReference);return null===e?0:M.geodesicArea(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertSquareUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.geodesicArea(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertSquareUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}))},n.length=function(n,e){return I(n,e,(function(e,r,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,2),null===(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o))[0])return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0])){const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["J"])(o[0],n.spatialReference);return null===e?0:M.planarLength(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.planarLength(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}))},n.length3d=function(n,e){return I(n,e,(function(e,r,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,2),null===(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o))[0])return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0])){const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["J"])(o[0],n.spatialReference);return null===e?0:!0===e.hasZ?v(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1))):M.planarLength(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return!0===o[0].hasZ?v(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1))):M.planarLength(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}))},n.lengthgeodetic=function(n,e){return I(n,e,(function(e,r,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,2),null===(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o))[0])return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0])){const e=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["J"])(o[0],n.spatialReference);return null===e?0:M.geodesicLength(e,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.geodesicLength(o[0],Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[1],-1)))}))},n.distance=function(n,e){return I(n,e,(function(e,r,o){o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,2,3);let u=o[0];(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0]))&&(u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["L"])(o[0],n.spatialReference));let s=o[1];if((Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[1])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[1]))&&(s=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["L"])(o[1],n.spatialReference)),!(u instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");if(!(s instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.distance(u,s,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[2],-1)))}))},n.distancegeodetic=function(n,e){return I(n,e,(function(n,e,r){r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,3);const o=r[0],u=r[1];if(!(o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");if(!(u instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]))throw new Error("Illegal Argument");const f=new _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]({paths:[],spatialReference:o.spatialReference});return f.addPath([o,u]),M.geodesicLength(f,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1)))}))},n.densify=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,3),null===r[0])return null;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(r[1]);if(isNaN(o))throw new Error("Illegal Argument");if(o<=0)throw new Error("Illegal Argument");return r[0]instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]||r[0]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]?M.densify(r[0],o,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1))):r[0]instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"]?M.densify(P(r[0]),o,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1))):r[0]}))},n.densifygeodetic=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,3),null===r[0])return null;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(r[1]);if(isNaN(o))throw new Error("Illegal Argument");if(o<=0)throw new Error("Illegal Argument");return r[0]instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]||r[0]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]?M.geodesicDensify(r[0],o,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1))):r[0]instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"]?M.geodesicDensify(P(r[0]),o,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1))):r[0]}))},n.generalize=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,4),null===r[0])return null;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(r[1]);if(isNaN(o))throw new Error("Illegal Argument");return M.generalize(r[0],o,Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["u"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],!0)),Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[3],-1)))}))},n.buffer=function(n,r){return I(n,r,(function(n,r,o){if(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,2,3),null===o[0])return null;if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(o[1]);if(isNaN(u))throw new Error("Illegal Argument");return 0===u?Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]):M.buffer(o[0],u,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[2],-1)))}))},n.buffergeodetic=function(n,r){return I(n,r,(function(n,r,o){if(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,2,3),null===o[0])return null;if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(o[1]);if(isNaN(u))throw new Error("Illegal Argument");return 0===u?Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]):M.geodesicBuffer(o[0],u,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(o[2],-1)))}))},n.offset=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,6),null===r[0])return null;if(!(r[0]instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]||r[0]instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]))throw new Error("Illegal Argument");const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(r[1]);if(isNaN(o))throw new Error("Illegal Argument");const f=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[4],10));if(isNaN(f))throw new Error("Illegal Argument");const a=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[5],0));if(isNaN(a))throw new Error("Illegal Argument");return M.offset(r[0],o,Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["convertLinearUnitsToCode"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],-1)),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["d"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[3],"round")).toLowerCase(),f,a)}))},n.rotate=function(n,e){return I(n,e,(function(n,e,r){r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,2,3);let t=r[0];if(null===t)return null;if(!(t instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");t instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"]&&(t=_geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"].fromExtent(t));const o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["t"])(r[1]);if(isNaN(o))throw new Error("Illegal Argument");const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["C"])(r[2],null);if(null===u)return M.rotate(t,o);if(u instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"])return M.rotate(t,o,u);throw new Error("Illegal Argument")}))},n.centroid=function(n,r){return I(n,r,(function(r,t,o){if(o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,1),null===o[0])return null;let u=o[0];if((Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["b"])(o[0]))&&(u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["L"])(o[0],n.spatialReference)),null===u)return null;if(!(u instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return u instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"]?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["r"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]),n.spatialReference):u instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]?u.centroid:u instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]?Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["centroidPolyline"])(u):u instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]?Object(_centroid_js__WEBPACK_IMPORTED_MODULE_3__["centroidMultiPoint"])(u):u instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"]?u.center:null}))},n.multiparttosinglepart=function(n,r){return I(n,r,(function(r,t,o){o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(o),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(o,1,1);const u=[];if(null===o[0])return null;if(!(o[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");if(o[0]instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_7__["default"])return[Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["r"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]),n.spatialReference)];if(o[0]instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_4__["default"])return[Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["r"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]),n.spatialReference)];const f=M.simplify(o[0]);if(f instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_8__["default"]){const n=[],e=[];for(let r=0;r<f.rings.length;r++)if(f.isClockwise(f.rings[r])){const e=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_10__["fromJSON"])({rings:[f.rings[r]],hasZ:!0===f.hasZ,hasM:!0===f.hasM,spatialReference:f.spatialReference.toJSON()});n.push(e)}else e.push({ring:f.rings[r],pt:f.getPoint(r,0)});for(let r=0;r<e.length;r++)for(let t=0;t<n.length;t++)if(n[t].contains(e[r].pt)){n[t].addRing(e[r].ring);break}return n}if(f instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_9__["default"]){const n=[];for(let e=0;e<f.paths.length;e++){const r=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_10__["fromJSON"])({paths:[f.paths[e]],hasZ:!0===f.hasZ,hasM:!0===f.hasM,spatialReference:f.spatialReference.toJSON()});n.push(r)}return n}if(o[0]instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_6__["default"]){const r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["r"])(Object(_kernel_js__WEBPACK_IMPORTED_MODULE_1__["cloneGeometry"])(o[0]),n.spatialReference);for(let n=0;n<r.points.length;n++)u.push(r.getPoint(n));return u}return null}))},n.issimple=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,1,1),null===r[0])return!0;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.isSimple(r[0])}))},n.simplify=function(n,e){return I(n,e,(function(n,e,r){if(r=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["H"])(r),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_2__["p"])(r,1,1),null===r[0])return null;if(!(r[0]instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_5__["default"]))throw new Error("Illegal Argument");return M.simplify(r[0])}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/hash.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/hash.js ***!
  \*************************************************************/
/*! exports provided: XXH */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "XXH", function() { return i; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=2654435761,s=2246822519,n=3266489917,e=668265263,r=374761393;function h(t){const s=[];for(let n=0,e=t.length;n<e;n++){let e=t.charCodeAt(n);e<128?s.push(e):e<2048?s.push(192|e>>6,128|63&e):e<55296||e>=57344?s.push(224|e>>12,128|e>>6&63,128|63&e):(n++,e=65536+((1023&e)<<10|1023&t.charCodeAt(n)),s.push(240|e>>18,128|e>>12&63,128|e>>6&63,128|63&e))}return new Uint8Array(s)}class i{constructor(t){this.seed=t,this.totallen=0,this.bufs=[],this.init()}init(){return this.bufs=[],this.totallen=0,this}updateFloatArray(t){const s=[];for(const n of t)isNaN(n)?s.push("NaN"):n===1/0?s.push("Infinity"):n===-1/0?s.push("-Infinity"):0===n?s.push("0"):s.push(n.toString(16));this.update(h(s.join("")))}updateIntArray(t){const s=Int32Array.from(t);this.update(new Uint8Array(s.buffer))}updateUint8Array(t){this.update(Uint8Array.from(t))}updateWithString(t){return this.update(h(t))}update(t){return this.bufs.push(t),this.totallen+=t.length,this}digest(){const t=new Uint8Array(this.totallen);let s=0;for(const n of this.bufs)t.set(n,s),s+=n.length;return this.init(),this.xxHash32(t,this.seed)}xxHash32(h,i=0){const o=h;let u=i+r&4294967295,a=0;if(o.length>=16){const n=[i+t+s&4294967295,i+s&4294967295,i+0&4294967295,i-t&4294967295],e=h,r=e.length-16;let o=0;for(a=0;(4294967280&a)<=r;a+=4){const r=a,h=e[r+0]+(e[r+1]<<8),i=e[r+2]+(e[r+3]<<8),u=h*s+(i*s<<16);let l=n[o]+u&4294967295;l=l<<13|l>>>19;const f=65535&l,p=l>>>16;n[o]=f*t+(p*t<<16)&4294967295,o=o+1&3}u=(n[0]<<1|n[0]>>>31)+(n[1]<<7|n[1]>>>25)+(n[2]<<12|n[2]>>>20)+(n[3]<<18|n[3]>>>14)&4294967295}u=u+h.length&4294967295;const l=h.length-4;for(;a<=l;a+=4){const t=a,s=o[t+0]+(o[t+1]<<8),r=o[t+2]+(o[t+3]<<8);u=u+(s*n+(r*n<<16))&4294967295,u=u<<17|u>>>15,u=(65535&u)*e+((u>>>16)*e<<16)&4294967295}for(;a<o.length;++a){u+=o[a]*r,u=u<<11|u>>>21,u=(65535&u)*t+((u>>>16)*t<<16)&4294967295}return u^=u>>>15,u=((65535&u)*s&4294967295)+((u>>>16)*s<<16),u^=u>>>13,u=((65535&u)*n&4294967295)+((u>>>16)*n<<16),u^=u>>>16,u<0?u+4294967296:u}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/maths.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/maths.js ***!
  \**************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return N; });
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _core_number_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/number.js */ "../node_modules/@arcgis/core/core/number.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function l(n,t,r){return void 0===r||0==+r?Math[n](t):(t=+t,r=+r,isNaN(t)||"number"!=typeof r||r%1!=0?NaN:(t=t.toString().split("e"),+((t=(t=Math[n](+(t[0]+"e"+(t[1]?+t[1]-r:-r)))).toString().split("e"))[0]+"e"+(t[1]?+t[1]+r:r))))}function N(N,h){function m(n,t,r){const u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(n);return isNaN(u)?u:isNaN(t)||isNaN(r)||t>r?NaN:u<t?t:u>r?r:u}N.number=function(f,a){return h(f,a,(function(f,a,c){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(c,1,2);const l=c[0];if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["j"])(l))return l;if(null===l)return 0;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["n"])(l))return Number(l);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["i"])(l))return Number(l);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(l))return NaN;if(""===l)return Number(l);if(void 0===l)return Number(l);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["f"])(l)){if(void 0!==c[1]){let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["M"])(c[1],"‰","");return n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["M"])(n,"¤",""),Object(_core_number_js__WEBPACK_IMPORTED_MODULE_1__["parse"])(l,{pattern:n})}return Number(l.trim())}return Number(l)}))},N.abs=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.abs(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.acos=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.acos(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.asin=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.asin(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.atan=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.atan(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.atan2=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,2,2),Math.atan2(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]))}))},N.ceil=function(t,r){return h(t,r,(function(t,r,u){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,2),2===u.length){let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]);return isNaN(n)&&(n=0),l("ceil",Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]),-1*n)}return Math.ceil(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.round=function(t,r){return h(t,r,(function(t,r,u){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,2),2===u.length){let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]);return isNaN(n)&&(n=0),l("round",Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]),-1*n)}return Math.round(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.floor=function(t,r){return h(t,r,(function(t,r,u){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,2),2===u.length){let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]);return isNaN(n)&&(n=0),l("floor",Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]),-1*n)}return Math.floor(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.cos=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.cos(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.isnan=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),"number"==typeof u[0]&&isNaN(u[0])}))},N.exp=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.exp(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.log=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.log(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.pow=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,2,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0])**Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1])}))},N.random=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,0,0),Math.random()}))},N.sin=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.sin(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.sqrt=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.sqrt(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.tan=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),Math.tan(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[0]))}))},N.defaultvalue=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,2,2),null===u[0]||""===u[0]||void 0===u[0]?u[1]:u[0]}))},N.isempty=function(t,r){return h(t,r,(function(t,r,u){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1),null===u[0]||(""===u[0]||void 0===u[0])}))},N.boolean=function(t,r){return h(t,r,(function(t,r,u){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,1,1);const e=u[0];return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["u"])(e)}))},N.constrain=function(t,r){return h(t,r,(function(t,r,u){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(u,3,3);const i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[1]),o=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["t"])(u[2]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(u[0])){const n=[];for(const t of u[0])n.push(m(t,i,o));return n}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(u[0])){const n=[];for(let t=0;t<u[0].length();t++)n.push(m(u[0].get(t),i,o));return n}return m(u[0],i,o)}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/stats.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/stats.js ***!
  \**************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return o; });
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _fieldStats_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fieldStats.js */ "../node_modules/@arcgis/core/arcade/functions/fieldStats.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function i(n,r,i,o){if(1===o.length){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(o[0]))return Object(_fieldStats_js__WEBPACK_IMPORTED_MODULE_1__["calculateStat"])(n,o[0],-1);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(o[0]))return Object(_fieldStats_js__WEBPACK_IMPORTED_MODULE_1__["calculateStat"])(n,o[0].toArray(),-1)}return Object(_fieldStats_js__WEBPACK_IMPORTED_MODULE_1__["calculateStat"])(n,o,-1)}function o(e,o){e.stdev=function(n,t){return o(n,t,(function(n,t,r){return i("stdev",n,t,r)}))},e.variance=function(n,t){return o(n,t,(function(n,t,r){return i("variance",n,t,r)}))},e.average=function(n,t){return o(n,t,(function(n,t,r){return i("mean",n,t,r)}))},e.mean=function(n,t){return o(n,t,(function(n,t,r){return i("mean",n,t,r)}))},e.sum=function(n,t){return o(n,t,(function(n,t,r){return i("sum",n,t,r)}))},e.min=function(n,t){return o(n,t,(function(n,t,r){return i("min",n,t,r)}))},e.max=function(n,t){return o(n,t,(function(n,t,r){return i("max",n,t,r)}))},e.distinct=function(n,t){return o(n,t,(function(n,t,r){return i("distinct",n,t,r)}))},e.count=function(e,i){return o(e,i,(function(e,i,o){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["p"])(o,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["a"])(o[0])||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["f"])(o[0]))return o[0].length;if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_0__["b"])(o[0]))return o[0].length();throw new Error("Invalid Parameters for Count")}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/functions/string.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/functions/string.js ***!
  \***************************************************************/
/*! exports provided: registerFunctions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerFunctions", function() { return L; });
/* harmony import */ var _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ArcadePortal.js */ "../node_modules/@arcgis/core/arcade/ArcadePortal.js");
/* harmony import */ var _Attachment_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Attachment.js */ "../node_modules/@arcgis/core/arcade/Attachment.js");
/* harmony import */ var _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony import */ var _Feature_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Feature.js */ "../node_modules/@arcgis/core/arcade/Feature.js");
/* harmony import */ var _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../chunks/languageUtils.js */ "../node_modules/@arcgis/core/chunks/languageUtils.js");
/* harmony import */ var _featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../featureset/support/shared.js */ "../node_modules/@arcgis/core/arcade/featureset/support/shared.js");
/* harmony import */ var _convertdirection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./convertdirection.js */ "../node_modules/@arcgis/core/arcade/functions/convertdirection.js");
/* harmony import */ var _hash_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./hash.js */ "../node_modules/@arcgis/core/arcade/functions/hash.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function N(t,r){if(t.x===r.x&&t.y===r.y){if(t.hasZ){if(t.z!==r.z)return!1}else if(r.hasZ)return!1;if(t.hasM){if(t.m!==r.m)return!1}else if(r.hasM)return!1;return!0}return!1}function C(o,a,i){if(null!==o)if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["a"])(o)){if(a.updateUint8Array([61]),i.map.has(o)){const t=i.map.get(o);a.updateIntArray([61237541^t])}else{i.map.set(o,i.currentLength++);for(const t of o)C(t,a,i);i.map.delete(o),i.currentLength--}a.updateUint8Array([199])}else if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["b"])(o)){if(a.updateUint8Array([61]),i.map.has(o)){const t=i.map.get(o);a.updateIntArray([61237541^t])}else{i.map.set(o,i.currentLength++);for(const t of o.toArray())C(t,a,i);i.map.delete(o),i.currentLength--}a.updateUint8Array([199])}else{if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["n"])(o))return a.updateIntArray([o.getTime()]),void a.updateUint8Array([241]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["f"])(o))return a.updateIntArray([o.length]),a.updateWithString(o),void a.updateUint8Array([41]);if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["i"])(o))a.updateUint8Array([!0===o?1:0,113]);else{if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["j"])(o))return a.updateFloatArray([o]),void a.updateUint8Array([173]);if(o instanceof _Attachment_js__WEBPACK_IMPORTED_MODULE_1__["default"])throw new Error("Type not supported in Hash");if(o instanceof _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__["default"])throw new Error("Type not supported in Hash");if(!(o instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"])){if(o instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"])throw new Error("Type not supported in Hash");if(o instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_10__["default"])return a.updateIntArray([3833836621]),a.updateIntArray([0]),a.updateFloatArray([o.x]),a.updateIntArray([1]),a.updateFloatArray([o.y]),o.hasZ&&(a.updateIntArray([2]),a.updateFloatArray([o.z])),o.hasM&&(a.updateIntArray([3]),a.updateFloatArray([o.m])),a.updateIntArray([3765347959]),void C(o.spatialReference.wkid,a,i);if(o instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_11__["default"]){a.updateIntArray([1266616829]);for(let t=0;t<o.rings.length;t++){const r=o.rings[t],e=[];let n=null,u=null;for(let a=0;a<r.length;a++){const i=o.getPoint(t,a);if(0===a)n=i;else if(N(u,i))continue;u=i,a===r.length-1&&N(n,i)||e.push(i)}a.updateIntArray([1397116793,e.length]);for(let t=0;t<e.length;t++){const r=e[t];a.updateIntArray([3962308117,t]),C(r,a,i),a.updateIntArray([2716288009])}a.updateIntArray([2278822459])}return a.updateIntArray([3878477243]),void C(o.spatialReference.wkid,a,i)}if(o instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_12__["default"]){a.updateIntArray([4106883559]);for(let t=0;t<o.paths.length;t++){const r=o.paths[t];a.updateIntArray([1397116793,r.length]);for(let e=0;e<r.length;e++)a.updateIntArray([3962308117,e]),C(o.getPoint(t,e),a,i),a.updateIntArray([2716288009]);a.updateIntArray([2278822459])}return a.updateIntArray([2568784753]),void C(o.spatialReference.wkid,a,i)}if(o instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_9__["default"]){a.updateIntArray([588535921,o.points.length]);for(let t=0;t<o.points.length;t++){const r=o.getPoint(t);a.updateIntArray([t]),C(r,a,i)}return a.updateIntArray([1700171621]),void C(o.spatialReference.wkid,a,i)}if(o instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_8__["default"])return a.updateIntArray([3483648373]),a.updateIntArray([0]),a.updateFloatArray([o.xmax]),a.updateIntArray([1]),a.updateFloatArray([o.xmin]),a.updateIntArray([2]),a.updateFloatArray([o.ymax]),a.updateIntArray([3]),a.updateFloatArray([o.ymin]),o.hasZ&&(a.updateIntArray([4]),a.updateFloatArray([o.zmax]),a.updateIntArray([5]),a.updateFloatArray([o.zmin])),o.hasM&&(a.updateIntArray([6]),a.updateFloatArray([o.mmax]),a.updateIntArray([7]),a.updateFloatArray([o.mmin])),a.updateIntArray([3622027469]),void C(o.spatialReference.wkid,a,i);if(o instanceof _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_13__["default"])return a.updateIntArray([14]),void 0!==o.wkid&&null!==o.wkid&&a.updateIntArray([o.wkid]),void(o.wkt&&a.updateWithString(o.wkt));if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["c"])(o))throw new Error("Type not supported in Hash");if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["o"])(o))throw new Error("Type not supported in Hash");if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["q"])(o))throw new Error("Type not supported in Hash");if(o===_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["v"])throw new Error("Type not supported in Hash");throw new Error("Type not supported in Hash")}if(a.updateUint8Array([223]),i.map.has(o)){const t=i.map.get(o);a.updateIntArray([61237541^t])}else{i.map.set(o,i.currentLength++);for(const t of o.keys()){a.updateIntArray([t.length]),a.updateWithString(t),a.updateUint8Array([251]);C(o.field(t),a,i),a.updateUint8Array([239])}i.map.delete(o),i.currentLength--}a.updateUint8Array([73])}}else a.updateUint8Array([0,139])}function L(r,h){r.portal=function(r,e){return h(r,e,(function(r,e,n){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(n,1,1),new _ArcadePortal_js__WEBPACK_IMPORTED_MODULE_0__["default"](Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(n[0]))}))},r.trim=function(t,r){return h(t,r,(function(t,r,e){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).trim()}))},r.tohex=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1);const n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[0]);return isNaN(n)?n:n.toString(16)}))},r.upper=function(t,r){return h(t,r,(function(t,r,e){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).toUpperCase()}))},r.proper=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,2);let n=1;2===e.length&&"firstword"===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]).toLowerCase()&&(n=2);const i=/\s/,u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]);let s="",f=!0;for(let o=0;o<u.length;o++){let t=u[o];if(i.test(t))1===n&&(f=!0);else{t.toUpperCase()!==t.toLowerCase()&&(f?(t=t.toUpperCase(),f=!1):t=t.toLowerCase())}s+=t}return s}))},r.lower=function(t,r){return h(t,r,(function(t,r,e){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).toLowerCase()}))},r.guid=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,0,1),e.length>0)switch(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).toLowerCase()){case"digits":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["O"])().replace("-","").replace("-","").replace("-","").replace("-","");case"digits-hyphen":return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["O"])();case"digits-hyphen-braces":return"{"+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["O"])()+"}";case"digits-hyphen-parentheses":return"("+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["O"])()+")"}return"{"+Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["O"])()+"}"}))},r.console=function(t,r){return h(t,r,(function(r,e,n){return 0===n.length||(1===n.length?t.console(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(n[0])):t.console(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(n))),_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["v"]}))},r.mid=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,3);let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[1]);if(isNaN(n))return"";if(n<0&&(n=0),2===e.length)return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).substr(n);let u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[2]);return isNaN(u)?"":(u<0&&(u=0),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).substr(n,u))}))},r.find=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,3);let n=0;if(e.length>2){if(n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["C"])(e[2],0)),isNaN(n))return-1;n<0&&(n=0)}return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]).indexOf(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]),n)}))},r.left=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,2);let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[1]);return isNaN(n)?"":(n<0&&(n=0),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).substr(0,n))}))},r.right=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,2);let n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[1]);return isNaN(n)?"":(n<0&&(n=0),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).substr(-1*n,n))}))},r.split=function(t,r){return h(t,r,(function(t,r,e){let n;Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,4);let u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["C"])(e[2],-1));const s=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["u"])(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["C"])(e[3],!1));if(-1===u||null===u||!0===s?n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).split(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1])):(isNaN(u)&&(u=-1),u<-1&&(u=-1),n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]).split(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]),u)),!1===s)return n;const p=[];for(let o=0;o<n.length&&!(-1!==u&&p.length>=u);o++)""!==n[o]&&void 0!==n[o]&&p.push(n[o]);return p}))},r.text=function(t,r){return h(t,r,(function(t,r,e){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,2),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["s"])(e[0],e[1])}))},r.concatenate=function(t,r){return h(t,r,(function(t,r,e){const n=[];if(e.length<1)return"";if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["a"])(e[0])){const t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["C"])(e[2],"");for(let r=0;r<e[0].length;r++)n[r]=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["s"])(e[0][r],t);return e.length>1?n.join(e[1]):n.join("")}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["b"])(e[0])){const t=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["C"])(e[2],"");for(let r=0;r<e[0].length();r++)n[r]=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["s"])(e[0].get(r),t);return e.length>1?n.join(e[1]):n.join("")}for(let o=0;o<e.length;o++)n[o]=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["s"])(e[o]);return n.join("")}))},r.reverse=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["a"])(e[0])){const t=e[0].slice(0);return t.reverse(),t}if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["b"])(e[0])){const t=e[0].toArray().slice(0);return t.reverse(),t}throw new Error("Invalid Parameter")}))},r.replace=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,3,4);const n=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[0]),i=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]),u=Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[2]);return 4!==e.length||Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["u"])(e[3])?Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["M"])(n,i,u):n.replace(i,u)}))},r.schema=function(t,r){return h(t,r,(function(t,r,o){if(o[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){const t=o[0].schema();return t?_Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"].convertObjectToArcadeDictionary(t):null}throw new Error("Invalid Parameter")}))},r.subtypes=function(t,r){return h(t,r,(function(t,r,a){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(a,1,1),a[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){const t=a[0].subtypes();return t?_Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"].convertObjectToArcadeDictionary(t):null}throw new Error("Invalid Parameter")}))},r.subtypecode=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),e[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){const t=e[0].subtypes();if(!t)return null;if(t.subtypeField&&e[0].hasField(t.subtypeField)){const r=e[0].field(t.subtypeField);for(const e of t.subtypes)if(e.code===r)return e.code;return null}return null}throw new Error("Invalid Parameter")}))},r.subtypename=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),e[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){const t=e[0].subtypes();if(!t)return"";if(t.subtypeField&&e[0].hasField(t.subtypeField)){const r=e[0].field(t.subtypeField);for(const e of t.subtypes)if(e.code===r)return e.name;return""}return""}throw new Error("Invalid Parameter")}))},r.gdbversion=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1),e[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"])return e[0].gdbVersion();throw new Error("Invalid Parameter")}))},r.domain=function(t,r){return h(t,r,(function(t,r,u){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(u,2,3),u[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"]){const t=u[0].fullDomain(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(u[1]),void 0===u[2]?void 0:Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(u[2]));return t&&t.domain?"coded-value"===t.domain.type||"codedValue"===t.domain.type?_Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"].convertObjectToArcadeDictionary({type:"codedValue",name:t.domain.name,dataType:_featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_5__["layerFieldEsriConstants"][t.field.type],codedValues:t.domain.codedValues.map((t=>({name:t.name,code:t.code})))}):_Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"].convertObjectToArcadeDictionary({type:"range",name:t.domain.name,dataType:_featureset_support_shared_js__WEBPACK_IMPORTED_MODULE_5__["layerFieldEsriConstants"][t.field.type],min:t.domain.min,max:t.domain.max}):null}throw new Error("Invalid Parameter")}))},r.domainname=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,4),e[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"])return e[0].domainValueLookup(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]),e[2],void 0===e[3]?void 0:Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[3]));throw new Error("Invalid Parameter")}))},r.domaincode=function(t,r){return h(t,r,(function(t,r,e){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,2,4),e[0]instanceof _Feature_js__WEBPACK_IMPORTED_MODULE_3__["default"])return e[0].domainCodeLookup(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(e[1]),e[2],void 0===e[3]?void 0:Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["t"])(e[3]));throw new Error("Invalid Parameter")}))},r.urlencode=function(t,r){return h(t,r,(function(t,r,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(n,1,1),null===n[0])return"";if(n[0]instanceof _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"]){let t="";for(const r of n[0].keys()){const e=n[0].field(r);""!==t&&(t+="&"),t+=null===e?encodeURIComponent(r)+"=":encodeURIComponent(r)+"="+encodeURIComponent(e)}return t}return encodeURIComponent(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(n[0]))}))},r.hash=function(t,r){return h(t,r,(function(t,r,e){Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,1,1);const n=new _hash_js__WEBPACK_IMPORTED_MODULE_7__["XXH"](0);return C(e[0],n,{map:new Map,currentLength:0}),n.digest()}))},r.convertdirection=function(t,r){return h(t,r,(function(t,r,e){return Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(e,3,3),Object(_convertdirection_js__WEBPACK_IMPORTED_MODULE_6__["convertDirection"])(e[0],e[1],e[2])}))},r.fromjson=function(t,r){return h(t,r,(function(t,r,n){if(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["p"])(n,1,1),!1===Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["f"])(n[0]))throw new Error("Invalid Parameter");return _Dictionary_js__WEBPACK_IMPORTED_MODULE_2__["default"].convertJsonToArcade(JSON.parse(Object(_chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["d"])(n[0])))}))},r.expects=function(t,r){return h(t,r,(function(t,r,e){if(e.length<1)throw new Error("Function called with wrong number of Parameters");return _chunks_languageUtils_js__WEBPACK_IMPORTED_MODULE_4__["v"]}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/kernel.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/kernel.js ***!
  \*****************************************************/
/*! exports provided: cloneGeometry, convertLinearUnitsToCode, convertSquareUnitsToCode, sameGeomType, shapeExtent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneGeometry", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertLinearUnitsToCode", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertSquareUnitsToCode", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sameGeomType", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shapeExtent", function() { return s; });
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(e){if(void 0===e)return null;if("number"==typeof e)return e;let r=e.toLowerCase();switch(r=r.replace(/\s/g,""),r=r.replace(/-/g,""),r){case"meters":case"meter":case"m":case"squaremeters":case"squaremeter":return 109404;case"miles":case"mile":case"squaremile":case"squaremiles":return 109413;case"kilometers":case"kilometer":case"squarekilometers":case"squarekilometer":case"km":return 109414;case"acres":case"acre":case"ac":return 109402;case"hectares":case"hectare":case"ha":return 109401;case"yard":case"yd":case"yards":case"squareyards":case"squareyard":return 109442;case"feet":case"ft":case"foot":case"squarefeet":case"squarefoot":return 109405;case"nm":case"nmi":case"nauticalmile":case"nauticalmiles":case"squarenauticalmile":case"squarenauticalmiles":return 109409}return null}function s(r){if(null===r)return null;switch(r.type){case"polygon":case"multipoint":case"polyline":return r.extent;case"point":return new _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_0__["default"]({xmin:r.x,ymin:r.y,xmax:r.x,ymax:r.y,spatialReference:r.spatialReference});case"extent":return r}return null}function a(e){if(void 0===e)return null;if("number"==typeof e)return e;let r=e.toLowerCase();switch(r=r.replace(/\s/g,""),r=r.replace(/-/g,""),r){case"meters":case"meter":case"m":case"squaremeters":case"squaremeter":return 9001;case"miles":case"mile":case"squaremile":case"squaremiles":return 9035;case"kilometers":case"kilometer":case"squarekilometers":case"squarekilometer":case"km":return 9036;case"yard":case"yd":case"yards":case"squareyards":case"squareyard":return 9096;case"feet":case"ft":case"foot":case"squarefeet":case"squarefoot":return 9002;case"nm":case"nmi":case"nauticalmile":case"nauticalmiles":case"squarenauticalmile":case"squarenauticalmiles":return 9030}return null}function t(e,r){return e===r||("point"===e&&"esriGeometryPoint"===r||("polyline"===e&&"esriGeometryPolyline"===r||("polygon"===e&&"esriGeometryPolygon"===r||("extent"===e&&"esriGeometryEnvelope"===r||("multipoint"===e&&"esriGeometryMultipoint"===r||("point"===r&&"esriGeometryPoint"===e||("polyline"===r&&"esriGeometryPolyline"===e||("polygon"===r&&"esriGeometryPolygon"===e||("extent"===r&&"esriGeometryEnvelope"===e||"multipoint"===r&&"esriGeometryMultipoint"===e)))))))))}function c(e){if(null===e)return null;const r=e.clone();return void 0!==e.cache._geVersion&&(r.cache._geVersion=e.cache._geVersion),r}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/arcade-parser.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/arcade-parser.js ***!
  \****************************************************************/
/*! exports provided: Syntax, TokenName, ArrayExpression, AssignmentExpression, AssignmentOperators, BinaryExpression, BinaryOperators, BlockStatement, BreakStatement, CallExpression, Comment, ComputedMemberExpression, ContinueStatement, EmptyStatement, ExpressionStatement, ForInStatement, ForStatement, FunctionDeclaration, Identifier, IfStatement, Literal, LogicalOperators, ObjectExpression, Program, Property, ReturnStatement, StaticMemberExpression, TemplateElement, TemplateLiteral, UnaryExpression, UnaryOperators, UpdateExpression, UpdateOperators, VariableDeclaration, VariableDeclarator, parse, tokenize, version */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tokenize", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return a; });
/* harmony import */ var _comment_handler_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./comment-handler.js */ "../node_modules/@arcgis/core/arcade/lib/comment-handler.js");
/* harmony import */ var _parser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parser.js */ "../node_modules/@arcgis/core/arcade/lib/parser.js");
/* harmony import */ var _tokenizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tokenizer.js */ "../node_modules/@arcgis/core/arcade/lib/tokenizer.js");
/* harmony import */ var _syntax_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./syntax.js */ "../node_modules/@arcgis/core/arcade/lib/syntax.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Syntax", function() { return _syntax_js__WEBPACK_IMPORTED_MODULE_3__["Syntax"]; });

/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./token.js */ "../node_modules/@arcgis/core/arcade/lib/token.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TokenName", function() { return _token_js__WEBPACK_IMPORTED_MODULE_4__["TokenName"]; });

/* harmony import */ var _nodes_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./nodes.js */ "../node_modules/@arcgis/core/arcade/lib/nodes.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArrayExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ArrayExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AssignmentExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["AssignmentExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AssignmentOperators", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["AssignmentOperators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BinaryExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["BinaryExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BinaryOperators", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["BinaryOperators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BlockStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["BlockStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BreakStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["BreakStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CallExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["CallExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Comment", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["Comment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ComputedMemberExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ComputedMemberExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ContinueStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ContinueStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EmptyStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["EmptyStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpressionStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ExpressionStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ForInStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ForInStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ForStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ForStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FunctionDeclaration", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["FunctionDeclaration"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Identifier", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["Identifier"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "IfStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["IfStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Literal", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["Literal"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LogicalOperators", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["LogicalOperators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ObjectExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ObjectExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Program", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["Program"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Property", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["Property"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ReturnStatement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["ReturnStatement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StaticMemberExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["StaticMemberExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TemplateElement", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["TemplateElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TemplateLiteral", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["TemplateLiteral"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UnaryExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["UnaryExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UnaryOperators", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["UnaryOperators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UpdateExpression", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["UpdateExpression"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UpdateOperators", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["UpdateOperators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VariableDeclaration", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["VariableDeclaration"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VariableDeclarator", function() { return _nodes_js__WEBPACK_IMPORTED_MODULE_5__["VariableDeclarator"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(r,o,n){let a=null;const s=(e,t)=>{n&&n(e,t),a&&a.visit(e,t)};let m="function"==typeof n?s:void 0,i=!1;if(o){i="boolean"==typeof o.comment&&o.comment;const t="boolean"==typeof o.attachComment&&o.attachComment;(i||t)&&(a=new _comment_handler_js__WEBPACK_IMPORTED_MODULE_0__["CommentHandler"],a.attach=t,o.comment=!0,m=s)}const p=new _parser_js__WEBPACK_IMPORTED_MODULE_1__["Parser"](r,o,m),c=p.parseScript();return i&&a&&(c.comments=a.comments),p.config.tokens&&(c.tokens=p.tokens),p.config.tolerant&&(c.errors=p.errorHandler.errors),c}function n(e,t,o){const n=new _tokenizer_js__WEBPACK_IMPORTED_MODULE_2__["Tokenizer"](e,t),a=[];let s;try{for(;;){let e=n.getNextToken();if(!e)break;o&&(e=o(e)),a.push(e)}}catch(m){n.errorHandler.tolerate(m)}return n.errorHandler.tolerant&&(s=n.errors()),{tokens:a,errors:s}}const a="4.0.0-dev";


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/assert.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/assert.js ***!
  \*********************************************************/
/*! exports provided: assert */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assert", function() { return r; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(r,o){if(!r)throw new Error("ASSERT: "+o)}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/character.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/character.js ***!
  \************************************************************/
/*! exports provided: Character */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Character", function() { return D; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u={NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/,NonAsciiIdentifierPart:/[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDD30-\uDD39\uDF00-\uDF1C\uDF27\uDF30-\uDF50\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD46\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E\uDC5F\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCE9\uDCFF\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/},D={fromCodePoint:u=>u<65536?String.fromCharCode(u):String.fromCharCode(55296+(u-65536>>10))+String.fromCharCode(56320+(u-65536&1023)),isWhiteSpace:u=>32===u||9===u||11===u||12===u||160===u||u>=5760&&[5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279].indexOf(u)>=0,isLineTerminator:u=>10===u||13===u||8232===u||8233===u,isIdentifierStart:F=>36===F||95===F||F>=65&&F<=90||F>=97&&F<=122||92===F||F>=128&&u.NonAsciiIdentifierStart.test(D.fromCodePoint(F)),isIdentifierPart:F=>36===F||95===F||F>=65&&F<=90||F>=97&&F<=122||F>=48&&F<=57||92===F||F>=128&&u.NonAsciiIdentifierPart.test(D.fromCodePoint(F)),isDecimalDigit:u=>u>=48&&u<=57,isHexDigit:u=>u>=48&&u<=57||u>=65&&u<=70||u>=97&&u<=102,isOctalDigit:u=>u>=48&&u<=55};


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/comment-handler.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/comment-handler.js ***!
  \******************************************************************/
/*! exports provided: CommentHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommentHandler", function() { return e; });
/* harmony import */ var _syntax_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./syntax.js */ "../node_modules/@arcgis/core/arcade/lib/syntax.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(){this.attach=!1,this.comments=[],this.stack=[],this.leading=[],this.trailing=[]}insertInnerComments(e,n){if(e.type===_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].BlockStatement&&0===e.body.length){const t=[];for(let e=this.leading.length-1;e>=0;--e){const s=this.leading[e];n.end.offset>=s.start&&(t.unshift(s.comment),this.leading.splice(e,1),this.trailing.splice(e,1))}t.length&&(e.innerComments=t)}}findTrailingComments(t){let e=[];if(this.trailing.length>0){for(let n=this.trailing.length-1;n>=0;--n){const s=this.trailing[n];s.start>=t.end.offset&&e.unshift(s.comment)}return this.trailing.length=0,e}const n=this.stack[this.stack.length-1];if(n&&n.node.trailingComments){const s=n.node.trailingComments[0];s&&s.range[0]>=t.end.offset&&(e=n.node.trailingComments,delete n.node.trailingComments)}return e}findLeadingComments(t){const e=[];let n;for(;this.stack.length>0;){const e=this.stack[this.stack.length-1];if(!(e&&e.start>=t.start.offset))break;n=e.node,this.stack.pop()}if(n){for(let s=(n.leadingComments?n.leadingComments.length:0)-1;s>=0;--s){const i=n.leadingComments[s];i.range[1]<=t.start.offset&&(e.unshift(i),n.leadingComments.splice(s,1))}return n.leadingComments&&0===n.leadingComments.length&&delete n.leadingComments,e}for(let s=this.leading.length-1;s>=0;--s){const n=this.leading[s];n.start<=t.start.offset&&(e.unshift(n.comment),this.leading.splice(s,1))}return e}visitNode(e,n){if(e.type===_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].Program&&e.body.length>0)return;this.insertInnerComments(e,n);const s=this.findTrailingComments(n),i=this.findLeadingComments(n);i.length>0&&(e.leadingComments=i),s.length>0&&(e.trailingComments=s),this.stack.push({node:e,start:n.start.offset})}visitComment(t,e){if(this.comments.push(t),this.attach){const n={comment:{type:t.type,value:t.value,range:[e.start.offset,e.end.offset]},start:e.start.offset};t.loc&&(n.comment.loc=t.loc),this.leading.push(n),this.trailing.push(n)}}visit(t,e){"Line"===t.type||"Block"===t.type?this.visitComment(t,e):this.attach&&this.visitNode(t,e)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/error-handler.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/error-handler.js ***!
  \****************************************************************/
/*! exports provided: ErrorHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ErrorHandler", function() { return r; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class r{constructor(){this.errors=[],this.tolerant=!1}recordError(r){this.errors.push(r)}tolerate(r){if(!this.tolerant)throw r;this.recordError(r)}constructError(r,t){let e=new Error(r);try{throw e}catch(o){Object.create&&Object.defineProperty&&(e=Object.create(o),Object.defineProperty(e,"column",{value:t}))}return e}createError(r,t,e,o){const c="Line "+t+": "+o,s=this.constructError(c,e);return s.index=r,s.lineNumber=t,s.description=o,s}throwError(r,t,e,o){throw this.createError(r,t,e,o)}tolerateError(r,t,e,o){const c=this.createError(r,t,e,o);if(!this.tolerant)throw c;this.recordError(c)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/messages.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/messages.js ***!
  \***********************************************************/
/*! exports provided: Messages */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Messages", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={ForInOfLoopInitializer:"%0 loop variable declaration may not have an initializer",GeneratorInLegacyContext:"Generator declarations are not allowed in legacy contexts",IllegalBreak:"Illegal break statement",IllegalContinue:"Illegal continue statement",IllegalExportDeclaration:"Unexpected token",IllegalImportDeclaration:"Unexpected token",IllegalReturn:"Illegal return statement",InvalidEscapedReservedWord:"Keyword must not contain escaped characters",InvalidHexEscapeSequence:"Invalid hexadecimal escape sequence",InvalidLHSInAssignment:"Invalid left-hand side in assignment",InvalidLHSInForIn:"Invalid left-hand side in for-in",InvalidRegExp:"Invalid regular expression",Redeclaration:"%0 '%1' has already been declared",StaticPrototype:"Classes may not have static property named prototype",StrictParamDupe:"Strict mode function may not have duplicate parameter names",TemplateOctalLiteral:"Octal literals are not allowed in template strings.",UnexpectedEOS:"Unexpected end of input",UnexpectedIdentifier:"Unexpected identifier",UnexpectedNumber:"Unexpected number",UnexpectedString:"Unexpected string",UnexpectedTemplate:"Unexpected quasi %0",UnexpectedToken:"Unexpected token %0",UnexpectedTokenIllegal:"Unexpected token ILLEGAL",UnterminatedRegExp:"Invalid regular expression: missing /",IdentiferExpected:"Identifier expected"};


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/nodes.js":
/*!********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/nodes.js ***!
  \********************************************************/
/*! exports provided: ArrayExpression, AssignmentExpression, AssignmentOperators, BinaryExpression, BinaryOperators, BlockStatement, BreakStatement, CallExpression, Comment, ComputedMemberExpression, ContinueStatement, EmptyStatement, ExpressionStatement, ForInStatement, ForStatement, FunctionDeclaration, Identifier, IfStatement, Literal, LogicalOperators, ObjectExpression, Program, Property, ReturnStatement, StaticMemberExpression, TemplateElement, TemplateLiteral, UnaryExpression, UnaryOperators, UpdateExpression, UpdateOperators, VariableDeclaration, VariableDeclarator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArrayExpression", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AssignmentExpression", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AssignmentOperators", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BinaryExpression", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BinaryOperators", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlockStatement", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BreakStatement", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CallExpression", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Comment", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComputedMemberExpression", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ContinueStatement", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EmptyStatement", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpressionStatement", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ForInStatement", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ForStatement", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FunctionDeclaration", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Identifier", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IfStatement", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Literal", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LogicalOperators", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ObjectExpression", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Program", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Property", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReturnStatement", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StaticMemberExpression", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TemplateElement", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TemplateLiteral", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UnaryExpression", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UnaryOperators", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateExpression", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UpdateOperators", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VariableDeclaration", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VariableDeclarator", function() { return P; });
/* harmony import */ var _syntax_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./syntax.js */ "../node_modules/@arcgis/core/arcade/lib/syntax.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class s{}class e extends s{constructor(t,s){super(),this.type=t,this.value=s}}class r extends s{constructor(s){super(),this.elements=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ArrayExpression}}const i=["=","/=","*=","%=","+=","-="];class n extends s{constructor(s,e,r){super(),this.operator=s,this.left=e,this.right=r,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].AssignmentExpression}}const o=["||","&&"],c=["|","&",">>","<<",">>",">>>","^","==","!=","<","<=",">",">=","+","-","*","/","%"];class h extends s{constructor(s,e,r){super(),this.operator=s,this.left=e,this.right=r,this.type=o.includes(s)?_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].LogicalExpression:_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].BinaryExpression}}class p extends s{constructor(s){super(),this.body=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].BlockStatement}}class a extends s{constructor(){super(...arguments),this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].BreakStatement}}class u extends s{constructor(s,e){super(),this.callee=s,this.args=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].CallExpression,this.arguments=e}}class l extends s{constructor(s,e){super(),this.object=s,this.property=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].MemberExpression,this.computed=!0}}class d extends s{constructor(s,e){super(),this.object=s,this.property=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].MemberExpression,this.computed=!1}}class x extends s{constructor(){super(...arguments),this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ContinueStatement}}class y extends s{constructor(){super(...arguments),this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].EmptyStatement}}class m extends s{constructor(s){super(),this.expression=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ExpressionStatement}}class E extends s{constructor(s,e,r){super(),this.left=s,this.right=e,this.body=r,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ForInStatement,this.each=!1}}class b extends s{constructor(s,e,r,i){super(),this.init=s,this.test=e,this.update=r,this.body=i,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ForStatement}}class g extends s{constructor(s,e,r){super(),this.id=s,this.params=e,this.body=r,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].FunctionDeclaration,this.generator=!1,this.expression=!1,this.async=!1}}class S extends s{constructor(s){super(),this.name=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].Identifier}}class f extends s{constructor(s,e,r){super(),this.test=s,this.consequent=e,this.alternate=r,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].IfStatement}}class k extends s{constructor(s,e){super(),this.value=s,this.raw=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].Literal}}class j extends s{constructor(s){super(),this.properties=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ObjectExpression}}class v extends s{constructor(s,e,r,i,n,o){super(),this.kind=s,this.key=e,this.computed=r,this.value=i,this.method=n,this.shorthand=o,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].Property}}class B extends s{constructor(s){super(),this.argument=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].ReturnStatement}}class D extends s{constructor(s){super(),this.body=s,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].Program}}class F extends s{constructor(s,e){super(),this.value=s,this.tail=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].TemplateElement}}class I extends s{constructor(s,e){super(),this.quasis=s,this.expressions=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].TemplateLiteral}}const L=["-","+","!","~"];class q extends s{constructor(s,e){super(),this.operator=s,this.argument=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].UnaryExpression,this.prefix=!0}}const A=["++","--"];class C extends s{constructor(s,e,r){super(),this.operator=s,this.argument=e,this.prefix=r,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].UpdateExpression}}class M extends s{constructor(s,e){super(),this.declarations=s,this.kind=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].VariableDeclaration}}class P extends s{constructor(s,e){super(),this.id=s,this.init=e,this.type=_syntax_js__WEBPACK_IMPORTED_MODULE_0__["Syntax"].VariableDeclarator}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/parser.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/parser.js ***!
  \*********************************************************/
/*! exports provided: Parser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Parser", function() { return G; });
/* harmony import */ var _assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert.js */ "../node_modules/@arcgis/core/arcade/lib/assert.js");
/* harmony import */ var _error_handler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./error-handler.js */ "../node_modules/@arcgis/core/arcade/lib/error-handler.js");
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./messages.js */ "../node_modules/@arcgis/core/arcade/lib/messages.js");
/* harmony import */ var _nodes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nodes.js */ "../node_modules/@arcgis/core/arcade/lib/nodes.js");
/* harmony import */ var _scanner_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scanner.js */ "../node_modules/@arcgis/core/arcade/lib/scanner.js");
/* harmony import */ var _syntax_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./syntax.js */ "../node_modules/@arcgis/core/arcade/lib/syntax.js");
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./token.js */ "../node_modules/@arcgis/core/arcade/lib/token.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class G{constructor(e,s={},i){this.config={range:"boolean"==typeof s.range&&s.range,loc:"boolean"==typeof s.loc&&s.loc,source:null,tokens:"boolean"==typeof s.tokens&&s.tokens,comment:"boolean"==typeof s.comment&&s.comment,tolerant:"boolean"==typeof s.tolerant&&s.tolerant,globalReturn:!!s.globalReturn},this.config.loc&&s.source&&null!==s.source&&(this.config.source=String(s.source)),this.delegate=i,this.errorHandler=new _error_handler_js__WEBPACK_IMPORTED_MODULE_1__["ErrorHandler"],this.errorHandler.tolerant=this.config.tolerant,this.scanner=new _scanner_js__WEBPACK_IMPORTED_MODULE_4__["Scanner"](e,this.errorHandler),this.scanner.trackComment=this.config.comment,this.operatorPrecedence={")":0,";":0,",":0,"=":0,"]":0,"||":1,"&&":2,"|":3,"^":4,"&":5,"==":6,"!=":6,"===":6,"!==":6,"<":7,">":7,"<=":7,">=":7,"<<":8,">>":8,">>>":8,"+":9,"-":9,"*":11,"/":11,"%":11},this.lookahead={type:2,value:"",lineNumber:this.scanner.lineNumber,lineStart:0,start:0,end:0},this.hasLineTerminator=!1,this.context={allowIn:!0,firstCoverInitializedNameError:null,isAssignmentTarget:!1,isBindingElement:!1,inFunctionBody:!1,inIteration:!1,curlyParsing:"asObject"},this.tokens=[],this.startMarker={index:0,line:this.scanner.lineNumber,column:0},this.lastMarker={index:0,line:this.scanner.lineNumber,column:0},this.nextToken(),this.lastMarker={index:this.scanner.index,line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}tolerateError(t,...s){const i=s.slice(),n=t.replace(/%(\d)/g,((t,s)=>(Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])(s<i.length,"Message reference must be in range"),i[s]))),r=this.lastMarker.index,a=this.scanner.lineNumber,o=this.lastMarker.column+1;this.errorHandler.tolerateError(r,a,o,n)}unexpectedTokenError(e,t){let i,n=t||_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedToken;if(e?(t||(n=2===e.type?_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedEOS:3===e.type?_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedIdentifier:6===e.type?_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedNumber:8===e.type?_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedString:10===e.type?_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedTemplate:_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedToken),i=e.value.toString()):i="ILLEGAL",n=n.replace("%0",i),e&&"number"==typeof e.lineNumber){const t=e.start,s=e.lineNumber,i=this.lastMarker.index-this.lastMarker.column,r=e.start-i+1;return this.errorHandler.createError(t,s,r,n)}const r=this.lastMarker.index,a=this.lastMarker.line,o=this.lastMarker.column+1;return this.errorHandler.createError(r,a,o,n)}throwUnexpectedToken(e,t){throw this.unexpectedTokenError(e,t)}tolerateUnexpectedToken(e,t){this.errorHandler.tolerate(this.unexpectedTokenError(e,t))}collectComments(){if(this.config.comment){const e=this.scanner.scanComments();if(e&&e.length>0&&this.delegate)for(let t=0;t<e.length;++t){const s=e[t],n=new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Comment"](s.multiLine?"Block":"Line",this.scanner.source.slice(s.slice[0],s.slice[1]));this.config.range&&(n.range=s.range),this.config.loc&&(n.loc=s.loc);const r={start:{line:s.loc.start.line,column:s.loc.start.column,offset:s.range[0]},end:{line:s.loc.end.line,column:s.loc.end.column,offset:s.range[1]}};this.delegate(n,r)}}else this.scanner.scanComments()}peekAhead(e){const t=()=>(this.scanner.scanComments(),this.scanner.lex()),s=this.scanner.saveState();e.call(this,t),this.scanner.restoreState(s)}getTokenRaw(e){return this.scanner.source.slice(e.start,e.end)}convertToken(e){const t={type:_token_js__WEBPACK_IMPORTED_MODULE_6__["TokenName"][e.type],value:this.getTokenRaw(e)};if(this.config.range&&(t.range=[e.start,e.end]),this.config.loc&&(t.loc={start:{line:this.startMarker.line,column:this.startMarker.column},end:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart}}),9===e.type){const s=e.pattern,i=e.flags;t.regex={pattern:s,flags:i}}return t}nextToken(){const e=this.lookahead;this.lastMarker.index=this.scanner.index,this.lastMarker.line=this.scanner.lineNumber,this.lastMarker.column=this.scanner.index-this.scanner.lineStart,this.collectComments(),this.scanner.index!==this.startMarker.index&&(this.startMarker.index=this.scanner.index,this.startMarker.line=this.scanner.lineNumber,this.startMarker.column=this.scanner.index-this.scanner.lineStart);const t=this.scanner.lex();return this.hasLineTerminator=e.lineNumber!==t.lineNumber,this.lookahead=t,this.config.tokens&&2!==t.type&&this.tokens.push(this.convertToken(t)),e}createNode(){return{index:this.startMarker.index,line:this.startMarker.line,column:this.startMarker.column}}startNode(e,t=0){let s=e.start-e.lineStart,i=e.lineNumber;return s<0&&(s+=t,i--),{index:e.start,line:i,column:s}}finalize(e,t){if(this.config.range&&(t.range=[e.index,this.lastMarker.index]),this.config.loc&&(t.loc={start:{line:e.line,column:e.column},end:{line:this.lastMarker.line,column:this.lastMarker.column}},this.config.source&&(t.loc.source=this.config.source)),this.delegate){const s={start:{line:e.line,column:e.column,offset:e.index},end:{line:this.lastMarker.line,column:this.lastMarker.column,offset:this.lastMarker.index}};this.delegate(t,s)}return t}expect(e){const t=this.nextToken();7===t.type&&t.value===e||this.throwUnexpectedToken(t)}expectCommaSeparator(){if(this.config.tolerant){const e=this.lookahead;7===e.type&&","===e.value?this.nextToken():7===e.type&&";"===e.value?(this.nextToken(),this.tolerateUnexpectedToken(e)):this.tolerateUnexpectedToken(e,_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedToken)}else this.expect(",")}expectKeyword(e){const t=this.nextToken();4===t.type&&t.value.toString().toLowerCase()===e.toLowerCase()||this.throwUnexpectedToken(t)}match(e){return 7===this.lookahead.type&&this.lookahead.value===e}matchKeyword(e){return 4===this.lookahead.type&&this.lookahead.value.toLowerCase()===e.toLowerCase()}matchContextualKeyword(e){return 3===this.lookahead.type&&this.lookahead.value===e}matchAssign(){if(7!==this.lookahead.type)return!1;const e=this.lookahead.value;return _nodes_js__WEBPACK_IMPORTED_MODULE_3__["AssignmentOperators"].includes(e)}isolateCoverGrammar(e){const t=this.context.isBindingElement,s=this.context.isAssignmentTarget,i=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;const n=e.call(this);return null!==this.context.firstCoverInitializedNameError&&this.throwUnexpectedToken(this.context.firstCoverInitializedNameError),this.context.isBindingElement=t,this.context.isAssignmentTarget=s,this.context.firstCoverInitializedNameError=i,n}inheritCoverGrammar(e){const t=this.context.isBindingElement,s=this.context.isAssignmentTarget,i=this.context.firstCoverInitializedNameError;this.context.isBindingElement=!0,this.context.isAssignmentTarget=!0,this.context.firstCoverInitializedNameError=null;const n=e.call(this);return this.context.isBindingElement=this.context.isBindingElement&&t,this.context.isAssignmentTarget=this.context.isAssignmentTarget&&s,this.context.firstCoverInitializedNameError=i||this.context.firstCoverInitializedNameError,n}consumeSemicolon(){this.match(";")?this.nextToken():this.hasLineTerminator||(2===this.lookahead.type||this.match("}")||this.throwUnexpectedToken(this.lookahead),this.lastMarker.index=this.startMarker.index,this.lastMarker.line=this.startMarker.line,this.lastMarker.column=this.startMarker.column)}parsePrimaryExpression(){const e=this.createNode();let t,s,i;switch(this.lookahead.type){case 3:t=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](this.nextToken().value));break;case 6:case 8:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,s=this.nextToken(),i=this.getTokenRaw(s),t=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Literal"](s.value,i));break;case 1:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,s=this.nextToken(),i=this.getTokenRaw(s),t=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Literal"]("true"===s.value.toString().toLowerCase(),i));break;case 5:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,s=this.nextToken(),i=this.getTokenRaw(s),t=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Literal"](null,i));break;case 10:t=this.parseTemplateLiteral();break;case 7:switch(this.lookahead.value){case"(":this.context.isBindingElement=!1,t=this.inheritCoverGrammar(this.parseGroupExpression);break;case"[":t=this.inheritCoverGrammar(this.parseArrayInitializer);break;case"{":t=this.inheritCoverGrammar(this.parseObjectInitializer);break;default:t=this.throwUnexpectedToken(this.nextToken())}break;case 4:this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1,t=this.throwUnexpectedToken(this.nextToken());break;default:t=this.throwUnexpectedToken(this.nextToken())}return t}parseArrayInitializer(){const e=this.createNode(),t=[];for(this.expect("[");!this.match("]");)this.match(",")?(this.nextToken(),t.push(null)):(t.push(this.inheritCoverGrammar(this.parseAssignmentExpression)),this.match("]")||this.expect(","));return this.expect("]"),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ArrayExpression"](t))}parseObjectPropertyKey(){const e=this.createNode(),t=this.nextToken();let s;switch(t.type){case 8:case 6:s=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Literal"](t.value,this.getTokenRaw(t)));break;case 3:case 1:case 5:case 4:s=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](t.value));break;default:s=this.throwUnexpectedToken(t)}return s}parseObjectProperty(){const e=this.createNode(),t=this.lookahead;let s=!1;const i=!1;let n=!1,r=null;if(3===t.type){const i=t.value;this.nextToken(),s=this.match("["),r=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](i))}else this.match("*")?this.nextToken():(s=this.match("["),r=this.parseObjectPropertyKey());r||this.throwUnexpectedToken(this.lookahead);let o=null;const c="init";if(this.match(":"))this.nextToken(),o=this.inheritCoverGrammar(this.parseAssignmentExpression);else if(3===t.type){n=!0,o=this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](t.value))}else this.throwUnexpectedToken(this.nextToken());return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Property"](c,r,s,o,i,n))}parseObjectInitializer(){const e=this.createNode();this.expect("{");const t=[];for(;!this.match("}");)t.push(this.parseObjectProperty()),this.match("}")||this.expectCommaSeparator();return this.expect("}"),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ObjectExpression"](t))}parseTemplateHead(){Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])(this.lookahead.head,"Template literal must start with a template head");const t=this.createNode(),s=this.nextToken(),i=s.value,n=s.cooked;return this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["TemplateElement"]({raw:i,cooked:n},s.tail))}parseTemplateElement(){10!==this.lookahead.type&&this.throwUnexpectedToken();const e=this.createNode(),t=this.nextToken(),s=t.value,i=t.cooked;return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["TemplateElement"]({raw:s,cooked:i},t.tail))}parseTemplateLiteral(){const e=this.createNode(),t=[],s=[];let i=this.parseTemplateHead();for(s.push(i);!i.tail;)t.push(this.parseExpression()),i=this.parseTemplateElement(),s.push(i);return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["TemplateLiteral"](s,t))}parseGroupExpression(){this.expect("("),this.context.isBindingElement=!0;const e=this.inheritCoverGrammar(this.parseAssignmentExpression);return this.expect(")"),this.context.isBindingElement=!1,e}parseArguments(){this.expect("(");const e=[];if(!this.match(")"))for(;;){const t=this.isolateCoverGrammar(this.parseAssignmentExpression);if(e.push(t),this.match(")"))break;if(this.expectCommaSeparator(),this.match(")"))break}return this.expect(")"),e}isIdentifierName(e){return 3===e.type||4===e.type||1===e.type||5===e.type}parseIdentifierName(){const e=this.createNode(),t=this.nextToken();return this.isIdentifierName(t)||this.throwUnexpectedToken(t),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](t.value))}parseLeftHandSideExpressionAllowCall(){const e=this.lookahead,t=this.context.allowIn;this.context.allowIn=!0;let s=this.inheritCoverGrammar(this.parsePrimaryExpression);for(;;)if(this.match("(")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!1;const t=this.parseArguments();s=this.finalize(this.startNode(e),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["CallExpression"](s,t))}else if(this.match("[")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect("[");const t=this.isolateCoverGrammar(this.parseExpression);this.expect("]"),s=this.finalize(this.startNode(e),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ComputedMemberExpression"](s,t))}else{if(!this.match("."))break;{this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(".");const t=this.parseIdentifierName();s=this.finalize(this.startNode(e),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["StaticMemberExpression"](s,t))}}return this.context.allowIn=t,s}parseLeftHandSideExpression(){Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])(this.context.allowIn,"callee of new expression always allow in keyword.");const t=this.startNode(this.lookahead);let s=this.inheritCoverGrammar(this.parsePrimaryExpression);for(;;)if(this.match("[")){this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect("[");const e=this.isolateCoverGrammar(this.parseExpression);this.expect("]"),s=this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ComputedMemberExpression"](s,e))}else{if(!this.match("."))break;{this.context.isBindingElement=!1,this.context.isAssignmentTarget=!0,this.expect(".");const e=this.parseIdentifierName();s=this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["StaticMemberExpression"](s,e))}}return s}parseUpdateExpression(){let e;const t=this.lookahead;if(this.match("++")||this.match("--")){const i=this.startNode(t),n=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),this.context.isAssignmentTarget||this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidLHSInAssignment);const r=!0;e=this.finalize(i,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["UpdateExpression"](n.value,e,r)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else if(e=this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall),!this.hasLineTerminator&&7===this.lookahead.type&&(this.match("++")||this.match("--"))){this.context.isAssignmentTarget||this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidLHSInAssignment),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;const i=this.nextToken().value,n=!1;e=this.finalize(this.startNode(t),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["UpdateExpression"](i,e,n))}return e}parseUnaryExpression(){let e;if(this.match("+")||this.match("-")||this.match("~")||this.match("!")){const t=this.startNode(this.lookahead),s=this.nextToken();e=this.inheritCoverGrammar(this.parseUnaryExpression),e=this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["UnaryExpression"](s.value,e)),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1}else e=this.parseUpdateExpression();return e}binaryPrecedence(e){const t=e.value;let s;return s=7===e.type?this.operatorPrecedence[t]||0:4===e.type&&this.context.allowIn&&"in"===t?12:0,s}parseBinaryExpression(){const e=this.lookahead;let t=this.inheritCoverGrammar(this.parseUnaryExpression);const s=this.lookahead;let i=this.binaryPrecedence(s);if(i>0){this.nextToken(),this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1;const n=[e,this.lookahead];let r=t,a=this.inheritCoverGrammar(this.parseUnaryExpression);const o=[r,s.value,a],h=[i];for(;i=this.binaryPrecedence(this.lookahead),!(i<=0);){for(;o.length>2&&i<=h[h.length-1];){a=o.pop();const e=o.pop();h.pop(),r=o.pop(),n.pop();const t=n[n.length-1],s=this.startNode(t,t.lineStart);o.push(this.finalize(s,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["BinaryExpression"](e,r,a)))}o.push(this.nextToken().value),h.push(i),n.push(this.lookahead),o.push(this.inheritCoverGrammar(this.parseUnaryExpression))}let c=o.length-1;t=o[c];let l=n.pop();for(;c>1;){const e=n.pop();if(!e)break;const s=l&&l.lineStart,i=this.startNode(e,s),r=o[c-1];t=this.finalize(i,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["BinaryExpression"](r,o[c-2],t)),c-=2,l=e}}return t}parseAssignmentExpression(){const e=this.lookahead;let t=e,i=this.inheritCoverGrammar(this.parseBinaryExpression);if(this.matchAssign()){this.context.isAssignmentTarget||this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidLHSInAssignment),this.match("=")||(this.context.isAssignmentTarget=!1,this.context.isBindingElement=!1),t=this.nextToken();const n=t.value,r=this.isolateCoverGrammar(this.parseAssignmentExpression);i=this.finalize(this.startNode(e),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["AssignmentExpression"](n,i,r)),this.context.firstCoverInitializedNameError=null}return i}parseExpression(){return this.isolateCoverGrammar(this.parseAssignmentExpression)}parseStatementListItem(){let e;if(this.context.isAssignmentTarget=!0,this.context.isBindingElement=!0,4===this.lookahead.type)if("function"===this.lookahead.value)e=this.parseFunctionDeclaration();else e=this.parseStatement();else e=this.parseStatement();return e}parseBlock(){const e=this.createNode();this.expect("{");const t=[];for(;!this.match("}");)t.push(this.parseStatementListItem());return this.expect("}"),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["BlockStatement"](t))}parseObjectStatement(){const e=this.createNode(),t=this.parseObjectInitializer();return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ExpressionStatement"](t))}parseBlockOrObjectStatement(){let e="asObject"===this.context.curlyParsing;return"asObjectOrBlock"===this.context.curlyParsing&&this.peekAhead((t=>{let s=t();3!==s.type&&8!==s.type||(s=t(),7===s.type&&":"===s.value&&(e=!0))})),e?this.parseObjectStatement():this.parseBlock()}parseVariableIdentifier(){const e=this.createNode(),t=this.nextToken();return 3!==t.type&&this.throwUnexpectedToken(t,_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].IdentiferExpected),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Identifier"](t.value))}parseVariableDeclaration(e){const t=this.createNode(),s=this.parseVariableIdentifier();let i=null;return this.match("=")?(this.nextToken(),i=this.isolateCoverGrammar(this.parseAssignmentExpression)):s.type===_syntax_js__WEBPACK_IMPORTED_MODULE_5__["Syntax"].Identifier||e.inFor||this.expect("="),this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["VariableDeclarator"](s,i))}parseVariableDeclarationList(e){const t=[this.parseVariableDeclaration(e)];for(;this.match(",");)this.nextToken(),t.push(this.parseVariableDeclaration(e));return t}parseVariableStatement(){const e=this.createNode();this.expectKeyword("var");const t=this.parseVariableDeclarationList({inFor:!1});return this.consumeSemicolon(),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["VariableDeclaration"](t,"var"))}parseEmptyStatement(){const e=this.createNode();return this.expect(";"),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["EmptyStatement"])}parseExpressionStatement(){const e=this.createNode(),t=this.parseExpression();return this.consumeSemicolon(),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ExpressionStatement"](t))}parseIfClause(){const e=this.context.curlyParsing;this.context.curlyParsing="asObjectOrBlock";const t=this.parseStatement();return this.context.curlyParsing=e,t}parseIfStatement(){const e=this.createNode();let t,s=null;this.expectKeyword("if"),this.expect("(");const i=this.parseExpression();return!this.match(")")&&this.config.tolerant?(this.tolerateUnexpectedToken(this.nextToken()),t=this.finalize(this.createNode(),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["EmptyStatement"])):(this.expect(")"),t=this.parseIfClause(),this.matchKeyword("else")&&(this.nextToken(),s=this.parseIfClause())),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["IfStatement"](i,t,s))}parseForStatement(){let e=null,t=null,i=null,n=null,r=null;const a=this.createNode();if(this.expectKeyword("for"),this.expect("("),this.match(";"))this.nextToken();else if(this.matchKeyword("var")){const t=this.createNode();this.nextToken();const i=this.context.allowIn;this.context.allowIn=!1;const a=this.parseVariableDeclarationList({inFor:!0});if(this.context.allowIn=i,1===a.length&&this.matchKeyword("in")){a[0].init&&this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].ForInOfLoopInitializer,"for-in"),n=this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["VariableDeclaration"](a,"var")),this.nextToken(),r=this.parseExpression()}else e=this.finalize(t,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["VariableDeclaration"](a,"var")),this.expect(";")}else{const t=this.context.isBindingElement,i=this.context.isAssignmentTarget,a=this.context.firstCoverInitializedNameError,o=this.context.allowIn;this.context.allowIn=!1,e=this.inheritCoverGrammar(this.parseAssignmentExpression),this.context.allowIn=o,this.matchKeyword("in")?(this.context.isAssignmentTarget&&e.type!==_syntax_js__WEBPACK_IMPORTED_MODULE_5__["Syntax"].AssignmentExpression||this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidLHSInForIn),this.nextToken(),n=e,r=this.parseExpression(),e=null):(this.context.isBindingElement=t,this.context.isAssignmentTarget=i,this.context.firstCoverInitializedNameError=a,this.expect(";"))}let o;if(n||(this.match(";")||(t=this.isolateCoverGrammar(this.parseExpression)),this.expect(";"),this.match(")")||(i=this.isolateCoverGrammar(this.parseExpression))),!this.match(")")&&this.config.tolerant)this.tolerateUnexpectedToken(this.nextToken()),o=this.finalize(this.createNode(),new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["EmptyStatement"]);else{this.expect(")");const e=this.context.inIteration,t=this.context.curlyParsing;this.context.inIteration=!0,this.context.curlyParsing="asObjectOrBlock",o=this.isolateCoverGrammar(this.parseStatement),this.context.curlyParsing=t,this.context.inIteration=e}return n&&r?this.finalize(a,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ForInStatement"](n,r,o)):this.finalize(a,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ForStatement"](e,t,i,o))}parseContinueStatement(){const e=this.createNode();return this.expectKeyword("continue"),this.consumeSemicolon(),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ContinueStatement"])}parseBreakStatement(){const e=this.createNode();return this.expectKeyword("break"),this.consumeSemicolon(),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["BreakStatement"])}parseReturnStatement(){this.config.globalReturn||this.context.inFunctionBody||this.tolerateError(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].IllegalReturn);const e=this.createNode();this.expectKeyword("return");const t=!this.match(";")&&!this.match("}")&&!this.hasLineTerminator&&2!==this.lookahead.type||8===this.lookahead.type||10===this.lookahead.type?this.parseExpression():null;return this.consumeSemicolon(),this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["ReturnStatement"](t))}parseStatement(){let e;switch(this.lookahead.type){case 1:case 5:case 6:case 8:case 10:case 3:e=this.parseExpressionStatement();break;case 7:{const t=this.lookahead.value;e="{"===t?this.parseBlockOrObjectStatement():"("===t?this.parseExpressionStatement():";"===t?this.parseEmptyStatement():this.parseExpressionStatement();break}case 4:switch(this.lookahead.value.toLowerCase()){case"break":e=this.parseBreakStatement();break;case"continue":e=this.parseContinueStatement();break;case"for":e=this.parseForStatement();break;case"function":e=this.parseFunctionDeclaration();break;case"if":e=this.parseIfStatement();break;case"return":e=this.parseReturnStatement();break;case"var":e=this.parseVariableStatement();break;default:e=this.parseExpressionStatement()}break;default:e=this.throwUnexpectedToken(this.lookahead)}return e}parseFunctionSourceElements(){const e=this.createNode();this.expect("{");const t=this.context.inIteration,s=this.context.inFunctionBody;this.context.inIteration=!1,this.context.inFunctionBody=!0;const i=[];for(;2!==this.lookahead.type&&!this.match("}");)i.push(this.parseStatementListItem());return this.expect("}"),this.context.inIteration=t,this.context.inFunctionBody=s,this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["BlockStatement"](i))}parseFormalParameters(){const e=[];if(this.expect("("),!this.match(")"))for(;2!==this.lookahead.type&&(e.push(this.parseVariableIdentifier()),!this.match(")"))&&(this.expect(","),!this.match(")")););return this.expect(")"),e}parseFunctionDeclaration(){const e=this.createNode();this.expectKeyword("function");const t=this.parseVariableIdentifier(),s=this.parseFormalParameters(),i=this.parseFunctionSourceElements();return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["FunctionDeclaration"](t,s,i))}parseScript(){const e=this.createNode(),t=[];for(;2!==this.lookahead.type;)t.push(this.parseStatementListItem());return this.finalize(e,new _nodes_js__WEBPACK_IMPORTED_MODULE_3__["Program"](t))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/scanner.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/scanner.js ***!
  \**********************************************************/
/*! exports provided: Scanner */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Scanner", function() { return r; });
/* harmony import */ var _assert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assert.js */ "../node_modules/@arcgis/core/arcade/lib/assert.js");
/* harmony import */ var _character_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./character.js */ "../node_modules/@arcgis/core/arcade/lib/character.js");
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./messages.js */ "../node_modules/@arcgis/core/arcade/lib/messages.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(e){return"0123456789abcdef".indexOf(e.toLowerCase())}function n(e){return"01234567".indexOf(e)}class r{constructor(e,t){this.source=e,this.errorHandler=t,this.trackComment=!1,this.isModule=!1,this.length=e.length,this.index=0,this.lineNumber=e.length>0?1:0,this.lineStart=0,this.curlyStack=[]}saveState(){return{index:this.index,lineNumber:this.lineNumber,lineStart:this.lineStart,curlyStack:this.curlyStack.slice()}}restoreState(e){this.index=e.index,this.lineNumber=e.lineNumber,this.lineStart=e.lineStart,this.curlyStack=e.curlyStack}eof(){return this.index>=this.length}throwUnexpectedToken(e=_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedTokenIllegal){return this.errorHandler.throwError(this.index,this.lineNumber,this.index-this.lineStart+1,e)}tolerateUnexpectedToken(e=_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnexpectedTokenIllegal){this.errorHandler.tolerateError(this.index,this.lineNumber,this.index-this.lineStart+1,e)}skipSingleLineComment(e){let i=[],s=0,n=null;for(this.trackComment&&(i=[],s=this.index-e,n={start:{line:this.lineNumber,column:this.index-this.lineStart-e},end:{line:0,column:0}});!this.eof();){const r=this.source.charCodeAt(this.index);if(++this.index,_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(r)){if(n){n.end={line:this.lineNumber,column:this.index-this.lineStart-1};const t={multiLine:!1,slice:[s+e,this.index-1],range:[s,this.index-1],loc:n};i.push(t)}return 13===r&&10===this.source.charCodeAt(this.index)&&++this.index,++this.lineNumber,this.lineStart=this.index,i}}if(n){n.end={line:this.lineNumber,column:this.index-this.lineStart};const t={multiLine:!1,slice:[s+e,this.index],range:[s,this.index],loc:n};i.push(t)}return i}skipMultiLineComment(){const e=[];let i=0,s=null;for(this.trackComment&&(i=this.index-2,s={start:{line:this.lineNumber,column:this.index-this.lineStart-2},end:{line:0,column:0}});!this.eof();){const n=this.source.charCodeAt(this.index);if(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(n))13===n&&10===this.source.charCodeAt(this.index+1)&&++this.index,++this.lineNumber,++this.index,this.lineStart=this.index;else if(42===n){if(47===this.source.charCodeAt(this.index+1)){if(this.index+=2,s){s.end={line:this.lineNumber,column:this.index-this.lineStart};const t={multiLine:!0,slice:[i+2,this.index-2],range:[i,this.index],loc:s};e.push(t)}return e}++this.index}else++this.index}if(s){s.end={line:this.lineNumber,column:this.index-this.lineStart};const t={multiLine:!0,slice:[i+2,this.index],range:[i,this.index],loc:s};e.push(t)}return this.tolerateUnexpectedToken(),e}scanComments(){let e=null;this.trackComment&&(e=[]);let i=0===this.index;for(;!this.eof();){let s=this.source.charCodeAt(this.index);if(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isWhiteSpace(s))++this.index;else if(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(s))++this.index,13===s&&10===this.source.charCodeAt(this.index)&&++this.index,++this.lineNumber,this.lineStart=this.index,i=!0;else if(47===s)if(s=this.source.charCodeAt(this.index+1),47===s){this.index+=2;const t=this.skipSingleLineComment(2);e&&(e=e.concat(t)),i=!0}else{if(42!==s)break;{this.index+=2;const t=this.skipMultiLineComment();e&&(e=e.concat(t))}}else if(i&&45===s){if(45!==this.source.charCodeAt(this.index+1)||62!==this.source.charCodeAt(this.index+2))break;{this.index+=3;const t=this.skipSingleLineComment(3);e&&(e=e.concat(t))}}else{if(60!==s||this.isModule)break;if("!--"!==this.source.slice(this.index+1,this.index+4))break;{this.index+=4;const t=this.skipSingleLineComment(4);e&&(e=e.concat(t))}}}return e}isKeyword(e){switch((e=e.toLowerCase()).length){case 2:return"if"===e||"in"===e;case 3:return"var"===e||"for"===e;case 4:return"else"===e;case 5:return"break"===e;case 6:return"return"===e;case 8:return"function"===e||"continue"===e;default:return!1}}codePointAt(e){let t=this.source.charCodeAt(e);if(t>=55296&&t<=56319){const i=this.source.charCodeAt(e+1);if(i>=56320&&i<=57343){t=1024*(t-55296)+i-56320+65536}}return t}scanHexEscape(e){const i="u"===e?4:2;let n=0;for(let r=0;r<i;++r){if(this.eof()||!_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isHexDigit(this.source.charCodeAt(this.index)))return null;n=16*n+s(this.source[this.index++])}return String.fromCharCode(n)}scanUnicodeCodePointEscape(){let e=this.source[this.index],i=0;for("}"===e&&this.throwUnexpectedToken();!this.eof()&&(e=this.source[this.index++],_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isHexDigit(e.charCodeAt(0)));)i=16*i+s(e);return(i>1114111||"}"!==e)&&this.throwUnexpectedToken(),_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].fromCodePoint(i)}getIdentifier(){const e=this.index++;for(;!this.eof();){const i=this.source.charCodeAt(this.index);if(92===i)return this.index=e,this.getComplexIdentifier();if(i>=55296&&i<57343)return this.index=e,this.getComplexIdentifier();if(!_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierPart(i))break;++this.index}return this.source.slice(e,this.index)}getComplexIdentifier(){let e,i=this.codePointAt(this.index),s=_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].fromCodePoint(i);for(this.index+=s.length,92===i&&(117!==this.source.charCodeAt(this.index)&&this.throwUnexpectedToken(),++this.index,"{"===this.source[this.index]?(++this.index,e=this.scanUnicodeCodePointEscape()):(e=this.scanHexEscape("u"),null!==e&&"\\"!==e&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(e.charCodeAt(0))||this.throwUnexpectedToken()),s=e);!this.eof()&&(i=this.codePointAt(this.index),_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierPart(i));)e=_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].fromCodePoint(i),s+=e,this.index+=e.length,92===i&&(s=s.substr(0,s.length-1),117!==this.source.charCodeAt(this.index)&&this.throwUnexpectedToken(),++this.index,"{"===this.source[this.index]?(++this.index,e=this.scanUnicodeCodePointEscape()):(e=this.scanHexEscape("u"),null!==e&&"\\"!==e&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierPart(e.charCodeAt(0))||this.throwUnexpectedToken()),s+=e);return s}octalToDecimal(e){let i="0"!==e,s=n(e);return!this.eof()&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(this.source.charCodeAt(this.index))&&(i=!0,s=8*s+n(this.source[this.index++]),"0123".indexOf(e)>=0&&!this.eof()&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(this.source.charCodeAt(this.index))&&(s=8*s+n(this.source[this.index++]))),{code:s,octal:i}}scanIdentifier(){let e;const t=this.index,s=92===this.source.charCodeAt(t)?this.getComplexIdentifier():this.getIdentifier();if(e=1===s.length?3:this.isKeyword(s)?4:"null"===s.toLowerCase()?5:"true"===s.toLowerCase()||"false"===s.toLowerCase()?1:3,3!==e&&t+s.length!==this.index){const e=this.index;this.index=t,this.tolerateUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidEscapedReservedWord),this.index=e}return{type:e,value:s,lineNumber:this.lineNumber,lineStart:this.lineStart,start:t,end:this.index}}scanPunctuator(){const e=this.index;let t=this.source[this.index];switch(t){case"(":case"{":"{"===t&&this.curlyStack.push("{"),++this.index;break;case".":++this.index;break;case"}":++this.index,this.curlyStack.pop();break;case")":case";":case",":case"[":case"]":case":":case"?":case"~":++this.index;break;default:t=this.source.substr(this.index,4),">>>="===t?this.index+=4:(t=t.substr(0,3),"==="===t||"!=="===t||">>>"===t||"<<="===t||">>="===t||"**="===t?this.index+=3:(t=t.substr(0,2),"&&"===t||"||"===t||"=="===t||"!="===t||"+="===t||"-="===t||"*="===t||"/="===t||"++"===t||"--"===t||"<<"===t||">>"===t||"&="===t||"|="===t||"^="===t||"%="===t||"<="===t||">="===t||"=>"===t||"**"===t?this.index+=2:(t=this.source[this.index],"<>=!+-*%&|^/".indexOf(t)>=0&&++this.index)))}return this.index===e&&this.throwUnexpectedToken(),{type:7,value:t,lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}}scanHexLiteral(e){let i="";for(;!this.eof()&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isHexDigit(this.source.charCodeAt(this.index));)i+=this.source[this.index++];return 0===i.length&&this.throwUnexpectedToken(),_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseInt("0x"+i,16),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}}scanBinaryLiteral(e){let i="";for(;!this.eof();){const e=this.source[this.index];if("0"!==e&&"1"!==e)break;i+=this.source[this.index++]}if(0===i.length&&this.throwUnexpectedToken(),!this.eof()){const e=this.source.charCodeAt(this.index);(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(e)||_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(e))&&this.throwUnexpectedToken()}return{type:6,value:parseInt(i,2),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}}scanOctalLiteral(e,i){let s="",n=!1;for(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(e.charCodeAt(0))?(n=!0,s="0"+this.source[this.index++]):++this.index;!this.eof()&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(this.source.charCodeAt(this.index));)s+=this.source[this.index++];return n||0!==s.length||this.throwUnexpectedToken(),(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(this.source.charCodeAt(this.index))||_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index)))&&this.throwUnexpectedToken(),{type:6,value:parseInt(s,8),octal:n,lineNumber:this.lineNumber,lineStart:this.lineStart,start:i,end:this.index}}scanNumericLiteral(){const i=this.index;let s=this.source[i];Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(s.charCodeAt(0))||"."===s,"Numeric literal must start with a decimal digit or a decimal point");let n="";if("."!==s){if(n=this.source[this.index++],s=this.source[this.index],"0"===n){if("x"===s||"X"===s)return++this.index,this.scanHexLiteral(i);if("b"===s||"B"===s)return++this.index,this.scanBinaryLiteral(i);if("o"===s||"O"===s)return this.scanOctalLiteral(s,i)}for(;_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];s=this.source[this.index]}if("."===s){for(n+=this.source[this.index++];_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];s=this.source[this.index]}if("e"===s||"E"===s)if(n+=this.source[this.index++],s=this.source[this.index],"+"!==s&&"-"!==s||(n+=this.source[this.index++]),_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index)))for(;_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index));)n+=this.source[this.index++];else this.throwUnexpectedToken();return _character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(),{type:6,value:parseFloat(n),lineNumber:this.lineNumber,lineStart:this.lineStart,start:i,end:this.index}}scanStringLiteral(){const s=this.index;let n=this.source[s];Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])("'"===n||'"'===n,"String literal must starts with a quote"),++this.index;let r=!1,h="";for(;!this.eof();){let e=this.source[this.index++];if(e===n){n="";break}if("\\"===e)if(e=this.source[this.index++],e&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(e.charCodeAt(0)))++this.lineNumber,"\r"===e&&"\n"===this.source[this.index]&&++this.index,this.lineStart=this.index;else switch(e){case"u":if("{"===this.source[this.index])++this.index,h+=this.scanUnicodeCodePointEscape();else{const t=this.scanHexEscape(e);null===t&&this.throwUnexpectedToken(),h+=t}break;case"x":{const t=this.scanHexEscape(e);null===t&&this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidHexEscapeSequence),h+=t;break}case"n":h+="\n";break;case"r":h+="\r";break;case"t":h+="\t";break;case"b":h+="\b";break;case"f":h+="\f";break;case"v":h+="\v";break;case"8":case"9":h+=e,this.tolerateUnexpectedToken();break;default:if(e&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(e.charCodeAt(0))){const t=this.octalToDecimal(e);r=t.octal||r,h+=String.fromCharCode(t.code)}else h+=e}else{if(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(e.charCodeAt(0)))break;h+=e}}return""!==n&&(this.index=s,this.throwUnexpectedToken()),{type:8,value:h,octal:r,lineNumber:this.lineNumber,lineStart:this.lineStart,start:s,end:this.index}}scanTemplate(){let e="",s=!1;const n=this.index,r="`"===this.source[n];let h=!1,c=2;for(++this.index;!this.eof();){let n=this.source[this.index++];if("`"===n){c=1,h=!0,s=!0;break}if("$"===n){if("{"===this.source[this.index]){this.curlyStack.push("${"),++this.index,s=!0;break}e+=n}else if("\\"===n)if(n=this.source[this.index++],_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(n.charCodeAt(0)))++this.lineNumber,"\r"===n&&"\n"===this.source[this.index]&&++this.index,this.lineStart=this.index;else switch(n){case"n":e+="\n";break;case"r":e+="\r";break;case"t":e+="\t";break;case"u":if("{"===this.source[this.index])++this.index,e+=this.scanUnicodeCodePointEscape();else{const t=this.index,i=this.scanHexEscape(n);null!==i?e+=i:(this.index=t,e+=n)}break;case"x":{const t=this.scanHexEscape(n);null===t&&this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidHexEscapeSequence),e+=t;break}case"b":e+="\b";break;case"f":e+="\f";break;case"v":e+="\v";break;default:"0"===n?(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index))&&this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].TemplateOctalLiteral),e+="\0"):_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isOctalDigit(n.charCodeAt(0))?this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].TemplateOctalLiteral):e+=n}else _character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(n.charCodeAt(0))?(++this.lineNumber,"\r"===n&&"\n"===this.source[this.index]&&++this.index,this.lineStart=this.index,e+="\n"):e+=n}return s||this.throwUnexpectedToken(),r||this.curlyStack.pop(),{type:10,value:this.source.slice(n+1,this.index-c),cooked:e,head:r,tail:h,lineNumber:this.lineNumber,lineStart:this.lineStart,start:n,end:this.index}}testRegExp(e,t){const s="￿";let n=e;t.indexOf("u")>=0&&(n=n.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g,((e,t,n)=>{const r=parseInt(t||n,16);return r>1114111&&this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidRegExp),r<=65535?String.fromCharCode(r):s})).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,s));try{RegExp(n)}catch(r){this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].InvalidRegExp)}try{return new RegExp(e,t)}catch(h){return null}}scanRegExpBody(){let s=this.source[this.index];Object(_assert_js__WEBPACK_IMPORTED_MODULE_0__["assert"])("/"===s,"Regular expression literal must start with a slash");let n=this.source[this.index++],r=!1,h=!1;for(;!this.eof();)if(s=this.source[this.index++],n+=s,"\\"===s)s=this.source[this.index++],_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(s.charCodeAt(0))&&this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnterminatedRegExp),n+=s;else if(_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isLineTerminator(s.charCodeAt(0)))this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnterminatedRegExp);else if(r)"]"===s&&(r=!1);else{if("/"===s){h=!0;break}"["===s&&(r=!0)}return h||this.throwUnexpectedToken(_messages_js__WEBPACK_IMPORTED_MODULE_2__["Messages"].UnterminatedRegExp),n.substr(1,n.length-2)}scanRegExpFlags(){let e="",i="";for(;!this.eof();){let s=this.source[this.index];if(!_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierPart(s.charCodeAt(0)))break;if(++this.index,"\\"!==s||this.eof())i+=s,e+=s;else if(s=this.source[this.index],"u"===s){++this.index;let t=this.index;const s=this.scanHexEscape("u");if(null!==s)for(i+=s,e+="\\u";t<this.index;++t)e+=this.source[t];else this.index=t,i+="u",e+="\\u";this.tolerateUnexpectedToken()}else e+="\\",this.tolerateUnexpectedToken()}return i}scanRegExp(){const e=this.index,t=this.scanRegExpBody(),i=this.scanRegExpFlags();return{type:9,value:"",pattern:t,flags:i,regex:this.testRegExp(t,i),lineNumber:this.lineNumber,lineStart:this.lineStart,start:e,end:this.index}}lex(){if(this.eof())return{type:2,value:"",lineNumber:this.lineNumber,lineStart:this.lineStart,start:this.index,end:this.index};const e=this.source.charCodeAt(this.index);return _character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(e)?this.scanIdentifier():40===e||41===e||59===e?this.scanPunctuator():39===e||34===e?this.scanStringLiteral():46===e?_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(this.source.charCodeAt(this.index+1))?this.scanNumericLiteral():this.scanPunctuator():_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isDecimalDigit(e)?this.scanNumericLiteral():96===e||125===e&&"${"===this.curlyStack[this.curlyStack.length-1]?this.scanTemplate():e>=55296&&e<57343&&_character_js__WEBPACK_IMPORTED_MODULE_1__["Character"].isIdentifierStart(this.codePointAt(this.index))?this.scanIdentifier():this.scanPunctuator()}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/syntax.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/syntax.js ***!
  \*********************************************************/
/*! exports provided: Syntax */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Syntax", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={AssignmentExpression:"AssignmentExpression",ArrayExpression:"ArrayExpression",BlockStatement:"BlockStatement",BinaryExpression:"BinaryExpression",BreakStatement:"BreakStatement",CallExpression:"CallExpression",ContinueStatement:"ContinueStatement",EmptyStatement:"EmptyStatement",ExpressionStatement:"ExpressionStatement",ForStatement:"ForStatement",ForInStatement:"ForInStatement",FunctionDeclaration:"FunctionDeclaration",FunctionExpression:"FunctionExpression",Identifier:"Identifier",IfStatement:"IfStatement",Literal:"Literal",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",ObjectExpression:"ObjectExpression",Program:"Program",Property:"Property",ReturnStatement:"ReturnStatement",TemplateElement:"TemplateElement",TemplateLiteral:"TemplateLiteral",UnaryExpression:"UnaryExpression",UpdateExpression:"UpdateExpression",VariableDeclaration:"VariableDeclaration",VariableDeclarator:"VariableDeclarator"};


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/token.js":
/*!********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/token.js ***!
  \********************************************************/
/*! exports provided: TokenName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TokenName", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={1:"Boolean",2:"<end>",3:"Identifier",4:"Keyword",5:"Null",6:"Numeric",7:"Punctuator",8:"String",9:"RegularExpression",10:"Template"};


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/lib/tokenizer.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/lib/tokenizer.js ***!
  \************************************************************/
/*! exports provided: Tokenizer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Tokenizer", function() { return o; });
/* harmony import */ var _error_handler_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./error-handler.js */ "../node_modules/@arcgis/core/arcade/lib/error-handler.js");
/* harmony import */ var _nodes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./nodes.js */ "../node_modules/@arcgis/core/arcade/lib/nodes.js");
/* harmony import */ var _scanner_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scanner.js */ "../node_modules/@arcgis/core/arcade/lib/scanner.js");
/* harmony import */ var _token_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./token.js */ "../node_modules/@arcgis/core/arcade/lib/token.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class c{constructor(){this.values=[],this.curly=this.paren=-1}beforeFunctionExpression(e){return["(","{","[","return",",",..._nodes_js__WEBPACK_IMPORTED_MODULE_1__["AssignmentOperators"],..._nodes_js__WEBPACK_IMPORTED_MODULE_1__["BinaryOperators"],..._nodes_js__WEBPACK_IMPORTED_MODULE_1__["LogicalOperators"],..._nodes_js__WEBPACK_IMPORTED_MODULE_1__["UnaryOperators"]].indexOf(e)>=0}isRegexStart(){const e=this.values[this.values.length-1];let t=null!==e;switch(e){case"this":case"]":t=!1;break;case")":{const e=this.values[this.paren-1];t="if"===e||"while"===e||"for"===e||"with"===e}break;case"}":if(t=!0,"function"===this.values[this.curly-3]){const e=this.values[this.curly-4];t=!!e&&!this.beforeFunctionExpression(e)}else if("function"===this.values[this.curly-4]){const e=this.values[this.curly-5];t=!e||!this.beforeFunctionExpression(e)}}return t}push(e){7===e.type||4===e.type?("{"===e.value?this.curly=this.values.length:"("===e.value&&(this.paren=this.values.length),this.values.push(e.value)):this.values.push(null)}}class o{constructor(t,s){this.errorHandler=new _error_handler_js__WEBPACK_IMPORTED_MODULE_0__["ErrorHandler"],this.errorHandler.tolerant=!!s&&("boolean"==typeof s.tolerant&&s.tolerant),this.scanner=new _scanner_js__WEBPACK_IMPORTED_MODULE_2__["Scanner"](t,this.errorHandler),this.scanner.trackComment=!!s&&("boolean"==typeof s.comment&&s.comment),this.trackRange=!!s&&("boolean"==typeof s.range&&s.range),this.trackLoc=!!s&&("boolean"==typeof s.loc&&s.loc),this.buffer=[],this.reader=new c}errors(){return this.errorHandler.errors}getNextToken(){if(0===this.buffer.length){const t=this.scanner.scanComments();if(t)for(let e=0;e<t.length;++e){const s=t[e],n=this.scanner.source.slice(s.slice[0],s.slice[1]),r={type:s.multiLine?"BlockComment":"LineComment",value:n};this.trackRange&&(r.range=s.range),this.trackLoc&&(r.loc=s.loc),this.buffer.push(r)}if(!this.scanner.eof()){let t=null;this.trackLoc&&(t={start:{line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},end:{line:0,column:0}});let s;if("/"===this.scanner.source[this.scanner.index]&&this.reader.isRegexStart()){const t=this.scanner.saveState();try{s=this.scanner.scanRegExp()}catch(e){this.scanner.restoreState(t),s=this.scanner.lex()}}else s=this.scanner.lex();this.reader.push(s);const n={type:_token_js__WEBPACK_IMPORTED_MODULE_3__["TokenName"][s.type],value:this.scanner.source.slice(s.start,s.end)};if(this.trackRange&&(n.range=[s.start,s.end]),this.trackLoc&&t&&(t.end={line:this.scanner.lineNumber,column:this.scanner.index-this.scanner.lineStart},n.loc=t),9===s.type){const e=s.pattern,t=s.flags;n.regex={pattern:e,flags:t}}this.buffer.push(n)}}return this.buffer.shift()}}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/parser.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/parser.js ***!
  \*****************************************************/
/*! exports provided: extractExpectedFieldLiterals, extractFieldLiterals, parseScript, referencesFunction, referencesMember, scriptCheck, validateScript */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractExpectedFieldLiterals", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractFieldLiterals", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseScript", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesFunction", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesMember", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scriptCheck", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateScript", function() { return d; });
/* harmony import */ var _treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./treeAnalysis.js */ "../node_modules/@arcgis/core/arcade/treeAnalysis.js");
/* harmony import */ var _lib_arcade_parser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/arcade-parser.js */ "../node_modules/@arcgis/core/arcade/lib/arcade-parser.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(r,t=[]){const o=Object(_lib_arcade_parser_js__WEBPACK_IMPORTED_MODULE_1__["parse"])("function _() { "+r+"\n}");if(null===o.body||void 0===o.body)throw new Error("No formula provided.");if(0===o.body.length)throw new Error("No formula provided.");if(0===o.body.length)throw new Error("No formula provided.");if("BlockStatement"!==o.body[0].body.type)throw new Error("Invalid formula content.");const i=Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["validateLanguage"])(o);if(""!==i)throw new Error(i);return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["findScriptDependencies"])(o,t),o}function s(n,e,t,o,i){const c=[],l="function _() { \n".length-1,a="function _() { \n"+n+"\n}";try{const n=Object(_lib_arcade_parser_js__WEBPACK_IMPORTED_MODULE_1__["parse"])(a,{tolerant:!0,loc:!0,range:!0}),s=n.errors;if(s.length>0)for(let e=0;e<s.length;e++)c.push({line:s[e].lineNumber-2,character:s[e].column,reason:s[e].description});const f=Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["checkScript"])(n,e,t,o,i);for(let e=0;e<f.length;e++)f[e].line=f[e].line-2,f[e].range&&(f[e].range=[f[e][0]-l,f[e][1]-l]),f[e].loc&&(f[e].loc.start.line=f[e].loc.start.line-2,f[e].loc.end.line=f[e].loc.end.line-2),c.push(f[e])}catch(s){try{if("Unexpected token }"===s.description){const n=a.split("\n").length;s.lineNumber===n?(s.index=a.length-1,c.push({line:s.lineNumber-4,character:s.column,reason:"Unexpected end of script"})):(s.index=a.length-1,c.push({line:s.lineNumber-2,character:s.column,reason:"Unexpected end of script"}))}else c.push({line:s.lineNumber-2,character:s.column,reason:s.description})}catch(f){}}return c}function f(n,e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["findFieldLiterals"])(n)}function d(n,e,r){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["validateScript"])(n,e,r)}function h(n){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["findExpectedFieldLiterals"])(n)}function p(n,e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["referencesMember"])(n,e)}function m(n,e){return Object(_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_0__["referencesFunction"])(n,e)}


/***/ }),

/***/ "../node_modules/@arcgis/core/arcade/treeAnalysis.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/arcade/treeAnalysis.js ***!
  \***********************************************************/
/*! exports provided: addFunctionDeclaration, checkFunctionSignature, checkScript, constructGlobalScope, extractAllIssues, extractAllIssuesInFunction, extractFunctionDeclaration, findExpectedFieldLiterals, findFieldLiterals, findFunction, findFunctionCalls, findScriptDependencies, functionDecls, makeError, nodeErrorMessage, referencesFunction, referencesMember, scriptUsesFeatureSet, testValidityOfExpression, validateFunction, validateLanguage, validateLanguageNode, validateScript, walk */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addFunctionDeclaration", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkFunctionSignature", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkScript", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "constructGlobalScope", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractAllIssues", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractAllIssuesInFunction", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractFunctionDeclaration", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findExpectedFieldLiterals", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findFieldLiterals", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findFunction", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findFunctionCalls", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findScriptDependencies", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "functionDecls", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeError", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "nodeErrorMessage", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesFunction", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "referencesMember", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scriptUsesFeatureSet", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testValidityOfExpression", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateFunction", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateLanguage", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateLanguageNode", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateScript", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "walk", function() { return l; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={concatenate:{min:"0",max:"*"},expects:{min:"1",max:"*"},getfeatureset:{min:"1",max:"2"},week:{min:"1",max:"2"},fromjson:{min:"1",max:"1"},length3d:{min:"1",max:"2"},tohex:{min:"1",max:"1"},hash:{min:"1",max:"1"},isoweek:{min:"1",max:"1"},isoweekday:{min:"1",max:"1"},isomonth:{min:"1",max:"1"},isoyear:{min:"1",max:"1"},resize:{min:"2",max:"3"},slice:{min:"0",max:"*"},splice:{min:"0",max:"*"},push:{min:"2",max:"2"},pop:{min:"1",max:"1"},includes:{min:"2",max:"2"},array:{min:"1",max:"2"},front:{min:"1",max:"1"},back:{min:"1",max:"1"},insert:{min:"3",max:"3"},erase:{min:"2",max:"2"},split:{min:"2",max:"4"},guid:{min:"0",max:"1"},today:{min:"0",max:"0"},angle:{min:"2",max:"3"},bearing:{min:"2",max:"3"},urlencode:{min:"1",max:"1"},now:{min:"0",max:"0"},timestamp:{min:"0",max:"0"},day:{min:"1",max:"1"},month:{min:"1",max:"1"},year:{min:"1",max:"1"},hour:{min:"1",max:"1"},second:{min:"1",max:"1"},millisecond:{min:"1",max:"1"},minute:{min:"1",max:"1"},weekday:{min:"1",max:"1"},toutc:{min:"1",max:"1"},tolocal:{min:"1",max:"1"},date:{min:"0",max:"7"},datediff:{min:"2",max:"3"},dateadd:{min:"2",max:"3"},trim:{min:"1",max:"1"},text:{min:"1",max:"2"},left:{min:"2",max:"2"},right:{min:"2",max:"2"},mid:{min:"2",max:"3"},upper:{min:"1",max:"1"},proper:{min:"1",max:"2"},lower:{min:"1",max:"1"},find:{min:"2",max:"3"},iif:{min:"3",max:"3"},decode:{min:"2",max:"*"},when:{min:"2",max:"*"},defaultvalue:{min:"2",max:"2"},isempty:{min:"1",max:"1"},domaincode:{min:"2",max:"4"},domainname:{min:"2",max:"4"},polygon:{min:"1",max:"1"},point:{min:"1",max:"1"},polyline:{min:"1",max:"1"},extent:{min:"1",max:"1"},multipoint:{min:"1",max:"1"},ringisclockwise:{min:"1",max:"1"},geometry:{min:"1",max:"1"},count:{min:"0",max:"*"},number:{min:"1",max:"2"},acos:{min:"1",max:"1"},asin:{min:"1",max:"1"},atan:{min:"1",max:"1"},atan2:{min:"2",max:"2"},ceil:{min:"1",max:"2"},floor:{min:"1",max:"2"},round:{min:"1",max:"2"},cos:{min:"1",max:"1"},exp:{min:"1",max:"1"},log:{min:"1",max:"1"},min:{min:"0",max:"*"},constrain:{min:"3",max:"3"},console:{min:"0",max:"*"},max:{min:"0",max:"*"},pow:{min:"2",max:"2"},random:{min:"0",max:"0"},sqrt:{min:"1",max:"1"},sin:{min:"1",max:"1"},tan:{min:"1",max:"1"},abs:{min:"1",max:"1"},isnan:{min:"1",max:"1"},stdev:{min:"0",max:"*"},average:{min:"0",max:"*"},mean:{min:"0",max:"*"},sum:{min:"0",max:"*"},variance:{min:"0",max:"*"},distinct:{min:"0",max:"*"},first:{min:"1",max:"1"},top:{min:"2",max:"2"},boolean:{min:"1",max:"1"},dictionary:{min:"0",max:"*"},typeof:{min:"1",max:"1"},reverse:{min:"1",max:"1"},replace:{min:"3",max:"4"},sort:{min:"1",max:"2"},feature:{min:"1",max:"*"},haskey:{min:"2",max:"2"},indexof:{min:"2",max:"2"},disjoint:{min:"2",max:"2"},intersects:{min:"2",max:"2"},touches:{min:"2",max:"2"},crosses:{min:"2",max:"2"},within:{min:"2",max:"2"},contains:{min:"2",max:"2"},overlaps:{min:"2",max:"2"},equals:{min:"2",max:"2"},relate:{min:"3",max:"3"},intersection:{min:"2",max:"2"},union:{min:"1",max:"2"},difference:{min:"2",max:"2"},symmetricdifference:{min:"2",max:"2"},clip:{min:"2",max:"2"},cut:{min:"2",max:"2"},area:{min:"1",max:"2"},areageodetic:{min:"1",max:"2"},length:{min:"1",max:"2"},lengthgeodetic:{min:"1",max:"2"},distancegeodetic:{min:"2",max:"3"},distance:{min:"2",max:"3"},densify:{min:"2",max:"3"},densifygeodetic:{min:"2",max:"3"},generalize:{min:"2",max:"4"},buffer:{min:"2",max:"3"},buffergeodetic:{min:"2",max:"3"},offset:{min:"2",max:"6"},rotate:{min:"2",max:"3"},issimple:{min:"1",max:"1"},simplify:{min:"1",max:"1"},centroid:{min:"1",max:"1"},isselfintersecting:{min:"1",max:"1"},multiparttosinglepart:{min:"1",max:"1"},setgeometry:{min:"2",max:"2"},portal:{min:"1",max:"1"},getuser:{min:"1",max:"2"},subtypes:{min:"1",max:"1"},subtypecode:{min:"1",max:"1"},subtypename:{min:"1",max:"1"},domain:{min:"2",max:"3"},convertdirection:{min:"3",max:"3"},schema:{min:"1",max:"1"}};for(const k in e)e[k].fmin=e[k].min,e[k].fmax=e[k].max;const t=["featureset","getuser","featuresetbyid","featuresetbyname","featuresetbyassociation","featuresetbyrelationshipname","featuresetbyurl","getfeatureset","attachments","featuresetbyportalitem"],n=["disjoint","intersects","touches","crosses","within","contains","overlaps","equals","relate","intersection","union","difference","symmetricdifference","clip","cut","area","areageodetic","length","length3d","lengthgeodetic","distance","distancegeodetic","densify","densifygeodetic","generalize","buffer","buffergeodetic","offset","rotate","issimple","simplify","multiparttosinglepart"];function a(e){return"string"==typeof e||e instanceof String}function r(t,n){const a=e[t.name.toLowerCase()];void 0===a?e[t.name.toLowerCase()]="sync"===n?{min:t.min,max:t.max}:{fmin:t.min,fmax:t.max}:"sync"===n?(a.min=t.min,a.max=t.max):(a.fmin=t.min,a.fmax=t.max)}function i(e,t){return"0"!==e.min&&t.length<Number(e.min)||"*"!==e.max&&t.length>Number(e.max)?-2:1}function s(e,t,n){if(null!==n.localScope&&void 0!==n.localScope[e.toLowerCase()]){const a=n.localScope[e.toLowerCase()];if("FormulaFunction"===a.type)return void 0===a.signature&&(a.signature={min:"0",max:"*"}),i(a.signature,t);if("any"===a.type)return void 0===a.signature&&(a.signature={min:"0",max:"*"}),i(a.signature,t)}if(void 0!==n.globalScope[e.toLowerCase()]){const a=n.globalScope[e.toLowerCase()];if("FormulaFunction"===a.type)return void 0===a.signature&&(a.signature={min:"0",max:"*"}),i(a.signature,t);if("any"===a.type)return void 0===a.signature&&(a.signature={min:"0",max:"*"}),i(a.signature,t)}return-1}function o(e,t){if(e)for(const n of e)l(n,t)}function l(e,t){if(e&&!1!==t(e))switch(e.type){case"ArrayExpression":o(e.elements,t);break;case"AssignmentExpression":case"BinaryExpression":l(e.left,t),l(e.right,t);break;case"BlockStatement":o(e.body,t);break;case"BreakStatement":break;case"CallExpression":l(e.callee,t),o(e.arguments,t);break;case"ContinueStatement":case"EmptyStatement":break;case"ExpressionStatement":l(e.expression,t);break;case"ForInStatement":l(e.left,t),l(e.right,t),l(e.body,t);break;case"ForStatement":l(e.init,t),l(e.test,t),l(e.update,t),l(e.body,t);break;case"FunctionDeclaration":l(e.id,t),o(e.params,t),l(e.body,t);break;case"Identifier":break;case"IfStatement":l(e.test,t),l(e.consequent,t),l(e.alternate,t);break;case"Literal":break;case"LogicalExpression":l(e.left,t),l(e.right,t);break;case"MemberExpression":l(e.object,t),l(e.property,t);break;case"ObjectExpression":o(e.properties,t);break;case"Program":o(e.body,t);break;case"Property":l(e.key,t),l(e.value,t);break;case"ReturnStatement":case"UnaryExpression":case"UpdateExpression":l(e.argument,t);break;case"VariableDeclaration":o(e.declarations,t);break;case"VariableDeclarator":l(e.id,t),l(e.init,t);break;case"TemplateLiteral":o(e.expressions,t),o(e.quasis,t)}}function m(e,t=!0){let n=E(e,"SYNTAX","UNREOGNISED");try{switch(e.type){case"VariableDeclarator":return"Identifier"!==e.id.type?E(e,"SYNTAX","VARIABLEMUSTHAVEIDENTIFIER"):null!==e.init?m(e.init,!1):"";case"VariableDeclaration":for(let a=0;a<e.declarations.length;a++)if(n=m(e.declarations[a],t),""!==n)return n;return"";case"ForInStatement":if(n=m(e.left,t),""!==n)return n;if("VariableDeclaration"===e.left.type){if(e.left.declarations.length>1)return E(e,"SYNTAX","ONLY1VAR");if(null!==e.left.declarations[0].init)return E(e,"SYNTAX","CANNOTDECLAREVAL")}else if("Identifier"!==e.left.type)return E(e,"SYNTAX","LEFTNOTVAR");return n=m(e.right,t),""!==n?n:(n=m(e.body,t),""!==n?n:"");case"ForStatement":return null!==e.test&&(n=m(e.test,t),""!==n)||(null!==e.init&&(n=m(e.init,t),""!==n)||null!==e.update&&(n=m(e.update,t),""!==n)||null!==e.body&&(n=m(e.body,t),""!==n))?n:"";case"ContinueStatement":case"EmptyStatement":case"BreakStatement":return"";case"IfStatement":return n=m(e.test,t),""!==n||null!==e.consequent&&(n=m(e.consequent,!1),""!==n)||null!==e.alternate&&(n=m(e.alternate,!1),""!==n)?n:"";case"BlockStatement":{const a=[];for(let t=0;t<e.body.length;t++)"EmptyStatement"!==e.body[t].type&&a.push(e.body[t]);e.body=a;for(let r=0;r<e.body.length;r++)if(n=m(e.body[r],t),""!==n)return n;return""}case"FunctionDeclaration":return!1===t?E(e,"SYNTAX","GLOBALFUNCTIONSONLY"):"Identifier"!==e.id.type?E(e,"SYNTAX","FUNCTIONMUSTHAVEIDENTIFIER"):m(e.body,!1);case"ReturnStatement":return null!==e.argument?m(e.argument,t):"";case"UpdateExpression":return"Identifier"!==e.argument.type&&"MemberExpression"!==e.argument.type?E(e,"SYNTAX","ASSIGNMENTTOVARSONLY"):m(e.argument,t);case"AssignmentExpression":if("Identifier"!==e.left.type&&"MemberExpression"!==e.left.type)return E(e,"SYNTAX","ASSIGNMENTTOVARSONLY");if(n=m(e.left,t),""!==n)return n;switch(e.operator){case"=":case"/=":case"*=":case"%=":case"+=":case"-=":break;default:return E(e,"SYNTAX","OPERATORNOTRECOGNISED")}return m(e.right,!1);case"ExpressionStatement":return"AssignmentExpression"===e.expression.type||e.expression.type,m(e.expression,!1);case"Identifier":n="";break;case"MemberExpression":return n=m(e.object,t),""!==n?n:!0===e.computed?m(e.property,t):"";case"Literal":case"TemplateElement":return"";case"CallExpression":if("Identifier"!==e.callee.type)return E(e,"SYNTAX","ONLYNODESSUPPORTED");n="";for(let a=0;a<e.arguments.length;a++)if(n=m(e.arguments[a],t),""!==n)return n;return"";case"UnaryExpression":n=m(e.argument,t);break;case"BinaryExpression":if(n=m(e.left,t),""!==n)return n;if(n=m(e.right,t),""!==n)return n;switch(e.operator){case"|":case"&":case">>":case"<<":case">>":case">>>":case"^":case"==":case"!=":case"<":case"<=":case">":case">=":case"+":case"-":case"*":case"/":case"%":break;default:return E(e,"SYNTAX","OPERATORNOTRECOGNISED")}return"";case"LogicalExpression":if(n=m(e.left,t),""!==n)return n;if(n=m(e.right),""!==n)return n;switch(e.operator){case"&&":case"||":break;default:return E(e,"SYNTAX","OPERATORNOTRECOGNISED")}return"";case"ArrayExpression":n="";for(let a=0;a<e.elements.length;a++)if(n=m(e.elements[a],t),""!==n)return n;return n;case"TemplateLiteral":n="";for(let a=0;a<e.quasis.length;a++)if(n=m(e.quasis[a],t),""!==n)return n;for(let a=0;a<e.expressions.length;a++)if(n=m(e.expressions[a],t),""!==n)return n;return n;case"ObjectExpression":n="";for(let a=0;a<e.properties.length;a++){if(n="",null!==e.properties[a].key&&("Literal"!==e.properties[a].key.type&&"Identifier"!==e.properties[a].key.type&&(n=E(e,"SYNTAX","OBJECTPROPERTYMUSTBESTRING")),"Literal"===e.properties[a].key.type)){const t=e.properties[a].key,r="value"in t?t.value:null;"string"==typeof r||r instanceof String||(n=E(e,"SYNTAX","OBJECTPROPERTYMUSTBESTRING"))}if(""===n&&(n=m(e.properties[a],t)),""!==n)return n}return n;case"Property":return"Literal"!==e.key.type&&"Identifier"!==e.key.type?E(e,"SYNTAX","ONLYLITERAL"):("Identifier"!==e.key.type&&(n=m(e.key,t),""!==n)||(n=m(e.value,t)),n);default:return n}return n}catch(a){throw a}}function c(e,t){let n=E(e,"SYNTAX","UNREOGNISED"),a=null,r="";try{switch(e.type){case"VariableDeclarator":{const n=null===e.init?"":c(e.init,t);return""!==n?n:("Identifier"===e.id.type&&(null===t.localScope?t.globalScope[e.id.name.toLowerCase()]={type:"any"}:t.localScope[e.id.name.toLowerCase()]={type:"any"}),"")}case"FunctionDeclaration":return a=d(e.id.name.toLowerCase(),e),r=x(e,t),""!==r?r:null!==t.localScope?E(e,"SYNTAX","GLOBALFUNCTIONSONLY"):(a.isnative=!1,t.globalScope[e.id.name.toLowerCase()]={type:"FormulaFunction",signature:[a]},"");case"VariableDeclaration":n="";for(let a=0;a<e.declarations.length;a++)if(n=c(e.declarations[a],t),""!==n)return n;return n;case"IfStatement":return n=c(e.test,t),""!==n?n:"AssignmentExpression"===e.test.type||"UpdateExpression"===e.test.type?E(e.test,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION"):null!==e.consequent&&(n=c(e.consequent,t),""!==n)||null!==e.alternate&&(n=c(e.alternate,t),""!==n)?n:"";case"EmptyStatement":return"";case"BlockStatement":for(let a=0;a<e.body.length;a++)if(n=c(e.body[a],t),""!==n)return n;return"";case"ReturnStatement":return null!==e.argument?c(e.argument,t):"";case"ForInStatement":if("VariableDeclaration"===e.left.type){if(e.left.declarations.length>1)return E(e,"SYNTAX","ONLY1VAR");if(null!==e.left.declarations[0].init)return E(e,"SYNTAX","CANNOTDECLAREVAL")}else if("Identifier"!==e.left.type)return E(e,"SYNTAX","LEFTNOTVAR");return n=c(e.left,t),""!==n?n:(n=c(e.right,t),""!==n?n:(n=c(e.body,t),""!==n?n:""));case"ForStatement":return null!==e.init&&(n=c(e.init,t),""!==n)||(null!==e.test&&(n=c(e.test,t),""!==n)||null!==e.body&&(n=c(e.body,t),""!==n)||null!==e.update&&(n=c(e.update,t),""!==n))?n:"";case"BreakStatement":case"ContinueStatement":return"";case"UpdateExpression":{if("Identifier"!==e.argument.type&&"MemberExpression"!==e.argument.type)return E(e,"SYNTAX","ASSIGNMENTTOVARSONLY");let n=!1;return"MemberExpression"===e.argument.type?c(e.argument,t):(null!==t.localScope&&void 0!==t.localScope[e.argument.name.toLowerCase()]&&(n=!0),void 0!==t.globalScope[e.argument.name.toLowerCase()]&&(n=!0),!1===n?"Identifier "+e.argument.name+" has not been declared.":"")}case"AssignmentExpression":{if("Identifier"!==e.left.type&&"MemberExpression"!==e.left.type)return E(e,"SYNTAX","ASSIGNMENTTOVARSONLY");let n=c(e.right,t);if(""!==n)return n;let a=!1;return"MemberExpression"===e.left.type?(n=c(e.left,t),""!==n?n:""):(null!==t.localScope&&void 0!==t.localScope[e.left.name.toLowerCase()]&&(a=!0),void 0!==t.globalScope[e.left.name.toLowerCase()]&&(a=!0),!1===a?"Identifier "+e.left.name+" has not been declared.":"")}case"ExpressionStatement":return"AssignmentExpression"===e.expression.type||e.expression.type,c(e.expression,t);case"Identifier":{const a=e.name.toLowerCase();if(null!==t.localScope&&void 0!==t.localScope[a])return"";n=void 0!==t.globalScope[a]?"":E(e,"SYNTAX","VARIABLENOTFOUND");break}case"MemberExpression":return n=c(e.object,t),""!==n?n:!0===e.computed?c(e.property,t):"";case"Literal":case"TemplateElement":return"";case"CallExpression":{if("Identifier"!==e.callee.type)return E(e,"SYNTAX","ONLYNODESSUPPORTED");n="";for(let r=0;r<e.arguments.length;r++)if(n=c(e.arguments[r],t),""!==n)return n;const a=s(e.callee.name,e.arguments,t);-1===a&&(n=E(e,"SYNTAX","NOTFOUND")),-2===a&&(n=E(e,"SYNTAX","WRONGSIGNATURE"));break}case"UnaryExpression":n=c(e.argument,t);break;case"BinaryExpression":return n=c(e.left,t),""!==n?n:(n=c(e.right,t),""!==n?n:"");case"LogicalExpression":return n=c(e.left,t),""!==n?n:"AssignmentExpression"===e.left.type||"UpdateExpression"===e.left.type?E(e.left,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION"):(n=c(e.right,t),""!==n?n:"AssignmentExpression"===e.right.type||"UpdateExpression"===e.right.type?E(e.right,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION"):"");case"ArrayExpression":n="";for(let a=0;a<e.elements.length;a++)if(n=c(e.elements[a],t),""!==n)return n;return n;case"TemplateLiteral":n="";for(let a=0;a<e.quasis.length;a++)if(n=c(e.quasis[a],t),""!==n)return n;for(let a=0;a<e.expressions.length;a++)if(n=c(e.expressions[a],t),""!==n)return n;return n;case"ObjectExpression":n="";for(let a=0;a<e.properties.length;a++){if(n="",null!==e.properties[a].key&&("Literal"!==e.properties[a].key.type&&"Identifier"!==e.properties[a].key.type&&(n=E(e,"SYNTAX","OBJECTPROPERTYMUSTBESTRING")),"Literal"===e.properties[a].key.type)){const t=e.properties[a].key,r="value"in t?t.value:null;"string"==typeof r||r instanceof String||(n=E(e,"SYNTAX","OBJECTPROPERTYMUSTBESTRING"))}if(""===n&&(n=c(e.properties[a],t)),""!==n)return n}return n;case"Property":return"Literal"!==e.key.type&&"Identifier"!==e.key.type?E(e,"SYNTAX","ONLYLITERAL"):("Identifier"!==e.key.type&&(n=c(e.key,t),""!==n)||(n=c(e.value,t)),n);case"Program":case"TemplateElement":return n;default:return C(e),n}return n}catch(i){throw i}}function p(e,t){let n=!1;const a=t.toLowerCase();return l(e,(e=>!n&&("Identifier"===e.type&&e.name&&e.name.toLowerCase()===a&&(n=!0),!0))),n}function u(e,t){let n=!1;const a=t.toLowerCase();return l(e,(e=>!n&&("CallExpression"!==e.type||"Identifier"!==e.callee.type||!e.callee.name||e.callee.name.toLowerCase()!==a||(n=!0,!1)))),n}function f(e){const t=[];return l(e,(e=>"MemberExpression"!==e.type||"Identifier"!==e.object.type||(!1===e.computed&&e.object&&e.object.name&&e.property&&"Identifier"===e.property.type&&e.property.name?t.push(e.object.name.toLowerCase()+"."+e.property.name.toLowerCase()):e.object&&e.object.name&&e.property&&"Literal"===e.property.type&&"string"==typeof e.property.value&&t.push(e.object.name.toLowerCase()+"."+e.property.value.toString().toLowerCase()),!1))),t}function y(e){const t=[];return l(e,(e=>{if("CallExpression"===e.type&&"Identifier"===e.callee.type&&"expects"===e.callee.name.toLowerCase()){let n="";for(let r=0;r<(e.arguments||[]).length;r++)0===r?"Identifier"===e.arguments[r].type&&(n=e.arguments[r].name.toLowerCase()):n&&"Literal"===e.arguments[r].type&&a(e.arguments[r].value)&&t.push(n+"."+e.arguments[r].value.toLowerCase());return!1}return"MemberExpression"!==e.type||"Identifier"!==e.object.type||(!1===e.computed&&e.object&&e.object.name&&e.property&&"Identifier"===e.property.type&&e.property.name?t.push(e.object.name.toLowerCase()+"."+e.property.name.toLowerCase()):e.object&&e.object.name&&e.property&&"Literal"===e.property.type&&"string"==typeof e.property.value&&t.push(e.object.name.toLowerCase()+"."+e.property.value.toString().toLowerCase()),!1)})),t}function d(e,t){const n=[];if(void 0!==t.params&&null!==t.params)for(let a=0;a<t.params.length;a++)n.push("any");return{name:e,return:"any",params:n}}function x(e,t){const n={globalScope:t.globalScope,localScope:{}};for(let a=0;a<e.params.length;a++){const t=e.params[a].name;n.localScope[t.toLowerCase()]={type:"any"}}return c(e.body,n)}function N(e,t,n,a){const r={};null==e&&(e={}),null==n&&(n={}),r.infinity={type:"any"},r.textformatting={type:"any"},r.pi={type:"any"};for(const i in t)"sync"===a&&void 0!==t[i].min?r[i]={type:"FormulaFunction",signature:{min:t[i].min,max:t[i].max}}:"sync"!==a&&void 0!==t[i].fmin&&(r[i]={type:"FormulaFunction",signature:{min:t[i].fmin,max:t[i].fmax}});for(let i=0;i<n.length;i++){const e=n[i];r[e.name]={type:"FormulaFunction",signature:e}}for(const i in e)r[i]=e[i],r[i].type="any";return r}function S(t,n,a="async",r=e){const i={globalScope:N(n.vars,r,n.customFunctions,a),localScope:null};return c(t.body[0].body,i)}function b(e){return"BlockStatement"!==e.body[0].body.type?"Invalid formula content.":m(e.body[0].body)}function E(e,t,n){let a="";switch(t){case"SYNTAX":a="Syntax Error: ";break;case"RUNTIME":a="Runtime Error: ";break;default:a="Syntax Error: "}try{switch(e.type){case"IfStatement":switch(n){case"CANNOT_USE_ASSIGNMENT_IN_CONDITION":a+=" Assignments not be made in logical tests";break;case"CANNOT_USE_NONBOOLEAN_IN_CONDITION":a+=" Non Boolean used as Condition"}break;case"UpdateExpression":case"AssignmentExpression":switch(n){case"CANNOT_USE_ASSIGNMENT_IN_CONDITION":a+=" Assignments not be made in logical tests";break;case"ASSIGNMENTTOVARSONLY":a+=" Assignments can only be made to identifiers"}break;case"ExpressionStatement":a+=" Assignments can only be made to identifiers";break;case"FunctionDeclaration":switch(n){case"GLOBALFUNCTIONSONLY":a+=" Functions cannot be declared as variables";break;case"FUNCTIONMUSTHAVEIDENTIFIER":a+=" Function Definition must have an identifier"}break;case"VariableDeclaration":a+=" Only 1 variable can be declared at a time";break;case"VariableDeclarator":switch(n){case"FUNCTIONVARIABLEDECLARATOR":a+=" Functions cannot be declared as variables";break;case"VARIABLEMUSTHAVEIDENTIFIER":a+=" Variable Definition must have an identifier"}break;case"Identifier":a+=" Identifier Not Found. ",a+=e.name;break;case"ObjectExpression":if("OBJECTPROPERTYMUSTBESTRING"===n)a+=" Property name must be a string";break;case"ForStatement":if("CANNOT_USE_NONBOOLEAN_IN_CONDITION"===n)a+=" Non Boolean used as Condition";break;case"ForInStatement":switch(n){case"ONLY1VAR":a+=" Can only declare 1 var for use with IN";break;case"CANNOTDECLAREVAL":a+=" Can only declare value for use with IN";break;case"LEFTNOVAR":a+="Must provide a variable to iterate with.";break;case"VARIABLENOTDECLARED":a+="Variable must be declared before it is used..";break;case"CANNOTITERATETHISTYPE":a+="This type cannot be used in an IN loop"}break;case"MemberExpression":switch(n){case"PROPERTYNOTFOUND":a+="Cannot find member property. ",a+=!1===e.computed&&"Identifier"===e.property.type?e.property.name:"";break;case"OUTOFBOUNDS":a+="Out of Bounds. ",a+=!1===e.computed&&"Identifier"===e.property.type?e.property.name:"";break;case"NOTFOUND":a+="Cannot call member method on null. ",a+=!1===e.computed&&"Identifier"===e.property.type?e.property.name:"";break;case"INVALIDTYPE":a+="Cannot call member property on object of this type. ",a+=!1===e.computed&&"Identifier"===e.property.type?e.property.name:""}break;case"Property":if("ONLYLITERAL"===n)a+="Property names must be literals or identifiers";break;case"Literal":break;case"CallExpression":switch(n){case"WRONGSIGNATURE":a+="Function signature does not match: ",a+="Identifier"===e.callee.type?e.callee.name:"";break;case"ONLYNODESUPPORTED":a+="Functions must be declared.",a+="Identifier"===e.callee.type?e.callee.name:"";break;case"NOTAFUNCTION":a+="Not a Function: ",a+="Identifier"===e.callee.type?e.callee.name:"";break;case"NOTFOUND":a+="Function Not Found: "+("Identifier"===e.callee.type?e.callee.name:"")}break;case"UnaryExpression":switch(n){case"NOTSUPPORTEDUNARYOPERATOR":a+="Operator "+e.operator+" not allowed in this context. Only ! can be used with boolean, and - with a number";break;case"NOTSUPPORTEDTYPE":a+="Unary operator "+e.operator+" cannot be used with this argument."}case"BinaryExpression":if("OPERATORNOTRECOGNISED"===n)a+="Binary Operator not recognised "+e.operator;break;case"LogicalExpression":switch(n){case"ONLYBOOLEAN":a+="Operator "+e.operator+" cannot be used. Only || or && are allowed values";break;case"ONLYORORAND":a+="Logical Expression "+e.operator+" being applied to parameters that are not boolean."}break;case"ArrayExpression":if("FUNCTIONCONTEXTILLEGAL"===n)a+=" Cannot Put Function inside Array.";break;default:a+="Expression contains unrecognised code structures."}}catch(r){throw r}return a}function g(e,t,n){return{line:e.loc.start.line,character:e.loc.start.column,reason:E(e,t,n)}}function T(e,t,n,a){const r={globalScope:t.globalScope,localScope:{}};for(let i=0;i<e.params.length;i++){const t=e.params[i].name;r.localScope[t.toLowerCase()]={type:"any"}}O(e.body,r,n,a,!1)}function O(e,t,n,a,r=!0){if(null===e)throw new Error("Unnexpexted Expression Syntax");let i=null;try{switch(e.type){case"VariableDeclarator":return"Identifier"!==e.id.type?a.push(g(e,"SYNTAX","VARIABLEMUSTHAVEIDENTIFIER")):(null!==t.localScope?t.localScope[e.id.name.toLowerCase()]:t.globalScope[e.id.name.toLowerCase()],null===t.localScope?t.globalScope[e.id.name.toLowerCase()]={type:"any"}:t.localScope[e.id.name.toLowerCase()]={type:"any"}),void(null!==e.init&&O(e.init,t,n,a,r));case"FunctionDeclaration":return!1===r&&a.push(g(e,"SYNTAX","GLOBALFUNCTIONSONLY")),"Identifier"!==e.id.type&&a.push(g(e,"SYNTAX","FUNCTIONMUSTHAVEIDENTIFIER")),i=d("",e),T(e,t,n,a),null!==t.localScope&&a.push(g(e,"SYNTAX","GLOBALFUNCTIONSONLY")),i.isnative=!1,void("Identifier"===e.id.type&&(t.globalScope[e.id.name.toLowerCase()]={type:"FormulaFunction",signature:[i]}));case"VariableDeclaration":for(let i=0;i<e.declarations.length;i++)O(e.declarations[i],t,n,a,r);return;case"IfStatement":return null!==e.test&&(O(e.test,t,n,a,r),"AssignmentExpression"!==e.test.type&&"UpdateExpression"!==e.test.type||a.push(g(e.test,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION"))),null!==e.consequent&&O(e.consequent,t,n,a,r),void(null!==e.alternate&&O(e.alternate,t,n,a,r));case"EmptyStatement":return;case"BlockStatement":if(null!==e.body)for(let i=0;i<e.body.length;i++)O(e.body[i],t,n,a,r);return;case"ReturnStatement":return void(null!==e.argument&&O(e.argument,t,n,a,r));case"ForInStatement":return"VariableDeclaration"===e.left.type?(e.left.declarations.length>1&&a.push(g(e,"SYNTAX","ONLY1VAR")),null!==e.left.declarations[0].init&&a.push(g(e,"SYNTAX","CANNOTDECLAREVAL"))):"Identifier"!==e.left.type&&a.push(g(e,"SYNTAX","LEFTNOTVAR")),O(e.left,t,n,a,r),O(e.right,t,n,a,r),void O(e.body,t,n,a,r);case"ForStatement":return null!==e.init&&O(e.init,t,n,a,r),null!==e.test&&O(e.test,t,n,a,r),null!==e.body&&O(e.body,t,n,a,r),void(null!==e.update&&O(e.update,t,n,a,r));case"BreakStatement":case"ContinueStatement":return;case"UpdateExpression":if("Identifier"!==e.argument.type&&"MemberExpression"!==e.argument.type)a.push(g(e,"SYNTAX","ASSIGNMENTTOVARSONLY"));else{if("Identifier"===e.argument.type){let r=!1;!1===n&&(null!==t.localScope&&void 0!==t.localScope[e.argument.name.toLowerCase()]&&(r=!0),void 0!==t.globalScope[e.argument.name.toLowerCase()]&&(r=!0),!1===r&&a.push({line:null===e?0:e.loc.start.line,character:null===e?0:e.loc.start.column,reason:"Identifier "+e.argument.name+" has not been declared."}))}"MemberExpression"===e.argument.type&&O(e.argument,t,n,a,r)}return;case"AssignmentExpression":{switch("Identifier"!==e.left.type&&"MemberExpression"!==e.left.type&&a.push(g(e,"SYNTAX","ASSIGNMENTTOVARSONLY")),e.operator){case"=":case"/=":case"*=":case"%=":case"+=":case"-=":break;default:a.push(g(e,"SYNTAX","OPERATORNOTRECOGNISED"))}O(e.right,t,n,a,r);let i=!1;return"Identifier"===e.left.type&&(null!==t.localScope&&void 0!==t.localScope[e.left.name.toLowerCase()]&&(i=!0),void 0!==t.globalScope[e.left.name.toLowerCase()]&&(i=!0),!1===n&&!1===i&&a.push({line:null===e?0:e.loc.start.line,character:null===e?0:e.loc.start.column,reason:"Identifier "+e.left.name+" has not been declared."})),void("MemberExpression"===e.left.type&&O(e.left,t,n,a,r))}case"ExpressionStatement":return"AssignmentExpression"===e.expression.type||e.expression.type,void O(e.expression,t,n,a,r);case"Identifier":{const r=e.name.toLowerCase();if(null!==t.localScope&&void 0!==t.localScope[r])return;if(void 0!==t.globalScope[r])return;!1===n&&a.push(g(e,"SYNTAX","VARIABLENOTFOUND"));break}case"MemberExpression":return O(e.object,t,n,a,r),void(!0===e.computed&&O(e.property,t,n,a,r));case"Literal":case"TemplateElement":return;case"CallExpression":"Identifier"!==e.callee.type&&a.push(g(e,"SYNTAX","ONLYNODESSUPPORTED"));for(let i=0;i<e.arguments.length;i++)O(e.arguments[i],t,n,a,r);if("Identifier"===e.callee.type){const r=s(e.callee.name,e.arguments,t);!1===n&&-1===r&&a.push(g(e,"SYNTAX","NOTFOUND")),-2===r&&a.push(g(e,"SYNTAX","WRONGSIGNATURE"))}return;case"UnaryExpression":return void O(e.argument,t,n,a,r);case"BinaryExpression":switch(O(e.left,t,n,a,r),O(e.right,t,n,a,r),e.operator){case"==":case"!=":case"<":case"<=":case">":case">=":case"+":case"-":case"*":case"/":case"%":case"&":case"|":case"^":case"<<":case">>":case">>>":break;default:a.push(g(e,"SYNTAX","OPERATORNOTRECOGNISED"))}return;case"LogicalExpression":switch(e.operator){case"&&":case"||":break;default:a.push(g(e,"SYNTAX","OPERATORNOTRECOGNISED"))}return O(e.left,t,n,a,r),"AssignmentExpression"!==e.left.type&&"UpdateExpression"!==e.left.type||a.push(g(e,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION")),O(e.right,t,n,a,r),void("AssignmentExpression"!==e.right.type&&"UpdateExpression"!==e.right.type||a.push(g(e,"SYNTAX","CANNOT_USE_ASSIGNMENT_IN_CONDITION")));case"ArrayExpression":for(let i=0;i<e.elements.length;i++)O(e.elements[i],t,n,a,r);return;case"TemplateLiteral":for(let i=0;i<e.quasis.length;i++)O(e.quasis[i],t,n,a,r);for(let i=0;i<e.expressions.length;i++)O(e.expressions[i],t,n,a,r);return;case"ObjectExpression":for(let i=0;i<e.properties.length;i++)O(e.properties[i],t,n,a,r);return;case"Property":return"Literal"!==e.key.type&&"Identifier"!==e.key.type&&a.push(g(e,"SYNTAX","ONLYLITERAL")),"Literal"===e.key.type&&O(e.key,t,n,a,r),void O(e.value,t,n,a,r);default:a.push(g(e,"SYNTAX","UNRECOGNISED"))}return}catch(o){a.push({line:null===e?0:e.loc.start.line,character:null===e?0:e.loc.start.column,reason:"Unnexpected Syntax"})}}function A(t,n,a,r="async",i=e){const s=[];if("BlockStatement"!==t.body[0].body.type)return[{line:0,character:0,reason:"Invalid Body"}];null==n&&(n={vars:{},customFunctions:[]});const o={globalScope:N(n.vars,i,n.customFunctions,r),localScope:null};try{O(t.body[0].body,o,a,s)}catch(l){}return s}function I(e){const t=[];return l(e,(e=>("CallExpression"===e.type&&"Identifier"===e.callee.type&&t.push(e.callee.name.toLowerCase()),!0))),t}function h(e,a=[]){let r=null;if(void 0===e.usesFeatureSet){null===r&&(r=I(e)),e.usesFeatureSet=!1;for(let n=0;n<r.length;n++)t.indexOf(r[n])>-1&&(e.usesFeatureSet=!0,e.isAsync=!0);if(!1===e.usesFeatureSet&&a&&a.length>0)for(const t of a)if(p(e,t)){e.usesFeatureSet=!0,e.isAsync=!0;break}}if(void 0===e.usesGeometry){e.usesGeometry=!1,null===r&&(r=I(e));for(let t=0;t<r.length;t++)n.indexOf(r[t])>-1&&(e.usesGeometry=!0)}}function L(e){const n=I(e);for(let a=0;a<n.length;a++)if(t.indexOf(n[a])>-1)return!0;return!1}function C(e){}


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/arcade.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/arcade.js ***!
  \*****************************************************/
/*! exports provided: a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return $; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return W; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return X; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return Q; });
/* harmony import */ var _arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../arcade/arcadeCompiler.js */ "../node_modules/@arcgis/core/arcade/arcadeCompiler.js");
/* harmony import */ var _arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../arcade/arcadeRuntime.js */ "../node_modules/@arcgis/core/arcade/arcadeRuntime.js");
/* harmony import */ var _arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../arcade/parser.js */ "../node_modules/@arcgis/core/arcade/parser.js");
/* harmony import */ var _arcade_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../arcade/treeAnalysis.js */ "../node_modules/@arcgis/core/arcade/treeAnalysis.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const h=["feature","angle","bearing","centroid","envelopeintersects","extent","geometry","isselfintersecting","ringisclockwise"];function x(){if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_4__["default"])("csp-restrictions"))return!1;try{return new Function("function* test() {}; return true")()}catch(e){return!1}}const b=x();let A=!1,g=!1,j=null,F=[];function E(t,r){if(!0===r.useAsync||!0===t.isAsync)return v(t,r);if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_4__["default"])("csp-restrictions")){return function(e){return Object(_arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__["executeScript"])(t,e)}}return Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["compileScript"])(t,r)}function v(t,r){if(null===j)throw new Error("Async Arcade must be enabled for this script");if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_4__["default"])("csp-restrictions")||!1===b){return function(e){return j.executeScript(t,e)}}return Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["compileScript"])(t,r,!0)}function w(e){Object(_arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__["extend"])(e),Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["extend"])(e,"sync"),null===j?F.push(e):(Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["extend"])(e,"async"),j.extend(e))}function G(e,t=[]){return Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["parseScript"])(e,t)}function k(e,t,r=""){return Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["validateScript"])(e,t,r)}function U(e,t,r,n=""){return Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["scriptCheck"])(e,t,r,n)}function L(e,t,r=[]){return _(Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["parseScript"])(e,r),t)}function _(e,t){if(!0===t.useAsync||!0===e.isAsync){if(null===j)throw new Error("Async Arcade must be enabled for this script");return j.executeScript(e,t)}return Object(_arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__["executeScript"])(e,t)}function C(e,t){return Object(_arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__["referencesMember"])(e,t)}function M(e,t){return Object(_arcade_arcadeRuntime_js__WEBPACK_IMPORTED_MODULE_1__["referencesFunction"])(e,t)}function O(e,t=!1){return Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["extractFieldLiterals"])(e)}function R(e){return Object(_arcade_parser_js__WEBPACK_IMPORTED_MODULE_2__["extractExpectedFieldLiterals"])(e)}function q(e,t=[]){return void 0===e.usesGeometry&&Object(_arcade_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_3__["findScriptDependencies"])(e,t),!0===e.usesGeometry}let z=null;function D(){return z||(z=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["all"])([Promise.all(/*! import() */[__webpack_require__.e(21), __webpack_require__.e(117)]).then(__webpack_require__.bind(null, /*! ../geometry/geometryEngine.js */ "../node_modules/@arcgis/core/geometry/geometryEngine.js")),Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ../arcade/functions/geomsync.js */ "../node_modules/@arcgis/core/arcade/functions/geomsync.js"))]).then((([e,t])=>(g=!0,t.setGeometryEngine(e),!0))),z)}let I=null;function T(){return null!==I||(I=Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["enableAsyncSupport"])().then((()=>Promise.all(/*! import() */[__webpack_require__.e(10), __webpack_require__.e(24), __webpack_require__.e(56), __webpack_require__.e(125)]).then(__webpack_require__.bind(null, /*! ../arcade/arcadeAsyncRuntime.js */ "../node_modules/@arcgis/core/arcade/arcadeAsyncRuntime.js")))).then((e=>{j=e;for(const r of F)j.extend(r),Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["extend"])(r,"async");return F=null,!0}))),I}function B(){return A}function H(){return!!j}function J(){return g}let K=null;function N(){return K||(K=T().then((()=>Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["all"])([Promise.all(/*! import() */[__webpack_require__.e(0), __webpack_require__.e(1), __webpack_require__.e(2), __webpack_require__.e(4), __webpack_require__.e(5), __webpack_require__.e(6), __webpack_require__.e(7), __webpack_require__.e(10), __webpack_require__.e(9), __webpack_require__.e(8), __webpack_require__.e(11), __webpack_require__.e(12), __webpack_require__.e(13), __webpack_require__.e(14), __webpack_require__.e(15), __webpack_require__.e(17), __webpack_require__.e(19), __webpack_require__.e(24), __webpack_require__.e(36), __webpack_require__.e(30), __webpack_require__.e(40)]).then(__webpack_require__.bind(null, /*! ../arcade/featureSetUtils.js */ "../node_modules/@arcgis/core/arcade/featureSetUtils.js")),Promise.all(/*! import() */[__webpack_require__.e(0), __webpack_require__.e(1), __webpack_require__.e(2), __webpack_require__.e(4), __webpack_require__.e(5), __webpack_require__.e(6), __webpack_require__.e(7), __webpack_require__.e(10), __webpack_require__.e(9), __webpack_require__.e(8), __webpack_require__.e(11), __webpack_require__.e(12), __webpack_require__.e(13), __webpack_require__.e(14), __webpack_require__.e(15), __webpack_require__.e(17), __webpack_require__.e(19), __webpack_require__.e(24), __webpack_require__.e(36), __webpack_require__.e(30), __webpack_require__.e(40), __webpack_require__.e(126)]).then(__webpack_require__.bind(null, /*! ../arcade/functions/featuresetbase.js */ "../node_modules/@arcgis/core/arcade/functions/featuresetbase.js")),Promise.all(/*! import() */[__webpack_require__.e(10), __webpack_require__.e(14), __webpack_require__.e(24), __webpack_require__.e(36), __webpack_require__.e(114)]).then(__webpack_require__.bind(null, /*! ../arcade/functions/featuresetgeom.js */ "../node_modules/@arcgis/core/arcade/functions/featuresetgeom.js")),Promise.all(/*! import() */[__webpack_require__.e(14), __webpack_require__.e(127)]).then(__webpack_require__.bind(null, /*! ../arcade/functions/featuresetstats.js */ "../node_modules/@arcgis/core/arcade/functions/featuresetstats.js")),__webpack_require__.e(/*! import() */ 128).then(__webpack_require__.bind(null, /*! ../arcade/functions/featuresetstring.js */ "../node_modules/@arcgis/core/arcade/functions/featuresetstring.js"))]).then((([e,r,n,s,i])=>(Y=e,j.extend([r,n,s,i]),Object(_arcade_arcadeCompiler_js__WEBPACK_IMPORTED_MODULE_0__["extend"])([r,n,s,i],"async"),A=!0,!0))))),K)}function P(e,t=[]){return void 0===e.usesFeatureSet&&Object(_arcade_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_3__["findScriptDependencies"])(e,t),!0===e.usesFeatureSet}function Q(e,t=[]){return void 0===e.isAsync&&Object(_arcade_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_3__["findScriptDependencies"])(e,t),!0===e.isAsync}function V(e,t){if(t){for(const r of t)if(C(e,r))return!0;return!1}return!1}function W(e,t,r=[],n=!1){return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["create"])(((s,i)=>{const c="string"==typeof e?G(e):e,u=[];c&&(!1===J()&&(q(c)||n)&&u.push(D()),!1===H()&&(!0===c.isAsync||t)&&u.push(T()),!1===B()&&(P(c)||V(c,r))&&u.push(N())),u.length?Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["all"])(u).then((()=>{s(!0)}),i):s(!0)}))}function X(e){if(q(e))return!0;const t=Object(_arcade_treeAnalysis_js__WEBPACK_IMPORTED_MODULE_3__["findFunctionCalls"])(e);let r=!1;for(let n=0;n<t.length;n++)if(h.indexOf(t[n])>-1){r=!0;break}return r}let Y=null;function Z(){return Y}var $=Object.freeze({__proto__:null,compileScript:E,extend:w,parseScript:G,validateScript:k,scriptCheck:U,parseAndExecuteScript:L,executeScript:_,referencesMember:C,referencesFunction:M,extractFieldLiterals:O,extractExpectedFieldLiterals:R,scriptUsesGeometryEngine:q,enableGeometrySupport:D,enableAsyncSupport:T,isFeatureSetSupportEnabled:B,isAsyncEnabled:H,isGeometryEnabled:J,enableFeatureSetSupport:N,scriptUsesFeatureSet:P,scriptIsAsync:Q,loadScriptDependencies:W,scriptTouchesGeometry:X,featureSetUtils:Z});


/***/ }),

/***/ "../node_modules/@arcgis/core/chunks/languageUtils.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/languageUtils.js ***!
  \************************************************************/
/*! exports provided: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, _, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return ue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "B", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "C", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "D", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "E", function() { return ne; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "F", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "G", function() { return oe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "H", function() { return me; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "J", function() { return he; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "K", function() { return de; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "L", function() { return pe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "M", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "N", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "O", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "P", function() { return Q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Q", function() { return Se; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "R", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "S", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "T", function() { return ye; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "U", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "V", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "W", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "X", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Y", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Z", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_", function() { return ce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return $; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return W; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return be; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return Y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return Te; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return ae; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return X; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return ee; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return ie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return te; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return le; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return se; });
/* harmony import */ var _arcade_FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../arcade/FunctionWrapper.js */ "../node_modules/@arcgis/core/arcade/FunctionWrapper.js");
/* harmony import */ var _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../arcade/ImmutableArray.js */ "../node_modules/@arcgis/core/arcade/ImmutableArray.js");
/* harmony import */ var _arcade_ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../arcade/ImmutablePathArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePathArray.js");
/* harmony import */ var _arcade_ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../arcade/ImmutablePointArray.js */ "../node_modules/@arcgis/core/arcade/ImmutablePointArray.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../geometry/Geometry.js */ "../node_modules/@arcgis/core/geometry/Geometry.js");
/* harmony import */ var _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../geometry/Multipoint.js */ "../node_modules/@arcgis/core/geometry/Multipoint.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../geometry/Polygon.js */ "../node_modules/@arcgis/core/geometry/Polygon.js");
/* harmony import */ var _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../geometry/Polyline.js */ "../node_modules/@arcgis/core/geometry/Polyline.js");
/* harmony import */ var luxon__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! luxon */ "../node_modules/luxon/src/luxon.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_number_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/number.js */ "../node_modules/@arcgis/core/core/number.js");
/* harmony import */ var _geometry_support_coordsUtils_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../geometry/support/coordsUtils.js */ "../node_modules/@arcgis/core/geometry/support/coordsUtils.js");
/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class y{constructor(e){this.value=e}}class x{constructor(e){this.value=e}}class S{constructor(e){this.fn=e}}class b{constructor(e){this.fn=e}}const T=S,N=x,M=y,k=b,R={type:"VOID"},j={type:"BREAK"},D={type:"CONTINUE"};function _(e,t,n){return""===t||null==t||t===n||t===n?e:e=e.split(t).join(n)}function C(t){return t instanceof S||t instanceof _arcade_FunctionWrapper_js__WEBPACK_IMPORTED_MODULE_0__["default"]||t instanceof b}function w(e){return!!O(e)||(!!Y(e)||(!!E(e)||(!!Z(e)||(null===e||(e===R||"number"==typeof e)))))}function v(e,t){return void 0===e?t:e}function O(e){return"string"==typeof e||e instanceof String}function Z(e){return"boolean"==typeof e}function Y(e){return"number"==typeof e}function F(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e}function I(e){return e instanceof Array}function A(e){return!0===(e&&e.declaredRootClass&&"esri.arcade.featureset.support.FeatureSet"===e.declaredRootClass)}function L(e){return!0===(e&&e.declaredRootClass&&"esri.arcade.featureSetCollection"===e.declaredRootClass)}function J(e){return e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]}function E(e){return e instanceof Date}function z(e,t,n){if(e.length<t||e.length>n)throw new Error("Function called with wrong number of Parameters")}function P(e){return e<0?-Math.round(-e):Math.round(e)}function G(){let e=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){const n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===t?n:3&n|8).toString(16)}))}function V(e,t){return!1===isNaN(e)?null==t||""===t?e.toString():(t=_(t,"‰",""),t=_(t,"¤",""),Object(_core_number_js__WEBPACK_IMPORTED_MODULE_13__["format"])(e,{pattern:t})):e.toString()}function H(e,t){const n=luxon__WEBPACK_IMPORTED_MODULE_11__["DateTime"].fromJSDate(e);return null==t||""===t?n.toISO({suppressMilliseconds:!0}):n.toFormat(U(t),{locale:Object(_intl_locale_js__WEBPACK_IMPORTED_MODULE_15__["getLocale"])(),numberingSystem:"latn"})}function U(e){e=e.replace(/LTS|LT|LL?L?L?|l{1,4}/g,"[$&]");let t="";const n=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;for(const r of e.match(n))switch(r){case"D":t+="d";break;case"DD":t+="dd";break;case"DDD":t+="o";break;case"d":t+="c";break;case"ddd":t+="ccc";break;case"dddd":t+="cccc";break;case"M":t+="L";break;case"MM":t+="LL";break;case"MMM":t+="LLL";break;case"MMMM":t+="LLLL";break;case"YY":t+="yy";break;case"Y":case"YYYY":t+="yyyy";break;case"Q":t+="q";break;case"Z":t+="ZZ";break;case"ZZ":t+="ZZZ";break;case"S":t+="'S'";break;case"SS":t+="'SS'";break;case"SSS":t+="u";break;case"A":case"a":t+="a";break;case"m":case"mm":case"h":case"hh":case"H":case"HH":case"s":case"ss":case"X":case"x":t+=r;break;default:r.length>=2&&"["===r.slice(0,1)&&"]"===r.slice(-1)?t+=`'${r.slice(1,-1)}'`:t+=`'${r}'`}return t}function q(e,t,n){switch(n){case">":return e>t;case"<":return e<t;case">=":return e>=t;case"<=":return e<=t}return!1}function B(e,t,n){if(null===e){if(null===t||t===R)return q(null,null,n);if(Y(t))return q(0,t,n);if(O(t))return q(0,ee(t),n);if(Z(t))return q(0,ee(t),n);if(E(t))return q(0,t.getTime(),n)}if(e===R){if(null===t||t===R)return q(null,null,n);if(Y(t))return q(0,t,n);if(O(t))return q(0,ee(t),n);if(Z(t))return q(0,ee(t),n);if(E(t))return q(0,t.getTime(),n)}else if(Y(e)){if(Y(t))return q(e,t,n);if(Z(t))return q(e,ee(t),n);if(null===t||t===R)return q(e,0,n);if(O(t))return q(e,ee(t),n);if(E(t))return q(e,t.getTime(),n)}else if(O(e)){if(O(t))return q($(e),$(t),n);if(E(t))return q(ee(e),t.getTime(),n);if(Y(t))return q(ee(e),t,n);if(null===t||t===R)return q(ee(e),0,n);if(Z(t))return q(ee(e),ee(t),n)}else if(E(e)){if(E(t))return q(e,t,n);if(null===t||t===R)return q(e.getTime(),0,n);if(Y(t))return q(e.getTime(),t,n);if(Z(t))return q(e.getTime(),ee(t),n);if(O(t))return q(e.getTime(),ee(t),n)}else if(Z(e)){if(Z(t))return q(e,t,n);if(Y(t))return q(ee(e),ee(t),n);if(E(t))return q(ee(e),t.getTime(),n);if(null===t||t===R)return q(ee(e),0,n);if(O(t))return q(ee(e),ee(t),n)}return!!W(e,t)&&("<="===n||">="===n)}function W(e,t){if(e===t)return!0;if(null===e&&t===R||null===t&&e===R)return!0;if(E(e)&&E(t))return e.getTime()===t.getTime();if(e instanceof _arcade_ImmutablePathArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])return e.equalityTest(t);if(e instanceof _arcade_ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])return e.equalityTest(t);if(e instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_8__["default"]&&t instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_8__["default"]){const n=e.cache._arcadeCacheId,r=t.cache._arcadeCacheId;if(null!=n)return n===r}if(void 0!==e&&void 0!==t&&null!==e&&null!==t&&"object"==typeof e&&"object"==typeof t){if(e._arcadeCacheId===t._arcadeCacheId&&void 0!==e._arcadeCacheId&&null!==e._arcadeCacheId)return!0;if(e._underlyingGraphic===t._underlyingGraphic&&void 0!==e._underlyingGraphic&&null!==e._underlyingGraphic)return!0}return!1}function $(e,n){if(O(e))return e;if(null===e)return"";if(Y(e))return V(e,n);if(Z(e))return e.toString();if(E(e))return H(e,n);if(e instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_6__["default"])return JSON.stringify(e.toJSON());if(I(e)){const t=[];for(let n=0;n<e.length;n++)t[n]=K(e[n]);return"["+t.join(",")+"]"}if(e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]){const t=[];for(let n=0;n<e.length();n++)t[n]=K(e.get(n));return"["+t.join(",")+"]"}return null!==e&&"object"==typeof e&&void 0!==e.castToText?e.castToText():C(e)?"object, Function":""}function Q(e){const n=[];if(!1===I(e))return null;if(e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]){for(let t=0;t<e.length();t++)n[t]=ee(e.get(t));return n}for(let t=0;t<e.length;t++)n[t]=ee(e[t]);return n}function X(e,n){if(O(e))return e;if(null===e)return"";if(Y(e))return V(e,n);if(Z(e))return e.toString();if(E(e))return H(e,n);if(e instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_6__["default"])return e instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_5__["default"]?'{"xmin":'+e.xmin.toString()+',"ymin":'+e.ymin.toString()+","+(e.hasZ?'"zmin":'+e.zmin.toString()+",":"")+(e.hasM?'"mmin":'+e.mmin.toString()+",":"")+'"xmax":'+e.xmax.toString()+',"ymax":'+e.ymax.toString()+","+(e.hasZ?'"zmax":'+e.zmax.toString()+",":"")+(e.hasM?'"mmax":'+e.mmax.toString()+",":"")+'"spatialReference":'+ce(e.spatialReference)+"}":ce(e.toJSON(),((e,t)=>e.key===t.key?0:"spatialReference"===e.key?1:"spatialReference"===t.key||e.key<t.key?-1:e.key>t.key?1:0));if(I(e)){const t=[];for(let n=0;n<e.length;n++)t[n]=K(e[n]);return"["+t.join(",")+"]"}if(e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]){const t=[];for(let n=0;n<e.length();n++)t[n]=K(e.get(n));return"["+t.join(",")+"]"}return null!==e&&"object"==typeof e&&void 0!==e.castToText?e.castToText():C(e)?"object, Function":""}function K(e){if(null===e)return"null";if(Z(e)||Y(e)||O(e))return JSON.stringify(e);if(e instanceof _geometry_Geometry_js__WEBPACK_IMPORTED_MODULE_6__["default"])return X(e);if(e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])return X(e);if(e instanceof Array)return X(e);if(e instanceof Date)return JSON.stringify(H(e,""));if(null!==e&&"object"==typeof e){if(void 0!==e.castToText)return e.castToText()}else if(e===R)return"null";return"null"}function ee(e,t){return Y(e)?e:null===e||""===e?0:E(e)?NaN:Z(e)?e?1:0:I(e)||""===e||void 0===e?NaN:void 0!==t&&O(e)?(t=_(t,"‰",""),t=_(t,"¤",""),Object(_core_number_js__WEBPACK_IMPORTED_MODULE_13__["parse"])(e,{pattern:t})):e===R?0:Number(e)}function te(e){if(E(e))return e;if(O(e)){const t=re(e);if(t)return t.toJSDate()}return null}function ne(e){return E(e)?luxon__WEBPACK_IMPORTED_MODULE_11__["DateTime"].fromJSDate(e):O(e)?re(e):null}function re(e){const t=/ (\d\d)/;let n=luxon__WEBPACK_IMPORTED_MODULE_11__["DateTime"].fromISO(e);return n.isValid||t.test(e)&&(e=e.replace(t,"T$1"),n=luxon__WEBPACK_IMPORTED_MODULE_11__["DateTime"].fromISO(e),n.isValid)?n:null}function ie(e){return Z(e)?e:O(e)?"true"===(e=e.toLowerCase()):!!Y(e)&&(0!==e&&!isNaN(e))}function ae(e,t){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_12__["isNone"])(e)?null:(null!==e.spatialReference&&void 0!==e.spatialReference||(e.spatialReference=t),e)}function oe(e){if(null===e)return null;if(e instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_8__["default"])return"NaN"===e.x||null===e.x||isNaN(e.x)?null:e;if(e instanceof _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_9__["default"]){if(0===e.rings.length)return null;for(const t of e.rings)if(t.length>0)return e;return null}if(e instanceof _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_10__["default"]){if(0===e.paths.length)return null;for(const t of e.paths)if(t.length>0)return e;return null}return e instanceof _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_7__["default"]?0===e.points.length?null:e:e instanceof _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_5__["default"]?"NaN"===e.xmin||null===e.xmin||isNaN(e.xmin)?null:e:null}function se(e,t){if(!e)return t;if(!e.domain)return t;let n=null;if("string"===e.field.type||"esriFieldTypeString"===e.field.type)t=$(t);else{if(null==t)return null;if(""===t)return t;t=ee(t)}for(let r=0;r<e.domain.codedValues.length;r++){const i=e.domain.codedValues[r];i.code===t&&(n=i)}return null===n?t:n.name}function ue(e,t){if(!e)return t;if(!e.domain)return t;let n=null;t=$(t);for(let r=0;r<e.domain.codedValues.length;r++){const i=e.domain.codedValues[r];i.name===t&&(n=i)}return null===n?t:n.code}function le(e,t,n=null,r){if(!t)return null;if(!t.fields)return null;let i,a,o=null;for(let s=0;s<t.fields.length;s++){const n=t.fields[s];n.name.toLowerCase()===e.toString().toLowerCase()&&(o=n)}if(null===o)throw new Error("Field not found");return r||(r=n&&t.typeIdField&&n._field(t.typeIdField)),null!=r&&t.types.some((function(e){return e.id===r&&(i=e.domains&&e.domains[o.name],i&&"inherited"===i.type&&(i=fe(o.name,t),a=!0),!0)})),a||i||(i=fe(e,t)),{field:o,domain:i}}function fe(e,t){let n;return t.fields.some((function(t){return t.name.toLowerCase()===e.toLowerCase()&&(n=t.domain),!!n})),n}function ce(e,t){t||(t={}),"function"==typeof t&&(t={cmp:t});const n="boolean"==typeof t.cycles&&t.cycles,r=t.cmp&&(i=t.cmp,function(e){return function(t,n){const r={key:t,value:e[t]},a={key:n,value:e[n]};return i(r,a)}});var i;const a=[];return function e(t){if(t&&t.toJSON&&"function"==typeof t.toJSON&&(t=t.toJSON()),void 0===t)return;if("number"==typeof t)return isFinite(t)?""+t:"null";if("object"!=typeof t)return JSON.stringify(t);let i,o;if(Array.isArray(t)){for(o="[",i=0;i<t.length;i++)i&&(o+=","),o+=e(t[i])||"null";return o+"]"}if(null===t)return"null";if(-1!==a.indexOf(t)){if(n)return JSON.stringify("__cycle__");throw new TypeError("Converting circular structure to JSON")}const s=a.push(t)-1,u=Object.keys(t).sort(r&&r(t));for(o="",i=0;i<u.length;i++){const n=u[i],r=e(t[n]);r&&(o&&(o+=","),o+=JSON.stringify(n)+":"+r)}return a.splice(s,1),"{"+o+"}"}(e)}function me(e){if(null===e)return null;const t=[];for(const n of e)n&&(n.declaredClass&&"esri.arcade.Feature"===n.declaredClass||"FeatureSetReader"===n.type)?t.push(n.geometry()):t.push(n);return t}function ge(e,t){if(!(t instanceof _geometry_Point_js__WEBPACK_IMPORTED_MODULE_8__["default"]))throw new Error("Invalid Argument");e.push(t.hasZ?t.hasM?[t.x,t.y,t.z,t.m]:[t.x,t.y,t.z]:[t.x,t.y])}function de(e,t){if(I(e)||J(e)){let n=!1,i=!1,a=[],o=t;if(I(e)){for(const t of e)ge(a,t);a.length>0&&(o=e[0].spatialReference,n=e[0].hasZ,i=e[0].hasM)}else if(e instanceof _arcade_ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])a=e._elements,a.length>0&&(n=e._hasZ,i=e._hasM,o=e.get(0).spatialReference);else{if(!J(e))throw new Error("Invalid Argument");for(const t of e.toArray())ge(a,t);a.length>0&&(o=e.get(0).spatialReference,n=!0===e.get(0).hasZ,i=!0===e.get(0).hasM)}if(0===a.length)return null;return!1===Object(_geometry_support_coordsUtils_js__WEBPACK_IMPORTED_MODULE_14__["isClockwise"])(a,i,n)&&(a=a.slice(0).reverse()),new _geometry_Polygon_js__WEBPACK_IMPORTED_MODULE_9__["default"]({rings:[a],spatialReference:o,hasZ:n,hasM:i})}return e}function he(e,t){if(I(e)||J(e)){let n=!1,i=!1,a=[],o=t;if(I(e)){for(const t of e)ge(a,t);a.length>0&&(o=e[0].spatialReference,n=!0===e[0].hasZ,i=!0===e[0].hasM)}else if(e instanceof _arcade_ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])a=e._elements,a.length>0&&(n=e._hasZ,i=e._hasM,o=e.get(0).spatialReference);else if(J(e)){for(const t of e.toArray())ge(a,t);a.length>0&&(o=e.get(0).spatialReference,n=!0===e.get(0).hasZ,i=!0===e.get(0).hasM)}return 0===a.length?null:new _geometry_Polyline_js__WEBPACK_IMPORTED_MODULE_10__["default"]({paths:[a],spatialReference:o,hasZ:n,hasM:i})}return e}function pe(e,t){if(I(e)||J(e)){let n=!1,i=!1,a=[],o=t;if(I(e)){for(const t of e)ge(a,t);a.length>0&&(o=e[0].spatialReference,n=!0===e[0].hasZ,i=!0===e[0].hasM)}else if(e instanceof _arcade_ImmutablePointArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])a=e._elements,a.length>0&&(n=e._hasZ,i=e._hasM,o=e.get(0).spatialReference);else if(J(e)){for(const t of e.toArray())ge(a,t);a.length>0&&(o=e.get(0).spatialReference,n=!0===e.get(0).hasZ,i=!0===e.get(0).hasM)}return 0===a.length?null:new _geometry_Multipoint_js__WEBPACK_IMPORTED_MODULE_7__["default"]({points:a,spatialReference:o,hasZ:n,hasM:i})}return e}function ye(e,n=!1){const r=[];if(null===e)return r;if(!0===I(e)){for(let t=0;t<e.length;t++){const i=$(e[t]);""===i&&!0!==n||r.push(i)}return r}if(e instanceof _arcade_ImmutableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"]){for(let t=0;t<e.length();t++){const i=$(e.get(t));""===i&&!0!==n||r.push(i)}return r}if(w(e)){const t=$(e);return""===t&&!0!==n||r.push(t),r}return[]}let xe=0;function Se(e){return xe++,xe%100==0?(xe=0,Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["create"])((t=>{setTimeout((()=>{t(e)}),0)}))):e}function be(e,t,n){switch(n){case"&":return e&t;case"|":return e|t;case"^":return e^t;case"<<":return e<<t;case">>":return e>>t;case">>>":return e>>>t}}var Te=Object.freeze({__proto__:null,ReturnResultE:y,ImplicitResultE:x,NativeFunctionE:S,SizzleFunctionE:b,NativeFunction:T,ImplicitResult:N,ReturnResult:M,SizzleFunction:k,voidOperation:R,breakResult:j,continueResult:D,multiReplace:_,isFunctionParameter:C,isSimpleType:w,defaultUndefined:v,isString:O,isBoolean:Z,isNumber:Y,isInteger:F,isArray:I,isFeatureSet:A,isFeatureSetCollection:L,isImmutableArray:J,isDate:E,pcCheck:z,absRound:P,generateUUID:G,formatNumber:V,formatDate:H,standardiseDateFormat:U,greaterThanLessThan:B,equalityTest:W,toString:$,toNumberArray:Q,toStringExplicit:X,toNumber:ee,toDate:te,toDateTime:ne,toBoolean:ie,fixSpatialReference:ae,fixNullGeometry:oe,getDomainValue:se,getDomainCode:ue,getDomain:le,stableStringify:ce,autoCastFeatureToGeometry:me,autoCastArrayOfPointsToPolygon:de,autoCastArrayOfPointsToPolyline:he,autoCastArrayOfPointsToMultiPoint:pe,toStringArray:ye,tick:Se,binaryOperator:be});


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

/***/ "../node_modules/@arcgis/core/core/number.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/core/number.js ***!
  \***************************************************/
/*! exports provided: _parseInfo, format, getCustoms, parse, regexp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_parseInfo", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "format", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCustoms", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "regexp", function() { return c; });
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t={ar:[".",","],bs:[",","."],ca:[",","."],cs:[","," "],da:[",","."],de:[",","."],"de-ch":[".","’"],el:[",","."],en:[".",","],"en-au":[".",","],es:[",","."],"es-mx":[".",","],et:[","," "],fi:[","," "],fr:[","," "],"fr-ch":[","," "],he:[".",","],hi:[".",",","#,##,##0.###"],hr:[",","."],hu:[","," "],id:[",","."],it:[",","."],"it-ch":[".","’"],ja:[".",","],ko:[".",","],lt:[","," "],lv:[","," "],mk:[",","."],nb:[","," "],nl:[",","."],pl:[","," "],pt:[",","."],"pt-pt":[","," "],ro:[",","."],ru:[","," "],sk:[","," "],sl:[",","."],sr:[",","."],sv:[","," "],th:[".",","],tr:[",","."],uk:[","," "],vi:[",","."],zh:[".",","]};function r(e){e||(e=Object(_intl_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])());let r=e in t;if(!r){const n=e.split("-");n.length>1&&n[0]in t&&(e=n[0],r=!0),r||(e="en")}const[o,i,s="#,##0.###"]=t[e];return{decimal:o,group:i,pattern:s}}function o(e,n){const t=r((n={...n}).locale);n.customs=t;const o=n.pattern||t.pattern;return isNaN(e)||Math.abs(e)===1/0?null:s(e,o,n)}const i=/[#0,]*[#0](?:\.0*#*)?/;function s(e,n,t){const r=(t=t||{}).customs.group,o=t.customs.decimal,s=n.split(";"),c=s[0];if(-1!==(n=s[e<0?1:0]||"-"+c).indexOf("%"))e*=100;else if(-1!==n.indexOf("‰"))e*=1e3;else{if(-1!==n.indexOf("¤"))throw new Error("currency notation not supported");if(-1!==n.indexOf("E"))throw new Error("exponential notation not supported")}const a=i,p=c.match(a);if(!p)throw new Error("unable to find a number expression in pattern: "+n);return!1===t.fractional&&(t.places=0),n.replace(a,l(e,p[0],{decimal:o,group:r,places:t.places,round:t.round}))}function l(e,n,t){!0===(t=t||{}).places&&(t.places=0),t.places===1/0&&(t.places=6);const r=n.split("."),o="string"==typeof t.places&&t.places.indexOf(",");let i=t.places;o?i=t.places.substring(o+1):i>=0||(i=(r[1]||[]).length),t.round<0||(e=Number(e.toFixed(Number(i))));const s=String(Math.abs(e)).split("."),l=s[1]||"";if(r[1]||t.places){o&&(t.places=t.places.substring(0,o));const e=void 0!==t.places?t.places:r[1]&&r[1].lastIndexOf("0")+1;e>l.length&&(s[1]=l.padEnd(Number(e),"0")),i<l.length&&(s[1]=l.substr(0,Number(i)))}else s[1]&&s.pop();const c=r[0].replace(",","");let a=c.indexOf("0");-1!==a&&(a=c.length-a,a>s[0].length&&(s[0]=s[0].padStart(a,"0")),-1===c.indexOf("#")&&(s[0]=s[0].substr(s[0].length-a)));let p,u,f=r[0].lastIndexOf(",");if(-1!==f){p=r[0].length-f-1;const e=r[0].substr(0,f);f=e.lastIndexOf(","),-1!==f&&(u=e.length-f-1)}const d=[];for(let g=s[0];g;){const e=g.length-p;d.push(e>0?g.substr(e):g),g=e>0?g.slice(0,e):"",u&&(p=u,u=void 0)}return s[0]=d.reverse().join(t.group||","),s.join(t.decimal||".")}function c(e){return a(e).regexp}function a(n){const t=r((n=n||{}).locale),o=n.pattern||t.pattern,s=t.group,l=t.decimal;let c=1;if(-1!==o.indexOf("%"))c/=100;else if(-1!==o.indexOf("‰"))c/=1e3;else if(-1!==o.indexOf("¤"))throw new Error("currency notation not supported");const a=o.split(";");1===a.length&&a.push("-"+a[0]);const p=d(a,(function(t){return(t="(?:"+Object(_string_js__WEBPACK_IMPORTED_MODULE_0__["escapeRegExpString"])(t,".")+")").replace(i,(function(e){const t={signed:!1,separator:n.strict?s:[s,""],fractional:n.fractional,decimal:l,exponent:!1},r=e.split(".");let o=n.places;1===r.length&&1!==c&&(r[1]="###"),1===r.length||0===o?t.fractional=!1:(void 0===o&&(o=n.pattern?r[1].lastIndexOf("0")+1:1/0),o&&null==n.fractional&&(t.fractional=!0),!n.places&&o<r[1].length&&(o+=","+r[1].length),t.places=o);const i=r[0].split(",");return i.length>1&&(t.groupSize=i.pop().length,i.length>1&&(t.groupSize2=i.pop().length)),"("+u(t)+")"}))}),!0);return{regexp:p.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:s,decimal:l,factor:c}}function p(e,n){const t=a(n),r=new RegExp("^"+t.regexp+"$").exec(e);if(!r)return NaN;let o=r[1];if(!r[1]){if(!r[2])return NaN;o=r[2],t.factor*=-1}return o=o.replace(new RegExp("["+t.group+"\\s\\xa0]","g"),"").replace(t.decimal,"."),Number(o)*t.factor}function u(e){"places"in(e=e||{})||(e.places=1/0),"string"!=typeof e.decimal&&(e.decimal="."),"fractional"in e&&!/^0/.test(String(e.places))||(e.fractional=[!0,!1]),"exponent"in e||(e.exponent=[!0,!1]),"eSigned"in e||(e.eSigned=[!0,!1]);const n=f(e),t=d(e.fractional,(function(n){let t="";return n&&0!==e.places&&(t="\\"+e.decimal,e.places===1/0?t="(?:"+t+"\\d+)?":t+="\\d{"+e.places+"}"),t}),!0);let r=n+t;return t&&(r="(?:(?:"+r+")|(?:"+t+"))"),r+d(e.exponent,(function(n){return n?"([eE]"+f({signed:e.eSigned})+")":""}))}function f(n){"signed"in(n=n||{})||(n.signed=[!0,!1]),"separator"in n?"groupSize"in n||(n.groupSize=3):n.separator="";return d(n.signed,(function(e){return e?"[-+]":""}),!0)+d(n.separator,(function(t){if(!t)return"(?:\\d+)";" "===(t=Object(_string_js__WEBPACK_IMPORTED_MODULE_0__["escapeRegExpString"])(t))?t="\\s":" "===t&&(t="\\s\\xa0");const r=n.groupSize,o=n.groupSize2;if(o){const e="(?:0|[1-9]\\d{0,"+(o-1)+"}(?:["+t+"]\\d{"+o+"})*["+t+"]\\d{"+r+"})";return r-o>0?"(?:"+e+"|(?:0|[1-9]\\d{0,"+(r-1)+"}))":e}return"(?:0|[1-9]\\d{0,"+(r-1)+"}(?:["+t+"]\\d{"+r+"})*)"}),!0)}const d=function(e,n,t){if(!(e instanceof Array))return n(e);const r=[];for(let o=0;o<e.length;o++)r.push(n(e[o]));return g(r.join("|"),t)},g=function(e,n){return"("+(n?"?:":"")+e+")"};


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/locale.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/locale.js ***!
  \***************************************************/
/*! exports provided: beforeLocaleChange, getDefaultLocale, getLanguage, getLocale, onLocaleChange, prefersRTL, setLocale */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "beforeLocaleChange", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultLocale", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLanguage", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLocale", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onLocaleChange", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefersRTL", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLocale", function() { return a; });
/* harmony import */ var _core_global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/global.js */ "../node_modules/@arcgis/core/core/global.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var o,l,e;let t,r;const u=null!=(o=null==(l=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].esriConfig)?void 0:l.locale)?o:null==(e=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].dojoConfig)?void 0:e.locale;function c(){var o,l;return null!=(o=null!=u?u:null==(l=_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].navigator)?void 0:l.language)?o:"en"}function i(){return void 0===r&&(r=c()),r}function a(n){t=n||void 0,m()}function s(n=i()){const o=/^([a-zA-Z]{2,3})(?:[_\-]\w+)*$/.exec(n);return null==o?void 0:o[1].toLowerCase()}const f={he:!0,ar:!0};function v(n=i()){const o=s(n);return void 0!==o&&(f[o]||!1)}const d=[];function g(n){return d.push(n),{remove(){d.splice(d.indexOf(n),1)}}}const h=[];function p(n){return h.push(n),{remove(){d.splice(h.indexOf(n),1)}}}function m(){var n;const o=null!=(n=t)?n:c();r!==o&&(r=o,[...h].forEach((n=>{n.call(null,o)})),[...d].forEach((n=>{n.call(null,o)})))}null==_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].addEventListener||_core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].addEventListener("languagechange",m);


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/centroid.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/centroid.js ***!
  \****************************************************************/
/*! exports provided: getCentroidOptimizedGeometry, lineCentroid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCentroidOptimizedGeometry", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lineCentroid", function() { return I; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(t,n){return t?n?4:3:n?3:2}function e(e,o,u,l,N){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(o)||!o.lengths.length)return null;const s="upperLeft"===(null==N?void 0:N.originPosition)?-1:1;e.lengths.length&&(e.lengths.length=0),e.coords.length&&(e.coords.length=0);const c=e.coords,f=[],i=u?[Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY]:[Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY],{lengths:T,coords:h}=o,g=n(u,l);let E=0;for(const t of T){const n=r(i,h,E,t,u,l,s);n&&f.push(n),E+=t*g}if(f.sort(((t,n)=>{let e=s*t[2]-s*n[2];return 0===e&&u&&(e=t[4]-n[4]),e})),f.length){let t=6*f[0][2];c[0]=f[0][0]/t,c[1]=f[0][1]/t,u&&(t=6*f[0][4],c[2]=0!==t?f[0][3]/t:0),(c[0]<i[0]||c[0]>i[1]||c[1]<i[2]||c[1]>i[3]||u&&(c[2]<i[4]||c[2]>i[5]))&&(c.length=0)}if(!c.length){const t=o.lengths[0]?I(h,0,T[0],u,l):null;if(!t)return null;c[0]=t[0],c[1]=t[1],u&&t.length>2&&(c[2]=t[2])}return e}function r(t,e,r,I,o,u,l=1){const N=n(o,u);let s=r,c=r+N,f=0,i=0,T=0,h=0,g=0;for(let n=0,m=I-1;n<m;n++,s+=N,c+=N){const n=e[s],r=e[s+1],I=e[s+2],u=e[c],l=e[c+1],N=e[c+2];let E=n*l-u*r;h+=E,f+=(n+u)*E,i+=(r+l)*E,o&&(E=n*N-u*I,T+=(I+N)*E,g+=E),n<t[0]&&(t[0]=n),n>t[1]&&(t[1]=n),r<t[2]&&(t[2]=r),r>t[3]&&(t[3]=r),o&&(I<t[4]&&(t[4]=I),I>t[5]&&(t[5]=I))}if(h*l>0&&(h*=-1),g*l>0&&(g*=-1),!h)return null;const E=[f,i,.5*h];return o&&(E[3]=T,E[4]=.5*g),E}function I(t,e,r,I,s){const c=n(I,s);let f=e,i=e+c,T=0,h=0,g=0,E=0;for(let n=0,m=r-1;n<m;n++,f+=c,i+=c){const n=t[f],e=t[f+1],r=t[f+2],s=t[i],c=t[i+1],m=t[i+2],b=I?u(n,e,r,s,c,m):o(n,e,s,c);if(b)if(T+=b,I){const t=N(n,e,r,s,c,m);h+=b*t[0],g+=b*t[1],E+=b*t[2]}else{const t=l(n,e,s,c);h+=b*t[0],g+=b*t[1]}}return T>0?I?[h/T,g/T,E/T]:[h/T,g/T]:r>0?I?[t[e],t[e+1],t[e+2]]:[t[e],t[e+1]]:null}function o(t,n,e,r){const I=e-t,o=r-n;return Math.sqrt(I*I+o*o)}function u(t,n,e,r,I,o){const u=r-t,l=I-n,N=o-e;return Math.sqrt(u*u+l*l+N*N)}function l(t,n,e,r){return[t+.5*(e-t),n+.5*(r-n)]}function N(t,n,e,r,I,o){return[t+.5*(r-t),n+.5*(I-n),e+.5*(o-e)]}


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

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js":
/*!*******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js ***!
  \*******************************************************************************************/
/*! exports provided: getInputValueType, getTransformationType, isSizeVariable, isValidNumber */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInputValueType", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTransformationType", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSizeVariable", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidNumber", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){return n&&"esri.renderers.visualVariables.SizeVariable"===n.declaredClass}function e(n){return null!=n&&!isNaN(n)&&isFinite(n)}function i(n){return n.valueExpression?"expression":n.field&&"string"==typeof n.field?"field":"unknown"}function l(n,e){const l=e||i(n),a=n.valueUnit||"unknown";return"unknown"===l?"constant":n.stops?"stops":null!=n.minSize&&null!=n.maxSize&&null!=n.minDataValue&&null!=n.maxDataValue?"clamped-linear":"unknown"===a?null!=n.minSize&&null!=n.minDataValue?n.minSize&&n.minDataValue?"proportional":"additive":"identity":"real-world-size"}


/***/ }),

/***/ "../node_modules/@arcgis/core/support/arcadeUtils.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/support/arcadeUtils.js ***!
  \***********************************************************/
/*! exports provided: arcade, Dictionary, arcadeFeature, convertFeatureLayerToFeatureSet, convertMapToFeatureSetCollection, convertServiceUrlToWorkspace, createExecContext, createFeature, createFunction, createSyntaxTree, dependsOnView, enableFeatureSetOperations, enableGeometryOperations, evalSyntaxTree, executeAsyncFunction, executeFunction, extractFieldNames, getViewInfo, hasGeometryFunctions, hasGeometryOperations, hasVariable, loadScriptDependencies, updateExecContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertFeatureLayerToFeatureSet", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertMapToFeatureSetCollection", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertServiceUrlToWorkspace", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createExecContext", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFeature", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFunction", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSyntaxTree", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dependsOnView", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableFeatureSetOperations", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableGeometryOperations", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evalSyntaxTree", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeAsyncFunction", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeFunction", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractFieldNames", function() { return R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getViewInfo", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasGeometryFunctions", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasGeometryOperations", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasVariable", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadScriptDependencies", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateExecContext", function() { return $; });
/* harmony import */ var _chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/arcade.js */ "../node_modules/@arcgis/core/chunks/arcade.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "arcade", function() { return _chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["h"]; });

/* harmony import */ var _arcade_Dictionary_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../arcade/Dictionary.js */ "../node_modules/@arcgis/core/arcade/Dictionary.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Dictionary", function() { return _arcade_Dictionary_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _arcade_Feature_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../arcade/Feature.js */ "../node_modules/@arcgis/core/arcade/Feature.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "arcadeFeature", function() { return _arcade_Feature_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _renderers_visualVariables_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../renderers/visualVariables/support/sizeVariableUtils.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const y=/^\$(feature|aggregatedFeatures)\./i,v={vars:{$feature:"any",$view:"any"},spatialReference:null};function x(e){return e.replace(/[|\\{}()[\]^$+*?.]/g,"\\$&")}function g(r){if(!r)return null;try{return Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["p"])(r)}catch(n){}return null}function w(e,n){const t="string"==typeof e?g(e):e;if(!t)return null;try{return n=n||Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(v),Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["c"])(t,n)}catch(u){}return null}function E(e,r){return{vars:{$feature:null==e?new _arcade_Feature_js__WEBPACK_IMPORTED_MODULE_2__["default"]:_arcade_Feature_js__WEBPACK_IMPORTED_MODULE_2__["default"].createFromGraphic(e),$view:r&&r.view},spatialReference:r&&r.sr}}function F(e,r,n){return _arcade_Feature_js__WEBPACK_IMPORTED_MODULE_2__["default"].createFromGraphicLikeObject(r,e,n)}function $(e,r){e.vars.$feature=r}function b(e,r){let t;try{t=Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["e"])(e,r)}catch(u){t=null}return t}function j(e,r){let n;try{n=e?e(r):null}catch(t){n=null}return n}function S(e,r){try{return e?e(r):Promise.resolve(null)}catch(n){return Promise.resolve(null)}}function R(e,r){if(!e)return[];const n="string"==typeof e?g(e):e;if(!n)return[];const u=Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["a"])(n);let i=new Array;u.forEach((e=>{y.test(e)&&(e=e.replace(y,""),i.push(e))}));const a=i.filter((e=>e.includes("*")));return i=i.filter((e=>!a.includes(e))),r&&a.forEach((e=>{const n=new RegExp(`^${e.split(/\*+/).map(x).join(".*")}$`,"i");r.forEach((e=>n.test(e)?i.push(e):null))})),[...new Set(i.sort())]}function z(e){return Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["r"])(e,"$view")}function C(e,r){return!!e&&Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["r"])(e,r)}function M(e){if(!e||null==e.spatialReference&&(null==e.scale||null==e.viewingMode))return;return{view:e.viewingMode&&null!=e.scale?new _arcade_Dictionary_js__WEBPACK_IMPORTED_MODULE_1__["default"]({viewingMode:e.viewingMode,scale:e.scale}):null,sr:e.spatialReference}}function k({url:e,spatialReference:r,lrucache:n,interceptor:t}){const u=Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["f"])();return u?u.createFeatureSetCollectionFromService(e,r,n,t):null}function I({layer:e,spatialReference:r,outFields:n,returnGeometry:t,lrucache:u,interceptor:i}){if(null===e)return null;const a=Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["f"])();return a?a.constructFeatureSet(e,r,n,null==t||t,u,i):null}function D(e){if(null===(null==e?void 0:e.map))return null;const r=Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["f"])();return r?r.createFeatureSetCollectionFromMap(e.map,e.spatialReference,e.lrucache,e.interceptor):null}function G(e,r,n=[]){return Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["l"])(e,r,n)}function P(){return Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["b"])()}function V(){return Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["d"])()}function L(e){return"simple"===e.type||"class-breaks"===e.type||"unique-value"===e.type||"dot-density"===e.type||"dictionary"===e.type}function q(e){return"esri.layers.support.LabelClass"===e.declaredClass}function A(e){return"esri.PopupTemplate"===e.declaredClass}function O(e,r){if(!e)return!1;if("string"==typeof e)return r(e);const n=e;if(L(n)){if("dot-density"===n.type){const e=n.attributes.some((e=>r(e.valueExpression)));if(e)return e}const e=n.visualVariables,t=!!e&&e.some((e=>{let n=r(e.valueExpression);return"size"===e.type&&(Object(_renderers_visualVariables_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_4__["isSizeVariable"])(e.minSize)&&(n=n||r(e.minSize.valueExpression)),Object(_renderers_visualVariables_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_4__["isSizeVariable"])(e.maxSize)&&(n=n||r(e.maxSize.valueExpression))),n}));return!(!("valueExpression"in n)||!r(n.valueExpression))||t}if(q(n)){const e=n.labelExpressionInfo&&n.labelExpressionInfo.expression;return!(!e||!r(e))||!1}return!!A(n)&&(!!n.expressionInfos&&n.expressionInfos.some((e=>r(e.expression))))}function T(e){const r=g(e);return!!r&&Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["s"])(r)}function U(e){return O(e,T)}function B(e){const r=g(e);return!!r&&Object(_chunks_arcade_js__WEBPACK_IMPORTED_MODULE_0__["g"])(r)}function H(e){return O(e,B)}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/support/FeatureSetReader.js":
/*!*****************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/support/FeatureSetReader.js ***!
  \*****************************************************************************************/
/*! exports provided: FeatureSetReader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FeatureSetReader", function() { return A; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _layers_graphics_centroid_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../layers/graphics/centroid.js */ "../node_modules/@arcgis/core/layers/graphics/centroid.js");
/* harmony import */ var _layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../layers/graphics/featureConversionUtils.js */ "../node_modules/@arcgis/core/layers/graphics/featureConversionUtils.js");
/* harmony import */ var _layers_graphics_OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../../layers/graphics/OptimizedGeometry.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedGeometry.js");
/* harmony import */ var _StaticBitSet_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./StaticBitSet.js */ "../node_modules/@arcgis/core/views/2d/layers/features/support/StaticBitSet.js");
/* harmony import */ var _geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../geometry/support/jsonUtils.js */ "../node_modules/@arcgis/core/geometry/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var h,u;let l=0;const c=null!=(h=Object(_core_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])("featurelayer-simplify-thresholds"))?h:[.5,.5,.5,.5],m=c[0],_=c[1],g=c[2],p=c[3],y=null!=(u=Object(_core_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])("featurelayer-simplify-payload-size-factors"))?u:[1,2,4],f=y[0],I=y[1],x=y[2];class A{constructor(e){this.type="FeatureSetReader",this.seen=!1,this.instance=0,this._tx=0,this._ty=0,this._sx=1,this._sy=1,this._deleted=null,this._joined=[],this._objectIdToIndex=null,this._level=0,this.instance=e}static createInstance(){return l++,l=l>65535?0:l,l}get isEmpty(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this._deleted)&&this._deleted.countSet()===this.getSize()}set level(e){this._level=e}getAreaSimplificationThreshold(e,t){let r=1;t>4e6?r=x:t>1e6?r=I:t>5e5&&(r=f);let s=0;e>4e3?s=p*r:e>2e3?s=g*r:e>100?s=_:e>15&&(s=m);let i=8;return this._level<4?i=1:this._level<5?i=2:this._level<6&&(i=4),s*i}setArcadeSpatialReference(e){this._arcadeSpatialReference=e}attachStorage(e){this._storage=e}getQuantizationTransform(){throw new Error("Unable to find transform for featureSet")}getStorage(){return this._storage}getComputedNumeric(e){return this.getComputedNumericAtIndex(0)}setComputedNumeric(e,t){return this.setComputedNumericAtIndex(t,0)}getComputedString(e){return this.getComputedStringAtIndex(0)}setComputedString(e,t){return this.setComputedStringAtIndex(0,t)}getComputedNumericAtIndex(e){return this._storage.getComputedNumericAtIndex(this.getDisplayId(),e)}setComputedNumericAtIndex(e,t){this._storage.setComputedNumericAtIndex(this.getDisplayId(),e,t)}getComputedStringAtIndex(e){return this._storage.getComputedStringAtIndex(this.getDisplayId(),e)}setComputedStringAtIndex(e,t){return this._storage.setComputedStringAtIndex(this.getDisplayId(),e,t)}transform(e,t,r,s){const i=this.copy();return i._tx+=e,i._ty+=t,i._sx*=r,i._sy*=s,i}readAttribute(e,t=!1){const r=this._readAttribute(e,t);if(void 0!==r)return r;for(const s of this._joined){s.setIndex(this.getIndex());const r=s._readAttribute(e,t);if(void 0!==r)return r}}readAttributes(){const e=this._readAttributes();for(const t of this._joined){t.setIndex(this.getIndex());const r=t._readAttributes();for(const t of Object.keys(r))e[t]=r[t]}return e}joinAttributes(e){this._joined.push(e)}readArcadeFeature(){return this}geometry(){const e=this.readHydratedGeometry(),t=Object(_layers_graphics_featureConversionUtils_js__WEBPACK_IMPORTED_MODULE_4__["convertToGeometry"])(e,this.geometryType,this.hasZ,this.hasM),r=Object(_geometry_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_7__["fromJSON"])(t);return r&&(r.spatialReference=this._arcadeSpatialReference),r}field(e){return this.readAttribute(e,!0)}hasField(e){return!0}setField(e,t){}keys(){return[]}castToText(){return""}removeIds(e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(this._objectIdToIndex)){const e=new Map,t=this.getCursor();for(;t.next();)e.set(t.getObjectId(),t.getIndex());this._objectIdToIndex=e}const t=this._objectIdToIndex;for(const r of e)t.has(r)&&this.removeAtIndex(t.get(r))}removeAtIndex(e){Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(this._deleted)&&(this._deleted=_StaticBitSet_js__WEBPACK_IMPORTED_MODULE_6__["StaticBitSet"].create(this.getSize())),this._deleted.set(e)}readGeometryForDisplay(){return this.readUnquantizedGeometry(!0)}readLegacyGeometryForDisplay(){return this.readLegacyGeometry(!0)}*features(){const e=this.getCursor();for(;e.next();)yield e.readOptimizedFeature()}_getExists(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(this._deleted)||!this._deleted.has(this.getIndex())}_computeCentroid(){if("esriGeometryPolygon"!==this.geometryType)return null;const e=this.readUnquantizedGeometry();if(!e||e.hasIndeterminateRingOrder)return null;const t=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrapOr"])(this.getQuantizationTransform(),null);return Object(_layers_graphics_centroid_js__WEBPACK_IMPORTED_MODULE_3__["getCentroidOptimizedGeometry"])(new _layers_graphics_OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_5__["default"],e,this.hasM,this.hasZ,t)}copyInto(e){e.seen=this.seen,e._storage=this._storage,e._arcadeSpatialReference=this._arcadeSpatialReference,e._joined=this._joined,e._tx=this._tx,e._ty=this._ty,e._sx=this._sx,e._sy=this._sy,e._deleted=this._deleted,e._objectIdToIndex=this._objectIdToIndex}}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/support/StaticBitSet.js":
/*!*************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/support/StaticBitSet.js ***!
  \*************************************************************************************/
/*! exports provided: StaticBitSet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StaticBitSet", function() { return t; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(t,e){this._mask=0,this._buf=t,this._mask=e}static fromBuffer(e,s){return new t(e,s)}static create(e,s=4294967295){const r=new Uint32Array(Math.ceil(e/32));return new t(r,s)}_getIndex(t){return Math.floor(t/32)}has(t){const e=this._mask&t;return!!(this._buf[this._getIndex(e)]&1<<e%32)}hasRange(t,e){let s=t,r=e;for(;s%32&&s!==r;){if(this.has(s))return!0;s++}for(;r%32&&s!==r;){if(this.has(s))return!0;r--}if(s===r)return!1;for(let h=s/32;h!==r/32;h++){if(this._buf[h])return!0}return!1}set(t){const e=this._mask&t,s=this._getIndex(e),r=1<<e%32;this._buf[s]|=r}setRange(t,e){let s=t,r=e;for(;s%32&&s!==r;)this.set(s++);for(;r%32&&s!==r;)this.set(r--);if(s!==r)for(let h=s/32;h!==r/32;h++)this._buf[h]=4294967295}unset(t){const e=this._mask&t,s=this._getIndex(e),r=1<<e%32;this._buf[s]&=4294967295^r}resize(t){const e=this._buf,s=new Uint32Array(Math.ceil(t/32));s.set(e),this._buf=s}or(t){for(let e=0;e<this._buf.length;e++)this._buf[e]|=t._buf[e];return this}and(t){for(let e=0;e<this._buf.length;e++)this._buf[e]&=t._buf[e];return this}xor(t){for(let e=0;e<this._buf.length;e++)this._buf[e]^=t._buf[e];return this}ior(t){for(let e=0;e<this._buf.length;e++)this._buf[e]|=~t._buf[e];return this}iand(t){for(let e=0;e<this._buf.length;e++)this._buf[e]&=~t._buf[e];return this}ixor(t){for(let e=0;e<this._buf.length;e++)this._buf[e]^=~t._buf[e];return this}any(){for(let t=0;t<this._buf.length;t++)if(this._buf[t])return!0;return!1}copy(t){for(let e=0;e<this._buf.length;e++)this._buf[e]=t._buf[e];return this}clone(){return new t(this._buf.slice(),this._mask)}clear(){for(let t=0;t<this._buf.length;t++)this._buf[t]=0}forEachSet(t){for(let e=0;e<this._buf.length;e++){let s=this._buf[e],r=32*e;if(s)for(;s;){1&s&&t(r),s>>>=1,r++}}}countSet(){let t=0;return this.forEachSet((e=>{t++})),t}}


/***/ }),

/***/ "../node_modules/luxon/src/datetime.js":
/*!*********************************************!*\
  !*** ../node_modules/luxon/src/datetime.js ***!
  \*********************************************/
/*! exports provided: default, friendlyDateTime */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return DateTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "friendlyDateTime", function() { return friendlyDateTime; });
/* harmony import */ var _duration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./duration.js */ "../node_modules/luxon/src/duration.js");
/* harmony import */ var _interval_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./interval.js */ "../node_modules/luxon/src/interval.js");
/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./settings.js */ "../node_modules/luxon/src/settings.js");
/* harmony import */ var _info_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./info.js */ "../node_modules/luxon/src/info.js");
/* harmony import */ var _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./impl/formatter.js */ "../node_modules/luxon/src/impl/formatter.js");
/* harmony import */ var _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./zones/fixedOffsetZone.js */ "../node_modules/luxon/src/zones/fixedOffsetZone.js");
/* harmony import */ var _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./impl/locale.js */ "../node_modules/luxon/src/impl/locale.js");
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./impl/util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./impl/zoneUtil.js */ "../node_modules/luxon/src/impl/zoneUtil.js");
/* harmony import */ var _impl_diff_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./impl/diff.js */ "../node_modules/luxon/src/impl/diff.js");
/* harmony import */ var _impl_regexParser_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./impl/regexParser.js */ "../node_modules/luxon/src/impl/regexParser.js");
/* harmony import */ var _impl_tokenParser_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./impl/tokenParser.js */ "../node_modules/luxon/src/impl/tokenParser.js");
/* harmony import */ var _impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./impl/conversions.js */ "../node_modules/luxon/src/impl/conversions.js");
/* harmony import */ var _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./impl/formats.js */ "../node_modules/luxon/src/impl/formats.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./errors.js */ "../node_modules/luxon/src/errors.js");
/* harmony import */ var _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./impl/invalid.js */ "../node_modules/luxon/src/impl/invalid.js");

















const INVALID = "Invalid DateTime";
const MAX_DATE = 8.64e15;

function unsupportedZone(zone) {
  return new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"]("unsupported zone", `the zone "${zone.name}" is not supported`);
}

// we cache week data on the DT object and this intermediates the cache
function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToWeek"])(dt.c);
  }
  return dt.weekData;
}

// clone really means, "make a new object with these modifications". all "setters" really use this
// to create a new object while only changing some of the properties
function clone(inst, alts) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid,
  };
  return new DateTime({ ...current, ...alts, old: current });
}

// find the right offset a given local time. The o input is our guess, which determines which
// offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)
function fixOffset(localTS, o, tz) {
  // Our UTC time is just a guess because our offset is just a guess
  let utcGuess = localTS - o * 60 * 1000;

  // Test whether the zone matches the offset for this ts
  const o2 = tz.offset(utcGuess);

  // If so, offset didn't change and we're done
  if (o === o2) {
    return [utcGuess, o];
  }

  // If not, change the ts by the difference in the offset
  utcGuess -= (o2 - o) * 60 * 1000;

  // If that gives us the local time we want, we're done
  const o3 = tz.offset(utcGuess);
  if (o2 === o3) {
    return [utcGuess, o2];
  }

  // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time
  return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
}

// convert an epoch timestamp into a calendar object with the given offset
function tsToObj(ts, offset) {
  ts += offset * 60 * 1000;

  const d = new Date(ts);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds(),
  };
}

// convert a calendar object to a epoch timestamp
function objToTS(obj, offset, zone) {
  return fixOffset(Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["objToLocalTS"])(obj), offset, zone);
}

// create a new DT instance by adding a duration, adjusting for DSTs
function adjustTime(inst, dur) {
  const oPre = inst.o,
    year = inst.c.year + Math.trunc(dur.years),
    month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3,
    c = {
      ...inst.c,
      year,
      month,
      day:
        Math.min(inst.c.day, Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["daysInMonth"])(year, month)) +
        Math.trunc(dur.days) +
        Math.trunc(dur.weeks) * 7,
    },
    millisToAdd = _duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromObject({
      years: dur.years - Math.trunc(dur.years),
      quarters: dur.quarters - Math.trunc(dur.quarters),
      months: dur.months - Math.trunc(dur.months),
      weeks: dur.weeks - Math.trunc(dur.weeks),
      days: dur.days - Math.trunc(dur.days),
      hours: dur.hours,
      minutes: dur.minutes,
      seconds: dur.seconds,
      milliseconds: dur.milliseconds,
    }).as("milliseconds"),
    localTS = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["objToLocalTS"])(c);

  let [ts, o] = fixOffset(localTS, oPre, inst.zone);

  if (millisToAdd !== 0) {
    ts += millisToAdd;
    // that could have changed the offset by going over a DST, but we want to keep the ts the same
    o = inst.zone.offset(ts);
  }

  return { ts, o };
}

// helper useful in turning the results of parsing into real dates
// by handling the zone options
function parseDataToDateTime(parsed, parsedZone, opts, format, text) {
  const { setZone, zone } = opts;
  if (parsed && Object.keys(parsed).length !== 0) {
    const interpretationZone = parsedZone || zone,
      inst = DateTime.fromObject(parsed, {
        ...opts,
        zone: interpretationZone,
      });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(
      new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"]("unparsable", `the input "${text}" can't be parsed as ${format}`)
    );
  }
}

// if you want to output a technical format (e.g. RFC 2822), this helper
// helps handle the details
function toTechFormat(dt, format, allowZ = true) {
  return dt.isValid
    ? _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__["default"].create(_impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].create("en-US"), {
        allowZ,
        forceSimple: true,
      }).formatDateTimeFromString(dt, format)
    : null;
}

// technical time formats (e.g. the time part of ISO 8601), take some options
// and this commonizes their handling
function toTechTimeFormat(
  dt,
  {
    suppressSeconds = false,
    suppressMilliseconds = false,
    includeOffset,
    includePrefix = false,
    includeZone = false,
    spaceZone = false,
    format = "extended",
  }
) {
  let fmt = format === "basic" ? "HHmm" : "HH:mm";

  if (!suppressSeconds || dt.second !== 0 || dt.millisecond !== 0) {
    fmt += format === "basic" ? "ss" : ":ss";
    if (!suppressMilliseconds || dt.millisecond !== 0) {
      fmt += ".SSS";
    }
  }

  if ((includeZone || includeOffset) && spaceZone) {
    fmt += " ";
  }

  if (includeZone) {
    fmt += "z";
  } else if (includeOffset) {
    fmt += format === "basic" ? "ZZZ" : "ZZ";
  }

  let str = toTechFormat(dt, fmt);

  if (includePrefix) {
    str = "T" + str;
  }

  return str;
}

// defaults for unspecified units in the supported calendars
const defaultUnitValues = {
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  },
  defaultWeekUnitValues = {
    weekNumber: 1,
    weekday: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  },
  defaultOrdinalUnitValues = {
    ordinal: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };

// Units in the supported calendars, sorted by bigness
const orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"],
  orderedWeekUnits = [
    "weekYear",
    "weekNumber",
    "weekday",
    "hour",
    "minute",
    "second",
    "millisecond",
  ],
  orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];

// standardize case and plurality in units
function normalizeUnit(unit) {
  const normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal",
  }[unit.toLowerCase()];

  if (!normalized) throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidUnitError"](unit);

  return normalized;
}

// this is a dumbed down version of fromObject() that runs about 60% faster
// but doesn't do any validation, makes a bunch of assumptions about what units
// are present, and so on.

// this is a dumbed down version of fromObject() that runs about 60% faster
// but doesn't do any validation, makes a bunch of assumptions about what units
// are present, and so on.
function quickDT(obj, opts) {
  const zone = Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(opts.zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone),
    loc = _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromObject(opts),
    tsNow = _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].now();

  let ts, o;

  // assume we have the higher-order units
  if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(obj.year)) {
    for (const u of orderedUnits) {
      if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(obj[u])) {
        obj[u] = defaultUnitValues[u];
      }
    }

    const invalid = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidGregorianData"])(obj) || Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidTimeData"])(obj);
    if (invalid) {
      return DateTime.invalid(invalid);
    }

    const offsetProvis = zone.offset(tsNow);
    [ts, o] = objToTS(obj, offsetProvis, zone);
  } else {
    ts = tsNow;
  }

  return new DateTime({ ts, zone, loc, o });
}

function diffRelative(start, end, opts) {
  const round = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(opts.round) ? true : opts.round,
    format = (c, unit) => {
      c = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["roundTo"])(c, round || opts.calendary ? 0 : 2, true);
      const formatter = end.loc.clone(opts).relFormatter(opts);
      return formatter.format(c, unit);
    },
    differ = (unit) => {
      if (opts.calendary) {
        if (!end.hasSame(start, unit)) {
          return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
        } else return 0;
      } else {
        return end.diff(start, unit).get(unit);
      }
    };

  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }

  for (const unit of opts.units) {
    const count = differ(unit);
    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }
  return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
}

function lastOpts(argList) {
  let opts = {},
    args;
  if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
    opts = argList[argList.length - 1];
    args = Array.from(argList).slice(0, argList.length - 1);
  } else {
    args = Array.from(argList);
  }
  return [opts, args];
}

/**
 * A DateTime is an immutable data structure representing a specific date and time and accompanying methods. It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
 *
 * A DateTime comprises of:
 * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
 * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
 * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
 *
 * Here is a brief overview of the most commonly used functionality it provides:
 *
 * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link DateTime.local}, {@link DateTime.utc}, and (most flexibly) {@link DateTime.fromObject}. To create one from a standard string format, use {@link DateTime.fromISO}, {@link DateTime.fromHTTP}, and {@link DateTime.fromRFC2822}. To create one from a custom string format, use {@link DateTime.fromFormat}. To create one from a native JS date, use {@link DateTime.fromJSDate}.
 * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link DateTime#toObject}), use the {@link DateTime#year}, {@link DateTime#month},
 * {@link DateTime#day}, {@link DateTime#hour}, {@link DateTime#minute}, {@link DateTime#second}, {@link DateTime#millisecond} accessors.
 * * **Week calendar**: For ISO week calendar attributes, see the {@link DateTime#weekYear}, {@link DateTime#weekNumber}, and {@link DateTime#weekday} accessors.
 * * **Configuration** See the {@link DateTime#locale} and {@link DateTime#numberingSystem} accessors.
 * * **Transformation**: To transform the DateTime into other DateTimes, use {@link DateTime#set}, {@link DateTime#reconfigure}, {@link DateTime#setZone}, {@link DateTime#setLocale}, {@link DateTime.plus}, {@link DateTime#minus}, {@link DateTime#endOf}, {@link DateTime#startOf}, {@link DateTime#toUTC}, and {@link DateTime#toLocal}.
 * * **Output**: To convert the DateTime to other representations, use the {@link DateTime#toRelative}, {@link DateTime#toRelativeCalendar}, {@link DateTime#toJSON}, {@link DateTime#toISO}, {@link DateTime#toHTTP}, {@link DateTime#toObject}, {@link DateTime#toRFC2822}, {@link DateTime#toString}, {@link DateTime#toLocaleString}, {@link DateTime#toFormat}, {@link DateTime#toMillis} and {@link DateTime#toJSDate}.
 *
 * There's plenty others documented below. In addition, for more information on subtler topics like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
 */
class DateTime {
  /**
   * @access private
   */
  constructor(config) {
    const zone = config.zone || _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone;

    let invalid =
      config.invalid ||
      (Number.isNaN(config.ts) ? new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"]("invalid input") : null) ||
      (!zone.isValid ? unsupportedZone(zone) : null);
    /**
     * @access private
     */
    this.ts = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(config.ts) ? _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].now() : config.ts;

    let c = null,
      o = null;
    if (!invalid) {
      const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);

      if (unchanged) {
        [c, o] = [config.old.c, config.old.o];
      } else {
        const ot = zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"]("invalid input") : null;
        c = invalid ? null : c;
        o = invalid ? null : ot;
      }
    }

    /**
     * @access private
     */
    this._zone = zone;
    /**
     * @access private
     */
    this.loc = config.loc || _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].create();
    /**
     * @access private
     */
    this.invalid = invalid;
    /**
     * @access private
     */
    this.weekData = null;
    /**
     * @access private
     */
    this.c = c;
    /**
     * @access private
     */
    this.o = o;
    /**
     * @access private
     */
    this.isLuxonDateTime = true;
  }

  // CONSTRUCT

  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */
  static now() {
    return new DateTime({});
  }

  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                                  //~> now
   * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
   * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
   * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
   * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  static local() {
    const [opts, args] = lastOpts(arguments),
      [year, month, day, hour, minute, second, millisecond] = args;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }

  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @param {Object} options - configuration options for the DateTime
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @example DateTime.utc()                                              //~> now
   * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
   * @return {DateTime}
   */
  static utc() {
    const [opts, args] = lastOpts(arguments),
      [year, month, day, hour, minute, second, millisecond] = args;

    opts.zone = _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_5__["default"].utcInstance;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }

  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  static fromJSDate(date, options = {}) {
    const ts = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isDate"])(date) ? date.valueOf() : NaN;
    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }

    const zoneToUse = Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(options.zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    return new DateTime({
      ts: ts,
      zone: zoneToUse,
      loc: _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromObject(options),
    });
  }

  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromMillis(milliseconds, options = {}) {
    if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isNumber"])(milliseconds)) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"](
        `fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`
      );
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(options.zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone),
        loc: _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromObject(options),
      });
    }
  }

  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromSeconds(seconds, options = {}) {
    if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isNumber"])(seconds)) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"]("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1000,
        zone: Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(options.zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone),
        loc: _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromObject(options),
      });
    }
  }

  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {Object} opts - options for creating this DateTime
   * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @return {DateTime}
   */
  static fromObject(obj, opts = {}) {
    obj = obj || {};
    const zoneToUse = Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(opts.zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone);
    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    const tsNow = _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].now(),
      offsetProvis = zoneToUse.offset(tsNow),
      normalized = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["normalizeObject"])(obj, normalizeUnit),
      containsOrdinal = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.ordinal),
      containsGregorYear = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.year),
      containsGregorMD = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.month) || !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.day),
      containsGregor = containsGregorYear || containsGregorMD,
      definiteWeekDef = normalized.weekYear || normalized.weekNumber,
      loc = _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromObject(opts);

    // cases:
    // just a weekday -> this week's instance of that weekday, no worries
    // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
    // (gregorian month or day) + ordinal -> error
    // otherwise just use weeks or ordinals or gregorian, depending on what's specified

    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["ConflictingSpecificationError"](
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }

    if (containsGregorMD && containsOrdinal) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["ConflictingSpecificationError"]("Can't mix ordinal dates with month/day");
    }

    const useWeekData = definiteWeekDef || (normalized.weekday && !containsGregor);

    // configure ourselves to deal with gregorian dates or week stuff
    let units,
      defaultValues,
      objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToWeek"])(objNow);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToOrdinal"])(objNow);
    } else {
      units = orderedUnits;
      defaultValues = defaultUnitValues;
    }

    // set default values for missing stuff
    let foundFirst = false;
    for (const u of units) {
      const v = normalized[u];
      if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }

    // make sure the values we have are in range
    const higherOrderInvalid = useWeekData
        ? Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidWeekData"])(normalized)
        : containsOrdinal
        ? Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidOrdinalData"])(normalized)
        : Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidGregorianData"])(normalized),
      invalid = higherOrderInvalid || Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["hasInvalidTimeData"])(normalized);

    if (invalid) {
      return DateTime.invalid(invalid);
    }

    // compute the actual time
    const gregorian = useWeekData
        ? Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["weekToGregorian"])(normalized)
        : containsOrdinal
        ? Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["ordinalToGregorian"])(normalized)
        : normalized,
      [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse),
      inst = new DateTime({
        ts: tsFinal,
        zone: zoneToUse,
        o: offsetFinal,
        loc,
      });

    // gregorian data + weekday serves only to validate
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid(
        "mismatched weekday",
        `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`
      );
    }

    return inst;
  }

  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(text, opts = {}) {
    const [vals, parsedZone] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_10__["parseISODate"])(text);
    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }

  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(text, opts = {}) {
    const [vals, parsedZone] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_10__["parseRFC2822Date"])(text);
    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }

  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(text, opts = {}) {
    const [vals, parsedZone] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_10__["parseHTTPDate"])(text);
    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }

  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromFormat(text, fmt, opts = {}) {
    if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(text) || Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(fmt)) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"]("fromFormat requires an input string and a format");
    }

    const { locale = null, numberingSystem = null } = opts,
      localeToUse = _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromOpts({
        locale,
        numberingSystem,
        defaultToEN: true,
      }),
      [vals, parsedZone, invalid] = Object(_impl_tokenParser_js__WEBPACK_IMPORTED_MODULE_11__["parseFromTokens"])(localeToUse, text, fmt);
    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text);
    }
  }

  /**
   * @deprecated use fromFormat instead
   */
  static fromString(text, fmt, opts = {}) {
    return DateTime.fromFormat(text, fmt, opts);
  }

  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  static fromSQL(text, opts = {}) {
    const [vals, parsedZone] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_10__["parseSQL"])(text);
    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }

  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"]("need to specify a reason the DateTime is invalid");
    }

    const invalid = reason instanceof _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"] ? reason : new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_15__["default"](reason, explanation);

    if (_settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].throwOnInvalid) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidDateTimeError"](invalid);
    } else {
      return new DateTime({ invalid });
    }
  }

  /**
   * Check if an object is a DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDateTime(o) {
    return (o && o.isLuxonDateTime) || false;
  }

  // INFO

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(unit) {
    return this[unit];
  }

  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }

  /**
   * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }

  /**
   * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }

  /**
   * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
   *
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }

  /**
   * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }

  /**
   * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
   *
   * @type {string}
   */
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }

  /**
   * Get the time zone associated with this DateTime.
   * @type {Zone}
   */
  get zone() {
    return this._zone;
  }

  /**
   * Get the name of the time zone.
   * @type {string}
   */
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }

  /**
   * Get the year
   * @example DateTime.local(2017, 5, 25).year //=> 2017
   * @type {number}
   */
  get year() {
    return this.isValid ? this.c.year : NaN;
  }

  /**
   * Get the quarter
   * @example DateTime.local(2017, 5, 25).quarter //=> 2
   * @type {number}
   */
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }

  /**
   * Get the month (1-12).
   * @example DateTime.local(2017, 5, 25).month //=> 5
   * @type {number}
   */
  get month() {
    return this.isValid ? this.c.month : NaN;
  }

  /**
   * Get the day of the month (1-30ish).
   * @example DateTime.local(2017, 5, 25).day //=> 25
   * @type {number}
   */
  get day() {
    return this.isValid ? this.c.day : NaN;
  }

  /**
   * Get the hour of the day (0-23).
   * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
   * @type {number}
   */
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }

  /**
   * Get the minute of the hour (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
   * @type {number}
   */
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }

  /**
   * Get the second of the minute (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
   * @type {number}
   */
  get second() {
    return this.isValid ? this.c.second : NaN;
  }

  /**
   * Get the millisecond of the second (0-999).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
   * @type {number}
   */
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }

  /**
   * Get the week year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
   * @type {number}
   */
  get weekYear() {
    return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
  }

  /**
   * Get the week number of the week year (1-52ish).
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
   * @type {number}
   */
  get weekNumber() {
    return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
  }

  /**
   * Get the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 11, 31).weekday //=> 4
   * @type {number}
   */
  get weekday() {
    return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
  }

  /**
   * Get the ordinal (meaning the day of the year)
   * @example DateTime.local(2017, 5, 25).ordinal //=> 145
   * @type {number|DateTime}
   */
  get ordinal() {
    return this.isValid ? Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToOrdinal"])(this.c).ordinal : NaN;
  }

  /**
   * Get the human readable short month name, such as 'Oct'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
   * @type {string}
   */
  get monthShort() {
    return this.isValid ? _info_js__WEBPACK_IMPORTED_MODULE_3__["default"].months("short", { locObj: this.loc })[this.month - 1] : null;
  }

  /**
   * Get the human readable long month name, such as 'October'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthLong //=> October
   * @type {string}
   */
  get monthLong() {
    return this.isValid ? _info_js__WEBPACK_IMPORTED_MODULE_3__["default"].months("long", { locObj: this.loc })[this.month - 1] : null;
  }

  /**
   * Get the human readable short weekday, such as 'Mon'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
   * @type {string}
   */
  get weekdayShort() {
    return this.isValid ? _info_js__WEBPACK_IMPORTED_MODULE_3__["default"].weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
  }

  /**
   * Get the human readable long weekday, such as 'Monday'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
   * @type {string}
   */
  get weekdayLong() {
    return this.isValid ? _info_js__WEBPACK_IMPORTED_MODULE_3__["default"].weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
  }

  /**
   * Get the UTC offset of this DateTime in minutes
   * @example DateTime.now().offset //=> -240
   * @example DateTime.utc().offset //=> 0
   * @type {number}
   */
  get offset() {
    return this.isValid ? +this.o : NaN;
  }

  /**
   * Get the short human name for the zone's current offset, for example "EST" or "EDT".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameShort() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "short",
        locale: this.locale,
      });
    } else {
      return null;
    }
  }

  /**
   * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameLong() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "long",
        locale: this.locale,
      });
    } else {
      return null;
    }
  }

  /**
   * Get whether this zone's offset ever changes, as in a DST.
   * @type {boolean}
   */
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }

  /**
   * Get whether the DateTime is in a DST.
   * @type {boolean}
   */
  get isInDST() {
    if (this.isOffsetFixed) {
      return false;
    } else {
      return (
        this.offset > this.set({ month: 1 }).offset || this.offset > this.set({ month: 5 }).offset
      );
    }
  }

  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear //=> true
   * @example DateTime.local(2013).isInLeapYear //=> false
   * @type {boolean}
   */
  get isInLeapYear() {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isLeapYear"])(this.year);
  }

  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).daysInMonth //=> 29
   * @example DateTime.local(2016, 3).daysInMonth //=> 31
   * @type {number}
   */
  get daysInMonth() {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["daysInMonth"])(this.year, this.month);
  }

  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear //=> 366
   * @example DateTime.local(2013).daysInYear //=> 365
   * @type {number}
   */
  get daysInYear() {
    return this.isValid ? Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["daysInYear"])(this.year) : NaN;
  }

  /**
   * Returns the number of weeks in this DateTime's year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2004).weeksInWeekYear //=> 53
   * @example DateTime.local(2013).weeksInWeekYear //=> 52
   * @type {number}
   */
  get weeksInWeekYear() {
    return this.isValid ? Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["weeksInWeekYear"])(this.weekYear) : NaN;
  }

  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  resolvedLocaleOptions(opts = {}) {
    const { locale, numberingSystem, calendar } = _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__["default"].create(
      this.loc.clone(opts),
      opts
    ).resolvedOptions(this);
    return { locale, numberingSystem, outputCalendar: calendar };
  }

  // TRANSFORM

  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link DateTime.setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  toUTC(offset = 0, opts = {}) {
    return this.setZone(_zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_5__["default"].instance(offset), opts);
  }

  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.setZone(_settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone);
  }

  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime.plus}. You may wish to use {@link DateTime.toLocal} and {@link DateTime.toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime.Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  setZone(zone, { keepLocalTime = false, keepCalendarTime = false } = {}) {
    zone = Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_8__["normalizeZone"])(zone, _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultZone);
    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      let newTS = this.ts;
      if (keepLocalTime || keepCalendarTime) {
        const offsetGuess = zone.offset(this.ts);
        const asObj = this.toObject();
        [newTS] = objToTS(asObj, offsetGuess, zone);
      }
      return clone(this, { ts: newTS, zone });
    }
  }

  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  reconfigure({ locale, numberingSystem, outputCalendar } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem, outputCalendar });
    return clone(this, { loc });
  }

  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  setLocale(locale) {
    return this.reconfigure({ locale });
  }

  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link DateTime.reconfigure} and {@link DateTime.setZone}.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(values) {
    if (!this.isValid) return this;

    const normalized = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["normalizeObject"])(values, normalizeUnit),
      settingWeekStuff =
        !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.weekYear) ||
        !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.weekNumber) ||
        !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.weekday),
      containsOrdinal = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.ordinal),
      containsGregorYear = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.year),
      containsGregorMD = !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.month) || !Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.day),
      containsGregor = containsGregorYear || containsGregorMD,
      definiteWeekDef = normalized.weekYear || normalized.weekNumber;

    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["ConflictingSpecificationError"](
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }

    if (containsGregorMD && containsOrdinal) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["ConflictingSpecificationError"]("Can't mix ordinal dates with month/day");
    }

    let mixed;
    if (settingWeekStuff) {
      mixed = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["weekToGregorian"])({ ...Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToWeek"])(this.c), ...normalized });
    } else if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.ordinal)) {
      mixed = Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["ordinalToGregorian"])({ ...Object(_impl_conversions_js__WEBPACK_IMPORTED_MODULE_12__["gregorianToOrdinal"])(this.c), ...normalized });
    } else {
      mixed = { ...this.toObject(), ...normalized };

      // if we didn't set the day but we ended up on an overflow date,
      // use the last day of the right month
      if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isUndefined"])(normalized.day)) {
        mixed.day = Math.min(Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["daysInMonth"])(mixed.year, mixed.month), mixed.day);
      }
    }

    const [ts, o] = objToTS(mixed, this.o, this.zone);
    return clone(this, { ts, o });
  }

  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  plus(duration) {
    if (!this.isValid) return this;
    const dur = Object(_duration_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDuration"])(duration);
    return clone(this, adjustTime(this, dur));
  }

  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link DateTime.plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
  */
  minus(duration) {
    if (!this.isValid) return this;
    const dur = Object(_duration_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDuration"])(duration).negate();
    return clone(this, adjustTime(this, dur));
  }

  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(unit) {
    if (!this.isValid) return this;
    const o = {},
      normalizedUnit = _duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].normalizeUnit(unit);
    switch (normalizedUnit) {
      case "years":
        o.month = 1;
      // falls through
      case "quarters":
      case "months":
        o.day = 1;
      // falls through
      case "weeks":
      case "days":
        o.hour = 0;
      // falls through
      case "hours":
        o.minute = 0;
      // falls through
      case "minutes":
        o.second = 0;
      // falls through
      case "seconds":
        o.millisecond = 0;
        break;
      case "milliseconds":
        break;
      // no default, invalid units throw in normalizeUnit()
    }

    if (normalizedUnit === "weeks") {
      o.weekday = 1;
    }

    if (normalizedUnit === "quarters") {
      const q = Math.ceil(this.month / 3);
      o.month = (q - 1) * 3 + 1;
    }

    return this.set(o);
  }

  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(unit) {
    return this.isValid
      ? this.plus({ [unit]: 1 })
          .startOf(unit)
          .minus(1)
      : this;
  }

  // OUTPUT

  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link DateTime.toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.isValid
      ? _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__["default"].create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt)
      : INVALID;
  }

  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString({ locale: 'en-gb' }); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
   * @return {string}
   */
  toLocaleString(formatOpts = _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_SHORT"], opts = {}) {
    return this.isValid
      ? _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__["default"].create(this.loc.clone(opts), formatOpts).formatDateTime(this)
      : INVALID;
  }

  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  toLocaleParts(opts = {}) {
    return this.isValid
      ? _impl_formatter_js__WEBPACK_IMPORTED_MODULE_4__["default"].create(this.loc.clone(opts), opts).formatDateTimeParts(this)
      : [];
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @return {string}
   */
  toISO(opts = {}) {
    if (!this.isValid) {
      return null;
    }

    return `${this.toISODate(opts)}T${this.toISOTime(opts)}`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @return {string}
   */
  toISODate({ format = "extended" } = {}) {
    let fmt = format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";
    if (this.year > 9999) {
      fmt = "+" + fmt;
    }

    return toTechFormat(this, fmt);
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @return {string}
   */
  toISOTime({
    suppressMilliseconds = false,
    suppressSeconds = false,
    includeOffset = true,
    includePrefix = false,
    format = "extended",
  } = {}) {
    return toTechTimeFormat(this, {
      suppressSeconds,
      suppressMilliseconds,
      includeOffset,
      includePrefix,
      format,
    });
  }

  /**
   * Returns an RFC 2822-compatible string representation of this DateTime, always in UTC
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }

  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }

  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string}
   */
  toSQLDate() {
    return toTechFormat(this, "yyyy-MM-dd");
  }

  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  toSQLTime({ includeOffset = true, includeZone = false } = {}) {
    return toTechTimeFormat(this, {
      includeOffset,
      includeZone,
      spaceZone: true,
    });
  }

  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  toSQL(opts = {}) {
    if (!this.isValid) {
      return null;
    }

    return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
  }

  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.isValid ? this.toISO() : INVALID;
  }

  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime.toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }

  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }

  /**
   * Returns the epoch seconds of this DateTime.
   * @return {number}
   */
  toSeconds() {
    return this.isValid ? this.ts / 1000 : NaN;
  }

  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }

  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  toBSON() {
    return this.toJSDate();
  }

  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  toObject(opts = {}) {
    if (!this.isValid) return {};

    const base = { ...this.c };

    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }
    return base;
  }

  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }

  // COMPARE

  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  diff(otherDateTime, unit = "milliseconds", opts = {}) {
    if (!this.isValid || !otherDateTime.isValid) {
      return _duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].invalid("created by diffing an invalid DateTime");
    }

    const durOpts = { locale: this.locale, numberingSystem: this.numberingSystem, ...opts };

    const units = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["maybeArray"])(unit).map(_duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].normalizeUnit),
      otherIsLater = otherDateTime.valueOf() > this.valueOf(),
      earlier = otherIsLater ? this : otherDateTime,
      later = otherIsLater ? otherDateTime : this,
      diffed = Object(_impl_diff_js__WEBPACK_IMPORTED_MODULE_9__["default"])(earlier, later, units, durOpts);

    return otherIsLater ? diffed.negate() : diffed;
  }

  /**
   * Return the difference between this DateTime and right now.
   * See {@link DateTime.diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  diffNow(unit = "milliseconds", opts = {}) {
    return this.diff(DateTime.now(), unit, opts);
  }

  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval}
   */
  until(otherDateTime) {
    return this.isValid ? _interval_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromDateTimes(this, otherDateTime) : this;
  }

  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime.setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  hasSame(otherDateTime, unit) {
    if (!this.isValid) return false;

    const inputMs = otherDateTime.valueOf();
    const otherZoneDateTime = this.setZone(otherDateTime.zone, { keepLocalTime: true });
    return otherZoneDateTime.startOf(unit) <= inputMs && inputMs <= otherZoneDateTime.endOf(unit);
  }

  /**
   * Equality check
   * Two DateTimes are equal iff they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(other) {
    return (
      this.isValid &&
      other.isValid &&
      this.valueOf() === other.valueOf() &&
      this.zone.equals(other.zone) &&
      this.loc.equals(other.loc)
    );
  }

  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds down by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  toRelative(options = {}) {
    if (!this.isValid) return null;
    const base = options.base || DateTime.fromObject({}, { zone: this.zone }),
      padding = options.padding ? (this < base ? -options.padding : options.padding) : 0;
    let units = ["years", "months", "days", "hours", "minutes", "seconds"];
    let unit = options.unit;
    if (Array.isArray(options.unit)) {
      units = options.unit;
      unit = undefined;
    }
    return diffRelative(base, this.plus(padding), {
      ...options,
      numeric: "always",
      units,
      unit,
    });
  }

  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  toRelativeCalendar(options = {}) {
    if (!this.isValid) return null;

    return diffRelative(options.base || DateTime.fromObject({}, { zone: this.zone }), this, {
      ...options,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true,
    });
  }

  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  static min(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"]("min requires all arguments be DateTimes");
    }
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["bestBy"])(dateTimes, (i) => i.valueOf(), Math.min);
  }

  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  static max(...dateTimes) {
    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"]("max requires all arguments be DateTimes");
    }
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["bestBy"])(dateTimes, (i) => i.valueOf(), Math.max);
  }

  // MISC

  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  static fromFormatExplain(text, fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options,
      localeToUse = _impl_locale_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromOpts({
        locale,
        numberingSystem,
        defaultToEN: true,
      });
    return Object(_impl_tokenParser_js__WEBPACK_IMPORTED_MODULE_11__["explainFromTokens"])(localeToUse, text, fmt);
  }

  /**
   * @deprecated use fromFormatExplain instead
   */
  static fromStringExplain(text, fmt, options = {}) {
    return DateTime.fromFormatExplain(text, fmt, options);
  }

  // FORMAT PRESETS

  /**
   * {@link DateTime.toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  static get DATE_SHORT() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_SHORT"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_MED"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Fri, Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED_WITH_WEEKDAY() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_MED_WITH_WEEKDAY"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'October 14, 1983'
   * @type {Object}
   */
  static get DATE_FULL() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_FULL"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Tuesday, October 14, 1983'
   * @type {Object}
   */
  static get DATE_HUGE() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATE_HUGE"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_SIMPLE() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_SIMPLE"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_WITH_SECONDS"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SHORT_OFFSET() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_WITH_SHORT_OFFSET"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_LONG_OFFSET() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_WITH_LONG_OFFSET"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_SIMPLE() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_24_SIMPLE"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_24_WITH_SECONDS"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23 EDT', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SHORT_OFFSET() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_24_WITH_SHORT_OFFSET"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_LONG_OFFSET() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["TIME_24_WITH_LONG_OFFSET"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_SHORT"];
  }

  /**
   * {@link DateTime.toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_SHORT_WITH_SECONDS"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_MED"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_MED_WITH_SECONDS"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_WEEKDAY() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_MED_WITH_WEEKDAY"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_FULL"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_FULL_WITH_SECONDS"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_HUGE"];
  }

  /**
   * {@link DateTime.toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE_WITH_SECONDS() {
    return _impl_formats_js__WEBPACK_IMPORTED_MODULE_13__["DATETIME_HUGE_WITH_SECONDS"];
  }
}

/**
 * @private
 */
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_7__["isNumber"])(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_14__["InvalidArgumentError"](
      `Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`
    );
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/duration.js":
/*!*********************************************!*\
  !*** ../node_modules/luxon/src/duration.js ***!
  \*********************************************/
/*! exports provided: default, friendlyDuration */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Duration; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "friendlyDuration", function() { return friendlyDuration; });
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors.js */ "../node_modules/luxon/src/errors.js");
/* harmony import */ var _impl_formatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./impl/formatter.js */ "../node_modules/luxon/src/impl/formatter.js");
/* harmony import */ var _impl_invalid_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./impl/invalid.js */ "../node_modules/luxon/src/impl/invalid.js");
/* harmony import */ var _impl_locale_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./impl/locale.js */ "../node_modules/luxon/src/impl/locale.js");
/* harmony import */ var _impl_regexParser_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./impl/regexParser.js */ "../node_modules/luxon/src/impl/regexParser.js");
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./impl/util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./settings.js */ "../node_modules/luxon/src/settings.js");








const INVALID = "Invalid Duration";

// unit conversion constants
const lowOrderMatrix = {
    weeks: {
      days: 7,
      hours: 7 * 24,
      minutes: 7 * 24 * 60,
      seconds: 7 * 24 * 60 * 60,
      milliseconds: 7 * 24 * 60 * 60 * 1000,
    },
    days: {
      hours: 24,
      minutes: 24 * 60,
      seconds: 24 * 60 * 60,
      milliseconds: 24 * 60 * 60 * 1000,
    },
    hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
    minutes: { seconds: 60, milliseconds: 60 * 1000 },
    seconds: { milliseconds: 1000 },
  },
  casualMatrix = {
    years: {
      quarters: 4,
      months: 12,
      weeks: 52,
      days: 365,
      hours: 365 * 24,
      minutes: 365 * 24 * 60,
      seconds: 365 * 24 * 60 * 60,
      milliseconds: 365 * 24 * 60 * 60 * 1000,
    },
    quarters: {
      months: 3,
      weeks: 13,
      days: 91,
      hours: 91 * 24,
      minutes: 91 * 24 * 60,
      seconds: 91 * 24 * 60 * 60,
      milliseconds: 91 * 24 * 60 * 60 * 1000,
    },
    months: {
      weeks: 4,
      days: 30,
      hours: 30 * 24,
      minutes: 30 * 24 * 60,
      seconds: 30 * 24 * 60 * 60,
      milliseconds: 30 * 24 * 60 * 60 * 1000,
    },

    ...lowOrderMatrix,
  },
  daysInYearAccurate = 146097.0 / 400,
  daysInMonthAccurate = 146097.0 / 4800,
  accurateMatrix = {
    years: {
      quarters: 4,
      months: 12,
      weeks: daysInYearAccurate / 7,
      days: daysInYearAccurate,
      hours: daysInYearAccurate * 24,
      minutes: daysInYearAccurate * 24 * 60,
      seconds: daysInYearAccurate * 24 * 60 * 60,
      milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000,
    },
    quarters: {
      months: 3,
      weeks: daysInYearAccurate / 28,
      days: daysInYearAccurate / 4,
      hours: (daysInYearAccurate * 24) / 4,
      minutes: (daysInYearAccurate * 24 * 60) / 4,
      seconds: (daysInYearAccurate * 24 * 60 * 60) / 4,
      milliseconds: (daysInYearAccurate * 24 * 60 * 60 * 1000) / 4,
    },
    months: {
      weeks: daysInMonthAccurate / 7,
      days: daysInMonthAccurate,
      hours: daysInMonthAccurate * 24,
      minutes: daysInMonthAccurate * 24 * 60,
      seconds: daysInMonthAccurate * 24 * 60 * 60,
      milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000,
    },
    ...lowOrderMatrix,
  };

// units ordered by size
const orderedUnits = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
];

const reverseUnits = orderedUnits.slice(0).reverse();

// clone really means "create another instance just like this one, but with these changes"
function clone(dur, alts, clear = false) {
  // deep merge for vals
  const conf = {
    values: clear ? alts.values : { ...dur.values, ...(alts.values || {}) },
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
  };
  return new Duration(conf);
}

function antiTrunc(n) {
  return n < 0 ? Math.floor(n) : Math.ceil(n);
}

// NB: mutates parameters
function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
  const conv = matrix[toUnit][fromUnit],
    raw = fromMap[fromUnit] / conv,
    sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]),
    // ok, so this is wild, but see the matrix in the tests
    added =
      !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
  toMap[toUnit] += added;
  fromMap[fromUnit] -= added * conv;
}

// NB: mutates parameters
function normalizeValues(matrix, vals) {
  reverseUnits.reduce((previous, current) => {
    if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["isUndefined"])(vals[current])) {
      if (previous) {
        convert(matrix, vals, previous, vals, current);
      }
      return current;
    } else {
      return previous;
    }
  }, null);
}

/**
 * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime.plus} to add a Duration object to a DateTime, producing another DateTime.
 *
 * Here is a brief overview of commonly used methods and getters in Duration:
 *
 * * **Creation** To create a Duration, use {@link Duration.fromMillis}, {@link Duration.fromObject}, or {@link Duration.fromISO}.
 * * **Unit values** See the {@link Duration#years}, {@link Duration.months}, {@link Duration#weeks}, {@link Duration#days}, {@link Duration#hours}, {@link Duration#minutes}, {@link Duration#seconds}, {@link Duration#milliseconds} accessors.
 * * **Configuration** See  {@link Duration#locale} and {@link Duration#numberingSystem} accessors.
 * * **Transformation** To create new Durations out of old ones use {@link Duration#plus}, {@link Duration#minus}, {@link Duration#normalize}, {@link Duration#set}, {@link Duration#reconfigure}, {@link Duration#shiftTo}, and {@link Duration#negate}.
 * * **Output** To convert the Duration into other representations, see {@link Duration#as}, {@link Duration#toISO}, {@link Duration#toFormat}, and {@link Duration#toJSON}
 *
 * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
 */
class Duration {
  /**
   * @private
   */
  constructor(config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    /**
     * @access private
     */
    this.values = config.values;
    /**
     * @access private
     */
    this.loc = config.loc || _impl_locale_js__WEBPACK_IMPORTED_MODULE_3__["default"].create();
    /**
     * @access private
     */
    this.conversionAccuracy = accurate ? "longterm" : "casual";
    /**
     * @access private
     */
    this.invalid = config.invalid || null;
    /**
     * @access private
     */
    this.matrix = accurate ? accurateMatrix : casualMatrix;
    /**
     * @access private
     */
    this.isLuxonDuration = true;
  }

  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromMillis(count, opts) {
    return Duration.fromObject({ milliseconds: count }, opts);
  }

  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} [opts=[]] - options for creating this Duration
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromObject(obj, opts = {}) {
    if (obj == null || typeof obj !== "object") {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidArgumentError"](
        `Duration.fromObject: argument expected to be an object, got ${
          obj === null ? "null" : typeof obj
        }`
      );
    }
    return new Duration({
      values: Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["normalizeObject"])(obj, Duration.normalizeUnit),
      loc: _impl_locale_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromObject(opts),
      conversionAccuracy: opts.conversionAccuracy,
    });
  }

  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text, opts) {
    const [parsed] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_4__["parseISODuration"])(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }

  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  static fromISOTime(text, opts) {
    const [parsed] = Object(_impl_regexParser_js__WEBPACK_IMPORTED_MODULE_4__["parseISOTimeOnly"])(text);
    if (parsed) {
      return Duration.fromObject(parsed, opts);
    } else {
      return Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }

  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidArgumentError"]("need to specify a reason the Duration is invalid");
    }

    const invalid = reason instanceof _impl_invalid_js__WEBPACK_IMPORTED_MODULE_2__["default"] ? reason : new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_2__["default"](reason, explanation);

    if (_settings_js__WEBPACK_IMPORTED_MODULE_6__["default"].throwOnInvalid) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidDurationError"](invalid);
    } else {
      return new Duration({ invalid });
    }
  }

  /**
   * @private
   */
  static normalizeUnit(unit) {
    const normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds",
    }[unit ? unit.toLowerCase() : unit];

    if (!normalized) throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidUnitError"](unit);

    return normalized;
  }

  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDuration(o) {
    return (o && o.isLuxonDuration) || false;
  }

  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }

  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }

  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * The duration will be converted to the set of units in the format string using {@link Duration.shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    // reverse-compat since 1.2; we always round down now, never up, and we do it by default
    const fmtOpts = {
      ...opts,
      floor: opts.round !== false && opts.floor !== false,
    };
    return this.isValid
      ? _impl_formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"].create(this.loc, fmtOpts).formatDurationFromString(this, fmt)
      : INVALID;
  }

  /**
   * Returns a JavaScript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject() {
    if (!this.isValid) return {};
    return { ...this.values };
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    // we could use the formatter, but this is an easier way to get the minimum string
    if (!this.isValid) return null;

    let s = "P";
    if (this.years !== 0) s += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s += this.weeks + "W";
    if (this.days !== 0) s += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
      s += "T";
    if (this.hours !== 0) s += this.hours + "H";
    if (this.minutes !== 0) s += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      // this will handle "floating point madness" by removing extra decimal places
      // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
      s += Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["roundTo"])(this.seconds + this.milliseconds / 1000, 3) + "S";
    if (s === "P") s += "T0S";
    return s;
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  toISOTime(opts = {}) {
    if (!this.isValid) return null;

    const millis = this.toMillis();
    if (millis < 0 || millis >= 86400000) return null;

    opts = {
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended",
      ...opts,
    };

    const value = this.shiftTo("hours", "minutes", "seconds", "milliseconds");

    let fmt = opts.format === "basic" ? "hhmm" : "hh:mm";

    if (!opts.suppressSeconds || value.seconds !== 0 || value.milliseconds !== 0) {
      fmt += opts.format === "basic" ? "ss" : ":ss";
      if (!opts.suppressMilliseconds || value.milliseconds !== 0) {
        fmt += ".SSS";
      }
    }

    let str = value.toFormat(fmt);

    if (opts.includePrefix) {
      str = "T" + str;
    }

    return str;
  }

  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }

  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }

  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  toMillis() {
    return this.as("milliseconds");
  }

  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }

  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration) {
    if (!this.isValid) return this;

    const dur = friendlyDuration(duration),
      result = {};

    for (const k of orderedUnits) {
      if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["hasOwnProperty"])(dur.values, k) || Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["hasOwnProperty"])(this.values, k)) {
        result[k] = dur.get(k) + this.get(k);
      }
    }

    return clone(this, { values: result }, true);
  }

  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration) {
    if (!this.isValid) return this;

    const dur = friendlyDuration(duration);
    return this.plus(dur.negate());
  }

  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(fn) {
    if (!this.isValid) return this;
    const result = {};
    for (const k of Object.keys(this.values)) {
      result[k] = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["asNumber"])(fn(this.values[k], k));
    }
    return clone(this, { values: result }, true);
  }

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
   * @return {number}
   */
  get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }

  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    if (!this.isValid) return this;

    const mixed = { ...this.values, ...Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["normalizeObject"])(values, Duration.normalizeUnit) };
    return clone(this, { values: mixed });
  }

  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({ locale, numberingSystem, conversionAccuracy } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem }),
      opts = { loc };

    if (conversionAccuracy) {
      opts.conversionAccuracy = conversionAccuracy;
    }

    return clone(this, opts);
  }

  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }

  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  normalize() {
    if (!this.isValid) return this;
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone(this, { values: vals }, true);
  }

  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (!this.isValid) return this;

    if (units.length === 0) {
      return this;
    }

    units = units.map((u) => Duration.normalizeUnit(u));

    const built = {},
      accumulated = {},
      vals = this.toObject();
    let lastUnit;

    for (const k of orderedUnits) {
      if (units.indexOf(k) >= 0) {
        lastUnit = k;

        let own = 0;

        // anything we haven't boiled down yet should get boiled to this unit
        for (const ak in accumulated) {
          own += this.matrix[ak][k] * accumulated[ak];
          accumulated[ak] = 0;
        }

        // plus anything that's already in this unit
        if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["isNumber"])(vals[k])) {
          own += vals[k];
        }

        const i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = own - i; // we'd like to absorb these fractions in another unit

        // plus anything further down the chain that should be rolled up in to this
        for (const down in vals) {
          if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
            convert(this.matrix, vals, down, built, k);
          }
        }
        // otherwise, keep it in the wings to boil it later
      } else if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["isNumber"])(vals[k])) {
        accumulated[k] = vals[k];
      }
    }

    // anything leftover becomes the decimal for the last unit
    // lastUnit must be defined since units is not empty
    for (const key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] +=
          key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }

    return clone(this, { values: built }, true).normalize();
  }

  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.isValid) return this;
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = -this.values[k];
    }
    return clone(this, { values: negated }, true);
  }

  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }

  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }

  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }

  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }

  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }

  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }

  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }

  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }

  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }

  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }

  /**
   * Returns an error code if this Duration became invalid, or null if the Duration is valid
   * @return {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }

  /**
   * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    if (!this.loc.equals(other.loc)) {
      return false;
    }

    function eq(v1, v2) {
      // Consider 0 and undefined as equal
      if (v1 === undefined || v1 === 0) return v2 === undefined || v2 === 0;
      return v1 === v2;
    }

    for (const u of orderedUnits) {
      if (!eq(this.values[u], other.values[u])) {
        return false;
      }
    }
    return true;
  }
}

/**
 * @private
 */
function friendlyDuration(durationish) {
  if (Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["isNumber"])(durationish)) {
    return Duration.fromMillis(durationish);
  } else if (Duration.isDuration(durationish)) {
    return durationish;
  } else if (typeof durationish === "object") {
    return Duration.fromObject(durationish);
  } else {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidArgumentError"](
      `Unknown duration argument ${durationish} of type ${typeof durationish}`
    );
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/errors.js":
/*!*******************************************!*\
  !*** ../node_modules/luxon/src/errors.js ***!
  \*******************************************/
/*! exports provided: InvalidDateTimeError, InvalidIntervalError, InvalidDurationError, ConflictingSpecificationError, InvalidUnitError, InvalidArgumentError, ZoneIsAbstractError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvalidDateTimeError", function() { return InvalidDateTimeError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvalidIntervalError", function() { return InvalidIntervalError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvalidDurationError", function() { return InvalidDurationError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConflictingSpecificationError", function() { return ConflictingSpecificationError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvalidUnitError", function() { return InvalidUnitError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvalidArgumentError", function() { return InvalidArgumentError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ZoneIsAbstractError", function() { return ZoneIsAbstractError; });
// these aren't really private, but nor are they really useful to document

/**
 * @private
 */
class LuxonError extends Error {}

/**
 * @private
 */
class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
class ConflictingSpecificationError extends LuxonError {}

/**
 * @private
 */
class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

/**
 * @private
 */
class InvalidArgumentError extends LuxonError {}

/**
 * @private
 */
class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/conversions.js":
/*!*****************************************************!*\
  !*** ../node_modules/luxon/src/impl/conversions.js ***!
  \*****************************************************/
/*! exports provided: gregorianToWeek, weekToGregorian, gregorianToOrdinal, ordinalToGregorian, hasInvalidWeekData, hasInvalidOrdinalData, hasInvalidGregorianData, hasInvalidTimeData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gregorianToWeek", function() { return gregorianToWeek; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekToGregorian", function() { return weekToGregorian; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gregorianToOrdinal", function() { return gregorianToOrdinal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ordinalToGregorian", function() { return ordinalToGregorian; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasInvalidWeekData", function() { return hasInvalidWeekData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasInvalidOrdinalData", function() { return hasInvalidOrdinalData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasInvalidGregorianData", function() { return hasInvalidGregorianData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasInvalidTimeData", function() { return hasInvalidTimeData; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _invalid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./invalid.js */ "../node_modules/luxon/src/impl/invalid.js");



const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
  leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

function unitOutOfRange(unit, value) {
  return new _invalid_js__WEBPACK_IMPORTED_MODULE_1__["default"](
    "unit out of range",
    `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`
  );
}

function dayOfWeek(year, month, day) {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
}

function computeOrdinal(year, month, day) {
  return day + (Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isLeapYear"])(year) ? leapLadder : nonLeapLadder)[month - 1];
}

function uncomputeOrdinal(year, ordinal) {
  const table = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isLeapYear"])(year) ? leapLadder : nonLeapLadder,
    month0 = table.findIndex((i) => i < ordinal),
    day = ordinal - table[month0];
  return { month: month0 + 1, day };
}

/**
 * @private
 */

function gregorianToWeek(gregObj) {
  const { year, month, day } = gregObj,
    ordinal = computeOrdinal(year, month, day),
    weekday = dayOfWeek(year, month, day);

  let weekNumber = Math.floor((ordinal - weekday + 10) / 7),
    weekYear;

  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["weeksInWeekYear"])(weekYear);
  } else if (weekNumber > Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["weeksInWeekYear"])(year)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }

  return { weekYear, weekNumber, weekday, ...Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["timeObject"])(gregObj) };
}

function weekToGregorian(weekData) {
  const { weekYear, weekNumber, weekday } = weekData,
    weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
    yearInDays = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["daysInYear"])(weekYear);

  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
    year;

  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["daysInYear"])(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["daysInYear"])(weekYear);
  } else {
    year = weekYear;
  }

  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["timeObject"])(weekData) };
}

function gregorianToOrdinal(gregData) {
  const { year, month, day } = gregData;
  const ordinal = computeOrdinal(year, month, day);
  return { year, ordinal, ...Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["timeObject"])(gregData) };
}

function ordinalToGregorian(ordinalData) {
  const { year, ordinal } = ordinalData;
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["timeObject"])(ordinalData) };
}

function hasInvalidWeekData(obj) {
  const validYear = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isInteger"])(obj.weekYear),
    validWeek = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(obj.weekNumber, 1, Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["weeksInWeekYear"])(obj.weekYear)),
    validWeekday = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(obj.weekday, 1, 7);

  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.week);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else return false;
}

function hasInvalidOrdinalData(obj) {
  const validYear = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isInteger"])(obj.year),
    validOrdinal = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(obj.ordinal, 1, Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["daysInYear"])(obj.year));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else return false;
}

function hasInvalidGregorianData(obj) {
  const validYear = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isInteger"])(obj.year),
    validMonth = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(obj.month, 1, 12),
    validDay = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(obj.day, 1, Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["daysInMonth"])(obj.year, obj.month));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else return false;
}

function hasInvalidTimeData(obj) {
  const { hour, minute, second, millisecond } = obj;
  const validHour =
      Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(hour, 0, 23) ||
      (hour === 24 && minute === 0 && second === 0 && millisecond === 0),
    validMinute = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(minute, 0, 59),
    validSecond = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(second, 0, 59),
    validMillisecond = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["integerBetween"])(millisecond, 0, 999);

  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else return false;
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/diff.js":
/*!**********************************************!*\
  !*** ../node_modules/luxon/src/impl/diff.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _duration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../duration.js */ "../node_modules/luxon/src/duration.js");


function dayDiff(earlier, later) {
  const utcDayStart = (dt) => dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(),
    ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(_duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromMillis(ms).as("days"));
}

function highOrderDiffs(cursor, later, units) {
  const differs = [
    ["years", (a, b) => b.year - a.year],
    ["quarters", (a, b) => b.quarter - a.quarter],
    ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12],
    [
      "weeks",
      (a, b) => {
        const days = dayDiff(a, b);
        return (days - (days % 7)) / 7;
      },
    ],
    ["days", dayDiff],
  ];

  const results = {};
  let lowestOrder, highWater;

  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      let delta = differ(cursor, later);
      highWater = cursor.plus({ [unit]: delta });

      if (highWater > later) {
        cursor = cursor.plus({ [unit]: delta - 1 });
        delta -= 1;
      } else {
        cursor = highWater;
      }

      results[unit] = delta;
    }
  }

  return [cursor, results, highWater, lowestOrder];
}

/* harmony default export */ __webpack_exports__["default"] = (function (earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = later - cursor;

  const lowerOrderUnits = units.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }

  const duration = _duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromObject(results, opts);

  if (lowerOrderUnits.length > 0) {
    return _duration_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromMillis(remainingMillis, opts)
      .shiftTo(...lowerOrderUnits)
      .plus(duration);
  } else {
    return duration;
  }
});


/***/ }),

/***/ "../node_modules/luxon/src/impl/digits.js":
/*!************************************************!*\
  !*** ../node_modules/luxon/src/impl/digits.js ***!
  \************************************************/
/*! exports provided: parseDigits, digitRegex */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseDigits", function() { return parseDigits; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "digitRegex", function() { return digitRegex; });
const numberingSystems = {
  arab: "[\u0660-\u0669]",
  arabext: "[\u06F0-\u06F9]",
  bali: "[\u1B50-\u1B59]",
  beng: "[\u09E6-\u09EF]",
  deva: "[\u0966-\u096F]",
  fullwide: "[\uFF10-\uFF19]",
  gujr: "[\u0AE6-\u0AEF]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[\u17E0-\u17E9]",
  knda: "[\u0CE6-\u0CEF]",
  laoo: "[\u0ED0-\u0ED9]",
  limb: "[\u1946-\u194F]",
  mlym: "[\u0D66-\u0D6F]",
  mong: "[\u1810-\u1819]",
  mymr: "[\u1040-\u1049]",
  orya: "[\u0B66-\u0B6F]",
  tamldec: "[\u0BE6-\u0BEF]",
  telu: "[\u0C66-\u0C6F]",
  thai: "[\u0E50-\u0E59]",
  tibt: "[\u0F20-\u0F29]",
  latn: "\\d",
};

const numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881],
};

const hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");

function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);

      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}

function digitRegex({ numberingSystem }, append = "") {
  return new RegExp(`${numberingSystems[numberingSystem || "latn"]}${append}`);
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/english.js":
/*!*************************************************!*\
  !*** ../node_modules/luxon/src/impl/english.js ***!
  \*************************************************/
/*! exports provided: monthsLong, monthsShort, monthsNarrow, months, weekdaysLong, weekdaysShort, weekdaysNarrow, weekdays, meridiems, erasLong, erasShort, erasNarrow, eras, meridiemForDateTime, weekdayForDateTime, monthForDateTime, eraForDateTime, formatRelativeTime, formatString */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "monthsLong", function() { return monthsLong; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "monthsShort", function() { return monthsShort; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "monthsNarrow", function() { return monthsNarrow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "months", function() { return months; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekdaysLong", function() { return weekdaysLong; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekdaysShort", function() { return weekdaysShort; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekdaysNarrow", function() { return weekdaysNarrow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekdays", function() { return weekdays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "meridiems", function() { return meridiems; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "erasLong", function() { return erasLong; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "erasShort", function() { return erasShort; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "erasNarrow", function() { return erasNarrow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eras", function() { return eras; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "meridiemForDateTime", function() { return meridiemForDateTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weekdayForDateTime", function() { return weekdayForDateTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "monthForDateTime", function() { return monthForDateTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eraForDateTime", function() { return eraForDateTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatRelativeTime", function() { return formatRelativeTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatString", function() { return formatString; });
/* harmony import */ var _formats_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./formats.js */ "../node_modules/luxon/src/impl/formats.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");



function stringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * @private
 */

const monthsLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function months(length) {
  switch (length) {
    case "narrow":
      return [...monthsNarrow];
    case "short":
      return [...monthsShort];
    case "long":
      return [...monthsLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}

const weekdaysLong = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];

function weekdays(length) {
  switch (length) {
    case "narrow":
      return [...weekdaysNarrow];
    case "short":
      return [...weekdaysShort];
    case "long":
      return [...weekdaysLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}

const meridiems = ["AM", "PM"];

const erasLong = ["Before Christ", "Anno Domini"];

const erasShort = ["BC", "AD"];

const erasNarrow = ["B", "A"];

function eras(length) {
  switch (length) {
    case "narrow":
      return [...erasNarrow];
    case "short":
      return [...erasShort];
    case "long":
      return [...erasLong];
    default:
      return null;
  }
}

function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}

function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}

function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}

function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}

function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
  const units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."],
  };

  const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;

  if (numeric === "auto" && lastable) {
    const isDay = unit === "days";
    switch (count) {
      case 1:
        return isDay ? "tomorrow" : `next ${units[unit][0]}`;
      case -1:
        return isDay ? "yesterday" : `last ${units[unit][0]}`;
      case 0:
        return isDay ? "today" : `this ${units[unit][0]}`;
      default: // fall through
    }
  }

  const isInPast = Object.is(count, -0) || count < 0,
    fmtValue = Math.abs(count),
    singular = fmtValue === 1,
    lilUnits = units[unit],
    fmtUnit = narrow
      ? singular
        ? lilUnits[1]
        : lilUnits[2] || lilUnits[1]
      : singular
      ? units[unit][0]
      : unit;
  return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
}

function formatString(knownFormat) {
  // these all have the offsets removed because we don't have access to them
  // without all the intl stuff this is backfilling
  const filtered = Object(_util_js__WEBPACK_IMPORTED_MODULE_1__["pick"])(knownFormat, [
      "weekday",
      "era",
      "year",
      "month",
      "day",
      "hour",
      "minute",
      "second",
      "timeZoneName",
      "hourCycle",
    ]),
    key = stringify(filtered),
    dateTimeHuge = "EEEE, LLLL d, yyyy, h:mm a";
  switch (key) {
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATE_SHORT"]):
      return "M/d/yyyy";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATE_MED"]):
      return "LLL d, yyyy";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATE_MED_WITH_WEEKDAY"]):
      return "EEE, LLL d, yyyy";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATE_FULL"]):
      return "LLLL d, yyyy";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATE_HUGE"]):
      return "EEEE, LLLL d, yyyy";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_SIMPLE"]):
      return "h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_WITH_SECONDS"]):
      return "h:mm:ss a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_WITH_SHORT_OFFSET"]):
      return "h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_WITH_LONG_OFFSET"]):
      return "h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_24_SIMPLE"]):
      return "HH:mm";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_24_WITH_SECONDS"]):
      return "HH:mm:ss";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_24_WITH_SHORT_OFFSET"]):
      return "HH:mm";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["TIME_24_WITH_LONG_OFFSET"]):
      return "HH:mm";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_SHORT"]):
      return "M/d/yyyy, h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_MED"]):
      return "LLL d, yyyy, h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_FULL"]):
      return "LLLL d, yyyy, h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_HUGE"]):
      return dateTimeHuge;
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_SHORT_WITH_SECONDS"]):
      return "M/d/yyyy, h:mm:ss a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_MED_WITH_SECONDS"]):
      return "LLL d, yyyy, h:mm:ss a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_MED_WITH_WEEKDAY"]):
      return "EEE, d LLL yyyy, h:mm a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_FULL_WITH_SECONDS"]):
      return "LLLL d, yyyy, h:mm:ss a";
    case stringify(_formats_js__WEBPACK_IMPORTED_MODULE_0__["DATETIME_HUGE_WITH_SECONDS"]):
      return "EEEE, LLLL d, yyyy, h:mm:ss a";
    default:
      return dateTimeHuge;
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/formats.js":
/*!*************************************************!*\
  !*** ../node_modules/luxon/src/impl/formats.js ***!
  \*************************************************/
/*! exports provided: DATE_SHORT, DATE_MED, DATE_MED_WITH_WEEKDAY, DATE_FULL, DATE_HUGE, TIME_SIMPLE, TIME_WITH_SECONDS, TIME_WITH_SHORT_OFFSET, TIME_WITH_LONG_OFFSET, TIME_24_SIMPLE, TIME_24_WITH_SECONDS, TIME_24_WITH_SHORT_OFFSET, TIME_24_WITH_LONG_OFFSET, DATETIME_SHORT, DATETIME_SHORT_WITH_SECONDS, DATETIME_MED, DATETIME_MED_WITH_SECONDS, DATETIME_MED_WITH_WEEKDAY, DATETIME_FULL, DATETIME_FULL_WITH_SECONDS, DATETIME_HUGE, DATETIME_HUGE_WITH_SECONDS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATE_SHORT", function() { return DATE_SHORT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATE_MED", function() { return DATE_MED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATE_MED_WITH_WEEKDAY", function() { return DATE_MED_WITH_WEEKDAY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATE_FULL", function() { return DATE_FULL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATE_HUGE", function() { return DATE_HUGE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_SIMPLE", function() { return TIME_SIMPLE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_WITH_SECONDS", function() { return TIME_WITH_SECONDS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_WITH_SHORT_OFFSET", function() { return TIME_WITH_SHORT_OFFSET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_WITH_LONG_OFFSET", function() { return TIME_WITH_LONG_OFFSET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_24_SIMPLE", function() { return TIME_24_SIMPLE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_24_WITH_SECONDS", function() { return TIME_24_WITH_SECONDS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_24_WITH_SHORT_OFFSET", function() { return TIME_24_WITH_SHORT_OFFSET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIME_24_WITH_LONG_OFFSET", function() { return TIME_24_WITH_LONG_OFFSET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_SHORT", function() { return DATETIME_SHORT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_SHORT_WITH_SECONDS", function() { return DATETIME_SHORT_WITH_SECONDS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_MED", function() { return DATETIME_MED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_MED_WITH_SECONDS", function() { return DATETIME_MED_WITH_SECONDS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_MED_WITH_WEEKDAY", function() { return DATETIME_MED_WITH_WEEKDAY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_FULL", function() { return DATETIME_FULL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_FULL_WITH_SECONDS", function() { return DATETIME_FULL_WITH_SECONDS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_HUGE", function() { return DATETIME_HUGE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DATETIME_HUGE_WITH_SECONDS", function() { return DATETIME_HUGE_WITH_SECONDS; });
/**
 * @private
 */

const n = "numeric",
  s = "short",
  l = "long";

const DATE_SHORT = {
  year: n,
  month: n,
  day: n,
};

const DATE_MED = {
  year: n,
  month: s,
  day: n,
};

const DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
};

const DATE_FULL = {
  year: n,
  month: l,
  day: n,
};

const DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
};

const TIME_SIMPLE = {
  hour: n,
  minute: n,
};

const TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
};

const TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

const TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};

const TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hourCycle: "h23",
};

const TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
};

const TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s,
};

const TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l,
};

const DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
};

const DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

const DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
};

const DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

const DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n,
};

const DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s,
};

const DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

const DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l,
};

const DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};


/***/ }),

/***/ "../node_modules/luxon/src/impl/formatter.js":
/*!***************************************************!*\
  !*** ../node_modules/luxon/src/impl/formatter.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Formatter; });
/* harmony import */ var _english_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./english.js */ "../node_modules/luxon/src/impl/english.js");
/* harmony import */ var _formats_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formats.js */ "../node_modules/luxon/src/impl/formats.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");




function stringifyTokens(splits, tokenToString) {
  let s = "";
  for (const token of splits) {
    if (token.literal) {
      s += token.val;
    } else {
      s += tokenToString(token.val);
    }
  }
  return s;
}

const macroTokenToFormatOpts = {
  D: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATE_SHORT"],
  DD: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATE_MED"],
  DDD: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATE_FULL"],
  DDDD: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATE_HUGE"],
  t: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_SIMPLE"],
  tt: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_WITH_SECONDS"],
  ttt: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_WITH_SHORT_OFFSET"],
  tttt: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_WITH_LONG_OFFSET"],
  T: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_24_SIMPLE"],
  TT: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_24_WITH_SECONDS"],
  TTT: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_24_WITH_SHORT_OFFSET"],
  TTTT: _formats_js__WEBPACK_IMPORTED_MODULE_1__["TIME_24_WITH_LONG_OFFSET"],
  f: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_SHORT"],
  ff: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_MED"],
  fff: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_FULL"],
  ffff: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_HUGE"],
  F: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_SHORT_WITH_SECONDS"],
  FF: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_MED_WITH_SECONDS"],
  FFF: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_FULL_WITH_SECONDS"],
  FFFF: _formats_js__WEBPACK_IMPORTED_MODULE_1__["DATETIME_HUGE_WITH_SECONDS"],
};

/**
 * @private
 */

class Formatter {
  static create(locale, opts = {}) {
    return new Formatter(locale, opts);
  }

  static parseFormat(fmt) {
    let current = null,
      currentFull = "",
      bracketed = false;
    const splits = [];
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({ literal: bracketed, val: currentFull });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: false, val: currentFull });
        }
        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0) {
      splits.push({ literal: bracketed, val: currentFull });
    }

    return splits;
  }

  static macroTokenToFormatOpts(token) {
    return macroTokenToFormatOpts[token];
  }

  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }

  formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }

  formatDateTime(dt, opts = {}) {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }

  formatDateTimeParts(dt, opts = {}) {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.formatToParts();
  }

  resolvedOptions(dt, opts = {}) {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.resolvedOptions();
  }

  num(n, p = 0) {
    // we get some perf out of doing this here, annoyingly
    if (this.opts.forceSimple) {
      return Object(_util_js__WEBPACK_IMPORTED_MODULE_2__["padStart"])(n, p);
    }

    const opts = { ...this.opts };

    if (p > 0) {
      opts.padTo = p;
    }

    return this.loc.numberFormatter(opts).format(n);
  }

  formatDateTimeFromString(dt, fmt) {
    const knownEnglish = this.loc.listingMode() === "en",
      useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory",
      string = (opts, extract) => this.loc.extract(dt, opts, extract),
      formatOffset = (opts) => {
        if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
          return "Z";
        }

        return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
      },
      meridiem = () =>
        knownEnglish
          ? _english_js__WEBPACK_IMPORTED_MODULE_0__["meridiemForDateTime"](dt)
          : string({ hour: "numeric", hourCycle: "h12" }, "dayperiod"),
      month = (length, standalone) =>
        knownEnglish
          ? _english_js__WEBPACK_IMPORTED_MODULE_0__["monthForDateTime"](dt, length)
          : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"),
      weekday = (length, standalone) =>
        knownEnglish
          ? _english_js__WEBPACK_IMPORTED_MODULE_0__["weekdayForDateTime"](dt, length)
          : string(
              standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" },
              "weekday"
            ),
      maybeMacro = (token) => {
        const formatOpts = Formatter.macroTokenToFormatOpts(token);
        if (formatOpts) {
          return this.formatWithSystemDefault(dt, formatOpts);
        } else {
          return token;
        }
      },
      era = (length) =>
        knownEnglish ? _english_js__WEBPACK_IMPORTED_MODULE_0__["eraForDateTime"](dt, length) : string({ era: length }, "era"),
      tokenToString = (token) => {
        // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
        switch (token) {
          // ms
          case "S":
            return this.num(dt.millisecond);
          case "u":
          // falls through
          case "SSS":
            return this.num(dt.millisecond, 3);
          // seconds
          case "s":
            return this.num(dt.second);
          case "ss":
            return this.num(dt.second, 2);
          // minutes
          case "m":
            return this.num(dt.minute);
          case "mm":
            return this.num(dt.minute, 2);
          // hours
          case "h":
            return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
          case "hh":
            return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
          case "H":
            return this.num(dt.hour);
          case "HH":
            return this.num(dt.hour, 2);
          // offset
          case "Z":
            // like +6
            return formatOffset({ format: "narrow", allowZ: this.opts.allowZ });
          case "ZZ":
            // like +06:00
            return formatOffset({ format: "short", allowZ: this.opts.allowZ });
          case "ZZZ":
            // like +0600
            return formatOffset({ format: "techie", allowZ: this.opts.allowZ });
          case "ZZZZ":
            // like EST
            return dt.zone.offsetName(dt.ts, { format: "short", locale: this.loc.locale });
          case "ZZZZZ":
            // like Eastern Standard Time
            return dt.zone.offsetName(dt.ts, { format: "long", locale: this.loc.locale });
          // zone
          case "z":
            // like America/New_York
            return dt.zoneName;
          // meridiems
          case "a":
            return meridiem();
          // dates
          case "d":
            return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt.day);
          case "dd":
            return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt.day, 2);
          // weekdays - standalone
          case "c":
            // like 1
            return this.num(dt.weekday);
          case "ccc":
            // like 'Tues'
            return weekday("short", true);
          case "cccc":
            // like 'Tuesday'
            return weekday("long", true);
          case "ccccc":
            // like 'T'
            return weekday("narrow", true);
          // weekdays - format
          case "E":
            // like 1
            return this.num(dt.weekday);
          case "EEE":
            // like 'Tues'
            return weekday("short", false);
          case "EEEE":
            // like 'Tuesday'
            return weekday("long", false);
          case "EEEEE":
            // like 'T'
            return weekday("narrow", false);
          // months - standalone
          case "L":
            // like 1
            return useDateTimeFormatter
              ? string({ month: "numeric", day: "numeric" }, "month")
              : this.num(dt.month);
          case "LL":
            // like 01, doesn't seem to work
            return useDateTimeFormatter
              ? string({ month: "2-digit", day: "numeric" }, "month")
              : this.num(dt.month, 2);
          case "LLL":
            // like Jan
            return month("short", true);
          case "LLLL":
            // like January
            return month("long", true);
          case "LLLLL":
            // like J
            return month("narrow", true);
          // months - format
          case "M":
            // like 1
            return useDateTimeFormatter
              ? string({ month: "numeric" }, "month")
              : this.num(dt.month);
          case "MM":
            // like 01
            return useDateTimeFormatter
              ? string({ month: "2-digit" }, "month")
              : this.num(dt.month, 2);
          case "MMM":
            // like Jan
            return month("short", false);
          case "MMMM":
            // like January
            return month("long", false);
          case "MMMMM":
            // like J
            return month("narrow", false);
          // years
          case "y":
            // like 2014
            return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year);
          case "yy":
            // like 14
            return useDateTimeFormatter
              ? string({ year: "2-digit" }, "year")
              : this.num(dt.year.toString().slice(-2), 2);
          case "yyyy":
            // like 0012
            return useDateTimeFormatter
              ? string({ year: "numeric" }, "year")
              : this.num(dt.year, 4);
          case "yyyyyy":
            // like 000012
            return useDateTimeFormatter
              ? string({ year: "numeric" }, "year")
              : this.num(dt.year, 6);
          // eras
          case "G":
            // like AD
            return era("short");
          case "GG":
            // like Anno Domini
            return era("long");
          case "GGGGG":
            return era("narrow");
          case "kk":
            return this.num(dt.weekYear.toString().slice(-2), 2);
          case "kkkk":
            return this.num(dt.weekYear, 4);
          case "W":
            return this.num(dt.weekNumber);
          case "WW":
            return this.num(dt.weekNumber, 2);
          case "o":
            return this.num(dt.ordinal);
          case "ooo":
            return this.num(dt.ordinal, 3);
          case "q":
            // like 1
            return this.num(dt.quarter);
          case "qq":
            // like 01
            return this.num(dt.quarter, 2);
          case "X":
            return this.num(Math.floor(dt.ts / 1000));
          case "x":
            return this.num(dt.ts);
          default:
            return maybeMacro(token);
        }
      };

    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }

  formatDurationFromString(dur, fmt) {
    const tokenToField = (token) => {
        switch (token[0]) {
          case "S":
            return "millisecond";
          case "s":
            return "second";
          case "m":
            return "minute";
          case "h":
            return "hour";
          case "d":
            return "day";
          case "M":
            return "month";
          case "y":
            return "year";
          default:
            return null;
        }
      },
      tokenToString = (lildur) => (token) => {
        const mapped = tokenToField(token);
        if (mapped) {
          return this.num(lildur.get(mapped), token.length);
        } else {
          return token;
        }
      },
      tokens = Formatter.parseFormat(fmt),
      realTokens = tokens.reduce(
        (found, { literal, val }) => (literal ? found : found.concat(val)),
        []
      ),
      collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t) => t));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/invalid.js":
/*!*************************************************!*\
  !*** ../node_modules/luxon/src/impl/invalid.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Invalid; });
class Invalid {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }

  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/locale.js":
/*!************************************************!*\
  !*** ../node_modules/luxon/src/impl/locale.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Locale; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _english_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./english.js */ "../node_modules/luxon/src/impl/english.js");
/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../settings.js */ "../node_modules/luxon/src/settings.js");
/* harmony import */ var _datetime_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../datetime.js */ "../node_modules/luxon/src/datetime.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");






let intlDTCache = {};
function getCachedDTF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
}

let intlNumCache = {};
function getCachedINF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache[key];
  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }
  return inf;
}

let intlRelCache = {};
function getCachedRTF(locString, opts = {}) {
  const { base, ...cacheKeyOpts } = opts; // exclude `base` from the options
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache[key];
  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }
  return inf;
}

let sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}

function parseLocaleString(localeStr) {
  // I really want to avoid writing a BCP 47 parser
  // see, e.g. https://github.com/wooorm/bcp-47
  // Instead, we'll do this:

  // a) if the string has no -u extensions, just leave it alone
  // b) if it does, use Intl to resolve everything
  // c) if Intl fails, try again without the -u

  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    const smaller = localeStr.substring(0, uIndex);
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
    } catch (e) {
      options = getCachedDTF(smaller).resolvedOptions();
    }

    const { numberingSystem, calendar } = options;
    // return the smaller one so that we can append the calendar and numbering overrides to it
    return [smaller, numberingSystem, calendar];
  }
}

function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (outputCalendar || numberingSystem) {
    localeStr += "-u";

    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }

    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}

function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = _datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(2016, i, 1);
    ms.push(f(dt));
  }
  return ms;
}

function mapWeekdays(f) {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = _datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}

function listStuff(loc, length, defaultOK, englishFn, intlFn) {
  const mode = loc.listingMode(defaultOK);

  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return (
      loc.numberingSystem === "latn" ||
      !loc.locale ||
      loc.locale.startsWith("en") ||
      new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn"
    );
  }
}

/**
 * @private
 */

class PolyNumberFormatter {
  constructor(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;

    if (!forceSimple) {
      const intlOpts = { useGrouping: false };
      if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }

  format(i) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      // to match the browser's numberformatter defaults
      const fixed = this.floor ? Math.floor(i) : Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["roundTo"])(i, 3);
      return Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["padStart"])(fixed, this.padTo);
    }
  }
}

/**
 * @private
 */

class PolyDateFormatter {
  constructor(dt, intl, opts) {
    this.opts = opts;

    let z;
    if (dt.zone.isUniversal) {
      // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
      // That is why fixed-offset TZ is set to that unless it is:
      // 1. Representing offset 0 when UTC is used to maintain previous behavior and does not become GMT.
      // 2. Unsupported by the browser:
      //    - some do not support Etc/
      //    - < Etc/GMT-14, > Etc/GMT+12, and 30-minute or 45-minute offsets are not part of tzdata
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      const isOffsetZoneSupported = _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_4__["default"].isValidZone(offsetZ);
      if (dt.offset !== 0 && isOffsetZoneSupported) {
        z = offsetZ;
        this.dt = dt;
      } else {
        // Not all fixed-offset zones like Etc/+4:30 are present in tzdata.
        // So we have to make do. Two cases:
        // 1. The format options tell us to show the zone. We can't do that, so the best
        // we can do is format the date in UTC.
        // 2. The format options don't tell us to show the zone. Then we can adjust them
        // the time and tell the formatter to show it to us in UTC, so that the time is right
        // and the bad zone doesn't show up.
        z = "UTC";
        if (opts.timeZoneName) {
          this.dt = dt;
        } else {
          this.dt = dt.offset === 0 ? dt : _datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromMillis(dt.ts + dt.offset * 60 * 1000);
        }
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    const intlOpts = { ...this.opts };
    if (z) {
      intlOpts.timeZone = z;
    }
    this.dtf = getCachedDTF(intl, intlOpts);
  }

  format() {
    return this.dtf.format(this.dt.toJSDate());
  }

  formatToParts() {
    return this.dtf.formatToParts(this.dt.toJSDate());
  }

  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}

/**
 * @private
 */
class PolyRelFormatter {
  constructor(intl, isEnglish, opts) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["hasRelative"])()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }

  format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return _english_js__WEBPACK_IMPORTED_MODULE_1__["formatRelativeTime"](unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }

  formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  }
}

/**
 * @private
 */

class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
  }

  static create(locale, numberingSystem, outputCalendar, defaultToEN = false) {
    const specifiedLocale = locale || _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultLocale;
    // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultNumberingSystem;
    const outputCalendarR = outputCalendar || _settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].defaultOutputCalendar;
    return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
  }

  static resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }

  static fromObject({ locale, numberingSystem, outputCalendar } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar);
  }

  constructor(locale, numbering, outputCalendar, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);

    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};

    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }

    return this.fastNumbersCached;
  }

  listingMode(defaultOK = true) {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness =
      (this.numberingSystem === null || this.numberingSystem === "latn") &&
      (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }

  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        alts.defaultToEN || false
      );
    }
  }

  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }

  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }

  months(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, _english_js__WEBPACK_IMPORTED_MODULE_1__["months"], () => {
      const intl = format ? { month: length, day: "numeric" } : { month: length },
        formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths((dt) => this.extract(dt, intl, "month"));
      }
      return this.monthsCache[formatStr][length];
    });
  }

  weekdays(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, _english_js__WEBPACK_IMPORTED_MODULE_1__["weekdays"], () => {
      const intl = format
          ? { weekday: length, year: "numeric", month: "long", day: "numeric" }
          : { weekday: length },
        formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays((dt) =>
          this.extract(dt, intl, "weekday")
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }

  meridiems(defaultOK = true) {
    return listStuff(
      this,
      undefined,
      defaultOK,
      () => _english_js__WEBPACK_IMPORTED_MODULE_1__["meridiems"],
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it's makes parsing way easier.
        if (!this.meridiemCache) {
          const intl = { hour: "numeric", hourCycle: "h12" };
          this.meridiemCache = [_datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(2016, 11, 13, 9), _datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(2016, 11, 13, 19)].map(
            (dt) => this.extract(dt, intl, "dayperiod")
          );
        }

        return this.meridiemCache;
      }
    );
  }

  eras(length, defaultOK = true) {
    return listStuff(this, length, defaultOK, _english_js__WEBPACK_IMPORTED_MODULE_1__["eras"], () => {
      const intl = { era: length };

      // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[length]) {
        this.eraCache[length] = [_datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(-40, 1, 1), _datetime_js__WEBPACK_IMPORTED_MODULE_3__["default"].utc(2017, 1, 1)].map((dt) =>
          this.extract(dt, intl, "era")
        );
      }

      return this.eraCache[length];
    });
  }

  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(),
      matching = results.find((m) => m.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }

  numberFormatter(opts = {}) {
    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }

  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }

  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }

  isEnglish() {
    return (
      this.locale === "en" ||
      this.locale.toLowerCase() === "en-us" ||
      new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us")
    );
  }

  equals(other) {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/regexParser.js":
/*!*****************************************************!*\
  !*** ../node_modules/luxon/src/impl/regexParser.js ***!
  \*****************************************************/
/*! exports provided: parseISODate, parseRFC2822Date, parseHTTPDate, parseISODuration, parseISOTimeOnly, parseSQL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseISODate", function() { return parseISODate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseRFC2822Date", function() { return parseRFC2822Date; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseHTTPDate", function() { return parseHTTPDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseISODuration", function() { return parseISODuration; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseISOTimeOnly", function() { return parseISOTimeOnly; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseSQL", function() { return parseSQL; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _english_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./english.js */ "../node_modules/luxon/src/impl/english.js");
/* harmony import */ var _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../zones/fixedOffsetZone.js */ "../node_modules/luxon/src/zones/fixedOffsetZone.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");





/*
 * This file handles parsing for well-specified formats. Here's how it works:
 * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
 * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
 * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
 * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
 * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
 * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
 */

function combineRegexes(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
}

function combineExtractors(...extractors) {
  return (m) =>
    extractors
      .reduce(
        ([mergedVals, mergedZone, cursor], ex) => {
          const [val, zone, next] = ex(m, cursor);
          return [{ ...mergedVals, ...val }, mergedZone || zone, next];
        },
        [{}, null, 1]
      )
      .slice(0, 2);
}

function parse(s, ...patterns) {
  if (s == null) {
    return [null, null];
  }

  for (const [regex, extractor] of patterns) {
    const m = regex.exec(s);
    if (m) {
      return extractor(m);
    }
  }
  return [null, null];
}

function simpleParse(...keys) {
  return (match, cursor) => {
    const ret = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(match[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}

// ISO and SQL parsing
const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
  isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
  isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${offsetRegex.source}?`),
  isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`),
  isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
  isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/,
  isoOrdinalRegex = /(\d{4})-?(\d{3})/,
  extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay"),
  extractISOOrdinalData = simpleParse("year", "ordinal"),
  sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/, // dumbed-down version of the ISO one
  sqlTimeRegex = RegExp(
    `${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${_util_js__WEBPACK_IMPORTED_MODULE_0__["ianaRegex"].source}))?`
  ),
  sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);

function int(match, pos, fallback) {
  const m = match[pos];
  return Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(m) ? fallback : Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(m);
}

function extractISOYmd(match, cursor) {
  const item = {
    year: int(match, cursor),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1),
  };

  return [item, null, cursor + 3];
}

function extractISOTime(match, cursor) {
  const item = {
    hours: int(match, cursor, 0),
    minutes: int(match, cursor + 1, 0),
    seconds: int(match, cursor + 2, 0),
    milliseconds: Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseMillis"])(match[cursor + 3]),
  };

  return [item, null, cursor + 4];
}

function extractISOOffset(match, cursor) {
  const local = !match[cursor] && !match[cursor + 1],
    fullOffset = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["signedOffset"])(match[cursor + 1], match[cursor + 2]),
    zone = local ? null : _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].instance(fullOffset);
  return [{}, zone, cursor + 3];
}

function extractIANAZone(match, cursor) {
  const zone = match[cursor] ? _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__["default"].create(match[cursor]) : null;
  return [{}, zone, cursor + 1];
}

// ISO time parsing

const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);

// ISO duration parsing

const isoDuration =
  /^-?P(?:(?:(-?\d{1,9})Y)?(?:(-?\d{1,9})M)?(?:(-?\d{1,9})W)?(?:(-?\d{1,9})D)?(?:T(?:(-?\d{1,9})H)?(?:(-?\d{1,9})M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

function extractISODuration(match) {
  const [s, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] =
    match;

  const hasNegativePrefix = s[0] === "-";
  const negativeSeconds = secondStr && secondStr[0] === "-";

  const maybeNegate = (num, force = false) =>
    num !== undefined && (force || (num && hasNegativePrefix)) ? -num : num;

  return [
    {
      years: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(yearStr)),
      months: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(monthStr)),
      weeks: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(weekStr)),
      days: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(dayStr)),
      hours: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(hourStr)),
      minutes: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(minuteStr)),
      seconds: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(secondStr), secondStr === "-0"),
      milliseconds: maybeNegate(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseMillis"])(millisecondsStr), negativeSeconds),
    },
  ];
}

// These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that
const obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60,
};

function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["untruncateYear"])(Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(yearStr)) : Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(yearStr),
    month: _english_js__WEBPACK_IMPORTED_MODULE_1__["monthsShort"].indexOf(monthStr) + 1,
    day: Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(dayStr),
    hour: Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(hourStr),
    minute: Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(minuteStr),
  };

  if (secondStr) result.second = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseInteger"])(secondStr);
  if (weekdayStr) {
    result.weekday =
      weekdayStr.length > 3
        ? _english_js__WEBPACK_IMPORTED_MODULE_1__["weekdaysLong"].indexOf(weekdayStr) + 1
        : _english_js__WEBPACK_IMPORTED_MODULE_1__["weekdaysShort"].indexOf(weekdayStr) + 1;
  }

  return result;
}

// RFC 2822/5322
const rfc2822 =
  /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

function extractRFC2822(match) {
  const [
      ,
      weekdayStr,
      dayStr,
      monthStr,
      yearStr,
      hourStr,
      minuteStr,
      secondStr,
      obsOffset,
      milOffset,
      offHourStr,
      offMinuteStr,
    ] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);

  let offset;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["signedOffset"])(offHourStr, offMinuteStr);
  }

  return [result, new _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"](offset)];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s
    .replace(/\([^)]*\)|[\n\t]/g, " ")
    .replace(/(\s\s+)/g, " ")
    .trim();
}

// http date

const rfc1123 =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
  rfc850 =
    /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
  ascii =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

function extractRFC1123Or850(match) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].utcInstance];
}

function extractASCII(match) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].utcInstance];
}

const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);

const extractISOYmdTimeAndOffset = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset
);
const extractISOWeekTimeAndOffset = combineExtractors(
  extractISOWeekData,
  extractISOTime,
  extractISOOffset
);
const extractISOOrdinalDateAndTime = combineExtractors(
  extractISOOrdinalData,
  extractISOTime,
  extractISOOffset
);
const extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);

/**
 * @private
 */

function parseISODate(s) {
  return parse(
    s,
    [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset],
    [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime],
    [isoTimeCombinedRegex, extractISOTimeAndOffset]
  );
}

function parseRFC2822Date(s) {
  return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
}

function parseHTTPDate(s) {
  return parse(
    s,
    [rfc1123, extractRFC1123Or850],
    [rfc850, extractRFC1123Or850],
    [ascii, extractASCII]
  );
}

function parseISODuration(s) {
  return parse(s, [isoDuration, extractISODuration]);
}

const extractISOTimeOnly = combineExtractors(extractISOTime);

function parseISOTimeOnly(s) {
  return parse(s, [isoTimeOnly, extractISOTimeOnly]);
}

const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);

const extractISOYmdTimeOffsetAndIANAZone = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
const extractISOTimeOffsetAndIANAZone = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);

function parseSQL(s) {
  return parse(
    s,
    [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeOffsetAndIANAZone],
    [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]
  );
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/tokenParser.js":
/*!*****************************************************!*\
  !*** ../node_modules/luxon/src/impl/tokenParser.js ***!
  \*****************************************************/
/*! exports provided: explainFromTokens, parseFromTokens */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "explainFromTokens", function() { return explainFromTokens; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseFromTokens", function() { return parseFromTokens; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _formatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./formatter.js */ "../node_modules/luxon/src/impl/formatter.js");
/* harmony import */ var _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../zones/fixedOffsetZone.js */ "../node_modules/luxon/src/zones/fixedOffsetZone.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");
/* harmony import */ var _datetime_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../datetime.js */ "../node_modules/luxon/src/datetime.js");
/* harmony import */ var _digits_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./digits.js */ "../node_modules/luxon/src/impl/digits.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../errors.js */ "../node_modules/luxon/src/errors.js");








const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

function intUnit(regex, post = (i) => i) {
  return { regex, deser: ([s]) => post(Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["parseDigits"])(s)) };
}

const NBSP = String.fromCharCode(160);
const spaceOrNBSP = `( |${NBSP})`;
const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

function fixListRegex(s) {
  // make dots optional and also make them literal
  // make space and non breakable space characters interchangeable
  return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}

function stripInsensitivities(s) {
  return s
    .replace(/\./g, "") // ignore dots that were made optional
    .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
    .toLowerCase();
}

function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s]) =>
        strings.findIndex((i) => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex,
    };
  }
}

function offset(regex, groups) {
  return { regex, deser: ([, h, m]) => Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["signedOffset"])(h, m), groups };
}

function simple(regex) {
  return { regex, deser: ([s]) => s };
}

function escapeToken(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function unitForToken(token, loc) {
  const one = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc),
    two = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{2}"),
    three = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{3}"),
    four = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{4}"),
    six = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{6}"),
    oneOrTwo = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{1,2}"),
    oneToThree = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{1,3}"),
    oneToSix = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{1,6}"),
    oneToNine = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{1,9}"),
    twoToFour = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{2,4}"),
    fourToSix = Object(_digits_js__WEBPACK_IMPORTED_MODULE_5__["digitRegex"])(loc, "{4,6}"),
    literal = (t) => ({ regex: RegExp(escapeToken(t.val)), deser: ([s]) => s, literal: true }),
    unitate = (t) => {
      if (token.literal) {
        return literal(t);
      }
      switch (t.val) {
        // era
        case "G":
          return oneOf(loc.eras("short", false), 0);
        case "GG":
          return oneOf(loc.eras("long", false), 0);
        // years
        case "y":
          return intUnit(oneToSix);
        case "yy":
          return intUnit(twoToFour, _util_js__WEBPACK_IMPORTED_MODULE_0__["untruncateYear"]);
        case "yyyy":
          return intUnit(four);
        case "yyyyy":
          return intUnit(fourToSix);
        case "yyyyyy":
          return intUnit(six);
        // months
        case "M":
          return intUnit(oneOrTwo);
        case "MM":
          return intUnit(two);
        case "MMM":
          return oneOf(loc.months("short", true, false), 1);
        case "MMMM":
          return oneOf(loc.months("long", true, false), 1);
        case "L":
          return intUnit(oneOrTwo);
        case "LL":
          return intUnit(two);
        case "LLL":
          return oneOf(loc.months("short", false, false), 1);
        case "LLLL":
          return oneOf(loc.months("long", false, false), 1);
        // dates
        case "d":
          return intUnit(oneOrTwo);
        case "dd":
          return intUnit(two);
        // ordinals
        case "o":
          return intUnit(oneToThree);
        case "ooo":
          return intUnit(three);
        // time
        case "HH":
          return intUnit(two);
        case "H":
          return intUnit(oneOrTwo);
        case "hh":
          return intUnit(two);
        case "h":
          return intUnit(oneOrTwo);
        case "mm":
          return intUnit(two);
        case "m":
          return intUnit(oneOrTwo);
        case "q":
          return intUnit(oneOrTwo);
        case "qq":
          return intUnit(two);
        case "s":
          return intUnit(oneOrTwo);
        case "ss":
          return intUnit(two);
        case "S":
          return intUnit(oneToThree);
        case "SSS":
          return intUnit(three);
        case "u":
          return simple(oneToNine);
        // meridiem
        case "a":
          return oneOf(loc.meridiems(), 0);
        // weekYear (k)
        case "kkkk":
          return intUnit(four);
        case "kk":
          return intUnit(twoToFour, _util_js__WEBPACK_IMPORTED_MODULE_0__["untruncateYear"]);
        // weekNumber (W)
        case "W":
          return intUnit(oneOrTwo);
        case "WW":
          return intUnit(two);
        // weekdays
        case "E":
        case "c":
          return intUnit(one);
        case "EEE":
          return oneOf(loc.weekdays("short", false, false), 1);
        case "EEEE":
          return oneOf(loc.weekdays("long", false, false), 1);
        case "ccc":
          return oneOf(loc.weekdays("short", true, false), 1);
        case "cccc":
          return oneOf(loc.weekdays("long", true, false), 1);
        // offset/zone
        case "Z":
        case "ZZ":
          return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
        case "ZZZ":
          return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
        // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
        // because we don't have any way to figure out what they are
        case "z":
          return simple(/[a-z_+-/]{1,256}?/i);
        default:
          return literal(t);
      }
    };

  const unit = unitate(token) || {
    invalidReason: MISSING_FTP,
  };

  unit.token = token;

  return unit;
}

const partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy",
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM",
  },
  day: {
    numeric: "d",
    "2-digit": "dd",
  },
  weekday: {
    short: "EEE",
    long: "EEEE",
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour: {
    numeric: "h",
    "2-digit": "hh",
  },
  minute: {
    numeric: "m",
    "2-digit": "mm",
  },
  second: {
    numeric: "s",
    "2-digit": "ss",
  },
};

function tokenForPart(part, locale, formatOpts) {
  const { type, value } = part;

  if (type === "literal") {
    return {
      literal: true,
      val: value,
    };
  }

  const style = formatOpts[type];

  let val = partTypeStyleToTokenVal[type];
  if (typeof val === "object") {
    val = val[style];
  }

  if (val) {
    return {
      literal: false,
      val,
    };
  }

  return undefined;
}

function buildRegex(units) {
  const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return [`^${re}$`, units];
}

function match(input, regex, handlers) {
  const matches = input.match(regex);

  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i in handlers) {
      if (Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["hasOwnProperty"])(handlers, i)) {
        const h = handlers[i],
          groups = h.groups ? h.groups + 1 : 1;
        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}

function dateTimeFromMatches(matches) {
  const toField = (token) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };

  let zone;
  if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(matches.Z)) {
    zone = new _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"](matches.Z);
  } else if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(matches.z)) {
    zone = _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__["default"].create(matches.z);
  } else {
    zone = null;
  }

  if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }

  if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(matches.u)) {
    matches.S = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["parseMillis"])(matches.u);
  }

  const vals = Object.keys(matches).reduce((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k];
    }

    return r;
  }, {});

  return [vals, zone];
}

let dummyDateTimeCache = null;

function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = _datetime_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromMillis(1555555555555);
  }

  return dummyDateTimeCache;
}

function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }

  const formatOpts = _formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"].macroTokenToFormatOpts(token.val);

  if (!formatOpts) {
    return token;
  }

  const formatter = _formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"].create(locale, formatOpts);
  const parts = formatter.formatDateTimeParts(getDummyDateTime());

  const tokens = parts.map((p) => tokenForPart(p, locale, formatOpts));

  if (tokens.includes(undefined)) {
    return token;
  }

  return tokens;
}

function expandMacroTokens(tokens, locale) {
  return Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, locale)));
}

/**
 * @private
 */

function explainFromTokens(locale, input, format) {
  const tokens = expandMacroTokens(_formatter_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseFormat(format), locale),
    units = tokens.map((t) => unitForToken(t, locale)),
    disqualifyingUnit = units.find((t) => t.invalidReason);

  if (disqualifyingUnit) {
    return { input, tokens, invalidReason: disqualifyingUnit.invalidReason };
  } else {
    const [regexString, handlers] = buildRegex(units),
      regex = RegExp(regexString, "i"),
      [rawMatches, matches] = match(input, regex, handlers),
      [result, zone] = matches ? dateTimeFromMatches(matches) : [null, null];
    if (Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["hasOwnProperty"])(matches, "a") && Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["hasOwnProperty"])(matches, "H")) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_6__["ConflictingSpecificationError"](
        "Can't include meridiem when specifying 24-hour format"
      );
    }
    return { input, tokens, regex, rawMatches, matches, result, zone };
  }
}

function parseFromTokens(locale, input, format) {
  const { result, zone, invalidReason } = explainFromTokens(locale, input, format);
  return [result, zone, invalidReason];
}


/***/ }),

/***/ "../node_modules/luxon/src/impl/util.js":
/*!**********************************************!*\
  !*** ../node_modules/luxon/src/impl/util.js ***!
  \**********************************************/
/*! exports provided: isUndefined, isNumber, isInteger, isString, isDate, hasRelative, maybeArray, bestBy, pick, hasOwnProperty, integerBetween, floorMod, padStart, parseInteger, parseMillis, roundTo, isLeapYear, daysInYear, daysInMonth, objToLocalTS, weeksInWeekYear, untruncateYear, parseZoneInfo, signedOffset, asNumber, normalizeObject, formatOffset, timeObject, ianaRegex */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInteger", function() { return isInteger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDate", function() { return isDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasRelative", function() { return hasRelative; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "maybeArray", function() { return maybeArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bestBy", function() { return bestBy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pick", function() { return pick; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasOwnProperty", function() { return hasOwnProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "integerBetween", function() { return integerBetween; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "floorMod", function() { return floorMod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "padStart", function() { return padStart; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseInteger", function() { return parseInteger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseMillis", function() { return parseMillis; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "roundTo", function() { return roundTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isLeapYear", function() { return isLeapYear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "daysInYear", function() { return daysInYear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "daysInMonth", function() { return daysInMonth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objToLocalTS", function() { return objToLocalTS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "weeksInWeekYear", function() { return weeksInWeekYear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "untruncateYear", function() { return untruncateYear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseZoneInfo", function() { return parseZoneInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "signedOffset", function() { return signedOffset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asNumber", function() { return asNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeObject", function() { return normalizeObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatOffset", function() { return formatOffset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeObject", function() { return timeObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ianaRegex", function() { return ianaRegex; });
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../errors.js */ "../node_modules/luxon/src/errors.js");
/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/



/**
 * @private
 */

// TYPES

function isUndefined(o) {
  return typeof o === "undefined";
}

function isNumber(o) {
  return typeof o === "number";
}

function isInteger(o) {
  return typeof o === "number" && o % 1 === 0;
}

function isString(o) {
  return typeof o === "string";
}

function isDate(o) {
  return Object.prototype.toString.call(o) === "[object Date]";
}

// CAPABILITIES

function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}

// OBJECTS AND ARRAYS

function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}

function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return undefined;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}

function pick(obj, keys) {
  return keys.reduce((a, k) => {
    a[k] = obj[k];
    return a;
  }, {});
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// NUMBERS AND STRINGS

function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
}

// x % n but takes the sign of n instead of x
function floorMod(x, n) {
  return x - n * Math.floor(x / n);
}

function padStart(input, n = 2) {
  const minus = input < 0 ? "-" : "";
  const target = minus ? input * -1 : input;
  let result;

  if (target.toString().length < n) {
    result = ("0".repeat(n) + target).slice(-n);
  } else {
    result = target.toString();
  }

  return `${minus}${result}`;
}

function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseInt(string, 10);
  }
}

function parseMillis(fraction) {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return undefined;
  } else {
    const f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
}

function roundTo(number, digits, towardZero = false) {
  const factor = 10 ** digits,
    rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
}

// DATE BASICS

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1,
    modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}

// covert a calendar object to a local timestamp (epoch, but with the offset baked in)
function objToLocalTS(obj) {
  let d = Date.UTC(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second,
    obj.millisecond
  );

  // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that
  if (obj.year < 100 && obj.year >= 0) {
    d = new Date(d);
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }
  return +d;
}

function weeksInWeekYear(weekYear) {
  const p1 =
      (weekYear +
        Math.floor(weekYear / 4) -
        Math.floor(weekYear / 100) +
        Math.floor(weekYear / 400)) %
      7,
    last = weekYear - 1,
    p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}

function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > 60 ? 1900 + year : 2000 + year;
}

// PARSING

function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts),
    intlOpts = {
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }

  const modified = { timeZoneName: offsetFormat, ...intlOpts };

  const parsed = new Intl.DateTimeFormat(locale, modified)
    .formatToParts(date)
    .find((m) => m.type.toLowerCase() === "timezonename");
  return parsed ? parsed.value : null;
}

// signedOffset('-5', '30') -> -330
function signedOffset(offHourStr, offMinuteStr) {
  let offHour = parseInt(offHourStr, 10);

  // don't || this because we want to preserve -0
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }

  const offMin = parseInt(offMinuteStr, 10) || 0,
    offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}

// COERCION

function asNumber(value) {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["InvalidArgumentError"](`Invalid unit value ${value}`);
  return numericValue;
}

function normalizeObject(obj, normalizer) {
  const normalized = {};
  for (const u in obj) {
    if (hasOwnProperty(obj, u)) {
      const v = obj[u];
      if (v === undefined || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }
  return normalized;
}

function formatOffset(offset, format) {
  const hours = Math.trunc(Math.abs(offset / 60)),
    minutes = Math.trunc(Math.abs(offset % 60)),
    sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}

function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}

const ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;


/***/ }),

/***/ "../node_modules/luxon/src/impl/zoneUtil.js":
/*!**************************************************!*\
  !*** ../node_modules/luxon/src/impl/zoneUtil.js ***!
  \**************************************************/
/*! exports provided: normalizeZone */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeZone", function() { return normalizeZone; });
/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../zone.js */ "../node_modules/luxon/src/zone.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");
/* harmony import */ var _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../zones/fixedOffsetZone.js */ "../node_modules/luxon/src/zones/fixedOffsetZone.js");
/* harmony import */ var _zones_invalidZone_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../zones/invalidZone.js */ "../node_modules/luxon/src/zones/invalidZone.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util.js */ "../node_modules/luxon/src/impl/util.js");
/**
 * @private
 */








function normalizeZone(input, defaultZone) {
  let offset;
  if (Object(_util_js__WEBPACK_IMPORTED_MODULE_4__["isUndefined"])(input) || input === null) {
    return defaultZone;
  } else if (input instanceof _zone_js__WEBPACK_IMPORTED_MODULE_0__["default"]) {
    return input;
  } else if (Object(_util_js__WEBPACK_IMPORTED_MODULE_4__["isString"])(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "local" || lowered === "system") return defaultZone;
    else if (lowered === "utc" || lowered === "gmt") return _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].utcInstance;
    else if ((offset = _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__["default"].parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].instance(offset);
    } else if (_zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__["default"].isValidSpecifier(lowered)) return _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__["default"].create(input);
    else return _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].parseSpecifier(lowered) || new _zones_invalidZone_js__WEBPACK_IMPORTED_MODULE_3__["default"](input);
  } else if (Object(_util_js__WEBPACK_IMPORTED_MODULE_4__["isNumber"])(input)) {
    return _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_2__["default"].instance(input);
  } else if (typeof input === "object" && input.offset && typeof input.offset === "number") {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  } else {
    return new _zones_invalidZone_js__WEBPACK_IMPORTED_MODULE_3__["default"](input);
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/info.js":
/*!*****************************************!*\
  !*** ../node_modules/luxon/src/info.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Info; });
/* harmony import */ var _datetime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datetime.js */ "../node_modules/luxon/src/datetime.js");
/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings.js */ "../node_modules/luxon/src/settings.js");
/* harmony import */ var _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./impl/locale.js */ "../node_modules/luxon/src/impl/locale.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");
/* harmony import */ var _impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./impl/zoneUtil.js */ "../node_modules/luxon/src/impl/zoneUtil.js");
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./impl/util.js */ "../node_modules/luxon/src/impl/util.js");








/**
 * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
 */
class Info {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = _settings_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultZone) {
    const proto = _datetime_js__WEBPACK_IMPORTED_MODULE_0__["default"].now().setZone(zone).set({ month: 12 });

    return !zone.isUniversal && proto.offset !== proto.set({ month: 6 }).offset;
  }

  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  static isValidIANAZone(zone) {
    return _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__["default"].isValidSpecifier(zone) && _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_3__["default"].isValidZone(zone);
  }

  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone.isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  static normalizeZone(input) {
    return Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_4__["normalizeZone"])(input, _settings_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultZone);
  }

  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {Array}
   */
  static months(
    length = "long",
    { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}
  ) {
    return (locObj || _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale, numberingSystem, outputCalendar)).months(length);
  }

  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link Info#months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {Array}
   */
  static monthsFormat(
    length = "long",
    { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}
  ) {
    return (locObj || _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale, numberingSystem, outputCalendar)).months(length, true);
  }

  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {Array}
   */
  static weekdays(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale, numberingSystem, null)).weekdays(length);
  }

  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link Info#weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @return {Array}
   */
  static weekdaysFormat(
    length = "long",
    { locale = null, numberingSystem = null, locObj = null } = {}
  ) {
    return (locObj || _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale, numberingSystem, null)).weekdays(length, true);
  }

  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {Array}
   */
  static meridiems({ locale = null } = {}) {
    return _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale).meridiems();
  }

  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {Array}
   */
  static eras(length = "short", { locale = null } = {}) {
    return _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].create(locale, null, "gregory").eras(length);
  }

  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, timezone support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `relative`: whether this environment supports relative time formatting
   * @example Info.features() //=> { intl: true, intlTokens: false, zones: true, relative: false }
   * @return {Object}
   */
  static features() {
    return { relative: Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_5__["hasRelative"])() };
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/interval.js":
/*!*********************************************!*\
  !*** ../node_modules/luxon/src/interval.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Interval; });
/* harmony import */ var _datetime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datetime.js */ "../node_modules/luxon/src/datetime.js");
/* harmony import */ var _duration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./duration.js */ "../node_modules/luxon/src/duration.js");
/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./settings.js */ "../node_modules/luxon/src/settings.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./errors.js */ "../node_modules/luxon/src/errors.js");
/* harmony import */ var _impl_invalid_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./impl/invalid.js */ "../node_modules/luxon/src/impl/invalid.js");






const INVALID = "Invalid Interval";

// checks if the start is equal to or before the end
function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid(
      "end before start",
      `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`
    );
  } else {
    return null;
  }
}

/**
 * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
 *
 * Here is a brief overview of the most commonly used methods and getters in Interval:
 *
 * * **Creation** To create an Interval, use {@link Interval.fromDateTimes}, {@link Interval.after}, {@link Interval.before}, or {@link Interval.fromISO}.
 * * **Accessors** Use {@link Interval#start} and {@link Interval#end} to get the start and end.
 * * **Interrogation** To analyze the Interval, use {@link Interval#count}, {@link Interval#length}, {@link Interval#hasSame}, {@link Interval#contains}, {@link Interval#isAfter}, or {@link Interval#isBefore}.
 * * **Transformation** To create other Intervals out of this one, use {@link Interval#set}, {@link Interval#splitAt}, {@link Interval#splitBy}, {@link Interval#divideEqually}, {@link Interval#merge}, {@link Interval#xor}, {@link Interval#union}, {@link Interval#intersection}, or {@link Interval#difference}.
 * * **Comparison** To compare this Interval to another one, use {@link Interval#equals}, {@link Interval#overlaps}, {@link Interval#abutsStart}, {@link Interval#abutsEnd}, {@link Interval#engulfs}
 * * **Output** To convert the Interval into other representations, see {@link Interval#toString}, {@link Interval#toISO}, {@link Interval#toISODate}, {@link Interval#toISOTime}, {@link Interval#toFormat}, and {@link Interval#toDuration}.
 */
class Interval {
  /**
   * @private
   */
  constructor(config) {
    /**
     * @access private
     */
    this.s = config.start;
    /**
     * @access private
     */
    this.e = config.end;
    /**
     * @access private
     */
    this.invalid = config.invalid || null;
    /**
     * @access private
     */
    this.isLuxonInterval = true;
  }

  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__["InvalidArgumentError"]("need to specify a reason the Interval is invalid");
    }

    const invalid = reason instanceof _impl_invalid_js__WEBPACK_IMPORTED_MODULE_4__["default"] ? reason : new _impl_invalid_js__WEBPACK_IMPORTED_MODULE_4__["default"](reason, explanation);

    if (_settings_js__WEBPACK_IMPORTED_MODULE_2__["default"].throwOnInvalid) {
      throw new _errors_js__WEBPACK_IMPORTED_MODULE_3__["InvalidIntervalError"](invalid);
    } else {
      return new Interval({ invalid });
    }
  }

  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(start, end) {
    const builtStart = Object(_datetime_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDateTime"])(start),
      builtEnd = Object(_datetime_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDateTime"])(end);

    const validateError = validateStartEnd(builtStart, builtEnd);

    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd,
      });
    } else {
      return validateError;
    }
  }

  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static after(start, duration) {
    const dur = Object(_duration_js__WEBPACK_IMPORTED_MODULE_1__["friendlyDuration"])(duration),
      dt = Object(_datetime_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDateTime"])(start);
    return Interval.fromDateTimes(dt, dt.plus(dur));
  }

  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static before(end, duration) {
    const dur = Object(_duration_js__WEBPACK_IMPORTED_MODULE_1__["friendlyDuration"])(duration),
      dt = Object(_datetime_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDateTime"])(end);
    return Interval.fromDateTimes(dt.minus(dur), dt);
  }

  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime.fromISO} and optionally {@link Duration.fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(text, opts) {
    const [s, e] = (text || "").split("/", 2);
    if (s && e) {
      let start, startIsValid;
      try {
        start = _datetime_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromISO(s, opts);
        startIsValid = start.isValid;
      } catch (e) {
        startIsValid = false;
      }

      let end, endIsValid;
      try {
        end = _datetime_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e) {
        endIsValid = false;
      }

      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }

      if (startIsValid) {
        const dur = _duration_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromISO(e, opts);
        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        const dur = _duration_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromISO(s, opts);
        if (dur.isValid) {
          return Interval.before(end, dur);
        }
      }
    }
    return Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
  }

  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isInterval(o) {
    return (o && o.isLuxonInterval) || false;
  }

  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.isValid ? this.s : null;
  }

  /**
   * Returns the end of the Interval
   * @type {DateTime}
   */
  get end() {
    return this.isValid ? this.e : null;
  }

  /**
   * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
   * @type {boolean}
   */
  get isValid() {
    return this.invalidReason === null;
  }

  /**
   * Returns an error code if this Interval is invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }

  /**
   * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }

  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(unit = "milliseconds") {
    return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
  }

  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @return {number}
   */
  count(unit = "milliseconds") {
    if (!this.isValid) return NaN;
    const start = this.start.startOf(unit),
      end = this.end.startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }

  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }

  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }

  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(dateTime) {
    if (!this.isValid) return false;
    return this.s > dateTime;
  }

  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(dateTime) {
    if (!this.isValid) return false;
    return this.e <= dateTime;
  }

  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(dateTime) {
    if (!this.isValid) return false;
    return this.s <= dateTime && this.e > dateTime;
  }

  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({ start, end } = {}) {
    if (!this.isValid) return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }

  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...DateTime} dateTimes - the unit of time to count.
   * @return {Array}
   */
  splitAt(...dateTimes) {
    if (!this.isValid) return [];
    const sorted = dateTimes
        .map(_datetime_js__WEBPACK_IMPORTED_MODULE_0__["friendlyDateTime"])
        .filter((d) => this.contains(d))
        .sort(),
      results = [];
    let { s } = this,
      i = 0;

    while (s < this.e) {
      const added = sorted[i] || this.e,
        next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      i += 1;
    }

    return results;
  }

  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {Array}
   */
  splitBy(duration) {
    const dur = Object(_duration_js__WEBPACK_IMPORTED_MODULE_1__["friendlyDuration"])(duration);

    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }

    let { s } = this,
      idx = 1,
      next;

    const results = [];
    while (s < this.e) {
      const added = this.start.plus(dur.mapUnits((x) => x * idx));
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      idx += 1;
    }

    return results;
  }

  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {Array}
   */
  divideEqually(numberOfParts) {
    if (!this.isValid) return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }

  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }

  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(other) {
    if (!this.isValid) return false;
    return +this.e === +other.s;
  }

  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(other) {
    if (!this.isValid) return false;
    return +other.e === +this.s;
  }

  /**
   * Return whether this Interval engulfs the start and end of the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(other) {
    if (!this.isValid) return false;
    return this.s <= other.s && this.e >= other.e;
  }

  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    return this.s.equals(other.s) && this.e.equals(other.e);
  }

  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  intersection(other) {
    if (!this.isValid) return this;
    const s = this.s > other.s ? this.s : other.s,
      e = this.e < other.e ? this.e : other.e;

    if (s >= e) {
      return null;
    } else {
      return Interval.fromDateTimes(s, e);
    }
  }

  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(other) {
    if (!this.isValid) return this;
    const s = this.s < other.s ? this.s : other.s,
      e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s, e);
  }

  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static merge(intervals) {
    const [found, final] = intervals
      .sort((a, b) => a.s - b.s)
      .reduce(
        ([sofar, current], item) => {
          if (!current) {
            return [sofar, item];
          } else if (current.overlaps(item) || current.abutsStart(item)) {
            return [sofar, current.union(item)];
          } else {
            return [sofar.concat([current]), item];
          }
        },
        [[], null]
      );
    if (final) {
      found.push(final);
    }
    return found;
  }

  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static xor(intervals) {
    let start = null,
      currentCount = 0;
    const results = [],
      ends = intervals.map((i) => [
        { time: i.s, type: "s" },
        { time: i.e, type: "e" },
      ]),
      flattened = Array.prototype.concat(...ends),
      arr = flattened.sort((a, b) => a.time - b.time);

    for (const i of arr) {
      currentCount += i.type === "s" ? 1 : -1;

      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }

  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {Array}
   */
  difference(...intervals) {
    return Interval.xor([this].concat(intervals))
      .map((i) => this.intersection(i))
      .filter((i) => i && !i.isEmpty());
  }

  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    if (!this.isValid) return INVALID;
    return `[${this.s.toISO()} – ${this.e.toISO()})`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(opts) {
    if (!this.isValid) return INVALID;
    return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    if (!this.isValid) return INVALID;
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime.toISO}
   * @return {string}
   */
  toISOTime(opts) {
    if (!this.isValid) return INVALID;
    return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
  }

  /**
   * Returns a string representation of this Interval formatted according to the specified format string.
   * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime.toFormat} for details.
   * @param {Object} opts - options
   * @param {string} [opts.separator =  ' – '] - a separator to place between the start and end representations
   * @return {string}
   */
  toFormat(dateFormat, { separator = " – " } = {}) {
    if (!this.isValid) return INVALID;
    return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
  }

  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(unit, opts) {
    if (!this.isValid) {
      return _duration_js__WEBPACK_IMPORTED_MODULE_1__["default"].invalid(this.invalidReason);
    }
    return this.e.diff(this.s, unit, opts);
  }

  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/luxon.js":
/*!******************************************!*\
  !*** ../node_modules/luxon/src/luxon.js ***!
  \******************************************/
/*! exports provided: VERSION, DateTime, Duration, Interval, Info, Zone, FixedOffsetZone, IANAZone, InvalidZone, SystemZone, Settings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return VERSION; });
/* harmony import */ var _datetime_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datetime.js */ "../node_modules/luxon/src/datetime.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DateTime", function() { return _datetime_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _duration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./duration.js */ "../node_modules/luxon/src/duration.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Duration", function() { return _duration_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _interval_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interval.js */ "../node_modules/luxon/src/interval.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Interval", function() { return _interval_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _info_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./info.js */ "../node_modules/luxon/src/info.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Info", function() { return _info_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./zone.js */ "../node_modules/luxon/src/zone.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Zone", function() { return _zone_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./zones/fixedOffsetZone.js */ "../node_modules/luxon/src/zones/fixedOffsetZone.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FixedOffsetZone", function() { return _zones_fixedOffsetZone_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "IANAZone", function() { return _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _zones_invalidZone_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./zones/invalidZone.js */ "../node_modules/luxon/src/zones/invalidZone.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvalidZone", function() { return _zones_invalidZone_js__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _zones_systemZone_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./zones/systemZone.js */ "../node_modules/luxon/src/zones/systemZone.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SystemZone", function() { return _zones_systemZone_js__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _settings_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./settings.js */ "../node_modules/luxon/src/settings.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Settings", function() { return _settings_js__WEBPACK_IMPORTED_MODULE_9__["default"]; });












const VERSION = "2.0.2";




/***/ }),

/***/ "../node_modules/luxon/src/settings.js":
/*!*********************************************!*\
  !*** ../node_modules/luxon/src/settings.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Settings; });
/* harmony import */ var _zones_systemZone_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./zones/systemZone.js */ "../node_modules/luxon/src/zones/systemZone.js");
/* harmony import */ var _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./zones/IANAZone.js */ "../node_modules/luxon/src/zones/IANAZone.js");
/* harmony import */ var _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./impl/locale.js */ "../node_modules/luxon/src/impl/locale.js");
/* harmony import */ var _impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./impl/zoneUtil.js */ "../node_modules/luxon/src/impl/zoneUtil.js");






let now = () => Date.now(),
  defaultZone = "system",
  defaultLocale = null,
  defaultNumberingSystem = null,
  defaultOutputCalendar = null,
  throwOnInvalid;

/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */
class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }

  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n) {
    now = n;
  }

  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(zone) {
    defaultZone = zone;
  }

  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return Object(_impl_zoneUtil_js__WEBPACK_IMPORTED_MODULE_3__["normalizeZone"])(defaultZone, _zones_systemZone_js__WEBPACK_IMPORTED_MODULE_0__["default"].instance);
  }

  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return defaultLocale;
  }

  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale) {
    defaultLocale = locale;
  }

  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }

  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }

  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }

  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }

  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static get throwOnInvalid() {
    return throwOnInvalid;
  }

  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(t) {
    throwOnInvalid = t;
  }

  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    _impl_locale_js__WEBPACK_IMPORTED_MODULE_2__["default"].resetCache();
    _zones_IANAZone_js__WEBPACK_IMPORTED_MODULE_1__["default"].resetCache();
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/zone.js":
/*!*****************************************!*\
  !*** ../node_modules/luxon/src/zone.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Zone; });
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./errors.js */ "../node_modules/luxon/src/errors.js");


/**
 * @interface
 */
class Zone {
  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, opts) {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }

  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid() {
    throw new _errors_js__WEBPACK_IMPORTED_MODULE_0__["ZoneIsAbstractError"]();
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/zones/IANAZone.js":
/*!***************************************************!*\
  !*** ../node_modules/luxon/src/zones/IANAZone.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return IANAZone; });
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../impl/util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../zone.js */ "../node_modules/luxon/src/zone.js");



const matchingRegex = RegExp(`^${_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["ianaRegex"].source}$`);

let dtfCache = {};
function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hourCycle: "h23",
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return dtfCache[zone];
}

const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5,
};

function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
    parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date),
    filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i],
      pos = typeToPos[type];

    if (!Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

let ianaZoneCache = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
class IANAZone extends _zone_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }

  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }

  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidSpecifier(s) {
    return !!(s && s.match(matchingRegex));
  }

  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Etc/GMT+8 -> -480
  /** @ignore */
  static parseGMTOffset(specifier) {
    if (specifier) {
      const match = specifier.match(/^Etc\/GMT(0|[+-]\d{1,2})$/i);
      if (match) {
        return -60 * parseInt(match[1]);
      }
    }
    return null;
  }

  constructor(name) {
    super();
    /** @private **/
    this.zoneName = name;
    /** @private **/
    this.valid = IANAZone.isValidZone(name);
  }

  /** @override **/
  get type() {
    return "iana";
  }

  /** @override **/
  get name() {
    return this.zoneName;
  }

  /** @override **/
  get isUniversal() {
    return false;
  }

  /** @override **/
  offsetName(ts, { format, locale }) {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["parseZoneInfo"])(ts, format, locale, this.name);
  }

  /** @override **/
  formatOffset(ts, format) {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["formatOffset"])(this.offset(ts), format);
  }

  /** @override **/
  offset(ts) {
    const date = new Date(ts);

    if (isNaN(date)) return NaN;

    const dtf = makeDTF(this.name),
      [year, month, day, hour, minute, second] = dtf.formatToParts
        ? partsOffset(dtf, date)
        : hackyOffset(dtf, date);

    const asUTC = Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["objToLocalTS"])({
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond: 0,
    });

    let asTS = +date;
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }

  /** @override **/
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }

  /** @override **/
  get isValid() {
    return this.valid;
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/zones/fixedOffsetZone.js":
/*!**********************************************************!*\
  !*** ../node_modules/luxon/src/zones/fixedOffsetZone.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return FixedOffsetZone; });
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../impl/util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../zone.js */ "../node_modules/luxon/src/zone.js");



let singleton = null;

/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */
class FixedOffsetZone extends _zone_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }

  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(s) {
    if (s) {
      const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new FixedOffsetZone(Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["signedOffset"])(r[1], r[2]));
      }
    }
    return null;
  }

  constructor(offset) {
    super();
    /** @private **/
    this.fixed = offset;
  }

  /** @override **/
  get type() {
    return "fixed";
  }

  /** @override **/
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["formatOffset"])(this.fixed, "narrow")}`;
  }

  /** @override **/
  offsetName() {
    return this.name;
  }

  /** @override **/
  formatOffset(ts, format) {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["formatOffset"])(this.fixed, format);
  }

  /** @override **/
  get isUniversal() {
    return true;
  }

  /** @override **/
  offset() {
    return this.fixed;
  }

  /** @override **/
  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }

  /** @override **/
  get isValid() {
    return true;
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/zones/invalidZone.js":
/*!******************************************************!*\
  !*** ../node_modules/luxon/src/zones/invalidZone.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return InvalidZone; });
/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../zone.js */ "../node_modules/luxon/src/zone.js");


/**
 * A zone that failed to parse. You should never need to instantiate this.
 * @implements {Zone}
 */
class InvalidZone extends _zone_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(zoneName) {
    super();
    /**  @private */
    this.zoneName = zoneName;
  }

  /** @override **/
  get type() {
    return "invalid";
  }

  /** @override **/
  get name() {
    return this.zoneName;
  }

  /** @override **/
  get isUniversal() {
    return false;
  }

  /** @override **/
  offsetName() {
    return null;
  }

  /** @override **/
  formatOffset() {
    return "";
  }

  /** @override **/
  offset() {
    return NaN;
  }

  /** @override **/
  equals() {
    return false;
  }

  /** @override **/
  get isValid() {
    return false;
  }
}


/***/ }),

/***/ "../node_modules/luxon/src/zones/systemZone.js":
/*!*****************************************************!*\
  !*** ../node_modules/luxon/src/zones/systemZone.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SystemZone; });
/* harmony import */ var _impl_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../impl/util.js */ "../node_modules/luxon/src/impl/util.js");
/* harmony import */ var _zone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../zone.js */ "../node_modules/luxon/src/zone.js");



let singleton = null;

/**
 * Represents the local zone for this JavaScript environment.
 * @implements {Zone}
 */
class SystemZone extends _zone_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance() {
    if (singleton === null) {
      singleton = new SystemZone();
    }
    return singleton;
  }

  /** @override **/
  get type() {
    return "system";
  }

  /** @override **/
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /** @override **/
  get isUniversal() {
    return false;
  }

  /** @override **/
  offsetName(ts, { format, locale }) {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["parseZoneInfo"])(ts, format, locale);
  }

  /** @override **/
  formatOffset(ts, format) {
    return Object(_impl_util_js__WEBPACK_IMPORTED_MODULE_0__["formatOffset"])(this.offset(ts), format);
  }

  /** @override **/
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }

  /** @override **/
  equals(otherZone) {
    return otherZone.type === "system";
  }

  /** @override **/
  get isValid() {
    return true;
  }
}


/***/ })

};;
//# sourceMappingURL=59.render-page.js.map
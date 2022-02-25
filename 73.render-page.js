exports.ids = [73];
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

/***/ "../node_modules/@arcgis/core/geometry/HeightModelInfo.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/HeightModelInfo.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return v; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/arrayUtils.js */ "../node_modules/@arcgis/core/core/arrayUtils.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;const p=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["strict"])()({orthometric:"gravity-related-height",gravity_related_height:"gravity-related-height",ellipsoidal:"ellipsoidal"}),u=p.jsonValues.slice();Object(_core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeUnordered"])(u,"orthometric");const g=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["strict"])()({meter:"meters",foot:"feet","us-foot":"us-feet","clarke-foot":"clarke-feet","clarke-yard":"clarke-yards","clarke-link":"clarke-links","sears-yard":"sears-yards","sears-foot":"sears-feet","sears-chain":"sears-chains","benoit-1895-b-chain":"benoit-1895-b-chains","indian-yard":"indian-yards","indian-1937-yard":"indian-1937-yards","gold-coast-foot":"gold-coast-feet","sears-1922-truncated-chain":"sears-1922-truncated-chains","50-kilometers":"50-kilometers","150-kilometers":"150-kilometers"});let m=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(e){super(e),this.heightModel="gravity-related-height",this.heightUnit="meters",this.vertCRS=null}writeHeightModel(e,t,r){return p.write(e,t,r)}readHeightModel(e,t,r){const o=p.read(e);return o||(r&&r.messages&&r.messages.push(f(e,{context:r})),null)}readHeightUnit(e,t,r){const o=g.read(e);return o||(r&&r.messages&&r.messages.push(y(e,{context:r})),null)}readHeightUnitService(e,t,r){const o=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__["unitFromRESTJSON"])(e)||g.read(e);return o||(r&&r.messages&&r.messages.push(y(e,{context:r})),null)}readVertCRS(e,t){return t.vertCRS||t.ellipsoid||t.geoid}clone(){return new d({heightModel:this.heightModel,heightUnit:this.heightUnit,vertCRS:this.vertCRS})}equals(e){return!!e&&(this===e||this.heightModel===e.heightModel&&this.heightUnit===e.heightUnit&&this.vertCRS===e.vertCRS)}static deriveUnitFromSR(e,t){const r=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__["getVerticalUnitStringForSR"])(t);return new d({heightModel:e.heightModel,heightUnit:r,vertCRS:e.vertCRS})}write(e,t){return t={origin:"web-scene",...t},super.write(e,t)}static fromJSON(e){if(!e)return null;const t=new d;return t.read(e,{origin:"web-scene"}),t}};function y(e,t){return new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("height-unit:unsupported",`Height unit of value '${e}' is not supported`,t)}function f(e,t){return new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("height-model:unsupported",`Height model of value '${e}' is not supported`,t)}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:p.apiValues,constructOnly:!0,json:{origins:{"web-scene":{type:u,default:"ellipsoidal"}}}})],m.prototype,"heightModel",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("web-scene","heightModel")],m.prototype,"writeHeightModel",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])(["web-scene","service"],"heightModel")],m.prototype,"readHeightModel",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:g.apiValues,constructOnly:!0,json:{origins:{"web-scene":{type:g.jsonValues,write:g.write}}}})],m.prototype,"heightUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("web-scene","heightUnit")],m.prototype,"readHeightUnit",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("service","heightUnit")],m.prototype,"readHeightUnitService",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,constructOnly:!0,json:{origins:{"web-scene":{write:!0}}}})],m.prototype,"vertCRS",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("service","vertCRS",["vertCRS","ellipsoid","geoid"])],m.prototype,"readVertCRS",null),m=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__["subclass"])("esri.geometry.HeightModelInfo")],m);var v=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/PointCloudLayer.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/PointCloudLayer.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../PopupTemplate.js */ "../node_modules/@arcgis/core/PopupTemplate.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/MultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./Layer.js */ "../node_modules/@arcgis/core/layers/Layer.js");
/* harmony import */ var _mixins_APIKeyMixin_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./mixins/APIKeyMixin.js */ "../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js");
/* harmony import */ var _mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./mixins/ArcGISService.js */ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js");
/* harmony import */ var _mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./mixins/OperationalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js");
/* harmony import */ var _mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./mixins/PortalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js");
/* harmony import */ var _mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./mixins/ScaleRangeLayer.js */ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js");
/* harmony import */ var _mixins_SceneService_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./mixins/SceneService.js */ "../node_modules/@arcgis/core/layers/mixins/SceneService.js");
/* harmony import */ var _pointCloudFilters_typeUtils_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./pointCloudFilters/typeUtils.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/typeUtils.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _support_Field_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./support/Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/* harmony import */ var _support_fieldProperties_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./support/fieldProperties.js */ "../node_modules/@arcgis/core/layers/support/fieldProperties.js");
/* harmony import */ var _popup_ExpressionInfo_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../popup/ExpressionInfo.js */ "../node_modules/@arcgis/core/popup/ExpressionInfo.js");
/* harmony import */ var _renderers_support_pointCloud_typeUtils_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../renderers/support/pointCloud/typeUtils.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/typeUtils.js");
/* harmony import */ var _support_popupUtils_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../support/popupUtils.js */ "../node_modules/@arcgis/core/support/popupUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const N=_core_Logger_js__WEBPACK_IMPORTED_MODULE_5__["default"].getLogger("esri.layers.PointCloudLayer"),R=Object(_support_fieldProperties_js__WEBPACK_IMPORTED_MODULE_27__["defineFieldProperties"])();let O=class extends(Object(_mixins_SceneService_js__WEBPACK_IMPORTED_MODULE_23__["SceneService"])(Object(_mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_19__["ArcGISService"])(Object(_mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_20__["OperationalLayer"])(Object(_mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_21__["PortalLayer"])(Object(_mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_22__["ScaleRangeLayer"])(Object(_core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_7__["MultiOriginJSONMixin"])(Object(_mixins_APIKeyMixin_js__WEBPACK_IMPORTED_MODULE_18__["APIKeyMixin"])(_Layer_js__WEBPACK_IMPORTED_MODULE_17__["default"])))))))){constructor(...e){super(...e),this.operationalLayerType="PointCloudLayer",this.popupEnabled=!0,this.popupTemplate=null,this.opacity=1,this.filters=[],this.fields=null,this.fieldsIndex=null,this.outFields=null,this.path=null,this.legendEnabled=!0,this.renderer=null,this.type="point-cloud"}normalizeCtorArgs(e,r){return"string"==typeof e?{url:e,...r}:e}get defaultPopupTemplate(){return this.attributeStorageInfo?this.createPopupTemplate():null}getFieldDomain(e){const r=this.fieldsIndex.get(e);return r&&r.domain?r.domain:null}readServiceFields(e,r,t){return Array.isArray(e)?e.map((e=>{const r=new _support_Field_js__WEBPACK_IMPORTED_MODULE_26__["default"];return"FieldTypeInteger"===e.type&&((e=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(e)).type="esriFieldTypeInteger"),r.read(e,t),r})):Array.isArray(r.attributeStorageInfo)?r.attributeStorageInfo.map((e=>new _support_Field_js__WEBPACK_IMPORTED_MODULE_26__["default"]({name:e.name,type:"ELEVATION"===e.name?"double":"integer"}))):null}set elevationInfo(e){this._set("elevationInfo",e),this._validateElevationInfo()}writeRenderer(e,r,t,o){Object(_core_object_js__WEBPACK_IMPORTED_MODULE_8__["setDeepValue"])("layerDefinition.drawingInfo.renderer",e.write(null,o),r)}load(e){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_6__["isSome"])(e)?e.signal:null,t=this.loadFromPortal({supportedTypes:["Scene Service"]},e).catch(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_9__["throwIfAbortError"]).then((()=>this._fetchService(r)));return this.addResolvingPromise(t),Promise.resolve(this)}createPopupTemplate(e){const r=Object(_support_popupUtils_js__WEBPACK_IMPORTED_MODULE_30__["createPopupTemplate"])(this,e);return this.formatPopupTemplateReturnsField(r),this.formatPopupTemplateRGBField(r),r}formatPopupTemplateReturnsField(e){const r=this.fieldsIndex.get("RETURNS");if(!r)return;const t=e.fieldInfos.find((e=>e.fieldName===r.name));if(!t)return;const o=new _popup_ExpressionInfo_js__WEBPACK_IMPORTED_MODULE_28__["default"]({name:"pcl-returns-decoded",title:r.alias||r.name,expression:`\n        var returnValue = $feature.${r.name};\n        return (returnValue % 16) + " / " + Floor(returnValue / 16);\n      `});e.expressionInfos=[...e.expressionInfos||[],o],t.fieldName="expression/pcl-returns-decoded"}formatPopupTemplateRGBField(e){const r=this.fieldsIndex.get("RGB");if(!r)return;const t=e.fieldInfos.find((e=>e.fieldName===r.name));if(!t)return;const o=new _popup_ExpressionInfo_js__WEBPACK_IMPORTED_MODULE_28__["default"]({name:"pcl-rgb-decoded",title:r.alias||r.name,expression:`\n        var rgb = $feature.${r.name};\n        var red = Floor(rgb / 65536, 0);\n        var green = Floor((rgb - (red * 65536)) / 256,0);\n        var blue = rgb - (red * 65536) - (green * 256);\n\n        return "rgb(" + red + "," + green + "," + blue + ")";\n      `});e.expressionInfos=[...e.expressionInfos||[],o],t.fieldName="expression/pcl-rgb-decoded"}async queryCachedStatistics(e,r){if(await this.load(r),!this.attributeStorageInfo)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("scenelayer:no-cached-statistics","Cached statistics are not available for this layer");const i=this.fieldsIndex.get(e);if(!i)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("pointcloudlayer:field-unexisting",`Field '${e}' does not exist on the layer`);for(const o of this.attributeStorageInfo)if(o.name===i.name){const e=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__["join"])(this.parsedUrl.path,`./statistics/${o.key}`);return Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(e,{query:{f:"json",token:this.apiKey},responseType:"json",signal:r?r.signal:null}).then((e=>e.data))}throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("pointcloudlayer:no-cached-statistics","Cached statistics for this attribute are not available")}async saveAs(e,r){return this._debouncedSaveOperations(1,{...r,getTypeKeywords:()=>this._getTypeKeywords(),portalItemLayerType:"point-cloud"},e)}async save(){const e={getTypeKeywords:()=>this._getTypeKeywords(),portalItemLayerType:"point-cloud"};return this._debouncedSaveOperations(0,e)}validateLayer(e){if(e.layerType&&"PointCloud"!==e.layerType)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("pointcloudlayer:layer-type-not-supported","PointCloudLayer does not support this layer type",{layerType:e.layerType});if(isNaN(this.version.major)||isNaN(this.version.minor))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("layer:service-version-not-supported","Service version is not supported.",{serviceVersion:this.version.versionString,supportedVersions:"1.x-2.x"});if(this.version.major>2)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("layer:service-version-too-new","Service version is too new.",{serviceVersion:this.version.versionString,supportedVersions:"1.x-2.x"})}hasCachedStatistics(e){return null!=this.attributeStorageInfo&&this.attributeStorageInfo.some((r=>r.name===e))}_getTypeKeywords(){return["PointCloud"]}_validateElevationInfo(){const e=this.elevationInfo;e&&("absolute-height"!==e.mode&&N.warn(".elevationInfo=","Point cloud layers only support absolute-height elevation mode"),e.featureExpressionInfo&&"0"!==e.featureExpressionInfo.expression&&N.warn(".elevationInfo=","Point cloud layers do not support featureExpressionInfo"))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:["PointCloudLayer"]})],O.prototype,"operationalLayerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_25__["popupEnabled"])],O.prototype,"popupEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:_PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{name:"popupInfo",write:!0}})],O.prototype,"popupTemplate",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{read:!1}})],O.prototype,"defaultPopupTemplate",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,json:{write:!1,read:!1,origins:{"web-document":{write:!1,read:!1}}}})],O.prototype,"opacity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:["show","hide"]})],O.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({types:[_pointCloudFilters_typeUtils_js__WEBPACK_IMPORTED_MODULE_24__["types"]],json:{origins:{service:{read:{source:"filters"}}},name:"layerDefinition.filters",write:!0}})],O.prototype,"filters",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:[_support_Field_js__WEBPACK_IMPORTED_MODULE_26__["default"]]})],O.prototype,"fields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(R.fieldsIndex)],O.prototype,"fieldsIndex",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__["reader"])("service","fields",["fields","attributeStorageInfo"])],O.prototype,"readServiceFields",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(R.outFields)],O.prototype,"outFields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],O.prototype,"attributeStorageInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_25__["elevationInfo"])],O.prototype,"elevationInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:String,json:{origins:{"web-scene":{read:!0,write:!0},"portal-item":{read:!0,write:!0}},read:!1}})],O.prototype,"path",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_25__["legendEnabled"])],O.prototype,"legendEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({types:_renderers_support_pointCloud_typeUtils_js__WEBPACK_IMPORTED_MODULE_29__["types"],json:{origins:{service:{read:{source:"drawingInfo.renderer"}}},name:"layerDefinition.drawingInfo.renderer",write:{target:{"layerDefinition.drawingInfo.renderer":{types:_renderers_support_pointCloud_typeUtils_js__WEBPACK_IMPORTED_MODULE_29__["types"]},"layerDefinition.drawingInfo.transparency":{type:Number}}}}})],O.prototype,"renderer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_16__["writer"])("renderer")],O.prototype,"writeRenderer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({json:{read:!1},readOnly:!0})],O.prototype,"type",void 0),O=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__["subclass"])("esri.layers.PointCloudLayer")],O);var _=O;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/PortalLayer.js ***!
  \*****************************************************************/
/*! exports provided: PortalLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PortalLayer", function() { return w; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../kernel.js */ "../node_modules/@arcgis/core/kernel.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../portal/PortalItem.js */ "../node_modules/@arcgis/core/portal/PortalItem.js");
/* harmony import */ var _portal_PortalUser_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../portal/PortalUser.js */ "../node_modules/@arcgis/core/portal/PortalUser.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const j=_core_Logger_js__WEBPACK_IMPORTED_MODULE_5__["default"].getLogger("esri.layers.mixins.PortalLayer"),w=i=>{let w=class extends i{constructor(){super(...arguments),this.resourceReferences={portalItem:null,paths:[]},this.userHasEditingPrivileges=!0}destroy(){var t;null==(t=this.portalItem)||t.destroy(),this.portalItem=null}set portalItem(t){t!==this._get("portalItem")&&(this.removeOrigin("portal-item"),this._set("portalItem",t))}readPortalItem(t,e,r){if(e.itemId)return new _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__["default"]({id:e.itemId,portal:r&&r.portal})}writePortalItem(t,e){t&&t.id&&(e.itemId=t.id)}async loadFromPortal(t,e){if(this.portalItem&&this.portalItem.id)try{const r=await __webpack_require__.e(/*! import() */ 104).then(__webpack_require__.bind(null, /*! ../../portal/support/layersLoader.js */ "../node_modules/@arcgis/core/portal/support/layersLoader.js"));return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["throwIfAborted"])(e),await r.load({instance:this,supportedTypes:t.supportedTypes,validateItem:t.validateItem,supportsData:t.supportsData},e)}catch(r){throw Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["isAbortError"])(r)||j.warn(`Failed to load layer (${this.title}, ${this.id}) portal item (${this.portalItem.id})\n  ${r}`),r}}async finishLoadEditablePortalLayer(t){this._set("userHasEditingPrivileges",await this.fetchUserHasEditingPrivileges(t).catch((t=>(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["throwIfAbortError"])(t),!0))))}async fetchUserHasEditingPrivileges(t){const r=this.url?null==_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"]?void 0:_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"].findCredential(this.url):null;if(!r)return!0;const s=P.credential===r?P.user:await this.fetchEditingUser(t);return P.credential=r,P.user=s,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_6__["isNone"])(s)||null==s.privileges||s.privileges.includes("features:user:edit")}async fetchEditingUser(t){var o,i;const a=null==(o=this.portalItem)||null==(i=o.portal)?void 0:i.user;if(a)return a;const n=_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"].findServerInfo(this.url);if(null==n||!n.owningSystemUrl)return null;const p=`${n.owningSystemUrl}/sharing/rest`,m=_portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__["default"].getDefault();if(m&&m.loaded&&Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["normalize"])(m.restUrl)===Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["normalize"])(p))return m.user;const c=`${p}/community/self`,d=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_6__["isSome"])(t)?t.signal:null,h=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_3__["result"])(Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(c,{authMode:"no-prompt",query:{f:"json"},signal:d}));return h.ok?_portal_PortalUser_js__WEBPACK_IMPORTED_MODULE_17__["default"].fromJSON(h.value.data):null}read(t,e){e&&(e.layer=this),super.read(t,e)}write(t,e){const r=e&&e.portal,s=this.portalItem&&this.portalItem.id&&(this.portalItem.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__["default"].getDefault());return r&&s&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["hasSamePortal"])(s.restUrl,r.restUrl)?(e.messages&&e.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_4__["default"]("layer:cross-portal",`The layer '${this.title} (${this.id})' cannot be persisted because it refers to an item on a different portal than the one being saved to. To save the scene, set the layer.portalItem to null or save the scene to the same portal as the item associated with the layer`,{layer:this})),null):super.write(t,{...e,layer:this})}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__["default"]})],w.prototype,"portalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_12__["reader"])("web-document","portalItem",["itemId"])],w.prototype,"readPortalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__["writer"])("web-document","portalItem",{itemId:{type:String}})],w.prototype,"writePortalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])()],w.prototype,"resourceReferences",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({readOnly:!0})],w.prototype,"userHasEditingPrivileges",void 0),w=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__["subclass"])("esri.layers.mixins.PortalLayer")],w),w},P={credential:null,user:null};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js ***!
  \*********************************************************************/
/*! exports provided: ScaleRangeLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScaleRangeLayer", function() { return s; });
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
const s=s=>{let t=class extends s{constructor(){super(...arguments),this.minScale=0,this.maxScale=0}get scaleRangeId(){return`${this.minScale},${this.maxScale}`}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],t.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],t.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({readOnly:!0})],t.prototype,"scaleRangeId",null),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.ScaleRangeLayer")],t),t};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudBitfieldFilter.js":
/*!*****************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudBitfieldFilter.js ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let p=d=class extends _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.requiredClearBits=null,this.requiredSetBits=null,this.type="bitfield"}clone(){return new d({field:this.field,requiredClearBits:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.requiredClearBits),requiredSetBits:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.requiredSetBits)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__["Integer"]],json:{write:{enabled:!0,overridePolicy(){return{enabled:!0,isRequired:!this.requiredSetBits}}}}})],p.prototype,"requiredClearBits",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__["Integer"]],json:{write:{enabled:!0,overridePolicy(){return{enabled:!0,isRequired:!this.requiredClearBits}}}}})],p.prototype,"requiredSetBits",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudBitfieldFilter:"bitfield"})],p.prototype,"type",void 0),p=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.pointCloudFilters.PointCloudBitfieldFilter")],p);var u=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.field=null,this.type=null}clone(){return console.warn(".clone() is not implemented for "+this.declaredClass),null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:{enabled:!0,isRequired:!0}}})],t.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0,nonNullable:!0,json:{read:!1}})],t.prototype,"type",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.pointCloudFilters.PointCloudFilter")],t);var l=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudReturnFilter.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudReturnFilter.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let p=n=class extends _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(r){super(r),this.includedReturns=[],this.type="return"}clone(){return new n({field:this.field,includedReturns:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.includedReturns)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[["firstOfMany","last","lastOfMany","single"]],json:{write:{enabled:!0,isRequired:!0}}})],p.prototype,"includedReturns",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudReturnFilter:"return"})],p.prototype,"type",void 0),p=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.pointCloudFilters.PointCloudReturnFilter")],p);var u=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudValueFilter.js":
/*!**************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudValueFilter.js ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let l=p=class extends _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.mode="exclude",this.type="value",this.values=[]}clone(){return new p({field:this.field,mode:this.mode,values:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.values)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["exclude","include"],json:{write:{enabled:!0,isRequired:!0}}})],l.prototype,"mode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudValueFilter:"value"})],l.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[Number],json:{write:{enabled:!0,isRequired:!0}}})],l.prototype,"values",void 0),l=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.pointCloudFilters.PointCloudValueFilter")],l);var u=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/pointCloudFilters/typeUtils.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/pointCloudFilters/typeUtils.js ***!
  \**************************************************************************/
/*! exports provided: types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return e; });
/* harmony import */ var _PointCloudBitfieldFilter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PointCloudBitfieldFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudBitfieldFilter.js");
/* harmony import */ var _PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PointCloudFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudFilter.js");
/* harmony import */ var _PointCloudReturnFilter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PointCloudReturnFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudReturnFilter.js");
/* harmony import */ var _PointCloudValueFilter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PointCloudValueFilter.js */ "../node_modules/@arcgis/core/layers/pointCloudFilters/PointCloudValueFilter.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={key:"type",base:_PointCloudFilter_js__WEBPACK_IMPORTED_MODULE_1__["default"],typeMap:{value:_PointCloudValueFilter_js__WEBPACK_IMPORTED_MODULE_3__["default"],bitfield:_PointCloudBitfieldFilter_js__WEBPACK_IMPORTED_MODULE_0__["default"],return:_PointCloudReturnFilter_js__WEBPACK_IMPORTED_MODULE_2__["default"]}};


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

/***/ "../node_modules/@arcgis/core/layers/support/fieldProperties.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/fieldProperties.js ***!
  \**********************************************************************/
/*! exports provided: defineFieldProperties */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defineFieldProperties", function() { return l; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _Field_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/* harmony import */ var _FieldsIndex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _fieldUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.layers.support.fieldProperties");function l(){return{fields:{type:[_Field_js__WEBPACK_IMPORTED_MODULE_1__["default"]],value:null},fieldsIndex:{readOnly:!0,get(){return new _FieldsIndex_js__WEBPACK_IMPORTED_MODULE_2__["default"](this.fields||[])}},outFields:{type:[String],json:{read:!1},set:function(e){this._userOutFields=e,this.notifyChange("outFields")},get:function(){const e=this._userOutFields;if(!e||!e.length)return null;if(e.includes("*"))return["*"];if(!this.fields)return e;for(const i of e){this.fieldsIndex.has(i)||s.error("field-attributes-layer:invalid-field",`Invalid field ${i} found in outFields`,{layer:this,outFields:e})}return Object(_fieldUtils_js__WEBPACK_IMPORTED_MODULE_3__["fixFields"])(this.fieldsIndex,e)}}}}


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

/***/ "../node_modules/@arcgis/core/renderers/PointCloudRGBRenderer.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/PointCloudRGBRenderer.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let c=i=class extends _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(r){super(r),this.type="point-cloud-rgb",this.field=null}clone(){return new i({...this.cloneProperties(),field:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.field)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudRGBRenderer:"point-cloud-rgb"})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],c.prototype,"field",void 0),c=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.PointCloudRGBRenderer")],c);var n=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/lengthUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/lengthUtils.js ***!
  \*********************************************************************/
/*! exports provided: meterIn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "meterIn", function() { return m; });
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _geometry_support_Ellipsoid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/support/Ellipsoid.js */ "../node_modules/@arcgis/core/geometry/support/Ellipsoid.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m={inches:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","inches"),feet:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","feet"),"us-feet":Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","us-feet"),yards:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","yards"),miles:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","miles"),"nautical-miles":Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","nautical-miles"),millimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","millimeters"),centimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","centimeters"),decimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","decimeters"),meters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","meters"),kilometers:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","kilometers"),"decimal-degrees":1/Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["lengthToDegrees"])(1,"meters",_geometry_support_Ellipsoid_js__WEBPACK_IMPORTED_MODULE_1__["earth"].radius)};


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/typeUtils.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/typeUtils.js ***!
  \******************************************************************************/
/*! exports provided: types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return i; });
/* harmony import */ var _PointCloudClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../PointCloudClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudClassBreaksRenderer.js");
/* harmony import */ var _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../PointCloudRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js");
/* harmony import */ var _PointCloudRGBRenderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../PointCloudRGBRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRGBRenderer.js");
/* harmony import */ var _PointCloudStretchRenderer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../PointCloudStretchRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudStretchRenderer.js");
/* harmony import */ var _PointCloudUniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../PointCloudUniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudUniqueValueRenderer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i={key:"type",base:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"],typeMap:{"point-cloud-class-breaks":_PointCloudClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_0__["default"],"point-cloud-rgb":_PointCloudRGBRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"],"point-cloud-stretch":_PointCloudStretchRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"],"point-cloud-unique-value":_PointCloudUniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_4__["default"]},errorContext:"renderer"};


/***/ }),

/***/ "../node_modules/@arcgis/core/support/popupUtils.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/support/popupUtils.js ***!
  \**********************************************************/
/*! exports provided: createFieldInfos, createFieldsContent, createPopupTemplate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFieldInfos", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFieldsContent", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createPopupTemplate", function() { return a; });
/* harmony import */ var _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PopupTemplate.js */ "../node_modules/@arcgis/core/PopupTemplate.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../popup/content/AttachmentsContent.js */ "../node_modules/@arcgis/core/popup/content/AttachmentsContent.js");
/* harmony import */ var _popup_content_Content_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../popup/content/Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/* harmony import */ var _popup_content_CustomContent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../popup/content/CustomContent.js */ "../node_modules/@arcgis/core/popup/content/CustomContent.js");
/* harmony import */ var _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../popup/content/FieldsContent.js */ "../node_modules/@arcgis/core/popup/content/FieldsContent.js");
/* harmony import */ var _popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../popup/content/MediaContent.js */ "../node_modules/@arcgis/core/popup/content/MediaContent.js");
/* harmony import */ var _popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../popup/content/TextContent.js */ "../node_modules/@arcgis/core/popup/content/TextContent.js");
/* harmony import */ var _popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../popup/FieldInfo.js */ "../node_modules/@arcgis/core/popup/FieldInfo.js");
/* harmony import */ var _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../popup/support/FieldInfoFormat.js */ "../node_modules/@arcgis/core/popup/support/FieldInfoFormat.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l=["oid","global-id"],s=["oid","global-id","guid"];function a({displayField:t,editFieldsInfo:i,fields:o,objectIdField:n,title:r},l){if(!o)return null;const s=b({editFieldsInfo:i,fields:o,objectIdField:n},l);if(!s.length)return null;const a=j({titleBase:r,fields:o,displayField:t}),d=C();return new _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_0__["default"]({title:a,content:d,fieldInfos:s})}const d=[/^fnode_$/i,/^tnode_$/i,/^lpoly_$/i,/^rpoly_$/i,/^poly_$/i,/^subclass$/i,/^subclass_$/i,/^rings_ok$/i,/^rings_nok$/i,/shape/i,/perimeter/i,/objectid/i,/_i$/i],p=(e,{editFieldsInfo:t,objectIdField:i,visibleFieldNames:o})=>o?o.has(e.name):!f(e.name,t)&&((!i||e.name!==i)&&(!(l.indexOf(e.type)>-1)&&!d.some((t=>t.test(e.name)))));function u(e,t){const i=e;return t&&(e=e.filter((e=>-1===t.indexOf(e.type)))),e===i&&(e=e.slice()),e.sort(c),e}function c(e,t){return"oid"===e.type?-1:"oid"===t.type?1:y(e)?-1:y(t)?1:(e.alias||e.name).toLocaleLowerCase().localeCompare((t.alias||t.name).toLocaleLowerCase())}function f(e,t){if(!e||!t)return!1;const{creationDateField:i,creatorField:o,editDateField:n,editorField:r}=t;return-1!==[i&&i.toLowerCase(),o&&o.toLowerCase(),n&&n.toLowerCase(),r&&r.toLowerCase()].indexOf(e.toLowerCase())}function m(e,t){return e.editable&&-1===s.indexOf(e.type)&&!f(e.name,t)}function F(e,t){return new _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__["default"]({fieldInfos:b(e,t).filter((e=>e.visible))})}function b({editFieldsInfo:e,fields:t,objectIdField:i},o){return u(t,(null==o?void 0:o.ignoreFieldTypes)||g).map((t=>new _popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]({fieldName:t.name,isEditable:m(t,e),label:t.alias,format:w(t),visible:p(t,{editFieldsInfo:e,objectIdField:i,visibleFieldNames:null==o?void 0:o.visibleFieldNames})})))}function w(e){switch(e.type){case"small-integer":case"integer":case"single":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({digitSeparator:!0,places:0});case"double":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({digitSeparator:!0,places:2});case"date":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({dateFormat:"long-month-day-year"});default:return null}}function C(){return[new _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__["default"],new _popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_2__["default"]]}function j(e){const i=Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["getDisplayFieldName"])(e),{titleBase:o}=e;return i?`${o}: {${i.trim()}}`:o}function y(e){if("name"===(e.name&&e.name.toLowerCase()))return!0;return"name"===(e.alias&&e.alias.toLowerCase())||void 0}const g=["geometry","blob","raster","guid","xml"];


/***/ })

};;
//# sourceMappingURL=73.render-page.js.map
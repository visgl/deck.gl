exports.ids = [83];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/CollectionFlattener.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/CollectionFlattener.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _HandleOwner_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./HandleOwner.js */ "../node_modules/@arcgis/core/core/HandleOwner.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _accessorSupport_trackingUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./accessorSupport/trackingUtils.js */ "../node_modules/@arcgis/core/core/accessorSupport/trackingUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let c=class extends(Object(_HandleOwner_js__WEBPACK_IMPORTED_MODULE_2__["HandleOwnerMixin"])(_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"])){constructor(t){super(t),this.getCollections=null}initialize(){this.handles.add(Object(_accessorSupport_trackingUtils_js__WEBPACK_IMPORTED_MODULE_9__["autorun"])((()=>this.refresh())))}destroy(){this.getCollections=null}refresh(){const t=Object(_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.getCollections)?this.getCollections():null;if(Object(_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(t))return void this.removeAll();let o=0;for(const e of t)Object(_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(e)&&(o=this._processCollection(o,e));this.splice(o,this.length)}_createNewInstance(t){return new _Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"](t)}_processCollection(t,o){if(!o)return t;const e=this.itemFilterFunction?this.itemFilterFunction:t=>!!t;for(const s of o)if(s){if(e(s)){const o=this.indexOf(s,t);o>=0?o!==t&&this.reorder(s,t):this.add(s,t),++t}if(this.getChildrenFunction){const o=this.getChildrenFunction(s);if(Array.isArray(o))for(const e of o)t=this._processCollection(t,e);else t=this._processCollection(t,o)}}return t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],c.prototype,"getCollections",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],c.prototype,"getChildrenFunction",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],c.prototype,"itemFilterFunction",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.core.CollectionFlattener")],c);var p=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/core/loadAll.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/core/loadAll.js ***!
  \****************************************************/
/*! exports provided: default, loadAll, loadAllChildren */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadAll", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadAllChildren", function() { return i; });
/* harmony import */ var _asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _Loadable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Loadable.js */ "../node_modules/@arcgis/core/core/Loadable.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function n(o,a){return await o.load(),i(o,a)}async function i(n,i){const f=[],c=(...o)=>{for(const a of o)Object(_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isNone"])(a)||(Array.isArray(a)?c(...a):_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].isCollection(a)?a.forEach((o=>c(o))):_Loadable_js__WEBPACK_IMPORTED_MODULE_2__["default"].isLoadable(a)&&f.push(a))};i(c);let e=null;if(await Object(_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__["map"])(f,(async o=>{!1!==(await Object(_asyncUtils_js__WEBPACK_IMPORTED_MODULE_0__["result"])(s(o)?o.loadAll():o.load())).ok||e||(e=o)})),e)throw e.loadError;return n}function s(o){return"loadAll"in o&&"function"==typeof o.loadAll}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/BuildingSceneLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/BuildingSceneLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return K; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_CollectionFlattener_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/CollectionFlattener.js */ "../node_modules/@arcgis/core/core/CollectionFlattener.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_loadAll_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/loadAll.js */ "../node_modules/@arcgis/core/core/loadAll.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/MultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./Layer.js */ "../node_modules/@arcgis/core/layers/Layer.js");
/* harmony import */ var _buildingSublayers_BuildingComponentSublayer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./buildingSublayers/BuildingComponentSublayer.js */ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingComponentSublayer.js");
/* harmony import */ var _buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./buildingSublayers/BuildingGroupSublayer.js */ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingGroupSublayer.js");
/* harmony import */ var _mixins_APIKeyMixin_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./mixins/APIKeyMixin.js */ "../node_modules/@arcgis/core/layers/mixins/APIKeyMixin.js");
/* harmony import */ var _mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./mixins/ArcGISService.js */ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js");
/* harmony import */ var _mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./mixins/OperationalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js");
/* harmony import */ var _mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./mixins/PortalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js");
/* harmony import */ var _mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./mixins/ScaleRangeLayer.js */ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js");
/* harmony import */ var _mixins_SceneService_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./mixins/SceneService.js */ "../node_modules/@arcgis/core/layers/mixins/SceneService.js");
/* harmony import */ var _support_BuildingFilter_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./support/BuildingFilter.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilter.js");
/* harmony import */ var _support_BuildingSummaryStatistics_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./support/BuildingSummaryStatistics.js */ "../node_modules/@arcgis/core/layers/support/BuildingSummaryStatistics.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _support_FetchAssociatedFeatureLayer_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./support/FetchAssociatedFeatureLayer.js */ "../node_modules/@arcgis/core/layers/support/FetchAssociatedFeatureLayer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const A=_core_Logger_js__WEBPACK_IMPORTED_MODULE_6__["default"].getLogger("esri.layers.BuildingSceneLayer"),E=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_support_BuildingFilter_js__WEBPACK_IMPORTED_MODULE_26__["default"]),_=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(_buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].sublayersProperty);_.json.origins["web-scene"]={type:[_buildingSublayers_BuildingComponentSublayer_js__WEBPACK_IMPORTED_MODULE_18__["default"]],write:{enabled:!0,overridePolicy:()=>({enabled:!1})}},_.json.origins["portal-item"]={type:[_buildingSublayers_BuildingComponentSublayer_js__WEBPACK_IMPORTED_MODULE_18__["default"]],write:{enabled:!0,overridePolicy:()=>({enabled:!1})}};let P=class extends(Object(_mixins_SceneService_js__WEBPACK_IMPORTED_MODULE_25__["SceneService"])(Object(_mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_21__["ArcGISService"])(Object(_mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_22__["OperationalLayer"])(Object(_mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_23__["PortalLayer"])(Object(_mixins_ScaleRangeLayer_js__WEBPACK_IMPORTED_MODULE_24__["ScaleRangeLayer"])(Object(_core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_8__["MultiOriginJSONMixin"])(Object(_mixins_APIKeyMixin_js__WEBPACK_IMPORTED_MODULE_20__["APIKeyMixin"])(_Layer_js__WEBPACK_IMPORTED_MODULE_17__["default"])))))))){constructor(e){super(e),this.operationalLayerType="BuildingSceneLayer",this.allSublayers=new _core_CollectionFlattener_js__WEBPACK_IMPORTED_MODULE_2__["default"]({getCollections:()=>[this.sublayers],getChildrenFunction:e=>"building-group"===e.type?e.sublayers:null}),this.sublayers=null,this.sublayerOverrides=null,this.filters=new E,this.activeFilterId=null,this.summaryStatistics=null,this.outFields=null,this.type="building-scene"}normalizeCtorArgs(e){return"string"==typeof e?{url:e}:e}destroy(){this.allSublayers.destroy()}readSublayers(e,r,t){const s=_buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].readSublayers(e,r,t);return _buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].forEachSublayer(s,(e=>e.layer=this)),this.sublayerOverrides&&(this.applySublayerOverrides(s,this.sublayerOverrides),this.sublayerOverrides=null),s}applySublayerOverrides(e,{overrides:r,context:t}){_buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].forEachSublayer(e,(e=>e.read(r.get(e.id),t)))}readSublayerOverrides(e,r){const t=new Map;for(const i of e)null!=i&&"object"==typeof i&&"number"==typeof i.id?t.set(i.id,i):r.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("building-scene-layer:invalid-sublayer-override","Invalid value for sublayer override. Not an object or no id specified.",{value:i}));return{overrides:t,context:r}}writeSublayerOverrides(e,r,t){const s=[];_buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].forEachSublayer(this.sublayers,(e=>{const r=e.write({},t);Object.keys(r).length>1&&s.push(r)})),s.length>0&&(r.sublayers=s)}writeUnappliedOverrides(e,r){r.sublayers=[],e.overrides.forEach((e=>{r.sublayers.push(Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(e))}))}write(e,r){return e=super.write(e,r),!r||"web-scene"!==r.origin&&"portal-item"!==r.origin||(this.sublayers?this.writeSublayerOverrides(this.sublayers,e,r):this.sublayerOverrides&&this.writeUnappliedOverrides(this.sublayerOverrides,e)),e}read(e,r){if(super.read(e,r),r&&("web-scene"===r.origin||"portal-item"===r.origin)&&null!=e&&Array.isArray(e.sublayers)){const t=this.readSublayerOverrides(e.sublayers,r);this.sublayers?this.applySublayerOverrides(this.sublayers,t):this.sublayerOverrides=t}}readSummaryStatistics(e,r){if("string"==typeof r.statisticsHRef){const e=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__["join"])(this.parsedUrl.path,r.statisticsHRef);return new _support_BuildingSummaryStatistics_js__WEBPACK_IMPORTED_MODULE_27__["default"]({url:e})}return null}set elevationInfo(e){this._set("elevationInfo",e),this._validateElevationInfo()}load(e){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e)?e.signal:null,t=this.loadFromPortal({supportedTypes:["Scene Service"]},e).catch(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_9__["throwIfAbortError"]).then((()=>this._fetchService(r))).then((()=>this._fetchAssociatedFeatureService(r)));return this.addResolvingPromise(t),Promise.resolve(this)}loadAll(){return Object(_core_loadAll_js__WEBPACK_IMPORTED_MODULE_5__["loadAll"])(this,(e=>{_buildingSublayers_BuildingGroupSublayer_js__WEBPACK_IMPORTED_MODULE_19__["default"].forEachSublayer(this.sublayers,(r=>{"building-group"!==r.type&&e(r)})),this.summaryStatistics&&e(this.summaryStatistics)}))}async saveAs(e,r){return this._debouncedSaveOperations(1,{...r,getTypeKeywords:()=>this._getTypeKeywords(),portalItemLayerType:"building-scene"},e)}async save(){const e={getTypeKeywords:()=>this._getTypeKeywords(),portalItemLayerType:"building-scene"};return this._debouncedSaveOperations(0,e)}validateLayer(e){if(!e.layerType||"Building"!==e.layerType)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("buildingscenelayer:layer-type-not-supported","BuildingSceneLayer does not support this layer type",{layerType:e.layerType})}_getTypeKeywords(){return["Building"]}_validateElevationInfo(){const e=this.elevationInfo;e&&("absolute-height"!==e.mode&&A.warn(".elevationInfo=","Building scene layers only support absolute-height elevation mode"),e.featureExpressionInfo&&"0"!==e.featureExpressionInfo.expression&&A.warn(".elevationInfo=","Building scene layers do not support featureExpressionInfo"))}async _fetchAssociatedFeatureService(e){const r=new _support_FetchAssociatedFeatureLayer_js__WEBPACK_IMPORTED_MODULE_29__["FetchAssociatedFeatureLayer"](this.parsedUrl,this.portalItem,this.apiKey,e);try{this.associatedFeatureServiceItem=await r.fetchPortalItem()}catch(t){A.warn("Associated feature service item could not be loaded",t)}}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:["BuildingSceneLayer"]})],P.prototype,"operationalLayerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0})],P.prototype,"allSublayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_)],P.prototype,"sublayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__["reader"])("service","sublayers")],P.prototype,"readSublayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:E,nonNullable:!0,json:{write:!0}})],P.prototype,"filters",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:String,json:{write:!0}})],P.prototype,"activeFilterId",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({readOnly:!0,type:_support_BuildingSummaryStatistics_js__WEBPACK_IMPORTED_MODULE_27__["default"]})],P.prototype,"summaryStatistics",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__["reader"])("summaryStatistics",["statisticsHRef"])],P.prototype,"readSummaryStatistics",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:[String],json:{read:!1}})],P.prototype,"outFields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_28__["sceneLayerFullExtent"])],P.prototype,"fullExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({type:["show","hide","hide-children"]})],P.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(Object(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_28__["readOnlyService"])(_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_16__["default"]))],P.prototype,"spatialReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_28__["elevationInfo"])],P.prototype,"elevationInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])({json:{read:!1},readOnly:!0})],P.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_11__["property"])()],P.prototype,"associatedFeatureServiceItem",void 0),P=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__["subclass"])("esri.layers.BuildingSceneLayer")],P);var K=P;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingComponentSublayer.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/buildingSublayers/BuildingComponentSublayer.js ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return E; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../PopupTemplate.js */ "../node_modules/@arcgis/core/PopupTemplate.js");
/* harmony import */ var _renderers_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../renderers/ClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js");
/* harmony import */ var _renderers_DictionaryRenderer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../renderers/DictionaryRenderer.js */ "../node_modules/@arcgis/core/renderers/DictionaryRenderer.js");
/* harmony import */ var _renderers_DotDensityRenderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../renderers/DotDensityRenderer.js */ "../node_modules/@arcgis/core/renderers/DotDensityRenderer.js");
/* harmony import */ var _renderers_HeatmapRenderer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../renderers/HeatmapRenderer.js */ "../node_modules/@arcgis/core/renderers/HeatmapRenderer.js");
/* harmony import */ var _renderers_Renderer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../renderers/Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _renderers_SimpleRenderer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../renderers/SimpleRenderer.js */ "../node_modules/@arcgis/core/renderers/SimpleRenderer.js");
/* harmony import */ var _renderers_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../renderers/UniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js");
/* harmony import */ var _renderers_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../renderers/support/jsonUtils.js */ "../node_modules/@arcgis/core/renderers/support/jsonUtils.js");
/* harmony import */ var _renderers_support_types_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../renderers/support/types.js */ "../node_modules/@arcgis/core/renderers/support/types.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_Loadable_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../core/Loadable.js */ "../node_modules/@arcgis/core/core/Loadable.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_Promise_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../core/Promise.js */ "../node_modules/@arcgis/core/core/Promise.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../FeatureLayer.js */ "../node_modules/@arcgis/core/layers/FeatureLayer.js");
/* harmony import */ var _BuildingSublayer_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./BuildingSublayer.js */ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingSublayer.js");
/* harmony import */ var _support_capabilities_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../support/capabilities.js */ "../node_modules/@arcgis/core/layers/support/capabilities.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ../support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _support_fieldProperties_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ../support/fieldProperties.js */ "../node_modules/@arcgis/core/layers/support/fieldProperties.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _support_I3SIndexInfo_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ../support/I3SIndexInfo.js */ "../node_modules/@arcgis/core/layers/support/I3SIndexInfo.js");
/* harmony import */ var _support_I3SLayerDefinitions_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ../support/I3SLayerDefinitions.js */ "../node_modules/@arcgis/core/layers/support/I3SLayerDefinitions.js");
/* harmony import */ var _rest_support_Query_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ../../rest/support/Query.js */ "../node_modules/@arcgis/core/rest/support/Query.js");
/* harmony import */ var _support_popupUtils_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ../../support/popupUtils.js */ "../node_modules/@arcgis/core/support/popupUtils.js");
/* harmony import */ var _symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ../../symbols/support/ElevationInfo.js */ "../node_modules/@arcgis/core/symbols/support/ElevationInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const D=_core_Logger_js__WEBPACK_IMPORTED_MODULE_15__["default"].getLogger("esri.layers.buildingSublayers.BuildingComponentSublayer"),Q=Object(_support_fieldProperties_js__WEBPACK_IMPORTED_MODULE_30__["defineFieldProperties"])();let R=class extends(_core_Loadable_js__WEBPACK_IMPORTED_MODULE_14__["default"].LoadableMixin(Object(_core_Promise_js__WEBPACK_IMPORTED_MODULE_17__["EsriPromiseMixin"])(_BuildingSublayer_js__WEBPACK_IMPORTED_MODULE_27__["default"]))){constructor(e){super(e),this.type="building-component",this.nodePages=null,this.materialDefinitions=null,this.textureSetDefinitions=null,this.geometryDefinitions=null,this.serviceUpdateTimeStamp=null,this.fields=null,this.associatedLayer=null,this.outFields=null,this.listMode="show",this.renderer=null,this.definitionExpression=null,this.popupEnabled=!0,this.popupTemplate=null,this.layerType="3d-object"}get parsedUrl(){return this.layer?{path:`${this.layer.parsedUrl.path}/sublayers/${this.id}`,query:this.layer.parsedUrl.query}:null}get fieldsIndex(){return new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_31__["default"](this.fields)}readAssociatedLayer(e,r){const t=this.layer.associatedFeatureServiceItem,o=r.associatedLayerID;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(t)&&"number"==typeof o?new _FeatureLayer_js__WEBPACK_IMPORTED_MODULE_26__["default"]({portalItem:t,layerId:o}):null}get objectIdField(){if(null!=this.fields)for(const e of this.fields)if("oid"===e.type)return e.name;return null}get displayField(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)?this.associatedLayer.displayField:null}get defaultPopupTemplate(){return this.createPopupTemplate()}load(e){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(e)?e.signal:null,t=this._fetchService(r).then((()=>{this.indexInfo=Object(_support_I3SIndexInfo_js__WEBPACK_IMPORTED_MODULE_32__["fetchIndexInfo"])(this.parsedUrl.path,this.rootNode,this.nodePages,this.apiKey,D,r)}));return this.addResolvingPromise(t),Promise.resolve(this)}createPopupTemplate(e){return Object(_support_popupUtils_js__WEBPACK_IMPORTED_MODULE_35__["createPopupTemplate"])(this,e)}async _fetchService(e){const r=(await Object(_request_js__WEBPACK_IMPORTED_MODULE_11__["default"])(this.parsedUrl.path,{query:{f:"json",token:this.apiKey},responseType:"json",signal:e})).data;this.read(r,{origin:"service",url:this.parsedUrl})}getField(e){return this.fieldsIndex.get(e)}getFieldDomain(e,r){var t,o,s,i;const a=null==(t=this.getFeatureType(null==r?void 0:r.feature))||null==(o=t.domains)?void 0:o[e];return a&&"inherited"!==a.type?a:null!=(s=null==(i=this.getField(e))?void 0:i.domain)?s:null}getFeatureType(e){return e&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)?this.associatedLayer.getFeatureType(e):null}get types(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)?this.associatedLayer.types:[]}get typeIdField(){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)?this.associatedLayer.typeIdField:null}get geometryType(){return"3d-object"===this.layerType?"mesh":"point"}get profile(){return"3d-object"===this.layerType?"mesh-pyramids":"points"}get capabilities(){const e=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)&&this.associatedLayer.capabilities?this.associatedLayer.capabilities:_support_capabilities_js__WEBPACK_IMPORTED_MODULE_28__["zeroCapabilities"],{query:r,data:{supportsZ:t,supportsM:o,isVersioned:s}}=e;return{query:r,data:{supportsZ:t,supportsM:o,isVersioned:s}}}createQuery(){const e=new _rest_support_Query_js__WEBPACK_IMPORTED_MODULE_34__["default"];return"mesh"!==this.geometryType&&(e.returnGeometry=!0,e.returnZ=!0),e.where=this.definitionExpression||"1=1",e.sqlFormat="standard",e}queryExtent(e,r){return this._getAssociatedLayerForQuery().then((t=>t.queryExtent(e||this.createQuery(),r)))}queryFeatureCount(e,r){return this._getAssociatedLayerForQuery().then((t=>t.queryFeatureCount(e||this.createQuery(),r)))}queryFeatures(e,r){return this._getAssociatedLayerForQuery().then((t=>t.queryFeatures(e||this.createQuery(),r))).then((e=>{if(null!=e&&e.features)for(const r of e.features)r.layer=this.layer,r.sourceLayer=this;return e}))}queryObjectIds(e,r){return this._getAssociatedLayerForQuery().then((t=>t.queryObjectIds(e||this.createQuery(),r)))}getFieldUsageInfo(e){return this.fieldsIndex.has(e)?{supportsLabelingInfo:!1,supportsRenderer:!1,supportsPopupTemplate:!1,supportsLayerQuery:!1}:{supportsLabelingInfo:!1,supportsRenderer:!0,supportsPopupTemplate:!0,supportsLayerQuery:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(this.associatedLayer)}}_getAssociatedLayerForQuery(){const e=this.associatedLayer;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isSome"])(e)&&e.loaded?Promise.resolve(e):this._loadAssociatedLayerForQuery()}async _loadAssociatedLayerForQuery(){if(await this.load(),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_16__["isNone"])(this.associatedLayer))throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_12__["default"]("buildingscenelayer:query-not-available","BuildingSceneLayer component layer queries are not available without an associated feature layer",{layer:this});try{await this.associatedLayer.load()}catch(e){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_12__["default"]("buildingscenelayer:query-not-available","BuildingSceneLayer associated feature layer could not be loaded",{layer:this,error:e})}return this.associatedLayer}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0})],R.prototype,"parsedUrl",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:_support_I3SLayerDefinitions_js__WEBPACK_IMPORTED_MODULE_33__["I3SNodePageDefinition"],readOnly:!0})],R.prototype,"nodePages",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:[_support_I3SLayerDefinitions_js__WEBPACK_IMPORTED_MODULE_33__["I3SMaterialDefinition"]],readOnly:!0})],R.prototype,"materialDefinitions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:[_support_I3SLayerDefinitions_js__WEBPACK_IMPORTED_MODULE_33__["I3STextureSetDefinition"]],readOnly:!0})],R.prototype,"textureSetDefinitions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:[_support_I3SLayerDefinitions_js__WEBPACK_IMPORTED_MODULE_33__["I3SGeometryDefinition"]],readOnly:!0})],R.prototype,"geometryDefinitions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0})],R.prototype,"serviceUpdateTimeStamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0})],R.prototype,"store",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:String,readOnly:!0,json:{read:{source:"store.rootNode"}}})],R.prototype,"rootNode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0})],R.prototype,"attributeStorageInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])(Q.fields)],R.prototype,"fields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0})],R.prototype,"fieldsIndex",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:_FeatureLayer_js__WEBPACK_IMPORTED_MODULE_26__["default"]})],R.prototype,"associatedLayer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_22__["reader"])("service","associatedLayer",["associatedLayerID"])],R.prototype,"readAssociatedLayer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])(Q.outFields)],R.prototype,"outFields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:String,readOnly:!0})],R.prototype,"objectIdField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:String,json:{read:!1}})],R.prototype,"displayField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:String,aliasOf:"layer.apiKey"})],R.prototype,"apiKey",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_24__["default"],aliasOf:"layer.fullExtent"})],R.prototype,"fullExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_25__["default"],aliasOf:"layer.spatialReference"})],R.prototype,"spatialReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,aliasOf:"layer.version"})],R.prototype,"version",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:_symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_36__["default"],aliasOf:"layer.elevationInfo"})],R.prototype,"elevationInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:Number,aliasOf:"layer.minScale"})],R.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:Number,aliasOf:"layer.maxScale"})],R.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:["hide","show"],json:{write:!0}})],R.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({types:_renderers_support_types_js__WEBPACK_IMPORTED_MODULE_10__["webSceneRendererTypes"],json:{origins:{service:{read:{source:"drawingInfo.renderer"}}},name:"layerDefinition.drawingInfo.renderer",write:!0},value:null})],R.prototype,"renderer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:String,json:{origins:{service:{read:!1,write:!1}},name:"layerDefinition.definitionExpression",write:{enabled:!0,allowNull:!0}}})],R.prototype,"definitionExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_29__["popupEnabled"])],R.prototype,"popupEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({type:_PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{read:{source:"popupInfo"},write:{target:"popupInfo"}}})],R.prototype,"popupTemplate",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,type:String,json:{origins:{service:{read:{source:"store.normalReferenceFrame"}}},read:!1}})],R.prototype,"normalReferenceFrame",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,json:{read:!1}})],R.prototype,"defaultPopupTemplate",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])()],R.prototype,"types",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])()],R.prototype,"typeIdField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({json:{write:!1}}),Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_21__["enumeration"])(new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_13__["JSONMap"]({"3DObject":"3d-object",Point:"point"}))],R.prototype,"layerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])()],R.prototype,"geometryType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])()],R.prototype,"profile",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_18__["property"])({readOnly:!0,json:{read:!1}})],R.prototype,"capabilities",null),R=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_23__["subclass"])("esri.layers.buildingSublayers.BuildingComponentSublayer")],R);var E=R;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingGroupSublayer.js":
/*!**************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/buildingSublayers/BuildingGroupSublayer.js ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_loadAll_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/loadAll.js */ "../node_modules/@arcgis/core/core/loadAll.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingComponentSublayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BuildingComponentSublayer.js */ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingComponentSublayer.js");
/* harmony import */ var _BuildingSublayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BuildingSublayer.js */ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingSublayer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;const p={type:_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"],readOnly:!0,json:{origins:{service:{read:{source:"sublayers",reader:l}}},read:!1}};function l(r,o,t){if(r&&Array.isArray(r))return new _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"](r.map((r=>{const e=y(r);if(e){const o=new e;return o.read(r,t),o}t&&t.messages&&r&&t.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_3__["default"]("building-scene-layer:unsupported-sublayer-type","Building scene sublayer of type '"+(r.type||"unknown")+"' are not supported",{definition:r,context:t}))})))}let c=a=class extends _BuildingSublayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(r){super(r),this.type="building-group",this.listMode="show",this.sublayers=null}loadAll(){return Object(_core_loadAll_js__WEBPACK_IMPORTED_MODULE_2__["loadAllChildren"])(this,(r=>a.forEachSublayer(this.sublayers,(e=>{"building-group"!==e.type&&r(e)}))))}};function y(r){return"group"===r.layerType?c:_BuildingComponentSublayer_js__WEBPACK_IMPORTED_MODULE_9__["default"]}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["hide","show","hide-children"],json:{write:!0}})],c.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(p)],c.prototype,"sublayers",void 0),c=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.buildingSublayers.BuildingGroupSublayer")],c),function(r){function e(r,o){r.forEach((r=>{o(r),"building-group"===r.type&&e(r.sublayers,o)}))}r.sublayersProperty=p,r.readSublayers=l,r.forEachSublayer=e}(c||(c={}));var d=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/buildingSublayers/BuildingSublayer.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/buildingSublayers/BuildingSublayer.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Identifiable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Identifiable.js */ "../node_modules/@arcgis/core/core/Identifiable.js");
/* harmony import */ var _core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/MultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let l=class extends(Object(_core_Identifiable_js__WEBPACK_IMPORTED_MODULE_1__["IdentifiableMixin"])(_core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["MultiOriginJSONSupport"])){constructor(e){super(e),this.title="",this.id=-1,this.modelName=null,this.isEmpty=null,this.visible=!0,this.opacity=1}readTitle(e,r){return"string"==typeof r.alias?r.alias:"string"==typeof r.name?r.name:""}readIdOnlyOnce(e){return-1!==this.id?this.id:"number"==typeof e?e:void 0}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{origins:{"web-scene":{write:!0},"portal-item":{write:!0}}}})],l.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("service","title",["alias","name"])],l.prototype,"readTitle",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],l.prototype,"layer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"],readOnly:!0,json:{read:!1,write:{ignoreOrigin:!0}}})],l.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("service","id")],l.prototype,"readIdOnlyOnce",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(Object(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_9__["readOnlyService"])(String))],l.prototype,"modelName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(Object(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_9__["readOnlyService"])(Boolean))],l.prototype,"isEmpty",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{name:"visibility",write:!0}})],l.prototype,"visible",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],l.prototype,"opacity",void 0),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.buildingSublayers.BuildingSublayer")],l);var n=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilter.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilter.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_uuid_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/uuid.js */ "../node_modules/@arcgis/core/core/uuid.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterAuthoringInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BuildingFilterAuthoringInfo.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfo.js");
/* harmony import */ var _BuildingFilterAuthoringInfoCheckbox_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./BuildingFilterAuthoringInfoCheckbox.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoCheckbox.js");
/* harmony import */ var _BuildingFilterBlock_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./BuildingFilterBlock.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterBlock.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;const d=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_BuildingFilterBlock_js__WEBPACK_IMPORTED_MODULE_12__["default"]);let m=u=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.description=null,this.filterBlocks=null,this.id=Object(_core_uuid_js__WEBPACK_IMPORTED_MODULE_4__["generateUUID"])(),this.name=null}clone(){return new u({description:this.description,filterBlocks:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.filterBlocks),id:this.id,name:this.name,filterAuthoringInfo:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.filterAuthoringInfo)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,json:{write:!0}})],m.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:d,json:{write:{enabled:!0,isRequired:!0}}})],m.prototype,"filterBlocks",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({types:{key:"type",base:_BuildingFilterAuthoringInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"],typeMap:{checkbox:_BuildingFilterAuthoringInfoCheckbox_js__WEBPACK_IMPORTED_MODULE_11__["default"]}},json:{read:o=>"checkbox"===(o&&o.type)?_BuildingFilterAuthoringInfoCheckbox_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromJSON(o):null,write:!0}})],m.prototype,"filterAuthoringInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,constructOnly:!0,json:{write:{enabled:!0,isRequired:!0}}})],m.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,json:{write:{enabled:!0,isRequired:!0}}})],m.prototype,"name",void 0),m=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.layers.support.BuildingFilter")],m);var a=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfo.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfo.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,readOnly:!0,json:{write:!0}})],t.prototype,"type",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.BuildingFilterAuthoringInfo")],t);var p=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoBlock.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoBlock.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterAuthoringInfoType_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BuildingFilterAuthoringInfoType.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;const l=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_BuildingFilterAuthoringInfoType_js__WEBPACK_IMPORTED_MODULE_9__["default"]);let m=c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{clone(){return new c({filterTypes:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.filterTypes)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:l,json:{write:!0}})],m.prototype,"filterTypes",void 0),m=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.support.BuildingFilterAuthoringInfoBlock")],m);var n=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoCheckbox.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoCheckbox.js ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterAuthoringInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./BuildingFilterAuthoringInfo.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfo.js");
/* harmony import */ var _BuildingFilterAuthoringInfoBlock_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BuildingFilterAuthoringInfoBlock.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoBlock.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;const l=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_BuildingFilterAuthoringInfoBlock_js__WEBPACK_IMPORTED_MODULE_9__["default"]);let n=p=class extends _BuildingFilterAuthoringInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(){super(...arguments),this.type="checkbox"}clone(){return new p({filterBlocks:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.filterBlocks)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["checkbox"]})],n.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:l,json:{write:!0}})],n.prototype,"filterBlocks",void 0),n=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.BuildingFilterAuthoringInfoCheckbox")],n);var m=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoType.js":
/*!**************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterAuthoringInfoType.js ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.filterType=null,this.filterValues=null}clone(){return new p({filterType:this.filterType,filterValues:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.filterValues)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],i.prototype,"filterType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[String],json:{write:!0}})],i.prototype,"filterValues",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.BuildingFilterAuthoringInfoType")],i);var l=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterBlock.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterBlock.js ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./BuildingFilterMode.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js");
/* harmony import */ var _BuildingFilterModeSolid_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BuildingFilterModeSolid.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeSolid.js");
/* harmony import */ var _BuildingFilterModeWireFrame_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BuildingFilterModeWireFrame.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeWireFrame.js");
/* harmony import */ var _BuildingFilterModeXRay_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./BuildingFilterModeXRay.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeXRay.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;const d={nonNullable:!0,types:{key:"type",base:_BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_8__["default"],typeMap:{solid:_BuildingFilterModeSolid_js__WEBPACK_IMPORTED_MODULE_9__["default"],"wire-frame":_BuildingFilterModeWireFrame_js__WEBPACK_IMPORTED_MODULE_10__["default"],"x-ray":_BuildingFilterModeXRay_js__WEBPACK_IMPORTED_MODULE_11__["default"]}},json:{read:r=>{switch(r&&r.type){case"solid":return _BuildingFilterModeSolid_js__WEBPACK_IMPORTED_MODULE_9__["default"].fromJSON(r);case"wireFrame":return _BuildingFilterModeWireFrame_js__WEBPACK_IMPORTED_MODULE_10__["default"].fromJSON(r);case"x-ray":return _BuildingFilterModeXRay_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromJSON(r);default:return}},write:{enabled:!0,isRequired:!0}}};let c=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.filterExpression=null,this.filterMode=new _BuildingFilterModeSolid_js__WEBPACK_IMPORTED_MODULE_9__["default"],this.title=""}clone(){return new a({filterExpression:this.filterExpression,filterMode:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.filterMode),title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:{enabled:!0,isRequired:!0}}})],c.prototype,"filterExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(d)],c.prototype,"filterMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:{enabled:!0,isRequired:!0}}})],c.prototype,"title",void 0),c=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.BuildingFilterBlock")],c);var m=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
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
let p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0,json:{read:!1}})],p.prototype,"type",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.BuildingFilterMode")],p);var t=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeSolid.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterModeSolid.js ***!
  \******************************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./BuildingFilterMode.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(){super(...arguments),this.type="solid"}clone(){return new t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["solid"],readOnly:!0,json:{write:!0}})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.support.BuildingFilterModeSolid")],p);var i=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeWireFrame.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterModeWireFrame.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./BuildingFilterMode.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js");
/* harmony import */ var _symbols_edges_utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../symbols/edges/utils.js */ "../node_modules/@arcgis/core/symbols/edges/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let m=c=class extends _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(){super(...arguments),this.type="wire-frame",this.edges=null}clone(){return new c({edges:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.edges)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({wireFrame:"wire-frame"})],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_symbols_edges_utils_js__WEBPACK_IMPORTED_MODULE_9__["symbol3dEdgesProperty"])],m.prototype,"edges",void 0),m=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.BuildingFilterModeWireFrame")],m);var a=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingFilterModeXRay.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingFilterModeXRay.js ***!
  \*****************************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./BuildingFilterMode.js */ "../node_modules/@arcgis/core/layers/support/BuildingFilterMode.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _BuildingFilterMode_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(){super(...arguments),this.type="x-ray"}clone(){return new t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["x-ray"],readOnly:!0,json:{write:!0}})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.support.BuildingFilterModeXRay")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/BuildingSummaryStatistics.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/BuildingSummaryStatistics.js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_Loadable_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Loadable.js */ "../node_modules/@arcgis/core/core/Loadable.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_Promise_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Promise.js */ "../node_modules/@arcgis/core/core/Promise.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=_core_Logger_js__WEBPACK_IMPORTED_MODULE_4__["default"].getLogger("esri.layers.support.BuildingSummaryStatistics");let n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.fieldName=null,this.modelName=null,this.label=null,this.min=null,this.max=null,this.mostFrequentValues=null,this.subLayerIds=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String})],n.prototype,"fieldName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String})],n.prototype,"modelName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String})],n.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:Number})],n.prototype,"min",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:Number})],n.prototype,"max",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({json:{read:e=>Array.isArray(e)&&(e.every((e=>"string"==typeof e))||e.every((e=>"number"==typeof e)))?e.slice():null}})],n.prototype,"mostFrequentValues",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:[Number]})],n.prototype,"subLayerIds",void 0),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.layers.support.BuildingFieldStatistics")],n);let m=class extends(_core_Loadable_js__WEBPACK_IMPORTED_MODULE_3__["default"].LoadableMixin(Object(_core_Promise_js__WEBPACK_IMPORTED_MODULE_6__["EsriPromiseMixin"])(_core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]))){constructor(){super(...arguments),this.url=null}get fields(){return this.loaded||"loading"===this.loadStatus?this._get("fields"):(u.error("building summary statistics are not loaded"),null)}load(e){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isSome"])(e)?e.signal:null;return this.addResolvingPromise(this._fetchService(r)),Promise.resolve(this)}async _fetchService(e){const t=(await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this.url,{query:{f:"json"},responseType:"json",signal:e})).data;this.read(t,{origin:"service"})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({constructOnly:!0,type:String})],m.prototype,"url",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({readOnly:!0,type:[n],json:{read:{source:"summary"}}})],m.prototype,"fields",null),m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.layers.support.BuildingSummaryStatistics")],m);var d=m;


/***/ })

};;
//# sourceMappingURL=83.render-page.js.map
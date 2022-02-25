exports.ids = [13];
exports.modules = {

/***/ "../node_modules/@arcgis/core/TimeInterval.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/TimeInterval.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_timeUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/timeUtils.js */ "../node_modules/@arcgis/core/core/timeUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./portal/timeUnitKebabDictionary.js */ "../node_modules/@arcgis/core/portal/timeUnitKebabDictionary.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let a=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.value=0,this.unit="milliseconds"}toMilliseconds(){return Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_2__["convertTime"])(this.value,this.unit,"milliseconds")}clone(){return new p({value:this.value,unit:this.unit})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0},nonNullable:!0})],a.prototype,"value",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_8__["timeUnitKebabDictionary"].apiValues,json:{type:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_8__["timeUnitKebabDictionary"].jsonValues,read:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_8__["timeUnitKebabDictionary"].read,write:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_8__["timeUnitKebabDictionary"].write},nonNullable:!0})],a.prototype,"unit",void 0),a=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.TimeInterval")],a);var l=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/TemporalLayer.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/TemporalLayer.js ***!
  \*******************************************************************/
/*! exports provided: TemporalLayer, isTemporalLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TemporalLayer", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTemporalLayer", function() { return f; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _TimeExtent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../TimeExtent.js */ "../node_modules/@arcgis/core/TimeExtent.js");
/* harmony import */ var _TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../TimeInterval.js */ "../node_modules/@arcgis/core/TimeInterval.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_TimeInfo_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../support/TimeInfo.js */ "../node_modules/@arcgis/core/layers/support/TimeInfo.js");
/* harmony import */ var _support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../portal/timeUnitKebabDictionary.js */ "../node_modules/@arcgis/core/portal/timeUnitKebabDictionary.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function f(e){return void 0!==e.timeInfo}const c=f=>{let c=class extends f{constructor(){super(...arguments),this.timeExtent=null,this.timeOffset=null,this.useViewTime=!0}readOffset(e,t){const r=t.timeInfo.exportOptions;if(!r)return null;const i=r.timeOffset,s=_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_11__["timeUnitKebabDictionary"].fromJSON(r.timeOffsetUnits);return i&&s?new _TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__["default"]({value:i,unit:s}):null}set timeInfo(e){Object(_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_10__["fixTimeInfoFields"])(e,this.fieldsIndex),this._set("timeInfo",e)}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_TimeExtent_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!1}})],c.prototype,"timeExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__["default"]})],c.prototype,"timeOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("service","timeOffset",["timeInfo.exportOptions"])],c.prototype,"readOffset",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({value:null,type:_support_TimeInfo_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0,origins:{"web-document":{read:!1,write:!1}}}})],c.prototype,"timeInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{read:{source:"timeAnimation"},write:{target:"timeAnimation"},origins:{"web-scene":{read:!1,write:!1}}}})],c.prototype,"useViewTime",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.layers.mixins.TemporalLayer")],c),c};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/AggregateField.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/AggregateField.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _OutStatistic_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./OutStatistic.js */ "../node_modules/@arcgis/core/layers/support/OutStatistic.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.name=null}clone(){return new p({name:this.name,outStatistic:this.outStatistic.clone()})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],i.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_OutStatistic_js__WEBPACK_IMPORTED_MODULE_7__["default"],json:{write:!0}})],i.prototype,"outStatistic",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.AggregateField")],i);var c=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FeatureReduction.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FeatureReduction.js ***!
  \***********************************************************************/
/*! exports provided: FeatureReduction, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FeatureReduction", function() { return t; });
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["selection","cluster"],readOnly:!0,json:{read:!1,write:!0}})],t.prototype,"type",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.FeatureReduction")],t);var p=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FeatureReductionCluster.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FeatureReductionCluster.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../PopupTemplate.js */ "../node_modules/@arcgis/core/PopupTemplate.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _AggregateField_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./AggregateField.js */ "../node_modules/@arcgis/core/layers/support/AggregateField.js");
/* harmony import */ var _commonProperties_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _LabelClass_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./LabelClass.js */ "../node_modules/@arcgis/core/layers/support/LabelClass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var m;let d=m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(e){super(e),this.type="cluster",this.clusterRadius=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"])("80px"),this.clusterMinSize=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"])("12px"),this.clusterMaxSize=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"])("50px"),this.popupEnabled=!0,this.popupTemplate=null,this.symbol=null,this.labelingInfo=null,this.labelsVisible=!0,this.fields=null}clone(){return new m({clusterRadius:this.clusterRadius,clusterMinSize:this.clusterMinSize,clusterMaxSize:this.clusterMaxSize,labelingInfo:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.labelingInfo),labelsVisible:this.labelsVisible,fields:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.fields),popupEnabled:this.popupEnabled,popupTemplate:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.popupTemplate)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:["cluster"],readOnly:!0,json:{write:!0}})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Number,cast:e=>"auto"===e?e:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"])(e),json:{write:!0}})],d.prototype,"clusterRadius",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"],json:{write:!0}})],d.prototype,"clusterMinSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["toPt"],json:{write:!0}})],d.prototype,"clusterMaxSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])(_commonProperties_js__WEBPACK_IMPORTED_MODULE_12__["popupEnabled"])],d.prototype,"popupEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_PopupTemplate_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{read:{source:"popupInfo"},write:{target:"popupInfo"}}})],d.prototype,"popupTemplate",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({types:_symbols_js__WEBPACK_IMPORTED_MODULE_2__["symbolTypesCluster"]})],d.prototype,"symbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:[_LabelClass_js__WEBPACK_IMPORTED_MODULE_13__["default"]],json:{read:{source:"drawingInfo.labelingInfo"},write:{target:"drawingInfo.labelingInfo"}}})],d.prototype,"labelingInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])(_commonProperties_js__WEBPACK_IMPORTED_MODULE_12__["labelsVisible"])],d.prototype,"labelsVisible",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:[_AggregateField_js__WEBPACK_IMPORTED_MODULE_11__["default"]],json:{write:!0}})],d.prototype,"fields",void 0),d=m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.layers.support.FeatureReductionCluster")],d);var b=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FeatureReductionSelection.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FeatureReductionSelection.js ***!
  \********************************************************************************/
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
/* harmony import */ var _FeatureReduction_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./FeatureReduction.js */ "../node_modules/@arcgis/core/layers/support/FeatureReduction.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _FeatureReduction_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(r){super(r),this.type="selection"}clone(){return new t}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["selection"]})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.support.FeatureReductionSelection")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/OutStatistic.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/OutStatistic.js ***!
  \*******************************************************************/
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
var r;let e=r=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.statisticType=null,this.onStatisticField=null,this.onStatisticValueExpression=null}clone(){return new r({statisticType:this.statisticType,onStatisticField:this.onStatisticField,onStatisticValueExpression:this.onStatisticValueExpression})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],e.prototype,"statisticType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],e.prototype,"onStatisticField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],e.prototype,"onStatisticValueExpression",void 0),e=r=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.OutStatistic")],e);var p=e;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/TimeInfo.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/TimeInfo.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return v; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _TimeExtent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../TimeExtent.js */ "../node_modules/@arcgis/core/TimeExtent.js");
/* harmony import */ var _TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../TimeInterval.js */ "../node_modules/@arcgis/core/TimeInterval.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _TimeReference_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./TimeReference.js */ "../node_modules/@arcgis/core/layers/support/TimeReference.js");
/* harmony import */ var _portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../portal/timeUnitKebabDictionary.js */ "../node_modules/@arcgis/core/portal/timeUnitKebabDictionary.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let c=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(e){super(e),this.cumulative=!1,this.endField=null,this.fullTimeExtent=null,this.hasLiveData=!1,this.interval=null,this.startField=null,this.timeReference=null,this.trackIdField=null,this.useTime=!0}readFullTimeExtent(e,r){if(!r.timeExtent||!Array.isArray(r.timeExtent)||2!==r.timeExtent.length)return null;const i=new Date(r.timeExtent[0]),l=new Date(r.timeExtent[1]);return new _TimeExtent_js__WEBPACK_IMPORTED_MODULE_1__["default"]({start:i,end:l})}writeFullTimeExtent(e,t){e&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isSome"])(e.start)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isSome"])(e.end)?t.timeExtent=[e.start.getTime(),e.end.getTime()]:t.timeExtent=null}readInterval(e,t){return t.timeInterval&&t.timeIntervalUnits?new _TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__["default"]({value:t.timeInterval,unit:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_14__["timeUnitKebabDictionary"].fromJSON(t.timeIntervalUnits)}):t.defaultTimeInterval&&t.defaultTimeIntervalUnits?new _TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__["default"]({value:t.defaultTimeInterval,unit:_portal_timeUnitKebabDictionary_js__WEBPACK_IMPORTED_MODULE_14__["timeUnitKebabDictionary"].fromJSON(t.defaultTimeIntervalUnits)}):null}writeInterval(e,t){if(e){const r=e.toJSON();t.timeInterval=r.value,t.timeIntervalUnits=r.unit}else t.timeInterval=null,t.timeIntervalUnits=null}clone(){const{cumulative:e,endField:t,hasLiveData:r,interval:i,startField:o,timeReference:n,fullTimeExtent:a,trackIdField:s,useTime:m}=this;return new d({cumulative:e,endField:t,hasLiveData:r,interval:i,startField:o,timeReference:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(n),fullTimeExtent:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(a),trackIdField:s,useTime:m})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Boolean,json:{read:{source:"exportOptions.timeDataCumulative"},write:{target:"exportOptions.timeDataCumulative"}}})],c.prototype,"cumulative",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{read:{source:"endTimeField"},write:{target:"endTimeField",allowNull:!0}}})],c.prototype,"endField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_TimeExtent_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:{enabled:!0,allowNull:!0}}})],c.prototype,"fullTimeExtent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("fullTimeExtent",["timeExtent"])],c.prototype,"readFullTimeExtent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("fullTimeExtent")],c.prototype,"writeFullTimeExtent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Boolean,json:{write:!0}})],c.prototype,"hasLiveData",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_TimeInterval_js__WEBPACK_IMPORTED_MODULE_2__["default"],json:{write:{enabled:!0,allowNull:!0}}})],c.prototype,"interval",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("interval",["timeInterval","timeIntervalUnits","defaultTimeInterval","defaultTimeIntervalUnits"])],c.prototype,"readInterval",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("interval")],c.prototype,"writeInterval",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{read:{source:"startTimeField"},write:{target:"startTimeField",allowNull:!0}}})],c.prototype,"startField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_TimeReference_js__WEBPACK_IMPORTED_MODULE_13__["default"],json:{write:{enabled:!0,allowNull:!0}}})],c.prototype,"timeReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:{enabled:!0,allowNull:!0}}})],c.prototype,"trackIdField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Boolean,json:{read:{source:"exportOptions.useTime"},write:{target:"exportOptions.useTime"}}})],c.prototype,"useTime",void 0),c=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__["subclass"])("esri.layers.support.TimeInfo")],c);var v=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/TimeReference.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/TimeReference.js ***!
  \********************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let a=i=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(e){super(e),this.respectsDaylightSaving=!1,this.timezone=null}readRespectsDaylightSaving(e,r){return void 0!==r.respectsDaylightSaving?r.respectsDaylightSaving:void 0!==r.respectDaylightSaving&&r.respectDaylightSaving}clone(){const{respectsDaylightSaving:e,timezone:r}=this;return new i({respectsDaylightSaving:e,timezone:r})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,json:{write:!0}})],a.prototype,"respectsDaylightSaving",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("respectsDaylightSaving",["respectsDaylightSaving","respectDaylightSaving"])],a.prototype,"readRespectsDaylightSaving",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{read:{source:"timeZone"},write:{target:"timeZone"}}})],a.prototype,"timezone",void 0),a=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.TimeReference")],a);var p=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/featureReductionUtils.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/featureReductionUtils.js ***!
  \****************************************************************************/
/*! exports provided: featureReductionProperty, read, webSceneFeatureReductionTypes, write, writeTarget */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "featureReductionProperty", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webSceneFeatureReductionTypes", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "write", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeTarget", function() { return i; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _FeatureReduction_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FeatureReduction.js */ "../node_modules/@arcgis/core/layers/support/FeatureReduction.js");
/* harmony import */ var _FeatureReductionCluster_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./FeatureReductionCluster.js */ "../node_modules/@arcgis/core/layers/support/FeatureReductionCluster.js");
/* harmony import */ var _FeatureReductionSelection_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./FeatureReductionSelection.js */ "../node_modules/@arcgis/core/layers/support/FeatureReductionSelection.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s={key:"type",base:_FeatureReduction_js__WEBPACK_IMPORTED_MODULE_2__["default"],typeMap:{selection:_FeatureReductionSelection_js__WEBPACK_IMPORTED_MODULE_4__["default"]}};function u(e,t){const o=(t=t.layerDefinition||t).featureReduction;if(o)switch(o.type){case"selection":return _FeatureReductionSelection_js__WEBPACK_IMPORTED_MODULE_4__["default"].fromJSON(o);case"cluster":return _FeatureReductionCluster_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(o)}return null}function i(e,o,r,n){const s=c(e,{},n);s&&Object(_core_object_js__WEBPACK_IMPORTED_MODULE_1__["setDeepValue"])(r,s,o)}function c(t,o,r){return t?"selection"!==t.type?(r.messages&&r.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("featureReduction:unsupported",`FeatureReduction of type '${t.declaredClass}' are not supported in scenes.`,{featureReduction:t,context:r})),null):t.write(o,r):null}const a={types:{key:"type",base:_FeatureReduction_js__WEBPACK_IMPORTED_MODULE_2__["default"],typeMap:{selection:_FeatureReductionSelection_js__WEBPACK_IMPORTED_MODULE_4__["default"],cluster:_FeatureReductionCluster_js__WEBPACK_IMPORTED_MODULE_3__["default"]}},json:{write:{target:"layerDefinition.featureReduction",allowNull:!0}}};


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

/***/ "../node_modules/@arcgis/core/layers/support/labelingInfo.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/labelingInfo.js ***!
  \*******************************************************************/
/*! exports provided: reader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reader", function() { return r; });
/* harmony import */ var _LabelClass_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./LabelClass.js */ "../node_modules/@arcgis/core/layers/support/LabelClass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=/\[([^\[\]]+)\]/gi;function r(r,i,o){return r?r.map((r=>{const s=new _LabelClass_js__WEBPACK_IMPORTED_MODULE_0__["default"];if(s.read(r,o),s.labelExpression){const e=i.fields||i.layerDefinition&&i.layerDefinition.fields||this.fields;s.labelExpression=s.labelExpression.replace(n,((n,r)=>`[${t(r,e)}]`))}return s})):null}function t(e,n){if(!n)return e;const r=e.toLowerCase();for(let t=0;t<n.length;t++){const e=n[t].name;if(e.toLowerCase()===r)return e}return e}


/***/ }),

/***/ "../node_modules/@arcgis/core/portal/timeUnitKebabDictionary.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/timeUnitKebabDictionary.js ***!
  \**********************************************************************/
/*! exports provided: timeUnitKebabDictionary */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeUnitKebabDictionary", function() { return e; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({esriTimeUnitsMilliseconds:"milliseconds",esriTimeUnitsSeconds:"seconds",esriTimeUnitsMinutes:"minutes",esriTimeUnitsHours:"hours",esriTimeUnitsDays:"days",esriTimeUnitsWeeks:"weeks",esriTimeUnitsMonths:"months",esriTimeUnitsYears:"years",esriTimeUnitsDecades:"decades",esriTimeUnitsCenturies:"centuries",esriTimeUnitsUnknown:void 0});


/***/ })

};;
//# sourceMappingURL=13.render-page.js.map
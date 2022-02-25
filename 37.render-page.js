exports.ids = [37];
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

/***/ "../node_modules/@arcgis/core/geometry/support/scaleUtils.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/support/scaleUtils.js ***!
  \*******************************************************************/
/*! exports provided: getExtentForScale, getResolutionForScale, getScale, getScaleForResolution */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getExtentForScale", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getResolutionForScale", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScale", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScaleForResolution", function() { return o; });
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=96;function r(r,i){const o=i||r.extent,c=r.width,u=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["getMetersPerUnitForSR"])(o&&o.spatialReference);return o&&c?o.width/c*u*_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["inchesPerMeter"]*e:0}function i(r,i){return r/(Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["getMetersPerUnitForSR"])(i)*_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["inchesPerMeter"]*e)}function o(r,i){return r*(Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["getMetersPerUnitForSR"])(i)*_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["inchesPerMeter"]*e)}function c(t,n){const e=t.extent,r=t.width,o=i(n,e.spatialReference);return e.clone().expand(o*r/e.width)}


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
//# sourceMappingURL=37.render-page.js.map
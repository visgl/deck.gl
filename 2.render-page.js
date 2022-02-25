exports.ids = [2];
exports.modules = {

/***/ "../node_modules/@arcgis/core/TimeExtent.js":
/*!**************************************************!*\
  !*** ../node_modules/@arcgis/core/TimeExtent.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/timeUtils.js */ "../node_modules/@arcgis/core/core/timeUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;let d=u=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(t){super(t),this.end=null,this.start=null}static get allTime(){return c}static get empty(){return h}readEnd(t,e){return null!=e.end?new Date(e.end):null}writeEnd(t,e){e.end=t?t.getTime():null}get isAllTime(){return this.equals(u.allTime)}get isEmpty(){return this.equals(u.empty)}readStart(t,e){return null!=e.start?new Date(e.start):null}writeStart(t,e){e.start=t?t.getTime():null}clone(){return new u({end:this.end,start:this.start})}equals(t){if(!t)return!1;const e=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.start)?this.start.getTime():this.start,s=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.end)?this.end.getTime():this.end,i=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t.start)?t.start.getTime():t.start,n=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t.end)?t.end.getTime():t.end;return e===i&&s===n}expandTo(t){if(this.isEmpty||this.isAllTime)return this.clone();const e=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["andThen"])(this.start,(e=>Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["truncateDate"])(e,t))),r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["andThen"])(this.end,(e=>Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["truncateDate"])(e,t),1,t)));return new u({start:e,end:r})}intersection(t){if(!t)return this.clone();if(this.isEmpty||t.isEmpty)return u.empty;if(this.isAllTime)return t.clone();if(t.isAllTime)return this.clone();const e=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["mapOr"])(this.start,-1/0,(t=>t.getTime())),r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["mapOr"])(this.end,1/0,(t=>t.getTime())),s=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["mapOr"])(t.start,-1/0,(t=>t.getTime())),n=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["mapOr"])(t.end,1/0,(t=>t.getTime()));let o,l;if(s>=e&&s<=r?o=s:e>=s&&e<=n&&(o=e),r>=s&&r<=n?l=r:n>=e&&n<=r&&(l=n),!isNaN(o)&&!isNaN(l)){const t=new u;return t.start=o===-1/0?null:new Date(o),t.end=l===1/0?null:new Date(l),t}return u.empty}offset(t,e){if(this.isEmpty||this.isAllTime)return this.clone();const s=new u,{start:i,end:n}=this;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(i)&&(s.start=Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(i,t,e)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(n)&&(s.end=Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(n,t,e)),s}union(t){if(!t||t.isEmpty)return this.clone();if(this.isEmpty)return t.clone();if(this.isAllTime||t.isAllTime)return c.clone();const e=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.start)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t.start)?new Date(Math.min(this.start.getTime(),t.start.getTime())):null,s=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.end)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t.end)?new Date(Math.max(this.end.getTime(),t.end.getTime())):null;return new u({start:e,end:s})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Date,json:{write:{allowNull:!0}}})],d.prototype,"end",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("end")],d.prototype,"readEnd",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("end")],d.prototype,"writeEnd",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({readOnly:!0,json:{read:!1}})],d.prototype,"isAllTime",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({readOnly:!0,json:{read:!1}})],d.prototype,"isEmpty",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Date,json:{write:{allowNull:!0}}})],d.prototype,"start",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("start")],d.prototype,"readStart",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("start")],d.prototype,"writeStart",null),d=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.TimeExtent")],d);const c=new d,h=new d({start:void 0,end:void 0});var y=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js ***!
  \*******************************************************************/
/*! exports provided: MultiOriginJSONMixin, MultiOriginJSONSupport */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MultiOriginJSONMixin", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MultiOriginJSONSupport", function() { return O; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _ReadOnlyMultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReadOnlyMultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/ReadOnlyMultiOriginJSONSupport.js");
/* harmony import */ var _accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./accessorSupport/PropertyOrigin.js */ "../node_modules/@arcgis/core/core/accessorSupport/PropertyOrigin.js");
/* harmony import */ var _accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessorSupport/utils.js */ "../node_modules/@arcgis/core/core/accessorSupport/utils.js");
/* harmony import */ var _accessorSupport_write_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./accessorSupport/write.js */ "../node_modules/@arcgis/core/core/accessorSupport/write.js");
/* harmony import */ var _accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=t=>{let s=class extends t{constructor(...r){super(...r)}clear(r,t="user"){return u(this).delete(r,Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__["nameToId"])(t))}write(r={},t){return Object(_accessorSupport_write_js__WEBPACK_IMPORTED_MODULE_5__["write"])(this,r=r||{},t),r}setAtOrigin(r,t,s){Object(_accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_4__["getProperties"])(this).setAtOrigin(r,t,Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__["nameToId"])(s))}removeOrigin(r){const t=u(this),s=Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__["nameToId"])(r),o=t.keys(s);for(const e of o)t.originOf(e)===s&&t.set(e,t.get(e,s),6)}updateOrigin(r,t){const s=u(this),i=Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__["nameToId"])(t),c=this.get(r);for(let e=i+1;e<_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_3__["OriginIdNum"];++e)s.delete(r,e);s.set(r,c,i)}toJSON(r){return this.write({},r)}};return s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.core.WriteableMultiOriginJSONSupport")],s),s.prototype.toJSON.isDefaultToJSON=!0,s};function u(r){return Object(_accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_4__["getProperties"])(r).store}const l=t=>{let e=class extends(p(Object(_ReadOnlyMultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["ReadOnlyMultiOriginJSONMixin"])(t))){constructor(...r){super(...r)}};return e=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.core.MultiOriginJSONSupport")],e),e};let O=class extends(l(_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"])){};O=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.core.MultiOriginJSONSupport")],O);


/***/ }),

/***/ "../node_modules/@arcgis/core/core/ReadOnlyMultiOriginJSONSupport.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/ReadOnlyMultiOriginJSONSupport.js ***!
  \***************************************************************************/
/*! exports provided: ReadOnlyMultiOriginJSONMixin, ReadOnlyMultiOriginJSONSupport */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReadOnlyMultiOriginJSONMixin", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReadOnlyMultiOriginJSONSupport", function() { return f; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _accessorSupport_MultiOriginStore_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./accessorSupport/MultiOriginStore.js */ "../node_modules/@arcgis/core/core/accessorSupport/MultiOriginStore.js");
/* harmony import */ var _accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./accessorSupport/PropertyOrigin.js */ "../node_modules/@arcgis/core/core/accessorSupport/PropertyOrigin.js");
/* harmony import */ var _accessorSupport_read_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./accessorSupport/read.js */ "../node_modules/@arcgis/core/core/accessorSupport/read.js");
/* harmony import */ var _accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./accessorSupport/utils.js */ "../node_modules/@arcgis/core/core/accessorSupport/utils.js");
/* harmony import */ var _accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=t=>{let a=class extends t{constructor(...r){super(...r);const t=Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["assumeNonNull"])(Object(_accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_6__["getProperties"])(this)),o=t.metadatas,i=t.store,n=new _accessorSupport_MultiOriginStore_js__WEBPACK_IMPORTED_MODULE_3__["default"];t.store=n,i.keys().forEach((r=>{n.set(r,i.get(r),0)})),Object.keys(o).forEach((r=>{t.internalGet(r)&&n.set(r,t.internalGet(r),0)}))}read(r,t){Object(_accessorSupport_read_js__WEBPACK_IMPORTED_MODULE_5__["read"])(this,r,t)}getAtOrigin(r,t){const s=u(this),e=Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_4__["nameToId"])(t);if("string"==typeof r)return s.get(r,e);const o={};return r.forEach((r=>{o[r]=s.get(r,e)})),o}originOf(r){return Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_4__["idToName"])(this.originIdOf(r))}originIdOf(r){return u(this).originOf(r)}revert(r,t){const s=u(this),e=Object(_accessorSupport_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_4__["nameToId"])(t),o=Object(_accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_6__["getProperties"])(this);let n;n="string"==typeof r?"*"===r?s.keys(e):[r]:r,n.forEach((r=>{o.invalidate(r),s.revert(r,e),o.commit(r)}))}};return a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.core.ReadOnlyMultiOriginJSONSupport")],a),a};function u(r){return Object(_accessorSupport_utils_js__WEBPACK_IMPORTED_MODULE_6__["getProperties"])(r).store}let f=class extends(a(_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"])){};f=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.core.ReadOnlyMultiOriginJSONSupport")],f);


/***/ }),

/***/ "../node_modules/@arcgis/core/core/accessorSupport/MultiOriginStore.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/MultiOriginStore.js ***!
  \*****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return r; });
/* harmony import */ var _lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PropertyOrigin.js */ "../node_modules/@arcgis/core/core/accessorSupport/PropertyOrigin.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class r{constructor(){this._propertyOriginMap=new Map,this._originStores=new Array(_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_2__["OriginIdNum"]),this._values=new Map}clone(s){const i=new r,o=this._originStores[0];o&&o.forEach(((s,e)=>{i.set(e,Object(_lang_js__WEBPACK_IMPORTED_MODULE_0__["clone"])(s),0)}));for(let r=2;r<_PropertyOrigin_js__WEBPACK_IMPORTED_MODULE_2__["OriginIdNum"];r++){const e=this._originStores[r];e&&e.forEach(((e,o)=>{s&&s.has(o)||i.set(o,Object(_lang_js__WEBPACK_IMPORTED_MODULE_0__["clone"])(e),r)}))}return i}get(t,s){const e=void 0===s?this._values:this._originStores[s];return e?e.get(t):void 0}keys(t){const s=null==t?this._values:this._originStores[t];return s?[...s.keys()]:[]}set(t,e,r=6){let i=this._originStores[r];if(i||(i=new Map,this._originStores[r]=i),i.set(t,e),!this._values.has(t)||Object(_maybe_js__WEBPACK_IMPORTED_MODULE_1__["assumeNonNull"])(this._propertyOriginMap.get(t))<=r){const s=this._values.get(t);return this._values.set(t,e),this._propertyOriginMap.set(t,r),s!==e}return!1}delete(t,s=6){const e=this._originStores[s];if(!e)return;const r=e.get(t);if(e.delete(t),this._values.has(t)&&this._propertyOriginMap.get(t)===s){this._values.delete(t);for(let e=s-1;e>=0;e--){const s=this._originStores[e];if(s&&s.has(t)){this._values.set(t,s.get(t)),this._propertyOriginMap.set(t,e);break}}}return r}has(t,s){const e=void 0===s?this._values:this._originStores[s];return!!e&&e.has(t)}revert(t,s){for(;s>0&&!this.has(t,s);)--s;const e=this._originStores[s],r=e&&e.get(t),i=this._values.get(t);return this._values.set(t,r),this._propertyOriginMap.set(t,s),i!==r}originOf(t){return this._propertyOriginMap.get(t)||0}forEach(t){this._values.forEach(t)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/timeUtils.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/core/timeUtils.js ***!
  \******************************************************/
/*! exports provided: convertTime, makeUTCTime, offsetDate, offsetDateUTC, resetUTCDate, timeSinceUTCMidnight, truncateDate, truncateLocalTime */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertTime", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeUTCTime", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "offsetDate", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "offsetDateUTC", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetUTCDate", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeSinceUTCMidnight", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "truncateDate", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "truncateLocalTime", function() { return a; });
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./has.js */ "../node_modules/@arcgis/core/core/has.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={milliseconds:1,seconds:1e3,minutes:6e4,hours:36e5,days:864e5,weeks:6048e5,months:26784e5,years:31536e6,decades:31536e7,centuries:31536e8},t={milliseconds:{getter:"getMilliseconds",setter:"setMilliseconds",multiplier:1},seconds:{getter:"getSeconds",setter:"setSeconds",multiplier:1},minutes:{getter:"getMinutes",setter:"setMinutes",multiplier:1},hours:{getter:"getHours",setter:"setHours",multiplier:1},days:{getter:"getDate",setter:"setDate",multiplier:1},weeks:{getter:"getDate",setter:"setDate",multiplier:7},months:{getter:"getMonth",setter:"setMonth",multiplier:1},years:{getter:"getFullYear",setter:"setFullYear",multiplier:1},decades:{getter:"getFullYear",setter:"setFullYear",multiplier:10},centuries:{getter:"getFullYear",setter:"setFullYear",multiplier:100}};function s(e,s,r){const n=new Date(e.getTime());if(s&&r){const e=t[r],{getter:l,setter:u,multiplier:i}=e;n[u](n[l]()+s*i)}return n}function r(e,t,s="milliseconds"){const r=e.getTime(),n=o(t,s,"milliseconds");return new Date(r+n)}function n(e,t){switch(t){case"milliseconds":return new Date(e.getTime());case"seconds":return new Date(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds());case"minutes":return new Date(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes());case"hours":return new Date(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours());case"days":return new Date(e.getFullYear(),e.getMonth(),e.getDate());case"weeks":return new Date(e.getFullYear(),e.getMonth(),e.getDate()-e.getDay());case"months":return new Date(e.getFullYear(),e.getMonth(),1);case"years":return new Date(e.getFullYear(),0,1);case"decades":return new Date(e.getFullYear()-e.getFullYear()%10,0,1);case"centuries":return new Date(e.getFullYear()-e.getFullYear()%100,0,1);default:return new Date}}function l(e,t,s="milliseconds"){const r=new Date(o(t,s,"milliseconds"));return r.setUTCFullYear(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()),r}function u(e,t="milliseconds"){const s=o(e.getUTCHours(),"hours","milliseconds"),r=o(e.getUTCMinutes(),"minutes","milliseconds"),n=o(e.getUTCSeconds(),"seconds","milliseconds");return o(s+r+n+e.getUTCMilliseconds(),"milliseconds",t)}function i(e,t){const s=new Date(e.getTime());return s.setUTCFullYear(t.getFullYear(),t.getMonth(),t.getDate()),s}function a(e){const t=new Date(0);return t.setHours(0),t.setMinutes(0),t.setSeconds(0),t.setMilliseconds(0),t.setFullYear(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()),t}function o(t,s,r){if(0===t)return 0;return t*e[s]/e[r]}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js ***!
  \**********************************************************************/
/*! exports provided: OperationalLayer, isOperationalLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OperationalLayer", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isOperationalLayer", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _core_accessorSupport_read_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/read.js */ "../node_modules/@arcgis/core/core/accessorSupport/read.js");
/* harmony import */ var _core_accessorSupport_write_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/write.js */ "../node_modules/@arcgis/core/core/accessorSupport/write.js");
/* harmony import */ var _operationalLayers_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./operationalLayers.js */ "../node_modules/@arcgis/core/layers/mixins/operationalLayers.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l=l=>{let y=class extends l{constructor(){super(...arguments),this.title=null}writeListMode(e,r,i,t){(t&&"ground"===t.layerContainerType||e&&Object(_core_accessorSupport_write_js__WEBPACK_IMPORTED_MODULE_9__["willPropertyWrite"])(this,i,{},t))&&(r[i]=e)}writeOperationalLayerType(e,r,i,t){!e||t&&"tables"===t.layerContainerType||(r.layerType=e)}writeTitle(e,r){r.title=e||"Layer"}read(e,r){r&&(r.layer=this),Object(_core_accessorSupport_read_js__WEBPACK_IMPORTED_MODULE_8__["readLoadable"])(this,e,(r=>super.read(e,r)),r)}write(e,i){if(i&&i.origin){const e=`${i.origin}/${i.layerContainerType||"operational-layers"}`,t=_operationalLayers_js__WEBPACK_IMPORTED_MODULE_10__["supportedTypes"][e];let o=t&&t[this.operationalLayerType];if("ArcGISTiledElevationServiceLayer"===this.operationalLayerType&&"web-scene/operational-layers"===e&&(o=!1),!o)return i.messages&&i.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("layer:unsupported",`Layers (${this.title}, ${this.id}) of type '${this.declaredClass}' are not supported in the context of '${e}'`,{layer:this})),null}const t=super.write(e,{...i,layer:this}),o=!!i&&!!i.messages&&!!i.messages.filter((e=>e instanceof _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]&&"web-document-write:property-required"===e.name)).length;return!this.url&&o?null:t}beforeSave(){}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:{ignoreOrigin:!0},origins:{"web-scene":{write:{isRequired:!0,ignoreOrigin:!0}},"portal-item":{write:!1}}}})],y.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:{ignoreOrigin:!0},origins:{"web-map":{read:!1,write:!1}}}})],y.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("listMode")],y.prototype,"writeListMode",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,readOnly:!0,json:{read:!1,write:{target:"layerType",ignoreOrigin:!0},origins:{"portal-item":{write:!1}}}})],y.prototype,"operationalLayerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("operationalLayerType")],y.prototype,"writeOperationalLayerType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_11__["opacity"])],y.prototype,"opacity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:{ignoreOrigin:!0,allowNull:!0},origins:{"web-scene":{write:{isRequired:!0,ignoreOrigin:!0,allowNull:!0}},"portal-item":{write:!1}}},value:"Layer"})],y.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("title")],y.prototype,"writeTitle",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,json:{name:"visibility",origins:{"web-document":{name:"visibility",default:!0},"portal-item":{name:"visibility",read:{source:["visible","visibility"]}}}}})],y.prototype,"visible",void 0),y=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.mixins.OperationalLayer")],y),y};function y(e){return"operationalLayerType"in e}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/operationalLayers.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/operationalLayers.js ***!
  \***********************************************************************/
/*! exports provided: supportedTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedTypes", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={"web-scene/operational-layers":{ArcGISFeatureLayer:!0,ArcGISImageServiceLayer:!0,ArcGISMapServiceLayer:!0,ArcGISSceneServiceLayer:!0,ArcGISTiledElevationServiceLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,BuildingSceneLayer:!0,GroupLayer:!0,IntegratedMeshLayer:!0,OGCFeatureLayer:!0,PointCloudLayer:!0,WebTiledLayer:!0,CSV:!0,VectorTileLayer:!0,WFS:!0,WMS:!0,KML:!0,RasterDataLayer:!0,Voxel:!0},"web-scene/basemap":{ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,WebTiledLayer:!0,OpenStreetMap:!0,VectorTileLayer:!0,ArcGISImageServiceLayer:!0,WMS:!0,ArcGISMapServiceLayer:!0},"web-scene/ground":{ArcGISTiledElevationServiceLayer:!0,RasterDataElevationLayer:!0},"web-map/operational-layers":{ArcGISFeatureLayer:!0,ArcGISImageServiceLayer:!0,ArcGISImageServiceVectorLayer:!0,ArcGISMapServiceLayer:!0,ArcGISStreamLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,BingMapsAerial:!0,BingMapsHybrid:!0,BingMapsRoad:!0,CSV:!0,GeoRSS:!0,GroupLayer:!0,KML:!0,OGCFeatureLayer:!0,SubtypeGroupLayer:!0,VectorTileLayer:!0,WFS:!0,WMS:!0,WebTiledLayer:!0},"web-map/basemap":{ArcGISImageServiceLayer:!0,ArcGISImageServiceVectorLayer:!0,ArcGISMapServiceLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,OpenStreetMap:!0,VectorTileLayer:!0,WMS:!0,WebTiledLayer:!0,BingMapsAerial:!0,BingMapsRoad:!0,BingMapsHybrid:!0},"web-map/tables":{ArcGISFeatureLayer:!0},"portal-item/operational-layers":{ArcGISSceneServiceLayer:!0,PointCloudLayer:!0,BuildingSceneLayer:!0,IntegratedMeshLayer:!0}};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/commonProperties.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/commonProperties.js ***!
  \***********************************************************************/
/*! exports provided: combinedViewLayerTimeExtentProperty, elevationInfo, id, labelsVisible, legendEnabled, maxScale, minScale, opacity, opacityDrawingInfo, popupEnabled, readOnlyService, sceneLayerFullExtent, screenSizePerspectiveEnabled, url */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "combinedViewLayerTimeExtentProperty", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "elevationInfo", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "id", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "labelsVisible", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "legendEnabled", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "maxScale", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "minScale", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "opacity", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "opacityDrawingInfo", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "popupEnabled", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readOnlyService", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sceneLayerFullExtent", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "screenSizePerspectiveEnabled", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "url", function() { return f; });
/* harmony import */ var _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../TimeExtent.js */ "../node_modules/@arcgis/core/TimeExtent.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _support_timeUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../support/timeUtils.js */ "../node_modules/@arcgis/core/support/timeUtils.js");
/* harmony import */ var _symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../symbols/support/ElevationInfo.js */ "../node_modules/@arcgis/core/symbols/support/ElevationInfo.js");
/* harmony import */ var _webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../webdoc/support/opacityUtils.js */ "../node_modules/@arcgis/core/webdoc/support/opacityUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l={type:Boolean,value:!0,json:{origins:{service:{read:!1,write:!1},"web-map":{read:!1,write:!1}},name:"screenSizePerspective",write:!0}},p={type:Boolean,value:!0,json:{name:"disablePopup",read:{reader:(e,r)=>!r.disablePopup},write:{enabled:!0,writer(e,r,i){r[i]=!e}}}},m={type:Boolean,value:!0,json:{name:"showLabels",write:!0}},f={type:String,json:{origins:{"portal-item":{write:!1}},write:{isRequired:!0,ignoreOrigin:!0,writer:_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_3__["w"]}}},d={type:Boolean,value:!0,json:{origins:{service:{read:{enabled:!1}}},name:"showLegend",write:!0}},c={value:null,type:_symbols_support_ElevationInfo_js__WEBPACK_IMPORTED_MODULE_5__["default"],json:{origins:{service:{name:"elevationInfo",write:!0}},name:"layerDefinition.elevationInfo",write:!0}};function y(e){return{type:e,readOnly:!0,json:{origins:{service:{read:!0}},read:!1}}}const u={type:Number,json:{origins:{"web-document":{default:1,write:!0,read:!0},"portal-item":{write:!0}}}},w={...u,json:{...u.json,origins:{"web-document":{...u.json.origins["web-document"],write:{enabled:!0,target:{opacity:{type:Number},"layerDefinition.drawingInfo.transparency":{type:Number}}}}},read:{source:["layerDefinition.drawingInfo.transparency","drawingInfo.transparency"],reader:(e,r,i)=>i&&"service"!==i.origin||!r.drawingInfo||void 0===r.drawingInfo.transparency?r.layerDefinition&&r.layerDefinition.drawingInfo&&void 0!==r.layerDefinition.drawingInfo.transparency?Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_6__["transparencyToOpacity"])(r.layerDefinition.drawingInfo.transparency):void 0:Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_6__["transparencyToOpacity"])(r.drawingInfo.transparency)}}},g={type:_TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"],readOnly:!0,get(){var e,r;if(null==(e=this.layer)||!e.timeInfo)return null;const{datesInUnknownTimezone:i,timeOffset:n,useViewTime:a}=this.layer,s=null==(r=this.view)?void 0:r.timeExtent;let l=this.layer.timeExtent;i&&(l=Object(_support_timeUtils_js__WEBPACK_IMPORTED_MODULE_4__["toLocalTimeExtent"])(l));let p=a?s&&l?s.intersection(l):s||l:l;if(!p||p.isEmpty||p.isAllTime)return p;n&&(p=p.offset(-n.value,n.unit)),i&&(p=Object(_support_timeUtils_js__WEBPACK_IMPORTED_MODULE_4__["toUTCTimeExtent"])(p));const m=this._get("timeExtent");return p.equals(m)?m:p}},v={type:_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_1__["default"],readOnly:!0,json:{origins:{service:{read:{source:["fullExtent","spatialReference"],reader:(e,n)=>{const t=_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_1__["default"].fromJSON(e);return null!=n.spatialReference&&"object"==typeof n.spatialReference&&(t.spatialReference=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(n.spatialReference)),t}}}},read:!1}},j={type:String,json:{origins:{service:{read:!1},"portal-item":{read:!1}}}},b={type:Number,json:{origins:{service:{write:{enabled:!1}}},read:{source:"layerDefinition.minScale"},write:{target:"layerDefinition.minScale"}}},I={type:Number,json:{origins:{service:{write:{enabled:!1}}},read:{source:"layerDefinition.maxScale"},write:{target:"layerDefinition.maxScale"}}};


/***/ }),

/***/ "../node_modules/@arcgis/core/support/timeUtils.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/support/timeUtils.js ***!
  \*********************************************************/
/*! exports provided: getTimeExtentFromLayers, toLocalTimeExtent, toUTCTimeExtent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTimeExtentFromLayers", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toLocalTimeExtent", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toUTCTimeExtent", function() { return a; });
/* harmony import */ var _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../TimeExtent.js */ "../node_modules/@arcgis/core/TimeExtent.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/timeUtils.js */ "../node_modules/@arcgis/core/core/timeUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function m(t){return"feature"===(null==t?void 0:t.type)}function s(t){return"map-image"===(null==t?void 0:t.type)}function f(t){return void 0!==t.timeInfo}async function u(n,r){if(0===n.length)return _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"].allTime;const u=n.filter(f);await Promise.all(u.map((t=>t.load({signal:r}))));const a=[],l=[];for(const t of u)(m(t)||s(t))&&t.timeInfo.hasLiveData?a.push(t):l.push(t);const c=t=>Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(t)||t.isAllTime,p=l.map((t=>t.timeInfo.fullTimeExtent));if(p.some(c))return _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"].allTime;const T=a.map((async t=>{const{timeExtent:n}=await t.fetchRecomputedExtents({signal:r});return n||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["unwrap"])(t.timeInfo.fullTimeExtent)})),d=(await Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["eachAlways"])(T)).map((t=>t.value));if(d.some(c))return _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"].allTime;return d.concat(p).reduce(((t,e)=>t.union(e)))}function a(e){if(!e)return e;const{start:i,end:o}=e;return new _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"]({start:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(i)?Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(i,-i.getTimezoneOffset(),"minutes"):i,end:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(o)?Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(o,-o.getTimezoneOffset(),"minutes"):o})}function l(e){if(!e)return e;const{start:i,end:o}=e;return new _TimeExtent_js__WEBPACK_IMPORTED_MODULE_0__["default"]({start:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(i)?Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(i,i.getTimezoneOffset(),"minutes"):i,end:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(o)?Object(_core_timeUtils_js__WEBPACK_IMPORTED_MODULE_3__["offsetDate"])(o,o.getTimezoneOffset(),"minutes"):o})}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/ElevationInfo.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/ElevationInfo.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return x; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _FeatureExpressionInfo_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./FeatureExpressionInfo.js */ "../node_modules/@arcgis/core/symbols/support/FeatureExpressionInfo.js");
/* harmony import */ var _unitConversionUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./unitConversionUtils.js */ "../node_modules/@arcgis/core/symbols/support/unitConversionUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;const m=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["strict"])()({onTheGround:"on-the-ground",relativeToGround:"relative-to-ground",relativeToScene:"relative-to-scene",absoluteHeight:"absolute-height"}),d=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({foot:"feet",kilometer:"kilometers",meter:"meters",mile:"miles","us-foot":"us-feet",yard:"yards"});let c=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.offset=null}readFeatureExpressionInfo(e,r){return null!=e?e:r.featureExpression&&0===r.featureExpression.value?{expression:"0"}:void 0}writeFeatureExpressionInfo(e,r,o,t){r[o]=e.write(null,t),"0"===e.expression&&(r.featureExpression={value:0})}get mode(){const{offset:e,featureExpressionInfo:r}=this;return this._isOverridden("mode")?this._get("mode"):Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(e)||r?"relative-to-ground":"on-the-ground"}set mode(e){this._override("mode",e)}set unit(e){this._set("unit",e)}write(e,r){return this.offset||this.mode||this.featureExpressionInfo||this.unit?super.write(e,r):null}clone(){return new l({mode:this.mode,offset:this.offset,featureExpressionInfo:this.featureExpressionInfo?this.featureExpressionInfo.clone():void 0,unit:this.unit})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_FeatureExpressionInfo_js__WEBPACK_IMPORTED_MODULE_11__["default"],json:{write:!0}})],c.prototype,"featureExpressionInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("featureExpressionInfo",["featureExpressionInfo","featureExpression"])],c.prototype,"readFeatureExpressionInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("featureExpressionInfo",{featureExpressionInfo:{type:_FeatureExpressionInfo_js__WEBPACK_IMPORTED_MODULE_11__["default"]},"featureExpression.value":{type:[0]}})],c.prototype,"writeFeatureExpressionInfo",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:m.apiValues,nonNullable:!0,json:{type:m.jsonValues,read:m.read,write:{writer:m.write,isRequired:!0}}})],c.prototype,"mode",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{write:!0}})],c.prototype,"offset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_unitConversionUtils_js__WEBPACK_IMPORTED_MODULE_12__["supportedUnits"],json:{type:String,read:d.read,write:d.write}})],c.prototype,"unit",null),c=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.layers.support.ElevationInfo")],c);var x=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/FeatureExpressionInfo.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/FeatureExpressionInfo.js ***!
  \*****************************************************************************/
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
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{async collectRequiredFields(r,e){return Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_7__["collectArcadeFieldNames"])(r,e,this.expression)}clone(){return new p({expression:this.expression,title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],i.prototype,"expression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],i.prototype,"title",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.support.FeatureExpressionInfo")],i);var c=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/unitConversionUtils.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/unitConversionUtils.js ***!
  \***************************************************************************/
/*! exports provided: getMetersPerUnit, supportedUnits, supportsUnit */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMetersPerUnit", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedUnits", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportsUnit", function() { return n; });
/* harmony import */ var _renderers_support_lengthUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../renderers/support/lengthUtils.js */ "../node_modules/@arcgis/core/renderers/support/lengthUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){return null!=_renderers_support_lengthUtils_js__WEBPACK_IMPORTED_MODULE_0__["meterIn"][n]}function r(n){return 1/(_renderers_support_lengthUtils_js__WEBPACK_IMPORTED_MODULE_0__["meterIn"][n]||1)}function e(){const n=Object.keys(_renderers_support_lengthUtils_js__WEBPACK_IMPORTED_MODULE_0__["meterIn"]);return n.sort(),n}const o=e();


/***/ })

};;
//# sourceMappingURL=2.render-page.js.map
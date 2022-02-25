exports.ids = [39];
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

/***/ "../node_modules/@arcgis/core/intl.js":
/*!********************************************!*\
  !*** ../node_modules/@arcgis/core/intl.js ***!
  \********************************************/
/*! exports provided: convertDateFormatToIntlOptions, formatDate, convertNumberFormatToIntlOptions, formatNumber, substitute, getLocale, onLocaleChange, prefersRTL, setLocale, fetchMessageBundle, normalizeMessageBundleLocale, registerMessageBundleLoader, createJSONLoader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _intl_date_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./intl/date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "convertDateFormatToIntlOptions", function() { return _intl_date_js__WEBPACK_IMPORTED_MODULE_0__["convertDateFormatToIntlOptions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "formatDate", function() { return _intl_date_js__WEBPACK_IMPORTED_MODULE_0__["formatDate"]; });

/* harmony import */ var _intl_number_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./intl/number.js */ "../node_modules/@arcgis/core/intl/number.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "convertNumberFormatToIntlOptions", function() { return _intl_number_js__WEBPACK_IMPORTED_MODULE_1__["convertNumberFormatToIntlOptions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "formatNumber", function() { return _intl_number_js__WEBPACK_IMPORTED_MODULE_1__["formatNumber"]; });

/* harmony import */ var _intl_substitute_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./intl/substitute.js */ "../node_modules/@arcgis/core/intl/substitute.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "substitute", function() { return _intl_substitute_js__WEBPACK_IMPORTED_MODULE_2__["substitute"]; });

/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getLocale", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["getLocale"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "onLocaleChange", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["onLocaleChange"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "prefersRTL", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["prefersRTL"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setLocale", function() { return _intl_locale_js__WEBPACK_IMPORTED_MODULE_3__["setLocale"]; });

/* harmony import */ var _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./intl/messages.js */ "../node_modules/@arcgis/core/intl/messages.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "fetchMessageBundle", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["fetchMessageBundle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "normalizeMessageBundleLocale", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["normalizeMessageBundleLocale"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "registerMessageBundleLoader", function() { return _intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["registerMessageBundleLoader"]; });

/* harmony import */ var _intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./intl/t9n.js */ "../node_modules/@arcgis/core/intl/t9n.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createJSONLoader", function() { return _intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__["createJSONLoader"]; });

/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./assets.js */ "../node_modules/@arcgis/core/assets.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
Object(_intl_messages_js__WEBPACK_IMPORTED_MODULE_4__["registerMessageBundleLoader"])(Object(_intl_t9n_js__WEBPACK_IMPORTED_MODULE_5__["createJSONLoader"])({pattern:"esri/",location:_assets_js__WEBPACK_IMPORTED_MODULE_6__["getAssetUrl"]}));


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/date.js":
/*!*************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/date.js ***!
  \*************************************************/
/*! exports provided: convertDateFormatToIntlOptions, dateFormats, dictionary, formatDate, fromJSON, getDateTimeFormatter, toJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertDateFormatToIntlOptions", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dateFormats", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dictionary", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatDate", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDateTimeFormatter", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toJSON", function() { return y; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const r={year:"numeric",month:"numeric",day:"numeric"},n={year:"numeric",month:"long",day:"numeric"},a={year:"numeric",month:"short",day:"numeric"},h={year:"numeric",month:"long",weekday:"long",day:"numeric"},m={hour:"numeric",minute:"numeric"},i={...m,second:"numeric"},s={"short-date":r,"short-date-short-time":{...r,...m},"short-date-short-time-24":{...r,...m,hour12:!1},"short-date-long-time":{...r,...i},"short-date-long-time-24":{...r,...i,hour12:!1},"short-date-le":r,"short-date-le-short-time":{...r,...m},"short-date-le-short-time-24":{...r,...m,hour12:!1},"short-date-le-long-time":{...r,...i},"short-date-le-long-time-24":{...r,...i,hour12:!1},"long-month-day-year":n,"long-month-day-year-short-time":{...n,...m},"long-month-day-year-short-time-24":{...n,...m,hour12:!1},"long-month-day-year-long-time":{...n,...i},"long-month-day-year-long-time-24":{...n,...i,hour12:!1},"day-short-month-year":a,"day-short-month-year-short-time":{...a,...m},"day-short-month-year-short-time-24":{...a,...m,hour12:!1},"day-short-month-year-long-time":{...a,...i},"day-short-month-year-long-time-24":{...a,...i,hour12:!1},"long-date":h,"long-date-short-time":{...h,...m},"long-date-short-time-24":{...h,...m,hour12:!1},"long-date-long-time":{...h,...i},"long-date-long-time-24":{...h,...i,hour12:!1},"long-month-year":{month:"long",year:"numeric"},"short-month-year":{month:"short",year:"numeric"},year:{year:"numeric"},"short-time":m,"long-time":i},l=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({shortDate:"short-date",shortDateShortTime:"short-date-short-time",shortDateShortTime24:"short-date-short-time-24",shortDateLongTime:"short-date-long-time",shortDateLongTime24:"short-date-long-time-24",shortDateLE:"short-date-le",shortDateLEShortTime:"short-date-le-short-time",shortDateLEShortTime24:"short-date-le-short-time-24",shortDateLELongTime:"short-date-le-long-time",shortDateLELongTime24:"short-date-le-long-time-24",longMonthDayYear:"long-month-day-year",longMonthDayYearShortTime:"long-month-day-year-short-time",longMonthDayYearShortTime24:"long-month-day-year-short-time-24",longMonthDayYearLongTime:"long-month-day-year-long-time",longMonthDayYearLongTime24:"long-month-day-year-long-time-24",dayShortMonthYear:"day-short-month-year",dayShortMonthYearShortTime:"day-short-month-year-short-time",dayShortMonthYearShortTime24:"day-short-month-year-short-time-24",dayShortMonthYearLongTime:"day-short-month-year-long-time",dayShortMonthYearLongTime24:"day-short-month-year-long-time-24",longDate:"long-date",longDateShortTime:"long-date-short-time",longDateShortTime24:"long-date-short-time-24",longDateLongTime:"long-date-long-time",longDateLongTime24:"long-date-long-time-24",longMonthYear:"long-month-year",shortMonthYear:"short-month-year",year:"year"}),g=l.apiValues,y=l.toJSON.bind(l),d=l.fromJSON.bind(l),u={ar:"ar-u-nu-latn-ca-gregory"};let c=new WeakMap,D=s["short-date-short-time"];function T(t){const o=t||D;if(!c.has(o)){const t=Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])(),r=u[Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])()]||t;c.set(o,new Intl.DateTimeFormat(r,o))}return c.get(o)}function S(t){return s[t]||null}function L(t,o){return T(o).format(t)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["beforeLocaleChange"])((()=>{c=new WeakMap,D=s["short-date-short-time"]}));


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

/***/ "../node_modules/@arcgis/core/intl/messages.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/messages.js ***!
  \*****************************************************/
/*! exports provided: fetchMessageBundle, normalizeMessageBundleLocale, registerMessageBundleLoader, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchMessageBundle", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeMessageBundleLocale", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerMessageBundleLoader", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return p; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=/^([a-z]{2})(?:[-_]([A-Za-z]{2}))?$/,o={ar:!0,bs:!0,ca:!0,cs:!0,da:!0,de:!0,el:!0,en:!0,es:!0,et:!0,fi:!0,fr:!0,he:!0,hr:!0,hu:!0,id:!0,it:!0,ja:!0,ko:!0,lt:!0,lv:!0,nb:!0,nl:!0,pl:!0,"pt-BR":!0,"pt-PT":!0,ro:!0,ru:!0,sk:!0,sl:!0,sr:!0,sv:!0,th:!0,tr:!0,uk:!0,vi:!0,"zh-CN":!0,"zh-HK":!0,"zh-TW":!0};function i(t){var e;return null!=(e=o[t])&&e}const a=[],c=new Map;function d(t){for(const e of c.keys())m(t.pattern,e)&&c.delete(e)}function l(t){return a.includes(t)||(d(t),a.unshift(t)),{remove(){const e=a.indexOf(t);e>-1&&(a.splice(e,1),d(t))}}}async function u(t){const e=Object(_locale_js__WEBPACK_IMPORTED_MODULE_2__["getLocale"])();c.has(t)||c.set(t,f(t,e));const n=c.get(t);return await _.add(n),n}function h(t){if(!s.test(t))return null;const[,e,n]=s.exec(t),r=e+(n?"-"+n.toUpperCase():"");return i(r)?r:i(e)?e:null}async function f(e,n){const r=[];for(const t of a)if(m(t.pattern,e))try{return await t.fetchMessageBundle(e,n)}catch(s){r.push(s)}if(r.length)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("intl:message-bundle-error",`Errors occurred while loading "${e}"`,{errors:r});throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("intl:no-message-bundle-loader",`No loader found for message bundle "${e}"`)}function m(t,e){return"string"==typeof t?e.startsWith(t):t.test(e)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_2__["beforeLocaleChange"])((()=>{c.clear()}));const _=new class{constructor(){this._numLoading=0}async waitForAll(){this._dfd&&await this._dfd.promise}add(t){return this._increase(),t.then((()=>this._decrease()),(()=>this._decrease())),this.waitForAll()}_increase(){this._numLoading++,this._dfd||(this._dfd=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["createDeferred"])())}_decrease(){this._numLoading=Math.max(this._numLoading-1,0),this._dfd&&0===this._numLoading&&(this._dfd.resolve(),this._dfd=null)}},p={cache:c,loaders:a};


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/number.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/number.js ***!
  \***************************************************/
/*! exports provided: convertNumberFormatToIntlOptions, formatNumber, getFormatter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertNumberFormatToIntlOptions", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatNumber", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFormatter", function() { return i; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a={ar:"ar-u-nu-latn"};let e=new WeakMap,o={};function i(n){const i=n||o;if(!e.has(i)){const t=Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])(),o=a[Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])()]||t;e.set(i,new Intl.NumberFormat(o,n))}return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["assumeNonNull"])(e.get(i))}function u(t={}){const n={};return null!=t.digitSeparator&&(n.useGrouping=t.digitSeparator),null!=t.places&&(n.minimumFractionDigits=n.maximumFractionDigits=t.places),n}function m(t,n){return i(n).format(t)}Object(_locale_js__WEBPACK_IMPORTED_MODULE_1__["beforeLocaleChange"])((()=>{e=new WeakMap,o={}}));


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/substitute.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/substitute.js ***!
  \*******************************************************/
/*! exports provided: substitute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "substitute", function() { return s; });
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _date_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony import */ var _number_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./number.js */ "../node_modules/@arcgis/core/intl/number.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=_core_Logger_js__WEBPACK_IMPORTED_MODULE_0__["default"].getLogger("esri.intl");function s(t,r,n={}){const{format:o={}}=n;return Object(_core_string_js__WEBPACK_IMPORTED_MODULE_2__["replace"])(t,(t=>u(t,r,o)))}function u(t,e,n){let o,i;const s=t.indexOf(":");if(-1===s?o=t.trim():(o=t.slice(0,s).trim(),i=t.slice(s+1).trim()),!o)return"";const u=Object(_core_object_js__WEBPACK_IMPORTED_MODULE_1__["getDeepValue"])(o,e);if(null==u)return"";const m=n[i]||n[o];return m?c(u,m):i?a(u,i):f(u)}function c(t,r){switch(r.type){case"date":return Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t,r.intlOptions);case"number":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t,r.intlOptions);default:return i.warn("missing format descriptor for key {key}"),f(t)}}function a(t,r){switch(r.toLowerCase()){case"dateformat":return Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t);case"numberformat":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t);default:return i.warn(`inline format is unsupported since 4.12: ${r}`),/^(dateformat|datestring)/i.test(r)?Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t):/^numberformat/i.test(r)?Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t):f(t)}}function f(t){switch(typeof t){case"string":return t;case"number":return Object(_number_js__WEBPACK_IMPORTED_MODULE_4__["formatNumber"])(t);case"boolean":return""+t;default:return t instanceof Date?Object(_date_js__WEBPACK_IMPORTED_MODULE_3__["formatDate"])(t):""}}


/***/ }),

/***/ "../node_modules/@arcgis/core/intl/t9n.js":
/*!************************************************!*\
  !*** ../node_modules/@arcgis/core/intl/t9n.js ***!
  \************************************************/
/*! exports provided: JSONLoader, createJSONLoader, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JSONLoader", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createJSONLoader", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return l; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_global_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/global.js */ "../node_modules/@arcgis/core/core/global.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./messages.js */ "../node_modules/@arcgis/core/intl/messages.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function s(e,n,r,s){const a=n.exec(r);if(!a)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("esri-intl:invalid-bundle",`Bundle id "${r}" is not compatible with the pattern "${n}"`);const c=a[1]?`${a[1]}/`:"",l=a[2],h=Object(_messages_js__WEBPACK_IMPORTED_MODULE_4__["normalizeMessageBundleLocale"])(s),u=`${c}${l}.json`,w=h?`${c}${l}_${h}.json`:u;let f;try{f=await i(e(w))}catch(d){if(w===u)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("intl:unknown-bundle",`Bundle "${r}" cannot be loaded`,{error:d});try{f=await i(e(u))}catch(d){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("intl:unknown-bundle",`Bundle "${r}" cannot be loaded`,{error:d})}}return f}async function i(t){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(l.fetchBundleAsset))return l.fetchBundleAsset(t);const n=await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t,{responseType:"text"});return JSON.parse(n.data)}class a{constructor({base:e="",pattern:t,location:r=new URL(window.location.href)}){let o;o="string"==typeof r?e=>new URL(e,new URL(r,_core_global_js__WEBPACK_IMPORTED_MODULE_2__["default"].location)).href:r instanceof URL?e=>new URL(e,r).href:r,this.pattern="string"==typeof t?new RegExp(`^${t}`):t,this.getAssetUrl=o,e=e?e.endsWith("/")?e:e+"/":"",this.matcher=new RegExp(`^${e}(?:(.*)/)?(.*)$`)}fetchMessageBundle(e,t){return s(this.getAssetUrl,this.matcher,e,t)}}function c(e){return new a(e)}const l={};


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

/***/ "../node_modules/@arcgis/core/layers/support/DimensionalDefinition.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/DimensionalDefinition.js ***!
  \****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
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
var a;let p=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(e){super(e),this.variableName=null,this.dimensionName=null,this.values=[],this.isSlice=!1}clone(){return new a({variableName:this.variableName,dimensionName:this.dimensionName,values:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.values),isSlice:this.isSlice})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"variableName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"dimensionName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["types"].array(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["types"].oneOf([_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["types"].native(Number),_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["types"].array(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["types"].native(Number))])),json:{write:!0}})],p.prototype,"values",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],p.prototype,"isSlice",void 0),p=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.support.DimensionalDefinition")],p);var n=p;


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

/***/ "../node_modules/@arcgis/core/layers/support/RasterJobHandler.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/RasterJobHandler.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return t; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_workers_workers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/workers/workers.js */ "../node_modules/@arcgis/core/core/workers/workers.js");
/* harmony import */ var _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PixelBlock.js */ "../node_modules/@arcgis/core/layers/support/PixelBlock.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class t{constructor(){this._workerThread=null,this._destroyed=!1}async initialize(){const e=await Object(_core_workers_workers_js__WEBPACK_IMPORTED_MODULE_2__["open"])("RasterWorker");this._destroyed?e.close():this._workerThread=e}destroy(){this._destroyed=!0,this._workerThread&&(this._workerThread.close(),this._workerThread=null)}async convertVectorFieldData(r,o){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");const t=await this._workerThread.invoke("convertVectorFieldData",{pixelBlock:r.pixelBlock.toJSON(),type:r.dataType},o);return t?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"](t):null}async decode(r,o){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");const t=await this._workerThread.invoke("decode",r,o);return t?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"](t):null}async symbolize(o,t){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");const i={extent:o.extent&&o.extent.toJSON(),pixelBlock:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(o.pixelBlock)&&o.pixelBlock.toJSON(),simpleStretchParams:o.simpleStretchParams,bandIds:o.bandIds},a=await this._workerThread.invoke("symbolize",i,t);return a?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"](a):null}async updateSymbolizer(r,o){var n;if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");const t=null==r||null==(n=r.rendererJSON)?void 0:n.histograms;await Promise.all(this._workerThread.broadcast("updateSymbolizer",{symbolizerJSON:r.toJSON(),histograms:t},o))}async stretch(r,o){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");if(null==r||!r.pixelBlock)return null;const t={srcPixelBlock:r.pixelBlock.toJSON(),stretchParams:r.stretchParams},i=await this._workerThread.invoke("stretch",t,o);return i?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"](i):null}async split(r,o){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");if(null==r||!r.pixelBlock)return null;const t={srcPixelBlock:r.pixelBlock.toJSON(),tileSize:r.tileSize,maximumPyramidLevel:r.maximumPyramidLevel},i=await this._workerThread.invoke("split",t,o);return i&&i.forEach(((e,r)=>{i.set(r,e?_PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromJSON(e):null)})),Promise.resolve(i)}async estimateStatisticsHistograms(r,o){if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");if(null==r||!r.pixelBlock)return null;const n={srcPixelBlock:r.pixelBlock.toJSON()},t=await this._workerThread.invoke("estimateStatisticsHistograms",n,o);return Promise.resolve(t)}async mosaicAndTransform(o,t){var i;if(!this._workerThread)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("raster-jobhandler:no-connection","no available worker connection");if(null==o||null==(i=o.srcPixelBlocks)||!i.length)return null;const a={...o,srcPixelBlocks:o.srcPixelBlocks.map((e=>Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e)?e.toJSON():null))},l=await this._workerThread.invoke("mosaicAndTransform",a,t);return l?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_3__["default"](l):null}}


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

/***/ "../node_modules/@arcgis/core/layers/support/rasterEnums.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/rasterEnums.js ***!
  \******************************************************************/
/*! exports provided: interpolationKebab, noDataInterpretationKebab */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "interpolationKebab", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noDataInterpretationKebab", function() { return i; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({RSP_NearestNeighbor:"nearest",RSP_BilinearInterpolation:"bilinear",RSP_CubicConvolution:"cubic",RSP_Majority:"majority"}),i=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({esriNoDataMatchAny:"any",esriNoDataMatchAll:"all"});


/***/ }),

/***/ "../node_modules/@arcgis/core/rasterRenderers.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/rasterRenderers.js ***!
  \*******************************************************/
/*! exports provided: ClassBreaksRenderer, RasterColormapRenderer, RasterShadedReliefRenderer, RasterStretchRenderer, UniqueValueRenderer, VectorFieldRenderer, fromJSON, rasterRendererTypes, read, websceneRasterRendererTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rasterRendererTypes", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "websceneRasterRendererTypes", function() { return i; });
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _renderers_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderers/ClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ClassBreaksRenderer", function() { return _renderers_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _renderers_RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderers/RasterColormapRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterColormapRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RasterColormapRenderer", function() { return _renderers_RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _renderers_RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./renderers/RasterShadedReliefRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterShadedReliefRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RasterShadedReliefRenderer", function() { return _renderers_RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _renderers_RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./renderers/RasterStretchRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterStretchRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RasterStretchRenderer", function() { return _renderers_RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _renderers_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./renderers/UniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UniqueValueRenderer", function() { return _renderers_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _renderers_VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./renderers/VectorFieldRenderer.js */ "../node_modules/@arcgis/core/renderers/VectorFieldRenderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VectorFieldRenderer", function() { return _renderers_VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const d={key:"type",base:null,typeMap:{"unique-value":_renderers_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_5__["default"],"class-breaks":_renderers_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"],"raster-colormap":_renderers_RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"],"raster-stretch":_renderers_RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_4__["default"],"vector-field":_renderers_VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_6__["default"],"raster-shaded-relief":_renderers_RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"]}},i={...d,typeMap:{...d.typeMap}};delete i.typeMap["vector-field"];const l={uniqueValue:_renderers_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_5__["default"],classBreaks:_renderers_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"],rasterStretch:_renderers_RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_4__["default"],rasterColormap:_renderers_RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"],vectorField:_renderers_VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_6__["default"],rasterShadedRelief:_renderers_RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"]};function f(e){return e&&l[e.type]||null}function p(r,s){if(!r)return null;if("classBreaks"===r.type&&r.classificationMethod){const e=r.authoringInfo||{classificationMethod:""};e.classificationMethod=r.classificationMethod,r.authoringInfo=e}const t=f(r);if(t){const e=new t;return e.read(r,s),e}return s&&s.messages&&r&&s.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_0__["default"]("renderer:unsupported","Renderers of type '"+(r.type||"unknown")+"' are not supported",{definition:r,context:s})),null}function u(e,r){return p(e,r)}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/RasterColormapRenderer.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/RasterColormapRenderer.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_ColormapInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./support/ColormapInfo.js */ "../node_modules/@arcgis/core/renderers/support/ColormapInfo.js");
/* harmony import */ var _support_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/colorRampUtils.js */ "../node_modules/@arcgis/core/renderers/support/colorRampUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let l=c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.colormapInfos=null,this.type="raster-colormap"}static createFromColormap(o,r){if(!o)return null;const t=5===o[0].length,e=[...o].sort((o=>o[0][0]-o[1][0])).map((o=>{var e;return _support_ColormapInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"].fromJSON({value:o[0],color:t?o.slice(1,5):o.slice(1,4).concat([255]),label:r?null!=(e=r[o[0]])?e:"":o[0]})}));return new c({colormapInfos:e})}static createFromColorramp(o){const r=Object(_support_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_9__["convertColorRampToColormap"])(o,256);return c.createFromColormap(r)}clone(){return new c({colormapInfos:this.colormapInfos.map((o=>o.toJSON()))})}extractColormap(){return this.colormapInfos.map((o=>[o.value,o.color.r,o.color.g,o.color.b,o.color.a>1?o.color.a:255*o.color.a&255])).sort(((o,r)=>o[0]-r[0]))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_support_ColormapInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{write:!0}})],l.prototype,"colormapInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({rasterColormap:"raster-colormap"})],l.prototype,"type",void 0),l=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.RasterColormapRenderer")],l);var m=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/RasterShadedReliefRenderer.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/RasterShadedReliefRenderer.js ***!
  \****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../rest/support/colorRamps.js */ "../node_modules/@arcgis/core/rest/support/colorRamps.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let d=c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(e){super(e),this.altitude=45,this.azimuth=315,this.colorRamp=null,this.hillshadeType="multi-directional",this.pixelSizePower=.664,this.pixelSizeFactor=.024,this.scalingType="none",this.type="raster-shaded-relief",this.zFactor=1}readColorRamp(e){return Object(_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_10__["fromJSON"])(e)}clone(){return new c({hillshadeType:this.hillshadeType,altitude:this.altitude,azimuth:this.azimuth,zFactor:this.zFactor,scalingType:this.scalingType,pixelSizeFactor:this.pixelSizeFactor,pixelSizePower:this.pixelSizePower,colorRamp:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.colorRamp)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"altitude",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"azimuth",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_10__["types"],json:{write:!0}})],d.prototype,"colorRamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("colorRamp")],d.prototype,"readColorRamp",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["traditional","multi-directional"],json:{write:!0}})],d.prototype,"hillshadeType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"pixelSizePower",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"pixelSizeFactor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["none","adjusted"],json:{write:!0}})],d.prototype,"scalingType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({rasterShadedRelief:"raster-shaded-relief"})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"zFactor",void 0),d=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.renderers.RasterShadedReliefRenderer")],d);var m=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/RasterStretchRenderer.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/RasterStretchRenderer.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/stretchRendererUtils.js */ "../node_modules/@arcgis/core/renderers/support/stretchRendererUtils.js");
/* harmony import */ var _rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../rest/support/colorRamps.js */ "../node_modules/@arcgis/core/rest/support/colorRamps.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let h=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(t){super(t),this.colorRamp=null,this.computeGamma=!1,this.dynamicRangeAdjustment=!1,this.gamma=[],this.maxPercent=null,this.minPercent=null,this.numberOfStandardDeviations=null,this.outputMax=null,this.outputMin=null,this.sigmoidStrengthLevel=null,this.statistics=[],this.histograms=null,this.useGamma=!1,this.stretchType="none",this.type="raster-stretch"}readColorRamp(t){if(t)return Object(_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__["fromJSON"])(t)}writeStatistics(t,e,r){var o;null!=(o=t)&&o.length&&(Array.isArray(t[0])||(t=t.map((t=>[t.min,t.max,t.avg,t.stddev]))),e[r]=t)}readStretchType(t,e){let r=e.stretchType;return"number"==typeof r&&(r=_support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__["stretchTypeFunctionEnum"][r]),_support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__["stretchTypeJSONDict"].read(r)}clone(){return new d({stretchType:this.stretchType,outputMin:this.outputMin,outputMax:this.outputMax,useGamma:this.useGamma,computeGamma:this.computeGamma,statistics:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.statistics),gamma:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.gamma),sigmoidStrengthLevel:this.sigmoidStrengthLevel,numberOfStandardDeviations:this.numberOfStandardDeviations,minPercent:this.minPercent,maxPercent:this.maxPercent,colorRamp:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.colorRamp),histograms:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.histograms),dynamicRangeAdjustment:this.dynamicRangeAdjustment})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__["types"],json:{write:!0}})],h.prototype,"colorRamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("colorRamp")],h.prototype,"readColorRamp",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],h.prototype,"computeGamma",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:{target:"dra"},read:{source:"dra"}}})],h.prototype,"dynamicRangeAdjustment",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[Number],json:{write:!0}})],h.prototype,"gamma",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],h.prototype,"maxPercent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],h.prototype,"minPercent",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],h.prototype,"numberOfStandardDeviations",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{read:{source:"max"},write:{target:"max"}}})],h.prototype,"outputMax",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{read:{source:"min"},write:{target:"min"}}})],h.prototype,"outputMin",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],h.prototype,"sigmoidStrengthLevel",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{type:[[Number]],write:!0}})],h.prototype,"statistics",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],h.prototype,"histograms",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("statistics")],h.prototype,"writeStatistics",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],h.prototype,"useGamma",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__["stretchTypeJSONDict"].apiValues,json:{type:_support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__["stretchTypeJSONDict"].jsonValues,write:_support_stretchRendererUtils_js__WEBPACK_IMPORTED_MODULE_11__["stretchTypeJSONDict"].write}})],h.prototype,"stretchType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("stretchType",["stretchType"])],h.prototype,"readStretchType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({rasterStretch:"raster-stretch"})],h.prototype,"type",void 0),h=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.renderers.RasterStretchRenderer")],h);var y=h;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/VectorFieldRenderer.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/VectorFieldRenderer.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return E; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _Graphic_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Graphic.js */ "../node_modules/@arcgis/core/Graphic.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../geometry/support/normalizeUtils.js */ "../node_modules/@arcgis/core/geometry/support/normalizeUtils.js");
/* harmony import */ var _layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../layers/support/rasterFunctions/vectorFieldUtils.js */ "../node_modules/@arcgis/core/layers/support/rasterFunctions/vectorFieldUtils.js");
/* harmony import */ var _ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./ClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./support/ClassBreakInfo.js */ "../node_modules/@arcgis/core/renderers/support/ClassBreakInfo.js");
/* harmony import */ var _visualVariables_RotationVariable_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./visualVariables/RotationVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/RotationVariable.js");
/* harmony import */ var _visualVariables_SizeVariable_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./visualVariables/SizeVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/SizeVariable.js");
/* harmony import */ var _visualVariables_support_visualVariableUtils_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./visualVariables/support/visualVariableUtils.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/visualVariableUtils.js");
/* harmony import */ var _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../symbols/SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony import */ var _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../symbols/SimpleMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js");
/* harmony import */ var _symbols_support_utils_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../symbols/support/utils.js */ "../node_modules/@arcgis/core/symbols/support/utils.js");
/* harmony import */ var _geometry_Point_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../geometry/Point.js */ "../node_modules/@arcgis/core/geometry/Point.js");
/* harmony import */ var _symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../symbols/PictureMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var z;const u=new Set(["esriMetersPerSecond","esriKilometersPerHour","esriKnots","esriFeetPerSecond","esriMilesPerHour"]),Z=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_5__["JSONMap"]({beaufort_ft:"beaufort-ft",beaufort_km:"beaufort-km",beaufort_kn:"beaufort-kn",beaufort_m:"beaufort-m",beaufort_mi:"beaufort-mi",classified_arrow:"classified-arrow",ocean_current_kn:"ocean-current-kn",ocean_current_m:"ocean-current-m",simple_scalar:"simple-scalar",single_arrow:"single-arrow",wind_speed:"wind-barb"}),b=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_5__["JSONMap"]({flow_from:"flow-from",flow_to:"flow-to"});let h=z=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_19__["VisualVariablesMixin"])(_core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_6__["JSONSupport"])){constructor(e){super(e),this.attributeField="Magnitude",this.flowRepresentation="flow-from",this.rotationType="arithmetic",this.style="single-arrow",this.symbolTileSize=50,this.type="vector-field"}readInputUnit(e,M){return u.has(e)?_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].fromJSON(e):null}readOutputUnit(e,M){return u.has(e)?_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].fromJSON(e):null}get styleRenderer(){const e=this.style,M=this.attributeField,i=this._createStyleRenderer(e);return i.field=M,i}get sizeVariables(){const e=[];if(this.visualVariables)for(const M of this.visualVariables)"size"===M.type&&e.push(M);if(0===e.length){const M=new _visualVariables_SizeVariable_js__WEBPACK_IMPORTED_MODULE_22__["default"]({field:"Magnitude",minSize:.2*this.symbolTileSize,maxSize:.8*this.symbolTileSize});this.visualVariables?this.visualVariables.push(M):this._set("visualVariables",[M]),e.push(M)}return e}get rotationVariables(){const e=[];if(this.visualVariables)for(const M of this.visualVariables)"rotation"===M.type&&e.push(M);if(0===e.length){const M=new _visualVariables_RotationVariable_js__WEBPACK_IMPORTED_MODULE_21__["default"]({field:"Direction",rotationType:this.rotationType});this.visualVariables?this.visualVariables.push(M):this._set("visualVariables",[M]),e.push(M)}return e}clone(){return new z({attributeField:this.attributeField,flowRepresentation:this.flowRepresentation,rotationType:this.rotationType,symbolTileSize:this.symbolTileSize,style:this.style,visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_7__["clone"])(this.visualVariables),inputUnit:this.inputUnit,outputUnit:this.outputUnit})}async getGraphicsFromPixelData(e,M=!1,a=[]){const t=new Array,I=Object(_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["getUnitConversionFactor"])(this.inputUnit,this.outputUnit),g=M?Object(_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["convertVectorFieldData"])(e.pixelBlock,"vector-uv",this.rotationType,I):Object(_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["convertVectorFieldUnit"])(e.pixelBlock,"vector-magdir",I);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_8__["isNone"])(g))return t;const o=e.extent,A=g.mask&&g.mask.length>0;let s=0;const l=(o.xmax-o.xmin)/g.width,w=(o.ymax-o.ymin)/g.height;for(let r=0;r<g.height;r++)for(let e=0;e<g.width;e++,s++){let M=new _geometry_Point_js__WEBPACK_IMPORTED_MODULE_27__["default"]({x:o.xmin+e*l+l/2,y:o.ymax-r*w-w/2,spatialReference:o.spatialReference});M=(await Object(_geometry_support_normalizeUtils_js__WEBPACK_IMPORTED_MODULE_16__["normalizeCentralMeridian"])(M))[0];const I=a.some((e=>e.intersects(M)));if((!A||g.mask[s])&&!I){const e={Magnitude:g.pixels[0][s],Direction:g.pixels[1][s]},a=new _Graphic_js__WEBPACK_IMPORTED_MODULE_3__["default"]({geometry:{type:"point",x:M.x,y:M.y,spatialReference:o.spatialReference},attributes:e});a.symbol=this._getVisualVariablesAppliedSymbol(a),t.push(a)}}return t}getSymbol(e,M){}async getSymbolAsync(e,M){}getSymbols(){return[]}getClassBreakInfos(){var e;return null==(e=this.styleRenderer)?void 0:e.classBreakInfos}getDefaultSymbol(){var e;return null==(e=this.styleRenderer)?void 0:e.defaultSymbol}_getDefaultSymbol(e){return new _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"]({path:"M14,32 14,18 9,23 16,3 22,23 17,18 17,32 z",outline:new _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_24__["default"]({width:0}),size:20,color:e||new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,92,230])})}_getVisualVariablesAppliedSymbol(e){if(!e)return;let M=this.styleRenderer&&this.styleRenderer.getSymbol(e);M=M.clone();const i=this.sizeVariables,a=this.rotationVariables;if(i&&i.length&&this.sizeVariables.forEach((i=>Object(_symbols_support_utils_js__WEBPACK_IMPORTED_MODULE_26__["applySizesToSymbol"])(M,Object(_visualVariables_support_visualVariableUtils_js__WEBPACK_IMPORTED_MODULE_23__["getAllSizes"])([i],e)))),a&&a.length){const i=e.attributes.Direction;e.attributes.Direction="flow-from"===this.flowRepresentation?i:i+180,this.rotationVariables.forEach((i=>Object(_symbols_support_utils_js__WEBPACK_IMPORTED_MODULE_26__["applyRotationToSymbol"])(M,Object(_visualVariables_support_visualVariableUtils_js__WEBPACK_IMPORTED_MODULE_23__["getRotationAngle"])(i,e),i.axis)))}return M}_createStyleRenderer(e){let M={defaultSymbol:this._getDefaultSymbol(),classBreakInfos:[]};switch(e){case"single-arrow":M=this._createSingleArrowRenderer();break;case"beaufort-kn":M=this._createBeaufortKnotsRenderer();break;case"beaufort-m":M=this._createBeaufortMeterRenderer();break;case"beaufort-ft":M=this._createBeaufortFeetRenderer();break;case"beaufort-mi":M=this._createBeaufortMilesRenderer();break;case"beaufort-km":M=this._createBeaufortKilometersRenderer();break;case"ocean-current-m":M=this._createCurrentMeterRenderer();break;case"ocean-current-kn":M=this._createCurrentKnotsRenderer();break;case"simple-scalar":M=this._createSimpleScalarRenderer();break;case"wind-barb":M=this._createWindBarbsRenderer();break;case"classified-arrow":M=this._createClassifiedArrowRenderer()}return new _ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_18__["default"](M)}_createSingleArrowRenderer(){return{defaultSymbol:this._getDefaultSymbol()}}_createBeaufortKnotsRenderer(){const e=[0,1,3,6,10,16,21,27,33,40,47,55,63],i=[[40,146,199],[89,162,186],[129,179,171],[160,194,155],[191,212,138],[218,230,119],[250,250,100],[252,213,83],[252,179,102],[250,141,52],[247,110,42],[240,71,29]];return{defaultSymbol:this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([214,47,39])),classBreakInfos:this._getClassBreaks(e,i)}}_createBeaufortMeterRenderer(){const e=[0,.2,1.8,3.3,5.4,8.5,11,14.1,17.2,20.8,24.4,28.6,32.7],i=[[69,117,181],[101,137,184],[132,158,186],[162,180,189],[192,204,190],[222,227,191],[255,255,191],[255,220,161],[250,185,132],[245,152,105],[237,117,81],[232,21,21]];return{defaultSymbol:this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([214,47,39])),classBreakInfos:this._getClassBreaks(e,i)}}_createBeaufortFeetRenderer(){const e=this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([214,47,39]));let i=[0,.2,1.8,3.3,5.4,8.5,11,14.1,17.2,20.8,24.4,28.6,32.7];const a=[[69,117,181],[101,137,184],[132,158,186],[162,180,189],[192,204,190],[222,227,191],[255,255,191],[255,220,161],[250,185,132],[245,152,105],[237,117,81],[232,21,21]],t=3.28084;i=i.map((e=>e*t));return{defaultSymbol:e,classBreakInfos:this._getClassBreaks(i,a)}}_createBeaufortMilesRenderer(){const e=this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([214,47,39]));let i=[0,.2,1.8,3.3,5.4,8.5,11,14.1,17.2,20.8,24.4,28.6,32.7];const a=[[69,117,181],[101,137,184],[132,158,186],[162,180,189],[192,204,190],[222,227,191],[255,255,191],[255,220,161],[250,185,132],[245,152,105],[237,117,81],[232,21,21]],t=2.23694;i=i.map((e=>e*t));return{defaultSymbol:e,classBreakInfos:this._getClassBreaks(i,a)}}_createBeaufortKilometersRenderer(){const e=this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([214,47,39]));let i=[0,.2,1.8,3.3,5.4,8.5,11,14.1,17.2,20.8,24.4,28.6,32.7];const a=[[69,117,181],[101,137,184],[132,158,186],[162,180,189],[192,204,190],[222,227,191],[255,255,191],[255,220,161],[250,185,132],[245,152,105],[237,117,81],[232,21,21]],t=3.6;i=i.map((e=>e*t));return{defaultSymbol:e,classBreakInfos:this._getClassBreaks(i,a)}}_createCurrentMeterRenderer(){const e=[0,.5,1,1.5,2],i=[[78,26,153],[179,27,26],[202,128,26],[177,177,177]];return{defaultSymbol:this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([177,177,177])),classBreakInfos:this._getClassBreaks(e,i)}}_createCurrentKnotsRenderer(){const e=[0,.25,.5,1,1.5,2,2.5,3,3.5,4],i=[[0,0,0],[0,37,100],[78,26,153],[151,0,100],[179,27,26],[177,78,26],[202,128,26],[177,179,52],[177,177,177]];return{defaultSymbol:this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([177,177,177])),classBreakInfos:this._getClassBreaks(e,i)}}_createClassifiedArrowRenderer(){var e;const i=this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([56,168,0]));let a=[0,1e-6,3.5,7,10.5,14];if(null!=(e=this.sizeVariables)&&e.length){const e=this.sizeVariables[0].minDataValue,M=this.sizeVariables[0].maxDataValue;if(e&&M){const i=(M-e)/5;a=Array.from(Array(6).keys()).map((M=>e+i*M))}}const t=[[56,168,0],[139,309,0],[255,255,0],[255,128,0],[255,0,0]];return{defaultSymbol:i,classBreakInfos:this._getClassBreaks(a,t)}}_createSimpleScalarRenderer(){return{defaultSymbol:_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"].fromJSON({imageData:"iVBORw0KGgoAAAANSUhEUgAAACsAAAArCAQAAABLVLlLAAAABGdBTUEAAYagMeiWXwAAAAJiS0dEAACqjSMyAAAACXBIWXMAAABIAAAASABGyWs+AAAC3ElEQVRIx9XXvW4cVRQH8N982btpsIREJECyiCXsxX4DKh6AliqGKCBBE2SlwlHgAbBD/AKmyEYUeQ1KahPZSZQvBCkQLTHZ7KGY8Xodz4w3a1NwbzVzz/znfJ//zbStVC5q3icKak9GAs2QIdDx3PtW/S011NW3p+M5Eomh11ipTIKe6+4LQzHaQ+G+63pIZNJJQXMpljwTwj1brpgx5w1zZlyx5Z4QnllEIm2xeeSUHBf0hV0bejo1Uh09G3aFvgXk7cCJFBc9EdaRVuHJJaOdKyTV2TVhYLMduNR0Q9gxL5GaaTDw8GzejrDRBpxWoGsySRW0dttKuattwNkIlFw2YXgzOdYq4Ox49PlM+JrKd5OusjTWhBuVxUfMX/KXXZ3WEmkuqa67wspR4BTbwtKr/5u4fFgStse/T7EifFPnnYl9zPq4vmUOPrRndgoHjDti1gOPqlyXoifcRNGQzUd31lDyfHmob1Gp35vSr+P6vilcQ5Egtyd8YF/ySg9NhPM+9M/IOaHwp5+PSZayXTvCogEUwlatC3J8LLwYtcWB8EuDXQVuCkV5/B4eNHb7wGBs87LBDS+xjdVSn09wq1G8dFM+9tSUhIGneLvUdniKxKpTYljCpu3j7rVWlHj/P23v4NPGUEyeCQnexe9lJjzEQqMjJs+EzNAX6B98dBZVRmroJx95x/A/6gln18EyfCUsl+qdXb/tjvfbw+mwforpUOBz4XLVoBwAn3aWnfeH246NyBXhrq7TTN5lNSP9RkU+puUJm3W2Tsdq0nZWM07srk7MwQrZSRysjjGWBLRJNsNbfj2JMR4AbxpU1XLAb9Mxfpsq5EjMuuiR8L0JiHOOBX3hiUvOmavN0nMueSzcceFk0BK4pMqLo7vDD1Z0qrtDx7Itt4Xwm9UqbMmk8S0Dtuzb2pvOU99Z1nLTOfleNmvfZfP2pYZmPfajwosKdDBNpacNpVGGsWX9CyDI8Xq/Sj6QAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE0LTExLTEwVDAzOjE3OjU4LTA1OjAwF+tHyQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNC0xMS0xMFQwMzoxNzo1OC0wNTowMGa2/3UAAAAASUVORK5CYII=",height:20,width:20,type:"esriPMS",angle:0})}}_createWindBarbsRenderer(){const e=Array.from(Array(31).keys()).map((e=>5*e)),M=[{range:"0-5",path:"M20 20 M5 20 A15 15 0 1 0 35 20 A15 15 0 1 0 5 20 M20 20 M10 20 A10 10 0 1 0 30 20 A10 10 0 1 0 10 20",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTIwIDIwIE01IDIwIEExNSAxNSAwIDEgMCAzNSAyMCBBMTUgMTUgMCAxIDAgNSAyMCBNMjAgMjAgTTEwIDIwIEExMCAxMCAwIDEgMCAzMCAyMCBBMTAgMTAgMCAxIDAgMTAgMjAiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"5-10",path:"M25 0 L25 40 M25 35 L17.5 37.5",imageData:"PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjkgMCAyNyA0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjUgMCBMMjUgNDAgTTI1IDM1IEwxNy41IDM3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"10-15",path:"M25 0 L25 40 L10 45 L25 40",imageData:"PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjkgMCAyNyA0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjUgMCBMMjUgNDAgTDEwIDQ1IEwyNSA0MCIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"15-20",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L17.5 37.5",imageData:"PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjEyIDAgMTUgNDUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0NSBMMjUgNDAgTTI1IDM1IEwxNy41IDM3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"20-25",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40",imageData:"PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjkgMCAyNiA0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjUgMCBMMjUgNDAgTDEwIDQ1IEwyNSA0MCBNMjUgMzUgTDEwIDQwIiBzdHlsZT0ic3Ryb2tlOnJnYigwLDAsMCk7c3Ryb2tlLXdpZHRoOjEuNSIvPgogPC9zdmc+"},{range:"25-30",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40 L25 35 M25 30 L17.5 32.5",imageData:"PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjkgMCAyNiA0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjUgMCBMMjUgNDAgTDEwIDQ1IEwyNSA0MCBNMjUgMzUgTDEwIDQwIEwyNSAzNSBNMjUgMzAgTDE3LjUgMzIuNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"30-35",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40 L25 35 M25 30 L10 35",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0NiI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0NSBMMjUgNDAgTTI1IDM1IEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"35-40",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L17.5 27.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0NiI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0NSBMMjUgNDAgTTI1IDM1IEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxNy41IDI3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"40-45",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0NiI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0NSBMMjUgNDAgTTI1IDM1IEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"45-50",path:"M25 0 L25 40 L10 45 L25 40 M25 35 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L17.5 22.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0NiI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0NSBMMjUgNDAgTTI1IDM1IEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxNy41IDIyLjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"50-55",path:"M25 0 L25 40 L10 40 L25 35",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"55-60",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L17.5 32.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjIwcHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxNy41IDMyLjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"60-65",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"65-70",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L17.5 27.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxNy41IDI3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"70-75",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"75-80",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L17.5 22.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxNy41IDIyLjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"80-85",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L10 25",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxMCAyNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"85-90",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L10 25 L25 20 M25 15 L17.5 17.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxMCAyNSBMMjUgMjAgTTI1IDE1IEwxNy41IDE3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"90-95",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L10 25 L25 20 M25 15 L10 20",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxMCAyNSBMMjUgMjAgTTI1IDE1IEwxMCAyMCIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"95-100",path:"M25 0 L25 40 L10 40 L25 35 M25 30 L10 35 L25 30 M25 25 L10 30 L25 25 M25 20 L10 25 L25 20 M25 15 L10 20 L25 15 M25 10 L17.5 12.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTTI1IDMwIEwxMCAzNSBMMjUgMzAgTTI1IDI1IEwxMCAzMCBMMjUgMjUgTTI1IDIwIEwxMCAyNSBMMjUgMjAgTTI1IDE1IEwxMCAyMCBMMjUgMTUgTTI1IDEwIEwxNy41IDEyLjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="},{range:"100-105",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"105-110",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L17.5 27.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDE3LjUgMjcuNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"110-115",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIiBzdHlsZT0ic3Ryb2tlOnJnYigwLDAsMCk7c3Ryb2tlLXdpZHRoOjEuNSIvPgogPC9zdmc+"},{range:"115-120",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L17.5 22.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDE3LjUgMjIuNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"120-125",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IiBzdHlsZT0ic3Ryb2tlOnJnYigwLDAsMCk7c3Ryb2tlLXdpZHRoOjEuNSIvPgogPC9zdmc+"},{range:"125-130",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25 M25 20 M25 15 L17.5 17.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IE0yNSAyMCBNMjUgMTUgTDE3LjUgMTcuNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"130-135",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25 M25 20 M25 15 L10 20",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IE0yNSAyMCBNMjUgMTUgTDEwIDIwIiBzdHlsZT0ic3Ryb2tlOnJnYigwLDAsMCk7c3Ryb2tlLXdpZHRoOjEuNSIvPgogPC9zdmc+"},{range:"135-140",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25 M25 20 M25 15 L10 20 M25 15 M25 10 L17.5 12.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IE0yNSAyMCBNMjUgMTUgTDEwIDIwIE0yNSAxNSBNMjUgMTAgTDE3LjUgMTIuNSIgc3R5bGU9InN0cm9rZTpyZ2IoMCwwLDApO3N0cm9rZS13aWR0aDoxLjUiLz4KIDwvc3ZnPg=="},{range:"140-145",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25 M25 20 M25 15 L10 20 M25 15 M25 10 L17.5 12.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IE0yNSAyMCBNMjUgMTUgTDEwIDIwIE0yNSAxNSBNMjUgMTAgTDEwIDE1IiBzdHlsZT0ic3Ryb2tlOnJnYigwLDAsMCk7c3Ryb2tlLXdpZHRoOjEuNSIvPgogPC9zdmc+"},{range:"145-150",path:"M25 0 L25 40 L10 40 L25 35 L10 35 L25 30 M25 25 L10 30 M25 25 M25 20 L10 25 M25 20 M25 15 L10 20 M25 15 M25 10 L17.5 12.5",imageData:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZpZXdCb3g9IjkgMCAyNiA0MSI+CiAgPHBhdGggZD0iTTI1IDAgTDI1IDQwIEwxMCA0MCBMMjUgMzUgTDEwIDM1IEwyNSAzMCBNMjUgMjUgTDEwIDMwIE0yNSAyNSBNMjUgMjAgTDEwIDI1IE0yNSAyMCBNMjUgMTUgTDEwIDIwIE0yNSAxNSBNMjUgMTAgTDEwIDE1IE0yNSAxMCBNMjUgNSBMMTcuNSA3LjUiIHN0eWxlPSJzdHJva2U6cmdiKDAsMCwwKTtzdHJva2Utd2lkdGg6MS41Ii8+CiA8L3N2Zz4="}],i=_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"].fromJSON({imageData:"iVBORw0KGgoAAAANSUhEUgAAACgAAAApCAQAAADtq6NDAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAEY0lEQVRIx5XXWWxWRRQH8N+d+31tUdGAVjGglYJABFEBY91jfDAg7piYaFTccA++uMQEFRcSXlATtxiXqMQt4G4iisYl0ai4sIQYtVFZ1KIFKdTS0l4f7vRCS5fPebozc+bM/2z/Mzcx0AgSiUxXnKfIdMn875FIhX53U2n/B/s+kKM4UINTjTBZImixxnrv+9a2iL6zEoUBXcoudrWj/OtHm3wt02lfU9Qao9OnHvIhgmww84MEl1qnxfNmGrqHxAizLdPpC6chGcAxKGGcL+30gOERf1BSpUqVslQSV8d5ReZFe8VQ9avufJn31cWwlJV7iafKStGOE/1qvfH9qUxxu8ydUdmuSKbGO8YUdT2inKLG69pM70tliktl5qIkCAJGmusDG7Vqsc0WjZa4UBlBiA5YZIcjYzB7qDtH5kaUJFLs7RGZTZ42W4PRRmtwvbdt1+wGiaS4drEtDttdZYIDNVuAclR3vA3+dI3qHqmVSy7U6Tv1MScCPvPR7nIpFlsdCy3FdTLPGhK92e2CUITjMJ9ocwKxnsZqc3O3JwMma3d6UVLnyVxB4aXemZqvPqLdpJhW3KVVbY4yYImPo6M5Urv50fj+0z/FG9YaEiENs8UtMfXUaTeTePNHlhXfA1UU+2lyD1Il3Gtt9+adfpNG7dNlpg2U/T3KYLZ2dUWFdTgp3/rQ4sK973qnInV5TIf40x3dhvrJPBiqyWUo4wAtLqhQYS71qK+QKOFRywmGK/kpikzV6WMKhh58vGWs4TIJNjiEYLIuP8Tt4/zmLyqk+AyrJSbF+Qq1DgqRUPMxyl+9q3IQhX/rMCJ6tEunriDs1oSyQZKlr9AkhT2ZIARbJfaJS1vtVbHB+Rgi0RK/y1q1BWsEEyLoz40xtGKcARPVWB1BTPO7f4LNtpkUl1aoMbViLyZo0GRjPD3BxnxjqXeLYlvhqYrzMMG3HoyJXa3JjfnGlbYYFlP7Jh3qKsKY4hQ7TY0nG+xwRL61n63mxHtqNHosigyMLmClNwvuecFnOZB88nNBDzNkzhxEZaKMBVoKapggMzvHHXBEpNSSFAvtcFRsVn0bW8LlMmcXs+c0Kne3gRR32+zg4uXwjC6zit6Wt4a8LXVfcp/MtQXHn2ynGbuCmb8GvvFeJLEE82ReU9/n6+dkq2x3buG9Wn94smcgAw631RPR7BTH+kbmHReZoEpOdEe7zWqZl40s0JWs9Hmv7hjBHqPDwsjGKVJnWWqjbdZp1KhJi0aPmxYZsIRhlttgeF+Jlke41QcOQKoqilSb6HJzSvNG3G/UoWnxwsmt+sVaYwd63dRbqdnMyCPVeyRPvpYgdavM22oGKoMUVRbJfOWMwidJ8Zzb1UvmWK/VVUXzHaTjjrVYh1897HT7xxYEVUaa5SWb/WO+YUWa9SrwvigzM8YlzlYv2GSdVCYxxlBtVnnFq5olwp5/BEk/OLsf5LUmG2+inRJdVvjZ97ZH9/zP34ug1O91pf4p+D+JYBpvrKxfbwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNC0xMS0xMFQwMzoxMjowOS0wNTowMB9ViV0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTQtMTEtMTBUMDM6MTI6MDktMDU6MDBuCDHhAAAAAElFTkSuQmCC",height:20,width:20,type:"esriPMS",angle:0}),a=e.map(((a,t)=>{let I;if(t!==e.length-1)if(0===t)I={minValue:a,maxValue:e[t+1],symbol:i};else{const i=_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"].fromJSON({type:"esriPMS",imageData:M[t].imageData,contentType:"image/svg+xml",height:32,width:32,angle:0});I={minValue:a,maxValue:e[t+1],symbol:i}}return new _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_20__["default"](I)}));return{defaultSymbol:i,classBreakInfos:a}}_getClassBreaks(e,i){return i.map(((i,a)=>new _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_20__["default"]({minValue:e[a],maxValue:e[a+1],symbol:this._getDefaultSymbol(new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](i))})))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:String,json:{write:!0}})],h.prototype,"attributeField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:b.apiValues,json:{type:b.jsonValues,read:{reader:b.read},write:{writer:b.write}}})],h.prototype,"flowRepresentation",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:["geographic","arithmetic"],json:{write:!0}})],h.prototype,"rotationType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:Z.apiValues,json:{type:Z.jsonValues,read:{reader:Z.read},write:{writer:Z.write}}})],h.prototype,"style",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({json:{write:!0}})],h.prototype,"symbolTileSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].apiValues,json:{type:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].jsonValues,write:{writer:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].write}}})],h.prototype,"inputUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__["reader"])("inputUnit")],h.prototype,"readInputUnit",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].apiValues,json:{type:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].jsonValues,read:{reader:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].read},write:{writer:_layers_support_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_17__["unitKebabDict"].write}}})],h.prototype,"outputUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_14__["reader"])("outputUnit")],h.prototype,"readOutputUnit",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_13__["enumeration"])({vectorField:"vector-field"})],h.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_18__["default"]})],h.prototype,"styleRenderer",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_visualVariables_SizeVariable_js__WEBPACK_IMPORTED_MODULE_22__["default"]})],h.prototype,"sizeVariables",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_visualVariables_RotationVariable_js__WEBPACK_IMPORTED_MODULE_21__["default"]})],h.prototype,"rotationVariables",null),h=z=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_15__["subclass"])("esri.renderers.VectorFieldRenderer")],h);var E=h;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/ColormapInfo.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/ColormapInfo.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.value=null,this.label=null,this.color=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],c.prototype,"value",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],c.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"]],write:!0}})],c.prototype,"color",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.ColormapInfo")],c);var l=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/rasterRendererHelper.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/rasterRendererHelper.js ***!
  \******************************************************************************/
/*! exports provided: createClassBreaksRenderer, createColorRamp, createColormapRenderer, createDefaultRenderer, createShadedReliefRenderer, createStretchRenderer, createUVRenderer, createVectorFieldRenderer, getBandNames, getClassField, getDefaultBandCombination, getDefaultInterpolation, getSupportedRendererTypes, getWellKnownBandIndexes, isClassBreaksSupported, isColormapRendererSupported, isShadedReliefRendererSupported, isSingleBand8BitRasterWithStats, isUVRendererSupported, isVectorFieldRendererSupported, normalizeRendererJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createClassBreaksRenderer", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createColorRamp", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createColormapRenderer", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDefaultRenderer", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createShadedReliefRenderer", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createStretchRenderer", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createUVRenderer", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createVectorFieldRenderer", function() { return K; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBandNames", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClassField", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultBandCombination", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultInterpolation", function() { return T; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSupportedRendererTypes", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWellKnownBandIndexes", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isClassBreaksSupported", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isColormapRendererSupported", function() { return z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isShadedReliefRendererSupported", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSingleBand8BitRasterWithStats", function() { return W; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUVRendererSupported", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVectorFieldRendererSupported", function() { return G; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeRendererJSON", function() { return X; });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _rasterRenderers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../rasterRenderers.js */ "../node_modules/@arcgis/core/rasterRenderers.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _layers_support_Field_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../layers/support/Field.js */ "../node_modules/@arcgis/core/layers/support/Field.js");
/* harmony import */ var _layers_support_RasterInfo_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../layers/support/RasterInfo.js */ "../node_modules/@arcgis/core/layers/support/RasterInfo.js");
/* harmony import */ var _AuthoringInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./AuthoringInfo.js */ "../node_modules/@arcgis/core/renderers/support/AuthoringInfo.js");
/* harmony import */ var _ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ClassBreakInfo.js */ "../node_modules/@arcgis/core/renderers/support/ClassBreakInfo.js");
/* harmony import */ var _colorRampUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./colorRampUtils.js */ "../node_modules/@arcgis/core/renderers/support/colorRampUtils.js");
/* harmony import */ var _UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./UniqueValueInfo.js */ "../node_modules/@arcgis/core/renderers/support/UniqueValueInfo.js");
/* harmony import */ var _rest_support_AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../rest/support/AlgorithmicColorRamp.js */ "../node_modules/@arcgis/core/rest/support/AlgorithmicColorRamp.js");
/* harmony import */ var _rest_support_ClassBreaksDefinition_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../rest/support/ClassBreaksDefinition.js */ "../node_modules/@arcgis/core/rest/support/ClassBreaksDefinition.js");
/* harmony import */ var _rest_support_generateRendererUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../rest/support/generateRendererUtils.js */ "../node_modules/@arcgis/core/rest/support/generateRendererUtils.js");
/* harmony import */ var _rest_support_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../rest/support/MultipartColorRamp.js */ "../node_modules/@arcgis/core/rest/support/MultipartColorRamp.js");
/* harmony import */ var _RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../RasterStretchRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterStretchRenderer.js");
/* harmony import */ var _UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../UniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js");
/* harmony import */ var _RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../RasterColormapRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterColormapRenderer.js");
/* harmony import */ var _RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../RasterShadedReliefRenderer.js */ "../node_modules/@arcgis/core/renderers/RasterShadedReliefRenderer.js");
/* harmony import */ var _ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../ClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js");
/* harmony import */ var _VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../VectorFieldRenderer.js */ "../node_modules/@arcgis/core/renderers/VectorFieldRenderer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const w=.25,x=_rest_support_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON({type:"multipart",colorRamps:[{fromColor:[0,0,255],toColor:[0,255,255]},{fromColor:[0,255,255],toColor:[255,255,0]},{fromColor:[255,255,0],toColor:[255,0,0]}]}),M=_rest_support_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON(_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_8__["PREDEFINED_JSON_COLOR_RAMPS"][0]),R=new Set(["scientific","standard-time","vector-uv","vector-magdir","vector-u","vector-v","vector-magnitude","vector-direction"]);function j(e,n){const{attributeTable:r,colormap:l}=e;if(G(e)){const n=K(e);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(n))return n}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(l)){const n=F(e);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(n))return n}if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r)){const n=q(e);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(n))return n}return V(e,n)}function k(e){const t=["raster-stretch"];return z(e)&&t.push("raster-colormap"),P(e)&&t.push("unique-value"),D(e)&&t.push("class-breaks"),U(e)&&t.push("raster-shaded-relief"),G(e)&&t.push("vector-field"),t}function T(e,t,n){const r=["nearest","bilinear","cubic","majority"].find((e=>e===(null==n?void 0:n.toLowerCase())));if("Map"===t)return null!=r?r:"bilinear";if("standard-time"===e.dataType)return null!=r?r:"nearest";return"thematic"===e.dataType||e.attributeTable||e.colormap?"nearest"===r||"majority"===r?r:"nearest":null!=r?r:"bilinear"}function V(e,r){var l,a,o,s;e=I(e,null==r?void 0:r.variableName);const{bandCount:i}=e;let{bandIds:u,stretchType:m}=r||{};null!=(l=u)&&l.some((e=>e>=i))&&(u=null);let c=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(e.statistics),f=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(e.histograms);var p;i>1?(u=null!=(p=u)&&p.length?u:S(e),c=null==c?null:u.map((e=>c[e])),f=null==f?null:u.map((e=>f[e]))):u=[0];null==m&&(m=O(e));let d=!1;switch(m){case"none":d=!1;break;case"percent-clip":d=!(null!=(a=f)&&a.length);break;default:d=!(null!=(o=c)&&o.length)}const{dataType:h}=e,v=1===(null==(s=u)?void 0:s.length)&&R.has(h)?x:null,y=new _RasterStretchRenderer_js__WEBPACK_IMPORTED_MODULE_14__["default"]({stretchType:m,dynamicRangeAdjustment:d,colorRamp:v,outputMin:0,outputMax:255,gamma:1===u.length?[1]:[1,1,1],useGamma:!1});return"percent-clip"===m?y.maxPercent=y.minPercent=w:"standard-deviation"===m&&(y.numberOfStandardDeviations=2),!d&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.multidimensionalInfo)||null!=r&&r.includeStatisticsInStretch)&&("percent-clip"===m?y.histograms=f:"min-max"!==m&&"standard-deviation"!==m||(y.statistics=c)),y}function I(e,r){if(null==r)return e;let l=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(e.statistics),o=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(e.histograms);const{multidimensionalInfo:s}=e;if(r&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(s)){const{statistics:e,histograms:t}=s.variables.find((e=>e.name===r));null!=e&&e.length&&(l=e),null!=t&&t.length&&(o=t)}return _layers_support_RasterInfo_js__WEBPACK_IMPORTED_MODULE_5__["default"].fromJSON({...e.toJSON(),statistics:l,histograms:o})}function S(e){const t=e.bandCount;if(1===t)return null;if(2===t)return[0];const n=e.keyProperties&&e.keyProperties.BandProperties;let r;if(n&&n.length===t){const{red:e,green:t,blue:l,nir:a}=B(n);null!=e&&null!=t&&null!=l?r=[e,t,l]:null!=a&&null!=e&&null!=t&&(r=[a,e,t])}return!r&&t>=3&&(r=[0,1,2]),r}function L(e,t){var n;const r=e.keyProperties&&e.keyProperties.BandProperties;return(t=null!=(n=t)&&n.length?t:Array.from(Array(e.bandCount).keys())).map((t=>r&&r.length===e.bandCount&&r[t]&&r[t].BandName||"band_"+(t+1)))}function B(e){const t={};for(let r=0;r<e.length;r++){var n;const l=e[r],a=null==(n=l.BandName)?void 0:n.toLowerCase();if("red"===a)t.red=r;else if("green"===a)t.green=r;else if("blue"===a)t.blue=r;else if("nearinfrared"===a||"nearinfrared_1"===a||"nir"===a)t.nir=r;else if(l.WavelengthMax&&l.WavelengthMin){const e=l.WavelengthMin,n=l.WavelengthMax;null==t.blue&&e>=410&&e<=480&&n>=480&&n<=540?t.blue=r:null==t.green&&e>=490&&e<=560&&n>=560&&n<=610?t.green=r:null==t.red&&e>=595&&e<=670&&n>=660&&n<=730?t.red=r:null==t.nir&&e>=700&&e<=860&&n>=800&&n<=950&&(t.nir=r)}}return t}function O(e){let n="percent-clip";const{pixelType:r,dataType:l,histograms:a,statistics:o}=e;return"u8"!==r||"processed"!==l&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(a)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(o)?"u8"===r||"elevation"===l||R.has(l)?n="min-max":Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(a)?n="percent-clip":Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(o)&&(n="min-max",n="min-max"):n="none",n}function q(n,r,l,a){if(!P(n,r))return null;const{attributeTable:s,statistics:i}=n,c=E(s,r),f=N(s,"red"),p=N(s,"green"),d=N(s,"blue"),b=new _AuthoringInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"],v=[],y=new Set,g=!!(f&&p&&d);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(s))s.features.forEach((t=>{const n=t.attributes[c.name];if(!y.has(t.attributes[c.name])&&null!=n){y.add(n);const r=g&&("single"===f.type||"double"===f.type)&&("single"===p.type||"double"===p.type)&&("single"===d.type||"double"===d.type)&&!s.features.some((e=>e.attributes[f.name]>1||e.attributes[p.name]>1||e.attributes[d.name]>1)),l=r?255:1;v.push(new _UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_9__["default"]({value:t.attributes[c.name],label:t.attributes[c.name]+"",symbol:{type:"simple-fill",style:"solid",outline:null,color:new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](g?[t.attributes[f.name]*l,t.attributes[p.name]*l,t.attributes[d.name]*l,1]:[0,0,0,0])}}))}}));else if(null!=i&&i[0])for(let t=i[0].min;t<=i[0].max;t++)v.push(new _UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_9__["default"]({value:t,label:t.toString(),symbol:{type:"simple-fill",style:"solid",outline:null,color:new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([0,0,0,0])}}));if(v.sort(((e,t)=>e.value&&"string"==typeof e.value.valueOf()?0:e.value>t.value?1:-1)),!g){const t=Object(_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_8__["convertColorRampToColormap"])(M,v.length);v.forEach(((n,r)=>n.symbol.color=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](t[r].slice(1,4)))),b.colorRamp=M}if(l||a){const t=l||Object(_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_8__["convertColorRampToColormap"])(a,v.length).map((e=>e.slice(1)));v.forEach(((n,r)=>n.symbol.color=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](t[r]))),b.colorRamp=a}return new _UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_15__["default"]({field:c.name,uniqueValueInfos:v,authoringInfo:b})}function E(e,n){let r;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e)?(r=n?e.fields.find((e=>n.toLowerCase()===e.name.toLowerCase())):e.fields.find((e=>"string"===e.type&&e.name.toLowerCase().indexOf("class")>-1)),r||(r=e.fields.find((e=>"string"===e.type)),r||(r=N(e,"value")))):r=new _layers_support_Field_js__WEBPACK_IMPORTED_MODULE_4__["default"]({name:"value"}),r}function N(e,n){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e)?e.fields.find((e=>e.name.toLowerCase()===n)):null}function P(e,n){const{attributeTable:r,bandCount:l}=e;if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r)&&W(e))return!0;if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r)||l>1)return!1;if(n){if(null==r.fields.find((e=>e.name.toLowerCase()===n.toLowerCase())))return!1}return!0}function z(e){const{bandCount:n,colormap:r}=e;return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r)&&r.length&&1===n}function F(e){if(!z(e))return null;let r;const{attributeTable:l,colormap:a}=e;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(l)){const e=N(l,"value"),t=E(l);"string"===t.type&&(r={},l.features.forEach((n=>{const l=n.attributes;r[l[e.name]]=t?l[t.name]:l[e.name]})))}return _RasterColormapRenderer_js__WEBPACK_IMPORTED_MODULE_16__["default"].createFromColormap(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(a),r)}function U(e){return"elevation"===e.dataType}function A(e,t){var n;if(!U(e))return null;const{extent:l}=e,a=l.width*Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_3__["getMetersPerUnitForSR"])(l.spatialReference);return t=null!=(n=t)?n:"multi-directional",new _RasterShadedReliefRenderer_js__WEBPACK_IMPORTED_MODULE_17__["default"]({hillshadeType:t,scalingType:a>5e6?"adjusted":"none"})}function D(e){const{attributeTable:n,bandCount:r}=e;return 1===r&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(n)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.histograms))}function J(e,n){e=I(e,null==n?void 0:n.variableName);const{attributeTable:r}=e;if(!D(e))return null;const l=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.histograms)?e.histograms[0]:null,a=(null==n?void 0:n.numClasses)||5,i=new _AuthoringInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]({classificationMethod:null==n?void 0:n.classificationMethod,colorRamp:null==n?void 0:n.colorRamp});let m=(null==n?void 0:n.field)||"value";const c=[],d=[],b=1e3;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r)){const e=r.fields.find((e=>"count"===e.name.toLowerCase())),t=r.fields.find((e=>e.name.toLowerCase()===m.toLowerCase()));m=t.name;const n=r.features.length;let l=0;r.features.forEach((t=>l+=t.attributes[e.name]/n)),r.features.forEach((r=>{const a=r.attributes[t.name],o=r.attributes[e.name];if(o>0){d.push(o);const e=Math.max(1,Math.round(o/n/l*b));for(let t=0;t<e;t++)c.push(a)}}))}else{const{pixelType:t}=e,n=(l.max-l.min)/l.size,r=t.indexOf("s")>-1||t.indexOf("u")>-1,a=r&&1===n?Math.floor(l.min+.5):l.min,o=r&&1===n?Math.floor(l.max-.5):l.max,s=l.size;let i=0;l.counts.forEach((e=>i+=e/s)),l.counts.forEach(((e,t)=>{if(e>0){d.push(e);const r=Math.max(1,Math.round(e/s/i*b)),u=0===t?a:t===s-1?o:l.min+n*(t+.5);for(let e=0;e<r;e++)c.push(u)}}))}const h=(null==n?void 0:n.classificationMethod)||"natural-breaks",v=Object(_rest_support_generateRendererUtils_js__WEBPACK_IMPORTED_MODULE_12__["createGenerateRendererClassBreaks"])({values:c,valueFrequency:d,normalizationTotal:null,definition:new _rest_support_ClassBreaksDefinition_js__WEBPACK_IMPORTED_MODULE_11__["default"]({classificationMethod:h,breakCount:a,definedInterval:null==n?void 0:n.definedInterval})});let y=null==n?void 0:n.colors;if(!y){const e=(null==n?void 0:n.colorRamp)||x;i.colorRamp=e;const t=Object(_colorRampUtils_js__WEBPACK_IMPORTED_MODULE_8__["convertColorRampToColormap"])(e,v.classBreaks.length,!0);y=t.map((e=>e.slice(1)))}const C=v.classBreaks.map(((e,t)=>new _ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_7__["default"]({minValue:e.minValue,maxValue:e.maxValue,label:e.label,symbol:{type:"simple-fill",color:y[t]}})));return new _ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_18__["default"]({field:m,classBreakInfos:C,authoringInfo:i})}function W(e){var t,n,r;return["u8","s8"].indexOf(e.pixelType)>-1&&null!=(null==(t=e.statistics)||null==(n=t[0])?void 0:n.min)&&null!=(null==(r=e.statistics[0])?void 0:r.max)&&1===e.bandCount}function _(t){const n=[];for(let r=0;r<t.length-1;r++)n[r]=new _rest_support_AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_10__["default"]({algorithm:"hsv",fromColor:t[r],toColor:t[r+1]||new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]({r:255,g:255,b:255,a:1})});if(t.length>2){return new _rest_support_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_13__["default"]({colorRamps:n})}return n[0]}function G(e){const{dataType:t}=e;return"vector-uv"===t||"vector-magdir"===t}const H=new Map([["m/s","meter-per-second"],["km/h","kilometer-per-hour"],["knots","knots"],["ft/s","feet-per-second"],["mph","mile-per-hour"]]);function K(e){if(!G(e))return null;let n;if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.statistics)&&e.statistics.length){const t="vector-uv"===e.dataType,{min:r,max:l}=e.statistics[0];n=[{type:"size",field:"Magnitude",minSize:10,maxSize:40,minDataValue:t?Math.min(Math.abs(r),Math.abs(l)):r,maxDataValue:t?Math.max(Math.abs(r),Math.abs(l)):l}]}const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(e.multidimensionalInfo)?H.get(e.multidimensionalInfo.variables[0].unit):null,l=new _VectorFieldRenderer_js__WEBPACK_IMPORTED_MODULE_19__["default"]({visualVariables:n,inputUnit:r});return l.visualVariables=[...l.sizeVariables,...l.rotationVariables],l}function Q(e){var t;return{color:null==(t=e.symbolLayers[0].material)?void 0:t.color,type:"esriSFS",style:"esriSFSSolid"}}function X(e){if("uniqueValue"===e.type){var t;const n=e.uniqueValueInfos,r=n[0].symbol;return null!=r&&null!=(t=r.symbolLayers)&&t.length&&(e.uniqueValueInfos=n.map((e=>({value:e.value,label:e.label,symbol:e.symbol?Q(e.symbol):null})))),e}if("classBreaks"===e.type){var n;const t=e.classBreakInfos,r=t[0].symbol;return null!=r&&null!=(n=r.symbolLayers)&&n.length&&(e.classBreakInfos=t.map((e=>({classMinValue:e.classMinValue,classMaxValue:e.classMaxValue,label:e.label,symbol:e.symbol?Q(e.symbol):null})))),e}return e}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/stretchRendererUtils.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/stretchRendererUtils.js ***!
  \******************************************************************************/
/*! exports provided: stretchTypeFunctionEnum, stretchTypeJSONDict */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stretchTypeFunctionEnum", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stretchTypeJSONDict", function() { return n; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["JSONMap"]({none:"none",standardDeviation:"standard-deviation",histogramEqualization:"histogram-equalization",minMax:"min-max",percentClip:"percent-clip",sigmoid:"sigmoid"}),a={0:"none",3:"standardDeviation",4:"histogramEqualization",5:"minMax",6:"percentClip",9:"sigmoid"};


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

/***/ "../node_modules/@arcgis/core/rest/support/ClassBreaksDefinition.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/ClassBreaksDefinition.js ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _ClassificationDefinition_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ClassificationDefinition.js */ "../node_modules/@arcgis/core/rest/support/ClassificationDefinition.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({esriClassifyEqualInterval:"equal-interval",esriClassifyManual:"manual",esriClassifyNaturalBreaks:"natural-breaks",esriClassifyQuantile:"quantile",esriClassifyStandardDeviation:"standard-deviation",esriClassifyDefinedInterval:"defined-interval"}),a=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({esriNormalizeByLog:"log",esriNormalizeByPercentOfTotal:"percent-of-total",esriNormalizeByField:"field"});let n=class extends _ClassificationDefinition_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(){super(...arguments),this.breakCount=null,this.classificationField=null,this.classificationMethod=null,this.normalizationField=null,this.normalizationType=null,this.type="class-breaks-definition"}set standardDeviationInterval(e){"standard-deviation"===this.classificationMethod&&this._set("standardDeviationInterval",e)}set definedInterval(e){"defined-interval"===this.classificationMethod&&this._set("definedInterval",e)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0}})],n.prototype,"breakCount",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0}})],n.prototype,"classificationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{read:o.read,write:o.write}})],n.prototype,"classificationMethod",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0}})],n.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{read:a.read,write:a.write}})],n.prototype,"normalizationType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({value:null,json:{write:!0}})],n.prototype,"standardDeviationInterval",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({value:null,json:{write:!0}})],n.prototype,"definedInterval",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],n.prototype,"type",void 0),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.rest.support.ClassBreaksDefinition")],n);var l=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/ClassificationDefinition.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/ClassificationDefinition.js ***!
  \*****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _colorRamps_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./colorRamps.js */ "../node_modules/@arcgis/core/rest/support/colorRamps.js");
/* harmony import */ var _symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../symbols/Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const c=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({classBreaksDef:"class-breaks-definition",uniqueValueDef:"unique-value-definition"});let m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.baseSymbol=null,this.colorRamp=null,this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],m.prototype,"baseSymbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_colorRamps_js__WEBPACK_IMPORTED_MODULE_8__["types"],json:{read:{reader:_colorRamps_js__WEBPACK_IMPORTED_MODULE_8__["fromJSON"]},write:!0}})],m.prototype,"colorRamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{read:c.read,write:c.write}})],m.prototype,"type",void 0),m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.rest.support.ClassificationDefinition")],m);var l=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/generateRendererUtils.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/generateRendererUtils.js ***!
  \**************************************************************************/
/*! exports provided: createGenerateRendererClassBreaks, createGenerateRendererUniqueValues */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGenerateRendererClassBreaks", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGenerateRendererUniqueValues", function() { return l; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,l){return Number(e.toFixed(l))}function l(e){const l=u(e),t=[],n=l.uniqueValues.length;for(let a=0;a<n;a++){const e=l.uniqueValues[a],n=l.valueFrequency[a],u=e.toString();t.push({value:e,count:n,label:u})}return{uniqueValues:t}}function t(e){const{normalizationTotal:l}=e;return{classBreaks:n(e),normalizationTotal:l}}function n(l){const t=l.definition,{classificationMethod:n,breakCount:o,normalizationType:r,definedInterval:h}=t,m=[];let b=l.values;if(0===b.length)return[];b=b.sort(((e,l)=>e-l));const V=b[0],p=b[b.length-1];if("equal-interval"===n)if(b.length>=o){const l=(p-V)/o;let t=V;for(let n=1;n<o;n++){const u=e(V+n*l,6);m.push({minValue:t,maxValue:u,label:a(t,u,r)}),t=u}m.push({minValue:t,maxValue:p,label:a(t,p,r)})}else b.forEach((e=>{m.push({minValue:e,maxValue:e,label:a(e,e,r)})}));else if("natural-breaks"===n){const t=u(b),n=l.valueFrequency||t.valueFrequency,i=s(t.uniqueValues,n,o);let c=V;for(let l=1;l<o;l++)if(t.uniqueValues.length>l){const n=e(t.uniqueValues[i[l]],6);m.push({minValue:c,maxValue:n,label:a(c,n,r)}),c=n}m.push({minValue:c,maxValue:p,label:a(c,p,r)})}else if("quantile"===n)if(b.length>=o&&V!==p){let e=V,l=Math.ceil(b.length/o),t=0;for(let n=1;n<o;n++){let u=l+t-1;u>b.length&&(u=b.length-1),u<0&&(u=0),m.push({minValue:e,maxValue:b[u],label:a(e,b[u],r)}),e=b[u],t+=l,l=Math.ceil((b.length-t)/(o-n))}m.push({minValue:e,maxValue:p,label:a(e,p,r)})}else{let e=-1;for(let l=0;l<b.length;l++){const t=b[l];t!==e&&(e=t,m.push({minValue:e,maxValue:t,label:a(e,t,r)}),e=t)}}else if("standard-deviation"===n){const l=c(b),t=f(b,l);if(0===t)m.push({minValue:b[0],maxValue:b[0],label:a(b[0],b[0],r)});else{const n=i(V,p,o,l,t)*t;let u=0,s=V;for(let t=o;t>=1;t--){const o=e(l-(t-.5)*n,6);m.push({minValue:s,maxValue:o,label:a(s,o,r)}),s=o,u++}let c=e(l+.5*n,6);m.push({minValue:s,maxValue:c,label:a(s,c,r)}),s=c,u++;for(let t=1;t<=o;t++)c=u===2*o?p:e(l+(t+.5)*n,6),m.push({minValue:s,maxValue:c,label:a(s,c,r)}),s=c,u++}}else if("defined-interval"===n){if(!h)return m;const l=b[0],t=b[b.length-1],n=Math.ceil((t-l)/h);let u=l;for(let s=1;s<n;s++){const t=e(l+s*h,6);m.push({minValue:u,maxValue:t,label:a(u,t,r)}),u=t}m.push({minValue:u,maxValue:t,label:a(u,t,r)})}return m}function a(e,l,t){let n=null;return n=e===l?t&&"percent-of-total"===t?e+"%":e.toString():t&&"percent-of-total"===t?e+"% - "+l+"%":e+" - "+l,n}function u(e){const l=[],t=[];let n=Number.MIN_VALUE,a=1,u=-1;for(let s=0;s<e.length;s++){const o=e[s];o===n?(a++,t[u]=a):null!==o&&(l.push(o),n=o,a=1,t.push(a),u++)}return{uniqueValues:l,valueFrequency:t}}function s(e,l,t){const n=e.length,a=[];t>n&&(t=n);for(let s=0;s<t;s++)a.push(Math.round(s*n/t-1));a.push(n-1);let u=o(a,e,l,t);return r(u.mean,u.sdcm,a,e,l,t)&&(u=o(a,e,l,t)),a}function o(e,l,t,n){let a=[],u=[],s=[],o=0;const r=[],i=[];for(let b=0;b<n;b++){const n=h(b,e,l,t);r.push(n.sbMean),i.push(n.sbSdcm),o+=i[b]}let c,f=o,m=!0;for(;m||o<f;){m=!1,a=[];for(let l=0;l<n;l++)a.push(e[l]);for(let t=0;t<n;t++)for(let a=e[t]+1;a<=e[t+1];a++)if(c=l[a],t>0&&a!==e[t+1]&&Math.abs(c-r[t])>Math.abs(c-r[t-1]))e[t]=a;else if(t<n-1&&e[t]!==a-1&&Math.abs(c-r[t])>Math.abs(c-r[t+1])){e[t+1]=a-1;break}f=o,o=0,u=[],s=[];for(let a=0;a<n;a++){u.push(r[a]),s.push(i[a]);const n=h(a,e,l,t);r[a]=n.sbMean,i[a]=n.sbSdcm,o+=i[a]}}if(o>f){for(let l=0;l<n;l++)e[l]=a[l],r[l]=u[l],i[l]=s[l];o=f}return{mean:r,sdcm:i}}function r(e,l,t,n,a,u){let s=0,o=0,r=0,i=0,c=!0;for(let f=0;f<2&&c;f++){0===f&&(c=!1);for(let f=0;f<u-1;f++)for(;t[f+1]+1!==t[f+2];){t[f+1]=t[f+1]+1;const u=h(f,t,n,a);r=u.sbMean,s=u.sbSdcm;const m=h(f+1,t,n,a);if(i=m.sbMean,o=m.sbSdcm,!(s+o<l[f]+l[f+1])){t[f+1]=t[f+1]-1;break}l[f]=s,l[f+1]=o,e[f]=r,e[f+1]=i,c=!0}for(let f=u-1;f>0;f--)for(;t[f]!==t[f-1]+1;){t[f]=t[f]-1;const u=h(f-1,t,n,a);r=u.sbMean,s=u.sbSdcm;const m=h(f,t,n,a);if(i=m.sbMean,o=m.sbSdcm,!(s+o<l[f-1]+l[f])){t[f]=t[f]+1;break}l[f-1]=s,l[f]=o,e[f-1]=r,e[f]=i,c=!0}}return c}function i(e,l,t,n,a){let u=Math.max(n-e,l-n)/a/t;return u=u>=1?1:u>=.5?.5:.25,u}function c(e){let l=0;for(let t=0;t<e.length;t++)l+=e[t];return l/=e.length,l}function f(e,l){let t=0;for(let n=0;n<e.length;n++){const a=e[n];t+=(a-l)*(a-l)}t/=e.length;return Math.sqrt(t)}function h(e,l,t,n){let a=0,u=0;for(let r=l[e]+1;r<=l[e+1];r++){const e=n[r];a+=t[r]*e,u+=e}u<=0&&console.log("Exception in Natural Breaks calculation");const s=a/u;let o=0;for(let r=l[e]+1;r<=l[e+1];r++)o+=n[r]*(t[r]-s)**2;return{sbMean:s,sbSdcm:o}}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/cim/utils.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/cim/utils.js ***!
  \*********************************************************/
/*! exports provided: _adjustTextCase, colorToArray, createLabelOverrideFunction, evaluateValueOrFunction, fromCIMColor, isCIMFill, isCIMMarker, isCIMMarkerStrokePlacement, isCIMStroke, resampleHermite, toCIMSymbolJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_adjustTextCase", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "colorToArray", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createLabelOverrideFunction", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "evaluateValueOrFunction", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromCIMColor", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCIMFill", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCIMMarker", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCIMMarkerStrokePlacement", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCIMStroke", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resampleHermite", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toCIMSymbolJSON", function() { return o; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){return"function"==typeof t}function e(e,r,n,a){return t(e)?e(r,n,a):e}function r(t){return[t.r,t.g,t.b,t.a]}function n(t,e,r){const n=" /-,\n",i=t=>{let e=t.length;for(;e--;)if(-1===n.indexOf(t.charAt(e)))return!1;return!0},l=[];let o=0,c=-1;do{if(c=e.indexOf("[",o),c>=o){if(c>o){const t=e.substr(o,c-o);l.push([t,null,i(t)])}if(o=c+1,c=e.indexOf("]",o),c>=o){if(c>o){const r=t[e.substr(o,c-o)];r&&l.push([null,r,!1])}o=c+1}}}while(-1!==c);if(o<e.length-1){const t=e.substr(o);l.push([t,null,i(t)])}return t=>{let e="",n=null;for(const r of l){const[a,i,l]=r;if(a)l?n=a:(n&&(e+=n,n=null),e+=a);else{const r=t.attributes[i];r&&(n&&(e+=n,n=null),e+=r)}}return a(e,r)}}function a(t,e){switch("string"!=typeof t&&(t=String(t)),e){case"LowerCase":return t.toLowerCase();case"Allcaps":return t.toUpperCase();default:return t}}function i(t,e,r,n,a,i,l=!0){const o=e/a,c=r/i,u=Math.ceil(o/2),M=Math.ceil(c/2);for(let s=0;s<i;s++)for(let r=0;r<a;r++){const f=4*(r+(l?i-s-1:s)*a);let p=0,C=0,y=0,I=0,h=0,k=0,d=0;const P=(s+.5)*c;for(let n=Math.floor(s*c);n<(s+1)*c;n++){const a=Math.abs(P-(n+.5))/M,i=(r+.5)*o,l=a*a;for(let c=Math.floor(r*o);c<(r+1)*o;c++){let r=Math.abs(i-(c+.5))/u;const a=Math.sqrt(l+r*r);a>=-1&&a<=1&&(p=2*a*a*a-3*a*a+1,p>0&&(r=4*(c+n*e),d+=p*t[r+3],y+=p,t[r+3]<255&&(p=p*t[r+3]/250),I+=p*t[r],h+=p*t[r+1],k+=p*t[r+2],C+=p))}}n[f]=I/C,n[f+1]=h/C,n[f+2]=k/C,n[f+3]=d/y}}function l(t){return t?{r:t[0],g:t[1],b:t[2],a:t[3]/255}:{r:0,g:0,b:0,a:0}}function o(t){var e;return null==(e=t.data)?void 0:e.symbol}function c(t){return"CIMVectorMarker"===t.type||"CIMPictureMarker"===t.type||"CIMBarChartMarker"===t.type||"CIMCharacterMarker"===t.type||"CIMPieChartMarker"===t.type||"CIMStackedBarChartMarker"===t.type}function u(t){return"CIMGradientStroke"===t.type||"CIMPictureStroke"===t.type||"CIMSolidStroke"===t.type}function M(t){return"CIMGradientFill"===t.type||"CIMHatchFill"===t.type||"CIMPictureFill"===t.type||"CIMSolidFill"===t.type||"CIMWaterFill"===t.type}function s(t){return"CIMMarkerPlacementAlongLineRandomSize"===t.type||"CIMMarkerPlacementAlongLineSameSize"===t.type||"CIMMarkerPlacementAlongLineVariableSize"===t.type||"CIMMarkerPlacementAtExtremities"===t.type||"CIMMarkerPlacementAtMeasuredUnits"===t.type||"CIMMarkerPlacementAtRatioPositions"===t.type||"CIMMarkerPlacementOnLine"===t.type||"CIMMarkerPlacementOnVertices"===t.type}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/cimSymbolUtils.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/cimSymbolUtils.js ***!
  \**********************************************************************/
/*! exports provided: applyCIMSymbolColor, applyCIMSymbolRotation, getCIMSymbolColor, getCIMSymbolRotation, getCIMSymbolSize, scaleCIMMarker, scaleCIMSymbolTo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyCIMSymbolColor", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyCIMSymbolRotation", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCIMSymbolColor", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCIMSymbolRotation", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCIMSymbolSize", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scaleCIMMarker", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scaleCIMSymbolTo", function() { return i; });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _cim_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cim/utils.js */ "../node_modules/@arcgis/core/symbols/cim/utils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(e){const c=Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(e);if("CIMTextSymbol"===c.type)return c.height;let s=0;if(c.symbolLayers)for(const t of c.symbolLayers)Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarker"])(t)&&t.size>s?s=t.size:Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMStroke"])(t)&&t.width>s?s=t.width:Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMFill"])(t);return s}function i(e,o,a){const r=Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(e),c=n(e);if(0===c)return void l(r,o);f(r,o/c,!1,a)}function l(e,t){if("CIMTextSymbol"!==e.type){if(e.symbolLayers)for(const o of e.symbolLayers)switch(o.type){case"CIMPictureMarker":case"CIMVectorMarker":o.size=t;break;case"CIMPictureStroke":case"CIMSolidStroke":o.width=t}}else e.height=t}function f(e,t,o,a){if("CIMTextSymbol"!==e.type){if(o&&e.effects)for(const o of e.effects)y(o,t);if(e.symbolLayers)for(const o of e.symbolLayers)switch(o.type){case"CIMPictureMarker":case"CIMVectorMarker":m(o,t,a);break;case"CIMPictureStroke":case"CIMSolidStroke":null!=a&&a.preserveOutlineWidth||(o.width*=t);break;case"CIMPictureFill":o.height*=t,o.offsetX*=t,o.offsetY*=t;break;case"CIMHatchFill":f(o.lineSymbol,t,!0,{...a,preserveOutlineWidth:!1}),o.offsetX*=t,o.offsetY*=t,o.separation*=t}}else e.height*=t}function m(e,t,o){if(e.markerPlacement&&M(e.markerPlacement,t),e.offsetX*=t,e.offsetY*=t,e.anchorPoint&&"Absolute"===e.anchorPointUnits&&(e.anchorPoint={x:e.anchorPoint.x*t,y:e.anchorPoint.y*t}),e.size*=t,"CIMVectorMarker"===e.type&&e.markerGraphics)for(const a of e.markerGraphics)e.scaleSymbolsProportionally||f(a.symbol,t,!0,o)}function M(e,t){switch(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarkerStrokePlacement"])(e)&&(e.offset*=t),e.type){case"CIMMarkerPlacementAlongLineRandomSize":case"CIMMarkerPlacementAlongLineSameSize":if(e.customEndingOffset*=t,e.offsetAlongLine*=t,e.placementTemplate&&e.placementTemplate.length){const o=e.placementTemplate.map((e=>e*t));e.placementTemplate=o}break;case"CIMMarkerPlacementAlongLineVariableSize":if(e.maxRandomOffset*=t,e.placementTemplate&&e.placementTemplate.length){const o=e.placementTemplate.map((e=>e*t));e.placementTemplate=o}break;case"CIMMarkerPlacementOnLine":e.startPointOffset*=t;break;case"CIMMarkerPlacementAtExtremities":e.offsetAlongLine*=t;break;case"CIMMarkerPlacementAtMeasuredUnits":case"CIMMarkerPlacementOnVertices":break;case"CIMMarkerPlacementAtRatioPositions":e.beginPosition*=t,e.endPosition*=t;break;case"CIMMarkerPlacementPolygonCenter":e.offsetX*=t,e.offsetY*=t;break;case"CIMMarkerPlacementInsidePolygon":e.offsetX*=t,e.offsetY*=t,e.stepX*=t,e.stepY*=t}}function y(e,t){switch(e.type){case"CIMGeometricEffectArrow":case"CIMGeometricEffectDonut":e.width*=t;break;case"CIMGeometricEffectBuffer":e.size*=t;break;case"CIMGeometricEffectCut":e.beginCut*=t,e.endCut*=t,e.middleCut*=t;break;case"CIMGeometricEffectDashes":if(e.customEndingOffset*=t,e.offsetAlongLine*=t,e.dashTemplate&&e.dashTemplate.length){const o=e.dashTemplate.map((e=>e*t));e.dashTemplate=o}break;case"CIMGeometricEffectExtension":case"CIMGeometricEffectJog":case"CIMGeometricEffectRadial":e.length*=t;break;case"CIMGeometricEffectMove":e.offsetX*=t,e.offsetY*=t;break;case"CIMGeometricEffectOffset":case"CIMGeometricEffectOffsetTangent":e.offset*=t;break;case"CIMGeometricEffectRegularPolygon":e.radius*=t;break;case"CIMGeometricEffectTaperedPolygon":e.fromWidth*=t,e.length*=t,e.toWidth*=t;break;case"CIMGeometricEffectWave":e.amplitude*=t,e.period*=t}}function C(o){const a=[];return k(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(o),a),a.length?new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["fromCIMColor"])(a[0])):null}function k(e,t){let r;r="CIMTextSymbol"===e.type?e.symbol:e;const s="CIMPolygonSymbol"===e.type;if(r.symbolLayers)for(const n of r.symbolLayers)if(!(n.colorLocked||s&&(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMStroke"])(n)||Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarker"])(n)&&n.markerPlacement&&Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarkerStrokePlacement"])(n.markerPlacement))))switch(n.type){case"CIMPictureMarker":case"CIMPictureStroke":case"CIMPictureFill":break;case"CIMVectorMarker":n.markerGraphics.forEach((e=>{k(e.symbol,t)}));break;case"CIMSolidStroke":case"CIMSolidFill":b(t,n.color);break;case"CIMHatchFill":k(n.lineSymbol,t)}}function b(e,t){for(const o of e)if(o.join(".")===t.join("."))return;e.push(t)}function I(o,a){a instanceof _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]||(a=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](a));p(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(o),a)}function p(e,t){let r;r="CIMTextSymbol"===e.type?e.symbol:e;const s="CIMPolygonSymbol"===e.type;if(r.symbolLayers)for(const n of r.symbolLayers){if(n.colorLocked)continue;if(s&&(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMStroke"])(n)||Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarker"])(n)&&n.markerPlacement&&Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarkerStrokePlacement"])(n.markerPlacement)))continue;const e=t.toArray(0);switch(n.type){case"CIMPictureMarker":case"CIMPictureStroke":case"CIMPictureFill":break;case"CIMVectorMarker":n.markerGraphics.forEach((e=>{p(e.symbol,t)}));break;case"CIMSolidStroke":case"CIMSolidFill":n.color=e;break;case"CIMHatchFill":p(n.lineSymbol,t)}}}function u(e,o=!1){const a=Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(e);return"CIMTextSymbol"===a.type||"CIMPointSymbol"===a.type?o&&0!==a.angle?360-a.angle:a.angle||0:0}function h(e,a,r=!1){const c=Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["toCIMSymbolJSON"])(e);if(r&&0!==a&&(a=360-a),"CIMTextSymbol"!==c.type){if("CIMPointSymbol"===c.type&&c.symbolLayers){const e=a-(c.angle||0);for(const t of c.symbolLayers)if(Object(_cim_utils_js__WEBPACK_IMPORTED_MODULE_1__["isCIMMarker"])(t)){let o=t.rotation||0;t.rotateClockwise?o-=e:o+=e,t.rotation=o}c.angle=a}}else c.angle=a}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/gfxUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/gfxUtils.js ***!
  \****************************************************************/
/*! exports provided: defaultThematicColor, dekebabifyLineStyle, getFill, getPatternUrlWithColor, getSVGAlign, getSVGBaseline, getSVGBaselineShift, getStroke */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultThematicColor", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dekebabifyLineStyle", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFill", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPatternUrlWithColor", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSVGAlign", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSVGBaseline", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSVGBaselineShift", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStroke", function() { return j; });
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../assets.js */ "../node_modules/@arcgis/core/assets.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_ItemCache_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/ItemCache.js */ "../node_modules/@arcgis/core/core/ItemCache.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _cimSymbolUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cimSymbolUtils.js */ "../node_modules/@arcgis/core/symbols/support/cimSymbolUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s="picture-fill",l="simple-fill",c="simple-line",a="simple-marker",m="text",u="cim",p={left:"start",center:"middle",right:"end",justify:"start"},f={top:"text-before-edge",middle:"central",baseline:"alphabetic",bottom:"text-after-edge"},d=new _core_ItemCache_js__WEBPACK_IMPORTED_MODULE_3__["default"](1e3);function h(t){let e=t.horizontalAlignment;return e=e&&p[e.toLowerCase()]||"middle",e}function g(t){const e=t.verticalAlignment;return e&&f[e.toLowerCase()]||"alphabetic"}function y(t){return"bottom"===t.verticalAlignment?"super":null}function b(e){const r=e.style;let o=null;if(e)switch(e.type){case a:"cross"!==r&&"x"!==r&&(o=e.color);break;case l:"solid"===r?o=e.color:"none"!==r&&(o={type:"pattern",x:0,y:0,src:Object(_assets_js__WEBPACK_IMPORTED_MODULE_0__["getAssetUrl"])(`esri/symbols/patterns/${r}.png`),width:5,height:5});break;case s:o={type:"pattern",src:e.url,width:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(e.width)*e.xscale,height:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(e.height)*e.yscale,x:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(e.xoffset),y:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(e.yoffset)};break;case m:o=e.color;break;case u:o=Object(_cimSymbolUtils_js__WEBPACK_IMPORTED_MODULE_5__["getCIMSymbolColor"])(e)}return o}function w(t,e){const o=t+"-"+e;return void 0!==d.get(o)?Promise.resolve(d.get(o)):Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(t,{responseType:"image"}).then((t=>{const r=t.data,n=r.naturalWidth,i=r.naturalHeight,s=document.createElement("canvas");s.width=n,s.height=i;const l=s.getContext("2d");l.fillStyle=e,l.fillRect(0,0,n,i),l.globalCompositeOperation="destination-in",l.drawImage(r,0,0);const c=s.toDataURL();return d.put(o,c),c}))}function j(t){if(!t)return null;let e;switch(t.type){case l:case s:case a:e=j(t.outline);break;case c:{const r=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(t.width);"none"!==t.style&&0!==r&&(e={color:t.color,style:x(t.style),width:r,cap:t.cap,join:"miter"===t.join?Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["pt2px"])(t.miterLimit):t.join});break}default:e=null}return e}const x=function(){const t={};return function(e){if(t[e])return t[e];const r=e.replace(/-/g,"");return t[e]=r,r}}(),k=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([128,128,128]);


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/utils.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/utils.js ***!
  \*************************************************************/
/*! exports provided: applyColorToSymbol, applyOpacityToColor, applyRotationToSymbol, applySizesToSymbol, getColorFromSymbol, getIconHref, getSymbolOutlineSize, isVolumetricSymbol */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyColorToSymbol", function() { return v; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyOpacityToColor", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyRotationToSymbol", function() { return q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applySizesToSymbol", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getColorFromSymbol", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getIconHref", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSymbolOutlineSize", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVolumetricSymbol", function() { return w; });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _gfxUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./gfxUtils.js */ "../node_modules/@arcgis/core/symbols/support/gfxUtils.js");
/* harmony import */ var _Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const y=/\/resource\/(.*?)\.svg$/,p=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]("white");function h(e){const t=e.symbolLayers&&e.symbolLayers.length;if(!t)return;const r=e.symbolLayers.getItemAt(t-1);return"outline"in r?Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["get"])(r,"outline","size"):void 0}function b(e){if(!e)return 0;if(Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(e)){const t=h(e);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(t)?t:0}const r=Object(_gfxUtils_js__WEBPACK_IMPORTED_MODULE_7__["getStroke"])(e);return r&&Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_5__["px2pt"])(r.width)||0}function w(e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e)||!("symbolLayers"in e)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e.symbolLayers))return!1;switch(e.type){case"point-3d":return e.symbolLayers.some((e=>"object"===e.type));case"line-3d":return e.symbolLayers.some((e=>"path"===e.type));case"polygon-3d":return e.symbolLayers.some((e=>"object"===e.type||"extrude"===e.type));default:return!1}}function d(e,t){const r=t.resource.href;return!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_3__["default"])("esri-canvas-svg-support")&&e.styleOrigin&&y.test(r)?r.replace(y,"/resource/png/$1.png"):r}function g(o,n){if(!o)return null;let i=null;return Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(o)?i=j(o):Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol2D"])(o)&&(i=o.color?new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](o.color):null),i?k(i,n):null}function j(t){const r=t.symbolLayers;if(!r)return null;let o=null;return r.forEach((e=>{"object"===e.type&&null!=e.resource.href||(o="water"===e.type?Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["unwrap"])(e.color):Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.material)?Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["unwrap"])(e.material.color):null)})),o?new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](o):null}function k(t,r){if(null==r)return t;const o=t.toRgba();return o[3]=o[3]*r,new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](o)}function L(e,t,r){const o=e.symbolLayers;if(!o)return;const n=e=>{const o=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e)?e:null;return k(t=t||o||null!=r&&p,r)};o.forEach((e=>{if("object"!==e.type||null==e.resource.href||t)if("water"===e.type)e.color=n(e.color);else{const t=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.material)?e.material.color:null,o=n(t);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(e.material)?e.material=new _Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_8__["default"]({color:o}):e.material.color=o,null!=r&&"outline"in e&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.outline)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e.outline.color)&&(e.outline.color=k(e.outline.color,r))}}))}function z(e,t,r){(t=t||e.color)&&(e.color=k(t,r)),null!=r&&"outline"in e&&e.outline&&e.outline.color&&(e.outline.color=k(e.outline.color,r))}function v(o,n,i){o&&(n||null!=i)&&(n&&(n=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"](n)),Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(o)?L(o,n,i):Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol2D"])(o)&&z(o,n,i))}async function x(e,t){const r=e.symbolLayers;r&&await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_2__["forEach"])(r,(async e=>S(e,t)))}async function S(e,t){switch(e.type){case"extrude":O(e,t);break;case"icon":case"line":case"text":U(e,t);break;case"path":$(e,t);break;case"object":await R(e,t)}}function U(e,t){const r=E(t);Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(r)&&(e.size=r)}function E(e){for(const t of e)if("number"==typeof t)return t;return null}function O(e,t){e.size="number"==typeof t[2]?t[2]:0}async function R(e,t){const{resourceSize:r,symbolSize:o}=await C(e),n=A(t,r,o);e.width=D(t[0],o[0],r[0],n),e.depth=D(t[1],o[1],r[1],n),e.height=D(t[2],o[2],r[2],n)}function $(e,t){const r=A(t,_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_6__["O"],[e.width,void 0,e.height]);e.width=D(t[0],e.width,1,r),e.height=D(t[2],e.height,1,r)}function A(e,t,r){for(let o=0;o<3;o++){const n=e[o];switch(n){case"symbol-value":return null!=r[o]?r[o]/t[o]:1;case"proportional":break;default:if(n&&t[o])return n/t[o]}}return 1}async function C(e){const t=await __webpack_require__.e(/*! import() */ 139).then(__webpack_require__.bind(null, /*! ./symbolLayerUtils.js */ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils.js")),r=await t.computeObjectLayerResourceSize(e,10),{width:o,height:n,depth:i}=e,l=[o,i,n];let s=1;for(let c=0;c<3;c++)if(null!=l[c]){s=l[c]/r[c];break}for(let c=0;c<3;c++)null==l[c]&&(l[c]=r[c]*s);return{resourceSize:r,symbolSize:l}}function D(e,t,r,o){switch(e){case"proportional":return r*o;case"symbol-value":return null!=t?t:r;default:return e}}function I(e,t){const r=E(t);if(!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isNone"])(r))switch(e.type){case"simple-marker":e.size=r;break;case"picture-marker":{const t=e.width/e.height;t>1?(e.width=r,e.height=r*t):(e.width=r*t,e.height=r);break}case"simple-line":e.width=r;break;case"text":e.font.size=r}}async function M(e,o){if(e&&o)return Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(e)?x(e,o):void(Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol2D"])(e)&&I(e,o))}function q(e,o,n){if(e&&null!=o)if(Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(e)){const t=e.symbolLayers;t&&t.forEach((e=>{if(e&&"object"===e.type)switch(n){case"tilt":e.tilt=o;break;case"roll":e.roll=o;break;default:e.heading=o}}))}else Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol2D"])(e)&&("simple-marker"!==e.type&&"picture-marker"!==e.type&&"text"!==e.type||(e.angle=o))}


/***/ })

};;
//# sourceMappingURL=39.render-page.js.map
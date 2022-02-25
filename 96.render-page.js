exports.ids = [96];
exports.modules = {

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


/***/ })

};;
//# sourceMappingURL=96.render-page.js.map
exports.ids = [120];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/support/labelFormatUtils.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/labelFormatUtils.js ***!
  \***********************************************************************/
/*! exports provided: createLabelFunction, formatField */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createLabelFunction", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatField", function() { return m; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _intl_date_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../intl/date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony import */ var _intl_number_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../intl/number.js */ "../node_modules/@arcgis/core/intl/number.js");
/* harmony import */ var _fieldUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _labelUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./labelUtils.js */ "../node_modules/@arcgis/core/layers/support/labelUtils.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.layers.support.labelFormatUtils"),p={type:"simple",evaluate:()=>null},c={getAttribute:(e,t)=>e.field(t)};async function f(t,r,a){if(!t||!t.symbol)return p;const n=t.where,o=Object(_labelUtils_js__WEBPACK_IMPORTED_MODULE_5__["getLabelExpression"])(t),f=n?await Promise.resolve(/*! import() */).then(__webpack_require__.bind(null, /*! ../../core/sql/WhereClause.js */ "../node_modules/@arcgis/core/core/sql/WhereClause.js")):null;let d;if("arcade"===o.type){const t=await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_6__["createLabelExpression"])(o.expression,a,r);d={type:"arcade",evaluate(r){try{const e=t.evaluate({$feature:"attributes"in r?t.repurposeFeature(r):t.repurposeAdapter(r)});if(null!=e)return e.toString()}catch(a){u.error(new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("bad-arcade-expression","Encountered an error when evaluating label expression for feature",{feature:r,expression:o}))}return null},needsHydrationToEvaluate:()=>null==Object(_labelUtils_js__WEBPACK_IMPORTED_MODULE_5__["getSingleFieldArcadeExpression"])(o.expression)}}else d={type:"simple",evaluate:e=>o.expression.replace(/{[^}]*}/g,(t=>{const a=t.slice(1,-1),n=r.get(a);if(!n)return t;let o=null;if("attributes"in e){e&&e.attributes&&(o=e.attributes[n.name])}else o=e.field(n.name);return null==o?"":m(o,n)}))};if(n){let e;try{e=f.WhereClause.create(n,r)}catch(y){return p}const t=d.evaluate;d.evaluate=r=>{const a="attributes"in r?void 0:c;return e.testFeature(r,a)?t(r):null}}return d}function m(e,t){if(null==e)return"";const l=t.domain;if(l)if("codedValue"===l.type||"coded-value"===l.type){const t=e;for(const e of l.codedValues)if(e.code===t)return e.name}else if("range"===l.type){const t=+e,r="range"in l?l.range[0]:l.minValue,a="range"in l?l.range[1]:l.maxValue;if(r<=t&&t<=a)return l.name}let i=e;return"date"===t.type||"esriFieldTypeDate"===t.type?i=Object(_intl_date_js__WEBPACK_IMPORTED_MODULE_2__["formatDate"])(i,Object(_intl_date_js__WEBPACK_IMPORTED_MODULE_2__["convertDateFormatToIntlOptions"])("short-date")):Object(_fieldUtils_js__WEBPACK_IMPORTED_MODULE_4__["isNumericField"])(t)&&(i=Object(_intl_number_js__WEBPACK_IMPORTED_MODULE_3__["formatNumber"])(+i)),i||""}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/labelUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/labelUtils.js ***!
  \*****************************************************************/
/*! exports provided: convertTemplatedStringToArcade, getLabelExpression, getLabelExpressionArcade, getLabelExpressionSingleField, getSingleFieldArcadeExpression, getSingleFieldTemplatedString, sqlToTemplateString, templateStringToSql */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertTemplatedStringToArcade", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLabelExpression", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLabelExpressionArcade", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLabelExpressionSingleField", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSingleFieldArcadeExpression", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSingleFieldTemplatedString", function() { return $; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqlToTemplateString", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "templateStringToSql", function() { return u; });
/* harmony import */ var _core_string_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/string.js */ "../node_modules/@arcgis/core/core/string.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n="__begin__",r="__end__",s=new RegExp(n,"ig"),t=new RegExp(r,"ig"),o=new RegExp("^"+n,"i"),i=new RegExp(r+"$","i"),l='"',a=l+" + ",c=" + "+l;function p(e){return e.replace(new RegExp("\\[","g"),"{").replace(new RegExp("\\]","g"),"}")}function u(e){return e.replace(new RegExp("\\{","g"),"[").replace(new RegExp("\\}","g"),"]")}function x(e){const n={expression:"",type:"none"};return e.labelExpressionInfo?e.labelExpressionInfo.value?(n.expression=e.labelExpressionInfo.value,n.type="conventional"):e.labelExpressionInfo.expression&&(n.expression=e.labelExpressionInfo.expression,n.type="arcade"):null!=e.labelExpression&&(n.expression=p(e.labelExpression),n.type="conventional"),n}function f(e){const n=x(e);if(!n)return null;switch(n.type){case"conventional":return w(n.expression);case"arcade":return n.expression}return null}function g(e){const n=x(e);if(!n)return null;switch(n.type){case"conventional":return $(n.expression);case"arcade":return _(n.expression)}return null}function w(p){let u;return p?(u=Object(_core_string_js__WEBPACK_IMPORTED_MODULE_0__["replace"])(p,(e=>n+'$feature["'+e+'"]'+r)),u=o.test(u)?u.replace(o,""):l+u,u=i.test(u)?u.replace(i,""):u+l,u=u.replace(s,a).replace(t,c)):u='""',u}const E=/^\s*\{([^}]+)\}\s*$/i;function $(e){const n=e.match(E);return n&&n[1].trim()||null}const b=/^\s*(?:(?:\$feature\.(\w+))|(?:\$feature\[(["'])([\w\s]+)(\2)\]));?\s*$/i,m=/^\s*(?:(?:\$feature\.(\w+))|(?:\$feature\[(["'])([\w\s]+)(\2)\]));?\s*(?:DomainName\(\s*\$feature\s*,\s*(["'])(\1|\3)(\5)\s*\));?\s*$/i,R=/^\s*(?:DomainName\(\s*\$feature\s*,\s*(["'])([\w\s]+)(\1)\s*\));?\s*$/i;function _(e){if(!e)return null;let n=b.exec(e)||m.exec(e);return n?n[1]||n[3]:(n=R.exec(e),n?n[2]:null)}


/***/ })

};;
//# sourceMappingURL=120.render-page.js.map
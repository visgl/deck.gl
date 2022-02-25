exports.ids = [124];
exports.modules = {

/***/ "../node_modules/@arcgis/core/smartMapping/statistics/support/statsWorker.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/smartMapping/statistics/support/statsWorker.js ***!
  \***********************************************************************************/
/*! exports provided: getDataValues, summaryStatistics */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDataValues", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "summaryStatistics", function() { return u; });
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "../node_modules/@arcgis/core/smartMapping/statistics/support/utils.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s=null;async function u(e){const{attribute:a,featuresJSON:l}=e,{normalizationType:r,normalizationField:s,minValue:u,maxValue:c,fieldType:p}=a,f=await m({field:a.field,valueExpression:a.valueExpression,normalizationType:r,normalizationField:s,normalizationTotal:a.normalizationTotal,viewInfoParams:a.viewInfoParams},l),d=Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["isNullCountSupported"])({normalizationType:r,normalizationField:s,minValue:u,maxValue:c}),v="string"===p?Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["calculateStringStatistics"])({values:f,supportsNullCount:d}):Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["calculateStatistics"])({values:f,minValue:u,maxValue:c,useSampleStdDev:!r,supportsNullCount:d});return Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["processStatsResult"])(v,"date"===p)}async function m(i,t){if(!t)return[];const n=i.field,o=i.valueExpression,u=i.normalizationType,m=i.normalizationField,c=i.normalizationTotal,p=[],f=i.viewInfoParams;let d=null,v=null;if(o){if(!s){const{arcadeUtils:e}=await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_3__["loadArcade"])();s=e}d=s.createFunction(o),v=f&&s.getViewInfo({viewingMode:f.viewingMode,scale:f.scale,spatialReference:new _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_1__["default"](f.spatialReference)})}return t.forEach((a=>{const i=a.attributes;let t;if(o){const e=s.createExecContext(a,v);t=s.executeFunction(d,e)}else i&&(t=i[n]);if(u&&Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_0__["isFinite"])(t)){const e=i&&parseFloat(i[m]);t=Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["getNormalizedValue"])(t,u,e,c)}p.push(t)})),p}


/***/ }),

/***/ "../node_modules/@arcgis/core/smartMapping/statistics/support/utils.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/smartMapping/statistics/support/utils.js ***!
  \*****************************************************************************/
/*! exports provided: calculateStatistics, calculateStringStatistics, createError, getNormalizedValue, getRangeExpr, getSQLFilterForNormalization, isNullCountSupported, mergeWhereClauses, processStatsResult, verifyBasicFieldValidity, verifyFieldType, verifyNumericField */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateStatistics", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateStringStatistics", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createError", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNormalizedValue", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRangeExpr", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSQLFilterForNormalization", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNullCountSupported", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeWhereClauses", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "processStatsResult", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verifyBasicFieldValidity", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verifyFieldType", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verifyNumericField", function() { return m; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(e){const n=null!=e.normalizationField||null!=e.normalizationType,t=null!=e.minValue||null!=e.maxValue,l=!!e.sqlExpression&&e.supportsSQLExpression;return!n&&!t&&!l}function i(e){const n=e.returnDistinct?[...new Set(e.values)]:e.values,t=n.filter((e=>null!=e)).length,l={count:t};return e.supportsNullCount&&(l.nullcount=n.length-t),l}function r(e){const{values:n,useSampleStdDev:t,supportsNullCount:l}=e;let o=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,r=null,u=null,s=null,a=null,c=0;const f=null==e.minValue?-1/0:e.minValue,d=null==e.maxValue?1/0:e.maxValue;for(const p of n)Number.isFinite(p)?p>=f&&p<=d&&(r+=p,o=Math.min(o,p),i=Math.max(i,p),c++):"string"==typeof p&&c++;if(c&&null!=r){u=r/c;let e=0;for(const t of n)Number.isFinite(t)&&t>=f&&t<=d&&(e+=(t-u)**2);a=t?c>1?e/(c-1):0:c>0?e/c:0,s=Math.sqrt(a)}else o=null,i=null;const m={avg:u,count:c,max:i,min:o,stddev:s,sum:r,variance:a};return l&&(m.nullcount=n.length-c),m}function u(e,n){return n?(["avg","stddev","variance"].forEach((n=>{null!=e[n]&&(e[n]=Math.ceil(e[n]))})),e):e}function s(e,n,t,l){let o=null;switch(n){case"log":0!==e&&(o=Math.log(e)*Math.LOG10E);break;case"percent-of-total":Number.isFinite(l)&&0!==l&&(o=e/l*100);break;case"field":Number.isFinite(t)&&0!==t&&(o=e/t);break;case"natural-log":e>0&&(o=Math.log(e));break;case"square-root":e>0&&(o=e**.5)}return o}function a(e){const n=e.field,t=e.normalizationType,l=e.normalizationField;let o;return"log"===t?o="(NOT "+n+" = 0)":"field"===t?o="(NOT "+l+" = 0)":"natural-log"!==t&&"square-root"!==t||(o=`(${n} > 0)`),o}function c(n,t){return new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"](n,t)}function f(e,n,t){const l=null!=n?e+" >= "+n:"",o=null!=t?e+" <= "+t:"";let i="";return i=l&&o?p(l,o):l||o,i?"("+i+")":""}function d(e,n,t,l){let o=null;return n?n.name!==e.objectIdField&&-1!==l.indexOf(n.type)||(o=c(t,"'field' should be one of these types: "+l.join(","))):o=c(t,"'field' is not defined in the layer schema"),o}function m(e,n,o){let i;return n?n.name!==e.objectIdField&&Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_2__["isNumericField"])(n)||(i=c(o,"'field' should be one of these numeric types: "+_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_2__["numericTypes"].join(","))):i=c(o,"'field' is not defined in the layer schema"),i}function p(e,t){let l=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(e)?e:"";return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&t&&(l=l?"("+l+") AND ("+t+")":t),l}function h(e,n,t){const l=g({layer:e,fields:n});if(l.length)return c(t,"Unknown fields: "+l.join(", ")+". You can only use fields defined in the layer schema");const o=b({layer:e,fields:n});return o.length?c(t,"Unsupported fields: "+o.join(", ")+". You can only use fields that can be fetched i.e. AdapterFieldUsageInfo.supportsStatistics must be true"):void 0}function g(e){const n=e.layer;return e.fields.filter((e=>!n.getField(e)))}function b(e){const n=e.layer;return e.fields.filter((e=>{const t=n.getFieldUsageInfo(e);return!t||!t.supportsStatistics}))}


/***/ })

};;
//# sourceMappingURL=124.render-page.js.map
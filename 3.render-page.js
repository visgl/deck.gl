exports.ids = [3];
exports.modules = {

/***/ "../node_modules/@arcgis/core/layers/support/domainUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/domainUtils.js ***!
  \******************************************************************/
/*! exports provided: DomainValidationError, getDomainRange, isValidDomainValue, validateDomainValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomainValidationError", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDomainRange", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidDomainValue", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateDomainValue", function() { return a; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e;function n(e,n){return null===a(e,n)}function a(n,a){switch(n.type){case"range":{const r="range"in n?n.range[0]:n.minValue,u="range"in n?n.range[1]:n.maxValue;if(+a<r||+a>u)return e.VALUE_OUT_OF_RANGE;break}case"coded-value":case"codedValue":if(null==n.codedValues||n.codedValues.every((e=>null==e||e.code!==a)))return e.INVALID_CODED_VALUE}return null}function r(e){if(!e||"range"!==e.type)return;return{min:"range"in e?e.range[0]:e.minValue,max:"range"in e?e.range[1]:e.maxValue}}!function(e){e.VALUE_OUT_OF_RANGE="domain-validation-error::value-out-of-range",e.INVALID_CODED_VALUE="domain-validation-error::invalid-coded-value"}(e||(e={}));


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/fieldUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/fieldUtils.js ***!
  \*****************************************************************/
/*! exports provided: NumericRangeValidationError, TypeValidationError, collectArcadeFieldNames, collectElevationFields, collectFeatureReductionFields, collectField, collectFields, collectFilterFields, collectLabelingFields, collectOrderByInfos, doubleRange, featureHasFields, fixFields, fixRendererFields, fixTimeInfoFields, getDisplayFieldName, getElevationFields, getExpressionFields, getFeatureEditFields, getFeatureGeometryFields, getFieldDefaultValue, getFieldRange, getLabelingFields, getNumericTypeForValue, getTimeFields, integerRange, isDateField, isNumberInRange, isNumericField, isStringField, isValidFieldValue, isValueMatchingFieldType, numericTypes, packFields, populateMissingFields, rendererFields, sanitizeNullFieldValue, singleRange, smallIntegerRange, unpackFieldNames, validateFieldValue, validationErrorToString, visualVariableFields */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NumericRangeValidationError", function() { return Z; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TypeValidationError", function() { return ee; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectArcadeFieldNames", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectElevationFields", function() { return A; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectFeatureReductionFields", function() { return N; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectField", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectFields", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectFilterFields", function() { return V; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectLabelingFields", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "collectOrderByInfos", function() { return _; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "doubleRange", function() { return fe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "featureHasFields", function() { return ce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fixFields", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fixRendererFields", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fixTimeInfoFields", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDisplayFieldName", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getElevationFields", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getExpressionFields", function() { return pe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFeatureEditFields", function() { return O; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFeatureGeometryFields", function() { return L; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFieldDefaultValue", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFieldRange", function() { return re; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLabelingFields", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNumericTypeForValue", function() { return oe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTimeFields", function() { return $; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "integerRange", function() { return se; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDateField", function() { return K; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumberInRange", function() { return te; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumericField", function() { return B; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isStringField", function() { return H; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidFieldValue", function() { return Q; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValueMatchingFieldType", function() { return Y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "numericTypes", function() { return J; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "packFields", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "populateMissingFields", function() { return me; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rendererFields", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeNullFieldValue", function() { return ne; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "singleRange", function() { return ue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "smallIntegerRange", function() { return ae; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unpackFieldNames", function() { return I; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validateFieldValue", function() { return ie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validationErrorToString", function() { return de; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "visualVariableFields", function() { return f; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _domainUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./domainUtils.js */ "../node_modules/@arcgis/core/layers/support/domainUtils.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=["field","field2","field3","normalizationField","rotationInfo.field","proportionalSymbolInfo.field","proportionalSymbolInfo.normalizationField","colorInfo.field","colorInfo.normalizationField"],f=["field","normalizationField"];function d(e,n){if(null!=e&&null!=n)for(const i of Array.isArray(e)?e:[e])if(c(u,i,n),"visualVariables"in i&&i.visualVariables)for(const e of i.visualVariables)c(f,e,n)}function c(e,n,i){if(e)for(const l of e){const e=Object(_core_object_js__WEBPACK_IMPORTED_MODULE_2__["getDeepValue"])(l,n),o=e&&"function"!=typeof e&&i.get(e);o&&Object(_core_object_js__WEBPACK_IMPORTED_MODULE_2__["setDeepValue"])(l,o.name,n)}}function m(e,n){if(null!=e&&null!=n&&n.fields.length)if("startField"in e){const i=n.get(e.startField),t=n.get(e.endField);e.startField=i&&i.name||null,e.endField=t&&t.name||null}else{const i=n.get(e.startTimeField),t=n.get(e.endTimeField);e.startTimeField=i&&i.name||null,e.endTimeField=t&&t.name||null}}const p=new Set;function y(e,n){return e&&n?(p.clear(),g(p,e,n),Array.from(p).sort()):[]}function g(e,n,i){var t;if(i)if(null!=n&&null!=(t=n.fields)&&t.length)if(i.includes("*"))for(const{name:r}of n.fields)e.add(r);else for(const r of i)F(e,n,r);else{if(i.includes("*"))return e.clear(),void e.add("*");for(const n of i)e.add(n)}}function F(e,n,i){if("string"==typeof i)if(n){const t=n.get(i);t&&e.add(t.name)}else e.add(i)}function I(e,i){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(i)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isNone"])(e)?[]:i.includes("*")?e.fields.map((e=>e.name)):i}function x(e,n,i=1){if(!n||!e)return[];if(n.includes("*"))return["*"];const t=y(e,n);return t.length/e.fields.length>=i?["*"]:t}async function b(e,n,i){var t;if(!i)return;const{arcadeUtils:r}=await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_4__["loadArcade"])(),l=r.extractFieldNames(i,null==n||null==(t=n.fields)?void 0:t.map((e=>e.name)));for(const o of l)F(e,n,o)}async function T(n,i,t){if(t&&"1=1"!==t){const r=(await __webpack_require__.e(/*! import() */ 14).then(__webpack_require__.bind(null, /*! ../../core/sql/WhereClause.js */ "../node_modules/@arcgis/core/core/sql/WhereClause.js"))).WhereClause.create(t,i);if(!r.isStandardized)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("fieldUtils:collectFilterFields","Where clause is not standardized");g(n,i,r.fieldNames)}}function h({displayField:e,fields:n}){return e||(n&&n.length?w(n,"name-or-title")||w(n,"unique-identifier")||w(n,"type-or-category")||v(n):null)}function v(e){for(const n of e){if(!n||!n.name)continue;const e=n.name.toLowerCase();if(e.indexOf("name")>-1||e.indexOf("title")>-1)return n.name}return null}function w(e,n){for(const i of e)if(i&&i.valueType&&i.valueType===n)return i.name;return null}async function S(e){if(!e)return[];const n=new Set;return await A(n,e),Array.from(n).sort()}async function A(e,n){if(!n)return;const i=Object(_core_object_js__WEBPACK_IMPORTED_MODULE_2__["getDeepValue"])("elevationInfo.featureExpressionInfo",n);return i?i.collectRequiredFields(e,n.fieldsIndex):void 0}async function E(e,n,i){i.outStatistic.onStatisticValueExpression?b(e,n,i.outStatistic.onStatisticValueExpression):e.add(i.outStatistic.onStatisticField)}async function N(e,n,i){var t;if(!n||!i||"cluster"!==i.type)return;const r=[];null!=(t=i.popupTemplate)&&t.expressionInfos&&r.push(...i.popupTemplate.expressionInfos.map((i=>b(e,n.fieldsIndex,i.expression)))),i.fields&&r.push(...i.fields.map((i=>E(e,n.fieldsIndex,i)))),await Promise.all(r)}async function V(e,n,t){n&&(n.timeInfo&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&t.timeExtent&&g(e,n.fieldsIndex,[n.timeInfo.startField,n.timeInfo.endField]),n.floorInfo&&g(e,n.fieldsIndex,[n.floorInfo.floorField]),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t.where)&&await T(e,n.fieldsIndex,t.where))}async function _(e,n,i){n&&i&&await Promise.all(i.map((i=>D(e,n,i))))}async function D(e,n,i){n&&i&&(i.valueExpression?await b(e,n.fieldsIndex,i.valueExpression):i.field&&F(e,n.fieldsIndex,i.field))}async function $(e){if(!e)return[];const n="timeInfo"in e&&e.timeInfo;return n?y(e.fieldsIndex,[e.trackIdField,n.startField,n.endField]):[]}function O(e){if(!e)return[];const n="editFieldsInfo"in e&&e.editFieldsInfo;return n?y(e.fieldsIndex,[n&&n.creatorField,n&&n.creationDateField,n&&n.editorField,n&&n.editDateField]):[]}function L(e){if(!e)return[];const n=e.geometryFieldsInfo;return n?y(e.fieldsIndex,[n.shapeAreaField,n.shapeLengthField]):[]}async function U(e){if(!e)return[];const n=new Set;return await j(n,e),Array.from(n).sort()}async function j(e,n){const{labelingInfo:i,fieldsIndex:t}=n;i&&i.length&&await Promise.all(i.map((n=>z(e,t,n))))}async function z(e,n,i){if(!i)return;const t=i.getLabelExpression(),r=i.where;if("arcade"===t.type)await b(e,n,t.expression);else{const i=t.expression.match(/{[^}]*}/g);i&&i.forEach((i=>{F(e,n,i.slice(1,-1))}))}await T(e,n,r)}function P(e){const n=e.defaultValue;return void 0!==n&&Y(e,n)?n:e.nullable?null:void 0}function k(e){return"number"==typeof e&&!isNaN(e)&&isFinite(e)}function R(e){return null===e||k(e)}const C="isInteger"in Number?Number.isInteger:e=>"number"==typeof e&&isFinite(e)&&Math.floor(e)===e;function G(e){return null===e||C(e)}function q(e){return null!=e&&"string"==typeof e}function M(e){return null===e||q(e)}function W(){return!0}function Y(e,n){let i;switch(e.type){case"date":case"integer":case"long":case"small-integer":case"esriFieldTypeDate":case"esriFieldTypeInteger":case"esriFieldTypeLong":case"esriFieldTypeSmallInteger":i=e.nullable?G:C;break;case"double":case"single":case"esriFieldTypeSingle":case"esriFieldTypeDouble":i=e.nullable?R:k;break;case"string":case"esriFieldTypeString":i=e.nullable?M:q;break;default:i=W}return 1===arguments.length?i:i(n)}const J=["integer","small-integer","single","double"],X=new Set([...J,"esriFieldTypeInteger","esriFieldTypeSmallInteger","esriFieldTypeSingle","esriFieldTypeDouble"]);function B(e){return null!=e&&X.has(e.type)}function H(e){return null!=e&&("string"===e.type||"esriFieldTypeString"===e.type)}function K(e){return null!=e&&("date"===e.type||"esriFieldTypeDate"===e.type)}function Q(e,n){return null===ie(e,n)}var Z,ee;function ne(e){return null==e||"number"==typeof e&&isNaN(e)?null:e}function ie(e,n){return e.nullable&&null===n?null:B(e)&&!te(e.type,Number(n))?Z.OUT_OF_RANGE:Y(e,n)?e.domain?Object(_domainUtils_js__WEBPACK_IMPORTED_MODULE_3__["validateDomainValue"])(e.domain,n):null:ee.INVALID_TYPE}function te(e,n){const i="string"==typeof e?le(e):e;return!!i&&(i.isInteger?C(n)&&n>=i.min&&n<=i.max:n>=i.min&&n<=i.max)}function re(e){const n=Object(_domainUtils_js__WEBPACK_IMPORTED_MODULE_3__["getDomainRange"])(e.domain);return n||(B(e)?le(e.type):void 0)}function le(e){switch(e){case"esriFieldTypeSmallInteger":case"small-integer":return ae;case"esriFieldTypeInteger":case"integer":return se;case"esriFieldTypeSingle":case"single":return ue;case"esriFieldTypeDouble":case"double":return fe}}function oe(e){if(!k(e))return null;if(C(e)){if(e>=ae.min&&e<=ae.max)return"esriFieldTypeSmallInteger";if(e>=se.min&&e<=se.max)return"esriFieldTypeInteger"}return e>=ue.min&&e<=ue.max?"esriFieldTypeSingle":"esriFieldTypeDouble"}!function(e){e.OUT_OF_RANGE="numeric-range-validation-error::out-of-range"}(Z||(Z={})),function(e){e.INVALID_TYPE="type-validation-error::invalid-type"}(ee||(ee={}));const ae={min:-32768,max:32767,isInteger:!0},se={min:-2147483648,max:2147483647,isInteger:!0},ue={min:-34e37,max:12e37,isInteger:!1},fe={min:-Number.MAX_VALUE,max:Number.MAX_VALUE,isInteger:!1};function de(e,n,i){switch(e){case _domainUtils_js__WEBPACK_IMPORTED_MODULE_3__["DomainValidationError"].INVALID_CODED_VALUE:return`Value ${i} is not in the coded domain - field: ${n.name}, domain: ${JSON.stringify(n.domain)}`;case _domainUtils_js__WEBPACK_IMPORTED_MODULE_3__["DomainValidationError"].VALUE_OUT_OF_RANGE:return`Value ${i} is out of the range of valid values - field: ${n.name}, domain: ${JSON.stringify(n.domain)}`;case ee.INVALID_TYPE:return`Value ${i} is not a valid value for the field type - field: ${n.name}, type: ${n.type}, nullable: ${n.nullable}`;case Z.OUT_OF_RANGE:{const{min:e,max:t}=le(n.type);return`Value ${i} is out of range for the number type - field: ${n.name}, type: ${n.type}, value range is ${e} to ${t}`}}}function ce(e,n){return!me(e,n,null)}function me(e,n,t){if(!n||!n.attributes||!e){if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t))for(const n of e)t.add(n);return!0}const r=n.attributes;let l=!1;for(const o of e)if(!(o in r)){if(l=!0,!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t))break;t.add(o)}return l}async function pe(e,n){const i=new Set;for(const t of n)await b(i,e.fieldsIndex,t);return Array.from(i).sort()}


/***/ }),

/***/ "../node_modules/@arcgis/core/support/arcadeOnDemand.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/arcadeOnDemand.js ***!
  \**************************************************************/
/*! exports provided: ArcadeExpression, createDictionaryExpression, createLabelExpression, createRendererExpression, createVVExpression, default, loadArcade */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArcadeExpression", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDictionaryExpression", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createLabelExpression", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createRendererExpression", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createVVExpression", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadArcade", function() { return a; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let t;function a(){return t||(t=(async()=>{const e=await Promise.all(/*! import() */[__webpack_require__.e(16), __webpack_require__.e(59)]).then(__webpack_require__.bind(null, /*! ./arcadeUtils.js */ "../node_modules/@arcgis/core/support/arcadeUtils.js"));return{arcade:e.arcade,arcadeUtils:e,Dictionary:e.Dictionary,Feature:e.arcadeFeature}})()),t}const s=(e,r,t)=>o.create(e,r,t,null,["$feature"]),i=(e,r,t)=>o.create(e,r,t,null,["$feature","$view"]),c=i,n=(e,r,t,a)=>o.create(e,r,t,a,["$feature","$view"]);class o{constructor(e,r,t,a,s,i,c,n){this.script=e,this.evaluate=s;const o=Array.isArray(c)?c:c.fields;this.fields=o,this._syntaxTree=a,this._arcade=r,this._arcadeDictionary=t,this._arcadeFeature=i,this._spatialReference=n,this._referencesGeometry=r.scriptTouchesGeometry(this._syntaxTree),this._referencesScale=this._arcade.referencesMember(this._syntaxTree,"scale")}static async create(t,s,i,c,n,l){const{arcade:u,Feature:p,Dictionary:f}=await a(),d=_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(s),y=u.parseScript(t,l),h=n.reduce(((e,r)=>({...e,[r]:null})),{});let m=null;Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(c)&&(m=new f(c),m.immutable=!0,h.$config=null);const _=u.scriptUsesGeometryEngine(y)&&u.enableGeometrySupport(),F=u.scriptUsesFeatureSet(y)&&u.enableFeatureSetSupport(),w=u.scriptIsAsync(y)&&u.enableAsyncSupport(),S={vars:h,spatialReference:d,useAsync:!!w},b=new f;b.immutable=!1,b.setField("scale",0);const $=u.compileScript(y,S),x=e=>("$view"in e&&e.$view&&(b.setField("scale",e.$view.scale),e.$view=b),m&&(e.$config=m),$({vars:e,spatialReference:d}));return await Promise.all([_,F,w]),new o(t,u,f,y,x,new p,i,d)}repurposeFeature(e){return e.geometry&&!e.geometry.spatialReference&&(e.geometry.spatialReference=this._spatialReference),this._arcadeFeature.repurposeFromGraphicLikeObject(e.geometry,e.attributes,{fields:this.fields}),this._arcadeFeature}repurposeAdapter(e){return this._arcadeFeature.repurposeFromAdapter(e,{fields:this.fields}),this._arcadeFeature}createDictionary(){return new this._arcadeDictionary}referencesMember(e){return this._arcade.referencesMember(this._syntaxTree,e)}referencesFunction(e){return this._arcade.referencesFunction(this._syntaxTree,e)}referencesGeometry(){return this._referencesGeometry}referencesScale(){return this._referencesScale}extractFieldLiterals(){return this._arcade.extractExpectedFieldLiterals(this._syntaxTree)}}


/***/ }),

/***/ "../node_modules/@arcgis/core/webdoc/support/opacityUtils.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/webdoc/support/opacityUtils.js ***!
  \*******************************************************************/
/*! exports provided: opacityToTransparency, transparencyToOpacity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "opacityToTransparency", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transparencyToOpacity", function() { return r; });
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(n){const r=Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_0__["ensureInteger"])(100*(1-n));return Math.max(0,Math.min(r,100))}function r(t){const n=1-t/100;return Math.max(0,Math.min(n,1))}


/***/ })

};;
//# sourceMappingURL=3.render-page.js.map
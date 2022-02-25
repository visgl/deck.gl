exports.ids = [6];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/MemCache.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/core/MemCache.js ***!
  \*****************************************************/
/*! exports provided: MIN_PRIORITY, MemCache, MemCacheStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MIN_PRIORITY", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MemCache", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MemCacheStorage", function() { return i; });
/* harmony import */ var _PooledArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PooledArray.js */ "../node_modules/@arcgis/core/core/PooledArray.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=-3;class s{constructor(t,e,s){this._namespace=t,this._storage=e,this._removeFunc=!1,this._hit=0,this._miss=0,this._storage.register(this),this._namespace+=":",s&&(this._storage.registerRemoveFunc(this._namespace,s),this._removeFunc=!0)}destroy(){this._storage.clear(this._namespace),this._removeFunc&&this._storage.deregisterRemoveFunc(this._namespace),this._storage.deregister(this),this._storage=null}get namespace(){return this._namespace.slice(0,-1)}get hitRate(){return this._hit/(this._hit+this._miss)}get size(){return this._storage.size}get maxSize(){return this._storage.maxSize}resetHitRate(){this._hit=this._miss=0}put(t,e,s,i=0){this._storage.put(this._namespace+t,e,s,i)}get(t){const e=this._storage.get(this._namespace+t);return void 0===e?++this._miss:++this._hit,e}pop(t){const e=this._storage.pop(this._namespace+t);return void 0===e?++this._miss:++this._hit,e}updateSize(t,e,s){this._storage.updateSize(this._namespace+t,e,s)}clear(){this._storage.clear(this._namespace)}clearAll(){this._storage.clearAll()}getStats(){return this._storage.getStats()}resetStats(){this._storage.resetStats()}}class i{constructor(e=10485760){this._maxSize=e,this._db=new Map,this._size=0,this._hit=0,this._miss=0,this._removeFuncs=new _PooledArray_js__WEBPACK_IMPORTED_MODULE_0__["default"],this._users=new _PooledArray_js__WEBPACK_IMPORTED_MODULE_0__["default"]}destroy(){this.clearAll(),this._removeFuncs.clear(),this._users.clear(),this._db=null}register(t){this._users.push(t)}deregister(t){this._users.removeUnordered(t)}registerRemoveFunc(t,e){this._removeFuncs.push([t,e])}deregisterRemoveFunc(t){this._removeFuncs.filterInPlace((e=>e[0]!==t))}get size(){return this._size}get maxSize(){return this._maxSize}set maxSize(t){this._maxSize=Math.max(t,0),this._checkSizeLimit()}put(t,s,i,h){const r=this._db.get(t);if(r&&(this._size-=r.size,this._db.delete(t),r.entry!==s&&this._notifyRemoved(t,r.entry)),i>this._maxSize)return void this._notifyRemoved(t,s);if(void 0===s)return void console.warn("Refusing to cache undefined entry ");if(!i||i<0)return void console.warn("Refusing to cache entry with invalid size "+i);const _=1+Math.max(h,e)-e;this._db.set(t,{entry:s,size:i,lifetime:_,lives:_}),this._size+=i,this._checkSizeLimit()}updateSize(t,e,s){const i=this._db.get(t);if(i&&i.entry===e){if(this._size-=i.size,s>this._maxSize)return this._db.delete(t),void this._notifyRemoved(t,e);i.size=s,this._size+=s,this._checkSizeLimit()}}pop(t){const e=this._db.get(t);if(e)return this._size-=e.size,this._db.delete(t),++this._hit,e.entry;++this._miss}get(t){const e=this._db.get(t);if(void 0!==e)return this._db.delete(t),e.lives=e.lifetime,this._db.set(t,e),++this._hit,e.entry;++this._miss}getStats(){const t={Size:Math.round(this._size/1048576)+"/"+Math.round(this._maxSize/1048576)+"MB","Hit rate":Math.round(100*this._getHitRate())+"%",Entries:this._db.size.toString()},s={},i=new Array;this._db.forEach(((t,e)=>{const h=t.lifetime;i[h]=(i[h]||0)+t.size,this._users.forAll((i=>{const h=i.namespace;if(e.startsWith(h)){const e=s[h]||0;s[h]=e+t.size}}))}));const h={};this._users.forAll((t=>{const e=t.namespace;if(!isNaN(t.hitRate)&&t.hitRate>0){const i=s[e]||0;s[e]=i,h[e]=Math.round(100*t.hitRate)+"%"}else h[e]="0%"}));const r=Object.keys(s);r.forEach((t=>s[t]=s[t]/this._size*100)),r.sort(((t,e)=>s[e]-s[t])),r.forEach((e=>t[e]=Math.round(s[e])+"% / "+h[e]));for(let _=i.length-1;_>=0;--_){const s=i[_];s&&(t["Priority "+(_+e-1)]=Math.round(s/this.size*100)+"%")}return t}resetStats(){this._hit=this._miss=0,this._users.forAll((t=>t.resetHitRate()))}clear(t){this._db.forEach(((e,s)=>{s.startsWith(t)&&(this._size-=e.size,this._db.delete(s),this._notifyRemoved(s,e.entry))}))}clearAll(){this._db.forEach(((t,e)=>this._notifyRemoved(e,t.entry))),this._size=0,this._db.clear()}_getHitRate(){return this._hit/(this._hit+this._miss)}_notifyRemoved(t,e){this._removeFuncs.forAll((s=>{t.startsWith(s[0])&&s[1](e)}))}_checkSizeLimit(){if(!(this._size<=this._maxSize))for(const[t,e]of this._db)if(this._db.delete(t),e.lives<=1?(this._size-=e.size,this._notifyRemoved(t,e.entry)):(--e.lives,this._db.set(t,e)),this._size<=.9*this.maxSize)return}}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/devEnvironmentUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/devEnvironmentUtils.js ***!
  \****************************************************************/
/*! exports provided: adjustStaticAGOUrl, isDevEnvironment, isTelemetryDevEnvironment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "adjustStaticAGOUrl", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDevEnvironment", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTelemetryDevEnvironment", function() { return o; });
/* harmony import */ var _global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global.js */ "../node_modules/@arcgis/core/core/global.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(a){return a=a||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname,e.some((c=>{var t;return null!=(null==(t=a)?void 0:t.match(c))}))}function t(a,t){return a&&(t=t||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname)?null!=t.match(r)||null!=t.match(m)?a.replace("static.arcgis.com","staticdev.arcgis.com"):null!=t.match(n)||null!=t.match(s)?a.replace("static.arcgis.com","staticqa.arcgis.com"):a:a}function o(a){a=a||_global_js__WEBPACK_IMPORTED_MODULE_0__["default"].location.hostname;return[/^zrh-.+?\.esri\.com$/].concat(e).some((c=>{var t;return null!=(null==(t=a)?void 0:t.match(c))}))}const r=/^devext.arcgis.com$/,n=/^qaext.arcgis.com$/,m=/^[\w-]*\.mapsdevext.arcgis.com$/,s=/^[\w-]*\.mapsqa.arcgis.com$/,e=[/^([\w-]*\.)?[\w-]*\.zrh-dev-local.esri.com$/,r,n,/^jsapps.esri.com$/,m,s];


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return N; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./support/ClassBreakInfo.js */ "../node_modules/@arcgis/core/renderers/support/ClassBreakInfo.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/renderers/support/commonProperties.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var F;const E=_core_Logger_js__WEBPACK_IMPORTED_MODULE_4__["default"].getLogger("esri.renderers.ClassBreaksRenderer"),j="log",w="percent-of-total",z="field",T=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({esriNormalizeByLog:j,esriNormalizeByPercentOfTotal:w,esriNormalizeByField:z}),_=Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_13__["ensureType"])(_support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_17__["default"]);let C=F=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_16__["VisualVariablesMixin"])(_Renderer_js__WEBPACK_IMPORTED_MODULE_15__["default"])){constructor(e){super(e),this._compiledValueExpression={valueExpression:null,compiledFunction:null},this.backgroundFillSymbol=null,this.classBreakInfos=null,this.defaultLabel=null,this.defaultSymbol=null,this.field=null,this.isMaxInclusive=!0,this.legendOptions=null,this.normalizationField=null,this.normalizationTotal=null,this.type="class-breaks",this.valueExpression=null,this.valueExpressionTitle=null,this._set("classBreakInfos",[])}readClassBreakInfos(e,s,t){if(!Array.isArray(e))return;let o=s.minValue;return e.map((e=>{const s=new _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_17__["default"];return s.read(e,t),null==s.minValue&&(s.minValue=o),null==s.maxValue&&(s.maxValue=s.minValue),o=s.maxValue,s}))}writeClassBreakInfos(e,s,t,o){const r=e.map((e=>e.write({},o)));this._areClassBreaksConsecutive()&&r.forEach((e=>delete e.classMinValue)),s[t]=r}castField(e){return null==e?e:"function"==typeof e?(E.error(".field: field must be a string value"),null):Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_13__["ensureString"])(e)}get minValue(){return this.classBreakInfos&&this.classBreakInfos[0]&&this.classBreakInfos[0].minValue||0}get normalizationType(){let e=this._get("normalizationType");const s=!!this.normalizationField,t=null!=this.normalizationTotal;return s||t?(e=s&&z||t&&w||null,s&&t&&E.warn("warning: both normalizationField and normalizationTotal are set!")):e!==z&&e!==w||(e=null),e}set normalizationType(e){this._set("normalizationType",e)}addClassBreakInfo(e,t,r){let i=null;i="number"==typeof e?new _support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_17__["default"]({minValue:e,maxValue:t,symbol:Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["ensureType"])(r)}):_(Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(e)),this.classBreakInfos.push(i),1===this.classBreakInfos.length&&this.notifyChange("minValue")}removeClassBreakInfo(e,s){const t=this.classBreakInfos.length;for(let o=0;o<t;o++){const t=[this.classBreakInfos[o].minValue,this.classBreakInfos[o].maxValue];if(t[0]===e&&t[1]===s){this.classBreakInfos.splice(o,1);break}}}getBreakIndex(e,s){return this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s.arcade))&&E.warn(""),this.valueExpression?this._getBreakIndexForExpression(e,s):this._getBreakIndexForField(e)}async getClassBreakInfo(e,s){let t=s;this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s.arcade))&&(t={...t,arcade:await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_20__["loadArcade"])()});const o=this.getBreakIndex(e,t);return-1!==o?this.classBreakInfos[o]:null}getSymbol(e,s){if(this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s.arcade)))return void E.error("#getSymbol()","Please use getSymbolAsync if valueExpression is used");const t=this.getBreakIndex(e,s);return t>-1?this.classBreakInfos[t].symbol:this.defaultSymbol}async getSymbolAsync(e,s){let t=s;if(this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(s.arcade))){const e=await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_20__["loadArcade"])(),{arcadeUtils:s}=e;s.hasGeometryOperations(this.valueExpression)&&await s.enableGeometryOperations(),t={...t,arcade:e}}const o=this.getBreakIndex(e,t);return o>-1?this.classBreakInfos[o].symbol:this.defaultSymbol}getSymbols(){const e=[];return this.classBreakInfos.forEach((s=>{s.symbol&&e.push(s.symbol)})),this.defaultSymbol&&e.push(this.defaultSymbol),e}getAttributeHash(){return this.visualVariables&&this.visualVariables.reduce(((e,s)=>e+s.getAttributeHash()),"")}getMeshHash(){const e=JSON.stringify(this.backgroundFillSymbol),s=JSON.stringify(this.defaultSymbol),t=`${this.normalizationField}.${this.normalizationType}.${this.normalizationTotal}`;return`${e}.${s}.${this.classBreakInfos.reduce(((e,s)=>e+s.getMeshHash()),"")}.${t}.${this.field}.${this.valueExpression}`}get arcadeRequired(){return this.arcadeRequiredForVisualVariables||!!this.valueExpression}clone(){return new F({field:this.field,backgroundFillSymbol:this.backgroundFillSymbol&&this.backgroundFillSymbol.clone(),defaultLabel:this.defaultLabel,defaultSymbol:this.defaultSymbol&&this.defaultSymbol.clone(),valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,classBreakInfos:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.classBreakInfos),isMaxInclusive:this.isMaxInclusive,normalizationField:this.normalizationField,normalizationTotal:this.normalizationTotal,normalizationType:this.normalizationType,visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.visualVariables),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.legendOptions),authoringInfo:this.authoringInfo&&this.authoringInfo.clone()})}async collectRequiredFields(e,s){const t=[this.collectVVRequiredFields(e,s),this.collectSymbolFields(e,s)];await Promise.all(t)}async collectSymbolFields(e,s){const t=[...this.getSymbols().map((t=>t.collectRequiredFields(e,s))),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__["collectArcadeFieldNames"])(e,s,this.valueExpression)];Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__["collectField"])(e,s,this.field),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_14__["collectField"])(e,s,this.normalizationField),await Promise.all(t)}_getBreakIndexForExpression(e,s){const{viewingMode:t,scale:o,spatialReference:r,arcade:i}=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["unwrapOr"])(s,{});let n=this._compiledValueExpression.valueExpression===this.valueExpression?this._compiledValueExpression.compiledFunction:null;const u=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["unwrap"])(i).arcadeUtils;if(!n){const e=u.createSyntaxTree(this.valueExpression);n=u.createFunction(e),this._compiledValueExpression.compiledFunction=n}this._compiledValueExpression.valueExpression=this.valueExpression;const c=u.executeFunction(n,u.createExecContext(e,u.getViewInfo({viewingMode:t,scale:o,spatialReference:r})));return this._getBreakIndexfromInfos(c)}_getBreakIndexForField(e){const s=this.field,t=e.attributes,o=this.normalizationType;let r=parseFloat(t[s]);if(o){const e=this.normalizationTotal,s=parseFloat(t[this.normalizationField]);if(o===j)r=Math.log(r)*Math.LOG10E;else if(o!==w||isNaN(e)){if(o===z&&!isNaN(s)){if(isNaN(r)||isNaN(s))return-1;r/=s}}else r=r/e*100}return this._getBreakIndexfromInfos(r)}_getBreakIndexfromInfos(e){const s=this.isMaxInclusive;if(null!=e&&"number"==typeof e&&!isNaN(e))for(let t=0;t<this.classBreakInfos.length;t++){const o=[this.classBreakInfos[t].minValue,this.classBreakInfos[t].maxValue];if(o[0]<=e&&(s?e<=o[1]:e<o[1]))return t}return-1}_areClassBreaksConsecutive(){const e=this.classBreakInfos,s=e.length;for(let t=1;t<s;t++)if(e[t-1].maxValue!==e[t].minValue)return!1;return!0}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__["rendererBackgroundFillSymbolProperty"])],C.prototype,"backgroundFillSymbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:[_support_ClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_17__["default"]]})],C.prototype,"classBreakInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("classBreakInfos")],C.prototype,"readClassBreakInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("classBreakInfos")],C.prototype,"writeClassBreakInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:!0}})],C.prototype,"defaultLabel",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_18__["rendererSymbolProperty"])],C.prototype,"defaultSymbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:!0}})],C.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__["cast"])("field")],C.prototype,"castField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Boolean})],C.prototype,"isMaxInclusive",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_19__["default"],json:{write:!0}})],C.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Number,readOnly:!0,value:null,json:{read:!1,write:{overridePolicy(){return 0!==this.classBreakInfos.length&&this._areClassBreaksConsecutive()?{enabled:!0}:{enabled:!1}}}}})],C.prototype,"minValue",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:!0}})],C.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Number,cast:e=>Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_13__["ensureNumber"])(e),json:{write:!0}})],C.prototype,"normalizationTotal",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:T.apiValues,value:null,json:{type:T.jsonValues,read:T.read,write:T.write}})],C.prototype,"normalizationType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__["enumeration"])({classBreaks:"class-breaks"})],C.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:!0}})],C.prototype,"valueExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,json:{write:!0}})],C.prototype,"valueExpressionTitle",void 0),C=F=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__["subclass"])("esri.renderers.ClassBreaksRenderer")],C);var N=C;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/Renderer.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/Renderer.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_AuthoringInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./support/AuthoringInfo.js */ "../node_modules/@arcgis/core/renderers/support/AuthoringInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({simple:"simple",uniqueValue:"unique-value",classBreaks:"class-breaks",heatmap:"heatmap",dotDensity:"dot-density",dictionary:"dictionary"},{ignoreUnknown:!0});let a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r),this.authoringInfo=null,this.type=null}async getRequiredFields(r){if(!this.collectRequiredFields)return[];const e=new Set;return await this.collectRequiredFields(e,r),Array.from(e).sort()}getSymbol(r,e){}async getSymbolAsync(r,e){}getSymbols(){return[]}getAttributeHash(){return JSON.stringify(this)}getMeshHash(){return JSON.stringify(this)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_AuthoringInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"],json:{write:!0}})],a.prototype,"authoringInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:n.apiValues,readOnly:!0,json:{type:n.jsonValues,read:!1,write:{writer:n.write,ignoreOrigin:!0}}})],a.prototype,"type",void 0),a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.Renderer")],a);var p=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return P; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _core_accessorSupport_diffUtils_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/accessorSupport/diffUtils.js */ "../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/renderers/support/commonProperties.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/* harmony import */ var _support_UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./support/UniqueValueInfo.js */ "../node_modules/@arcgis/core/renderers/support/UniqueValueInfo.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _symbols_support_styleUtils_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../symbols/support/styleUtils.js */ "../node_modules/@arcgis/core/symbols/support/styleUtils.js");
/* harmony import */ var _symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ../symbols/WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var E;const M=_core_Logger_js__WEBPACK_IMPORTED_MODULE_4__["default"].getLogger("esri.renderers.UniqueValueRenderer"),N=Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_15__["ensureType"])(_support_UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_22__["default"]);let R=E=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_19__["VisualVariablesMixin"])(_Renderer_js__WEBPACK_IMPORTED_MODULE_18__["default"])){constructor(e){super(e),this._valueInfoMap={},this._isDefaultSymbolDerived=!1,this.type="unique-value",this.backgroundFillSymbol=null,this.field=null,this.field2=null,this.field3=null,this.valueExpression=null,this.valueExpressionTitle=null,this.legendOptions=null,this.defaultLabel=null,this.fieldDelimiter=null,this.portal=null,this.styleOrigin=null,this.diff={uniqueValueInfos(e,t){if(!e&&!t)return;if(!e||!t)return{type:"complete",oldValue:e,newValue:t};let i=!1;const r={type:"collection",added:[],removed:[],changed:[],unchanged:[]};for(let s=0;s<t.length;s++){const l=e.find((e=>e.value===t[s].value));l?Object(_core_accessorSupport_diffUtils_js__WEBPACK_IMPORTED_MODULE_14__["diff"])(l,t[s])?(r.changed.push({type:"complete",oldValue:l,newValue:t[s]}),i=!0):r.unchanged.push({oldValue:l,newValue:t[s]}):(r.added.push(t[s]),i=!0)}for(let s=0;s<e.length;s++){t.find((t=>t.value===e[s].value))||(r.removed.push(e[s]),i=!0)}return i?r:void 0}},this._set("uniqueValueInfos",[])}get _cache(){return{compiledFunc:null}}castField(e){return null==e||"function"==typeof e?e:Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_15__["ensureString"])(e)}writeField(e,t,r,s){"string"==typeof e?t[r]=e:s&&s.messages?s.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("property:unsupported","UniqueValueRenderer.field set to a function cannot be written to JSON")):M.error(".field: cannot write field to JSON since it's not a string value")}set defaultSymbol(e){this._isDefaultSymbolDerived=!1,this._set("defaultSymbol",e)}readPortal(e,t,i){return i.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_17__["default"].getDefault()}readStyleOrigin(e,t,i){if(t.styleName)return Object.freeze({styleName:t.styleName});if(t.styleUrl){const e=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_24__["f"])(t.styleUrl,i);return Object.freeze({styleUrl:e})}}writeStyleOrigin(e,t,i,r){e.styleName?t.styleName=e.styleName:e.styleUrl&&(t.styleUrl=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_24__["t"])(e.styleUrl,r))}set uniqueValueInfos(e){this.styleOrigin?M.error("#uniqueValueInfos=","Cannot modify unique value infos of a UniqueValueRenderer created from a web style"):(this._set("uniqueValueInfos",e),this._updateValueInfoMap())}addUniqueValueInfo(e,i){if(this.styleOrigin)return void M.error("#addUniqueValueInfo()","Cannot modify unique value infos of a UniqueValueRenderer created from a web style");let r;r="object"==typeof e?N(e):new _support_UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_22__["default"]({value:e,symbol:Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["ensureType"])(i)}),this.uniqueValueInfos.push(r),this._valueInfoMap[r.value]=r}removeUniqueValueInfo(e){if(this.styleOrigin)M.error("#removeUniqueValueInfo()","Cannot modify unique value infos of a UniqueValueRenderer created from a web style");else for(let t=0;t<this.uniqueValueInfos.length;t++){if(this.uniqueValueInfos[t].value===e+""){delete this._valueInfoMap[e],this.uniqueValueInfos.splice(t,1);break}}}async getUniqueValueInfo(e,t){let i=t;return this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(t)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(t.arcade))&&(i={...i,arcade:await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_23__["loadArcade"])()}),this._getUniqueValueInfo(e,i)}getSymbol(e,t){if(this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(t)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(t.arcade)))return void M.error("#getSymbol()","Please use getSymbolAsync if valueExpression is used");const i=this._getUniqueValueInfo(e,t);return i&&i.symbol||this.defaultSymbol}async getSymbolAsync(e,t){let i=t;if(this.valueExpression&&(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(i)||Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["isNone"])(i.arcade))){const e=await Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_23__["loadArcade"])(),{arcadeUtils:t}=e;t.hasGeometryOperations(this.valueExpression)&&await t.enableGeometryOperations(),i={...i,arcade:e}}const r=this._getUniqueValueInfo(e,i);return r&&r.symbol||this.defaultSymbol}getSymbols(){const e=[];for(const t of this.uniqueValueInfos)t.symbol&&e.push(t.symbol);return this.defaultSymbol&&e.push(this.defaultSymbol),e}getAttributeHash(){return this.visualVariables&&this.visualVariables.reduce(((e,t)=>e+t.getAttributeHash()),"")}getMeshHash(){return`${JSON.stringify(this.backgroundFillSymbol)}.${JSON.stringify(this.defaultSymbol)}.${this.uniqueValueInfos.reduce(((e,t)=>e+t.getMeshHash()),"")}.${`${this.field}.${this.field2}.${this.field3}.${this.fieldDelimiter}`}.${this.valueExpression}`}clone(){const e=new E({field:this.field,field2:this.field2,field3:this.field3,defaultLabel:this.defaultLabel,defaultSymbol:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.defaultSymbol),valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,fieldDelimiter:this.fieldDelimiter,visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.visualVariables),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.legendOptions),authoringInfo:this.authoringInfo&&this.authoringInfo.clone(),backgroundFillSymbol:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.backgroundFillSymbol)});this._isDefaultSymbolDerived&&(e._isDefaultSymbolDerived=!0),e._set("portal",this.portal);const t=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.uniqueValueInfos);return this.styleOrigin&&(e._set("styleOrigin",Object.freeze(Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.styleOrigin))),Object.freeze(t)),e._set("uniqueValueInfos",t),e._updateValueInfoMap(),e}get arcadeRequired(){return this.arcadeRequiredForVisualVariables||!!this.valueExpression}async collectRequiredFields(e,t){const i=[this.collectVVRequiredFields(e,t),this.collectSymbolFields(e,t)];await Promise.all(i)}async collectSymbolFields(e,t){const i=[...this.getSymbols().map((i=>i.collectRequiredFields(e,t))),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_16__["collectArcadeFieldNames"])(e,t,this.valueExpression)];Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_16__["collectField"])(e,t,this.field),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_16__["collectField"])(e,t,this.field2),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_16__["collectField"])(e,t,this.field3),await Promise.all(i)}populateFromStyle(){return Object(_symbols_support_styleUtils_js__WEBPACK_IMPORTED_MODULE_25__["fetchStyle"])(this.styleOrigin,{portal:this.portal}).then((e=>{const t=[];return this._valueInfoMap={},e&&e.data&&Array.isArray(e.data.items)&&e.data.items.forEach((i=>{const r=new _symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_26__["default"]({styleUrl:e.styleUrl,styleName:e.styleName,portal:this.portal,name:i.name});this.defaultSymbol||i.name!==e.data.defaultItem||(this.defaultSymbol=r,this._isDefaultSymbolDerived=!0);const s=new _support_UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_22__["default"]({value:i.name,symbol:r});t.push(s),this._valueInfoMap[i.name]=s})),this._set("uniqueValueInfos",Object.freeze(t)),!this.defaultSymbol&&this.uniqueValueInfos.length&&(this.defaultSymbol=this.uniqueValueInfos[0].symbol,this._isDefaultSymbolDerived=!0),this}))}_updateValueInfoMap(){this._valueInfoMap={},this.uniqueValueInfos.forEach((e=>this._valueInfoMap[e.value+""]=e))}_getUniqueValueInfo(e,t){return this.valueExpression?this._getUnqiueValueInfoForExpression(e,t):this._getUnqiueValueInfoForFields(e)}_getUnqiueValueInfoForExpression(e,t){const{viewingMode:i,scale:r,spatialReference:s,arcade:l}=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["unwrapOr"])(t,{});let n=this._cache.compiledFunc;const u=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_5__["unwrap"])(l).arcadeUtils;if(!n){const e=u.createSyntaxTree(this.valueExpression);n=u.createFunction(e),this._cache.compiledFunc=n}const p=u.executeFunction(n,u.createExecContext(e,u.getViewInfo({viewingMode:i,scale:r,spatialReference:s})));return this._valueInfoMap[p+""]}_getUnqiueValueInfoForFields(e){const t=this.field,i=e.attributes;let r;if("function"!=typeof t&&this.field2){const e=this.field2,s=this.field3,l=[];t&&l.push(i[t]),e&&l.push(i[e]),s&&l.push(i[s]),r=l.join(this.fieldDelimiter||"")}else"function"==typeof t?r=t(e):t&&(r=i[t]);return this._valueInfoMap[r+""]}static fromPortalStyle(e,t){const i=new E(t&&t.properties);i._set("styleOrigin",Object.freeze({styleName:e})),i._set("portal",t&&t.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_17__["default"].getDefault());const r=i.populateFromStyle();return r.catch((t=>{M.error(`#fromPortalStyle('${e}'[, ...])`,"Failed to create unique value renderer from style name",t)})),r}static fromStyleUrl(e,t){const i=new E(t&&t.properties);i._set("styleOrigin",Object.freeze({styleUrl:e}));const r=i.populateFromStyle();return r.catch((t=>{M.error(`#fromStyleUrl('${e}'[, ...])`,"Failed to create unique value renderer from style URL",t)})),r}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({readOnly:!0})],R.prototype,"_cache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_10__["enumeration"])({uniqueValue:"unique-value"})],R.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_20__["rendererBackgroundFillSymbolProperty"])],R.prototype,"backgroundFillSymbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({json:{type:String,read:{source:"field1"},write:{target:"field1"}}})],R.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_8__["cast"])("field")],R.prototype,"castField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_13__["writer"])("field")],R.prototype,"writeField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"field2",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"field3",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"valueExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"valueExpressionTitle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:_support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_21__["default"],json:{write:!0}})],R.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"defaultLabel",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])(Object(_core_object_js__WEBPACK_IMPORTED_MODULE_6__["deepMerge"])({..._support_commonProperties_js__WEBPACK_IMPORTED_MODULE_20__["rendererSymbolProperty"]},{json:{write:{overridePolicy(){return{enabled:!this._isDefaultSymbolDerived}}},origins:{"web-scene":{write:{overridePolicy(){return{enabled:!this._isDefaultSymbolDerived}}}}}}}))],R.prototype,"defaultSymbol",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:String,json:{write:!0}})],R.prototype,"fieldDelimiter",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:_portal_Portal_js__WEBPACK_IMPORTED_MODULE_17__["default"],readOnly:!0})],R.prototype,"portal",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_11__["reader"])("portal",["styleName"])],R.prototype,"readPortal",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({readOnly:!0,json:{write:{enabled:!1,overridePolicy:()=>({enabled:!0})}}})],R.prototype,"styleOrigin",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_11__["reader"])("styleOrigin",["styleName","styleUrl"])],R.prototype,"readStyleOrigin",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_13__["writer"])("styleOrigin",{styleName:{type:String},styleUrl:{type:String}})],R.prototype,"writeStyleOrigin",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_7__["property"])({type:[_support_UniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_22__["default"]],json:{write:{overridePolicy(){return this.styleOrigin?{enabled:!1}:{enabled:!0}}}}})],R.prototype,"uniqueValueInfos",null),R=E=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_12__["subclass"])("esri.renderers.UniqueValueRenderer")],R);var P=R;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js ***!
  \*****************************************************************************/
/*! exports provided: VisualVariablesMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VisualVariablesMixin", function() { return v; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _visualVariables_ColorVariable_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../visualVariables/ColorVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/ColorVariable.js");
/* harmony import */ var _visualVariables_OpacityVariable_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../visualVariables/OpacityVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/OpacityVariable.js");
/* harmony import */ var _visualVariables_RotationVariable_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../visualVariables/RotationVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/RotationVariable.js");
/* harmony import */ var _visualVariables_SizeVariable_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../visualVariables/SizeVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/SizeVariable.js");
/* harmony import */ var _visualVariables_VisualVariable_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../visualVariables/VisualVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js");
/* harmony import */ var _visualVariables_VisualVariableFactory_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../visualVariables/VisualVariableFactory.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariableFactory.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const b={base:_visualVariables_VisualVariable_js__WEBPACK_IMPORTED_MODULE_13__["default"],key:"type",typeMap:{opacity:_visualVariables_OpacityVariable_js__WEBPACK_IMPORTED_MODULE_10__["default"],color:_visualVariables_ColorVariable_js__WEBPACK_IMPORTED_MODULE_9__["default"],rotation:_visualVariables_RotationVariable_js__WEBPACK_IMPORTED_MODULE_11__["default"],size:_visualVariables_SizeVariable_js__WEBPACK_IMPORTED_MODULE_12__["default"]}},v=l=>{let u=class extends l{constructor(){super(...arguments),this._vvFactory=new _visualVariables_VisualVariableFactory_js__WEBPACK_IMPORTED_MODULE_14__["default"]}set visualVariables(r){this._vvFactory.visualVariables=r,this._set("visualVariables",this._vvFactory.visualVariables)}readVisualVariables(r,a,s){return this._vvFactory.readVariables(r,a,s)}writeVisualVariables(r,a,s,e){a[s]=this._vvFactory.writeVariables(r,e)}get arcadeRequiredForVisualVariables(){if(!this.visualVariables)return!1;for(const r of this.visualVariables)if(r.arcadeRequired)return!0;return!1}hasVisualVariables(r,a){return r?this.getVisualVariablesForType(r,a).length>0:this.getVisualVariablesForType("size",a).length>0||this.getVisualVariablesForType("color",a).length>0||this.getVisualVariablesForType("opacity",a).length>0||this.getVisualVariablesForType("rotation",a).length>0}getVisualVariablesForType(r,a){const s=this.visualVariables;return s?s.filter((s=>s.type===r&&("string"==typeof a?s.target===a:!1!==a||!s.target))):[]}async collectVVRequiredFields(r,a){let s=[];this.visualVariables&&(s=s.concat(this.visualVariables));for(const e of s)e&&(e.field&&Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_8__["collectField"])(r,a,e.field),e.normalizationField&&Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_8__["collectField"])(r,a,e.normalizationField),e.valueExpression&&await Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_8__["collectArcadeFieldNames"])(r,a,e.valueExpression))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({types:[b],value:null,json:{write:!0}})],u.prototype,"visualVariables",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_5__["reader"])("visualVariables",["visualVariables","rotationType","rotationExpression"])],u.prototype,"readVisualVariables",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("visualVariables")],u.prototype,"writeVisualVariables",null),u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.mixins.VisualVariablesMixin")],u),u};


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/AuthoringInfo.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/AuthoringInfo.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return g; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _AuthoringInfoFieldInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./AuthoringInfoFieldInfo.js */ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoFieldInfo.js");
/* harmony import */ var _AuthoringInfoVisualVariable_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./AuthoringInfoVisualVariable.js */ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoVisualVariable.js");
/* harmony import */ var _rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../rest/support/colorRamps.js */ "../node_modules/@arcgis/core/rest/support/colorRamps.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;const h=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({esriClassifyDefinedInterval:"defined-interval",esriClassifyEqualInterval:"equal-interval",esriClassifyManual:"manual",esriClassifyNaturalBreaks:"natural-breaks",esriClassifyQuantile:"quantile",esriClassifyStandardDeviation:"standard-deviation"}),m=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({classedSize:"class-breaks-size",classedColor:"class-breaks-color",univariateColorSize:"univariate-color-size",relationship:"relationship",predominance:"predominance",dotDensity:"dot-density"}),y=["inches","feet","yards","miles","nautical-miles","millimeters","centimeters","decimeters","meters","kilometers","decimal-degrees"],v=["high-to-low","above-and-below","above","below","90-10"],f=["caret","circle-caret","arrow","circle-arrow","plus-minus","circle-plus-minus","square","circle","triangle","happy-sad","thumb","custom"];let b=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(e){super(e),this.colorRamp=null,this.lengthUnit=null,this.maxSliderValue=null,this.minSliderValue=null,this.visualVariables=null}get classificationMethod(){const e=this._get("classificationMethod"),t=this.type;return t&&"relationship"!==t?"class-breaks-size"===t||"class-breaks-color"===t?e||"manual":null:e}set classificationMethod(e){this._set("classificationMethod",e)}readColorRamp(e){if(e)return Object(_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__["fromJSON"])(e)}get fields(){return this.type&&"predominance"!==this.type?null:this._get("fields")}set fields(e){this._set("fields",e)}get field1(){return this.type&&"relationship"!==this.type?null:this._get("field1")}set field1(e){this._set("field1",e)}get field2(){return this.type&&"relationship"!==this.type?null:this._get("field2")}set field2(e){this._set("field2",e)}get focus(){return this.type&&"relationship"!==this.type?null:this._get("focus")}set focus(e){this._set("focus",e)}get numClasses(){return this.type&&"relationship"!==this.type?null:this._get("numClasses")}set numClasses(e){this._set("numClasses",e)}get statistics(){return"univariate-color-size"===this.type&&"above-and-below"===this.univariateTheme?this._get("statistics"):null}set statistics(e){this._set("statistics",e)}get standardDeviationInterval(){const e=this.type;return e&&"relationship"!==e&&"class-breaks-size"!==e&&"class-breaks-color"!==e||this.classificationMethod&&"standard-deviation"!==this.classificationMethod?null:this._get("standardDeviationInterval")}set standardDeviationInterval(e){this._set("standardDeviationInterval",e)}get type(){return this._get("type")}set type(e){let t=e;"classed-size"===e?t="class-breaks-size":"classed-color"===e&&(t="class-breaks-color"),this._set("type",t)}get univariateSymbolStyle(){return"univariate-color-size"===this.type&&"above-and-below"===this.univariateTheme?this._get("univariateSymbolStyle"):null}set univariateSymbolStyle(e){this._set("univariateSymbolStyle",e)}get univariateTheme(){return"univariate-color-size"===this.type?this._get("univariateTheme"):null}set univariateTheme(e){this._set("univariateTheme",e)}clone(){return new d({classificationMethod:this.classificationMethod,colorRamp:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.colorRamp),fields:this.fields&&this.fields.slice(0),field1:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.field1),field2:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.field2),focus:this.focus,numClasses:this.numClasses,maxSliderValue:this.maxSliderValue,minSliderValue:this.minSliderValue,lengthUnit:this.lengthUnit,statistics:this.statistics,standardDeviationInterval:this.standardDeviationInterval,type:this.type,visualVariables:this.visualVariables&&this.visualVariables.map((e=>e.clone())),univariateSymbolStyle:this.univariateSymbolStyle,univariateTheme:this.univariateTheme})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:h.apiValues,value:null,json:{type:h.jsonValues,read:h.read,write:h.write,origins:{"web-document":{default:"manual",type:h.jsonValues,read:h.read,write:h.write}}}})],b.prototype,"classificationMethod",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({types:_rest_support_colorRamps_js__WEBPACK_IMPORTED_MODULE_12__["types"],json:{write:!0}})],b.prototype,"colorRamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("colorRamp")],b.prototype,"readColorRamp",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:[String],value:null,json:{write:!0}})],b.prototype,"fields",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_AuthoringInfoFieldInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"],value:null,json:{write:!0}})],b.prototype,"field1",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_AuthoringInfoFieldInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"],value:null,json:{write:!0}})],b.prototype,"field2",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["HH","HL","LH","LL"],value:null,json:{write:!0}})],b.prototype,"focus",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,value:null,json:{type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"],write:!0}})],b.prototype,"numClasses",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:y,json:{type:y,read:!1,write:!1,origins:{"web-scene":{read:!0,write:!0}}}})],b.prototype,"lengthUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],b.prototype,"maxSliderValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],b.prototype,"minSliderValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Object,value:null,json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],b.prototype,"statistics",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:[.25,.33,.5,1],value:null,json:{type:[.25,.33,.5,1],write:!0}})],b.prototype,"standardDeviationInterval",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:m.apiValues,value:null,json:{type:m.jsonValues,read:m.read,write:m.write}})],b.prototype,"type",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:[_AuthoringInfoVisualVariable_js__WEBPACK_IMPORTED_MODULE_11__["default"]],json:{write:!0}})],b.prototype,"visualVariables",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:f,value:null,json:{write:!0,origins:{"web-scene":{write:!1}}}})],b.prototype,"univariateSymbolStyle",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:v,value:null,json:{write:!0,origins:{"web-scene":{write:!1}}}})],b.prototype,"univariateTheme",null),b=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.renderers.support.AuthoringInfo")],b);var g=b;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoClassBreakInfo.js":
/*!*************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/AuthoringInfoClassBreakInfo.js ***!
  \*************************************************************************************/
/*! exports provided: AuthoringInfoClassBreakInfo, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthoringInfoClassBreakInfo", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
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
var t;let p=t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.minValue=0,this.maxValue=0}clone(){return new t({minValue:this.minValue,maxValue:this.maxValue})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],p.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],p.prototype,"maxValue",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderer.support.AuthoringInfoClassBreakInfo")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoFieldInfo.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/AuthoringInfoFieldInfo.js ***!
  \********************************************************************************/
/*! exports provided: AuthoringInfoFieldInfo, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthoringInfoFieldInfo", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _AuthoringInfoClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AuthoringInfoClassBreakInfo.js */ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoClassBreakInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let p=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.field="",this.normalizationField="",this.label="",this.classBreakInfos=[]}clone(){return new a({field:this.field,normalizationField:this.normalizationField,label:this.label,classBreakInfos:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.classBreakInfos)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[_AuthoringInfoClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{write:!0}})],p.prototype,"classBreakInfos",void 0),p=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.AuthoringInfoFieldInfo")],p);var n=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/AuthoringInfoVisualVariable.js":
/*!*************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/AuthoringInfoVisualVariable.js ***!
  \*************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;const l=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({percentTotal:"percent-of-total",ratio:"ratio",percent:"percent"}),p=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({sizeInfo:"size",colorInfo:"color",transparencyInfo:"opacity",rotationInfo:"rotation"}),a={key:e=>"number"==typeof e?"number":"string",typeMap:{number:Number,string:String},base:null},u=["high-to-low","above-and-below","centered-on","extremes"],m=[...new Set([...["high-to-low","above-and-below","centered-on","extremes","90-10","above","below"],...["high-to-low","above-and-below","90-10","above","below"]])],y=["seconds","minutes","hours","days","months","years"];let d=n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(e){super(e),this.endTime=null,this.field=null,this.maxSliderValue=null,this.minSliderValue=null,this.startTime=null,this.type=null,this.units=null}castEndTime(e){return"string"==typeof e||"number"==typeof e?e:null}castStartTime(e){return"string"==typeof e||"number"==typeof e?e:null}get style(){return"color"===this.type?this._get("style"):null}set style(e){this._set("style",e)}get theme(){return"color"===this.type||"size"===this.type?this._get("theme")||"high-to-low":null}set theme(e){this._set("theme",e)}clone(){return new n({endTime:this.endTime,field:this.field,maxSliderValue:this.maxSliderValue,minSliderValue:this.minSliderValue,startTime:this.startTime,style:this.style,theme:this.theme,type:this.type,units:this.units})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:a,json:{write:!0}})],d.prototype,"endTime",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__["cast"])("endTime")],d.prototype,"castEndTime",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],d.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"maxSliderValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],d.prototype,"minSliderValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:a,json:{write:!0}})],d.prototype,"startTime",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__["cast"])("startTime")],d.prototype,"castStartTime",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:l.apiValues,value:null,json:{type:l.jsonValues,read:l.read,write:l.write}})],d.prototype,"style",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:m,value:null,json:{type:m,origins:{"web-scene":{type:u,write:{writer:(e,t)=>{u.indexOf(e)>-1&&(t.theme=e)}}}},write:!0}})],d.prototype,"theme",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:p.apiValues,json:{type:p.jsonValues,read:p.read,write:p.write}})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:y,json:{type:y,write:!0}})],d.prototype,"units",void 0),d=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.AuthoringInfoVisualVariable")],d);var h=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/ClassBreakInfo.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/ClassBreakInfo.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../symbols/support/jsonUtils.js */ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let p=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(s){super(s),this.description=null,this.label=null,this.minValue=null,this.maxValue=0,this.symbol=null}clone(){return new a({description:this.description,label:this.label,minValue:this.minValue,maxValue:this.maxValue,symbol:this.symbol?this.symbol.clone():null})}getMeshHash(){const s=JSON.stringify(this.symbol);return`${this.minValue}.${this.maxValue}.${s}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],p.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{read:{source:"classMinValue"},write:{target:"classMinValue"}}})],p.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{read:{source:"classMaxValue"},write:{target:"classMaxValue"}}})],p.prototype,"maxValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_symbols_js__WEBPACK_IMPORTED_MODULE_1__["symbolTypesRenderer"],json:{origins:{"web-scene":{types:_symbols_js__WEBPACK_IMPORTED_MODULE_1__["symbolTypesRenderer3D"],write:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__["write"]}},write:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__["write"]}})],p.prototype,"symbol",void 0),p=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.ClassBreakInfo")],p);var n=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/LegendOptions.js ***!
  \***********************************************************************/
/*! exports provided: LegendOptions, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LegendOptions", function() { return p; });
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
var s;let p=s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.title=null}clone(){return new s({title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"title",void 0),p=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.support.LegendOptions")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/UniqueValueInfo.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/UniqueValueInfo.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../symbols/support/jsonUtils.js */ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let n=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.description=null,this.label=null,this.symbol=null,this.value=null}clone(){return new p({value:this.value,description:this.description,label:this.label,symbol:this.symbol?this.symbol.clone():null})}getMeshHash(){const o=JSON.stringify(this.symbol&&this.symbol.toJSON());return`${this.value}.${o}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],n.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],n.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({types:_symbols_js__WEBPACK_IMPORTED_MODULE_1__["symbolTypesRenderer"],json:{origins:{"web-scene":{types:_symbols_js__WEBPACK_IMPORTED_MODULE_1__["symbolTypesRenderer3D"],write:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__["write"]}},write:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_8__["write"]}})],n.prototype,"symbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[String,Number],json:{type:String,write:{writer:(o,s)=>{s.value=null==o?void 0:o.toString()}}}})],n.prototype,"value",void 0),n=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.UniqueValueInfo")],n);var u=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/commonProperties.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/commonProperties.js ***!
  \**************************************************************************/
/*! exports provided: rendererBackgroundFillSymbolProperty, rendererSymbolProperty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rendererBackgroundFillSymbolProperty", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rendererSymbolProperty", function() { return i; });
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols/support/jsonUtils.js */ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js");
/* harmony import */ var _symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../symbols/Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/* harmony import */ var _symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../symbols/PolygonSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i={types:_symbols_js__WEBPACK_IMPORTED_MODULE_0__["symbolTypesRenderer"],json:{write:{writer:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_1__["write"]},origins:{"web-scene":{types:_symbols_js__WEBPACK_IMPORTED_MODULE_0__["symbolTypesRenderer3D"],write:{writer:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_1__["write"]}}}}},l={types:{base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_2__["default"],key:"type",typeMap:{"simple-fill":_symbols_js__WEBPACK_IMPORTED_MODULE_0__["symbolTypes"].typeMap["simple-fill"],"picture-fill":_symbols_js__WEBPACK_IMPORTED_MODULE_0__["symbolTypes"].typeMap["picture-fill"],"polygon-3d":_symbols_js__WEBPACK_IMPORTED_MODULE_0__["symbolTypes"].typeMap["polygon-3d"]}},json:{write:{writer:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_1__["write"]},origins:{"web-scene":{type:_symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"],write:{writer:_symbols_support_jsonUtils_js__WEBPACK_IMPORTED_MODULE_1__["write"]}}}}};


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/ColorVariable.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/ColorVariable.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _VisualVariable_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VisualVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js");
/* harmony import */ var _support_ColorStop_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/ColorStop.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/ColorStop.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let p=i=class extends _VisualVariable_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.type="color",this.normalizationField=null}get cache(){return{ipData:this._interpolateData(),hasExpression:!!this.valueExpression,compiledFunc:null}}set stops(t){t&&Array.isArray(t)&&(t=t.filter((t=>!!t))).sort(((t,e)=>t.value-e.value)),this._set("stops",t)}clone(){return new i({field:this.field,normalizationField:this.normalizationField,valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,stops:this.stops&&this.stops.map((t=>t.clone())),legendOptions:this.legendOptions&&this.legendOptions.clone()})}getAttributeHash(){return`${super.getAttributeHash()}-${this.normalizationField}`}_interpolateData(){return this.stops&&this.stops.map((t=>t.value||0))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({readOnly:!0})],p.prototype,"cache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["color"],json:{type:["colorInfo"]}})],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:String,json:{write:!0}})],p.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:[_support_ColorStop_js__WEBPACK_IMPORTED_MODULE_7__["default"]],json:{write:!0}})],p.prototype,"stops",null),p=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.renderers.visualVariables.ColorVariable")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/OpacityVariable.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/OpacityVariable.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _VisualVariable_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VisualVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js");
/* harmony import */ var _support_OpacityStop_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/OpacityStop.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/OpacityStop.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let p=i=class extends _VisualVariable_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.type="opacity",this.normalizationField=null}get cache(){return{ipData:this._interpolateData(),hasExpression:!!this.valueExpression,compiledFunc:null}}set stops(t){t&&Array.isArray(t)&&(t=t.filter((t=>!!t))).sort(((t,e)=>t.value-e.value)),this._set("stops",t)}clone(){return new i({field:this.field,normalizationField:this.normalizationField,valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,stops:this.stops&&this.stops.map((t=>t.clone())),legendOptions:this.legendOptions&&this.legendOptions.clone()})}getAttributeHash(){return`${super.getAttributeHash()}-${this.normalizationField}`}_interpolateData(){return this.stops&&this.stops.map((t=>t.value||0))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({readOnly:!0})],p.prototype,"cache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["opacity"],json:{type:["transparencyInfo"]}})],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:String,json:{write:!0}})],p.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:[_support_OpacityStop_js__WEBPACK_IMPORTED_MODULE_7__["default"]],json:{write:!0}})],p.prototype,"stops",null),p=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.renderers.visualVariables.OpacityVariable")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/RotationVariable.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/RotationVariable.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _VisualVariable_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./VisualVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let a=p=class extends _VisualVariable_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.axis=null,this.type="rotation",this.rotationType="geographic",this.valueExpressionTitle=null}get cache(){return{hasExpression:!!this.valueExpression,compiledFunc:null}}writeValueExpressionTitleWebScene(e,o,s,r){if(r&&r.messages){const e=`visualVariables[${this.index}]`;r.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("property:unsupported",this.type+"VisualVariable.valueExpressionTitle is not supported in Web Scene. Please remove this property to save the Web Scene.",{instance:this,propertyName:e+".valueExpressionTitle",context:r}))}}clone(){return new p({axis:this.axis,rotationType:this.rotationType,field:this.field,valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,legendOptions:this.legendOptions&&this.legendOptions.clone()})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],a.prototype,"cache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["heading","tilt","roll"],json:{origins:{"web-scene":{default:"heading",write:!0}}}})],a.prototype,"axis",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["rotation"],json:{type:["rotationInfo"]}})],a.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["geographic","arithmetic"],json:{write:!0,origins:{"web-document":{write:!0,default:"geographic"}}}})],a.prototype,"rotationType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],a.prototype,"valueExpressionTitle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("web-scene","valueExpressionTitle")],a.prototype,"writeValueExpressionTitleWebScene",null),a=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.visualVariables.RotationVariable")],a);var n=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/SizeVariable.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/SizeVariable.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _VisualVariable_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./VisualVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js");
/* harmony import */ var _support_SizeStop_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/SizeStop.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/SizeStop.js");
/* harmony import */ var _support_SizeVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/SizeVariableLegendOptions.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/SizeVariableLegendOptions.js");
/* harmony import */ var _support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/sizeVariableUtils.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/sizeVariableUtils.js");
/* harmony import */ var _support_visualVariableUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./support/visualVariableUtils.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/visualVariableUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var S;const z=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.renderers.visualVariables.SizeVariable"),v=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({width:"width",depth:"depth",height:"height",widthAndDepth:"width-and-depth",all:"all"}),w=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({unknown:"unknown",inch:"inches",foot:"feet",yard:"yards",mile:"miles","nautical-mile":"nautical-miles",millimeter:"millimeters",centimeter:"centimeters",decimeter:"decimeters",meter:"meters",kilometer:"kilometers","decimal-degree":"decimal-degrees"});function V(e){if(null!=e)return"string"==typeof e||"number"==typeof e?Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["toPt"])(e):"size"===e.type?Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["isSizeVariable"])(e)?e:(delete(e={...e}).type,new g(e)):void 0}function f(e,t,i){if("object"!=typeof e)return e;const s=new g;return s.read(e,i),s}let g=S=class extends _VisualVariable_js__WEBPACK_IMPORTED_MODULE_11__["default"]{constructor(e){super(e),this.axis=null,this.legendOptions=null,this.normalizationField=null,this.scaleBy=null,this.target=null,this.type="size",this.useSymbolValue=null,this.valueExpression=null,this.valueRepresentation=null,this.valueUnit=null}get cache(){return{ipData:this._interpolateData(),hasExpression:!!this.valueExpression,compiledFunc:null,isScaleDriven:_support_visualVariableUtils_js__WEBPACK_IMPORTED_MODULE_15__["viewScaleRE"].test(this.valueExpression)}}set expression(e){z.warn("'expression' is deprecated since version 4.2. Use 'valueExpression' instead. The only supported expression is 'view.scale'."),"view.scale"===e?(this.valueExpression="$view.scale",this._set("expression",e)):this._set("expression",null)}set index(e){Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["isSizeVariable"])(this.maxSize)&&(this.maxSize.index=`visualVariables[${e}].maxSize`),Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["isSizeVariable"])(this.minSize)&&(this.minSize.index=`visualVariables[${e}].minSize`),this._set("index",e)}get inputValueType(){return Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["getInputValueType"])(this)}set maxDataValue(e){e&&this.stops&&(z.warn("cannot set maxDataValue when stops is not null."),e=null),this._set("maxDataValue",e)}set maxSize(e){e&&this.stops&&(z.warn("cannot set maxSize when stops is not null."),e=null),this._set("maxSize",e)}castMaxSize(e){return V(e)}readMaxSize(e,t,i){return f(e,t,i)}set minDataValue(e){e&&this.stops&&(z.warn("cannot set minDataValue when stops is not null."),e=null),this._set("minDataValue",e)}set minSize(e){e&&this.stops&&(z.warn("cannot set minSize when stops is not null."),e=null),this._set("minSize",e)}castMinSize(e){return V(e)}readMinSize(e,t,i){return f(e,t,i)}get arcadeRequired(){return!!this.valueExpression||(this.minSize&&"object"==typeof this.minSize&&this.minSize.arcadeRequired||this.maxSize&&"object"==typeof this.maxSize&&this.maxSize.arcadeRequired)}set stops(e){null==this.minDataValue&&null==this.maxDataValue&&null==this.minSize&&null==this.maxSize?e&&Array.isArray(e)&&(e=e.filter((e=>!!e))).sort(((e,t)=>e.value-t.value)):e&&(z.warn("cannot set stops when one of minDataValue, maxDataValue, minSize or maxSize is not null."),e=null),this._set("stops",e)}get transformationType(){return Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["getTransformationType"])(this,this.inputValueType)}readValueExpression(e,t){return e||t.expression&&"$view.scale"}writeValueExpressionWebScene(e,i,s,r){if("$view.scale"===e){if(r&&r.messages){const e=this.index,i="string"==typeof e?e:`visualVariables[${e}]`;r.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("property:unsupported",this.type+"VisualVariable.valueExpression = '$view.scale' is not supported in Web Scene. Please remove this property to save the Web Scene.",{instance:this,propertyName:i+".valueExpression",context:r}))}}else i[s]=e}readValueUnit(e){return e?w.read(e):null}clone(){return new S({axis:this.axis,field:this.field,valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle,maxDataValue:this.maxDataValue,maxSize:Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["isSizeVariable"])(this.maxSize)?this.maxSize.clone():this.maxSize,minDataValue:this.minDataValue,minSize:Object(_support_sizeVariableUtils_js__WEBPACK_IMPORTED_MODULE_14__["isSizeVariable"])(this.minSize)?this.minSize.clone():this.minSize,normalizationField:this.normalizationField,stops:this.stops&&this.stops.map((e=>e.clone())),target:this.target,useSymbolValue:this.useSymbolValue,valueRepresentation:this.valueRepresentation,valueUnit:this.valueUnit,legendOptions:this.legendOptions&&this.legendOptions.clone()})}flipSizes(){if("clamped-linear"===this.transformationType){const{minSize:e,maxSize:t}=this;return this.minSize=t,this.maxSize=e,this}if("stops"===this.transformationType){const e=this.stops,t=e.map((e=>e.size)).reverse(),i=e.length;for(let s=0;s<i;s++)e[s].size=t[s];return this}return this}getAttributeHash(){return`${super.getAttributeHash()}-${this.target}-${this.normalizationField}`}_interpolateData(){return this.stops&&this.stops.map((e=>e.value||0))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({readOnly:!0})],g.prototype,"cache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:v.apiValues,json:{type:v.jsonValues,origins:{"web-map":{read:!1}},read:v.read,write:v.write}})],g.prototype,"axis",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,value:null,json:{read:!1}})],g.prototype,"expression",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],g.prototype,"index",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,readOnly:!0})],g.prototype,"inputValueType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:_support_SizeVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_13__["default"],json:{write:!0}})],g.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:Number,value:null,json:{write:!0}})],g.prototype,"maxDataValue",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:Number,value:null,json:{write:!0}})],g.prototype,"maxSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__["cast"])("maxSize")],g.prototype,"castMaxSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("maxSize")],g.prototype,"readMaxSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:Number,value:null,json:{write:!0}})],g.prototype,"minDataValue",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:Number,value:null,json:{write:!0}})],g.prototype,"minSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__["cast"])("minSize")],g.prototype,"castMinSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("minSize")],g.prototype,"readMinSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,json:{write:!0}})],g.prototype,"normalizationField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({readOnly:!0})],g.prototype,"arcadeRequired",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String})],g.prototype,"scaleBy",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:[_support_SizeStop_js__WEBPACK_IMPORTED_MODULE_12__["default"]],value:null,json:{write:!0}})],g.prototype,"stops",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:["outline"],json:{write:!0}})],g.prototype,"target",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,readOnly:!0})],g.prototype,"transformationType",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:["size"],json:{type:["sizeInfo"]}})],g.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:Boolean,json:{write:!0,origins:{"web-map":{read:!1}}}})],g.prototype,"useSymbolValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,json:{write:!0}})],g.prototype,"valueExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("valueExpression",["valueExpression","expression"])],g.prototype,"readValueExpression",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("web-scene","valueExpression")],g.prototype,"writeValueExpressionWebScene",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:["radius","diameter","area","width","distance"],json:{write:!0}})],g.prototype,"valueRepresentation",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:w.apiValues,json:{write:w.write,origins:{"web-map":{read:!1},"web-scene":{write:!0}}}})],g.prototype,"valueUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("valueUnit")],g.prototype,"readValueUnit",null),g=S=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.renderers.visualVariables.SizeVariable")],g);var b=g;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/VisualVariable.js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _support_VisualVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/VisualVariableLegendOptions.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/VisualVariableLegendOptions.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.renderers.visualVariables.VisualVariable"),u=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({colorInfo:"color",transparencyInfo:"opacity",rotationInfo:"rotation",sizeInfo:"size"});let c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(e){super(e),this.index=null,this.type=null,this.field=null,this.valueExpression=null,this.valueExpressionTitle=null,this.legendOptions=null}castField(e){return null==e?e:"function"==typeof e?(a.error(".field: field must be a string value"),null):Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__["ensureString"])(e)}get arcadeRequired(){return!!this.valueExpression}clone(){}getAttributeHash(){return`${this.type}-${this.field}-${this.valueExpression}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],c.prototype,"index",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:u.apiValues,readOnly:!0,json:{read:u.read,write:u.write}})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_6__["cast"])("field")],c.prototype,"castField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"valueExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"valueExpressionTitle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({readOnly:!0})],c.prototype,"arcadeRequired",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_VisualVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],c.prototype,"legendOptions",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.visualVariables.VisualVariable")],c);var d=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/VisualVariableFactory.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/VisualVariableFactory.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _ColorVariable_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ColorVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/ColorVariable.js");
/* harmony import */ var _OpacityVariable_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./OpacityVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/OpacityVariable.js");
/* harmony import */ var _RotationVariable_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./RotationVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/RotationVariable.js");
/* harmony import */ var _SizeVariable_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./SizeVariable.js */ "../node_modules/@arcgis/core/renderers/visualVariables/SizeVariable.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.renderers.visualVariables.VisualVariableFactory"),b={color:_ColorVariable_js__WEBPACK_IMPORTED_MODULE_9__["default"],size:_SizeVariable_js__WEBPACK_IMPORTED_MODULE_12__["default"],opacity:_OpacityVariable_js__WEBPACK_IMPORTED_MODULE_10__["default"],rotation:_RotationVariable_js__WEBPACK_IMPORTED_MODULE_11__["default"]},V=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({colorInfo:"color",transparencyInfo:"opacity",rotationInfo:"rotation",sizeInfo:"size"}),h=/^\[([^\]]+)\]$/i;let f=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(){super(...arguments),this.colorVariables=null,this.opacityVariables=null,this.rotationVariables=null,this.sizeVariables=null}set visualVariables(r){if(this._resetVariables(),(r=r&&r.filter((r=>!!r)))&&r.length){for(const s of r)switch(s.type){case"color":this.colorVariables.push(s);break;case"opacity":this.opacityVariables.push(s);break;case"rotation":this.rotationVariables.push(s);break;case"size":this.sizeVariables.push(s)}if(this.sizeVariables.length){this.sizeVariables.some((r=>!!r.target))&&r.sort(((r,s)=>{let e=null;return e=r.target===s.target?0:r.target?1:-1,e}))}for(let s=0;s<r.length;s++){r[s].index=s}this._set("visualVariables",r)}else this._set("visualVariables",r)}readVariables(r,s,e){const{rotationExpression:a,rotationType:t}=s,i=a&&a.match(h),l=i&&i[1];if(l&&(r||(r=[]),r.push({type:"rotationInfo",rotationType:t,field:l})),r)return r.map((r=>{const s=V.read(r.type),a=b[s];a||(u.warn(`Unknown variable type: ${s}`),e&&e.messages&&e.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_4__["default"]("visual-variable:unsupported",`visualVariable of type '${s}' is not supported`,{definition:r,context:e})));const t=new a;return t.read(r,e),t}))}writeVariables(r,s){const e=[];for(const a of r){const r=a.toJSON(s);r&&e.push(r)}return e}_resetVariables(){this.colorVariables=[],this.opacityVariables=[],this.rotationVariables=[],this.sizeVariables=[]}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],f.prototype,"visualVariables",null),f=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.renderers.visualVariables.VisualVariableFactory")],f);var m=f;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/ColorStop.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/ColorStop.js ***!
  \***********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let c=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.color=null,this.label=null,this.value=null}writeValue(o,r,e){r[e]=null==o?0:o}clone(){return new a({color:this.color&&this.color.clone(),label:this.label,value:this.value})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"]],write:!0}})],c.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],c.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:{allowNull:!0}}})],c.prototype,"value",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__["writer"])("value")],c.prototype,"writeValue",null),c=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.visualVariables.support.ColorStop")],c);var i=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/OpacityStop.js":
/*!*************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/OpacityStop.js ***!
  \*************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../webdoc/support/opacityUtils.js */ "../node_modules/@arcgis/core/webdoc/support/opacityUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let u=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.label=null,this.opacity=null,this.value=null}readOpacity(r,o){return Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_9__["transparencyToOpacity"])(o.transparency)}writeOpacity(r,o,t){o[t]=Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_9__["opacityToTransparency"])(r)}clone(){return new l({label:this.label,opacity:this.opacity,value:this.value})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],u.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"],write:{target:"transparency"}}})],u.prototype,"opacity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("opacity",["transparency"])],u.prototype,"readOpacity",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__["writer"])("opacity")],u.prototype,"writeOpacity",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],u.prototype,"value",void 0),u=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.visualVariables.support.OpacityStop")],u);var y=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/SizeStop.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/SizeStop.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.label=null,this.size=null,this.value=null}clone(){return new p({label:this.label,size:this.size,value:this.value})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],i.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],i.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],i.prototype,"value",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.visualVariables.support.SizeStop")],i);var l=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/SizeVariableLegendOptions.js":
/*!***************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/SizeVariableLegendOptions.js ***!
  \***************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _VisualVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VisualVariableLegendOptions.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/VisualVariableLegendOptions.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let i=t=class extends _VisualVariableLegendOptions_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(){super(...arguments),this.customValues=null}clone(){return new t({title:this.title,showLegend:this.showLegend,customValues:this.customValues&&this.customValues.slice(0)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:[Number],json:{write:!0}})],i.prototype,"customValues",void 0),i=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.renderers.visualVariables.support.SizeVariableLegendOptions")],i);var a=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/visualVariables/support/VisualVariableLegendOptions.js":
/*!*****************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/visualVariables/support/VisualVariableLegendOptions.js ***!
  \*****************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(){super(...arguments),this.showLegend=null}clone(){return new t({title:this.title,showLegend:this.showLegend})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Boolean,json:{write:!0}})],p.prototype,"showLegend",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.renderers.visualVariables.support.VisualVariableLegendOptions")],p);var i=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/AlgorithmicColorRamp.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/AlgorithmicColorRamp.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _ColorRamp_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ColorRamp.js */ "../node_modules/@arcgis/core/rest/support/ColorRamp.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var m;let a=m=class extends _ColorRamp_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(o){super(o),this.algorithm=null,this.fromColor=null,this.toColor=null,this.type="algorithmic"}clone(){return new m({fromColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.fromColor),toColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.toColor),algorithm:this.algorithm})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({esriCIELabAlgorithm:"cie-lab",esriHSVAlgorithm:"hsv",esriLabLChAlgorithm:"lab-lch"})],a.prototype,"algorithm",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"]],write:!0}})],a.prototype,"fromColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"]],write:!0}})],a.prototype,"toColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["algorithmic"]})],a.prototype,"type",void 0),a=m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.rest.support.AlgorithmicColorRamp")],a);var c=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/ColorRamp.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/ColorRamp.js ***!
  \**************************************************************/
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0,json:{read:!1,write:!0}})],t.prototype,"type",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.rest.support.ColorRamp")],t);var p=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/MultipartColorRamp.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/MultipartColorRamp.js ***!
  \***********************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./AlgorithmicColorRamp.js */ "../node_modules/@arcgis/core/rest/support/AlgorithmicColorRamp.js");
/* harmony import */ var _ColorRamp_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ColorRamp.js */ "../node_modules/@arcgis/core/rest/support/ColorRamp.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let m=c=class extends _ColorRamp_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(o){super(o),this.colorRamps=null,this.type="multipart"}clone(){return new c({colorRamps:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.colorRamps)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_7__["default"]],json:{write:!0}})],m.prototype,"colorRamps",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["multipart"]})],m.prototype,"type",void 0),m=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.rest.support.MultipartColorRamp")],m);var a=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/rest/support/colorRamps.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/rest/support/colorRamps.js ***!
  \***************************************************************/
/*! exports provided: fromJSON, types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return m; });
/* harmony import */ var _AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AlgorithmicColorRamp.js */ "../node_modules/@arcgis/core/rest/support/AlgorithmicColorRamp.js");
/* harmony import */ var _ColorRamp_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ColorRamp.js */ "../node_modules/@arcgis/core/rest/support/ColorRamp.js");
/* harmony import */ var _MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MultipartColorRamp.js */ "../node_modules/@arcgis/core/rest/support/MultipartColorRamp.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m={key:"type",base:_ColorRamp_js__WEBPACK_IMPORTED_MODULE_1__["default"],typeMap:{algorithmic:_AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_0__["default"],multipart:_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_2__["default"]}};function p(o){return o&&o.type?"algorithmic"===o.type?_AlgorithmicColorRamp_js__WEBPACK_IMPORTED_MODULE_0__["default"].fromJSON(o):"multipart"===o.type?_MultipartColorRamp_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o):null:null}


/***/ }),

/***/ "../node_modules/@arcgis/core/support/featureFlags.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/featureFlags.js ***!
  \************************************************************/
/*! exports provided: disableContextNavigation, enableClouds, enableDirect3DObjectFeatureLayerDisplay, enableNewAtmosphere, enableWebStyleForceWOSR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disableContextNavigation", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableClouds", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableDirect3DObjectFeatureLayerDisplay", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableNewAtmosphere", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableWebStyleForceWOSR", function() { return a; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const a=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:force-wosr"),r=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:disable-context-navigation"),t=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:direct-3d-object-feature-layer-display"),o=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:enable-clouds"),n=()=>!!Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("enable-feature:new-atmosphere");


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/jsonUtils.js ***!
  \*****************************************************************/
/*! exports provided: fromJSON, write */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "write", function() { return t; });
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony import */ var _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/* harmony import */ var _symbolConversion_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./symbolConversion.js */ "../node_modules/@arcgis/core/symbols/support/symbolConversion.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(e,s,o,n){const r=m(e,{},n);r&&(s[o]=r)}function m(e,t,m){if(!e)return null;if(m&&"web-scene"===m.origin&&!(e instanceof _Symbol3D_js__WEBPACK_IMPORTED_MODULE_2__["default"])&&!(e instanceof _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_3__["default"])){const o="cim"!==e.type?Object(_symbolConversion_js__WEBPACK_IMPORTED_MODULE_4__["to3D"])(e):{symbol:null,error:new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol-conversion:unsupported-cim-symbol","CIM symbol is unsupported in web scenes",{symbol:e})};return o.symbol?o.symbol.write(t,m):(m.messages&&m.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol:unsupported",`Symbols of type '${e.declaredClass}' are not supported in scenes. Use 3D symbology instead when working with WebScene and SceneView`,{symbol:e,context:m,error:o.error})),null)}return m&&"web-map"===m.origin&&"web-style"===e.type?(m.messages&&m.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol:unsupported",`Symbols of type '${e.declaredClass}' are not supported in webmaps. Use CIMSymbol instead when working with WebMap in MapView.`,{symbol:e,context:m})),null):e.write(t,m)}function i(s,o){return Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["readSymbol"])(s,null,o)}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/styleUtils.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/styleUtils.js ***!
  \******************************************************************/
/*! exports provided: fetchStyle, fetchSymbolFromStyle, resolveWebStyleSymbol, styleNameFromItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchStyle", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchSymbolFromStyle", function() { return U; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolveWebStyleSymbol", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleNameFromItem", function() { return $; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/devEnvironmentUtils.js */ "../node_modules/@arcgis/core/core/devEnvironmentUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalQueryParams_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../portal/PortalQueryParams.js */ "../node_modules/@arcgis/core/portal/PortalQueryParams.js");
/* harmony import */ var _support_featureFlags_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../support/featureFlags.js */ "../node_modules/@arcgis/core/support/featureFlags.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./jsonUtils.js */ "../node_modules/@arcgis/core/symbols/support/jsonUtils.js");
/* harmony import */ var _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./StyleOrigin.js */ "../node_modules/@arcgis/core/symbols/support/StyleOrigin.js");
/* harmony import */ var _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Thumbnail.js */ "../node_modules/@arcgis/core/symbols/support/Thumbnail.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const b={};function d(e,t){return P(e,t).then((t=>({data:t.data,baseUrl:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(e),styleUrl:e})))}function h(e,t,r){const o=t.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_5__["default"].getDefault();let s;const n=`${o.url} - ${o.user&&o.user.username} - ${e}`;return b[n]||(b[n]=j(e,o,r).then((e=>(s=e,e.fetchData()))).then((t=>({data:t,baseUrl:s.itemUrl,styleName:e})))),b[n]}function j(e,t,r){return t.load(r).then((()=>{const o=new _portal_PortalQueryParams_js__WEBPACK_IMPORTED_MODULE_6__["default"]({disableExtraQuery:!0,query:`owner:${D} AND type:${R} AND typekeywords:"${e}"`});return t.queryItems(o,r)})).then((({results:t})=>{let o=null;const n=e.toLowerCase();if(t&&Array.isArray(t))for(const e of t){if(e.typeKeywords.some((e=>e.toLowerCase()===n))&&e.type===R&&e.owner===D){o=e;break}}if(!o)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-not-found",`The style '${e}' could not be found`,{styleName:e});return o.load(r)}))}function g(e,t,r){return e.styleUrl?d(e.styleUrl,r):e.styleName?h(e.styleName,t,r):Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-url-and-name-missing","Either styleUrl or styleName is required to resolve a style"))}function w(e,t,r,o){return e.name?e.styleName&&"Esri2DPointSymbolsStyle"===e.styleName?E(e,t,o):g(e,t,o).then((s=>U(s,e.name,t,r,o))):Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:style-symbol-reference-name-missing","Missing name in style symbol reference"))}function U(e,n,i,m,u){const b=e.data,d={portal:i.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(e.baseUrl),origin:"portal-item"},h=b.items.find((e=>e.name===n));if(!h){const e=`The symbol name '${n}' could not be found`;return Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("symbolstyleutils:symbol-name-not-found",e,{symbolName:n}))}let j=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__["f"])(S(h,m),d),g=h.thumbnail&&h.thumbnail.href;const w=h.thumbnail&&h.thumbnail.imageData;Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["isDevEnvironment"])()&&(j=Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["adjustStaticAGOUrl"])(j),g=Object(_core_devEnvironmentUtils_js__WEBPACK_IMPORTED_MODULE_2__["adjustStaticAGOUrl"])(g));const U={portal:i.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(j)),origin:"portal-item"};return P(j,u).then((r=>{const o="cimRef"===m?N(r.data):r.data,s=Object(_jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__["fromJSON"])(o,U);if(s&&Object(_symbols_js__WEBPACK_IMPORTED_MODULE_1__["isSymbol3D"])(s)){if(g){const e=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_8__["f"])(g,d);s.thumbnail=new _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__["default"]({url:e})}else w&&(s.thumbnail=new _Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__["default"]({url:`data:image/png;base64,${w}`}));e.styleUrl?s.styleOrigin=new _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__["default"]({portal:i.portal,styleUrl:e.styleUrl,name:n}):e.styleName&&(s.styleOrigin=new _StyleOrigin_js__WEBPACK_IMPORTED_MODULE_10__["default"]({portal:i.portal,styleName:e.styleName,name:n}))}return s}))}function N(e){return null===e||"CIMSymbolReference"===e.type?e:{type:"CIMSymbolReference",symbol:e}}function S(e,t){if("cimRef"===t)return e.cimRef;if(e.formatInfos&&!Object(_support_featureFlags_js__WEBPACK_IMPORTED_MODULE_7__["enableWebStyleForceWOSR"])())for(const r of e.formatInfos)if("gltf"===r.type)return r.href;return e.webRef}function $(e){for(const t of e.typeKeywords)if(/^Esri.*Style$/.test(t)&&"Esri Style"!==t)return t}function E(e,t,r){const o=q.replace(/\{SymbolName\}/gi,e.name);return P(o,r).then((e=>{const r=N(e.data);return Object(_jsonUtils_js__WEBPACK_IMPORTED_MODULE_9__["fromJSON"])(r,{portal:t.portal,url:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["urlToObject"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["removeFile"])(o)),origin:"portal-item"})}))}function P(t,r){const o={responseType:"json",query:{f:"json"},...r};return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["normalize"])(t),o)}const D="esri_en",R="Style",q="https://cdn.arcgis.com/sharing/rest/content/items/220936cc6ed342c9937abd8f180e7d1e/resources/styles/cim/{SymbolName}.json?f=json";


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/symbolConversion.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/symbolConversion.js ***!
  \************************************************************************/
/*! exports provided: to3D */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "to3D", function() { return p; });
/* harmony import */ var _symbols_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../symbols.js */ "../node_modules/@arcgis/core/symbols.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/* harmony import */ var _PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../PointSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PointSymbol3D.js");
/* harmony import */ var _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony import */ var _LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../LineSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3D.js");
/* harmony import */ var _SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../SimpleMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js");
/* harmony import */ var _PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../PictureMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js");
/* harmony import */ var _SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../SimpleFillSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js");
/* harmony import */ var _PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../PolygonSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js");
/* harmony import */ var _TextSymbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../TextSymbol.js */ "../node_modules/@arcgis/core/symbols/TextSymbol.js");
/* harmony import */ var _LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../LabelSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LabelSymbol3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function p(p,S=!1,a=!1,c=!0){if(!p)return{symbol:null};let j;if(Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["isSymbol3D"])(p)||p instanceof _WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"])j=p.clone();else if("cim"===p.type)j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromCIMSymbol(p);else if(p instanceof _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_4__["default"])j=_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_5__["default"].fromSimpleLineSymbol(p);else if(p instanceof _SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_6__["default"])j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromSimpleMarkerSymbol(p);else if(p instanceof _PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_7__["default"])j=_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromPictureMarkerSymbol(p);else if(p instanceof _SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_8__["default"])j=_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"].fromSimpleFillSymbol(p);else{if(!(p instanceof _TextSymbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]))return{error:new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol-conversion:unsupported-2d-symbol",`2D symbol of type '${p.type||p.declaredClass}' is unsupported in 3D`,{symbol:p})};j=c?_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromTextSymbol(p):_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_3__["default"].fromTextSymbol(p)}if(S&&(j.id=p.id),a&&Object(_symbols_js__WEBPACK_IMPORTED_MODULE_0__["isSymbol3D"])(j))for(let o=0;o<j.symbolLayers.length;++o)j.symbolLayers.getItemAt(o)._ignoreDrivers=!0;return{symbol:j}}


/***/ })

};;
//# sourceMappingURL=6.render-page.js.map
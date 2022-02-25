exports.ids = [8];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/LRUCache.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/core/LRUCache.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/* harmony import */ var _MemCache_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MemCache.js */ "../node_modules/@arcgis/core/core/MemCache.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class e{constructor(e,s){this._storage=new _MemCache_js__WEBPACK_IMPORTED_MODULE_0__["MemCacheStorage"],this._storage.maxSize=e,s&&this._storage.registerRemoveFunc("",s)}put(t,e,s){this._storage.put(t,e,s,1)}pop(t){return this._storage.pop(t)}get(t){return this._storage.get(t)}clear(){this._storage.clearAll()}destroy(){this._storage.destroy()}get maxSize(){return this._storage.maxSize}set maxSize(t){this._storage.maxSize=t}}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/DictionaryRenderer.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/DictionaryRenderer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return x; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_LRUCache_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/LRUCache.js */ "../node_modules/@arcgis/core/core/LRUCache.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_string_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../support/arcadeOnDemand.js */ "../node_modules/@arcgis/core/support/arcadeOnDemand.js");
/* harmony import */ var _symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../symbols/CIMSymbol.js */ "../node_modules/@arcgis/core/symbols/CIMSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var _;const j=_core_Logger_js__WEBPACK_IMPORTED_MODULE_5__["default"].getLogger("esri.renderers.DictionaryRenderer"),w={type:"CIMSimpleLineCallout",lineSymbol:{type:"CIMLineSymbol",symbolLayers:[{type:"CIMSolidStroke",width:.5,color:[0,0,0,255]}]}};let S=_=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_17__["VisualVariablesMixin"])(_Renderer_js__WEBPACK_IMPORTED_MODULE_16__["default"])){constructor(e){super(e),this._ongoingRequests=new Map,this._symbolCache=new _core_LRUCache_js__WEBPACK_IMPORTED_MODULE_6__["default"](100),this.config=null,this.fieldMap=null,this.scaleExpression=null,this.scaleExpressionTitle=null,this.url=null,this.type="dictionary"}writeData(e,s){e&&(s.scalingExpressionInfo={expression:e,returnType:"number"})}writeVisualVariables(e,s,t,r){null!=r&&r.origin||super.writeVisualVariables(e,s,t,r)}clone(){return new _({config:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.config),scaleExpression:this.scaleExpression,scaleExpressionTitle:this.scaleExpressionTitle,fieldMap:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.fieldMap),url:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.url),visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_4__["clone"])(this.visualVariables)})}async getSymbolAsync(e,t){let r;this._dictionaryPromise||(this._dictionaryPromise=this.fetchResources(t));try{r=await this._dictionaryPromise}catch(d){if(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_8__["isAbortError"])(d))return this._dictionaryPromise=null,null}const i={};if(this.fieldMap)for(const s of this._symbolFields){const t=this.fieldMap[s];if(t&&null!==e.attributes[t]&&void 0!==e.attributes[t]){const r=""+e.attributes[t];i[s]=r}else i[s]=""}const o=r(i,t);if(!o||"string"!=typeof o)return null;const n=Object(_core_string_js__WEBPACK_IMPORTED_MODULE_9__["numericHash"])(o).toString(),p=this._symbolCache.get(n);if(p)return p.catch((()=>{this._symbolCache.pop(n)})),p;const m=o.split(";"),u=[],h=[];for(const a of m)if(a&&0!==a.length)if(-1===a.indexOf("po:"))if(-1!==a.indexOf("|"))for(const e of a.split("|"))this._itemNames.has(e)&&u.push(e);else this._itemNames.has(a)&&u.push(a);else{const e=a.substr(3).split("|");if(3===e.length){const t=e[0],r=e[1];let i=e[2];if("DashTemplate"===r)i=i.split(" ").map((e=>Number(e)));else if("Color"===r){const e=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"](i).toRgba();i=[e[0],e[1],e[2],255*e[3]]}else i=Number(i);h.push({primitiveName:t,propertyName:r,value:i})}}const f=!Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e.geometry)||!e.geometry.hasZ&&"point"===e.geometry.type,y=this._cimPartsToCIMSymbol(u,h,f,t);return this._symbolCache.put(n,y,1),y}async collectRequiredFields(e,s){await this.collectVVRequiredFields(e,s),this.scaleExpression&&await Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_15__["collectArcadeFieldNames"])(e,s,this.scaleExpression);for(const t in this.fieldMap){const r=this.fieldMap[t];s.has(r)&&e.add(r)}}get arcadeRequired(){return!0}async fetchResources(e){if(this._dictionaryPromise)return this._dictionaryPromise;if(!this.url)return void j.error("no valid URL!");const s=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e)?e.abortOptions:null,i=Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this.url+"/resources/styles/dictionary-info.json",{responseType:"json",query:{f:"json"},...s}),[{data:o}]=await Promise.all([i,Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_18__["loadArcade"])()]);if(!o)throw this._dictionaryPromise=null,new _core_Error_js__WEBPACK_IMPORTED_MODULE_3__["default"]("esri.renderers.DictionaryRenderer","Bad dictionary data!");const n=o.expression,l=o.authoringInfo;this._refSymbolUrlTemplate=this.url+"/"+o.cimRefTemplateUrl,this._itemNames=new Set(o.itemsNames),this._symbolFields=l.symbol;const c={};if(this.config){const e=this.config;for(const s in e)c[s]=e[s]}if(l.configuration)for(const t of l.configuration)c.hasOwnProperty(t.name)||(c[t.name]=t.value);const p=[];if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e)&&e.fields&&this.fieldMap)for(const t of this._symbolFields){const s=this.fieldMap[t],r=e.fields.filter((e=>e.name===s));r.length>0&&p.push({...r[0],name:t})}return this._dictionaryPromise=Object(_support_arcadeOnDemand_js__WEBPACK_IMPORTED_MODULE_18__["createDictionaryExpression"])(n,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(e)?e.spatialReference:null,p,c).then((e=>{const s={scale:0};return(t,r)=>{const i=e.repurposeFeature({geometry:null,attributes:t});return s.scale=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_7__["isSome"])(r)?r.scale:void 0,e.evaluate({$feature:i,$view:s})}})).catch((e=>(j.error("Creating dictinoary expression failed:",e),null))),this._dictionaryPromise}getSymbol(){return null}getSymbols(){return[]}getAttributeHash(){return this.visualVariables&&this.visualVariables.reduce(((e,s)=>e+s.getAttributeHash()),"")}getMeshHash(){return`${this.url}-${JSON.stringify(this.fieldMap)}`}getSymbolFields(){return this._symbolFields}async _getSymbolPart(e,s){if(this._ongoingRequests.has(e))return this._ongoingRequests.get(e).then((e=>e.data));const r=this._refSymbolUrlTemplate.replace(/\{itemName\}/gi,e),i=Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(r,{responseType:"json",query:{f:"json"},...s});this._ongoingRequests.set(e,i);try{return(await i).data}catch(o){return this._ongoingRequests.delete(e),Promise.reject(o)}}_combineSymbolParts(e,s,t){if(!e||0===e.length)return null;const r={...e[0]};if(e.length>1){r.symbolLayers=[];for(const s of e){const e=s;r.symbolLayers.unshift(...e.symbolLayers)}}return t&&(r.callout=w),{type:"CIMSymbolReference",symbol:r,primitiveOverrides:s}}async _cimPartsToCIMSymbol(e,s,t,r){const i=new Array(e.length);for(let n=0;n<e.length;n++)i[n]=this._getSymbolPart(e[n],r);const o=await Promise.all(i);return new _symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_19__["default"]({data:this._combineSymbolParts(o,s,t)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__["property"])({type:Object,json:{read:{source:"configuration"},write:{target:"configuration"}}})],S.prototype,"config",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__["property"])({type:Object,json:{write:!0}})],S.prototype,"fieldMap",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__["property"])({type:String,json:{read:{source:"scalingExpressionInfo.expression"},write:!0}})],S.prototype,"scaleExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__["writer"])("scaleExpression")],S.prototype,"writeData",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__["property"])({type:String,json:{read:{source:"scalingExpressionInfo.title"},write:{target:"scalingExpressionInfo.title",overridePolicy(e){return{enabled:!!e&&!!this.scaleExpression}}}}})],S.prototype,"scaleExpressionTitle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_10__["property"])({type:String,json:{write:!0}})],S.prototype,"url",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__["writer"])("visualVariables")],S.prototype,"writeVisualVariables",null),S=_=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__["subclass"])("esri.renderers.DictionaryRenderer")],S);var x=S;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/DotDensityRenderer.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/DotDensityRenderer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/aliasOf.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/aliasOf.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_AttributeColorInfo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/AttributeColorInfo.js */ "../node_modules/@arcgis/core/renderers/support/AttributeColorInfo.js");
/* harmony import */ var _support_DotDensityLegendOptions_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/DotDensityLegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/DotDensityLegendOptions.js");
/* harmony import */ var _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../symbols/SimpleFillSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js");
/* harmony import */ var _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../symbols/SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var m;let y=m=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_12__["VisualVariablesMixin"])(_Renderer_js__WEBPACK_IMPORTED_MODULE_11__["default"])){constructor(e){super(e),this.attributes=null,this.backgroundColor=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,0]),this.blendDots=!0,this.dotBlendingEnabled=!0,this.dotShape="square",this.dotSize=1,this.legendOptions=null,this.outline=new _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"],this.dotValue=null,this.referenceDotValue=null,this.referenceScale=null,this.seed=1,this.type="dot-density"}calculateDotValue(e){if(null==this.referenceScale)return this.dotValue;const t=e/this.referenceScale*this.dotValue;return t<1?1:t}getSymbol(){return new _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__["default"]({outline:this.outline})}async getSymbolAsync(){return this.getSymbol()}getSymbols(){return[this.getSymbol()]}getAttributeHash(){return this.attributes&&this.attributes.reduce(((e,t)=>e+t.getAttributeHash()),"")}getMeshHash(){return JSON.stringify(this.outline)}clone(){return new m({attributes:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.attributes),backgroundColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.backgroundColor),dotBlendingEnabled:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.dotBlendingEnabled),dotShape:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.dotShape),dotSize:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.dotSize),dotValue:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.dotValue),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.legendOptions),outline:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.outline),referenceScale:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.referenceScale),visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.visualVariables),authoringInfo:this.authoringInfo&&this.authoringInfo.clone()})}getControllerHash(){return`${this.attributes.map((e=>e.field||e.valueExpression||""))}-${this.outline&&JSON.stringify(this.outline.toJSON())||""}`}async collectRequiredFields(e,t){await this.collectVVRequiredFields(e,t);for(const o of this.attributes)o.valueExpression&&await Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_10__["collectArcadeFieldNames"])(e,t,o.valueExpression),o.field&&e.add(o.field)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:[_support_AttributeColorInfo_js__WEBPACK_IMPORTED_MODULE_13__["default"]],json:{write:!0}})],y.prototype,"attributes",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!0}})],y.prototype,"backgroundColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Boolean}),Object(_core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_3__["aliasOf"])("dotBlendingEnabled")],y.prototype,"blendDots",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Boolean,json:{write:!0}})],y.prototype,"dotBlendingEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String,json:{write:!1}})],y.prototype,"dotShape",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{write:!1}})],y.prototype,"dotSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:_support_DotDensityLegendOptions_js__WEBPACK_IMPORTED_MODULE_14__["default"],json:{write:!0}})],y.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:_symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"],json:{default:null,write:!0}})],y.prototype,"outline",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{write:!0}})],y.prototype,"dotValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number}),Object(_core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_3__["aliasOf"])("dotValue")],y.prototype,"referenceDotValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{write:!0}})],y.prototype,"referenceScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:Number,json:{write:!0}})],y.prototype,"seed",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({dotDensity:"dot-density"})],y.prototype,"type",void 0),y=m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.renderers.DotDensityRenderer")],y);var b=y;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/HeatmapRenderer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/HeatmapRenderer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _support_HeatmapColorStop_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/HeatmapColorStop.js */ "../node_modules/@arcgis/core/renderers/support/HeatmapColorStop.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let m=a=class extends _Renderer_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(t){super(t),this.blurRadius=10,this.colorStops=[new _support_HeatmapColorStop_js__WEBPACK_IMPORTED_MODULE_11__["default"]({ratio:0,color:new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]("rgba(255, 140, 0, 0)")}),new _support_HeatmapColorStop_js__WEBPACK_IMPORTED_MODULE_11__["default"]({ratio:.75,color:new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]("rgba(255, 140, 0, 1)")}),new _support_HeatmapColorStop_js__WEBPACK_IMPORTED_MODULE_11__["default"]({ratio:.9,color:new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]("rgba(255, 0,   0, 1)")})],this.field=null,this.fieldOffset=0,this.maxPixelIntensity=100,this.minPixelIntensity=0,this.type="heatmap"}async collectRequiredFields(t,e){const r=this.field;r&&"string"==typeof r&&Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_9__["collectField"])(t,e,r)}getAttributeHash(){return null}getMeshHash(){return`${JSON.stringify(this.colorStops)}.${this.blurRadius}.${this.field}`}clone(){return new a({blurRadius:this.blurRadius,colorStops:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.colorStops),field:this.field,maxPixelIntensity:this.maxPixelIntensity,minPixelIntensity:this.minPixelIntensity})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],m.prototype,"blurRadius",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[_support_HeatmapColorStop_js__WEBPACK_IMPORTED_MODULE_11__["default"]],json:{write:!0}})],m.prototype,"colorStops",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],m.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:{overridePolicy:(t,e,r)=>({enabled:null==r})}}})],m.prototype,"fieldOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],m.prototype,"maxPixelIntensity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],m.prototype,"minPixelIntensity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({heatmap:"heatmap"})],m.prototype,"type",void 0),m=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.renderers.HeatmapRenderer")],m);var c=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/SimpleRenderer.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/SimpleRenderer.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./mixins/VisualVariablesMixin.js */ "../node_modules/@arcgis/core/renderers/mixins/VisualVariablesMixin.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/renderers/support/commonProperties.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let p=c=class extends(Object(_mixins_VisualVariablesMixin_js__WEBPACK_IMPORTED_MODULE_9__["VisualVariablesMixin"])(_Renderer_js__WEBPACK_IMPORTED_MODULE_8__["default"])){constructor(e){super(e),this.description=null,this.label=null,this.symbol=null,this.type="simple"}async collectRequiredFields(e,s){await Promise.all([this.collectSymbolFields(e,s),this.collectVVRequiredFields(e,s)])}async collectSymbolFields(e,s){await Promise.all(this.getSymbols().map((r=>r.collectRequiredFields(e,s))))}getSymbol(e,s){return this.symbol}async getSymbolAsync(e,s){return this.symbol}getSymbols(){return this.symbol?[this.symbol]:[]}getAttributeHash(){return this.visualVariables&&this.visualVariables.reduce(((e,s)=>e+s.getAttributeHash()),"")}getMeshHash(){return this.getSymbols().reduce(((e,s)=>e+JSON.stringify(s)),"")}get arcadeRequired(){return this.arcadeRequiredForVisualVariables}clone(){return new c({description:this.description,label:this.label,symbol:this.symbol&&this.symbol.clone(),visualVariables:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.visualVariables),authoringInfo:this.authoringInfo&&this.authoringInfo.clone()})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_10__["rendererSymbolProperty"])],p.prototype,"symbol",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({simple:"simple"})],p.prototype,"type",void 0),p=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.SimpleRenderer")],p);var m=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/AttributeColorInfo.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/AttributeColorInfo.js ***!
  \****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;const u=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.renderers.support.AttributeColorInfo");let c=n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r),this.color=null,this.field=null,this.label=null,this.valueExpression=null,this.valueExpressionTitle=null}castField(r){return null==r?r:"function"==typeof r?(u.error(".field: field must be a string value"),null):Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__["ensureString"])(r)}getAttributeHash(){return`${this.field}-${this.valueExpression}`}clone(){return new n({color:this.color&&this.color.clone(),field:this.field,label:this.label,valueExpression:this.valueExpression,valueExpressionTitle:this.valueExpressionTitle})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[Number],write:!0}})],c.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_6__["cast"])("field")],c.prototype,"castField",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"valueExpression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"valueExpressionTitle",void 0),c=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.AttributeColorInfo")],c);var a=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/DotDensityLegendOptions.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/DotDensityLegendOptions.js ***!
  \*********************************************************************************/
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
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e;let p=e=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.unit=null}clone(){return new e({unit:this.unit})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"unit",void 0),p=e=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.support.DotDensityLegendOptions")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/HeatmapColorStop.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/HeatmapColorStop.js ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
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
var p;let c=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.color=null,this.ratio=null}clone(){return new p({color:this.color,ratio:this.ratio})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!0}})],c.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],c.prototype,"ratio",void 0),c=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.HeatmapColorStop")],c);var i=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/jsonUtils.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/jsonUtils.js ***!
  \*******************************************************************/
/*! exports provided: fromJSON, read, write */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "write", function() { return o; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_extensions_serializableProperty_reader_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/extensions/serializableProperty/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/extensions/serializableProperty/reader.js");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types.js */ "../node_modules/@arcgis/core/renderers/support/types.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(e,n,s,t){const o=i(e,t);o&&Object(_core_object_js__WEBPACK_IMPORTED_MODULE_2__["setDeepValue"])(s,o,n)}function u(e,r){if(!r||"web-scene"!==r.origin)return!0;switch(e.type){case"simple":case"unique-value":case"class-breaks":return!0;default:return!1}}function i(r,n){return r?u(r,n)?r.write({},n):(n.messages&&n.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("renderer:unsupported",`Renderer of type '${r.declaredClass}' are not supported in scenes.`,{renderer:r,context:n})),null):null}function c(e,r){return l(e,null,r)}const a=Object(_core_accessorSupport_extensions_serializableProperty_reader_js__WEBPACK_IMPORTED_MODULE_4__["createTypeReader"])({types:_types_js__WEBPACK_IMPORTED_MODULE_5__["rendererTypes"]});function l(e,r,s){return e?e&&(e.styleName||e.styleUrl)&&"uniqueValue"!==e.type?(s&&s.messages&&s.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_3__["default"]("renderer:unsupported","Only UniqueValueRenderer can be referenced from a web style, but found '"+e.type+"'",{definition:e,context:s})),null):a(e,r,s):null}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/types.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/types.js ***!
  \***************************************************************/
/*! exports provided: rendererTypes, webSceneRendererTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rendererTypes", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webSceneRendererTypes", function() { return n; });
/* harmony import */ var _ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ClassBreaksRenderer.js */ "../node_modules/@arcgis/core/renderers/ClassBreaksRenderer.js");
/* harmony import */ var _DictionaryRenderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../DictionaryRenderer.js */ "../node_modules/@arcgis/core/renderers/DictionaryRenderer.js");
/* harmony import */ var _DotDensityRenderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../DotDensityRenderer.js */ "../node_modules/@arcgis/core/renderers/DotDensityRenderer.js");
/* harmony import */ var _HeatmapRenderer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../HeatmapRenderer.js */ "../node_modules/@arcgis/core/renderers/HeatmapRenderer.js");
/* harmony import */ var _Renderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Renderer.js */ "../node_modules/@arcgis/core/renderers/Renderer.js");
/* harmony import */ var _SimpleRenderer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../SimpleRenderer.js */ "../node_modules/@arcgis/core/renderers/SimpleRenderer.js");
/* harmony import */ var _UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../UniqueValueRenderer.js */ "../node_modules/@arcgis/core/renderers/UniqueValueRenderer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m={key:"type",base:_Renderer_js__WEBPACK_IMPORTED_MODULE_4__["default"],typeMap:{heatmap:_HeatmapRenderer_js__WEBPACK_IMPORTED_MODULE_3__["default"],simple:_SimpleRenderer_js__WEBPACK_IMPORTED_MODULE_5__["default"],"unique-value":_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_6__["default"],"class-breaks":_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_0__["default"],"dot-density":_DotDensityRenderer_js__WEBPACK_IMPORTED_MODULE_2__["default"],dictionary:_DictionaryRenderer_js__WEBPACK_IMPORTED_MODULE_1__["default"]},errorContext:"renderer"},n={key:"type",base:_Renderer_js__WEBPACK_IMPORTED_MODULE_4__["default"],typeMap:{simple:_SimpleRenderer_js__WEBPACK_IMPORTED_MODULE_5__["default"],"unique-value":_UniqueValueRenderer_js__WEBPACK_IMPORTED_MODULE_6__["default"],"class-breaks":_ClassBreaksRenderer_js__WEBPACK_IMPORTED_MODULE_0__["default"]},errorContext:"renderer"};


/***/ })

};;
//# sourceMappingURL=8.render-page.js.map
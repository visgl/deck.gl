exports.ids = [44];
exports.modules = {

/***/ "../node_modules/@arcgis/core/Color.js":
/*!*********************************************!*\
  !*** ../node_modules/@arcgis/core/Color.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return o; });
/* harmony import */ var _colorUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./colorUtils.js */ "../node_modules/@arcgis/core/colorUtils.js");
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(t){return Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["clamp"])(Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__["ensureInteger"])(t),0,255)}function a(t,r,s){return t=Number(t),isNaN(t)?s:t<r?r:t>s?s:t}class o{constructor(t){this.r=255,this.g=255,this.b=255,this.a=1,t&&this.setColor(t)}static blendColors(t,r,s,i=new o){return i.r=Math.round(t.r+(r.r-t.r)*s),i.g=Math.round(t.g+(r.g-t.g)*s),i.b=Math.round(t.b+(r.b-t.b)*s),i.a=t.a+(r.a-t.a)*s,i._sanitize()}static fromRgb(r,s){const i=r.toLowerCase().match(/^(rgba?|hsla?)\(([\s\.\-,%0-9]+)\)/);if(i){const r=i[2].split(/\s*,\s*/),e=i[1];if("rgb"===e&&3===r.length||"rgba"===e&&4===r.length){const t=r[0];if("%"===t.charAt(t.length-1)){const t=r.map((t=>2.56*parseFloat(t)));return 4===r.length&&(t[3]=parseFloat(r[3])),o.fromArray(t,s)}return o.fromArray(r.map((t=>parseFloat(t))),s)}if("hsl"===e&&3===r.length||"hsla"===e&&4===r.length)return o.fromArray(Object(_colorUtils_js__WEBPACK_IMPORTED_MODULE_0__["hsla2rgba"])(parseFloat(r[0]),parseFloat(r[1])/100,parseFloat(r[2])/100,parseFloat(r[3])),s)}return null}static fromHex(t,r=new o){if(4!==t.length&&7!==t.length||"#"!==t[0])return null;const s=4===t.length?4:8,i=(1<<s)-1;let e=Number("0x"+t.substr(1));return isNaN(e)?null:(["b","g","r"].forEach((t=>{const n=e&i;e>>=s,r[t]=4===s?17*n:n})),r.a=1,r)}static fromArray(t,r=new o){return r._set(Number(t[0]),Number(t[1]),Number(t[2]),Number(t[3])),isNaN(r.a)&&(r.a=1),r._sanitize()}static fromString(t,s){const i=Object(_colorUtils_js__WEBPACK_IMPORTED_MODULE_0__["getNamedColor"])(t);return i&&o.fromArray(i,s)||o.fromRgb(t,s)||o.fromHex(t,s)}static fromJSON(t){return t&&new o([t[0],t[1],t[2],t[3]/255])}static toUnitRGB(t){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t)?[t.r/255,t.g/255,t.b/255]:null}static toUnitRGBA(t){return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t)?[t.r/255,t.g/255,t.b/255,null!=t.a?t.a:1]:null}get isBright(){return.299*this.r+.587*this.g+.114*this.b>=127}setColor(t){if("string"==typeof t)o.fromString(t,this);else if(Array.isArray(t))o.fromArray(t,this);else{var r,s,i,e;this._set(null!=(r=t.r)?r:0,null!=(s=t.g)?s:0,null!=(i=t.b)?i:0,null!=(e=t.a)?e:1),t instanceof o||this._sanitize()}return this}toRgb(){return[this.r,this.g,this.b]}toRgba(){return[this.r,this.g,this.b,this.a]}toHex(){const t=this.r.toString(16),r=this.g.toString(16),s=this.b.toString(16);return`#${t.length<2?"0"+t:t}${r.length<2?"0"+r:r}${s.length<2?"0"+s:s}`}toCss(t=!1){const r=this.r+", "+this.g+", "+this.b;return t?`rgba(${r}, ${this.a})`:`rgb(${r})`}toString(){return this.toCss(!0)}toJSON(){return this.toArray()}toArray(t=0){const r=n(this.r),s=n(this.g),i=n(this.b);return 0===t||1!==this.a?[r,s,i,n(255*this.a)]:[r,s,i]}clone(){return new o(this.toRgba())}hash(){return this.r<<24|this.g<<16|this.b<<8|255*this.a}_sanitize(){return this.r=Math.round(a(this.r,0,255)),this.g=Math.round(a(this.g,0,255)),this.b=Math.round(a(this.b,0,255)),this.a=a(this.a,0,1),this}_set(t,r,s,i){this.r=t,this.g=r,this.b=s,this.a=i}}o.prototype.declaredClass="esri.Color";


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/PointCloudClassBreaksRenderer.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/PointCloudClassBreaksRenderer.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/* harmony import */ var _support_pointCloud_ColorClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/pointCloud/ColorClassBreakInfo.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorClassBreakInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let a=n=class extends _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.type="point-cloud-class-breaks",this.field=null,this.legendOptions=null,this.fieldTransformType=null,this.colorClassBreakInfos=null}clone(){return new n({...this.cloneProperties(),field:this.field,fieldTransformType:this.fieldTransformType,colorClassBreakInfos:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.colorClassBreakInfos),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.legendOptions)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudClassBreaksRenderer:"point-cloud-class-breaks"})],a.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0},type:String})],a.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],a.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.apiValues,json:{type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.jsonValues,read:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.read,write:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.write}})],a.prototype,"fieldTransformType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_support_pointCloud_ColorClassBreakInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"]],json:{write:!0}})],a.prototype,"colorClassBreakInfos",void 0),a=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.PointCloudClassBreaksRenderer")],a);var d=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/PointCloudRenderer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_pointCloud_ColorModulation_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/pointCloud/ColorModulation.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorModulation.js");
/* harmony import */ var _support_pointCloud_pointSizeAlgorithmTypeUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/pointCloud/pointSizeAlgorithmTypeUtils.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/pointSizeAlgorithmTypeUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const u=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["strict"])()({pointCloudClassBreaksRenderer:"point-cloud-class-breaks",pointCloudRGBRenderer:"point-cloud-rgb",pointCloudStretchRenderer:"point-cloud-stretch",pointCloudUniqueValueRenderer:"point-cloud-unique-value"});let c=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.type=void 0,this.pointSizeAlgorithm=null,this.colorModulation=null,this.pointsPerInch=10}clone(){return console.warn(".clone() is not implemented for "+this.declaredClass),null}cloneProperties(){return{pointSizeAlgorithm:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.pointSizeAlgorithm),colorModulation:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.colorModulation),pointsPerInch:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.pointsPerInch)}}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:u.apiValues,readOnly:!0,nonNullable:!0,json:{type:u.jsonValues,read:!1,write:u.write}})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({types:_support_pointCloud_pointSizeAlgorithmTypeUtils_js__WEBPACK_IMPORTED_MODULE_10__["pointSizeAlgorithmTypes"],json:{write:!0}})],c.prototype,"pointSizeAlgorithm",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_pointCloud_ColorModulation_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],c.prototype,"colorModulation",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{write:!0},nonNullable:!0,type:Number})],c.prototype,"pointsPerInch",void 0),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.renderers.PointCloudRenderer")],c),function(o){o.fieldTransformTypeKebabDict=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({none:"none",lowFourBit:"low-four-bit",highFourBit:"high-four-bit",absoluteValue:"absolute-value",moduloTen:"modulo-ten"})}(c||(c={}));var a=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/PointCloudStretchRenderer.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/PointCloudStretchRenderer.js ***!
  \***************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/* harmony import */ var _visualVariables_support_ColorStop_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./visualVariables/support/ColorStop.js */ "../node_modules/@arcgis/core/renderers/visualVariables/support/ColorStop.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let d=l=class extends _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.type="point-cloud-stretch",this.field=null,this.legendOptions=null,this.fieldTransformType=null,this.stops=null}clone(){return new l({...this.cloneProperties(),field:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.field),fieldTransformType:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.fieldTransformType),stops:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.stops),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.legendOptions)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudStretchRenderer:"point-cloud-stretch"})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0},type:String})],d.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],d.prototype,"legendOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.apiValues,json:{type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.jsonValues,read:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.read,write:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.write}})],d.prototype,"fieldTransformType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_visualVariables_support_ColorStop_js__WEBPACK_IMPORTED_MODULE_10__["default"]],json:{write:!0}})],d.prototype,"stops",void 0),d=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.PointCloudStretchRenderer")],d);var a=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/PointCloudUniqueValueRenderer.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/PointCloudUniqueValueRenderer.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./PointCloudRenderer.js */ "../node_modules/@arcgis/core/renderers/PointCloudRenderer.js");
/* harmony import */ var _support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/LegendOptions.js */ "../node_modules/@arcgis/core/renderers/support/LegendOptions.js");
/* harmony import */ var _support_pointCloud_ColorUniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/pointCloud/ColorUniqueValueInfo.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorUniqueValueInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let u=l=class extends _PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.type="point-cloud-unique-value",this.field=null,this.fieldTransformType=null,this.colorUniqueValueInfos=null,this.legendOptions=null}clone(){return new l({...this.cloneProperties(),field:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.field),fieldTransformType:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.fieldTransformType),colorUniqueValueInfos:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.colorUniqueValueInfos),legendOptions:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.legendOptions)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({pointCloudUniqueValueRenderer:"point-cloud-unique-value"})],u.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0},type:String})],u.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.apiValues,json:{type:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.jsonValues,read:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.read,write:_PointCloudRenderer_js__WEBPACK_IMPORTED_MODULE_8__["default"].fieldTransformTypeKebabDict.write}})],u.prototype,"fieldTransformType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_support_pointCloud_ColorUniqueValueInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"]],json:{write:!0}})],u.prototype,"colorUniqueValueInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_LegendOptions_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],u.prototype,"legendOptions",void 0),u=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.PointCloudUniqueValueRenderer")],u);var a=u;


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

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorClassBreakInfo.js":
/*!****************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/ColorClassBreakInfo.js ***!
  \****************************************************************************************/
/*! exports provided: ColorClassBreakInfo, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorClassBreakInfo", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let p=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.description=null,this.label=null,this.minValue=0,this.maxValue=0,this.color=null}clone(){return new l({description:this.description,label:this.label,minValue:this.minValue,maxValue:this.maxValue,color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],p.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],p.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{read:{source:"classMinValue"},write:{target:"classMinValue"}}})],p.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{read:{source:"classMaxValue"},write:{target:"classMaxValue"}}})],p.prototype,"maxValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"]],write:!0}})],p.prototype,"color",void 0),p=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.renderers.support.pointCloud.ColorClassBreakInfo")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorModulation.js":
/*!************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/ColorModulation.js ***!
  \************************************************************************************/
/*! exports provided: ColorModulation, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorModulation", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let i=s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.field=null,this.minValue=0,this.maxValue=255}clone(){return new s({field:this.field,minValue:this.minValue,maxValue:this.maxValue})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],i.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],i.prototype,"minValue",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],i.prototype,"maxValue",void 0),i=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.support.pointCloud.ColorModulation")],i);var p=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/ColorUniqueValueInfo.js":
/*!*****************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/ColorUniqueValueInfo.js ***!
  \*****************************************************************************************/
/*! exports provided: ColorUniqueValueInfo, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColorUniqueValueInfo", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let c=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.description=null,this.label=null,this.values=null,this.color=null}clone(){return new l({description:this.description,label:this.label,values:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.values),color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:[String],json:{write:!0}})],c.prototype,"values",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"]],write:!0}})],c.prototype,"color",void 0),c=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.renderers.support.pointCloud.ColorUniqueValueInfo")],c);var n=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeAlgorithm.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeAlgorithm.js ***!
  \***************************************************************************************/
/*! exports provided: PointSizeAlgorithm, default, typeKebabDictionary */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointSizeAlgorithm", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typeKebabDictionary", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({pointCloudFixedSizeAlgorithm:"fixed-size",pointCloudSplatAlgorithm:"splat"});let i=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:p.apiValues,readOnly:!0,nonNullable:!0,json:{type:p.jsonValues,read:!1,write:p.write}})],i.prototype,"type",void 0),i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.renderers.support.pointCloud.PointSizeAlgorithm")],i);var a=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeFixedSizeAlgorithm.js":
/*!************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeFixedSizeAlgorithm.js ***!
  \************************************************************************************************/
/*! exports provided: PointSizeFixedSizeAlgorithm, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointSizeFixedSizeAlgorithm", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./PointSizeAlgorithm.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeAlgorithm.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let p=i=class extends _PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(){super(...arguments),this.type="fixed-size",this.size=0,this.useRealWorldSymbolSizes=null}clone(){return new i({size:this.size,useRealWorldSymbolSizes:this.useRealWorldSymbolSizes})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({pointCloudFixedSizeAlgorithm:"fixed-size"})],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],p.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Boolean,json:{write:!0}})],p.prototype,"useRealWorldSymbolSizes",void 0),p=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.support.pointCloud.PointSizeFixedSizeAlgorithm")],p);var l=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeSplatAlgorithm.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeSplatAlgorithm.js ***!
  \********************************************************************************************/
/*! exports provided: PointSizeSplatAlgorithm, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointSizeSplatAlgorithm", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./PointSizeAlgorithm.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeAlgorithm.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let c=p=class extends _PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(){super(...arguments),this.type="splat",this.scaleFactor=1}clone(){return new p({scaleFactor:this.scaleFactor})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({pointCloudSplatAlgorithm:"splat"})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,value:1,nonNullable:!0,json:{write:!0}})],c.prototype,"scaleFactor",void 0),c=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.renderers.support.pointCloud.PointSizeSplatAlgorithm")],c);var a=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/pointCloud/pointSizeAlgorithmTypeUtils.js":
/*!************************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/pointCloud/pointSizeAlgorithmTypeUtils.js ***!
  \************************************************************************************************/
/*! exports provided: pointSizeAlgorithmTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pointSizeAlgorithmTypes", function() { return e; });
/* harmony import */ var _PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PointSizeAlgorithm.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeAlgorithm.js");
/* harmony import */ var _PointSizeFixedSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PointSizeFixedSizeAlgorithm.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeFixedSizeAlgorithm.js");
/* harmony import */ var _PointSizeSplatAlgorithm_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PointSizeSplatAlgorithm.js */ "../node_modules/@arcgis/core/renderers/support/pointCloud/PointSizeSplatAlgorithm.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={key:"type",base:_PointSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_0__["default"],typeMap:{"fixed-size":_PointSizeFixedSizeAlgorithm_js__WEBPACK_IMPORTED_MODULE_1__["default"],splat:_PointSizeSplatAlgorithm_js__WEBPACK_IMPORTED_MODULE_2__["default"]}};


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


/***/ })

};;
//# sourceMappingURL=44.render-page.js.map
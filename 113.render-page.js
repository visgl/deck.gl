exports.ids = [113];
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

/***/ "../node_modules/@arcgis/core/layers/support/RasterWorker.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/RasterWorker.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PixelBlock.js */ "../node_modules/@arcgis/core/layers/support/PixelBlock.js");
/* harmony import */ var _rasterFormats_RasterCodec_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rasterFormats/RasterCodec.js */ "../node_modules/@arcgis/core/layers/support/rasterFormats/RasterCodec.js");
/* harmony import */ var _rasterFunctions_pixelUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./rasterFunctions/pixelUtils.js */ "../node_modules/@arcgis/core/layers/support/rasterFunctions/pixelUtils.js");
/* harmony import */ var _rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./rasterFunctions/vectorFieldUtils.js */ "../node_modules/@arcgis/core/layers/support/rasterFunctions/vectorFieldUtils.js");
/* harmony import */ var _renderers_support_RasterSymbolizer_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../renderers/support/RasterSymbolizer.js */ "../node_modules/@arcgis/core/renderers/support/RasterSymbolizer.js");
/* harmony import */ var _geometry_Extent_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../geometry/Extent.js */ "../node_modules/@arcgis/core/geometry/Extent.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class a{convertVectorFieldData(o){const t=_PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o.pixelBlock),s=Object(_rasterFunctions_vectorFieldUtils_js__WEBPACK_IMPORTED_MODULE_5__["convertVectorFieldData"])(t,o.type);return Promise.resolve(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(s)&&s.toJSON())}async decode(e){const r=await Object(_rasterFormats_RasterCodec_js__WEBPACK_IMPORTED_MODULE_3__["decode"])(e.data,e.options);return r&&r.toJSON()}symbolize(o){o.pixelBlock=_PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o.pixelBlock),o.extent=o.extent?_geometry_Extent_js__WEBPACK_IMPORTED_MODULE_7__["default"].fromJSON(o.extent):null;const t=this.symbolizer.symbolize(o);return Promise.resolve(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&t.toJSON())}async updateSymbolizer(e){var r;this.symbolizer=_renderers_support_RasterSymbolizer_js__WEBPACK_IMPORTED_MODULE_6__["default"].fromJSON(e.symbolizerJSON),e.histograms&&"rasterStretch"===(null==(r=this.symbolizer)?void 0:r.rendererJSON.type)&&(this.symbolizer.rendererJSON.histograms=e.histograms)}stretch(o){const t=this.symbolizer.simpleStretch(_PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(o.srcPixelBlock),o.stretchParams);return Promise.resolve(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(t)&&t.toJSON())}estimateStatisticsHistograms(e){const o=Object(_rasterFunctions_pixelUtils_js__WEBPACK_IMPORTED_MODULE_4__["estimateStatisticsHistograms"])(_PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(e.srcPixelBlock));return Promise.resolve(o)}split(e){const o=Object(_rasterFunctions_pixelUtils_js__WEBPACK_IMPORTED_MODULE_4__["split"])(_PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"].fromJSON(e.srcPixelBlock),e.tileSize,e.maximumPyramidLevel);return o&&o.forEach(((e,r)=>{o.set(r,null==e?void 0:e.toJSON())})),Promise.resolve(o)}async mosaicAndTransform(e){const o=e.srcPixelBlocks.map((e=>e?new _PixelBlock_js__WEBPACK_IMPORTED_MODULE_2__["default"](e):null)),t=Object(_rasterFunctions_pixelUtils_js__WEBPACK_IMPORTED_MODULE_4__["mosaic"])(o,e.srcMosaicSize,null,null,e.alignmentInfo);if(!e.coefs)return t&&t.toJSON();const s=Object(_rasterFunctions_pixelUtils_js__WEBPACK_IMPORTED_MODULE_4__["approximateTransform"])(t,e.destDimension,e.coefs,e.sampleSpacing,e.interpolation);return s&&s.toJSON()}}


/***/ })

};;
//# sourceMappingURL=113.render-page.js.map
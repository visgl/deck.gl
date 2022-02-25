exports.ids = [4];
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

/***/ "../node_modules/@arcgis/core/chunks/LineCallout3DBorder.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/chunks/LineCallout3DBorder.js ***!
  \******************************************************************/
/*! exports provided: L, a, b */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "L", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return a; });
/* harmony import */ var _tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _symbols_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../symbols/support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let a=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]("white")}clone(){return new l({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color)})}};Object(_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_symbols_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_9__["colorAndTransparencyProperty"])],a.prototype,"color",void 0),a=l=Object(_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.callouts.LineCallout3DBorder")],a);var i=a,m=Object.freeze({__proto__:null,get LineCallout3DBorder(){return a},default:i});


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols.js":
/*!***********************************************!*\
  !*** ../node_modules/@arcgis/core/symbols.js ***!
  \***********************************************/
/*! exports provided: CIMSymbol, ExtrudeSymbol3DLayer, BaseFillSymbol, FillSymbol3DLayer, Font, IconSymbol3DLayer, LabelSymbol3D, LineSymbol3D, LineSymbol3DLayer, BaseMarkerSymbol, MeshSymbol3D, ObjectSymbol3DLayer, PathSymbol3DLayer, PictureFillSymbol, PictureMarkerSymbol, PointSymbol3D, PolygonSymbol3D, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, BaseSymbol, BaseSymbol3D, BaseSymbol3DLayer, TextSymbol, TextSymbol3DLayer, WaterSymbol3DLayer, WebStyleSymbol, LineCallout3D, LineCallout3DBorder, Symbol3DVerticalOffset, ensureType, isSymbol, isSymbol2D, isSymbol3D, readSymbol, symbolTypes, symbolTypes3D, symbolTypesCluster, symbolTypesLabel, symbolTypesLabel3D, symbolTypesRenderer, symbolTypesRenderer3D */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ensureType", function() { return g; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSymbol", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSymbol2D", function() { return x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSymbol3D", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readSymbol", function() { return k; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypes", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypes3D", function() { return C; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypesCluster", function() { return D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypesLabel", function() { return P; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypesLabel3D", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypesRenderer", function() { return M; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolTypesRenderer3D", function() { return h; });
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_extensions_serializableProperty_reader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/accessorSupport/extensions/serializableProperty/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/extensions/serializableProperty/reader.js");
/* harmony import */ var _symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./symbols/CIMSymbol.js */ "../node_modules/@arcgis/core/symbols/CIMSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CIMSymbol", function() { return _symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _symbols_ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./symbols/ExtrudeSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ExtrudeSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExtrudeSymbol3DLayer", function() { return _symbols_ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _symbols_FillSymbol_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./symbols/FillSymbol.js */ "../node_modules/@arcgis/core/symbols/FillSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseFillSymbol", function() { return _symbols_FillSymbol_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _symbols_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./symbols/FillSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FillSymbol3DLayer", function() { return _symbols_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _symbols_Font_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./symbols/Font.js */ "../node_modules/@arcgis/core/symbols/Font.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Font", function() { return _symbols_Font_js__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _symbols_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./symbols/IconSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "IconSymbol3DLayer", function() { return _symbols_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./symbols/LabelSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LabelSymbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LabelSymbol3D", function() { return _symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./symbols/LineSymbol3D.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LineSymbol3D", function() { return _symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _symbols_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./symbols/LineSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LineSymbol3DLayer", function() { return _symbols_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _symbols_MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./symbols/MarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/MarkerSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseMarkerSymbol", function() { return _symbols_MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./symbols/MeshSymbol3D.js */ "../node_modules/@arcgis/core/symbols/MeshSymbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MeshSymbol3D", function() { return _symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__["default"]; });

/* harmony import */ var _symbols_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./symbols/ObjectSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ObjectSymbol3DLayer", function() { return _symbols_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__["default"]; });

/* harmony import */ var _symbols_PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./symbols/PathSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/PathSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PathSymbol3DLayer", function() { return _symbols_PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"]; });

/* harmony import */ var _symbols_PictureFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./symbols/PictureFillSymbol.js */ "../node_modules/@arcgis/core/symbols/PictureFillSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PictureFillSymbol", function() { return _symbols_PictureFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__["default"]; });

/* harmony import */ var _symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./symbols/PictureMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PictureMarkerSymbol", function() { return _symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"]; });

/* harmony import */ var _symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./symbols/PointSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PointSymbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PointSymbol3D", function() { return _symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"]; });

/* harmony import */ var _symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./symbols/PolygonSymbol3D.js */ "../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PolygonSymbol3D", function() { return _symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__["default"]; });

/* harmony import */ var _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./symbols/SimpleFillSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SimpleFillSymbol", function() { return _symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_19__["default"]; });

/* harmony import */ var _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./symbols/SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SimpleLineSymbol", function() { return _symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_20__["default"]; });

/* harmony import */ var _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./symbols/SimpleMarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SimpleMarkerSymbol", function() { return _symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_21__["default"]; });

/* harmony import */ var _symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./symbols/Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseSymbol", function() { return _symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"]; });

/* harmony import */ var _symbols_Symbol3D_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./symbols/Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseSymbol3D", function() { return _symbols_Symbol3D_js__WEBPACK_IMPORTED_MODULE_23__["default"]; });

/* harmony import */ var _symbols_Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./symbols/Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseSymbol3DLayer", function() { return _symbols_Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_24__["default"]; });

/* harmony import */ var _symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./symbols/TextSymbol.js */ "../node_modules/@arcgis/core/symbols/TextSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextSymbol", function() { return _symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"]; });

/* harmony import */ var _symbols_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./symbols/TextSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextSymbol3DLayer", function() { return _symbols_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_26__["default"]; });

/* harmony import */ var _symbols_WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./symbols/WaterSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/WaterSymbol3DLayer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WaterSymbol3DLayer", function() { return _symbols_WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_27__["default"]; });

/* harmony import */ var _symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./symbols/WebStyleSymbol.js */ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WebStyleSymbol", function() { return _symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"]; });

/* harmony import */ var _symbols_callouts_LineCallout3D_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./symbols/callouts/LineCallout3D.js */ "../node_modules/@arcgis/core/symbols/callouts/LineCallout3D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LineCallout3D", function() { return _symbols_callouts_LineCallout3D_js__WEBPACK_IMPORTED_MODULE_29__["default"]; });

/* harmony import */ var _chunks_LineCallout3DBorder_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./chunks/LineCallout3DBorder.js */ "../node_modules/@arcgis/core/chunks/LineCallout3DBorder.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LineCallout3DBorder", function() { return _chunks_LineCallout3DBorder_js__WEBPACK_IMPORTED_MODULE_30__["L"]; });

/* harmony import */ var _symbols_support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./symbols/support/Symbol3DVerticalOffset.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DVerticalOffset.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Symbol3DVerticalOffset", function() { return _symbols_support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_31__["Symbol3DVerticalOffset"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function d(e){return e instanceof _symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"]}function x(e){if(!e)return!1;switch(e.type){case"picture-fill":case"picture-marker":case"simple-fill":case"simple-line":case"simple-marker":case"text":case"cim":return!0;default:return!1}}function c(e){if(!e)return!1;switch(e.type){case"label-3d":case"line-3d":case"mesh-3d":case"point-3d":case"polygon-3d":return!0;default:return!1}}const j={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"simple-fill":_symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_19__["default"],"picture-fill":_symbols_PictureFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__["default"],"picture-marker":_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"],"simple-line":_symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_20__["default"],"simple-marker":_symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_21__["default"],text:_symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"],"label-3d":_symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__["default"],"line-3d":_symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"],"mesh-3d":_symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__["default"],"point-3d":_symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"],"polygon-3d":_symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__["default"],"web-style":_symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"],cim:_symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"]},errorContext:"symbol"},D={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"picture-marker":_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"],"simple-marker":_symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_21__["default"],text:_symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"],"web-style":_symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"],cim:_symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"]},errorContext:"symbol"},k=Object(_core_accessorSupport_extensions_serializableProperty_reader_js__WEBPACK_IMPORTED_MODULE_1__["createTypeReader"])({types:j}),M={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"simple-fill":_symbols_SimpleFillSymbol_js__WEBPACK_IMPORTED_MODULE_19__["default"],"picture-fill":_symbols_PictureFillSymbol_js__WEBPACK_IMPORTED_MODULE_15__["default"],"picture-marker":_symbols_PictureMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_16__["default"],"simple-line":_symbols_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_20__["default"],"simple-marker":_symbols_SimpleMarkerSymbol_js__WEBPACK_IMPORTED_MODULE_21__["default"],text:_symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"],"line-3d":_symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"],"mesh-3d":_symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__["default"],"point-3d":_symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"],"polygon-3d":_symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__["default"],"web-style":_symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"],cim:_symbols_CIMSymbol_js__WEBPACK_IMPORTED_MODULE_2__["default"]},errorContext:"symbol"},P={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{text:_symbols_TextSymbol_js__WEBPACK_IMPORTED_MODULE_25__["default"],"label-3d":_symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__["default"]},errorContext:"symbol"},C={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"label-3d":_symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__["default"],"line-3d":_symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"],"mesh-3d":_symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__["default"],"point-3d":_symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"],"polygon-3d":_symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__["default"],"web-style":_symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"]},errorContext:"symbol"},h={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"line-3d":_symbols_LineSymbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"],"mesh-3d":_symbols_MeshSymbol3D_js__WEBPACK_IMPORTED_MODULE_12__["default"],"point-3d":_symbols_PointSymbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"],"polygon-3d":_symbols_PolygonSymbol3D_js__WEBPACK_IMPORTED_MODULE_18__["default"],"web-style":_symbols_WebStyleSymbol_js__WEBPACK_IMPORTED_MODULE_28__["default"]},errorContext:"symbol"},F={base:_symbols_Symbol_js__WEBPACK_IMPORTED_MODULE_22__["default"],key:"type",typeMap:{"label-3d":_symbols_LabelSymbol3D_js__WEBPACK_IMPORTED_MODULE_8__["default"]},errorContext:"symbol"},g=Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_0__["ensureOneOfType"])(j);


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/CIMSymbol.js":
/*!*********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/CIMSymbol.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_string_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let l=n=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_12__["default"]{constructor(r){super(r),this.data=null,this.type="cim"}readData(r,o){return o}writeData(r,o){if(r)for(const t in r)o[t]=r[t]}async collectRequiredFields(r,o){if("CIMSymbolReference"===this.data.type){const t=this.data.primitiveOverrides;if(t){const e=t.map((t=>{const e=t.valueExpressionInfo;return Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_11__["collectArcadeFieldNames"])(r,o,e.expression)}));await Promise.all(e)}}}clone(){return new n({data:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.data)})}hash(){return Object(_core_string_js__WEBPACK_IMPORTED_MODULE_2__["numericHash"])(JSON.stringify(this.data)).toString()}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!1}})],l.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!0}})],l.prototype,"data",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("data",["symbol"])],l.prototype,"readData",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("data")],l.prototype,"writeData",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({CIMSymbolReference:"cim"},{readOnly:!0})],l.prototype,"type",void 0),l=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.CIMSymbol")],l);var d=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/ExtrudeSymbol3DLayer.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/ExtrudeSymbol3DLayer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _edges_utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./edges/utils.js */ "../node_modules/@arcgis/core/symbols/edges/utils.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let m=l=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(e){super(e),this.type="extrude",this.size=1,this.material=null,this.castShadows=!0,this.edges=null}clone(){return new l({edges:this.edges&&this.edges.clone(),enabled:this.enabled,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.material)?this.material.clone():null,castShadows:this.castShadows,size:this.size})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({Extrude:"extrude"},{readOnly:!0})],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:{enabled:!0,isRequired:!0}},nonNullable:!0})],m.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_10__["default"],json:{write:!0}})],m.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,nonNullable:!0,json:{write:!0,default:!0}})],m.prototype,"castShadows",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_edges_utils_js__WEBPACK_IMPORTED_MODULE_9__["symbol3dEdgesProperty"])],m.prototype,"edges",void 0),m=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.ExtrudeSymbol3DLayer")],m);var c=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/FillSymbol.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/FillSymbol.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let l=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(e){super(e),this.outline=null,this.type=null}hash(){return`${this.type}.${this.outline&&this.outline.hash()}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({types:{key:"type",base:null,defaultKeyValue:"simple-line",typeMap:{"simple-line":_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_6__["default"]}},json:{default:null,write:!0}})],l.prototype,"outline",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["simple-fill","picture-fill"],readOnly:!0})],l.prototype,"type",void 0),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.symbols.FillSymbol")],l);var p=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _edges_utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./edges/utils.js */ "../node_modules/@arcgis/core/symbols/edges/utils.js");
/* harmony import */ var _patterns_StylePattern3D_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./patterns/StylePattern3D.js */ "../node_modules/@arcgis/core/symbols/patterns/StylePattern3D.js");
/* harmony import */ var _patterns_utils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./patterns/utils.js */ "../node_modules/@arcgis/core/symbols/patterns/utils.js");
/* harmony import */ var _support_colors_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/colors.js */ "../node_modules/@arcgis/core/symbols/support/colors.js");
/* harmony import */ var _support_Symbol3DFillMaterial_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/Symbol3DFillMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DFillMaterial.js");
/* harmony import */ var _support_Symbol3DOutline_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/Symbol3DOutline.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DOutline.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let y=d=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(t){super(t),this.type="fill",this.material=null,this.pattern=null,this.castShadows=!0,this.outline=null,this.edges=null}clone(){return new d({edges:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.edges)?this.edges.clone():null,enabled:this.enabled,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.material)?this.material.clone():null,pattern:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.pattern)?this.pattern.clone():null,castShadows:this.castShadows,outline:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.outline)?this.outline.clone():null})}static fromSimpleFillSymbol(t){return new d({material:{color:(t.color||_support_colors_js__WEBPACK_IMPORTED_MODULE_12__["transparentWhite"]).clone()},pattern:t.style&&"solid"!==t.style?new _patterns_StylePattern3D_js__WEBPACK_IMPORTED_MODULE_10__["default"]({style:t.style}):null,outline:t.outline?new _support_Symbol3DOutline_js__WEBPACK_IMPORTED_MODULE_14__["default"]({size:t.outline.width||0,color:(t.outline.color||_support_colors_js__WEBPACK_IMPORTED_MODULE_12__["white"]).clone(),pattern:"solid",patternCap:t.outline.cap||"butt"}):null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({Fill:"fill"},{readOnly:!0})],y.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DFillMaterial_js__WEBPACK_IMPORTED_MODULE_13__["default"],json:{write:!0}})],y.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_patterns_utils_js__WEBPACK_IMPORTED_MODULE_11__["symbol3dPatternProperty"])],y.prototype,"pattern",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,nonNullable:!0,json:{write:!0,default:!0}})],y.prototype,"castShadows",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DOutline_js__WEBPACK_IMPORTED_MODULE_14__["default"],json:{write:!0}})],y.prototype,"outline",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_edges_utils_js__WEBPACK_IMPORTED_MODULE_9__["symbol3dEdgesProperty"])],y.prototype,"edges",void 0),y=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.FillSymbol3DLayer")],y);var h=y;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/Font.js":
/*!****************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/Font.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let l=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(t){super(t),this.decoration="none",this.family="sans-serif",this.size=9,this.style="normal",this.weight="normal"}castSize(t){return Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"])(t)}clone(){return new a({decoration:this.decoration,family:this.family,size:this.size,style:this.style,weight:this.weight})}hash(){return`${this.decoration}.${this.family}.${this.size}.${this.style}.${this.weight}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["underline","line-through","none"],json:{default:"none",write:!0}})],l.prototype,"decoration",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],l.prototype,"family",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:{overridePolicy:(t,o,e)=>({enabled:!e||!e.textSymbol3D})}}})],l.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__["cast"])("size")],l.prototype,"castSize",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["normal","italic","oblique"],json:{default:"normal",write:!0}})],l.prototype,"style",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["normal","bold","bolder","lighter"],json:{default:"normal",write:!0}})],l.prototype,"weight",void 0),l=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.Font")],l);var n=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return S; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _support_colors_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/colors.js */ "../node_modules/@arcgis/core/symbols/support/colors.js");
/* harmony import */ var _support_IconSymbol3DLayerResource_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/IconSymbol3DLayerResource.js */ "../node_modules/@arcgis/core/symbols/support/IconSymbol3DLayerResource.js");
/* harmony import */ var _support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/* harmony import */ var _support_Symbol3DAnchorPosition2D_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/Symbol3DAnchorPosition2D.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition2D.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/* harmony import */ var _support_Symbol3DOutline_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./support/Symbol3DOutline.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DOutline.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;const f=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.symbols.IconSymbol3DLayer");let b=d=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(o){super(o),this.material=null,this.resource=null,this.type="icon",this.size=12,this.anchor="center",this.anchorPosition=void 0,this.outline=void 0}clone(){return new d({anchor:this.anchor,anchorPosition:this.anchorPosition&&this.anchorPosition.clone(),enabled:this.enabled,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.material)?this.material.clone():null,outline:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.outline)?this.outline.clone():null,resource:this.resource&&this.resource.clone(),size:this.size})}static fromSimpleMarkerSymbol(o){const t=o.color||_support_colors_js__WEBPACK_IMPORTED_MODULE_10__["white"],r=j(o),e=o.outline&&o.outline.width>0?{size:o.outline.width,color:(o.outline.color||_support_colors_js__WEBPACK_IMPORTED_MODULE_10__["white"]).clone()}:null;return new d({size:o.size,resource:{primitive:w(o.style)},material:{color:t},outline:e,anchor:r?"relative":void 0,anchorPosition:r})}static fromPictureMarkerSymbol(o){const t=!o.color||Object(_support_colors_js__WEBPACK_IMPORTED_MODULE_10__["isBlack"])(o.color)?_support_colors_js__WEBPACK_IMPORTED_MODULE_10__["white"]:o.color,r=j(o);return new d({size:o.width<=o.height?o.height:o.width,resource:{href:o.url},material:{color:t.clone()},anchor:r?"relative":void 0,anchorPosition:r})}static fromCIMSymbol(o){return new d({resource:{href:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["makeData"])({mediaType:"application/json",data:JSON.stringify(o.data)})}})}};function j(o){const t="width"in o?o.width:o.size,r="height"in o?o.height:o.size,e=v(o.xoffset),i=v(o.yoffset);return(e||i)&&t&&r?{x:-e/t,y:i/r}:null}function v(o){return isFinite(o)?o:0}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_14__["default"],json:{write:!0}})],b.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_IconSymbol3DLayerResource_js__WEBPACK_IMPORTED_MODULE_11__["default"],json:{write:!0}})],b.prototype,"resource",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({Icon:"icon"},{readOnly:!0})],b.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__["screenSizeProperty"])],b.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({center:"center",left:"left",right:"right",top:"top",bottom:"bottom",topLeft:"top-left",topRight:"top-right",bottomLeft:"bottom-left",bottomRight:"bottom-right",relative:"relative"}),Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{default:"center"}})],b.prototype,"anchor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_Symbol3DAnchorPosition2D_js__WEBPACK_IMPORTED_MODULE_13__["Symbol3DAnchorPosition2D"],json:{type:[Number],read:{reader:o=>new _support_Symbol3DAnchorPosition2D_js__WEBPACK_IMPORTED_MODULE_13__["Symbol3DAnchorPosition2D"]({x:o[0],y:o[1]})},write:{writer:(o,t)=>{t.anchorPosition=[o.x,o.y]},overridePolicy(){return{enabled:"relative"===this.anchor}}}}})],b.prototype,"anchorPosition",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_Symbol3DOutline_js__WEBPACK_IMPORTED_MODULE_15__["default"],json:{write:!0}})],b.prototype,"outline",void 0),b=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.IconSymbol3DLayer")],b);const g={circle:"circle",cross:"cross",diamond:"kite",square:"square",x:"x",triangle:"triangle",path:null};function w(o){const t=g[o];return t||(f.warn(`${o} cannot be mapped to Icon symbol. Fallback to "circle"`),"circle")}var S=b;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/LabelSymbol3D.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/LabelSymbol3D.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony import */ var _TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./TextSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js");
/* harmony import */ var _callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./callouts/calloutUtils.js */ "../node_modules/@arcgis/core/symbols/callouts/calloutUtils.js");
/* harmony import */ var _support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/Symbol3DVerticalOffset.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DVerticalOffset.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;const n=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{text:_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]}});let f=u=class extends _Symbol3D_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(t){super(t),this.verticalOffset=null,this.callout=null,this.styleOrigin=null,this.symbolLayers=new n,this.type="label-3d"}supportsCallout(){return!0}hasVisibleCallout(){return Object(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_11__["hasVisibleCallout"])(this)}hasVisibleVerticalOffset(){return Object(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_11__["hasVisibleVerticalOffset"])(this)}clone(){return new u({styleOrigin:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.styleOrigin),symbolLayers:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.symbolLayers),thumbnail:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.thumbnail),callout:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.callout),verticalOffset:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.verticalOffset)})}static fromTextSymbol(t){return new u({symbolLayers:[_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"].fromTextSymbol(t)]})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_12__["default"],json:{write:!0}})],f.prototype,"verticalOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_11__["calloutProperty"])],f.prototype,"callout",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{read:!1,write:!1}})],f.prototype,"styleOrigin",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:n})],f.prototype,"symbolLayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({LabelSymbol3D:"label-3d"},{readOnly:!0})],f.prototype,"type",void 0),f=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.LabelSymbol3D")],f);var b=f;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/LineSymbol.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/LineSymbol.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let i=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(r){super(r),this.type="simple-line",this.width=.75}hash(){return`${this.type}.${this.width}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({esriSLS:"simple-line"},{readOnly:!0})],i.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"],json:{write:!0}})],i.prototype,"width",void 0),i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.LineSymbol")],i);var c=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/LineSymbol3D.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/LineSymbol3D.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./LineSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js");
/* harmony import */ var _PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./PathSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/PathSymbol3DLayer.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;const a=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{line:_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"],path:_PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]}}),n=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{line:_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"],path:_PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]}});let c=l=class extends _Symbol3D_js__WEBPACK_IMPORTED_MODULE_11__["default"]{constructor(o){super(o),this.symbolLayers=new a,this.type="line-3d"}clone(){return new l({styleOrigin:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.styleOrigin),symbolLayers:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.symbolLayers),thumbnail:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.thumbnail)})}static fromSimpleLineSymbol(o){return new l({symbolLayers:[_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"].fromSimpleLineSymbol(o)]})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:a,json:{type:n}})],c.prototype,"symbolLayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({LineSymbol3D:"line-3d"},{readOnly:!0})],c.prototype,"type",void 0),c=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.LineSymbol3D")],c);var b=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return j; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _support_colors_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/colors.js */ "../node_modules/@arcgis/core/symbols/support/colors.js");
/* harmony import */ var _support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/* harmony import */ var _support_symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/symbolLayerUtils3D.js */ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var y;let f=y=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(t){super(t),this.material=null,this.type="line",this.join="miter",this.cap="butt",this.size=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["px2pt"])(1),this.pattern="solid",this.stipplePattern=null,this.stippleOffColor=null}clone(){return new y({enabled:this.enabled,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.material)?this.material.clone():null,size:this.size,join:this.join,cap:this.cap,pattern:this.pattern,stipplePattern:this.stipplePattern?this.stipplePattern.slice():null,stippleOffColor:this.stippleOffColor?this.stippleOffColor.clone():null})}static fromSimpleLineSymbol(t){return new y({size:t.width||1,cap:t.cap||"butt",join:t.join||"miter",pattern:"solid",material:{color:(t.color||_support_colors_js__WEBPACK_IMPORTED_MODULE_11__["white"]).clone()}})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_13__["default"],json:{write:!0}})],f.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({Line:"line"},{readOnly:!0})],f.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["miter","bevel","round"],json:{write:!0,default:"miter"}})],f.prototype,"join",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["butt","square","round"],json:{write:!0,default:"butt"}})],f.prototype,"cap",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__["screenSizeProperty"])],f.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_14__["linePatterns"]})],f.prototype,"pattern",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__["stipplePatternProperty"])],f.prototype,"stipplePattern",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]})],f.prototype,"stippleOffColor",void 0),f=y=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.LineSymbol3DLayer")],f);var j=f;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/LineSymbolMarker.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/LineSymbolMarker.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let n=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r),this.placement="begin-end",this.type="line-marker",this.style="arrow"}writeStyle(r,o,e,t){"web-map"===(null==t?void 0:t.origin)?o[e]="arrow":o[e]=r}set color(r){this._set("color",r)}readColor(r){return r&&null!=r[0]?[r[0],r[1],r[2],r[3]/255]:r}writeColor(r,o,e,t){"web-map"===(null==t?void 0:t.origin)||(o[e]=r)}clone(){return new a({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color),placement:this.placement,style:this.style})}hash(){var r;return`${this.placement}.${null==(r=this.color)?void 0:r.hash()}.${this.style}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["begin","end","begin-end"],json:{write:!0}})],n.prototype,"placement",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({"line-marker":"line-marker"},{readOnly:!0}),Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({json:{origins:{"web-map":{write:!1}}}})],n.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["arrow","circle","square","diamond","cross","x"]})],n.prototype,"style",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("style")],n.prototype,"writeStyle",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],value:null,json:{write:{allowNull:!0}}})],n.prototype,"color",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("color")],n.prototype,"readColor",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("color")],n.prototype,"writeColor",null),n=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.LineSymbolMarker")],n);var m=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/MarkerSymbol.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/MarkerSymbol.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let p=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(e){super(e),this.angle=0,this.type=null,this.xoffset=0,this.yoffset=0,this.size=9}hash(){return`${this.type}.${this.angle}.${this.size}.${this.xoffset}.${this.yoffset}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{read:e=>e&&-1*e,write:(e,t)=>t.angle=e&&-1*e}})],p.prototype,"angle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["simple-marker","picture-marker"],readOnly:!0})],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"],json:{write:!0}})],p.prototype,"xoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"],json:{write:!0}})],p.prototype,"yoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,cast:e=>"auto"===e?e:Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"])(e),json:{write:!0}})],p.prototype,"size",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.MarkerSymbol")],p);var i=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/MeshSymbol3D.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/MeshSymbol3D.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./FillSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;const y=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{fill:_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"]}});let a=l=class extends _Symbol3D_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(o){super(o),this.symbolLayers=new y,this.type="mesh-3d"}clone(){return new l({styleOrigin:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.styleOrigin),symbolLayers:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.symbolLayers),thumbnail:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.thumbnail)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:y})],a.prototype,"symbolLayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({MeshSymbol3D:"mesh-3d"},{readOnly:!0})],a.prototype,"type",void 0),a=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.MeshSymbol3D")],a);var c=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _support_ObjectSymbol3DLayerResource_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./support/ObjectSymbol3DLayerResource.js */ "../node_modules/@arcgis/core/symbols/support/ObjectSymbol3DLayerResource.js");
/* harmony import */ var _support_Symbol3DAnchorPosition3D_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/Symbol3DAnchorPosition3D.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition3D.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let c=n=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_8__["default"]{constructor(o){super(o),this.material=null,this.castShadows=!0,this.resource=null,this.type="object",this.width=void 0,this.height=void 0,this.depth=void 0,this.anchor=void 0,this.anchorPosition=void 0,this.heading=void 0,this.tilt=void 0,this.roll=void 0}clone(){return new n({heading:this.heading,tilt:this.tilt,roll:this.roll,anchor:this.anchor,anchorPosition:this.anchorPosition&&this.anchorPosition.clone(),depth:this.depth,enabled:this.enabled,height:this.height,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.material)?this.material.clone():null,castShadows:this.castShadows,resource:this.resource&&this.resource.clone(),width:this.width})}get isPrimitive(){return!this.resource||"string"!=typeof this.resource.href}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_11__["default"],json:{write:!0}})],c.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,nonNullable:!0,json:{write:!0,default:!0}})],c.prototype,"castShadows",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_ObjectSymbol3DLayerResource_js__WEBPACK_IMPORTED_MODULE_9__["default"],json:{write:!0}})],c.prototype,"resource",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({Object:"object"},{readOnly:!0})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"width",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"height",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"depth",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({center:"center",top:"top",bottom:"bottom",origin:"origin",relative:"relative"}),Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{default:"origin"}})],c.prototype,"anchor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DAnchorPosition3D_js__WEBPACK_IMPORTED_MODULE_10__["Symbol3DAnchorPosition3D"],json:{type:[Number],read:{reader:o=>new _support_Symbol3DAnchorPosition3D_js__WEBPACK_IMPORTED_MODULE_10__["Symbol3DAnchorPosition3D"]({x:o[0],y:o[1],z:o[2]})},write:{writer:(o,t)=>{t.anchorPosition=[o.x,o.y,o.z]},overridePolicy(){return{enabled:"relative"===this.anchor}}}}})],c.prototype,"anchorPosition",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"heading",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"tilt",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],c.prototype,"roll",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],c.prototype,"isPrimitive",null),c=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.ObjectSymbol3DLayer")],c);var l=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/PathSymbol3DLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/PathSymbol3DLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let h=l=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(t){super(t),this.material=null,this.castShadows=!0,this.type="path",this.profile="circle",this.join="miter",this.cap="butt",this.width=void 0,this.height=void 0,this.anchor="center",this.profileRotation="all"}readWidth(t,e){return null!=t?t:null==e.height&&null!=e.size?e.size:void 0}readHeight(t,e){return null!=t?t:null==e.width&&null!=e.size?e.size:void 0}clone(){return new l({enabled:this.enabled,material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.material)?this.material.clone():null,castShadows:this.castShadows,profile:this.profile,join:this.join,cap:this.cap,width:this.width,height:this.height,profileRotation:this.profileRotation,anchor:this.anchor})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_10__["default"],json:{write:!0}})],h.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,nonNullable:!0,json:{write:!0,default:!0}})],h.prototype,"castShadows",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({Path:"path"},{readOnly:!0})],h.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["circle","quad"],json:{write:!0,default:"circle"}})],h.prototype,"profile",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["miter","bevel","round"],json:{write:!0,default:"miter"}})],h.prototype,"join",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["none","butt","square","round"],json:{write:!0,default:"butt"}})],h.prototype,"cap",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:{enabled:!0,target:{width:{type:Number},size:{type:Number}}}}})],h.prototype,"width",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("width",["width","size","height"])],h.prototype,"readWidth",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],h.prototype,"height",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_7__["reader"])("height",["height","size","width"])],h.prototype,"readHeight",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["center","bottom","top"],json:{write:!0,default:"center"}})],h.prototype,"anchor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["heading","all"],json:{write:!0,default:"all"}})],h.prototype,"profileRotation",void 0),h=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.PathSymbol3DLayer")],h);var n=h;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/PictureFillSymbol.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/PictureFillSymbol.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _FillSymbol_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./FillSymbol.js */ "../node_modules/@arcgis/core/symbols/FillSymbol.js");
/* harmony import */ var _support_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/urlUtils.js */ "../node_modules/@arcgis/core/symbols/support/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let u=c=class extends _FillSymbol_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(...t){super(...t),this.type="picture-fill",this.url=null,this.xscale=1,this.yscale=1,this.width=12,this.height=12,this.xoffset=0,this.yoffset=0,this.source=null}normalizeCtorArgs(t,o,e,r){if(t&&"string"!=typeof t&&null==t.imageData)return t;const i={};return t&&(i.url=t),o&&(i.outline=o),null!=e&&(i.width=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"])(e)),null!=r&&(i.height=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"])(r)),i}clone(){const t=new c({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.color),height:this.height,outline:this.outline&&this.outline.clone(),url:this.url,width:this.width,xoffset:this.xoffset,xscale:this.xscale,yoffset:this.yoffset,yscale:this.yscale});return t._set("source",Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.source)),t}hash(){var t;return`${super.hash()}.${null==(t=this.color)?void 0:t.hash()}.${this.height}.${this.url}.${this.width}.${this.xoffset}.${this.xscale}.${this.yoffset}.${this.yscale}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({esriPFS:"picture-fill"},{readOnly:!0})],u.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_support_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__["urlPropertyDefinition"])],u.prototype,"url",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],u.prototype,"xscale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0}})],u.prototype,"yscale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],u.prototype,"width",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],u.prototype,"height",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],u.prototype,"xoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],u.prototype,"yoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_support_urlUtils_js__WEBPACK_IMPORTED_MODULE_10__["sourcePropertyDefinition"])],u.prototype,"source",void 0),u=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.PictureFillSymbol")],u);var a=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/PictureMarkerSymbol.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./MarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/MarkerSymbol.js");
/* harmony import */ var _support_urlUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/urlUtils.js */ "../node_modules/@arcgis/core/symbols/support/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let a=l=class extends _MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(...r){super(...r),this.color=null,this.type="picture-marker",this.url=null,this.source=null,this.height=12,this.width=12,this.size=null}normalizeCtorArgs(r,t,o){if(r&&"string"!=typeof r&&null==r.imageData)return r;const s={};return r&&(s.url=r),null!=t&&(s.width=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"])(t)),null!=o&&(s.height=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"])(o)),s}readHeight(r,t){return t.size||r}readWidth(r,t){return t.size||r}clone(){const r=new l({angle:this.angle,height:this.height,url:this.url,width:this.width,xoffset:this.xoffset,yoffset:this.yoffset});return r._set("source",Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.source)),r}hash(){return`${super.hash()}.${this.height}.${this.url}.${this.width}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!1}})],a.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({esriPMS:"picture-marker"},{readOnly:!0})],a.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_support_urlUtils_js__WEBPACK_IMPORTED_MODULE_11__["urlPropertyDefinition"])],a.prototype,"url",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_support_urlUtils_js__WEBPACK_IMPORTED_MODULE_11__["sourcePropertyDefinition"])],a.prototype,"source",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],a.prototype,"height",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("height",["height","size"])],a.prototype,"readHeight",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_2__["toPt"],json:{write:!0}})],a.prototype,"width",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!1}})],a.prototype,"size",void 0),a=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.PictureMarkerSymbol")],a);var n=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/PointSymbol3D.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/PointSymbol3D.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./IconSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js");
/* harmony import */ var _ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ObjectSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony import */ var _TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./TextSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js");
/* harmony import */ var _callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./callouts/calloutUtils.js */ "../node_modules/@arcgis/core/symbols/callouts/calloutUtils.js");
/* harmony import */ var _support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./support/Symbol3DVerticalOffset.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DVerticalOffset.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var S;const h=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{icon:_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"],object:_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__["default"],text:_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"]}}),j=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{icon:_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"],object:_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__["default"]}});let L=S=class extends _Symbol3D_js__WEBPACK_IMPORTED_MODULE_13__["default"]{constructor(t){super(t),this.verticalOffset=null,this.callout=null,this.symbolLayers=new h,this.type="point-3d"}writeSymbolLayers(t,e,r,s){const l=t.filter((t=>"text"!==t.type));if(s&&s.messages&&l.length<t.length){const e=t.find((t=>"text"===t.type));s.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("symbol-layer:unsupported","Symbol layers of type 'text' cannot be persisted in PointSymbol3D",{symbolLayer:e}))}e[r]=l.map((t=>t.write({},s))).toArray()}supportsCallout(){if((this.symbolLayers?this.symbolLayers.length:0)<1)return!1;for(const t of this.symbolLayers.items)switch(t.type){case"icon":case"text":case"object":continue;default:return!1}return!0}hasVisibleCallout(){return Object(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_15__["hasVisibleCallout"])(this)}hasVisibleVerticalOffset(){return Object(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_15__["hasVisibleVerticalOffset"])(this)}clone(){return new S({verticalOffset:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.verticalOffset),callout:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.callout),styleOrigin:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.styleOrigin),symbolLayers:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.symbolLayers),thumbnail:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.thumbnail)})}static fromSimpleMarkerSymbol(t){return new S({symbolLayers:[_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromSimpleMarkerSymbol(t)]})}static fromPictureMarkerSymbol(t){return new S({symbolLayers:[_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromPictureMarkerSymbol(t)]})}static fromCIMSymbol(t){if(t.data&&t.data.symbol){const e=t.data.symbol;if("CIMPointSymbol"===e.type&&e.callout)return new S({symbolLayers:[_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromCIMSymbol(t)],callout:{type:"line",size:.5,color:[0,0,0]},verticalOffset:{screenLength:40}})}return new S({symbolLayers:[_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"].fromCIMSymbol(t)]})}static fromTextSymbol(t){return new S({symbolLayers:[_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"].fromTextSymbol(t)]})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_Symbol3DVerticalOffset_js__WEBPACK_IMPORTED_MODULE_16__["default"],json:{write:!0}})],L.prototype,"verticalOffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_callouts_calloutUtils_js__WEBPACK_IMPORTED_MODULE_15__["calloutProperty"])],L.prototype,"callout",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:h,json:{type:j,origins:{"web-scene":{type:j}}}})],L.prototype,"symbolLayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("web-scene","symbolLayers")],L.prototype,"writeSymbolLayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({PointSymbol3D:"point-3d"},{readOnly:!0})],L.prototype,"type",void 0),L=S=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.PointSymbol3D")],L);var d=L;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/PolygonSymbol3D.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ExtrudeSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ExtrudeSymbol3DLayer.js");
/* harmony import */ var _FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./FillSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js");
/* harmony import */ var _IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./IconSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js");
/* harmony import */ var _LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./LineSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js");
/* harmony import */ var _ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./ObjectSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js");
/* harmony import */ var _Symbol3D_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./Symbol3D.js */ "../node_modules/@arcgis/core/symbols/Symbol3D.js");
/* harmony import */ var _TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./TextSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js");
/* harmony import */ var _WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./WaterSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/WaterSymbol3DLayer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var j;const S=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{extrude:_ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__["default"],fill:_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__["default"],icon:_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"],line:_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_15__["default"],object:_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_16__["default"],text:_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_18__["default"],water:_WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_19__["default"]}}),d=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:null,key:"type",typeMap:{extrude:_ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_12__["default"],fill:_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__["default"],icon:_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"],line:_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_15__["default"],object:_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_16__["default"],water:_WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_19__["default"]}});let g=j=class extends _Symbol3D_js__WEBPACK_IMPORTED_MODULE_17__["default"]{constructor(e){super(e),this.symbolLayers=new S,this.type="polygon-3d"}writeSymbolLayers(e,o,t,s){const y=e.filter((e=>"text"!==e.type));if(s&&s.messages&&y.length<e.length){const o=e.find((e=>"text"===e.type));s.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("symbol-layer:unsupported","Symbol layers of type 'text' cannot be persisted in PolygonSymbol3D",{symbolLayer:o}))}o[t]=y.map((e=>e.write({},s))).toArray()}clone(){return new j({styleOrigin:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.styleOrigin),symbolLayers:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.symbolLayers),thumbnail:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.thumbnail)})}static fromJSON(e){const o=new j;if(o.read(e),2===o.symbolLayers.length&&"fill"===o.symbolLayers.getItemAt(0).type&&"line"===o.symbolLayers.getItemAt(1).type){const r=o.symbolLayers.getItemAt(0),t=o.symbolLayers.getItemAt(1);!t.enabled||e.symbolLayers&&e.symbolLayers[1]&&!1===e.symbolLayers[1].enable||(r.outline={size:t.size,color:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(t.material)?t.material.color:null}),o.symbolLayers.removeAt(1)}return o}static fromSimpleFillSymbol(e){return new j({symbolLayers:[_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromSimpleFillSymbol(e)]})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:S,json:{type:d}})],g.prototype,"symbolLayers",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("web-scene","symbolLayers")],g.prototype,"writeSymbolLayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__["enumeration"])({PolygonSymbol3D:"polygon-3d"},{readOnly:!0})],g.prototype,"type",void 0),g=j=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.PolygonSymbol3D")],g);var h=g;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/SimpleFillSymbol.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return S; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _FillSymbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./FillSymbol.js */ "../node_modules/@arcgis/core/symbols/FillSymbol.js");
/* harmony import */ var _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;const n=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({esriSFSSolid:"solid",esriSFSNull:"none",esriSFSHorizontal:"horizontal",esriSFSVertical:"vertical",esriSFSForwardDiagonal:"forward-diagonal",esriSFSBackwardDiagonal:"backward-diagonal",esriSFSCross:"cross",esriSFSDiagonalCross:"diagonal-cross"});let m=c=class extends _FillSymbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(...o){super(...o),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,.25]),this.outline=new _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_11__["default"],this.type="simple-fill",this.style="solid"}normalizeCtorArgs(o,r,s){if(o&&"string"!=typeof o)return o;const e={};return o&&(e.style=o),r&&(e.outline=r),s&&(e.color=s),e}clone(){return new c({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color),outline:this.outline&&this.outline.clone(),style:this.style})}hash(){return`${super.hash()}${this.style}.${this.color&&this.color.hash()}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],m.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])()],m.prototype,"outline",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({esriSFS:"simple-fill"},{readOnly:!0})],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:n.apiValues,json:{read:n.read,write:n.write}})],m.prototype,"style",void 0),m=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.SimpleFillSymbol")],m);var S=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _LineSymbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./LineSymbol.js */ "../node_modules/@arcgis/core/symbols/LineSymbol.js");
/* harmony import */ var _LineSymbolMarker_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./LineSymbolMarker.js */ "../node_modules/@arcgis/core/symbols/LineSymbolMarker.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;const h=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({esriSLSSolid:"solid",esriSLSDash:"dash",esriSLSDot:"dot",esriSLSDashDot:"dash-dot",esriSLSDashDotDot:"long-dash-dot-dot",esriSLSNull:"none",esriSLSInsideFrame:"inside-frame",esriSLSShortDash:"short-dash",esriSLSShortDot:"short-dot",esriSLSShortDashDot:"short-dash-dot",esriSLSShortDashDotDot:"short-dash-dot-dot",esriSLSLongDash:"long-dash",esriSLSLongDashDot:"long-dash-dot"});let d=p=class extends _LineSymbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(...r){super(...r),this.type="simple-line",this.style="solid",this.cap="round",this.join="round",this.marker=null,this.miterLimit=2}normalizeCtorArgs(r,o,e,s,i,l){if(r&&"string"!=typeof r)return r;const n={};return null!=r&&(n.style=r),null!=o&&(n.color=o),null!=e&&(n.width=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"])(e)),null!=s&&(n.cap=s),null!=i&&(n.join=i),null!=l&&(n.miterLimit=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"])(l)),n}clone(){var r;return new p({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.color),style:this.style,width:this.width,cap:this.cap,join:this.join,miterLimit:this.miterLimit,marker:null==(r=this.marker)?void 0:r.clone()})}hash(){var r,o;return`${super.hash()}.${null==(r=this.color)?void 0:r.hash()}.${this.style}.${this.cap}.${this.join}.${this.miterLimit}.${null==(o=this.marker)?void 0:o.hash()}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({esriSLS:"simple-line"},{readOnly:!0})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:h.apiValues,json:{read:h.read,write:h.write}})],d.prototype,"style",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["butt","round","square"],json:{write:{overridePolicy:(r,o,e)=>({enabled:"round"!==r&&(null==e||null==e.origin)})}}})],d.prototype,"cap",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["miter","round","bevel"],json:{write:{overridePolicy:(r,o,e)=>({enabled:"round"!==r&&(null==e||null==e.origin)})}}})],d.prototype,"join",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({types:{key:"type",base:null,defaultKeyValue:"line-marker",typeMap:{"line-marker":_LineSymbolMarker_js__WEBPACK_IMPORTED_MODULE_11__["default"]}},json:{write:!0,origins:{"web-scene":{write:!1}}}})],d.prototype,"marker",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{read:!1,write:!1}})],d.prototype,"miterLimit",void 0),d=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.SimpleLineSymbol")],d);var m=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/SimpleMarkerSymbol.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./MarkerSymbol.js */ "../node_modules/@arcgis/core/symbols/MarkerSymbol.js");
/* harmony import */ var _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./SimpleLineSymbol.js */ "../node_modules/@arcgis/core/symbols/SimpleLineSymbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var h;const m=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({esriSMSCircle:"circle",esriSMSSquare:"square",esriSMSCross:"cross",esriSMSX:"x",esriSMSDiamond:"diamond",esriSMSTriangle:"triangle",esriSMSPath:"path"});let u=h=class extends _MarkerSymbol_js__WEBPACK_IMPORTED_MODULE_12__["default"]{constructor(...r){super(...r),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([255,255,255,.25]),this.type="simple-marker",this.size=12,this.style="circle",this.outline=new _SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_13__["default"]}normalizeCtorArgs(r,e,o,t){if(r&&"string"!=typeof r)return r;const i={};return r&&(i.style=r),null!=e&&(i.size=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["toPt"])(e)),o&&(i.outline=o),t&&(i.color=t),i}writeColor(r,e){r&&"x"!==this.style&&"cross"!==this.style&&(e.color=r.toJSON()),null===r&&(e.color=null)}set path(r){this.style="path",this._set("path",r)}clone(){return new h({angle:this.angle,color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color),outline:this.outline&&this.outline.clone(),path:this.path,size:this.size,style:this.style,xoffset:this.xoffset,yoffset:this.yoffset})}hash(){var r;return`${super.hash()}.${this.color&&this.color.hash()}.${this.path}.${this.style}.${null==(r=this.outline)?void 0:r.hash()}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],u.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("color")],u.prototype,"writeColor",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__["enumeration"])({esriSMS:"simple-marker"},{readOnly:!0})],u.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])()],u.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:m.apiValues,json:{read:m.read,write:m.write}})],u.prototype,"style",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:String,json:{write:!0}})],u.prototype,"path",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({types:{key:"type",base:null,defaultKeyValue:"simple-line",typeMap:{"simple-line":_SimpleLineSymbol_js__WEBPACK_IMPORTED_MODULE_13__["default"]}},json:{default:null,write:!0}})],u.prototype,"outline",void 0),u=h=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.SimpleMarkerSymbol")],u);var y=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/Symbol.js":
/*!******************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/Symbol.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["JSONMap"]({esriSMS:"simple-marker",esriPMS:"picture-marker",esriSLS:"simple-line",esriSFS:"simple-fill",esriPFS:"picture-fill",esriTS:"text",esriSHD:"shield-label-symbol",PointSymbol3D:"point-3d",LineSymbol3D:"line-3d",PolygonSymbol3D:"polygon-3d",WebStyleSymbol:"web-style",MeshSymbol3D:"mesh-3d",LabelSymbol3D:"label-3d",CIMSymbolReference:"cim"});let c=0,m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(r){super(r),this.id="sym"+c++,this.type=null}set color(r){this._set("color",r)}readColor(r){return r&&null!=r[0]?[r[0],r[1],r[2],r[3]/255]:r}async collectRequiredFields(r,e){}hash(){return JSON.stringify(this.toJSON())}clone(){}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:p.apiValues,readOnly:!0,json:{read:!1,write:{ignoreOrigin:!0,writer:p.write}}})],m.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],value:new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,1]),json:{write:{allowNull:!0}}})],m.prototype,"color",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_8__["reader"])("color")],m.prototype,"readColor",null),m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.Symbol")],m);var a=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/Symbol3D.js":
/*!********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/Symbol3D.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return A; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/collectionUtils.js */ "../node_modules/@arcgis/core/core/collectionUtils.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./ExtrudeSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ExtrudeSymbol3DLayer.js");
/* harmony import */ var _FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./FillSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/FillSymbol3DLayer.js");
/* harmony import */ var _IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./IconSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/IconSymbol3DLayer.js");
/* harmony import */ var _LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./LineSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/LineSymbol3DLayer.js");
/* harmony import */ var _ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./ObjectSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/ObjectSymbol3DLayer.js");
/* harmony import */ var _PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./PathSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/PathSymbol3DLayer.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./TextSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js");
/* harmony import */ var _WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./WaterSymbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/WaterSymbol3DLayer.js");
/* harmony import */ var _support_StyleOrigin_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./support/StyleOrigin.js */ "../node_modules/@arcgis/core/symbols/support/StyleOrigin.js");
/* harmony import */ var _support_Thumbnail_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./support/Thumbnail.js */ "../node_modules/@arcgis/core/symbols/support/Thumbnail.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const v={icon:_IconSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_16__["default"],object:_ObjectSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_18__["default"],line:_LineSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_17__["default"],path:_PathSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_19__["default"],fill:_FillSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_15__["default"],extrude:_ExtrudeSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_14__["default"],text:_TextSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_22__["default"],water:_WaterSymbol3DLayer_js__WEBPACK_IMPORTED_MODULE_23__["default"]},C=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({base:_Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_21__["default"],key:"type",typeMap:v,errorContext:"symbol-layer"}),T=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.symbols.Symbol3D");let k=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_20__["default"]{constructor(e){super(e),this.styleOrigin=null,this.thumbnail=null,this.type=null;const o=this.__accessor__&&this.__accessor__.metadatas&&this.__accessor__.metadatas.symbolLayers,t=o&&o.type||_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"];this._set("symbolLayers",new t)}get color(){return null}set color(e){T.error("Symbol3D does not support colors on the symbol level. Colors may be set on individual symbol layer materials instead.")}set symbolLayers(e){Object(_core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_2__["referenceSetter"])(e,this._get("symbolLayers"))}readStyleOrigin(e,r,o){if(e.styleUrl&&e.name){const r=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_13__["f"])(e.styleUrl,o);return new _support_StyleOrigin_js__WEBPACK_IMPORTED_MODULE_24__["default"]({styleUrl:r,name:e.name})}if(e.styleName&&e.name)return new _support_StyleOrigin_js__WEBPACK_IMPORTED_MODULE_24__["default"]({portal:o&&o.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_12__["default"].getDefault(),styleName:e.styleName,name:e.name});o&&o.messages&&o.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("symbol3d:incomplete-style-origin","Style origin requires either a 'styleUrl' or 'styleName' and a 'name' property",{context:o,definition:e}))}writeStyleOrigin(e,r,o,t){if(e.styleUrl&&e.name){let o=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_13__["t"])(e.styleUrl,t);Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["isAbsolute"])(o)&&(o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["normalize"])(o)),r.styleOrigin={styleUrl:o,name:e.name}}else e.styleName&&e.name&&(e.portal&&t&&t.portal&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_4__["hasSamePortal"])(e.portal.restUrl,t.portal.restUrl)?t&&t.messages&&t.messages.push(new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("symbol:cross-portal","The symbol style origin cannot be persisted because it refers to an item on a different portal than the one being saved to.",{symbol:this})):r.styleOrigin={styleName:e.styleName,name:e.name})}normalizeCtorArgs(e){return e instanceof _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_21__["default"]||e&&v[e.type]?{symbolLayers:[e]}:Array.isArray(e)?{symbolLayers:e}:e}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({json:{read:!1,write:!1}})],k.prototype,"color",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:C,nonNullable:!0,json:{write:!0}}),Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_8__["cast"])(_core_collectionUtils_js__WEBPACK_IMPORTED_MODULE_2__["castForReferenceSetter"])],k.prototype,"symbolLayers",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_support_StyleOrigin_js__WEBPACK_IMPORTED_MODULE_24__["default"]})],k.prototype,"styleOrigin",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("styleOrigin")],k.prototype,"readStyleOrigin",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("styleOrigin",{"styleOrigin.styleUrl":{type:String},"styleOrigin.styleName":{type:String},"styleOrigin.name":{type:String}})],k.prototype,"writeStyleOrigin",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_support_Thumbnail_js__WEBPACK_IMPORTED_MODULE_25__["default"],json:{read:!1}})],k.prototype,"thumbnail",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:["point-3d","line-3d","polygon-3d","mesh-3d","label-3d"],readOnly:!0})],k.prototype,"type",void 0),k=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.Symbol3D")],k);var A=k;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/Symbol3DLayer.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(e){super(e),this.enabled=!0,this.type=null}writeEnabled(e,r,o){e||(r[o]=e)}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,json:{read:{source:"enable"},write:{target:"enable"}}})],p.prototype,"enabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("enabled")],p.prototype,"writeEnabled",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["icon","object","line","path","fill","water","extrude","text"],readOnly:!0})],p.prototype,"type",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.Symbol3DLayer")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/TextSymbol.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/TextSymbol.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _Font_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Font.js */ "../node_modules/@arcgis/core/symbols/Font.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let c=d=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_12__["default"]{constructor(...t){super(...t),this.backgroundColor=null,this.borderLineColor=null,this.borderLineSize=null,this.font=new _Font_js__WEBPACK_IMPORTED_MODULE_11__["default"],this.horizontalAlignment="center",this.kerning=!0,this.haloColor=null,this.haloSize=null,this.rightToLeft=null,this.rotated=!1,this.text="",this.type="text",this.verticalAlignment=null,this.xoffset=0,this.yoffset=0,this.angle=0,this.width=null,this.lineWidth=192,this.lineHeight=1}normalizeCtorArgs(t,o,e){if(t&&"string"!=typeof t)return t;const i={};return t&&(i.text=t),o&&(i.font=o),e&&(i.color=e),i}writeLineWidth(t,o,e,i){i&&"string"!=typeof i?i.origin:o[e]=t}castLineWidth(t){return Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"])(t)}writeLineHeight(t,o,e,i){i&&"string"!=typeof i?i.origin:o[e]=t}clone(){return new d({angle:this.angle,backgroundColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.backgroundColor),borderLineColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.borderLineColor),borderLineSize:this.borderLineSize,color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.color),font:this.font&&this.font.clone(),haloColor:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.haloColor),haloSize:this.haloSize,horizontalAlignment:this.horizontalAlignment,kerning:this.kerning,lineHeight:this.lineHeight,lineWidth:this.lineWidth,rightToLeft:this.rightToLeft,rotated:this.rotated,text:this.text,verticalAlignment:this.verticalAlignment,width:this.width,xoffset:this.xoffset,yoffset:this.yoffset})}hash(){return`${this.backgroundColor&&this.backgroundColor.hash()}.${this.borderLineColor}.${this.borderLineSize}.${this.color.hash()}.${this.font&&this.font.hash()}.${this.haloColor&&this.haloColor.hash()}.${this.haloSize}.${this.horizontalAlignment}.${this.kerning}.${this.rightToLeft}.${this.rotated}.${this.text}.${this.verticalAlignment}.${this.width}.${this.xoffset}.${this.yoffset}.${this.lineHeight}.${this.lineWidth}.${this.angle}`}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!0}})],c.prototype,"backgroundColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!0}})],c.prototype,"borderLineColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{write:!0}})],c.prototype,"borderLineSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Font_js__WEBPACK_IMPORTED_MODULE_11__["default"],json:{write:!0}})],c.prototype,"font",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["left","right","center","justify"],json:{write:!0}})],c.prototype,"horizontalAlignment",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Boolean,json:{write:!0}})],c.prototype,"kerning",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],json:{write:!0}})],c.prototype,"haloColor",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"],json:{write:!0}})],c.prototype,"haloSize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Boolean,json:{write:!0}})],c.prototype,"rightToLeft",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Boolean,json:{write:!0}})],c.prototype,"rotated",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],c.prototype,"text",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])({esriTS:"text"},{readOnly:!0})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["baseline","top","middle","bottom"],json:{write:!0}})],c.prototype,"verticalAlignment",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"],json:{write:!0}})],c.prototype,"xoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_3__["toPt"],json:{write:!0}})],c.prototype,"yoffset",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{read:t=>t&&-1*t,write:(t,o)=>o.angle=t&&-1*t}})],c.prototype,"angle",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number,json:{write:!0}})],c.prototype,"width",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number})],c.prototype,"lineWidth",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("lineWidth")],c.prototype,"writeLineWidth",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_5__["cast"])("lineWidth")],c.prototype,"castLineWidth",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Number})],c.prototype,"lineHeight",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_10__["writer"])("lineHeight")],c.prototype,"writeLineHeight",null),c=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.TextSymbol")],c);var y=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/TextSymbol3DLayer.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _Font_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Font.js */ "../node_modules/@arcgis/core/symbols/Font.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/* harmony import */ var _support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/* harmony import */ var _support_Symbol3DHalo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./support/Symbol3DHalo.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DHalo.js");
/* harmony import */ var _support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./support/Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var h;let u=h=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_11__["default"]{constructor(t){super(t),this._userSize=void 0,this.halo=null,this.material=null,this.text=void 0,this.type="text"}get font(){return this._get("font")||null}set font(t){t&&this._userSize&&(t.size=this._userSize),this._set("font",t)}writeFont(t,o,e,r){const s={...r,textSymbol3D:!0};o.font=t.write({},s),delete o.font.size}get size(){return null!=this._userSize?this._userSize:this.font&&null!=this.font.size?this.font.size:9}set size(t){this._userSize=t,this.font&&(this.font.size=this._userSize),this.notifyChange("size")}clone(){return new h({enabled:this.enabled,font:this.font&&Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.font),halo:this.halo&&Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.halo),material:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.material)?this.material.clone():null,size:this.size,text:this.text})}static fromTextSymbol(t){const o=f(t.haloColor,t.haloSize),e=t.font?t.font.clone():new _Font_js__WEBPACK_IMPORTED_MODULE_10__["default"];return new h({size:e.size,font:e,halo:o,material:t.color?{color:t.color.clone()}:null,text:t.text})}};function f(t,e){return t&&e>0?{color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(t),size:e}:null}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Font_js__WEBPACK_IMPORTED_MODULE_10__["default"],json:{write:!0}})],u.prototype,"font",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_9__["writer"])("font")],u.prototype,"writeFont",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_Symbol3DHalo_js__WEBPACK_IMPORTED_MODULE_13__["default"],json:{write:!0}})],u.prototype,"halo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_14__["default"],json:{write:!0}})],u.prototype,"material",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_12__["screenSizeProperty"]),Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],u.prototype,"size",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],u.prototype,"text",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({Text:"text"},{readOnly:!0})],u.prototype,"type",void 0),u=h=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.TextSymbol3DLayer")],u);var y=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/WaterSymbol3DLayer.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/WaterSymbol3DLayer.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Symbol3DLayer.js */ "../node_modules/@arcgis/core/symbols/Symbol3DLayer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let c=l=class extends _Symbol3DLayer_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(e){super(e),this.color=m.clone(),this.type="water",this.waterbodySize="medium",this.waveDirection=null,this.waveStrength="moderate"}clone(){return new l({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.color),waterbodySize:this.waterbodySize,waveDirection:this.waveDirection,waveStrength:this.waveStrength})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"],nonNullable:!0,json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__["Integer"]],write:(e,o,r)=>o[r]=e.toArray(1),default:()=>m.clone(),defaultEquals:e=>e.toCss(!0)===m.toCss(!0)}})],c.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])({Water:"water"},{readOnly:!0})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["small","medium","large"],json:{write:!0,default:"medium"}})],c.prototype,"waterbodySize",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,json:{write:!0,default:null}})],c.prototype,"waveDirection",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:["calm","rippled","slight","moderate"],json:{write:!0,default:"moderate"}})],c.prototype,"waveStrength",void 0),c=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.WaterSymbol3DLayer")],c);const m=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,119,190]);var n=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/WebStyleSymbol.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/WebStyleSymbol.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return b; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/* harmony import */ var _Symbol_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Symbol.js */ "../node_modules/@arcgis/core/symbols/Symbol.js");
/* harmony import */ var _support_Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./support/Thumbnail.js */ "../node_modules/@arcgis/core/symbols/support/Thumbnail.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;const c=_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger("esri.symbols.WebStyleSymbol");let u=n=class extends _Symbol_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(t){super(t),this.styleName=null,this.portal=null,this.styleUrl=null,this.thumbnail=null,this.name=null,this.type="web-style"}read(t,o){this.portal=o?o.portal:void 0,super.read(t,o)}clone(){return new n({name:this.name,styleUrl:this.styleUrl,styleName:this.styleName,portal:this.portal})}fetchSymbol(t){return this._fetchSymbol("webRef",t)}fetchCIMSymbol(t){return this._fetchSymbol("cimRef",t)}async _fetchSymbol(t,o){const e=await h();Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["throwIfAborted"])(o);const s=e.resolveWebStyleSymbol(this,{portal:this.portal},t,o);return s.catch((t=>{c.error("#fetchSymbol()","Failed to create symbol from style",t)})),s}};function h(){return Promise.all(/*! import() */[__webpack_require__.e(1), __webpack_require__.e(105)]).then(__webpack_require__.bind(null, /*! ./support/styleUtils.js */ "../node_modules/@arcgis/core/symbols/support/styleUtils.js"))}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({json:{write:!1}})],u.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],u.prototype,"styleName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_portal_Portal_js__WEBPACK_IMPORTED_MODULE_8__["default"],json:{write:!1}})],u.prototype,"portal",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{read:_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__["r"],write:_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__["w"]}})],u.prototype,"styleUrl",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_support_Thumbnail_js__WEBPACK_IMPORTED_MODULE_11__["default"],json:{read:!1}})],u.prototype,"thumbnail",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],u.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({styleSymbolReference:"web-style"},{readOnly:!0})],u.prototype,"type",void 0),u=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.WebStyleSymbol")],u);var b=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/callouts/Callout3D.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/callouts/Callout3D.js ***!
  \******************************************************************/
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.visible=!0}clone(){}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["line"],readOnly:!0,json:{read:!1,write:{ignoreOrigin:!0}}})],t.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],t.prototype,"visible",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.callouts.Callout3D")],t);var p=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/callouts/LineCallout3D.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/callouts/LineCallout3D.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return j; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Callout3D_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Callout3D.js */ "../node_modules/@arcgis/core/symbols/callouts/Callout3D.js");
/* harmony import */ var _chunks_LineCallout3DBorder_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../chunks/LineCallout3DBorder.js */ "../node_modules/@arcgis/core/chunks/LineCallout3DBorder.js");
/* harmony import */ var _support_materialUtils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var u;let d=u=class extends _Callout3D_js__WEBPACK_IMPORTED_MODULE_11__["default"]{constructor(o){super(o),this.type="line",this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,1]),this.size=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["px2pt"])(1),this.border=null}get visible(){return this.size>0&&Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.color)&&this.color.a>0}clone(){return new u({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.color),size:this.size,border:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.border)})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_9__["enumeration"])({line:"line"},{readOnly:!0})],d.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_13__["colorAndTransparencyProperty"])],d.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_13__["screenSizeProperty"])],d.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:_chunks_LineCallout3DBorder_js__WEBPACK_IMPORTED_MODULE_12__["a"],json:{write:!0}})],d.prototype,"border",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({readOnly:!0})],d.prototype,"visible",null),d=u=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.callouts.LineCallout3D")],d);var j=d;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/callouts/calloutUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/callouts/calloutUtils.js ***!
  \*********************************************************************/
/*! exports provided: calloutProperty, hasVisibleCallout, hasVisibleVerticalOffset, isCalloutSupport */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calloutProperty", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasVisibleCallout", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasVisibleVerticalOffset", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCalloutSupport", function() { return o; });
/* harmony import */ var _Callout3D_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Callout3D.js */ "../node_modules/@arcgis/core/symbols/callouts/Callout3D.js");
/* harmony import */ var _LineCallout3D_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LineCallout3D.js */ "../node_modules/@arcgis/core/symbols/callouts/LineCallout3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(t){if(!t)return!1;const e=t.verticalOffset;return!!e&&!(e.screenLength<=0||e.maxWorldLength<=0)}function n(t){if(!t)return!1;if(!t.supportsCallout||!t.supportsCallout())return!1;const e=t.callout;return!!e&&(!!e.visible&&!!r(t))}function o(t){return"point-3d"===t.type||"label-3d"===t.type}const l={types:{key:"type",base:_Callout3D_js__WEBPACK_IMPORTED_MODULE_0__["default"],typeMap:{line:_LineCallout3D_js__WEBPACK_IMPORTED_MODULE_1__["default"]}},json:{write:!0}};


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/edges/Edges3D.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/edges/Edges3D.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../support/materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(o){super(o),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,1]),this.extensionLength=0,this.size=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["px2pt"])(1)}clone(){}cloneProperties(){return{color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color),size:this.size,extensionLength:this.extensionLength}}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:["solid","sketch"],readOnly:!0,json:{read:!0,write:{ignoreOrigin:!0}}})],l.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["colorAndTransparencyProperty"])],l.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({..._support_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["screenSizeProperty"],json:{write:{overridePolicy:o=>({enabled:!!o})}}})],l.prototype,"extensionLength",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_support_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["screenSizeProperty"])],l.prototype,"size",void 0),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.edges.Edges3D")],l);var m=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/edges/SketchEdges3D.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/edges/SketchEdges3D.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Edges3D_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Edges3D.js */ "../node_modules/@arcgis/core/symbols/edges/Edges3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let c=t=class extends _Edges3D_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.type="sketch"}clone(){return new t(this.cloneProperties())}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({sketch:"sketch"},{readOnly:!0})],c.prototype,"type",void 0),c=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.edges.SketchEdges3D")],c);var p=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/edges/SolidEdges3D.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/edges/SolidEdges3D.js ***!
  \******************************************************************/
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
/* harmony import */ var _Edges3D_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Edges3D.js */ "../node_modules/@arcgis/core/symbols/edges/Edges3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _Edges3D_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(r){super(r),this.type="solid"}clone(){return new t(this.cloneProperties())}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_5__["enumeration"])({solid:"solid"},{readOnly:!0})],p.prototype,"type",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.SolidEdges3D")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/edges/utils.js":
/*!***********************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/edges/utils.js ***!
  \***********************************************************/
/*! exports provided: symbol3dEdgesProperty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbol3dEdgesProperty", function() { return t; });
/* harmony import */ var _Edges3D_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Edges3D.js */ "../node_modules/@arcgis/core/symbols/edges/Edges3D.js");
/* harmony import */ var _SketchEdges3D_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SketchEdges3D.js */ "../node_modules/@arcgis/core/symbols/edges/SketchEdges3D.js");
/* harmony import */ var _SolidEdges3D_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SolidEdges3D.js */ "../node_modules/@arcgis/core/symbols/edges/SolidEdges3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t={types:{key:"type",base:_Edges3D_js__WEBPACK_IMPORTED_MODULE_0__["default"],typeMap:{solid:_SolidEdges3D_js__WEBPACK_IMPORTED_MODULE_2__["default"],sketch:_SketchEdges3D_js__WEBPACK_IMPORTED_MODULE_1__["default"]}},json:{write:!0}};


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/patterns/Pattern3D.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/patterns/Pattern3D.js ***!
  \******************************************************************/
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
let t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r)}clone(){}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["style"],readOnly:!0,json:{read:!0,write:{ignoreOrigin:!0}}})],t.prototype,"type",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.patterns.Pattern3D")],t);var p=t;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/patterns/StylePattern3D.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/patterns/StylePattern3D.js ***!
  \***********************************************************************/
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
/* harmony import */ var _Pattern3D_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Pattern3D.js */ "../node_modules/@arcgis/core/symbols/patterns/Pattern3D.js");
/* harmony import */ var _styles_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./styles.js */ "../node_modules/@arcgis/core/symbols/patterns/styles.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let c=p=class extends _Pattern3D_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(r){super(r),this.type="style",this.style="solid"}clone(){return new p({style:this.style})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["style"]})],c.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:_styles_js__WEBPACK_IMPORTED_MODULE_7__["default"],json:{read:!0,write:!0}})],c.prototype,"style",void 0),c=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.symbols.patterns.StylePattern3D")],c);var a=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/patterns/styles.js":
/*!***************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/patterns/styles.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a=["backward-diagonal","cross","diagonal-cross","forward-diagonal","horizontal","none","solid","vertical"];


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/patterns/utils.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/patterns/utils.js ***!
  \**************************************************************/
/*! exports provided: read, symbol3dPatternProperty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbol3dPatternProperty", function() { return n; });
/* harmony import */ var _Pattern3D_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Pattern3D.js */ "../node_modules/@arcgis/core/symbols/patterns/Pattern3D.js");
/* harmony import */ var _StylePattern3D_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./StylePattern3D.js */ "../node_modules/@arcgis/core/symbols/patterns/StylePattern3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function r(t,r,n){if(!t)return t;if("style"===t.type){const r=new _StylePattern3D_js__WEBPACK_IMPORTED_MODULE_1__["default"];return r.read(t,n),r}}const n={types:{key:"type",base:_Pattern3D_js__WEBPACK_IMPORTED_MODULE_0__["default"],typeMap:{style:_StylePattern3D_js__WEBPACK_IMPORTED_MODULE_1__["default"]}},json:{read:r,write:!0}};


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/IconSymbol3DLayerResource.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/IconSymbol3DLayerResource.js ***!
  \*********************************************************************************/
/*! exports provided: IconSymbol3DLayerResource, default, defaultPrimitive */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IconSymbol3DLayerResource", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPrimitive", function() { return j; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;const d=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["strict"])()({circle:"circle",square:"square",cross:"cross",x:"x",kite:"kite",triangle:"triangle"});let h=l=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(r){super(r)}readHref(r,e,o){return r?Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_12__["f"])(r,o):e.dataURI}writeHref(r,e,o,c){r&&(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["isDataProtocol"])(r)?e.dataURI=r:(e.href=Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_12__["t"])(r,c),Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["isAbsolute"])(e.href)&&(e.href=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["normalize"])(e.href))))}clone(){return new l({href:this.href,primitive:this.primitive})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0,read:{source:["href","dataURI"]}}})],h.prototype,"href",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("href")],h.prototype,"readHref",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("href",{href:{type:String},dataURI:{type:String}})],h.prototype,"writeHref",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])(d)],h.prototype,"primitive",void 0),h=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])("esri.symbols.support.IconSymbol3DLayerResource")],h);const j="circle";var y=h;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/ObjectSymbol3DLayerResource.js":
/*!***********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/ObjectSymbol3DLayerResource.js ***!
  \***********************************************************************************/
/*! exports provided: ObjectSymbol3DLayerResource, default, defaultPrimitive */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ObjectSymbol3DLayerResource", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPrimitive", function() { return d; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;const n=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["strict"])()({sphere:"sphere",cylinder:"cylinder",cube:"cube",cone:"cone",diamond:"diamond",tetrahedron:"tetrahedron",invertedCone:"inverted-cone"});let m=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{clone(){return new a({href:this.href,primitive:this.primitive})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{read:_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__["r"],write:_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_9__["w"]}})],m.prototype,"href",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(n)],m.prototype,"primitive",void 0),m=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.support.ObjectSymbol3DLayerResource")],m);const d="sphere";var u=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/StyleOrigin.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/StyleOrigin.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let a=p=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(){super(...arguments),this.portal=null}clone(){return new p({name:this.name,styleUrl:this.styleUrl,styleName:this.styleName,portal:this.portal})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"styleUrl",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],a.prototype,"styleName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_portal_Portal_js__WEBPACK_IMPORTED_MODULE_7__["default"]})],a.prototype,"portal",void 0),a=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.StyleOrigin")],a);var l=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition2D.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition2D.js ***!
  \********************************************************************************/
/*! exports provided: Symbol3DAnchorPosition2D, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DAnchorPosition2D", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(){super(...arguments),this.x=0,this.y=0}clone(){return new t({x:this.x,y:this.y})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],p.prototype,"x",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],p.prototype,"y",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.Symbol3DAnchorPosition2D")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition3D.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DAnchorPosition3D.js ***!
  \********************************************************************************/
/*! exports provided: Symbol3DAnchorPosition3D, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DAnchorPosition3D", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e;let p=e=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(){super(...arguments),this.x=0,this.y=0,this.z=0}clone(){return new e({x:this.x,y:this.y,z:this.z})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],p.prototype,"x",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],p.prototype,"y",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number})],p.prototype,"z",void 0),p=e=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.Symbol3DAnchorPosition3D")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DFillMaterial.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DFillMaterial.js ***!
  \****************************************************************************/
/*! exports provided: Symbol3DFillMaterial, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DFillMaterial", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Symbol3DMaterial.js */ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var c;let p=c=class extends _Symbol3DMaterial_js__WEBPACK_IMPORTED_MODULE_8__["default"]{clone(){return new c({color:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_1__["isSome"])(this.color)?this.color.clone():null,colorMixMode:this.colorMixMode})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_6__["enumeration"])({multiply:"multiply",replace:"replace",tint:"tint"})],p.prototype,"colorMixMode",void 0),p=c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.support.Symbol3DFillMaterial")],p);var l=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DHalo.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DHalo.js ***!
  \********************************************************************/
/*! exports provided: Symbol3DHalo, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DHalo", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return l; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _materialUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var m;let a=m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,1]),this.size=0}clone(){return new m({color:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.color),size:this.size})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_9__["colorAndTransparencyProperty"])],a.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_9__["screenSizeProperty"])],a.prototype,"size",void 0),a=m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.symbols.support.Symbol3DHalo")],a);var l=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DMaterial.js ***!
  \************************************************************************/
/*! exports provided: Symbol3DMaterial, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DMaterial", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _materialUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let l=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.color=null}clone(){return new p({color:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(this.color)?this.color.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_8__["colorAndTransparencyProperty"])],l.prototype,"color",void 0),l=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.symbols.support.Symbol3DMaterial")],l);var m=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DOutline.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DOutline.js ***!
  \***********************************************************************/
/*! exports provided: Symbol3DOutline, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DOutline", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return f; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _materialUtils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/* harmony import */ var _symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./symbolLayerUtils3D.js */ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var m;let u=m=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.color=new _Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]([0,0,0,1]),this.size=Object(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_4__["px2pt"])(1),this.pattern="solid",this.patternCap="butt",this.stipplePattern=null,this.stippleOffColor=null}clone(){return new m({color:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(this.color)?this.color.clone():null,size:this.size,pattern:this.pattern,patternCap:this.patternCap,stipplePattern:this.stipplePattern?this.stipplePattern.slice():null,stippleOffColor:this.stippleOffColor?this.stippleOffColor.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["colorAndTransparencyProperty"])],u.prototype,"color",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["screenSizeProperty"])],u.prototype,"size",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:_symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_11__["linePatterns"]})],u.prototype,"pattern",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:["butt","square","round"]})],u.prototype,"patternCap",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_10__["stipplePatternProperty"])],u.prototype,"stipplePattern",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_5__["property"])({type:_Color_js__WEBPACK_IMPORTED_MODULE_1__["default"]})],u.prototype,"stippleOffColor",void 0),u=m=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.symbols.support.Symbol3DOutline")],u);var f=u;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Symbol3DVerticalOffset.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Symbol3DVerticalOffset.js ***!
  \******************************************************************************/
/*! exports provided: Symbol3DVerticalOffset, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Symbol3DVerticalOffset", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _materialUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./materialUtils.js */ "../node_modules/@arcgis/core/symbols/support/materialUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let n=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(){super(...arguments),this.screenLength=0,this.minWorldLength=0}clone(){return new p({screenLength:this.screenLength,minWorldLength:this.minWorldLength,maxWorldLength:this.maxWorldLength})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_materialUtils_js__WEBPACK_IMPORTED_MODULE_7__["screenSizeProperty"])],n.prototype,"screenLength",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0,default:0}})],n.prototype,"minWorldLength",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Number,json:{write:!0}})],n.prototype,"maxWorldLength",void 0),n=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.Symbol3DVerticalOffset")],n);var i=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/Thumbnail.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/Thumbnail.js ***!
  \*****************************************************************/
/*! exports provided: Thumbnail, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Thumbnail", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var t;let p=t=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{clone(){return new t({url:this.url})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String})],p.prototype,"url",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.symbols.support.Thumbnail")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/colors.js":
/*!**************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/colors.js ***!
  \**************************************************************/
/*! exports provided: black, isBlack, transparentWhite, white */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "black", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBlack", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transparentWhite", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "white", function() { return o; });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]("white"),r=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]("black"),e=new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([255,255,255,0]);function t(n){return 0===n.r&&0===n.g&&0===n.b}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/materialUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/materialUtils.js ***!
  \*********************************************************************/
/*! exports provided: colorAndTransparencyProperty, screenSizeProperty, stipplePatternProperty */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "colorAndTransparencyProperty", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "screenSizeProperty", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stipplePatternProperty", function() { return l; });
/* harmony import */ var _Color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Color.js */ "../node_modules/@arcgis/core/Color.js");
/* harmony import */ var _core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/screenUtils.js */ "../node_modules/@arcgis/core/core/screenUtils.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../webdoc/support/opacityUtils.js */ "../node_modules/@arcgis/core/webdoc/support/opacityUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(e,t){const n=null!=t.transparency?Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_3__["transparencyToOpacity"])(t.transparency):1,s=t.color;return s&&Array.isArray(s)?new _Color_js__WEBPACK_IMPORTED_MODULE_0__["default"]([s[0]||0,s[1]||0,s[2]||0,n]):null}function a(r,e){e.color=r.toJSON().slice(0,3);const t=Object(_webdoc_support_opacityUtils_js__WEBPACK_IMPORTED_MODULE_3__["opacityToTransparency"])(r.a);0!==t&&(e.transparency=t)}const c={type:_Color_js__WEBPACK_IMPORTED_MODULE_0__["default"],json:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_2__["Integer"]],default:null,read:{source:["color","transparency"],reader:s},write:{target:{color:{type:[_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_2__["Integer"]]},transparency:{type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_2__["Integer"]}},writer:a}}},p={type:Number,cast:_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"],json:{write:!0}},l={type:[Number],cast:r=>null!=r?r:Array.isArray(r)?r.map(_core_screenUtils_js__WEBPACK_IMPORTED_MODULE_1__["toPt"]):null,json:{read:!1,write:!1}};


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils3D.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/symbolLayerUtils3D.js ***!
  \**************************************************************************/
/*! exports provided: OBJECT_SYMBOL_LAYER_BOUNDING_BOX_TETRAHEDRON, OBJECT_SYMBOL_LAYER_BOUNDING_BOX_UNIT_CUBE, OBJECT_SYMBOL_LAYER_BOUNDING_BOX_UNIT_CYLINDER, linePatterns, objectSymbolLayerPrimitiveBoundingBox, objectSymbolLayerSizeWithResourceSize */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OBJECT_SYMBOL_LAYER_BOUNDING_BOX_TETRAHEDRON", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OBJECT_SYMBOL_LAYER_BOUNDING_BOX_UNIT_CUBE", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OBJECT_SYMBOL_LAYER_BOUNDING_BOX_UNIT_CYLINDER", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linePatterns", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objectSymbolLayerPrimitiveBoundingBox", function() { return d; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objectSymbolLayerSizeWithResourceSize", function() { return e; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/vec3f64.js */ "../node_modules/@arcgis/core/chunks/vec3f64.js");
/* harmony import */ var _geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../geometry/support/aaBoundingBox.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(o,{isPrimitive:e,width:s,depth:n,height:r}){const d=e?10:1;if(null==s&&null==r&&null==n)return[d*o[0],d*o[1],d*o[2]];const a=Object(_chunks_vec3f64_js__WEBPACK_IMPORTED_MODULE_1__["f"])(s,n,r);let c;for(let t=0;t<3;t++){const e=a[t];if(null!=e){c=e/o[t];break}}for(let t=0;t<3;t++)null==a[t]&&(a[t]=o[t]*c);return a}const s=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_2__["fromValues"])(-.5,-.5,-.5,.5,.5,.5),n=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_2__["fromValues"])(-.5,-.5,0,.5,.5,1),r=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_2__["fromValues"])(-.5,-.5,0,.5,.5,.5);function d(t){switch(t){case"sphere":case"cube":case"diamond":return s;case"cylinder":case"cone":case"inverted-cone":return n;case"tetrahedron":return r;default:return}}const a=["dash","dash-dot","dot","long-dash","long-dash-dot","long-dash-dot-dot","none","short-dash","short-dash-dot","short-dash-dot-dot","short-dot","solid"];


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/urlUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/urlUtils.js ***!
  \****************************************************************/
/*! exports provided: read, readImageDataOrUrl, sourcePropertyDefinition, urlPropertyDefinition, writeImageDataAndUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readImageDataOrUrl", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sourcePropertyDefinition", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlPropertyDefinition", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writeImageDataAndUrl", function() { return u; });
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../chunks/persistableUrlUtils.js */ "../node_modules/@arcgis/core/chunks/persistableUrlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(a,r,t){return r.imageData?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["makeData"])({mediaType:r.contentType||"image/png",isBase64:!0,data:r.imageData}):l(r.url,t)}function l(e,t){return p(t)&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["isAbsolute"])(e)&&t.layer.parsedUrl?Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["join"])(t.layer.parsedUrl.path,"images",e):Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_1__["f"])(e,t)}function u(e,a,r,n){if(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["isDataProtocol"])(e)){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_0__["dataComponents"])(e);a.contentType=t.mediaType,a.imageData=t.data,r&&r.imageData===a.imageData&&r.url&&Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_1__["w"])(r.url,a,"url",n)}else Object(_chunks_persistableUrlUtils_js__WEBPACK_IMPORTED_MODULE_1__["w"])(e,a,"url",n)}const m={json:{read:{source:["imageData","url"],reader:s},write:{writer(e,a,r,t){u(e,a,this.source,t)}}}},c={readOnly:!0,json:{read:{source:["imageData","url"],reader(e,a,r){const t={};return a.imageData&&(t.imageData=a.imageData),a.contentType&&(t.contentType=a.contentType),a.url&&(t.url=l(a.url,r)),t}}}};function p(e){return e&&("service"===e.origin||"portal-item"===e.origin)&&e.layer&&("feature"===e.layer.type||"stream"===e.layer.type)}


/***/ })

};;
//# sourceMappingURL=4.render-page.js.map
exports.ids = [107];
exports.modules = {

/***/ "../node_modules/@arcgis/core/renderers/support/heatmapUtils.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/heatmapUtils.js ***!
  \**********************************************************************/
/*! exports provided: calculateHeatmapIntensityInfo, calculateHeatmapIntensityInfoReaders, createHeatmapImageData, createKernel, createValueFunction, createValueFunctionCursor, drawHeatmap, generateGradient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateHeatmapIntensityInfo", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateHeatmapIntensityInfoReaders", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createHeatmapImageData", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createKernel", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createValueFunction", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createValueFunctionCursor", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "drawHeatmap", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "generateGradient", function() { return n; });
/* harmony import */ var _core_global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/global.js */ "../node_modules/@arcgis/core/core/global.js");
/* harmony import */ var _core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/mathUtils.js */ "../node_modules/@arcgis/core/core/mathUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=(()=>{if(!("document"in _core_global_js__WEBPACK_IMPORTED_MODULE_0__["default"]))return()=>null;const e=document.createElement("canvas"),n=e.getContext("2d"),r=512;return e.height=r,e.width=1,t=>{n.clearRect(0,0,1,e.height);const r=n.createLinearGradient(0,0,0,e.height);for(const{ratio:e,color:n}of t.colorStops)r.addColorStop(Math.max(e,.001),`rgba(${n[0]}, ${n[1]}, ${n[2]}, ${n[3]})`);return n.fillStyle=r,n.fillRect(0,0,1,e.height),n.getImageData(0,0,1,e.height).data}})();function r(t,e,n,r){const{blurRadius:o,fieldOffset:a,field:i}=e,u=new Float64Array(n*r),l=f(o),s=Math.round(3*o);let h,d=Number.NEGATIVE_INFINITY;const m=c(i,a);for(const{geometry:f,attributes:c}of t){const t=f.x-s,e=f.y-s,o=Math.max(0,t),a=Math.max(0,e),i=Math.min(r,f.y+s),g=Math.min(n,f.x+s),y=+m(c);for(let r=a;r<i;r++){const a=l[r-e];for(let e=o;e<g;e++){const o=l[e-t];h=u[r*n+e]+=a*o*y,h>d&&(d=h)}}}return{matrix:u.buffer,max:d}}function o(t,e,n,r){const{blurRadius:o,fieldOffset:a,field:i}=e,c=new Float64Array(n*r),l=f(o),s=Math.round(3*o);let h,d=Number.NEGATIVE_INFINITY;const m=u(i,a),g=new Set;for(const f of t){const t=f.getCursor();for(;t.next();){const e=t.getObjectId();if(g.has(e))continue;g.add(e);const o=t.readLegacyPointGeometry(),a=128;if(o.x<-a||o.x>=n+a||o.y<-a||o.y>r+a)continue;const i=+m(t),f=Math.round(o.x)-s,u=Math.round(o.y)-s,y=Math.max(0,f),M=Math.max(0,u),x=Math.min(r,Math.round(o.y)+s),b=Math.min(n,Math.round(o.x)+s);for(let t=M;t<x;t++){const e=l[t-u];for(let r=y;r<b;r++){const o=l[r-f];h=c[t*n+r]+=e*o*i,h>d&&(d=h)}}}}return{matrix:c.buffer,max:d}}function a(t,e,n,r,o,a){t.canvas.width=t.canvas.height=e,t.clearRect(0,0,e,e);const f=t.getImageData(0,0,e,e);n&&r&&f.data.set(new Uint8ClampedArray(i(e,n,r,o,a))),t.putImageData(f,0,0)}function i(t,n,r,o,a){const i=new Uint32Array(t*t),f="buffer"in n?n:new Float64Array(n),c="buffer"in r?new Uint32Array(r.buffer):new Uint32Array(new Uint8Array(r).buffer),u=c.length/(a-o);for(let l=0;l<f.length;l++){const t=f[l],n=Math.floor((t-o)*u);i[l]=c[Object(_core_mathUtils_js__WEBPACK_IMPORTED_MODULE_1__["clamp"])(n,0,c.length-1)]}return i.buffer}function f(t){const e=Math.round(3*t),n=2*t*t,r=new Float64Array(2*e+1);for(let o=0;o<=r.length;o++)r[o]=Math.exp(-((o-e)**2)/n)/Math.sqrt(2*Math.PI)*(t/2);return r}function c(t,e){return"function"==typeof t?t:t?"string"==typeof e?e=>-1*+e[t]:n=>+n[t]+e:()=>1}function u(t,e){return null!=t?"string"==typeof e?e=>-1*+e.readAttribute(t):n=>+n.readAttribute(t)+e:t=>1}


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/processors/BaseProcessor.js":
/*!*****************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/processors/BaseProcessor.js ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_HandleOwner_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/HandleOwner.js */ "../node_modules/@arcgis/core/core/HandleOwner.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s=class extends _core_HandleOwner_js__WEBPACK_IMPORTED_MODULE_1__["HandleOwner"]{initialize(){}destroy(){}get supportsTileUpdates(){return!1}get spatialReference(){const e=this.get("tileStore.tileScheme.spatialReference");return e&&e.toJSON()||null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],s.prototype,"supportsTileUpdates",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({constructOnly:!0})],s.prototype,"remoteClient",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({constructOnly:!0})],s.prototype,"service",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],s.prototype,"spatialReference",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({constructOnly:!0})],s.prototype,"tileInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({constructOnly:!0})],s.prototype,"tileStore",void 0),s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.views.2d.layers.features.processors.BaseProcessor")],s);var p=s;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/processors/HeatmapProcessor.js":
/*!********************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/processors/HeatmapProcessor.js ***!
  \********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return h; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_diffUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../../core/accessorSupport/diffUtils.js */ "../node_modules/@arcgis/core/core/accessorSupport/diffUtils.js");
/* harmony import */ var _renderers_support_heatmapUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../../renderers/support/heatmapUtils.js */ "../node_modules/@arcgis/core/renderers/support/heatmapUtils.js");
/* harmony import */ var _engine_webgl_definitions_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../engine/webgl/definitions.js */ "../node_modules/@arcgis/core/views/2d/engine/webgl/definitions.js");
/* harmony import */ var _BaseProcessor_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./BaseProcessor.js */ "../node_modules/@arcgis/core/views/2d/layers/features/processors/BaseProcessor.js");
/* harmony import */ var _support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../support/tileUtils.js */ "../node_modules/@arcgis/core/views/2d/layers/features/support/tileUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class p{constructor(e,t){this.offset=e,this.extent=t}}function c(e){const t=e.key,s=new Map,r=256,i=_engine_webgl_definitions_js__WEBPACK_IMPORTED_MODULE_9__["TILE_SIZE"],o=e.tileInfoView.tileInfo.isWrappable;return s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,-1,-1,o).id,new p([-i,-i],[i-r,i-r,i,i])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,0,-1,o).id,new p([0,-i],[0,i-r,i,i])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,1,-1,o).id,new p([i,-i],[0,i-r,r,i])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,-1,0,o).id,new p([-i,0],[i-r,0,i,i])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,1,0,o).id,new p([i,0],[0,0,r,i])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,-1,1,o).id,new p([-i,i],[i-r,0,i,r])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,0,1,o).id,new p([0,i],[0,0,i,r])),s.set(Object(_support_tileUtils_js__WEBPACK_IMPORTED_MODULE_11__["getPow2NeighborKey"])(t,1,1,o).id,new p([i,i],[0,0,r,r])),s}let l=class extends _BaseProcessor_js__WEBPACK_IMPORTED_MODULE_10__["default"]{constructor(){super(...arguments),this.type="heatmap",this._tileKeyToFeatureSets=new Map}initialize(){this.handles.add([this.tileStore.on("update",this.onTileUpdate.bind(this))])}async update(e,t){const s=t.schema.processors[0];if("heatmap"!==s.type)return;Object(_core_accessorSupport_diffUtils_js__WEBPACK_IMPORTED_MODULE_7__["diff"])(this._schema,s)&&(e.mesh=!0,this._schema=s)}onTileUpdate(e){for(const t of e.removed)this._tileKeyToFeatureSets.delete(t.key.id)}onTileClear(e){const t={clear:!0};return this._tileKeyToFeatureSets.delete(e.key.id),this.remoteClient.invoke("tileRenderer.onTileData",{tileKey:e.id,data:t})}async onTileMessage(e,r,i){this._tileKeyToFeatureSets.has(e.key.id)||this._tileKeyToFeatureSets.set(e.key.id,new Map);const a=this._tileKeyToFeatureSets.get(e.key.id);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(r.addOrUpdate)&&r.addOrUpdate.hasFeatures&&a.set(r.addOrUpdate.instance,r),r.end){const t=[],r=c(e);this._tileKeyToFeatureSets.forEach(((i,o)=>{if(o===e.key.id)i.forEach((e=>Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["andThen"])(e.addOrUpdate,(e=>t.push(e)))));else if(r.has(o)){const e=r.get(o),[a,n]=e.offset;i.forEach((e=>Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["andThen"])(e.addOrUpdate,(e=>{const s=e.transform(a,n,1,1);t.push(s)}))))}}));const a=Object(_renderers_support_heatmapUtils_js__WEBPACK_IMPORTED_MODULE_8__["calculateHeatmapIntensityInfoReaders"])(t,this._schema.mesh,512,512),n={tileKey:e.key.id,intensityInfo:a},d=[a.matrix];return this.remoteClient.invoke("tileRenderer.onTileData",n,{...i,transferList:d})}}onTileError(e,t,s){return this.remoteClient.invoke("tileRenderer.onTileError",{tileKey:e.id,error:t},s)}};l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.views.2d.layers.features.processors.HeatmapProcessor")],l);var h=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/views/2d/layers/features/support/tileUtils.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/views/2d/layers/features/support/tileUtils.js ***!
  \**********************************************************************************/
/*! exports provided: getPow2NeighborKey, getPow2NeighborTile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPow2NeighborKey", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPow2NeighborTile", function() { return e; });
/* harmony import */ var _Tile_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Tile.js */ "../node_modules/@arcgis/core/views/2d/layers/features/support/Tile.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function e(e,n,r){const t=e.tileInfoView.tileInfo.isWrappable,i=l(e.key,n,r,t);return new _Tile_js__WEBPACK_IMPORTED_MODULE_0__["Tile"](e.tileInfoView,i)}function l(o,e,l,n){const r=o.clone(),t=1<<r.level,i=r.col+e,c=r.row+l;return n&&i<0?(r.col=i+t,r.world-=1):i>=t?(r.col=i-t,r.world+=1):r.col=i,r.row=c,r}


/***/ })

};;
//# sourceMappingURL=107.render-page.js.map
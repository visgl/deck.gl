exports.ids = [139];
exports.modules = {

/***/ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/symbolLayerUtils.js ***!
  \************************************************************************/
/*! exports provided: clearBoundingBoxCache, computeIconLayerResourceSize, computeLayerResourceSize, computeLayerSize, computeObjectLayerResourceSize */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearBoundingBoxCache", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeIconLayerResourceSize", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeLayerResourceSize", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeLayerSize", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "computeObjectLayerResourceSize", function() { return b; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_ItemCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/ItemCache.js */ "../node_modules/@arcgis/core/core/ItemCache.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../geometry/support/aaBoundingBox.js */ "../node_modules/@arcgis/core/geometry/support/aaBoundingBox.js");
/* harmony import */ var _symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./symbolLayerUtils3D.js */ "../node_modules/@arcgis/core/symbols/support/symbolLayerUtils3D.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let c=m();function m(){return new _core_ItemCache_js__WEBPACK_IMPORTED_MODULE_2__["default"](50)}function a(){c=m()}function y(e,o){if("icon"===e.type)return l(e,o);if("object"===e.type)return b(e,o);throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol3d:unsupported-symbol-layer","computeLayerSize only works with symbol layers of type Icon and Object")}async function f(e,o){if("icon"===e.type)return p(e,o);if("object"===e.type)return d(e,o);throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol3d:unsupported-symbol-layer","computeLayerSize only works with symbol layers of type Icon and Object")}async function l(e,o){if(e.resource.href)return h(e.resource.href).then((e=>[e.width,e.height]));if(e.resource.primitive)return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(o)?[o,o]:[256,256];throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol3d:invalid-symbol-layer","symbol layers of type Icon must have either an href or a primitive resource")}function p(e,r){return l(e,r).then((r=>{if(null==e.size)return r;const o=r[0]/r[1];return o>1?[e.size,e.size/o]:[e.size*o,e.size]}))}function h(r){return Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r,{responseType:"image"}).then((e=>e.data))}function b(e,r){return w(e,r).then((e=>Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__["size"])(e)))}async function d(e,r){const o=await b(e,r);return Object(_symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_5__["objectSymbolLayerSizeWithResourceSize"])(o,e)}async function w(e,o){if(!e.isPrimitive){const r=e.resource.href,o=c.get(r);if(void 0!==o)return Promise.resolve(o);const t=await Promise.all(/*! import() */[__webpack_require__.e(29), __webpack_require__.e(31), __webpack_require__.e(57)]).then(__webpack_require__.bind(null, /*! ../../views/3d/layers/graphics/objectResourceUtils.js */ "../node_modules/@arcgis/core/views/3d/layers/graphics/objectResourceUtils.js")),n=await t.fetch(r,{disableTextures:!0});return c.put(r,n.referenceBoundingBox),n.referenceBoundingBox}let n=null;if(e.resource&&e.resource.primitive&&(n=Object(_geometry_support_aaBoundingBox_js__WEBPACK_IMPORTED_MODULE_4__["create"])(Object(_symbolLayerUtils3D_js__WEBPACK_IMPORTED_MODULE_5__["objectSymbolLayerPrimitiveBoundingBox"])(e.resource.primitive)),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(o)))for(let r=0;r<n.length;r++)n[r]*=o;return n?Promise.resolve(n):Promise.reject(new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("symbol:invalid-resource","The symbol does not have a valid resource"))}


/***/ })

};;
//# sourceMappingURL=139.render-page.js.map
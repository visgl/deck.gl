exports.ids = [135];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/workers/request.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/workers/request.js ***!
  \************************************************************/
/*! exports provided: execute */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "execute", function() { return a; });
/* harmony import */ var _Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _global_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../global.js */ "../node_modules/@arcgis/core/core/global.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let s;function a(a,n={}){let o=n.responseType;o?"array-buffer"!==o&&"blob"!==o&&"json"!==o&&"native"!==o&&"native-request-init"!==o&&"text"!==o&&(o="text"):o="json";const i=Object(_maybe_js__WEBPACK_IMPORTED_MODULE_2__["unwrap"])(n.signal);return delete n.signal,_global_js__WEBPACK_IMPORTED_MODULE_1__["default"].invokeStaticMessage("request",{url:a,options:n},{signal:i}).then((async t=>{let r,l,u,c,f;if(t.data)if(t.data instanceof ArrayBuffer){if(!("json"!==o&&"text"!==o&&"blob"!==o||(r=new Blob([t.data]),"json"!==o&&"text"!==o||(s||(s=new FileReaderSync),c=s.readAsText(r),"json"!==o)))){try{l=JSON.parse(c||null)}catch(b){const t={...b,url:a,requestOptions:n};throw new _Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("request:server",b.message,t)}if(l.error){const t={...l.error,url:a,requestOptions:n};throw new _Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("request:server",l.error.message,t)}}}else"native"===o&&(t.data.signal=i,u=await fetch(t.data.url,t.data));switch(o){case"blob":f=r;break;case"json":f=l;break;case"native":f=u;break;case"text":f=c;break;default:f=t.data}return{data:f,requestOptions:n,ssl:t.ssl,url:a}}))}


/***/ })

};;
//# sourceMappingURL=135.render-page.js.map
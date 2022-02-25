exports.ids = [26];
exports.modules = {

/***/ "../node_modules/@arcgis/core/portal/support/resourceUtils.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/portal/support/resourceUtils.js ***!
  \********************************************************************/
/*! exports provided: addOrUpdateResource, contentToBlob, fetchResources, getSiblingOfSameType, getSiblingOfSameTypeI, removeAllResources, removeResource, splitPrefixFileNameAndExtension */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addOrUpdateResource", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "contentToBlob", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchResources", function() { return c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSiblingOfSameType", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSiblingOfSameTypeI", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeAllResources", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeResource", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "splitPrefixFileNameAndExtension", function() { return d; });
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
async function c(e,t={},a){await e.load(a);const o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.itemUrl,"resources"),{start:n=1,num:c=10,sortOrder:u="asc",sortField:i="created"}=t,l={query:{start:n,num:c,sortOrder:u,sortField:i,token:e.apiKey},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(a,"signal")},p=await e.portal._request(o,l);return{total:p.total,nextStart:p.nextStart,resources:p.resources.map((({created:t,size:r,resource:a})=>({created:new Date(t),size:r,resource:e.resourceFromPath(a)})))}}async function u(e,o,n,c){if(!e.hasPath())throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"](`portal-item-resource-${o}:invalid-path`,"Resource does not have a valid path");const u=e.portalItem;await u.load(c);const i=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(u.userItemUrl,"add"===o?"addResources":"updateResources"),[l,d]=p(e.path),m=await h(n),f=new FormData;return l&&"."!==l&&f.append("resourcesPrefix",l),f.append("fileName",d),f.append("file",m,d),f.append("f","json"),Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(c)&&c.access&&f.append("access",c.access),await u.portal._request(i,{method:"post",body:f,signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(c,"signal")}),e}async function i(e,a,o){if(!a.hasPath())throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_1__["default"]("portal-item-resources-remove:invalid-path","Resource does not have a valid path");await e.load(o);const n=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.userItemUrl,"removeResources");await e.portal._request(n,{method:"post",query:{resource:a.path},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(o,"signal")}),a.portalItem=null}async function l(e,t){await e.load(t);const a=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(e.userItemUrl,"removeResources");return e.portal._request(a,{method:"post",query:{deleteAll:!0},signal:Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["get"])(t,"signal")})}function p(e){const t=e.lastIndexOf("/");return-1===t?[".",e]:[e.slice(0,t),e.slice(t+1)]}function d(e){const[t,r]=m(e),[a,o]=p(t);return[a,o,r]}function m(e){const t=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["getPathExtension"])(e);return Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isNone"])(t)?[e,""]:[e.slice(0,e.length-t.length-1),`.${t}`]}async function h(t){if(t instanceof Blob)return t;return(await Object(_request_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t.url,{responseType:"blob"})).data}function f(e,t){if(!e.hasPath())return null;const[r,,a]=d(e.path);return e.portalItem.resourceFromPath(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(r,t+a))}function w(e,t){if(!e.hasPath())return null;const[r,,a]=d(e.path);return e.portalItem.resourceFromPath(Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_3__["join"])(r,t+a))}


/***/ })

};;
//# sourceMappingURL=26.render-page.js.map
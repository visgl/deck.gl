exports.ids = [11];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/asyncUtils.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/core/asyncUtils.js ***!
  \*******************************************************/
/*! exports provided: assertResult, forEach, map, result, resultOrAbort */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assertResult", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forEach", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "result", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resultOrAbort", function() { return p; });
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(r,t,e){return Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["eachAlways"])(r.map(((r,o)=>t.apply(e,[r,o]))))}function u(r,t,e){return Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["eachAlways"])(r.map(((r,o)=>t.apply(e,[r,o])))).then((r=>r.map((r=>r.value))))}function a(o){return Object(_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isNone"])(o)?Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["resolve"])():o.then((r=>({ok:!0,value:r}))).catch((r=>({ok:!1,error:r})))}function p(r){return r.then((r=>({ok:!0,value:r}))).catch((r=>(Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_1__["throwIfAbortError"])(r),{ok:!1,error:r})))}function i(r){if(!0===r.ok)return r.value;throw r.error}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/effects/jsonUtils.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/effects/jsonUtils.js ***!
  \****************************************************************/
/*! exports provided: effectFunctionsFromJSON, effectFunctionsToJSON, fromJSON, read, toJSON, write */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "effectFunctionsFromJSON", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "effectFunctionsToJSON", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "read", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toJSON", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "write", function() { return n; });
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/object.js */ "../node_modules/@arcgis/core/core/object.js");
/* harmony import */ var _parser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parser.js */ "../node_modules/@arcgis/core/layers/effects/parser.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function s(e,r,t){try{return a(e)}catch(s){t.messages&&t.messages.push(s)}return null}function n(e,t,s,n){try{const n=o(e);n&&Object(_core_object_js__WEBPACK_IMPORTED_MODULE_1__["setDeepValue"])(s,n,t)}catch(a){n.messages&&n.messages.push(a)}}function o(e){if(!e)return null;if("string"==typeof e)return f(e);const r=[];for(const{scale:t,value:s}of e)r.push({scale:t,value:f(s)});return r}function a(e){if(!e)return null;if(c(e)){const r=[];for(const t of e)r.push({scale:t.scale,value:u(t.value)});return r}return u(e)}function c(e){const r=e[0];return!!r&&"scale"in r}function f(e){if(!e)return null;const r=Object(_parser_js__WEBPACK_IMPORTED_MODULE_2__["parse"])(e);if(r.error)throw r.error;return r.effects.map((e=>e.toJSON()))}function u(e){if(!e||!e.length)return null;const r=[];for(const s of e){let e=[];switch(s.type){case"grayscale":case"sepia":case"saturate":case"invert":case"brightness":case"contrast":case"opacity":e=[i(s,"amount")];break;case"blur":e=[i(s,"radius","pt")];break;case"hue-rotate":e=[i(s,"angle","deg")];break;case"drop-shadow":e=[i(s,"xoffset","pt"),i(s,"yoffset","pt"),i(s,"blurRadius","pt"),l(s,"color")];break;case"bloom":e=[i(s,"strength"),i(s,"radius","pt"),i(s,"threshold")]}const n=`${s.type}(${e.filter(Boolean).join(" ")})`,o=Object(_parser_js__WEBPACK_IMPORTED_MODULE_2__["parse"])(n);if(o.error)throw o.error;r.push(n)}return r.join(" ")}function i(r,t,s){if(null==r[t])throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("effect:missing-parameter",`Missing parameter '${t}' in ${r.type} effect`,{effect:r});return s?r[t]+s:""+r[t]}function l(r,t){if(null==r[t])throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_0__["default"]("effect:missing-parameter",`Missing parameter '${t}' in ${r.type} effect`,{effect:r});const s=r[t];return`rgba(${s[0]||0} ${s[1]||0} ${s[2]||0} ${s[3]/255||0})`}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/BlendLayer.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/BlendLayer.js ***!
  \****************************************************************/
/*! exports provided: BlendLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlendLayer", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _effects_jsonUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../effects/jsonUtils.js */ "../node_modules/@arcgis/core/layers/effects/jsonUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const i=i=>{let n=class extends i{constructor(){super(...arguments),this.blendMode="normal",this.effect=null}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["average","color-burn","color-dodge","color","darken","destination-atop","destination-in","destination-out","destination-over","difference","exclusion","hard-light","hue","invert","lighten","lighter","luminosity","minus","multiply","normal","overlay","plus","reflect","saturation","screen","soft-light","source-atop","source-in","source-out","vivid-light","xor"],nonNullable:!0,json:{read:!1,write:!1,origins:{"web-map":{default:"normal",read:!0,write:!0}}}})],n.prototype,"blendMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({json:{read:!1,write:!1,origins:{"web-map":{read:{reader:_effects_jsonUtils_js__WEBPACK_IMPORTED_MODULE_6__["read"]},write:{writer:_effects_jsonUtils_js__WEBPACK_IMPORTED_MODULE_6__["write"]}}}}})],n.prototype,"effect",void 0),n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.BlendLayer")],n),n};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/CustomParametersMixin.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/CustomParametersMixin.js ***!
  \***************************************************************************/
/*! exports provided: CustomParametersMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CustomParametersMixin", function() { return o; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const o=o=>{let t=class extends o{constructor(){super(...arguments),this.customParameters=null}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Object,json:{write:{overridePolicy:r=>({enabled:!!(r&&Object.keys(r).length>0)})}}})],t.prototype,"customParameters",void 0),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.CustomParametersMixin")],t),t};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/PortalLayer.js ***!
  \*****************************************************************/
/*! exports provided: PortalLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PortalLayer", function() { return w; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _kernel_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../kernel.js */ "../node_modules/@arcgis/core/kernel.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/asyncUtils.js */ "../node_modules/@arcgis/core/core/asyncUtils.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../portal/Portal.js */ "../node_modules/@arcgis/core/portal/Portal.js");
/* harmony import */ var _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../portal/PortalItem.js */ "../node_modules/@arcgis/core/portal/PortalItem.js");
/* harmony import */ var _portal_PortalUser_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../portal/PortalUser.js */ "../node_modules/@arcgis/core/portal/PortalUser.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const j=_core_Logger_js__WEBPACK_IMPORTED_MODULE_5__["default"].getLogger("esri.layers.mixins.PortalLayer"),w=i=>{let w=class extends i{constructor(){super(...arguments),this.resourceReferences={portalItem:null,paths:[]},this.userHasEditingPrivileges=!0}destroy(){var t;null==(t=this.portalItem)||t.destroy(),this.portalItem=null}set portalItem(t){t!==this._get("portalItem")&&(this.removeOrigin("portal-item"),this._set("portalItem",t))}readPortalItem(t,e,r){if(e.itemId)return new _portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__["default"]({id:e.itemId,portal:r&&r.portal})}writePortalItem(t,e){t&&t.id&&(e.itemId=t.id)}async loadFromPortal(t,e){if(this.portalItem&&this.portalItem.id)try{const r=await __webpack_require__.e(/*! import() */ 104).then(__webpack_require__.bind(null, /*! ../../portal/support/layersLoader.js */ "../node_modules/@arcgis/core/portal/support/layersLoader.js"));return Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["throwIfAborted"])(e),await r.load({instance:this,supportedTypes:t.supportedTypes,validateItem:t.validateItem,supportsData:t.supportsData},e)}catch(r){throw Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["isAbortError"])(r)||j.warn(`Failed to load layer (${this.title}, ${this.id}) portal item (${this.portalItem.id})\n  ${r}`),r}}async finishLoadEditablePortalLayer(t){this._set("userHasEditingPrivileges",await this.fetchUserHasEditingPrivileges(t).catch((t=>(Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_7__["throwIfAbortError"])(t),!0))))}async fetchUserHasEditingPrivileges(t){const r=this.url?null==_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"]?void 0:_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"].findCredential(this.url):null;if(!r)return!0;const s=P.credential===r?P.user:await this.fetchEditingUser(t);return P.credential=r,P.user=s,Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_6__["isNone"])(s)||null==s.privileges||s.privileges.includes("features:user:edit")}async fetchEditingUser(t){var o,i;const a=null==(o=this.portalItem)||null==(i=o.portal)?void 0:i.user;if(a)return a;const n=_kernel_js__WEBPACK_IMPORTED_MODULE_1__["id"].findServerInfo(this.url);if(null==n||!n.owningSystemUrl)return null;const p=`${n.owningSystemUrl}/sharing/rest`,m=_portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__["default"].getDefault();if(m&&m.loaded&&Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["normalize"])(m.restUrl)===Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["normalize"])(p))return m.user;const c=`${p}/community/self`,d=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_6__["isSome"])(t)?t.signal:null,h=await Object(_core_asyncUtils_js__WEBPACK_IMPORTED_MODULE_3__["result"])(Object(_request_js__WEBPACK_IMPORTED_MODULE_2__["default"])(c,{authMode:"no-prompt",query:{f:"json"},signal:d}));return h.ok?_portal_PortalUser_js__WEBPACK_IMPORTED_MODULE_17__["default"].fromJSON(h.value.data):null}read(t,e){e&&(e.layer=this),super.read(t,e)}write(t,e){const r=e&&e.portal,s=this.portalItem&&this.portalItem.id&&(this.portalItem.portal||_portal_Portal_js__WEBPACK_IMPORTED_MODULE_15__["default"].getDefault());return r&&s&&!Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_8__["hasSamePortal"])(s.restUrl,r.restUrl)?(e.messages&&e.messages.push(new _core_Error_js__WEBPACK_IMPORTED_MODULE_4__["default"]("layer:cross-portal",`The layer '${this.title} (${this.id})' cannot be persisted because it refers to an item on a different portal than the one being saved to. To save the scene, set the layer.portalItem to null or save the scene to the same portal as the item associated with the layer`,{layer:this})),null):super.write(t,{...e,layer:this})}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({type:_portal_PortalItem_js__WEBPACK_IMPORTED_MODULE_16__["default"]})],w.prototype,"portalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_12__["reader"])("web-document","portalItem",["itemId"])],w.prototype,"readPortalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_14__["writer"])("web-document","portalItem",{itemId:{type:String}})],w.prototype,"writePortalItem",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])()],w.prototype,"resourceReferences",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_9__["property"])({readOnly:!0})],w.prototype,"userHasEditingPrivileges",void 0),w=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_13__["subclass"])("esri.layers.mixins.PortalLayer")],w),w},P={credential:null,user:null};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/RefreshableLayer.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/RefreshableLayer.js ***!
  \**********************************************************************/
/*! exports provided: RefreshableLayer, isRefreshableLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RefreshableLayer", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isRefreshableLayer", function() { return n; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _refresh_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./refresh.js */ "../node_modules/@arcgis/core/layers/mixins/refresh.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function n(e){return e&&"object"==typeof e&&"refreshTimestamp"in e&&"refresh"in e}const p=n=>{let p=class extends n{constructor(...e){super(...e),this.refreshInterval=0,this.refreshTimestamp=0,this._debounceHasDataChanged=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["debounce"])((()=>this.hasDataChanged())),this.when().then((()=>{Object(_refresh_js__WEBPACK_IMPORTED_MODULE_7__["registerLayer"])(this)}),(()=>{}))}destroy(){Object(_refresh_js__WEBPACK_IMPORTED_MODULE_7__["unregisterLayer"])(this)}get refreshParameters(){return{_ts:this.refreshTimestamp||null}}refresh(e=Date.now()){Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_2__["ignoreAbortErrors"])(this._debounceHasDataChanged()).then((r=>{r&&(this._set("refreshTimestamp",e),this.emit("refresh"))}),(e=>{_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger(this.declaredClass).error(e)}))}async hasDataChanged(){return!0}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Number,cast:e=>e>=.1?e:e<=0?0:.1,json:{write:!0,origins:{"web-document":{write:!0}}}})],p.prototype,"refreshInterval",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({readOnly:!0})],p.prototype,"refreshTimestamp",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"refreshParameters",null),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.mixins.RefreshableLayer")],p),p};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ScaleRangeLayer.js ***!
  \*********************************************************************/
/*! exports provided: ScaleRangeLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScaleRangeLayer", function() { return s; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=s=>{let t=class extends s{constructor(){super(...arguments),this.minScale=0,this.maxScale=0}get scaleRangeId(){return`${this.minScale},${this.maxScale}`}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],t.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,nonNullable:!0,json:{write:!0}})],t.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({readOnly:!0})],t.prototype,"scaleRangeId",null),t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.layers.mixins.ScaleRangeLayer")],t),t};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/refresh.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/refresh.js ***!
  \*************************************************************/
/*! exports provided: registerLayer, test, unregisterLayer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerLayer", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return u; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unregisterLayer", function() { return s; });
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_accessorSupport_trackingUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/trackingUtils.js */ "../node_modules/@arcgis/core/core/accessorSupport/trackingUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t=new _core_Collection_js__WEBPACK_IMPORTED_MODULE_0__["default"],n=new WeakMap;function o(e){f(e)&&t.push(e)}function s(e){f(e)&&t.includes(e)&&t.remove(e)}function f(e){return e&&"object"==typeof e&&"refreshInterval"in e&&"refresh"in e}function i(e,r){return Number.isFinite(e)&&Number.isFinite(r)?r<=0?e:i(r,e%r):0}let c=0,l=0;function a(){const e=Date.now();for(const o of t)if(o.refreshInterval){var r;e-(null!=(r=n.get(o))?r:0)+5>=6e4*o.refreshInterval&&(n.set(o,e),o.refresh(e))}}Object(_core_accessorSupport_trackingUtils_js__WEBPACK_IMPORTED_MODULE_1__["autorun"])((()=>{const e=Date.now();let r=0;for(const o of t)r=i(Math.round(6e4*o.refreshInterval),r),o.refreshInterval?n.get(o)||n.set(o,e):n.delete(o);if(r!==l){if(l=r,clearInterval(c),0===l)return void(c=0);c=setInterval(a,l)}}));const u={get hasRefreshTimer(){return c>0},get tickInterval(){return l},forceRefresh(){a()},hasLayer:e=>f(e)&&t.includes(e),clear(){for(const e of t)n.delete(e);t.removeAll()}};


/***/ }),

/***/ "../node_modules/@arcgis/core/support/popupUtils.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/support/popupUtils.js ***!
  \**********************************************************/
/*! exports provided: createFieldInfos, createFieldsContent, createPopupTemplate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFieldInfos", function() { return b; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFieldsContent", function() { return F; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createPopupTemplate", function() { return a; });
/* harmony import */ var _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PopupTemplate.js */ "../node_modules/@arcgis/core/PopupTemplate.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../popup/content/AttachmentsContent.js */ "../node_modules/@arcgis/core/popup/content/AttachmentsContent.js");
/* harmony import */ var _popup_content_Content_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../popup/content/Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/* harmony import */ var _popup_content_CustomContent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../popup/content/CustomContent.js */ "../node_modules/@arcgis/core/popup/content/CustomContent.js");
/* harmony import */ var _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../popup/content/FieldsContent.js */ "../node_modules/@arcgis/core/popup/content/FieldsContent.js");
/* harmony import */ var _popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../popup/content/MediaContent.js */ "../node_modules/@arcgis/core/popup/content/MediaContent.js");
/* harmony import */ var _popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../popup/content/TextContent.js */ "../node_modules/@arcgis/core/popup/content/TextContent.js");
/* harmony import */ var _popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../popup/FieldInfo.js */ "../node_modules/@arcgis/core/popup/FieldInfo.js");
/* harmony import */ var _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../popup/support/FieldInfoFormat.js */ "../node_modules/@arcgis/core/popup/support/FieldInfoFormat.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const l=["oid","global-id"],s=["oid","global-id","guid"];function a({displayField:t,editFieldsInfo:i,fields:o,objectIdField:n,title:r},l){if(!o)return null;const s=b({editFieldsInfo:i,fields:o,objectIdField:n},l);if(!s.length)return null;const a=j({titleBase:r,fields:o,displayField:t}),d=C();return new _PopupTemplate_js__WEBPACK_IMPORTED_MODULE_0__["default"]({title:a,content:d,fieldInfos:s})}const d=[/^fnode_$/i,/^tnode_$/i,/^lpoly_$/i,/^rpoly_$/i,/^poly_$/i,/^subclass$/i,/^subclass_$/i,/^rings_ok$/i,/^rings_nok$/i,/shape/i,/perimeter/i,/objectid/i,/_i$/i],p=(e,{editFieldsInfo:t,objectIdField:i,visibleFieldNames:o})=>o?o.has(e.name):!f(e.name,t)&&((!i||e.name!==i)&&(!(l.indexOf(e.type)>-1)&&!d.some((t=>t.test(e.name)))));function u(e,t){const i=e;return t&&(e=e.filter((e=>-1===t.indexOf(e.type)))),e===i&&(e=e.slice()),e.sort(c),e}function c(e,t){return"oid"===e.type?-1:"oid"===t.type?1:y(e)?-1:y(t)?1:(e.alias||e.name).toLocaleLowerCase().localeCompare((t.alias||t.name).toLocaleLowerCase())}function f(e,t){if(!e||!t)return!1;const{creationDateField:i,creatorField:o,editDateField:n,editorField:r}=t;return-1!==[i&&i.toLowerCase(),o&&o.toLowerCase(),n&&n.toLowerCase(),r&&r.toLowerCase()].indexOf(e.toLowerCase())}function m(e,t){return e.editable&&-1===s.indexOf(e.type)&&!f(e.name,t)}function F(e,t){return new _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__["default"]({fieldInfos:b(e,t).filter((e=>e.visible))})}function b({editFieldsInfo:e,fields:t,objectIdField:i},o){return u(t,(null==o?void 0:o.ignoreFieldTypes)||g).map((t=>new _popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]({fieldName:t.name,isEditable:m(t,e),label:t.alias,format:w(t),visible:p(t,{editFieldsInfo:e,objectIdField:i,visibleFieldNames:null==o?void 0:o.visibleFieldNames})})))}function w(e){switch(e.type){case"small-integer":case"integer":case"single":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({digitSeparator:!0,places:0});case"double":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({digitSeparator:!0,places:2});case"date":return new _popup_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_9__["default"]({dateFormat:"long-month-day-year"});default:return null}}function C(){return[new _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_5__["default"],new _popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_2__["default"]]}function j(e){const i=Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_1__["getDisplayFieldName"])(e),{titleBase:o}=e;return i?`${o}: {${i.trim()}}`:o}function y(e){if("name"===(e.name&&e.name.toLowerCase()))return!0;return"name"===(e.alias&&e.alias.toLowerCase())||void 0}const g=["geometry","blob","raster","guid","xml"];


/***/ })

};;
//# sourceMappingURL=11.render-page.js.map
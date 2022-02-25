exports.ids = [47];
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

/***/ "../node_modules/@arcgis/core/core/workers/WorkerHandle.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/workers/WorkerHandle.js ***!
  \*****************************************************************/
/*! exports provided: WorkerHandle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WorkerHandle", function() { return n; });
/* harmony import */ var _arrayUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../arrayUtils.js */ "../node_modules/@arcgis/core/core/arrayUtils.js");
/* harmony import */ var _handleUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../handleUtils.js */ "../node_modules/@arcgis/core/core/handleUtils.js");
/* harmony import */ var _Logger_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _maybe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _workers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./workers.js */ "../node_modules/@arcgis/core/core/workers/workers.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const h=_Logger_js__WEBPACK_IMPORTED_MODULE_2__["default"].getLogger("esri.core.workers.WorkerHandle");class n{constructor(e,t,r,s={}){this._mainMethod=t,this._listeners=[],this._promise=Object(_workers_js__WEBPACK_IMPORTED_MODULE_5__["open"])(e,{...s,schedule:r}).then((e=>{if(void 0===this._thread){this._thread=e,this._promise=null,s.hasInitialize&&this.broadcast({},"initialize");for(const e of this._listeners)this._connectListener(e)}else e.close()})),this._promise.catch((t=>h.error(`Failed to initialize ${e} worker: ${t}`)))}on(r,i){const o={removed:!1,eventName:r,callback:i,threadHandle:null};return this._listeners.push(o),this._connectListener(o),Object(_handleUtils_js__WEBPACK_IMPORTED_MODULE_1__["makeHandle"])((()=>{o.removed=!0,Object(_arrayUtils_js__WEBPACK_IMPORTED_MODULE_0__["remove"])(this._listeners,o),this._thread&&Object(_maybe_js__WEBPACK_IMPORTED_MODULE_3__["isSome"])(o.threadHandle)&&o.threadHandle.remove()}))}destroy(){this._thread&&(this._thread.close(),this._thread=null),this._promise=null}invoke(e,t){return this.invokeMethod(this._mainMethod,e,t)}invokeMethod(e,t,r){if(this._thread){const s=this.getTransferList(t,e);return this._thread.invoke(e,t,{transferList:s,signal:r})}return this._promise?this._promise.then((()=>(Object(_promiseUtils_js__WEBPACK_IMPORTED_MODULE_4__["throwIfAborted"])(r),this.invokeMethod(e,t,r)))):Promise.reject(null)}broadcast(e,t){return this._thread?Promise.all(this._thread.broadcast(t,e)).then((()=>{})):this._promise?this._promise.then((()=>this.broadcast(e,t))):Promise.reject()}get promise(){return this._promise}_connectListener(e){this._thread&&this._thread.on(e.eventName,e.callback).then((t=>{e.removed||(e.threadHandle=t)}))}}


/***/ }),

/***/ "../node_modules/@arcgis/core/geometry/HeightModelInfo.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/geometry/HeightModelInfo.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return v; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/arrayUtils.js */ "../node_modules/@arcgis/core/core/arrayUtils.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Warning.js */ "../node_modules/@arcgis/core/core/Warning.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;const p=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["strict"])()({orthometric:"gravity-related-height",gravity_related_height:"gravity-related-height",ellipsoidal:"ellipsoidal"}),u=p.jsonValues.slice();Object(_core_arrayUtils_js__WEBPACK_IMPORTED_MODULE_1__["removeUnordered"])(u,"orthometric");const g=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_2__["strict"])()({meter:"meters",foot:"feet","us-foot":"us-feet","clarke-foot":"clarke-feet","clarke-yard":"clarke-yards","clarke-link":"clarke-links","sears-yard":"sears-yards","sears-foot":"sears-feet","sears-chain":"sears-chains","benoit-1895-b-chain":"benoit-1895-b-chains","indian-yard":"indian-yards","indian-1937-yard":"indian-1937-yards","gold-coast-foot":"gold-coast-feet","sears-1922-truncated-chain":"sears-1922-truncated-chains","50-kilometers":"50-kilometers","150-kilometers":"150-kilometers"});let m=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_3__["JSONSupport"]{constructor(e){super(e),this.heightModel="gravity-related-height",this.heightUnit="meters",this.vertCRS=null}writeHeightModel(e,t,r){return p.write(e,t,r)}readHeightModel(e,t,r){const o=p.read(e);return o||(r&&r.messages&&r.messages.push(f(e,{context:r})),null)}readHeightUnit(e,t,r){const o=g.read(e);return o||(r&&r.messages&&r.messages.push(y(e,{context:r})),null)}readHeightUnitService(e,t,r){const o=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__["unitFromRESTJSON"])(e)||g.read(e);return o||(r&&r.messages&&r.messages.push(y(e,{context:r})),null)}readVertCRS(e,t){return t.vertCRS||t.ellipsoid||t.geoid}clone(){return new d({heightModel:this.heightModel,heightUnit:this.heightUnit,vertCRS:this.vertCRS})}equals(e){return!!e&&(this===e||this.heightModel===e.heightModel&&this.heightUnit===e.heightUnit&&this.vertCRS===e.vertCRS)}static deriveUnitFromSR(e,t){const r=Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_4__["getVerticalUnitStringForSR"])(t);return new d({heightModel:e.heightModel,heightUnit:r,vertCRS:e.vertCRS})}write(e,t){return t={origin:"web-scene",...t},super.write(e,t)}static fromJSON(e){if(!e)return null;const t=new d;return t.read(e,{origin:"web-scene"}),t}};function y(e,t){return new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("height-unit:unsupported",`Height unit of value '${e}' is not supported`,t)}function f(e,t){return new _core_Warning_js__WEBPACK_IMPORTED_MODULE_5__["default"]("height-model:unsupported",`Height model of value '${e}' is not supported`,t)}Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:p.apiValues,constructOnly:!0,json:{origins:{"web-scene":{type:u,default:"ellipsoidal"}}}})],m.prototype,"heightModel",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_12__["writer"])("web-scene","heightModel")],m.prototype,"writeHeightModel",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])(["web-scene","service"],"heightModel")],m.prototype,"readHeightModel",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:g.apiValues,constructOnly:!0,json:{origins:{"web-scene":{type:g.jsonValues,write:g.write}}}})],m.prototype,"heightUnit",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("web-scene","heightUnit")],m.prototype,"readHeightUnit",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("service","heightUnit")],m.prototype,"readHeightUnitService",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:String,constructOnly:!0,json:{origins:{"web-scene":{write:!0}}}})],m.prototype,"vertCRS",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_10__["reader"])("service","vertCRS",["vertCRS","ellipsoid","geoid"])],m.prototype,"readVertCRS",null),m=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_11__["subclass"])("esri.geometry.HeightModelInfo")],m);var v=m;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/ElevationLayer.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/ElevationLayer.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/MultiOriginJSONSupport.js */ "../node_modules/@arcgis/core/core/MultiOriginJSONSupport.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _geometry_HeightModelInfo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../geometry/HeightModelInfo.js */ "../node_modules/@arcgis/core/geometry/HeightModelInfo.js");
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Layer.js */ "../node_modules/@arcgis/core/layers/Layer.js");
/* harmony import */ var _mixins_ArcGISCachedService_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./mixins/ArcGISCachedService.js */ "../node_modules/@arcgis/core/layers/mixins/ArcGISCachedService.js");
/* harmony import */ var _mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./mixins/ArcGISService.js */ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js");
/* harmony import */ var _mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./mixins/OperationalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/OperationalLayer.js");
/* harmony import */ var _mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./mixins/PortalLayer.js */ "../node_modules/@arcgis/core/layers/mixins/PortalLayer.js");
/* harmony import */ var _support_commonProperties_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./support/commonProperties.js */ "../node_modules/@arcgis/core/layers/support/commonProperties.js");
/* harmony import */ var _support_LercDecoder_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./support/LercDecoder.js */ "../node_modules/@arcgis/core/layers/support/LercDecoder.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const T=_core_Logger_js__WEBPACK_IMPORTED_MODULE_3__["default"].getLogger("esri.layers.ElevationLayer");let x=class extends(Object(_mixins_ArcGISCachedService_js__WEBPACK_IMPORTED_MODULE_15__["ArcGISCachedService"])(Object(_mixins_ArcGISService_js__WEBPACK_IMPORTED_MODULE_16__["ArcGISService"])(Object(_mixins_OperationalLayer_js__WEBPACK_IMPORTED_MODULE_17__["OperationalLayer"])(Object(_mixins_PortalLayer_js__WEBPACK_IMPORTED_MODULE_18__["PortalLayer"])(Object(_core_MultiOriginJSONSupport_js__WEBPACK_IMPORTED_MODULE_5__["MultiOriginJSONMixin"])(_Layer_js__WEBPACK_IMPORTED_MODULE_14__["default"])))))){constructor(...e){super(...e),this.copyright=null,this.heightModelInfo=null,this.path=null,this.opacity=1,this.operationalLayerType="ArcGISTiledElevationServiceLayer",this.sourceJSON=null,this.type="elevation",this.url=null,this.version=null,this._lercDecoder=Object(_support_LercDecoder_js__WEBPACK_IMPORTED_MODULE_20__["acquireDecoder"])()}normalizeCtorArgs(e,r){return"string"==typeof e?{url:e,...r}:e}destroy(){this._lercDecoder=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["releaseMaybe"])(this._lercDecoder)}set minScale(e){this.constructed&&T.warn(`${this.declaredClass}.minScale support has been removed (since 4.5)`)}get minScale(){}set maxScale(e){this.constructed&&T.warn(`${this.declaredClass}.maxScale support has been removed (since 4.5)`)}get maxScale(){}readVersion(e,r){let t=r.currentVersion;return t||(t=9.3),t}load(e){const r=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])(e)?e.signal:null;return this.addResolvingPromise(this.loadFromPortal({supportedTypes:["Image Service"],supportsData:!1,validateItem:e=>{for(let r=0;r<e.typeKeywords.length;r++)if("elevation 3d layer"===e.typeKeywords[r].toLowerCase())return!0;throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("portal:invalid-layer-item-type","Invalid layer item type '${type}', expected '${expectedType}' ",{type:"Image Service",expectedType:"Image Service Elevation 3D Layer"})}},e).catch(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__["throwIfAbortError"]).then((()=>this._fetchImageService(r)))),Promise.resolve(this)}fetchTile(e,t,o,i){const a=Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_4__["isSome"])((i=i||{signal:null}).signal)?i.signal:i.signal=Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__["createAbortController"])().signal,l={responseType:"array-buffer",signal:a},p={noDataValue:i.noDataValue,returnFileInfo:!0};return this.load().then((()=>this._fetchTileAvailability(e,t,o,i))).then((()=>Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this.getTileUrl(e,t,o),l))).then((e=>this._lercDecoder.decode(e.data,p,a))).then((e=>({values:e.pixelData,width:e.width,height:e.height,maxZError:e.fileInfo.maxZError,noDataValue:e.noDataValue,minValue:e.minValue,maxValue:e.maxValue})))}getTileUrl(e,r,t){const o=!this.tilemapCache&&this.supportsBlankTile,i=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_7__["objectToQuery"])({...this.parsedUrl.query,blankTile:!o&&null});return`${this.parsedUrl.path}/tile/${e}/${r}/${t}${i?"?"+i:""}`}async queryElevation(e,r){const{ElevationQuery:t}=await __webpack_require__.e(/*! import() */ 52).then(__webpack_require__.bind(null, /*! ./support/ElevationQuery.js */ "../node_modules/@arcgis/core/layers/support/ElevationQuery.js"));Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__["throwIfAborted"])(r);return(new t).query(this,e,r)}async createElevationSampler(e,r){const{ElevationQuery:t}=await __webpack_require__.e(/*! import() */ 52).then(__webpack_require__.bind(null, /*! ./support/ElevationQuery.js */ "../node_modules/@arcgis/core/layers/support/ElevationQuery.js"));Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_6__["throwIfAborted"])(r);return(new t).createSampler(this,e,r)}_fetchTileAvailability(e,r,t,o){return this.tilemapCache?this.tilemapCache.fetchAvailability(e,r,t,o):Promise.resolve("unknown")}async _fetchImageService(e){if(this.sourceJSON)return this.sourceJSON;const t={query:{f:"json",...this.parsedUrl.query},responseType:"json",signal:e},o=await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(this.parsedUrl.path,t);o.ssl&&(this.url=this.url.replace(/^http:/i,"https:")),this.sourceJSON=o.data,this.read(o.data,{origin:"service",url:this.parsedUrl})}get hasOverriddenFetchTile(){return!this.fetchTile.__isDefault__}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({json:{read:{source:"copyrightText"}}})],x.prototype,"copyright",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({readOnly:!0,type:_geometry_HeightModelInfo_js__WEBPACK_IMPORTED_MODULE_13__["default"]})],x.prototype,"heightModelInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:String,json:{origins:{"web-scene":{read:!0,write:!0}},read:!1}})],x.prototype,"path",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:["show","hide"]})],x.prototype,"listMode",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({json:{read:!1,write:!1,origins:{service:{read:!1,write:!1},"portal-item":{read:!1,write:!1},"web-document":{read:!1,write:!1}}}})],x.prototype,"minScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({json:{read:!1,write:!1,origins:{service:{read:!1,write:!1},"portal-item":{read:!1,write:!1},"web-document":{read:!1,write:!1}}}})],x.prototype,"maxScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({json:{read:!1,write:!1,origins:{"web-document":{read:!1,write:!1}}}})],x.prototype,"opacity",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({type:["ArcGISTiledElevationServiceLayer"]})],x.prototype,"operationalLayerType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])()],x.prototype,"sourceJSON",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])({json:{read:!1},value:"elevation",readOnly:!0})],x.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])(_support_commonProperties_js__WEBPACK_IMPORTED_MODULE_19__["url"])],x.prototype,"url",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_8__["property"])()],x.prototype,"version",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_11__["reader"])("version",["currentVersion"])],x.prototype,"readVersion",null),x=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_12__["subclass"])("esri.layers.ElevationLayer")],x),x.prototype.fetchTile.__isDefault__=!0;var _=x;


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ArcGISCachedService.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ArcGISCachedService.js ***!
  \*************************************************************************/
/*! exports provided: ArcGISCachedService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArcGISCachedService", function() { return s; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_serviceTileInfoProperty_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../support/serviceTileInfoProperty.js */ "../node_modules/@arcgis/core/layers/support/serviceTileInfoProperty.js");
/* harmony import */ var _support_TilemapCache_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../support/TilemapCache.js */ "../node_modules/@arcgis/core/layers/support/TilemapCache.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const s=s=>{let l=class extends s{constructor(){super(...arguments),this.copyright=null,this.minScale=0,this.maxScale=0,this.spatialReference=null,this.tileInfo=null,this.tilemapCache=null}readMinScale(e,r){return null!=r.minLOD&&null!=r.maxLOD?e:0}readMaxScale(e,r){return null!=r.minLOD&&null!=r.maxLOD?e:0}get supportsBlankTile(){return this.version>=10.2}readTilemapCache(e,r){return r.capabilities&&r.capabilities.indexOf("Tilemap")>-1?new _support_TilemapCache_js__WEBPACK_IMPORTED_MODULE_9__["TilemapCache"]({layer:this}):null}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{read:{source:"copyrightText"}}})],l.prototype,"copyright",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],l.prototype,"minScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("service","minScale")],l.prototype,"readMinScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],l.prototype,"maxScale",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("service","maxScale")],l.prototype,"readMaxScale",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_10__["default"]})],l.prototype,"spatialReference",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({readOnly:!0})],l.prototype,"supportsBlankTile",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])(_support_serviceTileInfoProperty_js__WEBPACK_IMPORTED_MODULE_8__["serviceTileInfoProperty"])],l.prototype,"tileInfo",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],l.prototype,"tilemapCache",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("service","tilemapCache",["capabilities"])],l.prototype,"readTilemapCache",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],l.prototype,"version",void 0),l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.layers.mixins.ArcGISCachedService")],l),l};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/mixins/ArcGISService.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/mixins/ArcGISService.js ***!
  \*******************************************************************/
/*! exports provided: ArcGISService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArcGISService", function() { return p; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../support/arcgisLayerUrl.js */ "../node_modules/@arcgis/core/layers/support/arcgisLayerUrl.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const p=p=>{let c=class extends p{get title(){if(this._get("title")&&"defaults"!==this.originOf("title"))return this._get("title");if(this.url){const t=Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["parse"])(this.url);if(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_2__["isSome"])(t)&&t.title)return t.title}return this._get("title")||""}set title(t){this._set("title",t)}set url(t){this._set("url",Object(_support_arcgisLayerUrl_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeUrl"])(t,_core_Logger_js__WEBPACK_IMPORTED_MODULE_1__["default"].getLogger(this.declaredClass)))}};return Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],c.prototype,"title",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String})],c.prototype,"url",null),c=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.layers.mixins.ArcGISService")],c),c};


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

/***/ "../node_modules/@arcgis/core/layers/support/LercDecoder.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/LercDecoder.js ***!
  \******************************************************************/
/*! exports provided: acquireDecoder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "acquireDecoder", function() { return n; });
/* harmony import */ var _core_maybe_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/maybe.js */ "../node_modules/@arcgis/core/core/maybe.js");
/* harmony import */ var _core_workers_WorkerHandle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/workers/WorkerHandle.js */ "../node_modules/@arcgis/core/core/workers/WorkerHandle.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
class s extends _core_workers_WorkerHandle_js__WEBPACK_IMPORTED_MODULE_1__["WorkerHandle"]{constructor(e=null){super("LercWorker","_decode",e,{strategy:"dedicated"}),this.schedule=e,this.ref=0}decode(e,r,t){return e&&0!==e.byteLength?this.invoke({buffer:e,options:r},t):Promise.resolve(null)}getTransferList(e){return[e.buffer]}release(){--this.ref<=0&&(o.forEach(((e,r)=>{e===this&&o.delete(r)})),this.destroy())}}const o=new Map;function n(t=null){let n=o.get(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["unwrap"])(t));return n||(Object(_core_maybe_js__WEBPACK_IMPORTED_MODULE_0__["isSome"])(t)?(n=new s((e=>t.schedule(e))),o.set(t,n)):(n=new s,o.set(null,n))),++n.ref,n}


/***/ }),

/***/ "../node_modules/@arcgis/core/renderers/support/lengthUtils.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/renderers/support/lengthUtils.js ***!
  \*********************************************************************/
/*! exports provided: meterIn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "meterIn", function() { return m; });
/* harmony import */ var _core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/unitUtils.js */ "../node_modules/@arcgis/core/core/unitUtils.js");
/* harmony import */ var _geometry_support_Ellipsoid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../geometry/support/Ellipsoid.js */ "../node_modules/@arcgis/core/geometry/support/Ellipsoid.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m={inches:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","inches"),feet:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","feet"),"us-feet":Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","us-feet"),yards:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","yards"),miles:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","miles"),"nautical-miles":Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","nautical-miles"),millimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","millimeters"),centimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","centimeters"),decimeters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","decimeters"),meters:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","meters"),kilometers:Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["convertUnit"])(1,"meters","kilometers"),"decimal-degrees":1/Object(_core_unitUtils_js__WEBPACK_IMPORTED_MODULE_0__["lengthToDegrees"])(1,"meters",_geometry_support_Ellipsoid_js__WEBPACK_IMPORTED_MODULE_1__["earth"].radius)};


/***/ })

};;
//# sourceMappingURL=47.render-page.js.map
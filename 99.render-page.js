exports.ids = [99];
exports.modules = {

/***/ "../node_modules/@arcgis/core/core/number.js":
/*!***************************************************!*\
  !*** ../node_modules/@arcgis/core/core/number.js ***!
  \***************************************************/
/*! exports provided: _parseInfo, format, getCustoms, parse, regexp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_parseInfo", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "format", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCustoms", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return p; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "regexp", function() { return c; });
/* harmony import */ var _string_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./string.js */ "../node_modules/@arcgis/core/core/string.js");
/* harmony import */ var _intl_locale_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../intl/locale.js */ "../node_modules/@arcgis/core/intl/locale.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const t={ar:[".",","],bs:[",","."],ca:[",","."],cs:[","," "],da:[",","."],de:[",","."],"de-ch":[".","’"],el:[",","."],en:[".",","],"en-au":[".",","],es:[",","."],"es-mx":[".",","],et:[","," "],fi:[","," "],fr:[","," "],"fr-ch":[","," "],he:[".",","],hi:[".",",","#,##,##0.###"],hr:[",","."],hu:[","," "],id:[",","."],it:[",","."],"it-ch":[".","’"],ja:[".",","],ko:[".",","],lt:[","," "],lv:[","," "],mk:[",","."],nb:[","," "],nl:[",","."],pl:[","," "],pt:[",","."],"pt-pt":[","," "],ro:[",","."],ru:[","," "],sk:[","," "],sl:[",","."],sr:[",","."],sv:[","," "],th:[".",","],tr:[",","."],uk:[","," "],vi:[",","."],zh:[".",","]};function r(e){e||(e=Object(_intl_locale_js__WEBPACK_IMPORTED_MODULE_1__["getLocale"])());let r=e in t;if(!r){const n=e.split("-");n.length>1&&n[0]in t&&(e=n[0],r=!0),r||(e="en")}const[o,i,s="#,##0.###"]=t[e];return{decimal:o,group:i,pattern:s}}function o(e,n){const t=r((n={...n}).locale);n.customs=t;const o=n.pattern||t.pattern;return isNaN(e)||Math.abs(e)===1/0?null:s(e,o,n)}const i=/[#0,]*[#0](?:\.0*#*)?/;function s(e,n,t){const r=(t=t||{}).customs.group,o=t.customs.decimal,s=n.split(";"),c=s[0];if(-1!==(n=s[e<0?1:0]||"-"+c).indexOf("%"))e*=100;else if(-1!==n.indexOf("‰"))e*=1e3;else{if(-1!==n.indexOf("¤"))throw new Error("currency notation not supported");if(-1!==n.indexOf("E"))throw new Error("exponential notation not supported")}const a=i,p=c.match(a);if(!p)throw new Error("unable to find a number expression in pattern: "+n);return!1===t.fractional&&(t.places=0),n.replace(a,l(e,p[0],{decimal:o,group:r,places:t.places,round:t.round}))}function l(e,n,t){!0===(t=t||{}).places&&(t.places=0),t.places===1/0&&(t.places=6);const r=n.split("."),o="string"==typeof t.places&&t.places.indexOf(",");let i=t.places;o?i=t.places.substring(o+1):i>=0||(i=(r[1]||[]).length),t.round<0||(e=Number(e.toFixed(Number(i))));const s=String(Math.abs(e)).split("."),l=s[1]||"";if(r[1]||t.places){o&&(t.places=t.places.substring(0,o));const e=void 0!==t.places?t.places:r[1]&&r[1].lastIndexOf("0")+1;e>l.length&&(s[1]=l.padEnd(Number(e),"0")),i<l.length&&(s[1]=l.substr(0,Number(i)))}else s[1]&&s.pop();const c=r[0].replace(",","");let a=c.indexOf("0");-1!==a&&(a=c.length-a,a>s[0].length&&(s[0]=s[0].padStart(a,"0")),-1===c.indexOf("#")&&(s[0]=s[0].substr(s[0].length-a)));let p,u,f=r[0].lastIndexOf(",");if(-1!==f){p=r[0].length-f-1;const e=r[0].substr(0,f);f=e.lastIndexOf(","),-1!==f&&(u=e.length-f-1)}const d=[];for(let g=s[0];g;){const e=g.length-p;d.push(e>0?g.substr(e):g),g=e>0?g.slice(0,e):"",u&&(p=u,u=void 0)}return s[0]=d.reverse().join(t.group||","),s.join(t.decimal||".")}function c(e){return a(e).regexp}function a(n){const t=r((n=n||{}).locale),o=n.pattern||t.pattern,s=t.group,l=t.decimal;let c=1;if(-1!==o.indexOf("%"))c/=100;else if(-1!==o.indexOf("‰"))c/=1e3;else if(-1!==o.indexOf("¤"))throw new Error("currency notation not supported");const a=o.split(";");1===a.length&&a.push("-"+a[0]);const p=d(a,(function(t){return(t="(?:"+Object(_string_js__WEBPACK_IMPORTED_MODULE_0__["escapeRegExpString"])(t,".")+")").replace(i,(function(e){const t={signed:!1,separator:n.strict?s:[s,""],fractional:n.fractional,decimal:l,exponent:!1},r=e.split(".");let o=n.places;1===r.length&&1!==c&&(r[1]="###"),1===r.length||0===o?t.fractional=!1:(void 0===o&&(o=n.pattern?r[1].lastIndexOf("0")+1:1/0),o&&null==n.fractional&&(t.fractional=!0),!n.places&&o<r[1].length&&(o+=","+r[1].length),t.places=o);const i=r[0].split(",");return i.length>1&&(t.groupSize=i.pop().length,i.length>1&&(t.groupSize2=i.pop().length)),"("+u(t)+")"}))}),!0);return{regexp:p.replace(/[\xa0 ]/g,"[\\s\\xa0]"),group:s,decimal:l,factor:c}}function p(e,n){const t=a(n),r=new RegExp("^"+t.regexp+"$").exec(e);if(!r)return NaN;let o=r[1];if(!r[1]){if(!r[2])return NaN;o=r[2],t.factor*=-1}return o=o.replace(new RegExp("["+t.group+"\\s\\xa0]","g"),"").replace(t.decimal,"."),Number(o)*t.factor}function u(e){"places"in(e=e||{})||(e.places=1/0),"string"!=typeof e.decimal&&(e.decimal="."),"fractional"in e&&!/^0/.test(String(e.places))||(e.fractional=[!0,!1]),"exponent"in e||(e.exponent=[!0,!1]),"eSigned"in e||(e.eSigned=[!0,!1]);const n=f(e),t=d(e.fractional,(function(n){let t="";return n&&0!==e.places&&(t="\\"+e.decimal,e.places===1/0?t="(?:"+t+"\\d+)?":t+="\\d{"+e.places+"}"),t}),!0);let r=n+t;return t&&(r="(?:(?:"+r+")|(?:"+t+"))"),r+d(e.exponent,(function(n){return n?"([eE]"+f({signed:e.eSigned})+")":""}))}function f(n){"signed"in(n=n||{})||(n.signed=[!0,!1]),"separator"in n?"groupSize"in n||(n.groupSize=3):n.separator="";return d(n.signed,(function(e){return e?"[-+]":""}),!0)+d(n.separator,(function(t){if(!t)return"(?:\\d+)";" "===(t=Object(_string_js__WEBPACK_IMPORTED_MODULE_0__["escapeRegExpString"])(t))?t="\\s":" "===t&&(t="\\s\\xa0");const r=n.groupSize,o=n.groupSize2;if(o){const e="(?:0|[1-9]\\d{0,"+(o-1)+"}(?:["+t+"]\\d{"+o+"})*["+t+"]\\d{"+r+"})";return r-o>0?"(?:"+e+"|(?:0|[1-9]\\d{0,"+(r-1)+"}))":e}return"(?:0|[1-9]\\d{0,"+(r-1)+"}(?:["+t+"]\\d{"+r+"})*)"}),!0)}const d=function(e,n,t){if(!(e instanceof Array))return n(e);const r=[];for(let o=0;o<e.length;o++)r.push(n(e[o]));return g(r.join("|"),t)},g=function(e,n){return"("+(n?"?:":"")+e+")"};


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/csv/csv.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/csv/csv.js ***!
  \***********************************************************************/
/*! exports provided: inferDelimiter, parseRows, readRowParts, readRows */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "inferDelimiter", function() { return s; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseRows", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readRowParts", function() { return f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readRows", function() { return c; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const n=/^\s*"([\S\s]*)"\s*$/,t=/""/g,e="\n",o=[","," ",";","|","\t"];function r(n,t){const e={},o=n.length;for(let r=0;r<o;r++)e[n[r]]=t[r];return e}function*i(n,t,e){let o=0;for(;o<=n.length;){const r=n.indexOf(t,o),i=n.substring(o,r>-1?r:void 0);o+=i.length+t.length,e&&!i.trim()||(yield i)}}function c(n){const t=n.includes("\r\n")?"\r\n":e;return i(n,t,!0)}function f(n,t){return i(n,t,!1)}function s(n){const t=n.trim();let e=0,r="";for(const i of o){const n=t.split(i).length;n>e&&(e=n,r=i)}return""===r?null:r}function*l(o,i,c){let s="",l="",d=0,g=[];n:for(;;){const{value:h,done:x}=o.next();if(x)return;const p=f(h,c);t:for(;;){const{value:e,done:o}=p.next();if(o)break t;if(s+=l+e,l="",d+=u(e),d%2==0){if(d>0){const e=n.exec(s);if(!e){g=[],s="",d=0;continue n}g.push(e[1].replace(t,'"'))}else g.push(s);s="",d=0}else l=c}0===d?(yield r(i,g),g=[]):l=e}}function u(n){let t=0,e=0;for(e=n.indexOf('"',e);e>=0;)t++,e=n.indexOf('"',e+1);return t}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/CSVSourceWorker.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/CSVSourceWorker.js ***!
  \***************************************************************************************/
/*! exports provided: csvLatitudeFieldNames, csvLongitudeFieldNames, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "csvLatitudeFieldNames", function() { return j; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "csvLongitudeFieldNames", function() { return w; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return O; });
/* harmony import */ var _geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../geometry.js */ "../node_modules/@arcgis/core/geometry.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../request.js */ "../node_modules/@arcgis/core/request.js");
/* harmony import */ var _core_Error_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/Error.js */ "../node_modules/@arcgis/core/core/Error.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_number_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../core/number.js */ "../node_modules/@arcgis/core/core/number.js");
/* harmony import */ var _core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../core/urlUtils.js */ "../node_modules/@arcgis/core/core/urlUtils.js");
/* harmony import */ var _geometry_projection_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../geometry/projection.js */ "../node_modules/@arcgis/core/geometry/projection.js");
/* harmony import */ var _geometry_geometryAdapters_json_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../../geometry/geometryAdapters/json.js */ "../node_modules/@arcgis/core/geometry/geometryAdapters/json.js");
/* harmony import */ var _geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../../geometry/support/spatialReferenceUtils.js */ "../node_modules/@arcgis/core/geometry/support/spatialReferenceUtils.js");
/* harmony import */ var _geometry_support_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../../geometry/support/webMercatorUtils.js */ "../node_modules/@arcgis/core/geometry/support/webMercatorUtils.js");
/* harmony import */ var _OptimizedFeature_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../OptimizedFeature.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedFeature.js");
/* harmony import */ var _OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../OptimizedGeometry.js */ "../node_modules/@arcgis/core/layers/graphics/OptimizedGeometry.js");
/* harmony import */ var _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../data/FeatureStore.js */ "../node_modules/@arcgis/core/layers/graphics/data/FeatureStore.js");
/* harmony import */ var _data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../data/projectionSupport.js */ "../node_modules/@arcgis/core/layers/graphics/data/projectionSupport.js");
/* harmony import */ var _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../data/QueryEngine.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngine.js");
/* harmony import */ var _csv_csv_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../csv/csv.js */ "../node_modules/@arcgis/core/layers/graphics/sources/csv/csv.js");
/* harmony import */ var _clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./clientSideDefaults.js */ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js");
/* harmony import */ var _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../support/FieldsIndex.js */ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js");
/* harmony import */ var _geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../../geometry/SpatialReference.js */ "../node_modules/@arcgis/core/geometry/SpatialReference.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const x=Object(_clientSideDefaults_js__WEBPACK_IMPORTED_MODULE_16__["createDrawingInfo"])("esriGeometryPoint"),T=["esriFieldTypeSmallInteger","esriFieldTypeInteger","esriFieldTypeSingle","esriFieldTypeDouble","esriFieldTypeLong"],j=["lat","latitude","latitude83","latdecdeg","lat_dd","y","ycenter","point-y"],w=["lon","lng","long","longitude","longitude83","longdecdeg","long_dd","x","xcenter","point-x"],E=/^((jan(uary)?)|(feb(ruary)?)|(mar(ch)?)|(apr(il)?)|(may)|(jun(e)?)|(jul(y)?)|(aug(ust)?)|(sep(tember)?)|(oct(ober)?)|(nov(ember)?)|(dec(ember)?)|(am)|(pm)|(gmt)|(utc))$/i,D=["csv"],q=[0,0];class S{constructor(e,t){this.x=e,this.y=t}}const v=function(){const e=Object(_core_number_js__WEBPACK_IMPORTED_MODULE_4__["_parseInfo"])(),t=new RegExp("^"+e.regexp+"$"),i=new RegExp("["+e.group+"\\s\\xa0]","g"),r=e.factor;return function(n){const o=t.exec(n);if(e.factor=r,!o)return NaN;let l=o[1];if(!o[1]){if(!o[2])return NaN;l=o[2],e.factor*=-1}return l=l.replace(i,"").replace(e.decimal,"."),+l*e.factor}}(),C="isInteger"in Number?Number.isInteger:e=>"number"==typeof e&&isFinite(e)&&Math.floor(e)===e;class O{constructor(){this._fieldsIndex=null,this._queryEngine=null}destroy(){this._queryEngine&&this._queryEngine&&this._queryEngine.destroy(),this._queryEngine=null,this._fieldsIndex=null}async load(e,t={}){const[i]=await Promise.all([this._fetch(e.url,t),this._checkProjection(t&&e.parsing&&e.parsing.spatialReference)]),n=this._parse(i,e);if(this._queryEngine=this._createQueryEngine(i,n),n.layerDefinition.extent=this._queryEngine.fullExtent,n.layerDefinition.timeInfo){const{start:e,end:t}=this._queryEngine.timeExtent;n.layerDefinition.timeInfo.timeExtent=[e,t]}return n}async applyEdits(){throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv-source:editing-not-supported","applyEdits() is not supported on CSVLayer")}queryFeatures(e={},t={}){return this._queryEngine.executeQuery(e,t.signal)}queryFeatureCount(e={},t={}){return this._queryEngine.executeQueryForCount(e,t.signal)}queryObjectIds(e={},t={}){return this._queryEngine.executeQueryForIds(e,t.signal)}queryExtent(e={},t={}){return this._queryEngine.executeQueryForExtent(e,t.signal)}querySnapping(e,t={}){return this._queryEngine.executeQueryForSnapping(e,t.signal)}async _fetch(i,n){if(!i)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv-source:invalid-source","url not defined");const o=Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__["urlToObject"])(i);return(await Object(_request_js__WEBPACK_IMPORTED_MODULE_1__["default"])(o.path,{query:o.query,responseType:"text",signal:n.signal})).data}_parse(e,i){const n=i.parsing||{},r={columnDelimiter:n.columnDelimiter,layerDefinition:null,locationInfo:{latitudeFieldName:n.latitudeField,longitudeFieldName:n.longitudeField}},l=Object(_csv_csv_js__WEBPACK_IMPORTED_MODULE_15__["readRows"])(e);let{value:s}=l.next();if(!s)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv","CSV is empty",{csv:e});if(s=s.trim(),!n.columnDelimiter){const e=Object(_csv_csv_js__WEBPACK_IMPORTED_MODULE_15__["inferDelimiter"])(s);if(!e)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv-source:invalid-delimiter","Unable to detect the delimiter from CSV");r.columnDelimiter=e}const a=s.split(r.columnDelimiter),d=r.layerDefinition={name:Object(_core_urlUtils_js__WEBPACK_IMPORTED_MODULE_5__["getFilename"])(i.url,D)||"csv",drawingInfo:x,geometryType:"esriGeometryPoint",objectIdField:null,fields:[],timeInfo:n.timeInfo,extent:{xmin:Number.POSITIVE_INFINITY,ymin:Number.POSITIVE_INFINITY,xmax:Number.NEGATIVE_INFINITY,ymax:Number.NEGATIVE_INFINITY,spatialReference:n.spatialReference||{wkid:102100}}};if(!n.latitudeField||!n.longitudeField){const e=this._inferLocationInfo(a);if(!n.longitudeField&&!e.longitudeFieldName||!n.latitudeField&&!e.latitudeFieldName)throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv","Unable to identify latitudeField and/or longitudeField from CSV");r.locationInfo={longitudeFieldName:n.longitudeField||e.longitudeFieldName,latitudeFieldName:n.latitudeField||e.latitudeFieldName}}const u=this._inferFields(l,r.columnDelimiter,a,r.locationInfo);if(n.fields&&n.fields.length){const e=new Map;for(const t of n.fields)e.set(t.name.toLowerCase(),t);for(const t of u){const i=e.get(t.name.toLowerCase());if(i){const e=t.name;Object.assign(t,i),t.name=e}}}d.fields=u;if(!d.fields.some((e=>"esriFieldTypeOID"===e.type&&(d.objectIdField=e.name,!0)))){const e={name:"__OBJECTID",alias:"__OBJECTID",type:"esriFieldTypeOID",editable:!1,nullable:!1};d.objectIdField=e.name,d.fields.unshift(e)}if(this._fieldsIndex=new _support_FieldsIndex_js__WEBPACK_IMPORTED_MODULE_17__["default"](d.fields),d.timeInfo){const e=d.timeInfo;if(e.startTimeField){const t=this._fieldsIndex.get(e.startTimeField);t?(e.startTimeField=t.name,t.type="esriFieldTypeDate"):e.startTimeField=null}if(e.endTimeField){const t=this._fieldsIndex.get(e.endTimeField);t?(e.endTimeField=t.name,t.type="esriFieldTypeDate"):e.endTimeField=null}if(e.trackIdField){const t=this._fieldsIndex.get(e.trackIdField);e.trackIdField=t?t.name:null}e.startTimeField||e.endTimeField||(d.timeInfo=null)}return r}_inferLocationInfo(e){let t=null,i=null;const n=t=>e.find((e=>e.toLowerCase()===t));return w.some((e=>(t=n(e),!!t))),j.some((e=>(i=n(e),!!i))),{longitudeFieldName:t,latitudeFieldName:i}}_inferFields(e,t,i,n){const r=[],o=Object(_csv_csv_js__WEBPACK_IMPORTED_MODULE_15__["parseRows"])(e,i,t),l=[];e:for(;l.length<10;){const{value:e,done:t}=o.next();if(t)break e;l.push(e)}for(const s of i)if(s===n.longitudeFieldName||s===n.latitudeFieldName)r.push({name:s,type:"esriFieldTypeDouble",alias:s});else{const e=l.map((e=>e[s])),t=this._inferFieldType(e),i={name:s,type:null,alias:s};switch(t){case"integer":i.type="esriFieldTypeInteger";break;case"double":i.type="esriFieldTypeDouble";break;case"date":i.type="esriFieldTypeDate",i.length=36;break;default:i.type="esriFieldTypeString",i.length=255}r.push(i)}return r}_inferFieldType(e){if(!e.length)return"string";const t=/[^+-.,0-9]/;return e.map((e=>{let i=!1;if(""!==e){if(t.test(e))i=!0;else{let t=v(e);if(!isNaN(t))return/[.,]/.test(e)||!C(t)||t>214783647||t<-214783648?"double":"integer";if(-1===e.indexOf("E"))i=!0;else{if(t=Number(e),!isNaN(t))return"double";if(-1===e.indexOf(","))i=!0;else{if(e=e.replace(",","."),t=Number(e),!isNaN(t))return"double";i=!0}}}if(i){if(!/^[-]?\d*[.,]?\d*$/.test(e)){const t=new Date(e);return this._isValidDate(t,e)?"date":"string"}return"string"}return"string"}})).reduce(((e,t)=>void 0===e||e===t?t:"string"===e||"string"===t?"string":"double"===e||"double"===t?"double":void 0))}_isValidDate(e,t){if(!e||"[object Date]"!==Object.prototype.toString.call(e)||isNaN(e.getTime()))return!1;let n=!0;if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_3__["default"])("chrome")&&/\d+\W*$/.test(t)){const e=t.match(/[a-zA-Z]{2,}/);if(e){let t=!1,i=0;for(;!t&&i<=e.length;)t=!E.test(e[i]),i++;n=!t}}return n}_createQueryEngine(e,t){const{latitudeFieldName:i,longitudeFieldName:n}=t.locationInfo,{objectIdField:r,fields:o,extent:u,timeInfo:y}=t.layerDefinition;let h=[];const N=[],_=new Set,x=new Set,j=[];for(const{name:l,type:s}of o)"esriFieldTypeDate"===s?_.add(l):T.indexOf(s)>-1&&x.add(l),l!==r&&j.push(l);let w=0;const E=Object(_csv_csv_js__WEBPACK_IMPORTED_MODULE_15__["readRows"])(e);E.next();const D=Object(_csv_csv_js__WEBPACK_IMPORTED_MODULE_15__["parseRows"])(E,j,t.columnDelimiter);e:for(;;){const{value:e,done:t}=D.next();if(t)break e;const o=this._parseCoordinateValue(e[i]),l=this._parseCoordinateValue(e[n]);if(null!=l&&null!=o&&!isNaN(o)&&!isNaN(l)){e[i]=o,e[n]=l;for(const t in e)if(t!==i&&t!==n)if(_.has(t)){const i=new Date(e[t]);e[t]=this._isValidDate(i,e[t])?i.getTime():null}else if(x.has(t)){const i=v(e[t]);isNaN(i)?e[t]=null:e[t]=i}e[r]=w,w++,h.push(new S(l,o)),N.push(e)}}if(!Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["equals"])({wkid:4326},u.spatialReference))if(Object(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["isWebMercator"])(u.spatialReference))for(const l of h)[l.x,l.y]=Object(_geometry_support_webMercatorUtils_js__WEBPACK_IMPORTED_MODULE_9__["lngLatToXY"])(l.x,l.y,q);else h=Object(_geometry_projection_js__WEBPACK_IMPORTED_MODULE_6__["projectMany"])(_geometry_geometryAdapters_json_js__WEBPACK_IMPORTED_MODULE_7__["jsonAdapter"],h,_geometry_SpatialReference_js__WEBPACK_IMPORTED_MODULE_18__["default"].WGS84,u.spatialReference,null);const C=new _data_FeatureStore_js__WEBPACK_IMPORTED_MODULE_12__["default"]({geometryType:"esriGeometryPoint",hasM:!1,hasZ:!1}),O=new _data_QueryEngine_js__WEBPACK_IMPORTED_MODULE_14__["default"]({fields:t.layerDefinition.fields,geometryType:"esriGeometryPoint",hasM:!1,hasZ:!1,timeInfo:y,objectIdField:r,spatialReference:u.spatialReference||{wkid:4326},cacheSpatialQueries:!0,featureStore:C}),V=[];for(let l=0;l<h.length;l++){const{x:e,y:t}=h[l],i=N[l];i[r]=l+1,V.push(new _OptimizedFeature_js__WEBPACK_IMPORTED_MODULE_10__["default"](new _OptimizedGeometry_js__WEBPACK_IMPORTED_MODULE_11__["default"]([],[e,t]),i,null,i[r]))}return C.addMany(V),O}_parseCoordinateValue(e){if(null==e||""===e)return null;let t=v(e);return(isNaN(t)||Math.abs(t)>181)&&(t=parseFloat(e)),t}async _checkProjection(e){try{await Object(_data_projectionSupport_js__WEBPACK_IMPORTED_MODULE_13__["checkProjectionSupport"])(_geometry_support_spatialReferenceUtils_js__WEBPACK_IMPORTED_MODULE_8__["WGS84"],e)}catch{throw new _core_Error_js__WEBPACK_IMPORTED_MODULE_2__["default"]("csv-layer","Projection not supported")}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js":
/*!******************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/graphics/sources/support/clientSideDefaults.js ***!
  \******************************************************************************************/
/*! exports provided: createCapabilities, createDefaultAttributesFunction, createDefaultTemplate, createDrawingInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createCapabilities", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDefaultAttributesFunction", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDefaultTemplate", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDrawingInfo", function() { return u; });
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _data_QueryEngineCapabilities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../data/QueryEngineCapabilities.js */ "../node_modules/@arcgis/core/layers/graphics/data/QueryEngineCapabilities.js");
/* harmony import */ var _symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../symbols/support/defaultsJSON.js */ "../node_modules/@arcgis/core/symbols/support/defaultsJSON.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function u(t){return{renderer:{type:"simple",symbol:"esriGeometryPoint"===t||"esriGeometryMultipoint"===t?_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPointSymbolJSON"]:"esriGeometryPolyline"===t?_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPolylineSymbolJSON"]:_symbols_support_defaultsJSON_js__WEBPACK_IMPORTED_MODULE_3__["defaultPolygonSymbolJSON"]}}}function n(s,e){if(Object(_core_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])("csp-restrictions"))return()=>({[e]:null,...s});try{let t=`this.${e} = null;`;for(const e in s){t+=`this${e.indexOf(".")?`["${e}"]`:`.${e}`} = ${JSON.stringify(s[e])};`}const r=new Function(t);return()=>new r}catch(r){return()=>({[e]:null,...s})}}function i(t={}){return[{name:"New Feature",description:"",prototype:{attributes:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(t)}}]}function a(t,s){return{attachment:null,data:{isVersioned:!1,supportsAttachment:!1,supportsM:!1,supportsZ:t},metadata:{supportsAdvancedFieldProperties:!1},operations:{supportsCalculate:!1,supportsTruncate:!1,supportsValidateSql:!1,supportsAdd:s,supportsDelete:s,supportsEditing:s,supportsChangeTracking:!1,supportsQuery:!0,supportsQueryAttachments:!1,supportsResizeAttachments:!1,supportsSync:!1,supportsUpdate:s,supportsExceedsLimitStatistics:!0},query:_data_QueryEngineCapabilities_js__WEBPACK_IMPORTED_MODULE_2__["queryCapabilities"],queryRelated:{supportsCount:!0,supportsOrderBy:!0,supportsPagination:!0},editing:{supportsGeometryUpdate:s,supportsGlobalId:!1,supportsReturnServiceEditsInSourceSpatialReference:!1,supportsRollbackOnFailure:!1,supportsUpdateWithoutM:!1,supportsUploadWithItemId:!1,supportsDeleteByAnonymous:!1,supportsDeleteByOthers:!1,supportsUpdateByAnonymous:!1,supportsUpdateByOthers:!1}}}


/***/ }),

/***/ "../node_modules/@arcgis/core/layers/support/FieldsIndex.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/layers/support/FieldsIndex.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return e; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function t(t){return"date"===t.type||"esriFieldTypeDate"===t.type}class e{constructor(e){if(this.fields=e,this._fieldsMap=new Map,this._dateFieldsSet=new Set,this.dateFields=[],!e)return;const i=[];for(const a of e){const e=a&&a.name;if(e){const d=s(e);this._fieldsMap.set(e,a),this._fieldsMap.set(d,a),i.push(d),t(a)&&(this.dateFields.push(a),this._dateFieldsSet.add(a))}}i.sort(),this.uid=i.join(",")}destroy(){this._fieldsMap.clear()}has(t){return null!=this.get(t)}get(t){return null!=t?this._fieldsMap.get(t)||this._fieldsMap.get(s(t)):void 0}isDateField(t){return this._dateFieldsSet.has(this.get(t))}normalizeFieldName(t){const e=this.get(t);if(e)return e.name}}function s(t){return t.toLowerCase().trim()}


/***/ }),

/***/ "../node_modules/@arcgis/core/symbols/support/defaultsJSON.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/symbols/support/defaultsJSON.js ***!
  \********************************************************************/
/*! exports provided: defaultColor, defaultOutlineColor, defaultPointSymbolJSON, defaultPolygonSymbolJSON, defaultPolylineSymbolJSON, defaultTextSymbolJSON, errorPointSymbolJSON, errorPolygonSymbolJSON, errorPolylineSymbolJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultColor", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultOutlineColor", function() { return i; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPointSymbolJSON", function() { return l; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolygonSymbolJSON", function() { return S; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPolylineSymbolJSON", function() { return o; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultTextSymbolJSON", function() { return t; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPointSymbolJSON", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolygonSymbolJSON", function() { return y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorPolylineSymbolJSON", function() { return s; });
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e=[252,146,31,255],i=[153,153,153,255],l={type:"esriSMS",style:"esriSMSCircle",size:6,color:e,outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[153,153,153,255]}},o={type:"esriSLS",style:"esriSLSSolid",width:.75,color:e},S={type:"esriSFS",style:"esriSFSSolid",color:[252,146,31,196],outline:{type:"esriSLS",style:"esriSLSSolid",width:.75,color:[255,255,255,191]}},t={type:"esriTS",color:[255,255,255,255],font:{family:"arial-unicode-ms",size:10,weight:"bold"},horizontalAlignment:"center",kerning:!0,haloColor:[0,0,0,255],haloSize:1,rotated:!1,text:"",xoffset:0,yoffset:0,angle:0},r={type:"esriSMS",style:"esriSMSCircle",color:[0,0,0,255],outline:null,size:10.5},s={type:"esriSLS",style:"esriSLSSolid",color:[0,0,0,255],width:1.5},y={type:"esriSFS",style:"esriSFSSolid",color:[0,0,0,255],outline:null};


/***/ })

};;
//# sourceMappingURL=99.render-page.js.map
exports.ids = [5];
exports.modules = {

/***/ "../node_modules/@arcgis/core/PopupTemplate.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/PopupTemplate.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return M; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Collection_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/Collection.js */ "../node_modules/@arcgis/core/core/Collection.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/promiseUtils.js */ "../node_modules/@arcgis/core/core/promiseUtils.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/accessorSupport/decorators/cast.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/cast.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./layers/support/fieldUtils.js */ "../node_modules/@arcgis/core/layers/support/fieldUtils.js");
/* harmony import */ var _popup_content_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./popup/content.js */ "../node_modules/@arcgis/core/popup/content.js");
/* harmony import */ var _popup_ExpressionInfo_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./popup/ExpressionInfo.js */ "../node_modules/@arcgis/core/popup/ExpressionInfo.js");
/* harmony import */ var _popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./popup/FieldInfo.js */ "../node_modules/@arcgis/core/popup/FieldInfo.js");
/* harmony import */ var _popup_LayerOptions_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./popup/LayerOptions.js */ "../node_modules/@arcgis/core/popup/LayerOptions.js");
/* harmony import */ var _popup_RelatedRecordsInfo_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./popup/RelatedRecordsInfo.js */ "../node_modules/@arcgis/core/popup/RelatedRecordsInfo.js");
/* harmony import */ var _popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./popup/content/AttachmentsContent.js */ "../node_modules/@arcgis/core/popup/content/AttachmentsContent.js");
/* harmony import */ var _popup_content_Content_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./popup/content/Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/* harmony import */ var _popup_content_CustomContent_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./popup/content/CustomContent.js */ "../node_modules/@arcgis/core/popup/content/CustomContent.js");
/* harmony import */ var _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./popup/content/FieldsContent.js */ "../node_modules/@arcgis/core/popup/content/FieldsContent.js");
/* harmony import */ var _popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./popup/content/MediaContent.js */ "../node_modules/@arcgis/core/popup/content/MediaContent.js");
/* harmony import */ var _popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./popup/content/TextContent.js */ "../node_modules/@arcgis/core/popup/content/TextContent.js");
/* harmony import */ var _popup_content_support_mediaInfoTypes_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./popup/content/support/mediaInfoTypes.js */ "../node_modules/@arcgis/core/popup/content/support/mediaInfoTypes.js");
/* harmony import */ var _support_actions_ActionBase_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./support/actions/ActionBase.js */ "../node_modules/@arcgis/core/support/actions/ActionBase.js");
/* harmony import */ var _support_actions_ActionButton_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./support/actions/ActionButton.js */ "../node_modules/@arcgis/core/support/actions/ActionButton.js");
/* harmony import */ var _support_actions_ActionToggle_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./support/actions/ActionToggle.js */ "../node_modules/@arcgis/core/support/actions/ActionToggle.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var O;const S=_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType({key:"type",defaultKeyValue:"button",base:_support_actions_ActionBase_js__WEBPACK_IMPORTED_MODULE_26__["default"],typeMap:{button:_support_actions_ActionButton_js__WEBPACK_IMPORTED_MODULE_27__["default"],toggle:_support_actions_ActionToggle_js__WEBPACK_IMPORTED_MODULE_28__["default"]}}),T={base:_popup_content_Content_js__WEBPACK_IMPORTED_MODULE_20__["default"],key:"type",typeMap:{media:_popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_23__["default"],custom:_popup_content_CustomContent_js__WEBPACK_IMPORTED_MODULE_21__["default"],text:_popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_24__["default"],attachments:_popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_19__["default"],fields:_popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_22__["default"]}},b="esri.PopupTemplate",R=_core_Logger_js__WEBPACK_IMPORTED_MODULE_4__["default"].getLogger(b),L=["attachments","fields","media","text"];let J=O=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(){super(...arguments),this.actions=null,this.content="",this.expressionInfos=null,this.fieldInfos=null,this.layerOptions=null,this.lastEditInfoEnabled=!0,this.outFields=null,this.overwriteActions=!1,this.returnGeometry=!1,this.title="",this.relatedRecordsInfo=null}castContent(t){return Array.isArray(t)?t.map((t=>Object(_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_12__["ensureOneOfType"])(T,t))):"string"==typeof t||"function"==typeof t||t instanceof HTMLElement||Object(_core_promiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["isPromiseLike"])(t)?t:(R.error("content error","unsupported content value",{value:t}),null)}readContent(t,e){const{popupElements:o}=e;return Array.isArray(o)&&o.length>0?this._readPopupInfoElements(e):this._readPopupInfo(e)}writeContent(t,e,o,s){"string"!=typeof t?Array.isArray(t)&&(e.popupElements=t.filter((t=>-1!==L.indexOf(t.type))).map((t=>t&&t.toJSON(s))),e.popupElements.forEach((t=>{"attachments"===t.type?this._writeAttachmentContent(e):"media"===t.type?this._writeMediaContent(t,e):"text"===t.type&&this._writeTextContent(t,e)}))):e.description=t}writeFieldInfos(t,e,o,s){const{content:i}=this,r=Array.isArray(i)?i:null;if(t){const o=r?r.filter((t=>"fields"===t.type)):[],i=o.length&&o.every((t=>{var e;return null==(e=t.fieldInfos)?void 0:e.length}));e.fieldInfos=t.filter(Boolean).map((t=>{const e=t.toJSON(s);return i&&(e.visible=!1),e}))}if(r)for(const n of r)"fields"===n.type&&this._writeFieldsContent(n,e)}writeLayerOptions(t,e,o,s){e[o]=!t||null===t.showNoDataRecords&&null===t.returnTopmostRaster?null:t.toJSON(s)}writeTitle(t,e){e.title=t||""}clone(){const{actions:t}=this,e=t?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(t.toArray()):[];return new O({actions:e,content:Array.isArray(this.content)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.content):this.content,expressionInfos:Array.isArray(this.expressionInfos)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.expressionInfos):null,fieldInfos:Array.isArray(this.fieldInfos)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.fieldInfos):null,layerOptions:this.layerOptions?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.layerOptions):null,lastEditInfoEnabled:this.lastEditInfoEnabled,outFields:Array.isArray(this.outFields)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.outFields):null,overwriteActions:this.overwriteActions,returnGeometry:this.returnGeometry,title:this.title,relatedRecordsInfo:this.relatedRecordsInfo?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.relatedRecordsInfo):null})}async collectRequiredFields(t,e){await this._collectExpressionInfoFields(t,e,this.expressionInfos),Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_13__["collectFields"])(t,e,[...this.outFields||[],...this._getActionsFields(this.actions),...this._getTitleFields(this.title),...this._getContentFields(this.content)])}async getRequiredFields(t){const e=new Set;return await this.collectRequiredFields(e,t),[...e].sort()}_writeFieldsContent(t,e){if(!Array.isArray(t.fieldInfos)||!t.fieldInfos.length)return;const o=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(t.fieldInfos);Array.isArray(e.fieldInfos)?o.forEach((t=>{const o=e.fieldInfos.find((e=>e.fieldName.toLowerCase()===t.fieldName.toLowerCase()));o?o.visible=!0:e.fieldInfos.push(t)})):e.fieldInfos=o}_writeAttachmentContent(t){t.showAttachments||(t.showAttachments=!0)}_writeTextContent(t,e){!e.description&&t.text&&(e.description=t.text)}_writeMediaContent(t,e){if(!Array.isArray(t.mediaInfos)||!t.mediaInfos.length)return;const o=Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(t.mediaInfos);Array.isArray(e.mediaInfos)?e.mediaInfos=[...e.mediaInfos,...o]:e.mediaInfos=o}_readPopupInfoElements({description:t,mediaInfos:e,popupElements:o}){const s={description:!1,mediaInfos:!1};return o.map((o=>"media"===o.type?(o.mediaInfos||!e||s.mediaInfos||(o.mediaInfos=e,s.mediaInfos=!0),_popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_23__["default"].fromJSON(o)):"text"===o.type?(o.text||!t||s.description||(o.text=t,s.description=!0),_popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_24__["default"].fromJSON(o)):"attachments"===o.type?_popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_19__["default"].fromJSON(o):"fields"===o.type?_popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_22__["default"].fromJSON(o):void 0)).filter(Boolean)}_readPopupInfo({description:t,mediaInfos:e,showAttachments:o}){const s=[];return t?s.push(new _popup_content_TextContent_js__WEBPACK_IMPORTED_MODULE_24__["default"]({text:t})):s.push(new _popup_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_22__["default"]),Array.isArray(e)&&e.length&&s.push(_popup_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_23__["default"].fromJSON({mediaInfos:e})),o&&s.push(_popup_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_19__["default"].fromJSON({displayType:"list"})),s.length?s:t}_getContentElementFields(t){if(!t||"attachments"===t.type)return[];if("custom"===t.type)return t.outFields||[];if("fields"===t.type)return this._getFieldInfoFields(t.fieldInfos||this.fieldInfos);if("media"===t.type){return(t.mediaInfos||[]).reduce(((t,e)=>[...t,...this._getMediaInfoFields(e)]),[])}return"text"===t.type?this._extractFieldNames(t.text):void 0}_getMediaInfoFields(t){const{caption:e,title:o,value:s}=t,i=s||{},{fields:r=[],normalizeField:n,tooltipField:p,sourceURL:l,linkURL:a}=i,d=[...this._extractFieldNames(o),...this._extractFieldNames(e),...this._extractFieldNames(l),...this._extractFieldNames(a),...r];return n&&d.push(n),p&&d.push(p),d}_getContentFields(t){return"string"==typeof t?this._extractFieldNames(t):Array.isArray(t)?t.reduce(((t,e)=>[...t,...this._getContentElementFields(e)]),[]):[]}async _collectExpressionInfoFields(t,e,o){o&&await Promise.all(o.map((o=>Object(_layers_support_fieldUtils_js__WEBPACK_IMPORTED_MODULE_13__["collectArcadeFieldNames"])(t,e,o.expression))))}_getFieldInfoFields(t){return t?t.filter((t=>void 0===t.visible||!!t.visible)).map((t=>t.fieldName)).filter((t=>-1===t.indexOf("relationships/")&&-1===t.indexOf("expression/"))):[]}_getActionsFields(t){return t?t.toArray().reduce(((t,e)=>[...t,...this._getActionFields(e)]),[]):[]}_getActionFields(t){const{className:e,title:o,type:s}=t,i="button"===s||"toggle"===s?t.image:"";return[...this._extractFieldNames(o),...this._extractFieldNames(e),...this._extractFieldNames(i)]}_getTitleFields(t){return"string"==typeof t?this._extractFieldNames(t):[]}_extractFieldNames(t){if(!t||"string"!=typeof t)return[];const e=/{[^}]*}/g,o=t.match(e);if(!o)return[];const s=/\{(\w+):.+\}/,i=o.filter((t=>!(0===t.indexOf("{relationships/")||0===t.indexOf("{expression/")))).map((t=>t.replace(s,"{$1}")));return i?i.map((t=>t.slice(1,-1))):[]}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:S})],J.prototype,"actions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],J.prototype,"content",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_cast_js__WEBPACK_IMPORTED_MODULE_7__["cast"])("content")],J.prototype,"castContent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_9__["reader"])("content",["description","fieldInfos","popupElements","mediaInfos","showAttachments"])],J.prototype,"readContent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("content",{popupElements:{type:_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_popup_content_js__WEBPACK_IMPORTED_MODULE_14__["persistableTypes"])},showAttachments:{type:Boolean},mediaInfos:{type:_core_Collection_js__WEBPACK_IMPORTED_MODULE_1__["default"].ofType(_popup_content_support_mediaInfoTypes_js__WEBPACK_IMPORTED_MODULE_25__["types"])},description:{type:String}})],J.prototype,"writeContent",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:[_popup_ExpressionInfo_js__WEBPACK_IMPORTED_MODULE_15__["default"]],json:{write:!0}})],J.prototype,"expressionInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:[_popup_FieldInfo_js__WEBPACK_IMPORTED_MODULE_16__["default"]]})],J.prototype,"fieldInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("fieldInfos")],J.prototype,"writeFieldInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_popup_LayerOptions_js__WEBPACK_IMPORTED_MODULE_17__["default"]})],J.prototype,"layerOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("layerOptions")],J.prototype,"writeLayerOptions",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:Boolean,json:{read:{source:"showLastEditInfo"},write:{target:"showLastEditInfo"},default:!0}})],J.prototype,"lastEditInfoEnabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],J.prototype,"outFields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],J.prototype,"overwriteActions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],J.prototype,"returnGeometry",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({json:{type:String}})],J.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_11__["writer"])("title")],J.prototype,"writeTitle",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])({type:_popup_RelatedRecordsInfo_js__WEBPACK_IMPORTED_MODULE_18__["default"],json:{write:!0}})],J.prototype,"relatedRecordsInfo",void 0),J=O=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_10__["subclass"])(b)],J);var M=J;


/***/ }),

/***/ "../node_modules/@arcgis/core/core/accessorSupport/decorators/aliasOf.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@arcgis/core/core/accessorSupport/decorators/aliasOf.js ***!
  \*******************************************************************************/
/*! exports provided: aliasOf */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "aliasOf", function() { return o; });
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function o(o,t){const e=t?{...t,source:o}:o;return Object(_property_js__WEBPACK_IMPORTED_MODULE_0__["property"])({aliasOf:e})}


/***/ }),

/***/ "../node_modules/@arcgis/core/core/date.js":
/*!*************************************************!*\
  !*** ../node_modules/@arcgis/core/core/date.js ***!
  \*************************************************/
/*! exports provided: dictionary, formats, fromJSON, getFormat, toJSON */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dictionary", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formats", function() { return e; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromJSON", function() { return r; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFormat", function() { return n; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toJSON", function() { return o; });
/* harmony import */ var _jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const e={"short-date":"(datePattern: 'M/d/y', selector: 'date')","short-date-short-time":"(datePattern: 'M/d/y', timePattern: 'h:mm a', selector: 'date and time')","short-date-short-time-24":"(datePattern: 'M/d/y', timePattern: 'H:mm', selector: 'date and time')","short-date-long-time":"(datePattern: 'M/d/y', timePattern: 'h:mm:ss a', selector: 'date and time')","short-date-long-time-24":"(datePattern: 'M/d/y', timePattern: 'H:mm:ss', selector: 'date and time')","short-date-le":"(datePattern: 'd/M/y', selector: 'date')","short-date-le-short-time":"(datePattern: 'd/M/y', timePattern: 'h:mm a', selector: 'date and time')","short-date-le-short-time-24":"(datePattern: 'd/M/y', timePattern: 'H:mm', selector: 'date and time')","short-date-le-long-time":"(datePattern: 'd/M/y', timePattern: 'h:mm:ss a', selector: 'date and time')","short-date-le-long-time-24":"(datePattern: 'd/M/y', timePattern: 'H:mm:ss', selector: 'date and time')","long-month-day-year":"(datePattern: 'MMMM d, y', selector: 'date')","long-month-day-year-short-time":"(datePattern: 'MMMM d, y', timePattern: 'h:mm a', selector: 'date and time')","long-month-day-year-short-time-24":"(datePattern: 'MMMM d, y', timePattern: 'H:mm', selector: 'date and time')","long-month-day-year-long-time":"(datePattern: 'MMMM d, y', timePattern: 'h:mm:ss a', selector: 'date and time')","long-month-day-year-long-time-24":"(datePattern: 'MMMM d, y', timePattern: 'H:mm:ss', selector: 'date and time')","day-short-month-year":"(datePattern: 'd MMM y', selector: 'date')","day-short-month-year-short-time":"(datePattern: 'd MMM y', timePattern: 'h:mm a', selector: 'date and time')","day-short-month-year-short-time-24":"(datePattern: 'd MMM y', timePattern: 'H:mm', selector: 'date and time')","day-short-month-year-long-time":"(datePattern: 'd MMM y', timePattern: 'h:mm:ss a', selector: 'date and time')","day-short-month-year-long-time-24":"(datePattern: 'd MMM y', timePattern: 'H:mm:ss', selector: 'date and time')","long-date":"(datePattern: 'EEEE, MMMM d, y', selector: 'date')","long-date-short-time":"(datePattern: 'EEEE, MMMM d, y', timePattern: 'h:mm a', selector: 'date and time')","long-date-short-time-24":"(datePattern: 'EEEE, MMMM d, y', timePattern: 'H:mm', selector: 'date and time')","long-date-long-time":"(datePattern: 'EEEE, MMMM d, y', timePattern: 'h:mm:ss a', selector: 'date and time')","long-date-long-time-24":"(datePattern: 'EEEE, MMMM d, y', timePattern: 'H:mm:ss', selector: 'date and time')","long-month-year":"(datePattern: 'MMMM y', selector: 'date')","short-month-year":"(datePattern: 'MMM y', selector: 'date')",year:"(datePattern: 'y', selector: 'date')"},a=Object(_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({shortDate:"short-date",shortDateShortTime:"short-date-short-time",shortDateShortTime24:"short-date-short-time-24",shortDateLongTime:"short-date-long-time",shortDateLongTime24:"short-date-long-time-24",shortDateLE:"short-date-le",shortDateLEShortTime:"short-date-le-short-time",shortDateLEShortTime24:"short-date-le-short-time-24",shortDateLELongTime:"short-date-le-long-time",shortDateLELongTime24:"short-date-le-long-time-24",longMonthDayYear:"long-month-day-year",longMonthDayYearShortTime:"long-month-day-year-short-time",longMonthDayYearShortTime24:"long-month-day-year-short-time-24",longMonthDayYearLongTime:"long-month-day-year-long-time",longMonthDayYearLongTime24:"long-month-day-year-long-time-24",dayShortMonthYear:"day-short-month-year",dayShortMonthYearShortTime:"day-short-month-year-short-time",dayShortMonthYearShortTime24:"day-short-month-year-short-time-24",dayShortMonthYearLongTime:"day-short-month-year-long-time",dayShortMonthYearLongTime24:"day-short-month-year-long-time-24",longDate:"long-date",longDateShortTime:"long-date-short-time",longDateShortTime24:"long-date-short-time-24",longDateLongTime:"long-date-long-time",longDateLongTime24:"long-date-long-time-24",longMonthYear:"long-month-year",shortMonthYear:"short-month-year",year:"year"}),o=a.toJSON.bind(a),r=a.fromJSON.bind(a);function n(t){return e[t]}


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/ExpressionInfo.js":
/*!************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/ExpressionInfo.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let p=s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.name=null,this.title=null,this.expression=null,this.returnType=null}clone(){return new s({name:this.name,title:this.title,expression:this.expression,returnType:this.returnType})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"name",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"expression",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["string","number"],json:{write:!0}})],p.prototype,"returnType",void 0),p=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.ExpressionInfo")],p);var i=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/FieldInfo.js":
/*!*******************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/FieldInfo.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./support/FieldInfoFormat.js */ "../node_modules/@arcgis/core/popup/support/FieldInfoFormat.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let n=a=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(t){super(t),this.fieldName=null,this.format=null,this.isEditable=!1,this.label=null,this.stringFieldOption="text-box",this.statisticType=null,this.tooltip=null,this.visible=!0}clone(){return new a({fieldName:this.fieldName,format:this.format?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_3__["clone"])(this.format):null,isEditable:this.isEditable,label:this.label,stringFieldOption:this.stringFieldOption,statisticType:this.statisticType,tooltip:this.tooltip,visible:this.visible})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],n.prototype,"fieldName",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:_support_FieldInfoFormat_js__WEBPACK_IMPORTED_MODULE_10__["default"],json:{write:!0}})],n.prototype,"format",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Boolean,json:{write:!0,default:!1}})],n.prototype,"isEditable",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],n.prototype,"label",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_8__["enumeration"])(new _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_1__["JSONMap"]({richtext:"rich-text",textarea:"text-area",textbox:"text-box"}),{default:"text-box"})],n.prototype,"stringFieldOption",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:["count","sum","min","max","avg","stddev","var"],json:{write:!0}})],n.prototype,"statisticType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:String,json:{write:!0}})],n.prototype,"tooltip",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_4__["property"])({type:Boolean,json:{write:!0}})],n.prototype,"visible",void 0),n=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_9__["subclass"])("esri.popup.FieldInfo")],n);var c=n;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/LayerOptions.js":
/*!**********************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/LayerOptions.js ***!
  \**********************************************************/
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
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var e;let p=e=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.returnTopmostRaster=null,this.showNoDataRecords=null}clone(){return new e({showNoDataRecords:this.showNoDataRecords,returnTopmostRaster:this.returnTopmostRaster})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,json:{write:!0}})],p.prototype,"returnTopmostRaster",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:Boolean,json:{write:!0}})],p.prototype,"showNoDataRecords",void 0),p=e=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.LayerOptions")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/RelatedRecordsInfo.js":
/*!****************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/RelatedRecordsInfo.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _support_RelatedRecordsInfoFieldOrder_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./support/RelatedRecordsInfoFieldOrder.js */ "../node_modules/@arcgis/core/popup/support/RelatedRecordsInfoFieldOrder.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var d;let c=d=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.showRelatedRecords=null,this.orderByFields=null}clone(){return new d({showRelatedRecords:this.showRelatedRecords,orderByFields:this.orderByFields?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.orderByFields):null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],c.prototype,"showRelatedRecords",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[_support_RelatedRecordsInfoFieldOrder_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{write:!0}})],c.prototype,"orderByFields",void 0),c=d=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.popup.RelatedRecordsInfo")],c);var i=c;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content.js":
/*!*****************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content.js ***!
  \*****************************************************/
/*! exports provided: AttachmentsContent, BaseContent, CustomContent, FieldsContent, MediaContent, TextContent, isContent, persistableTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isContent", function() { return a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "persistableTypes", function() { return r; });
/* harmony import */ var _content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content/AttachmentsContent.js */ "../node_modules/@arcgis/core/popup/content/AttachmentsContent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AttachmentsContent", function() { return _content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _content_Content_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./content/Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BaseContent", function() { return _content_Content_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _content_CustomContent_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./content/CustomContent.js */ "../node_modules/@arcgis/core/popup/content/CustomContent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CustomContent", function() { return _content_CustomContent_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./content/FieldsContent.js */ "../node_modules/@arcgis/core/popup/content/FieldsContent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FieldsContent", function() { return _content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _content_MediaContent_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./content/MediaContent.js */ "../node_modules/@arcgis/core/popup/content/MediaContent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MediaContent", function() { return _content_MediaContent_js__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _content_TextContent_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./content/TextContent.js */ "../node_modules/@arcgis/core/popup/content/TextContent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextContent", function() { return _content_TextContent_js__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
function a(t){return t instanceof _content_Content_js__WEBPACK_IMPORTED_MODULE_1__["default"]}const r={base:null,key:"type",typeMap:{attachment:_content_AttachmentsContent_js__WEBPACK_IMPORTED_MODULE_0__["default"],media:_content_MediaContent_js__WEBPACK_IMPORTED_MODULE_4__["default"],text:_content_TextContent_js__WEBPACK_IMPORTED_MODULE_5__["default"],field:_content_FieldsContent_js__WEBPACK_IMPORTED_MODULE_3__["default"]}};


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/AttachmentsContent.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/AttachmentsContent.js ***!
  \************************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Content_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let i=s=class extends _Content_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.description=null,this.displayType=null,this.title=null,this.type="attachments"}clone(){return new s({description:this.description,displayType:this.displayType,title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],i.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["preview","list"],json:{write:!0}})],i.prototype,"displayType",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],i.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["attachments"],readOnly:!0,json:{read:!1,write:!0}})],i.prototype,"type",void 0),i=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.AttachmentsContent")],i);var p=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/BarChartMediaInfo.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/BarChartMediaInfo.js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/ChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js");
/* harmony import */ var _support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/chartMediaInfoUtils.js */ "../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var a;let p=a=class extends _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(r){super(r),this.type="bar-chart"}clone(){return new a({altText:this.altText,title:this.title,caption:this.caption,value:this.value?this.value.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["bar-chart"],readOnly:!0,json:{type:["barchart"],read:!1,write:_support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__["chartTypeKebabDict"].write}})],p.prototype,"type",void 0),p=a=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.BarChartMediaInfo")],p);var i=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/ColumnChartMediaInfo.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/ColumnChartMediaInfo.js ***!
  \**************************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/ChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js");
/* harmony import */ var _support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/chartMediaInfoUtils.js */ "../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let a=p=class extends _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.type="column-chart"}clone(){return new p({altText:this.altText,title:this.title,caption:this.caption,value:this.value?this.value.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["column-chart"],readOnly:!0,json:{type:["columnchart"],read:!1,write:_support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__["chartTypeKebabDict"].write}})],a.prototype,"type",void 0),a=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.ColumnChartMediaInfo")],a);var c=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/Content.js":
/*!*************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/Content.js ***!
  \*************************************************************/
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
let s=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["attachments","custom","fields","media","text"],readOnly:!0,json:{read:!1,write:!0}})],s.prototype,"type",void 0),s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.content.Content")],s);var p=s;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/CustomContent.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/CustomContent.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Content_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _Content_js__WEBPACK_IMPORTED_MODULE_7__["default"]{constructor(o){super(o),this.creator=null,this.destroyer=null,this.outFields=null,this.type="custom"}clone(){return new p({creator:this.creator,destroyer:this.destroyer,outFields:Array.isArray(this.outFields)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.outFields):null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],i.prototype,"creator",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],i.prototype,"destroyer",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],i.prototype,"outFields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["custom"],readOnly:!0})],i.prototype,"type",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.content.CustomContent")],i);var c=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/FieldsContent.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/FieldsContent.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../FieldInfo.js */ "../node_modules/@arcgis/core/popup/FieldInfo.js");
/* harmony import */ var _Content_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let l=n=class extends _Content_js__WEBPACK_IMPORTED_MODULE_9__["default"]{constructor(o){super(o),this.description=null,this.fieldInfos=null,this.title=null,this.type="fields"}writeFieldInfos(o,e){e.fieldInfos=o&&o.map((o=>o.toJSON()))}clone(){return new n({description:this.description,fieldInfos:Array.isArray(this.fieldInfos)?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.fieldInfos):null,title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],l.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:[_FieldInfo_js__WEBPACK_IMPORTED_MODULE_8__["default"]]})],l.prototype,"fieldInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_7__["writer"])("fieldInfos")],l.prototype,"writeFieldInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],l.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["fields"],readOnly:!0,json:{read:!1,write:!0}})],l.prototype,"type",void 0),l=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.content.FieldsContent")],l);var c=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/ImageMediaInfo.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/ImageMediaInfo.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return i; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _mixins_MediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/MediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/MediaInfo.js");
/* harmony import */ var _support_ImageMediaInfoValue_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/ImageMediaInfoValue.js */ "../node_modules/@arcgis/core/popup/content/support/ImageMediaInfoValue.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let a=p=class extends _mixins_MediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(e){super(e),this.refreshInterval=null,this.type="image",this.value=null}clone(){return new p({altText:this.altText,title:this.title,caption:this.caption,refreshInterval:this.refreshInterval,value:this.value?this.value.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:Number,json:{write:!0}})],a.prototype,"refreshInterval",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["image"],readOnly:!0,json:{read:!1,write:!0}})],a.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:_support_ImageMediaInfoValue_js__WEBPACK_IMPORTED_MODULE_7__["default"],json:{write:!0}})],a.prototype,"value",void 0),a=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.ImageMediaInfo")],a);var i=a;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/LineChartMediaInfo.js":
/*!************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/LineChartMediaInfo.js ***!
  \************************************************************************/
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
/* harmony import */ var _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/ChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js");
/* harmony import */ var _support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/chartMediaInfoUtils.js */ "../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var i;let p=i=class extends _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.type="line-chart"}clone(){return new i({altText:this.altText,title:this.title,caption:this.caption,value:this.value?this.value.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["line-chart"],readOnly:!0,json:{type:["linechart"],read:!1,write:_support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__["chartTypeKebabDict"].write}})],p.prototype,"type",void 0),p=i=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.LineChartMediaInfo")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/MediaContent.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/MediaContent.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/reader.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/reader.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/writer.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/writer.js");
/* harmony import */ var _BarChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BarChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/BarChartMediaInfo.js");
/* harmony import */ var _ColumnChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ColumnChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/ColumnChartMediaInfo.js");
/* harmony import */ var _Content_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/* harmony import */ var _ImageMediaInfo_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ImageMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/ImageMediaInfo.js");
/* harmony import */ var _LineChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./LineChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/LineChartMediaInfo.js");
/* harmony import */ var _PieChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./PieChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/PieChartMediaInfo.js");
/* harmony import */ var _support_mediaInfoTypes_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./support/mediaInfoTypes.js */ "../node_modules/@arcgis/core/popup/content/support/mediaInfoTypes.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var l;let I=l=class extends _Content_js__WEBPACK_IMPORTED_MODULE_11__["default"]{constructor(o){super(o),this.activeMediaInfoIndex=null,this.description=null,this.mediaInfos=null,this.title=null,this.type="media"}readMediaInfos(o){return o&&o.map((o=>"image"===o.type?_ImageMediaInfo_js__WEBPACK_IMPORTED_MODULE_12__["default"].fromJSON(o):"barchart"===o.type?_BarChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_9__["default"].fromJSON(o):"columnchart"===o.type?_ColumnChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_10__["default"].fromJSON(o):"linechart"===o.type?_LineChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_13__["default"].fromJSON(o):"piechart"===o.type?_PieChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_14__["default"].fromJSON(o):void 0)).filter(Boolean)}writeMediaInfos(o,e){e.mediaInfos=o&&o.map((o=>o.toJSON()))}clone(){return new l({activeMediaInfoIndex:this.activeMediaInfoIndex,description:this.description,mediaInfos:this.mediaInfos?Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_1__["clone"])(this.mediaInfos):null,title:this.title})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])()],I.prototype,"activeMediaInfoIndex",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],I.prototype,"description",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({types:[_support_mediaInfoTypes_js__WEBPACK_IMPORTED_MODULE_15__["types"]]})],I.prototype,"mediaInfos",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_reader_js__WEBPACK_IMPORTED_MODULE_6__["reader"])("mediaInfos")],I.prototype,"readMediaInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_writer_js__WEBPACK_IMPORTED_MODULE_8__["writer"])("mediaInfos")],I.prototype,"writeMediaInfos",null),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({json:{write:!0,origins:{"web-scene":{write:!1,read:!1}}}})],I.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["media"],readOnly:!0,json:{read:!1,write:!0}})],I.prototype,"type",void 0),I=l=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.popup.content.MediaContent")],I);var u=I;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/PieChartMediaInfo.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/PieChartMediaInfo.js ***!
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
/* harmony import */ var _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/ChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js");
/* harmony import */ var _support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./support/chartMediaInfoUtils.js */ "../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _mixins_ChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.type="pie-chart"}clone(){return new p({altText:this.altText,title:this.title,caption:this.caption,value:this.value?this.value.clone():null})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["pie-chart"],readOnly:!0,json:{type:["piechart"],read:!1,write:_support_chartMediaInfoUtils_js__WEBPACK_IMPORTED_MODULE_7__["chartTypeKebabDict"].write}})],i.prototype,"type",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.PieChartMediaInfo")],i);var a=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/TextContent.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/TextContent.js ***!
  \*****************************************************************/
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
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _Content_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Content.js */ "../node_modules/@arcgis/core/popup/content/Content.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var s;let p=s=class extends _Content_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(t){super(t),this.text=null,this.type="text"}clone(){return new s({text:this.text})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:String,json:{write:!0}})],p.prototype,"text",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["text"],readOnly:!0,json:{read:!1,write:!0}})],p.prototype,"type",void 0),p=s=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.TextContent")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/mixins/ChartMediaInfo.js ***!
  \***************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _MediaInfo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./MediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/MediaInfo.js");
/* harmony import */ var _support_ChartMediaInfoValue_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../support/ChartMediaInfoValue.js */ "../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValue.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
let p=class extends _MediaInfo_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(r){super(r),this.type=null,this.value=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:["bar-chart","column-chart","line-chart","pie-chart"],readOnly:!0,json:{read:!1,write:!0}})],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])({type:_support_ChartMediaInfoValue_js__WEBPACK_IMPORTED_MODULE_7__["default"],json:{write:!0}})],p.prototype,"value",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.popup.content.mixins.ChartMediaInfo")],p);var a=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/mixins/MediaInfo.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/mixins/MediaInfo.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return s; });
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
let p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(t){super(t),this.altText=null,this.caption="",this.title="",this.type=null}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"altText",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"caption",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["image","bar-chart","column-chart","line-chart","pie-chart"],readOnly:!0,json:{read:!1,write:!0}})],p.prototype,"type",void 0),p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.content.mixins.MediaInfo")],p);var s=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValue.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValue.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return a; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_lang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/lang.js */ "../node_modules/@arcgis/core/core/lang.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _ChartMediaInfoValueSeries_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ChartMediaInfoValueSeries.js */ "../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValueSeries.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let l=p=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(o){super(o),this.fields=[],this.normalizeField=null,this.series=[],this.tooltipField=null}clone(){return new p({fields:Object(_core_lang_js__WEBPACK_IMPORTED_MODULE_2__["clone"])(this.fields),normalizeField:this.normalizeField,tooltipField:this.tooltipField})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[String],json:{write:!0}})],l.prototype,"fields",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],l.prototype,"normalizeField",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:[_ChartMediaInfoValueSeries_js__WEBPACK_IMPORTED_MODULE_8__["default"]],json:{read:!1}})],l.prototype,"series",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:String,json:{write:!0}})],l.prototype,"tooltipField",void 0),l=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.popup.content.support.ChartMediaInfoValue")],l);var a=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValueSeries.js":
/*!***************************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/support/ChartMediaInfoValueSeries.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/aliasOf.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/aliasOf.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var p;let i=p=class extends _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"]{constructor(o){super(o),this.tooltip=null,this.value=null,this.x=null,this.y=null}clone(){return new p({tooltip:this.tooltip,value:this.value})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],i.prototype,"tooltip",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_6__["property"])()],i.prototype,"value",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_2__["aliasOf"])("value")],i.prototype,"x",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_aliasOf_js__WEBPACK_IMPORTED_MODULE_2__["aliasOf"])("tooltip")],i.prototype,"y",void 0),i=p=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.popup.content.support.ChartMediaInfoValueSeries")],i);var c=i;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/support/ImageMediaInfoValue.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/support/ImageMediaInfoValue.js ***!
  \*********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
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
var t;let p=t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.linkURL=null,this.sourceURL=null}clone(){return new t({linkURL:this.linkURL,sourceURL:this.sourceURL})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"linkURL",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"sourceURL",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.content.support.ImageMediaInfoValue")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/support/chartMediaInfoUtils.js ***!
  \*********************************************************************************/
/*! exports provided: chartTypeKebabDict */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chartTypeKebabDict", function() { return c; });
/* harmony import */ var _core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/jsonMap.js */ "../node_modules/@arcgis/core/core/jsonMap.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const c=Object(_core_jsonMap_js__WEBPACK_IMPORTED_MODULE_0__["strict"])()({barchart:"bar-chart",columnchart:"column-chart",linechart:"line-chart",piechart:"pie-chart"});


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/content/support/mediaInfoTypes.js":
/*!****************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/content/support/mediaInfoTypes.js ***!
  \****************************************************************************/
/*! exports provided: default, types */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return m; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "types", function() { return m; });
/* harmony import */ var _BarChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BarChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/BarChartMediaInfo.js");
/* harmony import */ var _ColumnChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ColumnChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/ColumnChartMediaInfo.js");
/* harmony import */ var _ImageMediaInfo_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ImageMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/ImageMediaInfo.js");
/* harmony import */ var _LineChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../LineChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/LineChartMediaInfo.js");
/* harmony import */ var _PieChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../PieChartMediaInfo.js */ "../node_modules/@arcgis/core/popup/content/PieChartMediaInfo.js");
/* harmony import */ var _mixins_MediaInfo_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../mixins/MediaInfo.js */ "../node_modules/@arcgis/core/popup/content/mixins/MediaInfo.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
const m={base:_mixins_MediaInfo_js__WEBPACK_IMPORTED_MODULE_5__["default"],key:"type",defaultKeyValue:"image",typeMap:{"bar-chart":_BarChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_0__["default"],"column-chart":_ColumnChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_1__["default"],"line-chart":_LineChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_3__["default"],"pie-chart":_PieChartMediaInfo_js__WEBPACK_IMPORTED_MODULE_4__["default"],image:_ImageMediaInfo_js__WEBPACK_IMPORTED_MODULE_2__["default"]}};


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/support/FieldInfoFormat.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/support/FieldInfoFormat.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return u; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_date_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/date.js */ "../node_modules/@arcgis/core/core/date.js");
/* harmony import */ var _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/JSONSupport.js */ "../node_modules/@arcgis/core/core/JSONSupport.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/enumeration.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/enumeration.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/* harmony import */ var _intl_date_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../intl/date.js */ "../node_modules/@arcgis/core/intl/date.js");
/* harmony import */ var _intl_number_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../intl/number.js */ "../node_modules/@arcgis/core/intl/number.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var n;let l=n=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_2__["JSONSupport"]{constructor(t){super(t),this.dateFormat=null,this.dateTimeFormatOptions=null,this.digitSeparator=!1,this.places=null}clone(){return new n({dateFormat:this.dateFormat,digitSeparator:this.digitSeparator,places:this.places})}format(t){return this.dateFormat?Object(_intl_date_js__WEBPACK_IMPORTED_MODULE_9__["formatDate"])(t,{...Object(_intl_date_js__WEBPACK_IMPORTED_MODULE_9__["convertDateFormatToIntlOptions"])(this.dateFormat),...this.dateTimeFormatOptions}):Object(_intl_number_js__WEBPACK_IMPORTED_MODULE_10__["formatNumber"])(t,Object(_intl_number_js__WEBPACK_IMPORTED_MODULE_10__["convertNumberFormatToIntlOptions"])(this))}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_enumeration_js__WEBPACK_IMPORTED_MODULE_7__["enumeration"])(_core_date_js__WEBPACK_IMPORTED_MODULE_1__["dictionary"])],l.prototype,"dateFormat",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Object,json:{read:!1}})],l.prototype,"dateTimeFormatOptions",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:Boolean,json:{write:!0}})],l.prototype,"digitSeparator",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])({type:_core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__["Integer"],json:{write:!0}})],l.prototype,"places",void 0),l=n=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_8__["subclass"])("esri.popup.support.FieldInfoFormat")],l);var u=l;


/***/ }),

/***/ "../node_modules/@arcgis/core/popup/support/RelatedRecordsInfoFieldOrder.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@arcgis/core/popup/support/RelatedRecordsInfoFieldOrder.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
var t;let p=t=class extends _core_JSONSupport_js__WEBPACK_IMPORTED_MODULE_1__["JSONSupport"]{constructor(r){super(r),this.field=null,this.order=null}clone(){return new t({field:this.field,order:this.order})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:String,json:{write:!0}})],p.prototype,"field",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_2__["property"])({type:["asc","desc"],json:{write:!0}})],p.prototype,"order",void 0),p=t=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_6__["subclass"])("esri.popup.support.RelatedRecordsInfoFieldOrder")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/support/actions/ActionBase.js":
/*!******************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/actions/ActionBase.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return c; });
/* harmony import */ var _chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../chunks/tslib.es6.js */ "../node_modules/@arcgis/core/chunks/tslib.es6.js");
/* harmony import */ var _core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/Accessor.js */ "../node_modules/@arcgis/core/core/Accessor.js");
/* harmony import */ var _core_Identifiable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../core/Identifiable.js */ "../node_modules/@arcgis/core/core/Identifiable.js");
/* harmony import */ var _core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/property.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/property.js");
/* harmony import */ var _core_has_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../core/has.js */ "../node_modules/@arcgis/core/core/has.js");
/* harmony import */ var _core_accessorSupport_ensureType_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/accessorSupport/ensureType.js */ "../node_modules/@arcgis/core/core/accessorSupport/ensureType.js");
/* harmony import */ var _core_Logger_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../core/Logger.js */ "../node_modules/@arcgis/core/core/Logger.js");
/* harmony import */ var _core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../core/accessorSupport/decorators/subclass.js */ "../node_modules/@arcgis/core/core/accessorSupport/decorators/subclass.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var r;let p=r=class extends(Object(_core_Identifiable_js__WEBPACK_IMPORTED_MODULE_2__["IdentifiableMixin"])(_core_Accessor_js__WEBPACK_IMPORTED_MODULE_1__["default"])){constructor(t){super(t),this.active=!1,this.className=null,this.disabled=!1,this.id=null,this.indicator=!1,this.title=null,this.type=null,this.visible=!0}clone(){return new r({active:this.active,className:this.className,disabled:this.disabled,id:this.id,indicator:this.indicator,title:this.title,visible:this.visible})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"active",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"className",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"disabled",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"id",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"indicator",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"title",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"type",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_3__["property"])()],p.prototype,"visible",void 0),p=r=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_7__["subclass"])("esri.support.actions.ActionBase")],p);var c=p;


/***/ }),

/***/ "../node_modules/@arcgis/core/support/actions/ActionButton.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/actions/ActionButton.js ***!
  \********************************************************************/
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
/* harmony import */ var _ActionBase_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ActionBase.js */ "../node_modules/@arcgis/core/support/actions/ActionBase.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var o;let r=o=class extends _ActionBase_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(s){super(s),this.image=null,this.type="button"}clone(){return new o({active:this.active,className:this.className,disabled:this.disabled,id:this.id,indicator:this.indicator,title:this.title,visible:this.visible,image:this.image})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],r.prototype,"image",void 0),r=o=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.support.Action.ActionButton")],r);var a=r;


/***/ }),

/***/ "../node_modules/@arcgis/core/support/actions/ActionToggle.js":
/*!********************************************************************!*\
  !*** ../node_modules/@arcgis/core/support/actions/ActionToggle.js ***!
  \********************************************************************/
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
/* harmony import */ var _ActionBase_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ActionBase.js */ "../node_modules/@arcgis/core/support/actions/ActionBase.js");
/*
All material copyright ESRI, All Rights Reserved, unless otherwise specified.
See https://js.arcgis.com/4.21/esri/copyright.txt for details.
*/
var o;let r=o=class extends _ActionBase_js__WEBPACK_IMPORTED_MODULE_6__["default"]{constructor(s){super(s),this.image=null,this.type="toggle",this.value=!1}clone(){return new o({active:this.active,className:this.className,disabled:this.disabled,id:this.id,indicator:this.indicator,title:this.title,visible:this.visible,image:this.image,value:this.value})}};Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],r.prototype,"image",void 0),Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__["property"])()],r.prototype,"value",void 0),r=o=Object(_chunks_tslib_es6_js__WEBPACK_IMPORTED_MODULE_0__["_"])([Object(_core_accessorSupport_decorators_subclass_js__WEBPACK_IMPORTED_MODULE_5__["subclass"])("esri.support.Action.ActionToggle")],r);var a=r;


/***/ })

};;
//# sourceMappingURL=5.render-page.js.map
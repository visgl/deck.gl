"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([[329],{78478:(t,e,n)=>{n.d(e,{A:()=>s});n(96540);var o=n(92303),r=n(74848);function s(t){let{children:e,fallback:n}=t;return(0,o.A)()?(0,r.jsx)(r.Fragment,{children:null==e?void 0:e()}):null!=n?n:null}},28453:(t,e,n)=>{n.d(e,{R:()=>a,x:()=>i});var o=n(96540);const r={},s=o.createContext(r);function a(t){const e=o.useContext(s);return o.useMemo((function(){return"function"==typeof t?t(e):{...e,...t}}),[e,t])}function i(t){let e;return e=t.disableParentContext?"function"==typeof t.components?t.components(r):t.components||r:a(t.components),o.createElement(s.Provider,{value:e},t.children)}},66517:(t,e,n)=>{n.d(e,{A:()=>h});var o=n(6946),r=n(1631),s=n(2199);var a=n(3081),i=n(99065);function c(t){return Math.log(t)}function u(t){return Math.exp(t)}function l(t){return-Math.log(-t)}function p(t){return-Math.exp(-t)}function d(t){return isFinite(t)?+("1e"+t):t<0?0:t}function f(t){return(e,n)=>-t(-e,n)}function m(t){const e=t(c,u),n=e.domain;let a,i,m=10;function h(){return a=function(t){return t===Math.E?Math.log:10===t&&Math.log10||2===t&&Math.log2||(t=Math.log(t),e=>Math.log(e)/t)}(m),i=function(t){return 10===t?d:t===Math.E?Math.exp:e=>Math.pow(t,e)}(m),n()[0]<0?(a=f(a),i=f(i),t(l,p)):t(c,u),e}return e.base=function(t){return arguments.length?(m=+t,h()):m},e.domain=function(t){return arguments.length?(n(t),h()):n()},e.ticks=t=>{const e=n();let r=e[0],s=e[e.length-1];const c=s<r;c&&([r,s]=[s,r]);let u,l,p=a(r),d=a(s);const f=null==t?10:+t;let h=[];if(!(m%1)&&d-p<f){if(p=Math.floor(p),d=Math.ceil(d),r>0){for(;p<=d;++p)for(u=1;u<m;++u)if(l=p<0?u/i(-p):u*i(p),!(l<r)){if(l>s)break;h.push(l)}}else for(;p<=d;++p)for(u=m-1;u>=1;--u)if(l=p>0?u/i(-p):u*i(p),!(l<r)){if(l>s)break;h.push(l)}2*h.length<f&&(h=(0,o.Ay)(r,s,f))}else h=(0,o.Ay)(p,d,Math.min(d-p,f)).map(i);return c?h.reverse():h},e.tickFormat=(t,n)=>{if(null==t&&(t=10),null==n&&(n=10===m?"s":","),"function"!=typeof n&&(m%1||null!=(n=(0,r.A)(n)).precision||(n.trim=!0),n=(0,s.GP)(n)),t===1/0)return n;const o=Math.max(1,m*t/e.ticks().length);return t=>{let e=t/i(Math.round(a(t)));return e*m<m-.5&&(e*=m),e<=o?n(t):""}},e.nice=()=>n(function(t,e){var n,o=0,r=(t=t.slice()).length-1,s=t[o],a=t[r];return a<s&&(n=o,o=r,r=n,n=s,s=a,a=n),t[o]=e.floor(s),t[r]=e.ceil(a),t}(n(),{floor:t=>i(Math.floor(a(t))),ceil:t=>i(Math.ceil(a(t)))})),e}function h(){const t=m((0,a.Gu)()).domain([1,10]);return t.copy=()=>(0,a.C)(t,h()).base(t.base()),i.C.apply(t,arguments),t}},14948:(t,e,n)=>{n.d(e,{Wd:()=>I,T5:()=>C,ov:()=>z,VI:()=>T});var o=n(96540);const r=o.createContext(null);function s(t,e){if(t===e)return!0;if(!t||!e)return!1;if(Array.isArray(t)){if(!Array.isArray(e)||t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(!s(t[n],e[n]))return!1;return!0}if(Array.isArray(e))return!1;if("object"==typeof t&&"object"==typeof e){const n=Object.keys(t),o=Object.keys(e);if(n.length!==o.length)return!1;for(const r of n){if(!e.hasOwnProperty(r))return!1;if(!s(t[r],e[r]))return!1}return!0}return!1}function a(t,e){if(!t.getProjection)return;const n=t.getProjection();s(n,e.getProjection())||e.setProjection(n)}function i(t){return{longitude:t.center.lng,latitude:t.center.lat,zoom:t.zoom,pitch:t.pitch,bearing:t.bearing,padding:t.padding}}function c(t,e){const n=e.viewState||e;let o=!1;if("zoom"in n){const e=t.zoom;t.zoom=n.zoom,o=o||e!==t.zoom}if("bearing"in n){const e=t.bearing;t.bearing=n.bearing,o=o||e!==t.bearing}if("pitch"in n){const e=t.pitch;t.pitch=n.pitch,o=o||e!==t.pitch}if(n.padding&&!t.isPaddingEqual(n.padding)&&(o=!0,t.padding=n.padding),"longitude"in n&&"latitude"in n){const e=t.center;t.center=new e.constructor(n.longitude,n.latitude),o=o||e!==t.center}return o}const u=["type","source","source-layer","minzoom","maxzoom","filter","layout"];function l(t){if(!t)return null;if("string"==typeof t)return t;if("toJS"in t&&(t=t.toJS()),!t.layers)return t;const e={};for(const o of t.layers)e[o.id]=o;const n=t.layers.map((t=>{let n=null;"interactive"in t&&(n=Object.assign({},t),delete n.interactive);const o=e[t.ref];if(o){n=n||Object.assign({},t),delete n.ref;for(const t of u)t in o&&(n[t]=o[t])}return n||t}));return{...t,layers:n}}const p={version:8,sources:{},layers:[]},d={mousedown:"onMouseDown",mouseup:"onMouseUp",mouseover:"onMouseOver",mousemove:"onMouseMove",click:"onClick",dblclick:"onDblClick",mouseenter:"onMouseEnter",mouseleave:"onMouseLeave",mouseout:"onMouseOut",contextmenu:"onContextMenu",touchstart:"onTouchStart",touchend:"onTouchEnd",touchmove:"onTouchMove",touchcancel:"onTouchCancel"},f={movestart:"onMoveStart",move:"onMove",moveend:"onMoveEnd",dragstart:"onDragStart",drag:"onDrag",dragend:"onDragEnd",zoomstart:"onZoomStart",zoom:"onZoom",zoomend:"onZoomEnd",rotatestart:"onRotateStart",rotate:"onRotate",rotateend:"onRotateEnd",pitchstart:"onPitchStart",pitch:"onPitch",pitchend:"onPitchEnd"},m={wheel:"onWheel",boxzoomstart:"onBoxZoomStart",boxzoomend:"onBoxZoomEnd",boxzoomcancel:"onBoxZoomCancel",resize:"onResize",load:"onLoad",render:"onRender",idle:"onIdle",remove:"onRemove",data:"onData",styledata:"onStyleData",sourcedata:"onSourceData",error:"onError"},h=["minZoom","maxZoom","minPitch","maxPitch","maxBounds","projection","renderWorldCopies"],g=["scrollZoom","boxZoom","dragRotate","dragPan","keyboard","doubleClickZoom","touchZoomRotate","touchPitch"];class y{constructor(t,e,n){this._map=null,this._internalUpdate=!1,this._inRender=!1,this._hoveredFeatures=null,this._deferredEvents={move:!1,zoom:!1,pitch:!1,rotate:!1},this._onEvent=t=>{const e=this.props[m[t.type]];e?e(t):"error"===t.type&&console.error(t.error)},this._onPointerEvent=t=>{"mousemove"!==t.type&&"mouseout"!==t.type||this._updateHover(t);const e=this.props[d[t.type]];e&&(this.props.interactiveLayerIds&&"mouseover"!==t.type&&"mouseout"!==t.type&&(t.features=this._hoveredFeatures||this._queryRenderedFeatures(t.point)),e(t),delete t.features)},this._onCameraEvent=t=>{if(!this._internalUpdate){const e=this.props[f[t.type]];e&&e(t)}t.type in this._deferredEvents&&(this._deferredEvents[t.type]=!1)},this._MapClass=t,this.props=e,this._initialize(n)}get map(){return this._map}get transform(){return this._renderTransform}setProps(t){const e=this.props;this.props=t;const n=this._updateSettings(t,e);n&&this._createShadowTransform(this._map);const o=this._updateSize(t),r=this._updateViewState(t,!0);this._updateStyle(t,e),this._updateStyleComponents(t,e),this._updateHandlers(t,e),(n||o||r&&!this._map.isMoving())&&this.redraw()}static reuse(t,e){const n=y.savedMaps.pop();if(!n)return null;const o=n.map,r=o.getContainer();for(e.className=r.className;r.childNodes.length>0;)e.appendChild(r.childNodes[0]);o._container=e,n.setProps({...t,styleDiffing:!1}),o.resize();const{initialViewState:s}=t;return s&&(s.bounds?o.fitBounds(s.bounds,{...s.fitBoundsOptions,duration:0}):n._updateViewState(s,!1)),o.isStyleLoaded()?o.fire("load"):o.once("styledata",(()=>o.fire("load"))),o._update(),n}_initialize(t){const{props:e}=this,{mapStyle:n=p}=e,o={...e,...e.initialViewState,accessToken:e.mapboxAccessToken||_()||null,container:t,style:l(n)},r=o.initialViewState||o.viewState||o;if(Object.assign(o,{center:[r.longitude||0,r.latitude||0],zoom:r.zoom||0,pitch:r.pitch||0,bearing:r.bearing||0}),e.gl){const t=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=()=>(HTMLCanvasElement.prototype.getContext=t,e.gl)}const s=new this._MapClass(o);r.padding&&s.setPadding(r.padding),e.cursor&&(s.getCanvas().style.cursor=e.cursor),this._createShadowTransform(s);const i=s._render;s._render=t=>{this._inRender=!0,i.call(s,t),this._inRender=!1};const c=s._renderTaskQueue.run;s._renderTaskQueue.run=t=>{c.call(s._renderTaskQueue,t),this._onBeforeRepaint()},s.on("render",(()=>this._onAfterRepaint()));const u=s.fire;s.fire=this._fireEvent.bind(this,u),s.on("resize",(()=>{this._renderTransform.resize(s.transform.width,s.transform.height)})),s.on("styledata",(()=>{this._updateStyleComponents(this.props,{}),a(s.transform,this._renderTransform)})),s.on("sourcedata",(()=>this._updateStyleComponents(this.props,{})));for(const a in d)s.on(a,this._onPointerEvent);for(const a in f)s.on(a,this._onCameraEvent);for(const a in m)s.on(a,this._onEvent);this._map=s}recycle(){const t=this.map.getContainer().querySelector("[mapboxgl-children]");t?.remove(),y.savedMaps.push(this)}destroy(){this._map.remove()}redraw(){const t=this._map;!this._inRender&&t.style&&(t._frame&&(t._frame.cancel(),t._frame=null),t._render())}_createShadowTransform(t){const e=function(t){const e=t.clone();return e.pixelsToGLUnits=t.pixelsToGLUnits,e}(t.transform);t.painter.transform=e,this._renderTransform=e}_updateSize(t){const{viewState:e}=t;if(e){const t=this._map;if(e.width!==t.transform.width||e.height!==t.transform.height)return t.resize(),!0}return!1}_updateViewState(t,e){if(this._internalUpdate)return!1;const n=this._map,o=this._renderTransform,{zoom:r,pitch:s,bearing:a}=o,u=n.isMoving();u&&(o.cameraElevationReference="sea");const l=c(o,{...i(n.transform),...t});if(u&&(o.cameraElevationReference="ground"),l&&e){const t=this._deferredEvents;t.move=!0,t.zoom||(t.zoom=r!==o.zoom),t.rotate||(t.rotate=a!==o.bearing),t.pitch||(t.pitch=s!==o.pitch)}return u||c(n.transform,t),l}_updateSettings(t,e){const n=this._map;let o=!1;for(const r of h)if(r in t&&!s(t[r],e[r])){o=!0;const e=n[`set${r[0].toUpperCase()}${r.slice(1)}`];e?.call(n,t[r])}return o}_updateStyle(t,e){if(t.cursor!==e.cursor&&(this._map.getCanvas().style.cursor=t.cursor||""),t.mapStyle!==e.mapStyle){const{mapStyle:e=p,styleDiffing:n=!0}=t,o={diff:n};return"localIdeographFontFamily"in t&&(o.localIdeographFontFamily=t.localIdeographFontFamily),this._map.setStyle(l(e),o),!0}return!1}_updateStyleComponents(t,e){const n=this._map;let o=!1;return n.isStyleLoaded()&&("light"in t&&n.setLight&&!s(t.light,e.light)&&(o=!0,n.setLight(t.light)),"fog"in t&&n.setFog&&!s(t.fog,e.fog)&&(o=!0,n.setFog(t.fog)),"terrain"in t&&n.setTerrain&&!s(t.terrain,e.terrain)&&(t.terrain&&!n.getSource(t.terrain.source)||(o=!0,n.setTerrain(t.terrain)))),o}_updateHandlers(t,e){const n=this._map;let o=!1;for(const r of g){const a=t[r]??!0;s(a,e[r]??!0)||(o=!0,a?n[r].enable(a):n[r].disable())}return o}_queryRenderedFeatures(t){const e=this._map,n=e.transform,{interactiveLayerIds:o=[]}=this.props;try{return e.transform=this._renderTransform,e.queryRenderedFeatures(t,{layers:o.filter(e.getLayer.bind(e))})}catch{return[]}finally{e.transform=n}}_updateHover(t){const{props:e}=this;if(e.interactiveLayerIds&&(e.onMouseMove||e.onMouseEnter||e.onMouseLeave)){const e=t.type,n=this._hoveredFeatures?.length>0,o=this._queryRenderedFeatures(t.point),r=o.length>0;!r&&n&&(t.type="mouseleave",this._onPointerEvent(t)),this._hoveredFeatures=o,r&&!n&&(t.type="mouseenter",this._onPointerEvent(t)),t.type=e}else this._hoveredFeatures=null}_fireEvent(t,e,n){const o=this._map,r=o.transform,s="string"==typeof e?e:e.type;return"move"===s&&this._updateViewState(this.props,!1),s in f&&("object"==typeof e&&(e.viewState=i(r)),this._map.isMoving())?(o.transform=this._renderTransform,t.call(o,e,n),o.transform=r,o):(t.call(o,e,n),o)}_onBeforeRepaint(){const t=this._map;this._internalUpdate=!0;for(const n in this._deferredEvents)this._deferredEvents[n]&&t.fire(n);this._internalUpdate=!1;const e=this._map.transform;t.transform=this._renderTransform,this._onAfterRepaint=()=>{a(this._renderTransform,e),t.transform=e}}}y.savedMaps=[];const v=y;function _(){let t=null;if("undefined"!=typeof location){const e=/access_token=([^&\/]*)/.exec(location.search);t=e&&e[1]}try{t=t||"pk.eyJ1IjoidWNmLW1hcGJveCIsImEiOiJja2tyNHQzdnIzYmNnMndwZGI3djNzdjVyIn0.xgCXV9mLZ47q7easx6WLCQ"}catch{}try{t=t||process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}catch{}return t}const b=["setMaxBounds","setMinZoom","setMaxZoom","setMinPitch","setMaxPitch","setRenderWorldCopies","setProjection","setStyle","addSource","removeSource","addLayer","removeLayer","setLayerZoomRange","setFilter","setPaintProperty","setLayoutProperty","setLight","setTerrain","setFog","remove"];function M(t){if(!t)return null;const e=t.map,n={getMap:()=>e,getCenter:()=>t.transform.center,getZoom:()=>t.transform.zoom,getBearing:()=>t.transform.bearing,getPitch:()=>t.transform.pitch,getPadding:()=>t.transform.padding,getBounds:()=>t.transform.getBounds(),project:n=>{const o=e.transform;e.transform=t.transform;const r=e.project(n);return e.transform=o,r},unproject:n=>{const o=e.transform;e.transform=t.transform;const r=e.unproject(n);return e.transform=o,r},queryTerrainElevation:(n,o)=>{const r=e.transform;e.transform=t.transform;const s=e.queryTerrainElevation(n,o);return e.transform=r,s},queryRenderedFeatures:(n,o)=>{const r=e.transform;e.transform=t.transform;const s=e.queryRenderedFeatures(n,o);return e.transform=r,s}};for(const o of function(t){const e=new Set;let n=t;for(;n;){for(const o of Object.getOwnPropertyNames(n))"_"!==o[0]&&"function"==typeof t[o]&&"fire"!==o&&"setEventedParent"!==o&&e.add(o);n=Object.getPrototypeOf(n)}return Array.from(e)}(e))o in n||b.includes(o)||(n[o]=e[o].bind(e));return n}const E="undefined"!=typeof document?o.useLayoutEffect:o.useEffect,L=["baseApiUrl","maxParallelImageRequests","workerClass","workerCount","workerUrl"];const x=o.createContext(null);const C=o.forwardRef((function(t,e){const s=(0,o.useContext)(r),[a,i]=(0,o.useState)(null),c=(0,o.useRef)(),{current:u}=(0,o.useRef)({mapLib:null,map:null});(0,o.useEffect)((()=>{const e=t.mapLib;let o,r=!0;return Promise.resolve(e||n.e(842).then(n.t.bind(n,60842,19))).then((e=>{if(!r)return;if(!e)throw new Error("Invalid mapLib");const n="Map"in e?e:e.default;if(!n.Map)throw new Error("Invalid mapLib");if(function(t,e){for(const o of L)o in e&&(t[o]=e[o]);const{RTLTextPlugin:n="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"}=e;n&&t.getRTLTextPluginStatus&&"unavailable"===t.getRTLTextPluginStatus()&&t.setRTLTextPlugin(n,(t=>{t&&console.error(t)}),!0)}(n,t),n.supported&&!n.supported(t))throw new Error("Map is not supported by this browser");t.reuseMaps&&(o=v.reuse(t,c.current)),o||(o=new v(n.Map,t,c.current)),u.map=M(o),u.mapLib=n,i(o),s?.onMapMount(u.map,t.id)})).catch((e=>{const{onError:n}=t;n?n({type:"error",target:null,error:e}):console.error(e)})),()=>{r=!1,o&&(s?.onMapUnmount(t.id),t.reuseMaps?o.recycle():o.destroy())}}),[]),E((()=>{a&&a.setProps(t)})),(0,o.useImperativeHandle)(e,(()=>u.map),[a]);const l=(0,o.useMemo)((()=>({position:"relative",width:"100%",height:"100%",...t.style})),[t.style]);return o.createElement("div",{id:t.id,ref:c,style:l},a&&o.createElement(x.Provider,{value:u},o.createElement("div",{"mapboxgl-children":"",style:{height:"100%"}},t.children)))}));var w=n(40961);const P=/box|flex|grid|column|lineHeight|fontWeight|opacity|order|tabSize|zIndex/;function S(t,e){if(!t||!e)return;const n=t.style;for(const o in e){const t=e[o];Number.isFinite(t)&&!P.test(o)?n[o]=`${t}px`:n[o]=t}}(0,o.memo)((0,o.forwardRef)(((t,e)=>{const{map:n,mapLib:r}=(0,o.useContext)(x),s=(0,o.useRef)({props:t});s.current.props=t;const a=(0,o.useMemo)((()=>{let e=!1;o.Children.forEach(t.children,(t=>{t&&(e=!0)}));const n={...t,element:e?document.createElement("div"):null},i=new r.Marker(n);return i.setLngLat([t.longitude,t.latitude]),i.getElement().addEventListener("click",(t=>{s.current.props.onClick?.({type:"click",target:i,originalEvent:t})})),i.on("dragstart",(t=>{const e=t;e.lngLat=a.getLngLat(),s.current.props.onDragStart?.(e)})),i.on("drag",(t=>{const e=t;e.lngLat=a.getLngLat(),s.current.props.onDrag?.(e)})),i.on("dragend",(t=>{const e=t;e.lngLat=a.getLngLat(),s.current.props.onDragEnd?.(e)})),i}),[]);(0,o.useEffect)((()=>(a.addTo(n.getMap()),()=>{a.remove()})),[]);const{longitude:i,latitude:c,offset:u,style:l,draggable:p=!1,popup:d=null,rotation:f=0,rotationAlignment:m="auto",pitchAlignment:h="auto"}=t;return(0,o.useEffect)((()=>{S(a.getElement(),l)}),[l]),(0,o.useImperativeHandle)(e,(()=>a),[]),a.getLngLat().lng===i&&a.getLngLat().lat===c||a.setLngLat([i,c]),u&&!function(t,e){const n=Array.isArray(t)?t[0]:t?t.x:0,o=Array.isArray(t)?t[1]:t?t.y:0,r=Array.isArray(e)?e[0]:e?e.x:0,s=Array.isArray(e)?e[1]:e?e.y:0;return n===r&&o===s}(a.getOffset(),u)&&a.setOffset(u),a.isDraggable()!==p&&a.setDraggable(p),a.getRotation()!==f&&a.setRotation(f),a.getRotationAlignment()!==m&&a.setRotationAlignment(m),a.getPitchAlignment()!==h&&a.setPitchAlignment(h),a.getPopup()!==d&&a.setPopup(d),(0,w.createPortal)(t.children,a.getElement())})));function R(t){return new Set(t?t.trim().split(/\s+/):[])}(0,o.memo)((0,o.forwardRef)(((t,e)=>{const{map:n,mapLib:r}=(0,o.useContext)(x),a=(0,o.useMemo)((()=>document.createElement("div")),[]),i=(0,o.useRef)({props:t});i.current.props=t;const c=(0,o.useMemo)((()=>{const e={...t},n=new r.Popup(e);return n.setLngLat([t.longitude,t.latitude]),n.once("open",(t=>{i.current.props.onOpen?.(t)})),n}),[]);if((0,o.useEffect)((()=>{const t=t=>{i.current.props.onClose?.(t)};return c.on("close",t),c.setDOMContent(a).addTo(n.getMap()),()=>{c.off("close",t),c.isOpen()&&c.remove()}}),[]),(0,o.useEffect)((()=>{S(c.getElement(),t.style)}),[t.style]),(0,o.useImperativeHandle)(e,(()=>c),[]),c.isOpen()&&(c.getLngLat().lng===t.longitude&&c.getLngLat().lat===t.latitude||c.setLngLat([t.longitude,t.latitude]),t.offset&&!s(c.options.offset,t.offset)&&c.setOffset(t.offset),c.options.anchor===t.anchor&&c.options.maxWidth===t.maxWidth||(c.options.anchor=t.anchor,c.setMaxWidth(t.maxWidth)),c.options.className!==t.className)){const e=R(c.options.className),n=R(t.className);for(const t of e)n.has(t)||c.removeClassName(t);for(const t of n)e.has(t)||c.addClassName(t);c.options.className=t.className}return(0,w.createPortal)(t.children,a)})));function T(t,e,n,r){const s=(0,o.useContext)(x),a=(0,o.useMemo)((()=>t(s)),[]);return(0,o.useEffect)((()=>{const t=r||n||e,o="function"==typeof e&&"function"==typeof n?e:null,i="function"==typeof n?n:"function"==typeof e?e:null,{map:c}=s;return c.hasControl(a)||(c.addControl(a,t?.position),o&&o(s)),()=>{i&&i(s),c.hasControl(a)&&c.removeControl(a)}}),[]),a}(0,o.memo)((function(t){const e=T((({mapLib:e})=>new e.AttributionControl(t)),{position:t.position});return(0,o.useEffect)((()=>{S(e._container,t.style)}),[t.style]),null}));(0,o.memo)((function(t){const e=T((({mapLib:e})=>new e.FullscreenControl({container:t.containerId&&document.getElementById(t.containerId)})),{position:t.position});return(0,o.useEffect)((()=>{S(e._controlContainer,t.style)}),[t.style]),null}));(0,o.memo)((0,o.forwardRef)((function(t,e){const n=(0,o.useRef)({props:t}),r=T((({mapLib:e})=>{const o=new e.GeolocateControl(t),r=o._setupUI.bind(o);return o._setupUI=t=>{o._container.hasChildNodes()||r(t)},o.on("geolocate",(t=>{n.current.props.onGeolocate?.(t)})),o.on("error",(t=>{n.current.props.onError?.(t)})),o.on("outofmaxbounds",(t=>{n.current.props.onOutOfMaxBounds?.(t)})),o.on("trackuserlocationstart",(t=>{n.current.props.onTrackUserLocationStart?.(t)})),o.on("trackuserlocationend",(t=>{n.current.props.onTrackUserLocationEnd?.(t)})),o}),{position:t.position});return n.current.props=t,(0,o.useImperativeHandle)(e,(()=>r),[]),(0,o.useEffect)((()=>{S(r._container,t.style)}),[t.style]),null})));const z=(0,o.memo)((function(t){const e=T((({mapLib:e})=>new e.NavigationControl(t)),{position:t.position});return(0,o.useEffect)((()=>{S(e._container,t.style)}),[t.style]),null}));(0,o.memo)((function(t){const e=T((({mapLib:e})=>new e.ScaleControl(t)),{position:t.position}),n=(0,o.useRef)(t),r=n.current;n.current=t;const{style:s}=t;return void 0!==t.maxWidth&&t.maxWidth!==r.maxWidth&&(e.options.maxWidth=t.maxWidth),void 0!==t.unit&&t.unit!==r.unit&&e.setUnit(t.unit),(0,o.useEffect)((()=>{S(e._container,s)}),[s]),null}));function k(t,e){if(!t)throw new Error(e)}let A=0;function I(t){const e=(0,o.useContext)(x).map.getMap(),n=(0,o.useRef)(t),[,r]=(0,o.useState)(0),a=(0,o.useMemo)((()=>t.id||"jsx-layer-"+A++),[]);(0,o.useEffect)((()=>{if(e){const t=()=>r((t=>t+1));return e.on("styledata",t),t(),()=>{e.off("styledata",t),e.style&&e.style._loaded&&e.getLayer(a)&&e.removeLayer(a)}}}),[e]);if(e&&e.style&&e.getLayer(a))try{!function(t,e,n,o){if(k(n.id===o.id,"layer id changed"),k(n.type===o.type,"layer type changed"),"custom"===n.type||"custom"===o.type)return;const{layout:r={},paint:a={},filter:i,minzoom:c,maxzoom:u,beforeId:l}=n;if(l!==o.beforeId&&t.moveLayer(e,l),r!==o.layout){const n=o.layout||{};for(const o in r)s(r[o],n[o])||t.setLayoutProperty(e,o,r[o]);for(const o in n)r.hasOwnProperty(o)||t.setLayoutProperty(e,o,void 0)}if(a!==o.paint){const n=o.paint||{};for(const o in a)s(a[o],n[o])||t.setPaintProperty(e,o,a[o]);for(const o in n)a.hasOwnProperty(o)||t.setPaintProperty(e,o,void 0)}s(i,o.filter)||t.setFilter(e,i),c===o.minzoom&&u===o.maxzoom||t.setLayerZoomRange(e,c,u)}(e,a,t,n.current)}catch(i){console.warn(i)}else!function(t,e,n){if(t.style&&t.style._loaded&&(!("source"in n)||t.getSource(n.source))){const o={...n,id:e};delete o.beforeId,t.addLayer(o,n.beforeId)}}(e,a,t);return n.current=t,null}}}]);
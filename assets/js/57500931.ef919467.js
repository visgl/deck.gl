"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([[1713],{62811:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>i,metadata:()=>r,toc:()=>p});const r=JSON.parse('{"id":"api-reference/mapbox/mapbox-overlay","title":"MapboxOverlay","description":"MapboxOverlay is an implementation of Mapbox GL JS\'s IControl API. When adding a MapboxOverlay control to an mapbox map, deck.gl layers are rendered in synchronization with the base map layers. This control supports both overlaid and interleaved rendering modes.","source":"@site/../docs/api-reference/mapbox/mapbox-overlay.md","sourceDirName":"api-reference/mapbox","slug":"/api-reference/mapbox/mapbox-overlay","permalink":"/docs/api-reference/mapbox/mapbox-overlay","draft":false,"unlisted":false,"editUrl":"https://github.com/visgl/deck.gl/tree/master/website/../docs/api-reference/mapbox/mapbox-overlay.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"@deck.gl/mapbox","permalink":"/docs/api-reference/mapbox/overview"},"next":{"title":"@deck.gl/react","permalink":"/docs/api-reference/react/overview"}}');var t=a(74848),l=a(28453),s=a(11470),o=a(19365);const i={},c="MapboxOverlay",d={},p=[{value:"Example",id:"example",level:2},{value:"Constructor",id:"constructor",level:2},{value:"Methods",id:"methods",level:2},{value:"setProps",id:"setprops",level:5},{value:"pickObject",id:"pickobject",level:5},{value:"pickObjects",id:"pickobjects",level:5},{value:"pickMultipleObjects",id:"pickmultipleobjects",level:5},{value:"finalize",id:"finalize",level:5},{value:"getCanvas",id:"getcanvas",level:5},{value:"Remarks",id:"remarks",level:2},{value:"Multi-view usage",id:"multi-view-usage",level:3}];function u(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h5:"h5",header:"header",li:"li",p:"p",pre:"pre",ul:"ul",...(0,l.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"mapboxoverlay",children:"MapboxOverlay"})}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"MapboxOverlay"})," is an implementation of ",(0,t.jsx)(n.a,{href:"https://www.npmjs.com/package/mapbox-gl",children:"Mapbox GL JS"}),"'s ",(0,t.jsx)(n.a,{href:"https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol",children:"IControl"})," API. When adding a ",(0,t.jsx)(n.code,{children:"MapboxOverlay"})," control to an mapbox map, deck.gl layers are rendered in synchronization with the base map layers. This control supports both ",(0,t.jsx)(n.a,{href:"/docs/get-started/using-with-map",children:"overlaid and interleaved"})," rendering modes."]}),"\n",(0,t.jsx)(n.h2,{id:"example",children:"Example"}),"\n","\n",(0,t.jsxs)(s.A,{groupId:"language",children:[(0,t.jsx)(o.A,{value:"ts",label:"TypeScript",children:(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {MapboxOverlay} from '@deck.gl/mapbox';\nimport {ScatterplotLayer} from '@deck.gl/layers';\nimport mapboxgl from 'mapbox-gl';\nimport 'mapbox-gl/dist/mapbox-gl.css';\n\nconst map = new mapboxgl.Map({\n  container: 'map',\n  style: 'mapbox://styles/mapbox/light-v9',\n  accessToken: '<mapbox_access_token>',\n  center: [0.45, 51.47],\n  zoom: 11\n});\n\nmap.once('load', () => {\n  const deckOverlay = new MapboxOverlay({\n    interleaved: true,\n    layers: [\n      new ScatterplotLayer({\n        id: 'deckgl-circle',\n        data: [\n          {position: [0.45, 51.47]}\n        ],\n        getPosition: d => d.position,\n        getFillColor: [255, 0, 0, 100],\n        getRadius: 1000,\n        beforeId: 'waterway-label' // In interleaved mode render the layer under map labels. Replace with `slot: 'bottom'` if using Mapbox v3 Standard Style.\n      })\n    ]\n  });\n\n  map.addControl(deckOverlay);\n});\n"})})}),(0,t.jsxs)(o.A,{value:"react",label:"React",children:[(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-tsx",children:"import React from 'react';\nimport {Map, useControl} from 'react-map-gl';\nimport {MapboxOverlay} from '@deck.gl/mapbox';\nimport {DeckProps} from '@deck.gl/core';\nimport {ScatterplotLayer} from '@deck.gl/layers';\nimport 'mapbox-gl/dist/mapbox-gl.css';\n\nfunction DeckGLOverlay(props: DeckProps) {\n  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));\n  overlay.setProps(props);\n  return null;\n}\n\nfunction App() {\n  const layers: [\n    new ScatterplotLayer({\n      id: 'deckgl-circle',\n      data: [\n        {position: [0.45, 51.47]}\n      ],\n      getPosition: d => d.position,\n      getFillColor: [255, 0, 0, 100],\n      getRadius: 1000,\n      beforeId: 'waterway-label' // In interleaved mode render the layer under map labels. Replace with `slot: 'bottom'` if using Mapbox v3 Standard Style.\n    })\n  ];\n\n  return (\n    <Map\n      initialViewState={{\n        longitude: 0.45,\n        latitude: 51.47,\n        zoom: 11\n      }}\n      mapStyle=\"mapbox://styles/mapbox/light-v9\"\n      mapboxAccessToken=\"<mapbox_access_token>\"\n    >\n      <DeckGLOverlay layers={layers} interleaved />\n    </Map>\n  );\n}\n"})}),(0,t.jsxs)(n.p,{children:["See react-map-gl's ",(0,t.jsx)(n.a,{href:"https://visgl.github.io/react-map-gl/docs/api-reference/use-control",children:"useControl"})," hook."]})]})]}),"\n",(0,t.jsx)(n.h2,{id:"constructor",children:"Constructor"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {MapboxOverlay} from '@deck.gl/mapbox';\nimport type {MapboxOverlayProps} from '@deck.gl/mapbox';\n\nnew MapboxOverlay(props: MapboxOverlayProps);\n"})}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.code,{children:"MapboxOverlay"})," accepts the same props as the ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck",children:"Deck"})," class, with the following exceptions:"]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"views"})," - multi-view support is limited. There is only one ",(0,t.jsx)(n.code,{children:"MapView"})," that can synchronize with the base map. See the ",(0,t.jsx)(n.a,{href:"#multi-view-usage",children:"using with multi-views"})," section for details."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"parent"})," / ",(0,t.jsx)(n.code,{children:"canvas"})," / ",(0,t.jsx)(n.code,{children:"device"})," - context creation is managed internally."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"viewState"})," / ",(0,t.jsx)(n.code,{children:"initialViewState"})," - camera state is managed internally."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"controller"})," - always disabled (to use Mapbox's interaction handlers)."]}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"The constructor additionally accepts the following option:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"interleaved"})," (boolean) - If ",(0,t.jsx)(n.code,{children:"false"}),", a dedicated deck.gl canvas is added on top of the base map. If ",(0,t.jsx)(n.code,{children:"true"}),", deck.gl layers are inserted into mapbox-gl's layer stack, and share the same ",(0,t.jsx)(n.code,{children:"WebGL2RenderingContext"})," as the base map. Default is ",(0,t.jsx)(n.code,{children:"false"}),". Note that interleaving with basemaps such as mapbox-gl-js v1 that only support WebGL 1 is not supported, see ",(0,t.jsx)(n.a,{href:"./overview#interleaved-renderer-compatibility",children:"compatibility"}),"."]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["When using ",(0,t.jsx)(n.code,{children:"interleaved: true"}),", you may control the ordering of layers in the Mapbox/MapLibre stack by optionally add a ",(0,t.jsx)(n.code,{children:"beforeId"})," prop to a layer. If multiple deck.gl layers have the same ",(0,t.jsx)(n.code,{children:"beforeId"}),", they are rendered in the order that is passed into the ",(0,t.jsx)(n.code,{children:"layers"})," array. If used with Mapbox v3 Standard Style, supply a ",(0,t.jsx)(n.a,{href:"https://docs.mapbox.com/mapbox-gl-js/guides/migrate/#layer-slots",children:"slot"})," prop to layers instead."]}),"\n",(0,t.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,t.jsx)(n.h5,{id:"setprops",children:"setProps"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"const overlay = new MapboxOverlay({\n  interleaved: true,\n  layers: []\n});\n\nmap.addControl(overlay);\n\n// Update layers\noverlay.setProps({\n  layers: [new ScatterplotLayer({...})]\n})\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Updates (partial) props of the underlying ",(0,t.jsx)(n.code,{children:"Deck"})," instance. See ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck#setprops",children:"Deck.setProps"}),"."]}),"\n",(0,t.jsx)(n.h5,{id:"pickobject",children:"pickObject"}),"\n",(0,t.jsxs)(n.p,{children:["See ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck#pickobject",children:"Deck.pickObject"}),"."]}),"\n",(0,t.jsx)(n.h5,{id:"pickobjects",children:"pickObjects"}),"\n",(0,t.jsxs)(n.p,{children:["See ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck#pickobjects",children:"Deck.pickObjects"}),"."]}),"\n",(0,t.jsx)(n.h5,{id:"pickmultipleobjects",children:"pickMultipleObjects"}),"\n",(0,t.jsxs)(n.p,{children:["See ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck#pickmultipleobjects",children:"Deck.pickMultipleObjects"}),"."]}),"\n",(0,t.jsx)(n.h5,{id:"finalize",children:"finalize"}),"\n",(0,t.jsx)(n.p,{children:"Removes the control and deletes all resources."}),"\n",(0,t.jsx)(n.h5,{id:"getcanvas",children:"getCanvas"}),"\n",(0,t.jsxs)(n.p,{children:["See ",(0,t.jsx)(n.a,{href:"/docs/api-reference/core/deck#getcanvas",children:"Deck.getCanvas"}),". When using ",(0,t.jsx)(n.code,{children:"interleaved: true"}),", returns the base map's ",(0,t.jsx)(n.code,{children:"canvas"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"remarks",children:"Remarks"}),"\n",(0,t.jsx)(n.h3,{id:"multi-view-usage",children:"Multi-view usage"}),"\n",(0,t.jsxs)(n.p,{children:["When using ",(0,t.jsx)(n.code,{children:"MapboxOverlay"})," with multiple views passed to the ",(0,t.jsx)(n.code,{children:"views"})," prop, only one of the views can match the base map and receive interaction."]}),"\n",(0,t.jsxs)(n.p,{children:["With that said, it is still possible to take advantage of deck's multi-view system and render a mapbox base map onto any one MapView of your choice by setting the ",(0,t.jsx)(n.code,{children:"views"})," array and a ",(0,t.jsx)(n.code,{children:"layerFilter"})," callback."]}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["To use multiple views, define a ",(0,t.jsx)(n.code,{children:"MapView"})," with the id ",(0,t.jsx)(n.code,{children:"\u201cmapbox\u201d"}),". This view will receive the state that matches the base map at each render."]}),"\n",(0,t.jsxs)(n.li,{children:["If views are provided but the array does not contain this id, then a ",(0,t.jsx)(n.code,{children:"MapView({id: 'mapbox'})"})," will be inserted at the bottom of the stack."]}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",children:"import {MapboxOverlay} from '@deck.gl/mapbox';\nimport {Deck, MapView, OrthographicView} from '@deck.gl/core';\nimport {ScatterplotLayer} from '@deck.gl/layers';\n\nconst map = new mapboxgl.Map({...});\n\nconst overlay = new MapboxOverlay({\n  views: [\n    // This view will be synchronized with the base map\n    new MapView({id: 'mapbox'}),\n    // This view will not be interactive\n    new OrthographicView({id: 'widget'})\n  ],\n  layerFilter: ({layer, viewport}) => {\n    const shouldDrawInWidget = layer.id.startsWith('widget');\n    if (viewport.id === 'widget') return shouldDrawInWidget;\n    return !shouldDrawInWidget;\n  },\n  layers: [\n    new ScatterplotLayer({\n      id: 'my-scatterplot',\n      data: [\n        {position: [-74.5, 40], size: 100}\n      ],\n      getPosition: d => d.position,\n      getRadius: d => d.size,\n      getFillColor: [255, 0, 0]\n    }),\n    new ScatterplotLayer({\n      id: 'widget-scatterplot',\n      data: [\n        {position: [0, 0], size: 100}\n      ],\n      getPosition: d => d.position,\n      getRadius: d => d.size,\n      getFillColor: [255, 0, 0]\n    })\n  ]\n});\n\nmap.addControl(overlay);\n"})})]})}function h(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(u,{...e})}):u(e)}},19365:(e,n,a)=>{a.d(n,{A:()=>s});a(96540);var r=a(34164);const t={tabItem:"tabItem_Ymn6"};var l=a(74848);function s(e){let{children:n,hidden:a,className:s}=e;return(0,l.jsx)("div",{role:"tabpanel",className:(0,r.A)(t.tabItem,s),hidden:a,children:n})}},11470:(e,n,a)=>{a.d(n,{A:()=>w});var r=a(96540),t=a(34164),l=a(23104),s=a(56347),o=a(205),i=a(57485),c=a(31682),d=a(70679);function p(e){var n,a;return null!=(n=null==(a=r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})))?void 0:a.filter(Boolean))?n:[]}function u(e){const{values:n,children:a}=e;return(0,r.useMemo)((()=>{const e=null!=n?n:function(e){return p(e).map((e=>{let{props:{value:n,label:a,attributes:r,default:t}}=e;return{value:n,label:a,attributes:r,default:t}}))}(a);return function(e){const n=(0,c.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error('Docusaurus error: Duplicate values "'+n.map((e=>e.value)).join(", ")+'" found in <Tabs>. Every value needs to be unique.')}(e),e}),[n,a])}function h(e){let{value:n,tabValues:a}=e;return a.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:a}=e;const t=(0,s.W6)(),l=function(e){let{queryString:n=!1,groupId:a}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!a)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return null!=a?a:null}({queryString:n,groupId:a});return[(0,i.aZ)(l),(0,r.useCallback)((e=>{if(!l)return;const n=new URLSearchParams(t.location.search);n.set(l,e),t.replace(Object.assign({},t.location,{search:n.toString()}))}),[l,t])]}function b(e){const{defaultValue:n,queryString:a=!1,groupId:t}=e,l=u(e),[s,i]=(0,r.useState)((()=>function(e){var n;let{defaultValue:a,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(a){if(!h({value:a,tabValues:r}))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+a+'" but none of its children has the corresponding value. Available values are: '+r.map((e=>e.value)).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");return a}const t=null!=(n=r.find((e=>e.default)))?n:r[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:n,tabValues:l}))),[c,p]=m({queryString:a,groupId:t}),[b,x]=function(e){let{groupId:n}=e;const a=function(e){return e?"docusaurus.tab."+e:null}(n),[t,l]=(0,d.Dv)(a);return[t,(0,r.useCallback)((e=>{a&&l.set(e)}),[a,l])]}({groupId:t}),v=(()=>{const e=null!=c?c:b;return h({value:e,tabValues:l})?e:null})();(0,o.A)((()=>{v&&i(v)}),[v]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!h({value:e,tabValues:l}))throw new Error("Can't select invalid tab value="+e);i(e),p(e),x(e)}),[p,x,l]),tabValues:l}}var x=a(92303);const v={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var g=a(74848);function f(e){let{className:n,block:a,selectedValue:r,selectValue:s,tabValues:o}=e;const i=[],{blockElementScrollPositionUntilNextRender:c}=(0,l.a_)(),d=e=>{const n=e.currentTarget,a=i.indexOf(n),t=o[a].value;t!==r&&(c(n),s(t))},p=e=>{var n;let a=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{var r;const n=i.indexOf(e.currentTarget)+1;a=null!=(r=i[n])?r:i[0];break}case"ArrowLeft":{var t;const n=i.indexOf(e.currentTarget)-1;a=null!=(t=i[n])?t:i[i.length-1];break}}null==(n=a)||n.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,t.A)("tabs",{"tabs--block":a},n),children:o.map((e=>{let{value:n,label:a,attributes:l}=e;return(0,g.jsx)("li",Object.assign({role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>i.push(e),onKeyDown:p,onClick:d},l,{className:(0,t.A)("tabs__item",v.tabItem,null==l?void 0:l.className,{"tabs__item--active":r===n}),children:null!=a?a:n}),n)}))})}function y(e){let{lazy:n,children:a,selectedValue:l}=e;const s=(Array.isArray(a)?a:[a]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===l));return e?(0,r.cloneElement)(e,{className:(0,t.A)("margin-top--md",e.props.className)}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==l})))})}function j(e){const n=b(e);return(0,g.jsxs)("div",{className:(0,t.A)("tabs-container",v.tabList),children:[(0,g.jsx)(f,Object.assign({},n,e)),(0,g.jsx)(y,Object.assign({},n,e))]})}function w(e){const n=(0,x.A)();return(0,g.jsx)(j,Object.assign({},e,{children:p(e.children)}),String(n))}},28453:(e,n,a)=>{a.d(n,{R:()=>s,x:()=>o});var r=a(96540);const t={},l=r.createContext(t);function s(e){const n=r.useContext(l);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:s(e.components),r.createElement(l.Provider,{value:n},e.children)}}}]);
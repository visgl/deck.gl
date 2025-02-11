"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([[8935],{25337:(i,t,e)=>{e.d(t,{V:()=>o});var n=e(4500);class o{id;topology;vertexCount;indices;attributes;userData={};constructor(i){const{attributes:t={},indices:e=null,vertexCount:o=null}=i;this.id=i.id||(0,n.L)("geometry"),this.topology=i.topology,e&&(this.indices=ArrayBuffer.isView(e)?{value:e,size:1}:e),this.attributes={};for(const[n,r]of Object.entries(t)){const i=ArrayBuffer.isView(r)?{value:r}:r;if(!ArrayBuffer.isView(i.value))throw new Error(`${this._print(n)}: must be typed array or object with value as typed array`);if("POSITION"!==n&&"positions"!==n||i.size||(i.size=3),"indices"===n){if(this.indices)throw new Error("Multiple indices detected");this.indices=i}else this.attributes[n]=i}this.indices&&void 0!==this.indices.isIndexed&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=o||this._calculateVertexCount(this.attributes,this.indices)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(i){return`Geometry ${this.id} attribute ${i}`}_setAttributes(i,t){return this}_calculateVertexCount(i,t){if(t)return t.value.length;let e=1/0;for(const n of Object.values(i)){const{value:i,size:t,constant:o}=n;!o&&i&&void 0!==t&&t>=1&&(e=Math.min(e,i.length/t))}return e}}},49042:(i,t,e)=>{e.d(t,{q:()=>n});const n={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useFloatColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useFloatColors:!0,highlightedObjectColor:[0,0,0],highlightColor:[0,1,1,1]},vs:"uniform pickingUniforms {\n  float isActive;\n  float isAttribute;\n  float isHighlightActive;\n  float useFloatColors;\n  vec3 highlightedObjectColor;\n  vec4 highlightColor;\n} picking;\n\nout vec4 picking_vRGBcolor_Avalid;\n\n// Normalize unsigned byte color to 0-1 range\nvec3 picking_normalizeColor(vec3 color) {\n  return picking.useFloatColors > 0.5 ? color : color / 255.0;\n}\n\n// Normalize unsigned byte color to 0-1 range\nvec4 picking_normalizeColor(vec4 color) {\n  return picking.useFloatColors > 0.5 ? color : color / 255.0;\n}\n\nbool picking_isColorZero(vec3 color) {\n  return dot(color, vec3(1.0)) < 0.00001;\n}\n\nbool picking_isColorValid(vec3 color) {\n  return dot(color, vec3(1.0)) > 0.00001;\n}\n\n// Check if this vertex is highlighted \nbool isVertexHighlighted(vec3 vertexColor) {\n  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);\n  return\n    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));\n}\n\n// Set the current picking color\nvoid picking_setPickingColor(vec3 pickingColor) {\n  pickingColor = picking_normalizeColor(pickingColor);\n\n  if (bool(picking.isActive)) {\n    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable\n    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));\n\n    if (!bool(picking.isAttribute)) {\n      // Stores the picking color so that the fragment shader can render it during picking\n      picking_vRGBcolor_Avalid.rgb = pickingColor;\n    }\n  } else {\n    // Do the comparison with selected item color in vertex shader as it should mean fewer compares\n    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));\n  }\n}\n\nvoid picking_setPickingAttribute(float value) {\n  if (bool(picking.isAttribute)) {\n    picking_vRGBcolor_Avalid.r = value;\n  }\n}\n\nvoid picking_setPickingAttribute(vec2 value) {\n  if (bool(picking.isAttribute)) {\n    picking_vRGBcolor_Avalid.rg = value;\n  }\n}\n\nvoid picking_setPickingAttribute(vec3 value) {\n  if (bool(picking.isAttribute)) {\n    picking_vRGBcolor_Avalid.rgb = value;\n  }\n}\n",fs:"uniform pickingUniforms {\n  float isActive;\n  float isAttribute;\n  float isHighlightActive;\n  float useFloatColors;\n  vec3 highlightedObjectColor;\n  vec4 highlightColor;\n} picking;\n\nin vec4 picking_vRGBcolor_Avalid;\n\n/*\n * Returns highlight color if this item is selected.\n */\nvec4 picking_filterHighlightColor(vec4 color) {\n  // If we are still picking, we don't highlight\n  if (picking.isActive > 0.5) {\n    return color;\n  }\n\n  bool selected = bool(picking_vRGBcolor_Avalid.a);\n\n  if (selected) {\n    // Blend in highlight color based on its alpha value\n    float highLightAlpha = picking.highlightColor.a;\n    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);\n    float highLightRatio = highLightAlpha / blendedAlpha;\n\n    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);\n    return vec4(blendedRGB, blendedAlpha);\n  } else {\n    return color;\n  }\n}\n\n/*\n * Returns picking color if picking enabled else unmodified argument.\n */\nvec4 picking_filterPickingColor(vec4 color) {\n  if (bool(picking.isActive)) {\n    if (picking_vRGBcolor_Avalid.a == 0.0) {\n      discard;\n    }\n    return picking_vRGBcolor_Avalid;\n  }\n  return color;\n}\n\n/*\n * Returns picking color if picking is enabled if not\n * highlight color if this item is selected, otherwise unmodified argument.\n */\nvec4 picking_filterColor(vec4 color) {\n  vec4 highlightColor = picking_filterHighlightColor(color);\n  return picking_filterPickingColor(highlightColor);\n}\n",getUniforms:function(i={},t){const e={};if(void 0===i.highlightedObjectColor);else if(null===i.highlightedObjectColor)e.isHighlightActive=!1;else{e.isHighlightActive=!0;const t=i.highlightedObjectColor.slice(0,3);e.highlightedObjectColor=t}if(i.highlightColor){const t=Array.from(i.highlightColor,(i=>i/255));Number.isFinite(t[3])||(t[3]=1),e.highlightColor=t}void 0!==i.isActive&&(e.isActive=Boolean(i.isActive),e.isAttribute=Boolean(i.isAttribute));void 0!==i.useFloatColors&&(e.useFloatColors=Boolean(i.useFloatColors));return e}}},75228:(i,t,e)=>{e.d(t,{A:()=>o});const n=1e20;class o{constructor({fontSize:i=24,buffer:t=3,radius:e=8,cutoff:n=.25,fontFamily:o="sans-serif",fontWeight:r="normal",fontStyle:l="normal"}={}){this.buffer=t,this.cutoff=n,this.radius=e;const c=this.size=i+4*t,s=this._createCanvas(c),h=this.ctx=s.getContext("2d",{willReadFrequently:!0});h.font=`${l} ${r} ${i}px ${o}`,h.textBaseline="alphabetic",h.textAlign="left",h.fillStyle="black",this.gridOuter=new Float64Array(c*c),this.gridInner=new Float64Array(c*c),this.f=new Float64Array(c),this.z=new Float64Array(c+1),this.v=new Uint16Array(c)}_createCanvas(i){const t=document.createElement("canvas");return t.width=t.height=i,t}draw(i){const{width:t,actualBoundingBoxAscent:e,actualBoundingBoxDescent:o,actualBoundingBoxLeft:l,actualBoundingBoxRight:c}=this.ctx.measureText(i),s=Math.ceil(e),h=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(c-l))),a=Math.min(this.size-this.buffer,s+Math.ceil(o)),g=h+2*this.buffer,u=a+2*this.buffer,f=Math.max(g*u,0),d=new Uint8ClampedArray(f),p={data:d,width:g,height:u,glyphWidth:h,glyphHeight:a,glyphTop:s,glyphLeft:0,glyphAdvance:t};if(0===h||0===a)return p;const{ctx:v,buffer:b,gridInner:k,gridOuter:C}=this;v.clearRect(b,b,h,a),v.fillText(i,b,b+s);const A=v.getImageData(b,b,h,a);C.fill(n,0,f),k.fill(0,0,f);for(let r=0;r<a;r++)for(let i=0;i<h;i++){const t=A.data[4*(r*h+i)+3]/255;if(0===t)continue;const e=(r+b)*g+i+b;if(1===t)C[e]=0,k[e]=n;else{const i=.5-t;C[e]=i>0?i*i:0,k[e]=i<0?i*i:0}}r(C,0,0,g,u,g,this.f,this.v,this.z),r(k,b,b,h,a,g,this.f,this.v,this.z);for(let n=0;n<f;n++){const i=Math.sqrt(C[n])-Math.sqrt(k[n]);d[n]=Math.round(255-255*(i/this.radius+this.cutoff))}return p}}function r(i,t,e,n,o,r,c,s,h){for(let a=t;a<t+n;a++)l(i,e*r+a,r,o,c,s,h);for(let a=e;a<e+o;a++)l(i,a*r+t,1,n,c,s,h)}function l(i,t,e,o,r,l,c){l[0]=0,c[0]=-n,c[1]=n,r[0]=i[t];for(let s=1,h=0,a=0;s<o;s++){r[s]=i[t+s*e];const o=s*s;do{const i=l[h];a=(r[s]-r[i]+o-i*i)/(s-i)/2}while(a<=c[h]&&--h>-1);h++,l[h]=s,c[h]=a,c[h+1]=n}for(let n=0,s=0;n<o;n++){for(;c[s+1]<n;)s++;const o=l[s],h=n-o;i[t+n*e]=r[o]+h*h}}},28453:(i,t,e)=>{e.d(t,{R:()=>l,x:()=>c});var n=e(96540);const o={},r=n.createContext(o);function l(i){const t=n.useContext(r);return n.useMemo((function(){return"function"==typeof i?i(t):{...t,...i}}),[t,i])}function c(i){let t;return t=i.disableParentContext?"function"==typeof i.components?i.components(o):i.components||o:l(i.components),n.createElement(r.Provider,{value:t},i.children)}},66517:(i,t,e)=>{e.d(t,{A:()=>p});var n=e(6946),o=e(1631),r=e(2199);var l=e(3081),c=e(99065);function s(i){return Math.log(i)}function h(i){return Math.exp(i)}function a(i){return-Math.log(-i)}function g(i){return-Math.exp(-i)}function u(i){return isFinite(i)?+("1e"+i):i<0?0:i}function f(i){return(t,e)=>-i(-t,e)}function d(i){const t=i(s,h),e=t.domain;let l,c,d=10;function p(){return l=function(i){return i===Math.E?Math.log:10===i&&Math.log10||2===i&&Math.log2||(i=Math.log(i),t=>Math.log(t)/i)}(d),c=function(i){return 10===i?u:i===Math.E?Math.exp:t=>Math.pow(i,t)}(d),e()[0]<0?(l=f(l),c=f(c),i(a,g)):i(s,h),t}return t.base=function(i){return arguments.length?(d=+i,p()):d},t.domain=function(i){return arguments.length?(e(i),p()):e()},t.ticks=i=>{const t=e();let o=t[0],r=t[t.length-1];const s=r<o;s&&([o,r]=[r,o]);let h,a,g=l(o),u=l(r);const f=null==i?10:+i;let p=[];if(!(d%1)&&u-g<f){if(g=Math.floor(g),u=Math.ceil(u),o>0){for(;g<=u;++g)for(h=1;h<d;++h)if(a=g<0?h/c(-g):h*c(g),!(a<o)){if(a>r)break;p.push(a)}}else for(;g<=u;++g)for(h=d-1;h>=1;--h)if(a=g>0?h/c(-g):h*c(g),!(a<o)){if(a>r)break;p.push(a)}2*p.length<f&&(p=(0,n.Ay)(o,r,f))}else p=(0,n.Ay)(g,u,Math.min(u-g,f)).map(c);return s?p.reverse():p},t.tickFormat=(i,e)=>{if(null==i&&(i=10),null==e&&(e=10===d?"s":","),"function"!=typeof e&&(d%1||null!=(e=(0,o.A)(e)).precision||(e.trim=!0),e=(0,r.GP)(e)),i===1/0)return e;const n=Math.max(1,d*i/t.ticks().length);return i=>{let t=i/c(Math.round(l(i)));return t*d<d-.5&&(t*=d),t<=n?e(i):""}},t.nice=()=>e(function(i,t){var e,n=0,o=(i=i.slice()).length-1,r=i[n],l=i[o];return l<r&&(e=n,n=o,o=e,e=r,r=l,l=e),i[n]=t.floor(r),i[o]=t.ceil(l),i}(e(),{floor:i=>c(Math.floor(l(i))),ceil:i=>c(Math.ceil(l(i)))})),t}function p(){const i=d((0,l.Gu)()).domain([1,10]);return i.copy=()=>(0,l.C)(i,p()).base(i.base()),c.C.apply(i,arguments),i}}}]);
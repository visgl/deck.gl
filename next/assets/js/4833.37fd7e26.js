"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["4833"],{2043(e,t,i){i.d(t,{H:()=>u});var r=i(26425),n=i(85065),s=i(51028),a=i(72908),o=i(6118);async function u(e,t,i,u){let l,f;Array.isArray(t)||(0,n.l)(t)?(l=t,f=i):(l=[],f=t);let h=(0,s.z)(f),c=e;if("string"==typeof e&&(c=await h(e)),(0,r.qf)(e)&&(c=await h(e)),"string"==typeof e){let t=(0,a.Rf)(f||{});t.core?.baseUrl||(f={...f,core:{...f?.core,baseUrl:e}})}return Array.isArray(l),await (0,o.q)(c,l,f)}},6118(e,t,i){i.d(t,{q:()=>X});var r=i(10611),n=i(26425),s=i(80155);class a{terminate(){}}var o=i(82117);let u=new Map;function l(e){let t=new Blob([e],{type:"application/javascript"});return URL.createObjectURL(t)}function f(e){return!!e&&!!(e instanceof ArrayBuffer||"u">typeof MessagePort&&e instanceof MessagePort||"u">typeof ImageBitmap&&e instanceof ImageBitmap||"u">typeof OffscreenCanvas&&e instanceof OffscreenCanvas)}let h=()=>{};class c{name;source;url;terminated=!1;worker;onMessage;onError;_loadableURL="";static isSupported(){return"u">typeof Worker&&s.Bd||!s.Bd}constructor(e){let{name:t,source:i,url:r}=e;(0,o.v)(i||r),this.name=t,this.source=i,this.url=r,this.onMessage=h,this.onError=e=>console.log(e),this.worker=s.Bd?this._createBrowserWorker():this._createNodeWorker()}destroy(){this.onMessage=h,this.onError=h,this.worker.terminate(),this.terminated=!0}get isRunning(){return!!this.onMessage}postMessage(e,t){t=t||function e(t,i=!0,r){let n=r||new Set;if(t){if(f(t))n.add(t);else if(f(t.buffer))n.add(t.buffer);else if(ArrayBuffer.isView(t));else if(i&&"object"==typeof t)for(let r in t)e(t[r],i,n)}return void 0===r?Array.from(n):[]}(e),this.worker.postMessage(e,t)}_getErrorFromErrorEvent(e){let t="Failed to load ";return t+=`worker ${this.name} from ${this.url}. `,e.message&&(t+=`${e.message} in `),e.lineno&&(t+=`:${e.lineno}:${e.colno}`),Error(t)}_createBrowserWorker(){var e,t,i;let r;this._loadableURL=(e={source:this.source,url:this.url},(0,o.v)(e.source&&!e.url||!e.source&&e.url),(r=u.get(e.source||e.url))||(e.url&&(r=(t=e.url).startsWith("http")?l((i=t,`\
try {
  importScripts('${i}');
} catch (error) {
  console.error(error);
  throw error;
}`)):t,u.set(e.url,r)),e.source&&(r=l(e.source),u.set(e.source,r))),(0,o.v)(r),r);let n=new Worker(this._loadableURL,{name:this.name});return n.onmessage=e=>{e.data?this.onMessage(e.data):this.onError(Error("No data received"))},n.onerror=e=>{this.onError(this._getErrorFromErrorEvent(e)),this.terminated=!0},n.onmessageerror=e=>console.error(e),n}_createNodeWorker(){let e;if(this.url)e=new a(this.url.includes(":/")||this.url.startsWith("/")?this.url:`./${this.url}`,{eval:!1,type:this.url.endsWith(".ts")||this.url.endsWith(".mjs")?"module":"commonjs"});else if(this.source)e=new a(this.source,{eval:!0});else throw Error("no worker");return e.on("message",e=>{this.onMessage(e)}),e.on("error",e=>{this.onError(e)}),e.on("exit",e=>{}),e}}class d{name;workerThread;isRunning=!0;result;_resolve=()=>{};_reject=()=>{};constructor(e,t){this.name=e,this.workerThread=t,this.result=new Promise((e,t)=>{this._resolve=e,this._reject=t})}postMessage(e,t){this.workerThread.postMessage({source:"loaders.gl",type:e,payload:t})}done(e){(0,o.v)(this.isRunning),this.isRunning=!1,this._resolve(e)}error(e){(0,o.v)(this.isRunning),this.isRunning=!1,this._reject(e)}}class p{name="unnamed";source;url;maxConcurrency=1;maxMobileConcurrency=1;onDebug=()=>{};reuseWorkers=!0;props={};jobQueue=[];idleQueue=[];count=0;isDestroyed=!1;static isSupported(){return c.isSupported()}constructor(e){this.source=e.source,this.url=e.url,this.setProps(e)}destroy(){this.idleQueue.forEach(e=>e.destroy()),this.isDestroyed=!0}setProps(e){this.props={...this.props,...e},void 0!==e.name&&(this.name=e.name),void 0!==e.maxConcurrency&&(this.maxConcurrency=e.maxConcurrency),void 0!==e.maxMobileConcurrency&&(this.maxMobileConcurrency=e.maxMobileConcurrency),void 0!==e.reuseWorkers&&(this.reuseWorkers=e.reuseWorkers),void 0!==e.onDebug&&(this.onDebug=e.onDebug)}async startJob(e,t=(e,t,i)=>e.done(i),i=(e,t)=>e.error(t)){let r=new Promise(r=>(this.jobQueue.push({name:e,onMessage:t,onError:i,onStart:r}),this));return this._startQueuedJob(),await r}async _startQueuedJob(){if(!this.jobQueue.length)return;let e=this._getAvailableWorker();if(!e)return;let t=this.jobQueue.shift();if(t){this.onDebug({message:"Starting job",name:t.name,workerThread:e,backlog:this.jobQueue.length});let i=new d(t.name,e);e.onMessage=e=>t.onMessage(i,e.type,e.payload),e.onError=e=>t.onError(i,e),t.onStart(i);try{await i.result}catch(e){console.error(`Worker exception: ${e}`)}finally{this.returnWorkerToQueue(e)}}}returnWorkerToQueue(e){!s.Bd||this.isDestroyed||!this.reuseWorkers||this.count>this._getMaxConcurrency()?(e.destroy(),this.count--):this.idleQueue.push(e),this.isDestroyed||this._startQueuedJob()}_getAvailableWorker(){return this.idleQueue.length>0?this.idleQueue.shift()||null:this.count<this._getMaxConcurrency()?(this.count++,new c({name:`${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`,source:this.source,url:this.url})):null}_getMaxConcurrency(){return s.Fr?this.maxMobileConcurrency:this.maxConcurrency}}let g={maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:!0,onDebug:()=>{}};class m{props;workerPools=new Map;static _workerFarm;static isSupported(){return c.isSupported()}static getWorkerFarm(e={}){return m._workerFarm=m._workerFarm||new m({}),m._workerFarm.setProps(e),m._workerFarm}constructor(e){this.props={...g},this.setProps(e),this.workerPools=new Map}destroy(){for(let e of this.workerPools.values())e.destroy();this.workerPools=new Map}setProps(e){for(let t of(this.props={...this.props,...e},this.workerPools.values()))t.setProps(this._getWorkerPoolProps())}getWorkerPool(e){let{name:t,source:i,url:r}=e,n=this.workerPools.get(t);return n||((n=new p({name:t,source:i,url:r})).setProps(this._getWorkerPoolProps()),this.workerPools.set(t,n)),n}_getWorkerPoolProps(){return{maxConcurrency:this.props.maxConcurrency,maxMobileConcurrency:this.props.maxMobileConcurrency,reuseWorkers:this.props.reuseWorkers,onDebug:this.props.onDebug}}}async function b(e,t,i,r,n){let a=e.id,u=function(e,t={}){let i=t[e.id]||{},r=s.Bd?`${e.id}-worker.js`:`${e.id}-worker-node.js`,n=i.workerUrl;if(n||"compression"!==e.id||(n=t.workerUrl),"test"===(t._workerType||t?.core?._workerType)&&(n=s.Bd?`modules/${e.module}/dist/${r}`:`modules/${e.module}/src/workers/${e.id}-worker-node.ts`),!n){let t=e.version;"latest"===t&&(t="latest");let i=t?`@${t}`:"";n=`https://unpkg.com/@loaders.gl/${e.module}${i}/dist/${r}`}return(0,o.v)(n),n}(e,i),l=m.getWorkerFarm(i?.core).getWorkerPool({name:a,url:u});i=JSON.parse(JSON.stringify(i)),r=JSON.parse(JSON.stringify(r||{}));let f=await l.startJob("process-on-worker",_.bind(null,n));f.postMessage("process",{input:t,options:i,context:r});let h=await f.result;return await h.result}async function _(e,t,i,r){switch(i){case"done":t.done(r);break;case"error":t.error(Error(r.error));break;case"process":let{id:n,input:s,options:a}=r;try{let i=await e(s,a);t.postMessage("done",{id:n,result:i})}catch(i){let e=i instanceof Error?i.message:"unknown error";t.postMessage("error",{id:n,error:e})}break;default:console.warn(`parse-with-worker unknown message ${i}`)}}var y=i(58091),v=i(85065),w=i(72908),E=i(50933),x=i(12802);async function*S(e,t){let i=t?.chunkSize||1048576,r=0;for(;r<e.size;){let t=r+i,n=await e.slice(r,t).arrayBuffer();r=t,yield n}}var A=i(34280);function L(e,t){return A.Bd?B(e,t):T(e,t)}async function*B(e,t){let i,r=e.getReader();try{for(;;){let e=i||r.read();t?._streamReadAhead&&(i=r.read());let{done:n,value:s}=await e;if(n)return;yield(0,E.XA)(s)}}catch(e){r.releaseLock()}}async function*T(e,t){for await(let t of e)yield(0,E.XA)(t)}var P=i(26472);let $="Cannot convert supplied data type";async function M(e,t,i){if("string"==typeof e||(0,n.B1)(e)){var r=e;if(t.text&&"string"==typeof r)return r;if((0,E.Pe)(r)&&(r=r.buffer),(0,n.B1)(r)){let e=(0,E.Q_)(r);return t.text&&!t.binary?new TextDecoder("utf8").decode(e):(0,E.XA)(e)}throw Error($)}if((0,n.qf)(e)&&(e=await (0,P.wv)(e)),(0,n.Sv)(e))return await (0,P.Mz)(e),t.binary?await e.arrayBuffer():await e.text();if((0,n.H1)(e)&&(e=function(e,t){if("string"==typeof e)return function*(e,t){let i=t?.chunkSize||262144,r=0,n=new TextEncoder;for(;r<e.length;){let t=Math.min(e.length-r,i),s=e.slice(r,r+t);r+=t,yield(0,E.W$)(n.encode(s))}}(e,t);if(e instanceof ArrayBuffer)return function*(e,t={}){let{chunkSize:i=262144}=t,r=0;for(;r<e.byteLength;){let t=Math.min(e.byteLength-r,i),n=new ArrayBuffer(t),s=new Uint8Array(e,r,t);new Uint8Array(n).set(s),r+=t,yield n}}(e,t);if((0,n.qf)(e))return S(e,t);if((0,n.H1)(e))return L(e,t);if((0,n.Sv)(e)){let i=e.body;if(!i)throw Error("Readable stream not available on Response");return L(i,t)}throw Error("makeIterator")}(e,i)),(0,n.xZ)(e)||(0,n.Td)(e))return(0,x.cy)(e);throw Error($)}var O=i(51028),C=i(48003),k=i(1643),N=i(41272),I=i(83087),R=i(49988),U=i(4329),D=i(37563);let F=/\.([^.]+)$/;async function z(e,t=[],i,r){if(!G(e))return null;let s=(0,w.Rf)(i||{});if(s.core||={},e instanceof Response&&V(e)){let i=j(await e.clone().text(),t,{...s,core:{...s.core,nothrow:!0}},r);if(i)return i}let a=j(e,t,{...s,core:{...s.core,nothrow:!0}},r);if(a)return a;if((0,n.qf)(e)&&(a=j(e=await e.slice(0,10).arrayBuffer(),t,s,r)),!a&&e instanceof Response&&V(e)&&(a=j(await e.clone().text(),t,s,r)),!a&&!s.core.nothrow)throw Error(W(e));return a}function V(e){let t=(0,N.z4)(e);return!!(t&&(t.startsWith("text/")||"application/json"===t||t.endsWith("+json")))}function j(e,t=[],i,r){var n,s,a,o,u,l;let f,h,c,d,p,g,m;if(!G(e))return null;let b=(0,w.Rf)(i||{});if(b.core||={},t&&!Array.isArray(t))return(0,v.D)(t);let _=[];t&&(_=_.concat(t)),b.core.ignoreRegisteredLoaders||_.push(...(0,D.Ph)()),function(e){for(let t of e)(0,v.D)(t)}(_);let y=(n=e,s=_,a=b,o=r,f=(0,N.Al)(n),h=(0,N.z4)(n),c=(0,C.S3)(f)||o?.url,d=null,p="",a?.core?.mimeType&&(d=q(s,a?.core?.mimeType),p=`match forced by supplied MIME type ${a?.core?.mimeType}`),d=d||(u=s,(m=(g=(l=c)&&F.exec(l))&&g[1])?function(e,t){for(let i of(t=t.toLowerCase(),e))for(let e of i.extensions)if(e.toLowerCase()===t)return i;return null}(u,m):null),p=p||(d?`matched url ${c}`:""),d=d||q(s,h),p=p||(d?`matched MIME type ${h}`:""),d=d||function(e,t){if(!t)return null;for(let i of e)if("string"==typeof t){if(function(e,t){return t.testText?t.testText(e):(Array.isArray(t.tests)?t.tests:[t.tests]).some(t=>e.startsWith(t))}(t,i))return i}else if(ArrayBuffer.isView(t)){if(H(t.buffer,t.byteOffset,i))return i}else if(t instanceof ArrayBuffer&&H(t,0,i))return i;return null}(s,n),p=p||(d?`matched initial data ${Y(n)}`:""),a?.core?.fallbackMimeType&&(d=d||q(s,a?.core?.fallbackMimeType),p=p||(d?`matched fallback MIME type ${h}`:"")),p&&I.R.log(1,`selectLoader selected ${d?.name}: ${p}.`),d);if(!y&&!b.core.nothrow)throw Error(W(e));return y}function G(e){return!(e instanceof Response)||204!==e.status}function W(e){let t=(0,N.Al)(e),i=(0,N.z4)(e),r="No valid loader found (";r+=(t?`${k.iW(t)}, `:"no url provided, ")+`MIME type: ${i?`"${i}"`:"not provided"}, `;let n=e?Y(e):"";return r+((n?` first bytes: "${n}"`:"first bytes: not available")+")")}function q(e,t){for(let i of e)if(i.mimeTypes?.some(e=>(0,U.JQ)(t,e))||(0,U.JQ)(t,`application/x.${i.id}`))return i;return null}function H(e,t,i){return(Array.isArray(i.tests)?i.tests:[i.tests]).some(i=>(function(e,t,i){if((0,n.B1)(i))return(0,R.YV)(i,e,i.byteLength);switch(typeof i){case"function":return i((0,E.W$)(e));case"string":let r=Z(e,t,i.length);return i===r;default:return!1}})(e,t,i))}function Y(e,t=5){return"string"==typeof e?e.slice(0,t):ArrayBuffer.isView(e)?Z(e.buffer,e.byteOffset,t):e instanceof ArrayBuffer?Z(e,0,t):""}function Z(e,t,i){if(e.byteLength<t+i)return"";let r=new DataView(e),n="";for(let e=0;e<i;e++)n+=String.fromCharCode(r.getUint8(t+e));return n}async function X(e,t,i,r){!t||Array.isArray(t)||(0,v.l)(t)||(r=void 0,i=t,t=void 0),e=await e,i=i||{};let n=(0,N.Al)(e),s=function(e,t){let i;if(e&&!Array.isArray(e))return e;if(e&&(i=Array.isArray(e)?e:[e]),t&&t.loaders){let e=Array.isArray(t.loaders)?t.loaders:[t.loaders];i=i?[...i,...e]:e}return i&&i.length?i:void 0}(t,r),a=await z(e,s,i);if(!a)return null;let o=(0,w.a5)(i,a,s,n);return r=function(e,t,i){if(i)return i;let r={fetch:(0,O.z)(t,e),...e};if(r.url){let e=(0,C.S3)(r.url);r.baseUrl=e,r.queryString=(0,C.by)(r.url),r.filename=k.iW(e),r.baseUrl=k.pD(e)}return Array.isArray(r.loaders)||(r.loaders=null),r}({url:n,_parse:X,loaders:s},o,r||null),await K(a,e,o,r)}async function K(e,t,i,a){if(!function(e,t=y.x){(0,o.v)(e,"no worker provided");e.version}(e),i=(0,r.l)(e.options,i),(0,n.Sv)(t)){let{ok:e,redirected:i,status:r,statusText:n,type:s,url:o}=t;a.response={headers:Object.fromEntries(t.headers.entries()),ok:e,redirected:i,status:r,statusText:n,type:s,url:o}}if(t=await M(t,e,i),e.parseTextSync&&"string"==typeof t)return e.parseTextSync(t,i,a);if(function(e,t){if(!m.isSupported())return!1;let i=t?._nodeWorkers??t?.core?._nodeWorkers;if(!s.Bd&&!i)return!1;let r=t?.worker??t?.core?.worker;return!!(e.worker&&r)}(e,i))return await b(e,t,i,a,X);if(e.parseText&&"string"==typeof t)return await e.parseText(t,i,a);if(e.parse)return await e.parse(t,i,a);throw(0,o.v)(!e.parseSync),Error(`${e.id} loader - no parser found and worker is disabled`)}},37563(e,t,i){i.d(t,{Ph:()=>o,mk:()=>a});var r=i(85065),n=i(72908);let s=()=>{let e=(0,n.K2)();return e.loaderRegistry=e.loaderRegistry||[],e.loaderRegistry};function a(e){let t=s();for(let i of e=Array.isArray(e)?e:[e]){let e=(0,r.D)(i);t.find(t=>e===t)||t.unshift(e)}}function o(){return s()}},7910(e,t,i){i.d(t,{t2:()=>s});var r=i(34915),n=i(26472);async function s(e,t){if("string"==typeof e){var i;let n=(0,r.o1)(e);return!((i=n).startsWith("http:")||i.startsWith("https:"))&&!n.startsWith("data:")&&globalThis.loaders?.fetchNode?globalThis.loaders?.fetchNode(n,t):await fetch(n,t)}return await (0,n.wv)(e)}},51028(e,t,i){i.d(t,{z:()=>a});var r=i(26425),n=i(7910),s=i(72908);function a(e,t){let i=(0,s.pp)(),a=e||i,o=a.fetch??a.core?.fetch;return"function"==typeof o?o:(0,r.Gv)(o)?e=>(0,n.t2)(e,o):t?.fetch?t?.fetch:n.t2}},85065(e,t,i){i.d(t,{D:()=>s,l:()=>n});var r=i(86868);function n(e){return!!e&&(Array.isArray(e)&&(e=e[0]),Array.isArray(e?.extensions))}function s(e){let t;return(0,r.v)(e,"null loader"),(0,r.v)(n(e),"invalid loader"),Array.isArray(e)&&(t=e[1],e={...e=e[0],options:{...e.options,...t}}),(e?.parseTextSync||e?.parseText)&&(e.text=!0),e.text||(e.binary=!0),e}},72908(e,t,i){i.d(t,{a5:()=>p,Rf:()=>g,K2:()=>c,pp:()=>d});var r=i(26425),n=i(1643);let s=new(i(70486)).h({id:"loaders.gl"});class a{log(){return()=>{}}info(){return()=>{}}warn(){return()=>{}}error(){return()=>{}}}var o=i(34280);let u={core:{baseUrl:void 0,fetch:null,mimeType:void 0,fallbackMimeType:void 0,ignoreRegisteredLoaders:void 0,nothrow:!1,log:new class{console;constructor(){this.console=console}log(...e){return this.console.log.bind(this.console,...e)}info(...e){return this.console.info.bind(this.console,...e)}warn(...e){return this.console.warn.bind(this.console,...e)}error(...e){return this.console.error.bind(this.console,...e)}},useLocalLibraries:!1,CDN:"https://unpkg.com/@loaders.gl",worker:!0,maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:o.Bd,_nodeWorkers:!1,_workerType:"",limit:0,_limitMB:0,batchSize:"auto",batchDebounceMs:0,metadata:!1,transforms:[]}},l={baseUri:"core.baseUrl",fetch:"core.fetch",mimeType:"core.mimeType",fallbackMimeType:"core.fallbackMimeType",ignoreRegisteredLoaders:"core.ignoreRegisteredLoaders",nothrow:"core.nothrow",log:"core.log",useLocalLibraries:"core.useLocalLibraries",CDN:"core.CDN",worker:"core.worker",maxConcurrency:"core.maxConcurrency",maxMobileConcurrency:"core.maxMobileConcurrency",reuseWorkers:"core.reuseWorkers",_nodeWorkers:"core.nodeWorkers",_workerType:"core._workerType",_worker:"core._workerType",limit:"core.limit",_limitMB:"core._limitMB",batchSize:"core.batchSize",batchDebounceMs:"core.batchDebounceMs",metadata:"core.metadata",transforms:"core.transforms",throws:"nothrow",dataType:"(no longer used)",uri:"core.baseUrl",method:"core.fetch.method",headers:"core.fetch.headers",body:"core.fetch.body",mode:"core.fetch.mode",credentials:"core.fetch.credentials",cache:"core.fetch.cache",redirect:"core.fetch.redirect",referrer:"core.fetch.referrer",referrerPolicy:"core.fetch.referrerPolicy",integrity:"core.fetch.integrity",keepalive:"core.fetch.keepalive",signal:"core.fetch.signal"};var f=i(48003);let h=["baseUrl","fetch","mimeType","fallbackMimeType","ignoreRegisteredLoaders","nothrow","log","useLocalLibraries","CDN","worker","maxConcurrency","maxMobileConcurrency","reuseWorkers","_nodeWorkers","_workerType","limit","_limitMB","batchSize","batchDebounceMs","metadata","transforms"];function c(){globalThis.loaders=globalThis.loaders||{};let{loaders:e}=globalThis;return e._state||(e._state={}),e._state}function d(){let e=c();return e.globalOptions=e.globalOptions||{...u,core:{...u.core}},g(e.globalOptions)}function p(e,t,i,r){var s,o,c,p,y;let v,w;return function(e,t){for(let i of(m(e,null,u,l,t),t)){let r=e&&e[i.id]||{},n=i.options&&i.options[i.id]||{},s=i.deprecatedOptions&&i.deprecatedOptions[i.id]||{};m(r,i.id,n,s,t)}}(e,i=Array.isArray(i=i||[])?i:[i]),g((s=t,o=e,c=r,w={...v=s.options||{}},v.core&&(w.core={...v.core}),_(w),w.core?.log===null&&(w.core={...w.core,log:new a}),b(w,g(d())),b(w,g(o)),p=w,(y=c)&&p.core?.baseUrl===void 0&&(p.core||={},p.core.baseUrl=n.pD((0,f.S3)(y))),function(e){let t=e.core;if(t)for(let i of h)void 0!==t[i]&&(e[i]=t[i])}(w),w))}function g(e){var t;let i,r=(i={...t=e},t.core&&(i.core={...t.core}),i);for(let e of(_(r),h))r.core&&void 0!==r.core[e]&&delete r[e];return r.core&&void 0!==r.core._workerType&&delete r._worker,r}function m(e,t,i,n,a){let o=t||"Top level",u=t?`${t}.`:"";for(let l in e){let f=!t&&(0,r.Gv)(e[l]),h="baseUri"===l&&!t,c="workerUrl"===l&&t;if(!(l in i)&&!h&&!c){if(l in n)s.level>0&&s.warn(`${o} loader option '${u}${l}' no longer supported, use '${n[l]}'`)();else if(!f&&s.level>0){let e=function(e,t){let i=e.toLowerCase(),r="";for(let n of t)for(let t in n.options){if(e===t)return`Did you mean '${n.id}.${t}'?`;let s=t.toLowerCase();(i.startsWith(s)||s.startsWith(i))&&(r=r||`Did you mean '${n.id}.${t}'?`)}return r}(l,a);s.warn(`${o} loader option '${u}${l}' not recognized. ${e}`)()}}}}function b(e,t){for(let i in t)if(i in t){let n=t[i];(0,r.aC)(n)&&(0,r.aC)(e[i])?e[i]={...e[i],...t[i]}:e[i]=t[i]}}function _(e){for(let t of(void 0!==e.baseUri&&(e.core||={},void 0===e.core.baseUrl&&(e.core.baseUrl=e.baseUri)),h))if(void 0!==e[t]){let i=e.core=e.core||{};void 0===i[t]&&(i[t]=e[t])}let t=e._worker;void 0!==t&&(e.core||={},void 0===e.core._workerType&&(e.core._workerType=t))}},4329(e,t,i){i.d(t,{JQ:()=>s,OA:()=>a,d_:()=>o});let r=/^data:([-\w.]+\/[-\w.+]+)(;|,)/,n=/^([-\w.]+\/[-\w.+]+)/;function s(e,t){return e.toLowerCase()===t.toLowerCase()}function a(e){let t=n.exec(e);return t?t[1]:e}function o(e){let t=r.exec(e);return t?t[1]:""}},41272(e,t,i){i.d(t,{Al:()=>a,_E:()=>u,z4:()=>o});var r=i(26425),n=i(4329),s=i(48003);function a(e){return(0,r.Sv)(e)?e.url:(0,r.qf)(e)?("name"in e?e.name:"")||"":"string"==typeof e?e:""}function o(e){if((0,r.Sv)(e)){let t=e.headers.get("content-type")||"",i=(0,s.S3)(e.url);return(0,n.OA)(t)||(0,n.d_)(i)}return(0,r.qf)(e)?e.type||"":"string"==typeof e?(0,n.d_)(e):""}function u(e){return(0,r.Sv)(e)?e.headers["content-length"]||-1:(0,r.qf)(e)?e.size:"string"==typeof e?e.length:e instanceof ArrayBuffer||ArrayBuffer.isView(e)?e.byteLength:-1}},26472(e,t,i){i.d(t,{Mz:()=>u,wv:()=>o});var r=i(26425);class n extends Error{constructor(e,t){super(e),this.reason=t.reason,this.url=t.url,this.response=t.response}reason;url;response}var s=i(41272),a=i(48003);async function o(e){if((0,r.Sv)(e))return e;let t={},i=(0,s._E)(e);i>=0&&(t["content-length"]=String(i));let n=(0,s.Al)(e),a=(0,s.z4)(e);a&&(t["content-type"]=a);let o=await f(e);o&&(t["x-first-bytes"]=o),"string"==typeof e&&(e=new TextEncoder().encode(e));let u=new Response(e,{headers:t});return Object.defineProperty(u,"url",{value:n}),u}async function u(e){if(!e.ok)throw await l(e)}async function l(e){let t=(0,a.E1)(e.url),i=`Failed to fetch resource (${e.status}) ${e.statusText}: ${t}`;i=i.length>100?`${i.slice(0,100)}...`:i;let r={reason:e.statusText,url:e.url,response:e};try{let t=e.headers.get("Content-Type");r.reason=!e.bodyUsed&&t?.includes("application/json")?await e.json():await e.text()}catch(e){}return new n(i,r)}async function f(e){if("string"==typeof e)return`data:,${e.slice(0,5)}`;if(e instanceof Blob){let t=e.slice(0,5);return await new Promise(e=>{let i=new FileReader;i.onload=t=>e(t?.target?.result),i.readAsDataURL(t)})}if(e instanceof ArrayBuffer){let t=function(e){let t="",i=new Uint8Array(e);for(let e=0;e<i.byteLength;e++)t+=String.fromCharCode(i[e]);return btoa(t)}(e.slice(0,5));return`data:base64,${t}`}return null}},48003(e,t,i){i.d(t,{E1:()=>a,S3:()=>s,by:()=>n});let r=/\?.*/;function n(e){let t=e.match(r);return t&&t[0]}function s(e){return e.replace(r,"")}function a(e){if(e.length<50)return e;let t=e.slice(e.length-15),i=e.substr(0,32);return`${i}...${t}`}},21140(e,t,i){i.d(t,{$:()=>w});var r=i(86868),n=i(34280);let s=globalThis.loaders?.parseImageNode,a="u">typeof Image,o="u">typeof ImageBitmap,u=!!n.Bd||!!s;var l=i(33437);let f=/^data:image\/svg\+xml/,h=/\.svg((\?|#).*)?$/;function c(e){return e&&(f.test(e)||h.test(e))}function d(e,t){if(c(t))throw Error("SVG cannot be parsed directly to imagebitmap");return new Blob([new Uint8Array(e)])}async function p(e,t,i){let r=function(e,t){if(c(t)){let t=new TextDecoder().decode(e);try{"function"==typeof unescape&&"function"==typeof encodeURIComponent&&(t=unescape(encodeURIComponent(t)))}catch(e){throw Error(e.message)}return`data:image/svg+xml;base64,${btoa(t)}`}return d(e,t)}(e,i),n=self.URL||self.webkitURL,s="string"!=typeof r&&n.createObjectURL(r);try{return await g(s||r,t)}finally{s&&n.revokeObjectURL(s)}}async function g(e,t){let i=new Image;return(i.src=e,t.image&&t.image.decode&&i.decode)?(await i.decode(),i):await new Promise((e,t)=>{try{i.onload=()=>e(i),i.onerror=e=>{let i=e instanceof Error?e.message:"error";t(Error(i))}}catch(e){t(e)}})}let m=!0;async function b(e,t,i){let r;r=c(i)?await p(e,t,i):d(e,i);let n=t&&t.imagebitmap;return await _(r,n)}async function _(e,t=null){if((function(e){if(!e)return!0;for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}(t)||!m)&&(t=null),t)try{return await createImageBitmap(e,t)}catch(e){console.warn(e),m=!1}return await createImageBitmap(e)}var y=i(54849);async function v(e,t){let{mimeType:i}=(0,y.m)(e)||{},n=globalThis.loaders?.parseImageNode;return(0,r.v)(n),await n(e,i)}let w={dataType:null,batchType:null,id:"image",module:"images",name:"Images",version:"4.4.3",mimeTypes:["image/png","image/jpeg","image/gif","image/webp","image/avif","image/bmp","image/vnd.microsoft.icon","image/svg+xml"],extensions:["png","jpg","jpeg","gif","webp","bmp","ico","svg","avif"],parse:async function e(e,t,i){let n,s=((t=t||{}).image||{}).type||"auto",{url:f}=i||{};switch(function(e){switch(e){case"auto":case"data":if(o)return"imagebitmap";if(a)return"image";if(u)return"data";throw Error("Install '@loaders.gl/polyfills' to parse images under Node.js");default:return!function(e){switch(e){case"auto":return o;case"imagebitmap":case"image":case"data":return;default:throw Error(`@loaders.gl/images: image ${e} not supported in this environment`)}}(e),e}}(s)){case"imagebitmap":n=await b(e,t,f);break;case"image":n=await p(e,t,f);break;case"data":n=await v(e,t);break;default:(0,r.v)(!1)}return"data"===s&&(n=(0,l.M5)(n)),n},tests:[e=>!!(0,y.m)(new DataView(e))],options:{image:{type:"auto",decode:!0}}}},54849(e,t,i){function r(e){var t,i;let r,s,a,o,u=n(e);return((r=n(u)).byteLength>=24&&0x89504e47===r.getUint32(0,!1)?{mimeType:"image/png",width:r.getUint32(16,!1),height:r.getUint32(20,!1)}:null)||function(e){let t=n(e);if(!(t.byteLength>=3&&65496===t.getUint16(0,!1)&&255===t.getUint8(2)))return null;let{tableMarkers:i,sofMarkers:r}=function(){let e=new Set([65499,65476,65484,65501,65534]);for(let t=65504;t<65520;++t)e.add(t);return{tableMarkers:e,sofMarkers:new Set([65472,65473,65474,65475,65477,65478,65479,65481,65482,65483,65485,65486,65487,65502])}}(),s=2;for(;s+9<t.byteLength;){let e=t.getUint16(s,!1);if(r.has(e))return{mimeType:"image/jpeg",height:t.getUint16(s+5,!1),width:t.getUint16(s+7,!1)};if(!i.has(e))break;s+=2,s+=t.getUint16(s,!1)}return null}(u)||((s=n(u)).byteLength>=10&&0x47494638===s.getUint32(0,!1)?{mimeType:"image/gif",width:s.getUint16(6,!0),height:s.getUint16(8,!0)}:null)||((a=n(u)).byteLength>=14&&16973===a.getUint16(0,!1)&&a.getUint32(2,!0)===a.byteLength?{mimeType:"image/bmp",width:a.getUint32(18,!0),height:a.getUint32(22,!0)}:null)||((o=!function(e,t,i=0){let r=[...t].map(e=>e.charCodeAt(0));for(let t=0;t<r.length;++t)if(r[t]!==e[t+i])return!1;return!0}(i=new Uint8Array((t=u)instanceof DataView?t.buffer:t),"ftyp",4)||(96&i[8])==0?null:function(e){switch(String.fromCharCode(...e.slice(8,12)).replace("\0"," ").trim()){case"avif":case"avis":return{extension:"avif",mimeType:"image/avif"};default:return null}}(i))?{mimeType:o.mimeType,width:0,height:0}:null)}function n(e){if(e instanceof DataView)return e;if(ArrayBuffer.isView(e))return new DataView(e.buffer);if(e instanceof ArrayBuffer)return new DataView(e);throw Error("toDataView")}i.d(t,{m:()=>r})},33437(e,t,i){i.d(t,{M5:()=>r});function r(e){switch(function(e){var t;let i=(t=e,"u">typeof ImageBitmap&&t instanceof ImageBitmap?"imagebitmap":"u">typeof Image&&t instanceof Image?"image":t&&"object"==typeof t&&t.data&&t.width&&t.height?"data":null);if(!i)throw Error("Not an image");return i}(e)){case"data":return e;case"image":case"imagebitmap":let t=document.createElement("canvas"),i=t.getContext("2d");if(!i)throw Error("getImageData");return t.width=e.width,t.height=e.height,i.drawImage(e,0,0),i.getImageData(0,0,e.width,e.height);default:throw Error("getImageData")}}},49988(e,t,i){function r(e,t,i){if(i=i||e.byteLength,e.byteLength<i||t.byteLength<i)return!1;let r=new Uint8Array(e),n=new Uint8Array(t);for(let e=0;e<r.length;++e)if(r[e]!==n[e])return!1;return!0}function n(...e){var t=e;let i=t.map(e=>e instanceof ArrayBuffer?new Uint8Array(e):e),r=new Uint8Array(i.reduce((e,t)=>e+t.byteLength,0)),s=0;for(let e of i)r.set(e,s),s+=e.byteLength;return r.buffer}function s(e,t,i){let r=void 0!==i?new Uint8Array(e).subarray(t,t+i):new Uint8Array(e).subarray(t);return new Uint8Array(r).buffer}i.d(t,{AQ:()=>n,YV:()=>r,_m:()=>s})},50933(e,t,i){i.d(t,{aK:()=>o,XA:()=>s,Q_:()=>u,Pe:()=>n,W$:()=>a});var r=i(26425);function n(e){return e&&"object"==typeof e&&e.isBuffer}function s(e){if(n(e)||e instanceof ArrayBuffer)return e;if((0,r.L8)(e))return o(e);if(ArrayBuffer.isView(e)){let t=e.buffer;return 0===e.byteOffset&&e.byteLength===e.buffer.byteLength?t:t.slice(e.byteOffset,e.byteOffset+e.byteLength)}if("string"==typeof e)return new TextEncoder().encode(e).buffer;if(e&&"object"==typeof e&&e._toArrayBuffer)return e._toArrayBuffer();throw Error("toArrayBuffer")}function a(e){if(e instanceof ArrayBuffer)return e;if((0,r.L8)(e))return o(e);let{buffer:t,byteOffset:i,byteLength:n}=e;return t instanceof ArrayBuffer&&0===i&&n===t.byteLength?t:o(t,i,n)}function o(e,t=0,i=e.byteLength-t){let r=new Uint8Array(e,t,i),n=new Uint8Array(r.length);return n.set(r),n.buffer}function u(e){return ArrayBuffer.isView(e)?e:new Uint8Array(e)}},86868(e,t,i){i.d(t,{v:()=>r});function r(e,t){if(!e)throw Error(t||"loader assertion failed.")}},34280(e,t,i){i.d(t,{Bd:()=>n});let r={self:"u">typeof self&&self,window:"u">typeof window&&window,global:"u">typeof global&&global,document:"u">typeof document&&document};r.self||r.window||r.global,r.window||r.self||r.global,r.global||r.self||r.window,r.document;let n=!!("object"!=typeof process||"[object process]"!==String(process)||process.browser),s="u">typeof process&&process.version&&/v([0-9]*)/.exec(process.version);s&&parseFloat(s[1])},12802(e,t,i){i.d(t,{Pb:()=>s,cy:()=>n});var r=i(49988);async function n(e){let t=[];for await(let i of e)t.push(a(i));return(0,r.AQ)(...t)}async function*s(e){for await(let t of e)yield a(t)}function a(e){if(e instanceof ArrayBuffer)return e;if(ArrayBuffer.isView(e)){let{buffer:t,byteOffset:i,byteLength:r}=e;return o(t,i,r)}return o(e)}function o(e,t=0,i=e.byteLength-t){let r=new Uint8Array(e,t,i),n=new Uint8Array(r.length);return n.set(r),n.buffer}},26425(e,t,i){i.d(t,{B1:()=>a,Gv:()=>r,H1:()=>h,L8:()=>s,Sv:()=>l,Td:()=>u,aC:()=>n,qf:()=>f,xZ:()=>o});let r=e=>null!==e&&"object"==typeof e,n=e=>r(e)&&e.constructor===({}).constructor,s=e=>"u">typeof SharedArrayBuffer&&e instanceof SharedArrayBuffer,a=e=>r(e)&&"number"==typeof e.byteLength&&"function"==typeof e.slice,o=e=>!!e&&"function"==typeof e[Symbol.iterator],u=e=>!!e&&"function"==typeof e[Symbol.asyncIterator],l=e=>"u">typeof Response&&e instanceof Response||r(e)&&"function"==typeof e.arrayBuffer&&"function"==typeof e.text&&"function"==typeof e.json,f=e=>"u">typeof Blob&&e instanceof Blob,h=e=>{let t,i;return t=e,"u">typeof ReadableStream&&t instanceof ReadableStream||r(t)&&"function"==typeof t.tee&&"function"==typeof t.cancel&&"function"==typeof t.getReader||r(i=e)&&"function"==typeof i.read&&"function"==typeof i.pipe&&"boolean"==typeof i.readable}},83087(e,t,i){let r;i.d(t,{R:()=>o});var n=i(70486);let s="4.4.3",a=s[0]>="0"&&s[0]<="9"?`v${s}`:"",o=(r=new n.h({id:"loaders.gl"}),globalThis.loaders||={},globalThis.loaders.log=r,globalThis.loaders.version=a,globalThis.probe||={},globalThis.probe.loaders=r,r)},10611(e,t,i){function r(e,t){return function e(t,i,r=0){if(r>3)return i;let n={...t};for(let[t,s]of Object.entries(i))s&&"object"==typeof s&&!Array.isArray(s)?n[t]=e(n[t]||{},i[t],r+1):n[t]=i[t];return n}(e||{},t)}i.d(t,{l:()=>r})},34915(e,t,i){i.d(t,{o1:()=>n});let r={};function n(e){for(let t in r)if(e.startsWith(t)){let i=r[t];e=e.replace(t,i)}return e.startsWith("http://")||e.startsWith("https://")||(e=`${e}`),e}},1643(e,t,i){function r(e){let t=e?e.lastIndexOf("/"):-1;return t>=0?e.substr(t+1):e}function n(e){let t=e?e.lastIndexOf("/"):-1;return t>=0?e.substr(0,t):""}function s(...e){let t,i=[];for(let t=0;t<e.length;t++)i[t]=e[t];let r="",n=!1;for(let e=i.length-1;e>=-1&&!n;e--){let s;e>=0?s=i[e]:(void 0===t&&(t=function(){if("u">typeof process&&void 0!==process.cwd)return process.cwd();let e=window.location?.pathname;return e?.slice(0,e.lastIndexOf("/")+1)||""}()),s=t),0!==s.length&&(r=`${s}/${r}`,n=s.charCodeAt(0)===a)}return(r=function(e,t){let i,r="",n=-1,s=0,o=!1;for(let u=0;u<=e.length;++u){if(u<e.length)i=e.charCodeAt(u);else if(i===a)break;else i=a;if(i===a){if(n===u-1||1===s);else if(n!==u-1&&2===s){if(r.length<2||!o||46!==r.charCodeAt(r.length-1)||46!==r.charCodeAt(r.length-2)){if(r.length>2){let e=r.length-1,t=e;for(;t>=0&&r.charCodeAt(t)!==a;--t);if(t!==e){r=-1===t?"":r.slice(0,t),n=u,s=0,o=!1;continue}}else if(2===r.length||1===r.length){r="",n=u,s=0,o=!1;continue}}t&&(r.length>0?r+="/..":r="..",o=!0)}else{let t=e.slice(n+1,u);r.length>0?r+=`/${t}`:r=t,o=!1}n=u,s=0}else 46===i&&-1!==s?++s:s=-1}return r}(r,!n),n)?`/${r}`:r.length>0?r:"."}i.d(t,{hd:()=>s,pD:()=>n,iW:()=>r});let a=47},82117(e,t,i){i.d(t,{v:()=>r});function r(e,t){if(!e)throw Error(t||"loaders.gl assertion failed.")}},80155(e,t,i){i.d(t,{Bd:()=>n,Fr:()=>a,xD:()=>s});let r={self:"u">typeof self&&self,window:"u">typeof window&&window,global:"u">typeof global&&global,document:"u">typeof document&&document};r.self||r.window||r.global,r.window||r.self||r.global,r.global||r.self||r.window,r.document;let n="object"!=typeof process||"[object process]"!==String(process)||process.browser,s="function"==typeof importScripts,a="u">typeof window&&void 0!==window.orientation,o="u">typeof process&&process.version&&/v([0-9]*)/.exec(process.version);o&&parseFloat(o[1])},58091(e,t,i){i.d(t,{x:()=>r});let r=(globalThis._loadersgl_?.version||(globalThis._loadersgl_=globalThis._loadersgl_||{},globalThis._loadersgl_.version="4.4.3"),globalThis._loadersgl_.version)},17909(e,t,i){i.d(t,{N:()=>o});var r=i(44055),n=i(44412),s=i(13559),a=i(18823);class o{static defaultProps={...n.r.defaultProps};static getDefaultPipelineFactory(e){let t=e.getModuleData("@luma.gl/core");return t.defaultPipelineFactory||=new o(e),t.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(e){this.device=e}createRenderPipeline(e){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(e);let t={...n.r.defaultProps,...e},i=this._renderPipelineCache,r=this._hashRenderPipeline(t),o=i[r]?.resource;if(o)i[r].useCount++,this.device.props.debugFactories&&s.R.log(3,`${this}: ${i[r].resource} reused, count=${i[r].useCount}, (id=${e.id})`)();else{let e="webgl"===this.device.type&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;(o=this.device.createRenderPipeline({...t,id:t.id?`${t.id}-cached`:(0,a.L)("unnamed-cached"),_sharedRenderPipeline:e})).hash=r,i[r]={resource:o,useCount:1},this.device.props.debugFactories&&s.R.log(3,`${this}: ${o} created, count=${i[r].useCount}`)()}return o}createComputePipeline(e){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(e);let t={...r.C.defaultProps,...e},i=this._computePipelineCache,n=this._hashComputePipeline(t),a=i[n]?.resource;return a?(i[n].useCount++,this.device.props.debugFactories&&s.R.log(3,`${this}: ${i[n].resource} reused, count=${i[n].useCount}, (id=${e.id})`)()):((a=this.device.createComputePipeline({...t,id:t.id?`${t.id}-cached`:void 0})).hash=n,i[n]={resource:a,useCount:1},this.device.props.debugFactories&&s.R.log(3,`${this}: ${a} created, count=${i[n].useCount}`)()),a}release(e){if(!this.device.props._cachePipelines)return void e.destroy();let t=this._getCache(e),i=e.hash;t[i].useCount--,0===t[i].useCount?(this._destroyPipeline(e),this.device.props.debugFactories&&s.R.log(3,`${this}: ${e} released and destroyed`)()):t[i].useCount<0?(s.R.error(`${this}: ${e} released, useCount < 0, resetting`)(),t[i].useCount=0):this.device.props.debugFactories&&s.R.log(3,`${this}: ${e} released, count=${t[i].useCount}`)()}createSharedRenderPipeline(e){let t=this._hashSharedRenderPipeline(e),i=this._sharedRenderPipelineCache[t];return i||(i={resource:this.device._createSharedRenderPipelineWebGL(e),useCount:0},this._sharedRenderPipelineCache[t]=i),i.useCount++,i.resource}releaseSharedRenderPipeline(e){if(!e.sharedRenderPipeline)return;let t=this._hashSharedRenderPipeline(e.sharedRenderPipeline.props),i=this._sharedRenderPipelineCache[t];i&&(i.useCount--,0===i.useCount&&(i.resource.destroy(),delete this._sharedRenderPipelineCache[t]))}_destroyPipeline(e){let t=this._getCache(e);return!!this.device.props._destroyPipelines&&(delete t[e.hash],e.destroy(),e instanceof n.r&&this.releaseSharedRenderPipeline(e),!0)}_getCache(e){let t;if(e instanceof r.C&&(t=this._computePipelineCache),e instanceof n.r&&(t=this._renderPipelineCache),!t)throw Error(`${this}`);if(!t[e.hash])throw Error(`${this}: ${e} matched incorrect entry`);return t}_hashComputePipeline(e){let{type:t}=this.device,i=this._getHash(e.shader.source),r=this._getHash(JSON.stringify(e.shaderLayout));return`${t}/C/${i}SL${r}`}_hashRenderPipeline(e){let t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,r=this._getWebGLVaryingHash(e),n=this._getHash(JSON.stringify(e.shaderLayout)),s=this._getHash(JSON.stringify(e.bufferLayout)),{type:a}=this.device;if("webgl"===a){let o=this._getHash(JSON.stringify(e.parameters));return`${a}/R/${t}/${i}V${r}T${e.topology}P${o}SL${n}BL${s}`}{let o=this._getHash(JSON.stringify({vertexEntryPoint:e.vertexEntryPoint,fragmentEntryPoint:e.fragmentEntryPoint})),u=this._getHash(JSON.stringify(e.parameters)),l=this._getWebGPUAttachmentHash(e);return`${a}/R/${t}/${i}V${r}T${e.topology}EP${o}P${u}SL${n}BL${s}A${l}`}}_hashSharedRenderPipeline(e){let t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,r=this._getWebGLVaryingHash(e);return`webgl/S/${t}/${i}V${r}`}_getHash(e){return void 0===this._hashes[e]&&(this._hashes[e]=this._hashCounter++),this._hashes[e]}_getWebGLVaryingHash(e){let{varyings:t=[],bufferMode:i=null}=e;return this._getHash(JSON.stringify({varyings:t,bufferMode:i}))}_getWebGPUAttachmentHash(e){let t=e.colorAttachmentFormats??[this.device.preferredColorFormat],i=e.depthStencilAttachmentFormat??(e.parameters?.depthWriteEnabled?this.device.preferredDepthFormat:null);return this._getHash(JSON.stringify({colorAttachmentFormats:t,depthStencilAttachmentFormat:i}))}}},16598(e,t,i){i.d(t,{g:()=>s});var r=i(97718),n=i(13559);class s{static defaultProps={...r.M.defaultProps};static getDefaultShaderFactory(e){let t=e.getModuleData("@luma.gl/core");return t.defaultShaderFactory||=new s(e),t.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(e){this.device=e}createShader(e){if(!this.device.props._cacheShaders)return this.device.createShader(e);let t=this._hashShader(e),i=this._cache[t];if(i)i.useCount++,this.device.props.debugFactories&&n.R.log(3,`${this}: Reusing shader ${i.resource.id} count=${i.useCount}`)();else{let r=this.device.createShader({...e,id:e.id?`${e.id}-cached`:void 0});this._cache[t]=i={resource:r,useCount:1},this.device.props.debugFactories&&n.R.log(3,`${this}: Created new shader ${r.id}`)()}return i.resource}release(e){if(!this.device.props._cacheShaders)return void e.destroy();let t=this._hashShader(e),i=this._cache[t];if(i)if(i.useCount--,0===i.useCount)this.device.props._destroyShaders&&(delete this._cache[t],i.resource.destroy(),this.device.props.debugFactories&&n.R.log(3,`${this}: Releasing shader ${e.id}, destroyed`)());else if(i.useCount<0)throw Error(`ShaderFactory: Shader ${e.id} released too many times`);else this.device.props.debugFactories&&n.R.log(3,`${this}: Releasing shader ${e.id} count=${i.useCount}`)()}_hashShader(e){return`${e.stage}:${e.source}`}}},13125(e,t,i){i.d(t,{K:()=>f});var r=i(60691),n=i(13559),s=i(73348);function a(e){return Array.isArray(e)?0===e.length||"number"==typeof e[0]:ArrayBuffer.isView(e)&&!(e instanceof DataView)}class o{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(e){if(this.name=e?.name||"unnamed",e?.name&&e?.shaderLayout){let t=e?.shaderLayout.bindings?.find(t=>"uniform"===t.type&&t.name===e?.name);if(!t)throw Error(e?.name);for(let e of t.uniforms||[])this.bindingLayout[e.name]=e}}setUniforms(e){for(let[t,i]of Object.entries(e))this._setUniform(t,i)&&!this.needsRedraw&&this.setNeedsRedraw(`${this.name}.${t}=${i}`)}setNeedsRedraw(e){this.needsRedraw=this.needsRedraw||e}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(e,t){return!function(e,t,i=16){if(e===t)return!0;if(!a(e)||!a(t)||e.length!==t.length)return!1;let r=Math.min(i,128);if(e.length>r)return!1;for(let i=0;i<e.length;++i)if(t[i]!==e[i])return!1;return!0}(this.uniforms[e],t)&&(this.uniforms[e]=a(t)?t.slice():t,this.modifiedUniforms[e]=!0,this.modified=!0,!0)}}var u=i(77154);class l{layout;constructor(e){this.layout=e}has(e){return!!this.layout.fields[e]}get(e){let t=this.layout.fields[e];return t?{offset:t.offset,size:t.size}:void 0}getFlatUniformValues(e){let t={};for(let[i,r]of Object.entries(e)){let e=this.layout.uniformTypes[i];e?this._flattenCompositeValue(t,i,e,r):this.layout.fields[i]&&(t[i]=r)}return t}getData(e){let t=(0,u.X)(this.layout.byteLength);new Uint8Array(t,0,this.layout.byteLength).fill(0);let i={i32:new Int32Array(t),u32:new Uint32Array(t),f32:new Float32Array(t),f16:new Uint16Array(t)};for(let[t,r]of Object.entries(this.getFlatUniformValues(e)))this._writeLeafValue(i,t,r);return new Uint8Array(t,0,this.layout.byteLength)}_flattenCompositeValue(e,t,i,r){if(void 0!==r){var o;if("string"==typeof i||this.layout.fields[t]){e[t]=r;return}if(Array.isArray(i)){let s=i[0],o=i[1];if(Array.isArray(s))throw Error(`Nested arrays are not supported for ${t}`);if("string"==typeof s&&a(r))return void this._flattenPackedArray(e,t,s,o,r);if(!Array.isArray(r))return void n.R.warn(`Unsupported uniform array value for ${t}:`,r)();for(let i=0;i<Math.min(r.length,o);i++){let n=r[i];void 0!==n&&this._flattenCompositeValue(e,`${t}[${i}]`,s,n)}return}if((0,s.WC)(i)&&(o=r)&&"object"==typeof o&&!Array.isArray(o)&&!ArrayBuffer.isView(o)){for(let[n,s]of Object.entries(r)){if(void 0===s)continue;let r=`${t}.${n}`;this._flattenCompositeValue(e,r,i[n],s)}return}n.R.warn(`Unsupported uniform value for ${t}:`,r)()}}_flattenPackedArray(e,t,i,r,n){let a=(0,s.jV)(i,this.layout.layout).components;for(let i=0;i<r;i++){var o,u,l;let r=i*a;if(r>=n.length)break;1===a?e[`${t}[${i}]`]=Number(n[r]):e[`${t}[${i}]`]=(o=n,u=r,l=r+a,Array.prototype.slice.call(o,u,l))}}_writeLeafValue(e,t,i){let r=this.layout.fields[t];if(!r)return void n.R.warn(`Uniform ${t} not found in layout`)();let{type:s,components:a,columns:o,rows:u,offset:l,columnStride:f}=r,h=e[s];if(1===a){h[l]=Number(i);return}if(1===o){for(let e=0;e<a;e++)h[l+e]=Number(i[e]??0);return}let c=0;for(let e=0;e<o;e++){let t=l+e*f;for(let e=0;e<u;e++)h[t+e]=Number(i[c++]??0)}}}class f{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(e,t){for(let[i,r]of(this.device=e,Object.entries(t))){let t=(0,s.Pr)(r.uniformTypes??{},{layout:r.layout??("webgpu"===e.type?"wgsl-uniform":"std140")}),n=new l(t);this.shaderBlockLayouts.set(i,t),this.shaderBlockWriters.set(i,n);let a=new o({name:i});a.setUniforms(n.getFlatUniformValues(r.defaultUniforms||{})),this.uniformBlocks.set(i,a)}}destroy(){for(let e of this.uniformBuffers.values())e.destroy()}setUniforms(e,t){for(let[t,i]of Object.entries(e)){let e=this.shaderBlockWriters.get(t),r=e?.getFlatUniformValues(i||{});this.uniformBlocks.get(t)?.setUniforms(r||{})}this.updateUniformBuffers(t)}getUniformBufferByteLength(e){return Math.max(this.shaderBlockLayouts.get(e)?.byteLength||0,1024)}getUniformBufferData(e){let t=this.uniformBlocks.get(e)?.getAllUniforms()||{},i=this.shaderBlockWriters.get(e);return i?.getData(t)||new Uint8Array(0)}createUniformBuffer(e,t){t&&this.setUniforms(t);let i=this.getUniformBufferByteLength(e),n=this.device.createBuffer({usage:r.h.UNIFORM|r.h.COPY_DST,byteLength:i}),s=this.getUniformBufferData(e);return n.write(s),n}getManagedUniformBuffer(e){if(!this.uniformBuffers.get(e)){let t=this.getUniformBufferByteLength(e),i=this.device.createBuffer({usage:r.h.UNIFORM|r.h.COPY_DST,byteLength:t});this.uniformBuffers.set(e,i)}return this.uniformBuffers.get(e)}updateUniformBuffers(e){let t=!1;for(let i of this.uniformBlocks.keys()){let r=this.updateUniformBuffer(i,e);t||=r}return t&&n.R.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(e,t){let i=this.uniformBlocks.get(e),r=this.uniformBuffers.get(e),s=!1;if(r&&i?.needsRedraw){s||=i.needsRedraw;let a=this.getUniformBufferData(e);(r=this.uniformBuffers.get(e))&&(t?this.device.writeBufferViaCommandEncoder(t,r,a):r.write(a));let o=this.uniformBlocks.get(e)?.getAllUniforms();n.R.log(4,`Writing to uniform buffer ${String(e)}`,a,o)()}return s}}},73348(e,t,i){i.d(t,{Pr:()=>s,WC:()=>o,jV:()=>a});var r=i(36794),n=i(44791);function s(e,t={}){let i={...e},n=t.layout??"std140",l={},h=0;for(let[e,t]of Object.entries(i))h=function e(t,i,n,s,l){if("string"==typeof n){let e=a(n,l),o=(0,r.JP)(s,e.alignment);return t[i]={offset:o,...e},o+e.size}if(Array.isArray(n)){if(Array.isArray(n[0]))throw Error(`Nested arrays are not supported for ${i}`);let o=n[0],h=n[1],c=function e(t,i){var n,s,o;return n=function t(i,n){if("string"==typeof i)return a(i,n).size;if(Array.isArray(i)){let t=i[0],r=i[1];if(Array.isArray(t))throw Error("Nested arrays are not supported");return e(t,n)*r}let s=0;for(let e of Object.values(i))s=(0,r.JP)(s,u(e,n))+t(e,n);return(0,r.JP)(s,u(i,n))}(t,i),s=u(t,i),o=i,(0,r.JP)(n,f(o)?4:s)}(o,l),d=(0,r.JP)(s,u(n,l));for(let r=0;r<h;r++)e(t,`${i}[${r}]`,o,d+r*c,l);return d+c*h}if(o(n)){let a=u(n,l),o=(0,r.JP)(s,a);for(let[r,s]of Object.entries(n))o=e(t,`${i}.${r}`,s,o,l);return(0,r.JP)(o,a)}throw Error(`Unsupported CompositeShaderType for ${i}`)}(l,e,t,h,n);return h=(0,r.JP)(h,u(i,n)),{layout:n,byteLength:4*h,uniformTypes:i,fields:l}}function a(e,t){let i=(0,n.si)(e),s=(0,n.k0)(i),a=/^mat(\d)x(\d)<.+>$/.exec(i);if(a){var o,u;let e=Number(a[1]),n=Number(a[2]),f=l(n,i,s.type,t),h=(o=f.size,u=f.alignment,"std140"===t?4:(0,r.JP)(o,u));return{alignment:f.alignment,size:e*h,components:e*n,columns:e,rows:n,columnStride:h,shaderType:i,type:s.type}}let f=/^vec(\d)<.+>$/.exec(i);return f?l(Number(f[1]),i,s.type,t):{alignment:1,size:1,components:1,columns:1,rows:1,columnStride:1,shaderType:i,type:s.type}}function o(e){return!!e&&"object"==typeof e&&!Array.isArray(e)}function u(e,t){var i;if("string"==typeof e)return a(e,t).alignment;if(Array.isArray(e)){let i=u(e[0],t);return f(t)?Math.max(i,4):i}let r=1;for(let i of Object.values(e))r=Math.max(r,u(i,t));return"std140"===(i=t)||"wgsl-uniform"===i?Math.max(r,4):r}function l(e,t,i,r){return{alignment:2===e?2:4,size:3===e?3:e,components:e,columns:1,rows:e,columnStride:3===e?3:e,shaderType:t,type:i}}function f(e){return"std140"===e||"wgsl-uniform"===e}},93613(e,t,i){i.d(t,{F:()=>o});var r=i(60966),n=i(39584);let s=0,a={requestAnimationFrame:e=>{let t;return(t="u">typeof window?window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame:null)?t.call(window,e):setTimeout(()=>e("u">typeof performance?performance.now():Date.now()),1e3/60)},cancelAnimationFrame:e=>{let t;(t="u">typeof window?window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame:null)?t.call(window,e):clearTimeout(e)}};class o{static defaultAnimationLoopProps={device:null,onAddHTML:()=>"",onInitialize:async()=>null,onRender:()=>{},onFinalize:()=>{},onError:e=>{console.error(e)},stats:void 0,autoResizeViewport:!1,animationFrameProvider:a};device=null;canvas=null;props;animationProps=null;timeline=null;stats;sharedStats;cpuTime;gpuTime;frameRate;display;_needsRedraw="initialized";_initialized=!1;_running=!1;_animationFrameId=null;_nextFramePromise=null;_resolveNextFrame=null;_cpuStartTime=0;_error=null;_lastFrameTime=0;constructor(e){if(this.props={...o.defaultAnimationLoopProps,...e},!(e=this.props).device)throw Error("No device provided");this.stats=e.stats||new n.A({id:`animation-loop-${s++}`}),this.sharedStats=r.a.stats.get("Animation Loop"),this.frameRate=this.stats.get("Frame Rate"),this.frameRate.setSampleSize(1),this.cpuTime=this.stats.get("CPU Time"),this.gpuTime=this.stats.get("GPU Time"),this.setProps({autoResizeViewport:e.autoResizeViewport,animationFrameProvider:e.animationFrameProvider}),this.start=this.start.bind(this),this.stop=this.stop.bind(this),this._onMousemove=this._onMousemove.bind(this),this._onMouseleave=this._onMouseleave.bind(this)}destroy(){this.stop(),this._setDisplay(null),this.device?._disableDebugGPUTime()}delete(){this.destroy()}reportError(e){this.props.onError(e),this._error=e}setNeedsRedraw(e){return this._needsRedraw=this._needsRedraw||e,this}needsRedraw(){let e=this._needsRedraw;return this._needsRedraw=!1,e}setProps(e){if("autoResizeViewport"in e&&(this.props.autoResizeViewport=e.autoResizeViewport||!1),"animationFrameProvider"in e){let t=e.animationFrameProvider||a;if(t!==this.props.animationFrameProvider){let e=null!==this._animationFrameId;e&&this._cancelAnimationFrame(),this.props.animationFrameProvider=t,e&&this._requestAnimationFrame()}}return this}async start(){if(this._running)return this;this._running=!0;try{let e;if(!this._initialized){if(this._initialized=!0,await this._initDevice(),this._initialize(),!this._running)return null;await this.props.onInitialize(this._getAnimationProps())}if(!this._running)return null;return!1!==e&&(this._cancelAnimationFrame(),this._requestAnimationFrame()),this}catch(t){let e=t instanceof Error?t:Error("Unknown error");throw this.props.onError(e),e}}stop(){return this._running&&(this.animationProps&&!this._error&&this.props.onFinalize(this.animationProps),this._cancelAnimationFrame(),this._nextFramePromise=null,this._resolveNextFrame=null,this._running=!1,this._lastFrameTime=0),this}redraw(e,t=null){return this.device?.isLost||this._error||(this._beginFrameTimers(e),this._setupFrame(),this.animationProps&&(this.animationProps.animationFrame=t),this._updateAnimationProps(),this._renderFrame(this._getAnimationProps()),this._clearNeedsRedraw(),this._resolveNextFrame&&(this._resolveNextFrame(this),this._nextFramePromise=null,this._resolveNextFrame=null),this._endFrameTimers()),this}attachTimeline(e){return this.timeline=e,this.timeline}detachTimeline(){this.timeline=null}waitForRender(){return this.setNeedsRedraw("waitForRender"),this._nextFramePromise||(this._nextFramePromise=new Promise(e=>{this._resolveNextFrame=e})),this._nextFramePromise}async toDataURL(){if(this.setNeedsRedraw("toDataURL"),await this.waitForRender(),this.canvas instanceof HTMLCanvasElement)return this.canvas.toDataURL();throw Error("OffscreenCanvas")}_initialize(){this._startEventHandling(),this._initializeAnimationProps(),this._updateAnimationProps(),this._resizeViewport(),this.device?._enableDebugGPUTime()}_setDisplay(e){this.display&&(this.display.destroy(),this.display.animationLoop=null),e&&(e.animationLoop=this),this.display=e}_requestAnimationFrame(){this._running&&(this._animationFrameId=this.props.animationFrameProvider.requestAnimationFrame(this._animationFrame.bind(this)))}_cancelAnimationFrame(){null!==this._animationFrameId&&(this.props.animationFrameProvider.cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}_animationFrame(e,t){this._running&&(this.redraw(e,t??null),this._requestAnimationFrame())}_renderFrame(e){if(this.display)return void this.display._renderFrame(e);let t=this.props.onRender(this._getAnimationProps());this.device&&!1!==t&&this.device.submit()}_clearNeedsRedraw(){this._needsRedraw=!1}_setupFrame(){this._resizeViewport()}_initializeAnimationProps(){let e=this.device?.getDefaultCanvasContext();if(!this.device||!e)throw Error("loop");let t=e?.canvas,i=e.props.useDevicePixels;this.animationProps={animationLoop:this,device:this.device,canvasContext:e,canvas:t,useDevicePixels:i,timeline:this.timeline,needsRedraw:!1,width:1,height:1,aspect:1,time:0,startTime:Date.now(),engineTime:0,tick:0,tock:0,animationFrame:null,_mousePosition:null}}_getAnimationProps(){if(!this.animationProps)throw Error("animationProps");return this.animationProps}_updateAnimationProps(){if(!this.animationProps)return;let{width:e,height:t,aspect:i}=this._getSizeAndAspect();(e!==this.animationProps.width||t!==this.animationProps.height)&&this.setNeedsRedraw("drawing buffer resized"),i!==this.animationProps.aspect&&this.setNeedsRedraw("drawing buffer aspect changed"),this.animationProps.width=e,this.animationProps.height=t,this.animationProps.aspect=i,this.animationProps.needsRedraw=this._needsRedraw,this.animationProps.engineTime=Date.now()-this.animationProps.startTime,this.timeline&&this.timeline.update(this.animationProps.engineTime),this.animationProps.tick=Math.floor(this.animationProps.time/1e3*60),this.animationProps.tock++,this.animationProps.time=this.timeline?this.timeline.getTime():this.animationProps.engineTime}async _initDevice(){if(this.device=await this.props.device,!this.device)throw Error("No device provided");this.canvas=this.device.getDefaultCanvasContext().canvas||null}_createInfoDiv(){if(this.canvas&&this.props.onAddHTML){let e=document.createElement("div");document.body.appendChild(e),e.style.position="relative";let t=document.createElement("div");t.style.position="absolute",t.style.left="10px",t.style.bottom="10px",t.style.width="300px",t.style.background="white",this.canvas instanceof HTMLCanvasElement&&e.appendChild(this.canvas),e.appendChild(t);let i=this.props.onAddHTML(t);i&&(t.innerHTML=i)}}_getSizeAndAspect(){if(!this.device)return{width:1,height:1,aspect:1};let[e,t]=this.device.getDefaultCanvasContext().getDrawingBufferSize();return{width:e,height:t,aspect:e>0&&t>0?e/t:1}}_resizeViewport(){this.props.autoResizeViewport&&this.device.gl&&this.device.gl.viewport(0,0,this.device.gl.drawingBufferWidth,this.device.gl.drawingBufferHeight)}_beginFrameTimers(e){let t=e??("u">typeof performance?performance.now():Date.now());if(this._lastFrameTime){let e=t-this._lastFrameTime;e>0&&this.frameRate.addTime(e)}this._lastFrameTime=t,this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeStart()}_endFrameTimers(){this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeEnd(),this._updateSharedStats()}_consumeEncodedGpuTime(){if(!this.device)return;let e=this.device.commandEncoder._gpuTimeMs;void 0!==e&&(this.gpuTime.addTime(e),this.device.commandEncoder._gpuTimeMs=void 0)}_updateSharedStats(){if(this.stats!==this.sharedStats){for(let e of Object.keys(this.sharedStats.stats))this.stats.stats[e]||delete this.sharedStats.stats[e];this.stats.forEach(e=>{let t=this.sharedStats.get(e.name,e.type);t.sampleSize=e.sampleSize,t.time=e.time,t.count=e.count,t.samples=e.samples,t.lastTiming=e.lastTiming,t.lastSampleTime=e.lastSampleTime,t.lastSampleCount=e.lastSampleCount,t._count=e._count,t._time=e._time,t._samples=e._samples,t._startTime=e._startTime,t._timerPending=e._timerPending})}}_startEventHandling(){this.canvas&&(this.canvas.addEventListener("mousemove",this._onMousemove.bind(this)),this.canvas.addEventListener("mouseleave",this._onMouseleave.bind(this)))}_onMousemove(e){e instanceof MouseEvent&&(this._getAnimationProps()._mousePosition=[e.offsetX,e.offsetY])}_onMouseleave(e){this._getAnimationProps()._mousePosition=null}}},3066(e,t,i){i.d(t,{K:()=>s});let r=1,n=1;class s{time=0;channels=new Map;animations=new Map;playing=!1;lastEngineTime=-1;addChannel(e){let{delay:t=0,duration:i=1/0,rate:n=1,repeat:s=1}=e,a=r++,o={time:0,delay:t,duration:i,rate:n,repeat:s};return this._setChannelTime(o,this.time),this.channels.set(a,o),a}removeChannel(e){for(let[t,i]of(this.channels.delete(e),this.animations))i.channel===e&&this.detachAnimation(t)}isFinished(e){let t=this.channels.get(e);return void 0!==t&&this.time>=t.delay+t.duration*t.repeat}getTime(e){if(void 0===e)return this.time;let t=this.channels.get(e);return void 0===t?-1:t.time}setTime(e){for(let t of(this.time=Math.max(0,e),this.channels.values()))this._setChannelTime(t,this.time);for(let e of this.animations.values()){let{animation:t,channel:i}=e;t.setTime(this.getTime(i))}}play(){this.playing=!0}pause(){this.playing=!1,this.lastEngineTime=-1}reset(){this.setTime(0)}attachAnimation(e,t){let i=n++;return this.animations.set(i,{animation:e,channel:t}),e.setTime(this.getTime(t)),i}detachAnimation(e){this.animations.delete(e)}update(e){this.playing&&(-1===this.lastEngineTime&&(this.lastEngineTime=e),this.setTime(this.time+(e-this.lastEngineTime)),this.lastEngineTime=e)}_setChannelTime(e,t){let i=t-e.delay;i>=e.duration*e.repeat?e.time=e.duration*e.rate:(e.time=Math.max(0,i)%e.duration,e.time*=e.rate)}}},9079(e,t,i){i.d(t,{p:()=>a});var r=i(60691),n=i(1100),s=i(12434);class a{device;model;transformFeedback;static defaultProps={...s.K.defaultProps,feedbackBufferMode:"separate",outputs:void 0,feedbackBuffers:void 0};static isSupported(e){return e?.info?.type==="webgl"}constructor(e,t=a.defaultProps){if(!a.isSupported(e))throw Error("BufferTransform not yet implemented on WebGPU");this.device=e,this.model=new s.K(this.device,{id:t.id||"buffer-transform-model",fs:t.fs||(0,n.Wk)(),topology:t.topology||"point-list",varyings:t.outputs||t.varyings,...t,bufferMode:t.bufferMode||("interleaved"===t.feedbackBufferMode?35980:35981)}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:t.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(e){e?.inputBuffers&&this.model.setAttributes(e.inputBuffers),e?.outputBuffers&&this.transformFeedback.setBuffers(e.outputBuffers);let t=this.device.beginRenderPass({discard:!0,...e});this.model.draw(t),t.end()}getBuffer(e){return this.transformFeedback.getBuffer(e)}readAsync(e){let t=this.getBuffer(e);if(!t)throw Error("BufferTransform#getBuffer");if(t instanceof r.h)return t.readAsync();let{buffer:i,byteOffset:n=0,byteLength:s=i.byteLength}=t;return i.readAsync(n,s)}}},31709(e,t,i){i.d(t,{C:()=>b});var r=i(44055),n=i(17909),s=i(16598),a=i(86103),o=i(13125),u=i(13559),l=i(60633),f=i(60691),h=i(92782),c=i(79083),d=i(91334),p=i(20131),g=i(92790),m=i(51208);class b{static defaultProps={...r.C.defaultProps,id:"unnamed",handle:void 0,userData:{},source:"",modules:[],defines:{},plugins:[],bindings:void 0,shaderInputs:void 0,pipelineFactory:void 0,shaderFactory:void 0,shaderAssembler:h._P.getDefaultShaderAssembler("wgsl"),debugShaders:void 0};device;id;pipelineFactory;shaderFactory;userData={};bindings={};pipeline;source;shader;shaderInputs;_uniformStore;_pipelineNeedsUpdate="newly created";_getModuleUniforms;props;_destroyed=!1;constructor(e,t){var i;if("webgpu"!==e.type)throw Error("Computation is only supported in WebGPU");this.props={...b.defaultProps,...t},t=this.props,this.id=t.id||(0,m.L)("model"),this.device=e,Object.assign(this.userData,t.userData);let r={type:(i=e).type,shaderLanguage:i.info.shadingLanguage,shaderLanguageVersion:i.info.shadingLanguageVersion,gpu:i.info.gpu,limits:i.limits,features:i.features},o=(0,c.r)(this.props.plugins,r.shaderLanguage);if(Object.keys(o.vertexInputs).length>0||Object.keys(o.varyings).length>0)throw Error("Computation does not support ShaderPlugin vertex inputs or varyings");let u=Object.fromEntries((0,c.K)(this.props.modules,o.modules).map(e=>[e.name,e]));this.shaderInputs=t.shaderInputs||new p.l(u),t.shaderInputs&&o.modules.length>0&&this.shaderInputs.addModules(o.modules),this.setShaderInputs(this.shaderInputs);let l=(0,g.jY)(this.props.modules,this.shaderInputs?.getModules()),f={...o.defines,...this.props.defines};this.props.shaderLayout=(0,g.Y$)(this.props.shaderLayout,l)||null,this.pipelineFactory=t.pipelineFactory||n.N.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||s.g.getDefaultShaderFactory(this.device);let d=this.props.shaderAssembler;(0,a.v)(d instanceof h.Ry);let{source:_,getUniforms:y,shaderLayout:v}=d.assembleWGSLShader({platformInfo:r,...this.props,modules:l,defines:f,scanVertexAttributes:!1,pluginInjections:o.injections});this.source=_,this._getModuleUniforms=y;let w=v??e.getShaderLayout?.(this.source,{scanVertexAttributes:!1});this.props.shaderLayout=(0,g.Y$)(this.props.shaderLayout||w||null,l)||null,this.pipeline=this._updatePipeline(),t.bindings&&this.setBindings(t.bindings)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.shader),this._uniformStore.destroy(),this._destroyed=!0)}predraw(e){this.updateShaderInputs(e)}dispatch(e,t,i,r){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatch(t,i,r)}finally{this._logDrawCallEnd()}}dispatchIndirect(e,t,i=0){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatchIndirect(t,i)}finally{this._logDrawCallEnd()}}_setPipeline(e){this.pipeline=this._updatePipeline(),this.pipeline.setBindings(this.bindings),e.setPipeline(this.pipeline),e.setBindings({})}setVertexCount(e){}setInstanceCount(e){}setShaderInputs(e){for(let[t,i]of(this.shaderInputs=e,this._uniformStore=new o.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if((0,g.fX)(i)){let e=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=e}}setShaderModuleProps(e){let t=this._getModuleUniforms(e),i=Object.keys(t).filter(e=>{let i=t[e];return!(0,d.H9)(i)&&"number"!=typeof i&&"boolean"!=typeof i}),r={};for(let e of i)r[e]=t[e],delete t[e]}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e)}setBindings(e){Object.assign(this.bindings,e)}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate=this._pipelineNeedsUpdate||e}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null;this.pipeline&&(u.R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.shader),this._pipelineNeedsUpdate=!1,this.shader=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"compute",source:this.source,debugShaders:this.props.debugShaders}),this.pipeline=this.pipelineFactory.createComputePipeline({...this.props,shader:this.shader}),e&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){let e=u.R.level>3?0:1e4;u.R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,u.R.group(2,`>>> DRAWING MODEL ${this.id}`,{collapsed:u.R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){let e=this.shaderInputs.getDebugTable();u.R.table(2,e)(),u.R.groupEnd(2)(),this._logOpen=!1}}_drawCount=0;_getBufferOrConstantValues(e,t){let i=l.r.getTypedArrayConstructor(t);return(e instanceof f.h?new i(e.debugData):e).toString()}}},82645(e,t,i){i.d(t,{Hd:()=>o,Xk:()=>u,j8:()=>l,kL:()=>a});var r=i(60691),n=i(51208);let s=r.h.DEBUG_DATA_MAX_LENGTH;class a{device;id;ready;usage;props;isReady=!0;destroyed=!1;generation=0;updateTimestamp;debugData=new ArrayBuffer(0);_debugDataEnabled;_maxDebugDataByteLength;_ownsBuffer;_buffer;get buffer(){return this._buffer}get byteLength(){return this._buffer.byteLength}get[Symbol.toStringTag](){return"DynamicBuffer"}toString(){return`DynamicBuffer:"${this.id}":${this.byteLength}B`}toJSON(){return this.toString()}constructor(e,t){let{debugData:i=!1,buffer:a,ownsBuffer:o=!0,...u}=t;if(a&&a.device!==e)throw Error("DynamicBuffer adopted buffers must belong to the supplied device");if(a&&(void 0!==u.byteLength||void 0!==u.data))throw Error("DynamicBuffer cannot combine an adopted buffer with byteLength or data");let l=t.id||a?.id||(0,n.L)("dynamic-buffer"),f={...u,id:l,usage:u.usage??a?.usage,indexType:u.indexType??a?.indexType};(f.usage||0)&r.h.INDEX&&!f.indexType&&(u.data instanceof Uint32Array?f.indexType="uint32":u.data instanceof Uint16Array?f.indexType="uint16":u.data instanceof Uint8Array&&(f.indexType="uint8")),delete f.data,delete f.byteOffset,this.device=e,this.id=l,this.props=f,this.usage=f.usage||0,this._debugDataEnabled=!!i,this._maxDebugDataByteLength="object"==typeof i&&void 0!==i.maxByteLength?i.maxByteLength:s,this._ownsBuffer=o,this._buffer=a??this.device.createBuffer({...u,id:l}),this.ready=Promise.resolve(this._buffer),this.updateTimestamp=this._buffer.updateTimestamp,this._resetDebugData(this._buffer.byteLength),u.data&&this._writeDebugData(u.data,u.byteOffset||0)}write(e,t=0){this._buffer.write(e,t),this._touch(),this._writeDebugData(e,t)}async mapAndWriteAsync(e,t=0,i=this.byteLength-t){let r=null;await this._buffer.mapAndWriteAsync(async(t,n)=>{await e(t,n),r=new Uint8Array(t.slice(0,i))},t,i),this._touch(),r&&this._writeDebugData(r,t)}async readAsync(e=0,t=this.byteLength-e){let i=await this._buffer.readAsync(e,t);return this._writeDebugData(i,e)&&this._touch(),i}async mapAndReadAsync(e,t=0,i=this.byteLength-t){let r=null,n=await this._buffer.mapAndReadAsync(async(t,i)=>(r=new Uint8Array(t.slice(0)),await e(t,i)),t,i);return r&&this._writeDebugData(r,t)&&this._touch(),n}resize(e){let{byteLength:t,preserveData:i=!1}=e;if(t===this.byteLength)return!1;let r=Math.min(e.copyByteLength??Math.min(this.byteLength,t),this.byteLength,t),n=this._buffer,s=this.debugData.slice(0),{data:a,byteOffset:o,...u}=this.props,l=this.device.createBuffer({...u,byteLength:t});return i&&r>0&&this._copyBufferContents(n,l,r),this._buffer=l,this._resetDebugData(t),i&&s.byteLength>0&&this._writeDebugData(s,0),this._ownsBuffer&&n.destroy(),this._ownsBuffer=!0,this.generation++,this._touch(),!0}ensureSize(e,t){return!(e<=this.byteLength)&&this.resize({byteLength:e,preserveData:t?.preserveData})}getBinding(e){return e?.offset===void 0&&e?.size===void 0?this._buffer:{buffer:this._buffer,offset:e?.offset,size:e?.size}}destroy(){this.destroyed||(this._ownsBuffer&&this._buffer.destroy(),this.destroyed=!0,this.debugData=new ArrayBuffer(0))}_copyBufferContents(e,t,i){let r="webgpu"===this.device.type?4*Math.ceil(i/4):i,n=this.device.createCommandEncoder();n.copyBufferToBuffer({sourceBuffer:e,destinationBuffer:t,size:r}),this.device.submit(n.finish())}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_resetDebugData(e){if(!this._debugDataEnabled){this.debugData=new ArrayBuffer(0);return}this.debugData=new ArrayBuffer(Math.min(e,this._maxDebugDataByteLength))}_writeDebugData(e,t){if(!this._debugDataEnabled||0===this.debugData.byteLength||t>=this.debugData.byteLength)return!1;let i=ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e),r=new Uint8Array(this.debugData),n=Math.min(i.byteLength,r.byteLength-t);return r.set(i.subarray(0,n),t),n>0}}function o(e){return null!==e&&"object"==typeof e&&"buffer"in e}function u(e){return e instanceof a?e:o(e)&&e.buffer instanceof a?e.buffer:null}function l(e){var t;return{buffer:(t=e.buffer)instanceof a?t.buffer:t,offset:e.offset,size:e.size}}},34037(e,t,i){i.d(t,{YT:()=>n,l0:()=>s});var r=i(77569);function n(e){return null!==e&&"object"==typeof e&&"resolveTextureBinding"in e&&"function"==typeof e.resolveTextureBinding}function s(e,t,i){let n=(0,r.Jc)(e,t,{ignoreWarnings:!0});return n?.type==="texture"||n?.type==="external-texture"?n:0===e.bindings.length&&i?.fallbackGroup!==void 0?{type:"texture",name:t,group:i.fallbackGroup,location:0}:null}},69457(e,t,i){i.d(t,{C:()=>s});var r=i(6646),n=i(62837);function s(e,t={}){var i,o;let u=t.bufferName||"geometry";if(function(e,t){if(1!==e.bufferLayout.length)return!1;let i=e.bufferLayout[0];return i.name===t&&!!i.attributes?.length&&!!e.attributes[t]}(e,u))return e;let l=t.minAttributeAlignment||4,f=(i=e,(o=t.attributes)?o.map(e=>[e,i.attributes[e]]):Object.entries(i.attributes)),h=[],c=0,d=1/0;for(let[e,t]of f){if(!t)continue;if(t.constant)throw Error(`Attribute ${e} is constant`);let{value:i,size:s,normalized:o}=t;if(!ArrayBuffer.isView(i))throw Error(`Attribute ${e} is missing typed array data`);if(void 0===s)throw Error(`Attribute ${e} is missing a size`);let u=r.E.getVertexFormatFromAttribute(i,s,o),f=r.E.getVertexFormatInfo(u);c=a(c,l),h.push({sourceName:e,attributeName:(0,n.l)(e),value:i,size:s,format:u,byteOffset:c,byteLength:f.byteLength}),c+=f.byteLength;let p=i.length/s;if(!Number.isInteger(p))throw Error(`Attribute ${e} length is not divisible by size`);d=Math.min(d,p)}if(0===h.length||!Number.isFinite(d))throw Error(`Geometry ${e.id} has no interleavable attributes`);let p=a(c,l),g=new ArrayBuffer(d*p);for(let e of h)!function(e,t,i,r){let n=r.value.constructor,s=n.BYTES_PER_ELEMENT;if(r.byteOffset%s!=0||i%s!=0)throw Error(`Attribute ${r.sourceName} is not aligned to its component type`);let a=new n(e),o=r.value,u=r.byteOffset/s,l=i/s;for(let e=0;e<t;e++){let t=e*r.size,i=e*l+u;for(let e=0;e<r.size;e++)a[i+e]=o[t+e]}}(g,d,p,e);return new n.V({id:e.id,topology:e.topology||"triangle-list",vertexCount:e.vertexCount,indices:e.indices,attributes:{[u]:{value:new Uint8Array(g),size:p,byteStride:p}},bufferLayout:[{name:u,stepMode:"vertex",byteStride:p,attributes:h.map(e=>({attribute:e.attributeName,format:e.format,byteOffset:e.byteOffset}))}]})}function a(e,t){return Math.ceil(e/t)*t}},62837(e,t,i){i.d(t,{V:()=>s,l:()=>a});var r=i(6646),n=i(51208);class s{id;topology;vertexCount;indices;attributes;bufferLayout;userData={};constructor(e){let{attributes:t={},indices:i=null,vertexCount:s=null}=e;for(let[r,s]of(this.id=e.id||(0,n.L)("geometry"),this.topology=e.topology,i&&(this.indices=ArrayBuffer.isView(i)?{value:i,size:1}:i),this.attributes={},Object.entries(t))){let e=ArrayBuffer.isView(s)?{value:s}:s;if(!ArrayBuffer.isView(e.value))throw Error(`${this._print(r)}: must be typed array or object with value as typed array`);if("POSITION"!==r&&"positions"!==r||e.size||(e.size=3),"indices"===r){if(this.indices)throw Error("Multiple indices detected");this.indices=e}else{let t=a(r),i=Object.keys(this.attributes).find(e=>a(e)===t);i&&delete this.attributes[i],this.attributes[r]=e}}this.indices&&void 0!==this.indices.isIndexed&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=s||this._calculateVertexCount(this.attributes,this.indices),this.bufferLayout=e.bufferLayout||function(e){let t=[];for(let[i,n]of Object.entries(e)){if(!n)continue;let{value:e,size:s,normalized:o}=n;if(void 0===s)throw Error(`Attribute ${i} is missing a size`);t.push({name:a(i),format:r.E.getVertexFormatFromAttribute(e,s,o)})}return t}(this.attributes)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(e){return`Geometry ${this.id} attribute ${e}`}_setAttributes(e,t){return this}_calculateVertexCount(e,t){if(t)return t.value.length;let i=1/0;for(let t of Object.values(e)){if(!t)continue;let{value:e,size:r,constant:n}=t;!n&&e&&void 0!==r&&r>=1&&(i=Math.min(i,e.length/r))}return i}}function a(e){switch(e){case"POSITION":return"positions";case"NORMAL":return"normals";case"TEXCOORD_0":return"texCoords";case"TEXCOORD_1":return"texCoords1";case"COLOR_0":return"colors";default:return e}}},12434(e,t,i){i.d(t,{K:()=>C});var r=i(44412),n=i(86103),s=i(17909),a=i(16598),o=i(13559),u=i(13125),l=i(77569),f=i(31130),h=i(60691),c=i(38550),d=i(42188),p=i(92697),g=i(60633),m=i(92782),b=i(79083),_=i(62837),y=i(69457),v=i(51208);class w{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(e){if(this.id=e.id||(0,v.L)("geometry"),this.topology=e.topology,this.indices=e.indices||null,this.attributes=e.attributes,this.vertexCount=e.vertexCount,this.bufferLayout=e.bufferLayout||[],this.indices&&!(this.indices.usage&h.h.INDEX))throw Error("Index buffer must have INDEX usage")}destroy(){for(let e of(this.indices?.destroy(),Object.values(this.attributes)))e.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(e){return e.byteLength/12}}let E="__debugFramebufferState";function x(e,t){if(!e)return t;let i=Number.parseInt(e,10);return Number.isFinite(i)?i:t}function S(e,t,i){if(e===t)return!0;if(!i||!e||!t)return!1;if(Array.isArray(e)){if(!Array.isArray(t)||e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(!S(e[r],t[r],i-1))return!1;return!0}if(Array.isArray(t))return!1;if("object"==typeof e&&"object"==typeof t){let r=Object.keys(e),n=Object.keys(t);if(r.length!==n.length)return!1;for(let n of r)if(!t.hasOwnProperty(n)||!S(e[n],t[n],i-1))return!1;return!0}return!1}var A=i(92992);class L{bufferLayouts;constructor(e){this.bufferLayouts=e}getBufferLayout(e){return this.bufferLayouts.find(t=>t.name===e)||null}getAttributeNamesForBuffer(e){return(0,A.TC)(e)}mergeBufferLayouts(e,t){let i=[...e];for(let e of t){let t=i.findIndex(t=>t.name===e.name);t<0?i.push(e):i[t]=e}return i}}var B=i(92790),T=i(20131),P=i(82645),$=i(34037);let M="render pipeline initialization failed",O=["stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"];class C{static defaultProps={...r.r.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],plugins:[],geometry:null,indexBuffer:null,indexCount:void 0,firstVertex:0,firstIndex:0,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:m._P.getDefaultShaderAssembler("glsl"),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexCount;firstVertex;firstIndex;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_dynamicIndexBufferSource=null;_dynamicAttributeBufferSources={};_colorAttachmentFormats;_depthStencilAttachmentFormat;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_drawBlockedReason=!1;_destroyed=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(e,t){var i,r,o;let u=C.defaultProps.shaderAssembler;this.props={...C.defaultProps,...t,shaderAssembler:t.shaderAssembler??(k(u,e.info.shadingLanguage)?u:m._P.getDefaultShaderAssembler(e.info.shadingLanguage))},t=this.props,this.id=t.id||(0,v.L)("model"),this.device=e,Object.assign(this.userData,t.userData),this.material=t.material||null;let l={type:(i=e).type,shaderLanguage:i.info.shadingLanguage,shaderLanguageVersion:i.info.shadingLanguageVersion,gpu:i.info.gpu,limits:i.limits,features:i.features},f=(0,b.r)(this.props.plugins,l.shaderLanguage),h=Object.fromEntries((0,b.K)(this.props.modules,f.modules).map(e=>[e.name,e])),c=t.shaderInputs||new T.l(h,{disableWarnings:this.props.disableWarnings});t.shaderInputs&&f.modules.length>0&&c.addModules(f.modules),this.setShaderInputs(c);let d=(0,B.jY)(this.props.modules,c.getModules()),p={...f.defines,...this.props.defines};if(this.props.shaderLayout=(0,B.Y$)(this.props.shaderLayout,d)||null,"webgpu"===this.device.type&&this.props.source){let t=this.props.shaderAssembler;(0,n.v)(k(t,"wgsl"));let{source:i,getUniforms:s,bindingTable:a,shaderLayout:u}=t.assembleWGSLShader({platformInfo:l,...this.props,modules:d,defines:p,pluginInjections:f.injections,pluginVertexInputs:f.vertexInputs,pluginVaryings:f.varyings});this.source=i,this._getModuleUniforms=s,this._bindingTable=a;let h=(r=u??e.getShaderLayout?.(this.source),o=f.vertexInputs,r&&0!==Object.keys(o).length?{...r,attributes:r.attributes.map(e=>{let t=e.name.startsWith("_luma_")?e.name.slice(6):null;return t&&o[t]?{...e,name:t}:e})}:r),c=(0,B.He)(this.props.shaderLayout,h,Object.keys(f.vertexInputs));this.props.shaderLayout=(0,B.Y$)(c||null,d)||null}else{let e=this.props.shaderAssembler;(0,n.v)(k(e,"glsl"));let{vs:t,fs:i,getUniforms:r}=e.assembleGLSLShaderPair({platformInfo:l,...this.props,modules:d,defines:p,pluginInjections:f.injections,pluginVertexInputs:f.vertexInputs,pluginVaryings:f.varyings});this.vs=t,this.fs=i,this._getModuleUniforms=r,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.indexCount=this.props.indexCount,this.firstVertex=this.props.firstVertex,this.firstIndex=this.props.firstIndex,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,this._colorAttachmentFormats=this.props.colorAttachmentFormats,this._depthStencilAttachmentFormat=this.props.depthStencilAttachmentFormat,t.geometry&&this.setGeometry(t.geometry),this.pipelineFactory=t.pipelineFactory||s.N.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||a.g.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=e.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in t&&(this.isInstanced=t.isInstanced),t.instanceCount&&this.setInstanceCount(t.instanceCount),t.vertexCount&&this.setVertexCount(t.vertexCount),t.indexBuffer&&this.setIndexBuffer(t.indexBuffer),t.attributes&&this.setAttributes(t.attributes),t.constantAttributes&&this.setConstantAttributes(t.constantAttributes),t.bindings&&this.setBindings(t.bindings),t.transformFeedback&&(this.transformFeedback=t.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");let e=this._needsRedraw;return this._needsRedraw=!1,e}setNeedsRedraw(e){this._needsRedraw||=e}getBindingDebugTable(){return this._bindingTable}predraw(e){this._syncDynamicBuffers(),this.updateShaderInputs(e),this.material?.updateShaderInputs(e),this.pipeline=this._updatePipeline()}draw(e){let t;if(this._drawBlockedReason&&!this._pipelineNeedsUpdate)return o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${this._drawBlockedReason}`)(),!1;let i=this._areBindingsLoading();if(i)return o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${i} not loaded`)(),!1;this._syncAttachmentFormats(e);try{e.pushDebugGroup(`${this}.predraw(${e})`),"webgpu"===this.device.type?(this.updateShaderInputs(),this.material?.updateShaderInputs(),this._syncDynamicBuffers(),this.pipeline=this._updatePipeline()):this.predraw(this.device.commandEncoder)}finally{e.popDebugGroup()}let r=this.pipeline.isErrored;try{if(e.pushDebugGroup(`${this}.draw(${e})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),r=this.pipeline.isErrored)o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${M}`)(),t=!1;else{let i=this.vertexArray.getDrawValidationError();if(i)o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${i}`)(),this._drawBlockedReason=i,t=!1;else{let i=this._getCurrentShaderLayout(),r=this._getBindings(i),n=this._getBindGroups(i,r),{indexBuffer:s}=this.vertexArray,a=s?this.indexCount??s.byteLength/("uint32"===s.indexType?4:2):void 0;e.setPipeline(this.pipeline),e.setBindings(n,{_bindGroupCacheKeys:this._getBindGroupCacheKeys()}),e.setVertexArray(this.vertexArray),t=!0===this.isInstanced&&0===this.instanceCount||e.draw({isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.isInstanced?this.instanceCount:void 0,indexCount:a,firstVertex:this.firstVertex,firstIndex:this.firstIndex,transformFeedback:this.transformFeedback||void 0,uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}}finally{e.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(e),t?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):r?(this._needsRedraw=M,this._drawBlockedReason=M):this._drawBlockedReason?this._needsRedraw=this._drawBlockedReason:this._needsRedraw="waiting for resource initialization",t}setGeometry(e){this._gpuGeometry?.destroy();let t=e&&function(e,t){if(t instanceof w)return t;let i=(0,y.C)(t),r=function(e,t){if(!t.indices)return;let i=t.indices.value;return e.createBuffer({usage:h.h.INDEX,data:i})}(e,i),{attributes:n,bufferLayout:s}=function(e,t){let i={};for(let[r,n]of Object.entries(t.attributes)){let s=t.bufferLayout.find(e=>e.name===r)?.name||(0,_.l)(r);n&&(i[s]=e.createBuffer({data:n.value,id:`${r}-buffer`}))}return{attributes:i,bufferLayout:t.bufferLayout,vertexCount:t.vertexCount}}(e,i);return new w({topology:i.topology||"triangle-list",bufferLayout:s,vertexCount:i.vertexCount,indices:r,attributes:n})}(this.device,e);if(t){this.setTopology(t.topology||"triangle-list");let e=new L(this.bufferLayout);this.bufferLayout=e.mergeBufferLayouts(t.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(t)}this._gpuGeometry=t}setTopology(e){e!==this.topology&&(this.topology=e,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(e){let t=new L(this.bufferLayout),i=this._gpuGeometry?t.mergeBufferLayouts(e,this._gpuGeometry.bufferLayout):e;!S(i,this.bufferLayout,-1)&&(this.bufferLayout=i,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry))}setParameters(e){S(e,this.parameters,2)||(this.parameters=e,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(e){this.instanceCount=e,void 0===this.isInstanced&&e>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(e){this.vertexCount=e,this.setNeedsRedraw("vertexCount")}setIndexCount(e){this.indexCount=e,this.setNeedsRedraw("indexCount")}setDrawOffsets({firstVertex:e,firstIndex:t}){this.firstVertex=e,this.firstIndex=t,this.setNeedsRedraw("drawOffsets")}setShaderInputs(e){for(let[t,i]of(this.shaderInputs=e,this._uniformStore=new u.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if((0,B.fX)(i)&&!this.material?.ownsModule(t)){let e=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=e}this.setNeedsRedraw("shaderInputs")}setMaterial(e){this.material=e,this.setNeedsRedraw("material")}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(e){Object.assign(this.bindings,e),this.setNeedsRedraw("bindings")}setTransformFeedback(e){this.transformFeedback=e,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(e){let t=e instanceof P.kL?e.buffer:e;this.indexBuffer=t,this._dynamicIndexBufferSource=e instanceof P.kL?{source:e,generation:e.generation}:null,this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(e,t){var i,r;let n,s;this._drawBlockedReason=!1;let a=t?.disableWarnings??this.props.disableWarnings;e.indices&&o.R.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=(i=this.pipeline.shaderLayout,r=this.bufferLayout,n=(0,A.Lv)(i),(s=r.slice()).sort((e,t)=>(0,A.Ef)((0,A.TC)(e).map(e=>n[e]))-(0,A.Ef)((0,A.TC)(t).map(e=>n[e]))),s);let u=new L(this.bufferLayout);for(let[t,i]of Object.entries(e)){let e=i instanceof P.kL?i.buffer:i,r=u.getBufferLayout(t);if(!r){a||o.R.warn(`Model(${this.id}): Missing layout for buffer "${t}".`)();continue}let n=u.getAttributeNamesForBuffer(r),s=!1;for(let t of n){let r=this._attributeInfos[t];if(r){let t="webgpu"===this.device.type?this.vertexArray.getBufferSlot(r.bufferName):r.location;if(null===t){a||o.R.warn(`Model(${this.id}): Missing vertex array slot for buffer "${r.bufferName}".`)();continue}this.vertexArray.setBuffer(t,e),i instanceof P.kL?this._dynamicAttributeBufferSources[t]={source:i,generation:i.generation}:delete this._dynamicAttributeBufferSources[t],s=!0}}s||a||o.R.warn(`Model(${this.id}): Ignoring buffer "${e.id}" for unknown attribute "${t}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(e,t){for(let[i,r]of Object.entries(e)){let e=this._attributeInfos[i];e?this.vertexArray.setConstantWebGL(e.location,r):(t?.disableWarnings??this.props.disableWarnings)||o.R.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${i}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(let e of Object.values(this.bindings))if((0,$.YT)(e)&&!e.isReady)return e.id;for(let e of Object.values(this.material?.bindings||{}))if((0,$.YT)(e)&&!e.isReady)return e.id;return!1}_getBindings(e=this._getCurrentShaderLayout()){let t={};for(let[i,r]of Object.entries(this.bindings)){let n=function(e,t,i){if((0,$.YT)(t)){let r=(0,$.l0)(i,e,{fallbackGroup:0});return r?t.resolveTextureBinding(r):null}return t instanceof P.kL?t.buffer:(0,P.Hd)(t)?(0,P.j8)(t):t}(i,r,e);n&&(t[i]=n)}return t}_getBindGroups(e=this._getCurrentShaderLayout(),t=this._getBindings(e)){let i=e.bindings.length?(0,l.gO)(e,t):{0:t};if(!this.material)return i;for(let[t,r]of Object.entries(this.material.getBindingsByGroup(e))){let e=Number(t);i[e]={...i[e]||{},...r}}return i}_getBindGroupCacheKeys(){let e=this.material?.getBindGroupCacheKey(3);return e?{3:e}:{}}_getBindingsUpdateTimestamp(){let e=0;for(let t of(this._dynamicIndexBufferSource&&(e=Math.max(e,this._dynamicIndexBufferSource.source.updateTimestamp)),Object.values(this._dynamicAttributeBufferSources)))e=Math.max(e,t.source.updateTimestamp);for(let t of Object.values(this.bindings))t instanceof f.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof h.h||t instanceof c.g||t instanceof d.r||t instanceof P.kL?e=Math.max(e,t.updateTimestamp):(0,$.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,P.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof P.kL,t.buffer.updateTimestamp)));return Math.max(e,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(e){let t={...e.attributes};for(let[e]of Object.entries(t))this.pipeline.shaderLayout.attributes.find(t=>t.name===e)||"positions"===e||delete t[e];this.vertexCount=e.vertexCount,this.setIndexBuffer(e.indices||null),this.setAttributes(e.attributes,{disableWarnings:!0}),this.setAttributes(t,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate||=e,this._drawBlockedReason=!1,this.setNeedsRedraw(e)}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null,t=null;this.pipeline&&(o.R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.pipeline.vs,t=this.pipeline.fs),this._pipelineNeedsUpdate=!1;let i=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders}),r=null;this.source?r=i:this.fs&&(r=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,colorAttachmentFormats:this._colorAttachmentFormats,depthStencilAttachmentFormat:this._depthStencilAttachmentFormat,topology:this.topology,parameters:this.parameters,bindGroups:void 0,vs:i,fs:r}),this._attributeInfos=(0,p.P)(this.pipeline.shaderLayout,this.bufferLayout),e&&this.shaderFactory.release(e),t&&t!==e&&this.shaderFactory.release(t)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){let e=o.R.level>3?0:1e4;o.R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,o.R.group(2,`>>> DRAWING MODEL ${this.id}`,{collapsed:o.R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){let e=function(e,t){let i={},r="Values";if(0===e.attributes.length&&!e.varyings?.length)return{"No attributes or varyings":{[r]:"N/A"}};for(let t of e.attributes)if(t){let e=`${t.location} ${t.name}: ${t.type}`;i[`in ${e}`]={[r]:t.stepMode||"vertex"}}for(let t of e.varyings||[]){let e=`${t.location} ${t.name}`;i[`out ${e}`]={[r]:JSON.stringify(t)}}return i}(this.pipeline.shaderLayout,this.id);o.R.table(2,e)();let t=this.shaderInputs.getDebugTable();o.R.table(2,t)();let i=this._getAttributeDebugTable();o.R.table(2,this._attributeInfos)(),o.R.table(2,i)(),o.R.groupEnd(2)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(e){let t=this.device.props.debugFramebuffers;if(this._drawCount++,!t)return;let i=e.props.framebuffer;!function(e,t,i){var r;if("webgl"!==e.device.type)return;let n=(r=e.device,r.userData[E]||={flushing:!1,queuedFramebuffers:[]},r.userData[E]);if(!n.flushing){let r;if(!(r=e.props.framebuffer)||null===r.handle)return function(e,t,i){if(0===i.queuedFramebuffers.length)return;let{gl:r}=e.device,n=r.getParameter(36010),s=r.getParameter(36006),[a,o]=e.device.getDefaultCanvasContext().getDrawingBufferSize(),u=x(t.top,8),l=x(t.left,8);i.flushing=!0;try{for(let e of i.queuedFramebuffers){let[i,n,s,f,h]=function(e){let{framebuffer:t,targetWidth:i,targetHeight:r,topPx:n,leftPx:s,minimap:a}=e,o=a?Math.max(Math.floor(i/4),1):i,u=a?Math.max(Math.floor(r/4),1):r,l=Math.min(o/t.width,u/t.height),f=Math.max(Math.floor(t.width*l),1),h=Math.max(Math.floor(t.height*l),1),c=Math.max(r-n-h,0);return[s,c,s+f,c+h,h]}({framebuffer:e,targetWidth:a,targetHeight:o,topPx:u,leftPx:l,minimap:t.minimap});r.bindFramebuffer(36008,e.handle),r.bindFramebuffer(36009,null),r.blitFramebuffer(0,0,e.width,e.height,i,n,s,f,16384,9728),u+=h+8}}finally{r.bindFramebuffer(36008,n),r.bindFramebuffer(36009,s),i.flushing=!1}}(e,i,n);t&&"colorAttachments"in t&&null!==t.handle&&!n.queuedFramebuffers.includes(t)&&n.queuedFramebuffers.push(t)}}(e,i,{id:i?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){let e={};for(let[t,i]of Object.entries(this._attributeInfos)){let r=this.vertexArray.attributes[i.location];e[i.location]={name:t,type:i.shaderType,values:r?this._getBufferOrConstantValues(r,i.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){let{indexBuffer:t}=this.vertexArray,i="uint32"===t.indexType?new Uint32Array(t.debugData):new Uint16Array(t.debugData);e.indices={name:"indices",type:t.indexType,values:i.toString()}}return e}_getBufferOrConstantValues(e,t){let i=g.r.getTypedArrayConstructor(t);return(e instanceof h.h?new i(e.debugData):e).toString()}_getNonMaterialBindings(e){if(!this.material)return e;let t={};for(let[i,r]of Object.entries(e))this.material.ownsBinding(i)||(t[i]=r);return t}_getCurrentShaderLayout(){return this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]}}_syncDynamicBuffers(){if(this._dynamicIndexBufferSource&&this._dynamicIndexBufferSource.generation!==this._dynamicIndexBufferSource.source.generation){let e=this._dynamicIndexBufferSource.source.buffer;this.indexBuffer=e,this.vertexArray.setIndexBuffer(e),this._dynamicIndexBufferSource.generation=this._dynamicIndexBufferSource.source.generation,this.setNeedsRedraw("dynamic index buffer")}for(let[e,t]of Object.entries(this._dynamicAttributeBufferSources))t.generation!==t.source.generation&&(this.vertexArray.setBuffer(Number(e),t.source.buffer),t.generation=t.source.generation,this.setNeedsRedraw("dynamic attribute buffer"))}_syncAttachmentFormats(e){var t;if("webgpu"!==this.device.type)return;let i=e.framebuffer||e.props.framebuffer,r=e.props,n=r.colorAttachmentFormats??i?.colorAttachments?.map(e=>{var t;return(t=e?.texture?.format)&&!N(t)?t:null}),s=!1===r.depthStencilAttachmentFormat?void 0:r.depthStencilAttachmentFormat??((t=i?.depthStencilAttachment?.texture?.format)&&N(t)?t:void 0);S(this._colorAttachmentFormats,n,1)&&this._depthStencilAttachmentFormat===s||(this._colorAttachmentFormats=n,this._depthStencilAttachmentFormat=s,this._setPipelineNeedsUpdate("attachment formats"))}}function k(e,t){return(void 0===e.shaderLanguage||e.shaderLanguage===t)&&("glsl"===t?"assembleGLSLShaderPair"in e&&"function"==typeof e.assembleGLSLShaderPair:"assembleWGSLShader"in e&&"function"==typeof e.assembleWGSLShader)}function N(e){return O.includes(e)}},20131(e,t,i){i.d(t,{l:()=>a});var r=i(13559),n=i(65261),s=i(91334);class a{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;directBindings={};constructor(e,t){for(let i of(Object.assign(this.options,t),(0,n.$Q)(Object.values(e).filter(h))))e[i.name]=i;for(let[t,i]of(r.R.log(1,"Creating ShaderInputs with modules",Object.keys(e))(),this.modules=e,this.moduleUniforms={},this.moduleBindings={},Object.entries(e)))i&&(this._addModule(i),i.name&&t!==i.name&&!this.options.disableWarnings&&r.R.warn(`Module name: ${t} vs ${i.name}`)())}destroy(){}setProps(e){for(let t of(e.bindings&&Object.assign(this.directBindings,e.bindings),Object.keys(e))){if("bindings"===t)continue;let i=e[t]||{},n=this.modules[t];if(n){let e=this.moduleUniforms[t],r=this.moduleBindings[t],{uniforms:a,bindings:u}=function(e,t={}){let i={bindings:{},uniforms:{}};return Object.keys(e).forEach(r=>{let n=e[r];Object.prototype.hasOwnProperty.call(t,r)||(0,s.H9)(n)||"number"==typeof n||"boolean"==typeof n?i.uniforms[r]=n:i.bindings[r]=n}),i}(n.getUniforms?.(i,e)||i,n.uniformTypes);this.moduleUniforms[t]=o(e,a,n.uniformTypes),this.moduleBindings[t]={...r,...u}}else this.options.disableWarnings||r.R.warn(`Module ${t} not found`)()}}getModules(){return Object.values(this.modules)}addModules(e){for(let t of(0,n.$Q)(e)){let e=t.name;this.modules[e]||(this.modules[e]=t,this._addModule(t))}}getUniformValues(){return this.moduleUniforms}getBindingValues(){let e={};for(let t of Object.values(this.moduleBindings))Object.assign(e,t);return Object.assign(e,this.directBindings),e}getModuleBindingValues(e){let t=this.moduleBindings[e];return t?{...t}:{}}getDebugTable(){let e={};for(let[t,i]of Object.entries(this.moduleUniforms))for(let[r,n]of Object.entries(i))e[`${t}.${r}`]={type:this.modules[t].uniformTypes?.[r],value:String(n)};return e}_addModule(e){let t=e.name;this.moduleUniforms[t]=o({},e.defaultUniforms||{},e.uniformTypes),this.moduleBindings[t]={}}}function o(e={},t={},i={}){let r={...e};for(let[n,s]of Object.entries(t))void 0!==s&&(r[n]=function e(t,i,r){if(!r||"string"==typeof r)return u(i);if(Array.isArray(r)){if(l(i)||!Array.isArray(i))return u(i);let n=Array.isArray(t)&&!l(t)?[...t]:[],s=n.slice();for(let t=0;t<i.length;t++){let a=i[t];void 0!==a&&(s[t]=e(n[t],a,r[0]))}return s}if(!f(i))return u(i);let n=f(t)?t:{},s={...n};for(let[t,a]of Object.entries(i))void 0!==a&&(s[t]=e(n[t],a,r[t]));return s}(e[n],s,i[n]));return r}function u(e){return ArrayBuffer.isView(e)?Array.prototype.slice.call(e):Array.isArray(e)?l(e)?e.slice():e.map(e=>void 0===e?void 0:u(e)):f(e)?Object.fromEntries(Object.entries(e).map(([e,t])=>[e,void 0===t?void 0:u(t)])):e}function l(e){return ArrayBuffer.isView(e)||Array.isArray(e)&&(0===e.length||"number"==typeof e[0])}function f(e){return!!e&&"object"==typeof e&&!Array.isArray(e)&&!ArrayBuffer.isView(e)}function h(e){return!!e?.dependencies}},92790(e,t,i){function r(e,t){if(!e||!t.some(e=>e.bindingLayout?.length))return e;let i={...e,bindings:e.bindings.map(e=>({...e}))};for(let r of("attributes"in(e||{})&&(i.attributes=e?.attributes||[]),t))for(let e of r.bindingLayout||[])for(let t of function(e){let t=new Set([e,`${e}Uniforms`]);return e.endsWith("Uniforms")||t.add(`${e}Sampler`),[...t]}(e.name)){let r=i.bindings.find(e=>e.name===t);r?.group===0&&(r.group=e.group),r&&void 0!==e.visibility&&(r.visibility=e.visibility)}return i}function n(e,t,i=[]){return e?t?{...e,attributes:e.attributes.length?function(e,t){let i=e.map(e=>({...e})),r=new Map(e.map(e=>[e.name,e])),n=new Map(e.map(e=>[e.location,e]));for(let e of t){let t=r.get(e.name);if(t){if(t.type!==e.type||t.location!==e.location)throw Error(`Shader attribute "${e.name}" conflicts with its inferred type or location`);continue}let s=n.get(e.location);if(s)throw Error(`Shader attributes "${s.name}" and "${e.name}" both use location ${e.location}`);i.push({...e})}return i}(e.attributes,t.attributes.filter(e=>i.includes(e.name))):t.attributes,bindings:function(e,t){let i=e.map(e=>({...e})),r=new Set(e.map(e=>e.name)),n=new Set(e.map(e=>`${e.group}:${e.location}`));for(let e of t){let t=`${e.group}:${e.location}`;r.has(e.name)||n.has(t)||i.push({...e})}return i}(e.bindings,t.bindings)}:e:t}function s(e){return!!(e.uniformTypes&&!function(e){for(let t in e)return!1;return!0}(e.uniformTypes))}function a(e,t){let i=[],r=new Set;for(let n of[...e||[],...t||[]])r.has(n.name)||(r.add(n.name),i.push(n));return i}i.d(t,{He:()=>n,Y$:()=>r,fX:()=>s,jY:()=>a})},51208(e,t,i){i.d(t,{L:()=>n});let r={};function n(e="id"){r[e]=r[e]||1;let t=r[e]++;return`${e}-${t}`}},14878(e,t,i){i.d(t,{I:()=>n});var r=i(6646);class n{buffer;format;length;byteOffset;byteStride;constructor(e){let t=r.E.getVertexFormatInfo(e.format).byteLength,i=e.byteOffset??0,n=e.byteStride??t;if(s(e.length,"GPUDataView length"),s(i,"GPUDataView byteOffset"),s(n,"GPUDataView byteStride"),n<t)throw Error(`GPUDataView byteStride ${n} is smaller than ${e.format} byte length ${t}`);let a=0===e.length?0:(e.length-1)*n+t,o=i+a;if(!Number.isSafeInteger(a)||!Number.isSafeInteger(o))throw Error("GPUDataView byte range must use safe integers");if(o>e.buffer.byteLength)throw Error("GPUDataView exceeds its backing buffer byte length");this.buffer=e.buffer,this.format=e.format,this.length=e.length,this.byteOffset=i,this.byteStride=n}get elementByteLength(){return r.E.getVertexFormatInfo(this.format).byteLength}get byteLength(){return 0===this.length?0:(this.length-1)*this.byteStride+this.elementByteLength}}function s(e,t){if(!Number.isSafeInteger(e)||e<0)throw Error(`${t} must be a non-negative safe integer`)}},83672(e,t,i){i.d(t,{L:()=>h});var r=i(14878),n=i(6646),s=i(73348);function a(e){return!!(e&&"object"==typeof e&&"struct"===e.type)}function o(e,t){return 1===t?e:`vec${t}<${e}>`}function u(e,t){return Math.ceil(e/t)*t}var l=i(22585);class f{buffer;ownsDataBuffer;constructor(e,t){this.buffer=e,this.ownsDataBuffer=t}get ownsBuffer(){return this.ownsDataBuffer}transferBufferOwnership(e){if(e.buffer!==this.buffer)throw Error("GPUData ownership can only be transferred to the same buffer");e.ownsDataBuffer=this.ownsDataBuffer,this.ownsDataBuffer=!1}destroy(){this.ownsDataBuffer&&(this.buffer.destroy(),this.ownsDataBuffer=!1)}}let h=class extends f{dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;readbackMetadata;valueOffsets;nullBitmap;valueByteLength;constructor(e){let t,{buffer:i,format:r,length:f,valueLength:h,stride:c,byteOffset:d=0,byteStride:p,rowByteLength:g,ownsBuffer:m=!1,readbackMetadata:b,valueOffsets:_,nullBitmap:y,valueByteLength:v,dataType:w}=e;super(i,m);let E=a(t=r?"string"==typeof r?r:function(e,t){let i=Object.entries(e);if(0===i.length)throw Error("GPUData struct format must declare at least one field");return"packed"===t?function(e){let t=[],i=0,r=0;for(let[s,a]of e){let e=n.E.getVertexFormatInfo(a);if(e.webglOnly)throw Error(`Packed GPUData struct field "${s}" uses WebGL-only format ${a}`);i=u(i,Math.min(4,e.byteLength)),t.push([s,Object.freeze({format:a,byteOffset:i,byteLength:e.byteLength})]),i+=e.byteLength,r+=e.components}return Object.freeze({type:"struct",layout:"packed",fields:Object.freeze(Object.fromEntries(t)),components:r,byteStride:u(i,4),rowByteLength:i})}(i):function(e){let t=Object.fromEntries(e.map(([e,t])=>[e,function(e){let t=n.E.getVertexFormatInfo(e);switch(t.type){case"float32":return o("f32",t.components);case"sint32":return o("i32",t.components);case"uint32":return o("u32",t.components);default:return o("u32",Math.ceil(t.byteLength/4))}}(t)])),i=(0,s.Pr)(t,{layout:"wgsl-storage"}),r=[],a=0,u=0;for(let[t,s]of e){let e=n.E.getVertexFormatInfo(s),o=4*i.fields[t].offset;r.push([t,Object.freeze({format:s,byteOffset:o,byteLength:e.byteLength})]),a=Math.max(a,o+e.byteLength),u+=e.components}return Object.freeze({type:"struct",layout:"wgsl-storage",fields:Object.freeze(Object.fromEntries(r)),components:u,byteStride:i.byteLength,rowByteLength:a})}(i)}(r,e.layout??"wgsl-storage"):void 0)?t:void 0,x="string"==typeof t?(0,l.Ft)(t):void 0;if(this.dataType=w,this.format=t,this.length=f,this.valueLength=h??f,this.stride=c??x?.components??E?.components??p??g??1,this.byteOffset=d,this.rowByteLength=g??E?.rowByteLength??x?.byteLength??p??this.stride,this.byteStride=p??E?.byteStride??this.rowByteLength,E){if(this.rowByteLength<E.rowByteLength)throw Error(`GPUData rowByteLength ${this.rowByteLength} is smaller than struct format row byte length ${E.rowByteLength}`);if(this.byteStride<Math.max(E.byteStride,this.rowByteLength))throw Error(`GPUData byteStride ${this.byteStride} is smaller than its struct row layout`)}this.readbackMetadata=b,this.valueOffsets=_,this.nullBitmap=y,this.valueByteLength=v}getChild(e){if(!a(this.format))return null;let t=this.format.fields[e];return t?new r.I({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}getChildAt(e){if(!a(this.format))return null;let t=Object.values(this.format.fields)[e];return t?new r.I({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}}},22585(e,t,i){i.d(t,{Ft:()=>u,Tm:()=>a,u4:()=>o});var r=i(6646);let n=/^vertex-list<([^<>]+)>$/,s=/^value-list<([^<>]+)>$/;function a(e){return n.test(e)}function o(e){return s.test(e)}function u(e){let t=function(e){let t=n.exec(e),i=s.exec(e),a=t?.[1]??i?.[1]??e;try{r.E.getVertexFormatInfo(a)}catch{throw Error(`Unsupported GPUVector format ${e}`)}return a}(e),i=a(e),u=o(e),l=r.E.getVertexFormatInfo(t),f=l.type,h=l.normalized,c=function(e,t){if(t)return"f32";switch(e){case"float32":return"f32";case"float16":return"f16";case"uint8":case"uint16":case"uint32":return"u32";case"sint8":case"sint16":case"sint32":return"i32";default:throw Error(`Unsupported GPUVector component type ${e}`)}}(f,h);return{format:e,elementFormat:t,vertexList:i,valueList:u,type:f,signedDataType:function(e,t){if("unorm10-10-10-2"===e)return"uint32";switch(t){case"unorm8":return"uint8";case"snorm8":return"sint8";case"unorm16":return"uint16";case"snorm16":return"sint16";default:return t}}(t,f),primitiveType:c,components:l.components,byteLength:l.byteLength,integer:l.integer,signed:l.signed,normalized:h,...l.webglOnly?{webglOnly:!0}:{}}}},30193(e,t,i){i.d(t,{M:()=>s});var r=i(83672),n=i(22585);class s{name;dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;bufferLayout;data=[];device;bufferProps;isAppendable=!1;ownsDataChunks=!0;ownedVectors=[];appendableByteLength=0;constructor(e){switch(e.type){case"buffer":{let{name:t,buffer:i,format:n,length:s,valueLength:o=s,byteOffset:u=0,ownsBuffer:l=!1}=e,{stride:f,byteStride:h,rowByteLength:c}=a(e);this.name=t,this.dataType=e.dataType,this.format=n,this.length=s,this.valueLength=o,this.stride=f,this.byteOffset=u,this.byteStride=h,this.rowByteLength=c,this.data.push(new r.L({buffer:i,format:n,length:s,valueLength:o,stride:f,byteOffset:u,byteStride:h,rowByteLength:c,ownsBuffer:l,dataType:e.dataType}));return}case"interleaved":{let{name:t,buffer:i,format:n,length:s,valueLength:a=s,byteOffset:o=0,byteStride:u,attributes:l,ownsBuffer:f=!1}=e;this.name=t,this.dataType=e.dataType,this.format=n,this.length=s,this.valueLength=a,this.stride=u,this.byteOffset=o,this.byteStride=u,this.rowByteLength=u,this.bufferLayout={name:t,byteStride:u,attributes:l},this.data.push(new r.L({buffer:i,format:n,length:s,valueLength:a,stride:u,byteOffset:o,byteStride:u,rowByteLength:u,ownsBuffer:f,dataType:e.dataType}));return}case"data":{var t;let i=e.format??(t=e.data,t[0]?.format),r=i?(0,n.Ft)(i):void 0,{name:s,data:a,stride:o=a[0]?.stride??r?.components??1,valueLength:u=a.reduce((e,t)=>e+t.valueLength,0),byteStride:l=a[0]?.byteStride??r?.byteLength,rowByteLength:f=a[0]?.rowByteLength??r?.byteLength,bufferLayout:h,ownsData:c=!1}=e;if(void 0===l||void 0===f)throw Error("GPUVector requires format or explicit byte layout metadata");i&&function(e,t){if(e.find(e=>e.format!==t))throw Error("GPUVector data chunks must share the declared format")}(a,i),this.name=s,this.dataType=e.dataType,this.format=i,this.length=a.reduce((e,t)=>e+t.length,0),this.valueLength=u,this.stride=o,this.byteOffset=1===a.length?a[0].byteOffset:0,this.byteStride=l,this.rowByteLength=f,this.bufferLayout=h,this.ownsDataChunks=c,this.data.push(...a);return}case"appendable":{let{name:t,device:i,format:r,valueLength:n=0,bufferProps:s}=e,{stride:o,byteStride:u,rowByteLength:l}=a(e);this.name=t,this.dataType=e.dataType,this.format=r,this.length=0,this.valueLength=n,this.stride=o,this.byteOffset=0,this.byteStride=u,this.rowByteLength=l,this.device=i,this.bufferProps=s,this.isAppendable=!0;return}}}get ownsBuffer(){return this.ownsDataChunks&&this.data.some(e=>e.ownsBuffer)||this.ownedVectors.some(e=>e.ownsBuffer)}get capacityRows(){return this.isAppendable?this.length:void 0}get appendedByteLength(){return this.appendableByteLength}addData(e){if(this.format&&e.format!==this.format)throw Error("GPUVector.addData() requires matching formats");if(e.byteStride!==this.byteStride)throw Error("GPUVector.addData() requires matching byteStride");if(e.rowByteLength!==this.rowByteLength)throw Error("GPUVector.addData() requires matching rowByteLength");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this}appendDataChunk(e,t=this.appendableByteLength+e.buffer.byteLength){if(!this.isAppendable)throw Error("GPUVector.appendDataChunk() requires appendable vector storage");if(this.format&&e.format!==this.format)throw Error("GPUVector.appendDataChunk() requires matching formats");if(e.byteStride!==this.byteStride||e.rowByteLength!==this.rowByteLength)throw Error("GPUVector.appendDataChunk() requires matching byte layout metadata");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this.appendableByteLength=t,this}resetLastBatch(){if(!this.isAppendable)throw Error("GPUVector.resetLastBatch() requires appendable vector storage");for(let e of this.data.splice(0))e.destroy();return this.length=0,this.valueLength=0,this.appendableByteLength=0,this}retainOwnedVectors(e){return this.ownedVectors.push(...e),this}transferBufferOwnership(e){let t=this.data[0],i=e.data[0];if(!t||!i||t.buffer!==i.buffer)throw Error("GPUVector ownership can only be transferred to the same buffer");t.transferBufferOwnership(i)}destroy(){if(this.ownsDataChunks)for(let e of this.data)e.destroy();for(let e of this.ownedVectors.splice(0))e.destroy()}}function a(e){let t=e.format?(0,n.Ft)(e.format):void 0,i=e.rowByteLength??e.byteStride??t?.byteLength;if(void 0===i)throw Error("GPUVector requires format or explicit rowByteLength");return{stride:e.stride??t?.components??1,byteStride:e.byteStride??i,rowByteLength:i}}},48894(e,t,i){i.d(t,{G:()=>E});var r={};i.r(r),i.d(r,{arithmetic:()=>u,dot:()=>d,equalAll:()=>p,extent:()=>l,fround:()=>f,gather:()=>h,interleave:()=>c,length:()=>g,segmentedMap:()=>m,select:()=>_,sequence:()=>v,swizzle:()=>w});var n=i(13559),s=i(95309);function a({elementWise:e,func:t,inputs:i,output:r,outputBuffer:n}){let s=Array.isArray(i)?i:Object.values(i);for(let e of s)if(!e.value)throw Error(`${e} does not have CPU value`);let u=r.length,l=r.size,f=new r.ValueType(u*l);for(let i=0;i<u;i++){let r=s.map(e=>o(e,i));if(e)for(let e=0;e<l;e++)f[i*l+e]=t.apply(null,r.map(t=>t[e]));else t.call(null,f.subarray(i*l,i*l+l),...r)}let h=r.ValueType.BYTES_PER_ELEMENT,c=r.offset/h,d=r.stride/h,p=f;if(0!==c||d!==l){p=new r.ValueType(c+r.byteLength/h);for(let e=0;e<u;e++){let t=e*l,i=c+e*d,r=f.subarray(t,t+l);p.set(r,i),n.write(r,i*h)}}else n.write(f);return{success:!0,value:p}}function o(e,t){let i=e.value,r=e.size,n=e.offset/e.ValueType.BYTES_PER_ELEMENT,s=e.stride/e.ValueType.BYTES_PER_ELEMENT,a=n+(e.isConstant?0:t)*s,o=i.slice(a,a+r);if(!e.normalized)return o;let u=new Float32Array(r);for(let t=0;t<r;t++)u[t]=function(e,t){switch(t){case"uint8":return e/255;case"uint16":return e/65535;case"uint32":return e/0xffffffff;case"sint8":return Math.max(e/127,-1);case"sint16":return Math.max(e/32767,-1);case"sint32":return Math.max(e/0x7fffffff,-1);case"float32":return e;default:throw Error(`Unsupported normalized source type ${t}`)}}(o[t],e.type);return u}let u=({inputs:e,output:t,target:i})=>{for(let t of Object.values(e.namedInputs))if(!t.value)throw Error(`${t} does not have CPU value`);let r=new t.ValueType(t.length*t.size);for(let i=0;i<t.length;i++){let n=Object.fromEntries(Object.entries(e.namedInputs).map(([e,t])=>[e,o(t,i)]));for(let a=0;a<t.size;a++)r[i*t.size+a]=function e(t,i,r){switch(t.kind){case"input":{let e=i[t.name];if(r<e.length)return e[r];return 1===e.length?e[0]:0}case"literal":if(Array.isArray(t.value))return t.value[r]??0;return t.value;case"call":{!function(e,t){let i=s.E[e].arity;if(t!==i)throw Error(`Arithmetic op '${e}' expects ${i} args, got ${t}`)}(t.op,t.args.length);let n=t.args.map(t=>e(t,i,r));switch(t.op){case"add":return n[0]+n[1];case"subtract":return n[0]-n[1];case"multiply":return n[0]*n[1];case"divide":return n[0]/n[1];case"pow":return Math.pow(n[0],n[1]);case"sqrt":return Math.sqrt(n[0]);case"abs":return Math.abs(n[0]);case"sin":return Math.sin(n[0]);case"cos":return Math.cos(n[0]);case"tan":return Math.tan(n[0]);case"exp":return Math.exp(n[0]);case"log":return Math.log(n[0]);default:{let e=t.op;throw Error(`Unsupported arithmetic op ${e}`)}}}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e.expression,n,a)}return i.write(r),{success:!0,value:r}},l=({inputs:e,output:t,target:i})=>{let{sourceValues:r}=e;if(!r.value)throw Error(`${r} does not have CPU value`);let n=new t.ValueType(t.length*t.size);if(0===r.length)return{success:!1,error:Error(`${r} is empty`)};for(let e=0;e<r.size;e++){let i=o(r,0)[e],s=e*t.size,a=s+1;n[s]=i,n[a]=i;for(let t=1;t<r.length;t++){let i=o(r,t)[e];i<n[s]&&(n[s]=i),i>n[a]&&(n[a]=i)}}return i.write(n),{success:!0,value:n}},f=({inputs:e,output:t,target:i})=>a({func:(e,t)=>{let i=e.length/2,r=new Float64Array(t.buffer);for(let t=0;t<i;t++){let n=r[t];e[t]=Math.fround(n),e[t+i]=n-e[t]}return e},inputs:e,output:t,outputBuffer:i}),h=async({inputs:e,output:t,target:i})=>{let{ids:r,sourceValues:n}=e,s=r.value,a=n.value;if(!s)throw Error(`${r} does not have CPU value`);if(!a)throw Error(`${n} does not have CPU value`);let u=new t.ValueType(t.length*t.size),l=Array(t.size).fill(0);for(let e=0;e<t.length;e++){var f,h;let i=Number(o(r,e)[0]),s=(f=i,h=n.length,Number.isInteger(f)&&f>=0&&f<h)?o(n,i):l;u.set(s,e*t.size)}return i.write(u),{success:!0,value:u}},c=({inputs:e,output:t,target:i})=>a({func:(e,...t)=>{let i=0;for(let r of t)e.set(r,i),i+=r.length},inputs:e,output:t,outputBuffer:i}),d=({inputs:e,output:t,target:i})=>{let{x:r,y:n}=e,s=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(r,e),i=o(n,e),a=0;for(let e=0;e<r.size;e++)a+=t[e]*i[e];s[e]=a}return i.write(s),{success:!0,value:s}},p=({inputs:e,output:t,target:i})=>{let{x:r,y:n}=e,s=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(r,e),i=o(n,e),a=1;for(let e=0;e<r.size;e++)if(t[e]!==i[e]){a=0;break}s[e]=a}return i.write(s),{success:!0,value:s}},g=({inputs:e,output:t,target:i})=>{let{x:r}=e,n=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(r,e),i=0;for(let e=0;e<r.size;e++)i+=t[e]*t[e];n[e]=Math.sqrt(i)}return i.write(n),{success:!0,value:n}},m=async({inputs:e,output:t,target:i})=>{let{segments:r,vertexCount:n}=e,s=r.value;if(!s)throw Error(`${r} does not have CPU value`);var a=s,o=r,u=n;if(o.length<1)throw Error("segmentedMap segments must contain at least one segment start");let l=0;for(let e=0;e<o.length;e++){let t=a[b(o,e)];if(0===e&&0!==t)throw Error(`segmentedMap segments must start at 0, got ${t}`);if(e>0&&t<l)throw Error(`segmentedMap segments must be non-decreasing, got ${t} after ${l}`);l=t}if(l>u)throw Error(`segmentedMap last segment start must be <= vertexCount, got ${l} > ${u}`);let f=new t.ValueType(t.length*t.size),h=0;for(let e=0;e<n;e++){for(;h+1<r.length&&s[b(r,h+1)]<=e;)h++;let i=s[b(r,h)],n=e*t.size;f[n]=h,f[n+1]=e-i}return i.write(f),{success:!0,value:f}};function b(e,t){return e.offset/e.ValueType.BYTES_PER_ELEMENT+t*(e.stride/e.ValueType.BYTES_PER_ELEMENT)}let _=async({inputs:e,output:t,target:i})=>{let{condition:r,whenTrue:n,whenFalse:s}=e,a=new t.ValueType(t.length*t.size);for(let e=0;e<t.length;e++){let i=o(r,e),u=o(n,e),l=o(s,e);for(let o=0;o<t.size;o++){let f=y(i,r.size,o);a[e*t.size+o]=0!==f?y(u,n.size,o):y(l,s.size,o)}}return i.write(a),{success:!0,value:a}};function y(e,t,i){return i<t?e[i]:1===t?e[0]:0}let v=({inputs:e,output:t,target:i})=>{let r=new t.ValueType(t.length);for(let i=0;i<t.length;i++)r[i]=e.start+i*e.step;return i.write(r),{success:!0,value:r}},w=({inputs:e,output:t,target:i})=>{let{columns:r}=e;return a({func:(e,t)=>{for(let i=0;i<r.length;i++)e[i]=t[r[i]]},inputs:{x:e.x},output:t,outputBuffer:i})},E=new class{_modules={cpu:r};add(e,t){let i=this._modules[e];if("function"==typeof t.then){let r=Promise.all([Promise.resolve(i||{}),t]).then(([e,t])=>({...e,...t}));return this._modules[e]=r,r.then(t=>{this._modules[e]=t}).catch(t=>{n.R.error(`Failed to register ${e} backend: ${t}`)()}),r}if(i&&"function"==typeof i.then){let r=Promise.resolve(i).then(e=>({...e,...t})).then(t=>(this._modules[e]=t,t)).catch(t=>{throw n.R.error(`Failed to register ${e} backend: ${t}`)(),t});return this._modules[e]=r,r}let r={...i||{},...t};return this._modules[e]=r,Promise.resolve(r)}async get(e,t){let r=this._modules[e];if(!r)if("webgl"===e)r=this.add("webgl",i.e("2671").then(i.bind(i,55554)));else if("webgpu"===e)r=this.add("webgpu",i.e("5632").then(i.bind(i,85251)));else throw Error(`${e} backend not registered`);let n=(await r)[t];if("function"!=typeof n)throw Error(`${e} backend does not implement ${t}`);return n}getSync(e,t){let i=this._modules[e];if(!i)throw Error(`${e} backend not registered`);if("function"==typeof i.then)throw Error(`${e} backend is not loaded yet`);let r=i[t];if("function"!=typeof r)throw Error(`${e} backend does not implement ${t}`);return r}clear(){this._modules={}}}},64238(e,t,i){i.d(t,{GL:()=>f,uy:()=>h});var r=i(36794),n=i(82645),s=i(14878),a=i(30193),o=i(83672),u=i(22585),l=i(66008);class f{static get bufferPoolSize(){return l.R.poolSize}static set bufferPoolSize(e){if(!Number.isSafeInteger(e)||e<0)throw Error("GPUDataEvaluator.bufferPoolSize must be a non-negative safe integer");l.R.poolSize=e,l.R.purge()}type;size;get offset(){return this._offset}get stride(){return this._stride}normalized;isConstant;length;get byteLength(){return this._byteLength}ValueType;source=null;format;_id;_destroyed=!1;_value;_offset;_stride;_byteLength;_gpuVector;_bufferOwnership="owned";_targetBuffer;static fromArray(e,{type:t,size:i=1,offset:n=0,stride:s=0,normalized:a=!1}){let o,u=t;return Array.isArray(e)?(u=u||"float32",o=new((0,r.Y0)(u))(e)):e instanceof Float64Array?(u="uint32",i*=2,n*=2,s*=2,o=new Uint32Array(e.buffer,e.byteOffset,e.byteLength/4)):(u=u||(0,r.UE)(e),o=e),new f({id:`<${u} * ${i}>`,type:u,size:i,offset:n,stride:s,normalized:a,value:o})}static fromConstant(e,t="float32"){let i,n=(0,r.Y0)(t);return Array.isArray(e)?i=`[${e.join(",")}]`:(i=String(e),e=[e]),new f({id:i,isConstant:!0,type:t,size:e.length,value:new n(e)})}static fromGPUData(e,t={}){return function(e){if(!e.format)throw Error("GPUDataEvaluator.fromGPUData() requires GPUData format metadata");if((0,u.Tm)(e.format)||(0,u.u4)(e.format))throw Error("GPUDataEvaluator.fromGPUData() does not support variable-length input");let t=(0,u.Ft)(e.format).byteLength;if(e.rowByteLength!==t)throw Error(`GPUDataEvaluator.fromGPUData() requires rowByteLength ${t} for GPUData`)}(e),new f({...c(new s.I({buffer:e.buffer,format:e.format,length:e.length,byteOffset:e.byteOffset,byteStride:e.byteStride})),id:t.id,gpuData:e})}static fromGPUDataView(e,t={}){return new f({...c(e),id:t.id,buffer:e.buffer})}constructor(e){let{id:t,value:i,buffer:n,gpuData:s,format:o,source:u=null,isConstant:l=!1}=e;if(!u&&!i&&!n&&!s)throw Error("GPUDataEvaluator must have a value source");let{type:h,size:c,offset:d,stride:p,normalized:g,length:m}=e;if(u instanceof f?(h=h??u.type,c=c??u.size,d=d??u.offset,p=p??u.stride,g=g??u.normalized,m=m??u.length):(c=c??1,d=d??0,g=g??!1,m=l?1:m),!h)throw Error("GPUDataEvaluator: type not defined");if(this._id=t,this.type=h,this.size=c,this.ValueType=(0,r.Y0)(this.type),this._offset=d,this._stride=p||this.ValueType.BYTES_PER_ELEMENT*c,this.normalized=g,this.source=u,this.format=o,void 0===m)if(l)m=1;else{if(!i)throw Error("GPUDataEvaluator: length not defined");m=Math.ceil(i.byteLength/this.stride)}this.isConstant=l,this.length=m;let b=this.ValueType.BYTES_PER_ELEMENT*this.size;this._byteLength=0===m?0:(m-1)*this.stride+b,this._value=i,this._bufferOwnership=u instanceof f||n||s?"borrowed":"owned",s?this._gpuVector=new a.M({type:"data",name:this._id??"data",format:s.format,data:[s],stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength}):n&&(this._gpuVector=this.createGPUVectorView({buffer:n,name:this._id,format:this.format}))}get value(){return this._value||(this.source instanceof f?this.source.value:void 0)}get evaluated(){return!!this._gpuVector}get id(){return this._id}get gpuVector(){if(!this._gpuVector)throw Error(`${this} not evaluated`);return this._gpuVector}get buffer(){return d(this.gpuVector)}setTargetBuffer({buffer:e,byteOffset:t=0,byteStride:i=this.stride}){if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)throw Error(`GPUDataEvaluator ${this} already evaluated`);if(!this.source||this.source instanceof f)throw Error("GPUDataEvaluator target buffers require a deferred operation source");this._targetBuffer={buffer:e,byteOffset:t,byteStride:i}}async evaluate(e,t={}){let i;if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;if(this.source instanceof f){let i=await this.source.evaluate(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:d(i)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{let t=await this.source.execute(e,i);if(!t.success)throw t.error||Error(`${this.source} evaluation failed`);t.value&&(this._value=t.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}evaluateSync(e,t={}){let i;if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;if(this.source instanceof f){let i=this.source.evaluateSync(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:d(i)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{let t=this.source.executeSync(e,i);if(!t.success)throw t.error||Error(`${this.source} evaluation failed`);t.value&&(this._value=t.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}createGPUVectorView(e){let t=e.name??this._id??"vector",i=e.format??this.format??function(e,t,i=!1){return t>=1&&t<=4?p(e,t,i):void 0}(this.type,this.size,this.normalized);if(e.interleaved){var r;let i,n="object"==typeof e.interleaved&&e.interleaved.attributes?e.interleaved.attributes:(r=this,function e(t,i,r){let n=t.source;if(n&&!(n instanceof f)&&"interleave"===n.name){for(let t of Object.values(n.inputs))t instanceof f&&e(t,i,r);return}i.push({attribute:t.id??t.toString(),format:p(t.type,t.size,t.normalized),byteOffset:r.byteOffset}),r.byteOffset+=t.ValueType.BYTES_PER_ELEMENT*t.size}(r,i=[],{byteOffset:0}),i);return new a.M({type:"interleaved",name:t,buffer:e.buffer,format:e.format??this.format,length:this.length,byteOffset:this.offset,byteStride:this.stride,attributes:n,ownsBuffer:!1})}return new a.M({type:"buffer",name:t,buffer:e.buffer,format:i,length:this.length,stride:this.size,byteOffset:this.offset,byteStride:this.stride,rowByteLength:this.ValueType.BYTES_PER_ELEMENT*this.size,ownsBuffer:!1})}_getEvaluationBuffer(e){let t=this._targetBuffer;if(!t)return l.R.createOrReuse(e,this.byteLength);if(t.buffer.device!==e)throw Error("GPUDataEvaluator target buffer belongs to a different device");let i=this.ValueType.BYTES_PER_ELEMENT*this.size,r=0===this.length?0:(this.length-1)*t.byteStride+i;if(t.byteOffset+r>t.buffer.byteLength)throw Error("GPUDataEvaluator target buffer is too small for the output layout");return this._offset=t.byteOffset,this._stride=t.byteStride,this._byteLength=r,this._bufferOwnership="borrowed",this._targetBuffer=void 0,t.buffer}async readValue(e=0,t){let{ValueType:i}=this,{size:r,offset:n,stride:s,length:a}=this,o=i.BYTES_PER_ELEMENT*r;if(t=t??a,t=Math.max(e=Math.max(0,Math.min(a,e)),Math.min(a,t)),this._value)return function(e,t,i,r){let{ValueType:n,size:s,offset:a,stride:o}=e,u=o/n.BYTES_PER_ELEMENT,l=a/n.BYTES_PER_ELEMENT,f=r-i;if(u===s){let e=l+i*u;return t.subarray(e,e+f*s)}let h=new n(f*s);for(let e=0;e<f;e++){let r=l+(i+e)*u;h.set(t.subarray(r,r+s),e*s)}return h}(this,this._value,e,t);let u=t-e;if(0===u)return new i(0);let l=n+e*s,f=await this.buffer.readAsync(l,s===o?u*o:(u-1)*s+o),h=new i(f.buffer,f.byteOffset,f.byteLength/i.BYTES_PER_ELEMENT);if(s===o)return h;let c=new Uint8Array(o*u);for(let e=0;e<u;e++){let t=e*s;c.set(f.subarray(t,t+o),e*o)}return new i(c.buffer)}async ensureCPUValue(){let e=this.value;if(e)return e;let t=await this.buffer.readAsync(0,this.offset+this.byteLength);if(t.byteLength%this.ValueType.BYTES_PER_ELEMENT!=0)throw Error(`${this} backing buffer byte length is not aligned to its scalar type`);let i=t.slice();return this._value=new this.ValueType(i.buffer,i.byteOffset,i.byteLength/this.ValueType.BYTES_PER_ELEMENT),this._value}ensureCPUValueSync(){let e=this.value;if(e)return e;throw Error(`${this} CPU value is not available for synchronous evaluation`)}toString(){return this._id??this.source?.toString()??this.constructor.name}destroy(){this._gpuVector&&("owned"===this._bufferOwnership&&l.R.recycle(d(this._gpuVector)),this._gpuVector=void 0),this._targetBuffer=void 0,this._destroyed=!0}}function h(e){if(e instanceof f)return e;if(e instanceof o.L)return f.fromGPUData(e);if(e instanceof s.I)return f.fromGPUDataView(e);throw Error("getGPUDataEvaluator() requires GPUDataEvaluator, GPUData, or GPUDataView")}function c(e){let t=(0,u.Ft)(e.format),i=(0,r.Y0)(t.signedDataType),n=i.BYTES_PER_ELEMENT*t.components;if(t.byteLength!==n)throw Error(`GPUDataEvaluator does not support packed vertex format ${e.format}: ${t.byteLength} physical bytes cannot expose ${t.components} ${t.signedDataType} components`);if(e.byteOffset%i.BYTES_PER_ELEMENT!=0||e.byteStride%i.BYTES_PER_ELEMENT!=0)throw Error(`GPUDataEvaluator requires ${e.format} offset and stride aligned to ${i.BYTES_PER_ELEMENT} bytes`);return{type:t.signedDataType,size:t.components,offset:e.byteOffset,stride:e.byteStride,normalized:t.normalized,length:e.length,format:e.format}}function d(e){let t=function(e){let[t,...i]=e.data;if(!t||i.length>0)throw Error(`GPUDataEvaluator requires exactly one GPUData chunk for "${e.name}"`);return t}(e).buffer;return t instanceof n.kL?t.buffer:t}function p(e,t,i=!1){if(t<1||t>4)throw Error(`Cannot synthesize a GPUVector vertex format with ${t} components`);let r=e;if(i)switch(e){case"uint8":r="unorm8";break;case"sint8":r="snorm8";break;case"uint16":r="unorm16";break;case"sint16":r="snorm16";break;case"float32":r="float32";break;default:throw Error(`Unsupported normalized vertex format for ${e}`)}return("uint8"===r||"sint8"===r||"uint16"===r||"sint16"===r||"unorm8"===r||"snorm8"===r||"unorm16"===r||"snorm16"===r)&&3===t?`${r}x3-webgl`:`${r}${1===t?"":`x${t}`}`}},95309(e,t,i){i.d(t,{E:()=>r});let r={add:{arity:2,symbol:"arithmetic_add"},subtract:{arity:2,symbol:"arithmetic_subtract"},multiply:{arity:2,symbol:"arithmetic_multiply"},divide:{arity:2,symbol:"arithmetic_divide"},pow:{arity:2,symbol:"pow"},sqrt:{arity:1,symbol:"sqrt"},abs:{arity:1,symbol:"abs"},sin:{arity:1,symbol:"sin"},cos:{arity:1,symbol:"cos"},tan:{arity:1,symbol:"arithmetic_tan"},exp:{arity:1,symbol:"exp"},log:{arity:1,symbol:"log"}}},96430(e,t,i){i.d(t,{C:()=>o});var r=i(64238),n=i(48894);class s{inputs;dependencies;constructor(e){this.inputs=e,this.dependencies=Array.from(e instanceof Array?e:Object.values(e)).filter(e=>e instanceof r.GL)}async execute(e,t){return await this._resolveDependencies(e),await this._executeWithHandler(await n.G.get(this._getHandlerRegistry(e),this.name),t)}executeSync(e,t){var i;this._resolveDependenciesSync(e);let r=this._executeWithHandler(n.G.getSync(this._getHandlerRegistry(e),this.name),t);if(i=r,"function"==typeof i?.then)throw Error(`${this.name} returned a Promise in executeSync()`);return r}shouldExecuteOnCPU(){return this.output.length<=1&&Array.from(this.dependencies).every(e=>!!e.value)}_getHandlerRegistry(e){return this.shouldExecuteOnCPU()?"cpu":e.type}async _resolveDependencies(e){for(let t of this.dependencies)await t.evaluate(e);if("cpu"===this._getHandlerRegistry(e)||"null"===e.type)for(let e of this.dependencies)await e.ensureCPUValue()}_resolveDependenciesSync(e){for(let t of this.dependencies)t.evaluateSync(e);if("cpu"===this._getHandlerRegistry(e)||"null"===e.type)for(let e of this.dependencies)e.ensureCPUValueSync()}_executeWithHandler(e,t){return e({device:t.device,inputs:this.inputs,output:this.output,target:t})}}class a extends s{name="interleave";output;constructor(e){super(e);let{isConstant:t,type:i,length:n}=function(...e){let t=function(e){let t=0,i=0;for(let r of e){if("f"===r[0])return"float32";let e=r.endsWith("8")?8:r.endsWith("6")?16:32;"u"===r[0]?t=Math.max(t,e):i=Math.max(i,e)}return t&&!i?`uint${t}`:i&&t<32?`sint${Math.max(i,2*t)}`:"float32"}(e.map(e=>e.type));return"f"!==t[0]&&e.some(e=>e.normalized)&&(t="float32"),{isConstant:e.every(e=>e.isConstant),type:t,size:e.reduce((e,t)=>Math.max(e,t.size),0),length:e.reduce((e,t)=>Math.max(e,t.length),0)}}(...e);this.output=new r.GL({isConstant:t,type:i,size:e.reduce((e,t)=>e+t.size,0),length:n,source:this})}toString(){return`_${this.inputs.join("_")}_`}}function o(...e){if(0===e.length)throw Error("interleave() requires at least one input");return 1===e.length?(0,r.uy)(e[0]):new a(e.map(r.uy)).output}},75605(e,t,i){function r(e,t){var i;let r=Number.isFinite(i=t)&&i>0?Math.floor(i):65535,n=Math.max(1,Math.ceil(e)),s=Math.min(n,r),a=Math.min(Math.ceil(n/s),r),o=Math.ceil(n/s/a);if(o>r)throw Error(`WebGPU dispatch requires ${n} workgroups, exceeding the 3D dispatch limit of ${r} per dimension`);return{x:s,y:a,z:o}}function n(e,t="workgroupId"){return`((${t}.z * ${e.y}u + ${t}.y) * ${e.x}u + ${t}.x)`}function s(e,t,i="workgroupId",r="localId"){return`(${n(e,i)} * ${t}u + ${r}.x)`}i.d(t,{B:()=>n,BB:()=>r,vL:()=>s})},39463(e,t,i){function r(e,t){switch(e){case"u32":return`${t}u`;case"f32":return Number.isInteger(t)?`${t}.0`:`${t}`;default:return`${t}`}}function n(e,t){switch(e){case"uint32":return r("u32",Math.trunc(t));case"sint32":return`${Math.trunc(t)}`;case"float32":return r("f32",t);default:throw Error(`WebGPU operations only support 32-bit output types, got ${e}`)}}function s(e){switch(e){case"uint32":return"0u";case"sint32":return"0";case"float32":return"0.0";default:throw Error(`WebGPU operations only support 32-bit output types, got ${e}`)}}function a(e){switch(e){case"uint32":return"u32";case"sint32":return"i32";case"float32":return"f32";default:throw Error(`WebGPU operations only support 32-bit storage types, got ${e}`)}}i.d(t,{C1:()=>n,Lm:()=>r,_1:()=>s,iP:()=>a})},84598(e,t,i){i.d(t,{P:()=>u});var r=i(31709),n=i(92782),s=i(75605),a=i(39463);let o=new n.Ry;function u({module:e,elementWise:t=!1,expression:i,inputs:n,output:l,operationType:f=l.type,outputBuffer:h}){var c,d,p,g;let m,b,_,y;if(!e.source)throw Error(`WebGPU computation ${e.name} requires WGSL source`);let v=Array.isArray(c=n)?c.map((e,t)=>[`x${t}`,e]):Object.entries(c),w=v.map(([e,t])=>({name:e,input:t})),E=w.filter(({input:e})=>!e.isConstant).map((e,t)=>({...e,index:t})),x=(0,a.iP)(f),S=(0,a.iP)(l.type),A={TYPE:x,RESULT_LEN:l.size.toString()},L=(0,s.BB)(Math.ceil(l.length/64),h.device.limits.maxComputeWorkgroupsPerDimension);for(let[e,t]of v)A[`${e.toUpperCase()}_LEN`]=t.size.toString();let B=`
${function(e,t){for(let i in t)e=e.replaceAll(`{${i}}`,t[i]);return e}(e.source,A)}
${E.map(({name:e,input:t,index:i})=>(function(e,t,i){if(t.isConstant)return"";let r=(0,a.iP)(t.type);return`@group(0) @binding(${i}) var<storage, read> ${e}: array<${r}>;`})(e,t,i)).join("\n")}
${w.map(({name:e,input:t})=>{var i,r,n;let s,o,u,l;return i=e,r=t,n=f,s=(0,a.iP)(n),o=r.type===n?"":s,u=r.stride/r.ValueType.BYTES_PER_ELEMENT,l=r.offset/r.ValueType.BYTES_PER_ELEMENT,r.isConstant?`fn read_${i}(_rowIndex: u32) -> array<${s}, ${r.size}> {
  return array<${s}, ${r.size}>(${function(e,t){let i=e.value;if(!i)throw Error(`Constant input ${e} is missing CPU values`);return Array.from({length:e.size},(e,r)=>(0,a.Lm)(t,i[r]??0)).join(", ")}(r,o)});
}`:`fn read_${i}(rowIndex: u32) -> array<${s}, ${r.size}> {
  var value: array<${s}, ${r.size}>;
  let rowOffset = ${l}u + rowIndex * ${u}u;
${Array.from({length:r.size},(e,t)=>o?`  value[${t}] = ${o}(${i}[rowOffset + ${t}u]);`:`  value[${t}] = ${i}[rowOffset + ${t}u];`).join("\n")}
  return value;
}`}).join("\n")}
${(d=l,p=E.length,m=(0,a.iP)(d.type),`@group(0) @binding(${p}) var<storage, read_write> result: array<${m}>;`)}
${(b=(g=l).stride/g.ValueType.BYTES_PER_ELEMENT,_=g.offset/g.ValueType.BYTES_PER_ELEMENT,y=(0,a.iP)(g.type),`fn write_result(rowIndex: u32, value: array<${y}, ${g.size}>) {
  let rowOffset = ${_}u + rowIndex * ${b}u;
${Array.from({length:g.size},(e,t)=>`  result[rowOffset + ${t}u] = value[${t}];`).join("\n")}
}`)}

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,s.vL)(L,64)};
  if (rowIndex >= ${l.length}u) {
    return;
  }

${w.map(({name:e})=>`  let ${e} = read_${e}(rowIndex);`).join("\n")}
  var result: array<${S}, ${l.size}>;
${function(e,t,i,r,n){let s="";if(n)for(let e=0;e<i.size;e++)s+=`  result[${e}] = ${n(e)};
`;else if(r){let r=(0,a._1)(i.type),n=(0,a.iP)(i.type);for(let o=0;o<i.size;o++){let i=t.map(([e,t])=>o<t.size?(0,a.iP)(t.type)===n?`${e}[${o}]`:`${n}(${e}[${o}])`:r);s+=`  result[${o}] = ${e}(${i.join(", ")});
`}}else s+=`result = ${e}(${t.map(([e])=>e).join(", ")});`;return s.trimEnd()}(e.name,v,l,t,i)}
  write_result(rowIndex, result);
}
`,T=new r.C(h.device,{source:B,shaderAssembler:o,shaderLayout:{bindings:[...E.map(({name:e},t)=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:E.length}]}}),P=Object.fromEntries(E.map(({name:e,input:t})=>[e,t.buffer]));P.result=h,T.setBindings(P);let $=h.device.beginComputePass({});h.device.statsManager.getStats("GPGPU Operation Counts").get("Computation Runs").incrementCount(),T.dispatch($,L.x,L.y,L.z),$.end(),h.device.submit(),T.destroy()}},41568(e,t,i){i.d(t,{C:()=>n});var r=i(84598);let n=({inputs:e,output:t,target:i})=>{let n=e.map((e,t)=>[`x${t}`,e]);var s=i.device.limits,a=n;let o=a.filter(([,e])=>!e.isConstant).length+1;if(o>s.maxStorageBuffersPerShaderStage)throw Error(`interleave() requires ${o} storage buffers, exceeding device limit ${s.maxStorageBuffersPerShaderStage}`);if(o>s.maxBindingsPerBindGroup)throw Error(`interleave() requires ${o} bindings, exceeding bind group limit ${s.maxBindingsPerBindGroup}`);let u=n.map(([e,t])=>`${e}: array<{TYPE}, ${t.size}>`).join(", "),l=0,f=n.map(([e,t])=>{let i=Array.from({length:t.size},(t,i)=>`  out[${l+i}] = ${e}[${i}];`).join("\n");return l+=t.size,i}).join("\n"),h=`\
fn interleave(${u}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${f}
  return out;
}
`;return(0,r.P)({module:{name:"interleave",source:h},inputs:e,output:t,outputBuffer:i}),{success:!0}}},66008(e,t,i){i.d(t,{R:()=>n});var r=i(60691);let n=new class{poolSize=20;bufferPools;constructor(){this.bufferPools=new Map}createOrReuse(e,t){if(t>e.limits.maxBufferSize)throw Error(`Buffer pool cannot allocate ${t} bytes: device.limits.maxBufferSize is ${e.limits.maxBufferSize}`);let i=this.bufferPools.get(e),n=i?i.findIndex(e=>e.byteLength>=t):-1;if(n<0)return e.createBuffer({usage:r.h.VERTEX|r.h.STORAGE|r.h.COPY_DST|r.h.COPY_SRC,byteLength:t});let[s]=i.splice(n,1);return s}recycle(e){let t=e.device;this.bufferPools.has(t)||this.bufferPools.set(t,[]);let i=this.bufferPools.get(t),r=i.findIndex(t=>t.byteLength>e.byteLength);r<0?i.push(e):i.splice(r,0,e),this.purge()}purge(){for(let[e,t]of this.bufferPools){let i=e.isLost?0:this.poolSize;for(;t.length>i;)t.shift().destroy();0===t.length&&this.bufferPools.delete(e)}}}},97065(e,t,i){i.d(t,{o:()=>u});var r=i(82645),n=i(64238),s=i(30193);class a{gpuDataEvaluators;format;length;id;_gpuVector;_ownsGPUDataEvaluators;_destroyed=!1;static fromGPUVector(e){if(e.bufferLayout)throw Error(`GPUVectorEvaluator.fromGPUVector() does not accept interleaved vector "${e.name}"`);if(0===e.data.length)throw Error(`GPUVectorEvaluator.fromGPUVector() requires GPUData for "${e.name}"`);return new a({id:e.name,gpuDataEvaluators:e.data.map(t=>n.GL.fromGPUData(t,{id:e.name})),gpuVector:e,format:e.format})}static fromGPUDataEvaluators(e,t={}){return new a({id:t.id,gpuDataEvaluators:e,format:t.format})}constructor({id:e,gpuDataEvaluators:t,gpuVector:i,format:r}){if(0===t.length)throw Error("GPUVectorEvaluator requires at least one GPUData evaluator");(function(e){let t=e[0];for(let i of e.slice(1))if(i.type!==t.type||i.size!==t.size||i.normalized!==t.normalized||i.format!==t.format)throw Error("GPUVectorEvaluator requires matching GPUData evaluator layouts")})(t),this.id=e,this.gpuDataEvaluators=t,this.format=r??t[0].format,this.length=t.reduce((e,t)=>e+t.length,0),this._gpuVector=i,this._ownsGPUDataEvaluators=!i}get evaluated(){return!!this._gpuVector}get gpuVector(){if(!this._gpuVector)throw Error(`${this} not evaluated`);return this._gpuVector}mapGPUData(e){return a.fromGPUDataEvaluators(this.gpuDataEvaluators.map((t,i)=>e(t,i)),{id:this.id})}async evaluate(e,t={}){if(this._destroyed)throw Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i=await Promise.all(this.gpuDataEvaluators.map(i=>i.evaluate(e,t))),r=i[0],n=i.map(o),a=t.format??this.format??r.format;return this._gpuVector=new s.M({type:"data",name:t.name??this.id??"vector",format:a,data:n,stride:r.stride,byteStride:r.byteStride,rowByteLength:r.rowByteLength,bufferLayout:r.bufferLayout}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i=this.gpuDataEvaluators.map(i=>i.evaluateSync(e,t)),r=i[0],n=i.map(o),a=t.format??this.format??r.format;return this._gpuVector=new s.M({type:"data",name:t.name??this.id??"vector",format:a,data:n,stride:r.stride,byteStride:r.byteStride,rowByteLength:r.rowByteLength,bufferLayout:r.bufferLayout}),this._gpuVector}destroy(){if(this._ownsGPUDataEvaluators)for(let e of this.gpuDataEvaluators)e.destroy();this._gpuVector=void 0,this._destroyed=!0}toString(){return this.id??this.constructor.name}}function o(e){let[t,...i]=e.data;if(!t||i.length>0)throw Error(`GPUVectorEvaluator requires one GPUData chunk for "${e.name}"`);return t}function u(e,t){let i=function(e){let t=new Set;if(f(e))return[e];for(let i of Array.isArray(e)?e:Object.values(e))f(i)&&t.add(i);return Array.from(t)}(t);for(let t of i)t.evaluateSync(e);return function(e){let t=new Set(e.flatMap(l)),i=new Set;for(let t of e)!function e(t,i){if(t instanceof a){for(let r of t.gpuDataEvaluators)e(r,i);return}let r=t.source;if(r){if(r instanceof n.GL){i.has(r)||(i.add(r),e(r,i));return}for(let t of r.dependencies)i.has(t)||(i.add(t),e(t,i))}}(t,i);for(let e of i)t.has(e.buffer)||e.destroy()}(i),t}function l(e){return e instanceof n.GL?[e.buffer]:e.gpuVector.data.map(e=>e.buffer instanceof r.kL?e.buffer.buffer:e.buffer)}function f(e){return e instanceof n.GL||e instanceof a}},23471(e,t,i){function r(e,t=!0){return e??t}function n(e=[0,0,0],t=!0){return t?e.map(e=>e/255):[...e]}function s(e,t=!0){let i=n(e.slice(0,3),t),r=Number.isFinite(e[3]),a=r?e[3]:1;return[i[0],i[1],i[2],t&&r?a/255:a]}i.d(t,{eS:()=>r,jI:()=>s,sC:()=>n})},1100(e,t,i){i.d(t,{Wk:()=>s});let r=`\
out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,n=`#version 300 es
${r}`;function s(e){let{input:t,inputChannels:i,output:r}=e||{};if(!t)return n;if(!i)throw Error("inputChannels");let s=function(e){switch(e){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw Error(`invalid channels: ${e}`)}}(i),a=function(e,t){switch(t){case 1:return`vec4(${e}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${e}, 0.0, 1.0)`;case 3:return`vec4(${e}, 1.0)`;case 4:return e;default:throw Error(`invalid channels: ${t}`)}}(t,i);return`\
#version 300 es
in ${s} ${t};
out vec4 ${r};
void main() {
  ${r} = ${a};
}`}},92782(e,t,i){i.d(t,{U0:()=>es,_P:()=>en,Ry:()=>ea});var r=i(72560),n=i(65261),s=i(31770);let a=[[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/,"#version 300 es\n"],[/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g,"textureLod("],[/\btexture(2D|2DProj|Cube)(EXT)?\(/g,"texture("]],o=[...a,[f("attribute"),"in $1"],[f("varying"),"out $1"]],u=[...a,[f("varying"),"in $1"]];function l(e,t){for(let[i,r]of t)e=e.replace(i,r);return e}function f(e){return RegExp(`\\b${e}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`,"g")}function h(e,t){if(!e){let e=Error(t||"shadertools: assertion failed.");throw Error.captureStackTrace?.(e,h),e}}let c=/^(?:uniform\s+)?(?:(?:lowp|mediump|highp)\s+)?[A-Za-z0-9_]+(?:<[^>]+>)?\s+([A-Za-z0-9_]+)(?:\s*\[[^\]]+\])?\s*;/,d=/((?:layout\s*\([^)]*\)\s*)*)uniform\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}\s*([A-Za-z_][A-Za-z0-9_]*)?\s*;/g;function p(e){return`${e.name}Uniforms`}function g(e){let t=[];for(let i of e.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"").matchAll(d)){let e=i[1]?.trim()||null;t.push({blockName:i[2],body:i[3],instanceName:i[4]||null,layoutQualifier:e,hasLayoutQualifier:!!e,isStd140:!!(e&&/\blayout\s*\([^)]*\bstd140\b[^)]*\)/.exec(e))})}return t}function m(e,t=8){if(e.length<=t)return e.join(", ");let i=e.length-t;return`${e.slice(0,t).join(", ")}, ... (${i} more)`}function b(e,t,i="glsl"){let r="";for(let n in e){let s=e[n],a="wgsl"===i?"fn":"void";if(r+=`${a} ${s.signature} {
`,s.header&&(r+=`  ${s.header}`),t[n]){let e=t[n];for(let t of(e.sort((e,t)=>e.order-t.order),e))r+=`  ${t.injection}
`}s.footer&&(r+=`  ${s.footer}`),r+="}\n"}return r}function _(e){let t={vertex:{},fragment:{}};for(let i of e){let e,r;"string"!=typeof i?r=(e=i).hook:(e={},r=i);let n=(r=r.trim()).indexOf(":"),s=r.slice(0,n),a=r.slice(n+1),o=r.replace(/\(.+/,""),u=Object.assign(e,{signature:a});switch(s){case"vs":t.vertex[o]=u;break;case"fs":t.fragment[o]=u;break;default:throw Error(s)}}return t}var y=i(68062);let v=[RegExp(`@binding\\(\\s*(\\d+)\\s*\\)\\s*@group\\(\\s*(\\d+)\\s*\\)\\s*${y.Qw}\\s*:\\s*([^;]+);`,"g"),RegExp(`@group\\(\\s*(\\d+)\\s*\\)\\s*@binding\\(\\s*(\\d+)\\s*\\)\\s*${y.Qw}\\s*:\\s*([^;]+);`,"g")];function w(e,t=[]){let i=(0,y.mh)(e),r=new Map;for(let e of t)r.set(E(e.name,e.group,e.location),e.moduleName);let n=[];for(let e of v){let t;for(e.lastIndex=0,t=e.exec(i);t;){let s=e===v[0],a=Number(t[s?1:2]),o=Number(t[s?2:1]),u=t[3]?.trim(),l=t[4],f=t[5].trim(),h=r.get(E(l,o,a));n.push(function(e){var t;let i={name:e.name,group:e.group,binding:e.binding,owner:e.owner,kind:"unknown",moduleName:e.moduleName,resourceType:e.resourceType};if(e.accessDeclaration){let t=e.accessDeclaration.split(",").map(e=>e.trim());if("uniform"===t[0])return{...i,kind:"uniform",access:"uniform"};if("storage"===t[0]){let e=t[1]||"read_write";return{...i,kind:"read"===e?"read-only-storage":"storage",access:e}}}return"sampler"===e.resourceType||"sampler_comparison"===e.resourceType?{...i,kind:"sampler",samplerKind:"sampler_comparison"===e.resourceType?"comparison":"filtering"}:e.resourceType.startsWith("texture_storage_")?{...i,kind:"storage-texture",access:function(e){let t=/,\s*([A-Za-z_][A-Za-z0-9_]*)\s*>$/.exec(e);return t?.[1]}(e.resourceType),viewDimension:x(e.resourceType)}:e.resourceType.startsWith("texture_")?{...i,kind:"texture",viewDimension:x(e.resourceType),sampleType:(t=e.resourceType).startsWith("texture_depth_")?"depth":t.includes("<i32>")?"sint":t.includes("<u32>")?"uint":t.includes("<f32>")?"float":void 0,multisampled:e.resourceType.startsWith("texture_multisampled_")}:i}({name:l,group:o,binding:a,owner:h?"module":"application",moduleName:h,accessDeclaration:u,resourceType:f})),t=e.exec(i)}}return n.sort((e,t)=>e.group!==t.group?e.group-t.group:e.binding!==t.binding?e.binding-t.binding:e.name.localeCompare(t.name))}function E(e,t,i){return`${t}:${i}:${e}`}function x(e){return e.includes("cube_array")?"cube-array":e.includes("2d_array")?"2d-array":e.includes("cube")?"cube":e.includes("3d")?"3d":e.includes("2d")?"2d":e.includes("1d")?"1d":void 0}var S=i(3180);let A="([a-zA-Z_][a-zA-Z0-9_]*)",L=/^\s*\#\s*if\s+(.+?)\s*(?:\/\/.*)?$/,B=RegExp(`^\\s*\\#\\s*ifdef\\s*${A}\\s*$`),T=RegExp(`^\\s*\\#\\s*ifndef\\s*${A}\\s*(?:\\/\\/.*)?$`),P=/^\s*\#\s*else\s*(?:\/\/.*)?$/,$=/^\s*\#\s*endif\s*$/,M=RegExp(`^\\s*\\#\\s*ifdef\\s*${A}\\s*(?:\\/\\/.*)?$`),O=/^\s*\#\s*endif\s*(?:\/\/.*)?$/;function C(e,t){let i=e.split("\n"),r=[],n=[],s=!0;for(let e of i){let i=e.match(L),a=e.match(M)||e.match(B),o=e.match(T),u=e.match(P),l=e.match(O)||e.match($);if(i){let e=function(e,t){let i=e.trim();if(/^[+-]?\d+(?:\.\d+)?$/.test(i))return 0!==Number(i);if("true"===i)return!0;if("false"===i)return!1;let r=i.match(RegExp(`^!\\s*${A}$`));if(r)return!t[r[1]];let n=i.match(RegExp(`^${A}$`));if(n)return!!t[n[1]];let s=i.match(RegExp(`^defined\\s*\\(\\s*${A}\\s*\\)$`));if(s)return void 0!==t[s[1]];let a=i.match(RegExp(`^!\\s*defined\\s*\\(\\s*${A}\\s*\\)$`));if(a)return void 0===t[a[1]];throw Error(`Unsupported #if expression "${e}"`)}(i[1],t?.defines||{}),r=s&&e;n.push({parentActive:s,branchTaken:e,active:r}),s=r}else if(a||o){let e=(a||o)?.[1],i=!!t?.defines?.[e],r=a?i:!i,u=s&&r;n.push({parentActive:s,branchTaken:r,active:u}),s=u}else if(u){let e=n[n.length-1];if(!e)throw Error("Encountered #else without matching #if, #ifdef or #ifndef");e.active=e.parentActive&&!e.branchTaken,e.branchTaken=!0,s=e.active}else l?(n.pop(),s=!n.length||n[n.length-1].active):s&&r.push(e)}if(n.length>0)throw Error("Unterminated conditional block in shader source");return r.join("\n")}var k=i(44791);function N(e){let{primitiveType:t,components:i}=k.Co.getAttributeShaderTypeInfo(e),r="i32"===t?"int":"u32"===t?"uint":"float";return 1===i?r:`${"int"===r?"i":"uint"===r?"u":""}vec${i}`}function I(e){let t=[],i=/@location\s*\(\s*(\d+)\s*\)/g,r=i.exec(e);for(;r;)t.push(Number(r[1])),r=i.exec(e);return t}function R(e){let t=[],i=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm,r=i.exec(e);for(;r;)t.push(r[1]),r=i.exec(e);return t}function U(e,t,i,r){let n=0,s=0,a=!1;for(let o=t;o<e.length;o++){let t=e[o],u=e[o+1];if(a){"\n"===t&&(a=!1);continue}if(s>0){"/"===t&&"*"===u?(s++,o++):"*"===t&&"/"===u&&(s--,o++);continue}if("/"===t&&"/"===u){a=!0,o++;continue}if("/"===t&&"*"===u){s=1,o++;continue}if(t===i&&n++,t===r&&0==--n)return o}return -1}function D(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function F(e,t,i){let r=RegExp(`\\bfn\\s+${H(t)}\\s*\\(`,"g").exec(e);if(!r)throw Error(`ShaderPlugin varyings require WGSL ${i} entry point "${t}"`);let n=e.indexOf("(",r.index),s=q(e,n,"(",")"),a=e.indexOf("{",s),o=q(e,a,"{","}");if(s<0||a<0||o<0)throw Error(`Unable to parse WGSL ${i} entry point "${t}"`);return{openParenthesis:n,closeParenthesis:s,openBrace:a,closeBrace:o,parameters:e.slice(n+1,s)}}function z(e,t){let i=V(e,t);if(!i)throw Error(`Unable to find WGSL stage I/O struct "${t}"`);return i}function V(e,t){let i=RegExp(`\\bstruct\\s+${H(t)}\\s*\\{`,"g").exec(e);if(!i)return null;let r=e.indexOf("{",i.index),n=q(e,r,"{","}");return n<0?null:{openBrace:r,closeBrace:n,body:e.slice(r+1,n)}}function j(e,t,i){let r=t;if("/"===e[r]&&"/"===e[r+1]){let t=e.indexOf("\n",r+2);return t<0||t>i?i:t+1}if("/"===e[r]&&"*"===e[r+1]){let t=1;for(r+=2;r<i&&t>0;)"/"===e[r]&&"*"===e[r+1]?(t++,r+=2):"*"===e[r]&&"/"===e[r+1]?(t--,r+=2):r++}return r}function G(e){let t=[],i=/@location\s*\(\s*(\d+)\s*\)/g,r=i.exec(e);for(;r;)t.push(Number(r[1])),r=i.exec(e);return t}function W(e){let t=[],i=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm,r=i.exec(e);for(;r;)t.push(r[1]),r=i.exec(e);return t}function q(e,t,i,r){let n=0,s=0,a=!1;for(let o=t;o<e.length;o++){let t=e[o],u=e[o+1];if(a){"\n"===t&&(a=!1);continue}if(s>0){"/"===t&&"*"===u?(s++,o++):"*"===t&&"/"===u&&(s--,o++);continue}if("/"===t&&"/"===u){a=!0,o++;continue}if("/"===t&&"*"===u){s=1,o++;continue}if(t===i&&n++,t===r&&0==--n)return o}return -1}function H(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}let Y=`

${s.O_}
`,Z=`\
precision highp float;
`;function X(e,t){let{source:i,stage:n,language:a="glsl",modules:f,defines:c={},hookFunctions:d=[],inject:p={},pluginInjections:m={},pluginVertexInputs:y={},pluginVaryings:v={},prologue:w=!0,log:E}=t;h("string"==typeof i,"shader source must be a string");let x="glsl"===a?({name:function(e,t="unnamed"){let i=/#define[^\S\r\n]*SHADER_NAME[^\S\r\n]*([A-Za-z0-9_-]+)\s*/.exec(e);return i?i[1]:t}(i,void 0),language:"glsl",version:function(e){let t=100,i=e.match(/[^\s]+/g);if(i&&i.length>=2&&"#version"===i[0]){let e=parseInt(i[1],10);Number.isFinite(e)&&(t=e)}if(100!==t&&300!==t)throw Error(`Invalid GLSL version ${t}`);return t}(i)}).version:-1,S=e.shaderLanguageVersion,A=100===x?"#version 100":"#version 300 es",L=i.split("\n").slice(1).join("\n"),B={};f.forEach(e=>{Object.assign(B,e.defines)}),Object.assign(B,c);let T="";switch(a){case"wgsl":break;case"glsl":T=w?`\
${A}

// ----- PROLOGUE -------------------------
#define SHADER_TYPE_${n.toUpperCase()}

${function(e){switch(e?.gpu.toLowerCase()){case"apple":return`\
#define APPLE_GPU
// Apple optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"nvidia":return`\
#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;case"intel":return`\
#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"amd":return`\
#define AMD_GPU
`;default:return`\
#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Headless Chrome's software shader 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// If the GPU doesn't have full 32 bits precision, will causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`}}(e)}
${"fragment"===n?Z:""}

// ----- APPLICATION DEFINES -------------------------

${function(e={}){let t="";for(let i in e){let r=e[i];(r||Number.isFinite(r))&&(t+=`#define ${i.toUpperCase()} ${e[i]}
`)}return t}(B)}

`:`${A}
`}let P=_(d),$={},M={},O={};for(let e in Q(m,$,M,O),p){let t="string"==typeof p[e]?{injection:p[e],order:0}:p[e],i=/^(v|f)s:(#)?([\w-]+)$/.exec(e);if(i){let r=i[2],n=i[3];r?"decl"===n?M[e]=[t]:O[e]=[t]:$[e]=[t]}else O[e]=[t]}if("vertex"===n){let e=function(e,t){let i=[];for(let[r,n]of Object.entries(t))(function(e,t){let i=D(t);if(RegExp(`\\b(?:in|attribute)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${i}\\s*(?:\\[|;)`).test(e))throw Error(`ShaderPlugin vertex input "${t}" conflicts with an existing GLSL input`)})(e,r),i.push(`in ${N(n)} ${r};`);return i.join("\n")}(L,y);e&&(M["vs:#decl"]=M["vs:#decl"]||[],M["vs:#decl"].push({injection:e,order:Number.MIN_SAFE_INTEGER}))}let C=function(e,t,i){let r=[],n=[];for(let[o,u]of Object.entries(i)){var s=e,a=o;if(RegExp(`\\b(?:flat\\s+|smooth\\s+)?(?:in|out|varying)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${H(a)}\\s*(?:\\[|;)`).test(s))throw Error(`ShaderPlugin varying "${a}" conflicts with existing GLSL stage I/O`);let i="flat"===u.interpolation?"flat ":"",l="vertex"===t?"out":"in";r.push(`${i}${l} ${N(u.type)} ${o};`),"vertex"===t&&n.push(`${o} = ${function(e){let{primitiveType:t,components:i}=k.Co.getAttributeShaderTypeInfo(e),r="u32"===t?"0u":"i32"===t?"0":"0.0";return 1===i?r:`${N(e)}(${r})`}(u.type)};`)}return{declarations:r.join("\n"),initialization:n.join("\n")}}(L,n,v);if(C.declarations){let e="vertex"===n?"vs:#decl":"fs:#decl";M[e]=M[e]||[],M[e].push({injection:C.declarations,order:Number.MIN_SAFE_INTEGER})}for(let e of(C.initialization&&(O["vs:#main-start"]=O["vs:#main-start"]||[],O["vs:#main-start"].push({injection:C.initialization,order:Number.MIN_SAFE_INTEGER})),f)){E&&(0,r.ZG)(e,L,E),T+=J(e,n,E);let t=e.instance?.normalizedInjections[n]||{};for(let e in t){let i=/^(v|f)s:#([\w-]+)$/.exec(e);if(i){let r="decl"===i[2]?M:O;r[e]=r[e]||[],r[e].push(t[e])}else $[e]=$[e]||[],$[e].push(t[e])}}return T+="// ----- MAIN SHADER SOURCE -------------------------",T+=Y,T=(0,s.bv)(T,n,M)+b(P[n],$)+L,T=(0,s.bv)(T,n,O),"glsl"===a&&x!==S&&(T=function(e,t){if(300!==Number(e.match(/^#version[ \t]+(\d+)/m)?.[1]||100))throw Error("luma.gl v9 only supports GLSL 3.00 shader sources");switch(t){case"vertex":return l(e,o);case"fragment":return l(e,u);default:throw Error(t)}}(T,n)),"glsl"===a&&function(e,t,i){let r=g(e).filter(e=>!e.isStd140),n=new Set;for(let e of r){if(n.has(e.blockName))continue;n.add(e.blockName);let r=e.hasLayoutQualifier?`declares ${e.layoutQualifier.replace(/\s+/g," ").trim()} instead of layout(std140)`:"does not declare layout(std140)",s=`${t} shader uniform block ${e.blockName} ${r}. luma.gl host-side shader block packing assumes explicit layout(std140) for GLSL uniform blocks. Add \`layout(std140)\` to the block declaration.`;i?.warn?.(s,e)()}}(T,n,E),T.trim()}function K(e){return function(t){let i={};for(let r of e){let e=r.getUniforms?.(t,i);Object.assign(i,e)}return i}}function Q(e,t,i,r){for(let n in e){let s=/^(v|f)s:(#)?([\w-]+)$/.exec(n);if(s){let a=s[2],o=s[3],u=a?"decl"===o?i:r:t;u[n]=u[n]||[],u[n].push(...e[n])}else r[n]=r[n]||[],r[n].push(...e[n])}}function J(e,t,i){let r;switch(t){case"vertex":r=e.vs||"";break;case"fragment":r=e.fs||"";break;case"wgsl":r=e.source||"";break;default:h(!1)}if(!e.name)throw Error("Shader module must have a name");!function(e,t,i={}){let r=function(e,t){let i,r=Object.keys(e.uniformTypes||{});if(!r.length)return null;let n=(i="wgsl"===t?e.source:"vertex"===t?e.vs:e.fs)?function(e,t,i){var r,n;let s,a="wgsl"===t?function(e,t){let i=RegExp(`\\bstruct\\s+${t}\\b`,"m").exec(e);if(!i)return null;let r=e.indexOf("{",i.index);if(r<0)return null;let n=0;for(let t=r;t<e.length;t++){let i=e[t];if("{"===i){n++;continue}if("}"===i&&0==--n)return e.slice(r+1,t)}return null}(e,i):(r=e,n=i,s=g(r).find(e=>e.blockName===n),s?.body||null);if(!a)return null;let o=[];for(let e of a.split("\n")){let i=e.replace(/\/\/.*$/,"").trim();if(!i||i.startsWith("#"))continue;let r="wgsl"===t?i.match(/^([A-Za-z0-9_]+)\s*:/):i.match(c);r&&o.push(r[1])}return o}(i,"wgsl"===t?"wgsl":"glsl",p(e)):null;return n?{moduleName:e.name,uniformBlockName:p(e),stage:t,expectedUniformNames:r,actualUniformNames:n,matches:function(e,t){if(e.length!==t.length)return!1;for(let i=0;i<e.length;i++)if(e[i]!==t[i])return!1;return!0}(r,n)}:null}(e,t);if(!r||r.matches)return;let n=function(e){let{expectedUniformNames:t,actualUniformNames:i}=e,r=t.filter(e=>!i.includes(e)),n=i.filter(e=>!t.includes(e)),s=[`Expected ${t.length} fields, found ${i.length}.`],a=function(e,t){let i=Math.min(e.length,t.length);for(let r=0;r<i;r++)if(e[r]!==t[r])return`First mismatch at field ${r+1}: expected ${e[r]}, found ${t[r]}.`;return e.length>t.length?`Shader block ends after field ${t.length}; expected next field ${e[t.length]}.`:t.length>e.length?`Shader block has extra field ${t.length}: ${t[e.length]}.`:null}(t,i);return a&&s.push(a),r.length&&s.push(`Missing from shader block (${r.length}): ${m(r)}.`),n.length&&s.push(`Unexpected in shader block (${n.length}): ${m(n)}.`),t.length<=12&&i.length<=12&&(r.length||n.length)&&(s.push(`Expected: ${t.join(", ")}.`),s.push(`Actual: ${i.join(", ")}.`)),`${e.moduleName}: ${e.stage} shader uniform block ${e.uniformBlockName} does not match module.uniformTypes. ${s.join(" ")}`}(r);i.log?.error?.(n,r)(),!1!==i.throwOnError&&h(!1,n)}(e,t,{log:i});let n=e.name.toUpperCase().replace(/[^0-9a-z]/gi,"_"),s=`\
// ----- MODULE ${e.name} ---------------

`;return"wgsl"!==t&&(s+=`#define MODULE_${n}
`),s+=`${r}
`}function ee(e,t,i){if(0===e&&t>=100)throw Error(`Application binding "${i}" in group 0 uses reserved binding ${t}. Application-owned explicit group-0 bindings must stay below 100.`)}function et(e,t,i,r){if(0===t&&i<100)throw Error(`Module "${e}" binding "${r}" in group 0 uses reserved application binding ${i}. Module-owned explicit group-0 bindings must be 100 or higher.`)}function ei(e,t,i,r){let n=e.get(t)||new Set;if(n.has(i))throw Error(`Duplicate WGSL binding assignment for ${r}: group ${t}, binding ${i}.`);n.add(i),e.set(t,n)}function er(e,t,i){return`${e}:${t}:${i}`}class en{static defaultShaderAssemblers={};_hookFunctions=[];_defaultModules=[];static getDefaultShaderAssembler(e){return(h("glsl"===e||"wgsl"===e),"wgsl"===e)?(en.defaultShaderAssemblers.wgsl=en.defaultShaderAssemblers.wgsl||new ea,en.defaultShaderAssemblers.wgsl):(en.defaultShaderAssemblers.glsl=en.defaultShaderAssemblers.glsl||new es,en.defaultShaderAssemblers.glsl)}addDefaultModule(e){this._defaultModules.find(t=>t.name===("string"==typeof e?e:e.name))||this._defaultModules.push(e)}removeDefaultModule(e){let t="string"==typeof e?e:e.name;this._defaultModules=this._defaultModules.filter(e=>e.name!==t)}addShaderHook(e,t){t&&(e=Object.assign(t,{hook:e})),this._hookFunctions.push(e)}_getModuleList(e=[]){let t=Array(this._defaultModules.length+e.length),i={},n=0;for(let e=0,r=this._defaultModules.length;e<r;++e){let r=this._defaultModules[e],s=r.name;t[n++]=r,i[s]=!0}for(let r=0,s=e.length;r<s;++r){let s=e[r],a=s.name;i[a]||(t[n++]=s,i[a]=!0)}return t.length=n,(0,r.$g)(t),t}}class es extends en{shaderLanguage="glsl";assembleGLSLShaderPair(e){let t=this._getModuleList(e.modules),i=this._hookFunctions;return{...function(e){let{vs:t,fs:i}=e,r=(0,n.$Q)(e.modules||[]);return{vs:X(e.platformInfo,{...e,source:t,stage:"vertex",modules:r}),fs:X(e.platformInfo,{...e,source:i,stage:"fragment",modules:r}),getUniforms:K(r)}}({...e,vs:e.vs,fs:e.fs,modules:t,hookFunctions:i}),modules:t}}}class ea extends en{shaderLanguage="wgsl";_wgslBindingRegistry=new Map;assembleWGSLShader(e){let t=this._getModuleList(e.modules),i=this._hookFunctions,a=ea.getShaderPreprocessorDefines(e,t),o="wgsl"===e.platformInfo.shaderLanguage&&e.source?C(e.source,{defines:a}):e.source,{source:u,getUniforms:l,bindingAssignments:f}=function(e){let t=(0,n.$Q)(e.modules||[]),{source:i,bindingAssignments:a}=function(e,t){var i,n,a,o,u,l,f,c,d,p,g;let m,{source:v,stage:w,modules:E,defines:x={},hookFunctions:S=[],inject:A={},pluginInjections:L={},pluginVertexInputs:B={},pluginVaryings:T={},vertexEntryPoint:P="vertexMain",fragmentEntryPoint:$="fragmentMain",log:M}=t;h("string"==typeof v,"shader source must be a string");let O=function(e,t,i){let r=Object.entries(i);if(0===r.length)return{source:e,declarations:"",initialization:""};let n=function(e,t){let i=RegExp(`\\bfn\\s+${D(t)}\\s*\\(`,"g").exec(e);if(!i)throw Error(`ShaderPlugin vertex inputs require WGSL vertex entry point "${t}"`);let r=e.indexOf("(",i.index),n=U(e,r,"(",")");if(n<0)throw Error(`Unable to parse WGSL vertex entry point "${t}" parameters`);return{openParenthesis:r,closeParenthesis:n}}(e,t),s=e.slice(n.openParenthesis+1,n.closeParenthesis),a=function(e,t){let i=I(t),r=new Set(R(t));for(let n of function(e){let t=[],i=/:\s*([A-Za-z_][\w]*)\b/g,r=i.exec(e);for(;r;)t.push(r[1]),r=i.exec(e);return t}(t)){let t=function(e,t){let i=RegExp(`\\bstruct\\s+${D(t)}\\s*\\{`,"g").exec(e);if(!i)return null;let r=e.indexOf("{",i.index),n=U(e,r,"{","}");return n<0?null:e.slice(r+1,n)}(e,n);if(null!==t)for(let e of(i.push(...I(t)),R(t)))r.add(e)}return{locations:i,names:r}}(e,s),o=new Set(a.locations),u=[],l=[],f=[];for(let[t,i]of r){if(a.names.has(t)||function(e,t){let i=D(t),r=RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${i}\\b`,"g"),n=r.exec(e);for(;n;){if(0===function(e,t){let i=0,r=0,n=!1;for(let s=0;s<t;s++){let t=e[s],a=e[s+1];if(n){"\n"===t&&(n=!1);continue}if(r>0){"/"===t&&"*"===a?(r++,s++):"*"===t&&"/"===a&&(r--,s++);continue}"/"===t&&"/"===a?(n=!0,s++):"/"===t&&"*"===a?(r=1,s++):"{"===t?i++:"}"===t&&i--}return i}(e,n.index))return!0;n=r.exec(e)}return!1}(e,t))throw Error(`ShaderPlugin vertex input "${t}" conflicts with an existing WGSL shader input or variable`);let r=function(e){let t=0;for(;e.has(t);)t++;return t}(o);o.add(r);let n=`_luma_${t}`;u.push(`@location(${r}) ${n}: ${i}`),l.push(`var<private> ${t}: ${i};`),f.push(`${t} = ${n};`)}let h=s.trim()?",\n  ":"\n  ",c=s.trim()?"":"\n",d=`${s}${h}${u.join(",\n  ")}${c}`;return{source:e.slice(0,n.openParenthesis+1)+d+e.slice(n.closeParenthesis),declarations:l.join("\n"),initialization:f.join("\n")}}(C(v,{defines:x}),P,B),N=function(e,t,i,r){let n=Object.entries(r);if(0===n.length)return{source:e,declarations:"",vertexInitialization:"",fragmentInitialization:""};let s=e,a=F(s,t,"vertex"),o=function(e,t){let i=e.slice(t.closeParenthesis+1,t.openBrace),r=/->\s*([A-Za-z_][\w]*)\s*$/.exec(i.trim());if(!r||null===V(e,r[1]))throw Error("ShaderPlugin varyings require the WGSL vertex entry point to return a named struct");return r[1]}(s,a),u=F(s,i,"fragment"),l=function(e,t){let i=[];for(let r of function(e){let t=[],i=0,r=0,n=0;for(let s=0;s<e.length;s++){let a=e[s];"("===a&&r++,")"===a&&r--,"<"===a&&n++,">"===a&&n--,","===a&&0===r&&0===n&&(t.push(e.slice(i,s)),i=s+1)}return t.push(e.slice(i)),t}(t.parameters)){let t=/(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:\s*([A-Za-z_][\w]*)\s*$/.exec(r.trim());t&&V(e,t[2])&&i.push({name:t[1],type:t[2]})}if(1!==i.length)throw Error(`ShaderPlugin varyings require exactly one named WGSL fragment input struct; found ${i.length}`);return i[0]}(s,u),f=z(s,o),h=z(s,l.type),c=new Set([...W(a.parameters),...W(f.body),...W(u.parameters),...W(h.body)]),d=new Set([...G(f.body),...G(h.body)]),p=[],g=[],m=[],b=[];for(let[e,t]of n){if(c.has(e)||function(e,t){let i=RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${H(t)}\\b`,"g"),r=i.exec(e);for(;r;){if(0===function(e,t){let i=0;for(let r=0;r<t;r++){let n=j(e,r,t);if(n!==r){r=n-1;continue}"{"===e[r]&&i++,"}"===e[r]&&i--}return i}(e,r.index))return!0;r=i.exec(e)}return!1}(s,e))throw Error(`ShaderPlugin varying "${e}" conflicts with existing WGSL stage I/O or a module variable`);let i=function(e){let t=0;for(;e.has(t);)t++;return t}(d);d.add(i);let r="flat"===t.interpolation?" @interpolate(flat)":"";p.push(`  @location(${i})${r} ${e}: ${t.type},`),g.push(`var<private> ${e}: ${t.type};`),m.push(`${e} = ${function(e){let{primitiveType:t,components:i}=k.Co.getAttributeShaderTypeInfo(e),r=`${t}(0)`;return 1===i?r:`${e}(${r})`}(t.type)};`),b.push(`${e} = ${l.name}.${e};`)}for(let e of(function(e,t,i,r){let n=RegExp(`\\b${H(t)}\\s*\\(`,"g"),s=n.exec(e);for(;s;){if(s.index<i||s.index>r)throw Error(`ShaderPlugin varying output struct "${t}" is constructed outside the selected vertex entry point`);s=n.exec(e)}}(s,o,a.openBrace,a.closeBrace),a=F(s=function(e,t,i,r){let n=RegExp(`\\b${H(t)}\\s*\\(`,"g"),s=[],a=n.exec(e);for(;a;){if(a.index>i.openBrace&&a.index<i.closeBrace){let r=e.indexOf("(",a.index),n=q(e,r,"(",")");if(n<0||n>i.closeBrace)throw Error(`Unable to parse WGSL output constructor "${t}"`);s.push({openParenthesis:r,closeParenthesis:n})}a=n.exec(e)}for(let t of s.sort((e,t)=>t.closeParenthesis-e.closeParenthesis)){let i=e.slice(t.openParenthesis+1,t.closeParenthesis).trim()?", ":"";e=e.slice(0,t.closeParenthesis)+i+r.join(", ")+e.slice(t.closeParenthesis)}return e}(s,o,a,n.map(([e])=>e)),t,"vertex"),s=function(e,t,i){let r=function(e,t,i){let r=[],n=t;for(;n<i;)if(n=j(e,n,i),"return"!==e.slice(n,n+6)||/[A-Za-z0-9_]/.test(e[n+6]||""))n++;else{let t=n+6,s=function(e,t,i){let r=0,n=0;for(let s=t;s<i;s++){let t=j(e,s,i);if(t!==s){s=t-1;continue}let a=e[s];if("("===a&&r++,")"===a&&r--,"["===a&&n++,"]"===a&&n--,";"===a&&0===r&&0===n)return s}return -1}(e,t,i);if(s<0)throw Error("Unable to parse WGSL return statement in selected vertex entry point");r.push({start:n,expressionStart:t,semicolon:s}),n=s+1}return r}(e,t.openBrace+1,t.closeBrace);for(let t=r.length-1;t>=0;t--){let n=r[t],s=e.slice(n.expressionStart,n.semicolon).trim();if(!s)throw Error("ShaderPlugin varying vertex entry point cannot use an empty return");let a=`_luma_vertexOutput${t}`,o=i.map(e=>`${a}.${e} = ${e};`).join("\n"),u=`{
var ${a} = ${s};
${o}
return ${a};
}`;e=e.slice(0,n.start)+u+e.slice(n.semicolon+1)}return e}(s,a,n.map(([e])=>e)),(o===l.type?[o]:[o,l.type]).map(e=>z(s,e).closeBrace).sort((e,t)=>t-e)))s=s.slice(0,e)+`${p.join("\n")}
`+s.slice(e);if(u=F(s,i,"fragment"),!RegExp(`\\b${H(l.name)}\\s*:`).test(u.parameters))throw Error(`Unable to preserve WGSL fragment input "${l.name}"`);return{source:s,declarations:g.join("\n"),vertexInitialization:m.join("\n"),fragmentInitialization:b.join("\n")}}(O.source,P,$,T),Z=N.source,X="",K=_(S),en={},es={},ea={};for(let e in Q(L,en,es,ea),A){let t="string"==typeof A[e]?{injection:A[e],order:0}:A[e],i=/^(v|f)s:(#)?([\w-]+)$/.exec(e);if(i){let r=i[2],n=i[3];r?"decl"===n?es[e]=[t]:ea[e]=[t]:en[e]=[t]}else ea[e]=[t]}i=O.declarations,n=O.initialization,a=es,o=ea,i&&(a["vs:#decl"]=a["vs:#decl"]||[],a["vs:#decl"].push({injection:i,order:Number.MIN_SAFE_INTEGER})),n&&(o["vs:#main-start"]=o["vs:#main-start"]||[],o["vs:#main-start"].push({injection:n,order:Number.MIN_SAFE_INTEGER})),u=N,l=es,f=ea,u.declarations&&(l["vs:#decl"]=l["vs:#decl"]||[],l["vs:#decl"].push({injection:u.declarations,order:Number.MIN_SAFE_INTEGER})),u.vertexInitialization&&(f["vs:#main-start"]=f["vs:#main-start"]||[],f["vs:#main-start"].push({injection:u.vertexInitialization,order:Number.MIN_SAFE_INTEGER})),u.fragmentInitialization&&(f["fs:#main-start"]=f["fs:#main-start"]||[],f["fs:#main-start"].push({injection:u.fragmentInitialization,order:Number.MIN_SAFE_INTEGER}));let eo=function(e){let t=(0,y.M8)(e,y.z9),i=new Map;for(let e of t){if("auto"===e.bindingToken)continue;let t=Number(e.bindingToken),r=Number(e.groupToken);ee(r,t,e.name),ei(i,r,t,`application binding "${e.name}"`)}let r={sawSupportedBindingDeclaration:t.length>0},n=(0,y.u5)(e,y.z9,e=>(function(e,t,i){let{match:r,bindingToken:n,groupToken:s,name:a}=e,o=Number(s);if("auto"===n){let e=function(e,t){let i=t.get(e)||new Set,r=0;for(;i.has(r);)r++;return r}(o,t);return ee(o,e,a),ei(t,o,e,`application binding "${a}"`),r.replace(/@binding\(\s*auto\s*\)/,`@binding(${e})`)}return i.sawSupportedBindingDeclaration=!0,r})(e,i,r));if((0,y.CH)(e)&&!r.sawSupportedBindingDeclaration)throw Error('Unsupported @binding(auto) declaration form in application WGSL. Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.');return{source:n}}(Z),eu=function(e){let t=new Map;for(let i of(0,y.M8)(e,y.q2)){let e=Number(i.bindingToken),r=Number(i.groupToken);ee(r,e,i.name),ei(t,r,e,`application binding "${i.name}"`)}return t}(eo.source),el=function(e,t,i,r){let n=new Map;if(!t)return n;for(let s of e)for(let e of function(e,t){let i=[],r=C(e.source||"",{defines:t});for(let e of(0,y.M8)(r,y.eB))i.push({name:e.name,group:Number(e.groupToken)});return i}(s,r)){let r=er(e.group,s.name,e.name),a=t.get(r);if(void 0!==a){let t=n.get(e.group)||new Map,s=t.get(a);if(s&&s!==r)throw Error(`Duplicate WGSL binding reservation for modules "${s}" and "${r}": group ${e.group}, binding ${a}.`);ei(i,e.group,a,`registered module binding "${r}"`),t.set(a,r),n.set(e.group,t)}}return n}(E,t._bindingRegistry,eu,x),ef=[];for(let e of E){M&&(0,r.ZG)(e,Z,M);let i=function(e,t,i){let r=[],n={sawSupportedBindingDeclaration:(0,y.M8)(e,y.eB).length>0,nextHintedBindingLocation:"number"==typeof t.firstBindingSlot?t.firstBindingSlot:null},s=(0,y.u5)(e,y.eB,e=>(function(e,t){let{module:i,context:r,bindingAssignments:n,relocationState:s}=t,{match:a,bindingToken:o,groupToken:u,name:l}=e,f=Number(u);if("auto"===o){let e=er(f,i.name,l),t=r.bindingRegistry?.get(e),o=void 0!==t?t:function(e,t,i,r,n){let s=t.get(e)||new Set,a=new Set,o=`${e}:`,u=`${o}${i}:`;for(let[e,t]of n||[])e.startsWith(u)&&a.add(t);let l=r??(0===e?100:s.size>0?Math.max(...s)+1:0);for(;s.has(l)||a.has(l);)l++;for(let[e,t]of n||[])t===l&&e.startsWith(o)&&n?.delete(e);return l}(f,r.usedBindingsByGroup,i.name,s.nextHintedBindingLocation??void 0,r.bindingRegistry);return(et(i.name,f,o,l),void 0!==t&&function(e,t,i,r){let n=e.get(t);if(!n)return!1;let s=n.get(i);if(!s)return!1;if(s!==r)throw Error(`Registered module binding "${r}" collided with "${s}": group ${t}, binding ${i}.`);return!0}(r.reservedBindingKeysByGroup,f,o,e))?n.push({moduleName:i.name,name:l,group:f,location:o}):(ei(r.usedBindingsByGroup,f,o,`module "${i.name}" binding "${l}"`),r.bindingRegistry?.set(e,o),n.push({moduleName:i.name,name:l,group:f,location:o}),null!==s.nextHintedBindingLocation&&void 0===t&&(s.nextHintedBindingLocation=o+1)),a.replace(/@binding\(\s*auto\s*\)/,`@binding(${o})`)}let h=Number(o);return et(i.name,f,h,l),ei(r.usedBindingsByGroup,f,h,`module "${i.name}" binding "${l}"`),n.push({moduleName:i.name,name:l,group:f,location:h}),a})(e,{module:t,context:i,bindingAssignments:r,relocationState:n}));if((0,y.CH)(e)&&!n.sawSupportedBindingDeclaration)throw Error(`Unsupported @binding(auto) declaration form in module "${t.name}". Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.`);return{source:s,bindingAssignments:r}}(C(J(e,"wgsl",M),{defines:x}),e,{usedBindingsByGroup:eu,bindingRegistry:t._bindingRegistry,reservedBindingKeysByGroup:el});ef.push(...i.bindingAssignments),X+=i.source;let n=(c=e,{...c.instance?.normalizedInjections.vertex||{},...c.instance?.normalizedInjections.fragment||{}});for(let e in n){let t=/^(v|f)s:#([\w-]+)$/.exec(e);if(t){let i="decl"===t[2]?es:ea;i[e]=i[e]||[],i[e].push(n[e])}else en[e]=en[e]||[],en[e].push(n[e])}}return X+=Y,X=(0,s.bv)(X,w,(m=[...(d=es)["vs:#decl"]||[],...d["fs:#decl"]||[]]).length?{"vs:#decl":m}:{},!1,"wgsl",{vertex:P,fragment:$})+(p=K,g=en,b(p.vertex,g,"wgsl")+b(p.fragment,g,"wgsl"))+function(e){if(0===e.length)return"";let t="// ----- MODULE WGSL BINDING ASSIGNMENTS ---------------\n";for(let i of e)t+=`// ${i.moduleName}.${i.name} -> @group(${i.group}) @binding(${i.location})
`;return t+"\n"}(ef)+eo.source,function(e){var t,i;let r,n=(0,y.lh)(e,y.eB);if(!n)return;let s=function(e,t){let i,r,n=/^\/\/ ----- MODULE ([^\n]+) ---------------$/gm;for(r=n.exec(e);r&&r.index<=t;)i=r[1],r=n.exec(e);return i}(e,n.index);if(s)throw Error(`Unresolved @binding(auto) for module "${s}" binding "${n.name}" remained in assembled WGSL source.`);if(t=e,i=n.index,!((r=t.indexOf(Y))>=0)||i>r)throw Error(`Unresolved @binding(auto) for application binding "${n.name}" remained in assembled WGSL source.`);throw Error(`Unresolved @binding(auto) remained in assembled WGSL source near "${n.match.replace(/\s+/g," ").trim()}".`)}(X=(0,s.bv)(X,w,ea,!1,"wgsl",{vertex:P,fragment:$})),{source:X,bindingAssignments:ef}}(e.platformInfo,{...e,source:e.source,stage:"vertex",modules:t});return{source:i,getUniforms:K(t),bindingAssignments:a,bindingTable:w(i,a),shaderLayout:(0,S.A)(i,{vertexEntryPoint:e.vertexEntryPoint,scanVertexAttributes:e.scanVertexAttributes})}}({...e,source:o,defines:a,_bindingRegistry:this._wgslBindingRegistry,modules:t,hookFunctions:i}),c="wgsl"===e.platformInfo.shaderLanguage?C(u,{defines:a}):u;return{source:c,getUniforms:l,modules:t,bindingAssignments:f,bindingTable:w(c,f),shaderLayout:(0,S.A)(c,{vertexEntryPoint:e.vertexEntryPoint,scanVertexAttributes:e.scanVertexAttributes})}}static getShaderPreprocessorDefines(e,t){return{...ea.getPlatformPreprocessorDefines(e.platformInfo),...t.reduce((e,t)=>(Object.assign(e,t.defines),e),{}),...e.defines}}static getPlatformPreprocessorDefines(e){let t=e.limits||{};return{LUMA_SUPPORTS_VERTEX_STORAGE_BUFFERS:"webgpu"===e.type&&(t.maxStorageBuffersInVertexStage||0)>0,LUMA_FP64_INTEGER_ARITHMETIC:"webgpu"===e.type&&"apple"===e.gpu.toLowerCase()}}}},31770(e,t,i){i.d(t,{O_:()=>o,bv:()=>l,Uu:()=>u});let r={vertex:`\
#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`,fragment:`\
#ifdef MODULE_MATERIAL
  fragColor = material_filterColor(fragColor);
#endif

#ifdef MODULE_LIGHTING
  fragColor = lighting_filterColor(fragColor);
#endif

#ifdef MODULE_FOG
  fragColor = fog_filterColor(fragColor);
#endif

#ifdef MODULE_PICKING
  fragColor = picking_filterHighlightColor(fragColor);
  fragColor = picking_filterPickingColor(fragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`},n=/void\s+main\s*\([^)]*\)\s*\{\n?/,s=/}\n?[^{}]*$/,a=[],o="__LUMA_INJECT_DECLARATIONS__";function u(e){let t={vertex:{},fragment:{}};for(let i in e){let r=e[i];"string"==typeof r&&(r={order:0,injection:r}),t[function(e){let t=e.slice(0,2);switch(t){case"vs":return"vertex";case"fs":return"fragment";default:throw Error(t)}}(i)][i]=r}return t}function l(e,t,i,u=!1,h="glsl",c={}){let d="vertex"===t;for(let t in i){let r=i[t];r.sort((e,t)=>e.order-t.order),a.length=r.length;for(let e=0,t=r.length;e<t;++e)a[e]=r[e].injection;let u=`${a.join("\n")}
`;switch(t){case"vs:#decl":("wgsl"===h||d)&&(e=e.replace(o,u));break;case"vs:#main-start":("wgsl"===h||d)&&(e="wgsl"===h?f(e,"vertex",u,"start",c.vertex):e.replace(n,e=>e+u));break;case"vs:#main-end":("wgsl"===h||d)&&(e="wgsl"===h?f(e,"vertex",u,"end",c.vertex):e.replace(s,e=>u+e));break;case"fs:#decl":"wgsl"!==h&&d||(e=e.replace(o,u));break;case"fs:#main-start":"wgsl"!==h&&d||(e="wgsl"===h?f(e,"fragment",u,"start",c.fragment):e.replace(n,e=>e+u));break;case"fs:#main-end":"wgsl"!==h&&d||(e="wgsl"===h?f(e,"fragment",u,"end",c.fragment):e.replace(s,e=>u+e));break;default:e=e.replace(t,e=>e+u)}}return e=e.replace(o,""),u&&(e=e.replace(/\}\s*$/,e=>e+r[t])),e}function f(e,t,i,r,n){let s=function(e,t,i){let r="vertex"===t?"@vertex":"@fragment",n=e.indexOf(r);if(n<0)return null;let s=i?e.search(RegExp(`\\bfn\\s+${i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*\\(`)):e.indexOf("fn",n);if(s<0)return null;let a=e.indexOf("{",s);if(a<0)return null;let o=0;for(let t=a;t<e.length;t++){let i=e[t];if("{"===i)o++;else if("}"===i&&0==--o)return{openBraceIndex:a,closeBraceIndex:t}}return null}(e,t,n);if(!s)return e;if("start"===r){let t=s.openBraceIndex+1;return`${e.slice(0,t)}
${i}${e.slice(t)}`}return`${e.slice(0,s.closeBraceIndex)}${i}${e.slice(s.closeBraceIndex)}`}},65261(e,t,i){i.d(t,{$Q:()=>n});var r=i(72560);function n(e){(0,r.$g)(e);let t={},i={};!function e(t){let{modules:i,level:r,moduleMap:n,moduleDepth:s}=t;if(r>=5)throw Error("Possible loop in shader dependency graph");for(let e of i)n[e.name]=e,(void 0===s[e.name]||s[e.name]<r)&&(s[e.name]=r);for(let t of i)t.dependencies&&e({modules:t.dependencies,level:r+1,moduleMap:n,moduleDepth:s})}({modules:e,level:0,moduleMap:t,moduleDepth:i});let n=Object.keys(i).sort((e,t)=>i[t]-i[e]).map(e=>t[e]);return(0,r.$g)(n),n}},72560(e,t,i){i.d(t,{UK:()=>o,$g:()=>a,ZG:()=>u});let r={number:{type:"number",validate:(e,t)=>Number.isFinite(e)&&"object"==typeof t&&(void 0===t.max||e<=t.max)&&(void 0===t.min||e>=t.min)},array:{type:"array",validate:(e,t)=>Array.isArray(e)||ArrayBuffer.isView(e)}};function n(e){return Array.isArray(e)||ArrayBuffer.isView(e)?"array":typeof e}var s=i(31770);function a(e){e.map(e=>o(e))}function o(e){var t;if(e.instance)return;a(e.dependencies||[]);let{propTypes:i={},deprecations:o=[],inject:u={}}=e,l={normalizedInjections:(0,s.Uu)(u),parsedDeprecations:((t=o).forEach(e=>{"function"===e.type?e.regex=RegExp(`\\b${e.old}\\(`):e.regex=RegExp(`${e.type} ${e.old};`)}),t)};i&&(l.propValidators=function(e){let t={};for(let[i,s]of Object.entries(e))t[i]=function(e){let t=n(e);if("object"!==t)return{value:e,...r[t],type:t};if("object"==typeof e)return e?void 0!==e.type?{...e,...r[e.type],type:e.type}:void 0===e.value?{type:"object",value:e}:(t=n(e.value),{...e,...r[t],type:t}):{type:"object",value:null};throw Error("props")}(s);return t}(i)),e.instance=l;let f={};i&&(f=Object.entries(i).reduce((e,[t,i])=>{let r=i?.value;return r&&(e[t]=r),e},{})),e.defaultUniforms={...e.defaultUniforms,...f}}function u(e,t,i){e.deprecations?.forEach(e=>{e.regex?.test(t)&&(e.deprecated?i.deprecated(e.old,e.new)():i.removed(e.old,e.new)())})}},79083(e,t,i){i.d(t,{K:()=>a,r:()=>s});var r=i(44791);let n=/^(vs|fs):(?:#(?:decl|main-start|main-end)|[A-Za-z_][\w-]*)$/;function s(e=[],t){let i=[],r={},n={},a={},u={};for(let s of e)o({modules:i,defines:r,injections:n,vertexInputs:a,varyings:u},s),o({modules:i,defines:r,injections:n,vertexInputs:a,varyings:u},s[t]);for(let e of Object.keys(u))if(a[e])throw Error(`ShaderPlugin name "${e}" cannot be both a vertex input and a varying`);return{modules:i,defines:r,injections:n,vertexInputs:a,varyings:u}}function a(e=[],t=[]){let i=[...e],r=new Set(i.map(e=>e.name));for(let e of t)r.has(e.name)||(i.push(e),r.add(e.name));return i}function o(e,t){if(t){for(let[i,r]of(t.modules?.length&&e.modules.push(...t.modules),t.defines&&Object.assign(e.defines,t.defines),Object.entries(t.vertexInputs||{}))){u(i,"vertex input");let t=e.vertexInputs[i];if(t&&t!==r)throw Error(`ShaderPlugin vertex input "${i}" has conflicting types "${t}" and "${r}"`);e.vertexInputs[i]=r}for(let[i,n]of Object.entries(t.varyings||{})){u(i,"varying");let t=function(e,t){let{primitiveType:i}=r.Co.getAttributeShaderTypeInfo(t.type),n="i32"===i||"u32"===i,s=t.interpolation||(n?"flat":"smooth");if(n&&"smooth"===s)throw Error(`ShaderPlugin integer varying "${e}" must use flat interpolation`);return{type:t.type,interpolation:s}}(i,n),s=e.varyings[i];if(s&&(s.type!==t.type||s.interpolation!==t.interpolation))throw Error(`ShaderPlugin varying "${i}" has conflicting declarations "${s.type}/${s.interpolation}" and "${t.type}/${t.interpolation}"`);e.varyings[i]=t}for(let i of t.injections||[])(function(e){if(!n.test(e))throw Error(`ShaderPlugin injection target "${e}" must be a named shader anchor or hook`)})(i.target),e.injections[i.target]||(e.injections[i.target]=[]),e.injections[i.target].push({injection:i.injection,order:i.order??0})}}function u(e,t){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e)||e.startsWith("_luma_"))throw Error(`ShaderPlugin ${t} "${e}" must be a valid non-reserved identifier`)}},57102(e,t,i){i.d(t,{q:()=>n});var r=i(23471);let n={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:[0,1,1,1]},vs:`\
layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

out vec4 picking_vRGBcolor_Avalid;

// Normalize unsigned byte color to 0-1 range
vec3 picking_normalizeColor(vec3 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

// Normalize unsigned byte color to 0-1 range
vec4 picking_normalizeColor(vec4 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

bool picking_isColorZero(vec3 color) {
  return dot(color, vec3(1.0)) < 0.00001;
}

bool picking_isColorValid(vec3 color) {
  return dot(color, vec3(1.0)) > 0.00001;
}

// Check if this vertex is highlighted 
bool isVertexHighlighted(vec3 vertexColor) {
  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  return
    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));
}

// Set the current picking color
void picking_setPickingColor(vec3 pickingColor) {
  pickingColor = picking_normalizeColor(pickingColor);

  if (bool(picking.isActive)) {
    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));

    if (!bool(picking.isAttribute)) {
      // Stores the picking color so that the fragment shader can render it during picking
      picking_vRGBcolor_Avalid.rgb = pickingColor;
    }
  } else {
    // Do the comparison with selected item color in vertex shader as it should mean fewer compares
    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));
  }
}

void picking_setPickingAttribute(float value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.r = value;
  }
}

void picking_setPickingAttribute(vec2 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rg = value;
  }
}

void picking_setPickingAttribute(vec3 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rgb = value;
  }
}
`,fs:`\
layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

in vec4 picking_vRGBcolor_Avalid;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (picking.isActive > 0.5) {
    return color;
  }

  bool selected = bool(picking_vRGBcolor_Avalid.a);

  if (selected) {
    // Blend in highlight color based on its alpha value
    float highLightAlpha = picking.highlightColor.a;
    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
    float highLightRatio = highLightAlpha / blendedAlpha;

    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
    return vec4(blendedRGB, blendedAlpha);
  } else {
    return color;
  }
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_vRGBcolor_Avalid.a == 0.0) {
      discard;
    }
    return picking_vRGBcolor_Avalid;
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 highlightColor = picking_filterHighlightColor(color);
  return picking_filterPickingColor(highlightColor);
}
`,getUniforms:function(e={},t){let i={},n=(0,r.eS)(e.useByteColors,!0);return void 0===e.highlightedObjectColor||(null===e.highlightedObjectColor?i.isHighlightActive=!1:(i.isHighlightActive=!0,i.highlightedObjectColor=e.highlightedObjectColor.slice(0,3))),e.highlightColor&&(i.highlightColor=(0,r.jI)(e.highlightColor,n)),void 0!==e.isActive&&(i.isActive=!!e.isActive,i.isAttribute=!!e.isAttribute),void 0!==e.useByteColors&&(i.useByteColors=!!e.useByteColors),i}}},22270(e,t,i){i.d(t,{i:()=>r});let r={name:"fp32",vs:`\
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND

// All these functions are for substituting tan() function from Intel GPU only
const float TWO_PI = 6.2831854820251465;
const float PI_2 = 1.5707963705062866;
const float PI_16 = 0.1963495463132858;

const float SIN_TABLE_0 = 0.19509032368659973;
const float SIN_TABLE_1 = 0.3826834261417389;
const float SIN_TABLE_2 = 0.5555702447891235;
const float SIN_TABLE_3 = 0.7071067690849304;

const float COS_TABLE_0 = 0.9807852506637573;
const float COS_TABLE_1 = 0.9238795042037964;
const float COS_TABLE_2 = 0.8314695954322815;
const float COS_TABLE_3 = 0.7071067690849304;

const float INVERSE_FACTORIAL_3 = 1.666666716337204e-01; // 1/3!
const float INVERSE_FACTORIAL_5 = 8.333333767950535e-03; // 1/5!
const float INVERSE_FACTORIAL_7 = 1.9841270113829523e-04; // 1/7!
const float INVERSE_FACTORIAL_9 = 2.75573188446287533e-06; // 1/9!

float sin_taylor_fp32(float a) {
  float r, s, t, x;

  if (a == 0.0) {
    return 0.0;
  }

  x = -a * a;
  s = a;
  r = a;

  r = r * x;
  t = r * INVERSE_FACTORIAL_3;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_5;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_7;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_9;
  s = s + t;

  return s;
}

void sincos_taylor_fp32(float a, out float sin_t, out float cos_t) {
  if (a == 0.0) {
    sin_t = 0.0;
    cos_t = 1.0;
  }
  sin_t = sin_taylor_fp32(a);
  cos_t = sqrt(1.0 - sin_t * sin_t);
}

float tan_taylor_fp32(float a) {
    float sin_a;
    float cos_a;

    if (a == 0.0) {
        return 0.0;
    }

    // 2pi range reduction
    float z = floor(a / TWO_PI);
    float r = a - TWO_PI * z;

    float t;
    float q = floor(r / PI_2 + 0.5);
    int j = int(q);

    if (j < -2 || j > 2) {
        return 1.0 / 0.0;
    }

    t = r - PI_2 * q;

    q = floor(t / PI_16 + 0.5);
    int k = int(q);
    int abs_k = int(abs(float(k)));

    if (abs_k > 4) {
        return 1.0 / 0.0;
    } else {
        t = t - PI_16 * q;
    }

    float u = 0.0;
    float v = 0.0;

    float sin_t, cos_t;
    float s, c;
    sincos_taylor_fp32(t, sin_t, cos_t);

    if (k == 0) {
        s = sin_t;
        c = cos_t;
    } else {
        if (abs(float(abs_k) - 1.0) < 0.5) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs(float(abs_k) - 2.0) < 0.5) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs(float(abs_k) - 3.0) < 0.5) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else if (abs(float(abs_k) - 4.0) < 0.5) {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }
        if (k > 0) {
            s = u * sin_t + v * cos_t;
            c = u * cos_t - v * sin_t;
        } else {
            s = u * sin_t - v * cos_t;
            c = u * cos_t + v * sin_t;
        }
    }

    if (j == 0) {
        sin_a = s;
        cos_a = c;
    } else if (j == 1) {
        sin_a = c;
        cos_a = -s;
    } else if (j == -1) {
        sin_a = -c;
        cos_a = s;
    } else {
        sin_a = -s;
        cos_a = -c;
    }
    return sin_a / cos_a;
}
#endif

float tan_fp32(float a) {
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND
  return tan_taylor_fp32(a);
#else
  return tan(a);
#endif
}
`}},72274(e,t,i){function r(e,t=[],i=0){let n=Math.fround(e),s=e-n;return t[i]=n,t[i+1]=s,t}i.d(t,{d:()=>a});let n=`\

layout(std140) uniform fp64arithmeticUniforms {
  uniform float ONE;
  uniform float SPLIT;
} fp64;

/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND

The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' form.

These helpers implement Dekker/Veltkamp-style error tracking. If the compiler
folds constants or reassociates the arithmetic, the high/low split can stop
tracking the rounding error correctly. That failure mode tends to look fine in
simple coordinate setup, but then breaks down inside iterative arithmetic such
as fp64 Mandelbrot loops.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

float prevent_fp64_optimization(float value) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  return value + fp64.ONE * 0.0;
#else
  return value;
#endif
}

// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  // Keep SPLIT as a runtime uniform so the compiler cannot fold the Dekker
  // split into a constant expression and reassociate the recovery steps.
  float split = prevent_fp64_optimization(fp64.SPLIT);
  float t = prevent_fp64_optimization(a * split);
  float temp = t - a;
  float a_hi = t - temp;
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}

// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * fp64.ONE;
  float err = b - (sum - a) * fp64.ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}

// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * fp64.ONE + 2.0 * a_fp64.x *
    a_fp64.y * fp64.ONE * fp64.ONE) + a_fp64.y * a_fp64.y * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  // twoProd is especially sensitive because mul_fp64 and div_fp64 both depend
  // on the split terms and cross terms staying in the original evaluation
  // order. If the compiler folds or reassociates them, the low part tends to
  // collapse to zero or NaN on some drivers.
  float highProduct = prevent_fp64_optimization(a_fp64.x * b_fp64.x);
  float crossProduct1 = prevent_fp64_optimization(a_fp64.x * b_fp64.y);
  float crossProduct2 = prevent_fp64_optimization(a_fp64.y * b_fp64.x);
  float lowProduct = prevent_fp64_optimization(a_fp64.y * b_fp64.y);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err1 = (highProduct - prod) * fp64.ONE;
  float err2 = crossProduct1 * fp64.ONE * fp64.ONE;
  float err3 = crossProduct2 * fp64.ONE * fp64.ONE * fp64.ONE;
  float err4 = lowProduct * fp64.ONE * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err1 = highProduct - prod;
  float err2 = crossProduct1;
  float err3 = crossProduct2;
  float err4 = lowProduct;
#endif
  float err = ((err1 + err2) + err3) + err4;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * fp64.ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
`,s=`\
struct Fp64F32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent.
fn fp64_decode_f32_bits(bits: u32) -> Fp64F32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64F32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64F32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64F32Bits(sign, i32(exponentBits) - 150, 0x800000u | fraction, false, false, false);
}

fn fp64_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return exactSign << 31u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;

  // A normal two-sum/two-product residual never needs a shift this large.
  // This guard gives deterministic underflow behavior outside that contract.
  if (exactShift >= 64 || highShift >= 64) {
    return exactSign << 31u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let lowBits = fp64_make_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  return vec2u(highBits, lowBits);
}

fn fp64_two_sum_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u((a.sign & b.sign) << 31u, 0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = select(
    b.baseExponent - a.baseExponent,
    a.baseExponent - b.baseExponent,
    a.baseExponent >= b.baseExponent
  );

  // Beyond half an ulp, rounding cannot change the larger operand. Returning
  // the smaller operand intact also avoids an unbounded integer alignment.
  // At a power-of-two boundary the spacing below the larger operand is half
  // the spacing above it, so an opposite-sign gap-25 operand can still change
  // the rounded high limb. Gap 26 is the first universally safe early-out.
  if (exponentDifference > 25) {
    if (fp64_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u, 0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_accumulator_bits(resultSign, resultMagnitude, commonBaseExponent);
}

fn fp64_two_sum_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_multiply_significands(a: u32, b: u32) -> vec2u {
  let aLow = a & 0xffffu;
  let aHigh = a >> 16u;
  let bLow = b & 0xffffu;
  let bHigh = b >> 16u;
  let lowProduct = aLow * bLow;
  let crossProduct = aLow * bHigh + aHigh * bLow;
  let highProduct = aHigh * bHigh;

  var result = vec2u(0u, lowProduct);
  result = fp64_u64_add(
    result,
    fp64_u64_shift_left(vec2u(0u, crossProduct), 16u)
  );
  result = fp64_u64_add(result, vec2u(highProduct, 0u));
  return result;
}

fn fp64_two_prod_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);
  let resultSign = a.sign ^ b.sign;

  if (a.isNan || b.isNan || ((a.isZero || b.isZero) && (a.isInf || b.isInf))) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    return vec2u((resultSign << 31u) | 0x7f800000u, resultSign << 31u);
  }
  if (a.isZero || b.isZero) {
    return vec2u(resultSign << 31u, resultSign << 31u);
  }

  let magnitude = fp64_multiply_significands(a.significand, b.significand);
  return fp64_split_accumulator_bits(
    resultSign,
    magnitude,
    a.baseExponent + b.baseExponent
  );
}

fn fp64_two_prod_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_prod_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_round_add_integer(a: f32, b: f32) -> f32 {
  return fp64_two_sum_integer(a, b).x;
}

fn fp64_round_mul_integer(a: f32, b: f32) -> f32 {
  return fp64_two_prod_integer(a, b).x;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_finite_exponent(value: Fp64F32Bits) -> i32 {
  let mostSignificantBit = 31u - countLeadingZeros(value.significand);
  return value.baseExponent + i32(mostSignificantBit);
}

fn fp64_scale_f32_integer(value: f32, exponent: i32) -> f32 {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(value));
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return value;
  }
  let resultBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent + exponent
  );
  return bitcast<f32>(resultBits);
}

// Divide normalized significands so the hardware operation cannot overflow,
// underflow, or flush a subnormal result. Reapply the exponent with integer
// packing, which also produces subnormal correction limbs without relying on
// floating-point arithmetic to preserve them.
fn fp64_divide_f32_integer(aValue: f32, bValue: f32) -> f32 {
  let a = fp64_decode_f32_bits(bitcast<u32>(aValue));
  let b = fp64_decode_f32_bits(bitcast<u32>(bValue));
  if (a.isZero || b.isZero || a.isInf || b.isInf || a.isNan || b.isNan) {
    return aValue / bValue;
  }

  let aMostSignificantBit = 31u - countLeadingZeros(a.significand);
  let bMostSignificantBit = 31u - countLeadingZeros(b.significand);
  let normalizedABits = fp64_make_f32_bits_from_u64(
    a.sign,
    vec2u(0u, a.significand),
    -i32(aMostSignificantBit)
  );
  let normalizedBBits = fp64_make_f32_bits_from_u64(
    b.sign,
    vec2u(0u, b.significand),
    -i32(bMostSignificantBit)
  );
  let normalizedQuotient = bitcast<f32>(normalizedABits) / bitcast<f32>(normalizedBBits);
  let quotient = fp64_decode_f32_bits(bitcast<u32>(normalizedQuotient));
  let exponentShift =
    a.baseExponent + i32(aMostSignificantBit) -
    b.baseExponent - i32(bMostSignificantBit);
  let quotientBits = fp64_make_f32_bits_from_u64(
    quotient.sign,
    vec2u(0u, quotient.significand),
    quotient.baseExponent + exponentShift
  );
  return bitcast<f32>(quotientBits);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  // Rounding the high limb of a maximum-exponent value can overflow even
  // though the original value is finite. Truncate only in that boundary case
  // so split remains an exact finite decomposition.
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = fp64_round_add_integer(result.y, a.y);
  return result;
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var sum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = fp64_two_sum_integer(a.y, b.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.x);
  sum = fp64_two_sum_integer(sum.x, sum.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.y);
  return fp64_two_sum_integer(sum.x, sum.y);
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let negatedB = vec2f(
    bitcast<f32>(bitcast<u32>(b.x) ^ 0x80000000u),
    bitcast<f32>(bitcast<u32>(b.y) ^ 0x80000000u)
  );
  return sum_fp64(a, negatedB);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var product = fp64_two_prod_integer(a.x, b.x);
  let crossProduct1 = fp64_round_mul_integer(a.x, b.y);
  product.y = fp64_round_add_integer(product.y, crossProduct1);
  product = fp64_two_sum_integer(product.x, product.y);
  let crossProduct2 = fp64_round_mul_integer(a.y, b.x);
  product.y = fp64_round_add_integer(product.y, crossProduct2);
  return fp64_two_sum_integer(product.x, product.y);
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_scale_fp64_integer(value: vec2f, exponent: i32) -> vec2f {
  let high = fp64_scale_f32_integer(value.x, exponent);
  let low = fp64_scale_f32_integer(value.y, exponent);
  return sum_fp64(vec2f(high, 0.0), vec2f(low, 0.0));
}

fn fp64_div_fp64_normalized(a: vec2f, b: vec2f) -> vec2f {
  let quotientHigh = fp64_divide_f32_integer(a.x, b.x);
  var quotient = vec2f(quotientHigh, 0.0);

  let remainder = sub_fp64(a, mul_fp64(b, quotient));
  let quotientLow = fp64_divide_f32_integer(remainder.x, b.x);
  quotient = sum_fp64(quotient, vec2f(quotientLow, 0.0));

  let secondRemainder = sub_fp64(a, mul_fp64(b, quotient));
  let correction = fp64_divide_f32_integer(secondRemainder.x, b.x);
  return sum_fp64(quotient, vec2f(correction, 0.0));
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let decodedA = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedB = fp64_decode_f32_bits(bitcast<u32>(b.x));
  if (
    decodedA.isZero || decodedB.isZero ||
    decodedA.isInf || decodedB.isInf ||
    decodedA.isNan || decodedB.isNan
  ) {
    return fp64_div_fp64_normalized(a, b);
  }

  let exponentA = fp64_f32_finite_exponent(decodedA);
  let exponentB = fp64_f32_finite_exponent(decodedB);
  // Correct the quotient near unity so b * q and the remainder stay clear of
  // both f32 underflow and overflow. The exponent difference is applied once.
  let normalizedA = fp64_scale_fp64_integer(a, -exponentA);
  let normalizedB = fp64_scale_fp64_integer(b, -exponentB);
  let normalizedQuotient = fp64_div_fp64_normalized(normalizedA, normalizedB);
  return fp64_scale_fp64_integer(normalizedQuotient, exponentA - exponentB);
}

fn fp64_sqrt_fp64_normalized(a: vec2f) -> vec2f {
  let estimate = sqrt(a.x);
  let difference = sub_fp64(a, fp64_two_prod_integer(estimate, estimate)).x;
  let denominator = fp64_round_add_integer(estimate, estimate);
  let correction = fp64_divide_f32_integer(difference, denominator);
  return sum_fp64(vec2f(estimate, 0.0), vec2f(correction, 0.0));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  if (decoded.isZero && decodedLow.isZero) {
    return vec2f(0.0, 0.0);
  }
  if (decoded.sign == 1u) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  if (decoded.isInf || decoded.isNan) {
    return fp64_sqrt_fp64_normalized(a);
  }
  let exponent = fp64_f32_finite_exponent(decoded);
  // An even scale lets the final square-root rescale use an integer exponent.
  let evenExponent = exponent - (exponent & 1);
  let normalizedA = fp64_scale_fp64_integer(a, -evenExponent);
  let normalizedRoot = fp64_sqrt_fp64_normalized(normalizedA);
  return fp64_scale_fp64_integer(normalizedRoot, evenExponent / 2);
}
#endif
`,a={name:"fp64arithmetic",source:`\
struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64Bits {
  sign: u32,
  exponent: i32,
  significand: vec2u,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}
#endif

fn fp64_u64_is_zero(value: vec2u) -> bool {
  return value.x == 0u && value.y == 0u;
}

fn fp64_u64_compare(a: vec2u, b: vec2u) -> i32 {
  if (a.x != b.x) {
    return select(-1, 1, a.x > b.x);
  }
  if (a.y != b.y) {
    return select(-1, 1, a.y > b.y);
  }
  return 0;
}

fn fp64_u64_add(a: vec2u, b: vec2u) -> vec2u {
  let low = a.y + b.y;
  let carry = select(0u, 1u, low < a.y);
  return vec2u(a.x + b.x + carry, low);
}

fn fp64_u64_sub(a: vec2u, b: vec2u) -> vec2u {
  let borrow = select(0u, 1u, a.y < b.y);
  return vec2u(a.x - b.x - borrow, a.y - b.y);
}

fn fp64_u64_shift_left(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u((value.x << shift) | (value.y >> (32u - shift)), value.y << shift);
  }
  if (shift == 32u) {
    return vec2u(value.y, 0u);
  }
  if (shift < 64u) {
    return vec2u(value.y << (shift - 32u), 0u);
  }
  return vec2u(0u);
}

fn fp64_u64_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u(value.x >> shift, (value.y >> shift) | (value.x << (32u - shift)));
  }
  if (shift == 32u) {
    return vec2u(0u, value.x);
  }
  if (shift < 64u) {
    return vec2u(0u, value.x >> (shift - 32u));
  }
  return vec2u(0u);
}

fn fp64_u64_get_bit(value: vec2u, bitIndex: u32) -> bool {
  if (bitIndex >= 64u) {
    return false;
  }
  if (bitIndex >= 32u) {
    return ((value.x >> (bitIndex - 32u)) & 1u) != 0u;
  }
  return ((value.y >> bitIndex) & 1u) != 0u;
}

fn fp64_u64_has_bits_below(value: vec2u, bitCount: u32) -> bool {
  if (bitCount == 0u) {
    return false;
  }
  if (bitCount >= 64u) {
    return !fp64_u64_is_zero(value);
  }
  if (bitCount > 32u) {
    let highBitCount = bitCount - 32u;
    let highMask = (1u << highBitCount) - 1u;
    return value.y != 0u || (value.x & highMask) != 0u;
  }
  if (bitCount == 32u) {
    return value.y != 0u;
  }
  let lowMask = (1u << bitCount) - 1u;
  return (value.y & lowMask) != 0u;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_u64_shift_right_sticky(value: vec2u, shift: u32) -> vec2u {
  var shifted = fp64_u64_shift_right(value, shift);
  if (fp64_u64_has_bits_below(value, shift)) {
    shifted.y = shifted.y | 1u;
  }
  return shifted;
}
#endif

fn fp64_u64_count_leading_zeros(value: vec2u) -> u32 {
  if (value.x != 0u) {
    return countLeadingZeros(value.x);
  }
  return 32u + countLeadingZeros(value.y);
}

fn fp64_round_shift_right_to_u32(value: vec2u, shift: u32) -> u32 {
  if (shift == 0u) {
    return value.y;
  }

  let truncated = fp64_u64_shift_right(value, shift);
  var rounded = truncated.y;
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded & 1u) == 1u)) {
    rounded = rounded + 1u;
  }
  return rounded;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_round_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }

  var rounded = fp64_u64_shift_right(value, shift);
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded.y & 1u) == 1u)) {
    rounded = fp64_u64_add(rounded, vec2u(0u, 1u));
  }
  return rounded;
}
#endif

fn fp64_make_f32_bits_from_u64(sign: u32, significand: vec2u, baseExponent: i32) -> u32 {
  if (fp64_u64_is_zero(significand)) {
    return sign << 31u;
  }

  let leadingZeros = fp64_u64_count_leading_zeros(significand);
  let mostSignificantBit = 63u - leadingZeros;
  var exponent = baseExponent + i32(mostSignificantBit);

  if (exponent > 127) {
    return (sign << 31u) | 0x7f800000u;
  }

  if (exponent >= -126) {
    let shift = i32(mostSignificantBit) - 23;
    var significand24: u32;
    if (shift > 0) {
      significand24 = fp64_round_shift_right_to_u32(significand, u32(shift));
    } else {
      significand24 = fp64_u64_shift_left(significand, u32(-shift)).y;
    }

    if (significand24 >= 0x1000000u) {
      significand24 = significand24 >> 1u;
      exponent = exponent + 1;
      if (exponent > 127) {
        return (sign << 31u) | 0x7f800000u;
      }
    }

    return (sign << 31u) | (u32(exponent + 127) << 23u) | (significand24 & 0x7fffffu);
  }

  let scaleExponent = baseExponent + 149;
  var mantissa: u32;
  if (scaleExponent >= 0) {
    mantissa = fp64_u64_shift_left(significand, u32(scaleExponent)).y;
  } else {
    mantissa = fp64_round_shift_right_to_u32(significand, u32(-scaleExponent));
  }

  if (mantissa >= 0x800000u) {
    return (sign << 31u) | 0x00800000u;
  }
  return (sign << 31u) | mantissa;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_decode_bits(bits: vec2u) -> Fp64Bits {
  let sign = bits.x >> 31u;
  let exponentBits = (bits.x >> 20u) & 0x7ffu;
  let fractionHigh = bits.x & 0xfffffu;
  let fractionLow = bits.y;
  let fraction = vec2u(fractionHigh, fractionLow);

  if (exponentBits == 0x7ffu) {
    let isInf = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, 0, vec2u(0u), false, isInf, !isInf);
  }

  if (exponentBits == 0u) {
    let isZero = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, -1022, fraction, isZero, false, false);
  }

  return Fp64Bits(sign, i32(exponentBits) - 1023, vec2u((1u << 20u) | fractionHigh, fractionLow), false, false, false);
}

fn fp64_finite_magnitude_compare(a: Fp64Bits, b: Fp64Bits) -> i32 {
  if (a.exponent != b.exponent) {
    return select(-1, 1, a.exponent > b.exponent);
  }
  return fp64_u64_compare(a.significand, b.significand);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64RawF32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent. This shared
// integer representation lets normalization remain independent of the
// selected double-single arithmetic implementation.
fn fp64_decode_raw_f32_bits(bits: u32) -> Fp64RawF32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64RawF32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64RawF32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64RawF32Bits(
    sign,
    i32(exponentBits) - 150,
    0x800000u | fraction,
    false,
    false,
    false
  );
}

fn fp64_raw_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_raw_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_raw_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return 0u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;
  if (exactShift >= 64 || highShift >= 64) {
    return 0u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_raw_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let rawLowBits = fp64_make_raw_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  let lowBits = select(rawLowBits, 0u, (rawLowBits & 0x7fffffffu) == 0u);
  if ((highBits & 0x7fffffffu) == 0u && (lowBits & 0x7fffffffu) == 0u) {
    return vec2u(0u);
  }
  return vec2u(highBits, lowBits);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
// Round an arithmetic accumulator to binary64 before splitting it. The
// aligned add/subtract paths retain three guard bits plus a sticky bit, which
// is sufficient for round-to-nearest-even at the binary64 boundary.
fn fp64_split_binary64_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }

  let mostSignificantBit = 63u - fp64_u64_count_leading_zeros(magnitude);
  let exponent = baseExponent + i32(mostSignificantBit);
  if (exponent > 1023) {
    return vec2u((sign << 31u) | 0x7f800000u, 0u);
  }

  var roundedMagnitude = magnitude;
  var roundedBaseExponent = baseExponent;
  if (exponent >= -1022) {
    if (mostSignificantBit > 52u) {
      let shift = mostSignificantBit - 52u;
      roundedMagnitude = fp64_round_shift_right(magnitude, shift);
      roundedBaseExponent = baseExponent + i32(shift);
    }
  } else {
    let shift = -1074 - baseExponent;
    if (shift > 0) {
      roundedMagnitude = fp64_round_shift_right(magnitude, u32(shift));
      roundedBaseExponent = -1074;
    }
  }

  if (fp64_u64_is_zero(roundedMagnitude)) {
    return vec2u(0u);
  }
  return fp64_split_raw_accumulator_bits(sign, roundedMagnitude, roundedBaseExponent);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_add_raw_f32_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_raw_f32_bits(aBits);
  let b = fp64_decode_raw_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = abs(a.baseExponent - b.baseExponent);
  if (exponentDifference > 25) {
    if (fp64_raw_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_raw_accumulator_bits(
    resultSign,
    resultMagnitude,
    commonBaseExponent
  );
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_add_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_sub_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_add_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

fn fp64_sub_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

// Subtract two raw binary64 values and round the exact result once to f32.
// The input words are canonical high/low words: .x contains sign/exponent/high
// fraction bits, and .y contains the low 32 fraction bits.
fn sub_fp64u32_to_f32_bits(aBits: vec2u, bBits: vec2u) -> u32 {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return 0x7fc00000u;
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return (a.sign << 31u) | 0x7f800000u;
    }
    return 0x7fc00000u;
  }
  if (a.isInf) {
    return (a.sign << 31u) | 0x7f800000u;
  }
  if (b.isInf) {
    return (bSubtractionSign << 31u) | 0x7f800000u;
  }
  if (a.isZero && b.isZero) {
    return select(0u, 0x80000000u, a.sign == 1u && b.sign == 0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return 0u;
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_f32_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_f32_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_f32(aBits: vec2u, bBits: vec2u) -> f32 {
  return bitcast<f32>(sub_fp64u32_to_f32_bits(aBits, bBits));
}

// Subtract two raw binary64 values, round once to binary64, then split the
// result into normalized f32 limbs. Finite results must fit within the f32
// exponent range; larger magnitudes map to infinity and smaller magnitudes
// map to zero. The input words use canonical high/low word order.
fn sub_fp64u32_to_fp64_bits(aBits: vec2u, bBits: vec2u) -> vec2u {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
    }
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf) {
    return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
  }
  if (b.isInf) {
    return vec2u((bSubtractionSign << 31u) | 0x7f800000u, 0u);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return vec2u(0u);
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_fp64_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_fp64(aBits: vec2u, bBits: vec2u) -> vec2f {
  let resultBits = sub_fp64u32_to_fp64_bits(aBits, bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_runtime_zero() -> f32 {
  return fp64arithmetic.ONE * 0.0;
}

fn prevent_fp64_optimization(value: f32) -> f32 {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  return value + fp64_runtime_zero();
#else
  return value;
#endif
}
#endif

#ifdef LUMA_FP64_INTEGER_ARITHMETIC
${s}
#else
fn split(a: f32) -> vec2f {
  let splitValue = prevent_fp64_optimization(fp64arithmetic.SPLIT + fp64_runtime_zero());
  let t = prevent_fp64_optimization(a * splitValue);
  let temp = prevent_fp64_optimization(t - a);
  let aHi = prevent_fp64_optimization(t - temp);
  let aLo = prevent_fp64_optimization(a - aHi);
  return vec2f(aHi, aLo);
}

fn split2(a: vec2f) -> vec2f {
  var b = split(a.x);
  b.y = b.y + a.y;
  return b;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let sum = prevent_fp64_optimization((a + b) * fp64arithmetic.ONE);
  let err = prevent_fp64_optimization(b - (sum - a) * fp64arithmetic.ONE);
#else
  let sum = prevent_fp64_optimization(a + b);
  let err = prevent_fp64_optimization(b - (sum - a));
#endif
  return vec2f(sum, err);
}

fn twoSum(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a + b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) +
    prevent_fp64_optimization(b - v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) + prevent_fp64_optimization(b - v);
#endif
  return vec2f(s, err);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a - b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) -
    prevent_fp64_optimization(b + v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) - prevent_fp64_optimization(b + v);
#endif
  return vec2f(s, err);
}

fn twoSqr(a: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * a);
  let aFp64 = split(a);
  let highProduct = prevent_fp64_optimization(aFp64.x * aFp64.x);
  let crossProduct = prevent_fp64_optimization(2.0 * aFp64.x * aFp64.y);
  let lowProduct = prevent_fp64_optimization(aFp64.y * aFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err =
    (prevent_fp64_optimization(highProduct - prod) * fp64arithmetic.ONE +
      crossProduct * fp64arithmetic.ONE * fp64arithmetic.ONE) +
    lowProduct * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
#else
  let err = ((prevent_fp64_optimization(highProduct - prod) + crossProduct) + lowProduct);
#endif
  return vec2f(prod, err);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * b);
  let aFp64 = split(a);
  let bFp64 = split(b);
  let highProduct = prevent_fp64_optimization(aFp64.x * bFp64.x);
  let crossProduct1 = prevent_fp64_optimization(aFp64.x * bFp64.y);
  let crossProduct2 = prevent_fp64_optimization(aFp64.y * bFp64.x);
  let lowProduct = prevent_fp64_optimization(aFp64.y * bFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err1 = (highProduct - prod) * fp64arithmetic.ONE;
  let err2 = crossProduct1 * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err3 = crossProduct2 * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err4 =
    lowProduct *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE;
#else
  let err1 = highProduct - prod;
  let err2 = crossProduct1;
  let err3 = crossProduct2;
  let err4 = lowProduct;
#endif
  let err12InputA = prevent_fp64_optimization(err1);
  let err12InputB = prevent_fp64_optimization(err2);
  let err12 = prevent_fp64_optimization(err12InputA + err12InputB);
  let err123InputA = prevent_fp64_optimization(err12);
  let err123InputB = prevent_fp64_optimization(err3);
  let err123 = prevent_fp64_optimization(err123InputA + err123InputB);
  let err1234InputA = prevent_fp64_optimization(err123);
  let err1234InputB = prevent_fp64_optimization(err4);
  let err = prevent_fp64_optimization(err1234InputA + err1234InputB);
  return vec2f(prod, err);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSum(a.x, b.x);
  let t = twoSum(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSub(a.x, b.x);
  let t = twoSub(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var prod = twoProd(a.x, b.x);
  let crossProduct1 = prevent_fp64_optimization(a.x * b.y);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct1);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  let crossProduct2 = prevent_fp64_optimization(a.y * b.x);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct2);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let xn = prevent_fp64_optimization(1.0 / b.x);
  let yn = mul_fp64(a, vec2f(xn, fp64_runtime_zero()));
  let diff = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, yn)).x);
  let prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let x = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let yn = prevent_fp64_optimization(a.x * x);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let ynSqr = twoSqr(yn) * fp64arithmetic.ONE;
#else
  let ynSqr = twoSqr(yn);
#endif
  let diff = prevent_fp64_optimization(sub_fp64(a, ynSqr).x);
  let prod = twoProd(prevent_fp64_optimization(x * 0.5), diff);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2f(yn, 0.0), prod);
#endif
}
#endif
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_bits_is_nan(bits: u32) -> bool {
  return (bits & 0x7fffffffu) > 0x7f800000u;
}

fn fp64_f32_bits_is_inf(bits: u32) -> bool {
  return (bits & 0x7fffffffu) == 0x7f800000u;
}

fn fp64_compare_f32_bits(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == 0u && bMagnitude == 0u) {
    return 0;
  }
  let aSign = aBits >> 31u;
  let bSign = bBits >> 31u;
  if (aSign != bSign) {
    return select(1, -1, aSign == 1u);
  }
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  let magnitudeComparison = select(-1, 1, aMagnitude > bMagnitude);
  return select(magnitudeComparison, -magnitudeComparison, aSign == 1u);
}

// Normalize an arbitrary pair of finite f32 limbs with integer accumulation.
// This is independent of LUMA_FP64_INTEGER_ARITHMETIC and canonicalizes every
// representation of zero to vec2f(+0.0, +0.0).
fn normalize_fp64(value: vec2f) -> vec2f {
  let resultBits = fp64_add_raw_f32_bits(bitcast<u32>(value.x), bitcast<u32>(value.y));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn is_nan_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  return fp64_f32_bits_is_nan(bitcast<u32>(normalized.x)) ||
    fp64_f32_bits_is_nan(bitcast<u32>(normalized.y));
}

fn is_finite_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  return !fp64_f32_bits_is_nan(highBits) && !fp64_f32_bits_is_nan(lowBits) &&
    !fp64_f32_bits_is_inf(highBits) && !fp64_f32_bits_is_inf(lowBits);
}

// Returns -1, 0, or 1. NaN is unordered and returns 0; call is_nan_fp64 or
// is_finite_fp64 first when 0 must mean a finite zero.
fn sign_fp64(value: vec2f) -> i32 {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  if (fp64_f32_bits_is_nan(highBits) || fp64_f32_bits_is_nan(lowBits)) {
    return 0;
  }
  if ((highBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (highBits >> 31u) == 1u);
  }
  if ((lowBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (lowBits >> 31u) == 1u);
  }
  return 0;
}

// Compares double-single values and returns -1, 0, or 1. NaN is unordered
// and returns 0; callers that require equality semantics must first check
// is_nan_fp64 or is_finite_fp64.
fn compare_fp64(a: vec2f, b: vec2f) -> i32 {
  let normalizedA = normalize_fp64(a);
  let normalizedB = normalize_fp64(b);
  let aHighBits = bitcast<u32>(normalizedA.x);
  let aLowBits = bitcast<u32>(normalizedA.y);
  let bHighBits = bitcast<u32>(normalizedB.x);
  let bLowBits = bitcast<u32>(normalizedB.y);
  if (fp64_f32_bits_is_nan(aHighBits) || fp64_f32_bits_is_nan(aLowBits) ||
      fp64_f32_bits_is_nan(bHighBits) || fp64_f32_bits_is_nan(bLowBits)) {
    return 0;
  }
  let highComparison = fp64_compare_f32_bits(aHighBits, bHighBits);
  if (highComparison != 0) {
    return highComparison;
  }
  return fp64_compare_f32_bits(aLowBits, bLowBits);
}
#endif
`,fs:n,vs:n,defaultUniforms:{ONE:1,SPLIT:4097},uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:r,fp64LowPart:function(e){return e-Math.fround(e)},fp64ifyMatrix4:function(e){let t=new Float32Array(32);for(let i=0;i<4;++i)for(let n=0;n<4;++n){let s=4*i+n;r(e[4*n+i],t,2*s)}return t}}},19885(e,t,i){i.d(t,{a:()=>n});var r=i(26489);class n extends Array{clone(){return new this.constructor().copy(this)}fromArray(e,t=0){for(let i=0;i<this.ELEMENTS;++i)this[i]=e[i+t];return this.check()}toArray(e=[],t=0){for(let i=0;i<this.ELEMENTS;++i)e[t+i]=this[i];return e}toObject(e){return e}from(e){return Array.isArray(e)?this.copy(e):this.fromObject(e)}to(e){return e===this?this:(0,r.cy)(e)?this.toArray(e):this.toObject(e)}toTarget(e){return e?this.to(e):this}toFloat32Array(){return new Float32Array(this)}toString(){return this.formatString(r.$W)}formatString(e){let t="";for(let i=0;i<this.ELEMENTS;++i)t+=(i>0?", ":"")+(0,r.Fl)(this[i],e);return`${e.printTypes?this.constructor.name:""}[${t}]`}equals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(!(0,r.aI)(this[t],e[t]))return!1;return!0}exactEquals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(this[t]!==e[t])return!1;return!0}negate(){for(let e=0;e<this.ELEMENTS;++e)this[e]=-this[e];return this.check()}lerp(e,t,i){if(void 0===i)return this.lerp(this,e,t);for(let r=0;r<this.ELEMENTS;++r){let n=e[r],s="number"==typeof t?t:t[r];this[r]=n+i*(s-n)}return this.check()}min(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.min(e[t],this[t]);return this.check()}max(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.max(e[t],this[t]);return this.check()}clamp(e,t){for(let i=0;i<this.ELEMENTS;++i)this[i]=Math.min(Math.max(this[i],e[i]),t[i]);return this.check()}add(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]+=t[e];return this.check()}subtract(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]-=t[e];return this.check()}scale(e){if("number"==typeof e)for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;else for(let t=0;t<this.ELEMENTS&&t<e.length;++t)this[t]*=e[t];return this.check()}multiplyByScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;return this.check()}check(){if(r.$W.debug&&!this.validate())throw Error(`math.gl: ${this.constructor.name} some fields set to invalid numbers'`);return this}validate(){let e=this.length===this.ELEMENTS;for(let t=0;t<this.ELEMENTS;++t)e=e&&Number.isFinite(this[t]);return e}sub(e){return this.subtract(e)}setScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=e;return this.check()}addScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]+=e;return this.check()}subScalar(e){return this.addScalar(-e)}multiplyScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;return this.check()}divideScalar(e){return this.multiplyByScalar(1/e)}clampScalar(e,t){for(let i=0;i<this.ELEMENTS;++i)this[i]=Math.min(Math.max(this[i],e),t);return this.check()}get elements(){return this}}},40882(e,t,i){i.d(t,{u:()=>a});var r=i(19885),n=i(93383),s=i(26489);class a extends r.a{toString(){let e="[";if(s.$W.printRowMajor){e+="row-major:";for(let t=0;t<this.RANK;++t)for(let i=0;i<this.RANK;++i)e+=` ${this[i*this.RANK+t]}`}else{e+="column-major:";for(let t=0;t<this.ELEMENTS;++t)e+=` ${this[t]}`}return e+"]"}getElementIndex(e,t){return t*this.RANK+e}getElement(e,t){return this[t*this.RANK+e]}setElement(e,t,i){return this[t*this.RANK+e]=(0,n.ws)(i),this}getColumn(e,t=Array(this.RANK).fill(-0)){let i=e*this.RANK;for(let e=0;e<this.RANK;++e)t[e]=this[i+e];return t}setColumn(e,t){let i=e*this.RANK;for(let e=0;e<this.RANK;++e)this[i+e]=t[e];return this}}},17484(e,t,i){i.d(t,{M:()=>a});var r=i(19885),n=i(93383),s=i(77562);class a extends r.a{get x(){return this[0]}set x(e){this[0]=(0,n.ws)(e)}get y(){return this[1]}set y(e){this[1]=(0,n.ws)(e)}len(){return Math.sqrt(this.lengthSquared())}magnitude(){return this.len()}lengthSquared(){let e=0;for(let t=0;t<this.ELEMENTS;++t)e+=this[t]*this[t];return e}magnitudeSquared(){return this.lengthSquared()}distance(e){return Math.sqrt(this.distanceSquared(e))}distanceSquared(e){let t=0;for(let i=0;i<this.ELEMENTS;++i){let r=this[i]-e[i];t+=r*r}return(0,n.ws)(t)}dot(e){let t=0;for(let i=0;i<this.ELEMENTS;++i)t+=this[i]*e[i];return(0,n.ws)(t)}normalize(){let e=this.magnitude();if(0!==e)for(let t=0;t<this.ELEMENTS;++t)this[t]/=e;return this.check()}multiply(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]*=t[e];return this.check()}divide(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]/=t[e];return this.check()}lengthSq(){return this.lengthSquared()}distanceTo(e){return this.distance(e)}distanceToSquared(e){return this.distanceSquared(e)}getComponent(e){return(0,s.v)(e>=0&&e<this.ELEMENTS,"index is out of range"),(0,n.ws)(this[e])}setComponent(e,t){return(0,s.v)(e>=0&&e<this.ELEMENTS,"index is out of range"),this[e]=t,this.check()}addVectors(e,t){return this.copy(e).add(t)}subVectors(e,t){return this.copy(e).subtract(t)}multiplyVectors(e,t){return this.copy(e).multiply(t)}addScaledVector(e,t){return this.add(new this.constructor(e).multiplyScalar(t))}}},6706(e,t,i){let r,n;i.d(t,{k:()=>m});var s,a,o=i(40882),u=i(93383),l=i(62541),f=i(32686),h=i(59808),c=i(49527),d=i(74646);(s=a||(a={}))[s.COL0ROW0=0]="COL0ROW0",s[s.COL0ROW1=1]="COL0ROW1",s[s.COL0ROW2=2]="COL0ROW2",s[s.COL0ROW3=3]="COL0ROW3",s[s.COL1ROW0=4]="COL1ROW0",s[s.COL1ROW1=5]="COL1ROW1",s[s.COL1ROW2=6]="COL1ROW2",s[s.COL1ROW3=7]="COL1ROW3",s[s.COL2ROW0=8]="COL2ROW0",s[s.COL2ROW1=9]="COL2ROW1",s[s.COL2ROW2=10]="COL2ROW2",s[s.COL2ROW3=11]="COL2ROW3",s[s.COL3ROW0=12]="COL3ROW0",s[s.COL3ROW1=13]="COL3ROW1",s[s.COL3ROW2=14]="COL3ROW2",s[s.COL3ROW3=15]="COL3ROW3";let p=45*Math.PI/180,g=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);class m extends o.u{static get IDENTITY(){return n||Object.freeze(n=new m),n}static get ZERO(){return r||Object.freeze(r=new m([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])),r}get ELEMENTS(){return 16}get RANK(){return 4}get INDICES(){return a}constructor(e){super(-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0),1==arguments.length&&Array.isArray(e)?this.copy(e):this.identity()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this[4]=e[4],this[5]=e[5],this[6]=e[6],this[7]=e[7],this[8]=e[8],this[9]=e[9],this[10]=e[10],this[11]=e[11],this[12]=e[12],this[13]=e[13],this[14]=e[14],this[15]=e[15],this.check()}set(e,t,i,r,n,s,a,o,u,l,f,h,c,d,p,g){return this[0]=e,this[1]=t,this[2]=i,this[3]=r,this[4]=n,this[5]=s,this[6]=a,this[7]=o,this[8]=u,this[9]=l,this[10]=f,this[11]=h,this[12]=c,this[13]=d,this[14]=p,this[15]=g,this.check()}setRowMajor(e,t,i,r,n,s,a,o,u,l,f,h,c,d,p,g){return this[0]=e,this[1]=n,this[2]=u,this[3]=c,this[4]=t,this[5]=s,this[6]=l,this[7]=d,this[8]=i,this[9]=a,this[10]=f,this[11]=p,this[12]=r,this[13]=o,this[14]=h,this[15]=g,this.check()}toRowMajor(e){return e[0]=this[0],e[1]=this[4],e[2]=this[8],e[3]=this[12],e[4]=this[1],e[5]=this[5],e[6]=this[9],e[7]=this[13],e[8]=this[2],e[9]=this[6],e[10]=this[10],e[11]=this[14],e[12]=this[3],e[13]=this[7],e[14]=this[11],e[15]=this[15],e}identity(){return this.copy(g)}fromObject(e){return this.check()}fromQuaternion(e){return(0,f.I0)(this,e),this.check()}frustum(e){var t,i,r,n,s,a;let{left:o,right:u,bottom:l,top:h,near:c=.1,far:d=500}=e;return d===1/0?(t=this,i=o,r=u,n=l,s=h,a=c,t[0]=2*a/(r-i),t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*a/(s-n),t[6]=0,t[7]=0,t[8]=(r+i)/(r-i),t[9]=(s+n)/(s-n),t[10]=-1,t[11]=-1,t[12]=0,t[13]=0,t[14]=-2*a,t[15]=0):(0,f.$h)(this,o,u,l,h,c,d),this.check()}lookAt(e){let{eye:t,center:i=[0,0,0],up:r=[0,1,0]}=e;return(0,f.t5)(this,t,i,r),this.check()}ortho(e){let{left:t,right:i,bottom:r,top:n,near:s=.1,far:a=500}=e;return(0,f.v3)(this,t,i,r,n,s,a),this.check()}orthographic(e){let{fovy:t=p,aspect:i=1,focalDistance:r=1,near:n=.1,far:s=500}=e;b(t);let a=r*Math.tan(t/2),o=a*i;return this.ortho({left:-o,right:o,bottom:-a,top:a,near:n,far:s})}perspective(e){let{fovy:t=45*Math.PI/180,aspect:i=1,near:r=.1,far:n=500}=e;return b(t),(0,f.fN)(this,t,i,r,n),this.check()}determinant(){return(0,f.a4)(this)}getScale(e=[-0,-0,-0]){return e[0]=Math.sqrt(this[0]*this[0]+this[1]*this[1]+this[2]*this[2]),e[1]=Math.sqrt(this[4]*this[4]+this[5]*this[5]+this[6]*this[6]),e[2]=Math.sqrt(this[8]*this[8]+this[9]*this[9]+this[10]*this[10]),e}getTranslation(e=[-0,-0,-0]){return e[0]=this[12],e[1]=this[13],e[2]=this[14],e}getRotation(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];let i=this.getScale(t),r=1/i[0],n=1/i[1],s=1/i[2];return e[0]=this[0]*r,e[1]=this[1]*n,e[2]=this[2]*s,e[3]=0,e[4]=this[4]*r,e[5]=this[5]*n,e[6]=this[6]*s,e[7]=0,e[8]=this[8]*r,e[9]=this[9]*n,e[10]=this[10]*s,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}getRotationMatrix3(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];let i=this.getScale(t),r=1/i[0],n=1/i[1],s=1/i[2];return e[0]=this[0]*r,e[1]=this[1]*n,e[2]=this[2]*s,e[3]=this[4]*r,e[4]=this[5]*n,e[5]=this[6]*s,e[6]=this[8]*r,e[7]=this[9]*n,e[8]=this[10]*s,e}transpose(){return(0,f.mg)(this,this),this.check()}invert(){return(0,f.B8)(this,this),this.check()}multiplyLeft(e){return(0,f.lw)(this,e,this),this.check()}multiplyRight(e){return(0,f.lw)(this,this,e),this.check()}rotateX(e){return(0,f.eL)(this,this,e),this.check()}rotateY(e){return(0,f.Z8)(this,this,e),this.check()}rotateZ(e){return(0,f.Qr)(this,this,e),this.check()}rotateXYZ(e){return this.rotateX(e[0]).rotateY(e[1]).rotateZ(e[2])}rotateAxis(e,t){return(0,f.e$)(this,this,e,t),this.check()}scale(e){return(0,f.hs)(this,this,Array.isArray(e)?e:[e,e,e]),this.check()}translate(e){return(0,f.Tl)(this,this,e),this.check()}transform(e,t){return 4===e.length?(t=(0,d.Z0)(t||[-0,-0,-0,-0],e,this),(0,u.qk)(t,4),t):this.transformAsPoint(e,t)}transformAsPoint(e,t){let i,{length:r}=e;switch(r){case 2:i=(0,h.Z0)(t||[-0,-0],e,this);break;case 3:i=(0,c.Z0)(t||[-0,-0,-0],e,this);break;default:throw Error("Illegal vector")}return(0,u.qk)(i,e.length),i}transformAsVector(e,t){let i;switch(e.length){case 2:i=(0,l.B$)(t||[-0,-0],e,this);break;case 3:i=(0,l.cL)(t||[-0,-0,-0],e,this);break;default:throw Error("Illegal vector")}return(0,u.qk)(i,e.length),i}transformPoint(e,t){return this.transformAsPoint(e,t)}transformVector(e,t){return this.transformAsPoint(e,t)}transformDirection(e,t){return this.transformAsVector(e,t)}makeRotationX(e){return this.identity().rotateX(e)}makeTranslation(e,t,i){return this.identity().translate([e,t,i])}}function b(e){if(e>2*Math.PI)throw Error("expected radians")}},35097(e,t,i){let r;i.d(t,{P:()=>f});var n=i(17484),s=i(26489),a=i(93383),o=i(49527),u=i(62541);let l=[0,0,0];class f extends n.M{static get ZERO(){return r||Object.freeze(r=new f(0,0,0)),r}constructor(e=0,t=0,i=0){super(-0,-0,-0),1==arguments.length&&(0,s.cy)(e)?this.copy(e):(s.$W.debug&&((0,a.ws)(e),(0,a.ws)(t),(0,a.ws)(i)),this[0]=e,this[1]=t,this[2]=i)}set(e,t,i){return this[0]=e,this[1]=t,this[2]=i,this.check()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this.check()}fromObject(e){return s.$W.debug&&((0,a.ws)(e.x),(0,a.ws)(e.y),(0,a.ws)(e.z)),this[0]=e.x,this[1]=e.y,this[2]=e.z,this.check()}toObject(e){return e.x=this[0],e.y=this[1],e.z=this[2],e}get ELEMENTS(){return 3}get z(){return this[2]}set z(e){this[2]=(0,a.ws)(e)}angle(e){return(0,o.g7)(this,e)}cross(e){return(0,o.$A)(this,this,e),this.check()}rotateX({radians:e,origin:t=l}){return(0,o.eL)(this,this,t,e),this.check()}rotateY({radians:e,origin:t=l}){return(0,o.Z8)(this,this,t,e),this.check()}rotateZ({radians:e,origin:t=l}){return(0,o.x6)(this,this,t,e),this.check()}transform(e){return this.transformAsPoint(e)}transformAsPoint(e){return(0,o.Z0)(this,this,e),this.check()}transformAsVector(e){return(0,u.cL)(this,this,e),this.check()}transformByMatrix3(e){return(0,o.ei)(this,this,e),this.check()}transformByMatrix2(e){return(0,u.J4)(this,this,e),this.check()}transformByQuaternion(e){return(0,o.gL)(this,this,e),this.check()}}},69897(e,t,i){i.d(t,{p8:()=>r,tb:()=>n});let r=1e-6,n="u">typeof Float32Array?Float32Array:Array},32686(e,t,i){i.d(t,{$h:()=>m,B8:()=>s,I0:()=>g,IL:()=>p,Qr:()=>d,Tl:()=>u,Z8:()=>c,a4:()=>a,e$:()=>f,eL:()=>h,fN:()=>b,hs:()=>l,lw:()=>o,mg:()=>n,t5:()=>y,v3:()=>_});var r=i(69897);function n(e,t){if(e===t){let i=t[1],r=t[2],n=t[3],s=t[6],a=t[7],o=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=i,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=s,e[11]=t[14],e[12]=n,e[13]=a,e[14]=o}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e}function s(e,t){let i=t[0],r=t[1],n=t[2],s=t[3],a=t[4],o=t[5],u=t[6],l=t[7],f=t[8],h=t[9],c=t[10],d=t[11],p=t[12],g=t[13],m=t[14],b=t[15],_=i*o-r*a,y=i*u-n*a,v=i*l-s*a,w=r*u-n*o,E=r*l-s*o,x=n*l-s*u,S=f*g-h*p,A=f*m-c*p,L=f*b-d*p,B=h*m-c*g,T=h*b-d*g,P=c*b-d*m,$=_*P-y*T+v*B+w*L-E*A+x*S;return $?($=1/$,e[0]=(o*P-u*T+l*B)*$,e[1]=(n*T-r*P-s*B)*$,e[2]=(g*x-m*E+b*w)*$,e[3]=(c*E-h*x-d*w)*$,e[4]=(u*L-a*P-l*A)*$,e[5]=(i*P-n*L+s*A)*$,e[6]=(m*v-p*x-b*y)*$,e[7]=(f*x-c*v+d*y)*$,e[8]=(a*T-o*L+l*S)*$,e[9]=(r*L-i*T-s*S)*$,e[10]=(p*E-g*v+b*_)*$,e[11]=(h*v-f*E-d*_)*$,e[12]=(o*A-a*B-u*S)*$,e[13]=(i*B-r*A+n*S)*$,e[14]=(g*y-p*w-m*_)*$,e[15]=(f*w-h*y+c*_)*$,e):null}function a(e){let t=e[0],i=e[1],r=e[2],n=e[3],s=e[4],a=e[5],o=e[6],u=e[7],l=e[8],f=e[9],h=e[10],c=e[11],d=e[12],p=e[13],g=e[14],m=e[15],b=t*a-i*s,_=t*o-r*s,y=i*o-r*a,v=l*p-f*d,w=l*g-h*d,E=f*g-h*p;return u*(t*E-i*w+r*v)-n*(s*E-a*w+o*v)+m*(l*y-f*_+h*b)-c*(d*y-p*_+g*b)}function o(e,t,i){let r=t[0],n=t[1],s=t[2],a=t[3],o=t[4],u=t[5],l=t[6],f=t[7],h=t[8],c=t[9],d=t[10],p=t[11],g=t[12],m=t[13],b=t[14],_=t[15],y=i[0],v=i[1],w=i[2],E=i[3];return e[0]=y*r+v*o+w*h+E*g,e[1]=y*n+v*u+w*c+E*m,e[2]=y*s+v*l+w*d+E*b,e[3]=y*a+v*f+w*p+E*_,y=i[4],v=i[5],w=i[6],E=i[7],e[4]=y*r+v*o+w*h+E*g,e[5]=y*n+v*u+w*c+E*m,e[6]=y*s+v*l+w*d+E*b,e[7]=y*a+v*f+w*p+E*_,y=i[8],v=i[9],w=i[10],E=i[11],e[8]=y*r+v*o+w*h+E*g,e[9]=y*n+v*u+w*c+E*m,e[10]=y*s+v*l+w*d+E*b,e[11]=y*a+v*f+w*p+E*_,y=i[12],v=i[13],w=i[14],E=i[15],e[12]=y*r+v*o+w*h+E*g,e[13]=y*n+v*u+w*c+E*m,e[14]=y*s+v*l+w*d+E*b,e[15]=y*a+v*f+w*p+E*_,e}function u(e,t,i){let r,n,s,a,o,u,l,f,h,c,d,p,g=i[0],m=i[1],b=i[2];return t===e?(e[12]=t[0]*g+t[4]*m+t[8]*b+t[12],e[13]=t[1]*g+t[5]*m+t[9]*b+t[13],e[14]=t[2]*g+t[6]*m+t[10]*b+t[14],e[15]=t[3]*g+t[7]*m+t[11]*b+t[15]):(r=t[0],n=t[1],s=t[2],a=t[3],o=t[4],u=t[5],l=t[6],f=t[7],h=t[8],c=t[9],d=t[10],p=t[11],e[0]=r,e[1]=n,e[2]=s,e[3]=a,e[4]=o,e[5]=u,e[6]=l,e[7]=f,e[8]=h,e[9]=c,e[10]=d,e[11]=p,e[12]=r*g+o*m+h*b+t[12],e[13]=n*g+u*m+c*b+t[13],e[14]=s*g+l*m+d*b+t[14],e[15]=a*g+f*m+p*b+t[15]),e}function l(e,t,i){let r=i[0],n=i[1],s=i[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*n,e[5]=t[5]*n,e[6]=t[6]*n,e[7]=t[7]*n,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function f(e,t,i,n){let s,a,o,u,l,f,h,c,d,p,g,m,b,_,y,v,w,E,x,S,A,L,B,T,P=n[0],$=n[1],M=n[2],O=Math.sqrt(P*P+$*$+M*M);return O<r.p8?null:(P*=O=1/O,$*=O,M*=O,a=Math.sin(i),o=1-(s=Math.cos(i)),u=t[0],l=t[1],f=t[2],h=t[3],c=t[4],d=t[5],p=t[6],g=t[7],m=t[8],b=t[9],_=t[10],y=t[11],v=P*P*o+s,w=$*P*o+M*a,E=M*P*o-$*a,x=P*$*o-M*a,S=$*$*o+s,A=M*$*o+P*a,L=P*M*o+$*a,B=$*M*o-P*a,T=M*M*o+s,e[0]=u*v+c*w+m*E,e[1]=l*v+d*w+b*E,e[2]=f*v+p*w+_*E,e[3]=h*v+g*w+y*E,e[4]=u*x+c*S+m*A,e[5]=l*x+d*S+b*A,e[6]=f*x+p*S+_*A,e[7]=h*x+g*S+y*A,e[8]=u*L+c*B+m*T,e[9]=l*L+d*B+b*T,e[10]=f*L+p*B+_*T,e[11]=h*L+g*B+y*T,t!==e&&(e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e)}function h(e,t,i){let r=Math.sin(i),n=Math.cos(i),s=t[4],a=t[5],o=t[6],u=t[7],l=t[8],f=t[9],h=t[10],c=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*n+l*r,e[5]=a*n+f*r,e[6]=o*n+h*r,e[7]=u*n+c*r,e[8]=l*n-s*r,e[9]=f*n-a*r,e[10]=h*n-o*r,e[11]=c*n-u*r,e}function c(e,t,i){let r=Math.sin(i),n=Math.cos(i),s=t[0],a=t[1],o=t[2],u=t[3],l=t[8],f=t[9],h=t[10],c=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*n-l*r,e[1]=a*n-f*r,e[2]=o*n-h*r,e[3]=u*n-c*r,e[8]=s*r+l*n,e[9]=a*r+f*n,e[10]=o*r+h*n,e[11]=u*r+c*n,e}function d(e,t,i){let r=Math.sin(i),n=Math.cos(i),s=t[0],a=t[1],o=t[2],u=t[3],l=t[4],f=t[5],h=t[6],c=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*n+l*r,e[1]=a*n+f*r,e[2]=o*n+h*r,e[3]=u*n+c*r,e[4]=l*n-s*r,e[5]=f*n-a*r,e[6]=h*n-o*r,e[7]=c*n-u*r,e}function p(e,t){let i=t[0],r=t[1],n=t[2],s=t[4],a=t[5],o=t[6],u=t[8],l=t[9],f=t[10];return e[0]=Math.sqrt(i*i+r*r+n*n),e[1]=Math.sqrt(s*s+a*a+o*o),e[2]=Math.sqrt(u*u+l*l+f*f),e}function g(e,t){let i=t[0],r=t[1],n=t[2],s=t[3],a=i+i,o=r+r,u=n+n,l=i*a,f=r*a,h=r*o,c=n*a,d=n*o,p=n*u,g=s*a,m=s*o,b=s*u;return e[0]=1-h-p,e[1]=f+b,e[2]=c-m,e[3]=0,e[4]=f-b,e[5]=1-l-p,e[6]=d+g,e[7]=0,e[8]=c+m,e[9]=d-g,e[10]=1-l-h,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function m(e,t,i,r,n,s,a){let o=1/(i-t),u=1/(n-r),l=1/(s-a);return e[0]=2*s*o,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=2*s*u,e[6]=0,e[7]=0,e[8]=(i+t)*o,e[9]=(n+r)*u,e[10]=(a+s)*l,e[11]=-1,e[12]=0,e[13]=0,e[14]=a*s*2*l,e[15]=0,e}let b=function(e,t,i,r,n){let s=1/Math.tan(t/2);if(e[0]=s/i,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,null!=n&&n!==1/0){let t=1/(r-n);e[10]=(n+r)*t,e[14]=2*n*r*t}else e[10]=-1,e[14]=-2*r;return e},_=function(e,t,i,r,n,s,a){let o=1/(t-i),u=1/(r-n),l=1/(s-a);return e[0]=-2*o,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*u,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*l,e[11]=0,e[12]=(t+i)*o,e[13]=(n+r)*u,e[14]=(a+s)*l,e[15]=1,e};function y(e,t,i,n){let s,a,o,u,l,f,h,c,d,p,g=t[0],m=t[1],b=t[2],_=n[0],y=n[1],v=n[2],w=i[0],E=i[1],x=i[2];if(Math.abs(g-w)<r.p8&&Math.abs(m-E)<r.p8&&Math.abs(b-x)<r.p8)return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e;return s=1/Math.sqrt((c=g-w)*c+(d=m-E)*d+(p=b-x)*p),c*=s,d*=s,p*=s,(s=Math.sqrt((a=y*p-v*d)*a+(o=v*c-_*p)*o+(u=_*d-y*c)*u))?(a*=s=1/s,o*=s,u*=s):(a=0,o=0,u=0),(s=Math.sqrt((l=d*u-p*o)*l+(f=p*a-c*u)*f+(h=c*o-d*a)*h))?(l*=s=1/s,f*=s,h*=s):(l=0,f=0,h=0),e[0]=a,e[1]=l,e[2]=c,e[3]=0,e[4]=o,e[5]=f,e[6]=d,e[7]=0,e[8]=u,e[9]=h,e[10]=p,e[11]=0,e[12]=-(a*g+o*m+u*b),e[13]=-(l*g+f*m+h*b),e[14]=-(c*g+d*m+p*b),e[15]=1,e}},59808(e,t,i){let r;i.d(t,{Bw:()=>o,Cc:()=>l,WQ:()=>s,Z0:()=>d,ZF:()=>f,ei:()=>c,hs:()=>a,jb:()=>p,l0:()=>h,ze:()=>u});var n=i(69897);function s(e,t,i){return e[0]=t[0]+i[0],e[1]=t[1]+i[1],e}function a(e,t,i){return e[0]=t[0]*i,e[1]=t[1]*i,e}function o(e){let t=e[0],i=e[1];return Math.sqrt(t*t+i*i)}function u(e,t){return e[0]=-t[0],e[1]=-t[1],e}function l(e,t,i,r){let n=t[0],s=t[1];return e[0]=n+r*(i[0]-n),e[1]=s+r*(i[1]-s),e}function f(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[2]*n,e[1]=i[1]*r+i[3]*n,e}function h(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[2]*n+i[4],e[1]=i[1]*r+i[3]*n+i[5],e}function c(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[3]*n+i[6],e[1]=i[1]*r+i[4]*n+i[7],e}function d(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[4]*n+i[12],e[1]=i[1]*r+i[5]*n+i[13],e}let p=function(e,t,i){return e[0]=t[0]-i[0],e[1]=t[1]-i[1],e};r=new n.tb(2),n.tb!=Float32Array&&(r[0]=0,r[1]=0)},49527(e,t,i){i.d(t,{$A:()=>f,Bw:()=>s,Cc:()=>h,Il:()=>v,Om:()=>l,S8:()=>u,Z0:()=>c,Z8:()=>m,eL:()=>g,ei:()=>d,fA:()=>a,g7:()=>_,gL:()=>p,jb:()=>y,uE:()=>w,vt:()=>n,x6:()=>b,ze:()=>o});var r=i(69897);function n(){let e=new r.tb(3);return r.tb!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function s(e){let t=e[0],i=e[1],r=e[2];return Math.sqrt(t*t+i*i+r*r)}function a(e,t,i){let n=new r.tb(3);return n[0]=e,n[1]=t,n[2]=i,n}function o(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e}function u(e,t){let i=t[0],r=t[1],n=t[2],s=i*i+r*r+n*n;return s>0&&(s=1/Math.sqrt(s)),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s,e}function l(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function f(e,t,i){let r=t[0],n=t[1],s=t[2],a=i[0],o=i[1],u=i[2];return e[0]=n*u-s*o,e[1]=s*a-r*u,e[2]=r*o-n*a,e}function h(e,t,i,r){let n=t[0],s=t[1],a=t[2];return e[0]=n+r*(i[0]-n),e[1]=s+r*(i[1]-s),e[2]=a+r*(i[2]-a),e}function c(e,t,i){let r=t[0],n=t[1],s=t[2],a=i[3]*r+i[7]*n+i[11]*s+i[15];return a=a||1,e[0]=(i[0]*r+i[4]*n+i[8]*s+i[12])/a,e[1]=(i[1]*r+i[5]*n+i[9]*s+i[13])/a,e[2]=(i[2]*r+i[6]*n+i[10]*s+i[14])/a,e}function d(e,t,i){let r=t[0],n=t[1],s=t[2];return e[0]=r*i[0]+n*i[3]+s*i[6],e[1]=r*i[1]+n*i[4]+s*i[7],e[2]=r*i[2]+n*i[5]+s*i[8],e}function p(e,t,i){let r=i[0],n=i[1],s=i[2],a=i[3],o=t[0],u=t[1],l=t[2],f=n*l-s*u,h=s*o-r*l,c=r*u-n*o,d=n*c-s*h,p=s*f-r*c,g=r*h-n*f,m=2*a;return f*=m,h*=m,c*=m,d*=2,p*=2,g*=2,e[0]=o+f+d,e[1]=u+h+p,e[2]=l+c+g,e}function g(e,t,i,r){let n=[],s=[];return n[0]=t[0]-i[0],n[1]=t[1]-i[1],n[2]=t[2]-i[2],s[0]=n[0],s[1]=n[1]*Math.cos(r)-n[2]*Math.sin(r),s[2]=n[1]*Math.sin(r)+n[2]*Math.cos(r),e[0]=s[0]+i[0],e[1]=s[1]+i[1],e[2]=s[2]+i[2],e}function m(e,t,i,r){let n=[],s=[];return n[0]=t[0]-i[0],n[1]=t[1]-i[1],n[2]=t[2]-i[2],s[0]=n[2]*Math.sin(r)+n[0]*Math.cos(r),s[1]=n[1],s[2]=n[2]*Math.cos(r)-n[0]*Math.sin(r),e[0]=s[0]+i[0],e[1]=s[1]+i[1],e[2]=s[2]+i[2],e}function b(e,t,i,r){let n=[],s=[];return n[0]=t[0]-i[0],n[1]=t[1]-i[1],n[2]=t[2]-i[2],s[0]=n[0]*Math.cos(r)-n[1]*Math.sin(r),s[1]=n[0]*Math.sin(r)+n[1]*Math.cos(r),s[2]=n[2],e[0]=s[0]+i[0],e[1]=s[1]+i[1],e[2]=s[2]+i[2],e}function _(e,t){let i=e[0],r=e[1],n=e[2],s=t[0],a=t[1],o=t[2],u=Math.sqrt((i*i+r*r+n*n)*(s*s+a*a+o*o));return Math.acos(Math.min(Math.max(u&&l(e,t)/u,-1),1))}let y=function(e,t,i){return e[0]=t[0]-i[0],e[1]=t[1]-i[1],e[2]=t[2]-i[2],e},v=s,w=function(e){let t=e[0],i=e[1],r=e[2];return t*t+i*i+r*r};n()},74646(e,t,i){let r;i.d(t,{Bw:()=>h,C:()=>o,Cc:()=>g,Om:()=>p,S8:()=>d,WQ:()=>l,Z0:()=>m,fA:()=>a,gL:()=>b,hZ:()=>u,hs:()=>f,m3:()=>c,o8:()=>s,t2:()=>_});var n=i(69897);function s(e){let t=new n.tb(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t}function a(e,t,i,r){let s=new n.tb(4);return s[0]=e,s[1]=t,s[2]=i,s[3]=r,s}function o(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}function u(e,t,i,r,n){return e[0]=t,e[1]=i,e[2]=r,e[3]=n,e}function l(e,t,i){return e[0]=t[0]+i[0],e[1]=t[1]+i[1],e[2]=t[2]+i[2],e[3]=t[3]+i[3],e}function f(e,t,i){return e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e[3]=t[3]*i,e}function h(e){let t=e[0],i=e[1],r=e[2],n=e[3];return Math.sqrt(t*t+i*i+r*r+n*n)}function c(e){let t=e[0],i=e[1],r=e[2],n=e[3];return t*t+i*i+r*r+n*n}function d(e,t){let i=t[0],r=t[1],n=t[2],s=t[3],a=i*i+r*r+n*n+s*s;return a>0&&(a=1/Math.sqrt(a)),e[0]=i*a,e[1]=r*a,e[2]=n*a,e[3]=s*a,e}function p(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]}function g(e,t,i,r){let n=t[0],s=t[1],a=t[2],o=t[3];return e[0]=n+r*(i[0]-n),e[1]=s+r*(i[1]-s),e[2]=a+r*(i[2]-a),e[3]=o+r*(i[3]-o),e}function m(e,t,i){let r=t[0],n=t[1],s=t[2],a=t[3];return e[0]=i[0]*r+i[4]*n+i[8]*s+i[12]*a,e[1]=i[1]*r+i[5]*n+i[9]*s+i[13]*a,e[2]=i[2]*r+i[6]*n+i[10]*s+i[14]*a,e[3]=i[3]*r+i[7]*n+i[11]*s+i[15]*a,e}function b(e,t,i){let r=t[0],n=t[1],s=t[2],a=i[0],o=i[1],u=i[2],l=i[3],f=l*r+o*s-u*n,h=l*n+u*r-a*s,c=l*s+a*n-o*r,d=-a*r-o*n-u*s;return e[0]=f*l+-(d*a)+-(h*u)- -(c*o),e[1]=h*l+-(d*o)+-(c*a)- -(f*u),e[2]=c*l+-(d*u)+-(f*o)- -(h*a),e[3]=t[3],e}function _(e,t){return e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]&&e[3]===t[3]}r=new n.tb(4),n.tb!=Float32Array&&(r[0]=0,r[1]=0,r[2]=0,r[3]=0)},77562(e,t,i){i.d(t,{v:()=>r});function r(e,t){if(!e)throw Error(`math.gl assertion ${t}`)}},26489(e,t,i){i.d(t,{$W:()=>s,Cc:()=>function e(t,i,r){return o(t)?t.map((t,n)=>e(t,i[n],r)):r*i+(1-r)*t},F2:()=>f,Fl:()=>a,aI:()=>function e(t,i,r){let n=s.EPSILON;r&&(s.EPSILON=r);try{if(t===i)return!0;if(o(t)&&o(i)){if(t.length!==i.length)return!1;for(let r=0;r<t.length;++r)if(!e(t[r],i[r]))return!1;return!0}if(t&&t.equals)return t.equals(i);if(i&&i.equals)return i.equals(t);if("number"==typeof t&&"number"==typeof i)return Math.abs(t-i)<=s.EPSILON*Math.max(1,Math.abs(t),Math.abs(i));return!1}finally{s.EPSILON=n}},cy:()=>o,eh:()=>u,qE:()=>c,uj:()=>h,xW:()=>l});let r=1/Math.PI*180,n=1/180*Math.PI;globalThis.mathgl=globalThis.mathgl||{config:{EPSILON:1e-12,debug:!1,precision:4,printTypes:!1,printDegrees:!1,printRowMajor:!0,_cartographicRadians:!1}};let s=globalThis.mathgl.config;function a(e,{precision:t=s.precision}={}){return e=Math.round(e/s.EPSILON)*s.EPSILON,`${parseFloat(e.toPrecision(t))}`}function o(e){return Array.isArray(e)||ArrayBuffer.isView(e)&&!(e instanceof DataView)}function u(e){return f(e)}function l(e){return h(e)}function f(e,t){return d(e,e=>e*n,t)}function h(e,t){return d(e,e=>e*r,t)}function c(e,t,i){return d(e,e=>Math.max(t,Math.min(i,e)))}function d(e,t,i){if(o(e)){i=i||(e.clone?e.clone():Array(e.length));for(let r=0;r<i.length&&r<e.length;++r){let n="number"==typeof e?e:e[r];i[r]=t(n,r,i)}return i}return t(e)}},62541(e,t,i){function r(e,t,i){let r=t[0],n=t[1],s=i[3]*r+i[7]*n||1;return e[0]=(i[0]*r+i[4]*n)/s,e[1]=(i[1]*r+i[5]*n)/s,e}function n(e,t,i){let r=t[0],n=t[1],s=t[2],a=i[3]*r+i[7]*n+i[11]*s||1;return e[0]=(i[0]*r+i[4]*n+i[8]*s)/a,e[1]=(i[1]*r+i[5]*n+i[9]*s)/a,e[2]=(i[2]*r+i[6]*n+i[10]*s)/a,e}function s(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[2]*n,e[1]=i[1]*r+i[3]*n,e[2]=t[2],e}function a(e,t,i){let r=t[0],n=t[1];return e[0]=i[0]*r+i[2]*n,e[1]=i[1]*r+i[3]*n,e[2]=t[2],e[3]=t[3],e}function o(e,t,i){let r=t[0],n=t[1],s=t[2];return e[0]=i[0]*r+i[3]*n+i[6]*s,e[1]=i[1]*r+i[4]*n+i[7]*s,e[2]=i[2]*r+i[5]*n+i[8]*s,e[3]=t[3],e}i.d(t,{B$:()=>r,Cg:()=>a,J4:()=>s,cL:()=>n,vE:()=>o})},93383(e,t,i){i.d(t,{qk:()=>s,ws:()=>n});var r=i(26489);function n(e){if(!Number.isFinite(e))throw Error(`Invalid number ${JSON.stringify(e)}`);return e}function s(e,t,i=""){if(r.$W.debug&&!function(e,t){if(e.length!==t)return!1;for(let t=0;t<e.length;++t)if(!Number.isFinite(e[t]))return!1;return!0}(e,t))throw Error(`math.gl: ${i} some fields set to invalid numbers'`);return e}},91334(e,t,i){function r(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function n(e){return r(e)||!!Array.isArray(e)&&(0===e.length||"number"==typeof e[0])}i.d(t,{H9:()=>n,iu:()=>r})},9173(e,t,i){i.d(t,{v:()=>r});function r(e,t){if(!e)throw Error(t||"@math.gl/web-mercator: assertion failed.")}},20556(e,t,i){i.d(t,{F:()=>a});var r=i(9173),n=i(17733),s=i(86083);function a(e){let{width:t,height:i,bounds:a,minExtent:o=0,maxZoom:u=24,offset:l=[0,0]}=e,[[f,h],[c,d]]=a,p=function(e=0){return"number"==typeof e?{top:e,bottom:e,left:e,right:e}:((0,r.v)(Number.isFinite(e.top)&&Number.isFinite(e.bottom)&&Number.isFinite(e.left)&&Number.isFinite(e.right)),e)}(e.padding),g=(0,s.Gw)([f,(0,n.qE)(d,-s.aH,s.aH)]),m=(0,s.Gw)([c,(0,n.qE)(h,-s.aH,s.aH)]),b=[Math.max(Math.abs(m[0]-g[0]),o),Math.max(Math.abs(m[1]-g[1]),o)],_=[t-p.left-p.right-2*Math.abs(l[0]),i-p.top-p.bottom-2*Math.abs(l[1])];(0,r.v)(_[0]>0&&_[1]>0);let y=_[0]/b[0],v=_[1]/b[1],w=(p.right-p.left)/2/y,E=(p.top-p.bottom)/2/v,x=[(m[0]+g[0])/2+w,(m[1]+g[1])/2+E],S=(0,s.iV)(x),A=Math.min(u,(0,n.p6)(Math.abs(Math.min(y,v))));return(0,r.v)(Number.isFinite(A)),{longitude:S[0],latitude:S[1],zoom:A}}},62905(e,t,i){i.d(t,{g:()=>o});var r=i(59808),n=i(86083),s=i(17733);let a=Math.PI/180;function o(e,t=0){let i,r,{width:n,height:s,unproject:l}=e,f={targetZ:t},h=l([0,s],f),c=l([n,s],f);return(e.fovy?.5*e.fovy*a:Math.atan(.5/e.altitude))>(90-e.pitch)*a-.01?(i=u(e,0,t),r=u(e,n,t)):(i=l([0,0],f),r=l([n,0],f)),[h,c,r,i]}function u(e,t,i){let{pixelUnprojectionMatrix:a}=e,o=(0,s._U)(a,[t,0,1,1]),u=(0,s._U)(a,[t,e.height,1,1]),l=(i*e.distanceScales.unitsPerMeter[2]-o[2])/(u[2]-o[2]),f=r.Cc([],o,u,l),h=(0,n.iV)(f);return h.push(i),h}},17733(e,t,i){i.d(t,{$M:()=>n,Cc:()=>a,_U:()=>s,p6:()=>u,qE:()=>o});var r=i(74646);function n(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function s(e,t){let i=r.Z0([],t,e);return r.hs(i,i,1/i[3]),i}function a(e,t,i){return i*t+(1-i)*e}function o(e,t,i){return e<t?t:e>i?i:e}let u=Math.log2||function(e){return Math.log(e)*Math.LOG2E}},86083(e,t,i){i.d(t,{Gw:()=>g,J9:()=>p,Os:()=>x,VJ:()=>A,XM:()=>d,aH:()=>c,dT:()=>v,fO:()=>b,iV:()=>m,mY:()=>_,nI:()=>y,om:()=>E,rY:()=>w,wZ:()=>S,xJ:()=>L});var r=i(17733),n=i(32686),s=i(49527),a=i(59808),o=i(9173);let u=Math.PI,l=u/4,f=u/180,h=180/u,c=85.051129;function d(e){return Math.pow(2,e)}function p(e){return(0,r.p6)(e)}function g(e){let[t,i]=e;(0,o.v)(Number.isFinite(t)),(0,o.v)(Number.isFinite(i)&&i>=-90&&i<=90,"invalid latitude");let r=512*(u+Math.log(Math.tan(l+i*f*.5)))/(2*u);return[512*(t*f+u)/(2*u),r]}function m(e){let[t,i]=e,r=2*(Math.atan(Math.exp(i/512*(2*u)-u))-l);return[(t/512*(2*u)-u)*h,r*h]}function b(e){let{latitude:t}=e;return(0,o.v)(Number.isFinite(t)),p(4003e4*Math.cos(t*f))-9}function _(e){return 512/4003e4/Math.cos(e*f)}function y(e){let{latitude:t,longitude:i,highPrecision:r=!1}=e;(0,o.v)(Number.isFinite(t)&&Number.isFinite(i));let n=Math.cos(t*f),s=512/360/n,a=512/4003e4/n,u={unitsPerMeter:[a,a,a],metersPerUnit:[1/a,1/a,1/a],unitsPerDegree:[512/360,s,a],degreesPerUnit:[1/(512/360),1/s,1/a]};if(r){let e=f*Math.tan(t*f)/n,i=512/4003e4*e,r=i/s*a;u.unitsPerDegree2=[0,512/360*e/2,i],u.unitsPerMeter2=[r,0,r]}return u}function v(e,t){let[i,r,n]=e,[s,a,o]=t,{unitsPerMeter:u,unitsPerMeter2:l}=y({longitude:i,latitude:r,highPrecision:!0}),f=g(e);f[0]+=s*(u[0]+l[0]*a),f[1]+=a*(u[1]+l[1]*a);let h=m(f);return Number.isFinite(n)||Number.isFinite(o)?[h[0],h[1],(n||0)+(o||0)]:h}function w(e){let{height:t,pitch:i,bearing:a,altitude:o,scale:u,center:l}=e,h=(0,r.$M)();n.Tl(h,h,[0,0,-o]),n.eL(h,h,-i*f),n.Qr(h,h,a*f);let c=u/t;return n.hs(h,h,[c,c,c]),l&&n.Tl(h,h,s.ze([],l)),h}function E(e){let{width:t,height:i,altitude:n,pitch:s=0,offset:a,center:o,scale:u,nearZMultiplier:l=1,farZMultiplier:h=1}=e,{fovy:c=x(1.5)}=e;void 0!==n&&(c=x(n));let d=c*f,p=s*f,g=S(c),m=g;o&&(m+=o[2]*u/Math.cos(p)/i);let b=d*(.5+(a?a[1]:0)/i),_=Math.sin(b)*m/Math.sin((0,r.qE)(Math.PI/2-p-b,.01,Math.PI-.01));return{fov:d,aspect:t/i,focalDistance:g,near:l,far:Math.min((Math.sin(p)*_+m)*h,10*m)}}function x(e){return 2*Math.atan(.5/e)*h}function S(e){return .5/Math.tan(.5*e*f)}function A(e,t){let[i,n,s=0]=e;return(0,o.v)(Number.isFinite(i)&&Number.isFinite(n)&&Number.isFinite(s)),(0,r._U)(t,[i,n,s,1])}function L(e,t,i=0){let[n,s,u]=e;if((0,o.v)(Number.isFinite(n)&&Number.isFinite(s),"invalid pixel coordinate"),Number.isFinite(u))return(0,r._U)(t,[n,s,u,1]);let l=(0,r._U)(t,[n,s,0,1]),f=(0,r._U)(t,[n,s,1,1]),h=l[2],c=f[2];return a.Cc([],l,f,h===c?0:((i||0)-h)/(c-h))}},39171(e,t,i){var r,n,s,a,o,u;i.d(t,{Cx:()=>k,uq:()=>R,Cp:()=>C,EU:()=>et,h1:()=>D}),(a=r||(r={}))[a.Start=1]="Start",a[a.Move=2]="Move",a[a.End=4]="End",a[a.Cancel=8]="Cancel",(o=n||(n={}))[o.None=0]="None",o[o.Left=1]="Left",o[o.Right=2]="Right",o[o.Up=4]="Up",o[o.Down=8]="Down",o[o.Horizontal=3]="Horizontal",o[o.Vertical=12]="Vertical",o[o.All=15]="All",(u=s||(s={}))[u.Possible=1]="Possible",u[u.Began=2]="Began",u[u.Changed=4]="Changed",u[u.Ended=8]="Ended",u[u.Recognized=8]="Recognized",u[u.Cancelled=16]="Cancelled",u[u.Failed=32]="Failed";let l="manipulation";class f{constructor(e,t){this.actions="",this.manager=e,this.set(t)}set(e){"compute"===e&&(e=this.compute()),this.manager.element&&(this.manager.element.style.touchAction=e,this.actions=e)}update(){this.set(this.manager.options.touchAction)}compute(){let e=[];for(let t of this.manager.recognizers)t.options.enable&&(e=e.concat(t.getTouchAction()));var t=e.join(" ");if(t.includes("none"))return"none";let i=t.includes("pan-x"),r=t.includes("pan-y");return i&&r?"none":i||r?i?"pan-x":"pan-y":t.includes(l)?l:"auto"}}function h(e){return e.trim().split(/\s+/g)}function c(e,t,i){if(e)for(let r of h(t))e.addEventListener(r,i,!1)}function d(e,t,i){if(e)for(let r of h(t))e.removeEventListener(r,i,!1)}function p(e){return(e.ownerDocument||e).defaultView}function g(e){let t=e.length;if(1===t)return{x:Math.round(e[0].clientX),y:Math.round(e[0].clientY)};let i=0,r=0,n=0;for(;n<t;)i+=e[n].clientX,r+=e[n].clientY,n++;return{x:Math.round(i/t),y:Math.round(r/t)}}function m(e){let t=[],i=0;for(;i<e.pointers.length;)t[i]={clientX:Math.round(e.pointers[i].clientX),clientY:Math.round(e.pointers[i].clientY)},i++;return{timeStamp:Date.now(),pointers:t,center:g(t),deltaX:e.deltaX,deltaY:e.deltaY}}function b(e,t){let i=t.x-e.x,r=t.y-e.y;return Math.sqrt(i*i+r*r)}function _(e,t){let i=t.clientX-e.clientX,r=t.clientY-e.clientY;return Math.sqrt(i*i+r*r)}function y(e,t){let i=t.clientX-e.clientX;return 180*Math.atan2(t.clientY-e.clientY,i)/Math.PI}function v(e,t){return e===t?n.None:Math.abs(e)>=Math.abs(t)?e<0?n.Left:n.Right:t<0?n.Up:n.Down}function w(e,t,i){return{x:t/e||0,y:i/e||0}}class E{constructor(e){this.evEl="",this.evWin="",this.evTarget="",this.domHandler=e=>{this.manager.options.enable&&this.handler(e)},this.manager=e,this.element=e.element,this.target=e.options.inputTarget||e.element}callback(e,t){var i;let n,s,a,o,u;i=this.manager,n=t.pointers.length,s=t.changedPointers.length,a=e&r.Start&&n-s==0,o=e&(r.End|r.Cancel)&&n-s==0,t.isFirst=!!a,t.isFinal=!!o,a&&(i.session={}),t.eventType=e,u=function(e,t){var i,n;let s,a,o,u,l,{session:f}=e,{pointers:h}=t,{length:c}=h;f.firstInput||(f.firstInput=m(t)),c>1&&!f.firstMultiple?f.firstMultiple=m(t):1===c&&(f.firstMultiple=!1);let{firstInput:d,firstMultiple:p}=f,E=p?p.center:d.center,x=t.center=g(h);t.timeStamp=Date.now(),t.deltaTime=t.timeStamp-d.timeStamp,s=x.x-E.x,t.angle=180*Math.atan2(x.y-E.y,s)/Math.PI,t.distance=b(E,x);let{deltaX:S,deltaY:A}=(a=t.center,o=f.offsetDelta,u=f.prevDelta,l=f.prevInput,(t.eventType===r.Start||l?.eventType===r.End)&&(u=f.prevDelta={x:l?.deltaX||0,y:l?.deltaY||0},o=f.offsetDelta={x:a.x,y:a.y}),{deltaX:u.x+(a.x-o.x),deltaY:u.y+(a.y-o.y)});t.deltaX=S,t.deltaY=A,t.offsetDirection=v(t.deltaX,t.deltaY);let L=w(t.deltaTime,t.deltaX,t.deltaY);t.overallVelocityX=L.x,t.overallVelocityY=L.y,t.overallVelocity=Math.abs(L.x)>Math.abs(L.y)?L.x:L.y,t.scale=p?(i=p.pointers,_(h[0],h[1])/_(i[0],i[1])):1,t.rotation=p?(n=p.pointers,y(h[1],h[0])-y(n[1],n[0])):0,t.maxPointers=f.prevInput?t.pointers.length>f.prevInput.maxPointers?t.pointers.length:f.prevInput.maxPointers:t.pointers.length;let B=e.element;return function(e,t){let i=e;for(;i;){if(i===t)return!0;i=i.parentNode}return!1}(t.srcEvent.target,B)&&(B=t.srcEvent.target),t.target=B,!function(e,t){let i,n,s,a,o=e.lastInterval||t,u=t.timeStamp-o.timeStamp;if(t.eventType!==r.Cancel&&(u>25||void 0===o.velocity)){let r=t.deltaX-o.deltaX,l=t.deltaY-o.deltaY,f=w(u,r,l);n=f.x,s=f.y,i=Math.abs(f.x)>Math.abs(f.y)?f.x:f.y,a=v(r,l),e.lastInterval=t}else i=o.velocity,n=o.velocityX,s=o.velocityY,a=o.direction;t.velocity=i,t.velocityX=n,t.velocityY=s,t.direction=a}(f,t),t}(i,t),i.emit("hammer.input",u),i.recognize(u),i.session.prevInput=u}init(){c(this.element,this.evEl,this.domHandler),c(this.target,this.evTarget,this.domHandler),c(p(this.element),this.evWin,this.domHandler)}destroy(){d(this.element,this.evEl,this.domHandler),d(this.target,this.evTarget,this.domHandler),d(p(this.element),this.evWin,this.domHandler)}}let x={pointerdown:r.Start,pointermove:r.Move,pointerup:r.End,pointercancel:r.Cancel,pointerout:r.Cancel};class S extends E{constructor(e){super(e),this.evEl="pointerdown",this.evWin="pointermove pointerup pointercancel",this.store=this.manager.session.pointerEvents=[],this.init()}handler(e){let{store:t}=this,i=!1,n=x[e.type],s=e.pointerType,a="touch"===s,o=t.findIndex(t=>t.pointerId===e.pointerId);n&r.Start&&(e.buttons||a)?o<0&&(t.push(e),o=t.length-1):n&(r.End|r.Cancel)&&(i=!0),!(o<0)&&(t[o]=e,this.callback(n,{pointers:t,changedPointers:[e],eventType:n,pointerType:s,srcEvent:e}),i&&t.splice(o,1))}}let A=["","webkit","Moz","MS","ms","o"],L={touchAction:"compute",enable:!0,inputTarget:null,cssProps:{userSelect:"none",userDrag:"none",touchCallout:"none",tapHighlightColor:"rgba(0,0,0,0)"}};class B{constructor(e,t){this.options={...L,...t,cssProps:{...L.cssProps,...t.cssProps},inputTarget:t.inputTarget||e},this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=e,this.input=new S(this),this.touchAction=new f(this,this.options.touchAction),this.toggleCssProps(!0)}set(e){return Object.assign(this.options,e),e.touchAction&&this.touchAction.update(),e.inputTarget&&(this.input.destroy(),this.input.target=e.inputTarget,this.input.init()),this}stop(e){this.session.stopped=e?2:1}recognize(e){let t,{session:i}=this;if(i.stopped)return;this.session.prevented&&e.srcEvent.preventDefault();let{recognizers:r}=this,{curRecognizer:n}=i;(!n||n&&n.state&s.Recognized)&&(n=i.curRecognizer=null);let a=0;for(;a<r.length;)t=r[a],2!==i.stopped&&(!n||t===n||t.canRecognizeWith(n))?t.recognize(e):t.reset(),!n&&t.state&(s.Began|s.Changed|s.Ended)&&(n=i.curRecognizer=t),a++}get(e){let{recognizers:t}=this;for(let i=0;i<t.length;i++)if(t[i].options.event===e)return t[i];return null}add(e){if(Array.isArray(e)){for(let t of e)this.add(t);return this}let t=this.get(e.options.event);return t&&this.remove(t),this.recognizers.push(e),e.manager=this,this.touchAction.update(),e}remove(e){if(Array.isArray(e)){for(let t of e)this.remove(t);return this}let t="string"==typeof e?this.get(e):e;if(t){let{recognizers:e}=this,i=e.indexOf(t);-1!==i&&(e.splice(i,1),this.touchAction.update())}return this}on(e,t){if(!e||!t)return;let{handlers:i}=this;for(let r of h(e))i[r]=i[r]||[],i[r].push(t)}off(e,t){if(!e)return;let{handlers:i}=this;for(let r of h(e))t?i[r]&&i[r].splice(i[r].indexOf(t),1):delete i[r]}emit(e,t){let i=this.handlers[e]&&this.handlers[e].slice();if(!i||!i.length)return;t.type=e,t.preventDefault=function(){t.srcEvent.preventDefault()};let r=0;for(;r<i.length;)i[r](t),r++}destroy(){this.toggleCssProps(!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}toggleCssProps(e){let{element:t}=this;if(t){for(let[i,r]of Object.entries(this.options.cssProps)){let n=function(e,t){let i=t[0].toUpperCase()+t.slice(1);for(let r of A){let n=r?r+i:t;if(n in e)return n}}(t.style,i);e?(this.oldCssProps[n]=t.style[n],t.style[n]=r):t.style[n]=this.oldCssProps[n]||""}e||(this.oldCssProps={})}}}let T=1;function P(e){return e&s.Cancelled?"cancel":e&s.Ended?"end":e&s.Changed?"move":e&s.Began?"start":""}class ${constructor(e){this.options=e,this.id=T++,this.state=s.Possible,this.simultaneous={},this.requireFail=[]}set(e){return Object.assign(this.options,e),this.manager.touchAction.update(),this}recognizeWith(e){let t;if(Array.isArray(e)){for(let t of e)this.recognizeWith(t);return this}if("string"==typeof e){if(!(t=this.manager.get(e)))throw Error(`Cannot find recognizer ${e}`)}else t=e;let{simultaneous:i}=this;return i[t.id]||(i[t.id]=t,t.recognizeWith(this)),this}dropRecognizeWith(e){let t;if(Array.isArray(e)){for(let t of e)this.dropRecognizeWith(t);return this}return(t="string"==typeof e?this.manager.get(e):e)&&delete this.simultaneous[t.id],this}requireFailure(e){let t;if(Array.isArray(e)){for(let t of e)this.requireFailure(t);return this}if("string"==typeof e){if(!(t=this.manager.get(e)))throw Error(`Cannot find recognizer ${e}`)}else t=e;let{requireFail:i}=this;return -1===i.indexOf(t)&&(i.push(t),t.requireFailure(this)),this}dropRequireFailure(e){let t;if(Array.isArray(e)){for(let t of e)this.dropRequireFailure(t);return this}if(t="string"==typeof e?this.manager.get(e):e){let e=this.requireFail.indexOf(t);e>-1&&this.requireFail.splice(e,1)}return this}hasRequireFailures(){return!!this.requireFail.find(e=>e.options.enable)}canRecognizeWith(e){return!!this.simultaneous[e.id]}emit(e){if(!e)return;let{state:t}=this;t<s.Ended&&this.manager.emit(this.options.event+P(t),e),this.manager.emit(this.options.event,e),e.additionalEvent&&this.manager.emit(e.additionalEvent,e),t>=s.Ended&&this.manager.emit(this.options.event+P(t),e)}tryEmit(e){this.canEmit()?this.emit(e):this.state=s.Failed}canEmit(){let e=0;for(;e<this.requireFail.length;){if(!(this.requireFail[e].state&(s.Failed|s.Possible)))return!1;e++}return!0}recognize(e){let t={...e};if(!this.options.enable){this.reset(),this.state=s.Failed;return}this.state&(s.Recognized|s.Cancelled|s.Failed)&&(this.state=s.Possible),this.state=this.process(t),this.state&(s.Began|s.Changed|s.Ended|s.Cancelled)&&this.tryEmit(t)}getEventNames(){return[this.options.event]}reset(){}}class M extends ${attrTest(e){let t=this.options.pointers;return 0===t||e.pointers.length===t}process(e){let{state:t}=this,{eventType:i}=e,n=t&(s.Began|s.Changed),a=this.attrTest(e);return n&&(i&r.Cancel||!a)?t|s.Cancelled:n||a?i&r.End?t|s.Ended:t&s.Began?t|s.Changed:s.Began:s.Failed}}let O=["","start","move","end","cancel"];class C extends ${constructor(e={}){super({enable:!0,event:"doubleclickdrag",pointers:1,interval:500,time:350,threshold:28,dragThreshold:1,pixelsPerScale:120,...e}),this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}getTouchAction(){return[l]}getEventNames(){return O.map(e=>this.options.event+e)}process(e){let{options:t}=this;return e.pointers.length!==t.pointers?(this.reset(),s.Failed):e.eventType&r.Start?this._handleStart(e):e.eventType&r.Move?this._handleMove(e):e.eventType&r.Cancel?this._handleEnd(e,!0):e.eventType&r.End?this._handleEnd(e,!1):s.Failed}reset(){this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}emit(e){if(e){if(this.state===s.Began){if(!this._drag?.active||this._emittedStart)return;this._emittedStart=!0,this.manager.emit(`${this.options.event}start`,e),this.manager.emit(this.options.event,e);return}if(this.state===s.Changed){if(!this._emittedStart)return;this.manager.emit(`${this.options.event}move`,e),this.manager.emit(this.options.event,e);return}if(this.state===s.Ended){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}end`,e),this._emittedStart=!1;return}if(this.state===s.Cancelled){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}cancel`,e),this._emittedStart=!1}}}_handleStart(e){let t=this._getPointerId(e);return this._lastTap&&this._isTapMatch(e,this._lastTap)?(this._tapStart=null,this._lastTap=null,this._drag={startCenter:e.center,pointerId:t,active:!1},this._emittedStart=!1,s.Began):(this._tapStart={center:e.center,timeStamp:e.timeStamp,pointerId:t},this._lastTap=null,this._drag=null,this._emittedStart=!1,s.Failed)}_handleMove(e){if(!this._drag||!this._isSamePointer(e,this._drag.pointerId))return s.Failed;let t=this._drag.startCenter.y-e.center.y;return!this._drag.active&&Math.abs(t)<this.options.dragThreshold?s.Began:(this._drag.active=!0,e.scale=Math.pow(2,t/this.options.pixelsPerScale),this._emittedStart?s.Changed:s.Began)}_handleEnd(e,t){if(this._drag&&this._isSamePointer(e,this._drag.pointerId)){let{active:i,startCenter:r}=this._drag;if(this._drag=null,this._tapStart=null,this._lastTap=null,!i)return this._emittedStart=!1,s.Failed;let n=r.y-e.center.y;return e.scale=Math.pow(2,n/this.options.pixelsPerScale),t?s.Cancelled:s.Ended}return this._tapStart&&this._isSamePointer(e,this._tapStart.pointerId)?(this._isValidTap(e)?this._lastTap={center:e.center,timeStamp:e.timeStamp,pointerId:this._tapStart.pointerId}:this._lastTap=null,this._tapStart=null):t&&this.reset(),s.Failed}_isTapMatch(e,t){return e.timeStamp-t.timeStamp<=this.options.interval&&b(e.center,t.center)<=this.options.threshold}_isValidTap(e){return e.deltaTime<=this.options.time&&e.distance<=this.options.threshold}_getPointerId(e){return"pointerId"in e.srcEvent?e.srcEvent.pointerId:null}_isSamePointer(e,t){return null===t||this._getPointerId(e)===t}}class k extends ${constructor(e={}){super({enable:!0,event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10,...e}),this.pTime=null,this.pCenter=null,this._timer=null,this._input=null,this.count=0}getTouchAction(){return[l]}process(e){let{options:t}=this,i=e.pointers.length===t.pointers,n=e.distance<t.threshold,a=e.deltaTime<t.time;if(this.reset(),e.eventType&r.Start&&0===this.count)return this.failTimeout();if(n&&a&&i){if(e.eventType!==r.End)return this.failTimeout();let i=!this.pTime||e.timeStamp-this.pTime<t.interval,n=!this.pCenter||b(this.pCenter,e.center)<t.posThreshold;if(this.pTime=e.timeStamp,this.pCenter=e.center,n&&i?this.count+=1:this.count=1,this._input=e,0==this.count%t.taps)return this.hasRequireFailures()?(this._timer=setTimeout(()=>{this.state=s.Recognized,this.tryEmit(this._input)},t.interval),s.Began):s.Recognized}return s.Failed}failTimeout(){return this._timer=setTimeout(()=>{this.state=s.Failed},this.options.interval),s.Failed}reset(){clearTimeout(this._timer)}emit(e){this.state===s.Recognized&&(e.tapCount=this.count,this.manager.emit(this.options.event,e))}}class N extends M{constructor(){super(...arguments),this.wheelSession=null,this.wheelSessionUnsubscribe=null,this.handleWheelSessionEvent=e=>{"trackpad"===e.device&&this.handleTrackpadEvent(e)}}set(e){let{wheelSession:t,...i}=e;return t&&t!==this.wheelSession&&(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=null,this.wheelSession=t),super.set(i),this.updateWheelSessionSubscription(),this}getTrackpadInput(e,t={}){let{srcEvent:i}=e,r=t.deltaX??e.deltaX,n=t.deltaY??e.deltaY,s=v(r,n);return{pointers:[i,i],changedPointers:[i,i],pointerType:"trackpad",srcEvent:i,eventType:e.eventType,timeStamp:e.timeStamp,deltaTime:e.deltaTime,center:e.center,deltaX:r,deltaY:n,angle:180*Math.atan2(n,r)/Math.PI,distance:Math.sqrt(r*r+n*n),scale:1,rotation:0,direction:s,offsetDirection:s,velocity:e.velocity,velocityX:e.velocityX,velocityY:e.velocityY,overallVelocity:e.overallVelocity,overallVelocityX:e.overallVelocityX,overallVelocityY:e.overallVelocityY,maxPointers:2,target:i.target||this.manager.element,additionalEvent:"",...t}}updateWheelSessionSubscription(){let e=!!(this.wheelSession&&this.options.enable&&this.options.trackpad&&2===this.options.pointers);e&&!this.wheelSessionUnsubscribe?this.wheelSessionUnsubscribe=this.wheelSession.on(this.handleWheelSessionEvent):!e&&this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe(),this.wheelSessionUnsubscribe=null)}}let I=["","start","move","end","cancel","up","down","left","right"];class R extends N{constructor(e={}){super({enable:!0,pointers:1,event:"pan",threshold:10,direction:n.All,trackpad:!1,...e}),this.trackpadGesture=!1,this.pX=null,this.pY=null}getTouchAction(){let{options:{direction:e}}=this,t=[];return e&n.Horizontal&&t.push("pan-y"),e&n.Vertical&&t.push("pan-x"),t}getEventNames(){return I.map(e=>this.options.event+e)}directionTest(e){let{options:t}=this,i=!0,{distance:r}=e,{direction:s}=e,a=e.deltaX,o=e.deltaY;return s&t.direction||(t.direction&n.Horizontal?(s=0===a?n.None:a<0?n.Left:n.Right,i=a!==this.pX,r=Math.abs(e.deltaX)):(s=0===o?n.None:o<0?n.Up:n.Down,i=o!==this.pY,r=Math.abs(e.deltaY))),e.direction=s,i&&r>t.threshold&&!!(s&t.direction)}attrTest(e){return super.attrTest(e)&&(!!(this.state&s.Began)||!(this.state&s.Began)&&this.directionTest(e))}emit(e){this.pX=e.deltaX,this.pY=e.deltaY;let t=n[e.direction].toLowerCase();t&&(e.additionalEvent=this.options.event+t),super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=!e.srcEvent.ctrlKey),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:-e.deltaX,deltaY:-e.deltaY,velocity:-e.velocity,velocityX:-e.velocityX,velocityY:-e.velocityY,overallVelocity:-e.overallVelocity,overallVelocityX:-e.overallVelocityX,overallVelocityY:-e.overallVelocityY})),e.isFinal&&(this.trackpadGesture=!1))}}let U=["","start","move","end","cancel","in","out"];class D extends N{constructor(e={}){super({enable:!0,event:"pinch",threshold:0,pointers:2,trackpad:!1,...e}),this.trackpadGesture=!1}getTouchAction(){return["none"]}getEventNames(){return U.map(e=>this.options.event+e)}attrTest(e){return super.attrTest(e)&&(Math.abs(e.scale-1)>this.options.threshold||!!(this.state&s.Began))}emit(e){if(1!==e.scale){let t=e.scale<1?"in":"out";e.additionalEvent=this.options.event+t}super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=e.srcEvent.ctrlKey),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:0,deltaY:0,velocity:0,velocityX:0,velocityY:0,overallVelocity:0,overallVelocityX:0,overallVelocityY:0,scale:Math.exp(-e.deltaY/100)})),e.isFinal&&(this.trackpadGesture=!1))}}class F{constructor(e,t,i){this.element=e,this.callback=t,this.options=i}listen(e,t){t?this.element.addEventListener(e,this.handleEvent,{passive:!1}):this.element.removeEventListener(e,this.handleEvent)}}let z=-1!==("u">typeof navigator&&navigator.userAgent?navigator.userAgent.toLowerCase():"").indexOf("firefox");class V extends F{constructor(e,t,i){i.enable=i.enable??!1,super(e,t,i),this.handleEvent=e=>{if(!this.options.enable)return;let t=e.deltaY;globalThis.WheelEvent&&(z&&e.deltaMode===globalThis.WheelEvent.DOM_DELTA_PIXEL&&(t/=globalThis.devicePixelRatio),e.deltaMode===globalThis.WheelEvent.DOM_DELTA_LINE&&(t*=40)),e.shiftKey&&t&&(t*=.25),this.callback({type:"wheel",center:{x:e.clientX,y:e.clientY},delta:-t,device:this.options.wheelSession?.device??"unknown",srcEvent:e,pointerType:"mouse",target:e.target})},i.enable&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{}),this.listen("wheel",!0))}destroy(){this.listen("wheel",!1),this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0}enableEventType(e,t){"wheel"===e&&this.options.enable!==t&&(this.options.enable=t,t&&!this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{})),this.listen("wheel",t),t||(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0))}}let j={classificationDelay:32,endDelay:80};class G{constructor(e,t={}){this.subscriptions=new Map,this.session=null,this.classificationTimer=null,this.endTimer=null,this.pressedControlKeys=new Set,this.listeningForControlKeys=!1,this.handleEvent=e=>{var t,i;let r,n;if(!this.hasSubscribers)return"unknown";let s=(t=e,i=this.pressedControlKeys.size>0,r=t.deltaX,n=t.deltaY,1===t.deltaMode&&(r*=40,n*=40),{event:t,timeStamp:t.timeStamp,deltaX:r,deltaY:n,isControlKeyDown:i}),a=this.session;if(a&&s.timeStamp-a.lastTimeStamp>=this.options.endDelay){if(this.end(),!this.hasSubscribers)return"unknown";a=null}a?(this.scheduleEnd(),this.addSample(a,s)):(a=this.startPendingSession(s),this.scheduleEnd());let{device:o}=a;return"unknown"===o&&"unknown"!==(o=W(a.samples,!1))&&this.begin(a,o),o},this.finishClassification=()=>{if(this.classificationTimer=null,!this.session||"unknown"!==this.session.device)return;let e=this.session,t=W(e.samples,!0);this.begin(e,"unknown"===t?"mouse":t)},this.end=()=>{if(!this.session)return;if("unknown"===this.session.device){let e=this.session,t=W(e.samples,!0);this.begin(e,"unknown"===t?"mouse":t)}if(!this.session)return;let e=this.session;this.emit(r.End,e.lastEvent),this.reset()},this.handleKeyDown=e=>{"Control"===e.key&&this.pressedControlKeys.add(e.code||e.key)},this.handleKeyUp=e=>{"Control"===e.key&&(e.code?this.pressedControlKeys.delete(e.code):this.pressedControlKeys.clear())},this.handleWindowBlur=()=>{this.pressedControlKeys.clear()},this.element=e,this.options={...j,...t},this.element?.addEventListener("wheel",this.handleEvent,{passive:!0})}get hasSubscribers(){return this.subscriptions.size>0}get device(){return this.session?.device??"unknown"}on(e){let t={listener:e};return this.subscriptions.set(e,t),this.updateControlKeyEventListeners(),()=>{this.subscriptions.get(e)===t&&this.off(e)}}off(e){this.subscriptions.delete(e),this.updateControlKeyEventListeners(),this.hasSubscribers||this.reset()}cancel(){let e=this.session;e&&"unknown"!==e.device&&this.emit(r.Cancel,e.lastEvent),this.reset()}destroy(){this.cancel(),this.subscriptions.clear(),this.updateControlKeyEventListeners(),this.element?.removeEventListener("wheel",this.handleEvent)}startPendingSession(e){let t={samples:[e],device:"unknown",firstTimeStamp:e.timeStamp,lastTimeStamp:e.timeStamp,totalDeltaX:e.deltaX,totalDeltaY:e.deltaY,velocityX:0,velocityY:0,lastEvent:e.event};return this.session=t,this.classificationTimer=globalThis.setTimeout(this.finishClassification,this.options.classificationDelay),t}addSample(e,t){if(e.samples.push(t),e.lastTimeStamp=t.timeStamp,e.lastEvent=t.event,e.totalDeltaX+=t.deltaX,e.totalDeltaY+=t.deltaY,"unknown"!==e.device){let i=e.samples[e.samples.length-2],n=t.timeStamp-i.timeStamp;e.velocityX=n>0?t.deltaX/n:0,e.velocityY=n>0?t.deltaY/n:0,this.emit(r.Move,t.event,{velocityX:e.velocityX,velocityY:e.velocityY})}}begin(e,t){e.device=t,this.clearClassificationTimer(),this.emit(r.Start,e.samples[0].event);let i=e.lastTimeStamp-e.firstTimeStamp;e.velocityX=i>0?e.totalDeltaX/i:0,e.velocityY=i>0?e.totalDeltaY/i:0,this.emit(r.Move,e.lastEvent,{velocityX:e.velocityX,velocityY:e.velocityY})}scheduleEnd(){this.clearEndTimer(),this.endTimer=globalThis.setTimeout(this.end,this.options.endDelay)}emit(e,t,i){let n=this.session;if(!n||"unknown"===n.device)return;let s=e===r.Start,a=e===r.End||e===r.Cancel,o=s?n.firstTimeStamp:n.lastTimeStamp,u=s?0:Math.max(0,o-n.firstTimeStamp),l=s?0:n.totalDeltaX,f=s?0:n.totalDeltaY,h=u>0?l/u:0,c=u>0?f/u:0,d=s?0:i?.velocityX??n.velocityX,p=s?0:i?.velocityY??n.velocityY,g={eventType:e,device:n.device,srcEvent:t,timeStamp:o,center:{x:t.clientX,y:t.clientY},deltaX:l,deltaY:f,deltaTime:u,velocity:Math.abs(d)>Math.abs(p)?d:p,velocityX:d,velocityY:p,overallVelocity:Math.abs(h)>Math.abs(c)?h:c,overallVelocityX:h,overallVelocityY:c,isFirst:s,isFinal:a};for(let{listener:e}of[...this.subscriptions.values()])e(g)}reset(){this.clearClassificationTimer(),this.clearEndTimer(),this.session=null}clearClassificationTimer(){null!==this.classificationTimer&&(globalThis.clearTimeout(this.classificationTimer),this.classificationTimer=null)}clearEndTimer(){null!==this.endTimer&&(globalThis.clearTimeout(this.endTimer),this.endTimer=null)}updateControlKeyEventListeners(){let e=this.hasSubscribers,t="u">typeof window?window:globalThis.document?.defaultView;t&&e!==this.listeningForControlKeys&&(this.listeningForControlKeys=e,e?(t.addEventListener("keydown",this.handleKeyDown,!0),t.addEventListener("keyup",this.handleKeyUp,!0),t.addEventListener("blur",this.handleWindowBlur)):(t.removeEventListener("keydown",this.handleKeyDown,!0),t.removeEventListener("keyup",this.handleKeyUp,!0),t.removeEventListener("blur",this.handleWindowBlur),this.pressedControlKeys.clear()))}}function W(e,t){return e.some(({event:e,isControlKeyDown:t})=>e.ctrlKey&&!t)?"trackpad":e.some(({event:e})=>0!==e.deltaMode)||e.some(q)||e.every(({event:e})=>{let t=e.wheelDelta;return void 0!==t&&Math.abs(t)%40==0})?"mouse":e.some(({deltaX:e})=>0!==e)||e.length>1&&function(e){for(let t=0;t<e.length;t++){let i=e[t];if(Math.abs(i.deltaX)>40||Math.abs(i.deltaY)>40||t>0&&i.timeStamp-e[t-1].timeStamp>40)return!1}return!0}(e)?"trackpad":t?"mouse":"unknown"}function q({event:e,deltaX:t,deltaY:i}){if(0!==t||0===i)return!1;if(Number.isInteger(Math.abs(i/4.000244140625)))return!0;let r=e.wheelDelta;return"number"==typeof r&&0!==r&&r%120==0}let H=["mousedown","mousemove","mouseup","mouseover","mouseout","mouseenter","mouseleave"];class Y extends F{constructor(e,t,i){super(e,t,{enable:!0,...i}),this.handleEvent=e=>{this.handleOverEvent(e),this.handleOutEvent(e),this.handleEnterEvent(e),this.handleLeaveEvent(e),this.handleMoveEvent(e)},this.pressed=!1;let{enable:r=!1}=this.options;this.enableMoveEvent=r,this.enableLeaveEvent=r,this.enableEnterEvent=r,this.enableOutEvent=r,this.enableOverEvent=r,r&&H.forEach(e=>this.listen(e,!0))}destroy(){H.forEach(e=>this.listen(e,!1))}enableEventType(e,t){switch(e){case"pointermove":this.enableMoveEvent!==t&&(this.enableMoveEvent=t,this.listen("mousedown",t),this.listen("mousemove",t),this.listen("mouseup",t));break;case"pointerover":this.enableOverEvent!==t&&(this.enableOverEvent=t,this.listen("mouseover",t));break;case"pointerout":this.enableOutEvent!==t&&(this.enableOutEvent=t,this.listen("mouseout",t));break;case"pointerenter":this.enableEnterEvent!==t&&(this.enableEnterEvent=t,this.listen("mouseenter",t));break;case"pointerleave":this.enableLeaveEvent!==t&&(this.enableLeaveEvent=t,this.listen("mouseleave",t))}}handleOverEvent(e){this.enableOverEvent&&"mouseover"===e.type&&this._emit("pointerover",e)}handleOutEvent(e){this.enableOutEvent&&"mouseout"===e.type&&this._emit("pointerout",e)}handleEnterEvent(e){this.enableEnterEvent&&"mouseenter"===e.type&&this._emit("pointerenter",e)}handleLeaveEvent(e){this.enableLeaveEvent&&"mouseleave"===e.type&&this._emit("pointerleave",e)}handleMoveEvent(e){if(this.enableMoveEvent)switch(e.type){case"mousedown":e.button>=0&&(this.pressed=!0);break;case"mousemove":0===e.buttons&&(this.pressed=!1),this.pressed||this._emit("pointermove",e);break;case"mouseup":this.pressed=!1}}_emit(e,t){this.callback({type:e,center:{x:t.clientX,y:t.clientY},srcEvent:t,pointerType:"mouse",target:t.target})}}let Z=["keydown","keyup"];class X extends F{constructor(e,t,i){super(e,t,{enable:!0,tabIndex:0,...i}),this.handleEvent=e=>{let t=e.target||e.srcElement;("INPUT"!==t.tagName||"text"!==t.type)&&"TEXTAREA"!==t.tagName&&(this.enableDownEvent&&"keydown"===e.type&&this.callback({type:"keydown",srcEvent:e,key:e.key,target:e.target}),this.enableUpEvent&&"keyup"===e.type&&this.callback({type:"keyup",srcEvent:e,key:e.key,target:e.target}))};let{enable:r=!1}=this.options;this.enableDownEvent=r,this.enableUpEvent=r,e.tabIndex=this.options.tabIndex,e.style.outline="none",r&&Z.forEach(e=>this.listen(e,!0))}destroy(){Z.forEach(e=>this.listen(e,!1))}enableEventType(e,t){"keydown"===e&&this.enableDownEvent!==t&&(this.enableDownEvent=t,this.listen(e,t)),"keyup"===e&&this.enableUpEvent!==t&&(this.enableUpEvent=t,this.listen(e,t))}}class K extends F{constructor(e,t,i){i.enable=i.enable??!1,super(e,t,i),this.handleEvent=e=>{this.options.enable&&this.callback({type:"contextmenu",center:{x:e.clientX,y:e.clientY},srcEvent:e,pointerType:"mouse",target:e.target})},i.enable&&this.listen("contextmenu",!0)}destroy(){this.listen("contextmenu",!1)}enableEventType(e,t){"contextmenu"===e&&this.options.enable!==t&&(this.options.enable=t,this.listen("contextmenu",t))}}let Q={pointerdown:1,pointermove:2,pointerup:4,mousedown:1,mousemove:2,mouseup:4},J={srcElement:"root",priority:0};class ee{constructor(e,t){this.handleEvent=e=>{if(this.isEmpty())return;let t=this._normalizeEvent(e),i=e.srcEvent.target;for(;i&&i!==t.rootElement;){if(this._emit(t,i),t.handled)return;i=i.parentNode}this._emit(t,"root")},this.eventManager=e,this.recognizerName=t,this.handlers=[],this.handlersByElement=new Map,this._active=!1}isEmpty(){return!this._active}add(e,t,i,r=!1,n=!1){let{handlers:s,handlersByElement:a}=this,o={...J,...i},u=a.get(o.srcElement);u||(u=[],a.set(o.srcElement,u));let l={type:e,handler:t,srcElement:o.srcElement,priority:o.priority};r&&(l.once=!0),n&&(l.passive=!0),s.push(l),this._active=this._active||!l.passive;let f=u.length-1;for(;f>=0&&!(u[f].priority>=l.priority);)f--;u.splice(f+1,0,l)}remove(e,t){let{handlers:i,handlersByElement:r}=this;for(let n=i.length-1;n>=0;n--){let s=i[n];if(s.type===e&&s.handler===t){i.splice(n,1);let e=r.get(s.srcElement);e.splice(e.indexOf(s),1),0===e.length&&r.delete(s.srcElement)}}this._active=i.some(e=>!e.passive)}_emit(e,t){let i=this.handlersByElement.get(t);if(i){let t=!1,r=()=>{e.handled=!0},n=()=>{e.handled=!0,t=!0},s=[];for(let a=0;a<i.length;a++){let{type:o,handler:u,once:l}=i[a];if(u({...e,type:o,stopPropagation:r,stopImmediatePropagation:n}),l&&s.push(i[a]),t)break}for(let e=0;e<s.length;e++){let{type:t,handler:i}=s[e];this.remove(t,i)}}}_normalizeEvent(e){let t=this.eventManager.getElement();return{...e,...function(e){let t=Q[e.srcEvent.type];if(!t)return null;let{buttons:i,button:r}=e.srcEvent,n=!1,s=!1,a=!1;return 2===t?(n=!!(1&i),s=!!(4&i),a=!!(2&i)):(n=0===r,s=1===r,a=2===r),{leftButton:n,middleButton:s,rightButton:a}}(e),...function(e,t){let i=e.center;if(!i)return null;let r=t.getBoundingClientRect(),n=r.width/t.offsetWidth||1,s=r.height/t.offsetHeight||1,a={x:(i.x-r.left-t.clientLeft)/n,y:(i.y-r.top-t.clientTop)/s};return{center:i,offsetCenter:a}}(e,t),preventDefault:()=>{e.srcEvent.preventDefault()},stopImmediatePropagation:null,stopPropagation:null,handled:!1,rootElement:t}}}class et{constructor(e=null,t={}){if(this._onBasicInput=e=>{this.manager.emit(e.srcEvent.type,e)},this._onOtherEvent=e=>{this.manager.emit(e.type,e)},this.options={recognizers:[],events:{},touchAction:"compute",tabIndex:0,cssProps:{},...t},this.events=new Map,this.element=e,this.wheelSession=new G(e),!e)return;for(let t of(this.manager=new B(e,this.options),this.options.recognizers)){let{recognizer:e,recognizeWith:i,requireFailure:r}=function(e){let t;if("recognizer"in e)return e;let i=Array.isArray(e)?[...e]:[e];return{recognizer:t="function"==typeof i[0]?new(i.shift())(i.shift()||{}):i.shift(),recognizeWith:"string"==typeof i[0]?[i[0]]:i[0],requireFailure:"string"==typeof i[1]?[i[1]]:i[1]}}(t);this.manager.add(e),i&&e.recognizeWith(i),r&&e.requireFailure(r)}this.manager.on("hammer.input",this._onBasicInput),this.wheelInput=new V(e,this._onOtherEvent,{enable:!1,wheelSession:this.wheelSession}),this.moveInput=new Y(e,this._onOtherEvent,{enable:!1}),this.keyInput=new X(e,this._onOtherEvent,{enable:!1,tabIndex:t.tabIndex}),this.contextmenuInput=new K(e,this._onOtherEvent,{enable:!1}),this.on(this.options.events)}getElement(){return this.element}destroy(){this.element?(this.wheelInput.destroy(),this.wheelSession.destroy(),this.moveInput.destroy(),this.keyInput.destroy(),this.contextmenuInput.destroy(),this.manager.destroy()):this.wheelSession.destroy()}on(e,t,i){this._addEventHandler(e,t,i,!1)}once(e,t,i){this._addEventHandler(e,t,i,!0)}watch(e,t,i){this._addEventHandler(e,t,i,!1,!0)}off(e,t){this._removeEventHandler(e,t)}emit(e){this.manager?.emit(e.type,e)}_toggleRecognizer(e,t){let{manager:i}=this;if(!i)return;let r=i.get(e);r&&(r.set({enable:t,wheelSession:this.wheelSession}),i.touchAction.update()),this.wheelInput?.enableEventType(e,t),this.moveInput?.enableEventType(e,t),this.keyInput?.enableEventType(e,t),this.contextmenuInput?.enableEventType(e,t)}_addEventHandler(e,t,i,r,n){if("string"!=typeof e){for(let[s,a]of(i=t,Object.entries(e)))this._addEventHandler(s,a,i,r,n);return}let{manager:s,events:a}=this;if(!s)return;let o=a.get(e);!o&&(o=new ee(this,this._getRecognizerName(e)||e),a.set(e,o),s&&s.on(e,o.handleEvent)),o.add(e,t,i,r,n),o.isEmpty()||this._toggleRecognizer(o.recognizerName,!0)}_removeEventHandler(e,t){if("string"!=typeof e){for(let[t,i]of Object.entries(e))this._removeEventHandler(t,i);return}let{events:i}=this,r=i.get(e);if(r&&(r.remove(e,t),r.isEmpty())){let{recognizerName:e}=r,t=!1;for(let r of i.values())if(r.recognizerName===e&&!r.isEmpty()){t=!0;break}t||this._toggleRecognizer(e,!1)}}_getRecognizerName(e){return this.manager.recognizers.find(t=>t.getEventNames().includes(e))?.options.event}}}}]);
//# sourceMappingURL=4833.37fd7e26.js.map
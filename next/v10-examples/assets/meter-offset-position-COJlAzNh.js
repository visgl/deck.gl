import{a0 as z,a1 as C,a2 as G,n as O,a3 as L,a4 as I,a5 as Z,a6 as S,a7 as w,a8 as B,a9 as F,F as U,A as g,aa as b,ab as X,ac as H,z as T}from"./deck-example-device-Cl0F1Zrg.js";const K={name:"valueNoise",fs:`
float valueNoise_hash(vec2 cell) {
  vec3 value = fract(vec3(cell.x, cell.y, cell.x) * 0.1031);
  value += dot(value, value.yzx + 33.33);
  return fract((value.x + value.y) * value.z);
}
float valueNoise_noise(vec2 position) {
  vec2 cell = floor(position);
  vec2 fraction = fract(position);
  vec2 blend = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(mix(valueNoise_hash(cell), valueNoise_hash(cell + vec2(1.0, 0.0)), blend.x),
    mix(valueNoise_hash(cell + vec2(0.0, 1.0)), valueNoise_hash(cell + vec2(1.0)), blend.x), blend.y);
}

float valueNoise_hash3(vec3 cell) {
  vec3 value = fract(cell * 0.1031);
  value += dot(value, value.yzx + 33.33);
  return fract((value.x + value.y) * value.z);
}
float valueNoise_noise3(vec3 position) {
  vec3 cell = floor(position);
  vec3 fraction = fract(position);
  vec3 blend = fraction * fraction * (3.0 - 2.0 * fraction);
  float bottom = mix(mix(valueNoise_hash3(cell), valueNoise_hash3(cell + vec3(1.0, 0.0, 0.0)), blend.x),
    mix(valueNoise_hash3(cell + vec3(0.0, 1.0, 0.0)), valueNoise_hash3(cell + vec3(1.0, 1.0, 0.0)), blend.x), blend.y);
  float top = mix(mix(valueNoise_hash3(cell + vec3(0.0, 0.0, 1.0)), valueNoise_hash3(cell + vec3(1.0, 0.0, 1.0)), blend.x),
    mix(valueNoise_hash3(cell + vec3(0.0, 1.0, 1.0)), valueNoise_hash3(cell + vec3(1.0)), blend.x), blend.y);
  return mix(bottom, top, blend.z);
}
`,source:`
fn valueNoise_hash(cell: vec2f) -> f32 {
  var value = fract(vec3f(cell.x, cell.y, cell.x) * 0.1031);
  value += vec3f(dot(value, value.yzx + vec3f(33.33)));
  return fract((value.x + value.y) * value.z);
}
fn valueNoise_noise(position: vec2f) -> f32 {
  let cell = floor(position);
  let fraction = fract(position);
  let blend = fraction * fraction * (vec2f(3.0) - 2.0 * fraction);
  return mix(mix(valueNoise_hash(cell), valueNoise_hash(cell + vec2f(1.0, 0.0)), blend.x),
    mix(valueNoise_hash(cell + vec2f(0.0, 1.0)), valueNoise_hash(cell + vec2f(1.0)), blend.x), blend.y);
}

fn valueNoise_hash3(cell: vec3f) -> f32 {
  var value = fract(cell * 0.1031);
  value += vec3f(dot(value, value.yzx + vec3f(33.33)));
  return fract((value.x + value.y) * value.z);
}
fn valueNoise_noise3(position: vec3f) -> f32 {
  let cell = floor(position);
  let fraction = fract(position);
  let blend = fraction * fraction * (vec3f(3.0) - 2.0 * fraction);
  let bottom = mix(mix(valueNoise_hash3(cell), valueNoise_hash3(cell + vec3f(1.0, 0.0, 0.0)), blend.x),
    mix(valueNoise_hash3(cell + vec3f(0.0, 1.0, 0.0)), valueNoise_hash3(cell + vec3f(1.0, 1.0, 0.0)), blend.x), blend.y);
  let top = mix(mix(valueNoise_hash3(cell + vec3f(0.0, 0.0, 1.0)), valueNoise_hash3(cell + vec3f(1.0, 0.0, 1.0)), blend.x),
    mix(valueNoise_hash3(cell + vec3f(0.0, 1.0, 1.0)), valueNoise_hash3(cell + vec3f(1.0)), blend.x), blend.y);
  return mix(bottom, top, blend.z);
}
`},x=Math.PI/180,D=180/Math.PI,p=256,E=.75,Y=.35,V=1.15;function k(d,t){const e=d*x,a=t*x,n=Math.sin(e),s=Math.cos(e),i=Math.sin(a),u=Math.cos(a),l=[s,n,0],c=[-n*i,s*i,u],r=[n*u,-s*u,i];return new O([...l,0,...c,0,...r,0,0,0,0,1])}function J(){const d=p/b,t=Math.PI/180*p;return{unitsPerMeter:[d,d,d],unitsPerWorldUnit:[t,t,d]}}const R=class R extends z{constructor(t={}){const{longitude:e=0,bearing:a=0,pitch:n=0,zoom:s=0,nearZMultiplier:i=.5,farZMultiplier:u=1}=t;let{latitude:l=0,height:c,altitude:r=1.5,fovy:o}=t;l=Math.max(Math.min(l,90),-90),c=c||1,o?r=C(o):o=G(r);const v=Math.max(Math.min(l,T),-T),h=Math.pow(2,s-g(v)),m=n*x,f=t.nearZ??i,M=t.farZ??(r+p*2*h/c/Math.max(Math.cos(m),.1))*u,N=new O().lookAt({eye:[0,-r,0],up:[0,0,1]}).rotateX(-m).rotateY(-a*x).rotateX(l*x).rotateZ(-e*x).scale(h/c),_={...t,crs:L,height:c,viewMatrix:N,longitude:e,latitude:l,zoom:s,modelMatrix:t.position?k(e,l):null,distanceScales:J(),fovy:o,focalDistance:r,near:f,far:M};super(_),this.scale=h,this.latitude=l,this.longitude=e,this.bearing=a,this.pitch=n,this.fovy=o}_getCenter(t,e){return new I(e).scale(this.distanceScales.unitsPerMeter).add(this.projectPosition([t.longitude??0,t.latitude??0,0]))}get projectionMode(){return Z.GLOBE}getDistanceScales(){return this.distanceScales}getBounds(t={}){const e={targetZ:t.z||0},a=this.unproject([0,this.height/2],e),n=this.unproject([this.width/2,0],e),s=this.unproject([this.width,this.height/2],e),i=this.unproject([this.width/2,this.height],e);return s[0]<this.longitude&&(s[0]+=360),a[0]>this.longitude&&(a[0]-=360),[Math.min(a[0],s[0],n[0],i[0]),Math.min(a[1],s[1],n[1],i[1]),Math.max(a[0],s[0],n[0],i[0]),Math.max(a[1],s[1],n[1],i[1])]}_getRayToGlobe(t,{topLeft:e=!0,targetZ:a}={}){const[n,s]=t,i=e?s:this.height-s,{pixelUnprojectionMatrix:u}=this,l=A(u,[n,i,-1,1]),c=A(u,[n,i,1,1]),r=((a||0)/b+1)*p,o=S(w([],l,c)),v=S(l),h=S(c),f=4*((4*v*h-(o-v-h)**2)/16)/o;return{rayStartPosition:l,rayEndPosition:c,radius:r,rayLengthSquared:o,rayStartDistanceSquared:v,distanceToCenterSquared:f}}_getRayDistanceToGlobeCenterRatio(t,e){const{distanceToCenterSquared:a,radius:n}=this._getRayToGlobe(t,e);return Math.sqrt(Math.max(0,a))/n}getZoomAnchorStrength(t){const e=this._getRayDistanceToGlobeCenterRatio(t);return e>V?0:1-Math.max(0,Math.min(1,(e-E)/(1-E)))*(1-Y)}unproject(t,{topLeft:e=!0,targetZ:a}={}){const[n,s,i]=t,u=e?s:this.height-s,{pixelUnprojectionMatrix:l}=this;let c;if(Number.isFinite(i))c=A(l,[n,u,i,1]);else{const{rayStartPosition:h,rayEndPosition:m,radius:f,rayLengthSquared:M,rayStartDistanceSquared:N,distanceToCenterSquared:_}=this._getRayToGlobe(t,{topLeft:e,targetZ:a}),y=Math.sqrt(N-_),j=Math.sqrt(Math.max(0,f*f-_)),q=(y-j)/Math.sqrt(M);c=B([],h,m,q)}const[r,o,v]=this.unprojectPosition(c);return Number.isFinite(i)?[r,o,v]:Number.isFinite(a)?[r,o,a]:[r,o]}projectPosition(t,e={}){if(e.sourceCrs)return this._projectPositionFromCRS(t,e.sourceCrs);const[a,n,s=0]=t,i=a*x,u=n*x,l=Math.cos(u),c=(s/b+1)*p;return[Math.sin(i)*l*c,-Math.cos(i)*l*c,Math.sin(u)*c]}unprojectPosition(t){const[e,a,n]=t,s=F(t),i=Math.asin(n/s),l=Math.atan2(e,-a)*D,c=i*D,r=(s/p-1)*b;return[l,c,r]}projectFlat(t){return t}unprojectFlat(t){return t}panByPosition(t,e,a){if(!a){const v=this.getZoomAnchorStrength(e);if(v===0)return{longitude:this.longitude,latitude:this.latitude};const h=this.unproject(e),m=U(t[0]-h[0]+180,360)-180,f=this.longitude+m*v,M=Math.max(Math.min(this.latitude+(t[1]-h[1])*v,90),-90);return{longitude:f,latitude:M}}const[n,s,i]=t,l=.25/Math.pow(2,this.zoom-g(this.latitude)),c=n+l*(a[0]-e[0]);let r=s-l*(a[1]-e[1]);r=Math.max(Math.min(r,90),-90);const o={longitude:c,latitude:r,zoom:i-g(s)};return o.zoom+=g(o.latitude),o}};R.displayName="GlobeViewport";let P=R;function A(d,t){const e=X([],t,d);return H(e,e,1/e[3]),e}function Q(d,t,e){const a=d.projectPosition([t[0],t[1],t[2]||0]),n=e.map((r,o)=>r-a[o]),s=d.getDistanceScales([...t]);if(d instanceof P){const r=Math.hypot(...a),o=a.map(M=>M/r),v=Math.hypot(o[0],o[1]),h=v>0?[-o[1]/v,o[0]/v,0]:[1,0,0],m=[o[1]*h[2]-o[2]*h[1],o[2]*h[0]-o[0]*h[2],o[0]*h[1]-o[1]*h[0]],f=M=>M.reduce((N,_,y)=>N+_*n[y],0);return[f(h)/s.unitsPerMeter[0],f(m)/s.unitsPerMeter[1],f(o)/s.unitsPerMeter[2]]}const i=s.unitsPerMeter,{unitsPerMeter2:u=[0,0,0]}=s,l=Math.max(0,i[1]**2+4*u[1]*n[1]),c=2*n[1]/(i[1]+Math.sqrt(l));return[n[0]/(i[0]+u[0]*c),c,n[2]/(i[2]+u[2]*c)]}export{P as G,p as a,Q as g,K as v};

import{a8 as q,a9 as I,aa as Z,k as O,ab as G,ac as A,ad as L,ae as C,x as w,Z as B,af as U,E as X,X as y}from"./deck-example-device-TQPRJnZ6.js";const J={name:"valueNoise",fs:`
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
`},x=Math.PI/180,D=180/Math.PI,g=6370972,_=256,E=.75,F=.35,H=1.15;function Y(d,t){const e=d*x,o=t*x,n=Math.sin(e),a=Math.cos(e),i=Math.sin(o),h=Math.cos(o),r=[a,n,0],c=[-n*i,a*i,h],l=[n*h,-a*h,i];return new O([...r,0,...c,0,...l,0,0,0,0,1])}function k(){const d=_/g,t=Math.PI/180*_;return{unitsPerMeter:[d,d,d],unitsPerWorldUnit:[t,t,d]}}const T=class T extends q{constructor(t={}){const{longitude:e=0,bearing:o=0,pitch:n=0,zoom:a=0,nearZMultiplier:i=.5,farZMultiplier:h=1,resolution:r=10}=t;let{latitude:c=0,height:l,altitude:s=1.5,fovy:u}=t;c=Math.max(Math.min(c,90),-90),l=l||1,u?s=I(u):u=Z(s);const v=Math.max(Math.min(c,y),-y),M=Math.pow(2,a-b(v)),f=n*x,m=t.nearZ??i,N=t.farZ??(s+_*2*M/l/Math.max(Math.cos(f),.1))*h,p=new O().lookAt({eye:[0,-s,0],up:[0,0,1]}).rotateX(-f).rotateY(-o*x).rotateX(c*x).rotateZ(-e*x).scale(M/l);super({...t,height:l,viewMatrix:p,longitude:e,latitude:c,zoom:a,modelMatrix:t.position?Y(e,c):null,distanceScales:k(),fovy:u,focalDistance:s,near:m,far:N}),this.scale=M,this.latitude=c,this.longitude=e,this.bearing=o,this.pitch=n,this.fovy=u,this.resolution=r}get projectionMode(){return G.GLOBE}getDistanceScales(){return this.distanceScales}getBounds(t={}){const e={targetZ:t.z||0},o=this.unproject([0,this.height/2],e),n=this.unproject([this.width/2,0],e),a=this.unproject([this.width,this.height/2],e),i=this.unproject([this.width/2,this.height],e);return a[0]<this.longitude&&(a[0]+=360),o[0]>this.longitude&&(o[0]-=360),[Math.min(o[0],a[0],n[0],i[0]),Math.min(o[1],a[1],n[1],i[1]),Math.max(o[0],a[0],n[0],i[0]),Math.max(o[1],a[1],n[1],i[1])]}_getRayToGlobe(t,{topLeft:e=!0,targetZ:o}={}){const[n,a]=t,i=e?a:this.height-a,{pixelUnprojectionMatrix:h}=this,r=P(h,[n,i,-1,1]),c=P(h,[n,i,1,1]),l=((o||0)/g+1)*_,s=A(L([],r,c)),u=A(r),v=A(c),f=4*((4*u*v-(s-u-v)**2)/16)/s;return{rayStartPosition:r,rayEndPosition:c,radius:l,rayLengthSquared:s,rayStartDistanceSquared:u,distanceToCenterSquared:f}}_getRayDistanceToGlobeCenterRatio(t,e){const{distanceToCenterSquared:o,radius:n}=this._getRayToGlobe(t,e);return Math.sqrt(Math.max(0,o))/n}getZoomAnchorStrength(t){const e=this._getRayDistanceToGlobeCenterRatio(t);return e>H?0:1-Math.max(0,Math.min(1,(e-E)/(1-E)))*(1-F)}unproject(t,{topLeft:e=!0,targetZ:o}={}){const[n,a,i]=t,h=e?a:this.height-a,{pixelUnprojectionMatrix:r}=this;let c;if(Number.isFinite(i))c=P(r,[n,h,i,1]);else{const{rayStartPosition:v,rayEndPosition:M,radius:f,rayLengthSquared:m,rayStartDistanceSquared:N,distanceToCenterSquared:p}=this._getRayToGlobe(t,{topLeft:e,targetZ:o}),S=Math.sqrt(N-p),j=Math.sqrt(Math.max(0,f*f-p)),z=(S-j)/Math.sqrt(m);c=C([],v,M,z)}const[l,s,u]=this.unprojectPosition(c);return Number.isFinite(i)?[l,s,u]:Number.isFinite(o)?[l,s,o]:[l,s]}projectPosition(t){const[e,o,n=0]=t,a=e*x,i=o*x,h=Math.cos(i),r=(n/g+1)*_;return[Math.sin(a)*h*r,-Math.cos(a)*h*r,Math.sin(i)*r]}unprojectPosition(t){const[e,o,n]=t,a=w(t),i=Math.asin(n/a),r=Math.atan2(e,-o)*D,c=i*D,l=(a/_-1)*g;return[r,c,l]}projectFlat(t){return t}unprojectFlat(t){return t}panByPosition(t,e,o){if(!o){const u=this.getZoomAnchorStrength(e);if(u===0)return{longitude:this.longitude,latitude:this.latitude};const v=this.unproject(e),M=B(t[0]-v[0]+180,360)-180,f=this.longitude+M*u,m=Math.max(Math.min(this.latitude+(t[1]-v[1])*u,90),-90);return{longitude:f,latitude:m}}const[n,a,i]=t,r=.25/Math.pow(2,this.zoom-b(this.latitude)),c=n+r*(o[0]-e[0]);let l=a-r*(o[1]-e[1]);l=Math.max(Math.min(l,90),-90);const s={longitude:c,latitude:l,zoom:i-b(a)};return s.zoom+=b(s.latitude),s}};T.displayName="GlobeViewport";let R=T;function b(d,t){t&&(d=Math.max(Math.min(d,y),-y));const e=Math.PI*Math.cos(d*Math.PI/180);return Math.log2(e)}function P(d,t){const e=U([],t,d);return X(e,e,1/e[3]),e}function W(d,t,e){const o=d.projectPosition([t[0],t[1],t[2]||0]),n=e.map((l,s)=>l-o[s]),a=d.getDistanceScales([...t]);if(d instanceof R){const l=Math.hypot(...o),s=o.map(m=>m/l),u=Math.hypot(s[0],s[1]),v=Math.abs(s[2])===1?[1,0,0]:[s[1]/u,-s[0]/u,0],M=[s[1]*v[2]-s[2]*v[1],s[2]*v[0]-s[0]*v[2],s[0]*v[1]-s[1]*v[0]],f=m=>m.reduce((N,p,S)=>N+p*n[S],0);return[-f(v)/a.unitsPerMeter[0],-f(M)/a.unitsPerMeter[1],f(s)/a.unitsPerMeter[2]]}const i=a.unitsPerMeter,{unitsPerMeter2:h=[0,0,0]}=a,r=Math.max(0,i[1]**2+4*h[1]*n[1]),c=2*n[1]/(i[1]+Math.sqrt(r));return[n[0]/(i[0]+h[0]*c),c,n[2]/(i[2]+h[2]*c)]}export{R as G,_ as a,W as g,J as v,b as z};

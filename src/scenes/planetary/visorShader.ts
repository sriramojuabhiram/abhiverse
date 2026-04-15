// Cosmic visor reflection shader
export const visorVertex = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
void main(){
  vUv = uv;
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const visorFragment = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
uniform float uTime;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 R = reflect(-V, N);

  // Cosmic nebula reflection in visor
  float t = uTime * 0.08;
  vec3 rDir = R * 2.0 + t;

  // Multiple nebula layers
  float n1 = snoise(rDir * 1.5) * 0.5 + 0.5;
  float n2 = snoise(rDir * 3.0 + 10.0) * 0.5 + 0.5;
  float n3 = snoise(rDir * 6.0 + 20.0) * 0.5 + 0.5;

  // Vibrant cosmic palette
  vec3 deepPurple = vec3(0.15, 0.02, 0.35);
  vec3 hotPink = vec3(0.95, 0.15, 0.45);
  vec3 cyan = vec3(0.05, 0.85, 0.90);
  vec3 orange = vec3(1.0, 0.55, 0.1);
  vec3 gold = vec3(1.0, 0.85, 0.2);
  vec3 blue = vec3(0.1, 0.3, 0.95);

  vec3 col = deepPurple;
  col = mix(col, hotPink, smoothstep(0.3, 0.6, n1));
  col = mix(col, cyan, smoothstep(0.4, 0.7, n2) * 0.6);
  col = mix(col, orange, smoothstep(0.5, 0.8, n1 * n2) * 0.5);
  col = mix(col, gold, smoothstep(0.6, 0.9, n3) * 0.3);
  col = mix(col, blue, smoothstep(0.2, 0.5, n3) * 0.25);

  // Stars in reflection
  float starField = snoise(R * 30.0);
  float stars = smoothstep(0.88, 0.92, starField) * 1.5;
  col += vec3(stars);

  // Planet mini-reflection
  float planet = smoothstep(0.15, 0.0, length(R.xy - vec2(0.3, -0.2)));
  col = mix(col, vec3(0.1, 0.6, 0.4), planet * 0.6);

  // Fresnel - brighter at edges
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += vec3(0.15, 0.25, 0.5) * fresnel * 0.8;

  // Glossy specular highlight
  vec3 L = normalize(vec3(2.0, 3.0, 4.0));
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 200.0) * 0.9;
  col += vec3(1.0) * spec;

  // Tone map
  col = 1.0 - exp(-col * 1.3);
  col = pow(col, vec3(1.0 / 2.2));

  gl_FragColor = vec4(col, 0.95);
}
`

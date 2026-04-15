export const noiseChunk = /* glsl */ `
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
float fbm(vec3 p,int octaves){
  float v=0.0;float a=0.5;
  for(int i=0;i<8;i++){
    if(i>=octaves)break;
    v+=a*snoise(p);p*=2.0;a*=0.5;
  }
  return v;
}
// Ridged multi-fractal for sharp mountain ridges and cracks
float ridged(vec3 p,int octaves){
  float v=0.0;float a=0.5;float prev=1.0;
  for(int i=0;i<8;i++){
    if(i>=octaves)break;
    float n=1.0-abs(snoise(p));
    n=n*n*prev;
    v+=n*a;
    prev=n;
    p*=2.2;a*=0.5;
  }
  return v;
}
// Domain-warped fbm for turbulent swirls
float warpedFbm(vec3 p,int octaves){
  vec3 q=vec3(fbm(p,3),fbm(p+vec3(5.2,1.3,2.8),3),fbm(p+vec3(1.7,9.2,3.4),3));
  return fbm(p+q*1.5,octaves);
}
`

export const planetVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
uniform float uNoiseScale;
uniform float uTime;
uniform int uType;
${noiseChunk}

float getBump(vec3 p, int type, float ns, float t){
  if(type==0) return fbm(p*ns+t*0.003,6)*0.05+ridged(p*ns*2.0+t*0.002,4)*0.02;
  if(type==1) return fbm(p*ns+t*0.002,5)*0.025;
  if(type==2) return fbm(p*ns*1.5+t*0.001,6)*0.06+ridged(p*ns*3.0+t*0.001,4)*0.03;
  if(type==3) return ridged(p*ns*1.5+t*0.002,6)*0.08+fbm(p*ns*3.0+t*0.001,4)*0.02;
  if(type==4) return fbm(p*ns*0.8+t*0.005,4)*0.02;
  return warpedFbm(p*ns*0.7+t*0.003,5)*0.04;
}

void main(){
  vUv=uv;
  vNormal=normalize(normalMatrix*normal);
  vec3 pos=position;

  float bump=getBump(pos,uType,uNoiseScale,uTime);

  // Analytical-style bump normal via central differences
  float eps=0.002;
  float bx=getBump(pos+vec3(eps,0,0),uType,uNoiseScale,uTime);
  float by=getBump(pos+vec3(0,eps,0),uType,uNoiseScale,uTime);
  float bz=getBump(pos+vec3(0,0,eps),uType,uNoiseScale,uTime);
  vec3 grad=vec3(bx-bump,by-bump,bz-bump)/eps;
  vec3 perturbedNormal=normalize(normal-grad*0.8);

  pos+=normal*bump;
  vPosition=pos;
  vWorldNormal=normalize((modelMatrix*vec4(perturbedNormal,0.0)).xyz);
  vWorldPosition=(modelMatrix*vec4(pos,1.0)).xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
}
`

export const planetFragment = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uNoiseScale;
uniform float uTime;
uniform int uType;
${noiseChunk}

// Contrast boost
vec3 contrastSigmoid(vec3 c, float k){
  return 1.0/(1.0+exp(-k*(c-0.5)));
}

void main(){
  vec3 col;
  float specPower=60.0;
  float specStrength=0.4;
  float ns=uNoiseScale;
  float t=uTime;

  if(uType==0){
    // ── EARTH ──
    // Macro continents
    float n1=fbm(vPosition*ns+t*0.003,7);
    // Ridged mountains
    float ridge=ridged(vPosition*ns*2.5+t*0.001,5);
    // Micro terrain grain
    float micro=snoise(vPosition*ns*12.0+t*0.001)*0.08;

    float elevation=n1+ridge*0.3+micro;
    float coastline=smoothstep(-0.01,0.03,elevation); // razor-sharp coast

    // Deep ocean → shallow → sand → grass → forest → snow
    vec3 deepWater=uColor1*0.7;
    vec3 shallowWater=uColor1*1.2+vec3(0.0,0.08,0.15);
    vec3 sand=vec3(0.76,0.70,0.50);
    vec3 grass=uColor2;
    vec3 forest=uColor2*0.6;
    vec3 mountain=uColor3;
    vec3 snow=vec3(0.92,0.95,0.98);

    float waterDepth=smoothstep(-0.3,0.0,elevation);
    vec3 water=mix(deepWater,shallowWater,waterDepth);

    float landZone=smoothstep(0.03,0.08,elevation);     // sand→grass
    float forestZone=smoothstep(0.15,0.30,elevation);    // grass→forest
    float mountZone=smoothstep(0.35,0.50,elevation);     // forest→mountain
    float snowZone=smoothstep(0.55,0.65,elevation);      // mountain→snow

    vec3 land=mix(sand,grass,landZone);
    land=mix(land,forest,forestZone);
    land=mix(land,mountain,mountZone);
    land=mix(land,snow,snowZone);

    col=mix(water,land,coastline);
    specPower=mix(120.0,25.0,coastline);
    specStrength=mix(1.0,0.2,coastline);

  } else if(uType==1){
    // ── GAS GIANT ──
    // Multiple band frequencies
    float lat=vPosition.y;
    float band1=sin(lat*18.0)*0.5+0.5;
    float band2=sin(lat*42.0+1.5)*0.5+0.5;
    float band3=sin(lat*90.0+3.0)*0.5+0.5;

    // Domain-warped turbulence for swirling storms
    float warp=warpedFbm(vPosition*ns*1.5+t*0.002,6);
    float storm=fbm(vPosition*ns*4.0+vec3(warp*1.5)+t*0.001,5);
    float microDetail=snoise(vPosition*ns*16.0)*0.06;

    float bands=band1*0.5+band2*0.3+band3*0.2;
    col=mix(uColor1,uColor2,bands);
    // Turbulent distortion on bands
    col=mix(col,uColor3,warp*0.35+storm*0.15+0.05);
    // Storm spots
    float spot=smoothstep(0.55,0.70,storm);
    col=mix(col,uColor3*0.7,spot*0.5);
    // Micro grain
    col+=vec3(microDetail);
    specPower=60.0; specStrength=0.35;

  } else if(uType==2){
    // ── ICE ──
    float n1=fbm(vPosition*ns*1.8+t*0.001,7);
    float cracks=ridged(vPosition*ns*4.0+t*0.0005,6);
    float fineCracks=ridged(vPosition*ns*10.0,4)*0.3;
    float micro=snoise(vPosition*ns*20.0)*0.04;

    col=mix(uColor1,uColor2,smoothstep(-0.1,0.15,n1));
    // Crack network — thin bright lines
    float crackLine=smoothstep(0.6,0.75,cracks)+smoothstep(0.5,0.65,fineCracks)*0.5;
    col=mix(col,uColor3*1.3,crackLine*0.7);
    // Subsurface-like glow in cracks
    col+=uColor3*0.15*crackLine;
    col+=vec3(micro);
    specPower=140.0; specStrength=1.0; // ice is glossy

  } else if(uType==3){
    // ── ROCKY ──
    float terrain=ridged(vPosition*ns*2.0+t*0.002,7);
    float erosion=fbm(vPosition*ns*5.0+t*0.001,6);
    float detail=fbm(vPosition*ns*12.0,4)*0.12;
    float grain=snoise(vPosition*ns*25.0)*0.04;

    float elevation=terrain*0.6+erosion*0.4;
    col=mix(uColor1,uColor2,smoothstep(0.15,0.45,elevation));
    col=mix(col,uColor3,smoothstep(0.55,0.80,elevation)*0.7);
    // Dust and micro-detail
    col*=0.88+detail+grain;
    specPower=18.0; specStrength=0.15;

  } else if(uType==4){
    // ── STAR ──
    float n1=warpedFbm(vPosition*ns*0.8+t*0.005,6);
    float granules=snoise(vPosition*ns*8.0+t*0.01)*0.5+0.5;
    float spots=smoothstep(0.6,0.8,fbm(vPosition*ns*2.0+t*0.003,5));
    float micro=snoise(vPosition*ns*20.0+t*0.02)*0.06;

    float pulse=sin(t*0.2)*0.08+0.92;
    col=mix(uColor1,uColor2,n1*0.5+0.5);
    col=mix(col,uColor3,granules*0.3);
    // Dark sunspots
    col*=1.0-spots*0.4;
    col*=pulse;
    col+=vec3(micro*0.5,micro*0.3,0.0);
    // Emissive — special handling below
    specPower=200.0; specStrength=0.8;

  } else {
    // ── NEBULA ──
    float warp=warpedFbm(vPosition*ns*0.6+t*0.003,6);
    float swirl=sin(vPosition.x*5.0+vPosition.y*4.0+t*0.02+warp*3.0)*0.5+0.5;
    float detail=fbm(vPosition*ns*3.0+t*0.002,6);
    float glow=ridged(vPosition*ns*2.0+t*0.001,5);
    float micro=snoise(vPosition*ns*15.0)*0.05;

    col=mix(uColor1,uColor2,swirl);
    col=mix(col,uColor3,detail*0.4+0.2);
    // Energy veins
    float veins=smoothstep(0.6,0.8,glow)*0.6;
    col+=vec3(veins*0.3,veins*0.1,veins*0.5);
    col+=vec3(micro);
    specPower=70.0; specStrength=0.5;
  }

  // ═══ PBR LIGHTING ═══
  vec3 N=normalize(vWorldNormal);
  vec3 V=normalize(cameraPosition-vWorldPosition);
  vec3 L1=normalize(vec3(5.0,3.0,4.0));  // Key (warm)
  vec3 L2=normalize(vec3(-4.0,2.0,-3.0)); // Fill (cool)

  float NdotV=max(dot(N,V),0.0);
  float NdotL1=dot(N,L1);

  // Wrapped diffuse (key)
  float diff1=max(NdotL1*0.65+0.35,0.0);
  // Fill diffuse
  float diff2=max(dot(N,L2)*0.5+0.5,0.0)*0.18;

  // GGX-inspired specular (key light)
  vec3 H1=normalize(L1+V);
  float NdotH1=max(dot(N,H1),0.0);
  float D=pow(NdotH1,specPower);
  // Fresnel-Schlick for specular
  float F=specStrength+(1.0-specStrength)*pow(1.0-max(dot(H1,V),0.0),5.0);
  float spec=D*F;

  // Fill specular (subtle)
  vec3 H2=normalize(L2+V);
  float specFill=pow(max(dot(N,H2),0.0),specPower*0.5)*specStrength*0.12;

  // Rim/Fresnel
  float rim=pow(1.0-NdotV,4.5)*0.2;

  // Star: emissive path
  if(uType==4){
    col=col*1.4+vec3(1.0,0.95,0.8)*spec*0.3;
    // Tone map
    col=1.0-exp(-col*1.2);
    col=pow(col,vec3(1.0/2.2));
    gl_FragColor=vec4(col,1.0);
    return;
  }

  // Composite
  vec3 ambient=col*0.06;
  vec3 keyLight=vec3(1.0,0.96,0.88);
  vec3 fillLight=vec3(0.6,0.75,1.0);
  vec3 lit=col*diff1*keyLight + col*diff2*fillLight
         + keyLight*spec + fillLight*specFill
         + fillLight*rim;
  col=ambient+lit;

  // Contrast enhancement
  col=contrastSigmoid(col,5.0);

  // Filmic tone mapping (ACES approximation)
  col=(col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);

  // Gamma
  col=pow(clamp(col,0.0,1.0),vec3(1.0/2.2));

  gl_FragColor=vec4(col,1.0);
}
`

export const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main(){
  vNormal=normalize(normalMatrix*normal);
  vec4 wp=modelMatrix*vec4(position,1.0);
  vWorldPosition=wp.xyz;
  gl_Position=projectionMatrix*viewMatrix*wp;
}
`

export const atmosphereFragment = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPosition;
uniform vec3 uAtmosphereColor;
void main(){
  vec3 viewDir=normalize(cameraPosition-vWorldPosition);
  float rim=1.0-max(dot(viewDir,vNormal),0.0);
  // Tight, physically-motivated atmosphere — steep power falloff
  float scatter=pow(rim,5.0)*0.9;    // thin bright edge
  float haze=pow(rim,2.0)*0.08;      // very subtle inner haze
  float intensity=scatter+haze;
  // Slight color shift at edge (Rayleigh-like blue shift)
  vec3 edgeColor=mix(uAtmosphereColor,uAtmosphereColor*vec3(0.7,0.85,1.2),rim);
  gl_FragColor=vec4(edgeColor,intensity*0.4);
}
`

export const cloudVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
void main(){
  vUv=uv;
  vPosition=position;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`

export const cloudFragment = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
${noiseChunk}
void main(){
  float n=fbm(vPosition*3.5+uTime*0.008,5);
  float n2=fbm(vPosition*7.0+uTime*0.004,3)*0.3;
  float alpha=smoothstep(0.08,0.45,n+n2)*0.3;
  // soft edge feather
  float edge=smoothstep(0.0,0.15,n)*smoothstep(0.7,0.5,n);
  alpha*=edge*0.8+0.2;
  gl_FragColor=vec4(vec3(0.95,0.97,1.0),alpha);
}
`

export const ringVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`

export const ringFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uRingColor;
uniform float uTime;
void main(){
  float dist=length(vUv-0.5)*2.0;
  float ring=smoothstep(0.3,0.35,dist)*smoothstep(1.0,0.9,dist);
  float bands=sin(dist*40.0)*0.3+0.7;
  float alpha=ring*bands*0.7;
  gl_FragColor=vec4(uRingColor,alpha);
}
`

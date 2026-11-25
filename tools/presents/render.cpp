// A small path tracer, to render the gift box and the presents inside it.
//   render WHAT WIDTH HEIGHT SPP A B out.raw  [show] [leave out, or -] [only shadows]
//   → RGBA 8-bit, straight alpha. The last three are layers (LAY in scenes.h), as digits (then a, b…).
//   WHAT is one of the things in scenes.h (see scene()); A and B are numbers it may
//   use, in degrees: which one, how far folded…
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cstdint>
#include <vector>
#include <thread>
#include <atomic>
#include <algorithm>
#include <functional>
using std::vector; typedef float F;
struct V{F x,y,z; V(F a=0):x(a),y(a),z(a){} V(F a,F b,F c):x(a),y(b),z(c){}};
static inline V operator+(V a,V b){return{a.x+b.x,a.y+b.y,a.z+b.z};} static inline V operator-(V a,V b){return{a.x-b.x,a.y-b.y,a.z-b.z};}
static inline V operator*(V a,V b){return{a.x*b.x,a.y*b.y,a.z*b.z};} static inline V operator*(V a,F s){return{a.x*s,a.y*s,a.z*s};}
static inline V operator-(V a){return{-a.x,-a.y,-a.z};}
static inline F dot(V a,V b){return a.x*b.x+a.y*b.y+a.z*b.z;} static inline V cross(V a,V b){return{a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x};}
static inline F len(V a){return sqrtf(dot(a,a));} static inline V norm(V a){F l=len(a);return l>0?a*(1/l):a;}
static inline V mix(V a,V b,F t){return a*(1-t)+b*t;} static inline F clampf(F x,F a,F b){return x<a?a:x>b?b:x;}
static inline F smooth(F a,F b,F x){F t=clampf((x-a)/(b-a),0,1);return t*t*(3-2*t);}
static V hex(int h){auto c=[](int v){F s=v/255.f;return s<=.04045f?s/12.92f:powf((s+.055f)/1.055f,2.4f);};return{c(h>>16&255),c(h>>8&255),c(h&255)};}
struct Rng{uint64_t s;Rng(uint64_t a):s(a*0x9E3779B97F4A7C15ull+1){for(int i=0;i<4;i++)u();}uint32_t u(){s^=s>>12;s^=s<<25;s^=s>>27;return (s*2685821657736338717ull)>>32;}F f(){return (u()>>8)*(1.f/16777216.f);}};
enum{DIFF,VELVET,PETAL,LEAF,GOLD,GLASS,SATIN,SILK,FOIL};
struct Tri{V a,e1,e2,n[3],c[3];int m,lay;};
vector<Tri> T;int LAY=0;// which layer is being modelled
static int SHOW[32],HIDE[32]={0},GHOST[32]={0};
static int layerOf(char c){return c>='a'?c-'a'+10:c-'0';}// 0-9, then a, b, c…
// ── meshes ──
struct M4{V x{1,0,0},y{0,1,0},z{0,0,1},o{0,0,0};V p(V v)const{return x*v.x+y*v.y+z*v.z+o;}V d(V v)const{return x*v.x+y*v.y+z*v.z;}};
static M4 mul(const M4&a,const M4&b){M4 r;r.x=a.d(b.x);r.y=a.d(b.y);r.z=a.d(b.z);r.o=a.p(b.o);return r;}
static M4 rotY(F t){M4 m;m.x={cosf(t),0,-sinf(t)};m.z={sinf(t),0,cosf(t)};return m;}
static M4 rotX(F t){M4 m;m.y={0,cosf(t),sinf(t)};m.z={0,-sinf(t),cosf(t)};return m;}
static M4 rotZ(F t){M4 m;m.x={cosf(t),sinf(t),0};m.y={-sinf(t),cosf(t),0};return m;}
static M4 trans(V o){M4 m;m.o=o;return m;} static M4 scale(F s){M4 m;m.x={s,0,0};m.y={0,s,0};m.z={0,0,s};return m;}
static M4 alongZ(V dir,F spin){V z=norm(dir);V up=fabsf(z.y)<.95f?V(0,1,0):V(1,0,0);V x=norm(cross(up,z)),y=cross(z,x);M4 m;m.x=x*cosf(spin)+y*sinf(spin);m.y=y*cosf(spin)-x*sinf(spin);m.z=z;return m;}
static void tri(V a,V b,V c,V na,V nb,V nc,V ca,V cb,V cc,int m){Tri t;t.a=a;t.e1=b-a;t.e2=c-a;t.n[0]=na;t.n[1]=nb;t.n[2]=nc;t.c[0]=ca;t.c[1]=cb;t.c[2]=cc;t.m=m;t.lay=LAY;if(HIDE[LAY])return;if(len(cross(t.e1,t.e2))>1e-12f)T.push_back(t);}
static void flat(V a,V b,V c,V col,int m){V n=norm(cross(b-a,c-a));tri(a,b,c,n,n,n,col,col,col,m);}
// a grid surface: f(u,v) → point, col(u,v), smooth normals
static void grid(int nu,int nv,const M4&M,std::function<V(F,F)>f,std::function<V(F,F)>col,int m){
  vector<V>P((nu+1)*(nv+1)),N((nu+1)*(nv+1)),C((nu+1)*(nv+1));
  for(int j=0;j<=nv;j++)for(int i=0;i<=nu;i++){P[j*(nu+1)+i]=M.p(f((F)i/nu,(F)j/nv));C[j*(nu+1)+i]=col((F)i/nu,(F)j/nv);}
  for(int j=0;j<nv;j++)for(int i=0;i<nu;i++){int a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;V n1=cross(P[b]-P[a],P[d]-P[a]),n2=cross(P[d]-P[a],P[c]-P[a]);N[a]=N[a]+n1+n2;N[b]=N[b]+n1;N[d]=N[d]+n1+n2;N[c]=N[c]+n2;}
  for(auto&n:N)n=norm(n);
  for(int j=0;j<nv;j++)for(int i=0;i<nu;i++){int a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;tri(P[a],P[b],P[d],N[a],N[b],N[d],C[a],C[b],C[d],m);tri(P[a],P[d],P[c],N[a],N[d],N[c],C[a],C[d],C[c],m);}
}
static F n1(F x){return sinf(x*1.3f)+.5f*sinf(x*2.7f+1)+.25f*sinf(x*6.1f+2);}
static void sphere(V o,F r,V col,int m,int nu=20,int nv=12,V sc=V(1)){grid(nu,nv,trans(o),[=](F u,F v){F a=u*2*M_PI,b=v*M_PI;return V(r*sc.x*sinf(b)*cosf(a),r*sc.y*cosf(b),r*sc.z*sinf(b)*sinf(a));},[=](F,F){return col;},m);}
static void capsule(V a,V b,F r0,F r1,V col,int m){M4 M=alongZ(b-a,0);M.o=a;F L=len(b-a);grid(14,10,M,[=](F u,F v){F t=u*2*M_PI,s=v*L,r=r0+(r1-r0)*v;if(v>.8f)r*=sqrtf(fmaxf(0,1-powf((v-.8f)/.2f,2)));return V(r*cosf(t),r*sinf(t),s);},[=](F,F){return col;},m);}
// rounded box shell; keep(n) says which faces to keep
static void rbox(const M4&M,V h,F r,V col,int m,std::function<bool(V)>keep,bool flip=false,int seg=26){
  for(int f=0;f<6;f++){int ax=f/2;F s=f%2?1:-1;
    auto pt=[&](F u,F v,V&nn){F a[3];a[ax]=s;a[(ax+1)%3]=u*2-1;a[(ax+2)%3]=v*2-1;V c(a[0]*h.x,a[1]*h.y,a[2]*h.z);V q(clampf(c.x,-h.x+r,h.x-r),clampf(c.y,-h.y+r,h.y-r),clampf(c.z,-h.z+r,h.z-r));V d=c-q;d=len(d)>1e-6f?norm(d):V(ax==0?s:0,ax==1?s:0,ax==2?s:0);nn=d;return q+d*r;};
    auto w=[&](F t){// more points near the edges
      return .5f-.5f*cosf(t*M_PI);};
    for(int i=0;i<seg;i++)for(int j=0;j<seg;j++){V n[4],p[4];F u0=w((F)i/seg),u1=w((F)(i+1)/seg),v0=w((F)j/seg),v1=w((F)(j+1)/seg);
      p[0]=pt(u0,v0,n[0]);p[1]=pt(u1,v0,n[1]);p[2]=pt(u1,v1,n[2]);p[3]=pt(u0,v1,n[3]);
      if(!keep((n[0]+n[2])*.5f))continue;
      for(int k=0;k<4;k++){p[k]=M.p(p[k]);n[k]=M.d(n[k])*(flip?-1:1);}
      tri(p[0],p[1],p[2],n[0],n[1],n[2],col,col,col,m);tri(p[0],p[2],p[3],n[0],n[2],n[3],col,col,col,m);}}
}
// ── BVH ──
struct Box{V lo{1e9f},hi{-1e9f};void add(V p){lo={fminf(lo.x,p.x),fminf(lo.y,p.y),fminf(lo.z,p.z)};hi={fmaxf(hi.x,p.x),fmaxf(hi.y,p.y),fmaxf(hi.z,p.z)};}void add(const Box&b){add(b.lo);add(b.hi);}F area()const{V d=hi-lo;return d.x<0?0:2*(d.x*d.y+d.y*d.z+d.z*d.x);}};
struct Node{Box b;int l,r,s,n;};vector<Node>B;
static F comp(V v,int a){return a==0?v.x:a==1?v.y:v.z;}
static int build(int s,int n){Node nd;nd.l=nd.r=-1;nd.s=s;nd.n=n;Box cb;for(int i=s;i<s+n;i++){Tri&t=T[i];nd.b.add(t.a);nd.b.add(t.a+t.e1);nd.b.add(t.a+t.e2);cb.add(t.a+(t.e1+t.e2)*(1/3.f));}
  int id=B.size();B.push_back(nd);if(n<=4)return id;int best=-1,bs=0;F bc=1e30f;const int K=16;V ex=cb.hi-cb.lo;
  for(int ax=0;ax<3;ax++){F e=comp(ex,ax);if(e<1e-7f)continue;Box bb[K];int cnt[K]={0};F lo=comp(cb.lo,ax);
    for(int i=s;i<s+n;i++){Tri&t=T[i];int k=std::min(K-1,(int)((comp(t.a+(t.e1+t.e2)*(1/3.f),ax)-lo)/e*K));cnt[k]++;bb[k].add(t.a);bb[k].add(t.a+t.e1);bb[k].add(t.a+t.e2);}
    for(int k=1;k<K;k++){Box l,r;int nl=0,nr=0;for(int q=0;q<k;q++)if(cnt[q]){l.add(bb[q]);nl+=cnt[q];}for(int q=k;q<K;q++)if(cnt[q]){r.add(bb[q]);nr+=cnt[q];}if(!nl||!nr)continue;F c=l.area()*nl+r.area()*nr;if(c<bc){bc=c;best=ax;bs=k;}}}
  if(best<0)return id;F lo=comp(cb.lo,best),e=comp(ex,best);auto it=std::partition(T.begin()+s,T.begin()+s+n,[&](Tri&t){return std::min(K-1,(int)((comp(t.a+(t.e1+t.e2)*(1/3.f),best)-lo)/e*K))<bs;});int nl=it-(T.begin()+s);
  if(nl==0||nl==n)return id;int l=build(s,nl);int r=build(s+nl,n-nl);B[id].l=l;B[id].r=r;return id;}
struct Hit{F t=1e9f,u,v;int i=-1;};
static bool slab(const Box&b,V o,V id,F tm,F&tn){F t0=(b.lo.x-o.x)*id.x,t1=(b.hi.x-o.x)*id.x;F a=fminf(t0,t1),c=fmaxf(t0,t1);t0=(b.lo.y-o.y)*id.y;t1=(b.hi.y-o.y)*id.y;a=fmaxf(a,fminf(t0,t1));c=fminf(c,fmaxf(t0,t1));t0=(b.lo.z-o.z)*id.z;t1=(b.hi.z-o.z)*id.z;a=fmaxf(a,fminf(t0,t1));c=fminf(c,fmaxf(t0,t1));tn=a;return c>=fmaxf(a,0)&&a<tm;}
static bool trace(V o,V d,Hit&h,bool any=false,F maxt=1e9f){h.t=maxt;V id(1/d.x,1/d.y,1/d.z);int st[96],sp=0;st[sp++]=0;F tn;while(sp){Node&n=B[st[--sp]];if(!slab(n.b,o,id,h.t,tn))continue;
  if(n.l<0){for(int i=n.s;i<n.s+n.n;i++){Tri&t=T[i];V p=cross(d,t.e2);F det=dot(t.e1,p);if(fabsf(det)<1e-12f)continue;F inv=1/det;V s=o-t.a;F u=dot(s,p)*inv;if(u<0||u>1)continue;V q=cross(s,t.e1);F v=dot(d,q)*inv;if(v<0||u+v>1)continue;F tt=dot(t.e2,q)*inv;if(tt>1e-4f&&tt<h.t){if(any&&t.m==GLASS)continue;h.t=tt;h.u=u;h.v=v;h.i=i;if(any)return true;}}}
  else{F a,b;bool ha=slab(B[n.l].b,o,id,h.t,a),hb=slab(B[n.r].b,o,id,h.t,b);if(ha&&hb){if(a<b){st[sp++]=n.r;st[sp++]=n.l;}else{st[sp++]=n.l;st[sp++]=n.r;}}else if(ha)st[sp++]=n.l;else if(hb)st[sp++]=n.r;}}
  return h.i>=0;}
// ── light ──
struct Light{V d;F c;V L;F p;};vector<Light>Ls;
static void light(V dir,F deg,V L){Ls.push_back({norm(dir),cosf(deg*M_PI/180),L,0});}
static V AMB_T,AMB_B;
static V env(V d){V c=mix(AMB_B,AMB_T,smooth(-.6f,.8f,d.y));for(auto&l:Ls)if(dot(d,l.d)>l.c)c=c+l.L;return c;}
static F envPdf(V d){F p=0;for(auto&l:Ls)if(dot(d,l.d)>l.c)p+=l.p/(2*M_PI*(1-l.c));return p;}
static V onb(V n,F x,F y,F z){F s=n.z<0?-1:1,a=-1/(s+n.z),b=n.x*n.y*a;V t(1+s*n.x*n.x*a,s*b,-s*n.x),u(b,s+n.y*n.y*a,-n.y);return t*x+u*y+n*z;}
static V sampleLight(Rng&r,F&pdf){F x=r.f();size_t i=0;while(i+1<Ls.size()&&x>Ls[i].p){x-=Ls[i].p;i++;}F z=1-r.f()*(1-Ls[i].c),ph=2*M_PI*r.f(),s=sqrtf(fmaxf(0,1-z*z));V d=onb(Ls[i].d,s*cosf(ph),s*sinf(ph),z);pdf=envPdf(d);return d;}
struct Mat{F rough,spec;F trans;F sheen;};
static Mat mats(int m){switch(m){case PETAL:return{.5f,.022f,.34f,.12f};case LEAF:return{.38f,.04f,.22f,0};case VELVET:return{1,0,0,.42f};case SATIN:return{.34f,.045f,0,.1f};case SILK:return{.3f,.07f,0,.15f};case GOLD:return{.09f,1,0,0};case FOIL:return{.34f,1,0,0};default:return{1,0,0,0};}}
static F ggxD(F nh,F a){F a2=a*a,d=nh*nh*(a2-1)+1;return a2/(M_PI*d*d);}
static F smithG(F nv,F nl,F a){F k=a*a;auto g=[&](F c){return 2*c/(c+sqrtf(k+(1-k)*c*c));};return g(nv)*g(nl);}
static V fres(V f0,F c){F p=powf(1-clampf(c,0,1),5);return f0+(V(1)-f0)*p;}
// bsdf·cos and pdf for non-delta
static V evalB(int m,V alb,V n,V wo,V wi,F&pdf){Mat t=mats(m);F nl=dot(n,wi),nv=fmaxf(.02f,dot(n,wo));pdf=0;
  if(m==GOLD||m==FOIL){if(nl<=0)return 0;V h=norm(wo+wi);F nh=fmaxf(0,dot(n,h)),vh=fmaxf(1e-3f,dot(wo,h)),a=t.rough*t.rough+.004f,D=ggxD(nh,a);pdf=D*nh/(4*vh);return fres(alb,vh)*(D*smithG(nv,nl,a)/(4*nv));}
  F pt=t.trans,ps=t.spec>0?.18f:0;
  if(nl<=0){if(pt<=0)return 0;pdf=(1-ps)*pt*(-nl)/M_PI;return alb*(pt*(-nl)/M_PI);}
  V f=alb*((1-pt)*nl/M_PI);pdf=(1-ps)*(1-pt)*nl/M_PI;
  if(t.sheen>0){F e=powf(1-nv,3.2f);f=f+mix(alb,V(1),.35f)*(t.sheen*e*nl/M_PI);}
  if(t.spec>0){V h=norm(wo+wi);F nh=fmaxf(0,dot(n,h)),vh=fmaxf(1e-3f,dot(wo,h)),a=t.rough*t.rough,D=ggxD(nh,a);F fr=t.spec+(1-t.spec)*powf(1-vh,5)*.6f;f=f+V(fr*D*smithG(nv,nl,a)/(4*nv));pdf+=ps*D*nh/(4*vh);}
  return f;}
static V sampleB(int m,V n,V wo,Rng&r){Mat t=mats(m);F ps=(m==GOLD||m==FOIL)?1:(t.spec>0?.18f:0);F x=r.f();F u=r.f(),ph=2*M_PI*r.f();
  if(x<ps){F a=(m==GOLD||m==FOIL)?t.rough*t.rough+.004f:t.rough*t.rough;F c=sqrtf((1-u)/(1+(a*a-1)*u)),s=sqrtf(fmaxf(0,1-c*c));V h=onb(n,s*cosf(ph),s*sinf(ph),c);return h*(2*dot(wo,h))-wo;}
  F z=sqrtf(1-u),s=sqrtf(u);V d=onb(n,s*cosf(ph),s*sinf(ph),z);if(t.trans>0&&r.f()<t.trans)d=d-n*(2*dot(d,n));return d;}
static V radiance(V o,V d,Rng&r,F&alpha){V L(0),th(1);alpha=1;F lastPdf=-1;int chan=-1;
  for(int b=0;b<14;b++){Hit h;if(!trace(o,d,h)){if(b==0){alpha=0;return 0;}V e=env(d);if(lastPdf>0){F lp=envPdf(d);e=e*(lastPdf*lastPdf/(lastPdf*lastPdf+lp*lp));}V c=th*e;F mx=fmaxf(c.x,fmaxf(c.y,c.z));F cap=b<=1?60:14;if(mx>cap)c=c*(cap/mx);L=L+c;break;}
    Tri&t=T[h.i];if(b==0&&GHOST[t.lay]){o=o+d*(h.t+1e-3f);b--;continue;}if(b==0&&!SHOW[t.lay]){alpha=0;return 0;}F w=1-h.u-h.v;V p=o+d*h.t,ng=norm(cross(t.e1,t.e2)),n=norm(t.n[0]*w+t.n[1]*h.u+t.n[2]*h.v),alb=t.c[0]*w+t.c[1]*h.u+t.c[2]*h.v;
    if(t.m==GLASS){// refract, a little apart for each colour
      if(chan<0){chan=(int)(r.f()*3)%3;V mk(chan==0?3:0,chan==1?3:0,chan==2?3:0);th=th*mk;}
      F ior=2.42f+(chan-1)*.035f;bool in=dot(d,ng)<0;V nn=in?ng:-ng;F e=in?1/ior:ior,c=-dot(d,nn),k=1-e*e*(1-c*c);F R=1;if(k>0){F ct=sqrtf(k),a=in?c:ct;F r0=powf((ior-1)/(ior+1),2);R=r0+(1-r0)*powf(1-a,5);}
      if(r.f()<R)d=d+nn*(2*c);else d=norm(d*e+nn*(e*c-sqrtf(k)));o=p+d*2e-4f;lastPdf=-1;if(b>9&&r.f()<.2f)break;continue;}
    if(dot(ng,d)>0)ng=-ng;if(dot(n,ng)<0)n=-n;V wo=-d;if(dot(n,wo)<.01f)n=norm(n+wo*(.02f-dot(n,wo)));
    {F pl;V wi=sampleLight(r,pl);F pb;V f=evalB(t.m,alb,n,wo,wi,pb);if(pl>0&&(f.x+f.y+f.z)>0){Hit s;V so=p+(dot(wi,ng)>0?ng:-ng)*3e-4f;if(!trace(so,wi,s,true)){V li(0);for(auto&l:Ls)if(dot(wi,l.d)>l.c)li=li+l.L;V c=th*f*li*(1/pl)*(pl*pl/(pl*pl+pb*pb));F mx=fmaxf(c.x,fmaxf(c.y,c.z));if(mx>30)c=c*(30/mx);L=L+c;}}}
    V wi=sampleB(t.m,n,wo,r);F pb;V f=evalB(t.m,alb,n,wo,wi,pb);if(pb<=1e-6f)break;th=th*f*(1/pb);o=p+(dot(wi,ng)>0?ng:-ng)*3e-4f;d=wi;lastPdf=pb;
    if(b>2){F q=fminf(.95f,fmaxf(th.x,fmaxf(th.y,th.z)));if(r.f()>q)break;th=th*(1/q);}}
  return L;}
#include "scenes.h"
int main(int c,char**v){int W=atoi(v[2]),H=atoi(v[3]),S=atoi(v[4]);F turn=atof(v[5])*M_PI/180,lid=atof(v[6])*M_PI/180;// argv[8]: layers to show, argv[9]: layers left out altogether
  for(int i=0;i<32;i++)SHOW[i]=c<=8;if(c>8)for(char*q=v[8];*q;q++)SHOW[layerOf(*q)]=1;if(c>9)for(char*q=v[9];*q;q++)if(*q!='-')HIDE[layerOf(*q)]=1;
  if(c>10)for(char*q=v[10];*q;q++)GHOST[layerOf(*q)]=1;// cast shadows, but aren't seen
  Cam cam=scene(v[1],turn,lid);
  F tot=0;for(auto&l:Ls){l.p=(l.L.x+l.L.y+l.L.z)*(1-l.c);tot+=l.p;}for(auto&l:Ls)l.p/=tot;
  B.reserve(T.size()*2);build(0,T.size());fprintf(stderr,"%zu tris\n",T.size());
  V fw=norm(cam.at-cam.from),rt=norm(cross(fw,V(0,1,0))),up=cross(rt,fw);F th=tanf(cam.fov*M_PI/360);
  // REGION=x,y,w,h in the environment: only that part of the picture (it may reach outside it)
  int X0=0,Y0=0,RW=W,RH=H;if(char*e=getenv("REGION"))sscanf(e,"%d,%d,%d,%d",&X0,&Y0,&RW,&RH);
  vector<F>A(RW*RH*4);std::atomic<int>row{0};vector<std::thread>ts;
  for(unsigned k=0;k<std::thread::hardware_concurrency();k++)ts.emplace_back([&]{for(int y;(y=row++)<RH;)for(int x=0;x<RW;x++){Rng r((uint64_t)y*RW+x+77);V sum(0);F al=0;for(int s=0;s<S;s++){F px=(x+X0+r.f())/W*2-1,py=1-(y+Y0+r.f())/H*2;V d=norm(fw+rt*(px*th*W/H)+up*(py*th));F a;V L=radiance(cam.from,d,r,a);if(L.x==L.x&&L.y==L.y&&L.z==L.z){sum=sum+L;al+=a;}}
      F*q=&A[(y*RW+x)*4];q[0]=sum.x/S;q[1]=sum.y/S;q[2]=sum.z/S;q[3]=al/S;}});
  for(auto&t:ts)t.join();
  FILE*f=fopen(v[7],"wb");for(int i=0;i<RW*RH;i++){F*q=&A[i*4];F a=q[3];unsigned char o[4]={0,0,0,(unsigned char)(a*255+.5f)};if(a>0)for(int k=0;k<3;k++){F x=q[k]/a*cam.exposure;x=(x*(2.51f*x+.03f))/(x*(2.43f*x+.59f)+.14f);x=clampf(x,0,1);x=x<=.0031308f?12.92f*x:1.055f*powf(x,1/2.4f)-.055f;o[k]=x*255+.5f;}fwrite(o,1,4,f);}fclose(f);}

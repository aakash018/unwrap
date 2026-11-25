// What render.cpp can draw: the roses, a stem, the gift box, a petal.

struct Cam{V from,at;F fov,exposure;};
static V tint(V c,F k){return c*k;}
// ── a rose (Paul Nylander's parametric rose) ──
static void rose(const M4&M,int kind,F seed,F open){
  static const int PAL[4][4]={{0x1d0208,0x5a0819,0x860f27,0xa82a40},{0x150107,0x43051a,0x6a0a22,0x8e1f38},{0x6e2c38,0xb8717a,0xd29a9b,0xe6bdb8},{0x806248,0xc8ae94,0xdcc7b0,0xeddccb}};
  V c0=hex(PAL[kind][0]),c1=hex(PAL[kind][1]),c2=hex(PAL[kind][2]),c3=hex(PAL[kind][3]);
  auto parts=[=](F u,F v,F&r,F&z,F&th){th=-2*M_PI+u*17*M_PI;F phi=(M_PI/2)*expf(-th/(8*M_PI*open));F md=fmodf(3.6f*th+40*M_PI,2*M_PI)/M_PI;F X=1-.5f*powf(1.25f*(1-md)*(1-md)-.25f,2);F x=v;F y=1.95653f*x*x*powf(1.27689f*x-1,2)*sinf(phi);r=X*(x*sinf(phi)+y*cosf(phi));z=X*(x*cosf(phi)-y*sinf(phi));
    F rim=smooth(.72f,1,v);z+=rim*.03f*n1(th*2.2f+seed*7)*(.5f+phi);r+=rim*.022f*n1(th*1.7f+seed*3+2);};
  grid(1150,26,M,[=](F u,F v){F r,z,th;parts(u,.02f+.98f*v,r,z,th);return V(r*sinf(th),r*cosf(th),z);},
    [=](F u,F v){F th=u*17*M_PI;V c=v<.45f?mix(c0,c1,smooth(0,.45f,v)):mix(c1,c2,smooth(.45f,.85f,v));c=mix(c,c3,smooth(.86f,1,v)*.75f);F vein=.94f+.06f*sinf(th*38+seed*5);F age=1-.18f*smooth(.75f,1,1-u);return c*vein*age;},PETAL);
}
static void leafMesh(const M4&M,F L,F W,F curl,V c,F seed){
  grid(30,16,M,[=](F u,F v){F s=v*2-1;F w=W*powf(sinf(M_PI*powf(u,.8f)),.85f)*(1+.07f*sinf(u*46));F x=s*w;F z=-curl*u*u*L+fabsf(s)*w*.35f+.03f*L*sinf(u*9+seed)*s;F rib=.02f*L*sinf((u*13-fabsf(s)*2.2f)*M_PI*2)*.35f*(1-fabsf(s));return V(x,u*L,z+rib);},
    [=](F u,F v){F s=fabsf(v*2-1);V k=mix(c*1.45f,c,smooth(0,.10f,s));F side=fabsf(sinf((u*13-s*2.2f)*M_PI));return k*(.82f+.18f*side);},LEAF);
}
static void lightsWarm(){
  AMB_T=V(.12f,.10f,.17f);AMB_B=V(.10f,.055f,.06f);
  light(V(-.7f,1.0f,.55f),22,V(8.6f,6.8f,5.0f));   // key: warm, high on the left
  light(V(1,.35f,-.55f),16,V(6.5f,5.0f,8.5f));      // rim: moonlight from behind, right
  light(V(-1,.25f,-.7f),13,V(7.5f,4.6f,3.0f));      // rim: lanterns behind, left
  light(V(.5f,.2f,1),18,V(.55f,.42f,.42f));         // a little fill
  light(V(.1f,-1,.5f),26,V(1.3f,.75f,.38f));        // the box's own glow, from below
}
static Cam roses(F turn){
  lightsWarm();Rng r(21);M4 R=rotY(turn);
  // the dome of roses
  struct P{V d;F s;int k;};vector<P>ps;
  auto put=[&](F el,F az,F s,int k){F e=el*M_PI/180,a=az*M_PI/180;ps.push_back({V(cosf(e)*sinf(a),sinf(e),cosf(e)*cosf(a)),s,k});};
  put(86,0,.70f,0);
  for(int i=0;i<6;i++)put(50+(i%2)*4,18+i*60,.68f,(int[]){0,2,0,1,0,3}[i]);
  for(int i=0;i<11;i++)put(16+(i%2)*6,4+i*32.7f,.66f,(int[]){1,0,0,3,0,1,2,0,1,0,2}[i]);
  for(int i=0;i<13;i++)put(-12,14+i*27.7f,.6f,(int[]){0,1,0}[i%3]);
  // the roses in front can each be picked: a layer of their own (2, 3 … b), back to front
  int PICK[10]={2,5,0,1,6,9,16,8,17,7};
  int n=0;for(auto&p:ps){LAY=1;for(int k=0;k<10;k++)if(PICK[k]==n)LAY=2+k;V d=norm(p.d+V((r.f()-.5f)*.13f,(r.f()-.5f)*.1f,(r.f()-.5f)*.13f));V dir=norm(d+V(0,.16f,.06f));M4 M=mul(trans(V(d.x*1.16f,d.y*.94f,d.z*1.16f)),mul(alongZ(dir,r.f()*6.28f),scale(p.s*(.95f+r.f()*.12f))));rose(mul(R,M),p.k,n++*1.7f,.86f+r.f()*.2f);}
  // moss inside, leaves between, and out round the edge
  LAY=1;sphere(V(0,-.1f,0),.86f,hex(0x16241a),LEAF,40,24);
  V g[3]={hex(0x2c4a31),hex(0x3f6343),hex(0x22402b)};
  for(int i=0;i<39;i++){F el=(i<36?-16+r.f()*30:34+r.f()*40)*M_PI/180,az=r.f()*6.28f;V d(cosf(el)*sinf(az),sinf(el),cosf(el)*cosf(az));F L=.82f+r.f()*.3f;
    // the leaf's length lies out along d, its face turned up
    V y=norm(d+V(0,.25f,0)),x=norm(cross(V(0,1,0.01f),y)),z=cross(x,y);F sp=(r.f()-.5f)*1.2f;M4 M;M.x=x*cosf(sp)+z*sinf(sp);M.z=z*cosf(sp)-x*sinf(sp);M.y=y;F q=i<36?1.02f:.5f;M.o=V(d.x*q,d.y*q,d.z*q);leafMesh(mul(R,M),L,L*.27f,.25f+r.f()*.25f,g[i%3],i);}
  return{V(0,2.6f,9.6f),V(0,.21f,0),17.7f,.95f};
}
// ── a rose's stem, for when it's picked ──
static Cam stem(){
  lightsWarm();V g=hex(0x3f6343);
  grid(16,120,M4(),[=](F u,F v){F a=u*2*M_PI,y=1-v*4.4f;F r=.052f+.008f*sinf(v*37);return V(.07f*sinf(v*5)+r*cosf(a),y,r*sinf(a));},[=](F,F v){return mix(hex(0x5d7f4a),g,v);},LEAF);
  for(int i=0;i<5;i++){F y=.5f-i*.72f,s=i%2?1:-1;V o(.07f*sinf((1-y)/4.4f*5),y,.03f);capsule(o,o+V(s*.11f,.05f,.03f),.022f,.002f,hex(0x6b5a3a),LEAF);}
  for(int s=-1;s<=1;s+=2){M4 M=mul(trans(V(.05f*s,s>0?-.2f:-1.05f,.04f)),mul(rotZ(s>0?-1.0f:1.05f),rotX(.25f)));leafMesh(M,.95f,.27f,.3f,hex(0x3a5c3f),s);}
  return{V(0,-1.2f,14),V(0,-1.2f,0),18.4f,.95f};
}
// ── the gift box ── (L = which part a triangle belongs to, see LAYER in pt.cpp)
extern int LAY;
#include "ribbon.h"
static F CREASE=1;
static F q2(F u){return u*2*M_PI;}
static void strip(const M4&M,std::function<V(F)>c,std::function<V(F)>side,std::function<F(F)>w,V col,int n=160){
  grid(n,10,M,[=](F u,F v){F s=v*2-1;V a=c(u),sd=norm(side(u));F cup=w(u)*.05f*sinf(s*4.2f+sinf(u*31)*1.1f)*sinf(u*M_PI)*CREASE;V tn=norm(c(fminf(1,u+.004f))-c(fmaxf(0,u-.004f)));return a+sd*(s*w(u))+cross(tn,sd)*cup;},[=](F,F){return col;},SILK);}
// UNTIE: seconds since the ribbon was pulled. LIDQ: how far open the lid is
static F UNTIE=0,LIDQ=0;
// where the lid is as it opens: q from 0 (shut) to 1
static M4 lidPose(F q,F ly,F lh,F ld){
  if(q<=0)return M4();
  // turned about the bottom of its back edge
  F e=q;V hinge(0,ly,-ld);F lift=.40f*smooth(0,.4f,e)-.24f*smooth(.5f,1,e),tilt=-1.82f*(e<1?smooth(.06f,1,e):1+(e-1)*.9f),back=-.16f*smooth(.2f,.9f,e);
  return mul(trans(hinge+V(0,lift,back)),mul(rotX(tilt),trans(-hinge)));
}
static Cam giftBox(){
  AMB_T=V(.20f,.18f,.24f);AMB_B=V(.14f,.09f,.08f);
  light(V(-.8f,.95f,.8f),24,V(5.6f,4.7f,3.9f));light(V(1,.4f,-.4f),16,V(4.2f,3.5f,5.6f));light(V(-1,.2f,-.5f),13,V(4.5f,3.0f,2.2f));light(V(.55f,.3f,1),22,V(.75f,.65f,.62f));
  V paper=hex(0xfaf0de),in=hex(0xb9935f),silk=hex(0xa9a9a9);
  F bw=1.17f,bd=1.0f,bh=1.62f;auto wood=[=](F u,F v,F k){// handmade paper: fibres, and a few flecks of gold
    F f=.5f+.5f*sinf(u*37+3*sinf(v*13+k))*sinf(v*29+2*sinf(u*17+k*2));return paper*(.95f+.05f*f);};
  auto fall=[=](V p){return clampf(1.06f-.13f*(p.x+1.2f)/2.4f-.20f*smooth(1.7f,-.1f,p.y),.6f,1.1f);};// the light falls off to the right and down
  // a small motif printed in gold: a diamond in every other square
  auto motif=[=](F u,F v){F q=.185f;int a=(int)floorf(u/q),b=(int)floorf(v/q);if((a+b)&1)return false;F x=fabsf(u/q-a-.5f),y=fabsf(v/q-b-.5f);F d=powf(x,.72f)+powf(y,.72f);return d<.30f;};
  auto wall=[&](V o,V x,V y,F k){size_t s0=T.size();grid(420,320,M4(),[=](F u,F v){V p=o+x*u+y*v;return p;},[=](F u,F v){return wood(u*len(x),v*len(y),k);},DIFF);if(k<4)for(size_t i=s0;i<T.size();i++){Tri&q=T[i];V p[3]={q.a,q.a+q.e1,q.a+q.e2};for(int j=0;j<3;j++)q.c[j]=q.c[j]*fall(p[j]);}V X1=norm(x),Y1=norm(y);if(k<4)for(size_t i=s0;i<T.size();i++){V m=T[i].a+(T[i].e1+T[i].e2)*(1/3.f)-o;if(motif(dot(m,X1)-len(x)*.5f,dot(m,Y1))){T[i].m=FOIL;for(auto&c:T[i].c)c=V(1.5f,1.06f,.52f);}}};
  F t=.045f;
  LAY=1; // front wall and sides, outside, and the front rim
  wall(V(-bw,0,bd),V(2*bw,0,0),V(0,bh,0),1);
  wall(V(-bw,0,-bd),V(0,0,2*bd),V(0,bh,0),2);wall(V(bw,0,bd),V(0,0,-2*bd),V(0,bh,0),3);
  grid(40,2,M4(),[=](F u,F v){return V(-bw+2*bw*u,bh,bd-t*v);},[=](F,F){return paper;},DIFF);
  LAY=2; // the inside and the back
  wall(V(-bw+t,0,bd-t),V(2*bw-2*t,0,0),V(0,bh,0),4);wall(V(-bw+t,0,-bd+t),V(2*bw-2*t,0,0),V(0,bh,0),5);wall(V(-bw+t,0,-bd),V(0,0,2*bd),V(0,bh,0),6);wall(V(bw-t,0,-bd),V(0,0,2*bd),V(0,bh,0),7);wall(V(-bw,0,-bd),V(2*bw,0,0),V(0,bh,0),8);
  grid(40,2,M4(),[=](F u,F v){return V(-bw+2*bw*u,bh,-bd+t*v);},[=](F,F){return paper;},DIFF);
  for(int sd=-1;sd<=1;sd+=2)grid(40,2,M4(),[=](F u,F v){return V(sd*(bw-t*v),bh,-bd+2*bd*u);},[=](F,F){return paper;},DIFF);
  grid(2,2,M4(),[=](F u,F v){return V(-bw+2*bw*u,.5f,-bd+2*bd*v);},[=](F,F){return in;},DIFF);
  LAY=3; // the lid
  F lw=bw+.07f,ld=bd+.07f,lh=.46f,ly=bh-lh+.16f;
  {M4 Lm=trans(V(0,ly+lh*.5f,0));size_t s0=T.size();rbox(Lm,V(lw,lh*.5f,ld),.035f,paper,DIFF,[](V n){return n.y>-.7f;},false,90);
   for(size_t i=s0;i<T.size();i++){Tri&q=T[i];V p[3]={q.a,q.a+q.e1,q.a+q.e2};for(int k=0;k<3;k++)q.c[k]=wood(p[k].x+p[k].z*.7f,p[k].y+p[k].z*.6f,9)*fall(p[k]);}
   // its inside, and the rim between
   F th=.04f;rbox(mul(Lm,trans(V(0,-th*.5f,0))),V(lw-th,lh*.5f-th*.5f,ld-th),.03f,paper*.96f,DIFF,[](V n){return n.y>-.7f;},true,40);
   for(int a=0;a<4;a++){F A=a%2?lw:ld,B2=a%2?ld:lw;M4 R4=mul(Lm,rotY(a*M_PI/2));grid(2,2,R4,[=](F u,F v){F d=A-th*v;return V((2*u-1)*(B2-th*v),-lh*.5f,d);},[=](F,F){return paper;},DIFF);}
   M4 pose=lidPose(LIDQ,ly,lh,ld);for(size_t i=s0;i<T.size();i++){Tri&q=T[i];q.a=pose.p(q.a);q.e1=pose.d(q.e1);q.e2=pose.d(q.e2);for(auto&k:q.n)k=pose.d(k);}}

  F ty=ly+lh+.006f,rw=.17f;
  V kn(0,ty+.17f,.06f);
  // ── the silk ── all of it, as it is UNTIE seconds after it's undone (ribbon.h)
  F un=UNTIE;Silk sk;sk.boxes={{V(-bw,0,-bd),V(bw,bh,bd)},{V(-lw,ly,-ld),V(lw,ty,ld)}};
  auto X=[](F){return V(1,0,0);};auto Z=[](F){return V(0,0,1);};
  // a length from the knot, over the lid's edge and down to the ground: out = how far to the edges of lid and box
  auto arm=[=](F u,F lidOut,F boxOut,F up){F L1=lidOut,L2=lh+.02f,L3=ly,tot=L1+L2+L3,d=u*tot;if(d<L1)return V(0,ty+up,d);d-=L1;if(d<L2)return V(0,ty+up-d,lidOut+.014f);d-=L2;return V(0,ly-.01f-d*(ly-.012f)/L3,mix(V(lidOut+.014f),V(boxOut+.012f),smooth(0,.05f,d)).x);};
  auto wide=[=](F){return rw;};
  sk.add([=](F u){return arm(u,ld,bd,.012f);},X,wide,.12f,5,46,320,.012f,0,0,.50f,.50f);
  sk.add([=](F u){V p=arm(u,ld,bd,.012f);return V(0,p.y,-p.z);},X,wide,.12f,5,46,200,.012f,0,2,.56f,.56f);
  sk.add([=](F u){V p=arm(u,lw,bw,.016f);return V(-p.z,p.y,0);},Z,wide,.12f,5,46,240,.018f,0,-1,.53f,.53f);
  sk.add([=](F u){V p=arm(u,lw,bw,.016f);return V(p.z,p.y,0);},Z,wide,.12f,5,46,240,.018f,0,1,.60f,.60f);
  auto tail=[&](F dir,F out,F dz,F rel){sk.add([=](F u){F x=dir*(.08f+out*powf(u,.85f));F z=.16f+smooth(0,.56f,u)*(ld+.02f)+.05f*sinf(u*8)*u+dz;F y=kn.y-.02f-.10f*smooth(0,.3f,u);F over=smooth(.40f,.62f,u);y=y*(1-over)+(ty+.075f)*over;y-=.95f*powf(fmaxf(0,u-.55f),1.35f);z+=.10f*smooth(.5f,.7f,u);return V(x,y,z);},[=](F u){return V(1,.25f*dir,-.25f*dir*sinf(u*6));},[=](F u){return .165f*(.55f+.45f*u)*(u>.93f?1-(u-.93f)*1.2f:1);},1.5f,5,40,180,.03f,1,dir,.02f,rel);};
  tail(-1,.62f,0,.58f);tail(1,.70f,.015f,.62f);
  sk.run(un);sk.draw(silk);
  LAY=5;CREASE=1.5f;
  // a loop: out from the knot and back, wide and soft, leaning back so its face shows; it's drawn through the knot
  auto loop=[&](F dir,F a,F b,F rise,F lean,F yaw,F wd,F z0,F from,F to){F k=1-smooth(from,to,un);if(k<.05f)return;F sag=1-k;a*=k;b*=powf(k,.75f);wd*=.45f+.55f*k;rise*=1-.5f*sag;M4 M=mul(trans(kn+V(0,-.05f*sag,0)+V(0,0,z0)),mul(rotY(yaw),mul(rotX(lean),rotZ(dir*rise))));
    strip(M,[=](F u){F q=2*M_PI*u;F x=dir*a*(1-cosf(q))*.5f;F y=b*sinf(q)*powf(sinf(M_PI*u),.55f);return V(x,y+.018f*sinf(u*23+sag*9),.02f*sinf(u*17+sag*7));},[=](F u){return V(dir*.16f*sinf(q2(u)),.30f*cosf(u*M_PI),1);},[=](F u){return wd*(.34f+.66f*powf(sinf(M_PI*u),.5f));},silk,240);};
  loop(-1,1.0f,.36f,.30f,-.50f,.22f,.34f,.04f,.10f,.56f);loop(1,1.0f,.36f,.30f,-.50f,-.22f,.34f,.04f,.06f,.52f);
  loop(-1,.74f,.30f,.86f,-.42f,.12f,.29f,-.12f,.0f,.44f);loop(1,.74f,.30f,.86f,-.42f,-.12f,.29f,-.12f,.04f,.47f);
  // the knot
  {F k=1-.25f*smooth(.2f,.5f,un);F off=smooth(.50f,.62f,un);if(off<1)grid(60,40,trans(kn+V(0,-.12f*off,.05f)),[=](F u,F v){F a=u*2*M_PI,b=(v-.5f)*M_PI;F j=(1+.06f*sinf(a*5+v*9))*k*(1-.8f*off);return V(.15f*j*cosf(b)*cosf(a),.175f*j*(1-.6f*off)*sinf(b)+.0f,.15f*j*cosf(b)*sinf(a));},[=](F,F){return silk;},SILK);}
  LAY=6;grid(2,2,M4(),[=](F u,F v){return V(-9+18*u,-.004f,9-18*v);},[=](F,F){return V(.5f);},DIFF);// the ground, only for the shadows on it
  return{V(0,3.55f,11.2f),V(0,1.36f,0),18.6f,1.12f};
}
// ── a fallen petal ──
static Cam petal(F which){
  lightsWarm();F k=which;V c0=hex(0x3d0512),c1=hex(0x860f27),c2=hex(0xb23a4e);M4 M=mul(rotY(k*1.1f+.3f),mul(rotX(-.5f+k*.35f),rotZ(k*.9f)));
  grid(60,60,M,[=](F u,F v){F a=u*2*M_PI,r=sqrtf(v);F x=r*cosf(a)*.56f,y=r*sinf(a)*.66f;F taper=.72f+.28f*smooth(-.66f,.2f,y);x*=taper;F z=.75f*x*x+.42f*y*y+.05f*sinf(x*8+y*5)*r+.10f*smooth(.35f,.66f,y)*sinf(x*6);return V(x,y,z-.15f);},[=](F u,F v){F y=sqrtf(v)*sinf(u*2*M_PI);V c=mix(c0,c1,smooth(-1,-.2f,y));return mix(c,c2,smooth(.3f,1,y));},PETAL);
  return{V(0,0,6),V(0,0,0),18,.9f};
}
// ── a butterfly, from above: one wing (the other is its mirror), and the body ──
static V curve(const vector<V>&p,F t){int n=p.size();F x=t*(n-1);int i=std::min(n-2,(int)x);F f=x-i;V a=p[i>0?i-1:0],b=p[i],c=p[i+1],d=p[i+2<n?i+2:n-1];return (b*2+(c-a)*f+(a*2-b*5+c*4-d)*(f*f)+(b*3-a-c*3+d)*(f*f*f))*.5f;}
static Cam wing(int kind){
  lightsWarm();light(V(.2f,.3f,1),30,V(1.6f,1.5f,1.45f));
  static const int PAL[3][4]={{0x081c52,0x1c5fc4,0x58b4f2,0x05070f},{0x8c2f0a,0xd9731d,0xf6b64a,0x140a06},{0xe9c6bd,0xf6e2d8,0xfff6ee,0x9c5a66}};
  V c0=hex(PAL[kind][0]),c1=hex(PAL[kind][1]),c2=hex(PAL[kind][2]),edge=hex(PAL[kind][3]);
  // u goes round the wing's edge, v from its root to the edge: so veins are lines of one u
  auto paint=[=](F u,F v,F seed){F vein=0;for(int k=0;k<9;k++){F uk=.08f+k*.105f;F w=.0075f+.004f*(1-v);vein=fmaxf(vein,(1-smooth(0,w/fmaxf(.16f,v),fabsf(u-uk)))*smooth(.06f,.2f,v));}
    F cell=1-smooth(0,.02f,fabsf(v-(.44f+.05f*sinf(u*17+seed))));vein=fmaxf(vein,cell*.75f*smooth(.1f,.25f,u)*smooth(.95f,.75f,u));
    V c=mix(c0,c1,smooth(.02f,.45f,v));c=mix(c,c2,smooth(.35f,.82f,v)*(.75f+.25f*sinf(u*9+seed)));
    F m=smooth(.80f,.90f,v+.035f*sinf(u*64));if(kind==2)m*=.55f;c=mix(c,edge,fmaxf(m,vein*(kind==2?.35f:.8f)));
    F du=fabsf(fmodf(u*19+seed,1.f)-.5f),dv=fabsf(v-.925f);if(du*du*.55f+dv*dv*260<.035f)c=mix(c,hex(kind==2?0xd9a24a:0xfff4e0),.9f);
    return c;};
  vector<V>hind={{0,0,0},{.42f,.10f,0},{.80f,.08f,0},{1.05f,-.14f,0},{1.10f,-.46f,0},{.95f,-.78f,0},{.72f,-.98f,0},{.46f,-.98f,0},{.26f,-.72f,0},{.10f,-.32f,0},{0,-.06f,0}};
  vector<V>fore={{0,.02f,0},{.22f,.40f,0},{.55f,.80f,0},{.92f,1.08f,0},{1.24f,1.17f,0},{1.34f,1.04f,0},{1.24f,.72f,0},{1.10f,.42f,0},{.92f,.16f,0},{.55f,-.02f,0},{.18f,-.05f,0},{0,-.02f,0}};
  auto mesh=[&](vector<V>p,V root,F z,F seed){grid(300,120,M4(),[=](F u,F v){V e=curve(p,u);F sc=1+.012f*sinf(u*74)*smooth(.85f,1,v);V q=root+(e-root)*(v*sc);q.z=z+.07f*q.x*q.x+.012f*sinf(u*60)*v*(1-v)*2;return q;},[=](F u,F v){return paint(u,v,seed);},PETAL);};
  mesh(hind,V(.01f,-.02f,0),0,1.3f);mesh(fore,V(.01f,.02f,0),.05f,0);
  return{V(.67f,.06f,14),V(.67f,.06f,0),10.0f,1.15f};
}
static Cam wingBody(){
  lightsWarm();V c=hex(0x2a1a14);sphere(V(0,.30f,.02f),.085f,c,VELVET,20,14);sphere(V(0,.10f,0),.12f,hex(0x3a2418),VELVET,20,14,V(.9f,1.45f,.9f));
  grid(30,40,M4(),[=](F u,F v){F a=u*2*M_PI;F r=.085f*powf(sinf(M_PI*(.12f+.86f*v)),.7f);return V(r*cosf(a),-.04f-v*.66f,r*sinf(a));},[=](F,F v){return mix(c,hex(0x7a5232),.5f+.5f*sinf(v*52));},VELVET);
  for(int s=-1;s<=1;s+=2){V a(.03f*s,.36f,.03f);for(int k=0;k<14;k++){F t=k/14.f,t1=(k+1)/14.f;auto P=[&](F t){return V(s*(.03f+.22f*powf(t,1.4f)),.36f+.42f*t-.06f*t*t,.03f+.05f*t);};capsule(P(t),P(t1),.011f,.010f,c,DIFF);}V e(s*.25f,.72f,.08f);sphere(e,.024f,c,DIFF,10,8);}
  return{V(0,.06f,14),V(0,.06f,0),10.0f,1.15f};
}
// ── a bed of moss and small white flowers, where they rest ──
static Cam bed(){
  lightsWarm();Rng r(8);
  sphere(V(0,-.62f,0),1.5f,hex(0x1c3020),LEAF,60,40,V(1,.72f,1));
  for(int i=0;i<2600;i++){F a=r.f()*6.28f,q=sqrtf(r.f())*1.42f;F y=-.62f+1.08f*sqrtf(fmaxf(0,1-q*q/2.25f));V o(cosf(a)*q,y-.02f,sinf(a)*q);V t=o+V((r.f()-.5f)*.12f,.06f+r.f()*.1f,(r.f()-.5f)*.12f);V g=mix(hex(0x3d5c34),hex(0x6f8a4a),r.f());capsule(o,t,.022f,.008f,g,LEAF);}
  for(int i=0;i<16;i++){F a=r.f()*6.28f;V d(cosf(a),.15f,sinf(a));V y=norm(d),x=norm(cross(V(0,1,0.01f),y)),z=cross(x,y);M4 M;M.x=x;M.y=y;M.z=z;M.o=V(d.x*1.0f,-.25f,d.z*1.0f);leafMesh(M,.8f+r.f()*.3f,.2f,.3f,mix(hex(0x2c4a31),hex(0x4f7348),r.f()),i);}
  for(int i=0;i<95;i++){F a=r.f()*6.28f,q=sqrtf(r.f())*1.42f;F y=-.62f+1.08f*sqrtf(fmaxf(0,1-q*q/2.25f));V o(cosf(a)*q,y+.05f,sinf(a)*q);V n=norm(V(o.x*.4f+(r.f()-.5f)*.4f,1,o.z*.4f+.35f));M4 M=alongZ(n,r.f()*6.28f);M.o=o;F S=.13f+r.f()*.06f;bool pk=r.f()<.3f;
    for(int k=0;k<5;k++){F b=k*2*M_PI/5;M4 Q=mul(M,rotZ(b));grid(10,10,Q,[=](F u,F v){F w=(u*2-1)*S*.46f*powf(sinf(M_PI*(.1f+.8f*v)),.7f);return V(w,S*v,S*(.35f*v*v+.25f*(u*2-1)*(u*2-1)*v));},[=](F,F v){return pk?mix(hex(0xd88a90),hex(0xf7d8d2),v):mix(hex(0xe6dcc0),hex(0xfffaf0),v);},PETAL);}
    sphere(M.p(V(0,0,.015f)),S*.17f,hex(0xd9a23a),DIFF,10,8);}
  return{V(0,2.6f,9.6f),V(0,.21f,0),17.7f,1.0f};
}
// ── a paper crane ──
// a flat piece of patterned paper: the triangle a b c, its pattern laid from a along b
static void paper(V a,V b,V c,bool in,int n=120){V ex=norm(b-a),nn=norm(cross(b-a,c-a)),ey=cross(nn,ex);
  V P=hex(in?0xc9808a:0xf4e6d6);auto pt=[&](int i,int j){return a+(b-a)*((F)i/n)+(c-a)*((F)j/n);};
  auto face=[&](V x,V y,V z){V m=(x+y+z)*(1/3.f)-a;F u=dot(m,ex),v=dot(m,ey),q=.23f;int iu=(int)floorf(u/q),iv=(int)floorf(v/q);F fx=fabsf(u/q-iu-.5f),fy=fabsf(v/q-iv-.5f),d=powf(fx,.75f)+powf(fy,.75f);int mt=DIFF;V col=P*(.97f+.03f*sinf(u*40+sinf(v*31)*2));if(!in){if(!((iu+iv)&1)&&d<.40f){mt=FOIL;col=V(1.5f,1.02f,.46f);}else if(((iu+iv)&1)&&fx*fx+fy*fy<.018f)col=hex(0x9c2238);}flat(x,y,z,col,mt);};
  for(int i=0;i<n;i++)for(int j=0;j<n-i;j++){face(pt(i,j),pt(i+1,j),pt(i,j+1));if(i+j<n-1)face(pt(i+1,j),pt(i+1,j+1),pt(i,j+1));}}
static Cam crane(F flap){
  lightsWarm();light(V(-.2f,.5f,1),26,V(1.3f,1.15f,1.0f));
  V K(0,-.72f,0),P(0,.24f,0),Fr(-.66f,.02f,0),Re(.66f,.02f,0);
  for(int s=-1;s<=1;s+=2){V S(0,-.12f,.30f*s);
    paper(Fr,S,P,false);paper(P,S,Re,false);paper(K,S,Fr,false);paper(K,Re,S,false);
    // neck and tail: narrow folded points
    V A(.02f,-.66f,.09f*s),N(-1.20f,1.06f,.03f*s);paper(A,Fr+V(0,.0f,.015f*s),N,false);
    V E(-.02f,-.66f,.09f*s),Tl(1.34f,1.16f,.012f*s);paper(E,Re+V(0,0,.015f*s),Tl,false);
    // the head, bent down from the neck
    V H(-1.60f,.70f,0),M(-1.04f,.78f,.08f*s);paper(N,M,H,false);
    // a wing: from the body's side, out and curling up at its end
    F c=cosf(flap),q=sinf(flap);V dir(0,q,c*s),up(0,c,-q*s);
    V b0(-.62f,.02f,.10f*s),b1(.62f,.02f,.10f*s);const int N1=12;
    auto W=[&](F along,F t){F curl=.16f*t*t;V e0=b0+dir*(1.5f*t)+up*curl+V(.46f*t,0,0),e1=b1+dir*(1.5f*t)+up*curl+V(-.40f*t,0,0);return e0+(e1-e0)*along+up*(.05f*sinf(along*M_PI)*(1-t));};
    for(int i=0;i<N1;i++){F t0=(F)i/N1,t1=(F)(i+1)/N1;for(int k=0;k<2;k++){F a0=k*.5f,a1=a0+.5f;
      // (each strip takes its part of one pattern, measured along the wing)
      const int n=60,ny=12;for(int x=0;x<n;x++)for(int y=0;y<ny;y++){F A0=a0+(a1-a0)*x/n,A1=a0+(a1-a0)*(x+1)/n,T0=t0+(t1-t0)*y/ny,T1=t0+(t1-t0)*(y+1)/ny;V p0=W(A0,T0),p1=W(A1,T0),p2=W(A1,T1),p3=W(A0,T1);
        F u=(A0+A1)*.5f*(1.24f-.86f*(T0+T1)*.5f)+.23f*(T0+T1),v=(T0+T1)*.5f*1.5f,qq=.23f;int iu=(int)floorf(u/qq),iv=(int)floorf(v/qq);F fx=fabsf(u/qq-iu-.5f),fy=fabsf(v/qq-iv-.5f),d=powf(fx,.75f)+powf(fy,.75f);int mt=DIFF;V col=hex(0xf4e6d6);if(!((iu+iv)&1)&&d<.40f){mt=FOIL;col=V(1.5f,1.02f,.46f);}else if(((iu+iv)&1)&&fx*fx+fy*fy<.018f)col=hex(0x9c2238);
        flat(p0,p1,p2,col,mt);flat(p0,p2,p3,col,mt);}}}
  }
  return{V(-2.9f,2.6f,8.4f),V(-.1f,.22f,0),23.5f,1.08f};
}
// the crane's square of paper, its two sides folding in to a kite (fold: 0 … 180°)
static Cam kite(F fold){
  lightsWarm();light(V(-.2f,.5f,1),26,V(1.3f,1.15f,1.0f));
  F R=1.5f;V top(0,R,0),bot(0,-R,0),lf(-R,0,0),rt(R,0,0);F m=R*(sqrtf(2.f)-1); // where the fold meets the far edges
  V fl(-m,-R+m,0),fr(m,-R+m,0);
  auto turn=[&](V p,V a,V b,F t){V k=norm(b-a),q=p-a;return a+q*cosf(t)+cross(k,q)*sinf(t)+k*(dot(k,q)*(1-cosf(t)));};
  F t=fold*.992f;V l2=turn(lf,top,fl,t),r2=turn(rt,fr,top,t);
  auto two=[&](V a,V b,V c){paper(a,b,c,false);V n=norm(cross(b-a,c-a))*-.006f;paper(a+n,c+n,b+n,true);};
  two(top,bot,fr);two(top,fl,bot);two(top,fr,r2);two(top,l2,fl);
  // the creases left by folding
  auto crease=[&](V a,V b){capsule(a+V(0,0,.004f),b+V(0,0,.004f),.005f,.005f,hex(0xc9b49a),DIFF);};
  if(fold<.02f){crease(top,bot);crease(lf,rt);crease(top,fl);crease(top,fr);crease(bot,V(-m,R-m,0));crease(bot,V(m,R-m,0));}
  return{V(-1.0f,-.9f,9),V(0,0,0),22.5f,1.0f};
}
static Cam scene(const char*n,F turn,F lid){int k=(int)lroundf(turn*180/M_PI);if(!strcmp(n,"box")){UNTIE=k/100.f;LIDQ=lid*180/M_PI/100;return giftBox();}if(!strcmp(n,"stem"))return stem();if(!strcmp(n,"petal"))return petal(turn*180/M_PI);if(!strcmp(n,"wing"))return wing(k);if(!strcmp(n,"wingbody"))return wingBody();if(!strcmp(n,"bed"))return bed();if(!strcmp(n,"crane"))return crane(lid);if(!strcmp(n,"kite"))return kite(lid);return roses(turn);}

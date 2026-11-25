// The gift box's silk, coming undone: the loops are drawn through the knot,
// the knot lets go, and every length of ribbon slips off the lid and falls.
// (Each length is a strip of points joined by threads, worked out step by step.)

struct Ribbon{
  std::function<V(F)>c,side;std::function<F(F)>w;F crease;int lay,n,fine;F thick;
  F start,release;int kind;F dir;// kind 0: an arm over the lid, 1: a tail of the bow
  vector<V>p,q,v;vector<F>rest;// p: the points, three across
  int at(int i,int s)const{return i*3+s;}
};
struct BoxC{V lo,hi;};
struct Silk{
  vector<Ribbon>R;vector<BoxC>boxes;F t=0;
  void add(std::function<V(F)>c,std::function<V(F)>side,std::function<F(F)>w,F crease,int lay,int n,int fine,F thick,int kind,F dir,F start,F release){
    Ribbon r;r.c=c;r.side=side;r.w=w;r.crease=crease;r.lay=lay;r.n=n;r.fine=fine;r.thick=thick;r.kind=kind;r.dir=dir;r.start=start;r.release=release;
    for(int i=0;i<=n;i++){F u=(F)i/n;V a=c(u),s=norm(side(u));for(int k=-1;k<=1;k++)r.p.push_back(a+s*(k*w(u)));}
    r.q=r.p;r.v.assign(r.p.size(),V(0));R.push_back(r);
  }
  static void hold(V&a,V&b,F want,F stiff,bool fa,bool fb){V d=b-a;F l=len(d);if(l<1e-6f)return;V m=d*((l-want)/l*stiff);if(fa&&fb)return;if(fa)b=b-m;else if(fb)a=a+m;else{a=a+m*.5f;b=b-m*.5f;}}
  F feed(const Ribbon&r)const{return r.kind==1?1+1.15f*smooth(.06f,.56f,t):1;}
  void run(F until){const int SUB=20;const F h=1/24.f/SUB;
    while(t<until-1e-5f){t+=h;
      for(size_t ri=0;ri<R.size();ri++){Ribbon&r=R[ri];if(t<r.start)continue;bool held=t<r.release;F fd=feed(r);
        for(int i=0;i<=r.n;i++)for(int k=0;k<3;k++){int a=r.at(i,k);V&x=r.p[a];V acc(0,-17,0);F u=(F)i/r.n;
          if(r.kind==1){F pull=held?smooth(.5f,1,u):0;acc=acc+V(r.dir*5,0,3)*pull;}
          // once it's free it slips outwards, off the lid
          if(!held&&x.y>1.72f){if(r.kind==1)acc=acc+V(r.dir*1.2f,0,3.2f);else if(r.dir==0)acc=acc+V(0,0,5);else if(r.dir==2)acc=acc+V(0,0,-8);else acc=acc+V(r.dir*3.5f,0,-2.5f);}
          if(!held||r.kind==1)acc=acc+V(sinf(u*9+ri*2.1f+t*5),0,cosf(u*7+ri*1.3f+t*4))*1.6f;
          r.v[a]=(r.v[a]+acc*h)*(1-1.5f*h);if(!held&&x.y<1.6f){F dr=1-(5+20*smooth(1.5f,1.9f,t))*h;r.v[a].x*=dr;r.v[a].z*=dr;if(x.y<.5f)r.v[a].y*=1-6*h;}r.q[a]=x;x=x+r.v[a]*h;}
        auto pinned=[&](int i){return held&&i==0;};
        for(int k=0;k<3;k++)if(held){r.p[r.at(0,k)]=r.q[r.at(0,k)];}
        auto L0=[&](int a,int b){return len(r0(r,a)-r0(r,b));};
        for(int it=0;it<6;it++){
          for(int i=0;i<=r.n;i++){bool f=pinned(i);int a=r.at(i,0),b=r.at(i,1),c=r.at(i,2);F w=r.w((F)i/r.n);hold(r.p[a],r.p[b],w,1,f,f);hold(r.p[b],r.p[c],w,1,f,f);hold(r.p[a],r.p[c],2*w,.7f,f,f);}
          for(int i=0;i<r.n;i++){F g=r.kind==1&&i<r.n/2?1+(fd-1)*2:1;bool f=pinned(i);for(int k=0;k<3;k++)hold(r.p[r.at(i,k)],r.p[r.at(i+1,k)],L0(r.at(i,k),r.at(i+1,k))*g,.9f,f,false);
            if(g<1.02f||r.kind==0){hold(r.p[r.at(i,0)],r.p[r.at(i+1,1)],L0(r.at(i,0),r.at(i+1,1)),.35f,f,false);hold(r.p[r.at(i,2)],r.p[r.at(i+1,1)],L0(r.at(i,2),r.at(i+1,1)),.35f,f,false);hold(r.p[r.at(i,1)],r.p[r.at(i+1,0)],L0(r.at(i,1),r.at(i+1,0)),.35f,f,false);hold(r.p[r.at(i,1)],r.p[r.at(i+1,2)],L0(r.at(i,1),r.at(i+1,2)),.35f,f,false);}}
          // silk doesn't fold sharply
          for(int i=0;i+3<=r.n;i++){F g=r.kind==1&&i<r.n/2?1+(fd-1)*2:1;F want=(L0(r.at(i,1),r.at(i+1,1))+L0(r.at(i+1,1),r.at(i+2,1))+L0(r.at(i+2,1),r.at(i+3,1)))*g*.78f;for(int k=0;k<3;k++){V d=r.p[r.at(i+3,k)]-r.p[r.at(i,k)];if(len(d)<want)hold(r.p[r.at(i,k)],r.p[r.at(i+3,k)],want,held?.12f:.075f,pinned(i),false);}}
          // folds of it don't lie in the same place
          if(it%3==0&&!held)for(int i=0;i<=r.n;i++)for(int j=i+5;j<=r.n;j++){V d=r.p[r.at(j,1)]-r.p[r.at(i,1)];F l=len(d);if(l<.11f&&l>1e-5f){V m=d*((.11f-l)/l*.25f);for(int k=0;k<3;k++){r.p[r.at(i,k)]=r.p[r.at(i,k)]-m;r.p[r.at(j,k)]=r.p[r.at(j,k)]+m;}}}
          for(size_t a=0;a<r.p.size();a++){V&x=r.p[a];V from=r.q[a];F th=r.thick;
            for(auto&b:boxes){V lo=b.lo-V(th),hi=b.hi+V(th);if(x.x>lo.x&&x.x<hi.x&&x.y>lo.y&&x.y<hi.y&&x.z>lo.z&&x.z<hi.z){
              F d[5]={hi.y-x.y,hi.z-x.z,x.z-lo.z,hi.x-x.x,x.x-lo.x};int m=0;for(int k=1;k<5;k++)if(d[k]<d[m])m=k;if(m==0)x.y=hi.y;else if(m==1)x.z=hi.z;else if(m==2)x.z=lo.z;else if(m==3)x.x=hi.x;else x.x=lo.x;}}
            if(x.y<th){x.y=th;x.x=x.x+(from.x-x.x)*.35f;x.z=x.z+(from.z-x.z)*.35f;}}
        }
        for(size_t a=0;a<r.p.size();a++){r.v[a]=(r.p[a]-r.q[a])*(1/h);F s=len(r.v[a]);if(s>9)r.v[a]=r.v[a]*(9/s);}
      }
    }
  }
  // where a point was to begin with
  static V r0(const Ribbon&r,int a){int i=a/3,k=a%3-1;F u=(F)i/r.n;return r.c(u)+norm(r.side(u))*(k*r.w(u));}
  void draw(V col){
    for(auto&r:R){LAY=r.lay;
      auto node=[&](int i,int k){i=i<0?0:i>r.n?r.n:i;return r.p[r.at(i,k)];};
      auto along=[&](F u,int k){F x=u*r.n;int i=std::min(r.n-1,(int)x);F f=x-i;V a=i>0?node(i-1,k):node(0,k)*2-node(1,k),b=node(i,k),c=node(i+1,k),d=i+2<=r.n?node(i+2,k):node(r.n,k)*2-node(r.n-1,k);return (b*2+(c-a)*f+(a*2-b*5+c*4-d)*(f*f)+(b*3-a-c*3+d)*(f*f*f))*.5f;};
      grid(r.fine,10,M4(),[&](F u,F v){F s=v*2-1;V l=along(u,0),m=along(u,1),e=along(u,2);V x=m+(e-l)*(s*.5f)+((e+l)*.5f-m)*(s*s);
        V tn=norm(along(fminf(1,u+.004f),1)-along(fmaxf(0,u-.004f),1)),sd=norm(e-l);F cup=r.w(u)*.05f*sinf(s*4.2f+sinf(u*31)*1.1f)*sinf(u*M_PI)*r.crease;return x+cross(tn,sd)*cup;},[=](F,F){return col;},SILK);}
  }
};

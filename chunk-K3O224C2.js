import{Na as st,Qa as pt,Va as dt,gb as lt,l as ot,na as at,zb as ct}from"./chunk-WXNUARKQ.js";import{$ as N,C as c,D as C,Db as Z,G as F,Ga as K,Gb as q,H as _,Ib as Y,K as j,Lc as rt,Mb as J,Nb as tt,Oa as Q,Ob as et,Q as E,Qa as U,S as L,Xb as it,Z as A,_ as P,ba as O,ca as z,db as V,ea as H,fa as S,ja as d,m as D,mb as G,o as $,oa as R,ob as X,oc as nt,pa as l,qb as x,r as B,s as m,x as T,ya as W,za as v}from"./chunk-NH2UYNS6.js";var kt=(()=>{class t{constructor(){this.load$=new m(null),this.remove$=new m(null),this.currentTrackPoint$=new m(null)}static{this.\u0275fac=function(i){return new(i||t)}}static{this.\u0275prov=d({token:t,factory:t.\u0275fac,providedIn:"root"})}}return t})();var ut={debounceTime:300,production:!1,ssoUri:"",apiUri:"https://artemis.itmontag.keenetic.pro/",apiUriMapbox:"https://api.mapbox.com/",accessTokenMapBox:"pk.eyJ1IjoidHJhY2tjb20xIiwiYSI6ImNtOHBvcmlpMzA0bnEycXNobDI2OWowYTEifQ.QwoWlBurKNAfSDD9UgGB1w",baseURL:""};var Ft=(()=>{class t{constructor(e){this._http=e,this.token="27afb877422133945a0f5241bc649145bd928fa17ca239d23b942850a770cd06",this.track$=new m(null),this._fakeState={}}findAll(){let e=new Date,i=e.toISOString(),n=new Date(e.getTime()+60*60*1e3).toISOString();return T([{id:"22952",name:"ID: 22952",startDateTime:i,endDateTime:n,speed:4,active:!0,isRepeat:!0,color:"#CB0000"}])}getById(e){return this.findAll().pipe(c(i=>i.find(n=>n.id===e)))}getVehicleTrack(e,i,n,r=!1){return _(()=>{let a=new Date,o=a.toISOString().split(".")[0]+"Z",p=new Date(a);p.setHours(0,0,0,0);let f=p.toISOString().split(".")[0]+"Z",g=r?f:i,b=r?o:n,w=new URLSearchParams({token:this.token,vehicle_id:e,start:g,end:b});return this._http.get(`${ut.apiUri}tracking?${w.toString()}`)}).pipe(c(a=>a),P({count:2,delay:15e3}),r?A({delay:15e3}):D,S(a=>this.track$.next({vehicleId:e,data:a,isRepeat:r})))}startFakeTrack(e){if(this._fakeState[e])return;let i={prevPoint:{coordinates:[37.6176,55.7558,150],altitude:150,speed:0,direct_angle:null,waterfall:null,waterup:null,fly:"reserved",timestamp:new Date().toISOString()},features:[]};this._fakeState[e]=i,j(1e4).pipe(N((n,r)=>{let a=n.prevPoint,o=this.movePoint(a,r),p={type:"Feature",geometry:{type:"Point",coordinates:[o.coordinates[0],o.coordinates[1],o.coordinates[2]]},properties:{timestamp:o.timestamp,speed:o.speed,direct_angle:o.direct_angle,altitude:o.altitude,waterfall:o.waterfall,waterup:o.waterup,fly:o.fly,vehicle_id:e}};return n.features.push(p),n.prevPoint=o,n},{prevPoint:i.prevPoint,features:i.features}),c(n=>({vehicleId:e,isRepeat:!0,data:{type:"FeatureCollection",features:n.features.slice()}})),S(n=>{this.track$.next(n)})).subscribe()}movePoint(e,i){let[r,a]=e.coordinates,o=500/111320,p=a,f=r;i%2===0?p=a+o:f=r+500/(111320*Math.cos(a*Math.PI/180));let g=Math.abs(Math.sin(i/10))*1e3,b=Math.abs(Math.sin(i/5))*25,w=i%2===0?0:90,xt=i%10<5?"Takeoff":"Landing",y=null;i%7===0?y="active":i%7===1&&(y="inactive");let I=null;return i%11===0?I="active":i%11===1&&(I="inactive"),{coordinates:[f,p,g],altitude:g,speed:b,direct_angle:w,waterfall:y,waterup:I,fly:xt,timestamp:new Date().toISOString()}}static{this.\u0275fac=function(i){return new(i||t)(R(ct))}}static{this.\u0275prov=d({token:t,factory:t.\u0275fac,providedIn:"root"})}}return t})();var M;try{M=typeof Intl<"u"&&Intl.v8BreakIterator}catch{M=!1}var ft=(()=>{class t{_platformId=l(Q);isBrowser=this._platformId?ot(this._platformId):typeof document=="object"&&!!document;EDGE=this.isBrowser&&/(edge)/i.test(navigator.userAgent);TRIDENT=this.isBrowser&&/(msie|trident)/i.test(navigator.userAgent);BLINK=this.isBrowser&&!!(window.chrome||M)&&typeof CSS<"u"&&!this.EDGE&&!this.TRIDENT;WEBKIT=this.isBrowser&&/AppleWebKit/i.test(navigator.userAgent)&&!this.BLINK&&!this.EDGE&&!this.TRIDENT;IOS=this.isBrowser&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!("MSStream"in window);FIREFOX=this.isBrowser&&/(firefox|minefield)/i.test(navigator.userAgent);ANDROID=this.isBrowser&&/android/i.test(navigator.userAgent)&&!this.TRIDENT;SAFARI=this.isBrowser&&/safari/i.test(navigator.userAgent)&&this.WEBKIT;constructor(){}static \u0275fac=function(i){return new(i||t)};static \u0275prov=d({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function k(t){return Array.isArray(t)?t:[t]}var mt=new Set,u,gt=(()=>{class t{_platform=l(ft);_nonce=l(U,{optional:!0});_matchMedia;constructor(){this._matchMedia=this._platform.isBrowser&&window.matchMedia?window.matchMedia.bind(window):wt}matchMedia(e){return(this._platform.WEBKIT||this._platform.BLINK)&&bt(e,this._nonce),this._matchMedia(e)}static \u0275fac=function(i){return new(i||t)};static \u0275prov=d({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function bt(t,s){if(!mt.has(t))try{u||(u=document.createElement("style"),s&&u.setAttribute("nonce",s),u.setAttribute("type","text/css"),document.head.appendChild(u)),u.sheet&&(u.sheet.insertRule(`@media ${t} {body{ }}`,0),mt.add(t))}catch(e){console.error(e)}}function wt(t){return{matches:t==="all"||t==="",media:t,addListener:()=>{},removeListener:()=>{}}}var yt=(()=>{class t{_mediaMatcher=l(gt);_zone=l(K);_queries=new Map;_destroySubject=new B;constructor(){}ngOnDestroy(){this._destroySubject.next(),this._destroySubject.complete()}isMatched(e){return ht(k(e)).some(n=>this._registerQuery(n).mql.matches)}observe(e){let n=ht(k(e)).map(a=>this._registerQuery(a).observable),r=C(n);return r=F(r.pipe(L(1)),r.pipe(O(1),E(0))),r.pipe(c(a=>{let o={matches:!1,breakpoints:{}};return a.forEach(({matches:p,query:f})=>{o.matches=o.matches||p,o.breakpoints[f]=p}),o}))}_registerQuery(e){if(this._queries.has(e))return this._queries.get(e);let i=this._mediaMatcher.matchMedia(e),r={observable:new $(a=>{let o=p=>this._zone.run(()=>a.next(p));return i.addListener(o),()=>{i.removeListener(o)}}).pipe(z(i),c(({matches:a})=>({query:e,matches:a})),H(this._destroySubject)),mql:i};return this._queries.set(e,r),r}static \u0275fac=function(i){return new(i||t)};static \u0275prov=d({token:t,factory:t.\u0275fac,providedIn:"root"})}return t})();function ht(t){return t.map(s=>s.split(",")).reduce((s,e)=>s.concat(e)).map(s=>s.trim())}var Gt=(()=>{class t extends dt{static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275cmp=G({type:t,selectors:[["ChevronDownIcon"]],features:[x],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["d","M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z","fill","currentColor"]],template:function(i,n){i&1&&(W(),J(0,"svg",0),et(1,"path",1),tt()),i&2&&(Y(n.getClassNames()),Z("aria-label",n.ariaLabel)("aria-hidden",n.ariaHidden)("role",n.role))},encapsulation:2})}return t})();var It=({dt:t})=>`
.p-inputtext {
    font-family: inherit;
    font-feature-settings: inherit;
    font-size: 1rem;
    color: ${t("inputtext.color")};
    background: ${t("inputtext.background")};
    padding-block: ${t("inputtext.padding.y")};
    padding-inline: ${t("inputtext.padding.x")};
    border: 1px solid ${t("inputtext.border.color")};
    transition: background ${t("inputtext.transition.duration")}, color ${t("inputtext.transition.duration")}, border-color ${t("inputtext.transition.duration")}, outline-color ${t("inputtext.transition.duration")}, box-shadow ${t("inputtext.transition.duration")};
    appearance: none;
    border-radius: ${t("inputtext.border.radius")};
    outline-color: transparent;
    box-shadow: ${t("inputtext.shadow")};
}

.p-inputtext.ng-invalid.ng-dirty {
    border-color: ${t("inputtext.invalid.border.color")};
}

.p-inputtext:enabled:hover {
    border-color: ${t("inputtext.hover.border.color")};
}

.p-inputtext:enabled:focus {
    border-color: ${t("inputtext.focus.border.color")};
    box-shadow: ${t("inputtext.focus.ring.shadow")};
    outline: ${t("inputtext.focus.ring.width")} ${t("inputtext.focus.ring.style")} ${t("inputtext.focus.ring.color")};
    outline-offset: ${t("inputtext.focus.ring.offset")};
}

.p-inputtext.p-invalid {
    border-color: ${t("inputtext.invalid.border.color")};
}

.p-inputtext.p-variant-filled {
    background: ${t("inputtext.filled.background")};
}
    
.p-inputtext.p-variant-filled:enabled:hover {
    background: ${t("inputtext.filled.hover.background")};
}

.p-inputtext.p-variant-filled:enabled:focus {
    background: ${t("inputtext.filled.focus.background")};
}

.p-inputtext:disabled {
    opacity: 1;
    background: ${t("inputtext.disabled.background")};
    color: ${t("inputtext.disabled.color")};
}

.p-inputtext::placeholder {
    color: ${t("inputtext.placeholder.color")};
}

.p-inputtext.ng-invalid.ng-dirty::placeholder {
    color: ${t("inputtext.invalid.placeholder.color")};
}

.p-inputtext-sm {
    font-size: ${t("inputtext.sm.font.size")};
    padding-block: ${t("inputtext.sm.padding.y")};
    padding-inline: ${t("inputtext.sm.padding.x")};
}

.p-inputtext-lg {
    font-size: ${t("inputtext.lg.font.size")};
    padding-block: ${t("inputtext.lg.padding.y")};
    padding-inline: ${t("inputtext.lg.padding.x")};
}

.p-inputtext-fluid {
    width: 100%;
}
`,St={root:({instance:t,props:s})=>["p-inputtext p-component",{"p-filled":t.filled,"p-inputtext-sm":s.size==="small","p-inputtext-lg":s.size==="large","p-invalid":s.invalid,"p-variant-filled":s.variant==="filled","p-inputtext-fluid":s.fluid}]},vt=(()=>{class t extends st{name="inputtext";theme=It;classes=St;static \u0275fac=(()=>{let e;return function(n){return(e||(e=v(t)))(n||t)}})();static \u0275prov=d({token:t,factory:t.\u0275fac})}return t})();var de=(()=>{class t extends pt{ngModel;variant;fluid;pSize;filled;_componentStyle=l(vt);get hasFluid(){let i=this.el.nativeElement.closest("p-fluid");return at(this.fluid)?!!i:this.fluid}constructor(e){super(),this.ngModel=e}ngAfterViewInit(){super.ngAfterViewInit(),this.updateFilledState(),this.cd.detectChanges()}ngDoCheck(){this.updateFilledState()}onInput(){this.updateFilledState()}updateFilledState(){this.filled=this.el.nativeElement.value&&this.el.nativeElement.value.length||this.ngModel&&this.ngModel.model}static \u0275fac=function(i){return new(i||t)(V(lt,8))};static \u0275dir=X({type:t,selectors:[["","pInputText",""]],hostAttrs:[1,"p-inputtext","p-component"],hostVars:14,hostBindings:function(i,n){if(i&1&&it("input",function(a){return n.onInput(a)}),i&2){let r;q("p-filled",n.filled)("p-variant-filled",((r=n.variant)!==null&&r!==void 0?r:n.config.inputStyle()||n.config.inputVariant())==="filled")("p-inputtext-fluid",n.hasFluid)("p-inputtext-sm",n.pSize==="small")("p-inputfield-sm",n.pSize==="small")("p-inputtext-lg",n.pSize==="large")("p-inputfield-lg",n.pSize==="large")}},inputs:{variant:"variant",fluid:[2,"fluid","fluid",rt],pSize:"pSize"},features:[nt([vt]),x]})}return t})();export{Gt as a,kt as b,de as c,Ft as d,ft as e,k as f,yt as g};

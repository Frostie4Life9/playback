/* Playback · SCREEN, "The Shelf" (2026.11.24-a)
   Loaded by index.html the first time the Screen tab opens (with screen.css), so the rest of the app never carries it.
   It uses the app's own globals (S, UI, render, touch, esc, sid, rating, isDone, the TMDB helpers, the friends strip)
   and adds window.SC = {ready, render, after}.

   DATA (all of it on the film's own entry in S.screen, so it saves and syncs with the log):
     f.w   watches, oldest first: [{id, d:'YYYY-MM-DD', r:0-10 in halves (0 = not rated), at:'home'|'theater', svc, rv, t}]
           The latest rated watch sets the film's score, written to S.marks[f.id] (r, rd, rv) exactly like before, so the
           account page, friends, Stats and the CSV export keep working. A film with no watches is on your list (Up next).
     f.mo  moments: [{id, s:seconds into the film, n:note, w:watch id}]
     f.no  its spine number: the order you first watched or rated it (assigned once, never reused)
     f.own owned on disc: '4K' | 'Blu-ray' | 'DVD'      f.fo  pinned face-out      f.card  the shelf card
     f.lv  return-by: the day it leaves the service you'd watch it on        f.add  when it went on your list
     f.dir [{id,n,p}] directors, f.cast, f.bd backdrop, f.enr when TMDB credits were read
   Shows keep their seasons and episode marks as before; Screen draws them as box sets. */
(function(){
'use strict';
if(window.SC&&window.SC.ready)return;
const $=(q,r)=>(r||document).querySelector(q),$$=(q,r)=>[...(r||document).querySelectorAll(q)];
const PHONE=()=>matchMedia('(max-width:760px)').matches;
const U=(()=>{const d={seg:'films',sort:'score',shf:'all',shq:'',upf:'all',open:null,box:null,person:null,wsel:{},season:{},pick:null,homeY:0,pg:0,dy:'',sy:''};
  try{return Object.assign(d,JSON.parse(sessionStorage.getItem('pb_scu')||'{}'))}catch(e){return d}})();
const T={add:false,svcs:false,edit:null,arm:null,land:null,wait:false,newMo:null,upAll:false,busyImp:false,eps:{}};   /* never saved */
function uSave(){try{sessionStorage.setItem('pb_scu',JSON.stringify(U))}catch(e){}}
const uid=()=>Math.random().toString(36).slice(2,10);
const pad=(n,k)=>String(n).padStart(k||3,'0');
const ymd=d=>{d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dOf=s=>{if(!s)return null;const d=new Date(s+'T12:00:00');return isNaN(d)?null:d};
const thisY=new Date().getFullYear();
const dS=s=>{const d=dOf(s);return d?d.toLocaleDateString([],{month:'short',day:'numeric',...(d.getFullYear()!==thisY?{year:'numeric'}:{})}):'No date'};
const dL=s=>{const d=dOf(s);return d?d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'}):'No date'};
const dK=s=>{const d=dOf(s);return d?d.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'}).toUpperCase():'NO DATE'};
const mdy=s=>{const d=dOf(s);return d?(d.getMonth()+1)+'/'+d.getDate():''};
const days=s=>{const d=dOf(s);if(!d)return null;const t=new Date();t.setHours(12,0,0,0);return Math.round((d-t)/864e5)};
const rt=m=>m?(m>=60?Math.floor(m/60)+'h '+(m%60?m%60+'m':''):m+'m').trim():'';
const hrs=m=>m>=60?(Math.round(m/6)/10).toLocaleString()+'h':m+'m';
const f1=v=>fmt(v);
const plural=(n,w,p)=>n+' '+(n===1?w:(p||w+'s'));
const svgI=(d,w)=>`<svg viewBox="0 0 24 24" width="${w||18}" height="${w||18}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M15 6l-6 6 6 6"/>',next:'<path d="M9 6l6 6-6 6"/>',play:'<path d="M7 5l12 7-12 7z" fill="currentColor"/>',
  shuffle:'<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',pin:'<path d="M12 17v5M8 3h8l-1 7 3 3H6l3-3z"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',again:'<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.6h-4.6"/>',tv:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3"/>'};

/* ---------- the log ---------- */
const films=()=>(S.screen||[]).filter(x=>x.type==='film'&&!x.example);
const shows=()=>(S.screen||[]).filter(x=>x.type==='show'&&!x.example);
const byId=id=>(S.screen||[]).find(x=>x.id===id);
const W=f=>f.w||[];
const seen=f=>W(f).length>0;
function sortW(f){if(f.w)f.w.sort((a,b)=>(a.d||'').localeCompare(b.d||'')||(a.t||0)-(b.t||0))}
function lastRated(f){const w=W(f);for(let i=w.length-1;i>=0;i--)if(w[i].r)return w[i];return null}
const score=f=>{const l=lastRated(f);return l?l.r:0};
const lastW=f=>{const w=W(f);return w[w.length-1]||null};
const latestRv=f=>{const w=W(f);for(let i=w.length-1;i>=0;i--)if(w[i].rv)return w[i].rv;return ''};
const firstLine=t=>{t=String(t||'').trim();if(!t)return '';const m=t.match(/^.{20,140}?[.!?](\s|$)/);return (m?m[0]:t.slice(0,140)).trim()};
const cardOf=f=>f.card||firstLine(latestRv(f));
const theaterW=f=>W(f).filter(w=>w.at==='theater');
const wName=(f,w)=>{const i=W(f).indexOf(w);return 'Watch '+(i+1)};
/* the film's score lives on its mark too, as it always has */
function syncMark(f){
  const m={...(S.marks[f.id]||{})},l=lastRated(f),w=W(f);
  if(w.length)m.done=true;else delete m.done;
  if(l){m.r=l.r;if(l.d)m.rd=l.d;else delete m.rd}else{m.r=0;delete m.rd}
  const rv=latestRv(f);if(rv&&l)m.rv=rv;else delete m.rv;
  if(!m.done&&!m.r&&!m.rv&&!m.x)delete S.marks[f.id];else S.marks[f.id]=m;
}
function giveNo(f){if(f.no)return;f.no=films().reduce((m,x)=>Math.max(m,x.no||0),0)+1}
function newWatch(f,d){const w={id:uid(),d:d||ymd(),r:0,at:'home',svc:onMine(f)||'',rv:'',t:Date.now()};f.w=f.w||[];f.w.push(w);sortW(f);giveNo(f);return w}
/* films rated before this build (or on a device still on an older build) get their watches from their marks */
function migrate(){
  let ch=false;
  for(const f of films()){
    const r=rating(f.id),dn=isDone(f.id);
    if(!Array.isArray(f.w)){f.w=(r||dn)?[{id:uid(),d:ratedDate(f.id)||'',r:r||0,at:'home',svc:'',rv:reviewOf(f.id)||'',t:Date.now()}]:[];ch=true;continue}
    const l=lastRated(f);
    if(r&&l&&Math.abs(r-l.r)>.01){l.r=r;ch=true}
    else if((r||dn)&&!f.w.length){f.w.push({id:uid(),d:ratedDate(f.id)||'',r:r||0,at:'home',svc:'',rv:reviewOf(f.id)||'',t:Date.now()});ch=true}
  }
  const need=films().filter(f=>seen(f)&&!f.no);
  if(need.length){let mx=films().reduce((m,x)=>Math.max(m,x.no||0),0);
    need.sort((a,b)=>(W(a)[0].d||'9999').localeCompare(W(b)[0].d||'9999')||a.title.localeCompare(b.title));
    for(const f of need)f.no=++mx;ch=true}
  if(ch)touch();
}
let RK=[];
function ranked(){return films().filter(f=>score(f)).sort((a,b)=>score(b)-score(a)||W(b).length-W(a).length||((lastW(b)||{}).d||'').localeCompare((lastW(a)||{}).d||'')||a.title.localeCompare(b.title))}
const rankOf=f=>RK.indexOf(f)+1;
const mySvcs=()=>(S.cfg&&Array.isArray(S.cfg.svcs)?S.cfg.svcs:[]);
function onMine(f){const w=f&&f.watch;if(!w)return '';const m=mySvcs();const hit=[...(w.s||[]),...(w.f||[])].find(p=>m.includes(p[0]));return hit?hit[0]:''}
function bestWhere(f){const w=f.watch;if(!w)return '';const mine=onMine(f);if(mine)return mine;if(w.f&&w.f.length)return w.f[0][0]+' · free';if(w.s&&w.s.length)return w.s[0][0];if(w.r&&w.r.length)return 'Rent';if(w.b&&w.b.length)return 'Buy';return 'Not streaming'}
const dirNames=f=>(f.dir||[]).map(d=>d.n);

/* ---------- colors: each film's own, read from its poster ---------- */
const PK='pb_scpal';let PAL={};try{PAL=JSON.parse(localStorage.getItem(PK)||'{}')||{}}catch(e){PAL={}}
const PTRY={};let PQ=[],PN=0;
function hsh(s){let x=5381;s=String(s);for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))>>>0;return x}
function palOf(x){const p=x&&PAL[x.id];if(p&&p.length===3)return p;const h=hsh(x?x.title||x.id:'x')%360;return[hslHex(h,.42,.3),hslHex((h+16)%360,.4,.13),hslHex((h+38)%360,.62,.68)]}
function lum(hex){const n=parseInt(String(hex).slice(1),16);if(isNaN(n))return 0;const c=[n>>16&255,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
const inkOf=hex=>lum(hex)>.36?'#141414':'#fff';
function pv(x){const p=palOf(x);return `--p1:${p[0]};--p2:${p[1]};--p3:${p[2]};--pi:${inkOf(p[0])}`}
function rgbHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let h=0,s=0;
  if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,s,l]}
/* a poster's three colors: its main color for spines and panels, a deep shade of it, and its brightest accent for rings and scores */
function palFrom(d){
  const pts=[];for(let i=0;i<d.length;i+=4){if(d[i+3]<128)continue;pts.push([d[i],d[i+1],d[i+2]])}
  if(!pts.length)return null;
  const K=6,dist=(p,c)=>(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;
  const cen=[pts[0].slice()];while(cen.length<K){let bi=0,bv=-1;for(let i=0;i<pts.length;i+=3){let m=1e9;for(const c of cen)m=Math.min(m,dist(pts[i],c));if(m>bv){bv=m;bi=i}}if(bv<200)break;cen.push(pts[bi].slice())}
  const as=new Array(pts.length).fill(0);
  for(let it=0;it<7;it++){for(let i=0;i<pts.length;i++){let b=0,bv=1e9;for(let j=0;j<cen.length;j++){const v=dist(pts[i],cen[j]);if(v<bv){bv=v;b=j}}as[i]=b}
    const sm=cen.map(()=>[0,0,0,0]);for(let i=0;i<pts.length;i++){const t=sm[as[i]];t[0]+=pts[i][0];t[1]+=pts[i][1];t[2]+=pts[i][2];t[3]++}
    for(let j=0;j<cen.length;j++)if(sm[j][3])cen[j]=[sm[j][0]/sm[j][3],sm[j][1]/sm[j][3],sm[j][2]/sm[j][3]]}
  const cnt=cen.map(()=>0);for(const a of as)cnt[a]++;
  const cl=cen.map((c,j)=>{const[h,s,l]=rgbHsl(...c);return{h,s,l,p:cnt[j]/pts.length}}).filter(c=>c.p>.02);
  if(!cl.length)return null;
  const main=cl.slice().sort((a,b)=>(b.p*(.35+Math.min(b.s,.8))*(b.l>.06&&b.l<.92?1:.25))-(a.p*(.35+Math.min(a.s,.8))*(a.l>.06&&a.l<.92?1:.25)))[0];
  const acc=cl.slice().sort((a,b)=>(b.s*(b.l>.18&&b.l<.88?1:.3)+b.p*.6)-(a.s*(a.l>.18&&a.l<.88?1:.3)+a.p*.6))[0];
  const ms=Math.min(.7,main.s<.08?main.s:Math.max(.25,main.s));
  const p1=hslHex(main.h,ms,Math.max(.2,Math.min(.4,main.l)));
  const p2=hslHex(main.h,Math.min(.6,ms),Math.max(.07,Math.min(.14,main.l*.45)));
  let ah=acc.h,as2=acc.s;if(acc.s<.14){ah=main.h;as2=main.s<.08?.08:.5}
  const p3=hslHex(ah,Math.min(.85,Math.max(as2<.1?as2:.45,as2)),.7);
  return[p1,p2,p3];
}
function palLoad(x){if(!x||!x.poster||PAL[x.id]||PTRY[x.id])return;PTRY[x.id]=1;PQ.push(x);palPump()}
function palPump(){while(PN<3&&PQ.length){const x=PQ.shift();PN++;
  const im=new Image();im.crossOrigin='anonymous';im.decoding='async';
  im.onload=()=>{try{const c=document.createElement('canvas');c.width=24;c.height=36;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,24,36);
      const p=palFrom(g.getImageData(0,0,24,36).data);if(p){PAL[x.id]=p;try{localStorage.setItem(PK,JSON.stringify(PAL))}catch(e){}palPaint(x)}}catch(e){}PN--;palPump()};
  im.onerror=()=>{PN--;palPump()};im.src=TM_IMG+'w92'+x.poster}}
function palPaint(x){const p=palOf(x),st={'--p1':p[0],'--p2':p[1],'--p3':p[2],'--pi':inkOf(p[0])};
  $$('[data-scp="'+x.id+'"]').forEach(el=>{for(const k in st)el.style.setProperty(k,st[k]);if(el.classList.contains('scd'))el.style.setProperty('--g',p[2])});
  const root=$('#scx');if(root&&root.dataset.bg===x.id){const b=root.querySelector('.pvbg');if(b){b.style.setProperty('--x1',p[0]);b.style.setProperty('--x2',p[2]);b.style.setProperty('--x3',p[1])}}}

/* ---------- small pieces ---------- */
const IMG=(p,w)=>TM_IMG+(w||'w342')+p;
function poster(x,o){o=o||{};const p=x.poster||x.p||'';
  return `<span class="scpo"${x.id?` data-scp="${esc(x.id)}" style="${pv(x)}"`:` style="--p1:#2a2433;--p2:#141118"`}>${p?`<img src="${IMG(p,o.w)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}<span class="t">${esc(x.title||x.t||'')}</span>${o.bdg?`<span class="bdg">${esc(o.bdg)}</span>`:''}${o.sc?`<span class="sc">${o.sc}</span>`:''}${o.no?`<span class="no">No.${pad(o.no)}</span>`:''}</span>`}
function bar(v,act,id,cls){return `<div class="sc-bar${cls?' '+cls:''}" role="group" aria-label="Rating${v?', '+f1(v)+' out of 10':', not rated'}">${SCORES.map(s=>`<button type="button" class="${v>=s?'on':''}" data-sc="${act}" data-id="${esc(id)}" data-v="${s}" aria-label="Rate ${f1(s)}"></button>`).join('')}</div>`}
/* the disc: a lit ring per watch, center out; moments spark on their watch's ring where they happen in the film */
function disc(f,o){o=o||{};const w=W(f),n=Math.min(w.length,9),off=w.length-n,p=palOf(f),run=(f.runtime||120)*60;
  const sel=o.sel==null?w.length-1:o.sel,size=i=>Math.round(n<=1?70:46+(i/(n-1))*47);
  let rings='',mos='';
  for(let i=0;i<n;i++){const k=off+i,s=size(i);rings+=`<i class="rg${k===sel&&o.hi?' on':''}" style="--s:${s}%;--i:${i}"></i>`;
    for(const m of (f.mo||[]).filter(m=>m.w===w[k].id)){const a=(Math.min(m.s,run)/run)*2*Math.PI-Math.PI/2,r=s/2;
      mos+=`<i class="mo" style="left:${(50+r*Math.cos(a)).toFixed(2)}%;top:${(50+r*Math.sin(a)).toFixed(2)}%;--i:${i}"></i>`}}
  const cur=w[sel],lab=o.lab!=null?o.lab:(cur&&cur.r?f1(cur.r):(n?'RATE IT':'NOT YET'));
  return `<div class="scd${n?'':' blank'}${o.land?' land':''}${o.cls?' '+o.cls:''}" data-scp="${esc(f.id)}" style="${pv(f)};--g:${p[2]};--n:${n}${o.d?';--d:'+o.d:''}" aria-hidden="true"><div class="spin">${rings}${mos}</div><span class="hub"></span>${lab?`<span class="lab${n&&cur&&cur.r?'':' none'}">${esc(lab)}</span>`:''}</div>`}
const scoreTxt=f=>{const s=score(f);return s?f1(s):''};
const delta=(f,i)=>{const w=W(f);const a=w[i];if(!a||!a.r)return '';for(let k=i-1;k>=0;k--)if(w[k].r){const d=a.r-w[k].r;return Math.abs(d)<.01?'=':(d>0?'+':'−')+f1(Math.abs(d))}return 'NEW'};
const dCls=s=>s&&s[0]==='+'?'up':s&&s[0]==='−'?'dn':'';
function toast(t){$$('.sc-toast').forEach(e=>e.remove());const d=document.createElement('div');d.className='sc-toast';d.setAttribute('role','status');d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3300)}
const NEED=new Set();   /* posters on this draw, for their colors */
const P=(x)=>{if(x&&x.id)NEED.add(x.id);return x};

/* ---------- the page ---------- */
function render(){
  try{migrate()}catch(e){}
  RK=ranked();NEED.clear();
  let body='',bgx=null,cls='';
  const f=U.open&&byId(U.open);
  if(U.open&&!(f&&f.type==='film')){U.open=null;uSave()}
  const s=U.box&&byId(U.box);
  if(U.box&&!(s&&s.type==='show')){U.box=null;uSave()}
  if(U.open&&f){body=caseView(f);bgx=f;cls=' sc-case'+(T.wait?' sc-wait':'')}
  else if(U.box&&s){body=boxView(s);bgx=s;cls=' sc-boxv'}
  else if(U.person){body=personView(U.person);cls=' sc-person'}
  else{const seg=U.seg;
    body=topRow()+(seg==='boxes'?boxesView():seg==='people'?peopleView():seg==='diary'?diaryView():seg==='stats'?statsView():homeView());
    bgx=seg==='films'?heroFilm().f:null}
  const cols=bgx?palOf(bgx):RK.slice(0,3).map(x=>palOf(x)[0]);
  if(bgx)P(bgx);
  const c=bgx?[cols[0],cols[2],cols[1]]:cols;
  return `<section class="pv scx${cls}" id="scx"${bgx?` data-bg="${esc(bgx.id)}" data-scp="${esc(bgx.id)}" style="${pv(bgx)}"`:''}>${pvBg(c)}${body}</section>${T.add?addSheet():''}${T.svcs?svcSheet():''}`;
}
function topRow(){const segs=[['films','Films',films().length],['boxes','Box sets',shows().length],['people','People',''],['diary','Diary',''],['stats','Stats','']];
  return `<div class="sc-top"><div class="pvseg" role="group" aria-label="Screen sections">${segs.map(([k,l,n])=>`<button type="button" data-sc="seg" data-v="${k}" aria-pressed="${U.seg===k}">${l}${n!==''?` <span>${n}</span>`:''}</button>`).join('')}</div><span class="sp"></span>
    <button type="button" class="pvin" data-sc="add">${svgI(IC.search,20)}<span>Search films and shows</span></button>
    <button type="button" class="pvb w sm" data-sc="add" data-m="log">${svgI(IC.plus)}Log a watch</button></div>`}

/* ===== HOME ===== */
function heroFilm(){
  if(U.pick){const f=byId(U.pick);if(f&&f.type==='film'&&!seen(f))return{f,pick:true};U.pick=null}
  let best=null,bk='';for(const f of films()){const l=lastW(f);if(!l)continue;const k=(l.d||'0000')+'|'+String(l.t||0).padStart(15,'0');if(k>bk){bk=k;best=f}}
  return{f:best,pick:false};
}
function homeView(){
  return `<div class="sc-in-up" style="display:contents">${hero()}${faceOut()}${upNext()}${retAndNew()}${shelf()}</div>`;
}
function hero(){
  const{f,pick}=heroFilm();
  if(!f)return `<div class="sc-hero" id="scs-hero" style="--i:0"><div class="tx"><span class="sc-k">The player is empty</span><h1>Your shelf starts here</h1><p class="pvsub">Search a film, then log a watch: it gets a spine on the shelf, a ring on its disc for every watch, and its own colors from the poster.</p><div class="acts"><button class="pvb w" data-sc="add">${svgI(IC.search)}Search TMDB</button>${films().length?`<button class="pvb" data-sc="pick">${svgI(IC.shuffle)}Pick from my list</button>`:''}</div></div><div class="sc-deck">${blankDeck()}</div></div>`;
  P(f);const w=W(f),l=lastW(f),i=w.length-1,dl=delta(f,i),where=bestWhere(f),link=f.watch&&f.watch.link;
  const meta=[f.year,dirNames(f).slice(0,2).join(' & '),rt(f.runtime),(f.genres||[]).slice(0,2).join(', ')].filter(Boolean).join(' · ');
  const kick=pick?`Tonight's pick · from your list${where?' · '+where:''}`:`In the player · No.${pad(f.no||0)} · ${dK(l&&l.d)}`;
  const rv=!pick&&(cardOf(f)||'');
  const acts=pick
    ?`<button class="pvb w" data-sc="open" data-id="${f.id}">Open the case</button><button class="pvb" data-sc="logw" data-id="${f.id}">${svgI(IC.check)}Watched it</button><button class="pvb" data-sc="pick">${svgI(IC.shuffle)}Another pick</button><button class="pvb" data-sc="unpick">Back to the player</button>`
    :`<button class="pvb w" data-sc="open" data-id="${f.id}">Open the case</button><button class="pvb" data-sc="rewatch" data-id="${f.id}">${svgI(IC.again)}Log a rewatch</button>${films().some(x=>!seen(x))?`<button class="pvb" data-sc="pick">${svgI(IC.shuffle)}Tonight's pick</button>`:''}`;
  return `<div class="sc-hero${pick?' pick':''}" id="scs-hero" data-scp="${f.id}" style="${pv(f)};--i:0">
    <div class="tx"><span class="sc-k">${esc(kick)}</span><h1>${esc(f.title)}</h1>${meta?`<span class="meta">${esc(meta)}</span>`:''}
      ${pick?'':`<div class="scpill">${score(f)?`<b>${scoreTxt(f)}</b>`:''}<span>${plural(w.length,'watch','watches')}${dl&&dl!=='NEW'?` · <span class="${dCls(dl)}">${dl} vs the last one</span>`:''}${w.length>1?` · ${plural(w.length,'ring')} on the disc`:''}</span></div>`}
      ${rv?`<p class="rv">“${esc(rv)}”</p>`:pick&&f.overview?`<p class="pvsm" style="max-width:620px">${esc(f.overview.slice(0,260))}${f.overview.length>260?'…':''}</p>`:''}
      <div class="acts">${acts}${link&&(onMine(f)||pick)?`<a class="pvb" href="${esc(link)}" target="_blank" rel="noopener">${svgI(IC.play)}Where to play it</a>`:''}</div></div>
    <div class="sc-deck">${disc(f,{land:T.land===f.id})}<i class="tray"></i><div class="box"><span class="sc-lcd">${pick?'READY':'▶ '+(rt(f.runtime)||'--')+' · W'+w.length}</span><span class="sp"></span><span class="sc-led"></span><span class="brand">PLAYBACK</span></div></div></div>`;
}
function blankDeck(){return `<div class="scd blank" aria-hidden="true"><span class="hub"></span></div><i class="tray"></i><div class="box"><span class="sc-lcd">NO DISC</span><span class="sp"></span><span class="brand">PLAYBACK</span></div>`}
function faceOut(){
  if(!RK.length)return '';
  const pins=RK.filter(f=>f.fo),list=[...pins,...RK.filter(f=>!f.fo)].slice(0,5);
  return `<div class="sc-sec" id="scs-fo" style="--i:1"><div class="sc-sech"><h2 class="sc-h2">Face-out</h2><span class="sc-sub">Your top five, turned to show their covers, with your shelf card</span><span class="sp"></span><span class="sc-sub">Pin a film from its case to keep it here</span></div>
    <div class="sc-fo">${list.map((f,i)=>{P(f);const c=cardOf(f),w=W(f);return `<button type="button" class="sctile" data-sc="open" data-id="${f.id}" aria-label="${esc(f.title)}, ${scoreTxt(f)}">${poster(f,{no:f.no,w:'w500'})}
      <span class="sccard" style="--rot:${[-2,1.5,-1,2,-1.5][i]}deg"><span class="h"><span>${f.fo?'PINNED':'YOUR PICK'}</span><b>${scoreTxt(f)}${w.length>1?' · '+w.length+' WATCHES':''}</b></span><p class="${c?'':'ph'}">${esc(c||'Open the case to write its shelf card.')}</p></span></button>`}).join('')}</div></div>`;
}
function upList(){
  let L=films().filter(f=>!seen(f));
  if(U.upf==='mine')L=L.filter(f=>onMine(f));
  if(U.upf==='short')L=L.filter(f=>f.runtime&&f.runtime<=120);
  const lv=f=>{const d=days(f.lv);return d!=null&&d>=0?d:9999};
  return L.sort((a,b)=>Math.min(lv(a),45)-Math.min(lv(b),45)||(onMine(b)?1:0)-(onMine(a)?1:0)||(b.add||0)-(a.add||0)||a.title.localeCompare(b.title));
}
function upNext(){
  const all=films().filter(f=>!seen(f)),L=upList(),max=PHONE()?8:14,show=T.upAll?L:L.slice(0,max);
  const chips=[['all','All',all.length],['mine','On my services',all.filter(f=>onMine(f)).length],['short','Under 2 hours',all.filter(f=>f.runtime&&f.runtime<=120).length]];
  return `<div class="sc-sec" id="scs-up" style="--i:2"><div class="sc-sech"><h2 class="sc-h2">Up next</h2><span class="sc-sub">Your list${mySvcs().length?', with what’s on your services first':''}</span><span class="sp"></span>
      <div class="sc-chips">${chips.map(([k,l,n])=>`<button type="button" class="pvchip" data-sc="upf" data-v="${k}" aria-pressed="${U.upf===k}">${l} <span>${n}</span></button>`).join('')}
      <button type="button" class="pvchip" data-sc="svcs">${mySvcs().length?'My services · '+mySvcs().length:'Set my services'}</button>${all.length?`<button type="button" class="pvchip" data-sc="pick">${svgI(IC.shuffle,16)}Shuffle a pick</button>`:''}</div></div>
    ${L.length?`<div class="sc-row">${show.map(f=>{P(f);const d=days(f.lv),mine=onMine(f),why=d!=null&&d>=0?'Leaves '+(f.lvs||mine||'its service')+' '+dS(f.lv):mine?'On '+mine+' tonight':f.add?'On your list '+plural(Math.max(1,Math.round((Date.now()-f.add)/864e5)),'day'):(f.genres||[]).slice(0,2).join(', ');
      return `<button type="button" class="sctile" data-sc="open" data-id="${f.id}">${d!=null&&d>=0&&d<=60?`<span class="scstk${d>14?' later':''}">RETURN<br>BY ${mdy(f.lv)}</span>`:''}${poster(f,{bdg:bestWhere(f)})}<span class="m">${esc([f.year,rt(f.runtime)].filter(Boolean).join(' · '))}</span><span class="y">${esc(why||'')}</span></button>`}).join('')}</div>${L.length>show.length?`<button class="sc-link" data-sc="upall">Show all ${L.length}</button>`:''}`
      :`<p class="sc-empty">${all.length?'Nothing on your list matches that. ':'Nothing on your list yet. '}Search a film and choose <b>Add to list</b>, or tap <b>+ list</b> under a recommendation in any film's case.</p>`}</div>`;
}
function retAndNew(){
  const ret=films().filter(f=>!seen(f)&&days(f.lv)!=null&&days(f.lv)>=0).sort((a,b)=>a.lv.localeCompare(b.lv)).slice(0,6);
  const all=[];for(const f of films())W(f).forEach((w,i)=>all.push({f,w,i}));
  all.sort((a,b)=>(b.w.d||'').localeCompare(a.w.d||'')||(b.w.t||0)-(a.w.t||0));
  const wk=all.filter(x=>{const d=days(x.w.d);return d!=null&&d>=-7}),recent=wk.length>=2,L=(recent?wk:all).slice(0,6);
  if(!L.length&&!ret.length)return '';
  const nw=L.length?`<div class="sc-sec" id="scs-new"><div class="sc-sech"><h2 class="sc-h2">${recent?'New this week':'Lately'}</h2><span class="sc-sub">Your latest watches${recent?', before they’re shelved':''}</span></div>
    <div class="sc-row">${L.map(({f,w,i})=>{P(f);return `<button type="button" class="sctile" data-sc="open" data-id="${f.id}" data-w="${i}">${w.at==='theater'?'<span class="scstub">ADMIT 1</span>':''}${poster(f,{sc:w.r?f1(w.r):''})}<span class="m">${esc((w.at==='theater'?'Theater':'Home')+(w.svc?' · '+w.svc:'')+' · '+dS(w.d))}</span><span class="y">${i?'Watch '+(i+1):'First watch'}</span></button>`}).join('')}</div></div>`:'';
  const rb=ret.length?`<div class="sc-sec" id="scs-ret"><div class="sc-sech"><h2 class="sc-h2">Return by</h2><span class="sc-sub">On your list and leaving soon</span></div>
    <div class="sc-row">${ret.map(f=>{P(f);const d=days(f.lv);return `<button type="button" class="sctile" data-sc="open" data-id="${f.id}"><span class="scstk${d>14?' later':''}">RETURN<br>BY ${mdy(f.lv)}</span>${poster(f)}<span class="m">${esc(f.lvs||onMine(f)||bestWhere(f)||'')}${f.runtime?' · '+rt(f.runtime):''}</span><span class="y">${d===0?'Last day':d===1?'Leaves tomorrow':'Leaves in '+d+' days'}</span></button>`}).join('')}</div></div>`:'';
  return rb&&nw?`<div class="sc-two" style="--i:3">${rb}${nw}</div>`:`<div style="--i:3">${rb||nw}</div>`;
}
/* THE SHELF */
const SORTS=[['score','By score'],['no','By No.'],['dir','By director'],['year','By decade'],['watched','By year watched']];
const SHF=[['all','All'],['own','Owned'],['th','Seen in a theater'],['re','Rewatched'],['un','Unrated']];
function shelfFilms(){
  let L=films().filter(seen);const q=nrm(U.shq||'');
  if(U.shf==='own')L=L.filter(f=>f.own);if(U.shf==='th')L=L.filter(f=>theaterW(f).length);if(U.shf==='re')L=L.filter(f=>W(f).length>1);if(U.shf==='un')L=L.filter(f=>!score(f));
  if(q)L=L.filter(f=>nrm(f.title+' '+dirNames(f).join(' ')+' '+(f.year||'')).includes(q));
  return L;
}
function shelfGroups(L){
  const g=new Map(),add=(k,lab,f,ord)=>{if(!g.has(k))g.set(k,{lab,ord,l:[]});g.get(k).l.push(f)};
  const byR=(a,b)=>score(b)-score(a)||W(b).length-W(a).length||a.title.localeCompare(b.title);
  if(U.sort==='score')for(const f of L){const s=score(f);add(s?String(s):'u',s?f1(s):'Unrated',f,s?-s:1)}
  else if(U.sort==='no')for(const f of L){const b=Math.floor(((f.no||1)-1)/25);add(b,'No.'+(b*25+1),f,b)}
  else if(U.sort==='dir')for(const f of L){const d=dirNames(f)[0]||'';const last=d?d.split(' ').slice(-1)[0]:'';add(d||'~','' +(last||'Unknown'),f,d?nrm(last):'~')}
  else if(U.sort==='year')for(const f of L){const y=parseInt(f.year,10);const dc=y?Math.floor(y/10)*10:0;add(dc,dc?dc+'s':'Undated',f,dc?-dc:1)}
  else for(const f of L){const y=(W(f)[0].d||'').slice(0,4);add(y||'0',y||'Undated',f,y?-y:1)}
  const out=[...g.values()].sort((a,b)=>a.ord<b.ord?-1:a.ord>b.ord?1:0);
  for(const x of out)x.l.sort(U.sort==='no'?(a,b)=>(a.no||0)-(b.no||0):U.sort==='year'?(a,b)=>(parseInt(a.year)||0)-(parseInt(b.year)||0)||byR(a,b):byR);
  return out;
}
let ORDER=[];
function spine(f){P(f);const s=score(f),w=W(f),run=f.runtime||110;
  const wd=Math.round(Math.max(28,Math.min(46,18+run/7))),h=Math.round(s?206+s*5:200);
  return `<div class="scsw"><button type="button" class="scsp${s?'':' unw'}" data-sc="open" data-id="${f.id}" data-scp="${f.id}" style="${pv(f)};--w:${wd}px;--h:${h}px" aria-label="${esc(f.title)}${s?', '+f1(s):''}, ${plural(w.length,'watch','watches')}">${theaterW(f).length?'<i class="stb" aria-hidden="true"></i>':''}<span class="no">${pad(f.no||0)}</span><span class="t">${esc(f.title)}</span><span class="bt"><span class="nt">${w.slice(0,8).map(()=>'<i></i>').join('')}</span><b class="r">${s?f1(s):'–'}</b></span>${f.own?'<i class="own" aria-hidden="true"></i>':''}</button></div>`}
function shelfList(){
  const L=shelfFilms(),G=shelfGroups(L);ORDER=G.flatMap(x=>x.l.map(f=>f.id));
  if(!L.length)return `<div id="scs-shl"><p class="sc-empty">${films().some(seen)?'No film on the shelf matches that.':'Films you watch get a spine here.'}</p></div>`;
  return `<div id="scs-shl"><div class="scshelf">${G.map(x=>`<div class="scsw"><span class="scbe" aria-hidden="true">${esc(x.lab)}</span></div>${x.l.map(spine).join('')}`).join('')}</div></div>`;
}
function shelf(){
  const n=films().filter(seen).length;
  return `<div class="sc-sec" id="scs-shelf" style="--i:4"><div class="sc-sech"><h2 class="sc-h2">The shelf</h2><span class="sc-sub">${plural(n,'film')} · notches = watches · a stub peeking out = seen in a theater · gold band = you own the disc</span></div>
    <div class="sc-shtools"><div class="pvseg sm" role="group" aria-label="Sort the shelf" style="background:rgb(0 0 0 / .22)">${SORTS.map(([k,l])=>`<button type="button" data-sc="sort" data-v="${k}" aria-pressed="${U.sort===k}">${l}</button>`).join('')}</div>
      ${SHF.map(([k,l])=>`<button type="button" class="pvchip" data-sc="shf" data-v="${k}" aria-pressed="${U.shf===k}">${l}</button>`).join('')}
      <label class="pvin">${svgI(IC.search,18)}<input type="search" data-scc="shq" value="${esc(U.shq||'')}" placeholder="Find a film or director" aria-label="Find on the shelf" autocomplete="off"></label></div>
    ${shelfList()}</div>`;
}

/* ===== THE CASE ===== */
function selW(f){const n=W(f).length;let i=U.wsel[f.id];if(i==null||i>=n||i<0)i=n-1;return i}
function caseView(f){
  P(f);const w=W(f),si=selW(f),cw=w[si]||null,rk=rankOf(f),dr=f.dir||[];
  const tot=w.length*(f.runtime||0);
  let dirRank='';if(dr.length&&score(f)){const mine=RK.filter(x=>(x.dir||[]).some(d=>d.id===dr[0].id));if(mine.length>1)dirRank=`<div><b>#${mine.indexOf(f)+1}</b><span>of ${mine.length} ${esc(dr[0].n.split(' ').slice(-1)[0])} films</span></div>`}
  if(!dirRank&&score(f)&&f.year){const yr=RK.filter(x=>x.year===f.year);dirRank=`<div><b>#${yr.indexOf(f)+1}</b><span>of your ${yr.length} from ${esc(f.year)}</span></div>`}
  const idx=ORDER.indexOf(f.id),ord=idx>=0?ORDER:RK.map(x=>x.id),k=ord.indexOf(f.id);
  const link=f.watch&&f.watch.link,where=onMine(f)||'';
  const fr=accFr(f);
  const stubs=theaterW(f);
  const meta=[f.year?esc(f.year):'',dr.length?dr.map(d=>`<button type="button" data-sc="person" data-pid="${d.id}">${esc(d.n)}</button>`).join(' & '):'',esc(rt(f.runtime)),esc((f.genres||[]).join(', '))].filter(Boolean).join(' · ');
  const left=`<div class="pl" style="--bgimg:${f.bd?`url('${IMG(f.bd,'w780')}')`:f.poster?`url('${IMG(f.poster,'w342')}')`:'none'}">
      <div class="sc-pocket">${stubs.length?stubs.slice(-3).map((x,j)=>`<button type="button" class="stb" style="--rot:${[-5,4,-2][j]}deg" data-sc="wsel" data-id="${f.id}" data-i="${w.indexOf(x)}"><b>ADMIT ONE${x.svc?' · '+esc(x.svc.toUpperCase()):''}</b>${esc(f.title.toUpperCase().slice(0,26))}<br>${esc(dK(x.d))}<br>WATCH ${w.indexOf(x)+1}${x.r?' · '+f1(x.r):''}</button>`).join('')+(stubs.length>3?`<span class="ph">+${stubs.length-3} more stubs</span>`:`<span class="ph">${plural(stubs.length,'stub')} in the pocket</span>`)
        :`<span class="ph">The pocket. Log a watch as <b>Theater</b> and its ticket stub lands here.</span>`}</div>
      <div><h1 class="sc-ttl">${esc(f.title)}</h1>${meta?`<div class="sc-meta">${meta}</div>`:''}</div>
      <div class="sc-stats">${rk?`<div><b>#${rk}</b><span>of ${RK.length} films you've rated</span></div>`:`<div><b>${w.length?'–':'On list'}</b><span>${w.length?'not rated yet':f.add?'since '+dS(ymd(new Date(f.add))):'not watched yet'}</span></div>`}
        <div><b>${tot?hrs(tot):plural(w.length,'watch','watches')}</b><span>${tot?plural(w.length,'watch','watches'):'with it so far'}</span></div>${dirRank||`<div><b>${f.no?'No.'+pad(f.no):'–'}</b><span>${f.no?'on your shelf':'no spine yet'}</span></div>`}</div>
      ${cardBlock(f)}
      <div class="sc-tags">
        <button type="button" class="sctag${f.own?' gold':''}" data-sc="own" data-id="${f.id}" aria-label="Owned on disc: ${f.own||'no'}. Tap to change">${f.own?'You own it · '+esc(f.own):'Own it on disc?'}</button>
        ${seen(f)?`<button type="button" class="sctag${f.fo?' on':''}" data-sc="fo" data-id="${f.id}" aria-pressed="${!!f.fo}">${svgI(IC.pin,15)}${f.fo?'Pinned face-out':'Pin face-out'}</button>`:''}
        ${fr.n?`<span class="sctag">Friends ${f1(Math.round(fr.avg*10)/10)} avg · ${fr.n}</span>`:''}
        ${f.tmdb?`<a class="sctag" href="https://www.themoviedb.org/movie/${f.tmdb}" target="_blank" rel="noopener">TMDB</a>`:''}</div>
      ${f.overview?`<p class="sc-ov">${esc(f.overview)}</p>`:''}
      ${provBlock(f)}
      ${f.cast&&f.cast.length?`<div class="sc-blk"><span class="sc-k">Starring</span><span class="sc-meta">${esc(f.cast.join(', '))}</span></div>`:''}
      ${recBlock(f)}
      <div class="sc-blk">${tmBar(f)}</div>
    </div>`;
  const right=`<div class="pr">
      <div class="sc-hubw" aria-hidden="true"><span class="hb"><i></i></span><span>The disc is in the player →</span></div>
      ${cw?watchForm(f,cw,si):notSeenForm(f)}
      ${cw?momentsBlock(f,cw):''}
      ${screenStrip(f)}
      <div class="sc-danger">${cw?`<button type="button" class="pvb dng sm${T.arm==='w'+cw.id?' sc-arm':''}" data-sc="wdel" data-id="${f.id}">${T.arm==='w'+cw.id?'Tap again to delete '+wName(f,cw).toLowerCase():'Delete '+wName(f,cw).toLowerCase()}</button>`:''}${delBtn(f.id,'Remove the film')}</div>
    </div>`;
  const player=`<div class="pp">${disc(f,{sel:si,hi:w.length>1,land:T.land===f.id})}
      <div class="sc-col">
      <div class="sc-deckbar"><span class="sc-lcd">${w.length?'W'+(si+1)+' OF '+w.length:'NO WATCHES'}</span><span class="sp"></span>
        ${w.length>1?`<button type="button" class="pvb ic sm" data-sc="wstep" data-id="${f.id}" data-d="-1" aria-label="Previous watch" ${si<=0?'disabled':''}>${svgI(IC.back)}</button><button type="button" class="pvb ic sm" data-sc="wstep" data-id="${f.id}" data-d="1" aria-label="Next watch" ${si>=w.length-1?'disabled':''}>${svgI(IC.next)}</button>`:''}
        <button type="button" class="pvb w sm" data-sc="rewatch" data-id="${f.id}">${svgI(IC.plus)}${w.length?'Rewatch':'Log a watch'}</button></div>
      ${cw?`<div class="sc-rate"><div class="h"><span>${esc(wName(f,cw))} · your rating${si===w.length-1||!w.slice(si+1).some(x=>x.r)?' · sets the score':''}</span><span>${cw.r?`<b>${f1(cw.r)}</b> · <button type="button" class="sc-link" style="padding:0;font-size:12px" data-sc="rclr" data-id="${f.id}">Clear</button>`:'tap a half-step'}</span></div>${bar(cw.r,'rate',f.id)}</div>`:''}
      ${w.length?`<div class="sc-wl"><span class="sc-k" style="font-size:11px">Rings · center out</span>${w.map((x,i)=>{const dl=delta(f,i);return `<button type="button" class="sc-w" data-sc="wsel" data-id="${f.id}" data-i="${i}" aria-pressed="${i===si}" style="--g:${i===si&&w.length>1?'#fff':'var(--p3)'}"><span class="c"></span><span class="tx"><b style="font:600 14px var(--body)">Watch ${i+1}</b> · ${esc(dS(x.d))}<small>${esc((x.at==='theater'?'Theater':'Home')+(x.svc?' · '+x.svc:''))}${dl&&dl!=='NEW'?` · <span class="${dCls(dl)}">${dl}</span>`:''}</small></span><b>${x.r?f1(x.r):'–'}</b></button>`}).join('')}</div>`
        :`<div class="sc-nw"><p class="pvsm">Not watched yet. Log a watch and its first ring lights up.</p></div>`}
      </div></div>`;
  return `<div class="sc-cbar"><button type="button" class="pvb sm" data-sc="close">${svgI(IC.back)}Back to the shelf</button>
      <span class="sc-k">${f.no?'No.'+pad(f.no)+' · ':''}${w.length?'first watched '+esc(dS(w[0].d)):'on your list'}</span><span class="sp"></span>
      ${link?`<a class="pvb sm" href="${esc(link)}" target="_blank" rel="noopener">${svgI(IC.play)}${where?'Play on '+esc(where):'Where to watch'}</a>`:''}
      ${ord.length>1&&k>=0?`<button type="button" class="pvb ic sm" data-sc="nav" data-d="-1" aria-label="Previous film on the shelf">${svgI(IC.back)}</button><button type="button" class="pvb ic sm" data-sc="nav" data-d="1" aria-label="Next film on the shelf">${svgI(IC.next)}</button>`:''}</div>
    <div class="pvseg sc-pgtabs" role="group" aria-label="Pages" style="background:rgb(0 0 0 / .4)">${['Disc','Liner notes','This watch'].map((l,i)=>`<button type="button" data-sc="pg" data-i="${i}" aria-pressed="${U.pg===i}">${l}</button>`).join('')}</div>
    <div class="sc-cw" data-pg="${U.pg}">${left}<div class="spn" aria-hidden="true"></div>${right}${player}</div>`;
}
function cardBlock(f){
  if(T.edit==='card'+f.id)return `<form class="sc-cardx" data-scf="card" data-id="${f.id}"><span class="h">YOUR SHELF CARD</span><textarea name="t" maxlength="160" aria-label="Shelf card" placeholder="One line you'd tape to the shelf">${esc(f.card||cardOf(f)||'')}</textarea><div class="row"><button>Save card</button><button type="button" class="g" data-sc="cardx">Cancel</button></div></form>`;
  const c=cardOf(f);
  return `<div class="sc-cardx"><span class="h"><span>YOUR SHELF CARD${f.fo?' · FACE-OUT':''}</span><span class="sp"></span><button type="button" data-sc="card" data-id="${f.id}">${c?'Edit':'Write one'}</button></span><p class="${c?'':'ph'}">${esc(c||(seen(f)?'One line you’d tape to the shelf. Your top five show theirs face-out.':'Watch it first, then write the line you’d tape to the shelf.'))}</p></div>`}
function watchForm(f,w,i){
  const prov=f.watch?[...new Set([...(f.watch.s||[]),...(f.watch.f||[]),...(f.watch.r||[]),...(f.watch.b||[])].map(p=>p[0]))]:[];
  const opts=[...new Set([...mySvcs(),...prov,w.svc].filter(Boolean))];
  return `<div class="sc-form"><div class="r" style="justify-content:space-between"><span class="sc-k" style="font-size:11px">${esc(wName(f,w))} · the details</span>${i===W(f).length-1?'<span class="sc-sub" style="font-size:12px">latest</span>':''}</div>
    <div class="r"><label for="sc-wd">Day</label><input class="sc-in" id="sc-wd" type="date" value="${esc(w.d||'')}" max="${ymd()}" data-scc="wd" data-id="${f.id}"></div>
    <div class="r"><label>Where</label><div class="pvseg sm" role="group" aria-label="Where you watched it" style="background:rgb(0 0 0 / .3)">${[['home','Home'],['theater','Theater']].map(([k,l])=>`<button type="button" data-sc="wat" data-id="${f.id}" data-v="${k}" aria-pressed="${(w.at||'home')===k}">${l}</button>`).join('')}</div>
      <select class="sc-in" data-scc="wsvc" data-id="${f.id}" aria-label="On which service"><option value="">${w.at==='theater'?'Which theater or format?':'On which service?'}</option>${(w.at==='theater'?['IMAX','Dolby Cinema','70mm','Standard',...opts]:opts.concat(['Disc','Download','Other'])).filter((v,j,a)=>a.indexOf(v)===j).map(o=>`<option${o===w.svc?' selected':''}>${esc(o)}</option>`).join('')}${w.svc&&!opts.includes(w.svc)&&!['IMAX','Dolby Cinema','70mm','Standard','Disc','Download','Other'].includes(w.svc)?`<option selected>${esc(w.svc)}</option>`:''}</select></div>
    <form data-scf="rev" data-id="${f.id}" style="display:flex;flex-direction:column;gap:8px"><label for="sc-rv">Review</label><textarea class="sc-in" id="sc-rv" name="rv" maxlength="4000" placeholder="What stuck with you this time?">${esc(w.rv||'')}</textarea><div class="r"><button class="pvb sm">Save review</button>${w.rv?'<span class="sc-sub" style="font-size:12px">The first line becomes your shelf card unless you write one.</span>':''}</div></form></div>`}
function notSeenForm(f){
  return `<div class="sc-form"><span class="sc-k" style="font-size:11px">On your list</span><p class="pvsm" style="margin:0">Watched it? Log the watch and rate it on the disc. Leaving a service soon? Give it a return-by date and it gets a sticker on the home page.</p>
    <div class="r"><button type="button" class="pvb w sm" data-sc="rewatch" data-id="${f.id}">${svgI(IC.check)}Log a watch</button></div>
    <div class="r"><label for="sc-lv">Return by</label><input class="sc-in" id="sc-lv" type="date" value="${esc(f.lv||'')}" min="${ymd()}" data-scc="lv" data-id="${f.id}">${f.lv?`<button type="button" class="sc-link" data-sc="lvx" data-id="${f.id}">Clear</button>`:''}</div></div>`}
function fmtS(s){s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function parseS(t){t=String(t||'').trim();if(!t)return null;if(/^\d+$/.test(t))return +t*60;const p=t.split(':').map(Number);if(p.some(isNaN)||p.length>3)return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1]}
function momentsBlock(f,cw){
  const all=(f.mo||[]).slice().sort((a,b)=>a.s-b.s),w=W(f);
  return `<div class="sc-blk"><span class="sc-k">Moments · they spark on the disc</span>
    <div class="sc-mos">${all.length?all.map(m=>{const wi=w.findIndex(x=>x.id===m.w);return `<div class="sc-mo${T.newMo===m.id?' new':''}"><span class="d"></span><b>${fmtS(m.s)}</b><span>${esc(m.n)}</span><small>${wi>=0?'W'+(wi+1):''}</small><button type="button" data-sc="model" data-id="${f.id}" data-m="${m.id}" aria-label="Remove moment">×</button></div>`}).join('')
      :'<p class="pvsm" style="margin:0">Mark the scenes you’d rewind to. Each one sparks on this watch’s ring, at the point in the film it happens.</p>'}</div>
    <form class="sc-form" data-scf="mo" data-id="${f.id}" style="padding:12px"><div class="r"><input class="sc-in" name="s" placeholder="1:02:30" aria-label="Time in the film" style="width:96px" autocomplete="off" required><input class="sc-in" name="n" placeholder="The scene" aria-label="What happens" style="flex:1" maxlength="120" required autocomplete="off"><button class="pvb sm">+ Mark</button></div></form></div>`}
function accFr(f){try{if(!accOn())return{n:0,avg:0};const{k,t}=accScreenKeys(f),rows=accRowsFor('screen:'+f.id,k,t);return{n:rows.length,avg:rows.length?rows.reduce((a,b)=>a+b.r,0)/rows.length:0}}catch(e){return{n:0,avg:0}}}
function provBlock(f){
  if(!f.tmdb)return '';const w=f.watch;
  if(!w)return tmKey()?'<div class="sc-blk"><span class="sc-k">Where to watch</span><span class="pvsm">Checking…</span></div>':'';
  const mine=mySvcs(),chip=p=>`<span class="sctag${mine.includes(p[0])?' mine':''}">${p[1]?`<img src="${TM_IMG}w45${esc(p[1])}" alt="" loading="lazy" onerror="this.remove()">`:''}${esc(p[0])}</span>`;
  const rows=[['STREAM',w.s],['FREE',w.f],['RENT',w.r],['BUY',w.b]].filter(r=>r[1]&&r[1].length);
  return `<div class="sc-blk sc-prov"><span class="sc-k">Where to watch · ${esc(w.c||'US')}</span>${rows.length?rows.map(([k,l])=>`<div class="rw"><span>${k}</span>${l.map(chip).join('')}</div>`).join(''):`<span class="pvsm">Not streaming, for rent or for sale in the ${esc(w.c||'US')} right now.</span>`}
    <small>From JustWatch via TMDB · checked ${esc(new Date(w.at).toLocaleDateString([],{month:'short',day:'numeric'}))}${w.link?` · <a href="${esc(w.link)}" target="_blank" rel="noopener">links</a>`:''}</small></div>`}
const RKEY='pb_screc';let REC={};try{REC=JSON.parse(localStorage.getItem(RKEY)||'{}')||{}}catch(e){REC={}}
function recSave(){try{const k=Object.keys(REC);if(k.length>400)for(const x of k.sort((a,b)=>REC[a].at-REC[b].at).slice(0,k.length-400))delete REC[x];localStorage.setItem(RKEY,JSON.stringify(REC))}catch(e){}}
function recBlock(f){const r=REC[f.id];if(!r||!r.l||!r.l.length)return '';
  return `<div class="sc-blk"><span class="sc-k">If you liked this</span><div class="sc-recs">${r.l.slice(0,PHONE()?6:8).map(x=>{const have=(S.screen||[]).find(y=>y.type==='film'&&y.tmdb===x.id);
    return have?`<button type="button" class="sctile" data-sc="open" data-id="${have.id}">${P(have)&&poster(have,{w:'w185',sc:scoreTxt(have)})}<span class="m">${seen(have)?'On your shelf':'On your list'}</span></button>`
      :`<div class="sctile">${poster({t:x.t,p:x.p},{w:'w185'})}<span class="m">${esc(x.t)}${x.y?' · '+esc(x.y):''}</span><button type="button" class="add" data-sc="radd" data-tid="${x.id}" data-t="${esc(x.t)}">+ list</button></div>`}).join('')}</div></div>`}

/* ===== BOX SETS ===== */
function epTot(s){return epIds(s).length}
function boxesView(){
  const L=shows().slice().sort((a,b)=>(b.next&&b.next.d?1:0)-(a.next&&a.next.d?1:0)||showStatus(b).watched-showStatus(a).watched||a.title.localeCompare(b.title));
  return `<div class="sc-sec sc-in-up"><div class="sc-sech" style="--i:0"><h2 class="sc-h2">Box sets</h2><span class="sc-sub">Every show is a box; every season a disc whose edge lights up one mark per episode you rate</span><span class="sp"></span><button class="pvb sm" data-sc="add" data-m="box">${svgI(IC.plus)}Add a show</button></div>
    ${L.length?`<div class="sc-boxes" style="--i:1">${L.map(s=>{P(s);const ids=epIds(s),st=showStatus(s),rated=ids.filter(i=>rating(i)).length,r=rating(s.id),tag=s.next&&s.next.d?'New '+sxe(s.next.n,s.next.e)+' '+dS(s.next.d):st.done?'Finished':st.caught?'Caught up':st.stop?'Stopped at '+sxe(st.stop[0],st.stop[1]):'Not started';
      return `<button type="button" class="sc-bx" data-sc="box" data-id="${s.id}" data-scp="${s.id}" style="${pv(s)}"><span class="stack"><i></i><i></i>${poster(s,{sc:r?f1(r):'',bdg:s.seasons.filter(x=>x.eps).length+' S'})}</span><b>${esc(s.title)}</b><span class="m">${esc(tag)} · ${rated}/${ids.length} rated</span><span class="pg"><i style="width:${ids.length?Math.round(st.watched/ids.length*100):0}%"></i></span></button>`}).join('')}</div>`
      :`<p class="sc-empty" style="--i:1">No shows yet. Search one and choose <b>Add box set</b>.</p>`}</div>`;
}
function seasonOf(s){const ss=s.seasons.filter(x=>x.eps);let n=U.season[s.id];if(!ss.some(x=>x.n===n)){const st=showStatus(s),g=st.seasons.find(x=>x.state==='going')||st.seasons.find(x=>x.state==='new')||st.seasons[st.seasons.length-1];n=g?g.n:(ss[0]||{}).n}return n}
function boxView(s){
  if(tmNeedsEps(s))setTimeout(()=>tmLoadEps(s),0);else if(tmNeedsWatch(s))setTimeout(()=>tmLoadWatch(s),0);
  const ss=s.seasons.filter(x=>x.eps),n=seasonOf(s),se=ss.find(x=>x.n===n),ids=epIds(s),rated=ids.filter(i=>rating(i)),avg=rated.length?rated.reduce((a,i)=>a+rating(i),0)/rated.length:0,st=showStatus(s),line=stopText(s,st);
  const fan=`<div class="sc-fan"><div class="slip">${poster(s,{w:'w500'})}</div>${ss.map((x,i)=>{const k=ss.length,e=Array.from({length:x.eps},(_,j)=>sid(s.id,'s',x.n,'e',j+1)),lit=e.filter(id=>rating(id)).length,sr=rating(sid(s.id,'s',x.n));
      const seg=100/x.eps,parts=[];for(let j=0;j<x.eps;j++){const a=j*seg,b=a+seg*(x.eps>40?.7:.82);parts.push(`${rating(e[j])?'var(--p3)':isDone(e[j])?'rgb(255 255 255 / .5)':'rgb(255 255 255 / .13)'} ${a.toFixed(2)}% ${b.toFixed(2)}%`,`transparent ${b.toFixed(2)}% ${(a+seg).toFixed(2)}%`)}
      const fx=k===1?.75:.3+i*(.7/(k-1)),fy=k===1?.4:.04+i*(.92/(k-1));
      return `<button type="button" class="sd" data-sc="season" data-id="${s.id}" data-n="${x.n}" aria-pressed="${x.n===n}" style="left:calc((100% - var(--sdd)) * ${fx.toFixed(3)});top:calc((100% - var(--sdd)) * ${fy.toFixed(3)});z-index:${x.n===n?20:2+i}" aria-label="Season ${x.n}, ${lit} of ${x.eps} episodes rated"><span class="tk" style="background:conic-gradient(from -90deg,${parts.join(',')})"></span><span class="scd" data-scp="${s.id}" style="${pv(s)};--g:var(--p3)"><span class="hub"></span><span class="lab">${sr?f1(sr):'S'+x.n}</span></span></button>`}).join('')}</div>`;
  const sids=se?Array.from({length:se.eps},(_,j)=>sid(s.id,'s',se.n,'e',j+1)):[],sd=sids.filter(isDone).length,sk=se?sid(s.id,'s',se.n):'',sRated=sids.filter(i=>rating(i)),sAvg=sRated.length?sRated.reduce((a,i)=>a+rating(i),0)/sRated.length:0;
  const eps=se?sids.map((id,j)=>{const x=epInfo(s,se.n,j+1),open=T.eps[id],r=rating(id),day=x&&x.d?dS(x.d):'';
      return `<div class="sc-ep${isDone(id)?'':' un'}"><button type="button" class="ck" data-sc="ep" data-id="${id}" aria-pressed="${isDone(id)}" aria-label="Watched ${sxe(se.n,j+1)}">${svgI(IC.check)}</button><span class="n">E${j+1}</span>
        <span class="tt">${x&&x.o?`<button type="button" data-sc="epx" data-id="${id}" aria-expanded="${!!open}"><b>${esc(x.t||'Episode '+(j+1))}</b></button>`:`<b>${esc(x&&x.t||'Episode '+(j+1))}</b>`}<small>${esc([sxe(se.n,j+1),day,x&&x.rt?x.rt+'m':''].filter(Boolean).join(' · '))}</small>${open&&x&&x.o?`<p>${esc(x.o)}</p>`:''}</span>
        ${bar(r,'mr',id,'sm')}<b>${r?f1(r):''}</b></div>`}).join(''):'';
  return `<div class="sc-cbar"><button type="button" class="pvb sm" data-sc="closebox">${svgI(IC.back)}Box sets</button><span class="sc-k">${esc([s.network,s.status].filter(Boolean).join(' · '))}</span><span class="sp"></span>${s.watch&&s.watch.link?`<a class="pvb sm" href="${esc(s.watch.link)}" target="_blank" rel="noopener">${svgI(IC.play)}${onMine(s)?'Play on '+esc(onMine(s)):'Where to watch'}</a>`:''}</div>
    <div class="sc-shead"><h1 class="sc-ttl" style="flex:1 1 auto">${esc(s.title)}</h1><div class="scpill">${rating(s.id)?`<b>${f1(rating(s.id))}</b>`:''}<span>${rated.length?'episodes avg '+f1(Math.round(avg*10)/10)+' · ':''}${rated.length}/${ids.length} rated${line?' · '+esc(line):''}</span></div></div>
    ${s.next&&s.next.d?`<span class="sctag" style="align-self:flex-start">Next: ${sxe(s.next.n,s.next.e)} on ${esc(tmDay(s.next.d))}</span>`:''}
    <div class="sc-bxv">${fan}
      <div class="sc-seas">
        <div class="sc-rate"><div class="h"><span>The show · your rating</span><span>${rating(s.id)?`<button type="button" class="sc-link" style="padding:0;font-size:12px" data-sc="mrx" data-id="${s.id}">Clear</button>`:''}</span></div>${bar(rating(s.id),'mr',s.id)}</div>
        <div class="pvseg sm" role="group" aria-label="Seasons" style="background:rgb(0 0 0 / .26);align-self:flex-start">${ss.map(x=>`<button type="button" data-sc="season" data-id="${s.id}" data-n="${x.n}" aria-pressed="${x.n===n}">S${x.n}${rating(sid(s.id,'s',x.n))?' <span>'+f1(rating(sid(s.id,'s',x.n)))+'</span>':''}</button>`).join('')}</div>
        ${se?`<div class="sc-rate"><div class="h"><span>Season ${se.n} · ${sd}/${se.eps} watched${sRated.length?' · episodes avg '+f1(Math.round(sAvg*10)/10):''}${(se.total||0)>se.eps?' · '+(se.total-se.eps)+' more coming':''}</span><span><button type="button" class="sc-link" style="padding:0;font-size:12px" data-sc="sall" data-id="${s.id}" data-n="${se.n}">${sd===se.eps?'Clear season':'Mark season watched'}</button></span></div>${bar(rating(sk),'mr',sk)}</div>`:'<p class="pvsm">No episodes listed yet.</p>'}
        ${TME.busy===s.tmdb?'<p class="pvsm">Getting episode names from TMDB…</p>':''}
        <div class="sc-eps">${eps}</div>
        ${s.overview?`<p class="sc-ov">${esc(s.overview)}</p>`:''}
        ${provBlock(s)}
        ${screenStrip(s)}
        <div class="sc-blk">${tmBar(s)}</div>
        <div class="sc-danger">${delBtn(s.id,'Remove the show')}</div>
      </div></div>`;
}

/* ===== PEOPLE ===== */
const PPK='pb_scppl';let PPL={};try{PPL=JSON.parse(localStorage.getItem(PPK)||'{}')||{}}catch(e){PPL={}}
function pplSave(){try{localStorage.setItem(PPK,JSON.stringify(PPL))}catch(e){}}
function directors(){const m=new Map();
  for(const f of films())for(const d of f.dir||[]){if(!m.has(d.id))m.set(d.id,{id:d.id,n:d.n,p:d.p,l:[]});m.get(d.id).l.push(f)}
  return [...m.values()].map(x=>{const sc=x.l.filter(f=>score(f));return{...x,seen:x.l.filter(seen).length,avg:sc.length?sc.reduce((a,f)=>a+score(f),0)/sc.length:0,nr:sc.length}});
}
function peopleView(){
  const D=directors().filter(x=>x.seen).sort((a,b)=>b.seen-a.seen||b.avg-a.avg||a.n.localeCompare(b.n));
  const left=films().filter(f=>f.tmdb&&!f.enr).length;
  return `<div class="sc-sec sc-in-up"><div class="sc-sech" style="--i:0"><h2 class="sc-h2">People</h2><span class="sc-sub">Directors on your shelf. Open one for their whole filmography, lit by what you've seen</span></div>
    ${left&&tmKey()?`<p class="pvsm" style="--i:1">Reading credits from TMDB for ${plural(left,'more film')}…</p>`:''}
    ${!tmKey()?`<p class="sc-empty" style="--i:1">People come from TMDB credits. Add your TMDB key (Search, at the top) and they fill in.</p>`:''}
    ${D.length?`<div class="sc-ppl" style="--i:2">${D.map(x=>{const pp=PPL[x.id],tot=pp&&pp.l?pp.l.length:0,sn=tot?pp.l.filter(y=>{const f=(S.screen||[]).find(z=>z.type==='film'&&z.tmdb===y.id);return f&&seen(f)}).length:x.seen,pc=tot?Math.round(sn/tot*100):Math.min(100,x.seen*12),best=x.l.filter(f=>score(f)).sort((a,b)=>score(b)-score(a))[0];if(best)P(best);
      return `<button type="button" class="sc-pp" data-sc="person" data-pid="${x.id}"${best?` data-scp="${best.id}" style="${pv(best)}"`:''}><span class="sc-av" style="--pc:${pc}%"><span>${x.p?`<img src="${TM_IMG}w185${esc(x.p)}" alt="" loading="lazy" onerror="this.remove()">`:esc(x.n.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span></span><span class="tx"><b>${esc(x.n)}</b><small>${tot?sn+' of '+tot+' films seen':plural(x.seen,'film')+' seen'}${best?' · best: '+esc(best.title):''}</small></span>${x.nr?`<b>${f1(Math.round(x.avg*10)/10)}</b>`:''}</button>`}).join('')}</div>`
      :tmKey()&&!left?`<p class="sc-empty" style="--i:2">Watch a film from TMDB and its director shows up here.</p>`:''}</div>`;
}
function personView(pid){
  const pp=PPL[pid],mine=films().filter(f=>(f.dir||[]).some(d=>d.id===+pid)),d0=mine.length&&mine[0].dir.find(d=>d.id===+pid);
  const name=(pp&&pp.n)||(d0&&d0.n)||'Director',photo=(pp&&pp.p)||(d0&&d0.p)||'';
  if((!pp||Date.now()-pp.at>30*864e5)&&tmKey())setTimeout(()=>personLoad(pid),0);
  const list=pp&&pp.l?pp.l:mine.map(f=>({id:f.tmdb,t:f.title,y:f.year,p:f.poster}));
  const sc=mine.filter(f=>score(f)),avg=sc.length?sc.reduce((a,f)=>a+score(f),0)/sc.length:0,inLog=id=>(S.screen||[]).find(y=>y.type==='film'&&y.tmdb===id),seenN=pp&&pp.l?pp.l.filter(x=>{const f=inLog(x.id);return f&&seen(f)}).length:mine.filter(seen).length;
  const best=sc.sort((a,b)=>score(b)-score(a))[0];
  return `<div class="sc-cbar"><button type="button" class="pvb sm" data-sc="closeperson">${svgI(IC.back)}People</button><span class="sc-k">Director</span></div>
    <div class="sc-shead" ${best?`data-scp="${best.id}" style="${pv(best)}"`:''}><span class="sc-av" style="--pc:${list.length?Math.round(seenN/list.length*100):0}%;width:110px;height:110px"><span style="width:94px;height:94px;font-size:22px">${photo?`<img src="${TM_IMG}w185${esc(photo)}" alt="" onerror="this.remove()">`:esc(name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span></span>
      <div style="flex:1;min-width:0"><h1 class="sc-ttl">${esc(name)}</h1><div class="scpill">${sc.length?`<b>${f1(Math.round(avg*10)/10)}</b>`:''}<span>${seenN} of ${list.length||mine.length} films seen${best?' · your favorite: '+esc(best.title):''}</span></div></div></div>
    ${pp&&pp.b?`<p class="sc-ov" style="max-width:900px">${esc(pp.b)}</p>`:''}
    ${!pp&&tmKey()?'<p class="pvsm">Getting the filmography from TMDB…</p>':''}
    <div class="sc-tl sc-in-up">${list.map((x,i)=>{const f=(S.screen||[]).find(y=>y.type==='film'&&y.tmdb&&y.tmdb===x.id);const s=f&&score(f),sn=f&&seen(f);if(f)P(f);
      return `<div class="sc-tlr${sn?'':' no'}" style="--i:${Math.min(i,10)}"><span class="yr">${esc(x.y||'')}</span><span class="dot"></span>${f?`<button type="button" class="sctile" data-sc="open" data-id="${f.id}">${poster(f,{w:'w185',sc:s?f1(s):''})}</button>`:`<span class="sctile">${poster({t:x.t,p:x.p},{w:'w185'})}</span>`}
        <div class="info"><b>${esc(x.t)}</b><span class="pvsm">${f?(sn?plural(W(f).length,'watch','watches')+(s?' · rated '+f1(s):' · not rated'):'On your list'):'Not in your log'}</span>${f?'':`<span><button type="button" class="pvb xs" data-sc="radd" data-tid="${x.id}" data-t="${esc(x.t)}">+ Add to list</button></span>`}</div></div>`}).join('')}</div>`;
}

/* ===== DIARY ===== */
function allWatches(){const a=[];for(const f of films())W(f).forEach((w,i)=>a.push({f,w,i}));a.sort((x,y)=>(y.w.d||'').localeCompare(x.w.d||'')||(y.w.t||0)-(x.w.t||0));return a}
function diaryView(){
  const A=allWatches(),ys=[...new Set(A.map(x=>(x.w.d||'').slice(0,4)).filter(Boolean))].sort().reverse();
  const y=U.dy&&ys.includes(U.dy)?U.dy:'',L=y?A.filter(x=>(x.w.d||'').startsWith(y)):A;
  const g=new Map();for(const x of L){const k=(x.w.d||'').slice(0,7)||'none';if(!g.has(k))g.set(k,[]);g.get(k).push(x)}
  return `<div class="sc-sec sc-in-up"><div class="sc-sech" style="--i:0"><h2 class="sc-h2">Diary</h2><span class="sc-sub">${plural(L.length,'watch','watches')}. Theater trips are ticket stubs</span><span class="sp"></span>
      <div class="sc-chips"><button type="button" class="pvchip" data-sc="dy" data-v="" aria-pressed="${!y}">All</button>${ys.map(v=>`<button type="button" class="pvchip" data-sc="dy" data-v="${v}" aria-pressed="${y===v}">${v}</button>`).join('')}</div></div>
    ${L.length?[...g.entries()].map(([k,l],gi)=>{const d=k==='none'?null:dOf(k+'-01');const sc=l.filter(x=>x.w.r);
      return `<div class="sc-dmon" style="--i:${Math.min(gi+1,8)}"><h3>${d?esc(d.toLocaleDateString([],{month:'long',year:'numeric'})):'No date'}<small>${plural(l.length,'watch','watches')}${sc.length?' · avg '+f1(Math.round(sc.reduce((a,x)=>a+x.w.r,0)/sc.length*10)/10):''}</small></h3>
        <div class="sc-dl">${l.map(({f,w,i})=>{P(f);const dl=delta(f,i);return `<button type="button" class="sc-dr${w.at==='theater'?' th':''}" data-sc="open" data-id="${f.id}" data-w="${i}" data-scp="${f.id}" style="${pv(f)}"><span class="cb"></span><span class="ph">${poster(f,{w:'w92'})}</span><span class="bd"><span class="k">${esc((w.at==='theater'?'THEATER':'HOME')+(w.svc?' · '+w.svc.toUpperCase():''))} · ${i?'WATCH '+(i+1):'FIRST WATCH'}</span><b>${esc(f.title)}</b>${w.rv?`<small>${esc(w.rv)}</small>`:`<small>${esc([f.year,dirNames(f)[0]].filter(Boolean).join(' · '))}</small>`}</span>
          <span class="st"><span>${esc(dK(w.d).replace(/^\w+, /,''))}</span><b>${w.r?f1(w.r):'–'}</b><i class="${dCls(dl)}">${esc(dl||'')}</i></span></button>`}).join('')}</div></div>`}).join('')
      :`<p class="sc-empty" style="--i:1">Every watch you log shows up here as a diary entry.</p>`}</div>`;
}

/* ===== STATS ===== */
function statsView(){
  const A=allWatches(),ys=[...new Set(A.map(x=>(x.w.d||'').slice(0,4)).filter(Boolean))].sort().reverse();
  const y=U.sy===''||ys.includes(U.sy)?U.sy:'',L=y?A.filter(x=>(x.w.d||'').startsWith(y)):A;
  const fs=[...new Set(L.map(x=>x.f))],re=L.filter(x=>x.i>0).length,mins=L.reduce((a,x)=>a+(x.f.runtime||0),0),rs=L.filter(x=>x.w.r),avg=rs.length?rs.reduce((a,x)=>a+x.w.r,0)/rs.length:0,th=L.filter(x=>x.w.at==='theater').length;
  const tiles=[[fs.length,'films'],[L.length,'watches · '+re+' rewatches'],[hrs(mins),'in the dark'],[avg?f1(Math.round(avg*10)/10):'–','average rating'],[th,th===1?'theater trip':'theater trips'],[fs.filter(f=>f.own).length,'on your shelf on disc']];
  const mon=Array.from({length:12},(_,i)=>({n:0,top:null}));
  let mb='';
  if(y){for(const x of L){const m=+((x.w.d||'').slice(5,7))-1;if(m>=0){mon[m].n++;if(!mon[m].top||(x.w.r||0)>(mon[m].top.w.r||0))mon[m].top=x}}
    const mx=Math.max(1,...mon.map(m=>m.n));
    mb=`<div class="pvcard"><div class="pvch"><h3 class="pvh3">Watches by month</h3><span class="pvsm">colored by the month's best film</span></div><div class="sc-mbars">${mon.map((m,i)=>`<div><em>${m.n||''}</em><i style="height:${Math.round(m.n/mx*100)}%;--i:${i};${m.top?'--c:'+palOf(m.top.f)[2]:''}"></i><small>${'JFMAMJJASOND'[i]}</small></div>`).join('')}</div></div>`}
  else{const yy={};for(const x of L){const k=(x.w.d||'').slice(0,4);if(k)yy[k]=(yy[k]||0)+1}const ks=Object.keys(yy).sort().slice(-12),mx=Math.max(1,...ks.map(k=>yy[k]));
    mb=ks.length?`<div class="pvcard"><div class="pvch"><h3 class="pvh3">Watches by year</h3></div><div class="sc-mbars">${ks.map((k,i)=>`<div><em>${yy[k]}</em><i style="height:${Math.round(yy[k]/mx*100)}%;--i:${i}"></i><small>${k.slice(2)}</small></div>`).join('')}</div></div>`:''}
  const hb=(title,rows,sub)=>rows.length?`<div class="pvcard"><div class="pvch"><h3 class="pvh3">${title}</h3>${sub?`<span class="pvsm">${sub}</span>`:''}</div><div class="sc-hb">${rows.map(([l,v,lab],i)=>`<div><span>${esc(l)}</span><span class="b"><i style="width:${Math.max(2,v)}%;animation-delay:${i*50}ms"></i></span><em>${esc(lab)}</em></div>`).join('')}</div></div>`:'';
  const cnt=(arr)=>{const m={};for(const k of arr)if(k)m[k]=(m[k]||0)+1;return Object.entries(m).sort((a,b)=>b[1]-a[1])};
  const gen=cnt(fs.flatMap(f=>f.genres||[])).slice(0,8),gm=gen.length?gen[0][1]:1;
  const dec=cnt(fs.map(f=>{const v=parseInt(f.year,10);return v?Math.floor(v/10)*10+'s':''})).sort((a,b)=>a[0].localeCompare(b[0])),dm=Math.max(1,...dec.map(x=>x[1]));
  const svc=cnt(L.map(x=>x.w.at==='theater'?'Theater':x.w.svc)).slice(0,8),sm=svc.length?svc[0][1]:1;
  const sd=SCORES.map(s=>[s,rs.filter(x=>x.w.r===s).length]),sdm=Math.max(1,...sd.map(x=>x[1]));
  const most=fs.filter(f=>W(f).length>1).sort((a,b)=>W(b).length-W(a).length).slice(0,6);
  const D=directors().filter(x=>x.nr>=2).sort((a,b)=>b.avg-a.avg).slice(0,6);
  return `<div class="sc-sec sc-in-up"><div class="sc-sech" style="--i:0"><h2 class="sc-h2">Screen stats</h2><span class="sp"></span><div class="sc-chips"><button type="button" class="pvchip" data-sc="sy" data-v="" aria-pressed="${!y}">All time</button>${ys.map(v=>`<button type="button" class="pvchip" data-sc="sy" data-v="${v}" aria-pressed="${y===v}">${v}</button>`).join('')}</div></div>
    ${L.length?`<div class="sc-tiles" style="--i:1">${tiles.map(([b,s])=>`<div><b>${b}</b><span>${esc(s)}</span></div>`).join('')}</div>
    <div class="sc-grid2" style="--i:2">${mb}
      <div class="pvcard"><div class="pvch"><h3 class="pvh3">How you score</h3><span class="pvsm">${rs.length} rated watches</span></div><div class="sc-mbars" style="height:150px">${sd.map(([s,n],i)=>`<div><em>${n||''}</em><i style="height:${Math.round(n/sdm*100)}%;--i:${i}"></i><small>${Number.isInteger(s)?s:''}</small></div>`).join('')}</div></div>
      ${hb('Genres',gen.map(([k,v])=>[k,v/gm*100,String(v)]))}
      ${hb('Decades',dec.map(([k,v])=>[k,v/dm*100,String(v)]),'by release')}
      ${hb('Where you watch',svc.map(([k,v])=>[k,v/sm*100,String(v)]))}
      ${D.length?hb('Directors you rate highest',D.map(x=>[x.n,x.avg*10,f1(Math.round(x.avg*10)/10)]),'two or more films rated'):''}
      ${most.length?`<div class="pvcard"><div class="pvch"><h3 class="pvh3">Most rewatched</h3></div><div class="sc-row">${most.map(f=>{P(f);return `<button type="button" class="sctile" data-sc="open" data-id="${f.id}">${poster(f,{w:'w185',sc:W(f).length+'×'})}</button>`}).join('')}</div></div>`:''}
    </div>`:`<p class="sc-empty" style="--i:1">Log a few watches and your Screen stats fill in.</p>`}</div>`;
}

/* ===== SHEETS ===== */
function addSheet(){
  const key=tmKey(),mode=T.add;
  let body='';
  if(!key||TMX.keyOpen)body=`<div class="scx-sheet">${tmSide()}</div>`;
  else{
    body=`<form data-scf="q" class="pvin" style="background:rgb(255 255 255 / .1)">${svgI(IC.search,20)}<input name="q" id="sc-q" value="${esc(TMX.q||'')}" placeholder="Search TMDB for a film or show" autocomplete="off" aria-label="Search TMDB" ${TMX.busy?'disabled':''}><button class="pvb w sm" ${TMX.searching?'disabled':''}>${TMX.searching?'Searching…':'Search'}</button></form>`;
    if(TMX.busy)body+='<p class="pvsm" role="status">Bringing it in…</p>';
    if(TMX.err&&TMX.errWhere==='side')body+=`<p class="mberr" role="alert">${esc(TMX.err)}</p>`;
    if(TMX.results)body+=`<div class="sc-res">${TMX.results.map((x,i)=>{const have=tmExisting(x.kind,x.id,x.title,x.year);
      return `<div class="sc-hit">${poster({t:x.title,p:x.poster},{w:'w92'})}<span class="tx"><b>${esc(x.title)}</b><small>${esc([x.kind==='show'?'Show':'Film',x.year,x.orig].filter(Boolean).join(' · '))}</small></span><span class="ac">${have?`<button type="button" class="pvb sm" data-sc="${have.type==='show'?'box':'open'}" data-id="${have.id}">${have.type==='film'&&seen(have)?'On your shelf':have.type==='film'?'On your list':'Open box set'}</button>${have.type==='film'?`<button type="button" class="pvb w sm" data-sc="logw" data-id="${have.id}">Log a watch</button>`:''}`
        :x.kind==='film'?`<button type="button" class="pvb sm" data-sc="imp" data-i="${i}" data-m="list" ${TMX.busy?'disabled':''}>+ Add to list</button><button type="button" class="pvb w sm" data-sc="imp" data-i="${i}" data-m="log" ${TMX.busy?'disabled':''}>Log a watch</button>`
        :`<button type="button" class="pvb w sm" data-sc="imp" data-i="${i}" data-m="box" ${TMX.busy?'disabled':''}>+ Add box set</button>`}</span></div>`}).join('')}</div>`;
    body+=`<details class="scx-sheet"><summary>Not on TMDB? Add it by hand</summary><form data-scf="hand" style="margin-top:10px"><div class="row2"><input name="title" placeholder="Title" required aria-label="Title"><input name="year" placeholder="Year" aria-label="Year" style="max-width:90px"></div><select name="type" aria-label="Type"><option value="film">Film</option><option value="show">TV show</option></select><input name="seasons" placeholder="For a show: episodes per season, e.g. 9, 10" aria-label="Episodes per season"><button class="btn primary">Add</button></form></details>
      <p class="pvsm" style="font-size:12px;opacity:.75">Film and show data from TMDB. This app uses the TMDB API but is not endorsed or certified by TMDB. <button type="button" class="sc-link" style="font-size:12px" data-act="tmkeyedit">Change key</button></p>`;
  }
  const h=mode==='log'?'Log a watch':mode==='box'?'Add a show':'Add a film or show';
  return `<div class="sc-sh" data-sc="addx-bk"><div class="sc-shp" role="dialog" aria-modal="true" aria-labelledby="sc-addh"><div class="sc-shh"><h3 id="sc-addh">${h}</h3><button type="button" class="x" data-sc="addx" aria-label="Close">${svgI(IC.x)}</button></div>${mode==='log'?`<p class="pvsm" style="margin:0">Find the film, then <b>Log a watch</b>. It opens in its case so you can rate it on the disc.</p>`:''}${body}</div></div>`;
}
const SVC_DEF=['Netflix','Max','Disney Plus','Hulu','Amazon Prime Video','Apple TV+','Paramount Plus','Peacock Premium','MUBI','The Criterion Channel','Kanopy','Tubi TV','Pluto TV','YouTube'];
function svcSheet(){
  const seenN={};for(const x of S.screen||[])if(x.watch)for(const p of [...(x.watch.s||[]),...(x.watch.f||[])])seenN[p[0]]=(seenN[p[0]]||0)+1;
  const names=[...new Set([...mySvcs(),...Object.keys(seenN).sort((a,b)=>seenN[b]-seenN[a]),...SVC_DEF])].slice(0,40),mine=mySvcs();
  return `<div class="sc-sh" data-sc="svcx-bk"><div class="sc-shp" role="dialog" aria-modal="true" aria-labelledby="sc-svh"><div class="sc-shh"><h3 id="sc-svh">My services</h3><button type="button" class="x" data-sc="svcx" aria-label="Close">${svgI(IC.x)}</button></div>
    <p class="pvsm" style="margin:0">Pick the services you pay for (or get free). Up next puts films on them first, tonight's pick favors them, and the case says where to press play. Names come from JustWatch, via TMDB.</p>
    <div class="sc-svcs">${names.map(n=>`<button type="button" class="pvchip" data-sc="svc" data-v="${esc(n)}" aria-pressed="${mine.includes(n)}">${esc(n)}${seenN[n]?` <span>${seenN[n]}</span>`:''}</button>`).join('')}</div>
    <div><button type="button" class="pvb w sm" data-sc="svcx">Done</button></div></div></div>`;
}

/* ---------- motion: the case comes off the shelf, opens, and the disc drops into the player ---------- */
const EASE='cubic-bezier(.2,.8,.2,1)';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function anim(el,k,o){try{return el.animate(k,{fill:'forwards',easing:EASE,...o}).finished.catch(()=>{})}catch(e){return Promise.resolve()}}
let FLY=null;
function go(id,wi){U.homeY=U.open?U.homeY:scrollY;U.open=id;U.box=null;U.person=null;U.pg=0;if(wi!=null)U.wsel[id]=wi;UI.sel.screen=id;T.edit=null;T.arm=null;uSave()}
async function flyOpen(src,f,wi){
  if(FLY)return;
  const can=!noMotion()&&src&&document.body.animate&&!(document.documentElement.classList.contains('lite')&&PHONE());
  if(!can){go(f.id,wi);T.land=f.id;window.scrollTo(0,0);render0();return}
  const r0=(src.querySelector('.scpo')||src).getBoundingClientRect();
  go(f.id,wi);T.wait=true;FLY='pending';window.scrollTo(0,0);render0();
  let ov=null;
  try{
  const tg=$('#scx .pp .scd'),rt=tg?tg.getBoundingClientRect():null;
  const p=palOf(f),vw=innerWidth,vh=innerHeight,ch=Math.min(vh*.52,PHONE()?360:440),cw=ch*2/3,cx=vw/2-cw/2,cy=vh*.46-ch/2,dd=cw*.82;
  ov=document.createElement('div');ov.className='scfly';ov.style.cssText=`--p1:${p[0]};--p2:${p[1]};--p3:${p[2]};--pi:${inkOf(p[0])};--cw:${cw}px;--ch:${ch}px`;
  ov.innerHTML=`<div class="bk"></div><div class="cs"><div class="in"><span class="hb"></span>${theaterW(f).length?'<span class="stb">ADMIT ONE</span>':''}</div><div class="cv">${f.poster?`<img src="${IMG(f.poster,'w500')}" alt="">`:''}<b>${esc(f.title)}</b></div></div>`+disc(f,{d:dd+'px',lab:''});
  document.body.appendChild(ov);FLY=ov;
  const cs=ov.querySelector('.cs'),cv=ov.querySelector('.cv'),bk=ov.querySelector('.bk'),dk=ov.querySelector('.scd');
  const dx=cx+(cw-dd)/2,dy=cy+(ch-dd)/2;dk.style.opacity='0';dk.style.transform=`translate(${dx}px,${dy}px)`;
  const sx=r0.width/cw,sy=r0.height/ch;
  anim(bk,[{opacity:0},{opacity:1}],{duration:380});
  await anim(cs,[{transform:`translate(${r0.left}px,${r0.top}px) scale(${sx},${sy}) rotateY(${src.classList.contains('scsp')?70:0}deg)`},{transform:`translate(${cx}px,${cy}px) scale(1) rotateY(0deg)`}],{duration:430});
  dk.style.opacity='1';
  await anim(cv,[{transform:'rotateY(0deg)'},{transform:'rotateY(-112deg)'}],{duration:360,easing:'cubic-bezier(.5,0,.3,1)'});
  const tr=$('#scx .pp .scd'),r2=tr?tr.getBoundingClientRect():rt;
  anim(cs,[{opacity:1,transform:`translate(${cx}px,${cy}px) scale(1)`},{opacity:0,transform:`translate(${cx}px,${cy+40}px) scale(.9)`}],{duration:320});
  anim(bk,[{opacity:1},{opacity:0}],{duration:420,delay:120});
  if(tr)tr.style.opacity='0';
  T.wait=false;const root=$('#scx');if(root)root.classList.remove('sc-wait');
  if(r2)await anim(dk,[{transform:`translate(${dx}px,${dy}px) scale(1) rotate(0deg)`},{transform:`translate(${r2.left}px,${r2.top}px) scale(${r2.width/dd}) rotate(160deg)`}],{duration:440,easing:'cubic-bezier(.4,0,.2,1)'});
  }catch(e){}
  finally{
    T.wait=false;const root=$('#scx');if(root)root.classList.remove('sc-wait');
    const real=$('#scx .pp .scd');if(real){real.style.opacity='';real.classList.remove('land');void real.offsetWidth;real.classList.add('land')}
    if(ov)ov.remove();FLY=null;T.land=null;
  }
}
async function flyClose(){
  const id=U.open,f=byId(id);U.open=null;T.edit=null;T.arm=null;uSave();
  const from=$('#scx .pp .scd'),r1=from?from.getBoundingClientRect():null;
  render0();window.scrollTo(0,U.homeY||0);
  const sp=$(`#scx .scsp[data-id="${id}"]`)||$(`#scx .sctile[data-id="${id}"] .scpo`);
  if(!sp||!f||noMotion()||!r1||!document.body.animate)return;
  const r2=sp.getBoundingClientRect();if(r2.bottom<0||r2.top>innerHeight)return;
  const ov=document.createElement('div');ov.className='scfly';ov.innerHTML=disc(f,{d:r1.width+'px',lab:''});document.body.appendChild(ov);
  const dk=ov.querySelector('.scd');sp.style.opacity='0';
  await anim(dk,[{transform:`translate(${r1.left}px,${r1.top}px) scale(1)`,opacity:1},{transform:`translate(${r2.left+r2.width/2-r1.width*.1}px,${r2.top+r2.height/2-r1.width*.1}px) scale(.2)`,opacity:.2}],{duration:420,easing:'cubic-bezier(.5,0,.2,1)'});
  ov.remove();sp.style.opacity='';sp.classList.add('slot');setTimeout(()=>sp.classList.remove('slot'),600);
}

/* ---------- background work: posters' colors, credits, where-to-watch, recommendations, filmographies ---------- */
let BQ=false;
async function bgWork(){
  if(BQ||!tmKey()||!navigator.onLine)return;BQ=true;let ch=false,touchedUp=false,re=false;
  try{
    const of=U.open&&byId(U.open);
    if(of&&of.tmdb&&!of.enr){await enrich(of);ch=true;re=true}
    if(of&&of.tmdb&&needW(of)){await fetchW(of);ch=true;re=true}
    const up=films().filter(f=>!seen(f)&&f.tmdb&&needW(f)).slice(0,12);
    for(const f of up){if(U.open&&U.open!==of?.id)break;await fetchW(f);ch=true;touchedUp=true;await wait(220)}
    const todo=films().filter(f=>f.tmdb&&!f.enr).slice(0,10);
    for(const f of todo){await enrich(f);ch=true;if(U.seg==='people')re=true;await wait(300)}
  }catch(e){}
  BQ=false;
  if(ch){touch();if(re||touchedUp)patch()}
}
const needW=f=>!f.watch||f.watch.c!==tmRegion()||Date.now()-(f.watch.at||0)>7*864e5;
const WFAIL={};
async function fetchW(f){if(WFAIL[f.id])return;try{f.watch=tmWatch(await tmGet((f.type==='film'?'movie/':'tv/')+f.tmdb+'/watch/providers'))}catch(e){WFAIL[f.id]=1}}
async function enrich(f){
  try{const j=await tmGet('movie/'+f.tmdb,{language:'en-US',append_to_response:'credits,recommendations'});
    const cr=j.credits||{};f.dir=(cr.crew||[]).filter(c=>c.job==='Director').slice(0,3).map(c=>({id:c.id,n:c.name,p:c.profile_path||''}));
    f.cast=(cr.cast||[]).slice(0,5).map(c=>c.name);if(j.backdrop_path)f.bd=j.backdrop_path;if(!f.runtime&&j.runtime)f.runtime=j.runtime;if(!f.poster&&j.poster_path)f.poster=j.poster_path;
    if((!f.genres||!f.genres.length)&&j.genres)f.genres=j.genres.map(g=>g.name).slice(0,4);if(!f.overview&&j.overview)f.overview=j.overview;
    REC[f.id]={at:Date.now(),l:((j.recommendations&&j.recommendations.results)||[]).filter(x=>x.poster_path).slice(0,8).map(x=>({id:x.id,t:x.title||x.original_title,y:tmYear(x.release_date),p:x.poster_path}))};recSave();
  }catch(e){if(e&&e.code==='gone'){}else if(e&&(e.code==='offline'||e.code==='network'||e.code==='busy'))return}
  f.enr=Date.now();
}
const PLB={};
async function personLoad(pid){
  if(PLB[pid])return;PLB[pid]=1;
  try{const j=await tmGet('person/'+pid,{language:'en-US',append_to_response:'movie_credits'}),seenI=new Set();
    const l=((j.movie_credits&&j.movie_credits.crew)||[]).filter(c=>c.job==='Director'&&!seenI.has(c.id)&&seenI.add(c.id)).sort((a,b)=>(a.release_date||'9999').localeCompare(b.release_date||'9999')).map(c=>({id:c.id,t:c.title||c.original_title,y:tmYear(c.release_date),p:c.poster_path||''}));
    PPL[pid]={at:Date.now(),n:j.name||'',p:j.profile_path||'',b:firstLine2(j.biography||''),l};pplSave();
    if(U.person==pid||U.seg==='people')render0();
  }catch(e){}
}
function firstLine2(t){t=String(t).trim();if(t.length<=420)return t;const c=t.slice(0,420),k=c.lastIndexOf('. ');return (k>200?c.slice(0,k+1):c+'…')}

/* a quiet redraw: only the parts of the page that changed are swapped, so a poster arriving or a list filling in never resets the page */
function patch(){
  const root=$('#scx');if(!root||FLY){if(!FLY)render0();return}
  const t=document.createElement('template');t.innerHTML=render();
  const nr=t.content.querySelector('#scx');if(!nr){render0();return}
  const ids=$$('[id^="scs-"]',nr).map(e=>e.id);
  if(ids.length!==$$('[id^="scs-"]',root).length||!ids.length){render0();return}
  for(const id of ids){const b=nr.querySelector('#'+id);if(!b)continue;const a=root.querySelector('#'+id);if(!a){render0();return}if(a.outerHTML!==b.outerHTML){b.style.animation='none';a.replaceWith(b)}}
  after();
}
const render0=()=>{try{window.render()}catch(e){console.error(e)}};

/* ---------- after each draw ---------- */
function after(){
  const root=$('#scx');if(!root)return;
  for(const id of NEED){const x=byId(id);if(x)palLoad(x)}
  $$('[data-scp]',root).forEach(el=>{const x=byId(el.dataset.scp);if(x&&PAL[x.id]){}});
  if(T.land&&!FLY){const d=$('.pp .scd',root)||$('#scs-hero .scd',root);if(d){d.classList.add('land')}T.land=null}
  if(T.wait&&!FLY){T.wait=false;root.classList.remove('sc-wait')}
  const cw=$('.sc-cw',root);
  if(cw&&!cw._sw){cw._sw=1;let x0=null,y0=0;   /* on a phone, swipe sideways between the disc, the liner notes and this watch */
    cw.addEventListener('touchstart',e=>{if(!PHONE()||e.touches.length!==1||e.target.closest('input,textarea,select,.sc-bar'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
    cw.addEventListener('touchend',e=>{if(x0==null)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Math.abs(dx)>60&&Math.abs(dy)<50)pgGo(U.pg+(dx<0?1:-1),dx<0?1:-1)},{passive:true})}
  if(T.add){const q=$('#sc-q');if(q&&!q.value&&matchMedia('(hover:hover)').matches&&document.activeElement!==q&&!T.qf){T.qf=1;q.focus({preventScroll:true})}}else T.qf=0;
  setTimeout(bgWork,400);
}

/* ---------- taps ---------- */
function setMark(id,v){const m={...(S.marks[id]||{})};if(v){m.r=v;m.done=true;if(!m.rd)m.rd=ymd()}else{m.r=0;delete m.rd}S.marks[id]=m}
async function imp(i,mode){
  const x=TMX.results&&TMX.results[i];if(!x||T.busyImp)return;T.busyImp=true;
  const before=new Set((S.screen||[]).map(y=>y.id));
  try{await tmImport({id:x.id,kind:x.kind,title:x.title},'side')}catch(e){}
  T.busyImp=false;
  if(TMX.err&&TMX.errWhere==='side'){toast(TMX.err);render0();return}
  const it=byId(TMX.sid);if(!it){render0();return}
  if(!before.has(it.id)&&it.type==='film')it.add=Date.now();
  T.add=false;TMX.results=null;TMX.q='';TMX.report='';
  UI.tab='screen';
  if(it.type==='show'){U.seg='boxes';U.box=it.id;U.open=null;uSave();touch();window.scrollTo(0,0);render0();return}
  if(mode==='log'){const w=newWatch(it);syncMark(it);touch();go(it.id,W(it).indexOf(w));T.land=it.id;window.scrollTo(0,0);render0();toast('Logged. Rate it on the disc.');return}
  touch();render0();toast(it.title+' is on your list');
}
document.addEventListener('click',ev=>{
  if(UI.tab!=='screen'||UI.view)return;
  const b=ev.target.closest('[data-sc]');if(!b)return;
  const a=b.dataset.sc,id=b.dataset.id,f=id&&byId(id);
  if(a==='addx-bk'||a==='svcx-bk'){if(ev.target!==b)return}
  ev.preventDefault();ev.stopPropagation();
  if(a!=='wdel')T.arm=null;
  switch(a){
    case 'seg':U.seg=b.dataset.v;U.open=null;U.box=null;U.person=null;uSave();window.scrollTo(0,0);break;
    case 'add':T.add=b.dataset.m||'list';TMX.err='';break;
    case 'addx':case 'addx-bk':T.add=false;break;
    case 'svcs':T.svcs=true;break;
    case 'svcx':case 'svcx-bk':T.svcs=false;break;
    case 'svc':{const v=b.dataset.v,m=mySvcs().slice(),k=m.indexOf(v);if(k>=0)m.splice(k,1);else m.push(v);S.cfg={...(S.cfg||{}),svcs:m};touch();break}
    case 'open':{if(!f)return;T.add=false;if(f.type==='show'){U.box=f.id;U.open=null;uSave();window.scrollTo(0,0);break}
      flyOpen(b,f,b.dataset.w!=null?+b.dataset.w:null);return}
    case 'close':flyClose();return;
    case 'nav':{const ord=ORDER.length&&ORDER.includes(U.open)?ORDER:RK.map(x=>x.id),k=ord.indexOf(U.open);if(k<0)return;const n=ord[(k+(+b.dataset.d)+ord.length)%ord.length];go(n);T.land=n;break}
    case 'pick':{const L=films().filter(x=>!seen(x)),mine=L.filter(x=>onMine(x)),pool=(mine.length?mine:L).filter(x=>x.id!==U.pick);const pk=pool[Math.floor(Math.random()*pool.length)]||L[0];if(!pk){toast('Your list is empty');return}U.pick=pk.id;U.seg='films';uSave();T.land=pk.id;window.scrollTo({top:0,behavior:noMotion()?'auto':'smooth'});break}
    case 'unpick':U.pick=null;uSave();break;
    case 'rewatch':case 'logw':{if(!f)return;const w=newWatch(f);syncMark(f);touch();if(U.pick===f.id)U.pick=null;T.add=false;
      if(U.open!==f.id){go(f.id,W(f).indexOf(w));window.scrollTo(0,0)}else U.wsel[f.id]=W(f).indexOf(w);T.land=f.id;uSave();
      toast(W(f).length>1?'Watch '+W(f).length+' started. A new ring on the disc.':'Logged. Rate it on the disc.');break}
    case 'wsel':if(!f)return;U.wsel[f.id]=+b.dataset.i;uSave();if(PHONE()&&b.classList.contains('stb')){U.pg=2}break;
    case 'wstep':{if(!f)return;const n=W(f).length,i=Math.max(0,Math.min(n-1,selW(f)+(+b.dataset.d)));U.wsel[f.id]=i;uSave();break}
    case 'rate':{if(!f)return;const w=W(f)[selW(f)];if(!w)return;const v=+b.dataset.v;w.r=w.r===v?0:v;syncMark(f);touch();break}
    case 'rclr':{if(!f)return;const w=W(f)[selW(f)];if(w){w.r=0;syncMark(f);touch()}break}
    case 'wat':{if(!f)return;const w=W(f)[selW(f)];if(!w)return;w.at=b.dataset.v;if(w.at==='theater'&&w.svc&&!/IMAX|Dolby|70mm|Standard/.test(w.svc))w.svc='';syncMark(f);touch();break}
    case 'wdel':{if(!f)return;const w=W(f)[selW(f)];if(!w)return;if(T.arm!=='w'+w.id){T.arm='w'+w.id;break}T.arm=null;f.w=W(f).filter(x=>x!==w);f.mo=(f.mo||[]).filter(m=>m.w!==w.id);U.wsel[f.id]=W(f).length-1;syncMark(f);touch();toast('Watch deleted');break}
    case 'own':{if(!f)return;const o=['','4K','Blu-ray','DVD'],k=o.indexOf(f.own||'');f.own=o[(k+1)%o.length];if(!f.own)delete f.own;touch();break}
    case 'fo':{if(!f)return;if(f.fo)delete f.fo;else{f.fo=Date.now();const pins=films().filter(x=>x.fo).sort((x,y)=>y.fo-x.fo);for(const x of pins.slice(5))delete x.fo}touch();toast(f.fo?'Pinned to Face-out':'Unpinned');break}
    case 'card':T.edit='card'+id;break;
    case 'cardx':T.edit=null;break;
    case 'lvx':if(!f)return;delete f.lv;touch();break;
    case 'model':{if(!f)return;f.mo=(f.mo||[]).filter(m=>m.id!==b.dataset.m);touch();break}
    case 'person':U.person=b.dataset.pid;U.open=null;U.box=null;uSave();window.scrollTo(0,0);break;
    case 'closeperson':U.person=null;U.seg='people';uSave();window.scrollTo(0,0);break;
    case 'radd':{const tid=+b.dataset.tid;if(!tid||T.busyImp)return;T.busyImp=true;b.disabled=true;b.textContent='Adding…';
      const before=new Set((S.screen||[]).map(y=>y.id)),keep={open:U.open,person:U.person};
      tmImport({id:tid,kind:'film',title:b.dataset.t||''},'side').catch(()=>{}).then(()=>{T.busyImp=false;const it=byId(TMX.sid);
        if(it&&!before.has(it.id))it.add=Date.now();Object.assign(U,keep);uSave();if(it){touch();toast((it.title||'It')+' is on your list')}else if(TMX.err)toast(TMX.err);render0()});return}
    case 'imp':imp(+b.dataset.i,b.dataset.m);return;
    case 'box':U.box=id;U.open=null;T.add=false;uSave();window.scrollTo(0,0);break;
    case 'closebox':U.box=null;U.seg='boxes';uSave();window.scrollTo(0,0);break;
    case 'season':U.season[id]=+b.dataset.n;uSave();break;
    case 'ep':{const m={...(S.marks[id]||{})};if(m.done){delete m.done;m.r=0;delete m.rd}else m.done=true;S.marks[id]=m;touch();break}
    case 'epx':T.eps[id]=!T.eps[id];break;
    case 'mr':{const v=+b.dataset.v;setMark(id,rating(id)===v?0:v);touch();break}
    case 'mrx':setMark(id,0);touch();break;
    case 'sall':{const s=byId(id),n=+b.dataset.n,se=s&&s.seasons.find(x=>x.n===n);if(!se)return;const ids=Array.from({length:se.eps},(_,j)=>sid(s.id,'s',n,'e',j+1)),all=ids.every(isDone);
      for(const k of ids){const m={...(S.marks[k]||{})};if(all){delete m.done;m.r=0;delete m.rd}else m.done=true;S.marks[k]=m}touch();break}
    case 'upf':U.upf=b.dataset.v;T.upAll=false;uSave();patch();return;
    case 'upall':T.upAll=true;patch();return;
    case 'sort':U.sort=b.dataset.v;uSave();shelfFlip();return;
    case 'shf':U.shf=b.dataset.v;uSave();shelfFlip();return;
    case 'dy':U.dy=b.dataset.v;uSave();break;
    case 'sy':U.sy=b.dataset.v;uSave();break;
    case 'pg':pgGo(+b.dataset.i,+b.dataset.i>U.pg?1:-1);return;
    default:return;
  }
  render0();
},true);
function pgGo(i,dir){i=Math.max(0,Math.min(2,i));if(i===U.pg)return;U.pg=i;uSave();const cw=$('#scx .sc-cw');if(!cw)return;cw.dataset.pg=i;cw.style.setProperty('--dir',dir||1);
  $$('#scx .sc-pgtabs button').forEach((x,k)=>x.setAttribute('aria-pressed',String(k===i)));cw.classList.remove('pgin');void cw.offsetWidth;cw.classList.add('pgin');
  const t=$('#scx .sc-pgtabs');if(t&&t.getBoundingClientRect().top<0)t.scrollIntoView({block:'start',behavior:'auto'})}
/* a new sort: spines that stay glide to their new spots */
function shelfFlip(){
  const old=new Map($$('#scs-shl .scsp').map(e=>[e.dataset.id,e.getBoundingClientRect()]));
  patch();
  if(noMotion())return;
  $$('#scs-shl .scsp').forEach((e,i)=>{const o=old.get(e.dataset.id),n=e.getBoundingClientRect();
    if(o){const dx=o.left-n.left,dy=o.top-n.top;if(dx||dy)e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:480,easing:EASE})}
    else e.animate([{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'none'}],{duration:420,delay:Math.min(i,30)*12,easing:EASE,fill:'backwards'})});
}
document.addEventListener('submit',ev=>{
  if(UI.tab!=='screen'||UI.view)return;
  const fm=ev.target.closest('form[data-scf]');if(!fm)return;ev.preventDefault();ev.stopPropagation();
  const k=fm.dataset.scf,f=fm.dataset.id&&byId(fm.dataset.id),d=Object.fromEntries(new FormData(fm));
  if(k==='q'){const q=String(d.q||'').trim();if(q){TMX.errWhere='side';tmSearch(q)}return}
  if(k==='hand'){const title=String(d.title||'').trim(),year=String(d.year||'').trim();if(!title)return;
    if(d.type==='show'){const eps=String(d.seasons||'').split(/[,\s]+/).map(Number).filter(n=>n>0);if(!eps.length){toast('Add episodes per season, e.g. 9, 10');return}const id=sid('show',title);if(!byId(id))S.screen.push({id,type:'show',title,year,seasons:eps.map((n,i)=>({n:i+1,eps:n}))});U.seg='boxes';U.box=id}
    else{const id=sid('film',title,year);if(!byId(id))S.screen.push({id,type:'film',title,year,add:Date.now()});const it=byId(id);if(T.add==='log'){newWatch(it);syncMark(it);go(id)}else toast(title+' is on your list')}
    T.add=false;touch();render0();return}
  if(!f)return;
  if(k==='card'){const t=String(d.t||'').trim().slice(0,160);if(t)f.card=t;else delete f.card;T.edit=null;touch();render0();return}
  if(k==='rev'){const w=W(f)[selW(f)];if(!w)return;w.rv=String(d.rv||'').trim().slice(0,4000);syncMark(f);touch();toast('Review saved');render0();return}
  if(k==='mo'){const s=parseS(d.s),n=String(d.n||'').trim().slice(0,120),w=W(f)[selW(f)];if(s==null||!n||!w){toast('Use a time like 1:02:30');return}
    const m={id:uid(),s,n,w:w.id};f.mo=(f.mo||[]).concat(m);T.newMo=m.id;touch();render0();setTimeout(()=>{T.newMo=null},800);return}
},true);
document.addEventListener('change',ev=>{
  if(UI.tab!=='screen'||UI.view)return;
  const el=ev.target.closest('[data-scc]');if(!el||el.dataset.scc==='shq')return;
  const f=byId(el.dataset.id);if(!f)return;
  if(el.dataset.scc==='wd'){const w=W(f)[selW(f)];if(!w)return;w.d=el.value||'';sortW(f);U.wsel[f.id]=W(f).indexOf(w);syncMark(f);touch()}
  if(el.dataset.scc==='wsvc'){const w=W(f)[selW(f)];if(!w)return;w.svc=el.value;touch()}
  if(el.dataset.scc==='lv'){if(el.value){f.lv=el.value;f.lvs=onMine(f)||bestWhere(f).replace(/ · free$/,'')}else delete f.lv;touch()}
  render0();
},true);
let SQT=0;
document.addEventListener('input',ev=>{
  if(UI.tab!=='screen'||UI.view)return;const el=ev.target;if(!el.matches||!el.matches('[data-scc="shq"]'))return;
  clearTimeout(SQT);SQT=setTimeout(()=>{U.shq=el.value;uSave();patch()},140);
},true);
document.addEventListener('keydown',ev=>{
  if(UI.tab!=='screen'||UI.view||ev.key!=='Escape')return;
  if(T.add){T.add=false;render0()}else if(T.svcs){T.svcs=false;render0()}else if(T.edit){T.edit=null;render0()}
  else if(U.open){flyClose()}else if(U.box){U.box=null;uSave();render0()}else if(U.person){U.person=null;uSave();render0()}
});

window.SC={ready:true,v:'2026.11.24-a',render,after,U,T};
})();

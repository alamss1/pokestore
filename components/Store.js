'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { RATES, currencyFor, fmt } from '@/lib/currency';
const track=(type,id)=>fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id})}).catch(()=>{});
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);
const T={
 en:{search:'Search',all:'All',hide:'Hide sold',each:'Each',acc:'Account',testi:'Proof',featured:'Featured',drag:'drag to explore',stock:'Stock',desc:'Description',sold:'SOLD',booked:'BOOKED',close:'Close',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Message copied. Paste it in the DM.',empty:'Nothing here yet.',soldMsg:'This item has been sold.',msg:'Hi, I want to buy:'},
 id:{search:'Cari',all:'Semua',hide:'Sembunyikan sold',each:'Each',acc:'Account',testi:'Bukti',featured:'Unggulan',drag:'geser untuk melihat',stock:'Stok',desc:'Deskripsi',sold:'SOLD',booked:'BOOKED',close:'Tutup',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Pesan disalin. Tempel di DM.',empty:'Belum ada item.',soldMsg:'Item ini sudah terjual.',msg:'Halo, saya mau beli:'}
};
const Ball=({s=30})=><svg className="ball" width={s} height={s} viewBox="0 0 100 100" aria-hidden>
  <circle cx="50" cy="50" r="46" fill="#fff"/><path d="M4 50a46 46 0 0 1 92 0z" fill="#ef233c"/><path d="M4 50h92" stroke="#1b1f2e" strokeWidth="9"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#1b1f2e" strokeWidth="6"/><circle cx="50" cy="50" r="15" fill="#fff" stroke="#1b1f2e" strokeWidth="7"/></svg>;
function Media({url,wm}){
  return <div className="media" onContextMenu={e=>e.preventDefault()}>
    {isVid(url)? <video src={url} controls controlsList="nodownload noplaybackrate" disablePictureInPicture playsInline preload="metadata"/> : <img src={url} alt="" draggable={false}/>}
    {wm && <span className="wm">{wm}</span>}
  </div>;
}
export default function Store({items,settings,country}){
  const [lang,setLang]=useState('en'),[q,setQ]=useState(''),[pt,setPt]=useState(''),[only,setOnly]=useState(false);
  const [cur,setCur]=useState(currencyFor(country)),[open,setOpen]=useState(null),[copied,setCopied]=useState(false),[pop,setPop]=useState(true);
  const drag=useRef({});
  const t=T[lang];
  useEffect(()=>{ try{const l=localStorage.getItem('lang'); if(T[l]) setLang(l); if(sessionStorage.getItem('pop')) setPop(false);}catch{}
    if(!sessionStorage.getItem('v')){ sessionStorage.setItem('v',1); track('visit'); } },[]);
  const chg=l=>{ setLang(l); try{localStorage.setItem('lang',l)}catch{} };
  const closePop=()=>{ setPop(false); try{sessionStorage.setItem('pop',1)}catch{} };
  const types=useMemo(()=>[...new Set(items.filter(i=>i.type==='each'&&i.ptype).map(i=>i.ptype))],[items]);
  const pick=ty=>items.filter(i=>i.type===ty&&(i.title||'').toLowerCase().includes(q.toLowerCase())&&(ty!=='each'||!pt||i.ptype===pt)&&(!only||i.status!=='sold'));
  const each=pick('each'), acc=pick('account'), testi=items.filter(i=>i.type==='testi');
  const fe=items.filter(i=>i.featured&&i.type==='each'), fa=items.filter(i=>i.featured&&i.type==='account');
  const show=it=>{ setOpen(it); setCopied(false); track('view',it.id); };
  const dn=e=>{ const el=e.currentTarget; drag.current={el,x:e.pageX,l:el.scrollLeft,m:false}; };
  const mv=e=>{ const d=drag.current; if(!d.el) return; const dx=e.pageX-d.x; if(Math.abs(dx)>5){ d.m=true; d.el.classList.add('drag'); } if(d.m) d.el.scrollLeft=d.l-dx; };
  const up=()=>{ const d=drag.current; if(d.el){ d.el.classList.remove('drag'); d.el=null; } };
  const clk=it=>{ if(!drag.current.m) show(it); };
  const dm=(kind,it)=>{
    const text=`${t.msg} ${it.title} (${location.origin})`;
    track('dm',it.id);
    if(kind==='wa') return window.open(`https://wa.me/${settings.wa}?text=${encodeURIComponent(text)}`);
    navigator.clipboard?.writeText(text).then(()=>setCopied(true));
    window.open(kind==='ig'?`https://ig.me/m/${settings.ig}`:`https://m.me/${settings.fb}`);
  };
  const slots=(list,n)=>Array.from({length:n},(_,i)=>{ const it=list[i];
    return it? <article key={it.id} className={'slot'+(it.status==='sold'?' sold':'')} onClick={()=>show(it)} title={it.title}>
      {it.media?.[0]&&(isVid(it.media[0])?<video src={it.media[0]+'#t=0.5'} muted playsInline preload="metadata"/>:<img src={it.media[0]} alt={it.title} draggable={false}/>)}
      <span className="sc">{it.title}</span></article> : <div key={'e'+i} className="slot empty"/>; });
  const row=(title,list,mini)=>list.length>0&&<section className="rs">
    <div className="rh"><h2>{title}</h2><i className="ln"/><small>{t.drag} ⟷</small></div>
    <div className="strip" onMouseDown={dn} onMouseMove={mv} onMouseUp={up} onMouseLeave={up}>{list.map(it=>
      <article key={it.id} className={'tile'+(mini?' mini':'')+(it.status==='sold'?' sold':'')} onClick={()=>clk(it)}>
        {it.media?.[0]&&(isVid(it.media[0])?<video src={it.media[0]+'#t=0.5'} muted playsInline preload="metadata"/>:<img src={it.media[0]} alt={it.title} draggable={false}/>)}
        {it.badge&&<b className="badge">{it.badge}</b>}
        {it.status==='sold'&&<b className="stamp">{t.sold}</b>}{it.status==='booked'&&<b className="stamp bk">{t.booked}</b>}
        {!mini&&<div className="cap">{it.title}</div>}
      </article>)}</div>
  </section>;
  return <main>
    <nav className="bar">
      <span className="brand"><Ball s={30}/>RAMA POGO<i className="live"/></span>
      <input className="sq" placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/>
      <button className="star" onClick={()=>setPop(true)}>★ {t.featured}</button>
      <span className="lang"><button className={lang==='en'?'on':''} onClick={()=>chg('en')}>EN</button><button className={lang==='id'?'on':''} onClick={()=>chg('id')}>ID</button></span>
      <select value={cur} onChange={e=>setCur(e.target.value)} aria-label="Currency">{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select>
    </nav>
    <div className="chips">
      <button className={!pt?'on':''} onClick={()=>setPt('')}>{t.all}</button>
      {types.map(x=><button key={x} className={pt===x?'on':''} onClick={()=>setPt(x)}>{x}</button>)}
      <button className={only?'on':''} onClick={()=>setOnly(!only)}>{t.hide}</button>
    </div>
    {row(t.each,each)}
    {row(t.acc,acc)}
    {row(t.testi,testi,true)}
    {!each.length&&!acc.length&&!testi.length&&<p className="empty">{t.empty}</p>}
    {pop&&<div className="pop"><div className="win">
      <button className="wx" onClick={closePop} aria-label={t.close}>✕</button>
      <h3 className="wt">{t.featured} · {t.each}</h3>
      <div className="g8">{slots(fe,16)}</div>
      <h3 className="wt">{t.featured} · {t.acc}</h3>
      <div className="g8">{slots(fa,8)}</div>
    </div></div>}
    {open&&<div className="modal" onClick={()=>setOpen(null)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <button className="x" onClick={()=>setOpen(null)}>{t.close}</button>
      <div className="gal">{(open.media||[]).map(u=><Media key={u} url={u} wm={settings.watermark}/>)}</div>
      {open.type!=='testi'&&<>
        <h2 className="mt">{open.title}</h2>
        <span className="price">{open.oldPrice>open.price&&<s>{fmt(open.oldPrice,cur)}</s>}{fmt(open.price,cur)}</span>
        {open.type==='each'&&<small> {t.stock} {open.stock??1}</small>}
        {open.type==='account'&&open.details&&<dl>{Object.entries(open.details).filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        {open.notes&&<div className="notes"><small>{t.desc}</small><p>{open.notes}</p></div>}
        {open.status==='sold'?<p className="empty">{t.soldMsg}</p>:<div className="dm">
          <button onClick={()=>dm('ig',open)}>{t.ig}</button><button onClick={()=>dm('fb',open)}>{t.fb}</button>
          {settings.wa&&<button onClick={()=>dm('wa',open)}>{t.wa}</button>}
          {copied&&<small>{t.copied}</small>}</div>}
      </>}
    </div></div>}
  </main>;
}

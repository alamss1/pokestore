'use client';
import { useState, useEffect, useMemo } from 'react';
import { RATES, currencyFor, fmt } from '@/lib/currency';
const track=(type,id)=>fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id})}).catch(()=>{});
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);
const T={
 en:{search:'Search',all:'All',hide:'Hide sold',acc:'Account',testi:'Testimonials',stock:'Stock',sold:'SOLD',booked:'BOOKED',close:'Close',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Message copied. Paste it in the DM.',empty:'Nothing here yet.',soldMsg:'This item has been sold.',msg:'Hi, I want to buy:'},
 id:{search:'Cari',all:'Semua',hide:'Sembunyikan sold',acc:'Account',testi:'Testimoni',stock:'Stok',sold:'SOLD',booked:'BOOKED',close:'Tutup',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Pesan disalin. Tempel di DM.',empty:'Belum ada item.',soldMsg:'Item ini sudah terjual.',msg:'Halo, saya mau beli:'}
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
  const [cur,setCur]=useState(currencyFor(country)),[open,setOpen]=useState(null),[copied,setCopied]=useState(false);
  const t=T[lang];
  useEffect(()=>{ try{const l=localStorage.getItem('lang'); if(T[l]) setLang(l);}catch{}
    if(!sessionStorage.getItem('v')){ sessionStorage.setItem('v',1); track('visit'); } },[]);
  const chg=l=>{ setLang(l); try{localStorage.setItem('lang',l)}catch{} };
  const types=useMemo(()=>[...new Set(items.filter(i=>i.type==='each'&&i.ptype).map(i=>i.ptype))],[items]);
  const pick=ty=>items.filter(i=>i.type===ty&&(i.title||'').toLowerCase().includes(q.toLowerCase())&&(ty!=='each'||!pt||i.ptype===pt)&&(!only||i.status!=='sold'));
  const each=pick('each'), acc=pick('account'), testi=items.filter(i=>i.type==='testi');
  const show=it=>{ setOpen(it); setCopied(false); track('view',it.id); };
  const dm=(kind,it)=>{
    const text=`${t.msg} ${it.title} (${location.origin})`;
    track('dm',it.id);
    if(kind==='wa') return window.open(`https://wa.me/${settings.wa}?text=${encodeURIComponent(text)}`);
    navigator.clipboard?.writeText(text).then(()=>setCopied(true));
    window.open(kind==='ig'?`https://ig.me/m/${settings.ig}`:`https://m.me/${settings.fb}`);
  };
  const Price=({it})=><span className="price">{it.oldPrice>it.price&&<s>{fmt(it.oldPrice,cur)}</s>}{fmt(it.price,cur)}</span>;
  const tiles=list=>list.map(it=>
    <article key={it.id} className={'tile'+(it.status==='sold'?' sold':'')} onClick={()=>show(it)}>
      {it.media?.[0]&&(isVid(it.media[0])?<video src={it.media[0]+'#t=0.5'} muted playsInline preload="metadata"/>:<img src={it.media[0]} alt={it.title} draggable={false}/>)}
      {it.badge&&<b className="badge">{it.badge}</b>}
      {it.status==='sold'&&<b className="stamp">{t.sold}</b>}{it.status==='booked'&&<b className="stamp bk">{t.booked}</b>}
      {it.type!=='testi'&&<div className="cap"><span>{it.title}</span><b>{fmt(it.price,cur)}</b></div>}
    </article>);
  const none=!each.length&&!acc.length&&!testi.length;
  return <main>
    <nav className="bar">
      <span className="brand"><Ball s={30}/>Rama Store</span>
      <input className="sq" placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/>
      <span className="lang"><button className={lang==='en'?'on':''} onClick={()=>chg('en')}>EN</button><button className={lang==='id'?'on':''} onClick={()=>chg('id')}>ID</button></span>
      <select value={cur} onChange={e=>setCur(e.target.value)} aria-label="Currency">{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select>
    </nav>
    <div className="chips">
      <button className={!pt?'on':''} onClick={()=>setPt('')}>{t.all}</button>
      {types.map(x=><button key={x} className={pt===x?'on':''} onClick={()=>setPt(x)}>{x}</button>)}
      <button className={only?'on':''} onClick={()=>setOnly(!only)}>{t.hide}</button>
    </div>
    {each.length>0&&<div className="grid">{tiles(each)}</div>}
    {acc.length>0&&<><h2 className="lbl">{t.acc}</h2><div className="grid wide">{tiles(acc)}</div></>}
    {testi.length>0&&<><h2 className="lbl">{t.testi}</h2><div className="grid mini">{tiles(testi)}</div></>}
    {none&&<p className="empty">{t.empty}</p>}
    {open&&<div className="modal" onClick={()=>setOpen(null)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <button className="x" onClick={()=>setOpen(null)}>{t.close}</button>
      <div className="gal">{(open.media||[]).map(u=><Media key={u} url={u} wm={settings.watermark}/>)}</div>
      {open.type!=='testi'&&<>
        <h2>{open.title}</h2><Price it={open}/>
        {open.type==='each'&&<small> · {t.stock} {open.stock??1}</small>}
        {open.type==='account'&&open.details&&<dl>{Object.entries(open.details).filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        {open.notes&&<p className="notes">{open.notes}</p>}
        {open.status==='sold'?<p className="empty">{t.soldMsg}</p>:<div className="dm">
          <button onClick={()=>dm('ig',open)}>{t.ig}</button><button onClick={()=>dm('fb',open)}>{t.fb}</button>
          {settings.wa&&<button onClick={()=>dm('wa',open)}>{t.wa}</button>}
          {copied&&<small>{t.copied}</small>}</div>}
      </>}
    </div></div>}
  </main>;
}

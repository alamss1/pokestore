'use client';
import { useState, useEffect, useMemo } from 'react';
import { RATES, currencyFor, fmt } from '@/lib/currency';
const track=(type,id)=>fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id})}).catch(()=>{});
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);
const T={
 en:{h1:'Find your next favorite Pokémon account.',sub:'Hand-picked accounts and single Pokémon, ready to play.',search:'Search name...',all:'All types',hide:'Hide sold',each:'Each',eachS:'Single Pokémon',acc:'Account',accS:'Full accounts, ready to play',testi:'Testimonials',testiS:'Proof from happy buyers',stock:'Stock',sold:'SOLD',booked:'BOOKED',close:'Close',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Message copied. Paste it in the DM.',empty:'Nothing here yet.',soldMsg:'This item has been sold.',msg:'Hi, I want to buy:',left:'available',view:'View',tick:['Shiny','Legendary','High level','Rare Pokémon','Full accounts','Single Pokémon']},
 id:{h1:'Temukan akun Pokémon favoritmu berikutnya.',sub:'Akun dan Pokémon satuan pilihan, siap dimainkan.',search:'Cari nama...',all:'Semua jenis',hide:'Sembunyikan sold',each:'Each',eachS:'Pokémon satuan',acc:'Account',accS:'Akun lengkap, siap main',testi:'Testimoni',testiS:'Bukti dari pembeli',stock:'Stok',sold:'SOLD',booked:'BOOKED',close:'Tutup',ig:'DM Instagram',fb:'DM Facebook',wa:'WhatsApp',copied:'Pesan disalin. Tempel di DM.',empty:'Belum ada item.',soldMsg:'Item ini sudah terjual.',msg:'Halo, saya mau beli:',left:'tersedia',view:'Lihat',tick:['Shiny','Legendary','Level tinggi','Pokémon langka','Akun lengkap','Pokémon satuan']}
};
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
  const n=items.filter(i=>i.type!=='testi'&&i.status!=='sold').length;
  const show=it=>{ setOpen(it); setCopied(false); track('view',it.id); };
  const sc=(id,d)=>document.getElementById(id+'-s')?.scrollBy({left:d*330,behavior:'smooth'});
  const dm=(kind,it)=>{
    const text=`${t.msg} ${it.title} (${location.origin})`;
    track('dm',it.id);
    if(kind==='wa') return window.open(`https://wa.me/${settings.wa}?text=${encodeURIComponent(text)}`);
    navigator.clipboard?.writeText(text).then(()=>setCopied(true));
    window.open(kind==='ig'?`https://ig.me/m/${settings.ig}`:`https://m.me/${settings.fb}`);
  };
  const Price=({it})=><span className="price">{it.oldPrice>it.price&&<s>{fmt(it.oldPrice,cur)}</s>}{fmt(it.price,cur)}</span>;
  const row=(id,title,sub,list,mini)=><section id={id} className="rs">
    <div className="rh"><h2>{title}<small>{sub}</small></h2>
      <div className="arr"><button aria-label="Previous" onClick={()=>sc(id,-1)}>‹</button><button aria-label="Next" onClick={()=>sc(id,1)}>›</button></div></div>
    {list.length? <div className="strip" id={id+'-s'}>{list.map(it=>
      <article key={it.id} className={'big'+(mini?' mini':'')+(it.status==='sold'?' sold':'')} onClick={()=>show(it)}><div className="in">
        <div className="thumb">{it.media?.[0]&&(isVid(it.media[0])?<video src={it.media[0]+'#t=0.5'} muted playsInline preload="metadata"/>:<img src={it.media[0]} alt={it.title} draggable={false}/>)}
          {it.badge&&<b className="badge">{it.badge}</b>}
          {it.status==='sold'&&<b className="stamp">{t.sold}</b>}{it.status==='booked'&&<b className="stamp bk">{t.booked}</b>}</div>
        {!mini&&<div className="info"><h3>{it.title}</h3><div className="meta"><Price it={it}/><span className="go">{t.view}</span></div>
          {it.type==='each'&&<small>{t.stock} {it.stock??1}</small>}</div>}
      </div></article>)}</div> : <p className="empty">{t.empty}</p>}
  </section>;
  const tk=[...t.tick,...t.tick].map((w,i)=><span key={i}>{w} ✦</span>);
  return <main>
    <div className="blobs" aria-hidden><i/><i/><i/></div>
    <nav className="nav">
      <span className="brand"><i className="dot"/>Rama Store</span>
      <span className="pills"><a href="#each">{t.each}</a><a href="#account">{t.acc}</a>{testi.length>0&&<a href="#testi">{t.testi}</a>}</span>
      <span className="lang"><button className={lang==='en'?'on':''} onClick={()=>chg('en')}>EN</button><button className={lang==='id'?'on':''} onClick={()=>chg('id')}>ID</button></span>
      <select value={cur} onChange={e=>setCur(e.target.value)} aria-label="Currency">{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select>
    </nav>
    <header className="hero"><div><h1>{t.h1}</h1><p>{t.sub}</p><span className="chip">{n} {t.left}</span></div><div className="orb"/></header>
    <div className="tick"><div>{tk}</div></div>
    <div className="filters">
      <input placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/>
      <select value={pt} onChange={e=>setPt(e.target.value)}><option value="">{t.all}</option>{types.map(x=><option key={x}>{x}</option>)}</select>
      <label className="chk"><input type="checkbox" checked={only} onChange={e=>setOnly(e.target.checked)}/> {t.hide}</label>
    </div>
    {row('each',t.each,t.eachS,each)}
    {row('account',t.acc,t.accS,acc)}
    {testi.length>0&&row('testi',t.testi,t.testiS,testi,true)}
    {open&&<div className="modal" onClick={()=>setOpen(null)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <button className="x" onClick={()=>setOpen(null)}>{t.close}</button>
      <div className="gal">{(open.media||[]).map(u=><Media key={u} url={u} wm={settings.watermark}/>)}</div>
      {open.type!=='testi'&&<>
        <h2>{open.title}</h2><Price it={open}/>
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

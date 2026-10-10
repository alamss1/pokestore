'use client';
import { useState, useEffect, useMemo } from 'react';
import { RATES, currencyFor, fmt } from '@/lib/currency';
const track = (type,id)=>fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,id})}).catch(()=>{});
const isVid = u=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);

function Media({url,wm}){
  return <div className="media" onContextMenu={e=>e.preventDefault()}>
    {isVid(url)? <video src={url} controls controlsList="nodownload noplaybackrate" disablePictureInPicture playsInline preload="metadata"/> : <img src={url} alt="" draggable={false}/>}
    {wm && <span className="wm">{wm}</span>}
  </div>;
}

export default function Store({items,settings,country}){
  const [q,setQ]=useState(''), [pt,setPt]=useState(''), [only,setOnly]=useState(false);
  const [cur,setCur]=useState(currencyFor(country)), [open,setOpen]=useState(null), [copied,setCopied]=useState(false);
  useEffect(()=>{ if(!sessionStorage.getItem('v')){ sessionStorage.setItem('v',1); track('visit'); } },[]);
  const types = useMemo(()=>[...new Set(items.filter(i=>i.type==='each'&&i.ptype).map(i=>i.ptype))],[items]);
  const pick = t=>items.filter(i=>i.type===t && (i.title||'').toLowerCase().includes(q.toLowerCase()) && (t!=='each'||!pt||i.ptype===pt) && (!only||i.status!=='sold'));
  const each=pick('each'), acc=pick('account'), testi=items.filter(i=>i.type==='testi');
  const show = it=>{ setOpen(it); setCopied(false); track('view',it.id); };
  const dm = (kind,it)=>{
    const text = `Halo, saya mau beli: ${it.title} (${location.origin})`;
    track('dm',it.id);
    if(kind==='wa') return window.open(`https://wa.me/${settings.wa}?text=${encodeURIComponent(text)}`);
    navigator.clipboard?.writeText(text).then(()=>setCopied(true));
    window.open(kind==='ig'?`https://ig.me/m/${settings.ig}`:`https://m.me/${settings.fb}`);
  };
  const Price = ({it})=> <span className="price">{it.oldPrice>it.price && <s>{fmt(it.oldPrice,cur)}</s>} {fmt(it.price,cur)}</span>;
  const strip = (title,sub,list,mini)=> <section className="rs">
    <h2><i className="ball"/>{title}<small>{sub}</small></h2>
    {list.length? <div className="strip">{list.map(it=>
      <article key={it.id} className={'big'+(mini?' mini':'')+(it.status==='sold'?' sold':'')} onClick={()=>show(it)}>
        <div className="thumb">{it.media?.[0] && (isVid(it.media[0])? <video src={it.media[0]+'#t=0.5'} muted playsInline preload="metadata"/> : <img src={it.media[0]} alt={it.title} draggable={false}/>)}
          {it.badge && <b className="badge">{it.badge}</b>}
          {it.status==='sold' && <b className="stamp">SOLD</b>}{it.status==='booked' && <b className="stamp bk">BOOKED</b>}</div>
        {!mini && <div className="info"><h3>{it.title}</h3><div className="meta"><Price it={it}/>{it.type==='each' && <small>Stok {it.stock??1}</small>}</div></div>}
      </article>)}</div> : <p className="empty">Belum ada item.</p>}
  </section>;

  return <main>
    <div className="bg" aria-hidden><i className="ball b1"/><i className="ball b2"/><i className="ball b3"/></div>
    <header className="top">
      <h1><i className="ball lg"/>PokéStore</h1>
      <select value={cur} onChange={e=>setCur(e.target.value)} aria-label="Mata uang">{Object.keys(RATES).map(c=><option key={c}>{c}</option>)}</select>
    </header>
    <div className="filters">
      <input placeholder="Cari nama..." value={q} onChange={e=>setQ(e.target.value)}/>
      <select value={pt} onChange={e=>setPt(e.target.value)}><option value="">Semua jenis (Each)</option>{types.map(t=><option key={t}>{t}</option>)}</select>
      <label><input type="checkbox" checked={only} onChange={e=>setOnly(e.target.checked)}/> Sembunyikan sold</label>
    </div>
    {strip('Each','Pokémon satuan',each)}
    {strip('Take Account','Akun lengkap',acc)}
    {testi.length>0 && strip('Testimoni','Bukti transaksi',testi,true)}
    {open && <div className="modal" onClick={()=>setOpen(null)}><div className="sheet" onClick={e=>e.stopPropagation()}>
      <button className="x" onClick={()=>setOpen(null)}>Tutup</button>
      <div className="gal">{(open.media||[]).map(u=><Media key={u} url={u} wm={settings.watermark}/>)}</div>
      {open.type!=='testi' && <>
        <h2>{open.title}</h2><Price it={open}/>
        {open.type==='account' && open.details && <dl>{Object.entries(open.details).filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        {open.notes && <p className="notes">{open.notes}</p>}
        {open.status==='sold'? <p className="empty">Item ini sudah terjual.</p> : <div className="dm">
          <button onClick={()=>dm('ig',open)}>DM Instagram</button><button onClick={()=>dm('fb',open)}>DM Facebook</button>
          {settings.wa && <button onClick={()=>dm('wa',open)}>WhatsApp</button>}
          {copied && <small>Teks pesan sudah disalin. Tempel di DM.</small>}</div>}
      </>}
    </div></div>}
  </main>;
}

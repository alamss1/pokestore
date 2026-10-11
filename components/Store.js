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
  const pick=ty=>items.filter(i=>i.type===ty&&(i.title||'').toLowerCase().includes(q.toLowerCase())&&(ty!=='each'||!pt||i.ptype===pt)&&(!onl

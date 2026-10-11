'use client';
import { useState, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
const J = (url,method='GET',body)=>fetch(url,{method,headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)}).then(r=>r.ok?r.json():Promise.reject(r.status));
const EMPTY = { type:'each', title:'', ptype:'', price:0, oldPrice:0, stock:1, status:'available', published:false, featured:false, index:1, badge:'', notes:'', media:[], fx:50, fy:50, fz:1, details:{level:'',team:'',pokemon:'',shiny:'',legendary:'',login:'',tahun:''} };
const isVid = u=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);

export default function Admin(){
  const [auth,setAuth]=useState(null), [tab,setTab]=useState('items'), [items,setItems]=useState([]), [f,setF]=useState(null), [pw,setPw]=useState(''), [busy,setBusy]=useState(''), [st,setSt]=useState(null), [set,setSet]=useState(null);
  const load=()=>J('/api/items').then(d=>{setItems(d);setAuth(true)}).catch(()=>setAuth(false));
  useEffect(()=>{load()},[]);
  useEffect(()=>{ if(auth&&tab==='stats') J('/api/stats').then(setSt); if(auth&&tab==='set') J('/api/settings').then(setSet); },[tab,auth]);
  const login=()=>J('/api/login','POST',{password:pw}).then(load).catch(()=>alert('Password salah'));
  const save=async()=>{ await J('/api/items','POST',f); setF(null); load(); };
  const del=async id=>{ if(confirm('Hapus item ini?')){ await J('/api/items?id='+id,'DELETE'); load(); } };
  const up=async e=>{
    const files=[...e.target.files]; const urls=[];
    try{
      for(const file of files){ setBusy(`Mengunggah ${file.name}...`); const b=await upload(file.name,file,{access:'public',handleUploadUrl:'/api/upload',multipart:true}); urls.push(b.url); }
      setF(x=>({...x,media:[...x.media,...urls]}));
    }catch(err){ alert('Upload gagal: '+(err?.message||err)); }
    setBusy('');
  };
  const mv=(i,d)=>setF(x=>{const m=[...x.media];const j=i+d;if(j<0||j>=m.length)return x;[m[i],m[j]]=[m[j],m[i]];return {...x,media:m}});
  const t=(k,v)=>setF(x=>({...x,[k]:v})), td=(k,v)=>setF(x=>({...x,details:{...x.details,[k]:v}}));
  const name=id=>items.find(i=>i.id===id)?.title||id;
  const pos=e=>{const r=e.currentTarget.getBoundingClientRect();setF(x=>({...x,fx:Math.round((e.clientX-r.left)/r.width*100),fy:Math.round((e.clientY-r.top)/r.height*100)}))};
  const fx=f?.fx??50, fy=f?.fy??50, fz=f?.fz||1;

  if(auth===null) return <main>Memuat...</main>;
  if(!auth) return <main className="adm" style={{maxWidth:340}}><h1>Admin</h1><input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}/><button className="btn" onClick={login}>Masuk</button></main>;

  return <main>
    <header className="top"><h1>Admin</h1><a href="/">Lihat toko</a></header>
    <nav className="tabs">{[['items','Item'],['stats','Statistik'],['set','Pengaturan']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>{setTab(k);setF(null)}}>{l}</button>)}</nav>

    {tab==='items' && !f && <>
      <button className="btn" onClick={()=>setF({...EMPTY,index:items.length+1})}>Tambah item</button><br/><br/>
      {items.map(i=><div className="li" key={i.id}>
        {i.media?.[0]&&(isVid(i.media[0])?<video src={i.media[0]} muted/>:<img src={i.media[0]} alt=""/>)}
        <span><b>{i.title}</b>{i.featured?' ★':''}<br/><small>{i.type} · #{i.index} · {i.status} · Rp{i.price} {i.published?'':'· DRAFT'}</small></span>
        <button className="btn" onClick={()=>setF({...EMPTY,...i,details:{...EMPTY.details,...(i.details||{})}})}>Edit</button><button className="x" onClick={()=>del(i.id)}>Hapus</button></div>)}
    </>}

    {tab==='items' && f && <div className="adm">
      <label>Jenis<select value={f.type} onChange={e=>t('type',e.target.value)}><option value="each">Each (Pokémon satuan)</option><option value="account">Account</option><option value="testi">Testimoni</option></select></label>
      {f.type!=='testi' && <>
        <label>Nama<input value={f.title} onChange={e=>t('title',e.target.value)}/></label>
        {f.type==='each' && <label>Jenis Pokémon (Fire, Water, ...)<input value={f.ptype} onChange={e=>t('ptype',e.target.value)}/></label>}
        <div className="two"><label>Harga (Rupiah)<input type="number" value={f.price} onChange={e=>t('price',+e.target.value)}/></label><label>Harga coret (opsional)<input type="number" value={f.oldPrice} onChange={e=>t('oldPrice',+e.target.value)}/></label></div>
        <div className="two"><label>Stok<input type="number" value={f.stock} onChange={e=>t('stock',+e.target.value)}/></label><label>Badge (NEW/HOT/DISKON)<input value={f.badge} onChange={e=>t('badge',e.target.value)}/></label></div>
        <label>Status<select value={f.status} onChange={e=>t('status',e.target.value)}><option value="available">Available</option><option value="booked">Booked</option><option value="sold">Sold</option></select></label>
      </>}
      {f.type==='account' && <div className="two">{Object.keys(EMPTY.details).map(k=><label key={k}>{k}<input value={f.details[k]||''} onChange={e=>td(k,e.target.value)}/></label>)}</div>}
      {f.type!=='testi' && <label>Deskripsi / catatan (tampil setelah item diklik)<textarea rows={4} value={f.notes} onChange={e=>t('notes',e.target.value)}/></label>}
      <label>Nomor index (urutan tampil, kecil = atas)<input type="number" value={f.index} onChange={e=>t('index',+e.target.value)}/></label>
      <label>Foto / video (boleh banyak)<input type="file" accept="image/*,video/*" multiple onChange={up}/></label>{busy&&<small>{busy}</small>}
      {f.media.map((u,i)=><div className="li" key={u}>{isVid(u)?<video src={u} muted/>:<img src={u} alt=""/>}<span>Media {i+1}{i===0?' (gambar utama)':''}</span><button className="x" onClick={()=>mv(i,-1)}>Naik</button><button className="x" onClick={()=>mv(i,1)}>Turun</button><button className="x" onClick={()=>t('media',f.media.filter(m=>m!==u))}>Hapus</button></div>)}
      {f.type!=='testi' && f.media[0] && !isVid(f.media[0]) && <div className="fp">
        <small>Pilih area yang ingin ditonjolkan. Klik pada gambar, gambar aslinya tidak dipotong.</small>
        <div className="fpw">
          <img src={f.media[0]} alt="" onClick={pos}/>
          <i style={{left:fx+'%',top:fy+'%'}}/>
        </div>
        <label>Zoom {fz}x<input type="range" min="1" max="3" step="0.1" value={fz} onChange={e=>t('fz',+e.target.value)}/></label>
        <small>Pratinjau di kartu:</small>
        <div className="pv"><img src={f.media[0]} alt="" style={{objectPosition:`${fx}% ${fy}%`,transformOrigin:`${fx}% ${fy}%`,transform:`scale(${fz})`}}/></div>
      </div>}
      {f.type!=='testi' && <label><span><input type="checkbox" checked={!!f.featured} onChange={e=>t('featured',e.target.checked)}/> Unggulan (tampil di jendela depan)</span></label>}
      <label><span><input type="checkbox" checked={f.published} onChange={e=>t('published',e.target.checked)}/> Tayangkan (kalau tidak dicentang, jadi draft)</span></label>
      <div className="two"><button className="btn" onClick={save} disabled={!!busy}>Simpan</button><button className="x" onClick={()=>setF(null)}>Batal</button></div>
    </div>}

    {tab==='stats' && (st? <>
      <p>Total kunjungan: <b>{st.visit.site||0}</b></p>
      <h3>Item paling dilihat</h3><table><tbody><tr><th>Item</th><th>Dilihat</th><th>Klik DM</th></tr>
        {Object.entries(st.view).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([id,n])=><tr key={id}><td>{name(id)}</td><td>{n}</td><td>{st.dm[id]||0}</td></tr>)}</tbody></table>
      <h3>Pengunjung per negara</h3><table><tbody>{Object.entries(st.country).sort((a,b)=>b[1]-a[1]).map(([c,n])=><tr key={c}><td>{c}</td><td>{n}</td></tr>)}</tbody></table>
      <h3>Per hari</h3><table><tbody>{Object.entries(st.day).sort().reverse().slice(0,14).map(([d,n])=><tr key={d}><td>{d}</td><td>{n}</td></tr>)}</tbody></table>
    </> : 'Memuat...')}

    {tab==='set' && set && <div className="adm">
      <label>Teks watermark video/foto<input value={set.watermark} onChange={e=>setSet({...set,watermark:e.target.value})}/></label>
      <label>Instagram (username)<input value={set.ig} onChange={e=>setSet({...set,ig:e.target.value})}/></label>
      <label>Facebook (username)<input value={set.fb} onChange={e=>setSet({...set,fb:e.target.value})}/></label>
      <label>WhatsApp (format 628xxx, kosongkan jika tidak dipakai)<input value={set.wa} onChange={e=>setSet({...set,wa:e.target.value})}/></label>
      <button className="btn" onClick={()=>J('/api/settings','POST',set).then(()=>alert('Tersimpan'))}>Simpan pengaturan</button>
    </div>}
  </main>;
}

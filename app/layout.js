import './globals.css';
import { Bricolage_Grotesque } from 'next/font/google';
const f = Bricolage_Grotesque({ subsets:['latin'], variable:'--f' });
export const metadata = { title:'PokéStore — Pokémon GO Accounts & Each', description:'Jual akun Pokémon GO dan Pokémon satuan.' };
export default function L({children}){ return <html lang="id"><body className={f.variable}>{children}</body></html>; }

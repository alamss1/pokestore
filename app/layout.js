import './globals.css';
import { Bricolage_Grotesque } from 'next/font/google';
const f = Bricolage_Grotesque({ subsets:['latin'], variable:'--f' });
export const metadata = { title:'Rama Store — Pokémon GO Accounts & Pokémon', description:'Hand-picked Pokémon GO accounts and single Pokémon.' };
export default function L({children}){ return <html lang="en"><body className={f.variable}>{children}</body></html>; }

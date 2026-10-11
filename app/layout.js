import './globals.css';
import { Orbitron, Rajdhani } from 'next/font/google';
const d = Orbitron({ subsets:['latin'], variable:'--d' });
const f = Rajdhani({ subsets:['latin'], weight:['400','500','600','700'], variable:'--f' });
export const metadata = { title:'Rama PoGo', description:'Pokémon GO accounts and single Pokémon collection.' };
export default function L({children}){ return <html lang="en"><body className={`${f.variable} ${d.variable}`}>{children}</body></html>; }

// Harga disimpan dalam Rupiah. Nilai = berapa 1 IDR dalam mata uang tsb. Sesuaikan kurs di sini.
export const RATES = { IDR:1, USD:0.000061, MYR:0.00027, SGD:0.000080, EUR:0.000055, GBP:0.000047, AUD:0.000094, PHP:0.0035 };
const C = { ID:'IDR', US:'USD', MY:'MYR', SG:'SGD', GB:'GBP', AU:'AUD', PH:'PHP', DE:'EUR', FR:'EUR', NL:'EUR', IT:'EUR', ES:'EUR' };
export const currencyFor = (cc) => C[cc] || 'USD';
export const fmt = (idr, cur) => new Intl.NumberFormat(cur==='IDR'?'id-ID':'en-US',{style:'currency',currency:cur,maximumFractionDigits:cur==='IDR'||cur==='PHP'?0:2}).format((idr||0)*RATES[cur]);

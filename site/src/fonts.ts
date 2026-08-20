import type { FontId } from './types';

export const fontCatalog:Record<FontId,{label:string;family:string;weight:number;category:'Script'|'Serif'|'Display'|'Sans';widthFactor:number}>={
  'alex-brush':{label:'Alex Brush',family:'Alex Brush, cursive',weight:400,category:'Script',widthFactor:.5},
  allura:{label:'Allura',family:'Allura, cursive',weight:400,category:'Script',widthFactor:.47},
  parisienne:{label:'Parisienne',family:'Parisienne, cursive',weight:400,category:'Script',widthFactor:.5},
  elegant:{label:'Lobster',family:'Lobster, cursive',weight:400,category:'Script',widthFactor:.53},
  cormorant:{label:'Cormorant Garamond',family:'Cormorant Garamond, serif',weight:600,category:'Serif',widthFactor:.5},
  playfair:{label:'Playfair Display',family:'Playfair Display, serif',weight:600,category:'Serif',widthFactor:.55},
  baskerville:{label:'Libre Baskerville',family:'Libre Baskerville, serif',weight:400,category:'Serif',widthFactor:.58},
  bodoni:{label:'Bodoni Moda',family:'Bodoni Moda, serif',weight:600,category:'Display',widthFactor:.56},
  cinzel:{label:'Cinzel',family:'Cinzel, serif',weight:600,category:'Display',widthFactor:.62},
  modern:{label:'Montserrat',family:'Montserrat, sans-serif',weight:600,category:'Sans',widthFactor:.58},
};
export const fontIds=Object.keys(fontCatalog) as FontId[];
export const fontLabels=Object.fromEntries(fontIds.map((id)=>[id,fontCatalog[id].label])) as Record<FontId,string>;
export function textExpansionForFont(id:FontId){return fontCatalog[id].category==='Script'?.3:.14;}

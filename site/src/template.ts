import type { ColourId, PlaqueDesign, PlaqueTemplate } from './types';
export const weddingTemplate: PlaqueTemplate = { id:'wedding-classic-v1', title:'Classic wedding', widthMm:120, heightMm:70, baseThicknessMm:2, detailHeightMm:1, safeMarginMm:8, fields:{ names:{maxCharacters:30,minFontSizeMm:6,maxFontSizeMm:12,maxWidthMm:100}, date:{maxCharacters:30,minFontSizeMm:3.2,maxFontSizeMm:5.5,maxWidthMm:76} } };
export const defaultDesign: PlaqueDesign = { version:1, templateId:weddingTemplate.id, names:'Camille & Morgan', date:'11 April 2026', font:'elegant', baseColour:'charcoal', detailColour:'gold' };
export const colours: Record<ColourId,{label:string;value:string;role:'base'|'detail'|'both'}> = {
  charcoal:{label:'Charcoal',value:'#171717',role:'base'}, ivory:{label:'Ivory',value:'#eee7d8',role:'both'}, navy:{label:'Midnight navy',value:'#142535',role:'base'}, sage:{label:'Sage',value:'#829072',role:'both'}, gold:{label:'Warm gold',value:'#c99a4b',role:'detail'}, silver:{label:'Soft silver',value:'#bfc1c2',role:'detail'}
};
export const baseColours=(Object.keys(colours) as ColourId[]).filter((id)=>colours[id].role!=='detail');
export const detailColours=(Object.keys(colours) as ColourId[]).filter((id)=>colours[id].role!=='base');


import { useEffect, useState, type ReactNode } from 'react';
import type { Font } from 'opentype.js';
import { heartSvgPoints, leafPlacements, pointsAttribute, starPoints } from './decorations';
import { loadProductionFont } from './fontMetrics';
import { deriveMonogram, fitText, fitTextWithMetrics, normalizedText } from './layout';
import { colours, getTemplate } from './template';
import type { OrnamentId, PlaqueDesign } from './types';

export function PlaquePreview({design}:{design:PlaqueDesign}){
  const[font,setFont]=useState<Font|null>(null);
  const template=getTemplate(design.templateId);
  useEffect(()=>{let active=true;setFont(null);loadProductionFont(design.font).then((loaded)=>{if(active)setFont(loaded);}).catch(()=>setFont(null));return()=>{active=false;};},[design.font]);
  const names=normalizedText(design.names)||'Names';
  const date=normalizedText(design.date)||'Event date';
  const size=(text:string,field:'names'|'date')=>font?fitTextWithMetrics(text,field,design.font,(value,fontSize)=>font.getAdvanceWidth(value,fontSize,{kerning:true}),design.templateId):fitText(text,field,design.font,design.templateId);
  const detail=colours[design.detailColour].value;
  const fontFamily=design.font==='elegant'?'Lobster, cursive':'Montserrat, sans-serif';
  const fontWeight=design.font==='modern'?600:400;
  return <figure className="preview-frame" aria-label="Live plaque preview"><div className="preview-stage"><svg className="plaque" viewBox="0 0 120 70" role="img" aria-labelledby="preview-title preview-description"><title id="preview-title">{template.title} wedding plaque</title><desc id="preview-description">A 120 by 70 millimetre plaque showing {names} and {date}.</desc><defs><filter id="raised" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0.45" dy="0.75" stdDeviation="0.45" floodColor="#000" floodOpacity="0.7"/><feDropShadow dx="-0.2" dy="-0.25" stdDeviation="0.18" floodColor="#fff" floodOpacity="0.28"/></filter></defs><rect width="120" height="70" rx="4" fill={colours[design.baseColour].value}/><g fill={detail} stroke={detail} filter="url(#raised)">{renderBorder(design.border)}{template.layout==='monogram'&&<text x="60" y="27" textAnchor="middle" fontFamily={fontFamily} fontWeight={fontWeight} fontSize="17" stroke="none">{deriveMonogram(names)}</text>}<text x={template.fields.names.x} y={template.fields.names.baselineY} textAnchor="middle" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={size(names,'names')} stroke="none">{names}</text><text x={template.fields.date.x} y={template.fields.date.baselineY} textAnchor="middle" fontFamily={fontFamily} fontWeight={fontWeight} fontSize={size(date,'date')} stroke="none">{date}</text>{renderOrnament(design.ornament,template.layout)}</g><rect x="8" y="8" width="104" height="54" rx="1.5" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="0.25" strokeDasharray="1.2 1.2" className="safe-area"/></svg></div><figcaption><span>{template.title}</span><span>{template.widthMm} × {template.heightMm} × {template.baseThicknessMm+template.detailHeightMm} mm</span></figcaption></figure>;
}

function renderBorder(border:PlaqueDesign['border']):ReactNode{if(border==='none')return null;return <g fill="none" strokeWidth=".7"><rect x="6" y="6" width="108" height="58" rx="3"/>{border==='double'&&<rect x="8.5" y="8.5" width="103" height="53" rx="2" strokeWidth=".4"/>}</g>;}

function renderOrnament(ornament:OrnamentId,layout:string):ReactNode{
  const dividers=layout==='classic'?<><line x1="24" y1="39" x2="51" y2="39" strokeWidth=".8"/><line x1="69" y1="39" x2="96" y2="39" strokeWidth=".8"/></>:null;
  if(ornament==='none')return dividers;
  if(ornament==='botanical')return <><g>{leafPlacements.map((leaf,index)=><ellipse key={index} cx={leaf.x} cy={leaf.y} rx="4.2" ry="1.6" transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`} stroke="none"/>)}<path d="M14 20 Q22 31 34 47 M106 20 Q98 31 86 47" fill="none" strokeWidth=".8"/></g>{dividers}</>;
  const y=layout==='modern'?54:layout==='botanical'?57:39;
  if(ornament==='heart')return <>{dividers}<polygon points={heartSvgPoints} transform={`translate(0 ${y-39})`} stroke="none"/></>;
  if(ornament==='rings')return <>{dividers}<g fill="none" strokeWidth="1.2"><circle cx="57.5" cy={y} r="4"/><circle cx="62.5" cy={y} r="4"/></g></>;
  return <>{dividers}<g>{[54,60,66].map((x,index)=><polygon key={x} points={pointsAttribute(starPoints(x,y,index===1?2.7:1.8,index===1?1.1:.75))} stroke="none"/>)}</g></>;
}

import { useEffect, useState, type ReactNode } from 'react';
import type { Font } from 'opentype.js';
import { decorationForLayout, heartPoints, pointsAttribute } from './decorations';
import { loadProductionFont } from './fontMetrics';
import { fitText, fitTextWithMetrics, normalizedText } from './layout';
import { colours, getTemplate } from './template';
import { fontCatalog } from './fonts';
import type { PlaqueDesign, PlaqueTemplate } from './types';

export function PlaquePreview({design}:{design:PlaqueDesign}){
  const[font,setFont]=useState<Font|null>(null);
  const template=getTemplate(design.templateId);
  useEffect(()=>{let active=true;setFont(null);loadProductionFont(design.font).then((loaded)=>{if(active)setFont(loaded);}).catch(()=>setFont(null));return()=>{active=false;};},[design.font]);
  const names=normalizedText(design.names)||'Names',date=normalizedText(design.date)||'Event date';
  const size=(text:string,field:'names'|'date')=>font?fitTextWithMetrics(text,field,design.font,(value,fontSize)=>font.getAdvanceWidth(value,fontSize,{kerning:true}),design.templateId):fitText(text,field,design.font,design.templateId);
  const face=fontCatalog[design.font],detail=colours[design.detailColour].value;
  return <figure className="preview-frame" aria-label="Live plaque preview"><div className="preview-stage"><svg className="plaque" viewBox="0 0 120 70" role="img" aria-labelledby="preview-title preview-description">
    <title id="preview-title">{template.title} wedding plaque</title><desc id="preview-description">A 120 by 70 millimetre plaque showing {names} and {date}.</desc>
    <defs><filter id="raised" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx=".45" dy=".75" stdDeviation=".45" floodColor="#000" floodOpacity=".7"/><feDropShadow dx="-.2" dy="-.25" stdDeviation=".18" floodColor="#fff" floodOpacity=".28"/></filter></defs>
    <rect width="120" height="70" rx="4" fill={colours[design.baseColour].value}/><g fill={detail} stroke={detail} filter="url(#raised)">
      {renderBorder(design.border)}{renderIntegrated(template)}
      <text x={template.fields.names.x} y={template.fields.names.baselineY} textAnchor={template.fields.names.align==='left'?'start':'middle'} fontFamily={face.family} fontWeight={face.weight} fontSize={size(names,'names')} stroke="none">{names}</text>
      <text x={template.fields.date.x} y={template.fields.date.baselineY} textAnchor={template.fields.date.align==='left'?'start':'middle'} fontFamily={face.family} fontWeight={face.weight} fontSize={size(date,'date')} stroke="none">{date}</text>
      {design.ornament==='heart'&&<polygon points={pointsAttribute(heartPoints)} transform={`translate(${template.heart.x-60} ${template.heart.y-39})`} stroke="none"/>}
    </g><rect x="8" y="8" width="104" height="54" rx="1.5" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth=".25" strokeDasharray="1.2 1.2" className="safe-area"/>
  </svg></div><figcaption><span>{template.title}</span><span>{template.widthMm} × {template.heightMm} × {template.baseThicknessMm+template.detailHeightMm} mm</span></figcaption></figure>;
}

function renderBorder(border:PlaqueDesign['border']):ReactNode{if(border==='none')return null;return <g fill="none" strokeWidth=".7"><rect x="6" y="6" width="108" height="58" rx="3"/>{border==='double'&&<rect x="8.5" y="8.5" width="103" height="53" rx="2" strokeWidth=".4"/>}</g>;}
function renderIntegrated(template:PlaqueTemplate){const decoration=decorationForLayout(template.layout);return <g>{decoration.lines.map((item,index)=><line key={`l${index}`} x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} strokeWidth={item.width} strokeLinecap="round"/>)}{decoration.ellipses.map((item,index)=><ellipse key={`e${index}`} cx={item.cx} cy={item.cy} rx={item.rx} ry={item.ry} transform={`rotate(${item.angle} ${item.cx} ${item.cy})`} stroke="none"/>)}{decoration.circles.map((item,index)=><circle key={`c${index}`} cx={item.cx} cy={item.cy} r={item.r} stroke="none"/>)}{decoration.polygons.map((item,index)=><polygon key={`p${index}`} points={pointsAttribute(item.points)} stroke="none"/>)}</g>;}

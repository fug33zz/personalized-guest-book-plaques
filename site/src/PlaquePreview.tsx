import { useEffect, useState, type ReactNode } from 'react';
import type { Font } from 'opentype.js';
import { heartSvgPoints, leafPlacements, pointsAttribute, starPoints } from './decorations';
import { loadProductionFont } from './fontMetrics';
import { deriveMonogram, fitText, fitTextWithMetrics, normalizedText } from './layout';
import { colours, getTemplate } from './template';
import { fontCatalog } from './fonts';
import type { OrnamentId, PlaqueDesign } from './types';

export function PlaquePreview({ design }: { design: PlaqueDesign }) {
  const [font, setFont] = useState<Font | null>(null);
  const template = getTemplate(design.templateId);
  useEffect(() => {
    let active = true;
    setFont(null);
    loadProductionFont(design.font).then((loaded) => { if (active) setFont(loaded); }).catch(() => setFont(null));
    return () => { active = false; };
  }, [design.font]);
  const names = normalizedText(design.names) || 'Names';
  const date = normalizedText(design.date) || 'Event date';
  const size = (text: string, field: 'names' | 'date') => font
    ? fitTextWithMetrics(text, field, design.font, (value, fontSize) => font.getAdvanceWidth(value, fontSize, { kerning: true }), design.templateId)
    : fitText(text, field, design.font, design.templateId);
  const detail = colours[design.detailColour].value;
  const fontFamily = fontCatalog[design.font].family;
  const fontWeight = fontCatalog[design.font].weight;
  const anchor = (field: 'names' | 'date') => template.fields[field].align === 'left' ? 'start' : 'middle';

  return <figure className="preview-frame" aria-label="Live plaque preview">
    <div className="preview-stage"><svg className="plaque" viewBox="0 0 120 70" role="img" aria-labelledby="preview-title preview-description">
      <title id="preview-title">{template.title} wedding plaque</title><desc id="preview-description">A 120 by 70 millimetre plaque showing {names} and {date}.</desc>
      <defs><filter id="raised" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0.45" dy="0.75" stdDeviation="0.45" floodColor="#000" floodOpacity="0.7"/><feDropShadow dx="-0.2" dy="-0.25" stdDeviation="0.18" floodColor="#fff" floodOpacity="0.28"/></filter></defs>
      <rect width="120" height="70" rx="4" fill={colours[design.baseColour].value}/>
      <g fill={detail} stroke={detail} filter="url(#raised)">
        {renderBorder(design.border)}
        {template.layout === 'monogram' && <text x="29" y="41" textAnchor="middle" fontFamily={fontFamily} fontWeight={fontWeight} fontSize="24" stroke="none">{deriveMonogram(names)}</text>}
        <text x={template.fields.names.x} y={template.fields.names.baselineY} textAnchor={anchor('names')} fontFamily={fontFamily} fontWeight={fontWeight} fontSize={size(names, 'names')} stroke="none">{names}</text>
        <text x={template.fields.date.x} y={template.fields.date.baselineY} textAnchor={anchor('date')} fontFamily={fontFamily} fontWeight={fontWeight} fontSize={size(date, 'date')} stroke="none">{date}</text>
        {renderOrnament(design.ornament, template.layout)}
      </g>
      <rect x="8" y="8" width="104" height="54" rx="1.5" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="0.25" strokeDasharray="1.2 1.2" className="safe-area"/>
    </svg></div>
    <figcaption><span>{template.title}</span><span>{template.widthMm} × {template.heightMm} × {template.baseThicknessMm + template.detailHeightMm} mm</span></figcaption>
  </figure>;
}

function renderBorder(border: PlaqueDesign['border']): ReactNode {
  if (border === 'none') return null;
  return <g fill="none" strokeWidth=".7"><rect x="6" y="6" width="108" height="58" rx="3"/>{border === 'double' && <rect x="8.5" y="8.5" width="103" height="53" rx="2" strokeWidth=".4"/>}</g>;
}

function renderOrnament(ornament: OrnamentId, layout: string): ReactNode {
  const dividers = layout === 'classic'
    ? <><line x1="25" y1="39" x2="51" y2="39" strokeWidth=".65"/><line x1="69" y1="39" x2="95" y2="39" strokeWidth=".65"/></>
    : layout === 'monogram'
      ? <><line x1="52" y1="54" x2="70" y2="54" strokeWidth=".55"/><line x1="90" y1="54" x2="108" y2="54" strokeWidth=".55"/></>
      : null;
  if (ornament === 'none') return dividers;
  if (ornament === 'botanical') return <g>
    {leafPlacements.map((leaf, index) => <ellipse key={index} cx={leaf.x} cy={leaf.y} rx="3.7" ry="1.35" transform={`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`} stroke="none"/>)}
    <path d="M10 12 Q17 18 25 29 M110 58 Q103 52 95 41" fill="none" strokeWidth=".65"/>
  </g>;
  const position = layout === 'modern' ? { x: 97, y: 36 } : layout === 'monogram' ? { x: 80, y: 54 } : layout === 'botanical' ? { x: 60, y: 56 } : { x: 60, y: 39 };
  if (ornament === 'heart') return <>{dividers}<polygon points={heartSvgPoints} transform={`translate(${position.x - 60} ${position.y - 39})`} stroke="none"/></>;
  if (ornament === 'rings') return <>{dividers}<g fill="none" strokeWidth="1.1"><circle cx={position.x - 2.5} cy={position.y} r="3.7"/><circle cx={position.x + 2.5} cy={position.y} r="3.7"/></g></>;
  return <>{dividers}<g>{[-6, 0, 6].map((offset, index) => <polygon key={offset} points={pointsAttribute(starPoints(position.x + offset, position.y, index === 1 ? 2.5 : 1.6, index === 1 ? 1 : .7))} stroke="none"/>)}</g></>;
}

import type { Font, PathCommand } from 'opentype.js';
import { fitTextWithMetrics, normalizedText } from '../site/src/layout';
import { getTemplate } from '../site/src/template';
import type { FontId, PlaqueDesign } from '../site/src/types';
import { decorationForLayout, heartPoints } from '../site/src/decorations';
import { MeshBuilder, roundedRectangle, type Point } from './mesh';

function curveSteps(points: Point[], tolerance = 0.45) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) length += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  return Math.max(4, Math.min(20, Math.ceil(length / tolerance)));
}

export function commandsToContours(commands: PathCommand[], flipY = true, height = 70): Point[][] {
  const contours: Point[][] = [];
  let contour: Point[] = [];
  let current: Point = [0, 0];
  const map = (x: number, y: number): Point => [x, flipY ? height - y : y];
  const finish = () => { if (contour.length >= 3) contours.push(contour); contour = []; };

  for (const command of commands) {
    if (command.type === 'M') { finish(); current = map(command.x, command.y); contour.push(current); }
    else if (command.type === 'L') { current = map(command.x, command.y); contour.push(current); }
    else if (command.type === 'Q') {
      const start = current;
      const control = map(command.x1, command.y1);
      const end = map(command.x, command.y);
      const steps = curveSteps([start, control, end]);
      for (let step = 1; step <= steps; step += 1) { const t = step / steps; const inverse = 1 - t; contour.push([inverse * inverse * start[0] + 2 * inverse * t * control[0] + t * t * end[0], inverse * inverse * start[1] + 2 * inverse * t * control[1] + t * t * end[1]]); }
      current = end;
    } else if (command.type === 'C') {
      const start = current;
      const control1 = map(command.x1, command.y1);
      const control2 = map(command.x2, command.y2);
      const end = map(command.x, command.y);
      const steps = curveSteps([start, control1, control2, end]);
      for (let step = 1; step <= steps; step += 1) { const t = step / steps; const inverse = 1 - t; contour.push([inverse ** 3 * start[0] + 3 * inverse ** 2 * t * control1[0] + 3 * inverse * t ** 2 * control2[0] + t ** 3 * end[0], inverse ** 3 * start[1] + 3 * inverse ** 2 * t * control1[1] + 3 * inverse * t ** 2 * control2[1] + t ** 3 * end[1]]); }
      current = end;
    } else if (command.type === 'Z') finish();
  }
  finish();
  return contours;
}

function fittedSize(font: Font, text: string, field: 'names' | 'date', design: PlaqueDesign) {
  return fitTextWithMetrics(text, field, design.font, (value, size) => font.getAdvanceWidth(value, size, { kerning: true }), design.templateId);
}

function addText(mesh: MeshBuilder, font: Font, text: string, baselineY: number, x: number, size: number, align: 'center'|'left' = 'center') {
  const width = font.getAdvanceWidth(text, size, { kerning: true });
  const path = font.getPath(text, align === 'center' ? x - width / 2 : x, baselineY, size, { kerning: true });
  mesh.addPrism(commandsToContours(path.commands), 2, 1, true);
}

export function buildWeddingMesh(design: PlaqueDesign, fonts: Partial<Record<FontId, Font>>) {
  const template=getTemplate(design.templateId);
  const mesh = new MeshBuilder();
  mesh.addPrism([roundedRectangle(120, 70, 4)], 0, template.baseThicknessMm, false);
  const font = fonts[design.font];
  if(!font)throw new Error(`Production font ${design.font} is not loaded.`);
  const names=normalizedText(design.names);
  const date=normalizedText(design.date);
  addText(mesh,font,names,template.fields.names.baselineY,template.fields.names.x,fittedSize(font,names,'names',design),template.fields.names.align);
  addText(mesh,font,date,template.fields.date.baselineY,template.fields.date.x,fittedSize(font,date,'date',design),template.fields.date.align);
  addBorder(mesh,design.border);
  addDecoration(mesh,design);
  return mesh;
}

function addBorder(mesh:MeshBuilder,border:PlaqueDesign['border']){if(border==='none')return;for(const inset of border==='double'?[6,8.5]:[6]){const thickness=inset===6?.7:.4;mesh.addRectangle(inset,inset,120-2*inset,thickness,2,1,true);mesh.addRectangle(inset,70-inset-thickness,120-2*inset,thickness,2,1,true);mesh.addRectangle(inset,inset,thickness,70-2*inset,2,1,true);mesh.addRectangle(120-inset-thickness,inset,thickness,70-2*inset,2,1,true);}}
function ellipse(cx:number,cy:number,rx:number,ry:number,angle=0,segments=24):Point[]{const rotation=angle*Math.PI/180;return Array.from({length:segments},(_,index)=>{const theta=2*Math.PI*index/segments;const x=rx*Math.cos(theta),y=ry*Math.sin(theta);return[cx+x*Math.cos(rotation)-y*Math.sin(rotation),70-(cy+x*Math.sin(rotation)+y*Math.cos(rotation))] as Point;});}
function rectangle(cx:number,cy:number,width:number,height:number,angle=0):Point[]{const rotation=angle*Math.PI/180;return[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]].map(([x,y])=>[cx+x*Math.cos(rotation)-y*Math.sin(rotation),70-(cy+x*Math.sin(rotation)+y*Math.cos(rotation))] as Point);}
function addDecoration(mesh:MeshBuilder,design:PlaqueDesign){
  const template=getTemplate(design.templateId),decoration=decorationForLayout(template.layout);
  for(const item of decoration.lines){const length=Math.hypot(item.x2-item.x1,item.y2-item.y1),angle=Math.atan2(item.y2-item.y1,item.x2-item.x1)*180/Math.PI;mesh.addPrism([rectangle((item.x1+item.x2)/2,(item.y1+item.y2)/2,length,item.width,angle)],2,1,true);}
  for(const item of decoration.ellipses)mesh.addPrism([ellipse(item.cx,item.cy,item.rx,item.ry,item.angle)],2,1,true);
  for(const item of decoration.circles)mesh.addPrism([ellipse(item.cx,item.cy,item.r,item.r)],2,1,true);
  for(const item of decoration.polygons)mesh.addPrism([item.points.map(([x,y]):Point=>[x,70-y])],2,1,true);
  if(design.ornament==='heart')mesh.addPrism([heartPoints.map(([x,y]):Point=>[x+template.heart.x-60,70-(y+template.heart.y-39)])],2,1,true);
}

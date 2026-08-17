import type { Font, PathCommand } from 'opentype.js';
import { deriveMonogram, fitTextWithMetrics, normalizedText } from '../site/src/layout';
import { getTemplate } from '../site/src/template';
import type { PlaqueDesign } from '../site/src/types';
import { heartPoints, leafPlacements, starPoints } from '../site/src/decorations';
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

export function buildWeddingMesh(design: PlaqueDesign, fonts: Record<PlaqueDesign['font'], Font>) {
  const template=getTemplate(design.templateId);
  const mesh = new MeshBuilder();
  mesh.addPrism([roundedRectangle(120, 70, 4)], 0, template.baseThicknessMm, false);
  const font = fonts[design.font];
  const names=normalizedText(design.names);
  const date=normalizedText(design.date);
  if(template.layout==='monogram')addText(mesh,font,deriveMonogram(names),41,29,24);
  addText(mesh,font,names,template.fields.names.baselineY,template.fields.names.x,fittedSize(font,names,'names',design),template.fields.names.align);
  addText(mesh,font,date,template.fields.date.baselineY,template.fields.date.x,fittedSize(font,date,'date',design),template.fields.date.align);
  addBorder(mesh,design.border);
  addOrnament(mesh,design,template.layout);
  return mesh;
}

function addBorder(mesh:MeshBuilder,border:PlaqueDesign['border']){if(border==='none')return;for(const inset of border==='double'?[6,8.5]:[6]){const thickness=inset===6?.7:.4;mesh.addRectangle(inset,inset,120-2*inset,thickness,2,1,true);mesh.addRectangle(inset,70-inset-thickness,120-2*inset,thickness,2,1,true);mesh.addRectangle(inset,inset,thickness,70-2*inset,2,1,true);mesh.addRectangle(120-inset-thickness,inset,thickness,70-2*inset,2,1,true);}}
function ellipse(cx:number,cy:number,rx:number,ry:number,angle=0,segments=24):Point[]{const rotation=angle*Math.PI/180;return Array.from({length:segments},(_,index)=>{const theta=2*Math.PI*index/segments;const x=rx*Math.cos(theta),y=ry*Math.sin(theta);return[cx+x*Math.cos(rotation)-y*Math.sin(rotation),70-(cy+x*Math.sin(rotation)+y*Math.cos(rotation))] as Point;});}
function rectangle(cx:number,cy:number,width:number,height:number,angle=0):Point[]{const rotation=angle*Math.PI/180;return[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]].map(([x,y])=>[cx+x*Math.cos(rotation)-y*Math.sin(rotation),70-(cy+x*Math.sin(rotation)+y*Math.cos(rotation))] as Point);}
function addOrnament(mesh:MeshBuilder,design:PlaqueDesign,layout:string){
  if(layout==='classic'){mesh.addRectangle(25,70-39.325,26,.65,2,1,true);mesh.addRectangle(69,70-39.325,26,.65,2,1,true);}
  if(layout==='monogram'){mesh.addRectangle(52,70-54.275,18,.55,2,1,true);mesh.addRectangle(90,70-54.275,18,.55,2,1,true);}
  if(design.ornament==='none')return;
  if(design.ornament==='botanical'){
    for(const leaf of leafPlacements)mesh.addPrism([ellipse(leaf.x,leaf.y,3.7,1.35,leaf.angle)],2,1,true);
    mesh.addPrism([rectangle(17.5,20.5,22,.65,48)],2,1,true);mesh.addPrism([rectangle(102.5,49.5,22,.65,48)],2,1,true);return;
  }
  const position=layout==='modern'?{x:97,y:36}:layout==='monogram'?{x:80,y:54}:layout==='botanical'?{x:60,y:56}:{x:60,y:39};
  if(design.ornament==='heart'){mesh.addPrism([heartPoints.map(([x,y]):Point=>[x+position.x-60,70-(y+position.y-39)])],2,1,true);return;}
  if(design.ornament==='rings'){mesh.addPrism([ellipse(position.x-2.5,position.y,3.7,3.7),ellipse(position.x-2.5,position.y,2.6,2.6).reverse()],2,1,true);mesh.addPrism([ellipse(position.x+2.5,position.y,3.7,3.7),ellipse(position.x+2.5,position.y,2.6,2.6).reverse()],2,1,true);return;}
  for(const[offset,outer,inner]of[[-6,1.6,.7],[0,2.5,1],[6,1.6,.7]])mesh.addPrism([starPoints(position.x+offset,position.y,outer,inner).map(([x,y]):Point=>[x,70-y])],2,1,true);
}

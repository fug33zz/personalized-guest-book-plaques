import type { LayoutId } from './types';

export type LinePrimitive={x1:number;y1:number;x2:number;y2:number;width:number};
export type EllipsePrimitive={cx:number;cy:number;rx:number;ry:number;angle:number};
export type CirclePrimitive={cx:number;cy:number;r:number};
export type PolygonPrimitive={points:[number,number][]};
export interface DecorationPrimitives{lines:LinePrimitive[];ellipses:EllipsePrimitive[];circles:CirclePrimitive[];polygons:PolygonPrimitive[]}

export const heartPoints=Array.from({length:81},(_,step):[number,number]=>{const t=2*Math.PI*step/80;const x=16*Math.sin(t)**3;const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);return[60+x*.17,34.7+(17-y)*.18];});
export const pointsAttribute=(points:[number,number][])=>points.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

const line=(x1:number,y1:number,x2:number,y2:number,width=.65):LinePrimitive=>({x1,y1,x2,y2,width});
const ellipse=(cx:number,cy:number,rx:number,ry:number,angle=0):EllipsePrimitive=>({cx,cy,rx,ry,angle});
function arc(cx:number,cy:number,rx:number,ry:number,start:number,end:number,steps=18,width=.65){const points=Array.from({length:steps+1},(_,index)=>{const angle=start+(end-start)*index/steps;return[cx+rx*Math.cos(angle),cy+ry*Math.sin(angle)] as [number,number];});return points.slice(1).map((point,index)=>line(points[index][0],points[index][1],point[0],point[1],width));}
function diamond(cx:number,cy:number,size=2.2):PolygonPrimitive{return{points:[[cx,cy-size],[cx+size,cy],[cx,cy+size],[cx-size,cy]]};}
function empty():DecorationPrimitives{return{lines:[],ellipses:[],circles:[],polygons:[]};}

export function decorationForLayout(layout:LayoutId):DecorationPrimitives{
  const result=empty();
  if(layout==='heritage')result.lines.push(line(25,39,51,39),line(69,39,95,39));
  if(layout==='botanical'){
    result.lines.push(...arc(8,8,25,25,0,.95,12),...arc(112,62,25,25,Math.PI,Math.PI+.95,12));
    for(const item of [{x:14,y:15,a:-45},{x:19,y:18,a:-24},{x:24,y:23,a:8},{x:106,y:55,a:135},{x:101,y:52,a:156},{x:96,y:47,a:188}])result.ellipses.push(ellipse(item.x,item.y,3.8,1.35,item.a));
  }
  if(layout==='arch'){
    result.lines.push(line(25,58,25,33),...arc(60,33,35,22,Math.PI,2*Math.PI,28),line(95,33,95,58));
    result.circles.push({cx:25,cy:59,r:1},{cx:95,cy:59,r:1});
  }
  if(layout==='formal')result.polygons.push(diamond(11,11),diamond(109,11),diamond(11,59),diamond(109,59));
  if(layout==='minimal')result.lines.push(line(48,48,72,48,.45));
  if(layout==='vintage'){
    result.lines.push(...arc(13,13,15,11,0,Math.PI/2,10),...arc(107,13,15,11,Math.PI/2,Math.PI,10),...arc(13,57,15,11,-Math.PI/2,0,10),...arc(107,57,15,11,Math.PI,3*Math.PI/2,10));
    result.circles.push({cx:13,cy:13,r:1.2},{cx:107,cy:13,r:1.2},{cx:13,cy:57,r:1.2},{cx:107,cy:57,r:1.2});
  }
  if(layout==='wreath'){
    result.lines.push(...arc(60,35,38,25,-2.35,2.35,34,.5));
    for(let index=0;index<16;index++){const angle=-2.25+4.5*index/15;const cx=60+38*Math.cos(angle),cy=35+25*Math.sin(angle);result.ellipses.push(ellipse(cx,cy,3.2,1.15,angle*180/Math.PI+90));}
  }
  if(layout==='deco'){
    for(const corner of[{x:10,y:10,dx:1,dy:1},{x:110,y:10,dx:-1,dy:1},{x:10,y:60,dx:1,dy:-1},{x:110,y:60,dx:-1,dy:-1}]){const{x,y,dx,dy}=corner;result.lines.push(line(x,y,x+dx*13,y,.65),line(x,y,x,y+dy*9,.65),line(x+dx*4,y+dy*4,x+dx*13,y+dy*4,.45),line(x+dx*4,y+dy*4,x+dx*4,y+dy*9,.45));}
    result.polygons.push(diamond(60,12,1.6),diamond(60,58,1.6));
  }
  if(layout==='scalloped'){
    for(const y of[10,60])for(let x=18;x<=102;x+=12)result.lines.push(...arc(x,y,6,3,y===10?Math.PI:0,y===10?2*Math.PI:Math.PI,8,.55));
    result.lines.push(line(12,16,12,54,.55),line(108,16,108,54,.55));
  }
  if(layout==='cameo'){
    result.lines.push(...arc(60,35,40,27,0,2*Math.PI,48,.6),...arc(60,35,37,24,0,2*Math.PI,48,.35));
    result.polygons.push(diamond(60,8,1.7),diamond(60,62,1.7));
  }
  return result;
}

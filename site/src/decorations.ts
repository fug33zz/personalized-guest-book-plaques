export const heartPoints = Array.from({length:81},(_,step):[number,number]=>{const t=2*Math.PI*step/80;const x=16*Math.sin(t)**3;const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);return[60+x*.17,34.7+(17-y)*.18];});
export const heartSvgPoints=heartPoints.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');
export function starPoints(cx:number,cy:number,outer=2.4,inner=1){const points:[number,number][]=[];for(let index=0;index<10;index+=1){const radius=index%2===0?outer:inner;const angle=-Math.PI/2+index*Math.PI/5;points.push([cx+radius*Math.cos(angle),cy+radius*Math.sin(angle)]);}return points;}
export const leafPlacements=[
  {x:15,y:18,angle:-42},{x:20,y:21,angle:-20},{x:24,y:26,angle:16},
  {x:105,y:52,angle:138},{x:100,y:49,angle:160},{x:96,y:44,angle:196},
];
export const pointsAttribute=(points:[number,number][])=>points.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

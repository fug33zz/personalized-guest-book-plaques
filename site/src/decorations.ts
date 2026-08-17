export const heartPoints = Array.from({length:81},(_,step):[number,number]=>{const t=2*Math.PI*step/80;const x=16*Math.sin(t)**3;const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);return[60+x*.17,34.7+(17-y)*.18];});
export const heartSvgPoints=heartPoints.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');
export function starPoints(cx:number,cy:number,outer=2.4,inner=1){const points:[number,number][]=[];for(let index=0;index<10;index+=1){const radius=index%2===0?outer:inner;const angle=-Math.PI/2+index*Math.PI/5;points.push([cx+radius*Math.cos(angle),cy+radius*Math.sin(angle)]);}return points;}
export const leafPlacements=[
  {x:18,y:25,angle:-35},{x:23,y:30,angle:-15},{x:27,y:36,angle:18},{x:31,y:42,angle:38},
  {x:102,y:25,angle:215},{x:97,y:30,angle:195},{x:93,y:36,angle:162},{x:89,y:42,angle:142},
];
export const pointsAttribute=(points:[number,number][])=>points.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

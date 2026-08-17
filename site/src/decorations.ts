export const heartPoints = Array.from({length:81},(_,step):[number,number]=>{const t=2*Math.PI*step/80;const x=16*Math.sin(t)**3;const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);return[60+x*.17,34.7+(17-y)*.18];});
export const heartSvgPoints=heartPoints.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

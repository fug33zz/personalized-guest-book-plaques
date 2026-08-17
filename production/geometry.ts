import type { Font, PathCommand } from 'opentype.js';
import { fitTextWithMetrics, normalizedText } from '../site/src/layout';
import { weddingTemplate } from '../site/src/template';
import type { PlaqueDesign } from '../site/src/types';
import { heartPoints } from '../site/src/decorations';
import { MeshBuilder, roundedRectangle, type Point } from './mesh';

function curveSteps(points: Point[], tolerance = 0.45) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) length += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  return Math.max(4, Math.min(20, Math.ceil(length / tolerance)));
}

export function commandsToContours(commands: PathCommand[], flipY = true): Point[][] {
  const contours: Point[][] = [];
  let contour: Point[] = [];
  let current: Point = [0, 0];
  const map = (x: number, y: number): Point => [x, flipY ? weddingTemplate.heightMm - y : y];
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
  return fitTextWithMetrics(text, field, design.font, (value, size) => font.getAdvanceWidth(value, size, { kerning: true }));
}

function addText(mesh: MeshBuilder, font: Font, text: string, baselineY: number, field: 'names' | 'date', design: PlaqueDesign) {
  const size = fittedSize(font, text, field, design);
  const width = font.getAdvanceWidth(text, size, { kerning: true });
  const path = font.getPath(text, weddingTemplate.widthMm / 2 - width / 2, baselineY, size, { kerning: true });
  mesh.addPrism(commandsToContours(path.commands), weddingTemplate.baseThicknessMm, weddingTemplate.detailHeightMm, true);
}

export function buildWeddingMesh(design: PlaqueDesign, fonts: Record<PlaqueDesign['font'], Font>) {
  const mesh = new MeshBuilder();
  mesh.addPrism([roundedRectangle(120, 70, 4)], 0, weddingTemplate.baseThicknessMm, false);
  const font = fonts[design.font];
  addText(mesh, font, normalizedText(design.names), 27, 'names', design);
  addText(mesh, font, normalizedText(design.date), 55, 'date', design);
  mesh.addRectangle(24, 70 - 39.4, 27, 0.8, 2, 1, true);
  mesh.addRectangle(69, 70 - 39.4, 27, 0.8, 2, 1, true);
  mesh.addPrism([heartPoints.map(([x,y]):Point=>[x,70-y])], 2, 1, true);
  return mesh;
}

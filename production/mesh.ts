import earcut from 'earcut';

export type Point = [number, number];
export type Vertex = [number, number, number];
export interface Triangle { a: number; b: number; c: number; painted: boolean; }

function signedArea(points: Point[]) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current[0] * next[1] - next[0] * current[1];
  }
  return area / 2;
}
function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [x, y] = polygon[index];
    const [px, py] = polygon[previous];
    if ((y > point[1]) !== (py > point[1]) && point[0] < (px - x) * (point[1] - y) / (py - y) + x) inside = !inside;
  }
  return inside;
}

function cleanContour(points: Point[]) {
  const clean: Point[] = [];
  for (const point of points) {
    const previous = clean.at(-1);
    if (!previous || Math.hypot(point[0] - previous[0], point[1] - previous[1]) > 0.001) clean.push(point);
  }
  if (clean.length > 2 && Math.hypot(clean[0][0] - clean.at(-1)![0], clean[0][1] - clean.at(-1)![1]) < 0.001) clean.pop();
  return clean;
}

export class MeshBuilder {
  readonly vertices: Vertex[] = [];
  readonly triangles: Triangle[] = [];

  private vertex([x, y]: Point, z: number) {
    this.vertices.push([x, y, z]);
    return this.vertices.length - 1;
  }

  private face(a: number, b: number, c: number, painted = false) {
    this.triangles.push({ a, b, c, painted });
  }

  addPrism(inputContours: Point[][], z: number, height: number, paintTop: boolean) {
    const contours = inputContours.map(cleanContour).filter((contour) => contour.length >= 3 && Math.abs(signedArea(contour)) > 0.001);
    if (!contours.length) return;
    const largest = contours.reduce((best, contour) => Math.abs(signedArea(contour)) > Math.abs(signedArea(best)) ? contour : best);
    const outerSign = Math.sign(signedArea(largest));
    const outers = contours.filter((contour) => Math.sign(signedArea(contour)) === outerSign);
    const holes = contours.filter((contour) => Math.sign(signedArea(contour)) !== outerSign);
    const groups = outers.map((outer) => ({ outer, holes: [] as Point[][] }));

    for (const hole of holes) {
      const candidates = groups.filter((group) => pointInPolygon(hole[0], group.outer));
      const owner = candidates.sort((a, b) => Math.abs(signedArea(a.outer)) - Math.abs(signedArea(b.outer)))[0];
      if (owner) owner.holes.push(hole);
      else groups.push({ outer: [...hole].reverse(), holes: [] });
    }

    for (const group of groups) {
      const allContours = [group.outer, ...group.holes];
      const flat: number[] = [];
      const holeIndices: number[] = [];
      let pointCount = 0;
      allContours.forEach((contour, index) => {
        if (index > 0) holeIndices.push(pointCount);
        for (const point of contour) flat.push(point[0], point[1]);
        pointCount += contour.length;
      });
      const indices = earcut(flat, holeIndices, 2);
      const bottom = allContours.flatMap((contour) => contour.map((point) => this.vertex(point, z)));
      const top = allContours.flatMap((contour) => contour.map((point) => this.vertex(point, z + height)));
      for (let index = 0; index < indices.length; index += 3) {
        this.face(bottom[indices[index]], bottom[indices[index + 2]], bottom[indices[index + 1]]);
        this.face(top[indices[index]], top[indices[index + 1]], top[indices[index + 2]], paintTop);
      }
      let offset = 0;
      for (const contour of allContours) {
        for (let index = 0; index < contour.length; index += 1) {
          const next = (index + 1) % contour.length;
          this.face(bottom[offset + index], bottom[offset + next], top[offset + next]);
          this.face(bottom[offset + index], top[offset + next], top[offset + index]);
        }
        offset += contour.length;
      }
    }
  }

  addRectangle(x: number, y: number, width: number, depth: number, z: number, height: number, paintTop: boolean) {
    this.addPrism([[[x, y], [x + width, y], [x + width, y + depth], [x, y + depth]]], z, height, paintTop);
  }

  bounds() {
    const axes = [0, 1, 2] as const;
    const minimum = axes.map((axis) => Math.min(...this.vertices.map((vertex) => vertex[axis]))) as Vertex;
    const maximum = axes.map((axis) => Math.max(...this.vertices.map((vertex) => vertex[axis]))) as Vertex;
    return { minimum, maximum };
  }
}

export function roundedRectangle(width: number, height: number, radius: number, segmentsPerCorner = 10): Point[] {
  const points: Point[] = [];
  for (const [cx, cy, start] of [[width - radius, radius, -90], [width - radius, height - radius, 0], [radius, height - radius, 90], [radius, radius, 180]] as [number, number, number][]) {
    for (let step = 0; step <= segmentsPerCorner; step += 1) {
      const angle = (start + 90 * step / segmentsPerCorner) * Math.PI / 180;
      points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }
  }
  return points;
}

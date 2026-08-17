import { unzipSync, zipSync } from 'fflate';
import type { PlaqueDesign } from '../site/src/types';
import { colours } from '../site/src/template';
import type { MeshBuilder } from './mesh';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const text = (value: string) => encoder.encode(value);
const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function objectXml(mesh: MeshBuilder) {
  const vertices = mesh.vertices.map(([x, y, z]) => `<vertex x="${x}" y="${y}" z="${z}"/>`).join('');
  const triangles = mesh.triangles.map(({ a, b, c, painted }) => `<triangle v1="${a}" v2="${b}" v3="${c}"${painted ? ' paint_color="8"' : ''}/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p"><metadata name="BambuStudio:3mfVersion">1</metadata><resources><object id="1" p:UUID="00010000-81cb-4c03-9d28-80fed5dfa1dc" type="model"><mesh><vertices>${vertices}</vertices><triangles>${triangles}</triangles></mesh></object></resources></model>`;
}
function outerModelXml(height: number) {
  return `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" requiredextensions="p"><metadata name="Application">BambuStudio-02.07.01.62</metadata><metadata name="BambuStudio:3mfVersion">1</metadata><metadata name="Title">Generated wedding plaque</metadata><resources><object id="2" p:UUID="00000001-61cb-4c03-9d28-80fed5dfa1dc" type="model"><components><component p:path="/3D/Objects/object_1.model" objectid="1" p:UUID="00010000-b206-40ff-9872-83e8017abed1" transform="1 0 0 0 1 0 0 0 1 0 0 0"/></components></object></resources><build p:UUID="2c7c17d8-22b5-4d84-8835-1976022ea369"><item objectid="2" p:UUID="00000002-b1ec-4553-aec9-835e5b724bb4" transform="1 0 0 0 1 0 0 0 1 170 160 ${height / 2}" printable="1"/></build></model>`;
}

function modelSettings(name: string, mesh: MeshBuilder) {
  const { minimum, maximum } = mesh.bounds();
  const width = maximum[0] - minimum[0];
  const depth = maximum[1] - minimum[1];
  const height = maximum[2] - minimum[2];
  const safeName = escapeXml(name);
  return `<?xml version="1.0" encoding="UTF-8"?><config><object id="2"><metadata key="name" value="${safeName}"/><metadata key="extruder" value="1"/><metadata face_count="${mesh.triangles.length}"/><part id="1" subtype="normal_part"><metadata key="name" value="${safeName}"/><metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/><metadata key="source_file" value="${safeName}"/><metadata key="source_object_id" value="0"/><metadata key="source_volume_id" value="0"/><metadata key="source_offset_x" value="${width / 2}"/><metadata key="source_offset_y" value="${depth / 2}"/><metadata key="source_offset_z" value="${height / 2}"/><mesh_stat face_count="${mesh.triangles.length}" edges_fixed="0" degenerate_facets="0" facets_removed="0" facets_reversed="0" backwards_edges="0"/></part></object><plate><metadata key="plater_id" value="1"/><metadata key="plater_name" value="Generated wedding plaque"/><metadata key="locked" value="false"/><metadata key="filament_map_mode" value="Auto For Flush"/><metadata key="filament_maps" value="1 1"/><metadata key="filament_volume_maps" value="0 0 0 0 0 0 0"/><model_instance><metadata key="object_id" value="2"/><metadata key="instance_id" value="0"/><metadata key="identify_id" value="69"/></model_instance></plate><assemble><assemble_item object_id="2" instance_id="0" transform="1 0 0 0 1 0 0 0 1 0 0 ${height / 2}" offset="0 0 0" /></assemble></config>`;
}

function plateJson(name: string, mesh: MeshBuilder) {
  const { minimum, maximum } = mesh.bounds();
  const width = maximum[0] - minimum[0];
  const depth = maximum[1] - minimum[1];
  const minX = 170 - width / 2;
  const maxX = 170 + width / 2;
  const minY = 160 - depth / 2;
  const maxY = 160 + depth / 2;
  return JSON.stringify({ bbox_all:[minX,minY,maxX,maxY], bbox_objects:[{area:width*depth,bbox:[minX,minY,maxX,maxY],id:90,layer_height:.1,name}], bed_type:'textured_plate', filament_colors:[], filament_ids:[], first_extruder:0, is_seq_print:false, nozzle_diameter:.2, version:2 });
}

function projectSettings(source: Uint8Array, design: PlaqueDesign) {
  const settings = JSON.parse(decoder.decode(source));
  const selected = [colours[design.baseColour].value.toUpperCase(), colours[design.detailColour].value.toUpperCase()];
  settings.filament_colour = selected;
  settings.filament_multi_colour = selected;
  return JSON.stringify(settings);
}

export function buildBambuProject(referenceBytes: Uint8Array, design: PlaqueDesign, mesh: MeshBuilder) {
  const archive = unzipSync(referenceBytes);
  const name = 'personalized-wedding-plaque.3mf';
  for (const entry of Object.keys(archive)) if (/^Metadata\/.*\.png$/i.test(entry)) delete archive[entry];
  archive['3D/Objects/object_1.model'] = text(objectXml(mesh));
  archive['3D/3dmodel.model'] = text(outerModelXml(mesh.bounds().maximum[2]));
  archive['Metadata/model_settings.config'] = text(modelSettings(name, mesh));
  archive['Metadata/plate_1.json'] = text(plateJson(name, mesh));
  archive['Metadata/project_settings.config'] = text(projectSettings(archive['Metadata/project_settings.config'], design));
  return zipSync(archive, { level: 9 });
}

export function inspectBambuProject(referenceBytes: Uint8Array) {
  const archive = unzipSync(referenceBytes);
  const object = decoder.decode(archive['3D/Objects/object_1.model']);
  const settings = JSON.parse(decoder.decode(archive['Metadata/project_settings.config']));
  const vertices = [...object.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)];
  const triangles = [...object.matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"([^>]*)\/>/g)];
  const painted = triangles.filter((triangle) => triangle[4].includes('paint_color="8"'));
  const zValues = vertices.map((vertex) => Number(vertex[3]));
  const maximumZ = Math.max(...zValues);
  const paintOnlyAtTop = painted.every((triangle) => [1,2,3].every((group) => Math.abs(zValues[Number(triangle[group])] - maximumZ) < 0.000001));
  return { entries:Object.keys(archive).length, vertices:vertices.length, triangles:triangles.length, paintedTriangles:painted.length, paintOnlyAtTop, accountMetadataAbsent:!Object.values(archive).some((data) => decoder.decode(data).includes('DesignerUserId')), printer:settings.printer_model, nozzle:settings.nozzle_diameter, penetration:settings.top_color_penetration_layers, ironing:settings.ironing_type, filamentColours:settings.filament_colour };
}

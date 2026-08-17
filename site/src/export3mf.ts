import { buildBambuProject, inspectBambuProject } from '../../production/bambu-project';
import { buildWeddingMesh } from '../../production/geometry';
import { loadProductionFont } from './fontMetrics';
import type { PlaqueDesign } from './types';

export async function generateBambu3mf(design:PlaqueDesign){
  const[template,elegant,modern]=await Promise.all([
    fetch(`${import.meta.env.BASE_URL}templates/bambu-h2s-02mm-template.3mf`).then((response)=>{if(!response.ok)throw new Error('Could not load the Bambu project template.');return response.arrayBuffer();}),
    loadProductionFont('elegant'),
    loadProductionFont('modern'),
  ]);
  const mesh=buildWeddingMesh(design,{elegant,modern});
  const project=buildBambuProject(new Uint8Array(template),design,mesh);
  const report=inspectBambuProject(project);
  if(!report.paintOnlyAtTop||!report.accountMetadataAbsent||String(report.nozzle)!=='0.2'||String(report.penetration)!=='3')throw new Error('The generated project did not pass its safety checks.');
  return project;
}

export function download3mf(project:Uint8Array,names:string){
  const safeName=names.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'wedding';
  const bytes=project.buffer.slice(project.byteOffset,project.byteOffset+project.byteLength) as ArrayBuffer;
  const url=URL.createObjectURL(new Blob([bytes],{type:'model/3mf'}));
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=`${safeName}-guest-book-plaque.3mf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

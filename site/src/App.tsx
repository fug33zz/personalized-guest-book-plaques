import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { download3mf, generateBambu3mf } from './export3mf';
import { parseDesign, validateDesign } from './layout';
import { PlaquePreview } from './PlaquePreview';
import { baseColours, borders, colours, defaultDesign, designForTemplate, detailColours, getTemplate, ornaments, templateList } from './template';
import type { ColourId, PlaqueDesign, TemplateId } from './types';

const storageKey='guest-book-plaque-design-v1';
function loadStoredDesign():PlaqueDesign{try{const stored=localStorage.getItem(storageKey);return stored?parseDesign(JSON.parse(stored)):defaultDesign;}catch{return defaultDesign;}}

export default function App(){
  const[design,setDesign]=useState<PlaqueDesign>(loadStoredDesign);
  const[notice,setNotice]=useState('Changes save automatically on this device.');
  const[generating,setGenerating]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const template=getTemplate(design.templateId);
  const validation=useMemo(()=>validateDesign(design),[design]);
  useEffect(()=>{if(validation.valid)localStorage.setItem(storageKey,JSON.stringify(design));},[design,validation.valid]);
  function update<K extends keyof PlaqueDesign>(key:K,value:PlaqueDesign[K]){setDesign((current)=>({...current,[key]:value}));setNotice('Changes save automatically on this device.');}
  function selectTemplate(id:TemplateId){setDesign((current)=>designForTemplate(current,id));setNotice(`Changed to ${getTemplate(id).title}.`);}
  function downloadDesign(){if(!validation.valid){setNotice('Resolve the highlighted fields before saving.');return;}const blob=new Blob([JSON.stringify(design,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`${design.templateId}-design.json`;anchor.click();URL.revokeObjectURL(url);setNotice('Design file downloaded.');}
  async function generateProject(){if(!validation.valid){setNotice('Resolve the highlighted fields before generating.');return;}setGenerating(true);setNotice('Building personalized Bambu project…');try{download3mf(await generateBambu3mf(design),design.names);setNotice('Personalized 3MF downloaded. Open and slice it in Bambu Studio before printing.');}catch(error){setNotice(error instanceof Error?error.message:'Could not generate the 3MF project.');}finally{setGenerating(false);}}
  async function importDesign(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;try{const imported=parseDesign(JSON.parse(await file.text()));setDesign(imported);setNotice(`Loaded ${file.name}.`);}catch(error){setNotice(error instanceof Error?error.message:'Could not load that design file.');}finally{event.target.value='';}}

  return <main className="app-shell">
    <header className="masthead"><a className="brand" href="#editor" aria-label="Plaque studio home"><span>Guest Book</span><strong>Plaque Studio</strong></a><p>Wedding collection · Four templates</p></header>
    <section className="intro"><p className="eyebrow">Wedding collection</p><h1>Choose a design that feels like them.</h1><p>Select a layout, personalize its eligible elements, and export a complete Bambu Studio project.</p></section>
    <section className="template-gallery" aria-label="Wedding templates">{templateList.map((item)=><button type="button" key={item.id} className={design.templateId===item.id?'template-card selected':'template-card'} onClick={()=>selectTemplate(item.id)}><span className={`template-mark ${item.layout}`}>{item.layout==='monogram'?'CM':item.layout==='botanical'?'❧':item.layout==='modern'?'□':'♥'}</span><strong>{item.title}</strong><small>{item.subtitle}</small></button>)}</section>
    <section className="editor" id="editor">
      <aside className="controls" aria-label="Plaque controls">
        <div className="panel-heading"><div><span>Selected template</span><h2>{template.title}</h2><p>{template.description}</p></div><span className="step">{String(templateList.findIndex((item)=>item.id===template.id)+1).padStart(2,'0')}</span></div>
        <fieldset><legend>Personal details</legend><label htmlFor="names">Names <span>{[...design.names].length}/{template.fields.names.maxCharacters}</span></label><input id="names" aria-label="Names" value={design.names} maxLength={template.fields.names.maxCharacters} onChange={(event)=>update('names',event.target.value)} aria-invalid={Boolean(validation.errors.names)}/>{validation.errors.names&&<p className="error">{validation.errors.names}</p>}<label htmlFor="date">Event date <span>{[...design.date].length}/{template.fields.date.maxCharacters}</span></label><input id="date" aria-label="Event date" value={design.date} maxLength={template.fields.date.maxCharacters} onChange={(event)=>update('date',event.target.value)} aria-invalid={Boolean(validation.errors.date)}/>{validation.errors.date&&<p className="error">{validation.errors.date}</p>}</fieldset>
        <OptionField label="Lettering style" values={template.eligibility.fonts} selected={design.font} labels={{elegant:'Lobster script',modern:'Montserrat'}} onChange={(value)=>update('font',value)}/>
        <OptionField label="Ornament" values={template.eligibility.ornaments} selected={design.ornament} labels={ornaments} onChange={(value)=>update('ornament',value)}/>
        <OptionField label="Border" values={template.eligibility.borders} selected={design.border} labels={borders} onChange={(value)=>update('border',value)}/>
        {validation.errors.elements&&<p className="error">{validation.errors.elements}</p>}
        <ColourField label="Plaque colour" ids={baseColours} selected={design.baseColour} onChange={(colour)=>update('baseColour',colour)}/><ColourField label="Raised detail colour" ids={detailColours} selected={design.detailColour} onChange={(colour)=>update('detailColour',colour)}/>{validation.errors.colours&&<p className="error">{validation.errors.colours}</p>}
        <div className="actions"><button type="button" className="primary" disabled={generating} onClick={generateProject}>{generating?'Generating 3MF…':'Generate Bambu 3MF'}</button><button type="button" onClick={downloadDesign}>Save design</button><button type="button" onClick={()=>fileInput.current?.click()}>Load design</button><button type="button" onClick={()=>{setDesign(defaultDesign);setNotice('Collection reset.');}}>Reset</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importDesign}/></div><p className="notice" role="status">{notice}</p>
      </aside>
      <div className="workspace"><div className="workspace-heading"><div><span>Live preview</span><h2>Front face</h2></div><span className={validation.valid?'valid':'invalid'}>{validation.valid?'Design valid':'Needs attention'}</span></div><PlaquePreview design={design}/><div className="production-note"><span>Eligibility</span><p>Only fonts, ornaments and borders implemented by both the preview and 3MF geometry engine are available for this template.</p></div></div>
    </section>
  </main>;
}

function OptionField<T extends string>({label,values,selected,labels,onChange}:{label:string;values:T[];selected:T;labels:Record<T,string>;onChange:(value:T)=>void}){return <fieldset><legend>{label}</legend><div className="option-grid">{values.map((value)=><button type="button" key={value} className={selected===value?'selected':''} onClick={()=>onChange(value)}>{labels[value]}</button>)}</div></fieldset>;}
function ColourField({label,ids,selected,onChange}:{label:string;ids:ColourId[];selected:ColourId;onChange:(id:ColourId)=>void}){return <fieldset><legend>{label}</legend><div className="swatches">{ids.map((id)=><button type="button" key={id} className={selected===id?'selected':''} onClick={()=>onChange(id)} aria-label={`${colours[id].label}${selected===id?', selected':''}`}><span style={{background:colours[id].value}}/><small>{colours[id].label}</small></button>)}</div></fieldset>;}

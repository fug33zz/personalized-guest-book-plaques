import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlaquePreview } from './PlaquePreview';
import { parseDesign, validateDesign } from './layout';
import { baseColours, colours, defaultDesign, detailColours, weddingTemplate } from './template';
import type { ColourId, FontId, PlaqueDesign } from './types';

const storageKey='guest-book-plaque-design-v1';
function loadStoredDesign():PlaqueDesign{try{const stored=localStorage.getItem(storageKey);return stored?parseDesign(JSON.parse(stored)):defaultDesign;}catch{return defaultDesign;}}

export default function App(){
  const[design,setDesign]=useState<PlaqueDesign>(loadStoredDesign);
  const[notice,setNotice]=useState('Changes save automatically on this device.');
  const fileInput=useRef<HTMLInputElement>(null);
  const validation=useMemo(()=>validateDesign(design),[design]);
  useEffect(()=>{if(validation.valid)localStorage.setItem(storageKey,JSON.stringify(design));},[design,validation.valid]);
  function update<K extends keyof PlaqueDesign>(key:K,value:PlaqueDesign[K]){setDesign((current)=>({...current,[key]:value}));setNotice('Changes save automatically on this device.');}
  function downloadDesign(){if(!validation.valid){setNotice('Resolve the highlighted fields before saving.');return;}const blob=new Blob([JSON.stringify(design,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='wedding-plaque-design.json';anchor.click();URL.revokeObjectURL(url);setNotice('Design file downloaded.');}
  async function importDesign(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;try{const imported=parseDesign(JSON.parse(await file.text()));setDesign(imported);setNotice(`Loaded ${file.name}.`);}catch(error){setNotice(error instanceof Error?error.message:'Could not load that design file.');}finally{event.target.value='';}}
  return <main className="app-shell">
    <header className="masthead"><a className="brand" href="#editor" aria-label="Plaque studio home"><span>Guest Book</span><strong>Plaque Studio</strong></a><p>Internal prototype · Wedding template 01</p></header>
    <section className="intro"><p className="eyebrow">Personalization studio</p><h1>Create a detail worth keeping.</h1><p>Personalize a production-constrained plaque and preview it at its true proportions.</p></section>
    <section className="editor" id="editor">
      <aside className="controls" aria-label="Plaque controls">
        <div className="panel-heading"><div><span>Template</span><h2>{weddingTemplate.title}</h2></div><span className="step">01</span></div>
        <fieldset><legend>Personal details</legend>
          <label htmlFor="names">Names <span>{[...design.names].length}/{weddingTemplate.fields.names.maxCharacters}</span></label><input id="names" aria-label="Names" value={design.names} maxLength={weddingTemplate.fields.names.maxCharacters} onChange={(event)=>update('names',event.target.value)} aria-invalid={Boolean(validation.errors.names)}/>{validation.errors.names&&<p className="error">{validation.errors.names}</p>}
          <label htmlFor="date">Event date <span>{[...design.date].length}/{weddingTemplate.fields.date.maxCharacters}</span></label><input id="date" aria-label="Event date" value={design.date} maxLength={weddingTemplate.fields.date.maxCharacters} onChange={(event)=>update('date',event.target.value)} aria-invalid={Boolean(validation.errors.date)}/>{validation.errors.date&&<p className="error">{validation.errors.date}</p>}
        </fieldset>
        <fieldset><legend>Lettering style</legend><div className="segmented">{(['elegant','modern'] as FontId[]).map((font)=><button type="button" className={design.font===font?'selected':''} onClick={()=>update('font',font)} key={font}>{font==='elegant'?'Lobster script':'Montserrat'}</button>)}</div></fieldset>
        <ColourField label="Plaque colour" ids={baseColours} selected={design.baseColour} onChange={(colour)=>update('baseColour',colour)}/>
        <ColourField label="Raised detail colour" ids={detailColours} selected={design.detailColour} onChange={(colour)=>update('detailColour',colour)}/>
        {validation.errors.colours&&<p className="error">{validation.errors.colours}</p>}
        <div className="actions"><button type="button" className="primary" onClick={downloadDesign}>Save design file</button><button type="button" onClick={()=>fileInput.current?.click()}>Load design</button><button type="button" onClick={()=>{setDesign(defaultDesign);setNotice('Template reset.');}}>Reset</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importDesign}/></div>
        <p className="notice" role="status">{notice}</p>
      </aside>
      <div className="workspace"><div className="workspace-heading"><div><span>Live preview</span><h2>Front face</h2></div><span className={validation.valid?'valid':'invalid'}>{validation.valid?'Design valid':'Needs attention'}</span></div><PlaquePreview design={design}/><div className="production-note"><span>Production rule</span><p>The dashed line marks the 8 mm safe area. Text scales automatically and cannot be moved outside the tested layout.</p></div></div>
    </section>
  </main>;
}

function ColourField({label,ids,selected,onChange}:{label:string;ids:ColourId[];selected:ColourId;onChange:(id:ColourId)=>void}){return <fieldset><legend>{label}</legend><div className="swatches">{ids.map((id)=><button type="button" key={id} className={selected===id?'selected':''} onClick={()=>onChange(id)} aria-label={`${colours[id].label}${selected===id?', selected':''}`}><span style={{background:colours[id].value}}/><small>{colours[id].label}</small></button>)}</div></fieldset>;}

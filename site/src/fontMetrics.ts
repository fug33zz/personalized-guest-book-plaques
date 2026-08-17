import opentype, { type Font } from 'opentype.js';
import lobsterUrl from '@fontsource/lobster/files/lobster-latin-400-normal.woff?url';
import montserratUrl from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff?url';
import type { FontId } from './types';

const urls:Record<FontId,string>={elegant:lobsterUrl,modern:montserratUrl};
const cache=new Map<FontId,Promise<Font>>();
export function loadProductionFont(id:FontId){let pending=cache.get(id);if(!pending){pending=fetch(urls[id]).then((response)=>{if(!response.ok)throw new Error(`Could not load ${id} font.`);return response.arrayBuffer();}).then((buffer)=>opentype.parse(buffer));cache.set(id,pending);}return pending;}

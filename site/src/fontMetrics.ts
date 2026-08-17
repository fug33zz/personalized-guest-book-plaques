import opentype, { type Font } from 'opentype.js';
import lobsterUrl from '@fontsource/lobster/files/lobster-latin-400-normal.woff?url';
import montserratUrl from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff?url';
import cormorantUrl from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff?url';
import playfairUrl from '@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff?url';
import baskervilleUrl from '@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff?url';
import cinzelUrl from '@fontsource/cinzel/files/cinzel-latin-600-normal.woff?url';
import bodoniUrl from '@fontsource/bodoni-moda/files/bodoni-moda-latin-600-normal.woff?url';
import alexBrushUrl from '@fontsource/alex-brush/files/alex-brush-latin-400-normal.woff?url';
import alluraUrl from '@fontsource/allura/files/allura-latin-400-normal.woff?url';
import parisienneUrl from '@fontsource/parisienne/files/parisienne-latin-400-normal.woff?url';
import type { FontId } from './types';

const urls:Record<FontId,string>={elegant:lobsterUrl,modern:montserratUrl,cormorant:cormorantUrl,playfair:playfairUrl,baskerville:baskervilleUrl,cinzel:cinzelUrl,bodoni:bodoniUrl,'alex-brush':alexBrushUrl,allura:alluraUrl,parisienne:parisienneUrl};
const cache=new Map<FontId,Promise<Font>>();
export function loadProductionFont(id:FontId){let pending=cache.get(id);if(!pending){pending=fetch(urls[id]).then((response)=>{if(!response.ok)throw new Error(`Could not load ${id} font.`);return response.arrayBuffer();}).then((buffer)=>opentype.parse(buffer));cache.set(id,pending);}return pending;}

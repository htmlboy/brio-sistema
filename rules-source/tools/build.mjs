import { readFile, writeFile, mkdir, readdir, cp, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const source=fileURLToPath(new URL('../',import.meta.url));
const root=path.resolve(source,'..');
const output=path.join(root,'_site');
const manifest=JSON.parse(await readFile(path.join(source,'manifest.json'),'utf8'));
const stylesheet=await readFile(path.join(source,'assets/rules.css'),'utf8');
const revision=process.env.GITHUB_SHA || 'local-preview';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
if(manifest.schemaVersion!==1||!Array.isArray(manifest.editions))throw Error('Unsupported rules manifest');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const entry of await readdir(root)){
 if(['.git','.github','.gitignore','rules-source','_site','node_modules'].includes(entry))continue;
 await cp(path.join(root,entry),path.join(output,entry),{recursive:true});
}
await mkdir(path.join(output,'reglas'),{recursive:true});
await mkdir(path.join(output,'descargas'),{recursive:true});
await cp(path.join(source,'assets'),path.join(output,'reglas/assets'),{recursive:true});
const publications=[];
for(const edition of manifest.editions){
 if(!/^[0-9]+\.[0-9]+$/.test(edition.id))throw Error('Invalid edition ID');
 const sourceFile=path.resolve(source,edition.source);
 if(!sourceFile.startsWith(source))throw Error('Rules source is outside canonical folder');
 const html=await readFile(sourceFile,'utf8');
 if(!html.includes(`data-edition="${edition.id}"`)||!html.includes('<h1>')||/<script\b|\son\w+\s*=/i.test(html))throw Error('Invalid canonical HTML: '+edition.id);
 const hash=createHash('sha256').update(html).update(stylesheet).digest('hex');
 const pdf=`/descargas/brio-${edition.id}.pdf`;
 const review=edition.status==='review';
 const note=review?'Reglas en revisión. Las herramientas de Online todavía usan la edición anterior.':`Edición anterior, compatible con las mecánicas actuales de Online. <a href="/reglas/${manifest.preview}/">Ver Brío ${manifest.preview} en revisión</a>.`;
 const page=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reglas — ${escape(edition.title)}</title><meta name="rules-edition" content="${edition.id}"><meta name="rules-source-sha256" content="${hash}"><meta name="rules-revision" content="${escape(revision)}"><link rel="canonical" href="https://sistema.briorol.com/reglas/${edition.id}/"><link rel="stylesheet" href="../assets/rules.css"><script defer src="../assets/embed.js"></script></head><body><nav class="screen-tools" aria-label="Navegación de reglas"><a href="https://sistema.briorol.com/">Sistema Brío</a><a href="${pdf}" download>Descargar PDF · Brío ${edition.id}</a></nav><main><p class="edition-note">${note}</p>${html}</main><footer class="site-footer">Javier U · Discord: <strong>javier_u</strong> · ${escape(edition.title)}</footer></body></html>`;
 const directory=path.join(output,'reglas',edition.id);await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'index.html'),page);
 publications.push({...edition,url:`/reglas/${edition.id}/`,pdf,sourceSha256:hash,revision});
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer(async(request,response)=>{try{const url=new URL(request.url,'http://localhost');let file=path.resolve(output,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(output+path.sep))throw Error('Invalid path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.end(await readFile(file));}catch{response.statusCode=404;response.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const context=await browser.newContext();
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 const page=await context.newPage();
 for(const edition of publications){
  await page.goto(`http://127.0.0.1:${server.address().port}${edition.url}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const sourceText=await page.locator('.rules-document').textContent();
  await page.emulateMedia({media:'print'});
  await page.pdf({path:path.join(output,edition.pdf.slice(1)),format:'A4',preferCSSPageSize:true,printBackground:true,tagged:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:`<div style="font-family:Arial,sans-serif;font-size:8px;width:100%;padding:0 12mm;color:#5c6056;display:flex;justify-content:space-between"><span>sistema.briorol.com</span><span>${escape(edition.title)} · <span class="pageNumber"></span></span></div>`});
  await page.emulateMedia({media:'screen'});
  await page.setViewportSize({width:390,height:844});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile rules overflow: '+edition.id);
  if(!sourceText.includes('Reglas rápidas'))throw Error('Missing printable text');
  console.log(`Built HTML and PDF: Brío ${edition.id} (${edition.status})`);
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const current=publications.find(edition=>edition.id===manifest.current);
if(!current)throw Error('Current rules edition is missing');
let alias=await readFile(path.join(output,current.url,'index.html'),'utf8');
alias=alias.replaceAll('href="../assets/','href="./assets/').replaceAll('src="../assets/','src="./assets/');
await writeFile(path.join(output,'reglas/index.html'),alias);
await cp(path.join(output,current.pdf),path.join(output,'descargas/Brio_Reglas_Rapidas.pdf'));
await writeFile(path.join(output,'reglas/manifest.json'),JSON.stringify({schemaVersion:1,current:manifest.current,preview:manifest.preview,editions:publications},null,2)+'\n');
console.log('Canonical rules artifact ready: '+output);

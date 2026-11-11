import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
test('published editions are unique and the compatible current edition is retained',async()=>{
 assert.equal(new Set(manifest.editions.map(edition=>edition.id)).size,manifest.editions.length);
 assert.ok(manifest.editions.some(edition=>edition.id===manifest.current&&edition.status!=='review'));
 assert.ok(manifest.editions.some(edition=>edition.id===manifest.preview&&edition.status==='review'));
 for(const edition of manifest.editions){
  const html=await readFile(new URL(edition.source,root),'utf8');
  assert.ok(html.includes(`data-edition="${edition.id}"`));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.doesNotMatch(html,/<script\b|\son\w+\s*=/i);
 }
});

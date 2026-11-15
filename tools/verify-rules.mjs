import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export async function verifyArtifact(directory) {
  const manifest = JSON.parse(await readFile(path.join(directory, 'reglas/manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 2 || manifest.current !== '2.0' || !/^[a-f0-9]{40}$/.test(manifest.revision)) throw new Error('Invalid rules artifact provenance');
  const hash = data => createHash('sha256').update(data).digest('hex');
  if (hash(JSON.stringify(manifest.inputs)) !== manifest.sourceSha256) throw new Error('Invalid source digest');
  for (const name of ['reglas/index.html', 'reglas/2.0/index.html', 'descargas/brio-2.0.pdf', 'descargas/Brio_Reglas_Rapidas.pdf', 'reglas/hoja-de-personaje/index.html', 'descargas/Brio_Hoja_PJ.pdf']) {
    if (!manifest.files[name]) throw new Error('Missing required artifact: ' + name);
  }
  for (const [name, expected] of Object.entries(manifest.files)) {
    if (!/^(reglas|descargas)\//.test(name) || name.split('/').includes('..') || name.includes('\\')) throw new Error('Invalid artifact path');
    if (hash(await readFile(path.join(directory, name))) !== expected) throw new Error('Artifact checksum mismatch: ' + name);
  }
  async function checkFiles(relative) {
    for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
      const name = relative + '/' + entry.name;
      if (entry.isDirectory()) await checkFiles(name);
      else if (name !== 'reglas/manifest.json' && !manifest.files[name]) throw new Error('Untracked rules artifact: ' + name);
    }
  }
  await checkFiles('reglas');
  for (const name of ['reglas/index.html', 'reglas/hoja-de-personaje/index.html']) {
    const html = await readFile(path.join(directory, name), 'utf8');
    if (!html.includes(`name="rules-revision" content="${manifest.revision}"`) || !html.includes(`name="rules-source-sha256" content="${manifest.sourceSha256}"`)) throw new Error('HTML provenance mismatch');
  }
  return manifest;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = await verifyArtifact(path.resolve(process.argv[2] || '.'));
  console.log(`Verified canonical rules 2.0 from ${manifest.sourceRepository}@${manifest.revision}`);
}

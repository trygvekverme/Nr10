// Bundles the game into one self-contained file, undulaten.html, that can be
// opened straight from disk (no web server needed).
//   node build.mjs                 -> undulaten.html
//   node build.mjs --fragment out  -> also writes a body-only fragment (for embedding)
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  write: false,
  alias: { three: './vendor/three.module.min.js' },
  legalComments: 'none',
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = readFileSync('index.html', 'utf8');
const re = /<!-- build:js -->[\s\S]*?<!-- \/build:js -->/;
if (!re.test(html)) throw new Error('build marker not found in index.html');
const out = html.replace(re, () => `<script>\n${js}</script>`);
writeFileSync('undulaten.html', out);
console.log('undulaten.html', (out.length / 1024).toFixed(0) + ' kB');

const i = process.argv.indexOf('--fragment');
if (i > 0) {
  // strip the document shell: keep <title>, <style> and everything inside <body>
  const title = out.match(/<title>[\s\S]*?<\/title>/)[0];
  const style = out.match(/<style>[\s\S]*?<\/style>/)[0];
  const body = out.match(/<body>([\s\S]*)<\/body>/)[1];
  const frag = `${title}\n<meta name="claude:viewport-fit-sides" content="cover">\n${style}\n${body}`;
  writeFileSync(process.argv[i + 1], frag);
  console.log('fragment', (frag.length / 1024).toFixed(0) + ' kB');
}

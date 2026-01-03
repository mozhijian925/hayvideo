#!/usr/bin/env node
const {spawnSync} = require('child_process');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/render-with-config.js <CompositionId> <config.json> [out.mp4]');
  process.exit(1);
}

const [,, comp, configPath, outFile] = process.argv;
if (!comp || !configPath) {
  usage();
}

const resolvedConfig = path.resolve(process.cwd(), configPath);
const output = outFile || `${comp}.mp4`;

console.log(`Rendering composition ${comp} with props file ${resolvedConfig} -> ${output}`);

const args = ['remotion', 'render', 'src/index.ts', comp, output, '--props-file', resolvedConfig];
const res = spawnSync('npx', args, {stdio: 'inherit', shell: true});
if (res.status !== 0) {
  process.exit(res.status || 1);
}

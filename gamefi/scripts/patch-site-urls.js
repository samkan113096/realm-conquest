#!/usr/bin/env node
/**
 * Patch localhost dApp URLs in site HTML for Netlify deploy.
 * Usage: DAPP_URL=https://your-dapp.netlify.app node scripts/patch-site-urls.js
 */
const fs = require('fs');
const path = require('path');

const DAPP_URL = process.env.DAPP_URL || process.env.VITE_DAPP_URL || 'http://localhost:5173';
const SITE_DIR = path.join(__dirname, '..', 'site');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) patchFile(p);
  }
}

function patchFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const next = s.replace(/http:\/\/localhost:5173/g, DAPP_URL);
  if (next !== s) {
    fs.writeFileSync(file, next);
    console.log('patched', path.relative(SITE_DIR, file));
  }
}

walk(SITE_DIR);
console.log('Site dApp links →', DAPP_URL);

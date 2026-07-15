/**
 * Extension build script using esbuild.
 * Outputs a loadable dist/ folder for chrome://extensions → Load unpacked.
 *
 * npm run build   — one-shot build
 * npm run dev     — watch mode (rebuild on change)
 */

import * as esbuild from 'esbuild'
import { copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

const watch = process.argv.includes('--watch')

// ── Create output directories ────────────────────────────────────────────────
for (const dir of ['dist', 'dist/popup', 'dist/icons']) {
  mkdirSync(dir, { recursive: true })
}

// ── Generate solid-colour PNG icons (indigo #6366f1) ────────────────────────
generateIcons()

// ── Copy static files ────────────────────────────────────────────────────────
copyFileSync('manifest.json', 'dist/manifest.json')
copyFileSync('src/popup/popup.html', 'dist/popup/popup.html')

// ── esbuild entry points ──────────────────────────────────────────────────────
const entries = [
  // inject.ts runs in the real page context — must be a self-contained IIFE
  { entryPoints: ['src/inject.ts'], outfile: 'dist/inject.js', format: 'iife' },
  // content.ts runs in the isolated content-script world — IIFE for max compat
  { entryPoints: ['src/content.ts'], outfile: 'dist/content.js', format: 'iife' },
  // background.ts is an MV3 ES-module service worker
  { entryPoints: ['src/background.ts'], outfile: 'dist/background.js', format: 'esm' },
  // popup.ts runs in a plain HTML page — IIFE is simplest
  { entryPoints: ['src/popup/popup.ts'], outfile: 'dist/popup/popup.js', format: 'iife' },
]

const base = {
  bundle: true,
  minify: false,
  target: ['chrome112'],
  logLevel: 'info',
}

if (watch) {
  const contexts = await Promise.all(entries.map((e) => esbuild.context({ ...base, ...e, sourcemap: true })))
  await Promise.all(contexts.map((ctx) => ctx.watch()))
  console.log('[preparena-ext] watching for changes…')
} else {
  await Promise.all(entries.map((e) => esbuild.build({ ...base, ...e })))
  console.log('[preparena-ext] build complete → dist/')
}

// ── PNG icon generator ────────────────────────────────────────────────────────

function generateIcons() {
  const [r, g, b] = [99, 102, 241] // PrepArena accent: #6366f1
  for (const size of [16, 48, 128]) {
    writeFileSync(`dist/icons/icon${size}.png`, solidColorPNG(size, r, g, b))
  }
}

/**
 * Creates a minimal valid PNG of a solid colour.
 * Uses only Node built-ins (zlib for deflate, Buffer for bytes).
 */
function solidColorPNG(size, r, g, b) {
  // CRC32 lookup table
  const TABLE = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    TABLE[i] = c
  }
  function crc32(buf) {
    let c = 0xffffffff
    for (const byte of buf) c = TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }

  const u32be = (n) => {
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(n)
    return buf
  }

  const chunk = (type, data) => {
    const t = Buffer.from(type, 'ascii')
    const crc = crc32(Buffer.concat([t, data]))
    return Buffer.concat([u32be(data.length), t, data, u32be(crc)])
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = chunk('IHDR', Buffer.concat([u32be(size), u32be(size), Buffer.from([8, 2, 0, 0, 0])]))

  // Each row: 0x00 (no-filter byte) + size×[r,g,b]
  const pixel = Buffer.from([r, g, b])
  const filterByte = Buffer.from([0])
  const row = Buffer.concat([filterByte, ...Array.from({ length: size }, () => pixel)])
  const rawImg = Buffer.concat(Array.from({ length: size }, () => row))

  const idat = chunk('IDAT', deflateSync(rawImg))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

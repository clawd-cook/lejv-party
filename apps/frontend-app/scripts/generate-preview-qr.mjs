#!/usr/bin/env node
/**
 * Generate LynxExplorer-oriented QR PNGs + manifest for CI preview.
 *
 * Env:
 *   PREVIEW_BASE_URL  - public origin serving *.lynx.bundle (no trailing slash required)
 *   DIST_DIR          - bundle directory (default: apps/frontend-app/dist relative to cwd)
 *   OUT_DIR           - output directory for QR assets (default: <DIST_DIR>/../preview-qr)
 *   QR_ENTRIES        - optional comma-separated entry names; default = all *.lynx.bundle
 *
 * Schema matches apps/frontend-app/app.config.ts pluginQRCode: `${url}?fullscreen=true`
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')

function normalizeBase(url) {
  return url.trim().replace(/\/+$/, '')
}

function wrapSchema(bundleUrl) {
  return `${bundleUrl}?fullscreen=true`
}

function main() {
  const previewBase = process.env.PREVIEW_BASE_URL?.trim()
  if (!previewBase) {
    console.error('PREVIEW_BASE_URL is required')
    process.exit(1)
  }

  const distDir = resolve(process.env.DIST_DIR || join(appRoot, 'dist'))
  const outDir = resolve(process.env.OUT_DIR || join(appRoot, 'preview-qr'))

  if (!existsSync(distDir)) {
    console.error(`DIST_DIR not found: ${distDir}`)
    process.exit(1)
  }

  const allBundles = readdirSync(distDir).filter((f) => f.endsWith('.lynx.bundle'))
  if (allBundles.length === 0) {
    console.error(`No *.lynx.bundle files in ${distDir}`)
    process.exit(1)
  }

  const entryFilter = process.env.QR_ENTRIES?.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const bundles = entryFilter?.length
    ? allBundles.filter((f) => entryFilter.includes(f.replace(/\.lynx\.bundle$/, '')))
    : allBundles

  if (bundles.length === 0) {
    console.error('No bundles matched QR_ENTRIES filter')
    process.exit(1)
  }

  mkdirSync(outDir, { recursive: true })

  const base = normalizeBase(previewBase)
  /** @type {{ entry: string; bundle: string; bundleUrl: string; schemaUrl: string; qr: string }[]} */
  const entries = []

  for (const bundle of bundles.sort()) {
    const entry = bundle.replace(/\.lynx\.bundle$/, '')
    const bundleUrl = `${base}/${bundle}`
    const schemaUrl = wrapSchema(bundleUrl)
    const qrFile = `${entry}.png`
    const qrPath = join(outDir, qrFile)

    const result = spawnSync(
      'npx',
      ['--yes', 'qrcode@1.5.4', schemaUrl, '-o', qrPath, '-s', '8'],
      { stdio: 'inherit', shell: process.platform === 'win32' },
    )
    if (result.status !== 0) {
      console.error(`Failed to generate QR for ${entry}`)
      process.exit(result.status ?? 1)
    }

    entries.push({ entry, bundle, bundleUrl, schemaUrl, qr: qrFile })
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    previewBaseUrl: base,
    schema: '${bundleUrl}?fullscreen=true',
    apiNote:
      'Device builds default API to http://localhost:3000. Pass apiBaseUrl (or api_base_url) via scheme/global props for a reachable backend.',
    entries,
  }

  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(
    join(outDir, 'README.md'),
    [
      '# frontend-app preview QR',
      '',
      `- Preview base: \`${base}\``,
      '- Scan a PNG with LynxExplorer (or a compatible host).',
      '- Schema: `bundleUrl?fullscreen=true` (same as local pluginQRCode).',
      '- API: pass `apiBaseUrl` in scheme/global props; localhost will not work on a physical device.',
      '',
      '| Entry | Bundle URL | QR |',
      '| --- | --- | --- |',
      ...entries.map((e) => `| ${e.entry} | ${e.bundleUrl} | ${e.qr} |`),
      '',
    ].join('\n'),
  )

  console.log(`Wrote ${entries.length} QR code(s) to ${outDir}`)
}

main()

#!/usr/bin/env node
// Build lib/client.js — the client bundle DSH loads for this plugin.
//
// There is no bundler in the loop: DSH serves the client half as a classic
// script, so src/client/index.js is already a complete bundle with one
// placeholder. This script fills that placeholder with data read from the real
// knowledge base, so the panel can never drift from the skill files:
//
//   * skills/harmonyos-development/references/*.md   → the references tree
//   * references/platform-baseline.md                → the baseline card
//   * skills/arkts-review/SKILL.md                   → the eight review axes
//
// Every baseline field is REQUIRED: if the wording in platform-baseline.md moves
// on, the build fails loudly instead of shipping a stale panel.
//
//   node build-client.mjs            # write lib/client.js
//   node build-client.mjs --check    # fail if lib/client.js is out of date
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SKILLS = join(ROOT, 'skills')
const REFERENCES = join(SKILLS, 'harmonyos-development', 'references')
const SOURCE = join(ROOT, 'src', 'client', 'index.js')
const OUTPUT = join(ROOT, 'lib', 'client.js')

const check = process.argv.includes('--check')
const fail = (message) => { console.error(`build-client: ${message}`); process.exit(1) }

/** Collapse markdown inline syntax down to readable plain text. */
const plain = (text) => text
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()

/** First `# ` heading, first prose paragraph, and the first few `## ` headings. */
function outline (markdown) {
  const lines = markdown.split(/\r?\n/)
  let title
  const groups = []
  const paragraph = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (title === undefined && trimmed.startsWith('# ')) { title = plain(trimmed.slice(2)); continue }
    if (trimmed.startsWith('## ')) {
      if (paragraph.length > 0) break
      if (groups.length < 4) groups.push(plain(trimmed.slice(3)))
      continue
    }
    if (trimmed === '' || trimmed.startsWith('```') || trimmed.startsWith('|') || trimmed.startsWith('>')) {
      if (paragraph.length > 0) break
      continue
    }
    if (trimmed.startsWith('#')) continue
    paragraph.push(trimmed)
  }
  return { title, summary: plain(paragraph.join(' ')), groups }
}

function truncate (text, limit = 190) {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('. '), cut.lastIndexOf('；'))
  return stop > limit * 0.5 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`
}

/** Required single-field extraction with an actionable failure message. */
function require1 (text, pattern, label, group = 1) {
  const match = pattern.exec(text)
  if (match === null || match[group] === undefined) {
    fail(`could not read "${label}" from platform-baseline.md — update the pattern in build-client.mjs.`)
  }
  return plain(match[group])
}

// ---------------------------------------------------------------- references
// README.md is the routing index for the folder and is part of the count, so it
// is kept and pinned first rather than filtered out.
const entries = (await readdir(REFERENCES, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
  .map(entry => entry.name)
  .sort((a, b) => (a === 'README.md' ? -1 : b === 'README.md' ? 1 : a.localeCompare(b)))

if (entries.length === 0) fail(`no reference documents found in ${REFERENCES}`)

const references = []
for (const file of entries) {
  const path = join(REFERENCES, file)
  const [markdown, info] = await Promise.all([readFile(path, 'utf8'), stat(path)])
  const { title, summary, groups } = outline(markdown)
  references.push({
    file,
    title: title ?? file,
    summary: truncate(summary === '' ? (title ?? file) : summary),
    bytes: info.size,
    groups,
    index: file === 'README.md',
  })
}

// ------------------------------------------------------------------ baseline
const baselineText = await readFile(join(REFERENCES, 'platform-baseline.md'), 'utf8')
const major = require1(baselineText, /Production default: \*\*HarmonyOS ([\d.]+) \/ API ([\d.]+)\*\*/, 'production default', 2)
const product = require1(baselineText, /marketed as \*\*([^*]+)\*\*/, 'product name (HarmonyOS 7)')
const released = require1(baselineText, /API [\d.]+ was released on \*\*([\d-]+)\*\*/, 'release date')
const floor = require1(baselineText, /Compatibility floor: ([^*]+?)\.\*\*/, 'compatibility floor')
const ide = require1(baselineText, /\|\s*API [\d.]+ Release\s*\|\s*\*\*([^*]+?)\*\*/, 'DevEco Studio build')
const sdk = require1(baselineText, /\|\s*API [\d.]+ Release\s*\|\s*\*\*[^*]+?\*\*\s*\|\s*\*\*([^*]+?)\*\*/, 'HarmonyOS SDK build')
const checked = require1(baselineText, /As of ([\d-]+) no release newer/, 'last-checked date')

const floorCode = (/(API \d+)/.exec(floor) ?? [])[1] ?? floor

const baseline = {
  headline: `API ${major} Release`,
  product,
  released,
  floor,
  ide,
  sdk,
  checked,
}

// ---------------------------------------------------------------------- axes
const reviewText = await readFile(join(SKILLS, 'arkts-review', 'SKILL.md'), 'utf8')
const axes = [...reviewText.matchAll(/^###\s*\d+\.\s*(.+)$/gm)].map(match => plain(match[1]))
if (axes.length === 0) fail('could not read the eight review axes from skills/arkts-review/SKILL.md.')

const data = {
  title: '鸿蒙 ArkTS',
  subtitle: `${product} · 兼容下限 ${floorCode} · ${references.length} 份速查`,
  baseline,
  references,
  axes,
}

// --------------------------------------------------------------------- build
const source = await readFile(SOURCE, 'utf8')
const MARKER = '/*__PANEL_DATA__*/ null'
if (!source.includes(MARKER)) fail(`placeholder ${MARKER} not found in src/client/index.js`)

const banner = `// GENERATED FILE — do not edit. Source: src/client/index.js + build-client.mjs\n`
const bundle = source.replace(MARKER, JSON.stringify(data, null, 2).replace(/\n/g, '\n    '))
const output = banner + bundle

if (check) {
  let current
  try { current = await readFile(OUTPUT, 'utf8') } catch { fail('lib/client.js is missing — run: node build-client.mjs') }
  if (current !== output) fail('lib/client.js is stale — run: node build-client.mjs')
  console.log(`build-client: lib/client.js is up to date (${references.length} references, ${axes.length} axes)`)
  process.exit(0)
}

await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, output, 'utf8')
console.log(`build-client: wrote lib/client.js`)
console.log(`  baseline   : ${baseline.headline} (${baseline.released}), floor ${baseline.floor}`)
console.log(`  toolchain  : ${baseline.ide} / SDK ${baseline.sdk}`)
console.log(`  references : ${references.length}`)
console.log(`  axes       : ${axes.length}`)
console.log(`  bytes      : ${Buffer.byteLength(output, 'utf8')}`)

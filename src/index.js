import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

export const name = 'dsh-harmonyos-arkts'
export const inject = ['skills']

const PROVIDER_NAME = 'harmonyos-arkts'
const BUNDLED_SKILL_RANK = 600

// 插件包内 skills/ 目录（相对本文件上一级）
const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills')

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (match === null) return undefined
  let data
  try {
    data = parseYaml(match[1])
  } catch {
    return undefined
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return undefined
  return { data, body: raw.slice(match[0].length) }
}

async function loadSkill(skillDir) {
  const file = join(skillDir, 'SKILL.md')
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return undefined
  }
  const parsed = parseFrontmatter(raw)
  if (parsed === undefined) return undefined
  const { name: skillName, description, whenToUse } = parsed.data
  if (typeof skillName !== 'string' || !SKILL_NAME.test(skillName)) return undefined
  if (typeof description !== 'string' || description.length === 0) return undefined
  return {
    name: skillName,
    description,
    whenToUse: typeof whenToUse === 'string' && whenToUse.length > 0 ? whenToUse : undefined,
    content: parsed.body.trim(),
  }
}

export function apply(ctx) {
  ctx.skills.registerProvider((control) => {
    void control
    return {
      name: PROVIDER_NAME,

      async list() {
        let entries
        try {
          entries = await readdir(SKILLS_DIR, { withFileTypes: true })
        } catch {
          return []
        }
        const candidates = []
        for (const entry of entries) {
          if (!entry.isDirectory()) continue
          const skillDir = join(SKILLS_DIR, entry.name)
          const skill = await loadSkill(skillDir)
          if (skill === undefined) continue
          candidates.push({
            name: skill.name,
            description: skill.description,
            ...(skill.whenToUse !== undefined ? { whenToUse: skill.whenToUse } : {}),
            invocation: { modelInvocable: true, userInvocable: true },
            provider: PROVIDER_NAME,
            source: 'bundled',
            rank: BUNDLED_SKILL_RANK,
            locator: skillDir,
            resourceBase: { kind: 'directory', path: skillDir },
            path: join(skillDir, 'SKILL.md'),
          })
        }
        return candidates
      },

      async get(candidate) {
        const skill = await loadSkill(candidate.locator)
        if (skill === undefined) return undefined
        return {
          name: skill.name,
          description: skill.description,
          ...(skill.whenToUse !== undefined ? { whenToUse: skill.whenToUse } : {}),
          invocation: { modelInvocable: true, userInvocable: true },
          provider: PROVIDER_NAME,
          source: 'bundled',
          resourceBase: candidate.resourceBase,
          path: candidate.path,
          content: skill.content,
        }
      },
    }
  })
}

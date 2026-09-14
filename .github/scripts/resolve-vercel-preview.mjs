#!/usr/bin/env node
/**
 * Resolve a Ready Vercel preview deployment for a project + git SHA.
 *
 * Usage:
 *   node resolve-vercel-preview.mjs --project-id <id> --sha <sha> [--url <override>]
 *
 * Env:
 *   VERCEL_TOKEN (required)
 *   VERCEL_ORG_ID / VERCEL_TEAM_ID (optional team scope)
 *
 * Prints JSON: { url, id, sha, readyState, source }
 * and also writes GitHub Actions outputs when GITHUB_OUTPUT is set.
 */
import process from 'node:process'

function usage(msg) {
  if (msg) console.error(msg)
  console.error(
    'Usage: resolve-vercel-preview.mjs --project-id <id> --sha <sha> [--url <override>] [--name <label>]',
  )
  process.exit(1)
}

function parseArgs(argv) {
  const out = { projectId: '', sha: '', url: '', name: 'preview' }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    const next = argv[i + 1]
    if (a === '--project-id' && next) {
      out.projectId = next
      i++
    } else if (a === '--sha' && next) {
      out.sha = next
      i++
    } else if (a === '--url' && next) {
      out.url = next
      i++
    } else if (a === '--name' && next) {
      out.name = next
      i++
    } else {
      usage(`Unknown arg: ${a}`)
    }
  }
  return out
}

function normalizeUrl(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s.replace(/\/$/, '')
  return `https://${s.replace(/\/$/, '')}`
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`Vercel API ${res.status} for ${url}: ${text.slice(0, 500)}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

async function inspectByUrl(url, token, teamId) {
  const host = new URL(normalizeUrl(url)).host
  const qs = new URLSearchParams()
  if (teamId) qs.set('teamId', teamId)
  const data = await fetchJson(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(host)}?${qs}`,
    token,
  )
  return {
    url: normalizeUrl(data.url ? `https://${data.url}` : url),
    id: data.id || data.uid || '',
    sha: data.meta?.githubCommitSha || data.meta?.gitCommitSha || '',
    readyState: data.readyState || data.state || '',
    source: 'explicit-url',
  }
}

async function findBySha(projectId, sha, token, teamId) {
  const want = sha.toLowerCase()
  const qs = new URLSearchParams({
    projectId,
    limit: '50',
  })
  if (teamId) qs.set('teamId', teamId)

  const data = await fetchJson(`https://api.vercel.com/v6/deployments?${qs}`, token)
  const list = Array.isArray(data.deployments) ? data.deployments : []

  const matches = list.filter((d) => {
    const metaSha = (d.meta?.githubCommitSha || d.meta?.gitCommitSha || '').toLowerCase()
    if (!metaSha || !want) return false
    return metaSha === want || metaSha.startsWith(want) || want.startsWith(metaSha)
  })

  const ready = matches.find((d) => String(d.readyState || '').toUpperCase() === 'READY')
  const pick = ready || matches[0]
  if (!pick) {
    return null
  }

  const url = normalizeUrl(pick.url?.startsWith('http') ? pick.url : `https://${pick.url}`)
  return {
    url,
    id: pick.uid || pick.id || '',
    sha: pick.meta?.githubCommitSha || pick.meta?.gitCommitSha || '',
    readyState: pick.readyState || '',
    source: 'sha-match',
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const token = process.env.VERCEL_TOKEN || ''
  const teamId = process.env.VERCEL_ORG_ID || process.env.VERCEL_TEAM_ID || ''

  if (!token) usage('VERCEL_TOKEN is required')
  if (!args.projectId && !args.url) usage('--project-id or --url is required')
  if (!args.sha && !args.url) usage('--sha or --url is required')

  let result
  if (args.url) {
    result = await inspectByUrl(args.url, token, teamId)
    if (String(result.readyState).toUpperCase() !== 'READY') {
      console.error(
        `::error::Override deployment is not Ready (state=${result.readyState}): ${result.url}`,
      )
      process.exit(1)
    }
    if (
      args.sha &&
      result.sha &&
      result.sha.toLowerCase() !== args.sha.toLowerCase() &&
      !result.sha.toLowerCase().startsWith(args.sha.toLowerCase()) &&
      !args.sha.toLowerCase().startsWith(result.sha.toLowerCase())
    ) {
      console.error(
        `::warning::Override deployment SHA ${result.sha} does not match target ${args.sha}`,
      )
    }
  } else {
    result = await findBySha(args.projectId, args.sha, token, teamId)
    if (!result) {
      console.error(
        `::error::No deployment found for project ${args.projectId} at SHA ${args.sha}. Deploy a preview for this commit first, or pass an explicit preview URL.`,
      )
      process.exit(1)
    }
    if (String(result.readyState).toUpperCase() !== 'READY') {
      console.error(
        `::error::Matched deployment is not Ready (state=${result.readyState}): ${result.url}`,
      )
      process.exit(1)
    }
  }

  console.log(JSON.stringify({ name: args.name, ...result }, null, 2))

  const path = process.env.GITHUB_OUTPUT
  if (path) {
    const fs = await import('node:fs')
    const p = args.name
    fs.appendFileSync(
      path,
      [
        `${p}_url=${result.url}`,
        `${p}_id=${result.id}`,
        `${p}_sha=${result.sha || ''}`,
        `${p}_ready_state=${result.readyState}`,
        `${p}_source=${result.source}`,
      ].join('\n') + '\n',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

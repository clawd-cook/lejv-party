#!/usr/bin/env node
/**
 * npm workspaces often hoist deps to the repo root. Sparkling Android settings
 * expect packages under apps/frontend-app/node_modules. Symlink hoisted
 * Sparkling method modules so Gradle projectDirs resolve.
 */
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, '..')
const appNodeModules = join(appRoot, 'node_modules')
const requireFromApp = createRequire(join(appRoot, 'package.json'))

const MODULES = ['sparkling-navigation']

function linkModule(name) {
  let target
  try {
    target = dirname(requireFromApp.resolve(`${name}/package.json`))
  } catch {
    console.warn(`skip ${name}: not resolvable from frontend-app`)
    return
  }

  mkdirSync(appNodeModules, { recursive: true })
  const linkPath = join(appNodeModules, name)

  if (existsSync(linkPath) || lstatSync(linkPath, { throwIfNoEntry: false })?.isSymbolicLink()) {
    try {
      const current = readlinkSync(linkPath)
      const currentAbs = resolve(dirname(linkPath), current)
      if (currentAbs === target) {
        console.log(`ok ${name} -> ${relative(appRoot, target)}`)
        return
      }
      unlinkSync(linkPath)
    } catch {
      // real directory already present — leave it
      if (existsSync(join(linkPath, 'android'))) {
        console.log(`ok ${name} (local install)`)
        return
      }
      throw new Error(`${linkPath} exists and is not a usable sparkling module link`)
    }
  }

  const rel = relative(dirname(linkPath), target)
  symlinkSync(rel, linkPath)
  console.log(`linked ${name} -> ${rel}`)
}

for (const name of MODULES) {
  linkModule(name)
}

const androidDir = join(appNodeModules, 'sparkling-navigation', 'android', 'build.gradle.kts')
if (!existsSync(androidDir)) {
  console.error(`Missing ${androidDir}`)
  process.exit(1)
}

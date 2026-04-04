// Thin re-export so tests can mock this module without fighting ESM built-in semantics.
export { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';

/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { findWorkspacePackages } from '@pnpm/find-workspace-packages';

const root = await findWorkspaceDir(process.cwd());
if (!root) {
  throw new Error('No workspace found');
}
const packages = await findWorkspacePackages(root);

const alias = Object.fromEntries(
  packages.map(({ dir, manifest }) => [manifest.name || '_unknown', resolve(dir, 'src', 'exports.ts')]),
);

export default defineConfig({
  test: {
    alias,
  },
});

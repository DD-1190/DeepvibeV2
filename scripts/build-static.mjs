// Static export (for any plain web server). Static sites have no server, so the API routes are moved
// aside for the build and restored afterwards; the project assistant then runs its scripted flow.
import { execSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';

const api = 'app/api';
const aside = '.api-aside';
if (existsSync(api)) renameSync(api, aside);
try {
  execSync('next build', { stdio: 'inherit', env: { ...process.env, STATIC_EXPORT: '1' } });
} finally {
  if (existsSync(aside)) renameSync(aside, api);
}

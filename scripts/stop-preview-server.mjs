import { access } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

function stopPreviewProcessTree() {
  try {
    const output = execSync(
      'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();

    if (!output) {
      return;
    }

    for (const pid of output.split(/\s+/).filter(Boolean)) {
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
      } catch {
        // Ignore races where the process exits before taskkill runs.
      }
    }
  } catch {
    // Ignore missing port/process errors so preview remains idempotent.
  }
}

async function waitForDistUnlock() {
  const distClientPath = new URL('../dist/client', import.meta.url);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await access(distClientPath);
    } catch {
      return;
    }

    try {
      execSync(
        'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue | Out-Null; if ($?) { exit 1 }"',
        { stdio: 'ignore' }
      );
    } catch {
      // Port state can flap during shutdown; keep waiting briefly either way.
    }

    await delay(500);
  }
}

stopPreviewProcessTree();
await waitForDistUnlock();
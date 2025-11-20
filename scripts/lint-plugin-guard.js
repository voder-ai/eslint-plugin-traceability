#!/usr/bin/env node
/**
 * @story Provide a lightweight guard that runs the lint plugin check script.
 * @req Execute scripts/lint-plugin-check.js and exit with its status.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'lint-plugin-check.js');

// Run the check script using the same Node.js executable, forwarding any CLI args and stdio.
const result = spawnSync(process.execPath, [scriptPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

// If spawnSync failed to start the process, surface the error and exit non-zero.
if (result.error) {
  // eslint-disable-next-line no-console
  console.error('Failed to run lint-plugin-check.js:', result.error);
  process.exit(1);
}

// If the child was terminated by a signal, propagate the signal to this process.
if (result.signal) {
  try {
    process.kill(process.pid, result.signal);
  } catch (e) {
    // If we cannot re-emit the signal, exit with code 1.
    process.exit(1);
  }
}

// Otherwise exit with the child's exit status (0, non-zero).
process.exit(result.status === null ? 1 : result.status);
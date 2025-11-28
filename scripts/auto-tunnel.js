#!/usr/bin/env node
/*
 Auto Cloudflare Tunnel Runner
 Purpose: Start a named Cloudflare Tunnel using repo config without manual steps.
 Works best on Windows; falls back to PATH-resolved executable if available.

 Usage:
   node scripts/auto-tunnel.js           // validates and starts tunnel, restarts on failure
   node scripts/auto-tunnel.js --dry     // only validate config & environment
   node scripts/auto-tunnel.js --once    // start tunnel once, no auto-restart
   node scripts/auto-tunnel.js --debug   // verbose logs

 Requirements:
 - cloudflared installed (MSI or PATH)
 - cloudflared/config.yml present in repo
 - credentials-file exists (after `cloudflared tunnel login` and `cloudflared tunnel create <name>`) 
*/
 
// removed duplicate requires (fs, path) from legacy block
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2));
const DEBUG = args.has('--debug');
const DRY = args.has('--dry');
const ONCE = args.has('--once');

const repoRoot = path.resolve(__dirname, '..');
const configPath = path.join(repoRoot, 'cloudflared', 'config.yml');

function log(msg) {
  // minimal, readable logging
  console.log(`[auto-tunnel] ${msg}`);
}

function dbg(msg) {
  if (DEBUG) console.log(`[auto-tunnel:debug] ${msg}`);
}

function fail(msg, code = 1) {
  console.error(`[auto-tunnel:error] ${msg}`);
  process.exit(code);
}

function detectCloudflaredExe() {
  // Try common Windows install locations, then fallback to PATH.
  const candidates = [
    'C\\\\Program Files\\\
\\\
cloudflared\\\
cloudflared.exe',
    'C\\\
\\\
Program Files (x86)\\\
cloudflared\\\
cloudflared.exe',
    'C:\\Program Files\\Cloudflare\\cloudflared\\cloudflared.exe',
    'C:\\Program Files (x86)\\Cloudflare\\cloudflared\\cloudflared.exe',
    // PATH fallback (no absolute path) — rely on spawn resolution
    'cloudflared',
  ];

  for (const exe of candidates) {
    try {
      // Only fs.existsSync for absolute paths; skip check for 'cloudflared' (PATH)
      if (exe.includes(':\\')) {
        if (fs.existsSync(exe)) return exe;
      } else {
        return exe; // assume available in PATH
      }
    } catch (_) {}
  }
  return null;
}

function parseConfig(raw) {
  // Minimal line-based parse to avoid external deps.
  // Extract: tunnel name and credentials-file path.
  let tunnelName = null;
  let credentialsFile = null;
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const t = line.match(/^\s*tunnel:\s*(.+)\s*$/);
    if (t) tunnelName = t[1].trim();
    const c = line.match(/^\s*credentials-file:\s*(.+)\s*$/);
    if (c) credentialsFile = c[1].trim();
  }
  return { tunnelName, credentialsFile };
}

function validateEnvironment() {
  log('Validating environment...');
  if (!fs.existsSync(configPath)) {
    fail(`Missing config: ${configPath}. Create it or copy from cloudflared/config.yml template.`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const { tunnelName, credentialsFile } = parseConfig(raw);
  if (!tunnelName) {
    fail('Config missing `tunnel:`. Example: tunnel: tiptop');
  }

  if (!credentialsFile) {
    fail('Config missing `credentials-file:`. It should point to your tunnel json.');
  }

  // Expand environment variables in credentials-file if any
  const expandedCreds = credentialsFile.replace(/^~\\?/, process.env.USERPROFILE ? `${process.env.USERPROFILE}\\` : credentialsFile);

  if (!fs.existsSync(expandedCreds)) {
    fail(`Credentials file not found: ${expandedCreds}. Run: cloudflared tunnel login && cloudflared tunnel create ${tunnelName}`);
  }

  const exe = detectCloudflaredExe();
  if (!exe) {
    fail('cloudflared executable not found. Install MSI or add to PATH.');
  }

  dbg(`Using cloudflared: ${exe}`);
  dbg(`Config: ${configPath}`);
  dbg(`Tunnel: ${tunnelName}`);
  dbg(`Creds: ${expandedCreds}`);
  return { exe, tunnelName };
}

function runTunnel(exe, tunnelName) {
  const args = ['--config', configPath, 'tunnel', 'run', tunnelName];
  log(`Starting tunnel '${tunnelName}'...`);
  const child = spawn(exe, args, { stdio: 'inherit' });

  child.on('exit', (code, signal) => {
    if (code === 0) {
      log('cloudflared exited cleanly.');
      process.exit(0);
    }
    console.error(`[auto-tunnel] cloudflared exited with code=${code}, signal=${signal}`);
    if (ONCE) {
      process.exit(code || 1);
    } else {
      log('Retrying in 5s...');
      setTimeout(() => runTunnel(exe, tunnelName), 5000);
    }
  });

  child.on('error', (err) => {
    console.error(`[auto-tunnel] Spawn error: ${err.message}`);
    if (ONCE) process.exit(1);
  });
}

function hostMain() {
  const { exe, tunnelName } = validateEnvironment();
  if (DRY) {
    log('Dry-run complete: environment looks good.');
    return;
  }
  runTunnel(exe, tunnelName);
}

/* hostMain() disabled: using Docker-based runner below */

// ===== Docker-based cloudflared runner =====

function dlog(...args) { console.log('[auto-tunnel]', ...args); }

function drun(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: options.cwd || repoRoot,
      shell: true,
      stdio: options.stdio || 'inherit'
    });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function dockerMain() {
  dlog('Запуск cloudflared через docker compose...');
  try {
    await drun('docker', ['compose', 'up', '-d', '--remove-orphans']);
    await drun('docker', ['compose', 'up', '-d', 'cloudflared']);
  } catch (e) {
    dlog('Ошибка запуска docker compose:', e.message);
  }

  dlog('Поток логов cloudflared для подтверждения запуска туннеля...');

  const onData = (buf) => {
    const text = buf.toString();
    process.stdout.write(text);
  };
}

dockerMain().catch(err => {
  dlog('Неожиданная ошибка:', err);
  process.exit(1);
});


// end of file

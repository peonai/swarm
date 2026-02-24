#!/usr/bin/env node
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, def) => new Promise(r => rl.question(`${q}${def ? ` [${def}]` : ''}: `, a => r(a.trim() || def || '')));

async function uninstall() {
  console.log('\n🗑️  Swarm AI Uninstall\n');
  const dir = await ask('Install directory to remove', '/opt/swarm');
  const confirm = await ask(`Delete ${dir} and remove systemd service? (yes/no)`, 'no');
  if (confirm !== 'yes') { console.log('Cancelled.'); rl.close(); return; }
  try { execSync('systemctl stop swarm && systemctl disable swarm', { stdio: 'pipe' }); } catch {}
  try { execSync('rm -f /etc/systemd/system/swarm.service && systemctl daemon-reload', { stdio: 'pipe' }); } catch {}
  try { execSync(`rm -rf ${dir}`); console.log(`\n✅ Removed ${dir} and systemd service`); }
  catch (e) { console.log(`\n⚠️  Failed to remove: ${e.message}. Try with sudo.`); }
  rl.close();
}

async function mcp() {
  const { execSync: run } = await import('child_process');
  const mcpPath = join(dirname(fileURLToPath(import.meta.url)), 'swarm-mcp.mjs');
  // Pass through env vars and stdio for MCP stdio transport
  run(`node ${mcpPath}`, { stdio: 'inherit', env: process.env });
}

async function main() {
  if (process.argv[2] === 'mcp') return mcp();
  if (process.argv[2] === 'uninstall') return uninstall();
  console.log('\n🐝 Swarm AI Setup\n');

  const dir = await ask('Install directory', '/opt/swarm');
  const port = await ask('Port', '3777');

  console.log('\n📐 Embedding (for semantic search, optional)');
  const embedUrl = await ask('API URL (empty to skip)', '');
  let embedKey = '', embedModel = '';
  if (embedUrl) {
    embedKey = await ask('API Key', '');
    embedModel = await ask('Model', 'embedding-3');
  }

  const jwtSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
  const token = await ask('\n🔑 Admin token', 'swarm-' + Math.random().toString(36).slice(2, 10));

  console.log(`\n📦 Copying to ${dir}...`);
  mkdirSync(dir, { recursive: true });
  cpSync(join(pkg, '.next/standalone'), dir, { recursive: true });
  cpSync(join(pkg, '.next/static'), join(dir, '.next/static'), { recursive: true });

  const env = [
    `PORT=${port}`, `HOSTNAME=0.0.0.0`, `SWARM_ADMIN_TOKEN=${token}`, `SWARM_JWT_SECRET=${jwtSecret}`,
    embedUrl && `EMBED_URL=${embedUrl}`,
    embedKey && `EMBED_KEY=${embedKey}`,
    embedModel && `EMBED_MODEL=${embedModel}`,
  ].filter(Boolean).join('\n');
  writeFileSync(join(dir, '.env'), env);

  const svc = (await ask('\nInstall systemd service? (y/n)', 'y')).toLowerCase();
  if (svc === 'y') {
    const unit = `[Unit]\nDescription=Swarm AI\nAfter=network.target\n\n[Service]\nType=simple\nWorkingDirectory=${dir}\nEnvironmentFile=${dir}/.env\nExecStart=/usr/bin/env node ${dir}/server.js\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target`;
    try {
      writeFileSync('/etc/systemd/system/swarm.service', unit);
      execSync('systemctl daemon-reload && systemctl enable swarm && systemctl restart swarm');
      console.log(`\n✅ Running on port ${port}`);
    } catch { console.log('\n⚠️  Need root for systemd. Try: sudo npx @peonai/swarm'); }
  } else {
    console.log(`\n🚀 Start: cd ${dir} && node server.js`);
  }

  console.log(`\n🔑 Admin: ${token}\n📡 API: http://localhost:${port}/api/v1/\n🌐 Dashboard: http://localhost:${port}\n`);
  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });

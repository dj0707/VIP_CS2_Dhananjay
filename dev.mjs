import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

function portIsOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

function start(label, cwd, args) {
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', ['npm', ...args].join(' ')], { cwd, stdio: 'inherit' })
    : spawn('npm', args, { cwd, stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code && code !== 0) console.error(`${label} stopped with exit code ${code}.`);
  });
  return child;
}

const apiRunning = await portIsOpen(5000);
const clientRunning = await portIsOpen(5173);
const children = [];

if (apiRunning) console.log('Backend already running at http://localhost:5000');
else children.push(start('Backend', fileURLToPath(new URL('./server/', import.meta.url)), ['run', 'dev']));

if (clientRunning) console.log('Frontend already running at http://localhost:5173');
else children.push(start('Frontend', fileURLToPath(new URL('./client/', import.meta.url)), ['run', 'dev']));

if (!children.length) {
  console.log('ResolveX is already running at http://localhost:5173');
  process.exit(0);
}

function stopChildren() {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
}

process.on('SIGINT', stopChildren);
process.on('SIGTERM', stopChildren);

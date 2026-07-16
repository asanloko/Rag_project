#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const env = {
  ...process.env,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama2',
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
};

console.log(`Starting Next.js with OLLAMA_MODEL=${env.OLLAMA_MODEL} and OLLAMA_HOST=${env.OLLAMA_HOST}`);

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(command, ['next', 'dev'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env,
});

child.on('error', (error) => {
  console.error('Failed to start the app:', error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code || 0);
  }
});

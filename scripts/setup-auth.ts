#!/usr/bin/env node

import { createPasswordHash, generateToken } from '../src/lib/auth';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAuth() {
  console.log('\n🔐 Admin Authentication Setup\n');
  console.log('This will help you generate the environment variables needed for admin authentication.\n');

  const username = await question('Enter admin username (default: admin): ') || 'admin';
  const password = await question('Enter admin password: ');

  if (!password) {
    console.error('\n❌ Password is required!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn('\n⚠️  Warning: Password should be at least 8 characters for security.');
  }

  console.log('\n✅ Generating secure credentials...\n');

  const passwordHash = createPasswordHash(password);

  console.log('\n📋 Copy these lines to your .env.local file:\n');
  console.log('# Admin Authentication');
  console.log(`ADMIN_USERNAME=${username}`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`ADMIN_TOKEN=${generateToken()}`);
  console.log('ADMIN_AUTH_PROVIDER=simple');
  console.log('\n# For development only (disables authentication):');
  console.log('# DISABLE_ADMIN_AUTH=true\n');

  console.log('✅ Setup complete! Add these environment variables and restart your development server.\n');

  rl.close();
}

setupAuth().catch(console.error);
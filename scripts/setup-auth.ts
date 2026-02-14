#!/usr/bin/env node

import { hashPassword, generateToken } from '../src/lib/admin/auth';
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

  const provider = await question('Auth provider — (1) Simple username/password  (2) Supabase  [1]: ') || '1';

  if (provider === '2') {
    await setupSupabase();
  } else {
    await setupSimple();
  }

  rl.close();
}

async function setupSimple() {
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

  const passwordHash = await hashPassword(password);

  // Escape $ characters so dotenv-expand doesn't interpret them as variable references
  const escapedHash = passwordHash.replace(/\$/g, '\\$');

  console.log('\n📋 Copy these lines to your .env.local file:\n');
  console.log('# Admin Authentication');
  console.log(`ADMIN_AUTH_PROVIDER=simple`);
  console.log(`SIMPLE_ADMIN_USERNAME=${username}`);
  console.log(`SIMPLE_ADMIN_PASSWORD_HASH=${escapedHash}`);
  console.log(`SIMPLE_ADMIN_TOKEN=${generateToken()}`);
  console.log('\n# For development only (disables authentication):');
  console.log('# DISABLE_ADMIN_AUTH=true\n');

  console.log('✅ Setup complete! Add these environment variables and restart your development server.\n');
}

async function setupSupabase() {
  console.log('\nSupabase Auth Setup\n');
  console.log('You need a Supabase project. Create one at https://supabase.com/dashboard\n');

  const url = await question('Supabase Project URL (https://xxx.supabase.co): ');
  const anonKey = await question('Supabase Anon Key: ');

  if (!url || !anonKey) {
    console.error('\n❌ Both URL and Anon Key are required!');
    process.exit(1);
  }

  const allowedEmails = await question('Admin email addresses (comma-separated, or leave empty to allow all): ');

  console.log('\n📋 Copy these lines to your .env.local file:\n');
  console.log('# Supabase');
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${url}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`);
  console.log('');
  console.log('# Admin Authentication');
  console.log('ADMIN_AUTH_PROVIDER=supabase');
  if (allowedEmails) {
    console.log(`ADMIN_ALLOWED_EMAILS=${allowedEmails}`);
  } else {
    console.log('# ADMIN_ALLOWED_EMAILS=admin@example.com');
  }
  console.log('');
  console.log('📌 Next steps:');
  console.log('  1. Run the SQL migration in your Supabase SQL editor:');
  console.log('     supabase/schema.sql');
  console.log('  2. Create a user in Supabase Dashboard > Authentication > Users');
  console.log('  3. Set their role to admin:');
  console.log("     UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';");
  console.log('  4. Restart your development server\n');

  console.log('✅ Setup complete!\n');
}

setupAuth().catch(console.error);

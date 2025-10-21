#!/usr/bin/env node
/**
 * scripts/create-test-user.js
 * Creates a test user in the app_users table with initial balance
 *
 * Usage:
 *   node scripts/create-test-user.js
 *   node scripts/create-test-user.js --email=test@example.com --balance=1500
 *
 * Environment variables required (from .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nEnsure these are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    email: 'test@flux.app',
    fullName: 'Test User',
    displayName: 'Test',
    balance: 1250.00
  };

  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      result.email = arg.split('=')[1];
    } else if (arg.startsWith('--name=')) {
      result.fullName = arg.split('=')[1];
      result.displayName = result.fullName.split(' ')[0];
    } else if (arg.startsWith('--balance=')) {
      result.balance = parseFloat(arg.split('=')[1]) || 1250.00;
    }
  }

  return result;
}

async function createTestUser() {
  const userConfig = parseArgs();

  console.log('👤 Creating test user...\n');
  console.log(`📧 Email: ${userConfig.email}`);
  console.log(`👋 Name: ${userConfig.fullName}`);
  console.log(`💰 Balance: $${userConfig.balance.toFixed(2)}\n`);

  try {
    const { data: existing, error: checkError } = await supabase
      .from('app_users')
      .select('id, email, balance')
      .eq('email', userConfig.email)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Failed to check for existing user:', checkError.message);
      process.exit(1);
    }

    if (existing) {
      console.log('⚠️  User already exists!');
      console.log(`   User ID: ${existing.id}`);
      console.log(`   Current balance: $${Number(existing.balance).toFixed(2)}\n`);

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Do you want to update the balance? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          const { error: updateError } = await supabase
            .from('app_users')
            .update({
              balance: userConfig.balance,
              full_name: userConfig.fullName,
              display_name: userConfig.displayName,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error('❌ Failed to update user:', updateError.message);
          } else {
            console.log('✅ User updated successfully!');
            console.log(`   New balance: $${userConfig.balance.toFixed(2)}`);
          }
        } else {
          console.log('   Keeping existing user unchanged');
        }

        rl.close();
        process.exit(0);
      });

      return;
    }

    const { data: newUser, error: insertError } = await supabase
      .from('app_users')
      .insert([{
        email: userConfig.email,
        full_name: userConfig.fullName,
        display_name: userConfig.displayName,
        balance: userConfig.balance,
        total_donated: 0.00
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create user:', insertError.message);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   User ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.full_name}`);
    console.log(`   Balance: $${Number(newUser.balance).toFixed(2)}`);
    console.log(`   Total Donated: $${Number(newUser.total_donated).toFixed(2)}`);
    console.log(`   Created: ${newUser.created_at}\n`);

    console.log('💡 Use this User ID for testing:');
    console.log(`   ${newUser.id}\n`);

    console.log('🧪 Test API endpoints with:');
    console.log(`   curl "http://localhost:3000/api/user?userId=${newUser.id}"`);
    console.log(`   curl "http://localhost:3000/api/transactions?userId=${newUser.id}"\n`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  }
}

createTestUser();

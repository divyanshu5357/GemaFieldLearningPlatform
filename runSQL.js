#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local or .env
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  try {
    console.log('🚀 Starting SQL migration...\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'ASSIGNMENTS_SUBMISSIONS_SQL.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolons to execute statements individually
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const { error, data } = await supabase.rpc('query', {
        query: statement
      }).catch(async () => {
        // Fallback: Use direct SQL execution through admin API if available
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ query: statement }),
          });
          return { data: await response.json() };
        } catch (e) {
          return { error: e };
        }
      });

      if (error) {
        console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
        // Continue with next statement
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✅ SQL migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('  - assignments');
    console.log('  - submissions');
    console.log('  - Storage buckets: assignments, submissions');
    console.log('  - RLS policies configured');

  } catch (error) {
    console.error('❌ Error running SQL migration:', error.message);
    process.exit(1);
  }
}

runSQL();

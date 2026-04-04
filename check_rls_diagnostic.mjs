import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies_summary'); // This won't work unless defined
  
  // Alternative: query pg_policies
  const { data: policies, error: polError } = await supabase.rpc('pg_get_policies', { table_name: 'profiles' });
  
  // Since we can't easily run arbitrary SQL via RPC without defining it, 
  // let's try to just select from information_schema if possible or use a known method.
  
  console.log('Checking profiles for specific user...');
  const targetEmail = 'mazhar.khokhar71@gmail.com';
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === targetEmail);
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log(`Checking RLS for User ID: ${user.id}`);
  
  // Try to fetch as the user? We can't really do that without their token.
  
  // Let's just check the table structure and policies via a direct SQL execution if we had a tool.
  // We can use the 'supabase' CLI if available, or just check the migration file.
}

async function checkTablePolicies() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'mazhar.khokhar71@gmail.com')
        .single();
    
    console.log('Profile fetch (Service Role):', data ? 'Success' : 'Fail', error?.message);
    
    // Check if RLS is enabled
    // We can't easily check 'row security' via the JS client without custom RPC.
}

checkTablePolicies();

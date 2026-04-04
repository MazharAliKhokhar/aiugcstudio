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

async function checkAllUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n--- ALL AUTH USERS ---');
  for (const user of users) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, credits, is_admin')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log(`Email: ${user.email} (Auth ID: ${user.id}) | NO PROFILE FOUND`);
    } else {
      console.log(`Email: ${user.email} (Auth ID: ${user.id}) | Profile ID: ${profile.id} | Credits: ${profile.credits} | Admin: ${profile.is_admin}`);
    }
  }
}

checkAllUsers();

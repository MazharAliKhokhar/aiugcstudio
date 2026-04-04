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

async function checkAdmin() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }

  console.log('--- Auth Users ---');
  users.forEach(u => console.log(`${u.email} (${u.id})`));

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('email, is_admin, id');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  console.log('\n--- Profiles (Admin status) ---');
  profiles.forEach(p => console.log(`${p.email}: ${p.is_admin ? 'ADMIN' : 'User'} (${p.id})`));
}

checkAdmin();

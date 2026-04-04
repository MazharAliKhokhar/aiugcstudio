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

async function makeAdmin(email) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('email', email);

  if (error) {
    console.error('Error making user admin:', error);
  } else {
    console.log(`Success! ${email} is now an admin.`);
  }
}

makeAdmin('mazhar.khokhar71@gmail.com');

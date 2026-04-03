import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Fetching all users...");
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error("Failed to list users", listError);
    return;
  }
  
  const users = usersData.users;
  console.log(`Found ${users.length} users. Deleting them...`);
  
  for (const user of users) {
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (delError) {
      console.error(`Failed to delete user ${user.id}`, delError);
    } else {
      console.log(`Deleted user ${user.email}`);
    }
  }

  console.log("All old users deleted. Creating new user and admin...");

  // Delay for triggers to cascade
  await new Promise(r => setTimeout(r, 2000));

  const standardUserEmail = 'user@viralugc.com';
  const standardUserPassword = 'password123';
  
  const { data: stdUser, error: stdError } = await supabaseAdmin.auth.admin.createUser({
    email: standardUserEmail,
    password: standardUserPassword,
    email_confirm: true,
  });

  if (stdError) console.error("Standard user creation failed:", stdError);
  else console.log(`Standard user created: ${standardUserEmail}`);

  const adminEmail = 'admin@viralugc.com';
  const adminPassword = 'password123';
  
  const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (adminError) {
    console.error("Admin user creation failed:", adminError);
  } else {
    console.log(`Admin user created: ${adminEmail}`);
    // Delay for profiles trigger to run before we update it
    await new Promise(r => setTimeout(r, 2000));
    
    // Set is_admin to true
    if (adminUser?.user?.id) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', adminUser.user.id);
      
      if (updateError) console.error("Failed to make user admin:", updateError);
      else console.log("Admin flag set for admin user!");
    }
  }

  console.log("Database reset complete.");
}

run();

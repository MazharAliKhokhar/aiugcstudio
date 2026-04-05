import { createClient } from '@supabase/supabase-js'

// No need for dotenv, we'll run with node --env-file=.env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const email = 'saanimazhar@gmail.com'
  const password = 'YourSecurePassword123' // CHANGE THIS!

  console.log(`Creating admin user: ${email}...`)

  // 1. Create the user in auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin' }
  })

  if (userError) {
    console.error('Error creating user:', userError.message)
    return
  }

  const userId = userData.user.id
  console.log(`User created with ID: ${userId}`)

  // 2. Update the profile to be an admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile:', profileError.message)
    return
  }

  console.log('✅ Admin user created and promoted successfully!')
  console.log('You can now log in at https://codenamezee.com/login')
}

createAdmin()

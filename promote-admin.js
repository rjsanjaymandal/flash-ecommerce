const { createClient } = require('@supabase/supabase-js');

// Read env directly to ensure we get the latest values without restart if needed, 
// though for this standalone script we just parsing the file manually or using the key directly.
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyNDU5NywiZXhwIjoyMDgxMTAwNTk3fQ.0yGPlIhXnZi2RYSH36fmVDgK_hxVKd_5l5RaX1RDjrM';
const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'; 

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function promoteUser() {
  const email = 'rjsanjaymandal@gmail.com';
  console.log(`Looking for user: ${email}...`);

  // 1. Get User ID from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email === email);
  let userId;
  
  if (!user) {
    console.log('User not found. Creating user...');
    // Create the user with provided credentials
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Sanjay@#123#',
        email_confirm: true,
        user_metadata: { full_name: 'Sanjay Mandal' } 
    });

    if (createError) {
        console.error('Error creating user:', createError);
        return;
    }
    userId = newUser.user.id;
    console.log(`Created user with ID: ${userId}`);
    
    // Wait a moment for any automated triggers (e.g., creating profile) to fire
    await new Promise(r => setTimeout(r, 2000));
  } else {
    userId = user.id;
    console.log(`Found existing user ID: ${userId}`);
  }

  console.log('Updating profile role to admin...');
  
  // 3. Update Profile
  // We use upsert in case the trigger didn't fire or row doesn't exist for some reason
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({ 
        id: userId,
        role: 'admin',
        name: 'Sanjay Mandal', // Fallback
        updated_at: new Date().toISOString()
    })
    .select();

  if (updateError) {
    console.error('Error updating profile:', updateError);
  } else {
    console.log('SUCCESS: User promoted to ADMIN.');
  }
}

promoteUser();


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gyizmixhmrfwywvafdbi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aXptaXhobXJmd3l3dmFmZGJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyNDU5NywiZXhwIjoyMDgxMTAwNTk3fQ.0yGPlIhXnZi2RYSH36fmVDgK_hxVKd_5l5RaX1RDjrM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Checking Supabase Storage...')

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  const productsBucket = buckets.find(b => b.name === 'products')

  if (productsBucket) {
    console.log("Bucket 'products' exists.")
    
    // Update to Public if not already
    if (!productsBucket.public) {
        console.log("Bucket 'products' is PRIVATE. Updating to PUBLIC...")
        const { error: updateError } = await supabase.storage.updateBucket('products', {
            public: true
        })
        if (updateError) console.error('Error updating bucket:', updateError)
        else console.log("Bucket updated to PUBLIC.")
    } else {
        console.log("Bucket 'products' is already PUBLIC.")
    }

  } else {
    console.log("Bucket 'products' NOT found. Creating it...")
    const { data, error: createError } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    })
    
    if (createError) {
        console.error('Error creating bucket:', createError)
        return
    }
    console.log("Bucket 'products' CREATED successfully.")
  }

  // NOTE: RLS Policies for Storage cannot be fully managed via JS Client usually (requires SQL).
  // However, we can TRY to just rely on the bucket being PUBLIC for reads.
  // For uploads, we need to ensure the user is authenticated.
  // The 'public: true' flag allows public downloads.
  // Uploads usually require an RLS policy.
  
  console.log('Legacy Check: Please ensure you have run the SQL to enable storage policies if uploads still fail.')
  console.log('Setup Complete.')
}

setupStorage()

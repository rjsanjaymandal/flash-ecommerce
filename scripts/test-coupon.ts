import { createAdminClient } from '../lib/supabase/admin';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCoupon() {
  console.log("Initializing Admin Client...");
  const supabase = createAdminClient();

  const code = `TEST_DEL_${Date.now()}`;
  
  console.log(`Creating coupon ${code}...`);
  const { data, error: createError } = await supabase
    .from('coupons')
    .insert({
      code,
      discount_type: 'fixed',
      value: 100,
      active: true
    })
    .select()
    .single();

  if (createError) {
    console.error("Creation Failed:", JSON.stringify(createError, null, 2));
    return;
  }
  
  console.log("Coupon created:", data.id);

  console.log("Attempting to delete...");
  const { error: deleteError } = await supabase
    .from('coupons')
    .delete()
    .eq('id', data.id);

  if (deleteError) {
    console.error("Deletion Failed:", JSON.stringify(deleteError, null, 2));
  } else {
    console.log("Deletion Successful!");
  }
}

testCoupon();

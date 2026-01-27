import { createClient } from './lib/supabase/server';
import { getLinearCategories } from './lib/services/category-service';

async function diagnose() {
  const categories = await getLinearCategories(true);
  console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  const { data: products, error } = await (await createClient())
    .from('products')
    .select('id, name, category_id')
    .limit(5);
  
  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Sample Products:', products);
  }
}

diagnose();

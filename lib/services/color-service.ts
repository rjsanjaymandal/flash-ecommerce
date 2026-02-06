
import { createClient } from "@/lib/supabase/server";

export interface ProductColor {
  id: string;
  name: string;
  hex_code: string;
  created_at?: string;
}

export async function getProductColors(): Promise<ProductColor[]> {
  const supabase = (await createClient());
  const { data, error } = await supabase
    .from("product_colors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching product colors:", error);
    return [];
  }

  return data || [];
}

export async function addProductColor(name: string, hexCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_colors")
    .insert([{ name, hex_code: hexCode }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updateProductColor(id: string, name: string, hexCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_colors")
    .update({ name, hex_code: hexCode, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function deleteProductColor(id: string) {
  const supabase = await createClient();
  
  // Optional: Check if color is in use in product_stock
  // For now, simpler delete
  const { error } = await supabase
    .from("product_colors")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

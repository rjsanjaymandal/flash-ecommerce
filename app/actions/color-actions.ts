
"use server";

import { 
  addProductColor, 
  updateProductColor, 
  deleteProductColor 
} from "@/lib/services/color-service";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";

export async function addColorAction(name: string, hexCode: string) {
  return createSafeAction("addColorAction", { name, hexCode }, async ({ name, hexCode }) => {
    const result = await addProductColor(name, hexCode);
    if (result.error) throw new Error(result.error);
    revalidatePath("/admin/products/colors");
    return result.data;
  });
}

export async function updateColorAction(id: string, name: string, hexCode: string) {
  return createSafeAction("updateColorAction", { id, name, hexCode }, async ({ id, name, hexCode }) => {
    const result = await updateProductColor(id, name, hexCode);
    if (result.error) throw new Error(result.error);
    revalidatePath("/admin/products/colors");
    return result.data;
  });
}

export async function deleteColorAction(id: string) {
  return createSafeAction("deleteColorAction", { id }, async ({ id }) => {
    const result = await deleteProductColor(id);
    if (result.error) throw new Error(result.error);
    revalidatePath("/admin/products/colors");
    return { success: true };
  });
}

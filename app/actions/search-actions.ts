'use server'

// Canonical search implementation is in search-products.ts (RPC-backed).
// Keep this module as a compatibility wrapper to avoid breaking imports.
import {
  getSearchIndex as getSearchIndexCanonical,
  searchProducts as searchProductsCanonical,
} from './search-products'

export async function getSearchIndex() {
  return getSearchIndexCanonical()
}

export async function searchProducts(query: string) {
  return searchProductsCanonical(query)
}

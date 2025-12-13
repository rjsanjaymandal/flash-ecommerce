'use client'

import React from 'react'
import ProductForm from '@/components/admin/products/product-form'
import StockManager from '@/components/admin/products/stock-manager'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
  const { id } = useParams()
  
  if (!id) return <div>Invalid ID</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      <ProductForm productId={id as string} />
      
      <div className="pt-6 border-t border-border">
         <StockManager productId={id as string} />
      </div>
    </div>
  )
}

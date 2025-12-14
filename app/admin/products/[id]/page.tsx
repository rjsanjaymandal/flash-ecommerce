'use client'

import React from 'react'
import ProductForm from '@/components/admin/products/product-form'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
  const { id } = useParams()
  
  if (!id) return <div>Invalid ID</div>

  return (
    <div className="space-y-6">
      <ProductForm productId={id as string} />
    </div>
  )
}

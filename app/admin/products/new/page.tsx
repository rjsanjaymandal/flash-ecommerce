import ProductForm from '@/components/admin/products/product-form'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      <ProductForm />
    </div>
  )
}

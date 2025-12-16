import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { MobileNav } from '@/components/storefront/mobile-nav'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

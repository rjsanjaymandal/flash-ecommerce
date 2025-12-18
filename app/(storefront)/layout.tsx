import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { MobileNav } from '@/components/storefront/mobile-nav'
import { CommandMenu } from '@/components/search/command-menu'
import { PageTransition } from '@/components/storefront/page-transition'

export default function StorefrontLayout({
  children,
}: {
  // Layout for storefront
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16 pb-20 lg:pb-0">
        <PageTransition>
            {children}
        </PageTransition>
      </main>
      <Footer />
      <MobileNav />
      <CommandMenu />
    </div>
  )
}

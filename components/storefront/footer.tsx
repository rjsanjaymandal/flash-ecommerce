'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* TOP SECTION: BRAND & NEWSLETTER */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
            <div className="space-y-4 max-w-sm">
                <Link href="/" className="inline-block">
                    <h3 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary via-purple-500 to-pink-500">
                        FLASH
                    </h3>
                </Link>
                <p className="text-muted-foreground text-base leading-relaxed">
                    Redefining fashion with bold, inclusive styles for everyone. Quality meets unapologetic self-expression.
                </p>
                <div className="flex gap-2 pt-2">
                    {[
                        { Icon: Instagram, href: "https://www.instagram.com/flashhfashion/" },
                        { Icon: Twitter, href: "#" },
                        { Icon: Facebook, href: "#" }
                    ].map(({ Icon, href }, i) => (
                        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-input flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 cursor-pointer group">
                             <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </a>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md bg-muted/30 p-6 rounded-2xl border border-border/50">
                <h4 className="font-bold text-lg mb-2">Stay in the Loop</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Subscribe for exclusive drops, early access, and 10% off your first order.
                </p>
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                    <Input 
                        placeholder="Enter your email" 
                        className="bg-background border-border/50 h-12 focus-visible:ring-primary" 
                    />
                    <Button size="icon" className="h-12 w-12 shrink-0 rounded-lg">
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>

        {/* MIDDLE SECTION: LINKS (Grid on Desktop, Accordion on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 border-t border-border/50 pt-12 mb-12">
             <FooterSection title="Shop">
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/shop" className="hover:text-primary transition-colors block py-1">All Products</Link></li>
                    <li><Link href="/shop?sort=newest" className="hover:text-primary transition-colors block py-1">New Arrivals</Link></li>
                    <li><Link href="/shop/clothing" className="hover:text-primary transition-colors block py-1">Clothing Collectons</Link></li>
                    <li><Link href="/shop/accessories" className="hover:text-primary transition-colors block py-1">Accessories</Link></li>
                </ul>
             </FooterSection>

             <FooterSection title="Company">
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/about" className="hover:text-primary transition-colors block py-1">Our Story</Link></li>
                    <li><Link href="/careers" className="hover:text-primary transition-colors block py-1">Careers</Link></li>
                    <li><Link href="/press" className="hover:text-primary transition-colors block py-1">Press</Link></li>
                    <li><Link href="/sustainability" className="hover:text-primary transition-colors block py-1">Sustainability</Link></li>
                </ul>
             </FooterSection>

             <FooterSection title="Support">
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/contact" className="hover:text-primary transition-colors block py-1">Contact Us</Link></li>
                    <li><Link href="/faq" className="hover:text-primary transition-colors block py-1">FAQ</Link></li>
                    <li><Link href="/shipping" className="hover:text-primary transition-colors block py-1">Shipping & Returns</Link></li>
                    <li><Link href="/size-guide" className="hover:text-primary transition-colors block py-1">Size Guide</Link></li>
                </ul>
             </FooterSection>

             <FooterSection title="Legal">
                <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><Link href="/privacy" className="hover:text-primary transition-colors block py-1">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-primary transition-colors block py-1">Terms of Service</Link></li>
                    <li><Link href="/cookies" className="hover:text-primary transition-colors block py-1">Cookie Policy</Link></li>
                    <li><Link href="/accessibility" className="hover:text-primary transition-colors block py-1">Accessibility</Link></li>
                </ul>
             </FooterSection>
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
          <p>&copy; {new Date().getFullYear()} Flash Ecommerce. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <span>San Francisco, CA</span>
             <span className="hidden md:inline-block w-1 h-1 bg-border rounded-full" />
             <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Helper Component for Mobile Accordion / Desktop Column
function FooterSection({ title, children }: { title: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-border/50 md:border-none pb-4 md:pb-0">
            {/* Mobile Header (Clickable) */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center justify-between w-full md:hidden py-2"
            >
                <h4 className="font-bold text-lg">{title}</h4>
                <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {/* Desktop Header (Static) */}
            <h4 className="font-bold text-lg mb-6 hidden md:block">{title}</h4>

            {/* Mobile Content (Collapsible) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="pt-2 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Content (Always Visible) */}
            <div className="hidden md:block">
                {children}
            </div>
        </div>
    )
}

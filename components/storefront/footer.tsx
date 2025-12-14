import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                FLASH
            </h3>
            <p className="text-muted-foreground text-sm">
              Redefining fashion with bold, inclusive styles for everyone. Quality meets expression.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="hover:text-primary rounded-full">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary rounded-full">
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop/clothing" className="hover:text-primary transition-colors">Clothing</Link></li>
              <li><Link href="/shop/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4">Stay in the Loop</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive drops and 10% off your first order.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" className="bg-background" />
              <Button size="icon"><Mail className="h-4 w-4" /></Button>
            </div>
          </div>

        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Flash Ecommerce. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

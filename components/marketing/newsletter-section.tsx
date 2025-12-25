'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/marketing-actions'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import FlashImage from '@/components/ui/flash-image'

export function NewsletterSection() {
    async function action(formData: FormData) {
        const res = await subscribeToNewsletter(formData)
        if (res?.error) {
            toast.error(res.error)
        } else {
            if (res?.message) {
                 toast.info(res.message)
            } else {
                 toast.success("Subscribed successfully!")
            }
        }
    }

  return (
    <section className="relative overflow-hidden bg-muted/20 py-16 sm:py-24 border-t border-border/40">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden md:grid md:grid-cols-2 md:items-center border border-[#b91c1c]/30 relative group christmas-glow">
                <div className="p-8 sm:p-12 lg:p-16 relative z-10">
                    <div className="max-w-xl text-center md:text-left">
                         <h2 className="text-3xl font-black text-foreground sm:text-4xl uppercase tracking-tighter italic">
                            Unlock Festive <br/><span className="text-[#b91c1c]">Drops 🎁</span>
                        </h2>

                        <p className="mt-4 text-muted-foreground leading-relaxed font-medium">
                            Join our community to get early access to new collections, secret sales, and style tips delivered straight to your inbox. No spam, ever.
                        </p>

                        <form action={action} className="mt-8">
                            <div className="relative flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <label htmlFor="email" className="sr-only"> Email Address </label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="john@example.com"
                                        required
                                        className="h-14 w-full rounded-2xl border-border bg-muted/50 px-6 text-sm font-medium shadow-sm transition hover:bg-card focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                 <Button 
                                    type="submit" 
                                    className="h-14 group rounded-2xl bg-[#b91c1c] px-8 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#991b1b] hover:shadow-lg focus:outline-none focus:ring focus:ring-red-400 shadow-xl shadow-red-900/20"
                                >
                                    <span className="mr-2">Join The List</span>
                                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
                
                 <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 bg-muted overflow-hidden">
                     <FlashImage 
                        src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Newsletter exclusive" 
                        fill
                        className="object-cover opacity-90 transition hover:opacity-100 duration-700 mix-blend-overlay grayscale group-hover:grayscale-0" 
                    />
                     <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent" />
                     {/* Floating Festive Accents */}
                     <div className="absolute top-10 right-10 text-4xl animate-bounce opacity-40 group-hover:opacity-100 transition-opacity">🎄</div>
                     <div className="absolute bottom-10 right-20 text-4xl animate-pulse opacity-40 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '1s' }}>❄️</div>
                </div>
            </div>
        </div>
    </section>
  )
}

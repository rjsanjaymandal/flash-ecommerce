'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/marketing-actions'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

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
    <section className="relative overflow-hidden bg-gray-50 py-16 sm:py-24 border-t border-gray-200">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:grid md:grid-cols-2 md:items-center">
                <div className="p-8 sm:p-12 lg:p-16">
                    <div className="max-w-xl text-center md:text-left">
                         <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                            Unlock Exclusive Drops
                        </h2>

                        <p className="mt-4 text-gray-500 leading-relaxed">
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
                                        className="h-12 w-full rounded-full border-gray-200 bg-gray-50 px-6 text-sm font-medium shadow-sm transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="h-12 group rounded-full bg-indigo-600 px-8 text-sm font-medium text-white transition hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring focus:ring-indigo-400"
                                >
                                    <span className="mr-2">Subscribe</span>
                                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
                
                 {/* Decorative Image Side */}
                <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 bg-indigo-50">
                     <img 
                        src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Newsletter exclusive" 
                        className="h-full w-full object-cover opacity-90 transition hover:opacity-100 duration-700" 
                    />
                     <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
                </div>
            </div>
        </div>
    </section>
  )
}

import { ContactForm } from '@/components/storefront/contact-form'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | Flash Store',
  description: 'Get in touch with the Flash team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 animate-in slide-in-from-top-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                GET IN <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-600">TOUCH</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Have a question or just want to verify your vibe? We're here.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Left: Contact Info */}
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-700 delay-100">
                <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-md border border-white/20 p-8 shadow-sm group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-blue-500/10 to-transparent rounded-bl-full -mr-8 -mt-8" />
                    
                    <h3 className="text-2xl font-bold mb-6">Contact Info</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Headquarters</h4>
                                <p className="text-muted-foreground text-sm mt-1">
                                    123 Flash Avenue, Vibe City<br />
                                    Creative District, FC 90210
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Phone</h4>
                                <p className="text-muted-foreground text-sm mt-1">
                                    +1 (555) 123-4567
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Email</h4>
                                <p className="text-muted-foreground text-sm mt-1">
                                    hello@flashstore.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-sm text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-start gap-4">
                         <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                            <h4 className="font-bold">Business Hours</h4>
                            <div className="space-y-1 mt-2 text-sm text-zinc-400">
                                <div className="flex justify-between w-48">
                                    <span>Mon - Fri</span>
                                    <span className="text-white font-medium">9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between w-48">
                                    <span>Sat</span>
                                    <span className="text-white font-medium">10:00 AM - 4:00 PM</span>
                                </div>
                                <div className="flex justify-between w-48">
                                    <span>Sun</span>
                                    <span className="text-zinc-600">Closed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="animate-in slide-in-from-right-4 duration-700 delay-200">
                <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8 shadow-lg shadow-black/5">
                    <h3 className="text-2xl font-black mb-2">Send Message</h3>
                    <p className="text-muted-foreground mb-8 text-sm">
                        Fill out the form below and we'll get back to you within 24 hours.
                    </p>
                    <ContactForm />
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}

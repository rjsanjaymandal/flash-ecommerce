'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsLoading(false)
    toast.success('Message sent!', {
      description: 'We will get back to you as soon as possible.',
    })
    
    // Reset form
    const form = event.target as HTMLFormElement
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="first-name" className="text-sm font-bold text-muted-foreground ml-4">
                First Name
            </Label>
            <Input 
                id="first-name" 
                placeholder="Jane" 
                required 
                className="rounded-full bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:border-primary focus:ring-primary/20 h-10 px-4"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="last-name" className="text-sm font-bold text-muted-foreground ml-4">
                Last Name
            </Label>
            <Input 
                id="last-name" 
                placeholder="Doe" 
                required 
                className="rounded-full bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:border-primary focus:ring-primary/20 h-10 px-4"
            />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-bold text-muted-foreground ml-4">
            Email
        </Label>
        <Input 
            id="email" 
            type="email" 
            placeholder="jane@example.com" 
            required 
            className="rounded-full bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:border-primary focus:ring-primary/20 h-10 px-4"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-bold text-muted-foreground ml-4">
            Message
        </Label>
        <Textarea 
            id="message" 
            placeholder="How can we help you?" 
            required 
            className="rounded-3xl bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:border-primary focus:ring-primary/20 min-h-[150px] px-4 py-4 resize-y"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
      >
        {isLoading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
        ) : (
            <>
                Send Message <Send className="ml-2 h-4 w-4" />
            </>
        )}
      </Button>
    </form>
  )
}

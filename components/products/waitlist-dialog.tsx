'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WaitlistDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (email: string) => Promise<void>
    isSubmitting: boolean
    initialEmail?: string
}

export function WaitlistDialog({ open, onOpenChange, onSubmit, isSubmitting, initialEmail = '' }: WaitlistDialogProps) {
    const [email, setEmail] = useState(initialEmail)

    // Update email state if initialEmail changes (e.g. loaded from localStorage later)
    useEffect(() => {
        if (initialEmail) setEmail(initialEmail)
    }, [initialEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Allow empty email (Anonymous join)
        await onSubmit(email)
        // Don't clear email if they provided it, so they remember. If empty, keep empty.
        if (!email) setEmail('') 
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join the Waitlist</DialogTitle>
                    <DialogDescription>
                        Enter your email to be notified when this product is back in stock.
                        <br/>
                        <span className="text-xs text-muted-foreground">You can also join anonymously without an email.</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com (Optional)"
                            className="col-span-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Joining...' : 'Notify Me'}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface ShareButtonProps {
    title: string
    text?: string
    url?: string
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: text || `Check out ${title}`,
                    url: shareUrl
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            handleCopy()
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-border hover:bg-muted"
            onClick={handleShare}
            aria-label="Share product"
        >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        </Button>
    )
}

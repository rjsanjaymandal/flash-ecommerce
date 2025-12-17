'use client'

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function SignOutButton() {
    const router = useRouter()
    
    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <Button onClick={handleSignOut} variant="outline" className="gap-2 rounded-full font-bold">
            <LogOut className="h-4 w-4" />
            Sign Out
        </Button>
    )
}

'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        setError(error.message)
        setLoading(false)
    } else {
        router.push('/')
        router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl border border-border shadow-lg">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tighter bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                    FLASH
                </h1>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-muted-foreground">Login to access your account</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </form>

             <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </div>
             <div className="text-center text-xs text-muted-foreground mt-4">
                <p>Admin Login: Use an account with admin privileges.</p>
            </div>
        </div>
    </div>
  )
}

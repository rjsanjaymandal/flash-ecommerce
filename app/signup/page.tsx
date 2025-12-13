'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Sign up with Supabase
    // Note: We use metadata for full_name which our trigger will use to create the profile
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    })

    if (error) {
        setError(error.message)
        setLoading(false)
    } else {
        // Since email confirmation might be on by default in Supabase, 
        // check if session exists. If not, tell user to check email.
        // For local dev, normally it auto-confirms or we see session unless configured otherwise.
        
        // We'll assume auto-confirm or just redirect to login with a message.
        // If session is established immediately (auto confirm on):
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
             router.push('/')
        } else {
            alert('Please check your email to confirm your account.')
            router.push('/login')
        }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl border border-border shadow-lg">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tighter bg-linear-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                    FLASH
                </h1>
                <h2 className="text-2xl font-bold">Join the Community</h2>
                <p className="text-muted-foreground">Create your account today</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                    />
                </div>
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
                        minLength={6}
                    />
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>

             <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login
                </Link>
            </div>
        </div>
    </div>
  )
}

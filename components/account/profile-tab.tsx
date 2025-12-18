'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateProfile } from "@/app/actions/user-actions"
import { toast } from "sonner"
import { User } from "lucide-react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { motion } from "framer-motion"
import { BrandBadge } from "@/components/storefront/brand-badge"

export function ProfileTab({ user, profile }: { user: any, profile: any }) {
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateProfile(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(res.message)
        }
        setLoading(false)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-5 md:p-8 rounded-[2.5rem] bg-zinc-50 border-2 border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        {profile?.name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full border-4 border-zinc-50 flex items-center justify-center shadow-lg">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                </div>

                <div className="text-center md:text-left space-y-2">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                        {profile?.role === 'admin' && (
                             <BrandBadge variant="primary" className="text-[9px]">Admin Access</BrandBadge>
                        )}
                        {profile?.fit_preference && profile.fit_preference !== 'none' && (
                             <BrandBadge variant="accent" className="text-[9px]">{profile.fit_preference} Fit</BrandBadge>
                        )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic leading-none">
                        {profile?.name || 'Fashion Insider'}
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm">{user.email}</p>
                </div>
            </motion.div>

            <form action={onSubmit} className="space-y-8 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Display Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            defaultValue={profile?.name || ''} 
                            placeholder="John Doe" 
                            className="h-14 rounded-2xl border-2 focus:ring-primary/20 bg-zinc-50/50"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-3">
                        <Label htmlFor="pronouns" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Pronouns</Label>
                        <Input 
                            id="pronouns" 
                            name="pronouns" 
                            defaultValue={profile?.pronouns || ''} 
                            placeholder="they/them" 
                            className="h-14 rounded-2xl border-2 focus:ring-primary/20 bg-zinc-50/50"
                        />
                    </motion.div>
                </div>

                <motion.div variants={itemVariants} className="space-y-3">
                     <Label htmlFor="fit_preference" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Fit Preference</Label>
                     <Select name="fit_preference" defaultValue={profile?.fit_preference || 'none'}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 focus:ring-primary/20 bg-zinc-50/50">
                            <SelectValue placeholder="Select your vibe" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 shadow-2xl">
                            <SelectItem value="none">No Preference</SelectItem>
                            <SelectItem value="oversized">Oversized</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="fitted">Fitted</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1 opacity-60">We'll use this to calibrate your style recommendations.</p>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                     <Button 
                        disabled={loading} 
                        type="submit" 
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gradient-primary shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
                     >
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            "Save Profile Changes"
                        )}
                     </Button>
                </motion.div>
            </form>
        </motion.div>
    )
}

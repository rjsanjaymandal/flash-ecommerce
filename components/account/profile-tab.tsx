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

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                 <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                    {profile?.name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{profile?.name || 'Fashionista'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                        {profile?.role === 'admin' && (
                             <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] uppercase font-bold tracking-wider">
                                ADMIN
                             </span>
                        )}
                        {profile?.fit_preference && (
                             <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] uppercase font-bold tracking-wider">
                                {profile.fit_preference} FIT
                             </span>
                        )}
                    </div>
                </div>
            </div>

            <form action={onSubmit} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" name="name" defaultValue={profile?.name || ''} placeholder="John Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pronouns">Pronouns</Label>
                        <Input id="pronouns" name="pronouns" defaultValue={profile?.pronouns || ''} placeholder="they/them" />
                    </div>
                </div>

                <div className="space-y-2">
                     <Label htmlFor="fit_preference">Fit Preference</Label>
                     <Select name="fit_preference" defaultValue={profile?.fit_preference || 'none'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your vibe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Preference</SelectItem>
                            <SelectItem value="oversized">Oversized</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="fitted">Fitted</SelectItem>
                        </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">We'll use this to recommend sizes.</p>
                </div>

                <div className="pt-4">
                     <Button disabled={loading} type="submit" className="w-full sm:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                     </Button>
                </div>
            </form>
        </div>
    )
}

'use client'

import { Button } from "@/components/ui/button"
import { MapPin, Phone, Trash2, CheckCircle2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteAddress, setDefaultAddress } from "@/app/actions/address-actions"
import { toast } from "sonner"
import { Tables } from "@/types/supabase"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AddressCardProps {
    address: Tables<'addresses'>
}

export function AddressCard({ address }: AddressCardProps) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this address?")) return
        setLoading(true)
        const res = await deleteAddress(address.id)
        if (res.error) toast.error(res.error)
        else toast.success("Address deleted")
        setLoading(false)
    }

    const handleSetDefault = async () => {
        setLoading(true)
        const res = await setDefaultAddress(address.id)
        if (res.error) toast.error(res.error)
        else toast.success("Default address updated")
        setLoading(false)
    }

    return (
        <div className={cn(
            "group relative p-6 rounded-3xl border-2 transition-all duration-300",
            address.is_default 
                ? "bg-primary border-primary text-primary-foreground shadow-xl scale-[1.02]" 
                : "bg-card border-border/50 hover:border-border hover:shadow-lg"
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        address.is_default ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted text-foreground"
                    )}>
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg leading-none text-foreground">{address.name}</h3>
                        <p className={cn("text-xs font-bold uppercase tracking-wider mt-1", address.is_default ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {address.city}, {address.state}
                        </p>
                    </div>
                </div>
                {address.is_default && (
                    <Badge className="bg-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground border-0 uppercase tracking-widest text-[9px] font-bold px-3">
                        Default
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="space-y-1 mb-6">
                <p className={cn("text-sm font-medium leading-relaxed", address.is_default ? "text-primary-foreground/90" : "text-muted-foreground")}>
                    {address.address_line1} {address.address_line2 && <br />}
                    {address.address_line2}
                </p>
                <p className={cn("text-sm font-medium", address.is_default ? "text-primary-foreground/90" : "text-muted-foreground")}>
                    {address.city} - {address.pincode}
                </p>
                <div className={cn("flex items-center gap-2 mt-2 pt-2 border-t", address.is_default ? "border-primary-foreground/10 text-primary-foreground/70" : "border-border/50 text-muted-foreground")}>
                    <Phone className="h-3 w-3" />
                    <span className="text-xs font-bold tracking-wider">{address.phone}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {!address.is_default && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSetDefault}
                        disabled={loading}
                        className="flex-1 rounded-xl h-9 hover:bg-muted text-muted-foreground font-bold text-xs uppercase"
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set Default"}
                    </Button>
                )}
                
                {/* Delete Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDelete}
                    disabled={loading}
                    className={cn(
                        "h-9 w-9 rounded-xl transition-colors",
                        address.is_default 
                            ? "hover:bg-primary-foreground/10 text-primary-foreground/50 hover:text-red-200" 
                            : "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                    )}
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

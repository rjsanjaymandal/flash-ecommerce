'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MapPin } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addAddress } from "@/app/actions/address-actions"
import { toast } from "sonner"
import { Tables } from "@/types/supabase"
import { AddressCard } from "@/components/account/address-card"
import { Loader2 } from "lucide-react"

export function AddressTab({ addresses }: { addresses: Tables<'addresses'>[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await addAddress(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Address added successfully")
            setOpen(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Shipping Profiles</span>
                     <h2 className="text-3xl font-black tracking-tighter uppercase italic mt-1">Address Book</h2>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full h-12 px-6 font-black uppercase tracking-widest text-xs gradient-primary shadow-xl">
                            <Plus className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-2 border-border/50 bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic text-foreground">New Location</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Add a new shipping destination to your vault.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form action={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required className="rounded-xl bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Phone</Label>
                                    <Input id="phone" name="phone" placeholder="+91 9999999999" required className="rounded-xl bg-muted/50 border-border/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line1" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Address Line 1</Label>
                                <Input id="address_line1" name="address_line1" placeholder="Flat / House No. / Building" required className="rounded-xl bg-muted/50 border-border/50" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address_line2" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Address Line 2 (Optional)</Label>
                                <Input id="address_line2" name="address_line2" placeholder="Street / Area / Landmark" className="rounded-xl bg-muted/50 border-border/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">City</Label>
                                    <Input id="city" name="city" required className="rounded-xl bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Pincode</Label>
                                    <Input id="pincode" name="pincode" required className="rounded-xl bg-muted/50 border-border/50" />
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">State</Label>
                                    <Input id="state" name="state" required className="rounded-xl bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Country</Label>
                                    <Input id="country" name="country" defaultValue="India" disabled className="rounded-xl bg-muted/50 border-border/50 opacity-60" />
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="is_default" name="is_default" />
                                <Label htmlFor="is_default" className="text-xs font-bold uppercase tracking-wider cursor-pointer text-muted-foreground">Set as default address</Label>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full rounded-xl font-black uppercase tracking-widest h-12 mt-2">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Address"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {addresses.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-border/50 bg-muted/20">
                    <div className="h-16 w-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-xl border border-border/10">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-black text-xl mb-1 uppercase tracking-tight text-foreground">No Addresses Found</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-6">Add a shipping address to speed up checkout.</p>
                    <Button variant="outline" onClick={() => setOpen(true)} className="rounded-full font-bold uppercase text-[10px] tracking-widest border-2">
                        Add First Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addresses.map((addr) => (
                        <AddressCard key={addr.id} address={addr} />
                    ))}
                </div>
            )}
        </div>
    )
}

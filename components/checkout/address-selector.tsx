"use client";

import { useState, useEffect } from "react";
import {
  getAddresses,
  addAddress,
  Address,
} from "@/lib/services/address-service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressSelectorProps {
  onSelect: (address: Address, options?: { silent?: boolean }) => void;
}

export function AddressSelector({ onSelect }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (addr: Address, options?: { silent?: boolean }) => {
    setSelectedId(addr.id);
    onSelect(addr, options);
  };

  const loadAddresses = async () => {
    const data = await getAddresses();
    setAddresses(data);
    setLoading(false);
    // Auto-select default
    const defaultAddr = data.find((a) => a.is_default) || data[0];
    if (defaultAddr && !selectedId) {
      handleSelect(defaultAddr, { silent: true });
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async (formData: FormData) => {
    const res = await addAddress(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Address added!");
      setDialogOpen(false);
      loadAddresses();
    }
  };

  if (loading)
    return (
      <div className="text-sm text-muted-foreground">Loading addresses...</div>
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            onClick={() => handleSelect(addr)}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-all hover:border-primary/50 relative",
              selectedId === addr.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            {selectedId === addr.id && (
              <div className="absolute top-2 right-2 text-primary">
                <Check className="h-4 w-4" />
              </div>
            )}
            <div className="flex items-center gap-2 font-bold mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {addr.name}
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px] truncate">
              {addr.address_line1}, {addr.city}
            </p>
            {addr.is_default && (
              <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full mt-2 inline-block">
                Default
              </span>
            )}
          </div>
        ))}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-[100px] w-full border-dashed flex flex-col gap-2 hover:bg-muted/50 rounded-xl"
            >
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground">Add New Address</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form action={handleAddAddress} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    name="address1"
                    placeholder="Street, Sector"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    name="address2"
                    placeholder="Appartment, Landmark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="flex items-center space-x-2 col-span-2 pt-2">
                  <Checkbox id="is_default" name="is_default" />
                  <Label htmlFor="is_default">Set as default address</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Save Address
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

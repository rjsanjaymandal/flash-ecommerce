'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SizeGuideModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SizeGuideModal({ open, onOpenChange }: SizeGuideModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Size Guide</DialogTitle>
                    <DialogDescription>
                        All measurements are in inches. Fits true to size.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="border rounded-xl overflow-hidden mt-4">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Size</TableHead>
                                <TableHead className="font-bold">Chest</TableHead>
                                <TableHead className="font-bold">Length</TableHead>
                                <TableHead className="font-bold">Shoulder</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                <TableRow key={size}>
                                    <TableCell className="font-medium">{size}</TableCell>
                                    <TableCell>{34 + (['XS','S','M','L','XL','XXL'].indexOf(size) * 2)}</TableCell>
                                    <TableCell>{26 + (['XS','S','M','L','XL','XXL'].indexOf(size))}</TableCell>
                                    <TableCell>{16 + (['XS','S','M','L','XL','XXL'].indexOf(size))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
                    <p><strong>Pro Tip:</strong> If you prefer an oversized fit (thug life aesthetic), go one size up.</p>
                    <p>Model is 6'1" and wearing size L.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

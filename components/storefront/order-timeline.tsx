import { CheckCircle2, Package, Truck, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineProps {
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
    created_at: string
    updated_at: string
}

export function OrderTimeline({ status, created_at, updated_at }: TimelineProps) {
    const steps = [
        { id: 'pending', label: 'Order Placed', icon: Clock },
        { id: 'paid', label: 'Processing', icon: Package },
        { id: 'shipped', label: 'Shipped', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    ]

    const getCurrentStepIndex = () => {
        if (status === 'cancelled') return -1
        return steps.findIndex(s => s.id === status)
    }

    const currentStep = getCurrentStepIndex()
    const isCancelled = status === 'cancelled'

    if (isCancelled) {
        return (
            <div className="w-full py-8 text-center bg-red-50 rounded-xl border border-red-100">
                <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-red-900">Order Cancelled</h3>
                <p className="text-red-700">This order has been cancelled.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="relative flex justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-muted -z-10 rounded-full" />
                
                {/* Active Progress Bar */}
                <div 
                    className="absolute top-5 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = index <= currentStep
                    const isCurrent = index === currentStep

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-background",
                                isActive ? "border-primary text-primary-foreground bg-primary" : "border-muted text-muted-foreground",
                                isCurrent && "ring-4 ring-primary/20 scale-110"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-semibold transition-colors duration-300 absolute -bottom-6 w-24 text-center",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

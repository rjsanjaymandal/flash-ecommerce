import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background text-foreground px-4 text-center">
        <h1 className="text-[12rem] font-black leading-none bg-clip-text text-transparent bg-linear-to-b from-primary/20 to-transparent select-none">
            404
        </h1>
        <div className="relative -mt-20 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                Lost in the Void
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg font-medium">
                The page you're searching for has vanished into the digital abyss.
            </p>
            <div className="flex gap-4 justify-center pt-4">
                <Link href="/">
                    <Button size="lg" className="gap-2 rounded-full font-bold uppercase tracking-widest pl-4 pr-6">
                        <Home className="h-4 w-4" />
                        Return Home
                    </Button>
                </Link>
                <Link href="/shop">
                    <Button variant="outline" size="lg" className="rounded-full font-bold uppercase tracking-widest">
                        View Collection
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  )
}

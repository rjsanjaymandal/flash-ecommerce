import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { BrandGlow } from '@/components/storefront/brand-glow'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { Mail, ArrowRight, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Careers at FLASH | Join the Movement',
    description: 'Join the team building the future of inclusive fashion. Current Openings: Marketing Intern.',
}

export default function CareersPage() {
  return (
    <>
      <OrganizationJsonLd />
      <div className="min-h-screen bg-background text-foreground pb-20 overflow-hidden relative">
        <BrandGlow className="top-0 opacity-40" />
        
        {/* Header */}
        <div className="container mx-auto px-4 pt-32 pb-16 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
                Join The <span className="text-gradient">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                We're building more than just a brand. We're building a movement.
                <br />If you're bold, creative, and refuse to settle, you belong here.
            </p>
        </div>

        {/* Values Section */}
        <div className="container mx-auto px-4 mb-20 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 backdrop-blur-sm text-center">
                    <h3 className="text-xl font-black uppercase italic mb-3">Audacious</h3>
                    <p className="text-muted-foreground">We don't ask for permission. We set the standard.</p>
                </div>
                 <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 backdrop-blur-sm text-center">
                    <h3 className="text-xl font-black uppercase italic mb-3">Inclusive</h3>
                    <p className="text-muted-foreground">Fashion for every body, every identity, every vibe.</p>
                </div>
                 <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 backdrop-blur-sm text-center">
                    <h3 className="text-xl font-black uppercase italic mb-3">Relentless</h3>
                    <p className="text-muted-foreground">We iterate fast, ship faster, and never stop improving.</p>
                </div>
             </div>
        </div>

        {/* Current Openings */}
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-wide mb-8 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Current Openings
            </h2>
            
            <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-md transition-all hover:bg-card/80 hover:shadow-2xl hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative z-10">
                    <div className="space-y-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-3">Internship</span>
                            <h3 className="text-3xl font-black uppercase italic">Marketing Intern</h3>
                        </div>
                        <p className="text-muted-foreground max-w-md">
                            Help us tell the FLASH story. You'll work directly with founders to craft campaigns, manage socials, and disrupt the feed.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-zinc-500">
                            <span>• Remote / Hybrid</span>
                            <span>• Stipend Available</span>
                            <span>• 3 Months</span>
                        </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <Button asChild size="lg" className="w-full md:w-auto h-14 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            <a href="mailto:careers@flashhfashion.in?subject=Application for Marketing Intern - [Your Name]">
                                <Mail className="mr-2 h-4 w-4" />
                                Apply Now
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center p-12 rounded-[2.5rem] bg-muted/20 border border-dashed border-border/50">
                <p className="text-lg font-bold text-muted-foreground mb-6">Don't see your role?</p>
                <Button variant="outline" className="h-12 rounded-xl font-bold uppercase tracking-wider border-2" asChild>
                     <a href="mailto:careers@flashhfashion.in?subject=General Application - [Your Name]">
                        Send us your portfolio
                        <ArrowRight className="ml-2 h-4 w-4" />
                     </a>
                </Button>
            </div>
        </div>
      </div>
    </>
  )
}

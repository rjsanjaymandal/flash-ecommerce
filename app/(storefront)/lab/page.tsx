import { createClient } from '@/lib/supabase/server'
import { LabClientView } from '@/components/lab/lab-client-view'

export const metadata = {
  title: 'Future Lab | Flash Ecommerce',
  description: 'The proving ground for our boldest ideas. Explore experimental pieces and vote for what we build next.',
}

export const dynamic = 'force-dynamic'

export default async function FutureLabPage() {
  const supabase = await createClient()

  // 1. Fetch concepts
  const { data: concepts, error: conceptsError } = await supabase
    .from('concepts')
    .select('*')
    .order('created_at', { ascending: false })

  if (conceptsError) {
    console.error('Error fetching concepts:', conceptsError)
  }

  // 2. Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // 3. If logged in, fetch their votes
  let userVotes: string[] = []
  if (user) {
    const { data: votes } = await supabase
      .from('concept_votes')
      .select('concept_id')
      .eq('user_id', user.id)
    
    if (votes) {
      userVotes = votes.map((v: { concept_id: string }) => v.concept_id)
    }
  }

  return (
    <LabClientView 
        concepts={concepts || []} 
        user={user} 
        userVotes={userVotes} 
    />
  )
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function voteForConcept(conceptId: string) {
  const supabase = await createClient()

  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'authentication_required', message: 'You must be logged in to vote.' }
  }

  // 2. Check if they already voted (query concept_votes)
  const { data: existingVote } = await supabase
    .from('concept_votes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('concept_id', conceptId)
    .single()

  if (existingVote) {
    return { error: 'already_voted', message: 'You have already voted for this concept.' }
  }

  // 3. Insert vote
  const { error: insertError } = await supabase
    .from('concept_votes')
    .insert({ user_id: user.id, concept_id: conceptId })

  if (insertError) {
    // Check for unique constraint violation explicitly if RLS allowed read but race happened
    if (insertError.code === '23505') { // unique_violation
        return { error: 'already_voted', message: 'You have already voted for this concept.' }
    }
    console.error('Error inserting vote:', insertError)
    return { error: 'failed_vote', message: 'Failed to record your vote. Please try again.' }
  }

  // 4. Increment the concepts.vote_count (Using Admin Client to bypass RLS)
  const adminClient = createAdminClient()
  
  const { data: concept } = await adminClient
    .from('concepts' as any)
    .select('vote_count')
    .eq('id', conceptId)
    .single() as { data: { vote_count: number } | null, error: any }

  const newCount = (concept?.vote_count || 0) + 1

  const { error: updateError } = await adminClient
    .from('concepts' as any)
    .update({ vote_count: newCount })
    .eq('id', conceptId)

  if (updateError) {
    console.error('Error updating vote count:', updateError)
    // We don't rollback the vote because it IS recorded, just the count is arguably slightly desynced.
    // In a real prod app, we'd use a transaction or RPC.
  }

  // 5. Revalidate the /lab path
  revalidatePath('/lab')
  
  return { success: true }
}

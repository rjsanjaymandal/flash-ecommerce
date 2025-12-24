'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    console.error('Error inserting vote:', insertError)
    return { error: 'failed_vote', message: 'Failed to record your vote. Please try again.' }
  }

  // 4. Increment the concepts.vote_count
  // Fetch current count
  const { data: concept } = await supabase
    .from('concepts')
    .select('vote_count')
    .eq('id', conceptId)
    .single()

  const newCount = (concept?.vote_count || 0) + 1

  const { error: updateError } = await supabase
    .from('concepts')
    .update({ vote_count: newCount })
    .eq('id', conceptId)

  if (updateError) {
    console.error('Error updating vote count:', updateError)
    // Even if this fails, the vote record exists.
  }

  // 5. Revalidate the /lab path
  revalidatePath('/lab')
  
  return { success: true }
}

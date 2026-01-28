'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin' // For admin-only actions
import { revalidatePath, unstable_cache } from 'next/cache'
import { Database } from '@/types/supabase'

type Concept = Database['public']['Tables']['concepts']['Row']
type ConceptInsert = Database['public']['Tables']['concepts']['Insert']
type ConceptUpdate = Database['public']['Tables']['concepts']['Update']

export async function getConcepts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getActiveConcepts() {
    return unstable_cache(
        async () => {
            const supabase = createStaticClient()
            const { data } = await supabase
                .from('concepts')
                .select('*')
                .eq('status', 'voting')
                .order('created_at', { ascending: false })
            return data || []
        },
        ['active-concepts'],
        { tags: ['concepts'], revalidate: 3600 }
    )()
}

export async function createConcept(data: ConceptInsert) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('concepts').insert(data)
  if (error) throw error
  revalidatePath('/admin/concepts')
  revalidatePath('/lab')
}

export async function updateConcept(id: string, data: ConceptUpdate) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('concepts').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/concepts')
  revalidatePath('/lab')
}

export async function deleteConcept(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('concepts').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/concepts')
  revalidatePath('/lab')
}

// Voting Logic
export async function toggleVote(conceptId: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: "Please sign in to vote." }
    }

    // Check if already voted
    const { data: existingVote } = await supabase
        .from('concept_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('concept_id', conceptId)
        .single()

    if (existingVote) {
        // Remove vote - Trigger will handle decrement
        await supabase.from('concept_votes').delete().eq('user_id', user.id).eq('concept_id', conceptId)
    } else {
        // Add vote - Trigger will handle increment
        await supabase.from('concept_votes').insert({ user_id: user.id, concept_id: conceptId })
    }

    revalidatePath('/lab')
    return { success: true }
}

export async function getUserVotes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('concept_votes')
        .select('concept_id')
        .eq('user_id', user.id)
    
    return data?.map(v => v.concept_id) || []
}

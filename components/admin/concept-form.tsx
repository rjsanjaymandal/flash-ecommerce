'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createConcept } from '@/app/actions/admin/manage-concepts'
import { Loader2, UploadCloud } from 'lucide-react'

const conceptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  voteGoal: z.coerce.number().min(1, 'Goal must be at least 1'),
  image: z.any().refine((files) => files?.length > 0, 'Image is required'),
})

type ConceptFormValues = z.infer<typeof conceptSchema>

interface ConceptFormProps {
  onSuccess?: () => void
}

export function ConceptForm({ onSuccess }: ConceptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      title: '',
      description: '',
      voteGoal: 50,
    },
  })

  async function onSubmit(values: ConceptFormValues) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('voteGoal', values.voteGoal.toString())
      formData.append('image', values.image[0])

      const result = await createConcept(formData)

      if (result.success) {
        toast.success('Concept created successfully!')
        form.reset()
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to create concept')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concept Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Gravity-Defying Sneakers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the vision behind this concept..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="voteGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vote Goal</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Mockup Image</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-primary/20">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
                {value && value[0] && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                        Selected: {value[0].name}
                    </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Concept & Uploading...
            </>
          ) : (
            'Launch Concept in Future Lab'
          )}
        </Button>
      </form>
    </Form>
  )
}

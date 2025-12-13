'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setFeedback(data)
      setIsLoading(false)
    }
    fetchFeedback()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : feedback.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">No feedback yet.</TableCell></TableRow>
            ) : (
                feedback.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{item.topic}</TableCell>
                        <TableCell>{item.email || 'Anonymous'}</TableCell>
                        <TableCell className="max-w-md truncate" title={item.message}>{item.message}</TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

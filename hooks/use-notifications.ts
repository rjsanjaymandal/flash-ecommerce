
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    is_read: boolean
    action_url?: string | null
    created_at: string
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        const fetchNotifications = async () => {
             setIsLoading(true)
             const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50)
            
            if (!error && data) {
                setNotifications(data as unknown as Notification[])
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
            setIsLoading(false)
        }

        fetchNotifications()

        // Realtime Subscription
        const channel = supabase
            .channel('notifications-live')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    // Optimistic update
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(prev => prev + 1)
                    
                    // Optional: Toast for high-priority notifications
                    toast.info(newNotif.title, {
                        description: newNotif.message
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }

    }, [user, supabase])

    const markAsRead = async (id: string) => {
        // Optimistic
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
    }

    const markAllAsRead = async () => {
        if (unreadCount === 0) return

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)

        if (!user) return;
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)
    }
    
    const clearAll = async () => {
        // Optimistic
        setNotifications([])
        setUnreadCount(0)

        if (!user) return;
        await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id)
            
        toast.success("Notifications cleared")
    }

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearAll
    }
}

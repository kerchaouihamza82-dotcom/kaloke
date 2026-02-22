'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: number
  content: string
  user_name: string
  avatar_url: string | null
  created_at: string
}

interface CommunityChatProps {
  currentUserName: string
}

export function CommunityChat({ currentUserName }: CommunityChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Load user profile for avatar
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUserAvatar(profile.avatar_url)
        }
      }
    }
    loadUserProfile()
  }, [])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100)

        if (error) throw error
        setMessages(data || [])
      } catch (error) {
        console.error('[v0] Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [])

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((current) => [...current, newMsg])
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage.trim(),
        user_name: currentUserName,
        avatar_url: userAvatar,
      })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('[v0] Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <Card className="flex h-full items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando chat...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user_name === currentUserName
            const userInitial = message.user_name.charAt(0).toUpperCase()
            
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwnMessage ? 'justify-end flex-row-reverse' : 'justify-start'}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {message.avatar_url && (
                    <AvatarImage src={message.avatar_url} alt={message.user_name} />
                  )}
                  <AvatarFallback className="text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-xs font-medium mb-1 opacity-80">
                    {message.user_name}
                  </p>
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-200' : 'text-muted-foreground'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, ThumbsUp, Users, Plus, Trash2, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { addRealtimeSubscription } from "@/lib/fake-supabase/client"
import { toast } from 'sonner'

export default function CommunityPage() {
  const { user, profile, isAdmin } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPosts()
    loadMessages()

    // Subscribe to realtime messages
    const unsub = addRealtimeSubscription('community_messages', (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new])
      }
    })

    return () => { unsub() }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPosts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoadingPosts(false)
  }

  const loadMessages = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoadingMessages(false)
  }

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from('posts').insert({
      user_id: user?.id,
      user_name: profile?.full_name || 'Anonimo',
      user_avatar: null,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      tag: formData.get('tag') as string || 'General',
      likes: 0,
      replies: 0,
    })

    if (error) {
      toast.error('Error al crear publicacion')
    } else {
      toast.success('Publicacion creada')
      setPostDialogOpen(false)
      loadPosts()
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Eliminar esta publicacion?')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', postId)
    toast.success('Publicacion eliminada')
    loadPosts()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return
    const supabase = createClient()

    await supabase.from('community_messages').insert({
      user_id: user.id,
      user_name: profile?.full_name || 'Anonimo',
      user_avatar: null,
      content: newMessage.trim(),
    })

    setNewMessage('')
    // Reload messages since realtime will also add them
    loadMessages()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `Hace ${days}d`
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Comunidad
          </h1>
          <p className="mt-2 text-muted-foreground">
            Conecta con otros estudiantes y comparte conocimientos
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList>
          <TabsTrigger value="chat">Chat Global</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
        </TabsList>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="space-y-0">
          <Card className="flex h-[600px] flex-col">
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Chat de la Comunidad</CardTitle>
                </div>
                <Badge variant="outline">{messages.length} mensajes</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="mb-2 h-10 w-10" />
                    <p>No hay mensajes aun. Se el primero!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.user_id === user?.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                              {msg.user_name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                            <div className="mb-1 flex items-center gap-2">
                              {!isOwn && (
                                <span className="text-xs font-medium text-foreground">
                                  {msg.user_name}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            <div
                              className={`inline-block rounded-xl px-4 py-2 text-sm ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTS TAB */}
        <TabsContent value="posts" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva publicacion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Publicacion</DialogTitle>
                  <DialogDescription>Comparte algo con la comunidad</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Titulo</Label>
                    <Input id="post-title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Contenido</Label>
                    <Textarea id="post-content" name="content" rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-tag">Etiqueta</Label>
                    <Input id="post-tag" name="tag" placeholder="General" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setPostDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Publicar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Publicaciones</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{posts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensajes de Chat</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tus publicaciones</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {posts.filter((p) => p.user_id === user?.id).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts list */}
          {loadingPosts ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-muted-foreground">
                <MessageSquare className="mb-2 h-10 w-10" />
                <p>No hay publicaciones aun</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{post.user_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{post.user_name}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.tag && <Badge>{post.tag}</Badge>}
                        {(isAdmin || post.user_id === user?.id) && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">{post.title}</CardTitle>
                    <CardDescription className="text-foreground/80">{post.content}</CardDescription>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies} respuestas</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

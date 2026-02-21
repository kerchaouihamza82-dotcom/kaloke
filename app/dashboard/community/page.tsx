'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Users, Shield, Loader2 } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import { CommunityChat } from "@/components/community-chat"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Post {
  id: string
  title: string
  content: string
  category: string
  author_name: string
  author_id: string
  likes: number
  comments: number
  created_at: string
}

export default function CommunityPage() {
  const { isAdmin } = useAdmin()
  const [userName, setUserName] = useState('Usuario')
  const [userId, setUserId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const supabase = createClient()

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setPosts(data || [])
      setTotalPosts(data?.length || 0)
    } catch (error) {
      console.error('[v0] Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const displayName = user.user_metadata?.display_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'Usuario'
        setUserName(displayName)
        setUserId(user.id)
      }
    }
    getUserInfo()
    loadPosts()

    // Subscribe to new posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          loadPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId)

      if (error) throw error
      loadPosts()
    } catch (error) {
      console.error('[v0] Error liking post:', error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      loadPosts()
    } catch (error) {
      console.error('[v0] Error deleting post:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userPosts = posts.filter(post => post.author_id === userId).length

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Comunidad
          </h1>
          <p className="mt-2 text-muted-foreground">
            Conecta con otros estudiantes y comparte conocimientos
          </p>
        </div>
        <div className="flex gap-2">
          <CreatePostDialog onPostCreated={loadPosts} />
          {isAdmin && (
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Moderar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+12 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicaciones totales</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">Máximo 10 recientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tus publicaciones</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPosts}</div>
            <p className="text-xs text-muted-foreground">En esta sesión</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat en Tiempo Real */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Chat Comunitario</h2>
        <div className="h-[600px]">
          <CommunityChat currentUserName={userName} />
        </div>
      </div>

      {/* Publicaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Publicaciones recientes</h2>
        
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No hay publicaciones aún</p>
              <p className="text-sm text-muted-foreground">Sé el primero en compartir algo con la comunidad</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(post.author_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge>{post.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="mb-2">{post.title}</CardTitle>
                  <CardDescription>{post.content}</CardDescription>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleLike(post.id, post.likes)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments} respuestas</span>
                    </Button>
                  </div>
                  {(isAdmin || post.author_id === userId) && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

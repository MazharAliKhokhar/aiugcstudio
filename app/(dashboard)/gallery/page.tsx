'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Copy, Play, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function GalleryPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await (supabase.from('videos') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) setVideos(data)
      setLoading(false)
    }
    fetchVideos()
  }, [])

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No videos yet</h2>
        <p className="text-muted-foreground max-w-sm">Generate your first AI Video Ad in the Studio to see it appear here.</p>
        <Link href="/studio">
          <Button>Go to Studio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Ads Gallery</h1>
        <Badge variant="outline">{videos.length} Videos</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[9/16] bg-black relative group">
              {video.status === 'completed' && video.video_url ? (
                <video src={video.video_url} controls className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                  <Badge variant={video.status === 'failed' ? 'destructive' : 'secondary'} className="mb-2">
                    {video.status.toUpperCase()}
                  </Badge>
                  {video.status !== 'failed' && <span className="text-sm">Processing...</span>}
                </div>
              )}
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base line-clamp-2" title={video.prompt}>
                {video.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xs text-muted-foreground mt-1">
                {video.duration}s • {new Date(video.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            {video.status === 'completed' && video.video_url && (
              <CardFooter className="p-4 pt-0 gap-2">
                <a href={video.video_url} download target="_blank" rel="noreferrer" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </a>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="shrink-0" 
                  title="Copy Prompt"
                  onClick={() => {
                    navigator.clipboard.writeText(video.prompt)
                    toast.success('Prompt copied to clipboard!')
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Video, ShieldCheck, Mail, Database, Battery, Trash, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateUserCredits, toggleAdminStatus, deleteVideo, refundVideo } from './actions'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/studio')
  }

  // Fetch all data
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: videosCount } = await supabase.from('videos').select('*', { count: 'exact', head: true })

  const { data: usersList } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: videosList } = await supabase
    .from('videos')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" /> System Admin Control
        </h2>
        <p className="text-muted-foreground mt-2">Maximum control over ViralUGC operations.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted text-muted-foreground w-full justify-start h-12">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-background">User Management</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-background">Video Moderation</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{usersCount || 0}</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos Spawned</CardTitle>
                <Video className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{videosCount || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-zinc-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server Health</CardTitle>
                <Database className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">Online</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Control Panel</CardTitle>
              <CardDescription>View, grant credits, and manage administrative scopes. (Showing latest 50)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium w-[200px]">Credits Balance</th>
                      <th className="px-4 py-3 font-medium text-right">Admin Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList?.map((u: any) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{u.email}</span>
                          {u.id === user.id && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">You</span>}
                        </td>
                        <td className="px-4 py-3">
                          <form action={updateUserCredits} className="flex items-center gap-2">
                            <input type="hidden" name="userId" value={u.id} />
                            <Battery className="w-4 h-4 text-green-500 shrink-0" />
                            <Input 
                              type="number" 
                              name="credits" 
                              defaultValue={u.credits} 
                              className="w-20 h-8 text-sm px-2 bg-background border-muted-foreground/30"
                            />
                            <Button type="submit" size="sm" variant="secondary" className="h-8">Save</Button>
                          </form>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={toggleAdminStatus}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                            <Button 
                              type="submit" 
                              size="sm" 
                              variant={u.is_admin ? 'default' : 'outline'}
                              className={`h-8 text-xs ${u.is_admin ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0' : ''}`}
                            >
                              {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIDEOS TAB */}
        <TabsContent value="videos">
           <Card>
            <CardHeader>
              <CardTitle>Global Video Moderation</CardTitle>
              <CardDescription>Track queue status, refund stuck jobs, or delete generation records. (Showing latest 50)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">User Email</th>
                      <th className="px-4 py-3 font-medium">Raw Prompt</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videosList?.map((video: any) => (
                      <tr key={video.id} className="border-t">
                        <td className="px-4 py-3 font-medium">{video.profiles?.email || 'Unknown'}</td>
                        <td className="px-4 py-3 max-w-[250px] truncate text-muted-foreground text-xs">
                          {video.prompt}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            video.status === 'completed' ? 'border-green-500/20 bg-green-500/10 text-green-500' :
                            video.status === 'failed' ? 'border-red-500/20 bg-red-500/10 text-red-500' :
                            'border-blue-500/20 bg-blue-500/10 text-blue-500 animate-pulse'
                          }`}>
                            {video.status.toUpperCase()} ({video.duration}s)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                             
                            {video.status !== 'completed' && video.status !== 'failed' && (
                              <form action={refundVideo}>
                                <input type="hidden" name="videoId" value={video.id} />
                                <input type="hidden" name="userId" value={video.user_id} />
                                <Button type="submit" size="sm" variant="outline" className="h-8 group">
                                  <RotateCcw className="w-3.5 h-3.5 mr-1 text-orange-500 group-hover:-rotate-90 transition-transform" />
                                  Refund
                                </Button>
                              </form>
                            )}

                            <form action={deleteVideo}>
                              <input type="hidden" name="videoId" value={video.id} />
                              <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 hover:bg-red-500/10 hover:text-red-500">
                                <Trash className="w-4 h-4" />
                              </Button>
                            </form>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

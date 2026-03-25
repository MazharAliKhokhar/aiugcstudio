import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Video, ShieldCheck, Mail, Database, Battery, Trash, RotateCcw, Search, TrendingUp, AlertCircle, CheckCircle2, Plus, History as HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserCredits, toggleAdminStatus, deleteVideo, refundVideo, bulkRefundStuckVideos, createManualUser } from './actions'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
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

  const query = searchParams.q || ''

  // Fetch Stats
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: videosCount } = await supabase.from('videos').select('*', { count: 'exact', head: true })
  
  // Calculate Success Rate
  const { count: successfulVideos } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'completed')
  const { count: failedVideos } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'failed')
  const successRate = videosCount ? Math.round((successfulVideos || 0) / videosCount * 100) : 0

  // Calculate Credit Velocity (Total credits in circ)
  const { data: allCredits } = await supabase.from('profiles').select('credits')
  const totalCredits = allCredits?.reduce((acc, p) => acc + (p.credits || 0), 0) || 0

  // Fetch Users (with search and video count)
  let usersQuery = supabase.from('profiles').select('*, videos!left(id)').order('created_at', { ascending: false }).limit(50)
  if (query) {
    usersQuery = usersQuery.ilike('email', `%${query}%`)
  }
  const { data: rawUsersList } = await usersQuery
  
  const usersList = rawUsersList?.map((u: any) => ({
    ...u,
    videoCount: u.videos?.length || 0
  }))

  // Fetch Credit Logs
  const { data: creditLogs } = await supabase
    .from('credit_logs')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch Videos
  const { data: videosList } = await supabase
    .from('videos')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch Recent Signups (Insights)
  const { data: recentSignups } = await supabase
    .from('profiles')
    .select('email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary animate-pulse" /> ADMIN COMMAND
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">Real-time system insights & operator controls.</p>
        </div>
        
        <form action={async () => {
          'use server'
          await bulkRefundStuckVideos()
        }} className="shrink-0">
          <Button variant="destructive" className="shadow-lg shadow-red-500/20 gap-2 h-12 px-6">
            <AlertCircle className="w-5 h-5" /> Mass Refund Stuck
          </Button>
        </form>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl h-14 w-full md:w-auto justify-start border overflow-x-auto">
          <TabsTrigger value="overview" className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">System Insights</TabsTrigger>
          <TabsTrigger value="users" className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Operator Control</TabsTrigger>
          <TabsTrigger value="videos" className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Video Moderation</TabsTrigger>
          <TabsTrigger value="audit" className="px-6 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Credit Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* INSIGHT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary/20 bg-primary/5 overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary group-hover:scale-125 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{usersCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime registrations</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-500/20 bg-orange-500/5 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generation Success</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500 group-hover:translate-y-[-2px] transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{successRate}%</div>
                <div className="w-full bg-orange-500/10 h-1.5 rounded-full mt-2">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${successRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Velocity</CardTitle>
                <Battery className="h-4 w-4 text-green-500 group-hover:rotate-12 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{totalCredits}</div>
                <p className="text-xs text-muted-foreground mt-1 text-green-600/70">Total credits in system</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-500/20 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server Health</CardTitle>
                <Database className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500 flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  Online
                </div>
                <p className="text-xs text-muted-foreground mt-1">Direct Supabase link active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Recent Signups</CardTitle>
                <CardDescription>The last 5 users to join the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSignups?.map((s: any) => (
                    <div key={s.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{s.email}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
               <CardHeader>
                <CardTitle className="text-lg">System Audit</CardTitle>
                <CardDescription>Real-time performance metrics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Failed Generations</span>
                  <span className="font-mono text-red-500">{failedVideos || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4">
                  <span className="text-muted-foreground">Avg. Credits per User</span>
                  <span className="font-mono">{usersCount ? Math.round(totalCredits / usersCount) : 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4">
                  <span className="text-muted-foreground">System Latency</span>
                  <span className="font-mono text-green-500">Normal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Manual User Onboarding</CardTitle>
              <CardDescription>Register a new user directly into the system with initial credits.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createManualUser} className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="manual-email">Email Address</Label>
                  <Input id="manual-email" name="email" type="email" placeholder="user@example.com" required className="w-64" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-password">Temporary Password</Label>
                  <Input id="manual-password" name="password" type="password" placeholder="••••••••" required className="w-48" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-credits">Initial Credits</Label>
                  <Input id="manual-credits" name="credits" type="number" defaultValue={5} className="w-24" />
                </div>
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Create & Promote User
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Control Panel</CardTitle>
                <CardDescription>Search users, grant credits, and manage administrative scopes.</CardDescription>
              </div>
              <form method="get" className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <Input 
                  name="q" 
                  placeholder="Search email..." 
                  defaultValue={query}
                  className="w-[200px] h-9 bg-transparent border-0 focus-visible:ring-0" 
                />
                {query && (
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => (window.location.href = '/admin')}>
                    Clear
                  </Button>
                )}
              </form>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Operator Profile</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Stats</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Credits Balance</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Status & Scopes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList?.map((u: any) => (
                      <tr key={u.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold flex items-center gap-2">
                              {u.email}
                              {u.id === user.id && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-black">System Self</span>}
                            </span>
                            <span className="text-xs text-muted-foreground">Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex flex-col items-center">
                             <span className="text-lg font-bold">{u.videoCount}</span>
                             <span className="text-[10px] text-muted-foreground uppercase">Videos</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <form action={updateUserCredits} className="flex items-center gap-2 group">
                            <input type="hidden" name="userId" value={u.id} />
                            <div className="relative flex items-center">
                              <Battery className={`w-4 h-4 absolute left-2 pointer-events-none transition-colors ${u.credits > 0 ? 'text-green-500' : 'text-red-500'}`} />
                              <Input 
                                type="number" 
                                name="credits" 
                                defaultValue={u.credits} 
                                className="w-24 h-9 pl-7 bg-background text-sm font-mono border-muted group-hover:border-primary/50 transition-colors"
                              />
                            </div>
                            <Button type="submit" size="sm" variant="secondary" className="h-9 px-4 font-bold border">Update</Button>
                          </form>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <form action={toggleAdminStatus}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                            <Button 
                              type="submit" 
                              size="sm" 
                              variant={u.is_admin ? 'default' : 'outline'}
                              className={`h-9 px-4 text-xs font-bold ${u.is_admin ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'hover:border-primary hover:text-primary transition-all'}`}
                            >
                              {u.is_admin ? 'Revoke Control' : 'Grant Admin'}
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {usersList?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                          <p className="text-muted-foreground font-medium">No system operators found matching your query.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
           <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Video Moderation Engine</CardTitle>
              <CardDescription>Track queue status, refund stuck jobs, or delete generation records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Origin</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Directive (Prompt)</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Runtime Stats</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Intervention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videosList?.map((video: any) => (
                      <tr key={video.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                            <span className="font-bold">{video.profiles?.email || 'System'}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{new Date(video.created_at).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[300px]">
                          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed italic">
                            "{video.prompt}"
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest border shadow-sm ${
                            video.status === 'completed' ? 'border-green-500/20 bg-green-500/10 text-green-500' :
                            video.status === 'failed' ? 'border-red-500/20 bg-red-500/10 text-red-500' :
                            'border-blue-500/20 bg-blue-500/10 text-blue-500 animate-pulse'
                          }`}>
                            {video.status.toUpperCase()} ({video.duration}S)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                             
                            {video.status !== 'completed' && video.status !== 'failed' && (
                              <form action={refundVideo}>
                                <input type="hidden" name="videoId" value={video.id} />
                                <input type="hidden" name="userId" value={video.user_id} />
                                <Button type="submit" size="sm" variant="outline" className="h-9 px-4 font-bold border-orange-500/50 text-orange-600 hover:bg-orange-500/10 transition-colors group">
                                  <RotateCcw className="w-3.5 h-3.5 mr-2 group-hover:-rotate-90 transition-transform" />
                                  Manual Refund
                                </Button>
                              </form>
                            )}

                            <form action={deleteVideo}>
                              <input type="hidden" name="videoId" value={video.id} />
                              <Button type="submit" size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors">
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

        <TabsContent value="audit">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Credit Transaction Ledger</CardTitle>
              <CardDescription>A complete log of manual credit adjustments and system on-boarding events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Timestamp</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Target User</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Amount</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reason/Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditLogs?.map((log: any) => (
                      <tr key={log.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {log.profiles?.email || 'Unknown User'}
                        </td>
                        <td className={`px-6 py-4 text-center font-bold ${log.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {log.amount > 0 ? `+${log.amount}` : log.amount}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="bg-muted px-2 py-1 rounded text-muted-foreground">
                            {log.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!creditLogs || creditLogs.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                          <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                          No credit transactions logged yet.
                        </td>
                      </tr>
                    )}
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


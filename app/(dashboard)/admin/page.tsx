'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, ShieldCheck, Database, Battery, Trash, Search, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { updateUserCredits, toggleAdminStatus, deleteVideo, refundVideo, bulkRefundStuckVideos, createManualUser, getAdminStats, updateVideoDetails, updateUserProfile, deleteUser, syncDatabase } from './actions'
import { RefreshCcw, Edit, ChevronDown, ChevronUp, ExternalLink, XCircle, CheckCircle, Clock, Save, UserMinus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [videoFilter, setVideoFilter] = useState<string>('all')
  const query = searchParams.q || ''

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const stats = await getAdminStats(query)
        setData(stats)
      } catch (err: any) {
        console.error('Fetch error:', err)
        setError(err.message || 'Failed to load system data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query])

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>

  if (error || !data) return (
    <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-xl font-bold">System Access Interrupted</h3>
        <p className="text-muted-foreground">{error || 'Unable to communicate with the mothership'}</p>
      </div>
      <Button onClick={() => window.location.reload()} variant="outline">Retry Command</Button>
    </div>
  )

  const handleAction = async (action: any, formData: FormData) => {
    const res = await action(formData)
    if (res?.success) {
      toast.success(res.message)
      // Hard refresh data or state update
      window.location.reload()
    } else {
      toast.error(res?.message || 'Action failed')
    }
  }

  return (
    <div className="space-y-8 pb-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" /> ADMIN COMMAND
          </h2>
          <p className="text-muted-foreground mt-1 text-base md:text-lg">Real-time system insights & operator controls.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              const res = await syncDatabase()
              if (res.success) {
                toast.success(res.message)
                window.location.reload()
              }
            }}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Sync DB
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap w-full justify-start border border-slate-800 overflow-x-auto gap-1">
          <TabsTrigger value="overview" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Insights</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Operators</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Moderation</TabsTrigger>
          <TabsTrigger value="audit" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-blue-500/20 bg-slate-900 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter">{data.usersCount || 0}</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-500/20 bg-slate-900 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Gen Success</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter">{data.successRate}%</div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-slate-900 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-400">Credit Velocity</CardTitle>
                <Battery className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter">{data.totalCredits}</div>
              </CardContent>
            </Card>

            <Card className="hidden sm:block border-zinc-500/20 bg-slate-900 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">New Users (7d)</CardTitle>
                <Plus className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-emerald-500 tracking-tighter">+{data.weeklyUsersCount}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-primary/10 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Manual User Onboarding</CardTitle>
              <CardDescription>Register new users directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={(fd) => handleAction(createManualUser, fd)} className="grid grid-cols-1 md:flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="user@example.com" required />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Password</Label>
                  <Input name="password" type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input name="credits" type="number" defaultValue={5} className="md:w-24" />
                </div>
                <Button type="submit" className="w-full md:w-auto h-10">Add User</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold">Operator List</h3>
              <form method="get" className="flex items-center gap-2 bg-muted p-1 rounded-lg w-full md:w-auto">
                <Search className="w-4 h-4 ml-2" />
                <Input name="q" placeholder="Search..." defaultValue={query} className="bg-transparent border-0 focus-visible:ring-0 h-8" />
              </form>
            </div>
            <CardContent className="p-0">
               {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-center">Videos</th>
                      <th className="px-6 py-4 text-left">Credits</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.usersList?.map((u: any) => (
                      <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{u.email}</p>
                          <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        </td>
                        <td colSpan={3} className="px-6 py-4">
                          <form action={(fd) => handleAction(updateUserProfile, fd)} className="flex items-center gap-4">
                            <input type="hidden" name="userId" value={u.id} />
                            <div className="flex flex-col gap-1">
                              <Label className="text-[10px] uppercase text-muted-foreground">Full Name</Label>
                              <Input name="fullName" defaultValue={u.full_name} className="h-8 w-40" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-[10px] uppercase text-muted-foreground">Credits</Label>
                              <Input name="credits" type="number" defaultValue={u.credits} className="h-8 w-24" />
                            </div>
                            <Button size="sm" variant="outline" className="mt-5 gap-2">
                               <Save className="h-4 w-4" /> Save Details
                            </Button>
                          </form>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end items-center gap-4">
                            <form action={(fd) => handleAction(toggleAdminStatus, fd)}>
                               <input type="hidden" name="userId" value={u.id} />
                               <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                               <Button size="sm" variant={u.is_admin ? 'default' : 'outline'}>{u.is_admin ? 'Revoke Admin' : 'Make Admin'}</Button>
                            </form>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500 h-8 w-8"
                              onClick={async () => {
                                if (window.confirm('PERMANENTLY DELETE user account and videos?')) {
                                  const fd = new FormData()
                                  fd.append('userId', u.id)
                                  handleAction(deleteUser, fd)
                                }
                              }}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden divide-y">
                {data.usersList?.map((u: any) => (
                  <div key={u.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold truncate max-w-[200px]">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.videoCount} videos</p>
                      </div>
                      <form action={(fd) => handleAction(toggleAdminStatus, fd)}>
                         <input type="hidden" name="userId" value={u.id} />
                         <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                         <Button size="sm" variant={u.is_admin ? 'default' : 'outline'}>{u.is_admin ? 'Admin' : 'User'}</Button>
                      </form>
                    </div>
                    <form action={(fd) => handleAction(updateUserCredits, fd)} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <Input name="credits" type="number" defaultValue={u.credits} className="flex-1" />
                      <Button size="sm">Update Credits</Button>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
           <Card className="overflow-hidden">
             <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <CardTitle>Video Moderation</CardTitle>
                  <CardDescription>Monitor and manual override for all generations.</CardDescription>
               </div>
               <div className="flex flex-wrap gap-2">
                 <select 
                    className="h-9 px-3 rounded-md bg-muted text-sm border-0 focus:ring-1 focus:ring-primary"
                    value={videoFilter} 
                    onChange={(e) => setVideoFilter(e.target.value)}
                 >
                   <option value="all">All Status</option>
                   <option value="completed">Completed</option>
                   <option value="processing">Processing</option>
                   <option value="failed">Failed</option>
                   <option value="pending">Pending</option>
                 </select>
                 <form action={async () => {
                   const res = await bulkRefundStuckVideos()
                   if (res.success) toast.success(res.message)
                   else toast.error(res.message)
                 }}>
                   <Button variant="destructive" size="sm" className="gap-2">
                     <AlertCircle className="w-4 h-4" /> Refund Stuck
                   </Button>
                 </form>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left">User</th>
                        <th className="px-6 py-4 text-left">Details</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {data.videosList?.filter((v: any) => videoFilter === 'all' || v.status === videoFilter).map((v: any) => (
                        <tr key={v.id} className={`hover:bg-muted/20 transition-colors ${expandedVideo === v.id ? 'bg-primary/5' : ''}`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-200">{v.profiles?.email}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{v.id.slice(0, 8)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:text-primary gap-1"
                              onClick={() => setExpandedVideo(expandedVideo === v.id ? null : v.id)}
                            >
                               {expandedVideo === v.id ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                               View Info
                            </Button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <form action={(fd) => handleAction(updateVideoDetails, fd)} className="flex items-center gap-2">
                               <input type="hidden" name="videoId" value={v.id} />
                               <select 
                                  name="status" 
                                  defaultValue={v.status} 
                                  className="bg-slate-900 border border-slate-700 text-[10px] font-bold uppercase rounded px-2 h-7 focus:ring-1 ring-primary"
                               >
                                 <option value="pending">Pending</option>
                                 <option value="processing">Processing</option>
                                 <option value="failed">Failed</option>
                                 <option value="completed">Completed</option>
                               </select>
                               <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500"><Save className="h-3 w-3"/></Button>
                            </form>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                             <div className="flex justify-end gap-2">
                               {v.video_url && (
                                 <a href={v.video_url} target="_blank" rel="noopener noreferrer">
                                   <Button size="icon" variant="outline" className="h-8 w-8">
                                     <ExternalLink className="h-4 w-4"/>
                                   </Button>
                                 </a>
                               )}
                               {(v.status === 'processing' || v.status === 'pending') && (
                                 <form action={(fd) => handleAction(refundVideo, fd)}>
                                    <input type="hidden" name="videoId" value={v.id} />
                                    <input type="hidden" name="userId" value={v.user_id} />
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-orange-600" title="Refund Credits"><Clock className="h-4 w-4"/></Button>
                                 </form>
                               )}
                               <form action={(fd) => handleAction(deleteVideo, fd)}>
                                  <input type="hidden" name="videoId" value={v.id} />
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={(e) => !confirm('Delete video?') && e.preventDefault()}><Trash className="w-4 h-4"/></Button>
                               </form>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {/* Expanded View */}
                      {data.videosList?.map((v: any) => expandedVideo === v.id && (
                        <tr key={`expanded-${v.id}`} className="bg-primary/5 border-t-0 border-b">
                          <td colSpan={4} className="px-10 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-4">
                                  <div>
                                    <Label className="text-xs uppercase text-primary tracking-widest font-bold">Generation Prompt</Label>
                                    <p className="mt-1 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed italic">"{v.prompt}"</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs uppercase text-primary tracking-widest font-bold">Script</Label>
                                    <div className="mt-1 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">{v.script || 'No script available'}</div>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <form action={(fd) => handleAction(updateVideoDetails, fd)} className="space-y-4 p-6 bg-slate-900 rounded-2xl border border-slate-700">
                                     <input type="hidden" name="videoId" value={v.id} />
                                     <h4 className="font-extrabold text-sm uppercase flex items-center gap-2"><Edit className="w-4 h-4"/> Manual Override</h4>
                                     <div className="space-y-2">
                                        <Label>Direct Video URL</Label>
                                        <Input name="videoUrl" defaultValue={v.video_url} placeholder="https://fal.media/..." className="h-8 text-xs bg-slate-950" />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Status</Label>
                                          <select name="status" defaultValue={v.status} className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-xs">
                                             <option value="pending">Pending</option>
                                             <option value="processing">Processing</option>
                                             <option value="failed">Failed</option>
                                             <option value="completed">Completed</option>
                                          </select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Duration (seconds)</Label>
                                          <Input name="duration" type="number" defaultValue={v.duration} className="h-8 text-xs bg-slate-950" />
                                        </div>
                                     </div>
                                     <Button type="submit" className="w-full h-9 gap-2">Update Parameters</Button>
                                  </form>
                               </div>
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

        <TabsContent value="audit" className="space-y-6">
           <Card className="overflow-hidden">
             <CardHeader><CardTitle>Credit Logs</CardTitle></CardHeader>
             <CardContent className="p-0">
               <div className="divide-y">
                  {data.creditLogs?.map((log: any) => (
                    <div key={log.id} className="p-4 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold">{log.profiles?.email}</p>
                        <p className="text-xs text-muted-foreground">{log.reason}</p>
                      </div>
                      <span className={`font-mono font-bold ${log.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {log.amount > 0 ? `+${log.amount}` : log.amount}
                      </span>
                    </div>
                  ))}
               </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


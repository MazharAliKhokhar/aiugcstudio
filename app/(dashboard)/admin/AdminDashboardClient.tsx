'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, ShieldCheck, Battery, Trash, Search, TrendingUp, AlertCircle, RefreshCcw, Edit, ChevronDown, ChevronUp, ExternalLink, Clock, Save, UserMinus, Plus, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateUserProfile, toggleAdminStatus, deleteVideo, refundVideo,
  bulkRefundStuckVideos, createManualUser, updateVideoDetails, deleteUser, syncDatabase
} from './actions'

interface Props {
  data: any
  error: string | null
  query: string
}

export function AdminDashboardClient({ data, error, query }: Props) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [videoFilter, setVideoFilter] = useState<string>('all')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAction = async (action: (fd: FormData) => Promise<{ success: boolean; message: string }>, formData: FormData) => {
    startTransition(async () => {
      const res = await action(formData)
      if (res?.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res?.message || 'Action failed')
      }
    })
  }

  if (error || !data) return (
    <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="text-center">
        <h3 className="text-xl font-bold">System Access Interrupted</h3>
        <p className="text-muted-foreground">{error || 'Unable to load dashboard data'}</p>
      </div>
      <Button onClick={() => router.refresh()} variant="outline">Retry</Button>
    </div>
  )

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
            disabled={isPending}
            onClick={async () => {
              const res = await syncDatabase()
              if (res.success) {
                toast.success('Synced!')
                router.refresh()
              }
            }}
            className="gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} /> Sync DB
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap w-full justify-start border border-border overflow-x-auto gap-1">
          <TabsTrigger value="overview" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Insights</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Operators</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Moderation</TabsTrigger>
          <TabsTrigger value="audit" className="flex-1 md:flex-none px-4 py-2 rounded-lg">Audit</TabsTrigger>
        </TabsList>

        {/* ── INSIGHTS ── */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-blue-500/20 bg-card shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent><div className="text-3xl font-black tracking-tighter">{data.usersCount}</div></CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-card shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Gen Success</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-black tracking-tighter">{data.successRate}%</div></CardContent>
            </Card>

            <Card className="border-green-500/20 bg-card shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-400">Credit Velocity</CardTitle>
                <Battery className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-black tracking-tighter">{data.totalCredits}</div></CardContent>
            </Card>

            <Card className="hidden sm:block border-zinc-500/20 bg-card shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">New Users (7d)</CardTitle>
                <Plus className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-black text-emerald-500 tracking-tighter">+{data.weeklyUsersCount}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── OPERATORS ── */}
        <TabsContent value="users" className="space-y-6">
          {/* Manual user creation */}
          <Card className="border-primary/10 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Manual User Onboarding</CardTitle>
              <CardDescription>Register new users directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (fd) => {
                  const res = await createManualUser(fd)
                  if (res.success) { toast.success(res.message); router.refresh() }
                  else toast.error(res.message)
                }}
                className="grid grid-cols-1 md:flex flex-wrap gap-4 items-end"
              >
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
                <Button type="submit" className="w-full md:w-auto h-10" disabled={isPending}>Add User</Button>
              </form>
            </CardContent>
          </Card>

          {/* Operator list */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold">Operator List</h3>
              <form method="get" className="flex items-center gap-2 bg-muted p-1 rounded-lg w-full md:w-auto">
                <Search className="w-4 h-4 ml-2 text-muted-foreground" />
                <Input name="q" placeholder="Search..." defaultValue={query} className="bg-transparent border-0 focus-visible:ring-0 h-8" />
              </form>
            </div>
            <CardContent className="p-0">
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left" colSpan={3}>Edit Details</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.usersList?.map((u: any) => (
                      <tr key={u.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">{u.email}</p>
                          <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()} · {u.videoCount} videos</p>
                        </td>
                        <td className="px-6 py-4" colSpan={3}>
                          <form
                            action={async (fd) => {
                              const res = await updateUserProfile(fd)
                              if (res.success) { toast.success(res.message); router.refresh() }
                              else toast.error(res.message)
                            }}
                            className="flex items-end gap-3 flex-wrap"
                          >
                            <input type="hidden" name="userId" value={u.id} />
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Full Name</Label>
                              <Input name="fullName" defaultValue={u.full_name || ''} className="h-8 w-44" placeholder="Name..." />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Credits</Label>
                              <Input name="credits" type="number" defaultValue={u.credits} className="h-8 w-24" />
                            </div>
                            <Button type="submit" size="sm" variant="outline" className="gap-1.5 mb-0.5" disabled={isPending}>
                              <Save className="h-3.5 w-3.5" /> Save
                            </Button>
                          </form>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <form action={async (fd) => {
                              const res = await toggleAdminStatus(fd)
                              if (res.success) { toast.success(res.message); router.refresh() }
                              else toast.error(res.message)
                            }}>
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                              <Button size="sm" variant={u.is_admin ? 'default' : 'outline'} disabled={isPending}>
                                {u.is_admin ? 'Revoke' : 'Make Admin'}
                              </Button>
                            </form>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 h-8 w-8"
                              disabled={isPending}
                              onClick={(e) => {
                                if (!confirm(`PERMANENTLY DELETE ${u.email}?`)) return
                                const fd = new FormData()
                                fd.append('userId', u.id)
                                startTransition(async () => {
                                  const res = await deleteUser(fd)
                                  if (res.success) { toast.success(res.message); router.refresh() }
                                  else toast.error(res.message)
                                })
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

              {/* Mobile */}
              <div className="md:hidden divide-y">
                {data.usersList?.map((u: any) => (
                  <div key={u.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold truncate max-w-[200px]">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.videoCount} videos · {u.credits} credits</p>
                      </div>
                      <form action={async (fd) => {
                        const res = await toggleAdminStatus(fd)
                        if (res.success) { toast.success(res.message); router.refresh() }
                        else toast.error(res.message)
                      }}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="isAdmin" value={u.is_admin ? 'true' : 'false'} />
                        <Button size="sm" variant={u.is_admin ? 'default' : 'outline'}>{u.is_admin ? 'Admin' : 'User'}</Button>
                      </form>
                    </div>
                    <form action={async (fd) => {
                      const res = await updateUserProfile(fd)
                      if (res.success) { toast.success(res.message); router.refresh() }
                      else toast.error(res.message)
                    }} className="space-y-3">
                      <input type="hidden" name="userId" value={u.id} />
                      <Input name="fullName" defaultValue={u.full_name || ''} placeholder="Full name..." className="h-9" />
                      <div className="flex gap-2">
                        <Input name="credits" type="number" defaultValue={u.credits} className="flex-1" />
                        <Button type="submit" size="sm" className="gap-1">
                          <Save className="h-3.5 w-3.5" /> Save
                        </Button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MODERATION ── */}
        <TabsContent value="videos" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Video Moderation</CardTitle>
                <CardDescription>Monitor and override all generations.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="h-9 px-3 rounded-md bg-muted text-sm border border-border focus:ring-1 focus:ring-primary"
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
                  if (res.success) { toast.success(res.message); router.refresh() }
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
                      <th className="px-6 py-4 text-left">Expand</th>
                      <th className="px-6 py-4 text-left">Status Override</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.videosList
                      ?.filter((v: any) => videoFilter === 'all' || v.status === videoFilter)
                      .map((v: any) => (
                        <>
                          <tr key={v.id} className={`hover:bg-muted/20 transition-colors ${expandedVideo === v.id ? 'bg-primary/5' : ''}`}>
                            <td className="px-6 py-4">
                              <p className="font-medium">{v.profiles?.email}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{v.id.slice(0, 8)}…</p>
                            </td>
                            <td className="px-6 py-4">
                              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setExpandedVideo(expandedVideo === v.id ? null : v.id)}>
                                {expandedVideo === v.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                Info
                              </Button>
                            </td>
                            <td className="px-6 py-4">
                              <form action={async (fd) => {
                                const res = await updateVideoDetails(fd)
                                if (res.success) { toast.success(res.message); router.refresh() }
                                else toast.error(res.message)
                              }} className="flex items-center gap-2">
                                <input type="hidden" name="videoId" value={v.id} />
                                <select name="status" defaultValue={v.status} className="bg-background border border-border text-xs font-bold uppercase rounded px-2 h-7">
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="failed">Failed</option>
                                  <option value="completed">Completed</option>
                                </select>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500">
                                  <Save className="h-3 w-3" />
                                </Button>
                              </form>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {v.video_url && (
                                  <a href={v.video_url} target="_blank" rel="noopener noreferrer">
                                    <Button size="icon" variant="outline" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                                  </a>
                                )}
                                {(v.status === 'processing' || v.status === 'pending') && (
                                  <form action={async (fd) => {
                                    const res = await refundVideo(fd)
                                    if (res.success) { toast.success(res.message); router.refresh() }
                                    else toast.error(res.message)
                                  }}>
                                    <input type="hidden" name="videoId" value={v.id} />
                                    <input type="hidden" name="userId" value={v.user_id} />
                                    <Button size="icon" variant="outline" className="h-8 w-8 text-orange-500" title="Refund Credits">
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                  </form>
                                )}
                                <form action={async (fd) => {
                                  if (!confirm('Delete video?')) return
                                  const res = await deleteVideo(fd)
                                  if (res.success) { toast.success(res.message); router.refresh() }
                                  else toast.error(res.message)
                                }}>
                                  <input type="hidden" name="videoId" value={v.id} />
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </form>
                              </div>
                            </td>
                          </tr>
                          {expandedVideo === v.id && (
                            <tr key={`exp-${v.id}`} className="bg-primary/5">
                              <td colSpan={4} className="px-10 py-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-xs uppercase text-primary tracking-widest font-bold">Prompt</Label>
                                      <p className="mt-1 text-sm bg-background p-4 rounded-xl border italic">"{v.prompt}"</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs uppercase text-primary tracking-widest font-bold">Script</Label>
                                      <div className="mt-1 text-sm bg-background p-4 rounded-xl border whitespace-pre-wrap">{v.script || 'No script'}</div>
                                    </div>
                                  </div>
                                  <form action={async (fd) => {
                                    const res = await updateVideoDetails(fd)
                                    if (res.success) { toast.success(res.message); router.refresh() }
                                    else toast.error(res.message)
                                  }} className="space-y-4 p-6 bg-muted rounded-2xl border">
                                    <input type="hidden" name="videoId" value={v.id} />
                                    <h4 className="font-extrabold text-sm uppercase flex items-center gap-2"><Edit className="w-4 h-4" /> Manual Override</h4>
                                    <div className="space-y-2">
                                      <Label>Direct Video URL</Label>
                                      <Input name="videoUrl" defaultValue={v.video_url || ''} placeholder="https://..." className="h-8 text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Status</Label>
                                        <select name="status" defaultValue={v.status} className="w-full h-8 bg-background border border-border rounded px-2 text-xs">
                                          <option value="pending">Pending</option>
                                          <option value="processing">Processing</option>
                                          <option value="failed">Failed</option>
                                          <option value="completed">Completed</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Duration (s)</Label>
                                        <Input name="duration" type="number" defaultValue={v.duration} className="h-8 text-xs" />
                                      </div>
                                    </div>
                                    <Button type="submit" className="w-full h-9 gap-2">Update Parameters</Button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AUDIT ── */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Credit Logs</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {data.creditLogs?.length === 0 && (
                  <p className="p-6 text-muted-foreground text-sm">No credit logs found.</p>
                )}
                {data.creditLogs?.map((log: any) => (
                  <div key={log.id} className="p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold">{log.profiles?.email}</p>
                      <p className="text-xs text-muted-foreground">{log.reason} · {new Date(log.created_at).toLocaleString()}</p>
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

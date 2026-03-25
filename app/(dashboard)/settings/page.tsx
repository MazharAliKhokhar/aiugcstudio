import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Settings as SettingsIcon, ExternalLink } from 'lucide-react'

// Lemon Squeezy Checkout URLs for the 3 Tiers
const STARTER_URL = process.env.NEXT_PUBLIC_LS_STARTER_URL || '#'
const GROWTH_URL = process.env.NEXT_PUBLIC_LS_GROWTH_URL || '#'
const SCALE_URL = process.env.NEXT_PUBLIC_LS_SCALE_URL || '#'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Billing</h1>
        <p className="text-muted-foreground mt-2">Manage your account and video credits.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
            <div className="font-medium">{profile?.full_name || 'Not provided'}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full translate-x-8 -translate-y-8" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" /> Credit Balance
          </CardTitle>
          <CardDescription>Purchase more credits to generate more AI video ads.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold my-4">
            {profile?.credits || 0} <span className="text-2xl text-muted-foreground font-normal">credits available</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Generating a 15s video costs 1 credit. 30s costs 2 credits. 60s costs 4 credits.
          </p>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-4 flex flex-col items-start gap-4">
          <p className="text-sm font-medium w-full border-b pb-2">Purchase Credits</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <a href={`${STARTER_URL}?checkout[custom][user_id]=${user.id}`} target="_blank" rel="noreferrer" className="w-full">
              <Button variant="outline" className="w-full flex-col h-auto py-3 items-start gap-1">
                <span className="font-bold">Starter ($69)</span>
                <span className="text-xs text-muted-foreground font-normal">4 Video Credits</span>
              </Button>
            </a>
            <a href={`${GROWTH_URL}?checkout[custom][user_id]=${user.id}`} target="_blank" rel="noreferrer" className="w-full">
              <Button className="w-full flex-col h-auto py-3 items-start gap-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0">
                <span className="font-bold">Growth Pro ($149)</span>
                <span className="text-xs text-white/80 font-normal">10 Video Credits</span>
              </Button>
            </a>
            <a href={`${SCALE_URL}?checkout[custom][user_id]=${user.id}`} target="_blank" rel="noreferrer" className="w-full">
              <Button variant="outline" className="w-full flex-col h-auto py-3 items-start gap-1 border-primary/20 hover:bg-primary/5">
                <span className="font-bold">Ad Scale ($399)</span>
                <span className="text-xs text-muted-foreground font-normal">30 Video Credits</span>
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Settings as SettingsIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single()

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
          <CardDescription>Upgrade your account to generate more AI video ads.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold my-4">
            {profile?.credits || 0} <span className="text-2xl text-muted-foreground font-normal">credits available</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Generating a 15s video costs 1 credit. 30s costs 2 credits. 60s costs 4 credits.
          </p>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-6 flex flex-col items-start gap-6">
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2 font-bold text-lg">
                <ExternalLink className="w-5 h-5 text-primary" /> Subscription Plans
              </div>
              {profile?.subscription_status && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  profile.subscription_status === 'active' ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                )}>
                  {profile.subscription_status}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Starter */}
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all hover:shadow-md",
                profile?.variant_id?.includes('03189911') ? "border-primary bg-primary/5" : "border-border"
              )}>
                <CardHeader className="p-4 pb-2">
                  <div className="font-bold text-lg">Starter</div>
                  <div className="text-2xl font-black">$99<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                  20 Video Credits / Month
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <a 
                    href={`${process.env.NEXT_PUBLIC_LS_STARTER_URL}?checkout[email]=${user.email}`} 
                    className={cn("w-full", !profile?.variant_id?.includes('03189911') && "lemonsqueezy-button")}
                  >
                    <Button variant={profile?.variant_id?.includes('03189911') ? "outline" : "default"} className="w-full h-9 text-xs" disabled={profile?.variant_id?.includes('03189911')}>
                      {profile?.variant_id?.includes('03189911') ? "Current Plan" : "Upgrade"}
                    </Button>
                  </a>
                </CardFooter>
              </Card>

              {/* Growth Pro */}
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all hover:shadow-md",
                profile?.variant_id?.includes('6ffe83cf') ? "border-primary bg-primary/5" : "border-border"
              )}>
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold rounded-bl-lg">POPULAR</div>
                <CardHeader className="p-4 pb-2">
                  <div className="font-bold text-lg">Pro</div>
                  <div className="text-2xl font-black">$299<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                  100 Video Credits / Month
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <a 
                    href={`${process.env.NEXT_PUBLIC_LS_GROWTH_URL}?checkout[email]=${user.email}`} 
                    className={cn("w-full", !profile?.variant_id?.includes('6ffe83cf') && "lemonsqueezy-button")}
                  >
                    <Button variant={profile?.variant_id?.includes('6ffe83cf') ? "outline" : "default"} className="w-full h-9 text-xs" disabled={profile?.variant_id?.includes('6ffe83cf')}>
                      {profile?.variant_id?.includes('6ffe83cf') ? "Current Plan" : "Upgrade"}
                    </Button>
                  </a>
                </CardFooter>
              </Card>

              {/* Ad Scale */}
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all hover:shadow-md",
                profile?.variant_id?.includes('b1ad8f72') ? "border-primary bg-primary/5" : "border-border"
              )}>
                <CardHeader className="p-4 pb-2">
                  <div className="font-bold text-lg">Scale</div>
                  <div className="text-2xl font-black">$799<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                  300 Video Credits / Month
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <a 
                    href={`${process.env.NEXT_PUBLIC_LS_SCALE_URL}?checkout[email]=${user.email}`} 
                    className={cn("w-full", !profile?.variant_id?.includes('b1ad8f72') && "lemonsqueezy-button")}
                  >
                    <Button variant={profile?.variant_id?.includes('b1ad8f72') ? "outline" : "default"} className="w-full h-9 text-xs" disabled={profile?.variant_id?.includes('b1ad8f72')}>
                      {profile?.variant_id?.includes('b1ad8f72') ? "Current Plan" : "Upgrade"}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                All plans include recurring monthly credits. Unused credits carry over for as long as your subscription is active. 
                Manage your subscription via the email receipt from Lemon Squeezy.
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

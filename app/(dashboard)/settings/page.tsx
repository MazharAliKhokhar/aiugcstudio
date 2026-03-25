import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Settings as SettingsIcon, ExternalLink } from 'lucide-react'

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
        <CardFooter className="bg-muted/30 pt-4 flex flex-col items-start gap-4">
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg border-b pb-2">
              <ExternalLink className="w-5 h-5" /> How to Upgrade
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
              <p className="text-sm">
                To upgrade your plan or purchase more credits, please send the payment via <strong>PayPal</strong> to:
              </p>
              <div className="bg-background p-3 rounded border font-mono text-center text-primary font-bold">
                saanimazhar@gmail.com
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-background rounded border text-center">
                  <div className="font-bold">Starter ($69)</div>
                  <div className="text-xs text-muted-foreground">4 Video Credits</div>
                </div>
                <div className="p-3 bg-primary/10 rounded border border-primary/30 text-center ring-1 ring-primary/20">
                  <div className="font-bold">Growth Pro ($149)</div>
                  <div className="text-xs text-muted-foreground">10 Video Credits</div>
                </div>
                <div className="p-3 bg-background rounded border text-center">
                  <div className="font-bold">Ad Scale ($399)</div>
                  <div className="text-xs text-muted-foreground">30 Video Credits</div>
                </div>
              </div>

              <div className="text-sm pt-2 text-muted-foreground">
                <p><strong>Step 2:</strong> After payment, send an email to the same address with:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Your registered email: <span className="text-foreground font-medium">{user.email}</span></li>
                  <li>The Transaction ID / Screenshot</li>
                </ul>
                <p className="mt-3 font-medium text-primary">Your account will be upgraded within 24 hours.</p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

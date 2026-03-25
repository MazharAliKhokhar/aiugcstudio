import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link2, Users, DollarSign, ArrowUpRight } from 'lucide-react'

export default async function AffiliatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const affiliateLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?aff_id=${user.id}`
  const commissionRate = "15%"

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Portal</h1>
        <p className="text-muted-foreground mt-2">Earn recurring revenue by referring users to ViralUGC.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Commission Rate</CardDescription>
            <CardTitle className="text-4xl">{commissionRate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Recurring on all subscriptions</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Total Referrals</CardDescription>
            <CardTitle className="text-4xl flex items-center">
              <Users className="w-6 h-6 mr-2 text-muted-foreground" /> 0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Active users right now</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Earnings</CardDescription>
            <CardTitle className="text-4xl flex items-center text-green-600">
              <DollarSign className="w-8 h-8 mr-1" /> 0.00
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Available to payout</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Link2 className="w-5 h-5 text-primary" />
            Your Unique Referral Link
          </CardTitle>
          <CardDescription>Share this link to start earning commissions automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={affiliateLink} className="font-mono bg-muted/50 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            When users click this link, our system tracks their referral. Once they make a manual purchase via PayPal, the commission will be tracked and credited to your account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

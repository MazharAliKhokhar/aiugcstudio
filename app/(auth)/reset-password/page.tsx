'use client'

import { useActionState } from 'react'
import { updatePassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Sparkles, KeyRound } from 'lucide-react'

const updateAction = async (prevState: any, formData: FormData) => {
  const result = await updatePassword(formData)
  if (result?.error) {
    return { error: result.error }
  }
  return { error: null }
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updateAction, { error: null })

  return (
    <Card className="w-full max-w-md mx-4 shadow-xl border-primary/20">
      <CardHeader className="space-y-4 text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 group w-fit mx-auto cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-tight">ViralUGC</span>
        </Link>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <KeyRound className="w-6 h-6 text-primary" /> New Password
          </CardTitle>
          <CardDescription>Enter your new secure password below</CardDescription>
        </div>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Updating...' : 'Set New Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

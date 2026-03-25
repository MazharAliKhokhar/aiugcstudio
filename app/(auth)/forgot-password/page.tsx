'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Sparkles, ArrowLeft, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

const resetAction = async (prevState: any, formData: FormData) => {
  const result = await requestPasswordReset(formData)
  if (result?.error) {
    return { error: result.error, success: false }
  }
  return { error: null, success: true }
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetAction, { error: null, success: false })
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  if (state?.success) {
    return (
      <Card className="w-full max-w-md mx-4 shadow-xl border-primary/20">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <MailCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-4 shadow-xl border-primary/20">
      <CardHeader className="space-y-4 text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 group w-fit mx-auto cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-tight">ViralUGC</span>
        </Link>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </div>
      </CardHeader>
      
      <form action={formAction}>
        <input type="hidden" name="origin" value={origin} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending link...' : 'Send Reset Link'}
          </Button>
          <Link href="/login" className="text-sm flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

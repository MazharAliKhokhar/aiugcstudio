'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

// Wrap login in a promise that returns the state shape expected by useActionState
const loginAction = async (prevState: any, formData: FormData) => {
  const result = await login(formData)
  if (result?.error) {
    return { error: result.error }
  }
  return { error: null }
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null })

  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl border-black/5 bg-white rounded-[32px] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-16 translate-x-16 rounded-full" />
      <CardHeader className="space-y-4 text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 group w-fit mx-auto cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-tight text-foreground">ViralUGC</span>
        </Link>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Log in to your account</CardDescription>
        </div>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Log in'}
          </Button>
          <p className="text-sm text-center text-muted-foreground w-full">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

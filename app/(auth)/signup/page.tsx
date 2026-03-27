'use client'

import { useActionState } from 'react'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const signupAction = async (prevState: any, formData: FormData) => {
  const result = await signup(formData)
  if (result?.error) {
    return { error: result.error }
  }
  return { error: null }
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, { error: null })

  return (
    <Card className="w-full max-w-md mx-4 shadow-2xl border-black/5 bg-white rounded-[32px] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-16 translate-x-16 rounded-full" />
      <CardHeader className="space-y-4 text-center pb-6">
        <Link href="/" className="flex items-center justify-center gap-2 group w-fit mx-auto cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-tight text-foreground">ViralUGC</span>
        </Link>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your email below to create your account</CardDescription>
        </div>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>

          {state?.error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Sign up'}
          </Button>
          <p className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StepProductUrl } from '@/components/studio/StepProductUrl'
import { StepGoal } from '@/components/studio/StepGoal'
import { StepScriptPreview } from '@/components/studio/StepScriptPreview'
import { StepGenerate } from '@/components/studio/StepGenerate'
import { Loader2, CheckCircle2, Copy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Steps: 1: URL, 2: Goal, 3: Script, 4: Generate, 5: Generating/Completed
type Step = 1 | 2 | 3 | 4 | 5

export default function StudioPage() {
  const [step, setStep] = useState<Step>(1)
  const [credits, setCredits] = useState<number>(0)
  
  // Form State
  const [url, setUrl] = useState('')
  const [productName, setProductName] = useState('')
  const [goal, setGoal] = useState('')
  const [prompt, setPrompt] = useState('')
  const [voiceScript, setVoiceScript] = useState('')
  const [duration, setDuration] = useState(15)
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoStatus, setVideoStatus] = useState<'pending'|'processing'|'completed'|'failed'|null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isStitching, setIsStitching] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Fetch initial credits
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
        if (data) setCredits(data.credits)
      }
    }
    fetchCredits()
  }, [supabase])

  useEffect(() => {
    // Generate an initial prompt when reaching step 3
    if (step === 3 && !prompt) {
      const base = `A highly engaging cinematic 4k video ad for a product${productName ? ` called ${productName}` : ''}.`
      const goalStr = goal === 'sales' ? 'It shows a clear transformation and urges viewers to buy now.' :
                      goal === 'awareness' ? 'It focuses on viral aesthetics, beautiful lighting, and stunning visuals.' :
                      'It reminds the viewer of the value proposition and ends with a strong call to action.'
      
      setPrompt(`${base} ${goalStr} Include text overlays referencing ${url}. Bright lighting, photorealistic humans, shot on ARRI Alexa.`)
    }
    if (step === 3 && !voiceScript) {
      const voiceBase = productName ? `Are you tired of the old way? Check out ${productName}.` : 'Are you looking for a game changer? Check this out.'
      const voiceGoal = goal === 'sales' ? 'It will completely transform your workflow. Get yours today before they sell out!' :
                        goal === 'awareness' ? 'You have to see how aesthetically pleasing and satisfying this is.' :
                        'It is simply the best option out there.'
      setVoiceScript(`${voiceBase} ${voiceGoal}`)
    }
  }, [step, url, productName, goal, prompt, voiceScript])

  // Realtime Subscription
  useEffect(() => {
    if (!videoId) return

    const channel = supabase
      .channel('video_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'videos', filter: `id=eq.${videoId}` },
        (payload) => {
          const newStatus = payload.new.status
          setVideoStatus(newStatus)
          if (newStatus === 'completed') {
            setVideoUrl(payload.new.video_url)
          } else if (newStatus === 'failed') {
            toast.error('Video generation failed. Please try again.')
            setIsGenerating(false)
            setStep(4) // Go back to generate step
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [videoId, supabase])

  // Post-processing: TTS + Stitching
  useEffect(() => {
    if (videoStatus === 'completed' && videoUrl && !videoUrl.startsWith('blob:') && !isStitching) {
      const processPostGeneration = async () => {
        setIsStitching(true)
        const toastId = toast.loading('Generating AI Voiceover...')
        
        try {
          // 1. Generate Voiceover TTS
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: voiceScript })
          })
          
          if (!ttsRes.ok) throw new Error('Failed to generate Voiceover')
          const audioBlob = await ttsRes.blob()

          // 2. Stitch with FFmpeg
          toast.loading('Merging Video and Audio...', { id: toastId })
          
          const { stitchVideoAndAudio } = await import('@/lib/stitcher')
          const finalUrl = await stitchVideoAndAudio(videoUrl, audioBlob)
          
          toast.success('Your ad is ready!', { id: toastId })
          
          // Overwrite the visual URL with the final URL
          setVideoUrl(finalUrl)
          
        } catch (err: any) {
          toast.error('Stitching failed, showing original video.', { id: toastId })
          console.error('Post processing error:', err)
        } finally {
          setIsStitching(false)
        }
      }
      
      processPostGeneration()
    }
  }, [videoStatus, videoUrl, isStitching, voiceScript])

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          productName,
          goal,
          prompt,
          duration
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start generation')
      }

      setVideoId(data.videoId)
      setVideoStatus('pending')
      setStep(5)
      
    } catch (err: any) {
      toast.error(err.message)
      setIsGenerating(false)
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl font-[1000] tracking-tighter uppercase italic text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          Generation Studio
        </h1>
        <p className="text-white/50 font-medium tracking-tight">Turn any product URL into a high-converting cinematic video ad.</p>
        
        <div className="mt-12 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-1">
            <span className={cn(step >= 1 && "text-primary")}>Product</span>
            <span className={cn(step >= 2 && "text-primary")}>Objective</span>
            <span className={cn(step >= 3 && "text-primary")}>Scripting</span>
            <span className={cn(step >= 4 && "text-primary")}>Render</span>
          </div>
          <Progress value={(step / (videoStatus === 'completed' ? 5 : 4)) * 100} className="h-1.5 bg-white/5" />
        </div>
      </div>

      <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden relative min-h-[550px] md:min-h-[500px] rounded-[32px]">
        <AnimatePresence mode="wait" custom={1}>
          
          {step === 1 && (
            <motion.div key="step-1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
              <CardHeader className="px-0 pt-0">
                <CardTitle>1. Product Details</CardTitle>
                <CardDescription>What are we selling today?</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <StepProductUrl 
                  url={url} setUrl={setUrl} 
                  productName={productName} setProductName={setProductName} 
                  onNext={() => setStep(2)} 
                />
              </CardContent>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
              <CardHeader className="px-0 pt-0">
                <CardTitle>2. Ad Objective</CardTitle>
                <CardDescription>How should the AI frame the video?</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <StepGoal 
                  goal={goal} setGoal={setGoal} 
                  onNext={() => setStep(3)} onBack={() => setStep(1)} 
                />
              </CardContent>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
              <CardHeader className="px-0 pt-0">
                <CardTitle>3. Script & Prompt</CardTitle>
                <CardDescription>Review what we'll send to the AI video model.</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <StepScriptPreview 
                  prompt={prompt} setPrompt={setPrompt} 
                  voiceScript={voiceScript} setVoiceScript={setVoiceScript}
                  onNext={() => setStep(4)} onBack={() => setStep(2)} 
                />
              </CardContent>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step-4" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
              <CardHeader className="px-0 pt-0">
                <CardTitle>4. Final Output</CardTitle>
                <CardDescription>Confirm duration and credits before generating.</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <StepGenerate 
                  duration={duration} setDuration={setDuration}
                  isGenerating={isGenerating} onGenerate={handleGenerate} onBack={() => setStep(3)}
                  creditsAvailable={credits}
                  voiceScript={voiceScript}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                  videoStatus={videoStatus}
                />
              </CardContent>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step-5" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 flex flex-col items-center justify-center text-center">
              
              {videoStatus === 'completed' && videoUrl && !isStitching ? (
                <div className="space-y-6 w-full max-w-md animate-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Video Ready!</h3>
                  <div className="rounded-xl overflow-hidden border shadow-lg bg-black aspect-[9/16]">
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-4">
                    <a href={videoUrl} download="viralugc-ad.mp4" className="flex-1">
                      <Button className="w-full">Download Ad</Button>
                    </a>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="shrink-0" 
                      title="Copy Prompt"
                      onClick={() => {
                        navigator.clipboard.writeText(prompt) // Assuming 'prompt' is the correct state variable to copy
                        toast.success('Prompt copied to clipboard!')
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div className="relative w-24 h-24 mx-auto text-primary">
                    <Loader2 className="w-full h-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold animate-pulse">
                      {isStitching ? 'MUX' : videoStatus === 'pending' ? 'INIT' : 'GPU'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {isStitching ? 'Mastering Final Video' : 'Generating Cinematic UGC'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isStitching 
                        ? 'Combining AI voiceover with your video...' 
                        : videoStatus === 'pending' 
                          ? 'Waiting for fal.ai queue...' 
                          : 'Processing on fal-ai/kling-video. This takes a few minutes.'}
                    </p>
                  </div>
                  <Progress value={isStitching ? 90 : videoStatus === 'pending' ? 10 : 60} className="w-64 mx-auto h-2 animate-pulse" />
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </Card>
    </div>
  )
}

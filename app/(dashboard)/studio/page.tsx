'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'

import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { StepProductUrl } from '@/components/studio/StepProductUrl'
import { StepGoal } from '@/components/studio/StepGoal'
import { StepAvatar } from '@/components/studio/StepAvatar'
import { StepScriptPreview } from '@/components/studio/StepScriptPreview'
import { StepGenerate } from '@/components/studio/StepGenerate'
import { Loader2, CheckCircle2, Copy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ACTORS } from '@/lib/actors'

// Steps: 1: URL, 2: Goal, 3: Avatar, 4: Script, 5: Generate, 6: Generating/Completed
type Step = 1 | 2 | 3 | 4 | 5 | 6

export default function StudioPage() {
  const [step, setStep] = useState<Step>(1)
  const [credits, setCredits] = useState<number>(0)
  
  // Form State
  const [url, setUrl] = useState('')
  const [productName, setProductName] = useState('')
  const [goal, setGoal] = useState('')
  const [selectedActorId, setSelectedActorId] = useState('actor-1')
  const [prompt, setPrompt] = useState('')
  const [voiceScript, setVoiceScript] = useState('')
  const [duration, setDuration] = useState(15)
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoStatus, setVideoStatus] = useState<'pending'|'processing'|'completed'|'failed'|null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isStitching, setIsStitching] = useState(false)
  const [isScripting, setIsScripting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Fetch initial credits
    const fetchCredits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await (supabase.from('profiles') as any).select('credits').eq('id', user.id).single()
          if (error) {
            console.error('[StudioPage] Profile fetch error:', error)
            // If it's a "no rows" error, it might be a sync delay - we could retry or just stay at 0
          }
          if (data) setCredits(data.credits)
        }
      } catch (err) {
        console.error('[StudioPage] Unexpected error fetching credits:', err)
      }
    }
    fetchCredits()
  }, [supabase])

  useEffect(() => {
    // Generate an initial prompt when reaching step 4 (Script)
    if (step === 4 && (!prompt || !voiceScript) && !isScripting) {
      const generateScript = async () => {
        setIsScripting(true)
        const toastId = toast.loading('DeepSeek R1 is crafting your script...')
        
        try {
          const actor = ACTORS.find(a => a.id === selectedActorId)
          const res = await fetch('/api/script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url,
              productName,
              goal,
              actorDescription: actor?.description || 'photorealistic human actor'
            })
          })

          if (!res.ok) throw new Error('DeepSeek API returned an error')
          
          const data = await res.json()
          if (data.videoPrompt) setPrompt(data.videoPrompt)
          if (data.voiceoverScript) setVoiceScript(data.voiceoverScript)
          
          toast.success('AI script generated!', { id: toastId })
        } catch (err: any) {
          console.error('[DeepSeek Fallback]', err)
          
          // Re-implement the template logic as a safe fallback
          const actor = ACTORS.find(a => a.id === selectedActorId)
          const base = `A highly engaging cinematic 4k video ad for a product${productName ? ` called ${productName}` : ''}.`
          const actorStr = actor ? ` Featuring a ${actor.description}` : ' Featuring a photorealistic human actor.'
          const goalStr = goal === 'sales' ? 'It shows a clear transformation and urges viewers to buy now.' :
                          goal === 'awareness' ? 'It focuses on viral aesthetics, beautiful lighting, and stunning visuals.' :
                          'It reminds the viewer of the value proposition and ends with a strong call to action.'
          
          setPrompt(`${base} ${actorStr} ${goalStr} Include text overlays referencing ${url}. Bright lighting, shot on ARRI Alexa.`)
          
          const voiceBase = productName ? `Are you tired of the old way? Check out ${productName}.` : 'Are you looking for a game changer? Check this out.'
          const voiceGoal = goal === 'sales' ? 'It will completely transform your workflow. Get yours today before they sell out!' :
                            goal === 'awareness' ? 'You have to see how aesthetically pleasing and satisfying this is.' :
                            'It is simply the best option out there.'
          setVoiceScript(`${voiceBase} ${voiceGoal}`)
          
          toast.error('AI was busy. Used high-quality template instead.', { id: toastId })
        } finally {
          setIsScripting(false)
        }
      }
      generateScript()
    }
  }, [step, url, productName, goal, selectedActorId, isScripting, prompt, voiceScript]) // Fixed deps

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
            setStep(5) // Go back to generate step
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [videoId, supabase])

  // Post-processing: Server-Side TTS + Stitching
  useEffect(() => {
    if (videoStatus === 'completed' && videoUrl && !videoUrl.startsWith('blob:') && !isStitching) {
      const processPostGeneration = async () => {
        setIsStitching(true)
        const toastId = toast.loading('Perfecting your ad (AI Voice + Stitching)...')
        
        try {
          const stitchRes = await fetch('/api/stitch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              videoUrl, 
              voiceScript, 
              videoId 
            })
          })

          if (!stitchRes.ok) {
            const errData = await stitchRes.json()
            throw new Error(errData.error || 'Server-side stitching failed')
          }
          
          const finalBlob = await stitchRes.blob()
          const finalUrl = URL.createObjectURL(finalBlob)
          
          toast.success('Your viral ad is ready!', { id: toastId })
          setVideoUrl(finalUrl)
          
        } catch (err: any) {
          toast.error(err.message || 'Stitching failed, showing original video.', { id: toastId })
          console.error('Post processing error:', err)
        } finally {
          setIsStitching(false)
        }
      }
      
      processPostGeneration()
    }
  }, [videoStatus, videoUrl, isStitching, voiceScript, videoId])

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
      setStep(6)
      
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
        
        <div className="mt-12 space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">
            <span className={cn(step >= 1 && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>Product</span>
            <span className={cn(step >= 2 && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>Objective</span>
            <span className={cn(step >= 3 && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>Avatar</span>
            <span className={cn(step >= 4 && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>Scripting</span>
            <span className={cn(step >= 5 && "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")}>Render</span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full" />
            <Progress value={(step / (videoStatus === 'completed' ? 6 : 5)) * 100} className="h-1.5 bg-white/5 relative z-10" />
          </div>
        </div>
      </div>

      <ErrorBoundary>
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
                <StepAvatar 
                  selectedActor={selectedActorId}
                  setSelectedActor={setSelectedActorId}
                  onNext={() => setStep(4)} 
                  onBack={() => setStep(2)} 
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>4. Script & Prompt</CardTitle>
                  <CardDescription>Review what we'll send to the AI video model.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <StepScriptPreview 
                    prompt={prompt} setPrompt={setPrompt} 
                    voiceScript={voiceScript} setVoiceScript={setVoiceScript}
                    onNext={() => setStep(5)} onBack={() => setStep(3)} 
                    isScripting={isScripting}
                  />
                </CardContent>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step-5" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 overflow-y-auto">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>5. Final Output</CardTitle>
                  <CardDescription>Confirm duration and credits before generating.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <StepGenerate 
                    duration={duration} setDuration={setDuration}
                    isGenerating={isGenerating} onGenerate={handleGenerate} onBack={() => setStep(4)}
                    creditsAvailable={credits}
                    voiceScript={voiceScript}
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
                    videoStatus={videoStatus}
                  />
                </CardContent>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step-6" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute inset-0 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                
                {videoStatus === 'completed' && videoUrl && !isStitching ? (
                  <div className="space-y-6 w-full max-w-md animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-[9/16] relative group/vid">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/vid:opacity-100 transition-opacity z-10 pointer-events-none" />
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
                          navigator.clipboard.writeText(prompt) 
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
                            : 'Rendering with Open Source Wan 2.1. This takes a few minutes.'}
                      </p>
                    </div>
                    <Progress value={isStitching ? 90 : videoStatus === 'pending' ? 10 : 60} className="w-64 mx-auto h-2 animate-pulse" />
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </ErrorBoundary>
    </div>
  )
}

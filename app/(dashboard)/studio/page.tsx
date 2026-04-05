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
  const [progress, setProgress] = useState<number>(0)
  const [isStitching, setIsStitching] = useState(false)
  const [isScripting, setIsScripting] = useState(false)
  const [bootingAt, setBootingAt] = useState<number | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Fetch initial credits
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user/credits')
        if (!res.ok) throw new Error('Failed to fetch credits')
        const data = await res.json()
        if (data.credits !== undefined) setCredits(data.credits)
      } catch (err) {
        console.error('[StudioPage] Unexpected error fetching credits:', err)
      }
    }
    fetchCredits()
  }, [])

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
          if (payload.new.progress !== undefined) {
             setProgress(payload.new.progress)
          }

          if (newStatus === 'completed') {
            setVideoUrl(payload.new.video_url)
            setProgress(100)
          } else if (newStatus === 'failed') {
            const reason = payload.new.failure_reason || 'Unknown error'
            toast.error(`Generation failed: ${reason}`)
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

          // Handle GPU Warming Up during Stitching
          if (stitchRes.status === 202) {
            console.log('[Stitch] GPU warming up for mastering, retrying in 10s...')
            setTimeout(processPostGeneration, 10000)
            return
          }

          if (!stitchRes.ok) {
            const errData = await stitchRes.json()
            throw new Error(errData.error || 'Server-side stitching failed')
          }
          
          const finalBlob = await stitchRes.blob()
          const finalUrl = URL.createObjectURL(finalBlob)
          
          toast.success('Your viral ad is ready!')
          setVideoUrl(finalUrl)
          
        } catch (err: any) {
          toast.error(err.message || 'Stitching failed, showing original video.')
          console.error('Post processing error:', err)
        } finally {
          setIsStitching(false)
        }
      }
      
      processPostGeneration()
    }
  }, [videoStatus, videoUrl, isStitching, voiceScript, videoId])

  const handleCancelAndPause = async () => {
    setIsGenerating(false)
    setBootingAt(null)
    setStep(5)
    
    const toastId = toast.loading('Cancelling and pausing GPU to save credits...')
    try {
      const res = await fetch('/api/jarvis/pause', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to pause GPU')
      toast.success('GPU paused successfully.', { id: toastId })
    } catch (err: any) {
      toast.error(`Pause error: ${err.message}`, { id: toastId })
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    if (!bootingAt) setBootingAt(Date.now())
    
    try {
      // 1. Initial attempt
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, productName, goal, prompt, duration })
      })

      const data = await res.json()
      
      // 2. Handle GPU Warming Up (Booting)
      if (res.status === 202 && data.status === 'booting') {
        toast.info('GPU is waking up. Checking again in 10s...', { 
          duration: 3000,
          description: 'This is a one-time startup. Your credits are safe.' 
        })
        // Recursive retry after 10s
        setTimeout(handleGenerate, 10000)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start generation')
      }

      // 3. Success -> Start tracking status
      setVideoId(data.videoId)
      setVideoStatus('pending')
      setStep(6)
      setBootingAt(null)
      
    } catch (err: any) {
      console.error('[Studio/Generate] Error:', err)
      toast.error(err.message === 'Failed to fetch' ? 'Connection lost. Retrying...' : err.message)
      if (err.message === 'Failed to fetch') {
         setTimeout(handleGenerate, 5000)
      } else {
         setIsGenerating(false)
         setBootingAt(null)
      }
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
    <div className="max-w-[1200px] mx-auto py-1 md:py-2 px-4 md:px-0">
      <div className="mb-1 md:mb-2 space-y-0.5">
        <h1 className="text-xl md:text-2xl font-[1000] tracking-tighter uppercase italic text-slate-900 flex items-center gap-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="truncate">Generation Studio</span>
        </h1>
        
        <div className="mt-1 md:mt-2 space-y-2">
          <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">
            <span className={cn(step >= 1 && "text-primary border-b-2 border-primary pb-0.5")}>1. Product</span>
            <span className={cn(step >= 2 && "text-primary border-b-2 border-primary pb-0.5")}>2. Objective</span>
            <span className={cn(step >= 3 && "text-primary border-b-2 border-primary pb-0.5")}>3. Avatar</span>
            <span className={cn(step >= 4 && "text-primary border-b-2 border-primary pb-0.5")}>4. Script</span>
            <span className={cn(step >= 5 && "text-primary border-b-2 border-primary pb-0.5")}>5. Render</span>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 blur-md rounded-full" />
            <Progress value={(step / (videoStatus === 'completed' ? 6 : 5)) * 100} className="h-1 bg-slate-100 relative z-10" />
          </div>
        </div>
      </div>

      <ErrorBoundary>
        <Card className="bg-white border-slate-200 shadow-2xl shadow-slate-200/50 relative min-h-[400px] rounded-[24px] md:rounded-[32px] mb-2">
          <AnimatePresence mode="popLayout" custom={1}>
            
            {step === 1 && (
              <motion.div key="step-1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-4 md:p-6">
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
              <motion.div key="step-2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-4 md:p-6">
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
              <motion.div key="step-3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-4 md:p-6 flex flex-col">
                <StepAvatar 
                  selectedActor={selectedActorId}
                  setSelectedActor={setSelectedActorId}
                  onNext={() => setStep(4)} 
                  onBack={() => setStep(2)} 
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-4 md:p-6 flex flex-col">
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
              <motion.div key="step-5" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-4 md:p-6 flex flex-col justify-center">
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
                    progress={progress}
                  />
                </CardContent>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step-6" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="p-6 md:p-12 flex flex-col items-center justify-center text-center">
                
                {videoStatus === 'completed' && videoUrl && !isStitching ? (
                  <div className="space-y-10 w-full max-w-2xl animate-in zoom-in duration-700">
                    <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/10">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="rounded-[48px] overflow-hidden border-8 border-slate-50 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] bg-black aspect-[9/16] relative group/vid max-h-[70vh] mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/vid:opacity-100 transition-opacity z-10 pointer-events-none" />
                      <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-6 max-w-md mx-auto">
                      <a href={videoUrl} download="viralugc-ad.mp4" className="flex-1">
                        <Button className="w-full h-16 rounded-3xl text-xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/20 border-0">Download Final Ad</Button>
                      </a>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="w-16 h-16 rounded-3xl shrink-0 bg-slate-100 hover:bg-slate-200 border-0" 
                        title="Copy Prompt"
                        onClick={() => {
                          navigator.clipboard.writeText(prompt) 
                          toast.success('Prompt copied to clipboard!')
                        }}
                      >
                        <Copy className="w-6 h-6 text-slate-600" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in w-full max-w-2xl">
                    <div className="relative w-32 h-32 mx-auto text-primary">
                      <Loader2 className="w-full h-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-black uppercase tracking-tighter animate-pulse text-slate-900">
                        {isStitching ? 'MUX' : videoStatus === 'pending' ? 'BOOT' : 'GPU'}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-slate-900">
                        {isStitching ? 'Mastering Final Ad' : 'Rendering Cinematic UGC'}
                      </h3>
                      <p className="text-slate-500 text-xl font-bold italic tracking-tight">
                        {isStitching 
                          ? 'Synchronizing AI Voiceover and Visuals...' 
                          : videoStatus === 'pending' 
                            ? 'Warming up Private GPU Cluster (60-90s)...' 
                            : 'Synthesizing pixels with Wan 2.1. Almost ready.'}
                      </p>
                    </div>
                    <div className="relative px-12">
                      <Progress value={isStitching ? 95 : videoStatus === 'pending' ? 15 : 65} className="h-4 bg-slate-100 rounded-full" />
                    </div>

                    {/* Show Cancel button if stuck in booting for > 45s */}
                    {bootingAt && Date.now() - bootingAt > 45000 && (
                      <div className="mt-8 animate-in slide-in-from-bottom duration-500">
                        <p className="text-slate-400 text-sm mb-4">Taking longer than expected?</p>
                        <Button 
                          variant="outline" 
                          className="rounded-2xl border-slate-200 text-slate-500 hover:bg-slate-50"
                          onClick={handleCancelAndPause}
                        >
                          Cancel & Pause GPU
                        </Button>
                      </div>
                    )}
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

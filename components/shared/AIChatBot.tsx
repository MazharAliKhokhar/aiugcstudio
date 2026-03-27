'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Message = {
  id: string
  role: 'bot' | 'user'
  content: string | React.ReactNode
}

const QUICK_REPLIES = [
  "How does this work?",
  "Pricing plans?",
  "Are videos watermarked?",
  "I want to sign up"
]

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true)
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            role: 'bot',
            content: "Hi there! 👋 I'm the ViralUGC AI Assistant. I can help you understand how our platform turns any product URL into a high-converting video ad in 60 seconds. What would you like to know?"
          }
        ])
        setIsTyping(false)
      }, 1000)
    }
  }, [isOpen, messages.length])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking and routing
    setTimeout(() => {
      let botResponse: React.ReactNode = "I'm still learning! But you can sign up for free to test the platform yourself."
      const lowerReq = text.toLowerCase()

      if (lowerReq.includes('how') || lowerReq.includes('work')) {
        botResponse = (
          <div className="space-y-2">
            <p>It's incredibly simple! 🚀</p>
            <ol className="list-decimal pl-4 space-y-1 mt-2">
              <li>Paste your product URL</li>
              <li>Our AI writes a high-converting script</li>
              <li>Kling 2.1 generates a photorealistic human avatar</li>
              <li>You get a broadcast-ready mp4 in 60s!</li>
            </ol>
          </div>
        )
      } else if (lowerReq.includes('price') || lowerReq.includes('pricing') || lowerReq.includes('cost')) {
        botResponse = (
          <div className="space-y-2">
            <p>We operate on a simple Unit system! We have 3 professional tiers:</p>
            <ul className="list-disc pl-4 mt-2">
              <li><strong>Starter:</strong> $99/mo (20 Units)</li>
              <li><strong>Growth Pro:</strong> $299/mo (100 Units)</li>
              <li><strong>Ad Scale:</strong> $799/mo (300 Units)</li>
            </ul>
            <p className="mt-2 text-xs">A 15s ad costs 1 Unit. 60s costs 4 Units. It's the most cost-effective way to scale UGC.</p>
          </div>
        )
      } else if (lowerReq.includes('watermark')) {
         botResponse = "No watermark at all! 🛑 Every video you generate on a paid plan comes with a full Commercial License, so you own the MP4 completely to run ads anywhere."
      } else if (lowerReq.includes('sign up') || lowerReq.includes('join') || lowerReq.includes('account')) {
         botResponse = (
           <div className="space-y-3">
             <p>Awesome! You can create your free account right now and look around the studio.</p>
             <Link href="/signup" className="block w-full">
               <Button size="sm" className="w-full bg-gradient-to-r from-primary to-orange-500 text-white border-0 shadow-lg shadow-primary/20">Create Free Account</Button>
             </Link>
           </div>
         )
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content: botResponse }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-background/80 backdrop-blur-2xl border border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl w-[350px] sm:w-[400px] h-[500px] mb-4 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-b border-primary/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">ViralUGC Guide</h3>
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === 'bot' 
                        ? "bg-secondary text-secondary-foreground rounded-tl-sm self-start" 
                        : "bg-gradient-to-r from-primary to-orange-500 text-white rounded-tr-sm self-end ml-auto"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] self-start flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 bg-primary/50 text-transparent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/50 text-transparent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/50 text-transparent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scroller-hide no-scrollbar flex-nowrap shrink-0">
                {QUICK_REPLIES.map((reply, i) => (
                   <button 
                     key={i}
                     onClick={() => handleSend(reply)}
                     className="whitespace-nowrap bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                   >
                     {reply}
                   </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-background/50 border-t border-primary/10">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                  className="flex items-center gap-2 relative"
                >
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question..."
                    className="pr-10 rounded-full border-primary/20 bg-background/50 focus-visible:ring-primary/50"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-1 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50",
            isOpen 
              ? "bg-secondary text-secondary-foreground rotate-90 scale-90" 
              : "bg-gradient-to-r from-primary to-orange-500 text-white hover:shadow-primary/40 animate-bounce" // Bouncing to attract attention
          )}
          style={{ animationDuration: '3s' }} // Slowed down bounce
        >
          {isOpen ? <X className="w-6 h-6 -rotate-90" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}

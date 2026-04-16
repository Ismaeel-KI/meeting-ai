"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Send, Mic, X, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your MeetingAI assistant. How can I help you today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isVisible, setIsVisible] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  // Hide the widget completely if the app is in the compact 'widget size' (height < 200px)
  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerHeight > 200)
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: inputValue }
    setMessages((prev) => [...prev, newUserMsg])
    setInputValue("")

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm a simulated assistant for now. Connected AI APIs will drive my real responses shortly!",
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // Spring-like feel
            className="mb-4 w-[360px] h-[500px] max-h-[70vh] flex flex-col bg-slate-900/80 dark:bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 dark:border-cyan-500/30 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
            style={{
              boxShadow: "0 0 40px -10px rgba(6, 182, 212, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 dark:bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400">
                  <Brain className="w-5 h-5 animate-pulse-gentle" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] border border-slate-900"></div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Cluely AI</h3>
                  <p className="text-xs text-cyan-400/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
              ref={scrollRef}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md"
                        : "bg-white/10 text-slate-100 rounded-bl-sm border border-white/5 shadow-sm"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <Sparkles className="w-3 h-3 text-cyan-400 mb-1 inline-block mr-1 opacity-70" />
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white/5 border-t border-white/10">
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full overflow-hidden p-1 shadow-inner group focus-within:border-cyan-500/50 focus-within:bg-black/60 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 px-2"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-md shadow-cyan-900/50 disabled:opacity-50 disabled:bg-slate-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/40 relative group overflow-hidden border border-cyan-400/30"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Brain className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow behind button */}
        <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity z-[-1]"></div>
      </motion.button>
    </div>
  )
}

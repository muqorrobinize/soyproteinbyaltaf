'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'

interface ChatInterfaceProps {
  autoPrompt?: string
}

export default function ChatInterface({ autoPrompt }: ChatInterfaceProps) {
  const [autoSent, setAutoSent] = useState(false)
  const [input, setInput] = useState('')
  const { messages, status, sendMessage } = useChat()

  const isLoading = status === 'submitted' || status === 'streaming'

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send plan request after onboarding
  useEffect(() => {
    if (autoPrompt && !autoSent && sendMessage) {
      setAutoSent(true)
      setTimeout(() => {
        sendMessage({ text: autoPrompt })
      }, 800)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrompt, sendMessage])
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  // Helper to extract text from message parts
  function getMessageText(m: any): string {
    if (m.parts && Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    // Fallback for legacy format
    if (m.content) return m.content
    return ''
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-3">
            <div className="text-4xl animate-bounce">🌱</div>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Coach siap membantu!</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tanya tentang diet, protein, jadwal makan, atau tips fitness</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Berapa protein yang saya butuhkan?', 'Buat meal plan untuk bulking', 'Tips konsistensi gym'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage({ text: suggestion })}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m: any) => {
              const text = getMessageText(m)
              if (!text && m.role !== 'assistant') return null
              return (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-1" style={{ background: 'var(--accent)', color: '#fff' }}>🤖</div>
                  )}
                  <div
                    className="max-w-[82%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium"
                    style={m.role === 'user' ? {
                      background: 'var(--accent)',
                      color: '#fff',
                      borderBottomRightRadius: '0.25rem',
                    } : {
                      background: 'var(--surface-hover)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderBottomLeftRadius: '0.25rem',
                    }}
                  >
                    <p className="whitespace-pre-wrap">{text}</p>
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-1" style={{ background: 'var(--accent)', color: '#fff' }}>🤖</div>
                <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            data-chat-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya coach kamu..."
            className="input-field !rounded-2xl !py-3 text-sm"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="btn-primary !w-auto !px-4 !py-3 !rounded-2xl shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

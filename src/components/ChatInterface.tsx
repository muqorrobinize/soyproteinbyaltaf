'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'

interface ChatInterfaceProps {
  autoPrompt?: string
}

export default function ChatInterface({ autoPrompt }: ChatInterfaceProps) {
  const [autoSent, setAutoSent] = useState(false)
  const [input, setInput] = useState('')
  const { messages, status, append } = useChat()

  const isLoading = status === 'submitted' || status === 'streaming'

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-send plan request after onboarding
  useEffect(() => {
    if (autoPrompt && !autoSent && append) {
      setAutoSent(true)
      setTimeout(() => {
        append({ role: 'user', content: autoPrompt })
      }, 800)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrompt, append])
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    append({ role: 'user', content: input })
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
            <div className="flex flex-wrap gap-2 justify-center mt-2 mb-4">
              <a href="https://wa.me/6285293306853" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1" style={{ background: '#25D366', color: '#fff' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                Pesan via WA (Altaf)
              </a>
              <a href="https://wa.me/6281215300554" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1" style={{ background: '#25D366', color: '#fff' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                Pesan via WA (Arselan)
              </a>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Berapa protein yang saya butuhkan?', 'Buat meal plan untuk bulking', 'Tips konsistensi gym'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => append({ role: 'user', content: suggestion })}
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

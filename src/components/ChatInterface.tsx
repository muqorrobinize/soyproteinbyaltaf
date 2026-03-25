'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect } from 'react'

export default function ChatInterface() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col p-5 bg-transparent relative">
      <div className="flex-1 rounded-2xl border border-green-200/50 dark:border-green-800/50 bg-white/40 dark:bg-black/20 mb-5 p-4 flex flex-col shadow-inner overflow-y-auto max-h-[450px]">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-green-800/60 dark:text-green-200/60 h-full">
            <div className="animate-bounce mb-2 text-4xl">🌱</div>
            <p className="font-bold text-green-900 dark:text-green-100 text-lg">Ready to transform your health?</p>
            <p className="text-sm mt-1 font-medium">Ask me anything about your diet or fitness goals!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm backdrop-blur-md ${
                    m.role === 'user'
                      ? 'bg-green-600 text-white rounded-tr-sm border border-green-500'
                      : 'bg-white/70 dark:bg-black/50 text-green-950 dark:text-green-50 rounded-tl-sm border border-green-200/50 dark:border-green-800/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/70 dark:bg-black/50 text-green-950 dark:text-green-50 rounded-2xl p-4 rounded-tl-sm animate-pulse border border-green-200/50 dark:border-green-800/50 backdrop-blur-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animation-delay-100"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animation-delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3 relative z-10">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask your coach anything..."
          className="flex-1 p-4 bg-white/60 dark:bg-black/40 border border-green-200 dark:border-green-800 text-green-950 dark:text-green-50 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all backdrop-blur-md placeholder-green-800/40 dark:placeholder-green-200/40 font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-8 py-4 bg-green-600 text-white font-extrabold rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/20 active:scale-95 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  )
}

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/lib/types';

const BIENVENIDA: ChatMessage = {
  role: 'assistant',
  content:
    '¡Hola! Soy Washi 🧺 el asistente de Express Delivery Wash. ¿En qué te puedo ayudar? Puedo cotizarte, informarte sobre servicios o ayudarte a hacer un pedido 😊',
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([BIENVENIDA]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: texto };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content || 'Error al procesar respuesta.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error de conexión. Intenta de nuevo 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: '#E91E63' }}
            aria-label="Abrir chat de asistencia"
          >
            🧺
          </button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:w-[400px] bg-gray-950 border-gray-800 flex flex-col p-0"
        >
          <SheetHeader className="px-4 py-3 border-b border-gray-800">
            <SheetTitle className="text-white flex items-center gap-2">
              <span>🧺</span>
              <div>
                <div className="text-base font-semibold">Washi — Asistente</div>
                <div className="text-xs text-gray-500 font-normal">
                  Express Delivery Wash
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#E91E63' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm text-gray-400 text-sm">
                  <span className="animate-pulse">Washi está escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta..."
              disabled={loading}
              className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 placeholder-gray-500"
            />
            <Button
              onClick={enviar}
              disabled={loading || !input.trim()}
              size="sm"
              className="rounded-full px-4 text-white font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#E91E63', border: 'none' }}
            >
              →
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

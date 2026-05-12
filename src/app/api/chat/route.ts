import { NextRequest, NextResponse } from 'next/server';
import {
  CHATBOT_MODEL,
  CHATBOT_MAX_TOKENS,
  SYSTEM_PROMPT,
  detectarEscalacion,
} from '@/lib/chatbot-config';
import type { ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages requerido' }, { status: 400 });
    }

    const ultimoMensaje = messages[messages.length - 1].content;

    // Detección de escalación local — ahorra tokens cuando aplica
    if (detectarEscalacion(ultimoMensaje)) {
      return NextResponse.json({
        content:
          'Entiendo tu consulta. En un momento te contacta nuestro equipo directamente 🙏 También puedes escribirnos por email si lo prefieres.',
        escalado: true,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[chat] ANTHROPIC_API_KEY no configurado');
      return NextResponse.json(
        {
          content: 'El chatbot no está disponible en este momento. Contáctanos por email 😊',
          error: true,
        },
        { status: 503 },
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CHATBOT_MODEL,
        max_tokens: CHATBOT_MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[chat] Claude API error ${response.status}:`, errText);
      throw new Error(`Claude API: ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.content?.[0]?.text ||
      'Lo siento, no pude procesar tu mensaje. Intenta de nuevo 🙏';

    return NextResponse.json({ content, escalado: false });
  } catch (error) {
    console.error('[chat] Error:', error);
    return NextResponse.json(
      {
        content:
          'Ups, tuve un problema técnico momentáneo. Puedes escribirnos por email para ayudarte de inmediato 💬',
        error: true,
      },
      { status: 500 },
    );
  }
}

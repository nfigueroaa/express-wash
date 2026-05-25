import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { getNotifications, subscribe } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const cookieStore = cookies();
    const session = cookieStore.get('session')?.value;

    if (!session || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usuario = await verifySessionCookie(session);
    if (!usuario || usuario.email !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Set up SSE headers
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = new ReadableStream({
      start(controller) {
        // Send existing notifications
        const existingNotifications = getNotifications(userId);
        existingNotifications.forEach((notif) => {
          controller.enqueue(
            `event: notification\ndata: ${JSON.stringify(notif)}\n\n`
          );
        });

        // Subscribe to new notifications
        const unsubscribe = subscribe(userId, (notification) => {
          controller.enqueue(
            `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
          );
        });

        // Clean up on disconnect
        const closeHandler = () => {
          unsubscribe();
          controller.close();
        };

        request.signal.addEventListener('abort', closeHandler);
      },
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error('Notifications endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest } from 'next/server'
import { addListener, removeListener } from '@/lib/sse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder()

  let controllerRef: ReadableStreamDefaultController | null = null

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller

      // Send initial ping
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

      const listener = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          // Client disconnected
        }
      }

      addListener(listener)

      // Keep alive every 25s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(keepAlive)
        }
      }, 25000)

      // Cleanup on close
      _req.signal.addEventListener('abort', () => {
        removeListener(listener)
        clearInterval(keepAlive)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

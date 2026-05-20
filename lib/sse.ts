// Simple in-process SSE broadcaster
// Works with Next.js API routes; for multi-instance deploy use Redis pub/sub

type Listener = (data: string) => void

const listeners = new Set<Listener>()

export function addListener(fn: Listener) {
  listeners.add(fn)
}

export function removeListener(fn: Listener) {
  listeners.delete(fn)
}

export function broadcast(event: object) {
  const data = JSON.stringify(event)
  listeners.forEach((fn) => fn(data))
}

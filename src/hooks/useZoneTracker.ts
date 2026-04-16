import { useRef, useCallback } from 'react'

export type ZoneEvent = { zone: string; duration: number; ts: number }

// Client-side analytics store (persists in memory for session)
const events: ZoneEvent[] = []

export function getZoneAnalytics() {
  const summary = events.reduce<Record<string, { visits: number; totalMs: number }>>((acc, e) => {
    if (!acc[e.zone]) acc[e.zone] = { visits: 0, totalMs: 0 }
    acc[e.zone].visits++
    acc[e.zone].totalMs += e.duration
    return acc
  }, {})

  return Object.entries(summary).map(([zone, s]) => ({
    zone,
    visits: s.visits,
    avgDwellSec: Math.round(s.totalMs / s.visits / 1000),
  }))
}

export function useZoneTracker() {
  const enterTime = useRef<number>(0)
  const currentZone = useRef<string>('')

  const enter = useCallback((zone: string) => {
    // Log previous zone before entering new one
    if (currentZone.current && enterTime.current) {
      const duration = Date.now() - enterTime.current
      events.push({ zone: currentZone.current, duration, ts: Date.now() })
    }
    currentZone.current = zone
    enterTime.current = Date.now()
  }, [])

  const leave = useCallback(() => {
    if (!currentZone.current || !enterTime.current) return
    const duration = Date.now() - enterTime.current
    events.push({ zone: currentZone.current, duration, ts: Date.now() })
    currentZone.current = ''
    enterTime.current = 0
  }, [])

  return { enter, leave }
}

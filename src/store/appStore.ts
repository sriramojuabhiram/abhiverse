import { create } from 'zustand'

interface AppState {
  section:     number
  prevSection: number
  mouseX:      number
  mouseY:      number
  aiOpen:      boolean
  greetPulse:  number
  transitioning: boolean

  setSection:       (s: number) => void
  setMouse:         (x: number, y: number) => void
  setAIOpen:        (o: boolean) => void
  triggerGreeting:  () => void
  setTransitioning: (t: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  section:       0,
  prevSection:   0,
  mouseX:        0.5,
  mouseY:        0.5,
  aiOpen:        false,
  greetPulse:    0,
  transitioning: false,

  setSection: (s) => {
    if (s === get().section || get().transitioning) return
    set({ transitioning: true, prevSection: get().section, section: s })
    setTimeout(() => set({ transitioning: false }), 900)
  },
  setMouse:         (x, y) => set({ mouseX: x, mouseY: y }),
  setAIOpen:        (o) => set({ aiOpen: o }),
  triggerGreeting:  () => set({ greetPulse: Date.now() }),
  setTransitioning: (t) => set({ transitioning: t }),
}))

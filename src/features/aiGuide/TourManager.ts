// TourManager.ts — State machine for guided tour flow
import { create } from 'zustand'
import { TOUR_STEPS, type TourStep } from './Waypoints'

export type TourStatus = 'idle' | 'offered' | 'touring' | 'finished'

interface TourState {
  status: TourStatus
  currentStep: number
  narration: string
  narrationLoading: boolean

  offerTour: () => void
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  finishTour: () => void
  setNarration: (text: string) => void
  setNarrationLoading: (loading: boolean) => void
  getCurrentStep: () => TourStep | null
}

const TOUR_SEEN_KEY = 'abhiverse_tour_seen'

export const useTourStore = create<TourState>((set, get) => ({
  status: 'idle',
  currentStep: 0,
  narration: '',
  narrationLoading: false,

  offerTour: () => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY)
    if (!seen) {
      set({ status: 'offered' })
    }
  },

  startTour: () => {
    set({ status: 'touring', currentStep: 0, narration: '', narrationLoading: false })
  },

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < TOUR_STEPS.length - 1) {
      set({ currentStep: currentStep + 1, narration: '', narrationLoading: false })
    } else {
      get().finishTour()
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, narration: '', narrationLoading: false })
    }
  },

  skipTour: () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true')
    set({ status: 'idle', narration: '' })
  },

  finishTour: () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true')
    set({ status: 'finished', narration: '' })
    // Reset to idle after showing finish message
    setTimeout(() => set({ status: 'idle' }), 3000)
  },

  setNarration: (text) => set({ narration: text }),
  setNarrationLoading: (loading) => set({ narrationLoading: loading }),

  getCurrentStep: () => {
    const { status, currentStep } = get()
    if (status !== 'touring') return null
    return TOUR_STEPS[currentStep] ?? null
  },
}))

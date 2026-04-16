// Waypoints.ts — Tour waypoints mapped to existing planet sections
// Each step maps to a section index and includes narration prompt context

export interface TourStep {
  sectionIndex: number
  sectionName: string
  narrationPrompt: string
  /** Delay in ms before auto-advancing to next step (0 = wait for user) */
  autoAdvanceDelay: number
}

export const TOUR_STEPS: TourStep[] = [
  {
    sectionIndex: 0,
    sectionName: 'About',
    narrationPrompt:
      'Introduce yourself briefly as Abhiram. Mention your role as an AI Software Engineer & Agentic Workflow Architect. Keep it warm, 2 sentences max.',
    autoAdvanceDelay: 0,
  },
  {
    sectionIndex: 1,
    sectionName: 'Skills',
    narrationPrompt:
      'Briefly highlight your top 3 technical strengths: agentic AI workflows, full-stack engineering, and cloud-native architecture. Keep it punchy, 2 sentences.',
    autoAdvanceDelay: 0,
  },
  {
    sectionIndex: 2,
    sectionName: 'Experience',
    narrationPrompt:
      'Give a quick career overview — mention notable companies like Tesla, Anheuser-Busch, and McDonalds. Keep it impressive but brief, 2 sentences.',
    autoAdvanceDelay: 0,
  },
  {
    sectionIndex: 3,
    sectionName: 'Projects',
    narrationPrompt:
      'Highlight your most impressive projects: AI Career Agent and Venture Builder. Make them sound cutting-edge, 2 sentences.',
    autoAdvanceDelay: 0,
  },
  {
    sectionIndex: 4,
    sectionName: 'Contact',
    narrationPrompt:
      'Wrap up the tour warmly. Invite the visitor to get in touch or download your resume. End with a call to action, 2 sentences.',
    autoAdvanceDelay: 0,
  },
]

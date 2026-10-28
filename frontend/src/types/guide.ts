export type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard'

export interface OAuthGuide {
  difficulty_level: DifficultyLevel
  estimated_time: string
  prerequisites_and_blockers: string[]
  agent_automatable_steps: string[]
  human_intervention_steps: string[]
  sources_used: string[]
}

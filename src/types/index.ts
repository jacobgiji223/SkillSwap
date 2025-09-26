import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type Swap = Database['public']['Tables']['swaps']['Row']
export type Chat = Database['public']['Tables']['chats']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

export type SkillCategory = 
  | 'Technology' 
  | 'Arts & Crafts' 
  | 'Languages' 
  | 'Music' 
  | 'Sports & Fitness' 
  | 'Cooking' 
  | 'Business' 
  | 'Academic' 
  | 'Life Skills' 
  | 'Other'

export type SwapStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'cancelled'
export type MeetingType = 'in_person' | 'online' | 'hybrid'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type ReviewType = 'as_teacher' | 'as_learner'

export interface SkillWithUser extends Skill {
  profiles: Profile
}

export interface SwapWithDetails extends Swap {
  skill: Skill
  teacher: Profile
  learner: Profile
}

export interface MessageWithSender extends Message {
  sender: Profile
}

export interface NearbySkill {
  id: string
  title: string
  description: string
  category: string
  credits_per_hour: number
  user_name: string
  user_avatar: string
  distance_km: number
  location_name: string
}

export interface Location {
  lat: number
  lng: number
  name?: string
}
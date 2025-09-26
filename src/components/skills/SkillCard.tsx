import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Star, User } from 'lucide-react'
import { Button } from '../ui'
import { generateAvatarUrl, formatRelativeTime } from '../../lib/utils'
import type { Skill, Profile } from '../../types'

interface SkillCardProps {
  skill: Skill & { profiles: Profile }
  onRequest: (skill: Skill) => void
  onViewProfile: (userId: string) => void
}

const SkillCard: React.FC<SkillCardProps> = ({ 
  skill, 
  onRequest, 
  onViewProfile 
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Arts & Crafts': 'bg-purple-100 text-purple-800',
      'Languages': 'bg-pink-100 text-pink-800',
      'Music': 'bg-indigo-100 text-indigo-800',
      'Sports & Fitness': 'bg-orange-100 text-orange-800',
      'Cooking': 'bg-yellow-100 text-yellow-800',
      'Business': 'bg-green-100 text-green-800',
      'Academic': 'bg-teal-100 text-teal-800',
      'Life Skills': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  return (
    <motion.div
      whileHover={{ y: -4, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {skill.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {skill.description}
            </p>
          </div>
          
          <div className="ml-4 text-right">
            <div className="text-2xl font-bold text-green-600">
              {skill.credits_per_hour}
            </div>
            <div className="text-sm text-gray-500">credits/hr</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
            {skill.category}
          </span>
          {skill.difficulty_level && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty_level)}`}>
              {skill.difficulty_level}
            </span>
          )}
        </div>

        {/* Skill Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {skill.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{skill.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Teacher Info */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onViewProfile(skill.user_id)}
            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <img
              src={skill.profiles.avatar_url || generateAvatarUrl(skill.profiles.full_name || 'User')}
              alt={skill.profiles.full_name || 'User'}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{skill.profiles.full_name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Star size={14} className="mr-1 text-yellow-400" />
                <span>{skill.profiles.average_rating.toFixed(1)}</span>
                <span className="mx-1">•</span>
                <span>{skill.profiles.total_reviews} reviews</span>
              </div>
            </div>
          </button>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>Max {skill.max_duration_hours}h session</span>
          </div>
          
          {skill.location_name && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{skill.location_name}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onRequest(skill)}
          className="w-full"
          variant="primary"
        >
          Request Skill Exchange
        </Button>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Posted {formatRelativeTime(skill.created_at)}
        </p>
      </div>
    </motion.div>
  )
}

export default SkillCard
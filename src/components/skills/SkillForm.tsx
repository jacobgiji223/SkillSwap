import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2, Sparkles } from 'lucide-react'
import { Button, Input, Modal } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { useGeolocation } from '../../hooks/useGeolocation'
import { supabase } from '../../lib/supabase'
import { skillCategories, difficultyLevels } from '../../lib/utils'

interface SkillFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface SkillFormData {
  title: string
  description: string
  category: string
  creditsPerHour: number
  maxDurationHours: number
  difficultyLevel: string
  tags: string[]
  locationName: string
}

const SkillForm: React.FC<SkillFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth()
  const { location, getCurrentLocation, setManualLocation } = useGeolocation()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState<SkillFormData>({
    title: '',
    description: '',
    category: '',
    creditsPerHour: 5,
    maxDurationHours: 2,
    difficultyLevel: 'beginner',
    tags: [],
    locationName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditsPerHour' || name === 'maxDurationHours' ? Number(value) : value
    }))
  }

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }))
        setTagInput('')
      }
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const generateAIContent = async () => {
    if (!formData.title.trim()) {
      setError('Please enter a skill title first')
      return
    }

    setAiLoading(true)
    setError('')

    try {
      const { data, error: aiError } = await supabase.functions.invoke('generate-skill-details', {
        body: { 
          skillName: formData.title,
          userContext: formData.description 
        }
      })

      if (aiError) throw aiError

      setFormData(prev => ({
        ...prev,
        description: data.description,
        category: data.category,
        creditsPerHour: data.creditsPerHour,
        difficultyLevel: data.difficultyLevel,
        tags: data.tags
      }))
    } catch (err) {
      console.error('AI generation error:', err)
      // Fallback to basic suggestions
      setFormData(prev => ({
        ...prev,
        description: `Learn and practice ${formData.title} with an experienced instructor. This skill will help you develop your abilities and gain practical knowledge.`,
        tags: [formData.title.toLowerCase()]
      }))
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Prepare skill data
      const skillData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        credits_per_hour: formData.creditsPerHour,
        max_duration_hours: formData.maxDurationHours,
        difficulty_level: formData.difficultyLevel,
        tags: formData.tags,
        location_name: formData.locationName || null,
        location_coordinates: location ? `POINT(${location.lng} ${location.lat})` : null
      }

      const { error: insertError } = await supabase
        .from('skills')
        .insert(skillData)

      if (insertError) throw insertError

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        creditsPerHour: 5,
        maxDurationHours: 2,
        difficultyLevel: 'beginner',
        tags: [],
        locationName: ''
      })
    } catch (err: any) {
      console.error('Error creating skill:', err)
      setError(err.message || 'Failed to create skill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Skill" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Skill Title with AI Button */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Skill Title *
            </label>
            <Button
              type="button"
              onClick={generateAIContent}
              disabled={!formData.title.trim() || aiLoading}
              size="sm"
              variant="ghost"
              className="flex items-center"
            >
              {aiLoading ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Sparkles size={16} className="mr-1" />
              )}
              {aiLoading ? 'Generating...' : 'AI Assist'}
            </Button>
          </div>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Python Programming, Guitar Lessons, French Cooking"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what you'll teach and what students will learn..."
          />
        </div>

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {skillCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficultyLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credits and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credits per Hour *
            </label>
            <Input
              type="number"
              name="creditsPerHour"
              value={formData.creditsPerHour}
              onChange={handleInputChange}
              min="1"
              max="20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Session Duration (hours)
            </label>
            <Input
              type="number"
              name="maxDurationHours"
              value={formData.maxDurationHours}
              onChange={handleInputChange}
              min="0.5"
              max="8"
              step="0.5"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (up to 5)
          </label>
          <div className="space-y-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Type a tag and press Enter"
              disabled={formData.tags.length >= 5}
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                name="locationName"
                value={formData.locationName}
                onChange={handleInputChange}
                placeholder="Enter city, neighborhood, or 'Online'"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <MapPin size={16} className="mr-1" />
                Use Current
              </Button>
            </div>
            {location && (
              <p className="text-sm text-green-600">
                Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Create Skill
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default SkillForm
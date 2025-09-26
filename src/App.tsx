import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthGuard from './components/auth/AuthGuard'
import Header from './components/layout/Header'
import SkillCard from './components/skills/SkillCard'
import SkillForm from './components/skills/SkillForm'
import SkillSearch, { SearchFilters } from './components/skills/SkillSearch'
import { Button } from './components/ui'
import { useAuth } from './hooks/useAuth'
import { useGeolocation } from './hooks/useGeolocation'
import { supabase } from './lib/supabase'
import type { Skill, Profile, SkillWithUser } from './types'

function App() {
  const { user } = useAuth()
  const { location, getCurrentLocation } = useGeolocation()
  
  const [skills, setSkills] = useState<SkillWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSkills = async (filters?: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('skills')
        .select(`
          *,
          profiles (*)
        `)
        .eq('is_active', true)

      // Apply filters
      if (filters) {
        if (filters.query) {
          query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
        }
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.difficulty) {
          query = query.eq('difficulty_level', filters.difficulty)
        }
        if (filters.minCredits > 0) {
          query = query.gte('credits_per_hour', filters.minCredits)
        }
        if (filters.maxCredits < 20) {
          query = query.lte('credits_per_hour', filters.maxCredits)
        }
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'recent'
      switch (sortBy) {
        case 'rating':
          query = query.order('profiles.average_rating', { ascending: false })
          break
        case 'credits_low':
          query = query.order('credits_per_hour', { ascending: true })
          break
        case 'credits_high':
          query = query.order('credits_per_hour', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error: fetchError } = await query.limit(20)

      if (fetchError) throw fetchError

      setSkills(data || [])
    } catch (err: any) {
      console.error('Error fetching skills:', err)
      setError('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSkills()
    }
  }, [user])

  const handleSearch = (filters: SearchFilters) => {
    fetchSkills(filters)
  }

  const handleSkillRequest = (skill: Skill) => {
    // TODO: Implement skill request modal
    console.log('Request skill:', skill)
  }

  const handleViewProfile = (userId: string) => {
    // TODO: Implement profile view modal
    console.log('View profile:', userId)
  }

  const handleSkillCreated = () => {
    fetchSkills() // Refresh skills list
  }

  if (!user) {
    return <AuthGuard><div /></AuthGuard>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header onCreateSkill={() => setShowSkillForm(true)} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Skills
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Connect with talented people in your community and exchange knowledge
            </p>
            
            {!location && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-700 mb-2">
                  Enable location to find skills near you
                </p>
                <Button
                  onClick={getCurrentLocation}
                  size="sm"
                  variant="outline"
                >
                  Enable Location
                </Button>
              </div>
            )}
          </motion.div>

          {/* Search Section */}
          <SkillSearch
            onSearch={handleSearch}
            showMap={showMap}
            onToggleView={() => setShowMap(!showMap)}
          />

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Skills Grid */}
          {!loading && skills.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onRequest={handleSkillRequest}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && skills.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills Found</h3>
              <p className="text-gray-600 mb-6">
                Be the first to share your skills with the community!
              </p>
              <Button onClick={() => setShowSkillForm(true)}>
                Add Your First Skill
              </Button>
            </motion.div>
          )}
        </main>

        {/* Skill Form Modal */}
        <SkillForm
          isOpen={showSkillForm}
          onClose={() => setShowSkillForm(false)}
          onSuccess={handleSkillCreated}
        />
      </div>
    </AuthGuard>
  )
}

export default App
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Map, List, MapPin } from 'lucide-react'
import { Button, Input } from '../ui'
import { skillCategories } from '../../lib/utils'

interface SkillSearchProps {
  onSearch: (filters: SearchFilters) => void
  showMap: boolean
  onToggleView: () => void
}

export interface SearchFilters {
  query: string
  category: string
  minCredits: number
  maxCredits: number
  difficulty: string
  radius: number
  sortBy: string
}

const SkillSearch: React.FC<SkillSearchProps> = ({
  onSearch,
  showMap,
  onToggleView
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minCredits: 0,
    maxCredits: 20,
    difficulty: '',
    radius: 50,
    sortBy: 'recent'
  })

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, onSearch])

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      minCredits: 0,
      maxCredits: 20,
      difficulty: '',
      radius: 50,
      sortBy: 'recent'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Main Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder="Search for skills, topics, or keywords..."
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="flex items-center"
        >
          <Filter size={16} className="mr-2" />
          Filters
        </Button>

        <Button
          onClick={onToggleView}
          variant="outline"
          className="flex items-center"
        >
          {showMap ? (
            <>
              <List size={16} className="mr-2" />
              List
            </>
          ) : (
            <>
              <Map size={16} className="mr-2" />
              Map
            </>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {skillCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="credits_low">Lowest Credits</option>
                <option value="credits_high">Highest Credits</option>
                <option value="distance">Nearest</option>
              </select>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={14} className="inline mr-1" />
                Radius ({filters.radius}km)
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Credit Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credits per Hour: {filters.minCredits} - {filters.maxCredits}
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="0"
                max="20"
                value={filters.minCredits}
                onChange={(e) => handleFilterChange('minCredits', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="range"
                min="0"
                max="20"
                value={filters.maxCredits}
                onChange={(e) => handleFilterChange('maxCredits', Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
            >
              Clear All Filters
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SkillSearch
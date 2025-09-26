import React from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, MessageCircle, User, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'
import { generateAvatarUrl } from '../../lib/utils'

interface HeaderProps {
  onCreateSkill: () => void
}

const Header: React.FC<HeaderProps> = ({ onCreateSkill }) => {
  const { profile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSwap</span>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search skills, people, or topics..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Create Skill Button */}
            <Button onClick={onCreateSkill} size="sm" className="hidden sm:flex">
              <Plus size={16} className="mr-2" />
              Add Skill
            </Button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bell size={20} />
            </motion.button>

            {/* Messages */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <MessageCircle size={20} />
            </motion.button>

            {/* Credits */}
            <div className="hidden sm:flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg">
              <span className="font-semibold">{profile?.credits || 0}</span>
              <span className="ml-1 text-sm">credits</span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
              >
                <img
                  src={profile?.avatar_url || generateAvatarUrl(profile?.full_name || 'User')}
                  alt={profile?.full_name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              </motion.button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
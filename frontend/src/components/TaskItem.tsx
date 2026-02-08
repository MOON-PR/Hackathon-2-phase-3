'use client'

import { useState, useRef, useEffect } from 'react'
import { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  index?: number
  onUpdate: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

const categories = ['General', 'Work', 'Personal', 'Shopping', 'Health']
const priorities = ['High', 'Medium', 'Low']

export default function TaskItem({ task, index = 0, onUpdate, onDelete, onToggleComplete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(task.description)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false)
        setShowPriorityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    if (editedDescription.trim() && editedDescription !== task.description) {
      onUpdate({ ...task, description: editedDescription.trim() })
    }
    setIsEditing(false)
  }

  const handleCategoryChange = (newCategory: string) => {
    onUpdate({ ...task, category: newCategory })
    setShowCategoryDropdown(false)
  }

  const handlePriorityChange = (newPriority: string) => {
    onUpdate({ ...task, priority: newPriority })
    setShowPriorityDropdown(false)
  }

  const priorityColors: { [key: string]: string } = {
    High: 'text-red-500 border-red-500/50',
    Medium: 'text-yellow-500 border-yellow-500/50',
    Low: 'text-green-500 border-green-500/50'
  }

  const priorityEmojis: { [key: string]: string } = {
    High: '🔴',
    Medium: '🟡',
    Low: '🟢'
  }

  const categoryEmojis: { [key: string]: string } = {
    General: '📁',
    Work: '💼',
    Personal: '👤',
    Shopping: '🛒',
    Health: '❤️'
  }

  return (
    <div
      className={`cyber-card p-4 transition-all duration-200 group hover:border-cyan-500/50 animate-fadeIn ${task.completed ? 'opacity-50 grayscale' : ''}`}
      style={{
        zIndex: showCategoryDropdown || showPriorityDropdown ? 50 : 1,
        animationDelay: `${index * 0.05}s`
      }}
      ref={containerRef}
    >
      <div className="flex items-start gap-4">
        {/* Toggle Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 border transition-all duration-300 flex items-center justify-center ${task.completed
            ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400'
            : 'bg-black border-gray-600 hover:border-cyan-400'
            }`}
        >
          {task.completed && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description - Editable */}
          {isEditing ? (
            <input
              type="text"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-2 py-1 text-sm bg-black border border-cyan-500 text-white focus:outline-none font-mono"
              autoFocus
            />
          ) : (
            <p
              className={`text-sm leading-relaxed break-words font-mono ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                }`}
              onClick={() => !task.completed && setIsEditing(true)}
            >
              {task.description}
            </p>
          )}

          {/* Wrapper for Tags and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Priority Tag */}
              <div className="relative">
                <button
                  onClick={() => !task.completed && setShowPriorityDropdown(!showPriorityDropdown)}
                  disabled={task.completed}
                  className={`text-xs px-2 py-0.5 border ${priorityColors[task.priority] || 'border-gray-600 text-gray-400'} bg-black/50 uppercase tracking-wider font-mono hover:bg-gray-900 transition-colors`}
                >
                  {task.priority}
                </button>
                {showPriorityDropdown && !task.completed && (
                  <div className="absolute top-full left-0 mt-1 bg-black/95 backdrop-blur-xl border border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-[100] min-w-[100px] rounded-sm overflow-hidden animate-fadeIn">
                    {priorities.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePriorityChange(p)}
                        className="block w-full px-3 py-2 text-xs text-left text-gray-400 hover:text-white hover:bg-cyan-900/30 uppercase font-mono transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Tag */}
              <div className="relative">
                <button
                  onClick={() => !task.completed && setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={task.completed}
                  className="text-xs px-2 py-0.5 border border-gray-700 text-gray-400 bg-black/50 uppercase tracking-wider font-mono hover:border-gray-500 hover:text-gray-300 transition-colors"
                >
                  {categoryEmojis[task.category]} {task.category}
                </button>
                {showCategoryDropdown && !task.completed && (
                  <div className="absolute top-full left-0 mt-1 bg-black/95 backdrop-blur-xl border border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-[100] min-w-[120px] rounded-sm overflow-hidden animate-fadeIn">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleCategoryChange(c)}
                        className="block w-full px-3 py-2 text-xs text-left text-gray-400 hover:text-white hover:bg-cyan-900/30 uppercase font-mono transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Tags */}
              {task.tags && task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 border border-cyan-900 text-cyan-700 bg-black/50 uppercase font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}
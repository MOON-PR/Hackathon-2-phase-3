'use client'

import { useState, useRef, useEffect } from 'react'
import { TaskCreate } from '../types/task'

interface TaskFormProps {
  onTaskAdded: (task: TaskCreate) => void
}

const categories = [
  { value: 'General', emoji: '📁' },
  { value: 'Work', emoji: '💼' },
  { value: 'Personal', emoji: '👤' },
  { value: 'Shopping', emoji: '🛒' },
  { value: 'Health', emoji: '❤️' },
]

const priorities = [
  { value: 'Low', emoji: '🟢', color: 'text-green-400' },
  { value: 'Medium', emoji: '🟡', color: 'text-yellow-400' },
  { value: 'High', emoji: '🔴', color: 'text-red-400' },
]

// Custom Dropdown Component
function CustomDropdown({
  options,
  value,
  onChange,
  disabled
}: {
  options: { value: string; emoji: string; color?: string }[]
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1 group" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-gray-700 text-white text-sm text-left flex items-center justify-between gap-2 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-3">
          <span className="filter grayscale group-hover:grayscale-0 transition-all">{selectedOption.emoji}</span>
          <span className={`font-mono uppercase tracking-wider text-xs sm:text-sm ${selectedOption.color || 'text-gray-300'}`}>{selectedOption.value}</span>
        </span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] z-[100] animate-fadeIn rounded-sm overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all border-b border-gray-800/50 last:border-0 hover:bg-cyan-900/20 group/item ${option.value === value
                ? 'bg-cyan-900/30 text-cyan-400'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <span className="filter grayscale group-hover/item:grayscale-0 transition-all">{option.emoji}</span>
              <span className={`font-mono uppercase text-xs sm:text-sm tracking-wider ${option.color || ''}`}>{option.value}</span>
              {option.value === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('Medium')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)
    try {
      await onTaskAdded({
        description: description.trim(),
        category,
        priority,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
      })
      setDescription('')
      setTags('')
      setCategory('General')
      setPriority('Medium')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description Input */}
      <div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ENTER TASK PROTOCOL..."
          className="input-field text-sm sm:text-base mb-2 font-mono"
          disabled={isSubmitting}
        />
        {/* Tags Input */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="TAGS (comma separated)"
          className="w-full px-4 py-2 bg-black border border-gray-800 text-gray-300 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 font-mono placeholder-gray-600"
          disabled={isSubmitting}
        />
      </div>

      {/* Category & Priority - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <CustomDropdown
          options={categories}
          value={category}
          onChange={setCategory}
          disabled={isSubmitting}
        />

        <CustomDropdown
          options={priorities}
          value={priority}
          onChange={setPriority}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={!description.trim() || isSubmitting}
          className="btn-primary flex-1 whitespace-nowrap min-w-[120px]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2 animate-pulse">
              UPLOADING...
            </span>
          ) : (
            <span className="font-mono uppercase">INITIALIZE</span>
          )}
        </button>
      </div>
    </form>
  )
}
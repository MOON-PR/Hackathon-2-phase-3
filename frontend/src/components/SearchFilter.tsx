'use client'

import { useState } from 'react'

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void
  onCategoryFilter: (category: string) => void
  onPriorityFilter: (priority: string) => void
  onSortChange: (sort: string) => void
  currentCategory: string
  currentPriority: string
  currentSort: string
}

const categories = [
  { value: 'All', emoji: '📋' },
  { value: 'General', emoji: '📁' },
  { value: 'Work', emoji: '💼' },
  { value: 'Personal', emoji: '👤' },
  { value: 'Shopping', emoji: '🛒' },
  { value: 'Health', emoji: '❤️' },
]

const priorities = [
  { value: 'All', emoji: '🔄' },
  { value: 'High', emoji: '🔴' },
  { value: 'Medium', emoji: '🟡' },
  { value: 'Low', emoji: '🟢' },
]

const sortOptions = [
  { value: 'created_at', label: 'CREATED' },
  { value: 'priority', label: 'PRIORITY' },
  { value: 'due_date', label: 'DUE DATE' },
]

export default function SearchFilter({
  onSearch,
  onCategoryFilter,
  onPriorityFilter,
  onSortChange,
  currentCategory,
  currentPriority,
  currentSort
}: SearchFilterProps) {
  const [search, setSearch] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="SEARCH DATABASE..."
          className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono text-sm"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('')
              onSearch('')
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryFilter(cat.value === 'All' ? '' : cat.value)}
              className={`px-3 py-1 border text-xs font-mono uppercase whitespace-nowrap transition-all ${(cat.value === 'All' && !currentCategory) || currentCategory === cat.value
                  ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400'
                  : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
            >
              {cat.emoji} <span className="hidden sm:inline ml-1">{cat.value}</span>
            </button>
          ))}
        </div>

        {/* Priority & Sort Controls */}
        <div className="flex gap-2">
          {/* Priority Select */}
          <select
            value={currentPriority || 'All'}
            onChange={(e) => onPriorityFilter(e.target.value === 'All' ? '' : e.target.value)}
            className="px-2 py-1 bg-black border border-gray-800 text-xs font-mono text-gray-400 focus:outline-none focus:border-cyan-500 uppercase"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value} className="bg-black">{p.emoji} {p.value}</option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={currentSort || 'created_at'}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2 py-1 bg-black border border-gray-800 text-xs font-mono text-gray-400 focus:outline-none focus:border-cyan-500 uppercase"
          >
            {sortOptions.map(s => (
              <option key={s.value} value={s.value} className="bg-black">SORT: {s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
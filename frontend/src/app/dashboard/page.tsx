'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TaskForm from '@/components/TaskForm'
import TaskList from '@/components/TaskList'
import SearchFilter from '@/components/SearchFilter'
import ChatWindow from '@/components/ChatWindow'
import SkeletonTask from '@/components/SkeletonTask'
import { authService } from '@/services/authService'
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation
} from '@/hooks/useTaskQueries'
import { Task, TaskCreate } from '@/types/task'

type SortOption = 'newest' | 'oldest' | 'priority' | 'alphabetical'

export default function DashboardPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [user, setUser] = useState<{ name: string | null; email: string | null } | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if chatbot should be shown (must be explicitly "true")
  const showChatbot = process.env.NEXT_PUBLIC_SHOW_CHATBOT === 'true'

  // React Query hooks - Server Side Filtering
  const { data: tasks = [], isLoading: loading } = useTasksQuery(
    searchTerm,
    categoryFilter,
    priorityFilter,
    undefined,
    sortBy === 'alphabetical' ? 'description' : (sortBy === 'priority' ? 'priority' : 'created_at'),
    sortBy === 'newest' ? 'desc' : (sortBy === 'oldest' ? 'asc' : 'asc')
  )

  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const toggleTaskMutation = useToggleTaskMutation()

  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        router.push('/login')
        return
      }
      setUser(authService.getUser())
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  const handleAddTask = async (taskData: TaskCreate) => {
    createTaskMutation.mutate(taskData)
  }

  const handleDelete = async (id: string) => {
    deleteTaskMutation.mutate(id)
  }

  const updateTask = async (updatedTask: Task) => {
    updateTaskMutation.mutate({
      id: updatedTask.id,
      data: {
        description: updatedTask.description,
        completed: updatedTask.completed,
        category: updatedTask.category,
        priority: updatedTask.priority
      }
    })
  }

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    toggleTaskMutation.mutate({ id, completed: !task.completed })
  }

  if (!authChecked) return null

  const activeTasksCount = tasks.filter(t => !t.completed).length
  const completedTasksCount = tasks.filter(t => !t.completed).length

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black text-white relative flex font-sans">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">

        {/* Header Stats Bar */}
        <div className="border-b border-gray-800 bg-gray-900/50 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-widest text-cyan-400 uppercase">
              Console // <span className="text-white">Dashboard</span>
            </h1>
            <p className="text-xs font-mono text-gray-500">OPERATOR: {user?.name?.toUpperCase() || 'UNKNOWN'}</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-black border border-gray-800 px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-sm text-gray-400">ACTIVE:</span>
              <span className="font-mono text-lg font-bold text-white">{activeTasksCount}</span>
            </div>
            <div className="bg-black border border-gray-800 px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-mono text-sm text-gray-400">DONE:</span>
              <span className="font-mono text-lg font-bold text-white">{completedTasksCount}</span>
            </div>

            {/* Chat Toggle (Desktop & Mobile) - Only show if NEXT_PUBLIC_SHOW_CHATBOT=true */}
            {showChatbot && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 border transition-all duration-300 flex items-center gap-2 ${showChat
                  ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden sm:inline font-mono text-xs font-bold uppercase">AI UPLINK</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-black">
            <div className="max-w-6xl mx-auto space-y-8 pb-24">

              {/* Command Input */}
              <div className="cyber-card p-0 overflow-visible">
                <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                  <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider mb-4">// NEW DIRECTIVE</h2>
                  <TaskForm onTaskAdded={handleAddTask} />
                </div>
              </div>

              {/* Filters */}
              <div className="cyber-card p-4">
                <SearchFilter
                  onSearch={setSearchTerm}
                  onCategoryFilter={setCategoryFilter}
                  onPriorityFilter={setPriorityFilter}
                  onSortChange={(val) => setSortBy(val as SortOption)}
                  currentCategory={categoryFilter || 'All'}
                  currentPriority={priorityFilter || 'All'}
                  currentSort={sortBy}
                />
              </div>

              {/* Task Stream */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-gray-800 flex-1"></div>
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">DATA STREAM</span>
                  <div className="h-px bg-gray-800 flex-1"></div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <SkeletonTask key={i} />
                    ))}
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onUpdateTask={updateTask}
                    onDeleteTask={handleDelete}
                    onToggleCompletion={toggleTaskCompletion}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chat Interface & Agents - Only show if NEXT_PUBLIC_SHOW_CHATBOT=true */}
      {showChatbot && (
        <div className={`
                  fixed inset-y-0 right-0 w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-gray-800 transform transition-transform duration-300 z-50 shadow-2xl
                  ${showChat ? 'translate-x-0' : 'translate-x-full'}
              `}>
          <div className="h-full flex flex-col relative">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-[1px] h-full bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"></div>

            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
              <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                AI_AGENT_UPLINK
              </h2>
              <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            {/* Integrated Chat Window */}
            <div className="flex-1 overflow-hidden bg-black/50 relative">
              {/* CSS Grid Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              <ChatWindow isEmbedded={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
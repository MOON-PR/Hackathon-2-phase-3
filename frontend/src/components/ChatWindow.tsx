'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '@/services/authService'
import { taskService } from '@/services/taskService'
import { useInvalidateTasks } from '@/hooks/useTaskQueries'
import ChatSidebar from './ChatSidebar'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface Conversation {
    id: number
    session_id: string
    title: string
    created_at: string
    updated_at: string
}

interface ChatWindowProps {
    isEmbedded?: boolean
}

export default function ChatWindow({ isEmbedded = false }: ChatWindowProps) {
    // Slash Command State
    const [showSlashMenu, setShowSlashMenu] = useState(false)
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const invalidateTasks = useInvalidateTasks()

    // Slash Commands Definition
    const slashCommands = [
        { command: '/add', description: 'Add a new task', example: '/add Buy groceries' },
        { command: '/list', description: 'Show all tasks', example: '/list' },
        { command: '/delete', description: 'Delete a task', example: '/delete 5' },
        { command: '/complete', description: 'Mark task as done', example: '/complete 3' },
        { command: '/update', description: 'Update a task', example: '/update 2 New title' },
        { command: '/search', description: 'Search tasks', example: '/search work' },
    ]
    const [isOpen, setIsOpen] = useState(isEmbedded)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(!isEmbedded) // Default closed sidebar in embedded mode to save space

    // Keep isOpen true if embedded
    useEffect(() => {
        if (isEmbedded) setIsOpen(true)
    }, [isEmbedded])
    const isProduction = process.env.NODE_ENV === 'production'


    // Force relative path in production to use Next.js proxy
    const API_URL = isProduction ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

    const router = useRouter()
    const searchParams = useSearchParams()

    // Sync URL with active conversation (Using UUID)
    useEffect(() => {
        if (activeConversationId) {
            const activeConv = conversations.find(c => c.id === activeConversationId)
            if (activeConv?.session_id) {
                router.push(`?chatId=${activeConv.session_id}`)
            }
        } else {
            // If explicitly null (New Chat), ensure URL is clear
            // But checking for '?' prevents infinite loops if already clear
            // router.push('?') 
            // Logic handled in handleNewChat
        }
    }, [activeConversationId, conversations, router])

    // Load active conversation from URL on mount (Using UUID)
    useEffect(() => {
        const chatIdParam = searchParams.get('chatId') // This is now a UUID

        // CRITICAL FIX: Detect and clear numeric chatId (legacy format)
        if (chatIdParam && /^\d+$/.test(chatIdParam)) {
            console.warn('⚠️ Detected numeric chatId (legacy format). Redirecting to clear URL...')
            router.push(window.location.pathname) // Clear query params
            return
        }

        if (chatIdParam && conversations.length > 0) {
            const conv = conversations.find(c => c.session_id === chatIdParam)
            if (conv) {
                if (conv.id !== activeConversationId) {
                    setActiveConversationId(conv.id)
                }
            }
        }
    }, [searchParams, conversations])


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // OPTIMIZED: Load conversations and initial data in parallel
    useEffect(() => {
        if (isOpen) {
            loadConversations()
        }
    }, [isOpen])

    // Load messages when conversation changes
    useEffect(() => {
        if (activeConversationId) {
            loadConversationMessages(activeConversationId)
        }
    }, [activeConversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadConversations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/`, {
                headers: { 'Authorization': `Bearer ${authService.getToken()}` }
            })
            if (response.ok) {
                const convs = await response.json()
                setConversations(convs)
            }
        } catch (error) {
            console.error('Failed to load conversations:', error)
        }
    }

    const loadConversationMessages = async (conversationId: number) => {
        setLoadingHistory(true)
        try {
            const response = await fetch(
                `${API_URL}/api/chat/history?conversation_id=${conversationId}&limit=50`,
                { headers: { 'Authorization': `Bearer ${authService.getToken()}` } }
            )

            if (response.ok) {
                const history = await response.json()
                setMessages(history.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content
                })))
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const createNewConversation = async (title: string = "New Chat") => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ title })
            })

            if (response.ok) {
                const newConv = await response.json()
                await loadConversations()
                return newConv
            }
        } catch (error) {
            console.error('Failed to create conversation:', error)
        }
        return null
    }

    const handleNewChat = async () => {
        try {
            // Clear URL and state immediately to prevent "Stuck" UI
            router.push('?')
            setActiveConversationId(null)
            setMessages([{
                role: 'assistant',
                content: 'UPLINK ESTABLISHED. AWAITING COMMANDS. TRY: "/ADD BUY MILK" OR "/LIST".'
            }])

            const newConv = await createNewConversation("New Chat");
            if (newConv) {
                // Determine effective messages
                const greeting: Message = {
                    role: 'assistant',
                    content: 'UPLINK ESTABLISHED. AWAITING COMMANDS. TRY: "/ADD BUY MILK" OR "/LIST".'
                };

                // Set active ID (Internal Int)
                setActiveConversationId(newConv.id);
                // URL will update via useEffect using newConv.session_id
            }
        } catch (error) {
            console.error("Failed to initiate new chat:", error);
        }
    }


    const handleSelectConversation = (id: number) => {
        setActiveConversationId(id)
        setMessages([]) // Clear immediately to avoid flash of old content
    }

    const handleDeleteConversation = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authService.getToken()}` }
            })

            if (response.ok) {
                setConversations(prev => prev.filter(c => c.id !== id))
                if (activeConversationId === id) {
                    handleNewChat()
                }
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error)
        }
    }

    const handleRenameConversation = async (id: number, newTitle: string) => {
        try {
            const response = await fetch(`${API_URL}/api/conversations/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ title: newTitle })
            })

            if (response.ok) {
                const updated = await response.json()
                setConversations(prev => prev.map(c => c.id === id ? updated : c))
            }
        } catch (error) {
            console.error('Failed to rename conversation:', error)
        }
    }

    const saveMessageToBackend = async (role: string, content: string, source?: string, conversationId?: number) => {
        try {
            await fetch(`${API_URL}/api/chat/save-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    role,
                    content,
                    source,
                    conversation_id: conversationId ?? activeConversationId
                })
            })
        } catch (error) {
            console.error('Failed to save message:', error)
        }
    }

    const queryClient = useQueryClient()

    // ... (existing code)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: 'user', content: input }
        const messageContent = input
        setInput('')
        setIsLoading(true)

        let currentConvId = activeConversationId;
        let messagesForApi = [...messages];

        if (!currentConvId) {
            // Fallback: If for some reason ID is missing, create it now (Lazy backup)
            const newId = await createNewConversation(messageContent);
            if (newId) {
                currentConvId = newId;
                setActiveConversationId(newId);
                setMessages(prev => [...prev, userMessage]);
                messagesForApi = [...messages, userMessage];
            }
        } else {
            // Existing conversation - just append
            setMessages(prev => [...prev, userMessage]);
            messagesForApi = [...messages, userMessage];
        }


        const convId = currentConvId; // Alias for compatibility with existing code

        saveMessageToBackend('user', userMessage.content, undefined, convId ?? undefined)

        try {
            const response = await fetch(`${API_URL}/api/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    messages: messagesForApi, // Explicitly use the determined history
                    model: "google/gemini-2.0-flash-exp:free",
                    conversation_id: currentConvId // Explicitly use the determined ID
                })
            })

            if (!response.ok) throw new Error('Failed to send message')

            const data = await response.json()
            const aiContent = data.response

            // ... (AI Source Log - NO CHANGE)

            // --- Tool Call Handling ---
            let toolExecuted = false;
            try {
                const jsonMatch = aiContent.match(/(\{[\s\S]*"tool"[\s\S]*"args"[\s\S]*\})/);

                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1]);
                        const toolArgs = parsed.args || {};

                        if (parsed.tool === 'add_task') {
                            // ... (Add Task Logic - NO CHANGE)
                            const newTaskData = {
                                description: toolArgs.title || toolArgs.description || 'New Task',
                                category: toolArgs.category || 'General',
                                priority: toolArgs.priority || 'Medium',
                                tags: []
                            };

                            const tempId = `temp-${Date.now()}`;
                            const tempTask = {
                                id: tempId,
                                ...newTaskData,
                                completed: false,
                                created_at: new Date().toISOString(),
                            };

                            queryClient.setQueryData(['tasks'], (old: any) => {
                                return old ? [...old, tempTask] : [tempTask]
                            })

                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: `✅ COMMAND EXECUTED: Added task "${tempTask.description}"`
                            }])
                            saveMessageToBackend('assistant', `✅ COMMAND EXECUTED: Added task "${tempTask.description}"`, data.source, convId ?? undefined)
                            toolExecuted = true;

                            taskService.createTask(newTaskData).then(() => {
                                invalidateTasks();
                            }).catch(err => {
                                console.error("Failed to create task via chatbot:", err);
                                invalidateTasks();
                                setMessages(prev => [...prev, { role: 'assistant', content: `❌ ERROR: Failed to add task.` }]);
                            });

                        } else if (parsed.tool === 'delete_task') {
                            const taskId = toolArgs.task_id;
                            if (taskId) {
                                // Optimistic Delete
                                queryClient.setQueryData(['tasks'], (old: any) => {
                                    return old ? old.filter((t: any) => t.id !== taskId) : []
                                })

                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: `✅ COMMAND EXECUTED: Deleted task.`
                                }])
                                saveMessageToBackend('assistant', `✅ COMMAND EXECUTED: Deleted task`, data.source, convId ?? undefined)
                                toolExecuted = true;

                                taskService.deleteTask(taskId).then(() => {
                                    invalidateTasks();
                                }).catch(err => {
                                    console.error("Failed to delete task via chatbot:", err);
                                    invalidateTasks();
                                    setMessages(prev => [...prev, { role: 'assistant', content: `❌ ERROR: Failed to delete task.` }]);
                                });
                            } else {
                                // If no ID, maybe ask user?
                                setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ MISSING PARAM: Please specify the task ID.` }]);
                            }

                        } else if (parsed.tool === 'update_task') {
                            const taskId = toolArgs.task_id;
                            if (taskId) {
                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: `✅ COMMAND EXECUTED: Updated task.`
                                }])
                                saveMessageToBackend('assistant', `✅ COMMAND EXECUTED: Updated task`, data.source, convId ?? undefined)
                                toolExecuted = true;

                                taskService.updateTask(taskId, toolArgs).then(() => {
                                    invalidateTasks();
                                }).catch(err => {
                                    console.error("Failed to update task via chatbot:", err);
                                    invalidateTasks();
                                    setMessages(prev => [...prev, { role: 'assistant', content: `❌ ERROR: Failed to update task.` }]);
                                });
                            } else {
                                setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ MISSING PARAM: Please specify the task ID.` }]);
                            }

                        } else if (parsed.tool === 'list_tasks') {
                            toolExecuted = true;
                            invalidateTasks();
                            // Add a "listing" message so user knows it happened
                            setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: `📋 FETCHING CURRENT TASKS...`
                            }])
                            saveMessageToBackend('assistant', `📋 FETCHING CURRENT TASKS...`, data.source, convId ?? undefined)
                        }
                    } catch (e) {
                        console.error("Failed to parse found JSON:", e);
                    }
                }
            } catch (e) {
                console.error("Failed to parse tool call:", e);
            }

            // Only add the original AI message if it wasn't a tool call
            if (!toolExecuted) {
                const assistantMessage = { role: 'assistant' as const, content: aiContent }
                setMessages(prev => [...prev, assistantMessage])
                saveMessageToBackend('assistant', data.response, data.source, convId ?? undefined)
            }
            // --------------------------

            // Re-fetch to confirm true state from backend (replaces optimistic data)
            invalidateTasks()

        } catch (error) {
            const errorMessage = { role: 'assistant' as const, content: 'CONNECTION FAIL. RETRY INITIATED.' }
            setMessages(prev => [...prev, errorMessage])
            // On error, we should ideally revert, but invalidating will fix it on next sync or user can retry
            invalidateTasks()
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInput(value)

        if (value.startsWith('/') && value.length > 0) {
            setShowSlashMenu(true)
            setSelectedCommandIndex(0)
        } else {
            setShowSlashMenu(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSlashMenu) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedCommandIndex(prev => prev < slashCommands.length - 1 ? prev + 1 : 0)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedCommandIndex(prev => prev > 0 ? prev - 1 : slashCommands.length - 1)
            } else if (e.key === 'Tab') {
                e.preventDefault()
                setInput(slashCommands[selectedCommandIndex].command + ' ')
                setShowSlashMenu(false)
            } else if (e.key === 'Escape') {
                setShowSlashMenu(false)
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                setShowSlashMenu(false)
                handleSend()
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const selectCommand = (command: string) => {
        setInput(command + ' ')
        setShowSlashMenu(false)
    }



    if (isEmbedded) {
        return (
            <div className="flex flex-col h-full w-full bg-black/50 font-mono relative overflow-hidden">
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar List (Overlay in embedded mode) */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                className="absolute inset-y-0 left-0 z-20 w-64 bg-black/95 backdrop-blur-xl border-r border-cyan-500/30 shadow-2xl"
                            >
                                <ChatSidebar
                                    conversations={conversations}
                                    activeConversationId={activeConversationId}
                                    onSelectConversation={(id) => {
                                        handleSelectConversation(id)
                                        setSidebarOpen(false) // Auto close on select
                                    }}
                                    onNewChat={() => {
                                        handleNewChat()
                                        setSidebarOpen(false)
                                    }}
                                    onDeleteConversation={handleDeleteConversation}
                                    onRenameConversation={handleRenameConversation}
                                    isOpen={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-transparent relative w-full">
                        {/* Header */}
                        <div className="p-3 bg-black/40 border-b border-gray-800 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className={`p-1.5 rounded-sm transition-all border ${sidebarOpen ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    {isLoading ? 'PROCESSING...' : 'ONLINE'}
                                </span>
                            </div>
                            <button
                                onClick={() => invalidateTasks()}
                                className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-500/30 rounded-sm"
                                title="REFRESH DATA"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {loadingHistory ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="text-cyan-500 text-xs animate-pulse">LOADING ARCHIVES...</div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[90%] p-3 text-sm border backdrop-blur-sm ${msg.role === 'user'
                                                    ? 'bg-cyan-900/10 text-cyan-50 border-cyan-500/30 rounded-br-none rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                                    : 'bg-black/40 border-gray-700 text-gray-300 rounded-bl-none rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-black/40 border border-gray-700 p-3 rounded-tr-lg rounded-tl-lg rounded-br-lg">
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-black/40 border-t border-gray-800 backdrop-blur-md">
                            <div className="relative">
                                {/* Slash Command Menu */}
                                {showSlashMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-full bg-black/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden z-20 rounded-t-sm">
                                        <div className="bg-cyan-900/20 px-3 py-1 text-[10px] text-cyan-400 border-b border-cyan-500/30">AVAILABLE PROTOCOLS</div>
                                        {slashCommands.map((cmd, idx) => (
                                            <div
                                                key={cmd.command}
                                                onClick={() => selectCommand(cmd.command)}
                                                className={`px-3 py-2 cursor-pointer transition-all border-b border-gray-800/50 last:border-0 ${idx === selectedCommandIndex
                                                    ? 'bg-cyan-900/40 text-white'
                                                    : 'hover:bg-gray-900 text-gray-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-cyan-400 font-bold text-xs min-w-[60px]">
                                                        {cmd.command}
                                                    </span>
                                                    <span className="text-xs flex-1 truncate opacity-75">
                                                        {cmd.description}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 font-bold">{'>'}</span>
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="ENTER COMMAND..."
                                            disabled={isLoading || loadingHistory}
                                            className="w-full bg-black/50 border border-gray-700 rounded-none px-8 py-2 text-sm text-cyan-100 placeholder-gray-700 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 font-mono"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim() || loadingHistory}
                                        className="px-3 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-[10px] font-bold tracking-wider"
                                    >
                                        SEND
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-mono">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="mb-4 bg-black border border-cyan-500/50 shadow-2xl flex overflow-hidden shadow-cyan-900/30"
                            style={{ width: sidebarOpen ? '600px' : '380px', height: '480px' }}
                        >
                            {/* Sidebar */}
                            <ChatSidebar
                                conversations={conversations}
                                activeConversationId={activeConversationId}
                                onSelectConversation={handleSelectConversation}
                                onNewChat={handleNewChat}
                                onDeleteConversation={handleDeleteConversation}
                                onRenameConversation={handleRenameConversation}
                                isOpen={sidebarOpen}
                            />

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col bg-black/95 relative">
                                {/* Grid Background Effect */}
                                <div className="absolute inset-0 z-0 opacity-10" style={{
                                    backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}></div>

                                {/* Header */}
                                <div className="p-3 bg-gray-900/80 border-b border-cyan-500/30 flex justify-between items-center z-10">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSidebarOpen(!sidebarOpen)}
                                            className="p-1 hover:bg-cyan-900/50 rounded-sm transition-colors text-cyan-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </button>
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse border border-cyan-300" />
                                        <h3 className="font-bold text-cyan-500 tracking-widest text-sm">AI_AGENT // UPLINK</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => invalidateTasks()}
                                            className="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
                                            title="REFRESH DATA"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10">
                                    {loadingHistory ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="text-cyan-500 text-xs animate-pulse">LOADING ARCHIVES...</div>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] p-3 text-sm border ${msg.role === 'user'
                                                            ? 'bg-cyan-900/20 text-cyan-100 border-cyan-500/50 rounded-br-none rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                                            : 'bg-black border-gray-700 text-gray-300 rounded-bl-none rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                                            }`}
                                                    >
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-black border border-gray-700 p-3 rounded-tr-lg rounded-tl-lg rounded-br-lg">
                                                        <div className="flex gap-1">
                                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-black border-t border-gray-800 z-10">
                                    <div className="relative">
                                        {/* Slash Command Menu */}
                                        {showSlashMenu && (
                                            <div className="absolute bottom-full left-0 mb-2 w-full bg-black border border-cyan-500/50 shadow-xl overflow-hidden z-20">
                                                <div className="bg-cyan-900/20 px-3 py-1 text-[10px] text-cyan-400 border-b border-cyan-500/30">AVAILABLE PROTOCOLS</div>
                                                {slashCommands.map((cmd, idx) => (
                                                    <div
                                                        key={cmd.command}
                                                        onClick={() => selectCommand(cmd.command)}
                                                        className={`px-3 py-2 cursor-pointer transition-all border-b border-gray-800 last:border-0 ${idx === selectedCommandIndex
                                                            ? 'bg-cyan-900/40 text-white'
                                                            : 'hover:bg-gray-900 text-gray-400'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-cyan-400 font-bold text-xs min-w-[70px]">
                                                                {cmd.command}
                                                            </span>
                                                            <span className="text-xs flex-1 truncate">
                                                                {cmd.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 font-bold">{'>'}</span>
                                                <input
                                                    type="text"
                                                    value={input}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="ENTER COMMAND..."
                                                    disabled={isLoading || loadingHistory}
                                                    className="w-full bg-black border border-gray-700 rounded-none px-8 py-2 text-sm text-cyan-100 placeholder-gray-700 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 font-mono"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSend}
                                                disabled={isLoading || !input.trim() || loadingHistory}
                                                className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase text-xs font-bold"
                                            >
                                                SEND
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-black p-4 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors"></div>
                    {isOpen ? (
                        <div className="relative z-10">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

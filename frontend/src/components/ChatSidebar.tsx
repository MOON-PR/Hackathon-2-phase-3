'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Conversation {
    id: number
    title: string
    created_at: string
    updated_at: string
}

interface ChatSidebarProps {
    conversations: Conversation[]
    activeConversationId: number | null
    onSelectConversation: (id: number) => void
    onNewChat: () => void
    onDeleteConversation: (id: number) => void
    onRenameConversation: (id: number, newTitle: string) => void
    isOpen: boolean
}

export default function ChatSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    onRenameConversation,
    isOpen
}: ChatSidebarProps) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editTitle, setEditTitle] = useState('')

    const startEditing = (conv: Conversation) => {
        setEditingId(conv.id)
        setEditTitle(conv.title)
    }

    const saveEdit = (id: number) => {
        if (editTitle.trim()) {
            onRenameConversation(id, editTitle.trim())
        }
        setEditingId(null)
    }

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (confirm('TERMINATE CONNECTION?')) {
            onDeleteConversation(id)
        }
    }

    if (!isOpen) return null

    return (
        <div className="w-64 bg-black border-r border-gray-800 flex flex-col h-full font-mono">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 rounded-sm transition-all uppercase tracking-wider text-xs group"
                >
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>INITIATE LINK</span>
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <AnimatePresence>
                    {conversations.map((conv) => (
                        <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`group relative px-3 py-3 mb-1 cursor-pointer transition-all border-l-2 ${activeConversationId === conv.id
                                ? 'bg-gray-900 border-cyan-500 text-cyan-400'
                                : 'hover:bg-gray-900/50 border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            {editingId === conv.id ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => saveEdit(conv.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(conv.id)
                                        if (e.key === 'Escape') setEditingId(null)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-black border border-cyan-500 px-2 py-1 text-xs text-white focus:outline-none uppercase"
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs truncate flex-1 uppercase tracking-tight">
                                            {conv.title}
                                        </p>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    startEditing(conv)
                                                }}
                                                className="p-1 hover:text-white"
                                                title="Rename"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, conv.id)}
                                                className="p-1 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] opacity-40 truncate mt-1 font-mono">
                                        {new Date(conv.updated_at).toLocaleDateString()} // {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {conversations.length === 0 && (
                    <div className="p-4 text-center">
                        <p className="text-gray-600 text-xs uppercase tracking-widest">NO ACTIVE LINKS</p>
                        <p className="text-gray-700 text-[10px] mt-2">Initialize new connection</p>
                    </div>
                )}
            </div>
        </div>
    )
}

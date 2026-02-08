'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'

export default function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(authService.isAuthenticated())
    }, [])

    return (
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-900/20 to-transparent pointer-events-none" />

            {/* Hero Section */}
            <section className="relative px-6 lg:px-12 pt-24 pb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <div className="animate-fadeIn">
                        <div className="inline-block border border-cyan-500/30 bg-cyan-950/20 px-4 py-1 mb-6 text-cyan-400 text-sm font-mono tracking-widest uppercase">
                            System Online • Phase 3 Complete
                        </div>
                        {/* Hero Section */}
                        <div className="relative z-10 text-center px-4 py-20">
                            <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse">
                                    NEONTASK
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-cyan-300 mb-4 font-mono uppercase tracking-wider">
                                // Cyberpunk Task Manager
                            </p>
                            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                                Next-gen task management powered by AI. Sync your workflow in the digital realm.
                                <span className="text-cyan-400 font-mono"> &gt;_</span>
                            </p>
                            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
                                <br />Powered by <span className="text-cyan-400">Gemini 2.0</span> & <span className="text-cyan-400">Docker</span>.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-primary">
                                    Enter System
                                </Link>
                            ) : (
                                <>
                                    <Link href="/signup" className="btn-primary">
                                        Initialize Access
                                    </Link>
                                    <Link href="/login" className="btn-secondary">
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hero Graphic - Cyberpunk Image */}
                    <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full hidden lg:block animate-slideSnap group perspective-1000">
                        <div className="absolute inset-4 bg-black border-4 border-gray-800 rounded-lg shadow-2xl transform rotate-y-12 transition-transform duration-500 group-hover:rotate-y-0 relative overflow-hidden h-full">
                            <Image
                                src="/hero-cyberpunk.png"
                                alt="Cyberpunk ToDo Hero"
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                priority
                            />
                            {/* Overlay Scanlines */}
                            {/* CSS Grid Background - No image needed */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                                backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}></div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats / Phases */}
            <section className="border-y border-gray-800 bg-black/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
                    <div className="p-4">
                        <div className="text-4xl font-bold text-white mb-2">Phase 2</div>
                        <div className="text-cyan-400 text-sm uppercase tracking-wider">Full-Stack MVP</div>
                    </div>
                    <div className="p-4">
                        <div className="text-4xl font-bold text-white mb-2">Phase 3</div>
                        <div className="text-cyan-400 text-sm uppercase tracking-wider">AI Chatbot Integration</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 lg:px-12 py-24">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 border-l-4 border-orange-500 pl-4">System Capabilities</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Docker Containerized', desc: 'Fully isolated efficient environments.', color: 'border-cyan-500' },
                            { title: 'Kubernetes Ready', desc: 'Scalable orchestration with Minikube.', color: 'border-blue-500' },
                            { title: 'AI DevOps Agents', desc: 'Automated CI/CD and deployment tasks.', color: 'border-purple-500' },
                            { title: 'Gemini 2.0 Flash', desc: 'High-speed natural language processing.', color: 'border-orange-500' },
                            { title: 'Secure JWT Auth', desc: 'Stateless, secure session management.', color: 'border-green-500' },
                            { title: 'Real-time Chat', desc: 'Interactive task management interface.', color: 'border-pink-500' },
                        ].map((item, i) => (
                            <div key={i} className={`cyber-card group`}>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 bg-black py-12 text-center">
                <p className="text-gray-500 font-mono text-sm">
                    ENGINEERED BY <span className="text-cyan-400">RAIF TAYYAB MEMON</span>
                </p>
                <div className="mt-4 text-xs text-gray-700">
                    SYSTEM VERSION 4.0.0 // HACKATHON BUILD
                </div>
            </footer>
        </div>
    )
}

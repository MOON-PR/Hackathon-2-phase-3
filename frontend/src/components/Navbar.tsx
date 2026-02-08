'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authService } from '@/services/authService'

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = authService.isAuthenticated()
            setIsLoggedIn(authenticated)
            if (authenticated) {
                const user = authService.getUser()
                setUserName(user?.name || 'User')
            }
        }
        checkAuth()
        setMobileMenuOpen(false)
    }, [pathname])

    const handleLogout = () => {
        authService.logout()
        setIsLoggedIn(false)
        setUserName('')
        setMobileMenuOpen(false)
        router.push('/')
    }

    const isHomePage = pathname === '/'
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password'
    const isDashboard = pathname === '/dashboard'

    return (
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 safe-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        {!isHomePage && !isAuthPage && (
                            <button
                                onClick={() => router.back()}
                                className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                ← BACK
                            </button>
                        )}

                        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-cyan-500/50 group-hover:border-cyan-400 transition-colors">
                                <img src="/icon.png" alt="Icon" className="object-cover w-full h-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-widest leading-none" style={{ fontFamily: 'monospace' }}>
                                    NEON<span className="text-cyan-400">TASK</span>
                                </span>
                                <span className="text-[10px] text-cyan-500/70 tracking-[0.2em] font-mono">CYBERPUNK v4.0</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isLoggedIn ? (
                            <>
                                <span className="text-gray-400 text-sm font-mono border border-gray-800 px-3 py-1">
                                    USER: <span className="text-white">{userName}</span>
                                </span>
                                {!isDashboard && (
                                    <Link href="/dashboard" className="text-cyan-400 hover:text-white font-mono text-sm uppercase tracking-wider">
                                        [ Dashboard ]
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-400 font-mono text-sm uppercase tracking-wider">
                                    [ Logout ]
                                </button>
                            </>
                        ) : (
                            <>
                                {!isAuthPage && (
                                    <>
                                        <Link href="/login" className="text-gray-300 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider transition-colors">
                                            Login
                                        </Link>
                                        <Link href="/signup" className="btn-primary py-2 px-4 text-sm">
                                            Access System
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-cyan-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-60 border-t border-gray-800' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-2 p-4 bg-gray-900/50">
                        {isLoggedIn ? (
                            <>
                                <div className="text-gray-400 text-sm font-mono mb-2">
                                    Logged in as: <span className="text-cyan-400">{userName}</span>
                                </div>
                                {!isDashboard && (
                                    <Link
                                        href="/dashboard"
                                        className="text-white hover:text-cyan-400 py-2 font-mono uppercase"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        &gt; Go to Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-red-500 hover:text-red-400 py-2 text-left font-mono uppercase"
                                >
                                    &gt; Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {!isAuthPage && (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-white hover:text-cyan-400 py-2 font-mono uppercase"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            &gt; Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="text-cyan-400 hover:text-white py-2 font-mono uppercase"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            &gt; Access System
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

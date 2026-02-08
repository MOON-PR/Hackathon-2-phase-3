'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await authService.login(email, password)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="cyber-card w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">SYSTEM LOGIN</h1>
                    <p className="text-cyan-400 font-mono text-xs uppercase">Authenticate to access RTM-01 Console</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 mb-6 font-mono text-sm">
                        [ERROR]: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Identity / Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="user@system.local"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                        <label className="flex items-center text-gray-400 hover:text-cyan-400 cursor-pointer">
                            <input type="checkbox" className="mr-2 accent-cyan-500 bg-gray-900 border-gray-700" />
                            REMEMBER SESSION
                        </label>
                        <Link href="/forgot-password" className="text-cyan-400 hover:text-white transition-colors">
                            RESET ACCESS?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-base relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="animate-pulse">AUTHENTICATING...</span>
                        ) : (
                            <>
                                <span className="relative z-10">INITIATE SESSION</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center font-mono text-xs">
                    <span className="text-gray-500">NEW USER DETECTED?</span>
                    <Link href="/signup" className="ml-2 text-orange-500 hover:text-orange-400 font-bold uppercase">
                        CREATE IDENTITY &rarr;
                    </Link>
                </div>
            </div>
        </div>
    )
}

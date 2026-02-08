'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically call an API to send the reset link
        setSubmitted(true)
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-900/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="cyber-card w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">RECOVERY MODE</h1>
                    <p className="text-orange-500 font-mono text-xs uppercase">Initiate Access Restoration Protocol</p>
                </div>

                {submitted ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✓</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">SIGNAL TRANSMITTED</h3>
                        <p className="text-gray-400 font-mono text-sm">
                            Check your secure comms channel ({email}) for restoration codes.
                        </p>
                        <Link href="/login" className="btn-primary inline-block w-full text-center">
                            RETURN TO CONSOLE
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-gray-400 font-mono text-sm text-center mb-6">
                            Enter your registered Identity Channel (Email) to receive recovery directives.
                        </p>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Comms Link (Email)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="user@system.local"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-4 text-base"
                        >
                            TRANSMIT RECOVERY SIGNAL
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-800 text-center font-mono text-xs">
                    <Link href="/login" className="text-gray-500 hover:text-white transition-colors">
                        ← ABORT RECOVERY
                    </Link>
                </div>
            </div>
        </div>
    )
}

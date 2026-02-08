/**
 * Global Auth Context with In-Memory Token Caching
 * Eliminates localStorage reads on every request
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
    id: string
    email: string
    name: string | null
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (email: string, password: string, name: string) => Promise<void>
    logout: () => void
    getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
const TOKEN_KEY = 'todo_jwt_token'
const USER_KEY = 'todo_user'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize from localStorage on mount (one-time read)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem(TOKEN_KEY)
            const storedUser = localStorage.getItem(USER_KEY)

            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            }
            setIsLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Login failed' }))
            throw new Error(error.detail || 'Invalid email or password')
        }

        const data = await response.json()

        // Update in-memory cache
        setToken(data.token)
        setUser(data.user)

        // Persist to localStorage (async, non-blocking)
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    }

    const signup = async (email: string, password: string, name: string) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Signup failed' }))
            throw new Error(error.detail || 'Signup failed')
        }

        const data = await response.json()

        // Update in-memory cache
        setToken(data.token)
        setUser(data.user)

        // Persist to localStorage (async, non-blocking)
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    }

    const getToken = () => token

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                signup,
                logout,
                getToken,
            }}
        >
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

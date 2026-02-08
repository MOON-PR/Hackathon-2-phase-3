import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import QueryProvider from '../providers/QueryProvider'
import { Toaster } from 'react-hot-toast'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'NEONTASK - Cyberpunk Task Manager',
    description: 'Next-gen task management with AI-powered assistance. Sync your workflow in the digital realm.',
    icons: {
        icon: '/favicon.ico',
        apple: '/icon.png',
    },
    manifest: '/manifest.json',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${outfit.className} bg-black min-h-screen text-white`}>
                <QueryProvider>
                    <Navbar />
                    <main className="min-h-[calc(100vh-64px)]">
                        {children}
                    </main>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#1a1a1a',
                                color: '#fff',
                                border: '1px solid #333',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </QueryProvider>
            </body>
        </html>
    )
}

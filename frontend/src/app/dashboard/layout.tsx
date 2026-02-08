import ChatWindow from '@/components/ChatWindow'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Chatbot toggle configuration
    const showChatbot = process.env.NEXT_PUBLIC_SHOW_CHATBOT === 'true'

    return (
        <div className="relative min-h-screen">
            {children}
            {showChatbot && <ChatWindow />}
        </div>
    )
}

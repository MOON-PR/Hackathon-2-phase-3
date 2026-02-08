export default function SkeletonTask() {
    return (
        <div className="border border-gray-800 bg-black/50 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }}></div>
            <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-gray-900 border border-gray-800"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-900 w-3/4"></div>
                    <div className="flex gap-2">
                        <div className="h-3 bg-gray-900 w-16"></div>
                        <div className="h-3 bg-gray-900 w-16"></div>
                    </div>
                </div>
                <div className="w-5 h-5 bg-gray-900"></div>
            </div>
        </div>
    )
}

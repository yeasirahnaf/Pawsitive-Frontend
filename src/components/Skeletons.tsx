export function SkeletonCard() {
    return (
        <div className="card bg-base-100 border border-base-300 h-full">
            <div className="skeleton aspect-square rounded-t-2xl w-full" />
            <div className="card-body p-4 gap-3">
                <div className="skeleton h-3 w-16 rounded-full" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="flex justify-between items-center mt-2">
                    <div className="skeleton h-5 w-20 rounded" />
                    <div className="skeleton h-8 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const cls = { sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' }[size];
    return (
        <div className="flex justify-center items-center py-12">
            <span className={`loading loading-spinner text-primary ${cls}`} />
        </div>
    );
}

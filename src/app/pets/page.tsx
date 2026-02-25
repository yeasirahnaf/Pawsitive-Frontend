import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getPets, type PetListParams } from '@/services/pets';
import PetCard from '@/components/PetCard';
import FilterSidebar from '@/components/FilterSidebar';
import ShopToolbar from '@/components/ShopToolbar';
import { SkeletonGrid } from '@/components/Skeletons';
import { Icon } from '@iconify/react';

export const metadata: Metadata = {
    title: 'Shop – Browse All Pets',
    description: 'Filter by species, breed, gender, size and price to find your perfect pet companion.',
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PetsPage({ searchParams }: Props) {
    const sp = await searchParams;

    const params: PetListParams = {
        search: sp.search,
        species: sp.species,
        breed: sp.breed,
        gender: sp.gender as PetListParams['gender'],
        size: sp.size as PetListParams['size'],
        min_price: sp.min_price ? Number(sp.min_price) : undefined,
        max_price: sp.max_price ? Number(sp.max_price) : undefined,
        min_age: sp.min_age ? Number(sp.min_age) : undefined,
        max_age: sp.max_age ? Number(sp.max_age) : undefined,
        sort_by: (sp.sort_by as PetListParams['sort_by']) ?? 'created_at',
        sort_dir: (sp.sort_dir as PetListParams['sort_dir']) ?? 'desc',
        per_page: 12,
        page: sp.page ? Number(sp.page) : 1,
    };

    let pets: Awaited<ReturnType<typeof getPets>>['data'] = [];
    let meta = { current_page: 1, last_page: 1, per_page: 12, total: 0 };

    try {
        const res = await getPets(params);
        pets = res.data;
        meta = res.meta;
    } catch {
        /* API unavailable — show empty state */
    }

    const buildPageUrl = (page: number) => {
        const q = new URLSearchParams(sp as Record<string, string>);
        q.set('page', String(page));
        return `/pets?${q.toString()}`;
    };

    const hasFilters = !!(sp.search || sp.species || sp.breed || sp.gender || sp.size || sp.min_price || sp.max_price);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 min-h-screen">

            {/* ── Page header ── */}
            <div className="mb-8">
                <div className="breadcrumbs text-sm text-base-content/50 mb-2">
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li>Shop</li>
                    </ul>
                </div>
                <h1 className="text-3xl font-bold">Browse Pets</h1>
                <p className="text-base-content/50 mt-1">Find your perfect companion from our curated listings</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

                {/* ── Filter sidebar ── */}
                <aside className="w-full md:w-56 lg:w-64 shrink-0">
                    <div className="sticky top-20">
                        <Suspense fallback={<div className="skeleton w-full h-96 rounded-2xl" />}>
                            <FilterSidebar />
                        </Suspense>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <div className="flex-1 min-w-0">

                    {/* Toolbar: search + sort */}
                    <Suspense fallback={<div className="skeleton h-10 w-full rounded-xl mb-6" />}>
                        <ShopToolbar total={meta.total} />
                    </Suspense>

                    {/* Active filter chips */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {sp.search && <FilterChip label={`"${sp.search}"`} paramKey="search" sp={sp} />}
                            {sp.species && <FilterChip label={sp.species} paramKey="species" sp={sp} />}
                            {sp.gender && <FilterChip label={sp.gender} paramKey="gender" sp={sp} />}
                            {sp.size && <FilterChip label={sp.size} paramKey="size" sp={sp} />}
                            {(sp.min_price || sp.max_price) && (
                                <FilterChip label={`৳${sp.min_price ?? 0}–${sp.max_price ?? '∞'}`} paramKey="min_price" sp={sp} extra="max_price" />
                            )}
                        </div>
                    )}

                    {/* Pet grid */}
                    <Suspense fallback={<SkeletonGrid count={12} />}>
                        {pets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {pets.map((pet) => (
                                    <PetCard key={pet.id} pet={pet} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-24 text-base-content/40">
                                <Icon icon="lucide:search-x" width={52} />
                                <p className="text-lg font-medium">No pets found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                                <Link href="/pets" className="btn btn-outline btn-sm rounded-full">Clear all filters</Link>
                            </div>
                        )}
                    </Suspense>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex justify-center mt-10">
                            <div className="join">
                                {meta.current_page > 1 && (
                                    <Link href={buildPageUrl(meta.current_page - 1)} className="join-item btn btn-sm btn-outline">
                                        «
                                    </Link>
                                )}
                                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={buildPageUrl(page)}
                                        className={`join-item btn btn-sm ${page === meta.current_page ? 'btn-primary' : 'btn-outline'}`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                {meta.current_page < meta.last_page && (
                                    <Link href={buildPageUrl(meta.current_page + 1)} className="join-item btn btn-sm btn-outline">
                                        »
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Small inline helper ─────────────────────────────────────────────────── */
function FilterChip({
    label, paramKey, sp, extra,
}: {
    label: string;
    paramKey: string;
    sp: Record<string, string | undefined>;
    extra?: string;
}) {
    const q = new URLSearchParams(sp as Record<string, string>);
    q.delete(paramKey);
    if (extra) q.delete(extra);
    q.delete('page');

    return (
        <Link href={`/pets?${q.toString()}`} className="badge badge-outline gap-1 hover:badge-error transition-colors">
            {label} <Icon icon="lucide:x" width={12} />
        </Link>
    );
}

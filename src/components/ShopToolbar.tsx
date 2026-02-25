'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Icon } from '@iconify/react';

const SORT_OPTIONS = [
    { value: 'created_at:desc', label: 'Newest First' },
    { value: 'created_at:asc', label: 'Oldest First' },
    { value: 'price:asc', label: 'Price: Low → High' },
    { value: 'price:desc', label: 'Price: High → Low' },
    { value: 'age_months:asc', label: 'Age: Youngest' },
    { value: 'age_months:desc', label: 'Age: Oldest' },
];

export default function ShopToolbar({ total }: { total: number }) {
    const router = useRouter();
    const params = useSearchParams();
    const [, startTransition] = useTransition();

    const currentSort = `${params.get('sort_by') ?? 'created_at'}:${params.get('sort_dir') ?? 'desc'}`;
    const [search, setSearch] = useState(params.get('search') ?? '');

    const updateParam = useCallback(
        (key: string, value: string) => {
            const q = new URLSearchParams(params.toString());
            if (value) q.set(key, value);
            else q.delete(key);
            q.delete('page');
            startTransition(() => router.push(`/pets?${q.toString()}`));
        },
        [params, router],
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParam('search', search);
    };

    const handleSort = (val: string) => {
        const [sort_by, sort_dir] = val.split(':');
        const q = new URLSearchParams(params.toString());
        q.set('sort_by', sort_by);
        q.set('sort_dir', sort_dir);
        q.delete('page');
        startTransition(() => router.push(`/pets?${q.toString()}`));
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="join w-full sm:max-w-xs">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pets…"
                    className="input input-bordered join-item flex-1 input-sm"
                />
                <button type="submit" className="btn btn-primary join-item btn-sm">
                    <Icon icon="lucide:search" width={15} />
                </button>
            </form>

            <div className="flex items-center gap-2 ml-auto">
                {/* Results count */}
                <span className="text-sm text-base-content/50 hidden sm:block">
                    {total} pet{total !== 1 ? 's' : ''} found
                </span>

                {/* Sort */}
                <select
                    className="select select-bordered select-sm"
                    value={currentSort}
                    onChange={(e) => handleSort(e.target.value)}
                >
                    {SORT_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

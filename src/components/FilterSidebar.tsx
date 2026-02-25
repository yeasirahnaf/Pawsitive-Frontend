'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Icon } from '@iconify/react';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Turtle', 'Hamster'];
const SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra_large', label: 'Extra Large' },
];
const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

interface FilterSidebarProps {
    onClose?: () => void;
}

export default function FilterSidebar({ onClose }: FilterSidebarProps) {
    const router = useRouter();
    const params = useSearchParams();

    const [species, setSpecies] = useState(params.get('species') ?? '');
    const [gender, setGender] = useState(params.get('gender') ?? '');
    const [size, setSize] = useState(params.get('size') ?? '');
    const [minPrice, setMinPrice] = useState(params.get('min_price') ?? '');
    const [maxPrice, setMaxPrice] = useState(params.get('max_price') ?? '');
    const [minAge, setMinAge] = useState(params.get('min_age') ?? '');
    const [maxAge, setMaxAge] = useState(params.get('max_age') ?? '');

    const apply = useCallback(() => {
        const q = new URLSearchParams();
        if (species) q.set('species', species);
        if (gender) q.set('gender', gender);
        if (size) q.set('size', size);
        if (minPrice) q.set('min_price', minPrice);
        if (maxPrice) q.set('max_price', maxPrice);
        if (minAge) q.set('min_age', minAge);
        if (maxAge) q.set('max_age', maxAge);
        router.push(`/pets?${q.toString()}`);
        onClose?.();
    }, [species, gender, size, minPrice, maxPrice, minAge, maxAge, router, onClose]);

    const reset = useCallback(() => {
        setSpecies(''); setGender(''); setSize('');
        setMinPrice(''); setMaxPrice(''); setMinAge(''); setMaxAge('');
        router.push('/pets');
        onClose?.();
    }, [router, onClose]);

    return (
        <div className="w-full bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-base">Filters</h2>
                <button onClick={reset} className="btn btn-ghost btn-xs text-error gap-1">
                    <Icon icon="lucide:x" width={12} /> Reset
                </button>
            </div>

            {/* Species */}
            <div className="collapse collapse-arrow border border-base-300 rounded-xl">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-sm font-medium">Species</div>
                <div className="collapse-content flex flex-col gap-1 pb-3">
                    {SPECIES_OPTIONS.map((s) => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="species"
                                className="radio radio-primary radio-sm"
                                value={s.toLowerCase()}
                                checked={species === s.toLowerCase()}
                                onChange={() => setSpecies(s.toLowerCase())}
                            />
                            <span className="text-sm">{s}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className="collapse collapse-arrow border border-base-300 rounded-xl">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-sm font-medium">Gender</div>
                <div className="collapse-content flex gap-3 pb-3">
                    {GENDER_OPTIONS.map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                className="radio radio-primary radio-sm"
                                value={value}
                                checked={gender === value}
                                onChange={() => setGender(value)}
                            />
                            <span className="text-sm">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div className="collapse collapse-arrow border border-base-300 rounded-xl">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">Size</div>
                <div className="collapse-content flex flex-col gap-1 pb-3">
                    {SIZE_OPTIONS.map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="size"
                                className="radio radio-primary radio-sm"
                                value={value}
                                checked={size === value}
                                onChange={() => setSize(value)}
                            />
                            <span className="text-sm">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="collapse collapse-arrow border border-base-300 rounded-xl">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">Price (৳)</div>
                <div className="collapse-content flex gap-2 pb-3">
                    <input
                        type="number"
                        min={0}
                        placeholder="Min"
                        className="input input-bordered input-sm w-full"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        min={0}
                        placeholder="Max"
                        className="input input-bordered input-sm w-full"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* Age */}
            <div className="collapse collapse-arrow border border-base-300 rounded-xl">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium">Age (months)</div>
                <div className="collapse-content flex gap-2 pb-3">
                    <input
                        type="number"
                        min={0}
                        placeholder="Min"
                        className="input input-bordered input-sm w-full"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                    />
                    <input
                        type="number"
                        min={0}
                        placeholder="Max"
                        className="input input-bordered input-sm w-full"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                    />
                </div>
            </div>

            <button onClick={apply} className="btn btn-primary rounded-full mt-3 w-full">
                Apply Filters
            </button>
        </div>
    );
}

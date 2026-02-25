'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import type { Pet } from '@/services/pets';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const STATUS_BADGE: Record<Pet['status'], { label: string; cls: string }> = {
    available: { label: 'Available', cls: 'badge-success' },
    reserved: { label: 'Reserved', cls: 'badge-warning' },
    sold: { label: 'Sold', cls: 'badge-error' },
};

const SIZE_LABEL: Record<Pet['size'], string> = {
    small: 'S', medium: 'M', large: 'L', extra_large: 'XL',
};

interface PetCardProps {
    pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
    const { token } = useAuth();
    const { addItem, sessionId, items } = useCart();
    const [adding, setAdding] = useState(false);

    const { label, cls } = STATUS_BADGE[pet.status];
    const alreadyInCart = items.some((i) => i.pet_id === pet.id);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // don't navigate to pet detail
        if (alreadyInCart || pet.status !== 'available') return;
        setAdding(true);
        try {
            await addItem(pet.id, token,);
        } catch {
            // silently ignore — could add toast here
        } finally {
            setAdding(false);
        }
    };

    const ageLabel =
        pet.age_months < 12
            ? `${pet.age_months}mo`
            : `${Math.floor(pet.age_months / 12)}yr`;

    return (
        <Link href={`/pets/${pet.id}`}>
            <div className="card bg-base-100 border border-base-300 card-hover group h-full">
                {/* Image */}
                <figure className="relative aspect-square overflow-hidden rounded-t-2xl bg-base-200">
                    {pet.thumbnail_url ? (
                        <Image
                            src={pet.thumbnail_url}
                            alt={pet.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon icon="lucide:paw-print" width={48} height={48} className="text-base-300" />
                        </div>
                    )}

                    {/* Status badge */}
                    <span className={`badge ${cls} absolute top-3 left-3 text-xs font-medium`}>
                        {label}
                    </span>

                    {/* Size badge */}
                    <span className="badge badge-ghost bg-base-100/80 backdrop-blur-sm absolute top-3 right-3 text-xs">
                        {SIZE_LABEL[pet.size]}
                    </span>
                </figure>

                {/* Body */}
                <div className="card-body p-4 gap-2">
                    {/* Species chip */}
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                        {pet.species}
                    </span>

                    {/* Name */}
                    <h3 className="font-semibold text-base leading-tight line-clamp-1">{pet.name}</h3>

                    {/* Breed · Age · Gender */}
                    <p className="text-xs text-base-content/50 line-clamp-1">
                        {pet.breed} · {ageLabel} · {pet.gender}
                    </p>

                    {/* Price + Add to cart */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-lg font-bold text-primary">
                            ৳{pet.price.toLocaleString()}
                        </span>

                        <button
                            onClick={handleAddToCart}
                            disabled={alreadyInCart || pet.status !== 'available' || adding}
                            className={`btn btn-sm rounded-full gap-1 transition-all ${alreadyInCart
                                    ? 'btn-ghost text-success border-success'
                                    : 'btn-primary'
                                }`}
                            aria-label={alreadyInCart ? 'In cart' : 'Add to cart'}
                        >
                            {adding ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : alreadyInCart ? (
                                <><Icon icon="lucide:check" width={14} /> In cart</>
                            ) : (
                                <><Icon icon="lucide:shopping-cart" width={14} /> Add</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

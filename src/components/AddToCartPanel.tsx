'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Icon } from '@iconify/react';
import type { Pet } from '@/services/pets';

export default function AddToCartPanel({ pet }: { pet: Pet }) {
    const { addItem, items, isLoading } = useCart();
    const [adding, setAdding] = useState(false);

    // Check if pet is already in cart
    const inCart = items.some((item) => item.pet_id === pet.id);

    // Can only add if status is available
    const canAdd = pet.status === 'available' && !inCart;

    const handleAdd = async () => {
        if (!canAdd) return;
        setAdding(true);
        try {
            await addItem(pet.id);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="card bg-base-100 border border-base-300 shadow-sm mt-8 sticky bottom-4 lg:static z-40">
            <div className="card-body p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

                {/* Price & Status info */}
                <div className="flex flex-col w-full sm:w-auto">
                    <p className="text-sm text-base-content/50 font-medium uppercase tracking-wider mb-1">
                        Total Price
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-primary">৳{pet.price.toLocaleString()}</span>

                        {pet.status === 'available' && (
                            <span className="badge badge-success badge-sm">Available</span>
                        )}
                        {pet.status === 'reserved' && (
                            <span className="badge badge-warning badge-sm">Reserved</span>
                        )}
                        {pet.status === 'sold' && (
                            <span className="badge badge-error badge-sm">Sold Out</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex w-full sm:w-auto gap-3">
                    <button className="btn btn-outline btn-circle" aria-label="Add to wishlist">
                        <Icon icon="lucide:heart" width={20} />
                    </button>

                    <button
                        className="btn btn-primary flex-1 sm:w-48 rounded-full"
                        disabled={!canAdd || isLoading || adding}
                        onClick={handleAdd}
                    >
                        {adding ? (
                            <span className="loading loading-spinner loading-sm" />
                        ) : inCart ? (
                            <>
                                <Icon icon="lucide:check" width={18} /> In Cart
                            </>
                        ) : pet.status !== 'available' ? (
                            'Not Available'
                        ) : (
                            <>
                                <Icon icon="lucide:shopping-cart" width={18} /> Add to Cart
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

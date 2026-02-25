'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CartPage() {
    const { items, removeItem, isLoading } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [deliveryFee, setDeliveryFee] = useState(0);

    // Fetch delivery fee from settings dynamically if possible
    useEffect(() => {
        api.get<{ data: { key: string; value: string }[] }>('/api/v1/admin/settings')
            .then((res) => {
                const feeSetting = res.data.find((s) => s.key === 'delivery_fee');
                if (feeSetting) setDeliveryFee(Number(feeSetting.value));
            })
            .catch(() => setDeliveryFee(200)); // Fallback value
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-base-content/50">Loading your cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="bg-base-200 p-8 rounded-full mb-6">
                    <Icon icon="lucide:shopping-bag" width={64} className="text-base-content/20" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
                <p className="text-base-content/60 mb-8 max-w-md">
                    Looks like you haven&apos;t added any lovely companions to your cart yet. Let&apos;s find you a new friend!
                </p>
                <Link href="/pets" className="btn btn-primary rounded-full px-8">
                    Browse Pets
                </Link>
            </div>
        );
    }

    const subtotal = items.reduce((acc, item) => acc + Number(item.pet.price), 0);
    const total = subtotal + deliveryFee;

    const handleCheckout = () => {
        if (!user) {
            // If guest, save intent and go to login
            sessionStorage.setItem('redirect_after_login', '/checkout');
            router.push('/login');
        } else {
            router.push('/checkout');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-10">

                {/* ── Cart Items List ── */}
                <div className="flex-1">
                    <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-2xl">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200/50 text-base-content/70">
                                    <th className="font-semibold rounded-tl-2xl">Pet Details</th>
                                    <th className="font-semibold text-center hidden sm:table-cell">Status</th>
                                    <th className="font-semibold text-right">Price</th>
                                    <th className="font-semibold rounded-tr-2xl w-12 text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-base-200/30 transition-colors group">
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <Link href={`/pets/${item.pet_id}`} className="shrink-0 relative w-20 h-20 rounded-xl overflow-hidden bg-base-200">
                                                    {item.pet.thumbnail_url ? (
                                                        <Image
                                                            src={item.pet.thumbnail_url}
                                                            alt={item.pet.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="80px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Icon icon="lucide:paw-print" width={24} className="opacity-20" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <div>
                                                    <Link href={`/pets/${item.pet_id}`} className="font-bold text-lg hover:text-primary transition-colors">
                                                        {item.pet.name}
                                                    </Link>
                                                    <p className="text-sm text-base-content/60 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-none">
                                                        {item.pet.breed}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center hidden sm:table-cell">
                                            {item.pet.status === 'available' ? (
                                                <span className="badge badge-success badge-sm badge-outline">Available</span>
                                            ) : item.pet.status === 'reserved' ? (
                                                <span className="badge badge-warning badge-sm badge-outline">Reserved</span>
                                            ) : (
                                                <span className="badge badge-error badge-sm badge-outline">Sold out</span>
                                            )}
                                        </td>
                                        <td className="text-right font-bold text-lg">
                                            ৳{item.pet.price.toLocaleString()}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="btn btn-ghost btn-circle text-error/70 hover:text-error hover:bg-error/10"
                                                title="Remove from cart"
                                            >
                                                <Icon icon="lucide:trash-2" width={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Order Summary Sidebar ── */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="card bg-base-100 border border-base-300 sticky top-24 shadow-sm">
                        <div className="card-body p-6">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="flex flex-col gap-3 text-sm">
                                <div className="flex justify-between text-base-content/70">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base-content/70">
                                    <span>Delivery Fee <span className="text-xs ml-1">(est.)</span></span>
                                    <span className="font-medium">৳{deliveryFee.toLocaleString()}</span>
                                </div>

                                <div className="divider my-1"></div>

                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary">৳{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={handleCheckout}
                                    className="btn btn-primary rounded-full w-full"
                                >
                                    Proceed to Checkout
                                    <Icon icon="lucide:arrow-right" width={18} />
                                </button>
                                <Link href="/pets" className="btn btn-ghost rounded-full w-full">
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Secure checkout notice */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-base-content/50">
                                <Icon icon="lucide:shield-check" width={16} />
                                <span>Secure Checkout Process</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

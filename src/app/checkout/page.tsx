'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orders';
import { api } from '@/lib/api';
import { Icon } from '@iconify/react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart, isLoading: cartLoading, sessionId } = useCart();
    const { user, token, isLoading: authLoading } = useAuth();

    const [deliveryFee, setDeliveryFee] = useState(200);
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState('');

    // Fetch delivery fee
    useEffect(() => {
        api.get<{ data: { key: string; value: string }[] }>('/api/v1/admin/settings')
            .then((res) => {
                const feeSetting = res.data.find((s) => s.key === 'delivery_fee');
                if (feeSetting) setDeliveryFee(Number(feeSetting.value));
            })
            .catch(() => { });
    }, []);

    // Redirect if cart is empty and not loading
    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            router.replace('/pets');
        }
    }, [items.length, cartLoading, router]);

    if (cartLoading || authLoading || items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    const subtotal = items.reduce((acc, item) => acc + item.pet.price, 0);
    const total = subtotal + deliveryFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token && !sessionId) {
            setErrorText('Authentication or session missing. Please try logging in.');
            return;
        }

        setIsSubmitting(true);
        setErrorText('');

        try {
            const res = await placeOrder(
                {
                    address_line: addressLine,
                    city: city || undefined,
                    area: area || undefined,
                    notes: notes || undefined,
                    delivery_fee: deliveryFee,
                    payment_method: 'cod',
                },
                token || '',
                sessionId
            );

            // On success, clear the cart and redirect to track page
            clearCart();
            router.push(`/track?order=${res.data.order_number}`);

        } catch (err: any) {
            setErrorText(err.message || 'Failed to place order. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 min-h-screen">

            {/* ── Header & Steps ── */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>
                <ul className="steps w-full max-w-lg mx-auto">
                    <li className="step step-primary">Cart</li>
                    <li className="step step-primary">Shipping</li>
                    <li className="step">Done</li>
                </ul>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">

                {/* ── Left Col: Form ── */}
                <div className="flex-1 order-2 lg:order-1">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Contact Info (Readonly) */}
                        <section className="bg-base-100 border border-base-300 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:user" width={20} className="text-primary" /> Contact Information
                            </h2>
                            {user ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-base-content/50 block mb-1">Name</span>
                                        <p className="font-semibold">{user.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-base-content/50 block mb-1">Email</span>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm bg-warning/10 text-warning-content p-4 rounded-xl border border-warning/20">
                                    <p className="font-medium mb-1">Checking out as Guest</p>
                                    <p className="opacity-80">You can create an account later to manage your orders.</p>
                                    <Link href="/auth/login" className="link link-primary mt-2 inline-block">Login instead</Link>
                                </div>
                            )}
                        </section>

                        {/* Shipping Address */}
                        <section className="bg-base-100 border border-base-300 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:map-pin" width={20} className="text-primary" /> Delivery Address
                            </h2>
                            <div className="flex flex-col gap-4">
                                <label className="form-control w-full">
                                    <div className="label"><span className="label-text font-medium">Street Address *</span></div>
                                    <input
                                        type="text"
                                        required
                                        className="input input-bordered w-full"
                                        placeholder="House Num, Street Name"
                                        value={addressLine}
                                        onChange={e => setAddressLine(e.target.value)}
                                    />
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="form-control w-full">
                                        <div className="label"><span className="label-text font-medium">City</span></div>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            placeholder="e.g. Dhaka"
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                        />
                                    </label>
                                    <label className="form-control w-full">
                                        <div className="label"><span className="label-text font-medium">Area/Thana</span></div>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            placeholder="e.g. Gulshan"
                                            value={area}
                                            onChange={e => setArea(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <label className="form-control w-full">
                                    <div className="label"><span className="label-text font-medium">Delivery Notes (Optional)</span></div>
                                    <textarea
                                        className="textarea textarea-bordered h-24"
                                        placeholder="Instructions for the delivery person"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    ></textarea>
                                </label>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-base-100 border border-base-300 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:credit-card" width={20} className="text-primary" /> Payment Method
                            </h2>
                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-4 cursor-pointer">
                                <input type="radio" name="payment" className="radio radio-primary" checked readOnly />
                                <div>
                                    <p className="font-bold">Cash on Delivery (COD)</p>
                                    <p className="text-sm text-base-content/60">Pay when your companion arrives at your door.</p>
                                </div>
                            </div>
                        </section>

                        {/* Error Message */}
                        {errorText && (
                            <div className="alert alert-error">
                                <Icon icon="lucide:alert-circle" width={20} />
                                <span>{errorText}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full rounded-full gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <span className="loading loading-spinner" /> : <Icon icon="lucide:check-circle" width={20} />}
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Right Col: Order Summary Sidebar ── */}
                <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
                    <div className="card bg-base-200 border border-base-300 sticky top-24 shadow-sm">
                        <div className="card-body p-6">
                            <h2 className="text-xl font-bold border-b border-base-300 pb-4 mb-4">In Your Cart</h2>

                            {/* Items strip */}
                            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 mb-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-100 shrink-0">
                                            {item.pet.thumbnail_url ? (
                                                <Image src={item.pet.thumbnail_url} alt={item.pet.name} fill className="object-cover" sizes="64px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-base-300/30">
                                                    <Icon icon="lucide:paw-print" width={20} className="opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{item.pet.name}</p>
                                            <p className="text-xs text-base-content/60 truncate">{item.pet.breed}</p>
                                            <p className="text-primary font-bold mt-1">৳{item.pet.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="divider my-0"></div>

                            {/* Totals */}
                            <div className="flex flex-col gap-3 text-sm pt-2">
                                <div className="flex justify-between text-base-content/70">
                                    <span>Subtotal</span>
                                    <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base-content/70">
                                    <span>Delivery Fee</span>
                                    <span className="font-medium">৳{deliveryFee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl mt-2">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary">৳{total.toLocaleString()}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

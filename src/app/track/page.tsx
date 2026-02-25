'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { trackOrder, type Order } from '@/services/orders';

const STATUS_PIPELINE = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];

export default function TrackOrderPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10 min-h-screen">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
                <p className="text-base-content/60">Enter your order number to see the current status of your new companion.</p>
            </div>

            <Suspense fallback={<div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>}>
                <OrderTracker />
            </Suspense>
        </div>
    );
}

function OrderTracker() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [orderNum, setOrderNum] = useState(searchParams.get('order') || '');
    const [email, setEmail] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [order, setOrder] = useState<Order | null>(null);

    // Auto-fetch if order param exists initially
    useEffect(() => {
        const defaultOrder = searchParams.get('order');
        if (defaultOrder && !order) {
            handleSearch(defaultOrder);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSearch = async (numToSearch: string) => {
        if (!numToSearch) return;

        setIsLoading(true);
        setErrorMsg('');
        setOrder(null);

        try {
            const res = await trackOrder(numToSearch, email);
            setOrder(res.data);
            // Update URL to match search
            const q = new URLSearchParams(searchParams.toString());
            q.set('order', numToSearch);
            router.replace(`/track?${q.toString()}`);
        } catch (err: any) {
            setErrorMsg(err.message || 'Order not found. Please check your details.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(orderNum);
    };

    return (
        <div className="flex flex-col gap-10">

            {/* ── Search Form ── */}
            <form onSubmit={onSubmit} className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto w-full">
                <label className="form-control w-full">
                    <div className="label"><span className="label-text font-bold">Order Number *</span></div>
                    <input
                        type="text"
                        placeholder="e.g. ORD-12345678"
                        className="input input-bordered w-full"
                        value={orderNum}
                        onChange={e => setOrderNum(e.target.value)}
                        required
                    />
                </label>

                <label className="form-control w-full">
                    <div className="label">
                        <span className="label-text font-bold">Email</span>
                        <span className="label-text-alt text-base-content/50">If ordered as guest</span>
                    </div>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </label>

                <div className="flex items-end">
                    <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isLoading}>
                        {isLoading ? <span className="loading loading-spinner"></span> : <Icon icon="lucide:search" width={20} />}
                        Track
                    </button>
                </div>
            </form>

            {errorMsg && (
                <div className="alert alert-error max-w-2xl mx-auto">
                    <Icon icon="lucide:alert-triangle" width={20} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* ── Order Display ── */}
            {order && (
                <div className="animate-fade-up flex flex-col gap-8">

                    <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-base-200 pb-4 mb-6 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-base-content/50 mb-1">Order Status</p>
                                <h2 className="text-2xl font-bold">{order.order_number}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-base-content/50 mb-1">Placed On</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Pipeline Steps */}
                        {order.status === 'cancelled' ? (
                            <div className="alert alert-error">
                                <Icon icon="lucide:x-circle" width={24} />
                                <div>
                                    <h3 className="font-bold">Order Cancelled</h3>
                                    <div className="text-sm">This order has been cancelled and will not be delivered.</div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 overflow-x-auto">
                                <ul className="steps w-full min-w-[500px]">
                                    {STATUS_PIPELINE.map((step) => {
                                        const isActive = STATUS_PIPELINE.indexOf(order.status) >= STATUS_PIPELINE.indexOf(step);
                                        return (
                                            <li key={step} className={`step ${isActive ? 'step-primary' : ''} capitalize whitespace-nowrap`}>
                                                {step.replace(/_/g, ' ')}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Timeline */}
                        <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Icon icon="lucide:history" width={20} className="text-primary" /> Timeline History
                            </h3>

                            <ul className="timeline timeline-vertical timeline-compact">
                                {order.history.map((hist, idx) => {
                                    const isFirst = idx === 0;
                                    const isLast = idx === order.history.length - 1;
                                    return (
                                        <li key={hist.id}>
                                            {!isFirst && <hr className="bg-primary" />}
                                            <div className="timeline-start text-xs text-base-content/50 pt-1 w-20 text-right">
                                                {new Date(hist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                                                {new Date(hist.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="timeline-middle">
                                                <Icon icon="lucide:check-circle-2" width={16} className="text-primary" />
                                            </div>
                                            <div className="timeline-end pt-0 pb-4">
                                                <div className="font-bold capitalize">{hist.status.replace(/_/g, ' ')}</div>
                                                {hist.notes && <div className="text-sm mt-1">{hist.notes}</div>}
                                            </div>
                                            {!isLast && <hr className="bg-primary" />}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Order Items */}
                        <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Icon icon="lucide:package" width={20} className="text-primary" /> Included Pets
                            </h3>

                            <div className="flex flex-col gap-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center overflow-hidden relative shrink-0">
                                            {item.pet.thumbnail_url ? (
                                                <div className="w-full h-full relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.pet.thumbnail_url} alt={item.pet.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <Icon icon="lucide:paw-print" width={24} className="opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{item.pet.name}</p>
                                            <p className="text-sm text-base-content/60 truncate">{item.pet.species} • {item.pet.price.toLocaleString()} ৳</p>
                                        </div>
                                        <Link href={`/pets/${item.pet.id}`} className="btn btn-sm btn-ghost btn-circle">
                                            <Icon icon="lucide:chevron-right" width={20} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

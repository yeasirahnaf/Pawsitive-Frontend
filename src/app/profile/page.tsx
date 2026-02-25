'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, type Order } from '@/services/orders';

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        }>
            <ProfileDashboard />
        </Suspense>
    );
}

function ProfileDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token, isLoading: authLoading, logout } = useAuth();

    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
    const [orders, setOrders] = useState<Order[]>([]);
    const [fetchingOrders, setFetchingOrders] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'orders') setActiveTab('orders');
        else setActiveTab('profile');
    }, [searchParams]);

    useEffect(() => {
        // If auth finish loading and no user, force login
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // Fetch orders if we switch to the orders tab and haven't fetched yet
        if (activeTab === 'orders' && token && orders.length === 0) {
            setFetchingOrders(true);
            getOrders(token)
                .then(res => setOrders(res.data))
                .catch(err => console.error('Failed to fetch orders:', err))
                .finally(() => setFetchingOrders(false));
        }
    }, [activeTab, token, orders.length]);

    if (authLoading || !user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    const handleTabChange = (tab: 'profile' | 'orders') => {
        setActiveTab(tab);
        const q = new URLSearchParams(searchParams.toString());
        if (tab === 'profile') q.delete('tab');
        else q.set('tab', tab);
        router.replace(`/profile${q.toString() ? `?${q.toString()}` : ''}`, { scroll: false });
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 min-h-screen">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 mb-10 pt-4">
                <div className="flex items-center gap-6">
                    <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-24 shadow-sm text-3xl font-bold">
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-base-content/60 font-medium">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn btn-outline btn-error rounded-full gap-2">
                    <Icon icon="lucide:log-out" width={18} />
                    Sign Out
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* ── Sidebar Navigation ── */}
                <aside className="w-full md:w-64 shrink-0">
                    <ul className="menu bg-base-100 border border-base-300 rounded-2xl p-3 shadow-sm gap-1">
                        <li>
                            <button
                                onClick={() => handleTabChange('profile')}
                                className={activeTab === 'profile' ? 'active font-semibold' : ''}
                            >
                                <Icon icon="lucide:user" width={18} />
                                Account Details
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleTabChange('orders')}
                                className={activeTab === 'orders' ? 'active font-semibold' : ''}
                            >
                                <Icon icon="lucide:package" width={18} />
                                Order History
                            </button>
                        </li>
                        <li>
                            <button className="text-base-content/50 hover:text-base-content">
                                <Icon icon="lucide:settings" width={18} />
                                Settings
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* ── Main Content Area ── */}
                <main className="flex-1 min-w-0">

                    {/* ────── Profile Tab ────── */}
                    {activeTab === 'profile' && (
                        <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-up">
                            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-base-200">Personal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-semibold text-base-content/50 mb-1">Full Name</p>
                                    <p className="font-medium text-lg">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-base-content/50 mb-1">Email Address</p>
                                    <p className="font-medium text-lg">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-base-content/50 mb-1">Phone Number</p>
                                    <p className="font-medium text-lg">{user.phone || <span className="text-base-content/30 italic">Not provided</span>}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-base-content/50 mb-1">Account Role</p>
                                    <span className="badge badge-primary badge-outline capitalize font-semibold tracking-wide">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-10">
                                <button className="btn btn-primary btn-outline rounded-full">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ────── Orders Tab ────── */}
                    {activeTab === 'orders' && (
                        <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-up">
                            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-base-200">Order History</h2>

                            {fetchingOrders ? (
                                <div className="flex justify-center py-10">
                                    <span className="loading loading-spinner text-primary"></span>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16 bg-base-200/50 rounded-xl border border-base-300 border-dashed">
                                    <Icon icon="lucide:history" width={48} className="mx-auto text-base-content/20 mb-4" />
                                    <h3 className="text-lg font-bold">No orders yet</h3>
                                    <p className="text-base-content/60 mt-1 mb-6">You haven&apos;t adopted any companions yet.</p>
                                    <Link href="/pets" className="btn btn-primary rounded-full px-8">Browse Pets</Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr className="bg-base-200/50">
                                                <th className="font-semibold">Order #</th>
                                                <th className="font-semibold">Date</th>
                                                <th className="font-semibold">Items</th>
                                                <th className="font-semibold">Total</th>
                                                <th className="font-semibold">Status</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => {
                                                const subtotal = order.items.reduce((s, i) => s + i.price, 0);
                                                const total = subtotal + order.delivery_fee;
                                                return (
                                                    <tr key={order.id} className="hover:bg-base-200/30 transition-colors">
                                                        <td className="font-medium">{order.order_number}</td>
                                                        <td className="text-sm">
                                                            {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td>{order.items.length}</td>
                                                        <td className="font-bold">৳{total.toLocaleString()}</td>
                                                        <td>
                                                            <span className={`badge badge-sm font-semibold capitalize ${order.status === 'delivered' ? 'badge-success badge-outline' :
                                                                    order.status === 'cancelled' ? 'badge-error badge-outline' :
                                                                        'badge-warning badge-outline'
                                                                }`}>
                                                                {order.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <Link
                                                                href={`/track?order=${order.order_number}`}
                                                                className="btn btn-ghost btn-xs text-primary"
                                                            >
                                                                Track Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </main>
            </div>

        </div>
    );
}

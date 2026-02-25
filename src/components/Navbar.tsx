'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/pets', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { itemCount } = useCart();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <>
            {/* ── Desktop & Tablet Navbar ── */}
            <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4 lg:px-8">
                {/* ── Left: Drawer toggle (mobile) + Logo ── */}
                <div className="navbar-start">
                    {/* Mobile hamburger */}
                    <label htmlFor="mobile-drawer" className="btn btn-ghost btn-circle lg:hidden">
                        <Icon icon="lucide:menu" width={22} height={22} />
                    </label>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 ml-1">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Icon icon="lucide:paw-print" width={18} height={18} className="text-primary-content" />
                        </div>
                        <span className="text-lg font-bold text-base-content hidden sm:block">
                            Paws<span className="text-primary">itive</span>
                        </span>
                    </Link>
                </div>

                {/* ── Center: Nav links (desktop only) ── */}
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal gap-1 text-sm font-medium">
                        {NAV_LINKS.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`rounded-full px-4 transition-colors ${pathname === href
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Right: Search, Cart, Auth ── */}
                <div className="navbar-end gap-1">
                    {/* Search */}
                    <Link href="/pets" className="btn btn-ghost btn-circle" aria-label="Search pets">
                        <Icon icon="lucide:search" width={20} height={20} />
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className="btn btn-ghost btn-circle relative" aria-label="Shopping cart">
                        <Icon icon="lucide:shopping-cart" width={20} height={20} />
                        {itemCount > 0 && (
                            <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* Auth */}
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-9">
                                    <span className="text-sm font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2 border border-base-300"
                            >
                                <li className="menu-title px-3 py-1">
                                    <span className="font-semibold text-base-content truncate">{user.name}</span>
                                    <span className="text-xs text-base-content/50 truncate">{user.email}</span>
                                </li>
                                <div className="divider my-0" />
                                <li>
                                    <Link href="/profile">
                                        <Icon icon="lucide:user" width={16} /> My Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/profile?tab=orders">
                                        <Icon icon="lucide:package" width={16} /> My Orders
                                    </Link>
                                </li>
                                <div className="divider my-0" />
                                <li>
                                    <button onClick={handleLogout} className="text-error">
                                        <Icon icon="lucide:log-out" width={16} /> Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary btn-sm rounded-full">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Mobile Drawer ── */}
            <div className="drawer drawer-start lg:hidden">
                <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-side z-[60]">
                    <label htmlFor="mobile-drawer" className="drawer-overlay" />
                    <aside className="bg-base-100 min-h-full w-64 p-6 flex flex-col gap-6">
                        {/* Logo inside drawer */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Icon icon="lucide:paw-print" width={18} height={18} className="text-primary-content" />
                            </div>
                            <span className="text-lg font-bold">
                                Paws<span className="text-primary">itive</span>
                            </span>
                        </Link>

                        <ul className="menu w-full">
                            {NAV_LINKS.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className={pathname === href ? 'active font-semibold' : ''}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {!user && (
                            <Link href="/login" className="btn btn-primary rounded-full w-full mt-auto">
                                Sign In
                            </Link>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

import Link from 'next/link';
import { Icon } from '@iconify/react';

const QUICK_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/pets', label: 'Shop' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/track', label: 'Track Order' },
];

const SOCIALS = [
    { icon: 'ri:facebook-fill', href: '#', label: 'Facebook' },
    { icon: 'ri:instagram-line', href: '#', label: 'Instagram' },
    { icon: 'ri:twitter-x-line', href: '#', label: 'X (Twitter)' },
];

export default function Footer() {
    return (
        <footer className="bg-neutral text-neutral-content mt-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Brand */}
                <div className="flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Icon icon="lucide:paw-print" width={18} height={18} className="text-primary-content" />
                        </div>
                        <span className="text-lg font-bold text-white">
                            Paws<span className="text-primary">itive</span>
                        </span>
                    </Link>
                    <p className="text-sm text-neutral-content/60 leading-relaxed">
                        Your trusted destination for finding loving pets and premium pet supplies. Every pet deserves a happy home.
                    </p>
                    {/* Socials */}
                    <div className="flex gap-3 mt-2">
                        {SOCIALS.map(({ icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="btn btn-sm btn-circle btn-ghost text-neutral-content/60 hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Icon icon={icon} width={18} height={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h6 className="text-sm font-semibold uppercase tracking-wider text-neutral-content/50 mb-4">
                        Quick Links
                    </h6>
                    <ul className="flex flex-col gap-2">
                        {QUICK_LINKS.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className="text-sm text-neutral-content/70 hover:text-primary transition-colors"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h6 className="text-sm font-semibold uppercase tracking-wider text-neutral-content/50 mb-4">
                        Get in Touch
                    </h6>
                    <ul className="flex flex-col gap-3 text-sm text-neutral-content/70">
                        <li className="flex items-center gap-2">
                            <Icon icon="lucide:mail" width={16} />
                            <a href="mailto:hello@pawsitive.com" className="hover:text-primary transition-colors">
                                hello@pawsitive.com
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Icon icon="lucide:phone" width={16} />
                            <a href="tel:+8801700000000" className="hover:text-primary transition-colors">
                                +880 1700-000000
                            </a>
                        </li>
                        <li className="flex items-start gap-2">
                            <Icon icon="lucide:map-pin" width={16} className="mt-0.5 shrink-0" />
                            <span>Dhaka, Bangladesh</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-neutral-content/10 py-5 text-center text-xs text-neutral-content/40">
                © {new Date().getFullYear()} Pawsitive. All rights reserved.
            </div>
        </footer>
    );
}

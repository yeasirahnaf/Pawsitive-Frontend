'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@iconify/react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (password !== passwordConfirm) {
            setErrorMsg('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirm,
                phone: phone || undefined
            });
            // Wait a tiny bit for states to settle
            setTimeout(() => {
                router.push('/profile');
            }, 500);
        } catch (err: any) {
            setErrorMsg(err.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 py-10">
            <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Icon icon="lucide:paw-print" className="text-primary" />
                            Join Pawsitive
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">Create an account to manage your pets</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Full Name *</span></div>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Email *</span></div>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Phone (Optional)</span></div>
                            <input
                                type="tel"
                                placeholder="+880..."
                                className="input input-bordered w-full"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Password *</span></div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-medium">Confirm Password *</span></div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                                required
                                minLength={8}
                            />
                        </label>

                        {errorMsg && (
                            <div className="alert alert-error text-sm py-2">
                                <Icon icon="lucide:alert-circle" width={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
                            {isLoading ? <span className="loading loading-spinner" /> : 'Create Account'}
                        </button>

                    </form>

                    <p className="text-center text-sm mt-6">
                        Already have an account? <Link href="/login" className="link link-primary font-bold">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
